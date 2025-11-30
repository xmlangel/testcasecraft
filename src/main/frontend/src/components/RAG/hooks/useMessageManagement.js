// src/components/RAG/hooks/useMessageManagement.js
import { useState, useCallback, useMemo } from 'react';
import {
    createMessageId as createId,
    ensureUniqueMessageIds as ensureUnique,
    buildConversationHistory as buildHistory,
    mapPersistedMessages as mapMessages,
} from '../utils/messageUtils.js';
import { STORAGE_PREFIX } from '../constants.js';

/**
 * 메시지 상태 및 데이터 관리 훅
 * - 메시지 ID 생성
 * - 메시지 상태 관리
 * - 세션 스토리지 저장/로드
 * - 대화 히스토리 빌드
 */
export function useMessageManagement({ projectId, persistConversation, selectedThreadId }) {
    const [messages, setMessages] = useState([]);

    const storageKey = useMemo(() => `${STORAGE_PREFIX.CHAT_HISTORY}${projectId}`, [projectId]);

    // 유틸리티 함수를 래핑 (외부에서 createMessageId로 사용할 수 있도록)
    const createMessageId = useCallback(() => createId(), []);

    const ensureUniqueMessageIds = useCallback((candidateMessages) => {
        return ensureUnique(candidateMessages);
    }, []);

    const buildConversationHistory = useCallback((sourceMessages) => {
        return buildHistory(sourceMessages);
    }, []);

    const mapPersistedMessages = useCallback((persisted = []) => {
        return mapMessages(persisted);
    }, []);

    const loadSessionMessages = useCallback(() => {
        try {
            const savedMessages = sessionStorage.getItem(storageKey);
            if (savedMessages) {
                const parsed = JSON.parse(savedMessages);
                if (Array.isArray(parsed)) {
                    const messagesWithNewIds = parsed.map(message => ({
                        ...message,
                        id: createId(),
                        documents: message.documents || [],
                    }));
                    setMessages(messagesWithNewIds);
                }
            } else {
                setMessages([]);
            }
        } catch (loadError) {
            // console.error('대화 히스토리 로드 실패:', loadError);
        }
    }, [storageKey]);

    return {
        messages,
        setMessages,
        storageKey,
        createMessageId,
        ensureUniqueMessageIds,
        buildConversationHistory,
        mapPersistedMessages,
        loadSessionMessages,
    };
}
