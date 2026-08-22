// src/main/java/com/testcase/testcasemanagement/controller/LlmConfigController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.ApiResponse;
import com.testcase.testcasemanagement.dto.llm.LlmConfigDTO;
import com.testcase.testcasemanagement.dto.llm.LlmModelCatalogInfo;
import com.testcase.testcasemanagement.dto.llm.OpenRouterModelDTO;
import com.testcase.testcasemanagement.dto.llm.OpenRouterModelQueryRequest;
import com.testcase.testcasemanagement.dto.llm.OpenRouterProbeResponse;
import com.testcase.testcasemanagement.exception.EncryptionKeyNotConfiguredException;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import com.testcase.testcasemanagement.service.LlmConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
// Swagger ApiResponse는 전체 경로 사용 (com.testcase...ApiResponse와 충돌 방지)
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * LLM 설정 관리 API 컨트롤러 (관리자 전용)
 *
 * <p>OpenWebUI와 OpenAI API 연동 설정을 관리합니다. 모든 API는 ADMIN 권한이 필요합니다.
 */
@Tag(name = "LLM - Configuration", description = "LLM 설정 관리 API (관리자 전용)")
@RestController
@RequestMapping("/api/llm-configs")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "bearerAuth")
public class LlmConfigController {

  private final LlmConfigService llmConfigService;

  @Operation(
      summary = "LLM 설정 가용성 확인",
      description =
          """
          시스템에 기본값으로 설정된 활성 LLM이 있는지 확인합니다.

          **권한**: 모든 인증된 사용자

          **사용 목적**: AI 질의응답 기능 사용 전 기본 LLM 설정 존재 여부 확인

          **참고**: AI 질의응답을 사용하려면 최소 1개의 LLM이 **기본값(default)**으로 설정되어 있어야 합니다.
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "조회 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패")
  })
  @GetMapping("/check-availability")
  public ResponseEntity<ApiResponse<Boolean>> checkAvailability() {
    log.info("🔍 LLM 설정 가용성 확인 요청");
    boolean hasDefaultConfig = llmConfigService.hasActiveConfig();

    String message =
        hasDefaultConfig ? "기본 LLM 설정이 존재합니다." : "기본 LLM 설정이 없습니다. 관리자가 LLM을 기본값으로 설정해야 합니다.";

    log.info("✅ LLM 설정 가용성 확인 완료: hasDefaultConfig={}, message={}", hasDefaultConfig, message);

    return ResponseEntity.ok(ApiResponse.success(hasDefaultConfig, message));
  }

  @Operation(
      summary = "모든 LLM 설정 조회",
      description =
          """
          시스템에 등록된 모든 LLM 설정을 조회합니다 (활성화 여부 무관).
          비활성화된 설정도 포함하여 관리자가 재활성화할 수 있도록 합니다.

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "조회 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<List<LlmConfigDTO>>> getAllActiveConfigs() {
    log.info("📋 모든 LLM 설정 조회 요청 (활성화 여부 무관)");
    List<LlmConfigDTO> configs = llmConfigService.getAllConfigs();
    return ResponseEntity.ok(ApiResponse.success(configs));
  }

