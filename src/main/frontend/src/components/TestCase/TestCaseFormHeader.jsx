// src/components/TestCase/TestCaseFormHeader.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Tooltip,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Save as SaveIcon,
  Add as AddIcon,
  SaveAs as SaveVersionIcon,
  Delete as DeleteIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  SmartToy as SmartToyIcon,
  MoreVert as MoreVertIcon,
  History as HistoryIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import VersionIndicator from "./VersionIndicator.jsx";
import { ACTION_BUTTON_SIZE } from "../common/actionButtonSize.js";
import { isAutomatedCase } from "../../utils/executionType.js";

/**
 * 테스트케이스 폼 헤더 컴포넌트
 *
 * ICT-494 tl-2: 머리는 한 줄이다.
 * 왼쪽 ID·자동화 칩·편집/보기 전환·입력 모드 전환(headerExtra), 오른쪽 주 동작과 더보기(⋮).
 * 주 동작은 편집 중이면 취소·저장, 보기면 수정(편집으로 전환)뿐이다.
 * 새 케이스 추가·RAG 등록·버전 기록·버전 생성·삭제는 더보기 메뉴에 둔다.
 * 버전·RAG 상태는 그 아래 한 줄에 작게 보인다. 머리는 상세 칸 위에 붙어 있어
 * 본문을 내려도 저장 버튼이 보인다.
 * ICT-495 cl-3: 이전·n/N·다음(headerNav)은 주 동작 바로 뒤, 더보기(⋮) 앞에 둔다.
 * 보기·편집 모드 모두 같은 자리다. 하단 바에는 닫기만 남는다.
 */
