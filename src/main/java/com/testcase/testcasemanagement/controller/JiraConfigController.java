// src/main/java/com/testcase/testcasemanagement/controller/JiraConfigController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.config.JiraConfig;
import com.testcase.testcasemanagement.dto.JiraConfigDto;
import com.testcase.testcasemanagement.service.JiraConfigService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jira")
@RequiredArgsConstructor
@Validated
@Slf4j
@Tag(name = "JIRA - Configuration", description = "JIRA 연동 설정 관리 API")
@SecurityRequirement(name = "Bearer Authentication")
public class JiraConfigController {

  private final JiraConfigService jiraConfigService;
  private final SecurityContextUtil securityContextUtil;
  private final JiraConfig.JiraProperties jiraProperties;

  @Operation(
      summary = "현재 사용자의 JIRA 서버 URL 조회",
      description = "현재 로그인한 사용자의 JIRA 설정에서 서버 URL을 조회합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "조회 성공"),
    @ApiResponse(responseCode = "404", description = "JIRA 설정이 없음 또는 URL 미설정"),
    @ApiResponse(responseCode = "401", description = "인증 필요")
  })
  @GetMapping("/server-url")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Map<String, String>> getJiraServerUrl() {
    try {
      String userId = securityContextUtil.getCurrentUserId();
      if (userId == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(
                Map.of(
                    "error", "UNAUTHORIZED",
                    "message", "인증이 필요합니다."));
      }

      Optional<JiraConfigDto> jiraConfig = jiraConfigService.getActiveConfigByUserId(userId);

      if (jiraConfig.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(
                Map.of(
                    "error", "JIRA_CONFIG_NOT_FOUND",
                    "message", "JIRA 설정이 없습니다. JIRA 설정을 먼저 등록해주세요."));
      }

      String serverUrl = jiraConfig.get().getServerUrl();
      if (serverUrl == null || serverUrl.trim().isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(
                Map.of(
                    "error", "JIRA_URL_NOT_CONFIGURED",
                    "message", "JIRA 서버 URL이 설정되지 않았습니다. JIRA 설정을 확인해주세요."));
      }

      return ResponseEntity.ok(Map.of("serverUrl", serverUrl));
    } catch (Exception e) {
      log.error("JIRA 서버 URL 조회 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(
              Map.of(
                  "error", "INTERNAL_SERVER_ERROR",
                  "message", "JIRA 서버 URL 조회 중 오류가 발생했습니다."));
    }
  }

  @Operation(summary = "사용자의 활성화된 JIRA 설정 조회", description = "현재 사용자의 활성화된 JIRA 설정을 조회합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "조회 성공"),
    @ApiResponse(responseCode = "404", description = "설정을 찾을 수 없음"),
    @ApiResponse(responseCode = "401", description = "인증 필요")
  })
  @GetMapping("/config")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<JiraConfigDto> getActiveConfig() {
    try {
      String userId = securityContextUtil.getCurrentUserId();
      Optional<JiraConfigDto> config = jiraConfigService.getActiveConfigByUserId(userId);

      if (config.isPresent()) {
        log.info("JIRA 설정 조회 성공: userId={}", userId);
        return ResponseEntity.ok(config.get());
      } else {
        log.info("활성화된 JIRA 설정 없음: userId={}", userId);
        return ResponseEntity.notFound().build();
      }

    } catch (Exception e) {
      log.error("JIRA 설정 조회 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @Operation(summary = "사용자의 모든 JIRA 설정 조회", description = "현재 사용자의 모든 JIRA 설정을 조회합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "조회 성공"),
    @ApiResponse(responseCode = "401", description = "인증 필요")
  })
  @GetMapping("/configs")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<List<JiraConfigDto>> getAllConfigs() {
    try {
      String userId = securityContextUtil.getCurrentUserId();
      List<JiraConfigDto> configs = jiraConfigService.getAllConfigsByUserId(userId);

      log.info("JIRA 설정 목록 조회 성공: userId={}, count={}", userId, configs.size());
      return ResponseEntity.ok(configs);

    } catch (Exception e) {
      log.error("JIRA 설정 목록 조회 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @Operation(summary = "JIRA 설정 저장", description = "새로운 JIRA 설정을 저장하거나 기존 설정을 업데이트합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "저장 성공"),
    @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
    @ApiResponse(responseCode = "401", description = "인증 필요")
  })
  @PostMapping("/config")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<?> saveConfig(
      @Parameter(description = "JIRA 설정 정보", required = true) @Valid @RequestBody
          JiraConfigDto configDto) {

    try {
      String userId = securityContextUtil.getCurrentUserId();
      log.info("🎯 JIRA 설정 저장 요청: userId={}", userId);

      // 필수 필드 검증
      if (configDto.getServerUrl() == null || configDto.getServerUrl().trim().isEmpty()) {
        log.warn("❌ 서버 URL 누락: userId={}", userId);
        return ResponseEntity.badRequest().body(Map.of("error", "JIRA 서버 URL이 필요합니다"));
      }
      if (configDto.getUsername() == null || configDto.getUsername().trim().isEmpty()) {
        log.warn("❌ 사용자명 누락: userId={}", userId);
        return ResponseEntity.badRequest().body(Map.of("error", "사용자명이 필요합니다"));
      }
      if (configDto.getApiToken() == null || configDto.getApiToken().trim().isEmpty()) {
        log.warn("❌ API 토큰 누락: userId={}", userId);
        return ResponseEntity.badRequest().body(Map.of("error", "API 토큰이 필요합니다"));
      }

      log.debug(
          "✅ 입력 검증 통과: serverUrl={}, username={}",
          configDto.getServerUrl(),
          configDto.getUsername());

      JiraConfigDto savedConfig = jiraConfigService.saveOrUpdateConfig(userId, configDto);

      // 설정 저장 후 자동으로 연결 테스트 수행
      try {
        log.info("🔄 설정 저장 후 자동 연결 테스트 시작: configId={}", savedConfig.getId());
        JiraConfigDto.TestConnectionDto testRequest = new JiraConfigDto.TestConnectionDto();
        testRequest.setServerUrl(configDto.getServerUrl());
        testRequest.setUsername(configDto.getUsername());
        testRequest.setApiToken(configDto.getApiToken());

        // 연결 테스트 실행 (결과는 DB에 자동 저장됨)
        jiraConfigService.testAndUpdateConnection(userId, testRequest);
        log.info("✅ 자동 연결 테스트 완료: configId={}", savedConfig.getId());

        // 업데이트된 설정 정보 다시 조회
        Optional<JiraConfigDto> updatedConfig = jiraConfigService.getActiveConfigByUserId(userId);
        if (updatedConfig.isPresent()) {
          savedConfig = updatedConfig.get();
          log.debug(
              "📊 연결 테스트 결과가 반영된 설정 반환: connectionVerified={}",
              savedConfig.getConnectionVerified());
        }

      } catch (Exception e) {
        log.warn("⚠️ 자동 연결 테스트 실패 (설정 저장은 성공): {}", e.getMessage());
        // 연결 테스트 실패해도 설정 저장은 성공으로 처리
      }

      log.info("✅ JIRA 설정 저장 성공: userId={}, configId={}", userId, savedConfig.getId());
      return ResponseEntity.ok(savedConfig);

    } catch (IllegalArgumentException e) {
      log.error("❌ JIRA 설정 저장 실패 - 잘못된 입력: {}", e.getMessage());
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));

    } catch (RuntimeException e) {
      log.error("❌ JIRA 설정 저장 실패 - 런타임 오류: {}", e.getMessage());

      // 구체적인 HTTP 상태 코드 반환
      if (e.getMessage() != null && e.getMessage().contains("암호화")) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(
                Map.of(
                    "error", "JIRA 암호화 설정 오류",
                    "detail", "서버에서 JIRA_ENCRYPTION_KEY 환경변수가 설정되지 않았습니다. 관리자에게 문의하세요.",
                    "solution", "관리자는 다음 환경변수를 설정해주세요: JIRA_ENCRYPTION_KEY",
                    "code", "ENCRYPTION_KEY_NOT_SET"));
      } else {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", e.getMessage()));
      }

    } catch (Exception e) {
      log.error("❌ JIRA 설정 저장 실패 - 예상치 못한 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "시스템 오류가 발생했습니다", "detail", e.getMessage()));
    }
  }

  @Operation(summary = "JIRA 설정 수정", description = "기존 JIRA 설정을 수정합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "수정 성공"),
    @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
    @ApiResponse(responseCode = "404", description = "설정을 찾을 수 없음"),
    @ApiResponse(responseCode = "403", description = "수정 권한 없음"),
    @ApiResponse(responseCode = "401", description = "인증 필요")
  })
  @PutMapping("/config/{configId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<JiraConfigDto> updateConfig(
      @Parameter(description = "수정할 설정 ID", required = true) @PathVariable @NotBlank
          String configId,
      @Parameter(description = "수정할 JIRA 설정 정보", required = true) @Valid @RequestBody
          JiraConfigDto configDto) {

    try {
      String userId = securityContextUtil.getCurrentUserId();

      // 필수 필드 검증
      if (configDto.getServerUrl() == null || configDto.getServerUrl().trim().isEmpty()) {
        return ResponseEntity.badRequest().build();
      }
      if (configDto.getUsername() == null || configDto.getUsername().trim().isEmpty()) {
        return ResponseEntity.badRequest().build();
      }
      if (configDto.getApiToken() == null || configDto.getApiToken().trim().isEmpty()) {
        return ResponseEntity.badRequest().build();
      }

      // 설정 소유권 확인 및 수정
      JiraConfigDto updatedConfig = jiraConfigService.updateConfig(userId, configId, configDto);

      if (updatedConfig != null) {
        log.info("JIRA 설정 수정 성공: userId={}, configId={}", userId, configId);
        return ResponseEntity.ok(updatedConfig);
      } else {
        log.warn("JIRA 설정 수정 실패: userId={}, configId={} (설정을 찾을 수 없거나 권한 없음)", userId, configId);
        return ResponseEntity.notFound().build();
      }

    } catch (Exception e) {
      log.error("JIRA 설정 수정 중 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @Operation(summary = "JIRA 연결 테스트", description = "JIRA 서버와의 연결을 테스트합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "테스트 완료"),
    @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
    @ApiResponse(responseCode = "401", description = "인증 필요")
  })
  @PostMapping("/test-connection")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<JiraConfigDto.ConnectionStatusDto> testConnection(
      @Parameter(description = "연결 테스트 정보", required = true) @Valid @RequestBody
          JiraConfigDto.TestConnectionDto testConfig) {

    try {
      String userId = securityContextUtil.getCurrentUserId();

      JiraConfigDto.ConnectionStatusDto status =
          jiraConfigService.testAndUpdateConnection(userId, testConfig);

      if (status.getIsConnected()) {
        log.info("JIRA 연결 테스트 성공: userId={}", userId);
      } else {
        log.warn("JIRA 연결 테스트 실패: userId={}, message={}", userId, status.getMessage());
      }

      return ResponseEntity.ok(status);

    } catch (Exception e) {
      log.error("JIRA 연결 테스트 중 오류", e);

      JiraConfigDto.ConnectionStatusDto errorStatus =
          JiraConfigDto.ConnectionStatusDto.builder()
              .isConnected(false)
              .status("ERROR")
              .message("연결 테스트 중 오류 발생: " + e.getMessage())
              .build();

      return ResponseEntity.ok(errorStatus);
    }
  }

  @Operation(summary = "JIRA 설정 삭제", description = "지정된 JIRA 설정을 삭제합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "삭제 성공"),
    @ApiResponse(responseCode = "404", description = "설정을 찾을 수 없음"),
    @ApiResponse(responseCode = "403", description = "삭제 권한 없음"),
    @ApiResponse(responseCode = "401", description = "인증 필요")
  })
  @DeleteMapping("/config/{configId}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Map<String, Object>> deleteConfig(
      @Parameter(description = "삭제할 설정 ID", required = true) @PathVariable @NotBlank
          String configId) {

    try {
      String userId = securityContextUtil.getCurrentUserId();

      boolean success = jiraConfigService.deleteConfig(userId, configId);

      if (success) {
        log.info("JIRA 설정 삭제 성공: userId={}, configId={}", userId, configId);
        return ResponseEntity.ok(Map.of("success", true, "message", "설정이 삭제되었습니다."));
      } else {
        log.warn("JIRA 설정 삭제 실패: userId={}, configId={}", userId, configId);
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("success", false, "message", "설정을 찾을 수 없거나 삭제 권한이 없습니다."));
      }

    } catch (Exception e) {
      log.error("JIRA 설정 삭제 중 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "삭제 중 오류 발생"));
    }
  }

  @Operation(summary = "JIRA 설정 활성화", description = "지정된 JIRA 설정을 활성화합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "활성화 성공"),
    @ApiResponse(responseCode = "404", description = "설정을 찾을 수 없음"),
    @ApiResponse(responseCode = "403", description = "활성화 권한 없음"),
    @ApiResponse(responseCode = "401", description = "인증 필요")
  })
  @PostMapping("/config/{configId}/activate")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Map<String, Object>> activateConfig(
      @Parameter(description = "활성화할 설정 ID", required = true) @PathVariable @NotBlank
          String configId) {

    try {
      String userId = securityContextUtil.getCurrentUserId();

      boolean success = jiraConfigService.activateConfig(userId, configId);

      if (success) {
        log.info("JIRA 설정 활성화 성공: userId={}, configId={}", userId, configId);
        return ResponseEntity.ok(Map.of("success", true, "message", "설정이 활성화되었습니다."));
      } else {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("success", false, "message", "설정을 찾을 수 없거나 권한이 없습니다."));
      }

    } catch (Exception e) {
      log.error("JIRA 설정 활성화 중 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "활성화 중 오류 발생"));
    }
  }

  @Operation(summary = "JIRA 프로젝트 목록 조회", description = "연결된 JIRA 서버의 프로젝트 목록을 조회합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "조회 성공"),
    @ApiResponse(responseCode = "404", description = "JIRA 설정이 없음"),
    @ApiResponse(responseCode = "401", description = "인증 필요")
  })
  @GetMapping("/projects")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<List<JiraConfigDto.JiraProjectDto>> getJiraProjects() {
    try {
      String userId = securityContextUtil.getCurrentUserId();

      List<JiraConfigDto.JiraProjectDto> projects = jiraConfigService.getJiraProjects(userId);

      log.info("JIRA 프로젝트 목록 조회 성공: userId={}, count={}", userId, projects.size());
      return ResponseEntity.ok(projects);

    } catch (Exception e) {
      log.error("JIRA 프로젝트 목록 조회 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @Operation(summary = "테스트 결과 JIRA 코멘트 추가", description = "테스트 결과를 JIRA 이슈에 코멘트로 추가합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "코멘트 추가 성공"),
    @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
    @ApiResponse(responseCode = "404", description = "JIRA 설정이 없음"),
    @ApiResponse(responseCode = "401", description = "인증 필요")
  })
  @PostMapping("/add-comment")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Map<String, Object>> addTestResultComment(
      @Parameter(description = "코멘트 추가 요청", required = true) @RequestBody
          Map<String, String> request) {

    String userId = null;
    String issueKey = null;
    String comment = null;

    try {
      userId = securityContextUtil.getCurrentUserId();
      issueKey = request.get("issueKey");
      comment = request.get("comment");

      if (issueKey == null
          || issueKey.trim().isEmpty()
          || comment == null
          || comment.trim().isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "issueKey와 comment는 필수입니다."));
      }

      boolean success = jiraConfigService.addTestResultComment(userId, issueKey, comment);

      if (success) {
        log.info("JIRA 코멘트 추가 성공: userId={}, issueKey={}", userId, issueKey);
        return ResponseEntity.ok(Map.of("success", true, "message", "코멘트가 추가되었습니다."));
      } else {
        log.warn("JIRA 코멘트 추가 실패: userId={}, issueKey={}", userId, issueKey);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("success", false, "message", "코멘트 추가에 실패했습니다."));
      }

    } catch (Exception e) {
      log.error(
          "JIRA 코멘트 추가 중 오류: userId={}, issueKey={}, comment length={}",
          userId,
          issueKey,
          comment != null ? comment.length() : 0,
          e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "코멘트 추가 중 오류 발생: " + e.getMessage()));
    }
  }

  @Operation(summary = "JIRA 연결 상태 확인", description = "현재 JIRA 설정의 연결 상태를 확인합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "상태 확인 성공"),
    @ApiResponse(responseCode = "404", description = "설정을 찾을 수 없음"),
    @ApiResponse(responseCode = "401", description = "인증 필요")
  })
  @GetMapping("/connection-status")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Map<String, Object>> getConnectionStatus() {
    try {
      log.debug("JIRA 연결 상태 확인 시작");

      if (securityContextUtil == null) {
        log.error("SecurityContextUtil이 null입니다.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("hasConfig", false, "error", "인증 서비스 오류"));
      }

      String userId = securityContextUtil.getCurrentUserId();
      log.debug("현재 사용자 ID: {}", userId);

      if (userId == null) {
        log.warn("사용자 ID가 null입니다. 인증 정보를 확인하세요.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("hasConfig", false, "error", "사용자 인증이 필요합니다"));
      }

      Optional<JiraConfigDto> config = jiraConfigService.getActiveConfigByUserId(userId);
      log.debug("JIRA 설정 조회 결과: {}", config.isPresent() ? "있음" : "없음");

      if (config.isPresent()) {
        JiraConfigDto configDto = config.get();

        Map<String, Object> status = new HashMap<>();
        status.put("hasConfig", true);
        status.put(
            "isConnected",
            configDto.getConnectionVerified() != null && configDto.getConnectionVerified());
        status.put("lastTested", configDto.getLastConnectionTest());
        status.put("lastError", configDto.getLastConnectionError());
        status.put("serverUrl", configDto.getServerUrl());
        status.put("username", configDto.getUsername());

        log.debug("JIRA 연결 상태 조회 성공: hasConfig=true");
        return ResponseEntity.ok(status);
      } else {
        log.debug("JIRA 연결 상태 조회 성공: hasConfig=false");
        return ResponseEntity.ok(Map.of("hasConfig", false));
      }

    } catch (Exception e) {
      log.error("JIRA 연결 상태 확인 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("hasConfig", false, "error", "상태 확인 중 오류 발생"));
    }
  }

  @Operation(summary = "JIRA 이슈 검색", description = "JQL을 사용하여 JIRA 이슈를 검색합니다.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "검색 성공"),
    @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
    @ApiResponse(responseCode = "404", description = "JIRA 설정이 없음"),
    @ApiResponse(responseCode = "401", description = "인증 필요")
  })
  @PostMapping("/search")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Map<String, Object>> searchIssues(
      @Parameter(description = "이슈 검색 요청", required = true) @RequestBody
          Map<String, Object> searchRequest) {

    try {
      String userId = securityContextUtil.getCurrentUserId();
      String query = (String) searchRequest.get("query");
      Integer maxResults = (Integer) searchRequest.getOrDefault("maxResults", 50);

      // 필수 필드 검증
      if (query == null || query.trim().isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("success", false, "message", "검색 쿼리가 필요합니다."));
      }

      // 최대 결과 수 제한
      if (maxResults > 100) {
        maxResults = 100;
      }

      // JIRA 설정 조회
      Optional<JiraConfigDto> config = jiraConfigService.getActiveConfigByUserId(userId);
      if (config.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("success", false, "message", "활성화된 JIRA 설정이 없습니다."));
      }

      JiraConfigDto configDto = config.get();

      // 검색 실행
      List<Object> issues = jiraConfigService.searchIssues(userId, query, maxResults);

      Map<String, Object> result = new HashMap<>();
      result.put("success", true);
      result.put("issues", issues);
      result.put("total", issues.size());
      result.put("maxResults", maxResults);
      result.put("query", query);

      log.info("JIRA 이슈 검색 성공: userId={}, query={}, results={}", userId, query, issues.size());
      return ResponseEntity.ok(result);

    } catch (Exception e) {
      log.error("JIRA 이슈 검색 중 오류", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("success", false, "message", "이슈 검색 중 오류 발생: " + e.getMessage()));
    }
  }
}
