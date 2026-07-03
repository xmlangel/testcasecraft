package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.graph.GraphResponseDto;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.service.graph.GraphQueryService;
import com.testcase.testcasemanagement.service.graph.GraphSyncService;
import com.testcase.testcasemanagement.service.graph.TestCaseGraphService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
  private final TestCaseGraphService testCaseGraphService;
  private final GraphSyncService graphSyncService;
  private final TestCaseRepository testCaseRepository;

  public GraphController(
      GraphQueryService graphQueryService,
      TestCaseGraphService testCaseGraphService,
      GraphSyncService graphSyncService,
      TestCaseRepository testCaseRepository) {
    this.graphQueryService = graphQueryService;
    this.testCaseGraphService = testCaseGraphService;
    this.graphSyncService = graphSyncService;
    this.testCaseRepository = testCaseRepository;
  }

  /**
   * 케이스가 요청 프로젝트 소속인지 확인 — @PreAuthorize 는 projectId 만 검증하므로, 다른 프로젝트의 testCaseId 로 접근/전환하는 경로를 여기서
   * 차단한다 (코드리뷰 CRITICAL 대응).
   */
  private String requireInProject(String testCaseId, String projectId) {
    var testCase =
        testCaseRepository
            .findById(testCaseId)
            .orElseThrow(() -> new IllegalArgumentException("테스트케이스를 찾을 수 없습니다: " + testCaseId));
    if (!testCase.getProject().getId().equals(projectId)) {
      throw new IllegalArgumentException("해당 프로젝트 소속 테스트케이스가 아닙니다: " + testCaseId);
    }
    return testCaseId;
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

  @Operation(
      summary = "기본 → 그래프 전환",
      description = "선형 스텝을 StepNode 체인으로 그래프에 적재한다 (비파괴적, 시나리오 C).")
  @PostMapping("/testcase/{testCaseId}/convert")
  @PreAuthorize("@projectSecurityService.hasEditRole(#projectId, authentication.name)")
  public ResponseEntity<Map<String, Object>> convertToGraph(
      @PathVariable String testCaseId, @RequestParam String projectId) {
    var converted = testCaseGraphService.convertToGraph(requireInProject(testCaseId, projectId));
    return ResponseEntity.ok(
        Map.of(
            "id", converted.getId(),
            "representationMode", converted.getRepresentationMode(),
            "graphSyncedAt", String.valueOf(converted.getGraphSyncedAt())));
  }

  @Operation(summary = "그래프 → 기본 역전환", description = "관계형 미러를 SSOT 로 승격한다.")
  @PostMapping("/testcase/{testCaseId}/revert")
  @PreAuthorize("@projectSecurityService.hasEditRole(#projectId, authentication.name)")
  public ResponseEntity<Map<String, Object>> revertToBasic(
      @PathVariable String testCaseId, @RequestParam String projectId) {
    var reverted = testCaseGraphService.revertToBasic(requireInProject(testCaseId, projectId));
    return ResponseEntity.ok(
        Map.of("id", reverted.getId(), "representationMode", reverted.getRepresentationMode()));
  }

  @Operation(summary = "그래프 TC 스텝 조회", description = "편집기 로딩용 — GraphTestCase 루트와 StepNode 체인.")
  @GetMapping("/testcase/{testCaseId}/steps")
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
  public ResponseEntity<GraphResponseDto> graphSteps(
      @PathVariable String testCaseId, @RequestParam String projectId) {
    return ResponseEntity.ok(
        testCaseGraphService.getGraphSteps(requireInProject(testCaseId, projectId)));
  }

  @Operation(summary = "그래프 TC 스텝 편집", description = "서브그래프를 재작성하고 관계형 미러를 즉시 재생성한다.")
  @PutMapping("/testcase/{testCaseId}/steps")
  @PreAuthorize("@projectSecurityService.hasEditRole(#projectId, authentication.name)")
  public ResponseEntity<Map<String, Object>> updateGraphSteps(
      @PathVariable String testCaseId,
      @RequestParam String projectId,
      @RequestBody List<Map<String, Object>> steps) {
    var updated =
        testCaseGraphService.updateGraphSteps(requireInProject(testCaseId, projectId), steps);
    return ResponseEntity.ok(
        Map.of(
            "id", updated.getId(),
            "steps", updated.getSteps() != null ? updated.getSteps().size() : 0,
            "graphSyncedAt", String.valueOf(updated.getGraphSyncedAt())));
  }

  @Operation(
      summary = "관계 그래프 동기화",
      description = "프로젝트의 케이스·계획·실행·결과·JUnit 실패를 그래프로 풀 동기화한다 (멱등).")
  @PostMapping("/sync")
  @PreAuthorize("@projectSecurityService.hasManagementRole(#projectId, authentication.name)")
  public ResponseEntity<Map<String, Integer>> sync(@RequestParam String projectId) {
    return ResponseEntity.ok(graphSyncService.syncProject(projectId));
  }

  @Operation(summary = "일괄 그래프 전환", description = "폴더(하위 전체) 또는 프로젝트 전체의 기본 케이스를 그래프 모드로 전환한다.")
  @PostMapping("/testcase/bulk-convert")
  @PreAuthorize("@projectSecurityService.hasEditRole(#projectId, authentication.name)")
  public ResponseEntity<Map<String, Integer>> bulkConvert(
      @RequestParam String projectId, @RequestParam(required = false) String folderId) {
    return ResponseEntity.ok(testCaseGraphService.bulkConvert(projectId, folderId));
  }

  @Operation(summary = "케이스 이웃 그래프", description = "지정 케이스에서 depth 단계까지 연결된 정점·간선.")
  @GetMapping("/testcase/{testCaseId}/neighborhood")
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
  public ResponseEntity<GraphResponseDto> neighborhood(
      @PathVariable String testCaseId,
      @RequestParam String projectId,
      @RequestParam(defaultValue = "1") int depth) {
    // projectId 는 권한 검증 + 그래프 스코프 양쪽에 쓰인다 — 타 프로젝트 케이스 id 를 넣어도 결과가 비어 있다
    return ResponseEntity.ok(graphQueryService.getNeighborhood(projectId, testCaseId, depth));
  }
}
