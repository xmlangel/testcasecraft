import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  CircularProgress,
  Button,
  Alert,
  IconButton
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import { useI18n } from '../../context/I18nContext.jsx';

function DocumentPreviewDialog({ open, document, onClose, fetchPreview }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let currentUrl = null;

    const loadPreview = async () => {
      if (!open || !document?.id) {
        setPreviewUrl(null);
        setError(null);
        return;
      }

      const isPdf = document.fileName?.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        setError(t('rag.preview.pdfOnly', 'PDF 파일만 미리보기가 가능합니다.'));
        setPreviewUrl(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setPreviewUrl(null);

      try {
        const blob = await fetchPreview(document.id);
        if (!isMounted) return;
        currentUrl = URL.createObjectURL(blob);
        setPreviewUrl(currentUrl);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || err?.message || t('rag.preview.error', 'PDF를 불러올 수 없습니다.'));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      setPreviewUrl(null);
    };
  }, [open, document?.id, document?.fileName, fetchPreview, t]);

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    setLoading(false);
    onClose?.();
  };

  return (
    <Dialog
      open={open && Boolean(document)}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      disableEnforceFocus
      slotProps={{
        paper: { sx: { minHeight: '80vh' } }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PictureAsPdfIcon color="error" />
          <Typography variant="h6">{document?.fileName}</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              {t('rag.preview.loading', 'PDF를 불러오는 중...')}
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        ) : previewUrl ? (
          <Box sx={{ width: '100%', height: '70vh' }}>
            <iframe
              src={previewUrl}
              title={document?.fileName || 'PDF Preview'}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              allow="fullscreen"
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('rag.preview.loading', 'PDF를 불러오는 중...')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('common.close', '닫기')}</Button>
      </DialogActions>
    </Dialog>
  );
}

DocumentPreviewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  document: PropTypes.shape({
    id: PropTypes.string,
    fileName: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  fetchPreview: PropTypes.func.isRequired,
};

export default DocumentPreviewDialog;
