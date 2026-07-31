package com.testcase.testcasemanagement.dto.rag;

import static org.testng.Assert.assertEquals;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.testng.annotations.Test;

/**
 * RAG 채팅 요청 DTO가 프론트가 보내는 snake_case 본문(project_id, category_ids)과 camelCase 양쪽을 모두 역직렬화하는지 검증.
 *
 * <p>프론트 useRagChat 은 본문에 project_id/category_ids(snake)를 보내는데 DTO 는 camel(@JsonProperty)만 받아
 * createChatThread 가 400(projectId null)으로 실패했다. @JsonAlias 로 snake 도 수용해 수정.
 */
public class RagChatRequestSnakeCaseTest {

  private final ObjectMapper mapper = new ObjectMapper();
  private static final String PID = "1ed0217f-96b6-4a7d-abab-f671faabdbba";

  @Test
  public void threadCreate_acceptsSnakeCaseBody() throws Exception {
    String json =
        "{\"project_id\":\"" + PID + "\",\"title\":\"t\",\"category_ids\":[\"c1\",\"c2\"]}";
    RagChatThreadCreateRequest req = mapper.readValue(json, RagChatThreadCreateRequest.class);
    assertEquals(req.getProjectId().toString(), PID);
    assertEquals(req.getCategoryIds(), java.util.List.of("c1", "c2"));
  }

  @Test
  public void threadCreate_stillAcceptsCamelCaseBody() throws Exception {
    String json = "{\"projectId\":\"" + PID + "\",\"title\":\"t\",\"categoryIds\":[\"c1\"]}";
    RagChatThreadCreateRequest req = mapper.readValue(json, RagChatThreadCreateRequest.class);
    assertEquals(req.getProjectId().toString(), PID);
    assertEquals(req.getCategoryIds(), java.util.List.of("c1"));
  }

  @Test
  public void threadUpdate_acceptsSnakeCaseCategoryIds() throws Exception {
    String json = "{\"title\":\"t\",\"category_ids\":[\"c1\"]}";
    RagChatThreadUpdateRequest req = mapper.readValue(json, RagChatThreadUpdateRequest.class);
    assertEquals(req.getCategoryIds(), java.util.List.of("c1"));
  }

  @Test
  public void categoryCreate_acceptsSnakeCaseProjectId() throws Exception {
    String json = "{\"project_id\":\"" + PID + "\",\"name\":\"n\"}";
    RagChatCategoryCreateRequest req = mapper.readValue(json, RagChatCategoryCreateRequest.class);
    assertEquals(req.getProjectId().toString(), PID);
  }
}
