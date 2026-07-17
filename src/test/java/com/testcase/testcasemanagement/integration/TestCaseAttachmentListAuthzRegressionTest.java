package com.testcase.testcasemanagement.integration;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(TestCaseAttachment 공개토큰 노출 체인) 수정 회귀 가드.
 *
 * <p>첨부 목록 조회 GET /api/testcase-attachments/testcase/{testCaseId} 는 이제 소속 프로젝트 접근권을 요구한다. 접근권 없는
 * (또는 존재하지 않는 testCaseId) 요청은 거부되어야 한다 — 과거엔 @PreAuthorize 부재로 목록을 반환해 publicUrl 토큰 수확이 가능했다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TestCaseAttachmentListAuthzRegressionTest extends AbstractTestNGSpringContextTests {

  @Autowired private WebApplicationContext context;
  private MockMvc mockMvc;

  @BeforeClass
  public void setup() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
  }

  @Test
  public void listAttachmentsByTestCase_withoutProjectAccess_isDenied() throws Exception {
    var resp =
        mockMvc
            .perform(
                get("/api/testcase-attachments/testcase/nonexistent-tc")
                    .with(user("u").roles("USER")))
            .andReturn()
            .getResponse();
    int status = resp.getStatus();
    String body = resp.getContentAsString();
    boolean denied = status == 401 || status == 403 || (status == 400 && body.contains("Denied"));
    org.testng.Assert.assertTrue(
        denied, "접근권 없는 첨부 목록 조회는 거부여야 함, 실제 status=" + status + " body=" + body);
  }
}
