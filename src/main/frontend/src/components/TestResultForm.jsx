import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel,
  Radio, Typography, Box, Divider, CircularProgress, Snackbar, Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Tooltip, Chip, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import {
  BugReport as BugReportIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { TestResult } from '../models/testExecution.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import { useTranslation } from '../context/I18nContext.jsx';
import JiraCommentDialog from './JiraIntegration/JiraCommentDialog.jsx';
import JiraIssueLinker from './JiraIntegration/JiraIssueLinker.jsx';
import { jiraService } from '../services/jiraService.js';
import TestResultAttachmentsView from './TestCase/TestResultAttachmentsView.jsx';

// API_BASE_URL은 api 함수를 통해 동적으로 처리됨

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
  fullPage = false,
}) => {

  const { user, api } = useAppContext();
  const { t } = useTranslation();
  const isViewer = user?.role === 'VIEWER';

  const [testCase, setTestCase] = useState(null);
  const [result, setResult] = useState(TestResult.NOTRUN);
  const [notes, setNotes] = useState('');
  const [jiraIssueKey, setJiraIssueKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [saveError, setSaveError] = useState();
  const saveButtonRef = useRef();
  
  // JIRA 통합 관련 상태
  const [jiraDialogOpen, setJiraDialogOpen] = useState(false);
  const [jiraConnectionStatus, setJiraConnectionStatus] = useState(null);
  const [detectedJiraIssues, setDetectedJiraIssues] = useState([]);
  const [linkedIssues, setLinkedIssues] = useState([]);

  // {t('testResult.form.fileAttachment')} 관련 상태
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileUploadError, setFileUploadError] = useState('');
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    setResult(currentResult?.result || TestResult.NOTRUN);
    setNotes(currentResult?.notes || '');
    
    // ICT-182: JIRA 키 초기화 정책
    // - currentResult가 없으면 (새로운 입력): 항상 빈 값
    // - currentResult가 있지만 jiraIssueKey가 없으면: 빈 값
    // - currentResult가 있고 jiraIssueKey가 있으면: 해당 값 사용
    if (!currentResult) {
      // 새로운 결과 입력 시
      setJiraIssueKey('');
      setLinkedIssues([]);
      setDetectedJiraIssues([]);
    } else {
      // 기존 결과 수정 시
      setJiraIssueKey(currentResult.jiraIssueKey || '');
      
      // 노트에서 JIRA 이슈 키 자동 감지
      if (currentResult.notes) {
        const issues = jiraService.extractIssueKeys(currentResult.notes);
        setDetectedJiraIssues(issues);
      } else {
        setDetectedJiraIssues([]);
      }
    }
  }, [currentResult]);

  // 다이얼로그가 열릴 때마다 상태 초기화 (새로운 테스트 케이스)
  useEffect(() => {
    if (open || fullPage) {
      // 현재 결과가 없으면 완전히 초기화
      if (!currentResult) {
        setJiraIssueKey('');
        setLinkedIssues([]);
        setDetectedJiraIssues([]);
      }
    }
  }, [open, fullPage, currentResult]);

  // JIRA 연결 상태 확인
  useEffect(() => {
    if (open || fullPage) {
      checkJiraStatus();
    }
  }, [open, fullPage]);

  // 노트 변경 시 JIRA 이슈 키 감지
  useEffect(() => {
    if (notes) {
      const issues = jiraService.extractIssueKeys(notes);
      setDetectedJiraIssues(issues);
    } else {
      setDetectedJiraIssues([]);
    }
  }, [notes]);

  const checkJiraStatus = async () => {
    try {
      const status = await jiraService.getConnectionStatus();
      setJiraConnectionStatus(status);
    } catch (error) {
      console.error(t('testResult.jira.connectionCheckFailed'), error);
      setJiraConnectionStatus({ hasConfig: false, isConnected: false });
    }
  };

  // 파일 처리 함수들
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // 파일 크기 제한 (10MB)
    const maxFileSize = 10 * 1024 * 1024;
    const invalidFiles = files.filter(file => file.size > maxFileSize);
    if (invalidFiles.length > 0) {
      setFileUploadError(`${t('testResult.file.sizeError')}: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // 허용된 파일 형식
    const allowedTypes = ['text/plain', 'text/csv', 'application/json', 'text/markdown', 'application/pdf'];
    const invalidTypes = files.filter(file => !allowedTypes.includes(file.type) && !file.name.match(/\.(txt|csv|json|md|pdf|log)$/i));
    if (invalidTypes.length > 0) {
      setFileUploadError(`${t('testResult.file.typeError')}: ${invalidTypes.map(f => f.name).join(', ')}`);
      return;
    }

    setIsFileUploading(true);
    setFileUploadError('');

    try {
      // 임시로 로컬에 {t('common.button.save')} (나중에 API로 교체)
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        file: file  // 실제 파일 객체 {t('common.button.save')} (임시)
      }));

      setAttachedFiles(prev => [...prev, ...newFiles]);

      // 파일 입력 필드 초기화
      event.target.value = '';
    } catch (error) {
      setFileUploadError('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleFileDelete = (fileId) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    const fetchTestCase = async () => {
      if (!testCaseId || (!open && !fullPage)) return;

      setLoading(true);
      try {
        const response = await api(`/api/testcases/${testCaseId}`);

        if (!response.ok) throw new Error(t('testResult.error.testCaseLoadFailed'));

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
  }, [testCaseId, open, fullPage, api]);

  const handleSaveAndNext = useCallback(async (customResult) => {
    if (isViewer) return;

    const actualResult = customResult !== undefined ? customResult : result;

    if (actualResult === undefined || actualResult === null) {
      setSaveError(t('testResult.error.resultRequired'));
      return;
    }

    try {
      // JIRA 이슈 키 처리: 빈 값일 때는 필드 자체를 제외
      const requestData = {
        testCaseId,
        result: actualResult,
        notes,
      };

      // JIRA 이슈 키가 있고 유효한 값일 때만 추가 (대문자로 변환)
      const trimmedJiraKey = jiraIssueKey ? jiraIssueKey.trim().toUpperCase() : '';
      if (trimmedJiraKey && trimmedJiraKey.length > 0) {
        requestData.jiraIssueKey = trimmedJiraKey;
      }

      

      const response = await api(`/api/test-executions/${executionId}/results`, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('testResult.error.saveFailed'));
      }

      const updatedExecution = await response.json();

      // ICT-361: 첨부파일이 있는 경우 파일 업로드 처리
      if (attachedFiles.length > 0) {
        await handleFileUploads(updatedExecution.results?.find(r => r.testCaseId === testCaseId)?.id);
      }

      onSave(updatedExecution);
      if (onNext) onNext();
    } catch (err) {
      setSaveError(err.message);
    }
  }, [api, executionId, testCaseId, notes, jiraIssueKey, onSave, onNext, isViewer, result, attachedFiles]);

  // ICT-361: 파일 업로드 처리 함수
  const handleFileUploads = async (testResultId) => {
    if (!testResultId || attachedFiles.length === 0) return;

    try {
      setUploadingFiles(true);
      const uploadPromises = attachedFiles.map(async (fileInfo) => {
        const formData = new FormData();
        formData.append('file', fileInfo.file);
        if (fileInfo.description) {
          formData.append('description', fileInfo.description);
        }

        // XMLHttpRequest를 사용하여 multipart 업로드 (fetch 대신)
        const baseUrl = window.location.origin || 'http://localhost:8080';
        const accessToken = localStorage.getItem('accessToken');

        const response = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.open('POST', `${baseUrl}/api/attachments/upload/${testResultId}`);
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
          // Content-Type을 설정하지 않으면 XMLHttpRequest가 자동으로 multipart/form-data 설정

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve({ ok: true, json: () => Promise.resolve(data) });
              } catch (e) {
                resolve({ ok: true, json: () => Promise.resolve({}) });
              }
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send(formData);
        });

        if (!response.ok) {
          throw new Error(`파일 업로드 실패: ${fileInfo.file.name}`);
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(`파일 업로드 실패: ${fileInfo.file.name}`);
        }

        return data.attachment;
      });

      await Promise.all(uploadPromises);

      // 업로드 성공 후 첨부파일 목록 초기화
      setAttachedFiles([]);

    } catch (error) {
      console.error('파일 업로드 오류:', error);
      throw new Error('파일 업로드 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleOpenJiraDialog = () => {
    setJiraDialogOpen(true);
  };

  const handleJiraCommentAdded = (issueKey, comment) => {
    // 성공적으로 코멘트가 추가된 후 추가 작업이 필요하면 여기에 구현
  };

  const handleIssueLinked = (issue) => {
    // 중복 방지
    if (linkedIssues.some(li => li.key === issue.key)) {
      return;
    }
    setLinkedIssues(prev => [...prev, issue]);
  };

  const handleIssueUnlinked = (issueKey) => {
    setLinkedIssues(prev => prev.filter(issue => issue.key !== issueKey));
  };

  const shouldShowJiraButton = () => {
    return (
      jiraConnectionStatus?.hasConfig && 
      jiraConnectionStatus?.isConnected && 
      (result === TestResult.FAIL || result === TestResult.BLOCKED || detectedJiraIssues.length > 0)
    );
  };

  useEffect(() => {
    if ((!open && !fullPage) || isViewer) return;

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
  }, [open, fullPage, isViewer, handleSaveAndNext, result]);

  if (fullPage) {
    return (
      <Box sx={{ width: '100%', height: '100%' }}>
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
            <Box sx={{ mb: 3, p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {testCase.parentName && testCase.parentName !== '상위없음' 
                  ? `${testCase.parentName} >> ${testCase.name}` 
                  : testCase.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={MULTILINE_SCROLLS_SX}>
                {testCase.description}
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                {t('testResult.form.preCondition')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={MULTILINE_SCROLLS_SX}>
                {testCase.preCondition}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {testCase.steps?.length > 0 && (
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {t('testResult.form.testSteps')}
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
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
                                <Typography variant="body1" sx={MULTILINE_SCROLLS_SX}>
                                  {step.description}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" color="text.secondary" sx={MULTILINE_SCROLLS_SX}>
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

              <Divider sx={{ my: 3 }} />

              <Box>
                <Typography variant="h6" gutterBottom>
                  {t('testResult.form.expectedResult')}
                </Typography>
                <Typography variant="body1" sx={MULTILINE_SCROLLS_SX}>
                  {testCase.expectedResults}
                </Typography>
              </Box>


              <Box sx={{ mt: 4 }}>
                <FormControl component="fieldset" fullWidth sx={{ mb: 3 }} disabled={isViewer}>
                  <FormLabel component="legend">{t('testResult.form.testResult')}</FormLabel>
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
                  label={t('testResult.form.notesPlaceholder', { length: notes.length })}
                  value={notes}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    if (newValue.length <= 10000) {
                      setNotes(newValue);
                    }
                  }}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  sx={{ mt: 2 }}
                  disabled={isViewer}
                  error={notes.length >= 9500}
                  helperText={
                    notes.length >= 10000 ? t('testResult.form.notesLimitError') :
                    notes.length >= 9500 ? t('testResult.form.notesLimitWarning', { remaining: 10000 - notes.length }) :
                    t('testResult.form.notesHelp')
                  }
                />

                {/* {t('testResult.form.fileAttachment')} 섹션 */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachFileIcon />
                    {t('testResult.form.fileAttachment')}
                  </Typography>


                  <Box sx={{ mb: 2 }}>
                    <input
                      accept=".txt,.csv,.json,.md,.pdf,.log"
                      style={{ display: 'none' }}
                      id="file-upload-input"
                      multiple
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isViewer || isFileUploading}
                    />
                    <label htmlFor="file-upload-input">
                      <Button
                        variant="outlined"
                        component="span"
                        disabled={isViewer || isFileUploading}
                        startIcon={isFileUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                        sx={{ mr: 2 }}
                      >
                        {isFileUploading ? t('testResult.form.fileUploading') : t('testResult.form.fileSelect')}
                      </Button>
                    </label>
                    <Typography variant="caption" color="text.secondary">
                      허용 형식: TXT, CSV, JSON, MD, PDF, LOG (최대 10MB)
                    </Typography>
                  </Box>

                  {fileUploadError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {fileUploadError}
                    </Alert>
                  )}

                  {/* 새로 첨부될 파일 목록 */}
                  {attachedFiles.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom color="primary">
                        새로 첨부할 파일 ({attachedFiles.length}개)
                      </Typography>
                      <List dense>
                        {attachedFiles.map((file) => (
                          <ListItem key={file.id} divider>
                            <ListItemText
                              primary={file.name}
                              secondary={`${formatFileSize(file.size)} • ${new Date(file.lastModified).toLocaleString()}`}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => handleFileDelete(file.id)}
                                disabled={isViewer}
                                size="small"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* {t('common.button.save')}된 첨부파일 표시 - 항상 표시하되 조건부로 내용 변경 */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      첨부파일
                      {currentResult && currentResult.id && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          (결과 ID: {currentResult.id})
                        </Typography>
                      )}
                    </Typography>


                    {currentResult && currentResult.id ? (
                      // 기존 결과가 있을 때: {t('common.button.save')}된 첨부파일 표시
                      <TestResultAttachmentsView
                        testResultId={currentResult.id}
                        compact={true}
                        showHeader={false}
                        maxHeight={300}
                      />
                    ) : (
                      // 새로운 결과 입력 시: 안내 메시지
                      <Box sx={{ p: 1, textAlign: 'center', bgcolor: '#f9f9f9', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('testResult.file.saveToViewAttachments')}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                </Box>
              </Box>

              {/* {t('testResult.form.jiraIntegration')} 섹션 */}
              {jiraConnectionStatus?.hasConfig && jiraConnectionStatus?.isConnected && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugReportIcon />
                    {t('testResult.form.jiraIntegration')}
                  </Typography>
                  <JiraIssueLinker
                    testResult={{ result, notes }}
                    onIssueLinked={handleIssueLinked}
                    onIssueUnlinked={handleIssueUnlinked}
                    linkedIssues={linkedIssues}
                    disabled={isViewer}
                  />
                </Box>
              )}

              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                {/* JIRA 버튼 (좌측) */}
                <Box>
                  {shouldShowJiraButton() && !isViewer && (
                    <Tooltip title="JIRA 이슈에 테스트 결과 코멘트 추가">
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<BugReportIcon />}
                        onClick={handleOpenJiraDialog}
                        disabled={loading}
                      >
                        {t('testResult.form.jiraComment')}
                      </Button>
                    </Tooltip>
                  )}
                  {detectedJiraIssues.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      감지된 이슈: {detectedJiraIssues.join(', ')}
                    </Typography>
                  )}
                </Box>
                
                {/* 기본 버튼들 (우측) */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button onClick={onClose} variant="outlined">
                    {t('common.button.cancel')}
                  </Button>
                  {!isViewer && (
                    <Button
                      ref={saveButtonRef}
                      onClick={() => handleSaveAndNext(result)}
                      variant="contained"
                      color="primary"
                      disabled={loading || isViewer || !testCase}
                    >
                      {t('common.button.save')}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </>
        ) : null}
        
        <Snackbar
          open={!!saveError}
          autoHideDuration={6000}
          onClose={() => setSaveError(undefined)}
        >
          <Alert severity="error" onClose={() => setSaveError(undefined)}>
            {saveError}
          </Alert>
        </Snackbar>
        
        {/* {t('testResult.form.jiraComment')} 다이얼로그 */}
        <JiraCommentDialog
          open={jiraDialogOpen}
          onClose={() => setJiraDialogOpen(false)}
          testResult={{ result, notes }}
          testCase={testCase}
          linkedIssues={linkedIssues}
          onCommentAdded={handleJiraCommentAdded}
        />
      </Box>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="test-result-dialog"
    >
      <DialogTitle id="test-result-dialog">
        {t('testResult.form.title')}
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
                {testCase.parentName && testCase.parentName !== '상위없음' 
                  ? `${testCase.parentName} >> ${testCase.name}` 
                  : testCase.name}
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
            label={`노트 (${notes.length}/10,000)`}
            value={notes}
            onChange={(e) => {
              const newValue = e.target.value;
              if (newValue.length <= 10000) {
                setNotes(newValue);
              }
            }}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{ mt: 2 }}
            disabled={isViewer}
            error={notes.length >= 9500}
            helperText={
              notes.length >= 10000 ? "10,000자를 초과했습니다. 긴 내용은 파일로 첨부해주세요." :
              notes.length >= 9500 ? `${10000 - notes.length}자 남음` :
              "긴 내용은 {t('testResult.form.fileAttachment')}를 권장합니다."
            }
          />

          {/* {t('testResult.form.fileAttachment')} 섹션 (다이얼로그 모드) */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachFileIcon />
              {t('testResult.form.fileAttachment')}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <input
                accept=".txt,.csv,.json,.md,.pdf,.log"
                style={{ display: 'none' }}
                id="file-upload-input-dialog"
                multiple
                type="file"
                onChange={handleFileUpload}
                disabled={isViewer || isFileUploading}
              />
              <label htmlFor="file-upload-input-dialog">
                <Button
                  variant="outlined"
                  component="span"
                  disabled={isViewer || isFileUploading}
                  startIcon={isFileUploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                  sx={{ mr: 2 }}
                >
                  {isFileUploading ? t('testResult.form.fileUploading') : t('testResult.form.fileSelect')}
                </Button>
              </label>
              <Typography variant="caption" color="text.secondary">
                허용 형식: TXT, CSV, JSON, MD, PDF, LOG (최대 10MB)
              </Typography>
            </Box>

            {fileUploadError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {fileUploadError}
              </Alert>
            )}

            {attachedFiles.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  첨부된 파일 ({attachedFiles.length}개)
                </Typography>
                <List dense>
                  {attachedFiles.map((file) => (
                    <ListItem key={file.id} divider>
                      <ListItemText
                        primary={file.name}
                        secondary={`${formatFileSize(file.size)} • ${new Date(file.lastModified).toLocaleString()}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleFileDelete(file.id)}
                          disabled={isViewer}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          <TextField
            label="JIRA 이슈 ID (예: ICT-123)"
            value={jiraIssueKey}
            onChange={(e) => setJiraIssueKey(e.target.value.toUpperCase())}
            fullWidth
            variant="outlined"
            sx={{ mt: 2 }}
            disabled={isViewer}
            placeholder="관련된 JIRA 이슈 키를 입력하세요 (자동으로 대문자 변환)"
            helperText={jiraIssueKey && !jiraService.isValidIssueKey(jiraIssueKey) ?
              "올바른 JIRA 이슈 키 형식이 아닙니다 (예: ICT-123)" :
              jiraIssueKey ? "입력된 키가 자동으로 대문자로 변환됩니다" : ""}
            error={jiraIssueKey && !jiraService.isValidIssueKey(jiraIssueKey)}
          />

          {/* {t('testResult.form.jiraIntegration')} 섹션 (다이얼로그 모드) */}
          {jiraConnectionStatus?.hasConfig && jiraConnectionStatus?.isConnected && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugReportIcon />
                {t('testResult.form.jiraIntegration')}
              </Typography>
              <JiraIssueLinker
                testResult={{ result, notes }}
                onIssueLinked={handleIssueLinked}
                onIssueUnlinked={handleIssueUnlinked}
                linkedIssues={linkedIssues}
                disabled={isViewer}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        {/* JIRA 버튼 (좌측) */}
        <Box>
          {shouldShowJiraButton() && !isViewer && (
            <Tooltip title="JIRA 이슈에 테스트 결과 코멘트 추가">
              <Button
                variant="outlined"
                color="warning"
                startIcon={<BugReportIcon />}
                onClick={handleOpenJiraDialog}
                disabled={loading}
                size="small"
              >
                {t('testResult.form.jiraComment')}
              </Button>
            </Tooltip>
          )}
          {detectedJiraIssues.length > 0 && shouldShowJiraButton() && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, display: 'block' }}>
              감지: {detectedJiraIssues.join(', ')}
            </Typography>
          )}
        </Box>
        
        {/* 기본 버튼들 (우측) */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={onClose}>
            {t('common.button.cancel')}
          </Button>
          {!isViewer && (
            <Button
              ref={saveButtonRef}
              onClick={() => handleSaveAndNext(result)}
              variant="contained"
              color="primary"
              disabled={loading || isViewer || !testCase}
            >
              {t('common.button.save')}
            </Button>
          )}
        </Box>
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
      
      {/* {t('testResult.form.jiraComment')} 다이얼로그 */}
      <JiraCommentDialog
        open={jiraDialogOpen}
        onClose={() => setJiraDialogOpen(false)}
        testResult={{ result, notes }}
        testCase={testCase}
        linkedIssues={linkedIssues}
        onCommentAdded={handleJiraCommentAdded}
      />
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
  fullPage: PropTypes.bool,
};

TestResultForm.defaultProps = {
  currentResult: {
    result: TestResult.NOTRUN,
    notes: '',
  },
  onNext: null,
  fullPage: false,
};

export default TestResultForm;
