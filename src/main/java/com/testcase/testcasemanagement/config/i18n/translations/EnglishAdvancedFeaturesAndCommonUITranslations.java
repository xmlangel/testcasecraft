// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishAdvancedFeaturesAndCommonUITranslations.java
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
 * English translations - RAG, Advanced Features, Charts, Navigation, Common UI
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishAdvancedFeaturesAndCommonUITranslations {

        private final LanguageRepository languageRepository;
        private final TranslationKeyRepository translationKeyRepository;
        private final TranslationRepository translationRepository;

        public void initialize() {
                String languageCode = "en";
                String createdBy = "system";

                createTranslationIfNotExists("organization.form.name", languageCode, "Organization Name", createdBy);
                createTranslationIfNotExists("organization.dialog.delete.title", languageCode, "Delete Organization",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.delete.message", languageCode,
                                "Are you sure you want to delete this organization?", createdBy);
                createTranslationIfNotExists("organization.dialog.invite.title", languageCode, "Invite Member",
                                createdBy);
                createTranslationIfNotExists("organization.dialog.createProject.title", languageCode, "Create Project",
                                createdBy);
                createTranslationIfNotExists("junit.dashboard.title", languageCode, "JUnit Dashboard", createdBy);
                createTranslationIfNotExists("junit.table.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("junit.upload.dialog.title", languageCode, "Upload JUnit Results",
                                createdBy);
                createTranslationIfNotExists("testCaseResult.page.title", languageCode, "Test Case Results", createdBy);
                createTranslationIfNotExists("dashboard.title", languageCode, "Dashboard", createdBy);
                createTranslationIfNotExists("dashboard.noData.message", languageCode, "No data to display", createdBy);
                createTranslationIfNotExists("junit.error.loadFailed", languageCode, "Failed to load JUnit results",
                                createdBy);
                createTranslationIfNotExists("dashboard.error.retry", languageCode, "Retry", createdBy);
                createTranslationIfNotExists("dashboard.error.goToLogin", languageCode, "Go to Login", createdBy);
                createTranslationIfNotExists("dashboard.error.details", languageCode, "Details", createdBy);
                createTranslationIfNotExists("junit.stats.error", languageCode, "Error", createdBy);
                createTranslationIfNotExists("junit.stats.errorTests", languageCode, "Error Tests", createdBy);
                createTranslationIfNotExists("junit.stats.successRate", languageCode, "Success Rate", createdBy);
                createTranslationIfNotExists("junit.stats.failed", languageCode, "Failed", createdBy);
                createTranslationIfNotExists("organization.form.nameRequired", languageCode,
                                "Organization name is required",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.createNew", languageCode, "Create New Organization",
                                createdBy);
                createTranslationIfNotExists("organization.buttons.firstOrganization", languageCode,
                                "Create First Organization", createdBy);
                createTranslationIfNotExists("organization.buttons.view", languageCode, "View", createdBy);
                createTranslationIfNotExists("common.buttons.edit", languageCode, "Edit", createdBy);
                createTranslationIfNotExists("common.buttons.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("common.buttons.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("common.buttons.create", languageCode, "Create", createdBy);
                createTranslationIfNotExists("organization.dialog.delete.warning", languageCode,
                                "This action cannot be undone",
                                createdBy);
                createTranslationIfNotExists("organization.form.description", languageCode, "Description", createdBy);
                createTranslationIfNotExists("organization.detail.members", languageCode, "Members", createdBy);
                createTranslationIfNotExists("organization.detail.projects", languageCode, "Projects", createdBy);
                createTranslationIfNotExists("organization.detail.settings", languageCode, "Settings", createdBy);
                createTranslationIfNotExists("organization.member.role.admin", languageCode, "Admin", createdBy);
                createTranslationIfNotExists("organization.member.role.member", languageCode, "Member", createdBy);
                createTranslationIfNotExists("organization.member.role.viewer", languageCode, "Viewer", createdBy);
                createTranslationIfNotExists("organization.project.status.active", languageCode, "Active", createdBy);
                createTranslationIfNotExists("organization.project.status.inactive", languageCode, "Inactive",
                                createdBy);
                createTranslationIfNotExists("organization.project.status.archived", languageCode, "Archived",
                                createdBy);
                createTranslationIfNotExists("project.form.name", languageCode, "Project Name", createdBy);
                createTranslationIfNotExists("project.form.description", languageCode, "Project Description",
                                createdBy);
                createTranslationIfNotExists("project.form.startDate", languageCode, "Start Date", createdBy);
                createTranslationIfNotExists("project.form.endDate", languageCode, "End Date", createdBy);
                createTranslationIfNotExists("project.status.planning", languageCode, "Planning", createdBy);
                createTranslationIfNotExists("project.status.inProgress", languageCode, "In Progress", createdBy);
                createTranslationIfNotExists("project.status.completed", languageCode, "Completed", createdBy);
                createTranslationIfNotExists("project.status.onHold", languageCode, "On Hold", createdBy);
                createTranslationIfNotExists("testCase.form.name", languageCode, "Test Case Name", createdBy);
                createTranslationIfNotExists("testCase.form.priority", languageCode, "Priority", createdBy);
                createTranslationIfNotExists("testCase.priority.high", languageCode, "High", createdBy);
                createTranslationIfNotExists("testCase.priority.medium", languageCode, "Medium", createdBy);
                createTranslationIfNotExists("testCase.priority.low", languageCode, "Low", createdBy);
                createTranslationIfNotExists("testCase.status.draft", languageCode, "Draft", createdBy);
                createTranslationIfNotExists("testCase.status.review", languageCode, "Under Review", createdBy);
                createTranslationIfNotExists("testCase.status.approved", languageCode, "Approved", createdBy);
                createTranslationIfNotExists("testCase.status.deprecated", languageCode, "Deprecated", createdBy);
                createTranslationIfNotExists("dashboard.chart.pieChart.title", languageCode, "Test Result Pie Chart",
                                createdBy);
                createTranslationIfNotExists("dashboard.chart.pieChart.passed", languageCode, "Passed", createdBy);
                createTranslationIfNotExists("dashboard.chart.pieChart.failed", languageCode, "Failed", createdBy);
                createTranslationIfNotExists("dashboard.chart.pieChart.blocked", languageCode, "Blocked", createdBy);
                createTranslationIfNotExists("dashboard.chart.pieChart.notRun", languageCode, "Not Run", createdBy);
                createTranslationIfNotExists("dashboard.chart.barChart.title", languageCode,
                                "Monthly Test Execution Trend",
                                createdBy);
                createTranslationIfNotExists("dashboard.chart.lineChart.title", languageCode, "Quality Trend",
                                createdBy);
                createTranslationIfNotExists("dashboard.chart.lineChart.passRate", languageCode, "Pass Rate",
                                createdBy);
                createTranslationIfNotExists("dashboard.chart.lineChart.failRate", languageCode, "Fail Rate",
                                createdBy);
                createTranslationIfNotExists("dashboard.chart.donutChart.title", languageCode,
                                "Test Case Distribution by Priority", createdBy);
                createTranslationIfNotExists("dashboard.metrics.totalTestCases", languageCode, "Total Test Cases",
                                createdBy);
                createTranslationIfNotExists("dashboard.metrics.executedTests", languageCode, "Executed Tests",
                                createdBy);
                createTranslationIfNotExists("dashboard.metrics.passedTests", languageCode, "Passed Tests", createdBy);
                createTranslationIfNotExists("dashboard.metrics.failedTests", languageCode, "Failed Tests", createdBy);
                createTranslationIfNotExists("dashboard.metrics.passRate", languageCode, "Pass Rate", createdBy);
                createTranslationIfNotExists("dashboard.widget.recentActivity", languageCode, "Recent Activity",
                                createdBy);
                createTranslationIfNotExists("dashboard.widget.upcomingTests", languageCode, "Upcoming Tests",
                                createdBy);
                createTranslationIfNotExists("dashboard.widget.criticalIssues", languageCode, "Critical Issues",
                                createdBy);
                createTranslationIfNotExists("dashboard.widget.teamPerformance", languageCode, "Team Performance",
                                createdBy);
                createTranslationIfNotExists("dashboard.widget.projectStatus", languageCode, "Project Status",
                                createdBy);
                createTranslationIfNotExists("table.column.sortAscending", languageCode, "Sort Ascending", createdBy);
                createTranslationIfNotExists("table.column.sortDescending", languageCode, "Sort Descending", createdBy);
                createTranslationIfNotExists("table.column.filter", languageCode, "Filter Column", createdBy);
                createTranslationIfNotExists("table.column.hide", languageCode, "Hide Column", createdBy);
                createTranslationIfNotExists("table.column.show", languageCode, "Show Column", createdBy);
                createTranslationIfNotExists("table.pagination.first", languageCode, "First Page", createdBy);
                createTranslationIfNotExists("table.pagination.previous", languageCode, "Previous Page", createdBy);
                createTranslationIfNotExists("table.pagination.next", languageCode, "Next Page", createdBy);
                createTranslationIfNotExists("table.pagination.last", languageCode, "Last Page", createdBy);
                createTranslationIfNotExists("table.pagination.info", languageCode,
                                "Showing {from} to {to} of {total} entries",
                                createdBy);
                createTranslationIfNotExists("search.placeholder.global", languageCode, "Search all content...",
                                createdBy);
                createTranslationIfNotExists("search.placeholder.testCase", languageCode, "Search test cases...",
                                createdBy);
                createTranslationIfNotExists("search.placeholder.project", languageCode, "Search projects...",
                                createdBy);
                createTranslationIfNotExists("search.placeholder.user", languageCode, "Search users...", createdBy);
                createTranslationIfNotExists("search.filter.status", languageCode, "Filter by Status", createdBy);
                createTranslationIfNotExists("search.filter.priority", languageCode, "Filter by Priority", createdBy);
                createTranslationIfNotExists("search.filter.assignee", languageCode, "Filter by Assignee", createdBy);
                createTranslationIfNotExists("search.filter.dateRange", languageCode, "Filter by Date Range",
                                createdBy);
                createTranslationIfNotExists("search.results.found", languageCode, "{count} results found", createdBy);
                createTranslationIfNotExists("search.results.noResults", languageCode,
                                "No results found for your search",
                                createdBy);
                createTranslationIfNotExists("export.format.pdf", languageCode, "Export to PDF", createdBy);
                createTranslationIfNotExists("export.format.excel", languageCode, "Export to Excel", createdBy);
                createTranslationIfNotExists("export.format.csv", languageCode, "Export to CSV", createdBy);
                createTranslationIfNotExists("export.format.json", languageCode, "Export to JSON", createdBy);
                createTranslationIfNotExists("export.options.includeAttachments", languageCode, "Include Attachments",
                                createdBy);
                createTranslationIfNotExists("export.options.includeHistory", languageCode, "Include History",
                                createdBy);
                createTranslationIfNotExists("export.progress.preparing", languageCode, "Preparing export...",
                                createdBy);
                createTranslationIfNotExists("export.progress.generating", languageCode, "Generating file...",
                                createdBy);
                createTranslationIfNotExists("export.success.message", languageCode, "Export completed successfully",
                                createdBy);
                createTranslationIfNotExists("export.error.message", languageCode, "Export failed. Please try again.",
                                createdBy);
                createTranslationIfNotExists("notification.type.info", languageCode, "Information", createdBy);
                createTranslationIfNotExists("notification.type.success", languageCode, "Success", createdBy);
                createTranslationIfNotExists("notification.type.warning", languageCode, "Warning", createdBy);
                createTranslationIfNotExists("notification.type.error", languageCode, "Error", createdBy);
                createTranslationIfNotExists("notification.email.testResult", languageCode, "Test Result Notification",
                                createdBy);
                createTranslationIfNotExists("notification.email.projectUpdate", languageCode,
                                "Project Update Notification",
                                createdBy);
                createTranslationIfNotExists("notification.settings.enable", languageCode, "Enable Notifications",
                                createdBy);
                createTranslationIfNotExists("notification.settings.disable", languageCode, "Disable Notifications",
                                createdBy);
                createTranslationIfNotExists("notification.markAsRead", languageCode, "Mark as Read", createdBy);
                createTranslationIfNotExists("notification.clearAll", languageCode, "Clear All Notifications",
                                createdBy);
                createTranslationIfNotExists("workflow.status.pending", languageCode, "Pending", createdBy);
                createTranslationIfNotExists("workflow.status.approved", languageCode, "Approved", createdBy);
                createTranslationIfNotExists("workflow.status.rejected", languageCode, "Rejected", createdBy);
                createTranslationIfNotExists("workflow.status.inReview", languageCode, "In Review", createdBy);
                createTranslationIfNotExists("workflow.action.approve", languageCode, "Approve", createdBy);
                createTranslationIfNotExists("workflow.action.reject", languageCode, "Reject", createdBy);
                createTranslationIfNotExists("workflow.action.submit", languageCode, "Submit for Review", createdBy);
                createTranslationIfNotExists("workflow.action.withdraw", languageCode, "Withdraw", createdBy);
                createTranslationIfNotExists("workflow.comment.placeholder", languageCode, "Add a comment...",
                                createdBy);
                createTranslationIfNotExists("workflow.history.title", languageCode, "Workflow History", createdBy);
                createTranslationIfNotExists("navigation.menu.dashboard", languageCode, "Dashboard", createdBy);
                createTranslationIfNotExists("navigation.menu.projects", languageCode, "Projects", createdBy);
                createTranslationIfNotExists("navigation.menu.testCases", languageCode, "Test Cases", createdBy);
                createTranslationIfNotExists("navigation.menu.testPlans", languageCode, "Test Plans", createdBy);
                createTranslationIfNotExists("navigation.menu.testExecution", languageCode, "Test Execution",
                                createdBy);
                createTranslationIfNotExists("navigation.menu.reports", languageCode, "Reports", createdBy);
                createTranslationIfNotExists("navigation.menu.administration", languageCode, "Administration",
                                createdBy);
                createTranslationIfNotExists("navigation.breadcrumb.home", languageCode, "Home", createdBy);
                createTranslationIfNotExists("navigation.breadcrumb.separator", languageCode, "/", createdBy);
                createTranslationIfNotExists("navigation.back.button", languageCode, "Back", createdBy);
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
                createTranslationIfNotExists("validation.password.complexity", languageCode,
                                "Password must contain letters, numbers, and special characters", createdBy);
                createTranslationIfNotExists("validation.confirm.password", languageCode, "Passwords do not match",
                                createdBy);
                createTranslationIfNotExists("validation.date.invalid", languageCode, "Invalid date format", createdBy);
                createTranslationIfNotExists("validation.number.invalid", languageCode, "Invalid number format",
                                createdBy);
                createTranslationIfNotExists("notification.success.saved", languageCode, "Successfully saved",
                                createdBy);
                createTranslationIfNotExists("notification.success.deleted", languageCode, "Successfully deleted",
                                createdBy);
                createTranslationIfNotExists("notification.success.updated", languageCode, "Successfully updated",
                                createdBy);
                createTranslationIfNotExists("notification.error.networkError", languageCode, "Network error occurred",
                                createdBy);
                createTranslationIfNotExists("notification.error.serverError", languageCode, "Server error occurred",
                                createdBy);
                createTranslationIfNotExists("notification.info.processing", languageCode, "Processing...", createdBy);
                createTranslationIfNotExists("file.upload.title", languageCode, "File Upload", createdBy);
                createTranslationIfNotExists("file.upload.description", languageCode,
                                "Drag and drop files here or click to upload", createdBy);
                createTranslationIfNotExists("file.upload.progress", languageCode, "Upload in progress...", createdBy);
                createTranslationIfNotExists("file.upload.success", languageCode, "File uploaded successfully",
                                createdBy);
                createTranslationIfNotExists("file.upload.error", languageCode, "File upload failed", createdBy);
                createTranslationIfNotExists("file.size.limit", languageCode, "File size must not exceed {size}MB",
                                createdBy);
                createTranslationIfNotExists("file.type.invalid", languageCode, "Unsupported file type", createdBy);
                createTranslationIfNotExists("file.download.preparing", languageCode, "Preparing download...",
                                createdBy);
                createTranslationIfNotExists("file.download.error", languageCode, "File download failed", createdBy);
                createTranslationIfNotExists("file.management.title", languageCode, "File Management", createdBy);
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
                createTranslationIfNotExists("report.dashboard.title", languageCode, "Report Dashboard", createdBy);
                createTranslationIfNotExists("report.generate.title", languageCode, "Generate Report", createdBy);
                createTranslationIfNotExists("report.template.select", languageCode, "Select Report Template",
                                createdBy);
                createTranslationIfNotExists("report.period.select", languageCode, "Select Report Period", createdBy);
                createTranslationIfNotExists("report.format.pdf", languageCode, "PDF Format", createdBy);
                createTranslationIfNotExists("report.format.excel", languageCode, "Excel Format", createdBy);
                createTranslationIfNotExists("analytics.overview.title", languageCode, "Analytics Overview", createdBy);
                createTranslationIfNotExists("analytics.trend.title", languageCode, "Trend Analysis", createdBy);
                createTranslationIfNotExists("analytics.performance.title", languageCode, "Performance Analysis",
                                createdBy);
                createTranslationIfNotExists("analytics.quality.metrics", languageCode, "Quality Metrics", createdBy);
                createTranslationIfNotExists("settings.general.title", languageCode, "General Settings", createdBy);
                createTranslationIfNotExists("settings.system.title", languageCode, "System Settings", createdBy);
                createTranslationIfNotExists("settings.security.title", languageCode, "Security Settings", createdBy);
                createTranslationIfNotExists("settings.notification.title", languageCode, "Notification Settings",
                                createdBy);
                createTranslationIfNotExists("settings.appearance.title", languageCode, "Appearance Settings",
                                createdBy);
                createTranslationIfNotExists("settings.language.title", languageCode, "Language Settings", createdBy);
                createTranslationIfNotExists("settings.backup.title", languageCode, "Backup Settings", createdBy);
                createTranslationIfNotExists("config.database.title", languageCode, "Database Configuration",
                                createdBy);
                createTranslationIfNotExists("config.api.title", languageCode, "API Configuration", createdBy);
                createTranslationIfNotExists("config.integration.title", languageCode, "Integration Configuration",
                                createdBy);
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
                createTranslationIfNotExists("calendar.view.title", languageCode, "Calendar View", createdBy);
                createTranslationIfNotExists("calendar.event.create", languageCode, "Create Event", createdBy);
                createTranslationIfNotExists("calendar.event.edit", languageCode, "Edit Event", createdBy);
                createTranslationIfNotExists("calendar.event.delete", languageCode, "Delete Event", createdBy);
                createTranslationIfNotExists("schedule.test.execution", languageCode, "Test Execution Schedule",
                                createdBy);
                createTranslationIfNotExists("schedule.maintenance.title", languageCode, "Maintenance Schedule",
                                createdBy);
                createTranslationIfNotExists("schedule.release.title", languageCode, "Release Schedule", createdBy);
                createTranslationIfNotExists("reminder.notification.title", languageCode, "Reminder Notification",
                                createdBy);
                createTranslationIfNotExists("deadline.approaching.title", languageCode, "Deadline Approaching",
                                createdBy);
                createTranslationIfNotExists("milestone.achievement.title", languageCode, "Milestone Achievement",
                                createdBy);
                createTranslationIfNotExists("statistics.summary.title", languageCode, "Statistics Summary", createdBy);
                createTranslationIfNotExists("statistics.detailed.title", languageCode, "Detailed Statistics",
                                createdBy);
                createTranslationIfNotExists("chart.pie.title", languageCode, "Pie Chart", createdBy);
                createTranslationIfNotExists("chart.bar.title", languageCode, "Bar Chart", createdBy);
                createTranslationIfNotExists("chart.line.title", languageCode, "Line Chart", createdBy);
                createTranslationIfNotExists("chart.area.title", languageCode, "Area Chart", createdBy);
                createTranslationIfNotExists("chart.scatter.title", languageCode, "Scatter Chart", createdBy);
                createTranslationIfNotExists("chart.radar.title", languageCode, "Radar Chart", createdBy);
                createTranslationIfNotExists("chart.heatmap.title", languageCode, "Heatmap Chart", createdBy);
                createTranslationIfNotExists("chart.gauge.title", languageCode, "Gauge Chart", createdBy);
                createTranslationIfNotExists("communication.chat.title", languageCode, "Chat", createdBy);
                createTranslationIfNotExists("communication.message.send", languageCode, "Send Message", createdBy);
                createTranslationIfNotExists("communication.message.receive", languageCode, "Receive Message",
                                createdBy);
                createTranslationIfNotExists("collaboration.share.title", languageCode, "Share", createdBy);
                createTranslationIfNotExists("collaboration.comment.add", languageCode, "Add Comment", createdBy);
                createTranslationIfNotExists("collaboration.review.request", languageCode, "Request Review", createdBy);
                createTranslationIfNotExists("collaboration.feedback.title", languageCode, "Feedback", createdBy);
                createTranslationIfNotExists("discussion.forum.title", languageCode, "Discussion Forum", createdBy);
                createTranslationIfNotExists("discussion.thread.create", languageCode, "Create Discussion Thread",
                                createdBy);
                createTranslationIfNotExists("discussion.reply.add", languageCode, "Add Reply", createdBy);
                createTranslationIfNotExists("mobile.menu.title", languageCode, "Mobile Menu", createdBy);
                createTranslationIfNotExists("mobile.navigation.title", languageCode, "Mobile Navigation", createdBy);
                createTranslationIfNotExists("mobile.responsive.title", languageCode, "Responsive Design", createdBy);
                createTranslationIfNotExists("mobile.touch.gesture", languageCode, "Touch Gesture", createdBy);
                createTranslationIfNotExists("mobile.offline.mode", languageCode, "Offline Mode", createdBy);
                createTranslationIfNotExists("mobile.sync.title", languageCode, "Synchronization", createdBy);
                createTranslationIfNotExists("responsive.breakpoint.mobile", languageCode, "Mobile Breakpoint",
                                createdBy);
                createTranslationIfNotExists("responsive.breakpoint.tablet", languageCode, "Tablet Breakpoint",
                                createdBy);
                createTranslationIfNotExists("responsive.breakpoint.desktop", languageCode, "Desktop Breakpoint",
                                createdBy);
                createTranslationIfNotExists("responsive.layout.adaptive", languageCode, "Adaptive Layout", createdBy);
                createTranslationIfNotExists("header.nav.dashboard", languageCode, "Dashboard", createdBy);
                createTranslationIfNotExists("header.nav.organizationManagement", languageCode,
                                "Organization Management",
                                createdBy);
                createTranslationIfNotExists("header.nav.userManagement", languageCode, "User Management", createdBy);
                createTranslationIfNotExists("header.nav.schedulerManagement", languageCode, "Scheduler Management",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.title", languageCode, "System Dashboard",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.totalUsers", languageCode, "Total Users",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.activeProjects", languageCode,
                                "Active Projects",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.testCases", languageCode, "Test Cases",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.metrics.completedTests", languageCode,
                                "Completed Tests",
                                createdBy);
                createTranslationIfNotExists("organization.dashboard.stats.title", languageCode,
                                "Organization Statistics",
                                createdBy);
                createTranslationIfNotExists("common.buttons.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("common.buttons.reset", languageCode, "Reset", createdBy);
                createTranslationIfNotExists("common.buttons.apply", languageCode, "Apply", createdBy);
                createTranslationIfNotExists("common.buttons.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("common.buttons.ok", languageCode, "OK", createdBy);
                createTranslationIfNotExists("common.buttons.yes", languageCode, "Yes", createdBy);
                createTranslationIfNotExists("common.buttons.no", languageCode, "No", createdBy);
                createTranslationIfNotExists("common.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("junit.empty.noResults", languageCode, "No test results available",
                                createdBy);
                createTranslationIfNotExists("junit.empty.uploadPrompt", languageCode,
                                "Upload JUnit XML files to analyze test results.", createdBy);
                createTranslationIfNotExists("junit.empty.firstUpload", languageCode, "Upload First Test Result",
                                createdBy);
                createTranslationIfNotExists("junit.upload.fileSize", languageCode, "Size", createdBy);
                createTranslationIfNotExists("junit.upload.changeFile", languageCode, "Choose Another File", createdBy);
                createTranslationIfNotExists("junit.upload.executionInfo", languageCode, "Test Execution Information",
                                createdBy);
                createTranslationIfNotExists("junit.placeholder.description", languageCode, "Description (optional)",
                                createdBy);
                createTranslationIfNotExists("junit.upload.uploadingFile", languageCode, "Uploading \"{fileName}\"...",
                                createdBy);
                createTranslationIfNotExists("junit.upload.max", languageCode, "Max", createdBy);
                createTranslationIfNotExists("junit.detail.upload", languageCode, "Upload", createdBy);
                createTranslationIfNotExists("junit.detail.unknownUploader", languageCode, "Unknown", createdBy);
                createTranslationIfNotExists("junit.editor.title", languageCode, "Edit Test Case", createdBy);
                createTranslationIfNotExists("junit.editor.viewMode", languageCode, "(View Mode)", createdBy);
                createTranslationIfNotExists("junit.editor.editMode", languageCode, "(Edit Mode)", createdBy);
                createTranslationIfNotExists("junit.editor.viewOriginalData", languageCode, "View Original Data",
                                createdBy);
                createTranslationIfNotExists("junit.editor.editHistory", languageCode, "Edit History", createdBy);
                createTranslationIfNotExists("junit.editor.status.passedDesc", languageCode, "Test passed successfully",
                                createdBy);
                createTranslationIfNotExists("junit.editor.status.failedDesc", languageCode, "Test failed", createdBy);
                createTranslationIfNotExists("junit.editor.status.errorDesc", languageCode,
                                "An error occurred during test execution", createdBy);
                createTranslationIfNotExists("junit.editor.status.skippedDesc", languageCode, "Test was skipped",
                                createdBy);
                createTranslationIfNotExists("junit.editor.priority.high", languageCode, "High", createdBy);
                createTranslationIfNotExists("junit.editor.priority.medium", languageCode, "Medium", createdBy);
                createTranslationIfNotExists("junit.editor.priority.low", languageCode, "Low", createdBy);
                createTranslationIfNotExists("junit.editor.tags", languageCode, "Tags", createdBy);
                createTranslationIfNotExists("junit.editor.tagsPlaceholder", languageCode,
                                "Enter comma-separated tags (e.g., bug, regression, API)", createdBy);
                createTranslationIfNotExists("junit.editor.tagsHelp", languageCode,
                                "You can enter multiple tags separated by commas", createdBy);
                createTranslationIfNotExists("junit.editor.notes", languageCode, "Notes", createdBy);
                createTranslationIfNotExists("junit.editor.notesPlaceholder", languageCode,
                                "Enter additional notes for this test case", createdBy);
                createTranslationIfNotExists("junit.editor.preview", languageCode, "Preview", createdBy);
                createTranslationIfNotExists("junit.editor.saving", languageCode, "Saving...", createdBy);
                createTranslationIfNotExists("junit.editor.error.noTestCase", languageCode, "Test case not found",
                                createdBy);
                createTranslationIfNotExists("junit.editor.error.saveFailed", languageCode, "Failed to save test case",
                                createdBy);

                // Additional JUnit Editor Translations
                createTranslationIfNotExists("junit.editor.originalJunitData", languageCode, "Original JUnit Data",
                                createdBy);
                createTranslationIfNotExists("junit.editor.testName", languageCode, "Test Name", createdBy);
                createTranslationIfNotExists("junit.editor.className", languageCode, "Class Name", createdBy);
                createTranslationIfNotExists("junit.editor.executionTime", languageCode, "Execution Time", createdBy);
                createTranslationIfNotExists("junit.editor.originalStatus", languageCode, "Original Status", createdBy);
                createTranslationIfNotExists("junit.editor.failureMessage", languageCode, "Failure Message", createdBy);
                createTranslationIfNotExists("junit.editor.stackTrace", languageCode, "Stack Trace", createdBy);
                createTranslationIfNotExists("junit.editor.userEditInfo", languageCode, "User Edit Information",
                                createdBy);
                createTranslationIfNotExists("junit.editor.userDefinedTitle", languageCode, "User-Defined Title",
                                createdBy);
                createTranslationIfNotExists("junit.editor.userDefinedTitleHelp", languageCode,
                                "Enter a custom title for this test case.", createdBy);
                createTranslationIfNotExists("junit.editor.userDefinedStatus", languageCode, "User-Defined Status",
                                createdBy);
                createTranslationIfNotExists("junit.editor.useOriginalStatus", languageCode, "Use Original Status",
                                createdBy);
                createTranslationIfNotExists("junit.editor.priorityLabel", languageCode, "Priority", createdBy);

                createTranslationIfNotExists("rag.manager.noProject", languageCode, "Please select a project first.",
                                createdBy);
                createTranslationIfNotExists("rag.upload.title", languageCode, "Document Upload", createdBy);
                createTranslationIfNotExists("rag.upload.description", languageCode,
                                "Upload PDF, DOCX, DOC, TXT files to register them in the RAG system. (Maximum 50MB)",
                                createdBy);
                createTranslationIfNotExists("rag.upload.dragAndDrop", languageCode,
                                "Drag files here or click to select",
                                createdBy);
                createTranslationIfNotExists("rag.upload.selectFiles", languageCode, "Select Files", createdBy);
                createTranslationIfNotExists("rag.upload.selectedFiles", languageCode, "Selected Files", createdBy);
                createTranslationIfNotExists("rag.upload.uploading", languageCode, "Uploading", createdBy);
                createTranslationIfNotExists("rag.upload.upload", languageCode, "Upload", createdBy);
                createTranslationIfNotExists("rag.upload.error.unsupportedFileType", languageCode,
                                "Unsupported file type. (Only PDF, DOCX, DOC, TXT allowed)", createdBy);
                createTranslationIfNotExists("rag.upload.error.fileTooLarge", languageCode,
                                "File size is too large. (Maximum {maxSize}MB)", createdBy);
                createTranslationIfNotExists("rag.upload.error.noFilesSelected", languageCode,
                                "Please select files to upload.",
                                createdBy);
                createTranslationIfNotExists("rag.upload.parser.label", languageCode, "Document Analysis Parser",
                                createdBy);
                createTranslationIfNotExists("rag.upload.parser.pypdf2.description", languageCode, "Basic local parser",
                                createdBy);
                createTranslationIfNotExists("rag.upload.parser.pymupdf.description", languageCode,
                                "Fast local parser with rich features", createdBy);
                createTranslationIfNotExists("rag.upload.parser.pymupdf4llm.description", languageCode,
                                "LLM-optimized markdown extraction", createdBy);
                createTranslationIfNotExists("rag.upload.parser.upstage.description", languageCode,
                                "Cloud API with advanced layout analysis (requires upstage_api_key)", createdBy);
                createTranslationIfNotExists("rag.preview.loading", languageCode, "Loading PDF...", createdBy);
                createTranslationIfNotExists("rag.preview.pdfOnly", languageCode, "Only PDF files can be previewed.",
                                createdBy);
                createTranslationIfNotExists("rag.preview.error", languageCode, "Unable to load PDF.", createdBy);
                createTranslationIfNotExists("rag.document.status.pending", languageCode, "Pending", createdBy);
                createTranslationIfNotExists("rag.document.status.analyzing", languageCode, "Analyzing", createdBy);
                createTranslationIfNotExists("rag.document.status.completed", languageCode, "Completed", createdBy);
                createTranslationIfNotExists("rag.document.status.failed", languageCode, "Failed", createdBy);
                createTranslationIfNotExists("rag.document.loading", languageCode, "Loading document list...",
                                createdBy);
                createTranslationIfNotExists("rag.document.empty", languageCode, "No documents uploaded", createdBy);
                createTranslationIfNotExists("rag.document.emptyDescription", languageCode,
                                "Use the upload area above to register documents", createdBy);
                createTranslationIfNotExists("rag.document.list.title", languageCode, "Uploaded Documents", createdBy);
                createTranslationIfNotExists("rag.document.list.fileName", languageCode, "File Name", createdBy);
                createTranslationIfNotExists("rag.document.list.fileSize", languageCode, "Size", createdBy);
                createTranslationIfNotExists("rag.document.list.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("rag.document.list.chunks", languageCode, "Chunks", createdBy);
                createTranslationIfNotExists("rag.document.list.uploadDate", languageCode, "Upload Date", createdBy);
                createTranslationIfNotExists("rag.document.list.actions", languageCode, "Actions", createdBy);
                createTranslationIfNotExists("rag.document.download", languageCode, "Download Document", createdBy);
                createTranslationIfNotExists("rag.document.delete", languageCode, "Delete Document", createdBy);
                createTranslationIfNotExists("rag.document.deleteDialog.title", languageCode,
                                "Confirm Document Deletion",
                                createdBy);
                createTranslationIfNotExists("rag.document.deleteDialog.message", languageCode,
                                "Are you sure you want to delete this document? This action cannot be undone.",
                                createdBy);
                createTranslationIfNotExists("rag.document.pagination.rowsPerPage", languageCode, "Rows per page:",
                                createdBy);
                createTranslationIfNotExists("rag.document.viewChunks", languageCode, "View Chunks", createdBy);
                createTranslationIfNotExists("rag.document.list.regularDocuments", languageCode, "Uploaded Documents",
                                createdBy);
                createTranslationIfNotExists("rag.document.list.testCaseDocuments", languageCode, "TestCase Documents",
                                createdBy);
                createTranslationIfNotExists("rag.document.list.uploadButton", languageCode, "Upload Document",
                                createdBy);
                createTranslationIfNotExists("rag.document.global.promoteAction", languageCode,
                                "Move to Global Library",
                                createdBy);
                createTranslationIfNotExists("rag.document.global.requestAction", languageCode,
                                "Request Global Registration",
                                createdBy);
                createTranslationIfNotExists("rag.document.global.promoteTitle", languageCode, "Move to Global Library",
                                createdBy);
                createTranslationIfNotExists("rag.document.global.promoteDescription", languageCode,
                                "Move this document to the global RAG knowledge base accessible to every project.",
                                createdBy);
                createTranslationIfNotExists("rag.document.global.promoteReason", languageCode, "Reason (optional)",
                                createdBy);
                createTranslationIfNotExists("rag.document.global.promoteSuccess", languageCode,
                                "Document moved to the global RAG library.", createdBy);
                createTranslationIfNotExists("rag.document.global.requestTitle", languageCode,
                                "Request Global Registration",
                                createdBy);
                createTranslationIfNotExists("rag.document.global.requestSubmitted", languageCode,
                                "Global document registration request has been sent to the administrator.", createdBy);
                createTranslationIfNotExists("rag.document.global.requestDescription", languageCode,
                                "Ask an admin to add this document to the global RAG knowledge base.", createdBy);
                createTranslationIfNotExists("rag.document.global.requestMessage", languageCode,
                                "Additional message (optional)", createdBy);
                createTranslationIfNotExists("rag.document.global.requestSubmitted", languageCode,
                                "Your request has been sent to the administrator.", createdBy);
                createTranslationIfNotExists("rag.similar.title", languageCode, "Similar Search", createdBy);
                createTranslationIfNotExists("rag.similar.description", languageCode,
                                "Enter keywords or description, and the RAG system will find similar test cases or documents.",
                                createdBy);
                createTranslationIfNotExists("rag.similar.searchQuery", languageCode, "Search Query", createdBy);
                createTranslationIfNotExists("rag.similar.searchPlaceholder", languageCode,
                                "e.g., Login functionality test, Sign-up validation", createdBy);
                createTranslationIfNotExists("rag.similar.search", languageCode, "Search", createdBy);
                createTranslationIfNotExists("rag.similar.searching", languageCode, "Searching...", createdBy);
                createTranslationIfNotExists("rag.similar.noResults", languageCode,
                                "No results found. Try different keywords.",
                                createdBy);
                createTranslationIfNotExists("rag.similar.resultsCount", languageCode, "Search Results ({count})",
                                createdBy);
                createTranslationIfNotExists("rag.similar.testCaseResults", languageCode, "Test Cases", createdBy);
                createTranslationIfNotExists("rag.similar.documentResults", languageCode, "Documents", createdBy);
                createTranslationIfNotExists("rag.similar.metadata", languageCode,
                                "Document ID: {documentId} | Chunk Order: {chunkIndex}", createdBy);
                createTranslationIfNotExists("rag.similar.copy", languageCode, "Copy", createdBy);
                createTranslationIfNotExists("rag.similar.addTestCase", languageCode, "Add as Test Case", createdBy);
                createTranslationIfNotExists("rag.similar.unknownDocument", languageCode, "Unknown", createdBy);
                createTranslationIfNotExists("rag.similar.testCaseTitle", languageCode, "Test Case - {fileName}",
                                createdBy);
                createTranslationIfNotExists("rag.similar.sourceTestcase", languageCode, "Test Case", createdBy);
                createTranslationIfNotExists("rag.similar.sourceDocument", languageCode, "Document", createdBy);
                createTranslationIfNotExists("rag.similar.showDetails", languageCode, "Show Details", createdBy);
                createTranslationIfNotExists("rag.similar.noHighSimilarityResults", languageCode,
                                "No documents with 82% or higher similarity found. See below for lower similarity results.",
                                createdBy);
                createTranslationIfNotExists("rag.similar.lowSimilarityCollapsed", languageCode,
                                "Low similarity (click to view)", createdBy);

                // Advanced Search Settings English Translations
                createTranslationIfNotExists("rag.similar.advancedSettings", languageCode, "Advanced Search Settings",
                                createdBy);
                createTranslationIfNotExists("rag.similar.advancedSettings.enabled", languageCode, "Enabled",
                                createdBy);
                createTranslationIfNotExists("rag.similar.advancedSettings.disabled", languageCode, "Disabled",
                                createdBy);
                createTranslationIfNotExists("rag.similar.advancedSettings.use", languageCode, "Use Advanced Search",
                                createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod", languageCode, "Search Method", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.vector", languageCode, "Vector Search",
                                createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.vector.description", languageCode,
                                "Semantic similarity-based (pure vector)", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.bm25", languageCode, "BM25 Search", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.bm25.description", languageCode,
                                "Keyword-based (exact word matching)", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.hybrid", languageCode, "Hybrid Search",
                                createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.hybrid.description", languageCode,
                                "Vector + BM25 combined (RRF)", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.hybridRerank", languageCode,
                                "Hybrid + Reranker ⭐",
                                createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.hybridRerank.description", languageCode,
                                "Best quality (recommended) - slower", createdBy);
                createTranslationIfNotExists("rag.similar.weightAdjustment", languageCode, "Search Weight Adjustment",
                                createdBy);
                createTranslationIfNotExists("rag.similar.vectorWeight", languageCode, "Vector Search: {weight}%",
                                createdBy);
                createTranslationIfNotExists("rag.similar.bm25Weight", languageCode, "BM25 Search: {weight}%",
                                createdBy);
                createTranslationIfNotExists("rag.similar.recommendedSettings", languageCode,
                                "Recommended: Vector 60% + BM25 40% (optimized for Korean)", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.vector.info", languageCode,
                                "📊 Search based on semantic similarity. Finds documents with similar meanings.",
                                createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.bm25.info", languageCode,
                                "🔍 Keyword-based search. Strong in exact word matching.", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.hybrid.info", languageCode,
                                "⚡ Combines vector and BM25 for balanced search results.", createdBy);
                createTranslationIfNotExists("rag.similar.searchMethod.hybridRerank.info", languageCode,
                                "⭐ Reranks hybrid search results for the highest quality. (Processing time: ~2-3x)",
                                createdBy);

                createTranslationIfNotExists("projectHeader.tabs.ragDocuments", languageCode, "RAG Documents",
                                createdBy);

                // RAG Chat Interface Translations
                createTranslationIfNotExists("rag.chat.title", languageCode, "AI Q&A", createdBy);
                createTranslationIfNotExists("rag.chat.exitFullScreen", languageCode, "Exit Full Screen", createdBy);
                createTranslationIfNotExists("rag.chat.enterFullScreen", languageCode, "Enter Full Screen", createdBy);
                createTranslationIfNotExists("rag.chat.retry", languageCode, "Retry", createdBy);
                createTranslationIfNotExists("rag.chat.clear", languageCode, "Clear Conversation", createdBy);
                createTranslationIfNotExists("rag.chat.persistToggle", languageCode, "Auto-save Conversation",
                                createdBy);
                createTranslationIfNotExists("rag.chat.useRagSearch", languageCode, "Search RAG Documents First",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadSelectLabel", languageCode, "Saved Threads", createdBy);
                createTranslationIfNotExists("rag.chat.threadAutoOption", languageCode, "Auto-create New Thread",
                                createdBy);
                createTranslationIfNotExists("rag.chat.untitledThread", languageCode, "Untitled Thread", createdBy);
                createTranslationIfNotExists("rag.chat.refreshThreads", languageCode, "Refresh Threads", createdBy);
                createTranslationIfNotExists("rag.chat.deleteThread", languageCode, "Delete Thread", createdBy);
                createTranslationIfNotExists("rag.chat.createThread", languageCode, "New Thread", createdBy);
                createTranslationIfNotExists("rag.chat.manageThreadsAction", languageCode, "Manage Threads", createdBy);
                createTranslationIfNotExists("rag.chat.categorySelectLabel", languageCode, "Category", createdBy);
                createTranslationIfNotExists("rag.chat.empty", languageCode, "Ask a question about the documents.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.placeholder", languageCode, "Enter your message...", createdBy);
                createTranslationIfNotExists("rag.chat.hint", languageCode, "Shift + Enter: Line Break | Enter: Send",
                                createdBy);
                createTranslationIfNotExists("rag.chat.deleteThreadConfirm", languageCode,
                                "Are you sure you want to delete this thread? All conversation history will be deleted.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadTitleLabel", languageCode, "Title", createdBy);
                createTranslationIfNotExists("rag.chat.threadDescriptionLabel", languageCode, "Description (Optional)",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadCreateAction", languageCode, "Create", createdBy);
                createTranslationIfNotExists("rag.chat.editResponse", languageCode, "Edit Response", createdBy);
                createTranslationIfNotExists("rag.chat.editPlaceholder", languageCode,
                                "Enter the revised response content.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.deleteMessageTitle", languageCode, "Delete Response", createdBy);
                createTranslationIfNotExists("rag.chat.deleteMessageConfirm", languageCode,
                                "Are you sure you want to delete this response? This action cannot be undone.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadTitleRequired", languageCode,
                                "Please enter a thread title.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadCreateFailed", languageCode, "Failed to create thread.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadDeleteFailed", languageCode, "Failed to delete thread.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.editFailed", languageCode, "Failed to edit message.", createdBy);
                createTranslationIfNotExists("rag.chat.messageDeleteFailed", languageCode, "Failed to delete message.",
                                createdBy);

                // RAG Thread Manager Dialog Translations
                createTranslationIfNotExists("rag.chat.manageThreads", languageCode, "Manage Conversation Threads",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadListLabel", languageCode, "Thread List", createdBy);
                createTranslationIfNotExists("rag.chat.threadEmpty", languageCode, "No saved threads.", createdBy);
                createTranslationIfNotExists("rag.chat.threadDetailsLabel", languageCode, "Thread Details", createdBy);
                createTranslationIfNotExists("rag.chat.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("rag.chat.threadNotFound", languageCode,
                                "Cannot find the selected thread.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadLoadError", languageCode, "Failed to load thread.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadUpdateError", languageCode, "Failed to update thread.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadDeleteError", languageCode, "Failed to delete thread.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadArchivedLabel", languageCode, "Archive", createdBy);
                createTranslationIfNotExists("rag.chat.threadMessagesLabel", languageCode, "Conversation History",
                                createdBy);
                createTranslationIfNotExists("rag.chat.threadMessagesEmpty", languageCode,
                                "No messages in this conversation.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.roleAssistant", languageCode, "Assistant", createdBy);
                createTranslationIfNotExists("rag.chat.roleUser", languageCode, "User", createdBy);
                createTranslationIfNotExists("rag.chat.threadDeleteAction", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("rag.chat.threadSaveAction", languageCode, "Save", createdBy);

                // LLM configuration check related translations
                createTranslationIfNotExists("rag.chat.llmNotConfigured", languageCode,
                                "Default LLM Configuration Required",
                                createdBy);
                createTranslationIfNotExists("rag.chat.llmNotConfiguredMessage", languageCode,
                                "To use AI Q&A, an administrator must set an LLM (Language Model) as the default. Please contact your administrator.",
                                createdBy);
                createTranslationIfNotExists("rag.chat.recheckLlm", languageCode, "Recheck", createdBy);
                createTranslationIfNotExists("rag.chat.checkingLlm", languageCode, "Checking LLM configuration...",
                                createdBy);
                createTranslationIfNotExists("rag.chat.generatingAnswer", languageCode, "AI is generating an answer...",
                                createdBy);

                // Document Chunks translations
                createTranslationIfNotExists("rag.chunks.dialog.title", languageCode, "View Document Chunks",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.showMore", languageCode, "Show More", createdBy);
                createTranslationIfNotExists("rag.chunks.showLess", languageCode, "Show Less", createdBy);
                createTranslationIfNotExists("rag.chunks.summaryLoadFailed", languageCode,
                                "Failed to load LLM summary.",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.empty", languageCode,
                                "No chunks available. Please analyze the document first.", createdBy);
                createTranslationIfNotExists("rag.chunks.filteredMode", languageCode,
                                "Showing only AI-referenced chunks",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.loaded", languageCode, "Loaded", createdBy);
                createTranslationIfNotExists("rag.chunks.scrollForMore", languageCode, "Scroll for more", createdBy);
                createTranslationIfNotExists("rag.chunks.viewLlmSummary", languageCode, "View LLM Analysis Summary",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.metadata", languageCode, "Metadata", createdBy);
                createTranslationIfNotExists("rag.chunks.loadingMore", languageCode, "Loading more chunks...",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.allLoaded", languageCode, "All chunks loaded", createdBy);
                createTranslationIfNotExists("rag.chunks.viewCombinedSummary", languageCode,
                                "View LLM Analysis Summary",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.documentSummaryTitle", languageCode, "LLM Analysis Summary",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.noLlmSummary", languageCode,
                                "No LLM analysis summary available yet.",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.loadingLlmSummary", languageCode,
                                "Loading LLM analysis summary...",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.chunkLabel", languageCode, "Chunk", createdBy);
                createTranslationIfNotExists("rag.chunks.llmSummaryTitle", languageCode, "LLM Analysis Summary",
                                createdBy);
                createTranslationIfNotExists("rag.chunks.originalText", languageCode, "Original Text", createdBy);
                createTranslationIfNotExists("rag.chunks.llmAnalysis", languageCode, "LLM Analysis Result", createdBy);
                createTranslationIfNotExists("rag.chunks.summaryNotReady", languageCode,
                                "Summary is not available yet.",
                                createdBy);
                createTranslationIfNotExists("rag.preview.loading", languageCode, "Loading PDF...", createdBy);

                // Document Analysis translations
                createTranslationIfNotExists("rag.analysis.llmConfig", languageCode, "LLM Configuration", createdBy);
                createTranslationIfNotExists("rag.analysis.noActiveConfigs", languageCode,
                                "No active LLM configurations. Please add and activate a configuration in the LLM settings page.",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.defaultOnlyInfo", languageCode,
                                "Only the default LLM configuration can be used for your role.", createdBy);
                createTranslationIfNotExists("rag.analysis.selectConfig", languageCode, "Select LLM Configuration",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.defaultBadge", languageCode, "[Default]", createdBy);
                createTranslationIfNotExists("rag.analysis.selectedConfigInfo", languageCode,
                                "Selected Configuration Info",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.provider", languageCode, "Provider:", createdBy);
                createTranslationIfNotExists("rag.analysis.model", languageCode, "Model:", createdBy);
                createTranslationIfNotExists("rag.analysis.apiUrl", languageCode, "API URL:", createdBy);
                createTranslationIfNotExists("rag.analysis.defaultValue", languageCode, "Default", createdBy);
                createTranslationIfNotExists("rag.analysis.apiKey", languageCode, "API Key (Optional)", createdBy);
                createTranslationIfNotExists("rag.analysis.apiKeyHelper", languageCode,
                                "Leave blank to use the API key saved in the selected LLM configuration", createdBy);
                createTranslationIfNotExists("rag.analysis.promptTemplate", languageCode, "Prompt Template", createdBy);
                createTranslationIfNotExists("rag.analysis.promptTemplateHelper", languageCode,
                                "Use {chunk_text} placeholder",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.maxTokens", languageCode, "Max Tokens", createdBy);
                createTranslationIfNotExists("rag.analysis.temperature", languageCode, "Temperature", createdBy);
                createTranslationIfNotExists("rag.analysis.batchSize", languageCode, "Batch Size (Chunks)", createdBy);
                createTranslationIfNotExists("rag.analysis.batchSizeHelper", languageCode,
                                "Number of chunks to process at once", createdBy);
                createTranslationIfNotExists("rag.analysis.pauseAfterBatch", languageCode, "Pause After Each Batch",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.pauseAfterBatchTooltip", languageCode,
                                "Pause after each batch and wait for user confirmation", createdBy);
                createTranslationIfNotExists("rag.analysis.continueTooltip", languageCode,
                                "Continue analyzing all chunks without interruption", createdBy);
                createTranslationIfNotExists("rag.analysis.progress", languageCode, "Progress", createdBy);
                createTranslationIfNotExists("rag.analysis.processing", languageCode, "Processing:", createdBy);
                createTranslationIfNotExists("rag.analysis.chunkNumber", languageCode, "Chunk #{number}", createdBy);
                createTranslationIfNotExists("rag.analysis.completed", languageCode, "Completed: {count}", createdBy);
                createTranslationIfNotExists("rag.analysis.total", languageCode, "/ Total {count} Chunks", createdBy);
                createTranslationIfNotExists("rag.analysis.cost", languageCode, "Cost:", createdBy);
                createTranslationIfNotExists("rag.analysis.results", languageCode, "Analysis Results", createdBy);
                createTranslationIfNotExists("rag.analysis.chunkColumn", languageCode, "Chunk #", createdBy);
                createTranslationIfNotExists("rag.analysis.originalText", languageCode, "Original Text", createdBy);
                createTranslationIfNotExists("rag.analysis.llmResponse", languageCode, "LLM Response", createdBy);
                createTranslationIfNotExists("rag.analysis.tokens", languageCode, "Tokens", createdBy);
                createTranslationIfNotExists("rag.analysis.costColumn", languageCode, "Cost", createdBy);
                createTranslationIfNotExists("rag.analysis.estimateCost", languageCode, "Estimate Cost", createdBy);
                createTranslationIfNotExists("rag.analysis.stop", languageCode, "Stop", createdBy);
                createTranslationIfNotExists("rag.analysis.resume", languageCode, "Resume", createdBy);
                createTranslationIfNotExists("rag.analysis.pause", languageCode, "Pause", createdBy);

                // Cost warning dialog
                createTranslationIfNotExists("rag.analysis.costWarning.title", languageCode,
                                "Estimated LLM Analysis Cost",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.highCostAlert", languageCode,
                                "This operation may incur significant costs. Do you want to continue?", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.modelSection", languageCode, "LLM Model",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.targetSection", languageCode, "Analysis Target",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.chunkCount", languageCode,
                                "Total {count} Chunks",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.tokenUsageSection", languageCode,
                                "Estimated Token Usage", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.inputTokens", languageCode, "Input Tokens",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.outputTokens", languageCode, "Output Tokens",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.totalTokens", languageCode, "Total Tokens",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.costSection", languageCode,
                                "Estimated Cost (USD)",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.inputCost", languageCode, "Input Cost",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.outputCost", languageCode, "Output Cost",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.totalCost", languageCode, "Total Estimated Cost",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.costPerChunk", languageCode,
                                "(Approximately ${cost} per chunk)", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.priceSection", languageCode,
                                "Model Pricing (per 1K tokens)", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.priceInput", languageCode, "Input", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.priceOutput", languageCode, "Output", createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.confirm", languageCode,
                                "Confirm & Start Analysis",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.costWarning.starting", languageCode, "Starting...",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.error.costEstimate", languageCode,
                                "Failed to estimate cost.",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.error.statusCheck", languageCode,
                                "Failed to check analysis status.",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.error.startAnalysis", languageCode,
                                "Failed to start LLM analysis.",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.error.resume", languageCode, "Failed to resume analysis.",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.error.restart", languageCode, "Failed to restart analysis.",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.error.pause", languageCode, "Failed to pause analysis.",
                                createdBy);
                createTranslationIfNotExists("rag.analysis.error.cancel", languageCode, "Failed to cancel analysis.",
                                createdBy);

                createTranslationIfNotExists("attachment.success.upload", languageCode, "File uploaded successfully.",
                                createdBy);
                createTranslationIfNotExists("attachment.success.delete", languageCode,
                                "Attachment deleted successfully.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.auth.failed", languageCode,
                                "User authentication failed.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.upload.validation", languageCode,
                                "File validation failed.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.upload.io", languageCode,
                                "An error occurred while saving the file.", createdBy);
                createTranslationIfNotExists("attachment.error.upload.general", languageCode,
                                "A server error occurred.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.list.failed", languageCode,
                                "An error occurred while retrieving the attachment list.", createdBy);
                createTranslationIfNotExists("attachment.error.notfound", languageCode, "Attachment not found.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.info.failed", languageCode,
                                "An error occurred while retrieving attachment information.", createdBy);
                createTranslationIfNotExists("attachment.error.download.notfound", languageCode, "File not found.",
                                createdBy);
                createTranslationIfNotExists("attachment.error.download.io", languageCode,
                                "An error occurred while downloading the file.", createdBy);
                createTranslationIfNotExists("attachment.error.download.general", languageCode,
                                "An unexpected error occurred while downloading the file.", createdBy);
                createTranslationIfNotExists("attachment.error.delete.failed", languageCode,
                                "An error occurred while deleting the attachment.", createdBy);
                createTranslationIfNotExists("attachment.error.storage.failed", languageCode,
                                "An error occurred while retrieving storage information.", createdBy);

                // Additional translations for RAG document list
                createTranslationIfNotExists("rag.document.list.llmSummaryStatus", languageCode, "LLM Summary Status",
                                createdBy);
                createTranslationIfNotExists("rag.document.list.summaryProgress", languageCode, "Summary Progress",
                                createdBy);
                createTranslationIfNotExists("rag.document.list.analyzedChunks", languageCode, "Analyzed Chunks",
                                createdBy);
                createTranslationIfNotExists("rag.document.list.parser", languageCode, "Parser", createdBy);
                createTranslationIfNotExists("rag.document.list.embeddingStatus", languageCode, "Embedding", createdBy);
                createTranslationIfNotExists("rag.document.embedding.pending", languageCode, "Pending", createdBy);
                createTranslationIfNotExists("rag.document.embedding.generating", languageCode, "Generating",
                                createdBy);
                createTranslationIfNotExists("rag.document.embedding.completed", languageCode, "Completed", createdBy);
                createTranslationIfNotExists("rag.document.embedding.failed", languageCode, "Failed", createdBy);
                createTranslationIfNotExists("rag.llmAnalysis.status.notStartedMessage", languageCode,
                                "LLM analysis has not been started yet. Please start LLM analysis from the document list.",
                                createdBy);
                createTranslationIfNotExists("rag.llmAnalysis.status.errorMessage", languageCode,
                                "An error occurred during analysis.", createdBy);
                createTranslationIfNotExists("rag.llmAnalysis.status.processingPausedMessage", languageCode,
                                "LLM analysis is in progress. You can view the results of {analyzedChunks} analyzed chunks so far.",
                                createdBy);

                // Document List - Additional Translations (2024 additions)
                createTranslationIfNotExists("rag.document.summary.title", languageCode,
                                "LLM Analysis Summary - {documentName}", createdBy);
                createTranslationIfNotExists("rag.document.summary.fetchFailed", languageCode,
                                "Failed to fetch analysis results.", createdBy);
                createTranslationIfNotExists("rag.document.summary.noData", languageCode, "No results to display.",
                                createdBy);
                createTranslationIfNotExists("rag.document.list.refreshButton", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("rag.document.summary.totalChunksLabel", languageCode,
                                "{count} chunks in total",
                                createdBy);
                createTranslationIfNotExists("rag.document.summary.analyzedChunksLabel", languageCode,
                                "Analyzed: {count}",
                                createdBy);
                createTranslationIfNotExists("rag.document.summary.progressLabel", languageCode,
                                "Progress: {progress}%",
                                createdBy);
                createTranslationIfNotExists("rag.document.summary.chunkTemplate", languageCode,
                                "📄 Chunk {chunkNumber}",
                                createdBy);
                createTranslationIfNotExists("rag.document.summary.progressFormat", languageCode,
                                "{analyzed}/{total} chunks",
                                createdBy);
                createTranslationIfNotExists("rag.document.summary.resultsSummary", languageCode,
                                "LLM Analysis Results Summary", createdBy);

                // Job History Related English Translations
                createTranslationIfNotExists("rag.document.jobHistory.title", languageCode, "Job History - {fileName}",
                                createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.jobId", languageCode, "Job ID", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.llmProvider", languageCode, "LLM Provider",
                                createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.llmModel", languageCode, "LLM Model", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.progress", languageCode, "Progress", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.chunks", languageCode, "Chunks", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.cost", languageCode, "Cost (USD)", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.tokens", languageCode, "Tokens", createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.startTime", languageCode, "Start Time",
                                createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.completedTime", languageCode, "Completed Time",
                                createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.pausedTime", languageCode, "Paused Time",
                                createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.errorMessage", languageCode, "Error Message",
                                createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.hasError", languageCode, "Error Exists",
                                createdBy);
                createTranslationIfNotExists("rag.document.jobHistory.empty", languageCode,
                                "No job history available for this document.", createdBy);

                // Alert Message Related English Translations
                createTranslationIfNotExists("rag.document.alert.pauseUnavailable", languageCode,
                                "Only jobs in progress can be paused.", createdBy);
                createTranslationIfNotExists("rag.document.alert.resumeUnavailable", languageCode,
                                "Only paused jobs can be resumed.", createdBy);
                createTranslationIfNotExists("rag.document.alert.statusLoading", languageCode,
                                "Loading job status. Please try again in a moment.", createdBy);
                createTranslationIfNotExists("rag.document.alert.alreadyProcessing", languageCode,
                                "Analysis is already in progress.", createdBy);
                createTranslationIfNotExists("rag.document.alert.alreadyProcessingWithProgress", languageCode,
                                "Analysis is already in progress. (Progress: {progress})", createdBy);
                createTranslationIfNotExists("rag.document.alert.cancelConfirm", languageCode,
                                "Are you sure you want to cancel the analysis of \"{documentName}\"? The results so far will be preserved.",
                                createdBy);

                // Error Message Related English Translations
                createTranslationIfNotExists("rag.document.error.listFailed", languageCode,
                                "Failed to retrieve document list.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.uploadFailed", languageCode,
                                "Failed to upload document.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.deleteFailed", languageCode,
                                "Failed to delete document.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.downloadFailed", languageCode,
                                "Failed to download document.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.analyzeFailed", languageCode,
                                "Failed to analyze document.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.embeddingFailed", languageCode,
                                "Failed to generate embeddings.", createdBy);
                createTranslationIfNotExists("rag.document.error.promoteFailed", languageCode,
                                "Failed to move document to global library.", createdBy);
                createTranslationIfNotExists("rag.document.error.requestFailed", languageCode,
                                "Failed to request global registration.", createdBy);
                createTranslationIfNotExists("rag.document.error.jobHistoryFailed", languageCode,
                                "Failed to retrieve job history.", createdBy);
                createTranslationIfNotExists("rag.document.error.pauseFailed", languageCode, "Failed to pause.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.resumeFailed", languageCode, "Failed to resume.",
                                createdBy);
                createTranslationIfNotExists("rag.document.error.cancelFailed", languageCode, "Failed to cancel.",
                                createdBy);

                // Confirm Dialog Related English Translations
                createTranslationIfNotExists("rag.document.confirm.analyze", languageCode,
                                "Are you sure you want to analyze document \"{fileName}\"?", createdBy);
                createTranslationIfNotExists("rag.document.confirm.generateEmbeddings", languageCode,
                                "Are you sure you want to generate embeddings for document \"{fileName}\"?", createdBy);

                // LLM Configuration Management English Translations
                createTranslationIfNotExists("common.create", languageCode, "Create", createdBy);
                createTranslationIfNotExists("common.edit", languageCode, "Edit", createdBy);
                createTranslationIfNotExists("common.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("admin.llmConfig.title", languageCode, "LLM Configuration Management",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.addConfig", languageCode, "Add LLM Configuration",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.editConfig", languageCode, "Edit LLM Configuration",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.createConfig", languageCode, "Create LLM Configuration",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.name", languageCode, "Name", createdBy);
                createTranslationIfNotExists("admin.llmConfig.provider", languageCode, "Provider", createdBy);
                createTranslationIfNotExists("admin.llmConfig.model", languageCode, "Model", createdBy);
                createTranslationIfNotExists("admin.llmConfig.apiUrl", languageCode, "API URL", createdBy);
                createTranslationIfNotExists("admin.llmConfig.apiKey", languageCode, "API Key", createdBy);
                createTranslationIfNotExists("admin.llmConfig.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("admin.llmConfig.default", languageCode, "Default", createdBy);
                createTranslationIfNotExists("admin.llmConfig.actions", languageCode, "Actions", createdBy);
                createTranslationIfNotExists("admin.llmConfig.active", languageCode, "Active", createdBy);
                createTranslationIfNotExists("admin.llmConfig.inactive", languageCode, "Inactive", createdBy);
                createTranslationIfNotExists("admin.llmConfig.activate", languageCode, "Activate", createdBy);
                createTranslationIfNotExists("admin.llmConfig.deactivate", languageCode, "Deactivate", createdBy);
                createTranslationIfNotExists("admin.llmConfig.testConnection", languageCode, "Test Connection",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.setAsDefault", languageCode, "Set as Default", createdBy);
                createTranslationIfNotExists("admin.llmConfig.noConfigs", languageCode,
                                "No LLM configurations available",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.allFieldsRequired", languageCode,
                                "Please fill in all required fields", createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.connectionSuccess", languageCode,
                                "Connection test successful!", createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.connectionFailed", languageCode,
                                "Connection test failed",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.invalidJson", languageCode,
                                "Template is not valid JSON format", createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.confirmDelete", languageCode,
                                "Are you sure you want to delete this LLM configuration?", createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.deleted", languageCode,
                                "LLM configuration has been deleted", createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.updated", languageCode,
                                "LLM configuration has been updated", createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.created", languageCode,
                                "LLM configuration has been created", createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.defaultChanged", languageCode,
                                "Default LLM configuration has been changed", createdBy);
                createTranslationIfNotExists("admin.llmConfig.message.activeChanged", languageCode,
                                "LLM configuration active status has been changed", createdBy);
                createTranslationIfNotExists("admin.llmConfig.tab.configList", languageCode, "LLM Configuration List",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.tab.template", languageCode, "Default Template",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.title", languageCode,
                                "📋 Test Case Generation Default Template", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.description1", languageCode,
                                "This template is automatically set when creating a new LLM configuration and is used as a reference format when requesting AI to generate test cases.",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.description2", languageCode,
                                "You can modify this template for each LLM configuration.", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.label", languageCode, "Default Template JSON:",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.download", languageCode, "Download", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.reset", languageCode, "Reset", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.downloadJson", languageCode, "Download JSON",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.usageTitle", languageCode, "How to Use:",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.usage1", languageCode,
                                "1. This template is automatically applied when creating new LLM configurations.",
                                createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.usage2", languageCode,
                                "2. You can modify this template individually for each LLM configuration.", createdBy);
                createTranslationIfNotExists("admin.llmConfig.template.usage3", languageCode,
                                "3. When requesting \"test case\" in RAG chat, this template is automatically referenced.",
                                createdBy);

                // Global Document Registration Requests
                createTranslationIfNotExists("admin.globalDoc.requests.title", languageCode,
                                "📨 Global Document Registration Requests", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.empty", languageCode, "No pending requests.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.requestedBy", languageCode, "Requested By",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.message", languageCode, "Request Message",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.requestedAt", languageCode, "Requested At",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.approve", languageCode, "Approve", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.reject", languageCode, "Reject", createdBy);
                createTranslationIfNotExists("admin.globalDoc.title", languageCode, "🌐 Global RAG Document Management",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.description", languageCode,
                                "Manage the global knowledge base automatically referenced by all projects. (Admin only)",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.uploadFile", languageCode, "Upload File", createdBy);
                createTranslationIfNotExists("admin.globalDoc.fileName", languageCode, "File Name", createdBy);
                createTranslationIfNotExists("admin.globalDoc.fileSize", languageCode, "File Size", createdBy);
                createTranslationIfNotExists("admin.globalDoc.analysisStatus", languageCode, "Analysis Status",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.parser", languageCode, "Parser", createdBy);
                createTranslationIfNotExists("admin.globalDoc.embeddingStatus", languageCode, "Embedding Status",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.chunkCount", languageCode, "Chunk Count", createdBy);
                createTranslationIfNotExists("admin.globalDoc.uploader", languageCode, "Uploader", createdBy);
                createTranslationIfNotExists("admin.globalDoc.uploadDate", languageCode, "Upload Date", createdBy);
                createTranslationIfNotExists("admin.globalDoc.noDocuments", languageCode,
                                "No global documents yet. Upload your first document!", createdBy);
                createTranslationIfNotExists("admin.globalDoc.parserUnknown", languageCode, "Unknown", createdBy);
                createTranslationIfNotExists("admin.globalDoc.parserAuto", languageCode, "Auto Select", createdBy);

                // Global Document Information Section
                createTranslationIfNotExists("admin.globalDoc.info.whatIsTitle", languageCode,
                                "📚 What are Global Documents?",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.whatIsDescription", languageCode,
                                "A global knowledge base automatically referenced by all projects. Managed with a special project ID ({0}).",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.examplesTitle", languageCode, "💡 Use Cases:",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.example1", languageCode,
                                "Company-wide coding conventions and development guidelines", createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.example2", languageCode,
                                "Testing standards and quality management documents", createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.example3", languageCode,
                                "Common project reference documents (API specs, architecture guides, etc.)", createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.example4", languageCode,
                                "Organization-wide best practices and learning materials", createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.techSpecsTitle", languageCode,
                                "⚙️ Technical Specifications:", createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.supportedFormats", languageCode,
                                "Supported formats: PDF, DOCX, DOC, TXT (max 50MB)", createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.autoSearch", languageCode,
                                "Automatically searched in all project RAG Q&A", createdBy);
                createTranslationIfNotExists("admin.globalDoc.info.adminOnly", languageCode,
                                "Upload/delete available to admins only (ADMIN permission required)", createdBy);
                createTranslationIfNotExists("admin.globalDoc.status.completed", languageCode, "Completed", createdBy);
                createTranslationIfNotExists("admin.globalDoc.status.pending", languageCode, "Pending", createdBy);
                createTranslationIfNotExists("admin.globalDoc.status.failed", languageCode, "Failed", createdBy);
                createTranslationIfNotExists("admin.globalDoc.action.preview", languageCode, "PDF Preview", createdBy);
                createTranslationIfNotExists("admin.globalDoc.action.viewChunks", languageCode, "View Chunks",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.action.download", languageCode, "Download", createdBy);
                createTranslationIfNotExists("admin.globalDoc.action.analyze", languageCode, "Analyze Document",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.action.generateEmbedding", languageCode,
                                "Generate Embedding",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.action.generateEmbeddings", languageCode,
                                "Generate Embedding",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.uploadSuccess", languageCode,
                                "Global document \"{0}\" has been uploaded", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.uploadFailed", languageCode,
                                "Failed to upload global document", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.deleteSuccess", languageCode,
                                "Global document \"{0}\" has been deleted", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.deleteFailed", languageCode,
                                "Failed to delete global document", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.uploaded", languageCode,
                                "Global document \"{0}\" has been uploaded", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.deleted", languageCode,
                                "Global document \"{0}\" has been deleted", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.confirmDelete", languageCode,
                                "Are you sure you want to delete the global document \"{0}\"?", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.confirmAnalyze", languageCode,
                                "Are you sure you want to analyze the document \"{0}\"?", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.confirmEmbedding", languageCode,
                                "Are you sure you want to generate embeddings for the document \"{0}\"?", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.confirmEmbeddings", languageCode,
                                "Are you sure you want to generate embeddings for the document \"{0}\"?", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.analyzeStarted", languageCode,
                                "Document \"{0}\" analysis started", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.analyzeFailed", languageCode,
                                "Failed to start analysis",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.embeddingStarted", languageCode,
                                "Document \"{0}\" embedding generation started", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.embeddingsStarted", languageCode,
                                "Document \"{0}\" embedding generation started", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.embeddingsFailed", languageCode,
                                "Failed to generate embeddings", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.downloaded", languageCode,
                                "Document \"{0}\" download completed", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.downloadSuccess", languageCode,
                                "Document \"{0}\" download completed", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.downloadFailed", languageCode, "Download failed",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.viewChunksFailed", languageCode,
                                "Failed to view chunks",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.previewFailed", languageCode, "Preview failed",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.pdfOnly", languageCode,
                                "Only PDF files can be previewed.", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.supportedFormats", languageCode,
                                "Supported file formats: PDF, DOCX, DOC, TXT", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.maxSize", languageCode,
                                "File size cannot exceed 50MB",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.fileSizeLimit", languageCode,
                                "File size cannot exceed 50MB", createdBy);
                createTranslationIfNotExists("admin.globalDoc.message.unknownError", languageCode, "Unknown error",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.chunks.title", languageCode, "Document Chunks",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.chunks.chunkNumber", languageCode, "Chunk #{0}",
                                createdBy);

                // Scheduler Management English Translations
                createTranslationIfNotExists("scheduler.title", languageCode, "Scheduler Management", createdBy);
                createTranslationIfNotExists("scheduler.description", languageCode,
                                "Dynamically manage execution times for background tasks. Changes to cron expressions are applied immediately without server restart.",
                                createdBy);
                createTranslationIfNotExists("scheduler.currentTime", languageCode, "Current Time ({timezone})",
                                createdBy);
                createTranslationIfNotExists("scheduler.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("scheduler.status.changed", languageCode,
                                "Schedule status has been changed.", createdBy);
                createTranslationIfNotExists("scheduler.task.executed", languageCode, "Task has been executed.",
                                createdBy);
                createTranslationIfNotExists("scheduler.confirm.execute", languageCode,
                                "Execute \"{taskName}\" task immediately?", createdBy);

                // Data Grid Columns
                createTranslationIfNotExists("scheduler.column.taskName", languageCode, "Task Name", createdBy);
                createTranslationIfNotExists("scheduler.column.scheduleExpression", languageCode, "Schedule Expression",
                                createdBy);
                createTranslationIfNotExists("scheduler.column.type", languageCode, "Type", createdBy);
                createTranslationIfNotExists("scheduler.column.nextExecution", languageCode, "Next Execution",
                                createdBy);
                createTranslationIfNotExists("scheduler.column.lastExecution", languageCode, "Last Execution",
                                createdBy);
                createTranslationIfNotExists("scheduler.column.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("scheduler.column.enabled", languageCode, "Enabled", createdBy);
                createTranslationIfNotExists("scheduler.column.actions", languageCode, "Actions", createdBy);

                // Schedule Types & Units
                createTranslationIfNotExists("scheduler.type.fixedRate", languageCode, "Fixed Rate", createdBy);
                createTranslationIfNotExists("scheduler.type.fixedDelay", languageCode, "Fixed Delay", createdBy);
                createTranslationIfNotExists("scheduler.time.seconds", languageCode, "{seconds}s", createdBy);
                createTranslationIfNotExists("scheduler.time.minutes", languageCode, "{minutes}m", createdBy);
                createTranslationIfNotExists("scheduler.time.hours", languageCode, "{hours}h", createdBy);
                createTranslationIfNotExists("scheduler.time.days", languageCode, "{days}d", createdBy);

                // Buttons & Tooltips
                createTranslationIfNotExists("scheduler.tooltip.edit", languageCode, "Edit", createdBy);
                createTranslationIfNotExists("scheduler.tooltip.execute", languageCode, "Execute Now", createdBy);

                // Schedule Config Dialog
                createTranslationIfNotExists("scheduler.dialog.title", languageCode, "Edit Schedule Configuration",
                                createdBy);
                createTranslationIfNotExists("scheduler.dialog.taskKey", languageCode, "Task Key:", createdBy);
                createTranslationIfNotExists("scheduler.dialog.scheduleType", languageCode, "Schedule Type:",
                                createdBy);
                createTranslationIfNotExists("scheduler.dialog.description", languageCode, "Description:", createdBy);
                createTranslationIfNotExists("scheduler.dialog.cronExpression", languageCode, "Cron Expression",
                                createdBy);
                createTranslationIfNotExists("scheduler.dialog.cronHelper", languageCode,
                                "Format: sec min hour day month dow (e.g., 0 0 1 * * *)", createdBy);
                createTranslationIfNotExists("scheduler.dialog.cronExamples", languageCode, "Cron Expression Examples",
                                createdBy);
                createTranslationIfNotExists("scheduler.dialog.fixedRate", languageCode, "Fixed Rate (milliseconds)",
                                createdBy);
                createTranslationIfNotExists("scheduler.dialog.fixedDelay", languageCode, "Fixed Delay (milliseconds)",
                                createdBy);
                createTranslationIfNotExists("scheduler.dialog.currentValue", languageCode, "Current value: {value}",
                                createdBy);
                createTranslationIfNotExists("scheduler.dialog.enabled", languageCode, "Enabled", createdBy);
                createTranslationIfNotExists("scheduler.dialog.nextExecution", languageCode,
                                "Next execution scheduled: {time}", createdBy);
                createTranslationIfNotExists("scheduler.dialog.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("scheduler.dialog.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("scheduler.dialog.updated", languageCode,
                                "Schedule configuration has been updated.", createdBy);

                // Cron Examples
                createTranslationIfNotExists("scheduler.cron.every5min", languageCode, "Every 5 minutes", createdBy);
                createTranslationIfNotExists("scheduler.cron.everyHour", languageCode, "Every hour on the hour",
                                createdBy);
                createTranslationIfNotExists("scheduler.cron.midnight", languageCode, "Every day at midnight",
                                createdBy);
                createTranslationIfNotExists("scheduler.cron.daily1am", languageCode, "Every day at 1 AM", createdBy);
                createTranslationIfNotExists("scheduler.cron.weekdays9am", languageCode, "Every weekday at 9 AM",
                                createdBy);
                createTranslationIfNotExists("scheduler.cron.monday9am", languageCode, "Every Monday at 9 AM",
                                createdBy);

                // Error Messages
                createTranslationIfNotExists("scheduler.error.cronRequired", languageCode,
                                "Please enter a cron expression", createdBy);
                createTranslationIfNotExists("scheduler.error.cronFormat", languageCode,
                                "Cron expression must have 6 fields (sec min hour day month dow)", createdBy);
                createTranslationIfNotExists("scheduler.error.fixedRatePositive", languageCode,
                                "Fixed Rate value must be greater than 0", createdBy);
                createTranslationIfNotExists("scheduler.error.fixedDelayPositive", languageCode,
                                "Fixed Delay value must be greater than 0", createdBy);
                createTranslationIfNotExists("scheduler.error.updateFailed", languageCode,
                                "Failed to update schedule configuration.", createdBy);

                // Scheduler List
                createTranslationIfNotExists("scheduler.list.title", languageCode, "Scheduled Tasks", createdBy);
                createTranslationIfNotExists("scheduler.list.lastUpdated", languageCode, "Last updated: {time}",
                                createdBy);
                createTranslationIfNotExists("scheduler.list.retry", languageCode, "Retry", createdBy);
                createTranslationIfNotExists("scheduler.list.totalTasks", languageCode, "Total Scheduled Tasks",
                                createdBy);
                createTranslationIfNotExists("scheduler.list.activeStatus", languageCode, "Active Status", createdBy);
                createTranslationIfNotExists("scheduler.list.normalOperation", languageCode, "Normal Operation",
                                createdBy);
                createTranslationIfNotExists("scheduler.list.serverTimezone", languageCode, "Server Timezone",
                                createdBy);
                createTranslationIfNotExists("scheduler.list.detailsTitle", languageCode, "Schedule Details",
                                createdBy);
                createTranslationIfNotExists("scheduler.list.columnName", languageCode, "Task Name", createdBy);
                createTranslationIfNotExists("scheduler.list.columnSchedule", languageCode, "Schedule", createdBy);
                createTranslationIfNotExists("scheduler.list.columnType", languageCode, "Type", createdBy);
                createTranslationIfNotExists("scheduler.list.columnDescription", languageCode, "Description",
                                createdBy);
                createTranslationIfNotExists("scheduler.error.loadFailed", languageCode,
                                "Failed to load scheduler information.", createdBy);

                createTranslationIfNotExists("admin.globalDoc.chunks.noChunks", languageCode, "No chunks available.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.noChunks", languageCode, "No chunks available.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.preview.title", languageCode, "PDF Preview", createdBy);
                createTranslationIfNotExists("admin.globalDoc.preview.loading", languageCode, "Unable to load preview.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.title", languageCode,
                                "📨 Global Document Requests",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.empty", languageCode, "No pending requests.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.requestedBy", languageCode, "Requester",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.message", languageCode, "Message", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.requestedAt", languageCode, "Requested At",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.approve", languageCode, "Approve", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.reject", languageCode, "Reject", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.approveNote", languageCode,
                                "Approval note (optional)",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.approved", languageCode, "Request approved.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.approveFailed", languageCode,
                                "Failed to approve the request.", createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.rejectNote", languageCode,
                                "Rejection reason (optional)",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.rejected", languageCode, "Request rejected.",
                                createdBy);
                createTranslationIfNotExists("admin.globalDoc.requests.rejectFailed", languageCode,
                                "Failed to reject the request.", createdBy);
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
