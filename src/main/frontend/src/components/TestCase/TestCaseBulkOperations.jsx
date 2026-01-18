import React, { useState } from 'react';
import { useI18n } from '../../context/I18nContext.jsx';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Alert,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  TextField
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  FileCopy as CopyIcon,
  SwapHoriz as MoveIcon
} from '@mui/icons-material';

const TestCaseBulkOperations = ({
  selectedTestCases,
  onBulkUpdate,
  onBulkDelete,
  onBulkMove,
  onBulkCopy,
  onClose,
  projects = [],
  folders = []
}) => {
  const { t } = useI18n();
  const [operation, setOperation] = useState('');
  const [targetProject, setTargetProject] = useState('');
  const [targetFolder, setTargetFolder] = useState('');
  const [updateFields, setUpdateFields] = useState({
    priority: '',
    type: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleOperationChange = (event) => {
    setOperation(event.target.value);
    setError('');
  };

  const handleFieldUpdate = (field, value) => {
    setUpdateFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateOperation = () => {
    if (!operation) {
      setError(t('testcase.bulkOps.error.selectOperation', '작업 유형을 선택해주세요.'));
      return false;
    }

    if (operation === 'move' || operation === 'copy') {
      if (!targetProject) {
        setError(t('testcase.bulkOps.error.selectProject', '대상 프로젝트를 선택해주세요.'));
        return false;
      }
    }

    if (operation === 'delete' && !confirmDelete) {
      setError(t('testcase.bulkOps.error.confirmDelete', '삭제 확인을 체크해주세요.'));
      return false;
    }

    return true;
  };

  const executeOperation = async () => {
    if (!validateOperation()) return;

    setLoading(true);
    setError('');

    try {
      switch (operation) {
        case 'update':
          await onBulkUpdate(selectedTestCases, updateFields);
          break;
        case 'delete':
          await onBulkDelete(selectedTestCases);
          break;
        case 'move':
          await onBulkMove(selectedTestCases, targetProject, targetFolder);
          break;
        case 'copy':
          await onBulkCopy(selectedTestCases, targetProject, targetFolder);
          break;
        default:
          throw new Error(t('testcase.bulkOps.error.unknownOperation', '알 수 없는 작업 유형입니다.'));
      }
      onClose();
    } catch (err) {
      setError(err.message || t('testcase.bulkOps.error.executionFailed', '작업 실행 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  const getOperationDescription = () => {
    switch (operation) {
      case 'update':
        return t('testcase.bulkOps.description.update', '선택된 테스트케이스들의 속성을 일괄 수정합니다.');
      case 'delete':
        return t('testcase.bulkOps.description.delete', '선택된 테스트케이스들을 완전히 삭제합니다. 이 작업은 되돌릴 수 없습니다.');
      case 'move':
        return t('testcase.bulkOps.description.move', '선택된 테스트케이스들을 다른 프로젝트 또는 폴더로 이동합니다.');
      case 'copy':
        return t('testcase.bulkOps.description.copy', '선택된 테스트케이스들을 다른 프로젝트 또는 폴더에 복사합니다.');
      default:
        return '';
    }
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {t('testcase.bulkOps.dialog.title', '테스트케이스 일괄 작업')}
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="textSecondary">
            {t('testcase.bulkOps.dialog.selectedCount', '선택된 항목: {count}개', { count: selectedTestCases.length })}
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selectedTestCases.slice(0, 5).map((testCase) => (
              <Chip
                key={testCase.id}
                label={testCase.name}
                size="small"
                variant="outlined"
              />
            ))}
            {selectedTestCases.length > 5 && (
              <Chip
                label={t('testcase.bulkOps.dialog.moreItems', '외 {count}개', { count: selectedTestCases.length - 5 })}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t('testcase.bulkOps.operation.label', '작업 유형')}</InputLabel>
          <Select
            value={operation}
            onChange={handleOperationChange}
            label={t('testcase.bulkOps.operation.label', '작업 유형')}
            disabled={loading}
          >
            <MenuItem value="update">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EditIcon />
                {t('testcase.bulkOps.operation.update', '속성 일괄 수정')}
              </Box>
            </MenuItem>
            <MenuItem value="copy">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CopyIcon />
                {t('testcase.bulkOps.operation.copy', '복사')}
              </Box>
            </MenuItem>
            <MenuItem value="move">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoveIcon />
                {t('testcase.bulkOps.operation.move', '이동')}
              </Box>
            </MenuItem>
            <MenuItem value="delete">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DeleteIcon />
                {t('testcase.bulkOps.operation.delete', '삭제')}
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {operation && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {getOperationDescription()}
          </Alert>
        )}

        {operation === 'update' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('testcase.bulkOps.field.priority', '우선순위')}</InputLabel>
              <Select
                value={updateFields.priority}
                onChange={(e) => handleFieldUpdate('priority', e.target.value)}
                label={t('testcase.bulkOps.field.priority', '우선순위')}
                disabled={loading}
              >
                <MenuItem value="">{t('testcase.bulkOps.option.noChange', '변경하지 않음')}</MenuItem>
                <MenuItem value="HIGH">{t('testcase.bulkOps.priority.high', '높음')}</MenuItem>
                <MenuItem value="MEDIUM">{t('testcase.bulkOps.priority.medium', '보통')}</MenuItem>
                <MenuItem value="LOW">{t('testcase.bulkOps.priority.low', '낮음')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('testcase.bulkOps.field.type', '유형')}</InputLabel>
              <Select
                value={updateFields.type}
                onChange={(e) => handleFieldUpdate('type', e.target.value)}
                label={t('testcase.bulkOps.field.type', '유형')}
                disabled={loading}
              >
                <MenuItem value="">{t('testcase.bulkOps.option.noChange', '변경하지 않음')}</MenuItem>
                <MenuItem value="testcase">{t('testcase.bulkOps.type.testcase', '테스트케이스')}</MenuItem>
                <MenuItem value="folder">{t('testcase.bulkOps.type.folder', '폴더')}</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label={t('testcase.bulkOps.field.description', '설명 (기존 내용에 추가)')}
              multiline
              rows={3}
              value={updateFields.description}
              onChange={(e) => handleFieldUpdate('description', e.target.value)}
              disabled={loading}
              placeholder={t('testcase.bulkOps.placeholder.description', '이 내용이 기존 설명에 추가됩니다...')}
            />
          </Box>
        )}

        {(operation === 'move' || operation === 'copy') && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>{t('testcase.bulkOps.field.targetProject', '대상 프로젝트')}</InputLabel>
              <Select
                value={targetProject}
                onChange={(e) => setTargetProject(e.target.value)}
                label={t('testcase.bulkOps.field.targetProject', '대상 프로젝트')}
                disabled={loading}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{t('testcase.bulkOps.field.targetFolder', '대상 폴더 (선택사항)')}</InputLabel>
              <Select
                value={targetFolder}
                onChange={(e) => setTargetFolder(e.target.value)}
                label={t('testcase.bulkOps.field.targetFolder', '대상 폴더 (선택사항)')}
                disabled={loading}
              >
                <MenuItem value="">{t('testcase.bulkOps.field.rootFolder', '루트 폴더')}</MenuItem>
                {folders
                  .filter(folder => folder.projectId === targetProject)
                  .map((folder) => (
                    <MenuItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {operation === 'delete' && (
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.checked)}
                disabled={loading}
              />
            }
            label={t('testcase.bulkOps.confirm.deleteMessage', '선택된 테스트케이스들을 완전히 삭제할 것을 확인합니다.')}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel', '취소')}
        </Button>
        <Button
          onClick={executeOperation}
          variant="contained"
          disabled={loading || !operation}
          color={operation === 'delete' ? 'error' : 'primary'}
        >
          {loading ? t('testcase.bulkOps.status.processing', '처리 중...') : t('testcase.bulkOps.button.execute', '실행')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestCaseBulkOperations;