package com.testcase.testcasemanagement.security;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * ICT-442 회귀 가드 — 결과 조회 필터(프로젝트·플랜·실행 ID) 판정.
 *
 * <p>결과 조회 서비스는 실행·플랜 ID 가 있으면 projectId 를 보지 않는다. 그래서 넘어온 ID 를 모두 검사해야 하고, 범위를 정하는 ID 가 하나도 없으면(전체
 * 조회) 관리자만 통과해야 한다.
 */
public class ResultScopeAuthzTest {

  @Mock private SecurityContextUtil securityContextUtil;
  @Mock private ProjectUserRepository projectUserRepository;
  @Mock private ProjectRepository projectRepository;
  @Mock private TestPlanRepository testPlanRepository;
  @Mock private TestExecutionRepository testExecutionRepository;
  @InjectMocks private ProjectSecurityService projectSecurityService;

  private AutoCloseable mocks;
  private static final String USER = "user-1";
  private static final String OWN = "proj-A";
  private static final String FOREIGN = "proj-B";

  @BeforeMethod
  public void setUp() {
    mocks = MockitoAnnotations.openMocks(this);
    lenient().when(securityContextUtil.isSystemAdmin()).thenReturn(false);
    lenient().when(securityContextUtil.getCurrentUserId()).thenReturn(USER);
    lenient().when(projectUserRepository.existsByProjectIdAndUserId(OWN, USER)).thenReturn(true);
    lenient()
        .when(projectUserRepository.existsByProjectIdAndUserId(FOREIGN, USER))
        .thenReturn(false);
    lenient().when(projectRepository.findById(anyString())).thenReturn(Optional.empty());
    lenient().when(testPlanRepository.findProjectIdById("plan-A")).thenReturn(Optional.of(OWN));
    lenient().when(testPlanRepository.findProjectIdById("plan-B")).thenReturn(Optional.of(FOREIGN));
    lenient().when(testPlanRepository.findProjectIdById("plan-none")).thenReturn(Optional.empty());
    lenient()
        .when(testExecutionRepository.findProjectIdById("exec-B"))
        .thenReturn(Optional.of(FOREIGN));
  }

  @AfterMethod
  public void tearDown() throws Exception {
    mocks.close();
  }

  @Test
  public void noScope_nonAdmin_isDenied() {
    assertFalse(projectSecurityService.canAccessResultScope(null, null, null));
    assertFalse(
        projectSecurityService.canAccessResultScope(" ", Arrays.asList((String) null), null));
  }

  @Test
  public void noScope_admin_isAllowed() {
    when(securityContextUtil.isSystemAdmin()).thenReturn(true);
    assertTrue(projectSecurityService.canAccessResultScope(null, null, null));
  }

  @Test
  public void ownProject_isAllowed() {
    assertTrue(projectSecurityService.canAccessResultScope(OWN, null, null));
  }

  @Test
  public void foreignProject_isDenied() {
    assertFalse(projectSecurityService.canAccessResultScope(FOREIGN, null, null));
  }

  @Test
  public void ownProjectWithForeignExecution_isDenied() {
    assertFalse(projectSecurityService.canAccessResultScope(OWN, null, List.of("exec-B")));
  }

  @Test
  public void ownProjectWithForeignPlan_isDenied() {
    assertFalse(
        projectSecurityService.canAccessResultScope(OWN, List.of("plan-A", "plan-B"), null));
  }

  @Test
  public void ownPlanWithoutProjectId_isAllowed() {
    assertTrue(projectSecurityService.canAccessResultScope(null, List.of("plan-A"), null));
  }

  @Test
  public void unknownPlan_failsClosed() {
    assertFalse(projectSecurityService.canAccessResultScope(OWN, List.of("plan-none"), null));
  }

  @Test
  public void canAccessProjects_requiresEveryProject() {
    assertTrue(projectSecurityService.canAccessProjects(List.of(OWN)));
    assertFalse(projectSecurityService.canAccessProjects(List.of(OWN, FOREIGN)));
    assertFalse(projectSecurityService.canAccessProjects(null));
  }
}
