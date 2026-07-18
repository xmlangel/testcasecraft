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
 * <p>인증서 검증 우회(skip-ssl-verification)는 운영(prod) 프로파일에서는 설정과 무관하게 강제로 거부돼야 한다(MITM 방지). 비운영에서만 우회가
 * 유효함을 검증한다.
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
  public void prodProfile_refusesSslBypass_evenWhenRequested() throws Exception {
    assertFalse(bypassAllowed(new String[] {"prod"}, true));
    assertFalse(bypassAllowed(new String[] {"production"}, true));
    assertFalse(bypassAllowed(new String[] {"docker", "prod"}, true));
  }

  @Test
  public void nonProdProfile_allowsSslBypass_whenRequested() throws Exception {
    assertTrue(bypassAllowed(new String[] {"dev"}, true));
    assertTrue(bypassAllowed(new String[] {"test"}, true));
  }

  @Test
  public void bypassDisabled_neverAllowed() throws Exception {
    assertFalse(bypassAllowed(new String[] {"dev"}, false));
    assertFalse(bypassAllowed(new String[] {"prod"}, false));
  }
}
