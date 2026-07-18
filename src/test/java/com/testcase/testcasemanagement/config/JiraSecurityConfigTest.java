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
}
