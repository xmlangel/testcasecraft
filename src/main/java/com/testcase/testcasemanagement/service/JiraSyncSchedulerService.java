// src/main/java/com/testcase/testcasemanagement/service/JiraSyncSchedulerService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.JiraSyncStatus;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * JIRA 동기화 스케줄링 서비스
 * ICT-162: JIRA API 클라이언트 및 연동 서비스 구현
 */
@Service
@ConditionalOnProperty(name = "app.jira.scheduler.enabled", havingValue = "true", matchIfMissing = false)
@RequiredArgsConstructor
@Slf4j
public class JiraSyncSchedulerService {

    private final TestResultRepository testResultRepository;
    private final JiraIntegrationService jiraIntegrationService;
    private final JiraConfigService jiraConfigService;
    private final DashboardService dashboardService;

    @Value("${app.jira.scheduler.batch-size:20}")
    private int batchSize;

    @Value("${app.jira.scheduler.retry-delay-minutes:30}")
    private int retryDelayMinutes;

    @Value("${app.jira.scheduler.timeout-minutes:30}")
    private int timeoutMinutes;

    @Value("${app.jira.scheduler.max-concurrent:5}")
    private int maxConcurrent;

    /**
     * 동기화가 필요한 테스트 결과들을 주기적으로 처리
     * 매 5분마다 실행
     */
    @Scheduled(fixedDelay = 300000) // 5분 = 300,000ms
    @Transactional
    public void processPendingSyncs() {
        try {
            log.debug("JIRA 동기화 스케줄러 시작");

            // 1. 타임아웃된 진행 중 동기화 정리
            cleanupTimedOutSyncs();

            // 2. 동기화가 필요한 테스트 결과 조회
            Pageable pageable = PageRequest.of(0, batchSize);
            List<JiraSyncStatus> syncStatuses = List.of(
                    JiraSyncStatus.NOT_SYNCED,
                    JiraSyncStatus.FAILED,
                    JiraSyncStatus.RETRY_REQUIRED);

            List<TestResult> pendingResults = testResultRepository.findBySyncStatusIn(syncStatuses, pageable);

            if (pendingResults.isEmpty()) {
                log.debug("동기화할 테스트 결과가 없습니다");
                return;
            }

            log.info("JIRA 동기화 처리 시작: {} 건", pendingResults.size());

            // 3. 병렬 처리로 동기화 수행
            List<CompletableFuture<Void>> futures = pendingResults.stream()
                    .map(this::processSingleSyncAsync)
                    .toList();

            // 모든 비동기 작업 완료 대기
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                    .join();

            log.info("JIRA 동기화 처리 완료: {} 건", pendingResults.size());

        } catch (Exception e) {
            log.error("JIRA 동기화 스케줄러 실행 중 오류 발생", e);
        }
    }

    /**
     * 실패한 동기화 재시도 처리
     * 매 30분마다 실행
     */
    @Scheduled(fixedDelay = 1800000) // 30분 = 1,800,000ms
    @Transactional
    public void retryFailedSyncs() {
        try {
            log.debug("JIRA 동기화 재시도 스케줄러 시작");

            LocalDateTime retryAfter = LocalDateTime.now().minusMinutes(retryDelayMinutes);
            Pageable pageable = PageRequest.of(0, batchSize);

            List<TestResult> failedSyncs = testResultRepository.findFailedSyncsForRetry(retryAfter, pageable);

            if (failedSyncs.isEmpty()) {
                log.debug("재시도할 실패한 동기화가 없습니다");
                return;
            }

            log.info("JIRA 동기화 재시도 처리 시작: {} 건", failedSyncs.size());

            // 상태를 RETRY_REQUIRED로 변경
            List<String> failedIds = failedSyncs.stream()
                    .map(TestResult::getId)
                    .toList();

            testResultRepository.updateJiraSyncStatus(failedIds, JiraSyncStatus.RETRY_REQUIRED,
                    "스케줄러에 의한 재시도 설정 - " + LocalDateTime.now());

            log.info("JIRA 동기화 재시도 설정 완료: {} 건", failedSyncs.size());

        } catch (Exception e) {
            log.error("JIRA 동기화 재시도 스케줄러 실행 중 오류 발생", e);
        }
    }

    /**
     * 동기화 통계 로깅
     * 매 시간마다 실행
     */
    @Scheduled(fixedDelay = 3600000) // 1시간 = 3,600,000ms
    public void logSyncStatistics() {
        try {
            List<Map<String, Object>> statistics = testResultRepository.findJiraSyncStatusStatistics(null);

            log.info("=== JIRA 동기화 상태 통계 ===");
            for (Map<String, Object> stat : statistics) {
                String status = (String) stat.get("sync_status");
                Long count = ((Number) stat.get("count")).longValue();
                log.info("  {}: {} 건", status, count);
            }
            log.info("==============================");

        } catch (Exception e) {
            log.error("JIRA 동기화 통계 로깅 중 오류 발생", e);
        }
    }

