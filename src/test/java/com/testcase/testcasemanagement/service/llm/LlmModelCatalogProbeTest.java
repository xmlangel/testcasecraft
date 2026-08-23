package com.testcase.testcasemanagement.service.llm;

import static com.testcase.testcasemanagement.service.llm.LlmClientTestSupport.ok;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

/**
 * 모델 가용성 확인의 한 회차 상한 처리를 고정한다.
 *
 * <p>상한을 넘은 모델은 확인 대상에서 빠진다. 그 개수를 응답에 담지 않으면 요청한 모델이 결과에서 조용히 사라져, 화면은 전부 확인된 것으로 보인다. 확인되지 않은 모델을
 * 나중에 골라 채팅하면 실패하고 원인을 되짚기 어렵다.
 *
 * <p>이 시험은 QA 3축 감사에서 확정된 결함(부정 축 P0-2)의 회귀를 막는다.
 */
public class LlmModelCatalogProbeTest {

  // 시험에서는 결과를 확인해야 하므로 block() 으로 기다린다. 제품 코드는 Mono 를 그대로 컨트롤러까지
  // 올려 서블릿 스레드를 막지 않는다.

  /** 확인 요청에 성공 응답을 주는 스텁 본문. 제공자마다 형태가 다르지만 성공 여부만 보므로 최소로 둔다. */
  private static final String OK_BODY =
      "{\"choices\":[{\"message\":{\"content\":\"ok\"},\"finish_reason\":\"stop\"}]}";

  @DataProvider(name = "카탈로그별")
  public Object[][] catalogs() {
    ObjectMapper mapper = new ObjectMapper();
    return new Object[][] {
      {"OpenRouter", 40, (CatalogFactory) b -> new OpenRouterModelCatalogService(b, mapper)},
      {"NVIDIA", 120, (CatalogFactory) b -> new NvidiaModelCatalogService(b)},
    };
  }

  @Test(
      dataProvider = "카탈로그별",
      description = "상한을 넘으면 넘긴 개수를 응답에 담는다")
  public void reportsModelsSkippedByLimit(String label, int limit, CatalogFactory factory) {
    LlmClientTestSupport.StubExchange stub = ok(OK_BODY);
    LlmModelCatalog catalog = factory.apply(stub.builder());

    int over = 5;
    LlmModelProbeResponse response =
        catalog.probeAvailability("key", modelIds(limit + over)).block();

    assertEquals(response.getModels().size(), limit, label + ": 상한만큼만 확인한다");
    assertEquals(
        response.getSkippedByLimit().intValue(),
        over,
        label + ": 넘긴 개수를 그대로 전한다");
    assertEquals(
        response.getProbeLimit().intValue(), limit, label + ": 상한 값을 함께 전한다");
  }

  @Test(
      dataProvider = "카탈로그별",
      description = "상한 안이면 넘긴 개수가 0 이다")
  public void reportsZeroWhenWithinLimit(String label, int limit, CatalogFactory factory) {
    LlmClientTestSupport.StubExchange stub = ok(OK_BODY);
    LlmModelCatalog catalog = factory.apply(stub.builder());

    LlmModelProbeResponse response = catalog.probeAvailability("key", modelIds(3)).block();

    assertEquals(response.getModels().size(), 3, label + ": 요청한 만큼 확인한다");
    assertEquals(response.getSkippedByLimit().intValue(), 0, label + ": 넘긴 것이 없다");
  }

  @Test(
      dataProvider = "카탈로그별",
      description = "빈 값과 공백은 세지 않고 상한도 소비하지 않는다")
  public void ignoresBlankIds(String label, int limit, CatalogFactory factory) {
    LlmClientTestSupport.StubExchange stub = ok(OK_BODY);
    LlmModelCatalog catalog = factory.apply(stub.builder());

    List<String> ids = new ArrayList<>();
    ids.add("a/model");
    ids.add(null);
    ids.add("  ");
    ids.add("b/model");

    LlmModelProbeResponse response = catalog.probeAvailability("key", ids).block();

    assertEquals(response.getModels().size(), 2, label + ": 빈 값은 확인하지 않는다");
    assertEquals(
        response.getSkippedByLimit().intValue(),
        0,
        label + ": 빈 값은 넘긴 것으로 세지 않는다");
    assertTrue(
        response.getRequestsSent() <= 2, label + ": 빈 값으로 요청을 보내지 않는다");
  }

  // ---------- 진행 알림 ----------

  @Test(
      dataProvider = "카탈로그별",
      description = "모델 하나가 끝날 때마다 진행을 알린다")
  public void reportsProgressPerModel(String label, int limit, CatalogFactory factory) {
    LlmClientTestSupport.StubExchange stub = ok(OK_BODY);
    LlmModelCatalog catalog = factory.apply(stub.builder());
    AtomicInteger progress = new AtomicInteger();

    catalog.probeAvailability("key", modelIds(7), progress::incrementAndGet).block();

    assertEquals(progress.get(), 7, label + ": 확인한 개수만큼 알린다");
  }

  @Test(
      dataProvider = "카탈로그별",
      description = "진행 알림에서 예외가 나도 확인은 끝까지 간다")
  public void survivesFailingProgressListener(String label, int limit, CatalogFactory factory) {
    // 진행률 표시가 깨지는 것과 확인이 통째로 실패하는 것은 무게가 다르다.
    LlmClientTestSupport.StubExchange stub = ok(OK_BODY);
    LlmModelCatalog catalog = factory.apply(stub.builder());

    LlmModelProbeResponse response =
        catalog
            .probeAvailability(
                "key",
                modelIds(3),
                () -> {
                  throw new IllegalStateException("표시 갱신 실패");
                })
            .block();

    assertEquals(response.getModels().size(), 3, label + ": 확인 결과는 온전하다");
  }

  @Test(
      dataProvider = "카탈로그별",
      description = "콜백을 주지 않아도 확인은 정상으로 끝난다")
  public void worksWithoutProgressListener(String label, int limit, CatalogFactory factory) {
    LlmClientTestSupport.StubExchange stub = ok(OK_BODY);
    LlmModelCatalog catalog = factory.apply(stub.builder());

    LlmModelProbeResponse response = catalog.probeAvailability("key", modelIds(2), null).block();

    assertEquals(response.getModels().size(), 2, label + ": null 콜백을 받아들인다");
  }

  /** 상한 시험용 모델 슬러그. 중복이 없어야 상한 계산이 정확하다. */
  private List<String> modelIds(int count) {
    List<String> ids = new ArrayList<>(count);
    for (int i = 0; i < count; i++) {
      ids.add("vendor/model-" + i);
    }
    return ids;
  }

  /** 카탈로그 생성자를 감싸는 형태. 제공자마다 생성자가 같아 하나로 묶는다. */
  @FunctionalInterface
  interface CatalogFactory {
    LlmModelCatalog apply(org.springframework.web.reactive.function.client.WebClient.Builder b);
  }
}
