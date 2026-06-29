package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import com.testcase.testcasemanagement.dto.CrossProjectTransferRequest;
import com.testcase.testcasemanagement.dto.CrossProjectTransferResultDto;
import com.testcase.testcasemanagement.model.JiraSyncStatus;
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
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.mockito.Mockito;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * {@link TestCaseCrossProjectService} 단위 테스트 — 인메모리 가짜 리포지토리로 다른 프로젝트로의 이동(결과 미러링 포함)·복사·권한·무영향
 * 보장을 점검한다. 기존 {@code TestCaseTreeMoveServiceTest} 패턴을 그대로 따른다.
 */
public class TestCaseCrossProjectServiceTest {

  private TestCaseRepository testCaseRepository;
  private TestResultRepository testResultRepository;
  private TestExecutionRepository testExecutionRepository;
  private TestPlanRepository testPlanRepository;
  private ProjectRepository projectRepository;
  private TestCaseMoveAuditLogRepository auditLogRepository;
  private ProjectSecurityService projectSecurityService;
  private TestCaseCrossProjectService service;

  // 인메모리 저장소
  private Map<String, TestCase> store;
  private Map<String, TestResult> resultStore;
  private Map<String, TestExecution> execStore;
  private Map<String, TestPlan> planStore;
  private List<TestCaseMoveAuditLog> auditStore;

  private Project projectA;
  private Project projectB;

