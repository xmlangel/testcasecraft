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
                String assignee = result.getExecutedBy() != null ? String.valueOf(result.getExecutedBy())
                        : "<not assigned>";
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
    public TestResultStatisticsDto getTestResultStatistics(String projectId, String testPlanId,
            String testExecutionId) {
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
                case "PASS":
                    statistics.setPassCount(statistics.getPassCount() + 1);
                    break;
                case "FAIL":
                    statistics.setFailCount(statistics.getFailCount() + 1);
                    break;
                case "NOT_RUN":
                    statistics.setNotRunCount(statistics.getNotRunCount() + 1);
                    break;
                case "BLOCKED":
                    statistics.setBlockedCount(statistics.getBlockedCount() + 1);
                    break;
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
     */
    public Page<TestResultReportDto> getDetailedTestResultReport(TestResultFilterDto filter) {
        // 기본값 설정
        if (filter.getPage() == null)
            filter.setDefaultPaging();
        if (filter.getSortBy() == null)
            filter.setDefaultSort();
        if (filter.getDisplayColumns() == null)
            filter.setDefaultDisplayColumns();

        // 페이징 설정
        Sort sort = Sort.by(
                "DESC".equals(filter.getSortDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC,
                filter.getSortBy());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        // 프로젝트 ID 필터링이 있는 경우 해당 프로젝트의 테스트 결과만 조회
        Page<TestResult> resultPage;
        if (filter.getProjectId() != null) {
            // 기존 메서드 사용: findRecentTestResultsByProject는 페이징을 지원하지 않으므로
            // 우선 모든 결과를 가져온 후 수동으로 페이징 처리
            List<TestResult> allResults = testResultRepository.findRecentTestResultsByProject(
                    filter.getProjectId(),
                    PageRequest.of(0, Integer.MAX_VALUE));

            // ICT-263: 테스트 플랜 및 테스트 실행 필터 적용
            List<TestResult> filteredResults = allResults;

            // 테스트 플랜 ID 필터링
            if (filter.getTestPlanIds() != null && !filter.getTestPlanIds().isEmpty()) {
                System.out.println("ICT-263 Debug - TestPlan 필터 적용: " + filter.getTestPlanIds() + " → 필터 전 개수: "
                        + filteredResults.size());
                filteredResults = filteredResults.stream()
                        .filter(result -> {
                            if (result.getTestExecution() != null
                                    && result.getTestExecution().getTestPlanId() != null) {
                                String testPlanId = result.getTestExecution().getTestPlanId();
                                return filter.getTestPlanIds().contains(testPlanId);
                            }
                            return false;
                        })
                        .collect(Collectors.toList());
                System.out.println("ICT-263 Debug - TestPlan 필터 적용 후 개수: " + filteredResults.size());
            }

            // 테스트 실행 ID 필터링
            if (filter.getTestExecutionIds() != null && !filter.getTestExecutionIds().isEmpty()) {
                System.out.println("ICT-263 Debug - TestExecution 필터 적용: " + filter.getTestExecutionIds()
                        + " → 필터 전 개수: " + filteredResults.size());
                filteredResults = filteredResults.stream()
                        .filter(result -> {
                            if (result.getTestExecution() != null) {
                                String testExecutionId = result.getTestExecution().getId();
                                return filter.getTestExecutionIds().contains(testExecutionId);
                            }
                            return false;
                        })
                        .collect(Collectors.toList());
                System.out.println("ICT-263 Debug - TestExecution 필터 적용 후 개수: " + filteredResults.size());
            }

            // ICT-263 추가: 동일한 executionId + testCaseId 조합에서 최신 결과만 유지 (중복 제거)
            System.out.println("ICT-263 Debug - 중복 제거 전 개수: " + filteredResults.size());

            Map<String, TestResult> latestResultsMap = filteredResults.stream()
                    .collect(Collectors.toMap(
                            result -> result.getTestExecution().getId() + "|" + result.getTestCaseId(),
                            result -> result,
                            (existing, replacement) -> {
                                // executedAt 시간을 비교하여 더 최근 것을 선택
                                if (replacement.getExecutedAt() != null && existing.getExecutedAt() != null) {
                                    return replacement.getExecutedAt().isAfter(existing.getExecutedAt()) ? replacement
                                            : existing;
                                } else if (replacement.getExecutedAt() != null) {
                                    return replacement;
                                } else {
                                    return existing;
                                }
                            }));

            filteredResults = new ArrayList<>(latestResultsMap.values());
            System.out.println("ICT-263 Debug - 중복 제거 후 개수: " + filteredResults.size());

            // 수동 페이징 처리
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filteredResults.size());

            System.out
                    .println("DEBUG PAGINATION: start=" + start + ", end=" + end + ", size=" + filteredResults.size());

            List<TestResult> pageContent;
            if (start >= filteredResults.size() || start > end) {
                System.out.println("DEBUG PAGINATION: Returning empty list due to invalid range");
                pageContent = new ArrayList<>();
            } else {
                try {
                    pageContent = filteredResults.subList(start, end);
                } catch (IndexOutOfBoundsException e) {
                    System.out.println("ERROR PAGINATION: " + e.getMessage());
                    e.printStackTrace();
                    pageContent = new ArrayList<>();
                }
            }
            resultPage = new PageImpl<>(pageContent, pageable, filteredResults.size());
        } else {
            // 전체 조회
            resultPage = testResultRepository.findAll(pageable);
        }

        return resultPage.map(this::convertToReportDto);
    }

    /**
     * ICT-185: JIRA 상태 통합 리스트 조회
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
            if (a.getLatestTestDate() == null && b.getLatestTestDate() == null)
                return 0;
            if (a.getLatestTestDate() == null)
                return 1;
            if (b.getLatestTestDate() == null)
                return -1;
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
     */
    public List<TestResultFilterDto> getUserFilterPresets(String userId) {
        return new ArrayList<>();
    }

    /**
     * ICT-185: 사용자별 필터 프리셋 저장
     */
    public String saveUserFilterPreset(String userId, String presetName, TestResultFilterDto filter) {
        return "preset_" + userId + "_" + System.currentTimeMillis();
    }

    // ========== ICT-283: 계층적 상세 리포트 메서드들 ==========

    /**
     * ICT-283: 계층적 테스트 결과 상세 리포트 조회
     * 테스트플랜 > 실행 > 케이스 3단계 계층 구조로 반환
     */
    public Map<String, Object> getHierarchicalTestResultReport(TestResultFilterDto filter) {
        // 필터 검증
        if (filter.getProjectId() == null) {
            throw new IllegalArgumentException("Project ID is required for hierarchical report");
        }

        // 계층적 리포트 기본값 설정
        if (filter.getHierarchicalStructure() == null) {
            filter.setHierarchicalReportDefaults();
        }

        Map<String, Object> result = new HashMap<>();

        try {
            // 1. 프로젝트의 모든 테스트 플랜 조회
            List<Map<String, Object>> testPlans = getTestPlansWithHierarchy(filter);

            // 2. 계층적 데이터 구성
            result.put("projectId", filter.getProjectId());
            result.put("hierarchicalStructure", true);
            result.put("includeNotExecuted", filter.getIncludeNotExecuted());
            result.put("testPlans", testPlans);
            result.put("totalPlans", testPlans.size());

            // 3. 전체 통계 계산
            Map<String, Object> statistics = calculateHierarchicalStatistics(testPlans);
            result.put("statistics", statistics);

            // 4. 메타데이터
            result.put("generatedAt", LocalDateTime.now());
            result.put("displayColumns", filter.getDisplayColumns());

            return result;

        } catch (Exception e) {
            throw new RuntimeException("계층적 리포트 조회 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * ICT-283: 계층적 리포트 내보내기
     */
    public byte[] exportHierarchicalTestResultReport(TestResultFilterDto filter) {
        // 계층적 리포트 데이터 조회
        Map<String, Object> hierarchicalReport = getHierarchicalTestResultReport(filter);

        // 형식에 따른 내보내기
        String format = filter.getExportFormat();
        if (format == null) {
            format = "EXCEL";
        }

        try {
            // For now, use existing export methods with flattened data
            List<TestResultReportDto> flattenedData = new ArrayList<>();
            // Extract all test result data from hierarchical structure
            // This is a simplified approach - in a real implementation, we'd want proper
            // hierarchical export
            switch (format.toUpperCase()) {
                case "EXCEL":
                case "XLSX":
                    // Use existing export method with empty page for now
                    return new byte[0]; // Placeholder - implement hierarchical Excel export

                case "PDF":
                    // Use existing export method with empty page for now
                    return new byte[0]; // Placeholder - implement hierarchical PDF export

                case "CSV":
                    // Use existing export method with empty page for now
                    return new byte[0]; // Placeholder - implement hierarchical CSV export

                default:
                    throw new IllegalArgumentException("지원하지 않는 내보내기 형식입니다: " + format);
            }
        } catch (Exception e) {
            throw new RuntimeException("계층적 리포트 내보내기 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * ICT-283: 미실행 케이스 포함 완전한 테스트 케이스 목록 조회
     */
    public Page<TestResultReportDto> getCompleteTestCasesList(String projectId, String testPlanId,
            String folderPath, int page, int size, String sortBy, String sortDirection) {

        Pageable pageable = PageRequest.of(page, size,
                Sort.Direction.fromString(sortDirection), sortBy);

        try {
            // LEFT JOIN을 통한 완전한 데이터 조회 (미실행 케이스 포함)
            List<TestResultReportDto> completeCases = getCompleteTestCasesWithResults(
                    projectId, testPlanId, folderPath);

            // 정렬 적용
            completeCases = applySorting(completeCases, sortBy, sortDirection);

            // 페이징 적용
            int start = page * size;
            int end = Math.min(start + size, completeCases.size());

            System.out.println(
                    "DEBUG COMPLETE CASES: start=" + start + ", end=" + end + ", size=" + completeCases.size());

            List<TestResultReportDto> pagedCases;
            if (start >= completeCases.size() || start > end) {
                pagedCases = new ArrayList<>();
            } else {
                try {
                    pagedCases = completeCases.subList(start, end);
                } catch (IndexOutOfBoundsException e) {
                    System.out.println("ERROR COMPLETE CASES: " + e.getMessage());
                    pagedCases = new ArrayList<>();
                }
            }

            return new PageImpl<>(pagedCases, pageable, completeCases.size());

        } catch (Exception e) {
            throw new RuntimeException("완전한 테스트 케이스 목록 조회 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    // ========== ICT-283: 계층적 리포트 헬퍼 메서드들 ==========

    /**
     * 테스트 플랜별 계층적 데이터 조회
     */
    private List<Map<String, Object>> getTestPlansWithHierarchy(TestResultFilterDto filter) {
        List<Map<String, Object>> testPlans = new ArrayList<>();

        // 프로젝트의 테스트 플랜 조회 (필터 조건 적용)
        List<com.testcase.testcasemanagement.model.TestPlan> plans = getFilteredTestPlans(filter);

        for (com.testcase.testcasemanagement.model.TestPlan plan : plans) {
            Map<String, Object> planData = new HashMap<>();
            planData.put("id", plan.getId());
            planData.put("name", plan.getName());
            planData.put("description", plan.getDescription());
            planData.put("createdAt", plan.getCreatedAt());

            // 해당 플랜의 테스트 실행들 조회
            List<Map<String, Object>> executions = getTestExecutionsWithHierarchy(plan.getId(), filter);
            planData.put("executions", executions);
            planData.put("totalExecutions", executions.size());

            // 플랜 통계 계산
            Map<String, Object> planStatistics = calculatePlanStatistics(executions);
            planData.put("statistics", planStatistics);

            testPlans.add(planData);
        }

        return testPlans;
    }

    /**
     * 테스트 실행별 계층적 데이터 조회
     */
    private List<Map<String, Object>> getTestExecutionsWithHierarchy(String testPlanId, TestResultFilterDto filter) {
        List<Map<String, Object>> executions = new ArrayList<>();

        // 테스트 플랜의 실행들 조회
        List<TestExecution> testExecutions = getFilteredTestExecutions(testPlanId, filter);

        for (TestExecution execution : testExecutions) {
            Map<String, Object> executionData = new HashMap<>();
            executionData.put("id", execution.getId());
            executionData.put("name", execution.getName());
            executionData.put("description", execution.getDescription());
            executionData.put("executedAt", execution.getStartDate()); // Using startDate as executedAt
            executionData.put("executedBy", "System"); // Default value since executedBy field doesn't exist

            // 해당 실행의 테스트 케이스 결과들 조회 (미실행 포함)
            List<TestResultReportDto> testCases = getTestCasesWithResults(execution.getId(), filter);
            executionData.put("testCases", testCases);
            executionData.put("totalTestCases", testCases.size());

            // 실행 통계 계산
            Map<String, Object> executionStatistics = calculateExecutionStatistics(testCases);
            executionData.put("statistics", executionStatistics);

            executions.add(executionData);
        }

        return executions;
    }

    /**
     * LEFT JOIN을 통한 완전한 테스트 케이스와 결과 조회
     */
    private List<TestResultReportDto> getCompleteTestCasesWithResults(String projectId,
            String testPlanId, String folderPath) {

        // 직접 SQL 쿼리를 사용하여 LEFT JOIN 수행
        // 이 부분은 Repository에서 @Query를 통해 구현하거나
        // EntityManager를 사용한 네이티브 쿼리로 구현해야 함

        List<TestResultReportDto> completeCases = new ArrayList<>();

        // SELECT tc.*, tr.result, tr.executed_at, tr.executed_by, tr.notes
        // FROM test_case tc
        // LEFT JOIN test_result tr ON tc.id = tr.test_case_id
        // WHERE tc.project_id = ?
        // [AND tc.test_plan_id = ?]
        // [AND tc.folder_path LIKE ?]

        return completeCases;
    }

    /**
     * 필터 조건에 맞는 테스트 플랜들 조회
     */
    private List<com.testcase.testcasemanagement.model.TestPlan> getFilteredTestPlans(TestResultFilterDto filter) {
        if (filter.getTestPlanIds() != null && !filter.getTestPlanIds().isEmpty()) {
            return testPlanRepository.findAllById(filter.getTestPlanIds());
        } else {
            return testPlanRepository.findByProjectId(filter.getProjectId());
        }
    }

    /**
     * 필터 조건에 맞는 테스트 실행들 조회
     */
    private List<TestExecution> getFilteredTestExecutions(String testPlanId, TestResultFilterDto filter) {
        if (filter.getTestExecutionIds() != null && !filter.getTestExecutionIds().isEmpty()) {
            // Use findAllById and then filter by testPlanId as a workaround
            return testExecutionRepository.findAllById(filter.getTestExecutionIds())
                    .stream()
                    .filter(execution -> testPlanId.equals(execution.getTestPlanId()))
                    .toList();
        } else {
            return testExecutionRepository.findByTestPlanId(testPlanId);
        }
    }

    /**
     * 테스트 실행의 케이스 결과들 조회 (미실행 포함)
     */
    private List<TestResultReportDto> getTestCasesWithResults(String executionId, TestResultFilterDto filter) {
        // Use a different approach since findByTestExecutionId doesn't exist
        // Find the execution and then get its results
        TestExecution execution = testExecutionRepository.findById(executionId).orElse(null);
        if (execution != null && execution.getResults() != null) {
            return execution.getResults().stream()
                    .map(this::convertToReportDto)
                    .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }

    /**
     * 계층적 통계 계산
     */
    private Map<String, Object> calculateHierarchicalStatistics(List<Map<String, Object>> testPlans) {
        Map<String, Object> stats = new HashMap<>();

        int totalPlans = testPlans.size();
        int totalExecutions = 0;
        int totalTestCases = 0;
        int totalPassed = 0;
        int totalFailed = 0;
        int totalBlocked = 0;
        int totalNotRun = 0;

        for (Map<String, Object> plan : testPlans) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> executions = (List<Map<String, Object>>) plan.get("executions");
            totalExecutions += executions.size();

            for (Map<String, Object> execution : executions) {
                @SuppressWarnings("unchecked")
                List<TestResultReportDto> testCases = (List<TestResultReportDto>) execution.get("testCases");
                totalTestCases += testCases.size();

                for (TestResultReportDto testCase : testCases) {
                    switch (testCase.getResult() != null ? testCase.getResult() : "NOT_RUN") {
                        case "PASS":
                            totalPassed++;
                            break;
                        case "FAIL":
                            totalFailed++;
                            break;
                        case "BLOCKED":
                            totalBlocked++;
                            break;
                        default:
                            totalNotRun++;
                            break;
                    }
                }
            }
        }

        stats.put("totalPlans", totalPlans);
        stats.put("totalExecutions", totalExecutions);
        stats.put("totalTestCases", totalTestCases);
        stats.put("totalPassed", totalPassed);
        stats.put("totalFailed", totalFailed);
        stats.put("totalBlocked", totalBlocked);
        stats.put("totalNotRun", totalNotRun);

        // 비율 계산
        if (totalTestCases > 0) {
            stats.put("passRate", Math.round((double) totalPassed / totalTestCases * 100.0 * 100.0) / 100.0);
            stats.put("executionRate",
                    Math.round((double) (totalTestCases - totalNotRun) / totalTestCases * 100.0 * 100.0) / 100.0);
        } else {
            stats.put("passRate", 0.0);
            stats.put("executionRate", 0.0);
        }

        return stats;
    }

    /**
     * 플랜 통계 계산
     */
    private Map<String, Object> calculatePlanStatistics(List<Map<String, Object>> executions) {
        // 플랜별 통계 계산 로직
        return new HashMap<>();
    }

    /**
     * 실행 통계 계산
     */
    private Map<String, Object> calculateExecutionStatistics(List<TestResultReportDto> testCases) {
        Map<String, Object> stats = new HashMap<>();

        int passed = 0, failed = 0, blocked = 0, notRun = 0;

        for (TestResultReportDto testCase : testCases) {
            switch (testCase.getResult() != null ? testCase.getResult() : "NOT_RUN") {
                case "PASS":
                    passed++;
                    break;
                case "FAIL":
                    failed++;
                    break;
                case "BLOCKED":
                    blocked++;
                    break;
                default:
                    notRun++;
                    break;
            }
        }

        stats.put("totalCases", testCases.size());
        stats.put("passed", passed);
        stats.put("failed", failed);
        stats.put("blocked", blocked);
        stats.put("notRun", notRun);

        if (testCases.size() > 0) {
            stats.put("passRate", Math.round((double) passed / testCases.size() * 100.0 * 100.0) / 100.0);
        } else {
            stats.put("passRate", 0.0);
        }

        return stats;
    }

    /**
     * 정렬 적용
     */
    private List<TestResultReportDto> applySorting(List<TestResultReportDto> cases, String sortBy,
            String sortDirection) {
        if (sortBy == null)
            return cases;

        Comparator<TestResultReportDto> comparator = null;

        switch (sortBy) {
            case "testCaseName":
                comparator = Comparator.comparing(TestResultReportDto::getTestCaseName,
                        Comparator.nullsLast(String::compareToIgnoreCase));
                break;
            case "result":
                comparator = Comparator.comparing(TestResultReportDto::getResult,
                        Comparator.nullsLast(String::compareToIgnoreCase));
                break;
            case "executedAt":
                comparator = Comparator.comparing(TestResultReportDto::getExecutedAt,
                        Comparator.nullsLast(LocalDateTime::compareTo));
                break;
            default:
                return cases; // 지원하지 않는 정렬 필드
        }

        if ("desc".equalsIgnoreCase(sortDirection)) {
            comparator = comparator.reversed();
        }

        return cases.stream().sorted(comparator).collect(Collectors.toList());
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
            Optional<com.testcase.testcasemanagement.model.TestPlan> testPlanOpt = testPlanRepository
                    .findById(result.getTestExecution().getTestPlanId());
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
                .jiraStatus(result.getJiraStatus())
                .jiraSyncStatus(result.getJiraSyncStatus() != null ? result.getJiraSyncStatus().toString() : null)
                .testExecutionId(result.getTestExecution() != null ? result.getTestExecution().getId() : null)
                .testExecutionName(result.getTestExecution() != null ? result.getTestExecution().getName() : null)
                .testPlanId(result.getTestExecution() != null ? result.getTestExecution().getTestPlanId() : null)
                // ICT-277: 새로운 필드들 추가 - TestCase에서 가져오기
                .preCondition(testCase != null ? testCase.getPreCondition() : null)
                .expectedResults(testCase != null ? testCase.getExpectedResults() : null)
                .steps(testCase != null ? testCase.getSteps() : null)
                .attachmentCount(result.getActiveAttachmentCount())
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
                        Collectors.counting()));
        builder.testResultDistribution(testResultDistribution);

        // 최신 테스트 정보
        TestResult latestResult = relatedResults.stream()
                .max(Comparator.comparing(TestResult::getExecutedAt))
                .orElse(null);

        if (latestResult != null) {
            builder.latestTestResult(latestResult.getResult())
                    .latestTestDate(latestResult.getExecutedAt())
                    .latestExecutor(
                            latestResult.getExecutedBy() != null ? latestResult.getExecutedBy().getUsername() : null)
                    .syncStatus(latestResult.getJiraSyncStatus() != null ? latestResult.getJiraSyncStatus().toString()
                            : null)
                    .lastSyncAt(latestResult.getLastJiraSyncAt())
                    .syncError(latestResult.getJiraSyncError())
                    .jiraIssueUrl(latestResult.getJiraIssueUrl());
        }

        builder.currentStatus("Open") // Mock data
                .issueType("Bug") // Mock data
                .priority("Medium") // Mock data
                .summary("Mock JIRA Issue Summary"); // Mock data

        builder.createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now());

        return builder.build();
    }

    /**
     * ICT-208: 테스트 결과 상세 조회 (통합 API용)
     */
    public Object getTestResultDetail(String resultId) {
        // TestResult 조회 로직 구현 (기존 로직 활용)
        // 실제 구현에서는 TestResult 엔티티 조회 후 DTO 변환
        return null;
    }
}
