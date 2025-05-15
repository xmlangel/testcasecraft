// src/components/TestResultForm.js

import React, { useState, useEffect, useRef } from 'react';
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

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const MULTILINE_SCROLL_SX = {
  whiteSpace: 'pre-line',
  maxHeight: '8.5em',
  overflowY: 'auto',
  display: 'block'
};

const KEY_RESULT_MAP = {
  N: TestResult.NOTRUN,
  P: TestResult.PASS,
  F: TestResult.FAIL,
  B: TestResult.BLOCKED,
};

const TestResultForm = ({
  open,
  testCaseId,
  executionId,
  currentResult = { result: TestResult.NOTRUN, notes: '' },
  onClose,
  onSave,
  onNext
}) => {
  const [testCase, setTestCase] = useState(null);
  const [result, setResult] = useState(currentResult.result);
  const [notes, setNotes] = useState(currentResult.notes || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');
  const saveButtonRef = useRef();

  // 최신 입력값을 항상 참조하기 위한 ref
  const resultRef = useRef(result);
  const notesRef = useRef(notes);

  // 입력값이 바뀔 때마다 ref도 갱신
  useEffect(() => {
    resultRef.current = result;
  }, [result]);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // currentResult가 바뀔 때마다 상태 동기화
  useEffect(() => {
    setResult(currentResult.result);
    setNotes(currentResult.notes || '');
  }, [currentResult]);

  // 테스트케이스 정보 로드
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

  // 키보드 단축키 처리
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (document.activeElement.tagName === 'TEXTAREA') return;

      const key = e.key.toUpperCase();

      if (KEY_RESULT_MAP[key]) {
        setResult(KEY_RESULT_MAP[key]);
        setTimeout(() => {
          handleSaveAndNext(KEY_RESULT_MAP[key]);
        }, 0);
        e.preventDefault();
        return;
      }

      if (
        e.key === 'Enter' &&
        (document.activeElement === saveButtonRef.current ||
          document.activeElement.tagName !== 'TEXTAREA')
      ) {
        handleSaveAndNext();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, testCaseId, executionId, onSave, onNext]);

  // 항상 최신값을 서버로 전송하도록 개선
  const handleSaveAndNext = async (customResult) => {
    const actualResult = customResult !== undefined ? customResult : resultRef.current;
    const actualNotes = notesRef.current;
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
            result: actualResult,
            notes: actualNotes
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결과 저장 실패');
      }

      const updatedExecution = await response.json();
      onSave(updatedExecution);
      if (onNext) {
        onNext();
      }
    } catch (err) {
      setSaveError(err.message);
    }
  };

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
                테스트케이스이름: {testCase.name}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={MULTILINE_SCROLL_SX}
              >
                테스트설명: {testCase.description}
              </Typography>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                사전조건:
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={MULTILINE_SCROLL_SX}
              >
                {testCase.preCondition}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {testCase.steps?.length > 0 && (
              <Box sx={{ mt: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  테스트 스텝 및 예상결과
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
                              <Typography
                                variant="body2"
                                sx={MULTILINE_SCROLL_SX}
                              >
                                {step.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={MULTILINE_SCROLL_SX}
                              >
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

            <Typography variant="subtitle1" gutterBottom>
              예상결과 (전체)
            </Typography>
            <Typography
              variant="body2"
              sx={MULTILINE_SCROLL_SX}
            >
              {testCase.expectedResults}
            </Typography>

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
          ref={saveButtonRef}
          onClick={() => handleSaveAndNext()}
          variant="contained"
          color="primary"
          disabled={loading || !testCase}
        >
          저장(다음)
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
  executionId: PropTypes.string.isRequired,
  currentResult: PropTypes.shape({
    result: PropTypes.oneOf(Object.values(TestResult)),
    notes: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onNext: PropTypes.func
};

export default TestResultForm;
