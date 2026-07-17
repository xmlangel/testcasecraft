package com.testcase.testcasemanagement.service;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.JiraConfigDto;
import java.lang.reflect.Method;
import java.util.Optional;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(Jira JSON injection) 수정 회귀 가드.
 *
 * <p>이슈/코멘트 본문을 String.format 으로 조립하면 큰따옴표만 이스케이프돼 백슬래시·개행·중괄호로 JSON 구조를 파손하거나 필드를 주입할 수 있었다.
 * ObjectMapper 로 빌드하도록 바꿔, 악의적 입력이 값으로 안전히 이스케이프되고 구조 주입이 불가능함을 검증한다.
 */
public class JiraApiServiceJsonInjectionTest {

  private JiraApiService service;
  private final ObjectMapper mapper = new ObjectMapper();

  @BeforeClass
  public void setUp() {
    service = new JiraApiService(null, new ObjectMapper(), Optional.empty(), Optional.empty());
  }

  private String invoke(String method, Class<?> paramType, Object arg) throws Exception {
    Method m = JiraApiService.class.getDeclaredMethod(method, paramType);
    m.setAccessible(true);
    return (String) m.invoke(service, arg);
  }

  @Test
  public void createIssueRequestBody_escapesMaliciousSummary_noStructureInjection()
      throws Exception {
    // 구조 주입을 노린 요약: 따옴표/중괄호/백슬래시/개행
    String evilSummary = "pwned\",\"injected\":\"x\\\n}";
    JiraConfigDto.IssueCreateRequestDto req =
        JiraConfigDto.IssueCreateRequestDto.builder()
            .projectKey("PROJ")
            .summary(evilSummary)
            .description("desc")
            .issueTypeName("Bug")
            .build();

    String json = invoke("createIssueRequestBody", JiraConfigDto.IssueCreateRequestDto.class, req);

    JsonNode root = mapper.readTree(json); // 유효한 JSON 이어야 함
    JsonNode fields = root.get("fields");
    // 요약 값이 그대로 라운드트립 (구조가 깨지지 않음)
    assertEquals(fields.get("summary").asText(), evilSummary);
    assertEquals(fields.get("project").get("key").asText(), "PROJ");
    // 주입 시도한 가짜 필드가 최상위/ fields 에 생기지 않음
    assertFalse(root.has("injected"));
    assertFalse(fields.has("injected"));
  }

  @Test
  public void createCommentBody_escapesMaliciousComment_validJson() throws Exception {
    String evilComment = "\"}],\"evil\":1,\"x\":\"";
    String json = invoke("createCommentBody", String.class, evilComment);
    JsonNode root = mapper.readTree(json); // 유효한 JSON
    assertTrue(root.has("body"));
    // 주입 시도 필드가 최상위에 생기지 않음
    assertFalse(root.has("evil"));
  }
}
