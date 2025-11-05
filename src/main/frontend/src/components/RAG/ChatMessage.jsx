// src/components/RAG/ChatMessage.jsx
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  SmartToy as SmartToyIcon,
  InsertDriveFile as FileIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '@mui/material/styles';
import { useI18n } from '../../context/I18nContext.jsx';
import { useRAG } from '../../context/RAGContext.jsx';

/**
 * 채팅 메시지 컴포넌트
 * 사용자 메시지와 AI 응답 메시지를 표시합니다.
 */
function ChatMessage({ message, onDocumentClick, projectId, onEdit }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isStreaming = Boolean(message.isStreaming);
  const theme = useTheme();
  const { t } = useI18n();
  const { threads: ragThreads = [] } = useRAG();

  const extractTestCaseInfo = (doc) => {
    if (!doc) return null;

    const metadata = doc.metadata || {};
    const fromFileName = () => {
      if (!doc.fileName || !doc.fileName.startsWith('testcase_')) return null;
      const withoutPrefix = doc.fileName.slice('testcase_'.length);
      const dotIndex = withoutPrefix.indexOf('.');
      return dotIndex !== -1 ? withoutPrefix.slice(0, dotIndex) : withoutPrefix;
    };

    const testCaseId =
      doc.testCaseId ||
      metadata.testCaseId ||
      fromFileName();

    if (!testCaseId) {
      return null;
    }

    const projectIdForDoc = doc.projectId || metadata.projectId || projectId;
    const displayName = doc.testCaseName || metadata.testCaseName || testCaseId;

    const origin =
      (typeof window !== 'undefined' && window.location && window.location.origin) ||
      'http://localhost:3000';

    const url = projectIdForDoc
      ? `${origin}/projects/${projectIdForDoc}/testcases/${testCaseId}`
      : null;

    return {
      testCaseId,
      projectId: projectIdForDoc,
      displayName,
      url,
    };
  };

  const markdownComponents = {
    table: ({ node, ...props }) => (
      <Box sx={{ overflowX: 'auto', my: 2 }}>
        <table
          {...props}
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '100%',
          }}
        />
      </Box>
    ),
    th: ({ node, ...props }) => (
      <th
        {...props}
        style={{
          border: `1px solid ${theme.palette.divider}`,
          padding: '8px 12px',
          backgroundColor: theme.palette.grey[100],
          color: theme.palette.text.primary,
          textAlign: 'left',
          fontWeight: 600,
        }}
      />
    ),
    td: ({ node, ...props }) => (
      <td
        {...props}
        style={{
          border: `1px solid ${theme.palette.divider}`,
          padding: '8px 12px',
          color: theme.palette.text.primary,
          verticalAlign: 'top',
        }}
      />
    ),
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        px: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          maxWidth: '80%',
          gap: 1,
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: isUser ? 'primary.main' : 'grey.400',
            width: 36,
            height: 36,
          }}
        >
          {isUser ? <PersonIcon /> : <SmartToyIcon />}
        </Avatar>

        {/* Message Content */}
        <Box sx={{ flex: 1 }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: isUser ? 'primary.light' : 'grey.100',
              color: isUser ? 'primary.contrastText' : 'text.primary',
              borderRadius: 2,
              wordBreak: 'break-word',
              position: 'relative',
              overflow: 'hidden',
              ...(isAssistant && isStreaming
                ? {
                    bgcolor: 'transparent',
                    backgroundImage: `linear-gradient(120deg, ${theme.palette.grey[100]} 0%, ${theme.palette.primary.light} 50%, ${theme.palette.grey[100]} 100%)`,
                    backgroundSize: '200% 100%',
                    animation: 'ragStreamingShimmer 1.6s ease-in-out infinite',
                    border: `1px solid ${theme.palette.primary.light}`,
                    '@keyframes ragStreamingShimmer': {
                      '0%': { backgroundPosition: '200% 0' },
                      '50%': { backgroundPosition: '100% 0' },
                      '100%': { backgroundPosition: '-200% 0' },
                    },
                  }
                : {}),
            }}
          >
            {isAssistant && message.persistedId && typeof onEdit === 'function' && !isStreaming && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                }}
              >
                <Tooltip title={t('rag.chat.editResponse', '응답 편집')}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEdit(message)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            {/* Message Text */}
            {isUser ? (
              <Typography variant="body1">{message.content}</Typography>
            ) : (
              <Box
                sx={{
                  '& p': { m: 0, mb: 1 },
                  '& p:last-child': { mb: 0 },
                  '& code': {
                    bgcolor: 'grey.200',
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                  },
                  '& pre': {
                    bgcolor: 'grey.200',
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
                  '& table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    my: 2,
                  },
                  '& thead th': {
                    bgcolor: 'grey.100',
                    fontWeight: 'bold',
                  },
                  '& tbody tr:nth-of-type(odd)': {
                    bgcolor: 'grey.50',
                  },
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {message.content}
                </ReactMarkdown>
              </Box>
            )}

            {/* Related Documents */}
            {isAssistant && message.documents && message.documents.length > 0 && (() => {
              console.log('[ChatMessage] 전체 documents:', message.documents);

              const filteredDocs = message.documents.filter(doc => {
                // documentId 또는 id가 있어야 함
                const hasValidId = doc.documentId || doc.id;

                console.log('[ChatMessage] 문서 필터링:', {
                  fileName: doc.fileName,
                  title: doc.title,
                  hasValidId,
                  documentId: doc.documentId,
                  id: doc.id,
                  chunkIndex: doc.chunkIndex,
                  shouldShow: hasValidId
                });

                return hasValidId;
              });

              console.log('[ChatMessage] 필터링 후 documents:', filteredDocs);

              return filteredDocs.length > 0 ? (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                  참고 문서:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {filteredDocs
                    .map((doc, filteredIndex) => {
                    const testCaseInfo = extractTestCaseInfo(doc);
                    const isTestCaseDoc = Boolean(testCaseInfo);
                    const uniqueDocKey = doc.id || doc.chunkId || `${message.id}-${filteredIndex}`;
                    const sourceNumber = filteredIndex + 1;

                    // Conversation Thread 여부 확인
                    const metadata = doc.metadata || {};
                    const threadId = metadata.threadId || metadata.thread_id;
                    const threadTitleFromList = threadId
                      ? ragThreads.find((thread) => thread.id === threadId)?.title
                      : null;
                    const isConversationThread =
                      Boolean(threadId) ||
                      doc.fileName === 'Conversation Thread' ||
                      doc.title === 'Conversation Thread';

                    const conversationTitle =
                      threadTitleFromList ||
                      metadata.threadTitle ||
                      metadata.thread_title ||
                      doc.displayName ||
                      doc.title ||
                      doc.fileName ||
                      t('rag.chat.untitledThread', '제목 없는 스레드');

                    // Conversation Thread인 경우 스레드 제목을 표시
                    const baseName = isTestCaseDoc
                      ? t('rag.chat.testCaseDocumentLabel', '테스트케이스: {name}', {
                          name: testCaseInfo.displayName,
                        })
                      : isConversationThread
                      ? t('rag.chat.conversationThreadLabel', '대화 스레드: {title}', {
                          title: conversationTitle,
                        })
                      : (doc.displayName || doc.title || doc.fileName || t('rag.chat.documentFallback', '문서 {index}', {
                          index: filteredIndex + 1,
                        }));

                    // 청크 번호가 있으면 표시 (같은 문서의 다른 청크임을 알 수 있도록)
                    const chunkInfo = typeof doc.chunkIndex === 'number' ? ` - 청크 #${doc.chunkIndex + 1}` : '';
                    const label = `[출처${sourceNumber}] ${baseName}${chunkInfo}`;

                    const icon = isTestCaseDoc ? <AssignmentIcon /> : <FileIcon />;
                    const tooltipTitle = isTestCaseDoc
                      ? t('rag.chat.testCaseDocumentTooltip', '새 탭에서 테스트케이스 상세 보기')
                      : isConversationThread
                      ? t('rag.chat.conversationThreadTooltip', '참조된 대화 스레드')
                      : t('rag.chat.documentTooltip', '문서 상세 정보 보기');

                    // Conversation Thread는 클릭 비활성화
                    const chipProps = isTestCaseDoc && testCaseInfo?.url
                      ? {
                          component: 'a',
                          href: testCaseInfo.url,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        }
                      : (!isConversationThread && onDocumentClick
                        ? {
                            onClick: () => {
                              // documentId 결정: doc.documentId 또는 doc.id 사용
                              const documentId = doc.documentId || doc.id;

                              if (!documentId) {
                                console.error('문서 ID를 찾을 수 없습니다:', doc);
                                return;
                              }

                              // 같은 문서의 모든 청크 인덱스 수집
                              const relatedDocs = message.documents.filter(d => {
                                const dId = d.documentId || d.id;
                                return (doc.fileName && d.fileName === doc.fileName) ||
                                       (documentId && dId === documentId);
                              });

                              console.log('[ChatMessage] 관련 문서들:', relatedDocs);

                            const relatedChunkIndices = relatedDocs
                              .map(d => d.chunkIndex)
                              .filter(idx => typeof idx === 'number');

                            console.log('[ChatMessage] 추출된 chunkIndex 값들:', relatedChunkIndices);

                            onDocumentClick({
                              ...doc,
                              documentId: documentId,
                              relatedChunkIndices: relatedChunkIndices.length > 0 ? relatedChunkIndices : undefined
                            });
                          },
                        }
                      : {});

                    return (
                      <Tooltip key={uniqueDocKey} title={tooltipTitle}>
                        <Chip
                          icon={icon}
                          label={label}
                          size="small"
                          clickable={isTestCaseDoc || Boolean(onDocumentClick && !isConversationThread)}
                          sx={{
                            cursor: (isTestCaseDoc || (onDocumentClick && !isConversationThread)) ? 'pointer' : 'default',
                            '&:hover': {
                              bgcolor: (isTestCaseDoc || (onDocumentClick && !isConversationThread)) ? 'action.hover' : 'transparent',
                            },
                          }}
                          {...chipProps}
                        />
                      </Tooltip>
                    );
                  })}
                </Stack>
              </Box>
              ) : null;
            })()}

            {/* Similarity Scores (optional) */}
            {isAssistant && message.similarity && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 1,
                  opacity: 0.7,
                  fontStyle: 'italic',
                }}
              >
                유사도: {(message.similarity * 100).toFixed(1)}%
              </Typography>
            )}
          </Paper>

          {/* Timestamp */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 0.5,
              px: 1,
              color: 'text.secondary',
              textAlign: isUser ? 'right' : 'left',
            }}
          >
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    role: PropTypes.oneOf(['user', 'assistant', 'system']).isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    documents: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        chunkId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        fileName: PropTypes.string,
        title: PropTypes.string,
        displayName: PropTypes.string,
        projectId: PropTypes.string,
        testCaseId: PropTypes.string,
        testCaseName: PropTypes.string,
        metadata: PropTypes.object,
      })
    ),
    similarity: PropTypes.number,
    isStreaming: PropTypes.bool,
    persistedId: PropTypes.string,
  }).isRequired,
  onDocumentClick: PropTypes.func,
  projectId: PropTypes.string,
  onEdit: PropTypes.func,
};

ChatMessage.displayName = 'ChatMessage';

export default memo(ChatMessage);
