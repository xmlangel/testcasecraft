// src/components/TestCaseForm.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Button, Card, CardContent, CardActions, TextField, Typography, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Snackbar, Alert, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, FormControl, InputLabel, Select, MenuItem, Autocomplete, ToggleButton, ToggleButtonGroup, FormControlLabel, Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
  Save as SaveVersionIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  TextFields as TextFieldsIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { useAppContext } from '../context/AppContext.jsx';
import { createTestStep } from '../models/testCase.jsx';
import TestCaseVersionHistory from './TestCase/TestCaseVersionHistory.jsx';
import VersionIndicator from './TestCase/VersionIndicator.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import TestCaseAttachments from './TestCase/TestCaseAttachments.jsx';
import { useRAG } from '../context/RAGContext.jsx';

const TestCaseForm = ({ testCaseId, projectId, onSave, initialData }) => {
  const { testCases, updateTestCase, updateTestCaseLocal, addTestCase, user, api } = useAppContext();
  const { t } = useI18n();
  const { state: ragState, listDocuments } = useRAG();
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
  // 태그 자동완성을 위한 기존 태그 목록
  const [availableTags, setAvailableTags] = useState([]);
  const [isMarkdownMode, setIsMarkdownMode] = useState(true);
  const [isPreConditionMarkdownMode, setIsPreConditionMarkdownMode] = useState(true);
  const [isPostConditionMarkdownMode, setIsPostConditionMarkdownMode] = useState(true);
  const [isExpectedResultsMarkdownMode, setIsExpectedResultsMarkdownMode] = useState(true);
  const [isStepMarkdownMode, setIsStepMarkdownMode] = useState(true);
  // RAG 문서 연결 관련 상태
  const [linkedDocuments, setLinkedDocuments] = useState([]);

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

  // 프로젝트의 기존 태그 목록 조회
  useEffect(() => {
    if (!projectId) return;

    const fetchTags = async () => {
      try {
        const response = await api(`/api/testcases/projects/${projectId}/tags`);
        if (response.ok) {
          const tags = await response.json();
          setAvailableTags(Array.from(tags));
        }
      } catch (error) {
        console.error('태그 목록 조회 실패:', error);
      }
    };

    fetchTags();
  }, [projectId, api]);

  // RAG 문서 목록 로드
  useEffect(() => {
    if (!projectId) return;

    const loadDocuments = async () => {
      try {
        await listDocuments(projectId);
      } catch (error) {
        console.error('RAG 문서 목록 조회 실패:', error);
      }
    };

    loadDocuments();
  }, [projectId, listDocuments]);

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

        setTestCase({
          ...tc,
          steps: tc.steps,
          parentName,
          priority: tc.priority || 'Medium',
          tags: tc.tags || [],
          postCondition: tc.postCondition || '',
          isAutomated: typeof tc.isAutomated === 'boolean' ? tc.isAutomated : false,
          executionType: tc.executionType || (typeof tc.isAutomated === 'boolean' && tc.isAutomated ? 'Automation' : 'Manual'),
          testTechnique: tc.testTechnique || '',
        });
        setMaxStepNumber(tc.steps?.length > 0 ? Math.max(...tc.steps.map(step => step.stepNumber)) : 0);

        // 연결된 RAG 문서 ID 목록을 실제 문서 객체로 변환 (testcase_로 시작하는 문서 제외)
        if (tc.linkedDocumentIds && tc.linkedDocumentIds.length > 0 && ragState.documents.length > 0) {
          const linkedDocs = ragState.documents.filter(doc =>
            tc.linkedDocumentIds.includes(doc.id) && !doc.fileName?.startsWith('testcase_')
          );
          setLinkedDocuments(linkedDocs);
        } else {
          setLinkedDocuments([]);
        }

        // 실제 테스트케이스인 경우만 버전 정보 조회 (폴더 제외)
        if (tc.type === 'testcase') {
          fetchCurrentVersion(testCaseId);
        } else {
          setCurrentVersion(null); // 폴더인 경우 버전 정보 초기화
        }
      }
    } else {
      // initialData가 있으면 사용 (AI 생성 데이터 등)
      if (initialData) {
        const aiSteps = (initialData.steps || []).map((step, index) => ({
          stepNumber: step.stepNumber || index + 1,
          description: step.action || step.description || '',
          expectedResult: step.expected || step.expectedResult || '',
        }));

        setTestCase({
          name: initialData.name || '',
          description: initialData.description || '',
          steps: aiSteps,
          expectedResults: initialData.expectedResults || '',
          parentId: initialData.parentId || null,
          projectId,
          type: 'testcase',
          displayOrder: '',
          preCondition: initialData.preCondition || initialData.preconditions || '',
          postCondition: initialData.postCondition || '',
          isAutomated: typeof initialData.isAutomated === 'boolean' ? initialData.isAutomated : false,
          executionType: initialData.executionType || (typeof initialData.isAutomated === 'boolean' && initialData.isAutomated ? 'Automation' : 'Manual'),
          testTechnique: initialData.testTechnique || '',
          parentName: '',
          priority: initialData.priority || 'Medium',
          tags: initialData.tags || [],
          linkedDocumentIds: [],
        });
        setMaxStepNumber(aiSteps.length > 0 ? Math.max(...aiSteps.map(step => step.stepNumber)) : 0);
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
          postCondition: '',
          isAutomated: false,
          executionType: 'Manual',
          testTechnique: '',
          parentName: '',
          priority: 'Medium',
          tags: [],
          linkedDocumentIds: [],
        });
        setMaxStepNumber(0);
      }
      setLinkedDocuments([]);
    }
  }, [testCaseId, testCases, projectId, ragState.documents, initialData]);

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

  const handleDescriptionChange = (value = '') => {
    setTestCase(prev => ({ ...prev, description: value }));
    setErrors(prev => ({ ...prev, description: undefined }));
  };

  const handlePreConditionChange = (value = '') => {
    setTestCase(prev => ({ ...prev, preCondition: value }));
    setErrors(prev => ({ ...prev, preCondition: undefined }));
  };

  const handlePostConditionChange = (value = '') => {
    setTestCase(prev => ({ ...prev, postCondition: value }));
    setErrors(prev => ({ ...prev, postCondition: undefined }));
  };

  const handleExpectedResultsChange = (value = '') => {
    setTestCase(prev => ({ ...prev, expectedResults: value }));
    setErrors(prev => ({ ...prev, expectedResults: undefined }));
  };

  const renderDescriptionInput = (placeholder) => {
    const descriptionValue = testCase.description || '';
    const helperText = !descriptionValue
      ? t('testcase.helper.description', '설명을 입력하세요.')
      : isMarkdownMode
        ? t('testcase.helper.markdownSupported', 'Markdown 문법을 사용할 수 있습니다.')
        : '';

    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">{t('testcase.form.description', '설명')}</Typography>
          <ToggleButtonGroup
            value={isMarkdownMode ? 'markdown' : 'text'}
            exclusive
            onChange={(event, mode) => {
              if (mode !== null) {
                setIsMarkdownMode(mode === 'markdown');
              }
            }}
            size="small"
            disabled={isViewer}
          >
            <ToggleButton value="text" aria-label="text mode">
              <TextFieldsIcon sx={{ mr: 0.5 }} fontSize="small" />
              {t('testcase.form.mode.text', '텍스트')}
            </ToggleButton>
            <ToggleButton value="markdown" aria-label="markdown mode">
              <VisibilityIcon sx={{ mr: 0.5 }} fontSize="small" />
              {t('testcase.form.mode.markdown', 'Markdown')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {isMarkdownMode ? (
          <Box data-color-mode="light" sx={{ mt: 1 }}>
            <MDEditor
              value={descriptionValue}
              onChange={(value) => handleDescriptionChange(value || '')}
              preview="edit"
              height={300}
              textareaProps={{ placeholder }}
              disabled={isViewer}
            />
          </Box>
        ) : (
          <TextField
            label={t('testcase.form.description', '설명')}
            value={descriptionValue}
            placeholder={placeholder}
            onChange={(event) => handleDescriptionChange(event.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            multiline
            minRows={3}
            maxRows={50}
            disabled={isViewer}
          />
        )}
        {helperText && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {helperText}
          </Typography>
        )}
      </Box>
    );
  };

  const renderPreConditionInput = (placeholder) => {
    const preConditionValue = testCase.preCondition || '';
    const helperText = !preConditionValue
      ? t('testcase.helper.preCondition', '사전 조건을 입력하세요.')
      : isPreConditionMarkdownMode
        ? t('testcase.helper.markdownSupported', 'Markdown 문법을 사용할 수 있습니다.')
        : '';

    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">{t('testcase.form.preCondition', '사전 조건')}</Typography>
          <ToggleButtonGroup
            value={isPreConditionMarkdownMode ? 'markdown' : 'text'}
            exclusive
            onChange={(event, mode) => {
              if (mode !== null) {
                setIsPreConditionMarkdownMode(mode === 'markdown');
              }
            }}
            size="small"
            disabled={isViewer}
          >
            <ToggleButton value="text" aria-label="text mode">
              <TextFieldsIcon sx={{ mr: 0.5 }} fontSize="small" />
              {t('testcase.form.mode.text', '텍스트')}
            </ToggleButton>
            <ToggleButton value="markdown" aria-label="markdown mode">
              <VisibilityIcon sx={{ mr: 0.5 }} fontSize="small" />
              {t('testcase.form.mode.markdown', 'Markdown')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {isPreConditionMarkdownMode ? (
          <Box data-color-mode="light" sx={{ mt: 1 }}>
            <MDEditor
              value={preConditionValue}
              onChange={(value) => handlePreConditionChange(value || '')}
              preview="edit"
              height={250}
              textareaProps={{ placeholder }}
              disabled={isViewer}
            />
          </Box>
        ) : (
          <TextField
            label={t('testcase.form.preCondition', '사전 조건')}
            value={preConditionValue}
            placeholder={placeholder}
            onChange={(event) => handlePreConditionChange(event.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            multiline
            minRows={3}
            maxRows={50}
            disabled={isViewer}
          />
        )}
        {helperText && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {helperText}
          </Typography>
        )}
      </Box>
    );
  };

  const renderPostConditionInput = (placeholder) => {
    const postConditionValue = testCase.postCondition || '';
    const helperText = !postConditionValue
      ? t('testcase.helper.postCondition', '사후 조건을 입력하세요.')
      : isPostConditionMarkdownMode
        ? t('testcase.helper.markdownSupported', 'Markdown 문법을 사용할 수 있습니다.')
        : '';

    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">{t('testcase.form.postCondition', '사후 조건')}</Typography>
          <ToggleButtonGroup
            value={isPostConditionMarkdownMode ? 'markdown' : 'text'}
            exclusive
            onChange={(event, mode) => {
              if (mode !== null) {
                setIsPostConditionMarkdownMode(mode === 'markdown');
              }
            }}
            size="small"
            disabled={isViewer}
          >
            <ToggleButton value="text" aria-label="text mode">
              <TextFieldsIcon sx={{ mr: 0.5 }} fontSize="small" />
              {t('testcase.form.mode.text', '텍스트')}
            </ToggleButton>
            <ToggleButton value="markdown" aria-label="markdown mode">
              <VisibilityIcon sx={{ mr: 0.5 }} fontSize="small" />
              {t('testcase.form.mode.markdown', 'Markdown')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {isPostConditionMarkdownMode ? (
          <Box data-color-mode="light" sx={{ mt: 1 }}>
            <MDEditor
              value={postConditionValue}
              onChange={(value) => handlePostConditionChange(value || '')}
              preview="edit"
              height={250}
              textareaProps={{ placeholder }}
              disabled={isViewer}
            />
          </Box>
        ) : (
          <TextField
            label={t('testcase.form.postCondition', '사후 조건')}
            value={postConditionValue}
            placeholder={placeholder}
            onChange={(event) => handlePostConditionChange(event.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            multiline
            minRows={3}
            maxRows={50}
            disabled={isViewer}
          />
        )}
        {helperText && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {helperText}
          </Typography>
        )}
      </Box>
    );
  };

  const renderExpectedResultsInput = (placeholder) => {
    const expectedResultsValue = testCase.expectedResults || '';
    const helperText = !expectedResultsValue
      ? t('testcase.validation.expectedResultsRequired', '전체 예상 결과를 입력하세요.')
      : isExpectedResultsMarkdownMode
        ? t('testcase.helper.markdownSupported', 'Markdown 문법을 사용할 수 있습니다.')
        : '';

    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">{t('testcase.form.expectedResults', 'Expected Results')}</Typography>
          <ToggleButtonGroup
            value={isExpectedResultsMarkdownMode ? 'markdown' : 'text'}
            exclusive
            onChange={(event, mode) => {
              if (mode !== null) {
                setIsExpectedResultsMarkdownMode(mode === 'markdown');
              }
            }}
            size="small"
            disabled={isViewer}
          >
            <ToggleButton value="text" aria-label="text mode">
              <TextFieldsIcon sx={{ mr: 0.5 }} fontSize="small" />
              {t('testcase.form.mode.text', '텍스트')}
            </ToggleButton>
            <ToggleButton value="markdown" aria-label="markdown mode">
              <VisibilityIcon sx={{ mr: 0.5 }} fontSize="small" />
              {t('testcase.form.mode.markdown', 'Markdown')}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {isExpectedResultsMarkdownMode ? (
          <Box data-color-mode="light" sx={{ mt: 1 }}>
            <MDEditor
              value={expectedResultsValue}
              onChange={(value) => handleExpectedResultsChange(value || '')}
              preview="edit"
              height={250}
              textareaProps={{ placeholder }}
              disabled={isViewer}
            />
          </Box>
        ) : (
          <TextField
            label={t('testcase.form.expectedResults', 'Expected Results')}
            value={expectedResultsValue}
            placeholder={placeholder}
            onChange={(event) => handleExpectedResultsChange(event.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            multiline
            minRows={3}
            maxRows={50}
            disabled={isViewer}
          />
        )}
        {helperText && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {helperText}
          </Typography>
        )}
      </Box>
    );
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

  const handleStepMarkdownChange = (stepNumber, field, value = '') => {
    setTestCase({
      ...testCase,
      steps: testCase.steps.map(step =>
        step.stepNumber === stepNumber ? { ...step, [field]: value } : step
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
    // 테스트 스텝은 선택 사항으로 변경 - 빈 스텝도 허용
    setErrors(newErrors);
    return valid;
  };

  const isSaveDisabled = () => {
    if (isViewer) return true;
    if (!testCase.name || !testCase.name.trim()) return true;
    // 테스트 스텝은 선택 사항으로 변경 - 스텝 없이도 저장 가능
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
        linkedDocumentIds: linkedDocuments.map(doc => doc.id),
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
          postCondition: restoredVersion.postCondition || '',
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
          updatedAt: restoredVersion.updatedAt,
          tags: restoredVersion.tags || [],
          isAutomated: typeof restoredVersion.isAutomated === 'boolean' ? restoredVersion.isAutomated : false,
          executionType: restoredVersion.executionType || (typeof restoredVersion.isAutomated === 'boolean' && restoredVersion.isAutomated ? 'Automation' : 'Manual'),
          testTechnique: restoredVersion.testTechnique || '',
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
              {renderDescriptionInput(t('testcase.form.folderDescription', '폴더 설명'))}
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
            {renderDescriptionInput(t('testcase.form.testcaseDescription', '테스트케이스 설명'))}
            {renderPreConditionInput(t('testcase.form.preConditionPlaceholder', '사전 조건'))}
            {renderPostConditionInput(t('testcase.form.postConditionPlaceholder', '테스트 종료 후 기대 상태를 입력하세요.'))}
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(testCase.isAutomated)}
                  onChange={(event) => {
                    if (isViewer) return;
                    const { checked } = event.target;
                    setTestCase(prev => {
                      const currentType = prev.executionType || (prev.isAutomated ? 'Automation' : 'Manual');
                      let nextType = currentType;
                      if (checked) {
                        if (!currentType || currentType === 'Manual') {
                          nextType = 'Automation';
                        }
                      } else {
                        if (!currentType || currentType === 'Automation') {
                          nextType = 'Manual';
                        }
                      }
                      return {
                        ...prev,
                        isAutomated: checked,
                        executionType: nextType
                      };
                    });
                  }}
                  color="primary"
                  disabled={isViewer}
                />
              }
              sx={{ mt: 2 }}
              label={t('testcase.form.isAutomated', '자동화 여부')}
            />
            <FormControl fullWidth margin="normal" disabled={isViewer}>
              <InputLabel id="execution-type-select-label">{t('testcase.form.executionType', 'Manual/Automation')}</InputLabel>
              <Select
                labelId="execution-type-select-label"
                value={testCase.executionType || (testCase.isAutomated ? 'Automation' : 'Manual')}
                label={t('testcase.form.executionType', 'Manual/Automation')}
                onChange={(event) => {
                  const { value } = event.target;
                  setTestCase(prev => ({
                    ...prev,
                    executionType: value,
                    isAutomated: value === 'Automation' ? true : value === 'Manual' ? false : prev.isAutomated
                  }));
                }}
              >
                <MenuItem value="Manual">{t('testcase.executionType.manual', 'Manual')}</MenuItem>
                <MenuItem value="Automation">{t('testcase.executionType.automation', 'Automation')}</MenuItem>
                <MenuItem value="Hybrid">{t('testcase.executionType.hybrid', 'Hybrid')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={t('testcase.form.testTechnique', '테스트 기법')}
              value={testCase.testTechnique || ''}
              onChange={handleChange('testTechnique')}
              fullWidth
              margin="normal"
              variant="outlined"
              disabled={isViewer}
              placeholder={t('testcase.form.testTechniquePlaceholder', '예: 경계값 분석, 의사결정 테이블 등')}
            />
            <FormControl fullWidth margin="normal" disabled={isViewer}>
              <InputLabel id="priority-select-label">{t('testCase.form.priority', '우선순위')}</InputLabel>
              <Select
                labelId="priority-select-label"
                value={testCase.priority || 'Medium'}
                label={t('testCase.form.priority', '우선순위')}
                onChange={handleChange('priority')}
              >
                <MenuItem value="High">{t('testCase.priority.high', '높음')}</MenuItem>
                <MenuItem value="Medium">{t('testCase.priority.medium', '보통')}</MenuItem>
                <MenuItem value="Low">{t('testCase.priority.low', '낮음')}</MenuItem>
              </Select>
            </FormControl>
            <Autocomplete
              multiple
              freeSolo
              options={availableTags}
              value={testCase.tags || []}
              onChange={(event, newValue) => {
                setTestCase(prev => ({ ...prev, tags: newValue }));
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    disabled={isViewer}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label={t('testCase.form.tags', '태그')}
                  placeholder={t('testCase.form.tagsPlaceholder', '태그를 입력하고 Enter를 누르세요')}
                  helperText={t('testCase.helper.tags', '여러 태그를 입력할 수 있습니다')}
                  margin="normal"
                />
              )}
              disabled={isViewer}
            />
            <Autocomplete
              multiple
              options={(ragState.documents || []).filter(doc => !doc.fileName?.startsWith('testcase_'))}
              value={linkedDocuments}
              onChange={(event, newValue) => {
                setLinkedDocuments(newValue);
              }}
              getOptionLabel={(option) => option.fileName || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option) => {
                const { key, ...optionProps } = props;
                return (
                  <li key={option.id} {...optionProps}>
                    {option.fileName}
                  </li>
                );
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={option.id || index}
                      variant="outlined"
                      label={option.fileName}
                      {...tagProps}
                      disabled={isViewer}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label={t('testCase.form.linkedDocuments', '연결된 RAG 문서')}
                  placeholder={t('testCase.form.linkedDocumentsPlaceholder', 'RAG 문서를 선택하세요')}
                  helperText={t('testCase.helper.linkedDocuments', 'RAG 문서를 연결하면 AI가 참고할 수 있습니다')}
                  margin="normal"
                />
              )}
              disabled={isViewer}
            />
          </AccordionDetails>
        </Accordion>
        <Box sx={{ mt: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">
              {t('testcase.form.testSteps', '테스트 스텝')}
            </Typography>
            <ToggleButtonGroup
              value={isStepMarkdownMode ? 'markdown' : 'text'}
              exclusive
              onChange={(event, mode) => {
                if (mode !== null) {
                  setIsStepMarkdownMode(mode === 'markdown');
                }
              }}
              size="small"
              disabled={isViewer}
            >
              <ToggleButton value="text" aria-label="text mode">
                <TextFieldsIcon sx={{ mr: 0.5 }} fontSize="small" />
                {t('testcase.form.mode.text', '텍스트')}
              </ToggleButton>
              <ToggleButton value="markdown" aria-label="markdown mode">
                <VisibilityIcon sx={{ mr: 0.5 }} fontSize="small" />
                {t('testcase.form.mode.markdown', 'Markdown')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
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
                          {isStepMarkdownMode ? (
                            <Box data-color-mode="light">
                              <MDEditor
                                value={step.description || ''}
                                onChange={(value) => handleStepMarkdownChange(step.stepNumber, 'description', value || '')}
                                preview="edit"
                                height={200}
                                textareaProps={{ placeholder: t('testcase.form.stepDescription', 'Step 설명') }}
                                disabled={isViewer}
                              />
                            </Box>
                          ) : (
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
                          )}
                        </TableCell>
                        <TableCell sx={{ width: '44%', minWidth: 120 }}>
                          {isStepMarkdownMode ? (
                            <Box data-color-mode="light">
                              <MDEditor
                                value={step.expectedResult || ''}
                                onChange={(value) => handleStepMarkdownChange(step.stepNumber, 'expectedResult', value || '')}
                                preview="edit"
                                height={200}
                                textareaProps={{ placeholder: t('testcase.form.expectedResult', '예상 결과') }}
                                disabled={isViewer}
                              />
                            </Box>
                          ) : (
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
                          )}
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
        {renderExpectedResultsInput(t('testcase.form.overallExpectedResults', '전체 예상 결과'))}

        {/* 첨부파일 (테스트케이스가 있을 때만 표시) */}
        {testCaseId && <TestCaseAttachments testCaseId={testCaseId} />}
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
