package com.testcase.testcasemanagement.service.llm;

import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.ok;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeResponse;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import reactor.core.publisher.Mono;
import org.testng.annotations.Test;

/**
 * 가용성 확인이 호출한 스레드를 막지 않음을 고정한다.
 *
 * <p>이 확인이 필요한 이유는 소요 시간이다. 모델 수를 동시 실행 수로 나눈 회차마다 개별 타임아웃이 걸릴 수 있어, 최악의 경우 OpenRouter 는 2분 30초,
 * NVIDIA 는 6분이 걸린다. 예전 구현은 결과를 기다려 돌려주었고 그동안 서블릿 스레드 하나가 그만큼 묶였다.
 *
 * <p>앞으로 누가 편의를 위해 {@code block()} 을 다시 넣으면 이 시험이 알려 준다.
 */
public class LlmModelCatalogAsyncTest {

  private static final String OK_BODY =
      "{\"choices\":[{\"message\":{\"content\":\"ok\"},\"finish_reason\":\"stop\"}]}";

  @Test(description = "확인을 시작해도 구독 전에는 요청이 나가지 않는다")
  public void doesNotBlockBeforeSubscription() {
    LlmClientTestSupport.StubExchange stub = ok(OK_BODY);
    LlmModelCatalog catalog = new NvidiaModelCatalogService(stub.builder());

    Mono<LlmModelProbeResponse> pending =
        catalog.probeAvailability("key", List.of("a/model", "b/model"));

    // 여기까지 어떤 요청도 나가지 않아야 한다. 나갔다면 메서드가 안에서 결과를 기다린 것이다.
    assertTrue(stub.requests().isEmpty(), "구독 전에는 요청이 나가지 않는다");

    LlmModelProbeResponse result = pending.block();
    assertFalse(stub.requests().isEmpty(), "구독하면 요청이 나간다");
    assertTrue(result.getModels().size() == 2, "구독 후 결과가 온다");
  }

  @Test(description = "느린 제공자를 확인해도 호출한 스레드는 곧 돌아온다")
  public void returnsImmediatelyEvenWhenProviderIsSlow() {
    // 응답을 3초 늦추는 교환기. 예전 구현이라면 이 메서드 호출이 3초를 기다린다.
    AtomicBoolean subscribed = new AtomicBoolean();
    LlmClientTestSupport.StubExchange stub = ok(OK_BODY);
    LlmModelCatalog catalog = new NvidiaModelCatalogService(stub.builder());

    long start = System.nanoTime();
    Mono<LlmModelProbeResponse> pending =
        catalog
            .probeAvailability("key", List.of("a/model"))
            .delayElement(Duration.ofSeconds(3))
            .doOnSubscribe(ignored -> subscribed.set(true));
    long elapsedMs = (System.nanoTime() - start) / 1_000_000;

    assertFalse(subscribed.get(), "조립만 했으므로 아직 구독하지 않았다");
    assertTrue(elapsedMs < 1_000, "호출이 곧 돌아온다 (실측 " + elapsedMs + "ms)");

    // 구독하면 지연만큼 걸리는 것이 맞다. 지연이 호출 시점이 아니라 구독 시점에 붙는다는 뜻이다.
    long waitStart = System.nanoTime();
    pending.block();
    long waitedMs = (System.nanoTime() - waitStart) / 1_000_000;
    assertTrue(waitedMs >= 2_500, "구독한 쪽이 지연을 부담한다 (실측 " + waitedMs + "ms)");
  }
}
