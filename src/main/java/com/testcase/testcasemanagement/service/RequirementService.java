package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.requirement.RequirementRequest;
import com.testcase.testcasemanagement.dto.requirement.RequirementResponse;
import com.testcase.testcasemanagement.dto.requirement.RequirementSpecRequest;
import com.testcase.testcasemanagement.dto.requirement.RequirementSpecResponse;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.Requirement;
import com.testcase.testcasemanagement.model.RequirementSpec;
import com.testcase.testcasemanagement.model.RequirementTestCaseLink;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.RequirementRepository;
import com.testcase.testcasemanagement.repository.RequirementSpecRepository;
import com.testcase.testcasemanagement.repository.RequirementTestCaseLinkRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Deque;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 요구사항 문서·요구사항 CRUD 와 테스트케이스 연결.
 *
 * <p>인가는 테스트케이스와 같은 표준을 쓴다. 조회는 프로젝트 접근 권한(canAccessProject), 변경은 프로젝트 편집 권한(canEditProject)이다.
 */
@Service
@Transactional
public class RequirementService {

  private final RequirementSpecRepository specRepository;
  private final RequirementRepository requirementRepository;
  private final RequirementTestCaseLinkRepository linkRepository;
  private final TestCaseRepository testCaseRepository;
  private final ProjectRepository projectRepository;
  private final ProjectSecurityService projectSecurityService;
  private final SecurityContextUtil securityContextUtil;

  public RequirementService(
      RequirementSpecRepository specRepository,
      RequirementRepository requirementRepository,
      RequirementTestCaseLinkRepository linkRepository,
      TestCaseRepository testCaseRepository,
      ProjectRepository projectRepository,
      ProjectSecurityService projectSecurityService,
      SecurityContextUtil securityContextUtil) {
    this.specRepository = specRepository;
    this.requirementRepository = requirementRepository;
    this.linkRepository = linkRepository;
    this.testCaseRepository = testCaseRepository;
    this.projectRepository = projectRepository;
    this.projectSecurityService = projectSecurityService;
    this.securityContextUtil = securityContextUtil;
  }

  // ---------------------------------------------------------------- 요구사항 문서

  @Transactional(readOnly = true)
  public List<RequirementSpecResponse> getSpecs(String projectId) {
    requireAccess(projectId);
    return specRepository.findByProjectIdOrderByDisplayOrderAscDocIdAsc(projectId).stream()
        .map(RequirementService::toSpecResponse)
        .toList();
  }

  public RequirementSpecResponse createSpec(RequirementSpecRequest request) {
    requireEdit(request.projectId());
    Project project = findProject(request.projectId());
    String docId = request.docId().trim();
    if (specRepository.existsByProjectIdAndDocId(project.getId(), docId)) {
      throw invalid("이미 사용 중인 문서 ID입니다.", "docId", docId);
    }
    if (request.parentId() != null) {
      findSpecInProject(request.parentId(), project.getId());
    }

    RequirementSpec spec = new RequirementSpec();
    spec.setProject(project);
    spec.setParentId(request.parentId());
    spec.setDocId(docId);
    spec.setTitle(request.title().trim());
    spec.setScope(request.scope());
    spec.setDisplayOrder(Objects.requireNonNullElse(request.displayOrder(), 1));
    spec.setCreatedBy(securityContextUtil.getCurrentUsername());
    return toSpecResponse(specRepository.save(spec));
  }

  public RequirementSpecResponse updateSpec(String id, RequirementSpecRequest request) {
    RequirementSpec spec = findSpec(id);
    String projectId = spec.getProject().getId();
    requireEdit(projectId);

    String docId = request.docId().trim();
    if (!docId.equals(spec.getDocId())
        && specRepository.existsByProjectIdAndDocId(projectId, docId)) {
      throw invalid("이미 사용 중인 문서 ID입니다.", "docId", docId);
    }
    if (!Objects.equals(request.parentId(), spec.getParentId())) {
      if (request.parentId() != null) {
        findSpecInProject(request.parentId(), projectId);
        if (subtreeIds(spec.getId()).contains(request.parentId())) {
          throw invalid("자기 자신이나 하위 문서 아래로 옮길 수 없습니다.", "parentId", request.parentId());
        }
      }
      spec.setParentId(request.parentId());
    }
    spec.setDocId(docId);
    spec.setTitle(request.title().trim());
    spec.setScope(request.scope());
    if (request.displayOrder() != null) {
      spec.setDisplayOrder(request.displayOrder());
    }
    return toSpecResponse(specRepository.save(spec));
  }

