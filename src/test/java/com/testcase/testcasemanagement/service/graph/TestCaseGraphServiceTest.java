package com.testcase.testcasemanagement.service.graph;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestStep;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * TestCaseGraphService 기능 테스트 — convertToGraph, updateGraphSteps, revertToBasic 에 대한 Cypher 쿼리 검증.
 */
public class TestCaseGraphServiceTest {

  @Mock private GraphDbClient graphDbClient;
  @Mock private GraphQueryService graphQueryService;
  @Mock private TestCaseRepository testCaseRepository;

  private TestCaseGraphService service;

  @BeforeMethod
  public void setUp() {
    MockitoAnnotations.openMocks(this);
    doNothing().when(graphDbClient).execute(anyString());
    // TestCaseGraphService를 수동으로 생성 (@ConditionalOnProperty 무시)
    service = new TestCaseGraphService(graphDbClient, graphQueryService, testCaseRepository);
  }

  private TestCase createBasicTestCase(String id) {
    Project project = new Project();
    project.setId("proj-001");
    project.setName("Test Project");

    TestCase tc = new TestCase();
    tc.setId(id);
    tc.setName("Test Case");
    tc.setProject(project);
    tc.setRepresentationMode(TestCase.MODE_BASIC);
    tc.setType("testcase");

    TestStep step1 = new TestStep();
    step1.setStepNumber(1);
    step1.setDescription("Step 1");
    step1.setExpectedResult("Result 1");

    tc.setSteps(List.of(step1));
    return tc;
  }

  @Test(description = "BASIC 모드 케이스를 GRAPH 모드로 전환한다")
  public void convertToGraphModeSuccessfully() {
    TestCase tc = createBasicTestCase("tc-001");
    when(testCaseRepository.findById("tc-001")).thenReturn(Optional.of(tc));
    when(testCaseRepository.save(any(TestCase.class)))
        .thenAnswer(
            inv -> {
              TestCase saved = inv.getArgument(0);
              return saved;
            });

    TestCase result = service.convertToGraph("tc-001");

    assertNotNull(result);
    assertEquals(result.getRepresentationMode(), TestCase.MODE_GRAPH);
    verify(graphDbClient, atLeastOnce()).execute(anyString());
    verify(testCaseRepository).save(any(TestCase.class));
  }

  @Test(description = "GRAPH 모드 케이스 재전환 시도는 멱등하다")
  public void convertToGraphIsIdempotent() {
    TestCase tc = createBasicTestCase("tc-001");
    tc.setRepresentationMode(TestCase.MODE_GRAPH);
    when(testCaseRepository.findById("tc-001")).thenReturn(Optional.of(tc));

    TestCase result = service.convertToGraph("tc-001");

    assertEquals(result.getRepresentationMode(), TestCase.MODE_GRAPH);
    verify(graphDbClient, never()).execute(anyString());
  }

  @Test(description = "폴더 타입 케이스는 그래프로 전환할 수 없다")
  public void rejectsConversionOfFolderType() {
    TestCase tc = createBasicTestCase("tc-001");
    tc.setType("folder");
    when(testCaseRepository.findById("tc-001")).thenReturn(Optional.of(tc));

    assertThrows(IllegalArgumentException.class, () -> service.convertToGraph("tc-001"));
  }

  @Test(description = "convertToGraph 시 루트 정점(GraphTestCase)을 MERGE한다")
  public void createsRootVertexDuringConversion() {
    TestCase tc = createBasicTestCase("tc-001");
    when(testCaseRepository.findById("tc-001")).thenReturn(Optional.of(tc));
    when(testCaseRepository.save(any(TestCase.class))).thenAnswer(inv -> inv.getArgument(0));

    ArgumentCaptor<String> queryCaptor = ArgumentCaptor.forClass(String.class);
    service.convertToGraph("tc-001");

    verify(graphDbClient, atLeastOnce()).execute(queryCaptor.capture());
    List<String> queries = queryCaptor.getAllValues();

    assertTrue(
        queries.stream().anyMatch(q -> q.contains("GraphTestCase") && q.contains("MERGE")),
        "Should create root vertex (GraphTestCase)");
  }

  @Test(description = "convertToGraph 시 기존 StepNode는 DETACH DELETE로 제거된다")
  public void deletesOldStepNodesDuringConversion() {
    TestCase tc = createBasicTestCase("tc-001");
    when(testCaseRepository.findById("tc-001")).thenReturn(Optional.of(tc));
    when(testCaseRepository.save(any(TestCase.class))).thenAnswer(inv -> inv.getArgument(0));

    ArgumentCaptor<String> queryCaptor = ArgumentCaptor.forClass(String.class);
    service.convertToGraph("tc-001");

    verify(graphDbClient, atLeastOnce()).execute(queryCaptor.capture());
    List<String> queries = queryCaptor.getAllValues();

    assertTrue(
        queries.stream().anyMatch(q -> q.contains("StepNode") && q.contains("DETACH DELETE")),
        "Should delete old StepNode vertices");
  }

  @Test(description = "convertToGraph 시 각 스텝마다 StepNode를 생성하고 NEXT로 연결한다")
  public void createsStepNodesAndLinksWithNext() {
    TestCase tc = createBasicTestCase("tc-001");
    when(testCaseRepository.findById("tc-001")).thenReturn(Optional.of(tc));
    when(testCaseRepository.save(any(TestCase.class))).thenAnswer(inv -> inv.getArgument(0));

    ArgumentCaptor<String> queryCaptor = ArgumentCaptor.forClass(String.class);
    service.convertToGraph("tc-001");

    verify(graphDbClient, atLeastOnce()).execute(queryCaptor.capture());
    List<String> queries = queryCaptor.getAllValues();

    assertTrue(
        queries.stream().anyMatch(q -> q.contains("StepNode") && q.contains("MERGE")),
        "Should create StepNode vertices");
  }

