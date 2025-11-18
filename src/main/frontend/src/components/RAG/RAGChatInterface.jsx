// src/components/RAG/RAGChatInterface.jsx
import React, { useState, useEffect, useRef, useCallback, useTransition, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Stack,
  Chip,
  Checkbox,
  ListItemText,
} from '@mui/material';
import {
  Send as SendIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import ChatMessage from './ChatMessage.jsx';
import ThreadManagerDialog from './ThreadManagerDialog.jsx';
import { useRAG } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useLlmConfig } from '../../context/LlmConfigContext.jsx';

const SCROLL_BOTTOM_THRESHOLD = 80;

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
  } = useRAG();

  const { configs } = useLlmConfig();

  // 활성화된 LLM 설정 목록
  const activeLlmConfigs = configs?.filter(config => config.isActive) || [];

  // 기본 LLM 설정 찾기
  const defaultLlmConfig = configs?.find(config => config.isDefault && config.isActive);

  const [messages, setMessages] = useState([]);
  const [selectedLlmConfigId, setSelectedLlmConfigId] = useState(null);
  const [inputText, setInputText] = useState('');

  // 현재 사용 중인 LLM 설정 (선택된 것이 있으면 그것, 없으면 기본값)
  const currentLlmConfig = activeLlmConfigs.find(config => config.id === selectedLlmConfigId) || defaultLlmConfig;
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [isChatFullScreen, setIsChatFullScreen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [isThreadDialogOpen, setIsThreadDialogOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadDescription, setNewThreadDescription] = useState('');
  const [isSavingThread, setIsSavingThread] = useState(false);
  const [isThreadManagerOpen, setIsThreadManagerOpen] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, message: null, content: '' });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingThread, setIsDeletingThread] = useState(false);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [isDeleteMessageConfirmOpen, setIsDeleteMessageConfirmOpen] = useState(false);
  const [useRagSearch, setUseRagSearch] = useState(true);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const streamingMessageIdRef = useRef(null);
  const streamingBufferRef = useRef({ messageId: null, pending: '' });
  const streamingFlushHandleRef = useRef({ id: null, type: null });
  const fallbackStreamTimeoutRef = useRef(null);
  const fallbackSimulationStateRef = useRef({ cancelRequested: false, targetId: null });
  const abortControllerRef = useRef(null); // 스트리밍 중지를 위한 AbortController
  const [, startTransition] = useTransition();

  // 메시지 ID 생성 함수 (보안 컨텍스트 및 구형 브라우저 호환성 보장)
  const createMessageId = useCallback(() => {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    // http 환경 또는 구형 브라우저를 위한 폴백
    return `fallback-id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  const ensureUniqueMessageIds = useCallback((candidateMessages) => {
    const seen = new Set();
    return candidateMessages.map((message) => {
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
  }, [createMessageId]);

  const storageKey = useMemo(() => `rag-chat-history-${projectId}`, [projectId]);

  const buildConversationHistory = useCallback((sourceMessages) => {
    if (!Array.isArray(sourceMessages) || sourceMessages.length === 0) {
      return [];
    }

    const allowedRoles = new Set(['user', 'assistant', 'system']);
    // Only keep meaningful messages so the backend receives a concise history
    const sanitizedHistory = sourceMessages.filter((message) => {
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
  }, []);

  const mapPersistedMessages = useCallback(
    (persisted = []) => (
      Array.isArray(persisted)
        ? persisted.map((item) => ({
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
        : []
    ),
    [createMessageId]
  );

  const loadSessionMessages = useCallback(() => {
    try {
      const savedMessages = sessionStorage.getItem(storageKey);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
          const messagesWithNewIds = parsed.map(message => ({
            ...message,
            id: createMessageId(),
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
  }, [storageKey, createMessageId]);

  const handlePersistToggle = useCallback((event) => {
    const nextValue = event.target.checked;
    setPersistConversation(nextValue);
    if (!nextValue) {
      selectThread(null);
      setSelectedCategoryIds([]);
      loadSessionMessages();
    } else if (projectId) {
      listChatCategories(projectId).catch(() => {});
      listChatThreads(projectId).catch(() => {});
    }
  }, [setPersistConversation, selectThread, loadSessionMessages, projectId, listChatCategories, listChatThreads]);

  const handleThreadChange = useCallback(async (event) => {
    const nextThreadId = event.target.value || null;
    selectThread(nextThreadId);
    if (nextThreadId) {
      setSelectedCategoryIds([]);
      try {
        await fetchThreadMessages(nextThreadId);
      } catch (threadError) {
        // console.error('채팅 스레드 메시지 로드 실패:', threadError);
      }
    } else {
      loadSessionMessages();
    }
  }, [selectThread, fetchThreadMessages, loadSessionMessages]);

  // Conversation Thread 링크는 비활성화되어 더 이상 사용되지 않음
  // 스레드 제목만 표시용으로 사용됨

  const handleCategoryChange = useCallback((event) => {
    const { value } = event.target;
    setSelectedCategoryIds(typeof value === 'string' ? value.split(',') : value);
  }, []);

  const isUserNearBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return true;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD;
  }, []);


  const scrollToBottom = useCallback((behavior = 'smooth', { force = false } = {}) => {
    if (!force) {
      if (!shouldAutoScrollRef.current) {
        return;
      }
      if (!isUserNearBottom()) {
        shouldAutoScrollRef.current = false;
        return;
      }
    }
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, [isUserNearBottom]);


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
  }, [fetchThreadMessages, mapPersistedMessages, scrollToBottom]);


  const handleOpenThreadDialog = useCallback(() => {
    setIsThreadDialogOpen(true);
  }, []);

  const handleCloseThreadDialog = useCallback(() => {
    if (isSavingThread) return;
    setIsThreadDialogOpen(false);
    setNewThreadTitle('');
    setNewThreadDescription('');
  }, [isSavingThread]);

  const handleCreateThread = useCallback(async () => {
    if (!projectId) return;
    const trimmedTitle = newThreadTitle.trim();
    if (!trimmedTitle) {
      setError(t('rag.chat.threadTitleRequired', '스레드 제목을 입력해주세요.'));
      return;
    }

    setIsSavingThread(true);
    try {
      const created = await createChatThread({
        projectId,
        title: trimmedTitle,
        description: newThreadDescription.trim() || undefined,
        categoryIds: selectedCategoryIds,
      });

      await listChatThreads(projectId);

      if (created?.id) {
        selectThread(created.id);
        setSelectedCategoryIds(created?.categories?.map((category) => category.id) || []);
        await fetchThreadMessages(created.id);
      }

      setIsThreadDialogOpen(false);
      setNewThreadTitle('');
      setNewThreadDescription('');
    } catch (createError) {
      // console.error('채팅 스레드 생성 실패:', createError);
      setError(createError.response?.data?.message || t('rag.chat.threadCreateFailed', '스레드를 생성하지 못했습니다.'));
    } finally {
      setIsSavingThread(false);
    }
  }, [projectId, newThreadTitle, newThreadDescription, selectedCategoryIds, createChatThread, listChatThreads, selectThread, fetchThreadMessages, t, setError]);

  const handleOpenThreadManager = useCallback(() => {
    if (projectId) {
      listChatThreads(projectId).catch(() => {});
    }
    setIsThreadManagerOpen(true);
  }, [projectId, listChatThreads]);

  const handleCloseThreadManager = useCallback(() => {
    setIsThreadManagerOpen(false);
  }, []);

  const handleManageThreadUpdate = useCallback(async (payload) => {
    const result = await updateChatThread(payload);
    if (projectId) {
      listChatThreads(projectId).catch(() => {});
    }
    return result;
  }, [updateChatThread, listChatThreads, projectId]);

  const handleManageThreadDelete = useCallback(async (threadId) => {
    await deleteChatThread(threadId);
    if (projectId) {
      await listChatThreads(projectId);
    }
    if (selectedThreadId === threadId) {
      selectThread(null);
      setMessages([]);
      setSelectedCategoryIds([]);
    }
  }, [deleteChatThread, listChatThreads, projectId, selectedThreadId, selectThread, setSelectedCategoryIds]);

  const handleOpenDeleteThreadDialog = useCallback(() => {
    if (!selectedThreadId) return;
    setIsDeleteDialogOpen(true);
  }, [selectedThreadId]);

  const handleCloseDeleteThreadDialog = useCallback(() => {
    if (isDeletingThread) return;
    setIsDeleteDialogOpen(false);
  }, [isDeletingThread]);

  const handleConfirmDeleteThread = useCallback(async () => {
    if (!selectedThreadId) return;
    setIsDeletingThread(true);
    try {
      await handleManageThreadDelete(selectedThreadId);
      setIsDeleteDialogOpen(false);
    } catch (deleteError) {
      // console.error('채팅 스레드 삭제 실패:', deleteError);
      setError(deleteError.response?.data?.message || t('rag.chat.threadDeleteFailed', '스레드를 삭제하지 못했습니다.'));
    } finally {
      setIsDeletingThread(false);
    }
  }, [selectedThreadId, handleManageThreadDelete, t, setError]);

  const handleEditRequest = useCallback((message) => {
    setIsDeletingMessage(false);
    setIsDeleteMessageConfirmOpen(false);
    setEditDialog({ open: true, message, content: message.content || '' });
  }, []);

  const handleEditClose = useCallback(() => {
    if (isDeletingMessage) return;
    setEditDialog({ open: false, message: null, content: '' });
    setIsDeleteMessageConfirmOpen(false);
  }, [isDeletingMessage]);

  const handleEditContentChange = useCallback((event) => {
    setEditDialog((prev) => ({ ...prev, content: event.target.value }));
  }, []);

  const handleEditSubmit = useCallback(async () => {
    if (!editDialog.message?.persistedId || isDeletingMessage) {
      return;
    }
    try {
      await editChatMessage({
        messageId: editDialog.message.persistedId,
        content: editDialog.content.trim(),
        metadata: editDialog.message.metadata || {},
      });
      setEditDialog({ open: false, message: null, content: '' });
      if (selectedThreadId) {
        await refreshPersistedConversation(selectedThreadId);
      }
    } catch (editError) {
      // console.error('채팅 메시지 편집 실패:', editError);
      setError(editError.response?.data?.message || t('rag.chat.editFailed', '메시지를 수정하지 못했습니다.'));
    }
  }, [editDialog, editChatMessage, selectedThreadId, refreshPersistedConversation, t, setError, isDeletingMessage]);

  const handleOpenDeleteMessageConfirm = useCallback(() => {
    if (!editDialog.message?.persistedId || isDeletingMessage) {
      return;
    }
    setIsDeleteMessageConfirmOpen(true);
  }, [editDialog, isDeletingMessage]);

  const handleCloseDeleteMessageConfirm = useCallback(() => {
    if (isDeletingMessage) return;
    setIsDeleteMessageConfirmOpen(false);
  }, [isDeletingMessage]);

  const handleDeleteMessage = useCallback(async () => {
    const targetId = editDialog.message?.persistedId;
    if (!targetId || isDeletingMessage) {
      return;
    }
    setIsDeletingMessage(true);
    try {
      await deleteChatMessage(targetId);
      setIsDeleteMessageConfirmOpen(false);
      setEditDialog({ open: false, message: null, content: '' });
      if (selectedThreadId) {
        await refreshPersistedConversation(selectedThreadId);
      }
    } catch (deleteError) {
      // console.error('채팅 메시지 삭제 실패:', deleteError);
      setError(deleteError.response?.data?.message || t('rag.chat.messageDeleteFailed', '메시지를 삭제하지 못했습니다.'));
    } finally {
      setIsDeletingMessage(false);
    }
  }, [editDialog, deleteChatMessage, selectedThreadId, refreshPersistedConversation, t, setError, isDeletingMessage]);

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
          listChatThreads(projectId).catch(() => {});
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
  }, [projectId, selectThread, listChatThreads, refreshPersistedConversation, createMessageId, ensureUniqueMessageIds, setSelectedCategoryIds]);

  // 세션 스토리지 키
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
      shouldAutoScrollRef.current = distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD;
    }
  }, [isStreaming]);

  useEffect(() => {
    // 스트리밍 중에는 이 effect를 실행하지 않습니다.
    // 스트리밍 중 스크롤은 flushStreamingBuffer에서 'auto'로 처리하여 부자연스러운 움직임을 방지합니다.
    if (isStreaming) {
      return;
    }

    // 메시지가 변경될 때마다 스크롤을 하단으로 이동
    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom, isStreaming]);

  // LLM 설정 가용성 체크
  useEffect(() => {
    if (checkLlmAvailability) {
      checkLlmAvailability();
    }
  }, [checkLlmAvailability]);

  useEffect(() => {
    if (!projectId || !persistConversation) {
      return;
    }
    listChatCategories(projectId).catch(() => {});
    listChatThreads(projectId).catch(() => {});
  }, [projectId, persistConversation, listChatCategories, listChatThreads]);

  useEffect(() => {
    if (!persistConversation || !selectedThreadId) {
      return;
    }
    if (!threadMessages[selectedThreadId]) {
      fetchThreadMessages(selectedThreadId).catch(() => {});
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
  }, [persistConversation, selectedThreadId, threadMessages, mapPersistedMessages]);

  useEffect(() => {
    if (!persistConversation) {
      setSelectedCategoryIds([]);
      return;
    }
    if (selectedThreadId) {
      const thread = threads.find((item) => item.id === selectedThreadId);
      setSelectedCategoryIds(thread?.categories?.map((category) => category.id) || []);
    }
  }, [persistConversation, selectedThreadId, threads]);

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
  }, [startTransition]);

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
  }, [scrollToBottom, updateStreamingMessage]);

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
      setIsLoading(false);
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
        setIsLoading(false);
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
    setIsLoading,
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
    setIsLoading(false);

    // console.log('✋ 사용자가 스트리밍을 중지했습니다');
  }, [clearStreamingScheduler, clearFallbackSimulation, updateStreamingMessage, resetStreamingBuffer]);

  // 메시지 전송 핸들러
  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading) return;

    const shouldPersist = persistConversation;
    const resolvedThreadId = shouldPersist ? selectedThreadId : null;
    const resolvedCategoryIds = shouldPersist && !resolvedThreadId ? selectedCategoryIds : undefined;

    const conversationHistory = buildConversationHistory(messages);
    const wasNearBottom = isUserNearBottom();
    shouldAutoScrollRef.current = shouldAutoScrollRef.current && wasNearBottom;

    clearFallbackSimulation();

    const timestamp = Date.now();

    // 파일리스트 요청 감지
    const fileListKeywords = [
      '파일리스트', '파일 리스트', '파일 목록', '파일목록',
      '문서리스트', '문서 리스트', '문서 목록', '문서목록',
      'file list', 'filelist', 'document list', 'documentlist',
      '파일을 보여', '파일 보여', '문서를 보여', '문서 보여',
      '업로드된 파일', '업로드 파일', '업로드된 문서', '업로드 문서'
    ];
    const isFileListRequest = fileListKeywords.some(keyword =>
      trimmedInput.toLowerCase().includes(keyword.toLowerCase())
    );

    // 파일리스트 요청인 경우 즉시 처리
    if (isFileListRequest) {
      try {
        const response = await listDocuments(projectId, 1, 100);
        const allDocuments = response.documents || [];

        // 테스트케이스 파일 필터링 (제외)
        const testCaseKeywords = ['testcase', '테스트케이스', '테스트 케이스', 'test case', 'test-case'];
        const documents = allDocuments.filter(doc => {
          const fileName = (doc.fileName || '').toLowerCase();
          const description = (doc.description || '').toLowerCase();
          const fileType = (doc.fileType || '').toLowerCase();

          // 파일명, 설명, 파일타입에 테스트케이스 관련 키워드가 없는 것만 포함
          return !testCaseKeywords.some(keyword =>
            fileName.includes(keyword) ||
            description.includes(keyword) ||
            fileType.includes(keyword)
          );
        });

        let fileListMessage = '';
        if (documents.length === 0) {
          fileListMessage = '📂 **현재 업로드된 문서가 없습니다.**\n\n문서를 업로드하시려면 "문서 관리" 탭을 이용해주세요.';
        } else {
          fileListMessage = `📂 **업로드된 RAG 문서 목록** (총 ${documents.length}개)\n\n`;
          documents.forEach((doc, index) => {
            const uploadDate = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('ko-KR') : '알 수 없음';
            const fileSize = doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : '알 수 없음';
            fileListMessage += `${index + 1}. **${doc.fileName}**\n`;
            fileListMessage += `   - 파일 타입: ${doc.fileType || '알 수 없음'}\n`;
            fileListMessage += `   - 파일 크기: ${fileSize}\n`;
            fileListMessage += `   - 업로드 날짜: ${uploadDate}\n`;
            fileListMessage += `   - 업로더: ${doc.uploadedBy || '알 수 없음'}\n`;
            if (doc.description) {
              fileListMessage += `   - 설명: ${doc.description}\n`;
            }
            fileListMessage += '\n';
          });
        }

        const assistantMessage = {
          id: createMessageId(),
          role: 'assistant',
          content: fileListMessage,
          timestamp: Date.now(),
          documents: [],
        };

        setMessages((prev) => ensureUniqueMessageIds([...prev, assistantMessage]));
        setIsLoading(false);
        return;
      } catch (error) {
        // console.error('문서 목록 조회 실패:', error);
        setError(error.response?.data?.message || '문서 목록을 불러오는데 실패했습니다.');
        setIsLoading(false);
        return;
      }
    }

    // 테스트 케이스 생성 요청 감지
    const testCaseKeywords = ['테스트 케이스', '테스트케이스', 'test case', 'testcase', '테스트 시나리오'];
    const isTestCaseRequest = testCaseKeywords.some(keyword =>
      trimmedInput.toLowerCase().includes(keyword.toLowerCase())
    );

    // console.log('🔍 [RAG] 테스트 케이스 요청 감지:', isTestCaseRequest);
    // console.log('🔍 [RAG] currentLlmConfig:', currentLlmConfig);
    // console.log('🔍 [RAG] testCaseTemplate 존재:', !!currentLlmConfig?.testCaseTemplate);
    if (currentLlmConfig?.testCaseTemplate) {
      // console.log('🔍 [RAG] testCaseTemplate 내용:', currentLlmConfig.testCaseTemplate);
    }

    // API 호출용 메시지 (템플릿 포함)
    let messageContentForAPI = trimmedInput;
    if (isTestCaseRequest && currentLlmConfig?.testCaseTemplate) {
      messageContentForAPI = `${trimmedInput}\n\n다음 JSON 형식을 참고하여 테스트 케이스를 생성해주세요:\n\`\`\`json\n${currentLlmConfig.testCaseTemplate}\n\`\`\``;
      // console.log('✅ [RAG] 템플릿이 메시지에 포함되었습니다');
      // console.log('🔍 [RAG] 전송할 메시지 길이:', messageContentForAPI.length);
    } else {
      // console.log('⚠️ [RAG] 템플릿이 포함되지 않았습니다');
      if (isTestCaseRequest && !currentLlmConfig?.testCaseTemplate) {
        // console.log('⚠️ [RAG] 이유: 템플릿이 없음');
      }
    }

    // 화면 표시용 메시지 (원본 입력만)
    const userMessage = {
      id: createMessageId(),
      role: 'user',
      content: trimmedInput,  // 원본만 표시
      timestamp,
    };

    // console.log('🔍 [RAG] userMessage.content 길이:', userMessage.content.length);
    // console.log('🔍 [RAG] userMessage.content:', userMessage.content.substring(0, 100));
    // console.log('🔍 [RAG] messageContentForAPI 길이:', messageContentForAPI.length);

    setMessages((prev) => ensureUniqueMessageIds([...prev, userMessage]));
    setInputText('');
    setIsLoading(true);
    setIsStreaming(false);
    setError(null);

    // 메시지 전송 후 입력 필드에 다시 포커스하여 포커스가 다른 곳으로 이동하는 것을 방지합니다.
    if (inputRef.current) {
      inputRef.current.focus();
    }

    const chatOptions = {
      conversationHistory,
      persistConversation: shouldPersist,
      useRagSearch, // RAG 검색 사용 여부 전달
    };

    // 선택된 LLM 설정 ID 추가
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
      // 스트리밍 응답 사용 (chatStream 함수가 있을 경우)
      if (chatStream && !shouldPersist) {
        // AbortController 생성
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

        // 스트리밍 처리 (SSE 또는 fetch stream)
        await chatStream(
          projectId,
          messageContentForAPI,  // 템플릿 포함된 메시지 사용
          (chunk) => {
            // 청크 데이터 처리 (chunk는 plain text string)
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
            // 스트리밍 완료
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
            // console.warn('스트리밍 채팅 오류 발생:', streamError);
            clearStreamingScheduler();
            resetStreamingBuffer();
          },
          {
            ...chatOptions,
            // AbortSignal 전달
            signal: abortController.signal,
            // 컨텍스트 정보 수신 콜백
            onContext: (contexts) => {
              clearStreamingScheduler(true);
              updateStreamingMessage((current) => ({
                ...current,
                documents: Array.isArray(contexts) ? contexts : [],
              }));
            },
          }
        );
        return;
      } else {
        // 일반 응답 처리 (chat 함수 사용)
        const response = await chat(projectId, messageContentForAPI, chatOptions);  // 템플릿 포함된 메시지 사용

        if (shouldPersist) {
          await handleChatResult(response, { shouldPersist, resolvedThreadId, userMessageId: userMessage.id });
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
        return;
      }
    } catch (error) {
      // AbortError는 사용자가 의도적으로 중지한 것이므로 에러 처리하지 않음
      if (error.name === 'AbortError') {
        // console.log('스트리밍이 사용자에 의해 중지되었습니다');
        abortControllerRef.current = null;
        return;
      }

      clearStreamingScheduler();
      resetStreamingBuffer();

      const activeStreamingId = streamingMessageIdRef.current;

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

      if (shouldFallback()) {
        // console.warn('스트리밍 응답 실패, 일반 채팅으로 폴백 시도:', error);
        try {
          const response = await chat(projectId, messageContentForAPI, chatOptions);  // 템플릿 포함된 메시지 사용
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
          await handleChatResult(response, { shouldPersist: false, resolvedThreadId: null, userMessageId: userMessage.id });
          setIsLoading(false);
          setIsStreaming(false);
          return;
        } catch (fallbackError) {
          // console.error('메시지 전송 실패 (fallback):', fallbackError);
          if (activeStreamingId) {
            updateStreamingMessage(() => null);
            if (streamingMessageIdRef.current === activeStreamingId) {
              streamingMessageIdRef.current = null;
            }
          }
          setIsStreaming(false);
          setIsLoading(false);
          setError(fallbackError.message || '메시지 전송에 실패했습니다.');
          return;
        }
      }

      if (activeStreamingId) {
        updateStreamingMessage(() => null);
        if (streamingMessageIdRef.current === activeStreamingId) {
          streamingMessageIdRef.current = null;
        }
      }

      setIsStreaming(false);
      setIsLoading(false);
      // console.error('메시지 전송 실패:', error);
      setError(error.message || '메시지 전송에 실패했습니다.');
    }
  }, [
    inputText,
    isLoading,
    projectId,
    chat,
    chatStream,
    createMessageId,
    clearFallbackSimulation,
    clearStreamingScheduler,
    ensureUniqueMessageIds,
    resetStreamingBuffer,
    scheduleStreamingFlush,
    scrollToBottom,
    simulateFallbackStreaming,
    updateStreamingMessage,
    isUserNearBottom,
    messages,
    buildConversationHistory,
    persistConversation,
    selectedThreadId,
    selectedCategoryIds,
    handleChatResult,
    useRagSearch,
    currentLlmConfig,
    listDocuments,
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
  }, [clearStreamingScheduler, clearFallbackSimulation, resetStreamingBuffer, storageKey]);

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
  }, [clearFallbackSimulation, clearStreamingScheduler, messages, resetStreamingBuffer]);

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

    // LLM 설정이 있는 경우 정상 렌더링
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" component="h2">
              {t('rag.chat.title', 'AI 질의응답')}
            </Typography>
            {activeLlmConfigs.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={selectedLlmConfigId || defaultLlmConfig?.id || ''}
                  onChange={(e) => setSelectedLlmConfigId(e.target.value)}
                  displayEmpty
                  sx={{
                    '& .MuiSelect-select': {
                      py: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    },
                  }}
                >
                  {activeLlmConfigs.map((config) => (
                    <MenuItem key={config.id} value={config.id}>
                      <Chip
                        label={`${config.provider} / ${config.modelName}`}
                        size="small"
                        color={
                          config.provider === 'OPENAI'
                            ? 'primary'
                            : config.provider === 'OLLAMA'
                            ? 'success'
                            : config.provider === 'PERPLEXITY'
                            ? 'warning'
                            : 'secondary'
                        }
                        sx={{ fontWeight: 'medium' }}
                      />
                      {config.isDefault && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          (기본)
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip
            title={
              isFullScreenMode
                ? t('rag.chat.exitFullScreen', '전체화면 종료')
                : t('rag.chat.enterFullScreen', '전체화면 보기')
            }
          >
            <IconButton
              color="inherit"
              size="small"
              onClick={isFullScreenMode ? handleExitFullScreen : handleEnterFullScreen}
            >
              {isFullScreenMode ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title={t('rag.chat.retry', '재시도')}>
            <span style={{ display: 'flex' }}>
              <IconButton
                color="inherit"
                size="small"
                onClick={handleRetry}
                disabled={messages.length < 2 || isLoading}
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('rag.chat.clear', '대화 초기화')}>
            <span style={{ display: 'flex' }}>
              <IconButton
                color="inherit"
                size="small"
                onClick={handleClearChat}
                disabled={messages.length === 0 || isLoading || Boolean(persistConversation && selectedThreadId)}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <FormControlLabel
            control={(
              <Switch
                checked={persistConversation}
                onChange={handlePersistToggle}
                color="primary"
              />
            )}
            label={<Typography variant="body1">{t('rag.chat.persistToggle', '대화 자동 저장')}</Typography>}
          />
          <FormControlLabel
            control={(
              <Switch
                checked={useRagSearch}
                onChange={(e) => setUseRagSearch(e.target.checked)}
                color="primary"
              />
            )}
            label={<Typography variant="body1">{t('rag.chat.useRagSearch', 'RAG 문서 우선 검색')}</Typography>}
          />
          {persistConversation && (
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', md: 'center' }}
              sx={{ width: '100%' }}
            >
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel id="rag-thread-select-label">
                  {t('rag.chat.threadSelectLabel', '저장된 스레드')}
                </InputLabel>
                <Select
                  labelId="rag-thread-select-label"
                  value={selectedThreadId || ''}
                  label={t('rag.chat.threadSelectLabel', '저장된 스레드')}
                  onChange={handleThreadChange}
                  disabled={threadLoading}
                >
                  <MenuItem value="">
                    {t('rag.chat.threadAutoOption', '새 스레드 자동 생성')}
                  </MenuItem>
                  {threads.map((thread) => (
                    <MenuItem key={thread.id} value={thread.id}>
                      {thread.title || t('rag.chat.untitledThread', '제목 없는 스레드')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title={t('rag.chat.refreshThreads', '스레드 새로 고침')}>
                <span>
                  <IconButton
                    size="small"
                    onClick={() => projectId && listChatThreads(projectId)}
                    disabled={threadLoading}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              {selectedThreadId && (
                <Tooltip title={t('rag.chat.deleteThread', '스레드 삭제')}>
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={handleOpenDeleteThreadDialog}
                      disabled={isDeletingThread}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenThreadDialog}
              >
                {t('rag.chat.createThread', '새 스레드')}
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={handleOpenThreadManager}
              >
                {t('rag.chat.manageThreadsAction', '스레드 관리')}
              </Button>
            </Stack>
          )}
        </Stack>

        {persistConversation && !selectedThreadId && categories.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="rag-category-select-label">
              {t('rag.chat.categorySelectLabel', '카테고리')}
            </InputLabel>
            <Select
              multiple
              labelId="rag-category-select-label"
              value={selectedCategoryIds}
              onChange={handleCategoryChange}
              label={t('rag.chat.categorySelectLabel', '카테고리')}
              renderValue={(selected) => (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {selected.map((id) => {
                    const category = categories.find((item) => item.id === id);
                    return (
                      <Chip
                        key={id}
                        size="small"
                        label={category?.name || id}
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    );
                  })}
                </Stack>
              )}
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  <Checkbox size="small" checked={selectedCategoryIds.indexOf(category.id) > -1} />
                  <ListItemText primary={category.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {persistConversation && selectedThreadId && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {threads
              .find((thread) => thread.id === selectedThreadId)?.categories
              ?.map((category) => (
                <Chip key={category.id} size="small" label={category.name} sx={{ mb: 0.5 }} />
              ))}
          </Stack>
        )}
      </Box>

      {/* Messages Container */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: 'grey.50',
        }}
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
      >
        {messages.length === 0 && !isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              {t('rag.chat.empty', '문서에 대해 질문해보세요.')}
            </Typography>
          </Box>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            projectId={projectId}
            onDocumentClick={onDocumentClick}
            onEdit={persistConversation ? handleEditRequest : undefined}
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && !isStreaming && (
          <Paper elevation={2} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, my: 2, mx: 'auto', maxWidth: 'fit-content', borderRadius: 3 }}>
            <CircularProgress size={40} />
            <Typography variant="body1" color="text.secondary" fontWeight="medium">
              {t('rag.chat.generatingAnswer', 'AI가 답변을 생성하고 있습니다...')}
            </Typography>
          </Paper>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            ref={inputRef}
            fullWidth
            multiline
            maxRows={isFullScreenMode ? 8 : 4}
            variant="outlined"
            placeholder={t('rag.chat.placeholder', '메시지를 입력하세요...')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            size="small"
          />
          {isStreaming ? (
            <Tooltip title={t('rag.chat.stopStreaming', '전송 중지')}>
              <IconButton
                color="error"
                onClick={handleStopStreaming}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                }}
              >
                <StopIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'action.disabledBackground',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {t('rag.chat.hint', 'Shift + Enter: 줄바꿈 | Enter: 전송')}
        </Typography>
      </Box>
    </Box>
    );
  }, [
    llmAvailable,
    llmCheckLoading,
    checkLlmAvailability,
    t,
    handleRetry,
    handleClearChat,
    handleEnterFullScreen,
    handleExitFullScreen,
    handleKeyDown,
    handleCompositionEnd,
    handleCompositionStart,
    handleSendMessage,
    handleMessagesScroll,
    handlePersistToggle,
    handleThreadChange,
    handleOpenThreadDialog,
    handleOpenThreadManager,
    handleOpenDeleteThreadDialog,
    handleCategoryChange,
    handleEditRequest,
    inputText,
    isChatFullScreen,
    isLoading,
    isStreaming,
    messages,
    projectId,
    onDocumentClick,
    persistConversation,
    threads,
    categories,
    selectedThreadId,
    selectedCategoryIds,
    threadLoading,
    error,
    t,
    isComposing,
    listChatThreads,
    isDeletingThread,
  ]);

  return (
    <>
      <Paper elevation={2} sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
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

      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteThreadDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t('rag.chat.deleteThread', '스레드 삭제')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {t('rag.chat.deleteThreadConfirm', '현재 스레드를 삭제하시겠습니까? 대화 내용이 모두 삭제됩니다.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteThreadDialog} disabled={isDeletingThread}>
            {t('common.cancel', '취소')}
          </Button>
          <Button
            onClick={handleConfirmDeleteThread}
            color="error"
            variant="contained"
            disabled={isDeletingThread}
          >
            {isDeletingThread ? <CircularProgress size={18} /> : t('common.delete', '삭제')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isThreadDialogOpen}
        onClose={handleCloseThreadDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('rag.chat.createThread', '새 스레드')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={t('rag.chat.threadTitleLabel', '제목')}
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            autoFocus
            fullWidth
          />
          <TextField
            label={t('rag.chat.threadDescriptionLabel', '설명 (선택)')}
            value={newThreadDescription}
            onChange={(e) => setNewThreadDescription(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          {categories.length > 0 && (
            <FormControl size="small" fullWidth>
              <InputLabel id="rag-thread-dialog-category-label">
                {t('rag.chat.categorySelectLabel', '카테고리')}
              </InputLabel>
              <Select
                multiple
                labelId="rag-thread-dialog-category-label"
                value={selectedCategoryIds}
                onChange={handleCategoryChange}
                label={t('rag.chat.categorySelectLabel', '카테고리')}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {selected.map((id) => {
                      const category = categories.find((item) => item.id === id);
                      return (
                        <Chip key={id} size="small" label={category?.name || id} sx={{ mr: 0.5, mb: 0.5 }} />
                      );
                    })}
                  </Stack>
                )}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    <Checkbox size="small" checked={selectedCategoryIds.indexOf(category.id) > -1} />
                    <ListItemText primary={category.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseThreadDialog} disabled={isSavingThread}>
            {t('common.cancel', '취소')}
          </Button>
          <Button onClick={handleCreateThread} variant="contained" disabled={isSavingThread}>
            {isSavingThread ? <CircularProgress size={18} /> : t('rag.chat.threadCreateAction', '생성')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialog.open}
        onClose={handleEditClose}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t('rag.chat.editResponse', '응답 편집')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={6}
            value={editDialog.content}
            onChange={handleEditContentChange}
            placeholder={t('rag.chat.editPlaceholder', '수정할 답변 내용을 입력하세요.')}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button
            color="error"
            onClick={handleOpenDeleteMessageConfirm}
            disabled={!editDialog.message?.persistedId || isDeletingMessage}
          >
            {t('common.delete', '삭제')}
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleEditClose} disabled={isDeletingMessage}>
              {t('common.cancel', '취소')}
            </Button>
            <Button
              onClick={handleEditSubmit}
              variant="contained"
              disabled={!editDialog.content.trim() || isDeletingMessage}
            >
              {t('common.save', '저장')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeleteMessageConfirmOpen}
        onClose={handleCloseDeleteMessageConfirm}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{t('rag.chat.deleteMessageTitle', '응답 삭제')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {t('rag.chat.deleteMessageConfirm', '이 응답을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteMessageConfirm} disabled={isDeletingMessage}>
            {t('common.cancel', '취소')}
          </Button>
          <Button
            onClick={handleDeleteMessage}
            color="error"
            variant="contained"
            disabled={isDeletingMessage}
          >
            {isDeletingMessage ? <CircularProgress size={18} /> : t('common.delete', '삭제')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen
        open={isChatFullScreen}
        onClose={handleExitFullScreen}
        PaperProps={{
          sx: {
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
          },
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
