// src/main/java/com/testcase/testcasemanagement/controller/DashboardController.java

package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.OpenTestRunAssigneeResultDto;
import com.testcase.testcasemanagement.dto.RecentTestResultDto;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.service.DashboardService;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;
    
    @Autowired
    private TestPlanRepository testPlanRepository;

    /**
     * 테스트 플랜 목록 조회
     *
     * @return 테스트 플랜 목록
     */
    @GetMapping("/test-plans")
    public ResponseEntity<List<TestPlan>> getTestPlans() {
        List<TestPlan> testPlans = testPlanRepository.findAll();
        return ResponseEntity.ok(testPlans);
    }

    /**
     * 전체 최근 테스트케이스 결과 조회
     *
     * @param limit 조회할 결과 개수 (기본값: 10, 최대: 100)
     * @return 최근 테스트 결과 목록
     */
    @GetMapping("/recent-test-results")
    public ResponseEntity<List<RecentTestResultDto>> getRecentTestResults(
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        // 최대 100개로 제한
        if (limit > 100) {
            limit = 100;
        }
        if (limit < 1) {
            limit = 10;
        }
        
        List<RecentTestResultDto> results = dashboardService.getRecentTestResults(limit);
        return ResponseEntity.ok(results);
    }

    /**
     * 특정 프로젝트의 최근 테스트케이스 결과 조회
     *
     * @param projectId 프로젝트 ID
     * @param limit 조회할 결과 개수 (기본값: 10, 최대: 100)
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
     * @param limit 조회할 결과 개수 (기본값: 10, 최대: 100)
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
     * @param limit 조회할 담당자 수 제한 (기본값: 20, 최대: 100)
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
        
        List<OpenTestRunAssigneeResultDto> results = dashboardService.getOpenTestRunAssigneeResultsByProject(projectId, limit);
        return ResponseEntity.ok(results);
    }
}