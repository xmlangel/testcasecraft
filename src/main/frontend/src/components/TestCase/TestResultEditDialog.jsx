// src/components/TestCase/TestResultEditDialog.jsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Alert,
  Divider,
  FormControlLabel,
  Switch,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  CompareArrows as CompareIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import testResultEditService from '../../services/testResultEditService.js';
import { getResultLabel } from '../../utils/testResultConstants.js';
import { formatDateSafe } from '../../utils/dateUtils';
import { jiraService } from '../../services/jiraService.js';
// ICT-361: 테스트 결과 첨부파일 보기
import TestResultAttachmentsView from './TestResultAttachmentsView.jsx';
// Markdown 뷰어
import MarkdownViewer from '../common/MarkdownViewer.jsx';

/**
 * ICT-209: 테스트 결과 편집 다이얼로그
 * 원본 데이터 보존과 편집 이력 추적이 가능한 편집 UI
 */
const TestResultEditDialog = ({
  open,
  onClose,
  testResult,
  testCase,
  onEditSaved
}) => {
  const { user } = useAppContext();
  const { t } = useI18n();

  // 편집 상태
  const [editData, setEditData] = useState({
    editedTestCaseName: '',
    editedResult: '',
    editedNotes: '',
    editedJiraIssueKey: '',
    editedJiraIssueUrl: '',
    addedTags: [],
    editReason: '',
    saveAsDraft: true
  });

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeEdit, setActiveEdit] = useState(null);
  const [editHistory, setEditHistory] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [newTag, setNewTag] = useState('');

  // ICT-184: JIRA 이슈 검증 상태
  const [jiraValidation, setJiraValidation] = useState({ status: null, message: null });
  const [jiraValidationLoading, setJiraValidationLoading] = useState(false);

  // 초기화
  useEffect(() => {
    if (open && testResult) {
      initializeEditDialog();
    }
  }, [open, testResult]);

  // ICT-184: JIRA 이슈 키 실시간 검증
  useEffect(() => {
    const validateJiraIssueKey = async () => {
      const issueKey = editData.editedJiraIssueKey.trim();

      // 빈 입력이거나 JIRA 이슈 키 패턴이 아니면 검증 안함
      if (!issueKey || !jiraService.isValidIssueKey(issueKey)) {
        setJiraValidation({ status: null, message: null });
        return;
      }

      setJiraValidationLoading(true);

      try {
        const result = await jiraService.checkIssueExists(issueKey);

        if (result.exists) {
          setJiraValidation({
            status: 'success',
            message: `✅ ${result.issueKey}: ${result.summary || '이슈가 존재합니다'}`
          });
        } else {
          setJiraValidation({
            status: 'error',
            message: result.errorMessage || '이슈를 찾을 수 없습니다'
          });
        }
      } catch (error) {
        console.error('JIRA 이슈 검증 실패:', error);
        setJiraValidation({
          status: 'error',
          message: '이슈 검증 중 오류가 발생했습니다'
        });
      } finally {
        setJiraValidationLoading(false);
      }
    };

    // 300ms 디바운스
    const debounceTimer = setTimeout(validateJiraIssueKey, 300);
    return () => clearTimeout(debounceTimer);
  }, [editData.editedJiraIssueKey]);

  const initializeEditDialog = async () => {
    setLoading(true);
    setError(null);

    try {
      // 활성 편집본 및 권한 조회
      const [activeEditData, permissionsData, historyData] = await Promise.all([
        testResultEditService.getActiveEdit(testResult.id),
        testResultEditService.checkEditPermissions(testResult.id, user?.id),
        testResultEditService.getEditHistory(testResult.id)
      ]);

      setActiveEdit(activeEditData);
      setPermissions(permissionsData);
      setEditHistory(historyData);

      // 편집 폼 초기화
      if (activeEditData && activeEditData.editStatus === 'DRAFT' && activeEditData.editedByUserId === user?.id) {
        // 기존 DRAFT 편집본 로드
        setEditData({
          editedTestCaseName: activeEditData.editedTestCaseName || '',
          editedResult: activeEditData.editedResult || '',
          editedNotes: activeEditData.editedNotes || '',
          editedJiraIssueKey: activeEditData.editedJiraIssueKey || '',
          editedJiraIssueUrl: activeEditData.editedJiraIssueUrl || '',
          addedTags: activeEditData.addedTags || [],
          editReason: activeEditData.editReason || '',
          saveAsDraft: true
        });
      } else {
        // 새로운 편집본을 위한 원본 데이터 로드
        setEditData({
          editedTestCaseName: testCase?.name || '',
          editedResult: testResult.result || '',
          editedNotes: testResult.notes || '',
          editedJiraIssueKey: testResult.jiraIssueKey || '',
          editedJiraIssueUrl: testResult.jiraIssueUrl || '',
          addedTags: [],
          editReason: '',
          saveAsDraft: true
        });
      }

    } catch (err) {
      console.error('편집 다이얼로그 초기화 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editData.addedTags.includes(newTag.trim())) {
      setEditData(prev => ({
        ...prev,
        addedTags: [...prev.addedTags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditData(prev => ({
      ...prev,
      addedTags: prev.addedTags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // ICT-184: JIRA 이슈 존재 여부 검증 (저장 시점)
      if (editData.editedJiraIssueKey.trim()) {
        if (jiraValidation.status === 'error') {
          setError(`JIRA 이슈 검증 실패: ${jiraValidation.message}`);
          return;
        }

        // 검증이 아직 완료되지 않았으면 다시 한번 확인
        if (!jiraValidation.status && jiraService.isValidIssueKey(editData.editedJiraIssueKey.trim())) {
          const result = await jiraService.checkIssueExists(editData.editedJiraIssueKey.trim());
          if (!result.exists) {
            setError(`존재하지 않는 JIRA 이슈입니다: ${result.errorMessage || '이슈를 찾을 수 없습니다'}`);
            return;
          }
        }
      }

      // 유효성 검사
      const validation = testResultEditService.validateEditRequest({
        ...editData,
        originalTestResultId: testResult.id
      });

      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      let result;
      if (activeEdit && activeEdit.editStatus === 'DRAFT' && activeEdit.editedByUserId === user?.id) {
        // 기존 DRAFT 편집본 수정
        result = await testResultEditService.updateEdit(activeEdit.id, {
          ...editData,
          originalTestResultId: testResult.id
        });
      } else {
        // 새로운 편집본 생성
        result = await testResultEditService.createEdit({
          ...editData,
          originalTestResultId: testResult.id
        });
      }

      if (onEditSaved) {
        onEditSaved(result);
      }

      // 성공 메시지 및 다이얼로그 닫기
      onClose();

    } catch (err) {
      console.error('편집 저장 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (editId, approved) => {
    setLoading(true);
    setError(null);

    try {
      await testResultEditService.processEditApproval(editId, approved);
      await initializeEditDialog(); // 상태 새로고침
    } catch (err) {
      console.error('편집 승인 처리 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (editId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await testResultEditService.applyEdit(editId);
      if (result.success) {
        if (onEditSaved) {
          onEditSaved(result);
        }
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('편집 적용 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (editId) => {
    setLoading(true);
    setError(null);

    try {
      await testResultEditService.revertEdit(editId);
      await initializeEditDialog(); // 상태 새로고침
    } catch (err) {
      console.error('편집 되돌리기 오류:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderOriginalData = () => (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="text.secondary">
          <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          원본 데이터
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">테스트케이스명</Typography>
            <Typography variant="body1">{testCase?.name || '알 수 없음'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">결과</Typography>
            <Chip
              label={getResultLabel(testResult?.result)}
              size="small"
              color={testResult?.result === 'PASS' ? 'success' : testResult?.result === 'FAIL' ? 'error' : 'default'}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="body2" color="text.secondary">비고</Typography>
            {testResult?.notes ? (
              <Box sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 1.5,
                bgcolor: '#f9f9f9',
                maxHeight: 200,
                overflow: 'auto'
              }}>
                <MarkdownViewer content={testResult.notes} />
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">없음</Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2" color="text.secondary">JIRA ID</Typography>
            <Typography variant="body1">{testResult?.jiraIssueKey || '없음'}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderEditHistory = () => (
    <Card variant="outlined" sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          편집 이력
        </Typography>
        {editHistory.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            편집 이력이 없습니다.
          </Typography>
        ) : (
          <List dense>
            {editHistory.map((edit, index) => {
              const statusInfo = testResultEditService.getEditStatusInfo(edit.editStatus);
              return (
                <ListItem key={edit.id} divider={index < editHistory.length - 1}>
                  <ListItemIcon>
                    <span style={{ fontSize: '1.2em' }}>{statusInfo.icon}</span>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          color={statusInfo.color}
                        />
                        <Typography variant="body2" color="text.secondary">
                          v{edit.editVersion} - {edit.editedByUserName}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {edit.editReason}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateSafe(edit.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                  {edit.editStatus === 'PENDING' && permissions.canApprove && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        color="success"
                        onClick={() => handleApprove(edit.id, true)}
                      >
                        승인
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleApprove(edit.id, false)}
                      >
                        거부
                      </Button>
                    </Box>
                  )}
                  {edit.editStatus === 'APPROVED' && permissions.canApply && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleApply(edit.id)}
                    >
                      적용
                    </Button>
                  )}
                  {edit.editStatus === 'APPLIED' && permissions.canRevert && (
                    <Button
                      size="small"
                      color="secondary"
                      onClick={() => handleRevert(edit.id)}
                    >
                      되돌리기
                    </Button>
                  )}
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      disableRestoreFocus
      slotProps={{
        paper: {
          sx: { minHeight: '70vh' }
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon />
          테스트 결과 편집
          {activeEdit && (
            <Chip
              label={testResultEditService.getEditStatusInfo(activeEdit.editStatus).label}
              size="small"
              color={testResultEditService.getEditStatusInfo(activeEdit.editStatus).color}
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 권한 정보 */}
        {!permissions.canEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            현재 편집 권한이 없습니다.
            {activeEdit && `활성 편집본(${activeEdit.editedByUserName})이 존재합니다.`}
          </Alert>
        )}

        {/* 원본 데이터 표시 */}
        {renderOriginalData()}

        {/* 편집 폼 */}
        {permissions.canEdit && (
          <Box component="form" sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              편집 내용
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="테스트케이스명"
                  value={editData.editedTestCaseName}
                  onChange={(e) => handleInputChange('editedTestCaseName', e.target.value)}
                  disabled={loading}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>테스트 결과</InputLabel>
                  <Select
                    value={editData.editedResult}
                    onChange={(e) => handleInputChange('editedResult', e.target.value)}
                    disabled={loading}
                    label="테스트 결과"
                  >
                    <MenuItem value="PASS">통과 (PASS)</MenuItem>
                    <MenuItem value="FAIL">실패 (FAIL)</MenuItem>
                    <MenuItem value="BLOCKED">차단됨 (BLOCKED)</MenuItem>
                    <MenuItem value="NOT_RUN">실행 안됨 (NOT_RUN)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="JIRA 이슈 키"
                  value={editData.editedJiraIssueKey}
                  onChange={(e) => handleInputChange('editedJiraIssueKey', e.target.value)}
                  placeholder="예: PRJ-123"
                  disabled={loading}
                  // ICT-184: 실시간 검증 결과에 따른 색상 변경
                  color={
                    jiraValidation.status === 'success' ? 'success' :
                      jiraValidation.status === 'error' ? 'error' : 'primary'
                  }
                  helperText={
                    jiraValidation.status && jiraValidation.message ?
                      jiraValidation.message :
                      "JIRA 이슈 키를 입력하면 존재 여부를 확인합니다"
                  }
                  error={jiraValidation.status === 'error'}
                  slotProps={{
                    input: {
                      // ICT-184: 검증 로딩 및 결과 아이콘 표시
                      endAdornment: jiraValidationLoading || jiraValidation.status ? (
                        <InputAdornment position="end">
                          {jiraValidationLoading ? (
                            <CircularProgress size={16} />
                          ) : jiraValidation.status === 'success' ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                          ) : jiraValidation.status === 'error' ? (
                            <ErrorIcon color="error" fontSize="small" />
                          ) : null}
                        </InputAdornment>
                      ) : null
                    }
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="JIRA 이슈 URL"
                  value={editData.editedJiraIssueUrl}
                  onChange={(e) => handleInputChange('editedJiraIssueUrl', e.target.value)}
                  placeholder="https://jira.company.com/browse/PRJ-123"
                  disabled={loading}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="비고"
                  value={editData.editedNotes}
                  onChange={(e) => handleInputChange('editedNotes', e.target.value)}
                  disabled={loading}
                />
              </Grid>

              {/* 태그 입력 */}
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TextField
                    size="small"
                    label="태그 추가"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    disabled={loading}
                  />
                  <Button
                    onClick={handleAddTag}
                    disabled={!newTag.trim() || loading}
                  >
                    추가
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {editData.addedTags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      disabled={loading}
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={2}
                  label="편집 이유"
                  value={editData.editReason}
                  onChange={(e) => handleInputChange('editReason', e.target.value)}
                  placeholder="편집하는 이유를 입력해주세요..."
                  disabled={loading}
                  helperText="편집 이유는 필수입니다"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editData.saveAsDraft}
                      onChange={(e) => handleInputChange('saveAsDraft', e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label={editData.saveAsDraft ? "임시저장" : "승인 요청"}
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  {editData.saveAsDraft
                    ? "임시저장하면 나중에 계속 편집할 수 있습니다"
                    : "승인 요청하면 관리자의 승인 후 적용됩니다"}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* ICT-361: 첨부파일 섹션 */}
        {testResult?.id && (testResult.attachmentCount > 0) && (
          <Box sx={{ mb: 2 }}>
            <TestResultAttachmentsView
              testResultId={testResult.id}
              compact={true}
              maxHeight={200}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* 이력 토글 버튼 */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Button
            startIcon={<HistoryIcon />}
            onClick={() => setShowHistory(!showHistory)}
            size="small"
          >
            편집 이력 {showHistory ? '숨기기' : '보기'}
          </Button>
        </Box>

        {/* 편집 이력 */}
        {showHistory && renderEditHistory()}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          {t('common.cancel', '취소')}
        </Button>

        {permissions.canEdit && (
          <Button
            onClick={handleSave}
            disabled={loading || !editData.editReason.trim()}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            {editData.saveAsDraft ? t('common.save', '임시저장') : t('common.save', '승인 요청')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TestResultEditDialog;