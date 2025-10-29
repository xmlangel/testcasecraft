// src/components/RAG/DocumentList.jsx
import React, { useEffect, useCallback, useState } from 'react';
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
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ViewListIcon from '@mui/icons-material/ViewList';
import { useRAG } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import DocumentChunks from './DocumentChunks.jsx';

function DocumentList({ projectId }) {
  const { t } = useI18n();
  const { listDocuments, deleteDocument, downloadDocument, state } = useRAG();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [chunksDialogOpen, setChunksDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const loadDocuments = useCallback(async () => {
    if (projectId) {
      try {
        // API는 1-based 페이지를 사용하므로 +1
        await listDocuments(projectId, page + 1, rowsPerPage);
      } catch (error) {
        console.error('문서 목록 로드 실패:', error);
      }
    }
  }, [projectId, page, rowsPerPage, listDocuments]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (documentId) => {
    setSelectedDocumentId(documentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedDocumentId) {
      try {
        await deleteDocument(selectedDocumentId);
        setDeleteDialogOpen(false);
        setSelectedDocumentId(null);
        // 문서 목록 새로고침
        await loadDocuments();
      } catch (error) {
        console.error('문서 삭제 실패:', error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedDocumentId(null);
  };

  const handleDownloadClick = async (documentId, fileName) => {
    try {
      await downloadDocument(documentId, fileName);
    } catch (error) {
      console.error('문서 다운로드 실패:', error);
    }
  };

  const handleViewChunksClick = (doc) => {
    setSelectedDocument(doc);
    setChunksDialogOpen(true);
  };

  const handleChunksDialogClose = () => {
    setChunksDialogOpen(false);
    setSelectedDocument(null);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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

  const getStatusChip = (status) => {
    const statusMap = {
      pending: {
        label: t('rag.document.status.pending', '대기 중'),
        icon: <PendingIcon fontSize="small" />,
        color: 'default',
      },
      analyzing: {
        label: t('rag.document.status.analyzing', '분석 중'),
        icon: <CircularProgress size={14} />,
        color: 'primary',
      },
      completed: {
        label: t('rag.document.status.completed', '완료'),
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'success',
      },
      failed: {
        label: t('rag.document.status.failed', '실패'),
        icon: <ErrorIcon fontSize="small" />,
        color: 'error',
      },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Chip
        icon={statusInfo.icon}
        label={statusInfo.label}
        color={statusInfo.color}
        size="small"
      />
    );
  };

  if (state.loading && state.documents.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          {t('rag.document.loading', '문서 목록을 불러오는 중...')}
        </Typography>
      </Paper>
    );
  }

  if (state.error) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => {}}>
          {state.error}
        </Alert>
      </Paper>
    );
  }

  if (state.documents.length === 0 && state.pagination.total === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          {t('rag.document.empty', '업로드된 문서가 없습니다')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('rag.document.emptyDescription', '상단의 업로드 영역을 사용하여 문서를 등록하세요')}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('rag.document.list.title', '업로드된 문서')} ({state.pagination.total})
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('rag.document.list.fileName', '파일명')}</TableCell>
                <TableCell>{t('rag.document.list.fileSize', '크기')}</TableCell>
                <TableCell>{t('rag.document.list.status', '상태')}</TableCell>
                <TableCell>{t('rag.document.list.chunks', '청크 수')}</TableCell>
                <TableCell>{t('rag.document.list.uploadDate', '업로드 일시')}</TableCell>
                <TableCell align="center">{t('rag.document.list.actions', '작업')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.documents.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon color="primary" fontSize="small" />
                      {doc.fileName}
                    </Box>
                  </TableCell>
                  <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                  <TableCell>{getStatusChip(doc.analysisStatus)}</TableCell>
                  <TableCell>{doc.totalChunks || 0}</TableCell>
                  <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleViewChunksClick(doc)}
                      title={t('rag.document.viewChunks', '청크 보기')}
                      disabled={!doc.totalChunks || doc.totalChunks === 0}
                    >
                      <ViewListIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleDownloadClick(doc.id, doc.fileName)}
                      title={t('rag.document.download', '문서 다운로드')}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(doc.id)}
                      title={t('rag.document.delete', '문서 삭제')}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={state.pagination.total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 20, 50, 100]}
          labelRowsPerPage={t('rag.document.pagination.rowsPerPage', '페이지당 행 수:')}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </Paper>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {t('rag.document.deleteDialog.title', '문서 삭제 확인')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            {t('rag.document.deleteDialog.message', '이 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            {t('common.cancel', '취소')}
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            {t('common.delete', '삭제')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 청크 보기 다이얼로그 */}
      {selectedDocument && (
        <DocumentChunks
          documentId={selectedDocument.id}
          documentName={selectedDocument.fileName}
          open={chunksDialogOpen}
          onClose={handleChunksDialogClose}
        />
      )}
    </>
  );
}

DocumentList.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default DocumentList;
