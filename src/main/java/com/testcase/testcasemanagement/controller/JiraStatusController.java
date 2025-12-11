// src/main/java/com/testcase/testcasemanagement/controller/JiraStatusController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.JiraStatusSummaryDto;
import com.testcase.testcasemanagement.service.JiraStatusAggregationService;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ICT-189: JIRA 상태 통합 및 중복 제거 컨트롤러
 * 테스트 결과의 JIRA ID들을 통합하여 중복을 제거하고 현재 상태를 조회하는 API
 */
@RestController
@RequestMapping("/api/jira-status")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "JIRA - Status", description = "JIRA 상태 통합 및 집계 API")
public class JiraStatusController {

    private final JiraStatusAggregationService jiraStatusAggregationService;
    private final UserRepository userRepository;

    /**
     * 프로젝트의 JIRA 상태 요약 조회
     * 
     * @param projectId 프로젝트 ID
     * @return JIRA 상태 요약 리스트
     */
    @GetMapping("/projects/{projectId}/summary")
    @Operation(summary = "프로젝트 JIRA 상태 요약 조회", description = "프로젝트의 모든 테스트 결과에서 JIRA ID를 추출하여 중복 제거 후 현재 상태를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "JIRA 상태 요약 조회 성공"),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    public ResponseEntity<List<JiraStatusSummaryDto>> getProjectJiraStatusSummary(
            @Parameter(hidden = true) java.security.Principal principal,
            @Parameter(description = "프로젝트 ID", required = true) @PathVariable String projectId) {

        String userId = resolveUserId(principal);
        log.info("프로젝트 JIRA 상태 요약 조회 요청: 사용자={}, projectId={}", userId, projectId);

        try {
            List<JiraStatusSummaryDto> summary = jiraStatusAggregationService.getProjectJiraStatusSummary(userId,
                    projectId);

            log.info("프로젝트 JIRA 상태 요약 조회 완료: projectId={}, 요약 개수={}", projectId, summary.size());
            return ResponseEntity.ok(summary);

        } catch (Exception e) {
            log.error("프로젝트 JIRA 상태 요약 조회 실패: projectId={}", projectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 특정 JIRA 이슈의 상세 상태 조회
     * 
     * @param jiraId JIRA 이슈 키 (예: PRJ-123)
     * @return JIRA 상태 상세 정보
     */
    @GetMapping("/issues/{jiraId}")
    @Operation(summary = "JIRA 이슈 상세 상태 조회", description = "특정 JIRA 이슈의 상세 상태와 연결된 테스트 결과 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "JIRA 이슈 상세 조회 성공"),
            @ApiResponse(responseCode = "404", description = "JIRA 이슈를 찾을 수 없음"),
            @ApiResponse(responseCode = "400", description = "잘못된 JIRA 이슈 키 형식"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    public ResponseEntity<JiraStatusSummaryDto> getJiraStatusDetail(
            @Parameter(hidden = true) java.security.Principal principal,
            @Parameter(description = "JIRA 이슈 키 (예: PRJ-123)", required = true) @PathVariable String jiraId) {

        String userId = resolveUserId(principal);
        log.info("JIRA 이슈 상세 상태 조회 요청: 사용자={}, jiraId={}", userId, jiraId);

        try {
            // JIRA 이슈 키 형식 검증
            if (!isValidJiraIssueKey(jiraId)) {
                log.warn("잘못된 JIRA 이슈 키 형식: {}", jiraId);
                return ResponseEntity.badRequest().build();
            }

            JiraStatusSummaryDto detail = jiraStatusAggregationService.getJiraStatusDetail(userId, jiraId);

            if (detail == null) {
                log.warn("JIRA 이슈를 찾을 수 없음: {}", jiraId);
                return ResponseEntity.notFound().build();
            }

            log.info("JIRA 이슈 상세 상태 조회 완료: jiraId={}", jiraId);
            return ResponseEntity.ok(detail);

        } catch (Exception e) {
            log.error("JIRA 이슈 상세 상태 조회 실패: jiraId={}", jiraId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 프로젝트의 JIRA 상태 강제 새로고침
     * 
     * @param projectId 프로젝트 ID
     * @return 새로고침된 JIRA 상태 요약 리스트
     */
    @PostMapping("/projects/{projectId}/refresh")
    @Operation(summary = "프로젝트 JIRA 상태 강제 새로고침", description = "캐시를 무시하고 프로젝트의 JIRA 상태를 강제로 새로고침합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "JIRA 상태 새로고침 성공"),
            @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    public ResponseEntity<List<JiraStatusSummaryDto>> refreshProjectJiraStatus(
            @Parameter(hidden = true) java.security.Principal principal,
            @Parameter(description = "프로젝트 ID", required = true) @PathVariable String projectId) {

        String userId = resolveUserId(principal);
        log.info("프로젝트 JIRA 상태 강제 새로고침 요청: 사용자={}, projectId={}", userId, projectId);

        try {
            List<JiraStatusSummaryDto> refreshedSummary = jiraStatusAggregationService
                    .refreshProjectJiraStatus(userId, projectId);

            log.info("프로젝트 JIRA 상태 강제 새로고침 완료: projectId={}, 요약 개수={}", projectId, refreshedSummary.size());
            return ResponseEntity.ok(refreshedSummary);

        } catch (Exception e) {
            log.error("프로젝트 JIRA 상태 강제 새로고침 실패: projectId={}", projectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 여러 프로젝트의 JIRA 상태 요약 조회 (배치 처리)
     * 
     * @param projectIds 프로젝트 ID 목록
     * @return 프로젝트별 JIRA 상태 요약 맵
     */
    @PostMapping("/projects/batch-summary")
    @Operation(summary = "여러 프로젝트의 JIRA 상태 요약 배치 조회", description = "여러 프로젝트의 JIRA 상태를 한 번에 조회합니다. 성능 최적화를 위해 병렬 처리됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "배치 JIRA 상태 요약 조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    public ResponseEntity<?> getBatchProjectJiraStatusSummary(
            @Parameter(hidden = true) java.security.Principal principal,
            @Parameter(description = "프로젝트 ID 목록", required = true) @RequestBody List<String> projectIds) {

        String userId = resolveUserId(principal);
        log.info("배치 프로젝트 JIRA 상태 요약 조회 요청: 사용자={}, projectIds={}", userId, projectIds);

        try {
            if (projectIds == null || projectIds.isEmpty()) {
                return ResponseEntity.badRequest().body("프로젝트 ID 목록이 필요합니다");
            }

            if (projectIds.size() > 20) {
                return ResponseEntity.badRequest().body("한 번에 최대 20개 프로젝트까지만 조회 가능합니다");
            }

            // 병렬 스트림을 사용한 배치 처리
            var batchResult = projectIds.parallelStream()
                    .collect(java.util.stream.Collectors.toMap(
                            projectId -> projectId,
                            projectId -> {
                                try {
                                    return jiraStatusAggregationService.getProjectJiraStatusSummary(userId, projectId);
                                } catch (Exception e) {
                                    log.error("프로젝트 JIRA 상태 조회 실패: projectId={}", projectId, e);
                                    return List.<JiraStatusSummaryDto>of();
                                }
                            }));

            int totalSummaries = batchResult.values().stream()
                    .mapToInt(List::size)
                    .sum();

            log.info("배치 프로젝트 JIRA 상태 요약 조회 완료: 프로젝트 수={}, 총 요약 개수={}",
                    projectIds.size(), totalSummaries);

            return ResponseEntity.ok(batchResult);

        } catch (Exception e) {
            log.error("배치 프로젝트 JIRA 상태 요약 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * JIRA 상태 통계 조회
     * 
     * @param projectId 프로젝트 ID (선택적)
     * @return JIRA 상태별 통계 정보
     */
    @GetMapping("/statistics")
    @Operation(summary = "JIRA 상태 통계 조회", description = "전체 또는 특정 프로젝트의 JIRA 상태별 통계 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "JIRA 상태 통계 조회 성공"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    public ResponseEntity<?> getJiraStatusStatistics(
            @Parameter(hidden = true) java.security.Principal principal,
            @Parameter(description = "프로젝트 ID (선택적)") @RequestParam(required = false) String projectId) {

        String userId = resolveUserId(principal);
        log.info("JIRA 상태 통계 조회 요청: 사용자={}, projectId={}", userId, projectId);

        try {
            List<JiraStatusSummaryDto> summaries;

            if (projectId != null && !projectId.trim().isEmpty()) {
                summaries = jiraStatusAggregationService.getProjectJiraStatusSummary(userId, projectId.trim());
            } else {
                // 전체 프로젝트 통계는 향후 구현
                log.warn("전체 프로젝트 JIRA 상태 통계는 아직 구현되지 않았습니다");
                return ResponseEntity.badRequest().body("프로젝트 ID가 필요합니다");
            }

            // 통계 계산
            var statistics = calculateJiraStatusStatistics(summaries);

            log.info("JIRA 상태 통계 조회 완료: projectId={}, 통계={}", projectId, statistics);
            return ResponseEntity.ok(statistics);

        } catch (Exception e) {
            log.error("JIRA 상태 통계 조회 실패: projectId={}", projectId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * 여러 JIRA 이슈 키의 상태를 한 번에 조회
     * 
     * @param jiraIssueKeys JIRA 이슈 키 목록
     * @return 각 이슈의 상태 요약 리스트
     */
    @PostMapping("/issues/batch-summary")
    @Operation(summary = "배치 JIRA 이슈 상태 조회", description = "여러 JIRA 이슈의 상태를 한 번에 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "배치 JIRA 이슈 상태 조회 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    public ResponseEntity<?> getBatchJiraIssueSummaries(
            @Parameter(hidden = true) java.security.Principal principal,
            @RequestBody List<String> jiraIssueKeys) {

        String userId = resolveUserId(principal);
        log.info("배치 JIRA 이슈 상태 조회 요청: 사용자={}, 개수={}", userId, jiraIssueKeys != null ? jiraIssueKeys.size() : 0);

        if (jiraIssueKeys == null || jiraIssueKeys.isEmpty()) {
            return ResponseEntity.badRequest().body("JIRA 이슈 키 목록이 필요합니다");
        }

        try {
            List<JiraStatusSummaryDto> summaries = jiraStatusAggregationService.getBatchJiraStatusSummary(userId,
                    jiraIssueKeys);
            return ResponseEntity.ok(summaries);
        } catch (Exception e) {
            log.error("배치 JIRA 이슈 상태 조회 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * JIRA 상태를 데이터베이스에 동기화 (수동)
     * 
     * @param principal     인증된 사용자 정보
     * @param jiraIssueKeys JIRA 이슈 키 목록
     * @return 업데이트된 테스트 결과 개수
     */
    @PostMapping("/issues/sync-to-database")
    @Operation(summary = "JIRA 상태 데이터베이스 동기화", description = "JIRA API에서 최신 상태를 조회하여 데이터베이스에 저장합니다. 이후 조회 시 DB 값을 사용하여 성능이 향상됩니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "JIRA 상태 동기화 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 파라미터 또는 JIRA 설정 없음"),
            @ApiResponse(responseCode = "500", description = "서버 내부 오류")
    })
    public ResponseEntity<?> syncJiraStatusToDatabase(
            @Parameter(hidden = true) java.security.Principal principal,
            @Parameter(description = "JIRA 이슈 키 목록", required = true) @RequestBody List<String> jiraIssueKeys) {

        String userId = resolveUserId(principal);
        log.info("JIRA 상태 데이터베이스 동기화 요청: 사용자={}, 개수={}", userId, jiraIssueKeys != null ? jiraIssueKeys.size() : 0);

        if (jiraIssueKeys == null || jiraIssueKeys.isEmpty()) {
            return ResponseEntity.badRequest().body("JIRA 이슈 키 목록이 필요합니다");
        }

        try {
            int updateCount = jiraStatusAggregationService.syncJiraStatusToDatabase(userId, jiraIssueKeys);

            var response = new java.util.HashMap<String, Object>();
            response.put("success", true);
            response.put("updatedCount", updateCount);
            response.put("message", updateCount + "개의 테스트 결과 JIRA 상태가 업데이트되었습니다");

            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            if ("JIRA_CONFIG_MISSING".equals(e.getMessage())) {
                log.warn("JIRA 설정 없음: 사용자={}", userId);
                return ResponseEntity.badRequest().body("JIRA_CONFIG_MISSING");
            }
            log.error("JIRA 상태 데이터베이스 동기화 실패", e);
            return ResponseEntity.internalServerError().body("JIRA 상태 동기화 중 오류가 발생했습니다");
        } catch (Exception e) {
            log.error("JIRA 상태 데이터베이스 동기화 실패", e);
            return ResponseEntity.internalServerError().body("JIRA 상태 동기화 중 오류가 발생했습니다");
        }
    }

    /**
     * Principal에서 사용자 ID를 해결
     * 
     * @param principal Principal 객체
     * @return 사용자 ID (UUID)
     */
    private String resolveUserId(java.security.Principal principal) {
        if (principal == null) {
            // 인증되지 않은 경우, admin 사용자의 ID 조회 시도
            return userRepository.findByUsername("admin")
                    .map(User::getId)
                    .orElse("admin"); // admin 사용자가 없으면 "admin" 문자열 반환 (레거시 호환성)
        }

        // 인증된 경우, Principal 이름(username)으로 사용자 ID 조회
        return userRepository.findByUsername(principal.getName())
                .map(User::getId)
                .orElse(principal.getName()); // 사용자를 찾을 수 없으면 Principal 이름 그대로 반환
    }

    /**
     * JIRA 이슈 키 형식 검증
     * 
     * @param jiraId JIRA 이슈 키
     * @return 유효한 형식인지 여부
     */
    private boolean isValidJiraIssueKey(String jiraId) {
        if (jiraId == null || jiraId.trim().isEmpty()) {
            return false;
        }

        // JIRA 이슈 키 패턴: 프로젝트키-숫자 (예: TEST-123)
        return jiraId.trim().matches("^[A-Z]+-\\d+$");
    }

    /**
     * JIRA 상태 통계 계산
     * 
     * @param summaries JIRA 상태 요약 리스트
     * @return 통계 정보
     */
    private java.util.Map<String, Object> calculateJiraStatusStatistics(List<JiraStatusSummaryDto> summaries) {
        var statistics = new java.util.HashMap<String, Object>();

        if (summaries.isEmpty()) {
            statistics.put("totalIssues", 0);
            statistics.put("statusDistribution", new java.util.HashMap<>());
            statistics.put("priorityDistribution", new java.util.HashMap<>());
            statistics.put("syncStatusDistribution", new java.util.HashMap<>());
            return statistics;
        }

        // 전체 이슈 수
        statistics.put("totalIssues", summaries.size());

        // 상태별 분포
        var statusDistribution = summaries.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        JiraStatusSummaryDto::getCurrentStatus,
                        java.util.stream.Collectors.counting()));
        statistics.put("statusDistribution", statusDistribution);

        // 우선순위별 분포
        var priorityDistribution = summaries.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        JiraStatusSummaryDto::getPriority,
                        java.util.stream.Collectors.counting()));
        statistics.put("priorityDistribution", priorityDistribution);

        // 동기화 상태별 분포
        var syncStatusDistribution = summaries.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        JiraStatusSummaryDto::getSyncStatus,
                        java.util.stream.Collectors.counting()));
        statistics.put("syncStatusDistribution", syncStatusDistribution);

        // 연결된 테스트 총 수
        long totalLinkedTests = summaries.stream()
                .mapToLong(s -> s.getLinkedTestCount() != null ? s.getLinkedTestCount() : 0)
                .sum();
        statistics.put("totalLinkedTests", totalLinkedTests);

        // 평균 성공률
        double averageSuccessRate = summaries.stream()
                .mapToDouble(JiraStatusSummaryDto::getSuccessRate)
                .average()
                .orElse(0.0);
        statistics.put("averageSuccessRate", Math.round(averageSuccessRate * 100.0) / 100.0);

        // 실패한 테스트가 있는 이슈 수
        long issuesWithFailures = summaries.stream()
                .mapToLong(s -> s.hasFailedTests() ? 1 : 0)
                .sum();
        statistics.put("issuesWithFailures", issuesWithFailures);

        // 모든 테스트가 통과한 이슈 수
        long issuesAllPassed = summaries.stream()
                .mapToLong(s -> s.allTestsPassed() ? 1 : 0)
                .sum();
        statistics.put("issuesAllPassed", issuesAllPassed);

        // 활성 이슈 수 (완료되지 않은 이슈)
        long activeIssues = summaries.stream()
                .mapToLong(s -> s.isActiveIssue() ? 1 : 0)
                .sum();
        statistics.put("activeIssues", activeIssues);

        return statistics;
    }
}
