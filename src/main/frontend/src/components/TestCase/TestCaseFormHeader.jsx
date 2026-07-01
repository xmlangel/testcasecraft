// src/components/TestCase/TestCaseFormHeader.jsx

import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Add as AddIcon,
  SaveAs as SaveVersionIcon,
  Delete as DeleteIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@mui/icons-material";
import VersionIndicator from "./VersionIndicator.jsx";

/**
 * 테스트케이스 폼 헤더 컴포넌트
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
  // continueAdding, // Removed
  // onContinueAddingChange, // Removed
}) => {
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
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
        </Box>
        {/* 테스트 케이스 추가 버튼 (상단으로 이동하여 저장 버튼과 구분) */}
        {!isFolder && onAddNew && (
          <Button
            onClick={onAddNew}
            color="secondary"
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            data-testid="testcase-add-new-button"
          >
            {t("testcase.form.button.add", "새 케이스 추가")}
          </Button>
        )}
      </Box>

      {/* 단일 액션 행: 버전·RAG·저장 버튼을 한 줄로 묶어 헤더 높이 절약 */}
      {(!isViewer ||
        (!isFolder && testCaseId && testCase?.type === "testcase")) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 1,
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {/* 자동 저장 상태 인디케이터 */}
          {!isViewer && renderAutoSaveIndicator()}

          {/* 버전 인디케이터 + 히스토리 메뉴 */}
          {!isFolder && testCaseId && testCase?.type === "testcase" && (
            <VersionIndicator
              testCaseId={testCaseId}
              currentVersion={currentVersion}
              onVersionHistory={onVersionHistory}
              onCreateVersion={onCreateVersion}
              showMenu={!isViewer}
            />
          )}

          {/* RAG 등록 상태 뱃지 (외부 주입) */}
          {ragSlot}

          {!isViewer && (
            <>
              <Button
                onClick={onCancel}
                color="inherit"
                variant="outlined"
                data-testid="testcase-header-cancel-button"
              >
                {t("testcase.form.button.cancel", "취소")}
              </Button>
              <Button
                onClick={onSave}
                variant="contained"
                color="primary"
                disabled={isSaving}
                startIcon={
                  isSaving ? <CircularProgress size={20} /> : <SaveIcon />
                }
                data-testid="testcase-header-save-button"
              >
                {isSaving
                  ? t("testcase.form.button.saving", "저장 중...")
                  : testCaseId
                    ? t("testcase.form.button.update", "수정")
                    : t("testcase.form.button.save", "저장")}
              </Button>
              {testCaseId && testCase?.type === "testcase" && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={onCreateVersion}
                  startIcon={<SaveVersionIcon />}
                >
                  {t("testcase.version.button.create", "버전 생성")}
                </Button>
              )}
              {testCaseId && onDelete && testCase?.type === "testcase" && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={onDelete}
                  startIcon={<DeleteIcon />}
                  data-testid="testcase-header-delete-button"
                >
                  {t("testcase.form.button.delete", "삭제")}
                </Button>
              )}
            </>
          )}
        </Box>
      )}
    </>
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
  onAddNew: PropTypes.func,
  autoSaveStatus: PropTypes.oneOf(["idle", "saving", "saved", "error"]),
  autoSaveError: PropTypes.string,
  continueAdding: PropTypes.bool,
  onContinueAddingChange: PropTypes.func,
};

export default TestCaseFormHeader;
