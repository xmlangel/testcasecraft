package com.testcase.testcasemanagement.integration;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(EmailVerificationService 계정 이메일 탈취) 수정 회귀 가드.
 *
 * <p>비인증 요청이 임의 userId+email 로 타인 계정의 이메일을 공격자 주소로 교체할 수 있었다. /send·/resend 를 인증 필수로 바꾸고 userId 를
 * 인증 주체에서 파생하도록 했다. 가드: 비인증 요청은 거부되어야 한다(과거엔 permitAll 로 서비스까지 도달).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class EmailVerificationAuthzRegressionTest extends AbstractTestNGSpringContextTests {

  @Autowired private WebApplicationContext context;
  private MockMvc mockMvc;

  @BeforeClass
  public void setup() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
  }

  private void assertDenied(int status, String body, String label) {
    boolean denied = status == 401 || status == 403; // 400 인정 제거 — 인가 거부는 403 이어야
    org.testng.Assert.assertTrue(
        denied, label + " 는 인가 거부여야 함, 실제 status=" + status + " body=" + body);
  }

  @Test
  public void sendVerification_unauthenticatedArbitraryUser_isDenied() throws Exception {
    var resp =
        mockMvc
            .perform(
                post("/api/email-verification/send")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"userId\":\"victim-user-id\",\"email\":\"attacker@evil.com\"}"))
            .andReturn()
            .getResponse();
    assertDenied(resp.getStatus(), resp.getContentAsString(), "비인증 인증메일 발송(임의 userId)");
  }

  @Test
  public void resendVerification_unauthenticated_isDenied() throws Exception {
    var resp =
        mockMvc
            .perform(
                post("/api/email-verification/resend")
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"userId\":\"victim-user-id\"}"))
            .andReturn()
            .getResponse();
    assertDenied(resp.getStatus(), resp.getContentAsString(), "비인증 인증메일 재발송");
  }
}
