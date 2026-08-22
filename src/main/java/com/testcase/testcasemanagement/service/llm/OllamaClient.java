package com.testcase.testcasemanagement.service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Ollama API 클라이언트
 *
 * <p>요청·상항 처리는 {@link OpenAiCompatibleLlmClient} 가 담당한다. Ollama 는 로컬에서 도는 서버라 인증이 없는 경우가 많고, 그때
 * 관리자가 API Key 칸에 {@code not-required} 를 넣어 둔다. 그 값으로 인증 헤더를 보내면 서버가 거부할 수 있어 헤더를 생략한다.
 *
 * <p>모델은 사용자가 세운 서버에 달려 있어 목록을 미리 알 수 없다. 그래서 모델 카탈로그가 없고 화면은 입력란만 쓴다.
 */
@Service
public class OllamaClient extends OpenAiCompatibleLlmClient {

  /** 인증이 필요 없는 서버에 관리자가 넣어 두는 값. */
  private static final String NO_AUTH_MARKER = "not-required";

  public OllamaClient(
      WebClient.Builder webClientBuilder,
      EncryptionUtil encryptionUtil,
      ObjectMapper objectMapper) {
    super(webClientBuilder, encryptionUtil, objectMapper);
  }

  @Override
  protected String displayName() {
    return "Ollama";
  }

  @Override
  protected boolean requiresAuthorization(String apiKey) {
    return apiKey != null && !apiKey.isEmpty() && !apiKey.equals(NO_AUTH_MARKER);
  }

  @Override
  public LlmConfig.LlmProvider getSupportedProvider() {
    return LlmConfig.LlmProvider.OLLAMA;
  }
}