  @BeforeMethod
  public void setUp() {
    testCaseRepository = Mockito.mock(TestCaseRepository.class);
    testResultRepository = Mockito.mock(TestResultRepository.class);
    testExecutionRepository = Mockito.mock(TestExecutionRepository.class);
    testPlanRepository = Mockito.mock(TestPlanRepository.class);
    projectRepository = Mockito.mock(ProjectRepository.class);
    auditLogRepository = Mockito.mock(TestCaseMoveAuditLogRepository.class);
    projectSecurityService = Mockito.mock(ProjectSecurityService.class);

    service =
        new TestCaseCrossProjectService(
            testCaseRepository,
            testResultRepository,
            testExecutionRepository,
            testPlanRepository,
            projectRepository,
            auditLogRepository,
            new TestCaseDisplayIdService(),
            projectSecurityService);

    store = new HashMap<>();
    resultStore = new HashMap<>();
    execStore = new HashMap<>();
    planStore = new HashMap<>();
    auditStore = new ArrayList<>();

    projectA = new Project();
    projectA.setId("proj-A");
    projectA.setCode("AAA");
    projectB = new Project();
    projectB.setId("proj-B");
    projectB.setCode("BBB");

    // 권한 기본 허용
    lenient().when(projectSecurityService.hasEditRole(anyString())).thenReturn(true);
    lenient().when(projectSecurityService.canAccessProject(anyString())).thenReturn(true);

    // ProjectRepository
    lenient()
        .when(projectRepository.findById(anyString()))
        .thenAnswer(
            inv -> {
              String id = inv.getArgument(0);
              if ("proj-A".equals(id)) return Optional.of(projectA);
              if ("proj-B".equals(id)) return Optional.of(projectB);
              return Optional.empty();
            });

    // TestCaseRepository
    lenient()
        .when(testCaseRepository.findById(anyString()))
        .thenAnswer(inv -> Optional.ofNullable(store.get(inv.getArgument(0))));
    lenient()
        .when(testCaseRepository.findByParentIdOrderByDisplayOrder(anyString()))
        .thenAnswer(inv -> childrenOf(inv.getArgument(0)));
    lenient()
        .when(testCaseRepository.findByParentIdOrderByDisplayOrder(null))
        .thenAnswer(inv -> childrenOf(null));
    lenient()
        .when(testCaseRepository.findMaxSequentialIdByProjectId(anyString()))
        .thenAnswer(
            inv -> {
              String pid = inv.getArgument(0);
              return store.values().stream()
                  .filter(tc -> tc.getProject() != null && pid.equals(tc.getProject().getId()))
                  .map(TestCase::getSequentialId)
                  .filter(java.util.Objects::nonNull)
                  .max(Comparator.naturalOrder())
                  .orElse(null);
            });
    lenient()
        .when(testCaseRepository.findMaxDisplayOrderByParentId(anyString()))
        .thenAnswer(
            inv ->
                childrenOf(inv.getArgument(0)).stream()
                    .map(TestCase::getDisplayOrder)
                    .filter(java.util.Objects::nonNull)
                    .max(Comparator.naturalOrder())
                    .orElse(null));
    lenient()
        .when(testCaseRepository.saveAll(any()))
        .thenAnswer(
            inv -> {
              Iterable<TestCase> iter = inv.getArgument(0);
              List<TestCase> saved = new ArrayList<>();
              for (TestCase tc : iter) {
                store.put(tc.getId(), tc);
                saved.add(tc);
              }
              return saved;
            });
    lenient()
        .when(testCaseRepository.save(any(TestCase.class)))
        .thenAnswer(
            inv -> {
              TestCase tc = inv.getArgument(0);
              if (tc.getId() == null) tc.setId(UUID.randomUUID().toString());
              store.put(tc.getId(), tc);
              return tc;
            });

    // TestResultRepository
    lenient()
        .when(testResultRepository.findByTestCaseIdIn(any()))
        .thenAnswer(
            inv -> {
              Collection<String> ids = inv.getArgument(0);
              return resultStore.values().stream()
                  .filter(r -> ids.contains(r.getTestCaseId()))
                  .collect(Collectors.toList());
            });
    lenient()
        .when(testResultRepository.saveAll(any()))
        .thenAnswer(
            inv -> {
              Iterable<TestResult> iter = inv.getArgument(0);
              List<TestResult> saved = new ArrayList<>();
              for (TestResult r : iter) {
                resultStore.put(r.getId(), r);
                saved.add(r);
              }
              return saved;
            });

    // TestExecutionRepository
    lenient()
        .when(testExecutionRepository.save(any(TestExecution.class)))
        .thenAnswer(
            inv -> {
              TestExecution te = inv.getArgument(0);
              if (te.getId() == null) te.setId(UUID.randomUUID().toString());
              execStore.put(te.getId(), te);
              return te;
            });

    // TestPlanRepository
    lenient()
        .when(testPlanRepository.findByProjectId(anyString()))
        .thenAnswer(
            inv -> {
              String pid = inv.getArgument(0);
              return planStore.values().stream()
                  .filter(p -> p.getProject() != null && pid.equals(p.getProject().getId()))
                  .collect(Collectors.toList());
            });
    lenient()
        .when(testPlanRepository.save(any(TestPlan.class)))
        .thenAnswer(
            inv -> {
              TestPlan p = inv.getArgument(0);
              planStore.put(p.getId(), p);
              return p;
            });

    // AuditLogRepository
    lenient()
        .when(auditLogRepository.save(any(TestCaseMoveAuditLog.class)))
        .thenAnswer(
            inv -> {
              TestCaseMoveAuditLog a = inv.getArgument(0);
              if (a.getId() == null) a.setId(UUID.randomUUID().toString());
              auditStore.add(a);
              return a;
            });
  }

  private List<TestCase> childrenOf(String parentId) {
    return store.values().stream()
        .filter(tc -> java.util.Objects.equals(tc.getParentId(), parentId))
        .sorted(
            Comparator.comparing(
                TestCase::getDisplayOrder, Comparator.nullsLast(Comparator.naturalOrder())))
        .collect(Collectors.toList());
  }

  // ============================ Fixtures ============================

  private TestCase put(
      String id, String type, String parentId, Integer order, Integer seq, Project project) {
    TestCase tc = new TestCase();
    tc.setId(id);
    tc.setType(type);
    tc.setParentId(parentId);
    tc.setDisplayOrder(order);
    tc.setSequentialId(seq);
    tc.setProject(project);
    tc.setName(id);
    if (seq != null && project != null && project.getCode() != null) {
      tc.setDisplayId(String.format("%s-%03d", project.getCode(), seq));
    }
    store.put(id, tc);
    return tc;
  }

