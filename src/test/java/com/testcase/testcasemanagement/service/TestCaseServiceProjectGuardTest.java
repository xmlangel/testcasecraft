package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.testcase.testcasemanagement.dto.BatchSaveResult;
import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.DisplayIdHistoryRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseAttachmentRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.mockito.Mockito;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/** ICT-446: 일괄 저장·단건 수정이 projectId 누락이나 다른 프로젝트 케이스로 권한 검사를 비켜 가지 않는지 확인한다. */
public class TestCaseServiceProjectGuardTest {

  private static final String PROJECT_A = "11111111-1111-1111-1111-111111111111";
  private static final String PROJECT_B = "22222222-2222-2222-2222-222222222222";

  private TestCaseRepository testCaseRepository;
  private ProjectRepository projectRepository;
  private ProjectSecurityService projectSecurityService;
  private TestCaseService service;

  private Project projectA;
  private Project projectB;

  @BeforeMethod
  public void setUp() {
    testCaseRepository = Mockito.mock(TestCaseRepository.class);
    projectRepository = Mockito.mock(ProjectRepository.class);
    projectSecurityService = Mockito.mock(ProjectSecurityService.class);

    service =
        new TestCaseService(
            testCaseRepository,
            Mockito.mock(TestCaseDisplayIdService.class),
            Mockito.mock(ApplicationEventPublisher.class),
            Mockito.mock(RagService.class),
            Mockito.mock(TestCaseAttachmentRepository.class),
            Mockito.mock(DisplayIdHistoryRepository.class),
            Mockito.mock(GoogleConfigService.class),
            projectRepository,
            projectSecurityService);
    ReflectionTestUtils.setField(service, "entityManager", Mockito.mock(EntityManager.class));

    projectA = new Project();
    projectA.setId(PROJECT_A);
    projectB = new Project();
    projectB.setId(PROJECT_B);

    // 사용자는 B 만 편집할 수 있고 A 는 편집할 수 없다.
    lenient().when(projectSecurityService.canEditProject(PROJECT_A)).thenReturn(false);
    lenient().when(projectSecurityService.canEditProject(PROJECT_B)).thenReturn(true);
    lenient().when(projectRepository.findById(PROJECT_A)).thenReturn(Optional.of(projectA));
    lenient().when(projectRepository.findById(PROJECT_B)).thenReturn(Optional.of(projectB));
    lenient()
        .when(testCaseRepository.saveAll(anyList()))
        .thenAnswer(inv -> new ArrayList<>(inv.getArgument(0)));
  }

  private TestCase storedCase(String id, Project project) {
    TestCase tc = new TestCase();
    tc.setId(id);
    tc.setName("stored-" + id);
    tc.setType("folder");
    tc.setProject(project);
    tc.setVersion(0L);
    tc.setSteps(new ArrayList<>());
    return tc;
  }

  private TestCaseDto dto(String id, String projectId) {
    TestCaseDto dto = new TestCaseDto();
    dto.setId(id);
    dto.setName("edited");
    dto.setType("folder");
    dto.setProjectId(projectId);
    return dto;
  }

  @Test(description = "projectId 가 null 인 항목이 있으면 일괄 저장 전체를 거부한다")
  public void batchSaveRejectsNullProjectId() {
    List<TestCaseDto> dtos = List.of(dto("temp-1", PROJECT_B), dto("temp-2", null));

    Assert.assertThrows(IllegalArgumentException.class, () -> service.batchSaveTestCases(dtos));
    verify(testCaseRepository, never()).saveAll(anyList());
  }

  @Test(description = "projectId 가 공백 문자열이면 일괄 저장을 거부한다")
  public void batchSaveRejectsBlankProjectId() {
    List<TestCaseDto> dtos = List.of(dto("temp-1", "  "));

    Assert.assertThrows(IllegalArgumentException.class, () -> service.batchSaveTestCases(dtos));
    verify(testCaseRepository, never()).saveAll(anyList());
  }

  @Test(description = "요청은 편집 가능한 B 라고 해도 저장된 케이스가 A 에 있으면 거부한다")
  public void batchSaveRejectsExistingCaseFromOtherProject() {
    when(testCaseRepository.findById("tc-a")).thenReturn(Optional.of(storedCase("tc-a", projectA)));
    List<TestCaseDto> dtos = List.of(dto("tc-a", PROJECT_B));

    Assert.assertThrows(AccessDeniedException.class, () -> service.batchSaveTestCases(dtos));
    verify(projectSecurityService).canEditProject(PROJECT_A);
    verify(testCaseRepository, never()).saveAll(anyList());
  }

  @Test(description = "저장된 케이스와 요청이 모두 편집 가능한 프로젝트면 저장한다")
  public void batchSaveAllowsExistingCaseInEditableProject() {
    when(testCaseRepository.findById("tc-b")).thenReturn(Optional.of(storedCase("tc-b", projectB)));
    List<TestCaseDto> dtos = List.of(dto("tc-b", PROJECT_B));

    BatchSaveResult result = service.batchSaveTestCases(dtos);

    Assert.assertEquals(result.getSuccessCount(), 1, String.valueOf(result));
    Assert.assertEquals(result.getFailureCount(), 0);
    verify(testCaseRepository).saveAll(anyList());
  }

  @Test(description = "없는 케이스 ID 는 배치 전체를 막지 않고 항목별 오류로 남는다 (기존 동작 유지)")
  public void batchSaveKeepsPerItemErrorForMissingCase() {
    when(testCaseRepository.findById("tc-missing")).thenReturn(Optional.empty());
    List<TestCaseDto> dtos = List.of(dto("tc-missing", PROJECT_B));

    BatchSaveResult result = service.batchSaveTestCases(dtos);

    Assert.assertEquals(result.getSuccessCount(), 0);
    Assert.assertEquals(result.getFailureCount(), 1);
  }

  @Test(description = "단건 수정도 요청이 B 여도 저장된 케이스가 A 에 있으면 거부한다")
  public void updateTestCaseRejectsCaseFromOtherProject() {
    when(testCaseRepository.findById("tc-a")).thenReturn(Optional.of(storedCase("tc-a", projectA)));
    TestCaseDto request = dto("tc-a", PROJECT_B);

    Assert.assertThrows(
        AccessDeniedException.class, () -> service.updateTestCase("tc-a", request));
    verify(testCaseRepository, never()).save(any(TestCase.class));
  }

  @Test(description = "요청 프로젝트 편집 권한이 없으면 기존처럼 먼저 거부한다")
  public void batchSaveRejectsRequestProjectWithoutPermission() {
    List<TestCaseDto> dtos = List.of(dto("temp-1", PROJECT_A));

    Assert.assertThrows(AccessDeniedException.class, () -> service.batchSaveTestCases(dtos));
    verify(testCaseRepository, never()).findById(anyString());
  }
}
