package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.CrossProjectTransferRequest;
import com.testcase.testcasemanagement.dto.CrossProjectTransferResultDto;
import com.testcase.testcasemanagement.dto.CrossProjectTransferResultDto.NodeMapping;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestCaseMoveAuditLog;
import com.testcase.testcasemanagement.model.TestExecution;
import com.testcase.testcasemanagement.model.TestPlan;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseMoveAuditLogRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import com.testcase.testcasemanagement.service.TestCaseTreeMoveService.MoveForbiddenException;
import com.testcase.testcasemanagement.service.TestCaseTreeMoveService.MoveNotFoundException;
import com.testcase.testcasemanagement.service.TestCaseTreeMoveService.MoveValidationException;
import com.testcase.testcasemanagement.service.TestCaseTreeMoveService.SystemFolderProtectedException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 테스트케이스를 다른 프로젝트로 <b>이동</b>하거나 <b>복사</b>하는 전용 서비스.
 *
 * <p>기존 같은-프로젝트 DnD 이동({@link TestCaseTreeMoveService})과 분리되어 있어 기존 동작에 영향을 주지 않는다. 스키마 변경 없이 기존
 * 테이블에 행을 추가/갱신하는 방식으로만 동작한다.
 *
 * <h3>이동(move) 시 테스트 결과 처리 — "실행 미러링"</h3>
 *
 * <p>테스트 결과({@link TestResult})는 케이스가 아니라 실행({@link TestExecution})에 매달려 있고, 실행은 프로젝트에 묶여 있다. 따라서
 * 옮기는 케이스들의 결과를 출발 실행별로 그룹핑하여 대상 프로젝트에 <em>대응 실행을 새로 만들고</em>(미러) 해당 결과 행만 미러 실행으로 재지정한다. JIRA 버그
 * 필드·첨부·태그·실행자·실행시각은 결과 행에 그대로 있으므로 함께 따라간다. 출발 실행은 그대로 남아 다른 케이스의 결과를 보존한다(기존 무영향).
 *
 * <h3>권한</h3>
 *
 * <ul>
 *   <li>이동: 출발 + 대상 프로젝트 모두 편집 권한({@code hasEditRole}) 필요.
 *   <li>복사: 출발 프로젝트 조회 권한({@code canAccessProject}) + 대상 프로젝트 편집 권한 필요.
 * </ul>
 */
@Slf4j
@Service
public class TestCaseCrossProjectService {

  private final TestCaseRepository testCaseRepository;
  private final TestResultRepository testResultRepository;
  private final TestExecutionRepository testExecutionRepository;
  private final TestPlanRepository testPlanRepository;
  private final ProjectRepository projectRepository;
  private final TestCaseMoveAuditLogRepository auditLogRepository;
  private final TestCaseDisplayIdService displayIdService;
  private final ProjectSecurityService projectSecurityService;

  public TestCaseCrossProjectService(
      TestCaseRepository testCaseRepository,
      TestResultRepository testResultRepository,
      TestExecutionRepository testExecutionRepository,
      TestPlanRepository testPlanRepository,
      ProjectRepository projectRepository,
      TestCaseMoveAuditLogRepository auditLogRepository,
      TestCaseDisplayIdService displayIdService,
      ProjectSecurityService projectSecurityService) {
    this.testCaseRepository = testCaseRepository;
    this.testResultRepository = testResultRepository;
    this.testExecutionRepository = testExecutionRepository;
    this.testPlanRepository = testPlanRepository;
    this.projectRepository = projectRepository;
    this.auditLogRepository = auditLogRepository;
    this.displayIdService = displayIdService;
    this.projectSecurityService = projectSecurityService;
  }

  // ============================ Public API ============================

