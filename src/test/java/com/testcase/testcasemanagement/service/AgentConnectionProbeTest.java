package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertNull;
import static org.testng.Assert.assertTrue;

import com.sun.net.httpserver.HttpServer;
import com.testcase.testcasemanagement.audit.AuditService;
import com.testcase.testcasemanagement.dto.AgentConnectionDto;
import com.testcase.testcasemanagement.model.AgentConnection;
import com.testcase.testcasemanagement.repository.AgentConnectionRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * 연결 테스트의 SSRF 방어 검증.
 *
 * <p>사용자가 주소를 넣고 서버가 그 주소를 호출하는 구조라, 응답 본문이 그대로 화면으로 돌아가면 이 기능으로 내부 서비스를 훑을 수 있다. 그래서 {@code status}
 * 와 {@code version} 두 필드만 꺼내고 나머지는 버린다. 이 시험이 그 경계를 실제 HTTP 응답으로 확인한다.
 */
public class AgentConnectionProbeTest {

  private static final String SECRET_MARKER = "INTERNAL-SECRET-DO-NOT-LEAK";

  private HttpServer server;
  private int port;
  private final AtomicReference<String> mode = new AtomicReference<>("ok");
  private final AtomicReference<String> lastPath = new AtomicReference<>("");
  private final AtomicReference<String> lastMethod = new AtomicReference<>("");

  private AgentConnectionService service;
  private AgentConnectionRepository repository;

  @BeforeClass
  public void startServer() throws IOException {
    server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
    port = server.getAddress().getPort();
    server.createContext(
        "/",
        exchange -> {
          lastPath.set(exchange.getRequestURI().getPath());
          lastMethod.set(exchange.getRequestMethod());
          String body;
          int code = 200;
          switch (mode.get()) {
            case "ok" -> body = "{\"status\":\"ok\",\"version\":\"0.3.1\"}";
            case "verbose" ->
                // 에이전트가 내부 정보를 흘리는 응답. 두 필드만 통과해야 한다
                body =
                    "{\"status\":\"ok\",\"version\":\"0.3.1\",\"env\":{\"DB_PASSWORD\":\""
                        + SECRET_MARKER
                        + "\"},\"hosts\":[\"pg.internal\"]}";
            case "notready" -> body = "{\"status\":\"degraded\",\"version\":\"0.3.1\"}";
            case "html" -> body = "<html><body>" + SECRET_MARKER + "</body></html>";
            case "error500" -> {
              code = 500;
              body = "{\"trace\":\"" + SECRET_MARKER + "\"}";
            }
            case "redirect" -> {
              code = 302;
              exchange.getResponseHeaders().add("Location", "http://127.0.0.1:1/internal");
              body = "";
            }
            case "huge" -> body = "{\"status\":\"ok\",\"pad\":\"" + "x".repeat(20000) + "\"}";
            default -> body = "{}";
          }
          byte[] out = body.getBytes(StandardCharsets.UTF_8);
          exchange.sendResponseHeaders(code, out.length);
          try (OutputStream os = exchange.getResponseBody()) {
            os.write(out);
          }
        });
    server.start();
  }

  @AfterClass(alwaysRun = true)
  public void stopServer() {
    if (server != null) {
      server.stop(0);
    }
  }

