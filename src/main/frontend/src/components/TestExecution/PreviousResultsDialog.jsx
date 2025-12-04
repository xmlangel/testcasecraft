import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
    Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Paper, Chip, CircularProgress, IconButton
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { AttachFile as AttachFileIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import MDEditor from '@uiw/react-md-editor';
import { useTranslation } from '../../context/I18nContext.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import TestResultAttachmentsView from '../TestCase/TestResultAttachmentsView.jsx';
import JiraIssueLink from './JiraIssueLink.jsx';
import { getResultIcon, formatDateTimeFull } from './utils.jsx';
import TestResultForm from '../TestResultForm.jsx';

function PreviousResultsDialog({ open, onClose, results, loading, onAttachmentDeleted }) {
    const theme = useTheme();
    const darkMode = theme.palette.mode === 'dark';
    const { t } = useTranslation();
    const { user, api } = useAppContext();
    const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
    const [selectedTestResultId, setSelectedTestResultId] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedResult, setSelectedResult] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [resultToDelete, setResultToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const sortedResults = useMemo(() => {
        if (!results) return [];
        return [...results].sort(
            (a, b) => new Date(b.executedAt) - new Date(a.executedAt)
        );
    }, [results]);

    const handleAttachmentClick = (testResultId) => {
        setSelectedTestResultId(testResultId);
        setAttachmentDialogOpen(true);
    };

    // 권한 확인
    const canEdit = (result) => {
        if (!user) return false;
        // 실행한 본인 OR ADMIN OR MANAGER
        return result.executedBy === user.username ||
            user.role === 'ADMIN' ||
            user.role === 'MANAGER';
    };

    const canDelete = () => {
        if (!user) return false;
        // ADMIN OR MANAGER만
        return user.role === 'ADMIN' || user.role === 'MANAGER';
    };

    // 수정 버튼 클릭
    const handleEditClick = (result) => {
        setSelectedResult(result);
        setEditDialogOpen(true);
    };

    // 삭제 버튼 클릭
    const handleDeleteClick = (result) => {
        setResultToDelete(result);
        setDeleteConfirmOpen(true);
    };

    // 삭제 확인
    const handleDeleteConfirm = async () => {
        if (!resultToDelete) return;

        setDeleting(true);
        try {
            const response = await api(`/api/test-executions/results/${resultToDelete.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('테스트 결과가 삭제되었습니다.');
                setDeleteConfirmOpen(false);
                setResultToDelete(null);
                // 부모 컴포넌트 리로드 트리거
                if (onAttachmentDeleted) {
                    onAttachmentDeleted();
                }
            } else {
                const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
                alert(`삭제 실패: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('삭제 중 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth disableRestoreFocus>
                <DialogTitle>{t('testExecution.prevResults.title')}</DialogTitle>
                <DialogContent dividers>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : sortedResults.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            {t('testExecution.prevResults.noResults')}
                        </Typography>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>{t('testExecution.table.executedAt')}</TableCell>
                                        <TableCell>{t('testExecution.table.result')}</TableCell>
                                        <TableCell>{t('testExecution.table.executionId')}</TableCell>
                                        <TableCell>{t('testExecution.table.executionName')}</TableCell>
                                        <TableCell>{t('testExecution.table.executedBy')}</TableCell>
                                        <TableCell>{t('testExecution.table.notes')}</TableCell>
                                        <TableCell>{t('testExecution.previousResults.table.tags')}</TableCell>
                                        <TableCell>{t('testExecution.table.jiraId')}</TableCell>
                                        <TableCell>{t('testExecution.table.attachments')}</TableCell>
                                        <TableCell align="center">{t('testExecution.previousResults.table.actions')}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedResults.map((r, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>
                                                {r.executedAt ? formatDateTimeFull(r.executedAt) : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {getResultIcon(r.result)}
                                                <span style={{ marginLeft: 6 }}>{r.result}</span>
                                            </TableCell>
                                            <TableCell>{r.testExecutionId}</TableCell>
                                            <TableCell>{r.testExecutionName}</TableCell>
                                            <TableCell>{r.executedBy}</TableCell>
                                            <TableCell>
                                                {r.notes ? (
                                                    <Box data-color-mode={darkMode ? 'dark' : 'light'}>
                                                        <MDEditor.Markdown
                                                            source={r.notes}
                                                            style={{
                                                                whiteSpace: 'pre-wrap',
                                                                backgroundColor: 'transparent',
                                                                color: theme.palette.text.primary,
                                                                fontSize: '0.875rem'
                                                            }}
                                                        />
                                                    </Box>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {r.tags && r.tags.length > 0 ? (
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {r.tags.map((tag, index) => (
                                                            <Chip
                                                                key={index}
                                                                label={tag}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        ))}
                                                    </Box>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {r.jiraIssueKey ? (
                                                    <JiraIssueLink issueKey={r.jiraIssueKey} />
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {r.attachmentCount > 0 ? (
                                                    <Tooltip title={t('testExecution.table.viewAttachments')}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleAttachmentClick(r.id)}
                                                            sx={{ p: 0.5 }}
                                                        >
                                                            <AttachFileIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    "-"
                                                )}
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    {canEdit(r) && (
                                                        <Tooltip title={t('testExecution.previousResults.action.edit')}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleEditClick(r)}
                                                                sx={{ p: 0.5 }}
                                                                color="primary"
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    {canDelete() && (
                                                        <Tooltip title={t('testExecution.previousResults.action.delete')}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleDeleteClick(r)}
                                                                sx={{ p: 0.5 }}
                                                                color="error"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        {t('common.close')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ICT-362: 첨부파일 다이얼로그 */}
            <Dialog
                open={attachmentDialogOpen}
                onClose={() => {
                    setAttachmentDialogOpen(false);
                    setSelectedTestResultId(null);
                }}
                maxWidth="md"
                fullWidth
                disableRestoreFocus
            >
                <DialogTitle>
                    {t('testExecution.previousResults.attachments.title')}
                </DialogTitle>
                <DialogContent>
                    {selectedTestResultId && (
                        <TestResultAttachmentsView
                            testResultId={selectedTestResultId}
                            showUpload={false}
                            onAttachmentDeleted={onAttachmentDeleted}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setAttachmentDialogOpen(false);
                        setSelectedTestResultId(null);
                    }}>
                        {t('common.close')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 수정 다이얼로그 */}
            {editDialogOpen && selectedResult && (
                <TestResultForm
                    open={editDialogOpen}
                    testCaseId={selectedResult.testCaseId}
                    executionId={selectedResult.testExecutionId}
                    currentResult={selectedResult}
                    onClose={() => {
                        setEditDialogOpen(false);
                        setSelectedResult(null);
                    }}
                    onSave={() => {
                        setEditDialogOpen(false);
                        setSelectedResult(null);
                        // 부모 컴포넌트 리로드 트리거
                        if (onAttachmentDeleted) {
                            onAttachmentDeleted();
                        }
                    }}
                    isPreviousResultEdit={true}
                />
            )}

            {/* 삭제 확인 다이얼로그 */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => !deleting && setDeleteConfirmOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{t('testExecution.previousResults.delete.title')}</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('testExecution.previousResults.delete.confirm')}
                    </Typography>
                    {resultToDelete && (
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                            {t('testExecution.previousResults.delete.info', { result: resultToDelete.result, executedAt: formatDateTimeFull(resultToDelete.executedAt) })}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>
                        {t('testExecution.previousResults.delete.cancel')}
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                        disabled={deleting}
                    >
                        {deleting ? t('testExecution.previousResults.delete.deleting') : t('testExecution.previousResults.delete.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

PreviousResultsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    results: PropTypes.array,
    loading: PropTypes.bool,
    onAttachmentDeleted: PropTypes.func,
};

export default PreviousResultsDialog;
