// src/main/java/com/testcase/testcasemanagement/config/i18n/TranslationDataInitializer.java
package com.testcase.testcasemanagement.config.i18n;

import com.testcase.testcasemanagement.config.i18n.translations.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
  private final KoreanProjectSettingsTranslations koreanProjectSettingsTranslations;
  private final EnglishProjectSettingsTranslations englishProjectSettingsTranslations;

  // 2026-09-03 에이전트 연동 설정 탭
  private final KoreanAgentConnectionTranslations koreanAgentConnectionTranslations;
  private final EnglishAgentConnectionTranslations englishAgentConnectionTranslations;
  // 2026-08-03 화면 ID 배지
  private final KoreanScreenIdTranslations koreanScreenIdTranslations;
  private final EnglishScreenIdTranslations englishScreenIdTranslations;

  /**
   * 시딩 중 영속성 컨텍스트를 비우기 위한 것. 같은 트랜잭션을 유지하므로 롤백 성질은 그대로다.
   *
   * <p>왜 필요한가 — 헬퍼가 항목마다 `findBy...` 로 조회하는데, JPA 는 조회 전에 보류 중인 변경을
   * flush 하고 관리 중인 엔티티를 dirty check 한다. 컨텍스트가 커질수록 이 비용이 커져 뒤 단계가
   * 앞 단계보다 느려진다. 실측에서 같은 분량의 한국어 49초 대 영어 75초로 벌어졌다.
   */
  @PersistenceContext private EntityManager entityManager;

  private void step(String label, Runnable body) {
    long started = System.currentTimeMillis();
    body.run();
    entityManager.flush();
    entityManager.clear();
    log.debug("  {} {}ms", label, System.currentTimeMillis() - started);
  }

  @Transactional
  public void initialize() {
    log.info("기본 번역 데이터 초기화 중...");

    // Initialize Korean translations
    log.info("한국어 번역 초기화 시작");
    step("koreanTranslationManagementTranslations", koreanTranslationManagementTranslations::initialize);
    step("koreanJiraIntegrationTranslations", koreanJiraIntegrationTranslations::initialize);
    step("koreanTestExecutionTranslations", koreanTestExecutionTranslations::initialize);
    step("koreanTestResultTranslations", koreanTestResultTranslations::initialize);
    step("koreanLoginDashboardAndProjectTranslations", koreanLoginDashboardAndProjectTranslations::initialize);
    step("koreanTestCaseAndAutomationTranslations", koreanTestCaseAndAutomationTranslations::initialize);
    step("koreanOrganizationAndUserManagementTranslations", koreanOrganizationAndUserManagementTranslations::initialize);
    step("koreanAdvancedFeaturesAndCommonUITranslations", koreanAdvancedFeaturesAndCommonUITranslations::initialize);
    log.info("한국어 번역 초기화 완료");

    // Initialize English translations
    log.info("영어 번역 초기화 시작");
    step("englishTranslationManagementTranslations", englishTranslationManagementTranslations::initialize);
    step("englishJiraIntegrationTranslations", englishJiraIntegrationTranslations::initialize);
    step("englishTestExecutionTranslations", englishTestExecutionTranslations::initialize);
    step("englishTestResultTranslations", englishTestResultTranslations::initialize);
    step("englishLoginDashboardAndProjectTranslations", englishLoginDashboardAndProjectTranslations::initialize);
    step("englishTestCaseAndAutomationTranslations", englishTestCaseAndAutomationTranslations::initialize);
    step("englishOrganizationAndUserManagementTranslations", englishOrganizationAndUserManagementTranslations::initialize);
    step("englishAdvancedFeaturesAndCommonUITranslations", englishAdvancedFeaturesAndCommonUITranslations::initialize);
    log.info("영어 번역 초기화 완료");

    // 2026-06-06 i18n 전수 감사 누락분 (481건 × ko/en)
    step("koreanI18nGapTranslations", koreanI18nGapTranslations::initialize);
    step("englishI18nGapTranslations", englishI18nGapTranslations::initialize);

    // 2026-06-06 하드코딩 래핑 신설 키 (712건 × ko/en)
    step("koreanI18nHardcodedTranslations", koreanI18nHardcodedTranslations::initialize);
    step("englishI18nHardcodedTranslations", englishI18nHardcodedTranslations::initialize);

    // 2026-06-09 즐겨찾기/개인 북마크 기능
    step("koreanBookmarkTranslations", koreanBookmarkTranslations::initialize);
    step("englishBookmarkTranslations", englishBookmarkTranslations::initialize);
    step("koreanProjectSettingsTranslations", koreanProjectSettingsTranslations::initialize);
    step("englishProjectSettingsTranslations", englishProjectSettingsTranslations::initialize);

    // 2026-09-03 에이전트 연동 설정 탭
    step("koreanAgentConnectionTranslations", koreanAgentConnectionTranslations::initialize);
    step("englishAgentConnectionTranslations", englishAgentConnectionTranslations::initialize);

    // 2026-08-03 화면 ID 배지
    step("koreanScreenIdTranslations", koreanScreenIdTranslations::initialize);
    step("englishScreenIdTranslations", englishScreenIdTranslations::initialize);

    log.info("번역 데이터 초기화 완료");
  }
}
