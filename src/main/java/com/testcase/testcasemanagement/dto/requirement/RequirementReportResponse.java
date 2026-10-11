package com.testcase.testcasemanagement.dto.requirement;

import java.util.List;
import java.util.Map;

/**
 * 요구사항 기반 리포트. 요구사항마다 플랜에 포함된 연결 TC 의 최신 결과를 모아 하나의 판정을 낸다.
 *
 * @param counts 판정별 요구사항 수(PASS·FAIL·BLOCKED·NOT_RUN·NOT_IN_PLAN)
 */
public record RequirementReportResponse(
    String testPlanId, String executionId, Map<String, Integer> counts, List<Item> items) {

  public record Item(
      String requirementId,
      String specId,
      String docId,
      String title,
      String verdict,
      List<CaseResult> testCases) {}

  public record CaseResult(String testCaseId, String displayId, String name, String result) {}
}
