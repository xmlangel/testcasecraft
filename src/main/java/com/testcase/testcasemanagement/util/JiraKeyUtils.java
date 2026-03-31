package com.testcase.testcasemanagement.util;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** JIRA 이슈 키 추출 및 정제를 위한 유틸리티 클래스 */
public class JiraKeyUtils {

  // JIRA 이슈 키 패턴 (예: ABC-123)
  private static final String JIRA_ISSUE_KEY_REGEX = "[A-Z][A-Z0-9]+-[0-9]+";
  private static final Pattern JIRA_KEY_PATTERN = Pattern.compile(JIRA_ISSUE_KEY_REGEX);

  /**
   * 입력된 문자열(URL, 콤마 구분값 등)에서 중복 없는 JIRA 이슈 키 목록을 추출하여 쉼표로 연결된 문자열로 반환합니다.
   *
   * @param input 사용자가 입력한 문자열 (예: "ONT-904", "https://.../browse/ONT-904, ONT-905")
   * @return 정제된 JIRA 이슈 키 문자열 (예: "ONT-904,ONT-905")
   */
  public static String extractJiraKeys(String input) {
    if (input == null || input.trim().isEmpty()) {
      return "";
    }

    Set<String> jiraKeys = new LinkedHashSet<>();

    // 쉼표나 공백으로 먼저 분리
    String[] parts = input.split("[,\\s]+");

    for (String part : parts) {
      if (part.trim().isEmpty()) continue;

      // 각 부분에서 JIRA 이슈 키 패턴 추출
      Matcher matcher = JIRA_KEY_PATTERN.matcher(part.toUpperCase());
      while (matcher.find()) {
        jiraKeys.add(matcher.group());
      }
    }

    return jiraKeys.isEmpty() ? "" : String.join(",", jiraKeys);
  }

  /**
   * 입력값이 단일 JIRA 이슈 키인지 확인합니다.
   *
   * @param input 확인할 문자열
   * @return JIRA 이슈 키 형식이면 true
   */
  public static boolean isValidJiraKey(String input) {
    if (input == null) return false;
    return input.matches("^" + JIRA_ISSUE_KEY_REGEX + "$");
  }
}
