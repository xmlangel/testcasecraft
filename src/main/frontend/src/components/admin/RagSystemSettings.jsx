import React, { useState, useEffect } from 'react';
import { Box, Typography, Switch, FormControlLabel, CircularProgress, Alert, Paper, Button } from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import { useRAG } from '../../context/RAGContext';
import { useI18n } from '../../context/I18nContext';

const RagSystemSettings = ({ onSuccess }) => {
    const { t } = useI18n();
    const { api } = useAppContext();
    const { state, dispatch } = useRAG();
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isRagEnabled, setIsRagEnabled] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch RAG status using the regular system settings endpoint to get the full object, 
            // or we could just use the `/rag/status` endpoint
            const response = await api.get('/api/system-settings/rag/status');
            setIsRagEnabled(response.data?.enabled !== false);
        } catch (err) {
            console.error('Failed to fetch system settings:', err);
            setError(t('admin.systemSettings.fetchError', '설정을 불러오는데 실패했습니다.'));
        } finally {
            setLoading(false);
        }
    };

    const handleToggleConfig = async (event) => {
        const newValue = event.target.checked;
        setIsRagEnabled(newValue);
    };
    
    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            
            await api.put('/api/system-settings/RAG_ENABLED', {
                settingValue: isRagEnabled.toString(),
                description: 'RAG(AI) 기능 활성화 토글'
            });
            
            // Update RAGContext local state
            if (dispatch) {
                dispatch({ 
                    type: 'SET_RAG_ENABLED_STATUS', 
                    payload: { 
                        isEnabled: isRagEnabled, 
                        message: isRagEnabled ? null : '시스템 관리자에 의해 RAG 기능이 임시 비활성화되었습니다.' 
                    } 
                });
            }
            
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
            </Paper>
        </Box>
    );
};

export default RagSystemSettings;
