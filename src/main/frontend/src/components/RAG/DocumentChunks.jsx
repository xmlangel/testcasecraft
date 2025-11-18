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
import { alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useRAG } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const CHUNK_PAGE_SIZE = 50; // 한 번에 로드할 청크 개수
const MAX_CHUNK_API_LIMIT = 100; // 백엔드 RAG API가 허용하는 최대 limit 값
const LLM_SUMMARY_PAGE_SIZE = 200; // 백엔드 LLM 분석 결과 조회 시 안전한 페이지 크기

const surfaceBackground = (theme) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.04)
    : theme.palette.grey[50];

const surfaceBorder = (theme) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.2)
    : theme.palette.grey[300];

const inlineCodeBackground = (theme) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.12)
    : theme.palette.grey[100];

const codeBlockBackground = (theme) =>
  theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.06)
    : theme.palette.grey[900];

const codeBlockTextColor = (theme) =>
  theme.palette.mode === 'dark'
    ? theme.palette.grey[100]
    : theme.palette.grey[50];

function DocumentChunks({ documentId, documentName, open, onClose, highlightChunkId, relatedChunkIndices }) {
  const { t } = useI18n();
  const { getDocumentChunks, getLlmAnalysisResults } = useRAG();
  const { api } = useAppContext();

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
  const [llmSummaries, setLlmSummaries] = useState({}); // chunkIndex -> llmResponse 매핑
  const [loadingLlmSummaries, setLoadingLlmSummaries] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [documentSummaryOpen, setDocumentSummaryOpen] = useState(false);

  // 관련 청크만 보기 모드 여부
  const isFilteredMode = relatedChunkIndices && relatedChunkIndices.length > 0;

  // Ref for intersection observer and chunk elements
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const chunkRefs = useRef({});

  // Load LLM analysis summaries
  const loadLlmSummaries = useCallback(async () => {
    if (!documentId || !open) {
      return;
    }

    setLoadingLlmSummaries(true);

    try {
      const summaryMap = {};
      let skipValue = 0;
      let totalResults = 0;

      // LLM 분석 결과 조회 (모든 청크에 대해 페이지 단위로)
      // 백엔드 제한을 피하기 위해 200개 단위로 요청
      // 총 개수를 모르면 응답 길이를 기준으로 반복 종료
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const response = await getLlmAnalysisResults(documentId, skipValue, LLM_SUMMARY_PAGE_SIZE);
        const results = response?.results || [];

        if (results.length === 0) {
          break;
        }

        results.forEach((result) => {
          if (result.chunkIndex !== undefined && result.llmResponse) {
            summaryMap[result.chunkIndex] = result.llmResponse;
          }
        });

        totalResults += results.length;
        skipValue += results.length;

        if (results.length < LLM_SUMMARY_PAGE_SIZE) {
          break;
        }
      }

      if (totalResults > 0) {
        setLlmSummaries(summaryMap);
      } else {
        setLlmSummaries({});
      }
    } catch (err) {
      // LLM 분석 결과가 없는 경우 무시 (404 에러)
      if (err.response?.status !== 404) {
        console.error('LLM 분석 결과 조회 실패:', err);
      }
      setLlmSummaries({});
    } finally {
      setLoadingLlmSummaries(false);
    }
  }, [documentId, open, getLlmAnalysisResults]);

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
      loadLlmSummaries(); // LLM 분석 결과도 함께 로드
    } else {
      setChunks([]);
      setSkip(0);
      setHasMore(true);
      setExpandedChunks({});
      setLlmSummaries({});
      setDocumentSummaryOpen(false);
    }
  }, [open, loadInitialChunks, loadLlmSummaries]);

  const handleToggleExpand = (chunkId) => {
    setExpandedChunks((prev) => ({
      ...prev,
      [chunkId]: !prev[chunkId],
    }));
  };

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

  // LLM 요약 보기 핸들러
  const handleViewLlmSummary = (chunk) => {
    if (!chunk || chunk.chunkIndex === undefined) return;

    const summary = llmSummaries[chunk.chunkIndex];
    if (!summary) return;

    setSelectedSummary({
      chunkIndex: chunk.chunkIndex,
      chunkText: chunk.chunkText,
      llmResponse: summary,
    });
    setSummaryDialogOpen(true);
  };

  const hasAnyLlmSummaries = useMemo(
    () => Object.keys(llmSummaries).length > 0,
    [llmSummaries]
  );

  const combinedLlmSummary = useMemo(() => {
    const indices = Object.keys(llmSummaries)
      .map((key) => Number(key))
      .filter((index) => Number.isInteger(index))
      .sort((a, b) => a - b);

    if (indices.length === 0) {
      return '';
    }

    return indices
      .map((chunkIndex) => {
        const cleanedResponse = (llmSummaries[chunkIndex] || '')
          .replace(/\n{2,}/g, '\n')
          .trim();
        return `### 📄 ${t('rag.chunks.chunkLabel', '청크')} ${chunkIndex + 1}\n${cleanedResponse}`;
      })
      .join('\n\n---\n\n');
  }, [llmSummaries, t]);

  // LLM 요약 다이얼로그 닫기
  const handleCloseSummary = () => {
    setSummaryDialogOpen(false);
    setSelectedSummary(null);
  };

  const handleOpenDocumentSummary = () => {
    if (!hasAnyLlmSummaries) return;
    setDocumentSummaryOpen(true);
  };

  const handleCloseDocumentSummary = () => {
    setDocumentSummaryOpen(false);
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

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
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
                  {loadingLlmSummaries ? (
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
            <IconButton
              edge="end"
              color="inherit"
              onClick={onClose}
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
                const hasLlmSummary = llmSummaries[chunk.chunkIndex] !== undefined;

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
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleViewLlmSummary(chunk)}
                              sx={{ ml: 1 }}
                            >
                              <AutoAwesomeIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                          {formatDate(chunk.createdAt)}
                        </Typography>
                      </Box>

                      <ListItemText
                        primary={
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                            >
                              {displayText}
                            </Typography>
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
        <Button onClick={onClose} variant="contained">
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
      PaperProps={{
        sx: { minHeight: '50vh' },
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
      <DialogContent dividers>
        {loadingLlmSummaries ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              {t('rag.chunks.loadingLlmSummary', 'LLM 분석 요약을 불러오는 중입니다...')}
            </Typography>
          </Box>
        ) : hasAnyLlmSummaries && combinedLlmSummary ? (
          <Box
            data-color-mode="light"
            sx={{
              border: '1px solid',
              borderColor: surfaceBorder,
              borderRadius: 1,
              maxHeight: '60vh',
              overflow: 'auto',
              '& .wmde-markdown': {
                p: 2,
                bgcolor: 'background.paper',
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
              },
            }}
          >
            <MDEditor.Markdown
              source={combinedLlmSummary}
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </Box>
        ) : (
          <Alert severity="info">
            {t('rag.chunks.noLlmSummary', '아직 확인할 수 있는 LLM 분석 요약이 없습니다.')}
          </Alert>
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
      PaperProps={{
        sx: { minHeight: '60vh' }
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
              <Paper variant="outlined" sx={{ p: 2, bgcolor: surfaceBackground, maxHeight: '200px', overflow: 'auto' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selectedSummary.chunkText}
                </Typography>
              </Paper>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* LLM 분석 결과 */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AutoAwesomeIcon fontSize="small" />
                {t('rag.chunks.llmAnalysis', 'LLM 분석 결과')}
              </Typography>
              <Box
                data-color-mode="light"
                sx={{
                  border: '1px solid',
                  borderColor: surfaceBorder,
                  borderRadius: 1,
                  maxHeight: '400px',
                  overflow: 'auto',
                  '& .wmde-markdown': {
                    p: 2,
                    bgcolor: 'background.paper',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  },
                  '& .wmde-markdown h1, & .wmde-markdown h2, & .wmde-markdown h3': {
                    mt: 1,
                    mb: 0.5,
                  },
                  '& .wmde-markdown p': {
                    mb: 0.5,
                    mt: 0,
                  },
                  '& .wmde-markdown ul, & .wmde-markdown ol': {
                    pl: 3,
                    mb: 0.5,
                    mt: 0,
                  },
                  '& .wmde-markdown code': {
                    bgcolor: inlineCodeBackground,
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: '0.875rem',
                  },
                  '& .wmde-markdown pre': {
                    bgcolor: codeBlockBackground,
                    color: codeBlockTextColor,
                    p: 1.5,
                    borderRadius: 1,
                    overflow: 'auto',
                  },
                }}
              >
                <MDEditor.Markdown
                  source={selectedSummary.llmResponse}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
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
