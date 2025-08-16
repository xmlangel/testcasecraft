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

const JiraConfigDialog = ({ open, onClose, onSave, existingConfig = null }) => {
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
            newErrors.serverUrl = 'JIRA 서버 URL을 입력하세요';
        } else if (!isValidUrl(formData.serverUrl)) {
            newErrors.serverUrl = '올바른 URL 형식을 입력하세요';
        }
        
        if (!formData.username.trim()) {
            newErrors.username = '사용자명을 입력하세요';
        }
        
        if (!formData.apiToken.trim()) {
            newErrors.apiToken = 'API 토큰을 입력하세요';
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
                    message: '연결 테스트 응답이 없습니다. 서버 상태를 확인해주세요.'
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
                message: '연결 테스트 중 오류가 발생했습니다: ' + error.message
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
            if (!window.confirm('JIRA 연결에 실패했습니다. 그래도 저장하시겠습니까?')) {
                return;
            }
        }

        setLoading(true);
        setErrors({}); // 기존 에러 초기화
        
        try {
            console.log('💾 JIRA 설정 저장 시작');
            
            const configData = {
                serverUrl: formData.serverUrl.trim(),
                username: formData.username.trim(),
                apiToken: formData.apiToken.trim(),
                testProjectKey: formData.testProjectKey.trim() || null
            };
            
            console.log('📤 저장할 데이터:', { 
                ...configData, 
                apiToken: configData.apiToken ? '****' : '없음' 
            });
            
            const result = await onSave(configData);
            console.log('✅ JIRA 설정 저장 성공:', result);
            
        } catch (error) {
            console.error('❌ JIRA 설정 저장 실패:', error);
            
            // 에러 메시지를 더 자세히 표시
            let errorMessage = '설정 저장 중 오류가 발생했습니다.';
            
            if (error.message) {
                if (error.message.includes('암호화')) {
                    errorMessage = '암호화 키 설정에 문제가 있습니다. 관리자에게 문의하세요.';
                } else if (error.message.includes('401')) {
                    errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
                } else if (error.message.includes('400')) {
                    errorMessage = '입력 데이터에 문제가 있습니다. 다시 확인해주세요.';
                } else if (error.message.includes('500')) {
                    errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                } else {
                    errorMessage = `저장 실패: ${error.message}`;
                }
            }
            
            setErrors({ general: errorMessage });
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
            PaperProps={{
                sx: { 
                    minHeight: '500px',
                    '@media (max-width: 600px)': {
                        margin: '16px',
                        width: 'calc(100% - 32px)'
                    }
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                    {existingConfig ? 'JIRA 설정 수정' : 'JIRA 설정 추가'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {errors.general && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {errors.general}
                        </Alert>
                    )}
                    
                    {/* 서버 URL */}
                    <TextField
                        label="JIRA 서버 URL"
                        value={formData.serverUrl}
                        onChange={handleInputChange('serverUrl')}
                        placeholder="https://your-domain.atlassian.net"
                        error={!!errors.serverUrl}
                        helperText={errors.serverUrl || 'JIRA 서버 URL을 입력하세요 (예: https://company.atlassian.net)'}
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LinkIcon />
                                </InputAdornment>
                            )
                        }}
                    />
                    
                    {/* 사용자명 */}
                    <TextField
                        label="사용자명 (이메일)"
                        value={formData.username}
                        onChange={handleInputChange('username')}
                        placeholder="user@company.com"
                        error={!!errors.username}
                        helperText={errors.username || 'JIRA 로그인에 사용하는 이메일 주소'}
                        fullWidth
                    />
                    
                    {/* API 토큰 */}
                    <TextField
                        label="API 토큰"
                        type={showApiToken ? 'text' : 'password'}
                        value={formData.apiToken}
                        onChange={handleInputChange('apiToken')}
                        error={!!errors.apiToken}
                        helperText={errors.apiToken || 'JIRA API 토큰을 입력하세요'}
                        fullWidth
                        InputProps={{
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
                        }}
                    />
                    
                    {/* 테스트 프로젝트 키 (선택사항) */}
                    <TextField
                        label="테스트 프로젝트 키 (선택사항)"
                        value={formData.testProjectKey}
                        onChange={handleInputChange('testProjectKey')}
                        placeholder="TEST"
                        helperText="연결 테스트 시 사용할 프로젝트 키 (선택사항)"
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
                        label="저장 전 자동으로 연결 테스트 수행"
                    />
                    
                    {/* 연결 테스트 버튼 */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleTestConnection}
                            disabled={testingConnection || !formData.serverUrl || !formData.username || !formData.apiToken}
                            startIcon={testingConnection ? <CircularProgress size={16} /> : <RefreshIcon />}
                        >
                            {testingConnection ? '테스트 중...' : '연결 테스트'}
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
                                    {connectionStatus.isConnected ? '연결 성공' : '연결 실패'}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {connectionStatus.message}
                                </Typography>
                                {connectionStatus.jiraVersion && (
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        JIRA 버전: {connectionStatus.jiraVersion}
                                    </Typography>
                                )}
                                {connectionStatus.lastTested && (
                                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                        테스트 시각: {new Date(connectionStatus.lastTested).toLocaleString()}
                                    </Typography>
                                )}
                            </Box>
                        </Alert>
                    )}
                    
                    {/* 프로젝트 목록 (연결 성공 시) */}
                    {projects.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                사용 가능한 프로젝트:
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
                                            secondary={`외 ${projects.length - 5}개 프로젝트`}
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
                            <strong>API 토큰 생성 방법:</strong><br />
                            1. JIRA → 프로필 → 계정 설정 → 보안<br />
                            2. "API 토큰 만들기" 클릭<br />
                            3. 토큰 이름 입력 후 생성<br />
                            4. 생성된 토큰을 복사하여 위에 입력
                        </Typography>
                    </Alert>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    취소
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading || testingConnection}
                    startIcon={loading ? <CircularProgress size={16} /> : null}
                >
                    {loading ? '저장 중...' : '저장'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default JiraConfigDialog;