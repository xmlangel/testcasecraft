package com.testcase.testcasemanagement.service;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.dto.JiraStatusSummaryDto;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestResult;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(TestResultReportService 잔여 null-NPE) 회귀 가드.
 *
 * <p>null 판정(result)·null 실행시각(executedAt)이 섞인 데이터가 (1) groupingBy 분포 계산, (2) max(executedAt) 최신
 * 추출, (3) 담당자별 집계에서 NPE/널-키를 만들지 않고 NOT_RUN 으로 정규화되는지 검증한다. 대상 private 메서드는 주입 의존성을 쓰지 않아 null
 * 의존성으로 인스턴스화해 리플렉션 호출한다.
 */
public class TestResultReportServiceNpeTest {

  private TestResultReportService service;

  @BeforeClass
  public void setUp() {
    service = new TestResultReportService(null, null, null, null, null, null);
  }

  private TestResult result(String verdict, LocalDateTime executedAt) {
    TestResult r = new TestResult();
    r.setResult(verdict);
    r.setExecutedAt(executedAt);
    return r;
  }

  @Test
  public void createJiraStatusSummary_handlesNullResultAndExecutedAt() throws Exception {
    // 하나는 null 판정 + null 실행시각(과거 NPE 유발), 하나는 정상 PASS.
    List<TestResult> related =
        List.of(result(null, null), result("PASS", LocalDateTime.of(2026, 7, 18, 10, 0)));

    Method m =
        TestResultReportService.class.getDeclaredMethod(
            "createJiraStatusSummary", String.class, List.class);
    m.setAccessible(true);
    JiraStatusSummaryDto dto = (JiraStatusSummaryDto) m.invoke(service, "TEST-1", related);

    // groupingBy 가 NPE 없이 null → NOT_RUN 으로 집계
    Map<String, Long> dist = dto.getTestResultDistribution();
    assertEquals(dist.get("NOT_RUN"), Long.valueOf(1));
    assertEquals(dist.get("PASS"), Long.valueOf(1));
    assertFalse(dist.containsKey(null), "null 판정 키가 생기면 안 됨");
    // max(executedAt) 가 nullsFirst 로 NPE 없이 최신(비-null 실행시각)을 고름
    assertEquals(dto.getLatestTestResult(), "PASS");
  }

  @Test
  public void aggregateByAssignee_normalizesNullResultKey() throws Exception {
    TestExecution exec = new TestExecution();
    exec.setResults(List.of(result(null, null))); // null 판정 + 담당자 미지정

    Method m =
        TestResultReportService.class.getDeclaredMethod(
            "aggregateTestResultsByAssignee", List.class);
    m.setAccessible(true);
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> out = (List<Map<String, Object>>) m.invoke(service, List.of(exec));

    assertEquals(out.size(), 1);
    Map<String, Object> row = out.get(0);
    assertTrue(row.containsKey("NOT_RUN"), "null 판정은 NOT_RUN 으로 정규화되어야");
    assertFalse(row.containsKey(null), "null 상태 키가 생기면 안 됨");
  }

  // ===== dev-review R2(P1): NOT_RUN enum 정본화 리팩터 前 동작 고정(특성화) =====

  /**
   * NOT_RUN/PASS/FAIL/BLOCKED 리터럴이 39곳에 산재해 enum(TestResultStatus) 정본화가 예정돼 있다. 그 리팩터가 분포 집계 동작을
   * 바꾸지 않도록 <b>현재 동작을 고정</b>한다: 각 판정이 자기 이름의 버킷으로 정확히 분리되고, null 은 NOT_RUN 으로 정규화된다.
   */
  @Test
  public void distribution_currentLiteralBuckets_characterization() throws Exception {
    List<TestResult> related =
        List.of(
            result("PASS", null),
            result("FAIL", null),
            result("BLOCKED", null),
            result("NOT_RUN", null),
            result(null, null));

    Method m =
        TestResultReportService.class.getDeclaredMethod(
            "createJiraStatusSummary", String.class, List.class);
    m.setAccessible(true);
    JiraStatusSummaryDto dto = (JiraStatusSummaryDto) m.invoke(service, "CHAR-1", related);
    Map<String, Long> dist = dto.getTestResultDistribution();

    assertEquals(dist.get("PASS"), Long.valueOf(1));
    assertEquals(dist.get("FAIL"), Long.valueOf(1));
    assertEquals(dist.get("BLOCKED"), Long.valueOf(1));
    // NOT_RUN 명시 1건 + null 정규화 1건 = 2 (enum 정본화 후에도 유지돼야 하는 불변식)
    assertEquals(dist.get("NOT_RUN"), Long.valueOf(2));
    assertFalse(dist.containsKey(null), "null 키가 생기면 안 됨");
  }

  /**
   * <b>알려진 갭 고정</b>: 삭제된 DatabaseInitializer 가 넣던 과거형 "PASSED"/"FAILED" 값이 DB 에 남아 있으면 현재는
   * PASS/FAIL 로 정규화되지 않고 자기 이름 그대로 별도 버킷이 된다(어느 표준 카운트에도 안 잡히는 silent drift). enum 정본화 시 이 값들을 어떻게
   * 다룰지 (마이그레이션/거부) 결정하기 위한 현재 동작 기준선.
   */
  @Test
  public void distribution_legacyPassedFailed_currentlyNotNormalized_characterization()
      throws Exception {
    List<TestResult> related = List.of(result("PASSED", null), result("FAILED", null));

    Method m =
        TestResultReportService.class.getDeclaredMethod(
            "createJiraStatusSummary", String.class, List.class);
    m.setAccessible(true);
    JiraStatusSummaryDto dto = (JiraStatusSummaryDto) m.invoke(service, "CHAR-2", related);
    Map<String, Long> dist = dto.getTestResultDistribution();

    // 현재 동작: 과거형이 표준 PASS/FAIL 로 합쳐지지 않고 별도 버킷으로 남는다.
    assertEquals(dist.get("PASSED"), Long.valueOf(1), "레거시 PASSED 는 현재 정규화되지 않음(기준선)");
    assertEquals(dist.get("FAILED"), Long.valueOf(1), "레거시 FAILED 는 현재 정규화되지 않음(기준선)");
    assertFalse(dist.containsKey("PASS"), "현재는 PASS 로 합쳐지지 않음");
  }
}
