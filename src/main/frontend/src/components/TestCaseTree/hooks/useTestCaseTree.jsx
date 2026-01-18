// src/components/TestCaseTree/hooks/useTestCaseTree.jsx

import { useState, useMemo, useEffect } from "react";
import { listToTree } from "../../../utils/treeUtils.jsx";
import { getAllChildIds } from "../utils/treeOperations.js";

/**
 * 테스트케이스 트리 상태 관리 및 핵심 로직을 담당하는 커스텀 훅
 */
export const useTestCaseTree = ({
    projectId,
    testCases,
    fetchProjectTestCases,
    selectable,
    selectedIds,
    onSelectionChange,
    selectedTestCaseId,
    setActiveTestCase,
    onSelectTestCase,
    orderEditMode,
}) => {
    const [expanded, setExpanded] = useState([]);
    const [selected, setSelected] = useState([]);
    const [contextMenu, setContextMenu] = useState(null);
    const [checkedIds, setCheckedIds] = useState([]);

    // 프로젝트 변경 시 데이터 로드
    useEffect(() => {
        if (projectId) {
            fetchProjectTestCases(projectId);
        }
        // eslint-disable-next-line
    }, [projectId]);

    // 필터링된 테스트케이스
    const filteredTestCases = useMemo(
        () => (projectId ? testCases.filter((tc) => tc.projectId === projectId) : testCases),
        [projectId, testCases]
    );

    // 트리 데이터
    const treeData = useMemo(() => listToTree(filteredTestCases, null), [filteredTestCases]);

    // 전체 테스트케이스 수 계산 (폴더 제외)
    const totalTestCaseCount = useMemo(() => {
        return filteredTestCases.filter(tc => tc.type === 'testcase').length;
    }, [filteredTestCases]);

    // 전체 폴더 수 계산
    const totalFolderCount = useMemo(() => {
        return filteredTestCases.filter(tc => tc.type === 'folder').length;
    }, [filteredTestCases]);

    // 전체 선택 상태
    const allIds = filteredTestCases.map((tc) => tc.id);
    const isAllChecked = allIds.length > 0 && allIds.every((id) => checkedIds.includes(id));
    const isIndeterminate = checkedIds.length > 0 && !isAllChecked;

    // 전체 선택 핸들러
    const handleCheckAll = (event) => {
        if (event.target.checked) {
            setCheckedIds(allIds);
            if (selectable && onSelectionChange) onSelectionChange(allIds);
        } else {
            setCheckedIds([]);
            if (selectable && onSelectionChange) onSelectionChange([]);
        }
    };

    // 트리 토글 핸들러
    const handleToggle = (event, nodeIds) => setExpanded(nodeIds);

    // 노드 선택 핸들러
    const handleSelect = (event, nodeId) => {
        setSelected(nodeId);
        const selectedTestCase = filteredTestCases.find((tc) => tc.id === nodeId);
        if (selectable) {
            if (selectedIds.includes(nodeId)) {
                onSelectionChange(selectedIds.filter((id) => id !== nodeId));
            } else {
                onSelectionChange([...selectedIds, nodeId]);
            }
        } else {
            setActiveTestCase(nodeId);
        }
        if (onSelectTestCase) onSelectTestCase(selectedTestCase);
    };

    // 컨텍스트 메뉴 핸들러
    const handleContextMenu = (event, nodeId) => {
        event.preventDefault();
        event.stopPropagation();
        setSelected(nodeId);
        setContextMenu({
            mouseX: event.clientX,
            mouseY: event.clientY,
            nodeId,
        });
    };

    const handleCloseContextMenu = () => setContextMenu(null);

    // 체크 핸들러
    const handleCheck = (event, nodeId) => {
        const isChecked = event.target.checked;
        let newCheckedIds = [...checkedIds];
        const childIds = getAllChildIds(filteredTestCases, nodeId);
        if (isChecked) {
            newCheckedIds = Array.from(new Set([...newCheckedIds, nodeId, ...childIds]));
        } else {
            newCheckedIds = newCheckedIds.filter(
                (id) => id !== nodeId && !childIds.includes(id)
            );
        }
        setCheckedIds(newCheckedIds);
        if (selectable && onSelectionChange) onSelectionChange(newCheckedIds);
    };

    const isNodeChecked = (nodeId) => checkedIds.includes(nodeId);

    // selectable 모드일 때 외부 selectedIds 동기화
    useEffect(() => {
        if (selectable && Array.isArray(selectedIds)) {
            setCheckedIds(selectedIds);
        }
    }, [selectedIds, selectable]);

    // selectedTestCaseId가 변경될 때 해당 노드 선택 및 확장
    useEffect(() => {
        if (selectedTestCaseId && filteredTestCases.length > 0) {
            setSelected(selectedTestCaseId);

            const selectedTestCase = filteredTestCases.find(tc => tc.id === selectedTestCaseId);
            if (selectedTestCase) {
                const getAncestorIds = (items, id) => {
                    const ancestors = [];
                    let current = items.find(item => item.id === id);
                    while (current && current.parentId) {
                        ancestors.push(current.parentId);
                        current = items.find(item => item.id === current.parentId);
                    }
                    return ancestors;
                };

                const ancestorIds = getAncestorIds(filteredTestCases, selectedTestCaseId);
                setExpanded(prev => {
                    const expandedSet = new Set(prev);
                    ancestorIds.forEach(id => expandedSet.add(id));
                    return Array.from(expandedSet);
                });
            }
        }
    }, [selectedTestCaseId, filteredTestCases]);

    return {
        // States
        expanded,
        setExpanded,
        selected,
        setSelected,
        contextMenu,
        setContextMenu,
        checkedIds,
        setCheckedIds,

        // Computed values
        filteredTestCases,
        treeData,
        totalTestCaseCount,
        totalFolderCount,
        isAllChecked,
        isIndeterminate,

        // Handlers
        handleCheckAll,
        handleToggle,
        handleSelect,
        handleContextMenu,
        handleCloseContextMenu,
        handleCheck,
        isNodeChecked,
    };
};
