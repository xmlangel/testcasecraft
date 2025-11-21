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
                label="JIRA 이슈 ID (예: ICT-123)"
                value={jiraIssueKey}
                onChange={(e) => setJiraIssueKey(e.target.value.toUpperCase())}
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                disabled={isViewer}
                placeholder="관련된 JIRA 이슈 키를 입력하세요 (자동으로 대문자 변환)"
                helperText={isJiraIssueKeyInvalid ?
                    "올바른 JIRA 이슈 키 형식이 아닙니다 (예: ICT-123)" :
                    jiraIssueKey ? "입력된 키가 자동으로 대문자로 변환됩니다" : ""}
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
