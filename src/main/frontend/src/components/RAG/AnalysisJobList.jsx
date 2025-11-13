// src/components/RAG/AnalysisJobList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import { useRAG } from '../../context/RAGContext';

/**
 * LLM 분석 작업 목록 컴포넌트
 * 프로젝트별 LLM 분석 작업 목록을 표시하고 관리
 */
function AnalysisJobList({ projectId, onViewDetails }) {
  const { listLlmAnalysisJobs, pauseAnalysis, resumeAnalysis, cancelAnalysis } = useRAG();

  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0); // MUI TablePagination은 0부터 시작
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 작업 목록 조회
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listLlmAnalysisJobs(
        projectId,
        statusFilter || null,
        page + 1, // API는 1부터 시작
        rowsPerPage
      );

      setJobs(response.jobs || []);
      setTotalCount(response.totalCount || 0);
    } catch (err) {
      console.error('작업 목록 조회 실패:', err);
      setError('작업 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [listLlmAnalysisJobs, projectId, statusFilter, page, rowsPerPage]);

  // 초기 로드 및 필터/페이지 변경 시 재조회
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // 페이지 변경
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // 페이지 크기 변경
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 상태 필터 변경
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0); // 필터 변경 시 첫 페이지로
  };

  // 작업 상태별 색상
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'primary';
      case 'paused':
        return 'warning';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  // 작업 상태별 라벨
  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '완료';
      case 'processing':
        return '진행중';
      case 'paused':
        return '일시정지';
      case 'failed':
        return '실패';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
    }
  };

  // 작업 액션 처리
  const handlePause = async (jobId, documentId) => {
    try {
      await pauseAnalysis(documentId);
      fetchJobs(); // 목록 새로고침
    } catch (err) {
      console.error('일시정지 실패:', err);
    }
  };

  const handleResume = async (jobId, documentId) => {
    try {
      await resumeAnalysis(documentId);
      fetchJobs(); // 목록 새로고침
    } catch (err) {
      console.error('재개 실패:', err);
    }
  };

  const handleCancel = async (jobId, documentId) => {
    if (!window.confirm('분석을 취소하시겠습니까? 지금까지의 결과는 보존됩니다.')) {
      return;
    }

    try {
      await cancelAnalysis(documentId);
      fetchJobs(); // 목록 새로고침
    } catch (err) {
      console.error('취소 실패:', err);
    }
  };

  // 날짜 포맷
  const formatDate = (dateArray) => {
    if (!dateArray) return '-';
    try {
      const [year, month, day, hour, minute, second] = dateArray;
      const date = new Date(year, month - 1, day, hour, minute, second);
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

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">LLM 분석 작업 목록</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* 상태 필터 */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>상태 필터</InputLabel>
            <Select value={statusFilter} label="상태 필터" onChange={handleStatusFilterChange}>
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="processing">진행중</MenuItem>
              <MenuItem value="paused">일시정지</MenuItem>
              <MenuItem value="completed">완료</MenuItem>
              <MenuItem value="failed">실패</MenuItem>
              <MenuItem value="cancelled">취소됨</MenuItem>
            </Select>
          </FormControl>

          {/* 새로고침 버튼 */}
          <Tooltip title="새로고침">
            <IconButton onClick={fetchJobs} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 에러 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 로딩 인디케이터 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 작업 목록 테이블 */}
      {!loading && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>문서명</TableCell>
                <TableCell>LLM</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>진행률</TableCell>
                <TableCell>처리 청크</TableCell>
                <TableCell>비용 (USD)</TableCell>
                <TableCell>토큰</TableCell>
                <TableCell>시작 시각</TableCell>
                <TableCell>완료 시각</TableCell>
                <TableCell align="center">액션</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="textSecondary" sx={{ py: 3 }}>
                      분석 작업이 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => (
                  <TableRow key={job.jobId} hover>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {job.fileName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" display="block">
                        {job.llmProvider}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {job.llmModel}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(job.status)}
                        color={getStatusColor(job.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ minWidth: 100 }}>
                        <LinearProgress
                          variant="determinate"
                          value={job.percentage || 0}
                          sx={{ mb: 0.5 }}
                        />
                        <Typography variant="caption" color="textSecondary">
                          {(job.percentage || 0).toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {job.processedChunks} / {job.totalChunks}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ${(job.totalCostUsd || 0).toFixed(4)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{(job.totalTokens || 0).toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{formatDate(job.startedAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{formatDate(job.completedAt)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {/* 상세보기 */}
                        <Tooltip title="상세보기">
                          <IconButton
                            size="small"
                            onClick={() => onViewDetails && onViewDetails(job.documentId)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* 재개 버튼 (일시정지 상태) */}
                        {job.status === 'paused' && (
                          <Tooltip title="재개">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleResume(job.jobId, job.documentId)}
                            >
                              <PlayArrowIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* 일시정지 버튼 (진행중 상태) */}
                        {job.status === 'processing' && (
                          <Tooltip title="일시정지">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handlePause(job.jobId, job.documentId)}
                            >
                              <PauseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* 취소 버튼 (진행중/일시정지 상태) */}
                        {(job.status === 'processing' || job.status === 'paused') && (
                          <Tooltip title="취소">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancel(job.jobId, job.documentId)}
                            >
                              <StopIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="페이지당 행 수:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 전체 ${count}개`}
          />
        </TableContainer>
      )}
    </Box>
  );
}

AnalysisJobList.propTypes = {
  projectId: PropTypes.string,
  onViewDetails: PropTypes.func,
};

AnalysisJobList.defaultProps = {
  projectId: null,
  onViewDetails: null,
};

export default AnalysisJobList;
