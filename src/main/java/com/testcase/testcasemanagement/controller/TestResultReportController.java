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

import java.util.List;
import java.util.Map;

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
    @GetMapping("/by-project/{projectId}")
    public ResponseEntity<Map<String, Object>> getTestResultsByProject(@PathVariable String projectId) {
        Map<String, Object> result = testResultReportService.getTestResultsByProject(projectId);
        return ResponseEntity.ok(result);
    }

    // 2. 프로젝트별 담당자 테스트 결과
    @GetMapping("/by-project/{projectId}/by-assignee")
    public ResponseEntity<List<Map<String, Object>>> getTestResultsByProjectAndAssignee(@PathVariable String projectId) {
        List<Map<String, Object>> result = testResultReportService.getTestResultsByProjectAndAssignee(projectId);
        return ResponseEntity.ok(result);
    }

    // 3. 테스트플랜별 테스트 결과
    @GetMapping("/by-testplan/{testPlanId}")
    public ResponseEntity<Map<String, Object>> getTestResultsByTestPlan(@PathVariable String testPlanId) {
        Map<String, Object> result = testResultReportService.getTestResultsByTestPlan(testPlanId);
        return ResponseEntity.ok(result);
    }

    // 4. 테스트플랜별 담당자 테스트 결과
    @GetMapping("/by-testplan/{testPlanId}/by-assignee")
    public ResponseEntity<List<Map<String, Object>>> getTestResultsByTestPlanAndAssignee(@PathVariable String testPlanId) {
        List<Map<String, Object>> result = testResultReportService.getTestResultsByTestPlanAndAssignee(testPlanId);
        return ResponseEntity.ok(result);
    }
    
    // ========== ICT-185: 새로운 테스트 결과 리포트 API 엔드포인트들 ==========
    
    /**
     * ICT-185: 테스트 결과 통계 조회
     * Pass/Fail/NotRun/Blocked 통계를 반환
     */
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
    @PostMapping("/report")
    public ResponseEntity<Page<TestResultReportDto>> getDetailedTestResultReport(
            @RequestBody TestResultFilterDto filter) {
        
        Page<TestResultReportDto> report = testResultReportService.getDetailedTestResultReport(filter);
        return ResponseEntity.ok(report);
    }
    
    /**
     * ICT-185: 간단한 상세 테스트 결과 리포트 조회 (GET 버전)
     */
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
    @GetMapping("/filter-presets")
    public ResponseEntity<List<TestResultFilterDto>> getFilterPresets(
            @RequestParam String userId) {
        
        List<TestResultFilterDto> presets = testResultReportService.getUserFilterPresets(userId);
        return ResponseEntity.ok(presets);
    }
    
    @PostMapping("/filter-presets")
    public ResponseEntity<String> saveFilterPreset(
            @RequestParam String userId,
            @RequestParam String presetName,
            @RequestBody TestResultFilterDto filter) {
        
        String presetId = testResultReportService.saveUserFilterPreset(userId, presetName, filter);
        return ResponseEntity.ok(presetId);
    }
    
    // Helper method for content type determination
    private String getContentType(String exportFormat) {
        if (exportFormat == null) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        
        switch (exportFormat.toUpperCase()) {
            case "PDF": return "application/pdf";
            case "CSV": return "text/csv";
            case "EXCEL":
            default: return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }
    }
}
