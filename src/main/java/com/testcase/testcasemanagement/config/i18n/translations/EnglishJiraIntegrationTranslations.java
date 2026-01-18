// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishJiraIntegrationTranslations.java
package com.testcase.testcasemanagement.config.i18n.translations;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * English translations - JIRA Integration
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishJiraIntegrationTranslations {

    private final LanguageRepository languageRepository;
    private final TranslationKeyRepository translationKeyRepository;
    private final TranslationRepository translationRepository;

    public void initialize() {
        String languageCode = "en";
        String createdBy = "system";

        createTranslationIfNotExists("jira.summary.title", languageCode, "JIRA Status Summary", createdBy);
        createTranslationIfNotExists("jira.summary.filterAll", languageCode, "All", createdBy);
        createTranslationIfNotExists("jira.summary.filterInProgress", languageCode, "In Progress", createdBy);
        createTranslationIfNotExists("jira.summary.filterFailed", languageCode, "Failed", createdBy);
        createTranslationIfNotExists("jira.summary.filterPassed", languageCode, "Passed", createdBy);
        createTranslationIfNotExists("jira.summary.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("jira.summary.loadingData", languageCode, "Loading JIRA data...", createdBy);
        createTranslationIfNotExists("jira.summary.error", languageCode, "Error: {error}", createdBy);
        createTranslationIfNotExists("jira.summary.noData", languageCode, "No JIRA issues found.", createdBy);
        createTranslationIfNotExists("jira.summary.testResultsCount", languageCode, "Test Results ({count})",
                createdBy);
        createTranslationIfNotExists("jira.summary.noResults", languageCode, "No test results available.", createdBy);
        createTranslationIfNotExists("jira.summary.summaryStats", languageCode, "Summary Statistics", createdBy);
        createTranslationIfNotExists("jira.summary.totalIssues", languageCode, "Total Issues", createdBy);
        createTranslationIfNotExists("jira.summary.connectedResults", languageCode, "Connected Results", createdBy);
        createTranslationIfNotExists("jira.summary.connectionRate", languageCode, "Connection Rate", createdBy);
        createTranslationIfNotExists("jira.summary.hasNoFailed", languageCode, "No Failures", createdBy);
        createTranslationIfNotExists("jira.summary.hasFailed", languageCode, "Has Failures", createdBy);
        createTranslationIfNotExists("jira.summary.latestTest", languageCode, "Latest Test:", createdBy);
        createTranslationIfNotExists("jira.summary.executionTime", languageCode, "Execution Time:", createdBy);
        createTranslationIfNotExists("jira.summary.sync", languageCode, "Sync:", createdBy);
        createTranslationIfNotExists("jira.status.connectionStatus", languageCode, "JIRA Connection Status", createdBy);
        createTranslationIfNotExists("jira.status.notConfigured", languageCode, "JIRA Not Configured", createdBy);
        createTranslationIfNotExists("jira.messages.noConfig", languageCode,
                "JIRA settings are missing. Please register JIRA server information on the settings page.", createdBy);
        createTranslationIfNotExists("jira.settings.title", languageCode, "JIRA Integration Settings", createdBy);
        createTranslationIfNotExists("jira.settings.description", languageCode,
                "Integrate with JIRA to automatically add test results as comments to issues.", createdBy);
        createTranslationIfNotExists("jira.success.saved", languageCode, "JIRA settings saved successfully.",
                createdBy);
        createTranslationIfNotExists("jira.success.deleted", languageCode, "JIRA settings deleted successfully.",
                createdBy);
        createTranslationIfNotExists("jira.error.saveFailed", languageCode, "Failed to save JIRA settings.", createdBy);
        createTranslationIfNotExists("jira.error.deleteFailed", languageCode, "Failed to delete JIRA settings.",
                createdBy);
        createTranslationIfNotExists("jira.error.network", languageCode, "Please check your network connection.",
                createdBy);
        createTranslationIfNotExists("jira.error.authentication", languageCode,
                "Your session has expired. Please log in again.", createdBy);
        createTranslationIfNotExists("jira.error.encryption", languageCode,
                "Server configuration issue. Please contact administrator.", createdBy);
        createTranslationIfNotExists("jira.confirm.delete", languageCode,
                "Are you sure you want to delete JIRA settings?", createdBy);
        createTranslationIfNotExists("jira.button.configure", languageCode, "Configure Settings", createdBy);
        createTranslationIfNotExists("jira.button.delete", languageCode, "Delete Settings", createdBy);
        createTranslationIfNotExists("jira.indicator.checkingStatus", languageCode, "Checking...", createdBy);
        createTranslationIfNotExists("jira.indicator.unknown", languageCode, "Unknown", createdBy);
        createTranslationIfNotExists("jira.indicator.connectionFailed", languageCode, "Connection Failed", createdBy);
        createTranslationIfNotExists("jira.indicator.setupRequired", languageCode,
                "Please complete the setup to integrate with JIRA.", createdBy);
        createTranslationIfNotExists("jira.indicator.setupButton", languageCode, "Setup JIRA", createdBy);
        createTranslationIfNotExists("jira.indicator.settingsButton", languageCode, "Settings", createdBy);
        createTranslationIfNotExists("jira.indicator.refreshTooltip", languageCode, "Refresh Status", createdBy);
        createTranslationIfNotExists("jira.indicator.settingsTooltip", languageCode, "JIRA Settings", createdBy);
        createTranslationIfNotExists("jira.indicator.connectionInfo", languageCode, "Connection Info", createdBy);
        createTranslationIfNotExists("jira.indicator.server", languageCode, "Server", createdBy);
        createTranslationIfNotExists("jira.indicator.user", languageCode, "User", createdBy);
        createTranslationIfNotExists("jira.indicator.lastTested", languageCode, "Last Tested", createdBy);
        createTranslationIfNotExists("jira.indicator.lastUpdate", languageCode, "Last Update", createdBy);
        createTranslationIfNotExists("jira.indicator.error", languageCode, "Error", createdBy);
        createTranslationIfNotExists("jira.indicator.connectedMessage", languageCode,
                "Successfully connected to JIRA server.", createdBy);
        createTranslationIfNotExists("jira.indicator.connectionFailedMessage", languageCode,
                "Failed to connect to JIRA server.", createdBy);
        createTranslationIfNotExists("jira.config.dialogTitle.add", languageCode, "Add JIRA Settings", createdBy);
        createTranslationIfNotExists("jira.config.dialogTitle.edit", languageCode, "Edit JIRA Settings", createdBy);
        createTranslationIfNotExists("jira.config.serverUrl", languageCode, "JIRA Server URL", createdBy);
        createTranslationIfNotExists("jira.config.serverUrlPlaceholder", languageCode,
                "https://your-domain.atlassian.net", createdBy);
        createTranslationIfNotExists("jira.config.serverUrlHelper", languageCode,
                "Enter your JIRA server URL (e.g., https://company.atlassian.net)", createdBy);
        createTranslationIfNotExists("jira.config.username", languageCode, "Username (Email)", createdBy);
        createTranslationIfNotExists("jira.config.usernamePlaceholder", languageCode, "user@company.com", createdBy);
        createTranslationIfNotExists("jira.config.usernameHelper", languageCode, "Email address used for JIRA login",
                createdBy);
        createTranslationIfNotExists("jira.config.apiToken", languageCode, "API Token", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenHelper", languageCode, "Enter your JIRA API token",
                createdBy);
        createTranslationIfNotExists("jira.config.testProjectKey", languageCode, "Test Project Key (Optional)",
                createdBy);
        createTranslationIfNotExists("jira.config.testProjectKeyPlaceholder", languageCode, "TEST", createdBy);
        createTranslationIfNotExists("jira.config.testProjectKeyHelper", languageCode,
                "Project key to use for connection test (optional)", createdBy);
        createTranslationIfNotExists("jira.config.autoTest", languageCode,
                "Automatically test connection before saving", createdBy);
        createTranslationIfNotExists("jira.config.testButton", languageCode, "Test Connection", createdBy);
        createTranslationIfNotExists("jira.config.testing", languageCode, "Testing...", createdBy);
        createTranslationIfNotExists("jira.config.testSuccess", languageCode, "Connection Successful", createdBy);
        createTranslationIfNotExists("jira.config.testFailed", languageCode, "Connection Failed", createdBy);
        createTranslationIfNotExists("jira.config.jiraVersion", languageCode, "JIRA Version", createdBy);
        createTranslationIfNotExists("jira.config.testTime", languageCode, "Test Time", createdBy);
        createTranslationIfNotExists("jira.config.availableProjects", languageCode, "Available Projects:", createdBy);
        createTranslationIfNotExists("jira.config.moreProjects", languageCode, "{count} more projects", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenGuide", languageCode, "How to generate API token:",
                createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep1", languageCode,
                "1. JIRA → Profile → Account Settings → Security", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep2", languageCode, "2. Click \"Create API token\"",
                createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep3", languageCode, "3. Enter token name and create",
                createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep4", languageCode,
                "4. Copy the generated token and paste above", createdBy);
        createTranslationIfNotExists("jira.config.cancelButton", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("jira.config.saveButton", languageCode, "Save", createdBy);
        createTranslationIfNotExists("jira.config.saving", languageCode, "Saving...", createdBy);
        createTranslationIfNotExists("jira.config.error.serverUrlRequired", languageCode,
                "Please enter JIRA server URL", createdBy);
        createTranslationIfNotExists("jira.config.error.invalidUrl", languageCode, "Please enter a valid URL format",
                createdBy);
        createTranslationIfNotExists("jira.config.error.usernameRequired", languageCode, "Please enter username",
                createdBy);
        createTranslationIfNotExists("jira.config.error.apiTokenRequired", languageCode, "Please enter API token",
                createdBy);
        createTranslationIfNotExists("jira.config.error.connectionTestFailed", languageCode,
                "No response from connection test. Please check server status.", createdBy);
        createTranslationIfNotExists("jira.config.error.testError", languageCode,
                "An error occurred during connection test", createdBy);
        createTranslationIfNotExists("jira.config.confirm.saveWithoutTest", languageCode,
                "JIRA connection failed. Do you still want to save?", createdBy);
        createTranslationIfNotExists("jira.config.error.general", languageCode,
                "An error occurred while saving settings.", createdBy);
        createTranslationIfNotExists("jira.api.connectionSuccess", languageCode, "JIRA Connection Successful",
                createdBy);
        createTranslationIfNotExists("jira.api.authFailure", languageCode,
                "Authentication failed or insufficient permissions", createdBy);
        createTranslationIfNotExists("jira.api.serverError", languageCode, "JIRA Server Error", createdBy);
        createTranslationIfNotExists("jira.api.networkError", languageCode, "Network Connection Failed", createdBy);
        createTranslationIfNotExists("jira.api.testFailure", languageCode, "Connection Test Failed", createdBy);
        createTranslationIfNotExists("jira.api.unknownError", languageCode, "Unknown Error", createdBy);
        createTranslationIfNotExists("jira.error.saveFailed", languageCode, "Failed to save", createdBy);
        createTranslationIfNotExists("jira.error.deleteFailed", languageCode, "Failed to delete", createdBy);
        createTranslationIfNotExists("jira.error.network", languageCode, "Network connection error", createdBy);
        createTranslationIfNotExists("jira.error.authentication", languageCode, "Authentication failed", createdBy);
        createTranslationIfNotExists("jira.error.encryption", languageCode, "Encryption processing error", createdBy);
        createTranslationIfNotExists("jira.status.connectionStatus", languageCode, "JIRA Connection Status", createdBy);
        createTranslationIfNotExists("jira.status.connected", languageCode, "Connected", createdBy);
        createTranslationIfNotExists("jira.status.disconnected", languageCode, "Disconnected", createdBy);
        createTranslationIfNotExists("jira.messages.connectionError", languageCode, "Failed to connect to JIRA",
                createdBy);
        createTranslationIfNotExists("jira.messages.syncSuccess", languageCode, "Successfully synchronized with JIRA",
                createdBy);
        createTranslationIfNotExists("jira.messages.syncError", languageCode, "Failed to synchronize with JIRA",
                createdBy);

        // JiraCommentDialog Component
        createTranslationIfNotExists("jira.comment.dialogTitle", languageCode, "Add JIRA Comment", createdBy);
        createTranslationIfNotExists("jira.comment.connectionStatus.connected", languageCode,
                "JIRA Connected ({serverUrl})", createdBy);
        createTranslationIfNotExists("jira.comment.connectionStatus.notConnected", languageCode,
                "Please check JIRA settings or connection status", createdBy);
        createTranslationIfNotExists("jira.comment.error.noConfig", languageCode,
                "JIRA is not configured or connection failed. Please check settings.", createdBy);
        createTranslationIfNotExists("jira.comment.error.checkStatusFailed", languageCode,
                "Unable to check JIRA connection status.", createdBy);
        createTranslationIfNotExists("jira.comment.error.issueKeyRequired", languageCode,
                "Please enter JIRA issue key.", createdBy);
        createTranslationIfNotExists("jira.comment.error.invalidIssueKey", languageCode,
                "Invalid JIRA issue key format. (e.g., TEST-123)", createdBy);
        createTranslationIfNotExists("jira.comment.error.commentRequired", languageCode,
                "Please enter comment content.", createdBy);
        createTranslationIfNotExists("jira.comment.success.added", languageCode,
                "Comment successfully added to JIRA issue!", createdBy);
        createTranslationIfNotExists("jira.comment.detectedIssues.linked", languageCode,
                "Linked and Detected JIRA Issues:", createdBy);
        createTranslationIfNotExists("jira.comment.detectedIssues.fromNotes", languageCode,
                "JIRA Issues Detected in Test Notes:", createdBy);
        createTranslationIfNotExists("jira.comment.detectedIssues.legend", languageCode,
                "Green: Linked issues, Gray: Detected in notes", createdBy);
        createTranslationIfNotExists("jira.comment.field.issueKey.label", languageCode, "JIRA Issue Key", createdBy);
        createTranslationIfNotExists("jira.comment.field.issueKey.placeholder", languageCode, "e.g., TEST-123, BUG-456",
                createdBy);
        createTranslationIfNotExists("jira.comment.field.issueKey.helper", languageCode,
                "Enter JIRA issue key (PROJECT-NUMBER format)", createdBy);
        createTranslationIfNotExists("jira.comment.field.autoGenerate.label", languageCode,
                "Auto-generate comment from test result", createdBy);
        createTranslationIfNotExists("jira.comment.field.comment.label", languageCode, "Comment Content", createdBy);
        createTranslationIfNotExists("jira.comment.field.comment.placeholder", languageCode,
                "Enter comment to add to JIRA issue...", createdBy);
        createTranslationIfNotExists("jira.comment.field.comment.charCount", languageCode, "{count} characters",
                createdBy);
        createTranslationIfNotExists("jira.comment.testInfo.title", languageCode, "Test Information:", createdBy);
        createTranslationIfNotExists("jira.comment.testInfo.result", languageCode, "Result: {result}", createdBy);
        createTranslationIfNotExists("jira.comment.testInfo.notes", languageCode, "Test Notes", createdBy);
        createTranslationIfNotExists("jira.comment.button.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("jira.comment.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("jira.comment.button.send", languageCode, "Send Comment", createdBy);
        createTranslationIfNotExists("jira.comment.button.sending", languageCode, "Sending...", createdBy);
        createTranslationIfNotExists("jira.comment.button.regenerate", languageCode, "Regenerate Comment", createdBy);
        createTranslationIfNotExists("jira.comment.template.title", languageCode, "Test Result Update", createdBy);
        createTranslationIfNotExists("jira.comment.template.testCase", languageCode, "Test Case:", createdBy);
        createTranslationIfNotExists("jira.comment.template.result", languageCode, "Result:", createdBy);
        createTranslationIfNotExists("jira.comment.template.executedAt", languageCode, "Executed At:", createdBy);
        createTranslationIfNotExists("jira.comment.template.details", languageCode, "Details:", createdBy);
        createTranslationIfNotExists("jira.comment.template.actionRequired", languageCode,
                "Action Required: Please review the failed test and fix related issues.", createdBy);
        createTranslationIfNotExists("jira.comment.template.footer", languageCode,
                "Auto-generated by Test Case Manager", createdBy);
    }

    private void createTranslationIfNotExists(String keyName, String languageCode, String value, String createdBy) {
        Optional<TranslationKey> translationKeyOpt = translationKeyRepository.findByKeyName(keyName);
        if (translationKeyOpt.isPresent()) {
            TranslationKey translationKey = translationKeyOpt.get();
            Optional<Language> languageOpt = languageRepository.findByCode(languageCode);
            if (languageOpt.isPresent()) {
                Language language = languageOpt.get();
                Optional<Translation> existingTranslationOpt = translationRepository
                        .findByTranslationKeyAndLanguage(translationKey, language);
                if (existingTranslationOpt.isEmpty()) {
                    Translation translation = new Translation();
                    translation.setTranslationKey(translationKey);
                    translation.setLanguage(language);
                    translation.setValue(value);
                    translation.setCreatedBy(createdBy);
                    translation.setUpdatedBy(createdBy);
                    translation.setIsActive(true);
                    translationRepository.save(translation);
                    log.debug("Translation created: {} - {}", keyName, languageCode);
                } else {
                    Translation existingTranslation = existingTranslationOpt.get();
                    if (!existingTranslation.getValue().equals(value)) {
                        existingTranslation.setValue(value);
                        existingTranslation.setUpdatedBy(createdBy);
                        translationRepository.save(existingTranslation);
                        log.debug("Translation updated: {} - {}", keyName, languageCode);
                    } else {
                        log.debug("Translation exists and is identical: {} - {}", keyName, languageCode);
                    }
                }
            }
        } else {
            log.warn("Translation key not found: {}", keyName);
        }
    }
}
