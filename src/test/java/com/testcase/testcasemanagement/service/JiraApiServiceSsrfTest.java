package com.testcase.testcasemanagement.service;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.InetAddress;
import java.util.Optional;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(Jira SSRF) 수정 회귀 가드.
 *
 * <p>normalizeServerUrl 이 대상 호스트를 검증하지 않아, 설정 UI 로 서버 URL 을 넣는 사용자가 루프백/사설/링크로컬(클라우드 메타데이터
 * 169.254.169.254 포함) 로 서버측 요청을 유도할 수 있었다. 내부 대상 차단과 escape-hatch({@code
 * app.jira.allow-private-targets}) 동작을 검증한다.
 */
public class JiraApiServiceSsrfTest {

  private JiraApiService service;

  @BeforeMethod
  public void setUp() {
    // allowPrivateTargets 필드는 스프링 미개입 → 기본 false (안전 기본값).
    service = new JiraApiService(null, new ObjectMapper(), Optional.empty(), Optional.empty());
  }

  private String normalize(String url) throws Throwable {
    Method m = JiraApiService.class.getDeclaredMethod("normalizeServerUrl", String.class);
    m.setAccessible(true);
    try {
      return (String) m.invoke(service, url);
    } catch (InvocationTargetException e) {
      throw e.getCause();
    }
  }

  private void setAllowPrivate(boolean v) throws Exception {
    Field f = JiraApiService.class.getDeclaredField("allowPrivateTargets");
    f.setAccessible(true);
    f.setBoolean(service, v);
  }

  private boolean isBlocked(String ip) throws Exception {
    Method m = JiraApiService.class.getDeclaredMethod("isBlockedTarget", InetAddress.class);
    m.setAccessible(true);
    return (boolean) m.invoke(service, InetAddress.getByName(ip));
  }

  @DataProvider(name = "blockedUrls")
  public Object[][] blockedUrls() {
    return new Object[][] {
      {"http://127.0.0.1"}, // 루프백
      {"http://localhost"}, // 루프백으로 해석
      {"http://169.254.169.254"}, // 클라우드 메타데이터 (링크로컬)
      {"http://10.1.2.3"}, // 사설
      {"http://172.16.5.5"}, // 사설
      {"http://192.168.0.10"}, // 사설
      {"http://[::1]"}, // IPv6 루프백
      {"http://100.100.0.1"}, // CGNAT 100.64/10
    };
  }

  @Test(dataProvider = "blockedUrls", expectedExceptions = IllegalArgumentException.class)
  public void blocksInternalAndPrivateTargets(String url) throws Throwable {
    normalize(url);
  }

  @Test
  public void allowsPublicTarget_noOverBlocking() throws Throwable {
    // 공개 리터럴 IP 는 통과 (과도차단 방지). 리터럴이라 DNS 조회 없음.
    assertEquals(normalize("http://8.8.8.8/jira/"), "http://8.8.8.8/jira");
  }

  @Test
  public void allowPrivateTargetsFlag_bypassesBlocking() throws Throwable {
    // 신뢰된 on-prem 배포용 escape-hatch: 켜면 내부 대상도 허용.
    setAllowPrivate(true);
    assertEquals(normalize("http://127.0.0.1:8080"), "http://127.0.0.1:8080");
  }

  @Test
  public void cgnatRangeBoundaries() throws Exception {
    assertTrue(isBlocked("100.64.0.1"));
    assertTrue(isBlocked("100.127.255.255"));
    assertFalse(isBlocked("100.63.255.255"));
    assertFalse(isBlocked("100.128.0.1"));
    assertFalse(isBlocked("8.8.8.8"));
  }
}
