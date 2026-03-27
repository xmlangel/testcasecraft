import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Info as InfoIcon } from "@mui/icons-material";
import { useTranslation } from "../../context/I18nContext.jsx";
import TestExecutionGuide from "./TestExecutionGuide.jsx";

const TestExecutionHeader = ({
  executionId,
  executionName,
  execution,
  onCancel,
  onGoToList,
  onSaveOrUpdate,
  saving,
  canEditBasicInfo,
  isEditingBasicInfo,
  onEditClick,
  onCancelEdit,
  showExecutionGuide,
  setShowExecutionGuide,
  startImmediately,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#1976d2",
              cursor: "pointer",
              display: "inline-block",
              "&:hover": {
                textDecoration: "underline",
                opacity: 0.8,
              },
            }}
            onClick={onGoToList}
            data-testid="execution-header-title"
          >
            {executionId ? (
              <>{t("testExecution.form.editTitle", { name: executionName })}</>
            ) : (
              t("testExecution.form.registerTitle")
            )}
          </Typography>
          {execution?.displayId && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, display: "block" }}
            >
              {execution.displayId}
            </Typography>
          )}
        </Box>
        {!executionId && (
          <Button
            onClick={() => setShowExecutionGuide(!showExecutionGuide)}
            variant="outlined"
            startIcon={<InfoIcon />}
            sx={{ mr: 1 }}
            data-testid="execution-guide-button"
          >
            {showExecutionGuide
              ? t("testExecution.guide.hideGuide")
              : t("testExecution.guide.showGuide")}
          </Button>
        )}

        {/* 편집 모드가 아닐 때만 '목록' 버튼 표시 */}
        {!isEditingBasicInfo && (
          <Button
            onClick={onGoToList}
            sx={{ mr: 1 }}
            data-testid="execution-list-button"
          >
            {t("common.list")}
          </Button>
        )}

        {/* 편집 모드일 때 '취소' 버튼 (신규 생성 시 또는 편집 취소 시) */}
        {isEditingBasicInfo && (
          <Button
            onClick={onCancelEdit}
            sx={{ mr: 1 }}
            data-testid="execution-cancel-edit-button"
          >
            {t("common.cancel")}
          </Button>
        )}

        {/* 기존 데이터 조회 중이고 편집 모드가 아닐 때 '수정' 버튼 표시 */}
        {executionId && !isEditingBasicInfo && (
          <Button
            onClick={onEditClick}
            variant="contained"
            color="primary"
            sx={{ mr: 1 }}
            data-testid="execution-edit-button"
          >
            {t("common.edit", "수정")}
          </Button>
        )}

        {/* 편집 모드이거나 신규 생성일 때 '저장' 버튼 표시 */}
        {(isEditingBasicInfo || !executionId) && (
          <Button
            onClick={onSaveOrUpdate}
            variant="contained"
            color="primary"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : null}
            data-testid="execution-save-button"
          >
            {startImmediately
              ? t("testExecution.form.saveAndStart")
              : t("common.save")}
          </Button>
        )}
      </Box>
      <Divider sx={{ mb: 3 }} />

      {/* 테스트 실행 절차 안내 */}
      <TestExecutionGuide
        open={showExecutionGuide}
        onClose={() => setShowExecutionGuide(false)}
      />
    </>
  );
};

TestExecutionHeader.propTypes = {
  executionId: PropTypes.string,
  executionName: PropTypes.string,
  execution: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onGoToList: PropTypes.func.isRequired,
  onSaveOrUpdate: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  canEditBasicInfo: PropTypes.bool,
  canEditPlan: PropTypes.bool,
  startImmediately: PropTypes.bool,
  showExecutionGuide: PropTypes.bool,
  setShowExecutionGuide: PropTypes.func.isRequired,
  isEditingBasicInfo: PropTypes.bool,
  onEditClick: PropTypes.func,
  onCancelEdit: PropTypes.func,
};

export default TestExecutionHeader;
