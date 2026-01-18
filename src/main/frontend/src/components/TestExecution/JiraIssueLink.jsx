import React from 'react';
import { Chip } from "@mui/material";
import { useAppContext } from "../../context/AppContext.jsx";
import { useTranslation } from '../../context/I18nContext.jsx';

const JiraIssueLink = ({ issueKey }) => {
    const { jiraServerUrl } = useAppContext();
    const { t } = useTranslation();

    if (!jiraServerUrl) {
        return (
            <Chip
                label={t('testExecution.jira.urlNotSet', { issueKey })}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
            />
        );
    }

    return (
        <Chip
            label={issueKey}
            size="small"
            color="primary"
            variant="outlined"
            component="a"
            href={`${jiraServerUrl}/browse/${issueKey}`}
            target="_blank"
            rel="noopener noreferrer"
            clickable
            sx={{ mr: 0.5, mb: 0.5 }}
        />
    );
};

export default JiraIssueLink;
