// src/components/RAG/TestCasePreview.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext.jsx';
import testCaseService from '../../services/testCaseService.js';

/**
 * AI가 생성한 테스트케이스 프리뷰 및 추가 컴포넌트
 */
function TestCasePreview({ testCaseData, projectId, onSuccess }) {
  const { t } = useI18n();
  const [isCreating, setIsCreating] = useState(false);
  const [createStatus, setCreateStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');
  const [createdTestCaseId, setCreatedTestCaseId] = useState(null);

  const handleCreateTestCase = async () => {
    setIsCreating(true);
    setCreateStatus(null);
    setErrorMessage('');

    try {
      // 테스트케이스 데이터 준비
      const payload = {
        name: testCaseData.name,
        description: testCaseData.description || '',
        type: 'testcase',
        projectId: projectId,
        parentId: testCaseData.parentId || null,
        priority: testCaseData.priority || 'MEDIUM',
        tags: testCaseData.tags || [],
        steps: (testCaseData.steps || []).map((step, index) => ({
          stepNumber: step.stepNumber || index + 1,
          action: step.action || '',
          expected: step.expected || step.expectedResult || '',
          notes: step.notes || '',
        })),
        preCondition: testCaseData.preCondition || testCaseData.preconditions || '',
        expectedResults: testCaseData.expectedResults || '',
      };

      // API 호출
      const result = await testCaseService.createTestCase(payload);

      setCreateStatus('success');
      setCreatedTestCaseId(result.id);

      // 성공 콜백 호출
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      // console.error('테스트케이스 생성 실패:', error);
      setCreateStatus('error');
      setErrorMessage(error.message || t('rag.testcase.createError', '테스트케이스 생성에 실패했습니다.'));
    } finally {
      setIsCreating(false);
    }
  };

  const getPriorityColor = (priority) => {
    const p = (priority || 'MEDIUM').toUpperCase();
    switch (p) {
      case 'HIGH':
        return 'error';
      case 'LOW':
        return 'success';
      default:
        return 'warning';
    }
  };

  const getPriorityLabel = (priority) => {
    const p = (priority || 'MEDIUM').toUpperCase();
    switch (p) {
      case 'HIGH':
        return t('testcase.priority.high', '높음');
      case 'LOW':
        return t('testcase.priority.low', '낮음');
      default:
        return t('testcase.priority.medium', '보통');
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        mt: 2,
        borderColor: createStatus === 'success' ? 'success.main' : 'primary.main',
        borderWidth: 2,
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" component="div" color="primary">
            {t('rag.testcase.preview.title', '✨ AI 생성 테스트케이스')}
          </Typography>
          {createStatus === 'success' && (
            <Chip
              icon={<CheckCircleIcon />}
              label={t('rag.testcase.created', '생성 완료')}
              color="success"
              size="small"
            />
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* 기본 정보 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {t('testcase.field.name', '테스트케이스명')}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2 }}>
            {testCaseData.name}
          </Typography>

          {testCaseData.description && (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('testcase.field.description', '설명')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {testCaseData.description}
              </Typography>
            </>
          )}

          {/* 우선순위 */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('testcase.field.priority', '우선순위')}:
            </Typography>
            <Chip
              label={getPriorityLabel(testCaseData.priority)}
              color={getPriorityColor(testCaseData.priority)}
              size="small"
            />
          </Stack>

          {/* 태그 */}
          {testCaseData.tags && testCaseData.tags.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('testcase.field.tags', '태그')}
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {testCaseData.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" variant="outlined" />
                ))}
              </Stack>
            </Box>
          )}

          {/* 전제조건 */}
          {testCaseData.preCondition && (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('testcase.field.preCondition', '전제조건')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
                {testCaseData.preCondition}
              </Typography>
            </>
          )}
        </Box>

        {/* 테스트 스텝 */}
        {testCaseData.steps && testCaseData.steps.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('testcase.field.steps', '테스트 스텝')}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="10%" align="center">
                      {t('testcase.step.number', '번호')}
                    </TableCell>
                    <TableCell width="45%">{t('testcase.step.action', '동작')}</TableCell>
                    <TableCell width="45%">{t('testcase.step.expected', '예상 결과')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {testCaseData.steps.map((step, index) => (
                    <TableRow key={index}>
                      <TableCell align="center">{step.stepNumber || index + 1}</TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-wrap' }}>{step.action}</TableCell>
                      <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                        {step.expected || step.expectedResult}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* 예상 결과 */}
        {testCaseData.expectedResults && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {t('testcase.field.expectedResults', '예상 결과')}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {testCaseData.expectedResults}
            </Typography>
          </>
        )}

        {/* 상태 메시지 */}
        {createStatus === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {t('rag.testcase.createSuccess', '테스트케이스가 성공적으로 생성되었습니다!')}
            {createdTestCaseId && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                ID: {createdTestCaseId}
              </Typography>
            )}
          </Alert>
        )}

        {createStatus === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }} icon={<ErrorIcon />}>
            {errorMessage}
          </Alert>
        )}
      </CardContent>

      {/* 액션 버튼 */}
      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={isCreating ? <CircularProgress size={16} /> : <AddIcon />}
          onClick={handleCreateTestCase}
          disabled={isCreating || createStatus === 'success'}
        >
          {isCreating
            ? t('rag.testcase.creating', '생성 중...')
            : createStatus === 'success'
            ? t('rag.testcase.created', '생성 완료')
            : t('rag.testcase.addToProject', '테스트케이스로 추가')}
        </Button>
      </CardActions>
    </Card>
  );
}

TestCasePreview.propTypes = {
  testCaseData: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    priority: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    steps: PropTypes.arrayOf(
      PropTypes.shape({
        stepNumber: PropTypes.number,
        action: PropTypes.string,
        expected: PropTypes.string,
        expectedResult: PropTypes.string,
        notes: PropTypes.string,
      })
    ),
    preCondition: PropTypes.string,
    preconditions: PropTypes.string,
    expectedResults: PropTypes.string,
    parentId: PropTypes.string,
  }).isRequired,
  projectId: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
};

export default TestCasePreview;