  private AgentConnectionDto.ConnectionTestResult run(String serverMode) {
    mode.set(serverMode);
    repository = mock(AgentConnectionRepository.class);
    EncryptionUtil encryption = mock(EncryptionUtil.class);
    AuditService audit = mock(AuditService.class);

    AgentConnection conn = new AgentConnection();
    conn.setId("a-1");
    conn.setProjectId("p-1");
    conn.setName("테스트 에이전트");
    conn.setServerUrl("http://127.0.0.1:" + port);
    conn.setIsActive(true);
    when(repository.findByProjectId("p-1")).thenReturn(Optional.of(conn));
    when(repository.save(any(AgentConnection.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    service = new AgentConnectionService(repository, encryption, audit);
    ReflectionTestUtils.setField(service, "integrationEnabled", true);
    return service.test("p-1", "tester");
  }

  @Test
  public void 정상응답을_받는다() {
    AgentConnectionDto.ConnectionTestResult r = run("ok");
    assertTrue(r.isOk());
    assertEquals(r.getVersion(), "0.3.1");
    assertNull(r.getError());
    assertTrue(r.getLatencyMs() >= 0);
  }

  @Test
  public void 경로를_health_로_고정한다() {
    run("ok");
    assertEquals(lastPath.get(), "/health", "임의 경로를 찍을 수 없어야 한다");
    assertEquals(lastMethod.get(), "GET", "GET 만 보낸다");
  }

  @Test
  public void 응답본문의_나머지_필드를_버린다() {
    AgentConnectionDto.ConnectionTestResult r = run("verbose");
    assertTrue(r.isOk());
    assertEquals(r.getVersion(), "0.3.1");
    String all = String.valueOf(r.getVersion()) + r.getError();
    assertFalse(all.contains(SECRET_MARKER), "응답 본문이 그대로 흘러나왔다");
  }

  @Test
  public void JSON_아닌_응답을_노출하지_않는다() {
    AgentConnectionDto.ConnectionTestResult r = run("html");
    assertFalse(r.isOk());
    assertFalse(r.getError().contains(SECRET_MARKER), r.getError());
  }

  @Test
  public void 오류응답의_본문을_노출하지_않는다() {
    AgentConnectionDto.ConnectionTestResult r = run("error500");
    assertFalse(r.isOk());
    assertFalse(r.getError().contains(SECRET_MARKER), r.getError());
    assertTrue(r.getError().contains("500"), r.getError());
  }

  @Test
  public void 리다이렉트를_따라가지_않는다() {
    AgentConnectionDto.ConnectionTestResult r = run("redirect");
    assertFalse(r.isOk());
    assertTrue(r.getError().contains("리다이렉트"), r.getError());
  }

  @Test
  public void 큰_응답을_거부한다() {
    AgentConnectionDto.ConnectionTestResult r = run("huge");
    assertFalse(r.isOk());
    assertFalse(r.getError().contains("x".repeat(50)), "본문이 흘러나왔다");
  }

  @Test
  public void 준비되지_않은_에이전트를_실패로_본다() {
    AgentConnectionDto.ConnectionTestResult r = run("notready");
    assertFalse(r.isOk());
    assertTrue(r.getError().contains("준비되지"), r.getError());
  }

  @Test
  public void 닫힌_포트는_제한시간_안에_실패한다() {
    AgentConnectionRepository repo = mock(AgentConnectionRepository.class);
    AgentConnection conn = new AgentConnection();
    conn.setProjectId("p-2");
    conn.setName("죽은 에이전트");
    conn.setServerUrl("http://127.0.0.1:1");
    when(repo.findByProjectId("p-2")).thenReturn(Optional.of(conn));
    when(repo.save(any(AgentConnection.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));

    AgentConnectionService svc =
        new AgentConnectionService(repo, mock(EncryptionUtil.class), mock(AuditService.class));
    ReflectionTestUtils.setField(svc, "integrationEnabled", true);

    long started = System.currentTimeMillis();
    AgentConnectionDto.ConnectionTestResult r = svc.test("p-2", "tester");
    long elapsed = System.currentTimeMillis() - started;

    assertFalse(r.isOk());
    assertTrue(r.getError().contains("연결할 수 없습니다"), r.getError());
    assertTrue(elapsed < 6000, "제한 시간 안에 끝나야 한다. 실제 " + elapsed + "ms");
  }

  @Test
  public void 킬스위치가_꺼지면_실행가능이_거짓이다() {
    AgentConnectionRepository repo = mock(AgentConnectionRepository.class);
    AgentConnection conn = new AgentConnection();
    conn.setProjectId("p-3");
    conn.setIsActive(true);
    conn.setConnectionVerified(true);
    when(repo.findByProjectId("p-3")).thenReturn(Optional.of(conn));

    AgentConnectionService svc =
        new AgentConnectionService(repo, mock(EncryptionUtil.class), mock(AuditService.class));

    ReflectionTestUtils.setField(svc, "integrationEnabled", false);
    assertFalse(svc.isIntegrationEnabled());
    assertFalse(svc.isRunnable("p-3"), "킬스위치가 꺼지면 켜진 설정도 실행 불가다");

    ReflectionTestUtils.setField(svc, "integrationEnabled", true);
    assertTrue(svc.isRunnable("p-3"));

    // 설정이 없는 프로젝트는 실행 불가. 실패의 기본값이 숨김이다
    when(repo.findByProjectId("p-없음")).thenReturn(Optional.empty());
    assertFalse(svc.isRunnable("p-없음"));
    Mockito.verify(repo).findByProjectId("p-없음");
  }
}
