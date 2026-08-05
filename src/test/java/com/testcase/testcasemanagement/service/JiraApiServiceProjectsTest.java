package com.testcase.testcasemanagement.service;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.JiraConfigDto;
import java.lang.reflect.Field;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.testng.annotations.Test;

/**
 * 프로젝트 목록 조회 회귀 가드.
 *
 * <p>Jira Cloud 가 전체 조회 엔드포인트(GET /rest/api/3/project)를 폐기해 사이트에 프로젝트가 있어도 200 + 빈 배열이 오고, 그 결과 설정
 * 화면과 이슈 생성 다이얼로그의 프로젝트 목록이 비었다(로그: "프로젝트 목록 조회 성공 ... count=0"). 페이지네이션 엔드포인트(project/search) 순회와
 * 구형 서버 폴백을 검증한다.
 */
public class JiraApiServiceProjectsTest {

  private static final String BASE = "http://127.0.0.1:9999";

  /** 요청 URI 를 기록하고 미리 정한 응답을 돌려주는 RestTemplate. 네트워크를 타지 않는다. */
  private static class StubRestTemplate extends RestTemplate {
    private final Map<String, ResponseEntity<String>> canned;
    private final RuntimeException throwOnMatch;
    private final String throwWhenContains;
    final List<String> requested = new ArrayList<>();

    StubRestTemplate(Map<String, ResponseEntity<String>> canned) {
      this(canned, null, null);
    }

    StubRestTemplate(
        Map<String, ResponseEntity<String>> canned,
        String throwWhenContains,
        RuntimeException throwOnMatch) {
      this.canned = canned;
      this.throwWhenContains = throwWhenContains;
      this.throwOnMatch = throwOnMatch;
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> ResponseEntity<T> exchange(
        URI url, HttpMethod method, HttpEntity<?> request, Class<T> responseType) {
      String uri = url.toString();
      requested.add(uri);
      if (throwWhenContains != null && uri.contains(throwWhenContains)) {
        throw throwOnMatch;
      }
      for (Map.Entry<String, ResponseEntity<String>> entry : canned.entrySet()) {
        if (uri.contains(entry.getKey())) {
          return (ResponseEntity<T>) entry.getValue();
        }
      }
      return (ResponseEntity<T>) ResponseEntity.ok("{}");
    }
  }

  private JiraApiService serviceWith(RestTemplate client) throws Exception {
    JiraApiService service =
        new JiraApiService(client, new ObjectMapper(), Optional.empty(), Optional.empty());
    // 스텁이 요청을 가로채므로 실제 접속은 없다. 사설 IP 가드만 풀어 준다.
    Field allowPrivate = JiraApiService.class.getDeclaredField("allowPrivateTargets");
    allowPrivate.setAccessible(true);
    allowPrivate.set(service, true);
    return service;
  }

  private static String project(String key) {
    return "{\"id\":\"10001\",\"key\":\""
        + key
        + "\",\"name\":\"proj-"
        + key
        + "\",\"description\":\"\",\"projectTypeKey\":\"software\","
        + "\"lead\":{\"displayName\":\"tester\"}}";
  }

  private static String page(String key, String name, boolean isLast) {
    // maxResults 를 실제 담긴 건수(1)로 맞춘다. 실제 Jira 응답도 페이지 크기를 함께 준다.
    return "{\"maxResults\":1,\"isLast\":"
        + isLast
        + ",\"values\":[{\"id\":\"10001\",\"key\":\""
        + key
        + "\",\"name\":\""
        + name
        + "\",\"description\":\"\",\"projectTypeKey\":\"software\","
        + "\"lead\":{\"displayName\":\"tester\"}}]}";
  }

