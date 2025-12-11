// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishTestCaseAndAutomationTranslations.java
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
 * English translations - TestCase, Automation, and Attachments
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnglishTestCaseAndAutomationTranslations {

        private final LanguageRepository languageRepository;
        private final TranslationKeyRepository translationKeyRepository;
        private final TranslationRepository translationRepository;

        public void initialize() {
                String languageCode = "en";
                String createdBy = "system";

                createTranslationIfNotExists("organization.error.notFound", languageCode, "Organization not found.",
                                createdBy);
                createTranslationIfNotExists("organization.error.idNotProvided", languageCode,
                                "Organization ID not provided.",
                                createdBy);
                createTranslationIfNotExists("organization.error.dataLoadFailed", languageCode,
                                "Failed to load organization data.", createdBy);
                createTranslationIfNotExists("organization.error.infoLoadFailed", languageCode,
                                "Failed to load organization information.", createdBy);
                createTranslationIfNotExists("organization.error.editDialogFailed", languageCode,
                                "Failed to open edit dialog.",
                                createdBy);
                createTranslationIfNotExists("organization.error.accessDenied", languageCode,
                                "Organization Access Denied",
                                createdBy);
                createTranslationIfNotExists("organization.error.authRequired", languageCode, "Authentication Required",
                                createdBy);
                createTranslationIfNotExists("organization.error.resourceNotFound", languageCode, "Resource Not Found",
                                createdBy);
                createTranslationIfNotExists("organization.error.general", languageCode, "Error Occurred", createdBy);
                createTranslationIfNotExists("organization.error.authDescription", languageCode,
                                "Login is required. Please log in again.", createdBy);
                createTranslationIfNotExists("organization.error.notFoundDescription", languageCode,
                                "The requested resource could not be found.", createdBy);
                createTranslationIfNotExists("organization.error.generalDescription", languageCode,
                                "Contact your system administrator if the problem persists.", createdBy);
                createTranslationIfNotExists("organization.error.problemOccurred", languageCode, "A problem occurred",
                                createdBy);
                createTranslationIfNotExists("organization.error.occurredAt", languageCode, "Occurred at: {date}",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.selectAll", languageCode, "Select All", createdBy);
                createTranslationIfNotExists("testcase.tree.root", languageCode, "Root", createdBy);
                createTranslationIfNotExists("testcase.tree.title.select", languageCode, "Select Test Cases",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.title.manage", languageCode, "Test Cases", createdBy);
                createTranslationIfNotExists("testcase.tree.message.selectProject", languageCode,
                                "Please select a project.",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.message.loading", languageCode, "Loading...", createdBy);
                createTranslationIfNotExists("testcase.tree.message.noTestcases", languageCode, "No test cases found.",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.validation.nameRequired", languageCode,
                                "Please enter a name.",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.error.renameFailed", languageCode, "Failed to rename: ",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.error.deleteFailed", languageCode,
                                "Error occurred while deleting.",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.ragVectorized", languageCode, "RAG Vectorized", createdBy);
                createTranslationIfNotExists("testcase.tree.button.batchDelete", languageCode, "Delete Selected",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.button.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("testcase.tree.button.saveOrder", languageCode, "Save Order", createdBy);
                createTranslationIfNotExists("testcase.tree.button.editOrder", languageCode, "Edit Order", createdBy);
                createTranslationIfNotExists("testcase.tree.button.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("testcase.tree.button.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("testcase.tree.button.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("testcase.tree.action.addFolder", languageCode, "Add Folder", createdBy);
                createTranslationIfNotExists("testcase.tree.action.addTestcase", languageCode, "Add Test Case",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.action.addSubFolder", languageCode, "Add Sub Folder",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.action.addSubTestcase", languageCode, "Add Sub Test Case",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.action.rename", languageCode, "Rename", createdBy);
                createTranslationIfNotExists("testcase.tree.action.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("testcase.tree.action.versionHistory", languageCode, "Version History",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.dialog.batchDelete.title", languageCode, "Delete Selected",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.dialog.batchDelete.message", languageCode,
                                "Delete {count} items (including children)?", createdBy);
                createTranslationIfNotExists("testcase.tree.dialog.deleteConfirm.title", languageCode, "Confirm Delete",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.dialog.deleteConfirm.message", languageCode,
                                "Are you sure you want to delete? (including children)", createdBy);
                createTranslationIfNotExists("testcase.tree.dialog.error.title", languageCode, "Error", createdBy);
                createTranslationIfNotExists("testcase.tree.tooltip.open", languageCode, "Open Test Case Tree",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.tooltip.close", languageCode, "Close Test Case Tree",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.count.testcases", languageCode, "Test Cases: {count}",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.count.folders", languageCode, "Folders: {count}",
                                createdBy);
                createTranslationIfNotExists("testcase.tree.count.total", languageCode, "Total: {count}", createdBy);
                createTranslationIfNotExists("testcase.form.title.edit", languageCode, "Edit Test Case", createdBy);
                createTranslationIfNotExists("testcase.form.displayId", languageCode, "Display ID", createdBy);
                createTranslationIfNotExists("testcase.form.displayOrder", languageCode, "Order", createdBy);
                createTranslationIfNotExists("testcase.form.createdBy", languageCode, "Created By", createdBy);
                createTranslationIfNotExists("testcase.form.updatedBy", languageCode, "Updated By", createdBy);
                createTranslationIfNotExists("testcase.form.name", languageCode, "Name", createdBy);
                createTranslationIfNotExists("testcase.form.description", languageCode, "Description", createdBy);
                createTranslationIfNotExists("testcase.form.preCondition", languageCode, "Pre-condition", createdBy);
                createTranslationIfNotExists("testcase.form.testSteps", languageCode, "Test Steps", createdBy);
                createTranslationIfNotExists("testcase.form.stepNumber", languageCode, "No.", createdBy);
                createTranslationIfNotExists("testcase.form.step", languageCode, "Step", createdBy);
                createTranslationIfNotExists("testcase.form.expected", languageCode, "Expected", createdBy);
                createTranslationIfNotExists("testcase.form.expectedResults", languageCode, "Expected Results",
                                createdBy);
                createTranslationIfNotExists("testcase.form.postCondition", languageCode, "Post-condition", createdBy);
                createTranslationIfNotExists("testcase.form.isAutomated", languageCode, "Automation", createdBy);
                createTranslationIfNotExists("testcase.form.executionType", languageCode, "Manual/Automation",
                                createdBy);
                createTranslationIfNotExists("testcase.form.testTechnique", languageCode, "Test Technique", createdBy);
                createTranslationIfNotExists("testcase.form.preConditionPlaceholder", languageCode, "Pre-condition",
                                createdBy);
                createTranslationIfNotExists("testcase.form.postConditionPlaceholder", languageCode, "Post-condition",
                                createdBy);
                createTranslationIfNotExists("testcase.form.testTechniquePlaceholder", languageCode,
                                "e.g., Boundary Value Analysis, Decision Table", createdBy);
                createTranslationIfNotExists("testcase.executionType.manual", languageCode, "Manual", createdBy);
                createTranslationIfNotExists("testcase.executionType.automation", languageCode, "Automation",
                                createdBy);
                createTranslationIfNotExists("testcase.executionType.hybrid", languageCode, "Hybrid", createdBy);
                createTranslationIfNotExists("testcase.form.stepDescription", languageCode, "Step description",
                                createdBy);
                createTranslationIfNotExists("testcase.form.expectedResult", languageCode, "Expected result",
                                createdBy);
                createTranslationIfNotExists("testcase.form.overallExpectedResults", languageCode,
                                "Overall Expected Results",
                                createdBy);
                createTranslationIfNotExists("testcase.form.folderName", languageCode, "Folder name", createdBy);
                createTranslationIfNotExists("testcase.form.folderDescription", languageCode, "Folder description",
                                createdBy);
                createTranslationIfNotExists("testcase.form.testcaseName", languageCode, "Test case name", createdBy);
                createTranslationIfNotExists("testcase.form.testcaseDescription", languageCode, "Test case description",
                                createdBy);

                // Section translations
                createTranslationIfNotExists("testcase.sections.basicInfo", languageCode, "Basic Information",
                                createdBy);
                createTranslationIfNotExists("testcase.sections.steps", languageCode, "Test Steps", createdBy);
                createTranslationIfNotExists("testcase.sections.expectedResults", languageCode, "Expected Results",
                                createdBy);
                createTranslationIfNotExists("testcase.sections.attachments", languageCode, "Attachments", createdBy);

                createTranslationIfNotExists("testcase.helper.description", languageCode, "Enter description.",
                                createdBy);
                createTranslationIfNotExists("testcase.helper.preCondition", languageCode, "Enter pre-conditions.",
                                createdBy);
                createTranslationIfNotExists("testcase.button.save", languageCode, "Save", createdBy);
                createTranslationIfNotExists("testcase.button.saving", languageCode, "Saving...", createdBy);
                createTranslationIfNotExists("testcase.button.addStep", languageCode, "Add Step", createdBy);
                createTranslationIfNotExists("testcase.form.continueAdding", languageCode, "Continue Adding",
                                createdBy);
                createTranslationIfNotExists("testcase.form.button.add", languageCode, "Add New Case", createdBy);
                createTranslationIfNotExists("testcase.message.selectProject", languageCode,
                                "Please select a project first.",
                                createdBy);
                createTranslationIfNotExists("testcase.message.selectOrCreate", languageCode,
                                "Select or create a test case.",
                                createdBy);
                createTranslationIfNotExists("testcase.message.noSelection", languageCode,
                                "Please select a folder or test case.",
                                createdBy);
                createTranslationIfNotExists("testcase.message.addSteps", languageCode, "Add steps.", createdBy);
                createTranslationIfNotExists("testcase.message.saved", languageCode, "Saved successfully.", createdBy);
                createTranslationIfNotExists("testcase.validation.nameRequired", languageCode, "Please enter a name.",
                                createdBy);
                createTranslationIfNotExists("testcase.validation.stepRequired", languageCode, "Please enter a step.",
                                createdBy);
                createTranslationIfNotExists("testcase.validation.expectedResultsRequired", languageCode,
                                "Please enter overall expected results.", createdBy);
                createTranslationIfNotExists("testcase.error.saveError", languageCode, "Error occurred while saving.",
                                createdBy);
                createTranslationIfNotExists("testcase.folder.info.title", languageCode, "Folder Information",
                                createdBy);
                createTranslationIfNotExists("testcase.info.title", languageCode, "Test Case Information", createdBy);
                createTranslationIfNotExists("testcase.form.folder.edit", languageCode, "Edit Test Folder", createdBy);
                createTranslationIfNotExists("testcase.form.folder.create", languageCode, "Create Test Folder",
                                createdBy);
                createTranslationIfNotExists("testcase.version.button.create", languageCode, "Create Version",
                                createdBy);
                createTranslationIfNotExists("testcase.version.button.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("testcase.version.button.creating", languageCode, "Creating...",
                                createdBy);
                createTranslationIfNotExists("testcase.version.current.fetchError", languageCode,
                                "Failed to get current version:", createdBy);
                createTranslationIfNotExists("testcase.version.error.notSaved", languageCode,
                                "Versions can only be created for saved test cases.", createdBy);
                createTranslationIfNotExists("testcase.version.error.folderNotAllowed", languageCode,
                                "Versions cannot be created for folders. Only for actual test cases.", createdBy);
                createTranslationIfNotExists("testcase.version.error.createFailed", languageCode,
                                "Failed to create version.",
                                createdBy);
                createTranslationIfNotExists("testcase.version.error.createError", languageCode,
                                "Version creation failed:",
                                createdBy);
                createTranslationIfNotExists("testcase.version.validation.labelRequired", languageCode,
                                "Please enter version label.", createdBy);
                createTranslationIfNotExists("testcase.version.defaultDescription", languageCode,
                                "Manual version creation",
                                createdBy);
                createTranslationIfNotExists("testcase.version.dialog.title", languageCode, "Manual Version Creation",
                                createdBy);
                createTranslationIfNotExists("testcase.version.form.label", languageCode, "Version Label", createdBy);
                createTranslationIfNotExists("testcase.version.form.labelPlaceholder", languageCode,
                                "e.g., v2.1 with modifications", createdBy);
                createTranslationIfNotExists("testcase.version.form.labelHelperText", languageCode,
                                "Enter a label to identify this version.", createdBy);
                createTranslationIfNotExists("testcase.version.form.description", languageCode, "Version Description",
                                createdBy);
                createTranslationIfNotExists("testcase.version.form.descriptionPlaceholder", languageCode,
                                "Describe in detail what changed in this version.", createdBy);
                createTranslationIfNotExists("testcase.version.form.descriptionHelperText", languageCode,
                                "Optional. If left blank, it will be set to 'Manual version creation'.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.header.title", languageCode, "Test Case Spreadsheet",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.status.rows", languageCode, "{count} rows",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.status.steps", languageCode, "{count} steps",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.status.changed", languageCode, "Modified",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.addRows", languageCode, "Add Rows",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.addFolder", languageCode, "Add Folder",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.validate", languageCode, "Validate",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.export", languageCode, "Export", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.save", languageCode, "Batch Save", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.saving", languageCode, "Saving...",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.stepManagement", languageCode,
                                "Step Management",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.fullscreen", languageCode, "Fullscreen",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.exitFullscreen", languageCode,
                                "Exit Fullscreen", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.createdBy", languageCode, "Created By",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.updatedBy", languageCode, "Updated By",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.order", languageCode, "Order", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.type", languageCode, "Type", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.parentFolder", languageCode, "Parent Folder",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.name", languageCode, "Name", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.description", languageCode, "Description",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.preCondition", languageCode, "Pre-condition",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.postCondition", languageCode,
                                "Post-condition",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.expectedResults", languageCode,
                                "Expected Results",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.isAutomated", languageCode, "Automation Flag",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.executionType", languageCode,
                                "Manual/Automation",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.testTechnique", languageCode,
                                "Test Technique",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.step", languageCode, "Step {number}",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.expected", languageCode, "Expected {number}",
                                createdBy);
                createTranslationIfNotExists("testcase.type.folder", languageCode, "Folder", createdBy);
                createTranslationIfNotExists("testcase.type.testcase", languageCode, "Test Case", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.title", languageCode, "Usage:", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.basicUsage", languageCode,
                                "Click cells to edit directly like Excel. Use Tab/Enter to move to next cell, Ctrl+C/V for copy/paste.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.folderFunction", languageCode,
                                "Folder function: Click \"Add Folder\" button or type \"📁 FolderName\" in name cell to create a folder.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.stepManagement", languageCode,
                                "Step management: Click ⚙️ button to adjust the number of steps (max 10).", createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.features.title", languageCode, "Advanced Features:",
                                createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.features.lineBreak", languageCode,
                                "Press Enter within cells for line breaks.", createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.features.navigation", languageCode,
                                "Use Tab to move to next cell, Ctrl+C/V for copy/paste.", createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.multiSelect.title", languageCode,
                                "Multi-Selection:",
                                createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.multiSelect.range", languageCode,
                                "Shift+Click for range selection, Ctrl+Click for individual selection.", createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.multiSelect.resize", languageCode,
                                "Drag to resize cells and auto-fill data.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepMenu.addStep", languageCode,
                                "Add Step ({count})",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepMenu.removeStep", languageCode,
                                "Remove Step ({count})",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepMenu.settings", languageCode,
                                "Set step count directly...", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.title", languageCode, "Set Step Count",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.description", languageCode,
                                "Set the number of steps for test cases. Existing data will be preserved.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.label", languageCode, "Step Count",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.helper", languageCode,
                                "Can be set from 1 to 10.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.cancel", languageCode, "Cancel",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.apply", languageCode, "Apply", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.folderDialog.title", languageCode,
                                "Create New Folder",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.folderDialog.description", languageCode,
                                "Enter the name for the new folder. The folder will be added to the top of the spreadsheet.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.folderDialog.label", languageCode, "Folder Name",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.folderDialog.placeholder", languageCode,
                                "e.g., API Test, UI Test", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.folderDialog.cancel", languageCode, "Cancel",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.folderDialog.create", languageCode, "Create",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.export.csv.title", languageCode, "Export to CSV",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.export.csv.description", languageCode,
                                "Spreadsheet compatible format", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.export.excel.title", languageCode, "Export to Excel",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.export.excel.description", languageCode,
                                "Microsoft Excel format (.xlsx)", createdBy);

                // Validation system English translations
                createTranslationIfNotExists("testcase.spreadsheet.validation.title", languageCode,
                                "Data Validation Result", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.titleSuccess", languageCode,
                                "Data Validation Complete", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.summary", languageCode,
                                "Validation Summary", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.errors", languageCode,
                                "Errors to Fix ({count})", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.warnings", languageCode,
                                "Recommendations ({count})", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.gotoError", languageCode, "Go to Error",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.rows", languageCode, "{count} row(s)",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.folders", languageCode,
                                "{count} folder(s)", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.testcases", languageCode,
                                "{count} test case(s)", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.errorCount", languageCode,
                                "{count} error(s)", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.warningCount", languageCode,
                                "{count} warning(s)", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.column", languageCode, "Column",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.row", languageCode, "Row", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.solution", languageCode, "💡 Solution:",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.improvement", languageCode,
                                "💡 Improvement:", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.successMessage", languageCode,
                                "All data is valid! Ready to save.", createdBy);

                // Validation error/warning messages English
                createTranslationIfNotExists("testcase.spreadsheet.validation.error.nameRequired", languageCode,
                                "Row {row}: Name is required.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.error.duplicateFolder", languageCode,
                                "Row {row}: Folder name \"{name}\" is duplicated. Folder names must be unique.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.error.duplicateTestCase", languageCode,
                                "Row {row}: Test case name \"{name}\" is duplicated in the same folder. Test case names must be unique within the same folder.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.error.circularReference", languageCode,
                                "Row {row}: \"{name}\" refers to itself as parent folder.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.error.missingParentFolder", languageCode,
                                "Row {row}: Parent folder \"{parent}\" not found.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.warning.invalidType", languageCode,
                                "Row {row}: Type \"{type}\" is not a standard format. Use 'Folder' or 'Test Case'.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.warning.invalidParentType", languageCode,
                                "Row {row}: \"{parent}\" is not a folder.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.warning.missingExpectedResult",
                                languageCode, "Row {row}: Expected result for Step {step} is empty.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.warning.noSteps", languageCode,
                                "Row {row}: No execution steps defined for test case.", createdBy);

                // Validation suggestion messages English
                createTranslationIfNotExists("testcase.spreadsheet.validation.suggestion.changeParent", languageCode,
                                "Specify a different folder as parent or leave the parent folder field empty.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.suggestion.createParentFolder",
                                languageCode,
                                "Create the \"{parent}\" folder first or enter the correct folder name/ID.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.suggestion.addExpectedResult",
                                languageCode, "Adding expected results for each step improves test clarity.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.suggestion.addSteps", languageCode,
                                "Add at least one test step.", createdBy);

                // Validation column names English
                createTranslationIfNotExists("testcase.spreadsheet.validation.columnName.name", languageCode, "Name",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.columnName.type", languageCode, "Type",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.columnName.parentFolder", languageCode,
                                "Parent Folder", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.columnName.step", languageCode,
                                "Step {number}", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.columnName.expected", languageCode,
                                "Expected {number}", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.validation.columnName.all", languageCode, "All",
                                createdBy);

                createTranslationIfNotExists("testcase.spreadsheet.fallback.title", languageCode,
                                "Enhanced Spreadsheet Mode",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.fallback.description", languageCode,
                                "All features work normally. Supports cell editing, copy/paste, and bulk save.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.error.title", languageCode,
                                "Spreadsheet Loading Error",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.error.description", languageCode,
                                "An error occurred while loading react-datasheet-grid.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.placeholder.multiline", languageCode,
                                "Multi-line input available...", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.placeholder.text", languageCode, "Enter text...",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.placeholder.columnInput", languageCode,
                                "Enter {title}...",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.saveSuccess", languageCode,
                                "{count} test case(s) saved successfully.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.saveError", languageCode,
                                "An error occurred while saving: {error}", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.refreshSuccess", languageCode,
                                "Refreshed with latest data.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.refreshError", languageCode,
                                "An error occurred while refreshing: {error}", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.noChanges", languageCode,
                                "No changes detected.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.batchSaveSuccess", languageCode,
                                "✅ Batch save completed: {folderCount} folder(s), {testCaseCount} test case(s)",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.batchSavePartialFailure", languageCode,
                                "⚠️ Batch save partial failure:\n✅ Success: {successCount}\n❌ Failed: {failureCount}\n\n",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.failureDetails", languageCode,
                                "Failure details:\n",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.message.moreErrors", languageCode,
                                "... and {count} more error(s)\n", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepMenu.addStep", languageCode,
                                "Add Step ({count})",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepMenu.removeStep", languageCode,
                                "Remove Step ({count})",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepMenu.settings", languageCode,
                                "Set Step Count...",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.title", languageCode, "Set Step Count",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.description", languageCode,
                                "Set the number of steps for test cases. Existing data will be preserved.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.label", languageCode, "Step Count",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.helper", languageCode,
                                "Can be set from 1 to 10.",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.cancel", languageCode, "Cancel",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.stepDialog.apply", languageCode, "Apply", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.footer.info", languageCode,
                                "* Advanced spreadsheet based on react-datasheet-grid • {count} step(s) • Line break and advanced editing support",
                                createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.footer.warning", languageCode,
                                "⚠️ Changes will be lost if not saved.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.status.lineBreakSupport", languageCode,
                                "Line Break Support",
                                createdBy);
                createTranslationIfNotExists("testcase.advancedGrid.title", languageCode, "Advanced Spreadsheet",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.title", languageCode,
                                "Advanced Spreadsheet", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.description", languageCode,
                                "Advanced spreadsheet mode: Spreadsheet with line break and advanced editing features.",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", languageCode,
                                "Advanced Spreadsheet (Line break support, react-datasheet-grid)", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.ariaLabel", languageCode,
                                "Advanced Spreadsheet Mode", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.status", languageCode,
                                "🚀 Advanced Spreadsheet - Supports line breaks and multi-selection.", createdBy);
                createTranslationIfNotExists("attachments.loading", languageCode, "Loading attachments...", createdBy);
                createTranslationIfNotExists("attachments.empty", languageCode, "No attachments.", createdBy);
                createTranslationIfNotExists("attachments.title", languageCode, "Attachments", createdBy);
                createTranslationIfNotExists("attachments.button.download", languageCode, "Download", createdBy);
                createTranslationIfNotExists("attachments.button.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("attachments.delete.title", languageCode, "Delete Attachment", createdBy);
                createTranslationIfNotExists("attachments.delete.message", languageCode,
                                "Do you want to delete this file?",
                                createdBy);
                createTranslationIfNotExists("attachments.delete.warning", languageCode,
                                "Deleted files cannot be recovered.",
                                createdBy);
                createTranslationIfNotExists("attachments.error.loadFailed", languageCode,
                                "Unable to load attachment list.",
                                createdBy);
                createTranslationIfNotExists("attachments.error.loadError", languageCode,
                                "An error occurred while loading the attachment list.", createdBy);
                createTranslationIfNotExists("attachments.error.downloadError", languageCode,
                                "An error occurred while downloading the file.", createdBy);
                createTranslationIfNotExists("attachments.error.deleteError", languageCode,
                                "An error occurred while deleting the file.", createdBy);
                createTranslationIfNotExists("common.button.retry", languageCode, "Retry", createdBy);
                createTranslationIfNotExists("common.button.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("common.button.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("testcase.inputMode.title", languageCode, "Input Mode Selection",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.form.title", languageCode, "Individual Form",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.spreadsheet.title", languageCode, "Spreadsheet",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.title", languageCode,
                                "Advanced Spreadsheet", createdBy);
                createTranslationIfNotExists("testcase.inputMode.form.description", languageCode,
                                "Individual Form Mode: You can input test cases one by one in detail.", createdBy);
                createTranslationIfNotExists("testcase.inputMode.spreadsheet.description", languageCode,
                                "Spreadsheet Mode: You can input multiple test cases at once in bulk.", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.description", languageCode,
                                "Advanced Spreadsheet Mode: A spreadsheet with line breaks and advanced editing features.",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.form.tooltip", languageCode,
                                "Detailed input with individual form (traditional method)", createdBy);
                createTranslationIfNotExists("testcase.inputMode.spreadsheet.tooltip", languageCode,
                                "Bulk input with spreadsheet (basic version)", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", languageCode,
                                "Advanced spreadsheet (with line break support, react-datasheet-grid)", createdBy);
                createTranslationIfNotExists("testcase.inputMode.form.ariaLabel", languageCode, "Form Mode", createdBy);
                createTranslationIfNotExists("testcase.inputMode.spreadsheet.ariaLabel", languageCode,
                                "Spreadsheet Mode",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.ariaLabel", languageCode,
                                "Advanced Spreadsheet Mode", createdBy);
                createTranslationIfNotExists("testcase.inputMode.form.status", languageCode,
                                "📝 Currently there are {count} test cases.", createdBy);
                createTranslationIfNotExists("testcase.inputMode.form.features", languageCode,
                                "• All fields supported • No step limits • Detailed input available", createdBy);
                createTranslationIfNotExists("testcase.inputMode.spreadsheet.status", languageCode,
                                "📊 Provides an Excel-like editing environment. (Basic version)", createdBy);
                createTranslationIfNotExists("testcase.inputMode.spreadsheet.features", languageCode,
                                "• 50+ simultaneous editing on one screen • Dynamic management of 1-10 steps • Fast bulk input",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.status", languageCode,
                                "🚀 Advanced Spreadsheet - Supports line breaks and multi-selection.", createdBy);
                createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.features", languageCode,
                                "• Line breaks in cells (Enter) • Multi-selection (Shift+Click) • Drag resize • Advanced copy/paste",
                                createdBy);
                createTranslationIfNotExists("testcase.inputMode.warning.modeSwitch", languageCode,
                                "⚠️ Data currently being edited will be preserved when switching modes.", createdBy);
                createTranslationIfNotExists("common.button.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("common.button.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("junit.dashboard.title", languageCode, "Test Result Dashboard", createdBy);
                createTranslationIfNotExists("junit.dashboard.subtitle", languageCode,
                                "{projectName} - Automation Test Result Analysis", createdBy);
                createTranslationIfNotExists("junit.dashboard.upload", languageCode, "Upload", createdBy);
                createTranslationIfNotExists("junit.dashboard.uploading", languageCode, "Uploading...", createdBy);
                createTranslationIfNotExists("junit.dashboard.uploadResult", languageCode, "Upload Test Result",
                                createdBy);
                createTranslationIfNotExists("junit.dashboard.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("junit.header.testResultDashboard", languageCode, "Test Result Dashboard",
                                createdBy);
                createTranslationIfNotExists("junit.header.automationAnalysis", languageCode,
                                "Automation Test Result Analysis",
                                createdBy);
                createTranslationIfNotExists("junit.stats.passed", languageCode, "Passed", createdBy);
                createTranslationIfNotExists("junit.stats.failed", languageCode, "Failed", createdBy);
                createTranslationIfNotExists("junit.stats.error", languageCode, "Error", createdBy);
                createTranslationIfNotExists("junit.stats.skipped", languageCode, "Skipped", createdBy);
                createTranslationIfNotExists("junit.stats.successRate", languageCode, "Success Rate", createdBy);
                createTranslationIfNotExists("junit.stats.passedTests", languageCode, "Passed Tests", createdBy);
                createTranslationIfNotExists("junit.stats.failedTests", languageCode, "Failed Tests", createdBy);
                createTranslationIfNotExists("junit.stats.errorTests", languageCode, "Error Tests", createdBy);
                createTranslationIfNotExists("junit.stats.averageSuccessRate", languageCode, "Average Success Rate",
                                createdBy);
                createTranslationIfNotExists("junit.tab.overview", languageCode, "Overview", createdBy);
                createTranslationIfNotExists("junit.tab.recentResults", languageCode, "Recent Results", createdBy);
                createTranslationIfNotExists("junit.tab.statisticsChart", languageCode, "Statistics Chart", createdBy);
                createTranslationIfNotExists("junit.tab.trendAnalysis", languageCode, "Trend Analysis", createdBy);
                createTranslationIfNotExists("junit.chart.testStatusDistribution", languageCode,
                                "Test Status Distribution",
                                createdBy);
                createTranslationIfNotExists("junit.chart.recentExecutionResults", languageCode,
                                "Recent Execution Results",
                                createdBy);
                createTranslationIfNotExists("junit.chart.successRateTrend", languageCode, "Success Rate Trend",
                                createdBy);
                createTranslationIfNotExists("junit.chart.detailedStatistics", languageCode, "Detailed Statistics",
                                createdBy);
                createTranslationIfNotExists("junit.table.executionName", languageCode, "Execution Name", createdBy);
                createTranslationIfNotExists("junit.table.fileName", languageCode, "File Name", createdBy);
                createTranslationIfNotExists("junit.table.totalTests", languageCode, "Total Tests", createdBy);
                createTranslationIfNotExists("junit.table.successRate", languageCode, "Success Rate", createdBy);
                createTranslationIfNotExists("junit.table.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("junit.table.uploadTime", languageCode, "Upload Time", createdBy);
                createTranslationIfNotExists("junit.table.actions", languageCode, "Actions", createdBy);
                createTranslationIfNotExists("junit.button.viewDetail", languageCode, "View Detail", createdBy);
                createTranslationIfNotExists("junit.button.delete", languageCode, "Delete", createdBy);
                createTranslationIfNotExists("junit.button.backToAutomation", languageCode, "Back to Test Automation",
                                createdBy);
                createTranslationIfNotExists("junit.message.noResults", languageCode, "No test results found",
                                createdBy);
                createTranslationIfNotExists("junit.message.uploadFirst", languageCode,
                                "Upload JUnit XML files to analyze test results.", createdBy);
                createTranslationIfNotExists("junit.message.firstUpload", languageCode, "Upload First Test Result",
                                createdBy);
                createTranslationIfNotExists("junit.message.loadingResults", languageCode, "Loading test results...",
                                createdBy);
                createTranslationIfNotExists("junit.message.loadFailed", languageCode, "Failed to load test results.",
                                createdBy);
                createTranslationIfNotExists("junit.message.noData", languageCode, "No test results found.", createdBy);
                createTranslationIfNotExists("junit.message.trendDataInsufficient", languageCode,
                                "Insufficient data for trend analysis.", createdBy);
                createTranslationIfNotExists("junit.message.statisticsImplementing", languageCode,
                                "Statistics chart implementation in progress", createdBy);
                createTranslationIfNotExists("junit.message.selectProject", languageCode,
                                "Please select a project first.",
                                createdBy);
                createTranslationIfNotExists("junit.message.deletingResult", languageCode,
                                "Are you sure you want to delete this test result?", createdBy);
                createTranslationIfNotExists("junit.upload.dialog.title", languageCode, "Upload JUnit XML File",
                                createdBy);
                createTranslationIfNotExists("junit.upload.dragDrop", languageCode,
                                "Drag JUnit XML file or click to select",
                                createdBy);
                createTranslationIfNotExists("junit.upload.selectFile", languageCode, "Select File", createdBy);
                createTranslationIfNotExists("junit.upload.selectAnother", languageCode, "Select Another File",
                                createdBy);
                createTranslationIfNotExists("junit.upload.maxSize", languageCode, "Maximum {maxSize} allowed",
                                createdBy);
                createTranslationIfNotExists("junit.upload.allowedFormats", languageCode, "Allowed formats: {formats}",
                                createdBy);
                createTranslationIfNotExists("junit.upload.executionInfo", languageCode, "Test Execution Information",
                                createdBy);
                createTranslationIfNotExists("junit.upload.executionName", languageCode,
                                "Execution name (e.g., Sprint 24 Integration Tests)", createdBy);
                createTranslationIfNotExists("junit.upload.description", languageCode, "Description (optional)",
                                createdBy);
                createTranslationIfNotExists("junit.upload.cancel", languageCode, "Cancel", createdBy);
                createTranslationIfNotExists("junit.upload.fileSize", languageCode, "Size: {size}", createdBy);
                createTranslationIfNotExists("junit.date.noInfo", languageCode, "No date information", createdBy);
                createTranslationIfNotExists("junit.date.unknown", languageCode, "Unknown date format", createdBy);
                createTranslationIfNotExists("junit.date.invalid", languageCode, "Invalid date", createdBy);
                createTranslationIfNotExists("junit.date.error", languageCode, "Date processing error", createdBy);
                createTranslationIfNotExists("junit.detail.title", languageCode, "JUnit Test Result Details",
                                createdBy);
                createTranslationIfNotExists("junit.detail.uploadInfo", languageCode, "Upload: {date} | {uploader}",
                                createdBy);
                createTranslationIfNotExists("junit.detail.loadingDetail", languageCode,
                                "Loading test result details...",
                                createdBy);
                createTranslationIfNotExists("junit.detail.loadFailedDetail", languageCode,
                                "Failed to load test result details.", createdBy);
                createTranslationIfNotExists("junit.detail.notFound", languageCode, "Test result not found.",
                                createdBy);
                createTranslationIfNotExists("junit.detail.exportPDF", languageCode, "Export to PDF", createdBy);
                createTranslationIfNotExists("junit.detail.exportingPDF", languageCode, "Generating PDF...", createdBy);
                createTranslationIfNotExists("junit.detail.exportCSV", languageCode, "Export to CSV", createdBy);
                createTranslationIfNotExists("junit.detail.exportingCSV", languageCode, "Generating CSV...", createdBy);
                createTranslationIfNotExists("junit.detail.versionManagement", languageCode, "Version Management",
                                createdBy);
                createTranslationIfNotExists("junit.detail.tab.testCases", languageCode, "Test Cases", createdBy);
                createTranslationIfNotExists("junit.detail.tab.failedTests", languageCode, "Failed Tests", createdBy);
                createTranslationIfNotExists("junit.detail.tab.slowTests", languageCode, "Slow Tests", createdBy);
                createTranslationIfNotExists("junit.detail.backToAutomation", languageCode, "Back to Automation Tests",
                                createdBy);
                createTranslationIfNotExists("junit.detail.refresh", languageCode, "Refresh", createdBy);
                createTranslationIfNotExists("junit.detail.noDateInfo", languageCode, "No date information", createdBy);
                createTranslationIfNotExists("junit.detail.unknownDateFormat", languageCode, "Unknown date format",
                                createdBy);
                createTranslationIfNotExists("junit.detail.invalidDate", languageCode, "Invalid date", createdBy);
                createTranslationIfNotExists("junit.detail.dateProcessingError", languageCode, "Date processing error",
                                createdBy);
                createTranslationIfNotExists("junit.detail.loadTestCasesFailed", languageCode,
                                "Failed to load test cases.",
                                createdBy);
                createTranslationIfNotExists("junit.detail.testSuite", languageCode, "Test Suite", createdBy);
                createTranslationIfNotExists("junit.detail.testCaseSearch", languageCode, "Search test cases...",
                                createdBy);
                createTranslationIfNotExists("junit.detail.testName", languageCode, "Test Name", createdBy);
                createTranslationIfNotExists("junit.detail.edit", languageCode, "Edit", createdBy);
                createTranslationIfNotExists("junit.detail.original", languageCode, "Original", createdBy);
                createTranslationIfNotExists("junit.detail.failedTestCases", languageCode, "Failed Test Cases",
                                createdBy);
                createTranslationIfNotExists("junit.detail.noFailedTests", languageCode, "No failed test cases!",
                                createdBy);
                createTranslationIfNotExists("junit.detail.failureMessagePreview", languageCode,
                                "Failure message preview:",
                                createdBy);
                createTranslationIfNotExists("junit.detail.clickForDetails", languageCode,
                                "Click the test name for details",
                                createdBy);
                createTranslationIfNotExists("junit.detail.slowestTests", languageCode, "Slowest Test Cases",
                                createdBy);
                createTranslationIfNotExists("junit.detail.slowestTestsTop", languageCode,
                                "Slowest Test Cases (Top {count})",
                                createdBy);
                createTranslationIfNotExists("junit.detail.noExecutionTimeData", languageCode,
                                "No execution time data available.", createdBy);
                createTranslationIfNotExists("junit.detail.exportPDFAlert", languageCode, "Test result not found.",
                                createdBy);
                createTranslationIfNotExists("junit.detail.exportPDFComplete", languageCode, "PDF export complete",
                                createdBy);
                createTranslationIfNotExists("junit.detail.exportPDFFailed", languageCode, "PDF export failed",
                                createdBy);
                createTranslationIfNotExists("junit.detail.exportPDFError", languageCode,
                                "An error occurred during PDF export",
                                createdBy);
                createTranslationIfNotExists("junit.detail.exportCSVAlert", languageCode, "No test result to export.",
                                createdBy);
                createTranslationIfNotExists("junit.detail.exportCSVComplete", languageCode, "CSV export complete",
                                createdBy);
                createTranslationIfNotExists("junit.detail.exportCSVFailed", languageCode, "CSV export failed",
                                createdBy);
                createTranslationIfNotExists("junit.detail.exportCSVError", languageCode,
                                "An error occurred during CSV export",
                                createdBy);
                createTranslationIfNotExists("common.unit.count", languageCode, "", createdBy);
                createTranslationIfNotExists("common.status", languageCode, "Status", createdBy);
                createTranslationIfNotExists("common.all", languageCode, "All", createdBy);
                createTranslationIfNotExists("junit.suite.testSuite", languageCode, "Test Suite", createdBy);
                createTranslationIfNotExists("junit.suite.all", languageCode, "All", createdBy);
                createTranslationIfNotExists("junit.suite.search", languageCode, "Search test cases...", createdBy);
                createTranslationIfNotExists("junit.failed.title", languageCode, "Failed Test Cases ({count} cases)",
                                createdBy);
                createTranslationIfNotExists("junit.failed.noFailures", languageCode, "No failed test cases!",
                                createdBy);
                createTranslationIfNotExists("junit.failed.failureMessage", languageCode, "Failure message preview:",
                                createdBy);
                createTranslationIfNotExists("junit.failed.clickForDetail", languageCode,
                                "Click test name to view details",
                                createdBy);
                createTranslationIfNotExists("junit.slow.title", languageCode, "Slowest Test Cases (Top {count})",
                                createdBy);
                createTranslationIfNotExists("junit.slow.noData", languageCode, "No execution time data available.",
                                createdBy);
                createTranslationIfNotExists("junit.testcase.selectCase", languageCode, "Select a test case",
                                createdBy);
                createTranslationIfNotExists("junit.testcase.loadingDetail", languageCode,
                                "Loading test case details...",
                                createdBy);
                createTranslationIfNotExists("junit.testcase.errorOccurred", languageCode, "Error Occurred", createdBy);
                createTranslationIfNotExists("junit.testcase.noData", languageCode, "No Data", createdBy);
                createTranslationIfNotExists("junit.testcase.noDetailInfo", languageCode,
                                "No test case detail information available.", createdBy);
                createTranslationIfNotExists("junit.testcase.edit", languageCode, "Edit Test Case", createdBy);
                createTranslationIfNotExists("junit.testcase.close", languageCode, "Close", createdBy);
                createTranslationIfNotExists("junit.testcase.previous", languageCode, "Previous Test Case", createdBy);
                createTranslationIfNotExists("junit.testcase.next", languageCode, "Next Test Case", createdBy);
                createTranslationIfNotExists("junit.tracelog.tab", languageCode, "Tracelog", createdBy);
                createTranslationIfNotExists("junit.tracelog.failureMessage", languageCode, "Failure Message",
                                createdBy);
                createTranslationIfNotExists("junit.tracelog.stackTrace", languageCode, "Stack Trace", createdBy);

                // RAG AI Generated Test Case English Translations
                createTranslationIfNotExists("rag.testcase.preview.title", languageCode, "✨ AI Generated Test Case",
                                createdBy);
                createTranslationIfNotExists("rag.testcase.addButton", languageCode, "Add Test Case", createdBy);
                createTranslationIfNotExists("rag.testcase.addToProject", languageCode, "Add to Project", createdBy);
                createTranslationIfNotExists("rag.testcase.created", languageCode, "Created", createdBy);
                createTranslationIfNotExists("rag.testcase.creating", languageCode, "Creating...", createdBy);
                createTranslationIfNotExists("rag.testcase.createSuccess", languageCode,
                                "Test case created successfully!",
                                createdBy);
                createTranslationIfNotExists("rag.testcase.createError", languageCode, "Failed to create test case.",
                                createdBy);
                createTranslationIfNotExists("rag.testcase.dialog.title", languageCode, "Add Test Case", createdBy);

                // Tags English Translations
                createTranslationIfNotExists("testcase.form.tags", languageCode, "Tags", createdBy);
                createTranslationIfNotExists("testcase.form.tagsPlaceholder", languageCode,
                                "Enter tags and press Enter",
                                createdBy);
                createTranslationIfNotExists("testcase.helper.tags", languageCode, "You can enter multiple tags",
                                createdBy);

                // Priority English Translations
                createTranslationIfNotExists("testcase.form.priority", languageCode, "Priority", createdBy);
                createTranslationIfNotExists("testcase.priority.high", languageCode, "High", createdBy);
                createTranslationIfNotExists("testcase.priority.medium", languageCode, "Medium", createdBy);
                createTranslationIfNotExists("testcase.priority.low", languageCode, "Low", createdBy);

                // Linked RAG Documents English Translations
                createTranslationIfNotExists("testcase.form.linkedDocuments", languageCode, "Linked RAG Documents",
                                createdBy);
                createTranslationIfNotExists("testcase.form.linkedDocumentsPlaceholder", languageCode,
                                "Select RAG documents",
                                createdBy);
                createTranslationIfNotExists("testcase.helper.linkedDocuments", languageCode,
                                "AI can reference linked RAG documents", createdBy);

                // Post-condition Helper Text English Translation
                createTranslationIfNotExists("testcase.helper.postCondition", languageCode, "Enter post-condition.",
                                createdBy);

                // Markdown Support Message English Translation
                createTranslationIfNotExists("testcase.helper.markdownSupported", languageCode,
                                "Markdown syntax is supported.",
                                createdBy);

                // JUnit Dashboard Sections
                createTranslationIfNotExists("junit.sections.statistics", languageCode, "Statistics Overview",
                                createdBy);
                createTranslationIfNotExists("junit.sections.charts", languageCode, "Chart Analysis", createdBy);
                createTranslationIfNotExists("junit.sections.list", languageCode, "Test Execution List", createdBy);

                // JUnit Dashboard List Table Headers
                createTranslationIfNotExists("junit.table.recentTestExecutionResults", languageCode,
                                "Recent Test Execution Results", createdBy);
                createTranslationIfNotExists("junit.dashboard.list.fileName", languageCode, "File Name", createdBy);
                createTranslationIfNotExists("junit.dashboard.list.testPlan", languageCode, "Test Plan", createdBy);
                createTranslationIfNotExists("junit.dashboard.list.executionName", languageCode, "Execution Name",
                                createdBy);

                // JUnit Empty States
                createTranslationIfNotExists("junit.empty.noResults", languageCode, "No test results", createdBy);
                createTranslationIfNotExists("junit.empty.uploadPrompt", languageCode,
                                "Upload JUnit XML files to analyze test results.", createdBy);
                createTranslationIfNotExists("junit.empty.firstUpload", languageCode, "Upload First Test Result",
                                createdBy);

                // JUnit Confirm Messages
                createTranslationIfNotExists("junit.confirm.deleteResult", languageCode,
                                "Are you sure you want to delete this test result?", createdBy);
                createTranslationIfNotExists("junit.error.loadFailed", languageCode, "Failed to load JUnit results.",
                                createdBy);

                // Version History English Translations
                createTranslationIfNotExists("testcase.versionHistory.title", languageCode, "Test Case Version History",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.error.fetchFailed", languageCode,
                                "Failed to retrieve version history.", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.error.fetchError", languageCode,
                                "Version history retrieval failed:", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.error.restoreFailed", languageCode,
                                "Failed to restore version.", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.error.restoreError", languageCode,
                                "Version restoration failed:", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.error.viewFailed", languageCode,
                                "Failed to retrieve version details.", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.error.viewError", languageCode,
                                "Version details retrieval failed:", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.empty", languageCode,
                                "No version history available.",
                                createdBy);

                // Version Change Type Labels
                createTranslationIfNotExists("testcase.versionHistory.changeType.create", languageCode, "Create",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.changeType.update", languageCode, "Update",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.changeType.manualSave", languageCode,
                                "Manual Save",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.changeType.restore", languageCode, "Restore",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.changeType.unknown", languageCode, "Unknown",
                                createdBy);

                // Version Status and Info
                createTranslationIfNotExists("testcase.versionHistory.current", languageCode, "Current", createdBy);
                createTranslationIfNotExists("testcase.versionHistory.changeSummary.empty", languageCode, "No changes",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.creator.unknown", languageCode, "Unknown",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.time.unknown", languageCode,
                                "No time information",
                                createdBy);

                // Version Action Tooltips
                createTranslationIfNotExists("testcase.versionHistory.action.view", languageCode, "View Details",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.action.restore", languageCode,
                                "Restore to this version",
                                createdBy);
                createTranslationIfNotExists("testcase.versionHistory.action.compare", languageCode,
                                "Compare with next version",
                                createdBy);

                // Version Detail Dialog
                createTranslationIfNotExists("testcase.versionDetail.title", languageCode, "Version Details",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.section.basic", languageCode, "Basic Information",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.section.steps", languageCode, "Test Steps",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.section.version", languageCode,
                                "Version Information",
                                createdBy);

                // Version Detail Fields
                createTranslationIfNotExists("testcase.versionDetail.field.name", languageCode, "Name:", createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.description", languageCode, "Description:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.preCondition", languageCode,
                                "Pre-condition:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.expectedResults", languageCode,
                                "Expected Results:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.priority", languageCode, "Priority:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.versionNumber", languageCode,
                                "Version Number:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.changeType", languageCode, "Change Type:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.changeSummary", languageCode,
                                "Change Summary:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.creator", languageCode, "Creator:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.createdAt", languageCode, "Created At:",
                                createdBy);
                createTranslationIfNotExists("testcase.versionDetail.field.none", languageCode, "None", createdBy);

                // Version Detail Step Info
                createTranslationIfNotExists("testcase.versionDetail.step.number", languageCode, "Step", createdBy);
                createTranslationIfNotExists("testcase.versionDetail.step.expectedResult", languageCode,
                                "Expected Result:",
                                createdBy);

                // Version Detail Button
                createTranslationIfNotExists("testcase.versionDetail.button.close", languageCode, "Close", createdBy);

                // Version Indicator - Status
                createTranslationIfNotExists("testcase.version.status.current", languageCode, "Latest Version",
                                createdBy);
                createTranslationIfNotExists("testcase.version.status.outdated", languageCode, "Previous Version",
                                createdBy);
                createTranslationIfNotExists("testcase.version.status.draft", languageCode, "Draft", createdBy);
                createTranslationIfNotExists("testcase.version.status.none", languageCode, "No Version", createdBy);

                // Version Indicator - Tooltip
                createTranslationIfNotExists("testcase.version.tooltip.current", languageCode,
                                "This is the latest version",
                                createdBy);
                createTranslationIfNotExists("testcase.version.tooltip.outdated", languageCode,
                                "A newer version is available",
                                createdBy);
                createTranslationIfNotExists("testcase.version.tooltip.draft", languageCode, "This is a draft version",
                                createdBy);
                createTranslationIfNotExists("testcase.version.tooltip.none", languageCode,
                                "No version has been created",
                                createdBy);

                // Version Indicator - Menu
                createTranslationIfNotExists("testcase.version.menu.history", languageCode, "Version History",
                                createdBy);
                createTranslationIfNotExists("testcase.version.menu.createNew", languageCode, "Create New Version",
                                createdBy);
                createTranslationIfNotExists("testcase.version.menu.restore", languageCode, "Restore to this version",
                                createdBy);
                createTranslationIfNotExists("testcase.version.menu.restoreDescription", languageCode,
                                "Set as current version",
                                createdBy);

                // Version Indicator - Misc
                createTranslationIfNotExists("testcase.version.noChanges", languageCode, "No changes", createdBy);

                // Bulk Operations English Translations
                createTranslationIfNotExists("testcase.bulkOps.dialog.title", languageCode,
                                "Bulk Operations for Test Cases", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.dialog.selectedCount", languageCode,
                                "Selected: {count} item(s)", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.dialog.moreItems", languageCode, "and {count} more",
                                createdBy);

                // Operation Types
                createTranslationIfNotExists("testcase.bulkOps.operation.label", languageCode, "Operation Type",
                                createdBy);
                createTranslationIfNotExists("testcase.bulkOps.operation.update", languageCode,
                                "Bulk Update Properties", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.operation.copy", languageCode, "Copy", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.operation.move", languageCode, "Move", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.operation.delete", languageCode, "Delete", createdBy);

                // Operation Descriptions
                createTranslationIfNotExists("testcase.bulkOps.description.update", languageCode,
                                "Bulk update properties of selected test cases.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.description.delete", languageCode,
                                "Permanently delete selected test cases. This action cannot be undone.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.description.move", languageCode,
                                "Move selected test cases to another project or folder.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.description.copy", languageCode,
                                "Copy selected test cases to another project or folder.", createdBy);

                // Field Labels
                createTranslationIfNotExists("testcase.bulkOps.field.priority", languageCode, "Priority", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.field.type", languageCode, "Type", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.field.description", languageCode,
                                "Description (append to existing)", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.field.targetProject", languageCode, "Target Project",
                                createdBy);
                createTranslationIfNotExists("testcase.bulkOps.field.targetFolder", languageCode,
                                "Target Folder (Optional)", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.field.rootFolder", languageCode, "Root Folder",
                                createdBy);

                // Option Values
                createTranslationIfNotExists("testcase.bulkOps.option.noChange", languageCode, "No Change", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.priority.high", languageCode, "High", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.priority.medium", languageCode, "Medium", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.priority.low", languageCode, "Low", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.type.testcase", languageCode, "Test Case", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.type.folder", languageCode, "Folder", createdBy);

                // Placeholders
                createTranslationIfNotExists("testcase.bulkOps.placeholder.description", languageCode,
                                "This content will be appended to existing descriptions...", createdBy);

                // Error Messages
                createTranslationIfNotExists("testcase.bulkOps.error.selectOperation", languageCode,
                                "Please select an operation type.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.error.selectProject", languageCode,
                                "Please select a target project.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.error.confirmDelete", languageCode,
                                "Please check delete confirmation.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.error.unknownOperation", languageCode,
                                "Unknown operation type.", createdBy);
                createTranslationIfNotExists("testcase.bulkOps.error.executionFailed", languageCode,
                                "An error occurred while executing the operation.", createdBy);

                // Confirmation Messages
                createTranslationIfNotExists("testcase.bulkOps.confirm.deleteMessage", languageCode,
                                "I confirm the permanent deletion of the selected test cases.", createdBy);

                // Status Messages
                createTranslationIfNotExists("testcase.bulkOps.status.processing", languageCode, "Processing...",
                                createdBy);
                createTranslationIfNotExists("testcase.bulkOps.button.execute", languageCode, "Execute", createdBy);

                // Spreadsheet Row Insert/Delete Buttons
                createTranslationIfNotExists("testcase.spreadsheet.button.insertAbove", languageCode, "Insert Above", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.insertBelow", languageCode, "Insert Below", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.button.delete", languageCode, "Delete", createdBy);

                // Spreadsheet Additional Columns
                createTranslationIfNotExists("testcase.spreadsheet.column.priority", languageCode, "Priority", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.column.tags", languageCode, "Tags", createdBy);

                // Input Mode Selection Collapse/Expand
                createTranslationIfNotExists("testcase.inputMode.title", languageCode, "Input Mode Selection", createdBy);
                createTranslationIfNotExists("testcase.inputMode.expand", languageCode, "Expand", createdBy);
                createTranslationIfNotExists("testcase.inputMode.collapse", languageCode, "Collapse", createdBy);

                // Usage Guide Collapse/Expand
                createTranslationIfNotExists("testcase.spreadsheet.usage.title", languageCode, "Usage Guide", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.expand", languageCode, "Expand", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.collapse", languageCode, "Collapse", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.basicUsage", languageCode,
                                "Edit cells like Excel. Use Tab/Enter to move, Ctrl+C/V to copy/paste.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.folderFunction", languageCode,
                                "Folder feature: Click 'Add Folder' button or enter '📁 FolderName' format in name cell.", createdBy);
                createTranslationIfNotExists("testcase.spreadsheet.usage.stepManagement", languageCode,
                                "Step management: Click ⚙️ button to adjust step count (max 10).", createdBy);
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
