// src/main/java/com/testcase/testcasemanagement/controller/TestResultReportController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.service.TestResultReportService;
import org.springframework.beans.factory.annotation.Autowired;
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
}
