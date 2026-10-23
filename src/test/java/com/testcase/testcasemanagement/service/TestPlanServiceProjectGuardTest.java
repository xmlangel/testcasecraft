package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.testcase.testcasemanagement.dto.TestPlanDto;
import com.testcase.testcasemanagement.mapper.TestPlanMapper;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import java.util.List;
import java.util.Optional;
import org.mockito.Mockito;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/** ICT-446: 테스트 플랜 수정은 요청 값이 아니라 저장된 플랜의 프로젝트로 권한을 검사한다. */
public class TestPlanServiceProjectGuardTest {

  private static final String PROJECT_A = "proj-A";
  private static final String PROJECT_B = "proj-B";

  private TestPlanRepository testPlanRepository;
  private ProjectRepository projectRepository;
  private ProjectSecurityService projectSecurityService;
  private TestPlanService service;

  private Project projectA;

  @BeforeMethod
  public void setUp() {
    testPlanRepository = Mockito.mock(TestPlanRepository.class);
    projectRepository = Mockito.mock(ProjectRepository.class);
    projectSecurityService = Mockito.mock(ProjectSecurityService.class);
    service =
        new TestPlanService(
            testPlanRepository, Mockito.mock(TestPlanMapper.class), projectSecurityService);
    ReflectionTestUtils.setField(service, "projectRepository", projectRepository);

    projectA = new Project();
    projectA.setId(PROJECT_A);
    Project projectB = new Project();
    projectB.setId(PROJECT_B);
    lenient().when(projectRepository.findById(PROJECT_B)).thenReturn(Optional.of(projectB));
    lenient()
        .when(testPlanRepository.save(any(TestPlan.class)))
        .thenAnswer(inv -> inv.getArgument(0));
  }

  private TestPlan storedPlanInA() {
    TestPlan plan = new TestPlan();
    plan.setId("plan-1");
    plan.setName("old");
    plan.setProject(projectA);
    return plan;
  }

  private TestPlanDto request(String projectId) {
    TestPlanDto dto = new TestPlanDto();
    dto.setName("new");
    dto.setDescription("desc");
    dto.setTestCaseIds(List.of("tc-1"));
    dto.setProjectId(projectId);
    return dto;
  }

  @Test(description = "요청이 편집 가능한 B 라도 저장된 플랜이 A 에 있고 A 권한이 없으면 거부한다")
  public void rejectsWhenStoredProjectNotEditable() {
    when(testPlanRepository.findById("plan-1")).thenReturn(Optional.of(storedPlanInA()));
    when(projectSecurityService.canEditProject(PROJECT_A)).thenReturn(false);
    when(projectSecurityService.canEditProject(PROJECT_B)).thenReturn(true);

    Assert.assertThrows(
        AccessDeniedException.class, () -> service.updateTestPlan("plan-1", request(PROJECT_B)));
    verify(testPlanRepository, never()).save(any(TestPlan.class));
  }

  @Test(description = "projectId 가 비어 있어도 저장된 프로젝트로 검사해 권한이 없으면 거부한다")
  public void rejectsNullProjectIdWithoutStoredPermission() {
    when(testPlanRepository.findById("plan-1")).thenReturn(Optional.of(storedPlanInA()));
    when(projectSecurityService.canEditProject(PROJECT_A)).thenReturn(false);

    Assert.assertThrows(
        AccessDeniedException.class, () -> service.updateTestPlan("plan-1", request(null)));
    verify(testPlanRepository, never()).save(any(TestPlan.class));
  }

  @Test(description = "요청 projectId 가 저장된 값과 달라도 플랜은 원래 프로젝트에 남는다")
  public void ignoresDifferentRequestProjectId() {
    when(testPlanRepository.findById("plan-1")).thenReturn(Optional.of(storedPlanInA()));
    when(projectSecurityService.canEditProject(PROJECT_A)).thenReturn(true);
    when(projectSecurityService.canEditProject(PROJECT_B)).thenReturn(true);

    TestPlan updated = service.updateTestPlan("plan-1", request(PROJECT_B));

    Assert.assertEquals(updated.getProject().getId(), PROJECT_A);
    Assert.assertEquals(updated.getName(), "new");
    verify(projectRepository, never()).findById(PROJECT_B);
  }

  @Test(description = "같은 프로젝트로 수정하면 기존처럼 저장한다")
  public void updatesWhenStoredProjectEditable() {
    when(testPlanRepository.findById("plan-1")).thenReturn(Optional.of(storedPlanInA()));
    when(projectSecurityService.canEditProject(PROJECT_A)).thenReturn(true);

    TestPlan updated = service.updateTestPlan("plan-1", request(PROJECT_A));

    Assert.assertEquals(updated.getName(), "new");
    Assert.assertEquals(updated.getDescription(), "desc");
    Assert.assertEquals(updated.getTestCaseIds(), List.of("tc-1"));
    verify(projectSecurityService).canEditProject(PROJECT_A);
  }

  @Test(description = "없는 플랜은 권한 검사 전에 기존과 같은 예외로 끝난다")
  public void missingPlanThrowsNotFound() {
    when(testPlanRepository.findById("nope")).thenReturn(Optional.empty());

    Assert.assertThrows(
        RuntimeException.class, () -> service.updateTestPlan("nope", request(PROJECT_A)));
    verify(testPlanRepository, never()).save(any(TestPlan.class));
  }
}
