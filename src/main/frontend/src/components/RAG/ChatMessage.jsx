// src/components/RAG/ChatMessage.jsx
import React, { memo, useState, useMemo, useCallback } from 'react';
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
  Badge,
  Collapse,
} from '@mui/material';
import {
  Person as PersonIcon,
  SmartToy as SmartToyIcon,
  InsertDriveFile as FileIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  AddTask as AddTaskIcon,
  TableChart as TableChartIcon,
  Code as CodeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTheme, alpha } from '@mui/material/styles';
import { useI18n } from '../../context/I18nContext.jsx';
import { useRAG } from '../../context/RAGContext.jsx';
import { extractTestCasesFromAIResponse } from '../../utils/testCaseParser.js';
import TestCaseForm from '../TestCaseForm.jsx';
import TestCaseDatasheetGrid from '../TestCase/TestCaseDatasheetGrid.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import testCaseService from '../../services/testCaseService.js';
import ChunkPreviewDialog from './ChunkPreviewDialog.jsx';

/**
 * 채팅 메시지 컴포넌트
 * 사용자 메시지와 AI 응답 메시지를 표시합니다.
 */
function ChatMessage({ message, onDocumentClick, projectId, onEdit, onTestCaseCreated }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isStreaming = Boolean(message.isStreaming);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const userMessageBg = isDarkMode ? theme.palette.primary.main : theme.palette.primary.light;
  const assistantMessageBg = isDarkMode ? alpha(theme.palette.common.white, 0.05) : theme.palette.grey[100];
  const inlineCodeBg = isDarkMode ? alpha(theme.palette.common.white, 0.15) : theme.palette.grey[200];
  const blockCodeBg = isDarkMode ? alpha(theme.palette.common.white, 0.1) : theme.palette.grey[200];
  const tableHeaderBg = isDarkMode ? alpha(theme.palette.common.white, 0.1) : theme.palette.grey[100];
  const tableRowAltBg = isDarkMode ? alpha(theme.palette.common.white, 0.05) : theme.palette.grey[50];
  const streamingGradient = `linear-gradient(120deg, ${assistantMessageBg} 0%, ${isDarkMode ? alpha(theme.palette.primary.light, 0.2) : theme.palette.primary.light
    } 50%, ${assistantMessageBg} 100%)`;
  const streamingBorderColor = isDarkMode
    ? `1px solid ${alpha(theme.palette.primary.light, 0.3)}`
    : `1px solid ${theme.palette.primary.light}`;
  const { t } = useI18n();
  const { threads: ragThreads = [] } = useRAG();

  // 테스트케이스 추가 다이얼로그 상태
  const [testCaseDialogOpen, setTestCaseDialogOpen] = useState(false);
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);

  // 스프레드시트 일괄 추가 다이얼로그 상태
  const [spreadsheetDialogOpen, setSpreadsheetDialogOpen] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState([]);

  // 청크 프리뷰 다이얼로그 상태
  const [chunkPreviewOpen, setChunkPreviewOpen] = useState(false);
  const [selectedChunk, setSelectedChunk] = useState(null);


  // JSON 원본 보기 토글 상태
  const [showJson, setShowJson] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // AI 응답에서 테스트케이스 파싱
  const parsedTestCases = useMemo(() => {
    if (!isAssistant || isStreaming || !message.content) {
      return [];
    }
    const result = extractTestCasesFromAIResponse(message.content);

    // Priority 값 정규화 함수 (HIGH → High, MEDIUM → Medium, LOW → Low)
    const normalizePriority = (priority) => {
      if (!priority) return 'MEDIUM';
      const upperPriority = priority.toUpperCase();
      if (upperPriority === 'HIGH') return 'HIGH';
      if (upperPriority === 'MEDIUM') return 'MEDIUM';
      if (upperPriority === 'LOW') return 'LOW';
      return 'MEDIUM'; // 기본값
    };

    // AI 생성 테스트케이스 이름에 [AI] prefix 추가 및 priority 정규화
    const resultWithAIPrefix = result.map(tc => ({
      ...tc,
      name: tc.name ? `[AI] ${tc.name}` : tc.name,
      priority: normalizePriority(tc.priority)
    }));

    return resultWithAIPrefix;
  }, [isAssistant, isStreaming, message.content, projectId]);

  // JSON 블록 추출 (메시지 내용에서 JSON 부분만 찾기)
  const jsonContent = useMemo(() => {
    if (!message.content) return '';
    const match = message.content.match(/```json([\s\S]*?)```/);
    return match ? match[0] : '';
  }, [message.content]);


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
    // AI 생성 데이터를 스프레드시트 형식으로 변환하여 초기화
    const initialData = parsedTestCases.map((tc, index) => {

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
        steps: tc.steps || [], // 스프레드시트 컴포넌트에서 maxSteps 계산을 위해 필요
        postCondition: tc.postCondition || tc.post_condition || '',
        testTechnique: tc.testTechnique || tc.test_technique || '',
        isAutomated: tc.isAutomated ?? false,
        __isAIGenerated: true,  // 명시적 플래그: AI 생성 데이터 표시
        // 스텝을 스프레드시트 형식으로 변환
        ...(tc.steps && tc.steps.length > 0 ?
          tc.steps.reduce((acc, step, i) => {
            const stepNum = i + 1;
            // 최대 20개 스텝까지 지원
            if (stepNum <= 20) {
              acc[`step${stepNum}_description`] = step.action || step.description || '';
              acc[`step${stepNum}_expectedResult`] = step.expected || step.expectedResult || '';
            }
            return acc;
          }, {})
          : {}),
      };

      return mappedData;
    });

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
  const handleSpreadsheetSave = async (savedTestCases, deletedIds = []) => {
    try {
      // 배치 저장 API 호출
      if (savedTestCases && savedTestCases.length > 0) {
        await testCaseService.batchSaveTestCases(savedTestCases);
      }

      // 삭제할 항목이 있으면 삭제 처리
      if (deletedIds && deletedIds.length > 0) {
        await Promise.all(
          deletedIds.map(id => testCaseService.deleteTestCase(id))
        );
      }

      // 저장 완료 후 다이얼로그 닫기
      setSpreadsheetDialogOpen(false);

      // 부모 컴포넌트에 저장 완료 알림 (부모가 새로고침 처리)
      if (onTestCaseCreated) {
        onTestCaseCreated();
      }
    } catch (error) {
      console.error('AI 테스트케이스 일괄 저장 실패:', error);
      // 에러가 발생해도 다이얼로그는 닫지 않음 (사용자가 재시도 가능하도록)
    }
  };

  // 스프레드시트 새로고침 핸들러
  const handleSpreadsheetRefresh = async () => {
    if (projectId) {
      await fetchTestCases(projectId);
    }
  };

  // 청크 프리뷰 핸들러
  const handleChunkClick = useCallback((chunkData) => {
    setSelectedChunk(chunkData);
    setChunkPreviewOpen(true);
  }, []);

  const handleCloseChunkPreview = useCallback(() => {
    setChunkPreviewOpen(false);
    setSelectedChunk(null);
  }, []);

  // 청크 프리뷰에서 전체 문서 보기
  const handleViewDocumentFromChunk = useCallback((doc) => {
    if (!onDocumentClick) return;

    const documentId = doc.documentId || doc.id;
    if (!documentId) return;

    // 같은 문서의 모든 청크 인덱스 수집
    const relatedDocs = message.documents?.filter(d => {
      const dId = d.documentId || d.id;
      return (doc.fileName && d.fileName === doc.fileName) || (documentId && dId === documentId);
    }) || [];

    const relatedChunkIndices = relatedDocs
      .map(d => d.chunkIndex)
      .filter(idx => typeof idx === 'number');

    onDocumentClick({
      ...doc,
      documentId: documentId,
      relatedChunkIndices: relatedChunkIndices.length > 0 ? relatedChunkIndices : undefined
    });
  }, [onDocumentClick, message.documents]);

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
          backgroundColor: tableHeaderBg,
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
              bgcolor: isUser ? userMessageBg : assistantMessageBg,
              color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
              borderRadius: 2,
              wordBreak: 'break-word',
              position: 'relative',
              overflow: 'hidden',
              border: isDarkMode ? `1px solid ${theme.palette.divider}` : 'none',
              ...(isAssistant && isStreaming
                ? {
                  bgcolor: 'transparent',
                  backgroundImage: streamingGradient,
                  backgroundSize: '200% 100%',
                  animation: 'ragStreamingShimmer 1.6s ease-in-out infinite',
                  border: streamingBorderColor,
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
                    bgcolor: inlineCodeBg,
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontFamily: 'monospace',
                    fontSize: '0.9em',
                  },
                  '& pre': {
                    bgcolor: blockCodeBg,
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
                    bgcolor: tableHeaderBg,
                    fontWeight: 'bold',
                  },
                  '& tbody tr:nth-of-type(odd)': {
                    bgcolor: tableRowAltBg,
                  },
                }}
              >
                {/* 파싱된 테스트 케이스 테이블 표시 */}
                {parsedTestCases.length > 0 && (
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {t('rag.chat.generatedTestCases', '생성된 테스트 케이스 ({count})', { count: parsedTestCases.length })}
                    </Typography>
                    <Box sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      overflow: 'hidden', // 테이블 둥근 모서리 유지
                      bgcolor: theme.palette.background.paper
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                        <thead style={{ backgroundColor: tableHeaderBg }}>
                          <tr>
                            <th style={{ padding: '8px 4px', width: '40px' }}></th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}`, width: '50px' }}>No.</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}` }}>{t('testcase.column.name', '이름')}</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}`, width: '80px' }}>{t('testcase.column.priority', '우선순위')}</th>
                            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: `1px solid ${theme.palette.divider}`, width: '80px' }}>{t('testcase.column.steps', '스텝')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedTestCases.map((tc, idx) => (
                            <React.Fragment key={idx}>
                              <tr
                                style={{
                                  borderBottom: expandedRows[idx] ? 'none' : (idx < parsedTestCases.length - 1 ? `1px solid ${theme.palette.divider}` : 'none'),
                                  cursor: 'pointer',
                                  backgroundColor: expandedRows[idx] ? alpha(theme.palette.primary.main, 0.05) : 'inherit'
                                }}
                                onClick={() => toggleRow(idx)}
                              >
                                <td style={{ padding: '4px', textAlign: 'center' }}>
                                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleRow(idx); }}>
                                    {expandedRows[idx] ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                                  </IconButton>
                                </td>
                                <td style={{ padding: '8px 12px' }}>{idx + 1}</td>
                                <td style={{ padding: '8px 12px', fontWeight: 500 }}>
                                  {tc.name}
                                  {tc.description && (
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                                      {tc.description}
                                    </Typography>
                                  )}
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <Chip
                                    label={tc.priority}
                                    size="small"
                                    color={tc.priority === 'HIGH' ? 'error' : tc.priority === 'MEDIUM' ? 'warning' : 'info'}
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <Badge badgeContent={tc.steps ? tc.steps.length : 0} color="primary" showZero>
                                    <Box component="span" sx={{ px: 1 }} />
                                  </Badge>
                                </td>
                              </tr>
                              {/* 확장된 상세 행 */}
                              {expandedRows[idx] && (
                                <tr style={{ borderBottom: idx < parsedTestCases.length - 1 ? `1px solid ${theme.palette.divider}` : 'none' }}>
                                  <td colSpan={5} style={{ padding: 0 }}>
                                    <Collapse in={expandedRows[idx]} timeout="auto" unmountOnExit>
                                      <Box sx={{ margin: 2, ml: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>

                                        {/* 전제/사후 조건 섹션 */}
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                          {(tc.preCondition || tc.preconditions) && (
                                            <Box>
                                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                                {t('testcase.preCondition', '전제 조건')}
                                              </Typography>
                                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {tc.preCondition || tc.preconditions}
                                              </Typography>
                                            </Box>
                                          )}
                                          {(tc.postCondition || tc.post_condition) && (
                                            <Box>
                                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                                {t('testcase.postCondition', '사후 조건')}
                                              </Typography>
                                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {tc.postCondition || tc.post_condition}
                                              </Typography>
                                            </Box>
                                          )}
                                        </Box>

                                        {/* 설명 */}
                                        {tc.description && (
                                          <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                              {t('testcase.description', '설명')}
                                            </Typography>
                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                              {tc.description}
                                            </Typography>
                                          </Box>
                                        )}

                                        {/* 메타데이터 (태그, 기법, 자동화) 및 예상 결과 */}
                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                                          {/* 메타데이터 */}
                                          <Box>
                                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                              {t('testcase.metadata', '메타데이터')}
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ alignItems: 'center' }}>
                                              {/* 자동화 여부 */}
                                              {(tc.isAutomated === true || tc.isAutomated === 'true') && (
                                                <Chip label="Automated" size="small" color="info" variant="outlined" sx={{ height: 22, fontSize: '0.75rem' }} />
                                              )}
                                              {/* 테스트 기법 */}
                                              {(tc.testTechnique || tc.test_technique) && (
                                                <Chip label={tc.testTechnique || tc.test_technique} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.75rem', borderColor: 'text.secondary', color: 'text.secondary' }} />
                                              )}
                                              {/* 태그 */}
                                              {tc.tags && tc.tags.map((tag, tagIdx) => (
                                                <Chip
                                                  key={tagIdx}
                                                  label={tag}
                                                  size="small"
                                                  variant="outlined"
                                                  sx={{ fontSize: '0.75rem', height: 22 }}
                                                />
                                              ))}
                                            </Stack>
                                          </Box>

                                          {/* 전체 예상 결과 */}
                                          {tc.expectedResults && (
                                            <Box>
                                              <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                                {t('testcase.expectedResults', '예상 결과 (전체)')}
                                              </Typography>
                                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {tc.expectedResults}
                                              </Typography>
                                            </Box>
                                          )}
                                        </Box>

                                        {/* 스텝 상세 */}
                                        <Box>
                                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', mb: 1, display: 'block' }}>
                                            {t('testcase.steps', '스텝 상세')}
                                          </Typography>
                                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', backgroundColor: alpha(theme.palette.background.default, 0.5), border: `1px solid ${theme.palette.divider}` }}>
                                            <thead>
                                              <tr style={{ borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.action.hover }}>
                                                <th style={{ padding: '6px 8px', textAlign: 'left', width: '40px', fontWeight: 600 }}>#</th>
                                                <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600 }}>{t('testcase.step.action', '설명')}</th>
                                                <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600 }}>{t('testcase.step.expected', '예상 결과')}</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {tc.steps && tc.steps.length > 0 ? (
                                                tc.steps.map((step, stepIdx) => (
                                                  <tr key={stepIdx} style={{ borderBottom: stepIdx < tc.steps.length - 1 ? `1px dotted ${theme.palette.divider}` : 'none' }}>
                                                    <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{stepIdx + 1}</td>
                                                    <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{step.action || step.description}</td>
                                                    <td style={{ padding: '6px 8px', verticalAlign: 'top' }}>{step.expected || step.expectedResult}</td>
                                                  </tr>
                                                ))
                                              ) : (
                                                <tr>
                                                  <td colSpan={3} style={{ padding: '8px', textAlign: 'center', color: 'text.secondary' }}>
                                                    {t('testcase.noSteps', '스텝이 없습니다.')}
                                                  </td>
                                                </tr>
                                              )}
                                            </tbody>
                                          </table>
                                        </Box>

                                      </Box>
                                    </Collapse>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </Box>
                )}

                {/* 텍스트 내용 렌더링 (JSON 제외) 및 JSON 토글 */}
                <Box>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {/* JSON 블록이 있고 파싱된 테스트 케이스가 있으면 JSON을 숨기고 텍스트만 표시 */}
                    {parsedTestCases.length > 0
                      ? message.content.replace(/```json[\s\S]*?```/g, '').trim() || (message.content.includes('```json') ? t('rag.chat.jsonHidden', '테스트 케이스 데이터가 감지되었습니다.') : message.content)
                      : message.content}
                  </ReactMarkdown>

                  {parsedTestCases.length > 0 && jsonContent && (
                    <Box sx={{ mt: 1 }}>
                      <Button
                        size="small"
                        onClick={() => setShowJson(!showJson)}
                        startIcon={showJson ? <ExpandLessIcon /> : <CodeIcon />}
                        endIcon={showJson ? null : <ExpandMoreIcon />}
                        sx={{
                          color: 'text.secondary',
                          textTransform: 'none',
                          fontSize: '0.875rem'
                        }}
                      >
                        {showJson ? t('rag.chat.hideJson', 'JSON 원본 숨기기') : t('rag.chat.showJson', 'JSON 원본 보기')}
                      </Button>
                      <Collapse in={showJson}>
                        <Paper
                          elevation={0}
                          sx={{
                            mt: 1,
                            p: 2,
                            bgcolor: isDarkMode ? alpha(theme.palette.common.white, 0.05) : theme.palette.grey[100],
                            borderRadius: 2,
                            maxHeight: '400px',
                            overflow: 'auto',
                            border: `1px solid ${theme.palette.divider}`
                          }}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={markdownComponents}
                          >
                            {jsonContent}
                          </ReactMarkdown>
                        </Paper>
                      </Collapse>
                    </Box>
                  )}
                </Box>
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

                        // 출처 클릭 동작
                        const chipProps = isTestCaseDoc && testCaseInfo?.url
                          ? {
                            // 테스트케이스: 새 탭으로 이동
                            component: 'a',
                            href: testCaseInfo.url,
                            target: '_blank',
                            rel: 'noopener noreferrer',
                          }
                          : isConversationThread
                            ? {
                              // 대화 스레드: 청크 프리뷰 다이얼로그
                              onClick: () => handleChunkClick(doc),
                            }
                            : (onDocumentClick
                              ? {
                                // 일반 문서: 기존 문서 청크 보기 화면
                                onClick: () => {
                                  const documentId = doc.documentId || doc.id;
                                  if (!documentId) return;

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
                              clickable={isTestCaseDoc || isConversationThread || Boolean(onDocumentClick)}
                              sx={{
                                cursor: (isTestCaseDoc || isConversationThread || onDocumentClick) ? 'pointer' : 'default',
                                '&:hover': {
                                  bgcolor: (isTestCaseDoc || isConversationThread || onDocumentClick) ? 'action.hover' : 'transparent',
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

      {/* 청크 프리뷰 다이얼로그 */}
      <ChunkPreviewDialog
        open={chunkPreviewOpen}
        chunkData={selectedChunk}
        onClose={handleCloseChunkPreview}
        onViewDocument={onDocumentClick ? handleViewDocumentFromChunk : undefined}
      />
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
