// src/components/MailSettings/MailConfigDialog.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControlLabel,
    Switch,
    Box,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    Divider,
    Chip,
    CircularProgress
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Google as GoogleIcon,
    Security as SecurityIcon,
    Mail as MailIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { red, green, orange } from '@mui/material/colors';
import { useI18n } from '../../context/I18nContext';

const MailConfigDialog = ({ open, onClose, onSave, initialData }) => {
    const { t } = useI18n();
    const [formData, setFormData] = useState({
        mailEnabled: false,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        username: '',
        password: '',
        fromName: 'TestCase Manager',
        useAuth: true,
        useTLS: true,
        testRecipient: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            if (initialData) {
                setFormData({
                    mailEnabled: initialData.mailEnabled || false,
                    smtpHost: initialData.smtpHost || 'smtp.gmail.com',
                    smtpPort: initialData.smtpPort || 587,
                    username: initialData.username || '',
                    password: '', // 보안상 비워둠
                    fromName: initialData.fromName || 'TestCase Manager',
                    useAuth: initialData.useAuth !== undefined ? initialData.useAuth : true,
                    useTLS: initialData.useTLS !== undefined ? initialData.useTLS : true,
                    testRecipient: initialData.testRecipient || ''
                });
            } else {
                setFormData({
                    mailEnabled: false,
                    smtpHost: 'smtp.gmail.com',
                    smtpPort: 587,
                    username: '',
                    password: '',
                    fromName: 'TestCase Manager',
                    useAuth: true,
                    useTLS: true,
                    testRecipient: ''
                });
            }
            setErrors({});
            setShowPassword(false);
        }
    }, [open, initialData]);

    const handleInputChange = (field) => (event) => {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
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

        if (!formData.username) {
            newErrors.username = t('mail.config.validation.gmailRequired', 'Gmail 주소는 필수입니다.');
        } else if (!formData.username.endsWith('@gmail.com')) {
            newErrors.username = t('mail.config.validation.gmailFormat', 'Gmail 주소만 지원됩니다. (@gmail.com으로 끝나야 함)');
        }

        if (!formData.password) {
            newErrors.password = t('mail.config.validation.passwordRequired', 'Gmail 앱 비밀번호는 필수입니다.');
        } else if (formData.password.length < 8) {
            newErrors.password = t('mail.config.validation.passwordLength', '앱 비밀번호는 8자 이상이어야 합니다.');
        }

        if (!formData.fromName.trim()) {
            newErrors.fromName = t('mail.config.validation.senderNameRequired', '발신자 이름은 필수입니다.');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error('설정 저장 실패:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (!saving) {
            onClose();
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="md" 
            fullWidth
            disableEscapeKeyDown={saving}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
                <MailIcon sx={{ mr: 1, color: red[500] }} />
                {initialData?.username ? t('mail.config.title.edit', '메일 설정 수정') : t('mail.config.title.new', '새 메일 설정')}
            </DialogTitle>
            <DialogContent>
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                        <strong>Gmail {t('mail.guide.requirements', '전용')}:</strong> {t('mail.config.gmailInfo', '이 시스템은 Gmail SMTP만 지원합니다. Gmail 2단계 인증과 앱 비밀번호가 필요합니다.')}
                    </Typography>
                </Alert>

                <Box sx={{ mt: 2 }}>
                    {/* 메일 활성화 스위치 */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.mailEnabled}
                                onChange={handleInputChange('mailEnabled')}
                                color="primary"
                            />
                        }
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography>{t('mail.config.enableMail', '메일 기능 활성화')}</Typography>
                                <Chip
                                    label={formData.mailEnabled ? t('mail.status.active', '활성화') : t('mail.status.inactive', '비활성화')}
                                    size="small"
                                    color={formData.mailEnabled ? 'success' : 'default'}
                                    sx={{ ml: 1 }}
                                />
                            </Box>
                        }
                        sx={{ mb: 2 }}
                    />

                    <Divider sx={{ my: 2 }} />

                    {/* Gmail 주소 */}
                    <TextField
                        fullWidth
                        label={t('mail.config.form.gmailAddress', 'Gmail 주소')}
                        type="email"
                        value={formData.username}
                        onChange={handleInputChange('username')}
                        error={!!errors.username}
                        helperText={errors.username || t('mail.config.form.gmailAddressHelper', '예: your-email@gmail.com')}
                        margin="normal"
                        placeholder={t('mail.config.form.gmailAddressPlaceholder', 'your-email@gmail.com')}
                        required
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <GoogleIcon sx={{ color: red[500] }} />
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />

                    {/* Gmail 앱 비밀번호 */}
                    <TextField
                        fullWidth
                        label={t('mail.config.form.appPassword', 'Gmail 앱 비밀번호')}
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        error={!!errors.password}
                        helperText={errors.password || t('mail.config.form.appPasswordHelper', '16자리 Gmail 앱 비밀번호 (공백 없이)')}
                        margin="normal"
                        placeholder={t('mail.config.form.appPasswordPlaceholder', 'Gmail 앱 비밀번호')}
                        required
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SecurityIcon sx={{ color: orange[600] }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />

                    {/* 발신자 이름 */}
                    <TextField
                        fullWidth
                        label={t('mail.config.form.senderName', '발신자 이름')}
                        value={formData.fromName}
                        onChange={handleInputChange('fromName')}
                        error={!!errors.fromName}
                        helperText={errors.fromName || t('mail.config.form.senderNameHelper', '메일에 표시될 발신자 이름')}
                        margin="normal"
                        placeholder={t('mail.config.form.senderNamePlaceholder', 'TestCase Manager')}
                        required
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon />
                                    </InputAdornment>
                                ),
                            }
                        }}
                    />

                    <Divider sx={{ my: 2 }} />

                    {/* 고정 설정 정보 */}
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            {t('mail.config.fixedSettings', 'Gmail 고정 설정:')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • {t('mail.config.fixedSettings.smtp', 'SMTP 서버: smtp.gmail.com:587')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • {t('mail.config.fixedSettings.tls', 'TLS 암호화: 사용')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            • {t('mail.config.fixedSettings.auth', 'SMTP 인증: 사용')}
                        </Typography>
                    </Box>

                    {formData.mailEnabled && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            
                            {/* 테스트 수신자 */}
                            <TextField
                                fullWidth
                                label={t('mail.config.form.testRecipient', '테스트 메일 수신자 (선택사항)')}
                                type="email"
                                value={formData.testRecipient}
                                onChange={handleInputChange('testRecipient')}
                                helperText={t('mail.config.form.testRecipientHelper', '설정 후 테스트 메일을 받을 이메일 주소')}
                                margin="normal"
                                placeholder={t('mail.config.form.testRecipientPlaceholder', 'test@example.com')}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <MailIcon />
                                            </InputAdornment>
                                        ),
                                    }
                                }}
                            />
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button 
                    onClick={handleClose} 
                    disabled={saving}
                    color="inherit"
                >
                    {t('mail.config.button.cancel', '취소')}
                </Button>
                <Button 
                    onClick={handleSave}
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} /> : <MailIcon />}
                >
                    {saving ? t('mail.config.button.saving', '저장 중...') : t('mail.config.button.save', '저장')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MailConfigDialog;