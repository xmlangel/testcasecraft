package com.testcase.testcasemanagement.service.graph;

import com.testcase.testcasemanagement.dto.graph.GraphEdgeDto;
import com.testcase.testcasemanagement.dto.graph.GraphNodeDto;
import com.testcase.testcasemanagement.dto.graph.GraphResponseDto;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * 그래프 조회 서비스 — Cypher 를 실행해 {nodes, edges} 응답을 만든다.
 *
 * <p>Cypher 인젝션 방지: AgensGraph SQL 문맥의 Cypher 는 PreparedStatement 파라미터 바인딩이 제한적이라, 모든 입력값을 {@link
 * #validateId(String)} 화이트리스트(UUID/영숫자)로 검증한 뒤 리터럴로 넣는다. 검증을 통과하지 못하면 즉시 예외.
 */
@Service
@ConditionalOnProperty(prefix = "features.graph", name = "enabled", havingValue = "true")
public class GraphQueryService {

  private static final int STRUCTURE_LIMIT = 2000;
  private static final int NEIGHBOR_LIMIT_PER_STEP = 300;
  private static final int MAX_DEPTH = 3;

  private final GraphDbClient graphDbClient;

  public GraphQueryService(GraphDbClient graphDbClient) {
    this.graphDbClient = graphDbClient;
  }

  /** 프로젝트 구조 그래프 — projectId 속성을 가진 정점들 사이의 모든 간선. */
  public GraphResponseDto getProjectStructure(String projectId) {
    validateId(projectId);
    GraphResponseDto response = new GraphResponseDto();
    if (!graphDbClient.isAvailable()) {
      return response; // 그래프 DB 미연결 — 빈 결과로 우아하게 degrade (500 방지)
    }
    String cypher =
        "MATCH (a)-[e]->(b)"
            + " WHERE a.\"projectId\" = '"
            + projectId
            + "' AND b.\"projectId\" = '"
            + projectId
            + "' RETURN a, e, b LIMIT "
            + STRUCTURE_LIMIT;
    collectTriples(cypher, response);
    return response;
  }

  /**
   * 케이스 이웃 그래프 — 도메인 id 를 가진 정점에서 depth 단계까지 확장. 가변 길이 경로(-[*1..n]-)는 경로 파싱이 복잡해 frontier 확장 방식으로
   * 구현한다 (visited 집합으로 중복 방문 차단).
   *
   * <p>모든 hop 을 projectId 로 스코프한다 — 컨트롤러의 @PreAuthorize 는 projectId 만 검증하므로, 여기서 걸지 않으면 다른 프로젝트의
   * testCaseId 를 넣어 타 프로젝트 데이터를 읽을 수 있다 (코드리뷰 CRITICAL 대응).
   */
  public GraphResponseDto getNeighborhood(String projectId, String domainId, int depth) {
    validateId(projectId);
    validateId(domainId);
    int clampedDepth = Math.max(1, Math.min(depth, MAX_DEPTH));

    GraphResponseDto response = new GraphResponseDto();
    if (!graphDbClient.isAvailable()) {
      return response; // 그래프 DB 미연결 — 빈 결과로 degrade
    }
    Set<String> visited = new HashSet<>();
    Deque<String> frontier = new ArrayDeque<>();
    frontier.add(domainId);

    for (int step = 0; step < clampedDepth; step++) {
      Deque<String> nextFrontier = new ArrayDeque<>();
      while (!frontier.isEmpty()) {
        String currentId = frontier.poll();
        if (!visited.add(currentId)) {
          continue;
        }
        String cypher =
            "MATCH (a {id: '"
                + currentId
                + "'})-[e]-(b)"
                + " WHERE a.\"projectId\" = '"
                + projectId
                + "' AND b.\"projectId\" = '"
                + projectId
                + "' RETURN a, e, b LIMIT "
                + NEIGHBOR_LIMIT_PER_STEP;
        List<String[]> rows = queryTriples(cypher);
        for (String[] row : rows) {
          GraphNodeDto a = AgResultParser.parseVertex(row[0]);
          GraphEdgeDto e = AgResultParser.parseEdge(row[1]);
          GraphNodeDto b = AgResultParser.parseVertex(row[2]);
          response.addNode(a);
          response.addNode(b);
          response.addEdge(e);
          if (b != null && b.getProperties().get("id") instanceof String nextId) {
            if (!visited.contains(nextId) && isValidId(nextId)) {
              nextFrontier.add(nextId);
            }
          }
        }
      }
      frontier = nextFrontier;
    }
    return response;
  }

  /** 그래프 DB 연결 상태. */
  public boolean isAvailable() {
    return graphDbClient.isAvailable();
  }

  // ---------- 내부 ----------

  /** (a, e, b) 3컬럼 결과를 응답에 누적. */
  private void collectTriples(String cypher, GraphResponseDto response) {
    for (String[] row : queryTriples(cypher)) {
      response.addNode(AgResultParser.parseVertex(row[0]));
      response.addEdge(AgResultParser.parseEdge(row[1]));
      response.addNode(AgResultParser.parseVertex(row[2]));
    }
  }

  private List<String[]> queryTriples(String cypher) {
    return graphDbClient.query(
        cypher, (rs, rowNum) -> new String[] {rs.getString(1), rs.getString(2), rs.getString(3)});
  }

  /** UUID/영숫자/하이픈 36자 이내만 허용 — Cypher 리터럴 인젝션 방지의 단일 관문. */
  static void validateId(String id) {
    if (!isValidId(id)) {
      throw new IllegalArgumentException("잘못된 그래프 조회 식별자입니다: " + id);
    }
  }

  static boolean isValidId(String id) {
    return id != null && id.matches("[A-Za-z0-9\\-]{1,64}");
  }
}
