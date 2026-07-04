// src/components/Graph/GraphFilters.jsx
// 구조 그래프 필터 바 — 노드 유형 / 결과 상태 / 플랜·실행 스코프.
// 로드된 그래프를 클라이언트에서 걸러낸다 (applyGraphFilters).

import React from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useI18n } from "../../context/I18nContext";

// 필터 대상 노드 유형 (Project 는 항상 표시 유지)
export const FILTERABLE_TYPES = [
  "Folder",
  "TestCase",
  "TestPlan",
  "TestExecution",
  "TestResult",
];

export const RESULT_STATUSES = ["PASS", "FAIL", "BLOCKED", "NOT_RUN"];

export const DEFAULT_FILTERS = {
  types: [...FILTERABLE_TYPES],
  results: [...RESULT_STATUSES],
  scopeId: "", // 선택한 플랜/실행의 graphid — 빈 값이면 전체
};

/**
 * 로드된 그래프에 필터 적용.
 * - types: 목록에 없는 라벨의 노드 숨김 (Project·기타 라벨은 유지)
 * - results: TestResult 노드 중 결과 상태가 목록에 없으면 숨김
 * - scopeId: 지정 시 해당 노드에서 간선 2단계 이내로 연결된 노드만 유지
 *   (실행 선택 → 결과·케이스·플랜까지, 플랜 선택 → 케이스·실행까지)
 */
export const applyGraphFilters = (graph, filters) => {
  if (!graph) return graph;
  let nodes = graph.nodes || [];
  const edges = graph.edges || [];

  if (filters.scopeId) {
    const adjacency = new Map();
    edges.forEach((e) => {
      if (!adjacency.has(e.source)) adjacency.set(e.source, []);
      if (!adjacency.has(e.target)) adjacency.set(e.target, []);
      adjacency.get(e.source).push(e.target);
      adjacency.get(e.target).push(e.source);
    });
    const keep = new Set([filters.scopeId]);
    let frontier = [filters.scopeId];
    for (let depth = 0; depth < 2; depth++) {
      const next = [];
      frontier.forEach((id) => {
        (adjacency.get(id) || []).forEach((n) => {
          if (!keep.has(n)) {
            keep.add(n);
            next.push(n);
          }
        });
      });
      frontier = next;
    }
    nodes = nodes.filter((n) => keep.has(n.id));
  }

  nodes = nodes.filter((n) => {
    if (n.label === "TestResult") {
      const result = n.properties?.result || "NOT_RUN";
      return (
        filters.types.includes("TestResult") && filters.results.includes(result)
      );
    }
    if (FILTERABLE_TYPES.includes(n.label)) {
      return filters.types.includes(n.label);
    }
    return true; // Project·JiraIssue 등은 항상 표시
  });

  // 간선은 GraphCanvas 가 고아 간선을 걸러내므로 그대로 전달
  return { nodes, edges };
};

const GraphFilters = ({ graph, filters, onChange }) => {
  const { t } = useI18n();

  const typeLabels = {
    Folder: t("graph.filter.folder", "폴더"),
    TestCase: t("graph.filter.case", "케이스"),
    TestPlan: t("graph.filter.plan", "플랜"),
    TestExecution: t("graph.filter.execution", "실행"),
    TestResult: t("graph.filter.result", "결과"),
  };

  // 스코프 후보: 로드된 그래프의 플랜·실행 노드
  const scopeOptions = (graph?.nodes || [])
    .filter((n) => n.label === "TestPlan" || n.label === "TestExecution")
    .map((n) => ({
      id: n.id,
      label:
        (n.label === "TestPlan"
          ? t("graph.filter.planPrefix", "[플랜] ")
          : t("graph.filter.executionPrefix", "[실행] ")) +
        (n.properties?.name || n.id),
    }));

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        alignItems: "center",
        flexWrap: "wrap",
        mb: 1.5,
      }}
    >
      <ToggleButtonGroup
        size="small"
        value={filters.types}
        onChange={(_, v) => v.length && onChange({ ...filters, types: v })}
        aria-label="node type filter"
      >
        {FILTERABLE_TYPES.map((type) => (
          <ToggleButton
            key={type}
            value={type}
            data-testid={`graph-filter-${type}`}
          >
            {typeLabels[type]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <ToggleButtonGroup
        size="small"
        value={filters.results}
        onChange={(_, v) => v.length && onChange({ ...filters, results: v })}
        aria-label="result status filter"
      >
        <ToggleButton value="PASS" sx={{ color: "#2e7d32" }}>
          PASS
        </ToggleButton>
        <ToggleButton
          value="FAIL"
          sx={{ color: "#c62828" }}
          data-testid="graph-filter-fail"
        >
          FAIL
        </ToggleButton>
        <ToggleButton value="BLOCKED" sx={{ color: "#ef6c00" }}>
          BLOCKED
        </ToggleButton>
        <ToggleButton value="NOT_RUN" sx={{ color: "#757575" }}>
          NOT_RUN
        </ToggleButton>
      </ToggleButtonGroup>

      <FormControl size="small" sx={{ minWidth: 240 }}>
        <InputLabel>{t("graph.filter.scope", "플랜/실행 선택")}</InputLabel>
        <Select
          value={filters.scopeId}
          label={t("graph.filter.scope", "플랜/실행 선택")}
          onChange={(e) => onChange({ ...filters, scopeId: e.target.value })}
          data-testid="graph-filter-scope"
        >
          <MenuItem value="">{t("graph.filter.all", "전체")}</MenuItem>
          {scopeOptions.map((opt) => (
            <MenuItem key={opt.id} value={opt.id}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default GraphFilters;
