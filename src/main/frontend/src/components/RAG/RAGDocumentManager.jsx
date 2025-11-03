// src/components/RAG/RAGDocumentManager.jsx
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Container, Grid, Alert } from '@mui/material';
import DocumentList from './DocumentList.jsx';
import SimilarTestCases from './SimilarTestCases.jsx';
import RAGChatInterface from './RAGChatInterface.jsx';
import DocumentChunks from './DocumentChunks.jsx'; // 청크 다이얼로그 임포트
import { RAGProvider, useRAG, RAG_DISABLED_MESSAGE } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';

function RAGDocumentManagerContent({ projectId, onAddTestCase }) {
  const { t } = useI18n();
  const { getDocument } = useRAG();
  
  // 청크 다이얼로그 상태 관리
  const [chunksModalState, setChunksModalState] = useState({
    open: false,
    document: null,
    highlightChunkId: null,
  });

  const handleAddTestCase = useCallback((testCaseData) => {
    if (onAddTestCase) {
      onAddTestCase(testCaseData);
    }
  }, [onAddTestCase]);

  // 채팅창에서 문서 클릭 시 (청크 ID와 함께 호출됨)
  const handleDocumentClick = useCallback(async (ragDocument) => {
    if (!ragDocument || !ragDocument.id || ragDocument.fileName?.startsWith('testcase_')) {
      return;
    }
    setChunksModalState({
      open: true,
      document: ragDocument,
      highlightChunkId: ragDocument.chunkId,
    });
  }, []);

  // 문서 목록에서 '청크 보기' 버튼 클릭 시
  const handleViewChunks = useCallback((document) => {
    setChunksModalState({
      open: true,
      document,
      highlightChunkId: null, // 특정 청크 하이라이트 없음
    });
  }, []);

  const handleCloseChunksDialog = useCallback(() => {
    setChunksModalState({ open: false, document: null, highlightChunkId: null });
  }, []);

  if (!projectId) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="warning">
          {t('rag.manager.noProject', '프로젝트를 먼저 선택해주세요.')}
        </Alert>
      </Container>
    );
  }

  if (RAG_DISABLED_MESSAGE) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="info">{RAG_DISABLED_MESSAGE}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* AI Q&A Chat Section */}
        <Grid item xs={12}>
          <RAGChatInterface
            projectId={projectId}
            onDocumentClick={handleDocumentClick}
          />
        </Grid>

        {/* Document List */}
        <Grid item xs={12} md={8} id="document-list-section">
          <DocumentList projectId={projectId} onViewChunks={handleViewChunks} />
        </Grid>

        {/* Similar Test Cases Search Section */}
        <Grid item xs={12} md={4}>
          <SimilarTestCases
            projectId={projectId}
            onAddTestCase={handleAddTestCase}
          />
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
        />
      )}
    </Container>
  );
}

RAGDocumentManagerContent.propTypes = {
  projectId: PropTypes.string.isRequired,
  onAddTestCase: PropTypes.func,
};

function RAGDocumentManager(props) {
  return (
    <RAGProvider>
      <RAGDocumentManagerContent {...props} />
    </RAGProvider>
  );
}

RAGDocumentManager.propTypes = {
  projectId: PropTypes.string.isRequired,
  onAddTestCase: PropTypes.func,
};

export default RAGDocumentManager;
