// /src/components/TestCaseForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { createTestStep } from '../models/testCase';

const TestCaseForm = ({ testCaseId }) => {
  const { state, updateTestCase } = useAppContext();
  const testCases = state.testCases;

  const [testCase, setTestCase] = useState(null);
  const [errors, setErrors] = useState({ name: '', steps: {} });
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (testCaseId) {
      const tc = testCases.find(tc => tc.id === testCaseId);
      if (tc) setTestCase({ ...tc, steps: tc.steps || [] });
    }
  }, [testCaseId, testCases]);

  if (!testCase || testCase.type !== 'testcase') {
    return (
      <Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          테스트 케이스를 선택하세요.
        </Typography>
      </Card>
    );
  }

  const handleChange = (field) => (event) => {
    setTestCase({ ...testCase, [field]: event.target.value });
    setErrors({ ...errors, [field]: '' });
  };

  const handleAddStep = () => {
    const newStepNumber =
      testCase.steps.length > 0
        ? Math.max(...testCase.steps.map(step => step.stepNumber)) + 1
        : 1;
    setTestCase({
      ...testCase,
      steps: [...testCase.steps, createTestStep(newStepNumber)]
    });
  };

  const handleDeleteStep = (stepNumber) => {
    setTestCase({
      ...testCase,
      steps: testCase.steps.filter(step => step.stepNumber !== stepNumber)
    });
    setErrors(prev => {
      const newSteps = { ...prev.steps };
      delete newSteps[stepNumber];
      return { ...prev, steps: newSteps };
    });
  };

  const handleStepChange = (stepNumber, field) => (event) => {
    setTestCase({
      ...testCase,
      steps: testCase.steps.map(step =>
        step.stepNumber === stepNumber
          ? { ...step, [field]: event.target.value }
          : step
      )
    });
    setErrors(prev => ({
      ...prev,
      steps: {
        ...prev.steps,
        [stepNumber]: {
          ...((prev.steps && prev.steps[stepNumber]) || {}),
          [field]: ''
        }
      }
    }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = { name: '', steps: {} };

    if (!testCase.name || testCase.name.trim() === '') {
      newErrors.name = '이름을 입력하세요.';
      valid = false;
    }

    testCase.steps.forEach(step => {
      if (!step.description || step.description.trim() === '' || !step.expectedResult || step.expectedResult.trim() === '') {
        newErrors.steps[step.stepNumber] = {
          description: !step.description || step.description.trim() === '' ? '설명을 입력하세요.' : '',
          expectedResult: !step.expectedResult || step.expectedResult.trim() === '' ? '예상 결과를 입력하세요.' : ''
        };
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const isSaveDisabled = () => {
    if (!testCase.name || testCase.name.trim() === '') return true;
    for (const step of testCase.steps) {
      if (!step.description || step.description.trim() === '' || !step.expectedResult || step.expectedResult.trim() === '') {
        return true;
      }
    }
    return false;
  };

  const handleSave = () => {
    if (!validate()) return;
    updateTestCase(testCase);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Card sx={{ minHeight: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          테스트 케이스 상세
        </Typography>
        <TextField
          label="이름"
          value={testCase.name}
          onChange={handleChange('name')}
          fullWidth
          margin="normal"
          variant="outlined"
          error={!!errors.name}
          helperText={errors.name}
        />
        <TextField
          label="설명"
          value={testCase.description}
          onChange={handleChange('description')}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          rows={3}
        />
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            테스트 스텝
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="10%">No.</TableCell>
                  <TableCell width="45%">설명</TableCell>
                  <TableCell width="35%">예상 결과</TableCell>
                  <TableCell width="10%" align="center">삭제</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {testCase.steps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        테스트 스텝이 없습니다.
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
                            placeholder="설명"
                            multiline
                            minRows={1}
                            maxRows={3}
                            error={!!(errors.steps[step.stepNumber] && errors.steps[step.stepNumber].description)}
                            helperText={errors.steps[step.stepNumber] && errors.steps[step.stepNumber].description}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={step.expectedResult}
                            onChange={handleStepChange(step.stepNumber, 'expectedResult')}
                            fullWidth
                            size="small"
                            placeholder="예상 결과"
                            multiline
                            minRows={1}
                            maxRows={3}
                            error={!!(errors.steps[step.stepNumber] && errors.steps[step.stepNumber].expectedResult)}
                            helperText={errors.steps[step.stepNumber] && errors.steps[step.stepNumber].expectedResult}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="error" onClick={() => handleDeleteStep(step.stepNumber)}>
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
            variant="outlined"
          >
            스텝 추가
          </Button>
        </Box>
        <TextField
          label="예상 결과 (전체)"
          value={testCase.expectedResults}
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
          disabled={isSaveDisabled()}
        >
          저장
        </Button>
      </CardActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          저장되었습니다.
        </Alert>
      </Snackbar>
    </Card>
  );
};

TestCaseForm.propTypes = {
  testCaseId: PropTypes.string,
};

export default TestCaseForm;

