package com.testcase.testcasemanagement.service.llm;

import com.testcase.testcasemanagement.dto.llm.LlmModelDTO;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeResponse;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import java.util.Collection;
import java.util.List;
import reactor.core.publisher.Mono;

/**
 * 제공자가 내주는 모델 목록을 화면이 고를 수 있는 형태로 만드는 카탈로그.
 *
 * <p>제공자마다 목록의 성질이 크게 다르므로 구현을 갈라 둔다.
 *
 * <ul>
 *   <li><b>OpenRouter</b>: 응답에 가격과 모달리티가 있어 무료·채팅 판정을 메타데이터로 한다. 대신 확인 호출이 무료 일일 한도(실측 50건)를 태우므로
 *       확인을 아껴야 한다.
 *   <li><b>NVIDIA</b>: 응답에 가격도 모달리티도 없어 ID 패턴으로 추정할 수밖에 없다. 게다가 목록의 상당수가 계정에 없어 404 를 낸다(실측: 77개
 *       중 25개만 사용 가능). 확인이 곧 유일한 판정 수단이고, 확인에 한도 제약이 사실상 없다.
 * </ul>
 *
 * <p>그래서 «확인을 아낀다 / 확인이 필수다» 라는 성질을 {@link #probeRecommendedByDefault()} 로 알려, 화면이 기본 동작을 제공자에 맞게
 * 정할 수 있게 한다.
 */
public interface LlmModelCatalog {

  /** 이 카탈로그가 담당하는 제공자. */
  LlmProvider provider();

  /**
   * 고를 수 있는 모델 목록.
   *
   * @param apiKey 제공자 API Key
   * @return 가용성이 {@code UNKNOWN} 인 목록. 실제로 쓸 수 있는지는 확인해야 안다
   */
  List<LlmModelDTO> listSelectableModels(String apiKey);

  /**
   * 각 모델에 최소 요청을 보내 지금 쓸 수 있는지 확인한다.
   *
   * <p>{@code Mono} 를 돌려주는 이유는 이 작업이 오래 걸리기 때문이다. 모델 수를 동시 실행 수로 나눈 회차마다 개별 타임아웃이 걸릴 수 있어, 최악의 경우
   * OpenRouter 는 2분 30초(40개 / 동시 4 × 15초), NVIDIA 는 6분(120개 / 동시 10 × 30초)이 걸린다. 결과를 기다려 돌려주면 그동안 서블릿
   * 스레드 하나가 묶이므로, 구독은 호출한 쪽이 하도록 미룬다.
   *
   * @param apiKey 제공자 API Key
   * @param modelIds 확인 대상. 비우면 목록 전체
   */
  Mono<LlmModelProbeResponse> probeAvailability(String apiKey, Collection<String> modelIds);

  /**
   * 진행 상황을 알리며 확인한다.
   *
   * <p>백그라운드 작업이 진행률을 화면에 보여 주려면 모델 하나가 끝날 때마다 알아야 한다. 콜백은 판정이 나올 때마다 한 번 불리고, 건너뛴 모델도 센다. 여러
   * 스레드에서 동시에 불리므로 받는 쪽이 스스로 동기화해야 한다.
   *
   * @param onEachDone 모델 하나가 끝날 때마다 불린다. null 이면 알리지 않는다
   */
  Mono<LlmModelProbeResponse> probeAvailability(
      String apiKey, Collection<String> modelIds, Runnable onEachDone);

  /**
   * 전수 확인을 기본으로 권할지 여부.
   *
   * <p>{@code true} 면 목록만으로는 쓸 수 있는 모델을 알 수 없고 확인에 한도 부담도 없다는 뜻이다(NVIDIA). {@code false} 면 확인이
   * 한도를 태우므로 고른 모델 하나만 확인하는 것이 낫다는 뜻이다(OpenRouter).
   */
  boolean probeRecommendedByDefault();
}
