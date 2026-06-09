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
  private final KoreanLoginDashboardAndProjectTranslations
      koreanLoginDashboardAndProjectTranslations;
  private final KoreanTestCaseAndAutomationTranslations koreanTestCaseAndAutomationTranslations;
  private final KoreanOrganizationAndUserManagementTranslations
      koreanOrganizationAndUserManagementTranslations;
  private final KoreanAdvancedFeaturesAndCommonUITranslations
      koreanAdvancedFeaturesAndCommonUITranslations;

  // English translation initializers
  private final EnglishTranslationManagementTranslations englishTranslationManagementTranslations;
  private final EnglishJiraIntegrationTranslations englishJiraIntegrationTranslations;
  private final EnglishTestExecutionTranslations englishTestExecutionTranslations;
  private final EnglishTestResultTranslations englishTestResultTranslations;
  private final EnglishLoginDashboardAndProjectTranslations
      englishLoginDashboardAndProjectTranslations;
  private final EnglishTestCaseAndAutomationTranslations englishTestCaseAndAutomationTranslations;
  private final EnglishOrganizationAndUserManagementTranslations
      englishOrganizationAndUserManagementTranslations;
  private final EnglishAdvancedFeaturesAndCommonUITranslations
      englishAdvancedFeaturesAndCommonUITranslations;

  // 2026-06-06 i18n 전수 감사 누락분
  private final KoreanI18nGapTranslations koreanI18nGapTranslations;
  private final EnglishI18nGapTranslations englishI18nGapTranslations;
  // 2026-06-06 하드코딩 래핑 신설 키
  private final KoreanI18nHardcodedTranslations koreanI18nHardcodedTranslations;
  private final EnglishI18nHardcodedTranslations englishI18nHardcodedTranslations;
  // 2026-06-09 즐겨찾기/개인 북마크 기능
  private final KoreanBookmarkTranslations koreanBookmarkTranslations;
  private final EnglishBookmarkTranslations englishBookmarkTranslations;

  @Transactional
  public void initialize() {
    log.info("기본 번역 데이터 초기화 중...");

    // Initialize Korean translations
    log.info("한국어 번역 초기화 시작");
    koreanTranslationManagementTranslations.initialize();
    koreanJiraIntegrationTranslations.initialize();
    koreanTestExecutionTranslations.initialize();
    koreanTestResultTranslations.initialize();
    koreanLoginDashboardAndProjectTranslations.initialize();
    koreanTestCaseAndAutomationTranslations.initialize();
    koreanOrganizationAndUserManagementTranslations.initialize();
    koreanAdvancedFeaturesAndCommonUITranslations.initialize();
    log.info("한국어 번역 초기화 완료");

    // Initialize English translations
    log.info("영어 번역 초기화 시작");
    englishTranslationManagementTranslations.initialize();
    englishJiraIntegrationTranslations.initialize();
    englishTestExecutionTranslations.initialize();
    englishTestResultTranslations.initialize();
    englishLoginDashboardAndProjectTranslations.initialize();
    englishTestCaseAndAutomationTranslations.initialize();
    englishOrganizationAndUserManagementTranslations.initialize();
    englishAdvancedFeaturesAndCommonUITranslations.initialize();
    log.info("영어 번역 초기화 완료");

    // 2026-06-06 i18n 전수 감사 누락분 (481건 × ko/en)
    koreanI18nGapTranslations.initialize();
    englishI18nGapTranslations.initialize();

    // 2026-06-06 하드코딩 래핑 신설 키 (712건 × ko/en)
    koreanI18nHardcodedTranslations.initialize();
    englishI18nHardcodedTranslations.initialize();

    // 2026-06-09 즐겨찾기/개인 북마크 기능
    koreanBookmarkTranslations.initialize();
    englishBookmarkTranslations.initialize();

    log.info("번역 데이터 초기화 완료");
  }
}
