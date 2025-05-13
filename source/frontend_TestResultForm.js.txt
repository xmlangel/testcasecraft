// src/components/TestResultForm.js
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { TestResult } from '../models/testExecution';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://qaspecialist.shop';

const TestResultForm = ({
  open,
  testCaseId,
  executionId,
  currentResult = { result: TestResult.NOT_RUN, notes: '' },
  onClose,
  onSave
}) => {
  const [testCase, setTestCase] = useState(null);
  const [result, setResult] = useState(currentResult.result);
  const [notes, setNotes] = useState(currentResult.notes || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');

  // 테스트케이스 정보 백엔드에서 로드
  useEffect(() => {
    const fetchTestCase = async () => {
      if (testCaseId && open) {
        setLoading(true);
        try {
          const token = localStorage.getItem('jwtToken');
          const response = await fetch(`${API_BASE}/api/testcases/${testCaseId}`, {
            headers: { Authorization: token ? `Bearer ${token}` : undefined }
          });

          if (!response.ok) throw new Error('테스트케이스를 찾을 수 없습니다');
          const data = await response.json();
          setTestCase(data);
          setError('');
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTestCase();
  }, [testCaseId, open]);

  // 결과 저장 핸들러 (백엔드 API 호출)
  const handleSave = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch(
        `${API_BASE}/api/test-executions/${executionId}/results`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : undefined
          },
          body: JSON.stringify({
            testCaseId,
            result,
            notes
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결과 저장 실패');
      }

      const updatedExecution = await response.json();
      onSave(updatedExecution);
    } catch (err) {
      setSaveError(err.message);
    }
  }, [executionId, testCaseId, result, notes, onSave]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="test-result-dialog"
    >
      <DialogTitle id="test-result-dialog">테스트 결과 입력</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
        ) : testCase ? (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                테스트케이스: {testCase.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {testCase.description}
              </Typography>
              {/* 사전조건 표시 */}
              {testCase.preCondition && (
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    사전조건
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {testCase.preCondition}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 테스트 단계 및 예상결과 테이블 */}
            {testCase.steps?.length > 0 && (
              <Box sx={{ mt: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  테스트 단계 및 예상결과
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width="10%">단계</TableCell>
                        <TableCell width="60%">Step</TableCell>
                        <TableCell width="30%">예상결과</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {testCase.steps
                        .sort((a, b) => a.stepNumber - b.stepNumber)
                        .map((step) => (
                          <TableRow key={step.stepNumber}>
                            <TableCell>{step.stepNumber}</TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {step.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {step.expectedResult || '(없음)'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mt: 3 }}>
              <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                <FormLabel component="legend">테스트 결과</FormLabel>
                <RadioGroup
                  row
                  name="test-result"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                >
                  {Object.values(TestResult).map((value) => (
                    <FormControlLabel
                      key={value}
                      value={value}
                      control={<Radio />}
                      label={value.replace(/_/g, ' ')}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              <TextField
                label="메모 및 특이사항"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                sx={{ mt: 2 }}
              />
            </Box>
          </>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading || !testCase}
        >
          저장
        </Button>
      </DialogActions>

      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError('')}
      >
        <Alert severity="error" onClose={() => setSaveError('')}>
          {saveError}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

TestResultForm.propTypes = {
  open: PropTypes.bool.isRequired,
  testCaseId: PropTypes.string.isRequired,
  executionId: PropTypes.string.isRequired, // 필수 항목으로 변경
  currentResult: PropTypes.shape({
    result: PropTypes.oneOf(Object.values(TestResult)),
    notes: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default TestResultForm;
