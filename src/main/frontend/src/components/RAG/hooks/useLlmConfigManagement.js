// src/components/RAG/hooks/useLlmConfig.js
import { useState, useEffect } from 'react';

/**
 * LLM 설정 관리 훅
 * LLM 설정 선택 및 동기화 로직
 */
export function useLlmConfigManagement({ configs, isAdmin, user }) {
    const [selectedLlmConfigId, setSelectedLlmConfigId] = useState(null);

    // 활성화된 LLM 설정 목록
    const activeLlmConfigs = configs?.filter(config => config.isActive) || [];

    // 기본 LLM 설정 찾기
    const defaultLlmConfig = configs?.find(config => config.isDefault && config.isActive);

    const allowedLlmConfigs = isAdmin
        ? activeLlmConfigs
        : activeLlmConfigs.filter(config => config.isDefault);

    // 현재 사용 중인 LLM 설정
    const currentLlmConfig =
        allowedLlmConfigs.find(config => config.id === selectedLlmConfigId) ||
        defaultLlmConfig ||
        allowedLlmConfigs[0];

    // Admin용 기본 LLM 설정 동기화
    useEffect(() => {
        if (isAdmin) {
            return;
        }

        const defaultId = defaultLlmConfig?.id || null;

        if (!defaultId) {
            if (selectedLlmConfigId) {
                setSelectedLlmConfigId(null);
            }
            return;
        }

        if (selectedLlmConfigId !== defaultId) {
            setSelectedLlmConfigId(defaultId);
        }
    }, [isAdmin, defaultLlmConfig, selectedLlmConfigId]);

    return {
        selectedLlmConfigId,
        setSelectedLlmConfigId,
        activeLlmConfigs,
        defaultLlmConfig,
        allowedLlmConfigs,
        currentLlmConfig,
    };
}
