// src/components/MailSettings/MailSettingsManager.jsx
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
    Grid,
    CircularProgress,
    Tooltip,
    Divider,
    LinearProgress,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Mail as MailIcon,
    Settings as SettingsIcon,
    Send as SendIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Security as SecurityIcon,
    Help as HelpIcon,
    Refresh as RefreshIcon,
    PowerSettingsNew as PowerIcon,
    Google as GoogleIcon
} from '@mui/icons-material';
import { green, red, orange, grey, blue } from '@mui/material/colors';
import MailConfigDialog from './MailConfigDialog';
import GmailGuideDialog from './GmailGuideDialog';
import { mailService } from '../../services/mailService';

const MailSettingsManager = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [configDialogOpen, setConfigDialogOpen] = useState(false);
    const [guideDialogOpen, setGuideDialogOpen] = useState(false);
    const [testLoading, setTestLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await mailService.getSettings();
            setSettings(response);
        } catch (err) {
            console.error('메일 설정 로드 실패:', err);
            setError('메일 설정을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (settingsData) => {
        try {
            setError(null);
            setSuccess(null);
            
            const response = await mailService.saveSettings(settingsData);
            setSettings(response.settings);
            setSuccess('메일 설정이 성공적으로 저장되었습니다.');
            setConfigDialogOpen(false);
            
            // 성공 메시지 자동 숨김
            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            console.error('메일 설정 저장 실패:', err);
            setError(err.response?.data?.message || '메일 설정 저장에 실패했습니다.');
        }
    };

    const handleTestMail = async (testRecipient) => {
        try {
            setTestLoading(true);
            setError(null);
            setSuccess(null);
            
            await mailService.testSettings(testRecipient);
            setSuccess(`테스트 메일이 ${testRecipient}로 발송되었습니다.`);
            
            // 성공 메시지 자동 숨김
            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            console.error('테스트 메일 발송 실패:', err);
            setError(err.response?.data?.message || '테스트 메일 발송에 실패했습니다.');
        } finally {
            setTestLoading(false);
        }
    };

    const handleDisableSettings = async () => {
        try {
            setError(null);
            setSuccess(null);
            
            await mailService.disableSettings();
            await loadSettings(); // 설정 다시 로드
            setSuccess('메일 기능이 비활성화되었습니다.');
            
            // 성공 메시지 자동 숨김
            setTimeout(() => setSuccess(null), 5000);
        } catch (err) {
            console.error('메일 설정 비활성화 실패:', err);
            setError('메일 설정 비활성화에 실패했습니다.');
        }
    };

    const getStatusChip = () => {
        if (!settings) return null;

        if (settings.mailEnabled) {
            return (
                <Chip
                    icon={<CheckCircleIcon />}
                    label="활성화"
                    color="success"
                    size="small"
                />
            );
        } else {
            return (
                <Chip
                    icon={<PowerIcon />}
                    label="비활성화"
                    color="default"
                    size="small"
                />
            );
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <MailIcon sx={{ mr: 2, color: blue[600] }} />
                메일 설정 관리
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* 현재 설정 상태 카드 */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardHeader
                            avatar={<MailIcon sx={{ color: blue[600] }} />}
                            title="현재 메일 설정"
                            subheader="시스템 메일 발송 설정 현황"
                            action={getStatusChip()}
                        />
                        <CardContent>
                            {settings ? (
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <SettingsIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="메일 기능"
                                            secondary={settings.mailEnabled ? '활성화됨' : '비활성화됨'}
                                        />
                                    </ListItem>
                                    
                                    <ListItem>
                                        <ListItemIcon>
                                            <GoogleIcon sx={{ color: red[500] }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="SMTP 서버"
                                            secondary={`${settings.smtpHost}:${settings.smtpPort}`}
                                        />
                                    </ListItem>
                                    
                                    {settings.username && (
                                        <ListItem>
                                            <ListItemIcon>
                                                <MailIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="발신자"
                                                secondary={`${settings.fromName} <${settings.username}>`}
                                            />
                                        </ListItem>
                                    )}
                                    
                                    <ListItem>
                                        <ListItemIcon>
                                            <SecurityIcon sx={{ color: green[600] }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="보안 설정"
                                            secondary={`인증: ${settings.useAuth ? '사용' : '미사용'}, TLS: ${settings.useTLS ? '사용' : '미사용'}`}
                                        />
                                    </ListItem>
                                </List>
                            ) : (
                                <Alert severity="info">
                                    메일 설정이 구성되지 않았습니다. 새로운 설정을 추가하세요.
                                </Alert>
                            )}
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="contained"
                                startIcon={<SettingsIcon />}
                                onClick={() => setConfigDialogOpen(true)}
                                color="primary"
                            >
                                {settings?.username ? '설정 수정' : '새 설정'}
                            </Button>
                            
                            {settings?.mailEnabled && (
                                <>
                                    <Button
                                        variant="outlined"
                                        startIcon={testLoading ? <CircularProgress size={16} /> : <SendIcon />}
                                        onClick={() => {
                                            const recipient = prompt('테스트 메일을 받을 이메일 주소를 입력하세요:', settings.username);
                                            if (recipient) {
                                                handleTestMail(recipient);
                                            }
                                        }}
                                        disabled={testLoading}
                                        color="info"
                                    >
                                        테스트 발송
                                    </Button>
                                    
                                    <Button
                                        variant="outlined"
                                        startIcon={<PowerIcon />}
                                        onClick={() => {
                                            if (window.confirm('정말 메일 기능을 비활성화하시겠습니까?')) {
                                                handleDisableSettings();
                                            }
                                        }}
                                        color="error"
                                    >
                                        비활성화
                                    </Button>
                                </>
                            )}
                            
                            <Tooltip title="설정 새로고침">
                                <IconButton onClick={loadSettings} color="default">
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </CardActions>
                    </Card>
                </Grid>

                {/* Gmail 설정 가이드 카드 */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={2} sx={{ p: 2, height: 'fit-content' }}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <GoogleIcon sx={{ mr: 1, color: red[500] }} />
                            <Typography variant="h6">
                                Gmail 설정 가이드
                            </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            TestCase Manager는 Gmail SMTP만 지원합니다. 
                            Gmail 앱 비밀번호 설정이 필요합니다.
                        </Typography>

                        <List dense>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircleIcon sx={{ fontSize: 16, color: green[600] }} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="Gmail 계정" 
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                            
                            <ListItem>
                                <ListItemIcon>
                                    <SecurityIcon sx={{ fontSize: 16, color: orange[600] }} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="2단계 인증 필수" 
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                            
                            <ListItem>
                                <ListItemIcon>
                                    <WarningIcon sx={{ fontSize: 16, color: red[600] }} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary="앱 비밀번호 생성" 
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                        </List>

                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<HelpIcon />}
                            onClick={() => setGuideDialogOpen(true)}
                            sx={{ mt: 2 }}
                        >
                            자세한 설정 방법
                        </Button>
                    </Paper>
                </Grid>
            </Grid>

            {/* 설정 다이얼로그 */}
            <MailConfigDialog
                open={configDialogOpen}
                onClose={() => setConfigDialogOpen(false)}
                onSave={handleSaveSettings}
                initialData={settings}
            />

            {/* Gmail 가이드 다이얼로그 */}
            <GmailGuideDialog
                open={guideDialogOpen}
                onClose={() => setGuideDialogOpen(false)}
            />
        </Box>
    );
};

export default MailSettingsManager;