package com.testcase.testcasemanagement.service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;

/**
 * OpenAI 호환 채팅 완성 API 를 쓰는 제공자의 공통 구현.
 *
 * <p>지원하는 제공자 여섯(OpenAI·Ollama·OpenWebUI·Perplexity·OpenRouter·NVIDIA)이 모두 같은 요청·상항 형태를 쓴다. 합치기
 * 전 6개 파일의 유사도가 평균 96% 였고, 제공자 이름을 지운 뒤 남는 실제 차이는 넷뿐이었다.
 *
 * <ol>
 *   <li>호출 경로 — {@link LlmApiUrlNormalizer#chatCompletionsPathOf} 가 제공자별로 알려 준다
 *   <li>추가 헤더 — OpenRouter 가 자기 식별 헤더 둘을 요구한다. {@link #customizeHeaders} 로 연다
 *   <li>인증 헤더 조건 — Ollama 는 키가 {@code not-required} 면 헤더를 붙이지 않는다. {@link
 *       #requiresAuthorization} 로 연다
 *   <li>표시 이름 — 로그와 실패 문구에 쓴다
 * </ol>
 *
 * <p>합치기 전 커밋 10개가 클라이언트 3개 이상을 동시에 고쳤다. 같은 수정을 반복 복제해 온 이력이고, 실제로 드리프트도 생겼다. 상항 오류 메시지가 null 일
 * 때의 처리가 OpenWebUI 에만 있어 나머지 다섯은 {@code null} 이라는 문구를 사용자에게 보였다. 여기서는 모든 제공자에 적용한다.
 */
@Slf4j
public abstract class OpenAiCompatibleLlmClient implements LlmClient {

  /** 온도 기본값. 요청이 지정하지 않을 때 쓴다. */
  private static final double DEFAULT_TEMPERATURE = 0.7;

  /** 최대 토큰 기본값. 요청이 지정하지 않을 때 쓴다. */
  private static final int DEFAULT_MAX_TOKENS = 2000;

  private final WebClient.Builder webClientBuilder;
  private final EncryptionUtil encryptionUtil;
  private final ObjectMapper objectMapper;

  protected OpenAiCompatibleLlmClient(
      WebClient.Builder webClientBuilder,
      EncryptionUtil encryptionUtil,
      ObjectMapper objectMapper) {
    this.webClientBuilder = webClientBuilder;
    this.encryptionUtil = encryptionUtil;
    this.objectMapper = objectMapper;
  }

  // ── 제공자가 채우는 자리 ──────────────────────────────────────────────────

  /** 로그와 실패 문구에 쓸 이름. 예: {@code "OpenRouter"}. */
  protected abstract String displayName();

  /**
   * 제공자가 요구하는 추가 헤더를 붙인다.
   *
   * <p>기본은 아무것도 붙이지 않는다. OpenRouter 만 자기 식별 헤더를 요구한다.
   */
  protected void customizeHeaders(WebClient.Builder builder) {
    // 기본 동작 없음
  }

  /**
   * 이 키로 인증 헤더를 붙일지 정한다.
   *
   * <p>기본은 항상 붙인다. Ollama 는 로컬 서버라 키가 필요 없는 경우가 있고, 그때 관리자가 {@code not-required} 를 넣어 두므로 헤더를
   * 생략한다.
   */
  protected boolean requiresAuthorization(String apiKey) {
    return true;
  }

  // ── 공통 구현 ────────────────────────────────────────────────────────────

  /** 이 제공자의 채팅 완성 호출 경로. baseUrl 정규화 기준이 된다. */
  private String chatPath() {
    return LlmApiUrlNormalizer.chatCompletionsPathOf(getSupportedProvider());
  }

  @Override
  public LlmResponse chat(
      LlmConfig config, List<RagChatMessage> messages, Double temperature, Integer maxTokens)
      throws LlmClientException {
    try {
      log.info(
          "📤 {} API 호출: model={}, messages={}",
          displayName(),
          config.getModelName(),
          messages.size());

      WebClient webClient = buildClient(config);

      @SuppressWarnings("unchecked")
      Map<String, Object> response =
          webClient
              .post()
              .uri(chatPath())
              .contentType(MediaType.APPLICATION_JSON)
              .bodyValue(requestBody(config, messages, temperature, maxTokens, false))
              .retrieve()
              .bodyToMono(Map.class)
              .block();

      if (response == null) {
        throw new LlmClientException(displayName() + " API returned null response");
      }

      // OpenAI 형식 상항 파싱: choices[0].message.content
      @SuppressWarnings("unchecked")
      List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
      if (choices == null || choices.isEmpty()) {
        throw new LlmClientException("No choices in " + displayName() + " API response");
      }

      @SuppressWarnings("unchecked")
      Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
      String content = (String) message.get("content");

      Integer tokensUsed = null;
      @SuppressWarnings("unchecked")
      Map<String, Object> usage = (Map<String, Object>) response.get("usage");
      if (usage != null) {
        tokensUsed = (Integer) usage.get("total_tokens");
      }

      log.info("✅ {} API 상항 성공: tokens={}", displayName(), tokensUsed);
      return new LlmResponse(content, tokensUsed, config.getModelName());

    } catch (WebClientResponseException e) {
      throw responseException(config, e, false);
    } catch (LlmClientException e) {
      throw e;
    } catch (Exception e) {
      log.error("❌ {} API 호출 실패", displayName(), e);
      throw new LlmClientException(
          "Failed to call " + displayName() + " API: " + safeMessage(e), e);
    }
  }

