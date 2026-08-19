// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanProjectSettingsTranslations.java
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

/** Korean translations - Project Settings */
@Slf4j
@Component
@RequiredArgsConstructor
public class KoreanProjectSettingsTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "ko";
    String by = "system";

    create("projectSettings.title", lang, "프로젝트 설정", by);
    create("projectSettings.back", lang, "프로젝트로 돌아가기", by);
    create("projectSettings.denied", lang, "프로젝트 설정은 프로젝트 매니저·리드 개발자·시스템 관리자만 열 수 있습니다.", by);
    create("projectSettings.tab.general", lang, "일반", by);
    create("projectSettings.tab.members", lang, "멤버", by);
    create("projectSettings.general.code", lang, "프로젝트 코드", by);
    create("projectSettings.general.codeHint", lang, "코드는 생성 후 변경할 수 없습니다.", by);
    create("projectSettings.general.name", lang, "프로젝트 이름", by);
    create("projectSettings.general.description", lang, "설명", by);
    create("projectSettings.general.displayOrder", lang, "정렬 순서", by);
    create("projectSettings.general.save", lang, "저장", by);
    create("projectSettings.general.saved", lang, "프로젝트 설정을 저장했습니다.", by);
    create("projectSettings.general.readonly", lang, "프로젝트 정보 변경은 프로젝트 매니저와 시스템 관리자만 할 수 있습니다.", by);
    create("projectSettings.members.invite", lang, "멤버 추가", by);
    create("projectSettings.members.username", lang, "사용자명", by);
    create("projectSettings.members.inviteSubmit", lang, "추가", by);
    create("projectSettings.members.invited", lang, "멤버를 추가했습니다.", by);
    create("projectSettings.members.removed", lang, "멤버를 제거했습니다.", by);
    create("projectSettings.members.roleUpdated", lang, "역할을 변경했습니다.", by);
    create("projectSettings.members.remove", lang, "멤버 제거", by);
    create("projectSettings.members.removeConfirm", lang, "{username} 을(를) 이 프로젝트에서 제거하시겠습니까?", by);
    create("projectSettings.members.empty", lang, "프로젝트 멤버가 없습니다.", by);
    create(
        "projectSettings.members.hint",
        lang,
        "역할을 바꾸면 곧바로 적용됩니다. 마지막 프로젝트 매니저는 역할을 바꾸거나 제거할 수 없습니다.",
        by);
    create("projectSettings.members.column.username", lang, "사용자명", by);
    create("projectSettings.members.column.name", lang, "이름", by);
    create("projectSettings.members.column.email", lang, "이메일", by);
    create("projectSettings.members.column.role", lang, "역할", by);
    create("projectSettings.members.column.actions", lang, "동작", by);
    create("projectSettings.role.projectManager", lang, "프로젝트 매니저", by);
    create("projectSettings.role.leadDeveloper", lang, "리드 개발자", by);
    create("projectSettings.role.developer", lang, "개발자", by);
    create("projectSettings.role.tester", lang, "테스터", by);
    create("projectSettings.role.contributor", lang, "기여자", by);
    create("projectSettings.role.viewer", lang, "뷰어", by);
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
