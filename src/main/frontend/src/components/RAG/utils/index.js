// src/components/RAG/utils/index.js

/**
 * 통합 export 파일
 * 모든 유틸리티 함수를 한 곳에서 import할 수 있도록 re-export
 */

// Message utilities
export {
    createMessageId,
    ensureUniqueMessageIds,
    buildConversationHistory,
    mapPersistedMessages,
} from './messageUtils.js';

// Format utilities
export {
    formatFileSize,
    formatDate,
    formatRelativeTime,
} from './formatUtils.js';

// Keyword utilities
export {
    FILE_LIST_KEYWORDS,
    TEST_CASE_KEYWORDS,
    isFileListRequest,
    isTestCaseRequest,
    isTestCaseDocument as isTestCaseDocumentByKeyword,
    filterNonTestCaseDocuments,
} from './keywordUtils.js';

// Document utilities (for chat)
export {
    formatDocumentInfo,
    formatDocumentListMessage,
    isValidDocument,
    sortDocumentsBySize,
    sortDocumentsByDate,
} from './documentUtils.js';

// Document format utilities (for DocumentList)
export {
    formatDateArray,
    formatProgressSummary,
    getProgressColor,
} from './documentFormatUtils.js';

// LLM analysis utilities
export {
    buildSummaryMarkdown,
    calculateProgress,
    getSummaryMarkdownStyles,
} from './llmAnalysisUtils.js';

// Document filter utilities
export {
    isTestCaseDocument,
    filterRegularDocuments,
    filterTestCaseDocuments,
} from './documentFilters.js';