  /** 문서와 하위 문서, 그 안의 요구사항과 TC 연결을 함께 지운다. 테스트케이스 자체는 지우지 않는다. */
  public void deleteSpec(String id) {
    RequirementSpec spec = findSpec(id);
    requireEdit(spec.getProject().getId());

    Set<String> specIds = subtreeIds(spec.getId());
    List<Requirement> requirements = requirementRepository.findBySpecIdIn(specIds);
    if (!requirements.isEmpty()) {
      linkRepository.deleteByRequirementIdIn(
          requirements.stream().map(Requirement::getId).toList());
      requirementRepository.deleteAll(requirements);
    }
    specRepository.deleteAllById(specIds);
  }

  /** 문서 자신을 포함한 하위 트리 전체의 ID. */
  private Set<String> subtreeIds(String rootId) {
    Set<String> ids = new LinkedHashSet<>();
    Deque<String> queue = new ArrayDeque<>(List.of(rootId));
    while (!queue.isEmpty()) {
      String current = queue.poll();
      if (ids.add(current)) {
        specRepository.findByParentId(current).forEach(child -> queue.add(child.getId()));
      }
    }
    return ids;
  }

  // ---------------------------------------------------------------- 요구사항

  @Transactional(readOnly = true)
  public List<RequirementResponse> getRequirements(String projectId) {
    requireAccess(projectId);
    List<Requirement> requirements =
        requirementRepository.findByProjectIdOrderByDisplayOrderAscDocIdAsc(projectId);
    Map<String, List<String>> links = linkedCaseIds(requirements);
    return requirements.stream()
        .map(r -> toResponse(r, links.getOrDefault(r.getId(), List.of())))
        .toList();
  }

  @Transactional(readOnly = true)
  public RequirementResponse getRequirement(String id) {
    Requirement requirement = findRequirement(id);
    requireAccess(requirement.getProject().getId());
    return toResponse(requirement, linkedCaseIds(List.of(requirement)).getOrDefault(id, List.of()));
  }

  public RequirementResponse createRequirement(RequirementRequest request) {
    requireEdit(request.projectId());
    Project project = findProject(request.projectId());
    String docId = request.docId().trim();
    if (requirementRepository.existsByProjectIdAndDocId(project.getId(), docId)) {
      throw invalid("이미 사용 중인 요구사항 ID입니다.", "docId", docId);
    }

    Requirement requirement = new Requirement();
    requirement.setProject(project);
    requirement.setSpec(findSpecInProject(request.specId(), project.getId()));
    requirement.setDocId(docId);
    requirement.setCreatedBy(securityContextUtil.getCurrentUsername());
    applyFields(requirement, request);
    return toResponse(requirementRepository.save(requirement), List.of());
  }

  public RequirementResponse updateRequirement(String id, RequirementRequest request) {
    Requirement requirement = findRequirement(id);
    String projectId = requirement.getProject().getId();
    requireEdit(projectId);

    String docId = request.docId().trim();
    if (!docId.equals(requirement.getDocId())
        && requirementRepository.existsByProjectIdAndDocId(projectId, docId)) {
      throw invalid("이미 사용 중인 요구사항 ID입니다.", "docId", docId);
    }
    if (!request.specId().equals(requirement.getSpec().getId())) {
      requirement.setSpec(findSpecInProject(request.specId(), projectId));
    }
    requirement.setDocId(docId);
    applyFields(requirement, request);
    Requirement saved = requirementRepository.save(requirement);
    return toResponse(saved, linkedCaseIds(List.of(saved)).getOrDefault(id, List.of()));
  }

  public void deleteRequirement(String id) {
    Requirement requirement = findRequirement(id);
    requireEdit(requirement.getProject().getId());
    linkRepository.deleteByRequirementIdIn(List.of(id));
    requirementRepository.delete(requirement);
  }

