package com.testcase.testcasemanagement.service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Perplexity API 클라이언트
 *
 * <p>요청·상항 처리는 {@link OpenAiCompatibleLlmClient} 가 담당한다. 호출 경로가 {@code /chat/completions} 라 다른
 * 제공자와 다르고, 그 매핑은 {@link LlmApiUrlNormalizer} 가 갖고 있다.
 */
@Service
public class PerplexityClient extends OpenAiCompatibleLlmClient {

  public PerplexityClient(
      WebClient.Builder webClientBuilder,
      EncryptionUtil encryptionUtil,
      ObjectMapper objectMapper) {
    super(webClientBuilder, encryptionUtil, objectMapper);
  }

  @Override
  protected String displayName() {
    return "Perplexity";
  }

  @Override
  public LlmConfig.LlmProvider getSupportedProvider() {
    return LlmConfig.LlmProvider.PERPLEXITY;
  }
}
