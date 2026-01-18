// src/main/java/com/testcase/testcasemanagement/config/I18nDataInitializer.java
package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.config.i18n.LanguageDataInitializer;
import com.testcase.testcasemanagement.config.i18n.TranslationDataInitializer;
import com.testcase.testcasemanagement.config.i18n.TranslationKeyDataInitializer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@Order(10) // 다른 초기화 후에 실행
@RequiredArgsConstructor
public class I18nDataInitializer implements CommandLineRunner {

    private final LanguageDataInitializer languageDataInitializer;
    private final TranslationKeyDataInitializer translationKeyDataInitializer;
    private final TranslationDataInitializer translationDataInitializer;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("=== 다국어 지원 데이터 초기화 시작 ===");
        System.out.println("I18nDataInitializer.run() 실행 중...");

        languageDataInitializer.initialize();
        System.out.println("언어 데이터 초기화 완료");

        translationKeyDataInitializer.initialize();
        System.out.println("번역 키 데이터 초기화 완료");

        translationDataInitializer.initialize();
        System.out.println("번역 데이터 초기화 완료");

        log.info("=== 다국어 지원 데이터 초기화 완료 ===");
        System.out.println("I18nDataInitializer.run() 완료!");
    }
}