  private void applyFields(Requirement requirement, RequirementRequest request) {
    requirement.setTitle(request.title().trim());
    requirement.setScope(request.scope());
    if (request.status() != null) {
      requirement.setStatus(parseEnum(Requirement.Status.class, request.status(), "status"));
    }
    if (request.type() != null) {
      requirement.setType(parseEnum(Requirement.Type.class, request.type(), "type"));
    }
    if (request.expectedCoverage() != null) {
      requirement.setExpectedCoverage(request.expectedCoverage());
    }
    if (request.displayOrder() != null) {
      requirement.setDisplayOrder(request.displayOrder());
    }
  }

  // ---------------------------------------------------------------- TC 연결

  /** 요구사항에 TC 를 더한다. 이미 연결된 TC 는 건너뛴다. */
  public RequirementResponse addTestCases(String requirementId, List<String> testCaseIds) {
    Requirement requirement = findRequirement(requirementId);
    String projectId = requirement.getProject().getId();
    requireEdit(projectId);
    String username = securityContextUtil.getCurrentUsername();
    for (String tcId : new LinkedHashSet<>(testCaseIds)) {
      requireTestCaseInProject(tcId, projectId);
      if (!linkRepository.existsByRequirementIdAndTestCaseId(requirementId, tcId)) {
        linkRepository.save(new RequirementTestCaseLink(requirementId, tcId, username));
      }
    }
    return getRequirement(requirementId);
  }

  public RequirementResponse removeTestCase(String requirementId, String testCaseId) {
    Requirement requirement = findRequirement(requirementId);
    requireEdit(requirement.getProject().getId());
    linkRepository.deleteByRequirementIdAndTestCaseId(requirementId, testCaseId);
    return getRequirement(requirementId);
  }

  /** TC 화면에서 쓰는 조회: 이 TC 가 연결된 요구사항 목록. */
  @Transactional(readOnly = true)
  public List<RequirementResponse> getRequirementsForTestCase(String testCaseId) {
    TestCase testCase = findTestCase(testCaseId);
    requireAccess(testCase.getProject().getId());
    List<String> ids =
        linkRepository.findByTestCaseId(testCaseId).stream()
            .map(RequirementTestCaseLink::getRequirementId)
            .toList();
    List<Requirement> requirements = requirementRepository.findAllById(ids);
    Map<String, List<String>> links = linkedCaseIds(requirements);
    return requirements.stream()
        .sorted((a, b) -> a.getDocId().compareTo(b.getDocId()))
        .map(r -> toResponse(r, links.getOrDefault(r.getId(), List.of())))
        .toList();
  }

  /** TC 화면에서 쓰는 저장: 이 TC 의 요구사항 연결을 주어진 목록으로 맞춘다. */
  public List<RequirementResponse> replaceRequirementsForTestCase(
      String testCaseId, List<String> requirementIds) {
    TestCase testCase = findTestCase(testCaseId);
    String projectId = testCase.getProject().getId();
    requireEdit(projectId);
    if (!"testcase".equals(testCase.getType())) {
      throw invalid("폴더에는 요구사항을 연결할 수 없습니다.", "testCaseId", testCaseId);
    }

    Set<String> wanted = new LinkedHashSet<>(requirementIds);
    for (String reqId : wanted) {
      Requirement requirement = findRequirement(reqId);
      if (!projectId.equals(requirement.getProject().getId())) {
        throw invalid("다른 프로젝트의 요구사항은 연결할 수 없습니다.", "requirementId", reqId);
      }
    }
    Set<String> current = new HashSet<>();
    for (RequirementTestCaseLink link : linkRepository.findByTestCaseId(testCaseId)) {
      if (wanted.contains(link.getRequirementId())) {
        current.add(link.getRequirementId());
      } else {
        linkRepository.delete(link);
      }
    }
    String username = securityContextUtil.getCurrentUsername();
    wanted.stream()
        .filter(reqId -> !current.contains(reqId))
        .forEach(
            reqId -> linkRepository.save(new RequirementTestCaseLink(reqId, testCaseId, username)));
    return getRequirementsForTestCase(testCaseId);
  }

