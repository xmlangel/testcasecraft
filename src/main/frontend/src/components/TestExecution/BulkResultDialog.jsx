import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    TextField,
    ToggleButtonGroup,
    ToggleButton,
    Autocomplete,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    CheckCircle as PassIcon,
    Cancel as FailIcon,
    Block as BlockedIcon,
    RadioButtonUnchecked as NotRunIcon
} from '@mui/icons-material';
import { useTranslation } from '../../context/I18nContext.jsx';
import { TestResult } from '../../models/testExecution.jsx';

const BulkResultDialog = ({
    open,
    onClose,
    selectedTestCases,
    availableTags,
    onBulkUpdate,
    processing
}) => {
    const { t } = useTranslation();
    const [selectedResult, setSelectedResult] = useState(null);
    const [commonNotes, setCommonNotes] = useState('');
    const [commonTags, setCommonTags] = useState([]);
    const [commonJiraId, setCommonJiraId] = useState('');

    const handleConfirm = () => {
        if (!selectedResult) {
            return;
        }

        onBulkUpdate({
            result: selectedResult,
            notes: commonNotes,
            tags: commonTags,
            jiraIssueKey: commonJiraId
        });
    };

    const handleClose = () => {
        if (processing) return;

        // Reset form
        setSelectedResult(null);
        setCommonNotes('');
        setCommonTags([]);
        setCommonJiraId('');
        onClose();
    };

    const resultButtons = [
        { value: TestResult.PASS, label: 'PASS', icon: <PassIcon />, color: 'success' },
        { value: TestResult.FAIL, label: 'FAIL', icon: <FailIcon />, color: 'error' },
        { value: TestResult.BLOCKED, label: 'BLOCKED', icon: <BlockedIcon />, color: 'warning' },
        { value: TestResult.NOT_RUN, label: 'NOT RUN', icon: <NotRunIcon />, color: 'standard' }
    ];

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown={processing}
        >
            <DialogTitle>
                {t('testExecution.bulk.dialog.title', '일괄 결과 입력')}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {/* Selected test cases */}
                    <Typography variant="subtitle2" gutterBottom>
                        {t('testExecution.bulk.dialog.selectedCases', '선택된 테스트케이스')} ({selectedTestCases.length})
                    </Typography>
                    <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: '120px', overflowY: 'auto', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        {selectedTestCases.map((tc) => (
                            <Chip
                                key={tc.id}
                                label={tc.name}
                                size="small"
                                variant="outlined"
                            />
                        ))}
                    </Box>

                    {/* Result selection */}
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                        {t('testExecution.bulk.dialog.selectResult', '결과 선택')} *
                    </Typography>
                    <ToggleButtonGroup
                        value={selectedResult}
                        exclusive
                        onChange={(e, newValue) => setSelectedResult(newValue)}
                        fullWidth
                        sx={{ mb: 3 }}
                    >
                        {resultButtons.map((btn) => (
                            <ToggleButton
                                key={btn.value}
                                value={btn.value}
                                color={btn.color}
                                sx={{ py: 2 }}
                            >
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                    {btn.icon}
                                    <Typography variant="caption">{btn.label}</Typography>
                                </Box>
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    {/* Common notes */}
                    <TextField
                        label={t('testExecution.bulk.dialog.commonNotes', '공통 비고')}
                        value={commonNotes}
                        onChange={(e) => setCommonNotes(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                        sx={{ mb: 2 }}
                        disabled={processing}
                    />

                    {/* Common tags */}
                    <Autocomplete
                        multiple
                        freeSolo
                        options={availableTags || []}
                        value={commonTags}
                        onChange={(e, newValue) => setCommonTags(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={t('testExecution.bulk.dialog.commonTags', '공통 태그')}
                                placeholder={t('testExecution.form.tagsPlaceholder', '태그를 입력하고 Enter를 누르세요')}
                            />
                        )}
                        sx={{ mb: 2 }}
                        disabled={processing}
                    />

                    {/* Common JIRA ID */}
                    <TextField
                        label={t('testExecution.bulk.dialog.commonJiraId', '공통 JIRA ID')}
                        value={commonJiraId}
                        onChange={(e) => setCommonJiraId(e.target.value)}
                        fullWidth
                        placeholder="PROJ-123"
                        disabled={processing}
                    />

                    {/* Processing indicator */}
                    {processing && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <CircularProgress size={20} />
                                <Typography variant="body2">
                                    {t('testExecution.bulk.processing', '{current}/{total} 처리 중...')}
                                </Typography>
                            </Box>
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={processing}>
                    {t('testExecution.bulk.dialog.cancel', '취소')}
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={!selectedResult || processing}
                >
                    {t('testExecution.bulk.dialog.confirm', '확인')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

BulkResultDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedTestCases: PropTypes.array.isRequired,
    availableTags: PropTypes.array,
    onBulkUpdate: PropTypes.func.isRequired,
    processing: PropTypes.bool
};

export default BulkResultDialog;
