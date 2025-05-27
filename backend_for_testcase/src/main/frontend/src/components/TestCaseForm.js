// src/components/TestCaseForm.js

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
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';
import { createTestStep } from '../models/testCase';

const TestCaseForm = ({ testCaseId, projectId, onSave }) => {
  const { testCases, updateTestCase, addTestCase, user } = useAppContext();
  const [testCase, setTestCase] = useState(null);
  const [errors, setErrors] = useState({});
  const [maxStepNumber, setMaxStepNumber] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const isViewer = user?.role === 'VIEWER';

  useEffect(() => {
    if (!projectId) {
      setTestCase(null);
      return;
    }
    if (testCaseId) {
      const tc = testCases.find(tc => String(tc.id) === String(testCaseId));
      if (tc) {
        setTestCase({ ...tc, steps: tc.steps });
        setMaxStepNumber(tc.steps?.length > 0 ? Math.max(...tc.steps.map(step => step.stepNumber)) : 0);
      }
    } else {
      setTestCase({
        name: '',
        description: '',
        steps: [],
        expectedResults: '',
        parentId: null,
        projectId,
        type: 'testcase',
        displayOrder: '',
        preCondition: '',
      });
      setMaxStepNumber(0);
    }
  }, [testCaseId, testCases, projectId]);

  if (!projectId) {
    return (
      <Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">프로젝트를 먼저 선택하세요.</Typography>
      </Card>
    );
  }
  if (!testCase) {
    return (
      <Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">테스트케이스를 선택하거나 새로 만드세요.</Typography>
      </Card>
    );
  }

  const isFolder = testCase.type === 'folder';

  const handleChange = field => event => {
    setTestCase({ ...testCase, [field]: event.target.value });
    setErrors({ ...errors, [field]: undefined });
  };

  const handleAddStep = () => {
    if (isViewer) return;
    const newStepNumber = maxStepNumber + 1;
    setTestCase({
      ...testCase,
      steps: [...testCase.steps, createTestStep(newStepNumber, '', '')],
    });
    setMaxStepNumber(newStepNumber);
  };

  const handleDeleteStep = stepNumber => {
    if (isViewer) return;
    const updatedSteps = testCase.steps.filter(step => step.stepNumber !== stepNumber);
    setTestCase({
      ...testCase,
      steps: updatedSteps,
    });
    if (stepNumber === maxStepNumber) {
      setMaxStepNumber(updatedSteps.length > 0 ? Math.max(...updatedSteps.map(step => step.stepNumber)) : 0);
    }
    setErrors(prev => {
      const newSteps = { ...prev.steps };
      delete newSteps?.[stepNumber];
      return { ...prev, steps: newSteps };
    });
  };

  const handleStepChange = (stepNumber, field) => event => {
    setTestCase({
      ...testCase,
      steps: testCase.steps.map(step =>
        step.stepNumber === stepNumber ? { ...step, [field]: event.target.value } : step
      ),
    });
    setErrors(prev => ({
      ...prev,
      steps: {
        ...prev.steps,
        [stepNumber]: { ...prev.steps?.[stepNumber], [field]: undefined },
      },
    }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = { name: '', steps: {} };
    if (!testCase.name || !testCase.name.trim()) {
      newErrors.name = '이름을 입력하세요.';
      valid = false;
    }
    if (!isFolder) {
      for (const step of testCase.steps) {
        if (!step.description || !step.description.trim()) {
          newErrors.steps[step.stepNumber] = { description: 'Step을 입력하세요.' };
          valid = false;
        }
      }
    }
    setErrors(newErrors);
    return valid;
  };

  const isSaveDisabled = () => {
    if (isViewer) return true;
    if (!testCase.name || !testCase.name.trim()) return true;
    if (!isFolder) {
      for (const step of testCase.steps) {
        if (!step.description || !step.description.trim()) return true;
      }
    }
    return false;
  };

  const handleSave = async () => {
    if (isViewer) return;
    if (!validate()) return;
    setIsSaving(true);
    setSnackbarError(undefined);
    try {
      const payload = {
        ...testCase,
        projectId,
        steps: testCase.steps?.map(step => ({
          stepNumber: step.stepNumber,
          description: step.description,
          expectedResult: step.expectedResult,
        })),
      };
      if (testCaseId) {
        await updateTestCase(payload);
      } else {
        await addTestCase(payload);
      }
      setSnackbarOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (onSave) onSave();
    } catch (err) {
      setSnackbarError(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
    setSnackbarError(undefined);
  };

  const renderTopSaveButton = !isViewer && (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={isSaveDisabled() || isSaving}
        startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {isSaving ? '저장 중...' : '저장'}
      </Button>
    </Box>
  );

  if (isFolder) {
    return (
      <Card sx={{ minHeight: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {testCaseId ? '테스트 폴더 수정' : '테스트 폴더 생성'}
          </Typography>
          {renderTopSaveButton}
          <Accordion expanded={infoOpen} onChange={() => setInfoOpen(v => !v)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">ID, Parent</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField label="Project ID" value={projectId} fullWidth disabled margin="normal" variant="outlined" InputProps={{ readOnly: true }} />
              <TextField label="ID" value={testCase?.id || ''} fullWidth disabled margin="normal" variant="outlined" InputProps={{ readOnly: true }} />
              <TextField label="Parent ID" value={testCase?.parentId || ''} onChange={handleChange('parentId')} fullWidth margin="normal" variant="outlined" placeholder="null" />
              <TextField label="Parent" value={testCase?.parentName || ''} fullWidth disabled margin="normal" variant="outlined" />
              <TextField label="순서" value={testCase.displayOrder || ''} onChange={handleChange('displayOrder')} fullWidth margin="normal" variant="outlined" placeholder="" />
            </AccordionDetails>
          </Accordion>
        </CardContent>
        <CardActions>
          {!isViewer && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={isSaveDisabled() || isSaving}
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          )}
        </CardActions>
        <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            저장되었습니다.
          </Alert>
        </Snackbar>
        <Snackbar open={!!snackbarError} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            {snackbarError}
          </Alert>
        </Snackbar>
      </Card>
    );
  }

  return (
    <Card sx={{ minHeight: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {testCaseId ? '테스트케이스 수정' : '테스트케이스 생성'}
        </Typography>
        {renderTopSaveButton}
        <Accordion expanded={infoOpen} onChange={() => setInfoOpen(v => !v)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">ID, Parent</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField label="Project ID" value={projectId} fullWidth disabled margin="normal" variant="outlined" InputProps={{ readOnly: true }} />
            <TextField label="ID" disabled value={testCase?.id ? testCase.id : ''} fullWidth margin="normal" variant="outlined" InputProps={{ readOnly: true }} />
            <TextField label="Parent ID" value={testCase?.parentId || ''} onChange={handleChange('parentId')} fullWidth margin="normal" variant="outlined" placeholder="null" />
            <TextField label="Parent" value={testCase?.parentName || ''} fullWidth disabled margin="normal" variant="outlined" />
            <TextField label="순서" value={testCase.displayOrder || ''} onChange={handleChange('displayOrder')} fullWidth margin="normal" variant="outlined" placeholder="" />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">테스트케이스 정보</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              label="이름"
              value={testCase.name}
              onChange={handleChange('name')}
              fullWidth
              margin="normal"
              variant="outlined"
              error={!!errors.name}
              placeholder="테스트케이스 이름"
              helperText={errors.name}
              disabled={isViewer}
            />
            <TextField
              label="설명"
              value={testCase.description}
              placeholder="테스트케이스 설명"
              onChange={handleChange('description')}
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              minRows={1}
              maxRows={50}
              helperText={!testCase.description ? '설명을 입력하세요.' : ''}
              disabled={isViewer}
            />
            <TextField
              label="Pre-condition"
              value={testCase.preCondition}
              onChange={handleChange('preCondition')}
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              minRows={1}
              maxRows={50}
              placeholder="사전 조건"
              helperText={!testCase.description ? '사전 조건을 입력하세요.' : ''}
              disabled={isViewer}
            />
          </AccordionDetails>
        </Accordion>
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            테스트 스텝
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    width={10}
                    sx={{
                      width: 10,
                      minWidth: 10,
                      maxWidth: 15,
                      textAlign: 'center',
                      p: 0.5,
                    }}
                  >
                    No.
                  </TableCell>
                  <TableCell
                    sx={{
                      width: '50%',
                      minWidth: 120,
                      maxWidth: 'none',
                    }}
                  >
                    Step
                  </TableCell>
                  <TableCell
                    sx={{
                      width: '50%',
                      minWidth: 120,
                      maxWidth: 'none',
                    }}
                  >
                    Expected
                  </TableCell>
                  <TableCell
                    width={10}
                    sx={{
                      width: 10,
                      minWidth: 10,
                      maxWidth: 15,
                      textAlign: 'center',
                      p: 0.5,
                    }}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {testCase.steps.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">스텝을 추가하세요.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  testCase.steps
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map(step => (
                      <TableRow key={step.stepNumber}>
                        <TableCell sx={{ width: 28, minWidth: 24, maxWidth: 32, textAlign: 'center', p: 0.5 }}>
                          {step.stepNumber}
                        </TableCell>
                        <TableCell sx={{ width: '44%', minWidth: 120 }}>
                          <TextField
                            value={step.description}
                            onChange={handleStepChange(step.stepNumber, 'description')}
                            fullWidth
                            size="small"
                            placeholder="Step 설명"
                            multiline
                            minRows={1}
                            maxRows={50}
                            error={!!errors.steps?.[step.stepNumber]?.description}
                            helperText={errors.steps?.[step.stepNumber]?.description}
                            disabled={isViewer}
                          />
                        </TableCell>
                        <TableCell sx={{ width: '44%', minWidth: 120 }}>
                          <TextField
                            value={step.expectedResult}
                            onChange={handleStepChange(step.stepNumber, 'expectedResult')}
                            fullWidth
                            size="small"
                            placeholder="예상 결과"
                            multiline
                            minRows={1}
                            maxRows={50}
                            disabled={isViewer}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ width: 36, minWidth: 26, maxWidth: 40, p: 0.5 }}>
                          {!isViewer && (
                            <IconButton size="small" color="error" onClick={() => handleDeleteStep(step.stepNumber)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {!isViewer && (
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddStep}
              sx={{ mt: 1 }}
              size="small"
              variant="outlined"
            >
              스텝 추가
            </Button>
          )}
        </Box>
        <TextField
          label="Expected Results"
          value={testCase.expectedResults}
          onChange={handleChange('expectedResults')}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          minRows={1}
          maxRows={50}
          placeholder="전체 예상 결과"
          helperText={!testCase.description ? '전체 예상 결과를 입력하세요.' : ''}
          disabled={isViewer}
        />
      </CardContent>
      <CardActions>
        {!isViewer && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={isSaveDisabled() || isSaving}
            startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isSaving ? '저장 중...' : '저장'}
          </Button>
        )}
      </CardActions>
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          저장되었습니다.
        </Alert>
      </Snackbar>
      <Snackbar open={!!snackbarError} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {snackbarError}
        </Alert>
      </Snackbar>
    </Card>
  );
};

TestCaseForm.propTypes = {
  testCaseId: PropTypes.string,
  projectId: PropTypes.string.isRequired,
  onSave: PropTypes.func,
};

export default TestCaseForm;
