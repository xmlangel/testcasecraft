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
    create("projectHeader.tabs.graph", lang, "Graph", by);
    create("graph.syncNow", lang, "Sync now", by);
    create("graph.syncing", lang, "Syncing…", by);
    create("graph.layout.label", lang, "Layout", by);
    create("graph.layout.concentric", lang, "Concentric (hub-centered)", by);
    create("graph.layout.circle", lang, "Circle", by);
    create("graph.layout.grid", lang, "Grid", by);
    create("graph.filter.folder", lang, "Folders", by);
    create("graph.filter.case", lang, "Cases", by);
    create("graph.filter.plan", lang, "Plans", by);
    create("graph.filter.execution", lang, "Executions", by);
    create("graph.filter.result", lang, "Results", by);
    create("graph.filter.scope", lang, "Plan/Execution", by);
    create("graph.filter.all", lang, "All", by);
    create("graph.filter.planPrefix", lang, "[Plan] ", by);
    create("graph.filter.executionPrefix", lang, "[Run] ", by);

    // 관계 편집 + 분기 편집 (v1.1.1)
    create("graph.relation.start", lang, "Start relation from this case", by);
    create("graph.relation.pickTarget", lang, "Click the target case node", by);
    create("graph.relation.cancel", lang, "Cancel relation", by);
    create("graph.relation.typeTitle", lang, "Select relation type", by);
    create("graph.relation.type", lang, "Type", by);
    create("graph.relation.dependsOn", lang, "depends on", by);
    create("graph.relation.relatesTo", lang, "relates to", by);
    create("graph.relation.blocks", lang, "blocks", by);
    create("graph.relation.save", lang, "Create relation", by);
    create("graph.relation.cancelBtn", lang, "Cancel", by);
    create("graph.relation.delete", lang, "Delete this relation", by);
    create("graph.relation.autoEdge", lang, "Relations created by sync cannot be deleted.", by);

    // 범례 (v1.1.1)
    create("graph.legend.title", lang, "Legend — colors & shapes", by);
    create("graph.legend.nodeTypes", lang, "Node types", by);
    create("graph.legend.testCase", lang, "Test case", by);
    create("graph.legend.folder", lang, "Folder", by);
    create("graph.legend.testPlan", lang, "Test plan", by);
    create("graph.legend.testExecution", lang, "Test execution", by);
    create("graph.legend.junitCase", lang, "JUnit case", by);
    create("graph.legend.jiraIssue", lang, "Jira issue", by);
    create("graph.legend.failureType", lang, "Failure cause (hub)", by);
    create("graph.legend.decision", lang, "Decision (branch)", by);
    create("graph.legend.resultStatus", lang, "Result status (color = status)", by);
    create(
        "graph.legend.edges",
        lang,
        "Edges: gray solid = automatic relation · purple dashed = user-defined relation",
        by);
    create("graph.editor.addBranch", lang, "Add branch", by);
    create("graph.editor.branchOf", lang, "Step", by);
    create("graph.editor.branches", lang, "branches", by);
    create("graph.editor.branchLabel", lang, "Condition label", by);
    create("graph.editor.branchTo", lang, "Go to step", by);
    create("graph.editor.stepN", lang, "Step", by);
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
