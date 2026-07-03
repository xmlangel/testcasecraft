// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishGraphTranslations.java
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

/** English translations - Graph view / Graph test case (v1.1.1) */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishGraphTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "en";
    String by = "system";

    create("graph.nav", lang, "Graph View", by);
    create("graph.title", lang, "Graph View", by);
    create("graph.selectProject", lang, "Select a project to view the graph.", by);
    create(
        "graph.dbUnavailable",
        lang,
        "Cannot connect to the graph database. Contact your administrator.",
        by);
    create(
        "graph.empty", lang, "No graph data to display. Synchronization may not have run yet.", by);
    create("graph.refresh", lang, "Load", by);
    create("graph.tab.structure", lang, "Structure", by);
    create("graph.tab.failures", lang, "Failure Clusters", by);
    create("graph.tab.neighborhood", lang, "Case Neighborhood", by);
    create("graph.layout.force", lang, "Force", by);
    create("graph.layout.hierarchy", lang, "Hierarchy", by);
    create("graph.caseIdLabel", lang, "Test Case ID", by);
    create("graph.depth", lang, "Depth", by);
    create("graph.detail.empty", lang, "Click a node to see its details.", by);
    create("graph.editor.title", lang, "Edit Graph Test Case", by);
    create(
        "graph.editor.hint",
        lang,
        "On save, the graph becomes the source of truth and the step table is refreshed as a"
            + " read-only mirror.",
        by);
    create("graph.editor.noProject", lang, "The projectId parameter is required.", by);
    create("graph.editor.action", lang, "Action", by);
    create("graph.editor.expected", lang, "Expected Result", by);
    create("graph.editor.addStep", lang, "Add Step", by);
    create("graph.editor.save", lang, "Save", by);
    create("graph.editor.saved", lang, "Saved", by);
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
