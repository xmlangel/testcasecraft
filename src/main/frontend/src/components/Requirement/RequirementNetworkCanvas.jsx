// src/components/Requirement/RequirementNetworkCanvas.jsx
//
// cytoscape 로 네트워크를 그리는 캔버스. 배치는 힘 기반(fcose), 노드 크기는 연결 수 또는 매개 중심성,
// 노드를 누르면 그 노드와 이웃(1·2단계)만 밝히는 에고 네트워크 보기로 바뀐다.
// cytoscape 는 이 파일이 처음 그려질 때만 불러온다(다른 화면 첫 로딩에 영향 없음).

import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Box, useTheme } from "@mui/material";

let cytoscapePromise = null;
const loadCytoscape = () => {
  if (!cytoscapePromise) {
    cytoscapePromise = Promise.all([
      import("cytoscape"),
      import("cytoscape-fcose"),
    ]).then(([cy, fcose]) => {
      cy.default.use(fcose.default);
      return cy.default;
    });
  }
  return cytoscapePromise;
};

const MIN_SIZE = 26;
const MAX_SIZE = 72;

function RequirementNetworkCanvas({
  network,
  sizeBy,
  hops,
  onSelect,
  fitSignal,
  height = 620,
}) {
  const theme = useTheme();
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const coverageColor = {
    COVERED: theme.palette.success.main,
    PARTIAL: theme.palette.warning.main,
    UNCOVERED: theme.palette.error.main,
    EXCLUDED: theme.palette.grey[400],
  };
  const resultColor = {
    PASS: theme.palette.success.main,
    FAIL: theme.palette.error.main,
    BLOCKED: theme.palette.warning.main,
    NOT_RUN: theme.palette.grey[500],
  };

  useEffect(() => {
    let disposed = false;
    loadCytoscape().then((cytoscape) => {
      if (disposed || !containerRef.current) return;
      const textColor = theme.palette.text.primary;
      const cy = cytoscape({
        container: containerRef.current,
        elements: [
          ...network.nodes.map((n) => ({ data: n })),
          ...network.edges.map((e) => ({ data: e })),
        ],
        minZoom: 0.2,
        maxZoom: 3,
        wheelSensitivity: 0.3,
        style: [
          {
            selector: "node",
            style: {
              label: "data(label)",
              "font-size": 11,
              color: textColor,
              "text-valign": "bottom",
              "text-margin-y": 4,
              "text-wrap": "ellipsis",
              "text-max-width": 120,
              width: "data(size)",
              height: "data(size)",
              "border-width": 2,
              "border-color": theme.palette.background.paper,
              "transition-property": "opacity",
              "transition-duration": "150ms",
            },
          },
          {
            selector: 'node[type = "requirement"]',
            style: {
              "background-color": (n) =>
                coverageColor[n.data("coverage")] || coverageColor.UNCOVERED,
              "text-wrap": "wrap",
              "text-max-width": 140,
            },
          },
          {
            selector: 'node[type = "testcase"]',
            style: {
              shape: "round-rectangle",
              "background-color": (n) =>
                n.data("result")
                  ? resultColor[n.data("result")]
                  : theme.palette.grey[400],
              "font-size": 9,
            },
          },
          {
            selector: "edge",
            style: {
              width: 1,
              "line-color": theme.palette.grey[400],
              "curve-style": "bezier",
              opacity: 0.8,
            },
          },
          {
            selector: 'edge[kind = "PARENT_OF"]',
            style: {
              width: 2.5,
              "line-color": theme.palette.primary.main,
              "target-arrow-shape": "triangle",
              "target-arrow-color": theme.palette.primary.main,
            },
          },
          {
            selector: 'edge[kind = "DEPENDS_ON"]',
            style: {
              width: 2,
              "line-style": "dashed",
              "line-color": theme.palette.secondary.main,
              "target-arrow-shape": "triangle",
              "target-arrow-color": theme.palette.secondary.main,
            },
          },
          {
            selector: 'edge[kind = "RELATED_TO"]',
            style: {
              width: 2,
              "line-style": "dotted",
              "line-color": theme.palette.info.main,
            },
          },
          {
            selector: 'edge[kind = "SHARED"]',
            style: {
              width: (e) => Math.min(2 + e.data("weight") * 2, 16),
              "line-color": theme.palette.primary.light,
              label: "data(weight)",
              "font-size": 10,
              color: theme.palette.text.secondary,
              "text-background-color": theme.palette.background.paper,
              "text-background-opacity": 1,
            },
          },
          { selector: ".faded", style: { opacity: 0.12 } },
          {
            selector: "node.focus",
            style: {
              "underlay-color": "#FFD54F",
              "underlay-padding": 14,
              "underlay-opacity": 0.6,
              "underlay-shape": "ellipse",
              "font-weight": "bold",
            },
          },
        ],
      });

      // 노드 크기: 연결 수(degree) 또는 매개 중심성. 두 값 모두 최솟값~최댓값으로 늘려 26~72px 로 맞춘다
      const score =
        sizeBy === "betweenness"
          ? (() => {
              const bc = cy
                .elements()
                .betweennessCentrality({ directed: false });
              return (n) => bc.betweennessNormalized(n);
            })()
          : (n) => n.degree(false);
      const values = cy.nodes().map(score);
      const lo = Math.min(...values, 0);
      const hi = Math.max(...values, 1);
      cy.nodes().forEach((n) => {
        const ratio = hi === lo ? 0 : (score(n) - lo) / (hi - lo);
        const base = n.data("type") === "testcase" ? 0.6 : 1;
        n.data("size", (MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE)) * base);
      });

      cy.layout({
        name: "fcose",
        animate: false,
        randomize: true,
        nodeRepulsion: 9000,
        idealEdgeLength: 90,
        nodeSeparation: 80,
      }).run();
      // 노드가 몇 개 없으면 화면 맞춤이 지나치게 확대한다. 1.3배를 넘지 않게 묶는다
      if (cy.zoom() > 1.3) {
        cy.zoom(1.3);
        cy.center();
      }

      const clearFocus = () => cy.elements().removeClass("faded focus");
      cy.on("tap", "node", (evt) => {
        const node = evt.target;
        let area = node.closedNeighborhood();
        if (hops > 1) area = area.closedNeighborhood();
        clearFocus();
        cy.elements().not(area).addClass("faded");
        node.addClass("focus");
        onSelectRef.current?.({
          type: node.data("type"),
          id: node.data("entityId"),
        });
      });
      cy.on("tap", (evt) => {
        if (evt.target === cy) {
          clearFocus();
          onSelectRef.current?.(null);
        }
      });
      cyRef.current = cy;
    });
    return () => {
      disposed = true;
      cyRef.current?.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, sizeBy, hops, theme.palette.mode]);

  useEffect(() => {
    if (fitSignal) cyRef.current?.fit(undefined, 30);
  }, [fitSignal]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height,
        width: "100%",
        bgcolor: "background.default",
        borderRadius: 1,
      }}
      data-testid="requirement-network-canvas"
    />
  );
}

RequirementNetworkCanvas.propTypes = {
  network: PropTypes.object.isRequired,
  sizeBy: PropTypes.oneOf(["degree", "betweenness"]).isRequired,
  hops: PropTypes.number.isRequired,
  onSelect: PropTypes.func,
  fitSignal: PropTypes.number,
  height: PropTypes.number,
};

export default RequirementNetworkCanvas;
