package com.testcase.testcasemanagement.service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * NVIDIA NIM API 클라이언트
 *
 * <p>NVIDIA 특유의 사정 둘을 알아 둘 만하다(실측). 첫째, {@code /v1/models} 가 돌려주는 목록의 상당수가 실제로는 이 계정에서 404 를 낸다
 * ({@code Not found for account}). 목록만으로는 쓸 수 있는 모델을 알 수 없고 호출해 봐야 안다. 둘째, 처음 호출하는 모델은 콜드 스타트로
 * 수십 초가 걸릴 수 있다.
 *
 * <p>요청·상항 처리는 {@link OpenAiCompatibleLlmClient} 가 담당한다.
 */
@Service
public class NvidiaClient extends OpenAiCompatibleLlmClient {

  public NvidiaClient(
      WebClient.Builder webClientBuilder,
      EncryptionUtil encryptionUtil,
      ObjectMapper objectMapper) {
    super(webClientBuilder, encryptionUtil, objectMapper);
  }

  @Override
  protected String displayName() {
    return "NVIDIA";
  }

  @Override
  public LlmConfig.LlmProvider getSupportedProvider() {
    return LlmConfig.LlmProvider.NVIDIA;
  }
}
