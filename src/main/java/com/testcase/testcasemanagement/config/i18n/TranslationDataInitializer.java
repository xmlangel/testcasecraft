// src/main/java/com/testcase/testcasemanagement/config/i18n/TranslationDataInitializer.java
package com.testcase.testcasemanagement.config.i18n;

import com.testcase.testcasemanagement.config.i18n.translations.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class TranslationDataInitializer {

    // Korean translation initializers
    private final KoreanTranslationManagementTranslations koreanTranslationManagementTranslations;
    private final KoreanJiraIntegrationTranslations koreanJiraIntegrationTranslations;
    private final KoreanTestExecutionTranslations koreanTestExecutionTranslations;
    private final KoreanTestResultTranslations koreanTestResultTranslations;
    private final KoreanCommonAndExtendedUITranslationsPart1 koreanCommonAndExtendedUITranslationsPart1;
    private final KoreanCommonAndExtendedUITranslationsPart2 koreanCommonAndExtendedUITranslationsPart2;
    private final KoreanCommonAndExtendedUITranslationsPart3 koreanCommonAndExtendedUITranslationsPart3;
    private final KoreanCommonAndExtendedUITranslationsPart4 koreanCommonAndExtendedUITranslationsPart4;

    // English translation initializers
    private final EnglishTranslationManagementTranslations englishTranslationManagementTranslations;
    private final EnglishJiraIntegrationTranslations englishJiraIntegrationTranslations;
    private final EnglishTestExecutionTranslations englishTestExecutionTranslations;
    private final EnglishTestResultTranslations englishTestResultTranslations;
    private final EnglishCommonAndExtendedUITranslationsPart1 englishCommonAndExtendedUITranslationsPart1;
    private final EnglishCommonAndExtendedUITranslationsPart2 englishCommonAndExtendedUITranslationsPart2;
    private final EnglishCommonAndExtendedUITranslationsPart3 englishCommonAndExtendedUITranslationsPart3;
    private final EnglishCommonAndExtendedUITranslationsPart4 englishCommonAndExtendedUITranslationsPart4;

    @Transactional
    public void initialize() {
        log.info("기본 번역 데이터 초기화 중...");

        // Initialize Korean translations
        log.info("한국어 번역 초기화 시작");
        koreanTranslationManagementTranslations.initialize();
        koreanJiraIntegrationTranslations.initialize();
        koreanTestExecutionTranslations.initialize();
        koreanTestResultTranslations.initialize();
        koreanCommonAndExtendedUITranslationsPart1.initialize();
        koreanCommonAndExtendedUITranslationsPart2.initialize();
        koreanCommonAndExtendedUITranslationsPart3.initialize();
        koreanCommonAndExtendedUITranslationsPart4.initialize();
        log.info("한국어 번역 초기화 완료");

        // Initialize English translations
        log.info("영어 번역 초기화 시작");
        englishTranslationManagementTranslations.initialize();
        englishJiraIntegrationTranslations.initialize();
        englishTestExecutionTranslations.initialize();
        englishTestResultTranslations.initialize();
        englishCommonAndExtendedUITranslationsPart1.initialize();
        englishCommonAndExtendedUITranslationsPart2.initialize();
        englishCommonAndExtendedUITranslationsPart3.initialize();
        englishCommonAndExtendedUITranslationsPart4.initialize();
        log.info("영어 번역 초기화 완료");

        log.info("번역 데이터 초기화 완료");
    }
}