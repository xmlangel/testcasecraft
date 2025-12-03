// src/components/RAG/DocumentChunks.jsx
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { useRAG } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const CHUNK_PAGE_SIZE = 50; // 한 번에 로드할 청크 개수
const MAX_CHUNK_API_LIMIT = 100; // 백엔드 RAG API가 허용하는 최대 limit 값
const DOCUMENT_SUMMARY_PAGE_SIZE = 10;

const surfaceBackground = (theme) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.05)
    : theme.palette.grey[50];

const surfaceBorder = (theme) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.1)
    : theme.palette.grey[300];

const inlineCodeBackground = (theme) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.1)
    : theme.palette.grey[100];

const codeBlockBackground = (theme) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.05)
    : theme.palette.grey[900];

const codeBlockTextColor = (theme) =>
  theme.palette.mode === 'dark'
    ? theme.palette.grey[100]
    : theme.palette.grey[50];

function DocumentChunks({ documentId, documentName, open, onClose, highlightChunkId, relatedChunkIndices }) {
  const { t } = useI18n();
  const { getDocumentChunks, getLlmAnalysisResults, getLlmAnalysisStatus } = useRAG();
  const { api } = useAppContext();
  const theme = useTheme();
  const colorMode = theme.palette.mode === 'dark' ? 'dark' : 'light';

  // State for chunks and pagination
  const [chunks, setChunks] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [expandedChunks, setExpandedChunks] = useState({});

  // PDF 미리보기 관련 상태
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // LLM 분석 요약 관련 상태
  const [llmSummaryCache, setLlmSummaryCache] = useState({});
  const [chunkSummaryLoadingIndex, setChunkSummaryLoadingIndex] = useState(null);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [documentSummaryOpen, setDocumentSummaryOpen] = useState(false);
  const [documentSummaryEntries, setDocumentSummaryEntries] = useState([]);
  const [documentSummarySkip, setDocumentSummarySkip] = useState(0);
  const [documentSummaryHasMore, setDocumentSummaryHasMore] = useState(true);
  const [documentSummaryTotal, setDocumentSummaryTotal] = useState(null);
  const [documentSummaryLoading, setDocumentSummaryLoading] = useState(false);
  const [documentSummaryError, setDocumentSummaryError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [documentAnalysisStatus, setDocumentAnalysisStatus] = useState(null);

  // 관련 청크만 보기 모드 여부
  const isFilteredMode = relatedChunkIndices && relatedChunkIndices.length > 0;

  // Ref for intersection observer and chunk elements
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const chunkRefs = useRef({});
  const documentSummarySentinelRef = useRef(null);
  const documentSummaryObserverRef = useRef(null);

  const chunkMarkdownStyles = useMemo(() => {
    const isDarkMode = theme.palette.mode === 'dark';
    const baseTextColor = isDarkMode ? theme.palette.grey[100] : '#1E293B';
    const headingGradient = isDarkMode
      ? `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`
      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;

    return {
      border: '1px solid',
      borderColor: isDarkMode ? theme.palette.divider : 'rgba(226, 232, 240, 0.8)',
      borderRadius: 2,
      background: isDarkMode ? alpha(theme.palette.background.paper, 0.5) : 'rgba(255, 255, 255, 0.85)',
      p: 2,
      mt: 1,
      '& .wmde-markdown': {
        p: 0,
        bgcolor: 'transparent',
        fontFamily: "'Bricolage Grotesque', sans-serif",
        color: baseTextColor,
      },
      '& .wmde-markdown h1, & .wmde-markdown h2, & .wmde-markdown h3': {
        background: headingGradient,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mt: 1.5,
        mb: 0.75,
      },
      '& .wmde-markdown p': {
        mb: 0.75,
        mt: 0,
        lineHeight: 1.6,
        color: baseTextColor,
      },
      '& .wmde-markdown code': {
        fontFamily: "'JetBrains Mono', monospace",
        bgcolor: isDarkMode ? alpha(theme.palette.common.white, 0.1) : 'rgba(6, 182, 212, 0.12)',
        color: isDarkMode ? theme.palette.primary.light : '#0891B2',
        px: 0.5,
        py: 0.25,
        borderRadius: 0.5,
        fontSize: '0.85rem',
        border: `1px solid ${isDarkMode ? alpha(theme.palette.common.white, 0.1) : 'rgba(6, 182, 212, 0.2)'}`,
      },
      '& .wmde-markdown pre': {
        fontFamily: "'JetBrains Mono', monospace",
        bgcolor: isDarkMode ? alpha(theme.palette.common.black, 0.3) : '#1E293B',
        color: isDarkMode ? theme.palette.grey[100] : '#F8FAFC',
        p: 1.5,
        borderRadius: 1.5,
        overflow: 'auto',
        mb: 1,
        mt: 1,
        border: `1px solid ${isDarkMode ? theme.palette.divider : 'rgba(6, 182, 212, 0.3)'}`,
      },
      '& .wmde-markdown blockquote': {
        borderLeft: `4px solid ${isDarkMode ? theme.palette.primary.main : 'rgba(6, 182, 212, 0.4)'}`,
        pl: 2,
        ml: 0,
        bgcolor: isDarkMode ? alpha(theme.palette.primary.main, 0.1) : 'rgba(6, 182, 212, 0.05)',
        fontStyle: 'italic',
        color: isDarkMode ? theme.palette.grey[300] : '#64748B',
      },
      '& .wmde-markdown ul, & .wmde-markdown ol': {
        pl: 3,
        mb: 0.75,
        mt: 0,
      },
    };
  }, [theme]);

  useEffect(() => {
    if (!open) {
      setIsFullScreen(false);
    }
  }, [open]);

  const handleDialogClose = useCallback(() => {
    setIsFullScreen(false);
    onClose?.();
  }, [onClose]);

  const resetDocumentSummaryState = useCallback(() => {
    setDocumentSummaryEntries([]);
    setDocumentSummarySkip(0);
    setDocumentSummaryHasMore(true);
    setDocumentSummaryTotal(null);
    setDocumentSummaryLoading(false);
    setDocumentSummaryError(null);
  }, []);

  const loadMoreDocumentSummary = useCallback(async () => {
    if (!documentId || documentSummaryLoading || !documentSummaryHasMore || !documentSummaryOpen) {
      return;
    }
    setDocumentSummaryLoading(true);
    setDocumentSummaryError(null);
    try {
      const response = await getLlmAnalysisResults(documentId, documentSummarySkip, DOCUMENT_SUMMARY_PAGE_SIZE);
      const results = response?.results || [];
      if (results.length > 0) {
        setDocumentSummaryEntries((prev) => [...prev, ...results]);
        setDocumentSummarySkip((prev) => prev + results.length);
        setDocumentSummaryTotal((prev) => response?.total ?? prev);
        setDocumentSummaryHasMore(
          response?.total != null
            ? documentSummarySkip + results.length < response.total
            : results.length === DOCUMENT_SUMMARY_PAGE_SIZE
        );
        // cache for per-chunk summaries
        setLlmSummaryCache((prev) => {
          const updated = { ...prev };
          results.forEach((result) => {
            if (result.chunkIndex !== undefined && result.llmResponse) {
              updated[result.chunkIndex] = result.llmResponse;
            }
          });
          return updated;
        });
      } else {
        setDocumentSummaryHasMore(false);
      }
    } catch (err) {
      console.error('문서 요약 로드 실패:', err);
      setDocumentSummaryError(
        err.response?.data?.message || t('rag.chunks.summaryLoadFailed', 'LLM 요약을 불러오지 못했습니다.')
      );
      setDocumentSummaryHasMore(false);
    } finally {
      setDocumentSummaryLoading(false);
    }
  }, [
    documentId,
    documentSummaryLoading,
    documentSummaryHasMore,
    documentSummaryOpen,
    documentSummarySkip,
    getLlmAnalysisResults,
    t,
  ]);

  const hasAnyLlmSummaries = (documentAnalysisStatus?.progress?.processedChunks || 0) > 0;

  const handleOpenDocumentSummary = useCallback(() => {
    if (!hasAnyLlmSummaries) return;
    resetDocumentSummaryState();
    setDocumentSummaryOpen(true);
  }, [hasAnyLlmSummaries, resetDocumentSummaryState]);

  const handleCloseDocumentSummary = useCallback(() => {
    setDocumentSummaryOpen(false);
    resetDocumentSummaryState();
  }, [resetDocumentSummaryState]);

  const loadDocumentAnalysisStatus = useCallback(async () => {
    if (!documentId || !open) {
      setDocumentAnalysisStatus(null);
      return;
    }
    try {
      const status = await getLlmAnalysisStatus(documentId);
      setDocumentAnalysisStatus(status);
    } catch (err) {
      console.error('LLM 분석 상태 조회 실패:', err);
      setDocumentAnalysisStatus(null);
    }
  }, [documentId, open, getLlmAnalysisStatus]);

  // Load initial chunks
  const loadInitialChunks = useCallback(async () => {
    if (!documentId || !open) {
      return;
    }

    setLoading(true);
    setError(null);
    setChunks([]);
    setSkip(0);
    setHasMore(true);
    chunkRefs.current = {};

    try {
      // 필터 모드이고 관련 청크 인덱스가 있으면 전체를 로드한 후 필터링
      if (isFilteredMode && relatedChunkIndices && relatedChunkIndices.length > 0) {
        // 순서를 유지하면서 중복 제거
        const orderedUniqueIndices = relatedChunkIndices.reduce((acc, index) => {
          if (!acc.includes(index)) {
            acc.push(index);
          }
          return acc;
        }, []);

        // 필요한 페이지(skip 범위) 계산
        const pageRequests = [];
        const requestedPages = new Set();

        orderedUniqueIndices.forEach((chunkIndex) => {
          if (Number.isInteger(chunkIndex) && chunkIndex >= 0) {
            const page = Math.floor(chunkIndex / MAX_CHUNK_API_LIMIT);
            if (!requestedPages.has(page)) {
              requestedPages.add(page);
              pageRequests.push({
                skip: page * MAX_CHUNK_API_LIMIT,
                limit: MAX_CHUNK_API_LIMIT,
              });
            }
          }
        });

        const responses = await Promise.all(
          pageRequests.map(({ skip: pageSkip, limit: pageLimit }) =>
            getDocumentChunks(documentId, pageSkip, pageLimit)
          )
        );

        const chunkMap = new Map();

        responses.forEach((response) => {
          const responseChunks = response?.chunks || [];
          responseChunks.forEach((chunk) => {
            if (!chunkMap.has(chunk.chunkIndex)) {
              chunkMap.set(chunk.chunkIndex, chunk);
            }
          });
        });

        const filteredChunks = orderedUniqueIndices
          .map((chunkIndex) => {
            const chunk = chunkMap.get(chunkIndex);
            return chunk;
          })
          .filter(Boolean);

        setChunks(filteredChunks);
        setTotal(filteredChunks.length);
        setHasMore(false); // 필터 모드에서는 추가 로딩 없음
      } else {
        // 일반 모드: 페이지네이션으로 청크 로드
        const response = await getDocumentChunks(documentId, 0, CHUNK_PAGE_SIZE);
        const allChunks = response.chunks || [];
        const totalCount = response.total || 0;

        setChunks(allChunks);
        setTotal(totalCount);
        setSkip(CHUNK_PAGE_SIZE);
        setHasMore(allChunks.length < totalCount);
      }
    } catch (err) {
      // console.error('[DocumentChunks] 청크 조회 실패:', err);
      const errorMessage = err.response?.data?.message || err.message || '청크 조회에 실패했습니다.';
      setError(errorMessage);
      // console.error('[DocumentChunks] 설정된 에러 메시지:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [documentId, open, getDocumentChunks, isFilteredMode, relatedChunkIndices]);

  // Load more chunks (infinite scroll)
  const loadMoreChunks = useCallback(async () => {
    // 필터 모드일 때는 추가 로딩 비활성화
    if (!documentId || loadingMore || !hasMore || isFilteredMode) return;

    setLoadingMore(true);

    try {
      const response = await getDocumentChunks(documentId, skip, CHUNK_PAGE_SIZE);
      const newChunks = response.chunks || [];

      if (newChunks.length === 0) {
        setHasMore(false);
      } else {
        setChunks((prevChunks) => [...prevChunks, ...newChunks]);
        setSkip((prevSkip) => prevSkip + newChunks.length);
        setHasMore(chunks.length + newChunks.length < total);
      }
    } catch (err) {
      // console.error('추가 청크 조회 실패:', err);
      setError(err.response?.data?.message || '추가 청크 조회에 실패했습니다.');
    } finally {
      setLoadingMore(false);
    }
  }, [documentId, skip, hasMore, loadingMore, getDocumentChunks, chunks.length, total, isFilteredMode]);

  // Setup IntersectionObserver for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loading) return;

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loadingMore) {
        loadMoreChunks();
      }
    }, options);

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadingMore, loadMoreChunks]);

  // Load initial chunks when dialog opens
  useEffect(() => {
    if (open) {
      loadInitialChunks();
      loadDocumentAnalysisStatus();
    } else {
      setChunks([]);
      setSkip(0);
      setHasMore(true);
      setExpandedChunks({});
      setLlmSummaryCache({});
      setDocumentSummaryOpen(false);
      resetDocumentSummaryState();
    }
  }, [open, loadInitialChunks, loadDocumentAnalysisStatus, resetDocumentSummaryState]);

  const handleToggleExpand = (chunkId) => {
    setExpandedChunks((prev) => ({
      ...prev,
      [chunkId]: !prev[chunkId],
    }));
  };

  const handleViewLlmSummary = useCallback(async (chunk) => {
    if (!hasAnyLlmSummaries) {
      return;
    }
    const cached = llmSummaryCache[chunk.chunkIndex];
    setSummaryDialogOpen(true);
    setSelectedSummary({
      chunkIndex: chunk.chunkIndex,
      chunkText: chunk.chunkText,
      llmResponse: cached || '',
    });
    if (cached) {
      return;
    }
    setChunkSummaryLoadingIndex(chunk.chunkIndex);
    try {
      const response = await getLlmAnalysisResults(documentId, chunk.chunkIndex, 1);
      const result = response?.results?.find((item) => item.chunkIndex === chunk.chunkIndex) || response?.results?.[0];
      const llmResponse = result?.llmResponse || '';
      setLlmSummaryCache((prev) => ({
        ...prev,
        [chunk.chunkIndex]: llmResponse,
      }));
      setSelectedSummary({
        chunkIndex: chunk.chunkIndex,
        chunkText: chunk.chunkText,
        llmResponse,
      });
    } catch (err) {
      console.error('청크 요약 조회 실패:', err);
      setSelectedSummary((prev) => ({
        chunkIndex: chunk.chunkIndex,
        chunkText: chunk.chunkText,
        llmResponse: t('rag.chunks.summaryLoadFailed', 'LLM 요약을 불러오지 못했습니다.'),
      }));
    } finally {
      setChunkSummaryLoadingIndex(null);
    }
  }, [documentId, getLlmAnalysisResults, hasAnyLlmSummaries, llmSummaryCache, t]);

  const handleCloseSummary = useCallback(() => {
    setSummaryDialogOpen(false);
    setSelectedSummary(null);
    setChunkSummaryLoadingIndex(null);
  }, []);

  // Effect for highlighting and scrolling to a specific chunk
  useEffect(() => {
    if (highlightChunkId && chunks.length > 0) {
      const targetRef = chunkRefs.current[highlightChunkId];
      if (targetRef) {
        setTimeout(() => {
          targetRef.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 300); // Delay to allow for rendering

        if (!expandedChunks[highlightChunkId]) {
          handleToggleExpand(highlightChunkId);
        }
      }
    }
  }, [chunks, highlightChunkId]); // Reruns when chunks are loaded/updated

  // PDF 미리보기 핸들러
  const handlePreviewPDF = async () => {
    if (!documentId || !documentName) return;

    // PDF 파일인지 확인
    const isPdf = documentName.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return;
    }

    setPreviewDialogOpen(true);
    setLoadingPreview(true);
    setPreviewContent(null);

    try {
      // RAG API를 통해 PDF 다운로드
      const response = await api(`/api/rag/documents/${documentId}/download`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPreviewContent({ type: 'pdf', url });
      } else {
        throw new Error('PDF를 불러올 수 없습니다.');
      }
    } catch (err) {
      // console.error('PDF 미리보기 오류:', err);
      setPreviewContent({ type: 'error', message: err.message });
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
  };

  // PDF 다운로드 핸들러
  const handleDownloadPDF = async () => {
    if (!documentId || !documentName) return;

    try {
      // RAG API를 통해 PDF 다운로드
      const response = await api(`/api/rag/documents/${documentId}/download`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('파일 다운로드에 실패했습니다.');
      }
    } catch (err) {
      // console.error('파일 다운로드 오류:', err);
      setError(err.message);
    }
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

  useEffect(() => {
    if (documentSummaryOpen && documentSummaryEntries.length === 0 && documentSummaryHasMore && !documentSummaryLoading) {
      loadMoreDocumentSummary();
    }
  }, [documentSummaryOpen, documentSummaryEntries.length, documentSummaryHasMore, documentSummaryLoading, loadMoreDocumentSummary]);

  useEffect(() => {
    if (!documentSummaryOpen || !documentSummarySentinelRef.current || !documentSummaryHasMore) {
      return;
    }
    documentSummaryObserverRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !documentSummaryLoading) {
          loadMoreDocumentSummary();
        }
      },
      { root: null, rootMargin: '300px', threshold: 0 }
    );
    documentSummaryObserverRef.current.observe(documentSummarySentinelRef.current);
    return () => {
      documentSummaryObserverRef.current?.disconnect();
    };
  }, [documentSummaryOpen, documentSummaryHasMore, documentSummaryLoading, loadMoreDocumentSummary]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleDialogClose}
        maxWidth="lg"
        fullWidth
        fullScreen={isFullScreen}
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="div">
                {t('rag.chunks.dialog.title', '문서 청크 보기')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {documentName?.toLowerCase().endsWith('.pdf') && (
                  <PictureAsPdfIcon color="error" fontSize="small" />
                )}
                <Typography variant="body2" color="text.secondary">
                  {documentName}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={t('rag.chunks.viewCombinedSummary', 'LLM 분석 요약 보기')}>
                <span>
                  <IconButton
                    color="secondary"
                    onClick={handleOpenDocumentSummary}
                    aria-label="view llm summary"
                    disabled={!hasAnyLlmSummaries}
                  >
                    {documentSummaryOpen && documentSummaryLoading && documentSummaryEntries.length === 0 ? (
                      <CircularProgress size={20} />
                    ) : (
                      <SummarizeIcon />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
              {documentName?.toLowerCase().endsWith('.pdf') && (
                <>
                  <IconButton
                    color="primary"
                    onClick={handlePreviewPDF}
                    aria-label="preview pdf"
                    title="미리보기"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    color="success"
                    onClick={handleDownloadPDF}
                    aria-label="download pdf"
                    title="다운로드"
                  >
                    <DownloadIcon />
                  </IconButton>
                </>
              )}
              <Tooltip title={isFullScreen ? t('common.exitFullscreen', '전체화면 종료') : t('common.fullscreen', '전체화면')}>
                <IconButton
                  color="primary"
                  onClick={() => setIsFullScreen(prev => !prev)}
                  aria-label="toggle fullscreen"
                >
                  {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              </Tooltip>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleDialogClose}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && chunks.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {t('rag.chunks.empty', '청크가 없습니다. 문서를 먼저 분석해주세요.')}
              </Typography>
            </Box>
          )}

          {!loading && !error && chunks.length > 0 && (
            <>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {isFilteredMode && (
                  <Chip
                    label={t('rag.chunks.filteredMode', 'AI가 참조한 청크만 표시')}
                    color="info"
                    size="small"
                    variant="outlined"
                  />
                )}
                <Chip
                  label={`${t('rag.chunks.loaded', '로드됨')} ${chunks.length}${isFilteredMode ? '' : ` / ${total}`}`}
                  color="primary"
                  size="small"
                />
                {hasMore && !isFilteredMode && (
                  <Typography variant="caption" color="text.secondary">
                    {t('rag.chunks.scrollForMore', '스크롤하여 더 보기')}
                  </Typography>
                )}
              </Box>

              <List>
                {chunks.map((chunk, index) => {
                  const isExpanded = expandedChunks[chunk.id] || false;
                  const isHighlighted = chunk.id === highlightChunkId;
                  const displayText = isExpanded
                    ? chunk.chunkText
                    : truncateText(chunk.chunkText, 200);
                  const hasLlmSummary = hasAnyLlmSummaries;

                  return (
                    <React.Fragment key={chunk.id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        ref={(el) => (chunkRefs.current[chunk.id] = el)}
                        alignItems="flex-start"
                        sx={{
                          flexDirection: 'column',
                          backgroundColor: isHighlighted ? 'warning.light' : 'transparent',
                          transition: 'background-color 0.5s ease',
                          borderRadius: isHighlighted ? 1 : 0,
                          '&:hover': {
                            backgroundColor: isHighlighted ? 'warning.light' : 'action.hover',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                          <Chip
                            label={`#${chunk.chunkIndex + 1}`}
                            size="small"
                            color="default"
                            sx={{ mr: 1 }}
                          />
                          {hasLlmSummary && (
                            <Tooltip title={t('rag.chunks.viewLlmSummary', 'LLM 분석 요약 보기')}>
                              <span>
                                <IconButton
                                  size="small"
                                  color="secondary"
                                  onClick={() => handleViewLlmSummary(chunk)}
                                  sx={{ ml: 1 }}
                                  disabled={chunkSummaryLoadingIndex === chunk.chunkIndex}
                                >
                                  {chunkSummaryLoadingIndex === chunk.chunkIndex ? (
                                    <CircularProgress size={18} />
                                  ) : (
                                    <AutoAwesomeIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                            {formatDate(chunk.createdAt)}
                          </Typography>
                        </Box>

                        <ListItemText
                          primary={
                            <Box>
                              <Box
                                data-color-mode={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                                sx={chunkMarkdownStyles}
                              >
                                <MDEditor.Markdown
                                  source={displayText || ''}
                                  style={{ whiteSpace: 'pre-wrap' }}
                                />
                              </Box>
                              {chunk.chunkText.length > 200 && (
                                <Button
                                  size="small"
                                  onClick={() => handleToggleExpand(chunk.id)}
                                  endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                  sx={{ mt: 1 }}
                                >
                                  {isExpanded
                                    ? t('rag.chunks.showLess', '간략히')
                                    : t('rag.chunks.showMore', '더보기')}
                                </Button>
                              )}
                            </Box>
                          }
                        />

                        {chunk.chunkMetadata && Object.keys(chunk.chunkMetadata).length > 0 && (
                          <Box sx={{ mt: 1, width: '100%' }}>
                            <Typography variant="caption" color="text.secondary">
                              {t('rag.chunks.metadata', '메타데이터')}:
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 1, mt: 0.5, bgcolor: surfaceBackground }}>
                              <Typography variant="caption" component="pre" sx={{ m: 0 }}>
                                {JSON.stringify(chunk.chunkMetadata, null, 2)}
                              </Typography>
                            </Paper>
                          </Box>
                        )}
                      </ListItem>
                    </React.Fragment>
                  );
                })}
              </List>

              {/* Sentinel element for infinite scroll */}
              {hasMore && (
                <Box
                  ref={sentinelRef}
                  sx={{
                    height: 20,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: 2,
                  }}
                >
                  {loadingMore && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" color="text.secondary">
                        {t('rag.chunks.loadingMore', '추가 청크 로딩 중...')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {!hasMore && chunks.length > 0 && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('rag.chunks.allLoaded', '모든 청크를 불러왔습니다')}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose} variant="contained">
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
        slotProps={{
          paper: {
            sx: { minHeight: '80vh' }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PictureAsPdfIcon color="error" />
            <Typography variant="h6">{documentName}</Typography>
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
                allow="fullscreen"
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
      {/* 전체 LLM 분석 요약 다이얼로그 */}
      <Dialog
        open={documentSummaryOpen}
        onClose={handleCloseDocumentSummary}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { minHeight: '50vh' },
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SummarizeIcon color="secondary" />
            <Typography variant="h6">
              {t('rag.chunks.documentSummaryTitle', 'LLM 분석 요약')} - {documentName}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDocumentSummary} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: isFullScreen ? 'calc(100vh - 200px)' : '60vh', overflow: 'auto' }}>
          {!hasAnyLlmSummaries ? (
            <Alert severity="info">
              {t('rag.chunks.noLlmSummary', '아직 확인할 수 있는 LLM 분석 요약이 없습니다.')}
            </Alert>
          ) : (
            <>
              {documentSummaryEntries.length === 0 && documentSummaryLoading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary">
                    {t('rag.chunks.loadingLlmSummary', 'LLM 분석 요약을 불러오는 중입니다...')}
                  </Typography>
                </Box>
              )}

              {documentSummaryEntries.length === 0 && !documentSummaryLoading && (
                <Alert severity={documentSummaryError ? 'error' : 'info'}>
                  {documentSummaryError || t('rag.chunks.noLlmSummary', '아직 확인할 수 있는 LLM 분석 요약이 없습니다.')}
                </Alert>
              )}

              {documentSummaryEntries.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {documentSummaryEntries.map((entry, idx) => (
                    <Box key={`${entry.chunkIndex ?? idx}-${documentSummarySkip}-${idx}`}>
                      <Chip
                        label={`${t('rag.chunks.chunkLabel', '청크')} ${Number.isInteger(entry.chunkIndex) ? entry.chunkIndex + 1 : '?'}`}
                        size="small"
                        color="info"
                        sx={{ mb: 1 }}
                      />
                      <Box data-color-mode={colorMode} sx={chunkMarkdownStyles}>
                        <MDEditor.Markdown
                          source={(entry.llmResponse || '').trim()}
                          style={{ whiteSpace: 'pre-wrap' }}
                        />
                      </Box>
                    </Box>
                  ))}
                  <Box
                    ref={documentSummarySentinelRef}
                    sx={{ height: documentSummaryHasMore ? 32 : 0 }}
                  />
                  {documentSummaryLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
                  {!documentSummaryHasMore && documentSummaryEntries.length > 0 && (
                    <Typography variant="caption" color="text.secondary" align="center" sx={{ py: 1 }}>
                      {t('rag.chunks.allLoaded', '모든 청크를 불러왔습니다')}
                      {documentSummaryTotal ? ` (${documentSummaryEntries.length}/${documentSummaryTotal})` : ''}
                    </Typography>
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDocumentSummary}>{t('common.close', '닫기')}</Button>
        </DialogActions>
      </Dialog>
      {/* LLM 분석 요약 다이얼로그 */}
      <Dialog
        open={summaryDialogOpen}
        onClose={handleCloseSummary}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { minHeight: '60vh' }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="secondary" />
            <Typography variant="h6">
              {t('rag.chunks.llmSummaryTitle', 'LLM 분석 요약')}
              {selectedSummary && ` - 청크 #${selectedSummary.chunkIndex + 1}`}
            </Typography>
          </Box>
          <IconButton onClick={handleCloseSummary} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedSummary ? (
            <Box>
              {/* 원본 청크 텍스트 */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SummarizeIcon fontSize="small" />
                  {t('rag.chunks.originalText', '원본 텍스트')}
                </Typography>
                <Box
                  data-color-mode={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                  sx={{ ...chunkMarkdownStyles, maxHeight: '220px', overflow: 'auto' }}
                >
                  <MDEditor.Markdown
                    source={selectedSummary.chunkText || ''}
                    style={{ whiteSpace: 'pre-wrap' }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* LLM 분석 결과 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AutoAwesomeIcon fontSize="small" />
                  {t('rag.chunks.llmAnalysis', 'LLM 분석 결과')}
                </Typography>
                <Box
                  data-color-mode={colorMode}
                  sx={{ ...chunkMarkdownStyles, maxHeight: '400px', overflow: 'auto' }}
                >
                  {chunkSummaryLoadingIndex === selectedSummary.chunkIndex && !selectedSummary.llmResponse ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <MDEditor.Markdown
                      source={selectedSummary.llmResponse || t('rag.chunks.summaryNotReady', '아직 요약을 확인할 수 없습니다.')}
                      style={{ whiteSpace: 'pre-wrap' }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSummary}>{t('common.close', '닫기')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

DocumentChunks.propTypes = {
  documentId: PropTypes.string.isRequired,
  documentName: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  highlightChunkId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  relatedChunkIndices: PropTypes.arrayOf(PropTypes.number),
};

export default DocumentChunks;
