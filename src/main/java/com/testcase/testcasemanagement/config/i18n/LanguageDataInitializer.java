// src/main/java/com/testcase/testcasemanagement/config/i18n/LanguageDataInitializer.java
package com.testcase.testcasemanagement.config.i18n;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class LanguageDataInitializer {

    private final LanguageRepository languageRepository;
    private final TranslationRepository translationRepository;

    @Transactional
    public void initialize() {
        log.info("기본 언어 데이터 초기화 중...");

        // 한국어 (기본 언어)
        createLanguageIfNotExists("ko", "Korean", "한국어", true, 1);

        // 영어
        createLanguageIfNotExists("en", "English", "English", false, 2);

        // 불필요한 언어들 삭제
        deleteLanguageIfExists("ja");
        deleteLanguageIfExists("zh");

        log.info("언어 데이터 초기화 완료");
    }

    private void createLanguageIfNotExists(String code, String name, String nativeName, boolean isDefault, int sortOrder) {
        Optional<Language> existingLanguage = languageRepository.findByCode(code);
        if (existingLanguage.isEmpty()) {
            Language language = new Language(code, name, nativeName, isDefault, sortOrder);
            languageRepository.save(language);
            log.info("언어 생성: {} ({})", name, code);
        } else {
            log.debug("언어 이미 존재: {} ({})", name, code);
        }
    }

    private void deleteLanguageIfExists(String code) {
        Optional<Language> existingLanguage = languageRepository.findByCode(code);
        if (existingLanguage.isPresent()) {
            Language language = existingLanguage.get();

            // 해당 언어의 모든 번역 데이터 먼저 삭제
            List<Translation> translations = translationRepository.findByLanguage(language);
            if (!translations.isEmpty()) {
                translationRepository.deleteAll(translations);
                log.info("언어 {} 관련 번역 데이터 {} 개 삭제됨", code, translations.size());
            }

            // 언어 삭제
            languageRepository.delete(language);
            log.info("언어 완전 삭제: {} ({})", language.getName(), code);
        }
    }
}
