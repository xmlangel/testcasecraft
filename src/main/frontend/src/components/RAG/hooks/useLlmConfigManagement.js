// src/components/RAG/hooks/useLlmConfig.js
import { useState, useEffect } from 'react';

/**
 * LLM 설정 관리 훅
 * LLM 설정 선택 및 동기화 로직
 */
export function useLlmConfigManagement({ configs, isAdmin, user }) {
    // 초기값을 기본 LLM의 ID로 설정
    const getInitialLlmConfigId = () => {
        const defaultConfig = configs?.find(config => config.isDefault && config.isActive);
        return defaultConfig?.id || null;
    };

    const [selectedLlmConfigId, setSelectedLlmConfigId] = useState(getInitialLlmConfigId);

    // 활성화된 LLM 설정 목록
    const activeLlmConfigs = configs?.filter(config => config.isActive) || [];

    // 기본 LLM 설정 찾기
    const defaultLlmConfig = configs?.find(config => config.isDefault && config.isActive);

    const allowedLlmConfigs = isAdmin
        ? activeLlmConfigs
        : activeLlmConfigs.filter(config => config.isDefault);

    // 현재 사용 중인 LLM 설정
    // 우선순위: 1. 명시적으로 선택된 설정 2. 기본 설정 3. 허용 목록의 첫 번째 항목
    const currentLlmConfig =
        allowedLlmConfigs.find(config => config.id === selectedLlmConfigId) ||
        defaultLlmConfig ||
        (allowedLlmConfigs.length > 0 ? allowedLlmConfigs[0] : null);

    // configs가 변경되면 초기값을 다시 설정 (페이지 로드 시)
    useEffect(() => {
        const defaultId = defaultLlmConfig?.id;

        // selectedLlmConfigId가 없고 기본값이 있으면 설정
        if (!selectedLlmConfigId && defaultId) {
            setSelectedLlmConfigId(defaultId);
        }
    }, [defaultLlmConfig, selectedLlmConfigId]);

    // Non-Admin용 기본 LLM 설정 강제 동기화
    useEffect(() => {
        if (isAdmin) {
            return;
        }

        const defaultId = defaultLlmConfig?.id || null;

        // Admin이 아닌 경우 무조건 기본값으로 동기화
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
