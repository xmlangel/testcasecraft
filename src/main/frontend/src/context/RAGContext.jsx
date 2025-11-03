// src/context/RAGContext.jsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../utils/apiConstants.js';

const USE_DEMO_DATA = process.env.REACT_APP_USE_DEMO_DATA === 'true';
const RAG_DISABLED_BY_ENV = process.env.REACT_APP_ENABLE_RAG === 'false';
export const RAG_DISABLED_MESSAGE = RAG_DISABLED_BY_ENV
  ? '관리자 설정으로 RAG 기능이 비활성화되었습니다.'
  : USE_DEMO_DATA
    ? '데모 모드에서는 RAG 기능이 비활성화되어 있습니다. 서버 API 연결 후 이용해주세요.'
    : null;
const IS_RAG_ENABLED = !RAG_DISABLED_MESSAGE;

const RAGContext = createContext();

const initialState = {
  documents: [],
  activeDocument: null,
  searchResults: [],
  uploadingFiles: [],
  pagination: {
    total: 0,
    page: 1,
    pageSize: 20,
  },
  loading: false,
  error: RAG_DISABLED_MESSAGE,
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
    default:
      return state;
  }
}

export function RAGProvider({ children }) {
  const [state, dispatch] = useReducer(ragReducer, initialState);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const ensureRagAvailable = useCallback((operationName) => {
    if (!IS_RAG_ENABLED) {
      const error = new Error(RAG_DISABLED_MESSAGE);
      if (API_CONFIG.DEBUG) {
        console.warn(`[RAG] ${operationName || 'operation'} skipped: ${RAG_DISABLED_MESSAGE}`);
      }
      dispatch({ type: ActionTypes.SET_ERROR, payload: RAG_DISABLED_MESSAGE });
      throw error;
    }
  }, [dispatch]);

  const uploadDocument = useCallback(async (file, projectId, uploadedBy = null) => {
    ensureRagAvailable('uploadDocument');

    const uploadingFile = {
      id: Date.now(),
      name: file.name,
      size: file.size,
      progress: 0,
    };

    // 전역 에러 즉시 클리어
    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.ADD_UPLOADING_FILE, payload: uploadingFile });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      if (uploadedBy) {
        formData.append('uploadedBy', uploadedBy);
      }

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/rag/documents/upload`,
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            dispatch({
              type: ActionTypes.SET_UPLOADING_FILES,
              payload: state.uploadingFiles.map(f =>
                f.id === uploadingFile.id ? { ...f, progress: percentCompleted } : f
              )
            });
          },
        }
      );

      dispatch({ type: ActionTypes.ADD_DOCUMENT, payload: response.data });
      dispatch({ type: ActionTypes.REMOVE_UPLOADING_FILE, payload: uploadingFile.id });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      return response.data;
    } catch (error) {
      console.error('문서 업로드 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '문서 업로드에 실패했습니다.'
      });
      dispatch({ type: ActionTypes.REMOVE_UPLOADING_FILE, payload: uploadingFile.id });
      throw error;
    }
  }, [getAuthHeaders, state.uploadingFiles, ensureRagAvailable]);

  const analyzeDocument = useCallback(async (documentId, parser = 'pymupdf4llm') => {
    ensureRagAvailable('analyzeDocument');

    // 전역 에러 즉시 클리어
    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/rag/documents/${documentId}/analyze`,
        null,
        {
          params: { parser },
          headers: getAuthHeaders(),
        }
      );

      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      return response.data;
    } catch (error) {
      console.error('문서 분석 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '문서 분석에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders, ensureRagAvailable]);

  const waitForDocumentAnalysis = useCallback(async (
    documentId,
    { intervalMs = 2000, timeoutMs = 5 * 60 * 1000 } = {}
  ) => {
    ensureRagAvailable('waitForDocumentAnalysis');

    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    const startedAt = Date.now();
    const headers = getAuthHeaders();

    try {
      while (Date.now() - startedAt < timeoutMs) {
        let document;

        try {
          const response = await axios.get(
            `${API_CONFIG.BASE_URL}/api/rag/documents/${documentId}`,
            { headers }
          );
          document = response.data;

          if (document) {
            dispatch({ type: ActionTypes.UPDATE_DOCUMENT, payload: document });
            dispatch({ type: ActionTypes.SET_ACTIVE_DOCUMENT, payload: document });
          }
        } catch (error) {
          const message = error.response?.data?.message
            || error.message
            || '문서 분석 상태 조회에 실패했습니다.';
          dispatch({ type: ActionTypes.SET_ERROR, payload: message });
          throw new Error(message);
        }

        const status = document?.analysisStatus?.toLowerCase();
        if (status === 'completed') {
          return document;
        }

        if (status === 'failed') {
          const message = '문서 분석에 실패했습니다.';
          dispatch({ type: ActionTypes.SET_ERROR, payload: message });
          throw new Error(message);
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }

      const timeoutMessage = '문서 분석이 제한 시간 내에 완료되지 않았습니다.';
      dispatch({ type: ActionTypes.SET_ERROR, payload: timeoutMessage });
      throw new Error(timeoutMessage);
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [getAuthHeaders, ensureRagAvailable]);
  const waitForEmbeddingGeneration = useCallback(async (
    documentId,
    { intervalMs = 2000, timeoutMs = 5 * 60 * 1000 } = {}
  ) => {
    ensureRagAvailable('waitForEmbeddingGeneration');

    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    const startedAt = Date.now();
    const headers = getAuthHeaders();

    try {
      while (Date.now() - startedAt < timeoutMs) {
        let document;

        try {
          const response = await axios.get(
            `${API_CONFIG.BASE_URL}/api/rag/documents/${documentId}`,
            { headers }
          );
          document = response.data;

          if (document) {
            dispatch({ type: ActionTypes.UPDATE_DOCUMENT, payload: document });
            dispatch({ type: ActionTypes.SET_ACTIVE_DOCUMENT, payload: document });
          }
        } catch (error) {
          const message = error.response?.data?.message
            || error.message
            || '임베딩 상태 조회에 실패했습니다.';
          dispatch({ type: ActionTypes.SET_ERROR, payload: message });
          throw new Error(message);
        }

        const status = document?.metaData?.embedding_status?.toLowerCase();
        if (status === 'completed') {
          return document;
        }

        if (status === 'failed') {
          const message = '임베딩 생성에 실패했습니다.';
          dispatch({ type: ActionTypes.SET_ERROR, payload: message });
          throw new Error(message);
        }

        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }

      const timeoutMessage = '임베딩 생성이 제한 시간 내에 완료되지 않았습니다.';
      dispatch({ type: ActionTypes.SET_ERROR, payload: timeoutMessage });
      throw new Error(timeoutMessage);
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  }, [getAuthHeaders, ensureRagAvailable]);

  const generateEmbeddings = useCallback(async (documentId) => {
    ensureRagAvailable('generateEmbeddings');

    // 전역 에러 즉시 클리어
    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/rag/embeddings/generate`,
        null,
        {
          params: { documentId },
          headers: getAuthHeaders(),
        }
      );

      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      return response.data;
    } catch (error) {
      console.error('임베딩 생성 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '임베딩 생성에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders, ensureRagAvailable]);

  const searchSimilar = useCallback(async (queryText, projectId, topK = 10, minSimilarity = 0.0) => {
    ensureRagAvailable('searchSimilar');

    // 전역 에러 즉시 클리어
    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/rag/search/similar`,
        {
          queryText,
          projectId,
          maxResults: topK,
          similarityThreshold: minSimilarity,
        },
        {
          headers: getAuthHeaders(),
        }
      );

      dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: response.data.results || [] });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      return response.data;
    } catch (error) {
      console.error('유사도 검색 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '유사도 검색에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders, ensureRagAvailable]);

  const getDocument = useCallback(async (documentId) => {
    ensureRagAvailable('getDocument');

    // 전역 에러 즉시 클리어
    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/rag/documents/${documentId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      dispatch({ type: ActionTypes.SET_ACTIVE_DOCUMENT, payload: response.data });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      return response.data;
    } catch (error) {
      console.error('문서 조회 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '문서 조회에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders, ensureRagAvailable]);

  const listDocuments = useCallback(async (projectId, page = 1, size = 20) => {
    ensureRagAvailable('listDocuments');

    // 전역 에러 즉시 클리어
    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const params = { page, size };
      if (projectId) {
        params.projectId = projectId;
      }

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/rag/documents`,
        {
          params,
          headers: getAuthHeaders(),
        }
      );

      dispatch({ type: ActionTypes.SET_DOCUMENTS, payload: response.data.documents || [] });
      dispatch({
        type: ActionTypes.SET_PAGINATION,
        payload: {
          total: response.data.total || 0,
          page: response.data.page || 1,
          pageSize: response.data.pageSize || 20,
        }
      });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      return response.data;
    } catch (error) {
      console.error('문서 목록 조회 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '문서 목록 조회에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders, ensureRagAvailable]);

  const deleteDocument = useCallback(async (documentId) => {
    ensureRagAvailable('deleteDocument');

    // 전역 에러 즉시 클리어
    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      await axios.delete(
        `${API_CONFIG.BASE_URL}/api/rag/documents/${documentId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      dispatch({ type: ActionTypes.DELETE_DOCUMENT, payload: documentId });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      return { success: true, message: '문서가 삭제되었습니다.' };
    } catch (error) {
      console.error('문서 삭제 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '문서 삭제에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders, ensureRagAvailable]);

  const downloadDocument = useCallback(async (documentId, fileName) => {
    ensureRagAvailable('downloadDocument');

    // 전역 에러 즉시 클리어
    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/rag/documents/${documentId}/download`,
        {
          headers: getAuthHeaders(),
          responseType: 'blob', // 파일 다운로드를 위해 blob 타입 사용
        }
      );

      // Blob 생성 및 다운로드 링크 생성
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();

      // 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      return { success: true, message: '문서가 다운로드되었습니다.' };
    } catch (error) {
      console.error('문서 다운로드 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '문서 다운로드에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders, ensureRagAvailable]);

  const getDocumentChunks = useCallback(async (documentId, skip = 0, limit = 50) => {
    ensureRagAvailable('getDocumentChunks');

    // 전역 에러 즉시 클리어
    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/api/rag/documents/${documentId}/chunks`,
        {
          params: { skip, limit },
          headers: getAuthHeaders(),
        }
      );

      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      return response.data;
    } catch (error) {
      console.error('문서 청크 조회 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '문서 청크 조회에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders, ensureRagAvailable]);

  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  /**
   * LLM 채팅 함수 (일반 응답)
   * @param {string} projectId - 프로젝트 ID
   * @param {string} message - 사용자 메시지
   * @param {object} options - 추가 옵션 (temperature, maxTokens 등)
   * @returns {Promise} - AI 응답
   */
  const chat = useCallback(async (projectId, message, options = {}) => {
    ensureRagAvailable('chat');

    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const { conversationHistory, ...requestOptions } = options || {};
      const payload = {
        projectId,
        message,
        ...requestOptions,
      };

      if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        payload.conversationHistory = conversationHistory;
      }

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/api/rag/chat`,
        payload,
        {
          headers: getAuthHeaders(),
        }
      );

      dispatch({ type: ActionTypes.SET_LOADING, payload: false });

      return response.data;
    } catch (error) {
      console.error('채팅 요청 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.response?.data?.message || '채팅 요청에 실패했습니다.'
      });
      throw error;
    }
  }, [getAuthHeaders, ensureRagAvailable]);

  /**
   * LLM 채팅 스트리밍 함수 (SSE 또는 fetch stream)
   * @param {string} projectId - 프로젝트 ID
   * @param {string} message - 사용자 메시지
   * @param {function} onChunk - 청크 수신 시 호출될 콜백
   * @param {function} onComplete - 스트리밍 완료 시 호출될 콜백
   * @param {function} onError - 에러 발생 시 호출될 콜백
   * @param {object} options - 추가 옵션
   */
  const chatStream = useCallback(async (
    projectId,
    message,
    onChunk,
    onComplete,
    onError,
    options = {}
  ) => {
    ensureRagAvailable('chatStream');

    dispatch({ type: ActionTypes.CLEAR_ERROR });
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });

    try {
      const {
        onContext,
        conversationHistory,
        ...requestOptions
      } = options || {};

      const payload = {
        projectId,
        message,
        ...requestOptions,
      };

      if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        payload.conversationHistory = conversationHistory;
      }

      const onContextCallback = typeof onContext === 'function' ? onContext : null;

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/rag/chat/stream`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('스트리밍 응답을 지원하지 않는 환경입니다.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = null;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          dispatch({ type: ActionTypes.SET_LOADING, payload: false });
          if (onComplete) onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // 마지막 불완전한 라인은 버퍼에 남김
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event:')) {
            // SSE 이벤트 타입 추출
            currentEvent = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            // SSE 데이터 추출
            const data = line.slice(5).trim();

            if (!data) continue;

            // 이벤트 타입에 따라 처리
            if (currentEvent === 'chunk') {
              // chunk 이벤트: plain text
              if (onChunk) onChunk(data);
            } else if (currentEvent === 'context') {
              // context 이벤트: JSON 배열
              try {
                const contexts = JSON.parse(data);
                console.log('📚 검색된 컨텍스트:', contexts);
                // onContext 콜백 호출
                if (onContextCallback) {
                  onContextCallback(contexts);
                }
              } catch (e) {
                console.error('컨텍스트 파싱 실패:', e);
              }
            } else if (currentEvent === 'done') {
              // done 이벤트: 완료
              dispatch({ type: ActionTypes.SET_LOADING, payload: false });
              if (onComplete) onComplete();
              return;
            } else if (currentEvent === 'error') {
              // error 이벤트: 에러
              throw new Error(data);
            }
          }
        }
      }
    } catch (error) {
      console.error('스트리밍 채팅 실패:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: error.message || '스트리밍 채팅에 실패했습니다.'
      });
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      if (onError) onError(error);
      throw error;
    }
  }, [getAuthHeaders, ensureRagAvailable]);

  const value = {
    state,
    uploadDocument,
    analyzeDocument,
    waitForDocumentAnalysis,
    waitForEmbeddingGeneration,
    generateEmbeddings,
    searchSimilar,
    getDocument,
    listDocuments,
    deleteDocument,
    downloadDocument,
    getDocumentChunks,
    clearError,
    chat,
    chatStream,
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
