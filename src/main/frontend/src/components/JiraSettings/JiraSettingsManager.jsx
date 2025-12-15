// src/components/JiraSettings/JiraSettingsManager.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Typography,
    Button,
    Alert,
    Chip,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    CircularProgress,
    Tooltip,
    Divider,
    LinearProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Settings as SettingsIcon,
    Link as LinkIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { green, red, orange, grey } from '@mui/material/colors';
import JiraConfigDialog from './JiraConfigDialog';
import { jiraService } from '../../services/jiraService';

const JiraSettingsManager = () => {
    const [configs, setConfigs] = useState([]);
    const [activeConfig, setActiveConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadConfigs();
        loadConnectionStatus();
    }, []);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const [activeConfigData, allConfigsData] = await Promise.all([
                jiraService.getActiveConfig(),
                jiraService.getAllConfigs()
            ]);

            setActiveConfig(activeConfigData);
            // allConfigsData가 배열인지 확인하고, 아니면 빈 배열로 설정
            setConfigs(Array.isArray(allConfigsData) ? allConfigsData : []);
            setError(null);
        } catch (error) {
            console.error('JIRA 설정 로드 실패:', error);
            setError('JIRA 설정을 불러오는데 실패했습니다.');
            // 에러 발생 시에도 빈 배열로 설정
            setConfigs([]);
        } finally {
            setLoading(false);
        }
    };

    const loadConnectionStatus = async () => {
        try {
            const status = await jiraService.getConnectionStatus();
            setConnectionStatus(status);
        } catch (error) {
            console.error('❌ 연결 상태 조회 실패:', error);
        }
    };

    const handleAddConfig = () => {
        setEditingConfig(null);
        setDialogOpen(true);
    };

    const handleEditConfig = (config) => {
        setEditingConfig(config);
        setDialogOpen(true);
    };

    const handleSaveConfig = async (configData) => {
        try {
            await jiraService.saveConfig(configData);

            // 병렬로 설정과 연결 상태 다시 로드
            const [configsResult, statusResult] = await Promise.allSettled([
                loadConfigs(),
                loadConnectionStatus()
            ]);

            // 오류가 있으면 로그 출력하지만 중단하지 않음
            if (configsResult.status === 'rejected') {
                console.warn('⚠️ 설정 로드 실패:', configsResult.reason);
            }
            if (statusResult.status === 'rejected') {
                console.warn('⚠️ 연결 상태 로드 실패:', statusResult.reason);
            }

            setDialogOpen(false);
            setEditingConfig(null);
        } catch (error) {
            console.error('❌ JIRA 설정 저장 실패:', error);
            throw error; // 다이얼로그에서 에러 처리
        }
    };

    const handleDeleteConfig = async (configId) => {
        if (!window.confirm('이 JIRA 설정을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await jiraService.deleteConfig(configId);

            // 병렬로 설정과 연결 상태 다시 로드
            const [configsResult, statusResult] = await Promise.allSettled([
                loadConfigs(),
                loadConnectionStatus()
            ]);

            // 오류가 있으면 로그 출력하지만 중단하지 않음
            if (configsResult.status === 'rejected') {
                console.warn('⚠️ 설정 로드 실패:', configsResult.reason);
                setError('설정 목록 새로고침에 실패했습니다.');
            }
            if (statusResult.status === 'rejected') {
                console.warn('⚠️ 연결 상태 로드 실패:', statusResult.reason);
            }

        } catch (error) {
            console.error('JIRA 설정 삭제 실패:', error);
            setError('설정 삭제에 실패했습니다.');
        }
    };

    const handleRefreshConnection = async () => {
        if (!activeConfig) return;

        setRefreshing(true);
        try {
            const testConfig = {
                serverUrl: activeConfig.serverUrl,
                username: activeConfig.username,
                // API 토큰은 백엔드에 저장된 것을 사용 (프론트엔드에서는 빈 값)
                apiToken: ''
            };

            // 연결 테스트 수행
            const testResult = await jiraService.testConnection(testConfig);

            // 연결 상태 다시 로드 (DB에서 최신 상태 가져오기)
            const statusResult = await loadConnectionStatus();

        } catch (error) {
            console.error('❌ 연결 상태 갱신 실패:', error);
            setError('연결 상태 새로고침에 실패했습니다.');
        } finally {
            setRefreshing(false);
        }
    };

    const getConnectionStatusIcon = () => {
        if (!connectionStatus || !connectionStatus.hasConfig) {
            return <WarningIcon sx={{ color: grey[500] }} />;
        }

        if (connectionStatus.isConnected) {
            return <CheckCircleIcon sx={{ color: green[500] }} />;
        }

        return <ErrorIcon sx={{ color: red[500] }} />;
    };

    const getConnectionStatusColor = () => {
        if (!connectionStatus || !connectionStatus.hasConfig) return 'warning';
        return connectionStatus.isConnected ? 'success' : 'error';
    };

    const getConnectionStatusText = () => {
        if (!connectionStatus) return '상태 확인 중...';
        if (!connectionStatus.hasConfig) return 'JIRA 설정이 없습니다';
        if (connectionStatus.isConnected) return '연결됨';
        return '연결 실패';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '없음';
        return new Date(dateString).toLocaleString('ko-KR');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* 헤더 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon />
                    JIRA 설정 관리
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddConfig}
                    sx={{ minWidth: 120 }}
                >
                    새 설정 추가
                </Button>
            </Box>
            {/* 에러 메시지 */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            {/* 현재 연결 상태 카드 */}
            <Card sx={{ mb: 3 }}>
                <CardHeader
                    avatar={getConnectionStatusIcon()}
                    title="현재 JIRA 연결 상태"
                    action={
                        <Tooltip title="연결 상태 새로고침">
                            <span>
                                <IconButton
                                    onClick={handleRefreshConnection}
                                    disabled={refreshing || !connectionStatus?.hasConfig}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    }
                />
                <CardContent sx={{ pt: 0 }}>
                    {refreshing && <LinearProgress sx={{ mb: 2 }} />}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Chip
                            label={getConnectionStatusText()}
                            color={getConnectionStatusColor()}
                            variant="outlined"
                            size="small"
                        />

                        {connectionStatus?.lastTested && (
                            <Typography variant="caption" color="text.secondary">
                                마지막 확인: {formatDate(connectionStatus.lastTested)}
                            </Typography>
                        )}
                    </Box>

                    {activeConfig && (
                        <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                <strong>서버:</strong> {activeConfig.serverUrl}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>사용자:</strong> {activeConfig.username}
                            </Typography>

                            {connectionStatus?.lastError && (
                                <Alert severity="error" sx={{ mt: 2 }} variant="outlined">
                                    <Typography variant="body2">
                                        {connectionStatus.lastError}
                                    </Typography>
                                </Alert>
                            )}
                        </Box>
                    )}

                    {!activeConfig && (
                        <Alert severity="info" variant="outlined">
                            JIRA 설정을 추가하여 테스트 결과를 자동으로 JIRA에 연동할 수 있습니다.
                        </Alert>
                    )}
                </CardContent>
            </Card>
            {/* 설정 목록 */}
            <Card>
                <CardHeader
                    title={`JIRA 설정 목록 (${configs.length}개)`}
                    subheader="모든 JIRA 설정을 관리할 수 있습니다"
                />
                <CardContent sx={{ pt: 0 }}>
                    {configs.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <SettingsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                등록된 JIRA 설정이 없습니다
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{
                                marginBottom: "16px"
                            }}>
                                JIRA 설정을 추가하여 테스트 결과를 자동으로 연동해보세요.
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddConfig}
                            >
                                첫 번째 설정 추가
                            </Button>
                        </Box>
                    ) : (
                        <List>
                            {configs.map((config, index) => (
                                <React.Fragment key={config.id}>
                                    <ListItem
                                        sx={{
                                            border: config.isActive ? `2px solid ${green[500]}` : '1px solid transparent',
                                            borderRadius: 1,
                                            mb: 1,
                                            bgcolor: config.isActive ? green[50] : 'transparent'
                                        }}
                                    >
                                        <ListItemIcon>
                                            <LinkIcon color={config.isActive ? 'success' : 'disabled'} />
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="subtitle1">
                                                        {config.serverUrl}
                                                    </Typography>
                                                    {config.isActive && (
                                                        <Chip
                                                            label="활성"
                                                            size="small"
                                                            color="success"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary">
                                                        사용자: {config.username}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        생성일: {formatDate(config.createdAt)}
                                                        {config.lastConnectionTest && (
                                                            <span style={{ marginLeft: 8 }}>
                                                                | 마지막 테스트: {formatDate(config.lastConnectionTest)}
                                                            </span>
                                                        )}
                                                    </Typography>

                                                    {/* 연결 상태 표시 */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                        {config.connectionVerified ? (
                                                            <Chip
                                                                icon={<CheckCircleIcon />}
                                                                label="연결 확인됨"
                                                                size="small"
                                                                color="success"
                                                                variant="outlined"
                                                            />
                                                        ) : (
                                                            <Chip
                                                                icon={<ErrorIcon />}
                                                                label="연결 실패"
                                                                size="small"
                                                                color="error"
                                                                variant="outlined"
                                                            />
                                                        )}

                                                        {config.lastConnectionError && (
                                                            <Tooltip title={config.lastConnectionError} arrow>
                                                                <WarningIcon
                                                                    sx={{ fontSize: 16, color: orange[500] }}
                                                                />
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                </Box>
                                            }
                                        />

                                        <ListItemSecondaryAction>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Tooltip title="설정 수정">
                                                    <IconButton
                                                        onClick={() => handleEditConfig(config)}
                                                        size="small"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="설정 삭제">
                                                    <IconButton
                                                        onClick={() => handleDeleteConfig(config.id)}
                                                        size="small"
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </ListItemSecondaryAction>
                                    </ListItem>

                                    {index < configs.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </CardContent>
            </Card>
            {/* JIRA 설정 다이얼로그 */}
            <JiraConfigDialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setEditingConfig(null);
                }}
                onSave={handleSaveConfig}
                existingConfig={editingConfig}
            />
        </Box>
    );
};

export default JiraSettingsManager;