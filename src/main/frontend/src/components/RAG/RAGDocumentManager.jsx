// src/components/RAG/RAGDocumentManager.jsx
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Box, Container, Grid, Alert } from '@mui/material';
import DocumentUpload from './DocumentUpload.jsx';
import SimilarTestCases from './SimilarTestCases.jsx';
import { RAGProvider } from '../../context/RAGContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';

function RAGDocumentManagerContent({ projectId, onAddTestCase }) {
  const { t } = useI18n();

  const handleUploadSuccess = useCallback((document) => {
    console.log('문서 업로드 성공:', document);
  }, []);

  const handleAddTestCase = useCallback((testCaseData) => {
    if (onAddTestCase) {
      onAddTestCase(testCaseData);
    }
  }, [onAddTestCase]);

  if (!projectId) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">
          {t('rag.manager.noProject', '프로젝트를 먼저 선택해주세요.')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Document Upload Section */}
        <Grid item xs={12}>
          <DocumentUpload
            projectId={projectId}
            onUploadSuccess={handleUploadSuccess}
          />
        </Grid>

        {/* Similar Test Cases Search Section */}
        <Grid item xs={12}>
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
