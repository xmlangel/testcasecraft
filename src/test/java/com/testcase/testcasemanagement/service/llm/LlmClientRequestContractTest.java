package com.testcase.testcasemanagement.service.llm;

import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.config;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.fixedKey;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.mapper;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.ok;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.oneMessage;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import java.util.function.Function;
import org.springframework.web.reactive.function.client.WebClient;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

/**
 * 클라이언트가 만드는 <b>요청</b>을 고정한다.
 *
 * <p>클라이언트 6종을 기반 클래스로 합치는 리팩토링의 안전망이다. 합친 뒤에도 각 제공자가 같은 URL·헤더·본문을 보내야 한다.
 *
 * <p>요청은 우리가 만드는 것이므로 외부 API 가 바뀌어도 이 시험은 흔들리지 않는다. 그래서 손으로 적어 둘 값이 없고 유지보수 부담도 없다. 요청 형태를
 * 의도적으로 바꿀 때만 이 시험이 실패하고, 그때 고치는 것이 곧 의도의 기록이 된다.
 *
 * <p>실측 근거 — 지금 6종의 실제 차이는 넷뿐이다(제공자 값 · OpenRouter 추가 헤더 2개 · Ollama 인증 헤더 생략 · OpenWebUI 널 처리).
 * 나머지는 포매터가 줄을 다르게 접은 것이다. 그래서 합칠 수 있다고 판단했고, 이 시험이 그 넷을 지킨다.
 */
public class LlmClientRequestContractTest {

  private static final String API_KEY = "test-api-key";

  /** 제공자마다 클라이언트를 만드는 방법. 생성자 인자가 같아 함수 하나로 표현된다. */
  private interface ClientFactory extends Function<WebClient.Builder, LlmClient> {}

  @DataProvider(name = "제공자별_요청계약")
  public Object[][] contracts() {
    return new Object[][] {
      // 제공자, 클라이언트 생성, 등록 URL, 기대 호출 주소
      {
        LlmProvider.OPENAI,
        (ClientFactory) b -> new OpenAIClient(b, fixedKey(API_KEY), mapper()),
        "https://api.openai.com",
        "https://api.openai.com/v1/chat/completions",
      },
      {
        LlmProvider.OLLAMA,
        (ClientFactory) b -> new OllamaClient(b, fixedKey(API_KEY), mapper()),
        "http://localhost:11434",
        "http://localhost:11434/v1/chat/completions",
      },
      {
        LlmProvider.OPENWEBUI,
        (ClientFactory) b -> new OpenWebUIClient(b, fixedKey(API_KEY), mapper()),
        "http://localhost:3000",
        "http://localhost:3000/api/chat/completions",
      },
      {
        LlmProvider.PERPLEXITY,
        (ClientFactory) b -> new PerplexityClient(b, fixedKey(API_KEY), mapper()),
        "https://api.perplexity.ai",
        "https://api.perplexity.ai/chat/completions",
      },
      {
        LlmProvider.OPENROUTER,
        (ClientFactory) b -> new OpenRouterClient(b, fixedKey(API_KEY), mapper()),
        "https://openrouter.ai",
        "https://openrouter.ai/api/v1/chat/completions",
      },
      {
        LlmProvider.NVIDIA,
        (ClientFactory) b -> new NvidiaClient(b, fixedKey(API_KEY), mapper()),
        "https://integrate.api.nvidia.com",
        "https://integrate.api.nvidia.com/v1/chat/completions",
      },
    };
  }

  @Test(dataProvider = "제공자별_요청계약", description = "제공자마다 정해진 주소로 POST 한다")
  public void callsExpectedUrl(
      LlmProvider provider, ClientFactory factory, String apiUrl, String expectedUrl) {
    LlmClientTestSupport.StubExchange stub = ok(minimalChatResponse());
    LlmClient client = factory.apply(stub.builder());

    client.chat(config(provider, apiUrl, "test-model"), oneMessage("안녕"), 0.5, 100);

    assertEquals(stub.requests().size(), 1, provider + ": 요청이 한 번 나간다");
    assertEquals(stub.url(), expectedUrl, provider + ": 호출 주소");
    assertEquals(stub.firstRequest().method().name(), "POST", provider + ": 메서드");
  }

  @Test(
      dataProvider = "제공자별_요청계약",
      description = "등록 URL 에 호출 경로가 이미 붙어 있어도 주소가 같다")
  public void normalizesRedundantPath(
      LlmProvider provider, ClientFactory factory, String apiUrl, String expectedUrl) {
    String path = LlmApiUrlNormalizer.chatCompletionsPathOf(provider);

    LlmClientTestSupport.StubExchange stub = ok(minimalChatResponse());
    LlmClient client = factory.apply(stub.builder());

    // 사용자가 제공자 문서의 base URL(경로 포함)을 그대로 넣은 상황이다. 이 회귀가 실제로 있었다.
    client.chat(config(provider, apiUrl + path, "test-model"), oneMessage("안녕"), 0.5, 100);

    assertEquals(stub.url(), expectedUrl, provider + ": 경로가 두 번 붙지 않는다");
  }

