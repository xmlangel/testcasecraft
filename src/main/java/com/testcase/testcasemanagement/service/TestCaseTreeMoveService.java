package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestCaseMoveBatchRequest;
import com.testcase.testcasemanagement.dto.TestCaseMoveRequest;
import com.testcase.testcasemanagement.dto.TestCaseMoveResultDto;
import com.testcase.testcasemanagement.dto.TestCaseMoveResultDto.MovedNode;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestCaseMoveAuditLog;
import com.testcase.testcasemanagement.repository.TestCaseMoveAuditLogRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 테스트케이스 트리 드래그앤드롭 이동 전용 서비스.
 *
 * <p>기존 {@link TestCaseService}와 분리되어 있으며, 부모 변경(reparent) + 같은 부모 내 순서 변경(reorder) + 다중 선택(batch)
 * 이동을 단일 트랜잭션으로 처리한다. 모든 성공한 이동은 {@code tc_move_audit_log}에 동기 기록된다.
 *
 * <p>설계 문서: {@code docs/plan/TREE_DND_REORGANIZE_PLAN.md}
 */
@Slf4j
@Service
public class TestCaseTreeMoveService {

  private final TestCaseRepository testCaseRepository;
  private final TestCaseMoveAuditLogRepository auditLogRepository;
  private final ProjectSecurityService projectSecurityService;
  private final SecurityContextUtil securityContextUtil;

  public TestCaseTreeMoveService(
      TestCaseRepository testCaseRepository,
      TestCaseMoveAuditLogRepository auditLogRepository,
      ProjectSecurityService projectSecurityService,
      SecurityContextUtil securityContextUtil) {
    this.testCaseRepository = testCaseRepository;
    this.auditLogRepository = auditLogRepository;
    this.projectSecurityService = projectSecurityService;
    this.securityContextUtil = securityContextUtil;
  }

  // ============================ Public API ============================

  /** 단건 이동. */
  @Transactional
  public TestCaseMoveResultDto move(String id, TestCaseMoveRequest req) {
    if (req == null) throw new MoveValidationException("요청 본문이 없습니다.");
    if (req.getBeforeId() != null && req.getAfterId() != null) {
      throw new MoveValidationException("beforeId와 afterId는 동시에 지정할 수 없습니다.");
    }

    TestCase node =
        testCaseRepository
            .findById(id)
            .orElseThrow(() -> new MoveNotFoundException("이동할 테스트케이스를 찾을 수 없습니다: " + id));

    validateAuthorization(node);
    String targetParentId = req.getTargetParentId();
    TestCase targetParent = resolveAndValidateTargetParent(node, targetParentId);
    Set<String> blockedIds = collectSelfAndDescendantIds(node.getId());
    if (targetParentId != null && blockedIds.contains(targetParentId)) {
      throw new MoveValidationException("자기 자신 또는 후손으로 이동할 수 없습니다.");
    }

    String oldParentId = node.getParentId();
    Integer oldOrder = node.getDisplayOrder();
    int newOrder = applyMoveOnSingleNode(node, targetParentId, req.getBeforeId(), req.getAfterId());

    // 옛 부모 형제 정규화
    if (!java.util.Objects.equals(oldParentId, targetParentId)) {
      renumberSiblings(node.getProject().getId(), oldParentId, node.getId());
    }

    TestCaseMoveAuditLog audit =
        recordAudit(node, oldParentId, targetParentId, oldOrder, newOrder, "single", null);

    return TestCaseMoveResultDto.builder()
        .moved(
            List.of(
                MovedNode.builder()
                    .id(node.getId())
                    .parentId(targetParentId)
                    .displayOrder(newOrder)
                    .build()))
        .auditLogIds(List.of(audit.getId()))
        .build();
  }

