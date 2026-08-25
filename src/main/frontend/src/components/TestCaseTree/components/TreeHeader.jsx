// src/components/TestCaseTree/components/TreeHeader.jsx
import React from "react";
import {
  Box,
  Checkbox,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  SwapVert as SwapVertIcon,
  DriveFileMove as DriveFileMoveIcon,
  AccountTree as AccountTreeIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { useI18n } from "../../../context/I18nContext.jsx";
import { isViewer, canAdd } from "../utils/permissionUtils.js";
import { CHROME_ICON_SX } from "../../common/iconSizes.js";

/**
 * 테스트케이스 트리 헤더 컴포넌트
 * - Select All 체크박스 + 폴더/케이스 수 표시
 *   (ICT-431: 검색 중이면 "걸린 수 / 전체 수" 로 표시하고 체크박스는 걸린 것만 선택)
 * - 우측 버튼 그룹: 삭제, 새로고침, 추가, 순서편집
 */
const TreeHeader = ({
  userRole,
  selectable,
  isAllChecked,
  isIndeterminate,
  totalFolderCount,
  totalTestCaseCount,
  matchedFolderCount,
  matchedTestCaseCount,
  filterActive = false,
  checkedIds,
  orderEditMode,
  orderChanged,
  folderOnlyView,
  onToggleViewMode,
  filterText,
  onFilterChange,
  onCheckAll,
  onRefresh,
  onOpenAddMenu,
  onOrderEditMode,
  onOrderSave,
  onOrderCancel,
  onBatchDelete,
  onOpenCrossProjectTransfer,
}) => {
  const { t } = useI18n();

  return (
    <Box sx={{ px: 2, pt: 1, pb: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* 좌측: Select All + 카운트 */}
        {!isViewer(userRole) && (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
            data-testid="testcase-check-all-container"
          >
            <Checkbox
              checked={isAllChecked}
              indeterminate={isIndeterminate}
              onChange={onCheckAll}
              size="small"
              title={
                filterActive
                  ? t(
                      "testcase.tree.checkAll.filtered",
                      "검색 결과 전체 선택 (검색 밖 선택은 유지)",
                    )
                  : t("testcase.tree.checkAll.all", "전체 선택")
              }
              inputProps={{ "data-testid": "testcase-check-all-input" }}
            />
            {/*
              고른 항목이 있으면 폴더·케이스 개수를 접고 「선택 N」만 남긴다.
              선택하면 오른쪽에 이동·삭제 아이콘 둘이 더 붙는데, 개수 표시를 그대로
              두면 자리가 부족해 아이콘이 다음 줄로 밀리고 머리 높이가 두 배가 된다.
              선택 중에 전체 개수를 보는 일은 드물고, 선택을 풀면 곧바로 돌아온다.
            */}
            {checkedIds.length > 0 ? (
              <Tooltip
                title={`${t("testcase.tree.selectedCount", "선택")} ${
                  checkedIds.length
                }`}
              >
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ fontWeight: 700, whiteSpace: "nowrap" }}
                  data-testid="tree-selected-count"
                >
                  {checkedIds.length}
                </Typography>
              </Tooltip>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <FolderIcon fontSize="small" color="action" />
                  <Typography variant="body2" data-testid="tree-folder-count">
                    {filterActive
                      ? `${matchedFolderCount ?? 0}/${totalFolderCount}`
                      : totalFolderCount}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <DescriptionIcon fontSize="small" color="action" />
                  <Typography variant="body2" data-testid="tree-testcase-count">
                    {filterActive
                      ? `${matchedTestCaseCount ?? 0}/${totalTestCaseCount}`
                      : totalTestCaseCount}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* 우측: 버튼 그룹 (selectable 모드에서는 숨김) */}
        {!selectable && (
          /*
           * 좁아지면 줄을 바꾼다. 전에는 줄바꿈도 최소 폭도 없어서 폭이 부족하면
           * 버튼 글자가 한 자씩 세로로 접혔고("프 로 젝 트 …") 머리 영역이 그만큼
           * 길게 늘어났다. 트리 폭을 좁히면 늘 그렇게 된다.
           */
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-end",
              alignItems: "center",
              /*
               * 아이콘 여섯 개를 좁은 트리 폭에 한 줄로 담는다.
               *
               * 실측으로 폭을 맞췄다. 아이콘이 기본(34px)일 때 6개면 180px 인데 이
               * 자리에 남는 폭은 141px 뿐이라 한 줄이 물리적으로 안 된다. 그래서
               * 여백을 2px 로 줄인다. size="small" 의 기본 여백이 5px 이라 그 값을
               * 그대로 주면 아무것도 달라지지 않는다.
               *
               * 글리프 크기는 iconSizes.js 의 공용 값을 쓴다. 화면마다 18·20·24px
               * 이 섞여 있어 같은 줄에서 크기가 어긋나 보였다.
               */
              gap: "1px",
              minWidth: 0,
              "& .MuiIconButton-root": {
                flexShrink: 0,
                padding: "2px",
                ...CHROME_ICON_SX,
              },
            }}
          >
            {/*
              선택했을 때 나오는 두 버튼은 글자 대신 아이콘으로 둔다. 글자를 달면 좁은
              트리 폭에서 자리를 못 잡는다. 압축을 허용하면 글자가 한 자씩 세로로
              접혀 머리가 길어지고, 줄바꿈을 허용하면 버튼이 한 줄에 하나씩 쌓여
              역시 길어진다(실측 y 184 → 221 → 259). 다른 머리 버튼들도 이미
              아이콘이라 모양도 이쪽이 맞다.

              개수 배지도 달지 않는다. 108건을 고르면 "99+" 가 아이콘을 덮고 옆
              버튼까지 밀어냈다. 선택 개수는 툴팁에 적고, 무엇을 하는 버튼인지도
              툴팁으로 알린다.
            */}
            {!isViewer(userRole) &&
              checkedIds.length > 0 &&
              onOpenCrossProjectTransfer && (
                <Tooltip
                  title={`${t(
                    "testcase.crossProject.button.title",
                    "선택 항목을 다른 프로젝트로 이동/복사",
                  )} (${checkedIds.length})`}
                >
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={onOpenCrossProjectTransfer}
                    data-testid="cross-project-transfer-button"
                  >
                    <DriveFileMoveIcon />
                  </IconButton>
                </Tooltip>
              )}

            {!isViewer(userRole) && checkedIds.length > 0 && (
              <Tooltip
                title={`${t(
                  "testcase.tree.button.batchDelete",
                  "선택 항목 삭제",
                )} (${checkedIds.length})`}
              >
                <IconButton
                  size="small"
                  color="error"
                  onClick={onBatchDelete}
                  data-testid="batch-delete-button"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* 트리 뷰 모드 토글 (폴더 전용 ↔ 전체) */}
            {onToggleViewMode && (
              <IconButton
                size="small"
                onClick={onToggleViewMode}
                color={folderOnlyView ? "default" : "primary"}
                title={
                  folderOnlyView
                    ? t(
                        "testcase.tree.button.showFullTree",
                        "트리에 케이스도 표시",
                      )
                    : t("testcase.tree.button.folderOnly", "폴더만 표시")
                }
                data-testid="tree-view-mode-toggle"
              >
                <AccountTreeIcon />
              </IconButton>
            )}

            {/* 새로고침 버튼 */}
            <IconButton
              size="small"
              onClick={onRefresh}
              title={t("testcase.tree.button.refresh", "리프레시")}
            >
              <RefreshIcon />
            </IconButton>

            {!isViewer(userRole) && (
              <>
                {/* 추가 버튼 */}
                {canAdd(userRole) && (
                  <IconButton
                    size="small"
                    onClick={onOpenAddMenu}
                    data-testid="add-top-button"
                  >
                    <AddIcon />
                  </IconButton>
                )}

                {/* 순서 변경/저장 버튼 */}
                <IconButton
                  size="small"
                  onClick={orderEditMode ? onOrderSave : onOrderEditMode}
                  color={orderEditMode ? "primary" : "default"}
                  title={
                    orderEditMode
                      ? t("testcase.tree.button.saveOrder", "순서 저장")
                      : t("testcase.tree.button.editOrder", "순서 편집")
                  }
                  disabled={orderEditMode && !orderChanged}
                >
                  {orderEditMode ? <SaveIcon /> : <SwapVertIcon />}
                </IconButton>

                {/* 순서 편집 모드 취소 버튼 */}
                {orderEditMode && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={onOrderCancel}
                    title={t("testcase.tree.button.cancel", "취소")}
                  >
                    <CloseIcon />
                  </IconButton>
                )}
              </>
            )}
          </Box>
        )}
      </Box>

      {/* ICT-428: 트리 필터 (이름·표시 ID·태그 부분 일치, 콤마로 여러 개) */}
      {onFilterChange && (
        <TextField
          fullWidth
          size="small"
          value={filterText || ""}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder={t(
            "testcase.tree.filter.placeholderAll",
            "이름·ID·태그 검색",
          )}
          sx={{ mt: 1 }}
          inputProps={{ "data-testid": "tree-filter-input" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: filterText ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onFilterChange("")}
                  title={t("testcase.tree.filter.clear", "필터 지우기")}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      )}
    </Box>
  );
};

export default TreeHeader;
