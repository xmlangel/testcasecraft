import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { BugReport as BugReportIcon } from '@mui/icons-material';
import JiraIssueLinker from '../JiraIntegration/JiraIssueLinker.jsx';

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
    t
}) => {
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
            />

            {/* JIRA Integration Section */}
            {jiraConnectionStatus?.hasConfig && jiraConnectionStatus?.isConnected && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BugReportIcon />
                        {t('testResult.form.jiraIntegration')}
                    </Typography>
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
