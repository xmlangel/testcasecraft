// src/context/RAGContext.jsx
/**
 * RAG Context - Refactored to use Custom Hooks
 * - All API calls now use AppContext.api() for centralized token management
 * - File reduced from 1680 lines to ~300 lines by extracting functions into hooks
 */
import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { useAppContext } from './AppContext.jsx';

// Import custom hooks
import { useRagDocuments } from '../hooks/rag/useRagDocuments.js';
import { useRagLlmAnalysis } from '../hooks/rag/useRagLlmAnalysis.js';
import { useRagChat } from '../hooks/rag/useRagChat.js';
import { useRagSearch } from '../hooks/rag/useRagSearch.js';
import { useRagGlobalDocs } from '../hooks/rag/useRagGlobalDocs.js';

const USE_DEMO_DATA = import.meta.env.VITE_USE_DEMO_DATA === 'true';
const RAG_DISABLED_BY_ENV = import.meta.env.VITE_ENABLE_RAG === 'false';
export const RAG_DISABLED_MESSAGE = RAG_DISABLED_BY_ENV
  ? '관리자 설정으로 RAG 기능이 비활성화되었습니다.'
  : USE_DEMO_DATA
    ? '데모 모드에서는 RAG 기능이 비활성화되어 있습니다. 서버 API 연결 후 이용해주세요.'
    : null;
const IS_RAG_ENABLED = !RAG_DISABLED_MESSAGE;
export const GLOBAL_RAG_PROJECT_ID = '00000000-0000-0000-0000-000000000000';

const RAGContext = createContext();

const initialState = {
  documents: [],
  activeDocument: null,
  searchResults: [],
  uploadingFiles: [],
  threads: [],
  categories: [],
  threadMessages: {},
  selectedThreadId: null,
  pagination: {
    total: 0,
    page: 1,
    pageSize: 20,
  },
  loading: false,
  threadLoading: false,
  persistConversation: true,
  error: RAG_DISABLED_MESSAGE,
  llmAvailable: null, // null: 미확인, true: 가용, false: 불가용
  llmCheckLoading: false,
  loadedProjectId: null, // 현재 로드된 프로젝트 ID (중복 호출 방지용)
};

const ActionTypes = {
  SET_DOCUMENTS: 'SET_DOCUMENTS',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',
  SET_ACTIVE_DOCUMENT: 'SET_ACTIVE_DOCUMENT',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_UPLOADING_FILES: 'SET_UPLOADING_FILES',
  ADD_UPLOADING_FILE: 'ADD_UPLOADING_FILE',
  REMOVE_UPLOADING_FILE: 'REMOVE_UPLOADING_FILE',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  SET_THREADS: 'SET_THREADS',
  UPSERT_THREAD: 'UPSERT_THREAD',
  REMOVE_THREAD: 'REMOVE_THREAD',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_THREAD_MESSAGES: 'SET_THREAD_MESSAGES',
  SET_SELECTED_THREAD: 'SET_SELECTED_THREAD',
  SET_THREAD_LOADING: 'SET_THREAD_LOADING',
  SET_PERSIST_CONVERSATION: 'SET_PERSIST_CONVERSATION',
  SET_LLM_AVAILABLE: 'SET_LLM_AVAILABLE',
  SET_LLM_CHECK_LOADING: 'SET_LLM_CHECK_LOADING',
  SET_LOADED_PROJECT_ID: 'SET_LOADED_PROJECT_ID',
};

function ragReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_DOCUMENTS:
      return { ...state, documents: action.payload };
    case ActionTypes.ADD_DOCUMENT:
      return { ...state, documents: [...state.documents, action.payload] };
    case ActionTypes.DELETE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload)
      };
    case ActionTypes.SET_ACTIVE_DOCUMENT:
      return { ...state, activeDocument: action.payload };
    case ActionTypes.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload };
    case ActionTypes.SET_UPLOADING_FILES:
      return { ...state, uploadingFiles: action.payload };
    case ActionTypes.ADD_UPLOADING_FILE:
      return { ...state, uploadingFiles: [...state.uploadingFiles, action.payload] };
    case ActionTypes.REMOVE_UPLOADING_FILE:
      return {
        ...state,
        uploadingFiles: state.uploadingFiles.filter(file => file.id !== action.payload)
      };
    case ActionTypes.SET_PAGINATION:
      return { ...state, pagination: action.payload };
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    case ActionTypes.UPDATE_DOCUMENT: {
      const updatedDocuments = state.documents.map(doc =>
        doc.id === action.payload.id ? { ...doc, ...action.payload } : doc
      );
      const updatedActiveDocument =
        state.activeDocument && state.activeDocument.id === action.payload.id
          ? { ...state.activeDocument, ...action.payload }
          : state.activeDocument;
      return {
        ...state,
        documents: updatedDocuments,
        activeDocument: updatedActiveDocument,
      };
    }
    case ActionTypes.SET_THREADS:
      return { ...state, threads: action.payload };
    case ActionTypes.UPSERT_THREAD: {
      const existingIndex = state.threads.findIndex(thread => thread.id === action.payload.id);
      if (existingIndex === -1) {
        return { ...state, threads: [action.payload, ...state.threads] };
      }
      const updatedThreads = [...state.threads];
      updatedThreads[existingIndex] = { ...updatedThreads[existingIndex], ...action.payload };
      return { ...state, threads: updatedThreads };
    }
    case ActionTypes.REMOVE_THREAD: {
      const filteredThreads = state.threads.filter(thread => thread.id !== action.payload);
      const { [action.payload]: _removed, ...restMessages } = state.threadMessages;
      const nextSelectedId = state.selectedThreadId === action.payload ? null : state.selectedThreadId;
      return {
        ...state,
        threads: filteredThreads,
        threadMessages: restMessages,
        selectedThreadId: nextSelectedId,
      };
    }
    case ActionTypes.SET_CATEGORIES:
      return { ...state, categories: action.payload };
    case ActionTypes.SET_THREAD_MESSAGES:
      return {
        ...state,
        threadMessages: {
          ...state.threadMessages,
          [action.payload.threadId]: action.payload.messages,
        },
      };
    case ActionTypes.SET_SELECTED_THREAD:
      return { ...state, selectedThreadId: action.payload };
    case ActionTypes.SET_THREAD_LOADING:
      return { ...state, threadLoading: action.payload };
    case ActionTypes.SET_PERSIST_CONVERSATION:
      return { ...state, persistConversation: action.payload };
    case ActionTypes.SET_LLM_AVAILABLE:
      return { ...state, llmAvailable: action.payload };
    case ActionTypes.SET_LLM_CHECK_LOADING:
      return { ...state, llmCheckLoading: action.payload };
    case ActionTypes.SET_LOADED_PROJECT_ID:
      return { ...state, loadedProjectId: action.payload };
    default:
      return state;
  }
}