  @Operation(
      summary = "활성 LLM 설정 조회",
      description =
          """
          현재 활성화되어 있는 LLM 설정만 조회합니다.

          **권한**: ADMIN, MANAGER, TESTER, USER

          일반 사용자도 RAG 기능을 사용할 때 필요한 최소 정보를 확인할 수 있도록
          암호화된 API Key 대신 마스킹된 값만 반환합니다.
          기본값(default)으로 지정된 설정만 전달됩니다.
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "조회 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음")
  })
  @GetMapping("/active")
  @PreAuthorize("hasAnyRole('ADMIN','MANAGER','TESTER','USER')")
  public ResponseEntity<ApiResponse<List<LlmConfigDTO>>> getActiveConfigsForUsers() {
    log.info("📋 활성 LLM 설정 조회 요청 (일반 사용자 포함)");
    List<LlmConfigDTO> configs = llmConfigService.getActiveConfigsForUsers();
    return ResponseEntity.ok(ApiResponse.success(configs));
  }

  @Operation(
      summary = "특정 LLM 설정 조회",
      description = """
          ID로 특정 LLM 설정을 조회합니다.

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "조회 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "설정을 찾을 수 없음"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @GetMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<LlmConfigDTO>> getConfigById(
      @Parameter(description = "LLM 설정 ID", required = true) @PathVariable String id) {
    log.info("🔍 LLM 설정 조회 요청: id={}", id);
    return llmConfigService
        .getConfigById(id)
        .map(config -> ResponseEntity.ok(ApiResponse.success(config)))
        .orElse(
            ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error("LLM 설정을 찾을 수 없습니다")));
  }

  @Operation(
      summary = "기본 LLM 설정 조회",
      description =
          """
          시스템에서 기본으로 사용하는 LLM 설정을 조회합니다.

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "조회 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "기본 설정이 없음"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @GetMapping("/default")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<LlmConfigDTO>> getDefaultConfig() {
    log.info("⭐ 기본 LLM 설정 조회 요청");
    return llmConfigService
        .getDefaultConfig()
        .map(config -> ResponseEntity.ok(ApiResponse.success(config)))
        .orElse(
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("기본 LLM 설정이 없습니다")));
  }

  @Operation(
      summary = "제공자별 LLM 설정 조회",
      description =
          """
          특정 제공자(OPENWEBUI 또는 OPENAI)의 활성화된 설정들을 조회합니다.

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "조회 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @GetMapping("/provider/{provider}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<List<LlmConfigDTO>>> getConfigsByProvider(
      @Parameter(description = "LLM 제공자 (OPENWEBUI, OPENAI)", required = true) @PathVariable
          LlmProvider provider) {
    log.info("📋 제공자별 LLM 설정 조회 요청: provider={}", provider);
    List<LlmConfigDTO> configs = llmConfigService.getConfigsByProvider(provider);
    return ResponseEntity.ok(ApiResponse.success(configs));
  }

  @Operation(
      summary = "LLM 설정 생성",
      description =
          """
          새로운 LLM 설정을 생성합니다.

          **필수 필드**:
          - name: 설정 이름
          - provider: LLM 제공자 (OPENWEBUI, OPENAI)
          - apiUrl: API URL
          - apiKey: API Key (평문으로 전송, AES-256으로 암호화되어 저장)
          - modelName: 모델 이름 (예: llama3.1, gpt-4)

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "201",
        description = "생성 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "잘못된 요청 데이터"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<LlmConfigDTO>> createConfig(
      @Valid @RequestBody LlmConfigDTO configDTO) {
    log.info("➕ LLM 설정 생성 요청: name={}", configDTO.getName());
    try {
      LlmConfigDTO createdConfig = llmConfigService.createConfig(configDTO);
      return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(createdConfig));
    } catch (EncryptionKeyNotConfiguredException e) {
      // 서버에 암호화 키가 없는 상태. 화면이 해결 안내를 띄울 수 있도록 errorCode 를 함께 내려준다.
      log.error("❌ 암호화 키 미설정으로 요청을 거부: {}", e.getMessage());
      return ResponseEntity.badRequest()
          .body(ApiResponse.error(EncryptionKeyNotConfiguredException.ERROR_CODE, e.getMessage()));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    } catch (Exception e) {
      log.error("❌ LLM 설정 생성 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("LLM 설정 생성 실패: " + e.getMessage()));
    }
  }

  @Operation(
      summary = "LLM 설정 수정",
      description =
          """
          기존 LLM 설정을 수정합니다.

          **수정 가능 필드**:
          - name, provider, apiUrl, modelName, apiKey
          - apiKey는 변경 시에만 전송 (생략 시 기존 값 유지)

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "수정 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "잘못된 요청 데이터"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "설정을 찾을 수 없음"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<LlmConfigDTO>> updateConfig(
      @Parameter(description = "LLM 설정 ID", required = true) @PathVariable String id,
      @Valid @RequestBody LlmConfigDTO configDTO) {
    log.info("✏️ LLM 설정 수정 요청: id={}", id);
    try {
      LlmConfigDTO updatedConfig = llmConfigService.updateConfig(id, configDTO);
      return ResponseEntity.ok(ApiResponse.success(updatedConfig));
    } catch (EncryptionKeyNotConfiguredException e) {
      // 서버에 암호화 키가 없는 상태. 화면이 해결 안내를 띄울 수 있도록 errorCode 를 함께 내려준다.
      log.error("❌ 암호화 키 미설정으로 요청을 거부: {}", e.getMessage());
      return ResponseEntity.badRequest()
          .body(ApiResponse.error(EncryptionKeyNotConfiguredException.ERROR_CODE, e.getMessage()));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    } catch (Exception e) {
      log.error("❌ LLM 설정 수정 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("LLM 설정 수정 실패: " + e.getMessage()));
    }
  }

  @Operation(
      summary = "LLM 설정 삭제",
      description =
          """
          LLM 설정을 삭제합니다.

          **주의**: 기본 설정이면서 유일한 설정인 경우 삭제할 수 없습니다.

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "삭제 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "삭제할 수 없는 설정"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "설정을 찾을 수 없음"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Void>> deleteConfig(
      @Parameter(description = "LLM 설정 ID", required = true) @PathVariable String id) {
    log.info("🗑️ LLM 설정 삭제 요청: id={}", id);
    try {
      llmConfigService.deleteConfig(id);
      return ResponseEntity.ok(ApiResponse.success(null, "LLM 설정이 삭제되었습니다"));
    } catch (IllegalArgumentException | IllegalStateException e) {
      return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    } catch (Exception e) {
      log.error("❌ LLM 설정 삭제 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("LLM 설정 삭제 실패: " + e.getMessage()));
    }
  }

  @Operation(
      summary = "기본 설정으로 지정",
      description =
          """
          특정 LLM 설정을 기본 설정으로 지정합니다.
          기존 기본 설정은 자동으로 해제됩니다.

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "지정 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "비활성 설정은 기본으로 지정 불가"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "설정을 찾을 수 없음"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @PutMapping("/{id}/set-default")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<LlmConfigDTO>> setDefaultConfig(
      @Parameter(description = "LLM 설정 ID", required = true) @PathVariable String id) {
    log.info("⭐ 기본 설정 지정 요청: id={}", id);
    try {
      LlmConfigDTO updatedConfig = llmConfigService.setDefaultConfig(id);
      return ResponseEntity.ok(ApiResponse.success(updatedConfig, "기본 설정으로 지정되었습니다"));
    } catch (IllegalArgumentException | IllegalStateException e) {
      return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    } catch (Exception e) {
      log.error("❌ 기본 설정 지정 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("기본 설정 지정 실패: " + e.getMessage()));
    }
  }

  @Operation(
      summary = "LLM 연결 테스트",
      description =
          """
          LLM API에 실제 연결하여 설정이 정상인지 테스트합니다.

          **테스트 방법**:
          - 간단한 "Hello" 메시지로 API 호출
          - max_tokens 10으로 제한하여 비용 최소화

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "연결 테스트 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "연결 테스트 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "설정을 찾을 수 없음"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @PostMapping("/{id}/test-connection")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<LlmConfigDTO>> testConnection(
      @Parameter(description = "LLM 설정 ID", required = true) @PathVariable String id) {
    log.info("🔌 LLM 연결 테스트 요청: id={}", id);
    try {
      LlmConfigDTO testedConfig = llmConfigService.testConnection(id);
      return ResponseEntity.ok(ApiResponse.success(testedConfig, "연결 테스트 성공"));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    } catch (Exception e) {
      log.error("❌ 연결 테스트 실패", e);
      return ResponseEntity.badRequest().body(ApiResponse.error("연결 테스트 실패: " + e.getMessage()));
    }
  }

  @Operation(
      summary = "모델 목록을 내주는 제공자",
      description =
          """
          어느 제공자에서 모델 목록 선택기를 띄울 수 있는지 알려 줍니다.

          `probeRecommendedByDefault` 가 true 인 제공자는 **전수 확인이 필수에 가깝습니다.**
          NVIDIA 가 그렇습니다. 목록에 오른 모델의 상당수가 계정에 없어 404 를 내므로(실측: 채팅
          후보 77개 중 사용 가능 25개) 확인하지 않으면 사용자가 쓸 수 없는 모델을 고릅니다.
          확인에 한도 부담도 없습니다.

          false 인 제공자는 **확인을 아껴야 합니다.** OpenRouter 가 그렇습니다. 목록에 오른 모델은
          대개 쓸 수 있지만 확인 한 번이 무료 일일 한도(실측 50건)를 그만큼 씁니다.

          목록에 없는 제공자(OpenWebUI·Ollama·OpenAI·Perplexity)는 모델 이름을 직접 입력합니다.

          **권한**: 모든 인증된 사용자
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "조회 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패")
  })
  @GetMapping("/model-catalogs")
  public ResponseEntity<ApiResponse<List<LlmModelCatalogInfo>>> listModelCatalogProviders() {
    List<LlmModelCatalogInfo> catalogs = llmConfigService.listModelCatalogProviders();
    return ResponseEntity.ok(ApiResponse.success(catalogs, "제공자 " + catalogs.size() + "개"));
  }

  @Operation(
      summary = "채팅에서 고를 수 있는 무료 모델 목록",
      description =
          """
          RAG 채팅 화면의 모델 선택기에 쓰는 목록입니다. 기본 활성 설정이 OpenRouter 일 때만
          목록이 나오고, 그 외에는 **빈 목록**을 돌려줍니다(오류가 아닙니다 — 화면이 선택기를 감춥니다).

          서버가 저장된 키로 조회하며 **API Key 는 응답에 담지 않습니다.**

          관리자용 목록과 다른 점 둘입니다.
          - 권한이 모든 인증된 사용자입니다
          - 가용성 확인을 하지 않습니다. 확인 호출은 무료 한도를 쓰므로 일반 사용자에게 열지 않습니다

          **권한**: 모든 인증된 사용자
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "조회 성공 (기본 설정이 OpenRouter 가 아니면 빈 목록)"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패")
  })
  @GetMapping("/openrouter/free-models/for-chat")
  public ResponseEntity<ApiResponse<List<OpenRouterModelDTO>>> listSelectableFreeModelsForChat() {
    List<OpenRouterModelDTO> models = llmConfigService.listSelectableFreeModelsForChat();
    return ResponseEntity.ok(ApiResponse.success(models, "무료 모델 " + models.size() + "개"));
  }

  @Operation(
      summary = "OpenRouter 무료 모델 목록 조회",
      description =
          """
          OpenRouter 에서 지금 제공되는 **무료 채팅 모델** 목록을 받아옵니다.

          API Key 는 두 방법으로 넘길 수 있습니다.
          - `apiKey`: 저장 전 설정에서 화면에 입력한 키를 그대로 보냅니다
          - `configId`: 이미 저장된 설정이면 ID 만 보내고 서버가 저장된 키를 씁니다

          **무료 판정은 가격입니다.** 슬러그의 `:free` 접미가 아니라 prompt·completion 단가가 0 인 것을
          고릅니다. 접미가 없는 무료 모델(`openrouter/free` 등)이 실제로 존재하기 때문입니다.

          **채팅 판정은 출력 모달리티입니다.** 출력이 텍스트뿐인 모델만 남기므로 음악·이미지 생성 모델은
          목록에 오르지 않습니다.

          **가용성은 확인하지 않습니다.** 응답의 `availability` 는 모두 `UNKNOWN` 입니다. 지금 쓸 수 있는지
          알려면 `/openrouter/free-models/probe` 를 따로 호출하세요.

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "조회 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "API Key 누락 또는 OpenRouter 조회 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @PostMapping("/openrouter/free-models")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<List<OpenRouterModelDTO>>> listOpenRouterFreeModels(
      @RequestBody OpenRouterModelQueryRequest request) {
    log.info("📋 OpenRouter 무료 모델 목록 요청");
    try {
      List<OpenRouterModelDTO> models = llmConfigService.listOpenRouterFreeModels(request);
      return ResponseEntity.ok(ApiResponse.success(models, "무료 모델 " + models.size() + "개"));
    } catch (EncryptionKeyNotConfiguredException e) {
      log.error("❌ 암호화 키 미설정으로 요청을 거부: {}", e.getMessage());
      return ResponseEntity.badRequest()
          .body(ApiResponse.error(EncryptionKeyNotConfiguredException.ERROR_CODE, e.getMessage()));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    } catch (Exception e) {
      log.error("❌ OpenRouter 무료 모델 목록 조회 실패", e);
      return ResponseEntity.badRequest()
          .body(ApiResponse.error("무료 모델 목록 조회 실패: " + e.getMessage()));
    }
  }

  @Operation(
      summary = "OpenRouter 모델 가용성 확인",
      description =
          """
          지정한 모델들에 **최소 요청(토큰 1개)** 을 보내 지금 쓸 수 있는지 확인합니다.
          `modelIds` 를 비우면 무료 모델 전체를 확인합니다.

          **왜 실제로 호출하는가**: OpenRouter 의 모델 상태 메타데이터로는 한도 소진을 알 수 없습니다.
          429 를 내는 모델에도 `status=0`·`uptime=100` 이 돌아옵니다. 실측으로 확인한 사항입니다.

          판정은 넷으로 갈립니다.
          - `AVAILABLE`: 정상 응답
          - `RATE_LIMITED`: 무료 한도 소진(429). 잠시 뒤 풀릴 수 있습니다
          - `UNAVAILABLE`: 이 경로로는 쓸 수 없음(403·404·502 등)
          - `UNKNOWN`: 확인하지 않음

          **주의: 확인 호출이 무료 일일 한도를 그만큼 씁니다.** 실측으로 확인한 한도는 50건이고
          무료 모델은 20개이므로, 전체 확인 한 번이 하루치의 40% 를 씁니다. 그래서 화면은 고른 모델
          하나만 확인하는 것을 기본으로 하고, 전체 확인은 소모량을 알린 뒤에만 보냅니다.

          `alreadyChecked` 에 이미 판정한 모델을 담아 보내면 그 모델은 건너뜁니다. 버튼을 다시 눌렀을
          때 같은 모델을 또 두드리지 않게 하려는 것입니다. 응답의 `requestsSent` 로 실제로 보낸 요청
          수를 알 수 있습니다.

          응답의 `accountLimit` 은 계정 일일 한도에 걸렸을 때만 채워집니다. **잔량은 미리 알 수
          없습니다** — 정상 응답 헤더에는 한도 정보가 없고 `/api/v1/key` 는 달러 크레딧만 알려 줍니다.
          429 응답 헤더에만 들어 있어 한 번 걸린 뒤에야 알 수 있습니다.

          한 번에 최대 40개까지 확인합니다.

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "확인 완료"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "API Key 누락 또는 확인 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @PostMapping("/openrouter/free-models/probe")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<OpenRouterProbeResponse>> probeOpenRouterModels(
      @RequestBody OpenRouterModelQueryRequest request) {
    log.info("🔍 OpenRouter 모델 가용성 확인 요청");
    try {
      OpenRouterProbeResponse result = llmConfigService.probeOpenRouterModels(request);
      List<OpenRouterModelDTO> models = result.getModels();
      long available =
          models.stream()
              .filter(m -> m.getAvailability() == OpenRouterModelDTO.Availability.AVAILABLE)
              .count();
      return ResponseEntity.ok(
          ApiResponse.success(
              result, "사용 가능 " + available + " / 확인 " + models.size()));
    } catch (EncryptionKeyNotConfiguredException e) {
      log.error("❌ 암호화 키 미설정으로 요청을 거부: {}", e.getMessage());
      return ResponseEntity.badRequest()
          .body(ApiResponse.error(EncryptionKeyNotConfiguredException.ERROR_CODE, e.getMessage()));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    } catch (Exception e) {
      log.error("❌ OpenRouter 모델 가용성 확인 실패", e);
      return ResponseEntity.badRequest().body(ApiResponse.error("가용성 확인 실패: " + e.getMessage()));
    }
  }

  @Operation(
      summary = "저장하지 않고 LLM 설정 테스트",
      description =
          """
          다이얼로그에서 설정을 입력 중일 때, 저장하기 전에 설정이 올바른지 테스트합니다.

          **사용 시나리오**:
          - 설정 생성/수정 다이얼로그에서 "테스트 연결" 버튼 클릭
          - DB에 저장하지 않고 입력된 설정으로 바로 연결 테스트

          **테스트 방법**:
          - 간단한 "Hello" 메시지로 API 호출
          - max_tokens 16으로 제한하여 비용 최소화

          **필수 필드**:
          - provider: LLM 제공자
          - apiUrl: API URL
          - apiKey: API Key (평문)
          - modelName: 모델 이름

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "연결 테스트 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "연결 테스트 실패 또는 잘못된 설정"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @PostMapping("/test-settings")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<Void>> testUnsavedSettings(
      @Valid @RequestBody LlmConfigDTO configDTO) {
    log.info(
        "🔌 저장하지 않고 LLM 설정 테스트 요청: provider={}, model={}",
        configDTO.getProvider(),
        configDTO.getModelName());
    try {
      llmConfigService.testUnsavedSettings(configDTO);
      return ResponseEntity.ok(ApiResponse.success(null, "연결 테스트 성공"));
    } catch (EncryptionKeyNotConfiguredException e) {
      // 서버에 암호화 키가 없는 상태. 화면이 해결 안내를 띄울 수 있도록 errorCode 를 함께 내려준다.
      log.error("❌ 암호화 키 미설정으로 요청을 거부: {}", e.getMessage());
      return ResponseEntity.badRequest()
          .body(ApiResponse.error(EncryptionKeyNotConfiguredException.ERROR_CODE, e.getMessage()));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    } catch (Exception e) {
      log.error("❌ 저장하지 않고 설정 테스트 실패", e);
      return ResponseEntity.badRequest().body(ApiResponse.error("연결 테스트 실패: " + e.getMessage()));
    }
  }

  @Operation(
      summary = "활성/비활성 토글",
      description =
          """
          LLM 설정을 활성화 또는 비활성화합니다.

          **주의**: 기본 설정이면서 유일한 설정인 경우 비활성화할 수 없습니다.

          **권한**: ADMIN
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "토글 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "400",
        description = "비활성화할 수 없는 설정"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "404",
        description = "설정을 찾을 수 없음"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "403",
        description = "권한 없음 (ADMIN 필요)")
  })
  @PutMapping("/{id}/toggle-active")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<LlmConfigDTO>> toggleActive(
      @Parameter(description = "LLM 설정 ID", required = true) @PathVariable String id) {
    log.info("🔄 활성/비활성 토글 요청: id={}", id);
    try {
      LlmConfigDTO updatedConfig = llmConfigService.toggleActive(id);
      return ResponseEntity.ok(ApiResponse.success(updatedConfig));
    } catch (IllegalArgumentException | IllegalStateException e) {
      return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    } catch (Exception e) {
      log.error("❌ 활성/비활성 토글 실패", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("활성/비활성 토글 실패: " + e.getMessage()));
    }
  }

  @Operation(
      summary = "기본 테스트 케이스 템플릿 조회",
      description =
          """
          시스템에 정의된 기본 테스트 케이스 생성 템플릿(JSON)을 조회합니다.
           Frontend에서 하드코딩된 값 대신 이 API를 사용하여 항상 최신 형식을 유지할 수 있습니다.

          **권한**: 모든 인증된 사용자
          """)
  @ApiResponses({
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "200",
        description = "조회 성공"),
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
        responseCode = "401",
        description = "인증 실패")
  })
  @GetMapping("/default-template")
  public ResponseEntity<ApiResponse<String>> getDefaultTemplate() {
    log.info("📋 기본 테스트 케이스 템플릿 조회 요청");
    return ResponseEntity.ok(ApiResponse.success(LlmConfigDTO.DEFAULT_TEST_CASE_TEMPLATE));
  }
}
