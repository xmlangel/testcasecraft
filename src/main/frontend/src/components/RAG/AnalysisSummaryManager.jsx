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
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import { useRAG } from '../../context/RAGContext.jsx';
import SummaryEditDialog from './SummaryEditDialog.jsx';

/**
 * 분석 요약 관리 컴포넌트
 *
 * 분석 결과를 사용자가 정리하여 저장한 요약을 CRUD 관리합니다.
 * - 요약 목록 테이블 (페이지네이션)
 * - 요약 작성/편집 다이얼로그
 * - 요약 상세보기 모달
 * - 삭제 확인 다이얼로그
 * - 태그 관리
 * - 공개/비공개 토글
 */
function AnalysisSummaryManager({ documentId, userId }) {
  const {
    listAnalysisSummaries,
    getAnalysisSummary,
    createAnalysisSummary,
    updateAnalysisSummary,
    deleteAnalysisSummary,
  } = useRAG();

  // 상태 관리
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 페이지네이션
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // 필터
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [showMyOnly, setShowMyOnly] = useState(false);

  // 다이얼로그 상태
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailSummary, setDetailSummary] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [summaryToDelete, setSummaryToDelete] = useState(null);

  // 요약 목록 로드
  const loadSummaries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const skip = page * rowsPerPage;
      const limit = rowsPerPage;

      const filterUserId = showMyOnly ? userId : null;
      const filterIsPublic = showPublicOnly ? true : null;

      const result = await listAnalysisSummaries(
        documentId,
        filterUserId,
        filterIsPublic,
        skip,
        limit
      );

      setSummaries(result || []);
      // API가 total count를 반환하지 않으면 현재 길이 사용
      setTotalCount(result?.length || 0);
    } catch (err) {
      console.error('요약 목록 로드 실패:', err);
      setError(err.response?.data?.message || '요약 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [documentId, userId, page, rowsPerPage, showPublicOnly, showMyOnly, listAnalysisSummaries]);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  // 페이지 변경
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // 페이지 크기 변경
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 새 요약 작성 버튼
  const handleCreateClick = () => {
    setSelectedSummary(null);
    setEditDialogOpen(true);
  };

  // 요약 편집 버튼
  const handleEditClick = (summary) => {
    setSelectedSummary(summary);
    setEditDialogOpen(true);
  };

  // 요약 저장 (생성 또는 업데이트)
  const handleSaveSummary = async (summaryData) => {
    try {
      if (selectedSummary) {
        // 업데이트
        await updateAnalysisSummary(selectedSummary.id, summaryData);
      } else {
        // 생성
        await createAnalysisSummary({
          ...summaryData,
          documentId,
        });
      }

      setEditDialogOpen(false);
      setSelectedSummary(null);
      await loadSummaries();
    } catch (err) {
      console.error('요약 저장 실패:', err);
      throw err;
    }
  };

  // 요약 상세보기
  const handleViewDetail = async (summary) => {
    try {
      const detail = await getAnalysisSummary(summary.id);
      setDetailSummary(detail);
      setDetailDialogOpen(true);
    } catch (err) {
      console.error('요약 상세 조회 실패:', err);
      setError('요약 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  // 요약 삭제 버튼
  const handleDeleteClick = (summary) => {
    setSummaryToDelete(summary);
    setDeleteDialogOpen(true);
  };

  // 요약 삭제 확인
  const handleDeleteConfirm = async () => {
    if (!summaryToDelete) return;

    try {
      await deleteAnalysisSummary(summaryToDelete.id);
      setDeleteDialogOpen(false);
      setSummaryToDelete(null);
      await loadSummaries();
    } catch (err) {
      console.error('요약 삭제 실패:', err);
      setError('요약 삭제에 실패했습니다.');
      setDeleteDialogOpen(false);
    }
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

  // 공개/비공개 아이콘
  const getPublicIcon = (isPublic) => {
    return isPublic ? (
      <Tooltip title="공개">
        <PublicIcon fontSize="small" color="success" />
      </Tooltip>
    ) : (
      <Tooltip title="비공개">
        <LockIcon fontSize="small" color="action" />
      </Tooltip>
    );
  };

  if (loading && summaries.length === 0) {
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">분석 요약 관리</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            새 요약 작성
          </Button>
        </Box>

        {/* 필터 */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={showPublicOnly}
                onChange={(e) => {
                  setShowPublicOnly(e.target.checked);
                  setPage(0);
                }}
              />
            }
            label="공개 요약만 표시"
          />
          {userId && (
            <FormControlLabel
              control={
                <Switch
                  checked={showMyOnly}
                  onChange={(e) => {
                    setShowMyOnly(e.target.checked);
                    setPage(0);
                  }}
                />
              }
              label="내 요약만 표시"
            />
          )}
        </Box>

        {/* 요약 목록 테이블 */}
        {summaries.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              저장된 요약이 없습니다.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              새 요약 작성 버튼을 눌러 분석 결과를 정리해보세요.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="40%">제목</TableCell>
                    <TableCell width="20%">태그</TableCell>
                    <TableCell width="10%" align="center">
                      공개
                    </TableCell>
                    <TableCell width="15%">작성일</TableCell>
                    <TableCell width="15%" align="center">
                      작업
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summaries.map((summary) => (
                    <TableRow key={summary.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {summary.title}
                        </Typography>
                        {summary.summaryContent && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {summary.summaryContent}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {summary.tags && summary.tags.length > 0 ? (
                            summary.tags.slice(0, 3).map((tag, idx) => (
                              <Chip key={idx} label={tag} size="small" />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              -
                            </Typography>
                          )}
                          {summary.tags && summary.tags.length > 3 && (
                            <Chip label={`+${summary.tags.length - 3}`} size="small" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {getPublicIcon(summary.isPublic)}
                      </TableCell>
                      <TableCell>{formatDate(summary.createdAt)}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="상세보기">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleViewDetail(summary)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="편집">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditClick(summary)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="삭제">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(summary)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 페이지네이션 */}
            <TablePagination
              component="div"
              count={totalCount}
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

      {/* 요약 작성/편집 다이얼로그 */}
      <SummaryEditDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedSummary(null);
        }}
        onSave={handleSaveSummary}
        summary={selectedSummary}
        documentId={documentId}
      />

      {/* 요약 상세보기 다이얼로그 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setDetailSummary(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>요약 상세보기</DialogTitle>
        <DialogContent dividers>
          {detailSummary ? (
            <Box>
              {/* 제목 */}
              <Typography variant="h6" gutterBottom>
                {detailSummary.title}
              </Typography>

              {/* 메타 정보 */}
              <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                {getPublicIcon(detailSummary.isPublic)}
                <Typography variant="caption" color="text.secondary">
                  작성일: {formatDate(detailSummary.createdAt)}
                </Typography>
                {detailSummary.updatedAt && (
                  <Typography variant="caption" color="text.secondary">
                    수정일: {formatDate(detailSummary.updatedAt)}
                  </Typography>
                )}
              </Box>

              {/* 태그 */}
              {detailSummary.tags && detailSummary.tags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    태그
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {detailSummary.tags.map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" />
                    ))}
                  </Box>
                </Box>
              )}

              {/* 요약 내용 */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  요약 내용
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                  }}
                >
                  {detailSummary.summaryContent}
                </Typography>
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
              setDetailSummary(null);
            }}
          >
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSummaryToDelete(null);
        }}
      >
        <DialogTitle>요약 삭제 확인</DialogTitle>
        <DialogContent>
          <DialogContentText>
            &quot;{summaryToDelete?.title}&quot; 요약을 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setSummaryToDelete(null);
            }}
          >
            취소
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

AnalysisSummaryManager.propTypes = {
  documentId: PropTypes.string,
  userId: PropTypes.string,
};

AnalysisSummaryManager.defaultProps = {
  documentId: null,
  userId: null,
};

export default AnalysisSummaryManager;
