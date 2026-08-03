// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanScreenIdTranslations.java
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

/** 한국어 번역 — 화면 ID 배지 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanScreenIdTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "ko";
    String by = "system";

    create("screenId.tooltip", lang, "화면 {id} · {name}", by);
    create("screenId.S0", lang, "로그인·계정", by);
    create("screenId.S1", lang, "프로젝트", by);
    create("screenId.S2", lang, "공통 레이아웃", by);
    create("screenId.S3", lang, "대시보드", by);
    create("screenId.S4", lang, "테스트케이스", by);
    create("screenId.S5", lang, "테스트 플랜", by);
    create("screenId.S6", lang, "테스트 실행", by);
    create("screenId.S7", lang, "테스트 결과", by);
    create("screenId.S8", lang, "자동화 테스트", by);
    create("screenId.S9", lang, "RAG 문서", by);
    create("screenId.S10", lang, "탐색 세션", by);
    create("screenId.S11", lang, "관리자 설정", by);

    log.info("한국어 화면 ID 번역 초기화 완료");
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
          log.debug("번역 생성: {} [{}]", keyName, languageCode);
        }
      }
    }
  }
}