  /** 선택한 케이스(폴더면 하위 전체)를 대상 프로젝트로 이동하고, 연결된 테스트 결과를 미러 실행으로 함께 옮긴다. */
  @Transactional
  public CrossProjectTransferResultDto moveToProject(CrossProjectTransferRequest req) {
    Context ctx = prepare(req);

    // 권한: 출발 + 대상 모두 편집권한
    if (!projectSecurityService.hasEditRole(ctx.sourceProjectId)) {
      throw new MoveForbiddenException("출발 프로젝트 편집 권한이 없습니다: " + ctx.sourceProjectId);
    }
    if (!projectSecurityService.hasEditRole(ctx.targetProject.getId())) {
      throw new MoveForbiddenException("대상 프로젝트 편집 권한이 없습니다: " + ctx.targetProject.getId());
    }

    SequenceAllocator seq = new SequenceAllocator(maxSeq(ctx.targetProject.getId()));
    int rootOrder = maxChildOrder(ctx.targetParentId);

    List<NodeMapping> mappings = new ArrayList<>();
    List<String> auditIds = new ArrayList<>();
    String batchGroupId = UUID.randomUUID().toString();
    int folderCount = 0;
    int testCaseCount = 0;

    for (TestCase node : ctx.orderedNodes) {
      boolean isRoot = isRoot(node, ctx.movedIds);
      String fromParent = node.getParentId();
      Integer fromOrder = node.getDisplayOrder();

      node.setProject(ctx.targetProject);
      reassignSequence(node, seq);
      if (isRoot) {
        node.setParentId(ctx.targetParentId);
        node.setDisplayOrder(++rootOrder);
      }
      // 내부 노드는 parentId(이미 옮겨지는 노드 id)와 displayOrder 유지

      if (TestCaseConstants.TYPE_FOLDER.equals(node.getType())) folderCount++;
      else testCaseCount++;

      TestCaseMoveAuditLog audit =
          recordAudit(
              node,
              fromParent,
              node.getParentId(),
              fromOrder,
              node.getDisplayOrder(),
              "cross-move",
              batchGroupId,
              ctx.targetProject.getId());
      auditIds.add(audit.getId());
      mappings.add(toMapping(node.getId(), node));
    }
    testCaseRepository.saveAll(ctx.orderedNodes);

    // 결과 미러링
    ResultMigration migration = migrateResults(ctx.movedIds, ctx.targetProject);

    // 출발 프로젝트 플랜 멤버십 정리
    int removedFromPlan = removeFromSourcePlans(ctx.sourceProjectId, ctx.movedIds);

    // 출발 프로젝트에는 추가 쓰기를 하지 않는다("기존 무영향" 보장). 옮겨간 루트 자리의
    // displayOrder 간격은 기능상 무해하므로 형제 재번호는 의도적으로 생략한다.

    return CrossProjectTransferResultDto.builder()
        .mode("move")
        .targetProjectId(ctx.targetProject.getId())
        .targetParentId(ctx.targetParentId)
        .nodes(mappings)
        .testCaseCount(testCaseCount)
        .folderCount(folderCount)
        .movedResultCount(migration.resultCount)
        .mirroredExecutionCount(migration.mirroredExecutionCount)
        .removedFromPlanCount(removedFromPlan)
        .batchGroupId(batchGroupId)
        .auditLogIds(auditIds)
        .build();
  }

  /** 선택한 케이스(폴더면 하위 전체)를 대상 프로젝트로 복사한다. 케이스만 복제하며 테스트 결과는 가져오지 않는다. 출발 데이터는 변경되지 않는다. */
  @Transactional
  public CrossProjectTransferResultDto copyToProject(CrossProjectTransferRequest req) {
    Context ctx = prepare(req);

    // 권한: 출발 조회 + 대상 편집
    if (!projectSecurityService.canAccessProject(ctx.sourceProjectId)) {
      throw new MoveForbiddenException("출발 프로젝트 조회 권한이 없습니다: " + ctx.sourceProjectId);
    }
    if (!projectSecurityService.hasEditRole(ctx.targetProject.getId())) {
      throw new MoveForbiddenException("대상 프로젝트 편집 권한이 없습니다: " + ctx.targetProject.getId());
    }

    SequenceAllocator seq = new SequenceAllocator(maxSeq(ctx.targetProject.getId()));
    int rootOrder = maxChildOrder(ctx.targetParentId);

    Map<String, String> idMap = new HashMap<>(); // oldId -> newId
    List<NodeMapping> mappings = new ArrayList<>();
    List<TestCase> clones = new ArrayList<>();
    int folderCount = 0;
    int testCaseCount = 0;

    // 부모 우선 정렬이므로 자식 처리 시 부모의 새 ID가 idMap에 이미 존재
    for (TestCase src : ctx.orderedNodes) {
      boolean isRoot = isRoot(src, ctx.movedIds);
      String newParentId = isRoot ? ctx.targetParentId : idMap.get(src.getParentId());

      TestCase clone = cloneTestCase(src, ctx.targetProject, newParentId, seq);
      if (isRoot) clone.setDisplayOrder(++rootOrder);

      TestCase saved = testCaseRepository.save(clone);
      idMap.put(src.getId(), saved.getId());

      if (TestCaseConstants.TYPE_FOLDER.equals(saved.getType())) folderCount++;
      else testCaseCount++;

      clones.add(saved);
      mappings.add(toMapping(src.getId(), saved));
    }

    return CrossProjectTransferResultDto.builder()
        .mode("copy")
        .targetProjectId(ctx.targetProject.getId())
        .targetParentId(ctx.targetParentId)
        .nodes(mappings)
        .testCaseCount(testCaseCount)
        .folderCount(folderCount)
        .movedResultCount(0)
        .mirroredExecutionCount(0)
        .removedFromPlanCount(0)
        .batchGroupId(null)
        .auditLogIds(List.of())
        .build();
  }

