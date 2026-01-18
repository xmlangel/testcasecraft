// src/components/RAG/utils/messageUtils.js

/**
 * 메시지 관련 유틸리티 함수들
 */

/**
 * 메시지 ID를 생성합니다 (보안 컨텍스트 및 구형 브라우저 호환)
 * @returns {string} 고유한 메시지 ID
 */
export function createMessageId() {
    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    // http 환경 또는 구형 브라우저를 위한 폴백
    return `fallback-id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 메시지 배열의 ID 중복을 제거합니다
 * @param {Array} messages - 메시지 배열
 * @returns {Array} ID가 고유한 메시지 배열
 */
export function ensureUniqueMessageIds(messages) {
    const seen = new Set();
    return messages.map((message) => {
        if (!message) return message;

        let nextId = message.id;
        let nextMessage = message;

        if (!nextId) {
            nextId = createMessageId();
            nextMessage = { ...nextMessage, id: nextId };
        }

        while (seen.has(nextId)) {
            nextId = createMessageId();
            nextMessage = { ...nextMessage, id: nextId };
        }

        seen.add(nextId);
        return nextMessage;
    });
}

/**
 * 대화 히스토리를 빌드합니다
 * @param {Array} messages - 메시지 배열
 * @returns {Array} 정제된 대화 히스토리
 */
export function buildConversationHistory(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return [];
    }

    const allowedRoles = new Set(['user', 'assistant', 'system']);
    const sanitizedHistory = messages.filter((message) => {
        if (!message || message.isStreaming) return false;
        if (!allowedRoles.has(message.role)) return false;
        if (!message.content || typeof message.content !== 'string') return false;
        return message.content.trim().length > 0;
    });

    if (sanitizedHistory.length === 0) {
        return [];
    }

    return sanitizedHistory.map(({ role, content, timestamp }) => ({
        role,
        content,
        timestamp: typeof timestamp === 'number' ? timestamp : undefined,
    }));
}

/**
 * 서버에서 받은 메시지를 UI 모델로 매핑합니다
 * @param {Array} persistedMessages - 서버 메시지 배열
 * @returns {Array} UI 메시지 배열
 */
export function mapPersistedMessages(persistedMessages = []) {
    return Array.isArray(persistedMessages)
        ? persistedMessages.map((item) => ({
            id: item.id || createMessageId(),
            persistedId: item.id || null,
            role: item.role || 'assistant',
            content: item.content || '',
            timestamp: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
            documents: item.documents || [],
            metadata: item.metadata || item.metadataJson || {},
            llmProvider: item.llmProvider,
            modelName: item.llmModel,
            similarity: typeof item.similarity === 'number' ? item.similarity : undefined,
        }))
        : [];
}
