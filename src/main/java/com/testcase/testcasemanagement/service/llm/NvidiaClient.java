package com.testcase.testcasemanagement.service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

/**
 * NVIDIA NIM API 클라이언트
 *
 * <p>NVIDIA 는 OpenAI 호환 API 를 제공하므로 요청·응답 형태가 {@link OpenAIClient} 와 같다. 다른 점은 호스트({@code
 * https://integrate.api.nvidia.com})와 키 형태({@code nvapi-})뿐이다.
 *
 * <p>NVIDIA 특유의 사정 둘을 알아 둘 만하다(실측). 첫째, {@code /v1/models} 가 돌려주는 목록의 상당수가 실제로는 이 계정에서 404 를 낸다
 * ({@code Not found for account}). 목록만으로는 쓸 수 있는 모델을 알 수 없고 호출해 봐야 안다. 둘째, 처음 호출하는 모델은 콜드 스타트로
 * 수십 초가 걸릴 수 있다. 그래서 응답 대기를 넉넉히 둔다.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NvidiaClient implements LlmClient {

  /** 이 제공자의 채팅 완성 호출 경로. baseUrl 정규화 기준이 된다. */
  private static final String CHAT_COMPLETIONS_PATH =
      LlmApiUrlNormalizer.chatCompletionsPathOf(LlmConfig.LlmProvider.NVIDIA);

  private final WebClient.Builder webClientBuilder;
  private final EncryptionUtil encryptionUtil;
  private final ObjectMapper objectMapper;

  @Override
  public LlmResponse chat(
      LlmConfig config, List<RagChatMessage> messages, Double temperature, Integer maxTokens)
      throws LlmClientException {
    try {
      log.info("📤 NVIDIA API 호출: model={}, messages={}", config.getModelName(), messages.size());

      String apiKey = encryptionUtil.decrypt(config.getEncryptedApiKey());

      WebClient webClient =
          webClientBuilder
              .baseUrl(
                  LlmApiUrlNormalizer.normalizeBaseUrl(
                      config.getApiUrl(), CHAT_COMPLETIONS_PATH))
              .defaultHeader("Authorization", "Bearer " + apiKey)
              .build();

      // null 값 기본값 처리
      Double finalTemperature = temperature != null ? temperature : 0.7;
      Integer finalMaxTokens = maxTokens != null ? maxTokens : 2000;

      Map<String, Object> requestBody =
          Map.of(
              "model", config.getModelName(),
              "messages", messages,
              "temperature", finalTemperature,
              "max_tokens", finalMaxTokens,
              "stream", false);

      @SuppressWarnings("unchecked")
      Map<String, Object> response =
          webClient
              .post()
              .uri(CHAT_COMPLETIONS_PATH)
              .contentType(MediaType.APPLICATION_JSON)
              .bodyValue(requestBody)
              .retrieve()
              .bodyToMono(Map.class)
              .block();

      if (response == null) {
        throw new LlmClientException("NVIDIA API returned null response");
      }

      // OpenAI 형식 응답 파싱: choices[0].message.content
      @SuppressWarnings("unchecked")
      List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
      if (choices == null || choices.isEmpty()) {
        throw new LlmClientException("No choices in NVIDIA API response");
      }

      Map<String, Object> firstChoice = choices.get(0);
      @SuppressWarnings("unchecked")
      Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
      String content = (String) message.get("content");

      // 토큰 사용량
      Integer tokensUsed = null;
      @SuppressWarnings("unchecked")
      Map<String, Object> usage = (Map<String, Object>) response.get("usage");
      if (usage != null) {
        tokensUsed = (Integer) usage.get("total_tokens");
      }

      log.info("✅ NVIDIA API 응답 성공: tokens={}", tokensUsed);

      return new LlmResponse(content, tokensUsed, config.getModelName());

    } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
      log.error("❌ NVIDIA API 응답 에러 (상태코드: {})", e.getStatusCode(), e);
      if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
        throw new LlmClientException(
            "NVIDIA API 인증에 실패했습니다 (401/403). 등록된 API Key가 올바르고 만료되지 않았는지 확인해 주세요.", e);
      }
      throw new LlmClientException(
          "NVIDIA API 호출 실패 (상태코드: " + e.getStatusCode() + "): "
              + "[호출 주소: "
              + LlmApiUrlNormalizer.resolveEndpoint(
                  config.getApiUrl(), CHAT_COMPLETIONS_PATH)
              + "] " + e.getResponseBodyAsString(), e);
    } catch (Exception e) {
      log.error("❌ NVIDIA API 호출 실패", e);
      throw new LlmClientException("Failed to call NVIDIA API: " + e.getMessage(), e);
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
          "📤 NVIDIA API 스트리밍 호출: model={}, messages={}", config.getModelName(), messages.size());

      String apiKey = encryptionUtil.decrypt(config.getEncryptedApiKey());

      WebClient webClient =
          webClientBuilder
              .baseUrl(
                  LlmApiUrlNormalizer.normalizeBaseUrl(
                      config.getApiUrl(), CHAT_COMPLETIONS_PATH))
              .defaultHeader("Authorization", "Bearer " + apiKey)
              .build();

      // null 값 기본값 처리
      Double finalTemperature = temperature != null ? temperature : 0.7;
      Integer finalMaxTokens = maxTokens != null ? maxTokens : 2000;

      Map<String, Object> requestBody =
          Map.of(
              "model", config.getModelName(),
              "messages", messages,
              "temperature", finalTemperature,
              "max_tokens", finalMaxTokens,
              "stream", true);

      AtomicBoolean completionSent = new AtomicBoolean(false);

      // DataBuffer로 스트림을 받아서 즉시 디코딩 (실시간 스트리밍)
      Flux<String> responseFlux =
          webClient
              .post()
              .uri(CHAT_COMPLETIONS_PATH)
              .contentType(MediaType.APPLICATION_JSON)
              .accept(MediaType.TEXT_EVENT_STREAM)
              .bodyValue(requestBody)
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

      // 라인 버퍼 처리
      final StringBuilder lineBuffer = new StringBuilder();

      responseFlux
          .doOnNext(
              chunk -> {
                try {
                  lineBuffer.append(chunk);
                  String buffer = lineBuffer.toString();

                  // 개행 문자로 분리
                  String[] lines = buffer.split("\n");

                  // 마지막 불완전한 라인은 버퍼에 유지
                  if (!buffer.endsWith("\n")) {
                    lineBuffer.setLength(0);
                    lineBuffer.append(lines[lines.length - 1]);
                    lines[lines.length - 1] = null;
                  } else {
                    lineBuffer.setLength(0);
                  }

                  for (String line : lines) {
                    if (line == null || line.trim().isEmpty()) continue;

                    // SSE 형식 파싱: "data: {...}"
                    if (line.startsWith("data: ")) {
                      String jsonData = line.substring(6).trim();

                      // "[DONE]" 신호 확인
                      if ("[DONE]".equals(jsonData)) {
                        if (!completionSent.getAndSet(true)) {
                          callback.onChunk("", true);
                        }
                        continue;
                      }

                      // JSON 파싱
                      @SuppressWarnings("unchecked")
                      Map<String, Object> data = objectMapper.readValue(jsonData, Map.class);
                      @SuppressWarnings("unchecked")
                      List<Map<String, Object>> choices =
                          (List<Map<String, Object>>) data.get("choices");

                      if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> firstChoice = choices.get(0);
                        @SuppressWarnings("unchecked")
                        Map<String, Object> delta = (Map<String, Object>) firstChoice.get("delta");

                        if (delta != null) {
                          String content = (String) delta.get("content");
                          if (content != null && !content.isEmpty()) {
                            callback.onChunk(content, false);
                            log.debug("📝 청크 수신: {}", content);
                          }
                        }

                        // finish_reason 확인
                        String finishReason = (String) firstChoice.get("finish_reason");
                        if (finishReason != null && !completionSent.getAndSet(true)) {
                          callback.onChunk("", true);
                        }
                      }
                    }
                  }
                } catch (Exception e) {
                  log.error("❌ 스트리밍 청크 처리 실패", e);
                }
              })
          .doOnError(
              error -> {
                log.error("❌ NVIDIA API 스트리밍 실패", error);
              })
          .doOnComplete(
              () -> {
                log.info("✅ NVIDIA API 스트리밍 완료");
                if (!completionSent.getAndSet(true)) {
                  callback.onChunk("", true);
                }
              })
          .blockLast(); // 스트리밍 완료까지 대기

    } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
      log.error("❌ NVIDIA API 스트리밍 응답 에러 (상태코드: {})", e.getStatusCode(), e);
      if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
        throw new LlmClientException(
            "NVIDIA API 스트리밍 인증에 실패했습니다 (401/403). 등록된 API Key가 올바르고 만료되지 않았는지 확인해 주세요.", e);
      }
      throw new LlmClientException(
          "Failed to call NVIDIA API stream (상태코드: "
              + e.getStatusCode()
              + "): "
              + "[호출 주소: "
              + LlmApiUrlNormalizer.resolveEndpoint(
                  config.getApiUrl(), CHAT_COMPLETIONS_PATH)
              + "] "
              + e.getResponseBodyAsString(),
          e);
    } catch (Exception e) {
      log.error("❌ NVIDIA API 스트리밍 호출 실패", e);
      throw new LlmClientException("Failed to call NVIDIA API stream: " + e.getMessage(), e);
    }
  }

  @Override
  public LlmConfig.LlmProvider getSupportedProvider() {
    return LlmConfig.LlmProvider.NVIDIA;
  }
}
