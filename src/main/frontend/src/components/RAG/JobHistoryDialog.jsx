// src/components/RAG/JobHistoryDialog.jsx
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
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HistoryIcon from '@mui/icons-material/History';
import ErrorIcon from '@mui/icons-material/Error';
import { formatDateArray, getProgressColor } from './utils/documentFormatUtils.js';

/**
 * 작업 이력 다이얼로그 컴포넌트
 * 문서별 LLM 분석 작업 이력을 테이블로 표시합니다.
 */
function JobHistoryDialog({
    open,
    onClose,
    selectedJobHistory = null,
    loadingJobHistory = false,
    t,
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HistoryIcon color="info" />
                    <Typography variant="h6">
                        {t('rag.document.jobHistory.title', '작업 이력 - {fileName}', { fileName: selectedJobHistory?.fileName })}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {loadingJobHistory ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : selectedJobHistory?.jobs && selectedJobHistory.jobs.length > 0 ? (
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('rag.document.jobHistory.jobId', '작업 ID')}</TableCell>
                                    <TableCell>{t('rag.document.jobHistory.llmProvider', 'LLM 제공자')}</TableCell>
                                    <TableCell>{t('rag.document.jobHistory.llmModel', 'LLM 모델')}</TableCell>
                                    <TableCell>{t('rag.document.jobHistory.status', '상태')}</TableCell>
                                    <TableCell align="center">{t('rag.document.jobHistory.progress', '진행률')}</TableCell>
                                    <TableCell>{t('rag.document.jobHistory.chunks', '청크')}</TableCell>
                                    <TableCell align="right">{t('rag.document.jobHistory.cost', '비용 (USD)')}</TableCell>
                                    <TableCell align="right">{t('rag.document.jobHistory.tokens', '토큰')}</TableCell>
                                    <TableCell>{t('rag.document.jobHistory.startTime', '시작 시각')}</TableCell>
                                    <TableCell>{t('rag.document.jobHistory.completedTime', '완료 시각')}</TableCell>
                                    <TableCell>{t('rag.document.jobHistory.pausedTime', '일시정지 시각')}</TableCell>
                                    <TableCell>{t('rag.document.jobHistory.errorMessage', '에러 메시지')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedJobHistory.jobs.map((job) => (
                                    <TableRow key={job.jobId} hover>
                                        <TableCell>
                                            <Typography variant="caption" fontFamily="monospace">
                                                {job.jobId?.toString().substring(0, 8)}...
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={job.llmProvider || '-'}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{job.llmModel || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={job.status}
                                                size="small"
                                                color={
                                                    job.status === 'completed' ? 'success' :
                                                        job.status === 'processing' ? 'primary' :
                                                            job.status === 'paused' ? 'warning' :
                                                                job.status === 'cancelled' ? 'default' :
                                                                    job.status === 'error' ? 'error' : 'default'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                                                <CircularProgress
                                                    variant="determinate"
                                                    value={job.percentage || 0}
                                                    size={28}
                                                    color={getProgressColor(job.percentage || 0)}
                                                />
                                                <Typography variant="caption">{Math.round(job.percentage || 0)}%</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={`${job.processedChunks || 0} / ${job.totalChunks || 0}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" color="primary.main" fontWeight="bold">
                                                ${(job.totalCostUsd || 0).toFixed(4)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">
                                                {(job.totalTokens || 0).toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption">
                                                {formatDateArray(job.startedAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption">
                                                {formatDateArray(job.completedAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="caption">
                                                {formatDateArray(job.pausedAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {job.errorMessage ? (
                                                <Tooltip title={job.errorMessage}>
                                                    <Chip
                                                        label={t('rag.document.jobHistory.hasError', '에러 있음')}
                                                        size="small"
                                                        color="error"
                                                        icon={<ErrorIcon />}
                                                    />
                                                </Tooltip>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">-</Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Alert severity="info">
                        {t('rag.document.jobHistory.empty', '이 문서에 대한 작업 이력이 없습니다.')}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.close', '닫기')}</Button>
            </DialogActions>
        </Dialog>
    );
}

JobHistoryDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedJobHistory: PropTypes.shape({
        documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        fileName: PropTypes.string,
        jobs: PropTypes.arrayOf(PropTypes.object),
    }),
    loadingJobHistory: PropTypes.bool,
    t: PropTypes.func.isRequired,
};

export default JobHistoryDialog;
