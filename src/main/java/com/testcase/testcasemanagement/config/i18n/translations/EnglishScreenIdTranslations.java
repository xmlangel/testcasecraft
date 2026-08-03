// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishScreenIdTranslations.java
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

/** English translations - Screen ID badge */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishScreenIdTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "en";
    String by = "system";

    create("screenId.tooltip", lang, "Screen {id} · {name}", by);
    create("screenId.S0", lang, "Sign in & Account", by);
    create("screenId.S1", lang, "Projects", by);
    create("screenId.S2", lang, "Common Layout", by);
    create("screenId.S3", lang, "Dashboard", by);
    create("screenId.S4", lang, "Test Cases", by);
    create("screenId.S5", lang, "Test Plans", by);
    create("screenId.S6", lang, "Test Executions", by);
    create("screenId.S7", lang, "Test Results", by);
    create("screenId.S8", lang, "Automation Tests", by);
    create("screenId.S9", lang, "RAG Documents", by);
    create("screenId.S10", lang, "Exploratory Sessions", by);
    create("screenId.S11", lang, "Admin Settings", by);

    log.info("English screen ID translations initialized");
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
          log.debug("Translation created: {} [{}]", keyName, languageCode);
        }
      }
    }
  }
}
