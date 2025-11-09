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
  Stack,
  Tabs,
  Tab
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
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { LlmConfigProvider, useLlmConfig } from '../../context/LlmConfigContext';
import { useI18n } from '../../context/I18nContext';

// 기본 테스트 케이스 템플릿
const DEFAULT_TEST_CASE_TEMPLATE = `{
  "name": "사용자 로그인 테스트",
  "description": "정상 사용자 ID/비밀번호 입력 시 로그인 성공",
  "priority": "High",
  "tags": ["인증", "로그인", "P1"],
  "preCondition": "테스트 환경에 로그인 화면이 배포되어 있고, 테스트 DB에 test.user@example.com 계정이 존재해야 함",
  "steps": [
    {
      "stepNumber": 1,
      "action": "로그인 URL에 접속",
      "expected": "로그인 폼이 표시됨"
    },
    {
      "stepNumber": 2,
      "action": "이메일에 test.user@example.com 입력",
      "expected": "입력값이 표시됨"
    },
    {
      "stepNumber": 3,
      "action": "비밀번호에 Password123! 입력",
      "expected": "마스킹되어 표시됨"
    },
    {
      "stepNumber": 4,
      "action": "로그인 버튼 클릭",
      "expected": "대시보드로 이동되고 환영 메시지 표시됨"
    }
  ],
  "expectedResults": "사용자가 정상적으로 인증되고 대시보드에 접근할 수 있어야 함"
}`;

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
    isDefault: false,
    testCaseTemplate: DEFAULT_TEST_CASE_TEMPLATE
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testingDialog, setTestingDialog] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [globalDocuments, setGlobalDocuments] = useState([]);
  const [loadingGlobalDocs, setLoadingGlobalDocs] = useState(false);
  const [uploadingGlobalDoc, setUploadingGlobalDoc] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  // 공통 문서 목록 조회
  useEffect(() => {
    if (currentTab === 1) {
      fetchGlobalDocuments();
    }
  }, [currentTab]);

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
        isDefault: config.isDefault,
        testCaseTemplate: config.testCaseTemplate || DEFAULT_TEST_CASE_TEMPLATE
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        provider: 'OPENWEBUI',
        apiUrl: '',
        apiKey: '',
        modelName: '',
        isDefault: false,
        testCaseTemplate: DEFAULT_TEST_CASE_TEMPLATE
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
      isDefault: false,
      testCaseTemplate: DEFAULT_TEST_CASE_TEMPLATE
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

  // 템플릿 초기화
  const handleResetTemplate = () => {
    setFormData({ ...formData, testCaseTemplate: DEFAULT_TEST_CASE_TEMPLATE });
  };

  // 템플릿 JSON 다운로드
  const handleDownloadTemplate = () => {
    try {
      // JSON 유효성 검증
      JSON.parse(formData.testCaseTemplate);

      const blob = new Blob([formData.testCaseTemplate], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'test-case-template.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('템플릿이 유효한 JSON 형식이 아닙니다: ' + error.message);
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

  // 공통 문서 목록 조회
  const fetchGlobalDocuments = async () => {
    setLoadingGlobalDocs(true);
    try {
      const response = await fetch('/api/rag/global-documents?page=1&size=100');
      if (!response.ok) throw new Error('공통 문서 목록 조회 실패');
      const data = await response.json();
      setGlobalDocuments(data.documents || []);
    } catch (err) {
      console.error('Failed to fetch global documents:', err);
    } finally {
      setLoadingGlobalDocs(false);
    }
  };

  // 공통 문서 업로드
  const handleUploadGlobalDocument = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    if (!allowedTypes.includes(file.type)) {
      alert('지원되는 파일 형식: PDF, DOCX, DOC, TXT');
      return;
    }

    // 파일 크기 검증 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('파일 크기는 50MB를 초과할 수 없습니다');
      return;
    }

    setUploadingGlobalDoc(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', 'admin');

    try {
      const response = await fetch('/api/rag/global-documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '공통 문서 업로드 실패');
      }

      setSuccessMessage(`공통 문서 "${file.name}"이 업로드되었습니다`);
      await fetchGlobalDocuments();

      // 파일 입력 초기화
      event.target.value = '';
    } catch (err) {
      alert('공통 문서 업로드 실패: ' + err.message);
    } finally {
      setUploadingGlobalDoc(false);
    }
  };

  // 공통 문서 삭제
  const handleDeleteGlobalDocument = async (documentId, fileName) => {
    if (!window.confirm(`공통 문서 "${fileName}"을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/rag/global-documents/${documentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('공통 문서 삭제 실패');

      setSuccessMessage(`공통 문서 "${fileName}"이 삭제되었습니다`);
      await fetchGlobalDocuments();
    } catch (err) {
      alert('공통 문서 삭제 실패: ' + err.message);
    }
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('admin.llmConfig.title', 'LLM 설정 관리')}
      </Typography>

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

      {/* 탭 네비게이션 */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab label="LLM 설정 목록" />
          <Tab label="기본 템플릿" />
        </Tabs>
      </Paper>

      {/* 탭 0: LLM 설정 목록 */}
      {currentTab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              {t('admin.llmConfig.addConfig', 'LLM 설정 추가')}
            </Button>
          </Box>

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
                  <TableRow
                    key={config.id}
                    sx={{
                      opacity: config.isActive ? 1 : 0.5,
                      bgcolor: config.isActive ? 'inherit' : 'action.hover'
                    }}
                  >
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
        </>
      )}

      {/* 탭 1: 기본 템플릿 & 공통 파일 */}
      {currentTab === 1 && (
        <Stack spacing={3}>
          {/* 기본 템플릿 섹션 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📋 테스트 케이스 생성 기본 템플릿
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              이 템플릿은 새로운 LLM 설정 생성 시 자동으로 설정되며, AI에게 테스트 케이스 생성을 요청할 때 참고 형식으로 사용됩니다.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              각 LLM 설정별로 이 템플릿을 수정하여 사용할 수 있습니다.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  기본 템플릿 JSON:
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const blob = new Blob([DEFAULT_TEST_CASE_TEMPLATE], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'default-test-case-template.json';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }}
                >
                  다운로드
                </Button>
              </Box>
              <TextField
                value={DEFAULT_TEST_CASE_TEMPLATE}
                fullWidth
                multiline
                rows={20}
                variant="outlined"
                InputProps={{ readOnly: true }}
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace'
                  },
                  bgcolor: 'grey.50'
                }}
              />
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>사용 방법:</strong><br />
                1. LLM 설정 생성 시 이 템플릿이 자동으로 적용됩니다.<br />
                2. 각 LLM 설정에서 개별적으로 템플릿을 수정할 수 있습니다.<br />
                3. RAG 채팅에서 "테스트 케이스"를 포함한 요청 시 자동으로 템플릿을 참고합니다.
              </Typography>
            </Alert>
          </Paper>

          {/* 공통 파일 관리 섹션 */}
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  🌐 공통 RAG 문서 관리
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  모든 프로젝트에서 공통으로 참고할 수 있는 문서를 관리합니다. (관리자 전용)
                </Typography>
              </Box>
              <Button
                variant="contained"
                component="label"
                startIcon={uploadingGlobalDoc ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                disabled={uploadingGlobalDoc}
              >
                파일 업로드
                <input
                  type="file"
                  hidden
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleUploadGlobalDocument}
                />
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>공통 문서란?</strong><br />
                • 모든 프로젝트의 RAG 검색에서 자동으로 참조됩니다<br />
                • 회사 공통 가이드, 코딩 컨벤션, 테스팅 표준 등을 등록하세요<br />
                • 지원 형식: PDF, DOCX, DOC, TXT (최대 50MB)
              </Typography>
            </Alert>

            {loadingGlobalDocs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : globalDocuments.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
                <DescriptionIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  아직 공통 문서가 없습니다. 첫 번째 문서를 업로드해보세요!
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>파일명</TableCell>
                      <TableCell>파일 크기</TableCell>
                      <TableCell>업로더</TableCell>
                      <TableCell>업로드 날짜</TableCell>
                      <TableCell align="center">작업</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {globalDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DescriptionIcon color="primary" />
                            <Typography variant="body2">{doc.fileName}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatFileSize(doc.fileSize || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {doc.uploadedBy || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('ko-KR') : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="삭제">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteGlobalDocument(doc.id, doc.fileName)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Stack>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
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
                <MenuItem value="PERPLEXITY">Perplexity</MenuItem>
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
                  : formData.provider === 'PERPLEXITY'
                  ? 'https://api.perplexity.ai'
                  : 'http://localhost:3000'
              }
              helperText={
                formData.provider === 'OLLAMA'
                  ? 'Docker 환경: http://host.docker.internal:11434 | 로컬: http://localhost:11434'
                  : formData.provider === 'PERPLEXITY'
                  ? '기본 URL: https://api.perplexity.ai'
                  : formData.provider === 'OPENAI'
                  ? '기본 URL: https://api.openai.com'
                  : formData.provider === 'OPENWEBUI'
                  ? 'Docker 환경: http://host.docker.internal:3000 | 로컬: http://localhost:3000'
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
                  : formData.provider === 'PERPLEXITY'
                  ? 'llama-3.1-sonar-large-128k-online'
                  : 'llama3.1'
              }
              helperText={
                formData.provider === 'OLLAMA'
                  ? '예시: qwen2.5-coder:7b, llama3.1:8b, mistral:7b, deepseek-coder:6.7b'
                  : formData.provider === 'OPENAI'
                  ? '예시: gpt-4, gpt-3.5-turbo, gpt-4-turbo'
                  : formData.provider === 'PERPLEXITY'
                  ? '예시: llama-3.1-sonar-large-128k-online, llama-3.1-sonar-small-128k-online'
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

            {/* 테스트 케이스 템플릿 */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                테스트 케이스 생성 템플릿 (JSON)
                <Tooltip title="AI에게 테스트 케이스 생성을 요청할 때 이 템플릿을 참고합니다">
                  <Typography variant="caption" color="text.secondary">ⓘ</Typography>
                </Tooltip>
              </Typography>
              <TextField
                value={formData.testCaseTemplate}
                onChange={(e) => setFormData({ ...formData, testCaseTemplate: e.target.value })}
                fullWidth
                multiline
                rows={12}
                variant="outlined"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace'
                  }
                }}
                placeholder={DEFAULT_TEST_CASE_TEMPLATE}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetTemplate}
                >
                  초기화
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadTemplate}
                >
                  JSON 다운로드
                </Button>
              </Box>
            </Box>

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
