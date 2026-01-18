// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishLoginDashboardAndProjectTranslations.java
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
 * English translations - Login, Dashboard, and Project Basics
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishLoginDashboardAndProjectTranslations {

        private final LanguageRepository languageRepository;
        private final TranslationKeyRepository translationKeyRepository;
        private final TranslationRepository translationRepository;

        public void initialize() {
                String languageCode = "en";
                String createdBy = "system";

                createTranslationIfNotExists("login.title", languageCode, "Login", createdBy);
                createTranslationIfNotExists("login.username", languageCode, "Username", createdBy);
                createTranslationIfNotExists("login.password", languageCode, "Password", createdBy);
                createTranslationIfNotExists("login.button", languageCode, "Login", createdBy);
                createTranslationIfNotExists("login.back", languageCode, "Back to Login", createdBy);

                // Register
                createTranslationIfNotExists("register.title", languageCode, "Sign Up", createdBy);
                createTranslationIfNotExists("register.confirm_password", languageCode, "Confirm Password", createdBy);
                createTranslationIfNotExists("register.name", languageCode, "Name", createdBy);
                createTranslationIfNotExists("register.email", languageCode, "Email", createdBy);
                createTranslationIfNotExists("register.button", languageCode, "Sign Up", createdBy);
                createTranslationIfNotExists("register.switch", languageCode, "Sign Up", createdBy);
                createTranslationIfNotExists("register.success", languageCode,
                                "Registration successful. Please log in.",
                                createdBy);
                createTranslationIfNotExists("register.error.general", languageCode,
                                "An error occurred during registration.",
                                createdBy);

                // Session Expiry
                createTranslationIfNotExists("auth.session.expired.title", languageCode, "Connection Check", createdBy);
                createTranslationIfNotExists("auth.session.expired.message", languageCode,
                                "Session may have expired or a temporary error occurred.", createdBy);
                createTranslationIfNotExists("auth.session.expired.cause", languageCode,
                                "Try refreshing the page. If the issue persists, please log in again.", createdBy);
                createTranslationIfNotExists("auth.session.button.refresh", languageCode, "Refresh Page", createdBy);
                createTranslationIfNotExists("auth.session.button.login", languageCode, "Go to Login", createdBy);

                createTranslationIfNotExists("dashboard.title", languageCode, "Dashboard", createdBy);
                createTranslationIfNotExists("project.dialog.createTitle", languageCode, "Create New Project",
                                createdBy);
                createTranslationIfNotExists("project.dialog.editTitle", languageCode, "Edit Project", createdBy);
                createTranslationIfNotExists("project.form.name", languageCode, "Project Name", createdBy);
                createTranslationIfNotExists("project.form.code", languageCode, "Project Code", createdBy);
                createTranslationIfNotExists("project.form.codePlaceholder", languageCode, "e.g., PROJ001", createdBy);
                createTranslationIfNotExists("project.form.organization", languageCode, "Organization", createdBy);
                createTranslationIfNotExists("project.form.noOrganization", languageCode,
                                "Independent Project (No Organization)", createdBy);
                createTranslationIfNotExists("project.form.description", languageCode, "Description", createdBy);
                createTranslationIfNotExists("project.form.descriptionPlaceholder", languageCode,
                                "Enter a description for the project...", createdBy);
                createTranslationIfNotExists("common.buttons.create", languageCode, "Create", createdBy);
                createTranslationIfNotExists("common.buttons.update", languageCode, "Update", createdBy);
                createTranslationIfNotExists("common.buttons.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("project.dialog.createTitle", languageCode, "Create New Project",
                                createdBy);
                createTranslationIfNotExists("project.dialog.editTitle", languageCode, "Edit Project", createdBy);
                createTranslationIfNotExists("project.form.name", languageCode, "Project Name", createdBy);
                createTranslationIfNotExists("project.form.code", languageCode, "Project Code", createdBy);
                createTranslationIfNotExists("project.form.codePlaceholder", languageCode, "e.g., PROJ001", createdBy);
                createTranslationIfNotExists("project.form.organization", languageCode, "Organization", createdBy);
                createTranslationIfNotExists("project.form.noOrganization", languageCode,
                                "Independent Project (No Organization)", createdBy);
                createTranslationIfNotExists("project.form.description", languageCode, "Description", createdBy);
                createTranslationIfNotExists("project.form.descriptionPlaceholder", languageCode,
                                "Enter a description for the project...", createdBy);
                createTranslationIfNotExists("common.buttons.create", languageCode, "Create", createdBy);
                createTranslationIfNotExists("common.buttons.update", languageCode, "Update", createdBy);
                createTranslationIfNotExists("common.buttons.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("dashboard.lastUpdated", languageCode, "Last updated: {date}", createdBy);
                createTranslationIfNotExists("dashboard.refresh.tooltip", languageCode, "Refresh dashboard data",
                                createdBy);
                createTranslationIfNotExists("dashboard.refresh.button", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("dashboard.loading.data", languageCode, "Loading dashboard data...",
                                createdBy);
                createTranslationIfNotExists("dashboard.loading.chart", languageCode, "Loading chart data...",
                                createdBy);
                createTranslationIfNotExists("dashboard.error.solution", languageCode, "Solution: {action}", createdBy);
                createTranslationIfNotExists("dashboard.error.retry", languageCode, "Retry", createdBy);
                createTranslationIfNotExists("dashboard.error.goToLogin", languageCode, "Go to Login", createdBy);
                createTranslationIfNotExists("dashboard.error.details", languageCode, "Details", createdBy);
                createTranslationIfNotExists("dashboard.noData.message", languageCode, "No dashboard data to display.",
                                createdBy);
                createTranslationIfNotExists("dashboard.noData.chart", languageCode, "No chart data available.",
                                createdBy);
                createTranslationIfNotExists("dashboard.noData.noActiveTestRuns", languageCode,
                                "No active test runs available.", createdBy);
                createTranslationIfNotExists("dashboard.project.totalTestCases", languageCode,
                                "Total {count} test cases",
                                createdBy);
                createTranslationIfNotExists("dashboard.project.members", languageCode, "{count} members", createdBy);
                createTranslationIfNotExists("dashboard.charts.recentTestResults", languageCode, "Recent Test Results",
                                createdBy);
                createTranslationIfNotExists("dashboard.charts.testResultsTrend", languageCode, "Test Results Trend",
                                createdBy);
                createTranslationIfNotExists("dashboard.charts.last15Days", languageCode, "Last 15 days", createdBy);
                createTranslationIfNotExists("dashboard.charts.openTestRunResults", languageCode,
                                "Open Test Run Results",
                                createdBy);
                createTranslationIfNotExists("dashboard.charts.assigneeResults", languageCode, "Results by Assignee",
                                createdBy);
                createTranslationIfNotExists("dashboard.charts.testPlanResults", languageCode, "Test Plan Results",
                                createdBy);
                createTranslationIfNotExists("dashboard.charts.notRunTrend", languageCode, "Not Run Trend", createdBy);
                createTranslationIfNotExists("dashboard.status.pass", languageCode, "Pass", createdBy);
                createTranslationIfNotExists("dashboard.status.fail", languageCode, "Fail", createdBy);
                createTranslationIfNotExists("dashboard.status.blocked", languageCode, "Blocked", createdBy);
                createTranslationIfNotExists("dashboard.status.notrun", languageCode, "Not Run", createdBy);
                createTranslationIfNotExists("dashboard.status.skipped", languageCode, "Skipped", createdBy);
                createTranslationIfNotExists("dashboard.status.complete", languageCode, "Complete", createdBy);
                createTranslationIfNotExists("dashboard.status.failureRate", languageCode, "Failure rate {rate}%",
                                createdBy);
                createTranslationIfNotExists("dashboard.status.completedCount", languageCode,
                                "{completed}/{total} completed",
                                createdBy);
                createTranslationIfNotExists("dashboard.messages.selectProject", languageCode,
                                "Please select a project to view test plan results.", createdBy);
                createTranslationIfNotExists("project.title", languageCode, "Project Management", createdBy);
                createTranslationIfNotExists("project.tabs.byOrganization", languageCode, "Projects by Organization",
                                createdBy);
                createTranslationIfNotExists("project.tabs.independent", languageCode, "Independent Projects",
                                createdBy);
                createTranslationIfNotExists("project.tabs.all", languageCode, "All Projects", createdBy);
                createTranslationIfNotExists("project.stats.projectCount", languageCode, "{count} projects", createdBy);
                createTranslationIfNotExists("project.stats.totalProjectCount", languageCode, "Total {count} projects",
                                createdBy);
                createTranslationIfNotExists("project.messages.noIndependentProjects", languageCode,
                                "No independent projects",
                                createdBy);
                createTranslationIfNotExists("project.messages.createIndependentProjectHint", languageCode,
                                "Try creating a personal project that doesn't belong to an organization.", createdBy);
                createTranslationIfNotExists("project.buttons.openProject", languageCode, "Open Project", createdBy);
                createTranslationIfNotExists("project.buttons.addProject", languageCode, "Add Project", createdBy);
                createTranslationIfNotExists("project.buttons.createProject", languageCode, "Create Project",
                                createdBy);
                createTranslationIfNotExists("project.buttons.createNew", languageCode, "Create New Project",
                                createdBy);
                createTranslationIfNotExists("project.buttons.createIndependent", languageCode,
                                "Create Independent Project",
                                createdBy);
                createTranslationIfNotExists("project.buttons.createFirstIndependent", languageCode,
                                "Create First Independent Project", createdBy);
                createTranslationIfNotExists("project.tooltips.testCaseCount", languageCode, "Test Case Count",
                                createdBy);
                createTranslationIfNotExists("project.tooltips.memberCount", languageCode, "Member Count", createdBy);
                createTranslationIfNotExists("project.tooltips.junitStatus", languageCode, "Automation Test Status",
                                createdBy);
                createTranslationIfNotExists("project.tooltips.automationTestCount", languageCode,
                                "Automation Test Result Count", createdBy);
                createTranslationIfNotExists("organization.management.title", languageCode, "Organization Management",
                                createdBy);
                createTranslationIfNotExists("userList.title", languageCode, "User Management", createdBy);
                createTranslationIfNotExists("userList.loading", languageCode, "Loading user list...", createdBy);
                createTranslationIfNotExists("userList.search.placeholder", languageCode,
                                "Search by name, username, email...",
                                createdBy);
                createTranslationIfNotExists("userList.filter.role", languageCode, "Role", createdBy);
                createTranslationIfNotExists("userList.filter.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("userList.filter.all", languageCode, "All", createdBy);
                createTranslationIfNotExists("userList.filter.active", languageCode, "Active", createdBy);
                createTranslationIfNotExists("userList.filter.inactive", languageCode, "Inactive", createdBy);
                createTranslationIfNotExists("userList.button.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("userList.button.export", languageCode, "Export Data", createdBy);
                createTranslationIfNotExists("userList.button.reset", languageCode, "Reset", createdBy);
                createTranslationIfNotExists("userList.stats.totalUsers", languageCode, "Total Users", createdBy);
                createTranslationIfNotExists("userList.stats.activeUsers", languageCode, "Active Users", createdBy);
                createTranslationIfNotExists("userList.stats.inactiveUsers", languageCode, "Inactive Users", createdBy);
                createTranslationIfNotExists("userList.stats.recentRegistrations", languageCode, "Recent Registrations",
                                createdBy);
                createTranslationIfNotExists("userList.table.username", languageCode, "Username", createdBy);
                createTranslationIfNotExists("userList.table.name", languageCode, "Name", createdBy);
                createTranslationIfNotExists("userList.table.email", languageCode, "Email", createdBy);
                createTranslationIfNotExists("userList.table.role", languageCode, "Role", createdBy);
                createTranslationIfNotExists("userList.table.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("userList.table.createdAt", languageCode, "Created At", createdBy);
                createTranslationIfNotExists("userList.table.lastLogin", languageCode, "Last Login", createdBy);
                createTranslationIfNotExists("userList.table.actions", languageCode, "Actions", createdBy);
                createTranslationIfNotExists("userList.status.none", languageCode, "None", createdBy);
                createTranslationIfNotExists("userList.action.view", languageCode, "View Details", createdBy);
                createTranslationIfNotExists("userList.action.moreActions", languageCode, "More Actions", createdBy);
                createTranslationIfNotExists("userList.action.activate", languageCode, "Activate", createdBy);
                createTranslationIfNotExists("userList.action.deactivate", languageCode, "Deactivate", createdBy);
                createTranslationIfNotExists("userList.empty.message", languageCode,
                                "No users match the search criteria.",
                                createdBy);
                createTranslationIfNotExists("userList.empty.resetButton", languageCode, "Reset Search Criteria",
                                createdBy);
                createTranslationIfNotExists("userList.pagination.rowsPerPage", languageCode, "Rows per page:",
                                createdBy);
                createTranslationIfNotExists("userList.pagination.displayedRows", languageCode,
                                "{from}-{to} of {count}",
                                createdBy);
                createTranslationIfNotExists("userDetail.loading", languageCode, "Loading user information...",
                                createdBy);
                createTranslationIfNotExists("userDetail.title", languageCode, "User Information", createdBy);
                createTranslationIfNotExists("userDetail.notFound", languageCode, "User information not found.",
                                createdBy);
                createTranslationIfNotExists("userDetail.editCancel.title", languageCode, "Cancel Edit", createdBy);
                createTranslationIfNotExists("userDetail.editCancel.message", languageCode,
                                "You have unsaved changes. Do you want to close without saving?", createdBy);
                createTranslationIfNotExists("userDetail.validation.required", languageCode,
                                "Name and email are required fields.", createdBy);
                createTranslationIfNotExists("userDetail.validation.emailFormat", languageCode,
                                "Please enter a valid email format.", createdBy);
                createTranslationIfNotExists("userDetail.error.saveError", languageCode,
                                "An error occurred while saving.",
                                createdBy);
                createTranslationIfNotExists("userDetail.section.basicInfo", languageCode, "Basic Information",
                                createdBy);
                createTranslationIfNotExists("userDetail.form.name", languageCode, "Name", createdBy);
                createTranslationIfNotExists("userDetail.form.email", languageCode, "Email", createdBy);
                createTranslationIfNotExists("userDetail.form.role", languageCode, "Role", createdBy);
                createTranslationIfNotExists("userDetail.form.accountActive", languageCode, "Account Active",
                                createdBy);
                createTranslationIfNotExists("userDetail.section.statusInfo", languageCode, "Status Information",
                                createdBy);
                createTranslationIfNotExists("userDetail.status.role", languageCode, "Role", createdBy);
                createTranslationIfNotExists("userDetail.status.account", languageCode, "Account Status", createdBy);
                createTranslationIfNotExists("userDetail.status.active", languageCode, "Active", createdBy);
                createTranslationIfNotExists("userDetail.status.inactive", languageCode, "Inactive", createdBy);
                createTranslationIfNotExists("userDetail.status.activity", languageCode, "Activity Status", createdBy);
                createTranslationIfNotExists("userDetail.section.timeInfo", languageCode, "Time Information",
                                createdBy);
                createTranslationIfNotExists("userDetail.time.createdAt", languageCode, "Created At", createdBy);
                createTranslationIfNotExists("userDetail.time.updatedAt", languageCode, "Last Updated", createdBy);
                createTranslationIfNotExists("userDetail.time.lastLogin", languageCode, "Last Login", createdBy);
                createTranslationIfNotExists("userDetail.time.daysSinceLogin", languageCode, "Days Since Login",
                                createdBy);
                createTranslationIfNotExists("userDetail.time.days", languageCode, "days", createdBy);
                createTranslationIfNotExists("userDetail.time.none", languageCode, "None", createdBy);
                createTranslationIfNotExists("userDetail.button.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("userDetail.button.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("userDetail.tooltip.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("userDetail.tooltip.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("userDetail.tooltip.edit", languageCode, "Edit", createdBy);
                createTranslationIfNotExists("userDetail.tooltip.passwordChange", languageCode, "Change Password",
                                createdBy);
                createTranslationIfNotExists("userDetail.success.passwordChanged", languageCode,
                                "Password Change Complete",
                                createdBy);
                createTranslationIfNotExists("testcase.form.title.create", languageCode, "Create Test Case", createdBy);
                createTranslationIfNotExists("testPlan.form.title.create", languageCode, "Create New Test Plan",
                                createdBy);
                createTranslationIfNotExists("testPlan.form.title.edit", languageCode, "Edit Test Plan", createdBy);
                createTranslationIfNotExists("testPlan.form.planName", languageCode, "Plan Name", createdBy);
                createTranslationIfNotExists("testPlan.form.description", languageCode, "Description", createdBy);
                createTranslationIfNotExists("testPlan.form.testcaseSelection", languageCode, "Test Case Selection",
                                createdBy);
                createTranslationIfNotExists("testPlan.form.selectedCount", languageCode, "{count} selected",
                                createdBy);
                createTranslationIfNotExists("testPlan.form.projectSelectFirst", languageCode,
                                "Please select a project first",
                                createdBy);
                createTranslationIfNotExists("testPlan.form.button.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("testPlan.form.button.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("testPlan.form.button.processing", languageCode, "Processing...",
                                createdBy);
                createTranslationIfNotExists("testPlan.validation.nameRequired", languageCode,
                                "Test plan name is required",
                                createdBy);
                createTranslationIfNotExists("testPlan.validation.testcaseRequired", languageCode,
                                "At least one test case must be selected", createdBy);
                createTranslationIfNotExists("testPlan.error.saveFailed", languageCode, "Error occurred while saving: ",
                                createdBy);
                createTranslationIfNotExists("testPlan.list.add", languageCode, "Add Test Plan", createdBy);
                createTranslationIfNotExists("testPlan.list.table.id", languageCode, "ID", createdBy);
                createTranslationIfNotExists("testPlan.list.table.name", languageCode, "Name", createdBy);
                createTranslationIfNotExists("testPlan.list.table.description", languageCode, "Description", createdBy);
                createTranslationIfNotExists("testPlan.list.table.testcaseCount", languageCode, "Test Cases",
                                createdBy);
                createTranslationIfNotExists("testPlan.list.table.createdAt", languageCode, "Created", createdBy);
                createTranslationIfNotExists("testPlan.list.table.execute", languageCode, "Execute", createdBy);
                createTranslationIfNotExists("testPlan.list.table.edit", languageCode, "Edit", createdBy);
                createTranslationIfNotExists("testPlan.list.table.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("testPlan.list.empty.message", languageCode, "No test plans registered.",
                                createdBy);
                createTranslationIfNotExists("testPlan.execution.dialog.title", languageCode,
                                "Test Execution - {planName}",
                                createdBy);
                createTranslationIfNotExists("testPlan.execution.button.newExecution", languageCode,
                                "Create New Execution",
                                createdBy);
                createTranslationIfNotExists("testPlan.execution.empty.message", languageCode,
                                "No execution history for this test plan.", createdBy);
                createTranslationIfNotExists("testPlan.execution.progress", languageCode, "Progress:", createdBy);
                createTranslationIfNotExists("testPlan.execution.action.edit", languageCode, "Edit", createdBy);
                createTranslationIfNotExists("testPlan.execution.action.view", languageCode, "View Full Screen",
                                createdBy);
                createTranslationIfNotExists("testPlan.execution.dialog.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("testPlan.delete.dialog.title", languageCode, "Delete Test Plan",
                                createdBy);
                createTranslationIfNotExists("testPlan.delete.dialog.message", languageCode,
                                "Are you sure you want to delete this test plan? This action cannot be undone.",
                                createdBy);
                createTranslationIfNotExists("testPlan.delete.button.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("testPlan.delete.button.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("testPlan.selector.label", languageCode, "Select Test Plan", createdBy);
                createTranslationIfNotExists("testPlan.selector.all", languageCode, "All", createdBy);
                createTranslationIfNotExists("testPlan.selector.caseCount", languageCode, "{count} cases", createdBy);
                createTranslationIfNotExists("testPlan.selector.selected", languageCode, "Selected plan: {planName}",
                                createdBy);
                createTranslationIfNotExists("testPlan.selector.testcaseCount", languageCode, "({count} test cases)",
                                createdBy);
                createTranslationIfNotExists("testPlan.status.notStarted", languageCode, "Not Started", createdBy);
                createTranslationIfNotExists("testPlan.status.inProgress", languageCode, "In Progress", createdBy);
                createTranslationIfNotExists("testPlan.status.completed", languageCode, "Completed", createdBy);
                createTranslationIfNotExists("testPlan.tab.label", languageCode, "Test Plans", createdBy);
                createTranslationIfNotExists("common.list", languageCode, "List", createdBy);
                createTranslationIfNotExists("common.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("common.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("testCaseResult.page.title", languageCode, "Enter Test Result", createdBy);
                createTranslationIfNotExists("common.button.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("common.button.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("common.button.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("common.button.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("common.button.retry", languageCode, "Retry", createdBy);
                createTranslationIfNotExists("common.empty", languageCode, "-", createdBy);
                createTranslationIfNotExists("common.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("common.select", languageCode, "Select", createdBy);
                createTranslationIfNotExists("common.buttons.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("common.loading", languageCode, "Loading...", createdBy);
                createTranslationIfNotExists("projectHeader.breadcrumb.projects", languageCode, "Projects", createdBy);
                createTranslationIfNotExists("projectHeader.tabs.dashboard", languageCode, "Dashboard", createdBy);
                createTranslationIfNotExists("projectHeader.tabs.testCases", languageCode, "Test Cases", createdBy);
                createTranslationIfNotExists("projectHeader.tabs.testExecution", languageCode, "Test Execution",
                                createdBy);
                createTranslationIfNotExists("projectHeader.tabs.testResults", languageCode, "Test Results", createdBy);
                createTranslationIfNotExists("projectHeader.tabs.automation", languageCode, "Test Automation",
                                createdBy);
                createTranslationIfNotExists("testResultDashboard.chart.planComparison", languageCode,
                                "Test Plan Comparison",
                                createdBy);
                createTranslationIfNotExists("testResultDashboard.chart.executorComparison", languageCode,
                                "Executor Comparison", createdBy);
                createTranslationIfNotExists("testResultDashboard.summary.title", languageCode, "Statistics Summary",
                                createdBy);
                createTranslationIfNotExists("testResultDashboard.summary.executionRate", languageCode,
                                "Execution Rate",
                                createdBy);
                createTranslationIfNotExists("testResultDashboard.summary.successRate", languageCode, "Success Rate",
                                createdBy);
                createTranslationIfNotExists("testResultDashboard.summary.jiraLinkRate", languageCode, "JIRA Link Rate",
                                createdBy);
                createTranslationIfNotExists("testResultDashboard.summary.lastUpdated", languageCode, "Last Updated",
                                createdBy);
                createTranslationIfNotExists("testResultDashboard.summary.unknown", languageCode, "Unknown", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.error.comparisonLoadFailed", languageCode,
                                "Failed to load comparison data.", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.error.trendLoadFailed", languageCode,
                                "Failed to load trend data.", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.loading.trendData", languageCode,
                                "Loading trend data...",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.noData.title", languageCode, "No trend data available",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.noData.description", languageCode,
                                "No test execution records found for the selected period.", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.period.label", languageCode, "Period", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.period.last7days", languageCode, "Last 7 days",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.period.last15days", languageCode, "Last 15 days",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.period.last30days", languageCode, "Last 30 days",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.period.last60days", languageCode, "Last 60 days",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.period.last90days", languageCode, "Last 90 days",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chartType.line", languageCode, "Line", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chartType.area", languageCode, "Area", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.summary.avgSuccessRate", languageCode,
                                "Average Success Rate",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.summary.avgCompletionRate", languageCode,
                                "Average Completion Rate", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.summary.dataPoints", languageCode, "Data Points",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.summary.successRateChange", languageCode,
                                "Success Rate Change",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chart.overallTrend", languageCode, "Test Result Trend",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chart.testPlanComparison", languageCode,
                                "Test Plan Comparison",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chart.assigneeComparison", languageCode,
                                "Assignee Comparison",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chart.successAndCompletionRate", languageCode,
                                "Success and Completion Rate Trend", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chart.successRate", languageCode, "Success Rate",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.chart.completionRate", languageCode, "Completion Rate",
                                createdBy);
                createTranslationIfNotExists("testTrendAnalysis.tooltip.overallSuccessRate", languageCode,
                                "Overall Success Rate", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.tooltip.plan", languageCode, "Plan", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.tooltip.user", languageCode, "User", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.tooltip.unit", languageCode, "cases", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.legend.overallSuccessRate", languageCode,
                                "Overall Success Rate", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.legend.plan", languageCode, "Plan", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.legend.user", languageCode, "User", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.prompt.selectTestPlan", languageCode,
                                "Please select test plans to compare", createdBy);
                createTranslationIfNotExists("testTrendAnalysis.prompt.selectAssignee", languageCode,
                                "Please select assignees to compare", createdBy);
                createTranslationIfNotExists("header.nav.dashboard", languageCode, "Dashboard", createdBy);
                createTranslationIfNotExists("header.nav.organizationManagement", languageCode,
                                "Organization Management",
                                createdBy);
                createTranslationIfNotExists("header.nav.userManagement", languageCode, "User Management", createdBy);
                createTranslationIfNotExists("header.nav.mailSettings", languageCode, "Mail Settings", createdBy);
                createTranslationIfNotExists("header.nav.translationManagement", languageCode, "Translation Management",
                                createdBy);
                createTranslationIfNotExists("header.nav.llmConfig", languageCode, "LLM Settings", createdBy);
                createTranslationIfNotExists("header.nav.managementMenu", languageCode, "Management Menu", createdBy);
                createTranslationIfNotExists("common.buttons.import", languageCode, "Import", createdBy);
                createTranslationIfNotExists("common.buttons.add", languageCode, "Add", createdBy);
                createTranslationIfNotExists("common.buttons.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("common.table.actions", languageCode, "Actions", createdBy);
                createTranslationIfNotExists("common.default", languageCode, "Default", createdBy);
                createTranslationIfNotExists("common.active", languageCode, "Active", createdBy);
                createTranslationIfNotExists("common.inactive", languageCode, "Inactive", createdBy);
                createTranslationIfNotExists("common.buttons.edit", languageCode, "Edit", createdBy);
                createTranslationIfNotExists("common.buttons.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("common.search.keyword", languageCode, "Keyword Search", createdBy);
                createTranslationIfNotExists("common.buttons.import", languageCode, "Import", createdBy);
                createTranslationIfNotExists("header.nav.projectSelection", languageCode, "Project Selection",
                                createdBy);
                createTranslationIfNotExists("header.userMenu.profile", languageCode, "Profile", createdBy);
                createTranslationIfNotExists("header.userMenu.logout", languageCode, "Logout", createdBy);
                createTranslationIfNotExists("organization.dashboard.title", languageCode, "Dashboard", createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalOrganizations", languageCode,
                                "Total Organizations", createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalOrganizations.subtitle", languageCode,
                                "Active Organizations", createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalProjects", languageCode,
                                "Total Projects",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalProjects.subtitle", languageCode,
                                "All Projects", createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalTestCases", languageCode,
                                "Total Test Cases",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalTestCases.subtitle", languageCode,
                                "Created Test Cases", createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalUsers", languageCode, "Total Users",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalUsers.subtitle", languageCode,
                                "Registered Users", createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalMembers", languageCode,
                                "Total Project Memberships", createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalMembers.subtitle", languageCode,
                                "Project Membership Count", createdBy);
                createTranslationIfNotExists("organization.dashboard.tabs.organizationStatus", languageCode,
                                "Organization Status", createdBy);
                createTranslationIfNotExists("organization.dashboard.tabs.testStatistics", languageCode,
                                "Test Statistics",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.projectDistribution", languageCode,
                                "Project Distribution by Organization", createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.projects", languageCode,
                                "Project Count", createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.members", languageCode,
                                "Member Count", createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.organizationList", languageCode,
                                "Organization List", createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.testResultDistribution", languageCode,
                                "Test Result Distribution", createdBy);
                createTranslationIfNotExists("organization.dashboard.charts.testResultDetails", languageCode,
                                "Test Result Details", createdBy);
                createTranslationIfNotExists("organization.dashboard.list.projectCount", languageCode,
                                "Projects: {count}",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.list.memberCount", languageCode,
                                "Members: {count}",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.testResults.success", languageCode, "Success",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.testResults.failure", languageCode, "Failure",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.testResults.blocked", languageCode, "Blocked",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.testResults.notRun", languageCode, "Not Run",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.createNew", languageCode, "Create Organization",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.view", languageCode, "View Organization", createdBy);
                createTranslationIfNotExists("organization.buttons.edit", languageCode, "Edit Organization", createdBy);
                createTranslationIfNotExists("organization.buttons.invite", languageCode, "Invite Member", createdBy);
                createTranslationIfNotExists("organization.buttons.createProject", languageCode, "Create Project",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.firstOrganization", languageCode,
                                "Create First Organization", createdBy);
                createTranslationIfNotExists("organization.buttons.firstProject", languageCode, "Create First Project",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.inviteMember", languageCode, "Invite Member",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.removeMember", languageCode, "Remove Member",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.backToList", languageCode, "Back to Organizations",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.transferOwnership", languageCode,
                                "Transfer Ownership",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.transfer", languageCode, "Transfer", createdBy);
                createTranslationIfNotExists("organization.messages.noOrganizations", languageCode,
                                "No organizations available", createdBy);
                createTranslationIfNotExists("organization.messages.noProjects", languageCode,
                                "This organization has no projects yet.", createdBy);
                createTranslationIfNotExists("organization.messages.createHint", languageCode,
                                "Create a new organization to manage projects and teams.", createdBy);
                createTranslationIfNotExists("organization.messages.joinHint", languageCode,
                                "Contact your system administrator to join an organization.", createdBy);
                createTranslationIfNotExists("organization.messages.accessDenied", languageCode,
                                "You don't belong to any organization. Contact your system administrator to be added as a member or create a new organization.",
                                createdBy);
                createTranslationIfNotExists("organization.messages.canCreateNew", languageCode,
                                "You cannot access existing organizations, but you can create a new one.", createdBy);
                createTranslationIfNotExists("organization.messages.noAccessContact", languageCode,
                                "No available organizations. Contact your system administrator.", createdBy);
                createTranslationIfNotExists("organization.form.name", languageCode, "Organization Name", createdBy);
                createTranslationIfNotExists("organization.form.description", languageCode, "Description", createdBy);
                createTranslationIfNotExists("organization.form.descriptionPlaceholder", languageCode,
                                "Enter organization description...", createdBy);
                createTranslationIfNotExists("organization.form.nameRequired", languageCode,
                                "Please enter organization name.",
                                createdBy);
                createTranslationIfNotExists("organization.form.usernameRequired", languageCode,
                                "Please enter username.",
                                createdBy);
                createTranslationIfNotExists("organization.form.username", languageCode, "Username", createdBy);
                createTranslationIfNotExists("organization.form.role", languageCode, "Role", createdBy);
                createTranslationIfNotExists("organization.form.projectCode", languageCode, "Project Code", createdBy);
                createTranslationIfNotExists("organization.form.projectName", languageCode, "Project Name", createdBy);
                createTranslationIfNotExists("organization.form.projectDescription", languageCode,
                                "Project Description",
                                createdBy);
                createTranslationIfNotExists("organization.form.projectCodePlaceholder", languageCode,
                                "e.g., WEB_APP_TEST",
                                createdBy);
                createTranslationIfNotExists("organization.form.projectNamePlaceholder", languageCode,
                                "e.g., Web Application Test", createdBy);
                createTranslationIfNotExists("organization.form.projectDescriptionPlaceholder", languageCode,
                                "Enter a brief description of the project...", createdBy);
                createTranslationIfNotExists("organization.form.projectCodeHelp", languageCode,
                                "Only letters, numbers, underscores (_), and hyphens (-) allowed", createdBy);
                createTranslationIfNotExists("organization.form.namePlaceholder", languageCode,
                                "Enter organization name...",
                                createdBy);
                createTranslationIfNotExists("organization.form.projectCodeRequired", languageCode,
                                "Please enter project code.", createdBy);
                createTranslationIfNotExists("organization.form.projectNameRequired", languageCode,
                                "Please enter project name.", createdBy);
                createTranslationIfNotExists("organization.dialog.create.title", languageCode,
                                "Create New Organization",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.edit.title", languageCode, "Edit Organization",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.delete.title", languageCode,
                                "Confirm Organization Deletion",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.invite.title", languageCode, "Invite Member",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.createProject.title", languageCode, "Create Project",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.createProject.info", languageCode,
                                "A new project will be created in the '{organizationName}' organization.", createdBy);
                createTranslationIfNotExists("organization.dialog.transferOwnership.title", languageCode,
                                "Transfer Ownership",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.transferOwnership.warning", languageCode,
                                "Do you want to transfer organization ownership to {name}? This action cannot be undone and your role will be changed to administrator.",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.transferOwnership.newOwner", languageCode,
                                "New Owner",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.delete.message", languageCode,
                                "Do you really want to delete this organization?", createdBy);
                createTranslationIfNotExists("organization.dialog.delete.warning", languageCode,
                                "This action cannot be undone. All projects and data in this organization will also be deleted.",
                                createdBy);
                createTranslationIfNotExists("organization.tabs.members", languageCode, "Members", createdBy);
                createTranslationIfNotExists("organization.tabs.projects", languageCode, "Projects", createdBy);
                createTranslationIfNotExists("organization.table.user", languageCode, "User", createdBy);
                createTranslationIfNotExists("organization.table.role", languageCode, "Role", createdBy);
                createTranslationIfNotExists("organization.table.joinDate", languageCode, "Join Date", createdBy);
                createTranslationIfNotExists("organization.table.actions", languageCode, "Actions", createdBy);
                createTranslationIfNotExists("organization.role.member", languageCode, "Member", createdBy);
                createTranslationIfNotExists("organization.role.admin", languageCode, "Admin", createdBy);
                createTranslationIfNotExists("organization.role.owner", languageCode, "Owner", createdBy);
                createTranslationIfNotExists("organization.project.organizationLabel", languageCode, "Organization",
                                createdBy);
                createTranslationIfNotExists("organization.project.noDescription", languageCode, "No description",
                                createdBy);

                // Usage Summary
                createTranslationIfNotExists("dashboard.usage.title", languageCode, "Usage Summary", createdBy);
                createTranslationIfNotExists("dashboard.usage.lastUpdated", languageCode, "Last Updated {time}",
                                createdBy);
                createTranslationIfNotExists("dashboard.usage.loading", languageCode, "Loading usage data...",
                                createdBy);
                createTranslationIfNotExists("dashboard.usage.error", languageCode, "Failed to load usage data.",
                                createdBy);
                createTranslationIfNotExists("dashboard.usage.retry", languageCode, "Retry", createdBy);
                createTranslationIfNotExists("dashboard.usage.totalVisits", languageCode, "Today's Visits", createdBy);
                createTranslationIfNotExists("dashboard.usage.uniqueVisitors", languageCode, "Today's Unique Visitors",
                                createdBy);
                createTranslationIfNotExists("dashboard.usage.activeVisitors", languageCode, "Active Sessions",
                                createdBy);
                createTranslationIfNotExists("dashboard.usage.activeWindow", languageCode,
                                "Based on last {minutes} minutes",
                                createdBy);
                createTranslationIfNotExists("dashboard.usage.topPages", languageCode, "Top Pages", createdBy);
                createTranslationIfNotExists("dashboard.usage.totalLabel", languageCode, "Total {total}", createdBy);
                createTranslationIfNotExists("dashboard.usage.noData", languageCode,
                                "No aggregated visit data available.",
                                createdBy);
                createTranslationIfNotExists("dashboard.usage.dailySummary", languageCode, "Daily Visit Summary",
                                createdBy);
                createTranslationIfNotExists("dashboard.usage.uniqueLabel", languageCode, "Unique {count}", createdBy);

                // Statistics source type selection (Manual Test / Automated Test / Total
                // Aggregate)
                createTranslationIfNotExists("dashboard.source.manual", languageCode, "Manual Test", createdBy);
                createTranslationIfNotExists("dashboard.source.automated", languageCode, "Automated Test", createdBy);
                createTranslationIfNotExists("dashboard.source.total", languageCode, "Total Aggregate", createdBy);

                // Test Plan Automation Test Integration
                createTranslationIfNotExists("testPlan.list.table.automationCount", languageCode, "Automated Tests",
                                createdBy);
                createTranslationIfNotExists("testPlan.list.table.linkAutomated", languageCode, "Link Automated Test",
                                createdBy);
                createTranslationIfNotExists("testPlan.execution.automated.title", languageCode,
                                "Linked Automated Tests",
                                createdBy);
                createTranslationIfNotExists("testPlan.execution.automated.empty", languageCode,
                                "No linked automated tests.",
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