  private TestExecution putExec(String id, String name, Project project) {
    TestExecution te = new TestExecution();
    te.setId(id);
    te.setName(name);
    te.setProject(project);
    te.setStatus("COMPLETED");
    execStore.put(id, te);
    return te;
  }

  private TestResult putResult(String id, String testCaseId, TestExecution exec, String result) {
    TestResult r = new TestResult();
    r.setId(id);
    r.setTestCaseId(testCaseId);
    r.setTestExecution(exec);
    r.setResult(result);
    resultStore.put(id, r);
    return r;
  }

  /**
   * proj-A 트리:
   *
   * <pre>
   * proj-A
   *   ├─ F1 (folder, seq=null)
   *   │   ├─ T1 (testcase, seq=1, AAA-001)
   *   │   └─ T2 (testcase, seq=2, AAA-002)
   *   └─ F2 (folder, seq=null)
   *       └─ T3 (testcase, seq=3, AAA-003)
   * proj-B
   *   └─ DEST (folder)  ← 대상 부모
   * </pre>
   */
  private void buildTrees() {
    put("F1", "folder", null, 1, null, projectA);
    put("F2", "folder", null, 2, null, projectA);
    put("T1", "testcase", "F1", 1, 1, projectA);
    put("T2", "testcase", "F1", 2, 2, projectA);
    put("T3", "testcase", "F2", 1, 3, projectA);
    put("DEST", "folder", null, 1, null, projectB);
  }

  private CrossProjectTransferRequest req(List<String> ids, String targetParentId) {
    return new CrossProjectTransferRequest(ids, "proj-B", targetParentId);
  }

  // ============================ MOVE: testcase ============================

  @Test
  public void move_singleTestcase_reassignsProjectParentAndDisplayId() {
    buildTrees();
    CrossProjectTransferResultDto res = service.moveToProject(req(List.of("T1"), "DEST"));

    TestCase moved = store.get("T1");
    Assert.assertEquals(moved.getProject().getId(), "proj-B", "프로젝트가 대상으로 변경");
    Assert.assertEquals(moved.getParentId(), "DEST", "대상 폴더로 reparent");
    // 대상 프로젝트 기준 새 displayId (BBB-001)
    Assert.assertTrue(moved.getDisplayId().startsWith("BBB-"), "displayId 재발급: " + moved.getDisplayId());
    Assert.assertEquals(res.getMode(), "move");
    Assert.assertEquals(res.getTestCaseCount(), 1);
    Assert.assertEquals(res.getFolderCount(), 0);
  }

  @Test
  public void move_folderSubtree_movesAllDescendants_preservesInternalParents() {
    buildTrees();
    CrossProjectTransferResultDto res = service.moveToProject(req(List.of("F2"), "DEST"));

    // F2 와 T3 모두 대상 프로젝트로
    Assert.assertEquals(store.get("F2").getProject().getId(), "proj-B");
    Assert.assertEquals(store.get("T3").getProject().getId(), "proj-B");
    // 루트(F2)는 DEST 로, 내부 노드(T3)는 부모(F2) 유지
    Assert.assertEquals(store.get("F2").getParentId(), "DEST");
    Assert.assertEquals(store.get("T3").getParentId(), "F2");
    Assert.assertEquals(res.getFolderCount(), 1);
    Assert.assertEquals(res.getTestCaseCount(), 1);
  }

  // ============================ MOVE: results mirroring ============================

