// src/main/java/com/testcase/testcasemanagement/controller/TestResultReportController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.JiraStatusSummaryDto;
import com.testcase.testcasemanagement.dto.TestResultFilterDto;
import com.testcase.testcasemanagement.dto.TestResultReportDto;
import com.testcase.testcasemanagement.dto.TestResultStatisticsDto;
import com.testcase.testcasemanagement.service.TestResultReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

import java.util.List;
import java.util.Map;

@Tag(name = "Test Result - Reporting", description = "테스트 결과 보고서 API")
@RestController
@RequestMapping("/api/test-results")
@CrossOrigin(origins = "*")
public class TestResultReportController {

    private final TestResultReportService testResultReportService;

    @Autowired
    public TestResultReportController(TestResultReportService testResultReportService) {
        this.testResultReportService = testResultReportService;
    }

    // 1. 프로젝트별 테스트 결과
    @Operation(summary = "프로젝트별 테스트 결과", description = "특정 프로젝트의 테스트 결과를 요약하여 조회합니다.")
    @GetMapping("/by-project/{projectId}")
    public ResponseEntity<Map<String, Object>> getTestResultsByProject(@PathVariable String projectId) {
        Map<String, Object> result = testResultReportService.getTestResultsByProject(projectId);
        return ResponseEntity.ok(result);
    }

    // 2. 프로젝트별 담당자 테스트 결과
    @Operation(summary = "프로젝트별 담당자 테스트 결과", description = "특정 프로젝트의 담당자별 테스트 결과를 조회합니다.")
    @GetMapping("/by-project/{projectId}/by-assignee")
    public ResponseEntity<List<Map<String, Object>>> getTestResultsByProjectAndAssignee(
            @PathVariable String projectId) {
        List<Map<String, Object>> result = testResultReportService.getTestResultsByProjectAndAssignee(projectId);
        return ResponseEntity.ok(result);
    }

    // 3. 테스트플랜별 테스트 결과
    @Operation(summary = "테스트플랜별 테스트 결과", description = "특정 테스트 계획의 테스트 결과를 요약하여 조회합니다.")
    @GetMapping("/by-testplan/{testPlanId}")
    public ResponseEntity<Map<String, Object>> getTestResultsByTestPlan(@PathVariable String testPlanId) {
        Map<String, Object> result = testResultReportService.getTestResultsByTestPlan(testPlanId);
        return ResponseEntity.ok(result);
    }

    // 4. 테스트플랜별 담당자 테스트 결과
    @Operation(summary = "테스트플랜별 담당자 테스트 결과", description = "특정 테스트 계획의 담당자별 테스트 결과를 조회합니다.")
    @GetMapping("/by-testplan/{testPlanId}/by-assignee")
    public ResponseEntity<List<Map<String, Object>>> getTestResultsByTestPlanAndAssignee(
            @PathVariable String testPlanId) {
        List<Map<String, Object>> result = testResultReportService.getTestResultsByTestPlanAndAssignee(testPlanId);
        return ResponseEntity.ok(result);
    }

    // ========== ICT-185: 새로운 테스트 결과 리포트 API 엔드포인트들 ==========

    /**
     * ICT-185: 테스트 결과 통계 조회
     * Pass/Fail/NotRun/Blocked 통계를 반환
     */
    @Operation(summary = "테스트 결과 통계 조회", description = "Pass/Fail/NotRun/Blocked 통계를 조회합니다.")
    @GetMapping("/statistics")
    public ResponseEntity<TestResultStatisticsDto> getTestResultStatistics(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String testPlanId,
            @RequestParam(required = false) String testExecutionId) {

        TestResultStatisticsDto statistics = testResultReportService.getTestResultStatistics(
                projectId, testPlanId, testExecutionId);
        return ResponseEntity.ok(statistics);
    }

