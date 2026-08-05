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

  private static String page(String key, String name, boolean isLast) {
    return "{\"isLast\":"
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
                "startAt=50", ResponseEntity.ok(page("AG", "AgensGraph", true))));

    List<JiraConfigDto.JiraProjectDto> projects =
        serviceWith(client).getProjects(BASE, "qa@example.com", "token");

    assertEquals(projects.size(), 2);
    assertEquals(projects.get(0).getKey(), "AS");
    assertEquals(projects.get(1).getKey(), "AG");
    assertEquals(projects.get(0).getLeadDisplayName(), "tester");
    assertTrue(client.requested.get(0).contains("/rest/api/3/project/search"));
    assertTrue(client.requested.get(1).contains("startAt=50"));
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
  public void 비200_응답은_예외없이_빈_목록이다() throws Exception {
    StubRestTemplate client =
        new StubRestTemplate(
            Map.of("startAt=0", ResponseEntity.status(HttpStatus.FORBIDDEN).body("{}")));

    List<JiraConfigDto.JiraProjectDto> projects =
        serviceWith(client).getProjects(BASE, "qa@example.com", "token");

    assertTrue(projects.isEmpty());
  }

  @Test
  public void values_가_비어도_무한루프에_빠지지_않는다() throws Exception {
    // isLast 가 없고 values 도 비어 있는 응답(권한 없는 계정) — 한 번만 요청하고 끝나야 한다
    StubRestTemplate client =
        new StubRestTemplate(Map.of("startAt=", ResponseEntity.ok("{\"values\":[]}")));

    List<JiraConfigDto.JiraProjectDto> projects =
        serviceWith(client).getProjects(BASE, "qa@example.com", "token");

    assertTrue(projects.isEmpty());
    assertEquals(client.requested.size(), 1);
  }
}
