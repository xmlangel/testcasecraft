// src/components/RAG/ChatControls.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Stack,
    Typography,
    IconButton,
    Tooltip,
    Button,
    Chip,
    Checkbox,
    ListItemText,
} from '@mui/material';
import {
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext.jsx';

/**
 * 제어 패널
 * - 대화 저장 토글
 * - RAG 검색 토글
 * - 스레드 선택 드롭다운
 * - 카테고리 선택
 * - 스레드 관리 버튼
 */
function ChatControls({
    persistConversation,
    onPersistToggle,
    useRagSearch,
    onRagSearchToggle,
    threads,
    selectedThreadId,
    onThreadChange,
    threadLoading,
    categories,
    selectedCategoryIds,
    onCategoryChange,
    onRefreshThreads,
    onDeleteThread,
    onOpenThreadDialog,
    onOpenThreadManager,
    projectId,
    isDeletingThread,
}) {
    const { t } = useI18n();

    return (
        <Box sx={{ p: 2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', md: 'center' }}
            >
                <FormControlLabel
                    control={(
                        <Switch
                            checked={persistConversation}
                            onChange={onPersistToggle}
                            color="primary"
                        />
                    )}
                    label={<Typography variant="body1">{t('rag.chat.persistToggle', '대화 자동 저장')}</Typography>}
                />
                <FormControlLabel
                    control={(
                        <Switch
                            checked={useRagSearch}
                            onChange={onRagSearchToggle}
                            color="primary"
                        />
                    )}
                    label={<Typography variant="body1">{t('rag.chat.useRagSearch', 'RAG 문서 우선 검색')}</Typography>}
                />
                {persistConversation && (
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1.5}
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        sx={{ width: '100%' }}
                    >
                        <FormControl size="small" sx={{ minWidth: 220 }}>
                            <InputLabel id="rag-thread-select-label">
                                {t('rag.chat.threadSelectLabel', '저장된 스레드')}
                            </InputLabel>
                            <Select
                                labelId="rag-thread-select-label"
                                value={threads.some(t => t.id === selectedThreadId) ? selectedThreadId : ''}
                                label={t('rag.chat.threadSelectLabel', '저장된 스레드')}
                                onChange={onThreadChange}
                                disabled={threadLoading}
                                MenuProps={{ disableRestoreFocus: true }}
                            >
                                <MenuItem value="">
                                    {t('rag.chat.threadAutoOption', '새 스레드 자동 생성')}
                                </MenuItem>
                                {threads.map((thread) => (
                                    <MenuItem key={thread.id} value={thread.id}>
                                        {thread.title || t('rag.chat.untitledThread', '제목 없는 스레드')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Tooltip title={t('rag.chat.refreshThreads', '스레드 새로 고침')}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={() => projectId && onRefreshThreads(projectId)}
                                    disabled={threadLoading}
                                >
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                        {selectedThreadId && (
                            <Tooltip title={t('rag.chat.deleteThread', '스레드 삭제')}>
                                <span>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={onDeleteThread}
                                        disabled={isDeletingThread}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        )}
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={onOpenThreadDialog}
                        >
                            {t('rag.chat.createThread', '새 스레드')}
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<SettingsIcon />}
                            onClick={onOpenThreadManager}
                        >
                            {t('rag.chat.manageThreadsAction', '스레드 관리')}
                        </Button>
                    </Stack>
                )}
            </Stack>

            {persistConversation && !selectedThreadId && categories.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel id="rag-category-select-label">
                        {t('rag.chat.categorySelectLabel', '카테고리')}
                    </InputLabel>
                    <Select
                        multiple
                        labelId="rag-category-select-label"
                        value={selectedCategoryIds}
                        onChange={onCategoryChange}
                        label={t('rag.chat.categorySelectLabel', '카테고리')}
                        MenuProps={{ disableRestoreFocus: true }}
                        renderValue={(selected) => (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                {selected.map((id) => {
                                    const category = categories.find((item) => item.id === id);
                                    return (
                                        <Chip
                                            key={id}
                                            size="small"
                                            label={category?.name || id}
                                            sx={{ mr: 0.5, mb: 0.5 }}
                                        />
                                    );
                                })}
                            </Stack>
                        )}
                    >
                        {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                                <Checkbox size="small" checked={selectedCategoryIds.indexOf(category.id) > -1} />
                                <ListItemText primary={category.name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {persistConversation && selectedThreadId && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {threads
                        .find((thread) => thread.id === selectedThreadId)?.categories
                        ?.map((category) => (
                            <Chip key={category.id} size="small" label={category.name} sx={{ mb: 0.5 }} />
                        ))}
                </Stack>
            )}
        </Box>
    );
}

ChatControls.propTypes = {
    persistConversation: PropTypes.bool.isRequired,
    onPersistToggle: PropTypes.func.isRequired,
    useRagSearch: PropTypes.bool.isRequired,
    onRagSearchToggle: PropTypes.func.isRequired,
    threads: PropTypes.array.isRequired,
    selectedThreadId: PropTypes.string,
    onThreadChange: PropTypes.func.isRequired,
    threadLoading: PropTypes.bool.isRequired,
    categories: PropTypes.array.isRequired,
    selectedCategoryIds: PropTypes.array.isRequired,
    onCategoryChange: PropTypes.func.isRequired,
    onRefreshThreads: PropTypes.func.isRequired,
    onDeleteThread: PropTypes.func.isRequired,
    onOpenThreadDialog: PropTypes.func.isRequired,
    onOpenThreadManager: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    isDeletingThread: PropTypes.bool.isRequired,
};

export default ChatControls;