  @Test
  public void projectSearch_페이지를_끝까지_순회하고_values_를_읽는다() throws Exception {
    StubRestTemplate client =
        new StubRestTemplate(
            Map.of(
                "startAt=0", ResponseEntity.ok(page("AS", "AgensSQL", false)),
                "startAt=1", ResponseEntity.ok(page("AG", "AgensGraph", true))));

    List<JiraConfigDto.JiraProjectDto> projects =
        serviceWith(client).getProjects(BASE, "qa@example.com", "token");

    assertEquals(projects.size(), 2);
    assertEquals(projects.get(0).getKey(), "AS");
    assertEquals(projects.get(1).getKey(), "AG");
    assertEquals(projects.get(0).getLeadDisplayName(), "tester");
    assertTrue(client.requested.get(0).contains("/rest/api/3/project/search"));
    assertTrue(client.requested.get(1).contains("startAt=1"));
  }

  @Test
  public void isLast_true_면_다음_페이지를_요청하지_않는다() throws Exception {
    StubRestTemplate client =
        new StubRestTemplate(Map.of("startAt=0", ResponseEntity.ok(page("AS", "AgensSQL", true))));

    List<JiraConfigDto.JiraProjectDto> projects =
        serviceWith(client).getProjects(BASE, "qa@example.com", "token");

    assertEquals(projects.size(), 1);
    assertEquals(client.requested.size(), 1);
  }

