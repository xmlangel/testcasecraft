// src/components/TestCaseTree/components/TreeVirtualNodes.jsx
import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import {
  LibraryBooks as LibraryBooksIcon,
  FolderOff as FolderOffIcon,
} from "@mui/icons-material";
import { useI18n } from "../../../context/I18nContext.jsx";
import {
  VIRTUAL_ALL_CASES_ID,
  VIRTUAL_UNFILED_ID,
} from "../../../utils/treeUtils.jsx";

/**
 * 트리 상단 고정 가상 노드
 * - "모든 테스트케이스": 프로젝트 전체 케이스 목록
 * - "폴더에 없는 테스트케이스": 폴더 미지정 케이스 목록
 */
const VirtualNodeRow = ({
  icon,
  label,
  count,
  isSelected,
  onClick,
  testId,
}) => (
  <Box
    onClick={onClick}
    data-testid={testId}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 1,
      py: 0.5,
      borderRadius: 1,
      cursor: "pointer",
      bgcolor: isSelected ? "action.selected" : "transparent",
      "&:hover": { bgcolor: "action.hover" },
    }}
  >
    {icon}
    <Typography
      variant="body2"
      sx={{ flex: 1, fontWeight: isSelected ? 600 : 400 }}
      noWrap
    >
      {label}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {count}
    </Typography>
  </Box>
);

VirtualNodeRow.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  isSelected: PropTypes.bool,
  onClick: PropTypes.func,
  testId: PropTypes.string,
};

const TreeVirtualNodes = ({ allCount, unfiledCount, selectedId, onSelect }) => {
  const { t } = useI18n();

  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      <VirtualNodeRow
        icon={<LibraryBooksIcon fontSize="small" color="action" />}
        label={t("testcase.tree.virtual.allCases", "모든 테스트케이스")}
        count={allCount}
        isSelected={selectedId === VIRTUAL_ALL_CASES_ID}
        onClick={() => onSelect(VIRTUAL_ALL_CASES_ID)}
        testId="virtual-node-all-cases"
      />
      <VirtualNodeRow
        icon={<FolderOffIcon fontSize="small" color="action" />}
        label={t("testcase.tree.virtual.unfiled", "폴더에 없는 테스트케이스")}
        count={unfiledCount}
        isSelected={selectedId === VIRTUAL_UNFILED_ID}
        onClick={() => onSelect(VIRTUAL_UNFILED_ID)}
        testId="virtual-node-unfiled"
      />
    </Box>
  );
};

TreeVirtualNodes.propTypes = {
  allCount: PropTypes.number.isRequired,
  unfiledCount: PropTypes.number.isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

export default TreeVirtualNodes;
