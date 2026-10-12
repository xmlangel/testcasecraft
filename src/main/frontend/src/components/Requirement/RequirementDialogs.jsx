// src/components/Requirement/RequirementDialogs.jsx
//
// 요구사항 문서·요구사항 입력 대화상자. 저장은 부모가 하고 여기서는 값만 모은다.

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { useI18n } from "../../context/I18nContext.jsx";
import MarkdownFieldEditor from "../TestCase/MarkdownFieldEditor.jsx";
import {
  REQUIREMENT_STATUSES,
  REQUIREMENT_TYPES,
  flattenSpecTree,
} from "./requirementConstants.js";

const EMPTY_SPEC = { docId: "", title: "", scope: "", parentId: "" };
const EMPTY_REQUIREMENT = {
  docId: "",
  title: "",
  scope: "",
  specId: "",
  status: "VALID",
  type: "FEATURE",
  expectedCoverage: 1,
};

export function RequirementSpecDialog({
  open,
  initial,
  specs,
  onClose,
  onSubmit,
}) {
  const { t } = useI18n();
  const theme = useTheme();
  const [form, setForm] = useState(EMPTY_SPEC);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_SPEC, ...initial, parentId: initial?.parentId || "" });
      setError(null);
    }
  }, [open, initial]);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  const setScope = (value) => setForm((prev) => ({ ...prev, scope: value }));

  // 자기 자신은 부모 후보에서 뺀다. 하위 문서로 옮기는 경우는 서버가 막는다.
  const parentOptions = flattenSpecTree(specs).filter(
    ({ spec }) => spec.id !== initial?.id,
  );

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ ...form, parentId: form.parentId || null });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initial?.id
          ? t("requirement.spec.edit", "요구사항 문서 수정")
          : t("requirement.spec.add", "요구사항 문서 추가")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label={t("requirement.field.specDocId", "문서 ID")}
            value={form.docId}
            onChange={set("docId")}
            helperText={t(
              "requirement.field.docIdAutoHint",
              "비워 두면 다음 번호가 자동으로 붙습니다.",
            )}
            inputProps={{ maxLength: 64, "data-testid": "spec-doc-id" }}
          />
          <TextField
            label={t("requirement.field.title", "제목")}
            value={form.title}
            onChange={set("title")}
            required
            inputProps={{ maxLength: 200, "data-testid": "spec-title" }}
          />
          <TextField
            select
            label={t("requirement.field.parentSpec", "상위 문서")}
            value={form.parentId}
            onChange={set("parentId")}
          >
            <MenuItem value="">
              {t("requirement.field.noParent", "(최상위)")}
            </MenuItem>
            {parentOptions.map(({ spec, depth }) => (
              <MenuItem
                key={spec.id}
                value={spec.id}
                sx={{ pl: 2 + depth * 2 }}
              >
                {spec.docId} · {spec.title}
              </MenuItem>
            ))}
          </TextField>
          <MarkdownFieldEditor
            label={t("requirement.field.scope", "범위·설명")}
            value={form.scope || ""}
            theme={theme}
            t={t}
            onChange={setScope}
            testid="requirement-scope-input"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel", "취소")}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || !form.title.trim()}
          data-testid="spec-save"
        >
          {t("common.save", "저장")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RequirementSpecDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  initial: PropTypes.object,
  specs: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export function RequirementDialog({
  open,
  initial,
  specs,
  onClose,
  onSubmit,
  suggestDocId,
}) {
  const { t } = useI18n();
  const theme = useTheme();
  const [form, setForm] = useState(EMPTY_REQUIREMENT);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  // 마지막으로 채워 준 자동 번호. 사용자가 고치지 않았을 때만 문서를 바꾸면 새 번호로 갈아 끼운다.
  const suggestedRef = useRef("");

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_REQUIREMENT, ...initial });
      setError(null);
      suggestedRef.current = "";
    }
  }, [open, initial]);

  const isNew = !initial?.id;
  useEffect(() => {
    if (!open || !isNew || !form.specId || !suggestDocId) return undefined;
    let cancelled = false;
    suggestDocId(form.specId)
      .then((docId) => {
        if (cancelled) return;
        const previous = suggestedRef.current;
        suggestedRef.current = docId;
        setForm((prev) =>
          prev.docId === "" || prev.docId === previous
            ? { ...prev, docId }
            : prev,
        );
      })
      .catch(() => {
        // 번호를 못 받아 오면 비워 두고 서버가 저장할 때 붙인다.
      });
    return () => {
      cancelled = true;
    };
  }, [open, isNew, form.specId, suggestDocId]);

  const set = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  const setScope = (value) => setForm((prev) => ({ ...prev, scope: value }));

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        expectedCoverage: Number(form.expectedCoverage) || 0,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {initial?.id
          ? t("requirement.edit", "요구사항 수정")
          : t("requirement.add", "요구사항 추가")}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction="row" spacing={2}>
            <TextField
              label={t("requirement.field.docId", "요구사항 ID")}
              value={form.docId}
              onChange={set("docId")}
              helperText={t(
                "requirement.field.docIdAutoHint",
                "비워 두면 다음 번호가 자동으로 붙습니다.",
              )}
              sx={{ width: 200 }}
              inputProps={{
                maxLength: 64,
                "data-testid": "requirement-doc-id",
              }}
            />
            <TextField
              label={t("requirement.field.title", "제목")}
              value={form.title}
              onChange={set("title")}
              required
              fullWidth
              inputProps={{
                maxLength: 200,
                "data-testid": "requirement-title",
              }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              label={t("requirement.field.spec", "요구사항 문서")}
              value={form.specId}
              onChange={set("specId")}
              required
              fullWidth
            >
              {flattenSpecTree(specs).map(({ spec, depth }) => (
                <MenuItem
                  key={spec.id}
                  value={spec.id}
                  sx={{ pl: 2 + depth * 2 }}
                >
                  {spec.docId} · {spec.title}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={t("requirement.field.status", "상태")}
              value={form.status}
              onChange={set("status")}
              sx={{ minWidth: 160 }}
            >
              {REQUIREMENT_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {t(s.i18nKey, s.label)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={t("requirement.field.type", "유형")}
              value={form.type}
              onChange={set("type")}
              sx={{ minWidth: 180 }}
            >
              {REQUIREMENT_TYPES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {t(s.i18nKey, s.label)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="number"
              label={t("requirement.field.expectedCoverage", "필요 TC 수")}
              value={form.expectedCoverage}
              onChange={set("expectedCoverage")}
              inputProps={{ min: 0 }}
              sx={{ width: 130 }}
            />
          </Stack>
          <MarkdownFieldEditor
            label={t("requirement.field.scope", "범위·설명")}
            value={form.scope || ""}
            theme={theme}
            t={t}
            onChange={setScope}
            testid="requirement-scope-input"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel", "취소")}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || !form.title.trim() || !form.specId}
          data-testid="requirement-save"
        >
          {t("common.save", "저장")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

RequirementDialog.propTypes = {
  ...RequirementSpecDialog.propTypes,
  suggestDocId: PropTypes.func,
};