  // ============================ Shared preparation ============================

  /** 공통 검증 + 대상 부모/프로젝트 해석 + 이동 대상 서브트리 수집. */
  private Context prepare(CrossProjectTransferRequest req) {
    if (req == null || req.getIds() == null || req.getIds().isEmpty()) {
      throw new MoveValidationException("ids가 비어있습니다.");
    }
    if (req.getTargetProjectId() == null || req.getTargetProjectId().isBlank()) {
      throw new MoveValidationException("targetProjectId가 필요합니다.");
    }

    Project targetProject =
        projectRepository
            .findById(req.getTargetProjectId())
            .orElseThrow(
                () -> new MoveNotFoundException("대상 프로젝트를 찾을 수 없습니다: " + req.getTargetProjectId()));

    // 입력 노드 로드 + 같은 출발 프로젝트 보장 + 시스템 폴더 보호
    List<String> orderedIds = new ArrayList<>(new LinkedHashSet<>(req.getIds()));
    List<TestCase> roots = new ArrayList<>();
    String sourceProjectId = null;
    for (String id : orderedIds) {
      TestCase n =
          testCaseRepository
              .findById(id)
              .orElseThrow(() -> new MoveNotFoundException("테스트케이스를 찾을 수 없습니다: " + id));
      if (n.getProject() == null || n.getProject().getId() == null) {
        throw new MoveValidationException("프로젝트 정보가 없는 노드입니다: " + n.getId());
      }
      if (sourceProjectId == null) sourceProjectId = n.getProject().getId();
      else if (!sourceProjectId.equals(n.getProject().getId())) {
        throw new MoveValidationException("선택한 케이스는 모두 같은 출발 프로젝트에 속해야 합니다.");
      }
      if (isSystemFolder(n)) {
        throw new SystemFolderProtectedException("시스템 기본 폴더는 이동/복사할 수 없습니다.");
      }
      roots.add(n);
    }

    // 대상 부모 검증: 대상 프로젝트의 폴더여야 함
    String targetParentId = req.getTargetParentId();
    if (targetParentId != null) {
      TestCase parent =
          testCaseRepository
              .findById(targetParentId)
              .orElseThrow(
                  () -> new MoveNotFoundException("대상 부모 폴더를 찾을 수 없습니다: " + req.getTargetParentId()));
      if (parent.getProject() == null
          || !targetProject.getId().equals(parent.getProject().getId())) {
        throw new MoveValidationException("대상 부모 폴더가 대상 프로젝트에 속하지 않습니다: " + targetParentId);
      }
      if (!TestCaseConstants.TYPE_FOLDER.equals(parent.getType())) {
        throw new MoveValidationException("대상 부모는 폴더 타입이어야 합니다: " + parent.getType());
      }
    }

    // 서브트리 수집 (부모 우선 정렬)
    List<TestCase> ordered = new ArrayList<>();
    Set<String> movedIds = new LinkedHashSet<>();
    for (TestCase root : roots) {
      collectSubtree(root, ordered, movedIds);
    }

    // 대상 부모가 옮기는 서브트리 안에 있으면 순환 — 차단
    if (targetParentId != null && movedIds.contains(targetParentId)) {
      throw new MoveValidationException("자기 자신 또는 후손으로 이동/복사할 수 없습니다.");
    }

    Context ctx = new Context();
    ctx.sourceProjectId = sourceProjectId;
    ctx.targetProject = targetProject;
    ctx.targetParentId = targetParentId;
    ctx.orderedNodes = ordered;
    ctx.movedIds = movedIds;
    return ctx;
  }

