// src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishAdvancedFeaturesAndCommonUITranslations.java
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

/** English translations - RAG, Advanced Features, Charts, Navigation, Common UI */
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

    createTranslationIfNotExists(
        "organization.form.name", languageCode, "Organization Name", createdBy);
    createTranslationIfNotExists(
        "organization.dialog.delete.title", languageCode, "Delete Organization", createdBy);
    createTranslationIfNotExists(
        "organization.dialog.delete.message",
        languageCode,
        "Are you sure you want to delete this organization?",
        createdBy);
    createTranslationIfNotExists(
        "organization.dialog.invite.title", languageCode, "Invite Member", createdBy);
    createTranslationIfNotExists(
        "organization.dialog.createProject.title", languageCode, "Create Project", createdBy);
    createTranslationIfNotExists(
        "junit.dashboard.title", languageCode, "JUnit Dashboard", createdBy);
    createTranslationIfNotExists("junit.table.status", languageCode, "Status", createdBy);
    createTranslationIfNotExists(
        "junit.upload.dialog.title", languageCode, "Upload JUnit Results", createdBy);
    createTranslationIfNotExists(
        "testCaseResult.page.title", languageCode, "Test Case Results", createdBy);
    createTranslationIfNotExists("dashboard.title", languageCode, "Dashboard", createdBy);
    createTranslationIfNotExists(
        "dashboard.noData.message", languageCode, "No data to display", createdBy);
    createTranslationIfNotExists(
        "junit.error.loadFailed", languageCode, "Failed to load JUnit results", createdBy);
    createTranslationIfNotExists("dashboard.error.retry", languageCode, "Retry", createdBy);
    createTranslationIfNotExists(
        "dashboard.error.goToLogin", languageCode, "Go to Login", createdBy);
    createTranslationIfNotExists("dashboard.error.details", languageCode, "Details", createdBy);
    createTranslationIfNotExists("junit.stats.error", languageCode, "Error", createdBy);
    createTranslationIfNotExists("junit.stats.errorTests", languageCode, "Error Tests", createdBy);
    createTranslationIfNotExists(
        "junit.stats.successRate", languageCode, "Success Rate", createdBy);
    createTranslationIfNotExists("junit.stats.failed", languageCode, "Failed", createdBy);
    createTranslationIfNotExists(
        "organization.form.nameRequired", languageCode, "Organization name is required", createdBy);
    createTranslationIfNotExists(
        "organization.buttons.createNew", languageCode, "Create New Organization", createdBy);
    createTranslationIfNotExists(
        "organization.buttons.firstOrganization",
        languageCode,
        "Create First Organization",
        createdBy);
    createTranslationIfNotExists("organization.buttons.view", languageCode, "View", createdBy);
    createTranslationIfNotExists("common.buttons.edit", languageCode, "Edit", createdBy);
    createTranslationIfNotExists("common.buttons.delete", languageCode, "Delete", createdBy);
    createTranslationIfNotExists("common.expand", languageCode, "Expand", createdBy);
    createTranslationIfNotExists("common.collapse", languageCode, "Collapse", createdBy);
    createTranslationIfNotExists("common.buttons.cancel", languageCode, "Cancel", createdBy);
    createTranslationIfNotExists("common.buttons.create", languageCode, "Create", createdBy);
    createTranslationIfNotExists(
        "organization.dialog.delete.warning",
        languageCode,
        "This action cannot be undone",
        createdBy);
    createTranslationIfNotExists(
        "organization.form.description", languageCode, "Description", createdBy);
    createTranslationIfNotExists("project.form.name", languageCode, "Project Name", createdBy);
    createTranslationIfNotExists(
        "project.form.description", languageCode, "Project Description", createdBy);
    createTranslationIfNotExists("testCase.form.priority", languageCode, "Priority", createdBy);
    createTranslationIfNotExists("testCase.priority.high", languageCode, "High", createdBy);
    createTranslationIfNotExists("testCase.priority.medium", languageCode, "Medium", createdBy);
    createTranslationIfNotExists("testCase.priority.low", languageCode, "Low", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.field.title", languageCode, "Session Title", createdBy);
    createTranslationIfNotExists("header.nav.dashboard", languageCode, "Dashboard", createdBy);
    createTranslationIfNotExists(
        "header.nav.organizationManagement", languageCode, "Organization Management", createdBy);
    createTranslationIfNotExists(
        "header.nav.userManagement", languageCode, "User Management", createdBy);
    createTranslationIfNotExists(
        "header.nav.schedulerManagement", languageCode, "Scheduler Management", createdBy);
    createTranslationIfNotExists(
        "organization.dashboard.title", languageCode, "System Dashboard", createdBy);
    createTranslationIfNotExists(
        "organization.dashboard.metrics.totalUsers", languageCode, "Total Users", createdBy);
    createTranslationIfNotExists("common.buttons.refresh", languageCode, "Refresh", createdBy);
    createTranslationIfNotExists("common.buttons.cancel", languageCode, "Cancel", createdBy);
    createTranslationIfNotExists("common.save", languageCode, "Save", createdBy);
    createTranslationIfNotExists(
        "junit.empty.noResults", languageCode, "No test results available", createdBy);
    createTranslationIfNotExists(
        "junit.empty.uploadPrompt",
        languageCode,
        "Upload JUnit XML files to analyze test results.",
        createdBy);
    createTranslationIfNotExists(
        "junit.empty.firstUpload", languageCode, "Upload First Test Result", createdBy);
    createTranslationIfNotExists("junit.upload.fileSize", languageCode, "Size", createdBy);
    createTranslationIfNotExists(
        "junit.upload.changeFile", languageCode, "Choose Another File", createdBy);
    createTranslationIfNotExists(
        "junit.upload.executionInfo", languageCode, "Test Execution Information", createdBy);
    createTranslationIfNotExists(
        "junit.placeholder.description", languageCode, "Description (optional)", createdBy);
    createTranslationIfNotExists(
        "junit.upload.uploadingFile", languageCode, "Uploading \"{fileName}\"...", createdBy);
    createTranslationIfNotExists("junit.upload.max", languageCode, "Max", createdBy);
    createTranslationIfNotExists("junit.detail.upload", languageCode, "Upload", createdBy);
    createTranslationIfNotExists(
        "junit.detail.unknownUploader", languageCode, "Unknown", createdBy);
    createTranslationIfNotExists("junit.editor.title", languageCode, "Edit Test Case", createdBy);
    createTranslationIfNotExists("junit.editor.viewMode", languageCode, "(View Mode)", createdBy);
    createTranslationIfNotExists("junit.editor.editMode", languageCode, "(Edit Mode)", createdBy);
    createTranslationIfNotExists(
        "junit.editor.viewOriginalData", languageCode, "View Original Data", createdBy);
    createTranslationIfNotExists(
        "junit.editor.editHistory", languageCode, "Edit History", createdBy);
    createTranslationIfNotExists(
        "junit.editor.status.passedDesc", languageCode, "Test passed successfully", createdBy);
    createTranslationIfNotExists(
        "junit.editor.status.failedDesc", languageCode, "Test failed", createdBy);
    createTranslationIfNotExists(
        "junit.editor.status.errorDesc",
        languageCode,
        "An error occurred during test execution",
        createdBy);
    createTranslationIfNotExists(
        "junit.editor.status.skippedDesc", languageCode, "Test was skipped", createdBy);
    createTranslationIfNotExists("junit.editor.priority.high", languageCode, "High", createdBy);
    createTranslationIfNotExists("junit.editor.priority.medium", languageCode, "Medium", createdBy);
    createTranslationIfNotExists("junit.editor.priority.low", languageCode, "Low", createdBy);
    createTranslationIfNotExists("junit.editor.tags", languageCode, "Tags", createdBy);
    createTranslationIfNotExists(
        "junit.editor.tagsPlaceholder",
        languageCode,
        "Enter comma-separated tags (e.g., bug, regression, API)",
        createdBy);
    createTranslationIfNotExists(
        "junit.editor.tagsHelp",
        languageCode,
        "You can enter multiple tags separated by commas",
        createdBy);
    createTranslationIfNotExists("junit.editor.notes", languageCode, "Notes", createdBy);
    createTranslationIfNotExists(
        "junit.editor.notesPlaceholder",
        languageCode,
        "Enter additional notes for this test case",
        createdBy);
    createTranslationIfNotExists("junit.editor.preview", languageCode, "Preview", createdBy);
    createTranslationIfNotExists("junit.editor.saving", languageCode, "Saving...", createdBy);
    createTranslationIfNotExists(
        "junit.editor.error.noTestCase", languageCode, "Test case not found", createdBy);
    createTranslationIfNotExists(
        "junit.editor.error.saveFailed", languageCode, "Failed to save test case", createdBy);

    // Additional JUnit Editor Translations
    createTranslationIfNotExists(
        "junit.editor.originalJunitData", languageCode, "Original JUnit Data", createdBy);
    createTranslationIfNotExists("junit.editor.testName", languageCode, "Test Name", createdBy);
    createTranslationIfNotExists("junit.editor.className", languageCode, "Class Name", createdBy);
    createTranslationIfNotExists(
        "junit.editor.executionTime", languageCode, "Execution Time", createdBy);
    createTranslationIfNotExists(
        "junit.editor.originalStatus", languageCode, "Original Status", createdBy);
    createTranslationIfNotExists(
        "junit.editor.failureMessage", languageCode, "Failure Message", createdBy);
    createTranslationIfNotExists("junit.editor.stackTrace", languageCode, "Stack Trace", createdBy);
    createTranslationIfNotExists(
        "junit.editor.userEditInfo", languageCode, "User Edit Information", createdBy);
    createTranslationIfNotExists(
        "junit.editor.userDefinedTitle", languageCode, "User-Defined Title", createdBy);
    createTranslationIfNotExists(
        "junit.editor.userDefinedTitleHelp",
        languageCode,
        "Enter a custom title for this test case.",
        createdBy);
    createTranslationIfNotExists(
        "junit.editor.userDefinedStatus", languageCode, "User-Defined Status", createdBy);
    createTranslationIfNotExists(
        "junit.editor.useOriginalStatus", languageCode, "Use Original Status", createdBy);
    createTranslationIfNotExists("junit.editor.priorityLabel", languageCode, "Priority", createdBy);

    createTranslationIfNotExists(
        "rag.manager.noProject", languageCode, "Please select a project first.", createdBy);
    createTranslationIfNotExists("rag.upload.title", languageCode, "Document Upload", createdBy);
    createTranslationIfNotExists(
        "rag.upload.description",
        languageCode,
        "Upload PDF, DOCX, DOC, TXT files to register them in the RAG system. (Maximum 50MB)",
        createdBy);
    createTranslationIfNotExists(
        "rag.upload.dragAndDrop", languageCode, "Drag files here or click to select", createdBy);
    createTranslationIfNotExists("rag.upload.selectFiles", languageCode, "Select Files", createdBy);
    createTranslationIfNotExists(
        "rag.upload.selectedFiles", languageCode, "Selected Files", createdBy);
    createTranslationIfNotExists("rag.upload.uploading", languageCode, "Uploading", createdBy);
    createTranslationIfNotExists("rag.upload.upload", languageCode, "Upload", createdBy);
    createTranslationIfNotExists(
        "rag.upload.error.unsupportedFileType",
        languageCode,
        "Unsupported file type. (Only PDF, DOCX, DOC, TXT allowed)",
        createdBy);
    createTranslationIfNotExists(
        "rag.upload.error.fileTooLarge",
        languageCode,
        "File size is too large. (Maximum {maxSize}MB)",
        createdBy);
    createTranslationIfNotExists(
        "rag.upload.error.noFilesSelected",
        languageCode,
        "Please select files to upload.",
        createdBy);
    createTranslationIfNotExists(
        "rag.upload.parser.label", languageCode, "Document Analysis Parser", createdBy);
    createTranslationIfNotExists(
        "rag.upload.parser.pypdf2.description", languageCode, "Basic local parser", createdBy);
    createTranslationIfNotExists(
        "rag.upload.parser.pymupdf.description",
        languageCode,
        "Fast local parser with rich features",
        createdBy);
    createTranslationIfNotExists(
        "rag.upload.parser.pymupdf4llm.description",
        languageCode,
        "LLM-optimized markdown extraction",
        createdBy);
    createTranslationIfNotExists(
        "rag.upload.parser.upstage.description",
        languageCode,
        "Cloud API with advanced layout analysis (requires upstage_api_key)",
        createdBy);
    createTranslationIfNotExists("rag.preview.loading", languageCode, "Loading PDF...", createdBy);
    createTranslationIfNotExists(
        "rag.preview.pdfOnly", languageCode, "Only PDF files can be previewed.", createdBy);
    createTranslationIfNotExists(
        "rag.preview.error", languageCode, "Unable to load PDF.", createdBy);
    createTranslationIfNotExists("rag.document.status.pending", languageCode, "Pending", createdBy);
    createTranslationIfNotExists(
        "rag.document.status.analyzing", languageCode, "Analyzing", createdBy);
    createTranslationIfNotExists(
        "rag.document.status.completed", languageCode, "Completed", createdBy);
    createTranslationIfNotExists("rag.document.status.failed", languageCode, "Failed", createdBy);
    createTranslationIfNotExists(
        "rag.document.empty", languageCode, "No documents uploaded", createdBy);
    createTranslationIfNotExists(
        "rag.document.emptyDescription",
        languageCode,
        "Use the upload area above to register documents",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.list.title", languageCode, "Uploaded Documents", createdBy);
    createTranslationIfNotExists(
        "rag.document.list.fileName", languageCode, "File Name", createdBy);
    createTranslationIfNotExists("rag.document.list.fileSize", languageCode, "Size", createdBy);
    createTranslationIfNotExists("rag.document.list.status", languageCode, "Status", createdBy);
    createTranslationIfNotExists("rag.document.list.chunks", languageCode, "Chunks", createdBy);
    createTranslationIfNotExists(
        "rag.document.list.uploadDate", languageCode, "Upload Date", createdBy);
    createTranslationIfNotExists("rag.document.list.actions", languageCode, "Actions", createdBy);
    createTranslationIfNotExists(
        "rag.document.download", languageCode, "Download Document", createdBy);
    createTranslationIfNotExists("rag.document.delete", languageCode, "Delete Document", createdBy);
    createTranslationIfNotExists(
        "rag.document.deleteDialog.title", languageCode, "Confirm Document Deletion", createdBy);
    createTranslationIfNotExists(
        "rag.document.deleteDialog.message",
        languageCode,
        "Are you sure you want to delete this document? This action cannot be undone.",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.pagination.rowsPerPage", languageCode, "Rows per page:", createdBy);
    createTranslationIfNotExists("rag.document.viewChunks", languageCode, "View Chunks", createdBy);
    createTranslationIfNotExists(
        "rag.document.list.regularDocuments", languageCode, "Uploaded Documents", createdBy);
    createTranslationIfNotExists(
        "rag.document.list.testCaseDocuments", languageCode, "TestCase Documents", createdBy);
    createTranslationIfNotExists(
        "rag.document.list.uploadButton", languageCode, "Upload Document", createdBy);
    createTranslationIfNotExists(
        "rag.document.global.promoteAction", languageCode, "Move to Global Library", createdBy);
    createTranslationIfNotExists(
        "rag.document.global.requestAction",
        languageCode,
        "Request Global Registration",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.global.promoteTitle", languageCode, "Move to Global Library", createdBy);
    createTranslationIfNotExists(
        "rag.document.global.promoteDescription",
        languageCode,
        "Move this document to the global RAG knowledge base accessible to every project.",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.global.promoteReason", languageCode, "Reason (optional)", createdBy);
    createTranslationIfNotExists(
        "rag.document.global.promoteSuccess",
        languageCode,
        "Document moved to the global RAG library.",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.global.requestTitle", languageCode, "Request Global Registration", createdBy);
    createTranslationIfNotExists(
        "rag.document.global.requestSubmitted",
        languageCode,
        "Global document registration request has been sent to the administrator.",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.global.requestDescription",
        languageCode,
        "Ask an admin to add this document to the global RAG knowledge base.",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.global.requestMessage",
        languageCode,
        "Additional message (optional)",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.global.requestSubmitted",
        languageCode,
        "Your request has been sent to the administrator.",
        createdBy);
    createTranslationIfNotExists("rag.similar.title", languageCode, "Similar Search", createdBy);
    createTranslationIfNotExists(
        "rag.similar.description",
        languageCode,
        "Enter keywords or description, and the RAG system will find similar test cases or"
            + " documents.",
        createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchQuery", languageCode, "Search Query", createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchPlaceholder",
        languageCode,
        "e.g., Login functionality test, Sign-up validation",
        createdBy);
    createTranslationIfNotExists("rag.similar.search", languageCode, "Search", createdBy);
    createTranslationIfNotExists("rag.similar.searching", languageCode, "Searching...", createdBy);
    createTranslationIfNotExists(
        "rag.similar.noResults",
        languageCode,
        "No results found. Try different keywords.",
        createdBy);
    createTranslationIfNotExists(
        "rag.similar.resultsCount", languageCode, "Search Results ({count})", createdBy);
    createTranslationIfNotExists(
        "rag.similar.testCaseResults", languageCode, "Test Cases", createdBy);
    createTranslationIfNotExists(
        "rag.similar.documentResults", languageCode, "Documents", createdBy);
    createTranslationIfNotExists(
        "rag.similar.metadata",
        languageCode,
        "Document ID: {documentId} | Chunk Order: {chunkIndex}",
        createdBy);
    createTranslationIfNotExists("rag.similar.copy", languageCode, "Copy", createdBy);
    createTranslationIfNotExists(
        "rag.similar.addTestCase", languageCode, "Add as Test Case", createdBy);
    createTranslationIfNotExists("rag.similar.unknownDocument", languageCode, "Unknown", createdBy);
    createTranslationIfNotExists(
        "rag.similar.testCaseTitle", languageCode, "Test Case - {fileName}", createdBy);
    createTranslationIfNotExists(
        "rag.similar.sourceTestcase", languageCode, "Test Case", createdBy);
    createTranslationIfNotExists("rag.similar.sourceDocument", languageCode, "Document", createdBy);
    createTranslationIfNotExists(
        "rag.similar.noHighSimilarityResults",
        languageCode,
        "No documents with 82% or higher similarity found. See below for lower similarity results.",
        createdBy);
    createTranslationIfNotExists(
        "rag.similar.lowSimilarityCollapsed",
        languageCode,
        "Low similarity (click to view)",
        createdBy);

    // Advanced Search Settings English Translations
    createTranslationIfNotExists(
        "rag.similar.advancedSettings", languageCode, "Advanced Search Settings", createdBy);
    createTranslationIfNotExists(
        "rag.similar.advancedSettings.enabled", languageCode, "Enabled", createdBy);
    createTranslationIfNotExists(
        "rag.similar.advancedSettings.disabled", languageCode, "Disabled", createdBy);
    createTranslationIfNotExists(
        "rag.similar.advancedSettings.use", languageCode, "Use Advanced Search", createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod", languageCode, "Search Method", createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod.vector", languageCode, "Vector Search", createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod.vector.description",
        languageCode,
        "Semantic similarity-based (pure vector)",
        createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod.bm25", languageCode, "BM25 Search", createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod.bm25.description",
        languageCode,
        "Keyword-based (exact word matching)",
        createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod.hybrid", languageCode, "Hybrid Search", createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod.hybrid.description",
        languageCode,
        "Vector + BM25 combined (RRF)",
        createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod.hybridRerank", languageCode, "Hybrid + Reranker ⭐", createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod.hybridRerank.description",
        languageCode,
        "Best quality (recommended) - slower",
        createdBy);
    createTranslationIfNotExists(
        "rag.similar.weightAdjustment", languageCode, "Search Weight Adjustment", createdBy);
    createTranslationIfNotExists(
        "rag.similar.vectorWeight", languageCode, "Vector Search: {weight}%", createdBy);
    createTranslationIfNotExists(
        "rag.similar.bm25Weight", languageCode, "BM25 Search: {weight}%", createdBy);
    createTranslationIfNotExists(
        "rag.similar.recommendedSettings",
        languageCode,
        "Recommended: Vector 60% + BM25 40% (optimized for Korean)",
        createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod.vector.info",
        languageCode,
        "📊 Search based on semantic similarity. Finds documents with similar meanings.",
        createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod.bm25.info",
        languageCode,
        "🔍 Keyword-based search. Strong in exact word matching.",
        createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod.hybrid.info",
        languageCode,
        "⚡ Combines vector and BM25 for balanced search results.",
        createdBy);
    createTranslationIfNotExists(
        "rag.similar.searchMethod.hybridRerank.info",
        languageCode,
        "⭐ Reranks hybrid search results for the highest quality. (Processing time: ~2-3x)",
        createdBy);

    createTranslationIfNotExists(
        "projectHeader.tabs.ragDocuments", languageCode, "RAG Documents", createdBy);

    // RAG Chat Interface Translations
    createTranslationIfNotExists("rag.chat.title", languageCode, "AI Q&A", createdBy);
    createTranslationIfNotExists(
        "rag.chat.exitFullScreen", languageCode, "Exit Full Screen", createdBy);
    createTranslationIfNotExists(
        "rag.chat.enterFullScreen", languageCode, "Enter Full Screen", createdBy);
    createTranslationIfNotExists("rag.chat.retry", languageCode, "Retry", createdBy);
    createTranslationIfNotExists("rag.chat.clear", languageCode, "Clear Conversation", createdBy);
    createTranslationIfNotExists(
        "rag.chat.persistToggle", languageCode, "Auto-save Conversation", createdBy);
    createTranslationIfNotExists(
        "rag.chat.useRagSearch", languageCode, "Search RAG Documents First", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadSelectLabel", languageCode, "Saved Threads", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadAutoOption", languageCode, "Auto-create New Thread", createdBy);
    createTranslationIfNotExists(
        "rag.chat.untitledThread", languageCode, "Untitled Thread", createdBy);
    createTranslationIfNotExists(
        "rag.chat.refreshThreads", languageCode, "Refresh Threads", createdBy);
    createTranslationIfNotExists("rag.chat.deleteThread", languageCode, "Delete Thread", createdBy);
    createTranslationIfNotExists("rag.chat.createThread", languageCode, "New Thread", createdBy);
    createTranslationIfNotExists(
        "rag.chat.manageThreadsAction", languageCode, "Manage Threads", createdBy);
    createTranslationIfNotExists(
        "rag.chat.categorySelectLabel", languageCode, "Category", createdBy);
    createTranslationIfNotExists(
        "rag.chat.empty", languageCode, "Ask a question about the documents.", createdBy);
    createTranslationIfNotExists(
        "rag.chat.placeholder", languageCode, "Enter your message...", createdBy);
    createTranslationIfNotExists(
        "rag.chat.hint", languageCode, "Shift + Enter: Line Break | Enter: Send", createdBy);
    createTranslationIfNotExists(
        "rag.chat.deleteThreadConfirm",
        languageCode,
        "Are you sure you want to delete this thread? All conversation history will be deleted.",
        createdBy);
    createTranslationIfNotExists("rag.chat.threadTitleLabel", languageCode, "Title", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadDescriptionLabel", languageCode, "Description (Optional)", createdBy);
    createTranslationIfNotExists("rag.chat.threadCreateAction", languageCode, "Create", createdBy);
    createTranslationIfNotExists("rag.chat.editResponse", languageCode, "Edit Response", createdBy);
    createTranslationIfNotExists(
        "rag.chat.editPlaceholder", languageCode, "Enter the revised response content.", createdBy);
    createTranslationIfNotExists(
        "rag.chat.deleteMessageTitle", languageCode, "Delete Response", createdBy);
    createTranslationIfNotExists(
        "rag.chat.deleteMessageConfirm",
        languageCode,
        "Are you sure you want to delete this response? This action cannot be undone.",
        createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadTitleRequired", languageCode, "Please enter a thread title.", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadCreateFailed", languageCode, "Failed to create thread.", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadDeleteFailed", languageCode, "Failed to delete thread.", createdBy);
    createTranslationIfNotExists(
        "rag.chat.editFailed", languageCode, "Failed to edit message.", createdBy);
    createTranslationIfNotExists(
        "rag.chat.messageDeleteFailed", languageCode, "Failed to delete message.", createdBy);

    // RAG Thread Manager Dialog Translations
    createTranslationIfNotExists(
        "rag.chat.manageThreads", languageCode, "Manage Conversation Threads", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadListLabel", languageCode, "Thread List", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadEmpty", languageCode, "No saved threads.", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadDetailsLabel", languageCode, "Thread Details", createdBy);
    createTranslationIfNotExists("rag.chat.refresh", languageCode, "Refresh", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadNotFound", languageCode, "Cannot find the selected thread.", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadLoadError", languageCode, "Failed to load thread.", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadUpdateError", languageCode, "Failed to update thread.", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadDeleteError", languageCode, "Failed to delete thread.", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadArchivedLabel", languageCode, "Archive", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadMessagesLabel", languageCode, "Conversation History", createdBy);
    createTranslationIfNotExists(
        "rag.chat.threadMessagesEmpty",
        languageCode,
        "No messages in this conversation.",
        createdBy);
    createTranslationIfNotExists("rag.chat.roleAssistant", languageCode, "Assistant", createdBy);
    createTranslationIfNotExists("rag.chat.roleUser", languageCode, "User", createdBy);
    createTranslationIfNotExists("rag.chat.threadDeleteAction", languageCode, "Delete", createdBy);
    createTranslationIfNotExists("rag.chat.threadSaveAction", languageCode, "Save", createdBy);

    // LLM configuration check related translations
    createTranslationIfNotExists(
        "rag.chat.llmNotConfigured", languageCode, "Default LLM Configuration Required", createdBy);
    createTranslationIfNotExists(
        "rag.chat.llmNotConfiguredMessage",
        languageCode,
        "To use AI Q&A, an administrator must set an LLM (Language Model) as the default. Please"
            + " contact your administrator.",
        createdBy);
    createTranslationIfNotExists("rag.chat.recheckLlm", languageCode, "Recheck", createdBy);
    createTranslationIfNotExists(
        "rag.chat.checkingLlm", languageCode, "Checking LLM configuration...", createdBy);
    createTranslationIfNotExists(
        "rag.chat.generatingAnswer", languageCode, "AI is generating an answer...", createdBy);

    // Document Chunks translations
    createTranslationIfNotExists(
        "rag.chunks.dialog.title", languageCode, "View Document Chunks", createdBy);
    createTranslationIfNotExists("rag.chunks.showMore", languageCode, "Show More", createdBy);
    createTranslationIfNotExists("rag.chunks.showLess", languageCode, "Show Less", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.summaryLoadFailed", languageCode, "Failed to load LLM summary.", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.empty",
        languageCode,
        "No chunks available. Please analyze the document first.",
        createdBy);
    createTranslationIfNotExists(
        "rag.chunks.filteredMode", languageCode, "Showing only AI-referenced chunks", createdBy);
    createTranslationIfNotExists("rag.chunks.loaded", languageCode, "Loaded", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.scrollForMore", languageCode, "Scroll for more", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.viewLlmSummary", languageCode, "View LLM Analysis Summary", createdBy);
    createTranslationIfNotExists("rag.chunks.metadata", languageCode, "Metadata", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.loadingMore", languageCode, "Loading more chunks...", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.allLoaded", languageCode, "All chunks loaded", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.viewCombinedSummary", languageCode, "View LLM Analysis Summary", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.documentSummaryTitle", languageCode, "LLM Analysis Summary", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.noLlmSummary",
        languageCode,
        "No LLM analysis summary available yet.",
        createdBy);
    createTranslationIfNotExists(
        "rag.chunks.loadingLlmSummary", languageCode, "Loading LLM analysis summary...", createdBy);
    createTranslationIfNotExists("rag.chunks.chunkLabel", languageCode, "Chunk", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.llmSummaryTitle", languageCode, "LLM Analysis Summary", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.originalText", languageCode, "Original Text", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.llmAnalysis", languageCode, "LLM Analysis Result", createdBy);
    createTranslationIfNotExists(
        "rag.chunks.summaryNotReady", languageCode, "Summary is not available yet.", createdBy);
    createTranslationIfNotExists("rag.preview.loading", languageCode, "Loading PDF...", createdBy);

    // Document Analysis translations
    createTranslationIfNotExists(
        "rag.analysis.llmConfig", languageCode, "LLM Configuration", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.noActiveConfigs",
        languageCode,
        "No active LLM configurations. Please add and activate a configuration in the LLM settings"
            + " page.",
        createdBy);
    createTranslationIfNotExists(
        "rag.analysis.defaultOnlyInfo",
        languageCode,
        "Only the default LLM configuration can be used for your role.",
        createdBy);
    createTranslationIfNotExists(
        "rag.analysis.selectConfig", languageCode, "Select LLM Configuration", createdBy);
    createTranslationIfNotExists("rag.analysis.defaultBadge", languageCode, "[Default]", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.selectedConfigInfo", languageCode, "Selected Configuration Info", createdBy);
    createTranslationIfNotExists("rag.analysis.provider", languageCode, "Provider:", createdBy);
    createTranslationIfNotExists("rag.analysis.model", languageCode, "Model:", createdBy);
    createTranslationIfNotExists("rag.analysis.apiUrl", languageCode, "API URL:", createdBy);
    createTranslationIfNotExists("rag.analysis.defaultValue", languageCode, "Default", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.apiKey", languageCode, "API Key (Optional)", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.apiKeyHelper",
        languageCode,
        "Leave blank to use the API key saved in the selected LLM configuration",
        createdBy);
    createTranslationIfNotExists(
        "rag.analysis.promptTemplate", languageCode, "Prompt Template", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.promptTemplateHelper",
        languageCode,
        "Use {chunk_text} placeholder",
        createdBy);
    createTranslationIfNotExists("rag.analysis.maxTokens", languageCode, "Max Tokens", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.temperature", languageCode, "Temperature", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.batchSize", languageCode, "Batch Size (Chunks)", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.batchSizeHelper",
        languageCode,
        "Number of chunks to process at once",
        createdBy);
    createTranslationIfNotExists(
        "rag.analysis.pauseAfterBatch", languageCode, "Pause After Each Batch", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.pauseAfterBatchTooltip",
        languageCode,
        "Pause after each batch and wait for user confirmation",
        createdBy);
    createTranslationIfNotExists(
        "rag.analysis.continueTooltip",
        languageCode,
        "Continue analyzing all chunks without interruption",
        createdBy);
    createTranslationIfNotExists("rag.analysis.progress", languageCode, "Progress", createdBy);
    createTranslationIfNotExists("rag.analysis.processing", languageCode, "Processing:", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.chunkNumber", languageCode, "Chunk #{number}", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.completed", languageCode, "Completed: {count}", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.total", languageCode, "/ Total {count} Chunks", createdBy);
    createTranslationIfNotExists("rag.analysis.cost", languageCode, "Cost:", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.results", languageCode, "Analysis Results", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.originalText", languageCode, "Original Text", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.llmResponse", languageCode, "LLM Response", createdBy);
    createTranslationIfNotExists("rag.analysis.tokens", languageCode, "Tokens", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.estimateCost", languageCode, "Estimate Cost", createdBy);
    createTranslationIfNotExists("rag.analysis.stop", languageCode, "Stop", createdBy);
    createTranslationIfNotExists("rag.analysis.resume", languageCode, "Resume", createdBy);
    createTranslationIfNotExists("rag.analysis.pause", languageCode, "Pause", createdBy);

    // Cost warning dialog
    createTranslationIfNotExists(
        "rag.analysis.costWarning.title", languageCode, "Estimated LLM Analysis Cost", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.highCostAlert",
        languageCode,
        "This operation may incur significant costs. Do you want to continue?",
        createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.modelSection", languageCode, "LLM Model", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.targetSection", languageCode, "Analysis Target", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.chunkCount", languageCode, "Total {count} Chunks", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.tokenUsageSection",
        languageCode,
        "Estimated Token Usage",
        createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.inputTokens", languageCode, "Input Tokens", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.outputTokens", languageCode, "Output Tokens", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.totalTokens", languageCode, "Total Tokens", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.costSection", languageCode, "Estimated Cost (USD)", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.inputCost", languageCode, "Input Cost", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.outputCost", languageCode, "Output Cost", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.totalCost", languageCode, "Total Estimated Cost", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.costPerChunk",
        languageCode,
        "(Approximately ${cost} per chunk)",
        createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.priceSection",
        languageCode,
        "Model Pricing (per 1K tokens)",
        createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.priceInput", languageCode, "Input", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.priceOutput", languageCode, "Output", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.confirm", languageCode, "Confirm & Start Analysis", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.costWarning.starting", languageCode, "Starting...", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.error.costEstimate", languageCode, "Failed to estimate cost.", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.error.statusCheck",
        languageCode,
        "Failed to check analysis status.",
        createdBy);
    createTranslationIfNotExists(
        "rag.analysis.error.startAnalysis",
        languageCode,
        "Failed to start LLM analysis.",
        createdBy);
    createTranslationIfNotExists(
        "rag.analysis.error.resume", languageCode, "Failed to resume analysis.", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.error.restart", languageCode, "Failed to restart analysis.", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.error.pause", languageCode, "Failed to pause analysis.", createdBy);
    createTranslationIfNotExists(
        "rag.analysis.error.cancel", languageCode, "Failed to cancel analysis.", createdBy);

    createTranslationIfNotExists(
        "attachment.success.upload", languageCode, "File uploaded successfully.", createdBy);
    createTranslationIfNotExists(
        "attachment.success.delete", languageCode, "Attachment deleted successfully.", createdBy);
    createTranslationIfNotExists(
        "attachment.error.auth.failed", languageCode, "User authentication failed.", createdBy);
    createTranslationIfNotExists(
        "attachment.error.upload.io",
        languageCode,
        "An error occurred while saving the file.",
        createdBy);
    createTranslationIfNotExists(
        "attachment.error.upload.general", languageCode, "A server error occurred.", createdBy);
    createTranslationIfNotExists(
        "attachment.error.list.failed",
        languageCode,
        "An error occurred while retrieving the attachment list.",
        createdBy);
    createTranslationIfNotExists(
        "attachment.error.notfound", languageCode, "Attachment not found.", createdBy);
    createTranslationIfNotExists(
        "attachment.error.info.failed",
        languageCode,
        "An error occurred while retrieving attachment information.",
        createdBy);
    createTranslationIfNotExists(
        "attachment.error.delete.failed",
        languageCode,
        "An error occurred while deleting the attachment.",
        createdBy);
    createTranslationIfNotExists(
        "attachment.error.storage.failed",
        languageCode,
        "An error occurred while retrieving storage information.",
        createdBy);

    // Additional translations for RAG document list
    createTranslationIfNotExists(
        "rag.document.list.llmSummaryStatus", languageCode, "LLM Summary Status", createdBy);
    createTranslationIfNotExists(
        "rag.document.list.summaryProgress", languageCode, "Summary Progress", createdBy);
    createTranslationIfNotExists(
        "rag.document.list.analyzedChunks", languageCode, "Analyzed Chunks", createdBy);
    createTranslationIfNotExists("rag.document.list.parser", languageCode, "Parser", createdBy);
    createTranslationIfNotExists(
        "rag.document.list.embeddingStatus", languageCode, "Embedding", createdBy);
    createTranslationIfNotExists(
        "rag.document.embedding.pending", languageCode, "Pending", createdBy);
    createTranslationIfNotExists(
        "rag.document.embedding.generating", languageCode, "Generating", createdBy);
    createTranslationIfNotExists(
        "rag.document.embedding.completed", languageCode, "Completed", createdBy);
    createTranslationIfNotExists(
        "rag.document.embedding.failed", languageCode, "Failed", createdBy);
    createTranslationIfNotExists(
        "rag.llmAnalysis.status.notStartedMessage",
        languageCode,
        "LLM analysis has not been started yet. Please start LLM analysis from the document list.",
        createdBy);
    createTranslationIfNotExists(
        "rag.llmAnalysis.status.errorMessage",
        languageCode,
        "An error occurred during analysis.",
        createdBy);
    createTranslationIfNotExists(
        "rag.llmAnalysis.status.processingPausedMessage",
        languageCode,
        "LLM analysis is in progress. You can view the results of {analyzedChunks} analyzed chunks"
            + " so far.",
        createdBy);

    // Document List - Additional Translations (2024 additions)
    createTranslationIfNotExists(
        "rag.document.summary.title",
        languageCode,
        "LLM Analysis Summary - {documentName}",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.summary.fetchFailed",
        languageCode,
        "Failed to fetch analysis results.",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.summary.noData", languageCode, "No results to display.", createdBy);
    createTranslationIfNotExists(
        "rag.document.list.refreshButton", languageCode, "Refresh", createdBy);
    createTranslationIfNotExists(
        "rag.document.summary.totalChunksLabel",
        languageCode,
        "{count} chunks in total",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.summary.analyzedChunksLabel", languageCode, "Analyzed: {count}", createdBy);
    createTranslationIfNotExists(
        "rag.document.summary.progressLabel", languageCode, "Progress: {progress}%", createdBy);
    createTranslationIfNotExists(
        "rag.document.summary.resultsSummary",
        languageCode,
        "LLM Analysis Results Summary",
        createdBy);

    // Job History Related English Translations
    createTranslationIfNotExists(
        "rag.document.jobHistory.title", languageCode, "Job History - {fileName}", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.jobId", languageCode, "Job ID", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.llmProvider", languageCode, "LLM Provider", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.llmModel", languageCode, "LLM Model", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.status", languageCode, "Status", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.progress", languageCode, "Progress", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.chunks", languageCode, "Chunks", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.cost", languageCode, "Cost (USD)", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.tokens", languageCode, "Tokens", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.startTime", languageCode, "Start Time", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.completedTime", languageCode, "Completed Time", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.pausedTime", languageCode, "Paused Time", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.errorMessage", languageCode, "Error Message", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.hasError", languageCode, "Error Exists", createdBy);
    createTranslationIfNotExists(
        "rag.document.jobHistory.empty",
        languageCode,
        "No job history available for this document.",
        createdBy);

    // Alert Message Related English Translations
    createTranslationIfNotExists(
        "rag.document.alert.pauseUnavailable",
        languageCode,
        "Only jobs in progress can be paused.",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.alert.resumeUnavailable",
        languageCode,
        "Only paused jobs can be resumed.",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.alert.statusLoading",
        languageCode,
        "Loading job status. Please try again in a moment.",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.alert.alreadyProcessing",
        languageCode,
        "Analysis is already in progress.",
        createdBy);
    createTranslationIfNotExists(
        "rag.document.alert.alreadyProcessingWithProgress",
        languageCode,
        "Analysis is already in progress. (Progress: {progress})",
        createdBy);

    // Error Message Related English Translations

    // Confirm Dialog Related English Translations

    // LLM Configuration Management English Translations
    createTranslationIfNotExists("common.create", languageCode, "Create", createdBy);
    createTranslationIfNotExists("common.edit", languageCode, "Edit", createdBy);
    createTranslationIfNotExists("common.delete", languageCode, "Delete", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.title", languageCode, "LLM Configuration Management", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.addConfig", languageCode, "Add LLM Configuration", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.editConfig", languageCode, "Edit LLM Configuration", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.createConfig", languageCode, "Create LLM Configuration", createdBy);
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
    createTranslationIfNotExists(
        "admin.llmConfig.deactivate", languageCode, "Deactivate", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.testConnection", languageCode, "Test Connection", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.setAsDefault", languageCode, "Set as Default", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.noConfigs", languageCode, "No LLM configurations available", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.message.allFieldsRequired",
        languageCode,
        "Please fill in all required fields",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.message.connectionSuccess",
        languageCode,
        "Connection test successful!",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.message.connectionFailed",
        languageCode,
        "Connection test failed",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.message.invalidJson",
        languageCode,
        "Template is not valid JSON format",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.message.confirmDelete",
        languageCode,
        "Are you sure you want to delete this LLM configuration?",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.message.deleted",
        languageCode,
        "LLM configuration has been deleted",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.message.updated",
        languageCode,
        "LLM configuration has been updated",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.message.created",
        languageCode,
        "LLM configuration has been created",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.message.defaultChanged",
        languageCode,
        "Default LLM configuration has been changed",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.message.activeChanged",
        languageCode,
        "LLM configuration active status has been changed",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.tab.configList", languageCode, "LLM Configuration List", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.tab.template", languageCode, "Default Template", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.template.title",
        languageCode,
        "📋 Test Case Generation Default Template",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.template.description1",
        languageCode,
        "This template is automatically set when creating a new LLM configuration and is used as a"
            + " reference format when requesting AI to generate test cases.",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.template.description2",
        languageCode,
        "You can modify this template for each LLM configuration.",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.template.label", languageCode, "Default Template JSON:", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.template.download", languageCode, "Download", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.template.reset", languageCode, "Reset", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.template.downloadJson", languageCode, "Download JSON", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.template.usageTitle", languageCode, "How to Use:", createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.template.usage1",
        languageCode,
        "1. This template is automatically applied when creating new LLM configurations.",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.template.usage2",
        languageCode,
        "2. You can modify this template individually for each LLM configuration.",
        createdBy);
    createTranslationIfNotExists(
        "admin.llmConfig.template.usage3",
        languageCode,
        "3. When requesting \"test case\" in RAG chat, this template is automatically referenced.",
        createdBy);

    // Global Document Registration Requests
    createTranslationIfNotExists(
        "admin.globalDoc.requests.title",
        languageCode,
        "📨 Global Document Registration Requests",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.empty", languageCode, "No pending requests.", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.requestedBy", languageCode, "Requested By", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.message", languageCode, "Request Message", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.requestedAt", languageCode, "Requested At", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.approve", languageCode, "Approve", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.reject", languageCode, "Reject", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.title", languageCode, "🌐 Global RAG Document Management", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.description",
        languageCode,
        "Manage the global knowledge base automatically referenced by all projects. (Admin only)",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.uploadFile", languageCode, "Upload File", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.noDocuments",
        languageCode,
        "No global documents yet. Upload your first document!",
        createdBy);

    // Global Document Information Section
    createTranslationIfNotExists(
        "admin.globalDoc.info.whatIsTitle",
        languageCode,
        "📚 What are Global Documents?",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.info.whatIsDescription",
        languageCode,
        "A global knowledge base automatically referenced by all projects. Managed with a special"
            + " project ID ({0}).",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.info.examplesTitle", languageCode, "💡 Use Cases:", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.info.example1",
        languageCode,
        "Company-wide coding conventions and development guidelines",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.info.example2",
        languageCode,
        "Testing standards and quality management documents",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.info.example3",
        languageCode,
        "Common project reference documents (API specs, architecture guides, etc.)",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.info.example4",
        languageCode,
        "Organization-wide best practices and learning materials",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.info.techSpecsTitle",
        languageCode,
        "⚙️ Technical Specifications:",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.info.supportedFormats",
        languageCode,
        "Supported formats: PDF, DOCX, DOC, TXT (max 50MB)",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.info.autoSearch",
        languageCode,
        "Automatically searched in all project RAG Q&A",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.info.adminOnly",
        languageCode,
        "Upload/delete available to admins only (ADMIN permission required)",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.uploadSuccess",
        languageCode,
        "Global document \"{0}\" has been uploaded",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.uploadFailed",
        languageCode,
        "Failed to upload global document",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.deleteSuccess",
        languageCode,
        "Global document \"{0}\" has been deleted",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.deleteFailed",
        languageCode,
        "Failed to delete global document",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.confirmDelete",
        languageCode,
        "Are you sure you want to delete the global document \"{0}\"?",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.confirmAnalyze",
        languageCode,
        "Are you sure you want to analyze the document \"{0}\"?",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.confirmEmbeddings",
        languageCode,
        "Are you sure you want to generate embeddings for the document \"{0}\"?",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.analyzeStarted",
        languageCode,
        "Document \"{0}\" analysis started",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.analyzeFailed",
        languageCode,
        "Failed to start analysis",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.embeddingsStarted",
        languageCode,
        "Document \"{0}\" embedding generation started",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.embeddingsFailed",
        languageCode,
        "Failed to generate embeddings",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.downloadSuccess",
        languageCode,
        "Document \"{0}\" download completed",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.downloadFailed", languageCode, "Download failed", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.supportedFormats",
        languageCode,
        "Supported file formats: PDF, DOCX, DOC, TXT",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.fileSizeLimit",
        languageCode,
        "File size cannot exceed 50MB",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.message.unknownError", languageCode, "Unknown error", createdBy);

    // Scheduler Management English Translations
    createTranslationIfNotExists(
        "scheduler.title", languageCode, "Scheduler Management", createdBy);
    createTranslationIfNotExists(
        "scheduler.description",
        languageCode,
        "Dynamically manage execution times for background tasks. Changes to cron expressions are"
            + " applied immediately without server restart.",
        createdBy);
    createTranslationIfNotExists(
        "scheduler.currentTime", languageCode, "Current Time ({timezone})", createdBy);
    createTranslationIfNotExists("scheduler.refresh", languageCode, "Refresh", createdBy);
    createTranslationIfNotExists(
        "scheduler.status.changed", languageCode, "Schedule status has been changed.", createdBy);
    createTranslationIfNotExists(
        "scheduler.task.executed", languageCode, "Task has been executed.", createdBy);
    createTranslationIfNotExists(
        "scheduler.confirm.execute",
        languageCode,
        "Execute \"{taskName}\" task immediately?",
        createdBy);

    // Data Grid Columns
    createTranslationIfNotExists("scheduler.column.taskName", languageCode, "Task Name", createdBy);
    createTranslationIfNotExists(
        "scheduler.column.scheduleExpression", languageCode, "Schedule Expression", createdBy);
    createTranslationIfNotExists("scheduler.column.type", languageCode, "Type", createdBy);
    createTranslationIfNotExists(
        "scheduler.column.nextExecution", languageCode, "Next Execution", createdBy);
    createTranslationIfNotExists(
        "scheduler.column.lastExecution", languageCode, "Last Execution", createdBy);
    createTranslationIfNotExists("scheduler.column.status", languageCode, "Status", createdBy);
    createTranslationIfNotExists("scheduler.column.enabled", languageCode, "Enabled", createdBy);
    createTranslationIfNotExists("scheduler.column.actions", languageCode, "Actions", createdBy);

    // Schedule Types & Units
    createTranslationIfNotExists("scheduler.time.seconds", languageCode, "{seconds}s", createdBy);
    createTranslationIfNotExists("scheduler.time.minutes", languageCode, "{minutes}m", createdBy);
    createTranslationIfNotExists("scheduler.time.hours", languageCode, "{hours}h", createdBy);
    createTranslationIfNotExists("scheduler.time.days", languageCode, "{days}d", createdBy);

    // Buttons & Tooltips
    createTranslationIfNotExists("scheduler.tooltip.edit", languageCode, "Edit", createdBy);
    createTranslationIfNotExists(
        "scheduler.tooltip.execute", languageCode, "Execute Now", createdBy);

    // Schedule Config Dialog
    createTranslationIfNotExists(
        "scheduler.dialog.title", languageCode, "Edit Schedule Configuration", createdBy);
    createTranslationIfNotExists("scheduler.dialog.taskKey", languageCode, "Task Key:", createdBy);
    createTranslationIfNotExists(
        "scheduler.dialog.scheduleType", languageCode, "Schedule Type:", createdBy);
    createTranslationIfNotExists(
        "scheduler.dialog.description", languageCode, "Description:", createdBy);
    createTranslationIfNotExists(
        "scheduler.dialog.cronExpression", languageCode, "Cron Expression", createdBy);
    createTranslationIfNotExists(
        "scheduler.dialog.cronHelper",
        languageCode,
        "Format: sec min hour day month dow (e.g., 0 0 1 * * *)",
        createdBy);
    createTranslationIfNotExists(
        "scheduler.dialog.cronExamples", languageCode, "Cron Expression Examples", createdBy);
    createTranslationIfNotExists(
        "scheduler.dialog.fixedRate", languageCode, "Fixed Rate (milliseconds)", createdBy);
    createTranslationIfNotExists(
        "scheduler.dialog.fixedDelay", languageCode, "Fixed Delay (milliseconds)", createdBy);
    createTranslationIfNotExists(
        "scheduler.dialog.currentValue", languageCode, "Current value: {value}", createdBy);
    createTranslationIfNotExists("scheduler.dialog.enabled", languageCode, "Enabled", createdBy);
    createTranslationIfNotExists(
        "scheduler.dialog.nextExecution",
        languageCode,
        "Next execution scheduled: {time}",
        createdBy);
    createTranslationIfNotExists("scheduler.dialog.cancel", languageCode, "Cancel", createdBy);
    createTranslationIfNotExists("scheduler.dialog.save", languageCode, "Save", createdBy);
    createTranslationIfNotExists(
        "scheduler.dialog.updated",
        languageCode,
        "Schedule configuration has been updated.",
        createdBy);

    // Cron Examples
    createTranslationIfNotExists(
        "scheduler.cron.every5min", languageCode, "Every 5 minutes", createdBy);
    createTranslationIfNotExists(
        "scheduler.cron.everyHour", languageCode, "Every hour on the hour", createdBy);
    createTranslationIfNotExists(
        "scheduler.cron.midnight", languageCode, "Every day at midnight", createdBy);
    createTranslationIfNotExists(
        "scheduler.cron.daily1am", languageCode, "Every day at 1 AM", createdBy);
    createTranslationIfNotExists(
        "scheduler.cron.weekdays9am", languageCode, "Every weekday at 9 AM", createdBy);
    createTranslationIfNotExists(
        "scheduler.cron.monday9am", languageCode, "Every Monday at 9 AM", createdBy);

    // Error Messages
    createTranslationIfNotExists(
        "scheduler.error.cronRequired", languageCode, "Please enter a cron expression", createdBy);
    createTranslationIfNotExists(
        "scheduler.error.cronFormat",
        languageCode,
        "Cron expression must have 6 fields (sec min hour day month dow)",
        createdBy);
    createTranslationIfNotExists(
        "scheduler.error.fixedRatePositive",
        languageCode,
        "Fixed Rate value must be greater than 0",
        createdBy);
    createTranslationIfNotExists(
        "scheduler.error.fixedDelayPositive",
        languageCode,
        "Fixed Delay value must be greater than 0",
        createdBy);
    createTranslationIfNotExists(
        "scheduler.error.updateFailed",
        languageCode,
        "Failed to update schedule configuration.",
        createdBy);

    // Scheduler List

    // Exploratory Session
    createTranslationIfNotExists(
        "projectHeader.tabs.exploratorySessions", languageCode, "Exploratory Sessions", createdBy);
    createTranslationIfNotExists(
        "exploratory.workspace.title", languageCode, "Exploratory Session Workspace", createdBy);
    createTranslationIfNotExists(
        "exploratory.workspace.badgeDraft", languageCode, "UI Draft", createdBy);
    createTranslationIfNotExists(
        "exploratory.view.charterManagement", languageCode, "Charter Management", createdBy);
    createTranslationIfNotExists(
        "exploratory.view.sessionList", languageCode, "Session List", createdBy);
    createTranslationIfNotExists(
        "exploratory.view.sessionEditor", languageCode, "Session Editor", createdBy);
    createTranslationIfNotExists(
        "exploratory.view.debriefApproval", languageCode, "Debrief/Approval", createdBy);
    createTranslationIfNotExists(
        "exploratory.view.sessionDetail", languageCode, "Session Detail", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.filter.status", languageCode, "Status Filter", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.create", languageCode, "Create Charter", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.dialog.createTitle", languageCode, "Create Charter", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.dialog.editTitle", languageCode, "Edit Charter", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.dialog.name", languageCode, "Charter Name", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.dialog.mission", languageCode, "Mission", createdBy);
    createTranslationIfNotExists(
        "exploratory.charter.dialog.status", languageCode, "Status", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.filter.tester", languageCode, "Tester", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.filter.linkedCharter", languageCode, "Linked Charter", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.filter.periodFrom", languageCode, "Period From", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.filter.periodTo", languageCode, "Period To", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.timer.start", languageCode, "Start", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.timer.pause", languageCode, "Pause", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.timer.resume", languageCode, "Resume", createdBy);
    createTranslationIfNotExists("exploratory.editor.timer.end", languageCode, "End", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.field.environment", languageCode, "Environment", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.field.version", languageCode, "Version", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.field.netDuration", languageCode, "Target Duration (min)", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.charterSection.autoMission",
        languageCode,
        "Auto-bound Mission",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.notes.title", languageCode, "Test Notes", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.issue.title", languageCode, "Bugs/Issues", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.artifact.title", languageCode, "Data/Artifacts", createdBy);
    createTranslationIfNotExists(
        "exploratory.editor.artifact.upload", languageCode, "Upload Evidence", createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.report.title", languageCode, "Debrief Report", createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.leadComment", languageCode, "Lead Comment", createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.action.approve", languageCode, "Approve", createdBy);
    createTranslationIfNotExists(
        "exploratory.debrief.action.requestChanges", languageCode, "Request Changes", createdBy);

    createTranslationIfNotExists(
        "admin.globalDoc.requests.title", languageCode, "📨 Global Document Requests", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.empty", languageCode, "No pending requests.", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.requestedBy", languageCode, "Requester", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.message", languageCode, "Message", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.requestedAt", languageCode, "Requested At", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.approve", languageCode, "Approve", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.reject", languageCode, "Reject", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.approveNote",
        languageCode,
        "Approval note (optional)",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.approved", languageCode, "Request approved.", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.approveFailed",
        languageCode,
        "Failed to approve the request.",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.rejectNote",
        languageCode,
        "Rejection reason (optional)",
        createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.rejected", languageCode, "Request rejected.", createdBy);
    createTranslationIfNotExists(
        "admin.globalDoc.requests.rejectFailed",
        languageCode,
        "Failed to reject the request.",
        createdBy);

    createTranslationIfNotExists(
        "exploratory.session.confirmDelete",
        languageCode,
        "Are you sure you want to delete this session?",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.session.saveSuccess",
        languageCode,
        "Session has been saved successfully.",
        createdBy);
    createTranslationIfNotExists(
        "exploratory.session.error.charterRequired",
        languageCode,
        "Please select an assigned test charter.",
        createdBy);

    // Session Status Translations
    createTranslationIfNotExists(
        "exploratory.session.status.draft", languageCode, "Draft", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.status.running", languageCode, "Running", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.status.paused", languageCode, "Paused", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.status.completed", languageCode, "Completed", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.status.submitted", languageCode, "Submitted", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.status.approved", languageCode, "Approved", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.status.archived", languageCode, "Archived", createdBy);
    createTranslationIfNotExists(
        "exploratory.session.status.needsUpdate", languageCode, "Needs Update", createdBy);

    // Google Sheets Integration
    createTranslationIfNotExists(
        "google.config.status", languageCode, "Integration Status", createdBy);
    createTranslationIfNotExists("google.config.disconnect", languageCode, "Disconnect", createdBy);
    createTranslationIfNotExists(
        "google.config.email", languageCode, "Connected Service Account (Email)", createdBy);
    createTranslationIfNotExists("google.config.projectId", languageCode, "Project ID", createdBy);
    createTranslationIfNotExists(
        "google.config.lastUpdated", languageCode, "Last Updated", createdBy);
    createTranslationIfNotExists("google.config.active", languageCode, "Active", createdBy);
    createTranslationIfNotExists(
        "google.config.inputDesc",
        languageCode,
        "Paste the entire contents of the service account key (JSON) file downloaded from Google"
            + " Cloud Console below.",
        createdBy);
    createTranslationIfNotExists(
        "google.config.placeholder",
        languageCode,
        "{ \"type\": \"service_account\", ... }",
        createdBy);
    createTranslationIfNotExists(
        "google.config.save", languageCode, "Save Integration Settings", createdBy);
    createTranslationIfNotExists(
        "google.config.update", languageCode, "Update Settings", createdBy);
    createTranslationIfNotExists(
        "google.config.fetchError",
        languageCode,
        "An error occurred while loading Google settings.",
        createdBy);
    createTranslationIfNotExists(
        "google.config.saveError",
        languageCode,
        "An error occurred while saving settings. Please check the format.",
        createdBy);
    createTranslationIfNotExists(
        "google.config.error.jsonRequired",
        languageCode,
        "Please enter the JSON key content.",
        createdBy);
    createTranslationIfNotExists(
        "google.config.success.save",
        languageCode,
        "Google Sheets settings have been successfully saved.",
        createdBy);
    createTranslationIfNotExists(
        "google.config.confirm.delete",
        languageCode,
        "Are you sure you want to completely delete the Google integration settings? Access to"
            + " related functions may be restricted.",
        createdBy);
    createTranslationIfNotExists(
        "google.config.success.delete",
        languageCode,
        "Google integration has been disconnected.",
        createdBy);
    createTranslationIfNotExists(
        "google.config.error.deleteFailed",
        languageCode,
        "An error occurred while disconnecting the integration.",
        createdBy);
    createTranslationIfNotExists(
        "google.config.noConfigDesc",
        languageCode,
        "To use the test case export function, please enter the Google service account key content"
            + " below.",
        createdBy);
    createTranslationIfNotExists(
        "google.config.form.updateTitle", languageCode, "Update Authentication Info", createdBy);
    createTranslationIfNotExists(
        "google.config.form.registerTitle",
        languageCode,
        "Register New Authentication Info",
        createdBy);
    createTranslationIfNotExists(
        "google.config.button.saving", languageCode, "Saving...", createdBy);
    createTranslationIfNotExists(
        "google.config.guide.openButton",
        languageCode,
        "View Detailed Guide in New Window",
        createdBy);

    // Google Import/Export Warnings
    createTranslationIfNotExists(
        "google.import.connection_required",
        languageCode,
        "Google Sheets integration is required. Please register your service account JSON key"
            + " first.",
        createdBy);
    createTranslationIfNotExists(
        "google.export.connection_required",
        languageCode,
        "Google Sheets integration is required. Please register your service account JSON key"
            + " first.",
        createdBy);

    // Google Guide
    createTranslationIfNotExists(
        "google.guide.title",
        languageCode,
        "How to Create and Configure Google Service Account",
        createdBy);
    createTranslationIfNotExists(
        "google.guide.step1",
        languageCode,
        "1. Create a project in Google Cloud Console and enable 'Google Sheets API'.",
        createdBy);
    createTranslationIfNotExists(
        "google.guide.step2",
        languageCode,
        "2. Create a 'Service Account' and issue/download a JSON key.",
        createdBy);
    createTranslationIfNotExists(
        "google.guide.step3",
        languageCode,
        "3. Copy the contents of the downloaded JSON file and paste it into the input field above.",
        createdBy);
    createTranslationIfNotExists(
        "google.guide.step4",
        languageCode,
        "4. (Important) Click the 'Share' button in the target Google Sheet file.",
        createdBy);
    createTranslationIfNotExists(
        "google.guide.step5",
        languageCode,
        "5. Add the Service Account email address as an 'Editor'.",
        createdBy);

    // Guide Viewer Translations
    createTranslationIfNotExists("guide.viewer.title", languageCode, "Guide", createdBy);
    createTranslationIfNotExists(
        "guide.viewer.loading", languageCode, "Loading guide...", createdBy);
    createTranslationIfNotExists(
        "guide.viewer.error",
        languageCode,
        "The requested guide document could not be found or an error occurred while loading.",
        createdBy);
    createTranslationIfNotExists("guide.viewer.retry", languageCode, "Retry", createdBy);
    createTranslationIfNotExists("guide.viewer.print", languageCode, "Print", createdBy);
    createTranslationIfNotExists("guide.viewer.close", languageCode, "Close", createdBy);
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
          log.debug("Translation created: {} - {}", keyName, languageCode);
        } else {
          Translation existingTranslation = existingTranslationOpt.get();
          if (!existingTranslation.getValue().equals(value)) {
            existingTranslation.setValue(value);
            existingTranslation.setUpdatedBy(createdBy);
            translationRepository.save(existingTranslation);
            log.debug("Translation updated: {} - {}", keyName, languageCode);
          } else {
            log.debug("Translation exists and is identical: {} - {}", keyName, languageCode);
          }
        }
      }
    } else {
      log.warn("Translation key not found: {}", keyName);
    }
  }
}
