package com.testcase.testcasemanagement.service.llm;

import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.config;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.fixedKey;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.mapper;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.oneMessage;
import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.stream;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import java.util.function.Function;
import org.springframework.web.reactive.function.client.WebClient;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

/**
 * 스트리밍 경로가 SSE 를 어떻게 읽는지 고정한다.
 *
 * <p>클라이언트 6종을 합치는 리팩토링에서 스트리밍은 가장 위험한 부분이다. 라인 버퍼·완료 신호 중복 방지·{@code [DONE]} 처리·{@code
 * finish_reason} 처리가 얽혀 있고, 조용히 깨져도 컴파일은 통과한다. 실사용에서는 답변이 잘리거나 완료 신호가 두 번 가는 형태로 나타나 재현이 어렵다.
 *
 * <p>지금 6종의 스트리밍 코드는 서로 같다(제공자 이름을 지우면 줄바꿈 위치만 다르다). 그래서 같은 시험을 6종에 모두 돌린다.
 */
public class LlmClientStreamingTest {

  private static final String API_KEY = "test-api-key";

  private interface ClientFactory extends Function<WebClient.Builder, LlmClient> {}

  @DataProvider(name = "제공자별")
  public Object[][] providers() {
    return new Object[][] {
      {
        LlmProvider.OPENAI,
        (ClientFactory) b -> new OpenAIClient(b, fixedKey(API_KEY), mapper()),
        "https://api.openai.com",
      },
      {
        LlmProvider.OLLAMA,
        (ClientFactory) b -> new OllamaClient(b, fixedKey(API_KEY), mapper()),
        "http://localhost:11434",
      },
      {
        LlmProvider.OPENWEBUI,
        (ClientFactory) b -> new OpenWebUIClient(b, fixedKey(API_KEY), mapper()),
        "http://localhost:3000",
      },
      {
        LlmProvider.PERPLEXITY,
        (ClientFactory) b -> new PerplexityClient(b, fixedKey(API_KEY), mapper()),
        "https://api.perplexity.ai",
      },
      {
        LlmProvider.OPENROUTER,
        (ClientFactory) b -> new OpenRouterClient(b, fixedKey(API_KEY), mapper()),
        "https://openrouter.ai",
      },
      {
        LlmProvider.NVIDIA,
        (ClientFactory) b -> new NvidiaClient(b, fixedKey(API_KEY), mapper()),
        "https://integrate.api.nvidia.com",
      },
    };
  }

  @Test(dataProvider = "제공자별", description = "SSE 청크를 순서대로 이어 붙인다")
  public void joinsChunksInOrder(LlmProvider provider, ClientFactory factory, String apiUrl) {
    LlmClientTestSupport.StreamStubExchange stub =
        stream(
            sseDelta("안"),
            sseDelta("녕"),
            sseDelta("하세요"),
            "data: [DONE]\n\n");
    LlmClient client = factory.apply(stub.builder());
    LlmClientTestSupport.RecordedStream recorded = new LlmClientTestSupport.RecordedStream();

    client.chatStream(config(provider, apiUrl, "m"), oneMessage("안녕?"), 0.5, 50, recorded);

    assertEquals(recorded.text(), "안녕하세요", provider + ": 청크를 순서대로 이어 붙인다");
    assertEquals(recorded.chunks().size(), 3, provider + ": 청크 개수");
  }

  @Test(
      dataProvider = "제공자별",
      description = "청크 경계가 줄 중간에 걸려도 줄을 온전히 읽는다")
  public void handlesChunkBoundaryInsideLine(
      LlmProvider provider, ClientFactory factory, String apiUrl) {
    // 한 줄이 두 청크에 걸쳐 도착하는 상황이다. 라인 버퍼가 없으면 앞뒤가 잘려 파싱에 실패한다.
    String full = sseDelta("반갑습니다");
    int cut = full.length() / 2;

    LlmClientTestSupport.StreamStubExchange stub =
        stream(full.substring(0, cut), full.substring(cut), "data: [DONE]\n\n");
    LlmClient client = factory.apply(stub.builder());
    LlmClientTestSupport.RecordedStream recorded = new LlmClientTestSupport.RecordedStream();

    client.chatStream(config(provider, apiUrl, "m"), oneMessage("안녕?"), 0.5, 50, recorded);

    assertEquals(recorded.text(), "반갑습니다", provider + ": 걸친 줄을 온전히 읽는다");
  }

  @Test(dataProvider = "제공자별", description = "[DONE] 을 받으면 완료를 한 번만 알린다")
  public void signalsCompletionOnceOnDone(
      LlmProvider provider, ClientFactory factory, String apiUrl) {
    LlmClientTestSupport.StreamStubExchange stub =
        stream(sseDelta("끝"), "data: [DONE]\n\n");
    LlmClient client = factory.apply(stub.builder());
    LlmClientTestSupport.RecordedStream recorded = new LlmClientTestSupport.RecordedStream();

    client.chatStream(config(provider, apiUrl, "m"), oneMessage("안녕?"), 0.5, 50, recorded);

    assertEquals(recorded.completionCount(), 1, provider + ": 완료 신호는 한 번만 간다");
  }

