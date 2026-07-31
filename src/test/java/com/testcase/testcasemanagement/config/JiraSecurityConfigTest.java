package com.testcase.testcasemanagement.config;

import static org.mockito.Mockito.when;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.core.env.Environment;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(Jira SSL 전면 우회) 하드닝 회귀 가드.
 *
 * <p>완화 정책: 인증서 검증 우회(skip-ssl-verification)는 설정값을 그대로 따르되(운영이라도 무중단), 운영에서는 강한 경고 로그를 남긴다. 여기서는 우회
 * 유효 여부가 설정 플래그를 따름을 검증한다(경고 로그 자체는 검증 대상 아님).
 */
public class JiraSecurityConfigTest {

  @Mock private Environment environment;
  private AutoCloseable mocks;

  @BeforeMethod
  public void setUp() {
    mocks = MockitoAnnotations.openMocks(this);
  }

  @AfterMethod
  public void tearDown() throws Exception {
    mocks.close();
  }

  private boolean bypassAllowed(String[] profiles, boolean skip) throws Exception {
    when(environment.getActiveProfiles()).thenReturn(profiles);
    JiraSecurityConfig config = new JiraSecurityConfig(environment);

    Field skipField = JiraSecurityConfig.class.getDeclaredField("skipSslVerification");
    skipField.setAccessible(true);
    skipField.setBoolean(config, skip);

    Method init = JiraSecurityConfig.class.getDeclaredMethod("init");
    init.setAccessible(true);
    init.invoke(config);

    Method m = JiraSecurityConfig.class.getDeclaredMethod("isSslBypassAllowed");
    m.setAccessible(true);
    return (boolean) m.invoke(config);
  }

  @Test
  public void bypassFollowsFlag_regardlessOfProfile() throws Exception {
    // 완화 정책: 운영이라도 설정값을 따라 우회는 동작한다(무중단). 운영에서는 init 이 강한 경고 로그를 남긴다.
    assertTrue(bypassAllowed(new String[] {"prod"}, true));
    assertTrue(bypassAllowed(new String[] {"production"}, true));
    assertTrue(bypassAllowed(new String[] {"dev"}, true));
    assertTrue(bypassAllowed(new String[] {"test"}, true));
  }

  @Test
  public void bypassDisabled_neverAllowed() throws Exception {
    assertFalse(bypassAllowed(new String[] {"dev"}, false));
    assertFalse(bypassAllowed(new String[] {"prod"}, false));
  }

  /**
   * dev-review R2(SSRF 잔여): Jira 아웃바운드 커넥션은 리다이렉트를 자동 추종하면 안 된다. 검증(#81)을 통과한 공개 URL 이 302 로
   * 사설/메타데이터(169.254.169.254)로 재유도하는 우회를 prepareConnection 이 차단하는지 검증한다.
   */
  @Test
  public void jiraConnection_doesNotFollowRedirects() throws Exception {
    when(environment.getActiveProfiles()).thenReturn(new String[] {"test"});
    JiraSecurityConfig config = new JiraSecurityConfig(environment);
    // httpsEnforce=false 로 두어 HTTPS/SSL 분기를 건너뛰고 리다이렉트 설정만 검증한다.
    Field httpsField = JiraSecurityConfig.class.getDeclaredField("httpsEnforce");
    httpsField.setAccessible(true);
    httpsField.setBoolean(config, false);

    org.springframework.http.client.SimpleClientHttpRequestFactory factory =
        (org.springframework.http.client.SimpleClientHttpRequestFactory)
            config.jiraClientHttpRequestFactory();

    java.net.HttpURLConnection conn =
        (java.net.HttpURLConnection)
            java.net.URI.create("http://example.com").toURL().openConnection();
    // 기본값은 true — prepareConnection 이 명시적으로 false 로 바꿔야 한다.
    conn.setInstanceFollowRedirects(true);

    Method prepare =
        org.springframework.http.client.SimpleClientHttpRequestFactory.class.getDeclaredMethod(
            "prepareConnection", java.net.HttpURLConnection.class, String.class);
    prepare.setAccessible(true);
    prepare.invoke(factory, conn, "GET");

    assertFalse(conn.getInstanceFollowRedirects(), "Jira 아웃바운드 커넥션은 리다이렉트를 추종하면 안 됨(SSRF 재유도 차단)");
  }
}
