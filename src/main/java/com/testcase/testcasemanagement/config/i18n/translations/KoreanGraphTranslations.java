// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanGraphTranslations.java
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

/** 한국어 번역 - 그래프 뷰 / 그래프 테스트 케이스 (v1.1.1) */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanGraphTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "ko";
    String by = "system";

    create("graph.nav", lang, "그래프 뷰", by);
    create("graph.title", lang, "그래프 뷰", by);
    create("graph.selectProject", lang, "그래프를 보려면 먼저 프로젝트를 선택하세요.", by);
    create("graph.dbUnavailable", lang, "그래프 데이터베이스에 연결할 수 없습니다. 관리자에게 문의하세요.", by);
    create("graph.empty", lang, "표시할 그래프 데이터가 없습니다. 동기화가 아직 실행되지 않았을 수 있습니다.", by);
    create("graph.refresh", lang, "조회", by);
    create("graph.tab.structure", lang, "구조 그래프", by);
    create("graph.tab.failures", lang, "오류 클러스터", by);
    create("graph.tab.neighborhood", lang, "케이스 이웃", by);
    create("graph.layout.force", lang, "포스", by);
    create("graph.layout.hierarchy", lang, "계층", by);
    create("graph.caseIdLabel", lang, "테스트케이스 ID", by);
    create("graph.depth", lang, "깊이", by);
    create("graph.detail.empty", lang, "노드를 클릭하면 상세 정보가 표시됩니다.", by);
    create("graph.editor.title", lang, "그래프 테스트 케이스 편집", by);
    create("graph.editor.hint", lang, "저장하면 그래프가 원본이 되고, 기존 스텝 표는 읽기 전용 미러로 자동 갱신됩니다.", by);
    create("graph.editor.noProject", lang, "projectId 파라미터가 필요합니다.", by);
    create("graph.editor.action", lang, "수행 절차", by);
    create("graph.editor.expected", lang, "기대 결과", by);
    create("graph.editor.addStep", lang, "스텝 추가", by);
    create("graph.editor.save", lang, "저장", by);
    create("graph.editor.saved", lang, "저장됨", by);
    create("projectHeader.tabs.graph", lang, "그래프", by);
    create("graph.syncNow", lang, "지금 동기화", by);
    create("graph.syncing", lang, "동기화 중…", by);
    create("graph.openEditor", lang, "그래프 편집기 열기", by);
    create("graph.convertAndEdit", lang, "그래프로 전환 후 편집", by);
    create("graph.converting", lang, "전환 중…", by);
    create("graph.layout.label", lang, "레이아웃", by);
    create("graph.layout.concentric", lang, "동심원 (허브 중심)", by);
    create("graph.layout.circle", lang, "원형", by);
    create("graph.layout.grid", lang, "격자", by);
    create("graph.filter.folder", lang, "폴더", by);
    create("graph.filter.case", lang, "케이스", by);
    create("graph.filter.plan", lang, "플랜", by);
    create("graph.filter.execution", lang, "실행", by);
    create("graph.filter.result", lang, "결과", by);
    create("graph.filter.scope", lang, "플랜/실행 선택", by);
    create("graph.filter.all", lang, "전체", by);
    create("graph.filter.planPrefix", lang, "[플랜] ", by);
    create("graph.filter.executionPrefix", lang, "[실행] ", by);

    // 관계 편집 + 분기 편집 (v1.1.1)
    create("graph.relation.start", lang, "이 케이스에서 관계 시작", by);
    create("graph.relation.pickTarget", lang, "대상 케이스 노드를 클릭하세요", by);
    create("graph.relation.cancel", lang, "관계 추가 취소", by);
    create("graph.relation.typeTitle", lang, "관계 유형 선택", by);
    create("graph.relation.type", lang, "유형", by);
    create("graph.relation.dependsOn", lang, "선행 필요", by);
    create("graph.relation.relatesTo", lang, "연관", by);
    create("graph.relation.blocks", lang, "차단함", by);
    create("graph.relation.save", lang, "관계 생성", by);
    create("graph.relation.cancelBtn", lang, "취소", by);
    create("graph.relation.delete", lang, "이 관계 삭제", by);
    create("graph.relation.autoEdge", lang, "동기화로 생성된 관계는 삭제할 수 없습니다.", by);

    // 범례 (v1.1.1)
    create("graph.legend.title", lang, "범례 — 색·모양 의미", by);
    create("graph.legend.nodeTypes", lang, "노드 유형", by);
    create("graph.legend.testCase", lang, "테스트 케이스", by);
    create("graph.legend.folder", lang, "폴더", by);
    create("graph.legend.testPlan", lang, "테스트 플랜", by);
    create("graph.legend.testExecution", lang, "테스트 실행", by);
    create("graph.legend.junitCase", lang, "JUnit 케이스", by);
    create("graph.legend.jiraIssue", lang, "Jira 이슈", by);
    create("graph.legend.failureType", lang, "오류 원인(허브)", by);
    create("graph.legend.decision", lang, "분기(Decision)", by);
    create("graph.legend.resultStatus", lang, "실행 결과(색이 상태를 뜻함)", by);
    create("graph.legend.edges", lang, "간선: 회색 실선 = 자동 관계 · 보라 점선 = 사용자가 지정한 관계", by);
    create("graph.editor.addBranch", lang, "분기 추가", by);
    create("graph.editor.branchOf", lang, "스텝", by);
    create("graph.editor.branches", lang, "분기", by);
    create("graph.editor.branchLabel", lang, "조건 라벨", by);
    create("graph.editor.branchTo", lang, "이동할 스텝", by);
    create("graph.editor.stepN", lang, "스텝", by);
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
        }
      }
    }
  }
}
