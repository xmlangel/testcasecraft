import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    Box, CircularProgress, Typography, Alert, Button, Container, 
    Card, CardContent, CardActionArea, Grid, Chip, Divider, Stack 
} from '@mui/material';
import { 
    Timeline as TimelineIcon, 
    Assignment as AssignmentIcon,
    Business as BusinessIcon,
    PlayArrow as PlayArrowIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from '../../context/I18nContext';

const JiraIssueRedirect = () => {
    const { issueKey: rawIssueKey } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { api } = useAppContext();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [executions, setExecutions] = useState([]);
    const [isExchangingToken, setIsExchangingToken] = useState(() => {
        return new URLSearchParams(window.location.search).has('token');
    });

    const issueKey = rawIssueKey ? rawIssueKey.toUpperCase() : '';

    // ================================================================
    // 한시적 토큰 교환: Forge 앱이 ?token= 파라미터를 통해 접근할 때
    // 임시 토큰을 JWT 액세스 토큰으로 교환한 후
    // URL에서 토큰을 제거합니다. (1회성 토큰)
    // ================================================================
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const redirectToken = searchParams.get('token');
        if (!redirectToken) return;

        const exchangeToken = async () => {
            try {
                const res = await fetch('/api/service-api-keys/exchange-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: redirectToken }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.accessToken) {
                        // 기존 로그인 플로우와 동일한 방식으로 JWT 저장
                        localStorage.setItem('accessToken', data.accessToken);
                    }
                } else {
                    console.warn('[JiraIssueRedirect] 토큰 교환 실패:', res.status);
                }
            } catch (err) {
                console.error('[JiraIssueRedirect] 토큰 교환 오류:', err);
            } finally {
                // URL에서 token 파라미터 제거 (주소창 노출 방지)
                const cleanUrl = window.location.pathname;
                window.history.replaceState({}, '', cleanUrl);
                setIsExchangingToken(false);
            }
        };

        exchangeToken();
    }, [location.search]);


    useEffect(() => {
        if (isExchangingToken) return;

        const fetchContextAndRedirect = async () => {
            if (!issueKey) {
                setError(t('common.errors.invalidIssueKey', '유효하지 않은 이슈 키입니다.'));
                setLoading(false);
                return;
            }

            try {
                const response = await api(`/api/jira-integration/latest-execution-context?issueKey=${issueKey}`);

                if (response.status === 404) {
                    setError(t('common.errors.noExecutionForIssue', '해당 이슈와 연결된 최근 테스트 결과가 없습니다.'));
                    setLoading(false);
                    return;
                }

                if (!response.ok) {
                    setError(t('common.errors.serverError', '서버와의 통신 중 오류가 발생했습니다.'));
                    setLoading(false);
                    return;
                }

                const data = await response.json();

                if (Array.isArray(data)) {
                    if (data.length === 1) {
                        // 결과가 1개인 경우 즉시 리다이렉트
                        handleRedirect(data[0]);
                    } else if (data.length > 1) {
                        // 여러 개인 경우 목록 표시
                        setExecutions(data);
                        setLoading(false);
                    } else {
                        setError(t('common.errors.noAssociatedExecution', '연결된 테스트 실행 정보를 찾을 수 없습니다.'));
                        setLoading(false);
                    }
                } else {
                    setError(t('common.errors.noDataFound', '데이터를 찾을 수 없습니다.'));
                    setLoading(false);
                }
            } catch (err) {
                console.error('Redirect error:', err);
                setError(t('common.errors.serverError', '서버와의 통신 중 오류가 발생했습니다.'));
                setLoading(false);
            }
        };

        fetchContextAndRedirect();
    }, [issueKey, api, t, isExchangingToken]);

    const handleRedirect = (exec) => {
        const { projectId, executionId, testCaseId } = exec;
        if (testCaseId) {
            // 방안 B: 결과 입력 화면 URL로 직접 이동
            navigate(`/projects/${projectId}/executions/${executionId}/testcases/${testCaseId}/result`);
        } else {
            // testCaseId가 없으면 실행 화면으로 이동
            navigate(`/projects/${projectId}/executions/${executionId}`);
        }
    };

    const getStatusChip = (status) => {
        let color = 'default';
        let icon = <TimelineIcon />;
        
        switch (status) {
            case 'INPROGRESS':
                color = 'primary';
                icon = <PlayArrowIcon />;
                break;
            case 'COMPLETED':
                color = 'success';
                icon = <CheckCircleIcon />;
                break;
            default:
                color = 'default';
        }
        
        return <Chip size="small" icon={icon} label={status} color={color} variant="outlined" />;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {t('common.redirecting.processing', '연관 데이터 조회 중...')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {issueKey} 이슈와 연결된 테스트를 찾고 있습니다.
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="sm" sx={{ mt: 10 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <ErrorIcon color="warning" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {t('common.redirecting.failed', '연결 실패')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        {error}
                    </Typography>
                    <Button 
                        variant="contained" 
                        size="large" 
                        onClick={() => navigate('/projects')}
                        sx={{ borderRadius: 8, px: 4 }}
                    >
                        {t('common.backToProjects', '프로젝트 목록으로 이동')}
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="800" gutterBottom color="primary">
                    테스트 실행 선택
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    <strong>{issueKey}</strong> 이슈와 연관된 테스트가 {executions.length}개 발견되었습니다.<br />
                    작업을 진행할 실행 항목을 선택해 주세요.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {executions.map((exec) => (
                    <Grid item xs={12} key={exec.executionId}>
                        <Card 
                            elevation={2} 
                            sx={{ 
                                borderRadius: 4, 
                                transition: 'all 0.2s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                            }}
                        >
                            <CardActionArea onClick={() => handleRedirect(exec)} sx={{ p: 1 }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                        <Box>
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                <BusinessIcon fontSize="small" color="action" />
                                                <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                                    {exec.projectName}
                                                </Typography>
                                            </Stack>
                                            <Typography variant="h6" fontWeight="bold">
                                                {exec.executionName}
                                            </Typography>
                                        </Box>
                                        {getStatusChip(exec.status)}
                                    </Stack>
                                    
                                    <Divider sx={{ my: 1.5, opacity: 0.6 }} />
                                    
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={2}>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Case:</strong> {exec.testCaseId}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Date:</strong> {exec.startDate ? new Date(exec.startDate).toLocaleDateString() : 'N/A'}
                                            </Typography>
                                        </Stack>
                                        <Button size="small" variant="text" endIcon={<PlayArrowIcon />}>
                                            바로가기
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default JiraIssueRedirect;
