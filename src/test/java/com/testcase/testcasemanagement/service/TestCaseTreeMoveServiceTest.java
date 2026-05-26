package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import com.testcase.testcasemanagement.dto.TestCaseMoveBatchRequest;
import com.testcase.testcasemanagement.dto.TestCaseMoveRequest;
import com.testcase.testcasemanagement.dto.TestCaseMoveResultDto;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestCaseMoveAuditLog;
import com.testcase.testcasemanagement.repository.TestCaseMoveAuditLogRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.security.ProjectSecurityService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.ArrayList;
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

/** {@link TestCaseTreeMoveService} 단위 테스트 — 인메모리 가짜 리포지토리로 트리 동작과 검증 규칙을 점검한다. */
public class TestCaseTreeMoveServiceTest {

  private TestCaseRepository testCaseRepository;
  private TestCaseMoveAuditLogRepository auditLogRepository;
  private ProjectSecurityService projectSecurityService;
  private SecurityContextUtil securityContextUtil;
  private TestCaseTreeMoveService service;

  // 인메모리 저장소
  private Map<String, TestCase> store;
  private List<TestCaseMoveAuditLog> auditStore;

  private Project projectA;
  private Project projectB;

  @BeforeMethod
  public void setUp() {
    testCaseRepository = Mockito.mock(TestCaseRepository.class);
    auditLogRepository = Mockito.mock(TestCaseMoveAuditLogRepository.class);
    projectSecurityService = Mockito.mock(ProjectSecurityService.class);
    securityContextUtil = Mockito.mock(SecurityContextUtil.class);

    service =
        new TestCaseTreeMoveService(
            testCaseRepository, auditLogRepository, projectSecurityService, securityContextUtil);

    store = new HashMap<>();
    auditStore = new ArrayList<>();

    projectA = new Project();
    projectA.setId("proj-A");
    projectB = new Project();
    projectB.setId("proj-B");

    // 권한 기본 허용 + 사용자 식별
    lenient().when(projectSecurityService.hasEditRole(anyString())).thenReturn(true);
    lenient().when(securityContextUtil.getCurrentUsername()).thenReturn("tester");

    // 리포지토리 fake 동작
    lenient()
        .when(testCaseRepository.findById(anyString()))
        .thenAnswer(inv -> Optional.ofNullable(store.get(inv.getArgument(0))));
    lenient()
        .when(testCaseRepository.findByParentId(anyString()))
        .thenAnswer(
            inv -> {
              String pid = inv.getArgument(0);
              return store.values().stream()
                  .filter(tc -> java.util.Objects.equals(tc.getParentId(), pid))
                  .collect(Collectors.toList());
            });
    lenient()
        .when(testCaseRepository.findByParentIdOrderByDisplayOrder(anyString()))
        .thenAnswer(
            inv -> {
              String pid = inv.getArgument(0);
              return store.values().stream()
                  .filter(tc -> java.util.Objects.equals(tc.getParentId(), pid))
                  .sorted(
                      Comparator.comparing(
                          TestCase::getDisplayOrder,
                          Comparator.nullsLast(Comparator.naturalOrder())))
                  .collect(Collectors.toList());
            });
    // findByParentIdOrderByDisplayOrder(null)도 처리
    lenient()
        .when(testCaseRepository.findByParentIdOrderByDisplayOrder(null))
        .thenAnswer(
            inv ->
                store.values().stream()
                    .filter(tc -> tc.getParentId() == null)
                    .sorted(
                        Comparator.comparing(
                            TestCase::getDisplayOrder,
                            Comparator.nullsLast(Comparator.naturalOrder())))
                    .collect(Collectors.toList()));
    lenient()
        .when(testCaseRepository.findByParentId(null))
        .thenAnswer(
            inv ->
                store.values().stream()
                    .filter(tc -> tc.getParentId() == null)
                    .collect(Collectors.toList()));

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
        .when(auditLogRepository.save(any(TestCaseMoveAuditLog.class)))
        .thenAnswer(
            inv -> {
              TestCaseMoveAuditLog a = inv.getArgument(0);
              if (a.getId() == null) a.setId(UUID.randomUUID().toString());
              auditStore.add(a);
              return a;
            });
  }

