// src/components/RAG/ChatInput.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    TextField,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Send as SendIcon,
    Stop as StopIcon,
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext.jsx';

/**
 * 메시지 입력 영역
 * - 입력 필드
 * - 전송/중지 버튼
 * - 키보드 단축키 처리
 */
function ChatInput({
    inputText,
    onInputChange,
    onKeyDown,
    onCompositionStart,
    onCompositionEnd,
    onSend,
    isLoading,
    isStreaming,
    onStopStreaming,
    isFullScreen,
    inputRef,
}) {
    const { t } = useI18n();

    return (
        <Box sx={{ p: 2, bgcolor: 'background.paper', flexShrink: 0 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                    ref={inputRef}
                    fullWidth
                    multiline
                    maxRows={isFullScreen ? 8 : 4}
                    variant="outlined"
                    placeholder={t('rag.chat.placeholder', '메시지를 입력하세요...')}
                    value={inputText}
                    onChange={onInputChange}
                    onKeyDown={onKeyDown}
                    onCompositionStart={onCompositionStart}
                    onCompositionEnd={onCompositionEnd}
                    size="small"
                />
                {isStreaming ? (
                    <Tooltip title={t('rag.chat.stopStreaming', '전송 중지')}>
                        <IconButton
                            color="error"
                            onClick={onStopStreaming}
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
                        onClick={onSend}
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
    );
}

ChatInput.propTypes = {
    inputText: PropTypes.string.isRequired,
    onInputChange: PropTypes.func.isRequired,
    onKeyDown: PropTypes.func.isRequired,
    onCompositionStart: PropTypes.func.isRequired,
    onCompositionEnd: PropTypes.func.isRequired,
    onSend: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isStreaming: PropTypes.bool.isRequired,
    onStopStreaming: PropTypes.func.isRequired,
    isFullScreen: PropTypes.bool.isRequired,
    inputRef: PropTypes.object.isRequired,
};

export default ChatInput;
