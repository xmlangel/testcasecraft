// src/components/RAG/hooks/useStreamingChat.js
import { useState, useRef, useCallback, useEffect, useTransition } from 'react';

/**
 * 스트리밍 채팅 관련 로직 훅
 * - 스트리밍 상태 관리
 * - 버퍼링 및 플러시 메커니즘
 * - 폴백 스트리밍 시뮬레이션
 * - AbortController 관리
 */
export function useStreamingChat({ setMessages, scrollToBottom, shouldAutoScrollRef }) {
    const [isStreaming, setIsStreaming] = useState(false);
    const streamingMessageIdRef = useRef(null);
    const streamingBufferRef = useRef({ messageId: null, pending: '' });
    const streamingFlushHandleRef = useRef({ id: null, type: null });
    const fallbackStreamTimeoutRef = useRef(null);
    const fallbackSimulationStateRef = useRef({ cancelRequested: false, targetId: null });
    const abortControllerRef = useRef(null);
    const [, startTransition] = useTransition();

    const updateStreamingMessage = useCallback((updater) => {
        const targetId = streamingMessageIdRef.current;
        if (!targetId) return;

        startTransition(() => {
            setMessages((prev) => {
                const index = prev.findIndex((message) => message.id === targetId);
                if (index === -1) return prev;

                const currentMessage = prev[index];
                const updatedMessage = updater(currentMessage);

                if (updatedMessage === null) {
                    const nextMessages = [...prev];
                    nextMessages.splice(index, 1);
                    return nextMessages;
                }

                if (updatedMessage === currentMessage) {
                    return prev;
                }

                const nextMessages = [...prev];
                nextMessages[index] = updatedMessage;
                return nextMessages;
            });
        });
    }, [setMessages, startTransition]);

    const flushStreamingBuffer = useCallback(() => {
        const { messageId, pending } = streamingBufferRef.current;
        if (!messageId || !pending) {
            return;
        }

        const textToAppend = pending;
        streamingBufferRef.current = { messageId, pending: '' };

        updateStreamingMessage((current) => {
            if (!current) return current;
            return {
                ...current,
                content: `${current.content || ''}${textToAppend}`,
            };
        });

        if (shouldAutoScrollRef.current) {
            // DOM 업데이트 후 스크롤을 보장하기 위해 requestAnimationFrame 사용
            if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
                window.requestAnimationFrame(() => {
                    scrollToBottom('auto');
                });
            } else {
                setTimeout(() => {
                    scrollToBottom('auto');
                }, 0);
            }
        }
    }, [scrollToBottom, updateStreamingMessage, shouldAutoScrollRef]);

    const scheduleStreamingFlush = useCallback(() => {
        const handle = streamingFlushHandleRef.current;
        if (handle.id !== null) {
            return;
        }

        const run = () => {
            streamingFlushHandleRef.current = { id: null, type: null };
            flushStreamingBuffer();
        };

        if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            const id = window.requestAnimationFrame(run);
            streamingFlushHandleRef.current = { id, type: 'raf' };
        } else {
            const id = setTimeout(run, 16);
            streamingFlushHandleRef.current = { id, type: 'timeout' };
        }
    }, [flushStreamingBuffer]);

    const clearStreamingScheduler = useCallback((shouldFlush = false) => {
        const { id, type } = streamingFlushHandleRef.current;
        if (id !== null) {
            if (type === 'raf' && typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
                window.cancelAnimationFrame(id);
            } else if (type === 'timeout') {
                clearTimeout(id);
            }
            streamingFlushHandleRef.current = { id: null, type: null };
        }

        if (shouldFlush) {
            flushStreamingBuffer();
        }
    }, [flushStreamingBuffer]);

    const resetStreamingBuffer = useCallback(() => {
        streamingBufferRef.current = { messageId: null, pending: '' };
    }, []);

    const clearFallbackSimulation = useCallback(() => {
        const { targetId } = fallbackSimulationStateRef.current;
        fallbackSimulationStateRef.current.cancelRequested = true;
        if (fallbackStreamTimeoutRef.current !== null) {
            clearTimeout(fallbackStreamTimeoutRef.current);
            fallbackStreamTimeoutRef.current = null;
        }
        if (targetId && streamingMessageIdRef.current === targetId) {
            updateStreamingMessage((current) => {
                if (!current || current.id !== targetId) return current;
                return {
                    ...current,
                    isStreaming: false,
                };
            });
            streamingMessageIdRef.current = null;
        }
        fallbackSimulationStateRef.current = {
            cancelRequested: false,
            targetId: null,
        };
    }, [updateStreamingMessage]);

    useEffect(() => {
        return () => {
            clearStreamingScheduler();
            streamingBufferRef.current = { messageId: null, pending: '' };
            clearFallbackSimulation();
        };
    }, [clearStreamingScheduler, clearFallbackSimulation]);

    const simulateFallbackStreaming = useCallback((
        targetMessageId,
        fullText,
        metadata = {}
    ) => {
        if (!targetMessageId) {
            setIsStreaming(false);
            return;
        }

        clearFallbackSimulation();
        streamingMessageIdRef.current = targetMessageId;

        const safeText = typeof fullText === 'string'
            ? fullText
            : String(fullText ?? '');
        const documents = Array.isArray(metadata.documents) ? metadata.documents : [];
        const similarity = metadata.similarity;
        const chunkSize = Number.isFinite(metadata.chunkSize) ? metadata.chunkSize : 8;
        const interval = Number.isFinite(metadata.interval) ? metadata.interval : 24;

        fallbackSimulationStateRef.current = {
            cancelRequested: false,
            targetId: targetMessageId,
        };

        setIsStreaming(true);

        updateStreamingMessage((current) => {
            if (!current || current.id !== targetMessageId) return current;
            return {
                ...current,
                content: '',
                isStreaming: true,
                documents,
                similarity,
            };
        });

        const finalize = () => {
            if (streamingMessageIdRef.current === targetMessageId) {
                streamingMessageIdRef.current = null;
                setIsStreaming(false);
                if (shouldAutoScrollRef.current) {
                    scrollToBottom('smooth');
                }
            }
            fallbackSimulationStateRef.current = {
                cancelRequested: false,
                targetId: null,
            };
            fallbackStreamTimeoutRef.current = null;
        };

        if (safeText.length === 0) {
            updateStreamingMessage((current) => {
                if (!current || current.id !== targetMessageId) return current;
                return {
                    ...current,
                    content: '',
                    isStreaming: false,
                    documents,
                    similarity,
                    timestamp: Date.now(),
                };
            });
            finalize();
            return;
        }

        let index = 0;

        const step = () => {
            const { cancelRequested, targetId } = fallbackSimulationStateRef.current;
            if (cancelRequested && targetId === targetMessageId) {
                fallbackSimulationStateRef.current = {
                    cancelRequested: false,
                    targetId: null,
                };
                fallbackStreamTimeoutRef.current = null;
                return;
            }

            index = Math.min(index + chunkSize, safeText.length);
            const nextContent = safeText.slice(0, index);

            updateStreamingMessage((current) => {
                if (!current || current.id !== targetMessageId) return current;
                return {
                    ...current,
                    content: nextContent,
                };
            });

            if (shouldAutoScrollRef.current) {
                // DOM 업데이트 후 스크롤을 보장하기 위해 requestAnimationFrame 사용
                if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
                    window.requestAnimationFrame(() => {
                        scrollToBottom('auto');
                    });
                } else {
                    setTimeout(() => {
                        scrollToBottom('auto');
                    }, 0);
                }
            }

            if (index >= safeText.length) {
                updateStreamingMessage((current) => {
                    if (!current || current.id !== targetMessageId) return current;
                    return {
                        ...current,
                        content: safeText,
                        isStreaming: false,
                        documents,
                        similarity,
                        timestamp: Date.now(),
                    };
                });
                finalize();
                return;
            }

            const handle = typeof window !== 'undefined' && typeof window.setTimeout === 'function'
                ? window.setTimeout(step, interval)
                : setTimeout(step, interval);
            fallbackStreamTimeoutRef.current = handle;
        };

        step();
    }, [
        clearFallbackSimulation,
        scrollToBottom,
        setIsStreaming,
        shouldAutoScrollRef,
        updateStreamingMessage,
    ]);

    // 스트리밍 중지 핸들러
    const handleStopStreaming = useCallback(() => {
        // AbortController로 fetch 취소
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }

        // 스트리밍 상태 정리
        clearStreamingScheduler(true);
        clearFallbackSimulation();

        // 현재 스트리밍 중인 메시지를 완료 상태로 변경
        const currentStreamingId = streamingMessageIdRef.current;
        if (currentStreamingId) {
            updateStreamingMessage((current) => {
                if (!current || current.id !== currentStreamingId) return current;
                return {
                    ...current,
                    isStreaming: false,
                    timestamp: Date.now(),
                };
            });
            streamingMessageIdRef.current = null;
        }

        resetStreamingBuffer();
        setIsStreaming(false);

        // console.log('✋ 사용자가 스트리밍을 중지했습니다');
    }, [clearStreamingScheduler, clearFallbackSimulation, updateStreamingMessage, resetStreamingBuffer]);

    return {
        isStreaming,
        setIsStreaming,
        streamingMessageIdRef,
        streamingBufferRef,
        abortControllerRef,
        updateStreamingMessage,
        flushStreamingBuffer,
        scheduleStreamingFlush,
        clearStreamingScheduler,
        resetStreamingBuffer,
        clearFallbackSimulation,
        simulateFallbackStreaming,
        handleStopStreaming,
        startTransition,
    };
}
