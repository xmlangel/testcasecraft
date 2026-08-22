package com.testcase.testcasemanagement.service.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * LLM 클라이언트 시험 보조.
 *
 * <p>클라이언트 6종을 기반 클래스로 합치는 리팩토링의 안전망이다. 두 가지를 고정한다.
 *
 * <ol>
 *   <li><b>요청</b> — 클라이언트가 만드는 URL·헤더·본문. 우리가 만드는 것이므로 외부 API 가 바뀌어도 그대로다. 합치기 전후로 같아야 한다.
 *   <li><b>상항 해석</b> — {@code src/test/resources/llm-responses/} 의 실제 상항 파일로 검집한다.
 * </ol>
 *
 * <p><b>상항을 손으로 쓰지 않는 것이 요점이다.</b> 손으로 쓴 상항은 실제 API 가 바뀌어도 시험이 계속 통지해 거짓 통지를 만든다. 그 폴더의 파일은 실제
 * 호출에서 잡은 것이고 {@code capture.sh} 로 다시 잡을 수 있다.
 */
public final class LlmClientTestSupport {

  private LlmClientTestSupport() {}

  /**
   * 상태코드와 본문을 정해 두고 답하는 교환기.
   *
   * <p>나간 요청을 모아 두므로 시험이 URL·헤더·본문을 들여다볼 수 있다.
   */
  public static final class StubExchange {

    private final List<ClientRequest> requests = new ArrayList<>();
    private final HttpStatus status;
    private final String body;

    private StubExchange(HttpStatus status, String body) {
      this.status = status;
      this.body = body;
    }

    /** 이 교환기를 물린 빌더. 클라이언트 생성자에 넣는다. */
    public WebClient.Builder builder() {
      return WebClient.builder()
          .exchangeFunction(
              request -> {
                requests.add(request);
                return Mono.just(
                    ClientResponse.create(status)
                        .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                        .body(body)
                        .build());
              });
    }

    public List<ClientRequest> requests() {
      return requests;
    }

    public ClientRequest firstRequest() {
      if (requests.isEmpty()) {
        throw new AssertionError("요청이 나가지 않았다");
      }
      return requests.get(0);
    }

    public String url() {
      return firstRequest().url().toString();
    }

    public String header(String name) {
      return firstRequest().headers().getFirst(name);
    }

    public boolean hasHeader(String name) {
      return firstRequest().headers().containsKey(name);
    }
  }

  /** 정상 상항을 돌려주는 교환기. */
  public static StubExchange ok(String body) {
    return new StubExchange(HttpStatus.OK, body);
  }

  /**
   * SSE 스트림을 여러 청크로 나눠 돌려주는 교환기.
   *
   * <p>클라이언트가 {@code bodyToFlux(DataBuffer.class)} 로 받아 줄 단위로 다시 쪼개므로, 청크 경계가 줄 중간에 걸리는 경우를 시험할 수
   * 있어야 한다. 그래서 본문을 통째로 주지 않고 넘긴 조각 그대로 흘려보낸다.
   *
   * @param chunks 흘려보낼 조각. 줄바꿈이 조각 경계에 걸쳐도 된다
   */
  public static StreamStubExchange stream(String... chunks) {
    return new StreamStubExchange(List.of(chunks));
  }

  /** SSE 스트림을 흘려보내는 교환기. */
  public static final class StreamStubExchange {

    private final List<String> chunks;
    private final List<ClientRequest> requests = new ArrayList<>();

    private StreamStubExchange(List<String> chunks) {
      this.chunks = chunks;
    }

    public WebClient.Builder builder() {
      return WebClient.builder()
          .exchangeFunction(
              request -> {
                requests.add(request);
                DataBufferFactory factory = new DefaultDataBufferFactory();
                Flux<DataBuffer> body =
                    Flux.fromIterable(chunks)
                        .map(
                            chunk ->
                                factory.wrap(chunk.getBytes(StandardCharsets.UTF_8)));
                return Mono.just(
                    ClientResponse.create(HttpStatus.OK)
                        .header("Content-Type", MediaType.TEXT_EVENT_STREAM_VALUE)
                        .body(body)
                        .build());
              });
    }

    public ClientRequest firstRequest() {
      if (requests.isEmpty()) {
        throw new AssertionError("요청이 나가지 않았다");
      }
      return requests.get(0);
    }
  }

  /** 스트리밍 콜백이 받은 것을 모아 두는 상자. */
  public static final class RecordedStream implements LlmClient.StreamCallback {

    private final List<String> chunks = new ArrayList<>();
    private int completionCount;

    @Override
    public void onChunk(String chunk, boolean isLast) {
      if (isLast) {
        completionCount++;
      } else {
        chunks.add(chunk);
      }
    }

    /** 받은 청크를 이어 붙인 전문. */
    public String text() {
      return String.join("", chunks);
    }

    public List<String> chunks() {
      return chunks;
    }

    /** 완료 신호를 몇 번 받았는지. 두 번 이상이면 중복 통지다. */
    public int completionCount() {
      return completionCount;
    }
  }

  /** 오류 상항을 돌려주는 교환기. */
  public static StubExchange failWith(HttpStatus status, String body) {
    return new StubExchange(status, body);
  }

  /**
   * 실제로 잡아 둔 상항 파일을 읽는다.
   *
   * @param fileName {@code src/test/resources/llm-responses/} 안의 파일명
   */
  public static String realResponse(String fileName) {
    String path = "/llm-responses/" + fileName;
    try (InputStream in = LlmClientTestSupport.class.getResourceAsStream(path)) {
      if (in == null) {
        throw new AssertionError(
            "실제 상항 파일이 없다: "
                + path
                + ". src/test/resources/llm-responses/capture.sh 로 잡는다.");
      }
      return new String(in.readAllBytes(), StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new AssertionError("상항 파일을 읽지 못했다: " + path, e);
    }
  }

  /** 복호화가 고정된 키를 돌려주는 암호화 유틸. */
  public static EncryptionUtil fixedKey(String key) {
    EncryptionUtil util = Mockito.mock(EncryptionUtil.class);
    Mockito.when(util.decrypt(Mockito.anyString())).thenReturn(key);
    Mockito.when(util.isEncryptionKeyConfigured()).thenReturn(true);
    return util;
  }

  public static ObjectMapper mapper() {
    return new ObjectMapper();
  }

  /** 시험용 설정. */
  public static LlmConfig config(LlmConfig.LlmProvider provider, String apiUrl, String model) {
    LlmConfig config = new LlmConfig();
    config.setProvider(provider);
    config.setApiUrl(apiUrl);
    config.setModelName(model);
    config.setEncryptedApiKey("encrypted-value");
    return config;
  }

  public static List<RagChatMessage> oneMessage(String content) {
    return List.of(RagChatMessage.builder().role("user").content(content).build());
  }
}
