package com.testcase.testcasemanagement.security;

import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.TestSessionAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestSessionRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.Optional;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(TestSessionAttachmentController IDOR) 수정 회귀 가드.
 *
 * <p>세션 첨부 객체수준 인가 헬퍼가 (1) 대상 미존재 시 fail-closed(false), (2) 접근권 없는 사용자에게 false, (3) 소속 프로젝트 접근권이 있을
 * 때만 true 를 반환하는지 검증한다. SecurityService 는 순수 위임 로직이라 컨텍스트 부팅 없이 목으로 검증한다.
 */
public class TestSessionAttachmentAuthzTest {

  @Mock private TestSessionAttachmentRepository testSessionAttachmentRepository;
  @Mock private TestSessionRepository testSessionRepository;
  @Mock private SecurityContextUtil securityContextUtil;
  @Mock private ProjectUserRepository projectUserRepository;
  @Mock private ProjectRepository projectRepository;
  @Mock private OrganizationSecurityService organizationSecurityService;
  @Mock private UserRepository userRepository;

  @InjectMocks private ProjectSecurityService projectSecurityService;

  private AutoCloseable mocks;

  private static final String ATT = "att-1";
  private static final String SESSION = "sess-1";
  private static final String PROJECT = "proj-A";
  private static final String USER = "user-1";

  @BeforeMethod
  public void setUp() {
    mocks = MockitoAnnotations.openMocks(this);
  }

  @AfterMethod
  public void tearDown() throws Exception {
    mocks.close();
  }

  // ---- 대상 미존재 → fail-closed ----

  @Test
  public void canAccessTestSessionAttachment_whenAttachmentMissing_returnsFalse() {
    when(testSessionAttachmentRepository.findProjectIdByAttachmentId(ATT))
        .thenReturn(Optional.empty());
    assertFalse(projectSecurityService.canAccessTestSessionAttachment(ATT));
  }

  @Test
  public void canEditTestSessionAttachment_whenAttachmentMissing_returnsFalse() {
    when(testSessionAttachmentRepository.findProjectIdByAttachmentId(ATT))
        .thenReturn(Optional.empty());
    assertFalse(projectSecurityService.canEditTestSessionAttachment(ATT));
  }

  @Test
  public void canAccessTestSession_whenSessionMissing_returnsFalse() {
    when(testSessionRepository.findProjectIdById(SESSION)).thenReturn(Optional.empty());
    assertFalse(projectSecurityService.canAccessTestSession(SESSION));
  }

  @Test
  public void canUploadToTestSession_whenSessionMissing_returnsFalse() {
    when(testSessionRepository.findProjectIdById(SESSION)).thenReturn(Optional.empty());
    assertFalse(projectSecurityService.canUploadToTestSession(SESSION));
  }

  // ---- 소속 프로젝트에 접근권 없는 인증 사용자 → 거부 (IDOR 차단) ----

  @Test
  public void canAccessTestSessionAttachment_whenUserHasNoProjectAccess_returnsFalse() {
    when(testSessionAttachmentRepository.findProjectIdByAttachmentId(ATT))
        .thenReturn(Optional.of(PROJECT));
    when(securityContextUtil.isSystemAdmin()).thenReturn(false);
    when(securityContextUtil.getCurrentUserId()).thenReturn(USER);
    when(projectUserRepository.existsByProjectIdAndUserId(PROJECT, USER)).thenReturn(false);
    when(projectRepository.findById(PROJECT)).thenReturn(Optional.empty());
    assertFalse(projectSecurityService.canAccessTestSessionAttachment(ATT));
  }

  @Test
  public void canEditTestSessionAttachment_whenUserLacksEditRole_returnsFalse() {
    when(testSessionAttachmentRepository.findProjectIdByAttachmentId(ATT))
        .thenReturn(Optional.of(PROJECT));
    when(securityContextUtil.isSystemAdmin()).thenReturn(false);
    when(securityContextUtil.getCurrentUserId()).thenReturn(USER);
    when(projectUserRepository.hasEditRole(PROJECT, USER)).thenReturn(false);
    assertFalse(projectSecurityService.canEditTestSessionAttachment(ATT));
  }

  // ---- 접근권 있는 경우 → 허용 (여기선 시스템 관리자 단락평가로 위임 배선 확인) ----

  @Test
  public void canAccessTestSessionAttachment_whenSystemAdmin_returnsTrue() {
    when(testSessionAttachmentRepository.findProjectIdByAttachmentId(ATT))
        .thenReturn(Optional.of(PROJECT));
    lenient().when(securityContextUtil.isSystemAdmin()).thenReturn(true);
    assertTrue(projectSecurityService.canAccessTestSessionAttachment(ATT));
  }

  @Test
  public void canEditTestSessionAttachment_whenSystemAdmin_returnsTrue() {
    when(testSessionAttachmentRepository.findProjectIdByAttachmentId(ATT))
        .thenReturn(Optional.of(PROJECT));
    lenient().when(securityContextUtil.isSystemAdmin()).thenReturn(true);
    assertTrue(projectSecurityService.canEditTestSessionAttachment(ATT));
  }

  @Test
  public void canUploadToTestSession_whenSystemAdmin_returnsTrue() {
    when(testSessionRepository.findProjectIdById(SESSION)).thenReturn(Optional.of(PROJECT));
    lenient().when(securityContextUtil.isSystemAdmin()).thenReturn(true);
    assertTrue(projectSecurityService.canUploadToTestSession(SESSION));
  }
}
