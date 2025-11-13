// src/components/RAG/DocumentAnalysis.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Typography,
  Box,
  Alert,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { useRAG } from '../../context/RAGContext.jsx';
import { useLlmConfig } from '../../context/LlmConfigContext.jsx';
import CostWarningDialog from './CostWarningDialog.jsx';
import BatchConfirmDialog from './BatchConfirmDialog.jsx';

/**
 * 문서 LLM 분석 메인 컴포넌트
 * 비용 추정, 분석 시작, 진행 상황 모니터링, 결과 표시
 */
function DocumentAnalysis({ document }) {
  const {
    estimateAnalysisCost,
    startLlmAnalysis,
    getLlmAnalysisStatus,
    getLlmAnalysisResults,
    pauseAnalysis,
    resumeAnalysis,
    cancelAnalysis,
  } = useRAG();

  const { configs } = useLlmConfig();

  // 선택된 LLM 설정 ID
  const [selectedConfigId, setSelectedConfigId] = useState('');

  // 분석 설정
  const [config, setConfig] = useState({
    llmConfigId: '', // LLM Config ID (Backend에서 실제 API key 조회용)
    llmProvider: '',
    llmModel: '',
    llmApiKey: '',
    llmBaseUrl: '',
    promptTemplate: '다음 텍스트를 요약하세요:\n\n{chunk_text}',
    chunkBatchSize: 10,
    pauseAfterBatch: true,
    maxTokens: 500,
    temperature: 0.7,
  });

  // 상태 관리
  const [analyzing, setAnalyzing] = useState(false);
  const [status, setStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [costEstimate, setCostEstimate] = useState(null);
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 결과 페이지네이션
  const [resultsPage, setResultsPage] = useState(0);
  const [resultsRowsPerPage, setResultsRowsPerPage] = useState(10);

  // 폴링 인터벌 관리
  const pollingIntervalRef = useRef(null);
  const previousStatusRef = useRef(null);

  // 활성화된 설정 필터링
  const activeConfigs = configs.filter((c) => c.isActive);

  // 기본 설정 자동 선택
  useEffect(() => {
    if (activeConfigs.length > 0 && !selectedConfigId) {
      const defaultConfig = activeConfigs.find((c) => c.isDefault) || activeConfigs[0];
      if (defaultConfig) {
        setSelectedConfigId(defaultConfig.id);
      }
    }
  }, [activeConfigs, selectedConfigId]);

  // 선택된 설정에 따라 config 업데이트
  useEffect(() => {
    if (selectedConfigId) {
      const selectedConfig = configs.find((c) => c.id === selectedConfigId);
      if (selectedConfig) {
        // Provider 매핑 제거: LLM Config의 설정을 그대로 사용
        // Backend에서 LLM Config ID로 실제 API key를 조회하여 FastAPI로 전달
        const providerValue = typeof selectedConfig.provider === 'string'
          ? selectedConfig.provider.toLowerCase()
          : selectedConfig.provider;

        setConfig((prev) => ({
          ...prev,
          llmConfigId: selectedConfig.id, // Backend에서 LLM Config 조회용
          llmProvider: providerValue, // 매핑 없이 그대로 사용
          llmModel: selectedConfig.modelName,
          llmApiKey: '', // Backend에서 LLM Config로부터 가져옴
          llmBaseUrl: selectedConfig.apiUrl || '',
        }));

        console.log('LLM 설정 적용:', {
          configId: selectedConfig.id,
          provider: providerValue,
          model: selectedConfig.modelName,
          apiUrl: selectedConfig.apiUrl,
        });
      }
    }
  }, [selectedConfigId, configs]);

  // LLM 설정 선택 핸들러
  const handleLlmConfigChange = (event) => {
    setSelectedConfigId(event.target.value);
  };

  // 설정 변경 핸들러
  const handleConfigChange = (field) => (event) => {
    const value = event.target.value;
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 비용 추정
  const handleEstimateCost = useCallback(async () => {
    if (!document?.id) return;

    // 유효성 검사
    if (!config.llmProvider || !config.llmModel || !config.promptTemplate) {
      setError('LLM 설정을 먼저 선택하고 필수 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 백엔드 DTO에 맞는 필드 전달 (llmConfigId 포함)
      const requestData = {
        llmConfigId: config.llmConfigId, // Backend에서 LLM Config 조회용
        llmProvider: config.llmProvider,
        llmModel: config.llmModel,
        promptTemplate: config.promptTemplate,
        maxTokens: config.maxTokens,
      };

      console.log('비용 추정 요청:', requestData); // 디버깅용
      console.log('Document ID:', document.id); // 디버깅용

      const estimate = await estimateAnalysisCost(document.id, requestData);
      setCostEstimate(estimate);
      setShowCostDialog(true);
    } catch (err) {
      console.error('비용 추정 오류:', err);
      console.error('에러 응답 데이터:', err.response?.data); // 상세 에러 정보

      // 에러 메시지 추출
      let errorMessage = '비용 추정에 실패했습니다.';

      if (err.response?.data) {
        const data = err.response.data;
        if (data.message) {
          errorMessage = data.message;
        }
        if (data.details) {
          const detailMessages = Object.entries(data.details)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
          errorMessage += ` (${detailMessages})`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [document, config, estimateAnalysisCost]);

  // 분석 시작
  const handleStartAnalysis = useCallback(async () => {
    if (!document?.id) return;

    // 유효성 검사
    if (!config.llmProvider || !config.llmModel || !config.promptTemplate) {
      setError('LLM 설정을 먼저 선택하고 필수 항목을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setShowCostDialog(false);

    try {
      // 백엔드 DTO에 맞는 필드 전달 (llmConfigId 포함)
      const requestData = {
        llmConfigId: config.llmConfigId, // Backend에서 LLM Config 조회용
        llmProvider: config.llmProvider,
        llmModel: config.llmModel,
        llmApiKey: config.llmApiKey || undefined, // 빈 문자열은 undefined로
        llmBaseUrl: config.llmBaseUrl || undefined,
        promptTemplate: config.promptTemplate,
        chunkBatchSize: config.chunkBatchSize,
        pauseAfterBatch: config.pauseAfterBatch,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
      };

      console.log('분석 시작 요청:', requestData); // 디버깅용

      const response = await startLlmAnalysis(document.id, requestData);
      setAnalyzing(true);
      setStatus(response);
      // 상태 폴링 시작
      startStatusPolling();
    } catch (err) {
      console.error('분석 시작 오류:', err);
      setError(err.response?.data?.message || err.message || 'LLM 분석 시작에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [document, config, startLlmAnalysis]);

  // 상태 폴링 시작
  const startStatusPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const currentStatus = await getLlmAnalysisStatus(document.id);
        setStatus(currentStatus);

        // 상태 변화 감지
        const prevStatus = previousStatusRef.current?.status;
        const currentStatusValue = currentStatus?.status;

        // 배치 처리 완료 (paused 상태로 변경)
        if (prevStatus === 'processing' && currentStatusValue === 'paused') {
          setShowBatchDialog(true);
        }

        // 분석 완료 또는 실패 시 폴링 중지
        if (
          currentStatusValue === 'completed' ||
          currentStatusValue === 'failed' ||
          currentStatusValue === 'cancelled'
        ) {
          stopStatusPolling();
          setAnalyzing(false);

          // 결과 로드
          if (currentStatusValue === 'completed') {
            await loadResults();
          }
        }

        previousStatusRef.current = currentStatus;
      } catch (err) {
        console.error('상태 조회 실패:', err);
      }
    }, 2000); // 2초 간격
  }, [document, getLlmAnalysisStatus]);

  // 상태 폴링 중지
  const stopStatusPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // 결과 로드
  const loadResults = useCallback(async () => {
    if (!document?.id) return;

    try {
      const resultsData = await getLlmAnalysisResults(
        document.id,
        resultsPage * resultsRowsPerPage,
        resultsRowsPerPage
      );
      setResults(resultsData);
    } catch (err) {
      console.error('결과 조회 실패:', err);
    }
  }, [document, resultsPage, resultsRowsPerPage, getLlmAnalysisResults]);

  // 일시정지
  const handlePause = useCallback(async () => {
    if (!document?.id) return;

    try {
      const response = await pauseAnalysis(document.id);
      setStatus(response);
      setShowBatchDialog(false);
      stopStatusPolling();
      setAnalyzing(false);
    } catch (err) {
      setError(err.message || '일시정지에 실패했습니다.');
    }
  }, [document, pauseAnalysis]);

  // 재개
  const handleResume = useCallback(async () => {
    if (!document?.id) return;

    setShowBatchDialog(false);

    try {
      const response = await resumeAnalysis(document.id);
      setStatus(response);
      setAnalyzing(true);
      startStatusPolling();
    } catch (err) {
      setError(err.message || '재개에 실패했습니다.');
    }
  }, [document, resumeAnalysis, startStatusPolling]);

  // 취소
  const handleCancel = useCallback(async () => {
    if (!document?.id) return;

    try {
      const response = await cancelAnalysis(document.id);
      setStatus(response);
      setShowBatchDialog(false);
      stopStatusPolling();
      setAnalyzing(false);
    } catch (err) {
      setError(err.message || '취소에 실패했습니다.');
    }
  }, [document, cancelAnalysis]);

  // 결과 페이지 변경
  const handleResultsPageChange = (event, newPage) => {
    setResultsPage(newPage);
  };

  const handleResultsRowsPerPageChange = (event) => {
    setResultsRowsPerPage(parseInt(event.target.value, 10));
    setResultsPage(0);
  };

  // 결과 로드 (페이지 변경 시)
  useEffect(() => {
    if (status?.status === 'completed') {
      loadResults();
    }
  }, [resultsPage, resultsRowsPerPage, status, loadResults]);

  // 클린업
  useEffect(() => {
    return () => {
      stopStatusPolling();
    };
  }, []);

  if (!document) {
    return null;
  }

  const isAnalyzing = analyzing || status?.status === 'processing';
  const isPaused = status?.status === 'paused';
  const isCompleted = status?.status === 'completed';
  const isFailed = status?.status === 'failed';

  return (
    <Box>
      {/* 에러 표시 */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

          {/* LLM 설정 폼 */}
          {!isAnalyzing && !isCompleted && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                LLM 설정
              </Typography>

              {activeConfigs.length === 0 ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  활성화된 LLM 설정이 없습니다. LLM 설정 페이지에서 설정을 추가하고 활성화하세요.
                </Alert>
              ) : (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>LLM 설정 선택</InputLabel>
                    <Select
                      value={selectedConfigId}
                      onChange={handleLlmConfigChange}
                      label="LLM 설정 선택"
                    >
                      {activeConfigs.map((llmConfig) => (
                        <MenuItem key={llmConfig.id} value={llmConfig.id}>
                          {llmConfig.name} ({llmConfig.provider} - {llmConfig.modelName})
                          {llmConfig.isDefault && ' [기본]'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectedConfigId && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        선택된 설정 정보
                      </Typography>
                      <Typography variant="body2">
                        <strong>제공자:</strong> {config.llmProvider || '-'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>모델:</strong> {config.llmModel || '-'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>API URL:</strong> {config.llmBaseUrl || '기본값'}
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              <TextField
                fullWidth
                label="API 키 (선택)"
                type="password"
                value={config.llmApiKey}
                onChange={handleConfigChange('llmApiKey')}
                helperText="비워두면 선택한 LLM 설정에 저장된 API 키 사용"
                sx={{ mb: 2 }}
                disabled={!selectedConfigId}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="프롬프트 템플릿"
                value={config.promptTemplate}
                onChange={handleConfigChange('promptTemplate')}
                helperText="{chunk_text} 플레이스홀더를 사용하세요"
                sx={{ mb: 2 }}
                disabled={!selectedConfigId}
              />

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  label="최대 토큰"
                  type="number"
                  value={config.maxTokens}
                  onChange={handleConfigChange('maxTokens')}
                  fullWidth
                  disabled={!selectedConfigId}
                />
                <TextField
                  label="온도"
                  type="number"
                  value={config.temperature}
                  onChange={handleConfigChange('temperature')}
                  inputProps={{ min: 0, max: 2, step: 0.1 }}
                  fullWidth
                  disabled={!selectedConfigId}
                />
              </Box>
            </Box>
          )}

          {/* 진행 상황 */}
          {(isAnalyzing || isPaused || isCompleted) && status && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">
                  진행 상황
                  <Chip
                    label={status.status}
                    size="small"
                    color={
                      isCompleted
                        ? 'success'
                        : isFailed
                        ? 'error'
                        : isPaused
                        ? 'warning'
                        : 'primary'
                    }
                    sx={{ ml: 1 }}
                  />
                </Typography>
                <Typography variant="body2" color="primary">
                  {status.progress?.percentage?.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={status.progress?.percentage || 0}
                sx={{ height: 8, borderRadius: 4, mb: 1 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="textSecondary">
                  {status.progress?.processedChunks} / {status.progress?.totalChunks} 청크
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  비용: ${status.actualCostSoFar?.totalCostUsd?.toFixed(4) || '0.0000'}
                </Typography>
              </Box>
            </Box>
          )}

          {/* 분석 결과 테이블 */}
          {isCompleted && results && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                분석 결과
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>청크 #</TableCell>
                      <TableCell>원본 텍스트</TableCell>
                      <TableCell>LLM 응답</TableCell>
                      <TableCell align="right">토큰</TableCell>
                      <TableCell align="right">비용</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.results?.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>{result.chunkIndex + 1}</TableCell>
                        <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {result.chunkText}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {result.llmResponse}
                        </TableCell>
                        <TableCell align="right">{result.tokensUsed}</TableCell>
                        <TableCell align="right">${result.costUsd?.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={results.totalResults || 0}
                  page={resultsPage}
                  onPageChange={handleResultsPageChange}
                  rowsPerPage={resultsRowsPerPage}
                  onRowsPerPageChange={handleResultsRowsPerPageChange}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </TableContainer>
            </Box>
          )}

        {/* 제어 버튼 */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {!isAnalyzing && !isPaused && !isCompleted && (
            <Button
              onClick={handleEstimateCost}
              variant="outlined"
              disabled={loading || !selectedConfigId}
            >
              비용 추정
            </Button>
          )}

          {isPaused && (
            <>
              <Button onClick={handleCancel} startIcon={<StopIcon />} color="error">
                중단
              </Button>
              <Button onClick={handleResume} startIcon={<PlayArrowIcon />} variant="contained">
                재개
              </Button>
            </>
          )}

          {isAnalyzing && (
            <Button onClick={handlePause} startIcon={<PauseIcon />} variant="contained">
              일시정지
            </Button>
          )}
        </Box>

        {/* 비용 경고 다이얼로그 */}
        <CostWarningDialog
          open={showCostDialog}
          onClose={() => setShowCostDialog(false)}
          onConfirm={handleStartAnalysis}
          costEstimate={costEstimate}
          loading={loading}
        />

        {/* 배치 확인 다이얼로그 */}
        <BatchConfirmDialog
          open={showBatchDialog}
          onContinue={handleResume}
          onPause={handlePause}
          onCancel={handleCancel}
          status={status}
          loading={loading}
        />
      </Box>
  );
}

DocumentAnalysis.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.string,
    fileName: PropTypes.string,
    totalChunks: PropTypes.number,
  }).isRequired,
};

export default DocumentAnalysis;
