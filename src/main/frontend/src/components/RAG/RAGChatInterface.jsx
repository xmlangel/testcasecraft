// src/components/RAG/RAGChatInterface.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  CircularProgress,
  Typography,
  Divider,
  Dialog,
  Button,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import ThreadManagerDialog from './ThreadManagerDialog.jsx';
import ChatHeader from './ChatHeader.jsx';
import ChatControls from './ChatControls.jsx';
import ChatMessageList from './ChatMessageList.jsx';
import ChatInput from './ChatInput.jsx';
import ChatDialogs from './ChatDialogs.jsx';
import { useRAG } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useLlmConfig } from '../../context/LlmConfigContext.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import { useMessageManagement } from './hooks/useMessageManagement.js';
import { useScrollManagement } from './hooks/useScrollManagement.js';
import { useStreamingChat } from './hooks/useStreamingChat.js';
import { useThreadManagement } from './hooks/useThreadManagement.js';
import { useLlmConfigManagement } from './hooks/useLlmConfigManagement.js';
import { useChatSender } from './hooks/useChatSender.js';
import { debugLog } from '../../utils/logger.js';

/**
 * RAG 채팅 인터페이스 컴포넌트
 * LLM과의 질의응답 채팅을 제공합니다.
 */
function RAGChatInterface({ projectId, onDocumentClick }) {
  const { t } = useI18n();
  const {
    chat,
    chatStream,
    threads,
    categories,
    threadMessages,
    selectedThreadId,
    selectThread,
    persistConversation,
    setPersistConversation,
    listChatThreads,
    listChatCategories,
    fetchThreadMessages,
    threadLoading,
    createChatThread,
    getChatThread,
    updateChatThread,
    deleteChatThread,
    editChatMessage,
    deleteChatMessage,
    llmAvailable,
    llmCheckLoading,
    checkLlmAvailability,
    listDocuments,
    loadedProjectId,
    setLoadedProjectId,
  } = useRAG();

  const { configs } = useLlmConfig();
  const { user } = useAppContext();

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isChatFullScreen, setIsChatFullScreen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [useRagSearch, setUseRagSearch] = useState(true);

  const inputRef = useRef(null);

  const isAdmin = (user?.role ?? null) === 'ADMIN';

  // LLM 설정 관리
  const llmConfigManagement = useLlmConfigManagement({ configs, isAdmin, user });
  const {
    selectedLlmConfigId,
    setSelectedLlmConfigId,
    activeLlmConfigs,
    defaultLlmConfig,
    allowedLlmConfigs,
    currentLlmConfig,
  } = llmConfigManagement;

  // Custom Hooks
  const messageManagement = useMessageManagement({ projectId, persistConversation, selectedThreadId });
  const {
    messages,
    setMessages,
    storageKey,
    createMessageId,
    ensureUniqueMessageIds,
    buildConversationHistory,
    mapPersistedMessages,
    loadSessionMessages,
  } = messageManagement;

  const scrollManagement = useScrollManagement({ isStreaming: false });
  const {
    messagesContainerRef,
    messagesEndRef,
    shouldAutoScrollRef,
    isUserNearBottom,
    scrollToBottom,
    handleMessagesScroll,
  } = scrollManagement;

  const streamingChat = useStreamingChat({
    setMessages,
    scrollToBottom,
    shouldAutoScrollRef,
  });
  const {
    isStreaming,
    setIsStreaming,
    streamingMessageIdRef,
    streamingBufferRef,
    abortControllerRef,
    updateStreamingMessage,
    scheduleStreamingFlush,
    clearStreamingScheduler,
    resetStreamingBuffer,
    clearFallbackSimulation,
    simulateFallbackStreaming,
    handleStopStreaming,
    startTransition,
  } = streamingChat;

  const refreshPersistedConversation = useCallback(async (threadIdToLoad) => {
    if (!threadIdToLoad) {
      return;
    }
    try {
      const persistedMessages = await fetchThreadMessages(threadIdToLoad);
      const mappedMessages = mapPersistedMessages(persistedMessages);
      setMessages(mappedMessages);
      setTimeout(() => {
        scrollToBottom('auto', { force: true });
      }, 0);
    } catch (refreshError) {
      // console.error('저장된 대화 갱신 실패:', refreshError);
    }
  }, [fetchThreadMessages, mapPersistedMessages, scrollToBottom, setMessages]);

  const threadManagement = useThreadManagement({
    projectId,
    selectedThreadId,
    selectThread,
    setPersistConversation,
    messages,
    setMessages,
    loadSessionMessages,
    listChatCategories,
    listChatThreads,
    fetchThreadMessages,
    createChatThread,
    updateChatThread,
    deleteChatThread,
    editChatMessage,
    deleteChatMessage,
    refreshPersistedConversation,
    t,
    setError,
  });

  const {
    selectedCategoryIds,
    setSelectedCategoryIds,
    isThreadDialogOpen,
    newThreadTitle,
    setNewThreadTitle,
    newThreadDescription,
    setNewThreadDescription,
    isSavingThread,
    isThreadManagerOpen,
    editDialog,
    isDeleteDialogOpen,
    isDeletingThread,
    isDeletingMessage,
    isDeleteMessageConfirmOpen,
    handlePersistToggle,
    handleThreadChange,
    handleCategoryChange,
    handleOpenThreadDialog,
    handleCloseThreadDialog,
    handleCreateThread,
    handleOpenThreadManager,
    handleCloseThreadManager,
    handleManageThreadUpdate,
    handleManageThreadDelete,
    handleOpenDeleteThreadDialog,
    handleCloseDeleteThreadDialog,
    handleConfirmDeleteThread,
    handleEditRequest,
    handleEditClose,
    handleEditContentChange,
    handleEditSubmit,
    handleOpenDeleteMessageConfirm,
    handleCloseDeleteMessageConfirm,
    handleDeleteMessage,
  } = threadManagement;

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

  // 컴포넌트 마운트 시 세션 스토리지에서 대화 히스토리 로드
  useEffect(() => {
    if (persistConversation && selectedThreadId) {
      return;
    }
    loadSessionMessages();
  }, [persistConversation, selectedThreadId, loadSessionMessages]);

  // 메시지 변경 시 세션 스토리지에 저장
  useEffect(() => {
    if (isStreaming) {
      return;
    }
    if (persistConversation && selectedThreadId) {
      return;
    }

    try {
      if (messages.length > 0) {
        const sanitizedMessages = messages.map(({ isStreaming: _ignore, ...message }) => message);
        sessionStorage.setItem(storageKey, JSON.stringify(sanitizedMessages));
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch (error) {
      // console.error('대화 히스토리 저장 실패:', error);
    }
  }, [messages, storageKey, isStreaming, persistConversation, selectedThreadId]);

  // 메시지 스크롤 자동 하단 이동
  useEffect(() => {
    if (isStreaming) {
      return;
    }

    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom, isStreaming]);

  // 입력 텍스트 변경 시 스크롤 위치 조정
  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom('auto', { force: true });
    }
  }, [inputText, scrollToBottom, shouldAutoScrollRef]);

  // LLM 설정 가용성 체크
  useEffect(() => {
    if (checkLlmAvailability && llmAvailable === null) {
      checkLlmAvailability();
    }
  }, [checkLlmAvailability, llmAvailable]);

  useEffect(() => {
    debugLog('RAGChatInterface', '🔍 [Thread Load] useEffect triggered:', { projectId, persistConversation, loadedProjectId });

    if (!projectId || !persistConversation) {
      debugLog('RAGChatInterface', '⏭️ [Thread Load] Skipped: projectId or persistConversation is false');
      return;
    }

    // 이미 로드된 프로젝트라면 스킵
    if (loadedProjectId === projectId) {
      debugLog('RAGChatInterface', '⏭️ [Thread Load] Skipped: Threads already loaded for this project');
      return;
    }

    debugLog('RAGChatInterface', '📡 [Thread Load] Calling listChatThreads...');

    // 카테고리와 스레드를 동시에 로드
    Promise.all([
      listChatCategories(projectId).catch(err => console.error('Categories load failed:', err)),
      listChatThreads(projectId).catch(err => console.error('Threads load failed:', err))
    ]).then(([categoriesResult, threadsResult]) => {
      debugLog('RAGChatInterface', '✅ [Thread Load] completed');
      if (setLoadedProjectId) {
        setLoadedProjectId(projectId);
      }
    });

  }, [projectId, persistConversation, listChatCategories, listChatThreads, loadedProjectId, setLoadedProjectId]);

  useEffect(() => {
    debugLog('RAGChatInterface', '📋 [Thread State] threads updated:', {
      count: threads.length,
      threads: threads.slice(0, 3).map(t => ({ id: t.id, title: t.title }))
    });
  }, [threads]);

  useEffect(() => {
    if (!persistConversation || !selectedThreadId) {
      return;
    }
    if (!threadMessages[selectedThreadId]) {
      fetchThreadMessages(selectedThreadId).catch(() => { });
    }
  }, [persistConversation, selectedThreadId, threadMessages, fetchThreadMessages]);

  useEffect(() => {
    if (!persistConversation || !selectedThreadId) {
      return;
    }
    const persisted = threadMessages[selectedThreadId];
    if (persisted) {
      setMessages(mapPersistedMessages(persisted));
    }
  }, [persistConversation, selectedThreadId, threadMessages, mapPersistedMessages, setMessages]);

  useEffect(() => {
    if (!persistConversation) {
      setSelectedCategoryIds([]);
      return;
    }
    if (selectedThreadId) {
      const thread = threads.find((item) => item.id === selectedThreadId);
      setSelectedCategoryIds(thread?.categories?.map((category) => category.id) || []);
    }
  }, [persistConversation, selectedThreadId, threads, setSelectedCategoryIds]);

  const handleChatResult = useCallback(async (response, {
    shouldPersist,
    resolvedThreadId,
    userMessageId,
  }) => {
    if (shouldPersist) {
      if (Array.isArray(response?.categoryIds)) {
        setSelectedCategoryIds(response.categoryIds);
      }

      const nextThreadId = response?.threadId || resolvedThreadId || null;
      if (nextThreadId) {
        selectThread(nextThreadId);
        if (projectId) {
          listChatThreads(projectId).catch(() => { });
        }
        await refreshPersistedConversation(nextThreadId);
      }
      return;
    }

    if (response?.userMessageId && userMessageId) {
      setMessages((prev) => prev.map((message) => (
        message.id === userMessageId
          ? { ...message, persistedId: response.userMessageId }
          : message
      )));
    }

    const assistantMessage = {
      id: createMessageId(),
      role: 'assistant',
      content: response?.answer || response?.content || '',
      timestamp: Date.now(),
      documents: response?.documents || [],
      similarity: response?.similarity,
      persistedId: response?.assistantMessageId || null,
    };

    setMessages((prev) => ensureUniqueMessageIds([...prev, assistantMessage]));
  }, [projectId, selectThread, listChatThreads, refreshPersistedConversation, createMessageId, ensureUniqueMessageIds, setSelectedCategoryIds, setMessages]);

  // Chat Sender 훅
  const chatSender = useChatSender({
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
  });

  const {
    handleFileListRequest,
    applyTestCaseTemplate,
    handleStreamingChat,
    handleRegularChat,
    handleFallback,
  } = chatSender;

  // 메시지 전송 핸들러 (간소화됨)
  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading) return;

    const shouldPersist = persistConversation;
    const resolvedThreadId = shouldPersist ? selectedThreadId : null;
    const resolvedCategoryIds = shouldPersist && !resolvedThreadId ? selectedCategoryIds : undefined;

    debugLog('RAGChatInterface', '📤 [RAG Chat] 메시지 전송:', {
      persistConversation,
      shouldPersist,
      selectedThreadId,
      resolvedThreadId,
      selectedCategoryIds,
      resolvedCategoryIds,
      hasChatStream: !!chatStream,
      willUseStreaming: !!(chatStream && !shouldPersist),
    });

    const conversationHistory = buildConversationHistory(messages);
    const wasNearBottom = isUserNearBottom();
    shouldAutoScrollRef.current = shouldAutoScrollRef.current && wasNearBottom;

    clearFallbackSimulation();

    // 파일 리스트 요청 처리
    try {
      const fileListMessage = await handleFileListRequest(trimmedInput);
      if (fileListMessage) {
        setMessages((prev) => ensureUniqueMessageIds([...prev, fileListMessage]));
        setIsLoading(false);
        return;
      }
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    // 테스트 케이스 템플릿 적용
    const messageContentForAPI = applyTestCaseTemplate(trimmedInput);

    // 화면 표시용 메시지
    const userMessage = {
      id: createMessageId(),
      role: 'user',
      content: trimmedInput,
      timestamp: Date.now(),
    };

    setMessages((prev) => ensureUniqueMessageIds([...prev, userMessage]));
    setInputText('');
    setIsLoading(true);
    setIsStreaming(false);
    setError(null);

    // 메시지 전송 후 입력 필드에 다시 포커스
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const chatOptions = {
      conversationHistory,
      persistConversation: shouldPersist,
      useRagSearch,
    };

    if (currentLlmConfig && currentLlmConfig.id) {
      chatOptions.llmConfigId = currentLlmConfig.id;
    }

    if (shouldPersist && resolvedThreadId) {
      chatOptions.threadId = resolvedThreadId;
    }

    if (shouldPersist && Array.isArray(resolvedCategoryIds) && resolvedCategoryIds.length > 0) {
      chatOptions.categoryIds = resolvedCategoryIds;
    }

    try {
      // 스트리밍 응답 사용
      if (chatStream && !shouldPersist) {
        await handleStreamingChat(messageContentForAPI, chatOptions);
        return;
      } else {
        // 일반 응답 처리
        await handleRegularChat(messageContentForAPI, chatOptions, shouldPersist, resolvedThreadId, userMessage.id);
        return;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        abortControllerRef.current = null;
        return;
      }

      clearStreamingScheduler();
      resetStreamingBuffer();

      const activeStreamingId = streamingMessageIdRef.current;

      // 폴백 시도
      const fallbackSuccess = await handleFallback(
        error,
        messageContentForAPI,
        chatOptions,
        activeStreamingId,
        userMessage.id
      );

      if (fallbackSuccess) {
        return;
      }

      // 폴백 실패 시 정리
      if (activeStreamingId) {
        updateStreamingMessage(() => null);
        if (streamingMessageIdRef.current === activeStreamingId) {
          streamingMessageIdRef.current = null;
        }
      }

      setIsStreaming(false);
      setIsLoading(false);
      setError(error.message || '메시지 전송에 실패했습니다.');
    }
  }, [
    inputText,
    isLoading,
    persistConversation,
    selectedThreadId,
    selectedCategoryIds,
    chatStream,
    buildConversationHistory,
    isUserNearBottom,
    shouldAutoScrollRef,
    clearFallbackSimulation,
    handleFileListRequest,
    applyTestCaseTemplate,
    createMessageId,
    ensureUniqueMessageIds,
    setMessages,
    setIsLoading,
    setIsStreaming,
    setError,
    useRagSearch,
    currentLlmConfig,
    handleStreamingChat,
    handleRegularChat,
    clearStreamingScheduler,
    resetStreamingBuffer,
    streamingMessageIdRef,
    handleFallback,
    updateStreamingMessage,
    abortControllerRef,
    messages,
  ]);

  // 엔터키 전송 핸들러
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  }, [handleSendMessage, isComposing]);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  // 대화 초기화 핸들러
  const handleClearChat = useCallback(() => {
    clearStreamingScheduler();
    resetStreamingBuffer();
    clearFallbackSimulation();
    setMessages([]);
    setIsStreaming(false);
    setIsLoading(false);
    streamingMessageIdRef.current = null;
    shouldAutoScrollRef.current = true;
    setError(null);
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      // console.error('세션 스토리지 삭제 실패:', error);
    }
  }, [clearStreamingScheduler, clearFallbackSimulation, resetStreamingBuffer, storageKey, setMessages, setIsStreaming, streamingMessageIdRef, shouldAutoScrollRef]);

  // 대화 다시 시작 (마지막 메시지 제거)
  const handleRetry = useCallback(() => {
    clearFallbackSimulation();
    clearStreamingScheduler();
    resetStreamingBuffer();
    streamingMessageIdRef.current = null;
    setIsStreaming(false);
    setIsLoading(false);
    if (messages.length >= 2) {
      setMessages((prev) => prev.slice(0, -2));
    }
    setError(null);
  }, [clearFallbackSimulation, clearStreamingScheduler, messages, resetStreamingBuffer, setIsStreaming, streamingMessageIdRef, setMessages]);

  const handleEnterFullScreen = useCallback(() => {
    setIsChatFullScreen(true);
  }, []);

  const handleExitFullScreen = useCallback(() => {
    setIsChatFullScreen(false);
  }, []);

  const renderChatLayout = useCallback((isFullScreenMode = false) => {
    // LLM 설정이 없는 경우 안내 메시지 표시
    if (llmAvailable === false) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            p: 4,
            textAlign: 'center',
          }}
        >
          <SettingsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {t('rag.chat.llmNotConfigured', '기본 LLM 설정이 필요합니다')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
            {t(
              'rag.chat.llmNotConfiguredMessage',
              'AI 질의응답 기능을 사용하려면 관리자가 LLM(Language Model)을 기본값으로 설정해야 합니다. 관리자에게 문의해주세요.'
            )}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => checkLlmAvailability()}
            disabled={llmCheckLoading}
          >
            {llmCheckLoading
              ? t('common.loading', '로딩 중...')
              : t('rag.chat.recheckLlm', '다시 확인')}
          </Button>
        </Box>
      );
    }

    // LLM 설정 확인 중
    if (llmAvailable === null || llmCheckLoading) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            {t('rag.chat.checkingLlm', 'LLM 설정 확인 중...')}
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <ChatHeader
          isAdmin={isAdmin}
          activeLlmConfigs={activeLlmConfigs}
          selectedLlmConfigId={selectedLlmConfigId}
          defaultLlmConfig={defaultLlmConfig}
          onLlmConfigChange={setSelectedLlmConfigId}
          isFullScreen={isFullScreenMode}
          onToggleFullScreen={isFullScreenMode ? handleExitFullScreen : handleEnterFullScreen}
          onRetry={handleRetry}
          onClearChat={handleClearChat}
          messages={messages}
          isLoading={isLoading}
          persistConversation={persistConversation}
          selectedThreadId={selectedThreadId}
        />
        <Divider />
        <ChatControls
          persistConversation={persistConversation}
          onPersistToggle={handlePersistToggle}
          useRagSearch={useRagSearch}
          onRagSearchToggle={(e) => setUseRagSearch(e.target.checked)}
          threads={threads}
          selectedThreadId={selectedThreadId}
          onThreadChange={handleThreadChange}
          threadLoading={threadLoading}
          categories={categories}
          selectedCategoryIds={selectedCategoryIds}
          onCategoryChange={handleCategoryChange}
          onRefreshThreads={listChatThreads}
          onDeleteThread={handleOpenDeleteThreadDialog}
          onOpenThreadDialog={handleOpenThreadDialog}
          onOpenThreadManager={handleOpenThreadManager}
          projectId={projectId}
          isDeletingThread={isDeletingThread}
        />
        <ChatMessageList
          messages={messages}
          projectId={projectId}
          onDocumentClick={onDocumentClick}
          onEdit={handleEditRequest}
          isLoading={isLoading}
          isStreaming={isStreaming}
          error={error}
          onErrorClose={() => setError(null)}
          messagesContainerRef={messagesContainerRef}
          messagesEndRef={messagesEndRef}
          onScroll={handleMessagesScroll}
          persistConversation={persistConversation}
        />
        <Divider />
        <ChatInput
          inputText={inputText}
          onInputChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onSend={handleSendMessage}
          isLoading={isLoading}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          isFullScreen={isFullScreenMode}
          inputRef={inputRef}
        />
      </Box>
    );
  }, [
    llmAvailable,
    llmCheckLoading,
    checkLlmAvailability,
    t,
    isAdmin,
    activeLlmConfigs,
    selectedLlmConfigId,
    defaultLlmConfig,
    handleRetry,
    handleClearChat,
    handleEnterFullScreen,
    handleExitFullScreen,
    messages,
    isLoading,
    persistConversation,
    selectedThreadId,
    handlePersistToggle,
    useRagSearch,
    threads,
    handleThreadChange,
    threadLoading,
    categories,
    selectedCategoryIds,
    handleCategoryChange,
    listChatThreads,
    handleOpenDeleteThreadDialog,
    handleOpenThreadDialog,
    handleOpenThreadManager,
    projectId,
    isDeletingThread,
    onDocumentClick,
    handleEditRequest,
    isStreaming,
    error,
    messagesContainerRef,
    messagesEndRef,
    handleMessagesScroll,
    inputText,
    handleKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
    handleSendMessage,
    handleStopStreaming,
    inputRef,
  ]);

  return (
    <>
      <Paper elevation={2} sx={{ height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderChatLayout()}
      </Paper>
      <ThreadManagerDialog
        open={isThreadManagerOpen}
        onClose={handleCloseThreadManager}
        threads={threads}
        categories={categories}
        initialThreadId={selectedThreadId || (threads[0]?.id ?? null)}
        onFetchThread={getChatThread}
        onUpdateThread={handleManageThreadUpdate}
        onDeleteThread={handleManageThreadDelete}
        threadMessages={threadMessages}
        onFetchThreadMessages={fetchThreadMessages}
      />
      <ChatDialogs
        isThreadDialogOpen={isThreadDialogOpen}
        onCloseThreadDialog={handleCloseThreadDialog}
        newThreadTitle={newThreadTitle}
        onThreadTitleChange={(e) => setNewThreadTitle(e.target.value)}
        newThreadDescription={newThreadDescription}
        onThreadDescriptionChange={(e) => setNewThreadDescription(e.target.value)}
        selectedCategoryIds={selectedCategoryIds}
        onCategoryChange={handleCategoryChange}
        categories={categories}
        onCreateThread={handleCreateThread}
        isSavingThread={isSavingThread}
        isDeleteDialogOpen={isDeleteDialogOpen}
        onCloseDeleteThreadDialog={handleCloseDeleteThreadDialog}
        onConfirmDeleteThread={handleConfirmDeleteThread}
        isDeletingThread={isDeletingThread}
        editDialog={editDialog}
        onEditClose={handleEditClose}
        onEditContentChange={handleEditContentChange}
        onEditSubmit={handleEditSubmit}
        onOpenDeleteMessageConfirm={handleOpenDeleteMessageConfirm}
        isDeletingMessage={isDeletingMessage}
        isDeleteMessageConfirmOpen={isDeleteMessageConfirmOpen}
        onCloseDeleteMessageConfirm={handleCloseDeleteMessageConfirm}
        onDeleteMessage={handleDeleteMessage}
      />
      <Dialog
        fullScreen
        open={isChatFullScreen}
        onClose={handleExitFullScreen}
        slotProps={{
          paper: {
            sx: {
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.default',
            },
          }
        }}
      >
        {renderChatLayout(true)}
      </Dialog>
    </>
  );
}

RAGChatInterface.propTypes = {
  projectId: PropTypes.string.isRequired,
  onDocumentClick: PropTypes.func,
};

export default RAGChatInterface;
