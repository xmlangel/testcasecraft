import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Tooltip,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  History as HistoryIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import { LlmConfigProvider, useLlmConfig } from '../../context/LlmConfigContext';
import { useI18n } from '../../context/I18nContext';
import { useRAG, GLOBAL_RAG_PROJECT_ID } from '../../context/RAGContext.jsx';
import DocumentTableSection from '../RAG/DocumentTableSection.jsx';
import DocumentPreviewDialog from '../RAG/DocumentPreviewDialog.jsx';
import DocumentChunks from '../RAG/DocumentChunks.jsx';
import DocumentAnalysis from '../RAG/DocumentAnalysis.jsx';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_CONFIG } from '../../utils/apiConstants.js';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// 기본 테스트 케이스 템플릿
const DEFAULT_TEST_CASE_TEMPLATE = `{
  "name": "사용자 로그인 테스트",
  "description": "정상 사용자 ID/비밀번호 입력 시 로그인 성공",
  "priority": "High",
  "tags": ["인증", "로그인", "P1"],
  "preCondition": "테스트 환경에 로그인 화면이 배포되어 있고, 테스트 DB에 test.user@example.com 계정이 존재해야 함",
  "steps": [
    {
      "stepNumber": 1,
      "description": "로그인 URL에 접속",
      "expectedResult": "로그인 폼이 표시됨"
    },
    {
      "stepNumber": 2,
      "description": "이메일에 test.user@example.com 입력",
      "expectedResult": "입력값이 표시됨"
    },
    {
      "stepNumber": 3,
      "description": "비밀번호에 Password123! 입력",
      "expectedResult": "마스킹되어 표시됨"
    },
    {
      "stepNumber": 4,
      "description": "로그인 버튼 클릭",
      "expectedResult": "대시보드로 이동되고 환영 메시지 표시됨"
    }
  ],
  "expectedResults": "사용자가 정상적으로 인증되고 대시보드에 접근할 수 있어야 함"
}`;

const SUMMARY_PAGE_SIZE = 10;

