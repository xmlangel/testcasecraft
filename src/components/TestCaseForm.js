// /src/components/TestCaseForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  TextField,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { createTestStep } from '../models/testCase';

const TestCaseForm = ({ testCaseId }) => {
  const { state, updateTestCase } = useAppContext();
  const { testCases } = state;
  
  const [testCase, setTestCase] = useState(null);
  
  // 초기 테스트케이스 데이터 로드
  useEffect(() => {
    if (testCaseId) {
      const tc = testCases.find(tc => tc.id === testCaseId);
      if (tc) {
        setTestCase({
          ...tc,
          steps: tc.steps || []
        });
      }
    }
  }, [testCaseId, testCases]);
  
  // 테스트케이스가 없으면 표시하지 않음
  if (!testCase || testCase.type !== 'testcase') {
    return (
      <Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          왼쪽 트리에서 테스트케이스를 선택하세요.
        </Typography>
      </Card>
    );
  }
  
  // 테스트케이스 정보 업데이트 핸들러
  const handleChange = (field) => (event) => {
    setTestCase({
      ...testCase,
      [field]: event.target.value
    });
  };
  
  // 테스트 단계 추가 핸들러
  const handleAddStep = () => {
    const newStepNumber = testCase.steps.length > 0 
      ? Math.max(...testCase.steps.map(step => step.stepNumber)) + 1 
      : 1;
    
    setTestCase({
      ...testCase,
      steps: [
        ...testCase.steps,
        createTestStep(newStepNumber)
      ]
    });
  };
  
  // 테스트 단계 삭제 핸들러
  const handleDeleteStep = (stepNumber) => {
    setTestCase({
      ...testCase,
      steps: testCase.steps.filter(step => step.stepNumber !== stepNumber)
    });
  };
  
  // 테스트 단계 업데이트 핸들러
  const handleStepChange = (stepNumber, field) => (event) => {
    setTestCase({
      ...testCase,
      steps: testCase.steps.map(step => 
        step.stepNumber === stepNumber 
          ? { ...step, [field]: event.target.value } 
          : step
      )
    });
  };
  
  // 테스트케이스 저장 핸들러
  const handleSave = () => {
    updateTestCase(testCase);
  };
  
  return (
    <Card sx={{ minHeight: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          테스트케이스 상세
        </Typography>
        
        <TextField
          label="테스트케이스 이름"
          value={testCase.name}
          onChange={handleChange('name')}
          fullWidth
          margin="normal"
          variant="outlined"
        />
        
        <TextField
          label="설명"
          value={testCase.description || ''}
          onChange={handleChange('description')}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
        />
        
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            테스트 단계
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="10%">No.</TableCell>
                  <TableCell width="45%">단계 설명</TableCell>
                  <TableCell width="35%">기대 결과</TableCell>
                  <TableCell width="10%" align="center">동작</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testCase.steps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        테스트 단계가 없습니다. 추가 버튼을 눌러 단계를 추가하세요.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  testCase.steps
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map(step => (
                      <TableRow key={step.stepNumber}>
                        <TableCell>{step.stepNumber}</TableCell>
                        <TableCell>
                          <TextField
                            value={step.description}
                            onChange={handleStepChange(step.stepNumber, 'description')}
                            fullWidth
                            size="small"
                            placeholder="단계 설명"
                            multiline
                            minRows={1}
                            maxRows={3}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={step.expectedResult}
                            onChange={handleStepChange(step.stepNumber, 'expectedResult')}
                            fullWidth
                            size="small"
                            placeholder="기대 결과"
                            multiline
                            minRows={1}
                            maxRows={3}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteStep(step.stepNumber)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddStep}
            sx={{ mt: 1 }}
            size="small"
          >
            단계 추가
          </Button>
        </Box>
        
        <TextField
          label="기대 결과 (전체)"
          value={testCase.expectedResults || ''}
          onChange={handleChange('expectedResults')}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
        />
      </CardContent>
      
      <CardActions>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSave}
        >
          저장
        </Button>
      </CardActions>
    </Card>
  );
};

export default TestCaseForm;
