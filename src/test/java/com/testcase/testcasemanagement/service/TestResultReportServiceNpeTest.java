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
}
