package com.testcase.testcasemanagement.security;

import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.RagChatCategoryRepository;
import com.testcase.testcasemanagement.repository.RagChatMessageRepository;
import com.testcase.testcasemanagement.repository.RagChatThreadRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.Optional;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(RagChatConversationController IDOR) 수정 회귀 가드.
 *
 * <p>스레드/메시지/카테고리 객체수준 인가 헬퍼가 (1) 대상 미존재 시 fail-closed, (2) 소속 프로젝트에 접근권이 있을 때만 true 를 반환하는지 검증한다.
 */
public class RagChatIdorAuthzTest {

  @Mock private RagChatThreadRepository ragChatThreadRepository;
  @Mock private RagChatMessageRepository ragChatMessageRepository;
  @Mock private RagChatCategoryRepository ragChatCategoryRepository;
  @Mock private SecurityContextUtil securityContextUtil;
  @Mock private ProjectUserRepository projectUserRepository;
  @Mock private ProjectRepository projectRepository;

  @InjectMocks private ProjectSecurityService projectSecurityService;

  private AutoCloseable mocks;

  private static final String THREAD = "thread-1";
  private static final String MESSAGE = "msg-1";
  private static final String CATEGORY = "cat-1";
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
  public void canAccessRagChatThread_whenThreadMissing_returnsFalse() {
    when(ragChatThreadRepository.findProjectIdById(THREAD)).thenReturn(Optional.empty());
    assertFalse(projectSecurityService.canAccessRagChatThread(THREAD));
  }

  @Test
  public void canAccessRagChatMessage_whenMessageMissing_returnsFalse() {
    when(ragChatMessageRepository.findProjectIdByMessageId(MESSAGE)).thenReturn(Optional.empty());
    assertFalse(projectSecurityService.canAccessRagChatMessage(MESSAGE));
  }

  @Test
  public void canAccessRagChatCategory_whenCategoryMissing_returnsFalse() {
    when(ragChatCategoryRepository.findProjectIdById(CATEGORY)).thenReturn(Optional.empty());
    assertFalse(projectSecurityService.canAccessRagChatCategory(CATEGORY));
  }

  // ---- 소속 프로젝트에 접근권 없는 인증 사용자 → 거부 (IDOR 차단) ----

  @Test
  public void canAccessRagChatThread_whenUserHasNoProjectAccess_returnsFalse() {
    when(ragChatThreadRepository.findProjectIdById(THREAD)).thenReturn(Optional.of(PROJECT));
    when(securityContextUtil.isSystemAdmin()).thenReturn(false);
    when(securityContextUtil.getCurrentUserId()).thenReturn(USER);
    when(projectUserRepository.existsByProjectIdAndUserId(PROJECT, USER)).thenReturn(false);
    when(projectRepository.findById(PROJECT)).thenReturn(Optional.empty());
    assertFalse(projectSecurityService.canAccessRagChatThread(THREAD));
  }

  // ---- 접근권 있는 경우 → 허용 (시스템 관리자 단락평가로 위임 배선 확인) ----

  @Test
  public void canAccessRagChatThread_whenSystemAdmin_returnsTrue() {
    when(ragChatThreadRepository.findProjectIdById(THREAD)).thenReturn(Optional.of(PROJECT));
    lenient().when(securityContextUtil.isSystemAdmin()).thenReturn(true);
    assertTrue(projectSecurityService.canAccessRagChatThread(THREAD));
  }

  @Test
  public void canAccessRagChatMessage_whenSystemAdmin_returnsTrue() {
    when(ragChatMessageRepository.findProjectIdByMessageId(MESSAGE))
        .thenReturn(Optional.of(PROJECT));
    lenient().when(securityContextUtil.isSystemAdmin()).thenReturn(true);
    assertTrue(projectSecurityService.canAccessRagChatMessage(MESSAGE));
  }

  @Test
  public void canAccessRagChatCategory_whenSystemAdmin_returnsTrue() {
    when(ragChatCategoryRepository.findProjectIdById(CATEGORY)).thenReturn(Optional.of(PROJECT));
    lenient().when(securityContextUtil.isSystemAdmin()).thenReturn(true);
    assertTrue(projectSecurityService.canAccessRagChatCategory(CATEGORY));
  }
}