  @Override
  public void chatStream(
      LlmConfig config,
      List<RagChatMessage> messages,
      Double temperature,
      Integer maxTokens,
      StreamCallback callback)
      throws LlmClientException {
    try {
      log.info(
          "📤 {} API 스트리밍 호출: model={}, messages={}",
          displayName(),
          config.getModelName(),
          messages.size());

      WebClient webClient = buildClient(config);
      AtomicBoolean completionSent = new AtomicBoolean(false);

      // DataBuffer 로 받아 즉시 디코딩한다. 문자열로 한 번에 받으면 스트리밍이 되지 않는다.
      Flux<String> responseFlux =
          webClient
              .post()
              .uri(chatPath())
              .contentType(MediaType.APPLICATION_JSON)
              .accept(MediaType.TEXT_EVENT_STREAM)
              .bodyValue(requestBody(config, messages, temperature, maxTokens, true))
              .retrieve()
              .bodyToFlux(DataBuffer.class)
              .map(
                  dataBuffer -> {
                    try {
                      byte[] bytes = new byte[dataBuffer.readableByteCount()];
                      dataBuffer.read(bytes);
                      return new String(bytes, StandardCharsets.UTF_8);
                    } finally {
                      DataBufferUtils.release(dataBuffer);
                    }
                  });

      // 청크 경계가 줄 중간에 걸릴 수 있으므로 완성된 줄만 처리하고 나머지는 버퍼에 남긴다.
      final StringBuilder lineBuffer = new StringBuilder();

      responseFlux
          .doOnNext(chunk -> consumeChunk(chunk, lineBuffer, completionSent, callback))
          .doOnError(error -> log.error("❌ {} API 스트리밍 실패", displayName(), error))
          .doOnComplete(
              () -> {
                log.info("✅ {} API 스트리밍 완료", displayName());
                // 제공자가 [DONE] 을 보내지 않고 연결을 닫는 경우가 있다. 완료를 알리지 않으면
                // 화면에 「입력 중」 표시가 남는다.
                if (!completionSent.getAndSet(true)) {
                  callback.onChunk("", true);
                }
              })
          .blockLast();

    } catch (WebClientResponseException e) {
      throw responseException(config, e, true);
    } catch (LlmClientException e) {
      throw e;
    } catch (Exception e) {
      log.error("❌ {} API 스트리밍 호출 실패", displayName(), e);
      throw new LlmClientException(
          "Failed to call " + displayName() + " API stream: " + safeMessage(e), e);
    }
  }

  /** 도착한 조각을 줄 단위로 갈라 SSE 로 해석한다. */
  private void consumeChunk(
      String chunk,
      StringBuilder lineBuffer,
      AtomicBoolean completionSent,
      StreamCallback callback) {
    try {
      lineBuffer.append(chunk);
      String buffer = lineBuffer.toString();
      String[] lines = buffer.split("\n");

      // 마지막 줄이 개행으로 끝나지 않으면 아직 도착하지 않은 부분이 있다. 버퍼에 남긴다.
      if (!buffer.endsWith("\n")) {
        lineBuffer.setLength(0);
        lineBuffer.append(lines[lines.length - 1]);
        lines[lines.length - 1] = null;
      } else {
        lineBuffer.setLength(0);
      }

      for (String line : lines) {
        if (line == null || line.trim().isEmpty()) {
          continue;
        }
        if (!line.startsWith("data: ")) {
          // 주석 줄(: keep-alive)이나 다른 필드는 건너뛴다.
          continue;
        }
        handleDataLine(line.substring(6).trim(), completionSent, callback);
      }
    } catch (Exception e) {
      // 한 조각이 깨져도 나머지를 계속 읽는다. 여기서 멈추면 이미 받은 답변까지 잃는다.
      log.error("❌ 스트리밍 조각 처리 실패", e);
    }
  }

