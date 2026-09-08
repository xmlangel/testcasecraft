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
        "The address the product server uses to reach the agent. With both in Docker, use http://host.docker.internal:8090 — the product is a container too, so localhost points at itself. Running the product outside Docker, use http://localhost:8090.",
        by);
    create("agentConnection.field.browserUrl", lang, "Browser URL (optional)", by);
    create(
        "agentConnection.field.browserUrlHint",
        lang,
        "The address the run button opens. If you put host.docker.internal above, use http://localhost:8090 here — that name resolves only inside containers and a person's browser does not know it. Leave empty when both addresses match.",
        by);
    create("agentConnection.field.token", lang, "Auth token", by);
    create(
        "agentConnection.field.tokenHint",
        lang,
        "Use the same value as AGENT_API_TOKEN in the agent's .env. Leave empty to keep the stored token; it is never shown here.",
        by);
    create("agentConnection.field.tokenSaved", lang, "A token is saved.", by);
    create("agentConnection.field.defaultProfile", lang, "Default profile", by);
    create(
        "agentConnection.field.defaultProfileHint",
        lang,
        "The profile identifier registered in the agent app. Its policy and context live there, and a fresh install ships one named local.",
        by);
    create("agentConnection.field.isActive", lang, "Use in this project", by);
    create(
        "agentConnection.field.isActiveHint",
        lang,
        "While this is off, nothing agent-related appears in the automation screen.",
        by);
    create(
        "agentConnection.field.isActiveRunNotice",
        lang,
        "Turning this on does not run anything. The agent is a separate stack outside the product, so bring that up first.",
        by);
    create(
        "agentConnection.field.isActiveRunStep1",
        lang,
        "Get the agent, fill in its .env, and start it with docker compose up -d. The default port is 8090.",
        by);
    create(
        "agentConnection.field.isActiveRunStep2",
        lang,
        "Put the same value as AGENT_API_TOKEN from that .env into the auth token above. The connection test does not pass when the values differ.",
        by);
    create(
        "agentConnection.field.isActiveRunStep3",
        lang,
        "Press Test connection. It has to pass before agent items appear in the automation screen.",
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
