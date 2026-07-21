// src/components/Graph/GraphLegend.jsx
// 그래프 색·모양 범례 (접이식). 색 정의는 GraphCanvas 의 LABEL_COLORS/RESULT_COLORS 를 단일 출처로 재사용.

import React, { useState } from "react";
import { Box, Collapse, IconButton, Paper, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { LABEL_COLORS, RESULT_COLORS } from "./GraphCanvas";
import { useI18n } from "../../context/I18nContext";

const Dot = ({ color, diamond, ring }) => (
  <Box
    component="span"
    sx={{
      width: 13,
      height: 13,
      flexShrink: 0,
      display: "inline-block",
      bgcolor: color,
      borderRadius: diamond ? 0 : "50%",
      transform: diamond ? "rotate(45deg)" : "none",
      border: ring ? "2px solid #b71c1c" : "none",
    }}
  />
);

const Item = ({ color, label, diamond, ring }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 120 }}>
    <Dot color={color} diamond={diamond} ring={ring} />
    <Typography variant="caption">{label}</Typography>
  </Box>
);

const GraphLegend = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  // 노드 유형 (자주 쓰는 것 위주 — 색은 GraphCanvas 와 동일)
  const typeItems = [
    { key: "TestCase", label: t("graph.legend.testCase", "테스트 케이스") },
    { key: "Folder", label: t("graph.legend.folder", "폴더") },
    { key: "TestPlan", label: t("graph.legend.testPlan", "테스트 플랜") },
    {
      key: "TestExecution",
      label: t("graph.legend.testExecution", "테스트 실행"),
    },
    { key: "JunitCase", label: t("graph.legend.junitCase", "JUnit 케이스") },
    { key: "JiraIssue", label: t("graph.legend.jiraIssue", "Jira 이슈") },
  ];

  const resultItems = [
    { key: "PASS", label: "PASS" },
    { key: "FAIL", label: "FAIL" },
    { key: "BLOCKED", label: "BLOCKED" },
    { key: "NOT_RUN", label: "NOT_RUN" },
  ];

  return (
    <Paper variant="outlined" sx={{ mt: 1, px: 1.5, py: 0.5 }}>
      <Box
        sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
        data-testid="graph-legend-toggle"
      >
        <Typography variant="caption" sx={{ fontWeight: 600, flex: 1 }}>
          {t("graph.legend.title", "범례 — 색·모양 의미")}
        </Typography>
        <IconButton size="small">
          {open ? (
            <ExpandLessIcon fontSize="small" />
          ) : (
            <ExpandMoreIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
      <Collapse in={open}>
        <Box sx={{ pb: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.5 }}
          >
            {t("graph.legend.nodeTypes", "노드 유형")}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
            {typeItems.map((it) => (
              <Item
                key={it.key}
                color={LABEL_COLORS[it.key]}
                label={it.label}
              />
            ))}
            <Item
              color={LABEL_COLORS.FailureType}
              ring
              label={t("graph.legend.failureType", "오류 원인(허브)")}
            />
            <Item
              color={LABEL_COLORS.Decision}
              diamond
              label={t("graph.legend.decision", "분기(Decision)")}
            />
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.5 }}
          >
            {t("graph.legend.resultStatus", "실행 결과(색이 상태를 뜻함)")}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
            {resultItems.map((it) => (
              <Item
                key={it.key}
                color={RESULT_COLORS[it.key]}
                label={it.label}
              />
            ))}
          </Box>

          <Typography variant="caption" color="text.secondary">
            {t(
              "graph.legend.edges",
              "간선: 회색 실선 = 자동 관계 · 보라 점선 = 사용자가 지정한 관계",
            )}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default GraphLegend;
