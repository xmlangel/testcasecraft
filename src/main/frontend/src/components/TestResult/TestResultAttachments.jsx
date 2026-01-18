import React from 'react';
import {
    Box, Typography, Button, List, ListItem, ListItemText, ListItemSecondaryAction,
    IconButton, Tooltip, Alert, CircularProgress
} from '@mui/material';
import {
    AttachFile as AttachFileIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import TestResultAttachmentsView from '../TestCase/TestResultAttachmentsView.jsx';

const TestResultAttachments = ({
    attachedFiles,
    handleFileUpload,
    handleFileDelete,
    handlePreview,
    isViewer,
    t,
    fileUploadError,
    isFileUploading,
    currentResult
}) => {
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFileIcon />
                {t('testResult.form.fileAttachment')}
            </Typography>

            <Box sx={{ mb: 2 }}>
                <input
                    accept=".txt,.csv,.json,.md,.pdf,.log,.png,.jpg,.jpeg,.gif"
                    style={{ display: 'none' }}
                    id="file-upload-input"
                    multiple
                    type="file"
                    onChange={handleFileUpload}
                    disabled={isViewer || isFileUploading}
                />
                <label htmlFor="file-upload-input">
                    <Button
                        variant="outlined"
                        component="span"
                        disabled={isViewer || isFileUploading}
                        startIcon={isFileUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                        sx={{ mr: 2 }}
                    >
                        {isFileUploading ? t('testResult.form.fileUploading') : t('testResult.form.fileSelect')}
                    </Button>
                </label>
                <Typography variant="caption" color="text.secondary">
                    허용 형식: TXT, CSV, JSON, MD, PDF, LOG, PNG, JPG, GIF (최대 10MB)
                </Typography>
            </Box>

            {fileUploadError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {fileUploadError}
                </Alert>
            )}

            {/* 새로 첨부될 파일 목록 */}
            {attachedFiles.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom color="primary">
                        새로 첨부할 파일 ({attachedFiles.length}개)
                    </Typography>
                    <List dense>
                        {attachedFiles.map((file) => (
                            <ListItem key={file.id} divider>
                                <ListItemText
                                    primary={file.name}
                                    secondary={`${formatFileSize(file.size)} • ${new Date(file.lastModified).toLocaleString()}`}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={() => handleFileDelete(file.id)}
                                        disabled={isViewer}
                                        size="small"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                    {file.file.type.startsWith('image/') && (
                                        <Tooltip title={t('attachments.button.preview', '미리보기')}>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handlePreview(file)}
                                                size="small"
                                                sx={{ ml: 1 }}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}

            {/* 저장된 첨부파일 표시 */}
            {currentResult && currentResult.id && currentResult.attachmentCount > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        첨부파일
                        {currentResult && currentResult.id && (
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                (결과 ID: {currentResult.id})
                            </Typography>
                        )}
                    </Typography>

                    <TestResultAttachmentsView
                        testResultId={currentResult.id}
                        compact={true}
                        showHeader={false}
                        maxHeight={300}
                    />
                </Box>
            )}
        </Box>
    );
};

export default TestResultAttachments;
