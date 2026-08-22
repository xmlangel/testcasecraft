package com.testcase.testcasemanagement.service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.llm.LlmModelDTO;
import com.testcase.testcasemanagement.dto.llm.LlmModelDTO.Availability;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeResponse;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * OpenRouter 무료 모델 카탈로그
 *
 * <p>목록 상항에 가격과 모달리티가 있어 무료·채팅 판정을 메타데이터로 한다. 대신 <b>확인이 무료 일일 한도를 태운다</b>(실측 한도 50건, 무료 모델
 * 20개). 그래서 화면은 고른 모델 하나만 확인하는 것을 기본으로 한다.
 *
 * <p>한도 소진을 메타데이터로 알 수 없다는 것도 실측으로 확인했다. {@code /models/{slug}/endpoints} 는 429 를 내는 모델에도 {@code
 * status=0}·{@code uptime=100} 을 돌려주고, 정상 상항 헤더에는 한도 정보가 없다. 429 상항 헤더에만 들어 있어 한 번 걸린 뒤에야 잔량과
 * 초기화 시각을 알 수 있다.
 *
 * <p>확인 절차 자체는 {@link AbstractLlmModelCatalog} 가 담당한다.
 */
@Service
@Slf4j
public class OpenRouterModelCatalogService extends AbstractLlmModelCatalog {

  private static final String OPENROUTER_BASE_URL = "https://openrouter.ai";

  private static final String MODELS_PATH = "/api/v1/models";

  /** API Key 확인 경로. 목록 경로와 달리 인증을 요구하므로 키 검증에 쓴다. */
  private static final String KEY_PATH = "/api/v1/key";

  private final ObjectMapper objectMapper;

  /** 이번 회차에서 계정 한도에 걸렸으면 그 상태. 걸리지 않았으면 null. */
  private final AtomicReference<LlmModelProbeResponse.AccountLimit> accountLimit =
      new AtomicReference<>();

  public OpenRouterModelCatalogService(
      WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
    super(webClientBuilder);
    this.objectMapper = objectMapper;
  }

  @Override
  public LlmProvider provider() {
    return LlmProvider.OPENROUTER;
  }

  /**
   * 전수 확인을 권하지 않는다.
   *
   * <p>목록에 오른 모델은 대개 쓸 수 있고(실측: 20개 중 사용 가능 14~17개, 나머지는 일시적 혼잡), 확인 자체가 무료 일일 한도 50건을 태운다. 전수
   * 확인 한 번이 하루치의 40% 다. 쓸 모델은 하나이므로 그 하나만 확인하는 편이 낫다.
   */
  @Override
  public boolean probeRecommendedByDefault() {
    return false;
  }

  @Override
  protected String baseUrl() {
    return OPENROUTER_BASE_URL;
  }

  @Override
  protected String chatPath() {
    return LlmApiUrlNormalizer.OPENROUTER_CHAT_PATH;
  }

  /**
   * 낮게 잡는다.
   *
   * <p>확인 자체가 한도를 태우므로, 계정 한도에 걸렸을 때 이미 날아간 요청이 곧 낭비다. 동시 실행이 곧 최악의 낭비량이다. 12 로 두면 12건을 버리고 4 로
   * 두면 4건을 버린다.
   */
  @Override
  protected int probeConcurrency() {
    return 4;
  }

  /** 넉넉히 두면 느린 모델 하나가 전체 확인을 끌어 화면이 오래 멈춘다. */
  @Override
  protected Duration probeTimeout() {
    return Duration.ofSeconds(15);
  }

  /** 무료 한도를 한꺼번에 태우지 않도록 상한을 둔다. */
  @Override
  protected int probeLimit() {
    return 40;
  }

  @Override
  protected WebClient.Builder customizeClient(WebClient.Builder builder) {
    return builder
        .defaultHeader("HTTP-Referer", "https://github.com/testcase-management-tool")
        .defaultHeader("X-Title", "Test Case Management Tool");
  }

  @Override
  protected void resetProbeState() {
    accountLimit.set(null);
  }

  @Override
  protected LlmModelProbeResponse.AccountLimit accountLimit() {
    return accountLimit.get();
  }

