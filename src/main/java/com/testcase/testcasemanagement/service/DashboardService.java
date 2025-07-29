// src/main/java/com/testcase/testcasemanagement/service/DashboardService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.OpenTestRunAssigneeResultDto;
import com.testcase.testcasemanagement.dto.RecentTestResultDto;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private TestResultRepository testResultRepository;
    
    @Autowired
    private TestCaseRepository testCaseRepository;

    /**
     * 전체 최근 테스트케이스 결과 조회
     *
     * @param limit 조회할 결과 개수 (기본값: 10)
     * @return 최근 테스트 결과 목록
     */
    public List<RecentTestResultDto> getRecentTestResults(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<TestResult> results = testResultRepository.findRecentTestResults(pageable);
        
        return results.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 특정 프로젝트의 최근 테스트케이스 결과 조회
     *
     * @param projectId 프로젝트 ID
     * @param limit 조회할 결과 개수 (기본값: 10)
     * @return 최근 테스트 결과 목록
     */
    public List<RecentTestResultDto> getRecentTestResultsByProject(String projectId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<TestResult> results = testResultRepository.findRecentTestResultsByProject(projectId, pageable);
        
        return results.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 특정 테스트 플랜의 최근 테스트케이스 결과 조회
     *
     * @param testPlanId 테스트 플랜 ID
     * @param limit 조회할 결과 개수 (기본값: 10)
     * @return 최근 테스트 결과 목록
     */
    public List<RecentTestResultDto> getRecentTestResultsByTestPlan(String testPlanId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<TestResult> results = testResultRepository.findRecentTestResultsByTestPlan(testPlanId, pageable);
        
        return results.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 전체 오픈 테스트런 담당자별 테스트케이스 결과 조회
     *
     * @param limit 조회할 담당자 수 제한 (기본값: 50)
     * @return 오픈 테스트런 담당자별 결과 목록
     */
    public List<OpenTestRunAssigneeResultDto> getOpenTestRunAssigneeResults(int limit) {
        List<TestResult> allResults = testResultRepository.findByOpenTestRuns();
        return processAssigneeResults(allResults, limit);
    }

    /**
     * 특정 프로젝트의 오픈 테스트런 담당자별 테스트케이스 결과 조회
     *
     * @param projectId 프로젝트 ID
     * @param limit 조회할 담당자 수 제한 (기본값: 50)
     * @return 오픈 테스트런 담당자별 결과 목록
     */
    public List<OpenTestRunAssigneeResultDto> getOpenTestRunAssigneeResultsByProject(String projectId, int limit) {
        List<TestResult> allResults = testResultRepository.findByOpenTestRunsInProject(projectId);
        return processAssigneeResults(allResults, limit);
    }

    /**
     * 테스트 결과를 담당자별로 그룹화하여 통계 생성
     *
     * @param allResults 모든 테스트 결과
     * @param limit 조회할 담당자 수 제한
     * @return 담당자별 결과 통계 목록
     */
    private List<OpenTestRunAssigneeResultDto> processAssigneeResults(List<TestResult> allResults, int limit) {
        // 테스트 실행별로 그룹화
        Map<String, List<TestResult>> resultsByExecution = allResults.stream()
                .collect(Collectors.groupingBy(tr -> tr.getTestExecution().getId()));

        List<OpenTestRunAssigneeResultDto> assigneeResults = new ArrayList<>();

        for (Map.Entry<String, List<TestResult>> entry : resultsByExecution.entrySet()) {
            String executionId = entry.getKey();
            List<TestResult> executionResults = entry.getValue();

            // 해당 테스트 실행의 담당자별로 그룹화
            Map<String, List<TestResult>> resultsByAssignee = executionResults.stream()
                    .filter(tr -> tr.getExecutedBy() != null)
                    .collect(Collectors.groupingBy(tr -> tr.getExecutedBy().getId()));

            // 담당자별 통계 계산
            for (Map.Entry<String, List<TestResult>> assigneeEntry : resultsByAssignee.entrySet()) {
                String assigneeId = assigneeEntry.getKey();
                List<TestResult> assigneeTestResults = assigneeEntry.getValue();

                if (assigneeTestResults.isEmpty()) continue;

                // 첫 번째 결과에서 기본 정보 추출
                TestResult firstResult = assigneeTestResults.get(0);
                User assignee = firstResult.getExecutedBy();

                // 결과별 카운트 계산
                Map<String, Integer> resultCounts = assigneeTestResults.stream()
                        .collect(Collectors.groupingBy(
                                tr -> tr.getResult() != null ? tr.getResult() : "NOT_RUN",
                                Collectors.collectingAndThen(Collectors.counting(), Math::toIntExact)
                        ));

                int totalTestCases = assigneeTestResults.size();
                int passedTestCases = resultCounts.getOrDefault("PASS", 0);
                int failedTestCases = resultCounts.getOrDefault("FAIL", 0);
                int blockedTestCases = resultCounts.getOrDefault("BLOCKED", 0);
                int notRunTestCases = resultCounts.getOrDefault("NOT_RUN", 0);
                int completedTestCases = passedTestCases + failedTestCases + blockedTestCases;

                // 완료율과 통과율 계산
                double completionRate = totalTestCases > 0 ? (double) completedTestCases / totalTestCases * 100 : 0.0;
                double passRate = completedTestCases > 0 ? (double) passedTestCases / completedTestCases * 100 : 0.0;

                // 마지막 실행 시간 찾기
                LocalDateTime lastExecutedAt = assigneeTestResults.stream()
                        .map(TestResult::getExecutedAt)
                        .filter(Objects::nonNull)
                        .max(LocalDateTime::compareTo)
                        .orElse(null);

                OpenTestRunAssigneeResultDto dto = new OpenTestRunAssigneeResultDto();
                dto.setAssigneeName(assignee.getName());
                dto.setAssigneeUsername(assignee.getUsername());
                dto.setTestExecutionId(firstResult.getTestExecution().getId());
                dto.setTestExecutionName(firstResult.getTestExecution().getName());
                dto.setTotalTestCases(totalTestCases);
                dto.setCompletedTestCases(completedTestCases);
                dto.setPassedTestCases(passedTestCases);
                dto.setFailedTestCases(failedTestCases);
                dto.setBlockedTestCases(blockedTestCases);
                dto.setNotRunTestCases(notRunTestCases);
                dto.setCompletionRate(Math.round(completionRate * 10.0) / 10.0); // 소수점 1자리 반올림
                dto.setPassRate(Math.round(passRate * 10.0) / 10.0); // 소수점 1자리 반올림
                dto.setLastExecutedAt(lastExecutedAt);

                assigneeResults.add(dto);
            }
        }

        // 완료율 기준 내림차순, 마지막 실행 시간 기준 내림차순 정렬
        assigneeResults.sort((a, b) -> {
            int completionCompare = Double.compare(b.getCompletionRate(), a.getCompletionRate());
            if (completionCompare != 0) return completionCompare;
            
            if (a.getLastExecutedAt() == null && b.getLastExecutedAt() == null) return 0;
            if (a.getLastExecutedAt() == null) return 1;
            if (b.getLastExecutedAt() == null) return -1;
            return b.getLastExecutedAt().compareTo(a.getLastExecutedAt());
        });

        // 제한된 수만큼 반환
        return assigneeResults.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    /**
     * TestResult 엔티티를 RecentTestResultDto로 변환
     */
    private RecentTestResultDto convertToDto(TestResult result) {
        RecentTestResultDto dto = new RecentTestResultDto();
        dto.setTestResultId(result.getId());
        dto.setTestCaseId(result.getTestCaseId());
        dto.setResult(result.getResult());
        dto.setNotes(result.getNotes());
        dto.setExecutedAt(result.getExecutedAt());
        
        // 테스트 실행 정보
        if (result.getTestExecution() != null) {
            dto.setTestExecutionId(result.getTestExecution().getId());
            dto.setTestExecutionName(result.getTestExecution().getName());
            
            // 프로젝트 정보
            if (result.getTestExecution().getProject() != null) {
                dto.setProjectId(result.getTestExecution().getProject().getId());
                dto.setProjectName(result.getTestExecution().getProject().getName());
            }
        }
        
        // 실행자 정보
        if (result.getExecutedBy() != null) {
            dto.setExecutedBy(result.getExecutedBy().getUsername());
        }
        
        // 테스트케이스 이름 조회
        if (result.getTestCaseId() != null) {
            TestCase testCase = testCaseRepository.findById(result.getTestCaseId()).orElse(null);
            if (testCase != null) {
                dto.setTestCaseName(testCase.getName());
            }
        }
        
        return dto;
    }
}