const TestCaseFormHeader = ({
  testCaseId,
  testCase,
  currentVersion,
  isViewer,
  isSaving,
  isFolder,
  t,
  onSave,
  onCancel,
  onDelete,
  onVersionHistory,
  onCreateVersion,
  onAddNew,
  autoSaveStatus,
  autoSaveError,
  ragSlot,
  ragStatus = "hidden",
  isRagRegistering = false,
  onRagRegister,
  viewMode,
  onViewModeChange,
  headerExtra,
  headerNav,
  saveDisabled = false,
}) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const closeMenu = () => setMenuAnchor(null);
  const runAndClose = (fn) => () => {
    closeMenu();
    if (fn) fn(testCaseId);
  };

  const isSavedCase = Boolean(
    testCaseId && !isFolder && testCase?.type === "testcase",
  );
  // 보기 모드(역할이 아니라 사용자가 고른 보기)면 「수정」 한 개로 편집에 들어간다.
  const canSwitchToEdit = isViewer && viewMode === "view" && onViewModeChange;

  const menuItems = [];
  if (!isFolder && !isViewer && onAddNew) {
    menuItems.push(
      <MenuItem
        key="add"
        onClick={runAndClose(() => onAddNew())}
        data-testid="testcase-add-new-button"
      >
        <ListItemIcon>
          <AddIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={t("testcase.form.button.add", "새 케이스 추가")}
        />
      </MenuItem>,
    );
  }
  if (ragStatus === "notVectorized" && onRagRegister) {
    menuItems.push(
      <MenuItem
        key="rag"
        id="rag-register-button"
        disabled={isRagRegistering}
        onClick={runAndClose(() => onRagRegister())}
        data-testid="testcase-rag-register-menu"
      >
        <ListItemIcon>
          {isRagRegistering ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <CloudUploadIcon fontSize="small" />
          )}
        </ListItemIcon>
        <ListItemText
          primary={
            isRagRegistering
              ? t("testcase.rag.registering", "등록 중...")
              : t("testcase.rag.register", "RAG 등록")
          }
        />
      </MenuItem>,
    );
  }
  if (isSavedCase && !isViewer) {
    if (onVersionHistory) {
      menuItems.push(
        <MenuItem
          key="history"
          onClick={runAndClose(onVersionHistory)}
          data-testid="testcase-version-history-menu"
        >
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("testcase.version.menu.history", "버전 히스토리")}
          />
        </MenuItem>,
      );
    }
    if (onCreateVersion) {
      menuItems.push(
        <MenuItem
          key="version"
          onClick={runAndClose(onCreateVersion)}
          data-testid="testcase-create-version-menu"
        >
          <ListItemIcon>
            <SaveVersionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("testcase.version.button.create", "버전 생성")}
          />
        </MenuItem>,
      );
    }
    if (onDelete) {
      menuItems.push(<Divider key="divider-delete" />);
      menuItems.push(
        <MenuItem
          key="delete"
          onClick={runAndClose(() => onDelete())}
          data-testid="testcase-header-delete-button"
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={t("testcase.form.button.delete", "삭제")} />
        </MenuItem>,
      );
    }
  }

  const renderAutoSaveIndicator = () => {
    if (!testCaseId || isViewer) return null;
    if (autoSaveStatus === "saving") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CircularProgress size={12} color="inherit" />
          <Typography variant="caption" color="text.secondary">
            {t("testcase.autoSave.saving", "저장 중...")}
          </Typography>
        </Box>
      );
    }
    if (autoSaveStatus === "saved") {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 14 }} color="success" />
          <Typography variant="caption" color="success.main">
            {t("testcase.autoSave.saved", "저장됨")}
          </Typography>
        </Box>
      );
    }
    if (autoSaveStatus === "error") {
      return (
        <Tooltip
          title={
            autoSaveError || t("testcase.autoSave.error", "자동 저장 실패")
          }
          placement="bottom"
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              cursor: "help",
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 14 }} color="error" />
            <Typography variant="caption" color="error">
              {t("testcase.autoSave.error", "자동 저장 실패")}
            </Typography>
          </Box>
        </Tooltip>
      );
    }
    return null;
  };

  const autoSaveIndicator = renderAutoSaveIndicator();
  const showVersion = isSavedCase;
  const showMetaRow =
    showVersion || Boolean(ragSlot) || Boolean(autoSaveIndicator);

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 3,
        mx: -2,
        px: 2,
        pt: 1,
        pb: 1,
        mb: 1,
        // background.paper 는 반투명(0.7)이라 흐림을 줘도 스크롤된 본문 글자가 읽힌다.
        // 겹친 상세 칸과 같이 불투명한 background.default 를 쓴다.
        bgcolor: "background.default",
        borderBottom: 1,
        borderColor: "divider",
      }}
      data-testid="testcase-form-header"
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
        }}
        data-testid="testcase-header-row"
      >
        {/* 컨텍스트 타이틀(H6) 제거 — 폼이 열린 자체가 모드 표시,
            displayId Chip 으로 어떤 항목 편집 중인지 식별 가능. */}
        {testCase?.displayId && (
          <Chip
            label={testCase.displayId}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: "bold" }}
          />
        )}
        {/* 자동화 케이스 표시 (ICT-487): TC ID 옆. ICT-494 tl-5 부터 실행 유형(Automation·Hybrid)을 따른다 */}
        {testCase?.type === "testcase" && isAutomatedCase(testCase) && (
          <Chip
            icon={<SmartToyIcon />}
            label={t("testcase.tree.automated", "자동화")}
            size="small"
            color="secondary"
            variant="outlined"
            data-testid="testcase-header-automated-chip"
          />
        )}
        {/* 편집/보기 전환 — 편집 권한이 있는 역할에만 넘겨받는다 (ICT-486) */}
        {onViewModeChange && (
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            size="small"
            onChange={(_e, next) => {
              if (next !== null) onViewModeChange(next);
            }}
            aria-label={t("testcase.viewMode.title", "보기 모드 선택")}
            data-testid="testcase-view-mode-toggle"
          >
            <ToggleButton
              value="edit"
              aria-label={t("testcase.viewMode.edit", "편집")}
              data-testid="testcase-view-mode-edit"
              sx={{ px: 1, py: 0.25 }}
            >
              <EditIcon sx={{ fontSize: 16, mr: 0.5 }} />
              {t("testcase.viewMode.edit", "편집")}
            </ToggleButton>
            <ToggleButton
              value="view"
              aria-label={t("testcase.viewMode.view", "보기")}
              data-testid="testcase-view-mode-view"
              sx={{ px: 1, py: 0.25 }}
            >
              <VisibilityIcon sx={{ fontSize: 16, mr: 0.5 }} />
              {t("testcase.viewMode.view", "보기")}
            </ToggleButton>
          </ToggleButtonGroup>
        )}
        {/* 개별 폼·스프레드시트 전환(상위가 넘겨줌). 같은 줄에 두어 머리가 세 줄로 쌓이지 않게 한다. */}
        {headerExtra}

        <Box
          sx={{
            ml: "auto",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {!isViewer && (
            <>
              <Button
                onClick={onCancel}
                color="inherit"
                variant="outlined"
                size={ACTION_BUTTON_SIZE}
                data-testid="testcase-cancel-button"
              >
                {t("testcase.form.button.cancel", "취소")}
              </Button>
              <Button
                onClick={onSave}
                variant="contained"
                color="primary"
                size={ACTION_BUTTON_SIZE}
                disabled={saveDisabled || isSaving}
                startIcon={
                  isSaving ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                data-testid="testcase-save-button"
              >
                {isSaving
                  ? t("testcase.form.button.saving", "저장 중...")
                  : t("testcase.form.button.save", "저장")}
              </Button>
            </>
          )}
          {canSwitchToEdit && (
            <Button
              onClick={() => onViewModeChange("edit")}
              variant="contained"
              color="primary"
              size={ACTION_BUTTON_SIZE}
              startIcon={<EditIcon />}
              data-testid="testcase-header-edit-button"
            >
              {t("testcase.form.button.edit", "수정")}
            </Button>
          )}
          {headerNav}
          {menuItems.length > 0 && (
            <>
              <Tooltip title={t("testcase.form.button.more", "더보기")}>
                <IconButton
                  size="small"
                  aria-label={t("testcase.form.button.more", "더보기")}
                  aria-haspopup="menu"
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  data-testid="testcase-header-more-button"
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={closeMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{ sx: { minWidth: 200 } }}
                data-testid="testcase-header-more-menu"
              >
                {menuItems}
              </Menu>
            </>
          )}
        </Box>
      </Box>

      {/* 버전·RAG·자동 저장 상태: 작은 한 줄 */}
      {showMetaRow && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 0.75,
            flexWrap: "wrap",
          }}
          data-testid="testcase-header-meta"
        >
          {showVersion && (
            <VersionIndicator
              testCaseId={testCaseId}
              currentVersion={currentVersion}
              onVersionHistory={onVersionHistory}
              onCreateVersion={onCreateVersion}
              // 버전 메뉴는 머리의 더보기로 합쳤다(⋮ 가 두 개면 무엇이 어디 있는지 헷갈린다)
              showMenu={false}
            />
          )}
          {ragSlot}
          {!isViewer && autoSaveIndicator}
        </Box>
      )}
    </Box>
  );
};

TestCaseFormHeader.propTypes = {
  testCaseId: PropTypes.string,
  testCase: PropTypes.object,
  currentVersion: PropTypes.object,
  isViewer: PropTypes.bool,
  isSaving: PropTypes.bool,
  isFolder: PropTypes.bool,
  t: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onVersionHistory: PropTypes.func,
  onCreateVersion: PropTypes.func,
  ragSlot: PropTypes.node,
  ragStatus: PropTypes.oneOf([
    "hidden",
    "checking",
    "vectorized",
    "notVectorized",
  ]),
  isRagRegistering: PropTypes.bool,
  onRagRegister: PropTypes.func,
  headerExtra: PropTypes.node,
  headerNav: PropTypes.node,
  saveDisabled: PropTypes.bool,
  viewMode: PropTypes.oneOf(["edit", "view"]),
  onViewModeChange: PropTypes.func,
  onAddNew: PropTypes.func,
  autoSaveStatus: PropTypes.oneOf(["idle", "saving", "saved", "error"]),
  autoSaveError: PropTypes.string,
};

export default TestCaseFormHeader;
