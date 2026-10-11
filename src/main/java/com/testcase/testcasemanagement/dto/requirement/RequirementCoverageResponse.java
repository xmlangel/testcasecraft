package com.testcase.testcasemanagement.dto.requirement;

import java.util.List;

/**
 * 커버리지 분석 결과. NOT_TESTABLE·OBSOLETE 요구사항은 분모(testable)에서 뺀다.
 *
 * @param coverageRate 연결 TC 가 기대 개수 이상인 요구사항 비율(0~100). testable 이 0 이면 0.
 */
public record RequirementCoverageResponse(
    int total,
    int testable,
    int covered,
    int partial,
    int uncovered,
    double coverageRate,
    List<Item> items) {

  /** coverage 는 COVERED·PARTIAL·UNCOVERED·EXCLUDED 중 하나. */
  public record Item(
      String requirementId,
      String specId,
      String docId,
      String title,
      String status,
      int expectedCoverage,
      int linkedCount,
      String coverage) {}
}
