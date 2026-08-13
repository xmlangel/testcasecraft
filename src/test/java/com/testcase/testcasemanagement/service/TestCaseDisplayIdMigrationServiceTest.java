package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * Display ID 마이그레이션이 기동마다 같은 실패를 반복하지 않는지 확인한다.
 *
 * <p>폴더는 순차 ID를 받지 않아 Display ID를 만들 수 없는데도 대상에 들어가 있어, 매 기동 로그에 "성공 0, 실패 24"와 폴더별 경고가 쌓였다. 대상을 부여
 * 가능한 노드로 좁히고, 순차 ID가 빠진 테스트 케이스는 그 자리에서 채운다.
 */
public class TestCaseDisplayIdMigrationServiceTest {

  @Mock private TestCaseRepository testCaseRepository;

  private TestCaseDisplayIdMigrationService migrationService;

  @BeforeMethod
  public void setUp() {
    MockitoAnnotations.openMocks(this);
    migrationService =
        new TestCaseDisplayIdMigrationService(testCaseRepository, new TestCaseDisplayIdService());
    when(testCaseRepository.save(any(TestCase.class))).thenAnswer(inv -> inv.getArgument(0));
  }

  private static Project project(String id, String code) {
    Project project = new Project();
    project.setId(id);
    project.setCode(code);
    project.setName("데모 프로젝트");
    return project;
  }

  private static TestCase node(String id, String type, Integer sequentialId, Project project) {
    TestCase testCase = new TestCase();
    testCase.setId(id);
    testCase.setType(type);
    testCase.setSequentialId(sequentialId);
    testCase.setProject(project);
    return testCase;
  }

  @Test
  public void 부여_가능한_노드만_조회한다() {
    when(testCaseRepository.findMigratableWithoutDisplayId()).thenReturn(Collections.emptyList());

    migrationService.migrateExistingTestCases();

    // 폴더까지 싣는 전체 조회는 더 이상 쓰지 않는다 — 이 경로가 매 기동 실패의 원인이었다
    verify(testCaseRepository, never()).findByDisplayIdIsNull();
    verify(testCaseRepository).findMigratableWithoutDisplayId();
    verify(testCaseRepository, never()).save(any(TestCase.class));
  }

  @Test
  public void 순차_ID가_있으면_그_번호로_Display_ID를_만든다() {
    Project project = project("p1", "DEMO");
    when(testCaseRepository.findMigratableWithoutDisplayId())
        .thenReturn(new ArrayList<>(List.of(node("tc-1", "testcase", 7, project))));

    migrationService.migrateExistingTestCases();

    ArgumentCaptor<TestCase> saved = ArgumentCaptor.forClass(TestCase.class);
    verify(testCaseRepository).save(saved.capture());
    assertEquals(saved.getValue().getDisplayId(), "DEMO-007");
    assertEquals(saved.getValue().getSequentialId(), Integer.valueOf(7));
  }

  @Test
  public void 순차_ID가_없는_테스트케이스는_프로젝트_다음_번호로_채운다() {
    Project project = project("p1", "DEMO");
    when(testCaseRepository.findMigratableWithoutDisplayId())
        .thenReturn(new ArrayList<>(List.of(node("tc-1", "testcase", null, project))));
    when(testCaseRepository.findMaxSequentialIdByProjectId("p1")).thenReturn(11);

    migrationService.migrateExistingTestCases();

    ArgumentCaptor<TestCase> saved = ArgumentCaptor.forClass(TestCase.class);
    verify(testCaseRepository).save(saved.capture());
    assertEquals(saved.getValue().getSequentialId(), Integer.valueOf(12));
    assertEquals(saved.getValue().getDisplayId(), "DEMO-012");
  }

  @Test
  public void 같은_프로젝트의_여러_건은_번호가_겹치지_않는다() {
    Project project = project("p1", "DEMO");
    when(testCaseRepository.findMigratableWithoutDisplayId())
        .thenReturn(
            new ArrayList<>(
                Arrays.asList(
                    node("tc-1", "testcase", null, project),
                    node("tc-2", "testcase", null, project),
                    node("tc-3", "testcase", null, project))));
    when(testCaseRepository.findMaxSequentialIdByProjectId("p1")).thenReturn(4);

    migrationService.migrateExistingTestCases();

    ArgumentCaptor<TestCase> saved = ArgumentCaptor.forClass(TestCase.class);
    verify(testCaseRepository, times(3)).save(saved.capture());
    List<String> displayIds = saved.getAllValues().stream().map(TestCase::getDisplayId).toList();
    assertEquals(displayIds, List.of("DEMO-005", "DEMO-006", "DEMO-007"));

    // MAX 조회는 프로젝트당 한 번이면 된다 (같은 트랜잭션에서 반복 조회하면 앞 번호를 못 본다)
    verify(testCaseRepository, times(1)).findMaxSequentialIdByProjectId("p1");
  }

  @Test
  public void 프로젝트가_없으면_번호를_채우지_않고_실패로_남긴다() {
    when(testCaseRepository.findMigratableWithoutDisplayId())
        .thenReturn(new ArrayList<>(List.of(node("tc-1", "testcase", null, null))));

    migrationService.migrateExistingTestCases();

    verify(testCaseRepository, never()).save(any(TestCase.class));
    verify(testCaseRepository, never()).findMaxSequentialIdByProjectId(any());
  }

  @Test
  public void 순차_ID를_가진_폴더는_그대로_부여한다() {
    Project project = project("p1", "DEMO");
    when(testCaseRepository.findMigratableWithoutDisplayId())
        .thenReturn(new ArrayList<>(List.of(node("folder-1", "folder", 3, project))));

    migrationService.migrateExistingTestCases();

    ArgumentCaptor<TestCase> saved = ArgumentCaptor.forClass(TestCase.class);
    verify(testCaseRepository).save(saved.capture());
    assertEquals(saved.getValue().getDisplayId(), "DEMO-003");
  }

  @Test
  public void 상태_확인은_부여_가능한_건수만_센다() {
    when(testCaseRepository.countMigratableWithoutDisplayId()).thenReturn(0L);

    assertEquals(migrationService.checkMigrationStatus(), 0L);

    // 폴더까지 세는 전체 카운트를 쓰면 "필요 24개"가 영구히 남는다
    verify(testCaseRepository, never()).countByDisplayIdIsNull();
  }

  @Test
  public void 프로젝트별_마이그레이션도_같은_조건을_쓴다() {
    Project project = project("p1", "DEMO");
    when(testCaseRepository.findMigratableWithoutDisplayIdByProjectId("p1"))
        .thenReturn(new ArrayList<>(List.of(node("tc-1", "testcase", 2, project))));

    assertEquals(migrationService.migrateByProject("p1"), 1);

    verify(testCaseRepository, never()).findByProjectIdAndDisplayIdIsNull(any());
  }
}
