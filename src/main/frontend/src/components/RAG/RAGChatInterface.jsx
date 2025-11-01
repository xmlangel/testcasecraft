// src/components/RAG/RAGChatInterface.jsx
import React, { useState, useEffect, useRef, useCallback, useTransition } from 'react';
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
} from '@mui/material';
import {
  Send as SendIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material';
import ChatMessage from './ChatMessage.jsx';
import { useRAG } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';

/**
 * RAG 채팅 인터페이스 컴포넌트
 * LLM과의 질의응답 채팅을 제공합니다.
 */
function RAGChatInterface({ projectId, onDocumentClick }) {
  const { t } = useI18n();
  const { chat, chatStream } = useRAG();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [isChatFullScreen, setIsChatFullScreen] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const streamingMessageIdRef = useRef(null);
  const streamingBufferRef = useRef({ messageId: null, pending: '' });
  const streamingFlushHandleRef = useRef({ id: null, type: null });
  const [, startTransition] = useTransition();

  // 메시지 ID 생성 함수
  const createMessageId = useCallback(() => crypto.randomUUID(), []);

  // 세션 스토리지 키
  const storageKey = `rag-chat-history-${projectId}`;

  // 컴포넌트 마운트 시 세션 스토리지에서 대화 히스토리 로드
  useEffect(() => {
    try {
      const savedMessages = sessionStorage.getItem(storageKey);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
          // Force-assign new IDs to all loaded messages to guarantee uniqueness from storage
          const messagesWithNewIds = parsed.map(message => ({
            ...message,
            id: createMessageId(),
            documents: message.documents || [],
          }));
          setMessages(messagesWithNewIds);
        }
      }
    } catch (error) {
      console.error('대화 히스토리 로드 실패:', error);
    }
  }, [storageKey, createMessageId]);

  // 메시지 변경 시 세션 스토리지에 저장
  useEffect(() => {
    if (isStreaming) {
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
      console.error('대화 히스토리 저장 실패:', error);
    }
  }, [messages, storageKey, isStreaming]);

  // 메시지 스크롤 자동 하단 이동
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (!shouldAutoScrollRef.current) {
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const threshold = 80;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    shouldAutoScrollRef.current = distanceFromBottom <= threshold;
  }, []);

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages, scrollToBottom]);

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
      scrollToBottom('auto');
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

  useEffect(() => {
    return () => {
      clearStreamingScheduler();
      streamingBufferRef.current = { messageId: null, pending: '' };
    };
  }, [clearStreamingScheduler]);

  const resetStreamingBuffer = useCallback(() => {
    streamingBufferRef.current = { messageId: null, pending: '' };
  }, []);

  // 메시지 전송 핸들러
  const handleSendMessage = useCallback(async () => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading) return;

    const timestamp = Date.now();
    const userMessage = {
      id: createMessageId(),
      role: 'user',
      content: trimmedInput,
      timestamp,
    };

    shouldAutoScrollRef.current = true;
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsStreaming(false);
    setError(null);

    try {
      // 스트리밍 응답 사용 (chatStream 함수가 있을 경우)
      if (chatStream) {
        const assistantMessageId = createMessageId();
        const assistantMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          documents: [],
        };

        streamingMessageIdRef.current = assistantMessageId;
        streamingBufferRef.current = { messageId: assistantMessageId, pending: '' };
        startTransition(() => {
          setMessages((prev) => [...prev, assistantMessage]);
        });
        setIsStreaming(true);

        // 스트리밍 처리 (SSE 또는 fetch stream)
        await chatStream(
          projectId,
          trimmedInput,
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
            console.warn('스트리밍 채팅 오류 발생:', streamError);
            clearStreamingScheduler();
            resetStreamingBuffer();
            updateStreamingMessage(() => null);
            streamingMessageIdRef.current = null;
            setIsStreaming(false);
          },
          {
            // 컨텍스트 정보 수신 콜백
            onContext: (contexts) => {
              console.log('📚 관련 문서:', contexts);
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
        const response = await chat(projectId, trimmedInput);

        const assistantMessage = {
          id: createMessageId(),
          role: 'assistant',
          content: response.answer || response.content,
          timestamp: Date.now(),
          documents: response.documents || [],
          similarity: response.similarity,
        };
        setMessages((prev) => ensureUniqueMessageIds([...prev, assistantMessage]));
        setIsLoading(false);
        return;
      }
    } catch (error) {
      clearStreamingScheduler();
      resetStreamingBuffer();
      updateStreamingMessage(() => null);
      streamingMessageIdRef.current = null;
      setIsStreaming(false);

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
        console.warn('스트리밍 응답 실패, 일반 채팅으로 폴백 시도:', error);
        try {
          const response = await chat(projectId, trimmedInput);
          const assistantMessage = {
            id: createMessageId(),
            role: 'assistant',
            content: response.answer || response.content,
            timestamp: Date.now(),
            documents: response.documents || [],
            similarity: response.similarity,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setIsLoading(false);
          return;
        } catch (fallbackError) {
          console.error('메시지 전송 실패 (fallback):', fallbackError);
          setError(fallbackError.message || '메시지 전송에 실패했습니다.');
          setIsLoading(false);
          return;
        }
      }

      console.error('메시지 전송 실패:', error);
      setError(error.message || '메시지 전송에 실패했습니다.');
      setIsLoading(false);
    }
  }, [
    inputText,
    isLoading,
    projectId,
    chat,
    chatStream,
    clearStreamingScheduler,
    resetStreamingBuffer,
    scheduleStreamingFlush,
    scrollToBottom,
    updateStreamingMessage,
  ]);

  // 엔터키 전송 핸들러
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
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
    setMessages([]);
    setIsStreaming(false);
    streamingMessageIdRef.current = null;
    shouldAutoScrollRef.current = true;
    setError(null);
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error('세션 스토리지 삭제 실패:', error);
    }
  }, [clearStreamingScheduler, resetStreamingBuffer, storageKey]);

  // 대화 다시 시작 (마지막 메시지 제거)
  const handleRetry = useCallback(() => {
    if (messages.length >= 2) {
      setMessages((prev) => prev.slice(0, -2));
    }
    setError(null);
  }, [messages]);

  const handleEnterFullScreen = useCallback(() => {
    setIsChatFullScreen(true);
  }, []);

  const handleExitFullScreen = useCallback(() => {
    setIsChatFullScreen(false);
  }, []);

  const renderChatLayout = useCallback((isFullScreenMode = false) => (
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
        <Typography variant="h6" component="h2">
          {t('rag.chat.title', 'AI 질의응답')}
        </Typography>
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
                disabled={messages.length === 0 || isLoading}
              >
                <DeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Divider />

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
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && !isStreaming && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
          </Box>
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
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading || isStreaming}
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
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {t('rag.chat.hint', 'Shift + Enter: 줄바꿈 | Enter: 전송')}
        </Typography>
      </Box>
    </Box>
  ), [
    handleRetry,
    handleClearChat,
    handleEnterFullScreen,
    handleExitFullScreen,
    handleKeyDown,
    handleCompositionEnd,
    handleCompositionStart,
    handleSendMessage,
    handleMessagesScroll,
    inputText,
    isChatFullScreen,
    isLoading,
    isStreaming,
    messages,
    projectId,
    onDocumentClick,
    error,
    t,
    isComposing,
  ]);

  return (
    <>
      <Paper elevation={2} sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        {renderChatLayout()}
      </Paper>

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
