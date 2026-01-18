// src/components/admin/CommonDocumentManagement.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Tabs, Tab, Alert } from '@mui/material';
import { LlmConfigProvider } from '../../context/LlmConfigContext';
import { RAGProvider } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext';
import LlmConfigList from './LlmConfigList.jsx';
import LlmTemplateSettings from './LlmTemplateSettings.jsx';
import GlobalDocumentManager from './GlobalDocumentManager.jsx';

const CommonDocumentManagementContent = () => {
    const { t } = useI18n();
    const location = useLocation();
    const navigate = useNavigate();

    const [currentTab, setCurrentTab] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');

    // URL 기반 탭 동기화
    useEffect(() => {
        const path = location.pathname;
        if (path === '/llm-config/template') {
            setCurrentTab(1);
        } else if (path === '/llm-config/global-documents') {
            setCurrentTab(2);
        } else if (path === '/llm-config') {
            setCurrentTab(0);
        }
    }, [location.pathname]);

    // 탭 변경 핸들러 (URL 업데이트)
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        if (newValue === 1) {
            navigate('/llm-config/template');
        } else if (newValue === 2) {
            navigate('/llm-config/global-documents');
        } else {
            navigate('/llm-config');
        }
    };

    // 성공 메시지 핸들러
    const handleSuccess = (message) => {
        setSuccessMessage(message);
    };

    // 성공 메시지 자동 숨김
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>
                {t('admin.llmConfig.title', 'LLM 설정 관리')}
            </Typography>

            {successMessage && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                </Alert>
            )}

            {/* 탭 네비게이션 */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                    <Tab label={t('admin.llmConfig.tab.configList', 'LLM 설정목록')} />
                    <Tab label={t('admin.llmConfig.tab.template', '기본 템플릿')} />
                    <Tab label={t('admin.llmConfig.tab.globalDocuments', 'RAG 공통 문서')} />
                </Tabs>
            </Paper>

            {/* 탭 0: LLM 설정목록 */}
            {currentTab === 0 && <LlmConfigList onSuccess={handleSuccess} />}

            {/* 탭 1: 기본 템플릿 */}
            {currentTab === 1 && <LlmTemplateSettings onSuccess={handleSuccess} />}

            {/* 탭 2: RAG 공통 문서 */}
            {currentTab === 2 && <GlobalDocumentManager onSuccess={handleSuccess} />}
        </Box>
    );
};

const CommonDocumentManagement = () => {
    return (
        <RAGProvider>
            <LlmConfigProvider>
                <CommonDocumentManagementContent />
            </LlmConfigProvider>
        </RAGProvider>
    );
};

export default CommonDocumentManagement;
