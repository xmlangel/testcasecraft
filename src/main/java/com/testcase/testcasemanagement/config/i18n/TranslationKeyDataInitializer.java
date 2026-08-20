// src/main/java/com/testcase/testcasemanagement/config/i18n/TranslationKeyDataInitializer.java
package com.testcase.testcasemanagement.config.i18n;

import com.testcase.testcasemanagement.config.i18n.keys.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class TranslationKeyDataInitializer {

  private final AuthKeysInitializer authKeysInitializer;
  private final CommonKeysInitializer commonKeysInitializer;
  private final DashboardKeysInitializer dashboardKeysInitializer;
  private final OrganizationKeysInitializer organizationKeysInitializer;
  private final ProjectKeysInitializer projectKeysInitializer;
  private final TestCaseKeysInitializer testCaseKeysInitializer;
  private final TestExecutionKeysInitializer testExecutionKeysInitializer;
  private final TestPlanKeysInitializer testPlanKeysInitializer;
  private final TestResultKeysInitializer testResultKeysInitializer;
  private final UserManagementKeysInitializer userManagementKeysInitializer;
  private final MailKeysInitializer mailKeysInitializer;
  private final RAGKeysInitializer ragKeysInitializer;
  private final AttachmentKeysInitializer attachmentKeysInitializer;
  private final SchedulerKeysInitializer schedulerKeysInitializer;
  private final ExploratorySessionKeysInitializer exploratorySessionKeysInitializer;

  // 리팩토링된 번역 키 초기화 클래스들 (TranslationKeysInitializer 분리)
  private final TranslationManagementKeysInitializer translationManagementKeysInitializer;
  private final JiraIntegrationKeysInitializer jiraIntegrationKeysInitializer;
  private final ExtendedUIKeysInitializer extendedUIKeysInitializer;
  private final GoogleKeysInitializer googleKeysInitializer;

  // 2026-06-06 i18n 전수 감사 누락분
  private final I18nGapKeysInitializer i18nGapKeysInitializer;
  // 2026-06-06 하드코딩 한국어 t() 래핑 신설 키
  private final I18nHardcodedKeysInitializer i18nHardcodedKeysInitializer;
  // 2026-06-09 즐겨찾기/개인 북마크 기능
  private final BookmarkKeysInitializer bookmarkKeysInitializer;
  private final ProjectSettingsKeysInitializer projectSettingsKeysInitializer;
  // 2026-08-03 화면 ID 배지 (기획 문서 docs/screen_spec 의 화면 구분)
  private final ScreenIdKeysInitializer screenIdKeysInitializer;

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
    log.info("번역 키 데이터 초기화 중...");

    step("authKeysInitializer", authKeysInitializer::initialize);
    step("commonKeysInitializer", commonKeysInitializer::initialize);
    step("dashboardKeysInitializer", dashboardKeysInitializer::initialize);
    step("organizationKeysInitializer", organizationKeysInitializer::initialize);
    step("projectKeysInitializer", projectKeysInitializer::initialize);
    step("testCaseKeysInitializer", testCaseKeysInitializer::initialize);
    step("testExecutionKeysInitializer", testExecutionKeysInitializer::initialize);
    step("testPlanKeysInitializer", testPlanKeysInitializer::initialize);
    step("testResultKeysInitializer", testResultKeysInitializer::initialize);
    step("userManagementKeysInitializer", userManagementKeysInitializer::initialize);
    step("mailKeysInitializer", mailKeysInitializer::initialize);
    step("ragKeysInitializer", ragKeysInitializer::initialize);
    step("attachmentKeysInitializer", attachmentKeysInitializer::initialize);
    step("schedulerKeysInitializer", schedulerKeysInitializer::initialize);
    step("exploratorySessionKeysInitializer", exploratorySessionKeysInitializer::initialize);

    // 리팩토링된 번역 키 초기화 (기존 TranslationKeysInitializer 대체)
    step("translationManagementKeysInitializer", translationManagementKeysInitializer::initialize);
    step("jiraIntegrationKeysInitializer", jiraIntegrationKeysInitializer::initialize);
    step("extendedUIKeysInitializer", extendedUIKeysInitializer::initialize);
    step("googleKeysInitializer", googleKeysInitializer::initialize);

    // 2026-06-06 i18n 전수 감사 누락분 (481건)
    step("i18nGapKeysInitializer", i18nGapKeysInitializer::initialize);
    // 2026-06-06 하드코딩 래핑 신설 키 (712건)
    step("i18nHardcodedKeysInitializer", i18nHardcodedKeysInitializer::initialize);

    // 2026-06-09 즐겨찾기/개인 북마크 기능
    step("bookmarkKeysInitializer", bookmarkKeysInitializer::initialize);
    step("projectSettingsKeysInitializer", projectSettingsKeysInitializer::initialize);

    // 2026-08-03 화면 ID 배지
    step("screenIdKeysInitializer", screenIdKeysInitializer::initialize);

    log.info("번역 키 데이터 초기화 완료");
  }
}
