// src/components/TestCaseTree/hooks/useTestCaseActions.jsx

import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { getAncestorIds } from "../../../utils/treeUtils.jsx";
import testCaseService from "../../../services/testCaseService.js";
import { canAdd as checkCanAdd } from "../utils/permissionUtils.js";

/**
 * 테스트케이스 CRUD 작업을 처리하는 커스텀 훅
 */
export const useTestCaseActions = ({
    projectId,
    filteredTestCases,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    fetchProjectTestCases,
    user,
    t,
    setExpanded,
    checkedIds,
    setCheckedIds,
}) => {
    const [newItemData, setNewItemData] = useState(null);
    const [renameData, setRenameData] = useState(null);
    const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
    const [itemToDeleteId, setItemToDeleteId] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [highlightedItemId, setHighlightedItemId] = useState(null);
    const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
    const [orderEditMode, setOrderEditMode] = useState(false);
    const [orderMap, setOrderMap] = useState({});
    const [orderChanged, setOrderChanged] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
    const [selectedVersionTestCaseId, setSelectedVersionTestCaseId] = useState(null);
    const [bulkDeleting, setBulkDeleting] = useState(false);
    const [bulkDeleteProgress, setBulkDeleteProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
    const [bulkDeleteResult, setBulkDeleteResult] = useState(null);

    const highlightTimeout = useRef(null);

    // 추가 핸들러
    const handleAddItem = (type, contextMenuNodeId) => {
        if (!checkCanAdd(user?.role)) return;
        const parentId = contextMenuNodeId ?? null;
        setNewItemData({
            type,
            parentId,
            name: "",
            projectId,
        });
        if (parentId) {
            const ancestorIds = getAncestorIds(filteredTestCases, parentId);
            setExpanded((prev) => {
                const set = new Set(prev);
                ancestorIds.concat(parentId).forEach((id) => set.add(id));
                return Array.from(set);
            });
        }
    };

    const handleCancelAdd = () => setNewItemData(null);

    const handleConfirmAdd = async () => {
        if (!newItemData || !newItemData.name || !newItemData.name.trim()) return;
        const id =
            newItemData.type === "folder" ? `folder-${uuidv4()}` : `test-${uuidv4()}`;
        const parentId = newItemData.parentId === undefined ? null : newItemData.parentId;
        const siblings = filteredTestCases.filter((tc) => tc.parentId === parentId);
        const displayOrder =
            siblings.length > 0
                ? Math.max(...siblings.map((tc) => tc.displayOrder ?? 0)) + 1
                : 1;
        const newItem = {
            id,
            name: newItemData.name.trim(),
            parentId,
            type: newItemData.type,
            projectId,
            displayOrder,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await addTestCase(newItem);
        await fetchProjectTestCases(projectId);
        setNewItemData(null);
        setHighlightedItemId(id);
        if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
        highlightTimeout.current = setTimeout(() => setHighlightedItemId(null), 1500);
    };

    // 이름 변경 핸들러
    const handleRename = (nodeId) => {
        const node = filteredTestCases.find((tc) => tc.id === nodeId);
        setRenameData({ id: node.id, name: node.name });
    };

    const handleCancelRename = () => setRenameData(null);

    const handleConfirmRename = async () => {
        if (!renameData.name || !renameData.name.trim()) {
            alert(t('testcase.tree.validation.nameRequired', '이름을 입력하세요.'));
            return;
        }
        const testCase = filteredTestCases.find(tc => tc.id === renameData.id);
        if (!testCase) return;
        const payload = testCase.type === 'folder'
            ? { id: testCase.id, name: renameData.name.trim(), projectId: testCase.projectId, parentId: testCase.parentId, displayOrder: testCase.displayOrder, type: 'folder' }
            : { ...testCase, name: renameData.name.trim() };
        try {
            await updateTestCase(payload);
            await fetchProjectTestCases(projectId);
            setRenameData(null);
        } catch (err) {
            alert(t('testcase.tree.error.renameFailed', '이름 변경에 실패했습니다: ') + err.message);
        }
    };

    // 삭제 핸들러
    const handleDeleteClick = (nodeId) => {
        setItemToDeleteId(nodeId);
        setDeleteConfirmationOpen(true);
    };

    const handleCancelDelete = () => {
        setDeleteConfirmationOpen(false);
        setItemToDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            await deleteTestCase(itemToDeleteId);
            await fetchProjectTestCases(projectId);
            setDeleteConfirmationOpen(false);
            setItemToDeleteId(null);
        } catch (err) {
            let msg = err?.message || t('testcase.tree.error.deleteFailed', '삭제 중 오류가 발생했습니다.');
            if (err?.response?.data?.message) {
                msg = err.response.data.message;
            }
            setErrorMessage(msg);
            setDeleteConfirmationOpen(false);
            setItemToDeleteId(null);
        } finally {
            setDeleting(false);
        }
    };

    // 일괄 삭제 핸들러
    const handleBulkDelete = async () => {
        if (checkedIds.length === 0) return;
        setBatchDeleteDialogOpen(true);
    };

    const handleConfirmBulkDelete = async () => {
        setBulkDeleting(true);
        setBulkDeleteProgress({ current: 0, total: checkedIds.length, success: 0, failed: 0 });

        try {
            const result = await testCaseService.batchDeleteTestCases(checkedIds);

            setBulkDeleteResult(result);
            setBulkDeleteProgress({
                current: checkedIds.length,
                total: checkedIds.length,
                success: result.affectedCount,
                failed: result.errors ? result.errors.length : 0
            });

            if (result.affectedCount > 0) {
                await fetchProjectTestCases(projectId);
                setCheckedIds([]);
                setBatchDeleteDialogOpen(false);
            }

        } catch (err) {
            console.error("Bulk delete failed", err);
            setErrorMessage(t('testcase.tree.error.bulkDeleteFailed', '일괄 삭제 중 오류가 발생했습니다.'));
        } finally {
            setBulkDeleting(false);
        }
    };

    const handleCloseBatchDeleteDialog = () => {
        if (bulkDeleting) return;
        setBatchDeleteDialogOpen(false);
        setBulkDeleteResult(null);
    };

    // 순서 변경 핸들러
    const moveNodeOrder = (nodeId, direction) => {
        const node = filteredTestCases.find((tc) => tc.id === nodeId);
        if (!node) return;

        const parentId = node.parentId ?? null;
        const siblings = filteredTestCases
            .filter((tc) => (tc.parentId ?? null) === parentId)
            .sort((a, b) => (orderMap[a.id] ?? 0) - (orderMap[b.id] ?? 0));

        const idx = siblings.findIndex((tc) => tc.id === nodeId);
        if (idx === -1) return;
        let targetIdx = direction === "up" ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= siblings.length) return;

        const targetNode = siblings[targetIdx];
        const newOrderMap = { ...orderMap };
        [newOrderMap[nodeId], newOrderMap[targetNode.id]] = [
            newOrderMap[targetNode.id],
            newOrderMap[nodeId],
        ];

        setOrderMap(newOrderMap);
        setOrderChanged(true);
    };

    const handleOrderEditMode = () => {
        setOrderEditMode(true);
    };

    const handleOrderCancel = () => {
        setOrderEditMode(false);
        setOrderChanged(false);
    };

    const handleOrderSave = async () => {
        const byParent = {};
        filteredTestCases.forEach((item) => {
            const p = item.parentId ?? "root";
            if (!byParent[p]) byParent[p] = [];
            byParent[p].push(item);
        });

        const updates = [];

        Object.values(byParent).forEach((siblings) => {
            siblings.sort((a, b) => (orderMap[a.id] ?? 0) - (orderMap[b.id] ?? 0));

            siblings.forEach((item, idx) => {
                const newOrder = idx + 1;
                if (item.displayOrder !== newOrder) {
                    updates.push(
                        updateTestCase({
                            ...item,
                            displayOrder: newOrder,
                        })
                    );
                }
            });
        });

        await Promise.all(updates);
        setOrderEditMode(false);
        setOrderChanged(false);
    };

    // 버전 히스토리 핸들러
    const handleOpenVersionHistory = (nodeId) => {
        const testCase = filteredTestCases.find(tc => tc.id === nodeId);
        if (testCase && testCase.type === 'testcase') {
            setSelectedVersionTestCaseId(nodeId);
            setVersionHistoryOpen(true);
        }
    };

    const handleVersionRestore = async (restoredVersion) => {
        await fetchProjectTestCases(projectId);
    };

    const handleRefresh = async () => {
        await fetchProjectTestCases(projectId);
    };

    return {
        // States
        newItemData,
        setNewItemData,
        renameData,
        setRenameData,
        deleteConfirmationOpen,
        deleting,
        highlightedItemId,
        batchDeleteDialogOpen,
        orderEditMode,
        orderMap,
        setOrderMap,
        orderChanged,
        setOrderChanged,
        errorMessage,
        setErrorMessage,
        versionHistoryOpen,
        setVersionHistoryOpen,
        selectedVersionTestCaseId,
        setSelectedVersionTestCaseId,
        bulkDeleting,
        bulkDeleteProgress,
        bulkDeleteResult,

        // Handlers
        handleAddItem,
        handleCancelAdd,
        handleConfirmAdd,
        handleRename,
        handleCancelRename,
        handleConfirmRename,
        handleDeleteClick,
        handleCancelDelete,
        handleConfirmDelete,
        handleBulkDelete,
        handleConfirmBulkDelete,
        handleCloseBatchDeleteDialog,
        moveNodeOrder,
        handleOrderEditMode,
        handleOrderCancel,
        handleOrderSave,
        handleOpenVersionHistory,
        handleVersionRestore,
        handleRefresh,
    };
};
