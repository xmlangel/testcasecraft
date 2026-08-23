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
  @PostMapping("/models/probe")
  @PreAuthorize("hasRole('ADMIN')")
  public Mono<ResponseEntity<ApiResponse<LlmModelProbeResponse>>> probeModelAvailability(
      @RequestBody LlmModelQueryRequest request) {
    log.info("🔍 모델 가용성 확인 요청");
    // Mono 를 그대로 돌려준다. Spring MVC 가 이것을 비동기 요청으로 다루므로 서블릿 스레드가 즉시
    // 풀린다. 결과를 기다려 돌려주면 최악의 경우 스레드 하나가 6분(NVIDIA 120개 / 동시 10 × 30초)
    // 묶인다.
    return llmConfigService
        .probeModelAvailability(request)
        .map(LlmModelCatalogController::probeSuccess)
        .onErrorResume(LlmModelCatalogController::probeFailure);
  }

  /** 확인 결과를 사용 가능 개수와 함께 담는다. */
  private static ResponseEntity<ApiResponse<LlmModelProbeResponse>> probeSuccess(
      LlmModelProbeResponse result) {
    List<LlmModelDTO> models = result.getModels();
    long available =
        models.stream()
            .filter(m -> m.getAvailability() == LlmModelDTO.Availability.AVAILABLE)
            .count();
    return ResponseEntity.ok(
        ApiResponse.success(result, "사용 가능 " + available + " / 확인 " + models.size()));
  }

  /**
   * 확인 도중 나온 예외를 응답으로 바꾼다.
   *
   * <p>리액티브 흐름에서는 예외가 {@code try/catch} 로 잡히지 않으므로 여기서 종류별로 가른다. 예전 동기 코드와 같은 상태 코드와 문구를 유지한다.
   */
  private static Mono<ResponseEntity<ApiResponse<LlmModelProbeResponse>>> probeFailure(
      Throwable error) {
    if (error instanceof EncryptionKeyNotConfiguredException e) {
      log.error("❌ 암호화 키 미설정으로 요청을 거부: {}", e.getMessage());
      return Mono.just(
          ResponseEntity.badRequest()
              .body(
                  ApiResponse.error(
                      EncryptionKeyNotConfiguredException.ERROR_CODE, e.getMessage())));
    }
    if (error instanceof IllegalArgumentException e) {
      return Mono.just(ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage())));
    }
    log.error("❌ 모델 가용성 확인 실패", error);
    return Mono.just(
        ResponseEntity.badRequest()
            .body(ApiResponse.error("가용성 확인 실패: " + error.getMessage())));
  }
}
