// src/components/RAG/DocumentList.jsx
import React, { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  TablePagination,
  Alert,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PublicIcon from '@mui/icons-material/Public';
import SendIcon from '@mui/icons-material/Send';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useRAG } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { useAppContext } from '../../context/AppContext.jsx';
import DocumentTableSection from './DocumentTableSection.jsx';
import DocumentListHeader from './DocumentListHeader.jsx';
import DocumentListTabs from './DocumentListTabs.jsx';
import SummaryDialog from './SummaryDialog.jsx';
import JobHistoryDialog from './JobHistoryDialog.jsx';
import DocumentListDialogs from './DocumentListDialogs.jsx';
import { DOCUMENT_LIST_CONSTANTS } from './constants.js';
import { filterRegularDocuments, filterTestCaseDocuments } from './utils/documentFilters.js';
import { useDocumentList } from './hooks/useDocumentList.js';
import { useExpandableRows } from './hooks/useExpandableRows.js';
import { useLlmAnalysisStates } from './hooks/useLlmAnalysisStates.js';
import { useDocumentActions } from './hooks/useDocumentActions.js';
import { useSummaryDialog } from './hooks/useSummaryDialog.js';
import { useJobHistory } from './hooks/useJobHistory.js';

/**
 * 문서 목록 컴포넌트
 * RAG 문서 목록을 표시하고 관리합니다.
 */
