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
 * 3모델 코드리뷰에서 P0로 식별된 컨트롤러 인가 결함들의 회귀 가드.
 *
 * <p>SchedulerAuthzTest 패턴을 따른다 — 전체 컨텍스트를 띄우고 MockMvc로 실제 요청을 보내 보호 경계를 검증한다. 데이터 시딩이나 바디 검증에 의존하지
 * 않도록, (1) 비인증 요청은 401/403 이어야 하고 (2) 순수 롤 검사(hasRole)만 하는 관리자 엔드포인트는 권한 없는 인증 사용자에게 403 이어야 함을
 * 확인한다.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ControllerP0AuthzRegressionTest extends AbstractTestNGSpringContextTests {

  @Autowired private WebApplicationContext context;
  private MockMvc mockMvc;

  @BeforeClass
  public void setup() {
    mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
  }

  private void assertRejected(int status, String label) {
    org.testng.Assert.assertTrue(
        status == 401 || status == 403, label + " 는 401/403 이어야 함, 실제=" + status);
  }

  /** P0-E: /executions 가 SPA permitAll 과 겹쳐 비인증 노출되던 것을 /api/executions 로 이전 → 인증 필요. */
  @Test
  public void unauthenticated_getExecutionById_isRejected() throws Exception {
    int status =
        mockMvc.perform(get("/api/executions/any-id")).andReturn().getResponse().getStatus();
    assertRejected(status, "비인증 실행 조회");
  }

  /** P0-I: RAG 문서 단건 조회는 문서 소속 프로젝트 접근 권한 필요(비인증 차단). */
  @Test
  public void unauthenticated_getRagDocument_isRejected() throws Exception {
    int status =
        mockMvc
            .perform(get("/api/rag/documents/11111111-1111-1111-1111-111111111111"))
            .andReturn()
            .getResponse()
            .getStatus();
    assertRejected(status, "비인증 RAG 문서 조회");
  }

  /** P0-J: 첨부 다운로드는 소속 프로젝트 접근 권한 필요(비인증 차단). */
  @Test
  public void unauthenticated_downloadTestCaseAttachment_isRejected() throws Exception {
    int status =
        mockMvc
            .perform(get("/api/testcase-attachments/any-id/download"))
            .andReturn()
            .getResponse()
            .getStatus();
    assertRejected(status, "비인증 첨부 다운로드");
  }

  /** P0-K: JUnit 결과 삭제는 프로젝트 변경 권한 필요(비인증 차단). */
  @Test
  public void unauthenticated_deleteJunitResult_isRejected() throws Exception {
    int status =
        mockMvc.perform(delete("/api/junit-results/any-id")).andReturn().getResponse().getStatus();
    assertRejected(status, "비인증 JUnit 결과 삭제");
  }

  /** P0-D: 첨부 admin 정리(파괴적 삭제) 엔드포인트 — 비인증 차단. */
  @Test
  public void unauthenticated_cleanupUnusedAttachments_isRejected() throws Exception {
    int status =
        mockMvc
            .perform(delete("/api/testcase-attachments/admin/cleanup-unused"))
            .andReturn()
            .getResponse()
            .getStatus();
    assertRejected(status, "비인증 첨부 정리");
  }

  /**
   * P0-D 핵심: 경로 명명(/testcase-attachments/admin/**)이 /api/admin/** 규칙을 안 타서 일반 TESTER 가 파일을 물리 삭제할 수
   * 있던 결함. @PreAuthorize("hasRole('ADMIN')") 부여로 TESTER 는 403 이어야 한다.
   */
  @Test
  public void tester_cleanupUnusedAttachments_isForbidden() throws Exception {
    int status =
        mockMvc
            .perform(
                delete("/api/testcase-attachments/admin/cleanup-unused")
                    .with(user("tester").roles("TESTER")))
            .andReturn()
            .getResponse()
            .getStatus();
    org.testng.Assert.assertEquals(status, 403, "TESTER 의 첨부 정리는 403 이어야 함, 실제=" + status);
  }
}