  @Test
  public void move_carriesResults_viaExecutionMirroring_andPreservesJira() {
    buildTrees();
    TestExecution e1 = putExec("E1", "Run 1", projectA);
    TestResult r1 = putResult("R1", "T1", e1, "FAIL");
    r1.setJiraIssueKey("BUG-100");
    r1.setJiraSyncStatus(JiraSyncStatus.SYNCED);

    CrossProjectTransferResultDto res = service.moveToProject(req(List.of("T1"), "DEST"));

    Assert.assertEquals(res.getMovedResultCount(), 1, "결과 1건 이동");
    Assert.assertEquals(res.getMirroredExecutionCount(), 1, "미러 실행 1건 생성");

    TestResult moved = resultStore.get("R1");
    Assert.assertNotEquals(moved.getTestExecution().getId(), "E1", "미러 실행으로 재지정");
    Assert.assertEquals(
        moved.getTestExecution().getProject().getId(), "proj-B", "미러 실행은 대상 프로젝트 소속");
    Assert.assertEquals(moved.getJiraIssueKey(), "BUG-100", "버그(JIRA) 필드 보존");
    Assert.assertEquals(moved.getJiraSyncStatus(), JiraSyncStatus.SYNCED);
    Assert.assertEquals(moved.getResult(), "FAIL");
    // 미러 실행 메타데이터 복제
    TestExecution mirror = moved.getTestExecution();
    Assert.assertEquals(mirror.getName(), "Run 1");
    Assert.assertNull(mirror.getTestPlanId(), "플랜은 출발 소속이라 미러엔 연결 안 함");
  }

  @Test
  public void move_doesNotTouchResultsOfNonMovedCases_inSameExecution() {
    buildTrees();
    // E1 실행에 T1(이동) 과 T2(잔류) 결과가 섞여 있음
    TestExecution e1 = putExec("E1", "Run 1", projectA);
    putResult("R1", "T1", e1, "PASS");
    putResult("R2", "T2", e1, "FAIL");

    service.moveToProject(req(List.of("T1"), "DEST"));

    // T2 결과는 그대로 출발 실행 E1 에 남아있어야 함 (기존 무영향)
    TestResult r2 = resultStore.get("R2");
    Assert.assertEquals(r2.getTestExecution().getId(), "E1");
    Assert.assertEquals(r2.getTestExecution().getProject().getId(), "proj-A");
    Assert.assertEquals(store.get("T2").getProject().getId(), "proj-A", "T2 자체도 이동 안 됨");
  }

  // ============================ MOVE: plan membership ============================

  @Test
  public void move_removesMovedCasesFromSourcePlans() {
    buildTrees();
    TestPlan plan = new TestPlan();
    plan.setId("PLAN1");
    plan.setProject(projectA);
    plan.setName("Plan A");
    plan.setTestCaseIds(new ArrayList<>(List.of("T1", "T2", "T3")));
    planStore.put("PLAN1", plan);

    CrossProjectTransferResultDto res = service.moveToProject(req(List.of("T1"), "DEST"));

    Assert.assertEquals(res.getRemovedFromPlanCount(), 1);
    Assert.assertFalse(planStore.get("PLAN1").getTestCaseIds().contains("T1"), "이동 케이스는 플랜에서 제거");
    Assert.assertTrue(planStore.get("PLAN1").getTestCaseIds().contains("T2"), "잔류 케이스는 유지");
  }

  // ============================ MOVE: permission roles ============================

  @Test(expectedExceptions = TestCaseTreeMoveService.MoveForbiddenException.class)
  public void move_withoutTargetEditRole_rejected() {
    buildTrees();
    when(projectSecurityService.hasEditRole("proj-A")).thenReturn(true);
    when(projectSecurityService.hasEditRole("proj-B")).thenReturn(false);
    service.moveToProject(req(List.of("T1"), "DEST"));
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.MoveForbiddenException.class)
  public void move_withoutSourceEditRole_rejected() {
    buildTrees();
    when(projectSecurityService.hasEditRole("proj-A")).thenReturn(false);
    when(projectSecurityService.hasEditRole("proj-B")).thenReturn(true);
    service.moveToProject(req(List.of("T1"), "DEST"));
  }

  // ============================ MOVE: validation ============================

