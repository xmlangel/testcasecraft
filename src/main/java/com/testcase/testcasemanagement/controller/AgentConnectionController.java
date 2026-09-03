package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.AgentConnectionDto;
import com.testcase.testcasemanagement.service.AgentConnectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * 프로젝트별 에이전트 연동 설정 API.
 *
 * <p>전역 킬스위치가 꺼져 있으면 모든 경로가 404 를 준다. 셀프호스팅에서 이 기능을 아예 못 켜게 하려면 그 방식이 필요하다. RAG 의 {@code
 * VITE_ENABLE_RAG} 대응이다.
 */
@Slf4j
@RestController
@RequestMapping("/api/projects/{projectId}/agent-connection")
@RequiredArgsConstructor
@Tag(name = "에이전트 연동", description = "프로젝트별 외부 QA 에이전트 연동 설정")
public class AgentConnectionController {

  private final AgentConnectionService service;

  @GetMapping
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId)")
  @Operation(summary = "연동 설정 조회", description = "미설정이면 404. 토큰 값은 돌려주지 않습니다.")
  public ResponseEntity<AgentConnectionDto> get(
      @Parameter(description = "프로젝트 ID") @PathVariable String projectId) {
    requireEnabled();
    return service
        .get(projectId)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  @GetMapping("/runnable")
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId)")
  @Operation(summary = "실행 가능 여부", description = "자동화 화면이 버튼을 띄울지 판단할 때 씁니다.")
  public ResponseEntity<Map<String, Object>> runnable(@PathVariable String projectId) {
    // 킬스위치가 꺼져 있어도 이 경로는 200 을 주고 false 를 돌린다. 화면이 404 를
    // 오류로 다루지 않고 조용히 버튼을 숨기게 하는 것이 낫다
    if (!service.isIntegrationEnabled()) {
      return ResponseEntity.ok(Map.of("enabled", false, "runnable", false));
    }
    boolean runnable = service.isRunnable(projectId);
    return ResponseEntity.ok(
        Map.of(
            "enabled",
            true,
            "runnable",
            runnable,
            "name",
            service.get(projectId).map(AgentConnectionDto::getName).orElse("")));
  }

  @PutMapping
  @PreAuthorize("@projectSecurityService.canManageProject(#projectId)")
  @Operation(
      summary = "연동 설정 저장",
      description = "token 을 생략하면 기존 값을 유지하고, 빈 문자열이면 삭제합니다.")
  public ResponseEntity<AgentConnectionDto> save(
      @PathVariable String projectId,
      @Valid @RequestBody AgentConnectionDto dto,
      Authentication authentication) {
    requireEnabled();
    try {
      return ResponseEntity.ok(service.save(projectId, dto, authentication.getName()));
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
    }
  }

  @PostMapping("/test")
  @PreAuthorize("@projectSecurityService.canManageProject(#projectId)")
  @Operation(
      summary = "연결 테스트",
      description = "에이전트의 /health 만 GET 으로 확인하고 status·version 두 필드만 돌려줍니다.")
  public ResponseEntity<AgentConnectionDto.ConnectionTestResult> test(
      @PathVariable String projectId, Authentication authentication) {
    requireEnabled();
    try {
      return ResponseEntity.ok(service.test(projectId, authentication.getName()));
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
    }
  }

  @DeleteMapping
  @PreAuthorize("@projectSecurityService.canManageProject(#projectId)")
  @Operation(summary = "연동 설정 삭제")
  public ResponseEntity<Void> delete(
      @PathVariable String projectId, Authentication authentication) {
    requireEnabled();
    return service.delete(projectId, authentication.getName())
        ? ResponseEntity.noContent().build()
        : ResponseEntity.notFound().build();
  }

  /** 전역 킬스위치. 꺼져 있으면 기능이 존재하지 않는 것처럼 보인다. */
  private void requireEnabled() {
    if (!service.isIntegrationEnabled()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "에이전트 연동이 활성화되지 않았습니다");
    }
  }
}
