import React from 'react';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { BugReport as BugReportIcon } from '@mui/icons-material';

const TestResultFooter = ({
    onClose,
    onSave,
    handleOpenJiraDialog,
    shouldShowJiraButton,
    detectedJiraIssues,
    loading,
    isViewer,
    testCase,
    saveButtonRef,
    t
}) => {
    return (
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            {/* JIRA 버튼 (좌측) */}
            <Box>
                {shouldShowJiraButton() && !isViewer && (
                    <Tooltip title="JIRA 이슈에 테스트 결과 코멘트 추가">
                        <span>
                            <Button
                                variant="outlined"
                                color="warning"
                                startIcon={<BugReportIcon />}
                                onClick={handleOpenJiraDialog}
                                disabled={loading}
                            >
                                {t('testResult.form.jiraComment')}
                            </Button>
                        </span>
                    </Tooltip>
                )}
                {detectedJiraIssues.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        감지된 이슈: {detectedJiraIssues.join(', ')}
                    </Typography>
                )}
            </Box>

            {/* 기본 버튼들 (우측) */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    {t('common.button.cancel')}
                </Button>
                {!isViewer && (
                    <Button
                        ref={saveButtonRef}
                        onClick={onSave}
                        variant="contained"
                        color="primary"
                        disabled={loading || isViewer || !testCase}
                    >
                        {t('common.button.save')}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default TestResultFooter;
