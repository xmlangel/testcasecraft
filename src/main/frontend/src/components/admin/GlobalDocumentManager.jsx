// src/components/admin/GlobalDocumentManager.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Paper,
    Typography,
    Button,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Chip,
    TablePagination,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    CloudUpload as CloudUploadIcon,
    Description as DescriptionIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Close as CloseIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
    History as HistoryIcon,
    Error as ErrorIcon,
    Pending as PendingIcon,
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext';
import { useRAG, GLOBAL_RAG_PROJECT_ID } from '../../context/RAGContext.jsx';
import DocumentTableSection from '../RAG/DocumentTableSection.jsx';
import DocumentPreviewDialog from '../RAG/DocumentPreviewDialog.jsx';
import DocumentChunks from '../RAG/DocumentChunks.jsx';
import DocumentAnalysis from '../RAG/DocumentAnalysis.jsx';
import axiosInstance from '../../utils/axiosInstance.js';
import { API_CONFIG } from '../../utils/apiConstants.js';
import MDEditor from '@uiw/react-md-editor';
import { isDebugEnabled } from '../../utils/logger.js';

const SUMMARY_PAGE_SIZE = 10;

const GlobalDocumentManager = ({ onSuccess }) => {
    const { t } = useI18n();
    const theme = useTheme();

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
        listLlmAnalysisJobs,
        isRagEnabled,
        ragDisabledMessage,
        ragStatusInitialized,
    } = useRAG();

    const [globalDocuments, setGlobalDocuments] = useState([]);
    const [loadingGlobalDocs, setLoadingGlobalDocs] = useState(false);
    const [uploadingGlobalDoc, setUploadingGlobalDoc] = useState(false);
    const [globalDocRequests, setGlobalDocRequests] = useState([]);
    const [loadingGlobalDocRequests, setLoadingGlobalDocRequests] = useState(false);
    const [globalDocError, setGlobalDocError] = useState('');

    // 페이지네이션 상태
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalDocs, setTotalDocs] = useState(0);

    // 다이얼로그 상태
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

    const buildSummaryMarkdown = useCallback((results) => {
        if (!results || results.length === 0) {
            return '';
        }
        return results
            .map((result, index) => {
                const chunkNumber = Number.isInteger(result.chunkIndex) ? result.chunkIndex + 1 : index + 1;
                const cleanedResponse = (result.llmResponse || '').replace(/\n{2,}/g, '\n').trim();
                return `### 📄 청크 ${chunkNumber}\n${cleanedResponse}`;
            })
            .join('\n\n---\n\n');
    }, []);

    const fetchSummaryPage = useCallback(
        async (doc, page = 0) => {
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
                const fallbackTotal = llmState?.analyzedChunks || doc.totalChunks || offset + results.length;
                const computedTotal = totalFromResponse ?? fallbackTotal ?? 0;
                setSummaryTotal(computedTotal);
                setSummaryHasMore(
                    totalFromResponse != null ? offset + results.length < totalFromResponse : results.length === SUMMARY_PAGE_SIZE
                );
                setSummaryRange(results.length > 0 ? { from: offset + 1, to: offset + results.length } : { from: 0, to: 0 });
            } catch (err) {
                console.error('Failed to fetch LLM summary for global doc:', err);
                setSummaryContent(t('admin.globalDoc.summary.fetchFailed', '분석 결과 조회에 실패했습니다.'));
                setSummaryHasMore(false);
                setSummaryRange({ from: 0, to: 0 });
            } finally {
                setLoadingSummary(false);
            }
        },
        [getLlmAnalysisResults, buildSummaryMarkdown, llmAnalysisStates, t]
    );

    const summaryPaginationLabel =
        summaryRange.from > 0
            ? `${summaryRange.from}-${summaryRange.to}${summaryTotal ? ` / ${summaryTotal}` : ''}`
            : t('rag.document.summary.noData', '표시할 결과가 없습니다.');
    const canGoPrevSummary = summaryPage > 0;
    const canGoNextSummary = summaryHasMore || (summaryTotal ? (summaryPage + 1) * SUMMARY_PAGE_SIZE < summaryTotal : false);

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
            '& .wmde-markdown hr': {
                my: 2,
                height: '3px',
                background: headingGradient,
                border: 'none',
                boxShadow: '0 2px 4px rgba(6, 182, 212, 0.2)',
            },
        };
    }, [theme, isSummaryFullScreen]);

    const loadGlobalLlmAnalysisStates = useCallback(
        async (documents) => {
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
                        const progress = totalChunks > 0 ? Math.round((processedChunks / totalChunks) * 100) : 0;

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
        },
        [getLlmAnalysisStatus]
    );

    const fetchGlobalDocuments = useCallback(async () => {
        // RAG 상태 조회 완료 전에는 API 호출 차단 (마운트 시점 이른 호출 방지)
        if (!ragStatusInitialized) {
            return;
        }
        // RAG 비활성화 시 API 호출 차단 (에러 루프 방지)
        if (!isRagEnabled) {
            setGlobalDocuments([]);
            setTotalDocs(0);
            setLoadingGlobalDocs(false);
            return;
        }
        if (isDebugEnabled('GlobalDocumentManager')) console.log('[GlobalDocumentManager] Fetching documents - page:', page, 'rowsPerPage:', rowsPerPage);
        setLoadingGlobalDocs(true);
        try {
            // 페이지네이션: page는 0부터 시작, API는 1부터 시작
            const response = await listDocuments(GLOBAL_RAG_PROJECT_ID, page + 1, rowsPerPage);
            if (isDebugEnabled('GlobalDocumentManager')) console.log('[GlobalDocumentManager] API Response:', response);
            const docs = response.documents || [];
            // API 응답 구조: { documents: [...], total: 23, page: 1, pageSize: 10 }
            const total = response.total ?? response.pagination?.total ?? docs.length;

            setGlobalDocuments(docs);
            setTotalDocs(total);
            if (isDebugEnabled('GlobalDocumentManager')) console.log('[GlobalDocumentManager] Set totalDocs to:', total, 'docs.length:', docs.length);

            // LLM 분석 상태는 백그라운드에서 로드 (await 제거하여 무한 루프 방지)
            loadGlobalLlmAnalysisStates(docs);
            setGlobalDocError('');
        } catch (err) {
            console.error('Failed to fetch global documents:', err);
            setGlobalDocError(t('admin.globalDoc.message.fetchFailed', '공통 문서를 불러오지 못했습니다.'));
            setLlmAnalysisStates({});
            setTotalDocs(0);
        } finally {
            setLoadingGlobalDocs(false);
        }
    }, [listDocuments, t, page, rowsPerPage, isRagEnabled, ragStatusInitialized]); // loadGlobalLlmAnalysisStates 제외

    const fetchGlobalDocRequests = useCallback(async () => {
        // RAG 상태 조회 완료 전, 또는 RAG 비활성화 시 API 호출 차단
        if (!ragStatusInitialized || !isRagEnabled) {
            setGlobalDocRequests([]);
            return;
        }
        setLoadingGlobalDocRequests(true);
        try {
            const response = await listGlobalDocumentRequests('PENDING');
            setGlobalDocRequests(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error('Failed to fetch global document requests:', err);
            setGlobalDocRequests([]);
        } finally {
            setLoadingGlobalDocRequests(false);
        }
    }, [listGlobalDocumentRequests, isRagEnabled, ragStatusInitialized]);

    useEffect(() => {
        fetchGlobalDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, ragStatusInitialized, isRagEnabled]); // ragStatusInitialized, isRagEnabled 변동 시 재호출

    useEffect(() => {
        fetchGlobalDocRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ragStatusInitialized, isRagEnabled]); // 상태 확인 후 실행

    // 페이지 변경 핸들러
    const handleChangePage = useCallback((event, newPage) => {
        if (isDebugEnabled('GlobalDocumentManager')) console.log('[GlobalDocumentManager] Page changed from', page, 'to', newPage);
        setPage(newPage);
    }, [page]);

    // 페이지당 행 수 변경 핸들러
    const handleChangeRowsPerPage = useCallback((event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        if (isDebugEnabled('GlobalDocumentManager')) console.log('[GlobalDocumentManager] RowsPerPage changed from', rowsPerPage, 'to', newRowsPerPage);
        setRowsPerPage(newRowsPerPage);
        setPage(0); // 페이지 리셋
    }, [rowsPerPage]);

    const handleUploadGlobalDocument = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 파일 타입 검증
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain',
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
            const uploadResponse = await axiosInstance.post(`${API_CONFIG.BASE_URL}/api/rag/global-documents/upload`, formData);

            const uploadedDocId = uploadResponse.data?.id;

            if (uploadedDocId) {
                try {
                    // 2. 문서 분석 (기본 파서: pymupdf4llm 사용)
                    await analyzeDocument(uploadedDocId, 'pymupdf4llm');

                    // 3. 임베딩 생성
                    await generateEmbeddings(uploadedDocId);

                    if (onSuccess)
                        onSuccess(
                            t('admin.globalDoc.message.uploadSuccess', '공통 문서 "{0}"이 업로드되고 분석 및 임베딩이 시작되었습니다').replace(
                                '{0}',
                                file.name
                            )
                        );
                } catch (autoProcessError) {
                    console.warn('자동 분석/임베딩 실패 (문서는 업로드됨):', autoProcessError);
                    if (onSuccess)
                        onSuccess(
                            t(
                                'admin.globalDoc.message.uploadSuccess',
                                '공통 문서 "{0}"이 업로드되었습니다. 분석과 임베딩은 수동으로 진행해주세요.'
                            ).replace('{0}', file.name)
                        );
                }
            } else {
                if (onSuccess)
                    onSuccess(t('admin.globalDoc.message.uploadSuccess', '공통 문서 "{0}"이 업로드되었습니다').replace('{0}', file.name));
            }

            await fetchGlobalDocuments();

            // 파일 입력 초기화
            event.target.value = '';
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || err.message || t('admin.globalDoc.message.uploadFailed', '공통 문서 업로드 실패');
            alert(t('admin.globalDoc.message.uploadFailed', '공통 문서 업로드 실패') + ': ' + errorMessage);
        } finally {
            setUploadingGlobalDoc(false);
        }
    };

    const handleApproveRequest = async (request) => {
        const note = window.prompt(t('admin.globalDoc.requests.approveNote', '승인 메모 (선택)'), '');
        try {
            await approveGlobalDocumentRequest(request.id, note || null);
            if (onSuccess) onSuccess(t('admin.globalDoc.requests.approved', '요청을 승인했습니다.'));
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
            if (onSuccess) onSuccess(t('admin.globalDoc.requests.rejected', '요청을 거절했습니다.'));
            await fetchGlobalDocRequests();
        } catch (err) {
            console.error('Failed to reject global document request:', err);
            alert(t('admin.globalDoc.requests.rejectFailed', '요청 거절에 실패했습니다.'));
        }
    };

    // 공통 문서 삭제
    const handleDeleteGlobalDocument = async (documentId, fileName) => {
        if (
            !window.confirm(
                t('admin.globalDoc.message.confirmDelete', '공통 문서 "{0}"을 삭제하시겠습니까?').replace('{0}', fileName)
            )
        ) {
            return;
        }

        try {
            await axiosInstance.delete(`${API_CONFIG.BASE_URL}/api/rag/global-documents/${documentId}`);

            if (onSuccess) onSuccess(t('admin.globalDoc.message.deleteSuccess', '공통 문서 "{0}"이 삭제되었습니다').replace('{0}', fileName));
            await fetchGlobalDocuments();
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || err.message || t('admin.globalDoc.message.deleteFailed', '공통 문서 삭제 실패');
            alert(t('admin.globalDoc.message.deleteFailed', '공통 문서 삭제 실패') + ': ' + errorMessage);
        }
    };

    // 문서 다운로드 핸들러
    const handleDownloadDocument = async (doc) => {
        try {
            await downloadDocument(doc.id, doc.fileName);
            if (onSuccess)
                onSuccess(t('admin.globalDoc.message.downloadSuccess', '문서 "{0}" 다운로드 완료').replace('{0}', doc.fileName));
        } catch (err) {
            alert(
                t('admin.globalDoc.message.downloadFailed', '다운로드 실패') +
                ': ' +
                (err.message || t('admin.globalDoc.message.unknownError', '알 수 없는 오류'))
            );
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
        if (
            !window.confirm(
                t('admin.globalDoc.message.confirmAnalyze', '문서 "{0}"을 분석하시겠습니까?').replace('{0}', doc.fileName)
            )
        ) {
            return;
        }

        try {
            await analyzeDocument(doc.id);
            if (onSuccess) onSuccess(t('admin.globalDoc.message.analyzeStarted', '문서 "{0}" 분석 시작됨').replace('{0}', doc.fileName));
            await fetchGlobalDocuments();
        } catch (err) {
            alert(
                t('admin.globalDoc.message.analyzeFailed', '분석 시작 실패') +
                ': ' +
                (err.message || t('admin.globalDoc.message.unknownError', '알 수 없는 오류'))
            );
        }
    };

    // 임베딩 생성 핸들러
    const handleGenerateEmbeddings = async (doc) => {
        if (
            !window.confirm(
                t('admin.globalDoc.message.confirmEmbeddings', '문서 "{0}"의 임베딩을 생성하시겠습니까?').replace('{0}', doc.fileName)
            )
        ) {
            return;
        }

        try {
            await generateEmbeddings(doc.id);
            if (onSuccess)
                onSuccess(t('admin.globalDoc.message.embeddingsStarted', '문서 "{0}" 임베딩 생성 시작됨').replace('{0}', doc.fileName));
            await fetchGlobalDocuments();
        } catch (err) {
            alert(
                t('admin.globalDoc.message.embeddingsFailed', '임베딩 생성 실패') +
                ': ' +
                (err.message || t('admin.globalDoc.message.unknownError', '알 수 없는 오류'))
            );
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
            const filteredJobs = response.jobs?.filter((job) => job.documentId === doc.id) || [];
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
        <>
            {/* RAG 비활성화 시 경고 배너 - 실수 업로드 방지 */}
            {!isRagEnabled && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                        ⚠️ RAG 기능이 현재 비활성화되어 있습니다.
                    </Typography>
                    <Typography variant="body2">
                        {ragDisabledMessage || '시스템 관리자에 의해 RAG 기능이 임시 비활성화되어 있습니다.'}
                        <br />
                        LLM 설정 관리 페이지의 &quot;시스템 설정&quot; 탭에서 RAG를 활성화한 후 문서를 업로드해주세요.
                        <br />
                        <strong>비활성화 상태에서 업로드 시 RAG 관련 처리가 정상적으로 동작하지 않습니다.</strong>
                    </Typography>
                </Alert>
            )}
            {isRagEnabled && (
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            {t('admin.globalDoc.title', '🌐 공통 RAG 문서 관리')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {t('admin.globalDoc.description', '모든 프로젝트에서 자동으로 참조되는 글로벌 지식 베이스를 관리합니다. (관리자 전용)')}
                            <br />
                            <Typography component="span" variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                                Project ID: 00000000-0000-0000-0000-000000000000
                            </Typography>
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={fetchGlobalDocuments}
                            disabled={loadingGlobalDocs}
                        >
                            {t('common.refresh', '새로고침')}
                        </Button>
                        <Button
                            variant="contained"
                            component="label"
                            startIcon={uploadingGlobalDoc ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                            disabled={uploadingGlobalDoc}
                        >
                            {t('admin.globalDoc.uploadFile', '파일 업로드')}
                            <input type="file" hidden accept=".pdf,.docx,.doc,.txt" onChange={handleUploadGlobalDocument} />
                        </Button>
                    </Stack>
                </Box>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>{t('admin.globalDoc.info.whatIsTitle', '📚 공통 문서란?')}</strong>
                        <br />
                        {t(
                            'admin.globalDoc.info.whatIsDescription',
                            '모든 프로젝트에서 자동으로 참조되는 글로벌 지식 베이스입니다. 특수 프로젝트 ID({0})로 관리됩니다.'
                        ).replace('{0}', '00000000-0000-0000-0000-000000000000')}
                        <br />
                        <br />
                        <strong>{t('admin.globalDoc.info.examplesTitle', '💡 활용 예시:')}</strong>
                        <br />• {t('admin.globalDoc.info.example1', '회사 공통 코딩 컨벤션 및 개발 가이드라인')}
                        <br />• {t('admin.globalDoc.info.example2', '테스트 작성 표준 및 품질 관리 문서')}
                        <br />• {t('admin.globalDoc.info.example3', '프로젝트 공통 참조 문서 (API 명세, 아키텍처 가이드 등)')}
                        <br />• {t('admin.globalDoc.info.example4', '조직 전체의 모범 사례 및 학습 자료')}
                        <br />
                        <br />
                        <strong>{t('admin.globalDoc.info.techSpecsTitle', '⚙️ 기술 사양:')}</strong>
                        <br />• {t('admin.globalDoc.info.supportedFormats', '지원 형식: PDF, DOCX, DOC, TXT (최대 50MB)')}
                        <br />• {t('admin.globalDoc.info.autoSearch', '모든 프로젝트의 RAG Q&A에서 자동 검색됨')}
                        <br />• {t('admin.globalDoc.info.adminOnly', '관리자만 업로드/삭제 가능 (ADMIN 권한 필요)')}
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

                {/* 페이지네이션 */}
                <TablePagination
                    component="div"
                    count={totalDocs}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    labelRowsPerPage={t('rag.document.pagination.rowsPerPage', '페이지당 행 수:')}
                    labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} / ${count !== -1 ? count : `more than ${to}`}`
                    }
                />

                <Box sx={{ mt: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">{t('admin.globalDoc.requests.title', '📨 공통 문서 등록 요청')}</Typography>
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
            )}

            {/* 미리보기 다이얼로그 */}
            <DocumentPreviewDialog
                open={previewDialogState.open}
                document={previewDialogState.document}
                onClose={handleClosePreviewDialog}
                fetchPreview={fetchDocumentBlob}
            />

            {/* 청크 보기 다이얼로그 */}
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
                    },
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
                            <IconButton onClick={() => setIsSummaryFullScreen(!isSummaryFullScreen)} size="small" color="primary">
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
                                        {t('rag.llmAnalysis.status.processingPausedMessage', 'LLM 분석이 진행 중입니다. ({0}개 청크 처리)').replace(
                                            '{0}',
                                            selectedSummary.analyzedChunks || 0
                                        )}
                                    </Alert>
                                ) : null}

                                {summaryContent && (
                                    <Box data-color-mode="light" className="glass-surface shadow-glass-medium" sx={summaryMarkdownStyles}>
                                        <MDEditor.Markdown source={summaryContent} style={{ whiteSpace: 'pre-wrap' }} />
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
            <Dialog open={jobHistoryDialogOpen} onClose={handleCloseJobHistoryDialog} maxWidth="xl" fullWidth>
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
                                                <Chip label={job.llmProvider || '-'} size="small" color="primary" variant="outlined" />
                                            </TableCell>
                                            <TableCell>{job.llmModel || '-'}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={job.status || '-'}
                                                    size="small"
                                                    color={
                                                        job.status === 'completed'
                                                            ? 'success'
                                                            : job.status === 'processing'
                                                                ? 'primary'
                                                                : job.status === 'paused'
                                                                    ? 'warning'
                                                                    : job.status === 'cancelled'
                                                                        ? 'default'
                                                                        : job.status === 'error'
                                                                            ? 'error'
                                                                            : 'default'
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
                                                <Chip label={`${job.processedChunks || 0} / ${job.totalChunks || 0}`} size="small" variant="outlined" />
                                            </TableCell >
                                            <TableCell align="right">
                                                <Typography variant="body2" color="primary.main" fontWeight="bold">
                                                    ${(job.totalCostUsd || 0).toFixed(4)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2">{(job.totalTokens || 0).toLocaleString()}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption">{formatDateArray(job.startedAt)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption">{formatDateArray(job.completedAt)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption">{formatDateArray(job.pausedAt)}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {job.errorMessage ? (
                                                    <Tooltip title={job.errorMessage}>
                                                        <Chip label={t('rag.document.errorPresent', '에러 있음')} size="small" color="error" icon={<ErrorIcon />} />
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        -
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow >
                                    ))}
                                </TableBody >
                            </Table >
                        </TableContainer >
                    ) : (
                        <Alert severity="info">{t('rag.document.jobHistoryEmpty', '이 문서에 대한 작업 이력이 없습니다.')}</Alert>
                    )}
                </DialogContent >
                <DialogActions>
                    <Button onClick={handleCloseJobHistoryDialog}>{t('common.close', '닫기')}</Button>
                </DialogActions>
            </Dialog >

            {/* LLM 분석 다이얼로그 */}
            {
                analysisDialogState.document && (
                    <Dialog open={analysisDialogState.open} onClose={handleCloseLlmAnalysis} maxWidth="lg" fullWidth>
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
                )
            }
        </>
    );
};

GlobalDocumentManager.propTypes = {
    onSuccess: PropTypes.func,
};

export default GlobalDocumentManager;
