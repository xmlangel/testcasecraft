import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, 
  Radio, Typography, Box, Divider, CircularProgress, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton, Tooltip
} from '@mui/material';
import {
  BugReport as BugReportIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { TestResult } from '../models/testExecution.jsx';
import { useAppContext } from '../context/AppContext.jsx';
import JiraCommentDialog from './JiraIntegration/JiraCommentDialog.jsx';
import JiraIssueLinker from './JiraIntegration/JiraIssueLinker.jsx';
import { jiraService } from '../services/jiraService.js';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

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
      console.error('JIRA 연결 상태 확인 실패:', error);
      setJiraConnectionStatus({ hasConfig: false, isConnected: false });
    }
  };

  useEffect(() => {
    const fetchTestCase = async () => {
      if (!testCaseId || (!open && !fullPage)) return;

      setLoading(true);
      try {
        const response = await api(`${API_BASE_URL}/api/testcases/${testCaseId}`);

        if (!response.ok) throw new Error('테스트케이스를 불러오지 못했습니다.');

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
      setSaveError('테스트 결과를 선택해주세요.');
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
      
      console.log('전송할 데이터:', requestData); // 디버깅용

      const response = await api(`${API_BASE_URL}/api/test-executions/${executionId}/results`, {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결과 저장에 실패했습니다.');
      }

      const updatedExecution = await response.json();
      onSave(updatedExecution);
      if (onNext) onNext();
    } catch (err) {
      setSaveError(err.message);
    }
  }, [api, executionId, testCaseId, notes, jiraIssueKey, onSave, onNext, isViewer, result]);

  const handleOpenJiraDialog = () => {
    setJiraDialogOpen(true);
  };

  const handleJiraCommentAdded = (issueKey, comment) => {
    console.log(`JIRA 코멘트 추가됨: ${issueKey}`);
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
                {testCase.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={MULTILINE_SCROLLS_SX}>
                {testCase.description}
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                사전 조건
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={MULTILINE_SCROLLS_SX}>
                {testCase.preCondition}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {testCase.steps?.length > 0 && (
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    테스트 단계
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
                  기대 결과
                </Typography>
                <Typography variant="body1" sx={MULTILINE_SCROLLS_SX}>
                  {testCase.expectedResults}
                </Typography>
              </Box>

              <Box sx={{ mt: 4 }}>
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
                  label="노트"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  sx={{ mt: 2 }}
                  disabled={isViewer}
                />
              </Box>

              {/* JIRA 이슈 연동 섹션 */}
              {jiraConnectionStatus?.hasConfig && jiraConnectionStatus?.isConnected && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugReportIcon />
                    JIRA 이슈 연동
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
                        JIRA 코멘트
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
                    취소
                  </Button>
                  {!isViewer && (
                    <Button
                      ref={saveButtonRef}
                      onClick={() => handleSaveAndNext(result)}
                      variant="contained"
                      color="primary"
                      disabled={loading || isViewer || !testCase}
                    >
                      저장
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
        
        {/* JIRA 코멘트 다이얼로그 */}
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
      maxWidth="md"
      fullWidth
      aria-labelledby="test-result-dialog"
    >
      <DialogTitle id="test-result-dialog">
        테스트 결과 입력
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
                {testCase.name}
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
            label="노트"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{ mt: 2 }}
            disabled={isViewer}
          />

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

          {/* JIRA 이슈 연동 섹션 (다이얼로그 모드) */}
          {jiraConnectionStatus?.hasConfig && jiraConnectionStatus?.isConnected && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BugReportIcon />
                JIRA 이슈 연동
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
                JIRA 코멘트
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
            취소
          </Button>
          {!isViewer && (
            <Button
              ref={saveButtonRef}
              onClick={() => handleSaveAndNext(result)}
              variant="contained"
              color="primary"
              disabled={loading || isViewer || !testCase}
            >
              저장
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
      
      {/* JIRA 코멘트 다이얼로그 */}
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
