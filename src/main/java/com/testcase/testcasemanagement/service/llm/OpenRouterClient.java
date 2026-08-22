package com.testcase.testcasemanagement.service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * OpenRouter API 클라이언트
 *
 * <p>요청·상항 처리는 {@link OpenAiCompatibleLlmClient} 가 담당한다. 이 제공자만 자기 식별 헤더 둘을 요구하므로 그것만 여기서 붙인다.
 */
@Service
public class OpenRouterClient extends OpenAiCompatibleLlmClient {

  /** OpenRouter 가 요구하는 호출자 식별 헤더. 없으면 통계에 잡히지 않는다. */
  private static final String REFERER = "https://github.com/testcase-management-tool";

  private static final String TITLE = "Test Case Management Tool";

  public OpenRouterClient(
      WebClient.Builder webClientBuilder,
      EncryptionUtil encryptionUtil,
      ObjectMapper objectMapper) {
    super(webClientBuilder, encryptionUtil, objectMapper);
  }

  @Override
  protected String displayName() {
    return "OpenRouter";
  }

  @Override
  protected void customizeHeaders(WebClient.Builder builder) {
    builder.defaultHeader("HTTP-Referer", REFERER).defaultHeader("X-Title", TITLE);
  }

  @Override
  public LlmConfig.LlmProvider getSupportedProvider() {
    return LlmConfig.LlmProvider.OPENROUTER;
  }
}
