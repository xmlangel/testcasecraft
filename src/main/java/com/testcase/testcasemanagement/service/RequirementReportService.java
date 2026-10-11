package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.requirement.RequirementCoverageResponse;
import com.testcase.testcasemanagement.dto.requirement.RequirementReportResponse;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.model.Requirement;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.model.TestResultStatus;
import com.testcase.testcasemanagement.repository.RequirementRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.service.RequirementVerdicts.ResultRow;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** 요구사항 커버리지 분석과 요구사항 기반 리포트(TestLink 매뉴얼 4.5절·7.7절). 읽기 전용이다. */
@Service
@Transactional(readOnly = true)
public class RequirementReportService {

  private final RequirementService requirementService;
  private final RequirementRepository requirementRepository;
  private final TestCaseRepository testCaseRepository;
  private final TestPlanRepository testPlanRepository;
  private final TestExecutionRepository testExecutionRepository;
  private final TestResultRepository testResultRepository;

  public RequirementReportService(
      RequirementService requirementService,
      RequirementRepository requirementRepository,
      TestCaseRepository testCaseRepository,
      TestPlanRepository testPlanRepository,
      TestExecutionRepository testExecutionRepository,
      TestResultRepository testResultRepository) {
    this.requirementService = requirementService;
    this.requirementRepository = requirementRepository;
    this.testCaseRepository = testCaseRepository;
    this.testPlanRepository = testPlanRepository;
    this.testExecutionRepository = testExecutionRepository;
    this.testResultRepository = testResultRepository;
  }

  public RequirementCoverageResponse coverage(String projectId) {
    requirementService.requireAccess(projectId);
    List<Requirement> requirements =
        requirementRepository.findByProjectIdOrderByDisplayOrderAscDocIdAsc(projectId);
    Map<String, List<String>> links = requirementService.linkedCaseIds(requirements);

    List<RequirementCoverageResponse.Item> items = new ArrayList<>();
    int covered = 0;
    int partial = 0;
    int uncovered = 0;
    for (Requirement r : requirements) {
      int linked = links.getOrDefault(r.getId(), List.of()).size();
      String coverage =
          RequirementVerdicts.coverage(r.getStatus(), r.getExpectedCoverage(), linked);
      switch (coverage) {
        case RequirementVerdicts.COVERED -> covered++;
        case RequirementVerdicts.PARTIAL -> partial++;
        case RequirementVerdicts.UNCOVERED -> uncovered++;
        default -> {}
      }
      items.add(
          new RequirementCoverageResponse.Item(
              r.getId(),
              r.getSpec().getId(),
              r.getDocId(),
              r.getTitle(),
              r.getStatus().name(),
              r.getExpectedCoverage(),
              linked,
              coverage));
    }
    int testable = covered + partial + uncovered;
    double rate = testable == 0 ? 0 : Math.round(covered * 1000.0 / testable) / 10.0;
    return new RequirementCoverageResponse(
        requirements.size(), testable, covered, partial, uncovered, rate, items);
  }

  /**
   * 플랜 기준 리포트. executionId 를 주면 그 실행의 결과만, 아니면 플랜에 속한 모든 실행에서 TC 별 최신 결과를 쓴다. 플랜에 들어 있지 않은 연결 TC 는
   * 판정에서 뺀다.
   */
  public RequirementReportResponse report(String projectId, String testPlanId, String executionId) {
    requirementService.requireAccess(projectId);

    List<Object[]> rows;
    String planId = testPlanId;
    if (executionId != null && !executionId.isBlank()) {
      TestExecution execution =
          testExecutionRepository
              .findById(executionId)
              .orElseThrow(
                  () -> new ResourceNotFoundException("테스트 실행을 찾을 수 없습니다: " + executionId));
      requireSameProject(execution.getProject().getId(), projectId, "executionId", executionId);
      planId = execution.getTestPlanId();
      rows = testResultRepository.findResultRowsByExecutionId(executionId);
    } else if (testPlanId != null && !testPlanId.isBlank()) {
      rows = testResultRepository.findResultRowsByTestPlanId(testPlanId);
    } else {
      throw new ResourceNotValidException(
          "testPlanId 또는 executionId 중 하나는 필요합니다.", Map.of("testPlanId", ""));
    }
    if (planId == null) {
      throw new ResourceNotValidException(
          "테스트 플랜에 연결되지 않은 실행입니다.", Map.of("executionId", String.valueOf(executionId)));
    }
    final String resolvedPlanId = planId;
    TestPlan plan =
        testPlanRepository
            .findById(resolvedPlanId)
            .orElseThrow(
                () -> new ResourceNotFoundException("테스트 플랜을 찾을 수 없습니다: " + resolvedPlanId));
    requireSameProject(plan.getProject().getId(), projectId, "testPlanId", resolvedPlanId);

    Set<String> planCaseIds = new HashSet<>(plan.getTestCaseIds());
    Map<String, String> latest =
        RequirementVerdicts.latestByCase(
            rows.stream()
                .map(r -> new ResultRow((String) r[0], (String) r[1], (LocalDateTime) r[2]))
                .toList());

    List<Requirement> requirements =
        requirementRepository.findByProjectIdOrderByDisplayOrderAscDocIdAsc(projectId);
    Map<String, List<String>> links = requirementService.linkedCaseIds(requirements);
    Map<String, TestCase> cases =
        testCaseRepository
            .findAllById(links.values().stream().flatMap(List::stream).distinct().toList())
            .stream()
            .collect(Collectors.toMap(TestCase::getId, Function.identity()));

    Map<String, Integer> counts = new LinkedHashMap<>();
    for (String key :
        List.of(
            TestResultStatus.PASS.value(),
            TestResultStatus.FAIL.value(),
            TestResultStatus.BLOCKED.value(),
            TestResultStatus.NOT_RUN.value(),
            RequirementVerdicts.NOT_IN_PLAN)) {
      counts.put(key, 0);
    }

    List<RequirementReportResponse.Item> items = new ArrayList<>();
    for (Requirement r : requirements) {
      if (r.getStatus() == Requirement.Status.NOT_TESTABLE
          || r.getStatus() == Requirement.Status.OBSOLETE) {
        continue;
      }
      List<RequirementReportResponse.CaseResult> caseResults = new ArrayList<>();
      for (String tcId : links.getOrDefault(r.getId(), List.of())) {
        if (!planCaseIds.contains(tcId)) {
          continue;
        }
        TestCase tc = cases.get(tcId);
        caseResults.add(
            new RequirementReportResponse.CaseResult(
                tcId,
                tc == null ? null : tc.getDisplayId(),
                tc == null ? null : tc.getName(),
                latest.getOrDefault(tcId, TestResultStatus.NOT_RUN.value())));
      }
      String verdict =
          RequirementVerdicts.verdict(
              caseResults.stream().map(RequirementReportResponse.CaseResult::result).toList());
      counts.merge(verdict, 1, Integer::sum);
      items.add(
          new RequirementReportResponse.Item(
              r.getId(), r.getSpec().getId(), r.getDocId(), r.getTitle(), verdict, caseResults));
    }
    return new RequirementReportResponse(resolvedPlanId, executionId, counts, items);
  }

  /** 다른 프로젝트의 ID 는 없는 것과 같게 404 로 답한다. 400 으로 가르면 다른 프로젝트에 그 ID 가 있는지 알려 주게 된다. */
  private static void requireSameProject(
      String actual, String expected, String field, String value) {
    if (!expected.equals(actual)) {
      throw new ResourceNotFoundException(field + " 를 찾을 수 없습니다: " + value);
    }
  }
}
