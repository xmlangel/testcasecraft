import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { BugReport as BugReportIcon } from '@mui/icons-material';
import JiraIssueLinker from '../JiraIntegration/JiraIssueLinker.jsx';
import { jiraService } from '../../services/jiraService';

const TestResultJira = ({
    jiraIssueKey,
    setJiraIssueKey,
    isJiraIssueKeyInvalid,
    jiraConnectionStatus,
    result,
    notes,
    handleIssueLinked,
    handleIssueUnlinked,
    linkedIssues,
    isViewer,
    t,
    detectedJiraIssues = []
}) => {
    const handlePaste = async (e) => {
        const pastedText = e.clipboardData.getData('text');
        const extractedKey = jiraService.extractIssueKeyFromUrl(pastedText);

        if (extractedKey) {
            e.preventDefault();
            setJiraIssueKey(extractedKey);

            // JIRA 연동 섹션에도 자동 입력 (이슈 정보 로드 및 연결)
            if (jiraConnectionStatus?.hasConfig && jiraConnectionStatus?.isConnected && handleIssueLinked) {
                try {
                    const issueDetails = await jiraService.getIssueDetails(extractedKey);
                    if (issueDetails && (issueDetails.key || issueDetails.jiraIssueKey)) {
                        handleIssueLinked(issueDetails);
                    }
                } catch (error) {
                    console.warn('JIRA 이슈 자동 연동 실패 (ID는 입력됨):', error.message);
                }
            }
        }
    };

    return (
        <Box>
            <TextField
                label={t('testResult.jira.issueIdLabel')}
                value={jiraIssueKey}
                onChange={(e) => setJiraIssueKey(e.target.value.toUpperCase())}
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                disabled={isViewer}
                placeholder={t('testResult.jira.issueIdPlaceholder')}
                helperText={isJiraIssueKeyInvalid ?
                    t('testResult.jira.invalidFormat') :
                    jiraIssueKey ? t('testResult.jira.autoUppercase') : ""}
                error={isJiraIssueKeyInvalid}
                onPaste={handlePaste}
                slotProps={{ htmlInput: { 'data-testid': 'result-jira-input' } }}
            />

            {/* JIRA Integration Section */}
            {jiraConnectionStatus?.hasConfig && jiraConnectionStatus?.isConnected && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BugReportIcon />
                        {t('testResult.form.jiraIntegration')}
                    </Typography>
                    {detectedJiraIssues.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {t('testResult.jira.detectedIssues', '감지된 이슈')}: {detectedJiraIssues.join(', ')}
                        </Typography>
                    )}
                    <JiraIssueLinker
                        testResult={{ result, notes }}
                        onIssueLinked={handleIssueLinked}
                        onIssueUnlinked={handleIssueUnlinked}
                        linkedIssues={linkedIssues}
                        disabled={isViewer}
                    />
                </Box>
            )}
        </Box>
    );
};

export default TestResultJira;
