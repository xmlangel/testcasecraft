package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.Requirement;
import com.testcase.testcasemanagement.model.TestResultStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 요구사항 커버리지·리포트 판정 규칙. 저장소에 의존하지 않는 순수 함수만 둔다.
 *
 * <p>판정 우선순위는 TestLink 1.9.20 사용자 매뉴얼 7.7절(Requirements based report)을 따른다: FAIL &gt; BLOCKED &gt;
 * NOT_RUN &gt; PASS. TestLink 에 없는 SKIPPED 는 실행되지 않은 것으로 보고 NOT_RUN 에 넣는다.
 */
public final class RequirementVerdicts {

  public static final String NOT_IN_PLAN = "NOT_IN_PLAN";

  public static final String COVERED = "COVERED";
  public static final String PARTIAL = "PARTIAL";
  public static final String UNCOVERED = "UNCOVERED";
  public static final String EXCLUDED = "EXCLUDED";

  private RequirementVerdicts() {}

  /** 결과 한 행. executedAt 이 null 이면 아직 실행되지 않은 행이다. */
  public record ResultRow(String testCaseId, String result, LocalDateTime executedAt) {}

  /** 실행되지 않은 상태를 NOT_RUN 으로 맞춘다. 알 수 없는 값도 NOT_RUN 이다. */
  public static String normalize(String result) {
    if (TestResultStatus.PASS.value().equals(result)
        || TestResultStatus.FAIL.value().equals(result)
        || TestResultStatus.BLOCKED.value().equals(result)) {
      return result;
    }
    return TestResultStatus.NOT_RUN.value();
  }

  /**
   * TC 별 최신 결과. executedAt 이 가장 늦은 행을 고르고, 실행 시각이 없는 행은 실행된 행이 하나도 없을 때만 쓴다.
   *
   * @return testCaseId → 정규화된 결과
   */
  public static Map<String, String> latestByCase(Collection<ResultRow> rows) {
    Map<String, ResultRow> latest = new HashMap<>();
    for (ResultRow row : rows) {
      if (row.testCaseId() == null) {
        continue;
      }
      latest.merge(row.testCaseId(), row, RequirementVerdicts::later);
    }
    Map<String, String> out = new HashMap<>();
    latest.forEach(
        (tcId, row) ->
            out.put(
                tcId,
                row.executedAt() == null
                    ? TestResultStatus.NOT_RUN.value()
                    : normalize(row.result())));
    return out;
  }

  private static ResultRow later(ResultRow a, ResultRow b) {
    if (a.executedAt() == null) {
      return b;
    }
    if (b.executedAt() == null) {
      return a;
    }
    return b.executedAt().isAfter(a.executedAt()) ? b : a;
  }

  /** 요구사항 하나의 판정. 플랜에 들어간 연결 TC 가 없으면 NOT_IN_PLAN. */
  public static String verdict(List<String> caseResults) {
    if (caseResults.isEmpty()) {
      return NOT_IN_PLAN;
    }
    if (caseResults.contains(TestResultStatus.FAIL.value())) {
      return TestResultStatus.FAIL.value();
    }
    if (caseResults.contains(TestResultStatus.BLOCKED.value())) {
      return TestResultStatus.BLOCKED.value();
    }
    if (caseResults.stream().anyMatch(r -> !TestResultStatus.PASS.value().equals(r))) {
      return TestResultStatus.NOT_RUN.value();
    }
    return TestResultStatus.PASS.value();
  }

  /** 커버리지 판정. NOT_TESTABLE·OBSOLETE 는 분석에서 뺀다(EXCLUDED). */
  public static String coverage(Requirement.Status status, int expected, int linked) {
    if (status == Requirement.Status.NOT_TESTABLE || status == Requirement.Status.OBSOLETE) {
      return EXCLUDED;
    }
    if (linked == 0) {
      return UNCOVERED;
    }
    return linked >= Math.max(expected, 1) ? COVERED : PARTIAL;
  }
}
