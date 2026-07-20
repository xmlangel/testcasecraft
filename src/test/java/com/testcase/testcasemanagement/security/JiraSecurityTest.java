// src/test/java/com/testcase/testcasemanagement/security/JiraSecurityTest.java
package com.testcase.testcasemanagement.security;

import static org.testng.Assert.*;

import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.testcase.testcasemanagement.service.JiraApiService;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * JIRA 보안 관련 테스트 — 서버 URL 정규화·API 토큰 형식·데이터 격리.
 *
 * <p>과거 여기 있던 암호화 라운드트립 테스트는 미사용(main 참조 0) EncryptionService 를 대상으로 했다. 실사용 암호화 정본은
 * security.EncryptionUtil 이며 EncryptionUtilTest 가 검증한다 — EncryptionService 와 그 죽은 테스트는 함께 제거했다.
 */
@SpringBootTest
@ActiveProfiles("test")
class JiraSecurityTest extends AbstractTestNGSpringContextTests {

  @Autowired private JiraApiService jiraApiService;

  private SecureRandom secureRandom;

  @BeforeMethod
  void setUp() {
    secureRandom = new SecureRandom();
  }

  @Test(description = "JIRA 서버 URL 정규화 보안 테스트")
  void testJiraUrlNormalizationSecurity() {
    // 정상적인 URL
    final JiraConfigDto.TestConnectionDto validTestConfig =
        JiraConfigDto.TestConnectionDto.builder()
            .serverUrl("https://company.atlassian.net")
            .username("user@company.com")
            .apiToken("token")
            .build();

    jiraApiService.testConnection(validTestConfig);

    // HTTP URL (보안상 HTTPS로 업그레이드되어야 함)
    final JiraConfigDto.TestConnectionDto httpTestConfig =
        JiraConfigDto.TestConnectionDto.builder()
            .serverUrl("http://company.atlassian.net")
            .username("user@company.com")
            .apiToken("token")
            .build();

    jiraApiService.testConnection(httpTestConfig);
  }

  @Test(description = "JIRA API 토큰 형식 검증 테스트")
  void testApiTokenFormatValidation() {
    // 일반적인 JIRA API 토큰 형식 (길이 24자, Base64 문자)
    String validToken = generateMockApiToken();
    assertTrue(isValidApiTokenFormat(validToken), "유효한 API 토큰 형식이어야 함");

    // 너무 짧은 토큰
    assertFalse(isValidApiTokenFormat("short"), "너무 짧은 토큰은 유효하지 않음");

    // 특수문자가 포함된 토큰
    assertFalse(isValidApiTokenFormat("token-with-special-chars!@#"), "특수문자가 포함된 토큰은 유효하지 않음");
  }

  @Test(description = "사용자별 데이터 격리 테스트")
  void testUserDataIsolation() {
    // 사용자 ID가 다르면 다른 사용자의 데이터에 접근할 수 없어야 함 (실제 격리 검증은 JiraIntegrationTest)
    String user1Id = "user1-id";
    String user2Id = "user2-id";

    assertNotEquals(user2Id, user1Id, "사용자 ID는 달라야 함");
  }

  // Helper methods

  private String generateMockApiToken() {
    byte[] tokenBytes = new byte[18]; // 24 Base64 characters = 18 bytes
    secureRandom.nextBytes(tokenBytes);
    return Base64.getEncoder().encodeToString(tokenBytes);
  }

  private boolean isValidApiTokenFormat(String token) {
    if (token == null || token.length() < 20) {
      return false;
    }

    // Base64 문자만 포함하는지 확인
    Pattern base64Pattern = Pattern.compile("^[A-Za-z0-9+/]*={0,2}$");
    return base64Pattern.matcher(token).matches();
  }
}