  /** 노드 + 모든 후손을 부모 우선(BFS) 순서로 수집. */
  private void collectSubtree(TestCase root, List<TestCase> out, Set<String> seen) {
    List<TestCase> queue = new ArrayList<>();
    if (!seen.add(root.getId())) return; // 이미 다른 루트의 후손으로 포함됨
    queue.add(root);
    out.add(root);
    int i = 0;
    while (i < queue.size()) {
      TestCase current = queue.get(i++);
      for (TestCase child : testCaseRepository.findByParentIdOrderByDisplayOrder(current.getId())) {
        if (seen.add(child.getId())) {
          queue.add(child);
          out.add(child);
        }
      }
    }
  }

  // ============================ Result mirroring ============================

  private ResultMigration migrateResults(Set<String> movedIds, Project targetProject) {
    List<TestResult> results = testResultRepository.findByTestCaseIdIn(movedIds);
    ResultMigration m = new ResultMigration();
    if (results.isEmpty()) return m;

    Map<String, TestExecution> mirrorBySourceExec = new HashMap<>();
    List<TestResult> toSave = new ArrayList<>();
    for (TestResult r : results) {
      TestExecution src = r.getTestExecution();
      if (src == null) continue; // 실행에 매달리지 않은 결과는 건너뜀
      TestExecution mirror =
          mirrorBySourceExec.computeIfAbsent(
              src.getId(), k -> testExecutionRepository.save(mirrorExecution(src, targetProject)));
      r.setTestExecution(mirror);
      toSave.add(r);
    }
    testResultRepository.saveAll(toSave);
    m.resultCount = toSave.size();
    m.mirroredExecutionCount = mirrorBySourceExec.size();
    return m;
  }

  /** 출발 실행의 메타데이터를 복제한 대상 프로젝트 실행. 결과 목록은 비운 채 생성하고 결과 행의 FK만 재지정한다. */
  private TestExecution mirrorExecution(TestExecution src, Project targetProject) {
    TestExecution mirror = new TestExecution();
    mirror.setName(src.getName());
    mirror.setDescription(src.getDescription());
    mirror.setStatus(src.getStatus());
    mirror.setStartDate(src.getStartDate());
    mirror.setEndDate(src.getEndDate());
    mirror.setQaSummary(src.getQaSummary());
    mirror.setQaSummaryUpdatedBy(src.getQaSummaryUpdatedBy());
    mirror.setQaSummaryUpdatedAt(src.getQaSummaryUpdatedAt());
    if (src.getTags() != null) mirror.setTags(new HashSet<>(src.getTags()));
    // 플랜은 출발 프로젝트 소속이므로 대상에서는 연결하지 않음
    mirror.setTestPlanId(null);
    mirror.setProject(targetProject);
    LocalDateTime now = LocalDateTime.now();
    mirror.setCreatedAt(now);
    mirror.setUpdatedAt(now);
    return mirror;
  }

  // ============================ Plan membership cleanup ============================

  private int removeFromSourcePlans(String sourceProjectId, Set<String> movedIds) {
    int removed = 0;
    List<TestPlan> plans = testPlanRepository.findByProjectId(sourceProjectId);
    for (TestPlan plan : plans) {
      if (plan.getTestCaseIds() == null || plan.getTestCaseIds().isEmpty()) continue;
      int before = plan.getTestCaseIds().size();
      boolean changed = plan.getTestCaseIds().removeIf(movedIds::contains);
      if (changed) {
        removed += before - plan.getTestCaseIds().size();
        testPlanRepository.save(plan);
      }
    }
    return removed;
  }

  // ============================ Clone (copy) ============================

