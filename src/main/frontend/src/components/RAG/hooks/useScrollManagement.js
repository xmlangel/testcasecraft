// src/components/RAG/hooks/useScrollManagement.js
import { useRef, useCallback } from 'react';
import { SCROLL_CONSTANTS } from '../constants.js';

const { BOTTOM_THRESHOLD } = SCROLL_CONSTANTS;

/**
 * 스크롤 제어 관리 훅
 * - 스크롤 위치 감지
 * - 자동 스크롤 제어
 * - 사용자 스크롤 추적
 */
export function useScrollManagement({ isStreaming }) {
    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const shouldAutoScrollRef = useRef(true);

    const isUserNearBottom = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return true;

        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        return distanceFromBottom <= BOTTOM_THRESHOLD;
    }, []);

    const scrollToBottom = useCallback((behavior = 'smooth', { force = false } = {}) => {
        const container = messagesContainerRef.current;
        if (!container) return;

        if (!force) {
            if (!shouldAutoScrollRef.current) {
                return;
            }
            if (!isUserNearBottom()) {
                shouldAutoScrollRef.current = false;
                return;
            }
        }

        container.scrollTo({
            top: container.scrollHeight,
            behavior: behavior
        });
    }, [isUserNearBottom]);

    const handleMessagesScroll = useCallback(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        const isAtBottom = distanceFromBottom <= 0;

        // 스트리밍 중에는 사용자가 스크롤을 올리면 자동 스크롤을 비활성화만 하고,
        // 다시 활성화하지는 않습니다. 사용자가 다음 메시지를 보낼 때 다시 활성화됩니다.
        // 이를 통해 스트리밍 중 스크롤 제어권을 사용자에게 확실히 보장합니다.
        if (isStreaming) {
            if (!isAtBottom) {
                shouldAutoScrollRef.current = false;
            }
            return;
        } else {
            shouldAutoScrollRef.current = distanceFromBottom <= BOTTOM_THRESHOLD;
        }
    }, [isStreaming]);

    return {
        messagesContainerRef,
        messagesEndRef,
        shouldAutoScrollRef,
        isUserNearBottom,
        scrollToBottom,
        handleMessagesScroll,
    };
}