  @Test
  public void project_search_가_없는_구형서버는_전체조회로_폴백한다() throws Exception {
    String legacyArray =
        "[{\"id\":\"10002\",\"key\":\"LEG\",\"name\":\"Legacy\",\"description\":\"\","
            + "\"projectTypeKey\":\"software\",\"lead\":{\"displayName\":\"admin\"}}]";
    StubRestTemplate client =
        new StubRestTemplate(
            Map.of("/rest/api/3/project", ResponseEntity.ok(legacyArray)),
            "/project/search",
            HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found", null, null, null));

    List<JiraConfigDto.JiraProjectDto> projects =
        serviceWith(client).getProjects(BASE, "qa@example.com", "token");

    assertEquals(projects.size(), 1);
    assertEquals(projects.get(0).getKey(), "LEG");
  }

  @Test
  public void 권한부족_403_은_예외없이_빈_목록이다() throws Exception {
    // RestTemplate 기본 핸들러는 4xx 를 예외로 던진다 — 프로덕션에서 실제로 오는 경로
    StubRestTemplate client =
        new StubRestTemplate(
            Map.of(),
            "/project/search",
            HttpClientErrorException.create(HttpStatus.FORBIDDEN, "Forbidden", null, null, null));

    List<JiraConfigDto.JiraProjectDto> projects =
        serviceWith(client).getProjects(BASE, "qa@example.com", "token");

    assertTrue(projects.isEmpty());
    // 빈 목록이면 원인 판별용 myself 호출이 붙으므로 project/search 요청만 센다
    assertEquals(client.requested.stream().filter(u -> u.contains("/project/search")).count(), 1L);
  }

  @Test
  public void isLast_가_없어도_다음_페이지를_읽는다() throws Exception {
    // 구형 DC·프록시가 isLast 를 빼는 경우. 첫 페이지가 가득 차 있으면 계속 읽어야 한다.
    StringBuilder full = new StringBuilder("{\"maxResults\":2,\"values\":[");
    full.append(project("A1")).append(",").append(project("A2")).append("]}");
    StubRestTemplate client =
        new StubRestTemplate(
            Map.of(
                "startAt=0",
                ResponseEntity.ok(full.toString()),
                "startAt=2",
                ResponseEntity.ok("{\"maxResults\":2,\"values\":[" + project("A3") + "]}")));

    List<JiraConfigDto.JiraProjectDto> projects =
        serviceWith(client).getProjects(BASE, "qa@example.com", "token");

    assertEquals(projects.size(), 3);
    assertEquals(client.requested.size(), 2);
  }

  @Test
  public void 서버가_페이지크기를_깎으면_받은_개수만큼_전진한다() throws Exception {
    // maxResults=50 을 요청해도 서버가 2로 깎아 줄 수 있다. startAt 을 50 씩 올리면 중간이 빠진다.
    StubRestTemplate client =
        new StubRestTemplate(
            Map.of(
                "startAt=0",
                ResponseEntity.ok(
                    "{\"maxResults\":2,\"isLast\":false,\"values\":["
                        + project("B1")
                        + ","
                        + project("B2")
                        + "]}"),
                "startAt=2",
                ResponseEntity.ok(
                    "{\"maxResults\":2,\"isLast\":true,\"values\":[" + project("B3") + "]}")));

    List<JiraConfigDto.JiraProjectDto> projects =
        serviceWith(client).getProjects(BASE, "qa@example.com", "token");

    assertEquals(projects.size(), 3);
    assertTrue(client.requested.get(1).contains("startAt=2"));
  }

  @Test
  public void values_가_비어도_무한루프에_빠지지_않는다() throws Exception {
    // isLast 가 없고 values 도 비어 있는 응답(권한 없는 계정) — 한 번만 요청하고 끝나야 한다
    StubRestTemplate client =
        new StubRestTemplate(Map.of("startAt=", ResponseEntity.ok("{\"values\":[]}")));

    List<JiraConfigDto.JiraProjectDto> projects =
        serviceWith(client).getProjects(BASE, "qa@example.com", "token");

    assertTrue(projects.isEmpty());
    // 빈 목록이면 원인 판별용 myself 호출이 붙으므로 project/search 요청만 센다
    assertEquals(client.requested.stream().filter(u -> u.contains("/project/search")).count(), 1L);
  }

  @Test
  public void 잘못된_자격증명은_연결_성공으로_저장되지_않는다() throws Exception {
    // serverInfo 는 공개라 200 이 오지만 myself 는 401 → 인증 실패로 판정해야 한다
    StubRestTemplate client =
        new StubRestTemplate(
            Map.of("/serverInfo", ResponseEntity.ok("{\"version\":\"1001.0.0\"}")),
            "/myself",
            HttpClientErrorException.create(
                HttpStatus.UNAUTHORIZED, "Unauthorized", null, null, null));

    JiraConfigDto.ConnectionStatusDto status =
        serviceWith(client)
            .testConnection(
                JiraConfigDto.TestConnectionDto.builder()
                    .serverUrl(BASE)
                    .username("teddy")
                    .apiToken("token")
                    .build());

    assertEquals(status.getIsConnected(), Boolean.FALSE);
    assertEquals(status.getStatus(), "인증 실패");
  }

  @Test
  public void 인증되면_연결_성공이다() throws Exception {
    StubRestTemplate client =
        new StubRestTemplate(
            Map.of(
                "/serverInfo",
                ResponseEntity.ok("{\"version\":\"1001.0.0\"}"),
                "/myself",
                ResponseEntity.ok(
                    "{\"accountId\":\"5f0\",\"emailAddress\":\"qa@example.com\","
                        + "\"displayName\":\"QA\"}")));

    JiraConfigDto.ConnectionStatusDto status =
        serviceWith(client)
            .testConnection(
                JiraConfigDto.TestConnectionDto.builder()
                    .serverUrl(BASE)
                    .username("qa@example.com")
                    .apiToken("token")
                    .build());

    assertEquals(status.getIsConnected(), Boolean.TRUE);
  }

  @Test
  public void 목록이_비면_myself_로_원인을_가른다() throws Exception {
    StubRestTemplate client =
        new StubRestTemplate(
            Map.of("/project/search", ResponseEntity.ok("{\"isLast\":true,\"values\":[]}")),
            "/myself",
            HttpClientErrorException.create(
                HttpStatus.UNAUTHORIZED, "Unauthorized", null, null, null));

    List<JiraConfigDto.JiraProjectDto> projects =
        serviceWith(client).getProjects(BASE, "teddy", "token");

    assertTrue(projects.isEmpty());
    assertTrue(client.requested.stream().anyMatch(u -> u.contains("/rest/api/3/myself")));
  }
}
