package com.testcase.testcasemanagement.util;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNull;
import static org.testng.Assert.assertTrue;

import org.testng.annotations.Test;

/**
 * 이슈 키 패턴 회귀 가드.
 *
 * <p>JIRA 프로젝트 키는 첫 글자가 영문이고 이후 영문·숫자가 올 수 있다. 코드 여러 곳이 {@code [A-Z]+} 로 좁혀 놓아 {@code AGV2-100} 같은
 * 키를 형식 오류로 판정했고, 이슈 검색이 키 검색 대신 텍스트 검색으로 흘러가 결과가 0건이었다.
 */
public class JiraKeyUtilsTest {

  @Test
  public void projectKeyWithDigits_isValid() {
    assertTrue(JiraKeyUtils.isValidJiraKey("AGV2-100"));
    assertTrue(JiraKeyUtils.isValidJiraKey("ONT-904"));
    assertTrue(JiraKeyUtils.isValidJiraKey("A1B2-7"));
  }

  @Test
  public void malformedKeys_areRejected() {
    assertFalse(JiraKeyUtils.isValidJiraKey("1AGV-100")); // 숫자로 시작
    assertFalse(JiraKeyUtils.isValidJiraKey("A-100")); // 프로젝트 키 1글자
    assertFalse(JiraKeyUtils.isValidJiraKey("AGV2-")); // 번호 없음
    assertFalse(JiraKeyUtils.isValidJiraKey("agv2-100")); // 소문자는 정규화 대상
    assertFalse(JiraKeyUtils.isValidJiraKey(null));
  }

  @Test
  public void normalizeIssueKey_trimsAndUppercases() {
    assertEquals(JiraKeyUtils.normalizeIssueKey("  agv2-100 "), "AGV2-100");
    assertEquals(JiraKeyUtils.normalizeIssueKey("AGV2-100"), "AGV2-100");
  }

  @Test
  public void normalizeIssueKey_returnsNullForNonKey() {
    assertNull(JiraKeyUtils.normalizeIssueKey("AGV2-100 크래시"));
    assertNull(JiraKeyUtils.normalizeIssueKey(""));
    assertNull(JiraKeyUtils.normalizeIssueKey(null));
  }

  @Test
  public void extractJiraKeys_handlesDigitProjectKeysAndUrls() {
    assertEquals(JiraKeyUtils.extractJiraKeys("agv2-100"), "AGV2-100");
    assertEquals(
        JiraKeyUtils.extractJiraKeys("https://jira.example.com/browse/AGV2-100, AGV2-101"),
        "AGV2-100,AGV2-101");
  }
}
