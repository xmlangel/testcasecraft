package com.testcase.testcasemanagement.integration;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

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
 * dev-code-review P0(JiraIntegrationController 전역 상태변경/교차프로젝트 조회 무인가) 수정 회귀 가드.
 *
 * <p>retry/cleanup(전 프로젝트 대상 write)은 ADMIN 전용, pending/statistics(프로젝트 스코프 없으면 전역)는 스코프 또는 ADMIN.
 * 비-admin 인증 사용자가 이들에 접근하면 거부되어야 한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class JiraIntegrationAuthzRegressionTest extends AbstractTestNGSpringContextTests {

  @Autowired private WebApplicationContext context;
  private MockMvc mockMvc;

  @BeforeClass
  public void setup() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
  }

  private void assertDenied(int status, String body, String label) {
    boolean denied = status == 401 || status == 403 || (status == 400 && body.contains("Denied"));
    org.testng.Assert.assertTrue(
        denied, label + " 는 인가 거부여야 함, 실제 status=" + status + " body=" + body);
  }

  @Test
  public void retryFailedSyncs_nonAdmin_isDenied() throws Exception {
    var resp =
        mockMvc
            .perform(post("/api/jira-integration/retry-failed-syncs").with(user("u").roles("USER")))
            .andReturn()
            .getResponse();
    assertDenied(resp.getStatus(), resp.getContentAsString(), "retry-failed-syncs(비관리자)");
  }

  @Test
  public void cleanupTimedOutSyncs_nonAdmin_isDenied() throws Exception {
    var resp =
        mockMvc
            .perform(
                post("/api/jira-integration/cleanup-timed-out-syncs").with(user("u").roles("USER")))
            .andReturn()
            .getResponse();
    assertDenied(resp.getStatus(), resp.getContentAsString(), "cleanup-timed-out-syncs(비관리자)");
  }

  @Test
  public void pendingSyncResults_globalNonAdmin_isDenied() throws Exception {
    // projectId 미지정(전역) + 비관리자 → 거부
    var resp =
        mockMvc
            .perform(
                get("/api/jira-integration/pending-sync-results").with(user("u").roles("USER")))
            .andReturn()
            .getResponse();
    assertDenied(resp.getStatus(), resp.getContentAsString(), "pending-sync-results 전역(비관리자)");
  }

  @Test
  public void syncStatusStatistics_globalNonAdmin_isDenied() throws Exception {
    var resp =
        mockMvc
            .perform(
                get("/api/jira-integration/sync-status-statistics").with(user("u").roles("USER")))
            .andReturn()
            .getResponse();
    assertDenied(resp.getStatus(), resp.getContentAsString(), "sync-status-statistics 전역(비관리자)");
  }
}