  @Test(description = "convertToGraph 시 스텝이 없으면 루트만 생성한다")
  public void handlesEmptyStepsList() {
    TestCase tc = createBasicTestCase("tc-001");
    tc.setSteps(new ArrayList<>());
    when(testCaseRepository.findById("tc-001")).thenReturn(Optional.of(tc));
    when(testCaseRepository.save(any(TestCase.class))).thenAnswer(inv -> inv.getArgument(0));

    TestCase result = service.convertToGraph("tc-001");

    assertNotNull(result);
    assertEquals(result.getRepresentationMode(), TestCase.MODE_GRAPH);
  }

  @Test(description = "convertToGraph 시 프리컨디션이 있으면 Precondition 노드를 생성한다")
  public void createsPreconditionNodeWhenPresent() {
    TestCase tc = createBasicTestCase("tc-001");
    tc.setPreCondition("테스트 전제조건");
    when(testCaseRepository.findById("tc-001")).thenReturn(Optional.of(tc));
    when(testCaseRepository.save(any(TestCase.class))).thenAnswer(inv -> inv.getArgument(0));

    ArgumentCaptor<String> queryCaptor = ArgumentCaptor.forClass(String.class);
    service.convertToGraph("tc-001");

    verify(graphDbClient, atLeastOnce()).execute(queryCaptor.capture());
    List<String> queries = queryCaptor.getAllValues();

    assertTrue(
        queries.stream().anyMatch(q -> q.contains("Precondition")),
        "Should create Precondition vertex");
  }

  @Test(description = "updateGraphSteps는 검증되지 않은 케이스를 거부한다")
  public void updateGraphStepsRejectsNonGraphMode() {
    TestCase tc = createBasicTestCase("tc-001");
    when(testCaseRepository.findById("tc-001")).thenReturn(Optional.of(tc));

    List<Map<String, Object>> steps = new ArrayList<>();
    assertThrows(IllegalStateException.class, () -> service.updateGraphSteps("tc-001", steps));
  }

  @Test(description = "updateGraphSteps는 null 페이로드를 거부한다")
  public void updateGraphStepsRejectsNullPayload() {
    TestCase tc = createBasicTestCase("tc-001");
    tc.setRepresentationMode(TestCase.MODE_GRAPH);
    when(testCaseRepository.findById("tc-001")).thenReturn(Optional.of(tc));

    assertThrows(IllegalArgumentException.class, () -> service.updateGraphSteps("tc-001", null));
  }

  @Test(description = "revertToBasic는 GRAPH 모드 케이스를 BASIC으로 변환한다")
  public void revertToBasicSuccessfully() {
    TestCase tc = createBasicTestCase("tc-001");
    tc.setRepresentationMode(TestCase.MODE_GRAPH);
    when(testCaseRepository.findById("tc-001")).thenReturn(Optional.of(tc));
    when(testCaseRepository.save(any(TestCase.class))).thenAnswer(inv -> inv.getArgument(0));

    TestCase result = service.revertToBasic("tc-001");

    assertNotNull(result);
    assertEquals(result.getRepresentationMode(), TestCase.MODE_BASIC);
    assertNotNull(result.getGraphSyncedAt());
    verify(testCaseRepository).save(any(TestCase.class));
  }

  @Test(description = "revertToBasic는 BASIC 케이스 재역전환 시도는 멱등하다")
  public void revertToBasicIsIdempotent() {
    TestCase tc = createBasicTestCase("tc-001");
    when(testCaseRepository.findById("tc-001")).thenReturn(Optional.of(tc));

    TestCase result = service.revertToBasic("tc-001");

    assertNotNull(result);
    assertEquals(result.getRepresentationMode(), TestCase.MODE_BASIC);
    verify(testCaseRepository, never()).save(any(TestCase.class));
  }

  @Test(description = "존재하지 않는 테스트케이스 조회 시 예외를 발생시킨다")
  public void throwsExceptionForNonExistentTestCase() {
    when(testCaseRepository.findById("non-existent")).thenReturn(Optional.empty());

    assertThrows(IllegalArgumentException.class, () -> service.convertToGraph("non-existent"));
  }

  @Test(description = "잘못된 테스트케이스 ID는 검증 단계에서 거부된다")
  public void validatesTestCaseIdFormat() {
    assertThrows(IllegalArgumentException.class, () -> service.convertToGraph("x' OR 1=1 --"));
  }

  @Test(description = "quote 메서드는 싱글쿼트와 백슬래시를 이스케이프한다")
  public void quotesSpecialCharacters() {
    assertEquals(TestCaseGraphService.quote("plain"), "'plain'");
    assertEquals(TestCaseGraphService.quote("it's"), "'it''s'");
    assertEquals(TestCaseGraphService.quote("path\\file"), "'path\\\\file'");
    assertEquals(TestCaseGraphService.quote(""), "''");
    assertEquals(TestCaseGraphService.quote(null), "''");
  }

  @Test(description = "quote 메서드는 Cypher 인젝션 시도를 무효화한다")
  public void preventsCypherInjectionViaQuote() {
    String injection = "x'}) DETACH DELETE (n) //";
    String quoted = TestCaseGraphService.quote(injection);
    assertEquals(quoted, "'x''}) DETACH DELETE (n) //'");
  }
}
