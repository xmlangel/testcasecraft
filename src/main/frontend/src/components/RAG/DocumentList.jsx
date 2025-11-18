// src/components/RAG/DocumentList.jsx
import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Tooltip,
  Collapse,
  LinearProgress,
  TextField,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ViewListIcon from '@mui/icons-material/ViewList';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SummarizeIcon from '@mui/icons-material/Summarize';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import PublicIcon from '@mui/icons-material/Public';
import SendIcon from '@mui/icons-material/Send';
import { useRAG } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import DocumentUpload from './DocumentUpload.jsx';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// 테스트 케이스 문서 탭은 숨김 (요구사항)
const SHOW_TEST_CASE_DOCUMENT_TAB = false;

function DocumentList({ projectId, onViewChunks, onLlmAnalysis }) {
  const { t } = useI18n();
  const {
    listDocuments,
    deleteDocument,
    downloadDocument,
    analyzeDocument,
    generateEmbeddings,
    getLlmAnalysisStatus,
    getLlmAnalysisResults,
    pauseAnalysis,
    resumeAnalysis,
    cancelAnalysis,
    listLlmAnalysisJobs,
    promoteDocumentToGlobal,
    requestPromoteDocument,
    state
  } = useRAG();
  const { api, user } = useAppContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [localError, setLocalError] = useState(null);
  const [tabValue, setTabValue] = useState(0); // ICT-388: 탭 상태 추가
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // PDF 미리보기 관련 상태
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // LLM 분석 상태 관련
  const [llmAnalysisStates, setLlmAnalysisStates] = useState({}); // documentId -> {status, progress, analyzedChunks, totalChunks, ...job details}

  // 확장 가능한 행 상태
  const [expandedRows, setExpandedRows] = useState({}); // documentId -> boolean

  // LLM 분석 요약 보기 다이얼로그
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [summaryContent, setSummaryContent] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null); // { message, severity }

  // 작업 이력 다이얼로그
  const [jobHistoryDialogOpen, setJobHistoryDialogOpen] = useState(false);
  const [selectedJobHistory, setSelectedJobHistory] = useState(null); // { documentId, fileName, jobs: [] }
  const [loadingJobHistory, setLoadingJobHistory] = useState(false);
  const [promoteDialogState, setPromoteDialogState] = useState({ open: false, document: null, reason: '' });
  const [requestDialogState, setRequestDialogState] = useState({ open: false, document: null, message: '' });
  const [promoteSubmitting, setPromoteSubmitting] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  const loadDocuments = useCallback(async () => {
    if (projectId) {
      try {
        setLocalError(null);
        // API는 1-based 페이지를 사용하므로 +1
        await listDocuments(projectId, page + 1, rowsPerPage);
      } catch (error) {
        // console.error('문서 목록 로드 실패:', error);
        const errorMessage = error.response?.data?.message || error.message || '문서 목록 조회에 실패했습니다.';
        setLocalError(errorMessage);

        // 5초 후 자동으로 오류 메시지 제거
        setTimeout(() => {
          setLocalError(null);
        }, 5000);
      }
    }
  }, [projectId, page, rowsPerPage, listDocuments]);

  // LLM 분석 상태 조회
  const loadLlmAnalysisStates = useCallback(async () => {
    if (!state.documents || state.documents.length === 0) {
      return;
    }

    const newStates = {};

    // 각 문서의 LLM 분석 상태 조회
    await Promise.all(
      state.documents.map(async (doc) => {
        // testcase_ 로 시작하는 문서는 제외
        if (doc.fileName?.startsWith('testcase_')) {
          return;
        }

        try {
          const status = await getLlmAnalysisStatus(doc.id);
          const totalChunks = status.progress?.totalChunks || doc.totalChunks || 0;
          const processedChunks = status.progress?.processedChunks || 0;
          const progress = totalChunks > 0 ? Math.round((processedChunks / totalChunks) * 100) : 0;

          newStates[doc.id] = {
            status: status.status || 'not_started',
            progress,
            analyzedChunks: processedChunks,
            totalChunks,
            // 작업 상세 정보
            llmProvider: status.llmProvider,
            llmModel: status.llmModel,
            totalCostUsd: status.totalCostUsd,
            totalTokens: status.totalTokens,
            startedAt: status.startedAt,
            completedAt: status.completedAt,
            errorMessage: status.errorMessage,
          };
        } catch (err) {
          // 404 에러는 분석 작업이 없는 것으로 처리
          if (err.response?.status === 404) {
            newStates[doc.id] = {
              status: 'not_started',
              progress: 0,
              analyzedChunks: 0,
              totalChunks: doc.totalChunks || 0,
            };
          } else {
            console.error(`LLM 분석 상태 조회 실패 (${doc.fileName}):`, err);
            newStates[doc.id] = {
              status: 'error',
              progress: 0,
              analyzedChunks: 0,
              totalChunks: doc.totalChunks || 0,
            };
          }
        }
      })
    );

    setLlmAnalysisStates(newStates);
  }, [state.documents, getLlmAnalysisStatus]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // 문서 목록 로드 후 LLM 분석 상태 조회
  useEffect(() => {
    loadLlmAnalysisStates();
  }, [loadLlmAnalysisStates]);

  // 진행 중인 작업이 있으면 주기적으로 상태를 갱신
  useEffect(() => {
    if (!projectId || state.documents.length === 0) {
      return undefined;
    }

    const hasActiveJobs = state.documents.some((doc) => {
      const llmState = llmAnalysisStates[doc.id];
      if (!llmState) {
        return true; // 아직 상태를 모르면 한 번 이상 조회 필요
      }
      return ['processing', 'pending', 'paused', 'resuming', 'queued']
        .includes(llmState.status);
    });

    if (!hasActiveJobs) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      loadLlmAnalysisStates();
    }, 3000); // 3초 간격으로 진행률 갱신

    return () => clearInterval(intervalId);
  }, [projectId, state.documents, llmAnalysisStates, loadLlmAnalysisStates]);

  // 분석 중인 문서가 있으면 2초마다 상태 업데이트 (실시간 진행률 확인)
  useEffect(() => {
    const hasProcessingDocs = Object.values(llmAnalysisStates).some(
      (state) => state.status === 'processing' || state.status === 'pending'
    );

    if (!hasProcessingDocs) {
      return; // 분석 중인 문서가 없으면 폴링하지 않음
    }

    const intervalId = setInterval(() => {
      loadLlmAnalysisStates();
    }, 2000); // 2초마다 상태 업데이트

    return () => clearInterval(intervalId);
  }, [llmAnalysisStates, loadLlmAnalysisStates]);

  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
  };

  const handleUploadSuccess = useCallback(async () => {
    await loadDocuments();
    setUploadDialogOpen(false);
  }, [loadDocuments]);

  const showStatusNotice = useCallback((message, severity = 'info') => {
    setStatusNotice({ message, severity });
    setTimeout(() => setStatusNotice(null), 4000);
  }, []);

  const openPromoteDialog = (document) => {
    setPromoteDialogState({ open: true, document, reason: '' });
  };

  const closePromoteDialog = () => {
    setPromoteDialogState({ open: false, document: null, reason: '' });
  };

  const openRequestDialog = (document) => {
    setRequestDialogState({ open: true, document, message: '' });
  };

  const closeRequestDialog = () => {
    setRequestDialogState({ open: false, document: null, message: '' });
  };

  const handlePromoteSubmit = async () => {
    if (!promoteDialogState.document) return;
    setPromoteSubmitting(true);
    try {
      await promoteDocumentToGlobal(
        promoteDialogState.document.id,
        promoteDialogState.reason?.trim() || null
      );
      showStatusNotice(
        t('rag.document.global.promoteSuccess', '선택한 문서가 공통 RAG 문서로 이동되었습니다.'),
        'success'
      );
      await loadDocuments();
      await loadLlmAnalysisStates();
    } catch (err) {
      const errorMessage = err.response?.data?.message || '공통 문서 이동에 실패했습니다.';
      setLocalError(errorMessage);
      setTimeout(() => setLocalError(null), 5000);
    } finally {
      setPromoteSubmitting(false);
      closePromoteDialog();
    }
  };

  const handleRequestSubmit = async () => {
    if (!requestDialogState.document) return;
    setRequestSubmitting(true);
    try {
      await requestPromoteDocument(
        requestDialogState.document.id,
        requestDialogState.message?.trim() || null
      );
      showStatusNotice(
        t('rag.document.global.requestSubmitted', '관리자에게 공통 문서 등록 요청이 전송되었습니다.'),
        'info'
      );
    } catch (err) {
      const errorMessage = err.response?.data?.message || '공통 문서 등록 요청에 실패했습니다.';
      setLocalError(errorMessage);
      setTimeout(() => setLocalError(null), 5000);
    } finally {
      setRequestSubmitting(false);
      closeRequestDialog();
    }
  };

  const formatProgressSummary = useCallback((llmState) => {
    if (!llmState) return '';
    const progressValue = Number.isFinite(llmState.progress) ? llmState.progress : 0;
    const boundedProgress = Math.min(Math.max(progressValue, 0), 100).toFixed(1);
    const analyzed = llmState.analyzedChunks ?? 0;
    const total = llmState.totalChunks ?? 0;
    const chunkInfo = total > 0 ? ` (${analyzed}/${total} 청크)` : '';
    return `${boundedProgress}%${chunkInfo}`;
  }, []);

  const buildSummaryMarkdown = useCallback((results) => {
    if (!results || results.length === 0) {
      return '';
    }

    return results
      .map((result, index) => {
        const chunkNumber = Number.isInteger(result.chunkIndex)
          ? result.chunkIndex + 1
          : index + 1;
        const cleanedResponse = (result.llmResponse || '')
          .replace(/\n{2,}/g, '\n')
          .trim();
        return `### 📄 청크 ${chunkNumber}\n${cleanedResponse}`;
      })
      .join('\n\n---\n\n');
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadDocuments();
      await loadLlmAnalysisStates();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadDocuments, loadLlmAnalysisStates]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (documentId) => {
    setSelectedDocumentId(documentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDocumentId) {
      try {
        setLocalError(null);
        await deleteDocument(selectedDocumentId);
        setDeleteDialogOpen(false);
        setSelectedDocumentId(null);
        // 문서 목록 새로고침
        await loadDocuments();
      } catch (error) {
        // console.error('문서 삭제 실패:', error);
        const errorMessage = error.response?.data?.message || error.message || '문서 삭제에 실패했습니다.';
        setLocalError(errorMessage);
        setDeleteDialogOpen(false);
        setSelectedDocumentId(null);

        // 5초 후 자동으로 오류 메시지 제거
        setTimeout(() => {
          setLocalError(null);
        }, 5000);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDocumentId(null);
  };

  const handleDownloadClick = async (documentId, fileName) => {
    try {
      setLocalError(null);
      await downloadDocument(documentId, fileName);
    } catch (error) {
      // console.error('문서 다운로드 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '문서 다운로드에 실패했습니다.';
      setLocalError(errorMessage);

      // 5초 후 자동으로 오류 메시지 제거
      setTimeout(() => {
        setLocalError(null);
      }, 5000);
    }
  };

  // 문서 분석 핸들러
  const handleAnalyzeClick = async (doc) => {
    if (!window.confirm(`문서 "${doc.fileName}"을 분석하시겠습니까?`)) {
      return;
    }

    try {
      setLocalError(null);
      await analyzeDocument(doc.id);
      // 문서 목록 새로고침
      await loadDocuments();
    } catch (error) {
      // console.error('문서 분석 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '문서 분석에 실패했습니다.';
      setLocalError(errorMessage);

      // 5초 후 자동으로 오류 메시지 제거
      setTimeout(() => {
        setLocalError(null);
      }, 5000);
    }
  };

  // 임베딩 생성 핸들러
  const handleGenerateEmbeddingsClick = async (doc) => {
    if (!window.confirm(`문서 "${doc.fileName}"의 임베딩을 생성하시겠습니까?`)) {
      return;
    }

    try {
      setLocalError(null);
      await generateEmbeddings(doc.id);
      // 문서 목록 새로고침
      await loadDocuments();
    } catch (error) {
      // console.error('임베딩 생성 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '임베딩 생성에 실패했습니다.';
      setLocalError(errorMessage);

      // 5초 후 자동으로 오류 메시지 제거
      setTimeout(() => {
        setLocalError(null);
      }, 5000);
    }
  };

  // PDF 미리보기 핸들러
  const handlePreviewClick = async (doc) => {
    if (!doc || !doc.id || !doc.fileName) return;

    // PDF 파일인지 확인
    const isPdf = doc.fileName.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return;
    }

    setPreviewDocument(doc);
    setPreviewDialogOpen(true);
    setLoadingPreview(true);
    setPreviewContent(null);

    try {
      // RAG API를 통해 PDF 다운로드
      const response = await api(`/api/rag/documents/${doc.id}/download`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPreviewContent({ type: 'pdf', url });
      } else {
        throw new Error('PDF를 불러올 수 없습니다.');
      }
    } catch (error) {
      // console.error('PDF 미리보기 오류:', error);
      setPreviewContent({ type: 'error', message: error.message });
    } finally {
      setLoadingPreview(false);
    }
  };

  // PDF 미리보기 다이얼로그 닫기
  const handleClosePreview = () => {
    setPreviewDialogOpen(false);
    // URL 정리 (메모리 누수 방지)
    if (previewContent?.url) {
      window.URL.revokeObjectURL(previewContent.url);
    }
    setPreviewContent(null);
    setPreviewDocument(null);
  };

  // LLM 분석 요약 보기
  const handleViewSummary = async (doc) => {
    const llmState = llmAnalysisStates[doc.id];
    if (!llmState || llmState.status === 'not_started') {
      return;
    }

    setSelectedSummary({
      documentId: doc.id,
      documentName: doc.fileName,
      ...llmState,
    });
    setSummaryDialogOpen(true);
    setLoadingSummary(true);
    setSummaryContent(null);

    try {
      // 분석 상태와 관계없이 현재까지의 결과를 조회 (최대 200개)
      const analyzedChunks = Math.max(llmState.analyzedChunks || 0, 1);
      const resultLimit = llmState.status === 'completed'
        ? 200
        : Math.min(analyzedChunks, 200);

      const analysisResults = await getLlmAnalysisResults(doc.id, 0, resultLimit);

      if (analysisResults && analysisResults.results && analysisResults.results.length > 0) {
        const combinedResponse = buildSummaryMarkdown(analysisResults.results);
        setSummaryContent(combinedResponse || null);
      } else if (llmState.status === 'completed') {
        setSummaryContent('분석이 완료되었지만 결과가 없습니다.');
      } else {
        setSummaryContent(null);
      }
    } catch (err) {
      console.error('LLM 분석 결과 조회 실패:', err);
      setSummaryContent('분석 결과 조회에 실패했습니다.');
    } finally {
      setLoadingSummary(false);
    }
  };

  // LLM 분석 요약 다이얼로그 닫기
  const handleCloseSummary = () => {
    setSummaryDialogOpen(false);
    setSelectedSummary(null);
    setSummaryContent(null);
    setIsFullScreen(false);
  };

  // 작업 이력 보기
  const handleViewJobHistory = async (doc) => {
    setSelectedJobHistory({
      documentId: doc.id,
      fileName: doc.fileName,
      jobs: [],
    });
    setJobHistoryDialogOpen(true);
    setLoadingJobHistory(true);

    try {
      // 해당 문서의 모든 작업 이력 조회 (페이지 크기를 크게 설정하여 모든 작업 조회)
      const response = await listLlmAnalysisJobs(projectId, null, 1, 100);

      // documentId로 필터링
      const filteredJobs = response.jobs?.filter(job => job.documentId === doc.id) || [];

      setSelectedJobHistory({
        documentId: doc.id,
        fileName: doc.fileName,
        jobs: filteredJobs,
      });
    } catch (err) {
      console.error('작업 이력 조회 실패:', err);
      setLocalError('작업 이력 조회에 실패했습니다.');
      setTimeout(() => setLocalError(null), 5000);
    } finally {
      setLoadingJobHistory(false);
    }
  };

  // 작업 이력 다이얼로그 닫기
  const handleCloseJobHistory = () => {
    setJobHistoryDialogOpen(false);
    setSelectedJobHistory(null);
  };

  // 행 확장 토글
  const handleRowExpand = (documentId) => {
    setExpandedRows(prev => ({
      ...prev,
      [documentId]: !prev[documentId]
    }));
  };

  // 작업 제어: 일시정지
  const handlePauseJob = async (documentId) => {
    const llmState = llmAnalysisStates[documentId];
    if (!llmState || llmState.status !== 'processing') {
      showStatusNotice(t('rag.document.alert.pauseUnavailable', '진행 중인 작업만 일시정지할 수 있습니다.'), 'warning');
      return;
    }
    try {
      await pauseAnalysis(documentId);
      await loadLlmAnalysisStates(); // 상태 새로고침
    } catch (err) {
      console.error('일시정지 실패:', err);
      setLocalError('일시정지에 실패했습니다.');
      setTimeout(() => setLocalError(null), 5000);
    }
  };

  // 작업 제어: 재개
  const handleResumeJob = async (documentId) => {
    const llmState = llmAnalysisStates[documentId];
    if (!llmState) {
      showStatusNotice(t('rag.document.alert.statusLoading', '작업 상태를 불러오는 중입니다. 잠시 후 다시 시도해주세요.'), 'info');
      return;
    }
    if (llmState.status === 'processing' || llmState.status === 'pending' || llmState.status === 'resuming') {
      const progressSummary = formatProgressSummary(llmState);
      const defaultMessage = progressSummary
        ? `이미 분석이 진행 중입니다. (진행율: ${progressSummary})`
        : '이미 분석이 진행 중입니다.';
      showStatusNotice(
        progressSummary
          ? t('rag.document.alert.alreadyProcessingWithProgress', defaultMessage)
          : t('rag.document.alert.alreadyProcessing', defaultMessage),
        'info'
      );
      return;
    }
    if (llmState.status !== 'paused') {
      showStatusNotice(t('rag.document.alert.resumeUnavailable', '일시정지된 작업만 재개할 수 있습니다.'), 'warning');
      return;
    }
    try {
      await resumeAnalysis(documentId);
      await loadLlmAnalysisStates(); // 상태 새로고침
    } catch (err) {
      console.error('재개 실패:', err);
      setLocalError('재개에 실패했습니다.');
      setTimeout(() => setLocalError(null), 5000);
    }
  };

  // 작업 제어: 취소
  const handleCancelJob = async (documentId, documentName) => {
    if (!window.confirm(`"${documentName}" 문서의 분석을 취소하시겠습니까? 지금까지의 결과는 보존됩니다.`)) {
      return;
    }

    try {
      await cancelAnalysis(documentId);
      await loadLlmAnalysisStates(); // 상태 새로고침
    } catch (err) {
      console.error('취소 실패:', err);
      setLocalError('취소에 실패했습니다.');
      setTimeout(() => setLocalError(null), 5000);
    }
  };

  // 날짜 포맷 (ISO 문자열)
  const formatDateFromISO = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '-';
    }
  };

  // ICT-388: 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    if (!SHOW_TEST_CASE_DOCUMENT_TAB) {
      return;
    }
    setTabValue(newValue);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 배열 형태의 날짜 포맷 ([year, month, day, hour, minute, second, nanosecond])
  const formatDateArray = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) return '-';
    try {
      // Java LocalDateTime 배열 형식: [year, month, day, hour, minute, second, nanosecond]
      const [year, month, day, hour = 0, minute = 0] = dateArray;
      const date = new Date(year, month - 1, day, hour, minute);
      if (isNaN(date.getTime())) {
        return '-';
      }
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '-';
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      pending: {
        label: t('rag.document.status.pending', '대기 중'),
        icon: <PendingIcon fontSize="small" />,
        color: 'default',
      },
      analyzing: {
        label: t('rag.document.status.analyzing', '분석 중'),
        icon: <CircularProgress size={14} />,
        color: 'primary',
      },
      completed: {
        label: t('rag.document.status.completed', '완료'),
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'success',
      },
      failed: {
        label: t('rag.document.status.failed', '실패'),
        icon: <ErrorIcon fontSize="small" />,
        color: 'error',
      },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Chip
        icon={statusInfo.icon}
        label={statusInfo.label}
        color={statusInfo.color}
        size="small"
      />
    );
  };

  const getParserLabel = (doc) => {
    const parserKey = doc?.metaData?.parser || doc?.metaData?.parserName;
    if (!parserKey) {
      return t('rag.document.list.parserUnknown', '알 수 없음');
    }
    const parserLabels = {
      upstage: 'Upstage',
      pymupdf: 'PyMuPDF',
      pymupdf4llm: 'PyMuPDF4LLM',
      pypdf2: 'PyPDF2',
      auto: t('rag.document.list.parserAuto', '자동 선택'),
    };
    return parserLabels[parserKey] || parserKey;
  };

  const getEmbeddingStatusChip = (doc) => {
    const status = doc?.metaData?.embedding_status
      ? doc.metaData.embedding_status.toLowerCase()
      : 'pending';

    const statusMap = {
      pending: {
        label: t('rag.document.embedding.pending', '대기 중'),
        icon: <PendingIcon fontSize="small" />,
        color: 'default',
      },
      generating: {
        label: t('rag.document.embedding.generating', '생성 중'),
        icon: <CircularProgress size={14} />,
        color: 'primary',
      },
      completed: {
        label: t('rag.document.embedding.completed', '완료'),
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'success',
      },
      failed: {
        label: t('rag.document.embedding.failed', '실패'),
        icon: <ErrorIcon fontSize="small" />,
        color: 'error',
      },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Chip
        icon={statusInfo.icon}
        label={statusInfo.label}
        color={statusInfo.color}
        size="small"
      />
    );
  };

  // LLM 분석 상태 Chip
  const getLlmAnalysisStatusChip = (docId) => {
    const llmState = llmAnalysisStates[docId];
    if (!llmState) {
      return <Chip label="로딩 중" size="small" color="default" />;
    }

    const statusMap = {
      not_started: {
        label: 'LLM_STATUS_NOT_STARTED',
        icon: <PendingIcon fontSize="small" />,
        color: 'default',
      },
      processing: {
        label: 'LLM_STATUS_PROCESSING',
        icon: <CircularProgress size={14} />,
        color: 'primary',
      },
      paused: {
        label: 'LLM_STATUS_PAUSED',
        icon: <PauseIcon fontSize="small" />,
        color: 'warning',
      },
      completed: {
        label: 'LLM_STATUS_COMPLETED',
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'success',
      },
      cancelled: {
        label: 'LLM_STATUS_CANCELLED',
        icon: <StopIcon fontSize="small" />,
        color: 'default',
      },
      error: {
        label: 'LLM_STATUS_FAILED',
        icon: <ErrorIcon fontSize="small" />,
        color: 'error',
      },
    };

    const statusInfo = statusMap[llmState.status] || statusMap.not_started;
    return (
      <Chip
        label={statusInfo.label}
        size="small"
        color={statusInfo.color}
        icon={statusInfo.icon}
      />
    );
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 50) return 'primary';
    return 'warning';
  };

  if (state.loading && state.documents.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          {t('rag.document.loading', '문서 목록을 불러오는 중...')}
        </Typography>
      </Paper>
    );
  }

  if (localError && state.documents.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => setLocalError(null)}>
          {localError}
        </Alert>
      </Paper>
    );
  }

  // ICT-388: 문서명 기준으로 일반 문서와 TestCase 분리
  const regularDocuments = state.documents.filter(doc => !doc.fileName?.startsWith('testcase_'));
  const testCaseDocuments = state.documents.filter(doc => doc.fileName?.startsWith('testcase_'));

  if (state.documents.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          {t('rag.document.empty', '업로드된 문서가 없습니다')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('rag.document.emptyDescription', '문서 업로드 버튼을 사용하여 파일을 추가하세요')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{ mt: 2 }}
          onClick={handleUploadDialogOpen}
        >
          {t('rag.document.list.uploadButton', '문서 업로드')}
        </Button>

        <Dialog
          open={uploadDialogOpen}
          onClose={handleUploadDialogClose}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle>{t('rag.upload.title', '문서 업로드')}</DialogTitle>
          <DialogContent dividers>
            <DocumentUpload
              projectId={projectId}
              onUploadSuccess={handleUploadSuccess}
              embedded
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleUploadDialogClose}>
              {t('common.close', '닫기')}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    );
  }

  const renderDocumentTable = (documents, title) => {
    if (documents.length === 0) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {title} ({documents.length})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="50px" />
                <TableCell>{t('rag.document.list.fileName', '파일명')}</TableCell>
                <TableCell>{t('rag.document.list.fileSize', '크기')}</TableCell>
                <TableCell>{t('rag.document.list.status', '상태')}</TableCell>
                <TableCell>{t('rag.document.list.parser', '파서')}</TableCell>
                <TableCell>{t('rag.document.list.embeddingStatus', '임베딩')}</TableCell>
                <TableCell>{t('rag.document.list.chunks', '청크 수')}</TableCell>
                <TableCell>{t('rag.document.list.llmSummaryStatus', 'LLM 요약 상태')}</TableCell>
                <TableCell align="center">{t('rag.document.list.summaryProgress', '요약 진행율')}</TableCell>
                <TableCell>{t('rag.document.list.analyzedChunks', '분석 청크')}</TableCell>
                <TableCell>{t('rag.document.list.uploadDate', '업로드 일시')}</TableCell>
                <TableCell align="center">{t('rag.document.list.actions', '작업')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((doc) => {
                const llmState = llmAnalysisStates[doc.id];
                const isExpanded = expandedRows[doc.id];
                const hasAnalysisData = llmState && llmState.status !== 'not_started';

                return (
                  <React.Fragment key={doc.id}>
                    <TableRow hover>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleRowExpand(doc.id)}
                        disabled={!hasAnalysisData}
                      >
                        {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon color="primary" fontSize="small" />
                        {doc.fileName}
                      </Box>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>{getStatusChip(doc.analysisStatus)}</TableCell>
                    <TableCell>{getParserLabel(doc)}</TableCell>
                    <TableCell>{getEmbeddingStatusChip(doc)}</TableCell>
                    <TableCell>{doc.totalChunks || 0}</TableCell>
                    <TableCell>{getLlmAnalysisStatusChip(doc.id)}</TableCell>
                    <TableCell align="center">
                      {llmState && llmState.status !== 'not_started' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <CircularProgress
                            variant="determinate"
                            value={llmState.progress}
                            size={32}
                            color={getProgressColor(llmState.progress)}
                          />
                          <Typography variant="caption">{llmState.progress}%</Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {llmState && llmState.status !== 'not_started' ? (
                        <Chip
                          label={`${llmState.analyzedChunks} / ${llmState.totalChunks}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                    <TableCell align="center">
                    {doc.fileName?.toLowerCase().endsWith('.pdf') && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handlePreviewClick(doc)}
                        title={t('rag.document.preview', 'PDF 미리보기')}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => onViewChunks(doc)}
                      title={t('rag.document.viewChunks', '청크 보기')}
                      disabled={!doc.totalChunks || doc.totalChunks === 0}
                    >
                      <ViewListIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => handleDownloadClick(doc.id, doc.fileName)}
                      title={t('rag.document.download', '문서 다운로드')}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleAnalyzeClick(doc)}
                      title={t('rag.document.analyze', '문서 분석')}
                      disabled={doc.analysisStatus === 'completed' || doc.analysisStatus === 'processing'}
                    >
                      <AnalyticsIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleGenerateEmbeddingsClick(doc)}
                      title={t('rag.document.generateEmbedding', '임베딩 생성')}
                      disabled={doc.analysisStatus !== 'completed' || doc.metaData?.embedding_status === 'completed' || doc.metaData?.embedding_status === 'processing'}
                    >
                      <AutoAwesomeIcon fontSize="small" />
                    </IconButton>
                    {onLlmAnalysis && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onLlmAnalysis(doc)}
                        title={t('rag.document.llmAnalysis', 'LLM 분석')}
                        disabled={!doc.totalChunks || doc.totalChunks === 0}
                      >
                        <PsychologyIcon fontSize="small" />
                      </IconButton>
                    )}
                    {llmState && (llmState.status === 'completed' || llmState.status === 'processing' || llmState.status === 'paused') && (
                      <Tooltip title="LLM 분석 요약 보기">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleViewSummary(doc)}
                          disabled={!llmState.analyzedChunks || llmState.analyzedChunks === 0}
                        >
                          <SummarizeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="작업 이력 보기">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handleViewJobHistory(doc)}
                      >
                        <HistoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {isAdmin ? (
                      <Tooltip title={t('rag.document.global.promoteAction', '공통 문서로 이동')}>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => openPromoteDialog(doc)}
                        >
                          <PublicIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title={t('rag.document.global.requestAction', '공통 문서 등록 요청')}>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => openRequestDialog(doc)}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(doc.id)}
                      title={t('rag.document.delete', '문서 삭제')}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>

                {/* 확장된 행: LLM 분석 작업 상세 정보 */}
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          LLM 분석 작업 상세 정보
                        </Typography>
                        {hasAnalysisData ? (
                          <Box>
                            {/* 작업 정보 그리드 */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">LLM 제공자</Typography>
                                <Typography variant="body2">{llmState.llmProvider || '-'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">LLM 모델</Typography>
                                <Typography variant="body2">{llmState.llmModel || '-'}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">비용 (USD)</Typography>
                                <Typography variant="body2" color="primary.main" fontWeight="bold">
                                  ${(llmState.totalCostUsd || 0).toFixed(4)}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">총 토큰</Typography>
                                <Typography variant="body2">{(llmState.totalTokens || 0).toLocaleString()}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">시작 시각</Typography>
                                <Typography variant="body2">{formatDateFromISO(llmState.startedAt)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">완료 시각</Typography>
                                <Typography variant="body2">{formatDateFromISO(llmState.completedAt)}</Typography>
                              </Box>
                            </Box>

                            {/* 진행률 바 */}
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">진행률</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {llmState.analyzedChunks} / {llmState.totalChunks} 청크 ({llmState.progress}%)
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={llmState.progress}
                                color={getProgressColor(llmState.progress)}
                                sx={{ height: 8, borderRadius: 1 }}
                              />
                            </Box>

                            {/* 에러 메시지 */}
                            {llmState.errorMessage && (
                              <Alert severity="error" sx={{ mb: 2 }}>
                                {llmState.errorMessage}
                              </Alert>
                            )}

                            {/* 작업 제어 버튼 */}
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {llmState.status === 'processing' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  startIcon={<PauseIcon />}
                                  onClick={() => handlePauseJob(doc.id)}
                                >
                                  일시정지
                                </Button>
                              )}
                              {llmState.status === 'paused' && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  startIcon={<PlayArrowIcon />}
                                  onClick={() => handleResumeJob(doc.id)}
                                >
                                  재개
                                </Button>
                              )}
                              {(llmState.status === 'processing' || llmState.status === 'paused') && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<StopIcon />}
                                  onClick={() => handleCancelJob(doc.id, doc.fileName)}
                                >
                                  취소
                                </Button>
                              )}
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            LLM 분석 작업 정보가 없습니다.
                          </Typography>
                        )}
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <>
      <Paper elevation={5} className="glass-border" sx={{ p: 3 }}>
        {/* Local Error Alert */}
        {localError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>
            {localError}
          </Alert>
        )}
        {statusNotice && (
          <Alert
            severity={statusNotice.severity}
            sx={{ mb: 2 }}
            onClose={() => setStatusNotice(null)}
          >
            {statusNotice.message}
          </Alert>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Typography variant="h3" className="gradient-heading text-grotesque">
            {t('rag.document.list.title', '문서 목록')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isRefreshing || state.loading}
            >
              {t('rag.document.list.refreshButton', '새로고침')}
            </Button>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={handleUploadDialogOpen}
            >
              {t('rag.document.list.uploadButton', '문서 업로드')}
            </Button>
          </Box>
        </Box>

        {/* ICT-388: 탭으로 문서 분류 (테스트케이스 탭은 숨김) */}
        <Tabs
          value={SHOW_TEST_CASE_DOCUMENT_TAB ? tabValue : 0}
          onChange={SHOW_TEST_CASE_DOCUMENT_TAB ? handleTabChange : undefined}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab
            label={`${t('rag.document.list.regularDocuments', '업로드된 문서')} (${regularDocuments.length})`}
          />
          {SHOW_TEST_CASE_DOCUMENT_TAB && (
            <Tab
              label={`${t('rag.document.list.testCaseDocuments', '테스트케이스 문서')} (${testCaseDocuments.length})`}
            />
          )}
        </Tabs>

        {/* 탭 0: 일반 문서 */}
        {(!SHOW_TEST_CASE_DOCUMENT_TAB || tabValue === 0) && renderDocumentTable(
          regularDocuments,
          t('rag.document.list.regularDocuments', '업로드된 문서')
        )}

        {/* 탭 1: TestCase 문서 (숨김) */}
        {SHOW_TEST_CASE_DOCUMENT_TAB && tabValue === 1 && renderDocumentTable(
          testCaseDocuments,
          t('rag.document.list.testCaseDocuments', '테스트케이스 문서')
        )}

        <TablePagination
          component="div"
          count={state.pagination.total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage={t('rag.document.pagination.rowsPerPage', '페이지당 행 수:')}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {t('rag.document.deleteDialog.title', '문서 삭제 확인')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {t('rag.document.deleteDialog.message', '이 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            {t('common.cancel', '취소')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            {t('common.delete', '삭제')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={promoteDialogState.open}
        onClose={closePromoteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('rag.document.global.promoteTitle', '공통 문서로 이동')}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t('rag.document.global.promoteDescription', '선택한 문서를 모든 프로젝트에서 참조할 수 있는 공통 RAG 문서로 이동합니다.')}
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {promoteDialogState.document?.fileName}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label={t('rag.document.global.promoteReason', '이동 사유 (선택)')}
            value={promoteDialogState.reason}
            onChange={(e) => setPromoteDialogState(prev => ({ ...prev, reason: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closePromoteDialog}>
            {t('common.cancel', '취소')}
          </Button>
          <Button
            onClick={handlePromoteSubmit}
            variant="contained"
            color="primary"
            disabled={promoteSubmitting}
          >
            {promoteSubmitting ? t('common.processing', '처리 중...') : t('rag.document.global.promoteAction', '공통 문서로 이동')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={requestDialogState.open}
        onClose={closeRequestDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('rag.document.global.requestTitle', '공통 문서 등록 요청')}</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t('rag.document.global.requestDescription', '관리자에게 이 문서를 공통 RAG 문서로 등록해달라고 요청합니다.')}
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {requestDialogState.document?.fileName}
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label={t('rag.document.global.requestMessage', '추가 메시지 (선택)')}
            value={requestDialogState.message}
            onChange={(e) => setRequestDialogState(prev => ({ ...prev, message: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeRequestDialog}>
            {t('common.cancel', '취소')}
          </Button>
          <Button
            onClick={handleRequestSubmit}
            variant="contained"
            color="primary"
            disabled={requestSubmitting}
          >
            {requestSubmitting ? t('common.processing', '처리 중...') : t('rag.document.global.requestAction', '공통 문서 등록 요청')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={uploadDialogOpen}
        onClose={handleUploadDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{t('rag.upload.title', '문서 업로드')}</DialogTitle>
        <DialogContent dividers>
          <DocumentUpload
            projectId={projectId}
            onUploadSuccess={handleUploadSuccess}
            embedded
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose}>
            {t('common.close', '닫기')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* PDF 미리보기 다이얼로그 */}
      <Dialog
        open={previewDialogOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PictureAsPdfIcon color="error" />
            <Typography variant="h6">{previewDocument?.fileName}</Typography>
          </Box>
          <IconButton onClick={handleClosePreview} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
          {loadingPreview ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                {t('rag.preview.loading', 'PDF를 불러오는 중...')}
              </Typography>
            </Box>
          ) : previewContent?.type === 'pdf' ? (
            <Box sx={{ width: '100%', height: '70vh' }}>
              <embed
                src={previewContent.url}
                type="application/pdf"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
              />
            </Box>
          ) : previewContent?.type === 'error' ? (
            <Alert severity="error" sx={{ width: '100%' }}>
              {previewContent.message}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>{t('common.close', '닫기')}</Button>
        </DialogActions>
      </Dialog>

      {/* LLM 분석 요약 보기 다이얼로그 */}
      <Dialog
        open={summaryDialogOpen}
        onClose={handleCloseSummary}
        maxWidth="lg"
        fullWidth
        fullScreen={isFullScreen}
        PaperProps={{
          className: 'glass-surface',
          elevation: 5,
        }}
      >
        <DialogTitle
          className="gradient-heading text-grotesque"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid rgba(6, 182, 212, 0.3)',
            pb: 2,
          }}
        >
          <Typography variant="h4" className="gradient-heading text-grotesque">
            LLM 분석 요약 - {selectedSummary?.documentName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isFullScreen ? "전체화면 종료" : "전체화면"}>
              <IconButton
                onClick={() => setIsFullScreen(!isFullScreen)}
                size="small"
                color="primary"
              >
                {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleCloseSummary} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSummary ? (
            <Box>
              {/* 메타 정보 */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Chip
                  label={`총 ${selectedSummary.totalChunks}개 청크`}
                  size="small"
                  color="primary"
                />
                <Chip
                  label={`분석 완료: ${selectedSummary.analyzedChunks}개`}
                  size="small"
                  color="success"
                />
                <Chip
                  label={`진행률: ${selectedSummary.progress}%`}
                  size="small"
                  color={getProgressColor(selectedSummary.progress)}
                />
              </Box>

              {/* 통합 요약 내용 */}
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  LLM 분석 결과 요약
                </Typography>
                {loadingSummary ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : selectedSummary.status === 'not_started' ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {t('rag.llmAnalysis.status.notStartedMessage')}
                  </Alert>
                ) : selectedSummary.status === 'error' ? (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {t('rag.llmAnalysis.status.errorMessage')}
                  </Alert>
                ) : selectedSummary.status === 'processing' || selectedSummary.status === 'paused' ? (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {t('rag.llmAnalysis.status.processingPausedMessage', { analyzedChunks: selectedSummary.analyzedChunks })}
                  </Alert>
                ) : null}
                {summaryContent && (
                  <Box
                    data-color-mode="light"
                    className="glass-surface shadow-glass-medium"
                    sx={{
                      mt: 2,
                      border: '2px solid',
                      borderColor: 'rgba(6, 182, 212, 0.3)',
                      borderRadius: 3,
                      maxHeight: isFullScreen ? 'calc(100vh - 250px)' : '600px',
                      overflow: 'auto',
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(18px) saturate(170%)',
                      '& .wmde-markdown': {
                        p: 3,
                        bgcolor: 'transparent',
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        color: '#1E293B',
                      },
                      '& .wmde-markdown h1': {
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontSize: '2.5rem',
                        fontWeight: 800,
                        mt: 2,
                        mb: 1.5,
                        borderBottom: '3px solid rgba(6, 182, 212, 0.5)',
                        pb: 1,
                        background: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      },
                      '& .wmde-markdown h2': {
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontSize: '2rem',
                        fontWeight: 700,
                        mt: 2,
                        mb: 1,
                        background: 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      },
                      '& .wmde-markdown h3': {
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        mt: 1.5,
                        mb: 0.75,
                        color: '#06B6D4',
                        borderLeft: '4px solid rgba(6, 182, 212, 0.5)',
                        paddingLeft: '12px',
                      },
                      '& .wmde-markdown p': {
                        mb: 1,
                        mt: 0,
                        lineHeight: 1.7,
                        fontSize: '1rem',
                        color: '#1E293B',
                      },
                      '& .wmde-markdown ul, & .wmde-markdown ol': {
                        pl: 4,
                        mb: 1,
                        mt: 0,
                      },
                      '& .wmde-markdown li': {
                        mb: 0.5,
                        color: '#1E293B',
                      },
                      '& .wmde-markdown code': {
                        fontFamily: "'JetBrains Mono', monospace",
                        bgcolor: 'rgba(6, 182, 212, 0.1)',
                        color: '#0891B2',
                        px: 0.75,
                        py: 0.5,
                        borderRadius: 0.5,
                        fontSize: '0.875rem',
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                      },
                      '& .wmde-markdown pre': {
                        fontFamily: "'JetBrains Mono', monospace",
                        bgcolor: '#1E293B',
                        color: '#F8FAFC',
                        p: 2,
                        borderRadius: 2,
                        overflow: 'auto',
                        mb: 1.5,
                        mt: 1,
                        border: '2px solid rgba(6, 182, 212, 0.3)',
                        boxShadow: '0 8px 32px 0 rgba(6, 182, 212, 0.1)',
                      },
                      '& .wmde-markdown blockquote': {
                        borderLeft: '4px solid rgba(6, 182, 212, 0.5)',
                        pl: 2.5,
                        py: 1,
                        ml: 0,
                        my: 1,
                        bgcolor: 'rgba(6, 182, 212, 0.05)',
                        fontStyle: 'italic',
                        color: '#64748B',
                        borderRadius: '0 12px 12px 0',
                      },
                      '& .wmde-markdown table': {
                        borderCollapse: 'collapse',
                        width: '100%',
                        mb: 1.5,
                        mt: 1,
                        boxShadow: '0 8px 32px 0 rgba(6, 182, 212, 0.1)',
                      },
                      '& .wmde-markdown th, & .wmde-markdown td': {
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        p: 1,
                        fontSize: '0.9rem',
                      },
                      '& .wmde-markdown th': {
                        bgcolor: 'rgba(6, 182, 212, 0.1)',
                        fontWeight: 600,
                        color: '#1E293B',
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                      },
                      '& .wmde-markdown hr': {
                        my: 2,
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.5) 50%, transparent 100%)',
                        border: 'none',
                        boxShadow: '0 2px 4px rgba(6, 182, 212, 0.2)',
                      },
                    }}
                  >
                    <MDEditor.Markdown
                      source={summaryContent}
                      style={{ whiteSpace: 'pre-wrap' }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSummary}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 작업 이력 다이얼로그 */}
      <Dialog
        open={jobHistoryDialogOpen}
        onClose={handleCloseJobHistory}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="info" />
            <Typography variant="h6">
              작업 이력 - {selectedJobHistory?.fileName}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseJobHistory} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loadingJobHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : selectedJobHistory?.jobs && selectedJobHistory.jobs.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>작업 ID</TableCell>
                    <TableCell>LLM 제공자</TableCell>
                    <TableCell>LLM 모델</TableCell>
                    <TableCell>상태</TableCell>
                    <TableCell align="center">진행률</TableCell>
                    <TableCell>청크</TableCell>
                    <TableCell align="right">비용 (USD)</TableCell>
                    <TableCell align="right">토큰</TableCell>
                    <TableCell>시작 시각</TableCell>
                    <TableCell>완료 시각</TableCell>
                    <TableCell>일시정지 시각</TableCell>
                    <TableCell>에러 메시지</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedJobHistory.jobs.map((job) => (
                    <TableRow key={job.jobId} hover>
                      <TableCell>
                        <Typography variant="caption" fontFamily="monospace">
                          {job.jobId?.toString().substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.llmProvider || '-'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{job.llmModel || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={job.status}
                          size="small"
                          color={
                            job.status === 'completed' ? 'success' :
                            job.status === 'processing' ? 'primary' :
                            job.status === 'paused' ? 'warning' :
                            job.status === 'cancelled' ? 'default' :
                            job.status === 'error' ? 'error' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <CircularProgress
                            variant="determinate"
                            value={job.percentage || 0}
                            size={28}
                            color={getProgressColor(job.percentage || 0)}
                          />
                          <Typography variant="caption">{Math.round(job.percentage || 0)}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${job.processedChunks || 0} / ${job.totalChunks || 0}`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="primary.main" fontWeight="bold">
                          ${(job.totalCostUsd || 0).toFixed(4)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {(job.totalTokens || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDateArray(job.startedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDateArray(job.completedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {formatDateArray(job.pausedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {job.errorMessage ? (
                          <Tooltip title={job.errorMessage}>
                            <Chip
                              label="에러 있음"
                              size="small"
                              color="error"
                              icon={<ErrorIcon />}
                            />
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              이 문서에 대한 작업 이력이 없습니다.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJobHistory}>닫기</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

DocumentList.propTypes = {
  projectId: PropTypes.string.isRequired,
  onViewChunks: PropTypes.func.isRequired,
  onLlmAnalysis: PropTypes.func,
};

export default DocumentList;
