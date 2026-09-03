// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanAgentConnectionTranslations.java
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

/** 한국어 번역 - 에이전트 연동 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanAgentConnectionTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "ko";
    String by = "system";

    create("projectSettings.tab.agent", lang, "에이전트 연동", by);
    create("agentConnection.title", lang, "외부 QA 에이전트", by);
    create(
        "agentConnection.intro",
        lang,
        "자연어 테스트 케이스를 브라우저에서 실행하는 외부 에이전트를 연결합니다. 에이전트는 제품 밖에서 돌고, 결과만 테스트실행으로 들어옵니다.",
        by);
    create("agentConnection.unset", lang, "아직 연결된 에이전트가 없습니다.", by);
    create(
        "agentConnection.readonly",
        lang,
        "에이전트 연동 설정은 프로젝트 매니저와 시스템 관리자만 바꿀 수 있습니다.",
        by);
    create("agentConnection.field.name", lang, "에이전트 이름", by);
    create("agentConnection.field.nameHint", lang, "자동화 화면 버튼에 이 이름이 그대로 나옵니다.", by);
    create("agentConnection.field.serverUrl", lang, "에이전트 주소", by);
    create(
        "agentConnection.field.serverUrlHint",
        lang,
        "http 또는 https 로 시작하고, 브라우저와 서버 양쪽에서 닿는 주소를 넣습니다.",
        by);
    create("agentConnection.field.browserUrl", lang, "브라우저용 주소 (선택)", by);
    create(
        "agentConnection.field.browserUrlHint",
        lang,
        "비워 두면 위 주소를 그대로 씁니다. 서버가 닿는 주소와 브라우저가 닿는 주소가 다를 때만 채웁니다 — 실행 버튼은 이 주소를 엽니다.",
        by);
    create("agentConnection.field.token", lang, "인증 토큰", by);
    create(
        "agentConnection.field.tokenHint",
        lang,
        "비워 두면 기존 값을 그대로 씁니다. 저장된 토큰은 화면에 보이지 않습니다.",
        by);
    create("agentConnection.field.tokenSaved", lang, "토큰이 저장되어 있습니다.", by);
    create("agentConnection.field.defaultProfile", lang, "기본 프로필", by);
    create(
        "agentConnection.field.defaultProfileHint",
        lang,
        "에이전트 앱에 등록한 프로필 식별자입니다. 정책과 컨텍스트가 그 안에 있습니다.",
        by);
    create("agentConnection.field.isActive", lang, "이 프로젝트에서 사용", by);
    create(
        "agentConnection.field.isActiveHint",
        lang,
        "꺼 두면 자동화 화면에 에이전트 관련 항목이 나타나지 않습니다.",
        by);
    create("agentConnection.save", lang, "저장", by);
    create("agentConnection.saved", lang, "에이전트 연동 설정을 저장했습니다.", by);
    create("agentConnection.test", lang, "연결 테스트", by);
    create("agentConnection.testing", lang, "확인하는 중...", by);
    create("agentConnection.delete", lang, "연동 삭제", by);
    create("agentConnection.deleteConfirm", lang, "이 프로젝트의 에이전트 연동 설정을 삭제하시겠습니까?", by);
    create("agentConnection.deleted", lang, "에이전트 연동 설정을 삭제했습니다.", by);
    create(
        "agentConnection.requestFailed",
        lang,
        "요청을 처리하지 못했습니다",
        by);
    create("agentConnection.status.verified", lang, "연결됨", by);
    create("agentConnection.status.failed", lang, "연결할 수 없음", by);
    create("agentConnection.status.unknown", lang, "확인하지 않음", by);
    create("agentConnection.status.version", lang, "에이전트 버전", by);
    create("agentConnection.status.lastTest", lang, "마지막 확인", by);
    create("agentConnection.status.latency", lang, "응답 시간", by);
    create("agentConnection.status.saveFirst", lang, "먼저 저장한 뒤 연결을 확인합니다.", by);
    create("agentConnection.run.button", lang, "{name} 실행", by);
    create("agentConnection.run.disabled", lang, "에이전트 서버에 연결할 수 없습니다", by);
    create(
        "agentConnection.run.newTab",
        lang,
        "에이전트 앱이 새 창에서 열립니다. 결과는 테스트실행으로 들어옵니다.",
        by);
    create(
        "agentConnection.limits",
        lang,
        "케이스 하나에 30초에서 1분이 걸리고 비용이 듭니다. 같은 케이스를 다시 돌리면 행동이 조금씩 달라집니다. 판정은 초안이며 확정은 사람이 합니다. 파일 업로드와 캡차가 들어간 시나리오는 지원하지 않습니다.",
        by);
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
