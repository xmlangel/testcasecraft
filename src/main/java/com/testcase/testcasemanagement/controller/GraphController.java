package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.graph.GraphResponseDto;
import com.testcase.testcasemanagement.service.graph.GraphQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 그래프 조회 API — 테스트 케이스·실행·결과·오류의 관계 그래프를 Cytoscape 용 {nodes, edges} 로 반환한다.
 *
 * <p>features.graph.enabled=true 일 때만 활성화. SecurityConfig 의 /api/** 인증 규칙 + 프로젝트 멤버십
 * (@projectSecurityService) 이중 검증.
 *
 * <p>계획: docs/graph-db/AGENSGRAPH_TESTCASE_GRAPH_PLAN.md §8-C
 */
@RestController
@RequestMapping("/api/graph")
@ConditionalOnProperty(prefix = "features.graph", name = "enabled", havingValue = "true")
@Tag(name = "Graph", description = "테스트케이스·오류 그래프 조회 API (AgensGraph)")
public class GraphController {

  private final GraphQueryService graphQueryService;

  public GraphController(GraphQueryService graphQueryService) {
    this.graphQueryService = graphQueryService;
  }

  @Operation(summary = "그래프 DB 상태", description = "AgensGraph 연결 가능 여부를 반환한다.")
  @GetMapping("/status")
  public ResponseEntity<Map<String, Object>> status() {
    return ResponseEntity.ok(Map.of("enabled", true, "available", graphQueryService.isAvailable()));
  }

  @Operation(summary = "프로젝트 구조 그래프", description = "프로젝트 내 폴더·케이스·계획·실행·결과의 관계망.")
  @GetMapping("/project/{projectId}/structure")
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
  public ResponseEntity<GraphResponseDto> projectStructure(@PathVariable String projectId) {
    return ResponseEntity.ok(graphQueryService.getProjectStructure(projectId));
  }

  @Operation(summary = "오류 클러스터 그래프", description = "FailureType 허브 중심으로 실패 결과와 케이스가 어떻게 묶이는지 반환.")
  @GetMapping("/failures")
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
  public ResponseEntity<GraphResponseDto> failureClusters(@RequestParam String projectId) {
    return ResponseEntity.ok(graphQueryService.getFailureClusters(projectId));
  }

  @Operation(summary = "케이스 이웃 그래프", description = "지정 케이스에서 depth 단계까지 연결된 정점·간선.")
  @GetMapping("/testcase/{testCaseId}/neighborhood")
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
  public ResponseEntity<GraphResponseDto> neighborhood(
      @PathVariable String testCaseId,
      @RequestParam String projectId,
      @RequestParam(defaultValue = "1") int depth) {
    return ResponseEntity.ok(graphQueryService.getNeighborhood(testCaseId, depth));
  }
}
