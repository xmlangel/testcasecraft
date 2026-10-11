package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.Requirement;
import com.testcase.testcasemanagement.service.RequirementVerdicts.ResultRow;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.testng.Assert;
import org.testng.annotations.Test;

/** 요구사항 판정 규칙. 우선순위는 TestLink 매뉴얼 7.7절: FAIL > BLOCKED > NOT_RUN > PASS. */
public class RequirementVerdictsTest {

  private static final LocalDateTime T0 = LocalDateTime.of(2026, 10, 1, 9, 0);

  @Test
  public void verdictPrefersFailOverEverything() {
    Assert.assertEquals(
        RequirementVerdicts.verdict(List.of("PASS", "BLOCKED", "FAIL", "NOT_RUN")), "FAIL");
  }

  @Test
  public void verdictPrefersBlockedOverNotRunAndPass() {
    Assert.assertEquals(
        RequirementVerdicts.verdict(List.of("PASS", "NOT_RUN", "BLOCKED")), "BLOCKED");
  }

  @Test
  public void verdictIsNotRunWhenAnyCaseIsNotRun() {
    Assert.assertEquals(RequirementVerdicts.verdict(List.of("PASS", "NOT_RUN")), "NOT_RUN");
  }

  @Test
  public void verdictIsPassOnlyWhenAllPass() {
    Assert.assertEquals(RequirementVerdicts.verdict(List.of("PASS", "PASS")), "PASS");
  }

  @Test
  public void verdictIsNotInPlanWhenNoCases() {
    Assert.assertEquals(RequirementVerdicts.verdict(List.of()), RequirementVerdicts.NOT_IN_PLAN);
  }

  @Test
  public void skippedAndUnknownResultsCountAsNotRun() {
    Assert.assertEquals(RequirementVerdicts.normalize("SKIPPED"), "NOT_RUN");
    Assert.assertEquals(RequirementVerdicts.normalize("PASSED"), "NOT_RUN");
    Assert.assertEquals(RequirementVerdicts.normalize(null), "NOT_RUN");
  }

  @Test
  public void latestByCasePicksMostRecentExecutedRow() {
    Map<String, String> latest =
        RequirementVerdicts.latestByCase(
            List.of(
                new ResultRow("tc1", "FAIL", T0),
                new ResultRow("tc1", "PASS", T0.plusDays(1)),
                new ResultRow("tc2", "PASS", T0.plusDays(1)),
                new ResultRow("tc2", "BLOCKED", T0)));
    Assert.assertEquals(latest.get("tc1"), "PASS");
    Assert.assertEquals(latest.get("tc2"), "PASS");
  }

  @Test
  public void unexecutedRowDoesNotHideEarlierExecution() {
    // 새 실행이 만들어졌지만 아직 돌리지 않은 TC 는 이전 실행의 결과가 남아야 한다
    Map<String, String> latest =
        RequirementVerdicts.latestByCase(
            List.of(new ResultRow("tc1", "FAIL", T0), new ResultRow("tc1", "NOT_RUN", null)));
    Assert.assertEquals(latest.get("tc1"), "FAIL");
  }

  @Test
  public void caseWithOnlyUnexecutedRowsIsNotRun() {
    Map<String, String> latest =
        RequirementVerdicts.latestByCase(List.of(new ResultRow("tc1", "PASS", null)));
    Assert.assertEquals(latest.get("tc1"), "NOT_RUN");
  }

  @Test
  public void coverageClassification() {
    Assert.assertEquals(
        RequirementVerdicts.coverage(Requirement.Status.VALID, 2, 0),
        RequirementVerdicts.UNCOVERED);
    Assert.assertEquals(
        RequirementVerdicts.coverage(Requirement.Status.VALID, 2, 1), RequirementVerdicts.PARTIAL);
    Assert.assertEquals(
        RequirementVerdicts.coverage(Requirement.Status.VALID, 2, 3), RequirementVerdicts.COVERED);
    // 기대 개수 0 은 1 로 본다. 연결이 하나라도 있으면 충족이다
    Assert.assertEquals(
        RequirementVerdicts.coverage(Requirement.Status.DRAFT, 0, 1), RequirementVerdicts.COVERED);
    Assert.assertEquals(
        RequirementVerdicts.coverage(Requirement.Status.NOT_TESTABLE, 1, 0),
        RequirementVerdicts.EXCLUDED);
    Assert.assertEquals(
        RequirementVerdicts.coverage(Requirement.Status.OBSOLETE, 1, 5),
        RequirementVerdicts.EXCLUDED);
  }
}
