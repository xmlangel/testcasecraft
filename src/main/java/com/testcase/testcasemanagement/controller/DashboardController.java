// src/main/java/com/testcase/testcasemanagement/controller/DashboardController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.OpenTestRunAssigneeResultDto;
import com.testcase.testcasemanagement.dto.RecentTestResultDto;
import com.testcase.testcasemanagement.dto.TestResultsTrendDto;
import com.testcase.testcasemanagement.dto.TestCaseStatisticsDto;
import com.testcase.testcasemanagement.dto.TestExecutionProgressDto;
import com.testcase.testcasemanagement.dto.ProjectStatisticsDto;
import com.testcase.testcasemanagement.dto.TestPlanDto;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.service.DashboardService;
import com.testcase.testcasemanagement.service.MonitoringService;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
@Tag(name = "Dashboard - Statistics", description = "대시보드 통계 API")
public class DashboardController {

    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private TestPlanRepository testPlanRepository;

    // ICT-134: 모니터링 서비스 주입
    @Autowired
    private MonitoringService monitoringService;

    /**
     * ICT-135: 대시보드 차트 데이터 조회 API 추가
     * 프론트엔드에서 fake 데이터 대신 실제 백엔드 데이터를 사용하도록 지원
     */

    /**
     * 프로젝트별 테스트케이스 결과 요약 조회 (파이차트용)
     * 최근 실행 결과를 기반으로 PASS, FAIL, BLOCKED, SKIPPED, NOTRUN 통계 제공
     */
    @GetMapping("/projects/{projectId}/test-results-summary")
    @Operation(summary = "프로젝트 테스트 결과 요약", description = "프로젝트의 최근 테스트 실행 결과 요약을 조회합니다.")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<Map<String, Object>> getProjectTestResultsSummary(
            @PathVariable String projectId,
            Authentication authentication,
            HttpServletRequest request) {

        logger.info("대시보드 테스트 결과 요약 조회 - 프로젝트: {}, 사용자: {}",
                projectId, authentication.getName());

        return monitoringService.measureDashboardApiTime("getProjectTestResultsSummary", () -> {
            try {
                // 사용자 세션 추적
                monitoringService.recordUserSessionStart();

                // 프로젝트 테스트케이스 통계 조회
                TestCaseStatisticsDto statistics = dashboardService.getTestCaseStatistics(projectId);

                Map<String, Object> response = new HashMap<>();
                response.put("projectId", projectId);
                response.put("totalCases", statistics.getTotalCases());
                response.put("lastResult", Map.of(
                        "PASS", statistics.getPASS(),
                        "FAIL", statistics.getFAIL(),
                        "BLOCKED", statistics.getBLOCKED(),
                        "SKIPPED", statistics.getSKIPPED(),
                        "NOTRUN", statistics.getNOTRUN()));

                // 완료율 계산
                int completedCases = statistics.getPASS() + statistics.getFAIL() +
                        statistics.getBLOCKED() + statistics.getSKIPPED();
                int completeRate = statistics.getTotalCases() > 0
                        ? Math.round((float) completedCases / statistics.getTotalCases() * 100)
                        : 0;

                response.put("completeRate", completeRate);
                response.put("lastUpdated", LocalDateTime.now().format(DateTimeFormatter.ofPattern("M/d/yyyy")));

                logger.debug("테스트 결과 요약 조회 성공 - 총 케이스: {}, 완료율: {}%",
                        statistics.getTotalCases(), completeRate);

                return ResponseEntity.ok(response);

            } catch (Exception e) {
                logger.error("테스트 결과 요약 조회 실패 - 프로젝트: {}, 오류: {}", projectId, e.getMessage());

                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "테스트 결과 요약을 조회할 수 없습니다.");
                errorResponse.put("message", e.getMessage());

                return ResponseEntity.status(500).body(errorResponse);
            }
        });
    }

    /**
     * 오픈 테스트런 결과 조회 (바차트용)
     * 현재 진행 중인 테스트 실행의 담당자별 결과 통계 제공
     */
    @GetMapping("/projects/{projectId}/open-testrun-results")
    @Operation(summary = "오픈 테스트런 결과", description = "프로젝트의 진행 중인 테스트런별 결과를 조회합니다.")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<Map<String, Object>> getOpenTestRunResults(
            @PathVariable String projectId,
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            Authentication authentication) {

        logger.info("대시보드 오픈 테스트런 결과 조회 - 프로젝트: {}, 제한: {}, 사용자: {}",
                projectId, limit, authentication.getName());

        return monitoringService.measureDashboardApiTime("getOpenTestRunResults", () -> {
            try {
                List<OpenTestRunAssigneeResultDto> assigneeResults = dashboardService
                        .getOpenTestRunAssigneeResultsByProject(projectId, limit);

                // 바차트에 맞는 형태로 데이터 변환
                List<Map<String, Object>> chartData = assigneeResults.stream()
                        .map(result -> {
                            Map<String, Object> item = new HashMap<>();
                            item.put("assignee", result.getAssigneeName());
                            item.put("PASS", result.getPassedTestCases());
                            item.put("FAIL", result.getFailedTestCases());
                            item.put("BLOCKED", result.getBlockedTestCases());
                            item.put("NOTRUN", result.getNotRunTestCases());
                            item.put("totalCases", result.getTotalTestCases());
                            item.put("completionRate", result.getCompletionRate());
                            return item;
                        })
                        .collect(java.util.stream.Collectors.toList());

                Map<String, Object> response = new HashMap<>();
                response.put("projectId", projectId);
                response.put("openTestRunResults", chartData);
                response.put("resultCount", chartData.size());
                response.put("lastUpdated", LocalDateTime.now().format(DateTimeFormatter.ofPattern("M/d/yyyy")));

                logger.debug("오픈 테스트런 결과 조회 성공 - 결과 수: {}개", chartData.size());

                return ResponseEntity.ok(response);

            } catch (Exception e) {
                logger.error("오픈 테스트런 결과 조회 실패 - 프로젝트: {}, 오류: {}", projectId, e.getMessage());

                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "오픈 테스트런 결과를 조회할 수 없습니다.");
                errorResponse.put("message", e.getMessage());

                return ResponseEntity.status(500).body(errorResponse);
            }
        });
    }

    /**
     * 프로젝트 대시보드 종합 정보 조회
     * 한 번의 호출로 대시보드에 필요한 모든 기본 정보 제공
     */
    @GetMapping("/projects/{projectId}/overview")
    @Operation(summary = "프로젝트 대시보드 종합 정보", description = "프로젝트의 대시보드 종합 정보를 조회합니다.")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<Map<String, Object>> getProjectDashboardOverview(
            @PathVariable String projectId,
            Authentication authentication) {

        logger.info("대시보드 종합 정보 조회 - 프로젝트: {}, 사용자: {}",
                projectId, authentication.getName());

        return monitoringService.measureDashboardApiTime("getProjectDashboardOverview", () -> {
            try {
                // 프로젝트 전체 통계 조회
                ProjectStatisticsDto projectStats = dashboardService.getProjectStatistics(projectId);

                Map<String, Object> response = new HashMap<>();
                response.put("projectId", projectId);
                response.put("projectName", projectStats.getProjectName());

                // 기본 통계
                Map<String, Object> basicStats = new HashMap<>();
                basicStats.put("totalTestCases", projectStats.getTotalTestCases());
                basicStats.put("totalTestPlans", projectStats.getTotalTestPlans());
                basicStats.put("totalTestExecutions", projectStats.getTotalTestExecutions());
                basicStats.put("executionRate", projectStats.getExecutionRate());
                basicStats.put("passRate", projectStats.getPassRate());
                basicStats.put("testCoverage", projectStats.getTestCoverage());
                response.put("basicStatistics", basicStats);

                // 활성 실행 정보
                Map<String, Object> activeInfo = new HashMap<>();
                activeInfo.put("activeTestExecutions", projectStats.getActiveTestExecutions());
                activeInfo.put("completedTestExecutions", projectStats.getCompletedTestExecutions());
                activeInfo.put("pausedTestExecutions", projectStats.getPausedTestExecutions());
                response.put("activeExecutions", activeInfo);

                // 우선순위별 활성 케이스
                Map<String, Object> priorityInfo = new HashMap<>();
                priorityInfo.put("high", projectStats.getActivePriorityHighCases());
                priorityInfo.put("medium", projectStats.getActivePriorityMediumCases());
                priorityInfo.put("low", projectStats.getActivePriorityLowCases());
                response.put("activePriorityCases", priorityInfo);

                // 변화 추이
                Map<String, Object> trendInfo = new HashMap<>();
                trendInfo.put("dailyChangeRate", projectStats.getDailyChangeRate());
                trendInfo.put("weeklyChangeRate", projectStats.getWeeklyChangeRate());
                trendInfo.put("averagePassRateLast7Days", projectStats.getAveragePassRateLast7Days());
                trendInfo.put("averagePassRateLast30Days", projectStats.getAveragePassRateLast30Days());
                response.put("trends", trendInfo);

                response.put("lastExecutionDate", projectStats.getLastExecutionDate());
                response.put("calculatedAt", projectStats.getCalculatedAt());

                logger.debug("대시보드 종합 정보 조회 성공 - 총 케이스: {}, 실행률: {}%",
                        projectStats.getTotalTestCases(), projectStats.getExecutionRate());

                return ResponseEntity.ok(response);

            } catch (Exception e) {
                logger.error("대시보드 종합 정보 조회 실패 - 프로젝트: {}, 오류: {}", projectId, e.getMessage());

                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "대시보드 종합 정보를 조회할 수 없습니다.");
                errorResponse.put("message", e.getMessage());

                return ResponseEntity.status(500).body(errorResponse);
            }
        });
    }

    /**
     * 테스트 플랜 목록 조회
     * ICT-202: Hibernate 프록시 직렬화 문제 해결을 위해 DTO 사용
     * ICT-332: 시스템 관리자만 접근 가능하도록 권한 제한
     *
     * @return 테스트 플랜 목록
     */
    @GetMapping("/test-plans")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<TestPlanDto>> getTestPlans() {
        try {
            List<TestPlan> testPlans = testPlanRepository.findAll();

            // TestPlan 엔티티를 DTO로 변환 (Hibernate 프록시 문제 해결)
            List<TestPlanDto> testPlanDtos = testPlans.stream()
                    .map(this::convertToSafeDto)
                    .collect(java.util.stream.Collectors.toList());

            logger.debug("테스트 플랜 목록 조회 성공 - 총 {}개", testPlanDtos.size());
            return ResponseEntity.ok(testPlanDtos);

        } catch (Exception e) {
            logger.error("테스트 플랜 목록 조회 실패: {}", e.getMessage());

            // 빈 목록 반환 (프론트엔드 에러 방지)
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
    }

    /**
     * TestPlan을 안전하게 DTO로 변환하는 헬퍼 메소드
     * Hibernate 프록시 문제를 방지하기 위해 안전한 방식으로 변환
     */
    private TestPlanDto convertToSafeDto(TestPlan testPlan) {
        TestPlanDto dto = new TestPlanDto();
        dto.setId(testPlan.getId());
        dto.setName(testPlan.getName());
        dto.setDescription(testPlan.getDescription());
        dto.setTestCaseIds(testPlan.getTestCaseIds());
        dto.setCreatedAt(testPlan.getCreatedAt());
        dto.setUpdatedAt(testPlan.getUpdatedAt());
        dto.setTestCaseCount(testPlan.getTestCaseIds() != null ? testPlan.getTestCaseIds().size() : 0);

        // Project 정보를 안전하게 추출 (프록시 문제 방지)
        try {
            if (testPlan.getProject() != null) {
                dto.setProjectId(testPlan.getProject().getId());
            }
        } catch (Exception e) {
            logger.warn("TestPlan {} 의 Project 정보 추출 실패: {}", testPlan.getId(), e.getMessage());
            dto.setProjectId(null);
        }

        return dto;
    }

    /**
     * 전체 최근 테스트케이스 결과 조회 (ICT-134: 모니터링 추가)
     *
     * @param limit 조회할 결과 개수 (기본값: 10, 최대: 100)
     * @return 최근 테스트 결과 목록
     */
    @GetMapping("/recent-test-results")
    @Operation(summary = "최근 테스트 결과 조회", description = "전체 최근 테스트케이스 결과를 조회합니다.")
    public ResponseEntity<List<RecentTestResultDto>> getRecentTestResults(
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            HttpServletRequest request,
            Authentication authentication) {

        // ICT-134: 사용자 세션 시작 기록 (API 호출 시점)
        monitoringService.recordUserSessionStart();

        try {
            // 최대 100개로 제한
            if (limit > 100) {
                limit = 100;
            }
            if (limit < 1) {
                limit = 10;
            }

            logger.debug("최근 테스트 결과 조회 요청 - limit: {}, 사용자: {}", limit,
                    authentication != null ? authentication.getName() : "anonymous");

            List<RecentTestResultDto> results = dashboardService.getRecentTestResults(limit);
            return ResponseEntity.ok(results);

        } catch (Exception e) {
            logger.error("최근 테스트 결과 조회 중 오류 발생: {}", e.getMessage());
            throw e; // GlobalExceptionHandler에서 처리
        } finally {
            // ICT-134: 사용자 세션 종료 기록 (API 응답 완료 시점)
            monitoringService.recordUserSessionEnd();
        }
    }

    /**
     * 특정 프로젝트의 최근 테스트케이스 결과 조회
     *
     * @param projectId 프로젝트 ID
     * @param limit     조회할 결과 개수 (기본값: 10, 최대: 100)
     * @return 최근 테스트 결과 목록
     */
    @GetMapping("/projects/{projectId}/recent-test-results")
    public ResponseEntity<List<RecentTestResultDto>> getRecentTestResultsByProject(
            @PathVariable String projectId,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {

        // 최대 100개로 제한
        if (limit > 100) {
            limit = 100;
        }
        if (limit < 1) {
            limit = 10;
        }

        List<RecentTestResultDto> results = dashboardService.getRecentTestResultsByProject(projectId, limit);
        return ResponseEntity.ok(results);
    }

    /**
     * 특정 테스트 플랜의 최근 테스트케이스 결과 조회
     *
     * @param testPlanId 테스트 플랜 ID
     * @param limit      조회할 결과 개수 (기본값: 10, 최대: 100)
     * @return 최근 테스트 결과 목록
     */
    @GetMapping("/test-plans/{testPlanId}/recent-test-results")
    public ResponseEntity<List<RecentTestResultDto>> getRecentTestResultsByTestPlan(
            @PathVariable String testPlanId,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {

        // 최대 100개로 제한
        if (limit > 100) {
            limit = 100;
        }
        if (limit < 1) {
            limit = 10;
        }

        List<RecentTestResultDto> results = dashboardService.getRecentTestResultsByTestPlan(testPlanId, limit);
        return ResponseEntity.ok(results);
    }

    /**
     * 전체 오픈 테스트런 담당자별 테스트케이스 결과 조회
     *
     * @param limit 조회할 담당자 수 제한 (기본값: 20, 최대: 100)
     * @return 오픈 테스트런 담당자별 결과 목록
     */
    @GetMapping("/open-test-runs/assignee-results")
    public ResponseEntity<List<OpenTestRunAssigneeResultDto>> getOpenTestRunAssigneeResults(
            @RequestParam(value = "limit", defaultValue = "20") int limit) {

        // 최대 100개로 제한
        if (limit > 100) {
            limit = 100;
        }
        if (limit < 1) {
            limit = 20;
        }

        List<OpenTestRunAssigneeResultDto> results = dashboardService.getOpenTestRunAssigneeResults(limit);
        return ResponseEntity.ok(results);
    }

    /**
     * 특정 프로젝트의 오픈 테스트런 담당자별 테스트케이스 결과 조회
     *
     * @param projectId 프로젝트 ID
     * @param limit     조회할 담당자 수 제한 (기본값: 20, 최대: 100)
     * @return 오픈 테스트런 담당자별 결과 목록
     */
    @GetMapping("/projects/{projectId}/open-test-runs/assignee-results")
    public ResponseEntity<List<OpenTestRunAssigneeResultDto>> getOpenTestRunAssigneeResultsByProject(
            @PathVariable String projectId,
            @RequestParam(value = "limit", defaultValue = "20") int limit) {

        // 최대 100개로 제한
        if (limit > 100) {
            limit = 100;
        }
        if (limit < 1) {
            limit = 20;
        }

        List<OpenTestRunAssigneeResultDto> results = dashboardService.getOpenTestRunAssigneeResultsByProject(projectId,
                limit);
        return ResponseEntity.ok(results);
    }

    /**
     * ICT-135: 프로젝트별 테스트 결과 추이 조회 (라인차트용)
     * 대시보드 차트에서 사용할 수 있도록 응답 형식을 Map으로 변경
     *
     * @param projectId      프로젝트 ID
     * @param days           조회 기간 (일 단위, 기본값: 7일)
     * @param authentication 인증 정보
     * @return 대시보드용 테스트 결과 추이 데이터
     */
    @GetMapping("/projects/{projectId}/test-results-trend")
    @Operation(summary = "프로젝트 테스트 결과 추이", description = "프로젝트의 테스트 결과 추이를 조회합니다.")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<Map<String, Object>> getTestResultsTrend(
            @PathVariable String projectId,
            @RequestParam(value = "days", defaultValue = "7") int days,
            Authentication authentication) {

        logger.info("대시보드 테스트 결과 추이 조회 - 프로젝트: {}, 기간: {}일, 사용자: {}",
                projectId, days, authentication.getName());

        return monitoringService.measureDashboardApiTime("getTestResultsTrend", () -> {
            try {
                // 날짜 범위 계산
                LocalDateTime endDate = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);
                LocalDateTime startDate = endDate.minusDays(days).withHour(0).withMinute(0).withSecond(0);

                // 기존 서비스 메소드를 사용하여 추이 데이터 조회
                List<TestResultsTrendDto> trendResults = dashboardService.getTestResultsTrend(projectId, startDate,
                        endDate);

                // 대시보드 차트용으로 데이터 변환
                List<Map<String, Object>> chartData = trendResults.stream()
                        .map(result -> {
                            Map<String, Object> item = new HashMap<>();
                            // 날짜 처리 개선 - TestResultsTrendDto의 date 필드가 String이므로 직접 사용
                            String dateStr = result.getDate();
                            if (dateStr != null && !dateStr.isEmpty()) {
                                try {
                                    // YYYY-MM-DD 형식을 M/d 형식으로 변환
                                    if (dateStr.contains("-")) {
                                        String[] dateParts = dateStr.split("-");
                                        if (dateParts.length >= 3) {
                                            int month = Integer.parseInt(dateParts[1]);
                                            int day = Integer.parseInt(dateParts[2]);
                                            item.put("date", month + "/" + day);
                                        } else {
                                            item.put("date", dateStr);
                                        }
                                    } else {
                                        item.put("date", dateStr);
                                    }
                                } catch (Exception e) {
                                    logger.warn("날짜 파싱 실패: {}, 원본 사용", dateStr);
                                    item.put("date", dateStr);
                                }
                            } else {
                                item.put("date", "N/A");
                            }

                            // 결과 데이터 설정 (null 체크 추가)
                            item.put("PASS", result.getPASS() != null ? result.getPASS() : 0);
                            item.put("FAIL", result.getFAIL() != null ? result.getFAIL() : 0);
                            item.put("BLOCKED", result.getBLOCKED() != null ? result.getBLOCKED() : 0);
                            item.put("SKIPPED", result.getSKIPPED() != null ? result.getSKIPPED() : 0);
                            item.put("NOTRUN", result.getNOTRUN() != null ? result.getNOTRUN() : 0);
                            return item;
                        })
                        .collect(java.util.stream.Collectors.toList());

                Map<String, Object> response = new HashMap<>();
                response.put("projectId", projectId);
                response.put("testResultsHistory", chartData);
                response.put("dataCount", chartData.size());
                response.put("startDate", startDate.format(DateTimeFormatter.ofPattern("M/d/yyyy")));
                response.put("endDate", endDate.format(DateTimeFormatter.ofPattern("M/d/yyyy")));
                response.put("period", days + "일");

                logger.debug("테스트 결과 추이 조회 성공 - 데이터 포인트: {}개", chartData.size());

                return ResponseEntity.ok(response);

            } catch (Exception e) {
                logger.error("테스트 결과 추이 조회 실패 - 프로젝트: {}, 오류: {}", projectId, e.getMessage());

                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "테스트 결과 추이를 조회할 수 없습니다.");
                errorResponse.put("message", e.getMessage());

                return ResponseEntity.status(500).body(errorResponse);
            }
        });
    }

    /**
     * 특정 프로젝트의 테스트케이스 상태별 통계 조회
     *
     * @param projectId 프로젝트 ID
     * @return 테스트케이스 상태별 통계
     */
    @GetMapping("/projects/{projectId}/test-case-statistics")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<TestCaseStatisticsDto> getTestCaseStatistics(@PathVariable String projectId) {
        TestCaseStatisticsDto statistics = dashboardService.getTestCaseStatistics(projectId);
        return ResponseEntity.ok(statistics);
    }

    /**
     * 전체 진행 중인 테스트 실행 진행률 조회
     *
     * @param limit 조회할 테스트 실행 수 제한 (기본값: 10, 최대: 50)
     * @return 진행 중인 테스트 실행 진행률 목록
     */
    @GetMapping("/in-progress-test-executions")
    public ResponseEntity<List<TestExecutionProgressDto>> getInProgressTestExecutions(
            @RequestParam(value = "limit", defaultValue = "10") int limit) {

        // 최대 50개로 제한
        if (limit > 50) {
            limit = 50;
        }
        if (limit < 1) {
            limit = 10;
        }

        List<TestExecutionProgressDto> results = dashboardService.getInProgressTestExecutions(limit);
        return ResponseEntity.ok(results);
    }

    /**
     * 특정 프로젝트의 진행 중인 테스트 실행 진행률 조회
     *
     * @param projectId 프로젝트 ID
     * @param limit     조회할 테스트 실행 수 제한 (기본값: 10, 최대: 50)
     * @return 진행 중인 테스트 실행 진행률 목록
     */
    @GetMapping("/projects/{projectId}/in-progress-test-executions")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<List<TestExecutionProgressDto>> getInProgressTestExecutionsByProject(
            @PathVariable String projectId,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {

        // 최대 50개로 제한
        if (limit > 50) {
            limit = 50;
        }
        if (limit < 1) {
            limit = 10;
        }

        List<TestExecutionProgressDto> results = dashboardService.getInProgressTestExecutionsByProject(projectId,
                limit);
        return ResponseEntity.ok(results);
    }

    /**
     * ICT-129: 프로젝트 전체 통계 조회
     * 대시보드의 전체 통계 섹션을 위한 종합 통계 정보를 제공합니다.
     *
     * @param projectId 프로젝트 ID
     * @return 프로젝트 전체 통계 정보
     */
    @GetMapping("/projects/{projectId}/statistics")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<ProjectStatisticsDto> getProjectStatistics(@PathVariable String projectId) {
        try {
            ProjectStatisticsDto statistics = dashboardService.getProjectStatistics(projectId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            // 로깅 처리 (실제 구현에서는 Logger 사용 권장)
            System.err.println("프로젝트 통계 조회 중 오류 발생: " + e.getMessage());
            e.printStackTrace();

            // 오류 발생 시 기본값으로 빈 통계 반환
            ProjectStatisticsDto emptyStatistics = new ProjectStatisticsDto();
            emptyStatistics.setProjectId(projectId);
            emptyStatistics.setProjectName("Project " + projectId);
            emptyStatistics.setTotalTestCases(0);
            emptyStatistics.setTotalTestPlans(0);
            emptyStatistics.setTotalTestExecutions(0);
            emptyStatistics.setExecutedTestCases(0);
            emptyStatistics.setExecutionRate(0.0);
            emptyStatistics.setPassedTestCases(0);
            emptyStatistics.setPassRate(0.0);
            emptyStatistics.setFailedTestCases(0);
            emptyStatistics.setBlockedTestCases(0);
            emptyStatistics.setSkippedTestCases(0);
            emptyStatistics.setNotRunTestCases(0);
            emptyStatistics.setTestCoverage(0.0);
            emptyStatistics.setActivePriorityHighCases(0);
            emptyStatistics.setActivePriorityMediumCases(0);
            emptyStatistics.setActivePriorityLowCases(0);
            emptyStatistics.setYesterdayExecutions(0);
            emptyStatistics.setLastWeekExecutions(0);
            emptyStatistics.setDailyChangeRate(0.0);
            emptyStatistics.setWeeklyChangeRate(0.0);
            emptyStatistics.setAveragePassRateLast7Days(0.0);
            emptyStatistics.setAveragePassRateLast30Days(0.0);
            emptyStatistics.setCriticalFailuresLast7Days(0);
            emptyStatistics.setActiveTestExecutions(0);
            emptyStatistics.setCompletedTestExecutions(0);
            emptyStatistics.setPausedTestExecutions(0);
            emptyStatistics.setLastExecutionDate(null);
            emptyStatistics.setCalculatedAt(java.time.LocalDateTime.now());
            emptyStatistics.setDataFreshnessMinutes(0);

            return ResponseEntity.ok(emptyStatistics);
        }
    }
}