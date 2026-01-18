// src/components/RAG/SummaryDialog.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    IconButton,
    Tooltip,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { getProgressColor } from './utils/documentFormatUtils.js';

/**
 * LLM 분석 요약 다이얼로그 컴포넌트
 * 문서의 LLM 분석 결과를 페이지네이션과 함께 표시합니다.
 */
function SummaryDialog({
    open,
    onClose,
    selectedSummary = null,
    summaryContent = null,
    loadingSummary = false,
    isFullScreen = false,
    onToggleFullScreen,
    summaryPaginationLabel,
    canGoPrevSummary = false,
    canGoNextSummary = false,
    onPageChange,
    summaryMarkdownStyles,
    colorMode,
    t,
}) {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            fullScreen={isFullScreen}
            slotProps={{
                paper: {
                    className: 'glass-surface',
                    elevation: 5,
                }
            }}
        >
            <DialogTitle
                className="gradient-heading text-grotesque"
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    pb: 2,
                }}
            >
                <Typography className="gradient-heading text-grotesque">
                    LLM 분석 요약 - {selectedSummary?.documentName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title={isFullScreen ? "전체화면 종료" : "전체화면"}>
                        <IconButton
                            onClick={onToggleFullScreen}
                            size="small"
                            color="primary"
                        >
                            {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                        </IconButton>
                    </Tooltip>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                {selectedSummary ? (
                    <Box>
                        {/* 메타 정보 */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                            <Chip
                                label={t('rag.document.summary.totalChunksLabel', '총 {count}개 청크', { count: selectedSummary.totalChunks })}
                                size="small"
                                color="primary"
                            />
                            <Chip
                                label={t('rag.document.summary.analyzedChunksLabel', '분석 완료: {count}개', { count: selectedSummary.analyzedChunks })}
                                size="small"
                                color="success"
                            />
                            <Chip
                                label={t('rag.document.summary.progressLabel', '진행률: {progress}%', { progress: selectedSummary.progress })}
                                size="small"
                                color={getProgressColor(selectedSummary.progress)}
                            />
                        </Box>

                        {/* 통합 요약 내용 */}
                        <Box>
                            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                {t('rag.document.summary.resultsSummary', 'LLM 분석 결과 요약')}
                            </Typography>
                            {loadingSummary ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : selectedSummary.status === 'not_started' ? (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    {t('rag.llmAnalysis.status.notStartedMessage')}
                                </Alert>
                            ) : selectedSummary.status === 'error' ? (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {t('rag.llmAnalysis.status.errorMessage')}
                                </Alert>
                            ) : selectedSummary.status === 'processing' || selectedSummary.status === 'paused' ? (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    {t('rag.llmAnalysis.status.processingPausedMessage', { analyzedChunks: selectedSummary.analyzedChunks })}
                                </Alert>
                            ) : null}
                            {summaryContent && (
                                <Box
                                    data-color-mode={colorMode}
                                    className="glass-surface shadow-glass-medium"
                                    sx={summaryMarkdownStyles}
                                >
                                    <MDEditor.Markdown
                                        source={summaryContent}
                                        style={{ whiteSpace: 'pre-wrap' }}
                                    />
                                </Box>
                            )}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mt: 2,
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    {summaryPaginationLabel}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => onPageChange('prev')}
                                        disabled={!canGoPrevSummary || loadingSummary}
                                    >
                                        {t('common.previous', '이전')}
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => onPageChange('next')}
                                        disabled={!canGoNextSummary || loadingSummary}
                                    >
                                        {t('common.next', '다음')}
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <CircularProgress />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.close', '닫기')}</Button>
            </DialogActions>
        </Dialog>
    );
}

SummaryDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedSummary: PropTypes.object,
    summaryContent: PropTypes.string,
    loadingSummary: PropTypes.bool,
    isFullScreen: PropTypes.bool,
    onToggleFullScreen: PropTypes.func.isRequired,
    summaryPaginationLabel: PropTypes.string.isRequired,
    canGoPrevSummary: PropTypes.bool,
    canGoNextSummary: PropTypes.bool,
    onPageChange: PropTypes.func.isRequired,
    summaryMarkdownStyles: PropTypes.object.isRequired,
    colorMode: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
};

export default SummaryDialog;
