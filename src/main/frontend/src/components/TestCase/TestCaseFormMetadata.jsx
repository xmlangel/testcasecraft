// src/components/TestCase/TestCaseFormMetadata.jsx

import React from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

/**
 * 테스트케이스 메타데이터 아코디언 컴포넌트 (ID, Parent 정보).
 *
 * 수정 가능 항목(Parent ID, 순서) — 풀폭·일반 크기로 강조
 * 읽기 전용 항목(Project ID, ID, Parent, 작성자, 수정자) — 2단 Grid · size="small" 로 컴팩트
 */
const TestCaseFormMetadata = ({
  testCase,
  projectId,
  infoOpen,
  setInfoOpen,
  isViewer,
  t,
  onChange,
}) => {
  // 읽기 전용 항목 공통 컴포넌트 — 모든 읽기 전용 필드를 동일 스타일로 통일.
  // mono=true 일 때 UUID 가독성을 위해 monospace + word-break 적용.
  const ReadOnlyField = ({ label, value, mono = false }) => (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        px: 1,
        py: 0.5,
        bgcolor: "action.hover",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", fontSize: "0.7rem", lineHeight: 1.2 }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: mono
            ? "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
            : "inherit",
          fontSize: "0.75rem",
          lineHeight: 1.4,
          wordBreak: mono ? "break-all" : "normal",
          whiteSpace: "normal",
          userSelect: "all",
          cursor: "text",
          minHeight: "1.05rem",
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );

  return (
    <Accordion expanded={infoOpen} onChange={() => setInfoOpen((v) => !v)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">ID, Parent</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {/* ── 수정 가능 항목 — Parent ID(flex) + 순서(고정 폭) 한 줄 ─── */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            label="Parent ID"
            value={testCase?.parentId || ""}
            onChange={onChange("parentId")}
            margin="dense"
            variant="outlined"
            placeholder="null"
            disabled={isViewer}
            sx={{
              flex: 1,
              minWidth: 0,
              "& .MuiInputBase-input": {
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
                fontSize: "0.8rem",
              },
            }}
          />
          <TextField
            label={t("testcase.form.displayOrder", "순서")}
            value={testCase.displayOrder || ""}
            onChange={onChange("displayOrder")}
            margin="dense"
            variant="outlined"
            disabled={isViewer}
            sx={{ width: 120, flexShrink: 0 }}
          />
        </Box>

        {/* ── 읽기 전용 항목 ────────────────────────────────────────── */}
        <Box sx={{ mt: 1.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.5 }}
          >
            {t("testcase.form.readOnly", "읽기 전용")}
          </Typography>
          <Grid container spacing={1}>
            {/* UUID 풀 길이 표시: 단독 행 */}
            <Grid item xs={12}>
              <ReadOnlyField label="Project ID" value={projectId} mono />
            </Grid>
            <Grid item xs={12}>
              <ReadOnlyField label="ID" value={testCase?.id || ""} mono />
            </Grid>
            {/* Parent / 작성자 / 수정자 — 한 줄 3분할, 동일 스타일 */}
            <Grid item xs={12} sm={4}>
              <ReadOnlyField label="Parent" value={testCase?.parentName} />
            </Grid>
            <Grid item xs={6} sm={4}>
              <ReadOnlyField
                label={t("testcase.form.createdBy", "작성자")}
                value={testCase?.createdBy}
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <ReadOnlyField
                label={t("testcase.form.updatedBy", "수정자")}
                value={testCase?.updatedBy}
              />
            </Grid>
          </Grid>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

TestCaseFormMetadata.propTypes = {
  testCase: PropTypes.object.isRequired,
  projectId: PropTypes.string.isRequired,
  infoOpen: PropTypes.bool.isRequired,
  setInfoOpen: PropTypes.func.isRequired,
  isViewer: PropTypes.bool,
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TestCaseFormMetadata;
