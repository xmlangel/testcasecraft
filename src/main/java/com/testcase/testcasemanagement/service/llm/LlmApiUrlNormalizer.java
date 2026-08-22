package com.testcase.testcasemanagement.service.llm;

import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;

/**
 * LLM 제공자 API URL 정규화 유틸
 *
 * <p>각 클라이언트는 등록된 API URL 을 baseUrl 로 삼고 그 뒤에 자신의 고정 경로(예: OpenRouter 는 {@code
 * /api/v1/chat/completions})를 붙여 호출한다. 그런데 제공자 공식 문서는 대개 경로가 포함된 형태(예: {@code
 * https://openrouter.ai/api/v1})를 base URL 로 안내하기 때문에, 사용자가 문서의 값을 그대로 넣으면 경로가 두 번 붙어 404 가 된다.
 *
 * <p>이 유틸은 등록된 URL 끝에 호출 경로의 일부가 이미 들어 있으면 그 부분을 걷어내어, 어느 형태로 입력하든 같은 주소로 호출되도록 만든다.
 */
public final class LlmApiUrlNormalizer {

  private LlmApiUrlNormalizer() {}

  /** OpenRouter 가 채팅 완성을 받는 경로. */
  public static final String OPENROUTER_CHAT_PATH = "/api/v1/chat/completions";

  /** OpenAI 및 OpenAI 호환(Ollama) 채팅 완성 경로. */
  public static final String OPENAI_CHAT_PATH = "/v1/chat/completions";

  /** OpenWebUI 채팅 완성 경로. */
  public static final String OPENWEBUI_CHAT_PATH = "/api/chat/completions";

  /** Perplexity 채팅 완성 경로. */
  public static final String PERPLEXITY_CHAT_PATH = "/chat/completions";

  /**
   * 제공자가 쓰는 채팅 완성 경로를 돌려준다.
   *
   * <p>이 매핑이 정본이다. 각 클라이언트와 저장 시점 정규화가 같은 값을 참조해야 한쪽만 고쳐지는 일이 생기지 않는다.
   *
   * @param provider LLM 제공자
   * @return 앞에 {@code /} 를 포함한 호출 경로
   */
  public static String chatCompletionsPathOf(LlmProvider provider) {
    return switch (provider) {
      case OPENROUTER -> OPENROUTER_CHAT_PATH;
      case OPENAI, OLLAMA -> OPENAI_CHAT_PATH;
      case OPENWEBUI -> OPENWEBUI_CHAT_PATH;
      case PERPLEXITY -> PERPLEXITY_CHAT_PATH;
    };
  }

  /**
   * 등록된 API URL 에서 호출 경로와 겹치는 꼬리를 제거한다.
   *
   * <p>예시 (호출 경로가 {@code /api/v1/chat/completions} 인 경우)
   *
   * <ul>
   *   <li>{@code https://openrouter.ai} → {@code https://openrouter.ai}
   *   <li>{@code https://openrouter.ai/} → {@code https://openrouter.ai}
   *   <li>{@code https://openrouter.ai/api/v1} → {@code https://openrouter.ai}
   *   <li>{@code https://openrouter.ai/api/v1/chat/completions} → {@code https://openrouter.ai}
   * </ul>
   *
   * @param apiUrl 사용자가 등록한 API URL
   * @param requestPath 클라이언트가 뒤에 붙이는 고정 경로 (앞에 {@code /} 를 포함)
   * @return 정규화된 baseUrl. 입력이 비어 있으면 그대로 돌려준다.
   */
  public static String normalizeBaseUrl(String apiUrl, String requestPath) {
    if (apiUrl == null || apiUrl.isBlank()) {
      return apiUrl;
    }

    String base = apiUrl.trim();
    while (base.endsWith("/")) {
      base = base.substring(0, base.length() - 1);
    }

    // 호출 경로를 뒤에서부터 한 세그먼트씩 줄여 가며, base 끝에 이미 붙어 있는 가장 긴 부분을 걷어낸다.
    // 예: /api/v1/chat/completions → /api/v1/chat → /api/v1 → /api
    String candidate = requestPath;
    while (candidate.contains("/")) {
      if (base.toLowerCase().endsWith(candidate.toLowerCase())) {
        base = base.substring(0, base.length() - candidate.length());
        break;
      }
      int lastSlash = candidate.lastIndexOf('/');
      if (lastSlash <= 0) {
        break;
      }
      candidate = candidate.substring(0, lastSlash);
    }

    while (base.endsWith("/")) {
      base = base.substring(0, base.length() - 1);
    }
    return base;
  }

  /**
   * 실패 메시지에 실을 실제 호출 주소를 만든다.
   *
   * @param apiUrl 사용자가 등록한 API URL
   * @param requestPath 클라이언트가 뒤에 붙이는 고정 경로
   * @return 정규화된 baseUrl 과 경로를 이은 전체 주소
   */
  public static String resolveEndpoint(String apiUrl, String requestPath) {
    return normalizeBaseUrl(apiUrl, requestPath) + requestPath;
  }
}
