// src/components/RAG/ChunkPreviewDialog.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    IconButton,
    Chip,
    Divider,
    Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTheme } from '@mui/material/styles';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useI18n } from '../../context/I18nContext.jsx';

/**
 * 청크 프리뷰 다이얼로그 컴포넌트
 * AI 질의응답의 출처를 클릭했을 때 해당 청크의 상세 내용을 표시합니다.
 */
function ChunkPreviewDialog({ open, chunkData, onClose, onViewDocument }) {
    const { t } = useI18n();
    const theme = useTheme();

    // 청크 데이터에서 정보 추출
    const chunkInfo = useMemo(() => {
        if (!chunkData) return null;

        const metadata = chunkData.metadata || {};
        const threadId = metadata.threadId || metadata.thread_id;
        const isConversationThread =
            Boolean(threadId) ||
            chunkData.fileName === 'Conversation Thread' ||
            chunkData.title === 'Conversation Thread';

        const isTestCase = chunkData.fileName?.startsWith('testcase_');

        // 출처 타입 결정
        let sourceType = 'document';
        let sourceIcon = <DescriptionIcon />;
        if (isConversationThread) {
            sourceType = 'conversation';
            sourceIcon = <ChatBubbleIcon />;
        } else if (isTestCase) {
            sourceType = 'testcase';
            sourceIcon = <AssignmentIcon />;
        }

        // 제목 결정
        let title = chunkData.fileName || chunkData.title || chunkData.displayName;
        if (isConversationThread) {
            title =
                metadata.threadTitle ||
                metadata.thread_title ||
                chunkData.displayName ||
                chunkData.title ||
                t('rag.chunk.preview.conversationThread', '대화 스레드');
        }

        return {
            sourceType,
            sourceIcon,
            title,
            chunkText: chunkData.chunkText || '',
            chunkIndex: typeof chunkData.chunkIndex === 'number' ? chunkData.chunkIndex + 1 : null,
            similarityScore: chunkData.similarityScore || chunkData.similarity,
            documentId: chunkData.documentId || chunkData.id,
            isConversationThread,
            isTestCase,
        };
    }, [chunkData, t]);

    const handleCopy = () => {
        if (chunkInfo?.chunkText) {
            navigator.clipboard.writeText(chunkInfo.chunkText);
        }
    };

    if (!chunkInfo) {
        return null;
    }

    return (
        <Dialog
            open={open && Boolean(chunkData)}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            slotProps={{
                paper: { sx: { minHeight: '60vh', maxHeight: '90vh' } }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    {chunkInfo.sourceIcon}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="div">
                            {t('rag.chunk.preview.title', '청크 상세 보기')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {chunkInfo.title}
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Divider />
            {/* 메타데이터 */}
            <Box sx={{ px: 3, py: 2, bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50' }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {chunkInfo.sourceType === 'conversation' && (
                        <Chip
                            label={t('rag.chunk.preview.typeConversation', '대화')}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    )}
                    {chunkInfo.sourceType === 'testcase' && (
                        <Chip
                            label={t('rag.chunk.preview.typeTestCase', '테스트케이스')}
                            size="small"
                            color="secondary"
                            variant="outlined"
                        />
                    )}
                    {chunkInfo.sourceType === 'document' && (
                        <Chip
                            label={t('rag.chunk.preview.typeDocument', '문서')}
                            size="small"
                            color="default"
                            variant="outlined"
                        />
                    )}
                    {chunkInfo.chunkIndex && (
                        <Chip
                            label={t('rag.chunk.preview.chunkNumber', '청크 #{number}', { number: chunkInfo.chunkIndex })}
                            size="small"
                            variant="outlined"
                        />
                    )}
                    {typeof chunkInfo.similarityScore === 'number' && (
                        <Chip
                            label={t('rag.chunk.preview.similarity', '유사도: {score}%', {
                                score: (chunkInfo.similarityScore * 100).toFixed(1),
                            })}
                            size="small"
                            color={chunkInfo.similarityScore >= 0.8 ? 'success' : chunkInfo.similarityScore >= 0.6 ? 'warning' : 'default'}
                            variant="outlined"
                        />
                    )}
                </Stack>
            </Box>
            <Divider />
            {/* 청크 내용 */}
            <DialogContent
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    '& p': { m: 0, mb: 1 },
                    '& p:last-child': { mb: 0 },
                    '& code': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'grey.200',
                        px: 0.5,
                        py: 0.25,
                        borderRadius: 0.5,
                        fontFamily: 'monospace',
                        fontSize: '0.9em',
                    },
                    '& pre': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'grey.200',
                        p: 1,
                        borderRadius: 1,
                        overflow: 'auto',
                        '& code': {
                            bgcolor: 'transparent',
                            p: 0,
                        },
                    },
                    '& ul, & ol': {
                        mt: 0.5,
                        mb: 0.5,
                        pl: 2,
                    },
                    '& li': {
                        mb: 0.25,
                    },
                }}
            >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{chunkInfo.chunkText}</ReactMarkdown>
            </DialogContent>
            <Divider />
            {/* 액션 버튼 */}
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button startIcon={<ContentCopyIcon />} onClick={handleCopy} variant="outlined">
                    {t('rag.chunk.preview.copy', '복사')}
                </Button>
                {/* 대화 스레드가 아닌 일반 문서인 경우 전체 문서 보기 버튼 표시 */}
                {!chunkInfo.isConversationThread && chunkInfo.documentId && onViewDocument && (
                    <Button
                        onClick={() => {
                            onViewDocument(chunkData);
                            onClose();
                        }}
                        variant="outlined"
                    >
                        {t('rag.chunk.preview.viewDocument', '전체 문서 보기')}
                    </Button>
                )}
                <Button onClick={onClose} variant="contained">
                    {t('common.close', '닫기')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

ChunkPreviewDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    chunkData: PropTypes.shape({
        chunkText: PropTypes.string,
        chunkIndex: PropTypes.number,
        documentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        fileName: PropTypes.string,
        title: PropTypes.string,
        displayName: PropTypes.string,
        similarityScore: PropTypes.number,
        similarity: PropTypes.number,
        metadata: PropTypes.object,
    }),
    onClose: PropTypes.func.isRequired,
    onViewDocument: PropTypes.func, // 전체 문서 보기 핸들러 (선택적)
};

export default ChunkPreviewDialog;