  /** 요구사항별 연결 TC ID. 지워진 TC 를 가리키는 연결은 뺀다(연결 테이블은 TC 삭제와 함께 정리되지 않는다). */
  @Transactional(readOnly = true)
  public Map<String, List<String>> linkedCaseIds(Collection<Requirement> requirements) {
    if (requirements.isEmpty()) {
      return Map.of();
    }
    List<RequirementTestCaseLink> links =
        linkRepository.findByRequirementIdIn(
            requirements.stream().map(Requirement::getId).toList());
    Set<String> existing =
        testCaseRepository
            .findAllById(
                links.stream().map(RequirementTestCaseLink::getTestCaseId).distinct().toList())
            .stream()
            .map(TestCase::getId)
            .collect(Collectors.toSet());
    return links.stream()
        .filter(link -> existing.contains(link.getTestCaseId()))
        .collect(
            Collectors.groupingBy(
                RequirementTestCaseLink::getRequirementId,
                Collectors.mapping(RequirementTestCaseLink::getTestCaseId, Collectors.toList())));
  }

  // ---------------------------------------------------------------- 공통

  void requireAccess(String projectId) {
    if (!projectSecurityService.canAccessProject(projectId)) {
      throw new AccessDeniedException("프로젝트 접근 권한이 없습니다: " + projectId);
    }
  }

  private void requireEdit(String projectId) {
    if (!projectSecurityService.canEditProject(projectId)) {
      throw new AccessDeniedException("프로젝트 편집 권한이 없습니다: " + projectId);
    }
  }

  private Project findProject(String projectId) {
    return projectRepository
        .findById(projectId)
        .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다: " + projectId));
  }

  private RequirementSpec findSpec(String id) {
    return specRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("요구사항 문서를 찾을 수 없습니다: " + id));
  }

  private RequirementSpec findSpecInProject(String id, String projectId) {
    RequirementSpec spec = findSpec(id);
    if (!projectId.equals(spec.getProject().getId())) {
      throw invalid("다른 프로젝트의 요구사항 문서입니다.", "specId", id);
    }
    return spec;
  }

  private Requirement findRequirement(String id) {
    return requirementRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("요구사항을 찾을 수 없습니다: " + id));
  }

  private TestCase findTestCase(String id) {
    return testCaseRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("테스트케이스를 찾을 수 없습니다: " + id));
  }

  private void requireTestCaseInProject(String testCaseId, String projectId) {
    TestCase testCase = findTestCase(testCaseId);
    if (!projectId.equals(testCase.getProject().getId())) {
      throw invalid("다른 프로젝트의 테스트케이스는 연결할 수 없습니다.", "testCaseId", testCaseId);
    }
    if (!"testcase".equals(testCase.getType())) {
      throw invalid("폴더는 요구사항에 연결할 수 없습니다.", "testCaseId", testCaseId);
    }
  }

  private static <E extends Enum<E>> E parseEnum(Class<E> type, String value, String field) {
    try {
      return Enum.valueOf(type, value.trim().toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException ex) {
      throw invalid("허용되지 않는 값입니다.", field, value);
    }
  }

  private static ResourceNotValidException invalid(String message, String field, String value) {
    return new ResourceNotValidException(message, Map.of(field, String.valueOf(value)));
  }

  private static RequirementSpecResponse toSpecResponse(RequirementSpec spec) {
    return new RequirementSpecResponse(
        spec.getId(),
        spec.getProject().getId(),
        spec.getParentId(),
        spec.getDocId(),
        spec.getTitle(),
        spec.getScope(),
        spec.getDisplayOrder(),
        spec.getCreatedBy(),
        spec.getCreatedAt(),
        spec.getUpdatedAt());
  }

  private static RequirementResponse toResponse(Requirement r, List<String> linkedTestCaseIds) {
    return new RequirementResponse(
        r.getId(),
        r.getProject().getId(),
        r.getSpec().getId(),
        r.getDocId(),
        r.getTitle(),
        r.getScope(),
        r.getStatus().name(),
        r.getType().name(),
        r.getExpectedCoverage(),
        r.getDisplayOrder(),
        new ArrayList<>(linkedTestCaseIds),
        RequirementVerdicts.coverage(
            r.getStatus(), r.getExpectedCoverage(), linkedTestCaseIds.size()),
        r.getCreatedBy(),
        r.getCreatedAt(),
        r.getUpdatedAt());
  }
}