  private TestCase cloneTestCase(
      TestCase src, Project targetProject, String newParentId, SequenceAllocator seq) {
    TestCase clone = new TestCase();
    clone.setProject(targetProject);
    clone.setName(src.getName());
    clone.setType(src.getType());
    clone.setDescription(src.getDescription());
    clone.setPreCondition(src.getPreCondition());
    clone.setPostCondition(src.getPostCondition());
    clone.setIsAutomated(src.getIsAutomated());
    clone.setExecutionType(src.getExecutionType());
    clone.setTestTechnique(src.getTestTechnique());
    clone.setExpectedResults(src.getExpectedResults());
    clone.setPriority(src.getPriority());
    clone.setParentId(newParentId);
    clone.setDisplayOrder(src.getDisplayOrder());
    if (src.getSteps() != null) clone.setSteps(new ArrayList<>(src.getSteps()));
    if (src.getTags() != null) clone.setTags(new ArrayList<>(src.getTags()));
    if (src.getLinkedDocumentIds() != null) {
      clone.setLinkedDocumentIds(new ArrayList<>(src.getLinkedDocumentIds()));
    }
    reassignSequence(clone, seq);
    return clone;
  }

  // ============================ Helpers ============================

  /** testcase 타입이거나 기존에 sequentialId가 있던 노드에 대해 대상 프로젝트 기준 새 sequentialId + displayId 부여. */
  private void reassignSequence(TestCase node, SequenceAllocator seq) {
    boolean needsSeq =
        TestCaseConstants.TYPE_TESTCASE.equals(node.getType()) || node.getSequentialId() != null;
    if (needsSeq) {
      node.setSequentialId(seq.next());
      node.setDisplayId(displayIdService.generateDisplayId(node));
    } else {
      node.setDisplayId(null);
    }
  }

  private boolean isRoot(TestCase node, Set<String> movedIds) {
    return node.getParentId() == null || !movedIds.contains(node.getParentId());
  }

  private boolean isSystemFolder(TestCase n) {
    return TestCaseConstants.TYPE_FOLDER.equals(n.getType())
        && TestCaseConstants.SYSTEM_DEFAULT_FOLDER_DESCRIPTION.equals(n.getDescription());
  }

  private int maxSeq(String projectId) {
    Integer max = testCaseRepository.findMaxSequentialIdByProjectId(projectId);
    return max == null ? 0 : max;
  }

  private int maxChildOrder(String parentId) {
    Integer max = testCaseRepository.findMaxDisplayOrderByParentId(parentId);
    return max == null ? 0 : max;
  }

  private NodeMapping toMapping(String sourceId, TestCase node) {
    return NodeMapping.builder()
        .sourceId(sourceId)
        .targetId(node.getId())
        .type(node.getType())
        .parentId(node.getParentId())
        .displayOrder(node.getDisplayOrder())
        .displayId(node.getDisplayId())
        .build();
  }

  private TestCaseMoveAuditLog recordAudit(
      TestCase node,
      String fromParentId,
      String toParentId,
      Integer fromOrder,
      Integer toOrder,
      String kind,
      String batchGroupId,
      String projectId) {
    TestCaseMoveAuditLog audit =
        TestCaseMoveAuditLog.builder()
            .testcaseId(node.getId())
            .fromParentId(fromParentId)
            .toParentId(toParentId)
            .fromDisplayOrder(fromOrder)
            .toDisplayOrder(toOrder)
            .movedBy(currentUser())
            .requestKind(kind)
            .batchGroupId(batchGroupId)
            .projectId(projectId)
            .build();
    return auditLogRepository.save(audit);
  }

  private String currentUser() {
    try {
      org.springframework.security.core.Authentication auth =
          org.springframework.security.core.context.SecurityContextHolder.getContext()
              .getAuthentication();
      if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
        return auth.getName();
      }
    } catch (Exception ignore) {
      // ignore
    }
    return "system";
  }

  // ============================ Internal types ============================

  private static class Context {
    String sourceProjectId;
    Project targetProject;
    String targetParentId;
    List<TestCase> orderedNodes;
    Set<String> movedIds;
  }

  private static class ResultMigration {
    int resultCount = 0;
    int mirroredExecutionCount = 0;
  }

  private static class SequenceAllocator {
    private int current;

    SequenceAllocator(int start) {
      this.current = start;
    }

    int next() {
      return ++current;
    }
  }
}
