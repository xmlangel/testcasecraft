import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button, Container } from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/I18nContext';

const JiraIssueRedirect = () => {
    const { issueKey } = useParams();
    const navigate = useNavigate();
    const { api, ensureValidToken } = useAppContext();
    const { t } = useTranslation();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContextAndRedirect = async () => {
            if (!issueKey) {
                setError(t('common.errors.invalidIssueKey', '유효하지 않은 이슈 키입니다.'));
                setLoading(false);
                return;
            }

            try {
                await ensureValidToken();
                const response = await api.get(`/api/jira-integration/latest-execution-context?issueKey=${issueKey}`);
                
                if (response.data) {
                    const { projectId, executionId, testCaseId } = response.data;
                    
                    if (projectId && executionId) {
                        // 이슈 키를 결과 입력 폼에 전달하기 위해 state 사용
                        navigate(`/projects/${projectId}/executions/${executionId}`, { 
                            state: { 
                                autoFillJiraIssueKey: issueKey,
                                targetTestCaseId: testCaseId
                            } 
                        });
                    } else {
                        setError(t('common.errors.noAssociatedExecution', '연결된 테스트 실행 정보를 찾을 수 없습니다.'));
                    }
                } else {
                    setError(t('common.errors.noDataFound', '데이터를 찾을 수 없습니다.'));
                }
            } catch (err) {
                console.error('Redirect error:', err);
                if (err.response && err.response.status === 404) {
                    setError(t('common.errors.noExecutionForIssue', '해당 이슈와 연결된 최근 테스트 결과가 없습니다.'));
                } else {
                    setError(t('common.errors.serverError', '서버와의 통신 중 오류가 발생했습니다.'));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchContextAndRedirect();
    }, [issueKey, api, ensureValidToken, navigate, t]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="h6">
                    {t('common.redirecting.jira', 'JIRA 이슈와 연결된 테스트 화면으로 이동 중입니다...')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {issueKey}
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10 }}>
                <Alert 
                    severity="warning" 
                    variant="outlined"
                    action={
                        <Button color="inherit" size="small" onClick={() => navigate('/projects')}>
                            {t('common.backToProjects', '프로젝트 목록으로 이동')}
                        </Button>
                    }
                >
                    <Typography variant="subtitle1" fontWeight="bold">
                        {t('common.redirecting.failed', '리다이렉션 실패')}
                    </Typography>
                    <Typography variant="body2">
                        {error}
                    </Typography>
                </Alert>
            </Container>
        );
    }

    return null;
};

export default JiraIssueRedirect;
