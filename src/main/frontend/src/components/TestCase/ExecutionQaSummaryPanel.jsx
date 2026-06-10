// QA 총평 패널 — 테스트 결과 화면에서 실행(execution) 필터 선택 시 표시.
// 실행 단위 마크다운 코멘트를 입력·저장하고, 고급 내보내기 PDF 상단에 함께 출력된다.

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box, Button, Paper, Typography, CircularProgress } from "@mui/material";
import {
  Edit as EditIcon,
  RateReview as RateReviewIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "../../context/I18nContext.jsx";
import { useDateFormatter } from "../../hooks/useDateFormatter";
import MarkdownFieldEditor from "./MarkdownFieldEditor.jsx";
import MarkdownViewer from "../common/MarkdownViewer.jsx";

const ExecutionQaSummaryPanel = ({ execution, onSave, saving = false }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { formatDate } = useDateFormatter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  // 실행이 바뀌면 편집 상태 초기화
  useEffect(() => {
    setEditing(false);
    setDraft("");
  }, [execution?.id]);

  if (!execution) return null;

  const qaSummary = execution.qaSummary || "";

  const handleEditStart = () => {
    setDraft(qaSummary);
    setEditing(true);
  };

  const handleSave = async () => {
    const ok = await onSave(draft);
    if (ok) setEditing(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: editing || qaSummary ? 1 : 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <RateReviewIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("testResult.qaSummary.title", "QA 총평")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            — {execution.name}
          </Typography>
          {qaSummary && execution.qaSummaryUpdatedAt && (
            <Typography variant="caption" color="text.secondary">
              {t("testResult.qaSummary.updatedBy", "{user} · {date} 수정", {
                user: execution.qaSummaryUpdatedBy || "-",
                date: formatDate(execution.qaSummaryUpdatedAt),
              })}
            </Typography>
          )}
        </Box>
        {!editing && (
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={handleEditStart}
            data-testid="qa-summary-edit-button"
          >
            {qaSummary
              ? t("common.edit", "수정")
              : t("testResult.qaSummary.write", "총평 작성")}
          </Button>
        )}
      </Box>

      {editing ? (
        <>
          <MarkdownFieldEditor
            label=""
            value={draft}
            placeholder={t(
              "testResult.qaSummary.placeholder",
              "이 실행에 대한 QA 총평을 마크다운으로 작성하세요.",
            )}
            height={180}
            theme={theme}
            t={t}
            onChange={(value) => setDraft(value || "")}
            testid="qa-summary-editor"
          />
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}
          >
            <Button
              size="small"
              onClick={() => setEditing(false)}
              disabled={saving}
              data-testid="qa-summary-cancel-button"
            >
              {t("common.cancel", "취소")}
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={14} /> : null}
              data-testid="qa-summary-save-button"
            >
              {t("common.save", "저장")}
            </Button>
          </Box>
        </>
      ) : qaSummary ? (
        <MarkdownViewer content={qaSummary} sx={{ fontSize: "0.875rem" }} />
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t(
            "testResult.qaSummary.empty",
            "아직 작성된 QA 총평이 없습니다. 고급 내보내기 PDF의 상세 리스트 위에 함께 출력됩니다.",
          )}
        </Typography>
      )}
    </Paper>
  );
};

ExecutionQaSummaryPanel.propTypes = {
  execution: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default ExecutionQaSummaryPanel;
