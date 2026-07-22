package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.graph.GraphResponseDto;
import com.testcase.testcasemanagement.service.graph.GraphQueryService;
import com.testcase.testcasemanagement.service.graph.GraphSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 온톨로지 인스턴스 그래프 조회 API — 프로젝트 데이터를 코어 온톨로지(노드 11종·간선 15종)로 프로젝션한 관계망을 Cytoscape 용 {nodes, edges} 로
 * 반환한다.
 *
 * <p>features.graph.enabled=true 일 때만 활성화. SecurityConfig 의 /api/** 인증 규칙 + 프로젝트
 * 멤버십(@projectSecurityService) 이중 검증.
 *
 * <p>계획: docs/graph-db/AGENSGRAPH_TESTCASE_GRAPH_PLAN.md §8-C
 */
@RestController
@RequestMapping("/api/graph")
@ConditionalOnProperty(prefix = "features.graph", name = "enabled", havingValue = "true")
@Tag(name = "Graph", description = "온톨로지 인스턴스 그래프 조회 API (AgensGraph)")
public class GraphController {

  private final GraphQueryService graphQueryService;
  private final GraphSyncService graphSyncService;

  public GraphController(GraphQueryService graphQueryService, GraphSyncService graphSyncService) {
    this.graphQueryService = graphQueryService;
    this.graphSyncService = graphSyncService;
  }

  @Operation(summary = "그래프 DB 상태", description = "AgensGraph 연결 가능 여부를 반환한다.")
  @GetMapping("/status")
  public ResponseEntity<Map<String, Object>> status() {
    return ResponseEntity.ok(Map.of("enabled", true, "available", graphQueryService.isAvailable()));
  }

  @Operation(
      summary = "프로젝트 온톨로지 그래프",
      description = "프로젝트 데이터를 온톨로지 타입(노드)·관계(간선) 인스턴스 그래프로 반환한다.")
  @GetMapping("/project/{projectId}/structure")
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
  public ResponseEntity<GraphResponseDto> projectStructure(@PathVariable String projectId) {
    return ResponseEntity.ok(graphQueryService.getProjectStructure(projectId));
  }

  @Operation(summary = "온톨로지 그래프 동기화", description = "프로젝트 데이터를 코어 온톨로지 인스턴스 그래프로 풀 동기화한다 (멱등).")
  @PostMapping("/sync")
  @PreAuthorize("@projectSecurityService.hasManagementRole(#projectId, authentication.name)")
  public ResponseEntity<Map<String, Integer>> sync(@RequestParam String projectId) {
    if (!graphQueryService.isAvailable()) {
      // 그래프 DB 미연결 — 500 대신 503 으로 명확히 (관리자 조치 안내)
      return ResponseEntity.status(503).build();
    }
    return ResponseEntity.ok(graphSyncService.syncProject(projectId));
  }

  @Operation(summary = "인스턴스 이웃 그래프", description = "지정 인스턴스에서 depth 단계까지 연결된 정점·간선.")
  @GetMapping("/instance/{instanceId}/neighborhood")
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
  public ResponseEntity<GraphResponseDto> neighborhood(
      @PathVariable String instanceId,
      @RequestParam String projectId,
      @RequestParam(defaultValue = "1") int depth) {
    // projectId 는 권한 검증 + 그래프 스코프 양쪽에 쓰인다 — 타 프로젝트 id 를 넣어도 결과가 비어 있다
    return ResponseEntity.ok(graphQueryService.getNeighborhood(projectId, instanceId, depth));
  }
}
