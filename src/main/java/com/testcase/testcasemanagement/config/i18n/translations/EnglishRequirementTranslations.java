// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishRequirementTranslations.java
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

/** 영어 번역 - 요구사항 관리 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishRequirementTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "en";
    String by = "system";

    create("projectHeader.tabs.requirements", lang, "Requirements", by);
    create("requirement.add", lang, "Add Requirement", by);
    create("requirement.coverage.COVERED", lang, "Covered", by);
    create("requirement.coverage.EXCLUDED", lang, "Excluded", by);
    create("requirement.coverage.PARTIAL", lang, "Partial", by);
    create("requirement.coverage.UNCOVERED", lang, "Not covered", by);
    create("requirement.coverage.gapsOnly", lang, "Show gaps only", by);
    create("requirement.coverage.rate", lang, "Coverage", by);
    create("requirement.coverage.testable", lang, "Testable requirements", by);
    create("requirement.edit", lang, "Edit Requirement", by);
    create("requirement.empty", lang, "No requirements.", by);
    create("requirement.field.coverage", lang, "Coverage", by);
    create("requirement.field.docId", lang, "Requirement ID", by);
    create("requirement.field.expectedCoverage", lang, "Needed test cases", by);
    create("requirement.field.linked", lang, "Linked TCs", by);
    create("requirement.field.noParent", lang, "(Top level)", by);
    create("requirement.field.parentSpec", lang, "Parent document", by);
    create("requirement.field.scope", lang, "Scope / description", by);
    create("requirement.field.spec", lang, "Requirement document", by);
    create("requirement.field.specDocId", lang, "Document ID", by);
    create("requirement.field.status", lang, "Status", by);
    create("requirement.field.title", lang, "Title", by);
    create("requirement.field.type", lang, "Type", by);
    create("requirement.link", lang, "Link", by);
    create("requirement.linkedCases", lang, "Linked test cases", by);
    create("requirement.noLinkedCases", lang, "No linked test cases.", by);
    create("requirement.report.cases", lang, "Test case results", by);
    create("requirement.report.execution", lang, "Test run", by);
    create("requirement.report.latestAll", lang, "Whole plan (latest result per TC)", by);
    create("requirement.report.pickPlan", lang, "Select a test plan to see the report.", by);
    create("requirement.report.plan", lang, "Test plan", by);
    create("requirement.report.verdict", lang, "Verdict", by);
    create("requirement.searchCases", lang, "Search test cases", by);
    create("requirement.spec.add", lang, "Add Requirement Document", by);
    create("requirement.spec.all", lang, "All", by);
    create(
        "requirement.spec.confirmDelete",
        lang,
        "This deletes the document, its child documents, and all requirements and test case links"
            + " inside them. Test cases themselves are kept. Continue?",
        by);
    create("requirement.spec.edit", lang, "Edit Requirement Document", by);
    create("requirement.spec.empty", lang, "Add a requirement document first.", by);
    create("requirement.spec.title", lang, "Requirement Documents", by);
    create("requirement.status.DRAFT", lang, "Draft", by);
    create("requirement.status.FINISH", lang, "Finished", by);
    create("requirement.status.IMPLEMENTED", lang, "Implemented", by);
    create("requirement.status.NOT_TESTABLE", lang, "Not testable", by);
    create("requirement.status.OBSOLETE", lang, "Obsolete", by);
    create("requirement.status.REVIEW", lang, "In review", by);
    create("requirement.status.REWORK", lang, "Rework", by);
    create("requirement.status.VALID", lang, "Valid", by);
    create("requirement.testCase.none", lang, "No linked requirements.", by);
    create("requirement.testCase.placeholder", lang, "Search requirements", by);
    create("requirement.testCase.title", lang, "Linked requirements", by);
    create("requirement.type.CONSTRAINT", lang, "Constraint", by);
    create("requirement.type.FEATURE", lang, "Feature", by);
    create("requirement.type.INFORMATIONAL", lang, "Informational", by);
    create("requirement.type.NON_FUNCTIONAL", lang, "Non-functional", by);
    create("requirement.type.SYSTEM_FUNCTION", lang, "System function", by);
    create("requirement.type.USER_INTERFACE", lang, "User interface", by);
    create("requirement.type.USE_CASE", lang, "Use case", by);
    create("requirement.unlink", lang, "Unlink", by);
    create("requirement.verdict.BLOCKED", lang, "Blocked", by);
    create("requirement.verdict.FAIL", lang, "Failed", by);
    create("requirement.verdict.NOT_IN_PLAN", lang, "Not in plan", by);
    create("requirement.verdict.NOT_RUN", lang, "Not run", by);
    create("requirement.verdict.PASS", lang, "Passed", by);
    create("requirement.view.coverage", lang, "Coverage", by);
    create("requirement.view.list", lang, "Requirements", by);
    create("requirement.view.report", lang, "Report", by);
    create("requirement.clickToView", lang, "Click to view details", by);
    create("requirement.noScope", lang, "No scope or description written.", by);
    create("requirement.openRequirement", lang, "Open in Requirements", by);
    create("requirement.openTestCase", lang, "Open test case", by);
    create("requirement.collapse", lang, "Collapse", by);
    create("requirement.filterLinked", lang, "Find in linked test cases", by);
    create("requirement.next", lang, "Next", by);
    create("requirement.noMatch", lang, "No matches.", by);
    create("requirement.prev", lang, "Previous", by);
    create("requirement.coverage.chart.bySpec", lang, "Coverage by requirement document", by);
    create("requirement.coverage.chart.overall", lang, "Overall coverage", by);
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