const LlmConfigManagementContent = () => {
  const { t } = useI18n();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    configs,
    loading,
    error,
    fetchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    setDefaultConfig,
    testConnection,
    testUnsavedSettings,
    toggleActive
  } = useLlmConfig();

  // RAG 함수들 (공통 문서 작업용)
  const {
    analyzeDocument,
    generateEmbeddings,
    downloadDocument,
    fetchDocumentBlob,
    listDocuments,
    listGlobalDocumentRequests,
    approveGlobalDocumentRequest,
    rejectGlobalDocumentRequest,
    getLlmAnalysisStatus,
    getLlmAnalysisResults,
    listLlmAnalysisJobs
  } = useRAG();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'OPENWEBUI',
    apiUrl: '',
    apiKey: '',
    modelName: '',
    isDefault: false,
    testCaseTemplate: DEFAULT_TEST_CASE_TEMPLATE
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testingDialog, setTestingDialog] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [globalDocuments, setGlobalDocuments] = useState([]);
  const [loadingGlobalDocs, setLoadingGlobalDocs] = useState(false);
  const [uploadingGlobalDoc, setUploadingGlobalDoc] = useState(false);
  const [globalDocRequests, setGlobalDocRequests] = useState([]);
  const [loadingGlobalDocRequests, setLoadingGlobalDocRequests] = useState(false);

  // 공통 미리보기/청크 다이얼로그 상태
  const [previewDialogState, setPreviewDialogState] = useState({ open: false, document: null });
  const [chunksDialogState, setChunksDialogState] = useState({ open: false, document: null });
  const [analysisDialogState, setAnalysisDialogState] = useState({ open: false, document: null });
  const [llmAnalysisStates, setLlmAnalysisStates] = useState({});
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [summaryContent, setSummaryContent] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryPage, setSummaryPage] = useState(0);
  const [summaryTotal, setSummaryTotal] = useState(0);
  const [summaryHasMore, setSummaryHasMore] = useState(false);
  const [summaryRange, setSummaryRange] = useState({ from: 0, to: 0 });
  const [isSummaryFullScreen, setIsSummaryFullScreen] = useState(false);
  const [jobHistoryDialogOpen, setJobHistoryDialogOpen] = useState(false);
  const [selectedJobHistory, setSelectedJobHistory] = useState(null);
  const [loadingJobHistory, setLoadingJobHistory] = useState(false);
  const [globalDocError, setGlobalDocError] = useState('');

  // LLM 분석 템플릿 상태
  const [llmTemplate, setLlmTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(false);

  // getAuthHeaders 제거 - axiosInstance의 interceptor가 자동으로 토큰 추가

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleOpenDialog = (config = null) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        provider: config.provider,
        apiUrl: config.apiUrl,
        apiKey: '', // API Key는 수정 시 비워둠 (선택적 업데이트)
        modelName: config.modelName,
        isDefault: config.isDefault,
        testCaseTemplate: config.testCaseTemplate || DEFAULT_TEST_CASE_TEMPLATE
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        provider: 'OPENWEBUI',
        apiUrl: '',
        apiKey: '',
        modelName: '',
        isDefault: false,
        testCaseTemplate: DEFAULT_TEST_CASE_TEMPLATE
      });
    }
    setDialogOpen(true);
    setShowApiKey(false);
    setTestResult(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConfig(null);
    setFormData({
      name: '',
      provider: 'OPENWEBUI',
      apiUrl: '',
      apiKey: '',
      modelName: '',
      isDefault: false,
      testCaseTemplate: DEFAULT_TEST_CASE_TEMPLATE
    });
    setShowApiKey(false);
    setTestResult(null);
  };

  const handleTestDialogSettings = async () => {
    // 필수 필드 검증
    if (!formData.provider || !formData.apiUrl || !formData.apiKey || !formData.modelName) {
      setTestResult({ success: false, message: t('admin.llmConfig.message.allFieldsRequired', '모든 필수 필드를 입력해주세요') });
      return;
    }

    setTestingDialog(true);
    setTestResult(null);
    try {
      await testUnsavedSettings(formData);
      setTestResult({ success: true, message: t('admin.llmConfig.message.connectionSuccess', '연결 테스트 성공!') });
    } catch (err) {
      setTestResult({ success: false, message: err.message || t('admin.llmConfig.message.connectionFailed', '연결 테스트 실패') });
    } finally {
      setTestingDialog(false);
    }
  };

  // 템플릿 초기화
  const handleResetTemplate = () => {
    setFormData({ ...formData, testCaseTemplate: DEFAULT_TEST_CASE_TEMPLATE });
  };

  // 템플릿 JSON 다운로드
  const handleDownloadTemplate = () => {
    try {
      // JSON 유효성 검증
      JSON.parse(formData.testCaseTemplate);

      const blob = new Blob([formData.testCaseTemplate], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'test-case-template.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(t('admin.llmConfig.message.invalidJson', '템플릿이 유효한 JSON 형식이 아닙니다') + ': ' + error.message);
    }
  };

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

  const fetchSummaryPage = useCallback(async (doc, page = 0) => {
    if (!doc) return;
    setLoadingSummary(true);
    const offset = page * SUMMARY_PAGE_SIZE;
    try {
      const response = await getLlmAnalysisResults(doc.id, offset, SUMMARY_PAGE_SIZE);
      const results = response?.results || [];
      if (results.length > 0) {
        setSummaryContent(buildSummaryMarkdown(results));
      } else {
        setSummaryContent(null);
      }

      const llmState = llmAnalysisStates[doc.id];
      const totalFromResponse = response?.total;
      const fallbackTotal = llmState?.analyzedChunks || doc.totalChunks || (offset + results.length);
      const computedTotal = totalFromResponse ?? fallbackTotal ?? 0;
      setSummaryTotal(computedTotal);
      setSummaryHasMore(
        totalFromResponse != null
          ? offset + results.length < totalFromResponse
          : results.length === SUMMARY_PAGE_SIZE
      );
      setSummaryRange(
        results.length > 0
          ? { from: offset + 1, to: offset + results.length }
          : { from: 0, to: 0 }
      );
    } catch (err) {
      console.error('Failed to fetch LLM summary for global doc:', err);
      setSummaryContent(t('admin.globalDoc.summary.fetchFailed', '분석 결과 조회에 실패했습니다.'));
      setSummaryHasMore(false);
      setSummaryRange({ from: 0, to: 0 });
    } finally {
      setLoadingSummary(false);
    }
  }, [getLlmAnalysisResults, buildSummaryMarkdown, llmAnalysisStates, t]);

  const formatDateArray = (dateArray) => {
    if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) return '-';
    try {
      const [year, month, day, hour = 0, minute = 0] = dateArray;
      const date = new Date(year, month - 1, day, hour, minute);
      if (Number.isNaN(date.getTime())) {
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

  const getProgressColor = (progress = 0) => {
    if (progress >= 100) return 'success';
    if (progress >= 50) return 'primary';
    return 'warning';
  };

  const summaryPaginationLabel = summaryRange.from > 0
    ? `${summaryRange.from}-${summaryRange.to}${summaryTotal ? ` / ${summaryTotal}` : ''}`
    : t('rag.document.summary.noData', '표시할 결과가 없습니다.');
  const canGoPrevSummary = summaryPage > 0;
  const canGoNextSummary = summaryHasMore
    || (summaryTotal ? (summaryPage + 1) * SUMMARY_PAGE_SIZE < summaryTotal : false);

  const summaryMarkdownStyles = useMemo(() => {
    const isDarkMode = theme.palette.mode === 'dark';
    const baseTextColor = isDarkMode ? theme.palette.grey[100] : '#1E293B';
    const headingGradient = isDarkMode
      ? 'linear-gradient(135deg, #67E8F9 0%, #C084FC 100%)'
      : 'linear-gradient(135deg, #06B6D4 0%, #0EA5E9 100%)';

    return {
      mt: 2,
      border: '2px solid',
      borderColor: isDarkMode ? 'rgba(148, 163, 184, 0.35)' : 'rgba(6, 182, 212, 0.3)',
      borderRadius: 3,
      maxHeight: isSummaryFullScreen ? 'calc(100vh - 250px)' : '600px',
      overflow: 'auto',
      background: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(18px) saturate(170%)',
      '& .wmde-markdown': {
        p: 3,
        bgcolor: 'transparent',
        fontFamily: "'Bricolage Grotesque', sans-serif",
        color: baseTextColor,
      },
      '& .wmde-markdown h1': {
        fontFamily: "'Bricolage Grotesque', sans-serif",
        fontSize: '2.5rem',
        fontWeight: 800,
        mt: 2,
        mb: 1.5,
        borderBottom: `3px solid ${isDarkMode ? 'rgba(103, 232, 249, 0.5)' : 'rgba(6, 182, 212, 0.5)'}`,
        pb: 1,
        background: headingGradient,
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
        background: headingGradient,
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
        color: isDarkMode ? '#67E8F9' : '#06B6D4',
        borderLeft: `4px solid ${isDarkMode ? 'rgba(103, 232, 249, 0.5)' : 'rgba(6, 182, 212, 0.5)'}`,
        paddingLeft: '12px',
      },
      '& .wmde-markdown p': {
        mb: 1,
        mt: 0,
        lineHeight: 1.7,
        fontSize: '1rem',
        color: baseTextColor,
      },
      '& .wmde-markdown ul, & .wmde-markdown ol': {
        pl: 4,
        mb: 1,
        mt: 0,
      },
      '& .wmde-markdown li': {
        mb: 0.5,
        color: baseTextColor,
      },
      '& .wmde-markdown code': {
        fontFamily: "'JetBrains Mono', monospace",
        bgcolor: isDarkMode ? 'rgba(103, 232, 249, 0.15)' : 'rgba(6, 182, 212, 0.1)',
        color: isDarkMode ? '#67E8F9' : '#0891B2',
        px: 0.75,
        py: 0.5,
        borderRadius: 0.5,
        fontSize: '0.875rem',
        border: `1px solid ${isDarkMode ? 'rgba(103, 232, 249, 0.25)' : 'rgba(6, 182, 212, 0.2)'}`,
      },
      '& .wmde-markdown pre': {
        fontFamily: "'JetBrains Mono', monospace",
        bgcolor: isDarkMode ? '#0F172A' : '#1E293B',
        color: isDarkMode ? theme.palette.grey[100] : '#F8FAFC',
        p: 2,
        borderRadius: 2,
        overflow: 'auto',
        mb: 1.5,
        mt: 1,
        border: `2px solid ${isDarkMode ? 'rgba(103, 232, 249, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
        boxShadow: '0 8px 32px 0 rgba(6, 182, 212, 0.1)',
      },
      '& .wmde-markdown blockquote': {
        borderLeft: `4px solid ${isDarkMode ? 'rgba(103, 232, 249, 0.5)' : 'rgba(6, 182, 212, 0.5)'}`,
        pl: 2.5,
        py: 1,
        ml: 0,
        my: 1,
        bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(6, 182, 212, 0.05)',
        fontStyle: 'italic',
        color: isDarkMode ? theme.palette.grey[300] : '#64748B',
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
        border: `1px solid ${isDarkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(226, 232, 240, 0.8)'}`,
        p: 1,
        fontSize: '0.9rem',
      },
      '& .wmde-markdown th': {
        bgcolor: isDarkMode ? 'rgba(30, 64, 175, 0.3)' : 'rgba(6, 182, 212, 0.1)',
        fontWeight: 600,
        color: baseTextColor,
        fontFamily: "'Bricolage Grotesque', sans-serif",
      },
      '& .wmde-markdown hr': {
        my: 2,
        height: '3px',
        background: headingGradient,
        border: 'none',
        boxShadow: '0 2px 4px rgba(6, 182, 212, 0.2)',
      },
    };
  }, [theme, isSummaryFullScreen]);

  const handleSubmit = async () => {
    try {
      if (editingConfig) {
        await updateConfig(editingConfig.id, formData);
        setSuccessMessage(t('admin.llmConfig.message.updated', 'LLM 설정이 수정되었습니다'));
      } else {
        await createConfig(formData);
        setSuccessMessage(t('admin.llmConfig.message.created', 'LLM 설정이 생성되었습니다'));
      }
      handleCloseDialog();
    } catch (err) {
      // 에러는 Context에서 처리됨
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.llmConfig.message.confirmDelete', '정말 이 LLM 설정을 삭제하시겠습니까?'))) {
      try {
        await deleteConfig(id);
        setSuccessMessage(t('admin.llmConfig.message.deleted', 'LLM 설정이 삭제되었습니다'));
      } catch (err) {
        // 에러는 Context에서 처리됨
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultConfig(id);
      setSuccessMessage(t('admin.llmConfig.message.defaultChanged', '기본 LLM 설정이 변경되었습니다'));
    } catch (err) {
      // 에러는 Context에서 처리됨
    }
  };

  const handleTestConnection = async (id) => {
    setTestingId(id);
    try {
      await testConnection(id);
      setSuccessMessage(t('admin.llmConfig.message.connectionSuccess', '연결 테스트 성공!'));
    } catch (err) {
      // 에러는 Context에서 처리됨
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleActive(id);
      setSuccessMessage(t('admin.llmConfig.message.activeChanged', 'LLM 설정 활성 상태가 변경되었습니다'));
    } catch (err) {
      // 에러는 Context에서 처리됨
    }
  };

  const loadGlobalLlmAnalysisStates = useCallback(async (documents) => {
    if (!documents || documents.length === 0) {
      setLlmAnalysisStates({});
      return;
    }

    const newStates = {};
    await Promise.all(
      documents.map(async (doc) => {
        try {
          const status = await getLlmAnalysisStatus(doc.id);
          const totalChunks = status.progress?.totalChunks || doc.totalChunks || 0;
          const processedChunks = status.progress?.processedChunks || 0;
          const progress = totalChunks > 0
            ? Math.round((processedChunks / totalChunks) * 100)
            : 0;

          newStates[doc.id] = {
            status: status.status || 'not_started',
            progress,
            analyzedChunks: processedChunks,
            totalChunks,
            llmProvider: status.llmProvider,
            llmModel: status.llmModel,
            totalCostUsd: status.totalCostUsd,
            totalTokens: status.totalTokens,
            startedAt: status.startedAt,
            completedAt: status.completedAt,
            errorMessage: status.errorMessage,
          };
        } catch (err) {
          if (err.response?.status === 404) {
            newStates[doc.id] = {
              status: 'not_started',
              progress: 0,
              analyzedChunks: 0,
              totalChunks: doc.totalChunks || 0,
            };
          } else {
            console.error('Failed to load LLM status for global doc:', err);
            newStates[doc.id] = {
              status: 'error',
              progress: 0,
              analyzedChunks: 0,
              totalChunks: doc.totalChunks || 0,
              errorMessage: err.message,
            };
          }
        }
      })
    );

    setLlmAnalysisStates(newStates);
  }, [getLlmAnalysisStatus]);

  // LLM 템플릿 조회
  const fetchLlmTemplate = useCallback(async () => {
    setLoadingTemplate(true);
    try {
      const response = await axiosInstance.get(`${API_CONFIG.BASE_URL}/api/llm-template`);
      setLlmTemplate(response.data);
    } catch (err) {
      console.error('Failed to fetch LLM template:', err);
    } finally {
      setLoadingTemplate(false);
    }
  }, []);

  // LLM 템플릿 업데이트
  const updateLlmTemplate = useCallback(async () => {
    setLoadingTemplate(true);
    try {
      const response = await axiosInstance.put(`${API_CONFIG.BASE_URL}/api/llm-template`, llmTemplate);
      setLlmTemplate(response.data);
      setEditingTemplate(false);
      setSuccessMessage(t('admin.llmTemplate.message.updated', 'LLM 분석 템플릿이 업데이트되었습니다'));
    } catch (err) {
      console.error('Failed to update LLM template:', err);
      alert(t('admin.llmTemplate.message.updateFailed', 'LLM 템플릿 업데이트 실패'));
    } finally {
      setLoadingTemplate(false);
    }
  }, [llmTemplate, t]);

  // 공통 문서 목록 조회 (글로벌 프로젝트 ID 사용)
  const fetchGlobalDocuments = useCallback(async () => {
    setLoadingGlobalDocs(true);
    try {
      const response = await listDocuments(GLOBAL_RAG_PROJECT_ID, 1, 100);
      const docs = response.documents || [];
      setGlobalDocuments(docs);
      await loadGlobalLlmAnalysisStates(docs);
      setGlobalDocError('');
    } catch (err) {
      console.error('Failed to fetch global documents:', err);
      setGlobalDocError(t('admin.globalDoc.message.fetchFailed', '공통 문서를 불러오지 못했습니다.'));
      setLlmAnalysisStates({});
    } finally {
      setLoadingGlobalDocs(false);
    }
  }, [listDocuments, loadGlobalLlmAnalysisStates, t]);

  const fetchGlobalDocRequests = useCallback(async () => {
    setLoadingGlobalDocRequests(true);
    try {
      const response = await listGlobalDocumentRequests('PENDING');
      // Backend returns array directly, ensure it's always an array
      setGlobalDocRequests(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Failed to fetch global document requests:', err);
      setGlobalDocRequests([]); // Set empty array on error
    } finally {
      setLoadingGlobalDocRequests(false);
    }
  }, [listGlobalDocumentRequests]);

  useEffect(() => {
    if (currentTab === 1) {
      fetchLlmTemplate();
      fetchGlobalDocuments();
      fetchGlobalDocRequests();
    }
  }, [currentTab, fetchLlmTemplate, fetchGlobalDocuments, fetchGlobalDocRequests]);

  // URL 기반 탭 동기화
  useEffect(() => {
    const path = location.pathname;
    if (path === '/llm-config/template') {
      setCurrentTab(1);
    } else if (path === '/llm-config') {
      setCurrentTab(0);
    }
  }, [location.pathname]);

  // 탭 변경 핸들러 (URL 업데이트)
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    if (newValue === 1) {
      navigate('/llm-config/template');
    } else {
      navigate('/llm-config');
    }
  };


  // 공통 문서 업로드
  const handleUploadGlobalDocument = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    if (!allowedTypes.includes(file.type)) {
      alert(t('admin.globalDoc.message.supportedFormats', '지원되는 파일 형식: PDF, DOCX, DOC, TXT'));
      return;
    }

    // 파일 크기 검증 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert(t('admin.globalDoc.message.fileSizeLimit', '파일 크기는 50MB를 초과할 수 없습니다'));
      return;
    }

    setUploadingGlobalDoc(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', 'admin');

    try {
      // 1. 파일 업로드
      const uploadResponse = await axiosInstance.post(
        `${API_CONFIG.BASE_URL}/api/rag/global-documents/upload`,
        formData
        // Content-Type은 axiosInstance가 FormData를 감지해서 자동으로 multipart/form-data; boundary=... 설정
        // Authorization 헤더는 interceptor가 자동으로 추가
      );

      const uploadedDocId = uploadResponse.data?.id;

      if (uploadedDocId) {
        try {
          // 2. 문서 분석 (기본 파서: pymupdf4llm 사용)
          await analyzeDocument(uploadedDocId, 'pymupdf4llm');

          // 3. 임베딩 생성
          await generateEmbeddings(uploadedDocId);

          setSuccessMessage(t('admin.globalDoc.message.uploadSuccess', '공통 문서 "{0}"이 업로드되고 분석 및 임베딩이 시작되었습니다').replace('{0}', file.name));
        } catch (autoProcessError) {
          console.warn('자동 분석/임베딩 실패 (문서는 업로드됨):', autoProcessError);
          setSuccessMessage(t('admin.globalDoc.message.uploadSuccess', '공통 문서 "{0}"이 업로드되었습니다. 분석과 임베딩은 수동으로 진행해주세요.').replace('{0}', file.name));
        }
      } else {
        setSuccessMessage(t('admin.globalDoc.message.uploadSuccess', '공통 문서 "{0}"이 업로드되었습니다').replace('{0}', file.name));
      }

      await fetchGlobalDocuments();

      // 파일 입력 초기화
      event.target.value = '';
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || t('admin.globalDoc.message.uploadFailed', '공통 문서 업로드 실패');
      alert(t('admin.globalDoc.message.uploadFailed', '공통 문서 업로드 실패') + ': ' + errorMessage);
    } finally {
      setUploadingGlobalDoc(false);
    }
  };

  const handleApproveRequest = async (request) => {
    const note = window.prompt(t('admin.globalDoc.requests.approveNote', '승인 메모 (선택)'), '');
    try {
      await approveGlobalDocumentRequest(request.id, note || null);
      setSuccessMessage(t('admin.globalDoc.requests.approved', '요청을 승인했습니다.'));
      await fetchGlobalDocRequests();
      await fetchGlobalDocuments();
    } catch (err) {
      console.error('Failed to approve global document request:', err);
      alert(t('admin.globalDoc.requests.approveFailed', '요청 승인에 실패했습니다.'));
    }
  };

  const handleRejectRequest = async (request) => {
    const note = window.prompt(t('admin.globalDoc.requests.rejectNote', '거절 사유 (선택)'), '');
    try {
      await rejectGlobalDocumentRequest(request.id, note || null);
      setSuccessMessage(t('admin.globalDoc.requests.rejected', '요청을 거절했습니다.'));
      await fetchGlobalDocRequests();
    } catch (err) {
      console.error('Failed to reject global document request:', err);
      alert(t('admin.globalDoc.requests.rejectFailed', '요청 거절에 실패했습니다.'));
    }
  };

  // 공통 문서 삭제 (RAG와 동일한 방식)
  const handleDeleteGlobalDocument = async (documentId, fileName) => {
    if (!window.confirm(t('admin.globalDoc.message.confirmDelete', '공통 문서 "{0}"을 삭제하시겠습니까?').replace('{0}', fileName))) {
      return;
    }

    try {
      await axiosInstance.delete(
        `${API_CONFIG.BASE_URL}/api/rag/global-documents/${documentId}`
        // Authorization 헤더는 interceptor가 자동으로 추가
      );

      setSuccessMessage(t('admin.globalDoc.message.deleteSuccess', '공통 문서 "{0}"이 삭제되었습니다').replace('{0}', fileName));
      await fetchGlobalDocuments();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || t('admin.globalDoc.message.deleteFailed', '공통 문서 삭제 실패');
      alert(t('admin.globalDoc.message.deleteFailed', '공통 문서 삭제 실패') + ': ' + errorMessage);
    }
  };

  // 문서 다운로드 핸들러
  const handleDownloadDocument = async (doc) => {
    try {
      await downloadDocument(doc.id, doc.fileName);
      setSuccessMessage(t('admin.globalDoc.message.downloadSuccess', '문서 "{0}" 다운로드 완료').replace('{0}', doc.fileName));
    } catch (err) {
      alert(t('admin.globalDoc.message.downloadFailed', '다운로드 실패') + ': ' + (err.message || t('admin.globalDoc.message.unknownError', '알 수 없는 오류')));
    }
  };

  const handleViewChunks = (doc) => {
    setChunksDialogState({ open: true, document: doc });
  };

  const handleCloseChunksDialog = () => {
    setChunksDialogState({ open: false, document: null });
  };

  const handlePreviewDocument = (doc) => {
    setPreviewDialogState({ open: true, document: doc });
  };

  const handleClosePreviewDialog = () => {
    setPreviewDialogState({ open: false, document: null });
  };

  // 문서 분석 핸들러
  const handleAnalyzeDocument = async (doc) => {
    if (!window.confirm(t('admin.globalDoc.message.confirmAnalyze', '문서 "{0}"을 분석하시겠습니까?').replace('{0}', doc.fileName))) {
      return;
    }

    try {
      await analyzeDocument(doc.id);
      setSuccessMessage(t('admin.globalDoc.message.analyzeStarted', '문서 "{0}" 분석 시작됨').replace('{0}', doc.fileName));
      await fetchGlobalDocuments();
    } catch (err) {
      alert(t('admin.globalDoc.message.analyzeFailed', '분석 시작 실패') + ': ' + (err.message || t('admin.globalDoc.message.unknownError', '알 수 없는 오류')));
    }
  };

  // 임베딩 생성 핸들러
  const handleGenerateEmbeddings = async (doc) => {
    if (!window.confirm(t('admin.globalDoc.message.confirmEmbeddings', '문서 "{0}"의 임베딩을 생성하시겠습니까?').replace('{0}', doc.fileName))) {
      return;
    }

    try {
      await generateEmbeddings(doc.id);
      setSuccessMessage(t('admin.globalDoc.message.embeddingsStarted', '문서 "{0}" 임베딩 생성 시작됨').replace('{0}', doc.fileName));
      await fetchGlobalDocuments();
    } catch (err) {
      alert(t('admin.globalDoc.message.embeddingsFailed', '임베딩 생성 실패') + ': ' + (err.message || t('admin.globalDoc.message.unknownError', '알 수 없는 오류')));
    }
  };

  const handleOpenLlmAnalysis = (doc) => {
    if (!doc) return;
    setAnalysisDialogState({ open: true, document: doc });
  };

  const handleCloseLlmAnalysis = () => {
    setAnalysisDialogState({ open: false, document: null });
  };

  const handleViewSummary = (doc) => {
    if (!doc) return;
    const llmState = llmAnalysisStates[doc.id];
    if (!llmState || llmState.status === 'not_started') {
      setGlobalDocError(t('admin.globalDoc.summary.notReady', '아직 요약을 확인할 수 없습니다.'));
      setTimeout(() => setGlobalDocError(''), 4000);
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
    setSummaryPage(0);
    setSummaryTotal(llmState.analyzedChunks || doc.totalChunks || 0);
    setSummaryHasMore(false);
    setSummaryRange({ from: 0, to: 0 });
    fetchSummaryPage(doc, 0);
  };

  const handleSummaryPageChange = (direction) => {
    if (!selectedSummary) return;
    const nextPage = direction === 'next' ? summaryPage + 1 : summaryPage - 1;
    if (nextPage < 0) return;

    const totalPages = summaryTotal ? Math.ceil(summaryTotal / SUMMARY_PAGE_SIZE) : null;
    if (direction === 'next' && totalPages && nextPage >= totalPages && !summaryHasMore) {
      return;
    }

    setSummaryPage(nextPage);
    fetchSummaryPage(
      {
        id: selectedSummary.documentId,
        fileName: selectedSummary.documentName,
        totalChunks: selectedSummary.totalChunks,
      },
      nextPage
    );
  };

  const handleCloseSummaryDialog = () => {
    setSummaryDialogOpen(false);
    setSelectedSummary(null);
    setSummaryContent(null);
    setSummaryPage(0);
    setSummaryTotal(0);
    setSummaryHasMore(false);
    setSummaryRange({ from: 0, to: 0 });
    setIsSummaryFullScreen(false);
  };

  const handleViewJobHistory = async (doc) => {
    if (!doc) return;
    setSelectedJobHistory({
      documentId: doc.id,
      fileName: doc.fileName,
      jobs: [],
    });
    setJobHistoryDialogOpen(true);
    setLoadingJobHistory(true);

    try {
      const response = await listLlmAnalysisJobs(GLOBAL_RAG_PROJECT_ID, null, 1, 100);
      const filteredJobs = response.jobs?.filter(job => job.documentId === doc.id) || [];
      setSelectedJobHistory({
        documentId: doc.id,
        fileName: doc.fileName,
        jobs: filteredJobs,
      });
      setGlobalDocError('');
    } catch (err) {
      console.error('Failed to fetch job history for global doc:', err);
      setGlobalDocError(t('admin.globalDoc.jobHistoryFailed', '작업 이력을 불러오지 못했습니다.'));
    } finally {
      setLoadingJobHistory(false);
    }
  };

  const handleCloseJobHistoryDialog = () => {
    setJobHistoryDialogOpen(false);
    setSelectedJobHistory(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('admin.llmConfig.title', 'LLM 설정 관리')}
      </Typography>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {/* 탭 네비게이션 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label={t('admin.llmConfig.tab.configList', 'LLM 설정 목록')} />
          <Tab label={t('admin.llmConfig.tab.template', '기본 템플릿')} />
        </Tabs>
      </Paper>
      {/* 탭 0: LLM 설정 목록 */}
      {currentTab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              {t('admin.llmConfig.addConfig', 'LLM 설정 추가')}
            </Button>
          </Box>

          {loading && !testingId ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('admin.llmConfig.name', '이름')}</TableCell>
                    <TableCell>{t('admin.llmConfig.provider', '제공자')}</TableCell>
                    <TableCell>{t('admin.llmConfig.model', '모델')}</TableCell>
                    <TableCell>{t('admin.llmConfig.apiUrl', 'API URL')}</TableCell>
                    <TableCell align="center">{t('admin.llmConfig.status', '상태')}</TableCell>
                    <TableCell align="center">{t('admin.llmConfig.default', '기본')}</TableCell>
                    <TableCell align="center">{t('admin.llmConfig.actions', '작업')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {configs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {t('admin.llmConfig.noConfigs', 'LLM 설정이 없습니다')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    configs.map((config) => (
                      <TableRow
                        key={config.id}
                        sx={{
                          opacity: config.isActive ? 1 : 0.5,
                          bgcolor: config.isActive ? 'inherit' : 'action.hover'
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {config.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={config.provider}
                            size="small"
                            color={
                              config.provider === 'OPENAI'
                                ? 'primary'
                                : config.provider === 'OLLAMA'
                                  ? 'success'
                                  : config.provider === 'OPENROUTER'
                                    ? 'info'
                                    : 'secondary'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {config.modelName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {config.apiUrl}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Chip
                              icon={config.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                              label={config.isActive ? t('admin.llmConfig.active', '활성') : t('admin.llmConfig.inactive', '비활성')}
                              size="small"
                              color={config.isActive ? 'success' : 'default'}
                            />
                            {config.connectionVerified !== null && (
                              <Tooltip title={config.lastConnectionError || '연결 성공'}>
                                <Chip
                                  icon={config.connectionVerified ? <WifiIcon /> : <WifiOffIcon />}
                                  label={config.connectionVerified ? '연결됨' : '연결 실패'}
                                  size="small"
                                  color={config.connectionVerified ? 'success' : 'error'}
                                />
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title={config.isDefault ? '현재 기본 설정' : '기본 설정으로 지정'}>
                            <span>
                              <IconButton
                                size="medium"
                                onClick={() => handleSetDefault(config.id)}
                                disabled={config.isDefault || !config.isActive}
                                sx={{
                                  ...(config.isDefault && {
                                    bgcolor: 'warning.light',
                                    '&:hover': { bgcolor: 'warning.main' },
                                    animation: 'pulse 2s ease-in-out infinite',
                                    '@keyframes pulse': {
                                      '0%, 100%': { transform: 'scale(1)' },
                                      '50%': { transform: 'scale(1.1)' }
                                    }
                                  })
                                }}
                              >
                                {config.isDefault ? (
                                  <StarIcon sx={{ fontSize: 32, color: 'warning.dark' }} />
                                ) : (
                                  <StarBorderIcon sx={{ fontSize: 28 }} />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title={t('admin.llmConfig.testConnection', '연결 테스트')}>
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => handleTestConnection(config.id)}
                                  disabled={testingId === config.id}
                                >
                                  {testingId === config.id ? <CircularProgress size={20} /> : <WifiIcon />}
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title={config.isActive ? t('admin.llmConfig.deactivate', '비활성화') : t('admin.llmConfig.activate', '활성화')}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleActive(config.id)}
                                color={config.isActive ? 'success' : 'default'}
                              >
                                {config.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('common.edit', '수정')}>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(config)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('common.delete', '삭제')}>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(config.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      {/* 탭 1: 기본 템플릿 & 공통 파일 */}
      {currentTab === 1 && (
        <Stack spacing={3}>
          {/* 기본 템플릿 섹션 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('admin.llmConfig.template.title', '📋 테스트 케이스 생성 기본 템플릿')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              marginBottom: "16px"
            }}>
              {t('admin.llmConfig.template.description1', '이 템플릿은 새로운 LLM 설정 생성 시 자동으로 설정되며, AI에게 테스트 케이스 생성을 요청할 때 참고 형식으로 사용됩니다.')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              marginBottom: "16px"
            }}>
              {t('admin.llmConfig.template.description2', '각 LLM 설정별로 이 템플릿을 수정하여 사용할 수 있습니다.')}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {t('admin.llmConfig.template.label', '기본 템플릿 JSON:')}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const blob = new Blob([DEFAULT_TEST_CASE_TEMPLATE], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'default-test-case-template.json';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >
                  {t('admin.llmConfig.template.download', '다운로드')}
                </Button>
              </Box>
              <TextField
                value={DEFAULT_TEST_CASE_TEMPLATE}
                fullWidth
                multiline
                rows={20}
                variant="outlined"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace'
                  },
                  bgcolor: 'grey.50'
                }}
                slotProps={{
                  input: { readOnly: true }
                }}
              />
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>{t('admin.llmConfig.template.usageTitle', '사용 방법:')}</strong><br />
                {t('admin.llmConfig.template.usage1', '1. LLM 설정 생성 시 이 템플릿이 자동으로 적용됩니다.')}<br />
                {t('admin.llmConfig.template.usage2', '2. 각 LLM 설정에서 개별적으로 템플릿을 수정할 수 있습니다.')}<br />
                {t('admin.llmConfig.template.usage3', '3. RAG 채팅에서 "테스트 케이스"를 포함한 요청 시 자동으로 템플릿을 참고합니다.')}
              </Typography>
            </Alert>
          </Paper>

          {/* LLM 분석 기본 템플릿 섹션 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('admin.llmTemplate.title', '🤖 LLM 청크 분석 기본 템플릿')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('admin.llmTemplate.description', 'RAG 문서 분석 시 사용되는 기본 설정입니다. UI와 Backend 스케줄러가 공통으로 사용합니다.')}
            </Typography>

            {loadingTemplate ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : llmTemplate ? (
              <Box>
                <TextField
                  fullWidth
                  label={t('admin.llmTemplate.promptTemplate', '프롬프트 템플릿')}
                  value={llmTemplate.promptTemplate || ''}
                  onChange={(e) => setLlmTemplate({ ...llmTemplate, promptTemplate: e.target.value })}
                  multiline
                  rows={4}
                  disabled={!editingTemplate}
                  helperText={t('admin.llmTemplate.promptTemplateHelper', '{chunk_text} 플레이스홀더를 사용하세요')}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    label={t('admin.llmTemplate.maxTokens', '최대 토큰')}
                    type="number"
                    value={llmTemplate.maxTokens || 500}
                    onChange={(e) => setLlmTemplate({ ...llmTemplate, maxTokens: parseInt(e.target.value) })}
                    disabled={!editingTemplate}
                    fullWidth
                  />
                  <TextField
                    label={t('admin.llmTemplate.temperature', '온도')}
                    type="number"
                    value={llmTemplate.temperature || 0.7}
                    onChange={(e) => setLlmTemplate({ ...llmTemplate, temperature: parseFloat(e.target.value) })}
                    disabled={!editingTemplate}
                    fullWidth
                    slotProps={{ htmlInput: { min: 0, max: 2, step: 0.1 } }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    label={t('admin.llmTemplate.chunkBatchSize', '배치 크기')}
                    type="number"
                    value={llmTemplate.chunkBatchSize || 10}
                    onChange={(e) => setLlmTemplate({ ...llmTemplate, chunkBatchSize: parseInt(e.target.value) })}
                    disabled={!editingTemplate}
                    fullWidth
                    helperText={t('admin.llmTemplate.chunkBatchSizeHelper', '한 번에 처리할 청크 개수')}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={llmTemplate.pauseAfterBatch || false}
                        onChange={(e) => setLlmTemplate({ ...llmTemplate, pauseAfterBatch: e.target.checked })}
                        disabled={!editingTemplate}
                      />
                    }
                    label={t('admin.llmTemplate.pauseAfterBatch', '배치마다 일시정지')}
                    sx={{ minWidth: 200 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {editingTemplate ? (
                    <>
                      <Button
                        variant="contained"
                        onClick={updateLlmTemplate}
                        disabled={loadingTemplate}
                      >
                        {t('admin.llmTemplate.save', '저장')}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditingTemplate(false);
                          fetchLlmTemplate();
                        }}
                      >
                        {t('admin.llmTemplate.cancel', '취소')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setEditingTemplate(true)}
                    >
                      {t('admin.llmTemplate.edit', '수정')}
                    </Button>
                  )}
                </Box>

                {llmTemplate.lastModifiedDate && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    {t('admin.llmTemplate.lastModified', '마지막 수정: {0}', llmTemplate.lastModifiedDate)}
                  </Typography>
                )}
              </Box>
            ) : null}
          </Paper>

          {/* 공통 파일 관리 섹션 */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {t('admin.globalDoc.title', '🌐 공통 RAG 문서 관리')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('admin.globalDoc.description', '모든 프로젝트에서 자동으로 참조되는 글로벌 지식 베이스를 관리합니다. (관리자 전용)')}<br />
                  <Typography component="span" variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                    Project ID: 00000000-0000-0000-0000-000000000000
                  </Typography>
                </Typography>
              </Box>
              <Button
                variant="contained"
                component="label"
                startIcon={uploadingGlobalDoc ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                disabled={uploadingGlobalDoc}
              >
                {t('admin.globalDoc.uploadFile', '파일 업로드')}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleUploadGlobalDocument}
                />
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>{t('admin.globalDoc.info.whatIsTitle', '📚 공통 문서란?')}</strong><br />
                {t('admin.globalDoc.info.whatIsDescription', '모든 프로젝트에서 자동으로 참조되는 글로벌 지식 베이스입니다. 특수 프로젝트 ID({0})로 관리됩니다.').replace('{0}', '00000000-0000-0000-0000-000000000000')}<br /><br />

                <strong>{t('admin.globalDoc.info.examplesTitle', '💡 활용 예시:')}</strong><br />
                • {t('admin.globalDoc.info.example1', '회사 공통 코딩 컨벤션 및 개발 가이드라인')}<br />
                • {t('admin.globalDoc.info.example2', '테스트 작성 표준 및 품질 관리 문서')}<br />
                • {t('admin.globalDoc.info.example3', '프로젝트 공통 참조 문서 (API 명세, 아키텍처 가이드 등)')}<br />
                • {t('admin.globalDoc.info.example4', '조직 전체의 모범 사례 및 학습 자료')}<br /><br />

                <strong>{t('admin.globalDoc.info.techSpecsTitle', '⚙️ 기술 사양:')}</strong><br />
                • {t('admin.globalDoc.info.supportedFormats', '지원 형식: PDF, DOCX, DOC, TXT (최대 50MB)')}<br />
                • {t('admin.globalDoc.info.autoSearch', '모든 프로젝트의 RAG Q&A에서 자동 검색됨')}<br />
                • {t('admin.globalDoc.info.adminOnly', '관리자만 업로드/삭제 가능 (ADMIN 권한 필요)')}
              </Typography>
            </Alert>

            {globalDocError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setGlobalDocError('')}>
                {globalDocError}
              </Alert>
            )}

            {loadingGlobalDocs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : globalDocuments.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
                <DescriptionIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {t('admin.globalDoc.noDocuments', '아직 공통 문서가 없습니다. 첫 번째 문서를 업로드해보세요!')}
                </Typography>
              </Box>
            ) : (
              <DocumentTableSection
                title={null}
                documents={globalDocuments}
                llmAnalysisStates={llmAnalysisStates}
                expandedRows={{}}
                showExpand={false}
                actionHandlers={{
                  preview: handlePreviewDocument,
                  viewChunks: handleViewChunks,
                  download: handleDownloadDocument,
                  analyze: handleAnalyzeDocument,
                  generateEmbeddings: handleGenerateEmbeddings,
                  llmAnalysis: handleOpenLlmAnalysis,
                  summary: handleViewSummary,
                  jobHistory: handleViewJobHistory,
                  delete: (doc) => handleDeleteGlobalDocument(doc.id, doc.fileName),
                }}
              />

            )}

            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('admin.globalDoc.requests.title', '📨 공통 문서 등록 요청')}
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchGlobalDocRequests}
                  disabled={loadingGlobalDocRequests}
                >
                  {t('common.refresh', '새로고침')}
                </Button>
              </Box>
              {loadingGlobalDocRequests ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : globalDocRequests.length === 0 ? (
                <Alert severity="info" sx={{ mb: 0 }}>
                  {t('admin.globalDoc.requests.empty', '대기 중인 요청이 없습니다.')}
                </Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('rag.document.list.fileName', '파일명')}</TableCell>
                        <TableCell>{t('admin.globalDoc.requests.requestedBy', '요청자')}</TableCell>
                        <TableCell>{t('admin.globalDoc.requests.message', '요청 메모')}</TableCell>
                        <TableCell>{t('admin.globalDoc.requests.requestedAt', '요청 일시')}</TableCell>
                        <TableCell align="right">{t('admin.llmConfig.actions', '작업')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {globalDocRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.documentName}</TableCell>
                          <TableCell>{request.requestedBy}</TableCell>
                          <TableCell>{request.requestMessage || '-'}</TableCell>
                          <TableCell>{formatDateArray(request.createdAt)}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon fontSize="small" />}
                                onClick={() => handleApproveRequest(request)}
                              >
                                {t('admin.globalDoc.requests.approve', '승인')}
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon fontSize="small" />}
                                onClick={() => handleRejectRequest(request)}
                              >
                                {t('admin.globalDoc.requests.reject', '거절')}
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>
        </Stack>
      )}
      <DocumentPreviewDialog
        open={previewDialogState.open}
        document={previewDialogState.document}
        onClose={handleClosePreviewDialog}
        fetchPreview={fetchDocumentBlob}
      />
      {chunksDialogState.document && (
        <DocumentChunks
          open={chunksDialogState.open}
          onClose={handleCloseChunksDialog}
          documentId={chunksDialogState.document.id}
          documentName={chunksDialogState.document.fileName}
        />
      )}
      {/* LLM 분석 요약 다이얼로그 */}
      <Dialog
        open={summaryDialogOpen}
        onClose={handleCloseSummaryDialog}
        maxWidth="lg"
        fullWidth
        fullScreen={isSummaryFullScreen}
        slotProps={{
          paper: {
            className: 'glass-surface',
            elevation: 5,
          }
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
            <Tooltip title={isSummaryFullScreen ? t('common.exitFullscreen', '전체화면 종료') : t('common.fullscreen', '전체화면')}>
              <IconButton
                onClick={() => setIsSummaryFullScreen(!isSummaryFullScreen)}
                size="small"
                color="primary"
              >
                {isSummaryFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleCloseSummaryDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSummary ? (
            <Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Chip
                  label={t('rag.document.summary.totalChunks', '총 {0}개 청크').replace('{0}', selectedSummary.totalChunks || 0)}
                  size="small"
                  color="primary"
                />
                <Chip
                  label={t('rag.document.summary.analyzedChunks', '분석 완료: {0}개').replace('{0}', selectedSummary.analyzedChunks || 0)}
                  size="small"
                  color="success"
                />
                <Chip
                  label={t('rag.document.summary.progress', '진행률: {0}%').replace('{0}', selectedSummary.progress || 0)}
                  size="small"
                  color={getProgressColor(selectedSummary.progress)}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  {t('rag.document.summary.title', 'LLM 분석 결과 요약')}
                </Typography>
                {loadingSummary ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : selectedSummary.status === 'not_started' ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    {t('rag.llmAnalysis.status.notStartedMessage', '아직 LLM 분석이 실행되지 않았습니다.')}
                  </Alert>
                ) : selectedSummary.status === 'error' ? (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {selectedSummary.errorMessage || t('rag.llmAnalysis.status.errorMessage', '분석 중 오류가 발생했습니다.')}
                  </Alert>
                ) : selectedSummary.status === 'processing' || selectedSummary.status === 'paused' ? (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    {t('rag.llmAnalysis.status.processingPausedMessage', 'LLM 분석이 진행 중입니다. ({0}개 청크 처리)').replace('{0}', selectedSummary.analyzedChunks || 0)}
                  </Alert>
                ) : null}

                {summaryContent && (
                  <Box
                    data-color-mode="light"
                    className="glass-surface shadow-glass-medium"
                    sx={summaryMarkdownStyles}
                  >
                    <MDEditor.Markdown
                      source={summaryContent}
                      style={{ whiteSpace: 'pre-wrap' }}
                    />
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {summaryPaginationLabel}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSummaryPageChange('prev')}
                      disabled={!canGoPrevSummary || loadingSummary}
                    >
                      {t('common.previous', '이전')}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleSummaryPageChange('next')}
                      disabled={!canGoNextSummary || loadingSummary}
                    >
                      {t('common.next', '다음')}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSummaryDialog}>{t('common.close', '닫기')}</Button>
        </DialogActions>
      </Dialog>
      {/* 작업 이력 다이얼로그 */}
      <Dialog
        open={jobHistoryDialogOpen}
        onClose={handleCloseJobHistoryDialog}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="info" />
            <Typography variant="h6">
              {t('rag.document.jobHistory', '작업 이력')} - {selectedJobHistory?.fileName}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseJobHistoryDialog} size="small">
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
                    <TableCell>{t('rag.document.jobId', '작업 ID')}</TableCell>
                    <TableCell>{t('rag.document.llmProvider', 'LLM 제공자')}</TableCell>
                    <TableCell>{t('rag.document.llmModel', 'LLM 모델')}</TableCell>
                    <TableCell>{t('rag.document.status', '상태')}</TableCell>
                    <TableCell align="center">{t('rag.document.summaryProgress', '진행률')}</TableCell>
                    <TableCell>{t('rag.document.list.chunks', '청크 수')}</TableCell>
                    <TableCell align="right">{t('rag.document.cost', '비용 (USD)')}</TableCell>
                    <TableCell align="right">{t('rag.document.tokens', '토큰')}</TableCell>
                    <TableCell>{t('rag.document.startedAt', '시작 시각')}</TableCell>
                    <TableCell>{t('rag.document.completedAt', '완료 시각')}</TableCell>
                    <TableCell>{t('rag.document.pausedAt', '일시정지 시각')}</TableCell>
                    <TableCell>{t('rag.document.error', '에러')}</TableCell>
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
                          label={job.status || '-'}
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
                              label={t('rag.document.errorPresent', '에러 있음')}
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
              {t('rag.document.jobHistoryEmpty', '이 문서에 대한 작업 이력이 없습니다.')}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJobHistoryDialog}>{t('common.close', '닫기')}</Button>
        </DialogActions>
      </Dialog>
      {/* LLM 분석 다이얼로그 */}
      {analysisDialogState.document && (
        <Dialog
          open={analysisDialogState.open}
          onClose={handleCloseLlmAnalysis}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {t('rag.llmAnalysis.title', 'LLM 청크 분석')} - {analysisDialogState.document.fileName}
            <IconButton onClick={handleCloseLlmAnalysis} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <DocumentAnalysis document={analysisDialogState.document} />
          </DialogContent>
        </Dialog>
      )}
      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConfig ? t('admin.llmConfig.editConfig', 'LLM 설정 수정') : t('admin.llmConfig.createConfig', 'LLM 설정 생성')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('admin.llmConfig.name', '이름')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>{t('admin.llmConfig.provider', '제공자')}</InputLabel>
              <Select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                label={t('admin.llmConfig.provider', '제공자')}
              >
                <MenuItem value="OPENWEBUI">OpenWebUI</MenuItem>
                <MenuItem value="OPENAI">OpenAI</MenuItem>
                <MenuItem value="OLLAMA">Ollama</MenuItem>
                <MenuItem value="PERPLEXITY">Perplexity</MenuItem>
                <MenuItem value="OPENROUTER">OpenRouter</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t('admin.llmConfig.apiUrl', 'API URL')}
              value={formData.apiUrl}
              onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              fullWidth
              required
              placeholder={
                formData.provider === 'OPENAI'
                  ? 'https://api.openai.com'
                  : formData.provider === 'OLLAMA'
                    ? 'http://localhost:11434'
                    : formData.provider === 'PERPLEXITY'
                      ? 'https://api.perplexity.ai'
                      : formData.provider === 'OPENROUTER'
                        ? 'https://openrouter.ai'
                        : 'http://localhost:3000'
              }
              helperText={
                formData.provider === 'OLLAMA'
                  ? 'Docker 환경: http://host.docker.internal:11434 | 로컬: http://localhost:11434'
                  : formData.provider === 'PERPLEXITY'
                    ? '기본 URL: https://api.perplexity.ai'
                    : formData.provider === 'OPENAI'
                      ? '기본 URL: https://api.openai.com'
                      : formData.provider === 'OPENROUTER'
                        ? '기본 URL: https://openrouter.ai'
                        : formData.provider === 'OPENWEBUI'
                          ? 'Docker 환경: http://host.docker.internal:3000 | 로컬: http://localhost:3000'
                          : ''
              }
            />

            <TextField
              label={t('admin.llmConfig.apiKey', 'API Key')}
              type={showApiKey ? 'text' : 'password'}
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              fullWidth
              required={!editingConfig}
              placeholder={editingConfig ? '(변경하지 않으려면 비워두세요)' : ''}
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowApiKey(!showApiKey)}
                      edge="end"
                    >
                      {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  )
                }
              }}
            />

            <TextField
              label={t('admin.llmConfig.model', '모델 이름')}
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              fullWidth
              required
              placeholder={
                formData.provider === 'OPENAI'
                  ? 'gpt-4'
                  : formData.provider === 'OLLAMA'
                    ? 'qwen2.5-coder:7b'
                    : formData.provider === 'PERPLEXITY'
                      ? 'llama-3.1-sonar-large-128k-online'
                      : formData.provider === 'OPENROUTER'
                        ? 'anthropic/claude-3.5-sonnet'
                        : 'llama3.1'
              }
              helperText={
                formData.provider === 'OLLAMA'
                  ? '예시: qwen2.5-coder:7b, llama3.1:8b, mistral:7b, deepseek-coder:6.7b'
                  : formData.provider === 'OPENAI'
                    ? '예시: gpt-4, gpt-3.5-turbo, gpt-4-turbo'
                    : formData.provider === 'PERPLEXITY'
                      ? '예시: llama-3.1-sonar-large-128k-online, llama-3.1-sonar-small-128k-online'
                      : formData.provider === 'OPENROUTER'
                        ? '예시: anthropic/claude-3.5-sonnet, openai/gpt-4, google/gemini-pro'
                        : '예시: llama3.1, granite3.1-dense:8b'
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
              }
              label={t('admin.llmConfig.setAsDefault', '기본 설정으로 지정')}
            />

            {/* 테스트 케이스 템플릿 */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                테스트 케이스 생성 템플릿 (JSON)
                <Tooltip title="AI에게 테스트 케이스 생성을 요청할 때 이 템플릿을 참고합니다">
                  <Typography variant="caption" color="text.secondary">ⓘ</Typography>
                </Tooltip>
              </Typography>
              <TextField
                value={formData.testCaseTemplate}
                onChange={(e) => setFormData({ ...formData, testCaseTemplate: e.target.value })}
                fullWidth
                multiline
                rows={12}
                variant="outlined"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace'
                  }
                }}
                placeholder={DEFAULT_TEST_CASE_TEMPLATE}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetTemplate}
                >
                  초기화
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadTemplate}
                >
                  {t('admin.llmConfig.template.downloadJson', 'JSON 다운로드')}
                </Button>
              </Box>
            </Box>

            {/* 테스트 연결 버튼 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={testingDialog ? <CircularProgress size={20} /> : <WifiIcon />}
                onClick={handleTestDialogSettings}
                disabled={testingDialog || !formData.provider || !formData.apiUrl || !formData.apiKey || !formData.modelName}
                fullWidth
              >
                {t('admin.llmConfig.testConnection', '연결 테스트')}
              </Button>
            </Box>

            {/* 테스트 결과 표시 */}
            {testResult && (
              <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mt: 1 }}>
                {testResult.message}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel', '취소')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.apiUrl || (!formData.apiKey && !editingConfig) || !formData.modelName}
          >
            {editingConfig ? t('common.save', '저장') : t('common.create', '생성')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const LlmConfigManagement = () => {
  return (
    <LlmConfigProvider>
      <LlmConfigManagementContent />
    </LlmConfigProvider>
  );
};

export default LlmConfigManagement;
