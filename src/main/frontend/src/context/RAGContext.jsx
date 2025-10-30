// src/context/RAGContext.jsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../utils/apiConstants.js';

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
  error: null,
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

  const uploadDocument = useCallback(async (file, projectId, uploadedBy = null) => {
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
  }, [getAuthHeaders, state.uploadingFiles]);

  const analyzeDocument = useCallback(async (documentId, parser = 'pymupdf4llm') => {
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
  }, [getAuthHeaders]);

  const waitForDocumentAnalysis = useCallback(async (
    documentId,
    { intervalMs = 2000, timeoutMs = 5 * 60 * 1000 } = {}
  ) => {
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
  }, [getAuthHeaders]);

  const waitForEmbeddingGeneration = useCallback(async (
    documentId,
    { intervalMs = 2000, timeoutMs = 5 * 60 * 1000 } = {}
  ) => {
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
  }, [getAuthHeaders]);

  const generateEmbeddings = useCallback(async (documentId) => {
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
  }, [getAuthHeaders]);

  const searchSimilar = useCallback(async (queryText, projectId, topK = 10, minSimilarity = 0.0) => {
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
  }, [getAuthHeaders]);

  const getDocument = useCallback(async (documentId) => {
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
  }, [getAuthHeaders]);

  const listDocuments = useCallback(async (projectId, page = 1, size = 20) => {
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
  }, [getAuthHeaders]);

  const deleteDocument = useCallback(async (documentId) => {
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
  }, [getAuthHeaders]);

  const downloadDocument = useCallback(async (documentId, fileName) => {
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
  }, [getAuthHeaders]);

  const getDocumentChunks = useCallback(async (documentId, skip = 0, limit = 50) => {
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
  }, [getAuthHeaders]);

  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

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
