package com.testcase.testcasemanagement.service.llm;

import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.config;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.failWith;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.fixedKey;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.mapper;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.ok;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.oneMessage;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.realResponse;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;
import static org.testng.Assert.expectThrows;

import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import org.springframework.http.HttpStatus;
import org.testng.annotations.Test;

/**
 * 클라이언트가 <b>상항</b>을 어떻게 해석하는지 고정한다.
 *
 * <p>상항 본문은 {@code src/test/resources/llm-responses/} 에 실제 호출로 잡아 둔 것을 쓴다. 손으로 적어 두면 실제 API 가 바뀌어도
 * 시험이 계속 통지해 거짓 통지가 된다. 그 파일은 {@code capture.sh} 로 다시 잡는다.
 *
 * <p>클라이언트 6종을 합치는 리팩토링의 안전망이다. 합친 뒤에도 같은 상항에 같은 결과를 내야 한다.
 */
public class LlmClientResponseHandlingTest {

  private static final String API_KEY = "test-api-key";

  @Test(description = "실제 NVIDIA 상항에서 본문·토큰·모델을 뽑아낸다")
  public void parsesRealNvidiaResponse() {
    LlmClientTestSupport.StubExchange stub = ok(realResponse("nvidia-chat-200.json"));
    NvidiaClient client = new NvidiaClient(stub.builder(), fixedKey(API_KEY), mapper());

    LlmClient.LlmResponse response =
        client.chat(
            config(LlmProvider.NVIDIA, "https://integrate.api.nvidia.com", "meta/llama-3.1-8b-instruct"),
            oneMessage("say ok"),
            0.5,
            5);

    assertEquals(response.getContent(), "OK", "본문");
    assertTrue(response.getTokensUsed() > 0, "토큰 수가 실린다");
    assertEquals(
        response.getModel(), "meta/llama-3.1-8b-instruct", "모델은 설정값을 그대로 돌려준다");
  }

  @Test(description = "실제 NVIDIA 403 상항은 인증 실패로 읽는다")
  public void readsRealNvidiaAuthFailure() {
    LlmClientTestSupport.StubExchange stub =
        failWith(HttpStatus.FORBIDDEN, realResponse("nvidia-chat-403-auth.json"));
    NvidiaClient client = new NvidiaClient(stub.builder(), fixedKey(API_KEY), mapper());

    LlmClient.LlmClientException e =
        expectThrows(
            LlmClient.LlmClientException.class,
            () ->
                client.chat(
                    config(LlmProvider.NVIDIA, "https://integrate.api.nvidia.com", "m"),
                    oneMessage("ok"),
                    0.5,
                    1));

    assertTrue(e.getMessage().contains("인증"), "인증 실패임을 알린다: " + e.getMessage());
  }

  @Test(description = "실제 NVIDIA 404 상항은 상태코드와 호출 주소를 함께 알린다")
  public void readsRealNvidiaNotFound() {
    LlmClientTestSupport.StubExchange stub =
        failWith(HttpStatus.NOT_FOUND, realResponse("nvidia-chat-404-account.json"));
    NvidiaClient client = new NvidiaClient(stub.builder(), fixedKey(API_KEY), mapper());

    LlmClient.LlmClientException e =
        expectThrows(
            LlmClient.LlmClientException.class,
            () ->
                client.chat(
                    config(LlmProvider.NVIDIA, "https://integrate.api.nvidia.com", "01-ai/yi-large"),
                    oneMessage("ok"),
                    0.5,
                    1));

    assertTrue(e.getMessage().contains("404"), "상태코드");
    assertTrue(
        e.getMessage().contains("integrate.api.nvidia.com/v1/chat/completions"),
        "호출 주소를 함께 싣는다. 상태코드만으로는 경로가 어긋난 것을 알 수 없다: " + e.getMessage());
  }

  @Test(description = "실제 OpenRouter 429 상항은 상태코드와 호출 주소를 함께 알린다")
  public void readsRealOpenRouterRateLimit() {
    LlmClientTestSupport.StubExchange stub =
        failWith(HttpStatus.TOO_MANY_REQUESTS, realResponse("openrouter-chat-429-account.json"));
    OpenRouterClient client = new OpenRouterClient(stub.builder(), fixedKey(API_KEY), mapper());

    LlmClient.LlmClientException e =
        expectThrows(
            LlmClient.LlmClientException.class,
            () ->
                client.chat(
                    config(LlmProvider.OPENROUTER, "https://openrouter.ai", "m"),
                    oneMessage("ok"),
                    0.5,
                    1));

    assertTrue(e.getMessage().contains("429"), "상태코드");
    assertTrue(
        e.getMessage().contains("openrouter.ai/api/v1/chat/completions"), "호출 주소");
    assertTrue(
        e.getMessage().contains("free-models-per-day"),
        "제공자가 보낸 사유를 그대로 싣는다: " + e.getMessage());
  }

  @Test(description = "상항에 choices 가 없으면 거부한다")
  public void rejectsResponseWithoutChoices() {
    LlmClientTestSupport.StubExchange stub = ok("{\"usage\":{\"total_tokens\":1}}");
    OpenAIClient client = new OpenAIClient(stub.builder(), fixedKey(API_KEY), mapper());

    LlmClient.LlmClientException e =
        expectThrows(
            LlmClient.LlmClientException.class,
            () ->
                client.chat(
                    config(LlmProvider.OPENAI, "https://api.openai.com", "m"),
                    oneMessage("ok"),
                    0.5,
                    1));

    assertTrue(e.getMessage().toLowerCase().contains("choices"), e.getMessage());
  }

  @Test(description = "토큰 사용량이 없어도 본문은 돌려준다")
  public void toleratesMissingUsage() {
    LlmClientTestSupport.StubExchange stub =
        ok("{\"choices\":[{\"message\":{\"content\":\"답\"}}]}");
    OpenAIClient client = new OpenAIClient(stub.builder(), fixedKey(API_KEY), mapper());

    LlmClient.LlmResponse response =
        client.chat(
            config(LlmProvider.OPENAI, "https://api.openai.com", "m"), oneMessage("ok"), 0.5, 1);

    assertEquals(response.getContent(), "답");
    assertEquals(response.getTokensUsed(), null, "토큰 수는 비운다");
  }

  @Test(description = "401 은 제공자마다 인증 실패로 읽는다")
  public void readsUnauthorizedAsAuthFailure() {
    LlmClientTestSupport.StubExchange stub =
        failWith(HttpStatus.UNAUTHORIZED, "{\"error\":{\"message\":\"no key\"}}");
    OpenAIClient client = new OpenAIClient(stub.builder(), fixedKey(API_KEY), mapper());

    LlmClient.LlmClientException e =
        expectThrows(
            LlmClient.LlmClientException.class,
            () ->
                client.chat(
                    config(LlmProvider.OPENAI, "https://api.openai.com", "m"),
                    oneMessage("ok"),
                    0.5,
                    1));

    assertTrue(e.getMessage().contains("401"), "상태코드를 알린다: " + e.getMessage());
    assertTrue(e.getMessage().contains("인증"), "인증 실패임을 알린다: " + e.getMessage());
  }
}
