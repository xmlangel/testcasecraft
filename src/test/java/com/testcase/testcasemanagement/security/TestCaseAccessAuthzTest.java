package com.testcase.testcasemanagement.security;

import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.Optional;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(TestCaseAttachment 공개토큰 노출 체인) 수정 회귀 가드.
 *
 * <p>첨부 목록 조회(testCaseId 기반)가 소속 프로젝트 접근권을 요구하도록 canAccessTestCase 를 추가했다 — 대상 미존재 fail-closed, 접근권
 * 없으면 false. 이로써 무인가 목록 → publicUrl 토큰 수확 → /public 다운로드 우회 체인의 진입점을 차단한다.
 */
public class TestCaseAccessAuthzTest {

  @Mock private TestCaseRepository testCaseRepository;
  @Mock private SecurityContextUtil securityContextUtil;
  @Mock private ProjectUserRepository projectUserRepository;
  @Mock private ProjectRepository projectRepository;
  @InjectMocks private ProjectSecurityService projectSecurityService;

  private AutoCloseable mocks;
  private static final String TC = "tc-1";
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

  @Test
  public void canAccessTestCase_whenTestCaseMissing_returnsFalse() {
    when(testCaseRepository.findProjectIdById(TC)).thenReturn(Optional.empty());
    assertFalse(projectSecurityService.canAccessTestCase(TC));
  }

  @Test
  public void canAccessTestCase_whenUserHasNoProjectAccess_returnsFalse() {
    when(testCaseRepository.findProjectIdById(TC)).thenReturn(Optional.of(PROJECT));
    when(securityContextUtil.isSystemAdmin()).thenReturn(false);
    when(securityContextUtil.getCurrentUserId()).thenReturn(USER);
    when(projectUserRepository.existsByProjectIdAndUserId(PROJECT, USER)).thenReturn(false);
    when(projectRepository.findById(PROJECT)).thenReturn(Optional.empty());
    assertFalse(projectSecurityService.canAccessTestCase(TC));
  }

  @Test
  public void canAccessTestCase_whenSystemAdmin_returnsTrue() {
    when(testCaseRepository.findProjectIdById(TC)).thenReturn(Optional.of(PROJECT));
    lenient().when(securityContextUtil.isSystemAdmin()).thenReturn(true);
    assertTrue(projectSecurityService.canAccessTestCase(TC));
  }
}
