// src/components/RAG/DocumentChunks.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useRAG } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';

const CHUNK_PAGE_SIZE = 50; // 한 번에 로드할 청크 개수

function DocumentChunks({ documentId, documentName, open, onClose, highlightChunkId }) {
  const { t } = useI18n();
  const { getDocumentChunks } = useRAG();

  // State for chunks and pagination
  const [chunks, setChunks] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [expandedChunks, setExpandedChunks] = useState({});

  // Ref for intersection observer and chunk elements
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const chunkRefs = useRef({});

  // Load initial chunks
  const loadInitialChunks = useCallback(async () => {
    if (!documentId || !open) return;

    setLoading(true);
    setError(null);
    setChunks([]);
    setSkip(0);
    setHasMore(true);
    chunkRefs.current = {};

    try {
      const response = await getDocumentChunks(documentId, 0, CHUNK_PAGE_SIZE);
      const newChunks = response.chunks || [];
      const totalCount = response.total || 0;

      setChunks(newChunks);
      setTotal(totalCount);
      setSkip(CHUNK_PAGE_SIZE);
      setHasMore(newChunks.length < totalCount);
    } catch (err) {
      console.error('청크 조회 실패:', err);
      setError(err.response?.data?.message || '청크 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [documentId, open, getDocumentChunks]);

  // Load more chunks (infinite scroll)
  const loadMoreChunks = useCallback(async () => {
    if (!documentId || loadingMore || !hasMore) return;

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
      console.error('추가 청크 조회 실패:', err);
      setError(err.response?.data?.message || '추가 청크 조회에 실패했습니다.');
    } finally {
      setLoadingMore(false);
    }
  }, [documentId, skip, hasMore, loadingMore, getDocumentChunks, chunks.length, total]);

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
    } else {
      setChunks([]);
      setSkip(0);
      setHasMore(true);
      setExpandedChunks({});
    }
  }, [open, loadInitialChunks]);

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" component="div">
              {t('rag.chunks.dialog.title', '문서 청크 보기')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {documentName}
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
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
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${t('rag.chunks.loaded', '로드됨')} ${chunks.length} / ${total}`}
                color="primary"
                size="small"
              />
              {hasMore && (
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
                          <Paper variant="outlined" sx={{ p: 1, mt: 0.5, bgcolor: 'grey.50' }}>
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
  );
}

DocumentChunks.propTypes = {
  documentId: PropTypes.string.isRequired,
  documentName: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  highlightChunkId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default DocumentChunks;
