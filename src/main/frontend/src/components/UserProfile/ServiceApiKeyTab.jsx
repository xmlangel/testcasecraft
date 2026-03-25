// src/components/UserProfile/ServiceApiKeyTab.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  Key as KeyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext';
import { formatDateOnlySafe, safeParseDate } from '../../utils/dateUtils';

/**
 * 서비스 API 토큰 관리 탭
 * - 사용자 본인의 API 키 목록 조회
 * - 새 API 키 발급 (발급 후 한 번만 전체 키 표시)
 * - API 키 비활성화(삭제)
 */
function ServiceApiKeyTab() {
  const { t } = useI18n();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 새 키 발급 상태
  const [newKeyName, setNewKeyName] = useState('');
  const [generating, setGenerating] = useState(false);

  // 발급된 키 표시 팝업
  const [revealedKey, setRevealedKey] = useState(null); // { apiKey, name, expiresAt }
  const [copied, setCopied] = useState(false);

  // 삭제 확인 다이얼로그
  const [deleteTarget, setDeleteTarget] = useState(null); // key object
  const [deleting, setDeleting] = useState(false);

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json',
  });

  // API 키 목록 로드
  const loadKeys = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users/me/service-api-keys', {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setKeys(data);
    } catch (err) {
      setError(t('profile.apiToken.message.loadFailed', 'API 키 목록을 불러오는데 실패했습니다.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  // 새 API 키 발급
  const handleGenerate = async () => {
    if (!newKeyName.trim()) {
      setError(t('profile.apiToken.message.nameRequired', '키 이름을 입력하세요.'));
      return;
    }
    setGenerating(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(
        `/api/users/me/service-api-keys/generate?name=${encodeURIComponent(newKeyName.trim())}`,
        { method: 'POST', headers: getAuthHeader() }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || t('profile.apiToken.message.generateFailed', 'API 키 발급에 실패했습니다.'));
        return;
      }
      setRevealedKey({
        apiKey: data.apiKey,
        name: data.name,
        expiresAt: data.expiresAt,
      });
      setNewKeyName('');
      await loadKeys();
    } catch (err) {
      setError(t('profile.apiToken.message.generateError', 'API 키 발급 중 오류가 발생했습니다.'));
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // 키 복사
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 키 삭제
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/me/service-api-keys/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(t('profile.apiToken.message.deleteSuccess', 'API 키가 비활성화되었습니다.'));
        setDeleteTarget(null);
        await loadKeys();
      } else {
        setError(data.message || t('profile.apiToken.message.deleteFailed', '삭제에 실패했습니다.'));
      }
    } catch (err) {
      setError(t('profile.apiToken.message.deleteError', 'API 키 삭제 중 오류가 발생했습니다.'));
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    return formatDateOnlySafe(dateStr);
  };

  const isExpired = (dateStr) => {
    if (!dateStr) return false;
    const date = safeParseDate(dateStr);
    return date ? date < new Date() : false;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('profile.apiToken.title', '서비스 API 토큰')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('profile.apiToken.description1', '서비스 API 토큰은 외부 시스템(예: Jira Forge 앱)에서 이 서비스에 접근할 때 사용합니다.')}
        <br />
        {t('profile.apiToken.description2', '토큰은 발급 시 한 번만 표시되므로 안전한 곳에 보관하세요.')}
        <br />
        {t('profile.apiToken.description3', '사용자당 최대 10개까지 발급 가능합니다.')}
      </Typography>

      {/* 에러/성공 메시지 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* 새 키 발급 영역 */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          {t('profile.apiToken.new.title', '새 API 토큰 발급')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 1 }}>
          <TextField
            label={t('profile.apiToken.new.label', '토큰 이름')}
            placeholder={t('profile.apiToken.new.placeholder', '예: Jira Integration, CI/CD Pipeline')}
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            inputProps={{ maxLength: 100 }}
          />
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
            onClick={handleGenerate}
            disabled={generating || !newKeyName.trim()}
            size="medium"
          >
            {t('profile.apiToken.new.button', '발급')}
          </Button>
        </Box>
      </Paper>

      {/* 키 목록 */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {t('profile.apiToken.list.title', '내 API 토큰 목록')}
        </Typography>
        <Tooltip title={t('profile.apiToken.list.refresh', '목록 새로고침')}>
          <span>
            <IconButton size="small" onClick={loadKeys} disabled={loading}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : keys.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 5,
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <KeyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {t('profile.apiToken.list.empty', '발급된 API 토큰이 없습니다.')}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.selected' }}>
                <TableCell sx={{ fontWeight: 600 }}>{t('profile.apiToken.table.name', '이름')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('profile.apiToken.table.key', '키 (마스킹)')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('profile.apiToken.table.status', '상태')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('profile.apiToken.table.expiry', '만료일')}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{t('profile.apiToken.table.created', '생성일')}</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>{t('profile.apiToken.table.actions', '관리')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {keys.map((key) => (
                <TableRow
                  key={key.id}
                  sx={{ opacity: key.active ? 1 : 0.5 }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {key.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                    >
                      {key.apiKey}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {!key.active ? (
                      <Chip label={t('profile.apiToken.status.inactive', '비활성')} size="small" color="default" />
                    ) : isExpired(key.expiresAt) ? (
                      <Chip
                        icon={<WarningIcon />}
                        label={t('profile.apiToken.status.expired', '만료됨')}
                        size="small"
                        color="error"
                      />
                    ) : (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label={t('profile.apiToken.status.active', '활성')}
                        size="small"
                        color="success"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={isExpired(key.expiresAt) ? 'error' : 'text.primary'}
                    >
                      {formatDate(key.expiresAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(key.createdAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {key.active && (
                      <Tooltip title={t('profile.apiToken.tooltip.delete', '삭제(비활성화)')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(key)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 발급된 키 표시 팝업 */}
      <Dialog
        open={!!revealedKey}
        onClose={() => setRevealedKey(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyIcon color="primary" />
          {t('profile.apiToken.dialog.revealed.title', 'API 토큰 발급 완료')}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>{t('profile.apiToken.dialog.revealed.warning', '이 토큰은 지금만 확인할 수 있습니다. 창을 닫으면 토큰 전체를 다시 볼 수 없으니 안전한 곳에 저장해 주세요.')}</strong>
          </Alert>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('profile.apiToken.dialog.revealed.name', '토큰 이름: {name}', { name: revealedKey?.name })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t('profile.apiToken.dialog.revealed.expiry', '만료일: {date}', { date: formatDate(revealedKey?.expiresAt) })}
          </Typography>

          <Divider sx={{ my: 1.5 }} />

          <Typography variant="body2" gutterBottom sx={{ fontWeight: 600 }}>
            {t('profile.apiToken.dialog.revealed.tokenLabel', '발급된 토큰:')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={revealedKey?.apiKey || ''}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace', fontSize: '0.85rem', bgcolor: 'action.hover' },
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={copied ? t('profile.apiToken.dialog.revealed.copiedTooltip', '복사됨!') : t('profile.apiToken.dialog.revealed.copyTooltip', '클립보드에 복사')}>
                    <IconButton
                      onClick={() => handleCopy(revealedKey?.apiKey)}
                      edge="end"
                      color={copied ? 'success' : 'default'}
                    >
                      {copied ? <CheckCircleIcon /> : <CopyIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            startIcon={copied ? <CheckCircleIcon /> : <CopyIcon />}
            onClick={() => handleCopy(revealedKey?.apiKey)}
            sx={{ mt: 1.5 }}
            color={copied ? 'success' : 'primary'}
            fullWidth
          >
            {copied ? t('profile.apiToken.dialog.revealed.copySuccess', '복사 완료!') : t('profile.apiToken.dialog.revealed.copyButton', '토큰 전체 복사')}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => { setRevealedKey(null); setCopied(false); }}
            variant="contained"
          >
            {t('profile.apiToken.dialog.revealed.close', '확인 (닫기)')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('profile.apiToken.dialog.delete.title', 'API 토큰 삭제')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 1 }}>
            {t('profile.apiToken.dialog.delete.warning', '삭제한 토큰은 즉시 사용이 중단됩니다.')}
          </Alert>
          <Typography variant="body2">
            {t('profile.apiToken.dialog.delete.confirm', '{name} 토큰을 비활성화하시겠습니까?', { name: deleteTarget?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            {t('profile.apiToken.dialog.delete.button.cancel', '취소')}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
          >
            {t('profile.apiToken.dialog.delete.button', '삭제')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ServiceApiKeyTab;
