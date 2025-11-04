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
            {isAssistant && message.documents && message.documents.length > 0 && (
              <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                  참고 문서:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {message.documents.map((doc, index) => {
                    const testCaseInfo = extractTestCaseInfo(doc);
                    const isTestCaseDoc = Boolean(testCaseInfo);
                    const uniqueDocKey = doc.id || doc.chunkId || `${message.id}-${index}`;
                    const label = isTestCaseDoc
                      ? t('rag.chat.testCaseDocumentLabel', '테스트케이스: {name}', {
                          name: testCaseInfo.displayName,
                        })
                      : (doc.displayName || doc.title || doc.fileName || t('rag.chat.documentFallback', '문서 {index}', {
                          index: index + 1,
                        }));
                    const icon = isTestCaseDoc ? <AssignmentIcon /> : <FileIcon />;
                    const tooltipTitle = isTestCaseDoc
                      ? t('rag.chat.testCaseDocumentTooltip', '새 탭에서 테스트케이스 상세 보기')
                      : t('rag.chat.documentTooltip', '문서 상세 정보 보기');

                    const chipProps = isTestCaseDoc && testCaseInfo?.url
                      ? {
                          component: 'a',
                          href: testCaseInfo.url,
                          target: '_blank',
                          rel: 'noopener noreferrer',
                        }
                      : (onDocumentClick
                        ? {
                            onClick: () => onDocumentClick(doc),
                          }
                        : {});

                    return (
                      <Tooltip key={uniqueDocKey} title={tooltipTitle}>
                        <Chip
                          icon={icon}
                          label={label}
                          size="small"
                          clickable={isTestCaseDoc || Boolean(onDocumentClick)}
                          sx={{
                            cursor: (isTestCaseDoc || onDocumentClick) ? 'pointer' : 'default',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                          {...chipProps}
                        />
                      </Tooltip>
                    );
                  })}
                </Stack>
              </Box>
            )}

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
