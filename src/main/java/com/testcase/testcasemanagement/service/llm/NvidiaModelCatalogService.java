package com.testcase.testcasemanagement.service.llm;

import com.testcase.testcasemanagement.dto.llm.LlmModelDTO;
import com.testcase.testcasemanagement.dto.llm.LlmModelDTO.Availability;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeResponse;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * NVIDIA NIM 모델 카탈로그
 *
 * <p>OpenRouter 와 성질이 정반대다. 실측으로 확인한 사항이다.
 *
 * <ul>
 *   <li>{@code /v1/models} 응답에 <b>가격도 모달리티도 없다</b>({@code id}·{@code object}·{@code created}·{@code
 *       owned_by} 뿐). 무료·채팅 판정을 메타데이터로 할 수 없어 ID 패턴으로 추정한다.
 *   <li>목록에 오른 모델의 <b>상당수가 이 계정에서 404</b> 를 낸다({@code Not found for account}). 실측에서 채팅 후보 77개 중
 *       실제로 쓸 수 있는 것이 25개였다. 그래서 확인이 곧 유일한 판정 수단이다.
 *   <li>확인에 <b>한도 제약이 사실상 없다</b>. 160회 넘게 두드렸는데 429 가 한 번도 없었다. 전수 확인을 기본으로 권한다.
 *   <li>처음 호출하는 모델은 <b>콜드 스타트로 수십 초</b>가 걸린다. 실측에서 25초 제한으로 10개가 시간을 넘겼다.
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NvidiaModelCatalogService implements LlmModelCatalog {

  /** NVIDIA NIM 호스트. 사용자가 등록한 URL 과 무관하게 카탈로그는 공식 호스트에서 받는다. */
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
   * <p>응답에 모달리티가 없어 이름으로 추정한다. 추정이므로 새 모델이 나오면 어긋날 수 있는데, 가용성 확인이 실제 호출로 그것을 걸러낸다. 표본으로 검증했다.
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

  /**
   * 가용성 확인 동시 실행 수.
   *
   * <p>OpenRouter(4)보다 높게 잡는다. 한도 부담이 없고 확인 대상이 77개라 낮게 두면 너무 오래 걸린다. 실측에서 10 병렬로 43초였다.
   */
  private static final int PROBE_CONCURRENCY = 10;

  private static final Duration LIST_TIMEOUT = Duration.ofSeconds(30);

  /**
   * 모델 하나당 확인 제한 시간.
   *
   * <p>OpenRouter(15초)보다 넉넉히 둔다. 콜드 스타트 모델이 첫 호출에 오래 걸리기 때문이다. 그래도 넘기는 모델이 있는데, 그것은 실사용에서도 느리므로
   * 시간 초과로 표시해 사용자가 판단하게 한다.
   */
  private static final Duration PROBE_TIMEOUT = Duration.ofSeconds(30);

  /** 가용성 확인 1회에 허용하는 최대 모델 수. NVIDIA 목록이 100개를 넘을 수 있어 여유를 둔다. */
  private static final int PROBE_LIMIT = 120;

  private final WebClient.Builder webClientBuilder;

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
              .timeout(LIST_TIMEOUT)
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
    } catch (Exception e) {
      log.error("❌ NVIDIA 모델 목록 조회 실패", e);
      throw new LlmClient.LlmClientException("NVIDIA 모델 목록 조회 실패: " + e.getMessage(), e);
    }

    if (response == null || !(response.get("data") instanceof List<?> rawList)) {
      throw new LlmClient.LlmClientException("NVIDIA 모델 목록 응답을 해석할 수 없습니다");
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
          LlmModelDTO.builder()
              .id(id)
              .name(id)
              .availability(Availability.UNKNOWN)
              .build());
    }

    models.sort(Comparator.comparing(LlmModelDTO::getId));
    log.info("✅ NVIDIA 채팅 후보 {}개 (전체 {}개 중)", models.size(), rawList.size());
    return models;
  }

  @Override
  public LlmModelProbeResponse probeAvailability(String apiKey, Collection<String> modelIds) {
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
      return LlmModelProbeResponse.builder().models(List.of()).requestsSent(0).build();
    }

    log.info("🔍 NVIDIA 가용성 확인 시작: {}개 (동시 {})", targets.size(), PROBE_CONCURRENCY);

    AtomicInteger requestsSent = new AtomicInteger();
    WebClient client = client(apiKey);
    List<LlmModelDTO> results =
        Flux.fromIterable(targets)
            .flatMap(id -> probeOne(client, id, requestsSent), PROBE_CONCURRENCY)
            .collectList()
            .block();

    if (results == null) {
      return LlmModelProbeResponse.builder().models(List.of()).requestsSent(0).build();
    }
    List<LlmModelDTO> sorted = new ArrayList<>(results);
    sorted.sort(Comparator.comparing(LlmModelDTO::getId));

    long available =
        sorted.stream().filter(m -> m.getAvailability() == Availability.AVAILABLE).count();
    log.info("✅ NVIDIA 가용성 확인 완료: 사용 가능 {} / 확인 {}", available, sorted.size());
    return LlmModelProbeResponse.builder()
        .models(sorted)
        .requestsSent(requestsSent.get())
        .build();
  }

  /**
   * API Key 가 유효한지 확인한다.
   *
   * <p>NVIDIA 에는 키 조회 전용 경로가 없어 채팅 경로로 한 번 두드려 본다. 응답 코드로 갈린다(실측).
   *
   * <ul>
   *   <li>401·403 {@code Authorization failed} — 키가 거부됐다
   *   <li>404 {@code Not found for account} — 키는 유효하고 그 모델만 계정에 없다
   * </ul>
   *
   * <p>그래서 404 는 통과로 본다. 검증에 쓰는 모델이 이 계정에 있을 보장이 없기 때문이다. 요청 1건을 쓰지만 NVIDIA 는 확인에 한도 부담이 없다.
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
          .uri(LlmApiUrlNormalizer.OPENAI_CHAT_PATH)
          .contentType(MediaType.APPLICATION_JSON)
          .bodyValue(body)
          .retrieve()
          .bodyToMono(String.class)
          .timeout(PROBE_TIMEOUT)
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
      // 404(계정에 없는 모델)·429·503 은 키 문제가 아니다. 통과시킨다.
      log.debug("키 검증 호출이 {} 을 냈다. 키 문제는 아니므로 통과시킨다.", status);
    } catch (LlmClient.LlmClientException e) {
      throw e;
    } catch (Exception e) {
      // 시간 초과 등은 키 문제로 단정할 수 없다. 목록 조회를 막지 않는다.
      log.debug("키 검증 호출 실패. 키 문제로 단정하지 않고 통과시킨다: {}", e.getMessage());
    }
  }

  private Mono<LlmModelDTO> probeOne(
      WebClient client, String modelId, AtomicInteger requestsSent) {
    Map<String, Object> body =
        Map.of(
            "model", modelId,
            "messages", List.of(Map.of("role", "user", "content", "ok")),
            "max_tokens", 1);

    requestsSent.incrementAndGet();

    return client
        .post()
        .uri(LlmApiUrlNormalizer.OPENAI_CHAT_PATH)
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(body)
        .retrieve()
        .bodyToMono(String.class)
        .timeout(PROBE_TIMEOUT)
        .map(ignored -> verdict(modelId, Availability.AVAILABLE, "사용 가능"))
        .onErrorResume(error -> Mono.just(toVerdict(modelId, error)));
  }

  private LlmModelDTO toVerdict(String modelId, Throwable error) {
    if (error instanceof WebClientResponseException e) {
      int status = e.getStatusCode().value();

      if (status == 404) {
        // NVIDIA 목록에는 있으나 이 계정에서 쓸 수 없는 모델이다. 실측에서 가장 많은 사유였다.
        return verdict(
            modelId, Availability.UNAVAILABLE, "이 계정에서 제공하지 않는 모델입니다 (404).");
      }
      if (status == 401 || status == 403) {
        return verdict(modelId, Availability.UNAVAILABLE, "API Key 가 거부되었습니다 (" + status + ").");
      }
      if (status == 400) {
        // 텍스트 입력을 받지 않는 모델(문서 파싱 등)이 여기로 온다.
        return verdict(modelId, Availability.UNAVAILABLE, "채팅 형식 입력을 받지 않는 모델입니다 (400).");
      }
      if (status == 429) {
        return verdict(modelId, Availability.RATE_LIMITED, "요청이 제한되었습니다 (429). 잠시 뒤 다시 확인해 보세요.");
      }
      if (status == 503) {
        // 그 모델의 워커가 혼잡한 상태다. 모델 자체는 쓸 수 있으므로 다시 확인할 여지를 남긴다.
        return verdict(
            modelId, Availability.RATE_LIMITED, "이 모델의 서버가 지금 붐빕니다 (503). 잠시 뒤 다시 확인해 보세요.");
      }
      return verdict(modelId, Availability.UNAVAILABLE, "호출 실패 (" + status + ").");
    }

    if (isTimeout(error)) {
      // NVIDIA 는 처음 호출하는 모델이 콜드 스타트로 오래 걸린다. 못 쓴다는 뜻이 아니다.
      return verdict(
          modelId,
          Availability.UNAVAILABLE,
          "응답 시간 초과 ("
              + PROBE_TIMEOUT.toSeconds()
              + "초). 처음 호출하는 모델은 준비에 시간이 걸립니다. 잠시 뒤 다시 확인해 보세요.");
    }

    log.debug("NVIDIA 가용성 확인 실패: model={}", modelId, error);
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

  private LlmModelDTO verdict(String modelId, Availability availability, String message) {
    return LlmModelDTO.builder()
        .id(modelId)
        .availability(availability)
        .availabilityMessage(message)
        .build();
  }

  private WebClient client(String apiKey) {
    return webClientBuilder
        .baseUrl(NVIDIA_BASE_URL)
        .defaultHeader("Authorization", "Bearer " + apiKey)
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
