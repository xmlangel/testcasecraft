package com.testcase.testcasemanagement.service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * OpenWebUI API 클라이언트
 *
 * <p>요청·상항 처리는 {@link OpenAiCompatibleLlmClient} 가 담당한다. 호출 경로가 {@code /api/chat/completions} 라
 * 다른 제공자와 다르고, 그 매핑은 {@link LlmApiUrlNormalizer} 가 갖고 있다.
 *
 * <p>모델은 사용자가 세운 서버에 달려 있어 목록을 미리 알 수 없다. 그래서 모델 카탈로그가 없고 화면은 입력란만 쓴다.
 */
@Service
public class OpenWebUIClient extends OpenAiCompatibleLlmClient {

  public OpenWebUIClient(
      WebClient.Builder webClientBuilder,
      EncryptionUtil encryptionUtil,
      ObjectMapper objectMapper) {
    super(webClientBuilder, encryptionUtil, objectMapper);
  }

  @Override
  protected String displayName() {
    return "OpenWebUI";
  }

  @Override
  public LlmConfig.LlmProvider getSupportedProvider() {
    return LlmConfig.LlmProvider.OPENWEBUI;
  }
}
