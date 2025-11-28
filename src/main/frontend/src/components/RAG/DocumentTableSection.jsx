import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
  Collapse,
  LinearProgress,
  Alert,
  Button
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ViewListIcon from '@mui/icons-material/ViewList';
import DownloadIcon from '@mui/icons-material/Download';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SummarizeIcon from '@mui/icons-material/Summarize';
import HistoryIcon from '@mui/icons-material/History';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import { useI18n } from '../../context/I18nContext.jsx';

const formatFileSize = (bytes = 0) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateFromISO = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return '-';
  }
};

function DocumentTableSection({
  title,
  documents = [],
  llmAnalysisStates = {},
  expandedRows = {},
  onToggleExpand,
  onPauseJob,
  onResumeJob,
  onCancelJob,
  actionHandlers = {},
  renderExtraActions,
  showExpand = true,
}) {
  const { t } = useI18n();
  if (!documents || documents.length === 0) {
    return null;
  }

  const getStatusChip = (status) => {
    const statusMap = {
      pending: {
        label: t('rag.document.status.pending', '대기 중'),
        icon: <PendingIcon fontSize="small" />,
        color: 'default',
      },
      analyzing: {
        label: t('rag.document.status.analyzing', '분석 중'),
        icon: <CircularProgress size={14} />,
        color: 'primary',
      },
      completed: {
        label: t('rag.document.status.completed', '완료'),
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'success',
      },
      failed: {
        label: t('rag.document.status.failed', '실패'),
        icon: <ErrorIcon fontSize="small" />,
        color: 'error',
      },
    };
    const info = statusMap[(status || '').toLowerCase()] || statusMap.pending;
    return <Chip icon={info.icon} label={info.label} color={info.color} size="small" />;
  };

  const getParserLabel = (doc) => {
    const parserKey = doc?.metaData?.parser || doc?.metaData?.parserName;
    if (!parserKey) {
      return t('rag.document.list.parserUnknown', '알 수 없음');
    }
    const parserLabels = {
      upstage: 'Upstage',
      pymupdf: 'PyMuPDF',
      pymupdf4llm: 'PyMuPDF4LLM',
      pypdf: 'pypdf',
      auto: t('rag.document.list.parserAuto', '자동 선택'),
    };
    return parserLabels[parserKey] || parserKey;
  };

  const getEmbeddingStatusChip = (doc) => {
    const status = doc?.metaData?.embedding_status
      ? doc.metaData.embedding_status.toLowerCase()
      : 'pending';
    const statusMap = {
      pending: {
        label: t('rag.document.embedding.pending', '대기 중'),
        icon: <PendingIcon fontSize="small" />,
        color: 'default',
      },
      generating: {
        label: t('rag.document.embedding.generating', '생성 중'),
        icon: <CircularProgress size={14} />,
        color: 'primary',
      },
      completed: {
        label: t('rag.document.embedding.completed', '완료'),
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'success',
      },
      failed: {
        label: t('rag.document.embedding.failed', '실패'),
        icon: <ErrorIcon fontSize="small" />,
        color: 'error',
      },
    };
    const info = statusMap[status] || statusMap.pending;
    return <Chip icon={info.icon} label={info.label} color={info.color} size="small" />;
  };

  const getLlmAnalysisStatusChip = (docId) => {
    const llmState = llmAnalysisStates[docId];
    if (!llmState) {
      return <Chip label={t('rag.document.list.loading', '로딩 중')} size="small" color="default" />;
    }
    const statusMap = {
      not_started: {
        label: 'LLM_STATUS_NOT_STARTED',
        icon: <PendingIcon fontSize="small" />,
        color: 'default',
      },
      processing: {
        label: 'LLM_STATUS_PROCESSING',
        icon: <CircularProgress size={14} />,
        color: 'primary',
      },
      paused: {
        label: 'LLM_STATUS_PAUSED',
        icon: <PauseIcon fontSize="small" />,
        color: 'warning',
      },
      completed: {
        label: 'LLM_STATUS_COMPLETED',
        icon: <CheckCircleIcon fontSize="small" />,
        color: 'success',
      },
      cancelled: {
        label: 'LLM_STATUS_CANCELLED',
        icon: <StopIcon fontSize="small" />,
        color: 'default',
      },
      error: {
        label: 'LLM_STATUS_FAILED',
        icon: <ErrorIcon fontSize="small" />,
        color: 'error',
      },
    };
    const info = statusMap[llmState.status] || statusMap.not_started;
    return (
      <Chip
        label={info.label}
        size="small"
        color={info.color}
        icon={info.icon}
      />
    );
  };

  const getProgressColor = (progress = 0) => {
    if (progress >= 100) return 'success';
    if (progress >= 50) return 'primary';
    return 'warning';
  };

  const actionHandler = (name) => actionHandlers?.[name];

  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title} ({documents.length})
        </Typography>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {showExpand && <TableCell width="50px" />}
              <TableCell>{t('rag.document.list.fileName', '파일명')}</TableCell>
              <TableCell>{t('rag.document.list.fileSize', '크기')}</TableCell>
              <TableCell>{t('rag.document.list.status', '상태')}</TableCell>
              <TableCell>{t('rag.document.list.parser', '파서')}</TableCell>
              <TableCell>{t('rag.document.list.embeddingStatus', '임베딩')}</TableCell>
              <TableCell>{t('rag.document.list.chunks', '청크 수')}</TableCell>
              <TableCell>{t('rag.document.list.llmSummaryStatus', 'LLM 요약 상태')}</TableCell>
              <TableCell align="center">{t('rag.document.list.summaryProgress', '요약 진행율')}</TableCell>
              <TableCell>{t('rag.document.list.analyzedChunks', '분석 청크')}</TableCell>
              <TableCell>{t('rag.document.list.uploadDate', '업로드 일시')}</TableCell>
              <TableCell align="center">{t('rag.document.list.actions', '작업')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => {
              const llmState = llmAnalysisStates[doc.id];
              const isExpanded = expandedRows[doc.id];
              const hasAnalysisData = llmState && llmState.status !== 'not_started';

              return (
                <React.Fragment key={doc.id}>
                  <TableRow hover>
                    {showExpand && (
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => onToggleExpand && onToggleExpand(doc.id)}
                          disabled={!hasAnalysisData || !onToggleExpand}
                        >
                          {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                    )}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon color="primary" fontSize="small" />
                        {doc.fileName}
                      </Box>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                    <TableCell>{getStatusChip(doc.analysisStatus)}</TableCell>
                    <TableCell>{getParserLabel(doc)}</TableCell>
                    <TableCell>{getEmbeddingStatusChip(doc)}</TableCell>
                    <TableCell>{doc.totalChunks || 0}</TableCell>
                    <TableCell>{getLlmAnalysisStatusChip(doc.id)}</TableCell>
                    <TableCell align="center">
                      {llmState && llmState.status !== 'not_started' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                          <CircularProgress
                            variant="determinate"
                            value={llmState.progress}
                            size={32}
                            color={getProgressColor(llmState.progress)}
                          />
                          <Typography variant="caption">{llmState.progress}%</Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {llmState && llmState.status !== 'not_started' ? (
                        <Chip
                          label={`${llmState.analyzedChunks} / ${llmState.totalChunks}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                    <TableCell align="center">
                      {actionHandler('preview') && doc.fileName?.toLowerCase().endsWith('.pdf') && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => actionHandler('preview')(doc)}
                          title={t('rag.document.preview', 'PDF 미리보기')}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      )}
                      {actionHandler('viewChunks') && (
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => actionHandler('viewChunks')(doc)}
                          title={t('rag.document.viewChunks', '청크 보기')}
                          disabled={!doc.totalChunks || doc.totalChunks === 0}
                        >
                          <ViewListIcon fontSize="small" />
                        </IconButton>
                      )}
                      {actionHandler('download') && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => actionHandler('download')(doc)}
                          title={t('rag.document.download', '문서 다운로드')}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      )}
                      {actionHandler('analyze') && (
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => actionHandler('analyze')(doc)}
                          title={t('rag.document.analyze', '문서 분석')}
                          disabled={doc.analysisStatus === 'completed' || doc.analysisStatus === 'processing'}
                        >
                          <AnalyticsIcon fontSize="small" />
                        </IconButton>
                      )}
                      {actionHandler('generateEmbeddings') && (
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => actionHandler('generateEmbeddings')(doc)}
                          title={t('rag.document.generateEmbedding', '임베딩 생성')}
                          disabled={doc.analysisStatus !== 'completed' || doc.metaData?.embedding_status === 'completed' || doc.metaData?.embedding_status === 'processing'}
                        >
                          <AutoAwesomeIcon fontSize="small" />
                        </IconButton>
                      )}
                      {actionHandler('llmAnalysis') && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => actionHandler('llmAnalysis')(doc)}
                          title={t('rag.document.llmAnalysis', 'LLM 분석')}
                          disabled={!doc.totalChunks || doc.totalChunks === 0}
                        >
                          <PsychologyIcon fontSize="small" />
                        </IconButton>
                      )}
                      {actionHandler('summary') && llmState && (llmState.status === 'completed' || llmState.status === 'processing' || llmState.status === 'paused') && (
                        <Tooltip title={t('rag.document.summary', 'LLM 분석 요약 보기')}>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => actionHandler('summary')(doc)}
                            disabled={!llmState.analyzedChunks || llmState.analyzedChunks === 0}
                          >
                            <SummarizeIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {actionHandler('jobHistory') && (
                        <Tooltip title={t('rag.document.jobHistory', '작업 이력 보기')}>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => actionHandler('jobHistory')(doc)}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {renderExtraActions && renderExtraActions(doc)}
                      {actionHandler('delete') && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => actionHandler('delete')(doc)}
                          title={t('rag.document.delete', '문서 삭제')}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>

                  {showExpand && (
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              LLM 분석 작업 상세 정보
                            </Typography>
                            {hasAnalysisData ? (
                              <Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">LLM 제공자</Typography>
                                    <Typography variant="body2">{llmState.llmProvider || '-'}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">LLM 모델</Typography>
                                    <Typography variant="body2">{llmState.llmModel || '-'}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">비용 (USD)</Typography>
                                    <Typography variant="body2" color="primary.main" fontWeight="bold">
                                      ${(llmState.totalCostUsd || 0).toFixed(4)}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">총 토큰</Typography>
                                    <Typography variant="body2">{(llmState.totalTokens || 0).toLocaleString()}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">시작 시각</Typography>
                                    <Typography variant="body2">{formatDateFromISO(llmState.startedAt)}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">완료 시각</Typography>
                                    <Typography variant="body2">{formatDateFromISO(llmState.completedAt)}</Typography>
                                  </Box>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">진행률</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {llmState.analyzedChunks} / {llmState.totalChunks} 청크 ({llmState.progress}%)
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={llmState.progress}
                                    color={getProgressColor(llmState.progress)}
                                    sx={{ height: 8, borderRadius: 1 }}
                                  />
                                </Box>

                                {llmState.errorMessage && (
                                  <Alert severity="error" sx={{ mb: 2 }}>
                                    {llmState.errorMessage}
                                  </Alert>
                                )}

                                {(onPauseJob || onResumeJob || onCancelJob) && (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    {onPauseJob && llmState.status === 'processing' && (
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="warning"
                                        startIcon={<PauseIcon />}
                                        onClick={() => onPauseJob(doc.id)}
                                      >
                                        일시정지
                                      </Button>
                                    )}
                                    {onResumeJob && llmState.status === 'paused' && (
                                      <Button
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<PlayArrowIcon />}
                                        onClick={() => onResumeJob(doc.id)}
                                      >
                                        재개
                                      </Button>
                                    )}
                                    {onCancelJob && (llmState.status === 'processing' || llmState.status === 'paused') && (
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        color="error"
                                        startIcon={<StopIcon />}
                                        onClick={() => onCancelJob(doc.id, doc.fileName)}
                                      >
                                        취소
                                      </Button>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                LLM 분석 작업 정보가 없습니다.
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

DocumentTableSection.propTypes = {
  title: PropTypes.string,
  documents: PropTypes.arrayOf(PropTypes.object),
  llmAnalysisStates: PropTypes.object,
  expandedRows: PropTypes.object,
  onToggleExpand: PropTypes.func,
  onPauseJob: PropTypes.func,
  onResumeJob: PropTypes.func,
  onCancelJob: PropTypes.func,
  actionHandlers: PropTypes.object,
  renderExtraActions: PropTypes.func,
  showExpand: PropTypes.bool,
};

export default DocumentTableSection;
