// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanGraphTranslations.java
package com.testcase.testcasemanagement.config.i18n.translations;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** 한국어 번역 - 그래프 뷰 / 그래프 테스트 케이스 (v1.1.1) */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanGraphTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "ko";
    String by = "system";

    create("graph.nav", lang, "그래프 뷰", by);
    create("graph.title", lang, "그래프 뷰", by);
    create("graph.selectProject", lang, "그래프를 보려면 먼저 프로젝트를 선택하세요.", by);
    create("graph.dbUnavailable", lang, "그래프 데이터베이스에 연결할 수 없습니다. 관리자에게 문의하세요.", by);
    create("graph.empty", lang, "표시할 그래프 데이터가 없습니다. 동기화가 아직 실행되지 않았을 수 있습니다.", by);
    create("graph.refresh", lang, "조회", by);
    create("graph.tab.structure", lang, "구조 그래프", by);
    create("graph.tab.failures", lang, "오류 클러스터", by);
    create("graph.tab.neighborhood", lang, "케이스 이웃", by);
    create("graph.layout.force", lang, "포스", by);
    create("graph.layout.hierarchy", lang, "계층", by);
    create("graph.caseIdLabel", lang, "테스트케이스 ID", by);
    create("graph.depth", lang, "깊이", by);
    create("graph.detail.empty", lang, "노드를 클릭하면 상세 정보가 표시됩니다.", by);
    create("graph.editor.title", lang, "그래프 테스트 케이스 편집", by);
    create("graph.editor.hint", lang, "저장하면 그래프가 원본이 되고, 기존 스텝 표는 읽기 전용 미러로 자동 갱신됩니다.", by);
    create("graph.editor.noProject", lang, "projectId 파라미터가 필요합니다.", by);
    create("graph.editor.action", lang, "수행 절차", by);
    create("graph.editor.expected", lang, "기대 결과", by);
    create("graph.editor.addStep", lang, "스텝 추가", by);
    create("graph.editor.save", lang, "저장", by);
    create("graph.editor.saved", lang, "저장됨", by);
    create("projectHeader.tabs.graph", lang, "그래프", by);
    create("graph.syncNow", lang, "지금 동기화", by);
    create("graph.syncing", lang, "동기화 중…", by);
  }

  private void create(String keyName, String languageCode, String value, String createdBy) {
    Optional<TranslationKey> translationKeyOpt = translationKeyRepository.findByKeyName(keyName);
    if (translationKeyOpt.isPresent()) {
      TranslationKey translationKey = translationKeyOpt.get();
      Optional<Language> languageOpt = languageRepository.findByCode(languageCode);
      if (languageOpt.isPresent()) {
        Language language = languageOpt.get();
        Optional<Translation> existing =
            translationRepository.findByTranslationKeyAndLanguage(translationKey, language);
        if (existing.isEmpty()) {
          Translation translation = new Translation();
          translation.setTranslationKey(translationKey);
          translation.setLanguage(language);
          translation.setValue(value);
          translation.setCreatedBy(createdBy);
          translation.setUpdatedBy(createdBy);
          translation.setIsActive(true);
          translationRepository.save(translation);
        }
      }
    }
  }
}
