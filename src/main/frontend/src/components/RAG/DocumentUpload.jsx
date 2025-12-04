// src/components/RAG/DocumentUpload.jsx
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import InfoIcon from '@mui/icons-material/Info';
import { useRAG } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// 문서 파서 옵션
const PARSER_OPTIONS = [
  {
    value: 'pypdf',
    label: 'pypdf',
    description: 'Basic local parser',
    descriptionKo: '기본 로컬 파서',
  },
  {
    value: 'pymupdf',
    label: 'PyMuPDF',
    description: 'Fast local parser with rich features',
    descriptionKo: '다양한 기능을 갖춘 빠른 로컬 파서',
  },
  {
    value: 'pymupdf4llm',
    label: 'PyMuPDF4LLM',
    description: 'LLM-optimized markdown extraction',
    descriptionKo: 'LLM 최적화 마크다운 추출',
  },
];

function DocumentUpload({ projectId, onUploadSuccess, embedded = false }) {
  const { t } = useI18n();
  const {
    uploadDocument,
    analyzeDocument,
    waitForDocumentAnalysis,
    waitForEmbeddingGeneration,
    generateEmbeddings,
    state
  } = useRAG();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [selectedParser, setSelectedParser] = useState('pymupdf4llm');

  const validateFile = useCallback((file) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return t('rag.upload.error.unsupportedFileType', '지원하지 않는 파일 형식입니다. (PDF, DOCX, DOC, TXT만 가능)');
    }
    if (file.size > MAX_FILE_SIZE) {
      return t('rag.upload.error.fileTooLarge', `파일 크기가 너무 큽니다. (최대 ${MAX_FILE_SIZE / 1024 / 1024}MB)`, { maxSize: MAX_FILE_SIZE / 1024 / 1024 });
    }
    return null;
  }, [t]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFilesSelection(files);
  }, []);

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files);
    handleFilesSelection(files);
  }, []);

  const handleFilesSelection = useCallback((files) => {
    setValidationError(null);

    const validFiles = [];
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return;
      }
      validFiles.push(file);
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, [validateFile]);

  const handleRemoveFile = useCallback((index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setValidationError(t('rag.upload.error.noFilesSelected', '업로드할 파일을 선택해주세요.'));
      return;
    }

    setValidationError(null);
    setLocalError(null);

    try {
      let lastProcessedDocument = null;
      for (const file of selectedFiles) {
        // 1. 파일 업로드
        const uploadedDoc = await uploadDocument(file, projectId);

        // 2. 문서 분석 (사용자가 선택한 파서 사용)
        await analyzeDocument(uploadedDoc.id, selectedParser);

        const analyzedDocument = await waitForDocumentAnalysis(uploadedDoc.id, {
          intervalMs: 2000,
          timeoutMs: 5 * 60 * 1000,
        });

        // 3. 임베딩 생성
        await generateEmbeddings(uploadedDoc.id);
        const embeddingCompletedDocument = await waitForEmbeddingGeneration(uploadedDoc.id, {
          intervalMs: 2000,
          timeoutMs: 5 * 60 * 1000,
        });

        lastProcessedDocument = embeddingCompletedDocument || analyzedDocument || uploadedDoc;
      }

      if (onUploadSuccess && lastProcessedDocument) {
        onUploadSuccess(lastProcessedDocument);
      }

      setSelectedFiles([]);
    } catch (error) {
      // console.error('문서 업로드 처리 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '문서 업로드에 실패했습니다.';
      setLocalError(errorMessage);

      // 5초 후 자동으로 오류 메시지 제거
      setTimeout(() => {
        setLocalError(null);
      }, 5000);
    }
  }, [
    selectedFiles,
    projectId,
    selectedParser,
    uploadDocument,
    analyzeDocument,
    waitForDocumentAnalysis,
    waitForEmbeddingGeneration,
    generateEmbeddings,
    onUploadSuccess,
    t
  ]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const content = (
    <>
      <Typography variant="h6" gutterBottom>
        {t('rag.upload.title', '문서 업로드')}
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        {t('rag.upload.description', 'PDF, DOCX, DOC, TXT 파일을 업로드하여 RAG 시스템에 등록할 수 있습니다. (최대 50MB)')}
      </Typography>

      {/* Parser Selection */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="parser-select-label">
            {t('rag.upload.parser.label', '문서 분석 파서')}
          </InputLabel>
          <Select
            labelId="parser-select-label"
            id="parser-select"
            value={selectedParser}
            label={t('rag.upload.parser.label', '문서 분석 파서')}
            onChange={(e) => setSelectedParser(e.target.value)}
          >
            {PARSER_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {option.label}
                  </Typography>
                  <Tooltip
                    title={t(`rag.upload.parser.${option.value}.description`, option.descriptionKo)}
                    placement="right"
                  >
                    <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {t(`rag.upload.parser.${selectedParser}.description`,
            PARSER_OPTIONS.find(p => p.value === selectedParser)?.descriptionKo || ''
          )}
        </Typography>
      </Box>

      {/* Drag and Drop Area */}
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          mt: 2,
          mb: 2,
          textAlign: 'center',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.3s',
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="body1" gutterBottom>
          {t('rag.upload.dragAndDrop', '파일을 이곳에 드래그하거나 클릭하여 선택하세요')}
        </Typography>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          id="file-upload-input"
        />
        <label htmlFor="file-upload-input">
          <Button
            component="span"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 1 }}
          >
            {t('rag.upload.selectFiles', '파일 선택')}
          </Button>
        </label>
      </Box>

      {/* Validation Error */}
      {validationError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setValidationError(null)}>
          {validationError}
        </Alert>
      )}

      {/* Local Error (Upload-specific) */}
      {localError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>
          {localError}
        </Alert>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('rag.upload.selectedFiles', '선택된 파일')} ({selectedFiles.length})
          </Typography>
          <List dense>
            {selectedFiles.map((file, index) => (
              <ListItem key={index}>
                <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                <ListItemText
                  primary={file.name}
                  secondary={formatFileSize(file.size)}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Uploading Files Progress */}
      {state.uploadingFiles.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('rag.upload.uploading', '업로드 중')} ({state.uploadingFiles.length})
          </Typography>
          <List dense>
            {state.uploadingFiles.map((file) => (
              <ListItem key={file.id}>
                <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                <ListItemText
                  primary={file.name}
                  secondary={
                    <>
                      <LinearProgress variant="determinate" value={file.progress} sx={{ width: '100%', mt: 0.5 }} />
                      <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                        {file.progress}%
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Upload Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CloudUploadIcon />}
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || state.loading}
        >
          {state.loading ? t('rag.upload.uploading', '업로드 중...') : t('rag.upload.upload', '업로드')}
        </Button>
      </Box>
    </>
  );

  if (embedded) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {content}
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      {content}
    </Paper>
  );
}

DocumentUpload.propTypes = {
  projectId: PropTypes.string.isRequired,
  onUploadSuccess: PropTypes.func,
  embedded: PropTypes.bool,
};

export default DocumentUpload;