  /**
   * 계정 한도에 이미 걸렸으면 남은 모델을 두드리지 않는다.
   *
   * <p>어차피 전부 같은 429 가 나오고 한도만 더 쓴다.
   */
  @Override
  protected LlmModelDTO skipVerdict(String modelId) {
    LlmModelProbeResponse.AccountLimit limit = accountLimit.get();
    if (limit == null) {
      return null;
    }
    return verdict(
        modelId,
        Availability.ACCOUNT_LIMIT,
        "계정 일일 무료 한도가 소진되어 확인하지 못했습니다. " + resetPhrase(limit.getResetAt()));
  }

  /**
   * 무료이면서 채팅 호출이 가능한 모델을 슬러그 순으로 돌려준다.
   *
   * <p>무료 판정은 슬러그의 {@code :free} 접미가 아니라 <b>가격</b>으로 한다. 실측에서 가격이 0 이지만 접미가 없는 모델이 4건 있었다({@code
   * openrouter/free} 등). 접미로 걸러내면 그 4건을 놓친다.
   *
   * <p>채팅 판정은 출력 모달리티로 한다. 출력이 텍스트만인 모델만 남기므로 음악 생성 모델({@code google/lyria-*})처럼 채팅 경로로는 502 를 내는
   * 것들이 목록에 오르지 않는다.
   */
  @Override
  public List<LlmModelDTO> listSelectableModels(String apiKey) {
    log.info("📋 OpenRouter 무료 모델 목록 조회");

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
      log.error("❌ 모델 목록 조회 실패 (상태코드: {})", e.getStatusCode(), e);
      if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
        throw new LlmClient.LlmClientException(
            "OpenRouter 인증에 실패했습니다 (401/403). 등록된 API Key 가 올바른지 확인해 주세요.", e);
      }
      throw new LlmClient.LlmClientException(
          "OpenRouter 모델 목록 조회 실패 (상태코드: " + e.getStatusCode() + ")", e);
    } catch (LlmClient.LlmClientException e) {
      throw e;
    } catch (Exception e) {
      log.error("❌ 모델 목록 조회 실패", e);
      throw new LlmClient.LlmClientException("OpenRouter 모델 목록 조회 실패: " + e.getMessage(), e);
    }

    if (response == null || !(response.get("data") instanceof List<?> rawList)) {
      throw new LlmClient.LlmClientException("OpenRouter 모델 목록 상항을 해석할 수 없습니다");
    }

    List<LlmModelDTO> models = new ArrayList<>();
    for (Object raw : rawList) {
      if (!(raw instanceof Map<?, ?> model)) {
        continue;
      }
      if (!isFree(model) || !isTextOnlyOutput(model)) {
        continue;
      }
      models.add(toDto(model));
    }

    models.sort(Comparator.comparing(LlmModelDTO::getId));
    log.info("✅ 무료 채팅 모델 {}개 (전체 {}개 중)", models.size(), rawList.size());
    return models;
  }

  @Override
  protected LlmModelDTO interpretFailure(String modelId, Throwable error) {
    WebClientResponseException e = asResponseException(error);
    if (e != null) {
      int status = e.getStatusCode().value();
      String responseBody = e.getResponseBodyAsString();
      String detail = extractMessage(responseBody);

      if (status == 429) {
        RateLimitKind kind = classifyRateLimit(responseBody);
        if (kind.accountDaily()) {
          // 계정 단위 한도다. 다른 모델을 골라도 해결되지 않으므로 그 사실을 분명히 적는다.
          accountLimit.compareAndSet(
              null,
              LlmModelProbeResponse.AccountLimit.builder()
                  .limit(kind.limit())
                  .remaining(kind.remaining())
                  .resetAt(kind.reset())
                  .build());
          return verdict(
              modelId,
              Availability.ACCOUNT_LIMIT,
              "계정의 일일 무료 요청 한도를 다 썼습니다. 다른 무료 모델을 골라도 해결되지 않습니다. "
                  + resetPhrase(kind.reset()));
        }
        return verdict(
            modelId,
            Availability.RATE_LIMITED,
            "이 모델의 무료 공용 풀이 지금 붐빕니다. 잠시 뒤 다시 확인하거나 다른 모델을 골라 보세요."
                + (detail.isEmpty() ? "" : " " + detail));
      }
      if (status == 401) {
        // 키 자체가 거부된 경우다. 모델 탓이 아니므로 그 사실을 밝힌다.
        return verdict(modelId, Availability.UNAVAILABLE, "API Key 가 거부되었습니다 (401).");
      }
      if (status == 403) {
        return verdict(
            modelId,
            Availability.UNAVAILABLE,
            "이 키로는 호출할 수 없는 모델입니다 (403)." + (detail.isEmpty() ? "" : " " + detail));
      }
      return verdict(
          modelId,
          Availability.UNAVAILABLE,
          "호출 실패 (" + status + ")." + (detail.isEmpty() ? "" : " " + detail));
    }

    if (isTimeout(error)) {
      return timeoutVerdict(modelId, "지금 매우 느립니다. 잠시 뒤 다시 확인해 보세요.");
    }

    log.debug("가용성 확인 실패: model={}", modelId, error);
    return verdict(modelId, Availability.UNAVAILABLE, "확인 실패: " + firstLine(error.getMessage()));
  }

  /** API Key 가 유효한지 확인한다. 목록 경로는 인증을 요구하지 않으므로 인증이 필요한 경로로 본다. */
  private void verifyApiKey(String apiKey) {
    try {
      client(apiKey)
          .get()
          .uri(KEY_PATH)
          .retrieve()
          .bodyToMono(String.class)
          .timeout(Duration.ofSeconds(30))
          .block();
    } catch (WebClientResponseException e) {
      if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
        throw new LlmClient.LlmClientException(
            "OpenRouter 가 이 API Key 를 거부했습니다 ("
                + e.getStatusCode().value()
                + "). 키를 다시 확인해 주세요.",
            e);
      }
      throw new LlmClient.LlmClientException(
          "OpenRouter API Key 확인 실패 (상태코드: " + e.getStatusCode() + ")", e);
    } catch (LlmClient.LlmClientException e) {
      throw e;
    } catch (Exception e) {
      throw new LlmClient.LlmClientException("OpenRouter API Key 확인 실패: " + e.getMessage(), e);
    }
  }

  /**
   * 429 의 두 종류를 가른 결과.
   *
   * @param accountDaily 계정 일일 한도이면 true, 모델별 혼잡이면 false
   * @param reset 계정 한도가 풀리는 시각(없으면 null)
   * @param limit 일일 한도 요청 수(없으면 null)
   * @param remaining 남은 요청 수(없으면 null)
   */
  private record RateLimitKind(
      boolean accountDaily, String reset, Integer limit, Integer remaining) {}

  /**
   * 429 상항이 계정 단위 한도인지 모델 단위 혼잡인지 가른다.
   *
   * <p>판정 근거는 {@code error.metadata.limit_source} 다. 실측값은 계정 쪽이 {@code
   * openrouter_free_tier_daily}, 모델 쪽이 {@code upstream_provider_shared_pool} 이다. 필드가 없으면 모델 쪽으로
   * 본다. 계정 한도를 잘못 단정해 확인을 멈추면 쓸 수 있는 모델을 놓치기 때문이다.
   */
  private RateLimitKind classifyRateLimit(String responseBody) {
    if (responseBody == null || responseBody.isBlank()) {
      return new RateLimitKind(false, null, null, null);
    }
    try {
      @SuppressWarnings("unchecked")
      Map<String, Object> parsed = objectMapper.readValue(responseBody, Map.class);
      if (!(parsed.get("error") instanceof Map<?, ?> error)
          || !(error.get("metadata") instanceof Map<?, ?> metadata)) {
        return new RateLimitKind(false, null, null, null);
      }
      String source = String.valueOf(metadata.get("limit_source"));
      boolean accountDaily = source != null && source.contains("free_tier_daily");

      String reset = null;
      Integer limit = null;
      Integer remaining = null;
      if (metadata.get("headers") instanceof Map<?, ?> headers) {
        reset = formatReset(headerValue(headers, "X-RateLimit-Reset"));
        limit = headerInt(headers, "X-RateLimit-Limit");
        remaining = headerInt(headers, "X-RateLimit-Remaining");
      }
      return new RateLimitKind(accountDaily, reset, limit, remaining);
    } catch (Exception e) {
      log.trace("429 본문 해석 실패", e);
      return new RateLimitKind(false, null, null, null);
    }
  }

  private String headerValue(Map<?, ?> headers, String name) {
    Object raw = headers.get(name);
    return raw == null ? null : String.valueOf(raw);
  }

  private Integer headerInt(Map<?, ?> headers, String name) {
    String raw = headerValue(headers, name);
    if (raw == null) {
      return null;
    }
    try {
      return Integer.valueOf(raw.trim());
    } catch (NumberFormatException e) {
      return null;
    }
  }

  /** epoch 밀리초를 KST 시각 문구로 바꾼다. 사용자가 언제 다시 시도할지 알 수 있게 한다. */
  private String formatReset(String epochMillis) {
    if (epochMillis == null) {
      return null;
    }
    try {
      long millis = Long.parseLong(epochMillis.trim());
      return DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
              .withZone(ZoneId.of("Asia/Seoul"))
              .format(Instant.ofEpochMilli(millis))
          + " KST";
    } catch (Exception e) {
      return null;
    }
  }

  private String resetPhrase(String reset) {
    if (reset == null || reset.isBlank()) {
      return "다음 날 한도가 초기화되거나, OpenRouter 에 크레딧을 넣으면 한도가 올라갑니다.";
    }
    return reset + " 에 한도가 초기화됩니다. 크레딧을 넣으면 한도를 바로 올릴 수 있습니다.";
  }

  /**
   * OpenRouter 오류 본문에서 사람이 읽을 문구만 뽑는다.
   *
   * <p>본문이 {@code {"error":{"message":…,"metadata":{"raw":…}}}} 형태이고, 실제 사유는 대개 {@code metadata.raw}
   * 안에 있다. 원문 JSON 을 그대로 화면에 실으면 읽히지 않으므로 문장만 남긴다.
   */
  private String extractMessage(String responseBody) {
    if (responseBody == null || responseBody.isBlank()) {
      return "";
    }
    try {
      @SuppressWarnings("unchecked")
      Map<String, Object> parsed = objectMapper.readValue(responseBody, Map.class);
      if (parsed.get("error") instanceof Map<?, ?> error) {
        if (error.get("metadata") instanceof Map<?, ?> metadata && metadata.get("raw") != null) {
          String raw = firstLine(String.valueOf(metadata.get("raw")));
          if (!raw.isEmpty() && !raw.startsWith("{")) {
            return raw;
          }
        }
        if (error.get("message") != null) {
          return firstLine(String.valueOf(error.get("message")));
        }
      }
    } catch (Exception e) {
      log.trace("오류 본문 해석 실패, 원문 첫 줄을 쓴다", e);
    }
    return firstLine(responseBody);
  }

  /** 가격이 0 이면 무료로 본다. 슬러그의 {@code :free} 접미보다 넓게 잡힌다. */
  private boolean isFree(Map<?, ?> model) {
    if (!(model.get("pricing") instanceof Map<?, ?> pricing)) {
      return false;
    }
    return isZero(pricing.get("prompt")) && isZero(pricing.get("completion"));
  }

  private boolean isZero(Object value) {
    if (value == null) {
      return false;
    }
    try {
      return Double.parseDouble(value.toString()) == 0d;
    } catch (NumberFormatException e) {
      return false;
    }
  }

  /** 출력이 텍스트뿐인 모델만 채팅 대상으로 본다. 음악·이미지 생성 모델을 걸러낸다. */
  private boolean isTextOnlyOutput(Map<?, ?> model) {
    if (!(model.get("architecture") instanceof Map<?, ?> architecture)) {
      return false;
    }
    if (!(architecture.get("output_modalities") instanceof List<?> outputs)) {
      return false;
    }
    return !outputs.isEmpty() && outputs.stream().allMatch(o -> "text".equals(String.valueOf(o)));
  }

  private LlmModelDTO toDto(Map<?, ?> model) {
    boolean supportsTools =
        model.get("supported_parameters") instanceof List<?> params
            && params.stream().anyMatch(p -> "tools".equals(String.valueOf(p)));

    Integer contextLength = null;
    if (model.get("context_length") instanceof Number number) {
      contextLength = number.intValue();
    }

    return LlmModelDTO.builder()
        .id(String.valueOf(model.get("id")))
        .name(model.get("name") == null ? null : String.valueOf(model.get("name")))
        .contextLength(contextLength)
        .expirationDate(
            model.get("expiration_date") == null
                ? null
                : String.valueOf(model.get("expiration_date")))
        .supportsTools(supportsTools)
        .availability(Availability.UNKNOWN)
        .build();
  }
}