    /**
     * ICT-185: 상세 테스트 결과 리포트 조회 (페이징 지원)
     * 폴더/케이스/결과/시행일자/실행자/비고/JIRA ID 포함
     */
    @Operation(summary = "상세 테스트 결과 리포트 조회", description = "필터 조건을 적용하여 상세 테스트 결과 리포트를 조회합니다.")
    @PostMapping("/report")
    public ResponseEntity<Page<TestResultReportDto>> getDetailedTestResultReport(
            @RequestBody TestResultFilterDto filter) {

        Page<TestResultReportDto> report = testResultReportService.getDetailedTestResultReport(filter);
        return ResponseEntity.ok(report);
    }

    /**
     * ICT-185: 간단한 상세 테스트 결과 리포트 조회 (GET 버전)
     */
    @Operation(summary = "간단한 상세 테스트 결과 리포트 조회", description = "기본 파라미터로 상세 테스트 결과 리포트를 조회합니다.")
    @GetMapping("/report")
    public ResponseEntity<Page<TestResultReportDto>> getDetailedTestResultReportSimple(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String testPlanId,
            @RequestParam(required = false) String testExecutionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        TestResultFilterDto filter = TestResultFilterDto.builder()
                .projectId(projectId)
                .testPlanIds(testPlanId != null ? List.of(testPlanId) : null)
                .testExecutionIds(testExecutionId != null ? List.of(testExecutionId) : null)
                .page(page)
                .size(size)
                .build();

        filter.setDefaultDisplayColumns();
        filter.setDefaultSort();

        Page<TestResultReportDto> report = testResultReportService.getDetailedTestResultReport(filter);
        return ResponseEntity.ok(report);
    }

    /**
     * ICT-185: JIRA 상태 통합 리스트 조회
     * 중복 제거된 JIRA 상태와 연결된 테스트 정보
     */
    @Operation(summary = "JIRA 상태 통합 리스트 조회", description = "테스트 결과와 연동된 JIRA 상태 요약을 조회합니다.")
    @GetMapping("/jira-status")
    public ResponseEntity<List<JiraStatusSummaryDto>> getJiraStatusSummary(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String testPlanId,
            @RequestParam(required = false) Boolean activeOnly,
            @RequestParam(defaultValue = "false") boolean refreshCache) {

        List<JiraStatusSummaryDto> jiraStatus = testResultReportService.getJiraStatusSummary(
                projectId, testPlanId, activeOnly, refreshCache);
        return ResponseEntity.ok(jiraStatus);
    }

