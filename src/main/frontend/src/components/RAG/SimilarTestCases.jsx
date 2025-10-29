// src/components/RAG/SimilarTestCases.jsx
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  IconButton,
  Collapse,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useRAG } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';

function SimilarTestCases({ projectId, onAddTestCase }) {
  const { t } = useI18n();
  const { searchSimilar, state } = useRAG();
  const [queryText, setQueryText] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!queryText.trim()) {
      return;
    }

    setSearchPerformed(true);
    try {
      await searchSimilar(queryText, projectId, 10, 0.0);
    } catch (error) {
      console.error('검색 실패:', error);
    }
  }, [queryText, projectId, searchSimilar]);

  const handleToggleExpand = useCallback((index) => {
    setExpandedIndex(prev => prev === index ? null : index);
  }, []);

  const handleCopyChunk = useCallback((chunkText) => {
    navigator.clipboard.writeText(chunkText);
  }, []);

  const handleAddAsTestCase = useCallback((chunk) => {
    if (onAddTestCase) {
      const fileName = chunk.documentFileName || t('rag.similar.unknownDocument', '알 수 없음');
      onAddTestCase({
        title: t('rag.similar.testCaseTitle', `테스트케이스 - ${fileName}`, { fileName }),
        content: chunk.chunkText,
        source: 'RAG',
        similarity: chunk.similarity,
      });
    }
  }, [onAddTestCase, t]);

  const getSimilarityColor = (similarity) => {
    if (similarity >= 0.8) return 'success';
    if (similarity >= 0.6) return 'warning';
    return 'default';
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('rag.similar.title', '유사 테스트케이스 검색')}
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        {t('rag.similar.description', '키워드나 설명을 입력하면 RAG 시스템이 유사한 테스트케이스를 찾아줍니다.')}
      </Typography>

      {/* Search Input */}
      <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 3 }}>
        <TextField
          fullWidth
          label={t('rag.similar.searchQuery', '검색어')}
          placeholder={t('rag.similar.searchPlaceholder', '예: 로그인 기능 테스트, 회원가입 유효성 검사')}
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
          variant="outlined"
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={state.loading || !queryText.trim()}
          sx={{ minWidth: 120 }}
        >
          {t('rag.similar.search', '검색')}
        </Button>
      </Box>

      {/* Loading Indicator */}
      {state.loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Error Alert */}
      {state.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.error}
        </Alert>
      )}

      {/* No Results */}
      {searchPerformed && !state.loading && state.searchResults.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('rag.similar.noResults', '검색 결과가 없습니다. 다른 키워드로 시도해보세요.')}
        </Alert>
      )}

      {/* Search Results */}
      {state.searchResults.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {t('rag.similar.resultsCount', `검색 결과 (${state.searchResults.length}개)`)}
          </Typography>

          {state.searchResults.map((result, index) => (
            <Card key={index} sx={{ mb: 2 }} elevation={1}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {result.documentFileName || 'Unknown Document'}
                  </Typography>
                  <Chip
                    label={`${(result.similarity * 100).toFixed(1)}%`}
                    color={getSimilarityColor(result.similarity)}
                    size="small"
                  />
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: expandedIndex === index ? 'unset' : 3,
                    WebkitBoxOrient: 'vertical',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {result.chunkText}
                </Typography>

                {result.chunkText.split('\n').length > 3 && (
                  <IconButton
                    size="small"
                    onClick={() => handleToggleExpand(index)}
                    sx={{ mt: 0.5 }}
                  >
                    {expandedIndex === index ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                )}

                <Divider sx={{ my: 1 }} />

                <Typography variant="caption" color="text.secondary">
                  {t('rag.similar.metadata', `문서 ID: ${result.documentId} | 청크 순서: ${result.chunkIndex + 1}`)}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopyChunk(result.chunkText)}
                >
                  {t('rag.similar.copy', '복사')}
                </Button>
                <Button
                  size="small"
                  color="primary"
                  startIcon={<AddCircleIcon />}
                  onClick={() => handleAddAsTestCase(result)}
                >
                  {t('rag.similar.addTestCase', '테스트케이스로 추가')}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Paper>
  );
}

SimilarTestCases.propTypes = {
  projectId: PropTypes.string.isRequired,
  onAddTestCase: PropTypes.func,
};

export default SimilarTestCases;
