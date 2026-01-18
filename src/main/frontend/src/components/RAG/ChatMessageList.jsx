// src/components/RAG/ChatMessageList.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Paper,
    CircularProgress,
    Alert,
    Typography,
} from '@mui/material';
import ChatMessage from './ChatMessage.jsx';
import { useI18n } from '../../context/I18nContext.jsx';

/**
 * 메시지 목록 렌더링
 * - 메시지 목록 표시
 * - 로딩 인디케이터
 * - 에러 알림
 * - 빈 상태 표시
 */
function ChatMessageList({
    messages,
    projectId,
    onDocumentClick,
    onEdit,
    isLoading,
    isStreaming,
    error,
    onErrorClose,
    messagesContainerRef,
    messagesEndRef,
    onScroll,
    persistConversation,
}) {
    const { t } = useI18n();

    return (
        <Box
            sx={{
                flex: 1,
                minHeight: 0, // Flex item이 최소 크기보다 작아질 수 있도록 허용
                overflowY: 'auto',
                p: 2,
                bgcolor: (theme) => theme.palette.mode === 'dark' ? theme.palette.background.default : 'grey.50',
            }}
            ref={messagesContainerRef}
            onScroll={onScroll}
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
                    onEdit={persistConversation ? onEdit : undefined}
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
                <Alert severity="error" sx={{ mt: 2 }} onClose={onErrorClose}>
                    {error}
                </Alert>
            )}

            <div ref={messagesEndRef} />
        </Box>
    );
}

ChatMessageList.propTypes = {
    messages: PropTypes.array.isRequired,
    projectId: PropTypes.string.isRequired,
    onDocumentClick: PropTypes.func,
    onEdit: PropTypes.func,
    isLoading: PropTypes.bool.isRequired,
    isStreaming: PropTypes.bool.isRequired,
    error: PropTypes.string,
    onErrorClose: PropTypes.func.isRequired,
    messagesContainerRef: PropTypes.object.isRequired,
    messagesEndRef: PropTypes.object.isRequired,
    onScroll: PropTypes.func.isRequired,
    persistConversation: PropTypes.bool.isRequired,
};

export default ChatMessageList;
