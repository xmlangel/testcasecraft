// src/components/RAG/RAGDocumentManager.jsx
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Grid, Alert, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DocumentList from './DocumentList.jsx';
import SimilarTestCases from './SimilarTestCases.jsx';
import RAGChatInterface from './RAGChatInterface.jsx';
import DocumentChunks from './DocumentChunks.jsx'; // 청크 다이얼로그 임포트
import DocumentAnalysis from './DocumentAnalysis.jsx'; // LLM 분석 컴포넌트
import AnalysisSummaryManager from './AnalysisSummaryManager.jsx'; // 분석 요약 관리 컴포넌트
import { RAGProvider, useRAG, RAG_DISABLED_MESSAGE } from '../../context/RAGContext.jsx';
import { LlmConfigProvider } from '../../context/LlmConfigContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { PAGE_CONTAINER_SX, GRID_SETTINGS, RESPONSIVE_SETTINGS } from '../../styles/layoutConstants';

function RAGDocumentManagerContent({ projectId, onAddTestCase }) {
  const { t } = useI18n();
  const { getDocument } = useRAG();

  // 청크 다이얼로그 상태 관리
  const [chunksModalState, setChunksModalState] = useState({
    open: false,
    document: null,
    highlightChunkId: null,
    relatedChunkIndices: null, // AI가 참조한 관련 청크 인덱스 목록
  });

  // LLM 분석 다이얼로그 상태 관리
  const [llmAnalysisModalState, setLlmAnalysisModalState] = useState({
    open: false,
    document: null,
  });

  const handleAddTestCase = useCallback((testCaseData) => {
    if (onAddTestCase) {
      onAddTestCase(testCaseData);
    }
  }, [onAddTestCase]);

  // 채팅창에서 문서 클릭 시 (청크 인덱스와 함께 호출됨)
  const handleDocumentClick = useCallback(async (ragDocument) => {
    // documentId 결정: ragDocument.documentId 또는 ragDocument.id 사용
    const documentId = ragDocument?.documentId || ragDocument?.id;

    if (!ragDocument || !documentId || ragDocument.fileName?.startsWith('testcase_')) {
      return;
    }

    const modalState = {
      open: true,
      document: {
        ...ragDocument,
        id: documentId, // 명시적으로 id 설정
      },
      highlightChunkId: ragDocument.chunkId,
      relatedChunkIndices: ragDocument.relatedChunkIndices || null, // 관련 청크 인덱스 목록 전달
    };

    setChunksModalState(modalState);
  }, []);

  // 문서 목록에서 '청크 보기' 버튼 클릭 시
  const handleViewChunks = useCallback((document) => {
    setChunksModalState({
      open: true,
      document,
      highlightChunkId: null, // 특정 청크 하이라이트 없음
      relatedChunkIndices: null, // 전체 청크 보기
    });
  }, []);

  const handleCloseChunksDialog = useCallback(() => {
    setChunksModalState({ open: false, document: null, highlightChunkId: null });
  }, []);

  // LLM 분석 다이얼로그 열기
  const handleLlmAnalysis = useCallback((document) => {
    setLlmAnalysisModalState({
      open: true,
      document,
    });
  }, []);

  // LLM 분석 다이얼로그 닫기
  const handleCloseLlmAnalysis = useCallback(() => {
    setLlmAnalysisModalState({ open: false, document: null });
  }, []);

  if (!projectId) {
    return (
      <Box sx={PAGE_CONTAINER_SX.main}>
        <Alert severity="warning">
          {t('rag.manager.noProject', '프로젝트를 먼저 선택해주세요.')}
        </Alert>
      </Box>
    );
  }

  if (RAG_DISABLED_MESSAGE) {
    return (
      <Box sx={PAGE_CONTAINER_SX.main}>
        <Alert severity="info">{RAG_DISABLED_MESSAGE}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={PAGE_CONTAINER_SX.main}>
      <Grid {...GRID_SETTINGS.mainContent}>
        {/* AI Q&A Chat Section */}
        <Grid item {...RESPONSIVE_SETTINGS.fullWidth}>
          <RAGChatInterface
            projectId={projectId}
            onDocumentClick={handleDocumentClick}
          />
        </Grid>

        {/* Document List */}
        <Grid item {...RESPONSIVE_SETTINGS.fullWidth} id="document-list-section">
          <DocumentList
            projectId={projectId}
            onViewChunks={handleViewChunks}
            onLlmAnalysis={handleLlmAnalysis}
          />
        </Grid>

        {/* Similar Test Cases Search Section - 업로드 리스트 아래 배치 */}
        <Grid item {...RESPONSIVE_SETTINGS.fullWidth}>
          <SimilarTestCases
            projectId={projectId}
            onAddTestCase={handleAddTestCase}
          />
        </Grid>

        {/* Analysis Summary Manager - 분석 요약 관리 */}
        <Grid item {...RESPONSIVE_SETTINGS.fullWidth}>
          <AnalysisSummaryManager projectId={projectId} />
        </Grid>
      </Grid>

      {/* 청크 보기 다이얼로그 렌더링 */}
      {chunksModalState.document && (
        <DocumentChunks
          open={chunksModalState.open}
          onClose={handleCloseChunksDialog}
          documentId={chunksModalState.document.id}
          documentName={chunksModalState.document.fileName}
          highlightChunkId={chunksModalState.highlightChunkId}
          relatedChunkIndices={chunksModalState.relatedChunkIndices}
        />
      )}

      {/* LLM 분석 다이얼로그 렌더링 */}
      {llmAnalysisModalState.document && (
        <Dialog
          open={llmAnalysisModalState.open}
          onClose={handleCloseLlmAnalysis}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {t('rag.llmAnalysis.title', 'LLM 청크 분석')} - {llmAnalysisModalState.document.fileName}
            <IconButton onClick={handleCloseLlmAnalysis} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <DocumentAnalysis document={llmAnalysisModalState.document} />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}

RAGDocumentManagerContent.propTypes = {
  projectId: PropTypes.string.isRequired,
  onAddTestCase: PropTypes.func,
};

function RAGDocumentManager(props) {
  return (
    <LlmConfigProvider>
      <RAGProvider>
        <RAGDocumentManagerContent {...props} />
      </RAGProvider>
    </LlmConfigProvider>
  );
}

RAGDocumentManager.propTypes = {
  projectId: PropTypes.string.isRequired,
  onAddTestCase: PropTypes.func,
};

export default RAGDocumentManager;
