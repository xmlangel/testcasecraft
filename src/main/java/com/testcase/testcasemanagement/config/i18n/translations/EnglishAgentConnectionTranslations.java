// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishAgentConnectionTranslations.java
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

/** English translations - Agent connection */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishAgentConnectionTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String lang = "en";
    String by = "system";

    create("projectSettings.tab.agent", lang, "Agent", by);
    create("agentConnection.title", lang, "External QA agent", by);
    create(
        "agentConnection.intro",
        lang,
        "Connect an external agent that runs natural-language test cases in a real browser. The agent lives outside this product; only its results come back as a test execution.",
        by);
    create("agentConnection.unset", lang, "No agent is connected yet.", by);
    create(
        "agentConnection.readonly",
        lang,
        "Only project managers and system administrators can change the agent connection.",
        by);
    create("agentConnection.field.name", lang, "Agent name", by);
    create(
        "agentConnection.field.nameHint",
        lang,
        "This name appears on the button in the automation screen.",
        by);
    create("agentConnection.field.serverUrl", lang, "Agent URL", by);
    create(
        "agentConnection.field.serverUrlHint",
        lang,
        "Enter a URL that starts with http or https and is reachable from both the browser and the server.",
        by);
    create("agentConnection.field.browserUrl", lang, "Browser URL (optional)", by);
    create(
        "agentConnection.field.browserUrlHint",
        lang,
        "Leave it blank to reuse the address above. Fill it only when the server and the browser reach the agent at different addresses — the run button opens this one.",
        by);
    create("agentConnection.field.token", lang, "Auth token", by);
    create(
        "agentConnection.field.tokenHint",
        lang,
        "Leave it blank to keep the current token. A saved token is never shown.",
        by);
    create("agentConnection.field.tokenSaved", lang, "A token is saved.", by);
    create("agentConnection.field.defaultProfile", lang, "Default profile", by);
    create(
        "agentConnection.field.defaultProfileHint",
        lang,
        "The profile identifier registered in the agent app. Its policy and context live there.",
        by);
    create("agentConnection.field.isActive", lang, "Use in this project", by);
    create(
        "agentConnection.field.isActiveHint",
        lang,
        "While this is off, nothing agent-related appears in the automation screen.",
        by);
    create("agentConnection.save", lang, "Save", by);
    create("agentConnection.saved", lang, "Agent connection saved.", by);
    create("agentConnection.test", lang, "Test connection", by);
    create("agentConnection.testing", lang, "Checking...", by);
    create("agentConnection.delete", lang, "Remove connection", by);
    create(
        "agentConnection.deleteConfirm",
        lang,
        "Remove the agent connection for this project?",
        by);
    create("agentConnection.deleted", lang, "Agent connection removed.", by);
    create(
        "agentConnection.requestFailed",
        lang,
        "The request could not be completed",
        by);
    create("agentConnection.status.verified", lang, "Connected", by);
    create("agentConnection.status.failed", lang, "Cannot connect", by);
    create("agentConnection.status.unknown", lang, "Not checked", by);
    create("agentConnection.status.version", lang, "Agent version", by);
    create("agentConnection.status.lastTest", lang, "Last checked", by);
    create("agentConnection.status.latency", lang, "Response time", by);
    create(
        "agentConnection.status.saveFirst",
        lang,
        "Save first, then test the connection.",
        by);
    create("agentConnection.run.button", lang, "Run with {name}", by);
    create("agentConnection.run.disabled", lang, "Cannot reach the agent server", by);
    create(
        "agentConnection.run.newTab",
        lang,
        "The agent app opens in a new tab. Results come back as a test execution.",
        by);
    create(
        "agentConnection.limits",
        lang,
        "Each case takes 30 to 60 seconds and costs money. Re-running the same case gives slightly different behavior. Verdicts are drafts; a person confirms them. File upload and captcha scenarios are not supported.",
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
