// src/components/RAG/hooks/useThreadManagement.js
import { useState, useCallback } from 'react';

/**
 * 스레드 및 카테고리 관리 훅
 * - 스레드 CRUD 작업 핸들러
 * - 카테고리 선택 관리
 * - 다이얼로그 상태 관리
 * - 메시지 편집/삭제 로직
 */
export function useThreadManagement({
    projectId,
    selectedThreadId,
    selectThread,
    setPersistConversation,
    messages,
    setMessages,
    loadSessionMessages,
    listChatCategories,
    listChatThreads,
    fetchThreadMessages,
    createChatThread,
    updateChatThread,
    deleteChatThread,
    editChatMessage,
    deleteChatMessage,
    refreshPersistedConversation,
    t,
    setError,
}) {
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
    const [isThreadDialogOpen, setIsThreadDialogOpen] = useState(false);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadDescription, setNewThreadDescription] = useState('');
    const [isSavingThread, setIsSavingThread] = useState(false);
    const [isThreadManagerOpen, setIsThreadManagerOpen] = useState(false);
    const [editDialog, setEditDialog] = useState({ open: false, message: null, content: '' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeletingThread, setIsDeletingThread] = useState(false);
    const [isDeletingMessage, setIsDeletingMessage] = useState(false);
    const [isDeleteMessageConfirmOpen, setIsDeleteMessageConfirmOpen] = useState(false);

    const handlePersistToggle = useCallback((event) => {
        const nextValue = event.target.checked;
        setPersistConversation(nextValue);
        if (!nextValue) {
            selectThread(null);
            setSelectedCategoryIds([]);
            loadSessionMessages();
        } else if (projectId) {
            listChatCategories(projectId).catch(() => { });
            listChatThreads(projectId).catch(() => { });
        }
    }, [setPersistConversation, selectThread, loadSessionMessages, projectId, listChatCategories, listChatThreads]);

    const handleThreadChange = useCallback(async (event) => {
        const nextThreadId = event.target.value || null;
        selectThread(nextThreadId);
        if (nextThreadId) {
            setSelectedCategoryIds([]);
            try {
                await fetchThreadMessages(nextThreadId);
            } catch (threadError) {
                // console.error('채팅 스레드 메시지 로드 실패:', threadError);
            }
        } else {
            loadSessionMessages();
        }
    }, [selectThread, fetchThreadMessages, loadSessionMessages]);

    const handleCategoryChange = useCallback((event) => {
        const { value } = event.target;
        setSelectedCategoryIds(typeof value === 'string' ? value.split(',') : value);
    }, []);

    const handleOpenThreadDialog = useCallback(() => {
        setIsThreadDialogOpen(true);
    }, []);

    const handleCloseThreadDialog = useCallback(() => {
        if (isSavingThread) return;
        setIsThreadDialogOpen(false);
        setNewThreadTitle('');
        setNewThreadDescription('');
    }, [isSavingThread]);

    const handleCreateThread = useCallback(async () => {
        if (!projectId) return;
        const trimmedTitle = newThreadTitle.trim();
        if (!trimmedTitle) {
            setError(t('rag.chat.threadTitleRequired', '스레드 제목을 입력해주세요.'));
            return;
        }

        setIsSavingThread(true);
        try {
            const created = await createChatThread({
                projectId,
                title: trimmedTitle,
                description: newThreadDescription.trim() || undefined,
                categoryIds: selectedCategoryIds,
            });

            await listChatThreads(projectId);

            if (created?.id) {
                // 새 스레드 생성 시 이전 대화 히스토리 초기화
                setMessages([]);
                selectThread(created.id);
                setSelectedCategoryIds(created?.categories?.map((category) => category.id) || []);
                await fetchThreadMessages(created.id);
            }

            setIsThreadDialogOpen(false);
            setNewThreadTitle('');
            setNewThreadDescription('');
        } catch (createError) {
            // console.error('채팅 스레드 생성 실패:', createError);
            setError(createError.response?.data?.message || t('rag.chat.threadCreateFailed', '스레드를 생성하지 못했습니다.'));
        } finally {
            setIsSavingThread(false);
        }
    }, [projectId, newThreadTitle, newThreadDescription, selectedCategoryIds, createChatThread, listChatThreads, selectThread, fetchThreadMessages, t, setError, setMessages]);

    const handleOpenThreadManager = useCallback(() => {
        if (projectId) {
            listChatThreads(projectId).catch(() => { });
        }
        setIsThreadManagerOpen(true);
    }, [projectId, listChatThreads]);

    const handleCloseThreadManager = useCallback(() => {
        setIsThreadManagerOpen(false);
    }, []);

    const handleManageThreadUpdate = useCallback(async (payload) => {
        const result = await updateChatThread(payload);
        if (projectId) {
            listChatThreads(projectId).catch(() => { });
        }
        return result;
    }, [updateChatThread, listChatThreads, projectId]);

    const handleManageThreadDelete = useCallback(async (threadId) => {
        await deleteChatThread(threadId);
        if (projectId) {
            await listChatThreads(projectId);
        }
        if (selectedThreadId === threadId) {
            selectThread(null);
            setMessages([]);
            setSelectedCategoryIds([]);
        }
    }, [deleteChatThread, listChatThreads, projectId, selectedThreadId, selectThread, setMessages]);

    const handleOpenDeleteThreadDialog = useCallback(() => {
        if (!selectedThreadId) return;
        setIsDeleteDialogOpen(true);
    }, [selectedThreadId]);

    const handleCloseDeleteThreadDialog = useCallback(() => {
        if (isDeletingThread) return;
        setIsDeleteDialogOpen(false);
    }, [isDeletingThread]);

    const handleConfirmDeleteThread = useCallback(async () => {
        if (!selectedThreadId) return;
        setIsDeletingThread(true);
        try {
            await handleManageThreadDelete(selectedThreadId);
            setIsDeleteDialogOpen(false);
        } catch (deleteError) {
            // console.error('채팅 스레드 삭제 실패:', deleteError);
            setError(deleteError.response?.data?.message || t('rag.chat.threadDeleteFailed', '스레드를 삭제하지 못했습니다.'));
        } finally {
            setIsDeletingThread(false);
        }
    }, [selectedThreadId, handleManageThreadDelete, t, setError]);

    const handleEditRequest = useCallback((message) => {
        setIsDeletingMessage(false);
        setIsDeleteMessageConfirmOpen(false);
        setEditDialog({ open: true, message, content: message.content || '' });
    }, []);

    const handleEditClose = useCallback(() => {
        if (isDeletingMessage) return;
        setEditDialog({ open: false, message: null, content: '' });
        setIsDeleteMessageConfirmOpen(false);
    }, [isDeletingMessage]);

    const handleEditContentChange = useCallback((event) => {
        setEditDialog((prev) => ({ ...prev, content: event.target.value }));
    }, []);

    const handleEditSubmit = useCallback(async () => {
        if (!editDialog.message?.persistedId || isDeletingMessage) {
            return;
        }
        try {
            await editChatMessage({
                messageId: editDialog.message.persistedId,
                content: editDialog.content.trim(),
                metadata: editDialog.message.metadata || {},
            });
            setEditDialog({ open: false, message: null, content: '' });
            if (selectedThreadId) {
                await refreshPersistedConversation(selectedThreadId);
            }
        } catch (editError) {
            // console.error('채팅 메시지 편집 실패:', editError);
            setError(editError.response?.data?.message || t('rag.chat.editFailed', '메시지를 수정하지 못했습니다.'));
        }
    }, [editDialog, editChatMessage, selectedThreadId, refreshPersistedConversation, t, setError, isDeletingMessage]);

    const handleOpenDeleteMessageConfirm = useCallback(() => {
        if (!editDialog.message?.persistedId || isDeletingMessage) {
            return;
        }
        setIsDeleteMessageConfirmOpen(true);
    }, [editDialog, isDeletingMessage]);

    const handleCloseDeleteMessageConfirm = useCallback(() => {
        if (isDeletingMessage) return;
        setIsDeleteMessageConfirmOpen(false);
    }, [isDeletingMessage]);

    const handleDeleteMessage = useCallback(async () => {
        const targetId = editDialog.message?.persistedId;
        if (!targetId || isDeletingMessage) {
            return;
        }
        setIsDeletingMessage(true);
        try {
            await deleteChatMessage(targetId);
            setIsDeleteMessageConfirmOpen(false);
            setEditDialog({ open: false, message: null, content: '' });
            if (selectedThreadId) {
                await refreshPersistedConversation(selectedThreadId);
            }
        } catch (deleteError) {
            // console.error('채팅 메시지 삭제 실패:', deleteError);
            setError(deleteError.response?.data?.message || t('rag.chat.messageDeleteFailed', '메시지를 삭제하지 못했습니다.'));
        } finally {
            setIsDeletingMessage(false);
        }
    }, [editDialog, deleteChatMessage, selectedThreadId, refreshPersistedConversation, t, setError, isDeletingMessage]);

    return {
        selectedCategoryIds,
        setSelectedCategoryIds,
        isThreadDialogOpen,
        newThreadTitle,
        setNewThreadTitle,
        newThreadDescription,
        setNewThreadDescription,
        isSavingThread,
        isThreadManagerOpen,
        editDialog,
        setEditDialog,
        isDeleteDialogOpen,
        isDeletingThread,
        isDeletingMessage,
        isDeleteMessageConfirmOpen,
        handlePersistToggle,
        handleThreadChange,
        handleCategoryChange,
        handleOpenThreadDialog,
        handleCloseThreadDialog,
        handleCreateThread,
        handleOpenThreadManager,
        handleCloseThreadManager,
        handleManageThreadUpdate,
        handleManageThreadDelete,
        handleOpenDeleteThreadDialog,
        handleCloseDeleteThreadDialog,
        handleConfirmDeleteThread,
        handleEditRequest,
        handleEditClose,
        handleEditContentChange,
        handleEditSubmit,
        handleOpenDeleteMessageConfirm,
        handleCloseDeleteMessageConfirm,
        handleDeleteMessage,
    };
}
