// /src/components/TestResultForm.js
import React, { useState, useEffect } from 'react';
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
  Divider
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
  
  // 테스트케이스 정보 로드
  useEffect(() => {
    if (testCaseId) {
      const tc = getTestCase(testCaseId);
      if (tc) {
        setTestCase(tc);
      }
    }
  }, [testCaseId, getTestCase]);
  
  // 테스트 결과 변경 핸들러
  const handleResultChange = (event) => {
    setResult(event.target.value);
  };
  
  // 메모 변경 핸들러
  const handleNotesChange = (event) => {
    setNotes(event.target.value);
  };
  
  // 저장 핸들러
  const handleSave = () => {
    onSave(result, notes);
  };
  
  if (!testCase) {
    return null;
  }
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>테스트 결과 입력</DialogTitle>
      
      <DialogContent>
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
            >
              <FormControlLabel value={TestResult.PASS} control={<Radio />} label="통과(PASS)" />
              <FormControlLabel value={TestResult.FAIL} control={<Radio />} label="실패(FAIL)" />
              <FormControlLabel value={TestResult.BLOCKED} control={<Radio />} label="차단됨(BLOCKED)" />
              <FormControlLabel value={TestResult.NOT_RUN} control={<Radio />} label="미실행(NOT RUN)" />
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
          />
        </Box>
        
        {testCase.steps && testCase.steps.length > 0 && (
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
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestResultForm;
