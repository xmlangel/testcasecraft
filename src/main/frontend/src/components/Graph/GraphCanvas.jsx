// src/components/Graph/GraphCanvas.jsx
// Cytoscape 캔버스 래퍼 — {nodes, edges} 응답을 받아 그린다.
// 레이아웃: fcose(force) / dagre(계층). 노드 클릭 시 onSelectNode(nodeData) 콜백.

import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import dagre from "cytoscape-dagre";
import { Box } from "@mui/material";

cytoscape.use(fcose);
cytoscape.use(dagre);

// 라벨별 노드 색 — FailureType(오류 허브)은 경고색으로 강조
const LABEL_COLORS = {
  Project: "#5c6bc0",
  Folder: "#8d9db6",
  TestCase: "#1976d2",
  TestPlan: "#7e57c2",
  TestExecution: "#26a69a",
  TestResult: "#66bb6a",
  Bug: "#ef5350",
  JunitCase: "#ffa726",
  FailureType: "#d32f2f",
  JiraIssue: "#42a5f5",
  User: "#78909c",
  GraphTestCase: "#1565c0",
  StepNode: "#1e88e5",
  Precondition: "#90a4ae",
  Decision: "#f9a825",
  Expected: "#9ccc65",
  State: "#ab47bc",
};

// TestResult 는 result 값에 따라 색을 덮어쓴다
const RESULT_COLORS = {
  PASS: "#2e7d32",
  FAIL: "#c62828",
  BLOCKED: "#ef6c00",
  NOT_RUN: "#9e9e9e",
};

const nodeCaption = (node) => {
  const p = node.properties || {};
  return (
    p.name ||
    p.signature ||
    p.action ||
    p.text ||
    p.result ||
    p.id ||
    node.label
  );
};

export const toElements = (graph) => {
  const nodes = (graph?.nodes || []).map((n) => ({
    data: {
      id: n.id,
      label: n.label,
      caption: String(nodeCaption(n)).slice(0, 40),
      properties: n.properties || {},
    },
  }));
  const nodeIds = new Set(nodes.map((n) => n.data.id));
  const edges = (graph?.edges || [])
    // 파서가 못 읽은 정점이 있으면 간선이 고아가 될 수 있다 — cytoscape 는 고아 간선에서 예외를 던진다
    .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
    .map((e) => ({
      data: { id: e.id, source: e.source, target: e.target, label: e.label },
    }));
  return [...nodes, ...edges];
};

const buildStyle = () => [
  {
    selector: "node",
    style: {
      label: "data(caption)",
      "font-size": 10,
      color: "#333",
      "text-valign": "bottom",
      "text-margin-y": 4,
      "text-wrap": "ellipsis",
      "text-max-width": 120,
      width: 26,
      height: 26,
      "background-color": (ele) => {
        const props = ele.data("properties") || {};
        if (ele.data("label") === "TestResult" && RESULT_COLORS[props.result]) {
          return RESULT_COLORS[props.result];
        }
        return LABEL_COLORS[ele.data("label")] || "#607d8b";
      },
      "border-width": (ele) => (ele.data("label") === "FailureType" ? 3 : 0),
      "border-color": "#b71c1c",
    },
  },
  {
    selector: "node[label = 'FailureType']",
    style: { width: 38, height: 38, "font-weight": "bold" },
  },
  {
    selector: "edge",
    style: {
      width: 1.4,
      "line-color": "#b0bec5",
      "target-arrow-color": "#b0bec5",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
      label: "data(label)",
      "font-size": 7,
      color: "#90a4ae",
      "text-rotation": "autorotate",
    },
  },
  {
    selector: "node:selected",
    style: { "border-width": 3, "border-color": "#1976d2" },
  },
];

const LAYOUTS = {
  fcose: {
    name: "fcose",
    animate: false,
    nodeSeparation: 90,
    idealEdgeLength: 90,
  },
  dagre: { name: "dagre", rankDir: "LR", nodeSep: 40, rankSep: 80 },
  // 동심원: 연결(차수)이 많은 허브가 중앙 — 반복 실패·핵심 케이스 식별용
  concentric: {
    name: "concentric",
    animate: false,
    minNodeSpacing: 24,
    concentric: (node) => node.degree(),
    levelWidth: () => 2,
  },
  circle: { name: "circle", animate: false, spacingFactor: 1.2 },
  grid: { name: "grid", animate: false, avoidOverlapPadding: 14 },
};

const GraphCanvas = ({
  graph,
  layout = "fcose",
  height = 560,
  onSelectNode,
}) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  // 최초 1회 인스턴스 생성
  useEffect(() => {
    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: buildStyle(),
      wheelSensitivity: 0.2,
    });
    cy.on("tap", "node", (evt) => {
      onSelectNode?.(evt.target.data());
    });
    cy.on("tap", (evt) => {
      if (evt.target === cy) onSelectNode?.(null);
    });
    cyRef.current = cy;
    return () => cy.destroy();
    // onSelectNode 는 ref 경유로 바꾸지 않는다 — 부모가 useCallback 으로 고정해 준다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 데이터/레이아웃 변경 시 다시 그림
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.elements().remove();
    cy.add(toElements(graph));
    cy.layout(LAYOUTS[layout] || LAYOUTS.fcose).run();
  }, [graph, layout]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.paper",
      }}
    />
  );
};

export default GraphCanvas;
