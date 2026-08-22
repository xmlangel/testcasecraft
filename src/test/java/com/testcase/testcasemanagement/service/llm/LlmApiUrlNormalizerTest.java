package com.testcase.testcasemanagement.service.llm;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNull;

import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

/**
 * 등록된 API URL 의 형태가 달라도 같은 주소로 호출되는지 검증한다.
 *
 * <p>회귀 배경: 제공자 공식 문서가 base URL 을 경로 포함 형태(예: {@code https://openrouter.ai/api/v1})로 안내하는데, 클라이언트가 그
 * 값 뒤에 자신의 호출 경로를 다시 붙여 {@code /api/v1/api/v1/chat/completions} 로 요청해 404 가 났다.
 */
public class LlmApiUrlNormalizerTest {

  private static final String OPENROUTER_PATH = "/api/v1/chat/completions";
  private static final String OPENAI_PATH = "/v1/chat/completions";
  private static final String OPENWEBUI_PATH = "/api/chat/completions";
  private static final String PERPLEXITY_PATH = "/chat/completions";

  @DataProvider(name = "동일주소로수렴")
  public Object[][] convergingUrls() {
    return new Object[][] {
      // 제공자 경로, 입력 URL, 기대 최종 호출 주소
      {OPENROUTER_PATH, "https://openrouter.ai", "https://openrouter.ai/api/v1/chat/completions"},
      {
        OPENROUTER_PATH,
        "https://openrouter.ai/",
        "https://openrouter.ai/api/v1/chat/completions"
      },
      {
        OPENROUTER_PATH,
        "https://openrouter.ai/api/v1",
        "https://openrouter.ai/api/v1/chat/completions"
      },
      {
        OPENROUTER_PATH,
        "https://openrouter.ai/api/v1/",
        "https://openrouter.ai/api/v1/chat/completions"
      },
      {
        OPENROUTER_PATH,
        "  https://openrouter.ai/api/v1/chat/completions  ",
        "https://openrouter.ai/api/v1/chat/completions"
      },
      {OPENAI_PATH, "https://api.openai.com", "https://api.openai.com/v1/chat/completions"},
      {OPENAI_PATH, "https://api.openai.com/v1", "https://api.openai.com/v1/chat/completions"},
      {
        OPENWEBUI_PATH,
        "http://192.168.0.10:3000",
        "http://192.168.0.10:3000/api/chat/completions"
      },
      {
        OPENWEBUI_PATH,
        "http://192.168.0.10:3000/api",
        "http://192.168.0.10:3000/api/chat/completions"
      },
      {
        PERPLEXITY_PATH,
        "https://api.perplexity.ai",
        "https://api.perplexity.ai/chat/completions"
      },
      {
        PERPLEXITY_PATH,
        "https://api.perplexity.ai/chat/completions",
        "https://api.perplexity.ai/chat/completions"
      },
      // 게이트웨이 접두는 보존한다
      {
        OPENAI_PATH,
        "https://gw.example.com/openai/v1",
        "https://gw.example.com/openai/v1/chat/completions"
      },
    };
  }

  @Test(
      dataProvider = "동일주소로수렴",
      description = "URL 을 어떤 형태로 넣어도 호출 주소가 하나로 수렴한다")
  public void resolvesToSameEndpoint(String providerPath, String input, String expected) {
    assertEquals(
        LlmApiUrlNormalizer.resolveEndpoint(input, providerPath),
        expected,
        "입력=" + input + " 경로=" + providerPath);
  }

  @Test(description = "정규화된 baseUrl 에는 호출 경로가 남지 않는다")
  public void baseUrlHasNoRequestPath() {
    assertEquals(
        LlmApiUrlNormalizer.normalizeBaseUrl("https://openrouter.ai/api/v1", OPENROUTER_PATH),
        "https://openrouter.ai");
    assertEquals(
        LlmApiUrlNormalizer.normalizeBaseUrl(
            "https://openrouter.ai/api/v1/chat/completions", OPENROUTER_PATH),
        "https://openrouter.ai");
  }

  @Test(description = "빈 값과 null 은 그대로 돌려준다")
  public void blankInputPassesThrough() {
    assertNull(LlmApiUrlNormalizer.normalizeBaseUrl(null, OPENROUTER_PATH));
    assertEquals(LlmApiUrlNormalizer.normalizeBaseUrl("", OPENROUTER_PATH), "");
    assertEquals(LlmApiUrlNormalizer.normalizeBaseUrl("   ", OPENROUTER_PATH), "   ");
  }
}
