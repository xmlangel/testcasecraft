// src/main/java/com/testcase/testcasemanagement/service/TestResultReportService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.JiraStatusSummaryDto;
import com.testcase.testcasemanagement.dto.TestResultFilterDto;
import com.testcase.testcasemanagement.dto.TestResultReportDto;
import com.testcase.testcasemanagement.dto.TestResultStatisticsDto;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class TestResultReportService {

  private final TestExecutionRepository testExecutionRepository;
  private final TestPlanRepository testPlanRepository;
  private final ProjectRepository projectRepository;
  private final TestResultRepository testResultRepository;
  private final TestCaseRepository testCaseRepository;
  private final ExportService exportService;

  @Autowired
  public TestResultReportService(
      TestExecutionRepository testExecutionRepository,
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
        String assignee =
            result.getExecutedBy() != null
                ? String.valueOf(result.getExecutedBy())
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

  /** ICT-185: 테스트 결과 통계 조회 */
  @org.springframework.transaction.annotation.Transactional(readOnly = true)
  public TestResultStatisticsDto getTestResultStatistics(
      String projectId, List<String> testPlanIds, String testExecutionId) {
    TestResultStatisticsDto.TestResultStatisticsDtoBuilder builder =
        TestResultStatisticsDto.builder();

    // 필터 조건에 따른 TestResult 조회
    List<TestResult> results;

    if (testExecutionId != null) {
      // 특정 테스트 실행 기준
      Optional<TestExecution> execution = testExecutionRepository.findById(testExecutionId);
      results = execution.map(TestExecution::getResults).orElse(new ArrayList<>());
      builder.filterType("TEST_EXECUTION").filterId(testExecutionId);
    } else if (testPlanIds != null && !testPlanIds.isEmpty()) {
      // 테스트 플랜 기준 (다중 지원)
      List<TestExecution> executions = testExecutionRepository.findAllByTestPlanIdIn(testPlanIds);
      results =
          executions.stream()
              .flatMap(exec -> exec.getResults().stream())
              .collect(Collectors.toList());
      builder.filterType("TEST_PLAN").filterId(String.join(",", testPlanIds));
    } else if (projectId != null) {
      // 프로젝트 기준
      List<TestExecution> executions = testExecutionRepository.findByProjectId(projectId);
      results =
          executions.stream()
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

    // ICT-247/283/ICT-418/REPRODUCTION: 통계 정확도를 위해 전체 테스트 케이스 모집단 식별
    // planId + ":" + caseId 형식의 키를 사용하여 플랜별 독립적인 항목으로 관리
    Set<String> targetPlanCaseKeys = new HashSet<>();
    if (testExecutionId != null) {
      // 특정 실행이 지정된 경우 해당 실행의 플랜 케이스들을 모집단으로 설정
      testExecutionRepository
          .findById(testExecutionId)
          .ifPresent(
              exec -> {
                if (exec.getTestPlanId() != null) {
                  testPlanRepository
                      .findById(exec.getTestPlanId())
                      .ifPresent(
                          plan -> {
                            if (plan.getTestCaseIds() != null && !plan.getTestCaseIds().isEmpty()) {
                              List<TestCase> existingCases =
                                  testCaseRepository.findAllById(plan.getTestCaseIds());
                              for (TestCase tc : existingCases) {
                                // ICT-FOLDER-STATS: folder 타입 제외
                                if (tc.getType() == null
                                    || !"folder".equalsIgnoreCase(tc.getType())) {
                                  targetPlanCaseKeys.add(plan.getId() + ":" + tc.getId());
                                }
                              }
                            }
                          });
                }
              });
    } else if (testPlanIds != null && !testPlanIds.isEmpty()) {
      List<com.testcase.testcasemanagement.model.TestPlan> plans =
          testPlanRepository.findAllById(testPlanIds);
      for (com.testcase.testcasemanagement.model.TestPlan plan : plans) {
        if (plan.getTestCaseIds() != null && !plan.getTestCaseIds().isEmpty()) {
          // ICT-FOLDER-STATS: 실제 존재하는 케이스만 모집단에 포함하여 통계 불일치 해결
          List<TestCase> existingCases = testCaseRepository.findAllById(plan.getTestCaseIds());
          for (TestCase tc : existingCases) {
            // ICT-FOLDER-STATS: folder 타입 제외
            if (tc.getType() == null || !"folder".equalsIgnoreCase(tc.getType())) {
              targetPlanCaseKeys.add(plan.getId() + ":" + tc.getId());
            }
          }
        }
      }
    } else if (projectId != null) {
      // ICT-FOLDER-STATS: folder가 아닌 모든 항목(testcase, manual, automated 등)을 포함하여 일관성 유지
      testCaseRepository.findByProjectId(projectId).stream()
          .filter(tc -> tc.getType() == null || !"folder".equalsIgnoreCase(tc.getType()))
          .forEach(tc -> targetPlanCaseKeys.add("PROJ:" + tc.getId()));
    }

    // ICT-247/283: 플랜별 테스트케이스 최신 결과를 추적하기 위한 맵
    // 키 형식: planId + ":" + caseId (프로젝트 기준일 경우 "PROJ:" + caseId)
    Map<String, TestResult> latestPlanCaseResultsMap = new HashMap<>();
    Set<String> jiraLinkedCaseKeys = new HashSet<>(); // ICT-JIRA-LINK: Jira 연동 케이스 추적용

    for (TestResult result : results) {
      // 1. 전체 수행 이력 통계 (기본 카운트 증가)
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
        case "SKIPPED":
          statistics.setSkippedCount(statistics.getSkippedCount() + 1);
          break;
      }

      // 2. 최신 결과 추적
      String caseId = result.getTestCaseId();
      if (caseId != null) {
        String planId =
            (result.getTestExecution() != null && result.getTestExecution().getTestPlanId() != null)
                ? result.getTestExecution().getTestPlanId()
                : "PROJ";
        String key = planId + ":" + caseId;

        TestResult existing = latestPlanCaseResultsMap.get(key);
        if (existing == null
            || (result.getExecutedAt() != null
                && (existing.getExecutedAt() == null
                    || result.getExecutedAt().isAfter(existing.getExecutedAt())))) {
          latestPlanCaseResultsMap.put(key, result);
        }

        // ICT-JIRA-LINK: 해당 케이스가 한 번이라도 JIRA와 연결된 적이 있는지 추적
        if (result.hasJiraIssue()) {
          jiraLinkedCaseKeys.add(key);
        }
      }

      // JIRA 관련 통계
      if (result.hasJiraIssue()) {
        statistics.setJiraLinkedCount(statistics.getJiraLinkedCount() + 1);
        if (result.getJiraSyncStatus() != null
            && "SYNCED".equals(result.getJiraSyncStatus().toString())) {
          statistics.setJiraSyncedCount(statistics.getJiraSyncedCount() + 1);
        }
      }

      // 실행자별 분포
      if (result.getExecutedBy() != null) {
        String executor = result.getExecutedBy().getUsername();
        executorDistribution.put(executor, executorDistribution.getOrDefault(executor, 0L) + 1);
      }
    }

    // 3. 최신 결과 요약 통계 계산
    if (!targetPlanCaseKeys.isEmpty()) {
      statistics.setTotalCaseCount((long) targetPlanCaseKeys.size());

      // 결과가 있는 플랜:케이스 조합의 상태 합산
      for (Map.Entry<String, TestResult> entry : latestPlanCaseResultsMap.entrySet()) {
        if (targetPlanCaseKeys.contains(entry.getKey())) {
          updateLatestStatusCount(statistics, entry.getValue().getResult());
        }
      }

      // 결과가 아예 없는 조합들은 NOT_RUN으로 간주
      long executedInPopulationCount =
          latestPlanCaseResultsMap.keySet().stream().filter(targetPlanCaseKeys::contains).count();
      long unexecutedCaseCount = targetPlanCaseKeys.size() - executedInPopulationCount;
      if (unexecutedCaseCount > 0) {
        statistics.setLatestNotRunCount(statistics.getLatestNotRunCount() + unexecutedCaseCount);
      }

      // ICT-JIRA-LINK: 모집단 내에서 JIRA와 연동된 케이스 수 계산
      long jiraLinkedCaseCount =
          jiraLinkedCaseKeys.stream().filter(targetPlanCaseKeys::contains).count();
      statistics.setLatestJiraLinkedCount(jiraLinkedCaseCount);
    } else {
      // 필터가 없어 모집단을 알 수 없는 경우 결과가 있는 조합들만 기준
      statistics.setTotalCaseCount((long) latestPlanCaseResultsMap.size());
      for (TestResult latest : latestPlanCaseResultsMap.values()) {
        updateLatestStatusCount(statistics, latest.getResult());
      }

      // ICT-JIRA-LINK: 결과가 있는 것들 중 JIRA와 연동된 케이스 수
      statistics.setLatestJiraLinkedCount((long) jiraLinkedCaseKeys.size());
    }

    statistics.setJiraStatusDistribution(jiraStatusDistribution);
    statistics.setExecutorDistribution(executorDistribution);

    // 비율 계산
    statistics.calculateRates();

    return statistics;
  }

  /** ICT-185: 상세 테스트 결과 리포트 조회 (페이징 지원) */
  @org.springframework.transaction.annotation.Transactional(readOnly = true)
  public Page<TestResultReportDto> getDetailedTestResultReport(TestResultFilterDto filter) {
    // 기본값 설정
    if (filter.getPage() == null) filter.setDefaultPaging();
    if (filter.getSortBy() == null) filter.setDefaultSort();
    if (filter.getDisplayColumns() == null) filter.setDefaultDisplayColumns();

    // 페이징 설정
    Sort sort =
        Sort.by(
            "DESC".equals(filter.getSortDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC,
            filter.getSortBy());
    Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

    // ICT-263: '최신 결과만 보기' 또는 '미실행 케이스 포함' 옵션이 켜진 경우
    if (Boolean.TRUE.equals(filter.getLatestOnly())
        || Boolean.TRUE.equals(filter.getIncludeNotExecuted())) {
      // 모든 케이스(또는 실존 케이스)에 대한 최신 결과 목록 추출 (246 -> 208 달성의 근본 해결)
      List<TestResultReportDto> allCases = getCompletePopulationResults(filter);

      // 최신 결과만 보기인 경우: 미실행(NOT_RUN) 상태는 제외하고 결과가 존재하는 것 중 최신만 남김
      if (Boolean.TRUE.equals(filter.getLatestOnly())) {
        allCases =
            allCases.stream()
                .filter(
                    dto -> dto.getResult() != null && !"NOT_RUN".equalsIgnoreCase(dto.getResult()))
                .collect(Collectors.toList());
      }

      // ICT-JIRA-LATEST: 결과 필터가 있는 경우 모집단의 최신 결과 기준으로 필터링 (통계와의 일관성 유지)
      if (filter.getResults() != null && !filter.getResults().isEmpty()) {
        allCases =
            allCases.stream()
                .filter(
                    dto -> {
                      String res = dto.getResult();
                      // 미실행 또는 명시적 NOT_RUN 처리
                      if (res == null || "NOT_RUN".equalsIgnoreCase(res)) {
                        return filter.getResults().contains("NOT_RUN");
                      }
                      return filter.getResults().contains(res);
                    })
                .collect(Collectors.toList());
      }

      // 수동 정렬
      allCases = applySorting(allCases, filter.getSortBy(), filter.getSortDirection());

      // 수동 페이징
      int start = (int) pageable.getOffset();
      int end = Math.min((start + pageable.getPageSize()), allCases.size());

      List<TestResultReportDto> pageContent;
      if (start >= allCases.size() || start > end) {
        pageContent = new ArrayList<>();
      } else {
        pageContent = allCases.subList(start, end);
      }

      return new PageImpl<>(pageContent, pageable, allCases.size());
    }

    // 프로젝트 ID 필터링이 있는 경우 해당 프로젝트의 테스트 결과만 조회
    if (filter.getProjectId() != null) {

      // ICT-178: JIRA 이슈 키 필터는 DB 레벨 지원이 없으므로 기존 방식 유지
      if (filter.getJiraIssueKeys() != null && !filter.getJiraIssueKeys().isEmpty()) {
        return getDetailedTestResultReportWithJiraFilter(filter, pageable);
      }

      // 최적화: DB 레벨 DISTINCT ON 중복 제거 → ID만 가져온 후 JOIN FETCH 로 엔티티 로드
      // (extra column 매핑 오류 방지 + testExecution/executedBy N+1 방지)
      Pageable idPageable = PageRequest.of(filter.getPage(), filter.getSize()); // unsorted
      List<String> ids;
      long total;

      if (filter.getTestExecutionIds() != null && !filter.getTestExecutionIds().isEmpty()) {
        ids =
            testResultRepository.findDedupedIdsByExecutions(
                filter.getTestExecutionIds(), idPageable);
        total = testResultRepository.countDedupedByExecutions(filter.getTestExecutionIds());
      } else if (filter.getTestPlanIds() != null && !filter.getTestPlanIds().isEmpty()) {
        ids =
            testResultRepository.findDedupedIdsByProjectAndPlans(
                filter.getProjectId(), filter.getTestPlanIds(), idPageable);
        total =
            testResultRepository.countDedupedByProjectAndPlans(
                filter.getProjectId(), filter.getTestPlanIds());
      } else {
        ids = testResultRepository.findDedupedIdsByProject(filter.getProjectId(), idPageable);
        total = testResultRepository.countDedupedByProject(filter.getProjectId());
      }

      List<TestResult> results =
          ids.isEmpty() ? new ArrayList<>() : testResultRepository.findByIdsWithFetch(ids);

      // 쿼리 반환 순서(executed_at DESC)를 보존
      Map<String, TestResult> resultMap =
          results.stream().collect(Collectors.toMap(TestResult::getId, r -> r));
      List<TestResult> orderedResults =
          ids.stream().map(resultMap::get).filter(Objects::nonNull).collect(Collectors.toList());

      List<TestResultReportDto> dtos = batchConvertToReportDtos(orderedResults);
      return new PageImpl<>(dtos, pageable, total);
    }

    // 전체 조회
    Page<TestResult> resultPage = testResultRepository.findAll(pageable);
    List<TestResultReportDto> dtos = batchConvertToReportDtos(resultPage.getContent());
    return new PageImpl<>(dtos, pageable, resultPage.getTotalElements());
  }

  /** JIRA 이슈 키 필터가 있는 경우 기존 방식으로 처리 (전체 로드 후 Java 필터링) */
  private Page<TestResultReportDto> getDetailedTestResultReportWithJiraFilter(
      TestResultFilterDto filter, Pageable pageable) {
    List<TestResult> allResults =
        testResultRepository.findRecentTestResultsByProject(
            filter.getProjectId(), PageRequest.of(0, Integer.MAX_VALUE));

    List<TestResult> filteredResults = allResults;

    if (filter.getTestPlanIds() != null && !filter.getTestPlanIds().isEmpty()) {
      filteredResults =
          filteredResults.stream()
              .filter(
                  result ->
                      result.getTestExecution() != null
                          && filter
                              .getTestPlanIds()
                              .contains(result.getTestExecution().getTestPlanId()))
              .collect(Collectors.toList());
    }
    if (filter.getTestExecutionIds() != null && !filter.getTestExecutionIds().isEmpty()) {
      filteredResults =
          filteredResults.stream()
              .filter(
                  result ->
                      result.getTestExecution() != null
                          && filter
                              .getTestExecutionIds()
                              .contains(result.getTestExecution().getId()))
              .collect(Collectors.toList());
    }
    filteredResults =
        filteredResults.stream()
            .filter(
                result -> {
                  if (result.getJiraIssueKey() == null) return false;
                  List<String> keys = Arrays.asList(result.getJiraIssueKey().split(","));
                  return keys.stream().anyMatch(k -> filter.getJiraIssueKeys().contains(k.trim()));
                })
            .collect(Collectors.toList());

    // 중복 제거 (execution+testCase 기준 최신)
    Map<String, TestResult> latestMap =
        filteredResults.stream()
            .collect(
                Collectors.toMap(
                    r -> r.getTestExecution().getId() + "|" + r.getTestCaseId(),
                    r -> r,
                    (a, b) -> {
                      if (b.getExecutedAt() != null && a.getExecutedAt() != null)
                        return b.getExecutedAt().isAfter(a.getExecutedAt()) ? b : a;
                      return b.getExecutedAt() != null ? b : a;
                    }));
    filteredResults = new ArrayList<>(latestMap.values());

    int start = (int) pageable.getOffset();
    int end = Math.min(start + pageable.getPageSize(), filteredResults.size());
    List<TestResult> pageContent =
        (start >= filteredResults.size()) ? new ArrayList<>() : filteredResults.subList(start, end);

    List<TestResultReportDto> dtos = batchConvertToReportDtos(pageContent);
    return new PageImpl<>(dtos, pageable, filteredResults.size());
  }

  /** ICT-185: JIRA 상태 통합 리스트 조회 (다중 플랜 지원) */
  @org.springframework.transaction.annotation.Transactional(readOnly = true)
  public List<JiraStatusSummaryDto> getJiraStatusSummary(
      String projectId, List<String> testPlanIds, Boolean activeOnly, boolean refreshCache) {
    // JIRA 이슈가 연결된 테스트 결과들 조회
    List<TestResult> resultsWithJira;

    if (testPlanIds != null && !testPlanIds.isEmpty()) {
      List<TestExecution> executions = testExecutionRepository.findAllByTestPlanIdIn(testPlanIds);
      resultsWithJira =
          executions.stream()
              .flatMap(exec -> exec.getResults().stream())
              .filter(TestResult::hasJiraIssue)
              .collect(Collectors.toList());
    } else if (projectId != null) {
      List<TestExecution> executions = testExecutionRepository.findByProjectId(projectId);
      resultsWithJira =
          executions.stream()
              .flatMap(exec -> exec.getResults().stream())
              .filter(TestResult::hasJiraIssue)
              .collect(Collectors.toList());
    } else {
      resultsWithJira =
          testResultRepository.findAll().stream()
              .filter(TestResult::hasJiraIssue)
              .collect(Collectors.toList());
    }

    // JIRA 이슈 키별로 그룹핑하여 중복 제거
    Map<String, List<TestResult>> groupedByJiraKey =
        resultsWithJira.stream().collect(Collectors.groupingBy(TestResult::getJiraIssueKey));

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
    summaries.sort(
        (a, b) -> {
          if (a.getLatestTestDate() == null && b.getLatestTestDate() == null) return 0;
          if (a.getLatestTestDate() == null) return 1;
          if (b.getLatestTestDate() == null) return -1;
          return b.getLatestTestDate().compareTo(a.getLatestTestDate());
        });

    return summaries;
  }

  /** ICT-190: 테스트 결과 내보내기 (Excel/PDF/CSV) 실제 라이브러리를 사용한 구현 */
  @org.springframework.transaction.annotation.Transactional(readOnly = true)
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
    } catch (IllegalArgumentException e) {
      throw e;
    } catch (Exception e) {
      throw new RuntimeException("파일 내보내기 중 오류가 발생했습니다: " + e.getMessage(), e);
    }
  }

  /** ICT-185: 사용자별 필터 프리셋 조회 */
  public List<TestResultFilterDto> getUserFilterPresets(String userId) {
    return new ArrayList<>();
  }

  /** ICT-185: 사용자별 필터 프리셋 저장 */
  public String saveUserFilterPreset(String userId, String presetName, TestResultFilterDto filter) {
    return "preset_" + userId + "_" + System.currentTimeMillis();
  }

  // ========== ICT-283: 계층적 상세 리포트 메서드들 ==========

  /** ICT-283: 계층적 테스트 결과 상세 리포트 조회 테스트플랜 > 실행 > 케이스 3단계 계층 구조로 반환 */
  @org.springframework.transaction.annotation.Transactional(readOnly = true)
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

  /** ICT-283: 계층적 리포트 내보내기 */
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

  /** ICT-283: 미실행 케이스 포함 완전한 테스트 케이스 목록 조회 */
  public Page<TestResultReportDto> getCompleteTestCasesList(
      String projectId,
      String testPlanId,
      String folderPath,
      int page,
      int size,
      String sortBy,
      String sortDirection) {

    Pageable pageable =
        PageRequest.of(page, size, Sort.Direction.fromString(sortDirection), sortBy);

    try {
      // LEFT JOIN을 통한 완전한 데이터 조회 (미실행 케이스 포함)
      List<TestResultReportDto> completeCases =
          getCompleteTestCasesWithResults(projectId, testPlanId, folderPath);

      // 정렬 적용
      completeCases = applySorting(completeCases, sortBy, sortDirection);

      // 페이징 적용
      int start = page * size;
      int end = Math.min(start + size, completeCases.size());

      log.debug(
          "Complete cases paging: start={}, end={}, size={}", start, end, completeCases.size());

      List<TestResultReportDto> pagedCases;
      if (start >= completeCases.size() || start > end) {
        pagedCases = new ArrayList<>();
      } else {
        try {
          pagedCases = completeCases.subList(start, end);
        } catch (IndexOutOfBoundsException e) {
          log.warn("Failed to slice complete cases: {}", e.getMessage());
          pagedCases = new ArrayList<>();
        }
      }

      return new PageImpl<>(pagedCases, pageable, completeCases.size());

    } catch (Exception e) {
      throw new RuntimeException("완전한 테스트 케이스 목록 조회 중 오류가 발생했습니다: " + e.getMessage(), e);
    }
  }

  // ========== ICT-283: 계층적 리포트 헬퍼 메서드들 ==========

  /** 테스트 플랜별 계층적 데이터 조회 */
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

  /** 테스트 실행별 계층적 데이터 조회 */
  private List<Map<String, Object>> getTestExecutionsWithHierarchy(
      String testPlanId, TestResultFilterDto filter) {
    List<Map<String, Object>> executions = new ArrayList<>();

    // 테스트 플랜의 실행들 조회
    List<TestExecution> testExecutions = getFilteredTestExecutions(testPlanId, filter);

    for (TestExecution execution : testExecutions) {
      Map<String, Object> executionData = new HashMap<>();
      executionData.put("id", execution.getId());
      executionData.put("name", execution.getName());
      executionData.put("description", execution.getDescription());
      executionData.put("executedAt", execution.getStartDate()); // Using startDate as executedAt
      executionData.put(
          "executedBy", "System"); // Default value since executedBy field doesn't exist

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
   * 필터 조건에 기반한 전체 테스트케이스 인구(Population) 및 최신 결과 조회 ICT-283: 미실행 케이스를 포함하여 리포트를 생성하기 위한 핵심 로직 다중 플랜
   * 지원: 동일 케이스가 여러 플랜에 속할 경우 각각 독립적인 항목으로 관리
   */
  private List<TestResultReportDto> getCompletePopulationResults(TestResultFilterDto filter) {
    String projectId = filter.getProjectId();
    List<String> testPlanIds = filter.getTestPlanIds();
    List<String> testExecutionIds = filter.getTestExecutionIds();

    // 1. 대상 (플랜:케이스) 키 목록 확정 (인구 조사)
    // 키 형식: planId + ":" + caseId
    Set<String> targetPlanCaseKeys = new LinkedHashSet<>(); // 순서 유지를 위해 LinkedHashSet 사용
    Map<String, TestCase> testCaseMap = new HashMap<>();

    if (testExecutionIds != null && !testExecutionIds.isEmpty()) {
      // 특정 실행들에 포함된 케이스들
      List<TestExecution> executions = testExecutionRepository.findAllById(testExecutionIds);
      for (TestExecution exec : executions) {
        if (exec.getTestPlanId() != null) {
          testPlanRepository
              .findById(exec.getTestPlanId())
              .ifPresent(
                  plan -> {
                    if (plan.getTestCaseIds() != null) {
                      List<TestCase> existingCases =
                          testCaseRepository.findAllById(plan.getTestCaseIds());
                      for (TestCase tc : existingCases) {
                        // ICT-FOLDER-STATS: folder 타입 제외
                        if (tc.getType() == null || !"folder".equalsIgnoreCase(tc.getType())) {
                          targetPlanCaseKeys.add(plan.getId() + ":" + tc.getId());
                        }
                      }
                    }
                  });
        }
      }
    } else if (testPlanIds != null && !testPlanIds.isEmpty()) {
      // 특정 플랜들에 포함된 케이스들
      List<com.testcase.testcasemanagement.model.TestPlan> plans =
          testPlanRepository.findAllById(testPlanIds);
      for (com.testcase.testcasemanagement.model.TestPlan plan : plans) {
        if (plan.getTestCaseIds() != null) {
          List<TestCase> existingCases = testCaseRepository.findAllById(plan.getTestCaseIds());
          for (TestCase tc : existingCases) {
            // ICT-FOLDER-STATS: folder 타입 제외
            if (tc.getType() == null || !"folder".equalsIgnoreCase(tc.getType())) {
              targetPlanCaseKeys.add(plan.getId() + ":" + tc.getId());
            }
          }
        }
      }
    } else if (projectId != null) {
      // 프로젝트 전체 케이스
      List<TestCase> cases = testCaseRepository.findByProjectId(projectId);
      for (TestCase tc : cases) {
        // ICT-FOLDER-STATS: folder가 아닌 모든 항목(testcase, manual, automated 등)을 포함
        if (tc.getType() == null || !"folder".equalsIgnoreCase(tc.getType())) {
          targetPlanCaseKeys.add("PROJ:" + tc.getId());
          testCaseMap.put(tc.getId(), tc);
        }
      }
    }

    // TestCase 정보 로드 (상세 정보를 위해)
    Set<String> allCaseIds =
        targetPlanCaseKeys.stream().map(key -> key.split(":")[1]).collect(Collectors.toSet());

    if (!allCaseIds.isEmpty()) {
      List<TestCase> cases = testCaseRepository.findAllById(allCaseIds);
      for (TestCase tc : cases) {
        // ICT-FOLDER-STATS: folder가 아닌 모든 항목을 포함
        if (tc.getType() == null || !"folder".equalsIgnoreCase(tc.getType())) {
          testCaseMap.put(tc.getId(), tc);
        }
      }
    }

    // 2. 해당 케이스들의 모든 결과 조회 (수행 횟수 합산 및 최신 결과 매칭을 위해)
    List<TestResult> recentResults =
        testResultRepository.findRecentTestResultsByProject(
            projectId, PageRequest.of(0, Integer.MAX_VALUE));

    // (플랜:케이스)별 최신 결과, 수행 횟수 및 JIRA 연동 정보 관리
    Map<String, TestResult> latestResultByPlanCase = new HashMap<>();
    Map<String, Integer> executionCountByPlanCase = new HashMap<>();
    Map<String, TestResult> latestJiraInfoByPlanCase =
        new HashMap<>(); // ICT-JIRA-LATEST: 과거 이력의 JIRA 정보 추적용

    for (TestResult result : recentResults) {
      String tcId = result.getTestCaseId();
      if (tcId == null) continue;

      String resultPlanId =
          (result.getTestExecution() != null && result.getTestExecution().getTestPlanId() != null)
              ? result.getTestExecution().getTestPlanId()
              : "PROJ";

      // 매칭을 위한 가능한 모든 키 검토
      // 1. 특정 플랜/실행 필터가 있는 경우 정확한 매칭 필요
      // 2. 프로젝트 전체 보기('PROJ')인 경우, 어떤 플랜에서 실행되었든 해당 케이스면 매칭

      List<String> matchingKeys = new ArrayList<>();
      if (testPlanIds != null && !testPlanIds.isEmpty()) {
        // 특정 플랜 필터가 있을 때는 해당 플랜의 결과만 매칭
        matchingKeys.add(resultPlanId + ":" + tcId);
      } else if (testExecutionIds != null && !testExecutionIds.isEmpty()) {
        // 특정 실행 필터가 있을 때는 해당 실행의 결과만 매칭 (나중에 filtering 로직에서 걸러짐)
        matchingKeys.add(resultPlanId + ":" + tcId);
      } else {
        // 프로젝트 전체 보기인 경우, 'PROJ:tcId' 키로 집계
        matchingKeys.add("PROJ:" + tcId);
      }

      for (String key : matchingKeys) {
        if (!targetPlanCaseKeys.contains(key)) continue;

        // 실행 필터 적용
        if (testExecutionIds != null && !testExecutionIds.isEmpty()) {
          if (result.getTestExecution() == null
              || !testExecutionIds.contains(result.getTestExecution().getId())) {
            continue;
          }
        }

        // 수행 횟수 증가
        executionCountByPlanCase.put(key, executionCountByPlanCase.getOrDefault(key, 0) + 1);

        // 가장 최신 결과 하나만 유지 (executedAt 기준)
        TestResult existing = latestResultByPlanCase.get(key);
        if (existing == null
            || (result.getExecutedAt() != null
                && (existing.getExecutedAt() == null
                    || result.getExecutedAt().isAfter(existing.getExecutedAt())))) {
          latestResultByPlanCase.put(key, result);
        }

        // JIRA 정보 추적: 현재 결과에 JIRA 정보가 있다면 최신 정보로 갱신
        if (result.hasJiraIssue()) {
          TestResult existingJira = latestJiraInfoByPlanCase.get(key);
          if (existingJira == null
              || (result.getExecutedAt() != null
                  && (existingJira.getExecutedAt() == null
                      || result.getExecutedAt().isAfter(existingJira.getExecutedAt())))) {
            latestJiraInfoByPlanCase.put(key, result);
          }
        }
      }
    }

    // 3. (플랜:케이스) 목록을 순회하며 DTO 생성
    List<TestResultReportDto> reportDtos = new ArrayList<>();
    for (String key : targetPlanCaseKeys) {
      String[] parts = key.split(":");
      String planId = parts[0];
      String tcId = parts[1];

      TestCase tc = testCaseMap.get(tcId);
      if (tc == null) continue;

      TestResult tr = latestResultByPlanCase.get(key);
      TestResult jiraTr =
          latestJiraInfoByPlanCase.get(key); // ICT-JIRA-LATEST: 과거 이력이더라도 가장 최신 JIRA 정보 사용
      Integer execCount = executionCountByPlanCase.getOrDefault(key, 0);

      TestResultReportDto dto;
      if (tr != null) {
        dto = convertToReportDto(tr);

        // ICT-JIRA-LATEST: 최신 결과에 JIRA 정보가 없으나 과거 이력에 있는 경우 JIRA 정보 합성
        if (!tr.hasJiraIssue() && jiraTr != null) {
          dto.setJiraIssueKey(jiraTr.getJiraIssueKey());
          dto.setJiraIssueUrl(jiraTr.getJiraIssueUrl());
          dto.setJiraStatus(jiraTr.getJiraStatus());
          dto.setJiraSyncStatus(
              jiraTr.getJiraSyncStatus() != null ? jiraTr.getJiraSyncStatus().toString() : null);
        }

        dto.setExecutionCount(execCount); // 집계된 수행 횟수 설정
      } else {
        dto = new TestResultReportDto();
        dto.setTestCaseId(tc.getId());
        dto.setTestCaseName(tc.getName());
        dto.setFolderPath(buildFolderPath(tc));
        dto.setResult("NOT_RUN");

        // ICT-JIRA-LATEST: 결과가 없더라도(미실행) 과거 이력에 JIRA가 있으면 표시
        if (jiraTr != null) {
          dto.setJiraIssueKey(jiraTr.getJiraIssueKey());
          dto.setJiraIssueUrl(jiraTr.getJiraIssueUrl());
          dto.setJiraStatus(jiraTr.getJiraStatus());
          dto.setJiraSyncStatus(
              jiraTr.getJiraSyncStatus() != null ? jiraTr.getJiraSyncStatus().toString() : null);
        }

        dto.setPriority(tc.getPriority());
        dto.setCategory(tc.getType());
        dto.setExecutionCount(0); // 미실행 시 0

        // 플랜 정보 추가 (미실행 케이스라도 플랜 필터가 있으면 플랜 정보를 명시)
        if (!"PROJ".equals(planId)) {
          testPlanRepository
              .findById(planId)
              .ifPresent(
                  p -> {
                    dto.setTestPlanId(p.getId());
                    dto.setTestPlanName(p.getName());
                  });
        }
      }
      reportDtos.add(dto);
    }

    return reportDtos;
  }

  /** ICT-283: 미실행 테스트 케이스와 결과를 포함한 목록 조회 (폴더 필터 지원) */
  private List<TestResultReportDto> getCompleteTestCasesWithResults(
      String projectId, String testPlanId, String folderPath) {

    TestResultFilterDto filter = new TestResultFilterDto();
    filter.setProjectId(projectId);
    if (testPlanId != null) {
      filter.setTestPlanIds(List.of(testPlanId));
    }
    filter.setIncludeNotExecuted(true);

    List<TestResultReportDto> results = getCompletePopulationResults(filter);

    // 폴더 경로 필터링 추가
    if (folderPath != null && !folderPath.isEmpty()) {
      results =
          results.stream()
              .filter(
                  r ->
                      r.getFolderPath() != null
                          && (r.getFolderPath().equals(folderPath)
                              || r.getFolderPath().startsWith(folderPath + "/")))
              .collect(Collectors.toList());
    }

    return results;
  }

  /** 필터 조건에 맞는 테스트 플랜들 조회 */
  private List<com.testcase.testcasemanagement.model.TestPlan> getFilteredTestPlans(
      TestResultFilterDto filter) {
    if (filter.getTestPlanIds() != null && !filter.getTestPlanIds().isEmpty()) {
      return testPlanRepository.findAllById(filter.getTestPlanIds());
    } else {
      return testPlanRepository.findByProjectId(filter.getProjectId());
    }
  }

  /** 필터 조건에 맞는 테스트 실행들 조회 */
  private List<TestExecution> getFilteredTestExecutions(
      String testPlanId, TestResultFilterDto filter) {
    if (filter.getTestExecutionIds() != null && !filter.getTestExecutionIds().isEmpty()) {
      // Use findAllById and then filter by testPlanId as a workaround
      return testExecutionRepository.findAllById(filter.getTestExecutionIds()).stream()
          .filter(execution -> testPlanId.equals(execution.getTestPlanId()))
          .toList();
    } else {
      return testExecutionRepository.findByTestPlanId(testPlanId);
    }
  }

  /** 테스트 실행의 케이스 결과들 조회 (미실행 포함) */
  private List<TestResultReportDto> getTestCasesWithResults(
      String executionId, TestResultFilterDto filter) {
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

  /** 계층적 통계 계산 */
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
        List<TestResultReportDto> testCases =
            (List<TestResultReportDto>) execution.get("testCases");
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
      stats.put(
          "passRate", Math.round((double) totalPassed / totalTestCases * 100.0 * 100.0) / 100.0);
      stats.put(
          "executionRate",
          Math.round((double) (totalTestCases - totalNotRun) / totalTestCases * 100.0 * 100.0)
              / 100.0);
    } else {
      stats.put("passRate", 0.0);
      stats.put("executionRate", 0.0);
    }

    return stats;
  }

  /** 플랜 통계 계산 */
  private Map<String, Object> calculatePlanStatistics(List<Map<String, Object>> executions) {
    // 플랜별 통계 계산 로직
    return new HashMap<>();
  }

  /** 실행 통계 계산 */
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

  /** 정렬 적용 */
  private List<TestResultReportDto> applySorting(
      List<TestResultReportDto> cases, String sortBy, String sortDirection) {
    if (sortBy == null) return cases;

    Comparator<TestResultReportDto> comparator = null;

    switch (sortBy) {
      case "testCaseName":
        comparator =
            Comparator.comparing(
                TestResultReportDto::getTestCaseName,
                Comparator.nullsLast(String::compareToIgnoreCase));
        break;
      case "result":
        comparator =
            Comparator.comparing(
                TestResultReportDto::getResult, Comparator.nullsLast(String::compareToIgnoreCase));
        break;
      case "executedAt":
        comparator =
            Comparator.comparing(
                TestResultReportDto::getExecutedAt, Comparator.nullsLast(LocalDateTime::compareTo));
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
   * 배치로 TestResult 목록을 TestResultReportDto 목록으로 변환 (N+1 방지) testCase, testPlan을 한 번에 로딩하고 폴더 경로를
   * 캐싱하여 DB 왕복을 최소화
   */
  private List<TestResultReportDto> batchConvertToReportDtos(List<TestResult> results) {
    if (results.isEmpty()) return new ArrayList<>();

    // 1. 고유 testCaseId 수집
    Set<String> testCaseIds =
        results.stream()
            .map(TestResult::getTestCaseId)
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

    // 2. testCase 계층 전체 배치 로딩 (폴더 경로 재귀에 필요한 조상 포함)
    Map<String, TestCase> testCaseMap = new HashMap<>();
    Set<String> toLoad = new HashSet<>(testCaseIds);
    while (!toLoad.isEmpty()) {
      List<TestCase> loaded = testCaseRepository.findAllById(toLoad);
      toLoad = new HashSet<>();
      for (TestCase tc : loaded) {
        testCaseMap.put(tc.getId(), tc);
        if (tc.getParentId() != null && !testCaseMap.containsKey(tc.getParentId())) {
          toLoad.add(tc.getParentId());
        }
      }
    }

    // 3. 고유 testPlanId 배치 로딩
    Set<String> testPlanIds =
        results.stream()
            .filter(r -> r.getTestExecution() != null)
            .map(r -> r.getTestExecution().getTestPlanId())
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
    Map<String, String> testPlanNameMap =
        testPlanRepository.findAllById(testPlanIds).stream()
            .collect(
                Collectors.toMap(
                    com.testcase.testcasemanagement.model.TestPlan::getId,
                    com.testcase.testcasemanagement.model.TestPlan::getName));

    // 4. 폴더 경로 캐시
    Map<String, String> folderPathCache = new HashMap<>();

    return results.stream()
        .map(r -> convertToReportDtoWithCache(r, testCaseMap, testPlanNameMap, folderPathCache))
        .collect(Collectors.toList());
  }

  /** 캐시를 활용한 단건 변환 */
  private TestResultReportDto convertToReportDtoWithCache(
      TestResult result,
      Map<String, TestCase> testCaseMap,
      Map<String, String> testPlanNameMap,
      Map<String, String> folderPathCache) {

    TestCase testCase =
        result.getTestCaseId() != null ? testCaseMap.get(result.getTestCaseId()) : null;
    String testCaseName = testCase != null ? testCase.getName() : "알 수 없는 테스트케이스";
    String folderPath =
        testCase != null ? buildFolderPathFromCache(testCase, testCaseMap, folderPathCache) : "루트";

    String testPlanId =
        result.getTestExecution() != null ? result.getTestExecution().getTestPlanId() : null;
    String testPlanName = testPlanId != null ? testPlanNameMap.get(testPlanId) : null;

    return TestResultReportDto.builder()
        .testCaseId(result.getTestCaseId())
        .testCaseName(testCaseName)
        .folderPath(folderPath)
        .testPlanName(testPlanName)
        .result(result.getResult())
        .executedAt(result.getExecutedAt())
        .executedBy(result.getExecutedBy() != null ? result.getExecutedBy().getId() : null)
        .executorName(result.getExecutedBy() != null ? result.getExecutedBy().getUsername() : null)
        .notes(result.getNotes())
        .jiraIssueKey(result.getJiraIssueKey())
        .jiraIssueUrl(result.getJiraIssueUrl())
        .jiraStatus(result.getJiraStatus())
        .jiraSyncStatus(
            result.getJiraSyncStatus() != null ? result.getJiraSyncStatus().toString() : null)
        .testExecutionId(
            result.getTestExecution() != null ? result.getTestExecution().getId() : null)
        .testExecutionName(
            result.getTestExecution() != null ? result.getTestExecution().getName() : null)
        .testPlanId(testPlanId)
        .preCondition(testCase != null ? testCase.getPreCondition() : null)
        .expectedResults(testCase != null ? testCase.getExpectedResults() : null)
        .steps(testCase != null ? testCase.getSteps() : null)
        .attachmentCount(result.getActiveAttachmentCount())
        .build();
  }

  /** 폴더 경로 캐시를 사용한 재귀 경로 생성 (DB 왕복 없음) */
  private String buildFolderPathFromCache(
      TestCase testCase, Map<String, TestCase> allCases, Map<String, String> cache) {
    String cached = cache.get(testCase.getId());
    if (cached != null) return cached;

    if (testCase.getParentId() == null) {
      cache.put(testCase.getId(), "루트");
      return "루트";
    }
    TestCase parent = allCases.get(testCase.getParentId());
    if (parent == null) {
      cache.put(testCase.getId(), "루트");
      return "루트";
    }
    String parentPath = buildFolderPathFromCache(parent, allCases, cache);
    String path = "루트".equals(parentPath) ? parent.getName() : parentPath + "/" + parent.getName();
    cache.put(testCase.getId(), path);
    return path;
  }

  /** TestResult를 TestResultReportDto로 변환 */
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
        .jiraStatus(result.getJiraStatus())
        .jiraSyncStatus(
            result.getJiraSyncStatus() != null ? result.getJiraSyncStatus().toString() : null)
        .testExecutionId(
            result.getTestExecution() != null ? result.getTestExecution().getId() : null)
        .testExecutionName(
            result.getTestExecution() != null ? result.getTestExecution().getName() : null)
        .testPlanId(
            result.getTestExecution() != null ? result.getTestExecution().getTestPlanId() : null)
        // ICT-277: 새로운 필드들 추가 - TestCase에서 가져오기
        .preCondition(testCase != null ? testCase.getPreCondition() : null)
        .expectedResults(testCase != null ? testCase.getExpectedResults() : null)
        .steps(testCase != null ? testCase.getSteps() : null)
        .attachmentCount(result.getActiveAttachmentCount())
        .build();
  }

  /** 테스트 케이스의 폴더 경로를 재귀적으로 생성 */
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

  /** JIRA 이슈에 대한 요약 정보 생성 */
  private JiraStatusSummaryDto createJiraStatusSummary(
      String jiraKey, List<TestResult> relatedResults) {
    JiraStatusSummaryDto.JiraStatusSummaryDtoBuilder builder =
        JiraStatusSummaryDto.builder()
            .jiraIssueKey(jiraKey)
            .linkedTestCount((long) relatedResults.size());

    // 테스트 결과 분포 계산
    Map<String, Long> testResultDistribution =
        relatedResults.stream()
            .collect(Collectors.groupingBy(TestResult::getResult, Collectors.counting()));
    builder.testResultDistribution(testResultDistribution);

    // 최신 테스트 정보
    TestResult latestResult =
        relatedResults.stream().max(Comparator.comparing(TestResult::getExecutedAt)).orElse(null);

    if (latestResult != null) {
      builder
          .latestTestResult(latestResult.getResult())
          .latestTestDate(latestResult.getExecutedAt())
          .latestExecutor(
              latestResult.getExecutedBy() != null
                  ? latestResult.getExecutedBy().getUsername()
                  : null)
          .syncStatus(
              latestResult.getJiraSyncStatus() != null
                  ? latestResult.getJiraSyncStatus().toString()
                  : null)
          .lastSyncAt(latestResult.getLastJiraSyncAt())
          .syncError(latestResult.getJiraSyncError())
          .jiraIssueUrl(latestResult.getJiraIssueUrl());
    }

    builder
        .currentStatus("Open") // Mock data
        .issueType("Bug") // Mock data
        .priority("Medium") // Mock data
        .summary("Mock JIRA Issue Summary"); // Mock data

    builder.createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now());

    return builder.build();
  }

  /** ICT-208: 테스트 결과 상세 조회 (통합 API용) */
  public Object getTestResultDetail(String resultId) {
    // TestResult 조회 로직 구현 (기존 로직 활용)
    // 실제 구현에서는 TestResult 엔티티 조회 후 DTO 변환
    return null;
  }

  private void updateLatestStatusCount(TestResultStatisticsDto statistics, String result) {
    if (result == null) {
      statistics.setLatestNotRunCount(statistics.getLatestNotRunCount() + 1);
      return;
    }
    switch (result) {
      case "PASS":
        statistics.setLatestPassCount(statistics.getLatestPassCount() + 1);
        break;
      case "FAIL":
        statistics.setLatestFailCount(statistics.getLatestFailCount() + 1);
        break;
      case "NOT_RUN":
        statistics.setLatestNotRunCount(statistics.getLatestNotRunCount() + 1);
        break;
      case "BLOCKED":
        statistics.setLatestBlockedCount(statistics.getLatestBlockedCount() + 1);
        break;
    }
  }
}
