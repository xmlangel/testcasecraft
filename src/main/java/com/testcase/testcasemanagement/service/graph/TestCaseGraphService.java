package com.testcase.testcasemanagement.service.graph;

import com.testcase.testcasemanagement.dto.graph.GraphResponseDto;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestStep;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 그래프 테스트 케이스 전환/역투영 서비스 (계획 §5, §6).
 *
 * <ul>
 *   <li>convert: BASIC → GRAPH — 선형 스텝을 StepNode 체인으로 그래프에 적재 (비파괴적, 관계형 스텝은 미러로 유지)
 *   <li>projectToRelational: GRAPH → 관계형 미러 — 그래프 스텝을 testcasesteps 로 평탄화
 *   <li>updateGraphSteps: 그래프 스텝 편집 → 서브그래프 재작성 + 즉시 역투영
 *   <li>revert: GRAPH → BASIC — 관계형 미러를 SSOT 로 승격 (그래프 정점은 남긴다)
 * </ul>
 *
 * <p>임의 텍스트(스텝 설명 등)는 {@link #quote(String)} 로 이스케이프해 Cypher 리터럴로 넣는다.
 */
@Service
@ConditionalOnProperty(prefix = "features.graph", name = "enabled", havingValue = "true")
public class TestCaseGraphService {

  private static final Logger logger = LoggerFactory.getLogger(TestCaseGraphService.class);
  private static final int MAX_STEPS = 200;

  private final GraphDbClient graphDbClient;
  private final GraphQueryService graphQueryService;
  private final TestCaseRepository testCaseRepository;

  public TestCaseGraphService(
      GraphDbClient graphDbClient,
      GraphQueryService graphQueryService,
      TestCaseRepository testCaseRepository) {
    this.graphDbClient = graphDbClient;
    this.graphQueryService = graphQueryService;
    this.testCaseRepository = testCaseRepository;
  }

  /** 시나리오 C — 기본(선형) 케이스를 그래프 표현으로 전환한다. */
  @Transactional
  public TestCase convertToGraph(String testCaseId) {
    GraphQueryService.validateId(testCaseId);
    TestCase testCase = loadCase(testCaseId);
    if (testCase.isGraphMode()) {
      return testCase; // 이미 그래프 모드 — 멱등
    }
    if ("folder".equalsIgnoreCase(testCase.getType())) {
      throw new IllegalArgumentException("폴더는 그래프로 전환할 수 없습니다: " + testCaseId);
    }

    List<TestStep> steps = testCase.getSteps() != null ? testCase.getSteps() : List.of();
    writeStepChain(testCase, steps);

    testCase.setRepresentationMode(TestCase.MODE_GRAPH);
    testCase.setGraphVertexId(testCaseId);
    testCase.setGraphSyncedAt(LocalDateTime.now());
    logger.info("테스트케이스 {} 를 그래프 모드로 전환 (스텝 {}개)", testCaseId, steps.size());
    return testCaseRepository.save(testCase);
  }

  /** 그래프 스텝 편집 — 서브그래프를 통째로 재작성하고 관계형 미러를 즉시 재생성한다 (§5-C: 이중 편집 없음). */
  @Transactional
  public TestCase updateGraphSteps(String testCaseId, List<Map<String, Object>> stepPayload) {
    GraphQueryService.validateId(testCaseId);
    TestCase testCase = loadCase(testCaseId);
    if (!testCase.isGraphMode()) {
      throw new IllegalStateException("그래프 모드가 아닌 케이스입니다 — 먼저 전환하세요: " + testCaseId);
    }
    if (stepPayload == null || stepPayload.size() > MAX_STEPS) {
      throw new IllegalArgumentException("스텝은 1~" + MAX_STEPS + "개여야 합니다");
    }

    List<TestStep> steps = new ArrayList<>();
    for (int i = 0; i < stepPayload.size(); i++) {
      Map<String, Object> raw = stepPayload.get(i);
      TestStep step = new TestStep();
      step.setStepNumber(i + 1);
      step.setDescription(asText(raw.get("description")));
      step.setExpectedResult(asText(raw.get("expectedResult")));
      steps.add(step);
    }

    writeStepChain(testCase, steps);

    // 관계형 미러 즉시 재생성 (역투영) — 기존 스프레드시트/폼에서 항상 조회 가능해야 한다
    testCase.setSteps(steps);
    testCase.setGraphSyncedAt(LocalDateTime.now());
    return testCaseRepository.save(testCase);
  }

  /** 그래프 스텝 서브그래프 조회 — 편집기 로딩용. */
  @Transactional(readOnly = true)
  public GraphResponseDto getGraphSteps(String testCaseId) {
    GraphQueryService.validateId(testCaseId);
    GraphResponseDto response = new GraphResponseDto();
    String cypher =
        "MATCH (g:\"GraphTestCase\" {id: '"
            + testCaseId
            + "'})-[e:\"STARTS_AT\"|\"NEXT\"]->(s) RETURN g, e, s LIMIT "
            + (MAX_STEPS + 1);
    graphDbClient
        .query(
            cypher,
            (rs, rowNum) -> new String[] {rs.getString(1), rs.getString(2), rs.getString(3)})
        .forEach(
            row -> {
              response.addNode(AgResultParser.parseVertex(row[0]));
              response.addEdge(AgResultParser.parseEdge(row[1]));
              response.addNode(AgResultParser.parseVertex(row[2]));
            });
    return response;
  }

  /** 역전환 — 관계형 미러를 SSOT 로 승격한다. 그래프 정점은 이력으로 남긴다 (재전환 시 덮어씀). */
  @Transactional
  public TestCase revertToBasic(String testCaseId) {
    GraphQueryService.validateId(testCaseId);
    TestCase testCase = loadCase(testCaseId);
    if (!testCase.isGraphMode()) {
      return testCase; // 이미 BASIC — 멱등
    }
    testCase.setRepresentationMode(TestCase.MODE_BASIC);
    testCase.setGraphSyncedAt(LocalDateTime.now());
    logger.info("테스트케이스 {} 를 기본 모드로 역전환", testCaseId);
    return testCaseRepository.save(testCase);
  }

  /**
   * 일괄 전환 (P5) — 폴더(하위 전체) 또는 프로젝트 전체의 BASIC 케이스를 그래프 모드로 전환한다. folderId 가 null 이면 프로젝트 전체. 반환:
   * {converted, skipped(이미 그래프/폴더)}.
   */
  @Transactional
  public Map<String, Integer> bulkConvert(String projectId, String folderId) {
    GraphQueryService.validateId(projectId);
    if (folderId != null) {
      GraphQueryService.validateId(folderId);
    }
    List<TestCase> all = testCaseRepository.findAllByProjectIdWithHierarchy(projectId);

    // parentId 기준 자손 집합 계산 (folderId 지정 시)
    java.util.Set<String> inScope = new java.util.HashSet<>();
    if (folderId == null) {
      all.forEach(tc -> inScope.add(tc.getId()));
    } else {
      java.util.Map<String, List<TestCase>> byParent = new java.util.HashMap<>();
      for (TestCase tc : all) {
        byParent.computeIfAbsent(tc.getParentId(), k -> new ArrayList<>()).add(tc);
      }
      java.util.Deque<String> queue = new java.util.ArrayDeque<>();
      queue.add(folderId);
      while (!queue.isEmpty()) {
        String current = queue.poll();
        for (TestCase child : byParent.getOrDefault(current, List.of())) {
          if (inScope.add(child.getId())) {
            queue.add(child.getId());
          }
        }
      }
    }

    int converted = 0;
    int skipped = 0;
    for (TestCase tc : all) {
      if (!inScope.contains(tc.getId())) {
        continue;
      }
      if ("folder".equalsIgnoreCase(tc.getType()) || tc.isGraphMode()) {
        skipped++;
        continue;
      }
      convertToGraph(tc.getId());
      converted++;
    }
    logger.info(
        "일괄 전환 — project={}, folder={}, converted={}, skipped={}",
        projectId,
        folderId,
        converted,
        skipped);
    return Map.of("converted", converted, "skipped", skipped);
  }

  // ---------- 내부 ----------

  /** GraphTestCase + StepNode 체인을 멱등하게 재작성한다 (기존 StepNode 삭제 후 재생성). */
  private void writeStepChain(TestCase testCase, List<TestStep> steps) {
    String tcId = testCase.getId();
    String projectId = testCase.getProject().getId();

    // 1) 루트 정점
    graphDbClient.execute(
        "MERGE (g:\"GraphTestCase\" {id: "
            + quote(tcId)
            + "}) SET g.name = "
            + quote(testCase.getName())
            + ", g.\"projectId\" = "
            + quote(projectId));

    // 2) 기존 스텝 서브그래프 제거 (재작성 방식이라 편집 diff 관리가 필요 없다)
    graphDbClient.execute(
        "MATCH (s:\"StepNode\") WHERE s.\"tcId\" = " + quote(tcId) + " DETACH DELETE s");
    graphDbClient.execute(
        "MATCH (p:\"Precondition\") WHERE p.\"tcId\" = " + quote(tcId) + " DETACH DELETE p");

    // 3) 전제조건 + 스텝 체인 재생성
    String previousRef = null; // null 이면 루트(g) 에서 STARTS_AT
    if (testCase.getPreCondition() != null && !testCase.getPreCondition().isBlank()) {
      String preId = tcId + ":pre";
      graphDbClient.execute(
          "MERGE (p:\"Precondition\" {id: "
              + quote(preId)
              + "}) SET p.text = "
              + quote(testCase.getPreCondition())
              + ", p.\"tcId\" = "
              + quote(tcId));
      graphDbClient.execute(
          "MATCH (g:\"GraphTestCase\" {id: "
              + quote(tcId)
              + "}), (p:\"Precondition\" {id: "
              + quote(preId)
              + "}) MERGE (g)-[:\"STARTS_AT\"]->(p)");
      previousRef = preId;
    }

    List<TestStep> ordered = new ArrayList<>(steps);
    ordered.sort(Comparator.comparingInt(TestStep::getStepNumber));
    for (int i = 0; i < ordered.size(); i++) {
      TestStep step = ordered.get(i);
      String stepId = tcId + ":s" + (i + 1);
      graphDbClient.execute(
          "MERGE (s:\"StepNode\" {id: "
              + quote(stepId)
              + "}) SET s.\"order\" = "
              + (i + 1)
              + ", s.action = "
              + quote(step.getDescription())
              + ", s.expected = "
              + quote(step.getExpectedResult())
              + ", s.\"tcId\" = "
              + quote(tcId));
      if (previousRef == null) {
        graphDbClient.execute(
            "MATCH (g:\"GraphTestCase\" {id: "
                + quote(tcId)
                + "}), (s:\"StepNode\" {id: "
                + quote(stepId)
                + "}) MERGE (g)-[:\"STARTS_AT\"]->(s)");
      } else {
        graphDbClient.execute(
            "MATCH (a {id: "
                + quote(previousRef)
                + "}), (s:\"StepNode\" {id: "
                + quote(stepId)
                + "}) WHERE a.\"tcId\" = "
                + quote(tcId)
                + " MERGE (a)-[:\"NEXT\"]->(s)");
      }
      previousRef = stepId;
    }
  }

  private TestCase loadCase(String testCaseId) {
    return testCaseRepository
        .findById(testCaseId)
        .orElseThrow(() -> new IllegalArgumentException("테스트케이스를 찾을 수 없습니다: " + testCaseId));
  }

  private static String asText(Object value) {
    return value != null ? String.valueOf(value) : "";
  }

  /**
   * 임의 텍스트 → Cypher 문자열 리터럴 (인젝션 차단). AgensGraph 는 SQL 렉서(작은따옴표는 '' 로 이중화)를 지나 속성값을 JSON 으로
   * 저장하므로(백슬래시는 \\ 로 이중화해야 유효한 JSON escape), 두 규칙을 모두 적용한다 — PoC 실측으로 확정한 규칙.
   */
  static String quote(String text) {
    String safe = text != null ? text : "";
    return "'" + safe.replace("\\", "\\\\").replace("'", "''") + "'";
  }
}
