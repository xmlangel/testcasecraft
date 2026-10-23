package com.testcase.testcasemanagement.integration;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * ICT-445 회귀 가드: 로그인 전에 열려 있던 설정·모니터링·다국어·스케줄러 API 의 접근 규칙.
 *
 * <p>로그인 전 화면이 실제로 쓰는 조회(설정, 언어 목록·번역, 매뉴얼·가이드)만 공개로 남기고, 서버 정보·메트릭·스케줄 조회는 관리자, 방문 기록은 로그인
 * 사용자, 번역 캐시 비우기는 관리자로 제한했음을 확인한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PublicApiLockdownAuthzTest extends AbstractTestNGSpringContextTests {

  @Autowired private WebApplicationContext context;
  private MockMvc mockMvc;

  @BeforeClass
  public void setup() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
  }

  private MockHttpServletResponse call(RequestBuilder request) throws Exception {
    return mockMvc.perform(request).andReturn().getResponse();
  }

  private void assertStatus(RequestBuilder request, int expected, String label) throws Exception {
    MockHttpServletResponse resp = call(request);
    Assert.assertEquals(
        resp.getStatus(), expected, label + " body=" + resp.getContentAsString());
  }

  private void assertNotDenied(RequestBuilder request, String label) throws Exception {
    MockHttpServletResponse resp = call(request);
    int status = resp.getStatus();
    Assert.assertTrue(
        status != 401 && status != 403, label + " 는 로그인 전에 열려 있어야 함, 실제 status=" + status);
  }

  // ---------- 모니터링 ----------

  @Test
  public void monitoring_serverInfo_unauthenticated_is401() throws Exception {
    assertStatus(get("/api/monitoring/health/resources"), 401, "비로그인 서버 정보 조회");
    assertStatus(get("/api/monitoring/system/resources"), 401, "비로그인 리소스 조회");
    assertStatus(get("/api/monitoring/metrics/dashboard"), 401, "비로그인 메트릭 조회");
    assertStatus(get("/api/monitoring/server-time-iso"), 401, "비로그인 서버 시간 조회");
    assertStatus(get("/api/monitoring/usage/page-visits"), 401, "비로그인 방문 통계 조회");
  }

  @Test
  public void monitoring_serverInfo_nonAdmin_is403() throws Exception {
    assertStatus(
        get("/api/monitoring/health/resources").with(user("u").roles("USER")),
        403,
        "일반 사용자 서버 정보 조회");
    assertStatus(
        get("/api/monitoring/usage/page-visits").with(user("u").roles("USER")),
        403,
        "일반 사용자 방문 통계 조회");
  }

  @Test
  public void monitoring_serverInfo_admin_isAllowed() throws Exception {
    assertStatus(
        get("/api/monitoring/health/resources").with(user("admin").roles("ADMIN")),
        200,
        "관리자 서버 정보 조회");
  }

  @Test
  public void pageVisit_unauthenticated_is401() throws Exception {
    assertStatus(
        post("/api/monitoring/usage/page-visits")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"pagePath\":\"/dashboard\",\"visitorId\":\"v-1\"}"),
        401,
        "비로그인 방문 기록");
  }

  @Test
  public void pageVisit_authenticatedUser_isAccepted() throws Exception {
    int status =
        call(post("/api/monitoring/usage/page-visits")
                .with(user("u").roles("USER"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"pagePath\":\"/dashboard\",\"visitorId\":\"v-1\"}"))
            .getStatus();
    Assert.assertTrue(
        status == 202 || status == 204, "로그인 사용자 방문 기록은 202/204 여야 함, 실제 status=" + status);
  }

  // ---------- 스케줄러 ----------

  @Test
  public void scheduler_read_unauthenticated_is401() throws Exception {
    assertStatus(get("/api/admin/scheduler/tasks"), 401, "비로그인 스케줄 작업 조회");
    assertStatus(get("/api/admin/scheduler/configs"), 401, "비로그인 스케줄 설정 조회");
  }

  @Test
  public void scheduler_read_nonAdmin_is403() throws Exception {
    assertStatus(
        get("/api/admin/scheduler/tasks").with(user("u").roles("USER")),
        403,
        "일반 사용자 스케줄 작업 조회");
  }

  @Test
  public void scheduler_read_admin_isAllowed() throws Exception {
    assertStatus(
        get("/api/admin/scheduler/tasks").with(user("admin").roles("ADMIN")),
        200,
        "관리자 스케줄 작업 조회");
  }

  // ---------- 다국어 ----------

  @Test
  public void i18n_cacheClear_unauthenticated_is401() throws Exception {
    assertStatus(post("/api/i18n/cache/clear"), 401, "비로그인 번역 캐시 비우기");
  }

  @Test
  public void i18n_cacheClear_nonAdmin_is403() throws Exception {
    assertStatus(
        post("/api/i18n/cache/clear").with(user("u").roles("USER")), 403, "일반 사용자 번역 캐시 비우기");
  }

  @Test
  public void i18n_cacheClear_admin_isAllowed() throws Exception {
    assertStatus(
        post("/api/i18n/cache/clear").with(user("admin").roles("ADMIN")), 200, "관리자 번역 캐시 비우기");
  }

  @Test
  public void i18n_loginScreenReads_stayPublic() throws Exception {
    assertNotDenied(get("/api/i18n/languages"), "비로그인 언어 목록 조회");
    assertNotDenied(get("/api/i18n/translations/ko"), "비로그인 번역 조회");
  }

  @Test
  public void i18n_adminStatistics_unauthenticated_is401() throws Exception {
    assertStatus(get("/api/i18n/statistics/completion"), 401, "비로그인 번역 완성도 조회");
  }

  // ---------- 설정 ----------

  @Test
  public void config_frontendConfig_isPublic_withoutProfile() throws Exception {
    MockHttpServletResponse resp = call(get("/api/config"));
    Assert.assertEquals(resp.getStatus(), 200, "비로그인 설정 조회");
    Assert.assertFalse(
        resp.getContentAsString().contains("\"environment\""),
        "로그인 전 설정 응답에 실행 profile 이 없어야 함: " + resp.getContentAsString());
  }

  @Test
  public void config_environment_requiresAdmin() throws Exception {
    assertStatus(get("/api/config/environment"), 401, "비로그인 실행 환경 조회");
    assertStatus(
        get("/api/config/environment").with(user("u").roles("USER")), 403, "일반 사용자 실행 환경 조회");
  }

  @Test
  public void config_uploadLimits_requiresLogin() throws Exception {
    assertStatus(get("/api/config/upload-limits"), 401, "비로그인 업로드 제한 조회");
  }

  // ---------- 매뉴얼·가이드 ----------

  @Test
  public void manualAndGuides_stayPublic() throws Exception {
    assertNotDenied(get("/api/manual/ko"), "비로그인 매뉴얼 조회");
    assertNotDenied(get("/api/guides/TREE_DND_USER_GUIDE.md"), "비로그인 가이드 조회");
  }
}
