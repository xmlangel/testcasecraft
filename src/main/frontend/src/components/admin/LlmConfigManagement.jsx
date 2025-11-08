import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { LlmConfigProvider, useLlmConfig } from '../../context/LlmConfigContext';
import { useI18n } from '../../context/I18nContext';

const LlmConfigManagementContent = () => {
  const { t } = useI18n();
  const {
    configs,
    loading,
    error,
    fetchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    setDefaultConfig,
    testConnection,
    testUnsavedSettings,
    toggleActive
  } = useLlmConfig();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'OPENWEBUI',
    apiUrl: '',
    apiKey: '',
    modelName: '',
    isDefault: false
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testingDialog, setTestingDialog] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleOpenDialog = (config = null) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        provider: config.provider,
        apiUrl: config.apiUrl,
        apiKey: '', // API Key는 수정 시 비워둠 (선택적 업데이트)
        modelName: config.modelName,
        isDefault: config.isDefault
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        provider: 'OPENWEBUI',
        apiUrl: '',
        apiKey: '',
        modelName: '',
        isDefault: false
      });
    }
    setDialogOpen(true);
    setShowApiKey(false);
    setTestResult(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConfig(null);
    setFormData({
      name: '',
      provider: 'OPENWEBUI',
      apiUrl: '',
      apiKey: '',
      modelName: '',
      isDefault: false
    });
    setShowApiKey(false);
    setTestResult(null);
  };

  const handleTestDialogSettings = async () => {
    // 필수 필드 검증
    if (!formData.provider || !formData.apiUrl || !formData.apiKey || !formData.modelName) {
      setTestResult({ success: false, message: '모든 필수 필드를 입력해주세요' });
      return;
    }

    setTestingDialog(true);
    setTestResult(null);
    try {
      await testUnsavedSettings(formData);
      setTestResult({ success: true, message: '연결 테스트 성공!' });
    } catch (err) {
      setTestResult({ success: false, message: err.message || '연결 테스트 실패' });
    } finally {
      setTestingDialog(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingConfig) {
        await updateConfig(editingConfig.id, formData);
        setSuccessMessage('LLM 설정이 수정되었습니다');
      } else {
        await createConfig(formData);
        setSuccessMessage('LLM 설정이 생성되었습니다');
      }
      handleCloseDialog();
    } catch (err) {
      // 에러는 Context에서 처리됨
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말 이 LLM 설정을 삭제하시겠습니까?')) {
      try {
        await deleteConfig(id);
        setSuccessMessage('LLM 설정이 삭제되었습니다');
      } catch (err) {
        // 에러는 Context에서 처리됨
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultConfig(id);
      setSuccessMessage('기본 LLM 설정이 변경되었습니다');
    } catch (err) {
      // 에러는 Context에서 처리됨
    }
  };

  const handleTestConnection = async (id) => {
    setTestingId(id);
    try {
      await testConnection(id);
      setSuccessMessage('연결 테스트 성공!');
    } catch (err) {
      // 에러는 Context에서 처리됨
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleActive(id);
      setSuccessMessage('LLM 설정 활성 상태가 변경되었습니다');
    } catch (err) {
      // 에러는 Context에서 처리됨
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {t('admin.llmConfig.title', 'LLM 설정 관리')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t('admin.llmConfig.addConfig', 'LLM 설정 추가')}
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !testingId ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.llmConfig.name', '이름')}</TableCell>
                <TableCell>{t('admin.llmConfig.provider', '제공자')}</TableCell>
                <TableCell>{t('admin.llmConfig.model', '모델')}</TableCell>
                <TableCell>{t('admin.llmConfig.apiUrl', 'API URL')}</TableCell>
                <TableCell align="center">{t('admin.llmConfig.status', '상태')}</TableCell>
                <TableCell align="center">{t('admin.llmConfig.default', '기본')}</TableCell>
                <TableCell align="center">{t('admin.llmConfig.actions', '작업')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {t('admin.llmConfig.noConfigs', 'LLM 설정이 없습니다')}
                  </TableCell>
                </TableRow>
              ) : (
                configs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {config.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={config.provider}
                        size="small"
                        color={
                          config.provider === 'OPENAI'
                            ? 'primary'
                            : config.provider === 'OLLAMA'
                            ? 'success'
                            : 'secondary'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {config.modelName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {config.apiUrl}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Chip
                          icon={config.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                          label={config.isActive ? t('admin.llmConfig.active', '활성') : t('admin.llmConfig.inactive', '비활성')}
                          size="small"
                          color={config.isActive ? 'success' : 'default'}
                        />
                        {config.connectionVerified !== null && (
                          <Tooltip title={config.lastConnectionError || '연결 성공'}>
                            <Chip
                              icon={config.connectionVerified ? <WifiIcon /> : <WifiOffIcon />}
                              label={config.connectionVerified ? '연결됨' : '연결 실패'}
                              size="small"
                              color={config.connectionVerified ? 'success' : 'error'}
                            />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleSetDefault(config.id)}
                        disabled={config.isDefault || !config.isActive}
                        color={config.isDefault ? 'primary' : 'default'}
                      >
                        {config.isDefault ? <StarIcon /> : <StarBorderIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title={t('admin.llmConfig.testConnection', '연결 테스트')}>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleTestConnection(config.id)}
                              disabled={testingId === config.id}
                            >
                              {testingId === config.id ? <CircularProgress size={20} /> : <WifiIcon />}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={config.isActive ? t('admin.llmConfig.deactivate', '비활성화') : t('admin.llmConfig.activate', '활성화')}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleActive(config.id)}
                            color={config.isActive ? 'success' : 'default'}
                          >
                            {config.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.edit', '수정')}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(config)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('common.delete', '삭제')}>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(config.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingConfig ? t('admin.llmConfig.editConfig', 'LLM 설정 수정') : t('admin.llmConfig.createConfig', 'LLM 설정 생성')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t('admin.llmConfig.name', '이름')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>{t('admin.llmConfig.provider', '제공자')}</InputLabel>
              <Select
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                label={t('admin.llmConfig.provider', '제공자')}
              >
                <MenuItem value="OPENWEBUI">OpenWebUI</MenuItem>
                <MenuItem value="OPENAI">OpenAI</MenuItem>
                <MenuItem value="OLLAMA">Ollama</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t('admin.llmConfig.apiUrl', 'API URL')}
              value={formData.apiUrl}
              onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              fullWidth
              required
              placeholder={
                formData.provider === 'OPENAI'
                  ? 'https://api.openai.com'
                  : formData.provider === 'OLLAMA'
                  ? 'http://localhost:11434'
                  : 'http://localhost:3000'
              }
              helperText={
                formData.provider === 'OLLAMA'
                  ? 'Docker 환경: http://host.docker.internal:11434 | 로컬: http://localhost:11434'
                  : ''
              }
            />

            <TextField
              label={t('admin.llmConfig.apiKey', 'API Key')}
              type={showApiKey ? 'text' : 'password'}
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              fullWidth
              required={!editingConfig}
              placeholder={editingConfig ? '(변경하지 않으려면 비워두세요)' : ''}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowApiKey(!showApiKey)}
                    edge="end"
                  >
                    {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                )
              }}
            />

            <TextField
              label={t('admin.llmConfig.model', '모델 이름')}
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              fullWidth
              required
              placeholder={
                formData.provider === 'OPENAI'
                  ? 'gpt-4'
                  : formData.provider === 'OLLAMA'
                  ? 'qwen2.5-coder:7b'
                  : 'llama3.1'
              }
              helperText={
                formData.provider === 'OLLAMA'
                  ? '예시: qwen2.5-coder:7b, llama3.1:8b, mistral:7b, deepseek-coder:6.7b'
                  : formData.provider === 'OPENAI'
                  ? '예시: gpt-4, gpt-3.5-turbo, gpt-4-turbo'
                  : '예시: llama3.1, granite3.1-dense:8b'
              }
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
              }
              label={t('admin.llmConfig.setAsDefault', '기본 설정으로 지정')}
            />

            {/* 테스트 연결 버튼 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={testingDialog ? <CircularProgress size={20} /> : <WifiIcon />}
                onClick={handleTestDialogSettings}
                disabled={testingDialog || !formData.provider || !formData.apiUrl || !formData.apiKey || !formData.modelName}
                fullWidth
              >
                {t('admin.llmConfig.testConnection', '연결 테스트')}
              </Button>
            </Box>

            {/* 테스트 결과 표시 */}
            {testResult && (
              <Alert severity={testResult.success ? 'success' : 'error'} sx={{ mt: 1 }}>
                {testResult.message}
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('common.cancel', '취소')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.apiUrl || (!formData.apiKey && !editingConfig) || !formData.modelName}
          >
            {editingConfig ? t('common.save', '저장') : t('common.create', '생성')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const LlmConfigManagement = () => {
  return (
    <LlmConfigProvider>
      <LlmConfigManagementContent />
    </LlmConfigProvider>
  );
};

export default LlmConfigManagement;
