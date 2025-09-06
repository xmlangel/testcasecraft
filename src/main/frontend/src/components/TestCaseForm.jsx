// src/components/TestCaseForm.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Button, Card, CardContent, CardActions, TextField, Typography, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Snackbar, Alert, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  ExpandMore as ExpandMoreIcon, 
  History as HistoryIcon, 
  Save as SaveVersionIcon 
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext.jsx';
import { createTestStep } from '../models/testCase.jsx';

const TestCaseForm = ({ testCaseId, projectId, onSave }) => {
  const { testCases, updateTestCase, addTestCase, user } = useAppContext();
  const [testCase, setTestCase] = useState(null);
  const [errors, setErrors] = useState({});
  const [maxStepNumber, setMaxStepNumber] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');
  const [versionDescription, setVersionDescription] = useState('');
  const [savingVersion, setSavingVersion] = useState(false);

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

  // 수동 버전 저장
  const handleCreateVersion = () => {
    if (!testCaseId) {
      setSnackbarError('저장된 테스트케이스에만 버전을 생성할 수 있습니다.');
      return;
    }
    setVersionDialogOpen(true);
    setVersionLabel('');
    setVersionDescription('');
  };

  const handleSaveVersion = async () => {
    if (!versionLabel.trim()) {
      alert('버전 라벨을 입력하세요.');
      return;
    }

    try {
      setSavingVersion(true);
      const response = await fetch(`/api/testcase-versions/${testCaseId}/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          versionLabel: versionLabel.trim(),
          versionDescription: versionDescription.trim() || '수동 버전 생성'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '버전 생성에 실패했습니다.');
      }

      const data = await response.json();
      setVersionDialogOpen(false);
      setSnackbarOpen(true); // 성공 메시지 표시
      
    } catch (error) {
      console.error('버전 생성 실패:', error);
      setSnackbarError(error.message);
    } finally {
      setSavingVersion(false);
    }
  };

  const handleCancelVersion = () => {
    setVersionDialogOpen(false);
    setVersionLabel('');
    setVersionDescription('');
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
          {testCase?.displayId && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Display ID: <strong>{testCase.displayId}</strong>
            </Typography>
          )}
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
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">폴더 정보</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label="이름"
                value={testCase.name || ''}
                onChange={handleChange('name')}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!errors.name}
                placeholder="폴더 이름"
                helperText={errors.name}
                disabled={isViewer}
              />
              <TextField
                label="설명"
                value={testCase.description || ''}
                placeholder="폴더 설명"
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
        
        {/* 수동 버전 생성 다이얼로그 */}
        <Dialog open={versionDialogOpen} onClose={handleCancelVersion} maxWidth="sm" fullWidth>
          <DialogTitle>수동 버전 생성</DialogTitle>
          <DialogContent>
            <TextField
              label="버전 라벨"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              fullWidth
              margin="normal"
              placeholder="예: v2.1 수정사항 반영"
              helperText="버전을 식별할 수 있는 라벨을 입력하세요."
            />
            <TextField
              label="버전 설명"
              value={versionDescription}
              onChange={(e) => setVersionDescription(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              placeholder="이 버전에서 변경된 내용을 상세히 설명하세요."
              helperText="선택 사항입니다. 빈 칸으로 두면 '수동 버전 생성'으로 설정됩니다."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelVersion}>취소</Button>
            <Button 
              onClick={handleSaveVersion} 
              variant="contained"
              disabled={!versionLabel.trim() || savingVersion}
              startIcon={savingVersion ? <CircularProgress size={20} color="inherit" /> : <SaveVersionIcon />}
            >
              {savingVersion ? '생성 중...' : '버전 생성'}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card sx={{ minHeight: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {testCaseId ? '테스트케이스 수정' : '테스트케이스 생성'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            {testCase?.displayId && (
              <Typography variant="body2" color="text.secondary">
                Display ID: <strong>{testCase.displayId}</strong>
              </Typography>
            )}
          </Box>
          {testCaseId && !isViewer && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                icon={<HistoryIcon />} 
                label="버전 히스토리" 
                variant="outlined" 
                size="small"
                onClick={() => {/* 버전 히스토리 열기 - TestCaseTree에서 처리 */}}
              />
              <Chip 
                icon={<SaveVersionIcon />} 
                label="버전 생성" 
                variant="outlined" 
                size="small"
                color="primary"
                onClick={handleCreateVersion}
              />
            </Box>
          )}
        </Box>
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
              value={testCase.name || ''}
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
              value={testCase.description || ''}
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
              value={testCase.preCondition || ''}
              onChange={handleChange('preCondition')}
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              minRows={1}
              maxRows={50}
              placeholder="사전 조건"
              helperText={!testCase.preCondition ? '사전 조건을 입력하세요.' : ''}
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
                            value={step.description || ''}
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
                            value={step.expectedResult || ''}
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
          value={testCase.expectedResults || ''}
          onChange={handleChange('expectedResults')}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          minRows={1}
          maxRows={50}
          placeholder="전체 예상 결과"
          helperText={!testCase.expectedResults ? '전체 예상 결과를 입력하세요.' : ''}
          disabled={isViewer}
        />
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between' }}>
        {!isViewer && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={isSaveDisabled() || isSaving}
              startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSaving ? '저장 중...' : '저장'}
            </Button>
            {testCaseId && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCreateVersion}
                startIcon={<SaveVersionIcon />}
              >
                버전 생성
              </Button>
            )}
          </Box>
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