  @Test(
      dataProvider = "제공자별",
      description = "finish_reason 과 [DONE] 이 함께 와도 완료를 한 번만 알린다")
  public void doesNotSignalCompletionTwice(
      LlmProvider provider, ClientFactory factory, String apiUrl) {
    // 제공자가 finish_reason 을 보낸 뒤 [DONE] 까지 보내는 경우다. 둘 다 완료로 처리하면
    // 화면에서 스트리밍이 두 번 끝나 말풍선 상태가 어긋난다.
    LlmClientTestSupport.StreamStubExchange stub =
        stream(
            sseDelta("답"),
            "data: {\"choices\":[{\"delta\":{},\"finish_reason\":\"stop\"}]}\n\n",
            "data: [DONE]\n\n");
    LlmClient client = factory.apply(stub.builder());
    LlmClientTestSupport.RecordedStream recorded = new LlmClientTestSupport.RecordedStream();

    client.chatStream(config(provider, apiUrl, "m"), oneMessage("안녕?"), 0.5, 50, recorded);

    assertEquals(recorded.completionCount(), 1, provider + ": 완료 신호가 중복되지 않는다");
    assertEquals(recorded.text(), "답", provider + ": 본문");
  }

  @Test(
      dataProvider = "제공자별",
      description = "[DONE] 없이 스트림이 끝나도 완료를 알린다")
  public void signalsCompletionWhenStreamEndsWithoutDone(
      LlmProvider provider, ClientFactory factory, String apiUrl) {
    // 제공자가 [DONE] 을 보내지 않고 연결을 닫는 경우다. 완료를 알리지 않으면 화면에
    // 「입력 중」 표시가 남아 사용자가 기다린다.
    LlmClientTestSupport.StreamStubExchange stub = stream(sseDelta("끝맺음 없음"));
    LlmClient client = factory.apply(stub.builder());
    LlmClientTestSupport.RecordedStream recorded = new LlmClientTestSupport.RecordedStream();

    client.chatStream(config(provider, apiUrl, "m"), oneMessage("안녕?"), 0.5, 50, recorded);

    assertEquals(recorded.text(), "끝맺음 없음", provider + ": 본문");
    assertEquals(recorded.completionCount(), 1, provider + ": 완료를 한 번 알린다");
  }

  @Test(dataProvider = "제공자별", description = "빈 줄과 주석 줄은 건너뛴다")
  public void skipsBlankAndNonDataLines(
      LlmProvider provider, ClientFactory factory, String apiUrl) {
    LlmClientTestSupport.StreamStubExchange stub =
        stream(
            "\n",
            ": keep-alive\n\n",
            sseDelta("본문"),
            "\n\n",
            "data: [DONE]\n\n");
    LlmClient client = factory.apply(stub.builder());
    LlmClientTestSupport.RecordedStream recorded = new LlmClientTestSupport.RecordedStream();

    client.chatStream(config(provider, apiUrl, "m"), oneMessage("안녕?"), 0.5, 50, recorded);

    assertEquals(recorded.text(), "본문", provider + ": 데이터 줄만 읽는다");
  }

  @Test(
      dataProvider = "제공자별",
      description = "내용이 빈 델타는 청크로 넘기지 않는다")
  public void ignoresEmptyDeltaContent(
      LlmProvider provider, ClientFactory factory, String apiUrl) {
    LlmClientTestSupport.StreamStubExchange stub =
        stream(
            "data: {\"choices\":[{\"delta\":{\"role\":\"assistant\"}}]}\n\n",
            "data: {\"choices\":[{\"delta\":{\"content\":\"\"}}]}\n\n",
            sseDelta("실제"),
            "data: [DONE]\n\n");
    LlmClient client = factory.apply(stub.builder());
    LlmClientTestSupport.RecordedStream recorded = new LlmClientTestSupport.RecordedStream();

    client.chatStream(config(provider, apiUrl, "m"), oneMessage("안녕?"), 0.5, 50, recorded);

    assertEquals(recorded.chunks().size(), 1, provider + ": 빈 내용은 넘기지 않는다");
    assertEquals(recorded.text(), "실제", provider + ": 본문");
  }

  @Test(
      dataProvider = "제공자별",
      description = "깨진 JSON 줄이 섞여도 나머지를 계속 읽는다")
  public void survivesMalformedLine(LlmProvider provider, ClientFactory factory, String apiUrl) {
    // 스트림 중간에 해석할 수 없는 줄이 오는 경우다. 거기서 멈추면 이미 받은 답변까지 잃는다.
    LlmClientTestSupport.StreamStubExchange stub =
        stream(
            sseDelta("앞"),
            "data: {이건 JSON 이 아니다\n\n",
            sseDelta("뒤"),
            "data: [DONE]\n\n");
    LlmClient client = factory.apply(stub.builder());
    LlmClientTestSupport.RecordedStream recorded = new LlmClientTestSupport.RecordedStream();

    client.chatStream(config(provider, apiUrl, "m"), oneMessage("안녕?"), 0.5, 50, recorded);

    assertEquals(recorded.text(), "앞뒤", provider + ": 깨진 줄을 건너뛰고 계속 읽는다");
  }

  @Test(dataProvider = "제공자별", description = "스트리밍도 제공자별 주소로 POST 한다")
  public void streamsToExpectedUrl(LlmProvider provider, ClientFactory factory, String apiUrl) {
    LlmClientTestSupport.StreamStubExchange stub = stream("data: [DONE]\n\n");
    LlmClient client = factory.apply(stub.builder());

    client.chatStream(
        config(provider, apiUrl, "m"),
        oneMessage("안녕?"),
        0.5,
        50,
        new LlmClientTestSupport.RecordedStream());

    String expected = apiUrl + LlmApiUrlNormalizer.chatCompletionsPathOf(provider);
    assertEquals(stub.firstRequest().url().toString(), expected, provider + ": 스트리밍 주소");
    assertTrue(
        stub.firstRequest().headers().getAccept().stream()
            .anyMatch(m -> m.toString().contains("event-stream")),
        provider + ": Accept 에 event-stream 을 요구한다");
  }

  /** 내용 하나를 담은 SSE 데이터 줄. */
  private String sseDelta(String content) {
    return "data: {\"choices\":[{\"delta\":{\"content\":\"" + content + "\"}}]}\n\n";
  }
}
