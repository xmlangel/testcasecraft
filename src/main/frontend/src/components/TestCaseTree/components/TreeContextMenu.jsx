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
import { canAdd, canDelete } from "../utils/permissionUtils.js";

/**
 * 트리 노드 컨텍스트 메뉴 컴포넌트
 * TransitionProps.onExited를 통해 pendingRename을 처리하여
 * 메뉴가 완전히 닫힌 후 이름 변경 다이얼로그를 열도록 함 (aria-hidden 경고 방지)
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
  userRole,
  pendingRename,
  setPendingRename,
  setRenameData,
}) => {
  const { t } = useI18n();

  // 메뉴 항목 클릭 시 액션 실행 후 메뉴를 닫음
  // (이름 변경 다이얼로그는 메뉴가 완전히 닫힌 뒤 onExited에서 열림)
  const handleItemClick = (action) => () => {
    if (action) action();
    onClose();
  };

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
      TransitionProps={{
        onExited: () => {
          if (pendingRename) {
            // 포커스 해제 후 다이얼로그 열기 (aria-hidden 경고 방지)
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
            setRenameData(pendingRename);
            setPendingRename(null);
          }
        },
      }}
    >
      {contextMenu?.nodeId == null ? (
        canAdd(userRole) && (
          <>
            <MenuItem onClick={handleItemClick(onAddFolder)}>
              <FolderIcon fontSize="small" sx={{ mr: 1 }} />
              {t("testcase.tree.action.addFolder", "폴더 추가")}
            </MenuItem>
            <MenuItem onClick={handleItemClick(onAddTestCase)}>
              <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
              {t("testcase.tree.action.addTestcase", "테스트케이스 추가")}
            </MenuItem>
          </>
        )
      ) : (
        <>
          {isFolder(selectedNode) && canAdd(userRole) && (
            <>
              <MenuItem onClick={handleItemClick(onAddFolder)}>
                <FolderIcon fontSize="small" sx={{ mr: 1 }} />
                {t("testcase.tree.action.addSubFolder", "하위 폴더 추가")}
              </MenuItem>
              <MenuItem onClick={handleItemClick(onAddTestCase)}>
                <DescriptionIcon fontSize="small" sx={{ mr: 1 }} />
                {t(
                  "testcase.tree.action.addSubTestcase",
                  "하위 테스트케이스 추가",
                )}
              </MenuItem>
            </>
          )}
          <MenuItem divider />
          <MenuItem onClick={handleItemClick(onRename)}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            {t("testcase.tree.action.rename", "이름 변경")}
          </MenuItem>
          {selectedNode?.type === "testcase" && (
            <MenuItem onClick={handleItemClick(onOpenVersionHistory)}>
              <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
              {t("testcase.tree.action.versionHistory", "버전 히스토리")}
            </MenuItem>
          )}
          {canDelete(userRole) && (
            <MenuItem onClick={handleItemClick(onDelete)}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              {t("testcase.tree.action.delete", "삭제")}
            </MenuItem>
          )}
        </>
      )}
    </Menu>
  );
};

export default TreeContextMenu;