  // ============================ Fixtures ============================

  private TestCase put(String id, String type, String parentId, Integer order, Project project) {
    TestCase tc = new TestCase();
    tc.setId(id);
    tc.setType(type);
    tc.setParentId(parentId);
    tc.setDisplayOrder(order);
    tc.setProject(project);
    tc.setName(id);
    store.put(id, tc);
    return tc;
  }

  /**
   * 트리:
   *
   * <pre>
   * proj-A
   *   ├─ F1 (folder)
   *   │   ├─ T1 (testcase, order=1)
   *   │   └─ T2 (testcase, order=2)
   *   ├─ F2 (folder)
   *   │   └─ F2a (folder)
   *   │       └─ T3 (testcase, order=1)
   *   └─ F3 (folder, empty)
   * </pre>
   */
  private void buildTreeA() {
    put("F1", "folder", null, 1, projectA);
    put("F2", "folder", null, 2, projectA);
    put("F3", "folder", null, 3, projectA);
    put("T1", "testcase", "F1", 1, projectA);
    put("T2", "testcase", "F1", 2, projectA);
    put("F2a", "folder", "F2", 1, projectA);
    put("T3", "testcase", "F2a", 1, projectA);
  }

  // ============================ Single move tests ============================

  @Test
  public void move_reparentTestcaseToOtherFolder_success() {
    buildTreeA();
    TestCaseMoveRequest req = new TestCaseMoveRequest("F3", null, null);
    TestCaseMoveResultDto res = service.move("T1", req);
    Assert.assertEquals(res.getMoved().size(), 1);
    Assert.assertEquals(store.get("T1").getParentId(), "F3");
    Assert.assertEquals((int) store.get("T1").getDisplayOrder(), 1);
    // 옛 부모(F1)의 형제 재정규화: T2가 1로
    Assert.assertEquals((int) store.get("T2").getDisplayOrder(), 1);
    // audit 한 줄
    Assert.assertEquals(auditStore.size(), 1);
    Assert.assertEquals(auditStore.get(0).getRequestKind(), "single");
    Assert.assertEquals(auditStore.get(0).getFromParentId(), "F1");
    Assert.assertEquals(auditStore.get(0).getToParentId(), "F3");
  }

  @Test
  public void move_reorderWithinSameParent_beforeId_success() {
    buildTreeA();
    // T1을 같은 F1 내에서 T2의 "뒤"로 이동: afterId=T2
    TestCaseMoveRequest req = new TestCaseMoveRequest("F1", null, "T2");
    service.move("T1", req);
    Assert.assertEquals((int) store.get("T1").getDisplayOrder(), 2);
    Assert.assertEquals((int) store.get("T2").getDisplayOrder(), 1);
  }

  @Test(
      expectedExceptions = TestCaseTreeMoveService.MoveValidationException.class,
      expectedExceptionsMessageRegExp = ".*자기 자신 또는 후손.*")
  public void move_toSelf_rejected() {
    buildTreeA();
    service.move("F2", new TestCaseMoveRequest("F2", null, null));
  }

