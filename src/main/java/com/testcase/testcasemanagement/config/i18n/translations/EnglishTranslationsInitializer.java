// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishTranslationsInitializer.java
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

@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishTranslationsInitializer {

    private final LanguageRepository languageRepository;
    private final TranslationKeyRepository translationKeyRepository;
    private final TranslationRepository translationRepository;

    public void initialize() {
        String languageCode = "en";
        String createdBy = "system";

        // This is just a subset of translations for brevity. In a real application, you would have all of them.
        createTranslationIfNotExists("login.title", languageCode, "Login", createdBy);
        createTranslationIfNotExists("login.username", languageCode, "Username", createdBy);
        createTranslationIfNotExists("login.password", languageCode, "Password", createdBy);
        createTranslationIfNotExists("login.button", languageCode, "Login", createdBy);
        createTranslationIfNotExists("dashboard.title", languageCode, "Dashboard", createdBy);

        // Dashboard page specific translation keys
        createTranslationIfNotExists("dashboard.lastUpdated", languageCode, "Last updated: {date}", createdBy);
        createTranslationIfNotExists("dashboard.refresh.tooltip", languageCode, "Refresh dashboard data", createdBy);
        createTranslationIfNotExists("dashboard.refresh.button", languageCode, "Refresh", createdBy);

        // Loading states
        createTranslationIfNotExists("dashboard.loading.data", languageCode, "Loading dashboard data...", createdBy);
        createTranslationIfNotExists("dashboard.loading.chart", languageCode, "Loading chart data...", createdBy);

        // Error states
        createTranslationIfNotExists("dashboard.error.solution", languageCode, "Solution: {action}", createdBy);
        createTranslationIfNotExists("dashboard.error.retry", languageCode, "Retry", createdBy);
        createTranslationIfNotExists("dashboard.error.goToLogin", languageCode, "Go to Login", createdBy);
        createTranslationIfNotExists("dashboard.error.details", languageCode, "Details", createdBy);

        // No data states
        createTranslationIfNotExists("dashboard.noData.message", languageCode, "No dashboard data to display.", createdBy);
        createTranslationIfNotExists("dashboard.noData.chart", languageCode, "No chart data available.", createdBy);
        createTranslationIfNotExists("dashboard.noData.noActiveTestRuns", languageCode, "No active test runs available.", createdBy);

        // Project info
        createTranslationIfNotExists("dashboard.project.totalTestCases", languageCode, "Total {count} test cases", createdBy);
        createTranslationIfNotExists("dashboard.project.members", languageCode, "{count} members", createdBy);

        // Chart titles
        createTranslationIfNotExists("dashboard.charts.recentTestResults", languageCode, "Recent Test Results", createdBy);
        createTranslationIfNotExists("dashboard.charts.testResultsTrend", languageCode, "Test Results Trend", createdBy);
        createTranslationIfNotExists("dashboard.charts.last15Days", languageCode, "Last 15 days", createdBy);
        createTranslationIfNotExists("dashboard.charts.openTestRunResults", languageCode, "Open Test Run Results", createdBy);
        createTranslationIfNotExists("dashboard.charts.assigneeResults", languageCode, "Results by Assignee", createdBy);
        createTranslationIfNotExists("dashboard.charts.testPlanResults", languageCode, "Test Plan Results", createdBy);
        createTranslationIfNotExists("dashboard.charts.notRunTrend", languageCode, "Not Run Trend", createdBy);

        // Status related
        createTranslationIfNotExists("dashboard.status.pass", languageCode, "Pass", createdBy);
        createTranslationIfNotExists("dashboard.status.fail", languageCode, "Fail", createdBy);
        createTranslationIfNotExists("dashboard.status.blocked", languageCode, "Blocked", createdBy);
        createTranslationIfNotExists("dashboard.status.notrun", languageCode, "Not Run", createdBy);
        createTranslationIfNotExists("dashboard.status.skipped", languageCode, "Skipped", createdBy);
        createTranslationIfNotExists("dashboard.status.complete", languageCode, "Complete", createdBy);
        createTranslationIfNotExists("dashboard.status.failureRate", languageCode, "Failure rate {rate}%", createdBy);
        createTranslationIfNotExists("dashboard.status.completedCount", languageCode, "{completed}/{total} completed", createdBy);

        // Messages
        createTranslationIfNotExists("dashboard.messages.selectProject", languageCode, "Please select a project to view test plan results.", createdBy);

        createTranslationIfNotExists("project.title", languageCode, "Project Management", createdBy);
        createTranslationIfNotExists("organization.management.title", languageCode, "Organization Management", createdBy);
        createTranslationIfNotExists("userList.title", languageCode, "User Management", createdBy);
        createTranslationIfNotExists("testcase.form.title.create", languageCode, "Create Test Case", createdBy);
        createTranslationIfNotExists("testPlan.form.title.create", languageCode, "Create New Test Plan", createdBy);
        createTranslationIfNotExists("testPlan.form.title.edit", languageCode, "Edit Test Plan", createdBy);
        createTranslationIfNotExists("testPlan.form.planName", languageCode, "Plan Name", createdBy);
        createTranslationIfNotExists("testPlan.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testPlan.form.testcaseSelection", languageCode, "Test Case Selection", createdBy);
        createTranslationIfNotExists("testPlan.form.selectedCount", languageCode, "{count} selected", createdBy);
        createTranslationIfNotExists("testPlan.form.projectSelectFirst", languageCode, "Please select a project first", createdBy);
        createTranslationIfNotExists("testPlan.form.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testPlan.form.button.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("testPlan.form.button.processing", languageCode, "Processing...", createdBy);

        // Test plan form validation messages
        createTranslationIfNotExists("testPlan.validation.nameRequired", languageCode, "Test plan name is required", createdBy);
        createTranslationIfNotExists("testPlan.validation.testcaseRequired", languageCode, "At least one test case must be selected", createdBy);
        createTranslationIfNotExists("testPlan.error.saveFailed", languageCode, "Error occurred while saving: ", createdBy);

        // Test plan list
        createTranslationIfNotExists("testPlan.list.add", languageCode, "Add Test Plan", createdBy);
        createTranslationIfNotExists("testPlan.list.table.id", languageCode, "ID", createdBy);
        createTranslationIfNotExists("testPlan.list.table.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("testPlan.list.table.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testPlan.list.table.testcaseCount", languageCode, "Test Cases", createdBy);
        createTranslationIfNotExists("testPlan.list.table.createdAt", languageCode, "Created", createdBy);
        createTranslationIfNotExists("testPlan.list.table.execute", languageCode, "Execute", createdBy);
        createTranslationIfNotExists("testPlan.list.table.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("testPlan.list.table.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("testPlan.list.empty.message", languageCode, "No test plans registered.", createdBy);

        // Test execution dialog
        createTranslationIfNotExists("testPlan.execution.dialog.title", languageCode, "Test Execution - {planName}", createdBy);
        createTranslationIfNotExists("testPlan.execution.button.newExecution", languageCode, "Create New Execution", createdBy);
        createTranslationIfNotExists("testPlan.execution.empty.message", languageCode, "No execution history for this test plan.", createdBy);
        createTranslationIfNotExists("testPlan.execution.progress", languageCode, "Progress:", createdBy);
        createTranslationIfNotExists("testPlan.execution.action.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("testPlan.execution.action.view", languageCode, "View Full Screen", createdBy);
        createTranslationIfNotExists("testPlan.execution.dialog.close", languageCode, "Close", createdBy);

        // Test plan delete dialog
        createTranslationIfNotExists("testPlan.delete.dialog.title", languageCode, "Delete Test Plan", createdBy);
        createTranslationIfNotExists("testPlan.delete.dialog.message", languageCode, "Are you sure you want to delete this test plan? This action cannot be undone.", createdBy);
        createTranslationIfNotExists("testPlan.delete.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testPlan.delete.button.delete", languageCode, "Delete", createdBy);

        // Test plan selector
        createTranslationIfNotExists("testPlan.selector.label", languageCode, "Select Test Plan", createdBy);
        createTranslationIfNotExists("testPlan.selector.all", languageCode, "All", createdBy);
        createTranslationIfNotExists("testPlan.selector.caseCount", languageCode, "{count} cases", createdBy);
        createTranslationIfNotExists("testPlan.selector.selected", languageCode, "Selected plan: {planName}", createdBy);
        createTranslationIfNotExists("testPlan.selector.testcaseCount", languageCode, "({count} test cases)", createdBy);

        // Execution status
        createTranslationIfNotExists("testPlan.status.notStarted", languageCode, "Not Started", createdBy);
        createTranslationIfNotExists("testPlan.status.inProgress", languageCode, "In Progress", createdBy);
        createTranslationIfNotExists("testPlan.status.completed", languageCode, "Completed", createdBy);

        // Tab label
        createTranslationIfNotExists("testPlan.tab.label", languageCode, "Test Plans", createdBy);
        createTranslationIfNotExists("testExecution.title", languageCode, "Test Execution", createdBy);

        // Test execution list (TestExecutionList)
        createTranslationIfNotExists("testExecution.list.title", languageCode, "Execution History", createdBy);
        createTranslationIfNotExists("testExecution.list.newExecution", languageCode, "New Execution", createdBy);
        createTranslationIfNotExists("testExecution.list.noExecutions", languageCode, "No execution history found.", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.title", languageCode, "Delete Execution", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.confirm", languageCode, "Are you sure you want to delete this execution?", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.delete", languageCode, "Delete", createdBy);

        // Test execution status chips
        createTranslationIfNotExists("testExecution.status.notStarted", languageCode, "Not Started", createdBy);
        createTranslationIfNotExists("testExecution.status.inProgress", languageCode, "In Progress", createdBy);
        createTranslationIfNotExists("testExecution.status.completed", languageCode, "Completed", createdBy);

        // Test execution form (TestExecutionForm)
        createTranslationIfNotExists("testExecution.form.title.create", languageCode, "Create Test Execution", createdBy);
        createTranslationIfNotExists("testExecution.form.title.edit", languageCode, "Test Execution: {name}", createdBy);
        createTranslationIfNotExists("testExecution.form.executionName", languageCode, "Execution Name", createdBy);
        createTranslationIfNotExists("testExecution.form.testPlan", languageCode, "Test Plan", createdBy);
        createTranslationIfNotExists("testExecution.form.testPlan.select", languageCode, "Select", createdBy);
        createTranslationIfNotExists("testExecution.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testExecution.form.startImmediately", languageCode, "Start execution immediately after saving", createdBy);
        createTranslationIfNotExists("testExecution.form.startImmediately.description", languageCode, "If checked, the test execution will be changed to 'In Progress' status immediately upon saving, allowing you to start testing right away without closing the window", createdBy);

        // Test execution form buttons
        createTranslationIfNotExists("testExecution.form.button.list", languageCode, "List", createdBy);
        createTranslationIfNotExists("testExecution.form.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testExecution.form.button.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("testExecution.form.button.saveAndStart", languageCode, "Save & Start", createdBy);
        createTranslationIfNotExists("testExecution.form.button.start", languageCode, "Start Execution", createdBy);
        createTranslationIfNotExists("testExecution.form.button.complete", languageCode, "Complete Execution", createdBy);
        createTranslationIfNotExists("testExecution.form.button.restart", languageCode, "Restart", createdBy);
        createTranslationIfNotExists("testExecution.form.button.hideGuide", languageCode, "Hide Guide", createdBy);
        createTranslationIfNotExists("testExecution.form.button.showGuide", languageCode, "Execution Guide", createdBy);

        // Test execution info panel
        createTranslationIfNotExists("testExecution.info.title", languageCode, "Execution Info", createdBy);
        createTranslationIfNotExists("testExecution.info.status", languageCode, "Status", createdBy);
        createTranslationIfNotExists("testExecution.info.startDate", languageCode, "Start Date", createdBy);
        createTranslationIfNotExists("testExecution.info.endDate", languageCode, "End Date", createdBy);
        createTranslationIfNotExists("testExecution.info.progress", languageCode, "Progress", createdBy);
        createTranslationIfNotExists("testExecution.info.total", languageCode, "Total {total} items", createdBy);

        // Test execution guide
        createTranslationIfNotExists("testExecution.guide.title", languageCode, "📋 Test Execution Procedure Guide", createdBy);
        createTranslationIfNotExists("testExecution.guide.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("testExecution.guide.step1.title", languageCode, "1. Test Execution Preparation", createdBy);
        createTranslationIfNotExists("testExecution.guide.step1.description", languageCode, "Enter execution name, test plan, and description, then click the 'Save' button.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step2.title", languageCode, "2. Start Execution", createdBy);
        createTranslationIfNotExists("testExecution.guide.step2.description", languageCode, "Click the 'Start Execution' button to change the test execution status to 'In Progress'.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step3.title", languageCode, "3. Execute Test Cases", createdBy);
        createTranslationIfNotExists("testExecution.guide.step3.description", languageCode, "Click the 'Enter Result' button for each test case to record test results.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step4.title", languageCode, "4. Complete Execution", createdBy);
        createTranslationIfNotExists("testExecution.guide.step4.description", languageCode, "When all tests are completed, click the 'Complete Execution' button to finish the execution.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step5.title", languageCode, "5. View Results", createdBy);
        createTranslationIfNotExists("testExecution.guide.step5.description", languageCode, "Check progress and result statistics. Use the 'Previous Results' button to view past execution history if needed.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step6.title", languageCode, "6. Re-execution (After Completion)", createdBy);
        createTranslationIfNotExists("testExecution.guide.step6.description", languageCode, "Completed test executions can be restarted by clicking the 'Restart' button to change back to 'In Progress' status for additional testing.", createdBy);

        // Test case table headers
        createTranslationIfNotExists("testExecution.table.header.folderCase", languageCode, "Folder/Case", createdBy);
        createTranslationIfNotExists("testExecution.table.header.caseName", languageCode, "Case Name", createdBy);
        createTranslationIfNotExists("testExecution.table.header.result", languageCode, "Result", createdBy);
        createTranslationIfNotExists("testExecution.table.header.executedAt", languageCode, "Executed At", createdBy);
        createTranslationIfNotExists("testExecution.table.header.executedBy", languageCode, "Executed By", createdBy);
        createTranslationIfNotExists("testExecution.table.header.notes", languageCode, "Notes", createdBy);
        createTranslationIfNotExists("testExecution.table.header.jiraId", languageCode, "JIRA ID", createdBy);
        createTranslationIfNotExists("testExecution.table.header.resultInput", languageCode, "Enter Result", createdBy);
        createTranslationIfNotExists("testExecution.table.header.previousResults", languageCode, "Previous Results", createdBy);
        createTranslationIfNotExists("testExecution.table.header.attachments", languageCode, "Attachments", createdBy);

        // Test case table buttons
        createTranslationIfNotExists("testExecution.table.button.resultInput", languageCode, "Enter Result", createdBy);
        createTranslationIfNotExists("testExecution.table.button.previousResults", languageCode, "Previous Results", createdBy);
        createTranslationIfNotExists("testExecution.table.button.attachments", languageCode, "Attachments", createdBy);

        // Pagination
        createTranslationIfNotExists("testExecution.pagination.info", languageCode, "Showing {start}-{end} of {totalItems} items", createdBy);
        createTranslationIfNotExists("testExecution.pagination.page", languageCode, "Page {current} / {total}", createdBy);
        createTranslationIfNotExists("testExecution.table.noTestCases", languageCode, "No test cases to display.", createdBy);

        // Previous results dialog
        createTranslationIfNotExists("testExecution.previousResults.title", languageCode, "Previous Execution Results", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.noResults", languageCode, "No previous execution results found.", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.executedAt", languageCode, "Executed At", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.result", languageCode, "Result", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.executionId", languageCode, "Execution ID", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.executionName", languageCode, "Execution Name", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.executedBy", languageCode, "Executed By", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.notes", languageCode, "Notes", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.jiraId", languageCode, "JIRA ID", createdBy);
        createTranslationIfNotExists("testExecution.previousResults.table.attachments", languageCode, "Attachments", createdBy);

        // Attachments dialog
        createTranslationIfNotExists("testExecution.attachments.title", languageCode, "Test Result Attachments", createdBy);
        createTranslationIfNotExists("testExecution.attachments.close", languageCode, "Close", createdBy);

        // JIRA issue link
        createTranslationIfNotExists("testExecution.jira.urlNotSet", languageCode, "{issueKey} (JIRA URL not set)", createdBy);

        // Success messages
        createTranslationIfNotExists("testExecution.success.savedAndStarted", languageCode, "Test execution '{name}' has been successfully saved and started. You can now enter results for each test case.", createdBy);

        // 누락된 번역 키들 추가 (영어)
        createTranslationIfNotExists("testExecution.form.status", languageCode, "Status", createdBy);
        createTranslationIfNotExists("testExecution.table.folderCase", languageCode, "Folder/Case", createdBy);
        createTranslationIfNotExists("testExecution.form.titleNew", languageCode, "Create Test Execution", createdBy);
        createTranslationIfNotExists("testExecution.form.titleEdit", languageCode, "Test Execution: {name}", createdBy);
        createTranslationIfNotExists("testExecution.actions.enterResult", languageCode, "Enter Result", createdBy);
        createTranslationIfNotExists("testExecution.actions.prevResults", languageCode, "Previous Results", createdBy);
        createTranslationIfNotExists("testExecution.actions.startExecution", languageCode, "Start Execution", createdBy);
        createTranslationIfNotExists("testExecution.actions.completeExecution", languageCode, "Complete Execution", createdBy);
        createTranslationIfNotExists("testExecution.actions.rerunExecution", languageCode, "Re-run", createdBy);
        createTranslationIfNotExists("testExecution.table.header.folderCase", languageCode, "Folder/Case", createdBy);
        createTranslationIfNotExists("testExecution.table.header.caseName", languageCode, "Case Name", createdBy);
        createTranslationIfNotExists("testExecution.table.header.result", languageCode, "Result", createdBy);
        createTranslationIfNotExists("testExecution.table.header.executedAt", languageCode, "Executed At", createdBy);
        createTranslationIfNotExists("testExecution.table.header.executedBy", languageCode, "Executed By", createdBy);
        createTranslationIfNotExists("testExecution.table.header.notes", languageCode, "Notes", createdBy);
        createTranslationIfNotExists("testExecution.table.header.jiraId", languageCode, "JIRA ID", createdBy);
        createTranslationIfNotExists("testExecution.table.header.resultInput", languageCode, "Enter Result", createdBy);
        createTranslationIfNotExists("testExecution.table.header.previousResults", languageCode, "Previous Results", createdBy);
        createTranslationIfNotExists("testExecution.table.header.attachments", languageCode, "Attachments", createdBy);
        createTranslationIfNotExists("testExecution.dialog.attachments.title", languageCode, "Attachments", createdBy);
        createTranslationIfNotExists("testExecution.dialog.attachments.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("testExecution.progress.completed", languageCode, "Completed", createdBy);
        createTranslationIfNotExists("testExecution.progress.total", languageCode, "Total", createdBy);

        // 추가 누락된 번역 키들 (영어)
        createTranslationIfNotExists("testExecution.table.caseName", languageCode, "Case Name", createdBy);
        createTranslationIfNotExists("testExecution.table.result", languageCode, "Result", createdBy);
        createTranslationIfNotExists("testExecution.table.executedAt", languageCode, "Executed At", createdBy);
        createTranslationIfNotExists("testExecution.table.executedBy", languageCode, "Executed By", createdBy);
        createTranslationIfNotExists("testExecution.table.notes", languageCode, "Notes", createdBy);
        createTranslationIfNotExists("testExecution.table.jiraId", languageCode, "JIRA ID", createdBy);
        createTranslationIfNotExists("testExecution.table.enterResult", languageCode, "Enter Result", createdBy);
        createTranslationIfNotExists("testExecution.table.prevResults", languageCode, "Previous Results", createdBy);
        createTranslationIfNotExists("testExecution.table.attachments", languageCode, "Attachments", createdBy);
        createTranslationIfNotExists("testExecution.table.executionId", languageCode, "Execution ID", createdBy);
        createTranslationIfNotExists("testExecution.table.executionName", languageCode, "Execution Name", createdBy);

        // 폼 관련 누락된 번역 (영어)
        createTranslationIfNotExists("testExecution.form.saveAndStart", languageCode, "Save and Start", createdBy);
        createTranslationIfNotExists("testExecution.form.executionName", languageCode, "Execution Name", createdBy);
        createTranslationIfNotExists("testExecution.form.testPlan", languageCode, "Test Plan", createdBy);
        createTranslationIfNotExists("testExecution.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testExecution.form.progress", languageCode, "Progress", createdBy);
        createTranslationIfNotExists("testExecution.form.startImmediatelyLabel", languageCode, "Start Immediately", createdBy);
        createTranslationIfNotExists("testExecution.form.startImmediatelyDescription", languageCode, "Start execution immediately after saving.", createdBy);

        // 액션 관련 누락된 번역 (영어)
        createTranslationIfNotExists("testExecution.actions.restartExecution", languageCode, "Restart", createdBy);

        // 이전 결과 다이얼로그 (영어)
        createTranslationIfNotExists("testExecution.prevResults.title", languageCode, "Previous Execution Results", createdBy);
        createTranslationIfNotExists("testExecution.prevResults.noResults", languageCode, "No previous execution results found.", createdBy);

        // 상태 관련 번역 (영어)
        createTranslationIfNotExists("testExecution.status.notStarted", languageCode, "Not Started", createdBy);
        createTranslationIfNotExists("testExecution.status.inProgress", languageCode, "In Progress", createdBy);
        createTranslationIfNotExists("testExecution.status.completed", languageCode, "Completed", createdBy);

        // 리스트 관련 번역 (영어)
        createTranslationIfNotExists("testExecution.list.title", languageCode, "Test Executions", createdBy);
        createTranslationIfNotExists("testExecution.list.newExecution", languageCode, "New Execution", createdBy);
        createTranslationIfNotExists("testExecution.list.noExecutions", languageCode, "No test executions found.", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.title", languageCode, "Delete Execution", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.confirm", languageCode, "Are you sure you want to delete this test execution?", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.delete", languageCode, "Delete", createdBy);

        // 가이드 관련 번역 (영어)
        createTranslationIfNotExists("testExecution.guide.title", languageCode, "📋 Test Execution Procedure Guide", createdBy);
        createTranslationIfNotExists("testExecution.guide.step1.title", languageCode, "1. Enter Execution Information", createdBy);
        createTranslationIfNotExists("testExecution.guide.step1.description", languageCode, "Enter basic information such as execution name, test plan, and description.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step2.title", languageCode, "2. Start Execution", createdBy);
        createTranslationIfNotExists("testExecution.guide.step2.description", languageCode, "Click 'Start Execution' button to change the test execution status to 'In Progress'.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step3.title", languageCode, "3. Execute Test Cases", createdBy);
        createTranslationIfNotExists("testExecution.guide.step3.description", languageCode, "Click 'Enter Result' button for each test case to record test results.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step4.title", languageCode, "4. Complete Execution", createdBy);
        createTranslationIfNotExists("testExecution.guide.step4.description", languageCode, "Once all tests are completed, click 'Complete Execution' button to finish the execution.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step5.title", languageCode, "5. Check Results", createdBy);
        createTranslationIfNotExists("testExecution.guide.step5.description", languageCode, "Check progress and result statistics. Use 'Previous Results' button to view past execution history if needed.", createdBy);
        createTranslationIfNotExists("testExecution.guide.step6.title", languageCode, "6. Re-run (After Completion)", createdBy);
        createTranslationIfNotExists("testExecution.guide.step6.description", languageCode, "Completed test executions can be restarted by clicking 'Re-run' button to change back to 'In Progress' status for additional testing.", createdBy);

        // 새로 추가된 번역 키들
        createTranslationIfNotExists("testExecution.table.viewAttachments", languageCode, "View Attachments", createdBy);
        createTranslationIfNotExists("testExecution.form.registerTitle", languageCode, "Register Test Execution", createdBy);
        createTranslationIfNotExists("testExecution.form.executionInfo", languageCode, "Execution Info", createdBy);
        createTranslationIfNotExists("testExecution.form.startDate", languageCode, "Start Date", createdBy);
        createTranslationIfNotExists("testExecution.form.endDate", languageCode, "End Date", createdBy);
        createTranslationIfNotExists("testExecution.form.editTitle", languageCode, "Test Execution: {name}", createdBy);
        createTranslationIfNotExists("testExecution.table.attachments", languageCode, "Attachments", createdBy);
        createTranslationIfNotExists("testExecution.attachments.title", languageCode, "Test Result Attachments", createdBy);

        // Common 키들
        createTranslationIfNotExists("common.list", languageCode, "List", createdBy);
        createTranslationIfNotExists("common.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("common.save", languageCode, "Save", createdBy);

        // 테스트 결과 페이지 (TestResultMainPage)
        createTranslationIfNotExists("testResult.mainPage.title", languageCode, "Test Results", createdBy);
        createTranslationIfNotExists("testResult.mainPage.description", languageCode, "Analyze and manage all test results of the project in an integrated way.", createdBy);

        // 테스트 결과 메인 페이지 탭
        createTranslationIfNotExists("testResult.tab.statistics", languageCode, "Statistics", createdBy);
        createTranslationIfNotExists("testResult.tab.statisticsFull", languageCode, "Statistics Dashboard", createdBy);
        createTranslationIfNotExists("testResult.tab.statisticsDescription", languageCode, "Visualize Pass/Fail/NotRun/Blocked result distribution at a glance", createdBy);

        createTranslationIfNotExists("testResult.tab.trend", languageCode, "Trend", createdBy);
        createTranslationIfNotExists("testResult.tab.trendFull", languageCode, "Trend Analysis", createdBy);
        createTranslationIfNotExists("testResult.tab.trendDescription", languageCode, "Analyze and compare results by test plan and executor with performance trend analysis", createdBy);

        createTranslationIfNotExists("testResult.tab.table", languageCode, "Table", createdBy);
        createTranslationIfNotExists("testResult.tab.tableFull", languageCode, "Detailed Table", createdBy);
        createTranslationIfNotExists("testResult.tab.tableDescription", languageCode, "View all test results in detailed table format", createdBy);

        createTranslationIfNotExists("testResult.tab.report", languageCode, "Report", createdBy);
        createTranslationIfNotExists("testResult.tab.reportFull", languageCode, "Detailed Report", createdBy);
        createTranslationIfNotExists("testResult.tab.reportDescription", languageCode, "Support detailed results by folder and case with JIRA integration status management", createdBy);

        // 테스트 결과 입력 폼 (TestResultForm)
        createTranslationIfNotExists("testResult.form.title", languageCode, "Enter Test Result", createdBy);
        createTranslationIfNotExists("testResult.form.testResult", languageCode, "Test Result", createdBy);
        createTranslationIfNotExists("testResult.form.preCondition", languageCode, "Pre-condition", createdBy);
        createTranslationIfNotExists("testResult.form.testSteps", languageCode, "Test Steps", createdBy);
        createTranslationIfNotExists("testResult.form.expectedResult", languageCode, "Expected Result", createdBy);
        createTranslationIfNotExists("testResult.form.notes", languageCode, "Notes", createdBy);
        createTranslationIfNotExists("testResult.form.notesPlaceholder", languageCode, "Notes ({length}/10,000)", createdBy);
        createTranslationIfNotExists("testResult.form.notesHelp", languageCode, "For long content, file attachment is recommended.", createdBy);
        createTranslationIfNotExists("testResult.form.notesLimitWarning", languageCode, "{remaining} characters remaining", createdBy);
        createTranslationIfNotExists("testResult.form.notesLimitError", languageCode, "Exceeded 10,000 characters. Please attach long content as a file.", createdBy);

        // 파일 첨부
        createTranslationIfNotExists("testResult.form.fileAttachment", languageCode, "File Attachment", createdBy);
        createTranslationIfNotExists("testResult.form.fileSelect", languageCode, "Select Files", createdBy);
        createTranslationIfNotExists("testResult.form.fileUploading", languageCode, "Uploading...", createdBy);
        createTranslationIfNotExists("testResult.form.fileFormat", languageCode, "Allowed formats: TXT, CSV, JSON, MD, PDF, LOG (Max 10MB)", createdBy);
        createTranslationIfNotExists("testResult.form.newAttachments", languageCode, "Files to be attached ({count} files)", createdBy);
        createTranslationIfNotExists("testResult.form.attachments", languageCode, "Attachments", createdBy);
        createTranslationIfNotExists("testResult.form.attachmentsNote", languageCode, "Attachments will be available after saving the test result.", createdBy);

        // JIRA 연동
        createTranslationIfNotExists("testResult.form.jiraIntegration", languageCode, "JIRA Issue Integration", createdBy);
        createTranslationIfNotExists("testResult.form.jiraIssueId", languageCode, "JIRA Issue ID (e.g., ICT-123)", createdBy);
        createTranslationIfNotExists("testResult.form.jiraIssuePlaceholder", languageCode, "Enter related JIRA issue key (automatically converted to uppercase)", createdBy);
        createTranslationIfNotExists("testResult.form.jiraComment", languageCode, "JIRA Comment", createdBy);
        createTranslationIfNotExists("testResult.form.jiraDetected", languageCode, "Detected issues: {issues}", createdBy);
        createTranslationIfNotExists("testResult.form.jiraDetectedShort", languageCode, "Detected: {issues}", createdBy);

        // 테스트 결과 페이지 (TestCaseResultPage)
        createTranslationIfNotExists("testCaseResult.page.title", languageCode, "Enter Test Result", createdBy);

        // 새로 추가된 테스트 결과 번역 키들
        createTranslationIfNotExists("testResult.jira.connectionCheckFailed", languageCode, "JIRA connection check failed:", createdBy);
        createTranslationIfNotExists("testResult.jira.placeholder", languageCode, "Enter related JIRA issue key (automatically converted to uppercase)", createdBy);
        createTranslationIfNotExists("testResult.jira.detectedIssues", languageCode, "Detected Issues", createdBy);

        // File error messages
        createTranslationIfNotExists("testResult.file.sizeError", languageCode, "File size must be 10MB or less", createdBy);
        createTranslationIfNotExists("testResult.file.typeError", languageCode, "File type not allowed", createdBy);
        createTranslationIfNotExists("testResult.file.allowedFormats", languageCode, "Allowed formats: TXT, CSV, JSON, MD, PDF, LOG (Max 10MB)", createdBy);
        createTranslationIfNotExists("testResult.file.newAttachmentsCount", languageCode, "Files to be attached ({count} files)", createdBy);
        createTranslationIfNotExists("testResult.file.attachedFilesCount", languageCode, "Attached files ({count} files)", createdBy);
        createTranslationIfNotExists("testResult.file.saveToViewAttachments", languageCode, "Save test result to view attachments.", createdBy);

        // Error messages
        createTranslationIfNotExists("testResult.error.saveFailed", languageCode, "Failed to save result.", createdBy);
        createTranslationIfNotExists("testResult.error.testCaseLoadFailed", languageCode, "Failed to load test case.", createdBy);
        createTranslationIfNotExists("testResult.error.resultRequired", languageCode, "Please select a test result.", createdBy);

        // Common buttons
        createTranslationIfNotExists("common.button.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("common.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("common.button.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("common.button.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("common.button.retry", languageCode, "Retry", createdBy);
        createTranslationIfNotExists("common.empty", languageCode, "-", createdBy);

        // Test result statuses
        createTranslationIfNotExists("testResult.status.pass", languageCode, "Pass", createdBy);
        createTranslationIfNotExists("testResult.status.fail", languageCode, "Fail", createdBy);
        createTranslationIfNotExists("testResult.status.blocked", languageCode, "Blocked", createdBy);
        createTranslationIfNotExists("testResult.status.notRun", languageCode, "Not Run", createdBy);
        createTranslationIfNotExists("testResult.status.error", languageCode, "Error", createdBy);

        // Test result table
        createTranslationIfNotExists("testResult.table.title", languageCode, "Test Results Detailed List", createdBy);
        createTranslationIfNotExists("testResult.table.resultCount", languageCode, " test results", createdBy);
        createTranslationIfNotExists("testResult.table.filtered", languageCode, "Filtered", createdBy);
        createTranslationIfNotExists("testResult.table.loadError", languageCode, "Cannot load test results", createdBy);

        // Test result chart
        createTranslationIfNotExists("testResult.chart.distribution", languageCode, "Test Result Distribution", createdBy);
        createTranslationIfNotExists("testResult.chart.loading", languageCode, "Loading chart data...", createdBy);
        createTranslationIfNotExists("testResult.chart.noData", languageCode, "No chart data available.", createdBy);
        createTranslationIfNotExists("testResult.chart.total", languageCode, "Total test cases: {total}", createdBy);
        createTranslationIfNotExists("testResult.chart.compareTitle", languageCode, "Test Result Comparison", createdBy);
        createTranslationIfNotExists("testResult.chart.percentageView", languageCode, "Percentage View", createdBy);
        createTranslationIfNotExists("testResult.chart.tooltip", languageCode, "Compare results by test plan or executor.", createdBy);
        createTranslationIfNotExists("testResult.chart.yAxisCount", languageCode, "Count", createdBy);
        createTranslationIfNotExists("testResult.chart.yAxisPercent", languageCode, "Percentage (%)", createdBy);
        createTranslationIfNotExists("testResult.chart.compareItems", languageCode, "Total {count} items compared", createdBy);
        createTranslationIfNotExists("testResult.chart.loadingData", languageCode, "Loading chart data...", createdBy);
        createTranslationIfNotExists("testResult.chart.noCompareData", languageCode, "No data to compare.", createdBy);

        // Test result statistics card
        createTranslationIfNotExists("testResult.statistics.title", languageCode, "Test Result Statistics", createdBy);
        createTranslationIfNotExists("testResult.statistics.loading", languageCode, "Loading...", createdBy);
        createTranslationIfNotExists("testResult.statistics.error", languageCode, "Error: {error}", createdBy);
        createTranslationIfNotExists("testResult.statistics.noData", languageCode, "No data", createdBy);
        createTranslationIfNotExists("testResult.statistics.successRate", languageCode, "Success Rate", createdBy);
        createTranslationIfNotExists("testResult.statistics.totalTests", languageCode, "Total Tests", createdBy);
        createTranslationIfNotExists("testResult.statistics.totalCount", languageCode, "Total {count} items", createdBy);

        // Test result pie chart
        createTranslationIfNotExists("testResult.pieChart.title", languageCode, "Test Result Distribution", createdBy);
        createTranslationIfNotExists("testResult.pieChart.loading", languageCode, "Loading chart data...", createdBy);
        createTranslationIfNotExists("testResult.pieChart.noData", languageCode, "No chart data available.", createdBy);
        createTranslationIfNotExists("testResult.pieChart.count", languageCode, "Count", createdBy);
        createTranslationIfNotExists("testResult.pieChart.percentage", languageCode, "Percentage", createdBy);
        createTranslationIfNotExists("testResult.pieChart.totalTestCases", languageCode, "Total test cases: {total}", createdBy);

        // Statistics filter panel
        createTranslationIfNotExists("testResult.filter.title", languageCode, "Statistics Filter", createdBy);
        createTranslationIfNotExists("testResult.filter.applied", languageCode, "{count} applied", createdBy);
        createTranslationIfNotExists("testResult.filter.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("testResult.filter.refreshTooltip", languageCode, "Refresh data", createdBy);
        createTranslationIfNotExists("testResult.filter.clear", languageCode, "Clear", createdBy);
        createTranslationIfNotExists("testResult.filter.clearTooltip", languageCode, "Clear all filters", createdBy);
        createTranslationIfNotExists("testResult.filter.testPlan", languageCode, "Test Plan", createdBy);
        createTranslationIfNotExists("testResult.filter.allPlans", languageCode, "All Plans", createdBy);
        createTranslationIfNotExists("testResult.filter.testExecution", languageCode, "Test Execution", createdBy);
        createTranslationIfNotExists("testResult.filter.allExecutions", languageCode, "All Executions", createdBy);
        createTranslationIfNotExists("testResult.filter.period", languageCode, "Period", createdBy);
        createTranslationIfNotExists("testResult.filter.allPeriod", languageCode, "All Time", createdBy);
        createTranslationIfNotExists("testResult.filter.today", languageCode, "Today", createdBy);
        createTranslationIfNotExists("testResult.filter.week", languageCode, "Last Week", createdBy);
        createTranslationIfNotExists("testResult.filter.month", languageCode, "Last Month", createdBy);
        createTranslationIfNotExists("testResult.filter.quarter", languageCode, "Last 3 Months", createdBy);
        createTranslationIfNotExists("testResult.filter.viewType", languageCode, "View Type", createdBy);
        createTranslationIfNotExists("testResult.filter.overviewView", languageCode, "Overview", createdBy);
        createTranslationIfNotExists("testResult.filter.planView", languageCode, "By Plan", createdBy);
        createTranslationIfNotExists("testResult.filter.executorView", languageCode, "By Executor", createdBy);
        createTranslationIfNotExists("testResult.filter.activeFilters", languageCode, "Active filters:", createdBy);
        createTranslationIfNotExists("testResult.filter.planPrefix", languageCode, "Plan:", createdBy);
        createTranslationIfNotExists("testResult.filter.executionPrefix", languageCode, "Execution:", createdBy);
        createTranslationIfNotExists("testResult.filter.periodPrefix", languageCode, "Period:", createdBy);

        // JIRA Status Summary
        createTranslationIfNotExists("jira.summary.title", languageCode, "JIRA Status Summary", createdBy);
        createTranslationIfNotExists("jira.summary.filterAll", languageCode, "All", createdBy);
        createTranslationIfNotExists("jira.summary.filterInProgress", languageCode, "In Progress", createdBy);
        createTranslationIfNotExists("jira.summary.filterFailed", languageCode, "Failed", createdBy);
        createTranslationIfNotExists("jira.summary.filterPassed", languageCode, "Passed", createdBy);
        createTranslationIfNotExists("jira.summary.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("jira.summary.loadingData", languageCode, "Loading JIRA data...", createdBy);
        createTranslationIfNotExists("jira.summary.error", languageCode, "Error: {error}", createdBy);
        createTranslationIfNotExists("jira.summary.noData", languageCode, "No JIRA issues found.", createdBy);
        createTranslationIfNotExists("jira.summary.testResultsCount", languageCode, "Test Results ({count})", createdBy);
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

        // ProjectHeader 번역 키들
        createTranslationIfNotExists("projectHeader.breadcrumb.projects", languageCode, "Projects", createdBy);
        createTranslationIfNotExists("projectHeader.tabs.dashboard", languageCode, "Dashboard", createdBy);
        createTranslationIfNotExists("projectHeader.tabs.testCases", languageCode, "Test Cases", createdBy);
        createTranslationIfNotExists("projectHeader.tabs.testExecution", languageCode, "Test Execution", createdBy);
        createTranslationIfNotExists("projectHeader.tabs.testResults", languageCode, "Test Results", createdBy);
        createTranslationIfNotExists("projectHeader.tabs.automation", languageCode, "Test Automation", createdBy);

        // TestResultStatisticsDashboard 번역 키들
        createTranslationIfNotExists("testResultDashboard.chart.planComparison", languageCode, "Test Plan Comparison", createdBy);
        createTranslationIfNotExists("testResultDashboard.chart.executorComparison", languageCode, "Executor Comparison", createdBy);
        createTranslationIfNotExists("testResultDashboard.summary.title", languageCode, "Statistics Summary", createdBy);
        createTranslationIfNotExists("testResultDashboard.summary.executionRate", languageCode, "Execution Rate", createdBy);
        createTranslationIfNotExists("testResultDashboard.summary.successRate", languageCode, "Success Rate", createdBy);
        createTranslationIfNotExists("testResultDashboard.summary.jiraLinkRate", languageCode, "JIRA Link Rate", createdBy);
        createTranslationIfNotExists("testResultDashboard.summary.lastUpdated", languageCode, "Last Updated", createdBy);
        createTranslationIfNotExists("testResultDashboard.summary.unknown", languageCode, "Unknown", createdBy);

        // TestResultTrendAnalysis English translations
        createTranslationIfNotExists("testTrendAnalysis.error.comparisonLoadFailed", languageCode, "Failed to load comparison data.", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.error.trendLoadFailed", languageCode, "Failed to load trend data.", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.loading.trendData", languageCode, "Loading trend data...", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.noData.title", languageCode, "No trend data available", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.noData.description", languageCode, "No test execution records found for the selected period.", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.period.label", languageCode, "Period", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.period.last7days", languageCode, "Last 7 days", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.period.last15days", languageCode, "Last 15 days", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.period.last30days", languageCode, "Last 30 days", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.period.last60days", languageCode, "Last 60 days", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.period.last90days", languageCode, "Last 90 days", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chartType.line", languageCode, "Line", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chartType.area", languageCode, "Area", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.summary.avgSuccessRate", languageCode, "Average Success Rate", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.summary.avgCompletionRate", languageCode, "Average Completion Rate", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.summary.dataPoints", languageCode, "Data Points", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.summary.successRateChange", languageCode, "Success Rate Change", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chart.overallTrend", languageCode, "Test Result Trend", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chart.testPlanComparison", languageCode, "Test Plan Comparison", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chart.assigneeComparison", languageCode, "Assignee Comparison", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chart.successAndCompletionRate", languageCode, "Success and Completion Rate Trend", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chart.successRate", languageCode, "Success Rate", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.chart.completionRate", languageCode, "Completion Rate", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.tooltip.overallSuccessRate", languageCode, "Overall Success Rate", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.tooltip.plan", languageCode, "Plan", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.tooltip.user", languageCode, "User", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.tooltip.unit", languageCode, "cases", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.legend.overallSuccessRate", languageCode, "Overall Success Rate", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.legend.plan", languageCode, "Plan", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.legend.user", languageCode, "User", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.prompt.selectTestPlan", languageCode, "Please select test plans to compare", createdBy);
        createTranslationIfNotExists("testTrendAnalysis.prompt.selectAssignee", languageCode, "Please select assignees to compare", createdBy);

        // Header Navigation translations
        createTranslationIfNotExists("header.nav.dashboard", languageCode, "Dashboard", createdBy);
        createTranslationIfNotExists("header.nav.organizationManagement", languageCode, "Organization Management", createdBy);
        createTranslationIfNotExists("header.nav.userManagement", languageCode, "User Management", createdBy);
        createTranslationIfNotExists("header.nav.mailSettings", languageCode, "Mail Settings", createdBy);
        createTranslationIfNotExists("header.nav.translationManagement", languageCode, "Translation Management", createdBy);
        createTranslationIfNotExists("header.nav.projectSelection", languageCode, "Project Selection", createdBy);
        createTranslationIfNotExists("header.userMenu.profile", languageCode, "Profile", createdBy);
        createTranslationIfNotExists("header.userMenu.logout", languageCode, "Logout", createdBy);

        // Organization Dashboard 번역 키들 (English)
        createTranslationIfNotExists("organization.dashboard.title", languageCode, "Dashboard", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalOrganizations", languageCode, "Total Organizations", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalOrganizations.subtitle", languageCode, "Active Organizations", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalProjects", languageCode, "Total Projects", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalProjects.subtitle", languageCode, "All Projects", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalTestCases", languageCode, "Total Test Cases", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalTestCases.subtitle", languageCode, "Created Test Cases", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalUsers", languageCode, "Total Users", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalUsers.subtitle", languageCode, "Registered Users", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalMembers", languageCode, "Total Project Memberships", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalMembers.subtitle", languageCode, "Project Membership Count", createdBy);
        createTranslationIfNotExists("organization.dashboard.tabs.organizationStatus", languageCode, "Organization Status", createdBy);
        createTranslationIfNotExists("organization.dashboard.tabs.testStatistics", languageCode, "Test Statistics", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution", languageCode, "Project Distribution by Organization", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.projects", languageCode, "Project Count", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.members", languageCode, "Member Count", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.organizationList", languageCode, "Organization List", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.testResultDistribution", languageCode, "Test Result Distribution", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.testResultDetails", languageCode, "Test Result Details", createdBy);
        createTranslationIfNotExists("organization.dashboard.list.projectCount", languageCode, "Projects: {count}", createdBy);
        createTranslationIfNotExists("organization.dashboard.list.memberCount", languageCode, "Members: {count}", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.success", languageCode, "Success", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.failure", languageCode, "Failure", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.blocked", languageCode, "Blocked", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.notRun", languageCode, "Not Run", createdBy);

        // Test case form related translation keys
        // TestCaseTree component translation keys
        createTranslationIfNotExists("testcase.tree.selectAll", languageCode, "Select All", createdBy);
        createTranslationIfNotExists("testcase.tree.root", languageCode, "Root", createdBy);
        createTranslationIfNotExists("testcase.tree.title.select", languageCode, "Select Test Cases", createdBy);
        createTranslationIfNotExists("testcase.tree.title.manage", languageCode, "Test Cases", createdBy);
        createTranslationIfNotExists("testcase.tree.message.selectProject", languageCode, "Please select a project.", createdBy);
        createTranslationIfNotExists("testcase.tree.message.loading", languageCode, "Loading...", createdBy);
        createTranslationIfNotExists("testcase.tree.message.noTestcases", languageCode, "No test cases found.", createdBy);
        createTranslationIfNotExists("testcase.tree.validation.nameRequired", languageCode, "Please enter a name.", createdBy);
        createTranslationIfNotExists("testcase.tree.error.renameFailed", languageCode, "Failed to rename: ", createdBy);
        createTranslationIfNotExists("testcase.tree.error.deleteFailed", languageCode, "Error occurred while deleting.", createdBy);

        // Tree action buttons
        createTranslationIfNotExists("testcase.tree.button.batchDelete", languageCode, "Delete Selected", createdBy);
        createTranslationIfNotExists("testcase.tree.button.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("testcase.tree.button.saveOrder", languageCode, "Save Order", createdBy);
        createTranslationIfNotExists("testcase.tree.button.editOrder", languageCode, "Edit Order", createdBy);
        createTranslationIfNotExists("testcase.tree.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testcase.tree.button.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("testcase.tree.button.close", languageCode, "Close", createdBy);

        // Tree action menu
        createTranslationIfNotExists("testcase.tree.action.addFolder", languageCode, "Add Folder", createdBy);
        createTranslationIfNotExists("testcase.tree.action.addTestcase", languageCode, "Add Test Case", createdBy);
        createTranslationIfNotExists("testcase.tree.action.addSubFolder", languageCode, "Add Sub Folder", createdBy);
        createTranslationIfNotExists("testcase.tree.action.addSubTestcase", languageCode, "Add Sub Test Case", createdBy);
        createTranslationIfNotExists("testcase.tree.action.rename", languageCode, "Rename", createdBy);
        createTranslationIfNotExists("testcase.tree.action.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("testcase.tree.action.versionHistory", languageCode, "Version History", createdBy);

        // Tree dialogs
        createTranslationIfNotExists("testcase.tree.dialog.batchDelete.title", languageCode, "Delete Selected", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.batchDelete.message", languageCode, "Delete {count} items (including children)?", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.deleteConfirm.title", languageCode, "Confirm Delete", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.deleteConfirm.message", languageCode, "Are you sure you want to delete? (including children)", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.error.title", languageCode, "Error", createdBy);

        // Tree toggle button tooltips
        createTranslationIfNotExists("testcase.tree.tooltip.open", languageCode, "Open Test Case Tree", createdBy);
        createTranslationIfNotExists("testcase.tree.tooltip.close", languageCode, "Close Test Case Tree", createdBy);

        // TestCaseForm component translation keys
        createTranslationIfNotExists("testcase.form.title.edit", languageCode, "Edit Test Case", createdBy);
        createTranslationIfNotExists("testcase.form.displayId", languageCode, "Display ID", createdBy);
        createTranslationIfNotExists("testcase.form.displayOrder", languageCode, "Order", createdBy);
        createTranslationIfNotExists("testcase.form.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("testcase.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testcase.form.testSteps", languageCode, "Test Steps", createdBy);
        createTranslationIfNotExists("testcase.form.stepNumber", languageCode, "No.", createdBy);
        createTranslationIfNotExists("testcase.form.step", languageCode, "Step", createdBy);
        createTranslationIfNotExists("testcase.form.expected", languageCode, "Expected", createdBy);
        createTranslationIfNotExists("testcase.form.expectedResults", languageCode, "Expected Results", createdBy);
        createTranslationIfNotExists("testcase.form.preConditionPlaceholder", languageCode, "Pre-condition", createdBy);
        createTranslationIfNotExists("testcase.form.stepDescription", languageCode, "Step description", createdBy);
        createTranslationIfNotExists("testcase.form.expectedResult", languageCode, "Expected result", createdBy);
        createTranslationIfNotExists("testcase.form.overallExpectedResults", languageCode, "Overall Expected Results", createdBy);

        // Form placeholders
        createTranslationIfNotExists("testcase.form.folderName", languageCode, "Folder name", createdBy);
        createTranslationIfNotExists("testcase.form.folderDescription", languageCode, "Folder description", createdBy);
        createTranslationIfNotExists("testcase.form.testcaseName", languageCode, "Test case name", createdBy);
        createTranslationIfNotExists("testcase.form.testcaseDescription", languageCode, "Test case description", createdBy);

        // Form helper texts
        createTranslationIfNotExists("testcase.helper.description", languageCode, "Enter description.", createdBy);
        createTranslationIfNotExists("testcase.helper.preCondition", languageCode, "Enter pre-conditions.", createdBy);

        // Form buttons
        createTranslationIfNotExists("testcase.button.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("testcase.button.saving", languageCode, "Saving...", createdBy);
        createTranslationIfNotExists("testcase.button.addStep", languageCode, "Add Step", createdBy);

        // Form messages
        createTranslationIfNotExists("testcase.message.selectProject", languageCode, "Please select a project first.", createdBy);
        createTranslationIfNotExists("testcase.message.selectOrCreate", languageCode, "Select or create a test case.", createdBy);
        createTranslationIfNotExists("testcase.message.addSteps", languageCode, "Add steps.", createdBy);
        createTranslationIfNotExists("testcase.message.saved", languageCode, "Saved successfully.", createdBy);

        // Form validation messages
        createTranslationIfNotExists("testcase.validation.nameRequired", languageCode, "Please enter a name.", createdBy);
        createTranslationIfNotExists("testcase.validation.stepRequired", languageCode, "Please enter a step.", createdBy);
        createTranslationIfNotExists("testcase.validation.expectedResultsRequired", languageCode, "Please enter overall expected results.", createdBy);

        // Form error messages
        createTranslationIfNotExists("testcase.error.saveError", languageCode, "Error occurred while saving.", createdBy);

        // Folder/Test case info sections
        createTranslationIfNotExists("testcase.folder.info.title", languageCode, "Folder Information", createdBy);
        createTranslationIfNotExists("testcase.info.title", languageCode, "Test Case Information", createdBy);
        createTranslationIfNotExists("testcase.form.folder.edit", languageCode, "Edit Test Folder", createdBy);
        createTranslationIfNotExists("testcase.form.folder.create", languageCode, "Create Test Folder", createdBy);

        // Version management
        createTranslationIfNotExists("testcase.version.button.create", languageCode, "Create Version", createdBy);
        createTranslationIfNotExists("testcase.version.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testcase.version.button.creating", languageCode, "Creating...", createdBy);
        createTranslationIfNotExists("testcase.version.current.fetchError", languageCode, "Failed to get current version:", createdBy);
        createTranslationIfNotExists("testcase.version.error.notSaved", languageCode, "Versions can only be created for saved test cases.", createdBy);
        createTranslationIfNotExists("testcase.version.error.folderNotAllowed", languageCode, "Versions cannot be created for folders. Only for actual test cases.", createdBy);
        createTranslationIfNotExists("testcase.version.error.createFailed", languageCode, "Failed to create version.", createdBy);
        createTranslationIfNotExists("testcase.version.error.createError", languageCode, "Version creation failed:", createdBy);
        createTranslationIfNotExists("testcase.version.validation.labelRequired", languageCode, "Please enter version label.", createdBy);
        createTranslationIfNotExists("testcase.version.defaultDescription", languageCode, "Manual version creation", createdBy);

        // Version dialog
        createTranslationIfNotExists("testcase.version.dialog.title", languageCode, "Manual Version Creation", createdBy);
        createTranslationIfNotExists("testcase.version.form.label", languageCode, "Version Label", createdBy);
        createTranslationIfNotExists("testcase.version.form.labelPlaceholder", languageCode, "e.g., v2.1 with modifications", createdBy);
        createTranslationIfNotExists("testcase.version.form.labelHelperText", languageCode, "Enter a label to identify this version.", createdBy);
        createTranslationIfNotExists("testcase.version.form.description", languageCode, "Version Description", createdBy);
        createTranslationIfNotExists("testcase.version.form.descriptionPlaceholder", languageCode, "Describe in detail what changed in this version.", createdBy);
        createTranslationIfNotExists("testcase.version.form.descriptionHelperText", languageCode, "Optional. If left blank, it will be set to 'Manual version creation'.", createdBy);

        // TestCaseSpreadsheet component translation keys
        createTranslationIfNotExists("testcase.spreadsheet.header.title", languageCode, "Test Case Spreadsheet", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.status.rows", languageCode, "{count} rows", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.status.steps", languageCode, "{count} steps", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.status.changed", languageCode, "Modified", createdBy);

        // Spreadsheet buttons
        createTranslationIfNotExists("testcase.spreadsheet.button.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.addRows", languageCode, "Add Rows", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.addFolder", languageCode, "Add Folder", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.validate", languageCode, "Validate", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.export", languageCode, "Export", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.save", languageCode, "Batch Save", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.saving", languageCode, "Saving...", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.stepManagement", languageCode, "Step Management", createdBy);

        // Spreadsheet column headers
        createTranslationIfNotExists("testcase.spreadsheet.column.order", languageCode, "Order", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.type", languageCode, "Type", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.parentFolder", languageCode, "Parent Folder", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.preCondition", languageCode, "Pre-condition", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.expectedResults", languageCode, "Expected Results", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.step", languageCode, "Step {number}", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.expected", languageCode, "Expected {number}", createdBy);

        // Test case types
        createTranslationIfNotExists("testcase.type.folder", languageCode, "Folder", createdBy);
        createTranslationIfNotExists("testcase.type.testcase", languageCode, "Test Case", createdBy);

        // Spreadsheet usage guide
        createTranslationIfNotExists("testcase.spreadsheet.usage.title", languageCode, "Usage:", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.usage.basicUsage", languageCode, "Click cells to edit directly like Excel. Use Tab/Enter to move to next cell, Ctrl+C/V for copy/paste.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.usage.folderFunction", languageCode, "Folder function: Click \"Add Folder\" button or type \"📁 FolderName\" in name cell to create a folder.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.usage.stepManagement", languageCode, "Step management: Click ⚙️ button to adjust the number of steps (max 10).", createdBy);

        // Spreadsheet step menu
        createTranslationIfNotExists("testcase.spreadsheet.stepMenu.addStep", languageCode, "Add Step ({count})", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepMenu.removeStep", languageCode, "Remove Step ({count})", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepMenu.settings", languageCode, "Set step count directly...", createdBy);

        // Spreadsheet step dialog
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.title", languageCode, "Set Step Count", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.description", languageCode, "Set the number of steps for test cases. Existing data will be preserved.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.label", languageCode, "Step Count", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.helper", languageCode, "Can be set from 1 to 10.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.apply", languageCode, "Apply", createdBy);

        // Spreadsheet folder dialog
        createTranslationIfNotExists("testcase.spreadsheet.folderDialog.title", languageCode, "Create New Folder", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folderDialog.description", languageCode, "Enter the name for the new folder. The folder will be added to the top of the spreadsheet.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folderDialog.label", languageCode, "Folder Name", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folderDialog.placeholder", languageCode, "e.g., API Test, UI Test", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folderDialog.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folderDialog.create", languageCode, "Create", createdBy);

        // Spreadsheet Export menu
        createTranslationIfNotExists("testcase.spreadsheet.export.csv.title", languageCode, "Export to CSV", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.export.csv.description", languageCode, "Spreadsheet compatible format", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.export.excel.title", languageCode, "Export to Excel", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.export.excel.description", languageCode, "Microsoft Excel format (.xlsx)", createdBy);

        // Attachments 첨부파일 관련 영어 번역들
        createTranslationIfNotExists("attachments.loading", languageCode, "Loading attachments...", createdBy);
        createTranslationIfNotExists("attachments.empty", languageCode, "No attachments.", createdBy);
        createTranslationIfNotExists("attachments.title", languageCode, "Attachments", createdBy);
        createTranslationIfNotExists("attachments.button.download", languageCode, "Download", createdBy);
        createTranslationIfNotExists("attachments.button.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("attachments.delete.title", languageCode, "Delete Attachment", createdBy);
        createTranslationIfNotExists("attachments.delete.message", languageCode, "Do you want to delete this file?", createdBy);
        createTranslationIfNotExists("attachments.delete.warning", languageCode, "Deleted files cannot be recovered.", createdBy);
        createTranslationIfNotExists("attachments.error.loadFailed", languageCode, "Unable to load attachment list.", createdBy);
        createTranslationIfNotExists("attachments.error.loadError", languageCode, "An error occurred while loading the attachment list.", createdBy);
        createTranslationIfNotExists("attachments.error.downloadError", languageCode, "An error occurred while downloading the file.", createdBy);
        createTranslationIfNotExists("attachments.error.deleteError", languageCode, "An error occurred while deleting the file.", createdBy);

        // Common 공통 버튼 영어 번역들
        createTranslationIfNotExists("common.button.retry", languageCode, "Retry", createdBy);
        createTranslationIfNotExists("common.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("common.button.delete", languageCode, "Delete", createdBy);

        // Input Mode 입력 모드 관련 영어 번역들
        createTranslationIfNotExists("testcase.inputMode.title", languageCode, "Input Mode Selection", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.title", languageCode, "Individual Form", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.title", languageCode, "Spreadsheet", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.title", languageCode, "Advanced Spreadsheet", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.description", languageCode, "Individual Form Mode: You can input test cases one by one in detail.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.description", languageCode, "Spreadsheet Mode: You can input multiple test cases at once in bulk.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.description", languageCode, "Advanced Spreadsheet Mode: A spreadsheet with line breaks and advanced editing features.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.tooltip", languageCode, "Detailed input with individual form (traditional method)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.tooltip", languageCode, "Bulk input with spreadsheet (basic version)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", languageCode, "Advanced spreadsheet (with line break support, react-datasheet-grid)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.ariaLabel", languageCode, "Form Mode", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.ariaLabel", languageCode, "Spreadsheet Mode", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.ariaLabel", languageCode, "Advanced Spreadsheet Mode", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.status", languageCode, "📝 Currently there are {count} test cases.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.features", languageCode, "• All fields supported • No step limits • Detailed input available", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.status", languageCode, "📊 Provides an Excel-like editing environment. (Basic version)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.features", languageCode, "• 50+ simultaneous editing on one screen • Dynamic management of 1-10 steps • Fast bulk input", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.status", languageCode, "🚀 Advanced Spreadsheet - Supports line breaks and multi-selection.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.features", languageCode, "• Line breaks in cells (Enter) • Multi-selection (Shift+Click) • Drag resize • Advanced copy/paste", createdBy);
        createTranslationIfNotExists("testcase.inputMode.warning.modeSwitch", languageCode, "⚠️ Data currently being edited will be preserved when switching modes.", createdBy);

        // Common buttons
        createTranslationIfNotExists("common.button.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("common.button.close", languageCode, "Close", createdBy);

        // TestResult related translations
        // Column headers
        createTranslationIfNotExists("testResult.column.folder", languageCode, "Folder", createdBy);
        createTranslationIfNotExists("testResult.column.testCase", languageCode, "Test Case", createdBy);
        createTranslationIfNotExists("testResult.column.result", languageCode, "Result", createdBy);
        createTranslationIfNotExists("testResult.column.preCondition", languageCode, "Precondition", createdBy);
        createTranslationIfNotExists("testResult.column.steps", languageCode, "Step Information", createdBy);
        createTranslationIfNotExists("testResult.column.expectedResults", languageCode, "Expected Results", createdBy);
        createTranslationIfNotExists("testResult.column.executor", languageCode, "Executor", createdBy);
        createTranslationIfNotExists("testResult.column.notes", languageCode, "Notes", createdBy);
        createTranslationIfNotExists("testResult.column.attachments", languageCode, "Attachments", createdBy);
        createTranslationIfNotExists("testResult.column.executedDate", languageCode, "Executed Date", createdBy);
        createTranslationIfNotExists("testResult.column.jiraStatus", languageCode, "JIRA Status", createdBy);

        // Buttons
        createTranslationIfNotExists("testResult.button.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("testResult.button.viewDetail", languageCode, "View Details", createdBy);
        createTranslationIfNotExists("testResult.button.viewAttachments", languageCode, "View Attachments", createdBy);
        createTranslationIfNotExists("testResult.button.columnSettings", languageCode, "Column Settings", createdBy);
        createTranslationIfNotExists("testResult.button.changeOrder", languageCode, "Change Order", createdBy);
        createTranslationIfNotExists("testResult.button.reset", languageCode, "Reset", createdBy);
        createTranslationIfNotExists("testResult.button.advancedExport", languageCode, "Advanced Export", createdBy);
        createTranslationIfNotExists("testResult.button.column", languageCode, "Column", createdBy);
        createTranslationIfNotExists("testResult.button.order", languageCode, "Order", createdBy);
        createTranslationIfNotExists("testResult.button.export", languageCode, "Export", createdBy);

        // Tooltips
        createTranslationIfNotExists("testResult.tooltip.noPreCondition", languageCode, "No precondition", createdBy);
        createTranslationIfNotExists("testResult.tooltip.noExpectedResults", languageCode, "No expected results", createdBy);
        createTranslationIfNotExists("testResult.tooltip.noNotes", languageCode, "No notes", createdBy);
        createTranslationIfNotExists("testResult.tooltip.multipleJiraIds", languageCode, "Total {count} JIRA IDs", createdBy);

        // Status
        createTranslationIfNotExists("testResult.status.unknown", languageCode, "Unknown", createdBy);
        createTranslationIfNotExists("testResult.status.filtered", languageCode, "Filtered", createdBy);

        // Titles and messages
        createTranslationIfNotExists("testResult.title.detailList", languageCode, "Test Results Detail List", createdBy);
        createTranslationIfNotExists("testResult.count.results", languageCode, "{count} test results{filtered}", createdBy);
        createTranslationIfNotExists("testResult.error.loadFailure", languageCode, "Unable to load test results", createdBy);

        // Default values
        createTranslationIfNotExists("testResult.defaultValue.root", languageCode, "Root", createdBy);
        createTranslationIfNotExists("testResult.defaultValue.unknownTestCase", languageCode, "Unknown Test Case", createdBy);
        createTranslationIfNotExists("testResult.defaultValue.system", languageCode, "System", createdBy);

        // Steps
        createTranslationIfNotExists("testResult.steps.empty", languageCode, "No steps", createdBy);
        createTranslationIfNotExists("testResult.steps.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testResult.steps.expectedResult", languageCode, "Expected Result", createdBy);

        // Dialog titles
        createTranslationIfNotExists("testResult.dialog.attachmentsTitle", languageCode, "Test Result Attachments", createdBy);

        // JUnit Result Dashboard translations (English)
        createTranslationIfNotExists("junit.dashboard.title", languageCode, "Test Result Dashboard", createdBy);
        createTranslationIfNotExists("junit.dashboard.subtitle", languageCode, "{projectName} - Automation Test Result Analysis", createdBy);
        createTranslationIfNotExists("junit.dashboard.upload", languageCode, "Upload", createdBy);
        createTranslationIfNotExists("junit.dashboard.uploading", languageCode, "Uploading...", createdBy);
        createTranslationIfNotExists("junit.dashboard.uploadResult", languageCode, "Upload Test Result", createdBy);
        createTranslationIfNotExists("junit.dashboard.refresh", languageCode, "Refresh", createdBy);

        // Headers and titles
        createTranslationIfNotExists("junit.header.testResultDashboard", languageCode, "Test Result Dashboard", createdBy);
        createTranslationIfNotExists("junit.header.automationAnalysis", languageCode, "Automation Test Result Analysis", createdBy);

        // Statistics cards
        createTranslationIfNotExists("junit.stats.passed", languageCode, "Passed", createdBy);
        createTranslationIfNotExists("junit.stats.failed", languageCode, "Failed", createdBy);
        createTranslationIfNotExists("junit.stats.error", languageCode, "Error", createdBy);
        createTranslationIfNotExists("junit.stats.skipped", languageCode, "Skipped", createdBy);
        createTranslationIfNotExists("junit.stats.successRate", languageCode, "Success Rate", createdBy);
        createTranslationIfNotExists("junit.stats.passedTests", languageCode, "Passed Tests", createdBy);
        createTranslationIfNotExists("junit.stats.failedTests", languageCode, "Failed Tests", createdBy);
        createTranslationIfNotExists("junit.stats.errorTests", languageCode, "Error Tests", createdBy);
        createTranslationIfNotExists("junit.stats.averageSuccessRate", languageCode, "Average Success Rate", createdBy);

        // Tab labels
        createTranslationIfNotExists("junit.tab.overview", languageCode, "Overview", createdBy);
        createTranslationIfNotExists("junit.tab.recentResults", languageCode, "Recent Results", createdBy);
        createTranslationIfNotExists("junit.tab.statisticsChart", languageCode, "Statistics Chart", createdBy);
        createTranslationIfNotExists("junit.tab.trendAnalysis", languageCode, "Trend Analysis", createdBy);

        // Chart titles
        createTranslationIfNotExists("junit.chart.testStatusDistribution", languageCode, "Test Status Distribution", createdBy);
        createTranslationIfNotExists("junit.chart.recentExecutionResults", languageCode, "Recent Execution Results", createdBy);
        createTranslationIfNotExists("junit.chart.successRateTrend", languageCode, "Success Rate Trend", createdBy);
        createTranslationIfNotExists("junit.chart.detailedStatistics", languageCode, "Detailed Statistics", createdBy);

        // Table headers
        createTranslationIfNotExists("junit.table.executionName", languageCode, "Execution Name", createdBy);
        createTranslationIfNotExists("junit.table.fileName", languageCode, "File Name", createdBy);
        createTranslationIfNotExists("junit.table.totalTests", languageCode, "Total Tests", createdBy);
        createTranslationIfNotExists("junit.table.successRate", languageCode, "Success Rate", createdBy);
        createTranslationIfNotExists("junit.table.status", languageCode, "Status", createdBy);
        createTranslationIfNotExists("junit.table.uploadTime", languageCode, "Upload Time", createdBy);
        createTranslationIfNotExists("junit.table.actions", languageCode, "Actions", createdBy);

        // Buttons and actions
        createTranslationIfNotExists("junit.button.viewDetail", languageCode, "View Detail", createdBy);
        createTranslationIfNotExists("junit.button.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("junit.button.backToAutomation", languageCode, "Back to Test Automation", createdBy);

        // Messages
        createTranslationIfNotExists("junit.message.noResults", languageCode, "No test results found", createdBy);
        createTranslationIfNotExists("junit.message.uploadFirst", languageCode, "Upload JUnit XML files to analyze test results.", createdBy);
        createTranslationIfNotExists("junit.message.firstUpload", languageCode, "Upload First Test Result", createdBy);
        createTranslationIfNotExists("junit.message.loadingResults", languageCode, "Loading test results...", createdBy);
        createTranslationIfNotExists("junit.message.loadFailed", languageCode, "Failed to load test results.", createdBy);
        createTranslationIfNotExists("junit.message.noData", languageCode, "No test results found.", createdBy);
        createTranslationIfNotExists("junit.message.trendDataInsufficient", languageCode, "Insufficient data for trend analysis.", createdBy);
        createTranslationIfNotExists("junit.message.statisticsImplementing", languageCode, "Statistics chart implementation in progress", createdBy);
        createTranslationIfNotExists("junit.message.selectProject", languageCode, "Please select a project first.", createdBy);
        createTranslationIfNotExists("junit.message.deletingResult", languageCode, "Are you sure you want to delete this test result?", createdBy);

        // Upload dialog
        createTranslationIfNotExists("junit.upload.dialog.title", languageCode, "Upload JUnit XML File", createdBy);
        createTranslationIfNotExists("junit.upload.dragDrop", languageCode, "Drag JUnit XML file or click to select", createdBy);
        createTranslationIfNotExists("junit.upload.selectFile", languageCode, "Select File", createdBy);
        createTranslationIfNotExists("junit.upload.selectAnother", languageCode, "Select Another File", createdBy);
        createTranslationIfNotExists("junit.upload.maxSize", languageCode, "Maximum {maxSize} allowed", createdBy);
        createTranslationIfNotExists("junit.upload.allowedFormats", languageCode, "Allowed formats: {formats}", createdBy);
        createTranslationIfNotExists("junit.upload.executionInfo", languageCode, "Test Execution Information", createdBy);
        createTranslationIfNotExists("junit.upload.executionName", languageCode, "Execution name (e.g., Sprint 24 Integration Tests)", createdBy);
        createTranslationIfNotExists("junit.upload.description", languageCode, "Description (optional)", createdBy);
        createTranslationIfNotExists("junit.upload.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("junit.upload.fileSize", languageCode, "Size: {size}", createdBy);

        // Date related
        createTranslationIfNotExists("junit.date.noInfo", languageCode, "No date information", createdBy);
        createTranslationIfNotExists("junit.date.unknown", languageCode, "Unknown date format", createdBy);
        createTranslationIfNotExists("junit.date.invalid", languageCode, "Invalid date", createdBy);
        createTranslationIfNotExists("junit.date.error", languageCode, "Date processing error", createdBy);

        // JUnit detail page
        createTranslationIfNotExists("junit.detail.title", languageCode, "JUnit Test Result Details", createdBy);
        createTranslationIfNotExists("junit.detail.uploadInfo", languageCode, "Upload: {date} | {uploader}", createdBy);
        createTranslationIfNotExists("junit.detail.loadingDetail", languageCode, "Loading test result details...", createdBy);
        createTranslationIfNotExists("junit.detail.loadFailedDetail", languageCode, "Failed to load test result details.", createdBy);
        createTranslationIfNotExists("junit.detail.notFound", languageCode, "Test result not found.", createdBy);
        createTranslationIfNotExists("junit.detail.exportPDF", languageCode, "Export to PDF", createdBy);
        createTranslationIfNotExists("junit.detail.exportingPDF", languageCode, "Generating PDF...", createdBy);
        createTranslationIfNotExists("junit.detail.exportCSV", languageCode, "Export to CSV", createdBy);
        createTranslationIfNotExists("junit.detail.exportingCSV", languageCode, "Generating CSV...", createdBy);
        createTranslationIfNotExists("junit.detail.versionManagement", languageCode, "Version Management", createdBy);

        // Detail tabs
        createTranslationIfNotExists("junit.detail.tab.testCases", languageCode, "Test Cases", createdBy);
        createTranslationIfNotExists("junit.detail.tab.failedTests", languageCode, "Failed Tests", createdBy);
        createTranslationIfNotExists("junit.detail.tab.slowTests", languageCode, "Slow Tests", createdBy);

        // JUnit detail page additional English translations
        createTranslationIfNotExists("junit.detail.backToAutomation", languageCode, "Back to Automation Tests", createdBy);
        createTranslationIfNotExists("junit.detail.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("junit.detail.noDateInfo", languageCode, "No date information", createdBy);
        createTranslationIfNotExists("junit.detail.unknownDateFormat", languageCode, "Unknown date format", createdBy);
        createTranslationIfNotExists("junit.detail.invalidDate", languageCode, "Invalid date", createdBy);
        createTranslationIfNotExists("junit.detail.dateProcessingError", languageCode, "Date processing error", createdBy);
        createTranslationIfNotExists("junit.detail.loadTestCasesFailed", languageCode, "Failed to load test cases.", createdBy);
        createTranslationIfNotExists("junit.detail.testSuite", languageCode, "Test Suite", createdBy);
        createTranslationIfNotExists("junit.detail.testCaseSearch", languageCode, "Search test cases...", createdBy);
        createTranslationIfNotExists("junit.detail.testName", languageCode, "Test Name", createdBy);
        createTranslationIfNotExists("junit.detail.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("junit.detail.original", languageCode, "Original", createdBy);
        createTranslationIfNotExists("junit.detail.failedTestCases", languageCode, "Failed Test Cases", createdBy);
        createTranslationIfNotExists("junit.detail.noFailedTests", languageCode, "No failed test cases!", createdBy);
        createTranslationIfNotExists("junit.detail.failureMessagePreview", languageCode, "Failure message preview:", createdBy);
        createTranslationIfNotExists("junit.detail.clickForDetails", languageCode, "Click the test name for details", createdBy);
        createTranslationIfNotExists("junit.detail.slowestTests", languageCode, "Slowest Test Cases", createdBy);
        createTranslationIfNotExists("junit.detail.slowestTestsTop", languageCode, "Slowest Test Cases (Top {count})", createdBy);
        createTranslationIfNotExists("junit.detail.noExecutionTimeData", languageCode, "No execution time data available.", createdBy);
        createTranslationIfNotExists("junit.detail.exportPDFAlert", languageCode, "Test result not found.", createdBy);
        createTranslationIfNotExists("junit.detail.exportPDFComplete", languageCode, "PDF export complete", createdBy);
        createTranslationIfNotExists("junit.detail.exportPDFFailed", languageCode, "PDF export failed", createdBy);
        createTranslationIfNotExists("junit.detail.exportPDFError", languageCode, "An error occurred during PDF export", createdBy);
        createTranslationIfNotExists("junit.detail.exportCSVAlert", languageCode, "No test result to export.", createdBy);
        createTranslationIfNotExists("junit.detail.exportCSVComplete", languageCode, "CSV export complete", createdBy);
        createTranslationIfNotExists("junit.detail.exportCSVFailed", languageCode, "CSV export failed", createdBy);
        createTranslationIfNotExists("junit.detail.exportCSVError", languageCode, "An error occurred during CSV export", createdBy);

        // Common terms English translations
        createTranslationIfNotExists("common.unit.count", languageCode, "", createdBy);
        createTranslationIfNotExists("common.status", languageCode, "Status", createdBy);
        createTranslationIfNotExists("common.all", languageCode, "All", createdBy);

        // Test suite
        createTranslationIfNotExists("junit.suite.testSuite", languageCode, "Test Suite", createdBy);
        createTranslationIfNotExists("junit.suite.all", languageCode, "All", createdBy);
        createTranslationIfNotExists("junit.suite.search", languageCode, "Search test cases...", createdBy);

        // Failed tests
        createTranslationIfNotExists("junit.failed.title", languageCode, "Failed Test Cases ({count} cases)", createdBy);
        createTranslationIfNotExists("junit.failed.noFailures", languageCode, "No failed test cases!", createdBy);
        createTranslationIfNotExists("junit.failed.failureMessage", languageCode, "Failure message preview:", createdBy);
        createTranslationIfNotExists("junit.failed.clickForDetail", languageCode, "Click test name to view details", createdBy);

        // Slow tests
        createTranslationIfNotExists("junit.slow.title", languageCode, "Slowest Test Cases (Top {count})", createdBy);
        createTranslationIfNotExists("junit.slow.noData", languageCode, "No execution time data available.", createdBy);

        // Test case detail panel
        createTranslationIfNotExists("junit.testcase.selectCase", languageCode, "Select a test case", createdBy);
        createTranslationIfNotExists("junit.testcase.loadingDetail", languageCode, "Loading test case details...", createdBy);
        createTranslationIfNotExists("junit.testcase.errorOccurred", languageCode, "Error Occurred", createdBy);
        createTranslationIfNotExists("junit.testcase.noData", languageCode, "No Data", createdBy);
        createTranslationIfNotExists("junit.testcase.noDetailInfo", languageCode, "No test case detail information available.", createdBy);
        createTranslationIfNotExists("junit.testcase.edit", languageCode, "Edit Test Case", createdBy);
        createTranslationIfNotExists("junit.testcase.close", languageCode, "Close", createdBy);

        // Tracelog tab
        createTranslationIfNotExists("junit.tracelog.tab", languageCode, "Tracelog", createdBy);
        createTranslationIfNotExists("junit.tracelog.failureMessage", languageCode, "Failure Message", createdBy);
        createTranslationIfNotExists("junit.tracelog.stackTrace", languageCode, "Stack Trace", createdBy);
        createTranslationIfNotExists("junit.tracelog.skipMessage", languageCode, "Skip Message", createdBy);
        createTranslationIfNotExists("junit.tracelog.noErrorLog", languageCode, "No error logs for this test case.", createdBy);

        // Test Body tab
        createTranslationIfNotExists("junit.testbody.tab", languageCode, "Test Body", createdBy);
        createTranslationIfNotExists("junit.testbody.systemOut", languageCode, "System Out", createdBy);
        createTranslationIfNotExists("junit.testbody.systemErr", languageCode, "System Error", createdBy);
        createTranslationIfNotExists("junit.testbody.noOutput", languageCode, "No system output for this test case.", createdBy);
        createTranslationIfNotExists("junit.testbody.fullscreen", languageCode, "View in fullscreen", createdBy);
        createTranslationIfNotExists("junit.testbody.fullscreenTitle", languageCode, "Test Body - {testName}", createdBy);

        // RecentTestResults component related keys
        createTranslationIfNotExists("recentResults.status.notRun", languageCode, "Not Run", createdBy);
        createTranslationIfNotExists("recentResults.status.unknown", languageCode, "Unknown", createdBy);
        createTranslationIfNotExists("recentResults.message.noResults", languageCode, "No recent test results.", createdBy);
        createTranslationIfNotExists("recentResults.title.withCount", languageCode, "Recent Test Results ({count} items)", createdBy);
        createTranslationIfNotExists("recentResults.button.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("recentResults.label.testcase", languageCode, "Test Case", createdBy);
        createTranslationIfNotExists("recentResults.label.project", languageCode, "Project:", createdBy);
        createTranslationIfNotExists("recentResults.label.execution", languageCode, "Execution:", createdBy);
        createTranslationIfNotExists("recentResults.label.executor", languageCode, "Executor:", createdBy);
        createTranslationIfNotExists("recentResults.label.notes", languageCode, "Notes:", createdBy);
        createTranslationIfNotExists("recentResults.testcase.fallback", languageCode, "Test Case {id}", createdBy);

        // JunitResultDashboard additional hardcoded texts
        createTranslationIfNotExists("junit.table.recentTestExecutionResults", languageCode, "Recent Test Execution Results", createdBy);
        createTranslationIfNotExists("junit.fallback.noName", languageCode, "(No Name)", createdBy);
        createTranslationIfNotExists("junit.error.loadFailed", languageCode, "Failed to load test results.", createdBy);
        createTranslationIfNotExists("junit.confirm.deleteResult", languageCode, "Are you sure you want to delete this test result?", createdBy);
        createTranslationIfNotExists("junit.comment.fileNameExtraction", languageCode, "Extract execution name from file name", createdBy);

        // TestResult 상태 라벨 번역 (testResultConstants.js에서 사용)
        createTranslationIfNotExists("testResult.status.pass", languageCode, "Pass", createdBy);
        createTranslationIfNotExists("testResult.status.fail", languageCode, "Fail", createdBy);
        createTranslationIfNotExists("testResult.status.blocked", languageCode, "Blocked", createdBy);
        createTranslationIfNotExists("testResult.status.notRun", languageCode, "Not Run", createdBy);
        createTranslationIfNotExists("testResult.status.skipped", languageCode, "Skipped", createdBy);

        // JUnit 상태 라벨 번역 (junitResultService.js에서 사용)
        createTranslationIfNotExists("junit.status.uploading", languageCode, "Uploading", createdBy);
        createTranslationIfNotExists("junit.status.parsing", languageCode, "Parsing", createdBy);
        createTranslationIfNotExists("junit.status.completed", languageCode, "Completed", createdBy);
        createTranslationIfNotExists("junit.status.unknown", languageCode, "Unknown", createdBy);

        // JUnit 입력 필드 placeholder 번역
        createTranslationIfNotExists("junit.placeholder.executionName", languageCode, "Execution Name (e.g., Sprint 24 Integration Tests)", createdBy);

    }

    private void createTranslationIfNotExists(String keyName, String languageCode, String value, String createdBy) {
        Optional<Language> language = languageRepository.findByCode(languageCode);
        if (language.isEmpty()) {
            log.warn("번역 추가 실패: 언어 '{}'를 찾을 수 없습니다.", languageCode);
            return;
        }

        Optional<TranslationKey> translationKey = translationKeyRepository.findByKeyName(keyName);
        if (translationKey.isEmpty()) {
            log.warn("번역 추가 실패: 번역 키 '{}'를 찾을 수 없습니다.", keyName);
            return;
        }

        Optional<Translation> existingTranslation = translationRepository.findByTranslationKeyAndLanguage(translationKey.get(), language.get());
        if (existingTranslation.isEmpty()) {
            Translation translation = new Translation(translationKey.get(), language.get(), value, createdBy);
            translationRepository.save(translation);
            log.debug("번역 생성: {} -> {} = '{}'", languageCode, keyName, value);
        } else {
            log.debug("번역 이미 존재: {} -> {} = '{}'", languageCode, keyName, value);
        }
    }
}