package com.testcase.testcasemanagement.service.llm;

import com.testcase.testcasemanagement.dto.llm.LlmModelDTO;
import com.testcase.testcasemanagement.dto.llm.LlmModelDTO.Availability;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * NVIDIA NIM 모델 카탈로그
 *
 * <p>OpenRouter 와 성질이 정반대다. 실측으로 확인한 사항이다.
 *
 * <ul>
 *   <li>{@code /v1/models} 상항에 <b>가격도 모달리티도 없다</b>({@code id}·{@code object}·{@code created}·{@code
 *       owned_by} 뿐). 무료·채팅 판정을 메타데이터로 할 수 없어 ID 패턴으로 추정한다.
 *   <li>목록에 오른 모델의 <b>상당수가 이 계정에서 404</b> 를 낸다({@code Not found for account}). 실측에서 채팅 후보 77개 중
 *       실제로 쓸 수 있는 것이 28개였다. 그래서 확인이 곧 유일한 판정 수단이다.
 *   <li>확인에 <b>한도 제약이 사실상 없다</b>. 160회 넘게 두드렸는데 429 가 한 번도 없었다.
 *   <li>처음 호출하는 모델은 <b>콜드 스타트로 수십 초</b>가 걸린다.
 * </ul>
 *
 * <p>확인 절차 자체는 {@link AbstractLlmModelCatalog} 가 담당한다.
 */
@Service
@Slf4j
public class NvidiaModelCatalogService extends AbstractLlmModelCatalog {

  private static final String NVIDIA_BASE_URL = "https://integrate.api.nvidia.com";

  private static final String MODELS_PATH = "/v1/models";

  /**
   * 키 검증에 쓰는 모델.
   *
   * <p>이 모델이 계정에 없어도 된다. 키가 유효하면 404 가 오고 무효하면 403 이 오므로 코드로 갈린다. 널리 제공되는 작은 모델을 골라 콜드 스타트 대기를
   * 줄인다.
   */
  private static final String KEY_CHECK_MODEL = "meta/llama-3.1-8b-instruct";

  /**
   * 채팅으로 쓸 수 없는 모델을 걸러내는 ID 패턴.
   *
   * <p>상항에 모달리티가 없어 이름으로 추정한다. 추정이므로 새 모델이 나오면 어긋날 수 있는데, 가용성 확인이 실제 호출로 그것을 걸러낸다. 표본으로 검집했다.
   * 제외한 모델 다섯 개를 실제로 호출해 보니 전부 404 였다.
   */
  private static final Pattern NON_CHAT =
      Pattern.compile(
          "embed|bge-|e5-|arctic-embed|rerank|riva|parakeet|whisper|tts|asr"
              + "|vila|neva|fuyu|kosmos|florence|paligemma"
              + "|stable-diffusion|sdxl|flux|nvclip|deplot"
              + "|protein|molmim|esm|diffdock|genemol"
              + "|reward|parse|video-detector",
          Pattern.CASE_INSENSITIVE);

  public NvidiaModelCatalogService(WebClient.Builder webClientBuilder) {
    super(webClientBuilder);
  }

  @Override
  public LlmProvider provider() {
    return LlmProvider.NVIDIA;
  }

  /**
   * 전수 확인을 기본으로 권한다.
   *
   * <p>목록의 3분의 2가 계정에 없어 404 를 낸다. 확인하지 않으면 사용자가 쓸 수 없는 모델을 고르고, 그것을 저장한 뒤 대화에서 실패를 만난다. 확인에 한도
   * 부담이 없으므로 미리 걸러 주는 편이 낫다.
   */
  @Override
  public boolean probeRecommendedByDefault() {
    return true;
  }

  @Override
  protected String baseUrl() {
    return NVIDIA_BASE_URL;
  }

  @Override
  protected String chatPath() {
    return LlmApiUrlNormalizer.OPENAI_CHAT_PATH;
  }

  /** OpenRouter(4)보다 높게 잡는다. 한도 부담이 없고 확인 대상이 77개라 낮게 두면 너무 오래 걸린다. */
  @Override
  protected int probeConcurrency() {
    return 10;
  }

  /** OpenRouter(15초)보다 넉넉히 둔다. 콜드 스타트 모델이 첫 호출에 오래 걸린다. */
  @Override
  protected Duration probeTimeout() {
    return Duration.ofSeconds(30);
  }

  /** NVIDIA 목록이 100개를 넘을 수 있어 여유를 둔다. */
  @Override
  protected int probeLimit() {
    return 120;
  }

  @Override
  public List<LlmModelDTO> listSelectableModels(String apiKey) {
    log.info("📋 NVIDIA 모델 목록 조회");

    // 모델 목록 경로는 인증을 요구하지 않는다(실측: 키 없이도 200). 검증 없이 목록을 내주면 잘못된
    // 키를 넣은 사용자가 목록을 보고 키가 맞다고 오해한다.
    verifyApiKey(apiKey);

    Map<String, Object> response;
    try {
      @SuppressWarnings("unchecked")
      Map<String, Object> body =
          client(apiKey)
              .get()
              .uri(MODELS_PATH)
              .retrieve()
              .bodyToMono(Map.class)
              .timeout(Duration.ofSeconds(30))
              .block();
      response = body;
    } catch (WebClientResponseException e) {
      log.error("❌ NVIDIA 모델 목록 조회 실패 (상태코드: {})", e.getStatusCode(), e);
      if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
        throw new LlmClient.LlmClientException(
            "NVIDIA 가 이 API Key 를 거부했습니다 ("
                + e.getStatusCode().value()
                + "). build.nvidia.com 에서 발급한 nvapi- 키인지 확인해 주세요.",
            e);
      }
      throw new LlmClient.LlmClientException(
          "NVIDIA 모델 목록 조회 실패 (상태코드: " + e.getStatusCode() + ")", e);
    } catch (LlmClient.LlmClientException e) {
      throw e;
    } catch (Exception e) {
      log.error("❌ NVIDIA 모델 목록 조회 실패", e);
      throw new LlmClient.LlmClientException("NVIDIA 모델 목록 조회 실패: " + e.getMessage(), e);
    }

