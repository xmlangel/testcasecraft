package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.testcase.testcasemanagement.dto.requirement.RequirementRequest;
import com.testcase.testcasemanagement.dto.requirement.RequirementSpecRequest;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.Requirement;
import com.testcase.testcasemanagement.model.RequirementSpec;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.RequirementRelationRepository;
import com.testcase.testcasemanagement.repository.RequirementRepository;
import com.testcase.testcasemanagement.repository.RequirementSpecRepository;
import com.testcase.testcasemanagement.repository.RequirementTestCaseLinkRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.List;
import java.util.Optional;
import org.mockito.Mockito;
import org.springframework.security.access.AccessDeniedException;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/** {@link RequirementService} 의 검증 규칙(권한·문서 ID 중복·프로젝트 경계·트리 순환). */
public class RequirementServiceTest {

  private RequirementSpecRepository specRepository;
  private RequirementRepository requirementRepository;
  private RequirementTestCaseLinkRepository linkRepository;
  private TestCaseRepository testCaseRepository;
  private ProjectRepository projectRepository;
  private ProjectSecurityService security;
  private RequirementService service;

  private Project projectA;
  private Project projectB;

  @BeforeMethod
  public void setUp() {
    specRepository = Mockito.mock(RequirementSpecRepository.class);
    requirementRepository = Mockito.mock(RequirementRepository.class);
    linkRepository = Mockito.mock(RequirementTestCaseLinkRepository.class);
    testCaseRepository = Mockito.mock(TestCaseRepository.class);
    projectRepository = Mockito.mock(ProjectRepository.class);
    security = Mockito.mock(ProjectSecurityService.class);
    SecurityContextUtil securityContextUtil = Mockito.mock(SecurityContextUtil.class);
    service =
        new RequirementService(
            specRepository,
            requirementRepository,
            linkRepository,
            Mockito.mock(RequirementRelationRepository.class),
            testCaseRepository,
            projectRepository,
            security,
            securityContextUtil);

    projectA = project("proj-A");
    projectB = project("proj-B");
    lenient().when(projectRepository.findById("proj-A")).thenReturn(Optional.of(projectA));
    lenient().when(security.canAccessProject(anyString())).thenReturn(true);
    lenient().when(security.canEditProject(anyString())).thenReturn(true);
    lenient().when(securityContextUtil.getCurrentUsername()).thenReturn("tester");
    lenient().when(specRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    lenient().when(requirementRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
  }

  @Test(expectedExceptions = AccessDeniedException.class)
  public void createSpecRequiresEditRole() {
    when(security.canEditProject("proj-A")).thenReturn(false);
    service.createSpec(new RequirementSpecRequest("proj-A", null, "SRS-01", "문서", null, null));
  }

  @Test(expectedExceptions = AccessDeniedException.class)
  public void listRequiresProjectAccess() {
    when(security.canAccessProject("proj-A")).thenReturn(false);
    service.getRequirements("proj-A");
  }

  @Test
  public void duplicateSpecDocIdIsRejected() {
    when(specRepository.existsByProjectIdAndDocId("proj-A", "SRS-01")).thenReturn(true);
    Assert.assertThrows(
        ResourceNotValidException.class,
        () ->
            service.createSpec(
                new RequirementSpecRequest("proj-A", null, " SRS-01 ", "문서", null, null)));
    verify(specRepository, never()).save(any());
  }

  @Test
  public void nextDocIdContinuesFromLargestNumberAndIgnoresOtherFormats() {
    Assert.assertEquals(
        RequirementService.nextDocId(
            "R-ONTS-",
            List.of("R-ONTS-001", "R-ONTS-009", "R-ONTS-002", "R-ONTS-X", "R-ONTS-001-003")),
        "R-ONTS-010");
    Assert.assertEquals(RequirementService.nextDocId("R-ONTS-", List.of()), "R-ONTS-001");
    Assert.assertEquals(
        RequirementService.nextDocId("R-ONTS-", List.of("R-ONTS-1234")), "R-ONTS-1235");
  }

  @Test
  public void blankRequirementIdIsNumberedUnderItsSpecId() {
    RequirementSpec spec = spec("spec-A", projectA, null);
    spec.setDocId("R-ONTS-002");
    when(specRepository.findById("spec-A")).thenReturn(Optional.of(spec));
    when(requirementRepository.findDocIdsByPrefix("proj-A", "R-ONTS-002-"))
        .thenReturn(List.of("R-ONTS-002-001", "R-ONTS-002-004"));

    var created =
        service.createRequirement(
            new RequirementRequest("proj-A", "spec-A", "  ", "요구사항", null, null, null, 1, null));

    Assert.assertEquals(created.docId(), "R-ONTS-002-005");
  }

  @Test
  public void blankSpecIdIsGeneratedFromProjectCode() {
    projectA.setCode("onts");
    when(specRepository.findDocIdsByPrefix("proj-A", "R-ONTS-"))
        .thenReturn(List.of("R-ONTS-001", "R-ONTS-002"));

    var created =
        service.createSpec(new RequirementSpecRequest("proj-A", null, null, "문서", null, null));

    Assert.assertEquals(created.docId(), "R-ONTS-003");
  }

  @Test
  public void blankIdOnUpdateKeepsExistingId() {
    Requirement existing = requirement("r1", projectA);
    existing.setDocId("R-ONTS-001-007");
    when(requirementRepository.findById("r1")).thenReturn(Optional.of(existing));

    var updated =
        service.updateRequirement(
            "r1",
            new RequirementRequest(
                "proj-A", existing.getSpec().getId(), "", "바뀐 제목", null, null, null, 1, null));

    Assert.assertEquals(updated.docId(), "R-ONTS-001-007");
  }

  @Test
  public void requirementCannotUseSpecOfAnotherProject() {
    RequirementSpec foreign = spec("spec-B", projectB, null);
    when(specRepository.findById("spec-B")).thenReturn(Optional.of(foreign));
    Assert.assertThrows(
        ResourceNotValidException.class,
        () ->
            service.createRequirement(
                new RequirementRequest(
                    "proj-A", "spec-B", "REQ-1", "요구사항", null, null, null, 1, null)));
  }

  @Test
  public void invalidStatusIsRejected() {
    when(specRepository.findById("spec-A")).thenReturn(Optional.of(spec("spec-A", projectA, null)));
    Assert.assertThrows(
        ResourceNotValidException.class,
        () ->
            service.createRequirement(
                new RequirementRequest(
                    "proj-A", "spec-A", "REQ-1", "요구사항", null, "DONE", null, 1, null)));
  }

  @Test
  public void specCannotMoveUnderItsOwnDescendant() {
    RequirementSpec parent = spec("s1", projectA, null);
    RequirementSpec child = spec("s2", projectA, "s1");
    when(specRepository.findById("s1")).thenReturn(Optional.of(parent));
    when(specRepository.findById("s2")).thenReturn(Optional.of(child));
    when(specRepository.findByParentId("s1")).thenReturn(List.of(child));
    when(specRepository.findByParentId("s2")).thenReturn(List.of());
    Assert.assertThrows(
        ResourceNotValidException.class,
        () ->
            service.updateSpec(
                "s1", new RequirementSpecRequest("proj-A", "s2", "S1", "부모", null, null)));
  }

  @Test
  public void linkingTestCaseOfAnotherProjectIsRejected() {
    Requirement requirement = requirement("r1", projectA);
    when(requirementRepository.findById("r1")).thenReturn(Optional.of(requirement));
    when(testCaseRepository.findById("tc-B"))
        .thenReturn(Optional.of(testCase("tc-B", projectB, "testcase")));
    Assert.assertThrows(
        ResourceNotValidException.class, () -> service.addTestCases("r1", List.of("tc-B")));
    verify(linkRepository, never()).save(any());
  }

  @Test
  public void linkingFolderIsRejected() {
    Requirement requirement = requirement("r1", projectA);
    when(requirementRepository.findById("r1")).thenReturn(Optional.of(requirement));
    when(testCaseRepository.findById("f1"))
        .thenReturn(Optional.of(testCase("f1", projectA, "folder")));
    Assert.assertThrows(
        ResourceNotValidException.class, () -> service.addTestCases("r1", List.of("f1")));
  }

  private static Project project(String id) {
    Project project = new Project();
    project.setId(id);
    return project;
  }

  private static RequirementSpec spec(String id, Project project, String parentId) {
    RequirementSpec spec = new RequirementSpec();
    spec.setId(id);
    spec.setProject(project);
    spec.setParentId(parentId);
    spec.setDocId(id.toUpperCase());
    spec.setTitle(id);
    return spec;
  }

  private static Requirement requirement(String id, Project project) {
    Requirement requirement = new Requirement();
    requirement.setId(id);
    requirement.setProject(project);
    requirement.setSpec(spec("spec-" + id, project, null));
    requirement.setDocId(id.toUpperCase());
    requirement.setTitle(id);
    return requirement;
  }

  private static TestCase testCase(String id, Project project, String type) {
    TestCase testCase = new TestCase();
    testCase.setId(id);
    testCase.setProject(project);
    testCase.setType(type);
    return testCase;
  }
}
