// src/main/java/com/testcase/testcasemanagement/config/I18nDataInitializer.java
package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.config.i18n.LanguageDataInitializer;
import com.testcase.testcasemanagement.config.i18n.TranslationDataInitializer;
import com.testcase.testcasemanagement.config.i18n.TranslationKeyDataInitializer;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Arrays;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
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
  private final TranslationKeyRepository translationKeyRepository;
  private final Environment environment;

  @Override
  @Transactional
  public void run(String... args) throws Exception {
    // 성능: 테스트 프로파일에서는 한 번 시딩되면(스키마가 포크별 컨테이너에 persist) 재시딩을 스킵한다.
    // 테스트는 컨텍스트를 여러 번 부팅하는데, 매 부팅마다 3308개 키를 findByKeyName 으로 확인하는 비용이 크다.
    // 프로덕션 프로파일에는 이 가드가 적용되지 않으므로(항상 시딩) 릴리스 시 신규 키 반영 동작은 불변이다.
    boolean isTestProfile = Arrays.asList(environment.getActiveProfiles()).contains("test");
    if (isTestProfile && translationKeyRepository.count() > 0) {
      log.info("[test] i18n 데이터가 이미 시딩됨 → 재시딩 스킵 (부팅 비용 절감)");
      return;
    }

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
