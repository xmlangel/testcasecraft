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