  /** {@code data: } 뒤의 값 하나를 해석한다. */
  private void handleDataLine(
      String jsonData, AtomicBoolean completionSent, StreamCallback callback) {
    if ("[DONE]".equals(jsonData)) {
      if (!completionSent.getAndSet(true)) {
        callback.onChunk("", true);
      }
      return;
    }

    try {
      @SuppressWarnings("unchecked")
      Map<String, Object> data = objectMapper.readValue(jsonData, Map.class);
      @SuppressWarnings("unchecked")
      List<Map<String, Object>> choices = (List<Map<String, Object>>) data.get("choices");
      if (choices == null || choices.isEmpty()) {
        return;
      }

      Map<String, Object> firstChoice = choices.get(0);
      // 목록은 비어 있지 않은데 첫 요소가 null 인 상항을 보내는 제공자가 있다. 아래 catch 가
      // 조각 하나를 감싸고 있어 검사하지 않아도 다음 조각은 정상 처리되므로, 이 검사가 막는
      // 것은 사용자에게 보이는 문제가 아니라 로그에 쌓이는 예외 소음이다.
      if (firstChoice == null) {
        return;
      }
      @SuppressWarnings("unchecked")
      Map<String, Object> delta = (Map<String, Object>) firstChoice.get("delta");
      if (delta != null) {
        String content = (String) delta.get("content");
        if (content != null && !content.isEmpty()) {
          callback.onChunk(content, false);
          log.debug("📝 조각 수신: {}", content);
        }
      }

      // finish_reason 과 [DONE] 이 함께 오는 제공자가 있다. 둘 다 완료로 처리하면 화면에서
      // 스트리밍이 두 번 끝나 말풍선 상태가 어긋난다.
      String finishReason = (String) firstChoice.get("finish_reason");
      if (finishReason != null && !completionSent.getAndSet(true)) {
        callback.onChunk("", true);
      }
    } catch (Exception e) {
      log.error("❌ SSE 파싱 실패: {}", jsonData, e);
    }
  }

  private WebClient buildClient(LlmConfig config) {
    String apiKey = encryptionUtil.decrypt(config.getEncryptedApiKey());

    WebClient.Builder builder =
        webClientBuilder.baseUrl(
            LlmApiUrlNormalizer.normalizeBaseUrl(config.getApiUrl(), chatPath()));

    if (requiresAuthorization(apiKey)) {
      builder.defaultHeader("Authorization", "Bearer " + apiKey);
    }
    customizeHeaders(builder);
    return builder.build();
  }

  private Map<String, Object> requestBody(
      LlmConfig config,
      List<RagChatMessage> messages,
      Double temperature,
      Integer maxTokens,
      boolean stream) {
    return Map.of(
        "model", config.getModelName(),
        "messages", messages,
        "temperature", temperature != null ? temperature : DEFAULT_TEMPERATURE,
        "max_tokens", maxTokens != null ? maxTokens : DEFAULT_MAX_TOKENS,
        "stream", stream);
  }

  /**
   * 상태코드가 있는 실패를 문구로 옮긴다.
   *
   * <p>실패 문구에 <b>실제로 호출한 주소를 함께 싣는다.</b> 상태코드만으로는 경로가 어긋난 것을 알 수 없다. 등록 URL 뒤에 호출 경로가 두 번 붙어
   * 404 가 나던 회귀가 실제로 있었다.
   */
  private LlmClientException responseException(
      LlmConfig config, WebClientResponseException e, boolean streaming) {
    String label = displayName() + " API" + (streaming ? " 스트리밍" : "");
    log.error("❌ {} 상항 에러 (상태코드: {})", label, e.getStatusCode(), e);

    int status = e.getStatusCode().value();
    if (status == 401 || status == 403) {
      return new LlmClientException(
          displayName()
              + " API "
              + (streaming ? "스트리밍 " : "")
              + "인증에 실패했습니다 ("
              + status
              + "). 등록된 API Key가 올바르고 만료되지 않았는지 확인해 주세요.",
          e);
    }

    String endpoint = LlmApiUrlNormalizer.resolveEndpoint(config.getApiUrl(), chatPath());
    String prefix = displayName() + " API " + (streaming ? "스트리밍 " : "") + "호출 실패";
    return new LlmClientException(
        prefix
            + " (상태코드: "
            + e.getStatusCode()
            + "): [호출 주소: "
            + endpoint
            + "] "
            + e.getResponseBodyAsString(),
        e);
  }

  /**
   * 예외 문구가 비어 있으면 클래스 이름을 쓴다.
   *
   * <p>합치기 전에는 이 처리가 OpenWebUI 에만 있어 나머지 다섯 제공자는 사용자에게 {@code null} 이라는 문구를 보였다. 복제된 코드가 어긋난
   * 자리다.
   */
  private String safeMessage(Exception e) {
    return e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
  }
}
