// src/components/RAG/RAGDocumentManager.jsx
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Container, Grid, Alert } from '@mui/material';
import DocumentList from './DocumentList.jsx';
import SimilarTestCases from './SimilarTestCases.jsx';
import RAGChatInterface from './RAGChatInterface.jsx';
import { RAGProvider, useRAG, RAG_DISABLED_MESSAGE } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';

function RAGDocumentManagerContent({ projectId, onAddTestCase }) {
  const { t } = useI18n();
  const { getDocument } = useRAG();

  const handleAddTestCase = useCallback((testCaseData) => {
    if (onAddTestCase) {
      onAddTestCase(testCaseData);
    }
  }, [onAddTestCase]);

  const handleDocumentClick = useCallback(async (ragDocument) => {
    if (!ragDocument || ragDocument.fileName?.startsWith('testcase_')) {
      return;
    }

    console.log('문서 클릭:', ragDocument);

    try {
      // 문서 상세 정보 가져오기
      if (ragDocument.id) {
        await getDocument(ragDocument.id);

        // 문서 리스트로 스크롤 (선택사항)
        const documentListElement =
          typeof window !== 'undefined' ? window.document.getElementById('document-list-section') : null;
        if (documentListElement) {
          documentListElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } catch (error) {
      console.error('문서 상세 조회 실패:', error);
    }
  }, [getDocument]);

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
          <DocumentList projectId={projectId} />
        </Grid>

        {/* Similar Test Cases Search Section */}
        <Grid item xs={12} md={4}>
          <SimilarTestCases
            projectId={projectId}
            onAddTestCase={handleAddTestCase}
          />
        </Grid>
      </Grid>
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