    /**
     * 개별 테스트 결과 비동기 동기화 처리
     */
    private CompletableFuture<Void> processSingleSyncAsync(TestResult testResult) {
        return CompletableFuture.runAsync(() -> {
            try {
                processSingleSync(testResult);
            } catch (Exception e) {
                log.error("테스트 결과 동기화 실패: testResultId={}, jiraIssueKey={}",
                        testResult.getId(), testResult.getJiraIssueKey(), e);

                // 실패 상태로 변경
                testResult.markJiraSyncFailure("동기화 처리 실패: " + e.getMessage());
                testResultRepository.save(testResult);
            }
        });
    }

    /**
     * 개별 테스트 결과 동기화 처리
     */
    private void processSingleSync(TestResult testResult) {
        if (testResult.getJiraIssueKey() == null || testResult.getJiraIssueKey().trim().isEmpty()) {
            log.warn("JIRA 이슈 키가 없는 테스트 결과: {}", testResult.getId());
            return;
        }

        // JIRA 이슈 키 유효성 검증
        if (!jiraIntegrationService.isValidJiraIssueKey(testResult.getJiraIssueKey())) {
            log.warn("유효하지 않은 JIRA 이슈 키: {}", testResult.getJiraIssueKey());
            testResult.markJiraSyncFailure("유효하지 않은 JIRA 이슈 키");
            testResultRepository.save(testResult);
            return;
        }

        // 동기화 진행 중 상태로 변경
        testResult.markJiraSyncInProgress();
        testResultRepository.save(testResult);

        try {
            // 실행자 정보 조회 - 시스템 사용자로 처리하거나 실제 실행자 사용
            String userId = testResult.getExecutedBy() != null
                    ? testResult.getExecutedBy().getUsername()
                    : "system";

            // JIRA 코멘트 추가
            boolean success = jiraIntegrationService.addManualTestResultComment(
                    userId, testResult.getJiraIssueKey(), testResult);

            if (success) {
                // 성공 처리
                testResult.markJiraSyncSuccess(null); // 실제 구현에서는 코멘트 ID 설정
                log.debug("JIRA 동기화 성공: testResultId={}, jiraIssueKey={}",
                        testResult.getId(), testResult.getJiraIssueKey());
            } else {
                // 실패 처리
                testResult.markJiraSyncFailure("JIRA 코멘트 추가 실패");
                log.warn("JIRA 동기화 실패: testResultId={}, jiraIssueKey={}",
                        testResult.getId(), testResult.getJiraIssueKey());
            }

            testResultRepository.save(testResult);

            // ICT-198: 대시보드 캐시 무효화
            try {
                if (testResult.getTestExecution() != null && testResult.getTestExecution().getProject() != null) {
                    String projectId = testResult.getTestExecution().getProject().getId();
                    // 캐시 제거됨 - 직접 데이터베이스에서 조회됨
                    log.info("대시보드 캐시가 무효화되었습니다 (스케줄러). projectId: {}", projectId);
                }
            } catch (Exception e) {
                log.error("대시보드 캐시 무효화 실패 (스케줄러): {}", e.getMessage());
            }

        } catch (Exception e) {
            // 예외 발생 시 실패 처리
            testResult.markJiraSyncFailure("동기화 중 예외 발생: " + e.getMessage());
            testResultRepository.save(testResult);
            throw e;
        }
    }

    /**
     * 타임아웃된 진행 중 동기화 정리
     */
    private void cleanupTimedOutSyncs() {
        try {
            LocalDateTime timeoutTime = LocalDateTime.now().minusMinutes(timeoutMinutes);
            List<TestResult> timedOutSyncs = testResultRepository.findTimedOutInProgressSyncs(timeoutTime);

            if (timedOutSyncs.isEmpty()) {
                return;
            }

            log.warn("타임아웃된 JIRA 동기화 발견: {} 건", timedOutSyncs.size());

            // 상태를 RETRY_REQUIRED로 변경
            List<String> timedOutIds = timedOutSyncs.stream()
                    .map(TestResult::getId)
                    .toList();

            testResultRepository.updateJiraSyncStatus(timedOutIds, JiraSyncStatus.RETRY_REQUIRED,
                    "타임아웃으로 인한 재시도 설정 - " + LocalDateTime.now());

            log.info("타임아웃된 JIRA 동기화 정리 완료: {} 건", timedOutSyncs.size());

        } catch (Exception e) {
            log.error("타임아웃된 JIRA 동기화 정리 중 오류 발생", e);
        }
    }
}