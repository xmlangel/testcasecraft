// src/components/RAG/ThreadManagerDialog.jsx
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  TextField,
  Stack,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useI18n } from '../../context/I18nContext.jsx';

function ThreadManagerDialog({
  open,
  onClose,
  threads,
  categories,
  initialThreadId = null,
  onFetchThread = undefined,
  onUpdateThread = undefined,
  onDeleteThread = undefined,
  threadMessages = {},
  onFetchThreadMessages = undefined,
}) {
  const { t } = useI18n();
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    archived: false,
    categoryIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const loadStateRef = useRef(new Map()); // threadId -> 'loading' | 'loaded'
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messageLoadStateRef = useRef(new Map()); // threadId -> 'loading' | 'loaded'

  const sortedThreads = useMemo(() => {
    if (!threads || threads.length === 0) return [];
    return [...threads].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [threads]);

  const resetForm = useCallback(() => {
    setFormState({
      title: '',
      description: '',
      archived: false,
      categoryIds: [],
    });
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedThreadId(null);
      resetForm();
      setLoading(false);
      setSaving(false);
      setDeleting(false);
      setMessages([]);
      setMessagesLoading(false);
      loadStateRef.current.clear();
      messageLoadStateRef.current.clear();
      return;
    }

    const fallbackThread = initialThreadId || (sortedThreads[0]?.id ?? null);
    setSelectedThreadId(fallbackThread);
  }, [open, initialThreadId, sortedThreads, resetForm]);

  useEffect(() => {
    if (!open || !selectedThreadId) {
      resetForm();
      setLoading(false);
      return;
    }

    const threadFromList = sortedThreads.find((item) => item.id === selectedThreadId) || null;
    const loadState = loadStateRef.current.get(selectedThreadId);

    if (threadFromList) {
      setFormState({
        title: threadFromList.title || '',
        description: threadFromList.description || '',
        archived: Boolean(threadFromList.archived),
        categoryIds: Array.isArray(threadFromList.categories)
          ? threadFromList.categories.map((category) => category.id)
          : [],
      });
    } else if (loadState !== 'loading') {
      resetForm();
    }

    if (loadState === 'loading') {
      setLoading(true);
      return;
    }

    if (loadState === 'loaded' || !onFetchThread) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadThread = async () => {
      loadStateRef.current.set(selectedThreadId, 'loading');
      setLoading(true);
      setError(null);

      try {
        const thread = await onFetchThread?.(selectedThreadId);
        if (!isMounted) return;

        const resolvedThread = thread || threadFromList;
        if (!resolvedThread) {
          setError(t('rag.chat.threadNotFound', '선택한 스레드를 찾을 수 없습니다.'));
          resetForm();
          loadStateRef.current.delete(selectedThreadId);
          return;
        }

        setFormState({
          title: resolvedThread.title || '',
          description: resolvedThread.description || '',
          archived: Boolean(resolvedThread.archived),
          categoryIds: Array.isArray(resolvedThread.categories)
            ? resolvedThread.categories.map((category) => category.id)
            : [],
        });
        loadStateRef.current.set(selectedThreadId, 'loaded');
      } catch (err) {
        // console.error('Thread load failed:', err);
        if (!isMounted) return;
        setError(err.response?.data?.message || err.message || t('rag.chat.threadLoadError', '스레드를 불러오지 못했습니다.'));
        resetForm();
        loadStateRef.current.delete(selectedThreadId);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadThread();

    return () => {
      isMounted = false;
    };
  }, [open, selectedThreadId, onFetchThread, sortedThreads, resetForm, t]);

  const handleSelectThread = (threadId) => {
    if (saving || deleting) return;
    setSelectedThreadId(threadId);
  };

  const handleChangeField = (field) => (event) => {
    const value = field === 'archived' ? event.target.checked : event.target.value;
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoriesChange = (event) => {
    const { value } = event.target;
    setFormState((prev) => ({
      ...prev,
      categoryIds: Array.isArray(value) ? value : [],
    }));
  };

  const handleSave = async () => {
    if (!selectedThreadId) return;
    setSaving(true);
    setError(null);

    try {
      await onUpdateThread?.({
        threadId: selectedThreadId,
        title: formState.title,
        description: formState.description,
        archived: formState.archived,
        categoryIds: formState.categoryIds,
      });
    } catch (err) {
      // console.error('Thread update failed:', err);
      setError(err.response?.data?.message || err.message || t('rag.chat.threadUpdateError', '스레드를 수정하지 못했습니다.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedThreadId) return;

    const confirm = window.confirm(
      t('rag.chat.threadDeleteConfirm', '이 스레드를 삭제하시겠습니까? 대화 내역이 모두 삭제됩니다.')
    );
    if (!confirm) return;

    setDeleting(true);
    setError(null);

    try {
      await onDeleteThread?.(selectedThreadId);
      loadStateRef.current.delete(selectedThreadId);
      messageLoadStateRef.current.delete(selectedThreadId);
      const remaining = sortedThreads.filter((thread) => thread.id !== selectedThreadId);
      setSelectedThreadId(remaining[0]?.id ?? null);
      if (!remaining.length) {
        resetForm();
        setMessages([]);
      }
    } catch (err) {
      // console.error('Thread delete failed:', err);
      setError(err.response?.data?.message || err.message || t('rag.chat.threadDeleteError', '스레드를 삭제하지 못했습니다.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedThreadId) return;
    loadStateRef.current.set(selectedThreadId, 'loading');
    messageLoadStateRef.current.delete(selectedThreadId);
    setLoading(true);
    setError(null);
    try {
      const thread = await onFetchThread?.(selectedThreadId);
      const resolvedThread = thread || sortedThreads.find((item) => item.id === selectedThreadId);
      if (resolvedThread) {
        setFormState({
          title: resolvedThread.title || '',
          description: resolvedThread.description || '',
          archived: Boolean(resolvedThread.archived),
          categoryIds: Array.isArray(resolvedThread.categories)
            ? resolvedThread.categories.map((category) => category.id)
            : [],
        });
        loadStateRef.current.set(selectedThreadId, 'loaded');
      }
      if (onFetchThreadMessages) {
        setMessagesLoading(true);
        try {
          const fetchedMessages = await onFetchThreadMessages(selectedThreadId);
          setMessages(Array.isArray(fetchedMessages) ? fetchedMessages : []);
          messageLoadStateRef.current.set(selectedThreadId, 'loaded');
        } catch (messageError) {
          // console.error('Thread messages refresh failed:', messageError);
          messageLoadStateRef.current.delete(selectedThreadId);
        } finally {
          setMessagesLoading(false);
        }
      }
    } catch (err) {
      // console.error('Thread refresh failed:', err);
      setError(err.response?.data?.message || err.message || t('rag.chat.threadLoadError', '스레드를 불러오지 못했습니다.'));
      loadStateRef.current.delete(selectedThreadId);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !selectedThreadId) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    const storedMessages = threadMessages?.[selectedThreadId];
    const loadState = messageLoadStateRef.current.get(selectedThreadId);

    if (Array.isArray(storedMessages)) {
      setMessages(storedMessages);
      if (storedMessages.length > 0) {
        messageLoadStateRef.current.set(selectedThreadId, 'loaded');
      }
    } else if (loadState !== 'loading') {
      setMessages([]);
    }

    if (!onFetchThreadMessages) {
      setMessagesLoading(false);
      return;
    }

    if (loadState === 'loading') {
      setMessagesLoading(true);
      return;
    }

    if (Array.isArray(storedMessages) && storedMessages.length > 0) {
      setMessagesLoading(false);
      return;
    }

    let isMounted = true;
    messageLoadStateRef.current.set(selectedThreadId, 'loading');
    setMessagesLoading(true);

    onFetchThreadMessages(selectedThreadId)
      .then((fetchedMessages) => {
        if (!isMounted) return;
        const resolvedMessages = Array.isArray(fetchedMessages) ? fetchedMessages : [];
        setMessages(resolvedMessages);
        messageLoadStateRef.current.set(selectedThreadId, 'loaded');
      })
      .catch((err) => {
        // console.error('Thread messages load failed:', err);
        if (!isMounted) return;
        messageLoadStateRef.current.delete(selectedThreadId);
      })
      .finally(() => {
        if (isMounted) {
          setMessagesLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [open, selectedThreadId, threadMessages, onFetchThreadMessages]);

  const renderMessageSnippet = useCallback((text) => {
    if (!text) return '';
    const trimmed = text.trim();
    if (trimmed.length <= 120) {
      return trimmed;
    }
    return `${trimmed.slice(0, 117)}...`;
  }, []);

  return (
    <Dialog open={open} onClose={saving || deleting ? undefined : onClose} disableRestoreFocus maxWidth="md" fullWidth>
      <DialogTitle>{t('rag.chat.manageThreads', '대화 스레드 관리')}</DialogTitle>
      <DialogContent sx={{ display: 'flex', gap: 2, mt: 1 }}>
        <Box sx={{ flex: 1, minWidth: 240 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('rag.chat.threadListLabel', '스레드 목록')}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {sortedThreads.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('rag.chat.threadEmpty', '저장된 스레드가 없습니다.')}
            </Typography>
          ) : (
            <List dense sx={{ maxHeight: 360, overflowY: 'auto' }}>
              {sortedThreads.map((thread) => (
                <ListItemButton
                  key={thread.id}
                  selected={thread.id === selectedThreadId}
                  onClick={() => handleSelectThread(thread.id)}
                  disabled={saving || deleting}
                >
                  <ListItemText
                    primary={thread.title || t('rag.chat.untitledThread', '제목 없는 스레드')}
                    secondary={thread.description || undefined}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>

        <Box sx={{ flex: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2">
                {t('rag.chat.threadDetailsLabel', '스레드 상세')}
              </Typography>
              <Button
                size="small"
                onClick={handleRefresh}
                startIcon={<RefreshIcon fontSize="small" />}
                disabled={!selectedThreadId || loading || saving || deleting}
              >
                {loading ? <CircularProgress size={16} /> : t('rag.chat.refresh', '새로 고침')}
              </Button>
            </Stack>

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            <TextField
              label={t('rag.chat.threadTitleLabel', '제목')}
              value={formState.title}
              onChange={handleChangeField('title')}
              fullWidth
              disabled={!selectedThreadId || loading || saving || deleting}
            />

            <TextField
              label={t('rag.chat.threadDescriptionLabel', '설명')}
              value={formState.description}
              onChange={handleChangeField('description')}
              fullWidth
              multiline
              minRows={3}
              disabled={!selectedThreadId || loading || saving || deleting}
            />

            <FormControlLabel
              control={(
                <Switch
                  checked={formState.archived}
                  onChange={handleChangeField('archived')}
                  disabled={!selectedThreadId || loading || saving || deleting}
                />
              )}
              label={t('rag.chat.threadArchivedLabel', '보관 처리')}
            />

            <FormControl size="small" fullWidth>
              <InputLabel id="thread-manager-category-label">
                {t('rag.chat.categorySelectLabel', '카테고리')}
              </InputLabel>
              <Select
                labelId="thread-manager-category-label"
                multiple
                value={formState.categoryIds}
                onChange={handleCategoriesChange}
                label={t('rag.chat.categorySelectLabel', '카테고리')}
                MenuProps={{ disableRestoreFocus: true }}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {selected.map((categoryId) => {
                      const category = categories.find((item) => item.id === categoryId);
                      return (
                        <Chip
                          key={categoryId}
                          label={category?.name || categoryId}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      );
                    })}
                  </Stack>
                )}
                disabled={!selectedThreadId || loading || saving || deleting}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {t('rag.chat.threadMessagesLabel', '대화 내용')}
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {messagesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            ) : messages.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t('rag.chat.threadMessagesEmpty', '대화 메시지가 없습니다.')}
              </Typography>
            ) : (
              <List dense sx={{ maxHeight: 220, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                {messages.map((message) => (
                  <ListItem key={message.id} alignItems="flex-start" sx={{ py: 0.75 }}>
                    <ListItemText
                      primary={message.role === 'assistant'
                        ? t('rag.chat.roleAssistant', '어시스턴트')
                        : t('rag.chat.roleUser', '사용자')}
                      secondary={renderMessageSnippet(message.content)}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving || deleting}>
          {t('common.close', '닫기')}
        </Button>
        <Button
          color="error"
          onClick={handleDelete}
          startIcon={<DeleteIcon />}
          disabled={!selectedThreadId || saving || deleting}
        >
          {deleting ? <CircularProgress size={18} color="inherit" /> : t('rag.chat.threadDeleteAction', '삭제')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveIcon />}
          disabled={!selectedThreadId || saving || deleting}
        >
          {saving ? <CircularProgress size={18} color="inherit" /> : t('rag.chat.threadSaveAction', '저장')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ThreadManagerDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  threads: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    archived: PropTypes.bool,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    updatedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    categories: PropTypes.array,
  })).isRequired,
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
  })).isRequired,
  initialThreadId: PropTypes.string,
  onFetchThread: PropTypes.func,
  onUpdateThread: PropTypes.func,
  onDeleteThread: PropTypes.func,
  threadMessages: PropTypes.objectOf(PropTypes.array),
  onFetchThreadMessages: PropTypes.func,
};

export default ThreadManagerDialog;
