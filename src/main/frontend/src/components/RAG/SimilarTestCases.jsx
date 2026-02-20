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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TuneIcon from '@mui/icons-material/Tune';
import { useRAG } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';

const SIMILARITY_THRESHOLD = 0.81; // 81% 이상인 경우만 바로 표시

function SimilarTestCases({ projectId, onAddTestCase }) {
  const { t } = useI18n();
  const { searchSimilar, searchAdvanced, state, isRagEnabled, ragDisabledMessage } = useRAG();
  const [queryText, setQueryText] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [tabValue, setTabValue] = useState(0); // ICT-388: 탭 상태 추가

  // 고급 검색 설정
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(false);
  const [searchMethod, setSearchMethod] = useState('hybrid_rerank');
  const [vectorWeight, setVectorWeight] = useState(0.6);
  const [bm25Weight, setBm25Weight] = useState(0.4);

  const handleSearch = useCallback(async () => {
    if (!queryText.trim()) {
      return;
    }

    setSearchPerformed(true);
    setLocalError(null);
    setIsSearching(true);

    try {
      if (useAdvancedSearch) {
        // 고급 검색 사용
        await searchAdvanced(queryText, projectId, searchMethod, {
          maxResults: 10,
          similarityThreshold: 0.0,
          vectorWeight,
          bm25Weight,
          useReranker: searchMethod === 'hybrid_rerank',
        });
      } else {
        // 기본 검색 사용
        await searchSimilar(queryText, projectId, 10, 0.0);
      }
    } catch (error) {
      // console.error('검색 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '검색에 실패했습니다.';
      setLocalError(errorMessage);

      // 5초 후 자동으로 오류 메시지 제거
      setTimeout(() => {
        setLocalError(null);
      }, 5000);
    } finally {
      setIsSearching(false);
    }
  }, [queryText, projectId, useAdvancedSearch, searchMethod, vectorWeight, bm25Weight, searchSimilar, searchAdvanced]);

  const handleToggleExpand = useCallback((index) => {
    setExpandedIndex(prev => prev === index ? null : index);
  }, []);

  const handleCopyChunk = useCallback((chunkText) => {
    navigator.clipboard.writeText(chunkText);
  }, []);

  const handleAddAsTestCase = useCallback((chunk) => {
    if (onAddTestCase) {
      const fileName = chunk.fileName || t('rag.similar.unknownDocument', '알 수 없음');
      onAddTestCase({
        title: t('rag.similar.testCaseTitle', `테스트케이스 - ${fileName}`, { fileName }),
        content: chunk.chunkText,
        source: 'RAG',
        similarity: chunk.similarityScore,
      });
    }
  }, [onAddTestCase, t]);

  const getSimilarityColor = (similarity) => {
    if (similarity >= 0.8) return 'success';
    if (similarity >= 0.6) return 'warning';
    return 'default';
  };

  // ICT-388: 탭 변경 핸들러
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // ICT-388: 파일명 기준으로 TestCase 여부 판별
  const getSourceType = (result) => {
    // 파일명이 testcase_로 시작하면 TestCase로 분류
    if (result.fileName?.startsWith('testcase_')) {
      return 'testcase';
    }
    // 백엔드에서 sourceType을 제공하는 경우 우선 사용
    return result.sourceType || 'document';
  };

  // ICT-388: 검색 결과를 TestCase와 Document로 분리
  const testCaseResults = state.searchResults.filter(result => getSourceType(result) === 'testcase');
  const documentResults = state.searchResults.filter(result => getSourceType(result) === 'document');

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {t('rag.similar.title', '유사 검색')}
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        {t('rag.similar.description', '키워드나 설명을 입력하면 RAG 시스템이 유사한 테스트 케이스 또는 문서를 찾아줍니다.')}
      </Typography>

      {!isRagEnabled && (
        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
          {ragDisabledMessage || 'RAG (AI 문서) 기능이 시스템 관리자에 의해 임시 비활성화되었습니다.'}
        </Alert>
      )}

      {/* Search Input */}
      <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 3 }}>
        <TextField
          fullWidth
          disabled={!isRagEnabled}
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
          disabled={isSearching || !queryText.trim() || !isRagEnabled}
          sx={{ minWidth: 120 }}
        >
          {isSearching ? t('rag.similar.searching', '검색 중...') : t('rag.similar.search', '검색')}
        </Button>
      </Box>

      {/* Advanced Search Settings - 비활성화
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="advanced-search-content"
          id="advanced-search-header"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TuneIcon fontSize="small" />
            <Typography>{t('rag.similar.advancedSettings', '고급 검색 설정')}</Typography>
            <Chip
              label={useAdvancedSearch ? t('rag.similar.advancedSettings.enabled', '활성화') : t('rag.similar.advancedSettings.disabled', '비활성화')}
              size="small"
              color={useAdvancedSearch ? 'primary' : 'default'}
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useAdvancedSearch}
                  onChange={(e) => setUseAdvancedSearch(e.target.checked)}
                  color="primary"
                />
              }
              label={t('rag.similar.advancedSettings.use', '고급 검색 사용')}
            />

            {useAdvancedSearch && (
              <>
                <FormControl fullWidth size="small">
                  <InputLabel id="search-method-label">{t('rag.similar.searchMethod', '검색 방법')}</InputLabel>
                  <Select
                    labelId="search-method-label"
                    value={searchMethod}
                    label={t('rag.similar.searchMethod', '검색 방법')}
                    onChange={(e) => setSearchMethod(e.target.value)}
                  >
                    <MenuItem value="vector">
                      <Box>
                        <Typography variant="body2">{t('rag.similar.searchMethod.vector', '벡터 검색')}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('rag.similar.searchMethod.vector.description', '의미적 유사도 기반 (순수 벡터)')}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="bm25">
                      <Box>
                        <Typography variant="body2">{t('rag.similar.searchMethod.bm25', 'BM25 검색')}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('rag.similar.searchMethod.bm25.description', '키워드 기반 (정확한 단어 매칭)')}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="hybrid">
                      <Box>
                        <Typography variant="body2">{t('rag.similar.searchMethod.hybrid', '하이브리드 검색')}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('rag.similar.searchMethod.hybrid.description', '벡터 + BM25 결합 (RRF)')}
                        </Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="hybrid_rerank">
                      <Box>
                        <Typography variant="body2">{t('rag.similar.searchMethod.hybridRerank', '하이브리드 + Reranker ⭐')}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t('rag.similar.searchMethod.hybridRerank.description', '최고 품질 (권장) - 느림')}
                        </Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                {(searchMethod === 'hybrid' || searchMethod === 'hybrid_rerank') && (
                  <Box sx={{ px: 1 }}>
                    <Typography variant="body2" gutterBottom>
                      {t('rag.similar.weightAdjustment', '검색 가중치 조정')}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('rag.similar.vectorWeight', '벡터 검색: {weight}%', { weight: (vectorWeight * 100).toFixed(0) })}
                      </Typography>
                      <Slider
                        value={vectorWeight}
                        onChange={(e, newValue) => {
                          setVectorWeight(newValue);
                          setBm25Weight(1 - newValue);
                        }}
                        min={0}
                        max={1}
                        step={0.1}
                        marks={[
                          { value: 0, label: '0%' },
                          { value: 0.5, label: '50%' },
                          { value: 1, label: '100%' },
                        ]}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {t('rag.similar.bm25Weight', 'BM25 검색: {weight}%', { weight: (bm25Weight * 100).toFixed(0) })}
                      </Typography>
                      <Slider
                        value={bm25Weight}
                        onChange={(e, newValue) => {
                          setBm25Weight(newValue);
                          setVectorWeight(1 - newValue);
                        }}
                        min={0}
                        max={1}
                        step={0.1}
                        marks={[
                          { value: 0, label: '0%' },
                          { value: 0.5, label: '50%' },
                          { value: 1, label: '100%' },
                        ]}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                    </Box>
                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="caption">
                        <strong>{t('rag.similar.recommendedSettings', '추천 설정: 벡터 60% + BM25 40% (한국어 최적화)')}</strong>
                      </Typography>
                    </Alert>
                  </Box>
                )}

                <Alert severity="info" icon={false}>
                  <Typography variant="caption">
                    {searchMethod === 'vector' && t('rag.similar.searchMethod.vector.info', '📊 의미적 유사도를 기반으로 검색합니다. 비슷한 의미를 가진 문서를 찾습니다.')}
                    {searchMethod === 'bm25' && t('rag.similar.searchMethod.bm25.info', '🔍 키워드 기반 검색입니다. 정확한 단어 매칭에 강합니다.')}
                    {searchMethod === 'hybrid' && t('rag.similar.searchMethod.hybrid.info', '⚡ 벡터와 BM25를 결합하여 균형잡힌 검색 결과를 제공합니다.')}
                    {searchMethod === 'hybrid_rerank' && t('rag.similar.searchMethod.hybridRerank.info', '⭐ 하이브리드 검색 후 Reranker로 재순위를 매겨 최고 품질의 결과를 제공합니다. (처리 시간: 약 2-3배)')}
                  </Typography>
                </Alert>
              </>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
      */}

      {/* Loading Indicator */}
      {isSearching && <LinearProgress sx={{ mb: 2 }} />}

      {/* Local Error Alert */}
      {localError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>
          {localError}
        </Alert>
      )}

      {/* No Results */}
      {searchPerformed && !isSearching && !localError && state.searchResults.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('rag.similar.noResults', '검색 결과가 없습니다. 다른 키워드로 시도해보세요.')}
        </Alert>
      )}

      {searchPerformed && !isSearching && !localError && state.searchResults.length > 0 && !state.searchResults.some(result => result.similarityScore >= SIMILARITY_THRESHOLD) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t('rag.similar.noHighSimilarityResults', '82% 이상의 유사도를 가진 문서가 없습니다. 아래에서 유사도가 낮은 결과를 확인하세요.')}
        </Alert>
      )}

      {/* Search Results */}
      {state.searchResults.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {t('rag.similar.resultsCount', '검색 결과 ({count}개)', { count: state.searchResults.length })}
          </Typography>

          {/* ICT-388: 탭으로 검색 결과 분류 */}
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tab
              label={`${t('rag.similar.testCaseResults', '테스트케이스')} (${testCaseResults.length})`}
              icon={<AssignmentIcon />}
              iconPosition="start"
            />
            <Tab
              label={`${t('rag.similar.documentResults', '문서')} (${documentResults.length})`}
              icon={<DescriptionIcon />}
              iconPosition="start"
            />
          </Tabs>

          {/* 탭 0: TestCase 검색 결과 */}
          {tabValue === 0 && testCaseResults.length > 0 && (
            <Box>
              {testCaseResults.map((result, index) => {
                const sourceType = getSourceType(result);
                const isAboveThreshold = result.similarityScore >= SIMILARITY_THRESHOLD;
                const isExpanded = expandedIndex === `testcase-${index}`;

                return (
                  <Card key={`testcase-${index}`} sx={{ mb: 2 }} elevation={1}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AssignmentIcon color="primary" fontSize="small" />
                          <Typography variant="subtitle2" color="text.secondary">
                            {result.fileName && result.fileName.startsWith('testcase_') ? (
                              (() => {
                                const testCaseId = result.fileName.replace('testcase_', '').replace('.txt', '');
                                const testCaseUrl = `/projects/${projectId}/testcases/${testCaseId}`;
                                return (
                                  <a href={testCaseUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {testCaseId}
                                  </a>
                                );
                              })()
                            ) : (
                              result.fileName || 'Unknown Document'
                            )}
                          </Typography>
                          <Chip
                            label={t('rag.similar.sourceTestcase', '테스트케이스')}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </Box>
                        <Chip
                          label={`${(result.similarityScore * 100).toFixed(1)}%`}
                          color={getSimilarityColor(result.similarityScore)}
                          size="small"
                        />
                      </Box>

                      {(isAboveThreshold || isExpanded) && (
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: expandedIndex === `testcase-${index}` ? 'unset' : 3,
                              WebkitBoxOrient: 'vertical',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {result.chunkText}
                          </Typography>

                          {result.chunkText && result.chunkText.split('\n').length > 3 && (
                            <IconButton
                              size="small"
                              onClick={() => handleToggleExpand(`testcase-${index}`)}
                              sx={{ mt: 0.5 }}
                            >
                              {expandedIndex === `testcase-${index}` ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          )}

                          <Divider sx={{ my: 1 }} />

                          <Typography variant="caption" color="text.secondary">
                            {t('rag.similar.metadata', '문서 ID: {documentId} | 청크 순서: {chunkIndex}', {
                              documentId: result.documentId,
                              chunkIndex: result.chunkIndex + 1
                            })}
                          </Typography>

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
                        </>
                      )}

                      {!isAboveThreshold && !isExpanded && (
                        <Button
                          size="small"
                          onClick={() => handleToggleExpand(`testcase-${index}`)}
                          sx={{ mt: 1, color: 'text.secondary' }}
                        >
                          {t('rag.similar.lowSimilarityCollapsed', '자세히 보기')}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}

          {/* 탭 1: Document 검색 결과 */}
          {tabValue === 1 && documentResults.length > 0 && (
            <Box>
              {documentResults.map((result, index) => {
                const sourceType = getSourceType(result);
                const isAboveThreshold = result.similarityScore >= SIMILARITY_THRESHOLD;
                const isExpanded = expandedIndex === `document-${index}`;

                return (
                  <Card key={`document-${index}`} sx={{ mb: 2 }} elevation={1}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon color="action" fontSize="small" />
                          <Typography variant="subtitle2" color="text.secondary">
                            {result.fileName || 'Unknown Document'}
                          </Typography>
                          <Chip
                            label={t('rag.similar.sourceDocument', '문서')}
                            size="small"
                            variant="outlined"
                            color="default"
                          />
                        </Box>
                        <Chip
                          label={`${(result.similarityScore * 100).toFixed(1)}%`}
                          color={getSimilarityColor(result.similarityScore)}
                          size="small"
                        />
                      </Box>

                      {(isAboveThreshold || isExpanded) && (
                        <>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: expandedIndex === `document-${index}` ? 'unset' : 3,
                              WebkitBoxOrient: 'vertical',
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {result.chunkText}
                          </Typography>

                          {result.chunkText && result.chunkText.split('\n').length > 3 && (
                            <IconButton
                              size="small"
                              onClick={() => handleToggleExpand(`document-${index}`)}
                              sx={{ mt: 0.5 }}
                            >
                              {expandedIndex === `document-${index}` ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          )}

                          <Divider sx={{ my: 1 }} />

                          <Typography variant="caption" color="text.secondary">
                            {t('rag.similar.metadata', '문서 ID: {documentId} | 청크 순서: {chunkIndex}', {
                              documentId: result.documentId,
                              chunkIndex: result.chunkIndex + 1
                            })}
                          </Typography>

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
                        </>
                      )}

                      {!isAboveThreshold && !isExpanded && (
                        <Button
                          size="small"
                          onClick={() => handleToggleExpand(`document-${index}`)}
                          sx={{ mt: 1, color: 'text.secondary' }}
                        >
                          {t('rag.similar.lowSimilarityCollapsed', '자세히 보기')}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
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