  /** 배치 이동. 입력 ids 순서대로 같은 부모에 displayOrder 부여. */
  @Transactional
  public TestCaseMoveResultDto moveBatch(TestCaseMoveBatchRequest req) {
    if (req == null || req.getIds() == null || req.getIds().isEmpty()) {
      throw new MoveValidationException("ids가 비어있습니다.");
    }
    if (req.getBeforeId() != null && req.getAfterId() != null) {
      throw new MoveValidationException("beforeId와 afterId는 동시에 지정할 수 없습니다.");
    }

    // 중복 제거하면서 순서 유지
    List<String> orderedIds = new ArrayList<>(new LinkedHashSet<>(req.getIds()));
    String targetParentId = req.getTargetParentId();

    // 모두 같은 프로젝트 + 권한 + systemFolder 보호 + 후손 차단
    List<TestCase> nodes = new ArrayList<>();
    String projectId = null;
    for (String id : orderedIds) {
      TestCase n =
          testCaseRepository
              .findById(id)
              .orElseThrow(() -> new MoveNotFoundException("테스트케이스를 찾을 수 없습니다: " + id));
      validateAuthorization(n);
      if (projectId == null) projectId = n.getProject().getId();
      else if (!projectId.equals(n.getProject().getId())) {
        throw new CrossProjectMoveException("배치 이동은 같은 프로젝트 내에서만 가능합니다.");
      }
      nodes.add(n);
    }

    TestCase targetParent = resolveAndValidateTargetParent(nodes.get(0), targetParentId);

    // 모든 후손 집합 합산하여 target 차단
    Set<String> blockedIds = new HashSet<>();
    for (TestCase n : nodes) blockedIds.addAll(collectSelfAndDescendantIds(n.getId()));
    if (targetParentId != null && blockedIds.contains(targetParentId)) {
      throw new MoveValidationException("자기 자신 또는 후손으로 이동할 수 없습니다.");
    }

    String batchGroupId = UUID.randomUUID().toString();
    List<MovedNode> moved = new ArrayList<>();
    List<String> auditIds = new ArrayList<>();
    Set<String> oldParents = new HashSet<>();

    // 변경 전 부모/순서를 미리 캡쳐 (audit log에 사용)
    List<String> fromParents = new ArrayList<>(nodes.size());
    List<Integer> fromOrders = new ArrayList<>(nodes.size());
    for (TestCase n : nodes) {
      fromParents.add(n.getParentId());
      fromOrders.add(n.getDisplayOrder());
      oldParents.add(n.getParentId() == null ? "" : n.getParentId());
    }

    // 한 번에 형제로 들어가도록: 새 부모의 기존 자식 가져와서 입력 노드 제거 후 삽입점에 일괄 삽입
    List<TestCase> siblings = new ArrayList<>(loadSortedSiblings(projectId, targetParentId));
    Set<String> movingIdSet = new HashSet<>(orderedIds);
    siblings.removeIf(s -> movingIdSet.contains(s.getId()));

    int insertIdx =
        computeInsertIndex(siblings, req.getBeforeId(), req.getAfterId(), targetParentId);

    List<TestCase> insertSlice = new ArrayList<>(nodes);
    for (TestCase n : insertSlice) {
      n.setParentId(targetParentId);
    }
    siblings.addAll(insertIdx, insertSlice);

    // 1..N 정규화
    for (int i = 0; i < siblings.size(); i++) {
      siblings.get(i).setDisplayOrder(i + 1);
    }
    testCaseRepository.saveAll(siblings);

    // 옛 부모들 정규화 (새 부모와 다른 경우만)
    for (String op : oldParents) {
      String opActual = op.isEmpty() ? null : op;
      if (!java.util.Objects.equals(opActual, targetParentId)) {
        renumberSiblings(projectId, opActual, null);
      }
    }

    // audit 행 생성 (변경 전 from* 값과 변경 후 to* 값 모두 기록)
    for (int i = 0; i < insertSlice.size(); i++) {
      TestCase n = insertSlice.get(i);
      moved.add(
          MovedNode.builder()
              .id(n.getId())
              .parentId(targetParentId)
              .displayOrder(n.getDisplayOrder())
              .build());
      TestCaseMoveAuditLog audit =
          recordAudit(
              n,
              fromParents.get(i),
              targetParentId,
              fromOrders.get(i),
              n.getDisplayOrder(),
              "batch",
              batchGroupId);
      auditIds.add(audit.getId());
    }

    return TestCaseMoveResultDto.builder()
        .moved(moved)
        .batchGroupId(batchGroupId)
        .auditLogIds(auditIds)
        .build();
  }

  // ============================ Internal helpers ============================

  /** 노드 + 모든 후손의 id 집합. 자기 자신 포함. */
  private Set<String> collectSelfAndDescendantIds(String rootId) {
    Set<String> result = new HashSet<>();
    List<String> queue = new ArrayList<>();
    queue.add(rootId);
    result.add(rootId);
    int i = 0;
    while (i < queue.size()) {
      String current = queue.get(i++);
      List<String> children =
          testCaseRepository.findByParentId(current).stream().map(TestCase::getId).toList();
      for (String c : children) {
        if (result.add(c)) queue.add(c);
      }
    }
    return result;
  }

  // 루트(parentId=null) 형제는 프로젝트 경계 없이 모든 프로젝트를 가로지르므로 반드시 projectId 로 한정한다.
  private List<TestCase> loadSortedSiblings(String projectId, String parentId) {
    List<TestCase> siblings =
        new ArrayList<>(
            testCaseRepository.findByProjectIdAndParentIdOrderByDisplayOrder(projectId, parentId));
    // 안전을 위해 displayOrder 기준 재정렬
    siblings.sort(
        Comparator.comparing(
            TestCase::getDisplayOrder, Comparator.nullsLast(Comparator.naturalOrder())));
    return siblings;
  }

  /** 단일 노드 이동 후 displayOrder를 반환. */
  private int applyMoveOnSingleNode(
      TestCase node, String targetParentId, String beforeId, String afterId) {
    List<TestCase> siblings =
        new ArrayList<>(loadSortedSiblings(node.getProject().getId(), targetParentId));
    // 자기 자신 제외
    siblings.removeIf(s -> s.getId().equals(node.getId()));
    int insertIdx = computeInsertIndex(siblings, beforeId, afterId, targetParentId);
    node.setParentId(targetParentId);
    siblings.add(insertIdx, node);
    for (int i = 0; i < siblings.size(); i++) {
      siblings.get(i).setDisplayOrder(i + 1);
    }
    testCaseRepository.saveAll(siblings);
    return node.getDisplayOrder();
  }

