// /src/components/TestResultForm.js
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
  CircularProgress
} from '@mui/material';
import { useAppContext } from '../context/AppContext';
import { TestResult } from '../models/testExecution';

const TestResultForm = ({ 
  open, 
  testCaseId, 
  executionId, 
  currentResult = { result: TestResult.NOT_RUN, notes: '' }, 
  onClose, 
  onSave 
}) => {
  const { getTestCase } = useAppContext();
  
  const [testCase, setTestCase] = useState(null);
  const [result, setResult] = useState(currentResult.result);
  const [notes, setNotes] = useState(currentResult.notes || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 테스트케이스 정보 로드
  useEffect(() => {
    if (testCaseId && open) {
      setLoading(true);
      try {
        const tc = getTestCase(testCaseId);
        if (!tc) throw new Error('테스트케이스를 찾을 수 없습니다');
        setTestCase(tc);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  }, [testCaseId, open, getTestCase]);

  // 테스트 결과 변경 핸들러
  const handleResultChange = useCallback((event) => {
    setResult(event.target.value);
  }, []);

  // 메모 변경 핸들러
  const handleNotesChange = useCallback((event) => {
    setNotes(event.target.value);
  }, []);

  // 저장 핸들러
  const handleSave = useCallback(() => {
    onSave(result, notes);
  }, [onSave, result, notes]);

  if (!open) return null;

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
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                테스트케이스: {testCase.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {testCase.description}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mt: 3 }}>
              <FormControl component="fieldset" sx={{ mb: 3 }}>
                <FormLabel component="legend">테스트 결과</FormLabel>
                <RadioGroup 
                  row
                  name="test-result" 
                  value={result} 
                  onChange={handleResultChange}
                  aria-label="테스트 결과 선택"
                >
                  {Object.values(TestResult).map((value) => (
                    <FormControlLabel 
                      key={value}
                      value={value}
                      control={<Radio />}
                      label={value.replace(/_/g, ' ')}
                      aria-label={value}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
              
              <TextField
                label="메모 및 특이사항"
                value={notes}
                onChange={handleNotesChange}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                inputProps={{ 'aria-label': '메모 입력' }}
              />
            </Box>
            
            {testCase.steps?.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  테스트 단계 (참고용)
                </Typography>
                {testCase.steps.map((step, index) => (
                  <Box key={index} sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      단계 {step.stepNumber}: {step.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      기대 결과: {step.expectedResult || '(없음)'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose}
          aria-label="테스트 결과 입력 취소"
        >
          취소
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={loading || !!error}
          aria-label="테스트 결과 저장"
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

TestResultForm.propTypes = {
  open: PropTypes.bool.isRequired,
  testCaseId: PropTypes.string.isRequired,
  executionId: PropTypes.string,
  currentResult: PropTypes.shape({
    result: PropTypes.oneOf(Object.values(TestResult)),
    notes: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default TestResultForm;

