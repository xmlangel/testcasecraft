// src/components/JUnit/TestCaseDetailPanel.jsx

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Tabs,
    Tab,
    Alert,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    CheckCircle as PassIcon,
    Cancel as FailIcon,
    Warning as ErrorIcon,
    SkipNext as SkipIcon,
    BugReport as BugIcon,
    Speed as SpeedIcon,
    Fullscreen as FullscreenIcon,
    FullscreenExit as FullscreenExitIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { useI18n } from '../../context/I18nContext';

/**
 * ICT-337: 테스트 케이스 상세 패널 컴포넌트
 * tracelog와 testbody를 탭 형태로 표시
 */
const TestCaseDetailPanel = ({
    testCaseId,
    onClose,
    onEditTestCase,
    onNavigatePrev,
    onNavigateNext,
    hasPrev = false,
    hasNext = false
}) => {
    const { api } = useAppContext();
    const { t } = useI18n();

    const [loading, setLoading] = useState(false);
    const [testCaseDetails, setTestCaseDetails] = useState(null);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [fullscreenOpen, setFullscreenOpen] = useState(false);

    // 상태별 설정
    const statusConfig = {
        PASSED: {
            color: 'success',
            icon: <PassIcon />,
            label: t('junit.stats.passed'),
            bgColor: '#e8f5e8'
        },
        FAILED: {
            color: 'error',
            icon: <FailIcon />,
            label: t('junit.stats.failed'),
            bgColor: '#ffebee'
        },
        ERROR: {
            color: 'warning',
            icon: <ErrorIcon />,
            label: t('junit.stats.error'),
            bgColor: '#fff3e0'
        },
        SKIPPED: {
            color: 'default',
            icon: <SkipIcon />,
            label: t('junit.stats.skipped'),
            bgColor: '#f5f5f5'
        }
    };

    // 테스트 케이스 상세 정보 로드
    const loadTestCaseDetails = async () => {
        if (!testCaseId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api(`/api/junit-results/testcases/${testCaseId}/details`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setTestCaseDetails(data.testCase);
            } else {
                setError(data.error || t('junit.testcase.noDetailInfo'));
            }

        } catch (err) {
            console.error('테스트 케이스 상세 정보 로드 실패:', err);
            setError(t('junit.testcase.noDetailInfo'));
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        if (testCaseId) {
            loadTestCaseDetails();
        }
    }, [testCaseId]);

    // 탭 변경 핸들러
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // 전체화면 핸들러
    const handleFullscreenToggle = () => {
        setFullscreenOpen(!fullscreenOpen);
    };

    // 실행 시간 포맷
    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
        if (seconds < 60) return `${seconds.toFixed(2)}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = (seconds % 60).toFixed(2);
        return `${minutes}m ${remainingSeconds}s`;
    };

    // 탭 패널 컴포넌트
    const TabPanel = ({ children, value, index, ...other }) => (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`testcase-tabpanel-${index}`}
            aria-labelledby={`testcase-tab-${index}`}
            style={{ height: value === index ? '100%' : 'auto', display: 'flex', flexDirection: 'column' }}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 2, flex: 1, overflow: 'hidden' }}>
                    {children}
                </Box>
            )}
        </div>
    );

    if (!testCaseId) {
        return (
            <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    {t('junit.testcase.selectCase')}
                </Typography>
            </Paper>
        );
    }

    if (loading) {
        return (
            <Paper sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                    {t('junit.testcase.loadingDetail')}
                </Typography>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{t('junit.testcase.errorOccurred')}</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Alert severity="error">
                    {error}
                </Alert>
            </Paper>
        );
    }

    if (!testCaseDetails) {
        return (
            <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{t('junit.testcase.noData')}</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Alert severity="warning">
                    {t('junit.testcase.noDetailInfo')}
                </Alert>
            </Paper>
        );
    }

    const statusInfo = statusConfig[testCaseDetails.status] || statusConfig.PASSED;

    return (
        <Paper sx={{
            height: '100vh',
            maxHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* 헤더 */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ mb: 1, wordBreak: 'break-word' }}>
                            {testCaseDetails.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {testCaseDetails.className}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip
                                icon={statusInfo.icon}
                                label={statusInfo.label}
                                size="small"
                                sx={{ bgcolor: statusInfo.bgColor }}
                            />
                            <Chip
                                icon={<SpeedIcon />}
                                label={formatDuration(testCaseDetails.time)}
                                size="small"
                                variant="outlined"
                            />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {/* 네비게이션 버튼 */}
                        <Tooltip title={t('junit.testcase.previous')}>
                            <span>
                                <IconButton
                                    onClick={onNavigatePrev}
                                    size="small"
                                    disabled={!hasPrev}
                                    color="primary"
                                    sx={{
                                        '&:hover': {
                                            bgcolor: 'primary.light',
                                            color: 'white'
                                        }
                                    }}
                                >
                                    <NavigateBeforeIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title={t('junit.testcase.next')}>
                            <span>
                                <IconButton
                                    onClick={onNavigateNext}
                                    size="small"
                                    disabled={!hasNext}
                                    color="primary"
                                    sx={{
                                        '&:hover': {
                                            bgcolor: 'primary.light',
                                            color: 'white'
                                        }
                                    }}
                                >
                                    <NavigateNextIcon />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                        {/* Test Body 탭이 활성화되면 전체화면 버튼 표시 */}
                        {tabValue === 1 && (
                            <Tooltip title={t('junit.testbody.fullscreen')}>
                                <IconButton
                                    onClick={handleFullscreenToggle}
                                    size="small"
                                    color="primary"
                                    sx={{
                                        '&:hover': {
                                            bgcolor: 'primary.light',
                                            color: 'white'
                                        }
                                    }}
                                >
                                    <FullscreenIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        {onEditTestCase && (
                            <Tooltip title={t('junit.testcase.edit')}>
                                <IconButton
                                    onClick={() => onEditTestCase(testCaseDetails)}
                                    size="small"
                                    color="primary"
                                    sx={{
                                        '&:hover': {
                                            bgcolor: 'primary.light',
                                            color: 'white'
                                        }
                                    }}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <Tooltip title={t('junit.testcase.close')}>
                            <IconButton onClick={onClose} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* 탭 네비게이션 */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
                    <Tab
                        label="Tracelog"
                        icon={<BugIcon />}
                        iconPosition="start"
                        sx={{ minHeight: '48px' }}
                    />
                    <Tab
                        label="Test Body"
                        icon={<SpeedIcon />}
                        iconPosition="start"
                        sx={{ minHeight: '48px' }}
                    />
                </Tabs>
            </Box>

            {/* 탭 컨텐츠 */}
            <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                {/* Tracelog 탭 */}
                <TabPanel value={tabValue} index={0}>
                    <Box sx={{ height: '100%', overflow: 'auto' }}>
                        {/* 실패 메시지 */}
                        {testCaseDetails.tracelog.failureMessage && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                                        Failure Message
                                        {testCaseDetails.tracelog.failureType && (
                                            <Chip
                                                label={testCaseDetails.tracelog.failureType}
                                                size="small"
                                                sx={{ ml: 1 }}
                                            />
                                        )}
                                    </Typography>
                                    <Box
                                        component="pre"
                                        sx={{
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            bgcolor: '#ffebee',
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid #ffcdd2'
                                        }}
                                    >
                                        {testCaseDetails.tracelog.failureMessage}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* 스택 트레이스 */}
                        {testCaseDetails.tracelog.stackTrace && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                                        Stack Trace
                                    </Typography>
                                    <Box
                                        component="pre"
                                        sx={{
                                            fontSize: '0.75rem',
                                            fontFamily: 'monospace',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            bgcolor: '#fafafa',
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0',
                                            maxHeight: '400px',
                                            overflow: 'auto'
                                        }}
                                    >
                                        {testCaseDetails.tracelog.stackTrace}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* 스킵 메시지 */}
                        {testCaseDetails.tracelog.skipMessage && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                        Skip Message
                                    </Typography>
                                    <Box
                                        component="pre"
                                        sx={{
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            bgcolor: '#f5f5f5',
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid #e0e0e0'
                                        }}
                                    >
                                        {testCaseDetails.tracelog.skipMessage}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* 내용이 없는 경우 */}
                        {!testCaseDetails.tracelog.failureMessage &&
                            !testCaseDetails.tracelog.stackTrace &&
                            !testCaseDetails.tracelog.skipMessage && (
                                <Alert severity="info">
                                    {t('junit.tracelog.noErrorLog')}
                                </Alert>
                            )}
                    </Box>
                </TabPanel>

                {/* Test Body 탭 */}
                <TabPanel value={tabValue} index={1}>
                    <Box sx={{ height: '100%', overflow: 'auto' }}>
                        {/* System Out */}
                        {testCaseDetails.testbody.systemOut && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                                        System Out
                                    </Typography>
                                    <Box
                                        component="pre"
                                        sx={{
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            bgcolor: '#e8f5e8',
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid #c8e6c9',
                                            overflow: 'auto'
                                        }}
                                    >
                                        {testCaseDetails.testbody.systemOut}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* System Err */}
                        {testCaseDetails.testbody.systemErr && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                                        System Error
                                    </Typography>
                                    <Box
                                        component="pre"
                                        sx={{
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            bgcolor: '#ffebee',
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid #ffcdd2',
                                            overflow: 'auto'
                                        }}
                                    >
                                        {testCaseDetails.testbody.systemErr}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* 내용이 없는 경우 */}
                        {!testCaseDetails.testbody.systemOut && !testCaseDetails.testbody.systemErr && (
                            <Alert severity="info">
                                {t('junit.testbody.noOutput')}
                            </Alert>
                        )}
                    </Box>
                </TabPanel>
            </Box>

            {/* 전체화면 다이얼로그 */}
            <Dialog
                open={fullscreenOpen}
                onClose={handleFullscreenToggle}
                maxWidth={false}
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        width: '95vw',
                        height: '95vh',
                        maxWidth: 'none',
                        maxHeight: 'none'
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        {t('junit.testbody.fullscreenTitle', { testName: testCaseDetails?.name })}
                    </Typography>
                    <IconButton onClick={handleFullscreenToggle}>
                        <FullscreenExitIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                        {/* System Out */}
                        {testCaseDetails?.testbody?.systemOut && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                                        System Out
                                    </Typography>
                                    <Box
                                        component="pre"
                                        sx={{
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            bgcolor: '#e8f5e8',
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid #c8e6c9',
                                            overflow: 'auto'
                                        }}
                                    >
                                        {testCaseDetails.testbody.systemOut}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* System Err */}
                        {testCaseDetails?.testbody?.systemErr && (
                            <Card sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                                        System Error
                                    </Typography>
                                    <Box
                                        component="pre"
                                        sx={{
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            bgcolor: '#ffebee',
                                            p: 2,
                                            borderRadius: 1,
                                            border: '1px solid #ffcdd2',
                                            overflow: 'auto'
                                        }}
                                    >
                                        {testCaseDetails.testbody.systemErr}
                                    </Box>
                                </CardContent>
                            </Card>
                        )}

                        {/* 내용이 없는 경우 */}
                        {!testCaseDetails?.testbody?.systemOut && !testCaseDetails?.testbody?.systemErr && (
                            <Alert severity="info">
                                {t('junit.testbody.noOutput')}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </Paper>
    );
};

export default TestCaseDetailPanel;