import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Box,
    Typography,
    Alert,
    Chip,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
} from '@mui/material';
import { useScheduler } from '../../context/SchedulerContext';
import { useI18n } from '../../context/I18nContext';

/**
 * 스케줄 설정 편집 다이얼로그
 */
const SchedulerConfigDialog = ({ open, onClose, config, onSuccess }) => {
    const { t } = useI18n();
    const theme = useTheme();
    const { updateConfig } = useScheduler();
    const [formData, setFormData] = useState({
        cronExpression: '',
        fixedRateMs: '',
        fixedDelayMs: '',
        enabled: true,
        description: '',
    });
    const [error, setError] = useState('');
    const [cronError, setCronError] = useState('');
    const [nextExecutionPreview, setNextExecutionPreview] = useState('');

    useEffect(() => {
        if (config) {
            setFormData({
                cronExpression: config.cronExpression || '',
                fixedRateMs: config.fixedRateMs || '',
                fixedDelayMs: config.fixedDelayMs || '',
                enabled: config.enabled,
                description: config.description || '',
            });
        }
    }, [config]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');

        // Cron 표현식 실시간 검증
        if (field === 'cronExpression' && config.scheduleType === 'CRON') {
            validateCronExpression(value);
        }
    };

    const validateCronExpression = (cron) => {
        if (!cron) {
            setCronError(t('scheduler.error.cronRequired', 'Cron 표현식을 입력하세요'));
            return false;
        }

        // 기본적인 Cron 표현식 형식 검증 (6개 필드: 초 분 시 일 월 요일)
        const cronParts = cron.trim().split(/\s+/);
        if (cronParts.length !== 6) {
            setCronError(t('scheduler.error.cronFormat', 'Cron 표현식은 6개 필드여야 합니다 (초 분 시 일 월 요일)'));
            return false;
        }

        setCronError('');
        // 실제 다음 실행 시간 계산은 백엔드에서 처리
        return true;
    };

    const handleSubmit = async () => {
        setError('');

        // 스케줄 타입에 따른 검증
        if (config.scheduleType === 'CRON') {
            if (!validateCronExpression(formData.cronExpression)) {
                return;
            }
        } else if (config.scheduleType === 'FIXED_RATE') {
            if (!formData.fixedRateMs || formData.fixedRateMs <= 0) {
                setError(t('scheduler.error.fixedRatePositive', 'Fixed Rate 값은 0보다 커야 합니다'));
                return;
            }
        } else if (config.scheduleType === 'FIXED_DELAY') {
            if (!formData.fixedDelayMs || formData.fixedDelayMs <= 0) {
                setError(t('scheduler.error.fixedDelayPositive', 'Fixed Delay 값은 0보다 커야 합니다'));
                return;
            }
        }

        try {
            await updateConfig(config.taskKey, {
                ...formData,
                scheduleType: config.scheduleType,
            });

            onSuccess?.(t('scheduler.dialog.updated', '스케줄 설정이 업데이트되었습니다.'));
            onClose();
        } catch (err) {
            const errorMessage = err.message || t('scheduler.error.updateFailed', '스케줄 설정 업데이트에 실패했습니다.');
            setError(errorMessage);
        }
    };

    const formatMilliseconds = (ms) => {
        if (!ms) return '';
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return t('scheduler.time.seconds', '{seconds}초').replace('{seconds}', seconds);
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return t('scheduler.time.minutes', '{minutes}분').replace('{minutes}', minutes);
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return t('scheduler.time.hours', '{hours}시간').replace('{hours}', hours);
        const days = Math.floor(hours / 24);
        return t('scheduler.time.days', '{days}일').replace('{days}', days);
    };

    const cronExamples = [
        { expression: '0 */5 * * * *', description: t('scheduler.cron.every5min', '매 5분마다') },
        { expression: '0 0 * * * *', description: t('scheduler.cron.everyHour', '매 시간 정각') },
        { expression: '0 0 0 * * *', description: t('scheduler.cron.midnight', '매일 자정') },
        { expression: '0 0 1 * * *', description: t('scheduler.cron.daily1am', '매일 새벽 1시') },
        { expression: '0 0 9 * * 1-5', description: t('scheduler.cron.weekdays9am', '평일 오전 9시') },
        { expression: '0 0 9 * * 1', description: t('scheduler.cron.monday9am', '매주 월요일 오전 9시') },
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            disableRestoreFocus
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box>
                    {t('scheduler.dialog.title', '스케줄 설정 편집')}
                    <Typography variant="subtitle2" color="text.secondary">
                        {config?.taskName}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" component="div" gutterBottom>
                        {t('scheduler.dialog.taskKey', '작업 키:')} <Chip label={config?.taskKey} size="small" />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="div" gutterBottom>
                        {t('scheduler.dialog.scheduleType', '스케줄 타입:')} <Chip label={config?.scheduleType} size="small" color="primary" />
                    </Typography>
                    {config?.description && (
                        <Typography variant="body2" color="text.secondary">
                            {t('scheduler.dialog.description', '설명:')} {config.description}
                        </Typography>
                    )}
                </Box>

                {config?.scheduleType === 'CRON' && (
                    <>
                        <TextField
                            fullWidth
                            label={t('scheduler.dialog.cronExpression', 'Cron 표현식')}
                            value={formData.cronExpression}
                            onChange={(e) => handleChange('cronExpression', e.target.value)}
                            error={!!cronError}
                            helperText={cronError || t('scheduler.dialog.cronHelper', '형식: 초 분 시 일 월 요일 (예: 0 0 1 * * *)')}
                            margin="normal"
                            required
                        />

                        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
                            <Typography variant="subtitle2" gutterBottom>
                                {t('scheduler.dialog.cronExamples', 'Cron 표현식 예시')}
                            </Typography>
                            <List dense>
                                {cronExamples.map((example, index) => (
                                    <ListItem key={index} disablePadding>
                                        <ListItemButton onClick={() => handleChange('cronExpression', example.expression)}>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                        <code style={{
                                                            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
                                                            color: theme.palette.text.primary,
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            fontFamily: 'monospace',
                                                        }}>
                                                            {example.expression}
                                                        </code>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {example.description}
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </>
                )}

                {config?.scheduleType === 'FIXED_RATE' && (
                    <TextField
                        fullWidth
                        type="number"
                        label={t('scheduler.dialog.fixedRate', 'Fixed Rate (밀리초)')}
                        value={formData.fixedRateMs}
                        onChange={(e) => handleChange('fixedRateMs', parseInt(e.target.value))}
                        helperText={t('scheduler.dialog.currentValue', '현재 값: {value}').replace('{value}', formatMilliseconds(formData.fixedRateMs))}
                        margin="normal"
                        required
                    />
                )}

                {config?.scheduleType === 'FIXED_DELAY' && (
                    <TextField
                        fullWidth
                        type="number"
                        label={t('scheduler.dialog.fixedDelay', 'Fixed Delay (밀리초)')}
                        value={formData.fixedDelayMs}
                        onChange={(e) => handleChange('fixedDelayMs', parseInt(e.target.value))}
                        helperText={t('scheduler.dialog.currentValue', '현재 값: {value}').replace('{value}', formatMilliseconds(formData.fixedDelayMs))}
                        margin="normal"
                        required
                    />
                )}

                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.enabled}
                            onChange={(e) => handleChange('enabled', e.target.checked)}
                            color="primary"
                        />
                    }
                    label={t('scheduler.dialog.enabled', '활성화')}
                    sx={{ mt: 2 }}
                />

                {config?.nextExecutionTime && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        {t('scheduler.dialog.nextExecution', '다음 실행 예정: {time}').replace('{time}', new Date(config.nextExecutionTime).toLocaleString('ko-KR'))}
                    </Alert>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    {t('scheduler.dialog.cancel', '취소')}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={!!cronError}
                >
                    {t('scheduler.dialog.save', '저장')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SchedulerConfigDialog;
