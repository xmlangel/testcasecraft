// src/main/java/com/testcase/testcasemanagement/service/TestResultService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TestResultService {

    private final TestExecutionRepository testExecutionRepository;
    private final TestPlanRepository testPlanRepository;
    private final ProjectRepository projectRepository;

    @Autowired
    public TestResultService(TestExecutionRepository testExecutionRepository,
                             TestPlanRepository testPlanRepository,
                             ProjectRepository projectRepository) {
        this.testExecutionRepository = testExecutionRepository;
        this.testPlanRepository = testPlanRepository;
        this.projectRepository = projectRepository;
    }

    // 1. 프로젝트별 테스트 결과
    public Map<String, Object> getTestResultsByProject(String projectId) {
        List<TestExecution> executions = testExecutionRepository.findByProjectId(projectId);
        return aggregateTestResults(executions);
    }

    // 2. 프로젝트별 담당자 테스트 결과
    public List<Map<String, Object>> getTestResultsByProjectAndAssignee(String projectId) {
        List<TestExecution> executions = testExecutionRepository.findByProjectId(projectId);
        return aggregateTestResultsByAssignee(executions);
    }

    // 3. 테스트플랜별 테스트 결과
    public Map<String, Object> getTestResultsByTestPlan(String testPlanId) {
        List<TestExecution> executions = testExecutionRepository.findByTestPlanId(testPlanId);
        return aggregateTestResults(executions);
    }

    // 4. 테스트플랜별 담당자 테스트 결과
    public List<Map<String, Object>> getTestResultsByTestPlanAndAssignee(String testPlanId) {
        List<TestExecution> executions = testExecutionRepository.findByTestPlanId(testPlanId);
        return aggregateTestResultsByAssignee(executions);
    }

    // Helper: 전체 결과 집계
    private Map<String, Object> aggregateTestResults(List<TestExecution> executions) {
        Map<String, Integer> statusCount = new HashMap<>();
        statusCount.put("PASS", 0);
        statusCount.put("FAIL", 0);
        statusCount.put("BLOCKED", 0);
        statusCount.put("SKIPPED", 0);
        statusCount.put("NOTRUN", 0);

        for (TestExecution execution : executions) {
            for (TestResult result : execution.getResults()) {
                String status = result.getResult();
                statusCount.put(status, statusCount.getOrDefault(status, 0) + 1);
            }
        }
        Map<String, Object> result = new HashMap<>();
        result.put("totalCases", statusCount.values().stream().mapToInt(Integer::intValue).sum());
        result.put("statusCount", statusCount);
        return result;
    }

    // Helper: 담당자별 결과 집계 (Assignee 정보가 TestResult에 있다고 가정)
    private List<Map<String, Object>> aggregateTestResultsByAssignee(List<TestExecution> executions) {
        Map<String, Map<String, Integer>> assigneeMap = new HashMap<>();
        for (TestExecution execution : executions) {
            for (TestResult result : execution.getResults()) {
                String assignee = result.getExecutedBy() != null ? String.valueOf(result.getExecutedBy()) : "<not assigned>";
                assigneeMap.putIfAbsent(assignee, new HashMap<>());
                Map<String, Integer> statusCount = assigneeMap.get(assignee);
                String status = result.getResult();
                statusCount.put(status, statusCount.getOrDefault(status, 0) + 1);
            }
        }
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map.Entry<String, Map<String, Integer>> entry : assigneeMap.entrySet()) {
            Map<String, Object> map = new HashMap<>();
            map.put("assignee", entry.getKey());
            map.putAll(entry.getValue());
            list.add(map);
        }
        return list;
    }
}
