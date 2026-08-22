package com.testcase.testcasemanagement.service.llm;

import com.testcase.testcasemanagement.dto.llm.OpenRouterModelDTO;
import com.testcase.testcasemanagement.dto.llm.OpenRouterModelDTO.Availability;
import com.testcase.testcasemanagement.dto.llm.OpenRouterProbeResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * OpenRouter 무료 모델 카탈로그
 *
 * <p>관리자가 API Key 하나만 등록해도 고를 수 있는 무료 모델이 목록으로 보이게 한다. 두 단계로 나뉜다.
 *
 * <ol>
 *   <li>{@link #listFreeChatModels(String)} — 모델 목록을 받아 무료·채팅 가능한 것만 남긴다. 호출 1회로 끝나고 비용이 없다.
 *   <li>{@link #probeAvailability(String, Collection)} — 각 모델에 최소 요청을 보내 지금 쓸 수 있는지 본다.
 * </ol>
 *
 * <p>두 단계를 나눈 이유는 <b>한도 소진을 메타데이터로 알 수 없기</b> 때문이다. 실측으로 확인했다. OpenRouter 의 {@code
 * /models/{slug}/endpoints} 는 429 를 내는 모델에도 {@code status=0}·{@code uptime=100} 을 돌려준다. 실제로 호출해 보는 것만이
 * 유효한 판정이고, 그 호출은 무료 한도를 조금 쓰므로 사용자가 원할 때만 돌린다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OpenRouterModelCatalogService {

  /** OpenRouter 호스트. 사용자가 등록한 URL 과 무관하게 카탈로그는 공식 호스트에서 받는다. */
  private static final String OPENROUTER_BASE_URL = "https://openrouter.ai";

  private static final String MODELS_PATH = "/api/v1/models";

  /** API Key 확인 경로. 목록 경로와 달리 인증을 요구하므로 키 검증에 쓴다. */
  private static final String KEY_PATH = "/api/v1/key";

  /**
   * 가용성 확인 동시 실행 수.
   *
   * <p>낮게 잡는다. 무료 등급의 일일 요청 한도가 50건이라(실측: 429 응답의 {@code X-RateLimit-Limit})
   * 확인 자체가 한도를 태운다. 계정 한도에 걸렸을 때 이미 날아간 요청이 곧 낭비이므로, 동시 실행이 곧
   * 최악의 낭비량이다. 12 로 두면 12건을 버리고 4 로 두면 4건을 버린다. 그 대신 전수 확인이 더 오래
   * 걸린다.
   */
  private static final int PROBE_CONCURRENCY = 4;

  private static final Duration LIST_TIMEOUT = Duration.ofSeconds(30);
  /**
   * 모델 하나당 가용성 확인 제한 시간.
   *
   * <p>넉넉히 두면 느린 모델 하나가 전체 확인을 끌어 화면이 오래 멈춘다. 토큰 1개를 요청하는 호출이 15초를 넘기면 실사용에도 쓰기 어렵다고 보고 그 시점에
   * 끊는다. 초과는 못 쓰는 것과 구분해 따로 표시한다.
   */
  private static final Duration PROBE_TIMEOUT = Duration.ofSeconds(15);

  /** 가용성 확인 1회에 허용하는 최대 모델 수. 무료 한도를 한꺼번에 태우지 않도록 상한을 둔다. */
  private static final int PROBE_LIMIT = 40;

  /**
   * 모델 목록 응답을 담을 버퍼 상한.
   *
   * <p>WebClient 기본값은 256KB 인데 OpenRouter 모델 목록은 실측 689KB(421개)였다. 기본값으로 두면 디코딩 단계에서 막히고, 그 예외가 상태코드
   * 200 과 함께 올라와 원인이 응답 크기라는 것이 보이지 않는다. 모델이 늘어날 여유를 두고 4MB 로 잡는다.
   */
  private static final int MAX_RESPONSE_BYTES = 4 * 1024 * 1024;

  private final WebClient.Builder webClientBuilder;

  /**
   * 무료이면서 채팅 호출이 가능한 모델을 이름 순으로 돌려준다.
   *
   * <p>무료 판정은 슬러그의 {@code :free} 접미가 아니라 <b>가격</b>으로 한다. 실측에서 가격이 0 이지만 접미가 없는 모델이 4건 있었다({@code
   * openrouter/free} 등). 접미로 걸러내면 그 4건을 놓친다.
   *
   * <p>채팅 판정은 출력 모달리티로 한다. 출력이 텍스트만인 모델만 남기므로 음악 생성 모델({@code google/lyria-*})처럼 채팅 경로로는 502 를 내는
   * 것들이 목록에 오르지 않는다.
   *
   * @param apiKey OpenRouter API Key
   * @return 무료 채팅 모델 목록. 가용성은 모두 {@link Availability#UNKNOWN}
   */
  public List<OpenRouterModelDTO> listFreeChatModels(String apiKey) {
    log.info("📋 OpenRouter 무료 모델 목록 조회");

    // 모델 목록 경로는 인증을 요구하지 않는다(실측: 키 없이도 200). 검증 없이 목록을 내주면 잘못된 키를
    // 넣은 사용자가 목록을 보고 키가 맞다고 오해한다. 그래서 인증이 필요한 경로로 키를 먼저 확인한다.
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
              .timeout(LIST_TIMEOUT)
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
    } catch (Exception e) {
      log.error("❌ 모델 목록 조회 실패", e);
      throw new LlmClient.LlmClientException("OpenRouter 모델 목록 조회 실패: " + e.getMessage(), e);
    }

    if (response == null || !(response.get("data") instanceof List<?> rawList)) {
      throw new LlmClient.LlmClientException("OpenRouter 모델 목록 응답을 해석할 수 없습니다");
    }

    List<OpenRouterModelDTO> models = new ArrayList<>();
    for (Object raw : rawList) {
      if (!(raw instanceof Map<?, ?> model)) {
        continue;
      }
      if (!isFree(model) || !isTextOnlyOutput(model)) {
        continue;
      }
      models.add(toDto(model));
    }

    models.sort(Comparator.comparing(OpenRouterModelDTO::getId));
    log.info("✅ 무료 채팅 모델 {}개 (전체 {}개 중)", models.size(), rawList.size());
    return models;
  }

  /**
   * 각 모델에 최소 요청을 보내 지금 쓸 수 있는지 확인한다.
   *
   * <p>토큰 1개만 요청하므로 무료 한도 소모가 가장 작다. 상태는 응답 코드로 갈린다. 429 는 잠시 뒤 풀릴 수 있으므로 {@code RATE_LIMITED} 로 따로
   * 표시해, 영구적으로 못 쓰는 {@code UNAVAILABLE} 과 화면에서 구분되게 한다.
   *
   * @param apiKey OpenRouter API Key
   * @param modelIds 확인할 모델 슬러그. {@value #PROBE_LIMIT} 개를 넘으면 앞에서 자른다
   * @return 입력 순서와 무관하게 슬러그 순으로 정렬된 판정 결과
   */
  public OpenRouterProbeResponse probeAvailability(String apiKey, Collection<String> modelIds) {
    Set<String> targets = new LinkedHashSet<>();
    for (String id : modelIds) {
      if (id != null && !id.isBlank()) {
        targets.add(id.trim());
      }
      if (targets.size() >= PROBE_LIMIT) {
        break;
      }
    }
    if (targets.isEmpty()) {
      return OpenRouterProbeResponse.builder().models(List.of()).requestsSent(0).build();
    }

    log.info("🔍 OpenRouter 가용성 확인 시작: {}개 (동시 {})", targets.size(), PROBE_CONCURRENCY);

    // 429 에는 두 종류가 있고 대응이 다르다(실측으로 확인).
    //   openrouter_free_tier_daily     계정 일일 무료 요청 한도. 오늘은 어떤 무료 모델도 안 된다
    //   upstream_provider_shared_pool  그 모델의 상류 공용 풀이 일시적으로 붐빈다
    // 앞의 것을 만나면 남은 모델을 확인해도 전부 같은 429 가 나오고 한도만 더 쓴다. 그래서 그 시점에
    // 확인을 멈추고, 확인하지 못한 모델은 UNKNOWN 으로 둔다. 모델 탓이 아니므로 회색으로 막지 않는다.
    AtomicReference<String> accountLimitReset = new AtomicReference<>();
    AtomicReference<OpenRouterProbeResponse.AccountLimit> accountLimit = new AtomicReference<>();
    AtomicInteger requestsSent = new AtomicInteger();

    WebClient client = client(apiKey);
    List<OpenRouterModelDTO> results =
        Flux.fromIterable(targets)
            .flatMap(
                id -> probeOne(client, id, accountLimitReset, accountLimit, requestsSent),
                PROBE_CONCURRENCY)
            .collectList()
            .block();

    if (results == null) {
      return OpenRouterProbeResponse.builder().models(List.of()).requestsSent(0).build();
    }
    List<OpenRouterModelDTO> sorted = new ArrayList<>(results);
    sorted.sort(Comparator.comparing(OpenRouterModelDTO::getId));

    long available =
        sorted.stream().filter(m -> m.getAvailability() == Availability.AVAILABLE).count();
    if (accountLimitReset.get() != null) {
      log.warn("⚠️ 계정 일일 무료 한도 소진. 복구 예정 {}", accountLimitReset.get());
    }
    log.info(
        "✅ 가용성 확인 완료: 사용 가능 {} / 확인 {} / 실제 요청 {}",
        available,
        sorted.size(),
        requestsSent.get());
    return OpenRouterProbeResponse.builder()
        .models(sorted)
        .accountLimit(accountLimit.get())
        .requestsSent(requestsSent.get())
        .build();
  }

  private Mono<OpenRouterModelDTO> probeOne(
      WebClient client,
      String modelId,
      AtomicReference<String> accountLimitReset,
      AtomicReference<OpenRouterProbeResponse.AccountLimit> accountLimit,
      AtomicInteger requestsSent) {
    // 이미 계정 한도가 소진된 것이 확인됐으면 요청을 보내지 않는다.
    String knownReset = accountLimitReset.get();
    if (knownReset != null) {
      return Mono.just(
          verdict(
              modelId,
              Availability.ACCOUNT_LIMIT,
              "계정 일일 무료 한도가 소진되어 확인하지 못했습니다. " + resetPhrase(knownReset)));
    }

    Map<String, Object> body =
        Map.of(
            "model", modelId,
            "messages", List.of(Map.of("role", "user", "content", "ok")),
            "max_tokens", 1);

    requestsSent.incrementAndGet();

    return client
        .post()
        .uri(LlmApiUrlNormalizer.OPENROUTER_CHAT_PATH)
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(body)
        .retrieve()
        .bodyToMono(String.class)
        .timeout(PROBE_TIMEOUT)
        .map(ignored -> verdict(modelId, Availability.AVAILABLE, "사용 가능"))
        .onErrorResume(
            error -> Mono.just(toVerdict(modelId, error, accountLimitReset, accountLimit)));
  }

  private OpenRouterModelDTO toVerdict(
      String modelId,
      Throwable error,
      AtomicReference<String> accountLimitReset,
      AtomicReference<OpenRouterProbeResponse.AccountLimit> accountLimit) {
    if (error instanceof WebClientResponseException e) {
      int status = e.getStatusCode().value();
      String responseBody = e.getResponseBodyAsString();
      String detail = extractMessage(responseBody);

      if (status == 429) {
        RateLimitKind kind = classifyRateLimit(responseBody);
        if (kind.accountDaily()) {
          // 계정 단위 한도다. 다른 모델을 골라도 해결되지 않으므로 그 사실을 분명히 적는다.
          if (kind.reset() != null) {
            accountLimitReset.compareAndSet(null, kind.reset());
          } else {
            accountLimitReset.compareAndSet(null, "");
          }
          // 잔량과 초기화 시각은 429 응답 헤더에만 온다. 한 번 받은 것을 화면까지 올려 준다.
          accountLimit.compareAndSet(
              null,
              OpenRouterProbeResponse.AccountLimit.builder()
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
      // 느린 것과 못 쓰는 것은 다르다. 사유를 시간 초과로 밝혀 다시 확인해 볼 여지를 남긴다.
      return verdict(
          modelId,
          Availability.UNAVAILABLE,
          "응답 시간 초과 (" + PROBE_TIMEOUT.toSeconds() + "초). 지금 매우 느립니다. 잠시 뒤 다시 확인해 보세요.");
    }

    log.debug("가용성 확인 실패: model={}", modelId, error);
    return verdict(modelId, Availability.UNAVAILABLE, "확인 실패: " + firstLine(error.getMessage()));
  }

  private boolean isTimeout(Throwable error) {
    for (Throwable t = error; t != null; t = t.getCause()) {
      if (t instanceof java.util.concurrent.TimeoutException) {
        return true;
      }
      if (t == t.getCause()) {
        break;
      }
    }
    return false;
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
      Map<String, Object> parsed =
          new com.fasterxml.jackson.databind.ObjectMapper().readValue(responseBody, Map.class);
      if (parsed.get("error") instanceof Map<?, ?> error) {
        if (error.get("metadata") instanceof Map<?, ?> metadata
            && metadata.get("raw") != null) {
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
   * 429 응답이 계정 단위 한도인지 모델 단위 혼잡인지 가른다.
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
      Map<String, Object> parsed = new ObjectMapper().readValue(responseBody, Map.class);
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

  private OpenRouterModelDTO verdict(String modelId, Availability availability, String message) {
    return OpenRouterModelDTO.builder()
        .id(modelId)
        .availability(availability)
        .availabilityMessage(message)
        .build();
  }

  /**
   * API Key 가 유효한지 확인한다.
   *
   * @throws LlmClient.LlmClientException 키가 거부되거나 확인에 실패한 경우
   */
  private void verifyApiKey(String apiKey) {
    try {
      client(apiKey).get().uri(KEY_PATH).retrieve().bodyToMono(String.class).timeout(LIST_TIMEOUT).block();
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

  private WebClient client(String apiKey) {
    return webClientBuilder
        .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(MAX_RESPONSE_BYTES))
        .baseUrl(OPENROUTER_BASE_URL)
        .defaultHeader("Authorization", "Bearer " + apiKey)
        .defaultHeader("HTTP-Referer", "https://github.com/testcase-management-tool")
        .defaultHeader("X-Title", "Test Case Management Tool")
        .build();
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

  private OpenRouterModelDTO toDto(Map<?, ?> model) {
    boolean supportsTools =
        model.get("supported_parameters") instanceof List<?> params
            && params.stream().anyMatch(p -> "tools".equals(String.valueOf(p)));

    Integer contextLength = null;
    if (model.get("context_length") instanceof Number number) {
      contextLength = number.intValue();
    }

    return OpenRouterModelDTO.builder()
        .id(String.valueOf(model.get("id")))
        .name(model.get("name") == null ? null : String.valueOf(model.get("name")))
        .contextLength(contextLength)
        .expirationDate(
            model.get("expiration_date") == null ? null : String.valueOf(model.get("expiration_date")))
        .supportsTools(supportsTools)
        .availability(Availability.UNKNOWN)
        .build();
  }

  private String firstLine(String text) {
    if (text == null || text.isBlank()) {
      return "";
    }
    String trimmed = text.strip();
    int newline = trimmed.indexOf('\n');
    if (newline > 0) {
      trimmed = trimmed.substring(0, newline);
    }
    return trimmed.length() > 200 ? trimmed.substring(0, 200) + "…" : trimmed;
  }
}