  private int computeInsertIndex(
      List<TestCase> siblings, String beforeId, String afterId, String targetParentId) {
    if (beforeId == null && afterId == null) return siblings.size();
    if (beforeId != null) {
      for (int i = 0; i < siblings.size(); i++) {
        if (beforeId.equals(siblings.get(i).getId())) return i;
      }
      throw new MoveValidationException("beforeId가 target 부모의 자식이 아닙니다: " + beforeId);
    }
    // afterId
    for (int i = 0; i < siblings.size(); i++) {
      if (afterId.equals(siblings.get(i).getId())) return i + 1;
    }
    throw new MoveValidationException("afterId가 target 부모의 자식이 아닙니다: " + afterId);
  }

  /** 기준 노드(removeId)는 제외하고 부모 자식 displayOrder를 1..N 으로 정규화. */
  private void renumberSiblings(String projectId, String parentId, String removeId) {
    List<TestCase> siblings = loadSortedSiblings(projectId, parentId);
    int n = 1;
    boolean changed = false;
    List<TestCase> toSave = new ArrayList<>();
    for (TestCase s : siblings) {
      if (removeId != null && removeId.equals(s.getId())) continue;
      if (s.getDisplayOrder() == null || s.getDisplayOrder() != n) {
        s.setDisplayOrder(n);
        toSave.add(s);
        changed = true;
      }
      n++;
    }
    if (changed) testCaseRepository.saveAll(toSave);
  }

  private TestCase resolveAndValidateTargetParent(TestCase movingNode, String targetParentId) {
    // 시스템 폴더 자체 이동 차단
    if (TestCaseConstants.TYPE_FOLDER.equals(movingNode.getType())
        && TestCaseConstants.SYSTEM_DEFAULT_FOLDER_DESCRIPTION.equals(
            movingNode.getDescription())) {
      throw new SystemFolderProtectedException("시스템 기본 폴더는 이동할 수 없습니다.");
    }

    if (targetParentId == null) return null; // 루트로 이동

    TestCase parent =
        testCaseRepository
            .findById(targetParentId)
            .orElseThrow(() -> new MoveNotFoundException("대상 부모를 찾을 수 없습니다: " + targetParentId));

    // 같은 프로젝트
    if (!parent.getProject().getId().equals(movingNode.getProject().getId())) {
      throw new CrossProjectMoveException("다른 프로젝트 폴더로는 이동할 수 없습니다.");
    }
    // 부모는 폴더여야 함 (testcase 아래로 이동 금지)
    if (!TestCaseConstants.TYPE_FOLDER.equals(parent.getType())) {
      throw new MoveValidationException("부모는 폴더 타입이어야 합니다: " + parent.getType());
    }
    return parent;
  }

  private void validateAuthorization(TestCase node) {
    if (node.getProject() == null || node.getProject().getId() == null) {
      throw new MoveValidationException("프로젝트 정보가 없는 노드입니다: " + node.getId());
    }
    String projectId = node.getProject().getId();
    // 테스트케이스/플랜/실행 CRUD 인가의 표준 검사(canEditProject: 시스템 ADMIN 또는 프로젝트 편집 롤)와 일치시킨다.
    // 트리 이동(DnD)도 create/update/delete와 동일한 편집 행위이므로 시스템 ADMIN을 제외하는 hasEditRole은 부적절 → 403 오작동.
    if (!projectSecurityService.canEditProject(projectId)) {
      throw new MoveForbiddenException("프로젝트 편집 권한이 없습니다: " + projectId);
    }
  }

  private TestCaseMoveAuditLog recordAudit(
      TestCase node,
      String fromParentId,
      String toParentId,
      Integer fromOrder,
      Integer toOrder,
      String kind,
      String batchGroupId) {
    String movedBy = securityContextUtil.getCurrentUsername();
    if (movedBy == null) movedBy = "system";
    TestCaseMoveAuditLog audit =
        TestCaseMoveAuditLog.builder()
            .testcaseId(node.getId())
            .fromParentId(fromParentId)
            .toParentId(toParentId)
            .fromDisplayOrder(fromOrder)
            .toDisplayOrder(toOrder)
            .movedBy(movedBy)
            .requestKind(kind)
            .batchGroupId(batchGroupId)
            .projectId(node.getProject().getId())
            .build();
    return auditLogRepository.save(audit);
  }

  // ============================ Exceptions ============================

  public static class MoveValidationException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public MoveValidationException(String msg) {
      super(msg);
    }
  }

  public static class MoveNotFoundException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public MoveNotFoundException(String msg) {
      super(msg);
    }
  }

  public static class MoveForbiddenException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public MoveForbiddenException(String msg) {
      super(msg);
    }
  }

  public static class CrossProjectMoveException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public CrossProjectMoveException(String msg) {
      super(msg);
    }
  }

  public static class SystemFolderProtectedException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public SystemFolderProtectedException(String msg) {
      super(msg);
    }
  }
}
