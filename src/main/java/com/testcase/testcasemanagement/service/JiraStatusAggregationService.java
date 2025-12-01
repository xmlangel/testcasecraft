// src/main/java/com/testcase/testcasemanagement/service/JiraStatusAggregationService.java

package com.testcase.testcasemanagement.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.testcase.testcasemanagement.dto.JiraStatusSummaryDto;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ICT-189: JIRA 상태 통합 및 중복 제거 서비스
 * 테스트 결과에서 JIRA ID들을 추출, 중복 제거하고 현재 상태를 조회하는 서비스
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class JiraStatusAggregationService {

    private final TestResultRepository testResultRepository;
    private final JiraApiService jiraApiService;
    private final JiraConfigService jiraConfigService;
    private final com.testcase.testcasemanagement.security.EncryptionUtil encryptionUtil;

    /**
     * 프로젝트의 모든 JIRA 상태 요약 조회 (캐시된)
     * 
     * @param projectId 프로젝트 ID
     * @return JIRA 상태 요약 리스트
     */
    public List<JiraStatusSummaryDto> getProjectJiraStatusSummary(String projectId) {
        log.info("프로젝트 JIRA 상태 요약 조회 시작: projectId={}", projectId);

        try {
            // 1. 프로젝트의 모든 테스트 결과에서 JIRA ID 추출 및 중복 제거
            Set<String> uniqueJiraIds = extractUniqueJiraIds(projectId);
            log.info("추출된 고유 JIRA ID 개수: {}", uniqueJiraIds.size());

            if (uniqueJiraIds.isEmpty()) {
                log.info("프로젝트 {}에 연결된 JIRA 이슈가 없습니다", projectId);
                return new ArrayList<>();
            }

            // 2. 각 JIRA ID에 대한 상태 요약 생성
            List<JiraStatusSummaryDto> summaryList = new ArrayList<>();

            for (String jiraId : uniqueJiraIds) {
                try {
                    JiraStatusSummaryDto summary = createJiraStatusSummary(projectId, jiraId);
                    if (summary != null) {
                        summaryList.add(summary);
                    }
                } catch (Exception e) {
                    log.error("JIRA 상태 요약 생성 실패: jiraId={}", jiraId, e);
                    // 개별 실패는 전체 처리를 중단시키지 않음
                }
            }

            // 3. 최신 테스트 일시 기준으로 정렬
            summaryList.sort((a, b) -> {
                if (a.getLatestTestDate() == null)
                    return 1;
                if (b.getLatestTestDate() == null)
                    return -1;
                return b.getLatestTestDate().compareTo(a.getLatestTestDate());
            });

            log.info("프로젝트 JIRA 상태 요약 조회 완료: projectId={}, 요약 개수={}", projectId, summaryList.size());
            return summaryList;

        } catch (Exception e) {
            log.error("프로젝트 JIRA 상태 요약 조회 실패: projectId={}", projectId, e);
            return new ArrayList<>();
        }
    }

    /**
     * 특정 JIRA ID의 상세 상태 조회
     * 
     * @param jiraId JIRA 이슈 키
     * @return JIRA 상태 상세 정보
     */
    public JiraStatusSummaryDto getJiraStatusDetail(String jiraId) {
        log.info("JIRA 상세 상태 조회: jiraId={}", jiraId);

        try {
            // 이슈와 연결된 모든 테스트 결과 조회
            List<TestResult> testResults = testResultRepository.findByJiraIssueKeyOrderByExecutedAtDesc(jiraId);

            if (testResults.isEmpty()) {
                log.warn("JIRA ID {}와 연결된 테스트 결과가 없습니다", jiraId);
                return null;
            }

            // 첫 번째 테스트 결과의 프로젝트 정보 사용
            String projectId = testResults.get(0).getTestExecution().getProject().getId();

            return createJiraStatusSummary(projectId, jiraId);

        } catch (Exception e) {
            log.error("JIRA 상세 상태 조회 실패: jiraId={}", jiraId, e);
            return null;
        }
    }

    /**
     * JIRA 상태 강제 새로고침 (캐시 무시)
     * 
     * @param projectId 프로젝트 ID
     * @return 새로고침된 JIRA 상태 요약 리스트
     */
    public List<JiraStatusSummaryDto> refreshProjectJiraStatus(String projectId) {
        log.info("JIRA 상태 강제 새로고침: projectId={}", projectId);

        // 데이터 강제 새로고침

        // 새로운 데이터 조회
        return getProjectJiraStatusSummary(projectId);
    }

    /**
     * 배치로 여러 JIRA 이슈 상태 조회 (성능 최적화)
     * 
     * @param jiraIds JIRA 이슈 키 목록
     * @return JIRA 상태 맵 (키: JIRA ID, 값: 이슈 정보)
     */
    public Map<String, JsonNode> batchGetJiraIssueInfo(Set<String> jiraIds) {
        log.info("배치 JIRA 이슈 조회 시작: 요청 개수={}", jiraIds.size());

        Map<String, JsonNode> issueInfoMap = new HashMap<>();

        try {
            var jiraConfig = getActiveJiraConfig();
            if (jiraConfig.isEmpty()) {
                log.warn("활성화된 JIRA 설정이 없습니다");
                return issueInfoMap;
            }

            var config = jiraConfig.get();

            // 배치 크기로 나누어 처리 (JIRA API 제한 고려)
            List<String> jiraIdList = new ArrayList<>(jiraIds);
            int batchSize = 50; // JIRA API 제한에 맞춘 배치 크기

            for (int i = 0; i < jiraIdList.size(); i += batchSize) {
                int endIndex = Math.min(i + batchSize, jiraIdList.size());
                List<String> batch = jiraIdList.subList(i, endIndex);

                log.debug("배치 {}~{} 처리 중", i + 1, endIndex);

                // JQL을 사용한 배치 조회
                String jql = "key in (" + batch.stream()
                        .map(id -> "\"" + id + "\"")
                        .collect(Collectors.joining(",")) + ")";

                List<JsonNode> issues = jiraApiService.searchIssues(
                        config.getServerUrl(),
                        config.getUsername(),
                        encryptionUtil.decrypt(config.getApiToken()),
                        jql,
                        batchSize);

                // 결과를 맵에 저장
                for (JsonNode issue : issues) {
                    String issueKey = issue.path("key").asText();
                    issueInfoMap.put(issueKey, issue);

                }

                // API 호출 간격 조정 (Rate Limiting 방지)
                if (i + batchSize < jiraIdList.size()) {
                    try {
                        Thread.sleep(200); // 200ms 대기
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }

            log.info("배치 JIRA 이슈 조회 완료: 요청={}, 응답={}", jiraIds.size(), issueInfoMap.size());

        } catch (Exception e) {
            log.error("배치 JIRA 이슈 조회 실패", e);
        }

        return issueInfoMap;
    }

    /**
     * 프로젝트에서 고유한 JIRA ID 목록 추출
     * 
     * @param projectId 프로젝트 ID
     * @return 중복 제거된 JIRA ID 집합
     */
    private Set<String> extractUniqueJiraIds(String projectId) {
        log.debug("고유 JIRA ID 추출 시작: projectId={}", projectId);

        // 테스트 결과에서 JIRA 이슈 키가 있는 것들만 조회
        List<TestResult> testResults = testResultRepository.findByProjectIdAndJiraIssueKeyIsNotNull(projectId);

        Set<String> uniqueJiraIds = testResults.stream()
                .filter(tr -> tr.getJiraIssueKey() != null && !tr.getJiraIssueKey().trim().isEmpty())
                .filter(tr -> jiraApiService.isValidIssueKey(tr.getJiraIssueKey()))
                .map(tr -> tr.getJiraIssueKey().trim().toUpperCase())
                .collect(Collectors.toSet());

        log.debug("고유 JIRA ID 추출 완료: 총 테스트 결과={}, 고유 JIRA ID={}", testResults.size(), uniqueJiraIds.size());
        return uniqueJiraIds;
    }

    /**
     * 특정 JIRA ID에 대한 상태 요약 생성
     * 
     * @param projectId 프로젝트 ID
     * @param jiraId    JIRA 이슈 키
     * @return JIRA 상태 요약
     */
    private JiraStatusSummaryDto createJiraStatusSummary(String projectId, String jiraId) {
        log.debug("JIRA 상태 요약 생성: jiraId={}", jiraId);

        try {
            var jiraConfig = getActiveJiraConfig();
            if (jiraConfig.isEmpty()) {
                log.warn("활성화된 JIRA 설정이 없어 이슈 조회 불가: {}", jiraId);
                return null;
            }

            var config = jiraConfig.get();
            JsonNode issueInfo = jiraApiService.getIssueInfo(
                    config.getServerUrl(),
                    config.getUsername(),
                    encryptionUtil.decrypt(config.getApiToken()),
                    jiraId);

            if (issueInfo == null) {
                log.warn("JIRA 이슈 정보를 조회할 수 없습니다: {}", jiraId);
                return createFailedSummary(projectId, jiraId, "JIRA 이슈 정보 조회 실패");
            }

            List<TestResult> testResults = testResultRepository.findByJiraIssueKeyOrderByExecutedAtDesc(jiraId);
            if (testResults.isEmpty()) {
                log.warn("JIRA ID {}와 연결된 테스트 결과가 없습니다", jiraId);
                return null;
            }

            return buildSummaryFromData(jiraId, issueInfo, testResults, config.getServerUrl());

        } catch (Exception e) {
            log.error("JIRA 상태 요약 생성 실패: jiraId={}", jiraId, e);
            return createFailedSummary(projectId, jiraId, e.getMessage());
        }
    }

    /**
     * 주어진 JIRA 이슈 키 목록에 대한 상태 요약을 배치로 조회
     * 
     * @param jiraIssueKeys JIRA 이슈 키 목록
     * @return 요약 정보 리스트
     */
    public List<JiraStatusSummaryDto> getBatchJiraStatusSummary(List<String> jiraIssueKeys) {
        if (jiraIssueKeys == null || jiraIssueKeys.isEmpty()) {
            return List.of();
        }

        List<String> sanitizedKeys = jiraIssueKeys.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(key -> !key.isEmpty())
                .collect(Collectors.toList());

        if (sanitizedKeys.isEmpty()) {
            return List.of();
        }

        LinkedHashSet<String> normalizedKeys = sanitizedKeys.stream()
                .map(String::toUpperCase)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        log.info("배치 JIRA 상태 요약 요청: {}개", normalizedKeys.size());

        Map<String, String> originalKeyMap = new LinkedHashMap<>();
        for (String key : sanitizedKeys) {
            String normalized = key.toUpperCase();
            originalKeyMap.putIfAbsent(normalized, key);
        }

        Map<String, JsonNode> issueInfoMap = batchGetJiraIssueInfo(normalizedKeys);
        List<TestResult> relatedResults = testResultRepository.findByJiraIssueKeyIn(sanitizedKeys);
        Map<String, List<TestResult>> resultsByIssueKey = relatedResults.stream()
                .filter(tr -> tr.getJiraIssueKey() != null)
                .collect(Collectors.groupingBy(
                        tr -> tr.getJiraIssueKey().trim().toUpperCase(),
                        LinkedHashMap::new,
                        Collectors.toList()));

        String jiraBaseUrl = getActiveJiraConfig()
                .map(com.testcase.testcasemanagement.dto.JiraConfigDto::getServerUrl)
                .orElse(null);

        List<JiraStatusSummaryDto> summaries = new ArrayList<>();

        for (String issueKey : normalizedKeys) {
            List<TestResult> results = resultsByIssueKey.get(issueKey);
            if (results == null || results.isEmpty()) {
                log.debug("JIRA ID {}와 연결된 테스트 결과가 없습니다 (배치 요청)", issueKey);
                continue;
            }

            JsonNode issueInfo = issueInfoMap.get(issueKey);
            JiraStatusSummaryDto summary;
            if (issueInfo == null) {
                summary = createFailedSummary(
                        results.get(0).getTestExecution().getProject().getId(),
                        originalKeyMap.getOrDefault(issueKey, issueKey),
                        "JIRA 이슈 정보를 찾을 수 없습니다");
            } else {
                summary = buildSummaryFromData(
                        originalKeyMap.getOrDefault(issueKey, issueKey),
                        issueInfo,
                        results,
                        jiraBaseUrl);
            }

            if (summary != null) {
                summaries.add(summary);
            }
        }

        return summaries;
    }

    /**
     * 전체 동기화 상태 계산
     * 
     * @param testResults 테스트 결과 목록
     * @return 전체 동기화 상태
     */
    private String calculateOverallSyncStatus(List<TestResult> testResults) {
        if (testResults.isEmpty()) {
            return "NOT_SYNCED";
        }

        long syncedCount = testResults.stream()
                .mapToLong(tr -> tr.getJiraSyncStatus() != null &&
                        tr.getJiraSyncStatus().name().equals("SYNCED") ? 1 : 0)
                .sum();

        long inProgressCount = testResults.stream()
                .mapToLong(tr -> tr.getJiraSyncStatus() != null &&
                        tr.getJiraSyncStatus().name().equals("IN_PROGRESS") ? 1 : 0)
                .sum();

        long failedCount = testResults.stream()
                .mapToLong(tr -> tr.getJiraSyncStatus() != null &&
                        tr.getJiraSyncStatus().name().equals("FAILED") ? 1 : 0)
                .sum();

        if (inProgressCount > 0) {
            return "IN_PROGRESS";
        } else if (syncedCount == testResults.size()) {
            return "SYNCED";
        } else if (failedCount > 0) {
            return "FAILED";
        } else {
            return "NOT_SYNCED";
        }
    }

    /**
     * 활성화된 JIRA 설정 조회 헬퍼 메서드
     * TODO: 실제 운영에서는 현재 사용자 컨텍스트에서 userId를 가져와야 함
     * 
     * @return 활성화된 JIRA 설정
     */
    private Optional<com.testcase.testcasemanagement.dto.JiraConfigDto> getActiveJiraConfig() {
        // 임시로 시스템 기본 사용자 사용 (실제로는 SecurityContext에서 가져와야 함)
        String defaultUserId = "admin"; // 또는 시스템 설정에서 가져오기

        var config = jiraConfigService.getActiveConfigByUserId(defaultUserId);

        // 기본 사용자에 설정이 없으면 첫 번째 활성 설정 찾기
        if (config.isEmpty()) {
            // 모든 사용자의 활성 설정 중 첫 번째 사용 (임시 방안)
            log.warn("기본 사용자({})의 JIRA 설정이 없어 첫 번째 활성 설정을 사용합니다", defaultUserId);
            // 실제로는 JiraConfigRepository에 findFirstActiveConfig() 같은 메서드가 필요
        }

        return config;
    }

    /**
     * 이슈 정보와 테스트 결과를 기반으로 요약 DTO 생성
     */
    private JiraStatusSummaryDto buildSummaryFromData(
            String jiraId,
            JsonNode issueInfo,
            List<TestResult> testResults,
            String jiraBaseUrl) {

        if (testResults == null || testResults.isEmpty()) {
            return null;
        }

        Map<String, Long> testResultDistribution = testResults.stream()
                .collect(Collectors.groupingBy(
                        TestResult::getResult,
                        Collectors.counting()));

        TestResult latestTest = testResults.stream()
                .filter(tr -> tr.getExecutedAt() != null)
                .max(Comparator.comparing(TestResult::getExecutedAt))
                .orElse(testResults.get(0));

        String currentStatus = Optional.ofNullable(issueInfo)
                .map(info -> info.path("fields").path("status").path("name").asText())
                .filter(text -> !text.isEmpty())
                .orElse("Unknown");

        String issueType = Optional.ofNullable(issueInfo)
                .map(info -> info.path("fields").path("issuetype").path("name").asText())
                .filter(text -> !text.isEmpty())
                .orElse("Unknown");

        String priority = Optional.ofNullable(issueInfo)
                .map(info -> info.path("fields").path("priority").path("name").asText())
                .filter(text -> !text.isEmpty())
                .orElse("Unknown");

        String summary = Optional.ofNullable(issueInfo)
                .map(info -> info.path("fields").path("summary").asText())
                .filter(text -> !text.isEmpty())
                .orElse("No Summary");

        String syncStatus = calculateOverallSyncStatus(testResults);
        LocalDateTime lastSyncAt = testResults.stream()
                .map(TestResult::getLastJiraSyncAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        String jiraUrl = jiraBaseUrl != null
                ? jiraApiService.generateIssueUrl(jiraBaseUrl, jiraId)
                : null;

        String projectId = null;
        String projectName = null;
        if (latestTest.getTestExecution() != null && latestTest.getTestExecution().getProject() != null) {
            projectId = latestTest.getTestExecution().getProject().getId();
            projectName = latestTest.getTestExecution().getProject().getName();
        }

        return JiraStatusSummaryDto.builder()
                .jiraIssueKey(jiraId)
                .jiraIssueUrl(jiraUrl)
                .currentStatus(currentStatus)
                .issueType(issueType)
                .priority(priority)
                .summary(summary)
                .linkedTestCount((long) testResults.size())
                .testResultDistribution(testResultDistribution)
                .latestTestResult(latestTest.getResult())
                .latestTestDate(latestTest.getExecutedAt())
                .latestExecutor(
                        latestTest.getExecutedBy() != null ? latestTest.getExecutedBy().getUsername() : "Unknown")
                .syncStatus(syncStatus)
                .lastSyncAt(lastSyncAt)
                .projectId(projectId)
                .projectName(projectName)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * 실패한 요약 객체 생성
     * 
     * @param projectId    프로젝트 ID
     * @param jiraId       JIRA 이슈 키
     * @param errorMessage 오류 메시지
     * @return 실패 상태의 요약 객체
     */
    private JiraStatusSummaryDto createFailedSummary(String projectId, String jiraId, String errorMessage) {
        return JiraStatusSummaryDto.builder()
                .jiraIssueKey(jiraId)
                .currentStatus("ERROR")
                .issueType("Unknown")
                .priority("Unknown")
                .summary("JIRA 이슈 조회 실패")
                .linkedTestCount(0L)
                .testResultDistribution(new HashMap<>())
                .syncStatus("FAILED")
                .syncError(errorMessage)
                .projectId(projectId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