  @Test(expectedExceptions = TestCaseTreeMoveService.MoveNotFoundException.class)
  public void move_unknownTargetProject_404() {
    buildTrees();
    service.moveToProject(new CrossProjectTransferRequest(List.of("T1"), "proj-NOPE", null));
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.MoveValidationException.class)
  public void move_targetParentNotInTargetProject_rejected() {
    buildTrees();
    // F1 은 proj-A 폴더 → proj-B 이동의 대상 부모가 될 수 없음
    service.moveToProject(req(List.of("T3"), "F1"));
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.MoveValidationException.class)
  public void move_emptyIds_rejected() {
    buildTrees();
    service.moveToProject(new CrossProjectTransferRequest(List.of(), "proj-B", "DEST"));
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.SystemFolderProtectedException.class)
  public void move_systemFolder_rejected() {
    buildTrees();
    TestCase sys = put("SYS", "folder", null, 9, null, projectA);
    sys.setDescription(TestCaseConstants.SYSTEM_DEFAULT_FOLDER_DESCRIPTION);
    service.moveToProject(req(List.of("SYS"), "DEST"));
  }

  // ============================ COPY ============================

  @Test
  public void copy_createsNewIds_leavesSourceUnchanged_noResults() {
    buildTrees();
    TestExecution e1 = putExec("E1", "Run 1", projectA);
    putResult("R1", "T1", e1, "PASS");

    CrossProjectTransferResultDto res = service.copyToProject(req(List.of("T1"), "DEST"));

    Assert.assertEquals(res.getMode(), "copy");
    Assert.assertEquals(res.getTestCaseCount(), 1);
    Assert.assertEquals(res.getMovedResultCount(), 0, "복사는 결과를 가져오지 않음");
    Assert.assertEquals(res.getMirroredExecutionCount(), 0);

    // 원본 T1 은 그대로 proj-A
    TestCase srcT1 = store.get("T1");
    Assert.assertEquals(srcT1.getProject().getId(), "proj-A");
    Assert.assertEquals(srcT1.getParentId(), "F1");

    // 새 노드가 생성됨 (새 id, proj-B, DEST)
    CrossProjectTransferResultDto.NodeMapping m = res.getNodes().get(0);
    Assert.assertNotEquals(m.getTargetId(), "T1", "새 ID 부여");
    TestCase clone = store.get(m.getTargetId());
    Assert.assertEquals(clone.getProject().getId(), "proj-B");
    Assert.assertEquals(clone.getParentId(), "DEST");
    Assert.assertTrue(clone.getDisplayId().startsWith("BBB-"));
    // 결과는 여전히 원본 케이스에만 연결
    Assert.assertEquals(resultStore.get("R1").getTestCaseId(), "T1");
  }

  @Test
  public void copy_folderSubtree_remapsInternalParentsToNewIds() {
    buildTrees();
    CrossProjectTransferResultDto res = service.copyToProject(req(List.of("F2"), "DEST"));

    // 매핑에서 F2→newF2, T3→newT3 찾기
    Map<String, String> map = new HashMap<>();
    for (CrossProjectTransferResultDto.NodeMapping m : res.getNodes()) {
      map.put(m.getSourceId(), m.getTargetId());
    }
    String newF2 = map.get("F2");
    String newT3 = map.get("T3");
    Assert.assertNotNull(newF2);
    Assert.assertNotNull(newT3);
    // 새 루트 F2 는 DEST 아래
    Assert.assertEquals(store.get(newF2).getParentId(), "DEST");
    // 새 내부 노드 T3 의 부모는 새 F2 (원본 F2 아님)
    Assert.assertEquals(store.get(newT3).getParentId(), newF2);
    // 원본은 무변경
    Assert.assertEquals(store.get("T3").getParentId(), "F2");
    Assert.assertEquals(store.get("F2").getProject().getId(), "proj-A");
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.MoveForbiddenException.class)
  public void copy_withoutTargetEditRole_rejected() {
    buildTrees();
    when(projectSecurityService.canAccessProject("proj-A")).thenReturn(true);
    when(projectSecurityService.hasEditRole("proj-B")).thenReturn(false);
    service.copyToProject(req(List.of("T1"), "DEST"));
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.MoveForbiddenException.class)
  public void copy_withoutSourceAccess_rejected() {
    buildTrees();
    when(projectSecurityService.canAccessProject("proj-A")).thenReturn(false);
    service.copyToProject(req(List.of("T1"), "DEST"));
  }
}