function DocumentList({ projectId, onViewChunks, onLlmAnalysis }) {
  const { t } = useI18n();
  const theme = useTheme();
  const colorMode = theme.palette.mode === 'dark' ? 'dark' : 'light';

  const {
    listDocuments,
    deleteDocument,
    downloadDocument,
    analyzeDocument,
    generateEmbeddings,
    getLlmAnalysisStatus,
    getLlmAnalysisResults,
    pauseAnalysis,
    resumeAnalysis,
    cancelAnalysis,
    listLlmAnalysisJobs,
    promoteDocumentToGlobal,
    requestPromoteDocument,
    fetchDocumentBlob,
    state,
  } = useRAG();

  const { user } = useAppContext();
  const isAdmin = user?.role === 'ADMIN';

  // 로컬 상태
  const [localError, setLocalError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);
  const [promoteDialogState, setPromoteDialogState] = useState({ open: false, document: null, reason: '' });
  const [requestDialogState, setRequestDialogState] = useState({ open: false, document: null, message: '' });
  const [promoteSubmitting, setPromoteSubmitting] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // 상태 알림 표시 헬퍼
  const showStatusNotice = useCallback((message, severity = 'info') => {
    setStatusNotice({ message, severity });
    setTimeout(() => setStatusNotice(null), DOCUMENT_LIST_CONSTANTS.STATUS_NOTICE_AUTO_DISMISS);
  }, []);

  // Custom Hooks
  const documentList = useDocumentList({ projectId, listDocuments, setLocalError });
  const {
    page,
    rowsPerPage,
    isRefreshing,
    loadDocuments,
    handleRefresh,
    handleChangePage,
    handleChangeRowsPerPage,
  } = documentList;

  const expandableRows = useExpandableRows();
  const { expandedRows, handleRowExpand } = expandableRows;

  const llmAnalysisStatesHook = useLlmAnalysisStates({
    documents: state.documents,
    getLlmAnalysisStatus,
    pauseAnalysis,
    resumeAnalysis,
    cancelAnalysis,
    showStatusNotice,
    setLocalError,
    t,
  });
  const {
    llmAnalysisStates,
    loadLlmAnalysisStates,
    handlePauseJob,
    handleResumeJob,
    handleCancelJob,
  } = llmAnalysisStatesHook;

  const documentActions = useDocumentActions({
    deleteDocument,
    downloadDocument,
    analyzeDocument,
    generateEmbeddings,
    loadDocuments,
    setLocalError,
    onViewChunks,
  });
  const {
    deleteDialogOpen,
    previewDialogState,
    chunksDialogState,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleDownloadClick,
    handleAnalyzeClick,
    handleGenerateEmbeddingsClick,
    handlePreviewClick,
    handleClosePreview,
    handleViewChunksAction,
    handleCloseChunksDialog,
  } = documentActions;

  const summaryDialog = useSummaryDialog({
    llmAnalysisStates,
    getLlmAnalysisResults,
    t,
  });
  const {
    summaryDialogOpen,
    selectedSummary,
    summaryContent,
    loadingSummary,
    isFullScreen,
    setIsFullScreen,
    summaryPaginationLabel,
    canGoPrevSummary,
    canGoNextSummary,
    summaryMarkdownStyles,
    handleViewSummary,
    handleSummaryPageChange,
    handleCloseSummary,
  } = summaryDialog;

  const jobHistory = useJobHistory({
    projectId,
    listLlmAnalysisJobs,
    setLocalError,
  });
  const {
    jobHistoryDialogOpen,
    selectedJobHistory,
    loadingJobHistory,
    handleViewJobHistory,
    handleCloseJobHistory,
  } = jobHistory;

  // 문서 목록 로드
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // LLM 분석 상태 로드
  useEffect(() => {
    loadLlmAnalysisStates();
  }, [loadLlmAnalysisStates]);

  // 새로고침 핸들러 (LLM 상태 포함)
  const handleRefreshWithStates = useCallback(async () => {
    await handleRefresh();
    await loadLlmAnalysisStates();
  }, [handleRefresh, loadLlmAnalysisStates]);

  // 업로드 다이얼로그
  const handleUploadDialogOpen = useCallback(() => {
    setUploadDialogOpen(true);
  }, []);

  const handleUploadDialogClose = useCallback(() => {
    setUploadDialogOpen(false);
  }, []);

  const handleUploadSuccess = useCallback(async () => {
    await loadDocuments();
    setUploadDialogOpen(false);
  }, [loadDocuments]);

  // 탭 변경
  const handleTabChange = useCallback((event, newValue) => {
    if (!isAdmin) {
      return;
    }
    setTabValue(newValue);
  }, [isAdmin]);

  // 공통 문서 관련
  const openPromoteDialog = useCallback((document) => {
    setPromoteDialogState({ open: true, document, reason: '' });
  }, []);

  const closePromoteDialog = useCallback(() => {
    setPromoteDialogState({ open: false, document: null, reason: '' });
  }, []);

  const openRequestDialog = useCallback((document) => {
    setRequestDialogState({ open: true, document, message: '' });
  }, []);

  const closeRequestDialog = useCallback(() => {
    setRequestDialogState({ open: false, document: null, message: '' });
  }, []);

  const handlePromoteSubmit = useCallback(async () => {
    if (!promoteDialogState.document) return;
    setPromoteSubmitting(true);
    try {
      await promoteDocumentToGlobal(
        promoteDialogState.document.id,
        promoteDialogState.reason?.trim() || null
      );
      showStatusNotice(
        t('rag.document.global.promoteSuccess', '선택한 문서가 공통 RAG 문서로 이동되었습니다.'),
        'success'
      );
      await loadDocuments();
      await loadLlmAnalysisStates();
    } catch (err) {
      const errorMessage = err.response?.data?.message || '공통 문서 이동에 실패했습니다.';
      setLocalError(errorMessage);
      setTimeout(() => setLocalError(null), DOCUMENT_LIST_CONSTANTS.ERROR_AUTO_DISMISS);
    } finally {
      setPromoteSubmitting(false);
      closePromoteDialog();
    }
  }, [promoteDialogState, promoteDocumentToGlobal, showStatusNotice, t, loadDocuments, loadLlmAnalysisStates, closePromoteDialog]);

  const handleRequestSubmit = useCallback(async () => {
    if (!requestDialogState.document) return;
    setRequestSubmitting(true);
    try {
      await requestPromoteDocument(
        requestDialogState.document.id,
        requestDialogState.message?.trim() || null
      );
      showStatusNotice(
        t('rag.document.global.requestSubmitted', '관리자에게 공통 문서 등록 요청이 전송되었습니다.'),
        'info'
      );
    } catch (err) {
      const errorMessage = err.response?.data?.message || '공통 문서 등록 요청에 실패했습니다.';
      setLocalError(errorMessage);
      setTimeout(() => setLocalError(null), DOCUMENT_LIST_CONSTANTS.ERROR_AUTO_DISMISS);
    } finally {
      setRequestSubmitting(false);
      closeRequestDialog();
    }
  }, [requestDialogState, requestPromoteDocument, showStatusNotice, t, closeRequestDialog]);

  // 문서 액션 렌더러
  const renderDocumentExtraActions = useCallback((doc) => {
    if (!doc) return null;
    if (isAdmin) {
      return (
        <Tooltip title={t('rag.document.global.promoteAction', '공통 문서로 이동')}>
          <IconButton size="small" color="secondary" onClick={() => openPromoteDialog(doc)}>
            <PublicIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    }
    return (
      <Tooltip title={t('rag.document.global.requestAction', '공통 문서 등록 요청')}>
        <IconButton size="small" color="secondary" onClick={() => openRequestDialog(doc)}>
          <SendIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }, [isAdmin, t, openPromoteDialog, openRequestDialog]);

  const handleDownloadDocumentAction = useCallback((doc) => {
    if (!doc) return;
    handleDownloadClick(doc.id, doc.fileName);
  }, [handleDownloadClick]);

  const handleDeleteDocumentAction = useCallback((doc) => {
    if (!doc) return;
    handleDeleteClick(doc.id);
  }, [handleDeleteClick]);

  // 문서 필터링
  const regularDocuments = filterRegularDocuments(state.documents);
  const testCaseDocuments = filterTestCaseDocuments(state.documents);

  // 빈 상태 렌더링
  if (state.documents.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <DescriptionIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          {t('rag.document.empty', '업로드된 문서가 없습니다')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('rag.document.emptyDescription', '문서 업로드 버튼을 사용하여 파일을 추가하세요')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{ mt: 2 }}
          onClick={handleUploadDialogOpen}
        >
          {t('rag.document.list.uploadButton', '문서 업로드')}
        </Button>

        <DocumentListDialogs
          deleteDialogOpen={false}
          onDeleteCancel={() => { }}
          onDeleteConfirm={() => { }}
          uploadDialogOpen={uploadDialogOpen}
          onUploadClose={handleUploadDialogClose}
          onUploadSuccess={handleUploadSuccess}
          projectId={projectId}
          promoteDialogState={{ open: false, document: null, reason: '' }}
          onPromoteClose={() => { }}
          onPromoteReasonChange={() => { }}
          onPromoteSubmit={() => { }}
          promoteSubmitting={false}
          requestDialogState={{ open: false, document: null, message: '' }}
          onRequestClose={() => { }}
          onRequestMessageChange={() => { }}
          onRequestSubmit={() => { }}
          requestSubmitting={false}
          previewDialogState={{ open: false, document: null }}
          onPreviewClose={() => { }}
          fetchPreview={fetchDocumentBlob}
          chunksDialogState={{ open: false, document: null }}
          onChunksClose={() => { }}
          onViewChunks={onViewChunks}
          t={t}
        />
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={5} className="glass-border" sx={{ p: 3 }}>
        {/* 에러 및 상태 알림 */}
        {localError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLocalError(null)}>
            {localError}
          </Alert>
        )}
        {statusNotice && (
          <Alert
            severity={statusNotice.severity}
            sx={{ mb: 2 }}
            onClose={() => setStatusNotice(null)}
          >
            {statusNotice.message}
          </Alert>
        )}

        {/* 헤더 */}
        <DocumentListHeader
          title={t('rag.document.list.title', '문서 목록')}
          onRefresh={handleRefreshWithStates}
          onUpload={handleUploadDialogOpen}
          isRefreshing={isRefreshing}
          isLoading={state.loading}
          t={t}
        />

        {/* 탭 */}
        <DocumentListTabs
          tabValue={tabValue}
          onTabChange={handleTabChange}
          regularCount={regularDocuments.length}
          testCaseCount={testCaseDocuments.length}
          isAdmin={isAdmin}
          t={t}
        />

        {/* 일반 문서 */}
        {(!isAdmin || tabValue === 0) && (
          <DocumentTableSection
            title={t('rag.document.list.regularDocuments', '업로드된 문서')}
            documents={regularDocuments}
            llmAnalysisStates={llmAnalysisStates}
            expandedRows={expandedRows}
            onToggleExpand={handleRowExpand}
            onPauseJob={handlePauseJob}
            onResumeJob={handleResumeJob}
            onCancelJob={handleCancelJob}
            actionHandlers={{
              preview: handlePreviewClick,
              viewChunks: handleViewChunksAction,
              download: handleDownloadDocumentAction,
              analyze: handleAnalyzeClick,
              generateEmbeddings: handleGenerateEmbeddingsClick,
              llmAnalysis: onLlmAnalysis,
              summary: handleViewSummary,
              jobHistory: handleViewJobHistory,
              delete: handleDeleteDocumentAction,
            }}
            renderExtraActions={renderDocumentExtraActions}
          />
        )}

        {/* 테스트케이스 문서 (관리자만) */}
        {isAdmin && tabValue === 1 && (
          <DocumentTableSection
            title={t('rag.document.list.testCaseDocuments', '테스트케이스 문서')}
            documents={testCaseDocuments}
            llmAnalysisStates={llmAnalysisStates}
            expandedRows={expandedRows}
            onToggleExpand={handleRowExpand}
            onPauseJob={handlePauseJob}
            onResumeJob={handleResumeJob}
            onCancelJob={handleCancelJob}
            actionHandlers={{
              preview: handlePreviewClick,
              viewChunks: handleViewChunksAction,
              download: handleDownloadDocumentAction,
              analyze: handleAnalyzeClick,
              generateEmbeddings: handleGenerateEmbeddingsClick,
              llmAnalysis: onLlmAnalysis,
              summary: handleViewSummary,
              jobHistory: handleViewJobHistory,
              delete: handleDeleteDocumentAction,
            }}
            renderExtraActions={renderDocumentExtraActions}
          />
        )}

        {/* 페이지네이션 */}
        <TablePagination
          component="div"
          count={state.pagination.total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={DOCUMENT_LIST_CONSTANTS.ROWS_PER_PAGE_OPTIONS}
          labelRowsPerPage={t('rag.document.pagination.rowsPerPage', '페이지당 행 수:')}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </Paper>

      {/* 요약 다이얼로그 */}
      <SummaryDialog
        open={summaryDialogOpen}
        onClose={handleCloseSummary}
        selectedSummary={selectedSummary}
        summaryContent={summaryContent}
        loadingSummary={loadingSummary}
        isFullScreen={isFullScreen}
        onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
        summaryPaginationLabel={summaryPaginationLabel}
        canGoPrevSummary={canGoPrevSummary}
        canGoNextSummary={canGoNextSummary}
        onPageChange={handleSummaryPageChange}
        summaryMarkdownStyles={summaryMarkdownStyles}
        colorMode={colorMode}
        t={t}
      />

      {/* 작업 이력 다이얼로그 */}
      <JobHistoryDialog
        open={jobHistoryDialogOpen}
        onClose={handleCloseJobHistory}
        selectedJobHistory={selectedJobHistory}
        loadingJobHistory={loadingJobHistory}
        t={t}
      />

      {/* 기타 다이얼로그 */}
      <DocumentListDialogs
        deleteDialogOpen={deleteDialogOpen}
        onDeleteCancel={handleDeleteCancel}
        onDeleteConfirm={handleDeleteConfirm}
        uploadDialogOpen={uploadDialogOpen}
        onUploadClose={handleUploadDialogClose}
        onUploadSuccess={handleUploadSuccess}
        projectId={projectId}
        promoteDialogState={promoteDialogState}
        onPromoteClose={closePromoteDialog}
        onPromoteReasonChange={(e) => setPromoteDialogState(prev => ({ ...prev, reason: e.target.value }))}
        onPromoteSubmit={handlePromoteSubmit}
        promoteSubmitting={promoteSubmitting}
        requestDialogState={requestDialogState}
        onRequestClose={closeRequestDialog}
        onRequestMessageChange={(e) => setRequestDialogState(prev => ({ ...prev, message: e.target.value }))}
        onRequestSubmit={handleRequestSubmit}
        requestSubmitting={requestSubmitting}
        previewDialogState={previewDialogState}
        onPreviewClose={handleClosePreview}
        fetchPreview={fetchDocumentBlob}
        chunksDialogState={chunksDialogState}
        onChunksClose={handleCloseChunksDialog}
        onViewChunks={onViewChunks}
        t={t}
      />
    </>
  );
}

DocumentList.propTypes = {
  projectId: PropTypes.string.isRequired,
  onViewChunks: PropTypes.func.isRequired,
  onLlmAnalysis: PropTypes.func,
};

export default DocumentList;
