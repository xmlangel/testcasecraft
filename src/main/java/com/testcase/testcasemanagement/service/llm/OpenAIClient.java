package com.testcase.testcasemanagement.service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * OpenAI API 클라이언트
 *
 * <p>요청·상항 처리는 {@link OpenAiCompatibleLlmClient} 가 담당한다. 여기에는 이 제공자에만 해당하는 것만 둔다.
 */
@Service
public class OpenAIClient extends OpenAiCompatibleLlmClient {

  public OpenAIClient(
      WebClient.Builder webClientBuilder,
      EncryptionUtil encryptionUtil,
      ObjectMapper objectMapper) {
    super(webClientBuilder, encryptionUtil, objectMapper);
  }

  @Override
  protected String displayName() {
    return "OpenAI";
  }

  @Override
  public LlmConfig.LlmProvider getSupportedProvider() {
    return LlmConfig.LlmProvider.OPENAI;
  }
}
