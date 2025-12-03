import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider
} from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  TextSnippet as TextIcon,
  DataObject as JsonIcon,
  TableChart as CsvIcon,
  Description as MdIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';
import { formatDateSafe } from '../../utils/dateUtils';

/**
 * ICT-361: 테스트 결과 첨부파일 보기 컴포넌트
 */
const TestResultAttachmentsView = ({
  testResultId,
  compact = false,
  showHeader = true,
  maxHeight = 400,
  onAttachmentDeleted
}) => {
  const { api, user } = useAppContext();
  const { t } = useI18n();

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewType, setPreviewType] = useState(''); // 'image', 'pdf', 'text', 'json', 'csv'
  const [previewContent, setPreviewContent] = useState('');

  // 첨부파일 목록 로드
  useEffect(() => {
    if (testResultId) {
      loadAttachments();
    }
  }, [testResultId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api(`/api/attachments/testresult/${testResultId}`);
      const data = await response.json();

      if (data && data.success) {
        setAttachments(data.attachments || []);
      } else {
        setError(t('attachments.error.loadFailed', '첨부파일 목록을 불러올 수 없습니다.'));
      }
    } catch (error) {
      console.error('첨부파일 로드 오류:', error);
      setError(error.response?.data?.message || t('attachments.error.loadError', '첨부파일 목록을 불러오는 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  const isImage = (attachment) => {
    const mimeType = attachment.mimeType?.toLowerCase() || '';
    return mimeType.startsWith('image/');
  };

  const isPdf = (attachment) => {
    const mimeType = attachment.mimeType?.toLowerCase() || '';
    const extension = attachment.fileExtension?.toLowerCase() || '';
    return mimeType.includes('pdf') || extension === 'pdf';
  };

  const isTextFile = (attachment) => {
    const mimeType = attachment.mimeType?.toLowerCase() || '';
    const extension = attachment.fileExtension?.toLowerCase() || '';
    return mimeType.includes('text') || ['txt', 'log', 'md'].includes(extension);
  };

  const isJson = (attachment) => {
    const mimeType = attachment.mimeType?.toLowerCase() || '';
    const extension = attachment.fileExtension?.toLowerCase() || '';
    return mimeType.includes('json') || extension === 'json';
  };

  const isCsv = (attachment) => {
    const mimeType = attachment.mimeType?.toLowerCase() || '';
    const extension = attachment.fileExtension?.toLowerCase() || '';
    return mimeType.includes('csv') || extension === 'csv';
  };

  const isPreviewable = (attachment) => {
    return isImage(attachment) || isPdf(attachment) || isTextFile(attachment) || isJson(attachment) || isCsv(attachment);
  };

  const handlePreview = async (attachment) => {
    try {
      setPreviewTitle(attachment.originalFileName);

      // 모든 파일 타입을 다운로드해서 처리
      const response = await api(`/api/attachments/${attachment.id}/download`);
      const blob = await response.blob();

      // 이미지와 PDF는 Blob URL로 표시
      if (isImage(attachment)) {
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewType('image');
        setPreviewOpen(true);
        return;
      }

      if (isPdf(attachment)) {
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewType('pdf');
        setPreviewOpen(true);
        return;
      }

      // 텍스트, JSON, CSV는 내용을 읽어서 표시
      const text = await blob.text();

      if (isJson(attachment)) {
        try {
          const jsonData = JSON.parse(text);
          setPreviewContent(JSON.stringify(jsonData, null, 2));
          setPreviewType('json');
        } catch (e) {
          setPreviewContent(text);
          setPreviewType('text');
        }
      } else if (isCsv(attachment)) {
        setPreviewContent(text);
        setPreviewType('csv');
      } else {
        setPreviewContent(text);
        setPreviewType('text');
      }

      setPreviewOpen(true);
    } catch (error) {
      console.error('미리보기 생성 오류:', error);
      setError(t('attachments.error.previewError', '미리보기를 생성할 수 없습니다.'));
    }
  };

  const handleClosePreview = () => {
    // Blob URL 해제 (image와 pdf)
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewOpen(false);
    setPreviewUrl('');
    setPreviewTitle('');
    setPreviewType('');
    setPreviewContent('');
  };

  // 파일 다운로드
  const handleDownload = async (attachment) => {
    try {
      const response = await api(`/api/attachments/${attachment.id}/download`);
      const blob = await response.blob();

      // Blob을 URL로 변환하여 다운로드
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.originalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
      setError(t('attachments.error.downloadError', '파일 다운로드 중 오류가 발생했습니다.'));
    }
  };

  // 파일 삭제
  const handleDelete = async () => {
    if (!selectedAttachment) return;

    try {
      await api(`/api/attachments/${selectedAttachment.id}`, { method: 'DELETE' });

      // 목록에서 제거
      setAttachments(prev => prev.filter(att => att.id !== selectedAttachment.id));
      setDeleteDialogOpen(false);
      setSelectedAttachment(null);
      if (onAttachmentDeleted) {
        onAttachmentDeleted();
      }
    } catch (error) {
      console.error('파일 삭제 오류:', error);
      setError(t('attachments.error.deleteError', '파일 삭제 중 오류가 발생했습니다.'));
    }
  };

  // 파일 타입별 아이콘 반환
  const getFileIcon = (attachment) => {
    const extension = attachment.fileExtension?.toLowerCase() || '';
    const mimeType = attachment.mimeType?.toLowerCase() || '';

    if (isImage(attachment)) {
      return <ImageIcon color="secondary" />;
    }
    if (mimeType.includes('pdf') || extension === 'pdf') {
      return <PdfIcon color="error" />;
    }
    if (mimeType.includes('json') || extension === 'json') {
      return <JsonIcon color="info" />;
    }
    if (mimeType.includes('csv') || extension === 'csv') {
      return <CsvIcon color="success" />;
    }
    if (extension === 'md') {
      return <MdIcon color="primary" />;
    }
    if (mimeType.includes('text') || ['txt', 'log'].includes(extension)) {
      return <TextIcon color="action" />;
    }

    return <FileIcon color="action" />;
  };

  // 파일 크기 포맷
  const formatFileSize = (size) => {
    if (!size) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 1 }}>
          {t('attachments.loading', '첨부파일을 불러오는 중...')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 1 }}>
        {error}
        <Button size="small" onClick={loadAttachments} sx={{ ml: 1 }}>
          {t('common.button.retry', '다시 시도')}
        </Button>
      </Alert>
    );
  }

  if (attachments.length === 0) {
    return compact ? null : (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <AttachFileIcon color="disabled" sx={{ fontSize: 48 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('attachments.empty', '첨부파일이 없습니다.')}
        </Typography>
      </Box>
    );
  }

  const content = (
    <List dense={compact} sx={{ maxHeight, overflow: 'auto' }}>
      {attachments.map((attachment, index) => (
        <React.Fragment key={attachment.id}>
          <ListItem>
            <ListItemIcon sx={{ minWidth: compact ? 36 : 56 }}>
              {getFileIcon(attachment)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography
                    variant={compact ? "body2" : "body1"}
                    component="span"
                    sx={{
                      wordBreak: 'break-word',
                      flex: 1
                    }}
                  >
                    {attachment.originalFileName}
                  </Typography>
                  {attachment.isRecentFile && (
                    <Chip
                      label="NEW"
                      size="small"
                      color="success"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(attachment.fileSize)} •
                    {attachment.uploadedByName} •
                    {formatDateSafe(attachment.createdAt, 'PPp')}
                  </Typography>
                  {attachment.description && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{
                        mt: 0.5,
                        fontStyle: 'italic',
                        color: 'text.secondary'
                      }}
                    >
                      {attachment.description}
                    </Typography>
                  )}
                </Box>
              }
              slotProps={{
                primary: { component: 'div' },
                secondary: { component: 'div' }
              }} />
            <ListItemSecondaryAction>
              <Box display="flex" gap={0.5}>
                {isPreviewable(attachment) && (
                  <Tooltip title={t('attachments.button.preview', '미리보기')}>
                    <IconButton
                      size={compact ? "small" : "medium"}
                      onClick={() => handlePreview(attachment)}
                    >
                      <ViewIcon fontSize={compact ? "small" : "medium"} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={t('attachments.button.download', '다운로드')}>
                  <IconButton
                    size={compact ? "small" : "medium"}
                    onClick={() => handleDownload(attachment)}
                  >
                    <DownloadIcon fontSize={compact ? "small" : "medium"} />
                  </IconButton>
                </Tooltip>

                {user && (user.id === attachment.uploadedBy || user.role === 'ADMIN') && (
                  <Tooltip title={t('attachments.button.delete', '삭제')}>
                    <IconButton
                      size={compact ? "small" : "medium"}
                      color="error"
                      onClick={() => {
                        setSelectedAttachment(attachment);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon fontSize={compact ? "small" : "medium"} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
          {index < attachments.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );

  const wrappedContent = compact ? content : (
    <Card variant="outlined">
      {showHeader && (
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="h6" display="flex" alignItems="center" gap={1}>
            <AttachFileIcon />
            {t('attachments.title', '첨부파일')} ({attachments.length})
          </Typography>
        </CardContent>
      )}
      <CardContent sx={{ pt: showHeader ? 0 : 2 }}>
        {content}
      </CardContent>
    </Card>
  );

  return (
    <>
      {wrappedContent}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>{t('attachments.delete.title', '첨부파일 삭제')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('attachments.delete.message', '다음 파일을 삭제하시겠습니까?')}
          </Typography>
          <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
            {selectedAttachment?.originalFileName}
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t('attachments.delete.warning', '삭제된 파일은 복구할 수 없습니다.')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.button.cancel', '취소')}
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
          >
            {t('common.button.delete', '삭제')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 미리보기 다이얼로그 */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        disableRestoreFocus
      >
        <DialogTitle>{previewTitle}</DialogTitle>
        <DialogContent>
          {previewType === 'image' && (
            <Box sx={{ textAlign: 'center' }}>
              <img src={previewUrl} alt={previewTitle} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
            </Box>
          )}

          {previewType === 'pdf' && (
            <Box sx={{ height: '80vh', width: '100%' }}>
              <iframe
                src={previewUrl}
                title={previewTitle}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </Box>
          )}

          {(previewType === 'text' || previewType === 'json' || previewType === 'csv') && (
            <Box sx={{ maxHeight: '80vh', overflow: 'auto' }}>
              <pre style={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                backgroundColor: (theme) => theme.palette.background.paper,
                padding: '16px',
                borderRadius: '4px',
                margin: 0,
                color: (theme) => theme.palette.text.primary
              }}>
                {previewContent}
              </pre>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>
            {t('common.button.close', '닫기')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TestResultAttachmentsView;
