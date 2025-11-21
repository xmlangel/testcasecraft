import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
    Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Paper, Chip, CircularProgress
} from "@mui/material";
import { AttachFile as AttachFileIcon } from "@mui/icons-material";
import MDEditor from '@uiw/react-md-editor';
import { useTranslation } from '../../context/I18nContext.jsx';
import TestResultAttachmentsView from '../TestCase/TestResultAttachmentsView.jsx';
import JiraIssueLink from './JiraIssueLink.jsx';
import { getResultIcon, formatDateTimeFull } from './utils.jsx';

function PreviousResultsDialog({ open, onClose, results, loading, onAttachmentDeleted }) {
    const { t } = useTranslation();
    const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
    const [selectedTestResultId, setSelectedTestResultId] = useState(null);

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

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
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
                                        <TableCell>{t('testExecution.table.tags', '태그')}</TableCell>
                                        <TableCell>{t('testExecution.table.jiraId')}</TableCell>
                                        <TableCell>{t('testExecution.table.attachments')}</TableCell>
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
                                                    <Box data-color-mode="light">
                                                        <MDEditor.Markdown source={r.notes} style={{ whiteSpace: 'pre-wrap' }} />
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
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<AttachFileIcon />}
                                                            onClick={() => handleAttachmentClick(r.id)}
                                                            sx={{ minWidth: 0, px: 1 }}
                                                        >
                                                            {t('testExecution.table.attachments')}
                                                        </Button>
                                                    </Tooltip>
                                                ) : (
                                                    "-"
                                                )}
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
            >
                <DialogTitle>
                    테스트 결과 첨부파일
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
