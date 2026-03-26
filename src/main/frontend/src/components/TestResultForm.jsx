import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Box, 
    CircularProgress, 
    Snackbar, 
    Alert 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAppContext } from '../context/AppContext.jsx';
import { useI18n } from '../context/I18nContext';
import JiraCommentDialog from './JiraIntegration/JiraCommentDialog.jsx';
import { jiraService } from '../services/jiraService.js';
import { TestResult } from '../models/testExecution.jsx';

// Import new components
import TestResultSelector from './TestResult/TestResultSelector.jsx';
import TestCaseDetails from './TestResult/TestCaseDetails.jsx';
import TestResultNotes from './TestResult/TestResultNotes.jsx';
import TestResultAttachments from './TestResult/TestResultAttachments.jsx';
import TestResultTags from './TestResult/TestResultTags.jsx';
import TestResultJira from './TestResult/TestResultJira.jsx';
import TestResultHeader from './TestResult/TestResultHeader.jsx';
import TestResultFooter from './TestResult/TestResultFooter.jsx';
import TestResultFloatingMenu from './TestResult/TestResultFloatingMenu.jsx';
import useInlineImagePaste from '../hooks/useInlineImagePaste.js';

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
  currentResult = { result: TestResult.NOTRUN, notes: '' },
  onClose,
  onSave,
  onNext = null,
  onPrevious = null,
  currentIndex = 0,
  totalCount = 0,
  fullPage = false,
  onOpenFullPage = null,
  isPreviousResultEdit = false,  // 새로운 prop: 이전 결과 수정 모드
}) => {

  const { user, api } = useAppContext();
  const { t } = useI18n();
  const theme = useTheme();
  const darkMode = theme.palette.mode === 'dark';

  const isViewer = user?.role === 'VIEWER';

  const [testCase, setTestCase] = useState(null);
  const [result, setResult] = useState(TestResult.NOTRUN);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [jiraIssueKey, setJiraIssueKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [saveError, setSaveError] = useState();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const saveButtonRef = useRef();
  // 태그 자동완성을 위한 기존 태그 목록
  const [availableTags, setAvailableTags] = useState([]);

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

  // 미리보기 다이얼로그 상태
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const isJiraIssueKeyInvalid = Boolean(jiraIssueKey) && !jiraService.isValidIssueKey(jiraIssueKey);

  // 노트 전체화면 상태 관리
  const [isNotesFullscreen, setIsNotesFullscreen] = useState(false);

  // useMemo를 사용하여 currentResult의 안정적인 참조 생성
  const stableCurrentResult = useMemo(() => {
    if (!currentResult) return null;
    return {
      result: currentResult.result,
      notes: currentResult.notes,
      tags: currentResult.tags,
      jiraIssueKey: currentResult.jiraIssueKey
    };
  }, [
    currentResult?.result,
    currentResult?.notes,
    currentResult?.jiraIssueKey,
    // tags는 배열이므로 JSON으로 비교
    JSON.stringify(currentResult?.tags || [])
  ]);

  useEffect(() => {
    if (!stableCurrentResult) {
      // 새로운 결과 입력 시
      setResult(TestResult.NOTRUN);
      setNotes('');
      setTags([]);
      setJiraIssueKey('');
      setLinkedIssues([]);
      setDetectedJiraIssues([]);
      return;
    }

    // 기존 결과 수정 시
    setResult(stableCurrentResult.result || TestResult.NOTRUN);
    setNotes(stableCurrentResult.notes || '');
    setTags(stableCurrentResult.tags || []);
    setJiraIssueKey(stableCurrentResult.jiraIssueKey || '');

    // 노트에서 JIRA 이슈 키 자동 감지
    if (stableCurrentResult.notes) {
      const issues = jiraService.extractIssueKeys(stableCurrentResult.notes);
      setDetectedJiraIssues(issues);
    } else {
      setDetectedJiraIssues([]);
    }
  }, [stableCurrentResult]);

  // JIRA 연결 상태 확인
  useEffect(() => {
    if (open || fullPage) {
      checkJiraStatus();
    }
  }, [open, fullPage]);

  // 인라인 이미지 훅 연동
  const getInlineImageValue = useCallback((fieldConfig) => {
    if (fieldConfig?.field === 'notes') return notes;
    return '';
  }, [notes]);

  const updateInlineImageValue = useCallback((fieldConfig, updater) => {
    if (fieldConfig?.field === 'notes') {
      setNotes(prev => {
        const nextValue = typeof updater === 'function' ? updater(prev) : updater;
        return nextValue;
      });
    }
  }, []);

  const showInlineImageError = useCallback((message) => {
    if (!message) return;
    setSaveError(message);
    setShowSaveSuccess(false); // 에러 시 성공 메시지 가림
  }, []);

  const {
    imageDialogState,
    inlineImageUploading,
    handleMarkdownPaste,
    handleInlineImageDialogClose,
    handleInlineImageInsert,
    updateImageDialogState,
  } = useInlineImagePaste({
    api,
    testCaseId,
    isViewer,
    t,
    getFieldValue: getInlineImageValue,
    updateFieldValue: updateInlineImageValue,
    onError: showInlineImageError,
  });

  // 노트 변경 시 JIRA 이슈 키 감지 (사용자가 notes를 직접 수정할 때만 실행)
  useEffect(() => {
    // stableCurrentResult의 notes가 아닌 실제 상태의 notes를 감지
    // 이렇게 하면 사용자가 타이핑할 때만 감지됨
    const timer = setTimeout(() => {
      if (notes) {
        const issues = jiraService.extractIssueKeys(notes);
        setDetectedJiraIssues(issues);
      } else {
        setDetectedJiraIssues([]);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(timer);
  }, [notes]);

  // 스마트 리다이렉트 연동: 위치 정보를 통해 전달된 지라 이슈 키를 초기값으로 설정
  useEffect(() => {
    if ((open || fullPage) && location.state?.autoFillJiraIssueKey && !jiraIssueKey && !stableCurrentResult) {
      setJiraIssueKey(location.state.autoFillJiraIssueKey);
    }
  }, [open, fullPage, location.state, jiraIssueKey, stableCurrentResult]);


  // 프로젝트의 기존 태그 목록 조회
  useEffect(() => {
    if (!testCase?.project?.id) return;

    const fetchTags = async () => {
      try {
        const response = await api(`/api/testcases/projects/${testCase.project.id}/tags`);
        if (response.ok) {
          const tags = await response.json();
          setAvailableTags(Array.from(tags));
        }
      } catch (error) {
        console.error('태그 목록 조회 실패:', error);
      }
    };

    fetchTags();
  }, [testCase?.project?.id, api]);

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
    const allowedTypes = ['text/plain', 'text/csv', 'application/json', 'text/markdown', 'application/pdf', 'image/png', 'image/jpeg', 'image/gif'];
    const invalidTypes = files.filter(file => !allowedTypes.includes(file.type) && !file.name.match(/\.(txt|csv|json|md|pdf|log|png|jpg|jpeg|gif)$/i));
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

  const handlePreview = (file) => {
    const url = URL.createObjectURL(file.file);
    setPreviewUrl(url);
    setPreviewTitle(file.name);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewOpen(false);
    setPreviewUrl('');
    setPreviewTitle('');
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

  const handleSaveAndNext = useCallback(async (customResult, options = {}) => {
    if (isViewer) return;

    const {
      advanceToNext = true,
      keepDialogOpen = false,
      showSuccess = false,
    } = options;

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
        tags: tags || [],
      };

      // JIRA 이슈 키가 있고 유효한 값일 때만 추가 (대문자로 변환)
      const trimmedJiraKey = jiraIssueKey ? jiraIssueKey.trim().toUpperCase() : '';
      if (trimmedJiraKey && trimmedJiraKey.length > 0) {
        requestData.jiraIssueKey = trimmedJiraKey;
      }

      // 이전 결과 수정 모드일 경우 PUT 요청
      if (isPreviousResultEdit && currentResult?.id) {
        const response = await api(`/api/test-executions/results/${currentResult.id}`, {
          method: 'PUT',
          body: JSON.stringify(requestData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || t('testResult.error.saveFailed'));
        }

        const updatedResult = await response.json();

        // 성공 메시지
        if (showSuccess) {
          setShowSaveSuccess(true);
        }

        // onSave 콜백으로 비행 폼 닫기
        onSave(updatedResult, { keepDialogOpen });
        return;
      }

      // 기본 모드: POST 요청 (새로운 결과 추가)
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

      // 인라인 이미지 사용 상태 업데이트
      try {
        const resultId = isPreviousResultEdit ? currentResult?.id : (updatedExecution.results?.find(r => r.testCaseId === testCaseId)?.id);
        if (resultId) {
          const allAttachmentIds = extractAttachmentIds(notes);
          if (allAttachmentIds.size > 0 || allAttachmentIds.length > 0) {
             await Promise.all(
              Array.from(allAttachmentIds).map(id =>
                api(`/api/testcase-attachments/${id}/mark-used`, { method: 'PATCH' })
                  .catch(err => console.error(`Failed to mark attachment ${id} as used:`, err))
              )
            );
          }
        }
      } catch (err) {
        console.error('Failed to update inline image usage status:', err);
      }

      onSave(updatedExecution, { keepDialogOpen });
      if (advanceToNext && onNext) onNext();
      if (showSuccess) {
        setShowSaveSuccess(true);
      }
    } catch (err) {
      setSaveError(err.message);
    }
  }, [api, executionId, testCaseId, notes, tags, jiraIssueKey, onSave, onNext, isViewer, result, attachedFiles, t]);

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
        setTimeout(() => handleSaveAndNext(newResult, {
          advanceToNext: false,
          keepDialogOpen: true,
          showSuccess: true,
        }), 0);
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

  const renderContent = () => (
    <>
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
          <TestCaseDetails testCase={testCase} t={t} />

          <Box sx={{ mt: 3, width: '100%', boxSizing: 'border-box' }}>
            {/* 기존 TestResultSelector는 플로팅 메뉴로 대체됨 */}

            <TestResultNotes
              notes={notes}
              setNotes={setNotes}
              isViewer={isViewer}
              t={t}
              darkMode={darkMode}
              height={fullPage ? 300 : 200}
              onNext={onNext}
              onPrevious={onPrevious}
              currentIndex={currentIndex}
              totalCount={totalCount}
              onFullscreenChange={setIsNotesFullscreen}
              // 인라인 이미지 관련 추가
              onMarkdownPaste={(event) => handleMarkdownPaste(event, { type: 'field', field: 'notes' })}
              inlineImageUploading={inlineImageUploading}
              // 플로팅 메뉴용 prop 추가
              result={result}
              onResultChange={(newResult) => {
                setResult(newResult);
                setTimeout(() => handleSaveAndNext(newResult, {
                  advanceToNext: false,
                  keepDialogOpen: true,
                  showSuccess: true,
                }), 100);
              }}
              onSave={() => handleSaveAndNext(result)}
              onClose={onClose}
              loading={loading}
              shouldShowJiraButton={shouldShowJiraButton}
              handleOpenJiraDialog={handleOpenJiraDialog}
              testCase={testCase}
              saveButtonRef={saveButtonRef}
            />

            <TestResultTags
              tags={tags}
              setTags={setTags}
              availableTags={availableTags}
              isViewer={isViewer}
              t={t}
            />

            <TestResultAttachments
              attachedFiles={attachedFiles}
              handleFileUpload={handleFileUpload}
              handleFileDelete={handleFileDelete}
              handlePreview={handlePreview}
              isViewer={isViewer}
              t={t}
              fileUploadError={fileUploadError}
              isFileUploading={isFileUploading}
              currentResult={currentResult}
            />

            <TestResultJira
              jiraIssueKey={jiraIssueKey}
              setJiraIssueKey={setJiraIssueKey}
              isJiraIssueKeyInvalid={isJiraIssueKeyInvalid}
              jiraConnectionStatus={jiraConnectionStatus}
              result={result}
              notes={notes}
              handleIssueLinked={handleIssueLinked}
              handleIssueUnlinked={handleIssueUnlinked}
              linkedIssues={linkedIssues}
              isViewer={isViewer}
              t={t}
              detectedJiraIssues={detectedJiraIssues}
            />

            {/* 하단 Footer는 플로팅 메뉴로 대체됨 */}
          </Box>
        </>
      ) : null}
    </>
  );

  if (fullPage) {
    return (
      <Box sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: (theme) => theme.palette.background.default,
        p: { xs: 1, sm: 2, md: 3 }, // 반응형 패딩
        boxSizing: 'border-box',
        overflowX: 'hidden' // 가로 스크롤 방지
      }}>
        <TestResultHeader
          onPrevious={onPrevious}
          onNext={onNext}
          currentIndex={currentIndex}
          totalCount={totalCount}
          testCase={testCase}
          isViewer={isViewer}
          t={t}
          hideButtons={true}
        />

        {renderContent()}

        {/* 플로팅 메뉴 (스크롤 시에도 고정) - 비고 전체화면이 아닐 때만 표시 */}
        {!isNotesFullscreen && (
          <TestResultFloatingMenu
            result={result}
            onResultChange={(newResult) => {
              setResult(newResult);
              setTimeout(() => handleSaveAndNext(newResult, {
                advanceToNext: false,
                keepDialogOpen: true,
                showSuccess: true,
              }), 100);
            }}
            onPrevious={onPrevious}
            onNext={onNext}
            onSave={() => handleSaveAndNext(result)}
            onClose={onClose}
            currentIndex={currentIndex}
            totalCount={totalCount}
            isViewer={isViewer}
            loading={loading}
            shouldShowJiraButton={shouldShowJiraButton}
            handleOpenJiraDialog={handleOpenJiraDialog}
            testCase={testCase}
            saveButtonRef={saveButtonRef}
            t={t}
            isNotesFullscreen={isNotesFullscreen}
          />
        )}

        <Snackbar
          open={!!saveError}
          autoHideDuration={6000}
          onClose={() => setSaveError(undefined)}
        >
          <Alert severity="error" onClose={() => setSaveError(undefined)}>
            {saveError}
          </Alert>
        </Snackbar>
        <Snackbar
          open={showSaveSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSaveSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setShowSaveSuccess(false)}>
            {t('testcase.message.saved', '저장되었습니다.')}
          </Alert>
        </Snackbar>

        {/* 미리보기 다이얼로그 */}
        <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="lg" fullWidth>
          <DialogTitle>{previewTitle}</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center' }}>
              <img src={previewUrl} alt={previewTitle} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreview}>{t('common.button.close', '닫기')}</Button>
          </DialogActions>
        </Dialog>

        {/* {t('testResult.form.jiraComment')} 다이얼로그 */}
        <JiraCommentDialog
          open={jiraDialogOpen}
          onClose={() => setJiraDialogOpen(false)}
          testResult={{ result, notes, jiraIssueKey }}
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

      <DialogContent sx={{ pb: 12, px: { xs: 2, sm: 3 } }}> {/* 플로팅 메뉴 공간 및 좌우 여백 확보 */}
        {renderContent()}
        
        {/* 플로팅 메뉴 (스크롤 시에도 고정) - 비고 전체화면이 아닐 때만 표시 */}
        {!loading && testCase && !isNotesFullscreen && (
          <TestResultFloatingMenu
            result={result}
            onResultChange={(newResult) => {
              setResult(newResult);
              setTimeout(() => handleSaveAndNext(newResult, {
                advanceToNext: false,
                keepDialogOpen: true,
                showSuccess: true,
              }), 100);
            }}
            onPrevious={onPrevious}
            onNext={onNext}
            onSave={() => handleSaveAndNext(result)}
            onClose={onClose}
            currentIndex={currentIndex}
            totalCount={totalCount}
            isViewer={isViewer}
            loading={loading}
            shouldShowJiraButton={shouldShowJiraButton}
            handleOpenJiraDialog={handleOpenJiraDialog}
            testCase={testCase}
            saveButtonRef={saveButtonRef}
            t={t}
            isNotesFullscreen={isNotesFullscreen}
          />
        )}
      </DialogContent>

      {/* 하단 버튼들은 플로팅 메뉴로 대체됨 */}

      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(undefined)}
      >
        <Alert severity="error" onClose={() => setSaveError(undefined)}>
          {saveError}
        </Alert>
      </Snackbar>
      <Snackbar
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSaveSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSaveSuccess(false)}>
          {t('testcase.message.saved', '저장되었습니다.')}
        </Alert>
      </Snackbar>

      {/* 미리보기 다이얼로그 */}
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="lg" fullWidth>
        <DialogTitle>{previewTitle}</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <img src={previewUrl} alt={previewTitle} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>{t('common.button.close', '닫기')}</Button>
        </DialogActions>
      </Dialog>

      {/* {t('testResult.form.jiraComment')} 다이얼로그 */}
      <JiraCommentDialog
        open={jiraDialogOpen}
        onClose={() => setJiraDialogOpen(false)}
        testResult={{ result, notes, jiraIssueKey }}
        testCase={testCase}
        linkedIssues={linkedIssues}
        onCommentAdded={handleJiraCommentAdded}
      />

      <InlineImageDialog
        open={imageDialogState.open}
        imageDialogState={imageDialogState}
        t={t}
        onClose={handleInlineImageDialogClose}
        onInsert={handleInlineImageInsert}
        updateImageDialogState={updateImageDialogState}
      />
    </Dialog>
  );
};

TestResultForm.propTypes = {
  open: PropTypes.bool.isRequired,
  testCaseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  executionId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  currentResult: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onNext: PropTypes.func,
  onPrevious: PropTypes.func,
  currentIndex: PropTypes.number,
  totalCount: PropTypes.number,
  fullPage: PropTypes.bool,
  onOpenFullPage: PropTypes.func,
  isPreviousResultEdit: PropTypes.bool,  // 이전 결과 수정 모드 여부
};

export default TestResultForm;
