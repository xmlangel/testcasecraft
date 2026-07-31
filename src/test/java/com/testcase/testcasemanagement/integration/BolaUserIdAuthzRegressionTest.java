package com.testcase.testcasemanagement.integration;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
 * dev-code-review P0(BOLA `#userId == authentication.name`) 수정 회귀 가드.
 *
 * <p>기존 SpEL 자가-분기가 UUID(#userId)를 username(authentication.name)과 비교해, 공격자가 피해자 UUID를 username 으로
 * 가입하면 등식이 참이 되어 타인 리소스에 접근할 수 있었다. `@securityContextUtil.isCurrentUser(#userId)`(현재 사용자의 실제 UUID
 * 비교)로 교체했다.
 *
 * <p>가드: 인증된 non-admin/non-manager 사용자의 <b>username 이 경로의 {userId} 와 동일</b>해도(과거 우회 성립 조건) 이제 403
 * 이어야 한다. 데이터 시딩에 의존하지 않는다 — mock 사용자는 DB에 없으므로 isCurrentUser 는 실제 UUID를 못 찾아 false, 롤 검사도 false →
 * 거부.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class BolaUserIdAuthzRegressionTest extends AbstractTestNGSpringContextTests {

  @Autowired private WebApplicationContext context;
  private MockMvc mockMvc;

  /** 공격자 username == 피해자로 지목한 path {userId}. 과거 코드라면 자가-분기로 통과됐을 값. */
  private static final String NAME_EQUALS_USERID = "victim-user-id-as-name";

  @BeforeClass
  public void setup() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
  }

  /**
   * 인가 거부로 판정한다. 인가 거부(@PreAuthorize)는 401(비인증) 또는 403(권한 없음)이어야 한다. 과거 UserPermissionController 의
   * 로컬 RuntimeException 핸들러가 AuthorizationDeniedException 을 400 으로 삼켜 인가 거부가 400 으로 나가던 것을 로컬
   * AccessDeniedException→403 핸들러로 바로잡았다 — 이제 400 은 인가 거부로 인정하지 않는다.
   */
  private void assertDenied(int status, String body, String label) {
    boolean denied = status == 401 || status == 403;
    org.testng.Assert.assertTrue(
        denied, label + " 는 인가 거부여야 함, 실제 status=" + status + " body=" + body);
  }

  @Test
  public void userPermissions_selfBranchViaUsernameEqualsUserId_isDenied() throws Exception {
    var resp =
        mockMvc
            .perform(
                get("/api/user-permissions/" + NAME_EQUALS_USERID)
                    .with(user(NAME_EQUALS_USERID).roles("USER")))
            .andReturn()
            .getResponse();
    assertDenied(resp.getStatus(), resp.getContentAsString(), "권한 조회 자가-분기 우회");
  }

  @Test
  public void removeOrganizationMember_selfBranchViaUsernameEqualsUserId_isDenied()
      throws Exception {
    var resp =
        mockMvc
            .perform(
                delete("/api/organizations/any-org/members/" + NAME_EQUALS_USERID)
                    .with(user(NAME_EQUALS_USERID).roles("USER")))
            .andReturn()
            .getResponse();
    assertDenied(resp.getStatus(), resp.getContentAsString(), "조직 멤버 제거 자가-분기 우회");
  }

  @Test
  public void removeProjectMember_selfBranchViaUsernameEqualsUserId_isDenied() throws Exception {
    var resp =
        mockMvc
            .perform(
                delete("/api/projects/any-proj/members/" + NAME_EQUALS_USERID)
                    .with(user(NAME_EQUALS_USERID).roles("USER")))
            .andReturn()
            .getResponse();
    assertDenied(resp.getStatus(), resp.getContentAsString(), "프로젝트 멤버 제거 자가-분기 우회");
  }

  @Test
  public void removeGroupMember_selfBranchViaUsernameEqualsUserId_isDenied() throws Exception {
    var resp =
        mockMvc
            .perform(
                delete("/api/groups/any-group/members/" + NAME_EQUALS_USERID)
                    .with(user(NAME_EQUALS_USERID).roles("USER")))
            .andReturn()
            .getResponse();
    assertDenied(resp.getStatus(), resp.getContentAsString(), "그룹 멤버 제거 자가-분기 우회");
  }
}