export function RAGProvider({ children }) {
  const { api } = useAppContext();
  const [state, dispatch] = useReducer(ragReducer, initialState);

  // ============ Utility Functions ============
  const ensureRagAvailable = useCallback((operationName) => {
    if (!IS_RAG_ENABLED) {
      const error = new Error(RAG_DISABLED_MESSAGE);
      dispatch({ type: ActionTypes.SET_ERROR, payload: RAG_DISABLED_MESSAGE });
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  const selectThread = useCallback((threadId) => {
    dispatch({ type: ActionTypes.SET_SELECTED_THREAD, payload: threadId });
  }, []);

  const setPersistConversation = useCallback((persist) => {
    dispatch({ type: ActionTypes.SET_PERSIST_CONVERSATION, payload: persist });
  }, []);

  const setLoadedProjectId = useCallback((id) => {
    dispatch({ type: ActionTypes.SET_LOADED_PROJECT_ID, payload: id });
  }, []);

  // ============ Request Cache (for deduplication) ============
  const requestCache = useRef(new Map());

  // ============ Use Custom Hooks ============
  const documentHooks = useRagDocuments(state, dispatch, ActionTypes, ensureRagAvailable, requestCache);
  const llmAnalysisHooks = useRagLlmAnalysis(state, dispatch, ActionTypes, ensureRagAvailable, requestCache);
  const chatHooks = useRagChat(state, dispatch, ActionTypes, ensureRagAvailable, requestCache);
  const searchHooks = useRagSearch(state, dispatch, ActionTypes, ensureRagAvailable, requestCache);
  const globalDocsHooks = useRagGlobalDocs(state, dispatch, ActionTypes, ensureRagAvailable, requestCache);

  // ============ Context Value ============
  const value = {
    // State
    state,
    threads: state.threads,
    categories: state.categories,
    threadMessages: state.threadMessages,
    selectedThreadId: state.selectedThreadId,
    threadLoading: state.threadLoading,
    persistConversation: state.persistConversation,
    llmAvailable: state.llmAvailable,
    llmCheckLoading: state.llmCheckLoading,
    loadedProjectId: state.loadedProjectId,

    // Utility functions
    clearError,
    selectThread,
    setPersistConversation,
    setLoadedProjectId,

    // Document functions (from useRagDocuments)
    uploadDocument: documentHooks.uploadDocument,
    analyzeDocument: documentHooks.analyzeDocument,
    waitForDocumentAnalysis: documentHooks.waitForDocumentAnalysis,
    waitForEmbeddingGeneration: documentHooks.waitForEmbeddingGeneration,
    generateEmbeddings: documentHooks.generateEmbeddings,
    fetchDocumentById: documentHooks.fetchDocumentById,
    listDocuments: documentHooks.listDocuments,
    deleteDocument: documentHooks.deleteDocument,
    downloadDocument: documentHooks.downloadDocument,
    getDocumentChunks: documentHooks.getDocumentChunks,
    fetchDocumentBlob: documentHooks.fetchDocumentBlob,

    // LLM Analysis functions (from useRagLlmAnalysis)
    checkLlmAvailability: llmAnalysisHooks.checkLlmAvailability,
    estimateAnalysisCost: llmAnalysisHooks.estimateAnalysisCost,
    startLlmAnalysis: llmAnalysisHooks.startLlmAnalysis,
    getLlmAnalysisStatus: llmAnalysisHooks.getLlmAnalysisStatus,
    getLlmAnalysisResults: llmAnalysisHooks.getLlmAnalysisResults,
    listLlmAnalysisJobs: llmAnalysisHooks.listLlmAnalysisJobs,
    pauseAnalysis: llmAnalysisHooks.pauseAnalysis,
    resumeAnalysis: llmAnalysisHooks.resumeAnalysis,
    cancelAnalysis: llmAnalysisHooks.cancelAnalysis,
    createAnalysisSummary: llmAnalysisHooks.createAnalysisSummary,
    getAnalysisSummary: llmAnalysisHooks.getAnalysisSummary,
    listAnalysisSummaries: llmAnalysisHooks.listAnalysisSummaries,
    updateAnalysisSummary: llmAnalysisHooks.updateAnalysisSummary,
    deleteAnalysisSummary: llmAnalysisHooks.deleteAnalysisSummary,

    // Chat functions (from useRagChat)
    listChatThreads: chatHooks.listChatThreads,
    listChatCategories: chatHooks.listChatCategories,
    fetchThreadMessages: chatHooks.fetchThreadMessages,
    createChatThread: chatHooks.createChatThread,
    updateChatThread: chatHooks.updateChatThread,
    deleteChatThread: chatHooks.deleteChatThread,
    updateThreadCategory: chatHooks.updateThreadCategory,
    deleteThreadCategory: chatHooks.deleteThreadCategory,
    chat: chatHooks.chat,
    chatStream: chatHooks.chatStream,
    editChatMessage: chatHooks.editChatMessage,
    deleteChatMessage: chatHooks.deleteChatMessage,
    getChatThread: chatHooks.getChatThread,

    // Search functions (from useRagSearch)
    searchSimilar: searchHooks.searchSimilar,
    searchAdvanced: searchHooks.searchAdvanced,

    // Global Docs functions (from useRagGlobalDocs)
    listGlobalDocuments: globalDocsHooks.listGlobalDocuments,
    createGlobalDocumentRequest: globalDocsHooks.createGlobalDocumentRequest,
    listGlobalDocumentRequests: globalDocsHooks.listGlobalDocumentRequests,
    approveGlobalDocumentRequest: globalDocsHooks.approveGlobalDocumentRequest,
    rejectGlobalDocumentRequest: globalDocsHooks.rejectGlobalDocumentRequest,
    deleteGlobalDocument: globalDocsHooks.deleteGlobalDocument,
    updateDocument: globalDocsHooks.updateDocument,
    promoteDocumentToGlobal: globalDocsHooks.promoteDocumentToGlobal,
    requestPromoteDocument: globalDocsHooks.requestPromoteDocument,
  };

  return (
    <RAGContext.Provider value={value}>
      {children}
    </RAGContext.Provider>
  );
}

export function useRAG() {
  const context = useContext(RAGContext);
  if (!context) {
    throw new Error('useRAG must be used within a RAGProvider');
  }
  return context;
}

export default RAGContext;
