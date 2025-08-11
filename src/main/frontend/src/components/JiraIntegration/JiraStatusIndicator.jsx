// src/components/JiraIntegration/JiraStatusIndicator.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Chip,
    Tooltip,
    IconButton,
    Typography,
    Popover,
    Card,
    CardContent,
    Button,
    Alert,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Settings as SettingsIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon,
    Link as LinkIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { green, red, orange, grey } from '@mui/material/colors';
import { jiraService } from '../../services/jiraService';

const JiraStatusIndicator = ({ 
    compact = false, 
    showDetails = true, 
    onConfigureClick = null,
    autoRefresh = false,
    refreshInterval = 30000 // 30초
}) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [lastRefresh, setLastRefresh] = useState(null);

    useEffect(() => {
        loadStatus();

        // 자동 새로고침 설정
        let interval;
        if (autoRefresh && refreshInterval > 0) {
            interval = setInterval(() => {
                loadStatus(true); // silent refresh
            }, refreshInterval);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [autoRefresh, refreshInterval]);

    const loadStatus = async (silent = false) => {
        if (!silent) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const connectionStatus = await jiraService.getConnectionStatus();
            setStatus(connectionStatus);
            setLastRefresh(new Date());
        } catch (error) {
            console.error('JIRA 상태 조회 실패:', error);
            setStatus({ hasConfig: false, isConnected: false, error: error.message });
        } finally {
            if (!silent) {
                setLoading(false);
            } else {
                setRefreshing(false);
            }
        }
    };

    const handleRefresh = async () => {
        await loadStatus();
    };

    const handleStatusClick = (event) => {
        if (showDetails) {
            setAnchorEl(event.currentTarget);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const getStatusIcon = () => {
        if (loading || !status) {
            return <CircularProgress size={16} />;
        }

        if (!status.hasConfig) {
            return <WarningIcon sx={{ color: grey[500] }} />;
        }

        if (status.isConnected) {
            return <CheckCircleIcon sx={{ color: green[500] }} />;
        }

        return <ErrorIcon sx={{ color: red[500] }} />;
    };

    const getStatusColor = () => {
        if (loading || !status) return 'default';
        if (!status.hasConfig) return 'warning';
        return status.isConnected ? 'success' : 'error';
    };

    const getStatusText = () => {
        if (loading) return ' 확인 중...';
        if (!status) return '알 수 없음';
        if (!status.hasConfig) return 'JIRA 미설정';
        if (status.isConnected) return '연결됨';
        return '연결 실패';
    };

    const getDetailedStatusText = () => {
        if (!status) return '상태를 확인할 수 없습니다.';
        
        if (!status.hasConfig) {
            return 'JIRA 설정이 없습니다. 설정 페이지에서 JIRA 서버 정보를 등록해주세요.';
        }
        
        if (status.isConnected) {
            return `JIRA 서버와 정상적으로 연결되었습니다. (${status.serverUrl})`;
        }
        
        return `JIRA 서버 연결에 실패했습니다. ${status.lastError || ''}`;
    };

    const formatDate = (date) => {
        if (!date) return '없음';
        return new Date(date).toLocaleString('ko-KR');
    };

    if (compact) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={getDetailedStatusText()}>
                    <Chip
                        icon={getStatusIcon()}
                        label="JIRA"
                        size="small"
                        color={getStatusColor()}
                        variant="outlined"
                        onClick={showDetails ? handleStatusClick : undefined}
                        sx={{ cursor: showDetails ? 'pointer' : 'default' }}
                    />
                </Tooltip>
                
                {refreshing && (
                    <CircularProgress size={12} />
                )}
                
                {/* 상세 정보 팝오버 */}
                <Popover
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                    PaperProps={{
                        sx: {
                            '@media (max-width: 600px)': {
                                margin: '8px',
                                width: 'calc(100vw - 32px)',
                                maxWidth: 'calc(100vw - 32px)'
                            }
                        }
                    }}
                >
                    <Card sx={{ 
                        minWidth: 300, 
                        maxWidth: 400,
                        '@media (max-width: 600px)': {
                            minWidth: 'auto',
                            maxWidth: 'none'
                        }
                    }}>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                                JIRA 연결 상태
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                {getStatusIcon()}
                                <Typography variant="body2">
                                    {getStatusText()}
                                </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" paragraph>
                                {getDetailedStatusText()}
                            </Typography>
                            
                            {status && status.hasConfig && (
                                <>
                                    <Divider sx={{ my: 2 }} />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            <strong>서버:</strong> {status.serverUrl}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            <strong>사용자:</strong> {status.username}
                                        </Typography>
                                        {status.lastTested && (
                                            <Typography variant="caption" color="text.secondary">
                                                <strong>마지막 확인:</strong> {formatDate(status.lastTested)}
                                            </Typography>
                                        )}
                                        {lastRefresh && (
                                            <Typography variant="caption" color="text.secondary">
                                                <strong>업데이트:</strong> {formatDate(lastRefresh)}
                                            </Typography>
                                        )}
                                    </Box>
                                </>
                            )}
                            
                            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                <Button
                                    size="small"
                                    onClick={handleRefresh}
                                    disabled={loading || refreshing}
                                    startIcon={<RefreshIcon />}
                                >
                                    새로고침
                                </Button>
                                
                                {onConfigureClick && (
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => {
                                            onConfigureClick();
                                            handleClose();
                                        }}
                                        startIcon={<SettingsIcon />}
                                    >
                                        설정
                                    </Button>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Popover>
            </Box>
        );
    }

    // 전체 모드
    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getStatusIcon()}
                    <Typography variant="h6">
                        JIRA 연결 상태
                    </Typography>
                </Box>
                
                <Chip
                    label={getStatusText()}
                    color={getStatusColor()}
                    variant="outlined"
                />
                
                <Box sx={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
                    <Tooltip title="상태 새로고침">
                        <IconButton
                            onClick={handleRefresh}
                            disabled={loading || refreshing}
                            size="small"
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    
                    {onConfigureClick && (
                        <Tooltip title="JIRA 설정">
                            <IconButton
                                onClick={onConfigureClick}
                                size="small"
                            >
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Box>

            <Alert 
                severity={getStatusColor()} 
                icon={getStatusIcon()}
                sx={{ mb: 2 }}
            >
                <Typography variant="body2">
                    {getDetailedStatusText()}
                </Typography>
                
                {status && status.lastError && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                        오류: {status.lastError}
                    </Typography>
                )}
            </Alert>

            {status && status.hasConfig && (
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        연결 정보
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            <LinkIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                            <strong>서버:</strong> {status.serverUrl}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <strong>사용자:</strong> {status.username}
                        </Typography>
                        {status.lastTested && (
                            <Typography variant="body2" color="text.secondary">
                                <AccessTimeIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                <strong>마지막 테스트:</strong> {formatDate(status.lastTested)}
                            </Typography>
                        )}
                        {lastRefresh && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>마지막 업데이트:</strong> {formatDate(lastRefresh)}
                            </Typography>
                        )}
                    </Box>
                </Box>
            )}

            {!status?.hasConfig && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        JIRA와 연동하려면 먼저 설정을 완료해주세요.
                    </Typography>
                    {onConfigureClick && (
                        <Button
                            size="small"
                            onClick={onConfigureClick}
                            sx={{ mt: 1 }}
                            variant="outlined"
                            startIcon={<SettingsIcon />}
                        >
                            JIRA 설정하기
                        </Button>
                    )}
                </Alert>
            )}
        </Box>
    );
};

export default JiraStatusIndicator;