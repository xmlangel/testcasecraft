// src/components/TestCase/TestCaseAttachments.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Description as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as TextIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext.jsx';

/**
 * ICT-386: 테스트케이스 첨부파일 관리 컴포넌트
 */
const TestCaseAttachments = ({ testCaseId }) => {
  const { api } = useAppContext();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDescription, setFileDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // 첨부파일 목록 조회
  const fetchAttachments = async () => {
    if (!testCaseId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api(`/api/testcase-attachments/testcase/${testCaseId}`);
      if (response.ok) {
        const data = await response.json();
        setAttachments(data.attachments || []);
      } else {
        throw new Error('첨부파일 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      console.error('첨부파일 조회 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testCaseId) {
      fetchAttachments();
    }
  }, [testCaseId]);

  // 파일 선택 핸들러
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadDialogOpen(true);
    }
  };

  // 파일 업로드
  const handleUpload = async () => {
    if (!selectedFile || !testCaseId) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (fileDescription.trim()) {
        formData.append('description', fileDescription);
      }

      const response = await fetch(`/api/testcase-attachments/upload/${testCaseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        // 목록 새로고침
        await fetchAttachments();

        // 초기화
        setSelectedFile(null);
        setFileDescription('');
        setUploadDialogOpen(false);
        setUploadProgress(100);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || '파일 업로드에 실패했습니다.');
      }
    } catch (err) {
      console.error('파일 업로드 오류:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // 파일 다운로드
  const handleDownload = async (attachmentId, originalFileName) => {
    try {
      const response = await fetch(`/api/testcase-attachments/${attachmentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalFileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('파일 다운로드에 실패했습니다.');
      }
    } catch (err) {
      console.error('파일 다운로드 오류:', err);
      setError(err.message);
    }
  };

  // 파일 삭제
  const handleDelete = async (attachmentId) => {
    if (!window.confirm('이 파일을 삭제하시겠습니까?')) return;

    try {
      const response = await api(`/api/testcase-attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 목록 새로고침
        await fetchAttachments();
      } else {
        throw new Error('파일 삭제에 실패했습니다.');
      }
    } catch (err) {
      console.error('파일 삭제 오류:', err);
      setError(err.message);
    }
  };

  // 파일 아이콘 가져오기
  const getFileIcon = (attachment) => {
    if (attachment.isImageFile) {
      return <ImageIcon color="primary" />;
    } else if (attachment.isPdfFile) {
      return <PdfIcon color="error" />;
    } else if (attachment.isTextFile) {
      return <TextIcon color="action" />;
    } else {
      return <FileIcon color="action" />;
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // 날짜 포맷팅
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
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachFileIcon />
          첨부파일
          {attachments.length > 0 && (
            <Chip label={attachments.length} size="small" color="primary" />
          )}
        </Typography>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadIcon />}
          size="small"
          disabled={!testCaseId}
        >
          파일 업로드
          <input
            type="file"
            hidden
            onChange={handleFileSelect}
            accept=".txt,.csv,.json,.md,.pdf,.log,.png,.jpg,.jpeg,.gif,.xls,.xlsx,.doc,.docx"
          />
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : attachments.length === 0 ? (
        <Alert severity="info">첨부된 파일이 없습니다.</Alert>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="50px">종류</TableCell>
                <TableCell>파일명</TableCell>
                <TableCell width="100px">크기</TableCell>
                <TableCell width="150px">업로드 일시</TableCell>
                <TableCell width="100px">업로드자</TableCell>
                <TableCell width="120px" align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attachments.map((attachment) => (
                <TableRow key={attachment.id} hover>
                  <TableCell>{getFileIcon(attachment)}</TableCell>
                  <TableCell>
                    <Tooltip title={attachment.description || ''}>
                      <Box>
                        <Typography variant="body2" noWrap>
                          {attachment.originalFileName}
                        </Typography>
                        {attachment.description && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {attachment.description}
                          </Typography>
                        )}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatFileSize(attachment.fileSize)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontSize="0.75rem">
                      {formatDate(attachment.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontSize="0.75rem">
                      {attachment.uploadedByName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="다운로드">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDownload(attachment.id, attachment.originalFileName)}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="삭제">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(attachment.id)}
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
      )}

      {/* 파일 업로드 다이얼로그 */}
      <Dialog open={uploadDialogOpen} onClose={() => !uploading && setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>파일 업로드</DialogTitle>
        <DialogContent>
          {selectedFile && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                선택한 파일
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                {getFileIcon({
                  isImageFile: selectedFile.type.startsWith('image/'),
                  isPdfFile: selectedFile.type === 'application/pdf',
                  isTextFile: selectedFile.type.startsWith('text/'),
                })}
                <Typography variant="body1">{selectedFile.name}</Typography>
                <Chip label={formatFileSize(selectedFile.size)} size="small" />
              </Box>
            </Box>
          )}

          <TextField
            fullWidth
            label="파일 설명 (선택사항)"
            multiline
            rows={3}
            value={fileDescription}
            onChange={(e) => setFileDescription(e.target.value)}
            placeholder="이 파일에 대한 간단한 설명을 입력하세요"
            disabled={uploading}
            sx={{ mt: 2 }}
          />

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
                업로드 중...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
            취소
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
          >
            {uploading ? '업로드 중...' : '업로드'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

TestCaseAttachments.propTypes = {
  testCaseId: PropTypes.string,
};

export default TestCaseAttachments;
