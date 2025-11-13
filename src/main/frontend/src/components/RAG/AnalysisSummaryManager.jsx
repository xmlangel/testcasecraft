// src/components/RAG/AnalysisSummaryManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useRAG } from '../../context/RAGContext.jsx';

/**
 * 분석 요약 관리 컴포넌트
 *
 * 각 문서별로 LLM이 분석한 결과를 종합하여 표시합니다.
 * - 업로드된 문서 목록 조회
 * - 각 문서의 LLM 분석 작업 상태 확인
 * - 완료된 분석의 모든 청크 결과를 합쳐서 표시
 * - 문서별 요약 결과 리스트
 */
function AnalysisSummaryManager({ projectId, onLlmAnalysis }) {
  const {
    listDocuments,
    listLlmAnalysisJobs,
    getLlmAnalysisResults,
    getLlmAnalysisStatus,
  } = useRAG();

  // 상태 관리
  const [documentSummaries, setDocumentSummaries] = useState([]); // 각 문서별 LLM 분석 요약
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 페이지네이션
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // 상세보기 다이얼로그
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);

  // 각 문서의 LLM 분석 결과 요약 로드
  const loadDocumentSummaries = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      // 1. 문서 목록 로드
      const docsResult = await listDocuments(projectId, 1, 1000);
      const regularDocs = docsResult?.documents?.filter(doc => !doc.fileName?.startsWith('testcase_')) || [];

      console.log('[AnalysisSummaryManager] 문서 목록:', regularDocs.length, '개');

      // 2. 각 문서의 LLM 분석 작업 상태 및 결과 조회
      const summariesPromises = regularDocs.map(async (doc) => {
        try {
          // 먼저 LLM 분석 작업 상태 조회
          let jobStatus;
          try {
            jobStatus = await getLlmAnalysisStatus(doc.id);
          } catch (statusErr) {
            // 404 에러는 분석 작업이 없는 것으로 처리
            if (statusErr.response?.status === 404) {
              console.log(`[AnalysisSummaryManager] 문서 ${doc.fileName}: LLM 분석 작업 없음`);
              return {
                documentId: doc.id,
                documentName: doc.fileName,
                totalChunks: doc.totalChunks || 0,
                analyzedChunks: 0,
                status: 'not_started',
                combinedResponse: null,
                uploadDate: doc.uploadDate,
              };
            }
            throw statusErr; // 다른 에러는 상위로 전파
          }

          // 작업 상태 확인
          const actualStatus = jobStatus.status;
          const totalChunks = jobStatus.progress?.totalChunks || doc.totalChunks || 0;
          const processedChunks = jobStatus.progress?.processedChunks || 0;

          console.log(`[AnalysisSummaryManager] 문서 ${doc.fileName}: 상태=${actualStatus}, 진행=${processedChunks}/${totalChunks}`);

          // 완료된 작업인 경우에만 결과 조회
          if (actualStatus === 'completed') {
            try {
              const analysisResults = await getLlmAnalysisResults(doc.id, 0, 1000);

              if (analysisResults && analysisResults.results && analysisResults.results.length > 0) {
                // 모든 청크의 LLM 응답을 합치기
                const combinedResponse = analysisResults.results
                  .map((result, index) => `[청크 ${index + 1}] ${result.llmResponse || ''}`)
                  .join('\n\n');

                return {
                  documentId: doc.id,
                  documentName: doc.fileName,
                  totalChunks,
                  analyzedChunks: analysisResults.results.length,
                  status: 'completed',
                  combinedResponse,
                  uploadDate: doc.uploadDate,
                };
              } else {
                // 완료되었지만 결과가 없는 경우
                return {
                  documentId: doc.id,
                  documentName: doc.fileName,
                  totalChunks,
                  analyzedChunks: processedChunks,
                  status: 'completed',
                  combinedResponse: '분석이 완료되었지만 결과가 없습니다.',
                  uploadDate: doc.uploadDate,
                };
              }
            } catch (resultsErr) {
              console.warn(`[AnalysisSummaryManager] 문서 ${doc.fileName}: 결과 조회 실패, 상태는 completed`, resultsErr);
              // 결과 조회 실패해도 작업은 완료된 것으로 표시
              return {
                documentId: doc.id,
                documentName: doc.fileName,
                totalChunks,
                analyzedChunks: processedChunks,
                status: 'completed',
                combinedResponse: '분석이 완료되었지만 결과 조회에 실패했습니다.',
                uploadDate: doc.uploadDate,
              };
            }
          }

          // 진행 중, 일시정지, 취소됨, 실패 등의 상태는 그대로 반환
          return {
            documentId: doc.id,
            documentName: doc.fileName,
            totalChunks,
            analyzedChunks: processedChunks,
            status: actualStatus,
            combinedResponse: null,
            uploadDate: doc.uploadDate,
            errorMessage: jobStatus.errorMessage,
          };
        } catch (err) {
          // 예상치 못한 에러는 실패로 표시
          console.error(`[AnalysisSummaryManager] 문서 ${doc.fileName} 조회 실패:`, err);
          return {
            documentId: doc.id,
            documentName: doc.fileName,
            totalChunks: doc.totalChunks || 0,
            analyzedChunks: 0,
            status: 'error',
            combinedResponse: null,
            uploadDate: doc.uploadDate,
            errorMessage: err.response?.data?.message || err.message,
          };
        }
      });

      const results = await Promise.all(summariesPromises);
      // 이제 모든 문서를 포함 (null 필터링 제거)

      console.log('[AnalysisSummaryManager] 전체 문서:', results.length, '개 (분석 완료/진행/미시작 포함)');

      setDocumentSummaries(results);
    } catch (err) {
      console.error('[AnalysisSummaryManager] 요약 로드 실패:', err);
      setError(err.response?.data?.message || '요약 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [projectId, listDocuments, getLlmAnalysisStatus, getLlmAnalysisResults]);

  useEffect(() => {
    loadDocumentSummaries();
  }, [loadDocumentSummaries]);

  // 페이지 변경
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // 페이지 크기 변경
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 요약 상세보기
  const handleViewDetail = (summary) => {
    setSelectedSummary(summary);
    setDetailDialogOpen(true);
  };

  // 날짜 포맷
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

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 50) return 'primary';
    return 'warning';
  };

  // 상태별 표시 정보
  const getStatusInfo = (status) => {
    switch (status) {
      case 'not_started':
        return { label: '미분석', color: 'default', icon: '⏸️' };
      case 'processing':
        return { label: '진행 중', color: 'primary', icon: '⏳' };
      case 'paused':
        return { label: '일시정지', color: 'warning', icon: '⏸️' };
      case 'completed':
        return { label: '완료', color: 'success', icon: '✅' };
      case 'cancelled':
        return { label: '취소됨', color: 'default', icon: '🚫' };
      case 'error':
        return { label: '실패', color: 'error', icon: '❌' };
      default:
        return { label: '알 수 없음', color: 'default', icon: '❓' };
    }
  };

  // LLM 분석 시작 핸들러
  const handleStartAnalysis = (summary) => {
    // RAGDocumentManager의 handleLlmAnalysis를 호출하기 위해 document 객체 전달
    if (onLlmAnalysis) {
      onLlmAnalysis(summary.documentId);
    }
  };

  // 페이지네이션 적용
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedSummaries = documentSummaries.slice(startIndex, endIndex);

  if (loading && documentSummaries.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          요약 목록을 불러오는 중...
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: 3 }}>
        {/* 에러 메시지 */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 헤더 */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          분석 요약 관리 ({documentSummaries.length}개 문서)
        </Typography>

        {/* 요약 목록 테이블 */}
        {documentSummaries.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              LLM 분석이 완료된 문서가 없습니다.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              문서를 업로드하고 LLM 분석을 실행해주세요.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="30%">문서명</TableCell>
                    <TableCell width="12%" align="center">청크 수</TableCell>
                    <TableCell width="12%" align="center">진행률</TableCell>
                    <TableCell width="12%" align="center">상태</TableCell>
                    <TableCell width="17%">업로드 일시</TableCell>
                    <TableCell width="17%" align="center">작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSummaries.map((summary) => {
                    const progress = summary.totalChunks > 0
                      ? Math.round((summary.analyzedChunks / summary.totalChunks) * 100)
                      : 0;
                    const statusInfo = getStatusInfo(summary.status);

                    return (
                      <TableRow key={summary.documentId} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DescriptionIcon color="primary" fontSize="small" />
                            <Typography variant="body2" fontWeight="medium">
                              {summary.documentName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${summary.analyzedChunks} / ${summary.totalChunks}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {summary.status === 'not_started' ? (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                              <CircularProgress
                                variant="determinate"
                                value={progress}
                                size={32}
                                color={getProgressColor(progress)}
                              />
                              <Typography variant="caption">{progress}%</Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={statusInfo.label}
                            size="small"
                            color={statusInfo.color}
                            icon={<span>{statusInfo.icon}</span>}
                          />
                        </TableCell>
                        <TableCell>{formatDate(summary.uploadDate)}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            {summary.status === 'not_started' && (
                              <Tooltip title="LLM 분석 시작">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleStartAnalysis(summary)}
                                >
                                  <PlayArrowIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(summary.status === 'completed' || summary.status === 'processing' || summary.status === 'paused') && (
                              <Tooltip title="요약 보기">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleViewDetail(summary)}
                                  disabled={!summary.combinedResponse && summary.status !== 'processing'}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 페이지네이션 */}
            <TablePagination
              component="div"
              count={documentSummaries.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 20, 50]}
              labelRowsPerPage="페이지당 행 수:"
            />
          </>
        )}
      </Paper>

      {/* 요약 상세보기 다이얼로그 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelectedSummary(null);
        }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          LLM 분석 요약 - {selectedSummary?.documentName}
          <IconButton onClick={() => {
            setDetailDialogOpen(false);
            setSelectedSummary(null);
          }} size="small">
            <CloseIcon />
          </IconButton>
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
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  업로드: {formatDate(selectedSummary.uploadDate)}
                </Typography>
              </Box>

              {/* 통합 요약 내용 */}
              <Box>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  LLM 분석 결과 요약
                </Typography>
                {selectedSummary.status === 'not_started' ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    아직 LLM 분석이 실행되지 않았습니다. 문서 목록에서 LLM 분석을 시작해주세요.
                  </Alert>
                ) : selectedSummary.status === 'error' ? (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    분석 중 오류가 발생했습니다: {selectedSummary.errorMessage || '알 수 없는 오류'}
                  </Alert>
                ) : selectedSummary.status === 'processing' ? (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    LLM 분석이 진행 중입니다. 잠시 후 다시 확인해주세요.
                  </Alert>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      p: 2,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      maxHeight: '600px',
                      overflow: 'auto',
                    }}
                  >
                    {selectedSummary.combinedResponse || '분석 결과가 없습니다.'}
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDetailDialogOpen(false);
              setSelectedSummary(null);
            }}
          >
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

AnalysisSummaryManager.propTypes = {
  projectId: PropTypes.string.isRequired,
  onLlmAnalysis: PropTypes.func, // LLM 분석 시작 핸들러
};

export default AnalysisSummaryManager;
