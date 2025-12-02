import React, { useState, useEffect } from 'react';
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
    Autocomplete,
    CircularProgress,
    Alert
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    CheckCircle as PassIcon,
    Cancel as FailIcon,
    Block as BlockedIcon,
    RadioButtonUnchecked as NotRunIcon
} from '@mui/icons-material';
import { useTranslation } from '../../context/I18nContext.jsx';
import { TestResult } from '../../models/testExecution.jsx';
import { RESULT_COLORS } from '../../constants/statusColors';

const BulkResultDialog = ({
    open,
    onClose,
    selectedTestCases,
    availableTags,
    onBulkUpdate,
    processing,
    preselectedResult
}) => {
    const { t } = useTranslation();
    const [selectedResult, setSelectedResult] = useState(null);
    const [commonNotes, setCommonNotes] = useState('');
    const [commonTags, setCommonTags] = useState([]);
    const [commonJiraId, setCommonJiraId] = useState('');

    // Set initial result when dialog opens with preselected value
    useEffect(() => {
        if (open && preselectedResult) {
            setSelectedResult(preselectedResult);
        }
    }, [open, preselectedResult]);

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
        { value: TestResult.PASS, label: 'PASS', icon: <PassIcon />, color: RESULT_COLORS.PASS },
        { value: TestResult.FAIL, label: 'FAIL', icon: <FailIcon />, color: RESULT_COLORS.FAIL },
        { value: TestResult.BLOCKED, label: 'BLOCKED', icon: <BlockedIcon />, color: RESULT_COLORS.BLOCKED },
        { value: TestResult.NOT_RUN, label: 'NOT RUN', icon: <NotRunIcon />, color: RESULT_COLORS.NOTRUN }
    ];

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown={processing}
            disableRestoreFocus
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
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        {resultButtons.map((btn) => {
                            const isSelected = selectedResult === btn.value;
                            return (
                                <Button
                                    key={btn.value}
                                    onClick={() => setSelectedResult(btn.value)}
                                    variant={isSelected ? "contained" : "outlined"}
                                    sx={{
                                        flex: 1,
                                        py: 2,
                                        border: `3px solid ${btn.color}`,
                                        borderRadius: 2,
                                        backgroundColor: isSelected ? btn.color : alpha(btn.color, 0.1),
                                        color: isSelected ? '#fff' : btn.color,
                                        fontWeight: isSelected ? 700 : 600,
                                        fontSize: '0.9rem',
                                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: isSelected
                                            ? `0 6px 16px ${alpha(btn.color, 0.4)}, 0 0 0 2px ${alpha(btn.color, 0.2)}`
                                            : `0 2px 6px ${alpha(btn.color, 0.2)}`,
                                        transform: isSelected ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
                                        '&:hover': {
                                            backgroundColor: isSelected ? alpha(btn.color, 0.9) : alpha(btn.color, 0.2),
                                            transform: 'scale(1.03) translateY(-2px)',
                                            boxShadow: `0 6px 12px ${alpha(btn.color, 0.3)}`,
                                            borderColor: btn.color
                                        },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    {btn.icon}
                                    <Typography variant="caption" sx={{ fontWeight: 'inherit' }}>{btn.label}</Typography>
                                </Button>
                            );
                        })}
                    </Box>

                    {/* Common notes */}
                    <TextField
                        id="bulk-common-notes"
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
                                id="bulk-common-tags"
                                label={t('testExecution.bulk.dialog.commonTags', '공통 태그')}
                                placeholder={t('testExecution.form.tagsPlaceholder', '태그를 입력하고 Enter를 누르세요')}
                            />
                        )}
                        sx={{ mb: 2 }}
                        disabled={processing}
                    />

                    {/* Common JIRA ID */}
                    <TextField
                        id="bulk-common-jira-id"
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
    processing: PropTypes.bool,
    preselectedResult: PropTypes.string
};

export default BulkResultDialog;
