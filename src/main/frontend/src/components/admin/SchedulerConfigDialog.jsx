import React, { useState, useEffect } from 'react';
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
    ListItemText,
} from '@mui/material';
import { useScheduler } from '../../context/SchedulerContext';

/**
 * 스케줄 설정 편집 다이얼로그
 */
const SchedulerConfigDialog = ({ open, onClose, config, onSuccess }) => {
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
            setCronError('Cron 표현식을 입력하세요');
            return false;
        }

        // 기본적인 Cron 표현식 형식 검증 (6개 필드: 초 분 시 일 월 요일)
        const cronParts = cron.trim().split(/\s+/);
        if (cronParts.length !== 6) {
            setCronError('Cron 표현식은 6개 필드여야 합니다 (초 분 시 일 월 요일)');
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
                setError('Fixed Rate 값은 0보다 커야 합니다');
                return;
            }
        } else if (config.scheduleType === 'FIXED_DELAY') {
            if (!formData.fixedDelayMs || formData.fixedDelayMs <= 0) {
                setError('Fixed Delay 값은 0보다 커야 합니다');
                return;
            }
        }

        try {
            await updateConfig(config.taskKey, {
                ...formData,
                scheduleType: config.scheduleType,
            });

            onSuccess?.('스케줄 설정이 업데이트되었습니다.');
            onClose();
        } catch (err) {
            const errorMessage = err.message || '스케줄 설정 업데이트에 실패했습니다.';
            setError(errorMessage);
        }
    };

    const formatMilliseconds = (ms) => {
        if (!ms) return '';
        const seconds = Math.floor(ms / 1000);
        if (seconds < 60) return `${seconds}초`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}분`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}시간`;
        const days = Math.floor(hours / 24);
        return `${days}일`;
    };

    const cronExamples = [
        { expression: '0 */5 * * * *', description: '매 5분마다' },
        { expression: '0 0 * * * *', description: '매 시간 정각' },
        { expression: '0 0 0 * * *', description: '매일 자정' },
        { expression: '0 0 1 * * *', description: '매일 새벽 1시' },
        { expression: '0 0 9 * * 1-5', description: '평일 오전 9시' },
        { expression: '0 0 9 * * 1', description: '매주 월요일 오전 9시' },
    ];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                스케줄 설정 편집
                <Typography variant="subtitle2" color="text.secondary">
                    {config?.taskName}
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        작업 키: <Chip label={config?.taskKey} size="small" />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        스케줄 타입: <Chip label={config?.scheduleType} size="small" color="primary" />
                    </Typography>
                    {config?.description && (
                        <Typography variant="body2" color="text.secondary">
                            설명: {config.description}
                        </Typography>
                    )}
                </Box>

                {config?.scheduleType === 'CRON' && (
                    <>
                        <TextField
                            fullWidth
                            label="Cron 표현식"
                            value={formData.cronExpression}
                            onChange={(e) => handleChange('cronExpression', e.target.value)}
                            error={!!cronError}
                            helperText={cronError || '형식: 초 분 시 일 월 요일 (예: 0 0 1 * * *)'}
                            margin="normal"
                            required
                        />

                        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Cron 표현식 예시
                            </Typography>
                            <List dense>
                                {cronExamples.map((example, index) => (
                                    <ListItem
                                        key={index}
                                        button
                                        onClick={() => handleChange('cronExpression', example.expression)}
                                    >
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                    <code style={{
                                                        backgroundColor: '#f5f5f5',
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
                        label="Fixed Rate (밀리초)"
                        value={formData.fixedRateMs}
                        onChange={(e) => handleChange('fixedRateMs', parseInt(e.target.value))}
                        helperText={`현재 값: ${formatMilliseconds(formData.fixedRateMs)}`}
                        margin="normal"
                        required
                    />
                )}

                {config?.scheduleType === 'FIXED_DELAY' && (
                    <TextField
                        fullWidth
                        type="number"
                        label="Fixed Delay (밀리초)"
                        value={formData.fixedDelayMs}
                        onChange={(e) => handleChange('fixedDelayMs', parseInt(e.target.value))}
                        helperText={`현재 값: ${formatMilliseconds(formData.fixedDelayMs)}`}
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
                    label="활성화"
                    sx={{ mt: 2 }}
                />

                {config?.nextExecutionTime && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        다음 실행 예정: {new Date(config.nextExecutionTime).toLocaleString('ko-KR')}
                    </Alert>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    취소
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={!!cronError}
                >
                    저장
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SchedulerConfigDialog;
