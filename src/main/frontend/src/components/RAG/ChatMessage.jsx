// src/components/RAG/ChatMessage.jsx
import React, { memo, useState, useMemo } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Person as PersonIcon,
  SmartToy as SmartToyIcon,
  InsertDriveFile as FileIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  AddTask as AddTaskIcon,
  TableChart as TableChartIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme } from '@mui/material/styles';
import { useI18n } from '../../context/I18nContext.jsx';
import { useRAG } from '../../context/RAGContext.jsx';
import { extractTestCasesFromAIResponse } from '../../utils/testCaseParser.js';
import TestCaseForm from '../TestCaseForm.jsx';
import TestCaseDatasheetGrid from '../TestCase/TestCaseDatasheetGrid.jsx';
import { useAppContext } from '../../context/AppContext.jsx';

/**
 * 채팅 메시지 컴포넌트
 * 사용자 메시지와 AI 응답 메시지를 표시합니다.
 */
function ChatMessage({ message, onDocumentClick, projectId, onEdit, onTestCaseCreated }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isStreaming = Boolean(message.isStreaming);
  const theme = useTheme();
  const { t } = useI18n();
  const { threads: ragThreads = [] } = useRAG();
  const { fetchTestCases } = useAppContext();

  // 테스트케이스 추가 다이얼로그 상태
  const [testCaseDialogOpen, setTestCaseDialogOpen] = useState(false);
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);

  // 스프레드시트 일괄 추가 다이얼로그 상태
  const [spreadsheetDialogOpen, setSpreadsheetDialogOpen] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState([]);

  // AI 응답에서 테스트케이스 파싱
  const parsedTestCases = useMemo(() => {
    if (!isAssistant || isStreaming || !message.content) {
      return [];
    }
    const result = extractTestCasesFromAIResponse(message.content);

    // AI 생성 테스트케이스 이름에 [AI] prefix 추가
    const resultWithAIPrefix = result.map(tc => ({
      ...tc,
      name: tc.name ? `[AI] ${tc.name}` : tc.name
    }));

    console.log('[ChatMessage] 테스트케이스 파싱 결과:', {
      isAssistant,
      isStreaming,
      contentLength: message.content?.length,
      parsedCount: resultWithAIPrefix.length,
      parsed: resultWithAIPrefix,
      projectId
    });
    return resultWithAIPrefix;
  }, [isAssistant, isStreaming, message.content, projectId]);

  const handleOpenTestCaseDialog = (index = 0) => {
    setSelectedTestCaseIndex(index);
    setTestCaseDialogOpen(true);
  };

  const handleCloseTestCaseDialog = () => {
    setTestCaseDialogOpen(false);
  };

  const handleTestCaseSaved = () => {
    // 테스트케이스 저장 완료 후 다이얼로그 닫기
    setTestCaseDialogOpen(false);

    // 부모 컴포넌트에 알림
    if (onTestCaseCreated) {
      onTestCaseCreated();
    }
  };

  // 스프레드시트 다이얼로그 열기
  const handleOpenSpreadsheetDialog = () => {
    console.log('[ChatMessage] 스프레드시트 다이얼로그 열기 시작');
    console.log('[ChatMessage] parsedTestCases:', parsedTestCases);

    // AI 생성 데이터를 스프레드시트 형식으로 변환하여 초기화
    const initialData = parsedTestCases.map((tc, index) => {
      console.log(`[ChatMessage] 테스트케이스 ${index} 매핑:`, tc);
      console.log(`[ChatMessage] 테스트케이스 ${index} steps:`, tc.steps);

      const mappedData = {
        id: `temp-ai-${index}`,
        name: tc.name || '',  // parsedTestCases에 이미 [AI] prefix 포함
        description: tc.description || '',
        preCondition: tc.preCondition || tc.preconditions || '',
        expectedResults: tc.expectedResults || '',
        priority: tc.priority || 'MEDIUM',
        tags: tc.tags || [],
        type: 'testcase',
        projectId: projectId,
        __isAIGenerated: true,  // 명시적 플래그: AI 생성 데이터 표시
        // 스텝을 스프레드시트 형식으로 변환
        ...(tc.steps && tc.steps.length > 0 ? {
          step1_description: tc.steps[0]?.action || tc.steps[0]?.description || '',
          step1_expectedResult: tc.steps[0]?.expected || tc.steps[0]?.expectedResult || '',
          step2_description: tc.steps[1]?.action || tc.steps[1]?.description || '',
          step2_expectedResult: tc.steps[1]?.expected || tc.steps[1]?.expectedResult || '',
          step3_description: tc.steps[2]?.action || tc.steps[2]?.description || '',
          step3_expectedResult: tc.steps[2]?.expected || tc.steps[2]?.expectedResult || '',
          step4_description: tc.steps[3]?.action || tc.steps[3]?.description || '',
          step4_expectedResult: tc.steps[3]?.expected || tc.steps[3]?.expectedResult || '',
          step5_description: tc.steps[4]?.action || tc.steps[4]?.description || '',
          step5_expectedResult: tc.steps[4]?.expected || tc.steps[4]?.expectedResult || '',
        } : {}),
      };

      console.log(`[ChatMessage] 매핑된 데이터 ${index}:`, mappedData);
      console.log(`[ChatMessage] 매핑된 데이터 ${index} 스텝 필드:`, {
        step1_description: mappedData.step1_description,
        step1_expectedResult: mappedData.step1_expectedResult,
        step2_description: mappedData.step2_description,
        step2_expectedResult: mappedData.step2_expectedResult,
        step3_description: mappedData.step3_description,
        step3_expectedResult: mappedData.step3_expectedResult,
      });
      return mappedData;
    });

    console.log('[ChatMessage] 최종 initialData:', initialData);
    console.log('[ChatMessage] 최종 initialData[0] 키:', initialData.length > 0 ? Object.keys(initialData[0]) : []);
    setSpreadsheetData(initialData);
    setSpreadsheetDialogOpen(true);
  };

  // 스프레드시트 다이얼로그 닫기
  const handleCloseSpreadsheetDialog = () => {
    setSpreadsheetDialogOpen(false);
  };

  // 스프레드시트 데이터 변경 핸들러
  const handleSpreadsheetChange = (newData) => {
    setSpreadsheetData(newData);
  };

  // 스프레드시트 저장 핸들러
  const handleSpreadsheetSave = async (savedTestCases) => {
    // 저장 완료 후 다이얼로그 닫기
    setSpreadsheetDialogOpen(false);

    // 부모 컴포넌트에 알림
    if (onTestCaseCreated) {
      onTestCaseCreated();
    }
  };

  // 스프레드시트 새로고침 핸들러
  const handleSpreadsheetRefresh = async () => {
    if (projectId) {
      await fetchTestCases(projectId);
    }
  };

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

              const filteredDocs = message.documents.filter(doc => {
                // documentId 또는 id가 있어야 함
                const hasValidId = doc.documentId || doc.id;

                
                return hasValidId;
              });

              
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
                    // 고유 키 생성: 메시지 ID + 인덱스 + (문서 ID 또는 청크 ID)를 조합하여 중복 방지
                    const uniqueDocKey = `${message.id}-${filteredIndex}-${doc.id || doc.chunkId || doc.chunkIndex || 'doc'}`;
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

                              

                            const relatedChunkIndices = relatedDocs
                              .map(d => d.chunkIndex)
                              .filter(idx => typeof idx === 'number');

                            

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

          {/* AI 생성 테스트케이스 추가 버튼 */}
          {isAssistant && !isStreaming && parsedTestCases.length > 0 && projectId && (
            <Box sx={{ mt: 1 }}>
              {parsedTestCases.map((tc, index) => (
                <Button
                  key={index}
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddTaskIcon />}
                  onClick={() => handleOpenTestCaseDialog(index)}
                  sx={{ mr: 1, mb: 0.5 }}
                >
                  {t('rag.testcase.addButton', '테스트케이스 추가')}: {tc.name}
                </Button>
              ))}
              {/* 여러 개일 경우 스프레드시트 일괄 추가 버튼 */}
              {parsedTestCases.length >= 2 && (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<TableChartIcon />}
                  onClick={handleOpenSpreadsheetDialog}
                  sx={{ mr: 1, mb: 0.5 }}
                >
                  {t('rag.testcase.bulkAddButton', '스프레드시트로 일괄 추가')} ({parsedTestCases.length}개)
                </Button>
              )}
            </Box>
          )}

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

      {/* 테스트케이스 추가 다이얼로그 */}
      <Dialog
        open={testCaseDialogOpen}
        onClose={handleCloseTestCaseDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {t('rag.testcase.dialog.title', '테스트케이스 추가')}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {parsedTestCases[selectedTestCaseIndex] && (
            <TestCaseForm
              testCaseId={null}
              projectId={projectId}
              onSave={handleTestCaseSaved}
              initialData={parsedTestCases[selectedTestCaseIndex]}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 스프레드시트 일괄 추가 다이얼로그 */}
      <Dialog
        open={spreadsheetDialogOpen}
        onClose={handleCloseSpreadsheetDialog}
        maxWidth="xl"
        fullWidth
        fullScreen
      >
        <DialogTitle>
          {t('rag.testcase.spreadsheet.dialog.title', 'AI 생성 테스트케이스 일괄 추가')}
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
            {t('rag.testcase.spreadsheet.dialog.subtitle', '총 {count}개의 테스트케이스를 스프레드시트에서 편집하고 저장하세요.', { count: parsedTestCases.length })}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <TestCaseDatasheetGrid
            data={spreadsheetData}
            onChange={handleSpreadsheetChange}
            onSave={handleSpreadsheetSave}
            onRefresh={handleSpreadsheetRefresh}
            projectId={projectId}
            readOnly={false}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSpreadsheetDialog} color="inherit">
            {t('common.button.close', '닫기')}
          </Button>
        </DialogActions>
      </Dialog>
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
  onTestCaseCreated: PropTypes.func,
};

ChatMessage.displayName = 'ChatMessage';

export default memo(ChatMessage);
