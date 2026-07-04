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

  /** 사용자 수동 관계 타입 화이트리스트 — Cypher 라벨로 인라인되므로 이 집합 밖은 거부한다. */
  private static final java.util.Set<String> MANUAL_RELATION_TYPES =
      java.util.Set.of("DEPENDS_ON", "RELATES_TO", "BLOCKS");

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
    writeStepChain(testCase, steps, java.util.Collections.nCopies(steps.size(), List.of()));

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
    List<List<Map<String, Object>>> branchesPerStep = new ArrayList<>();
    boolean hasBranches = false;
    for (int i = 0; i < stepPayload.size(); i++) {
      Map<String, Object> raw = stepPayload.get(i);
      TestStep step = new TestStep();
      step.setStepNumber(i + 1);
      step.setDescription(asText(raw.get("description")));
      step.setExpectedResult(asText(raw.get("expectedResult")));
      steps.add(step);

      List<Map<String, Object>> branches = extractBranches(raw, stepPayload.size(), i + 1);
      branchesPerStep.add(branches);
      if (!branches.isEmpty()) {
        hasBranches = true;
      }
    }

    writeStepChain(testCase, steps, branchesPerStep);

    // 관계형 미러 즉시 재생성 (역투영). 분기가 있으면 대표 경로(각 분기의 첫 갈래)를 선형화하고
    // HYBRID 모드로 표시한다 — 전체 분기 구조는 그래프 뷰에서만 보인다 (계획 §5-B).
    testCase.setSteps(hasBranches ? linearizeMainPath(steps, branchesPerStep) : steps);
    testCase.setRepresentationMode(hasBranches ? TestCase.MODE_HYBRID : TestCase.MODE_GRAPH);
    testCase.setGraphSyncedAt(LocalDateTime.now());
    return testCaseRepository.save(testCase);
  }

  /** payload 의 branches: [{label, to}] — to 는 1-based 스텝 번호. 범위·형식 검증. */
  @SuppressWarnings("unchecked")
  private static List<Map<String, Object>> extractBranches(
      Map<String, Object> raw, int stepCount, int selfNumber) {
    Object value = raw.get("branches");
    if (!(value instanceof List<?> list) || list.isEmpty()) {
      return List.of();
    }
    List<Map<String, Object>> branches = new ArrayList<>();
    for (Object item : list) {
      if (!(item instanceof Map<?, ?> m)) {
        throw new IllegalArgumentException("branches 항목 형식이 잘못되었습니다");
      }
      int to;
      try {
        to = Integer.parseInt(String.valueOf(m.get("to")));
      } catch (NumberFormatException e) {
        throw new IllegalArgumentException("branches.to 는 스텝 번호(정수)여야 합니다");
      }
      if (to < 1 || to > stepCount) {
        throw new IllegalArgumentException("branches.to 가 스텝 범위를 벗어났습니다: " + to);
      }
      String label = asText(m.get("label"));
      branches.add(Map.of("label", label.isBlank() ? "분기" : label, "to", to));
    }
    return branches;
  }

  /** 대표 경로 선형화 — 각 Decision 에서 첫 번째 갈래를 따라가며 방문 순서대로 미러 스텝을 만든다 (사이클은 방문 집합으로 중단). */
  private static List<TestStep> linearizeMainPath(
      List<TestStep> steps, List<List<Map<String, Object>>> branchesPerStep) {
    List<TestStep> mirror = new ArrayList<>();
    java.util.Set<Integer> visited = new java.util.HashSet<>();
    int current = 1;
    while (current >= 1 && current <= steps.size() && visited.add(current)) {
      TestStep source = steps.get(current - 1);
      TestStep copy = new TestStep();
      copy.setStepNumber(mirror.size() + 1);
      copy.setDescription(source.getDescription());
      copy.setExpectedResult(source.getExpectedResult());
      mirror.add(copy);
      List<Map<String, Object>> branches = branchesPerStep.get(current - 1);
      current = branches.isEmpty() ? current + 1 : (Integer) branches.get(0).get("to");
    }
    return mirror;
  }

  /** 그래프 스텝 서브그래프 조회 — 편집기 로딩용. */
  @Transactional(readOnly = true)
  public GraphResponseDto getGraphSteps(String testCaseId) {
    GraphQueryService.validateId(testCaseId);
    GraphResponseDto response = new GraphResponseDto();
    // 루트(id=tcId) + 스텝/분기(tcId 속성) 서브그래프 전체 — NEXT 는 물론 Decision 의 BRANCH_ON 도 포함
    String scope =
        "(a.id = "
            + quote(testCaseId)
            + " OR a.\"tcId\" = "
            + quote(testCaseId)
            + ")"
            + " AND (b.id = "
            + quote(testCaseId)
            + " OR b.\"tcId\" = "
            + quote(testCaseId)
            + ")";
    String cypher =
        "MATCH (a)-[e]->(b) WHERE " + scope + " RETURN a, e, b LIMIT " + (MAX_STEPS * 3);
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

  /**
   * 케이스 간 수동 관계 생성 (그래프 뷰 편집). 관계는 그래프 고유 데이터 — 동기화(MERGE 기반)가 덮어쓰지 않는다. 양 케이스가 모두 해당 프로젝트 소속인지
   * 검증한다 (크로스 프로젝트 차단).
   */
  @Transactional(readOnly = true)
  public void createManualRelation(
      String projectId, String sourceCaseId, String targetCaseId, String type) {
    validateManualRelation(projectId, sourceCaseId, targetCaseId, type);
    graphDbClient.execute(
        "MATCH (a:\"TestCase\" {id: "
            + quote(sourceCaseId)
            + "}), (b:\"TestCase\" {id: "
            + quote(targetCaseId)
            + "}) WHERE a.\"projectId\" = "
            + quote(projectId)
            + " AND b.\"projectId\" = "
            + quote(projectId)
            + " MERGE (a)-[r:\""
            + type
            + "\"]->(b) SET r.manual = true");
    logger.info(
        "수동 관계 생성 — {} -[{}]-> {} (project={})", sourceCaseId, type, targetCaseId, projectId);
  }

  /** 케이스 간 수동 관계 삭제. */
  @Transactional(readOnly = true)
  public void deleteManualRelation(
      String projectId, String sourceCaseId, String targetCaseId, String type) {
    validateManualRelation(projectId, sourceCaseId, targetCaseId, type);
    graphDbClient.execute(
        "MATCH (a:\"TestCase\" {id: "
            + quote(sourceCaseId)
            + "})-[r:\""
            + type
            + "\"]->(b:\"TestCase\" {id: "
            + quote(targetCaseId)
            + "}) WHERE a.\"projectId\" = "
            + quote(projectId)
            + " AND b.\"projectId\" = "
            + quote(projectId)
            + " DELETE r");
    logger.info(
        "수동 관계 삭제 — {} -[{}]-> {} (project={})", sourceCaseId, type, targetCaseId, projectId);
  }

  private void validateManualRelation(
      String projectId, String sourceCaseId, String targetCaseId, String type) {
    GraphQueryService.validateId(projectId);
    GraphQueryService.validateId(sourceCaseId);
    GraphQueryService.validateId(targetCaseId);
    if (!MANUAL_RELATION_TYPES.contains(type)) {
      throw new IllegalArgumentException("허용되지 않은 관계 타입입니다: " + type);
    }
    if (sourceCaseId.equals(targetCaseId)) {
      throw new IllegalArgumentException("같은 케이스끼리는 관계를 만들 수 없습니다");
    }
    // 양쪽 케이스의 프로젝트 소속을 관계형 DB 기준으로도 확인 (그래프가 비어 있어도 안전)
    for (String caseId : List.of(sourceCaseId, targetCaseId)) {
      TestCase testCase = loadCase(caseId);
      if (!testCase.getProject().getId().equals(projectId)) {
        throw new IllegalArgumentException("해당 프로젝트 소속 테스트케이스가 아닙니다: " + caseId);
      }
    }
  }

  // ---------- 내부 ----------

  /**
   * GraphTestCase + StepNode 체인을 멱등하게 재작성한다 (기존 서브그래프 삭제 후 재생성). 스텝에 분기가 있으면 StepNode 뒤에 Decision
   * 정점을 만들고 각 갈래를 BRANCH_ON(label) 으로 대상 스텝에 연결한다. 분기가 있는 스텝은 다음 스텝으로의 암묵적 NEXT 를 만들지 않는다 — 진행 경로는
   * 전적으로 갈래가 정의한다.
   */
  private void writeStepChain(
      TestCase testCase, List<TestStep> steps, List<List<Map<String, Object>>> branchesPerStep) {
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
    graphDbClient.execute(
        "MATCH (d:\"Decision\") WHERE d.\"tcId\" = " + quote(tcId) + " DETACH DELETE d");

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

    // 스텝 정점을 먼저 전부 만든다 — 분기(BRANCH_ON)가 뒤 번호 스텝을 가리킬 수 있어서다
    List<TestStep> ordered = new ArrayList<>(steps);
    ordered.sort(Comparator.comparingInt(TestStep::getStepNumber));
    for (int i = 0; i < ordered.size(); i++) {
      TestStep step = ordered.get(i);
      graphDbClient.execute(
          "MERGE (s:\"StepNode\" {id: "
              + quote(tcId + ":s" + (i + 1))
              + "}) SET s.\"order\" = "
              + (i + 1)
              + ", s.action = "
              + quote(step.getDescription())
              + ", s.expected = "
              + quote(step.getExpectedResult())
              + ", s.\"tcId\" = "
              + quote(tcId));
    }

    // 흐름 간선: 이전 노드 → 현재 스텝, 분기가 있으면 스텝 → Decision → (BRANCH_ON) 대상 스텝
    boolean previousHadBranches = false;
    for (int i = 0; i < ordered.size(); i++) {
      String stepId = tcId + ":s" + (i + 1);
      if (previousRef == null) {
        graphDbClient.execute(
            "MATCH (g:\"GraphTestCase\" {id: "
                + quote(tcId)
                + "}), (s:\"StepNode\" {id: "
                + quote(stepId)
                + "}) MERGE (g)-[:\"STARTS_AT\"]->(s)");
      } else if (!previousHadBranches) {
        graphDbClient.execute(
            "MATCH (a {id: "
                + quote(previousRef)
                + "}), (s:\"StepNode\" {id: "
                + quote(stepId)
                + "}) WHERE a.\"tcId\" = "
                + quote(tcId)
                + " MERGE (a)-[:\"NEXT\"]->(s)");
      }

      List<Map<String, Object>> branches =
          i < branchesPerStep.size() ? branchesPerStep.get(i) : List.of();
      if (!branches.isEmpty()) {
        String decisionId = tcId + ":d" + (i + 1);
        graphDbClient.execute(
            "MERGE (d:\"Decision\" {id: "
                + quote(decisionId)
                + "}) SET d.\"order\" = "
                + (i + 1)
                + ", d.\"tcId\" = "
                + quote(tcId));
        graphDbClient.execute(
            "MATCH (s:\"StepNode\" {id: "
                + quote(stepId)
                + "}), (d:\"Decision\" {id: "
                + quote(decisionId)
                + "}) MERGE (s)-[:\"NEXT\"]->(d)");
        for (Map<String, Object> branch : branches) {
          String targetId = tcId + ":s" + branch.get("to");
          graphDbClient.execute(
              "MATCH (d:\"Decision\" {id: "
                  + quote(decisionId)
                  + "}), (t:\"StepNode\" {id: "
                  + quote(targetId)
                  + "}) MERGE (d)-[r:\"BRANCH_ON\"]->(t) SET r.label = "
                  + quote(String.valueOf(branch.get("label"))));
        }
        previousRef = decisionId;
        previousHadBranches = true;
      } else {
        previousRef = stepId;
        previousHadBranches = false;
      }
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
