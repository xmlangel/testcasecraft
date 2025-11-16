// src/main/java/com/testcase/testcasemanagement/controller/JiraIntegrationController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.testcase.testcasemanagement.model.JiraSyncStatus;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.service.DashboardService;
import com.testcase.testcasemanagement.service.JiraIntegrationService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * JIRA 통합 관련 REST API 컨트롤러
 * ICT-162: JIRA API 클라이언트 및 연동 서비스 구현
 */
@RestController
@RequestMapping("/api/jira-integration")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "JIRA - Integration", description = "JIRA 통합 관리 API")
public class JiraIntegrationController {

    private final JiraIntegrationService jiraIntegrationService;
    private final TestResultRepository testResultRepository;
    private final DashboardService dashboardService;
    private final SecurityContextUtil securityContextUtil;

    /**
     * 텍스트에서 JIRA 이슈 키 추출
     */
    @GetMapping("/extract-issues")
    @Operation(summary = "텍스트에서 JIRA 이슈 키 추출", description = "주어진 텍스트에서 JIRA 이슈 키 패턴을 찾아 추출합니다")
    public ResponseEntity<List<String>> extractJiraIssueKeys(@RequestParam String text) {
        try {
            List<String> issueKeys = jiraIntegrationService.extractJiraIssueKeys(text);
            return ResponseEntity.ok(issueKeys);
        } catch (Exception e) {
            log.error("JIRA 이슈 키 추출 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * JIRA 이슈 키 유효성 검증
     */
    @GetMapping("/validate-issue-key")
    @Operation(summary = "JIRA 이슈 키 유효성 검증", description = "JIRA 이슈 키 형식이 올바른지 검증합니다")
    public ResponseEntity<Boolean> validateJiraIssueKey(@RequestParam String issueKey) {
        try {
            boolean isValid = jiraIntegrationService.isValidJiraIssueKey(issueKey);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            log.error("JIRA 이슈 키 검증 실패: {}", issueKey, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * JIRA 이슈 존재 여부 확인
     * ICT-184: 이슈 입력 시 존재 여부 검증
     */
    @GetMapping("/check-issue-exists")
    @Operation(summary = "JIRA 이슈 존재 여부 확인", description = "JIRA 서버에서 실제 이슈가 존재하는지 확인합니다")
    public ResponseEntity<JiraConfigDto.IssueExistsDto> checkJiraIssueExists(
            @RequestParam String issueKey,
            Authentication authentication) {
        
        try {
            // 현재 로그인한 사용자의 실제 사용자 ID 사용 (웹 애플리케이션 내부 ID)
            String userId = securityContextUtil.getCurrentUserId();
            if (userId == null) {
                return ResponseEntity.ok(
                    JiraConfigDto.IssueExistsDto.builder()
                        .exists(false)
                        .issueKey(issueKey)
                        .errorMessage("사용자 정보를 찾을 수 없습니다.")
                        .build()
                );
            }
            
            JiraConfigDto.IssueExistsDto result = jiraIntegrationService.checkJiraIssueExists(userId, issueKey);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("JIRA 이슈 존재 확인 실패: issueKey={}", issueKey, e);
            return ResponseEntity.ok(
                JiraConfigDto.IssueExistsDto.builder()
                    .exists(false)
                    .issueKey(issueKey)
                    .errorMessage("시스템 오류가 발생했습니다.")
                    .build()
            );
        }
    }

    /**
     * 개별 테스트 결과에 수동으로 JIRA 코멘트 추가
     */
    @PostMapping("/add-test-result-comment")
    @Operation(summary = "테스트 결과 JIRA 코멘트 추가", description = "개별 테스트 결과를 JIRA 이슈에 코멘트로 추가합니다")
    public ResponseEntity<Map<String, Object>> addTestResultComment(
            @RequestParam String testResultId,
            @RequestParam String jiraIssueKey,
            Authentication authentication) {
        
        try {
            String userId = authentication.getName();
            
            // 테스트 결과 조회
            TestResult testResult = testResultRepository.findById(testResultId)
                .orElseThrow(() -> new IllegalArgumentException("테스트 결과를 찾을 수 없습니다: " + testResultId));
            
            // 이슈 키 유효성 검증
            if (!jiraIntegrationService.isValidJiraIssueKey(jiraIssueKey)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "유효하지 않은 JIRA 이슈 키입니다"));
            }
            
            // JIRA 코멘트 추가
            boolean success = jiraIntegrationService.addManualTestResultComment(userId, jiraIssueKey, testResult);
            
            if (success) {
                // TestResult에 JIRA 이슈 정보 업데이트
                testResult.setJiraIssueKey(jiraIssueKey);
                testResult.markJiraSyncSuccess(null); // 코멘트 ID는 실제 구현에서 반환받아야 함
                testResultRepository.save(testResult);

                // ICT-198: 대시보드 캐시 무효화
                try {
                    if (testResult.getTestExecution() != null && testResult.getTestExecution().getProject() != null) {
                        String projectId = testResult.getTestExecution().getProject().getId();
                        // 캐시 제거됨 - 직접 데이터베이스에서 조회됨
                        log.info("대시보드 캐시가 무효화되었습니다. projectId: {}", projectId);
                    }
                } catch (Exception e) {
                    log.error("대시보드 캐시 무효화 실패: {}", e.getMessage());
                }
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "테스트 결과가 JIRA 이슈에 성공적으로 추가되었습니다"
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "JIRA 코멘트 추가에 실패했습니다"
                ));
            }
            
        } catch (Exception e) {
            log.error("테스트 결과 JIRA 코멘트 추가 실패: testResultId={}, jiraIssueKey={}", 
                     testResultId, jiraIssueKey, e);
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", "서버 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * JIRA 이슈에 연결된 테스트 결과 조회
     */
    @GetMapping("/test-results-by-issue")
    @Operation(summary = "JIRA 이슈 연결 테스트 결과 조회", description = "특정 JIRA 이슈에 연결된 테스트 결과 목록을 조회합니다")
    public ResponseEntity<List<TestResult>> getTestResultsByJiraIssue(
            @RequestParam String jiraIssueKey,
            @RequestParam(defaultValue = "10") int limit) {
        
        try {
            if (!jiraIntegrationService.isValidJiraIssueKey(jiraIssueKey)) {
                return ResponseEntity.badRequest().build();
            }
            
            Pageable pageable = PageRequest.of(0, limit);
            List<TestResult> testResults = testResultRepository.findRecentResultsByJiraIssue(jiraIssueKey, pageable);
            
            return ResponseEntity.ok(testResults);
            
        } catch (Exception e) {
            log.error("JIRA 이슈 연결 테스트 결과 조회 실패: {}", jiraIssueKey, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * JIRA 동기화가 필요한 테스트 결과 조회
     */
    @GetMapping("/pending-sync-results")
    @Operation(summary = "동기화 대기 테스트 결과 조회", description = "JIRA 동기화가 필요한 테스트 결과 목록을 조회합니다")
    public ResponseEntity<List<TestResult>> getPendingSyncResults(
            @RequestParam(required = false) String projectId,
            @RequestParam(defaultValue = "50") int limit) {
        
        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<JiraSyncStatus> syncStatuses = List.of(
                JiraSyncStatus.NOT_SYNCED, 
                JiraSyncStatus.FAILED, 
                JiraSyncStatus.RETRY_REQUIRED
            );
            
            List<TestResult> pendingResults;
            if (projectId != null && !projectId.isEmpty()) {
                pendingResults = testResultRepository.findByProjectAndSyncStatusIn(projectId, syncStatuses);
            } else {
                pendingResults = testResultRepository.findBySyncStatusIn(syncStatuses, pageable);
            }
            
            return ResponseEntity.ok(pendingResults);
            
        } catch (Exception e) {
            log.error("동기화 대기 테스트 결과 조회 실패: projectId={}", projectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * JIRA 동기화 상태 통계 조회
     */
    @GetMapping("/sync-status-statistics")
    @Operation(summary = "JIRA 동기화 상태 통계", description = "JIRA 동기화 상태별 통계를 조회합니다")
    public ResponseEntity<List<Map<String, Object>>> getSyncStatusStatistics(
            @RequestParam(required = false) String projectId) {
        
        try {
            List<Map<String, Object>> statistics = testResultRepository.findJiraSyncStatusStatistics(projectId);
            return ResponseEntity.ok(statistics);
            
        } catch (Exception e) {
            log.error("JIRA 동기화 상태 통계 조회 실패: projectId={}", projectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 실패한 JIRA 동기화 재시도
     */
    @PostMapping("/retry-failed-syncs")
    @Operation(summary = "실패한 JIRA 동기화 재시도", description = "실패한 JIRA 동기화를 재시도합니다")
    public ResponseEntity<Map<String, Object>> retryFailedSyncs(
            @RequestParam(defaultValue = "30") int retryDelayMinutes,
            @RequestParam(defaultValue = "20") int batchSize) {
        
        try {
            LocalDateTime retryAfter = LocalDateTime.now().minusMinutes(retryDelayMinutes);
            Pageable pageable = PageRequest.of(0, batchSize);
            
            List<TestResult> failedSyncs = testResultRepository.findFailedSyncsForRetry(retryAfter, pageable);
            
            if (failedSyncs.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "재시도할 실패한 동기화가 없습니다",
                    "retryCount", 0
                ));
            }
            
            // 상태를 RETRY_REQUIRED로 변경
            List<String> failedIds = failedSyncs.stream()
                .map(TestResult::getId)
                .toList();
            
            testResultRepository.updateJiraSyncStatus(failedIds, JiraSyncStatus.RETRY_REQUIRED, 
                "재시도 대상으로 설정됨 - " + LocalDateTime.now());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "재시도 대상으로 설정되었습니다",
                "retryCount", failedSyncs.size()
            ));
            
        } catch (Exception e) {
            log.error("실패한 JIRA 동기화 재시도 실패", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", "서버 오류가 발생했습니다: " + e.getMessage()));
        }
    }

    /**
     * 타임아웃된 진행 중 동기화 정리
     */
    @PostMapping("/cleanup-timed-out-syncs")
    @Operation(summary = "타임아웃 동기화 정리", description = "오래된 진행 중 상태의 동기화를 정리합니다")
    public ResponseEntity<Map<String, Object>> cleanupTimedOutSyncs(
            @RequestParam(defaultValue = "30") int timeoutMinutes) {
        
        try {
            LocalDateTime timeoutTime = LocalDateTime.now().minusMinutes(timeoutMinutes);
            List<TestResult> timedOutSyncs = testResultRepository.findTimedOutInProgressSyncs(timeoutTime);
            
            if (timedOutSyncs.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "타임아웃된 동기화가 없습니다",
                    "cleanupCount", 0
                ));
            }
            
            // 상태를 RETRY_REQUIRED로 변경
            List<String> timedOutIds = timedOutSyncs.stream()
                .map(TestResult::getId)
                .toList();
            
            testResultRepository.updateJiraSyncStatus(timedOutIds, JiraSyncStatus.RETRY_REQUIRED, 
                "타임아웃으로 인한 재시도 설정 - " + LocalDateTime.now());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "타임아웃된 동기화가 정리되었습니다",
                "cleanupCount", timedOutSyncs.size()
            ));
            
        } catch (Exception e) {
            log.error("타임아웃된 JIRA 동기화 정리 실패", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", "서버 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}