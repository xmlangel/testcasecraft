// src/main/frontend/src/components/admin/TranslationManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Language as LanguageIcon,
  Key as KeyIcon,
  Translate as TranslateIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext.jsx';
import { API_CONFIG, getDynamicApiUrl } from '../../utils/apiConstants.js';
import {
  LanguageManagementTab,
  TranslationKeyManagementTab,
  TranslationManagementTab,
  StatisticsTab
} from './TranslationManagementTabs.jsx';
import {
  LanguageDialog,
  TranslationKeyDialog,
  TranslationDialog
} from './TranslationDialogs.jsx';

const TranslationManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 언어 관리 상태
  const [languages, setLanguages] = useState([]);
  const [languageDialog, setLanguageDialog] = useState({ open: false, mode: 'create', data: null });

  // 번역 키 관리 상태
  const [translationKeys, setTranslationKeys] = useState([]);
  const [keyDialog, setKeyDialog] = useState({ open: false, mode: 'create', data: null });
  const [keyFilters, setKeyFilters] = useState({ keyword: '', category: '', isActive: '' });

  // 번역 관리 상태
  const [translations, setTranslations] = useState([]);
  const [translationDialog, setTranslationDialog] = useState({ open: false, mode: 'create', data: null });
  const [translationFilters, setTranslationFilters] = useState({ languageCode: '', keyName: '' });

  // 통계 상태
  const [stats, setStats] = useState([]);

  const { clearAllCache } = useI18n();

  // API 유틸리티
  const getApiBaseUrl = async () => {
    try {
      const url = await getDynamicApiUrl();
      return url || window.location.origin;
    } catch (error) {
      console.warn('동적 API URL 로드 실패, 현재 origin 사용:', error);
      return window.location.origin;
    }
  };

  const apiCall = async (endpoint, options = {}) => {
    const baseUrl = await getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const token = localStorage.getItem('accessToken');
    if (token) {
      defaultOptions.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  // 데이터 로드 함수들
  const loadLanguages = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/admin/translations/languages');
      setLanguages(data);
    } catch (err) {
      setError('언어 목록을 로드할 수 없습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTranslationKeys = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (keyFilters.keyword) params.append('keyword', keyFilters.keyword);
      if (keyFilters.category) params.append('category', keyFilters.category);
      if (keyFilters.isActive !== '') params.append('isActive', keyFilters.isActive);

      const data = await apiCall(`/api/admin/translations/keys?${params.toString()}`);
      setTranslationKeys(data);
    } catch (err) {
      setError('번역 키 목록을 로드할 수 없습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTranslations = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/admin/translations';

      if (translationFilters.languageCode) {
        endpoint = `/api/admin/translations/language/${translationFilters.languageCode}`;
      } else if (translationFilters.keyName) {
        endpoint = `/api/admin/translations/key/${translationFilters.keyName}`;
      }

      const data = await apiCall(endpoint);
      setTranslations(data);
    } catch (err) {
      setError('번역 목록을 로드할 수 없습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/api/i18n/statistics/completion');
      setStats(data);
    } catch (err) {
      setError('통계를 로드할 수 없습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    if (tabValue === 0) loadLanguages();
    else if (tabValue === 1) loadTranslationKeys();
    else if (tabValue === 2) loadTranslations();
    else if (tabValue === 3) loadStats();
  }, [tabValue]);

  // 필터 변경 시 재로드
  useEffect(() => {
    if (tabValue === 1) loadTranslationKeys();
  }, [keyFilters]);

  useEffect(() => {
    if (tabValue === 2) loadTranslations();
  }, [translationFilters]);

  // 언어 CRUD 함수들
  const handleCreateLanguage = async (formData) => {
    try {
      await apiCall('/api/admin/translations/languages', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setSuccess('언어가 성공적으로 생성되었습니다');
      setLanguageDialog({ open: false, mode: 'create', data: null });
      loadLanguages();
      clearAllCache();
    } catch (err) {
      setError('언어 생성 실패: ' + err.message);
    }
  };

  const handleUpdateLanguage = async (id, formData) => {
    try {
      await apiCall(`/api/admin/translations/languages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setSuccess('언어가 성공적으로 업데이트되었습니다');
      setLanguageDialog({ open: false, mode: 'create', data: null });
      loadLanguages();
      clearAllCache();
    } catch (err) {
      setError('언어 업데이트 실패: ' + err.message);
    }
  };

  const handleDeleteLanguage = async (id) => {
    if (!window.confirm('정말로 이 언어를 삭제하시겠습니까?')) return;

    try {
      await apiCall(`/api/admin/translations/languages/${id}`, {
        method: 'DELETE'
      });
      setSuccess('언어가 성공적으로 삭제되었습니다');
      loadLanguages();
      clearAllCache();
    } catch (err) {
      setError('언어 삭제 실패: ' + err.message);
    }
  };

  // 번역 키 CRUD 함수들
  const handleCreateTranslationKey = async (formData) => {
    try {
      await apiCall('/api/admin/translations/keys', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setSuccess('번역 키가 성공적으로 생성되었습니다');
      setKeyDialog({ open: false, mode: 'create', data: null });
      loadTranslationKeys();
      clearAllCache();
    } catch (err) {
      setError('번역 키 생성 실패: ' + err.message);
    }
  };

  const handleUpdateTranslationKey = async (id, formData) => {
    try {
      await apiCall(`/api/admin/translations/keys/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setSuccess('번역 키가 성공적으로 업데이트되었습니다');
      setKeyDialog({ open: false, mode: 'create', data: null });
      loadTranslationKeys();
      clearAllCache();
    } catch (err) {
      setError('번역 키 업데이트 실패: ' + err.message);
    }
  };

  const handleDeleteTranslationKey = async (id) => {
    if (!window.confirm('정말로 이 번역 키를 삭제하시겠습니까?')) return;

    try {
      await apiCall(`/api/admin/translations/keys/${id}`, {
        method: 'DELETE'
      });
      setSuccess('번역 키가 성공적으로 삭제되었습니다');
      loadTranslationKeys();
      clearAllCache();
    } catch (err) {
      setError('번역 키 삭제 실패: ' + err.message);
    }
  };

  // 번역 CRUD 함수들
  const handleCreateOrUpdateTranslation = async (formData) => {
    try {
      await apiCall('/api/admin/translations', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setSuccess('번역이 성공적으로 저장되었습니다');
      setTranslationDialog({ open: false, mode: 'create', data: null });
      loadTranslations();
      clearAllCache();
    } catch (err) {
      setError('번역 저장 실패: ' + err.message);
    }
  };

  const handleDeleteTranslation = async (id) => {
    if (!window.confirm('정말로 이 번역을 삭제하시겠습니까?')) return;

    try {
      await apiCall(`/api/admin/translations/${id}`, {
        method: 'DELETE'
      });
      setSuccess('번역이 성공적으로 삭제되었습니다');
      loadTranslations();
      clearAllCache();
    } catch (err) {
      setError('번역 삭제 실패: ' + err.message);
    }
  };

  // 캐시 초기화
  const handleClearCache = async () => {
    try {
      await apiCall('/api/i18n/cache/clear', { method: 'POST' });
      clearAllCache();
      setSuccess('캐시가 성공적으로 초기화되었습니다');
    } catch (err) {
      setError('캐시 초기화 실패: ' + err.message);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          다국어 관리
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleClearCache}
          disabled={loading}
        >
          캐시 초기화
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<LanguageIcon />} label="언어 관리" />
          <Tab icon={<KeyIcon />} label="번역 키 관리" />
          <Tab icon={<TranslateIcon />} label="번역 관리" />
          <Tab icon={<LanguageIcon />} label="통계" />
        </Tabs>

        {loading && <LinearProgress />}

        <Box sx={{ p: 3 }}>
          {/* 언어 관리 탭 */}
          {tabValue === 0 && <LanguageManagementTab
            languages={languages}
            onAdd={() => setLanguageDialog({ open: true, mode: 'create', data: null })}
            onEdit={(language) => setLanguageDialog({ open: true, mode: 'edit', data: language })}
            onDelete={handleDeleteLanguage}
            loading={loading}
          />}

          {/* 번역 키 관리 탭 */}
          {tabValue === 1 && <TranslationKeyManagementTab
            translationKeys={translationKeys}
            filters={keyFilters}
            onFiltersChange={setKeyFilters}
            onAdd={() => setKeyDialog({ open: true, mode: 'create', data: null })}
            onEdit={(key) => setKeyDialog({ open: true, mode: 'edit', data: key })}
            onDelete={handleDeleteTranslationKey}
            loading={loading}
          />}

          {/* 번역 관리 탭 */}
          {tabValue === 2 && <TranslationManagementTab
            translations={translations}
            languages={languages}
            filters={translationFilters}
            onFiltersChange={setTranslationFilters}
            onAdd={() => setTranslationDialog({ open: true, mode: 'create', data: null })}
            onEdit={(translation) => setTranslationDialog({ open: true, mode: 'edit', data: translation })}
            onDelete={handleDeleteTranslation}
            loading={loading}
          />}

          {/* 통계 탭 */}
          {tabValue === 3 && <StatisticsTab stats={stats} loading={loading} />}
        </Box>
      </Paper>

      {/* 다이얼로그들 */}
      <LanguageDialog
        open={languageDialog.open}
        mode={languageDialog.mode}
        data={languageDialog.data}
        onClose={() => setLanguageDialog({ open: false, mode: 'create', data: null })}
        onSave={languageDialog.mode === 'create' ? handleCreateLanguage : (formData) => handleUpdateLanguage(languageDialog.data.id, formData)}
      />

      <TranslationKeyDialog
        open={keyDialog.open}
        mode={keyDialog.mode}
        data={keyDialog.data}
        onClose={() => setKeyDialog({ open: false, mode: 'create', data: null })}
        onSave={keyDialog.mode === 'create' ? handleCreateTranslationKey : (formData) => handleUpdateTranslationKey(keyDialog.data.id, formData)}
      />

      <TranslationDialog
        open={translationDialog.open}
        mode={translationDialog.mode}
        data={translationDialog.data}
        languages={languages}
        translationKeys={translationKeys}
        onClose={() => setTranslationDialog({ open: false, mode: 'create', data: null })}
        onSave={handleCreateOrUpdateTranslation}
      />

      {/* 알림 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TranslationManagement;