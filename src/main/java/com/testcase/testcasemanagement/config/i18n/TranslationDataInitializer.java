// src/main/java/com/testcase/testcasemanagement/config/i18n/TranslationDataInitializer.java
package com.testcase.testcasemanagement.config.i18n;

import com.testcase.testcasemanagement.config.i18n.translations.EnglishTranslationsInitializer;
import com.testcase.testcasemanagement.config.i18n.translations.KoreanTranslationsInitializer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class TranslationDataInitializer {

    private final KoreanTranslationsInitializer koreanTranslationsInitializer;
    private final EnglishTranslationsInitializer englishTranslationsInitializer;

    @Transactional
    public void initialize() {
        log.info("기본 번역 데이터 초기화 중...");

        koreanTranslationsInitializer.initialize();
        englishTranslationsInitializer.initialize();

        log.info("번역 데이터 초기화 완료");
    }
}