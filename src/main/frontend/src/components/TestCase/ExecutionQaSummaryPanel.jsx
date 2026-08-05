// QA 총평 패널 — 테스트 결과 화면에서 실행(execution) 필터 선택 시 표시.
// 실행 단위 마크다운 코멘트를 입력·저장하고, 고급 내보내기 PDF·HTML 상단에 함께 출력된다.
//
// 총평에 마크다운 제목(#~######)이 있으면 제목 단위로 구간을 나눠 그 구간만 편집한다.
// 총평이 길어졌을 때 편집기 하나로 전체를 다루지 않게 하려는 것.

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  RateReview as RateReviewIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "../../context/I18nContext.jsx";
import { useDateFormatter } from "../../hooks/useDateFormatter";
import { computeMarkdownEditorHeight } from "../../utils/markdownEditorHeight.js";
import {
  hasEditableSections,
  replaceMarkdownSection,
  splitMarkdownSections,
} from "../../utils/markdownSections.js";
import MarkdownFieldEditor from "./MarkdownFieldEditor.jsx";
import MarkdownViewer from "../common/MarkdownViewer.jsx";

// 전체 편집을 가리키는 편집 대상 값 (섹션 id 와 겹치지 않는다)
const EDIT_ALL = "__ALL__";

const ExecutionQaSummaryPanel = ({ execution, onSave, saving = false }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { formatDate } = useDateFormatter();
  // null = 보기 모드, EDIT_ALL = 전체 편집, 그 외 = 해당 섹션 편집
  const [editTarget, setEditTarget] = useState(null);
  const [draft, setDraft] = useState("");
  // 편집을 시작한 시점의 원본 (다른 사람이 그 사이 총평을 바꿨는지 대조용)
  const [baseline, setBaseline] = useState("");
  const [conflict, setConflict] = useState(false);

  const qaSummary = execution?.qaSummary || "";
  const sections = useMemo(() => splitMarkdownSections(qaSummary), [qaSummary]);
  const sectionMode = useMemo(
    () => hasEditableSections(qaSummary),
    [qaSummary],
  );

  // 실행이 바뀌면 편집 상태 초기화
  useEffect(() => {
    setEditTarget(null);
    setDraft("");
  }, [execution?.id]);

  if (!execution) return null;

  const startEdit = (target, initialValue) => {
    setDraft(initialValue);
    setBaseline(initialValue);
    setConflict(false);
    setEditTarget(target);
  };

  const handleSave = async () => {
    // 섹션 편집이면 그 구간만 교체하고 나머지 줄은 원문 그대로 넘긴다.
    // 구간 id 는 줄 번호 기반이라, 편집 중에 총평이 바뀌면 같은 id 가 다른 구간을
    // 가리킬 수 있다. 그때는 저장하지 않고 알린다 — 조용히 남의 수정을 덮어쓰거나
    // 내 수정을 버리는 것보다 낫다.
    let nextSummary = draft;
    if (editTarget !== EDIT_ALL) {
      nextSummary = replaceMarkdownSection(qaSummary, editTarget, draft, {
        expectedContent: baseline,
        sections,
      });
      if (nextSummary === null) {
        setConflict(true);
        return;
      }
    }
    const ok = await onSave(nextSummary);
    if (ok) setEditTarget(null);
  };

  const editorButtons = (testidPrefix) => (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
      <Button
        size="small"
        onClick={() => setEditTarget(null)}
        disabled={saving}
        data-testid={`${testidPrefix}-cancel-button`}
      >
        {t("common.cancel", "취소")}
      </Button>
      <Button
        size="small"
        variant="contained"
        onClick={handleSave}
        disabled={saving}
        startIcon={saving ? <CircularProgress size={14} /> : null}
        data-testid={`${testidPrefix}-save-button`}
      >
        {t("common.save", "저장")}
      </Button>
    </Box>
  );

  const renderEditor = (testidPrefix, height) => (
    <>
      {(conflict || editingSectionGone) && (
        <Alert
          severity="warning"
          sx={{ mb: 1 }}
          data-testid="qa-summary-conflict"
        >
          {t(
            "testResult.qaSummary.conflict",
            "편집하는 동안 총평이 다른 곳에서 바뀌었습니다. 작성한 내용을 복사해 두고 화면을 새로 고친 뒤 다시 저장하세요.",
          )}
        </Alert>
      )}
      <MarkdownFieldEditor
        label=""
        value={draft}
        placeholder={t(
          "testResult.qaSummary.placeholder",
          "이 실행에 대한 QA 총평을 마크다운으로 작성하세요.",
        )}
        height={height}
        theme={theme}
        t={t}
        onChange={(value) => setDraft(value || "")}
        testid={`${testidPrefix}-editor`}
      />
      {editorButtons(testidPrefix)}
    </>
  );

  // 제목 단위 구간 — 머리에 레벨 표시(#, ##, ###)와 그 구간만 여는 수정 버튼을 붙인다
  const renderSections = () => (
    <Box data-testid="qa-summary-sections">
      {sections.map((section) => {
        const editing = editTarget === section.id;
        return (
          <Box
            key={section.id}
            data-testid={`qa-summary-section-${section.id}`}
            sx={{
              borderTop: "1px dashed",
              borderColor: "divider",
              pt: 1,
              mt: 1,
              "&:first-of-type": { borderTop: "none", pt: 0, mt: 0 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Chip
                size="small"
                variant="outlined"
                label={
                  section.level > 0
                    ? "#".repeat(section.level)
                    : t("testResult.qaSummary.preamble", "머리글")
                }
                sx={{
                  fontFamily: section.level > 0 ? "monospace" : undefined,
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
              {!editing && (
                <Button
                  size="small"
                  startIcon={<EditIcon fontSize="small" />}
                  onClick={() => startEdit(section.id, section.content)}
                  data-testid={`qa-summary-edit-section-${section.id}`}
                >
                  {t("testResult.qaSummary.editSection", "이 부분 수정")}
                </Button>
              )}
            </Box>

            {editing ? (
              renderEditor(
                "qa-summary-section",
                computeMarkdownEditorHeight(draft, {
                  minLines: 6,
                  maxLines: 20,
                }),
              )
            ) : (
              <MarkdownViewer
                content={section.content}
                sx={{ fontSize: "0.875rem" }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );

  const editingAll = editTarget === EDIT_ALL;
  // 편집하던 구간이 사라졌다(다른 곳에서 총평이 바뀌었다). 편집기를 그대로 남겨
  // 작성 중이던 내용을 복사할 수 있게 하고, 저장은 충돌로 막는다.
  const editingSectionGone =
    editTarget !== null &&
    !editingAll &&
    !sections.some((section) => section.id === editTarget);

  const sectionEditorHeight = () =>
    computeMarkdownEditorHeight(draft, { minLines: 6, maxLines: 20 });

  const renderBody = () => {
    if (editingAll) return renderEditor("qa-summary", 180);

    if (editingSectionGone) {
      return (
        <>
          {renderEditor("qa-summary-section", sectionEditorHeight())}
          {sectionMode ? (
            renderSections()
          ) : qaSummary ? (
            <MarkdownViewer content={qaSummary} sx={{ fontSize: "0.875rem" }} />
          ) : null}
        </>
      );
    }

    if (sectionMode) return renderSections();

    if (qaSummary) {
      return (
        <MarkdownViewer content={qaSummary} sx={{ fontSize: "0.875rem" }} />
      );
    }

    return (
      <Typography variant="body2" color="text.secondary">
        {t(
          "testResult.qaSummary.empty",
          "아직 작성된 QA 총평이 없습니다. 고급 내보내기 PDF의 상세 리스트 위에 함께 출력됩니다.",
        )}
      </Typography>
    );
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: editTarget || qaSummary ? 1 : 0,
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
        {!editTarget && (
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => startEdit(EDIT_ALL, qaSummary)}
            data-testid="qa-summary-edit-button"
          >
            {!qaSummary
              ? t("testResult.qaSummary.write", "총평 작성")
              : sectionMode
                ? t("testResult.qaSummary.editAll", "전체 수정")
                : t("common.edit", "수정")}
          </Button>
        )}
      </Box>

      {renderBody()}
    </Paper>
  );
};

ExecutionQaSummaryPanel.propTypes = {
  execution: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  saving: PropTypes.bool,
};

export default ExecutionQaSummaryPanel;
