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
  Save as SaveVersionIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext.jsx';
import { createTestStep } from '../models/testCase.jsx';
import TestCaseVersionHistory from './TestCase/TestCaseVersionHistory.jsx';
import VersionIndicator from './TestCase/VersionIndicator.jsx';
import { useI18n } from '../context/I18nContext.jsx';

const TestCaseForm = ({ testCaseId, projectId, onSave }) => {
  const { testCases, updateTestCase, updateTestCaseLocal, addTestCase, user, api } = useAppContext();
  const { t } = useI18n();
  const [testCase, setTestCase] = useState(null);
  const [errors, setErrors] = useState({});
  const [maxStepNumber, setMaxStepNumber] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [testCaseInfoOpen, setTestCaseInfoOpen] = useState(true); // 테스트케이스 정보 기본 펼침
  const [folderInfoOpen, setFolderInfoOpen] = useState(true); // 폴더 정보 기본 펼침
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');
  const [versionDescription, setVersionDescription] = useState('');
  const [savingVersion, setSavingVersion] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  // 강제 리렌더링을 위한 상태
  const [renderKey, setRenderKey] = useState(0);

  const isViewer = user?.role === 'VIEWER';

  // 현재 버전 정보 조회
  const fetchCurrentVersion = async (tcId) => {
    if (!tcId) return;
    
    try {
      const response = await api(`/api/testcase-versions/testcase/${tcId}/current`);
      if (response.ok) {
        const data = await response.json();
        setCurrentVersion(data.data);
      }
    } catch (error) {
      console.error(t('testcase.version.current.fetchError', '현재 버전 조회 실패:'), error);
    }
  };

  useEffect(() => {
    if (!projectId) {
      setTestCase(null);
      return;
    }
    if (testCaseId) {
      const tc = testCases.find(tc => String(tc.id) === String(testCaseId));
      if (tc) {
        // parentId가 있으면 부모 테스트케이스의 name 찾기
        let parentName = '';
        if (tc.parentId) {
          const parentTestCase = testCases.find(ptc => String(ptc.id) === String(tc.parentId));
          if (parentTestCase) {
            parentName = parentTestCase.name;
          }
        }

        setTestCase({ ...tc, steps: tc.steps, parentName });
        setMaxStepNumber(tc.steps?.length > 0 ? Math.max(...tc.steps.map(step => step.stepNumber)) : 0);

        // 실제 테스트케이스인 경우만 버전 정보 조회 (폴더 제외)
        if (tc.type === 'testcase') {
          fetchCurrentVersion(testCaseId);
        } else {
          setCurrentVersion(null); // 폴더인 경우 버전 정보 초기화
        }
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
        parentName: '',
      });
      setMaxStepNumber(0);
    }
  }, [testCaseId, testCases, projectId]);

  // 버전 복원이나 외부 변경에 의한 testCases 업데이트 감지
  useEffect(() => {
    if (!testCaseId || !testCases.length || !testCase) return;

    const currentTestCase = testCases.find(tc => String(tc.id) === String(testCaseId));
    if (currentTestCase) {
      // _version 필드가 있으면 버전 복원에 의한 변경으로 간주
      const isVersionRestore = currentTestCase._version && (!testCase._version || currentTestCase._version !== testCase._version);

      if (isVersionRestore) {
        // parentId가 있으면 부모 테스트케이스의 name 찾기
        let parentName = '';
        if (currentTestCase.parentId) {
          const parentTestCase = testCases.find(ptc => String(ptc.id) === String(currentTestCase.parentId));
          if (parentTestCase) {
            parentName = parentTestCase.name;
          }
        }

        setTestCase({ ...currentTestCase, parentName });
        setMaxStepNumber(currentTestCase.steps?.length > 0 ? Math.max(...currentTestCase.steps.map(step => step.stepNumber)) : 0);
        setRenderKey(prev => prev + 1); // 강제 리렌더링
      }
    }
  }, [testCases, testCaseId]);

  if (!projectId) {
    return (
      <Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">{t('testcase.message.selectProject', '프로젝트를 먼저 선택하세요.')}</Typography>
      </Card>
    );
  }
  if (!testCase) {
    return (
      <Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">{t('testcase.message.selectOrCreate', '테스트케이스를 선택하거나 새로 만드세요.')}</Typography>
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

  // ICT-374: 테스트 스텝 순서 변경 함수
  const handleMoveStep = (stepNumber, direction) => {
    if (isViewer) return;

    // 스텝을 stepNumber 순으로 정렬
    const sortedSteps = [...testCase.steps].sort((a, b) => a.stepNumber - b.stepNumber);
    const currentIndex = sortedSteps.findIndex(step => step.stepNumber === stepNumber);

    // 이동 가능 여부 확인
    if (direction === 'up' && currentIndex === 0) return; // 첫 번째 스텝은 위로 이동 불가
    if (direction === 'down' && currentIndex === sortedSteps.length - 1) return; // 마지막 스텝은 아래로 이동 불가

    // 스텝 위치 교환
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [sortedSteps[currentIndex], sortedSteps[newIndex]] = [sortedSteps[newIndex], sortedSteps[currentIndex]];

    // stepNumber 재정렬 (1부터 순차적으로)
    const reorderedSteps = sortedSteps.map((step, index) => ({
      ...step,
      stepNumber: index + 1
    }));

    setTestCase({
      ...testCase,
      steps: reorderedSteps
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
      newErrors.name = t('testcase.validation.nameRequired', '이름을 입력하세요.');
      valid = false;
    }
    if (!isFolder) {
      for (const step of testCase.steps) {
        if (!step.description || !step.description.trim()) {
          newErrors.steps[step.stepNumber] = { description: t('testcase.validation.stepRequired', 'Step을 입력하세요.') };
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
      setSnackbarError(err.message || t('testcase.error.saveError', '저장 중 오류가 발생했습니다.'));
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
      setSnackbarError(t('testcase.version.error.notSaved', '저장된 테스트케이스에만 버전을 생성할 수 있습니다.'));
      return;
    }
    if (testCase?.type !== 'testcase') {
      setSnackbarError(t('testcase.version.error.folderNotAllowed', '폴더에는 버전을 생성할 수 없습니다. 실제 테스트케이스에만 가능합니다.'));
      setSnackbarOpen(true);
      return;
    }
    setVersionDialogOpen(true);
    setVersionLabel('');
    setVersionDescription('');
  };

  const handleSaveVersion = async () => {
    if (!versionLabel.trim()) {
      alert(t('testcase.version.validation.labelRequired', '버전 라벨을 입력하세요.'));
      return;
    }

    try {
      setSavingVersion(true);
      const response = await api(`/api/testcase-versions/${testCaseId}/manual`, {
        method: 'POST',
        body: JSON.stringify({
          versionLabel: versionLabel.trim(),
          versionDescription: versionDescription.trim() || t('testcase.version.defaultDescription', '수동 버전 생성')
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('testcase.version.error.createFailed', '버전 생성에 실패했습니다.'));
      }

      const data = await response.json();
      setVersionDialogOpen(false);
      setSnackbarOpen(true); // 성공 메시지 표시
      fetchCurrentVersion(testCaseId); // 현재 버전 정보 다시 조회
      
    } catch (error) {
      console.error(t('testcase.version.error.createError', '버전 생성 실패:'), error);
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

  // 버전 히스토리 열기
  const handleVersionHistory = () => {
    setVersionHistoryOpen(true);
  };

  // 버전 복원 후 처리
  const handleVersionRestore = async (restoredVersion) => {
    try {
      
      // 먼저 전달받은 복원 데이터를 사용하려고 시도
      if (restoredVersion && restoredVersion.id) {
        // 복원 데이터가 유효한 경우 직접 사용
        const restoredTestCase = {
          id: restoredVersion.id || restoredVersion.testCaseId,
          name: restoredVersion.name,
          description: restoredVersion.description,
          preCondition: restoredVersion.preCondition,
          expectedResults: restoredVersion.expectedResults,
          steps: restoredVersion.steps || [],
          priority: restoredVersion.priority,
          type: restoredVersion.type,
          projectId: restoredVersion.projectId,
          parentId: restoredVersion.parentId,
          displayId: restoredVersion.displayId,
          sequentialId: restoredVersion.sequentialId,
          displayOrder: restoredVersion.displayOrder,
          createdAt: restoredVersion.createdAt,
          updatedAt: restoredVersion.updatedAt
        };
        
        
        // React의 배치 업데이트를 피하기 위해 setTimeout 사용
        setTimeout(() => {
          // 폼에 복원된 데이터 반영
          setTestCase(restoredTestCase);
          
          // steps 배열과 maxStepNumber도 업데이트
          if (restoredTestCase.steps && restoredTestCase.steps.length > 0) {
            setMaxStepNumber(Math.max(...restoredTestCase.steps.map(step => step.stepNumber)));
          } else {
            setMaxStepNumber(0);
          }
          
          // 강제 리렌더링
          setRenderKey(prev => prev + 1);
        }, 0);
        
        // AppContext의 testCases 배열도 업데이트 (로컬 상태만 업데이트) 
        setTimeout(() => {
          if (updateTestCaseLocal && typeof updateTestCaseLocal === 'function') {
            updateTestCaseLocal(restoredTestCase);
          }
        }, 10);
        
        setSnackbarOpen(true);
        
        // 버전 히스토리 다시 로드
        setTimeout(() => {
          fetchCurrentVersion(testCaseId);
        }, 20);
        
        // 강제로 리렌더링 트리거
        setTimeout(() => {
          if (onSave && typeof onSave === 'function') {
            onSave();  // 부모 컴포넌트에 변경사항 알림
          }
        }, 30);
        return;
      }
      
      // 복원 데이터가 유효하지 않은 경우 API에서 다시 가져오기
      const response = await api(`/api/testcases/${testCaseId}`);
      if (response.ok) {
        const data = await response.json();
        
        // API 응답이 직접 테스트케이스 데이터인 경우와 data 프로퍼티를 가진 경우 모두 처리
        const updatedTestCase = data.data || data;
        
        // 데이터 유효성 검사
        if (updatedTestCase && updatedTestCase.id) {
          // React의 배치 업데이트를 피하기 위해 setTimeout 사용
          setTimeout(() => {
            // 폼에 복원된 데이터 반영
            setTestCase(updatedTestCase);
            
            // steps 배열과 maxStepNumber도 업데이트
            if (updatedTestCase.steps && updatedTestCase.steps.length > 0) {
              setMaxStepNumber(Math.max(...updatedTestCase.steps.map(step => step.stepNumber)));
            } else {
              setMaxStepNumber(0);
            }
            
            // 강제 리렌더링
            setRenderKey(prev => prev + 1);
          }, 0);
          
          // AppContext의 testCases 배열도 업데이트 (로컬 상태만 업데이트)
          setTimeout(() => {
            if (updateTestCaseLocal && typeof updateTestCaseLocal === 'function') {
              updateTestCaseLocal(updatedTestCase);
            }
          }, 10);
          
          setSnackbarOpen(true);
          
          // 버전 히스토리 다시 로드
          setTimeout(() => {
            fetchCurrentVersion(testCaseId);
          }, 20);
          
          // 강제로 리렌더링 트리거
          setTimeout(() => {
            if (onSave && typeof onSave === 'function') {
              onSave();  // 부모 컴포넌트에 변경사항 알림
            }
          }, 30);
        } else {
          console.error('복원된 데이터가 유효하지 않음:', updatedTestCase);
          console.error('원본 응답 데이터:', data);
        }
      } else {
        console.error('복원된 테스트케이스 데이터 조회 실패', response.status);
      }
      
    } catch (error) {
      console.error('버전 복원 후 데이터 로드 실패:', error);
    }
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
        {isSaving ? t('testcase.button.saving', '저장 중...') : t('testcase.button.save', '저장')}
      </Button>
    </Box>
  );

  if (isFolder) {
    return (
      <Card sx={{ minHeight: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {testCaseId ? t('testcase.form.folder.edit', '테스트 폴더 수정') : t('testcase.form.folder.create', '테스트 폴더 생성')}
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
              <TextField label={t('testcase.form.displayOrder', '순서')} value={testCase.displayOrder || ''} onChange={handleChange('displayOrder')} fullWidth margin="normal" variant="outlined" placeholder="" />
              <TextField
                label={t('testcase.form.createdBy', '작성자')}
                value={testCase?.createdBy || ''}
                fullWidth
                disabled
                margin="normal"
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
              <TextField
                label={t('testcase.form.updatedBy', '수정자')}
                value={testCase?.updatedBy || ''}
                fullWidth
                disabled
                margin="normal"
                variant="outlined"
                InputProps={{ readOnly: true }}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion expanded={folderInfoOpen} onChange={() => setFolderInfoOpen(v => !v)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">{t('testcase.folder.info.title', '폴더 정보')}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                label={t('testcase.form.name', '이름')}
                value={testCase.name || ''}
                onChange={handleChange('name')}
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!errors.name}
                placeholder={t('testcase.form.folderName', '폴더 이름')}
                helperText={errors.name}
                disabled={isViewer}
              />
              <TextField
                label={t('testcase.form.description', '설명')}
                value={testCase.description || ''}
                placeholder={t('testcase.form.folderDescription', '폴더 설명')}
                onChange={handleChange('description')}
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                minRows={1}
                maxRows={50}
                helperText={!testCase.description ? t('testcase.helper.description', '설명을 입력하세요.') : ''}
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
              {isSaving ? t('testcase.button.saving', '저장 중...') : t('testcase.button.save', '저장')}
            </Button>
          )}
        </CardActions>
        <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            {t('testcase.message.saved', '저장되었습니다.')}
          </Alert>
        </Snackbar>
        <Snackbar open={!!snackbarError} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
            {snackbarError}
          </Alert>
        </Snackbar>
        
        {/* {t('testcase.version.dialog.comment', '수동 버전 생성 다이얼로그')} */}
        <Dialog open={versionDialogOpen} onClose={handleCancelVersion} maxWidth="sm" fullWidth>
          <DialogTitle>{t('testcase.version.dialog.title', '수동 버전 생성')}</DialogTitle>
          <DialogContent>
            <TextField
              label={t('testcase.version.form.label', '버전 라벨')}
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              fullWidth
              margin="normal"
              placeholder={t('testcase.version.form.labelPlaceholder', '예: v2.1 수정사항 반영')}
              helperText={t('testcase.version.form.labelHelperText', '버전을 식별할 수 있는 라벨을 입력하세요.')}
            />
            <TextField
              label={t('testcase.version.form.description', '버전 설명')}
              value={versionDescription}
              onChange={(e) => setVersionDescription(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={3}
              placeholder={t('testcase.version.form.descriptionPlaceholder', '이 버전에서 변경된 내용을 상세히 설명하세요.')}
              helperText={t('testcase.version.form.descriptionHelperText', '선택 사항입니다. 빈 칸으로 두면 \'수동 버전 생성\'으로 설정됩니다.')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCancelVersion}>{t('testcase.version.button.cancel', '취소')}</Button>
            <Button 
              onClick={handleSaveVersion} 
              variant="contained"
              disabled={!versionLabel.trim() || savingVersion}
              startIcon={savingVersion ? <CircularProgress size={20} color="inherit" /> : <SaveVersionIcon />}
            >
              {savingVersion ? t('testcase.version.button.creating', '생성 중...') : t('testcase.version.button.create', '버전 생성')}
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    );
  }

  return (
    <Card key={`testcase-form-${testCaseId}-${renderKey}`} sx={{ minHeight: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {testCaseId ? t('testcase.form.title.edit', '테스트케이스 수정') : t('testcase.form.title.create', '테스트케이스 생성')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            {testCase?.displayId && (
              <Typography variant="body2" color="text.secondary">
                {t('testcase.form.displayId', 'Display ID')}: <strong>{testCase.displayId}</strong>
              </Typography>
            )}
          </Box>
          {testCaseId && testCase?.type === 'testcase' && (
            <VersionIndicator
              testCaseId={testCaseId}
              currentVersion={currentVersion}
              onVersionHistory={handleVersionHistory}
              onCreateVersion={handleCreateVersion}
              showMenu={!isViewer}
            />
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
            <TextField label={t('testcase.form.displayOrder', '순서')} value={testCase.displayOrder || ''} onChange={handleChange('displayOrder')} fullWidth margin="normal" variant="outlined" placeholder="" />
            <TextField
              label={t('testcase.form.createdBy', '작성자')}
              value={testCase?.createdBy || ''}
              fullWidth
              disabled
              margin="normal"
              variant="outlined"
              InputProps={{ readOnly: true }}
            />
            <TextField
              label={t('testcase.form.updatedBy', '수정자')}
              value={testCase?.updatedBy || ''}
              fullWidth
              disabled
              margin="normal"
              variant="outlined"
              InputProps={{ readOnly: true }}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion expanded={testCaseInfoOpen} onChange={() => setTestCaseInfoOpen(v => !v)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">{t('testcase.info.title', '테스트케이스 정보')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              label={t('testcase.form.name', '이름')}
              value={testCase.name || ''}
              onChange={handleChange('name')}
              fullWidth
              margin="normal"
              variant="outlined"
              error={!!errors.name}
              placeholder={t('testcase.form.testcaseName', '테스트케이스 이름')}
              helperText={errors.name}
              disabled={isViewer}
            />
            <TextField
              label={t('testcase.form.description', '설명')}
              value={testCase.description || ''}
              placeholder={t('testcase.form.testcaseDescription', '테스트케이스 설명')}
              onChange={handleChange('description')}
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              minRows={1}
              maxRows={50}
              helperText={!testCase.description ? t('testcase.helper.description', '설명을 입력하세요.') : ''}
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
              placeholder={t('testcase.form.preConditionPlaceholder', '사전 조건')}
              helperText={!testCase.preCondition ? t('testcase.helper.preCondition', '사전 조건을 입력하세요.') : ''}
              disabled={isViewer}
            />
          </AccordionDetails>
        </Accordion>
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {t('testcase.form.testSteps', '테스트 스텝')}
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
                    {t('testcase.form.stepNumber', 'No.')}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: '50%',
                      minWidth: 120,
                      maxWidth: 'none',
                    }}
                  >
                    {t('testcase.form.step', 'Step')}
                  </TableCell>
                  <TableCell
                    sx={{
                      width: '50%',
                      minWidth: 120,
                      maxWidth: 'none',
                    }}
                  >
                    {t('testcase.form.expected', 'Expected')}
                  </TableCell>
                  {/* ICT-374: 스텝 순서 변경 컬럼 */}
                  {!isViewer && (
                    <TableCell
                      width={50}
                      sx={{
                        width: 50,
                        minWidth: 45,
                        maxWidth: 60,
                        textAlign: 'center',
                        p: 0.5,
                      }}
                    >
                      {t('testcase.form.reorder', '순서')}
                    </TableCell>
                  )}
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
                    <TableCell colSpan={isViewer ? 4 : 5} align="center">
                      <Typography variant="body2" color="text.secondary">{t('testcase.message.addSteps', '스텝을 추가하세요.')}</Typography>
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
                            placeholder={t('testcase.form.stepDescription', 'Step 설명')}
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
                            placeholder={t('testcase.form.expectedResult', '예상 결과')}
                            multiline
                            minRows={1}
                            maxRows={50}
                            disabled={isViewer}
                          />
                        </TableCell>
                        {/* ICT-374: 스텝 순서 변경 버튼 */}
                        {!isViewer && (
                          <TableCell align="center" sx={{ width: 50, minWidth: 45, maxWidth: 60, p: 0.5 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleMoveStep(step.stepNumber, 'up')}
                                disabled={step.stepNumber === 1}
                                sx={{ p: 0.25 }}
                              >
                                <ArrowUpIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleMoveStep(step.stepNumber, 'down')}
                                disabled={step.stepNumber === testCase.steps.length}
                                sx={{ p: 0.25 }}
                              >
                                <ArrowDownIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        )}
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
              {t('testcase.button.addStep', '스텝 추가')}
            </Button>
          )}
        </Box>
        <TextField
          label={t('testcase.form.expectedResults', 'Expected Results')}
          value={testCase.expectedResults || ''}
          onChange={handleChange('expectedResults')}
          fullWidth
          margin="normal"
          variant="outlined"
          multiline
          minRows={1}
          maxRows={50}
          placeholder={t('testcase.form.overallExpectedResults', '전체 예상 결과')}
          helperText={!testCase.expectedResults ? t('testcase.validation.expectedResultsRequired', '전체 예상 결과를 입력하세요.') : ''}
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
              {isSaving ? t('testcase.button.saving', '저장 중...') : t('testcase.button.save', '저장')}
            </Button>
            {testCaseId && testCase?.type === 'testcase' && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCreateVersion}
                startIcon={<SaveVersionIcon />}
              >
                {t('testcase.version.button.create', '버전 생성')}
              </Button>
            )}
          </Box>
        )}
      </CardActions>
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {t('testcase.message.saved', '저장되었습니다.')}
        </Alert>
      </Snackbar>
      <Snackbar open={!!snackbarError} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleSnackbarClose} severity="error" sx={{ width: '100%' }}>
          {snackbarError}
        </Alert>
      </Snackbar>
      
      {/* 버전 히스토리 다이얼로그 */}
      <TestCaseVersionHistory
        testCaseId={testCaseId}
        open={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
        onRestore={handleVersionRestore}
      />
    </Card>
  );
};

TestCaseForm.propTypes = {
  testCaseId: PropTypes.string,
  projectId: PropTypes.string.isRequired,
  onSave: PropTypes.func,
};

export default TestCaseForm;
