// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanRequirementTranslations.java
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

/** 한국어 번역 - 요구사항 관리 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanRequirementTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "ko";
    String by = "system";

    create("projectHeader.tabs.requirements", lang, "요구사항", by);
    create("requirement.add", lang, "요구사항 추가", by);
    create("requirement.coverage.COVERED", lang, "충족", by);
    create("requirement.coverage.EXCLUDED", lang, "제외", by);
    create("requirement.coverage.PARTIAL", lang, "부분", by);
    create("requirement.coverage.UNCOVERED", lang, "미연결", by);
    create("requirement.coverage.gapsOnly", lang, "미연결·부분만 보기", by);
    create("requirement.coverage.rate", lang, "커버리지", by);
    create("requirement.coverage.testable", lang, "대상 요구사항", by);
    create("requirement.edit", lang, "요구사항 수정", by);
    create("requirement.empty", lang, "요구사항이 없습니다.", by);
    create("requirement.field.coverage", lang, "커버리지", by);
    create("requirement.field.docId", lang, "요구사항 ID", by);
    create("requirement.field.expectedCoverage", lang, "필요 TC 수", by);
    create("requirement.field.linked", lang, "연결 TC", by);
    create("requirement.field.noParent", lang, "(최상위)", by);
    create("requirement.field.parentSpec", lang, "상위 문서", by);
    create("requirement.field.scope", lang, "범위·설명", by);
    create("requirement.field.spec", lang, "요구사항 문서", by);
    create("requirement.field.specDocId", lang, "문서 ID", by);
    create("requirement.field.status", lang, "상태", by);
    create("requirement.field.title", lang, "제목", by);
    create("requirement.field.type", lang, "유형", by);
    create("requirement.link", lang, "연결", by);
    create("requirement.linkedCases", lang, "연결된 테스트케이스", by);
    create("requirement.noLinkedCases", lang, "연결된 테스트케이스가 없습니다.", by);
    create("requirement.report.cases", lang, "테스트케이스 결과", by);
    create("requirement.report.execution", lang, "테스트실행", by);
    create("requirement.report.latestAll", lang, "플랜 전체 (TC별 최신 결과)", by);
    create("requirement.report.pickPlan", lang, "리포트를 볼 테스트플랜을 고르세요.", by);
    create("requirement.report.plan", lang, "테스트플랜", by);
    create("requirement.report.verdict", lang, "판정", by);
    create("requirement.searchCases", lang, "테스트케이스 검색", by);
    create("requirement.spec.add", lang, "요구사항 문서 추가", by);
    create("requirement.spec.all", lang, "전체", by);
    create(
        "requirement.spec.confirmDelete",
        lang,
        "이 문서와 하위 문서, 그 안의 요구사항과 TC 연결을 모두 삭제합니다. 테스트케이스는 지우지 않습니다. 계속할까요?",
        by);
    create("requirement.spec.edit", lang, "요구사항 문서 수정", by);
    create("requirement.spec.empty", lang, "요구사항 문서를 먼저 추가하세요.", by);
    create("requirement.spec.title", lang, "요구사항 문서", by);
    create("requirement.status.DRAFT", lang, "초안", by);
    create("requirement.status.FINISH", lang, "작성 완료", by);
    create("requirement.status.IMPLEMENTED", lang, "구현됨", by);
    create("requirement.status.NOT_TESTABLE", lang, "테스트 불가", by);
    create("requirement.status.OBSOLETE", lang, "폐기", by);
    create("requirement.status.REVIEW", lang, "검토 중", by);
    create("requirement.status.REWORK", lang, "재작업", by);
    create("requirement.status.VALID", lang, "유효", by);
    create("requirement.testCase.none", lang, "연결된 요구사항이 없습니다.", by);
    create("requirement.testCase.placeholder", lang, "요구사항 검색", by);
    create("requirement.testCase.title", lang, "연결된 요구사항", by);
    create("requirement.type.CONSTRAINT", lang, "제약", by);
    create("requirement.type.FEATURE", lang, "기능", by);
    create("requirement.type.INFORMATIONAL", lang, "정보", by);
    create("requirement.type.NON_FUNCTIONAL", lang, "비기능", by);
    create("requirement.type.SYSTEM_FUNCTION", lang, "시스템 기능", by);
    create("requirement.type.USER_INTERFACE", lang, "사용자 인터페이스", by);
    create("requirement.type.USE_CASE", lang, "유스케이스", by);
    create("requirement.unlink", lang, "연결 해제", by);
    create("requirement.verdict.BLOCKED", lang, "차단", by);
    create("requirement.verdict.FAIL", lang, "실패", by);
    create("requirement.verdict.NOT_IN_PLAN", lang, "플랜에 없음", by);
    create("requirement.verdict.NOT_RUN", lang, "미실행", by);
    create("requirement.verdict.PASS", lang, "통과", by);
    create("requirement.view.coverage", lang, "커버리지", by);
    create("requirement.view.list", lang, "요구사항", by);
    create("requirement.view.report", lang, "리포트", by);
  }

  private void create(String keyName, String languageCode, String value, String createdBy) {
    Optional<TranslationKey> translationKeyOpt = translationKeyRepository.findByKeyName(keyName);
    if (translationKeyOpt.isEmpty()) {
      return;
    }
    TranslationKey translationKey = translationKeyOpt.get();
    Optional<Language> languageOpt = languageRepository.findByCode(languageCode);
    if (languageOpt.isEmpty()) {
      return;
    }
    Language language = languageOpt.get();
    Optional<Translation> existing =
        translationRepository.findByTranslationKeyAndLanguage(translationKey, language);
    if (existing.isPresent()) {
      return;
    }
    Translation translation = new Translation();
    translation.setTranslationKey(translationKey);
    translation.setLanguage(language);
    translation.setValue(value);
    translation.setCreatedBy(createdBy);
    translation.setUpdatedBy(createdBy);
    translation.setIsActive(true);
    translationRepository.save(translation);
  }
}
