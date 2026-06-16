import React from "react";
import PropTypes from "prop-types";
import { Box, Button, IconButton, CircularProgress } from "@mui/material";
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CreateNewFolder as CreateNewFolderIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Upload as UploadIcon,
  GetApp as GetAppIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

/**
 * 스프레드시트 액션 툴바. 일반 뷰와 전체화면 다이얼로그가 공유한다.
 * (이전에는 두 곳에 동일한 버튼 묶음이 중복돼 있었음)
 *
 * 두 사용처의 차이는 props 로 흡수:
 *  - showImportExport: Import/Export 버튼 노출 여부 (일반 뷰만)
 *  - showFullscreenToggle: 전체화면 토글 노출 여부 (일반 뷰만)
 */
const SpreadsheetToolbar = ({
  t,
  sx,
  isLoading,
  selectedRowIndex,
  selectedRange,
  hasChanges,
  canSave,
  isFullscreen,
  showImportExport = false,
  showFullscreenToggle = false,
  onRefresh,
  onAddRows,
  onAddFolder,
  onDeleteRows,
  onValidate,
  onImportExport,
  onExportMenu,
  onStepMenu,
  onToggleFullscreen,
  onSave,
}) => {
  const rowSelected =
    selectedRowIndex !== null && selectedRowIndex !== undefined;
  const selectRowFirst = t(
    "testcase.spreadsheet.selectRowFirstTooltip",
    "행을 먼저 선택하세요",
  );
  const deleteCount = selectedRange
    ? Math.abs(selectedRange.end.row - selectedRange.start.row) + 1
    : 0;

  return (
    <Box sx={sx}>
      <Button
        size="small"
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        disabled={isLoading}
      >
        {t("testcase.spreadsheet.button.refresh", "새로고침")}
      </Button>
      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={() => onAddRows("append")}
        disabled={isLoading}
      >
        {t("testcase.spreadsheet.button.addRows", "행 추가")}
      </Button>

      <Button
        size="small"
        startIcon={<ArrowUpwardIcon />}
        onClick={() => onAddRows("above")}
        disabled={isLoading || !rowSelected}
        color="primary"
        variant="outlined"
        title={
          rowSelected
            ? t(
                "testcase.spreadsheet.insertAboveTooltip",
                "{row}번 행 위에 추가",
                {
                  row: selectedRowIndex + 1,
                },
              )
            : selectRowFirst
        }
      >
        {t("testcase.spreadsheet.button.insertAbove", "위에 추가")}
      </Button>
      <Button
        size="small"
        startIcon={<ArrowDownwardIcon />}
        onClick={() => onAddRows("below")}
        disabled={isLoading || !rowSelected}
        color="primary"
        variant="outlined"
        title={
          rowSelected
            ? t(
                "testcase.spreadsheet.insertBelowTooltip",
                "{row}번 행 아래에 추가",
                { row: selectedRowIndex + 1 },
              )
            : selectRowFirst
        }
      >
        {t("testcase.spreadsheet.button.insertBelow", "아래에 추가")}
      </Button>

      <Button
        size="small"
        startIcon={<CreateNewFolderIcon />}
        onClick={onAddFolder}
        disabled={isLoading}
        color="secondary"
      >
        {t("testcase.spreadsheet.button.addFolder", "폴더 추가")}
      </Button>

      <Button
        size="small"
        startIcon={<DeleteIcon />}
        onClick={onDeleteRows}
        disabled={isLoading || !rowSelected}
        color="error"
        variant="outlined"
        title={
          selectedRange
            ? t("testcase.spreadsheet.deleteRowsTooltip", "{count}개 행 삭제", {
                count: deleteCount,
              })
            : selectRowFirst
        }
      >
        {t("testcase.spreadsheet.button.delete", "삭제")}
      </Button>

      <Button
        size="small"
        startIcon={<WarningIcon />}
        onClick={onValidate}
        disabled={isLoading}
        color="warning"
        variant="outlined"
      >
        {t("testcase.spreadsheet.button.validate", "검증")}
      </Button>

      {showImportExport && (
        <Button
          size="small"
          startIcon={<UploadIcon />}
          onClick={onImportExport}
          disabled={isLoading}
          color="secondary"
          variant="outlined"
        >
          Import/Export
        </Button>
      )}

      <Button
        size="small"
        startIcon={<GetAppIcon />}
        onClick={onExportMenu}
        disabled={isLoading}
        color="info"
        variant="outlined"
      >
        {t("testcase.spreadsheet.button.export", "Export")}
      </Button>

      <IconButton
        size="small"
        onClick={onStepMenu}
        disabled={isLoading}
        aria-label={t(
          "testcase.spreadsheet.button.stepManagement",
          "스텝 관리",
        )}
      >
        <SettingsIcon />
      </IconButton>

      {showFullscreenToggle && (
        <IconButton
          size="small"
          onClick={onToggleFullscreen}
          aria-label={
            isFullscreen
              ? t("testcase.spreadsheet.button.exitFullscreen", "전체화면 종료")
              : t("testcase.spreadsheet.button.fullscreen", "전체화면")
          }
          color="primary"
        >
          {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      )}

      <Button
        variant="contained"
        size="small"
        startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
        onClick={onSave}
        disabled={!hasChanges || isLoading || !canSave}
        color="primary"
      >
        {isLoading
          ? t("testcase.spreadsheet.button.saving", "저장 중...")
          : t("testcase.spreadsheet.button.save", "일괄 저장")}
      </Button>
    </Box>
  );
};

SpreadsheetToolbar.propTypes = {
  t: PropTypes.func.isRequired,
  sx: PropTypes.object,
  isLoading: PropTypes.bool,
  selectedRowIndex: PropTypes.number,
  selectedRange: PropTypes.object,
  hasChanges: PropTypes.bool,
  canSave: PropTypes.bool,
  isFullscreen: PropTypes.bool,
  showImportExport: PropTypes.bool,
  showFullscreenToggle: PropTypes.bool,
  onRefresh: PropTypes.func,
  onAddRows: PropTypes.func,
  onAddFolder: PropTypes.func,
  onDeleteRows: PropTypes.func,
  onValidate: PropTypes.func,
  onImportExport: PropTypes.func,
  onExportMenu: PropTypes.func,
  onStepMenu: PropTypes.func,
  onToggleFullscreen: PropTypes.func,
  onSave: PropTypes.func,
};

export default SpreadsheetToolbar;
