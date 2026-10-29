package com.testcase.testcasemanagement.integration;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/** API 명세(/api-docs)는 시스템 관리자만 열람하고, Swagger UI 화면은 공개하되 앱의 accessToken 을 실어 보내는지 확인한다. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SwaggerApiDocsAuthzTest extends AbstractTestNGSpringContextTests {

  @Autowired private WebApplicationContext context;
  private MockMvc mockMvc;

  @BeforeClass
  public void setup() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
  }

  @Test
  public void unauthenticated_apiDocs_isRejected() throws Exception {
    int status = mockMvc.perform(get("/api-docs")).andReturn().getResponse().getStatus();
    Assert.assertTrue(status == 401 || status == 403, "비인증 api-docs 는 401/403, 실제=" + status);
  }

  @Test
  public void nonAdmin_apiDocs_isForbidden() throws Exception {
    int status =
        mockMvc
            .perform(get("/api-docs").with(user("tester").roles("USER")))
            .andReturn()
            .getResponse()
            .getStatus();
    Assert.assertEquals(status, 403, "일반 사용자 api-docs");
  }

  @Test
  public void admin_apiDocs_isAllowed() throws Exception {
    MockHttpServletResponse res =
        mockMvc
            .perform(get("/api-docs").with(user("admin").roles("ADMIN")))
            .andReturn()
            .getResponse();
    Assert.assertEquals(res.getStatus(), 200, "관리자 api-docs");
    Assert.assertTrue(res.getContentAsString().contains("\"paths\""), "명세 본문");
  }

  @Test
  public void apiDocs_contact_hasNoReleasesLink() throws Exception {
    String body =
        mockMvc
            .perform(get("/api-docs").with(user("admin").roles("ADMIN")))
            .andReturn()
            .getResponse()
            .getContentAsString();
    Assert.assertFalse(
        body.contains("github.com/xmlangel/testcasecraft/releases"), "연락처에 릴리스 페이지 링크가 없어야 함");
    Assert.assertFalse(body.contains("\"license\""), "라이선스 링크가 없어야 함");
    Assert.assertTrue(body.contains("kwangmyung.kim@gmail.com"), "연락처 이메일은 유지");
  }

  @Test
  public void swaggerConfig_isPublic() throws Exception {
    int status =
        mockMvc.perform(get("/api-docs/swagger-config")).andReturn().getResponse().getStatus();
    Assert.assertEquals(status, 200, "비인증 swagger-config");
  }

  @Test
  public void swaggerInitializer_attachesAccessToken() throws Exception {
    MockHttpServletResponse res =
        mockMvc.perform(get("/swagger-ui/swagger-initializer.js")).andReturn().getResponse();
    Assert.assertEquals(res.getStatus(), 200, "비인증 swagger-initializer.js");
    String js = res.getContentAsString();
    Assert.assertTrue(js.contains("requestInterceptor"), "요청 가로채기 주입:\n" + js);
    Assert.assertTrue(js.contains("localStorage.getItem('accessToken')"), "accessToken 사용:\n" + js);
    Assert.assertTrue(js.contains("InfoUrl: () => () => null"), "명세 주소 링크 숨김 플러그인:\n" + js);
    Assert.assertTrue(js.contains("SwaggerUIBundle.plugins.DownloadUrl,"), "기본 플러그인 유지:\n" + js);
  }
}