    /**
     * ICT-185: 테스트 결과 내보내기 (Excel/PDF/CSV)
     */
    @Operation(summary = "테스트 결과 내보내기", description = "테스트 결과를 Excel, PDF, CSV 형식으로 내보냅니다.")
    @PostMapping("/export")
    public ResponseEntity<byte[]> exportTestResultReport(
            @RequestBody TestResultFilterDto filter) {

        byte[] exportData = testResultReportService.exportTestResultReport(filter);

        String filename = "test_result_report." +
                (filter.getExportFormat() != null ? filter.getExportFormat().toLowerCase() : "xlsx");

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + filename)
                .header("Content-Type", getContentType(filter.getExportFormat()))
                .body(exportData);
    }

    /**
     * ICT-185: 커스텀 필터 저장 및 조회를 위한 엔드포인트들
     */
    @Operation(summary = "필터 프리셋 목록 조회", description = "사용자가 저장한 필터 프리셋 목록을 조회합니다.")
    @GetMapping("/filter-presets")
    public ResponseEntity<List<TestResultFilterDto>> getFilterPresets(
            @RequestParam String userId) {

        List<TestResultFilterDto> presets = testResultReportService.getUserFilterPresets(userId);
        return ResponseEntity.ok(presets);
    }

    @Operation(summary = "필터 프리셋 저장", description = "현재 필터 설정을 프리셋으로 저장합니다.")
    @PostMapping("/filter-presets")
    public ResponseEntity<String> saveFilterPreset(
            @RequestParam String userId,
            @RequestParam String presetName,
            @RequestBody TestResultFilterDto filter) {

        String presetId = testResultReportService.saveUserFilterPreset(userId, presetName, filter);
        return ResponseEntity.ok(presetId);
    }

    // ========== ICT-283: 계층적 상세 리포트 API 엔드포인트들 ==========

    /**
     * ICT-283: 계층적 테스트 결과 상세 리포트 조회
     * 테스트플랜 > 실행 > 케이스 3단계 계층 구조로 반환
     * 미실행 케이스도 포함한 완전한 리포트
     */
    @Operation(summary = "계층적 상세 리포트 조회", description = "테스트플랜 > 실행 > 케이스 3단계 계층 구조의 리포트를 조회합니다.")
    @PostMapping("/detailed-report")
    public ResponseEntity<Map<String, Object>> getHierarchicalTestResultReport(
            @RequestBody TestResultFilterDto filter) {

        Map<String, Object> hierarchicalReport = testResultReportService.getHierarchicalTestResultReport(filter);
        return ResponseEntity.ok(hierarchicalReport);
    }

    /**
     * ICT-283: 계층적 테스트 결과 상세 리포트 조회 (GET 버전)
     */
    @Operation(summary = "계층적 상세 리포트 조회 (GET)", description = "기본 파라미터로 계층적 상세 리포트를 조회합니다.")
    @GetMapping("/detailed-report/{projectId}")
    public ResponseEntity<Map<String, Object>> getHierarchicalTestResultReportSimple(
            @PathVariable String projectId,
            @RequestParam(required = false) String testPlanId,
            @RequestParam(required = false) String testExecutionId,
            @RequestParam(defaultValue = "false") boolean includeNotExecuted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        TestResultFilterDto filter = TestResultFilterDto.builder()
                .projectId(projectId)
                .testPlanIds(testPlanId != null ? List.of(testPlanId) : null)
                .testExecutionIds(testExecutionId != null ? List.of(testExecutionId) : null)
                .includeNotExecuted(includeNotExecuted)
                .page(page)
                .size(size)
                .build();

        Map<String, Object> hierarchicalReport = testResultReportService.getHierarchicalTestResultReport(filter);
        return ResponseEntity.ok(hierarchicalReport);
    }

    /**
     * ICT-283: 계층적 리포트 내보내기 전용 엔드포인트
     * 컬럼 선택 및 계층 구조를 유지한 내보내기
     */
    @Operation(summary = "계층적 리포트 내보내기", description = "계층적 구조를 유지하여 리포트를 내보냅니다.")
    @PostMapping("/export-hierarchical")
    public ResponseEntity<byte[]> exportHierarchicalTestResultReport(
            @RequestBody TestResultFilterDto filter) {

        byte[] exportData = testResultReportService.exportHierarchicalTestResultReport(filter);

        String timestamp = java.time.LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = String.format("hierarchical_test_report_%s.%s",
                timestamp,
                (filter.getExportFormat() != null ? filter.getExportFormat().toLowerCase() : "xlsx"));

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + filename)
                .header("Content-Type", getContentType(filter.getExportFormat()))
                .body(exportData);
    }

    /**
     * ICT-283: 테스트 케이스 완전 목록 조회 (미실행 포함)
     * LEFT JOIN을 통한 모든 테스트 케이스와 실행 결과 조합
     */
    @Operation(summary = "테스트 케이스 완전 목록 조회", description = "미실행 케이스를 포함한 전체 테스트 케이스 실행 현황을 조회합니다.")
    @GetMapping("/complete-cases/{projectId}")
    public ResponseEntity<Page<TestResultReportDto>> getCompleteTestCasesList(
            @PathVariable String projectId,
            @RequestParam(required = false) String testPlanId,
            @RequestParam(required = false) String folderPath,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            @RequestParam(defaultValue = "testCaseName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        Page<TestResultReportDto> completeCases = testResultReportService.getCompleteTestCasesList(
                projectId, testPlanId, folderPath, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(completeCases);
    }

    // Helper method for content type determination
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
}
