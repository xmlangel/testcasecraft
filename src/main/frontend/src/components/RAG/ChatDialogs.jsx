// src/components/RAG/ChatDialogs.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Typography,
    Box,
    Stack,
    Chip,
    Checkbox,
    ListItemText,
} from '@mui/material';
import { useI18n } from '../../context/I18nContext.jsx';

/**
 * 모든 다이얼로그 컴포넌트
 * - 스레드 생성 다이얼로그
 * - 스레드 삭제 확인 다이얼로그
 * - 메시지 편집 다이얼로그
 * - 메시지 삭제 확인 다이얼로그
 */
function ChatDialogs({
    // Thread dialogs
    isThreadDialogOpen,
    onCloseThreadDialog,
    newThreadTitle,
    onThreadTitleChange,
    newThreadDescription,
    onThreadDescriptionChange,
    selectedCategoryIds,
    onCategoryChange,
    categories,
    onCreateThread,
    isSavingThread,

    // Delete thread dialog
    isDeleteDialogOpen,
    onCloseDeleteThreadDialog,
    onConfirmDeleteThread,
    isDeletingThread,

    // Edit message dialog
    editDialog,
    onEditClose,
    onEditContentChange,
    onEditSubmit,
    onOpenDeleteMessageConfirm,
    isDeletingMessage,

    // Delete message confirm dialog
    isDeleteMessageConfirmOpen,
    onCloseDeleteMessageConfirm,
    onDeleteMessage,
}) {
    const { t } = useI18n();

    return (
        <>
            {/* Thread Creation Dialog */}
            <Dialog
                open={isThreadDialogOpen}
                onClose={onCloseThreadDialog}
                disableRestoreFocus
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>{t('rag.chat.createThread', '새 스레드')}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label={t('rag.chat.threadTitleLabel', '제목')}
                        value={newThreadTitle}
                        onChange={onThreadTitleChange}
                        autoFocus
                        fullWidth
                    />
                    <TextField
                        label={t('rag.chat.threadDescriptionLabel', '설명 (선택)')}
                        value={newThreadDescription}
                        onChange={onThreadDescriptionChange}
                        multiline
                        minRows={3}
                        fullWidth
                    />
                    {categories.length > 0 && (
                        <FormControl size="small" fullWidth>
                            <InputLabel id="rag-thread-dialog-category-label">
                                {t('rag.chat.categorySelectLabel', '카테고리')}
                            </InputLabel>
                            <Select
                                multiple
                                labelId="rag-thread-dialog-category-label"
                                value={selectedCategoryIds}
                                onChange={onCategoryChange}
                                label={t('rag.chat.categorySelectLabel', '카테고리')}
                                MenuProps={{ disableRestoreFocus: true }}
                                renderValue={(selected) => (
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                        {selected.map((id) => {
                                            const category = categories.find((item) => item.id === id);
                                            return (
                                                <Chip key={id} size="small" label={category?.name || id} sx={{ mr: 0.5, mb: 0.5 }} />
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseThreadDialog} disabled={isSavingThread}>
                        {t('common.cancel', '취소')}
                    </Button>
                    <Button onClick={onCreateThread} variant="contained" disabled={isSavingThread}>
                        {isSavingThread ? <CircularProgress size={18} /> : t('rag.chat.threadCreateAction', '생성')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Thread Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={onCloseDeleteThreadDialog}
                disableRestoreFocus
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>{t('rag.chat.deleteThread', '스레드 삭제')}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        {t('rag.chat.deleteThreadConfirm', '현재 스레드를 삭제하시겠습니까? 대화 내용이 모두 삭제됩니다.')}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseDeleteThreadDialog} disabled={isDeletingThread}>
                        {t('common.cancel', '취소')}
                    </Button>
                    <Button
                        onClick={onConfirmDeleteThread}
                        color="error"
                        variant="contained"
                        disabled={isDeletingThread}
                    >
                        {isDeletingThread ? <CircularProgress size={18} /> : t('common.delete', '삭제')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Message Dialog */}
            <Dialog
                open={editDialog.open}
                onClose={onEditClose}
                disableRestoreFocus
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>{t('rag.chat.editResponse', '응답 편집')}</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        value={editDialog.content}
                        onChange={onEditContentChange}
                        placeholder={t('rag.chat.editPlaceholder', '수정할 답변 내용을 입력하세요.')}
                    />
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between' }}>
                    <Button
                        color="error"
                        onClick={onOpenDeleteMessageConfirm}
                        disabled={!editDialog.message?.persistedId || isDeletingMessage}
                    >
                        {t('common.delete', '삭제')}
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button onClick={onEditClose} disabled={isDeletingMessage}>
                            {t('common.cancel', '취소')}
                        </Button>
                        <Button
                            onClick={onEditSubmit}
                            variant="contained"
                            disabled={!editDialog.content.trim() || isDeletingMessage}
                        >
                            {t('common.save', '저장')}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Delete Message Confirm Dialog */}
            <Dialog
                open={isDeleteMessageConfirmOpen}
                onClose={onCloseDeleteMessageConfirm}
                disableRestoreFocus
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>{t('rag.chat.deleteMessageTitle', '응답 삭제')}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">
                        {t('rag.chat.deleteMessageConfirm', '이 응답을 삭제하시겠습니까? 삭제 후 복구할 수 없습니다.')}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseDeleteMessageConfirm} disabled={isDeletingMessage}>
                        {t('common.cancel', '취소')}
                    </Button>
                    <Button
                        onClick={onDeleteMessage}
                        color="error"
                        variant="contained"
                        disabled={isDeletingMessage}
                    >
                        {isDeletingMessage ? <CircularProgress size={18} /> : t('common.delete', '삭제')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

ChatDialogs.propTypes = {
    // Thread dialogs
    isThreadDialogOpen: PropTypes.bool.isRequired,
    onCloseThreadDialog: PropTypes.func.isRequired,
    newThreadTitle: PropTypes.string.isRequired,
    onThreadTitleChange: PropTypes.func.isRequired,
    newThreadDescription: PropTypes.string.isRequired,
    onThreadDescriptionChange: PropTypes.func.isRequired,
    selectedCategoryIds: PropTypes.array.isRequired,
    onCategoryChange: PropTypes.func.isRequired,
    categories: PropTypes.array.isRequired,
    onCreateThread: PropTypes.func.isRequired,
    isSavingThread: PropTypes.bool.isRequired,

    // Delete thread dialog
    isDeleteDialogOpen: PropTypes.bool.isRequired,
    onCloseDeleteThreadDialog: PropTypes.func.isRequired,
    onConfirmDeleteThread: PropTypes.func.isRequired,
    isDeletingThread: PropTypes.bool.isRequired,

    // Edit message dialog
    editDialog: PropTypes.object.isRequired,
    onEditClose: PropTypes.func.isRequired,
    onEditContentChange: PropTypes.func.isRequired,
    onEditSubmit: PropTypes.func.isRequired,
    onOpenDeleteMessageConfirm: PropTypes.func.isRequired,
    isDeletingMessage: PropTypes.bool.isRequired,

    // Delete message confirm dialog
    isDeleteMessageConfirmOpen: PropTypes.bool.isRequired,
    onCloseDeleteMessageConfirm: PropTypes.func.isRequired,
    onDeleteMessage: PropTypes.func.isRequired,
};

export default ChatDialogs;
