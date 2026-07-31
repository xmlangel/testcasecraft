package com.testcase.testcasemanagement.integration;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(스레드 PATCH @NotNull threadId 400) 의 HTTP 경계 회귀 가드.
 *
 * <p>ControllerP0AuthzRegressionTest 패턴을 따른다 — 전체 컨텍스트를 띄우고 MockMvc 로 실제 PATCH 를 보낸다. 프론트가 실제 보내는
 * 형태(본문에 threadId 없음)로 요청했을 때, 과거엔 @Valid 가 본문 검증 단계에서 400(MethodArgumentNotValidException) 을 냈다.
 * threadId 는 경로변수로 주입되는 path 파생 필드라 @NotNull 을 제거했다.
 *
 * <p>수정 후에는 본문 검증을 통과하고 @PreAuthorize(canAccessRagChatThread) 로 진행한다 — 존재하지 않는 스레드 + 권한 없는 사용자이므로
 * fail-closed 403 이 나야 하며 <b>400 이 아니어야</b> 한다. 즉 상태코드가 400 이 아니라는 것이 "검증이 더는 막지 않는다"의 증거다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RagChatThreadUpdateValidationRegressionTest extends AbstractTestNGSpringContextTests {

  @Autowired private WebApplicationContext context;
  private MockMvc mockMvc;

  @BeforeClass
  public void setup() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
  }

  /** 본문에 threadId 가 없어도 400(검증실패)이 아니라 인가 단계(403)로 진행해야 한다. */
  @Test
  public void patchThreadWithoutBodyThreadId_isNotValidationRejected() throws Exception {
    int status =
        mockMvc
            .perform(
                patch("/api/rag/chat/conversations/threads/11111111-1111-1111-1111-111111111111")
                    .with(user("regression-user").roles("USER"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"title\":\"이름 변경\",\"category_ids\":[\"c1\"]}"))
            .andReturn()
            .getResponse()
            .getStatus();

    Assert.assertNotEquals(
        status, 400, "본문에 threadId 가 없어도 400(검증실패)이면 안 됨 — threadId 는 경로에서 주입되는 path 파생 필드");
    Assert.assertEquals(status, 403, "검증 통과 후 fail-closed 인가로 403 이어야 함, 실제=" + status);
  }
}
