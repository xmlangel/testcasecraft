// src/components/TestCase/TestCaseFormMetadata.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  Grid,
  Box,
  Button,
  Collapse,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  ExpandMore as ExpandMoreIcon,
  InfoOutlined as InfoOutlinedIcon,
} from "@mui/icons-material";

const MONO_FONT =
  "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";

// 값 하나를 클립보드로 복사하는 작은 버튼. 복사 뒤 잠깐 「복사됨」을 보인다.
const CopyButton = ({ value, label, testId, t }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!value || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // 클립보드 권한이 없으면 조용히 넘어간다(값은 화면에서 직접 선택할 수 있다)
    }
  };
  return (
    <Tooltip
      title={
        copied
          ? t("testcase.form.copied", "복사됨")
          : `${label} ${t("testcase.form.copy", "복사")}`
      }
    >
      <span>
        <IconButton
          size="small"
          onClick={handleCopy}
          disabled={!value}
          aria-label={`${label} ${t("testcase.form.copy", "복사")}`}
          data-testid={testId}
          sx={{ p: 0.25 }}
        >
          <ContentCopyIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </span>
    </Tooltip>
  );
};

CopyButton.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string.isRequired,
  testId: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

// 요약 줄의 「라벨 값」 한 쌍
const MetaItem = ({ label, value, testId }) => (
  <Box component="span" data-testid={testId} sx={{ whiteSpace: "nowrap" }}>
    <Box component="span" sx={{ color: "text.secondary" }}>
      {label}
    </Box>{" "}
    <Box component="span" sx={{ color: "text.primary" }}>
      {value || "—"}
    </Box>
  </Box>
);

MetaItem.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  testId: PropTypes.string,
};

/**
 * ICT-495 cl-4: 정보성 필드를 큰 입력칸 대신 작은 글씨 한 줄로 요약한다.
 * 예: 소유자 admin · Parent F05 장바구니 · 순서 6 · 수정 admin · ⓘ 식별 정보
 * 「식별 정보」를 누르면 ID·Parent ID·Project ID 가 펼쳐지고 각각 복사 버튼이 있다(기본 접힘).
 * 편집 모드에서도 순서·Parent ID 는 그대로 고칠 수 있다(순서는 폭 80px 작은 칸,
 * Parent ID 는 식별 정보 안의 작은 칸). 값과 저장 경로(onChange)는 바꾸지 않았다.
 */
const MetadataLine = ({ testCase, projectId, isViewer, t, onChange }) => {
  const [idsOpen, setIdsOpen] = useState(false);
  const idRows = [
    { key: "id", label: "ID", value: testCase?.id || "" },
    { key: "parent-id", label: "Parent ID", value: testCase?.parentId || "" },
    { key: "project-id", label: "Project ID", value: projectId || "" },
  ];
  return (
    <Box data-testid="testcase-meta" sx={{ mt: 1 }}>
      <Box
        data-testid="testcase-meta-line"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          columnGap: 1.5,
          rowGap: 0.5,
          fontSize: "0.8rem",
          lineHeight: 1.6,
        }}
      >
        {/* 소유자: 담당자 필드가 없어 작성자(createdBy)로 대신한다(ICT-491 결정과 같다) */}
        <MetaItem
          label={t("testcase.form.owner", "소유자")}
          value={testCase?.createdBy}
          testId="testcase-owner-field"
        />
        <MetaItem label="Parent" value={testCase?.parentName} />
        {isViewer ? (
          <MetaItem
            label={t("testcase.form.displayOrder", "순서")}
            value={testCase?.displayOrder}
            testId="testcase-display-order"
          />
        ) : (
          <TextField
            label={t("testcase.form.displayOrder", "순서")}
            value={testCase?.displayOrder ?? ""}
            onChange={onChange("displayOrder")}
            size="small"
            variant="outlined"
            sx={{ width: 80, my: 0.5 }}
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                "data-testid": "testcase-display-order-input",
              },
            }}
          />
        )}
        <MetaItem
          label={t("testcase.form.updatedByShort", "수정")}
          value={testCase?.updatedBy}
        />
        <Button
          size="small"
          variant="text"
          startIcon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => setIdsOpen((v) => !v)}
          aria-expanded={idsOpen}
          aria-controls="testcase-ids"
          data-testid="testcase-ids-toggle"
          sx={{ minWidth: 0, px: 0.5, py: 0, fontSize: "0.8rem" }}
        >
          {t("testcase.form.identity", "식별 정보")}
        </Button>
      </Box>
      <Collapse in={idsOpen} unmountOnExit>
        <Box
          id="testcase-ids"
          data-testid="testcase-ids"
          sx={{
            mt: 0.5,
            display: "grid",
            gridTemplateColumns: "auto minmax(0, 1fr)",
            columnGap: 1,
            rowGap: 0.25,
            alignItems: "center",
            fontSize: "0.75rem",
          }}
        >
          {idRows.map(({ key, label, value }) => (
            <React.Fragment key={key}>
              <Box component="span" sx={{ color: "text.secondary" }}>
                {label}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  minWidth: 0,
                }}
              >
                {key === "parent-id" && !isViewer ? (
                  <TextField
                    value={testCase?.parentId || ""}
                    onChange={onChange("parentId")}
                    size="small"
                    variant="outlined"
                    placeholder="null"
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      maxWidth: 360,
                      "& .MuiInputBase-input": {
                        fontFamily: MONO_FONT,
                        fontSize: "0.75rem",
                        py: 0.5,
                      },
                    }}
                    slotProps={{
                      htmlInput: {
                        "aria-label": "Parent ID",
                        "data-testid": "testcase-parent-id",
                      },
                    }}
                  />
                ) : (
                  <Box
                    component="span"
                    data-testid={`testcase-${key}-value`}
                    sx={{
                      fontFamily: MONO_FONT,
                      wordBreak: "break-all",
                      userSelect: "all",
                    }}
                  >
                    {value || "—"}
                  </Box>
                )}
                <CopyButton
                  value={value}
                  label={label}
                  testId={`testcase-copy-${key}`}
                  t={t}
                />
              </Box>
            </React.Fragment>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

MetadataLine.propTypes = {
  testCase: PropTypes.object.isRequired,
  projectId: PropTypes.string,
  isViewer: PropTypes.bool,
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

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
  // ICT-495 cl-4: 상세 안에서 작은 글씨 한 줄 요약(MetadataLine)으로 그린다
  flat = false,
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

  if (flat) {
    return (
      <MetadataLine
        testCase={testCase}
        projectId={projectId}
        isViewer={isViewer}
        t={t}
        onChange={onChange}
      />
    );
  }

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
            <Grid size={12}>
              <ReadOnlyField label="Project ID" value={projectId} mono />
            </Grid>
            <Grid size={12}>
              <ReadOnlyField label="ID" value={testCase?.id || ""} mono />
            </Grid>
            {/* Parent / 작성자 / 수정자 — 한 줄 3분할, 동일 스타일 */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <ReadOnlyField label="Parent" value={testCase?.parentName} />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <ReadOnlyField
                label={t("testcase.form.createdBy", "작성자")}
                value={testCase?.createdBy}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
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
  infoOpen: PropTypes.bool,
  setInfoOpen: PropTypes.func,
  isViewer: PropTypes.bool,
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  flat: PropTypes.bool,
};

export default TestCaseFormMetadata;
