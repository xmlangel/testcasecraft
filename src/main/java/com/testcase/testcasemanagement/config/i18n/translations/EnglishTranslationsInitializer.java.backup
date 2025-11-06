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

        // Project Create/Edit Dialog
        createTranslationIfNotExists("project.dialog.createTitle", languageCode, "Create New Project", createdBy);
        createTranslationIfNotExists("project.dialog.editTitle", languageCode, "Edit Project", createdBy);
        createTranslationIfNotExists("project.form.name", languageCode, "Project Name", createdBy);
        createTranslationIfNotExists("project.form.code", languageCode, "Project Code", createdBy);
        createTranslationIfNotExists("project.form.codePlaceholder", languageCode, "e.g., PROJ001", createdBy);
        createTranslationIfNotExists("project.form.organization", languageCode, "Organization", createdBy);
        createTranslationIfNotExists("project.form.noOrganization", languageCode, "Independent Project (No Organization)", createdBy);
        createTranslationIfNotExists("project.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("project.form.descriptionPlaceholder", languageCode, "Enter a description for the project...", createdBy);
        createTranslationIfNotExists("common.buttons.create", languageCode, "Create", createdBy);
        createTranslationIfNotExists("common.buttons.update", languageCode, "Update", createdBy);
        createTranslationIfNotExists("common.buttons.cancel", languageCode, "Cancel", createdBy);

        // Project Create/Edit Dialog
        createTranslationIfNotExists("project.dialog.createTitle", languageCode, "Create New Project", createdBy);
        createTranslationIfNotExists("project.dialog.editTitle", languageCode, "Edit Project", createdBy);
        createTranslationIfNotExists("project.form.name", languageCode, "Project Name", createdBy);
        createTranslationIfNotExists("project.form.code", languageCode, "Project Code", createdBy);
        createTranslationIfNotExists("project.form.codePlaceholder", languageCode, "e.g., PROJ001", createdBy);
        createTranslationIfNotExists("project.form.organization", languageCode, "Organization", createdBy);
        createTranslationIfNotExists("project.form.noOrganization", languageCode, "Independent Project (No Organization)", createdBy);
        createTranslationIfNotExists("project.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("project.form.descriptionPlaceholder", languageCode, "Enter a description for the project...", createdBy);
        createTranslationIfNotExists("common.buttons.create", languageCode, "Create", createdBy);
        createTranslationIfNotExists("common.buttons.update", languageCode, "Update", createdBy);
        createTranslationIfNotExists("common.buttons.cancel", languageCode, "Cancel", createdBy);

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

        // Project Tabs
        createTranslationIfNotExists("project.tabs.byOrganization", languageCode, "Projects by Organization", createdBy);
        createTranslationIfNotExists("project.tabs.independent", languageCode, "Independent Projects", createdBy);
        createTranslationIfNotExists("project.tabs.all", languageCode, "All Projects", createdBy);

        // Project Stats
        createTranslationIfNotExists("project.stats.projectCount", languageCode, "{count} projects", createdBy);
        createTranslationIfNotExists("project.stats.totalProjectCount", languageCode, "Total {count} projects", createdBy);

        // Project Messages
        createTranslationIfNotExists("project.messages.noIndependentProjects", languageCode, "No independent projects", createdBy);
        createTranslationIfNotExists("project.messages.createIndependentProjectHint", languageCode, "Try creating a personal project that doesn't belong to an organization.", createdBy);

        // Project buttons translations
        createTranslationIfNotExists("project.buttons.openProject", languageCode, "Open Project", createdBy);
        createTranslationIfNotExists("project.buttons.addProject", languageCode, "Add Project", createdBy);
        createTranslationIfNotExists("project.buttons.createProject", languageCode, "Create Project", createdBy);
        createTranslationIfNotExists("project.buttons.createNew", languageCode, "Create New Project", createdBy);
        createTranslationIfNotExists("project.buttons.createIndependent", languageCode, "Create Independent Project", createdBy);
        createTranslationIfNotExists("project.buttons.createFirstIndependent", languageCode, "Create First Independent Project", createdBy);

        // Project tooltips translations
        createTranslationIfNotExists("project.tooltips.testCaseCount", languageCode, "Test Case Count", createdBy);
        createTranslationIfNotExists("project.tooltips.memberCount", languageCode, "Member Count", createdBy);
        createTranslationIfNotExists("project.tooltips.junitStatus", languageCode, "Automation Test Status", createdBy);
        createTranslationIfNotExists("project.tooltips.automationTestCount", languageCode, "Automation Test Result Count", createdBy);

        createTranslationIfNotExists("organization.management.title", languageCode, "Organization Management", createdBy);

        // User Management - User List
        createTranslationIfNotExists("userList.title", languageCode, "User Management", createdBy);
        createTranslationIfNotExists("userList.loading", languageCode, "Loading user list...", createdBy);
        createTranslationIfNotExists("userList.search.placeholder", languageCode, "Search by name, username, email...", createdBy);
        createTranslationIfNotExists("userList.filter.role", languageCode, "Role", createdBy);
        createTranslationIfNotExists("userList.filter.status", languageCode, "Status", createdBy);
        createTranslationIfNotExists("userList.filter.all", languageCode, "All", createdBy);
        createTranslationIfNotExists("userList.filter.active", languageCode, "Active", createdBy);
        createTranslationIfNotExists("userList.filter.inactive", languageCode, "Inactive", createdBy);
        createTranslationIfNotExists("userList.button.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("userList.button.export", languageCode, "Export Data", createdBy);
        createTranslationIfNotExists("userList.button.reset", languageCode, "Reset", createdBy);

        // User Statistics
        createTranslationIfNotExists("userList.stats.totalUsers", languageCode, "Total Users", createdBy);
        createTranslationIfNotExists("userList.stats.activeUsers", languageCode, "Active Users", createdBy);
        createTranslationIfNotExists("userList.stats.inactiveUsers", languageCode, "Inactive Users", createdBy);
        createTranslationIfNotExists("userList.stats.recentRegistrations", languageCode, "Recent Registrations", createdBy);

        // User List Table Headers
        createTranslationIfNotExists("userList.table.username", languageCode, "Username", createdBy);
        createTranslationIfNotExists("userList.table.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("userList.table.email", languageCode, "Email", createdBy);
        createTranslationIfNotExists("userList.table.role", languageCode, "Role", createdBy);
        createTranslationIfNotExists("userList.table.status", languageCode, "Status", createdBy);
        createTranslationIfNotExists("userList.table.createdAt", languageCode, "Created At", createdBy);
        createTranslationIfNotExists("userList.table.lastLogin", languageCode, "Last Login", createdBy);
        createTranslationIfNotExists("userList.table.actions", languageCode, "Actions", createdBy);

        // User List Actions
        createTranslationIfNotExists("userList.status.none", languageCode, "None", createdBy);
        createTranslationIfNotExists("userList.action.view", languageCode, "View Details", createdBy);
        createTranslationIfNotExists("userList.action.moreActions", languageCode, "More Actions", createdBy);
        createTranslationIfNotExists("userList.action.activate", languageCode, "Activate", createdBy);
        createTranslationIfNotExists("userList.action.deactivate", languageCode, "Deactivate", createdBy);

        // User List Empty State
        createTranslationIfNotExists("userList.empty.message", languageCode, "No users match the search criteria.", createdBy);
        createTranslationIfNotExists("userList.empty.resetButton", languageCode, "Reset Search Criteria", createdBy);

        // User List Pagination
        createTranslationIfNotExists("userList.pagination.rowsPerPage", languageCode, "Rows per page:", createdBy);
        createTranslationIfNotExists("userList.pagination.displayedRows", languageCode, "{from}-{to} of {count}", createdBy);

        // User Detail Dialog
        createTranslationIfNotExists("userDetail.loading", languageCode, "Loading user information...", createdBy);
        createTranslationIfNotExists("userDetail.title", languageCode, "User Information", createdBy);
        createTranslationIfNotExists("userDetail.notFound", languageCode, "User information not found.", createdBy);
        createTranslationIfNotExists("userDetail.editCancel.title", languageCode, "Cancel Edit", createdBy);
        createTranslationIfNotExists("userDetail.editCancel.message", languageCode, "You have unsaved changes. Do you want to close without saving?", createdBy);

        // User Detail Validation
        createTranslationIfNotExists("userDetail.validation.required", languageCode, "Name and email are required fields.", createdBy);
        createTranslationIfNotExists("userDetail.validation.emailFormat", languageCode, "Please enter a valid email format.", createdBy);
        createTranslationIfNotExists("userDetail.error.saveError", languageCode, "An error occurred while saving.", createdBy);

        // User Detail Sections
        createTranslationIfNotExists("userDetail.section.basicInfo", languageCode, "Basic Information", createdBy);
        createTranslationIfNotExists("userDetail.form.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("userDetail.form.email", languageCode, "Email", createdBy);
        createTranslationIfNotExists("userDetail.form.role", languageCode, "Role", createdBy);
        createTranslationIfNotExists("userDetail.form.accountActive", languageCode, "Account Active", createdBy);

        createTranslationIfNotExists("userDetail.section.statusInfo", languageCode, "Status Information", createdBy);
        createTranslationIfNotExists("userDetail.status.role", languageCode, "Role", createdBy);
        createTranslationIfNotExists("userDetail.status.account", languageCode, "Account Status", createdBy);
        createTranslationIfNotExists("userDetail.status.active", languageCode, "Active", createdBy);
        createTranslationIfNotExists("userDetail.status.inactive", languageCode, "Inactive", createdBy);
        createTranslationIfNotExists("userDetail.status.activity", languageCode, "Activity Status", createdBy);

        createTranslationIfNotExists("userDetail.section.timeInfo", languageCode, "Time Information", createdBy);
        createTranslationIfNotExists("userDetail.time.createdAt", languageCode, "Created At", createdBy);
        createTranslationIfNotExists("userDetail.time.updatedAt", languageCode, "Last Updated", createdBy);
        createTranslationIfNotExists("userDetail.time.lastLogin", languageCode, "Last Login", createdBy);
        createTranslationIfNotExists("userDetail.time.daysSinceLogin", languageCode, "Days Since Login", createdBy);
        createTranslationIfNotExists("userDetail.time.days", languageCode, "days", createdBy);
        createTranslationIfNotExists("userDetail.time.none", languageCode, "None", createdBy);

        // User Detail Buttons
        createTranslationIfNotExists("userDetail.button.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("userDetail.button.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("userDetail.tooltip.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("userDetail.tooltip.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("userDetail.tooltip.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("userDetail.tooltip.passwordChange", languageCode, "Change Password", createdBy);
        createTranslationIfNotExists("userDetail.success.passwordChanged", languageCode, "Password Change Complete", createdBy);

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

        // Additional testExecution translation keys
        createTranslationIfNotExists("testExecution.form.totalCount", languageCode, "Total {count} items", createdBy);
        createTranslationIfNotExists("testExecution.table.noData", languageCode, "No data to display.", createdBy);

        // Additional translation management keys
        createTranslationIfNotExists("translation.keyTab.statusLabel", languageCode, "Status", createdBy);

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
        createTranslationIfNotExists("testResult.form.notesHelp", languageCode, "Please record any special findings or additional information from the test process.", createdBy);
        createTranslationIfNotExists("testResult.form.notesLimitWarning", languageCode, "{remaining} characters remaining", createdBy);
        createTranslationIfNotExists("testResult.form.notesLimitError", languageCode, "Exceeded 10,000 characters. Please attach long content as a file.", createdBy);
        createTranslationIfNotExists("testResult.form.notesFileRecommendation", languageCode, "For long content, file attachment is recommended.", createdBy);

        // Markdown mode related
        createTranslationIfNotExists("testResult.form.mode.text", languageCode, "Text", createdBy);
        createTranslationIfNotExists("testResult.form.mode.markdown", languageCode, "Markdown", createdBy);
        createTranslationIfNotExists("testResult.form.mode.switch", languageCode, "Mode Switch", createdBy);

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

        // Additional common translation keys
        createTranslationIfNotExists("common.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("common.select", languageCode, "Select", createdBy);

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
        createTranslationIfNotExists("testResult.filter.apply", languageCode, "Apply Filter", createdBy);
        createTranslationIfNotExists("testResult.filter.clear", languageCode, "Clear", createdBy);
        createTranslationIfNotExists("testResult.filter.clearTooltip", languageCode, "Clear all filters", createdBy);
        createTranslationIfNotExists("testResult.filter.testPlan", languageCode, "Test Plan", createdBy);
        createTranslationIfNotExists("testResult.filter.allPlans", languageCode, "All Plans", createdBy);
        createTranslationIfNotExists("testResult.filter.testExecution", languageCode, "Test Execution", createdBy);
        createTranslationIfNotExists("testResult.filter.allExecutions", languageCode, "All Executions", createdBy);
        createTranslationIfNotExists("testResult.filter.allView", languageCode, "All", createdBy);
        createTranslationIfNotExists("testResult.filter.errorLoadPlans", languageCode, "Unable to load test plan list.", createdBy);
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

        // JIRA Status Indicator
        createTranslationIfNotExists("jira.status.connectionStatus", languageCode, "JIRA Connection Status", createdBy);
        createTranslationIfNotExists("jira.status.notConfigured", languageCode, "JIRA Not Configured", createdBy);
        createTranslationIfNotExists("jira.messages.noConfig", languageCode, "JIRA settings are missing. Please register JIRA server information on the settings page.", createdBy);
        createTranslationIfNotExists("common.buttons.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("common.loading", languageCode, "Loading...", createdBy);

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
        createTranslationIfNotExists("header.nav.managementMenu", languageCode, "Management Menu", createdBy);

        // Translation Management Page
        createTranslationIfNotExists("translation.management.title", languageCode, "Language Management", createdBy);
        createTranslationIfNotExists("translation.management.exportCsv", languageCode, "Export CSV", createdBy);
        createTranslationIfNotExists("translation.management.importCsv", languageCode, "Import CSV", createdBy);
        createTranslationIfNotExists("translation.management.clearCache", languageCode, "Clear Cache", createdBy);

        // Translation Management Tabs
        createTranslationIfNotExists("translation.tabs.languageManagement", languageCode, "Language Management", createdBy);
        createTranslationIfNotExists("translation.tabs.keyManagement", languageCode, "Translation Key Management", createdBy);
        createTranslationIfNotExists("translation.tabs.translationManagement", languageCode, "Translation Management", createdBy);
        createTranslationIfNotExists("translation.tabs.statistics", languageCode, "Statistics", createdBy);

        // CSV Import Dialog
        createTranslationIfNotExists("translation.csvImport.dialogTitle", languageCode, "Import CSV File", createdBy);
        createTranslationIfNotExists("translation.csvImport.formatDescription", languageCode, "CSV File Format: keyName, languageCode, value, context, isActive, updatedBy, updatedAt", createdBy);
        createTranslationIfNotExists("translation.csvImport.overwriteLabel", languageCode, "Overwrite Existing Translations", createdBy);
        createTranslationIfNotExists("translation.csvImport.overwriteHelper", languageCode, "If checked, existing translations will be overwritten with new values. If unchecked, existing translations will be kept and only new translations will be added.", createdBy);
        createTranslationIfNotExists("common.buttons.import", languageCode, "Import", createdBy);

        // 언어 관리 다이얼로그
        createTranslationIfNotExists("translation.languageDialog.addTitle", languageCode, "Add Language", createdBy);
        createTranslationIfNotExists("translation.languageDialog.editTitle", languageCode, "Edit Language", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeLabel", languageCode, "Language Code", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeHelper", languageCode, "e.g., ko, en, ja", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderLabel", languageCode, "Sort Order", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderHelper", languageCode, "Sort order must be 0 or greater", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nameLabel", languageCode, "Language Name", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nameHelper", languageCode, "e.g., Korean, English", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nativeNameLabel", languageCode, "Native Name", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nativeNameHelper", languageCode, "e.g., 한국어, English", createdBy);
        createTranslationIfNotExists("translation.languageDialog.isDefaultLabel", languageCode, "Set as Default Language", createdBy);
        createTranslationIfNotExists("translation.languageDialog.isActiveLabel", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.languageDialog.defaultLanguageWarning", languageCode, "Setting as default language will unset default for other languages.", createdBy);
        createTranslationIfNotExists("common.buttons.add", languageCode, "Add", createdBy);
        createTranslationIfNotExists("common.buttons.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeRequired", languageCode, "Language code is required", createdBy);
        createTranslationIfNotExists("translation.languageDialog.codeFormat", languageCode, "Language code must be 2-3 lowercase letters", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nameRequired", languageCode, "Language name is required", createdBy);
        createTranslationIfNotExists("translation.languageDialog.nativeNameRequired", languageCode, "Native name is required", createdBy);
        createTranslationIfNotExists("translation.languageDialog.sortOrderMin", languageCode, "Sort order must be 0 or greater", createdBy);

        // 번역 키 관리 다이얼로그
        createTranslationIfNotExists("translation.keyDialog.addTitle", languageCode, "Add Translation Key", createdBy);
        createTranslationIfNotExists("translation.keyDialog.editTitle", languageCode, "Edit Translation Key", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameLabel", languageCode, "Key Name", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameHelper", languageCode, "e.g., login.title, button.submit", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameFormat", languageCode, "Key name must start with a letter and contain only letters, numbers, dots, or underscores", createdBy);
        createTranslationIfNotExists("translation.keyDialog.categoryLabel", languageCode, "Category", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.login", languageCode, "Login", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.register", languageCode, "Register", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.button", languageCode, "Button", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.message", languageCode, "Message", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.validation", languageCode, "Validation", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.navigation", languageCode, "Navigation", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.form", languageCode, "Form", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.error", languageCode, "Error", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.success", languageCode, "Success", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.common", languageCode, "Common", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionLabel", languageCode, "Description", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionHelper", languageCode, "Describe where this key is used", createdBy);
        createTranslationIfNotExists("translation.keyDialog.defaultValueLabel", languageCode, "Default Value", createdBy);
        createTranslationIfNotExists("translation.keyDialog.defaultValueHelper", languageCode, "Default text to display if no translation exists", createdBy);
        createTranslationIfNotExists("translation.keyDialog.isActiveLabel", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.keyDialog.keyNameRequired", languageCode, "Key name is required", createdBy);
        createTranslationIfNotExists("translation.keyDialog.categoryRequired", languageCode, "Please select a category", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionRequired", languageCode, "Description is required", createdBy);
        createTranslationIfNotExists("translation.keyDialog.defaultValueRequired", languageCode, "Default value is required", createdBy);

        // 번역 관리 다이얼로그
        createTranslationIfNotExists("translation.translationDialog.addTitle", languageCode, "Add Translation", createdBy);
        createTranslationIfNotExists("translation.translationDialog.editTitle", languageCode, "Edit Translation", createdBy);
        createTranslationIfNotExists("translation.translationDialog.keyLabel", languageCode, "Translation Key", createdBy);
        createTranslationIfNotExists("translation.translationDialog.languageLabel", languageCode, "Language", createdBy);
        createTranslationIfNotExists("translation.translationDialog.keyDescription", languageCode, "Key Description", createdBy);
        createTranslationIfNotExists("translation.translationDialog.defaultValue", languageCode, "Default Value", createdBy);
        createTranslationIfNotExists("translation.translationDialog.valueLabel", languageCode, "Translation Value", createdBy);
        createTranslationIfNotExists("translation.translationDialog.valueHelper", languageCode, "Enter the text to display in this language", createdBy);
        createTranslationIfNotExists("translation.translationDialog.contextLabel", languageCode, "Context", createdBy);
        createTranslationIfNotExists("translation.translationDialog.contextHelper", languageCode, "Describe the context or usage of the translation (optional)", createdBy);
        createTranslationIfNotExists("translation.translationDialog.isActiveLabel", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.translationDialog.keyRequired", languageCode, "Please select a translation key", createdBy);
        createTranslationIfNotExists("translation.translationDialog.languageRequired", languageCode, "Please select a language", createdBy);
        createTranslationIfNotExists("translation.translationDialog.valueRequired", languageCode, "Translation value is required", createdBy);

        // 언어 관리 탭
        createTranslationIfNotExists("translation.languageTab.listTitle", languageCode, "Language List", createdBy);
        createTranslationIfNotExists("translation.languageTab.addLanguage", languageCode, "Add Language", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.code", languageCode, "Language Code", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.name", languageCode, "Language Name", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.nativeName", languageCode, "Native Name", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.isDefault", languageCode, "Default Language", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.isActive", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.sortOrder", languageCode, "Sort Order", createdBy);
        createTranslationIfNotExists("common.table.actions", languageCode, "Actions", createdBy);
        createTranslationIfNotExists("common.default", languageCode, "Default", createdBy);
        createTranslationIfNotExists("common.active", languageCode, "Active", createdBy);
        createTranslationIfNotExists("common.inactive", languageCode, "Inactive", createdBy);
        createTranslationIfNotExists("common.buttons.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("common.buttons.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("translation.languageTab.deleteConfirm", languageCode, "Are you sure you want to delete this language?", createdBy);

        // 번역 키 관리 탭
        createTranslationIfNotExists("translation.keyTab.listTitle", languageCode, "Translation Key List", createdBy);
        createTranslationIfNotExists("translation.keyTab.addKey", languageCode, "Add Translation Key", createdBy);
        createTranslationIfNotExists("common.search.keyword", languageCode, "Keyword Search", createdBy);
        createTranslationIfNotExists("translation.keyTab.categoryLabel", languageCode, "Category", createdBy);
        createTranslationIfNotExists("translation.keyTab.isActiveLabel", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.keyName", languageCode, "Key Name", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.category", languageCode, "Category", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.defaultValue", languageCode, "Default Value", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.isActive", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.keyTab.deleteConfirm", languageCode, "Are you sure you want to delete this translation key?", createdBy);

        // 번역 관리 탭
        createTranslationIfNotExists("translation.translationTab.listTitle", languageCode, "Translation List", createdBy);
        createTranslationIfNotExists("translation.translationTab.exportCsvByLanguage", languageCode, "{languageCode} Export CSV", createdBy);
        createTranslationIfNotExists("translation.translationTab.addTranslation", languageCode, "Add Translation", createdBy);
        createTranslationIfNotExists("translation.translationTab.languageLabel", languageCode, "Language", createdBy);
        createTranslationIfNotExists("translation.translationTab.keyNameLabel", languageCode, "Translation Key Name", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.keyName", languageCode, "Translation Key", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.language", languageCode, "Language", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.value", languageCode, "Translation Value", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.context", languageCode, "Context", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.isActive", languageCode, "Active Status", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.updatedBy", languageCode, "Updated By", createdBy);
        createTranslationIfNotExists("translation.translationTab.deleteConfirm", languageCode, "Are you sure you want to delete this translation?", createdBy);

        // 통계 탭
        createTranslationIfNotExists("translation.statisticsTab.title", languageCode, "Translation Completion Statistics", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.completionRateLabel", languageCode, "Completion Rate", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.translatedCountLabel", languageCode, "Translated", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.totalCountLabel", languageCode, "Total", createdBy);

        // Translation Management Page
        createTranslationIfNotExists("translation.management.title", languageCode, "Language Management", createdBy);
        createTranslationIfNotExists("translation.management.exportCsv", languageCode, "Export CSV", createdBy);
        createTranslationIfNotExists("translation.management.importCsv", languageCode, "Import CSV", createdBy);
        createTranslationIfNotExists("translation.management.clearCache", languageCode, "Clear Cache", createdBy);

        // Translation Management Tabs
        createTranslationIfNotExists("translation.tabs.languageManagement", languageCode, "Language Management", createdBy);
        createTranslationIfNotExists("translation.tabs.keyManagement", languageCode, "Translation Key Management", createdBy);
        createTranslationIfNotExists("translation.tabs.translationManagement", languageCode, "Translation Management", createdBy);
        createTranslationIfNotExists("translation.tabs.statistics", languageCode, "Statistics", createdBy);

        // CSV Import Dialog
        createTranslationIfNotExists("translation.csvImport.dialogTitle", languageCode, "Import CSV File", createdBy);
        createTranslationIfNotExists("translation.csvImport.formatDescription", languageCode, "CSV File Format: keyName, languageCode, value, context, isActive, updatedBy, updatedAt", createdBy);
        createTranslationIfNotExists("translation.csvImport.overwriteLabel", languageCode, "Overwrite Existing Translations", createdBy);
        createTranslationIfNotExists("translation.csvImport.overwriteHelper", languageCode, "If checked, existing translations will be overwritten with new values. If unchecked, existing translations will be kept and only new translations will be added.", createdBy);
        createTranslationIfNotExists("common.buttons.import", languageCode, "Import", createdBy);
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

        // Organization management additional translations
        createTranslationIfNotExists("organization.buttons.createNew", languageCode, "Create Organization", createdBy);
        createTranslationIfNotExists("organization.buttons.view", languageCode, "View Organization", createdBy);
        createTranslationIfNotExists("organization.buttons.edit", languageCode, "Edit Organization", createdBy);
        createTranslationIfNotExists("organization.buttons.invite", languageCode, "Invite Member", createdBy);
        createTranslationIfNotExists("organization.buttons.createProject", languageCode, "Create Project", createdBy);
        createTranslationIfNotExists("organization.buttons.firstOrganization", languageCode, "Create First Organization", createdBy);
        createTranslationIfNotExists("organization.buttons.firstProject", languageCode, "Create First Project", createdBy);
        createTranslationIfNotExists("organization.buttons.inviteMember", languageCode, "Invite Member", createdBy);
        createTranslationIfNotExists("organization.buttons.removeMember", languageCode, "Remove Member", createdBy);
        createTranslationIfNotExists("organization.buttons.backToList", languageCode, "Back to Organizations", createdBy);
        createTranslationIfNotExists("organization.buttons.transferOwnership", languageCode, "Transfer Ownership", createdBy);
        createTranslationIfNotExists("organization.buttons.transfer", languageCode, "Transfer", createdBy);

        // Organization messages
        createTranslationIfNotExists("organization.messages.noOrganizations", languageCode, "No organizations available", createdBy);
        createTranslationIfNotExists("organization.messages.noProjects", languageCode, "This organization has no projects yet.", createdBy);
        createTranslationIfNotExists("organization.messages.createHint", languageCode, "Create a new organization to manage projects and teams.", createdBy);
        createTranslationIfNotExists("organization.messages.joinHint", languageCode, "Contact your system administrator to join an organization.", createdBy);
        createTranslationIfNotExists("organization.messages.accessDenied", languageCode, "You don't belong to any organization. Contact your system administrator to be added as a member or create a new organization.", createdBy);
        createTranslationIfNotExists("organization.messages.canCreateNew", languageCode, "You cannot access existing organizations, but you can create a new one.", createdBy);
        createTranslationIfNotExists("organization.messages.noAccessContact", languageCode, "No available organizations. Contact your system administrator.", createdBy);

        // Organization forms
        createTranslationIfNotExists("organization.form.name", languageCode, "Organization Name", createdBy);
        createTranslationIfNotExists("organization.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("organization.form.descriptionPlaceholder", languageCode, "Enter organization description...", createdBy);
        createTranslationIfNotExists("organization.form.nameRequired", languageCode, "Please enter organization name.", createdBy);
        createTranslationIfNotExists("organization.form.usernameRequired", languageCode, "Please enter username.", createdBy);
        createTranslationIfNotExists("organization.form.username", languageCode, "Username", createdBy);
        createTranslationIfNotExists("organization.form.role", languageCode, "Role", createdBy);
        createTranslationIfNotExists("organization.form.projectCode", languageCode, "Project Code", createdBy);
        createTranslationIfNotExists("organization.form.projectName", languageCode, "Project Name", createdBy);
        createTranslationIfNotExists("organization.form.projectDescription", languageCode, "Project Description", createdBy);
        createTranslationIfNotExists("organization.form.projectCodePlaceholder", languageCode, "e.g., WEB_APP_TEST", createdBy);
        createTranslationIfNotExists("organization.form.projectNamePlaceholder", languageCode, "e.g., Web Application Test", createdBy);
        createTranslationIfNotExists("organization.form.projectDescriptionPlaceholder", languageCode, "Enter a brief description of the project...", createdBy);
        createTranslationIfNotExists("organization.form.projectCodeHelp", languageCode, "Only letters, numbers, underscores (_), and hyphens (-) allowed", createdBy);
        createTranslationIfNotExists("organization.form.namePlaceholder", languageCode, "Enter organization name...", createdBy);
        createTranslationIfNotExists("organization.form.projectCodeRequired", languageCode, "Please enter project code.", createdBy);
        createTranslationIfNotExists("organization.form.projectNameRequired", languageCode, "Please enter project name.", createdBy);

        // Organization dialogs
        createTranslationIfNotExists("organization.dialog.create.title", languageCode, "Create New Organization", createdBy);
        createTranslationIfNotExists("organization.dialog.edit.title", languageCode, "Edit Organization", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.title", languageCode, "Confirm Organization Deletion", createdBy);
        createTranslationIfNotExists("organization.dialog.invite.title", languageCode, "Invite Member", createdBy);
        createTranslationIfNotExists("organization.dialog.createProject.title", languageCode, "Create Project", createdBy);
        createTranslationIfNotExists("organization.dialog.createProject.info", languageCode, "A new project will be created in the '{organizationName}' organization.", createdBy);
        createTranslationIfNotExists("organization.dialog.transferOwnership.title", languageCode, "Transfer Ownership", createdBy);
        createTranslationIfNotExists("organization.dialog.transferOwnership.warning", languageCode, "Do you want to transfer organization ownership to {name}? This action cannot be undone and your role will be changed to administrator.", createdBy);
        createTranslationIfNotExists("organization.dialog.transferOwnership.newOwner", languageCode, "New Owner", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.message", languageCode, "Do you really want to delete this organization?", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.warning", languageCode, "This action cannot be undone. All projects and data in this organization will also be deleted.", createdBy);

        // Organization tabs
        createTranslationIfNotExists("organization.tabs.members", languageCode, "Members", createdBy);
        createTranslationIfNotExists("organization.tabs.projects", languageCode, "Projects", createdBy);

        // Organization table headers
        createTranslationIfNotExists("organization.table.user", languageCode, "User", createdBy);
        createTranslationIfNotExists("organization.table.role", languageCode, "Role", createdBy);
        createTranslationIfNotExists("organization.table.joinDate", languageCode, "Join Date", createdBy);
        createTranslationIfNotExists("organization.table.actions", languageCode, "Actions", createdBy);

        // Organization roles
        createTranslationIfNotExists("organization.role.member", languageCode, "Member", createdBy);
        createTranslationIfNotExists("organization.role.admin", languageCode, "Admin", createdBy);
        createTranslationIfNotExists("organization.role.owner", languageCode, "Owner", createdBy);

        // Organization project related
        createTranslationIfNotExists("organization.project.organizationLabel", languageCode, "Organization", createdBy);
        createTranslationIfNotExists("organization.project.noDescription", languageCode, "No description", createdBy);

        // Organization errors
        createTranslationIfNotExists("organization.error.notFound", languageCode, "Organization not found.", createdBy);
        createTranslationIfNotExists("organization.error.idNotProvided", languageCode, "Organization ID not provided.", createdBy);
        createTranslationIfNotExists("organization.error.dataLoadFailed", languageCode, "Failed to load organization data.", createdBy);
        createTranslationIfNotExists("organization.error.infoLoadFailed", languageCode, "Failed to load organization information.", createdBy);
        createTranslationIfNotExists("organization.error.editDialogFailed", languageCode, "Failed to open edit dialog.", createdBy);
        createTranslationIfNotExists("organization.error.accessDenied", languageCode, "Organization Access Denied", createdBy);
        createTranslationIfNotExists("organization.error.authRequired", languageCode, "Authentication Required", createdBy);
        createTranslationIfNotExists("organization.error.resourceNotFound", languageCode, "Resource Not Found", createdBy);
        createTranslationIfNotExists("organization.error.general", languageCode, "Error Occurred", createdBy);
        createTranslationIfNotExists("organization.error.authDescription", languageCode, "Login is required. Please log in again.", createdBy);
        createTranslationIfNotExists("organization.error.notFoundDescription", languageCode, "The requested resource could not be found.", createdBy);
        createTranslationIfNotExists("organization.error.generalDescription", languageCode, "Contact your system administrator if the problem persists.", createdBy);
        createTranslationIfNotExists("organization.error.problemOccurred", languageCode, "A problem occurred", createdBy);
        createTranslationIfNotExists("organization.error.occurredAt", languageCode, "Occurred at: {date}", createdBy);

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
        createTranslationIfNotExists("testcase.tree.ragVectorized", languageCode, "RAG Vectorized", createdBy);

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

        // Tree statistics count
        createTranslationIfNotExists("testcase.tree.count.testcases", languageCode, "Test Cases: {count}", createdBy);
        createTranslationIfNotExists("testcase.tree.count.folders", languageCode, "Folders: {count}", createdBy);
        createTranslationIfNotExists("testcase.tree.count.total", languageCode, "Total: {count}", createdBy);

        // TestCaseForm component translation keys
        createTranslationIfNotExists("testcase.form.title.edit", languageCode, "Edit Test Case", createdBy);
        createTranslationIfNotExists("testcase.form.displayId", languageCode, "Display ID", createdBy);
        createTranslationIfNotExists("testcase.form.displayOrder", languageCode, "Order", createdBy);
        createTranslationIfNotExists("testcase.form.createdBy", languageCode, "Created By", createdBy);
        createTranslationIfNotExists("testcase.form.updatedBy", languageCode, "Updated By", createdBy);
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
        createTranslationIfNotExists("testcase.spreadsheet.column.createdBy", languageCode, "Created By", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.column.updatedBy", languageCode, "Updated By", createdBy);
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

        // Advanced spreadsheet features guide
        createTranslationIfNotExists("testcase.advancedGrid.features.title", languageCode, "Advanced Features:", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.features.lineBreak", languageCode, "Press Enter within cells for line breaks.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.features.navigation", languageCode, "Use Tab to move to next cell, Ctrl+C/V for copy/paste.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.multiSelect.title", languageCode, "Multi-Selection:", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.multiSelect.range", languageCode, "Shift+Click for range selection, Ctrl+Click for individual selection.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.multiSelect.resize", languageCode, "Drag to resize cells and auto-fill data.", createdBy);

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

        // Spreadsheet Fallback mode
        createTranslationIfNotExists("testcase.spreadsheet.fallback.title", languageCode, "Enhanced Spreadsheet Mode", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.fallback.description", languageCode, "All features work normally. Supports cell editing, copy/paste, and bulk save.", createdBy);

        // Spreadsheet error messages
        createTranslationIfNotExists("testcase.spreadsheet.error.title", languageCode, "Spreadsheet Loading Error", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.error.description", languageCode, "An error occurred while loading react-datasheet-grid.", createdBy);

        // Spreadsheet placeholders
        createTranslationIfNotExists("testcase.spreadsheet.placeholder.multiline", languageCode, "Multi-line input available...", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.placeholder.text", languageCode, "Enter text...", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.placeholder.columnInput", languageCode, "Enter {title}...", createdBy);

        // Spreadsheet messages
        createTranslationIfNotExists("testcase.spreadsheet.message.saveSuccess", languageCode, "{count} test case(s) saved successfully.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.saveError", languageCode, "An error occurred while saving: {error}", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.refreshSuccess", languageCode, "Refreshed with latest data.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.refreshError", languageCode, "An error occurred while refreshing: {error}", createdBy);

        // ICT-373: Batch save related messages
        createTranslationIfNotExists("testcase.spreadsheet.message.noChanges", languageCode, "No changes detected.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.batchSaveSuccess", languageCode, "✅ Batch save completed: {folderCount} folder(s), {testCaseCount} test case(s)", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.batchSavePartialFailure", languageCode, "⚠️ Batch save partial failure:\n✅ Success: {successCount}\n❌ Failed: {failureCount}\n\n", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.failureDetails", languageCode, "Failure details:\n", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.message.moreErrors", languageCode, "... and {count} more error(s)\n", createdBy);

        // Spreadsheet step menu
        createTranslationIfNotExists("testcase.spreadsheet.stepMenu.addStep", languageCode, "Add Step ({count})", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepMenu.removeStep", languageCode, "Remove Step ({count})", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepMenu.settings", languageCode, "Set Step Count...", createdBy);

        // Spreadsheet step dialog
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.title", languageCode, "Set Step Count", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.description", languageCode, "Set the number of steps for test cases. Existing data will be preserved.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.label", languageCode, "Step Count", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.helper", languageCode, "Can be set from 1 to 10.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.apply", languageCode, "Apply", createdBy);

        // Spreadsheet footer
        createTranslationIfNotExists("testcase.spreadsheet.footer.info", languageCode, "* Advanced spreadsheet based on react-datasheet-grid • {count} step(s) • Line break and advanced editing support", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.footer.warning", languageCode, "⚠️ Changes will be lost if not saved.", createdBy);

        // Spreadsheet status
        createTranslationIfNotExists("testcase.spreadsheet.status.lineBreakSupport", languageCode, "Line Break Support", createdBy);

        // Advanced grid title
        createTranslationIfNotExists("testcase.advancedGrid.title", languageCode, "Advanced Spreadsheet", createdBy);

        // InputModeToggle - Advanced Spreadsheet mode
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.title", languageCode, "Advanced Spreadsheet", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.description", languageCode, "Advanced spreadsheet mode: Spreadsheet with line break and advanced editing features.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", languageCode, "Advanced Spreadsheet (Line break support, react-datasheet-grid)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.ariaLabel", languageCode, "Advanced Spreadsheet Mode", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.status", languageCode, "🚀 Advanced Spreadsheet - Supports line breaks and multi-selection.", createdBy);

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

        // Mail Settings translations
        // MailSettingsManager 관련
        createTranslationIfNotExists("mail.manager.title", languageCode, "Mail Settings Management", createdBy);
        createTranslationIfNotExists("mail.manager.currentSettings", languageCode, "Current Mail Settings", createdBy);
        createTranslationIfNotExists("mail.manager.subheader", languageCode, "System email sending configuration status", createdBy);
        createTranslationIfNotExists("mail.manager.notConfigured", languageCode, "Mail settings are not configured. Please add new settings.", createdBy);

        // 메일 상태 관련
        createTranslationIfNotExists("mail.status.enabled", languageCode, "Mail Function", createdBy);
        createTranslationIfNotExists("mail.status.active", languageCode, "Active", createdBy);
        createTranslationIfNotExists("mail.status.inactive", languageCode, "Inactive", createdBy);
        createTranslationIfNotExists("mail.status.activatedStatus", languageCode, "Activated", createdBy);
        createTranslationIfNotExists("mail.status.deactivatedStatus", languageCode, "Deactivated", createdBy);

        // SMTP 설정 관련
        createTranslationIfNotExists("mail.smtp.server", languageCode, "SMTP Server", createdBy);
        createTranslationIfNotExists("mail.smtp.sender", languageCode, "Sender", createdBy);
        createTranslationIfNotExists("mail.smtp.security", languageCode, "Security Settings", createdBy);
        createTranslationIfNotExists("mail.smtp.auth", languageCode, "Authentication", createdBy);
        createTranslationIfNotExists("mail.smtp.tls", languageCode, "TLS", createdBy);
        createTranslationIfNotExists("mail.smtp.used", languageCode, "Used", createdBy);
        createTranslationIfNotExists("mail.smtp.notUsed", languageCode, "Not Used", createdBy);

        // 버튼 관련
        createTranslationIfNotExists("mail.button.newSettings", languageCode, "New Settings", createdBy);
        createTranslationIfNotExists("mail.button.modifySettings", languageCode, "Modify Settings", createdBy);
        createTranslationIfNotExists("mail.button.testSend", languageCode, "Test Send", createdBy);
        createTranslationIfNotExists("mail.button.disable", languageCode, "Disable", createdBy);
        createTranslationIfNotExists("mail.button.detailedMethod", languageCode, "Detailed Setup Method", createdBy);

        // Gmail 가이드 관련
        createTranslationIfNotExists("mail.guide.title", languageCode, "Gmail Setup Guide", createdBy);
        createTranslationIfNotExists("mail.guide.description", languageCode, "TestCase Manager only supports Gmail SMTP. Gmail app password setup is required.", createdBy);
        createTranslationIfNotExists("mail.guide.requirements", languageCode, "Required Requirements", createdBy);
        createTranslationIfNotExists("mail.guide.gmailAccount", languageCode, "Gmail Account", createdBy);
        createTranslationIfNotExists("mail.guide.twoFactorAuth", languageCode, "2-Factor Authentication Required", createdBy);
        createTranslationIfNotExists("mail.guide.appPassword", languageCode, "Generate App Password", createdBy);

        // MailConfigDialog 관련
        createTranslationIfNotExists("mail.config.title.new", languageCode, "New Mail Settings", createdBy);
        createTranslationIfNotExists("mail.config.title.edit", languageCode, "Edit Mail Settings", createdBy);
        createTranslationIfNotExists("mail.config.gmailInfo", languageCode, "This system only supports Gmail SMTP. Gmail 2-factor authentication and app password are required.", createdBy);
        createTranslationIfNotExists("mail.config.enableMail", languageCode, "Enable Mail Function", createdBy);

        // 폼 필드 관련
        createTranslationIfNotExists("mail.config.form.gmailAddress", languageCode, "Gmail Address", createdBy);
        createTranslationIfNotExists("mail.config.form.gmailAddressPlaceholder", languageCode, "your-email@gmail.com", createdBy);
        createTranslationIfNotExists("mail.config.form.gmailAddressHelper", languageCode, "Example: your-email@gmail.com", createdBy);
        createTranslationIfNotExists("mail.config.form.appPassword", languageCode, "Gmail App Password", createdBy);
        createTranslationIfNotExists("mail.config.form.appPasswordPlaceholder", languageCode, "Gmail App Password", createdBy);
        createTranslationIfNotExists("mail.config.form.appPasswordHelper", languageCode, "16-digit Gmail app password (no spaces)", createdBy);
        createTranslationIfNotExists("mail.config.form.senderName", languageCode, "Sender Name", createdBy);
        createTranslationIfNotExists("mail.config.form.senderNamePlaceholder", languageCode, "TestCase Manager", createdBy);
        createTranslationIfNotExists("mail.config.form.senderNameHelper", languageCode, "Sender name to be displayed in emails", createdBy);
        createTranslationIfNotExists("mail.config.form.testRecipient", languageCode, "Test Mail Recipient (Optional)", createdBy);
        createTranslationIfNotExists("mail.config.form.testRecipientPlaceholder", languageCode, "test@example.com", createdBy);
        createTranslationIfNotExists("mail.config.form.testRecipientHelper", languageCode, "Email address to receive test mail after setup", createdBy);

        // 검증 메시지
        createTranslationIfNotExists("mail.config.validation.gmailRequired", languageCode, "Gmail address is required.", createdBy);
        createTranslationIfNotExists("mail.config.validation.gmailFormat", languageCode, "Only Gmail addresses are supported. (Must end with @gmail.com)", createdBy);
        createTranslationIfNotExists("mail.config.validation.passwordRequired", languageCode, "Gmail app password is required.", createdBy);
        createTranslationIfNotExists("mail.config.validation.passwordLength", languageCode, "App password must be at least 8 characters long.", createdBy);
        createTranslationIfNotExists("mail.config.validation.senderNameRequired", languageCode, "Sender name is required.", createdBy);

        // Gmail 고정 설정
        createTranslationIfNotExists("mail.config.fixedSettings", languageCode, "Gmail Fixed Settings:", createdBy);
        createTranslationIfNotExists("mail.config.fixedSettings.smtp", languageCode, "SMTP Server: smtp.gmail.com:587", createdBy);
        createTranslationIfNotExists("mail.config.fixedSettings.tls", languageCode, "TLS Encryption: Used", createdBy);
        createTranslationIfNotExists("mail.config.fixedSettings.auth", languageCode, "SMTP Authentication: Used", createdBy);

        // 다이얼로그 버튼
        createTranslationIfNotExists("mail.config.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("mail.config.button.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("mail.config.button.saving", languageCode, "Saving...", createdBy);

        // GmailGuideDialog 관련
        createTranslationIfNotExists("mail.guide.dialog.title", languageCode, "Gmail App Password Setup Guide", createdBy);
        createTranslationIfNotExists("mail.guide.stepGuide", languageCode, "Step-by-Step Setup Method", createdBy);
        createTranslationIfNotExists("mail.guide.troubleshooting", languageCode, "Troubleshooting", createdBy);
        createTranslationIfNotExists("mail.guide.securityWarnings", languageCode, "Security Warnings", createdBy);
        createTranslationIfNotExists("mail.guide.button.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("mail.guide.button.next", languageCode, "Next", createdBy);
        createTranslationIfNotExists("mail.guide.button.previous", languageCode, "Previous", createdBy);
        createTranslationIfNotExists("mail.guide.button.complete", languageCode, "Complete", createdBy);
        createTranslationIfNotExists("mail.guide.button.reset", languageCode, "View Again", createdBy);

        // 설정 단계 관련
        createTranslationIfNotExists("mail.guide.step1.title", languageCode, "Gmail Account Login", createdBy);
        createTranslationIfNotExists("mail.guide.step1.description", languageCode, "Log in to your Gmail account", createdBy);
        createTranslationIfNotExists("mail.guide.step2.title", languageCode, "Go to Google Account Management", createdBy);
        createTranslationIfNotExists("mail.guide.step2.description", languageCode, "Navigate to Google Account Management page for security settings", createdBy);
        createTranslationIfNotExists("mail.guide.step3.title", languageCode, "Enable 2-Factor Authentication", createdBy);
        createTranslationIfNotExists("mail.guide.step3.description", languageCode, "Enable 2-factor authentication to generate app passwords", createdBy);
        createTranslationIfNotExists("mail.guide.step4.title", languageCode, "Generate App Password", createdBy);
        createTranslationIfNotExists("mail.guide.step4.description", languageCode, "Generate an app password for TestCase Manager", createdBy);
        createTranslationIfNotExists("mail.guide.step5.title", languageCode, "Configure in TestCase Manager", createdBy);
        createTranslationIfNotExists("mail.guide.step5.description", languageCode, "Enter the generated information in TestCase Manager", createdBy);

        // 성공/오류 메시지
        createTranslationIfNotExists("mail.message.saveSuccess", languageCode, "Mail settings saved successfully.", createdBy);
        createTranslationIfNotExists("mail.message.saveError", languageCode, "Failed to save mail settings.", createdBy);
        createTranslationIfNotExists("mail.message.loadError", languageCode, "Failed to load mail settings.", createdBy);
        createTranslationIfNotExists("mail.message.testSuccess", languageCode, "Test mail has been sent to {email}.", createdBy);
        createTranslationIfNotExists("mail.message.testError", languageCode, "Failed to send test mail.", createdBy);
        createTranslationIfNotExists("mail.message.disableSuccess", languageCode, "Mail function has been disabled.", createdBy);
        createTranslationIfNotExists("mail.message.disableError", languageCode, "Failed to disable mail settings.", createdBy);
        createTranslationIfNotExists("mail.message.disableConfirm", languageCode, "Are you sure you want to disable mail function?", createdBy);
        createTranslationIfNotExists("mail.message.testRecipientPrompt", languageCode, "Enter email address to receive test mail:", createdBy);
        createTranslationIfNotExists("mail.message.setupComplete", languageCode, "All setup is complete! You can now use the mail function in TestCase Manager.", createdBy);

        // 문제 해결 Q&A
        createTranslationIfNotExists("mail.troubleshoot.q1", languageCode, "I can't generate an app password", createdBy);
        createTranslationIfNotExists("mail.troubleshoot.a1", languageCode, "Please check if 2-factor authentication is enabled. You cannot generate an app password without 2-factor authentication.", createdBy);
        createTranslationIfNotExists("mail.troubleshoot.q2", languageCode, "Mail sending fails", createdBy);
        createTranslationIfNotExists("mail.troubleshoot.a2", languageCode, "Please verify that you entered the app password correctly. You must enter all 16 digits without spaces.", createdBy);
        createTranslationIfNotExists("mail.troubleshoot.q3", languageCode, "Can't I use my regular password?", createdBy);
        createTranslationIfNotExists("mail.troubleshoot.a3", languageCode, "For security reasons, you cannot use your Gmail account's regular password. You must use an app password.", createdBy);
        createTranslationIfNotExists("mail.troubleshoot.q4", languageCode, "Can I use G Suite accounts?", createdBy);
        createTranslationIfNotExists("mail.troubleshoot.a4", languageCode, "G Suite/Google Workspace accounts may vary depending on administrator settings. Please check SMTP usage permissions with your administrator.", createdBy);

        // Security warnings
        createTranslationIfNotExists("mail.security.warning1", languageCode, "App passwords have the same permissions as your Gmail account password.", createdBy);
        createTranslationIfNotExists("mail.security.warning2", languageCode, "Do not share your app password with others.", createdBy);
        createTranslationIfNotExists("mail.security.warning3", languageCode, "Regularly delete unnecessary app passwords.", createdBy);
        createTranslationIfNotExists("mail.security.warning4", languageCode, "Delete app passwords immediately if suspicious activity is detected.", createdBy);
        createTranslationIfNotExists("mail.security.warning5", languageCode, "Regularly review your Google account security activity.", createdBy);

        // Detailed step instructions
        createTranslationIfNotExists("mail.guide.step1.instruction1", languageCode, "1. Open Gmail (", createdBy);
        createTranslationIfNotExists("mail.guide.step1.instruction1.suffix", languageCode, ") in your web browser.", createdBy);
        createTranslationIfNotExists("mail.guide.step1.instruction2", languageCode, "2. Log in with the Gmail account you want to use for email settings.", createdBy);
        createTranslationIfNotExists("mail.guide.step1.alert.title", languageCode, "Note:", createdBy);
        createTranslationIfNotExists("mail.guide.step1.alert.message", languageCode, "Only personal Gmail accounts are supported. G Suite/Google Workspace accounts may require additional setup.", createdBy);

        // Step 2 detailed instructions
        createTranslationIfNotExists("mail.guide.step2.instruction1", languageCode, "1. Click your profile icon in the top right corner of Gmail.", createdBy);
        createTranslationIfNotExists("mail.guide.step2.instruction2", languageCode, "2. Click the \"Manage your Google Account\" button.", createdBy);
        createTranslationIfNotExists("mail.guide.step2.instruction3.prefix", languageCode, "Or directly visit ", createdBy);
        createTranslationIfNotExists("mail.guide.step2.instruction3.suffix", languageCode, ".", createdBy);

        // Step 3 detailed instructions
        createTranslationIfNotExists("mail.guide.step3.instruction1", languageCode, "1. Click \"Security\" in the left menu.", createdBy);
        createTranslationIfNotExists("mail.guide.step3.instruction2", languageCode, "2. Find the \"2-Step Verification\" section and click \"Get started\".", createdBy);
        createTranslationIfNotExists("mail.guide.step3.instruction3", languageCode, "3. Follow the instructions to register your phone number and complete verification.", createdBy);
        createTranslationIfNotExists("mail.guide.step3.alert.title", languageCode, "Required Step:", createdBy);
        createTranslationIfNotExists("mail.guide.step3.alert.message", languageCode, "2-step verification must be enabled to generate app passwords.", createdBy);

        // Step 4 detailed instructions
        createTranslationIfNotExists("mail.guide.step4.instruction1", languageCode, "1. On the \"Security\" page, click \"App passwords\".", createdBy);
        createTranslationIfNotExists("mail.guide.step4.instruction2", languageCode, "2. From the \"Select app\" dropdown, choose \"Mail\".", createdBy);
        createTranslationIfNotExists("mail.guide.step4.instruction3", languageCode, "3. From the \"Select device\" dropdown, choose \"Other (Custom name)\".", createdBy);
        createTranslationIfNotExists("mail.guide.step4.instruction4", languageCode, "4. Enter \"TestCase Manager\" and click \"Generate\".", createdBy);
        createTranslationIfNotExists("mail.guide.step4.instruction5", languageCode, "5. Copy the generated 16-character password.", createdBy);
        createTranslationIfNotExists("mail.guide.step4.alert.title", languageCode, "Important:", createdBy);
        createTranslationIfNotExists("mail.guide.step4.alert.message", languageCode, "The generated app password is shown only once. Store it in a safe place.", createdBy);

        // Step 5 detailed instructions
        createTranslationIfNotExists("mail.guide.step5.instruction1", languageCode, "1. Enter the following information in the mail settings dialog:", createdBy);
        createTranslationIfNotExists("mail.guide.step5.instruction2", languageCode, "2. Click the \"Save\" button to complete the setup.", createdBy);
        createTranslationIfNotExists("mail.guide.step5.instruction3", languageCode, "3. Use the \"Test Send\" button to verify that the settings are correct.", createdBy);
        createTranslationIfNotExists("mail.guide.step5.gmail.address", languageCode, "Gmail Address: your-email@gmail.com", createdBy);
        createTranslationIfNotExists("mail.guide.step5.app.password", languageCode, "App Password: 16-character generated password", createdBy);
        createTranslationIfNotExists("mail.guide.step5.sender.name", languageCode, "Sender Name: TestCase Manager (or desired name)", createdBy);

        // Requirements list
        createTranslationIfNotExists("mail.guide.requirements.header", languageCode, "📋 Required Prerequisites", createdBy);
        createTranslationIfNotExists("mail.guide.requirements.gmail", languageCode, "Gmail Account (@gmail.com)", createdBy);
        createTranslationIfNotExists("mail.guide.requirements.twoFactor", languageCode, "2-Factor Authentication Enabled", createdBy);
        createTranslationIfNotExists("mail.guide.requirements.appPassword", languageCode, "App Password Generated", createdBy);
        createTranslationIfNotExists("mail.guide.requirements.https", languageCode, "HTTPS Connection", createdBy);

        // Section titles
        createTranslationIfNotExists("mail.guide.sections.stepGuide", languageCode, "🔧 Step-by-Step Setup Method", createdBy);
        createTranslationIfNotExists("mail.guide.sections.troubleshooting", languageCode, "🔍 Troubleshooting", createdBy);
        createTranslationIfNotExists("mail.guide.sections.security", languageCode, "🔒 Security Warnings", createdBy);

        // UserProfile 관련 번역
        createTranslationIfNotExists("profile.title", languageCode, "User Profile", createdBy);
        createTranslationIfNotExists("profile.tabs.basicInfo", languageCode, "Basic Info", createdBy);
        createTranslationIfNotExists("profile.tabs.password", languageCode, "Password", createdBy);
        createTranslationIfNotExists("profile.tabs.language", languageCode, "Language Settings", createdBy);
        createTranslationIfNotExists("profile.tabs.jira", languageCode, "JIRA Settings", createdBy);

        createTranslationIfNotExists("profile.form.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("profile.form.email", languageCode, "Email", createdBy);

        createTranslationIfNotExists("profile.validation.allRequired", languageCode, "Please enter both name and email.", createdBy);
        createTranslationIfNotExists("profile.success.updated", languageCode, "Profile updated successfully.", createdBy);
        createTranslationIfNotExists("profile.error.updateFailed", languageCode, "Failed to update profile.", createdBy);

        // Language settings
        createTranslationIfNotExists("language.settings.title", languageCode, "Language Settings", createdBy);
        createTranslationIfNotExists("language.settings.description", languageCode, "Select your preferred language to display the entire application in that language.", createdBy);
        createTranslationIfNotExists("language.interface", languageCode, "Interface Language", createdBy);
        createTranslationIfNotExists("language.helperText", languageCode, "Language changes are applied immediately and saved automatically.", createdBy);
        createTranslationIfNotExists("language.current", languageCode, "Current Language", createdBy);
        createTranslationIfNotExists("language.korean", languageCode, "Korean", createdBy);
        createTranslationIfNotExists("language.english", languageCode, "English", createdBy);

        // JIRA settings
        createTranslationIfNotExists("jira.settings.title", languageCode, "JIRA Integration Settings", createdBy);
        createTranslationIfNotExists("jira.settings.description", languageCode, "Integrate with JIRA to automatically add test results as comments to issues.", createdBy);
        createTranslationIfNotExists("jira.success.saved", languageCode, "JIRA settings saved successfully.", createdBy);
        createTranslationIfNotExists("jira.success.deleted", languageCode, "JIRA settings deleted successfully.", createdBy);
        createTranslationIfNotExists("jira.error.saveFailed", languageCode, "Failed to save JIRA settings.", createdBy);
        createTranslationIfNotExists("jira.error.deleteFailed", languageCode, "Failed to delete JIRA settings.", createdBy);
        createTranslationIfNotExists("jira.error.network", languageCode, "Please check your network connection.", createdBy);
        createTranslationIfNotExists("jira.error.authentication", languageCode, "Your session has expired. Please log in again.", createdBy);
        createTranslationIfNotExists("jira.error.encryption", languageCode, "Server configuration issue. Please contact administrator.", createdBy);
        createTranslationIfNotExists("jira.confirm.delete", languageCode, "Are you sure you want to delete JIRA settings?", createdBy);
        createTranslationIfNotExists("jira.button.configure", languageCode, "Configure Settings", createdBy);
        createTranslationIfNotExists("jira.button.delete", languageCode, "Delete Settings", createdBy);

        // User Profile - JIRA Settings (profile.jira.*)
        createTranslationIfNotExists("profile.jira.settings.title", languageCode, "JIRA Integration Settings", createdBy);
        createTranslationIfNotExists("profile.jira.settings.description", languageCode, "Integrate with JIRA to automatically add test results as comments to issues.", createdBy);
        createTranslationIfNotExists("profile.jira.button.configure", languageCode, "Configure Settings", createdBy);
        createTranslationIfNotExists("profile.jira.button.delete", languageCode, "Delete Settings", createdBy);
        createTranslationIfNotExists("profile.jira.confirm.delete", languageCode, "Are you sure you want to delete JIRA settings?", createdBy);
        createTranslationIfNotExists("profile.jira.success.saved", languageCode, "JIRA settings saved successfully.", createdBy);
        createTranslationIfNotExists("profile.jira.success.deleted", languageCode, "JIRA settings deleted successfully.", createdBy);
        createTranslationIfNotExists("profile.jira.error.saveFailed", languageCode, "Failed to save JIRA settings.", createdBy);
        createTranslationIfNotExists("profile.jira.error.deleteFailed", languageCode, "Failed to delete JIRA settings.", createdBy);
        createTranslationIfNotExists("profile.jira.error.network", languageCode, "Please check your network connection.", createdBy);
        createTranslationIfNotExists("profile.jira.error.authentication", languageCode, "Your session has expired. Please log in again.", createdBy);
        createTranslationIfNotExists("profile.jira.error.encryption", languageCode, "Server configuration issue. Please contact administrator.", createdBy);

        // JiraStatusIndicator Component
        createTranslationIfNotExists("jira.indicator.checkingStatus", languageCode, "Checking...", createdBy);
        createTranslationIfNotExists("jira.indicator.unknown", languageCode, "Unknown", createdBy);
        createTranslationIfNotExists("jira.indicator.connectionFailed", languageCode, "Connection Failed", createdBy);
        createTranslationIfNotExists("jira.indicator.setupRequired", languageCode, "Please complete the setup to integrate with JIRA.", createdBy);
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
        createTranslationIfNotExists("jira.indicator.connectedMessage", languageCode, "Successfully connected to JIRA server.", createdBy);
        createTranslationIfNotExists("jira.indicator.connectionFailedMessage", languageCode, "Failed to connect to JIRA server.", createdBy);

        // JiraConfigDialog Component
        createTranslationIfNotExists("jira.config.dialogTitle.add", languageCode, "Add JIRA Settings", createdBy);
        createTranslationIfNotExists("jira.config.dialogTitle.edit", languageCode, "Edit JIRA Settings", createdBy);
        createTranslationIfNotExists("jira.config.serverUrl", languageCode, "JIRA Server URL", createdBy);
        createTranslationIfNotExists("jira.config.serverUrlPlaceholder", languageCode, "https://your-domain.atlassian.net", createdBy);
        createTranslationIfNotExists("jira.config.serverUrlHelper", languageCode, "Enter your JIRA server URL (e.g., https://company.atlassian.net)", createdBy);
        createTranslationIfNotExists("jira.config.username", languageCode, "Username (Email)", createdBy);
        createTranslationIfNotExists("jira.config.usernamePlaceholder", languageCode, "user@company.com", createdBy);
        createTranslationIfNotExists("jira.config.usernameHelper", languageCode, "Email address used for JIRA login", createdBy);
        createTranslationIfNotExists("jira.config.apiToken", languageCode, "API Token", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenHelper", languageCode, "Enter your JIRA API token", createdBy);
        createTranslationIfNotExists("jira.config.testProjectKey", languageCode, "Test Project Key (Optional)", createdBy);
        createTranslationIfNotExists("jira.config.testProjectKeyPlaceholder", languageCode, "TEST", createdBy);
        createTranslationIfNotExists("jira.config.testProjectKeyHelper", languageCode, "Project key to use for connection test (optional)", createdBy);
        createTranslationIfNotExists("jira.config.autoTest", languageCode, "Automatically test connection before saving", createdBy);
        createTranslationIfNotExists("jira.config.testButton", languageCode, "Test Connection", createdBy);
        createTranslationIfNotExists("jira.config.testing", languageCode, "Testing...", createdBy);
        createTranslationIfNotExists("jira.config.testSuccess", languageCode, "Connection Successful", createdBy);
        createTranslationIfNotExists("jira.config.testFailed", languageCode, "Connection Failed", createdBy);
        createTranslationIfNotExists("jira.config.jiraVersion", languageCode, "JIRA Version", createdBy);
        createTranslationIfNotExists("jira.config.testTime", languageCode, "Test Time", createdBy);
        createTranslationIfNotExists("jira.config.availableProjects", languageCode, "Available Projects:", createdBy);
        createTranslationIfNotExists("jira.config.moreProjects", languageCode, "{count} more projects", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenGuide", languageCode, "How to generate API token:", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep1", languageCode, "1. JIRA → Profile → Account Settings → Security", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep2", languageCode, "2. Click \"Create API token\"", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep3", languageCode, "3. Enter token name and create", createdBy);
        createTranslationIfNotExists("jira.config.apiTokenStep4", languageCode, "4. Copy the generated token and paste above", createdBy);
        createTranslationIfNotExists("jira.config.cancelButton", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("jira.config.saveButton", languageCode, "Save", createdBy);
        createTranslationIfNotExists("jira.config.saving", languageCode, "Saving...", createdBy);
        createTranslationIfNotExists("jira.config.error.serverUrlRequired", languageCode, "Please enter JIRA server URL", createdBy);
        createTranslationIfNotExists("jira.config.error.invalidUrl", languageCode, "Please enter a valid URL format", createdBy);
        createTranslationIfNotExists("jira.config.error.usernameRequired", languageCode, "Please enter username", createdBy);
        createTranslationIfNotExists("jira.config.error.apiTokenRequired", languageCode, "Please enter API token", createdBy);
        createTranslationIfNotExists("jira.config.error.connectionTestFailed", languageCode, "No response from connection test. Please check server status.", createdBy);
        createTranslationIfNotExists("jira.config.error.testError", languageCode, "An error occurred during connection test", createdBy);
        createTranslationIfNotExists("jira.config.confirm.saveWithoutTest", languageCode, "JIRA connection failed. Do you still want to save?", createdBy);
        createTranslationIfNotExists("jira.config.error.general", languageCode, "An error occurred while saving settings.", createdBy);

        // API response message translations
        createTranslationIfNotExists("jira.api.connectionSuccess", languageCode, "JIRA Connection Successful", createdBy);
        createTranslationIfNotExists("jira.api.authFailure", languageCode, "Authentication failed or insufficient permissions", createdBy);
        createTranslationIfNotExists("jira.api.serverError", languageCode, "JIRA Server Error", createdBy);
        createTranslationIfNotExists("jira.api.networkError", languageCode, "Network Connection Failed", createdBy);
        createTranslationIfNotExists("jira.api.testFailure", languageCode, "Connection Test Failed", createdBy);
        createTranslationIfNotExists("jira.api.unknownError", languageCode, "Unknown Error", createdBy);

        // Password related translations (from AuthKeysInitializer)
        createTranslationIfNotExists("password.requirements.title", languageCode, "Password Requirements:", createdBy);
        createTranslationIfNotExists("password.requirements.length", languageCode, "8-100 characters long", createdBy);
        createTranslationIfNotExists("password.requirements.letter", languageCode, "Contains letters", createdBy);
        createTranslationIfNotExists("password.requirements.digit", languageCode, "Contains numbers", createdBy);
        createTranslationIfNotExists("password.requirements.special", languageCode, "Contains special characters", createdBy);
        createTranslationIfNotExists("password.requirements.combination", languageCode, "At least 2 combinations", createdBy);
        createTranslationIfNotExists("password.success.changed", languageCode, "Password has been successfully changed.", createdBy);
        createTranslationIfNotExists("password.error.changeFailed", languageCode, "An error occurred while changing the password.", createdBy);
        createTranslationIfNotExists("password.validation.newRequired", languageCode, "Please enter a new password", createdBy);
        createTranslationIfNotExists("password.validation.confirmRequired", languageCode, "Please enter password confirmation", createdBy);
        createTranslationIfNotExists("password.validation.sameAsCurrent", languageCode, "New password must be different from current password", createdBy);

        // Common buttons
        createTranslationIfNotExists("button.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("button.save", languageCode, "Save", createdBy);

        // Test Result Export Dialog
        createTranslationIfNotExists("testResult.export.dialog.title", languageCode, "Export Test Results", createdBy);
        createTranslationIfNotExists("testResult.export.section.format", languageCode, "📄 Select Export Format", createdBy);
        createTranslationIfNotExists("testResult.export.section.info", languageCode, "📋 Export Information", createdBy);

        // Excel Format
        createTranslationIfNotExists("testResult.export.format.excel.title", languageCode, "Excel (.xlsx)", createdBy);
        createTranslationIfNotExists("testResult.export.format.excel.description", languageCode, "Includes formatting and charts, optimal for business reports", createdBy);
        createTranslationIfNotExists("testResult.export.format.excel.feature1", languageCode, "Statistical charts included", createdBy);
        createTranslationIfNotExists("testResult.export.format.excel.feature2", languageCode, "Formatting preserved", createdBy);
        createTranslationIfNotExists("testResult.export.format.excel.feature3", languageCode, "Filtering enabled", createdBy);
        createTranslationIfNotExists("testResult.export.format.excel.alert", languageCode, "💡 Excel format includes statistical charts and summary sheets separately.", createdBy);

        // PDF Format
        createTranslationIfNotExists("testResult.export.format.pdf.title", languageCode, "PDF (.pdf)", createdBy);
        createTranslationIfNotExists("testResult.export.format.pdf.description", languageCode, "For printing and sharing, fixed layout", createdBy);
        createTranslationIfNotExists("testResult.export.format.pdf.feature1", languageCode, "Print optimized", createdBy);
        createTranslationIfNotExists("testResult.export.format.pdf.feature2", languageCode, "Fixed layout", createdBy);
        createTranslationIfNotExists("testResult.export.format.pdf.feature3", languageCode, "Universal compatibility", createdBy);
        createTranslationIfNotExists("testResult.export.format.pdf.alert", languageCode, "🖨️ PDF is optimized for A4 paper and great for printing.", createdBy);

        // CSV Format
        createTranslationIfNotExists("testResult.export.format.csv.title", languageCode, "CSV (.csv)", createdBy);
        createTranslationIfNotExists("testResult.export.format.csv.description", languageCode, "For data analysis, lightweight file size", createdBy);
        createTranslationIfNotExists("testResult.export.format.csv.feature1", languageCode, "Data analysis optimized", createdBy);
        createTranslationIfNotExists("testResult.export.format.csv.feature2", languageCode, "Lightweight size", createdBy);
        createTranslationIfNotExists("testResult.export.format.csv.feature3", languageCode, "Excellent compatibility", createdBy);
        createTranslationIfNotExists("testResult.export.format.csv.alert", languageCode, "📈 CSV contains data only; open with Excel or Google Sheets.", createdBy);

        // Export Information
        createTranslationIfNotExists("testResult.export.info.totalRows", languageCode, "📊 Total Data Count:", createdBy);
        createTranslationIfNotExists("testResult.export.info.totalRowsValue", languageCode, "{count} rows", createdBy);
        createTranslationIfNotExists("testResult.export.info.columns", languageCode, "🔍 Visible Columns:", createdBy);
        createTranslationIfNotExists("testResult.export.info.columnsValue", languageCode, "{count} columns", createdBy);
        createTranslationIfNotExists("testResult.export.info.columnsList", languageCode, "📂 Columns to Export:", createdBy);

        // Export Progress and Buttons
        createTranslationIfNotExists("testResult.export.progress.message", languageCode, "Generating file... Please wait", createdBy);
        createTranslationIfNotExists("testResult.export.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testResult.export.button.export", languageCode, "Export {format}", createdBy);
        createTranslationIfNotExists("testResult.export.button.exporting", languageCode, "Generating...", createdBy);

        // Export Error Messages
        createTranslationIfNotExists("testResult.export.error.noProject", languageCode, "No project selected.", createdBy);
        createTranslationIfNotExists("testResult.export.error.failed", languageCode, "An error occurred while exporting the file: {message}", createdBy);
        createTranslationIfNotExists("testResult.export.error.response", languageCode, "Export failed: {status} {statusText}", createdBy);

        // User Management Roles and Statuses
        createTranslationIfNotExists("user.role.admin", languageCode, "System Admin", createdBy);
        createTranslationIfNotExists("user.role.manager", languageCode, "Project Manager", createdBy);
        createTranslationIfNotExists("user.role.tester", languageCode, "Tester", createdBy);
        createTranslationIfNotExists("user.role.user", languageCode, "User", createdBy);
        createTranslationIfNotExists("user.role.admin.description", languageCode, "Access to all system functions", createdBy);
        createTranslationIfNotExists("user.role.manager.description", languageCode, "Project management and team leadership", createdBy);
        createTranslationIfNotExists("user.role.tester.description", languageCode, "Test case creation and execution", createdBy);
        createTranslationIfNotExists("user.role.user.description", languageCode, "Basic system usage", createdBy);
        createTranslationIfNotExists("user.status.active", languageCode, "Active", createdBy);
        createTranslationIfNotExists("user.status.inactive", languageCode, "Inactive", createdBy);

        // Password Change Dialog
        createTranslationIfNotExists("userDetail.password.title", languageCode, "Change Password (Admin)", createdBy);
        createTranslationIfNotExists("userDetail.password.targetUser", languageCode, "Target User:", createdBy);
        createTranslationIfNotExists("userDetail.password.skipCurrent", languageCode, "Skip current password confirmation (Admin privilege)", createdBy);
        createTranslationIfNotExists("userDetail.password.current", languageCode, "Current Password", createdBy);
        createTranslationIfNotExists("userDetail.password.new", languageCode, "New Password", createdBy);
        createTranslationIfNotExists("userDetail.password.confirm", languageCode, "Confirm New Password", createdBy);
        createTranslationIfNotExists("userDetail.password.requirements.title", languageCode, "Password Requirements:", createdBy);
        createTranslationIfNotExists("userDetail.password.requirements.length", languageCode, "8-100 characters long", createdBy);
        createTranslationIfNotExists("userDetail.password.requirements.complexity", languageCode, "Must include at least 2 of the following: letters, numbers, special characters", createdBy);
        createTranslationIfNotExists("userDetail.password.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("userDetail.password.button.changing", languageCode, "Changing...", createdBy);
        createTranslationIfNotExists("userDetail.password.button.change", languageCode, "Change Password", createdBy);
        createTranslationIfNotExists("userDetail.password.validation.minLength", languageCode, "Must be at least 8 characters long", createdBy);
        createTranslationIfNotExists("userDetail.password.validation.maxLength", languageCode, "Cannot exceed 100 characters", createdBy);
        createTranslationIfNotExists("userDetail.password.validation.complexity", languageCode, "Must include at least 2 of: letters, numbers, special characters", createdBy);
        createTranslationIfNotExists("userDetail.password.validation.mismatch", languageCode, "Does not match the new password", createdBy);
        createTranslationIfNotExists("userDetail.password.validation.currentRequired", languageCode, "Please enter the current password", createdBy);
        createTranslationIfNotExists("userDetail.password.validation.newRequired", languageCode, "Please enter a new password", createdBy);
        createTranslationIfNotExists("userDetail.password.validation.confirmRequired", languageCode, "Please enter the password confirmation", createdBy);
        createTranslationIfNotExists("userDetail.password.success", languageCode, "Password for {userName} has been changed successfully.", createdBy);
        createTranslationIfNotExists("userDetail.password.error", languageCode, "An error occurred while changing the password.", createdBy);

        // User Activity Status
        createTranslationIfNotExists("userDetail.activity.active", languageCode, "Active Recently", createdBy);
        createTranslationIfNotExists("userDetail.activity.recent", languageCode, "Active within a week", createdBy);
        createTranslationIfNotExists("userDetail.activity.moderate", languageCode, "Active within a month", createdBy);
        createTranslationIfNotExists("userDetail.activity.inactive", languageCode, "Inactive for a long time", createdBy);
        createTranslationIfNotExists("userDetail.activity.unknown", languageCode, "Unknown", createdBy);

        // Column Order Dialog
        createTranslationIfNotExists("testResult.orderDialog.title", languageCode, "Change Column Order", createdBy);
        createTranslationIfNotExists("testResult.orderDialog.description", languageCode, "Use the up/down arrow buttons to change the column order", createdBy);
        createTranslationIfNotExists("testResult.orderDialog.visible", languageCode, "Visible", createdBy);
        createTranslationIfNotExists("testResult.orderDialog.hidden", languageCode, "Hidden", createdBy);
        createTranslationIfNotExists("testResult.orderDialog.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testResult.orderDialog.apply", languageCode, "Apply Order", createdBy);

        // 누락된 번역 키들 추가
        createTranslationIfNotExists("testResult.message.error", languageCode, "An error occurred", createdBy);
        createTranslationIfNotExists("testResult.message.deleteFailed", languageCode, "Failed to delete", createdBy);
        createTranslationIfNotExists("jira.error.saveFailed", languageCode, "Failed to save", createdBy);
        createTranslationIfNotExists("jira.error.deleteFailed", languageCode, "Failed to delete", createdBy);
        createTranslationIfNotExists("jira.error.network", languageCode, "Network connection error", createdBy);
        createTranslationIfNotExists("jira.error.authentication", languageCode, "Authentication failed", createdBy);
        createTranslationIfNotExists("jira.error.encryption", languageCode, "Encryption processing error", createdBy);

        // 패스워드 관련 누락된 번역 키들 추가 (영어)
        createTranslationIfNotExists("password.validation.minLength", languageCode, "Must be at least 8 characters long", createdBy);
        createTranslationIfNotExists("password.validation.maxLength", languageCode, "Cannot exceed 100 characters", createdBy);
        createTranslationIfNotExists("password.validation.complexity", languageCode, "Must include at least 2 of: letters, numbers, special characters", createdBy);
        createTranslationIfNotExists("password.validation.mismatch", languageCode, "Does not match the new password", createdBy);
        createTranslationIfNotExists("password.validation.currentRequired", languageCode, "Please enter the current password", createdBy);
        createTranslationIfNotExists("password.change.title", languageCode, "Change Password", createdBy);
        createTranslationIfNotExists("password.change.description", languageCode, "Please change your password regularly for security.", createdBy);
        createTranslationIfNotExists("password.form.current", languageCode, "Current Password", createdBy);
        createTranslationIfNotExists("password.form.new", languageCode, "New Password", createdBy);
        createTranslationIfNotExists("password.form.confirm", languageCode, "Confirm New Password", createdBy);
        createTranslationIfNotExists("password.placeholder.current", languageCode, "Enter your current password", createdBy);
        createTranslationIfNotExists("password.placeholder.new", languageCode, "Enter new password (8+ characters)", createdBy);
        createTranslationIfNotExists("password.placeholder.confirm", languageCode, "Re-enter new password", createdBy);
        createTranslationIfNotExists("password.button.change", languageCode, "Change Password", createdBy);
        createTranslationIfNotExists("password.button.changing", languageCode, "Changing...", createdBy);

        // 사용자 프로필 다이얼로그 관련 (영어)
        createTranslationIfNotExists("profile.title", languageCode, "User Profile", createdBy);
        createTranslationIfNotExists("profile.tabs.basicInfo", languageCode, "Basic Info", createdBy);
        createTranslationIfNotExists("profile.tabs.password", languageCode, "Password", createdBy);
        createTranslationIfNotExists("profile.tabs.language", languageCode, "Language", createdBy);
        createTranslationIfNotExists("profile.tabs.jira", languageCode, "JIRA Settings", createdBy);
        createTranslationIfNotExists("profile.form.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("profile.form.email", languageCode, "Email", createdBy);
        createTranslationIfNotExists("profile.success.updated", languageCode, "Profile updated successfully.", createdBy);
        createTranslationIfNotExists("profile.error.updateFailed", languageCode, "Failed to update profile.", createdBy);

        // 공통 버튼 (영어)
        createTranslationIfNotExists("button.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("button.save", languageCode, "Save", createdBy);

        // 기타 누락된 번역 키들 추가 (영어)
        createTranslationIfNotExists("profile.validation.allRequired", languageCode, "Please enter both name and email.", createdBy);
        createTranslationIfNotExists("userProfile.edit.title", languageCode, "Edit Profile", createdBy);
        createTranslationIfNotExists("userProfile.edit.description", languageCode, "You can update your profile information.", createdBy);

        // Common 영역 누락된 번역 키들 추가 (영어 - 네 번째 그룹 10개)
        createTranslationIfNotExists("common.unauthorized.title", languageCode, "Login Required", createdBy);
        createTranslationIfNotExists("common.unauthorized.message", languageCode, "You need to login to access this page.", createdBy);
        createTranslationIfNotExists("common.unauthorized.redirecting", languageCode, "Redirecting to login page...", createdBy);
        createTranslationIfNotExists("common.loading.text", languageCode, "Loading...", createdBy);
        createTranslationIfNotExists("common.error.networkError", languageCode, "A network error occurred.", createdBy);
        createTranslationIfNotExists("common.error.serverError", languageCode, "A server error occurred.", createdBy);
        createTranslationIfNotExists("common.error.unknownError", languageCode, "An unknown error occurred.", createdBy);
        createTranslationIfNotExists("common.success.saved", languageCode, "Successfully saved.", createdBy);
        createTranslationIfNotExists("common.success.deleted", languageCode, "Successfully deleted.", createdBy);
        createTranslationIfNotExists("common.confirm.delete", languageCode, "Are you sure you want to delete this?", createdBy);

        // 추가 누락된 번역 키들 추가 (영어 - 다섯 번째 그룹 10개)
        createTranslationIfNotExists("project.messages.noParticipatingProjects", languageCode, "No participating projects", createdBy);
        createTranslationIfNotExists("project.messages.needInvitation", languageCode, "You need an invitation to participate in projects.", createdBy);
        createTranslationIfNotExists("project.messages.requestInvitation", languageCode, "Please request an invitation from the project manager.", createdBy);
        createTranslationIfNotExists("common.unauthorized.backToProjects", languageCode, "Back to Project Selection", createdBy);
        createTranslationIfNotExists("common.buttons.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("common.status.loading", languageCode, "Loading...", createdBy);
        createTranslationIfNotExists("common.status.error", languageCode, "Error Occurred", createdBy);
        createTranslationIfNotExists("common.actions.view", languageCode, "View", createdBy);
        createTranslationIfNotExists("common.actions.download", languageCode, "Download", createdBy);
        createTranslationIfNotExists("common.validation.required", languageCode, "This field is required", createdBy);

        // UserDetail 관련 누락된 번역 키들 추가 (영어 - 여섯 번째 그룹 10개)
        createTranslationIfNotExists("userDetail.status.active", languageCode, "Active", createdBy);
        createTranslationIfNotExists("userDetail.status.inactive", languageCode, "Inactive", createdBy);
        createTranslationIfNotExists("userDetail.tooltip.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("userDetail.tooltip.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("userDetail.tooltip.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("userDetail.tooltip.passwordChange", languageCode, "Change Password", createdBy);
        createTranslationIfNotExists("userDetail.form.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("userDetail.form.email", languageCode, "Email", createdBy);
        createTranslationIfNotExists("userDetail.form.role", languageCode, "Role", createdBy);
        createTranslationIfNotExists("userDetail.form.accountActive", languageCode, "Account Active", createdBy);

        // 프로젝트 다이얼로그 관련 누락된 번역 키들 추가 (영어 - 일곱 번째 그룹 10개)
        createTranslationIfNotExists("project.dialog.transferTitle", languageCode, "Project Organization Transfer", createdBy);
        createTranslationIfNotExists("project.dialog.transferDescription", languageCode, "You can transfer '<strong>{projectName}</strong>' project to another organization or make it an independent project.", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteTitle", languageCode, "Confirm Force Delete Project", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteConfirm", languageCode, "Are you sure you want to force delete '<strong>{projectName}</strong>' project?", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteWarningTitle", languageCode, "⚠️ Force Delete Warning", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteWarningMessage", languageCode, "All associated test plans, test cases, and execution history will be deleted together! This action cannot be undone.", createdBy);
        createTranslationIfNotExists("project.dialog.deleteConfirm", languageCode, "Are you sure you want to delete '<strong>{projectName}</strong>' project?", createdBy);
        createTranslationIfNotExists("project.dialog.deleteWarningMessage", languageCode, "This action cannot be undone. All test cases and data belonging to this project will also be deleted.", createdBy);
        createTranslationIfNotExists("testResult.dialog.attachmentsTitle", languageCode, "Test Result Attachments", createdBy);
        createTranslationIfNotExists("mail.guide.dialog.title", languageCode, "Gmail App Password Setup Guide", createdBy);

        // 메일 가이드 섹션 관련 누락된 번역 키들 추가 (영어 - 여덟 번째 그룹 10개)
        createTranslationIfNotExists("mail.guide.requirements.header", languageCode, "📋 Required Prerequisites", createdBy);
        createTranslationIfNotExists("mail.guide.sections.stepGuide", languageCode, "🔧 Step-by-Step Setup Method", createdBy);
        createTranslationIfNotExists("mail.guide.sections.troubleshooting", languageCode, "🔍 Troubleshooting", createdBy);
        createTranslationIfNotExists("mail.guide.sections.security", languageCode, "🔒 Security Warnings", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.button", languageCode, "Button", createdBy);
        createTranslationIfNotExists("attachments.button.download", languageCode, "Download", createdBy);
        createTranslationIfNotExists("attachments.button.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("testcase.tree.button.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("testcase.tree.button.saveOrder", languageCode, "Save Order", createdBy);
        createTranslationIfNotExists("testcase.tree.button.editOrder", languageCode, "Edit Order", createdBy);

        // 프로젝트 툴팁 관련 누락된 번역 키들 추가 (영어 - 아홉 번째 그룹 10개)
        createTranslationIfNotExists("project.tooltips.testCaseCount", languageCode, "Test Case Count", createdBy);
        createTranslationIfNotExists("project.tooltips.memberCount", languageCode, "Member Count", createdBy);
        createTranslationIfNotExists("project.tooltips.automationTestCount", languageCode, "Automation Test Result Count", createdBy);
        createTranslationIfNotExists("project.tooltips.junitStatus", languageCode, "Automation Test Status", createdBy);
        createTranslationIfNotExists("testcase.validation.stepRequired", languageCode, "Please enter step content.", createdBy);
        createTranslationIfNotExists("testcase.form.stepNumber", languageCode, "No.", createdBy);
        createTranslationIfNotExists("testcase.form.step", languageCode, "Step", createdBy);
        createTranslationIfNotExists("testcase.form.stepDescription", languageCode, "Step Description", createdBy);
        createTranslationIfNotExists("recentResults.button.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("userList.button.refresh", languageCode, "Refresh", createdBy);

        // 사용자 리스트 및 기타 누락된 번역 키들 추가 (영어 - 열 번째 그룹 10개)
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

        // 폼 설명, 가이드 및 플레이스홀더 관련 번역 키들 추가 (영어 - 열한 번째 그룹 10개)
        createTranslationIfNotExists("organization.form.descriptionPlaceholder", languageCode, "Enter organization description", createdBy);
        createTranslationIfNotExists("junit.placeholder.executionName", languageCode, "Enter execution name", createdBy);

        // Missing placeholder translation keys
        createTranslationIfNotExists("junit.editor.userDescriptionPlaceholder", languageCode, "Enter a detailed description for this test case...", createdBy);
        createTranslationIfNotExists("testcase.advancedFilter.searchPlaceholder", languageCode, "Search test case name, description, step content...", createdBy);
        createTranslationIfNotExists("testResult.detailReport.searchPlaceholder", languageCode, "Test case name, folder path, executor, etc.", createdBy);
        createTranslationIfNotExists("preset.name.placeholder", languageCode, "Example: My Test Cases", createdBy);

        createTranslationIfNotExists("testExecution.guide.title", languageCode, "Test Execution Guide", createdBy);
        createTranslationIfNotExists("testExecution.guide.hideGuide", languageCode, "Hide Guide", createdBy);
        createTranslationIfNotExists("testExecution.guide.showGuide", languageCode, "Show Guide", createdBy);
        createTranslationIfNotExists("testExecution.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionLabel", languageCode, "Description", createdBy);
        createTranslationIfNotExists("translation.keyDialog.descriptionHelper", languageCode, "Enter description for the translation key", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testExecution.guide.step1.title", languageCode, "Step 1: Select Test Plan", createdBy);

        // 테스트 실행 가이드 단계별 상세 내용 번역 키들 추가 (영어 - 열두 번째 그룹 10개)
        createTranslationIfNotExists("testExecution.guide.step2.title", languageCode, "Step 2: Enter Execution Info", createdBy);
        createTranslationIfNotExists("testExecution.guide.step2.description", languageCode, "Enter basic information such as test execution name, description, and assignee", createdBy);
        createTranslationIfNotExists("testExecution.guide.step3.title", languageCode, "Step 3: Review Test Cases", createdBy);
        createTranslationIfNotExists("testExecution.guide.step3.description", languageCode, "Review the test cases in the selected test plan and adjust execution order if needed", createdBy);
        createTranslationIfNotExists("testExecution.guide.step4.title", languageCode, "Step 4: Start Execution", createdBy);
        createTranslationIfNotExists("testExecution.guide.step4.description", languageCode, "After confirming all information, start the test execution", createdBy);
        createTranslationIfNotExists("testExecution.guide.step5.title", languageCode, "Step 5: Enter Results", createdBy);
        createTranslationIfNotExists("testExecution.guide.step5.description", languageCode, "Enter execution results for each test case", createdBy);
        createTranslationIfNotExists("testExecution.guide.step6.title", languageCode, "Step 6: Complete Execution", createdBy);
        createTranslationIfNotExists("testExecution.guide.step6.description", languageCode, "Complete the entire execution when all test cases are finished", createdBy);

        // 대량 번역 키 추가 (영어 - 13-17번째 그룹, 총 50개)
        // 13번째 그룹 - 공통 UI 요소들
        createTranslationIfNotExists("common.unauthorized.title", languageCode, "Unauthorized", createdBy);
        createTranslationIfNotExists("common.unauthorized.message", languageCode, "You do not have permission to access this page", createdBy);
        createTranslationIfNotExists("common.loading", languageCode, "Loading...", createdBy);
        createTranslationIfNotExists("common.all", languageCode, "All", createdBy);
        createTranslationIfNotExists("common.status", languageCode, "Status", createdBy);
        createTranslationIfNotExists("testResult.form.title", languageCode, "Test Result Input", createdBy);
        createTranslationIfNotExists("organization.dashboard.title", languageCode, "Organization Dashboard", createdBy);
        createTranslationIfNotExists("organization.management.title", languageCode, "Organization Management", createdBy);
        createTranslationIfNotExists("organization.dialog.edit.title", languageCode, "Edit Organization", createdBy);
        createTranslationIfNotExists("organization.dialog.create.title", languageCode, "Create Organization", createdBy);

        // 14번째 그룹 - 조직 관련 폼과 다이얼로그
        createTranslationIfNotExists("organization.form.name", languageCode, "Organization Name", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.title", languageCode, "Delete Organization", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.message", languageCode, "Are you sure you want to delete this organization?", createdBy);
        createTranslationIfNotExists("organization.dialog.invite.title", languageCode, "Invite Member", createdBy);
        createTranslationIfNotExists("organization.dialog.createProject.title", languageCode, "Create Project", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.message", languageCode, "Message", createdBy);
        createTranslationIfNotExists("translation.keyTab.table.category", languageCode, "Category", createdBy);
        createTranslationIfNotExists("translation.languageTab.table.name", languageCode, "Language Name", createdBy);
        createTranslationIfNotExists("translation.translationTab.table.value", languageCode, "Translation Value", createdBy);
        createTranslationIfNotExists("translation.statisticsTab.title", languageCode, "Translation Statistics", createdBy);

        // 15번째 그룹 - JUnit 및 테스트 관련
        createTranslationIfNotExists("junit.dashboard.title", languageCode, "JUnit Dashboard", createdBy);
        createTranslationIfNotExists("junit.table.status", languageCode, "Status", createdBy);
        createTranslationIfNotExists("junit.upload.dialog.title", languageCode, "Upload JUnit Results", createdBy);
        createTranslationIfNotExists("translation.management.title", languageCode, "Translation Management", createdBy);
        createTranslationIfNotExists("testCaseResult.page.title", languageCode, "Test Case Results", createdBy);
        createTranslationIfNotExists("testExecution.list.title", languageCode, "Test Execution List", createdBy);
        createTranslationIfNotExists("testExecution.list.delete.title", languageCode, "Delete Test Execution", createdBy);
        createTranslationIfNotExists("dashboard.title", languageCode, "Dashboard", createdBy);
        createTranslationIfNotExists("dashboard.noData.message", languageCode, "No data to display", createdBy);
        createTranslationIfNotExists("testResult.pieChart.title", languageCode, "Test Result Pie Chart", createdBy);

        // 16번째 그룹 - 에러 메시지와 상태
        createTranslationIfNotExists("testResult.error.testCaseLoadFailed", languageCode, "Failed to load test cases", createdBy);
        createTranslationIfNotExists("testResult.error.saveFailed", languageCode, "Save failed", createdBy);
        createTranslationIfNotExists("testResult.error.resultRequired", languageCode, "Test result is required", createdBy);
        createTranslationIfNotExists("junit.error.loadFailed", languageCode, "Failed to load JUnit results", createdBy);
        createTranslationIfNotExists("dashboard.error.retry", languageCode, "Retry", createdBy);
        createTranslationIfNotExists("dashboard.error.goToLogin", languageCode, "Go to Login", createdBy);
        createTranslationIfNotExists("dashboard.error.details", languageCode, "Details", createdBy);
        createTranslationIfNotExists("junit.stats.error", languageCode, "Error", createdBy);
        createTranslationIfNotExists("junit.stats.errorTests", languageCode, "Error Tests", createdBy);
        createTranslationIfNotExists("junit.stats.successRate", languageCode, "Success Rate", createdBy);

        // 17번째 그룹 - 번역 관리 카테고리와 기타
        createTranslationIfNotExists("translation.keyDialog.category.error", languageCode, "Error", createdBy);
        createTranslationIfNotExists("translation.keyDialog.category.success", languageCode, "Success", createdBy);
        createTranslationIfNotExists("junit.stats.failed", languageCode, "Failed", createdBy);
        createTranslationIfNotExists("testResult.pieChart.loading", languageCode, "Loading chart...", createdBy);
        createTranslationIfNotExists("testResult.pieChart.noData", languageCode, "No chart data", createdBy);
        createTranslationIfNotExists("testResult.pieChart.count", languageCode, "Count", createdBy);
        createTranslationIfNotExists("testResult.pieChart.percentage", languageCode, "Percentage", createdBy);
        createTranslationIfNotExists("testResult.pieChart.totalTestCases", languageCode, "Total Test Cases", createdBy);
        createTranslationIfNotExists("testResult.statistics.noData", languageCode, "No statistics data", createdBy);
        createTranslationIfNotExists("testResult.statistics.totalCount", languageCode, "Total Count", createdBy);

        // 대량 번역 키 추가 2차 (영어 - 18-22번째 그룹, 총 50개)
        // 18번째 그룹 - 테스트 결과 폼 관련
        createTranslationIfNotExists("testResult.form.preCondition", languageCode, "Pre-condition", createdBy);
        createTranslationIfNotExists("testResult.form.testSteps", languageCode, "Test Steps", createdBy);
        createTranslationIfNotExists("testResult.form.expectedResult", languageCode, "Expected Result", createdBy);
        createTranslationIfNotExists("testResult.form.testResult", languageCode, "Test Result", createdBy);
        createTranslationIfNotExists("testResult.form.notesLimitError", languageCode, "Notes must be within 10,000 characters", createdBy);
        createTranslationIfNotExists("testResult.form.notesHelp", languageCode, "Enter any special notes or additional information during test execution", createdBy);
        createTranslationIfNotExists("testResult.form.fileAttachment", languageCode, "File Attachment", createdBy);
        createTranslationIfNotExists("testResult.form.fileUploading", languageCode, "Uploading file...", createdBy);
        createTranslationIfNotExists("testResult.form.fileSelect", languageCode, "Select File", createdBy);
        createTranslationIfNotExists("testResult.form.jiraIntegration", languageCode, "JIRA Integration", createdBy);

        // 19번째 그룹 - JIRA 및 조직 관련
        createTranslationIfNotExists("testResult.form.jiraComment", languageCode, "JIRA Comment", createdBy);
        createTranslationIfNotExists("organization.form.nameRequired", languageCode, "Organization name is required", createdBy);
        createTranslationIfNotExists("organization.buttons.createNew", languageCode, "Create New Organization", createdBy);
        createTranslationIfNotExists("organization.buttons.firstOrganization", languageCode, "Create First Organization", createdBy);
        createTranslationIfNotExists("organization.buttons.view", languageCode, "View", createdBy);
        createTranslationIfNotExists("common.buttons.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("common.buttons.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("common.buttons.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("common.buttons.create", languageCode, "Create", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.warning", languageCode, "This action cannot be undone", createdBy);

        // 20번째 그룹 - 조직 세부 정보 및 다이얼로그
        createTranslationIfNotExists("organization.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("organization.detail.members", languageCode, "Members", createdBy);
        createTranslationIfNotExists("organization.detail.projects", languageCode, "Projects", createdBy);
        createTranslationIfNotExists("organization.detail.settings", languageCode, "Settings", createdBy);
        createTranslationIfNotExists("organization.member.role.admin", languageCode, "Admin", createdBy);
        createTranslationIfNotExists("organization.member.role.member", languageCode, "Member", createdBy);
        createTranslationIfNotExists("organization.member.role.viewer", languageCode, "Viewer", createdBy);
        createTranslationIfNotExists("organization.project.status.active", languageCode, "Active", createdBy);
        createTranslationIfNotExists("organization.project.status.inactive", languageCode, "Inactive", createdBy);
        createTranslationIfNotExists("organization.project.status.archived", languageCode, "Archived", createdBy);

        // 21번째 그룹 - 프로젝트 및 테스트 관련
        createTranslationIfNotExists("project.form.name", languageCode, "Project Name", createdBy);
        createTranslationIfNotExists("project.form.description", languageCode, "Project Description", createdBy);
        createTranslationIfNotExists("project.form.startDate", languageCode, "Start Date", createdBy);
        createTranslationIfNotExists("project.form.endDate", languageCode, "End Date", createdBy);
        createTranslationIfNotExists("project.status.planning", languageCode, "Planning", createdBy);
        createTranslationIfNotExists("project.status.inProgress", languageCode, "In Progress", createdBy);
        createTranslationIfNotExists("project.status.completed", languageCode, "Completed", createdBy);
        createTranslationIfNotExists("project.status.onHold", languageCode, "On Hold", createdBy);
        createTranslationIfNotExists("testCase.form.name", languageCode, "Test Case Name", createdBy);
        createTranslationIfNotExists("testCase.form.priority", languageCode, "Priority", createdBy);

        // 22번째 그룹 - 테스트 케이스 및 실행 관련
        createTranslationIfNotExists("testCase.priority.high", languageCode, "High", createdBy);
        createTranslationIfNotExists("testCase.priority.medium", languageCode, "Medium", createdBy);
        createTranslationIfNotExists("testCase.priority.low", languageCode, "Low", createdBy);
        createTranslationIfNotExists("testCase.status.draft", languageCode, "Draft", createdBy);
        createTranslationIfNotExists("testCase.status.review", languageCode, "Under Review", createdBy);
        createTranslationIfNotExists("testCase.status.approved", languageCode, "Approved", createdBy);
        createTranslationIfNotExists("testCase.status.deprecated", languageCode, "Deprecated", createdBy);
        createTranslationIfNotExists("testExecution.status.notStarted", languageCode, "Not Started", createdBy);
        createTranslationIfNotExists("testExecution.status.inProgress", languageCode, "In Progress", createdBy);
        createTranslationIfNotExists("testExecution.status.completed", languageCode, "Completed", createdBy);

        // 3차 대량 번역 키 추가 (영어 - 23-32번째 그룹, 총 100개)
        // 23번째 그룹 - 대시보드 차트 및 통계
        createTranslationIfNotExists("dashboard.chart.pieChart.title", languageCode, "Test Result Pie Chart", createdBy);
        createTranslationIfNotExists("dashboard.chart.pieChart.passed", languageCode, "Passed", createdBy);
        createTranslationIfNotExists("dashboard.chart.pieChart.failed", languageCode, "Failed", createdBy);
        createTranslationIfNotExists("dashboard.chart.pieChart.blocked", languageCode, "Blocked", createdBy);
        createTranslationIfNotExists("dashboard.chart.pieChart.notRun", languageCode, "Not Run", createdBy);
        createTranslationIfNotExists("dashboard.chart.barChart.title", languageCode, "Monthly Test Execution Trend", createdBy);
        createTranslationIfNotExists("dashboard.chart.lineChart.title", languageCode, "Quality Trend", createdBy);
        createTranslationIfNotExists("dashboard.chart.lineChart.passRate", languageCode, "Pass Rate", createdBy);
        createTranslationIfNotExists("dashboard.chart.lineChart.failRate", languageCode, "Fail Rate", createdBy);
        createTranslationIfNotExists("dashboard.chart.donutChart.title", languageCode, "Test Case Distribution by Priority", createdBy);

        // 24번째 그룹 - 대시보드 메트릭 및 위젯
        createTranslationIfNotExists("dashboard.metrics.totalTestCases", languageCode, "Total Test Cases", createdBy);
        createTranslationIfNotExists("dashboard.metrics.executedTests", languageCode, "Executed Tests", createdBy);
        createTranslationIfNotExists("dashboard.metrics.passedTests", languageCode, "Passed Tests", createdBy);
        createTranslationIfNotExists("dashboard.metrics.failedTests", languageCode, "Failed Tests", createdBy);
        createTranslationIfNotExists("dashboard.metrics.passRate", languageCode, "Pass Rate", createdBy);
        createTranslationIfNotExists("dashboard.widget.recentActivity", languageCode, "Recent Activity", createdBy);
        createTranslationIfNotExists("dashboard.widget.upcomingTests", languageCode, "Upcoming Tests", createdBy);
        createTranslationIfNotExists("dashboard.widget.criticalIssues", languageCode, "Critical Issues", createdBy);
        createTranslationIfNotExists("dashboard.widget.teamPerformance", languageCode, "Team Performance", createdBy);
        createTranslationIfNotExists("dashboard.widget.projectStatus", languageCode, "Project Status", createdBy);

        // 25번째 그룹 - 테이블 관리 및 정렬
        createTranslationIfNotExists("table.column.sortAscending", languageCode, "Sort Ascending", createdBy);
        createTranslationIfNotExists("table.column.sortDescending", languageCode, "Sort Descending", createdBy);
        createTranslationIfNotExists("table.column.filter", languageCode, "Filter Column", createdBy);
        createTranslationIfNotExists("table.column.hide", languageCode, "Hide Column", createdBy);
        createTranslationIfNotExists("table.column.show", languageCode, "Show Column", createdBy);
        createTranslationIfNotExists("table.pagination.first", languageCode, "First Page", createdBy);
        createTranslationIfNotExists("table.pagination.previous", languageCode, "Previous Page", createdBy);
        createTranslationIfNotExists("table.pagination.next", languageCode, "Next Page", createdBy);
        createTranslationIfNotExists("table.pagination.last", languageCode, "Last Page", createdBy);
        createTranslationIfNotExists("table.pagination.info", languageCode, "Showing {from} to {to} of {total} entries", createdBy);

        // 26번째 그룹 - 검색 및 필터링
        createTranslationIfNotExists("search.placeholder.global", languageCode, "Search all content...", createdBy);
        createTranslationIfNotExists("search.placeholder.testCase", languageCode, "Search test cases...", createdBy);
        createTranslationIfNotExists("search.placeholder.project", languageCode, "Search projects...", createdBy);
        createTranslationIfNotExists("search.placeholder.user", languageCode, "Search users...", createdBy);
        createTranslationIfNotExists("search.filter.status", languageCode, "Filter by Status", createdBy);
        createTranslationIfNotExists("search.filter.priority", languageCode, "Filter by Priority", createdBy);
        createTranslationIfNotExists("search.filter.assignee", languageCode, "Filter by Assignee", createdBy);
        createTranslationIfNotExists("search.filter.dateRange", languageCode, "Filter by Date Range", createdBy);
        createTranslationIfNotExists("search.results.found", languageCode, "{count} results found", createdBy);
        createTranslationIfNotExists("search.results.noResults", languageCode, "No results found for your search", createdBy);

        // 27번째 그룹 - 내보내기 및 보고서
        createTranslationIfNotExists("export.format.pdf", languageCode, "Export to PDF", createdBy);
        createTranslationIfNotExists("export.format.excel", languageCode, "Export to Excel", createdBy);
        createTranslationIfNotExists("export.format.csv", languageCode, "Export to CSV", createdBy);
        createTranslationIfNotExists("export.format.json", languageCode, "Export to JSON", createdBy);
        createTranslationIfNotExists("export.options.includeAttachments", languageCode, "Include Attachments", createdBy);
        createTranslationIfNotExists("export.options.includeHistory", languageCode, "Include History", createdBy);
        createTranslationIfNotExists("export.progress.preparing", languageCode, "Preparing export...", createdBy);
        createTranslationIfNotExists("export.progress.generating", languageCode, "Generating file...", createdBy);
        createTranslationIfNotExists("export.success.message", languageCode, "Export completed successfully", createdBy);
        createTranslationIfNotExists("export.error.message", languageCode, "Export failed. Please try again.", createdBy);

        // 28번째 그룹 - 알림 및 메시징
        createTranslationIfNotExists("notification.type.info", languageCode, "Information", createdBy);
        createTranslationIfNotExists("notification.type.success", languageCode, "Success", createdBy);
        createTranslationIfNotExists("notification.type.warning", languageCode, "Warning", createdBy);
        createTranslationIfNotExists("notification.type.error", languageCode, "Error", createdBy);
        createTranslationIfNotExists("notification.email.testResult", languageCode, "Test Result Notification", createdBy);
        createTranslationIfNotExists("notification.email.projectUpdate", languageCode, "Project Update Notification", createdBy);
        createTranslationIfNotExists("notification.settings.enable", languageCode, "Enable Notifications", createdBy);
        createTranslationIfNotExists("notification.settings.disable", languageCode, "Disable Notifications", createdBy);
        createTranslationIfNotExists("notification.markAsRead", languageCode, "Mark as Read", createdBy);
        createTranslationIfNotExists("notification.clearAll", languageCode, "Clear All Notifications", createdBy);

        // 29번째 그룹 - 워크플로우 및 상태 관리
        createTranslationIfNotExists("workflow.status.pending", languageCode, "Pending", createdBy);
        createTranslationIfNotExists("workflow.status.approved", languageCode, "Approved", createdBy);
        createTranslationIfNotExists("workflow.status.rejected", languageCode, "Rejected", createdBy);
        createTranslationIfNotExists("workflow.status.inReview", languageCode, "In Review", createdBy);
        createTranslationIfNotExists("workflow.action.approve", languageCode, "Approve", createdBy);
        createTranslationIfNotExists("workflow.action.reject", languageCode, "Reject", createdBy);
        createTranslationIfNotExists("workflow.action.submit", languageCode, "Submit for Review", createdBy);
        createTranslationIfNotExists("workflow.action.withdraw", languageCode, "Withdraw", createdBy);
        createTranslationIfNotExists("workflow.comment.placeholder", languageCode, "Add a comment...", createdBy);
        createTranslationIfNotExists("workflow.history.title", languageCode, "Workflow History", createdBy);

        // 30번째 그룹 - 네비게이션 및 메뉴
        createTranslationIfNotExists("navigation.menu.dashboard", languageCode, "Dashboard", createdBy);
        createTranslationIfNotExists("navigation.menu.projects", languageCode, "Projects", createdBy);
        createTranslationIfNotExists("navigation.menu.testCases", languageCode, "Test Cases", createdBy);
        createTranslationIfNotExists("navigation.menu.testPlans", languageCode, "Test Plans", createdBy);
        createTranslationIfNotExists("navigation.menu.testExecution", languageCode, "Test Execution", createdBy);
        createTranslationIfNotExists("navigation.menu.reports", languageCode, "Reports", createdBy);
        createTranslationIfNotExists("navigation.menu.administration", languageCode, "Administration", createdBy);
        createTranslationIfNotExists("navigation.breadcrumb.home", languageCode, "Home", createdBy);
        createTranslationIfNotExists("navigation.breadcrumb.separator", languageCode, "/", createdBy);
        createTranslationIfNotExists("navigation.back.button", languageCode, "Back", createdBy);

        // 31번째 그룹 - 사용자 액션 및 권한
        createTranslationIfNotExists("action.permission.view", languageCode, "View Permission", createdBy);
        createTranslationIfNotExists("action.permission.edit", languageCode, "Edit Permission", createdBy);
        createTranslationIfNotExists("action.permission.delete", languageCode, "Delete Permission", createdBy);
        createTranslationIfNotExists("action.permission.admin", languageCode, "Admin Permission", createdBy);
        createTranslationIfNotExists("action.user.login", languageCode, "Log In", createdBy);
        createTranslationIfNotExists("action.user.logout", languageCode, "Log Out", createdBy);
        createTranslationIfNotExists("action.user.profile", languageCode, "View Profile", createdBy);
        createTranslationIfNotExists("action.user.changePassword", languageCode, "Change Password", createdBy);
        createTranslationIfNotExists("action.user.preferences", languageCode, "User Preferences", createdBy);
        createTranslationIfNotExists("action.user.activity", languageCode, "User Activity", createdBy);

        // 32번째 그룹 - 검증 및 알림 메시지
        createTranslationIfNotExists("validation.password.complexity", languageCode, "Password must contain letters, numbers, and special characters", createdBy);
        createTranslationIfNotExists("validation.confirm.password", languageCode, "Passwords do not match", createdBy);
        createTranslationIfNotExists("validation.date.invalid", languageCode, "Invalid date format", createdBy);
        createTranslationIfNotExists("validation.number.invalid", languageCode, "Invalid number format", createdBy);
        createTranslationIfNotExists("notification.success.saved", languageCode, "Successfully saved", createdBy);
        createTranslationIfNotExists("notification.success.deleted", languageCode, "Successfully deleted", createdBy);
        createTranslationIfNotExists("notification.success.updated", languageCode, "Successfully updated", createdBy);
        createTranslationIfNotExists("notification.error.networkError", languageCode, "Network error occurred", createdBy);
        createTranslationIfNotExists("notification.error.serverError", languageCode, "Server error occurred", createdBy);
        createTranslationIfNotExists("notification.info.processing", languageCode, "Processing...", createdBy);

        // 4차 대량 번역 키 추가 (영어 - 33-42번째 그룹, 총 100개)
        // 33번째 그룹 - 파일 관리 및 업로드
        createTranslationIfNotExists("file.upload.title", languageCode, "File Upload", createdBy);
        createTranslationIfNotExists("file.upload.description", languageCode, "Drag and drop files here or click to upload", createdBy);
        createTranslationIfNotExists("file.upload.progress", languageCode, "Upload in progress...", createdBy);
        createTranslationIfNotExists("file.upload.success", languageCode, "File uploaded successfully", createdBy);
        createTranslationIfNotExists("file.upload.error", languageCode, "File upload failed", createdBy);
        createTranslationIfNotExists("file.size.limit", languageCode, "File size must not exceed {size}MB", createdBy);
        createTranslationIfNotExists("file.type.invalid", languageCode, "Unsupported file type", createdBy);
        createTranslationIfNotExists("file.download.preparing", languageCode, "Preparing download...", createdBy);
        createTranslationIfNotExists("file.download.error", languageCode, "File download failed", createdBy);
        createTranslationIfNotExists("file.management.title", languageCode, "File Management", createdBy);

        // 34번째 그룹 - 사용자 관리 및 팀
        createTranslationIfNotExists("team.management.title", languageCode, "Team Management", createdBy);
        createTranslationIfNotExists("team.create.title", languageCode, "Create New Team", createdBy);
        createTranslationIfNotExists("team.member.add", languageCode, "Add Team Member", createdBy);
        createTranslationIfNotExists("team.member.remove", languageCode, "Remove Team Member", createdBy);
        createTranslationIfNotExists("team.leader.assign", languageCode, "Assign Team Leader", createdBy);
        createTranslationIfNotExists("user.management.title", languageCode, "User Management", createdBy);
        createTranslationIfNotExists("user.create.title", languageCode, "Create New User", createdBy);
        createTranslationIfNotExists("user.edit.title", languageCode, "Edit User", createdBy);
        createTranslationIfNotExists("user.deactivate.title", languageCode, "Deactivate User", createdBy);
        createTranslationIfNotExists("user.password.reset", languageCode, "Reset Password", createdBy);

        // 35번째 그룹 - 보고서 및 분석
        createTranslationIfNotExists("report.dashboard.title", languageCode, "Report Dashboard", createdBy);
        createTranslationIfNotExists("report.generate.title", languageCode, "Generate Report", createdBy);
        createTranslationIfNotExists("report.template.select", languageCode, "Select Report Template", createdBy);
        createTranslationIfNotExists("report.period.select", languageCode, "Select Report Period", createdBy);
        createTranslationIfNotExists("report.format.pdf", languageCode, "PDF Format", createdBy);
        createTranslationIfNotExists("report.format.excel", languageCode, "Excel Format", createdBy);
        createTranslationIfNotExists("analytics.overview.title", languageCode, "Analytics Overview", createdBy);
        createTranslationIfNotExists("analytics.trend.title", languageCode, "Trend Analysis", createdBy);
        createTranslationIfNotExists("analytics.performance.title", languageCode, "Performance Analysis", createdBy);
        createTranslationIfNotExists("analytics.quality.metrics", languageCode, "Quality Metrics", createdBy);

        // 36번째 그룹 - 설정 및 구성
        createTranslationIfNotExists("settings.general.title", languageCode, "General Settings", createdBy);
        createTranslationIfNotExists("settings.system.title", languageCode, "System Settings", createdBy);
        createTranslationIfNotExists("settings.security.title", languageCode, "Security Settings", createdBy);
        createTranslationIfNotExists("settings.notification.title", languageCode, "Notification Settings", createdBy);
        createTranslationIfNotExists("settings.appearance.title", languageCode, "Appearance Settings", createdBy);
        createTranslationIfNotExists("settings.language.title", languageCode, "Language Settings", createdBy);
        createTranslationIfNotExists("settings.backup.title", languageCode, "Backup Settings", createdBy);
        createTranslationIfNotExists("config.database.title", languageCode, "Database Configuration", createdBy);
        createTranslationIfNotExists("config.api.title", languageCode, "API Configuration", createdBy);
        createTranslationIfNotExists("config.integration.title", languageCode, "Integration Configuration", createdBy);

        // 37번째 그룹 - 작업 흐름 및 승인
        createTranslationIfNotExists("approval.request.title", languageCode, "Approval Request", createdBy);
        createTranslationIfNotExists("approval.pending.list", languageCode, "Pending Approvals", createdBy);
        createTranslationIfNotExists("approval.approved.list", languageCode, "Approved Items", createdBy);
        createTranslationIfNotExists("approval.rejected.list", languageCode, "Rejected Items", createdBy);
        createTranslationIfNotExists("workflow.step.next", languageCode, "Next Step", createdBy);
        createTranslationIfNotExists("workflow.step.previous", languageCode, "Previous Step", createdBy);
        createTranslationIfNotExists("workflow.complete.title", languageCode, "Complete Task", createdBy);
        createTranslationIfNotExists("workflow.cancel.title", languageCode, "Cancel Task", createdBy);
        createTranslationIfNotExists("task.assignment.title", languageCode, "Task Assignment", createdBy);
        createTranslationIfNotExists("task.deadline.title", languageCode, "Task Deadline", createdBy);

        // 38번째 그룹 - 로그 및 감사
        createTranslationIfNotExists("audit.log.title", languageCode, "Audit Log", createdBy);
        createTranslationIfNotExists("audit.trail.title", languageCode, "Audit Trail", createdBy);
        createTranslationIfNotExists("log.system.title", languageCode, "System Log", createdBy);
        createTranslationIfNotExists("log.user.activity", languageCode, "User Activity Log", createdBy);
        createTranslationIfNotExists("log.error.title", languageCode, "Error Log", createdBy);
        createTranslationIfNotExists("log.access.title", languageCode, "Access Log", createdBy);
        createTranslationIfNotExists("history.change.title", languageCode, "Change History", createdBy);
        createTranslationIfNotExists("history.version.title", languageCode, "Version History", createdBy);
        createTranslationIfNotExists("history.backup.title", languageCode, "Backup History", createdBy);
        createTranslationIfNotExists("monitoring.status.title", languageCode, "Monitoring Status", createdBy);

        // 39번째 그룹 - 캘린더 및 일정
        createTranslationIfNotExists("calendar.view.title", languageCode, "Calendar View", createdBy);
        createTranslationIfNotExists("calendar.event.create", languageCode, "Create Event", createdBy);
        createTranslationIfNotExists("calendar.event.edit", languageCode, "Edit Event", createdBy);
        createTranslationIfNotExists("calendar.event.delete", languageCode, "Delete Event", createdBy);
        createTranslationIfNotExists("schedule.test.execution", languageCode, "Test Execution Schedule", createdBy);
        createTranslationIfNotExists("schedule.maintenance.title", languageCode, "Maintenance Schedule", createdBy);
        createTranslationIfNotExists("schedule.release.title", languageCode, "Release Schedule", createdBy);
        createTranslationIfNotExists("reminder.notification.title", languageCode, "Reminder Notification", createdBy);
        createTranslationIfNotExists("deadline.approaching.title", languageCode, "Deadline Approaching", createdBy);
        createTranslationIfNotExists("milestone.achievement.title", languageCode, "Milestone Achievement", createdBy);

        // 40번째 그룹 - 통계 및 차트
        createTranslationIfNotExists("statistics.summary.title", languageCode, "Statistics Summary", createdBy);
        createTranslationIfNotExists("statistics.detailed.title", languageCode, "Detailed Statistics", createdBy);
        createTranslationIfNotExists("chart.pie.title", languageCode, "Pie Chart", createdBy);
        createTranslationIfNotExists("chart.bar.title", languageCode, "Bar Chart", createdBy);
        createTranslationIfNotExists("chart.line.title", languageCode, "Line Chart", createdBy);
        createTranslationIfNotExists("chart.area.title", languageCode, "Area Chart", createdBy);
        createTranslationIfNotExists("chart.scatter.title", languageCode, "Scatter Chart", createdBy);
        createTranslationIfNotExists("chart.radar.title", languageCode, "Radar Chart", createdBy);
        createTranslationIfNotExists("chart.heatmap.title", languageCode, "Heatmap Chart", createdBy);
        createTranslationIfNotExists("chart.gauge.title", languageCode, "Gauge Chart", createdBy);

        // 41번째 그룹 - 커뮤니케이션 및 협업
        createTranslationIfNotExists("communication.chat.title", languageCode, "Chat", createdBy);
        createTranslationIfNotExists("communication.message.send", languageCode, "Send Message", createdBy);
        createTranslationIfNotExists("communication.message.receive", languageCode, "Receive Message", createdBy);
        createTranslationIfNotExists("collaboration.share.title", languageCode, "Share", createdBy);
        createTranslationIfNotExists("collaboration.comment.add", languageCode, "Add Comment", createdBy);
        createTranslationIfNotExists("collaboration.review.request", languageCode, "Request Review", createdBy);
        createTranslationIfNotExists("collaboration.feedback.title", languageCode, "Feedback", createdBy);
        createTranslationIfNotExists("discussion.forum.title", languageCode, "Discussion Forum", createdBy);
        createTranslationIfNotExists("discussion.thread.create", languageCode, "Create Discussion Thread", createdBy);
        createTranslationIfNotExists("discussion.reply.add", languageCode, "Add Reply", createdBy);

        // 42번째 그룹 - 모바일 및 반응형
        createTranslationIfNotExists("mobile.menu.title", languageCode, "Mobile Menu", createdBy);
        createTranslationIfNotExists("mobile.navigation.title", languageCode, "Mobile Navigation", createdBy);
        createTranslationIfNotExists("mobile.responsive.title", languageCode, "Responsive Design", createdBy);
        createTranslationIfNotExists("mobile.touch.gesture", languageCode, "Touch Gesture", createdBy);
        createTranslationIfNotExists("mobile.offline.mode", languageCode, "Offline Mode", createdBy);
        createTranslationIfNotExists("mobile.sync.title", languageCode, "Synchronization", createdBy);
        createTranslationIfNotExists("responsive.breakpoint.mobile", languageCode, "Mobile Breakpoint", createdBy);
        createTranslationIfNotExists("responsive.breakpoint.tablet", languageCode, "Tablet Breakpoint", createdBy);
        createTranslationIfNotExists("responsive.breakpoint.desktop", languageCode, "Desktop Breakpoint", createdBy);
        createTranslationIfNotExists("responsive.layout.adaptive", languageCode, "Adaptive Layout", createdBy);

        // 콘솔 누락 키들 - 헤더 네비게이션 (영어)
        createTranslationIfNotExists("header.nav.dashboard", languageCode, "Dashboard", createdBy);
        createTranslationIfNotExists("header.nav.organizationManagement", languageCode, "Organization Management", createdBy);
        createTranslationIfNotExists("header.nav.userManagement", languageCode, "User Management", createdBy);

        // 콘솔 누락 키들 - 조직 대시보드 (영어)
        createTranslationIfNotExists("organization.dashboard.title", languageCode, "Organization Dashboard", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalUsers", languageCode, "Total Users", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.activeProjects", languageCode, "Active Projects", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.testCases", languageCode, "Test Cases", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.completedTests", languageCode, "Completed Tests", createdBy);
        createTranslationIfNotExists("organization.dashboard.stats.title", languageCode, "Organization Statistics", createdBy);

        // 콘솔 누락 키들 - JIRA 연동 (영어)
        createTranslationIfNotExists("jira.status.connectionStatus", languageCode, "JIRA Connection Status", createdBy);
        createTranslationIfNotExists("jira.status.connected", languageCode, "Connected", createdBy);
        createTranslationIfNotExists("jira.status.disconnected", languageCode, "Disconnected", createdBy);
        createTranslationIfNotExists("jira.messages.connectionError", languageCode, "Failed to connect to JIRA", createdBy);
        createTranslationIfNotExists("jira.messages.syncSuccess", languageCode, "Successfully synchronized with JIRA", createdBy);
        createTranslationIfNotExists("jira.messages.syncError", languageCode, "Failed to synchronize with JIRA", createdBy);

        // 콘솔 누락 키들 - 공통 버튼 (영어)
        createTranslationIfNotExists("common.buttons.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("common.buttons.reset", languageCode, "Reset", createdBy);
        createTranslationIfNotExists("common.buttons.apply", languageCode, "Apply", createdBy);
        createTranslationIfNotExists("common.buttons.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("common.buttons.ok", languageCode, "OK", createdBy);
        createTranslationIfNotExists("common.buttons.yes", languageCode, "Yes", createdBy);
        createTranslationIfNotExists("common.buttons.no", languageCode, "No", createdBy);

        // JUnit 결과 대시보드 - 빈 상태 메시지 (영어)
        createTranslationIfNotExists("junit.empty.noResults", languageCode, "No test results available", createdBy);
        createTranslationIfNotExists("junit.empty.uploadPrompt", languageCode, "Upload JUnit XML files to analyze test results.", createdBy);
        createTranslationIfNotExists("junit.empty.firstUpload", languageCode, "Upload First Test Result", createdBy);

        // JUnit 업로드 다이얼로그 (영어)
        createTranslationIfNotExists("junit.upload.fileSize", languageCode, "Size", createdBy);
        createTranslationIfNotExists("junit.upload.changeFile", languageCode, "Choose Another File", createdBy);
        createTranslationIfNotExists("junit.upload.executionInfo", languageCode, "Test Execution Information", createdBy);
        createTranslationIfNotExists("junit.placeholder.description", languageCode, "Description (optional)", createdBy);
        createTranslationIfNotExists("junit.upload.uploadingFile", languageCode, "Uploading \"{fileName}\"...", createdBy);
        createTranslationIfNotExists("junit.upload.max", languageCode, "Max", createdBy);

        // JUnit 상세 페이지 (영어)
        createTranslationIfNotExists("junit.detail.upload", languageCode, "Upload", createdBy);
        createTranslationIfNotExists("junit.detail.unknownUploader", languageCode, "Unknown", createdBy);

        // JUnit 테스트 케이스 에디터 (영어)
        createTranslationIfNotExists("junit.editor.title", languageCode, "Edit Test Case", createdBy);
        createTranslationIfNotExists("junit.editor.viewMode", languageCode, "(View Mode)", createdBy);
        createTranslationIfNotExists("junit.editor.editMode", languageCode, "(Edit Mode)", createdBy);
        createTranslationIfNotExists("junit.editor.viewOriginalData", languageCode, "View Original Data", createdBy);
        createTranslationIfNotExists("junit.editor.editHistory", languageCode, "Edit History", createdBy);

        // 상태 설명 (영어)
        createTranslationIfNotExists("junit.editor.status.passedDesc", languageCode, "Test passed successfully", createdBy);
        createTranslationIfNotExists("junit.editor.status.failedDesc", languageCode, "Test failed", createdBy);
        createTranslationIfNotExists("junit.editor.status.errorDesc", languageCode, "An error occurred during test execution", createdBy);
        createTranslationIfNotExists("junit.editor.status.skippedDesc", languageCode, "Test was skipped", createdBy);

        // 우선순위 (영어)
        createTranslationIfNotExists("junit.editor.priority.high", languageCode, "High", createdBy);
        createTranslationIfNotExists("junit.editor.priority.medium", languageCode, "Medium", createdBy);
        createTranslationIfNotExists("junit.editor.priority.low", languageCode, "Low", createdBy);

        // 태그 및 노트 (영어)
        createTranslationIfNotExists("junit.editor.tags", languageCode, "Tags", createdBy);
        createTranslationIfNotExists("junit.editor.tagsPlaceholder", languageCode, "Enter comma-separated tags (e.g., bug, regression, API)", createdBy);
        createTranslationIfNotExists("junit.editor.tagsHelp", languageCode, "You can enter multiple tags separated by commas", createdBy);
        createTranslationIfNotExists("junit.editor.notes", languageCode, "Notes", createdBy);
        createTranslationIfNotExists("junit.editor.notesPlaceholder", languageCode, "Enter additional notes for this test case", createdBy);

        // 미리보기 및 버튼 (영어)
        createTranslationIfNotExists("junit.editor.preview", languageCode, "Preview", createdBy);
        createTranslationIfNotExists("junit.editor.saving", languageCode, "Saving...", createdBy);

        // 오류 메시지 (영어)
        createTranslationIfNotExists("junit.editor.error.noTestCase", languageCode, "Test case not found", createdBy);
        createTranslationIfNotExists("junit.editor.error.saveFailed", languageCode, "Failed to save test case", createdBy);

        // ===== RAG (Retrieval-Augmented Generation) Translations =====
        // RAG Manager
        createTranslationIfNotExists("rag.manager.noProject", languageCode, "Please select a project first.", createdBy);

        // Document Upload
        createTranslationIfNotExists("rag.upload.title", languageCode, "Document Upload", createdBy);
        createTranslationIfNotExists("rag.upload.description", languageCode, "Upload PDF, DOCX, DOC, TXT files to register them in the RAG system. (Maximum 50MB)", createdBy);
        createTranslationIfNotExists("rag.upload.dragAndDrop", languageCode, "Drag files here or click to select", createdBy);
        createTranslationIfNotExists("rag.upload.selectFiles", languageCode, "Select Files", createdBy);
        createTranslationIfNotExists("rag.upload.selectedFiles", languageCode, "Selected Files", createdBy);
        createTranslationIfNotExists("rag.upload.uploading", languageCode, "Uploading", createdBy);
        createTranslationIfNotExists("rag.upload.upload", languageCode, "Upload", createdBy);
        createTranslationIfNotExists("rag.upload.error.unsupportedFileType", languageCode, "Unsupported file type. (Only PDF, DOCX, DOC, TXT allowed)", createdBy);
        createTranslationIfNotExists("rag.upload.error.fileTooLarge", languageCode, "File size is too large. (Maximum {maxSize}MB)", createdBy);
        createTranslationIfNotExists("rag.upload.error.noFilesSelected", languageCode, "Please select files to upload.", createdBy);

        // Document Parser
        createTranslationIfNotExists("rag.upload.parser.label", languageCode, "Document Analysis Parser", createdBy);
        createTranslationIfNotExists("rag.upload.parser.pypdf2.description", languageCode, "Basic local parser", createdBy);
        createTranslationIfNotExists("rag.upload.parser.pymupdf.description", languageCode, "Fast local parser with rich features", createdBy);
        createTranslationIfNotExists("rag.upload.parser.pymupdf4llm.description", languageCode, "LLM-optimized markdown extraction", createdBy);
        createTranslationIfNotExists("rag.upload.parser.upstage.description", languageCode, "Cloud API with advanced layout analysis (requires upstage_api_key)", createdBy);

        // Document List
        createTranslationIfNotExists("rag.document.status.pending", languageCode, "Pending", createdBy);
        createTranslationIfNotExists("rag.document.status.analyzing", languageCode, "Analyzing", createdBy);
        createTranslationIfNotExists("rag.document.status.completed", languageCode, "Completed", createdBy);
        createTranslationIfNotExists("rag.document.status.failed", languageCode, "Failed", createdBy);
        createTranslationIfNotExists("rag.document.loading", languageCode, "Loading document list...", createdBy);
        createTranslationIfNotExists("rag.document.empty", languageCode, "No documents uploaded", createdBy);
        createTranslationIfNotExists("rag.document.emptyDescription", languageCode, "Use the upload area above to register documents", createdBy);
        createTranslationIfNotExists("rag.document.list.title", languageCode, "Uploaded Documents", createdBy);
        createTranslationIfNotExists("rag.document.list.fileName", languageCode, "File Name", createdBy);
        createTranslationIfNotExists("rag.document.list.fileSize", languageCode, "Size", createdBy);
        createTranslationIfNotExists("rag.document.list.status", languageCode, "Status", createdBy);
        createTranslationIfNotExists("rag.document.list.chunks", languageCode, "Chunks", createdBy);
        createTranslationIfNotExists("rag.document.list.uploadDate", languageCode, "Upload Date", createdBy);
        createTranslationIfNotExists("rag.document.list.actions", languageCode, "Actions", createdBy);
        createTranslationIfNotExists("rag.document.download", languageCode, "Download Document", createdBy);
        createTranslationIfNotExists("rag.document.delete", languageCode, "Delete Document", createdBy);
        createTranslationIfNotExists("rag.document.deleteDialog.title", languageCode, "Confirm Document Deletion", createdBy);
        createTranslationIfNotExists("rag.document.deleteDialog.message", languageCode, "Are you sure you want to delete this document? This action cannot be undone.", createdBy);
        createTranslationIfNotExists("rag.document.pagination.rowsPerPage", languageCode, "Rows per page:", createdBy);
        createTranslationIfNotExists("rag.document.viewChunks", languageCode, "View Chunks", createdBy);
        // ICT-388: Document/TestCase separation display
        createTranslationIfNotExists("rag.document.list.regularDocuments", languageCode, "Uploaded Documents", createdBy);
        createTranslationIfNotExists("rag.document.list.testCaseDocuments", languageCode, "TestCase Documents", createdBy);

        // Similar Test Cases
        createTranslationIfNotExists("rag.similar.title", languageCode, "Similar Search", createdBy);
        createTranslationIfNotExists("rag.similar.description", languageCode, "Enter keywords or description, and the RAG system will find similar test cases or documents.", createdBy);
        createTranslationIfNotExists("rag.similar.searchQuery", languageCode, "Search Query", createdBy);
        createTranslationIfNotExists("rag.similar.searchPlaceholder", languageCode, "e.g., Login functionality test, Sign-up validation", createdBy);
        createTranslationIfNotExists("rag.similar.search", languageCode, "Search", createdBy);
        createTranslationIfNotExists("rag.similar.searching", languageCode, "Searching...", createdBy);
        createTranslationIfNotExists("rag.similar.noResults", languageCode, "No results found. Try different keywords.", createdBy);
        createTranslationIfNotExists("rag.similar.resultsCount", languageCode, "Search Results ({count})", createdBy);
        // ICT-388: Search results separation display
        createTranslationIfNotExists("rag.similar.testCaseResults", languageCode, "Test Cases", createdBy);
        createTranslationIfNotExists("rag.similar.documentResults", languageCode, "Documents", createdBy);
        createTranslationIfNotExists("rag.similar.metadata", languageCode, "Document ID: {documentId} | Chunk Order: {chunkIndex}", createdBy);
        createTranslationIfNotExists("rag.similar.copy", languageCode, "Copy", createdBy);
        createTranslationIfNotExists("rag.similar.addTestCase", languageCode, "Add as Test Case", createdBy);
        createTranslationIfNotExists("rag.similar.unknownDocument", languageCode, "Unknown", createdBy);
        createTranslationIfNotExists("rag.similar.testCaseTitle", languageCode, "Test Case - {fileName}", createdBy);
        createTranslationIfNotExists("rag.similar.sourceTestcase", languageCode, "Test Case", createdBy);
        createTranslationIfNotExists("rag.similar.sourceDocument", languageCode, "Document", createdBy);
        createTranslationIfNotExists("rag.similar.showDetails", languageCode, "Show Details", createdBy);
        createTranslationIfNotExists("rag.similar.noHighSimilarityResults", languageCode, "No documents with 82% or higher similarity found. See below for lower similarity results.", createdBy);
        createTranslationIfNotExists("rag.similar.lowSimilarityCollapsed", languageCode, "Low similarity (click to view)", createdBy);

        // ProjectHeader RAG Tab
        createTranslationIfNotExists("projectHeader.tabs.ragDocuments", languageCode, "RAG Documents", createdBy);

        // Attachment - File attachment related translations
        // Success messages
        createTranslationIfNotExists("attachment.success.upload", languageCode, "File uploaded successfully.", createdBy);
        createTranslationIfNotExists("attachment.success.delete", languageCode, "Attachment deleted successfully.", createdBy);

        // Error messages - Authentication
        createTranslationIfNotExists("attachment.error.auth.failed", languageCode, "User authentication failed.", createdBy);

        // Error messages - Upload
        createTranslationIfNotExists("attachment.error.upload.validation", languageCode, "File validation failed.", createdBy);
        createTranslationIfNotExists("attachment.error.upload.io", languageCode, "An error occurred while saving the file.", createdBy);
        createTranslationIfNotExists("attachment.error.upload.general", languageCode, "A server error occurred.", createdBy);

        // Error messages - List
        createTranslationIfNotExists("attachment.error.list.failed", languageCode, "An error occurred while retrieving the attachment list.", createdBy);
        createTranslationIfNotExists("attachment.error.notfound", languageCode, "Attachment not found.", createdBy);
        createTranslationIfNotExists("attachment.error.info.failed", languageCode, "An error occurred while retrieving attachment information.", createdBy);

        // Error messages - Download
        createTranslationIfNotExists("attachment.error.download.notfound", languageCode, "File not found.", createdBy);
        createTranslationIfNotExists("attachment.error.download.io", languageCode, "An error occurred while downloading the file.", createdBy);
        createTranslationIfNotExists("attachment.error.download.general", languageCode, "An unexpected error occurred while downloading the file.", createdBy);

        // Error messages - Delete
        createTranslationIfNotExists("attachment.error.delete.failed", languageCode, "An error occurred while deleting the attachment.", createdBy);

        // Error messages - Storage info
        createTranslationIfNotExists("attachment.error.storage.failed", languageCode, "An error occurred while retrieving storage information.", createdBy);
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
