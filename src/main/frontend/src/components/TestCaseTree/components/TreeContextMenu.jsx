// src/components/TestCaseTree/components/TreeContextMenu.jsx

import React from "react";
import { Menu, MenuItem } from "@mui/material";
import {
    Folder as FolderIcon,
    Description as DescriptionIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    History as HistoryIcon,
} from "@mui/icons-material";
import { useI18n } from "../../../context/I18nContext.jsx";
import { isFolder } from "../../../utils/treeUtils.jsx";

/**
 * 트리 노드 컨텍스트 메뉴 컴포넌트
 * @param {Object} contextMenu - { mouseX, mouseY, nodeId }
 * @param {function} onClose - 닫기 핸들러
 * @param {function} onAddFolder - 폴더 추가 핸들러
 * @param {function} onAddTestCase - 테스트케이스 추가 핸들러
 * @param {function} onRename - 이름 변경 핸들러
 * @param {function} onDelete - 삭제 핸들러
 * @param {function} onOpenVersionHistory - 버전 히스토리 열기 핸들러
 * @param {Object} selectedNode - 선택된 노드 객체
 * @param {boolean} canAdd - 추가 권한 여부
 * @param {boolean} canDelete - 삭제 권한 여부
 */
const TreeContextMenu = ({
    contextMenu,
    onClose,
    onAddFolder,
    onAddTestCase,
    onRename,
    onDelete,
    onOpenVersionHistory,
    selectedNode,
    canAdd,
    canDelete,
}) => {
    const { t } = useI18n();

    return (
        <Menu
            open={contextMenu !== null}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            {contextMenu?.nodeId == null ? (
                canAdd && (
                    <>
                        <MenuItem onClick={onAddFolder}>
                            <FolderIcon fontSize="small" sx={{ mr: 1 }} />
                            {t('testcase.tree.action.addFolder', '폴더 추가')}
                        </MenuItem>
                        <MenuItem onClick={onAddTestCase}>
                            <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                            {t('testcase.tree.action.addTestcase', '테스트케이스 추가')}
                        </MenuItem>
                    </>
                )
            ) : (
                <>
                    {isFolder(selectedNode) && canAdd && (
                        <>
                            <MenuItem onClick={onAddFolder}>
                                <FolderIcon fontSize="small" sx={{ mr: 1 }} />
                                {t('testcase.tree.action.addSubFolder', '하위 폴더 추가')}
                            </MenuItem>
                            <MenuItem onClick={onAddTestCase}>
                                <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                                {t('testcase.tree.action.addSubTestcase', '하위 테스트케이스 추가')}
                            </MenuItem>
                        </>
                    )}
                    <MenuItem divider />
                    <MenuItem onClick={onRename}>
                        <EditIcon fontSize="small" sx={{ mr: 1 }} />
                        {t('testcase.tree.action.rename', '이름 변경')}
                    </MenuItem>
                    {/* 테스트케이스에만 버전 히스토리 메뉴 표시 */}
                    {selectedNode?.type === 'testcase' && (
                        <MenuItem onClick={onOpenVersionHistory}>
                            <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
                            {t('testcase.tree.action.versionHistory', '버전 히스토리')}
                        </MenuItem>
                    )}
                    {canDelete && (
                        <MenuItem onClick={onDelete}>
                            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                            {t('testcase.tree.action.delete', '삭제')}
                        </MenuItem>
                    )}
                </>
            )}
        </Menu>
    );
};

export default TreeContextMenu;
