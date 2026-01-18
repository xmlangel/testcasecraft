// src/components/JiraSettings/JiraConfigDialog.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Alert,
    Typography,
    CircularProgress,
    IconButton,
    InputAdornment,
    FormControlLabel,
    Switch,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider
} from '@mui/material';
import {
    Close as CloseIcon,
    Visibility,
    VisibilityOff,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Refresh as RefreshIcon,
    Link as LinkIcon
} from '@mui/icons-material';
import { jiraService } from '../../services/jiraService';
import { useI18n } from '../../context/I18nContext';

const JiraConfigDialog = ({ open, onClose, onSave, existingConfig = null }) => {
    const { t } = useI18n();

    // API 응답 메시지를 번역 키로 변환하는 헬퍼 함수
    const getApiMessageTranslation = (message) => {
        if (!message) return '';

        if (message.includes('연결 성공') || message.toLowerCase().includes('success')) {
            return t('jira.api.connectionSuccess', 'JIRA 연결 성공');
        } else if (message.includes('인증 실패') || message.includes('권한')) {
            return t('jira.api.authFailure', '인증 실패 또는 권한 부족');
        } else if (message.includes('서버 오류')) {
            return t('jira.api.serverError', 'JIRA 서버 오류');
        } else if (message.includes('네트워크') || message.includes('연결 실패')) {
            return t('jira.api.networkError', '네트워크 연결 실패');
        } else if (message.includes('테스트 실패')) {
            return t('jira.api.testFailure', '연결 테스트 실패');
        } else {
            return t('jira.api.unknownError', message); // fallback to original message
        }
    };

    const [formData, setFormData] = useState({
        serverUrl: '',
        username: '',
        apiToken: '',
        testProjectKey: ''
    });
    
    const [showApiToken, setShowApiToken] = useState(false);
    const [loading, setLoading] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [projects, setProjects] = useState([]);
    const [errors, setErrors] = useState({});
    const [autoTest, setAutoTest] = useState(true);

    useEffect(() => {
        if (existingConfig) {
            setFormData({
                serverUrl: existingConfig.serverUrl || '',
                username: existingConfig.username || '',
                apiToken: '', // 보안상 기존 토큰은 표시하지 않음
                testProjectKey: ''
            });
        } else {
            resetForm();
        }
        setConnectionStatus(null);
        setErrors({});
    }, [open, existingConfig]);

    const resetForm = () => {
        setFormData({
            serverUrl: '',
            username: '',
            apiToken: '',
            testProjectKey: ''
        });
    };

    const handleInputChange = (field) => (event) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // 에러 제거
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.serverUrl.trim()) {
            newErrors.serverUrl = t('jira.config.error.serverUrlRequired', 'JIRA 서버 URL을 입력하세요');
        } else if (!isValidUrl(formData.serverUrl)) {
            newErrors.serverUrl = t('jira.config.error.invalidUrl', '올바른 URL 형식을 입력하세요');
        }

        if (!formData.username.trim()) {
            newErrors.username = t('jira.config.error.usernameRequired', '사용자명을 입력하세요');
        }

        if (!formData.apiToken.trim()) {
            newErrors.apiToken = t('jira.config.error.apiTokenRequired', 'API 토큰을 입력하세요');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (string) => {
        try {
            new URL(string.startsWith('http') ? string : `https://${string}`);
            return true;
        } catch (_) {
            return false;
        }
    };

    const handleTestConnection = async () => {
        if (!validateForm()) return;

        setTestingConnection(true);
        setConnectionStatus(null);
        
        try {
            const testConfig = {
                serverUrl: formData.serverUrl,
                username: formData.username,
                apiToken: formData.apiToken,
                testProjectKey: formData.testProjectKey || null
            };
            
            const result = await jiraService.testConnection(testConfig);
            
            // null 체크 추가
            if (!result) {
                setConnectionStatus({
                    isConnected: false,
                    status: 'ERROR',
                    message: t('jira.config.error.connectionTestFailed', '연결 테스트 응답이 없습니다. 서버 상태를 확인해주세요.')
                });
                return;
            }
            
            setConnectionStatus(result);
            
            if (result.isConnected) {
                // 연결 성공 시 프로젝트 목록 조회 (나중에 구현)
                await loadProjects();
            }
            
        } catch (error) {
            console.error('연결 테스트 실패:', error);
            setConnectionStatus({
                isConnected: false,
                status: 'ERROR',
                message: `${t('jira.config.error.testError', '연결 테스트 중 오류가 발생했습니다')}: ${error.message}`
            });
        } finally {
            setTestingConnection(false);
        }
    };

    const loadProjects = async () => {
        try {
            const projectList = await jiraService.getProjects();
            setProjects(projectList || []);
        } catch (error) {
            console.error('프로젝트 목록 로드 실패:', error);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        // 자동 테스트가 활성화되어 있고 아직 테스트하지 않은 경우
        if (autoTest && !connectionStatus) {
            await handleTestConnection();
            return;
        }

        // 연결 테스트에 실패한 경우 경고
        if (connectionStatus && !connectionStatus.isConnected) {
            if (!window.confirm(t('jira.config.confirm.saveWithoutTest', 'JIRA 연결에 실패했습니다. 그래도 저장하시겠습니까?'))) {
                return;
            }
        }

        setLoading(true);
        setErrors({}); // 기존 에러 초기화
        
        try {
            const configData = {
                serverUrl: formData.serverUrl.trim(),
                username: formData.username.trim(),
                apiToken: formData.apiToken.trim(),
                testProjectKey: formData.testProjectKey.trim() || null
            };
            
            const result = await onSave(configData);
            
        } catch (error) {
            console.error('❌ JIRA 설정 저장 실패:', error);

            // 백엔드 응답의 상세 정보 확인
            let errorMessage = t('jira.config.error.general', '설정 저장 중 오류가 발생했습니다.');
            let errorDetail = '';
            let solution = '';
            
            // 백엔드에서 온 구조화된 오류 응답 처리
            if (error.response?.data) {
                const errorData = error.response.data;
                
                if (errorData.code === 'ENCRYPTION_KEY_NOT_SET') {
                    errorMessage = '🔐 JIRA 암호화 설정 오류';
                    errorDetail = errorData.detail || '서버에서 JIRA 암호화 키가 설정되지 않았습니다.';
                    solution = '관리자에게 JIRA_ENCRYPTION_KEY 환경변수 설정을 요청하세요.';
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                    errorDetail = errorData.detail || '';
                    solution = errorData.solution || '';
                }
            } else if (error.message) {
                // 일반적인 에러 메시지 처리
                if (error.message.includes('암호화') || error.message.includes('encryption')) {
                    errorMessage = '🔐 암호화 키 설정 문제';
                    errorDetail = '서버에서 JIRA 암호화 키가 올바르게 설정되지 않았습니다.';
                    solution = '관리자에게 문의하여 JIRA_ENCRYPTION_KEY 환경변수를 설정하도록 요청하세요.';
                } else if (error.message.includes('401')) {
                    errorMessage = '🔑 인증 만료';
                    errorDetail = '로그인 세션이 만료되었습니다.';
                    solution = '다시 로그인해주세요.';
                } else if (error.message.includes('400')) {
                    errorMessage = '📝 입력 데이터 오류';
                    errorDetail = '입력한 정보에 문제가 있습니다.';
                    solution = '모든 필드를 올바르게 입력했는지 확인해주세요.';
                } else if (error.message.includes('500')) {
                    errorMessage = '🚨 서버 오류';
                    errorDetail = '서버에서 오류가 발생했습니다.';
                    solution = '잠시 후 다시 시도하거나 관리자에게 문의하세요.';
                } else {
                    errorMessage = `저장 실패: ${error.message}`;
                }
            }
            
            // 복합 에러 메시지 구성
            let fullErrorMessage = errorMessage;
            if (errorDetail) {
                fullErrorMessage += `\n\n📋 상세 정보: ${errorDetail}`;
            }
            if (solution) {
                fullErrorMessage += `\n\n💡 해결 방법: ${solution}`;
            }
            
            setErrors({ general: fullErrorMessage });
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = () => {
        if (!connectionStatus) return null;
        
        switch (connectionStatus.status) {
            case 'SUCCESS':
                return <CheckCircleIcon color="success" />;
            case 'ERROR':
            case '실패':
                return <ErrorIcon color="error" />;
            default:
                return <WarningIcon color="warning" />;
        }
    };

    const getStatusColor = () => {
        if (!connectionStatus) return 'info';
        return connectionStatus.isConnected ? 'success' : 'error';
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
            slotProps={{
                paper: {
                    sx: { 
                        minHeight: '500px',
                        '@media (max-width: 600px)': {
                            margin: '16px',
                            width: 'calc(100% - 32px)'
                        }
                    }
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                    {existingConfig ? t('jira.config.dialogTitle.edit', 'JIRA 설정 수정') : t('jira.config.dialogTitle.add', 'JIRA 설정 추가')}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {errors.general && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <Box sx={{ whiteSpace: 'pre-line' }}>
                                {errors.general}
                            </Box>
                        </Alert>
                    )}
                    
                    {/* 서버 URL */}
                    <TextField
                        label={t('jira.config.serverUrl', 'JIRA 서버 URL')}
                        value={formData.serverUrl}
                        onChange={handleInputChange('serverUrl')}
                        placeholder={t('jira.config.serverUrlPlaceholder', 'https://your-domain.atlassian.net')}
                        error={!!errors.serverUrl}
                        helperText={errors.serverUrl || t('jira.config.serverUrlHelper', 'JIRA 서버 URL을 입력하세요 (예: https://company.atlassian.net)')}
                        fullWidth
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LinkIcon />
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                    
                    {/* 사용자명 */}
                    <TextField
                        label={t('jira.config.username', '사용자명 (이메일)')}
                        value={formData.username}
                        onChange={handleInputChange('username')}
                        placeholder={t('jira.config.usernamePlaceholder', 'user@company.com')}
                        error={!!errors.username}
                        helperText={errors.username || t('jira.config.usernameHelper', 'JIRA 로그인에 사용하는 이메일 주소')}
                        fullWidth
                    />
                    
                    {/* API 토큰 */}
                    <TextField
                        label={t('jira.config.apiToken', 'API 토큰')}
                        type={showApiToken ? 'text' : 'password'}
                        value={formData.apiToken}
                        onChange={handleInputChange('apiToken')}
                        error={!!errors.apiToken}
                        helperText={errors.apiToken || t('jira.config.apiTokenHelper', 'JIRA API 토큰을 입력하세요')}
                        fullWidth
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowApiToken(!showApiToken)}
                                            edge="end"
                                        >
                                            {showApiToken ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                    
                    {/* 테스트 프로젝트 키 (선택사항) */}
                    <TextField
                        label={t('jira.config.testProjectKey', '테스트 프로젝트 키 (선택사항)')}
                        value={formData.testProjectKey}
                        onChange={handleInputChange('testProjectKey')}
                        placeholder={t('jira.config.testProjectKeyPlaceholder', 'TEST')}
                        helperText={t('jira.config.testProjectKeyHelper', '연결 테스트 시 사용할 프로젝트 키 (선택사항)')}
                        fullWidth
                    />
                    
                    {/* 자동 테스트 설정 */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={autoTest}
                                onChange={(e) => setAutoTest(e.target.checked)}
                            />
                        }
                        label={t('jira.config.autoTest', '저장 전 자동으로 연결 테스트 수행')}
                    />
                    
                    {/* 연결 테스트 버튼 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleTestConnection}
                            disabled={testingConnection || !formData.serverUrl || !formData.username || !formData.apiToken}
                            startIcon={testingConnection ? <CircularProgress size={16} /> : <RefreshIcon />}
                        >
                            {testingConnection ? t('jira.config.testing', '테스트 중...') : t('jira.config.testButton', '연결 테스트')}
                        </Button>
                    </Box>
                    
                    {/* 연결 상태 표시 */}
                    {connectionStatus && (
                        <Alert 
                            severity={getStatusColor()}
                            icon={getStatusIcon()}
                            sx={{ mt: 1 }}
                        >
                            <Box>
                                <Typography variant="body2" fontWeight="bold">
                                    {connectionStatus.isConnected ? t('jira.config.testSuccess', '연결 성공') : t('jira.config.testFailed', '연결 실패')}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {getApiMessageTranslation(connectionStatus.message)}
                                </Typography>
                                {connectionStatus.jiraVersion && (
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {t('jira.config.jiraVersion', 'JIRA 버전')}: {connectionStatus.jiraVersion}
                                    </Typography>
                                )}
                                {connectionStatus.lastTested && (
                                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                        {t('jira.config.testTime', '테스트 시각')}: {new Date(connectionStatus.lastTested).toLocaleString()}
                                    </Typography>
                                )}
                            </Box>
                        </Alert>
                    )}
                    
                    {/* 프로젝트 목록 (연결 성공 시) */}
                    {projects.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                {t('jira.config.availableProjects', '사용 가능한 프로젝트:')}
                            </Typography>
                            <List dense sx={{ maxHeight: 150, overflow: 'auto', bgcolor: 'background.paper' }}>
                                {projects.slice(0, 5).map((project) => (
                                    <ListItem key={project.id} divider>
                                        <ListItemIcon>
                                            <Chip label={project.key} size="small" variant="outlined" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={project.name}
                                            secondary={project.description}
                                        />
                                    </ListItem>
                                ))}
                                {projects.length > 5 && (
                                    <ListItem>
                                        <ListItemText
                                            secondary={t('jira.config.moreProjects', '외 {count}개 프로젝트').replace('{count}', projects.length - 5)}
                                            sx={{ textAlign: 'center' }}
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </Box>
                    )}
                    
                    {/* API 토큰 생성 안내 */}
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            <strong>{t('jira.config.apiTokenGuide', 'API 토큰 생성 방법:')}</strong><br />
                            {t('jira.config.apiTokenStep1', '1. JIRA → 프로필 → 계정 설정 → 보안')}<br />
                            {t('jira.config.apiTokenStep2', '2. "API 토큰 만들기" 클릭')}<br />
                            {t('jira.config.apiTokenStep3', '3. 토큰 이름 입력 후 생성')}<br />
                            {t('jira.config.apiTokenStep4', '4. 생성된 토큰을 복사하여 위에 입력')}
                        </Typography>
                    </Alert>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    {t('jira.config.cancelButton', '취소')}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading || testingConnection}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {loading ? t('jira.config.saving', '저장 중...') : t('jira.config.saveButton', '저장')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default JiraConfigDialog;