package com.testcase.testcasemanagement.service.llm;

import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * 제공자별 모델 카탈로그를 찾아 준다.
 *
 * <p>모든 제공자가 카탈로그를 갖는 것은 아니다. 목록 API 가 없거나(OpenWebUI·Ollama 는 사용자 서버에 달려 있다) 모델 체계가 사용자 환경마다 다른
 * 제공자는 카탈로그가 없고, 그때는 {@link Optional#empty()} 를 준다. 화면은 그 경우 목록 선택기를 감추고 입력란만 쓴다.
 */
@Component
@RequiredArgsConstructor
public class LlmModelCatalogFactory {

  private final List<LlmModelCatalog> catalogs;
  private Map<LlmProvider, LlmModelCatalog> catalogMap;

  /**
   * 제공자에 맞는 카탈로그.
   *
   * @return 카탈로그가 없으면 {@link Optional#empty()}. 오류가 아니다
   */
  public Optional<LlmModelCatalog> find(LlmProvider provider) {
    if (catalogMap == null) {
      catalogMap =
          catalogs.stream()
              .collect(Collectors.toMap(LlmModelCatalog::provider, Function.identity()));
    }
    return Optional.ofNullable(provider).map(catalogMap::get);
  }

  /** 카탈로그를 가진 제공자 목록. 화면이 어느 제공자에서 목록 선택기를 띄울지 정할 때 쓴다. */
  public List<LlmProvider> supportedProviders() {
    if (catalogMap == null) {
      find(null);
    }
    return catalogMap.keySet().stream().sorted().toList();
  }
}
