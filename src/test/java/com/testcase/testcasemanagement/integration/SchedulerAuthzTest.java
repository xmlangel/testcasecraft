package com.testcase.testcasemanagement.integration;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import org.springframework.beans.factory.annotation.Autowired;
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
 * 스케줄러 설정 변경 엔드포인트 인가 회귀 가드.
 *
 * <p>이전에 {@code /api/admin/scheduler/**} 가 전체 permitAll 이라 비인증 사용자도 스케줄러 설정을 변경/실행할 수 있었다. GET 만
 * permitAll 로 좁히고 변경(PUT/POST)은 ADMIN 으로 강제했음을 검증한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SchedulerAuthzTest extends AbstractTestNGSpringContextTests {

  @Autowired private WebApplicationContext context;
  private MockMvc mockMvc;

  @BeforeClass
  public void setup() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
  }

  /** 비인증 PUT(설정 변경)은 차단되어야 한다 (200/2xx 금지). */
  @Test
  public void unauthenticated_updateScheduler_isRejected() throws Exception {
    int status =
        mockMvc
            .perform(
                put("/api/admin/scheduler/configs/some-task")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"cronExpression\":\"0 0 * * * *\",\"enabled\":true}"))
            .andReturn()
            .getResponse()
            .getStatus();
    org.testng.Assert.assertTrue(
        status == 401 || status == 403,
        "비인증 스케줄러 변경은 401/403 이어야 함, 실제=" + status);
  }

  /** 비인증 POST(즉시 실행)도 차단되어야 한다. */
  @Test
  public void unauthenticated_executeScheduler_isRejected() throws Exception {
    int status =
        mockMvc
            .perform(post("/api/admin/scheduler/configs/some-task/execute"))
            .andReturn()
            .getResponse()
            .getStatus();
    org.testng.Assert.assertTrue(
        status == 401 || status == 403,
        "비인증 스케줄러 실행은 401/403 이어야 함, 실제=" + status);
  }
}
