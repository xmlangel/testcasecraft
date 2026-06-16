// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishI18nGapTranslations.java
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

/** 2026-06-06 i18n 전수 감사 누락분 — en 번역 (481건). */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishI18nGapTranslations {

  private final LanguageRepository languageRepository;
  private final TranslationKeyRepository translationKeyRepository;
  private final TranslationRepository translationRepository;

  public void initialize() {
    String languageCode = "en";
    String createdBy = "system";

    createTranslationIfNotExists(
        "admin.globalDoc.jobHistoryFailed", languageCode, "Failed to load job history.", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.fetchFailed",
        languageCode,
        "Failed to load common documents.",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.summary.fetchFailed",
        languageCode,
        "Failed to fetch analysis results.",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.summary.notReady",
        languageCode,
        "Summary is not available yet.",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.tab.globalDocuments", languageCode, "RAG Common Documents", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.tab.system", languageCode, "System Settings", createdBy);
    createTranslationIfNotExists("admin.llmTemplate.cancel", languageCode, "Cancel", createdBy);
    createTranslationIfNotExists(
        "admin.llmTemplate.chunkBatchSize", languageCode, "Batch Size", createdBy);
    createTranslationIfNotExists(
        "admin.llmTemplate.chunkBatchSizeHelper",
        languageCode,
        "Number of chunks to process at once",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmTemplate.description",
        languageCode,
        "Default settings used for RAG document analysis. Shared by the UI and the backend"
            + " scheduler.",
        createdBy);
    createTranslationIfNotExists("admin.llmTemplate.edit", languageCode, "Edit", createdBy);
    createTranslationIfNotExists(
        "admin.llmTemplate.lastModified", languageCode, "Last modified: {0}", createdBy);
    createTranslationIfNotExists(
        "admin.llmTemplate.maxTokens", languageCode, "Max Tokens", createdBy);
    createTranslationIfNotExists(
        "admin.llmTemplate.message.updateFailed",
        languageCode,
        "Failed to update LLM template",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmTemplate.message.updated",
        languageCode,
        "LLM analysis template has been updated",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmTemplate.pauseAfterBatch", languageCode, "Pause after each batch", createdBy);
    createTranslationIfNotExists(
        "admin.llmTemplate.promptTemplate", languageCode, "Prompt Template", createdBy);
    createTranslationIfNotExists(
        "admin.llmTemplate.promptTemplateHelper",
        languageCode,
        "Use the {chunk_text} placeholder",
        createdBy);
    createTranslationIfNotExists("admin.llmTemplate.save", languageCode, "Save", createdBy);
    createTranslationIfNotExists(
        "admin.llmTemplate.temperature", languageCode, "Temperature", createdBy);
    createTranslationIfNotExists(
        "admin.llmTemplate.title",
        languageCode,
        "🤖 Default LLM Chunk Analysis Template",
        createdBy);
    createTranslationIfNotExists(
        "admin.systemSettings.fetchError", languageCode, "Failed to load settings.", createdBy);
    createTranslationIfNotExists(
        "admin.systemSettings.ragTitle", languageCode, "RAG System Settings", createdBy);
    createTranslationIfNotExists(
        "admin.systemSettings.ragToggleDesc",
        languageCode,
        "Turning this off disables RAG features and LLM calls across the entire system. Use it when"
            + " the RAG system is unstable or under maintenance.",
        createdBy);
    createTranslationIfNotExists(
        "admin.systemSettings.ragToggleTitle", languageCode, "RAG Feature Status", createdBy);
    createTranslationIfNotExists(
        "admin.systemSettings.saveError", languageCode, "Failed to save settings.", createdBy);
    createTranslationIfNotExists(
        "admin.systemSettings.saveSuccess",
        languageCode,
        "System settings saved successfully.",
        createdBy);
    createTranslationIfNotExists("attachments.button.preview", languageCode, "Preview", createdBy);
    createTranslationIfNotExists(
        "attachments.error.previewError", languageCode, "Unable to generate preview.", createdBy);
    createTranslationIfNotExists("autoSave.error", languageCode, "Auto-save failed.", createdBy);
    createTranslationIfNotExists("common.add", languageCode, "Add", createdBy);
    createTranslationIfNotExists(
        "common.backToProjects", languageCode, "Back to Projects", createdBy);
    createTranslationIfNotExists("common.boolean.no", languageCode, "No", createdBy);
    createTranslationIfNotExists("common.boolean.yes", languageCode, "Yes", createdBy);
    createTranslationIfNotExists("common.button.back", languageCode, "Back", createdBy);
    createTranslationIfNotExists("common.button.next", languageCode, "Next", createdBy);
    createTranslationIfNotExists("common.button.previous", languageCode, "Previous", createdBy);
    createTranslationIfNotExists("common.button.search", languageCode, "Search", createdBy);
    createTranslationIfNotExists(
        "common.confirmDelete", languageCode, "Are you sure you want to delete?", createdBy);
    createTranslationIfNotExists("common.content", languageCode, "Content", createdBy);
    createTranslationIfNotExists("common.copied", languageCode, "Copied!", createdBy);
    createTranslationIfNotExists("common.copy", languageCode, "Copy", createdBy);
    createTranslationIfNotExists("common.description", languageCode, "Bug Description", createdBy);
    createTranslationIfNotExists("common.disabled", languageCode, "Disabled", createdBy);
    createTranslationIfNotExists("common.duration", languageCode, "Duration", createdBy);
    createTranslationIfNotExists("common.enabled", languageCode, "Enabled", createdBy);
    createTranslationIfNotExists(
        "common.errors.invalidIssueKey", languageCode, "Invalid issue key.", createdBy);
    createTranslationIfNotExists(
        "common.errors.noAssociatedExecution",
        languageCode,
        "No associated test execution found.",
        createdBy);
    createTranslationIfNotExists(
        "common.errors.noDataFound", languageCode, "No data found.", createdBy);
    createTranslationIfNotExists(
        "common.errors.noExecutionForIssue",
        languageCode,
        "No recent test results linked to this issue.",
        createdBy);
    createTranslationIfNotExists(
        "common.errors.serverError",
        languageCode,
        "An error occurred while communicating with the server.",
        createdBy);
    createTranslationIfNotExists(
        "common.exitFullscreen", languageCode, "Exit Fullscreen", createdBy);
    createTranslationIfNotExists(
        "common.expectedResult", languageCode, "Expected Result", createdBy);
    createTranslationIfNotExists("common.folder", languageCode, "Folder", createdBy);
    createTranslationIfNotExists("common.fullscreen", languageCode, "Fullscreen", createdBy);
    createTranslationIfNotExists("common.hide", languageCode, "Hide", createdBy);
    createTranslationIfNotExists("common.hideAll", languageCode, "Hide All", createdBy);
    createTranslationIfNotExists("common.loadingMore", languageCode, "Loading more...", createdBy);
    createTranslationIfNotExists("common.name", languageCode, "Name", createdBy);
    createTranslationIfNotExists("common.next", languageCode, "Next", createdBy);
    createTranslationIfNotExists(
        "common.noMoreData", languageCode, "All data has been loaded.", createdBy);
    createTranslationIfNotExists(
        "common.pagination.rowsPerPage", languageCode, "Rows per page:", createdBy);
    createTranslationIfNotExists("common.previous", languageCode, "Previous", createdBy);
    createTranslationIfNotExists("common.processing", languageCode, "Processing...", createdBy);
    createTranslationIfNotExists(
        "common.redirecting.failed", languageCode, "Connection failed", createdBy);
    createTranslationIfNotExists(
        "common.redirecting.processing", languageCode, "Looking up related data...", createdBy);
    createTranslationIfNotExists("common.refresh", languageCode, "Refresh", createdBy);
    createTranslationIfNotExists("common.reset", languageCode, "Default", createdBy);
    createTranslationIfNotExists(
        "common.saveError", languageCode, "An error occurred while saving.", createdBy);
    createTranslationIfNotExists(
        "common.saveSuccess", languageCode, "Saved successfully.", createdBy);
    createTranslationIfNotExists("common.saving", languageCode, "Saving...", createdBy);
    createTranslationIfNotExists("common.search", languageCode, "Search", createdBy);
    createTranslationIfNotExists("common.showAll", languageCode, "Show All", createdBy);
    createTranslationIfNotExists("common.steps", languageCode, "Test Steps", createdBy);
    createTranslationIfNotExists("common.testcase", languageCode, "Test Case", createdBy);
    createTranslationIfNotExists("common.title", languageCode, "Title", createdBy);
    createTranslationIfNotExists("common.type", languageCode, "Type", createdBy);
    createTranslationIfNotExists("common.update", languageCode, "Update", createdBy);
    createTranslationIfNotExists(
        "dashboard.activity.completedPlans", languageCode, "Completed Plans", createdBy);
    createTranslationIfNotExists(
        "dashboard.activity.newTestCases", languageCode, "New Test Cases", createdBy);
    createTranslationIfNotExists(
        "dashboard.activity.recentActivities", languageCode, "Recent Activities", createdBy);
    createTranslationIfNotExists(
        "dashboard.activity.testExecutions", languageCode, "Test Executions", createdBy);
    createTranslationIfNotExists(
        "dashboard.noData.noResults", languageCode, "No results", createdBy);
    createTranslationIfNotExists(
        "dashboard.quickActions.createTestCase", languageCode, "Create Test Case", createdBy);
    createTranslationIfNotExists(
        "dashboard.quickActions.manageProjects", languageCode, "Manage Projects", createdBy);
    createTranslationIfNotExists(
        "dashboard.quickActions.runTests", languageCode, "Run Tests", createdBy);
    createTranslationIfNotExists(
        "dashboard.quickActions.title", languageCode, "Quick Actions", createdBy);
    createTranslationIfNotExists(
        "dashboard.quickActions.viewReports", languageCode, "View Reports", createdBy);
    createTranslationIfNotExists(
        "dashboard.summary.activeProjects", languageCode, "Active Projects", createdBy);
    createTranslationIfNotExists(
        "dashboard.summary.failedTests", languageCode, "Failed Tests", createdBy);
    createTranslationIfNotExists(
        "dashboard.summary.passedTests", languageCode, "Passed Tests", createdBy);
    createTranslationIfNotExists(
        "dashboard.summary.testCoverage", languageCode, "Test Coverage", createdBy);
    createTranslationIfNotExists(
        "dashboard.summary.totalProjects", languageCode, "Total Projects", createdBy);
    createTranslationIfNotExists(
        "dashboard.summary.totalTestCases", languageCode, "Total Test Cases", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.dialog.missionPlaceholder",
        languageCode,
        "Write the charter content in Markdown.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.empty", languageCode, "No charters registered.", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.error.checkFields",
        languageCode,
        "Please check the required fields.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.error.missionRequired",
        languageCode,
        "Content is required.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.error.titleRequired",
        languageCode,
        "Charter name is required.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.examples.login.goal",
        languageCode,
        "- Goal: Verify login stability for regular/special users",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.examples.login.notes",
        languageCode,
        "- Watch out for: token validity, localization, network latency",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.examples.login.resources",
        languageCode,
        "- Resources: test accounts, Postman, developer tools",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.examples.templateTitle",
        languageCode,
        "Example (Login feature)",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.guide.formula",
        languageCode,
        "What (Target) + with which Resources + what Information to find",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.guide.show", languageCode, "Show Writing Guide", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.guide.title", languageCode, "Charter Template", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.principles.focus",
        languageCode,
        "One mission at a time: stay focused during the session",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.principles.riskBased",
        languageCode,
        "Risk-based approach: concentrate on high-risk areas",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.principles.specificity",
        languageCode,
        "Right level of detail: enough to guide the testing direction",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.principles.title",
        languageCode,
        "Charter Design Principles",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.action.finalSubmit", languageCode, "SUBMIT FOR REVIEW", createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.evaluation.achievement",
        languageCode,
        "Charter Achievement",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.evaluation.nextCharter",
        languageCode,
        "Follow-up Actions / Next Charter Suggestions",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.evaluation.summary",
        languageCode,
        "Overall Session Evaluation",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.section.artifacts", languageCode, "Artifacts & Evidence", createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.section.bugs", languageCode, "Bugs Found", createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.section.notes", languageCode, "Testing Notes", createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.section.tests", languageCode, "Structured Tests", createdBy);
    createTranslationIfNotExists(
        "exploratory.detail.empty", languageCode, "Select a session to view details", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.btn.backToList", languageCode, "Back to List", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.btn.submit", languageCode, "Submit", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.bugs.empty", languageCode, "No bugs found.", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.bugs.title", languageCode, "FOUND BUGS / DEFECTS", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.notes.empty",
        languageCode,
        "No notes yet. Click the add button to start recording.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.section.sessionConfig",
        languageCode,
        "SESSION CONFIGURATION",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.section.timeDistribution",
        languageCode,
        "Test Activity Allocation",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.tab.basic", languageCode, "Basic Info", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.tab.recording", languageCode, "Session Recording", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.tests.empty", languageCode, "No tests registered.", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.tests.title", languageCode, "STRUCTURED TESTS", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.timer.currentStatus", languageCode, "Session Status", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.timer.progress", languageCode, "TIME ALLOCATION VISUALIZER", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.approveSuccess", languageCode, "Session approved.", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.btn.createNew", languageCode, "Start New Session", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.countUnit", languageCode, "session(s) found.", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.empty", languageCode, "No sessions match the criteria.", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.rejectSuccess",
        languageCode,
        "Revision request completed.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.session.saveFirst",
        languageCode,
        "Save the session before uploading files.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.session.submitSuccess", languageCode, "Session submitted.", createdBy);
    createTranslationIfNotExists(
        "google.config.email.hint", languageCode, "Email to share with:", createdBy);
    createTranslationIfNotExists("jira.issue.open", languageCode, "Open in JIRA", createdBy);
    createTranslationIfNotExists(
        "jira.linker.alreadyLinked", languageCode, "Already linked", createdBy);
    createTranslationIfNotExists(
        "jira.linker.connectionError",
        languageCode,
        "Unable to check JIRA connection status.",
        createdBy);
    createTranslationIfNotExists(
        "jira.linker.createIssue", languageCode, "Create Issue", createdBy);
    createTranslationIfNotExists(
        "jira.linker.detailsError", languageCode, "Unable to load issue details.", createdBy);
    createTranslationIfNotExists(
        "jira.linker.enterSearchQuery", languageCode, "Enter a search query.", createdBy);
    createTranslationIfNotExists(
        "jira.linker.issueNotFound",
        languageCode,
        "The issue does not exist and cannot be searched.",
        createdBy);
    createTranslationIfNotExists("jira.linker.link", languageCode, "Link", createdBy);
    createTranslationIfNotExists(
        "jira.linker.linkedIssues", languageCode, "Linked JIRA Issues", createdBy);
    createTranslationIfNotExists(
        "jira.linker.noConfig",
        languageCode,
        "JIRA is not configured or the connection failed.",
        createdBy);
    createTranslationIfNotExists(
        "jira.linker.noConfigWarning",
        languageCode,
        "Complete the JIRA configuration first to use JIRA issue linking.",
        createdBy);
    createTranslationIfNotExists(
        "jira.linker.noResults", languageCode, "No search results.", createdBy);
    createTranslationIfNotExists("jira.linker.openInJira", languageCode, "Open in JIRA", createdBy);
    createTranslationIfNotExists(
        "jira.linker.placeholder",
        languageCode,
        "Enter an issue key, title, or JIRA URL (e.g., TEST-123)",
        createdBy);
    createTranslationIfNotExists(
        "jira.linker.recentIssues", languageCode, "Recently Searched Issues", createdBy);
    createTranslationIfNotExists(
        "jira.linker.searchAndLink", languageCode, "Search & Link JIRA Issues", createdBy);
    createTranslationIfNotExists(
        "jira.linker.searchResults", languageCode, "Search Results", createdBy);
    createTranslationIfNotExists("jira.linker.unlink", languageCode, "Unlink", createdBy);
    createTranslationIfNotExists(
        "jira.summary.activeIssues", languageCode, "Active Issues", createdBy);
    createTranslationIfNotExists("jira.summary.allPassed", languageCode, "All Passed", createdBy);
    createTranslationIfNotExists(
        "jira.summary.filterActive", languageCode, "In Progress", createdBy);
    createTranslationIfNotExists(
        "jira.summary.loading", languageCode, "Loading JIRA status...", createdBy);
    createTranslationIfNotExists(
        "junit.list.previousExecution", languageCode, "Previous Execution", createdBy);
    createTranslationIfNotExists("login.error.failed", languageCode, "Login failed.", createdBy);
    createTranslationIfNotExists(
        "login.error.general", languageCode, "An error occurred during login.", createdBy);
    createTranslationIfNotExists("navigation.breadcrumb.back", languageCode, "Back", createdBy);
    createTranslationIfNotExists("navigation.menu.help", languageCode, "Help", createdBy);
    createTranslationIfNotExists("navigation.menu.settings", languageCode, "Settings", createdBy);
    createTranslationIfNotExists(
        "navigation.menu.testExecutions", languageCode, "Test Executions", createdBy);
    createTranslationIfNotExists("navigation.user.logout", languageCode, "Logout", createdBy);
    createTranslationIfNotExists(
        "navigation.user.preferences", languageCode, "Preferences", createdBy);
    createTranslationIfNotExists("navigation.user.profile", languageCode, "Profile", createdBy);
    createTranslationIfNotExists(
        "organization.buttons.back", languageCode, "Back to Organizations", createdBy);
    createTranslationIfNotExists(
        "organization.detail.organizationMembers", languageCode, "Organization Members", createdBy);
    createTranslationIfNotExists(
        "organization.detail.organizationProjects",
        languageCode,
        "Organization Projects",
        createdBy);
    createTranslationIfNotExists(
        "organization.dialog.editInfo.title", languageCode, "Edit Organization Info", createdBy);
    createTranslationIfNotExists(
        "organization.dialog.project.title",
        languageCode,
        "Create Project in Organization",
        createdBy);
    createTranslationIfNotExists(
        "organization.error.selectMember", languageCode, "Select a member to transfer.", createdBy);
    createTranslationIfNotExists(
        "organization.form.codeRequired", languageCode, "Enter the project code.", createdBy);
    createTranslationIfNotExists(
        "organization.member.remove", languageCode, "Remove Member", createdBy);
    createTranslationIfNotExists("organization.member.role", languageCode, "Role", createdBy);
    createTranslationIfNotExists(
        "organization.member.username", languageCode, "Username", createdBy);
    createTranslationIfNotExists(
        "organization.messages.notFound", languageCode, "Organization not found.", createdBy);
    createTranslationIfNotExists(
        "organization.project.belongsTo",
        languageCode,
        "This project will belong to the organization.",
        createdBy);
    createTranslationIfNotExists(
        "organization.project.code", languageCode, "Project Code", createdBy);
    createTranslationIfNotExists(
        "organization.project.codeHelperText",
        languageCode,
        "Only letters, numbers, underscores (_), and hyphens (-) are allowed",
        createdBy);
    createTranslationIfNotExists(
        "organization.project.codePlaceholder", languageCode, "e.g., WEB_APP_TEST", createdBy);
    createTranslationIfNotExists(
        "organization.project.description", languageCode, "Project Description", createdBy);
    createTranslationIfNotExists(
        "organization.project.descriptionPlaceholder",
        languageCode,
        "Enter a short description of the project...",
        createdBy);
    createTranslationIfNotExists(
        "organization.project.name", languageCode, "Project Name", createdBy);
    createTranslationIfNotExists(
        "organization.project.namePlaceholder",
        languageCode,
        "e.g., Web Application Testing",
        createdBy);
    createTranslationIfNotExists(
        "profile.apiToken.dialog.delete.button.cancel", languageCode, "Cancel", createdBy);
    createTranslationIfNotExists("profile.tabs.theme", languageCode, "Theme", createdBy);
    createTranslationIfNotExists(
        "profile.theme.description",
        languageCode,
        "Choose the overall design style of the application.",
        createdBy);
    createTranslationIfNotExists(
        "profile.theme.glass.desc",
        languageCode,
        "A modern style with rich gradients and blur effects.",
        createdBy);
    createTranslationIfNotExists(
        "profile.theme.glass.title", languageCode, "Modern Glass (Current)", createdBy);
    createTranslationIfNotExists(
        "profile.theme.m3.desc",
        languageCode,
        "A clean, structured style following Google's latest guidelines.",
        createdBy);
    createTranslationIfNotExists(
        "profile.theme.m3.title", languageCode, "Material 3 (Design System)", createdBy);
    createTranslationIfNotExists(
        "profile.theme.mode.desc",
        languageCode,
        "Adjust the overall screen brightness.",
        createdBy);
    createTranslationIfNotExists(
        "profile.theme.mode.title", languageCode, "Display Mode", createdBy);
    createTranslationIfNotExists(
        "profile.theme.systemLabel", languageCode, "Design System", createdBy);
    createTranslationIfNotExists(
        "profile.theme.title", languageCode, "Design System Settings", createdBy);
    createTranslationIfNotExists(
        "project.buttons.forceDelete", languageCode, "Force Delete", createdBy);
    createTranslationIfNotExists("project.buttons.transfer", languageCode, "Transfer", createdBy);
    createTranslationIfNotExists(
        "project.dialog.deleteTitle", languageCode, "Confirm Project Deletion", createdBy);
    createTranslationIfNotExists(
        "project.dialog.deleteWarningMessage1",
        languageCode,
        "This action cannot be undone.",
        createdBy);
    createTranslationIfNotExists(
        "project.dialog.deleteWarningMessage2",
        languageCode,
        "All test cases and data in the project will also be deleted.",
        createdBy);
    createTranslationIfNotExists(
        "project.form.codeRequired", languageCode, "Enter the project code.", createdBy);
    createTranslationIfNotExists(
        "project.form.convertToIndependent",
        languageCode,
        "Convert to Independent Project",
        createdBy);
    createTranslationIfNotExists(
        "project.form.nameRequired", languageCode, "Enter the project name.", createdBy);
    createTranslationIfNotExists(
        "project.form.targetOrganization", languageCode, "Target Organization", createdBy);
    createTranslationIfNotExists(
        "project.members.more", languageCode, "and {count} more", createdBy);
    createTranslationIfNotExists(
        "project.members.noMembers", languageCode, "No members", createdBy);
    createTranslationIfNotExists(
        "project.members.title", languageCode, "Project Members", createdBy);
    createTranslationIfNotExists(
        "project.menu.forceDelete", languageCode, "Force Delete", createdBy);
    createTranslationIfNotExists(
        "project.menu.transfer", languageCode, "Transfer to Organization", createdBy);
    createTranslationIfNotExists(
        "project.messages.addOrganizationProjectsHint",
        languageCode,
        "Add a project to the organization or create a new organization project.",
        createdBy);
    createTranslationIfNotExists(
        "project.messages.noOrganizationProjects",
        languageCode,
        "No organization projects",
        createdBy);
    createTranslationIfNotExists(
        "project.messages.noProjectsInOrganization",
        languageCode,
        "This organization has no projects yet.",
        createdBy);
    createTranslationIfNotExists(
        "project.types.independent", languageCode, "Independent Project", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.chunkNumber.header", languageCode, "Chunk #", createdBy);
    createTranslationIfNotExists("rag.analysis.costHeader", languageCode, "Cost", createdBy);
    createTranslationIfNotExists(
        "rag.chat.conversationThreadLabel",
        languageCode,
        "Conversation thread: {title}",
        createdBy);
    createTranslationIfNotExists(
        "rag.chat.conversationThreadTooltip",
        languageCode,
        "Referenced conversation thread",
        createdBy);
    createTranslationIfNotExists(
        "rag.chat.documentFallback", languageCode, "Document {index}", createdBy);
    createTranslationIfNotExists(
        "rag.chat.documentTooltip", languageCode, "View document details", createdBy);
    createTranslationIfNotExists(
        "rag.chat.generatedTestCases", languageCode, "Generated Test Cases ({count})", createdBy);
    createTranslationIfNotExists("rag.chat.hideJson", languageCode, "Hide Raw JSON", createdBy);
    createTranslationIfNotExists(
        "rag.chat.jsonHidden", languageCode, "Test case data detected.", createdBy);
    createTranslationIfNotExists("rag.chat.showJson", languageCode, "Show Raw JSON", createdBy);
    createTranslationIfNotExists(
        "rag.chat.stopStreaming", languageCode, "Stop Streaming", createdBy);
    createTranslationIfNotExists(
        "rag.chat.testCaseDocumentLabel", languageCode, "Test case: {name}", createdBy);
    createTranslationIfNotExists(
        "rag.chat.testCaseDocumentTooltip",
        languageCode,
        "Open test case details in a new tab",
        createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadDeleteConfirm",
        languageCode,
        "Delete this thread? All conversation history will be removed.",
        createdBy);
    createTranslationIfNotExists(
        "rag.chunk.preview.chunkNumber", languageCode, "Chunk #{number}", createdBy);
    createTranslationIfNotExists(
        "rag.chunk.preview.conversationThread", languageCode, "Conversation Thread", createdBy);
    createTranslationIfNotExists("rag.chunk.preview.copy", languageCode, "Copy", createdBy);
    createTranslationIfNotExists(
        "rag.chunk.preview.similarity", languageCode, "Similarity: {score}%", createdBy);
    createTranslationIfNotExists(
        "rag.chunk.preview.title", languageCode, "Chunk Details", createdBy);
    createTranslationIfNotExists(
        "rag.chunk.preview.typeConversation", languageCode, "Conversation", createdBy);
    createTranslationIfNotExists(
        "rag.chunk.preview.typeDocument", languageCode, "Document", createdBy);
    createTranslationIfNotExists(
        "rag.chunk.preview.typeTestCase", languageCode, "Test Case", createdBy);
    createTranslationIfNotExists(
        "rag.chunk.preview.viewDocument", languageCode, "View Full Document", createdBy);
    createTranslationIfNotExists(
        "rag.document.analyze", languageCode, "Analyze Document", createdBy);
    createTranslationIfNotExists(
        "rag.document.completedAt", languageCode, "Completed At", createdBy);
    createTranslationIfNotExists("rag.document.cost", languageCode, "Cost (USD)", createdBy);
    createTranslationIfNotExists("rag.document.error", languageCode, "Error", createdBy);
    createTranslationIfNotExists(
        "rag.document.errorPresent", languageCode, "Has Errors", createdBy);
    createTranslationIfNotExists(
        "rag.document.generateEmbedding", languageCode, "Generate Embedding", createdBy);
    createTranslationIfNotExists("rag.document.jobHistory", languageCode, "Job History", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistoryEmpty",
        languageCode,
        "No job history for this document.",
        createdBy);
    createTranslationIfNotExists("rag.document.jobId", languageCode, "Job ID", createdBy);
    createTranslationIfNotExists("rag.document.list.loading", languageCode, "Loading", createdBy);
    createTranslationIfNotExists(
        "rag.document.list.parserAuto", languageCode, "Auto Select", createdBy);
    createTranslationIfNotExists(
        "rag.document.list.parserUnknown", languageCode, "Unknown", createdBy);
    createTranslationIfNotExists(
        "rag.document.llmAnalysis", languageCode, "LLM Analysis", createdBy);
    createTranslationIfNotExists("rag.document.llmModel", languageCode, "LLM Model", createdBy);
    createTranslationIfNotExists(
        "rag.document.llmProvider", languageCode, "LLM Provider", createdBy);
    createTranslationIfNotExists("rag.document.pausedAt", languageCode, "Paused At", createdBy);
    createTranslationIfNotExists("rag.document.preview", languageCode, "PDF Preview", createdBy);
    createTranslationIfNotExists("rag.document.startedAt", languageCode, "Started At", createdBy);
    createTranslationIfNotExists("rag.document.status", languageCode, "Status", createdBy);
    createTranslationIfNotExists(
        "rag.document.summary", languageCode, "View LLM Analysis Summary", createdBy);
    createTranslationIfNotExists(
        "rag.document.summary.analyzedChunks", languageCode, "Analyzed: {0}", createdBy);
    createTranslationIfNotExists(
        "rag.document.summary.progress", languageCode, "Progress: {0}%", createdBy);
    createTranslationIfNotExists(
        "rag.document.summary.totalChunks", languageCode, "{0} chunks total", createdBy);
    createTranslationIfNotExists(
        "rag.document.summaryProgress", languageCode, "Progress", createdBy);
    createTranslationIfNotExists("rag.document.tokens", languageCode, "Tokens", createdBy);
    createTranslationIfNotExists(
        "rag.llmAnalysis.title", languageCode, "LLM Chunk Analysis", createdBy);
    createTranslationIfNotExists(
        "rag.testcase.bulkAddButton", languageCode, "Bulk Add via Spreadsheet", createdBy);
    createTranslationIfNotExists(
        "rag.testcase.spreadsheet.dialog.subtitle",
        languageCode,
        "Edit and save {count} test cases in the spreadsheet.",
        createdBy);
    createTranslationIfNotExists(
        "rag.testcase.spreadsheet.dialog.title",
        languageCode,
        "Bulk Add AI-Generated Test Cases",
        createdBy);
    createTranslationIfNotExists(
        "testCase.export.noData", languageCode, "No data to export.", createdBy);
    createTranslationIfNotExists(
        "testCase.export.pdfError",
        languageCode,
        "An error occurred while downloading the PDF: {message}",
        createdBy);
    createTranslationIfNotExists(
        "testCase.export.pdfSuccess", languageCode, "PDF file downloaded: {filename}", createdBy);
    createTranslationIfNotExists("testCase.form.tags", languageCode, "Tags", createdBy);
    createTranslationIfNotExists("testCase.priority.label", languageCode, "Priority", createdBy);
    createTranslationIfNotExists(
        "testCaseResult.page.loadingData",
        languageCode,
        "Loading test case information...",
        createdBy);
    createTranslationIfNotExists(
        "testExecution.actions.copyResultLink", languageCode, "Copy Result Entry Link", createdBy);
    createTranslationIfNotExists(
        "testExecution.actions.linkCopied",
        languageCode,
        "Result entry link copied to clipboard.",
        createdBy);
    createTranslationIfNotExists(
        "testExecution.bulk.dialog.jiraHelp",
        languageCode,
        "Separate multiple issue keys with commas (,).",
        createdBy);
    createTranslationIfNotExists(
        "testExecution.filter.executionDate", languageCode, "Execution Date", createdBy);
    createTranslationIfNotExists("testExecution.filter.notes", languageCode, "Notes", createdBy);
    createTranslationIfNotExists(
        "testExecution.filter.notes.placeholder", languageCode, "Search notes", createdBy);
    createTranslationIfNotExists(
        "testExecution.list.noMoreExecutions",
        languageCode,
        "All data has been loaded.",
        createdBy);
    createTranslationIfNotExists(
        "testExecution.prevResults.currentExecution", languageCode, "Current Execution", createdBy);
    createTranslationIfNotExists(
        "testExecution.prevResults.notesView.label", languageCode, "Notes view format", createdBy);
    createTranslationIfNotExists(
        "testExecution.prevResults.notesView.markdown", languageCode, "Markdown", createdBy);
    createTranslationIfNotExists(
        "testExecution.prevResults.notesView.text", languageCode, "Text", createdBy);
    createTranslationIfNotExists(
        "testExecution.scroll.hint", languageCode, "Scroll for more", createdBy);
    createTranslationIfNotExists(
        "testExecution.sections.filters", languageCode, "Filters", createdBy);
    createTranslationIfNotExists(
        "testExecution.sections.list", languageCode, "Test Execution List", createdBy);
    createTranslationIfNotExists("testExecution.summary.cases", languageCode, "case(s)", createdBy);
    createTranslationIfNotExists("testExecution.summary.total", languageCode, "Total", createdBy);
    createTranslationIfNotExists("testExecution.table.id", languageCode, "ID", createdBy);
    createTranslationIfNotExists(
        "testExecution.table.totalCount", languageCode, "Total: {count}", createdBy);
    createTranslationIfNotExists(
        "testPlan.linkAutomated.searchPlaceholder",
        languageCode,
        "Search by execution name or file name",
        createdBy);
    createTranslationIfNotExists(
        "testPlan.linkAutomated.title", languageCode, "Link Automated Tests", createdBy);
    createTranslationIfNotExists("testResult.button.delete", languageCode, "Delete", createdBy);
    createTranslationIfNotExists(
        "testResult.button.jiraStatusLoading", languageCode, "Checking JIRA status...", createdBy);
    createTranslationIfNotExists("testResult.button.refresh", languageCode, "Refresh", createdBy);
    createTranslationIfNotExists("testResult.button.view", languageCode, "View", createdBy);
    createTranslationIfNotExists("testResult.default.noData", languageCode, "No data", createdBy);
    createTranslationIfNotExists(
        "testResult.default.noExecutor", languageCode, "No executor", createdBy);
    createTranslationIfNotExists(
        "testResult.caseDetails.expandAll", languageCode, "Expand All", createdBy);
    createTranslationIfNotExists(
        "testResult.caseDetails.expandAllTooltip",
        languageCode,
        "Show full step content without vertical scrolling.",
        createdBy);
    createTranslationIfNotExists(
        "testResult.caseDetails.wrap", languageCode, "Wrap Lines", createdBy);
    createTranslationIfNotExists(
        "testResult.caseDetails.wrapTooltip",
        languageCode,
        "Auto word wrap — view without horizontal scrolling on small screens.",
        createdBy);
    createTranslationIfNotExists(
        "testResult.qaSummary.title", languageCode, "QA Summary", createdBy);
    createTranslationIfNotExists(
        "testResult.qaSummary.write", languageCode, "Write Summary", createdBy);
    createTranslationIfNotExists(
        "testResult.qaSummary.placeholder",
        languageCode,
        "Write the QA summary for this execution in Markdown.",
        createdBy);
    createTranslationIfNotExists(
        "testResult.qaSummary.empty",
        languageCode,
        "No QA summary yet. It will be printed above the detailed list in the advanced PDF export.",
        createdBy);
    createTranslationIfNotExists(
        "testResult.qaSummary.updatedBy", languageCode, "Updated by {user} on {date}", createdBy);
    createTranslationIfNotExists(
        "testResult.qaSummary.saveError",
        languageCode,
        "Failed to save the QA summary.",
        createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.qaSummaryTitle", languageCode, "💬 QA Summary", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.qaSummaryBy", languageCode, "By", createdBy);
    createTranslationIfNotExists(
        "testResult.default.noExpectedResult", languageCode, "No expected result", createdBy);
    createTranslationIfNotExists(
        "testResult.default.noFolder", languageCode, "No folder", createdBy);
    createTranslationIfNotExists("testResult.default.noNotes", languageCode, "No notes", createdBy);
    createTranslationIfNotExists(
        "testResult.default.noPreCondition", languageCode, "No preconditions", createdBy);
    createTranslationIfNotExists(
        "testResult.default.noSteps", languageCode, "No test steps", createdBy);
    createTranslationIfNotExists(
        "testResult.default.noTestCase", languageCode, "No test case", createdBy);
    createTranslationIfNotExists(
        "testResult.default.noTestExecution", languageCode, "No test execution", createdBy);
    createTranslationIfNotExists(
        "testResult.default.noTestPlan", languageCode, "No test plan", createdBy);
    createTranslationIfNotExists(
        "testResult.export.attachmentsAvailable", languageCode, "Has attachments", createdBy);
    createTranslationIfNotExists(
        "testResult.export.error.noData", languageCode, "No data to export.", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.detailTitle",
        languageCode,
        "🔍 Detailed Test Result List",
        createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.generatedAt", languageCode, "Generated At", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.project", languageCode, "Project", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.summary.executionRate", languageCode, "Execution Rate", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.summary.jiraLinked", languageCode, "JIRA Linked", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.summary.noPeriod", languageCode, "No period information", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.summary.successRate", languageCode, "Success Rate", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.summary.total", languageCode, "Total Tests", createdBy);
    createTranslationIfNotExists(
        "testResult.export.pdf.summaryTitle", languageCode, "📝 Test Execution Summary", createdBy);
    createTranslationIfNotExists(
        "testResult.filter.executionView", languageCode, "By Execution", createdBy);
    createTranslationIfNotExists(
        "testResult.filter.folderView", languageCode, "By Folder", createdBy);
    createTranslationIfNotExists(
        "testResult.filteredCases.col.action", languageCode, "Go", createdBy);
    createTranslationIfNotExists(
        "testResult.filteredCases.col.folder", languageCode, "Folder Path", createdBy);
    createTranslationIfNotExists(
        "testResult.filteredCases.col.testCase", languageCode, "Test Case", createdBy);
    createTranslationIfNotExists(
        "testResult.filteredCases.col.testPlan", languageCode, "Test Plan", createdBy);
    createTranslationIfNotExists(
        "testResult.filteredCases.count", languageCode, "{count} item(s)", createdBy);
    createTranslationIfNotExists(
        "testResult.filteredCases.goToExecutionAll",
        languageCode,
        "Go to Execution Page",
        createdBy);
    createTranslationIfNotExists(
        "testResult.filteredCases.loadError",
        languageCode,
        "An error occurred while loading the case list.",
        createdBy);
    createTranslationIfNotExists(
        "testResult.filteredCases.noFail", languageCode, "No failed cases.", createdBy);
    createTranslationIfNotExists(
        "testResult.filteredCases.noNotRun", languageCode, "No not-run cases.", createdBy);
    createTranslationIfNotExists(
        "testResult.filteredCases.unnamed", languageCode, "(Unnamed)", createdBy);
    createTranslationIfNotExists(
        "testResult.folder.depthView", languageCode, "Folder Tree (Depth View)", createdBy);
    createTranslationIfNotExists(
        "testResult.folder.detailStats",
        languageCode,
        "Detailed Stats (Selected Folder)",
        createdBy);
    createTranslationIfNotExists(
        "testResult.folder.executionCount", languageCode, "Executions", createdBy);
    createTranslationIfNotExists("testResult.folder.name", languageCode, "Folder Name", createdBy);
    createTranslationIfNotExists("testResult.folder.root", languageCode, "All", createdBy);
    createTranslationIfNotExists(
        "testResult.folder.successRate", languageCode, "Success Rate", createdBy);
    createTranslationIfNotExists("testResult.folder.total", languageCode, "Total", createdBy);
    createTranslationIfNotExists(
        "testResult.folder.totalCases", languageCode, "Total Cases", createdBy);
    createTranslationIfNotExists(
        "testResult.folder.totalSuccessRate", languageCode, "Overall Success Rate", createdBy);
    createTranslationIfNotExists("testResult.form.priority", languageCode, "Priority", createdBy);
    createTranslationIfNotExists(
        "testResult.form.tagsPlaceholder", languageCode, "Type a tag and press Enter", createdBy);
    createTranslationIfNotExists(
        "testResult.helper.tags", languageCode, "You can enter multiple tags", createdBy);
    createTranslationIfNotExists(
        "testResult.jiraDialog.caseCount", languageCode, "{count} case(s)", createdBy);
    createTranslationIfNotExists(
        "testResult.jiraDialog.col.folder", languageCode, "Folder Path", createdBy);
    createTranslationIfNotExists(
        "testResult.jiraDialog.col.jiraKey", languageCode, "JIRA Issue", createdBy);
    createTranslationIfNotExists(
        "testResult.jiraDialog.col.result", languageCode, "Result", createdBy);
    createTranslationIfNotExists(
        "testResult.jiraDialog.col.testCase", languageCode, "Test Case", createdBy);
    createTranslationIfNotExists(
        "testResult.jiraDialog.count", languageCode, "{count} item(s)", createdBy);
    createTranslationIfNotExists(
        "testResult.jiraDialog.deduplicatedNote",
        languageCode,
        "* Deduplicated by JIRA issue key",
        createdBy);
    createTranslationIfNotExists(
        "testResult.jiraDialog.empty", languageCode, "No linked JIRA issues.", createdBy);
    createTranslationIfNotExists(
        "testResult.jiraDialog.loadError",
        languageCode,
        "An error occurred while loading the JIRA list.",
        createdBy);
    createTranslationIfNotExists(
        "testResult.jiraDialog.openJira", languageCode, "Open in JIRA", createdBy);
    createTranslationIfNotExists(
        "testResult.jiraDialog.title", languageCode, "Linked JIRA Issues", createdBy);
    createTranslationIfNotExists(
        "testResult.message.deleteConfirm", languageCode, "Delete this test result?", createdBy);
    createTranslationIfNotExists(
        "testResult.message.deleteSuccess",
        languageCode,
        "Test result deleted successfully.",
        createdBy);
    createTranslationIfNotExists(
        "testResult.message.exportFailed", languageCode, "CSV export failed.", createdBy);
    createTranslationIfNotExists(
        "testResult.message.exportSuccess",
        languageCode,
        "CSV file exported successfully.",
        createdBy);
    createTranslationIfNotExists(
        "testResult.message.loading", languageCode, "Loading test results...", createdBy);
    createTranslationIfNotExists(
        "testResult.message.noChange",
        languageCode,
        "Nothing was saved because there are no changes.",
        createdBy);
    createTranslationIfNotExists(
        "testResult.message.noData", languageCode, "No test results to display.", createdBy);
    createTranslationIfNotExists(
        "testResult.status.loading", languageCode, "Loading...", createdBy);
    createTranslationIfNotExists(
        "testResult.tooltip.delete", languageCode, "Delete test result", createdBy);
    createTranslationIfNotExists(
        "testResult.tooltip.edit", languageCode, "Edit test result", createdBy);
    createTranslationIfNotExists(
        "testResult.tooltip.export", languageCode, "Export to CSV", createdBy);
    createTranslationIfNotExists(
        "testResult.tooltip.jiraNotConfigured",
        languageCode,
        "JIRA configuration required",
        createdBy);
    createTranslationIfNotExists(
        "testResult.tooltip.noExpectedResult", languageCode, "No expected result", createdBy);
    createTranslationIfNotExists(
        "testResult.tooltip.noJiraTargets", languageCode, "No linked JIRA IDs", createdBy);
    createTranslationIfNotExists(
        "testResult.tooltip.noSteps", languageCode, "No test steps", createdBy);
    createTranslationIfNotExists(
        "testResult.tooltip.noTestTechnique", languageCode, "No test technique", createdBy);
    createTranslationIfNotExists(
        "testResult.tooltip.refresh", languageCode, "Refresh data", createdBy);
    createTranslationIfNotExists(
        "testResult.tooltip.view", languageCode, "View test result", createdBy);
    createTranslationIfNotExists(
        "testResultDashboard.chart.executionComparison",
        languageCode,
        "Results by Execution",
        createdBy);
    createTranslationIfNotExists(
        "testResultDashboard.chart.folderComparison", languageCode, "Results by Folder", createdBy);
    createTranslationIfNotExists(
        "testcase.advancedGrid.features.edit",
        languageCode,
        "Double-click to edit a cell, Enter to finish and move to the next row, Tab to move to the"
            + " next cell.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.advancedGrid.tips.multiline",
        languageCode,
        "Use the standard input mode if you need multi-line input.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.advancedGrid.tips.title", languageCode, "Tips:", createdBy);
    createTranslationIfNotExists("testcase.ai.autoLabel", languageCode, "Auto", createdBy);
    createTranslationIfNotExists(
        "testcase.ai.autoMode.off",
        languageCode,
        "Auto-generate OFF - click the button to generate manually",
        createdBy);
    createTranslationIfNotExists(
        "testcase.ai.autoMode.on",
        languageCode,
        "Auto-generate ON - Name/Description are generated automatically as you type steps",
        createdBy);
    createTranslationIfNotExists(
        "testcase.ai.error.failed", languageCode, "AI generation failed.", createdBy);
    createTranslationIfNotExists(
        "testcase.ai.error.noSteps",
        languageCode,
        "Enter at least one step for AI generation.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.ai.generateTooltip",
        languageCode,
        "Auto-generate Name/Description with AI",
        createdBy);
    createTranslationIfNotExists(
        "testcase.ai.generating", languageCode, "Generating with AI...", createdBy);
    createTranslationIfNotExists("testcase.ai.manualLabel", languageCode, "Manual", createdBy);
    createTranslationIfNotExists(
        "testcase.autoSave.error", languageCode, "Auto-save failed", createdBy);
    createTranslationIfNotExists("testcase.autoSave.saved", languageCode, "Saved", createdBy);
    createTranslationIfNotExists("testcase.autoSave.saving", languageCode, "Saving...", createdBy);
    createTranslationIfNotExists(
        "testcase.column.createdBy", languageCode, "Created By", createdBy);
    createTranslationIfNotExists(
        "testcase.column.description", languageCode, "Description", createdBy);
    createTranslationIfNotExists("testcase.column.name", languageCode, "Name", createdBy);
    createTranslationIfNotExists("testcase.column.notes", languageCode, "Notes", createdBy);
    createTranslationIfNotExists("testcase.column.priority", languageCode, "Priority", createdBy);
    createTranslationIfNotExists("testcase.column.steps", languageCode, "Steps", createdBy);
    createTranslationIfNotExists("testcase.column.tags", languageCode, "Tags", createdBy);
    createTranslationIfNotExists(
        "testcase.column.updatedBy", languageCode, "Updated By", createdBy);
    createTranslationIfNotExists("testcase.description", languageCode, "Description", createdBy);
    createTranslationIfNotExists(
        "testcase.dialog.delete.folderWarning",
        languageCode,
        "Deleting a folder also deletes all test cases inside it.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.expectedResults", languageCode, "Expected Results (Overall)", createdBy);
    createTranslationIfNotExists(
        "testcase.field.description", languageCode, "Description", createdBy);
    createTranslationIfNotExists(
        "testcase.field.expectedResults", languageCode, "Expected Results", createdBy);
    createTranslationIfNotExists("testcase.field.name", languageCode, "Test Case Name", createdBy);
    createTranslationIfNotExists(
        "testcase.field.preCondition", languageCode, "Preconditions", createdBy);
    createTranslationIfNotExists("testcase.field.priority", languageCode, "Priority", createdBy);
    createTranslationIfNotExists("testcase.field.steps", languageCode, "Test Steps", createdBy);
    createTranslationIfNotExists("testcase.field.tags", languageCode, "Tags", createdBy);
    createTranslationIfNotExists("testcase.form.button.cancel", languageCode, "Cancel", createdBy);
    createTranslationIfNotExists("testcase.form.button.save", languageCode, "Save", createdBy);
    createTranslationIfNotExists(
        "testcase.form.button.saving", languageCode, "Saving...", createdBy);
    createTranslationIfNotExists("testcase.form.button.update", languageCode, "Update", createdBy);
    createTranslationIfNotExists(
        "testcase.form.fieldVisibility", languageCode, "Select Visible Fields", createdBy);
    createTranslationIfNotExists("testcase.form.readOnly", languageCode, "Read Only", createdBy);
    createTranslationIfNotExists("testcase.form.reorder", languageCode, "Order", createdBy);
    createTranslationIfNotExists(
        "testcase.helper.enterContent", languageCode, "Enter content.", createdBy);
    createTranslationIfNotExists(
        "testcase.helper.folderTags",
        languageCode,
        "Tags added to a folder propagate to all test cases inside it (automatic)",
        createdBy);
    createTranslationIfNotExists(
        "testcase.inlineImage.altLabel", languageCode, "Alt Text", createdBy);
    createTranslationIfNotExists(
        "testcase.inlineImage.description",
        languageCode,
        "Image embedded in the content",
        createdBy);
    createTranslationIfNotExists(
        "testcase.inlineImage.dialogTitle", languageCode, "Clipboard Image Options", createdBy);
    createTranslationIfNotExists(
        "testcase.inlineImage.helper",
        languageCode,
        "The image is uploaded to storage and embedded with a public token URL.",
        createdBy);
    createTranslationIfNotExists("testcase.inlineImage.insert", languageCode, "Insert", createdBy);
    createTranslationIfNotExists(
        "testcase.inlineImage.previewUnavailable", languageCode, "Loading preview...", createdBy);
    createTranslationIfNotExists(
        "testcase.inlineImage.saveRequired",
        languageCode,
        "Save the test case before pasting images.",
        createdBy);
    createTranslationIfNotExists("testcase.inlineImage.unit", languageCode, "Unit", createdBy);
    createTranslationIfNotExists(
        "testcase.inlineImage.uploadFailed", languageCode, "Image upload failed.", createdBy);
    createTranslationIfNotExists(
        "testcase.inlineImage.uploadingProgress",
        languageCode,
        "Uploading clipboard image...",
        createdBy);
    createTranslationIfNotExists(
        "testcase.inlineImage.urlMissing",
        languageCode,
        "Failed to generate the image URL.",
        createdBy);
    createTranslationIfNotExists("testcase.inlineImage.width", languageCode, "Width", createdBy);
    createTranslationIfNotExists(
        "testcase.inlineImage.widthHelper", languageCode, "Leave blank for 100%.", createdBy);
    createTranslationIfNotExists(
        "testcase.io.export.google.label", languageCode, "2. Google Sheets Settings", createdBy);
    createTranslationIfNotExists(
        "testcase.io.import.url.required", languageCode, "Enter a Google Sheets URL", createdBy);
    createTranslationIfNotExists(
        "testcase.message.confirmDiscard",
        languageCode,
        "You have unsaved content. Add a new case anyway? Existing content will be lost.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.message.selectTreeItem",
        languageCode,
        "Select an item in the tree on the left to view its details.",
        createdBy);
    createTranslationIfNotExists("testcase.metadata", languageCode, "Metadata", createdBy);
    createTranslationIfNotExists("testcase.noSteps", languageCode, "No steps.", createdBy);
    createTranslationIfNotExists(
        "testcase.postCondition", languageCode, "Postconditions", createdBy);
    createTranslationIfNotExists("testcase.preCondition", languageCode, "Preconditions", createdBy);
    createTranslationIfNotExists(
        "testcase.rag.checking.label", languageCode, "Checking status...", createdBy);
    createTranslationIfNotExists(
        "testcase.rag.checking.tooltip",
        languageCode,
        "Checking RAG registration status...",
        createdBy);
    createTranslationIfNotExists(
        "testcase.rag.notVectorized.label", languageCode, "Not in RAG", createdBy);
    createTranslationIfNotExists(
        "testcase.rag.notVectorized.tooltip",
        languageCode,
        "This test case is not registered in the RAG system yet. Registering it enables similar"
            + " test case search.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.rag.register", languageCode, "Register to RAG", createdBy);
    createTranslationIfNotExists(
        "testcase.rag.register.tooltip",
        languageCode,
        "Registering to the RAG system enables similar test case search and AI recommendations.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.rag.registering", languageCode, "Registering...", createdBy);
    createTranslationIfNotExists(
        "testcase.rag.vectorized.label", languageCode, "Registered in RAG", createdBy);
    createTranslationIfNotExists(
        "testcase.rag.vectorized.tooltip",
        languageCode,
        "This test case is registered in the RAG system and used for similarity search.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.button.addRow", languageCode, "Add Row", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.button.deleteRows", languageCode, "Delete Selected", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.delete.description",
        languageCode,
        "Delete {count} item(s)? Deleted items cannot be recovered.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.notification.stepChanged",
        languageCode,
        "Step count changed to {count}.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.status.batchEdit", languageCode, "Bulk Edit", createdBy);
    createTranslationIfNotExists(
        "testcase.spreadsheet.validation.successTitle",
        languageCode,
        "Validation Passed",
        createdBy);
    createTranslationIfNotExists("testcase.step.action", languageCode, "Description", createdBy);
    createTranslationIfNotExists(
        "testcase.step.expected", languageCode, "Expected Result", createdBy);
    createTranslationIfNotExists("testcase.step.number", languageCode, "No.", createdBy);
    createTranslationIfNotExists("testcase.steps", languageCode, "Step Details", createdBy);
    createTranslationIfNotExists(
        "testcase.tree.action.addTestCase", languageCode, "Add Test Case", createdBy);
    createTranslationIfNotExists(
        "testcase.tree.action.cancelOrder", languageCode, "Cancel Reordering", createdBy);
    createTranslationIfNotExists(
        "testcase.tree.action.deleteSelected", languageCode, "Delete ({count})", createdBy);
    createTranslationIfNotExists(
        "testcase.tree.action.editOrder", languageCode, "Reorder", createdBy);
    createTranslationIfNotExists(
        "testcase.tree.action.refresh", languageCode, "Refresh", createdBy);
    createTranslationIfNotExists(
        "testcase.tree.action.saveOrder", languageCode, "Save Order", createdBy);
    createTranslationIfNotExists(
        "testcase.tree.count.folder", languageCode, "Folder: {count}", createdBy);
    createTranslationIfNotExists(
        "testcase.tree.count.testcase", languageCode, "TC: {count}", createdBy);
    createTranslationIfNotExists(
        "testcase.tree.dialog.deleting", languageCode, "Deleting...", createdBy);
    createTranslationIfNotExists(
        "testcase.tree.dialog.deletingMessage",
        languageCode,
        "Deleting items including children and attachments. Please wait.",
        createdBy);
    createTranslationIfNotExists(
        "testcase.tree.error.moveFailed", languageCode, "Move failed.", createdBy);
    createTranslationIfNotExists("theme.dark", languageCode, "Dark Mode", createdBy);
    createTranslationIfNotExists("theme.light", languageCode, "Light Mode", createdBy);
    createTranslationIfNotExists(
        "userList.action.sendVerificationEmail",
        languageCode,
        "Send Verification Email",
        createdBy);
    createTranslationIfNotExists(
        "userList.email.error",
        languageCode,
        "An error occurred while sending the email.",
        createdBy);
    createTranslationIfNotExists(
        "userList.email.failed", languageCode, "Failed to send the email.", createdBy);
    createTranslationIfNotExists(
        "userList.email.notVerified", languageCode, "Not Verified", createdBy);
    createTranslationIfNotExists(
        "userList.email.sent", languageCode, "Verification email sent.", createdBy);
    createTranslationIfNotExists("userList.email.verified", languageCode, "Verified", createdBy);
    createTranslationIfNotExists(
        "userList.table.emailVerified", languageCode, "Email Verified", createdBy);
    createTranslationIfNotExists(
        "validation.email.invalid", languageCode, "Invalid email format", createdBy);
    createTranslationIfNotExists(
        "validation.password.minLength",
        languageCode,
        "Password must be at least 8 characters",
        createdBy);
    createTranslationIfNotExists(
        "validation.password.mismatch", languageCode, "Passwords do not match.", createdBy);
    createTranslationIfNotExists(
        "validation.required", languageCode, "This field is required", createdBy);
    createTranslationIfNotExists(
        "validation.required.all", languageCode, "Please fill in all fields.", createdBy);
    createTranslationIfNotExists(
        "testcase.message.confirmTagCleanup",
        languageCode,
        "Delete the tags [{tags}] inherited from the previous folder?\n"
            + "Choose 'Yes' to remove them or 'No' to keep them.",
        createdBy);

    log.info("i18n gap en 번역 초기화 완료");
  }

  private void createTranslationIfNotExists(
      String keyName, String languageCode, String value, String createdBy) {
    Optional<TranslationKey> translationKeyOpt = translationKeyRepository.findByKeyName(keyName);
    if (translationKeyOpt.isPresent()) {
      TranslationKey translationKey = translationKeyOpt.get();
      Optional<Language> languageOpt = languageRepository.findByCode(languageCode);
      if (languageOpt.isPresent()) {
        Language language = languageOpt.get();
        Optional<Translation> existingTranslationOpt =
            translationRepository.findByTranslationKeyAndLanguage(translationKey, language);
        if (existingTranslationOpt.isEmpty()) {
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
    } else {
      log.warn("Translation key not found: {}", keyName);
    }
  }
}
