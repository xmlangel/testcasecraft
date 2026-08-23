// src/main/java/com/testcase/testcasemanagement/controller/LlmModelCatalogController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.ApiResponse;
import com.testcase.testcasemanagement.dto.llm.LlmModelCatalogInfo;
import com.testcase.testcasemanagement.dto.llm.LlmModelDTO;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeResponse;
import com.testcase.testcasemanagement.dto.llm.LlmModelQueryRequest;
import com.testcase.testcasemanagement.exception.EncryptionKeyNotConfiguredException;
import com.testcase.testcasemanagement.service.LlmConfigService;
import io.swagger.v3.oas.annotations.Operation;
// Swagger ApiResponse는 전체 경로 사용 (com.testcase...ApiResponse와 충돌 방지)
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeJob;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * LLM 모델 카탈로그 API 컨트롤러
 *
 * <p>설정 CRUD 와 갈라 둔 이유는 성격이 다르기 때문이다. 설정 CRUD 는 우리 DB 를 다루고, 여기는 <b>제공자에게 물어보는 일</b>만 한다. 어떤
 * 모델이 있는지, 그 모델을 지금 쓸 수 있는지는 제공자가 아는 것이고 우리는 그것을 옮겨 줄 뿐이다.
 *
 * <p>제공자마다 목록의 성질이 크게 다르다는 것이 이 API 를 이해하는 핵심이다. 실측으로 확인한 차이가 각 엔드포인트 설명에 적혀 있다.
 *
 * <p>모든 API 는 {@code /api/llm-configs} 아래에 둔다. 설정과 모델은 사용자에게 한 화면이라 경로를 나누면 오히려 찾기 어렵다.
 */
@Tag(name = "LLM - Model Catalog", description = "LLM 모델 목록·가용성 API")
@RestController
@RequestMapping("/api/llm-configs")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "bearerAuth")
public class LlmModelCatalogController {

  private final LlmConfigService llmConfigService;

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
  @GetMapping("/models/for-chat")
  public ResponseEntity<ApiResponse<List<LlmModelDTO>>> listSelectableModelsForChat() {
    List<LlmModelDTO> models = llmConfigService.listSelectableModelsForChat();
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
          알려면 `/models/probe` 를 따로 호출하세요.

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
  @PostMapping("/models")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<List<LlmModelDTO>>> listSelectableModels(
      @RequestBody LlmModelQueryRequest request) {
    log.info("📋 OpenRouter 무료 모델 목록 요청");
    try {
      List<LlmModelDTO> models = llmConfigService.listSelectableModels(request);
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

  @io.swagger.v3.oas.annotations.Operation(
      summary = "가용성 확인 시작 (백그라운드)",
      description =
          """
          모델 가용성 확인을 백그라운드 작업으로 시작하고 작업 ID 를 돌려준다.
          확인은 최악의 경우 몇 분이 걸리므로(OpenRouter 2분 30초, NVIDIA 6분) 결과를 기다리지 않는다.
          진행 상황과 결과는 `GET /models/probe/{jobId}` 로 받는다.
          """)
  @PostMapping("/models/probe-jobs")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<LlmModelProbeJob>> startProbeJob(
      @RequestBody LlmModelQueryRequest request) {
    log.info("🔍 모델 가용성 확인 작업 요청");
    try {
      LlmModelProbeJob job = llmConfigService.startProbeJob(request);
      // 202 를 쓰는 이유는 일이 아직 끝나지 않았음을 상태 코드로 알리기 위해서다.
      return ResponseEntity.accepted()
          .body(ApiResponse.success(job, "확인 대상 " + job.getTotal() + "개"));
    } catch (EncryptionKeyNotConfiguredException e) {
      log.error("❌ 암호화 키 미설정으로 요청을 거부: {}", e.getMessage());
      return ResponseEntity.badRequest()
          .body(ApiResponse.error(EncryptionKeyNotConfiguredException.ERROR_CODE, e.getMessage()));
    } catch (IllegalStateException e) {
      // 동시 작업 상한을 넘었다. 잘못된 요청이 아니라 지금 받을 수 없다는 뜻이라 429 를 쓴다.
      log.warn("⚠️ 확인 작업을 받지 못했다: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
          .body(ApiResponse.error(e.getMessage()));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
    } catch (Exception e) {
      log.error("❌ 확인 작업 시작 실패", e);
      return ResponseEntity.badRequest().body(ApiResponse.error("확인 시작 실패: " + e.getMessage()));
    }
  }

  @io.swagger.v3.oas.annotations.Operation(
      summary = "가용성 확인 진행 상황",
      description =
          """
          작업의 진행률과 결과를 돌려준다. `status` 가 `DONE` 이면 `result` 에 확인 결과가 담긴다.
          끝난 작업은 10분 동안 조회할 수 있고 그 뒤에는 지워진다. 서버를 다시 시작하면 진행 중인 작업이 사라진다.
          """)
  @GetMapping("/models/probe-jobs/{jobId}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<ApiResponse<LlmModelProbeJob>> findProbeJob(@PathVariable String jobId) {
    return llmConfigService
        .findProbeJob(jobId)
        .map(job -> ResponseEntity.ok(ApiResponse.success(job, describe(job))))
        .orElseGet(
            () ->
                ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(
                        ApiResponse.error(
                            "확인 작업을 찾을 수 없습니다. 10분이 지나 지워졌거나 서버가 다시 시작됐을 수 있습니다.")));
  }

  /** 작업 상태를 사람이 읽을 문구로 만든다. */
  private static String describe(LlmModelProbeJob job) {
    return switch (job.getStatus()) {
      case RUNNING -> "확인 중 " + job.getDone() + " / " + job.getTotal();
      case DONE -> "확인 완료 " + job.getDone() + "개";
      case FAILED -> "확인 실패";
    };
  }


}
