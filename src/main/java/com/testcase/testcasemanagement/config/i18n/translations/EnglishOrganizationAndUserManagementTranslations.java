// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishOrganizationAndUserManagementTranslations.java
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
 * English translations - Organization and User Management
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishOrganizationAndUserManagementTranslations {

        private final LanguageRepository languageRepository;
        private final TranslationKeyRepository translationKeyRepository;
        private final TranslationRepository translationRepository;

        public void initialize() {
                String languageCode = "en";
                String createdBy = "system";

                createTranslationIfNotExists("junit.tracelog.skipMessage", languageCode, "Skip Message", createdBy);
                createTranslationIfNotExists("junit.tracelog.noErrorLog", languageCode,
                                "No error logs for this test case.",
                                createdBy);
                createTranslationIfNotExists("junit.testbody.tab", languageCode, "Test Body", createdBy);
                createTranslationIfNotExists("junit.testbody.systemOut", languageCode, "System Out", createdBy);
                createTranslationIfNotExists("junit.testbody.systemErr", languageCode, "System Error", createdBy);
                createTranslationIfNotExists("junit.testbody.noOutput", languageCode,
                                "No system output for this test case.",
                                createdBy);
                createTranslationIfNotExists("junit.testbody.fullscreen", languageCode, "View in fullscreen",
                                createdBy);
                createTranslationIfNotExists("junit.testbody.fullscreenTitle", languageCode, "Test Body - {testName}",
                                createdBy);
                createTranslationIfNotExists("recentResults.status.notRun", languageCode, "Not Run", createdBy);
                createTranslationIfNotExists("recentResults.status.unknown", languageCode, "Unknown", createdBy);
                createTranslationIfNotExists("recentResults.message.noResults", languageCode, "No recent test results.",
                                createdBy);
                createTranslationIfNotExists("recentResults.title.withCount", languageCode,
                                "Recent Test Results ({count} items)", createdBy);
                createTranslationIfNotExists("recentResults.button.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("recentResults.label.testcase", languageCode, "Test Case", createdBy);
                createTranslationIfNotExists("recentResults.label.project", languageCode, "Project:", createdBy);
                createTranslationIfNotExists("recentResults.label.execution", languageCode, "Execution:", createdBy);
                createTranslationIfNotExists("recentResults.label.executor", languageCode, "Executor:", createdBy);
                createTranslationIfNotExists("recentResults.label.notes", languageCode, "Notes:", createdBy);
                createTranslationIfNotExists("recentResults.testcase.fallback", languageCode, "Test Case {id}",
                                createdBy);
                createTranslationIfNotExists("junit.table.recentTestExecutionResults", languageCode,
                                "Recent Test Execution Results", createdBy);
                createTranslationIfNotExists("junit.fallback.noName", languageCode, "(No Name)", createdBy);
                createTranslationIfNotExists("junit.error.loadFailed", languageCode, "Failed to load test results.",
                                createdBy);
                createTranslationIfNotExists("junit.confirm.deleteResult", languageCode,
                                "Are you sure you want to delete this test result?", createdBy);
                createTranslationIfNotExists("junit.comment.fileNameExtraction", languageCode,
                                "Extract execution name from file name", createdBy);
                createTranslationIfNotExists("junit.status.uploading", languageCode, "Uploading", createdBy);
                createTranslationIfNotExists("junit.status.parsing", languageCode, "Parsing", createdBy);
                createTranslationIfNotExists("junit.status.completed", languageCode, "Completed", createdBy);
                createTranslationIfNotExists("junit.status.unknown", languageCode, "Unknown", createdBy);
                createTranslationIfNotExists("junit.placeholder.executionName", languageCode,
                                "Execution Name (e.g., Sprint 24 Integration Tests)", createdBy);
                createTranslationIfNotExists("mail.manager.title", languageCode, "Mail Settings Management", createdBy);
                createTranslationIfNotExists("mail.manager.currentSettings", languageCode, "Current Mail Settings",
                                createdBy);
                createTranslationIfNotExists("mail.manager.subheader", languageCode,
                                "System email sending configuration status", createdBy);
                createTranslationIfNotExists("mail.manager.notConfigured", languageCode,
                                "Mail settings are not configured. Please add new settings.", createdBy);
                createTranslationIfNotExists("mail.status.enabled", languageCode, "Mail Function", createdBy);
                createTranslationIfNotExists("mail.status.active", languageCode, "Active", createdBy);
                createTranslationIfNotExists("mail.status.inactive", languageCode, "Inactive", createdBy);
                createTranslationIfNotExists("mail.status.activatedStatus", languageCode, "Activated", createdBy);
                createTranslationIfNotExists("mail.status.deactivatedStatus", languageCode, "Deactivated", createdBy);
                createTranslationIfNotExists("mail.smtp.server", languageCode, "SMTP Server", createdBy);
                createTranslationIfNotExists("mail.smtp.sender", languageCode, "Sender", createdBy);
                createTranslationIfNotExists("mail.smtp.security", languageCode, "Security Settings", createdBy);
                createTranslationIfNotExists("mail.smtp.auth", languageCode, "Authentication", createdBy);
                createTranslationIfNotExists("mail.smtp.tls", languageCode, "TLS", createdBy);
                createTranslationIfNotExists("mail.smtp.used", languageCode, "Used", createdBy);
                createTranslationIfNotExists("mail.smtp.notUsed", languageCode, "Not Used", createdBy);
                createTranslationIfNotExists("mail.button.newSettings", languageCode, "New Settings", createdBy);
                createTranslationIfNotExists("mail.button.modifySettings", languageCode, "Modify Settings", createdBy);
                createTranslationIfNotExists("mail.button.testSend", languageCode, "Test Send", createdBy);
                createTranslationIfNotExists("mail.button.disable", languageCode, "Disable", createdBy);
                createTranslationIfNotExists("mail.button.detailedMethod", languageCode, "Detailed Setup Method",
                                createdBy);
                createTranslationIfNotExists("mail.guide.title", languageCode, "Gmail Setup Guide", createdBy);
                createTranslationIfNotExists("mail.guide.description", languageCode,
                                "TestCase Manager only supports Gmail SMTP. Gmail app password setup is required.",
                                createdBy);
                createTranslationIfNotExists("mail.guide.requirements", languageCode, "Required Requirements",
                                createdBy);
                createTranslationIfNotExists("mail.guide.gmailAccount", languageCode, "Gmail Account", createdBy);
                createTranslationIfNotExists("mail.guide.twoFactorAuth", languageCode,
                                "2-Factor Authentication Required",
                                createdBy);
                createTranslationIfNotExists("mail.guide.appPassword", languageCode, "Generate App Password",
                                createdBy);
                createTranslationIfNotExists("mail.config.title.new", languageCode, "New Mail Settings", createdBy);
                createTranslationIfNotExists("mail.config.title.edit", languageCode, "Edit Mail Settings", createdBy);
                createTranslationIfNotExists("mail.config.gmailInfo", languageCode,
                                "This system only supports Gmail SMTP. Gmail 2-factor authentication and app password are required.",
                                createdBy);
                createTranslationIfNotExists("mail.config.enableMail", languageCode, "Enable Mail Function", createdBy);
                createTranslationIfNotExists("mail.config.form.gmailAddress", languageCode, "Gmail Address", createdBy);
                createTranslationIfNotExists("mail.config.form.gmailAddressPlaceholder", languageCode,
                                "your-email@gmail.com",
                                createdBy);
                createTranslationIfNotExists("mail.config.form.gmailAddressHelper", languageCode,
                                "Example: your-email@gmail.com", createdBy);
                createTranslationIfNotExists("mail.config.form.appPassword", languageCode, "Gmail App Password",
                                createdBy);
                createTranslationIfNotExists("mail.config.form.appPasswordPlaceholder", languageCode,
                                "Gmail App Password",
                                createdBy);
                createTranslationIfNotExists("mail.config.form.appPasswordHelper", languageCode,
                                "16-digit Gmail app password (no spaces)", createdBy);
                createTranslationIfNotExists("mail.config.form.senderName", languageCode, "Sender Name", createdBy);
                createTranslationIfNotExists("mail.config.form.senderNamePlaceholder", languageCode, "TestCase Manager",
                                createdBy);
                createTranslationIfNotExists("mail.config.form.senderNameHelper", languageCode,
                                "Sender name to be displayed in emails", createdBy);
                createTranslationIfNotExists("mail.config.form.testRecipient", languageCode,
                                "Test Mail Recipient (Optional)",
                                createdBy);
                createTranslationIfNotExists("mail.config.form.testRecipientPlaceholder", languageCode,
                                "test@example.com",
                                createdBy);
                createTranslationIfNotExists("mail.config.form.testRecipientHelper", languageCode,
                                "Email address to receive test mail after setup", createdBy);
                createTranslationIfNotExists("mail.config.validation.gmailRequired", languageCode,
                                "Gmail address is required.",
                                createdBy);
                createTranslationIfNotExists("mail.config.validation.gmailFormat", languageCode,
                                "Only Gmail addresses are supported. (Must end with @gmail.com)", createdBy);
                createTranslationIfNotExists("mail.config.validation.passwordRequired", languageCode,
                                "Gmail app password is required.", createdBy);
                createTranslationIfNotExists("mail.config.validation.passwordLength", languageCode,
                                "App password must be at least 8 characters long.", createdBy);
                createTranslationIfNotExists("mail.config.validation.senderNameRequired", languageCode,
                                "Sender name is required.", createdBy);
                createTranslationIfNotExists("mail.config.fixedSettings", languageCode, "Gmail Fixed Settings:",
                                createdBy);
                createTranslationIfNotExists("mail.config.fixedSettings.smtp", languageCode,
                                "SMTP Server: smtp.gmail.com:587",
                                createdBy);
                createTranslationIfNotExists("mail.config.fixedSettings.tls", languageCode, "TLS Encryption: Used",
                                createdBy);
                createTranslationIfNotExists("mail.config.fixedSettings.auth", languageCode,
                                "SMTP Authentication: Used",
                                createdBy);
                createTranslationIfNotExists("mail.config.button.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("mail.config.button.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("mail.config.button.saving", languageCode, "Saving...", createdBy);
                createTranslationIfNotExists("mail.guide.dialog.title", languageCode, "Gmail App Password Setup Guide",
                                createdBy);
                createTranslationIfNotExists("mail.guide.stepGuide", languageCode, "Step-by-Step Setup Method",
                                createdBy);
                createTranslationIfNotExists("mail.guide.troubleshooting", languageCode, "Troubleshooting", createdBy);
                createTranslationIfNotExists("mail.guide.securityWarnings", languageCode, "Security Warnings",
                                createdBy);
                createTranslationIfNotExists("mail.guide.button.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("mail.guide.button.next", languageCode, "Next", createdBy);
                createTranslationIfNotExists("mail.guide.button.previous", languageCode, "Previous", createdBy);
                createTranslationIfNotExists("mail.guide.button.complete", languageCode, "Complete", createdBy);
                createTranslationIfNotExists("mail.guide.button.reset", languageCode, "View Again", createdBy);
                createTranslationIfNotExists("mail.guide.step1.title", languageCode, "Gmail Account Login", createdBy);
                createTranslationIfNotExists("mail.guide.step1.description", languageCode,
                                "Log in to your Gmail account",
                                createdBy);
                createTranslationIfNotExists("mail.guide.step2.title", languageCode, "Go to Google Account Management",
                                createdBy);
                createTranslationIfNotExists("mail.guide.step2.description", languageCode,
                                "Navigate to Google Account Management page for security settings", createdBy);
                createTranslationIfNotExists("mail.guide.step3.title", languageCode, "Enable 2-Factor Authentication",
                                createdBy);
                createTranslationIfNotExists("mail.guide.step3.description", languageCode,
                                "Enable 2-factor authentication to generate app passwords", createdBy);
                createTranslationIfNotExists("mail.guide.step4.title", languageCode, "Generate App Password",
                                createdBy);
                createTranslationIfNotExists("mail.guide.step4.description", languageCode,
                                "Generate an app password for TestCase Manager", createdBy);
                createTranslationIfNotExists("mail.guide.step5.title", languageCode, "Configure in TestCase Manager",
                                createdBy);
                createTranslationIfNotExists("mail.guide.step5.description", languageCode,
                                "Enter the generated information in TestCase Manager", createdBy);
                createTranslationIfNotExists("mail.message.saveSuccess", languageCode,
                                "Mail settings saved successfully.",
                                createdBy);
                createTranslationIfNotExists("mail.message.saveError", languageCode, "Failed to save mail settings.",
                                createdBy);
                createTranslationIfNotExists("mail.message.loadError", languageCode, "Failed to load mail settings.",
                                createdBy);
                createTranslationIfNotExists("mail.message.testSuccess", languageCode,
                                "Test mail has been sent to {email}.",
                                createdBy);
                createTranslationIfNotExists("mail.message.testError", languageCode, "Failed to send test mail.",
                                createdBy);
                createTranslationIfNotExists("mail.message.disableSuccess", languageCode,
                                "Mail function has been disabled.",
                                createdBy);
                createTranslationIfNotExists("mail.message.disableError", languageCode,
                                "Failed to disable mail settings.",
                                createdBy);
                createTranslationIfNotExists("mail.message.disableConfirm", languageCode,
                                "Are you sure you want to disable mail function?", createdBy);
                createTranslationIfNotExists("mail.message.testRecipientPrompt", languageCode,
                                "Enter email address to receive test mail:", createdBy);
                createTranslationIfNotExists("mail.message.setupComplete", languageCode,
                                "All setup is complete! You can now use the mail function in TestCase Manager.",
                                createdBy);
                createTranslationIfNotExists("mail.troubleshoot.q1", languageCode, "I can't generate an app password",
                                createdBy);
                createTranslationIfNotExists("mail.troubleshoot.a1", languageCode,
                                "Please check if 2-factor authentication is enabled. You cannot generate an app password without 2-factor authentication.",
                                createdBy);
                createTranslationIfNotExists("mail.troubleshoot.q2", languageCode, "Mail sending fails", createdBy);
                createTranslationIfNotExists("mail.troubleshoot.a2", languageCode,
                                "Please verify that you entered the app password correctly. You must enter all 16 digits without spaces.",
                                createdBy);
                createTranslationIfNotExists("mail.troubleshoot.q3", languageCode, "Can't I use my regular password?",
                                createdBy);
                createTranslationIfNotExists("mail.troubleshoot.a3", languageCode,
                                "For security reasons, you cannot use your Gmail account's regular password. You must use an app password.",
                                createdBy);
                createTranslationIfNotExists("mail.troubleshoot.q4", languageCode, "Can I use G Suite accounts?",
                                createdBy);
                createTranslationIfNotExists("mail.troubleshoot.a4", languageCode,
                                "G Suite/Google Workspace accounts may vary depending on administrator settings. Please check SMTP usage permissions with your administrator.",
                                createdBy);
                createTranslationIfNotExists("mail.security.warning1", languageCode,
                                "App passwords have the same permissions as your Gmail account password.", createdBy);
                createTranslationIfNotExists("mail.security.warning2", languageCode,
                                "Do not share your app password with others.", createdBy);
                createTranslationIfNotExists("mail.security.warning3", languageCode,
                                "Regularly delete unnecessary app passwords.", createdBy);
                createTranslationIfNotExists("mail.security.warning4", languageCode,
                                "Delete app passwords immediately if suspicious activity is detected.", createdBy);
                createTranslationIfNotExists("mail.security.warning5", languageCode,
                                "Regularly review your Google account security activity.", createdBy);
                createTranslationIfNotExists("mail.guide.step1.instruction1", languageCode, "1. Open Gmail (",
                                createdBy);
                createTranslationIfNotExists("mail.guide.step1.instruction1.suffix", languageCode,
                                ") in your web browser.",
                                createdBy);
                createTranslationIfNotExists("mail.guide.step1.instruction2", languageCode,
                                "2. Log in with the Gmail account you want to use for email settings.", createdBy);
                createTranslationIfNotExists("mail.guide.step1.alert.title", languageCode, "Note:", createdBy);
                createTranslationIfNotExists("mail.guide.step1.alert.message", languageCode,
                                "Only personal Gmail accounts are supported. G Suite/Google Workspace accounts may require additional setup.",
                                createdBy);
                createTranslationIfNotExists("mail.guide.step2.instruction1", languageCode,
                                "1. Click your profile icon in the top right corner of Gmail.", createdBy);
                createTranslationIfNotExists("mail.guide.step2.instruction2", languageCode,
                                "2. Click the \"Manage your Google Account\" button.", createdBy);
                createTranslationIfNotExists("mail.guide.step2.instruction3.prefix", languageCode, "Or directly visit ",
                                createdBy);
                createTranslationIfNotExists("mail.guide.step2.instruction3.suffix", languageCode, ".", createdBy);
                createTranslationIfNotExists("mail.guide.step3.instruction1", languageCode,
                                "1. Click \"Security\" in the left menu.", createdBy);
                createTranslationIfNotExists("mail.guide.step3.instruction2", languageCode,
                                "2. Find the \"2-Step Verification\" section and click \"Get started\".", createdBy);
                createTranslationIfNotExists("mail.guide.step3.instruction3", languageCode,
                                "3. Follow the instructions to register your phone number and complete verification.",
                                createdBy);
                createTranslationIfNotExists("mail.guide.step3.alert.title", languageCode, "Required Step:", createdBy);
                createTranslationIfNotExists("mail.guide.step3.alert.message", languageCode,
                                "2-step verification must be enabled to generate app passwords.", createdBy);
                createTranslationIfNotExists("mail.guide.step4.instruction1", languageCode,
                                "1. On the \"Security\" page, click \"App passwords\".", createdBy);
                createTranslationIfNotExists("mail.guide.step4.instruction2", languageCode,
                                "2. From the \"Select app\" dropdown, choose \"Mail\".", createdBy);
                createTranslationIfNotExists("mail.guide.step4.instruction3", languageCode,
                                "3. From the \"Select device\" dropdown, choose \"Other (Custom name)\".", createdBy);
                createTranslationIfNotExists("mail.guide.step4.instruction4", languageCode,
                                "4. Enter \"TestCase Manager\" and click \"Generate\".", createdBy);
                createTranslationIfNotExists("mail.guide.step4.instruction5", languageCode,
                                "5. Copy the generated 16-character password.", createdBy);
                createTranslationIfNotExists("mail.guide.step4.alert.title", languageCode, "Important:", createdBy);
                createTranslationIfNotExists("mail.guide.step4.alert.message", languageCode,
                                "The generated app password is shown only once. Store it in a safe place.", createdBy);
                createTranslationIfNotExists("mail.guide.step5.instruction1", languageCode,
                                "1. Enter the following information in the mail settings dialog:", createdBy);
                createTranslationIfNotExists("mail.guide.step5.instruction2", languageCode,
                                "2. Click the \"Save\" button to complete the setup.", createdBy);
                createTranslationIfNotExists("mail.guide.step5.instruction3", languageCode,
                                "3. Use the \"Test Send\" button to verify that the settings are correct.", createdBy);
                createTranslationIfNotExists("mail.guide.step5.gmail.address", languageCode,
                                "Gmail Address: your-email@gmail.com", createdBy);
                createTranslationIfNotExists("mail.guide.step5.app.password", languageCode,
                                "App Password: 16-character generated password", createdBy);
                createTranslationIfNotExists("mail.guide.step5.sender.name", languageCode,
                                "Sender Name: TestCase Manager (or desired name)", createdBy);
                createTranslationIfNotExists("mail.guide.requirements.header", languageCode,
                                "📋 Required Prerequisites",
                                createdBy);
                createTranslationIfNotExists("mail.guide.requirements.gmail", languageCode,
                                "Gmail Account (@gmail.com)",
                                createdBy);
                createTranslationIfNotExists("mail.guide.requirements.twoFactor", languageCode,
                                "2-Factor Authentication Enabled", createdBy);
                createTranslationIfNotExists("mail.guide.requirements.appPassword", languageCode,
                                "App Password Generated",
                                createdBy);
                createTranslationIfNotExists("mail.guide.requirements.https", languageCode, "HTTPS Connection",
                                createdBy);
                createTranslationIfNotExists("mail.guide.sections.stepGuide", languageCode,
                                "🔧 Step-by-Step Setup Method",
                                createdBy);
                createTranslationIfNotExists("mail.guide.sections.troubleshooting", languageCode, "🔍 Troubleshooting",
                                createdBy);
                createTranslationIfNotExists("mail.guide.sections.security", languageCode, "🔒 Security Warnings",
                                createdBy);
                createTranslationIfNotExists("profile.title", languageCode, "User Profile", createdBy);
                createTranslationIfNotExists("profile.tabs.basicInfo", languageCode, "Basic Info", createdBy);
                createTranslationIfNotExists("profile.tabs.password", languageCode, "Password", createdBy);
                createTranslationIfNotExists("profile.tabs.language", languageCode, "Language Settings", createdBy);
                createTranslationIfNotExists("profile.tabs.appearance", languageCode, "Appearance", createdBy);
                createTranslationIfNotExists("profile.tabs.jira", languageCode, "JIRA Settings", createdBy);
                createTranslationIfNotExists("profile.form.username", languageCode, "Username", createdBy);
                createTranslationIfNotExists("profile.form.usernameHelper", languageCode, "Username cannot be changed.",
                                createdBy);
                createTranslationIfNotExists("profile.form.name", languageCode, "Name", createdBy);
                createTranslationIfNotExists("profile.form.email", languageCode, "Email", createdBy);
                createTranslationIfNotExists("profile.form.role", languageCode, "Role", createdBy);

                // Role types English translations
                createTranslationIfNotExists("role.admin", languageCode, "System Administrator", createdBy);
                createTranslationIfNotExists("role.manager", languageCode, "Manager", createdBy);
                createTranslationIfNotExists("role.tester", languageCode, "Tester", createdBy);
                createTranslationIfNotExists("role.user", languageCode, "User", createdBy);

                createTranslationIfNotExists("profile.validation.allRequired", languageCode,
                                "Please enter both name and email.", createdBy);
                createTranslationIfNotExists("profile.success.updated", languageCode, "Profile updated successfully.",
                                createdBy);
                createTranslationIfNotExists("profile.error.updateFailed", languageCode, "Failed to update profile.",
                                createdBy);
                createTranslationIfNotExists("profile.appearance.title", languageCode, "Appearance Settings",
                                createdBy);
                createTranslationIfNotExists("profile.appearance.description", languageCode,
                                "Customize the theme of the application.", createdBy);
                createTranslationIfNotExists("profile.appearance.lightMode", languageCode, "Light Mode", createdBy);
                createTranslationIfNotExists("profile.appearance.darkMode", languageCode, "Dark Mode", createdBy);
                createTranslationIfNotExists("profile.appearance.lightMode.description", languageCode,
                                "Clean interface with bright background", createdBy);
                createTranslationIfNotExists("profile.appearance.darkMode.description", languageCode,
                                "Comfortable interface with dark background", createdBy);
                createTranslationIfNotExists("profile.appearance.switch.dark", languageCode, "Dark", createdBy);
                createTranslationIfNotExists("profile.appearance.switch.light", languageCode, "Light", createdBy);
                createTranslationIfNotExists("profile.appearance.info", languageCode,
                                "Theme changes are applied immediately and saved automatically to your browser.",
                                createdBy);
                createTranslationIfNotExists("language.settings.title", languageCode, "Language Settings", createdBy);
                createTranslationIfNotExists("language.settings.description", languageCode,
                                "Select your preferred language to display the entire application in that language.",
                                createdBy);
                createTranslationIfNotExists("language.interface", languageCode, "Interface Language", createdBy);
                createTranslationIfNotExists("language.helperText", languageCode,
                                "Language changes are applied immediately and saved automatically.", createdBy);
                createTranslationIfNotExists("language.current", languageCode, "Current Language", createdBy);
                createTranslationIfNotExists("language.korean", languageCode, "Korean", createdBy);
                createTranslationIfNotExists("language.english", languageCode, "English", createdBy);
                createTranslationIfNotExists("profile.jira.settings.title", languageCode, "JIRA Integration Settings",
                                createdBy);
                createTranslationIfNotExists("profile.jira.settings.description", languageCode,
                                "Integrate with JIRA to automatically add test results as comments to issues.",
                                createdBy);
                createTranslationIfNotExists("profile.jira.button.configure", languageCode, "Configure Settings",
                                createdBy);
                createTranslationIfNotExists("profile.jira.button.delete", languageCode, "Delete Settings", createdBy);
                createTranslationIfNotExists("profile.jira.confirm.delete", languageCode,
                                "Are you sure you want to delete JIRA settings?", createdBy);
                createTranslationIfNotExists("profile.jira.success.saved", languageCode,
                                "JIRA settings saved successfully.",
                                createdBy);
                createTranslationIfNotExists("profile.jira.success.deleted", languageCode,
                                "JIRA settings deleted successfully.", createdBy);
                createTranslationIfNotExists("profile.jira.error.saveFailed", languageCode,
                                "Failed to save JIRA settings.",
                                createdBy);
                createTranslationIfNotExists("profile.jira.error.deleteFailed", languageCode,
                                "Failed to delete JIRA settings.",
                                createdBy);
                createTranslationIfNotExists("profile.jira.error.network", languageCode,
                                "Please check your network connection.", createdBy);
                createTranslationIfNotExists("profile.jira.error.authentication", languageCode,
                                "Your session has expired. Please log in again.", createdBy);
                createTranslationIfNotExists("profile.jira.error.encryption", languageCode,
                                "Server configuration issue. Please contact administrator.", createdBy);
                createTranslationIfNotExists("password.requirements.title", languageCode, "Password Requirements:",
                                createdBy);
                createTranslationIfNotExists("password.requirements.length", languageCode, "8-100 characters long",
                                createdBy);
                createTranslationIfNotExists("password.requirements.letter", languageCode, "Contains letters",
                                createdBy);
                createTranslationIfNotExists("password.requirements.digit", languageCode, "Contains numbers",
                                createdBy);
                createTranslationIfNotExists("password.requirements.special", languageCode,
                                "Contains special characters",
                                createdBy);
                createTranslationIfNotExists("password.requirements.combination", languageCode,
                                "At least 2 combinations",
                                createdBy);
                createTranslationIfNotExists("password.success.changed", languageCode,
                                "Password has been successfully changed.", createdBy);
                createTranslationIfNotExists("password.error.changeFailed", languageCode,
                                "An error occurred while changing the password.", createdBy);
                createTranslationIfNotExists("password.validation.newRequired", languageCode,
                                "Please enter a new password",
                                createdBy);
                createTranslationIfNotExists("password.validation.confirmRequired", languageCode,
                                "Please enter password confirmation", createdBy);
                createTranslationIfNotExists("password.validation.sameAsCurrent", languageCode,
                                "New password must be different from current password", createdBy);
                createTranslationIfNotExists("button.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("button.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("user.role.admin", languageCode, "System Admin", createdBy);
                createTranslationIfNotExists("user.role.manager", languageCode, "Project Manager", createdBy);
                createTranslationIfNotExists("user.role.tester", languageCode, "Tester", createdBy);
                createTranslationIfNotExists("user.role.user", languageCode, "User", createdBy);
                createTranslationIfNotExists("user.role.admin.description", languageCode,
                                "Access to all system functions",
                                createdBy);
                createTranslationIfNotExists("user.role.manager.description", languageCode,
                                "Project management and team leadership", createdBy);
                createTranslationIfNotExists("user.role.tester.description", languageCode,
                                "Test case creation and execution",
                                createdBy);
                createTranslationIfNotExists("user.role.user.description", languageCode, "Basic system usage",
                                createdBy);
                createTranslationIfNotExists("user.status.active", languageCode, "Active", createdBy);
                createTranslationIfNotExists("user.status.inactive", languageCode, "Inactive", createdBy);
                createTranslationIfNotExists("userDetail.password.title", languageCode, "Change Password (Admin)",
                                createdBy);
                createTranslationIfNotExists("userDetail.password.targetUser", languageCode, "Target User:", createdBy);
                createTranslationIfNotExists("userDetail.password.skipCurrent", languageCode,
                                "Skip current password confirmation (Admin privilege)", createdBy);
                createTranslationIfNotExists("userDetail.password.current", languageCode, "Current Password",
                                createdBy);
                createTranslationIfNotExists("userDetail.password.new", languageCode, "New Password", createdBy);
                createTranslationIfNotExists("userDetail.password.confirm", languageCode, "Confirm New Password",
                                createdBy);
                createTranslationIfNotExists("userDetail.password.requirements.title", languageCode,
                                "Password Requirements:",
                                createdBy);
                createTranslationIfNotExists("userDetail.password.requirements.length", languageCode,
                                "8-100 characters long",
                                createdBy);
                createTranslationIfNotExists("userDetail.password.requirements.complexity", languageCode,
                                "Must include at least 2 of the following: letters, numbers, special characters",
                                createdBy);
                createTranslationIfNotExists("userDetail.password.button.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("userDetail.password.button.changing", languageCode, "Changing...",
                                createdBy);
                createTranslationIfNotExists("userDetail.password.button.change", languageCode, "Change Password",
                                createdBy);
                createTranslationIfNotExists("userDetail.password.validation.minLength", languageCode,
                                "Must be at least 8 characters long", createdBy);
                createTranslationIfNotExists("userDetail.password.validation.maxLength", languageCode,
                                "Cannot exceed 100 characters", createdBy);
                createTranslationIfNotExists("userDetail.password.validation.complexity", languageCode,
                                "Must include at least 2 of: letters, numbers, special characters", createdBy);
                createTranslationIfNotExists("userDetail.password.validation.mismatch", languageCode,
                                "Does not match the new password", createdBy);
                createTranslationIfNotExists("userDetail.password.validation.currentRequired", languageCode,
                                "Please enter the current password", createdBy);
                createTranslationIfNotExists("userDetail.password.validation.newRequired", languageCode,
                                "Please enter a new password", createdBy);
                createTranslationIfNotExists("userDetail.password.validation.confirmRequired", languageCode,
                                "Please enter the password confirmation", createdBy);
                createTranslationIfNotExists("userDetail.password.success", languageCode,
                                "Password for {userName} has been changed successfully.", createdBy);
                createTranslationIfNotExists("userDetail.password.error", languageCode,
                                "An error occurred while changing the password.", createdBy);
                createTranslationIfNotExists("userDetail.activity.active", languageCode, "Active Recently", createdBy);
                createTranslationIfNotExists("userDetail.activity.recent", languageCode, "Active within a week",
                                createdBy);
                createTranslationIfNotExists("userDetail.activity.moderate", languageCode, "Active within a month",
                                createdBy);
                createTranslationIfNotExists("userDetail.activity.inactive", languageCode, "Inactive for a long time",
                                createdBy);
                createTranslationIfNotExists("userDetail.activity.unknown", languageCode, "Unknown", createdBy);
                createTranslationIfNotExists("password.validation.minLength", languageCode,
                                "Must be at least 8 characters long", createdBy);
                createTranslationIfNotExists("password.validation.maxLength", languageCode,
                                "Cannot exceed 100 characters",
                                createdBy);
                createTranslationIfNotExists("password.validation.complexity", languageCode,
                                "Must include at least 2 of: letters, numbers, special characters", createdBy);
                createTranslationIfNotExists("password.validation.mismatch", languageCode,
                                "Does not match the new password",
                                createdBy);
                createTranslationIfNotExists("password.validation.currentRequired", languageCode,
                                "Please enter the current password", createdBy);
                createTranslationIfNotExists("password.change.title", languageCode, "Change Password", createdBy);
                createTranslationIfNotExists("password.change.description", languageCode,
                                "Please change your password regularly for security.", createdBy);
                createTranslationIfNotExists("password.form.current", languageCode, "Current Password", createdBy);
                createTranslationIfNotExists("password.form.new", languageCode, "New Password", createdBy);
                createTranslationIfNotExists("password.form.confirm", languageCode, "Confirm New Password", createdBy);
                createTranslationIfNotExists("password.placeholder.current", languageCode,
                                "Enter your current password",
                                createdBy);
                createTranslationIfNotExists("password.placeholder.new", languageCode,
                                "Enter new password (8+ characters)",
                                createdBy);
                createTranslationIfNotExists("password.placeholder.confirm", languageCode, "Re-enter new password",
                                createdBy);
                createTranslationIfNotExists("password.button.change", languageCode, "Change Password", createdBy);
                createTranslationIfNotExists("password.button.changing", languageCode, "Changing...", createdBy);
                createTranslationIfNotExists("profile.title", languageCode, "User Profile", createdBy);
                createTranslationIfNotExists("profile.tabs.basicInfo", languageCode, "Basic Info", createdBy);
                createTranslationIfNotExists("profile.tabs.password", languageCode, "Password", createdBy);
                createTranslationIfNotExists("profile.tabs.language", languageCode, "Language", createdBy);
                createTranslationIfNotExists("profile.tabs.jira", languageCode, "JIRA Settings", createdBy);
                createTranslationIfNotExists("profile.form.name", languageCode, "Name", createdBy);
                createTranslationIfNotExists("profile.form.email", languageCode, "Email", createdBy);
                createTranslationIfNotExists("profile.success.updated", languageCode, "Profile updated successfully.",
                                createdBy);
                createTranslationIfNotExists("profile.error.updateFailed", languageCode, "Failed to update profile.",
                                createdBy);
                createTranslationIfNotExists("button.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("button.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("profile.validation.allRequired", languageCode,
                                "Please enter both name and email.", createdBy);
                createTranslationIfNotExists("userProfile.edit.title", languageCode, "Edit Profile", createdBy);
                createTranslationIfNotExists("userProfile.edit.description", languageCode,
                                "You can update your profile information.", createdBy);
                createTranslationIfNotExists("common.unauthorized.title", languageCode, "Login Required", createdBy);
                createTranslationIfNotExists("common.unauthorized.message", languageCode,
                                "You need to login to access this page.", createdBy);
                createTranslationIfNotExists("common.unauthorized.redirecting", languageCode,
                                "Redirecting to login page...",
                                createdBy);
                createTranslationIfNotExists("common.loading.text", languageCode, "Loading...", createdBy);
                createTranslationIfNotExists("common.error.networkError", languageCode, "A network error occurred.",
                                createdBy);
                createTranslationIfNotExists("common.error.serverError", languageCode, "A server error occurred.",
                                createdBy);
                createTranslationIfNotExists("common.error.unknownError", languageCode, "An unknown error occurred.",
                                createdBy);
                createTranslationIfNotExists("common.success.saved", languageCode, "Successfully saved.", createdBy);
                createTranslationIfNotExists("common.success.deleted", languageCode, "Successfully deleted.",
                                createdBy);
                createTranslationIfNotExists("common.confirm.delete", languageCode,
                                "Are you sure you want to delete this?",
                                createdBy);
                createTranslationIfNotExists("project.messages.noParticipatingProjects", languageCode,
                                "No participating projects", createdBy);
                createTranslationIfNotExists("project.messages.needInvitation", languageCode,
                                "You need an invitation to participate in projects.", createdBy);
                createTranslationIfNotExists("project.messages.requestInvitation", languageCode,
                                "Please request an invitation from the project manager.", createdBy);
                createTranslationIfNotExists("common.unauthorized.backToProjects", languageCode,
                                "Back to Project Selection",
                                createdBy);
                createTranslationIfNotExists("common.buttons.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("common.status.loading", languageCode, "Loading...", createdBy);
                createTranslationIfNotExists("common.status.error", languageCode, "Error Occurred", createdBy);
                createTranslationIfNotExists("common.actions.view", languageCode, "View", createdBy);
                createTranslationIfNotExists("common.actions.download", languageCode, "Download", createdBy);
                createTranslationIfNotExists("common.validation.required", languageCode, "This field is required",
                                createdBy);
                createTranslationIfNotExists("userDetail.status.active", languageCode, "Active", createdBy);
                createTranslationIfNotExists("userDetail.status.inactive", languageCode, "Inactive", createdBy);
                createTranslationIfNotExists("userDetail.tooltip.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("userDetail.tooltip.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("userDetail.tooltip.edit", languageCode, "Edit", createdBy);
                createTranslationIfNotExists("userDetail.tooltip.passwordChange", languageCode, "Change Password",
                                createdBy);
                createTranslationIfNotExists("userDetail.form.name", languageCode, "Name", createdBy);
                createTranslationIfNotExists("userDetail.form.email", languageCode, "Email", createdBy);
                createTranslationIfNotExists("userDetail.form.role", languageCode, "Role", createdBy);
                createTranslationIfNotExists("userDetail.form.accountActive", languageCode, "Account Active",
                                createdBy);
                createTranslationIfNotExists("project.dialog.transferTitle", languageCode,
                                "Project Organization Transfer",
                                createdBy);
                createTranslationIfNotExists("project.dialog.transferDescription", languageCode,
                                "You can transfer '<strong>{projectName}</strong>' project to another organization or make it an independent project.",
                                createdBy);
                createTranslationIfNotExists("project.dialog.forceDeleteTitle", languageCode,
                                "Confirm Force Delete Project",
                                createdBy);
                createTranslationIfNotExists("project.dialog.forceDeleteConfirm", languageCode,
                                "Are you sure you want to force delete '<strong>{projectName}</strong>' project?",
                                createdBy);
                createTranslationIfNotExists("project.dialog.forceDeleteWarningTitle", languageCode,
                                "⚠️ Force Delete Warning",
                                createdBy);
                createTranslationIfNotExists("project.dialog.forceDeleteWarningMessage", languageCode,
                                "All associated test plans, test cases, and execution history will be deleted together! This action cannot be undone.",
                                createdBy);
                createTranslationIfNotExists("project.dialog.deleteConfirm", languageCode,
                                "Are you sure you want to delete '<strong>{projectName}</strong>' project?", createdBy);
                createTranslationIfNotExists("project.dialog.deleteWarningMessage", languageCode,
                                "This action cannot be undone. All test cases and data belonging to this project will also be deleted.",
                                createdBy);
                createTranslationIfNotExists("mail.guide.dialog.title", languageCode, "Gmail App Password Setup Guide",
                                createdBy);
                createTranslationIfNotExists("mail.guide.requirements.header", languageCode,
                                "📋 Required Prerequisites",
                                createdBy);
                createTranslationIfNotExists("mail.guide.sections.stepGuide", languageCode,
                                "🔧 Step-by-Step Setup Method",
                                createdBy);
                createTranslationIfNotExists("mail.guide.sections.troubleshooting", languageCode, "🔍 Troubleshooting",
                                createdBy);
                createTranslationIfNotExists("mail.guide.sections.security", languageCode, "🔒 Security Warnings",
                                createdBy);
                createTranslationIfNotExists("attachments.button.download", languageCode, "Download", createdBy);
                createTranslationIfNotExists("attachments.button.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("testcase.tree.button.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("testcase.tree.button.saveOrder", languageCode, "Save Order", createdBy);
                createTranslationIfNotExists("testcase.tree.button.editOrder", languageCode, "Edit Order", createdBy);
                createTranslationIfNotExists("project.tooltips.testCaseCount", languageCode, "Test Case Count",
                                createdBy);
                createTranslationIfNotExists("project.tooltips.memberCount", languageCode, "Member Count", createdBy);
                createTranslationIfNotExists("project.tooltips.automationTestCount", languageCode,
                                "Automation Test Result Count", createdBy);
                createTranslationIfNotExists("project.tooltips.junitStatus", languageCode, "Automation Test Status",
                                createdBy);
                createTranslationIfNotExists("testcase.validation.stepRequired", languageCode,
                                "Please enter step content.",
                                createdBy);
                createTranslationIfNotExists("testcase.form.stepNumber", languageCode, "No.", createdBy);
                createTranslationIfNotExists("testcase.form.step", languageCode, "Step", createdBy);
                createTranslationIfNotExists("testcase.form.stepDescription", languageCode, "Step Description",
                                createdBy);
                createTranslationIfNotExists("recentResults.button.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("userList.button.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("userList.button.export", languageCode, "Export Data", createdBy);
                createTranslationIfNotExists("userList.button.reset", languageCode, "Reset", createdBy);
                createTranslationIfNotExists("junit.dashboard.uploadResult", languageCode, "Upload Result", createdBy);
                createTranslationIfNotExists("junit.table.uploadTime", languageCode, "Upload Time", createdBy);
                createTranslationIfNotExists("junit.dashboard.uploading", languageCode, "Uploading...", createdBy);
                createTranslationIfNotExists("junit.dashboard.upload", languageCode, "Upload", createdBy);
                createTranslationIfNotExists("common.button.retry", languageCode, "Retry", createdBy);
                createTranslationIfNotExists("common.button.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("common.button.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("common.button.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("organization.form.descriptionPlaceholder", languageCode,
                                "Enter organization description", createdBy);
                createTranslationIfNotExists("junit.placeholder.executionName", languageCode, "Enter execution name",
                                createdBy);
                createTranslationIfNotExists("junit.editor.userDescriptionPlaceholder", languageCode,
                                "Enter a detailed description for this test case...", createdBy);
                createTranslationIfNotExists("testcase.advancedFilter.searchPlaceholder", languageCode,
                                "Search test case name, description, step content...", createdBy);
                createTranslationIfNotExists("preset.name.placeholder", languageCode, "Example: My Test Cases",
                                createdBy);
                createTranslationIfNotExists("common.unauthorized.title", languageCode, "Unauthorized", createdBy);
                createTranslationIfNotExists("common.unauthorized.message", languageCode,
                                "You do not have permission to access this page", createdBy);
                createTranslationIfNotExists("common.loading", languageCode, "Loading...", createdBy);
                createTranslationIfNotExists("common.all", languageCode, "All", createdBy);
                createTranslationIfNotExists("common.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("organization.dashboard.title", languageCode, "Organization Dashboard",
                                createdBy);
                createTranslationIfNotExists("organization.management.title", languageCode, "Organization Management",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.edit.title", languageCode, "Edit Organization",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.create.title", languageCode, "Create Organization",
                                createdBy);

                // Timezone English Translations
                createTranslationIfNotExists("timezone.settings.title", languageCode, "Timezone Settings", createdBy);
                createTranslationIfNotExists("timezone.settings.description", languageCode,
                                "When you set a timezone, all times will be displayed in the selected timezone.",
                                createdBy);
                createTranslationIfNotExists("timezone.label", languageCode, "Timezone", createdBy);
                createTranslationIfNotExists("timezone.helperText", languageCode,
                                "The default timezone is UTC. Changes will be applied after clicking the save button.",
                                createdBy);
                createTranslationIfNotExists("timezone.current", languageCode, "Current Timezone", createdBy);
                createTranslationIfNotExists("timezone.utc", languageCode, "UTC (UTC+0)", createdBy);
                createTranslationIfNotExists("timezone.seoul", languageCode, "Seoul (UTC+9)", createdBy);
                createTranslationIfNotExists("timezone.newYork", languageCode, "New York (UTC-5/-4)", createdBy);
                createTranslationIfNotExists("timezone.losAngeles", languageCode, "Los Angeles (UTC-8/-7)", createdBy);
                createTranslationIfNotExists("timezone.london", languageCode, "London (UTC+0/+1)", createdBy);
                createTranslationIfNotExists("timezone.paris", languageCode, "Paris (UTC+1/+2)", createdBy);
                createTranslationIfNotExists("timezone.tokyo", languageCode, "Tokyo (UTC+9)", createdBy);
                createTranslationIfNotExists("timezone.shanghai", languageCode, "Shanghai (UTC+8)", createdBy);
                createTranslationIfNotExists("timezone.singapore", languageCode, "Singapore (UTC+8)", createdBy);
                createTranslationIfNotExists("timezone.hongKong", languageCode, "Hong Kong (UTC+8)", createdBy);
                createTranslationIfNotExists("timezone.sydney", languageCode, "Sydney (UTC+10/+11)", createdBy);

                // Organization Dashboard - Performance Metrics Tab
                createTranslationIfNotExists("organization.dashboard.tabs.performanceMetrics", languageCode,
                                "Performance Metrics", createdBy);

                // Performance Metrics English Translations
                createTranslationIfNotExists("performance.title", languageCode, "System Performance Metrics",
                                createdBy);
                createTranslationIfNotExists("performance.lastUpdated", languageCode, "Last Updated: {time}",
                                createdBy);
                createTranslationIfNotExists("performance.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("performance.systemResources", languageCode, "System Resources",
                                createdBy);
                createTranslationIfNotExists("performance.cpu", languageCode, "CPU Usage", createdBy);
                createTranslationIfNotExists("performance.memory", languageCode, "Memory Usage", createdBy);
                createTranslationIfNotExists("performance.disk", languageCode, "Disk Usage", createdBy);
                createTranslationIfNotExists("performance.cache", languageCode, "Cache Performance", createdBy);
                createTranslationIfNotExists("performance.cache.project", languageCode, "Project Cache", createdBy);
                createTranslationIfNotExists("performance.cache.testcase", languageCode, "Test Case Cache", createdBy);
                createTranslationIfNotExists("performance.cache.hitRate", languageCode, "Hit Rate", createdBy);
                createTranslationIfNotExists("performance.cache.hit", languageCode, "Hits", createdBy);
                createTranslationIfNotExists("performance.cache.miss", languageCode, "Misses", createdBy);
                createTranslationIfNotExists("performance.application", languageCode, "Application Performance",
                                createdBy);
                createTranslationIfNotExists("performance.avgResponseTime", languageCode, "Avg Response Time",
                                createdBy);
                createTranslationIfNotExists("performance.requestsPerSecond", languageCode, "Requests/sec", createdBy);
                createTranslationIfNotExists("performance.activeConnections", languageCode, "Active Connections",
                                createdBy);
                createTranslationIfNotExists("performance.usage", languageCode, "Usage Summary", createdBy);
                createTranslationIfNotExists("performance.usage.todayVisits", languageCode, "Today's Visits",
                                createdBy);
                createTranslationIfNotExists("performance.usage.uniqueVisitors", languageCode, "Unique Visitors Today",
                                createdBy);
                createTranslationIfNotExists("performance.usage.activeSessions", languageCode, "Active Sessions",
                                createdBy);
                createTranslationIfNotExists("performance.usage.recentMinutes", languageCode, "Last {minutes} minutes",
                                createdBy);
                createTranslationIfNotExists("performance.usage.topPages", languageCode, "Top Pages", createdBy);
                createTranslationIfNotExists("performance.usage.totalAccumulated", languageCode, "Total {total}",
                                createdBy);
                createTranslationIfNotExists("performance.usage.dailySummary", languageCode, "Daily Visit Summary",
                                createdBy);
                createTranslationIfNotExists("performance.usage.uniqueCount", languageCode, "Unique {count}",
                                createdBy);
                createTranslationIfNotExists("performance.error.loadFailed", languageCode,
                                "Failed to load performance metrics.", createdBy);
                createTranslationIfNotExists("performance.button.retry", languageCode, "Retry", createdBy);

                // User Profile - Version Information
                createTranslationIfNotExists("profile.version.title", languageCode, "Version Information", createdBy);
                createTranslationIfNotExists("profile.version.backend", languageCode, "Backend", createdBy);
                createTranslationIfNotExists("profile.version.frontend", languageCode, "Frontend", createdBy);
                createTranslationIfNotExists("profile.version.rag", languageCode, "RAG Service", createdBy);
                createTranslationIfNotExists("profile.version.loading", languageCode, "Loading version information...",
                                createdBy);
                createTranslationIfNotExists("profile.version.error", languageCode,
                                "Unable to load version information.",
                                createdBy);
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
                                                log.debug("Translation exists and is identical: {} - {}", keyName,
                                                                languageCode);
                                        }
                                }
                        }
                } else {
                        log.warn("Translation key not found: {}", keyName);
                }
        }
}
