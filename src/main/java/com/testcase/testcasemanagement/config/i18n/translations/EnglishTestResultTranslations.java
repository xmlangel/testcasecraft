// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishTestResultTranslations.java
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
 * English translations - Test Result
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishTestResultTranslations {

        private final LanguageRepository languageRepository;
        private final TranslationKeyRepository translationKeyRepository;
        private final TranslationRepository translationRepository;

        public void initialize() {
                String languageCode = "en";
                String createdBy = "system";

                createTranslationIfNotExists("testResult.mainPage.title", languageCode, "Test Results", createdBy);
                createTranslationIfNotExists("testResult.mainPage.description", languageCode,
                                "Analyze and manage all test results of the project in an integrated way.", createdBy);
                createTranslationIfNotExists("testResult.tab.statistics", languageCode, "Statistics", createdBy);
                createTranslationIfNotExists("testResult.tab.statisticsFull", languageCode, "Statistics Dashboard",
                                createdBy);
                createTranslationIfNotExists("testResult.tab.statisticsDescription", languageCode,
                                "Visualize Pass/Fail/NotRun/Blocked result distribution at a glance", createdBy);
                createTranslationIfNotExists("testResult.tab.trend", languageCode, "Trend", createdBy);
                createTranslationIfNotExists("testResult.tab.trendFull", languageCode, "Trend Analysis", createdBy);
                createTranslationIfNotExists("testResult.tab.trendDescription", languageCode,
                                "Analyze and compare results by test plan and executor with performance trend analysis",
                                createdBy);
                createTranslationIfNotExists("testResult.tab.table", languageCode, "Table", createdBy);
                createTranslationIfNotExists("testResult.tab.tableFull", languageCode, "Detailed Table", createdBy);
                createTranslationIfNotExists("testResult.tab.tableDescription", languageCode,
                                "View all test results in detailed table format", createdBy);
                createTranslationIfNotExists("testResult.tab.report", languageCode, "Report", createdBy);
                createTranslationIfNotExists("testResult.tab.reportFull", languageCode, "Detailed Report", createdBy);
                createTranslationIfNotExists("testResult.tab.reportDescription", languageCode,
                                "Support detailed results by folder and case with JIRA integration status management",
                                createdBy);
                createTranslationIfNotExists("testResult.form.title", languageCode, "Enter Test Result", createdBy);
                createTranslationIfNotExists("testResult.form.testResult", languageCode, "Test Result", createdBy);
                createTranslationIfNotExists("testResult.form.preCondition", languageCode, "Pre-condition", createdBy);
                createTranslationIfNotExists("testResult.form.testSteps", languageCode, "Test Steps", createdBy);
                createTranslationIfNotExists("testResult.form.expectedResult", languageCode, "Expected Result",
                                createdBy);
                createTranslationIfNotExists("testResult.form.postCondition", languageCode, "Post Condition",
                                createdBy);
                createTranslationIfNotExists("testResult.form.automationStatus", languageCode, "Automation Status",
                                createdBy);
                createTranslationIfNotExists("testResult.form.automated", languageCode, "Automated", createdBy);
                createTranslationIfNotExists("testResult.form.manual", languageCode, "Manual", createdBy);
                createTranslationIfNotExists("testResult.form.executionType", languageCode, "Execution Type",
                                createdBy);
                createTranslationIfNotExists("testResult.form.tags", languageCode, "Tags", createdBy);
                createTranslationIfNotExists("testResult.form.testTechnique", languageCode, "Test Technique",
                                createdBy);
                createTranslationIfNotExists("testResult.form.notes", languageCode, "Notes", createdBy);
                createTranslationIfNotExists("testResult.form.notesPlaceholder", languageCode,
                                "Notes ({length}/10,000)",
                                createdBy);
                createTranslationIfNotExists("testResult.form.notesHelp", languageCode,
                                "Please record any special findings or additional information from the test process.",
                                createdBy);
                createTranslationIfNotExists("testResult.form.notesLimitWarning", languageCode,
                                "{remaining} characters remaining", createdBy);
                createTranslationIfNotExists("testResult.form.notesLimitError", languageCode,
                                "Exceeded 10,000 characters. Please attach long content as a file.", createdBy);
                createTranslationIfNotExists("testResult.form.notesFileRecommendation", languageCode,
                                "For long content, file attachment is recommended.", createdBy);
                createTranslationIfNotExists("testResult.form.mode.text", languageCode, "Text", createdBy);
                createTranslationIfNotExists("testResult.form.mode.markdown", languageCode, "Markdown", createdBy);
                createTranslationIfNotExists("testResult.form.mode.switch", languageCode, "Mode Switch", createdBy);
                createTranslationIfNotExists("testResult.form.fileAttachment", languageCode, "File Attachment",
                                createdBy);
                createTranslationIfNotExists("testResult.form.fileSelect", languageCode, "Select Files", createdBy);
                createTranslationIfNotExists("testResult.form.fileUploading", languageCode, "Uploading...", createdBy);
                createTranslationIfNotExists("testResult.form.fileFormat", languageCode,
                                "Allowed formats: TXT, CSV, JSON, MD, PDF, LOG (Max 10MB)", createdBy);
                createTranslationIfNotExists("testResult.form.newAttachments", languageCode,
                                "Files to be attached ({count} files)", createdBy);
                createTranslationIfNotExists("testResult.form.attachments", languageCode, "Attachments", createdBy);
                createTranslationIfNotExists("testResult.form.attachmentsNote", languageCode,
                                "Attachments will be available after saving the test result.", createdBy);
                createTranslationIfNotExists("testResult.form.jiraIntegration", languageCode, "JIRA Issue Integration",
                                createdBy);
                createTranslationIfNotExists("testResult.form.jiraIssueId", languageCode,
                                "JIRA Issue ID (e.g., ICT-123)",
                                createdBy);
                createTranslationIfNotExists("testResult.form.jiraIssuePlaceholder", languageCode,
                                "Enter related JIRA issue key (automatically converted to uppercase)", createdBy);
                createTranslationIfNotExists("testResult.form.jiraComment", languageCode, "JIRA Comment", createdBy);
                createTranslationIfNotExists("testResult.form.jiraDetected", languageCode, "Detected issues: {issues}",
                                createdBy);
                createTranslationIfNotExists("testResult.form.jiraDetectedShort", languageCode, "Detected: {issues}",
                                createdBy);
                createTranslationIfNotExists("testResult.jira.connectionCheckFailed", languageCode,
                                "JIRA connection check failed:", createdBy);
                createTranslationIfNotExists("testResult.jira.placeholder", languageCode,
                                "Enter related JIRA issue key (automatically converted to uppercase)", createdBy);
                createTranslationIfNotExists("testResult.jira.detectedIssues", languageCode, "Detected Issues",
                                createdBy);
                createTranslationIfNotExists("testResult.jira.issueIdLabel", languageCode,
                                "JIRA Issue ID (e.g., ICT-123)",
                                createdBy);
                createTranslationIfNotExists("testResult.jira.issueIdPlaceholder", languageCode,
                                "Enter related JIRA issue key (auto-converted to uppercase)", createdBy);
                createTranslationIfNotExists("testResult.jira.invalidFormat", languageCode,
                                "Invalid JIRA issue key format (e.g., ICT-123)", createdBy);
                createTranslationIfNotExists("testResult.jira.autoUppercase", languageCode,
                                "The entered key will be automatically converted to uppercase", createdBy);
                createTranslationIfNotExists("testResult.file.sizeError", languageCode,
                                "File size must be 10MB or less",
                                createdBy);
                createTranslationIfNotExists("testResult.file.typeError", languageCode, "File type not allowed",
                                createdBy);
                createTranslationIfNotExists("testResult.file.allowedFormats", languageCode,
                                "Allowed formats: TXT, CSV, JSON, MD, PDF, LOG (Max 10MB)", createdBy);
                createTranslationIfNotExists("testResult.file.newAttachmentsCount", languageCode,
                                "Files to be attached ({count} files)", createdBy);
                createTranslationIfNotExists("testResult.file.attachedFilesCount", languageCode,
                                "Attached files ({count} files)", createdBy);
                createTranslationIfNotExists("testResult.file.saveToViewAttachments", languageCode,
                                "Save test result to view attachments.", createdBy);
                createTranslationIfNotExists("testResult.error.saveFailed", languageCode, "Failed to save result.",
                                createdBy);
                createTranslationIfNotExists("testResult.error.testCaseLoadFailed", languageCode,
                                "Failed to load test case.",
                                createdBy);
                createTranslationIfNotExists("testResult.error.resultRequired", languageCode,
                                "Please select a test result.",
                                createdBy);
                createTranslationIfNotExists("testResult.warning.xmlCountMismatch", languageCode,
                                "XML metadata count ({metadata}) differs from actual loaded tests ({actual}). Some tests might be missing from the file.",
                                createdBy);
                createTranslationIfNotExists("testResult.status.pass", languageCode, "Pass", createdBy);
                createTranslationIfNotExists("testResult.status.fail", languageCode, "Fail", createdBy);
                createTranslationIfNotExists("testResult.status.blocked", languageCode, "Blocked", createdBy);
                createTranslationIfNotExists("testResult.status.notRun", languageCode, "Not Run", createdBy);
                createTranslationIfNotExists("testResult.status.error", languageCode, "Error", createdBy);
                createTranslationIfNotExists("testResult.table.title", languageCode, "Test Results Detailed List",
                                createdBy);
                createTranslationIfNotExists("testResult.table.resultCount", languageCode, " test results", createdBy);
                createTranslationIfNotExists("testResult.table.filtered", languageCode, "Filtered", createdBy);
                createTranslationIfNotExists("testResult.table.loadError", languageCode, "Cannot load test results",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.distribution", languageCode, "Test Result Distribution",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.loading", languageCode, "Loading chart data...",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.noData", languageCode, "No chart data available.",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.total", languageCode, "Total test cases: {total}",
                                createdBy);

                // Test Result Status (Extended)
                createTranslationIfNotExists("testResult.status.pass", languageCode, "Pass", createdBy);
                createTranslationIfNotExists("testResult.status.fail", languageCode, "Fail", createdBy);
                createTranslationIfNotExists("testResult.status.blocked", languageCode, "Blocked", createdBy);
                createTranslationIfNotExists("testResult.status.notRun", languageCode, "Not Run", createdBy);
                createTranslationIfNotExists("testResult.status.error", languageCode, "Error", createdBy);
                createTranslationIfNotExists("testResult.status.skipped", languageCode, "Skipped", createdBy);
                createTranslationIfNotExists("testResult.status.untested", languageCode, "Untested", createdBy);
                createTranslationIfNotExists("testResult.status.retest", languageCode, "Retest", createdBy);
                createTranslationIfNotExists("testResult.status.final", languageCode, "Final", createdBy);

                // Test Result Buttons (Extended)
                createTranslationIfNotExists("testResult.button.jiraStatusCheck", languageCode, "Check JIRA Status",
                                createdBy);
                createTranslationIfNotExists("testResult.button.column", languageCode, "Column", createdBy);
                createTranslationIfNotExists("testResult.button.order", languageCode, "Order", createdBy);
                createTranslationIfNotExists("testResult.button.export", languageCode, "Export", createdBy);
                createTranslationIfNotExists("testResult.button.advancedExport", languageCode, "Advanced Export",
                                createdBy);
                createTranslationIfNotExists("testResult.button.viewDetail", languageCode, "View Details", createdBy);
                createTranslationIfNotExists("testResult.button.edit", languageCode, "Edit", createdBy);

                // Column Display Settings Menu
                createTranslationIfNotExists("testResult.columnMenu.title", languageCode, "Column Display Settings",
                                createdBy);
                createTranslationIfNotExists("testResult.columnMenu.description", languageCode,
                                "Select columns to display", createdBy);
                createTranslationIfNotExists("testResult.columnMenu.showAll", languageCode, "Show All", createdBy);
                createTranslationIfNotExists("testResult.columnMenu.showEssential", languageCode, "Show Essential Only",
                                createdBy);
                createTranslationIfNotExists("testResult.columnMenu.required", languageCode, "Required Column",
                                createdBy);
                createTranslationIfNotExists("testResult.columnMenu.summary", languageCode,
                                "Displaying {visible}/{total} columns", createdBy);
                createTranslationIfNotExists("testResult.columnMenu.tip", languageCode,
                                "Tip: Test Case and Result are always displayed as required columns", createdBy);

                // JIRA Status
                createTranslationIfNotExists("testResult.jira.status.unknown", languageCode, "Unknown", createdBy);

                // Tooltips
                createTranslationIfNotExists("testResult.tooltip.noPreCondition", languageCode, "No precondition",
                                createdBy);
                createTranslationIfNotExists("testResult.tooltip.noPostCondition", languageCode, "No post-condition",
                                createdBy);
                createTranslationIfNotExists("testResult.steps.empty", languageCode, "No steps", createdBy);
                createTranslationIfNotExists("testResult.steps.description", languageCode, "Description", createdBy);

                // Column Headers (Extended)
                createTranslationIfNotExists("testResult.column.folder", languageCode, "Folder", createdBy);
                createTranslationIfNotExists("testResult.column.testCase", languageCode, "Test Case", createdBy);
                createTranslationIfNotExists("testResult.column.result", languageCode, "Result", createdBy);
                createTranslationIfNotExists("testResult.column.preCondition", languageCode, "Pre-condition",
                                createdBy);
                createTranslationIfNotExists("testResult.column.postCondition", languageCode, "Post Condition",
                                createdBy);
                createTranslationIfNotExists("testResult.column.steps", languageCode, "Step Info", createdBy);
                createTranslationIfNotExists("testResult.column.linkedDocuments", languageCode, "Linked RAG Docs",
                                createdBy);
                createTranslationIfNotExists("testResult.column.linkedDocCount", languageCode, "{count} docs",
                                createdBy);
                createTranslationIfNotExists("testResult.column.executedBy", languageCode, "Executor", createdBy);
                createTranslationIfNotExists("testResult.column.executedAt", languageCode, "Executed At", createdBy);
                createTranslationIfNotExists("testResult.column.testPlan", languageCode, "Test Plan", createdBy);
                createTranslationIfNotExists("testResult.column.testExecution", languageCode, "Test Execution",
                                createdBy);
                createTranslationIfNotExists("testResult.column.jiraStatus", languageCode, "JIRA Status", createdBy);
                createTranslationIfNotExists("testResult.column.actions", languageCode, "Actions", createdBy);
                createTranslationIfNotExists("testResult.chart.compareTitle", languageCode, "Test Result Comparison",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.percentageView", languageCode, "Percentage View",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.tooltip", languageCode,
                                "Compare results by test plan or executor.", createdBy);
                createTranslationIfNotExists("testResult.chart.yAxisCount", languageCode, "Count", createdBy);
                createTranslationIfNotExists("testResult.chart.yAxisPercent", languageCode, "Percentage (%)",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.compareItems", languageCode,
                                "Total {count} items compared",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.loadingData", languageCode, "Loading chart data...",
                                createdBy);
                createTranslationIfNotExists("testResult.chart.noCompareData", languageCode, "No data to compare.",
                                createdBy);
                createTranslationIfNotExists("testResult.statistics.title", languageCode, "Test Result Statistics",
                                createdBy);
                createTranslationIfNotExists("testResult.statistics.loading", languageCode, "Loading...", createdBy);
                createTranslationIfNotExists("testResult.statistics.error", languageCode, "Error: {error}", createdBy);
                createTranslationIfNotExists("testResult.statistics.noData", languageCode, "No data", createdBy);
                createTranslationIfNotExists("testResult.statistics.successRate", languageCode, "Success Rate",
                                createdBy);
                createTranslationIfNotExists("testResult.statistics.totalTests", languageCode, "Total Tests",
                                createdBy);
                createTranslationIfNotExists("testResult.statistics.totalCount", languageCode, "Total {count} items",
                                createdBy);
                createTranslationIfNotExists("testResult.pieChart.title", languageCode, "Test Result Distribution",
                                createdBy);
                createTranslationIfNotExists("testResult.pieChart.loading", languageCode, "Loading chart data...",
                                createdBy);
                createTranslationIfNotExists("testResult.pieChart.noData", languageCode, "No chart data available.",
                                createdBy);
                createTranslationIfNotExists("testResult.pieChart.count", languageCode, "Count", createdBy);
                createTranslationIfNotExists("testResult.pieChart.percentage", languageCode, "Percentage", createdBy);
                createTranslationIfNotExists("testResult.pieChart.totalTestCases", languageCode,
                                "Total test cases: {total}",
                                createdBy);
                createTranslationIfNotExists("testResult.filter.title", languageCode, "Statistics Filter", createdBy);
                createTranslationIfNotExists("testResult.filter.applied", languageCode, "{count} applied", createdBy);
                createTranslationIfNotExists("testResult.filter.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("testResult.filter.refreshTooltip", languageCode, "Refresh data",
                                createdBy);
                createTranslationIfNotExists("testResult.filter.apply", languageCode, "Apply Filter", createdBy);
                createTranslationIfNotExists("testResult.filter.clear", languageCode, "Clear", createdBy);
                createTranslationIfNotExists("testResult.filter.clearTooltip", languageCode, "Clear all filters",
                                createdBy);
                createTranslationIfNotExists("testResult.filter.testPlan", languageCode, "Test Plan", createdBy);
                createTranslationIfNotExists("testResult.filter.allPlans", languageCode, "All Plans", createdBy);
                createTranslationIfNotExists("testResult.filter.testExecution", languageCode, "Test Execution",
                                createdBy);
                createTranslationIfNotExists("testResult.filter.allExecutions", languageCode, "All Executions",
                                createdBy);
                createTranslationIfNotExists("testResult.filter.allView", languageCode, "All", createdBy);
                createTranslationIfNotExists("testResult.filter.errorLoadPlans", languageCode,
                                "Unable to load test plan list.",
                                createdBy);
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
                createTranslationIfNotExists("testResult.filter.activeFilters", languageCode, "Active filters:",
                                createdBy);
                createTranslationIfNotExists("testResult.filter.planPrefix", languageCode, "Plan:", createdBy);
                createTranslationIfNotExists("testResult.filter.executionPrefix", languageCode, "Execution:",
                                createdBy);
                createTranslationIfNotExists("testResult.filter.periodPrefix", languageCode, "Period:", createdBy);
                createTranslationIfNotExists("testResult.column.folder", languageCode, "Folder", createdBy);
                createTranslationIfNotExists("testResult.column.testCase", languageCode, "Test Case", createdBy);
                createTranslationIfNotExists("testResult.column.result", languageCode, "Result", createdBy);
                createTranslationIfNotExists("testResult.column.preCondition", languageCode, "Precondition", createdBy);
                createTranslationIfNotExists("testResult.column.steps", languageCode, "Step Information", createdBy);
                createTranslationIfNotExists("testResult.column.expectedResults", languageCode, "Expected Results",
                                createdBy);
                createTranslationIfNotExists("testResult.column.executor", languageCode, "Executor", createdBy);
                createTranslationIfNotExists("testResult.column.notes", languageCode, "Notes", createdBy);
                createTranslationIfNotExists("testResult.column.attachments", languageCode, "Attachments", createdBy);
                createTranslationIfNotExists("testResult.column.executedDate", languageCode, "Executed Date",
                                createdBy);
                createTranslationIfNotExists("testResult.column.jiraStatus", languageCode, "JIRA Status", createdBy);
                createTranslationIfNotExists("testResult.button.edit", languageCode, "Edit", createdBy);
                createTranslationIfNotExists("testResult.button.viewDetail", languageCode, "View Details", createdBy);
                createTranslationIfNotExists("testResult.button.viewAttachments", languageCode, "View Attachments",
                                createdBy);
                createTranslationIfNotExists("testResult.button.columnSettings", languageCode, "Column Settings",
                                createdBy);
                createTranslationIfNotExists("testResult.button.changeOrder", languageCode, "Change Order", createdBy);
                createTranslationIfNotExists("testResult.button.reset", languageCode, "Reset", createdBy);
                createTranslationIfNotExists("testResult.button.advancedExport", languageCode, "Advanced Export",
                                createdBy);
                createTranslationIfNotExists("testResult.button.column", languageCode, "Column", createdBy);
                createTranslationIfNotExists("testResult.button.order", languageCode, "Order", createdBy);
                createTranslationIfNotExists("testResult.button.export", languageCode, "Export", createdBy);
                createTranslationIfNotExists("testResult.tooltip.noPreCondition", languageCode, "No precondition",
                                createdBy);
                createTranslationIfNotExists("testResult.tooltip.noExpectedResults", languageCode,
                                "No expected results",
                                createdBy);
                createTranslationIfNotExists("testResult.tooltip.noNotes", languageCode, "No notes", createdBy);
                createTranslationIfNotExists("testResult.tooltip.multipleJiraIds", languageCode,
                                "Total {count} JIRA IDs",
                                createdBy);
                createTranslationIfNotExists("testResult.status.unknown", languageCode, "Unknown", createdBy);
                createTranslationIfNotExists("testResult.status.filtered", languageCode, "Filtered", createdBy);
                createTranslationIfNotExists("testResult.title.detailList", languageCode, "Test Results Detail List",
                                createdBy);
                createTranslationIfNotExists("testResult.count.results", languageCode, "{count} test results{filtered}",
                                createdBy);
                createTranslationIfNotExists("testResult.error.loadFailure", languageCode,
                                "Unable to load test results",
                                createdBy);
                createTranslationIfNotExists("testResult.defaultValue.root", languageCode, "Root", createdBy);
                createTranslationIfNotExists("testResult.defaultValue.unknownTestCase", languageCode,
                                "Unknown Test Case",
                                createdBy);
                createTranslationIfNotExists("testResult.defaultValue.system", languageCode, "System", createdBy);
                createTranslationIfNotExists("testResult.steps.empty", languageCode, "No steps", createdBy);
                createTranslationIfNotExists("testResult.steps.description", languageCode, "Description", createdBy);
                createTranslationIfNotExists("testResult.steps.expectedResult", languageCode, "Expected Result",
                                createdBy);
                createTranslationIfNotExists("testResult.dialog.attachmentsTitle", languageCode,
                                "Test Result Attachments",
                                createdBy);
                createTranslationIfNotExists("testResult.status.pass", languageCode, "Pass", createdBy);
                createTranslationIfNotExists("testResult.status.fail", languageCode, "Fail", createdBy);
                createTranslationIfNotExists("testResult.status.blocked", languageCode, "Blocked", createdBy);
                createTranslationIfNotExists("testResult.status.notRun", languageCode, "Not Run", createdBy);
                createTranslationIfNotExists("testResult.status.skipped", languageCode, "Skipped", createdBy);
                createTranslationIfNotExists("testResult.export.dialog.title", languageCode, "Export Test Results",
                                createdBy);
                createTranslationIfNotExists("testResult.export.section.format", languageCode,
                                "📄 Select Export Format",
                                createdBy);
                createTranslationIfNotExists("testResult.export.section.info", languageCode, "📋 Export Information",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.excel.title", languageCode, "Excel (.xlsx)",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.excel.description", languageCode,
                                "Includes formatting and charts, optimal for business reports", createdBy);
                createTranslationIfNotExists("testResult.export.format.excel.feature1", languageCode,
                                "Statistical charts included", createdBy);
                createTranslationIfNotExists("testResult.export.format.excel.feature2", languageCode,
                                "Formatting preserved",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.excel.feature3", languageCode,
                                "Filtering enabled",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.excel.alert", languageCode,
                                "💡 Excel format includes statistical charts and summary sheets separately.",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.pdf.title", languageCode, "PDF (.pdf)",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.pdf.description", languageCode,
                                "For printing and sharing, fixed layout", createdBy);
                createTranslationIfNotExists("testResult.export.format.pdf.feature1", languageCode, "Print optimized",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.pdf.feature2", languageCode, "Fixed layout",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.pdf.feature3", languageCode,
                                "Universal compatibility",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.pdf.alert", languageCode,
                                "🖨️ PDF is optimized for A4 paper and great for printing.", createdBy);
                createTranslationIfNotExists("testResult.export.format.csv.title", languageCode, "CSV (.csv)",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.csv.description", languageCode,
                                "For data analysis, lightweight file size", createdBy);
                createTranslationIfNotExists("testResult.export.format.csv.feature1", languageCode,
                                "Data analysis optimized",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.csv.feature2", languageCode, "Lightweight size",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.csv.feature3", languageCode,
                                "Excellent compatibility",
                                createdBy);
                createTranslationIfNotExists("testResult.export.format.csv.alert", languageCode,
                                "📈 CSV contains data only; open with Excel or Google Sheets.", createdBy);
                createTranslationIfNotExists("testResult.export.info.totalRows", languageCode, "📊 Total Data Count:",
                                createdBy);
                createTranslationIfNotExists("testResult.export.info.totalRowsValue", languageCode, "{count} rows",
                                createdBy);
                createTranslationIfNotExists("testResult.export.info.columns", languageCode, "🔍 Visible Columns:",
                                createdBy);
                createTranslationIfNotExists("testResult.export.info.columnsValue", languageCode, "{count} columns",
                                createdBy);
                createTranslationIfNotExists("testResult.export.info.columnsList", languageCode,
                                "📂 Columns to Export:",
                                createdBy);
                createTranslationIfNotExists("testResult.export.progress.message", languageCode,
                                "Generating file... Please wait", createdBy);
                createTranslationIfNotExists("testResult.export.button.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("testResult.export.button.export", languageCode, "Export {format}",
                                createdBy);
                createTranslationIfNotExists("testResult.export.button.exporting", languageCode, "Generating...",
                                createdBy);
                createTranslationIfNotExists("testResult.export.error.noProject", languageCode, "No project selected.",
                                createdBy);
                createTranslationIfNotExists("testResult.export.error.failed", languageCode,
                                "An error occurred while exporting the file: {message}", createdBy);
                createTranslationIfNotExists("testResult.export.error.response", languageCode,
                                "Export failed: {status} {statusText}", createdBy);
                createTranslationIfNotExists("testResult.orderDialog.title", languageCode, "Change Column Order",
                                createdBy);
                createTranslationIfNotExists("testResult.orderDialog.description", languageCode,
                                "Use the up/down arrow buttons to change the column order", createdBy);
                createTranslationIfNotExists("testResult.orderDialog.visible", languageCode, "Visible", createdBy);
                createTranslationIfNotExists("testResult.orderDialog.hidden", languageCode, "Hidden", createdBy);
                createTranslationIfNotExists("testResult.orderDialog.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("testResult.orderDialog.apply", languageCode, "Apply Order", createdBy);
                createTranslationIfNotExists("testResult.message.error", languageCode, "An error occurred", createdBy);
                createTranslationIfNotExists("testResult.message.deleteFailed", languageCode, "Failed to delete",
                                createdBy);
                createTranslationIfNotExists("testResult.dialog.attachmentsTitle", languageCode,
                                "Test Result Attachments",
                                createdBy);
                createTranslationIfNotExists("testResult.detailReport.searchPlaceholder", languageCode,
                                "Test case name, folder path, executor, etc.", createdBy);
                createTranslationIfNotExists("testResult.form.title", languageCode, "Test Result Input", createdBy);
                createTranslationIfNotExists("testResult.pieChart.title", languageCode, "Test Result Pie Chart",
                                createdBy);
                createTranslationIfNotExists("testResult.error.testCaseLoadFailed", languageCode,
                                "Failed to load test cases",
                                createdBy);
                createTranslationIfNotExists("testResult.error.saveFailed", languageCode, "Save failed", createdBy);
                createTranslationIfNotExists("testResult.error.resultRequired", languageCode, "Test result is required",
                                createdBy);
                createTranslationIfNotExists("testResult.pieChart.loading", languageCode, "Loading chart...",
                                createdBy);
                createTranslationIfNotExists("testResult.pieChart.noData", languageCode, "No chart data", createdBy);
                createTranslationIfNotExists("testResult.pieChart.count", languageCode, "Count", createdBy);
                createTranslationIfNotExists("testResult.pieChart.percentage", languageCode, "Percentage", createdBy);
                createTranslationIfNotExists("testResult.pieChart.totalTestCases", languageCode, "Total Test Cases",
                                createdBy);
                createTranslationIfNotExists("testResult.statistics.noData", languageCode, "No statistics data",
                                createdBy);
                createTranslationIfNotExists("testResult.statistics.totalCount", languageCode, "Total Count",
                                createdBy);
                createTranslationIfNotExists("testResult.form.preCondition", languageCode, "Pre-condition", createdBy);
                createTranslationIfNotExists("testResult.form.testSteps", languageCode, "Test Steps", createdBy);
                createTranslationIfNotExists("testResult.form.expectedResult", languageCode, "Expected Result",
                                createdBy);
                createTranslationIfNotExists("testResult.form.testResult", languageCode, "Test Result", createdBy);
                createTranslationIfNotExists("testResult.form.notesLimitError", languageCode,
                                "Notes must be within 10,000 characters", createdBy);
                createTranslationIfNotExists("testResult.form.notesHelp", languageCode,
                                "Enter any special notes or additional information during test execution", createdBy);
                createTranslationIfNotExists("testResult.form.fileAttachment", languageCode, "File Attachment",
                                createdBy);
                createTranslationIfNotExists("testResult.form.fileUploading", languageCode, "Uploading file...",
                                createdBy);
                createTranslationIfNotExists("testResult.form.fileSelect", languageCode, "Select File", createdBy);
                createTranslationIfNotExists("testResult.form.jiraIntegration", languageCode, "JIRA Integration",
                                createdBy);
                createTranslationIfNotExists("testResult.form.jiraComment", languageCode, "JIRA Comment", createdBy);
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
