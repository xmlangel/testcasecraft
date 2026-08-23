package com.testcase.testcasemanagement.service.llm;

import com.testcase.testcasemanagement.dto.llm.LlmModelDTO;
import com.testcase.testcasemanagement.dto.llm.LlmModelDTO.Availability;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * 모델 카탈로그의 공통 골격.
 *
 * <p>목록을 만드는 방법은 제공자마다 크게 다르지만(OpenRouter 는 가격과 모달리티를 보고, NVIDIA 는 ID 패턴으로 추정한다) 가용성을 확인하는 절차는
 * 같다. 대상을 정리하고, 정해진 동시 실행 수로 최소 요청을 보내고, 결과를 슬러그 순으로 모아 집계한다.
 *
 * <p>제공자가 채우는 자리는 셋이다.
 *
 * <ol>
 *   <li>{@link #probeConcurrency()}·{@link #probeTimeout()}·{@link #probeLimit()} — 확인 강도. OpenRouter 는
 *       확인이 무료 일일 한도를 태우므로 낮게, NVIDIA 는 한도 부담이 없고 대상이 많아 높게 잡는다
 *   <li>{@link #interpretFailure} — 실패를 어떻게 읽을지. 같은 상태코드가 제공자마다 다른 뜻이다. NVIDIA 의 404 는 계정에 없는
 *       모델이고, OpenRouter 의 429 는 두 종류로 갈린다
 *   <li>{@link #accountLimit()} — 계정 한도 상태. 한도 개념이 없는 제공자는 비운다
 * </ol>
 */
@Slf4j
public abstract class AbstractLlmModelCatalog implements LlmModelCatalog {

  private final WebClient.Builder webClientBuilder;

  protected AbstractLlmModelCatalog(WebClient.Builder webClientBuilder) {
    this.webClientBuilder = webClientBuilder;
  }

  // ── 제공자가 채우는 자리 ──────────────────────────────────────────────────

  /** 제공자 공식 호스트. 사용자가 등록한 URL 과 무관하게 카탈로그는 여기서 받는다. */
  protected abstract String baseUrl();

  /** 확인 동시 실행 수. */
  protected abstract int probeConcurrency();

  /** 모델 하나당 확인 제한 시간. */
  protected abstract Duration probeTimeout();

  /** 한 회차에 확인할 최대 모델 수. */
  protected abstract int probeLimit();

  /** 채팅 완성 호출 경로. */
  protected abstract String chatPath();

  /**
   * 확인 실패를 판정으로 옮긴다.
   *
   * @param modelId 확인하던 모델
   * @param error 잡은 예외
   * @return 판정. 시간 초과는 {@link #timeoutVerdict} 를 쓰면 된다
   */
  protected abstract LlmModelDTO interpretFailure(String modelId, Throwable error);

  /**
   * 이번 확인에서 알아낸 계정 한도 상태.
   *
   * <p>{@link #probeAvailability} 가 끝날 때 한 번 읽는다. 한도 개념이 없는 제공자는 null 을 준다.
   */
  protected LlmModelProbeResponse.AccountLimit accountLimit() {
    return null;
  }

  /** 확인을 시작하기 전에 상태를 비운다. 회차마다 다시 세는 값이 있으면 여기서 처리한다. */
  protected void resetProbeState() {
    // 기본 동작 없음
  }

  /**
   * 이 모델을 실제로 두드리지 않고 건너뛸지 정한다.
   *
   * <p>계정 한도에 이미 걸린 것을 알았으면 남은 요청을 보내지 않는다. 어차피 같은 결과가 나오고 한도만 더 쓴다.
   *
   * @return 건너뛸 판정, 또는 두드려야 하면 null
   */
  protected LlmModelDTO skipVerdict(String modelId) {
    return null;
  }

  // ── 공통 골격 ────────────────────────────────────────────────────────────

  @Override
  public Mono<LlmModelProbeResponse> probeAvailability(
      String apiKey, Collection<String> modelIds) {
    return probeAvailability(apiKey, modelIds, null);
  }

  @Override
  public Mono<LlmModelProbeResponse> probeAvailability(
      String apiKey, Collection<String> modelIds, Runnable onEachDone) {
    // 상한에 걸려 빠진 개수를 함께 센다. 세지 않으면 요청한 모델이 결과에서 조용히 사라져,
    // 화면은 전부 확인된 것으로 보인다. 확인되지 않은 모델을 나중에 골라 채팅하면 실패한다.
    Set<String> targets = new LinkedHashSet<>();
    int skippedByLimit = 0;
    for (String id : modelIds) {
      if (id == null || id.isBlank()) {
        continue;
      }
      if (targets.size() >= probeLimit()) {
        skippedByLimit++;
        continue;
      }
      targets.add(id.trim());
    }
    if (targets.isEmpty()) {
      return Mono.just(emptyProbeResponse(skippedByLimit));
    }

    log.info(
        "🔍 {} 가용성 확인 시작: {}개 (동시 {})",
        provider().getDisplayName(),
        targets.size(),
        probeConcurrency());

    resetProbeState();
    AtomicInteger requestsSent = new AtomicInteger();
    int skipped = skippedByLimit;

    WebClient client = client(apiKey);
    return Flux.fromIterable(targets)
        .flatMap(id -> probeOne(client, id, requestsSent, onEachDone), probeConcurrency())
        .collectList()
        .map(results -> assembleProbeResponse(results, requestsSent.get(), skipped))
        .defaultIfEmpty(emptyProbeResponse(skipped));
  }

  /**
   * 진행 알림을 보낸다.
   *
   * <p>받는 쪽에서 예외가 나도 확인 자체를 멈추지 않는다. 진행률 표시가 깨지는 것과 확인이 통째로 실패하는 것은 무게가 다르다.
   */
  private void notifyDone(Runnable onEachDone) {
    if (onEachDone == null) {
      return;
    }
    try {
      onEachDone.run();
    } catch (Exception e) {
      log.warn("진행 알림 처리 실패: {}", e.getMessage());
    }
  }

  /** 확인 결과를 슬러그 순으로 정렬해 응답으로 조립한다. */
  private LlmModelProbeResponse assembleProbeResponse(
      List<LlmModelDTO> results, int requestsSent, int skippedByLimit) {
    List<LlmModelDTO> sorted = new ArrayList<>(results);
    sorted.sort(Comparator.comparing(LlmModelDTO::getId));

    long available =
        sorted.stream().filter(m -> m.getAvailability() == Availability.AVAILABLE).count();
    log.info(
        "✅ {} 가용성 확인 완료: 사용 가능 {} / 확인 {} / 실제 요청 {}",
        provider().getDisplayName(),
        available,
        sorted.size(),
        requestsSent);

    if (skippedByLimit > 0) {
      log.warn(
          "⚠️ {} 한 회차 상한 {}개를 넘어 {}개를 확인하지 못했다",
          provider().getDisplayName(),
          probeLimit(),
          skippedByLimit);
    }

    return LlmModelProbeResponse.builder()
        .models(sorted)
        .accountLimit(accountLimit())
        .requestsSent(requestsSent)
        .skippedByLimit(skippedByLimit)
        .probeLimit(probeLimit())
        .build();
  }

  /** 확인할 대상이 없을 때의 응답. 상한 때문에 빠진 개수는 그대로 전한다. */
  private LlmModelProbeResponse emptyProbeResponse(int skippedByLimit) {
    return LlmModelProbeResponse.builder()
        .models(List.of())
        .requestsSent(0)
        .skippedByLimit(skippedByLimit)
        .probeLimit(probeLimit())
        .build();
  }

  private Mono<LlmModelDTO> probeOne(
      WebClient client, String modelId, AtomicInteger requestsSent, Runnable onEachDone) {
    LlmModelDTO skip = skipVerdict(modelId);
    if (skip != null) {
      // 건너뛴 것도 진행률에 센다. 세지 않으면 이미 판정한 모델이 많을 때 진행률이 끝까지
      // 차지 않아 멈춘 것처럼 보인다.
      notifyDone(onEachDone);
      return Mono.just(skip);
    }

    Map<String, Object> body =
        Map.of(
            "model", modelId,
            "messages", List.of(Map.of("role", "user", "content", "ok")),
            "max_tokens", 1);

    requestsSent.incrementAndGet();

    return client
        .post()
        .uri(chatPath())
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(body)
        .retrieve()
        .bodyToMono(String.class)
        .timeout(probeTimeout())
        .map(ignored -> verdict(modelId, Availability.AVAILABLE, "사용 가능"))
        .onErrorResume(error -> Mono.just(interpretFailure(modelId, error)))
        .doOnNext(ignored -> notifyDone(onEachDone));
  }

  /** 이 제공자 호스트로 향하는 클라이언트. 헤더가 더 필요하면 하위 클래스가 덧붙인다. */
  protected WebClient client(String apiKey) {
    return customizeClient(
            webClientBuilder
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(maxResponseBytes()))
                .baseUrl(baseUrl())
                .defaultHeader("Authorization", "Bearer " + apiKey))
        .build();
  }

  /** 제공자가 요구하는 추가 헤더를 붙인다. */
  protected WebClient.Builder customizeClient(WebClient.Builder builder) {
    return builder;
  }

  /**
   * 상항을 담을 버퍼 상한.
   *
   * <p>WebClient 기본값은 256KB 인데 OpenRouter 모델 목록은 실측 689KB 였다. 기본값으로 두면 디코딩에서 막히고, 그 예외가 상태코드 200 과
   * 함께 올라와 원인이 크기라는 것이 보이지 않는다.
   */
  protected int maxResponseBytes() {
    return 4 * 1024 * 1024;
  }

  // ── 하위 클래스가 쓰는 도구 ────────────────────────────────────────────────

  protected LlmModelDTO verdict(String modelId, Availability availability, String message) {
    return LlmModelDTO.builder()
        .id(modelId)
        .availability(availability)
        .availabilityMessage(message)
        .build();
  }

  /** 시간 초과 판정. 못 쓴다는 뜻이 아니므로 사유에 그 사실을 적는다. */
  protected LlmModelDTO timeoutVerdict(String modelId, String hint) {
    return verdict(
        modelId,
        Availability.UNAVAILABLE,
        "상항 시간 초과 (" + probeTimeout().toSeconds() + "초). " + hint);
  }

  protected boolean isTimeout(Throwable error) {
    for (Throwable t = error; t != null; t = t.getCause()) {
      if (t instanceof TimeoutException) {
        return true;
      }
      if (t == t.getCause()) {
        break;
      }
    }
    return false;
  }

  /** 상태코드가 있는 실패면 그 예외, 아니면 null. */
  protected WebClientResponseException asResponseException(Throwable error) {
    return error instanceof WebClientResponseException e ? e : null;
  }

  protected String firstLine(String text) {
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
