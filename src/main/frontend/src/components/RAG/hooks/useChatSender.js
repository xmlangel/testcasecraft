// src/components/RAG/hooks/useChatSender.js
import { useCallback } from 'react';
import {
    isFileListRequest as checkFileListRequest,
    isTestCaseRequest as checkTestCaseRequest,
    filterNonTestCaseDocuments,
} from '../utils/keywordUtils.js';
import { formatDocumentListMessage } from '../utils/documentUtils.js';
import { PAGINATION_CONSTANTS } from '../constants.js';

/**
 * 채팅 메시지 전송 로직 훅
 * handleSendMessage의 복잡한 로직을 분리
 */
export function useChatSender({
    projectId,
    chat,
    chatStream,
    createMessageId,
    ensureUniqueMessageIds,
    setMessages,
    buildConversationHistory,
    clearFallbackSimulation,
    isUserNearBottom,
    shouldAutoScrollRef,
    streamingMessageIdRef,
    streamingBufferRef,
    abortControllerRef,
    setIsStreaming,
    setIsLoading,
    scheduleStreamingFlush,
    clearStreamingScheduler,
    updateStreamingMessage,
    resetStreamingBuffer,
    scrollToBottom,
    simulateFallbackStreaming,
    handleChatResult,
    listDocuments,
    startTransition,
    currentLlmConfig,
}) {
    // 파일 리스트 요청 처리
    const handleFileListRequest = useCallback(async (trimmedInput) => {
        if (!checkFileListRequest(trimmedInput)) {
            return null;
        }

        try {
            const response = await listDocuments(
                projectId,
                PAGINATION_CONSTANTS.DEFAULT_PAGE,
                PAGINATION_CONSTANTS.DEFAULT_PAGE_SIZE
            );
            const allDocuments = response.documents || [];

            // 테스트케이스 문서 필터링
            const documents = filterNonTestCaseDocuments(allDocuments);

            // 문서 목록 메시지 생성
            const fileListMessage = formatDocumentListMessage(documents);

            return {
                id: createMessageId(),
                role: 'assistant',
                content: fileListMessage,
                timestamp: Date.now(),
                documents: [],
            };
        } catch (error) {
            throw new Error(error.response?.data?.message || '문서 목록을 불러오는데 실패했습니다.');
        }
    }, [projectId, listDocuments, createMessageId]);

    // 테스트 케이스 템플릿 적용
    const applyTestCaseTemplate = useCallback((trimmedInput) => {
        if (checkTestCaseRequest(trimmedInput) && currentLlmConfig?.testCaseTemplate) {
            return `${trimmedInput}\n\n다음 JSON 형식을 참고하여 테스트 케이스를 생성해주세요:\n\`\`\`json\n${currentLlmConfig.testCaseTemplate}\n\`\`\``;
        }

        return trimmedInput;
    }, [currentLlmConfig]);

    // 스트리밍 채팅 처리
    const handleStreamingChat = useCallback(async (messageContentForAPI, chatOptions) => {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const assistantMessageId = createMessageId();
        const assistantMessage = {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: Date.now(),
            documents: [],
            isStreaming: true,
        };

        streamingMessageIdRef.current = assistantMessageId;
        streamingBufferRef.current = { messageId: assistantMessageId, pending: '' };

        startTransition(() => {
            setMessages((prev) => ensureUniqueMessageIds([...prev, assistantMessage]));
        });
        setIsStreaming(true);

        await chatStream(
            projectId,
            messageContentForAPI,
            (chunk) => {
                if (!chunk) return;
                const buffer = streamingBufferRef.current;
                if (!buffer || buffer.messageId !== assistantMessageId) {
                    streamingBufferRef.current = {
                        messageId: assistantMessageId,
                        pending: chunk,
                    };
                } else {
                    buffer.pending += chunk;
                }
                scheduleStreamingFlush();
            },
            () => {
                clearStreamingScheduler(true);
                updateStreamingMessage((current) => ({
                    ...current,
                    isStreaming: false,
                    timestamp: Date.now(),
                }));
                streamingMessageIdRef.current = null;
                resetStreamingBuffer();
                setIsStreaming(false);
                setIsLoading(false);
                if (shouldAutoScrollRef.current) {
                    scrollToBottom('smooth');
                }
            },
            (streamError) => {
                clearStreamingScheduler();
                resetStreamingBuffer();
            },
            {
                ...chatOptions,
                signal: abortController.signal,
                onContext: (contexts) => {
                    clearStreamingScheduler(true);
                    updateStreamingMessage((current) => ({
                        ...current,
                        documents: Array.isArray(contexts) ? contexts : [],
                    }));
                },
            }
        );
    }, [
        projectId,
        chatStream,
        createMessageId,
        ensureUniqueMessageIds,
        setMessages,
        setIsStreaming,
        setIsLoading,
        streamingMessageIdRef,
        streamingBufferRef,
        abortControllerRef,
        scheduleStreamingFlush,
        clearStreamingScheduler,
        updateStreamingMessage,
        resetStreamingBuffer,
        scrollToBottom,
        shouldAutoScrollRef,
        startTransition,
    ]);

    // 일반 채팅 처리
    const handleRegularChat = useCallback(async (messageContentForAPI, chatOptions, shouldPersist, resolvedThreadId, userMessageId) => {
        const response = await chat(projectId, messageContentForAPI, chatOptions);

        if (shouldPersist) {
            await handleChatResult(response, { shouldPersist, resolvedThreadId, userMessageId });
            setIsLoading(false);
            return;
        }

        const assistantMessage = {
            id: createMessageId(),
            role: 'assistant',
            content: response.answer || response.content,
            timestamp: Date.now(),
            documents: response.documents || [],
            similarity: response.similarity,
            persistedId: response.assistantMessageId || null,
        };

        setMessages((prev) => ensureUniqueMessageIds([...prev, assistantMessage]));
        setIsLoading(false);
    }, [
        projectId,
        chat,
        createMessageId,
        ensureUniqueMessageIds,
        setMessages,
        setIsLoading,
        handleChatResult,
    ]);

    // 폴백 처리
    const handleFallback = useCallback(async (
        error,
        messageContentForAPI,
        chatOptions,
        activeStreamingId,
        userMessageId
    ) => {
        const shouldFallback = () => {
            if (!chatStream || !chat) return false;
            if (!error) return false;
            if (error.name === 'TypeError') return true;
            const message = (error.message || '').toLowerCase();
            return (
                message.includes('network') ||
                message.includes('chunked') ||
                message.includes('stream') ||
                message.includes('스트리밍')
            );
        };

        if (!shouldFallback()) {
            return false;
        }

        try {
            const response = await chat(projectId, messageContentForAPI, chatOptions);
            const fallbackContent = response.answer || response.content || '';
            const fallbackDocuments = response.documents || [];
            const fallbackSimilarity = response.similarity;

            if (activeStreamingId) {
                simulateFallbackStreaming(activeStreamingId, fallbackContent, {
                    documents: fallbackDocuments,
                    similarity: fallbackSimilarity,
                });
            } else {
                const fallbackMessageId = createMessageId();
                const fallbackMessage = {
                    id: fallbackMessageId,
                    role: 'assistant',
                    content: '',
                    timestamp: Date.now(),
                    documents: fallbackDocuments,
                    similarity: fallbackSimilarity,
                    isStreaming: true,
                };
                streamingMessageIdRef.current = fallbackMessageId;
                startTransition(() => {
                    setMessages((prev) => ensureUniqueMessageIds([...prev, fallbackMessage]));
                });
                simulateFallbackStreaming(fallbackMessageId, fallbackContent, {
                    documents: fallbackDocuments,
                    similarity: fallbackSimilarity,
                });
            }

            await handleChatResult(response, {
                shouldPersist: false,
                resolvedThreadId: null,
                userMessageId
            });
            setIsLoading(false);
            setIsStreaming(false);
            return true;
        } catch (fallbackError) {
            return false;
        }
    }, [
        chat,
        chatStream,
        projectId,
        createMessageId,
        ensureUniqueMessageIds,
        setMessages,
        setIsLoading,
        setIsStreaming,
        simulateFallbackStreaming,
        streamingMessageIdRef,
        handleChatResult,
        startTransition,
    ]);

    return {
        handleFileListRequest,
        applyTestCaseTemplate,
        handleStreamingChat,
        handleRegularChat,
        handleFallback,
    };
}
