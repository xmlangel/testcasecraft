// src/main/java/com/testcase/testcasemanagement/service/TestResultReportService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.JiraStatusSummaryDto;
import com.testcase.testcasemanagement.dto.TestResultFilterDto;
import com.testcase.testcasemanagement.dto.TestResultReportDto;
import com.testcase.testcasemanagement.dto.TestResultStatisticsDto;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TestResultReportService {

    private final TestExecutionRepository testExecutionRepository;
    private final TestPlanRepository testPlanRepository;
    private final ProjectRepository projectRepository;
    private final TestResultRepository testResultRepository;
    private final TestCaseRepository testCaseRepository;
    private final ExportService exportService;

    @Autowired
    public TestResultReportService(TestExecutionRepository testExecutionRepository,
                                   TestPlanRepository testPlanRepository,
                                   ProjectRepository projectRepository,
                                   TestResultRepository testResultRepository,
                                   TestCaseRepository testCaseRepository,
                                   ExportService exportService) {
        this.testExecutionRepository = testExecutionRepository;
        this.testPlanRepository = testPlanRepository;
        this.projectRepository = projectRepository;
        this.testResultRepository = testResultRepository;
        this.testCaseRepository = testCaseRepository;
        this.exportService = exportService;
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
    
    // ========== ICT-185: 새로운 테스트 결과 리포트 메서드들 ==========
    
    /**
     * ICT-185: 테스트 결과 통계 조회
     */
    public TestResultStatisticsDto getTestResultStatistics(String projectId, String testPlanId, String testExecutionId) {
        TestResultStatisticsDto.TestResultStatisticsDtoBuilder builder = TestResultStatisticsDto.builder();
        
        // 필터 조건에 따른 TestResult 조회
        List<TestResult> results;
        
        if (testExecutionId != null) {
            // 특정 테스트 실행 기준
            Optional<TestExecution> execution = testExecutionRepository.findById(testExecutionId);
            results = execution.map(TestExecution::getResults).orElse(new ArrayList<>());
            builder.filterType("TEST_EXECUTION").filterId(testExecutionId);
        } else if (testPlanId != null) {
            // 테스트 플랜 기준
            List<TestExecution> executions = testExecutionRepository.findByTestPlanId(testPlanId);
            results = executions.stream()
                .flatMap(exec -> exec.getResults().stream())
                .collect(Collectors.toList());
            builder.filterType("TEST_PLAN").filterId(testPlanId);
        } else if (projectId != null) {
            // 프로젝트 기준  
            List<TestExecution> executions = testExecutionRepository.findByProjectId(projectId);
            results = executions.stream()
                .flatMap(exec -> exec.getResults().stream())
                .collect(Collectors.toList());
            builder.filterType("PROJECT").filterId(projectId);
        } else {
            // 전체
            results = testResultRepository.findAll();
            builder.filterType("ALL").filterId("all");
        }
        
        // 통계 계산
        TestResultStatisticsDto statistics = builder.build();
        statistics.initializeCounts();
        
        Map<String, Long> jiraStatusDistribution = new HashMap<>();
        Map<String, Long> executorDistribution = new HashMap<>();
        
        for (TestResult result : results) {
            // 기본 카운트 증가
            statistics.setTotalTests(statistics.getTotalTests() + 1);
            
            switch (result.getResult()) {
                case "PASS": statistics.setPassCount(statistics.getPassCount() + 1); break;
                case "FAIL": statistics.setFailCount(statistics.getFailCount() + 1); break;
                case "NOT_RUN": statistics.setNotRunCount(statistics.getNotRunCount() + 1); break;
                case "BLOCKED": statistics.setBlockedCount(statistics.getBlockedCount() + 1); break;
            }
            
            // JIRA 관련 통계
            if (result.hasJiraIssue()) {
                statistics.setJiraLinkedCount(statistics.getJiraLinkedCount() + 1);
                if (result.getJiraSyncStatus() != null && "SYNCED".equals(result.getJiraSyncStatus().toString())) {
                    statistics.setJiraSyncedCount(statistics.getJiraSyncedCount() + 1);
                }
            }
            
            // 실행자별 분포
            if (result.getExecutedBy() != null) {
                String executor = result.getExecutedBy().getUsername();
                executorDistribution.put(executor, executorDistribution.getOrDefault(executor, 0L) + 1);
            }
        }
        
        statistics.setJiraStatusDistribution(jiraStatusDistribution);
        statistics.setExecutorDistribution(executorDistribution);
        
        // 비율 계산
        statistics.calculateRates();
        
        return statistics;
    }
    
    /**
     * ICT-185: 상세 테스트 결과 리포트 조회 (페이징 지원)
     * TODO: 실제 구현에서는 JPA Criteria API나 QueryDSL을 사용하여 동적 쿼리 구현 필요
     */
    public Page<TestResultReportDto> getDetailedTestResultReport(TestResultFilterDto filter) {
        // 기본값 설정
        if (filter.getPage() == null) filter.setDefaultPaging();
        if (filter.getSortBy() == null) filter.setDefaultSort();
        if (filter.getDisplayColumns() == null) filter.setDefaultDisplayColumns();
        
        // 페이징 설정
        Sort sort = Sort.by(
            "DESC".equals(filter.getSortDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC,
            filter.getSortBy()
        );
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);
        
        // 프로젝트 ID 필터링이 있는 경우 해당 프로젝트의 테스트 결과만 조회
        Page<TestResult> resultPage;
        if (filter.getProjectId() != null) {
            // 기존 메서드 사용: findRecentTestResultsByProject는 페이징을 지원하지 않으므로
            // 우선 모든 결과를 가져온 후 수동으로 페이징 처리
            List<TestResult> allResults = testResultRepository.findRecentTestResultsByProject(
                filter.getProjectId(), 
                PageRequest.of(0, Integer.MAX_VALUE)
            );
            
            // 수동 페이징 처리
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), allResults.size());
            
            List<TestResult> pageContent = allResults.subList(start, end);
            resultPage = new PageImpl<>(pageContent, pageable, allResults.size());
        } else {
            // 전체 조회
            resultPage = testResultRepository.findAll(pageable);
        }
        
        return resultPage.map(this::convertToReportDto);
    }
    
    /**
     * ICT-185: JIRA 상태 통합 리스트 조회
     * TODO: JIRA API 연동 및 캐싱 구현 필요
     */
    public List<JiraStatusSummaryDto> getJiraStatusSummary(String projectId, String testPlanId, 
                                                          Boolean activeOnly, boolean refreshCache) {
        // JIRA 이슈가 연결된 테스트 결과들 조회
        List<TestResult> resultsWithJira;
        
        if (projectId != null) {
            List<TestExecution> executions = testExecutionRepository.findByProjectId(projectId);
            resultsWithJira = executions.stream()
                .flatMap(exec -> exec.getResults().stream())
                .filter(TestResult::hasJiraIssue)
                .collect(Collectors.toList());
        } else if (testPlanId != null) {
            List<TestExecution> executions = testExecutionRepository.findByTestPlanId(testPlanId);
            resultsWithJira = executions.stream()
                .flatMap(exec -> exec.getResults().stream())
                .filter(TestResult::hasJiraIssue)
                .collect(Collectors.toList());
        } else {
            resultsWithJira = testResultRepository.findAll().stream()
                .filter(TestResult::hasJiraIssue)
                .collect(Collectors.toList());
        }
        
        // JIRA 이슈 키별로 그룹핑하여 중복 제거
        Map<String, List<TestResult>> groupedByJiraKey = resultsWithJira.stream()
            .collect(Collectors.groupingBy(TestResult::getJiraIssueKey));
        
        List<JiraStatusSummaryDto> summaries = new ArrayList<>();
        
        for (Map.Entry<String, List<TestResult>> entry : groupedByJiraKey.entrySet()) {
            String jiraKey = entry.getKey();
            List<TestResult> relatedResults = entry.getValue();
            
            // 각 JIRA 이슈에 대한 요약 생성
            JiraStatusSummaryDto summary = createJiraStatusSummary(jiraKey, relatedResults);
            
            // activeOnly 필터 적용
            if (activeOnly == null || !activeOnly || summary.isActiveIssue()) {
                summaries.add(summary);
            }
        }
        
        // 최근 테스트 일시 기준으로 정렬
        summaries.sort((a, b) -> {
            if (a.getLatestTestDate() == null && b.getLatestTestDate() == null) return 0;
            if (a.getLatestTestDate() == null) return 1;
            if (b.getLatestTestDate() == null) return -1;
            return b.getLatestTestDate().compareTo(a.getLatestTestDate());
        });
        
        return summaries;
    }
    
    /**
     * ICT-190: 테스트 결과 내보내기 (Excel/PDF/CSV)
     * 실제 라이브러리를 사용한 구현
     */
    public byte[] exportTestResultReport(TestResultFilterDto filter) {
        // 기본값 설정
        if (filter.getDisplayColumns() == null) {
            filter.setAllDisplayColumns(); // 내보내기 시에는 모든 컬럼을 기본으로 표시
        }
        if (filter.getIncludeStatistics() == null) {
            filter.setIncludeStatistics(true); // 통계 정보 포함
        }
        
        // 큰 데이터 처리를 위해 페이지 크기 조정
        if (filter.getSize() == null || filter.getSize() > 10000) {
            filter.setSize(10000); // 최대 10,000건으로 제한
        }
        if (filter.getPage() == null) {
            filter.setPage(0);
        }
        
        // 테스트 결과 데이터 조회
        Page<TestResultReportDto> reportData = getDetailedTestResultReport(filter);
        
        // 형식에 따른 내보내기
        String format = filter.getExportFormat();
        if (format == null) {
            format = "EXCEL"; // 기본값
        }
        
        try {
            switch (format.toUpperCase()) {
                case "EXCEL":
                case "XLSX":
                    return exportService.exportToExcel(reportData, filter);
                    
                case "PDF":
                    return exportService.exportToPdf(reportData, filter);
                    
                case "CSV":
                    return exportService.exportToCsv(reportData, filter);
                    
                default:
                    throw new IllegalArgumentException("지원하지 않는 내보내기 형식입니다: " + format);
            }
        } catch (Exception e) {
            throw new RuntimeException("파일 내보내기 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }
    
    /**
     * ICT-185: 사용자별 필터 프리셋 조회
     * TODO: 사용자별 설정 저장 기능 구현 필요
     */
    public List<TestResultFilterDto> getUserFilterPresets(String userId) {
        // TODO: 실제 사용자별 설정 저장소에서 조회
        return new ArrayList<>();
    }
    
    /**
     * ICT-185: 사용자별 필터 프리셋 저장
     * TODO: 사용자별 설정 저장 기능 구현 필요
     */
    public String saveUserFilterPreset(String userId, String presetName, TestResultFilterDto filter) {
        // TODO: 실제 저장 로직 구현
        return "preset_" + userId + "_" + System.currentTimeMillis();
    }
    
    // ========== Helper Methods ==========
    
    /**
     * TestResult를 TestResultReportDto로 변환
     */
    private TestResultReportDto convertToReportDto(TestResult result) {
        // 테스트 케이스 정보 조회
        TestCase testCase = null;
        String testCaseName = null;
        String folderPath = null;
        
        if (result.getTestCaseId() != null) {
            Optional<TestCase> testCaseOpt = testCaseRepository.findById(result.getTestCaseId());
            if (testCaseOpt.isPresent()) {
                testCase = testCaseOpt.get();
                testCaseName = testCase.getName();
                
                // 폴더 경로 생성 (상위 폴더들을 재귀적으로 찾아서 경로 생성)
                folderPath = buildFolderPath(testCase);
            }
        }
        
        // 테스트 플랜 정보 조회
        String testPlanName = null;
        if (result.getTestExecution() != null && result.getTestExecution().getTestPlanId() != null) {
            Optional<com.testcase.testcasemanagement.model.TestPlan> testPlanOpt = 
                testPlanRepository.findById(result.getTestExecution().getTestPlanId());
            if (testPlanOpt.isPresent()) {
                testPlanName = testPlanOpt.get().getName();
            }
        }
        
        return TestResultReportDto.builder()
            .testCaseId(result.getTestCaseId())
            .testCaseName(testCaseName != null ? testCaseName : "알 수 없는 테스트케이스")
            .folderPath(folderPath != null ? folderPath : "루트")
            .testPlanName(testPlanName)
            .result(result.getResult())
            .executedAt(result.getExecutedAt())
            .executedBy(result.getExecutedBy() != null ? result.getExecutedBy().getId() : null)
            .executorName(result.getExecutedBy() != null ? result.getExecutedBy().getUsername() : null)
            .notes(result.getNotes())
            .jiraIssueKey(result.getJiraIssueKey())
            .jiraIssueUrl(result.getJiraIssueUrl())
            .jiraSyncStatus(result.getJiraSyncStatus() != null ? result.getJiraSyncStatus().toString() : null)
            .testExecutionId(result.getTestExecution() != null ? result.getTestExecution().getId() : null)
            .testExecutionName(result.getTestExecution() != null ? result.getTestExecution().getName() : null)
            .testPlanId(result.getTestExecution() != null ? result.getTestExecution().getTestPlanId() : null)
            .build();
    }
    
    /**
     * 테스트 케이스의 폴더 경로를 재귀적으로 생성
     */
    private String buildFolderPath(TestCase testCase) {
        if (testCase.getParentId() == null) {
            return "루트";
        }
        
        Optional<TestCase> parentOpt = testCaseRepository.findById(testCase.getParentId());
        if (parentOpt.isPresent()) {
            TestCase parent = parentOpt.get();
            String parentPath = buildFolderPath(parent);
            if ("루트".equals(parentPath)) {
                return parent.getName();
            } else {
                return parentPath + "/" + parent.getName();
            }
        }
        
        return "루트";
    }
    
    /**
     * JIRA 이슈에 대한 요약 정보 생성
     */
    private JiraStatusSummaryDto createJiraStatusSummary(String jiraKey, List<TestResult> relatedResults) {
        JiraStatusSummaryDto.JiraStatusSummaryDtoBuilder builder = JiraStatusSummaryDto.builder()
            .jiraIssueKey(jiraKey)
            .linkedTestCount((long) relatedResults.size());
        
        // 테스트 결과 분포 계산
        Map<String, Long> testResultDistribution = relatedResults.stream()
            .collect(Collectors.groupingBy(
                TestResult::getResult,
                Collectors.counting()
            ));
        builder.testResultDistribution(testResultDistribution);
        
        // 최신 테스트 정보
        TestResult latestResult = relatedResults.stream()
            .max(Comparator.comparing(TestResult::getExecutedAt))
            .orElse(null);
        
        if (latestResult != null) {
            builder.latestTestResult(latestResult.getResult())
                   .latestTestDate(latestResult.getExecutedAt())
                   .latestExecutor(latestResult.getExecutedBy() != null ? 
                       latestResult.getExecutedBy().getUsername() : null)
                   .syncStatus(latestResult.getJiraSyncStatus() != null ? 
                       latestResult.getJiraSyncStatus().toString() : null)
                   .lastSyncAt(latestResult.getLastJiraSyncAt())
                   .syncError(latestResult.getJiraSyncError())
                   .jiraIssueUrl(latestResult.getJiraIssueUrl());
        }
        
        // TODO: JIRA API를 통한 실제 이슈 상태, 타입, 우선순위 조회 필요
        builder.currentStatus("Open") // Mock data
               .issueType("Bug")      // Mock data  
               .priority("Medium")    // Mock data
               .summary("Mock JIRA Issue Summary"); // Mock data
        
        builder.createdAt(LocalDateTime.now())
               .updatedAt(LocalDateTime.now());
        
        return builder.build();
    }
}
