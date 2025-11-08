package com.testcase.testcasemanagement.service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Ollama API 클라이언트
 *
 * Ollama의 /v1/chat/completions 엔드포인트와 통신 (OpenAI 호환 API)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OllamaClient implements LlmClient {

    private final WebClient.Builder webClientBuilder;
    private final EncryptionUtil encryptionUtil;
    private final ObjectMapper objectMapper;

    @Override
    public LlmResponse chat(LlmConfig config, List<RagChatMessage> messages,
                           Double temperature, Integer maxTokens) throws LlmClientException {
        try {
            log.info("📤 Ollama API 호출: model={}, messages={}", config.getModelName(), messages.size());

            String apiKey = encryptionUtil.decrypt(config.getEncryptedApiKey());

            WebClient.Builder builder = webClientBuilder.baseUrl(config.getApiUrl());

            // Ollama는 API Key가 선택적이지만 설정되어 있으면 사용
            if (apiKey != null && !apiKey.isEmpty() && !apiKey.equals("not-required")) {
                builder.defaultHeader("Authorization", "Bearer " + apiKey);
            }

            WebClient webClient = builder.build();

            // null 값 기본값 처리
            Double finalTemperature = temperature != null ? temperature : 0.7;
            Integer finalMaxTokens = maxTokens != null ? maxTokens : 2000;

            Map<String, Object> requestBody = Map.of(
                    "model", config.getModelName(),
                    "messages", messages,
                    "temperature", finalTemperature,
                    "max_tokens", finalMaxTokens,
                    "stream", false
            );

            Map<String, Object> response = webClient.post()
                    .uri("/v1/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                throw new LlmClientException("Ollama API returned null response");
            }

            // OpenAI 형식 응답 파싱: choices[0].message.content
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new LlmClientException("No choices in Ollama API response");
            }

            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
            String content = (String) message.get("content");

            // 토큰 사용량
            Integer tokensUsed = null;
            Map<String, Object> usage = (Map<String, Object>) response.get("usage");
            if (usage != null) {
                tokensUsed = (Integer) usage.get("total_tokens");
            }

            log.info("✅ Ollama API 응답 성공: tokens={}", tokensUsed);

            return new LlmResponse(content, tokensUsed, config.getModelName());

        } catch (Exception e) {
            log.error("❌ Ollama API 호출 실패", e);
            throw new LlmClientException("Failed to call Ollama API: " + e.getMessage(), e);
        }
    }

    @Override
    public void chatStream(LlmConfig config, List<RagChatMessage> messages,
                          Double temperature, Integer maxTokens,
                          StreamCallback callback) throws LlmClientException {
        try {
            log.info("📤 Ollama API 스트리밍 호출: model={}, messages={}", config.getModelName(), messages.size());

            String apiKey = encryptionUtil.decrypt(config.getEncryptedApiKey());

            WebClient.Builder builder = webClientBuilder.baseUrl(config.getApiUrl());

            // Ollama는 API Key가 선택적이지만 설정되어 있으면 사용
            if (apiKey != null && !apiKey.isEmpty() && !apiKey.equals("not-required")) {
                builder.defaultHeader("Authorization", "Bearer " + apiKey);
            }

            WebClient webClient = builder.build();

            // null 값 기본값 처리
            Double finalTemperature = temperature != null ? temperature : 0.7;
            Integer finalMaxTokens = maxTokens != null ? maxTokens : 2000;

            Map<String, Object> requestBody = Map.of(
                    "model", config.getModelName(),
                    "messages", messages,
                    "temperature", finalTemperature,
                    "max_tokens", finalMaxTokens,
                    "stream", true
            );

            AtomicBoolean completionSent = new AtomicBoolean(false);

            // DataBuffer로 스트림을 받아서 즉시 디코딩 (실시간 스트리밍)
            Flux<String> responseFlux = webClient.post()
                    .uri("/v1/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.TEXT_EVENT_STREAM)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToFlux(DataBuffer.class)
                    .map(dataBuffer -> {
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
                    .doOnNext(chunk -> {
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
                                    Map<String, Object> data = objectMapper.readValue(jsonData, Map.class);
                                    List<Map<String, Object>> choices = (List<Map<String, Object>>) data.get("choices");

                                    if (choices != null && !choices.isEmpty()) {
                                        Map<String, Object> firstChoice = choices.get(0);
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
                    .doOnError(error -> {
                        log.error("❌ Ollama API 스트리밍 실패", error);
                    })
                    .doOnComplete(() -> {
                        log.info("✅ Ollama API 스트리밍 완료");
                        if (!completionSent.getAndSet(true)) {
                            callback.onChunk("", true);
                        }
                    })
                    .blockLast(); // 스트리밍 완료까지 대기

        } catch (Exception e) {
            log.error("❌ Ollama API 스트리밍 호출 실패", e);
            throw new LlmClientException("Failed to call Ollama API stream: " + e.getMessage(), e);
        }
    }

    @Override
    public LlmConfig.LlmProvider getSupportedProvider() {
        return LlmConfig.LlmProvider.OLLAMA;
    }
}