    if (response == null || !(response.get("data") instanceof List<?> rawList)) {
      throw new LlmClient.LlmClientException("NVIDIA 모델 목록 상항을 해석할 수 없습니다");
    }

    List<LlmModelDTO> models = new ArrayList<>();
    for (Object raw : rawList) {
      if (!(raw instanceof Map<?, ?> model)) {
        continue;
      }
      String id = String.valueOf(model.get("id"));
      if (id.isBlank() || "null".equals(id) || NON_CHAT.matcher(id).find()) {
        continue;
      }
      models.add(
          LlmModelDTO.builder().id(id).name(id).availability(Availability.UNKNOWN).build());
    }

    models.sort(Comparator.comparing(LlmModelDTO::getId));
    log.info("✅ NVIDIA 채팅 후보 {}개 (전체 {}개 중)", models.size(), rawList.size());
    return models;
  }

  @Override
  protected LlmModelDTO interpretFailure(String modelId, Throwable error) {
    WebClientResponseException e = asResponseException(error);
    if (e != null) {
      int status = e.getStatusCode().value();
      if (status == 404) {
        // NVIDIA 목록에는 있으나 이 계정에서 쓸 수 없는 모델이다. 실측에서 가장 많은 사유였다.
        return verdict(modelId, Availability.UNAVAILABLE, "이 계정에서 제공하지 않는 모델입니다 (404).");
      }
      if (status == 401 || status == 403) {
        return verdict(modelId, Availability.UNAVAILABLE, "API Key 가 거부되었습니다 (" + status + ").");
      }
      if (status == 400) {
        // 텍스트 입력을 받지 않는 모델(문서 파싱 등)이 여기로 온다.
        return verdict(modelId, Availability.UNAVAILABLE, "채팅 형식 입력을 받지 않는 모델입니다 (400).");
      }
      if (status == 429) {
        return verdict(
            modelId, Availability.RATE_LIMITED, "요청이 제한되었습니다 (429). 잠시 뒤 다시 확인해 보세요.");
      }
      if (status == 503) {
        // 그 모델의 워커가 혼잡한 상태다. 모델 자체는 쓸 수 있으므로 다시 확인할 여지를 남긴다.
        return verdict(
            modelId, Availability.RATE_LIMITED, "이 모델의 서버가 지금 붐빕니다 (503). 잠시 뒤 다시 확인해 보세요.");
      }
      return verdict(modelId, Availability.UNAVAILABLE, "호출 실패 (" + status + ").");
    }

    if (isTimeout(error)) {
      return timeoutVerdict(modelId, "처음 호출하는 모델은 준비에 시간이 걸립니다. 잠시 뒤 다시 확인해 보세요.");
    }

    log.debug("NVIDIA 가용성 확인 실패: model={}", modelId, error);
    return verdict(modelId, Availability.UNAVAILABLE, "확인 실패: " + firstLine(error.getMessage()));
  }

  /**
   * API Key 가 유효한지 확인한다.
   *
   * <p>NVIDIA 에는 키 조회 전용 경로가 없어 채팅 경로로 한 번 두드려 본다. 상항 코드로 갈린다(실측).
   *
   * <ul>
   *   <li>401·403 {@code Authorization failed} — 키가 거부됐다
   *   <li>404 {@code Not found for account} — 키는 유효하고 그 모델만 계정에 없다
   * </ul>
   *
   * <p>그래서 404 는 통지로 본다. 검증에 쓰는 모델이 이 계정에 있을 보장이 없기 때문이다.
   */
  private void verifyApiKey(String apiKey) {
    Map<String, Object> body =
        Map.of(
            "model", KEY_CHECK_MODEL,
            "messages", List.of(Map.of("role", "user", "content", "ok")),
            "max_tokens", 1);

    try {
      client(apiKey)
          .post()
          .uri(chatPath())
          .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
          .bodyValue(body)
          .retrieve()
          .bodyToMono(String.class)
          .timeout(probeTimeout())
          .block();
    } catch (WebClientResponseException e) {
      int status = e.getStatusCode().value();
      if (status == 401 || status == 403) {
        throw new LlmClient.LlmClientException(
            "NVIDIA 가 이 API Key 를 거부했습니다 ("
                + status
                + "). build.nvidia.com 에서 발급한 nvapi- 키인지 확인해 주세요.",
            e);
      }
      // 404(계정에 없는 모델)·429·503 은 키 문제가 아니다. 통지시킨다.
      log.debug("키 검증 호출이 {} 을 냈다. 키 문제는 아니므로 통지시킨다.", status);
    } catch (LlmClient.LlmClientException e) {
      throw e;
    } catch (Exception e) {
      // 시간 초과 등은 키 문제로 단정할 수 없다. 목록 조회를 막지 않는다.
      log.debug("키 검증 호출 실패. 키 문제로 단정하지 않고 통지시킨다: {}", e.getMessage());
    }
  }
}
