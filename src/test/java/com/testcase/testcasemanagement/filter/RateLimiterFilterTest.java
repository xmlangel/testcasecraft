package com.testcase.testcasemanagement.filter;

import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import jakarta.servlet.http.HttpServletRequest;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(RateLimiterFilter XFF 우회 + 반영 XSS/JSON 주입) 수정 회귀 가드.
 *
 * <p>(1) 기본적으로 X-Forwarded-For/X-Real-IP 를 무시하고 소켓 주소를 써 IP 스푸핑 우회를 막고, (2) 신뢰 프록시 설정 시에만 헤더를 사용하며,
 * (3) rate-limit 에러 페이지가 헤더/URI 유래 값을 이스케이프하는지 검증한다.
 */
public class RateLimiterFilterTest {

  @Mock private HttpServletRequest request;
  private RateLimiterFilter filter;
  private AutoCloseable mocks;

  @BeforeMethod
  public void setUp() {
    mocks = MockitoAnnotations.openMocks(this);
    filter = new RateLimiterFilter();
  }

  @AfterMethod
  public void tearDown() throws Exception {
    mocks.close();
  }

  private void setTrustForwarded(boolean v) throws Exception {
    Field f = RateLimiterFilter.class.getDeclaredField("trustForwardedHeaders");
    f.setAccessible(true);
    f.setBoolean(filter, v);
  }

  private String extractClientIp() throws Exception {
    Method m =
        RateLimiterFilter.class.getDeclaredMethod("extractClientIp", HttpServletRequest.class);
    m.setAccessible(true);
    return (String) m.invoke(filter, request);
  }

  @Test
  public void ignoresForwardedHeadersByDefault_usesSocketAddress() throws Exception {
    setTrustForwarded(false);
    lenient().when(request.getHeader("X-Forwarded-For")).thenReturn("1.2.3.4");
    lenient().when(request.getHeader("X-Real-IP")).thenReturn("9.9.9.9");
    when(request.getRemoteAddr()).thenReturn("10.0.0.1");
    // 스푸핑된 XFF 무시 → 소켓 주소 → IP 회전으로 rate limit 우회 불가
    assertEquals(extractClientIp(), "10.0.0.1");
  }

  @Test
  public void usesForwardedFirstHop_whenTrustedProxyEnabled() throws Exception {
    setTrustForwarded(true);
    when(request.getHeader("X-Forwarded-For")).thenReturn("1.2.3.4, 5.6.7.8");
    assertEquals(extractClientIp(), "1.2.3.4");
  }

  @Test
  public void htmlErrorPage_escapesReflectedPath_noXss() throws Exception {
    Method m =
        RateLimiterFilter.class.getDeclaredMethod(
            "generateRateLimitHtmlPage", String.class, String.class);
    m.setAccessible(true);
    String malicious = "/x\"><script>alert(1)</script>";
    String html = (String) m.invoke(filter, "10.0.0.1", malicious);
    // 주입한 스크립트 원문이 그대로 들어가면 안 됨 (이스케이프되어야)
    assertFalse(html.contains("<script>alert(1)</script>"), "reflected script must be escaped");
    assertTrue(html.contains("&lt;script&gt;alert(1)"), "path should appear HTML-escaped");
  }

  @Test
  public void jsonEscape_escapesQuotesAndBackslash() throws Exception {
    Method m = RateLimiterFilter.class.getDeclaredMethod("jsonEscape", String.class);
    m.setAccessible(true);
    String out = (String) m.invoke(filter, "a\"b\\c");
    assertEquals(out, "a\\\"b\\\\c");
  }
}
