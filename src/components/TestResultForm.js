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
  Alert
} from '@mui/material';
import { TestResult } from '../models/testExecution';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const TestResultForm = ({
  open,
  testCaseId,
  executionId,
  currentResult = { result: TestResult.NOTRUN, notes: '' },
  onClose,
  onSave
}) => {
  const [testCase, setTestCase] = useState(null);
  const [result, setResult] = useState(currentResult.result);
  const [notes, setNotes] = useState(currentResult.notes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [saveError, setSaveError] = useState();

  useEffect(() => {
    const fetchTestCase = async () => {
      if (testCaseId && open) {
        setLoading(true);
        try {
          const token = localStorage.getItem('jwtToken');
          const response = await fetch(
            `${API_BASE}/api/testcases/${testCaseId}`,
            { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
          );
          if (!response.ok) throw new Error('테스트케이스 정보를 불러올 수 없습니다.');
          const data = await response.json();
          setTestCase(data);
          setError(undefined);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchTestCase();
  }, [testCaseId, open]);

  useEffect(() => {
    setResult(currentResult.result);
    setNotes(currentResult.notes);
  }, [currentResult]);

  // 수정: 이 컴포넌트에서 API 호출하지 않고, 결과만 상위로 전달
  const handleSave = useCallback(() => {
    if (!result) return;
    // 상위에 {result, notes}만 전달
    onSave(result, notes);
  }, [result, notes, onSave]);

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
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {testCase.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {testCase.description}
            </Typography>
          </Box>
        ) : null}
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mt: 3 }}>
          <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
            <FormLabel component="legend">결과</FormLabel>
            <RadioGroup
              row
              name="test-result"
              value={result}
              onChange={e => setResult(e.target.value)}
            >
              {Object.values(TestResult).map(value => (
                <FormControlLabel
                  key={value}
                  value={value}
                  control={<Radio />}
                  label={value.replace(/_/g, '')}
                />
              ))}
            </RadioGroup>
          </FormControl>
          <TextField
            label="비고"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </Box>
        {testCase?.steps?.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              테스트 절차
            </Typography>
            {testCase.steps.map((step, index) => (
              <Box key={index} sx={{ mt: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  {step.stepNumber}. {step.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  예상 결과: {step.expectedResult}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
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
  executionId: PropTypes.string.isRequired,
  currentResult: PropTypes.shape({
    result: PropTypes.oneOf(Object.values(TestResult)),
    notes: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default TestResultForm;
