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
import { EnhancedTranslationKeyTab } from './EnhancedTranslationKeyTab.jsx';
import { EnhancedStatisticsTab } from './EnhancedStatisticsTab.jsx';
import {
  LanguageDialog,
  TranslationKeyDialog,
  TranslationDialog
} from './TranslationDialogs.jsx';

const TranslationManagement = () => {
  const { t } = useI18n();
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
  const [keyPagination, setKeyPagination] = useState({ page: 0, size: 20, totalElements: 0, totalPages: 0 });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [keyLanguages, setKeyLanguages] = useState([]);

  // 번역 관리 상태
  const [translations, setTranslations] = useState([]);
  const [translationDialog, setTranslationDialog] = useState({ open: false, mode: 'create', data: null });
  const [translationFilters, setTranslationFilters] = useState({ languageCode: '', keyName: '', isActive: '' });
  const [translationPagination, setTranslationPagination] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });

  // 통계 상태
  const [stats, setStats] = useState([]);

  // CSV 관련 상태
  const [csvImportDialog, setCsvImportDialog] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);

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

  const loadTranslationKeys = async (page = keyPagination.page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (keyFilters.keyword) params.append('keyword', keyFilters.keyword);
      if (keyFilters.category) params.append('category', keyFilters.category);
      if (keyFilters.isActive !== '') params.append('isActive', keyFilters.isActive);
      params.append('page', page);
      params.append('size', keyPagination.size);

      const data = await apiCall(`/api/admin/translations/keys?${params.toString()}`);
      setTranslationKeys(data.content);
      setKeyLanguages(data.languages || []);
      setKeyPagination(prev => ({
        ...prev,
        page: data.currentPage,
        totalElements: data.totalElements,
        totalPages: data.totalPages
      }));
    } catch (err) {
      setError('번역 키 목록을 로드할 수 없습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableCategories = async () => {
    try {
      const data = await apiCall('/api/admin/translations/keys/categories');
      setAvailableCategories(data);
    } catch (err) {
      console.warn('카테고리 목록 로드 실패:', err.message);
    }
  };

  const loadTranslations = async (page = translationPagination.page) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        size: translationPagination.size.toString()
      });

      if (translationFilters.languageCode) {
        params.append('languageCode', translationFilters.languageCode);
      }
      if (translationFilters.keyName) {
        params.append('keyName', translationFilters.keyName);
      }
      if (translationFilters.isActive !== '') {
        params.append('isActive', translationFilters.isActive);
      }

      const endpoint = `/api/admin/translations/paginated?${params}`;
      const data = await apiCall(endpoint);

      setTranslations(data.content);
      setTranslationPagination({
        page: data.currentPage,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages
      });
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
    else if (tabValue === 1) {
      loadTranslationKeys();
      loadAvailableCategories();
    }
    else if (tabValue === 2) loadTranslations();
    else if (tabValue === 3) loadStats();
  }, [tabValue]);

  // 필터 변경 시 재로드 (페이지 초기화)
  useEffect(() => {
    if (tabValue === 1) {
      setKeyPagination(prev => ({ ...prev, page: 0 }));
      loadTranslationKeys(0);
    }
  }, [keyFilters]);

  useEffect(() => {
    if (tabValue === 2) {
      setTranslationPagination(prev => ({ ...prev, page: 0 }));
      loadTranslations(0);
    }
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

  // CSV 내보내기
  const handleExportCsv = async (languageCode = null) => {
    try {
      const baseUrl = await getApiBaseUrl();
      const url = languageCode
        ? `${baseUrl}/api/admin/translations/export/csv?languageCode=${languageCode}`
        : `${baseUrl}/api/admin/translations/export/csv`;

      const token = localStorage.getItem('accessToken');
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const filename = languageCode ? `translations_${languageCode}.csv` : 'translations_all.csv';

      // 파일 다운로드
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setSuccess('CSV 파일이 성공적으로 다운로드되었습니다');
    } catch (err) {
      setError('CSV 내보내기 실패: ' + err.message);
    }
  };

  // CSV 가져오기
  const handleImportCsv = async () => {
    if (!csvFile) {
      setError('CSV 파일을 선택해주세요');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('overwrite', overwriteExisting);

      const baseUrl = await getApiBaseUrl();
      const token = localStorage.getItem('accessToken');

      const response = await fetch(`${baseUrl}/api/admin/translations/import/csv`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(result.message);
        setCsvImportDialog(false);
        setCsvFile(null);
        setOverwriteExisting(false);
        loadTranslations();
        clearAllCache();
      } else {
        let errorMessage = result.message;
        if (result.errors && result.errors.length > 0) {
          errorMessage += '\n오류 세부사항:\n' + result.errors.slice(0, 5).join('\n');
          if (result.errors.length > 5) {
            errorMessage += `\n... 그 외 ${result.errors.length - 5}개 오류`;
          }
        }
        setError(errorMessage);
      }
    } catch (err) {
      setError('CSV 가져오기 실패: ' + err.message);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('translation.management.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExportCsv()}
            disabled={loading}
          >
            {t('translation.management.exportCsv')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => setCsvImportDialog(true)}
            disabled={loading}
          >
            {t('translation.management.importCsv')}
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleClearCache}
            disabled={loading}
          >
            {t('translation.management.clearCache')}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<LanguageIcon />} label={t('translation.tabs.languageManagement')} />
          <Tab icon={<KeyIcon />} label={t('translation.tabs.keyManagement')} />
          <Tab icon={<TranslateIcon />} label={t('translation.tabs.translationManagement')} />
          <Tab icon={<LanguageIcon />} label={t('translation.tabs.statistics')} />
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
          {tabValue === 1 && <EnhancedTranslationKeyTab
            translationKeys={translationKeys}
            filters={keyFilters}
            onFiltersChange={setKeyFilters}
            pagination={keyPagination}
            onPageChange={(page) => {
              setKeyPagination(prev => ({ ...prev, page }));
              loadTranslationKeys(page);
            }}
            availableCategories={availableCategories}
            languages={keyLanguages}
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
            pagination={translationPagination}
            onPageChange={(page) => {
              setTranslationPagination(prev => ({ ...prev, page }));
              loadTranslations(page);
            }}
            onAdd={() => {
              // 번역 다이얼로그 열기 전에 번역키 목록을 로드
              if (translationKeys.length === 0) {
                loadTranslationKeys().then(() => {
                  setTranslationDialog({ open: true, mode: 'create', data: null });
                });
              } else {
                setTranslationDialog({ open: true, mode: 'create', data: null });
              }
            }}
            onEdit={(translation) => {
              // 번역 다이얼로그 열기 전에 번역키 목록을 로드
              if (translationKeys.length === 0) {
                loadTranslationKeys().then(() => {
                  setTranslationDialog({ open: true, mode: 'edit', data: translation });
                });
              } else {
                setTranslationDialog({ open: true, mode: 'edit', data: translation });
              }
            }}
            onDelete={handleDeleteTranslation}
            onExportCsv={handleExportCsv}
            loading={loading}
          />}

          {/* 통계 탭 */}
          {tabValue === 3 && <EnhancedStatisticsTab loading={loading} />}
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

      {/* CSV 가져오기 다이얼로그 */}
      <Dialog open={csvImportDialog} onClose={() => setCsvImportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('translation.csvImport.dialogTitle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('translation.csvImport.formatDescription')}
            </Typography>

            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              style={{ marginBottom: 16, width: '100%' }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                />
              }
              label={t('translation.csvImport.overwriteLabel')}
            />

            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
              {t('translation.csvImport.overwriteHelper')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCsvImportDialog(false)}>{t('common.buttons.cancel')}</Button>
          <Button
            onClick={handleImportCsv}
            variant="contained"
            disabled={!csvFile}
            startIcon={<UploadIcon />}
          >
            {t('common.buttons.import')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TranslationManagement;