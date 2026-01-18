// src/main/java/com/testcase/testcasemanagement/service/DashboardService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.OpenTestRunAssigneeResultDto;
import com.testcase.testcasemanagement.dto.RecentTestResultDto;
import com.testcase.testcasemanagement.dto.TestResultsTrendDto;
import com.testcase.testcasemanagement.dto.TestCaseStatisticsDto;
import com.testcase.testcasemanagement.dto.TestExecutionProgressDto;
import com.testcase.testcasemanagement.dto.ProjectStatisticsDto;
import com.testcase.testcasemanagement.exception.DashboardException;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private static final Logger logger = LoggerFactory.getLogger(DashboardService.class);

    @Autowired
    private TestResultRepository testResultRepository;
    
    @Autowired
    private TestCaseRepository testCaseRepository;
    
    @Autowired
    private TestExecutionRepository testExecutionRepository;

    // ICT-134: 모니터링 서비스 주입
    @Autowired
    private MonitoringService monitoringService;

    /**
     * 전체 최근 테스트케이스 결과 조회 (ICT-134: 모니터링 추가)
     *
     * @param limit 조회할 결과 개수 (기본값: 10)
     * @return 최근 테스트 결과 목록
     */
    public List<RecentTestResultDto> getRecentTestResults(int limit) {
        return monitoringService.measureDashboardApiTime("getRecentTestResults", () -> {
            try {
                logger.debug("getRecentTestResults with limit: {}", limit);
                
                return monitoringService.measureQueryTime("findRecentTestResults", () -> {
                    Pageable pageable = PageRequest.of(0, limit);
                    List<TestResult> results = testResultRepository.findRecentTestResults(pageable);
                    
                    return results.stream()
                            .map(this::convertToDto)
                            .collect(Collectors.toList());
                });
                
            } catch (Exception e) {
                logger.error("getRecentTestResults 실행 중 오류 발생: {}", e.getMessage());
                throw new DashboardException.DataRetrievalException(
                    "최근 테스트 결과 조회에 실패했습니다: " + e.getMessage(),
                    "RecentTestResults"
                );
            }
        });
    }

    /**
     * 특정 프로젝트의 최근 테스트케이스 결과 조회 (ICT-134: 모니터링 추가)
     *
     * @param projectId 프로젝트 ID
     * @param limit 조회할 결과 개수 (기본값: 10)
     * @return 최근 테스트 결과 목록
     */
    public List<RecentTestResultDto> getRecentTestResultsByProject(String projectId, int limit) {
        return monitoringService.measureDashboardApiTime("getRecentTestResultsByProject", () -> {
            try {
                return monitoringService.measureQueryTime("findRecentTestResultsByProject", () -> {
                    Pageable pageable = PageRequest.of(0, limit);
                    List<TestResult> results = testResultRepository.findRecentTestResultsByProject(projectId, pageable);
                    
                    return results.stream()
                            .map(this::convertToDto)
                            .collect(Collectors.toList());
                });
                
            } catch (Exception e) {
                logger.error("getRecentTestResultsByProject 실행 중 오류 발생 - projectId: {}, error: {}", projectId, e.getMessage());
                throw new DashboardException.DataRetrievalException(
                    "프로젝트별 최근 테스트 결과 조회에 실패했습니다: " + e.getMessage(),
                    "ProjectRecentTestResults"
                );
            }
        });
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

    /**
     * 프로젝트의 테스트케이스 결과 추이 조회
     * ICT-265: 중복 데이터 제거 로직 추가 - 동일한 executionId + testCaseId 조합에서 최신 결과만 사용
     *
     * @param projectId 프로젝트 ID
     * @param startDate 시작 날짜
     * @param endDate 종료 날짜
     * @return 날짜별 테스트 결과 추이 목록
     */
    public List<TestResultsTrendDto> getTestResultsTrend(String projectId, LocalDateTime startDate, LocalDateTime endDate) {
        // ICT-265: 원시 TestResult 데이터를 먼저 가져와서 중복 제거 적용
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
        List<TestResult> allResults = testResultRepository.findRecentTestResultsByProject(projectId, pageable);
        
        // ICT-265: 기간 필터링 (startDate ~ endDate)
        List<TestResult> filteredByDateResults = allResults.stream()
            .filter(result -> {
                if (result.getExecutedAt() == null) return false;
                return !result.getExecutedAt().isBefore(startDate) && !result.getExecutedAt().isAfter(endDate);
            })
            .collect(Collectors.toList());
        
        System.out.println("ICT-265 Debug - getTestResultsTrend 기간 필터 후 개수: " + filteredByDateResults.size());
        
        // ICT-265: ICT-263과 동일한 중복 제거 로직 적용 (통계 계산용)
        Map<String, TestResult> latestResultsMap = filteredByDateResults.stream()
            .collect(Collectors.toMap(
                result -> result.getTestExecution().getId() + "|" + result.getTestCaseId(),
                result -> result,
                (existing, replacement) -> {
                    // executedAt 시간을 비교하여 더 최근 것을 선택
                    if (replacement.getExecutedAt() != null && existing.getExecutedAt() != null) {
                        return replacement.getExecutedAt().isAfter(existing.getExecutedAt()) ? replacement : existing;
                    } else if (replacement.getExecutedAt() != null) {
                        return replacement;
                    } else {
                        return existing;
                    }
                }
            ));
        
        List<TestResult> uniqueResults = new ArrayList<>(latestResultsMap.values());
        System.out.println("ICT-265 Debug - getTestResultsTrend 중복 제거 후 개수: " + uniqueResults.size());
        
        // 날짜별로 그룹화하여 집계 데이터 생성 (중복 제거된 데이터 기준)
        Map<String, Map<String, Integer>> groupedData = uniqueResults.stream()
                .collect(Collectors.groupingBy(
                        result -> {
                            if (result.getExecutedAt() != null) {
                                // LocalDateTime을 YYYY-MM-DD 형식으로 변환
                                return result.getExecutedAt().toLocalDate().toString();
                            } else {
                                return "Unknown";
                            }
                        },
                        LinkedHashMap::new, // 순서 보장
                        Collectors.groupingBy(
                                result -> result.getResult() != null ? result.getResult() : "NOT_RUN",
                                Collectors.collectingAndThen(Collectors.counting(), Math::toIntExact)
                        )
                ));
        
        List<TestResultsTrendDto> trendData = new ArrayList<>();
        
        for (Map.Entry<String, Map<String, Integer>> entry : groupedData.entrySet()) {
            String date = entry.getKey();
            Map<String, Integer> resultCounts = entry.getValue();
            
            int pass = resultCounts.getOrDefault("PASS", 0);
            int fail = resultCounts.getOrDefault("FAIL", 0);
            int blocked = resultCounts.getOrDefault("BLOCKED", 0);
            int skipped = resultCounts.getOrDefault("SKIPPED", 0);
            int notRun = resultCounts.getOrDefault("NOT_RUN", 0);
            
            int total = pass + fail + blocked + skipped + notRun;
            int completed = pass + fail + blocked + skipped;
            int completeRate = total > 0 ? Math.round((float) completed / total * 100) : 0;
            
            TestResultsTrendDto trendDto = new TestResultsTrendDto(
                    date, pass, fail, blocked, skipped, notRun, completeRate, notRun
            );
            trendData.add(trendDto);
        }
        
        return trendData;
    }

    /**
     * 프로젝트의 테스트케이스 상태별 통계 조회
     * ICT-265: 중복 데이터 제거 로직 추가 - 동일한 executionId + testCaseId 조합에서 최신 결과만 사용
     *
     * @param projectId 프로젝트 ID
     * @return 테스트케이스 상태별 통계
     */
    public TestCaseStatisticsDto getTestCaseStatistics(String projectId) {
        // ICT-265: 원시 TestResult 데이터 조회 (중복 포함)
        Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE);
        List<TestResult> allResults = testResultRepository.findRecentTestResultsByProject(projectId, pageable);
        
        // ICT-265: ICT-263과 동일한 중복 제거 로직 적용
        logger.info("ICT-265 Debug - getTestCaseStatistics 중복 제거 전 개수: {}", allResults.size());
        
        Map<String, TestResult> latestResultsMap = allResults.stream()
            .collect(Collectors.toMap(
                result -> result.getTestExecution().getId() + "|" + result.getTestCaseId(),
                result -> result,
                (existing, replacement) -> {
                    // executedAt 시간을 비교하여 더 최근 것을 선택
                    if (replacement.getExecutedAt() != null && existing.getExecutedAt() != null) {
                        return replacement.getExecutedAt().isAfter(existing.getExecutedAt()) ? replacement : existing;
                    } else if (replacement.getExecutedAt() != null) {
                        return replacement;
                    } else {
                        return existing;
                    }
                }
            ));
        
        List<TestResult> uniqueResults = new ArrayList<>(latestResultsMap.values());
        logger.info("ICT-265 Debug - getTestCaseStatistics 중복 제거 후 개수: {}", uniqueResults.size());
        
        // 상태별 카운트 집계 (중복 제거된 데이터 기준)
        Map<String, Integer> statusCounts = new HashMap<>();
        statusCounts.put("PASS", 0);
        statusCounts.put("FAIL", 0);
        statusCounts.put("BLOCKED", 0);
        statusCounts.put("SKIPPED", 0);
        statusCounts.put("NOTRUN", 0);
        
        for (TestResult result : uniqueResults) {
            String status = result.getResult() != null ? result.getResult() : "NOTRUN";
            statusCounts.put(status, statusCounts.getOrDefault(status, 0) + 1);
        }
        
        // TestCaseStatisticsDto 생성
        TestCaseStatisticsDto statistics = new TestCaseStatisticsDto();
        statistics.setTotalCases(uniqueResults.size());
        statistics.setPASS(statusCounts.get("PASS"));
        statistics.setFAIL(statusCounts.get("FAIL"));
        statistics.setBLOCKED(statusCounts.get("BLOCKED"));
        statistics.setSKIPPED(statusCounts.get("SKIPPED"));
        statistics.setNOTRUN(statusCounts.get("NOTRUN"));
        
        return statistics;
    }

    /**
     * 전체 진행 중인 테스트 실행 진행률 조회
     *
     * @param limit 조회할 테스트 실행 수 제한 (기본값: 10)
     * @return 진행 중인 테스트 실행 진행률 목록
     */
    public List<TestExecutionProgressDto> getInProgressTestExecutions(int limit) {
        List<TestExecution> executions = testExecutionRepository.findInProgressExecutions();
        
        return executions.stream()
                .limit(limit)
                .map(this::convertToProgressDto)
                .collect(Collectors.toList());
    }

    /**
     * 특정 프로젝트의 진행 중인 테스트 실행 진행률 조회
     *
     * @param projectId 프로젝트 ID
     * @param limit 조회할 테스트 실행 수 제한 (기본값: 10)
     * @return 진행 중인 테스트 실행 진행률 목록
     */
    public List<TestExecutionProgressDto> getInProgressTestExecutionsByProject(String projectId, int limit) {
        List<TestExecution> executions = testExecutionRepository.findInProgressExecutionsByProject(projectId);
        
        return executions.stream()
                .limit(limit)
                .map(this::convertToProgressDto)
                .collect(Collectors.toList());
    }

    /**
     * TestExecution 엔티티를 TestExecutionProgressDto로 변환
     */
    private TestExecutionProgressDto convertToProgressDto(TestExecution execution) {
        TestExecutionProgressDto dto = new TestExecutionProgressDto();
        
        // 기본 정보
        dto.setTestExecutionId(execution.getId());
        dto.setTestExecutionName(execution.getName());
        dto.setTestPlanId(execution.getTestPlanId());
        dto.setStatus(execution.getStatus());
        dto.setStartDate(execution.getStartDate());
        dto.setEndDate(execution.getEndDate());
        
        // 프로젝트 정보
        if (execution.getProject() != null) {
            dto.setProjectId(execution.getProject().getId());
            dto.setProjectName(execution.getProject().getName());
        }
        
        // 테스트 결과 통계 계산
        List<TestResult> results = execution.getResults();
        if (results != null && !results.isEmpty()) {
            Map<String, Long> resultCounts = results.stream()
                    .collect(Collectors.groupingBy(
                            tr -> tr.getResult() != null ? tr.getResult() : "NOT_RUN",
                            Collectors.counting()
                    ));

            int totalTestCases = results.size();
            int passedTestCases = resultCounts.getOrDefault("PASS", 0L).intValue();
            int failedTestCases = resultCounts.getOrDefault("FAIL", 0L).intValue();
            int blockedTestCases = resultCounts.getOrDefault("BLOCKED", 0L).intValue();
            int skippedTestCases = resultCounts.getOrDefault("SKIPPED", 0L).intValue();
            int notRunTestCases = resultCounts.getOrDefault("NOT_RUN", 0L).intValue();
            int completedTestCases = passedTestCases + failedTestCases + blockedTestCases + skippedTestCases;

            dto.setTotalTestCases(totalTestCases);
            dto.setCompletedTestCases(completedTestCases);
            dto.setPassedTestCases(passedTestCases);
            dto.setFailedTestCases(failedTestCases);
            dto.setBlockedTestCases(blockedTestCases);
            dto.setSkippedTestCases(skippedTestCases);
            dto.setNotRunTestCases(notRunTestCases);

            // 완료율과 통과율 계산
            double completionRate = totalTestCases > 0 ? (double) completedTestCases / totalTestCases * 100 : 0.0;
            double passRate = completedTestCases > 0 ? (double) passedTestCases / completedTestCases * 100 : 0.0;
            
            dto.setCompletionRate(Math.round(completionRate * 10.0) / 10.0); // 소수점 1자리 반올림
            dto.setPassRate(Math.round(passRate * 10.0) / 10.0); // 소수점 1자리 반올림

            // 마지막 실행 시간 찾기
            LocalDateTime lastExecutedAt = results.stream()
                    .map(TestResult::getExecutedAt)
                    .filter(Objects::nonNull)
                    .max(LocalDateTime::compareTo)
                    .orElse(null);
            
            dto.setLastExecutedAt(lastExecutedAt);
        } else {
            // 결과가 없는 경우 기본값 설정
            dto.setTotalTestCases(0);
            dto.setCompletedTestCases(0);
            dto.setPassedTestCases(0);
            dto.setFailedTestCases(0);
            dto.setBlockedTestCases(0);
            dto.setSkippedTestCases(0);
            dto.setNotRunTestCases(0);
            dto.setCompletionRate(0.0);
            dto.setPassRate(0.0);
            dto.setLastExecutedAt(null);
        }
        
        return dto;
    }

    /**
     * ICT-129: 프로젝트 전체 통계 조회
     * ICT-265: 중복 데이터 제거 로직 추가 - Repository 쿼리에서 이미 중복 제거 적용됨
     * 성능 최적화된 방식으로 프로젝트의 종합 통계 정보를 제공합니다.
     *
     * @param projectId 프로젝트 ID
     * @return 프로젝트 전체 통계 DTO
     */
    public ProjectStatisticsDto getProjectStatistics(String projectId) {
        logger.info("ICT-265 Debug - getProjectStatistics 프로젝트 통계 조회 시작: {}", projectId);
        LocalDateTime now = LocalDateTime.now();
        
        // ICT-130: 성능 최적화된 분할 쿼리들을 병렬로 실행
        // ICT-265: Repository 쿼리에서 이미 최신 executed_at 기준 중복 제거 적용됨
        // 1. 기본 통계 데이터 조회
        Map<String, Object> basicStats = testResultRepository.findProjectBasicStatistics(projectId);
        
        // 2. 실행 통계 조회
        Map<String, Object> executionStats = testResultRepository.findProjectExecutionStatistics(projectId);
        
        // 3. 실행 상태 통계 조회  
        Map<String, Object> statusStats = testResultRepository.findProjectExecutionStatusStatistics(projectId);
        
        // 4. 테스트 결과 통계 조회 (ICT-265: Repository 쿼리에서 중복 제거 적용됨)
        Map<String, Object> resultStats = testResultRepository.findProjectResultStatistics(projectId);
        logger.info("ICT-265 Debug - 테스트 결과 통계: {}", resultStats);
        
        // 5. 우선순위별 통계 조회 (ICT-265: Repository 쿼리에서 중복 제거 적용됨)
        Map<String, Object> priorityStats = testResultRepository.findProjectPriorityStatistics(projectId);
        logger.info("ICT-265 Debug - 우선순위별 통계: {}", priorityStats);
        
        // 통계 데이터 병합
        Map<String, Object> statisticsData = new java.util.HashMap<>();
        statisticsData.putAll(basicStats);
        statisticsData.putAll(executionStats); 
        statisticsData.putAll(statusStats);
        statisticsData.putAll(resultStats);
        statisticsData.putAll(priorityStats);
        
        // 2. 일일 변화 추이 계산 (어제 vs 오늘)
        LocalDateTime yesterdayStart = now.minusDays(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime yesterdayEnd = now.minusDays(1).withHour(23).withMinute(59).withSecond(59);
        LocalDateTime todayStart = now.withHour(0).withMinute(0).withSecond(0);
        
        Integer yesterdayExecutions = testResultRepository.countExecutionsByDateRange(
            projectId, yesterdayStart, yesterdayEnd);
        Integer todayExecutions = testResultRepository.countExecutionsByDateRange(
            projectId, todayStart, now);
        
        // 3. 주간 변화 추이 계산 (지난주 vs 이번주)
        LocalDateTime lastWeekStart = now.minusDays(7).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime lastWeekEnd = now.minusDays(1).withHour(23).withMinute(59).withSecond(59);
        LocalDateTime thisWeekStart = now.minusDays(now.getDayOfWeek().getValue() - 1).withHour(0).withMinute(0).withSecond(0);
        
        Integer lastWeekExecutions = testResultRepository.countExecutionsByDateRange(
            projectId, lastWeekStart, lastWeekEnd);
        Integer thisWeekExecutions = testResultRepository.countExecutionsByDateRange(
            projectId, thisWeekStart, now);
        
        // 4. 최근 7일/30일 평균 통과율 계산
        LocalDateTime last7DaysStart = now.minusDays(7);
        LocalDateTime last30DaysStart = now.minusDays(30);
        
        Double averagePassRate7Days = testResultRepository.calculateAveragePassRateByPeriod(
            projectId, last7DaysStart, now);
        Double averagePassRate30Days = testResultRepository.calculateAveragePassRateByPeriod(
            projectId, last30DaysStart, now);
        
        // 5. 최근 7일 중요 실패 수 조회
        Integer criticalFailures7Days = testResultRepository.countCriticalFailuresByPeriod(
            projectId, last7DaysStart, now);
        
        // 6. DTO 변환 및 계산
        ProjectStatisticsDto dto = convertToProjectStatisticsDto(statisticsData, projectId);
        
        // 변화율 계산
        dto.setYesterdayExecutions(yesterdayExecutions != null ? yesterdayExecutions : 0);
        dto.setLastWeekExecutions(lastWeekExecutions != null ? lastWeekExecutions : 0);
        
        // 일일 변화율 계산
        double dailyChangeRate = 0.0;
        if (yesterdayExecutions != null && yesterdayExecutions > 0) {
            dailyChangeRate = ((double) (todayExecutions - yesterdayExecutions) / yesterdayExecutions) * 100;
        }
        dto.setDailyChangeRate(Math.round(dailyChangeRate * 100.0) / 100.0);
        
        // 주간 변화율 계산
        double weeklyChangeRate = 0.0;
        if (lastWeekExecutions != null && lastWeekExecutions > 0) {
            weeklyChangeRate = ((double) (thisWeekExecutions - lastWeekExecutions) / lastWeekExecutions) * 100;
        }
        dto.setWeeklyChangeRate(Math.round(weeklyChangeRate * 100.0) / 100.0);
        
        // 평균 통과율 설정
        dto.setAveragePassRateLast7Days(averagePassRate7Days != null ? averagePassRate7Days : 0.0);
        dto.setAveragePassRateLast30Days(averagePassRate30Days != null ? averagePassRate30Days : 0.0);
        dto.setCriticalFailuresLast7Days(criticalFailures7Days != null ? criticalFailures7Days : 0);
        
        // 통과율 계산 (ICT-265: 중복 제거된 데이터 기준)
        Integer executedCases = dto.getExecutedTestCases();
        Integer passedCases = dto.getPassedTestCases();
        if (executedCases != null && executedCases > 0) {
            double passRate = (passedCases != null ? passedCases : 0) * 100.0 / executedCases;
            dto.setPassRate(Math.round(passRate * 100.0) / 100.0);
            logger.info("ICT-265 Debug - 통과율 계산: {}개 중 {}개 통과 = {}%", executedCases, passedCases, dto.getPassRate());
        } else {
            dto.setPassRate(0.0);
            logger.info("ICT-265 Debug - 통과율 계산: 실행된 테스트가 없어 0%");
        }
        
        // 테스트 커버리지 계산 (실행된 케이스 / 전체 케이스)
        Integer totalCases = dto.getTotalTestCases();
        if (totalCases != null && totalCases > 0) {
            double testCoverage = (executedCases != null ? executedCases : 0) * 100.0 / totalCases;
            dto.setTestCoverage(Math.round(testCoverage * 100.0) / 100.0);
        } else {
            dto.setTestCoverage(0.0);
        }
        
        // 메타 정보 설정
        dto.setCalculatedAt(now);
        dto.setDataFreshnessMinutes(0); // 실시간 계산
        
        return dto;
    }

    /**
     * 통계 쿼리 결과를 ProjectStatisticsDto로 변환
     */
    private ProjectStatisticsDto convertToProjectStatisticsDto(Map<String, Object> data, String projectId) {
        ProjectStatisticsDto dto = new ProjectStatisticsDto();
        
        dto.setProjectId(projectId);
        // 프로젝트 이름은 별도 조회가 필요하므로 일단 ID로 설정
        dto.setProjectName("Project " + projectId);
        
        // 기본 통계 설정
        dto.setTotalTestCases(getIntegerFromMap(data, "total_test_cases"));
        dto.setTotalTestPlans(getIntegerFromMap(data, "total_test_plans"));
        dto.setTotalTestExecutions(getIntegerFromMap(data, "total_test_executions"));
        
        // 실행 통계 설정
        dto.setExecutedTestCases(getIntegerFromMap(data, "executed_test_cases"));
        dto.setExecutionRate(getDoubleFromMap(data, "execution_rate"));
        dto.setPassedTestCases(getIntegerFromMap(data, "passed_test_cases"));
        dto.setFailedTestCases(getIntegerFromMap(data, "failed_test_cases"));
        dto.setBlockedTestCases(getIntegerFromMap(data, "blocked_test_cases"));
        dto.setSkippedTestCases(getIntegerFromMap(data, "skipped_test_cases"));
        dto.setNotRunTestCases(getIntegerFromMap(data, "not_run_test_cases"));
        
        // 진행 상황 설정
        dto.setActiveTestExecutions(getIntegerFromMap(data, "active_test_executions"));
        dto.setCompletedTestExecutions(getIntegerFromMap(data, "completed_test_executions"));
        dto.setPausedTestExecutions(getIntegerFromMap(data, "paused_test_executions"));
        
        // 우선순위별 활성 케이스 설정
        dto.setActivePriorityHighCases(getIntegerFromMap(data, "active_priority_high_cases"));
        dto.setActivePriorityMediumCases(getIntegerFromMap(data, "active_priority_medium_cases"));
        dto.setActivePriorityLowCases(getIntegerFromMap(data, "active_priority_low_cases"));
        
        // 시간 정보 설정
        Object lastExecutionObj = data.get("last_execution_date");
        if (lastExecutionObj instanceof LocalDateTime) {
            dto.setLastExecutionDate((LocalDateTime) lastExecutionObj);
        }
        
        return dto;
    }

    /**
     * Map에서 Integer 값을 안전하게 추출하는 헬퍼 메소드
     */
    private Integer getIntegerFromMap(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) {
            return 0;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return 0;
    }

    /**
     * Map에서 Double 값을 안전하게 추출하는 헬퍼 메소드
     */
    private Double getDoubleFromMap(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) {
            return 0.0;
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return 0.0;
    }
    

    // ===============================
    // ICT-134: 모니터링 관련 헬퍼 메서드들
    // ===============================


    /**
     * 대시보드 성능 메트릭을 정기적으로 로그에 기록하는 메서드
     * 스케줄링을 통해 주기적으로 호출됩니다.
     */
    public void logDashboardPerformanceMetrics() {
        try {
            monitoringService.logPerformanceMetrics();
            logger.info("대시보드 성능 메트릭이 로그에 기록되었습니다.");
        } catch (Exception e) {
            logger.error("대시보드 성능 메트릭 로그 기록 중 오류 발생: {}", e.getMessage());
        }
    }

    /**
     * 시스템 상태를 확인하고 임계값 초과 시 알림을 발생시킵니다.
     */
    public void checkSystemHealthThresholds() {
        try {
            // 메모리 사용률 확인
            Runtime runtime = Runtime.getRuntime();
            long usedMemory = runtime.totalMemory() - runtime.freeMemory();
            double memoryUsage = (double) usedMemory / runtime.maxMemory();
            
            if (memoryUsage > 0.8) {
                logger.warn("⚠️ 높은 메모리 사용률 감지: {:.1f}%", memoryUsage * 100);
            }
            
            // 동시 사용자 수 확인
            long concurrentUsers = monitoringService.getCurrentConcurrentUsers();
            if (concurrentUsers > 100) {
                logger.warn("⚠️ 높은 동시 사용자 수 감지: {} users", concurrentUsers);
            }
            
            // 캐시 히트율 확인
            double cacheHitRate = monitoringService.calculateCacheHitRate("dashboard");
            if (cacheHitRate < 0.7) {
                logger.warn("⚠️ 낮은 캐시 히트율 감지: {:.1f}%", cacheHitRate * 100);
            }
            
        } catch (Exception e) {
            logger.error("시스템 헬스 임계값 확인 중 오류 발생: {}", e.getMessage());
        }
    }
}