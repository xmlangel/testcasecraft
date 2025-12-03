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
  Visibility as PreviewIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';

/**
 * ICT-386: 테스트케이스 첨부파일 관리 컴포넌트
 */
const TestCaseAttachments = ({ testCaseId }) => {
  const { api } = useAppContext();
  const { t } = useI18n();
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDescription, setFileDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  // 미리보기 관련 상태
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

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

      // AppContext의 api() 함수 사용
      // Content-Type을 undefined로 설정하여 브라우저가 자동으로 multipart/form-data 설정하도록 함
      const response = await api(`/api/testcase-attachments/upload/${testCaseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': undefined, // FormData 사용 시 브라우저가 자동 설정
        },
        body: formData,
      });

      if (response.ok) {
        // 응답 본문이 비어있는지 확인
        const contentType = response.headers.get('content-type');
        const text = await response.text();

        let data = null;
        if (text && text.trim()) {
          try {
            data = JSON.parse(text);
          } catch (jsonError) {
            console.warn('JSON 파싱 실패, 텍스트 응답:', text);
          }
        }

        // 목록 새로고침
        await fetchAttachments();

        // 초기화
        setSelectedFile(null);
        setFileDescription('');
        setUploadDialogOpen(false);
        setUploadProgress(100);
      } else {
        // 에러 응답 처리
        const contentType = response.headers.get('content-type');
        let errorMessage = '파일 업로드에 실패했습니다.';

        try {
          const text = await response.text();
          if (text && text.trim()) {
            if (contentType && contentType.includes('application/json')) {
              const errorData = JSON.parse(text);
              errorMessage = errorData.message || errorMessage;
            } else {
              errorMessage = text || errorMessage;
            }
          }
        } catch (parseError) {
          console.error('에러 응답 파싱 실패:', parseError);
        }

        throw new Error(errorMessage);
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
      // AppContext의 api() 함수 사용
      const response = await api(`/api/testcase-attachments/${attachmentId}/download`, {
        method: 'GET',
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

  // 파일 미리보기
  const handlePreview = async (attachment) => {
    setPreviewAttachment(attachment);
    setPreviewDialogOpen(true);
    setLoadingPreview(true);
    setPreviewContent(null);

    try {
      // 이미지 파일 미리보기
      if (attachment.imageFile) {
        const response = await api(`/api/testcase-attachments/${attachment.id}/download`, {
          method: 'GET',
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          setPreviewContent({ type: 'image', url });
        } else {
          throw new Error('이미지를 불러올 수 없습니다.');
        }
      }
      // PDF 파일 미리보기
      else if (attachment.pdfFile) {
        const response = await api(`/api/testcase-attachments/${attachment.id}/download`, {
          method: 'GET',
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          setPreviewContent({ type: 'pdf', url });
        } else {
          throw new Error('PDF를 불러올 수 없습니다.');
        }
      }
      // 텍스트 파일 미리보기
      else if (attachment.textFile) {
        const response = await api(`/api/testcase-attachments/${attachment.id}/download`, {
          method: 'GET',
        });

        if (response.ok) {
          const text = await response.text();
          setPreviewContent({ type: 'text', content: text });
        } else {
          throw new Error('텍스트 파일을 불러올 수 없습니다.');
        }
      }
      // 기타 파일은 미리보기 지원하지 않음
      else {
        setPreviewContent({ type: 'unsupported' });
      }
    } catch (err) {
      console.error('파일 미리보기 오류:', err);
      setPreviewContent({ type: 'error', message: err.message });
    } finally {
      setLoadingPreview(false);
    }
  };

  // 미리보기 다이얼로그 닫기
  const handleClosePreview = () => {
    setPreviewDialogOpen(false);
    // URL 정리 (메모리 누수 방지)
    if (previewContent?.url) {
      window.URL.revokeObjectURL(previewContent.url);
    }
    setPreviewContent(null);
    setPreviewAttachment(null);
  };

  // 파일 아이콘 가져오기
  const getFileIcon = (attachment) => {
    if (attachment.imageFile) {
      return <ImageIcon color="primary" />;
    } else if (attachment.pdfFile) {
      return <PdfIcon color="error" />;
    } else if (attachment.textFile) {
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
                <TableCell width="150px" align="center">작업</TableCell>
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
                    <Tooltip title="미리보기">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => handlePreview(attachment)}
                        disabled={!attachment.imageFile && !attachment.pdfFile && !attachment.textFile}
                      >
                        <PreviewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
                  imageFile: selectedFile.type.startsWith('image/'),
                  pdfFile: selectedFile.type === 'application/pdf',
                  textFile: selectedFile.type.startsWith('text/'),
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
            {t('common.cancel', '취소')}
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
      {/* 파일 미리보기 다이얼로그 */}
      <Dialog
        open={previewDialogOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: { minHeight: '80vh' }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {previewAttachment && getFileIcon(previewAttachment)}
            <Typography variant="h6">{previewAttachment?.originalFileName}</Typography>
            {previewAttachment && (
              <Chip label={formatFileSize(previewAttachment.fileSize)} size="small" />
            )}
          </Box>
          <IconButton onClick={handleClosePreview} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          {loadingPreview ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                파일을 불러오는 중...
              </Typography>
            </Box>
          ) : previewContent?.type === 'image' ? (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', p: 2 }}>
              <img
                src={previewContent.url}
                alt={previewAttachment?.originalFileName}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
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
          ) : previewContent?.type === 'text' ? (
            <Box sx={{ width: '100%', height: '60vh', overflow: 'auto' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {previewContent.content}
              </Paper>
            </Box>
          ) : previewContent?.type === 'unsupported' ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <FileIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                미리보기를 지원하지 않는 파일 형식입니다
              </Typography>
              <Typography variant="body2" color="text.secondary">
                파일을 다운로드하여 확인해주세요.
              </Typography>
            </Box>
          ) : previewContent?.type === 'error' ? (
            <Alert severity="error" sx={{ width: '100%' }}>
              {previewContent.message}
            </Alert>
          ) : null}
        </DialogContent>
        <DialogActions>
          {previewAttachment && (
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(previewAttachment.id, previewAttachment.originalFileName)}
            >
              다운로드
            </Button>
          )}
          <Button onClick={handleClosePreview}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

TestCaseAttachments.propTypes = {
  testCaseId: PropTypes.string,
};

export default TestCaseAttachments;