  @Test(
      expectedExceptions = TestCaseTreeMoveService.MoveValidationException.class,
      expectedExceptionsMessageRegExp = ".*자기 자신 또는 후손.*")
  public void move_toDescendant_rejected() {
    buildTreeA();
    // F2를 F2a로 이동 시도
    service.move("F2", new TestCaseMoveRequest("F2a", null, null));
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.CrossProjectMoveException.class)
  public void move_toOtherProject_rejected() {
    buildTreeA();
    TestCase outsider = put("X1", "folder", null, 1, projectB);
    service.move("T1", new TestCaseMoveRequest("X1", null, null));
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.MoveValidationException.class)
  public void move_underTestcase_rejected() {
    buildTreeA();
    service.move("T2", new TestCaseMoveRequest("T1", null, null));
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.SystemFolderProtectedException.class)
  public void move_systemFolder_rejected() {
    buildTreeA();
    TestCase sys = put("SYS", "folder", null, 99, projectA);
    sys.setDescription(TestCaseConstants.SYSTEM_DEFAULT_FOLDER_DESCRIPTION);
    store.put("SYS", sys);
    service.move("SYS", new TestCaseMoveRequest("F1", null, null));
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.MoveValidationException.class)
  public void move_bothBeforeAndAfter_rejected() {
    buildTreeA();
    service.move("T1", new TestCaseMoveRequest("F1", "T2", "T2"));
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.MoveForbiddenException.class)
  public void move_withoutEditRole_rejected() {
    buildTreeA();
    when(projectSecurityService.hasEditRole(anyString())).thenReturn(false);
    service.move("T1", new TestCaseMoveRequest("F2", null, null));
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.MoveNotFoundException.class)
  public void move_unknownNode_404() {
    buildTreeA();
    service.move("does-not-exist", new TestCaseMoveRequest("F1", null, null));
  }

  // ============================ Batch move tests ============================

  @Test
  public void moveBatch_threeNodesToNewFolder_preservesInputOrder() {
    buildTreeA();
    // T1, T3, T2 순서로 F3 끝에 이동
    TestCaseMoveBatchRequest req =
        new TestCaseMoveBatchRequest(List.of("T1", "T3", "T2"), "F3", null, null);
    TestCaseMoveResultDto res = service.moveBatch(req);
    Assert.assertEquals(res.getMoved().size(), 3);
    Assert.assertNotNull(res.getBatchGroupId());

    Assert.assertEquals(store.get("T1").getParentId(), "F3");
    Assert.assertEquals(store.get("T2").getParentId(), "F3");
    Assert.assertEquals(store.get("T3").getParentId(), "F3");

    Assert.assertEquals((int) store.get("T1").getDisplayOrder(), 1);
    Assert.assertEquals((int) store.get("T3").getDisplayOrder(), 2);
    Assert.assertEquals((int) store.get("T2").getDisplayOrder(), 3);

    // audit 3행, 같은 batchGroupId
    Assert.assertEquals(auditStore.size(), 3);
    String bgid = auditStore.get(0).getBatchGroupId();
    Assert.assertNotNull(bgid);
    for (TestCaseMoveAuditLog a : auditStore) {
      Assert.assertEquals(a.getBatchGroupId(), bgid);
      Assert.assertEquals(a.getRequestKind(), "batch");
    }
  }

  @Test(expectedExceptions = TestCaseTreeMoveService.MoveValidationException.class)
  public void moveBatch_targetIsDescendantOfAny_rejected() {
    buildTreeA();
    // F2를 포함한 배치를 F2a 아래로 이동 시도 → 자기 후손에 포함
    service.moveBatch(new TestCaseMoveBatchRequest(List.of("F2", "T1"), "F2a", null, null));
  }

  @Test
  public void moveBatch_emptyIds_rejected() {
    buildTreeA();
    Assert.assertThrows(
        TestCaseTreeMoveService.MoveValidationException.class,
        () -> service.moveBatch(new TestCaseMoveBatchRequest(List.of(), "F1", null, null)));
  }

  // ============================ Audit log ============================

  @Test
  public void auditLog_recordsFromAndToCorrectly() {
    buildTreeA();
    service.move("T1", new TestCaseMoveRequest("F3", null, null));
    TestCaseMoveAuditLog a = auditStore.get(0);
    Assert.assertEquals(a.getTestcaseId(), "T1");
    Assert.assertEquals(a.getFromParentId(), "F1");
    Assert.assertEquals(a.getToParentId(), "F3");
    Assert.assertEquals((int) a.getFromDisplayOrder(), 1);
    Assert.assertEquals((int) a.getToDisplayOrder(), 1);
    Assert.assertEquals(a.getMovedBy(), "tester");
    Assert.assertEquals(a.getProjectId(), "proj-A");
  }
}
