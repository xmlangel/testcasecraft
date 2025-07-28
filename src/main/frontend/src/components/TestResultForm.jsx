import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, 
  Radio, Typography, Box, Divider, CircularProgress, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper
} from '@mui/material';
import { TestResult } from '../models/testExecution.jsx';
import { useAppContext } from '../context/AppContext.jsx';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const MULTILINE_SCROLLS_SX = {
  whiteSpace: 'pre-line',
  maxHeight: '20em',
  overflowY: 'auto',
  display: 'block'
};

const KEY_RESULT_MAP = {
  'N': TestResult.NOTRUN,
  'P': TestResult.PASS,
  'F': TestResult.FAIL,
  'B': TestResult.BLOCKED
};

const TestResultForm = ({
  open,
  testCaseId,
  executionId,
  currentResult,
  onClose,
  onSave,
  onNext,
}) => {
  const { user, api } = useAppContext();
  const isViewer = user?.role === 'VIEWER';

  const [testCase, setTestCase] = useState(null);
  const [result, setResult] = useState(TestResult.NOTRUN);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [saveError, setSaveError] = useState();
  const saveButtonRef = useRef();

  useEffect(() => {
    setResult(currentResult?.result || TestResult.NOTRUN);
    setNotes(currentResult?.notes || '');
  }, [currentResult]);

  useEffect(() => {
    const fetchTestCase = async () => {
      if (!testCaseId || !open) return;

      setLoading(true);
      try {
        const response = await api(`${API_BASE_URL}/api/testcases/${testCaseId}`);

        if (!response.ok) throw new Error('테스트케이스를 불러오지 못했습니다.');

        const data = await response.json();
        setTestCase(data);
        setError(undefined);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestCase();
  }, [testCaseId, open, api]);

  const handleSaveAndNext = useCallback(async (customResult) => {
    if (isViewer) return;

    const actualResult = customResult !== undefined ? customResult : result;

    if (actualResult === undefined || actualResult === null) {
      setSaveError('테스트 결과를 선택해주세요.');
      return;
    }

    try {
      const response = await api(`${API_BASE_URL}/api/test-executions/${executionId}/results`, {
        method: 'POST',
        body: JSON.stringify({
          testCaseId,
          result: actualResult,
          notes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결과 저장에 실패했습니다.');
      }

      const updatedExecution = await response.json();
      onSave(updatedExecution);
      if (onNext) onNext();
    } catch (err) {
      setSaveError(err.message);
    }
  }, [api, executionId, testCaseId, notes, onSave, onNext, isViewer, result]);

  useEffect(() => {
    if (!open || isViewer) return;

    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (document.activeElement.tagName === 'TEXTAREA') return;

      const key = e.key.toUpperCase();
      if (KEY_RESULT_MAP[key]) {
        const newResult = KEY_RESULT_MAP[key];
        setResult(newResult);
        setTimeout(() => handleSaveAndNext(newResult), 0);
        e.preventDefault();
        return;
      }

      if (e.key === 'Enter') {
        if (document.activeElement !== saveButtonRef.current &&
            document.activeElement.tagName !== 'TEXTAREA') {
          handleSaveAndNext(result);
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, isViewer, handleSaveAndNext, result]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="test-result-dialog"
    >
      <DialogTitle id="test-result-dialog">
        테스트 결과 입력
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : testCase ? (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                {testCase.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={MULTILINE_SCROLLS_SX}>
                {testCase.description}
              </Typography>
            </Box>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              사전 조건
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={MULTILINE_SCROLLS_SX}>
              {testCase.preCondition}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {testCase.steps?.length > 0 && (
              <Box sx={{ mt: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  테스트 단계
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width="10%">No.</TableCell>
                        <TableCell width="60%">Step</TableCell>
                        <TableCell width="30%">Expected</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {testCase.steps
                        .sort((a, b) => a.stepNumber - b.stepNumber)
                        .map((step) => (
                          <TableRow key={step.stepNumber}>
                            <TableCell>{step.stepNumber}</TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={MULTILINE_SCROLLS_SX}>
                                {step.description}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary" sx={MULTILINE_SCROLLS_SX}>
                                {step.expectedResult}
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

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                기대 결과
              </Typography>
              <Typography variant="body2" sx={MULTILINE_SCROLLS_SX}>
                {testCase.expectedResults}
              </Typography>
            </Box>
          </>
        ) : null}

        <Box sx={{ mt: 3 }}>
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }} disabled={isViewer}>
            <FormLabel component="legend">테스트 결과</FormLabel>
            <RadioGroup
              row
              name="test-result"
              value={result || ''}
              onChange={(e) => setResult(e.target.value)}
            >
              {Object.values(TestResult).map((value) => (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio />}
                  label={value.replace('_', ' ')}
                  disabled={isViewer}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <TextField
            label="노트"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{ mt: 2 }}
            disabled={isViewer}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          취소
        </Button>
        {!isViewer && (
          <Button
            ref={saveButtonRef}
            onClick={() => handleSaveAndNext(result)}
            variant="contained"
            color="primary"
            disabled={loading || isViewer || !testCase}
          >
            저장
          </Button>
        )}
      </DialogActions>

      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(undefined)}
      >
        <Alert severity="error" onClose={() => setSaveError(undefined)}>
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
    notes: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onNext: PropTypes.func,
};

TestResultForm.defaultProps = {
  currentResult: {
    result: TestResult.NOTRUN,
    notes: '',
  },
  onNext: null,
};

export default TestResultForm;
