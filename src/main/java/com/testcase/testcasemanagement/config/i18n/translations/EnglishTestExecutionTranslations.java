// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishTestExecutionTranslations.java
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
 * English translations - Test Execution
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishTestExecutionTranslations {

        private final LanguageRepository languageRepository;
        private final TranslationKeyRepository translationKeyRepository;
        private final TranslationRepository translationRepository;

        public void initialize() {
                String languageCode = "en";
                String createdBy = "system";

                createTranslationIfNotExists("testExecution.title", languageCode, "Test Execution", createdBy);
                createTranslationIfNotExists("testExecution.list.title", languageCode, "Execution History", createdBy);
                createTranslationIfNotExists("testExecution.list.newExecution", languageCode, "New Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.list.noExecutions", languageCode,
                                "No execution history found.",
                                createdBy);
                createTranslationIfNotExists("testExecution.list.delete.title", languageCode, "Delete Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.list.delete.confirm", languageCode,
                                "Are you sure you want to delete this execution?", createdBy);
                createTranslationIfNotExists("testExecution.list.delete.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("testExecution.list.delete.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("testExecution.list.searchPlaceholder", languageCode, "Title Search",
                                createdBy);
                createTranslationIfNotExists("testExecution.status.notStarted", languageCode, "Not Started", createdBy);
                createTranslationIfNotExists("testExecution.status.inProgress", languageCode, "In Progress", createdBy);
                createTranslationIfNotExists("testExecution.status.completed", languageCode, "Completed", createdBy);
                createTranslationIfNotExists("testExecution.form.title.create", languageCode, "Create Test Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.title.edit", languageCode, "Test Execution: {name}",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.executionName", languageCode, "Execution Name",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.testPlan", languageCode, "Test Plan", createdBy);
                createTranslationIfNotExists("testExecution.form.testPlan.select", languageCode, "Select", createdBy);
                createTranslationIfNotExists("testExecution.form.description", languageCode, "Description", createdBy);
                createTranslationIfNotExists("testExecution.form.startImmediately", languageCode,
                                "Start execution immediately after saving", createdBy);
                createTranslationIfNotExists("testExecution.form.startImmediately.description", languageCode,
                                "If checked, the test execution will be changed to 'In Progress' status immediately upon saving, allowing you to start testing right away without closing the window",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.button.list", languageCode, "List", createdBy);
                createTranslationIfNotExists("testExecution.form.button.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("testExecution.form.button.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("testExecution.form.button.saveAndStart", languageCode, "Save & Start",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.button.start", languageCode, "Start Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.button.complete", languageCode, "Complete Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.button.restart", languageCode, "Restart", createdBy);
                createTranslationIfNotExists("testExecution.form.button.hideGuide", languageCode, "Hide Guide",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.button.showGuide", languageCode, "Execution Guide",
                                createdBy);
                createTranslationIfNotExists("testExecution.info.title", languageCode, "Execution Info", createdBy);
                createTranslationIfNotExists("testExecution.info.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("testExecution.info.startDate", languageCode, "Start Date", createdBy);
                createTranslationIfNotExists("testExecution.info.endDate", languageCode, "End Date", createdBy);
                createTranslationIfNotExists("testExecution.info.progress", languageCode, "Progress", createdBy);
                createTranslationIfNotExists("testExecution.info.total", languageCode, "Total {total} items",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.title", languageCode,
                                "📋 Test Execution Procedure Guide",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("testExecution.guide.step1.title", languageCode,
                                "1. Test Execution Preparation",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step1.description", languageCode,
                                "Enter execution name, test plan, and description, then click the 'Save' button.",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step2.title", languageCode, "2. Start Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step2.description", languageCode,
                                "Click the 'Start Execution' button to change the test execution status to 'In Progress'.",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step3.title", languageCode, "3. Execute Test Cases",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step3.description", languageCode,
                                "Click the 'Enter Result' button for each test case to record test results.",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step4.title", languageCode, "4. Complete Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step4.description", languageCode,
                                "When all tests are completed, click the 'Complete Execution' button to finish the execution.",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step5.title", languageCode, "5. View Results",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step5.description", languageCode,
                                "Check progress and result statistics. Use the 'Previous Results' button to view past execution history if needed.",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step6.title", languageCode,
                                "6. Re-execution (After Completion)", createdBy);
                createTranslationIfNotExists("testExecution.guide.step6.description", languageCode,
                                "Completed test executions can be restarted by clicking the 'Restart' button to change back to 'In Progress' status for additional testing.",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.folderCase", languageCode, "Folder/Case",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.caseName", languageCode, "Case Name",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.result", languageCode, "Result", createdBy);
                createTranslationIfNotExists("testExecution.table.header.executedAt", languageCode, "Executed At",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.executedBy", languageCode, "Executed By",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.notes", languageCode, "Notes", createdBy);
                createTranslationIfNotExists("testExecution.table.header.jiraId", languageCode, "JIRA ID", createdBy);
                createTranslationIfNotExists("testExecution.table.header.resultInput", languageCode, "Enter Result",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.previousResults", languageCode,
                                "Previous Results",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.attachments", languageCode, "Attachments",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.button.resultInput", languageCode, "Enter Result",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.button.previousResults", languageCode,
                                "Previous Results",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.button.attachments", languageCode, "Attachments",
                                createdBy);
                createTranslationIfNotExists("testExecution.pagination.info", languageCode,
                                "Showing {start}-{end} of {totalItems} items", createdBy);
                createTranslationIfNotExists("testExecution.pagination.page", languageCode, "Page {current} / {total}",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.noTestCases", languageCode,
                                "No test cases to display.",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.title", languageCode,
                                "Previous Execution Results",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.noResults", languageCode,
                                "No previous execution results found.", createdBy);
                createTranslationIfNotExists("testExecution.previousResults.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.executedAt", languageCode,
                                "Executed At",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.result", languageCode, "Result",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.executionId", languageCode,
                                "Execution ID",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.executionName", languageCode,
                                "Execution Name", createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.executedBy", languageCode,
                                "Executed By",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.notes", languageCode, "Notes",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.jiraId", languageCode, "JIRA ID",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.attachments", languageCode,
                                "Attachments",
                                createdBy);
                createTranslationIfNotExists("testExecution.attachments.title", languageCode, "Test Result Attachments",
                                createdBy);
                createTranslationIfNotExists("testExecution.attachments.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("testExecution.jira.urlNotSet", languageCode,
                                "{issueKey} (JIRA URL not set)",
                                createdBy);
                createTranslationIfNotExists("testExecution.success.savedAndStarted", languageCode,
                                "Test execution '{name}' has been successfully saved and started. You can now enter results for each test case.",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("testExecution.table.folderCase", languageCode, "Folder/Case", createdBy);
                createTranslationIfNotExists("testExecution.form.titleNew", languageCode, "Create Test Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.titleEdit", languageCode, "Test Execution: {name}",
                                createdBy);
                createTranslationIfNotExists("testExecution.actions.enterResult", languageCode, "Add",
                                createdBy);
                createTranslationIfNotExists("testExecution.actions.prevResults", languageCode, "Previous Results",
                                createdBy);
                createTranslationIfNotExists("testExecution.actions.startExecution", languageCode, "Start Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.actions.completeExecution", languageCode,
                                "Complete Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.actions.rerunExecution", languageCode, "Re-run", createdBy);
                createTranslationIfNotExists("testExecution.table.header.folderCase", languageCode, "Folder/Case",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.caseName", languageCode, "Case Name",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.result", languageCode, "Result", createdBy);
                createTranslationIfNotExists("testExecution.table.header.executedAt", languageCode, "Executed At",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.executedBy", languageCode, "Executed By",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.notes", languageCode, "Notes", createdBy);
                createTranslationIfNotExists("testExecution.table.header.jiraId", languageCode, "JIRA ID", createdBy);
                createTranslationIfNotExists("testExecution.table.header.resultInput", languageCode, "Enter Result",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.previousResults", languageCode,
                                "Previous Results",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.header.attachments", languageCode, "Attachments",
                                createdBy);
                createTranslationIfNotExists("testExecution.dialog.attachments.title", languageCode, "Attachments",
                                createdBy);
                createTranslationIfNotExists("testExecution.dialog.attachments.close", languageCode, "Close",
                                createdBy);
                createTranslationIfNotExists("testExecution.progress.completed", languageCode, "Completed", createdBy);
                createTranslationIfNotExists("testExecution.progress.total", languageCode, "Total", createdBy);
                createTranslationIfNotExists("testExecution.table.caseName", languageCode, "Case Name", createdBy);
                createTranslationIfNotExists("testExecution.table.result", languageCode, "Result", createdBy);
                createTranslationIfNotExists("testExecution.table.executedAt", languageCode, "Executed At", createdBy);
                createTranslationIfNotExists("testExecution.table.executedBy", languageCode, "Executed By", createdBy);
                createTranslationIfNotExists("testExecution.table.notes", languageCode, "Notes", createdBy);
                createTranslationIfNotExists("testExecution.table.jiraId", languageCode, "JIRA ID", createdBy);
                createTranslationIfNotExists("testExecution.table.enterResult", languageCode, "Enter Result",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.prevResults", languageCode, "Previous Results",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.attachments", languageCode, "Attachments", createdBy);
                createTranslationIfNotExists("testExecution.table.executionId", languageCode, "Execution ID",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.executionName", languageCode, "Execution Name",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.saveAndStart", languageCode, "Save and Start",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.executionName", languageCode, "Execution Name",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.testPlan", languageCode, "Test Plan", createdBy);
                createTranslationIfNotExists("testExecution.form.description", languageCode, "Description", createdBy);
                createTranslationIfNotExists("testExecution.form.progress", languageCode, "Progress", createdBy);
                createTranslationIfNotExists("testExecution.form.startImmediatelyLabel", languageCode,
                                "Start Immediately",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.startImmediatelyDescription", languageCode,
                                "Start execution immediately after saving.", createdBy);
                createTranslationIfNotExists("testExecution.actions.restartExecution", languageCode, "Restart",
                                createdBy);
                createTranslationIfNotExists("testExecution.prevResults.title", languageCode,
                                "Previous Execution Results",
                                createdBy);
                createTranslationIfNotExists("testExecution.prevResults.noResults", languageCode,
                                "No previous execution results found.", createdBy);
                createTranslationIfNotExists("testExecution.status.notStarted", languageCode, "Not Started", createdBy);
                createTranslationIfNotExists("testExecution.status.inProgress", languageCode, "In Progress", createdBy);
                createTranslationIfNotExists("testExecution.status.completed", languageCode, "Completed", createdBy);
                createTranslationIfNotExists("testExecution.list.title", languageCode, "Test Executions", createdBy);
                createTranslationIfNotExists("testExecution.list.newExecution", languageCode, "New Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.list.noExecutions", languageCode,
                                "No test executions found.",
                                createdBy);
                createTranslationIfNotExists("testExecution.list.delete.title", languageCode, "Delete Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.list.delete.confirm", languageCode,
                                "Are you sure you want to delete this test execution?", createdBy);
                createTranslationIfNotExists("testExecution.list.delete.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("testExecution.list.delete.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("testExecution.guide.title", languageCode,
                                "📋 Test Execution Procedure Guide",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step1.title", languageCode,
                                "1. Enter Execution Information",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step1.description", languageCode,
                                "Enter basic information such as execution name, test plan, and description.",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step2.title", languageCode, "2. Start Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step2.description", languageCode,
                                "Click 'Start Execution' button to change the test execution status to 'In Progress'.",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step3.title", languageCode, "3. Execute Test Cases",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step3.description", languageCode,
                                "Click 'Enter Result' button for each test case to record test results.", createdBy);
                createTranslationIfNotExists("testExecution.guide.step4.title", languageCode, "4. Complete Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step4.description", languageCode,
                                "Once all tests are completed, click 'Complete Execution' button to finish the execution.",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step5.title", languageCode, "5. Check Results",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step5.description", languageCode,
                                "Check progress and result statistics. Use 'Previous Results' button to view past execution history if needed.",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step6.title", languageCode,
                                "6. Re-run (After Completion)",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step6.description", languageCode,
                                "Completed test executions can be restarted by clicking 'Re-run' button to change back to 'In Progress' status for additional testing.",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.viewAttachments", languageCode, "View Attachments",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.registerTitle", languageCode,
                                "Register Test Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.executionInfo", languageCode, "Execution Info",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.startDate", languageCode, "Start Date", createdBy);
                createTranslationIfNotExists("testExecution.form.endDate", languageCode, "End Date", createdBy);
                createTranslationIfNotExists("testExecution.form.editTitle", languageCode, "Test Execution: {name}",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.attachments", languageCode, "Attachments", createdBy);
                createTranslationIfNotExists("testExecution.attachments.title", languageCode, "Test Result Attachments",
                                createdBy);
                createTranslationIfNotExists("testExecution.form.totalCount", languageCode, "Total {count} items",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.noData", languageCode, "No data to display.",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.title", languageCode, "Test Execution Guide",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.hideGuide", languageCode, "Hide Guide", createdBy);
                createTranslationIfNotExists("testExecution.guide.showGuide", languageCode, "Show Guide", createdBy);
                createTranslationIfNotExists("testExecution.form.description", languageCode, "Description", createdBy);
                createTranslationIfNotExists("testExecution.guide.step1.title", languageCode,
                                "Step 1: Select Test Plan",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step2.title", languageCode,
                                "Step 2: Enter Execution Info",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step2.description", languageCode,
                                "Enter basic information such as test execution name, description, and assignee",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step3.title", languageCode,
                                "Step 3: Review Test Cases",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step3.description", languageCode,
                                "Review the test cases in the selected test plan and adjust execution order if needed",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step4.title", languageCode, "Step 4: Start Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step4.description", languageCode,
                                "After confirming all information, start the test execution", createdBy);
                createTranslationIfNotExists("testExecution.guide.step5.title", languageCode, "Step 5: Enter Results",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step5.description", languageCode,
                                "Enter execution results for each test case", createdBy);
                createTranslationIfNotExists("testExecution.guide.step6.title", languageCode,
                                "Step 6: Complete Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.guide.step6.description", languageCode,
                                "Complete the entire execution when all test cases are finished", createdBy);
                createTranslationIfNotExists("testExecution.list.title", languageCode, "Test Execution List",
                                createdBy);
                createTranslationIfNotExists("testExecution.list.delete.title", languageCode, "Delete Test Execution",
                                createdBy);
                createTranslationIfNotExists("testExecution.status.notStarted", languageCode, "Not Started", createdBy);
                createTranslationIfNotExists("testExecution.status.inProgress", languageCode, "In Progress", createdBy);
                createTranslationIfNotExists("testExecution.status.completed", languageCode, "Completed", createdBy);

                createTranslationIfNotExists("testExecution.form.tags", languageCode, "Tags", createdBy);
                createTranslationIfNotExists("testExecution.form.tagsPlaceholder", languageCode,
                                "Enter tags and press Enter",
                                createdBy);
                createTranslationIfNotExists("testExecution.helper.tags", languageCode, "You can enter multiple tags.",
                                createdBy);

                // Bulk result input related English translations
                createTranslationIfNotExists("testExecution.bulk.selectAll", languageCode, "Select All", createdBy);
                createTranslationIfNotExists("testExecution.bulk.deselectAll", languageCode, "Deselect All", createdBy);
                createTranslationIfNotExists("testExecution.bulk.selectedCount", languageCode, "{count} selected",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.actionToolbar.title", languageCode, "Bulk Actions",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.actionToolbar.deselect", languageCode, "Deselect",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.title", languageCode, "Bulk Result Input",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.selectedCases", languageCode,
                                "Selected Test Cases",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.selectResult", languageCode, "Select Result",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.commonNotes", languageCode, "Common Notes",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.commonTags", languageCode, "Common Tags",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.commonJiraId", languageCode, "Common JIRA ID",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.confirm", languageCode, "Confirm", createdBy);
                createTranslationIfNotExists("testExecution.bulk.dialog.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("testExecution.bulk.success", languageCode,
                                "Results saved for {count} test cases",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.error", languageCode,
                                "Error during bulk result save: {error}",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.processing", languageCode,
                                "Processing {current}/{total}...",
                                createdBy);
                createTranslationIfNotExists("testExecution.bulk.partialSuccess", languageCode,
                                "{success} succeeded, {failed} failed", createdBy);
                createTranslationIfNotExists("testExecution.table.folder", languageCode, "Folder", createdBy);
                createTranslationIfNotExists("testExecution.table.tags", languageCode, "Tags", createdBy);
                createTranslationIfNotExists("testExecution.table.select", languageCode, "Select", createdBy);
                createTranslationIfNotExists("testExecution.table.priority", languageCode, "Priority", createdBy);

                // Checkbox aria-labels for accessibility
                createTranslationIfNotExists("testExecution.table.selectAll", languageCode, "Select all test cases",
                                createdBy);
                createTranslationIfNotExists("testExecution.table.selectTestCase", languageCode, "Select test case:",
                                createdBy);

                // Filter related English translations
                createTranslationIfNotExists("testExecution.filter.title", languageCode, "Filter", createdBy);
                createTranslationIfNotExists("testExecution.filter.active", languageCode, "Active", createdBy);
                createTranslationIfNotExists("testExecution.filter.all", languageCode, "All", createdBy);
                createTranslationIfNotExists("testExecution.filter.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("testExecution.filter.priority", languageCode, "Priority", createdBy);
                createTranslationIfNotExists("testExecution.filter.priority.high", languageCode, "High", createdBy);
                createTranslationIfNotExists("testExecution.filter.priority.medium", languageCode, "Medium", createdBy);
                createTranslationIfNotExists("testExecution.filter.priority.low", languageCode, "Low", createdBy);
                createTranslationIfNotExists("testExecution.filter.result", languageCode, "Result", createdBy);
                createTranslationIfNotExists("testExecution.filter.result.pass", languageCode, "PASS", createdBy);
                createTranslationIfNotExists("testExecution.filter.result.fail", languageCode, "FAIL", createdBy);
                createTranslationIfNotExists("testExecution.filter.result.blocked", languageCode, "BLOCKED", createdBy);
                createTranslationIfNotExists("testExecution.filter.result.notRun", languageCode, "NOT RUN", createdBy);
                createTranslationIfNotExists("testExecution.filter.executedBy", languageCode, "Executed By", createdBy);
                createTranslationIfNotExists("testExecution.filter.executedBy.placeholder", languageCode, "username",
                                createdBy);
                createTranslationIfNotExists("testExecution.filter.dateFrom", languageCode, "Execution Date (From)",
                                createdBy);
                createTranslationIfNotExists("testExecution.filter.dateTo", languageCode, "Execution Date (To)",
                                createdBy);
                createTranslationIfNotExists("testExecution.filter.jiraIssueKey", languageCode, "JIRA Issue Key",
                                createdBy);
                createTranslationIfNotExists("testExecution.filter.apply", languageCode, "Apply", createdBy);
                createTranslationIfNotExists("testExecution.filter.clear", languageCode, "Clear", createdBy);
                createTranslationIfNotExists("testExecution.filter.noResults", languageCode,
                                "No test executions match the filter criteria.", createdBy);
                createTranslationIfNotExists("testExecution.filter.testCaseName", languageCode, "Test Case Name",
                                createdBy);
                createTranslationIfNotExists("testExecution.filter.testCaseName.placeholder", languageCode,
                                "Search Case Name", createdBy);

                // Previous Results Dialog Additional Translations
                createTranslationIfNotExists("testExecution.previousResults.table.tags", languageCode, "Tags",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.table.actions", languageCode, "Actions",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.action.edit", languageCode, "Edit",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.action.delete", languageCode, "Delete",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.delete.title", languageCode,
                                "Delete Test Result", createdBy);
                createTranslationIfNotExists("testExecution.previousResults.delete.confirm", languageCode,
                                "Are you sure you want to delete this test result?", createdBy);
                createTranslationIfNotExists("testExecution.previousResults.delete.info", languageCode,
                                "Result: {result} | Executed At: {executedAt}", createdBy);
                createTranslationIfNotExists("testExecution.previousResults.delete.cancel", languageCode, "Cancel",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.delete.delete", languageCode, "Delete",
                                createdBy);
                createTranslationIfNotExists("testExecution.previousResults.delete.deleting", languageCode,
                                "Deleting...", createdBy);
                createTranslationIfNotExists("testExecution.previousResults.attachments.title", languageCode,
                                "Test Result Attachments", createdBy);

                // Actions column header (unified)
                createTranslationIfNotExists("testExecution.table.actions", languageCode, "Task", createdBy);
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
