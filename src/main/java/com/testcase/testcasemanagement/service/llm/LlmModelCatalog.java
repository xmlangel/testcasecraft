package com.testcase.testcasemanagement.service.llm;

import com.testcase.testcasemanagement.dto.llm.LlmModelDTO;
import com.testcase.testcasemanagement.dto.llm.LlmModelProbeResponse;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import java.util.Collection;
import java.util.List;

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
   * @param apiKey 제공자 API Key
   * @param modelIds 확인 대상. 비우면 목록 전체
   */
  LlmModelProbeResponse probeAvailability(String apiKey, Collection<String> modelIds);

  /**
   * 전수 확인을 기본으로 권할지 여부.
   *
   * <p>{@code true} 면 목록만으로는 쓸 수 있는 모델을 알 수 없고 확인에 한도 부담도 없다는 뜻이다(NVIDIA). {@code false} 면 확인이
   * 한도를 태우므로 고른 모델 하나만 확인하는 것이 낫다는 뜻이다(OpenRouter).
   */
  boolean probeRecommendedByDefault();
}
