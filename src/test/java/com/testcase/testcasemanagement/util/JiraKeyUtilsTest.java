package com.testcase.testcasemanagement.util;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNull;
import static org.testng.Assert.assertTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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

  /**
   * application.yml 의 {@code app.jira.issue-key.pattern} 이 정본과 어긋나지 않는지 확인한다.
   *
   * <p>JiraIntegrationService 는 이 설정값을 그대로 컴파일해 쓴다. 과거에 yml 에 좁은 패턴이 명시돼 있어, 코드 쪽 기본값을 넓혀도 설정이 덮어써
   * AGV2-492 가 계속 "잘못된 이슈 키 형식"으로 거부됐다. 설정과 정본을 함께 움직이도록 묶어 둔다.
   */
  @Test
  public void applicationYmlPattern_acceptsDigitProjectKeys() throws IOException {
    String yml = Files.readString(Path.of("src/main/resources/application.yml"));
    Matcher m =
        Pattern.compile("issue-key:\\s*\\n(?:\\s*#[^\\n]*\\n)*\\s*pattern:\\s*(.+)").matcher(yml);
    assertTrue(m.find(), "application.yml 에서 app.jira.issue-key.pattern 을 찾지 못했다");

    // ${VAR:default} 형태면 기본값만, 아니면 값 그대로. 양쪽 따옴표는 제거.
    String raw = m.group(1).trim().replaceAll("^\"|\"$", "");
    Matcher placeholder = Pattern.compile("^\\$\\{[^:}]+:(.*)}$").matcher(raw);
    String pattern = placeholder.matches() ? placeholder.group(1) : raw;
    // yml 의 "\\d" 는 YAML 이스케이프를 거쳐 정규식 \d 가 된다.
    pattern = pattern.replace("\\\\", "\\");

    Pattern configured = Pattern.compile(pattern);
    assertTrue(configured.matcher("AGV2-492").matches(), "설정 패턴이 AGV2-492 를 거부한다: " + pattern);
    assertTrue(configured.matcher("ONT-904").matches(), "설정 패턴이 ONT-904 를 거부한다: " + pattern);
    assertFalse(configured.matcher("AGV2-").matches(), "번호 없는 키를 통과시킨다: " + pattern);
    assertFalse(configured.matcher("1AGV-1").matches(), "숫자로 시작하는 키를 통과시킨다: " + pattern);
  }
}