  @Test(dataProvider = "제공자별_요청계약", description = "요청 본문에 담기는 값이 정해져 있다")
  public void sendsExpectedBody(
      LlmProvider provider, ClientFactory factory, String apiUrl, String expectedUrl) {
    LlmClientTestSupport.StubExchange stub = ok(minimalChatResponse());
    LlmClient client = factory.apply(stub.builder());

    client.chat(config(provider, apiUrl, "my-model"), oneMessage("안녕"), 0.25, 321);

    // 본문은 WebClient 가 직렬화하므로 여기서는 값이 실렸다는 사실만 본다. 직렬화 결과 자체는
    // 상항 해석 시험이 다룬다.
    assertEquals(
        stub.firstRequest().headers().getContentType().toString(),
        "application/json",
        provider + ": Content-Type");
  }

  @Test(description = "OpenRouter 는 제공자가 요구하는 식별 헤더를 함께 보낸다")
  public void openRouterSendsIdentityHeaders() {
    LlmClientTestSupport.StubExchange stub = ok(minimalChatResponse());
    LlmClient client = new OpenRouterClient(stub.builder(), fixedKey(API_KEY), mapper());

    client.chat(
        config(LlmProvider.OPENROUTER, "https://openrouter.ai", "m"), oneMessage("안녕"), 0.5, 10);

    assertEquals(
        stub.header("HTTP-Referer"), "https://github.com/testcase-management-tool", "HTTP-Referer");
    assertEquals(stub.header("X-Title"), "Test Case Management Tool", "X-Title");
  }

  @Test(
      dataProvider = "제공자별_요청계약",
      description = "OpenRouter 식별 헤더는 다른 제공자에 붙지 않는다")
  public void otherProvidersDoNotSendOpenRouterHeaders(
      LlmProvider provider, ClientFactory factory, String apiUrl, String expectedUrl) {
    if (provider == LlmProvider.OPENROUTER) {
      return;
    }
    LlmClientTestSupport.StubExchange stub = ok(minimalChatResponse());
    LlmClient client = factory.apply(stub.builder());

    client.chat(config(provider, apiUrl, "m"), oneMessage("안녕"), 0.5, 10);

    assertFalse(stub.hasHeader("HTTP-Referer"), provider + ": HTTP-Referer 를 보내지 않는다");
    assertFalse(stub.hasHeader("X-Title"), provider + ": X-Title 을 보내지 않는다");
  }

  @Test(dataProvider = "제공자별_요청계약", description = "키가 있으면 인증 헤더를 보낸다")
  public void sendsAuthorizationHeader(
      LlmProvider provider, ClientFactory factory, String apiUrl, String expectedUrl) {
    LlmClientTestSupport.StubExchange stub = ok(minimalChatResponse());
    LlmClient client = factory.apply(stub.builder());

    client.chat(config(provider, apiUrl, "m"), oneMessage("안녕"), 0.5, 10);

    assertEquals(stub.header("Authorization"), "Bearer " + API_KEY, provider + ": 인증 헤더");
  }

  @Test(description = "Ollama 는 키가 not-required 면 인증 헤더를 보내지 않는다")
  public void ollamaOmitsAuthorizationWhenNotRequired() {
    LlmClientTestSupport.StubExchange stub = ok(minimalChatResponse());
    LlmClient client =
        new OllamaClient(stub.builder(), fixedKey("not-required"), mapper());

    client.chat(
        config(LlmProvider.OLLAMA, "http://localhost:11434", "m"), oneMessage("안녕"), 0.5, 10);

    assertFalse(stub.hasHeader("Authorization"), "인증 헤더를 붙이지 않는다");
  }

  @Test(dataProvider = "제공자별_요청계약", description = "제공자를 스스로 밝힌다")
  public void reportsSupportedProvider(
      LlmProvider provider, ClientFactory factory, String apiUrl, String expectedUrl) {
    LlmClient client = factory.apply(ok(minimalChatResponse()).builder());
    assertEquals(client.getSupportedProvider(), provider);
  }

  @Test(description = "제공자 6종이 모두 클라이언트를 가진다")
  public void everyProviderHasClient() {
    for (LlmProvider provider : LlmProvider.values()) {
      boolean found = false;
      for (Object[] row : contracts()) {
        if (row[0] == provider) {
          found = true;
          break;
        }
      }
      assertTrue(found, provider + " 에 대응하는 클라이언트 계약이 없다. 제공자를 더했으면 이 시험도 늘린다.");
    }
  }

  /** 파싱을 통과할 최소 상항. 상항 해석 자체는 실제 상항 파일을 쓰는 시험이 다룬다. */
  private String minimalChatResponse() {
    return "{\"choices\":[{\"message\":{\"content\":\"ok\"}}],\"usage\":{\"total_tokens\":1}}";
  }
}
