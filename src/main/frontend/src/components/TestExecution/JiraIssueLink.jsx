import React, { useState } from 'react';
import { Chip, Stack, Tooltip } from "@mui/material";
import { useAppContext } from "../../context/AppContext.jsx";
import { useTranslation } from '../../context/I18nContext.jsx';
import JiraHistoryDialog from './JiraHistoryDialog.jsx';

/**
 * JIRA 이슈 링크 컴포넌트
 * ICT-188: 다중 JIRA ID 지원 및 클릭 시 테스트 히스토리 표시
 */
const JiraIssueLink = ({ issueKey }) => {
    const { jiraServerUrl } = useAppContext();
    const { t } = useTranslation();
    const [historyOpen, setHistoryOpen] = useState(false);
    const [selectedKey, setSelectedKey] = useState('');

    if (!issueKey) return null;

    // 콤마나 공백으로 구분된 여러 개의 키 처리
    const keys = issueKey.split(/[, \s]+/).filter(k => k.trim() !== '');

    const handleKeyClick = (e, key) => {
        // Shift 키를 누르고 클릭하면 JIRA 서버로 직접 이동
        if (e.shiftKey && jiraServerUrl) {
            return; // 기본 href 동작 허용
        }
        
        // 일반 클릭 시 히스토리 다이얼로그 표시
        e.preventDefault();
        e.stopPropagation();
        setSelectedKey(key);
        setHistoryOpen(true);
    };

    if (!jiraServerUrl) {
        return (
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {keys.map((key, index) => (
                    <Tooltip key={index} title={t('jira.history.tooltip', '클릭하여 테스트 히스토리 보기')}>
                        <Chip
                            label={key}
                            size="small"
                            color="warning"
                            variant="outlined"
                            onClick={(e) => handleKeyClick(e, key)}
                            sx={{ cursor: 'pointer' }}
                        />
                    </Tooltip>
                ))}
                {historyOpen && (
                    <JiraHistoryDialog 
                        open={historyOpen} 
                        onClose={() => setHistoryOpen(false)} 
                        jiraIssueKey={selectedKey} 
                    />
                )}
            </Stack>
        );
    }

    return (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {keys.map((key, index) => (
                <Tooltip key={index} title={t('jira.history.tooltip', '클릭하여 테스트 히스토리 보기 (Shift+클릭: JIRA에서 열기)')}>
                    <Chip
                        label={key}
                        size="small"
                        color="primary"
                        variant="outlined"
                        component="a"
                        href={`${jiraServerUrl}/browse/${key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        clickable
                        onClick={(e) => handleKeyClick(e, key)}
                    />
                </Tooltip>
            ))}
            {historyOpen && (
                <JiraHistoryDialog 
                    open={historyOpen} 
                    onClose={() => setHistoryOpen(false)} 
                    jiraIssueKey={selectedKey} 
                />
            )}
        </Stack>
    );
};

export default JiraIssueLink;
