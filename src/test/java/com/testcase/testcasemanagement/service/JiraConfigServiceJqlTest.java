package com.testcase.testcasemanagement.service;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import java.lang.reflect.Method;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(Jira JQL 원문 통과) 수정 회귀 가드.
 *
 * <p>buildJqlFromQuery 는 입력에 "project"/"and"/"order by" 부분문자열이 있으면 원문을 그대로 JQL 로 통과시켜, 평문 검색을 오판정하고
 * 임의 JQL 주입 경로를 열었다. 부분문자열 휴리스틱을 제거해 항상 이스케이프된 텍스트 검색/키 매치로만 변환됨을 검증한다.
 */
public class JiraConfigServiceJqlTest {

  private JiraConfigService service;

  @BeforeClass
  public void setUp() {
    // buildJqlFromQuery 는 필드 미사용 → null 의존성으로 인스턴스화 가능.
    service = new JiraConfigService(null, null, null);
  }

  private String buildJql(String query, String projectKey) throws Exception {
    Method m =
        JiraConfigService.class.getDeclaredMethod("buildJqlFromQuery", String.class, String.class);
    m.setAccessible(true);
    return (String) m.invoke(service, query, projectKey);
  }

  @Test
  public void emptyQuery_returnsRecentDefault() throws Exception {
    assertEquals(buildJql("   ", "PROJ"), "created >= -30d ORDER BY created DESC");
  }

  @Test
  public void issueKey_exactMatch() throws Exception {
    assertEquals(buildJql("TEST-123", "PROJ"), "key = \"TEST-123\"");
  }

  @Test
  public void plainTextWithJqlKeywords_notPassedThroughAsRawJql() throws Exception {
    // 과거엔 이 입력이 원문 JQL 로 통과됐다 — 이제 텍스트 검색으로만 변환돼야 한다.
    String q = "project and order by";
    String jql = buildJql(q, "PROJ");
    assertFalse(jql.equals(q), "원문 JQL 통과 금지");
    assertTrue(jql.startsWith("project = \"PROJ\" AND (summary ~ \"project and order by\""), jql);
    assertTrue(jql.endsWith("ORDER BY created DESC"), jql);
  }

  @Test
  public void quoteInjection_isEscapedInsideLiteral() throws Exception {
    // 리터럴을 탈출하려는 따옴표가 이스케이프돼 구조 주입이 불가능해야 한다.
    String q = "x\" OR project = \"SECRET";
    String jql = buildJql(q, "PROJ");
    assertTrue(jql.contains("x\\\" OR project = \\\"SECRET"), jql);
  }

  @Test
  public void backslashEscapedBeforeQuote() throws Exception {
    // 백슬래시를 먼저 이스케이프해 \" 이 온전히 표현돼야 한다.
    String jql = buildJql("a\\b", ""); // 프로젝트 스코프 없음
    assertTrue(jql.contains("summary ~ \"a\\\\b\""), jql);
    assertFalse(jql.startsWith("project ="), jql);
  }
}
