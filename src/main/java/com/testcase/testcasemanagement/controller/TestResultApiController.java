// src/main/java/com/testcase/testcasemanagement/controller/TestResultApiController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.*;
import com.testcase.testcasemanagement.service.TestResultReportService;
import com.testcase.testcasemanagement.service.TestResultStatisticsService;
import com.testcase.testcasemanagement.service.JunitResultService;
import com.testcase.testcasemanagement.service.TestPlanService;
import com.testcase.testcasemanagement.service.TestExecutionService;
import com.testcase.testcasemanagement.model.TestPlan;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * ICT-208: 테스트 결과 조회 및 통계 API 통합 컨트롤러
 * 기존 분산된 API들을 통합하고 표준화된 형식으로 제공합니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/test-results-v2")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Test Result - API", description = "ICT-208: 통합 테스트 결과 조회 및 통계 API")
public class TestResultApiController {

    private final TestResultReportService testResultReportService;
    private final TestResultStatisticsService statisticsService;
    private final JunitResultService junitResultService;
    private final TestPlanService testPlanService;
    private final TestExecutionService testExecutionService;

    /**
     * 테스트 결과 목록 조회 (통합 API)
     */
    @PostMapping("/search")
    @Operation(summary = "테스트 결과 검색", description = "다양한 조건으로 테스트 결과를 검색하고 페이징 처리된 결과를 반환합니다.")
    public ResponseEntity<ApiResponse<List<TestResultReportDto>>> searchTestResults(
            @RequestBody TestResultQueryDto query) {

        log.info("테스트 결과 검색 요청 - 프로젝트: {}, 페이지: {}", query.getProjectId(), query.getPage());

        try {
            // 쿼리를 기존 필터 DTO로 변환
            TestResultFilterDto filter = convertQueryToFilter(query);

            // 페이징 처리된 결과 조회
            Page<TestResultReportDto> resultPage = testResultReportService.getDetailedTestResultReport(filter);

            // 메타데이터 생성
            Map<String, Object> metadata = Map.of(
                    "queryExecutedAt", LocalDateTime.now(),
                    "totalResults", resultPage.getTotalElements(),
                    "searchCriteria", query);

            return ResponseEntity.ok(ApiResponse.success(resultPage.getContent(), metadata));

        } catch (Exception e) {
            log.error("테스트 결과 검색 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("SEARCH_FAILED", "테스트 결과 검색에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 테스트 결과 상세 조회
     */
    @GetMapping("/{resultId}")
    @Operation(summary = "테스트 결과 상세 조회", description = "특정 테스트 결과의 상세 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<Object>> getTestResultDetail(
            @Parameter(description = "테스트 결과 ID") @PathVariable String resultId,
            @Parameter(description = "결과 타입 (testResult|junitResult)") @RequestParam(defaultValue = "testResult") String resultType) {

        log.info("테스트 결과 상세 조회 - ID: {}, 타입: {}", resultId, resultType);

        try {
            Object result;

            if ("junitResult".equals(resultType)) {
                result = junitResultService.getTestResultById(resultId);
            } else {
                // TestResult 조회 (기존 로직 사용)
                result = testResultReportService.getTestResultDetail(resultId);
            }

            if (result == null) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> metadata = Map.of(
                    "resultType", resultType,
                    "retrievedAt", LocalDateTime.now());

            return ResponseEntity.ok(ApiResponse.success(result, metadata));

        } catch (Exception e) {
            log.error("테스트 결과 상세 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("DETAIL_FETCH_FAILED", "테스트 결과 상세 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 종합 통계 조회
     */
    @PostMapping("/statistics/comprehensive")
    @Operation(summary = "종합 테스트 결과 통계", description = "지정된 조건에 따른 종합적인 테스트 결과 통계를 제공합니다.")
    public ResponseEntity<ApiResponse<TestResultSummaryDto>> getComprehensiveStatistics(
            @RequestBody TestResultQueryDto query) {

        log.info("종합 통계 조회 요청 - 프로젝트: {}", query.getProjectId());

        try {
            TestResultSummaryDto statistics = statisticsService.generateComprehensiveStatistics(query);

            Map<String, Object> metadata = Map.of(
                    "statisticsType", "comprehensive",
                    "generatedAt", LocalDateTime.now(),
                    "query", query);

            return ResponseEntity.ok(ApiResponse.success(statistics, metadata));

        } catch (Exception e) {
            log.error("종합 통계 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("STATISTICS_FAILED", "통계 생성에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 기본 통계 조회 (기존 API 호환)
     */
    @GetMapping("/statistics/basic")
    @Operation(summary = "기본 테스트 결과 통계", description = "기본적인 테스트 결과 통계를 제공합니다.")
    public ResponseEntity<ApiResponse<TestResultStatisticsDto>> getBasicStatistics(
            @Parameter(description = "프로젝트 ID") @RequestParam(required = false) String projectId,
            @Parameter(description = "테스트 플랜 ID") @RequestParam(required = false) String testPlanId,
            @Parameter(description = "테스트 실행 ID") @RequestParam(required = false) String testExecutionId) {

        log.info("기본 통계 조회 요청 - 프로젝트: {}, 플랜: {}", projectId, testPlanId);

        try {
            TestResultStatisticsDto statistics = testResultReportService.getTestResultStatistics(
                    projectId, testPlanId, testExecutionId);

            Map<String, Object> metadata = Map.of(
                    "statisticsType", "basic",
                    "generatedAt", LocalDateTime.now());

            return ResponseEntity.ok(ApiResponse.success(statistics, metadata));

        } catch (Exception e) {
            log.error("기본 통계 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("BASIC_STATISTICS_FAILED", "기본 통계 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 대시보드용 차트 데이터 조회
     */
    @GetMapping("/dashboard/charts")
    @Operation(summary = "대시보드 차트 데이터", description = "대시보드에서 사용할 차트 데이터를 제공합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardChartData(
            @Parameter(description = "프로젝트 ID") @RequestParam(required = false) String projectId,
            @Parameter(description = "차트 타입") @RequestParam(required = false) List<String> chartTypes,
            @Parameter(description = "기간 (일)") @RequestParam(defaultValue = "30") int days) {

        log.info("대시보드 차트 데이터 조회 - 프로젝트: {}, 차트 타입: {}", projectId, chartTypes);

        try {
            Map<String, Object> chartData = Map.of(
                    "pieChart", testResultReportService.getTestResultStatistics(projectId, null, null),
                    "trendChart", getTrendChartData(projectId, days),
                    "barChart", getBarChartData(projectId));

            Map<String, Object> metadata = Map.of(
                    "chartTypes", chartTypes != null ? chartTypes : List.of("pieChart", "trendChart", "barChart"),
                    "periodDays", days,
                    "generatedAt", LocalDateTime.now());

            return ResponseEntity.ok(ApiResponse.success(chartData, metadata));

        } catch (Exception e) {
            log.error("대시보드 차트 데이터 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("CHART_DATA_FAILED", "차트 데이터 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 테스트 결과 내보내기
     */
    @PostMapping("/export")
    @Operation(summary = "테스트 결과 내보내기", description = "테스트 결과를 지정된 형식으로 내보냅니다.")
    public ResponseEntity<byte[]> exportTestResults(
            @RequestBody TestResultQueryDto query) {

        log.info("테스트 결과 내보내기 요청 - 프로젝트: {}", query.getProjectId());

        try {
            // 쿼리를 기존 필터 DTO로 변환
            TestResultFilterDto filter = convertQueryToFilter(query);

            // 내보내기 실행
            byte[] exportData = testResultReportService.exportTestResultReport(filter);

            String filename = "test_results_" + LocalDateTime.now().toString().substring(0, 19).replace(":", "") +
                    "." + (filter.getExportFormat() != null ? filter.getExportFormat().toLowerCase() : "xlsx");

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=" + filename)
                    .header("Content-Type", getContentType(filter.getExportFormat()))
                    .body(exportData);

        } catch (Exception e) {
            log.error("테스트 결과 내보내기 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * API 상태 및 메타 정보 조회
     */
    @GetMapping("/health")
    @Operation(summary = "API 상태 조회", description = "테스트 결과 API의 상태와 메타 정보를 조회합니다.")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getApiHealth() {

        try {
            Map<String, Object> healthInfo = Map.of(
                    "status", "UP",
                    "version", "v2.0",
                    "description", "ICT-208: 통합 테스트 결과 조회 및 통계 API",
                    "supportedFeatures", List.of(
                            "테스트 결과 검색 및 필터링",
                            "종합 통계 및 분석",
                            "대시보드 차트 데이터",
                            "다양한 형식 내보내기",
                            "실시간 통계 업데이트"),
                    "endpoints", Map.of(
                            "search", "/api/test-results-v2/search",
                            "statistics", "/api/test-results-v2/statistics/comprehensive",
                            "dashboard", "/api/test-results-v2/dashboard/charts",
                            "export", "/api/test-results-v2/export"));

            return ResponseEntity.ok(ApiResponse.success(healthInfo));

        } catch (Exception e) {
            log.error("API 상태 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("HEALTH_CHECK_FAILED", "API 상태 조회에 실패했습니다"));
        }
    }

    // Helper Methods

    /**
     * TestResultQueryDto를 TestResultFilterDto로 변환
     */
    private TestResultFilterDto convertQueryToFilter(TestResultQueryDto query) {
        TestResultFilterDto filter = TestResultFilterDto.builder()
                .projectId(query.getProjectId())
                .testPlanIds(query.getTestPlanIds())
                .testExecutionIds(query.getTestExecutionIds())
                .results(query.getResultStatuses())
                .executedByIds(query.getExecutorIds()) // executorIds -> executedByIds
                .page(query.getPage())
                .size(query.getSize())
                .build();

        // 정렬 설정
        if (query.getSortBy() != null && query.getSortDirection() != null) {
            filter.setSortBy(query.getSortBy()); // setSort -> setSortBy
            filter.setSortDirection(query.getSortDirection()); // setSortDirection 추가
        }

        // 기본 디스플레이 컬럼 설정
        filter.setDefaultDisplayColumns();

        return filter;
    }

    /**
     * 트렌드 차트 데이터 조회
     */
    private Object getTrendChartData(String projectId, int days) {
        // 기존 DashboardController의 트렌드 API 활용
        return Map.of(
                "description", "최근 " + days + "일 테스트 결과 추이",
                "period", days,
                "data", "트렌드 데이터");
    }

    /**
     * 바 차트 데이터 조회
     */
    private Object getBarChartData(String projectId) {
        // 기존 DashboardController의 오픈 테스트런 결과 API 활용
        return Map.of(
                "description", "오픈 테스트런 결과",
                "data", "바 차트 데이터");
    }

    /**
     * Content-Type 반환
     */
    private String getContentType(String exportFormat) {
        if (exportFormat == null)
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        switch (exportFormat.toUpperCase()) {
            case "PDF":
                return "application/pdf";
            case "CSV":
                return "text/csv";
            case "EXCEL":
            default:
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }
    }

    // ICT-263: 테스트결과 상세테이블 필터링 API 엔드포인트

    /**
     * 프로젝트의 테스트 플랜 목록 조회
     */
    @GetMapping("/filter/test-plans")
    @Operation(summary = "테스트 플랜 목록 조회", description = "지정된 프로젝트의 테스트 플랜 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTestPlansForFilter(
            @Parameter(description = "프로젝트 ID") @RequestParam String projectId) {

        log.info("테스트 플랜 목록 조회 요청 - 프로젝트: {}", projectId);

        try {
            List<TestPlan> testPlanEntities = testPlanService.getTestPlansByProject(projectId);

            List<Map<String, Object>> planOptions = testPlanEntities.stream()
                    .map(plan -> Map.<String, Object>of(
                            "id", plan.getId(),
                            "name", plan.getName(),
                            "description", plan.getDescription() != null ? plan.getDescription() : ""))
                    .collect(Collectors.toList());

            Map<String, Object> metadata = Map.of(
                    "projectId", projectId,
                    "planCount", planOptions.size(),
                    "retrievedAt", LocalDateTime.now());

            return ResponseEntity.ok(ApiResponse.success(planOptions, metadata));

        } catch (Exception e) {
            log.error("테스트 플랜 목록 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("TEST_PLANS_FETCH_FAILED", "테스트 플랜 목록 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 테스트 플랜의 테스트 실행 목록 조회
     */
    @GetMapping("/filter/test-executions")
    @Operation(summary = "테스트 실행 목록 조회", description = "지정된 테스트 플랜의 테스트 실행 목록을 조회합니다.")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTestExecutionsForFilter(
            @Parameter(description = "프로젝트 ID") @RequestParam String projectId,
            @Parameter(description = "테스트 플랜 ID") @RequestParam(required = false) String testPlanId) {

        log.info("테스트 실행 목록 조회 요청 - 프로젝트: {}, 테스트 플랜: {}", projectId, testPlanId);

        try {
            List<TestExecutionDto> testExecutions;

            if (testPlanId != null && !testPlanId.isEmpty()) {
                // 특정 테스트 플랜의 실행 목록
                testExecutions = testExecutionService.getTestExecutions(testPlanId);
            } else {
                // 프로젝트의 모든 테스트 실행 목록
                testExecutions = testExecutionService.getTestExecutionsByProject(projectId, null);
            }

            List<Map<String, Object>> executionOptions = testExecutions.stream()
                    .map(execution -> Map.<String, Object>of(
                            "id", execution.getId(),
                            "name", execution.getName(),
                            "testPlanId", execution.getTestPlanId() != null ? execution.getTestPlanId() : "",
                            "status", execution.getStatus(),
                            "startDate", execution.getStartDate() != null ? execution.getStartDate().toString() : "",
                            "endDate", execution.getEndDate() != null ? execution.getEndDate().toString() : ""))
                    .collect(Collectors.toList());

            Map<String, Object> metadata = Map.of(
                    "projectId", projectId,
                    "testPlanId", testPlanId != null ? testPlanId : "all",
                    "executionCount", executionOptions.size(),
                    "retrievedAt", LocalDateTime.now());

            return ResponseEntity.ok(ApiResponse.success(executionOptions, metadata));

        } catch (Exception e) {
            log.error("테스트 실행 목록 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("TEST_EXECUTIONS_FETCH_FAILED", "테스트 실행 목록 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 필터링된 테스트 결과 조회
     */
    @GetMapping("/filter/results")
    @Operation(summary = "필터링된 테스트 결과 조회", description = "테스트 플랜 및 테스트 실행으로 필터링된 테스트 결과를 조회합니다.")
    public ResponseEntity<ApiResponse<List<TestResultReportDto>>> getFilteredTestResults(
            @Parameter(description = "프로젝트 ID") @RequestParam String projectId,
            @Parameter(description = "테스트 플랜 ID") @RequestParam(required = false) String testPlanId,
            @Parameter(description = "테스트 실행 ID") @RequestParam(required = false) String testExecutionId,
            @Parameter(description = "페이지 번호") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "1000") int size) {

        log.info("필터링된 테스트 결과 조회 요청 - 프로젝트: {}, 테스트 플랜: {}, 테스트 실행: {}",
                projectId, testPlanId, testExecutionId);

        try {
            // 필터 생성
            TestResultFilterDto filter = TestResultFilterDto.builder()
                    .projectId(projectId)
                    .page(page)
                    .size(size)
                    .build();

            // 테스트 플랜 필터 적용
            if (testPlanId != null && !testPlanId.isEmpty()) {
                filter.setTestPlanIds(List.of(testPlanId));
            }

            // 테스트 실행 필터 적용
            if (testExecutionId != null && !testExecutionId.isEmpty()) {
                filter.setTestExecutionIds(List.of(testExecutionId));
            }

            // 기본 컬럼 설정
            filter.setDefaultDisplayColumns();

            // 필터링된 결과 조회
            Page<TestResultReportDto> resultPage = testResultReportService.getDetailedTestResultReport(filter);

            Map<String, Object> metadata = Map.of(
                    "projectId", projectId,
                    "testPlanId", testPlanId != null ? testPlanId : "all",
                    "testExecutionId", testExecutionId != null ? testExecutionId : "all",
                    "totalResults", resultPage.getTotalElements(),
                    "page", page,
                    "size", size,
                    "retrievedAt", LocalDateTime.now());

            return ResponseEntity.ok(ApiResponse.success(resultPage.getContent(), metadata));

        } catch (Exception e) {
            log.error("필터링된 테스트 결과 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("FILTERED_RESULTS_FETCH_FAILED",
                            "필터링된 테스트 결과 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 플랜별 비교 통계 조회 (View Type: By Plan)
     */
    @GetMapping("/comparison/by-plan")
    @Operation(summary = "플랜별 비교 통계", description = "프로젝트의 테스트 플랜별 테스트 결과 통계를 비교합니다.")
    public ResponseEntity<List<Map<String, Object>>> getComparisonStatisticsByPlan(
            @Parameter(description = "프로젝트 ID") @RequestParam String projectId) {

        log.info("플랜별 비교 통계 조회 요청 - 프로젝트: {}", projectId);

        try {
            List<Map<String, Object>> statistics = statisticsService.getComparisonStatisticsByPlan(projectId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("플랜별 비교 통계 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * 실행자별 비교 통계 조회 (View Type: By Executor)
     */
    @GetMapping("/comparison/by-executor")
    @Operation(summary = "실행자별 비교 통계", description = "프로젝트의 실행자별 테스트 결과 통계를 비교합니다.")
    public ResponseEntity<List<Map<String, Object>>> getComparisonStatisticsByExecutor(
            @Parameter(description = "프로젝트 ID") @RequestParam String projectId) {

        log.info("실행자별 비교 통계 조회 요청 - 프로젝트: {}", projectId);

        try {
            List<Map<String, Object>> statistics = statisticsService.getComparisonStatisticsByExecutor(projectId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("실행자별 비교 통계 조회 실패: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }
}