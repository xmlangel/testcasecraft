import React, { useState, useEffect } from 'react';
import { Box, Typography, Switch, FormControlLabel, CircularProgress, Alert, Paper, Button, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { useRAG } from '../../context/RAGContext';
import { useI18n } from '../../context/I18nContext';

const SCHEDULER_MANAGEMENT_PATH = '/scheduler';

const RagSystemSettings = ({ onSuccess }) => {
    const { t } = useI18n();
    const { api } = useAppContext();
    const { updateRagEnabled } = useRAG();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isRagEnabled, setIsRagEnabled] = useState(true);
    // 저장 완료 후 실제 반영된 상태 (안내 메시지 기준)
    const [savedRagEnabled, setSavedRagEnabled] = useState(true);
    const [showSaveResult, setShowSaveResult] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api('/api/system-settings/rag/status');
            if (!response.ok) {
                throw new Error('Failed to fetch');
            }
            const data = await response.json();
            const enabled = data?.data?.enabled ?? data?.enabled;
            const resolvedEnabled = enabled !== false;
            setIsRagEnabled(resolvedEnabled);
            setSavedRagEnabled(resolvedEnabled);
        } catch (err) {
            console.error('Failed to fetch system settings:', err);
            setError(t('admin.systemSettings.fetchError', '설정을 불러오는데 실패했습니다.'));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleConfig = (event) => {
        setIsRagEnabled(event.target.checked);
        setShowSaveResult(false);
    };
    
    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setShowSaveResult(false);
            
            const response = await api('/api/system-settings/RAG_ENABLED', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    value: isRagEnabled.toString(),
                    description: 'RAG(AI) 기능 활성화 토글'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save setting');
            }
            
            // RAGContext 전역 상태 업데이트
            updateRagEnabled(isRagEnabled);
            setSavedRagEnabled(isRagEnabled);
            setShowSaveResult(true);
            
            if (onSuccess) {
                onSuccess(t('admin.systemSettings.saveSuccess', '시스템 설정이 성공적으로 저장되었습니다.'));
            }
        } catch (err) {
            console.error('Failed to update RAG setting:', err);
            setError(t('admin.systemSettings.saveError', '설정 저장에 실패했습니다.'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                    {t('admin.systemSettings.ragTitle', 'RAG 시스템 설정')}
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? <CircularProgress size={24} /> : t('common.save', '저장')}
                </Button>
            </Box>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    {t('admin.systemSettings.ragToggleTitle', 'RAG 기능 활성화 상태')}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    {t('admin.systemSettings.ragToggleDesc', '이 설정을 끄면 시스템 전체에서 RAG 기능 및 LLM 호출이 비활성화됩니다. RAG 시스템이 불안정하거나 유지보수가 필요할 때 사용하세요.')}
                </Typography>
                
                <FormControlLabel
                    control={
                        <Switch
                            checked={isRagEnabled}
                            onChange={handleToggleConfig}
                            color="primary"
                        />
                    }
                    label={
                        isRagEnabled 
                            ? t('common.enabled', '활성화됨') 
                            : t('common.disabled', '비활성화됨')
                    }
                />

                {/* 저장 완료 후 결과에 따른 안내 메시지 */}
                {showSaveResult && !savedRagEnabled && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                            RAG가 비활성화되었습니다.
                        </Typography>
                        <Typography variant="body2">
                            RAG 관련 스케줄러(<strong>rag-cleanup</strong>, <strong>rag-auto-analysis</strong>)가 자동으로 중지되었습니다.
                            RAG 재활성화 후에는 스케줄러를{' '}
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate(SCHEDULER_MANAGEMENT_PATH)}
                                sx={{ fontWeight: 'bold', verticalAlign: 'baseline' }}
                            >
                                스케줄러 관리 페이지
                            </Link>
                            에서 수동으로 다시 활성화해야 합니다.
                        </Typography>
                    </Alert>
                )}

                {showSaveResult && savedRagEnabled && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                            RAG가 활성화되었습니다.
                        </Typography>
                        <Typography variant="body2">
                            RAG 관련 스케줄러(<strong>rag-cleanup</strong>, <strong>rag-auto-analysis</strong>)는 자동으로 재시작되지 않습니다.{' '}
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate(SCHEDULER_MANAGEMENT_PATH)}
                                sx={{ fontWeight: 'bold', verticalAlign: 'baseline' }}
                            >
                                스케줄러 관리 페이지
                            </Link>
                            에서 수동으로 활성화해 주세요.
                        </Typography>
                    </Alert>
                )}
            </Paper>
        </Box>
    );
};

export default RagSystemSettings;
