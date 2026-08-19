// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishProjectSettingsTranslations.java
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

/** English translations - Project Settings */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishProjectSettingsTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "en";
    String by = "system";

    create("projectSettings.title", lang, "Project Settings", by);
    create("projectSettings.back", lang, "Back to project", by);
    create(
        "projectSettings.denied",
        lang,
        "Only project managers, lead developers, and system administrators can open project settings.",
        by);
    create("projectSettings.tab.general", lang, "General", by);
    create("projectSettings.tab.members", lang, "Members", by);
    create("projectSettings.general.code", lang, "Project code", by);
    create(
        "projectSettings.general.codeHint",
        lang,
        "The code cannot be changed after creation.",
        by);
    create("projectSettings.general.name", lang, "Project name", by);
    create("projectSettings.general.description", lang, "Description", by);
    create("projectSettings.general.displayOrder", lang, "Display order", by);
    create("projectSettings.general.save", lang, "Save", by);
    create("projectSettings.general.saved", lang, "Project settings saved.", by);
    create(
        "projectSettings.general.readonly",
        lang,
        "Only project managers and system administrators can change project information.",
        by);
    create("projectSettings.members.invite", lang, "Add member", by);
    create("projectSettings.members.username", lang, "Username", by);
    create("projectSettings.members.inviteSubmit", lang, "Add", by);
    create("projectSettings.members.invited", lang, "Member added.", by);
    create("projectSettings.members.removed", lang, "Member removed.", by);
    create("projectSettings.members.roleUpdated", lang, "Role updated.", by);
    create("projectSettings.members.remove", lang, "Remove member", by);
    create(
        "projectSettings.members.removeConfirm",
        lang,
        "Remove {username} from this project?",
        by);
    create("projectSettings.members.empty", lang, "This project has no members.", by);
    create(
        "projectSettings.members.hint",
        lang,
        "Role changes apply immediately. The last project manager cannot be demoted or removed.",
        by);
    create("projectSettings.members.column.username", lang, "Username", by);
    create("projectSettings.members.column.name", lang, "Name", by);
    create("projectSettings.members.column.email", lang, "Email", by);
    create("projectSettings.members.column.role", lang, "Role", by);
    create("projectSettings.members.column.actions", lang, "Actions", by);
    create("memberSearch.label", lang, "Search users", by);
    create("memberSearch.placeholder", lang, "Username, name, or email (2+ characters)", by);
    create("memberSearch.noOptions", lang, "No matching users.", by);
    create("memberSearch.hint", lang, "Type at least two characters to search.", by);
    create("memberSearch.loading", lang, "Searching...", by);

    create("projectSettings.role.projectManager", lang, "Project Manager", by);
    create("projectSettings.role.leadDeveloper", lang, "Lead Developer", by);
    create("projectSettings.role.developer", lang, "Developer", by);
    create("projectSettings.role.tester", lang, "Tester", by);
    create("projectSettings.role.contributor", lang, "Contributor", by);
    create("projectSettings.role.viewer", lang, "Viewer", by);
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
