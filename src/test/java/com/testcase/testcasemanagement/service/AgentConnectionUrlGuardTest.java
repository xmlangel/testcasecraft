package com.testcase.testcasemanagement.service;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertThrows;
import static org.testng.Assert.expectThrows;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.model.AgentConnection;
import java.util.List;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 에이전트 주소 검증 가드.
 *
 * <p>사용자가 주소를 직접 넣고 서버가 그 주소를 호출하는 구조라 SSRF 위험이 있다. 에이전트는 내부망에 있는 것이 정상이라 사설 IP 를 통째로 막을 수 없으므로,
 * 대신 스킴·계정정보·질의문자열·메타데이터 호스트를 저장 시점에 좁힌다. 이 시험이 그 경계를 고정한다.
 */
public class AgentConnectionUrlGuardTest {

  private AgentConnectionService service;

  @BeforeMethod
  public void setUp() {
    // URL 검증은 리포지터리·암호화·감사에 의존하지 않는다. 협력자 없이 만든다.
    service = new AgentConnectionService(null, null, null);
  }

  @Test
  public void 정상주소를_받는다() {
    assertEquals(service.validateAndNormalizeUrl("https://qa-agent.internal:8090"),
        "https://qa-agent.internal:8090");
    assertEquals(service.validateAndNormalizeUrl("http://localhost:8090"),
        "http://localhost:8090");
    assertEquals(service.validateAndNormalizeUrl("https://agent.example.com"),
        "https://agent.example.com");
  }

  @Test
  public void 사설주소는_허용한다() {
    // 에이전트가 내부망에 있는 것이 정상 배치다. 여기서 막으면 기능을 쓸 수 없다.
    assertEquals(service.validateAndNormalizeUrl("http://10.0.3.14:8090"),
        "http://10.0.3.14:8090");
    assertEquals(service.validateAndNormalizeUrl("http://192.168.1.20:8090"),
        "http://192.168.1.20:8090");
  }

  @Test
  public void 뒤_슬래시와_경로를_정리한다() {
    assertEquals(service.validateAndNormalizeUrl("https://agent.example.com/"),
        "https://agent.example.com");
    assertEquals(service.validateAndNormalizeUrl("https://agent.example.com/qa/"),
        "https://agent.example.com/qa");
    assertEquals(service.validateAndNormalizeUrl("  https://agent.example.com  "),
        "https://agent.example.com");
  }

  @Test
  public void 메타데이터_엔드포인트를_거부한다() {
    for (String bad :
        List.of(
            "http://169.254.169.254",
            "http://169.254.169.254/latest/meta-data/",
            "http://metadata.google.internal/computeMetadata/v1/",
            "http://metadata",
            "http://100.100.200.200")) {
      IllegalArgumentException e =
          expectThrows(IllegalArgumentException.class, () -> service.validateAndNormalizeUrl(bad));
      assertTrue(e.getMessage().contains("등록할 수 없습니다"), bad + " -> " + e.getMessage());
    }
  }

  @Test
  public void 스킴을_제한한다() {
    for (String bad :
        List.of("file:///etc/passwd", "gopher://x.example.com", "ftp://x.example.com",
            "agent.example.com")) {
      IllegalArgumentException e =
          expectThrows(IllegalArgumentException.class, () -> service.validateAndNormalizeUrl(bad));
      assertTrue(e.getMessage().contains("http"), bad + " -> " + e.getMessage());
    }
  }

  @Test
  public void 계정정보와_질의문자열을_거부한다() {
    assertThrows(IllegalArgumentException.class,
        () -> service.validateAndNormalizeUrl("http://user:pw@agent.example.com"));
    assertThrows(IllegalArgumentException.class,
        () -> service.validateAndNormalizeUrl("https://agent.example.com?next=http://evil.com"));
    assertThrows(IllegalArgumentException.class,
        () -> service.validateAndNormalizeUrl("https://agent.example.com#frag"));
  }

  @Test
  public void 빈값과_깨진주소를_거부한다() {
    assertThrows(IllegalArgumentException.class, () -> service.validateAndNormalizeUrl(null));
    assertThrows(IllegalArgumentException.class, () -> service.validateAndNormalizeUrl("   "));
    assertThrows(IllegalArgumentException.class, () -> service.validateAndNormalizeUrl("http://"));
    assertThrows(IllegalArgumentException.class,
        () -> service.validateAndNormalizeUrl("https://[not a host]"));
  }

  @Test
  public void 딥링크를_만든다() {
    AgentConnection conn = new AgentConnection();
    conn.setProjectId("p-1");
    conn.setServerUrl("https://agent.example.com");

    String link = service.buildDeepLink(conn, "https://tc.example.com", List.of("c-1", "c-2"));
    assertTrue(link.startsWith("https://agent.example.com/runs/new?tms=testcasecraft"), link);
    assertTrue(link.contains("projectId=p-1"), link);
    assertTrue(link.contains("cases=c-1,c-2"), link);
    assertTrue(link.contains("base=https%3A%2F%2Ftc.example.com"), link);

    String bare = service.buildDeepLink(conn, null, List.of());
    assertTrue(!bare.contains("cases="), bare);
    assertTrue(!bare.contains("base="), bare);
  }

  @Test
  public void 실행가능_판정은_두_조건을_모두_요구한다() {
    AgentConnection conn = new AgentConnection();
    conn.setIsActive(true);
    conn.setConnectionVerified(false);
    assertTrue(!conn.isRunnable(), "연결 미확인이면 실행 불가");

    conn.setIsActive(false);
    conn.setConnectionVerified(true);
    assertTrue(!conn.isRunnable(), "꺼져 있으면 실행 불가");

    conn.setIsActive(true);
    conn.setConnectionVerified(true);
    assertTrue(conn.isRunnable());

    AgentConnection fresh = AgentConnection.builder().projectId("p").name("n")
        .serverUrl("https://a.example.com").build();
    assertEquals(fresh.getIsActive(), Boolean.FALSE, "빌더 기본값도 꺼짐이어야 한다");
    assertTrue(!fresh.isRunnable());
  }
}
