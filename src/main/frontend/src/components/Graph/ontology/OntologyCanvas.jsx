// OntologyCanvas — Ontology-Playground 스타일 Cytoscape 캔버스 (라이브 인스턴스 그래프).
// 노드 = 프로젝트 실제 인스턴스, 색/모양·범례 = 코어 온톨로지 타입.
// 원본: Ontology-Playground src/components/OntologyGraph.tsx 이식
//   (lucide→MUI, zustand→props, 테마 CSS 변수→라이트 고정 팔레트, 타입그래프→인스턴스그래프).

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DownloadIcon from "@mui/icons-material/Download";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";

cytoscape.use(fcose);

const COLORS = {
  nodeText: "#2A2A2A",
  edgeColor: "#9AA0A6",
  edgeText: "#555555",
  edgeLabelBg: "#F2F2F2",
  bg: "#E9EDF3",
};

const FCOSE = {
  name: "fcose",
  quality: "proof",
  randomize: false,
  animate: false,
  fit: true,
  padding: 60,
  nodeDimensionsIncludeLabels: true,
  nodeRepulsion: () => 15000,
  idealEdgeLength: () => 180,
  edgeElasticity: () => 0.45,
  nestingFactor: 0.1,
  gravity: 0.25,
  gravityRange: 3.8,
  numIter: 2500,
  tile: true,
  nodeSeparation: 90,
};

// 인스턴스 표시 이름
export const nodeDisplayName = (n) => {
  const p = n.properties || {};
  return p.name || p.title || p.displayId || p.id || n.id;
};

const OntologyCanvas = ({
  nodes = [],
  edges = [],
  typeByLabel = {},
  legendTypes = [],
  selectedId,
  highlightedIds = [],
  onSelectNode,
  onSelectEdge,
  onBackground,
}) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const mountedRef = useRef(true);
  const focusRef = useRef(null);
  const [focusId, setFocusId] = useState(null);

  const getCy = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || !mountedRef.current) return null;
    try {
      if (!cy.container()) return null;
    } catch {
      return null;
    }
    return cy;
  }, []);

  const elements = useMemo(() => {
    const nodeEls = nodes.map((n) => {
      const t = typeByLabel[n.label] || {};
      return {
        data: {
          id: n.id,
          label: `${t.icon || "📦"} ${nodeDisplayName(n)}`,
          color: t.color || "#0078D4",
          kind: "node",
        },
      };
    });
    const ids = new Set(nodeEls.map((n) => n.data.id));
    const edgeEls = edges
      .filter((e) => ids.has(e.source) && ids.has(e.target))
      .map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          kind: "edge",
        },
      }));
    return [...nodeEls, ...edgeEls];
  }, [nodes, edges, typeByLabel]);

  // (재)생성 — 데이터가 바뀌면 새로 그린다
  useEffect(() => {
    if (!containerRef.current) return undefined;
    mountedRef.current = true;
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "bottom",
            "text-halign": "center",
            "font-size": "12px",
            "font-family": "Segoe UI, Noto Sans KR, sans-serif",
            "font-weight": 600,
            color: COLORS.nodeText,
            "text-margin-y": 8,
            "text-wrap": "ellipsis",
            "text-max-width": "120px",
            width: 54,
            height: 54,
            "background-color": "data(color)",
            "border-width": 3,
            "border-color": "data(color)",
            "border-opacity": 0.5,
            "transition-property": "border-width, border-color, width, height",
            "transition-duration": 200,
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 5,
            "border-color": "#0078D4",
            width: 66,
            height: 66,
          },
        },
        {
          selector: "node.highlighted",
          style: {
            "border-width": 4,
            "border-color": "#FFB900",
            width: 62,
            height: 62,
          },
        },
        { selector: "node.dimmed", style: { opacity: 0.25 } },
        {
          selector: "edge",
          style: {
            label: "data(label)",
            "font-size": "10px",
            "font-family": "Segoe UI, Noto Sans KR, sans-serif",
            color: COLORS.edgeText,
            "text-rotation": "autorotate",
            "text-margin-y": -8,
            "text-wrap": "ellipsis",
            "text-max-width": "110px",
            "text-background-color": COLORS.edgeLabelBg,
            "text-background-opacity": 1,
            "text-background-padding": "2px",
            "text-background-shape": "roundrectangle",
            width: 2,
            "line-color": COLORS.edgeColor,
            "target-arrow-color": COLORS.edgeColor,
            "target-arrow-shape": "triangle",
            "curve-style": "unbundled-bezier",
            "control-point-step-size": 30,
            "transition-property": "width, line-color, target-arrow-color",
            "transition-duration": 200,
          },
        },
        {
          selector: "edge:selected",
          style: {
            width: 4,
            "line-color": "#0078D4",
            "target-arrow-color": "#0078D4",
            color: "#0078D4",
          },
        },
        {
          selector: "edge.highlighted",
          style: {
            width: 3.5,
            "line-color": "#FFB900",
            "target-arrow-color": "#FFB900",
            color: "#FFB900",
          },
        },
        { selector: "edge.dimmed", style: { opacity: 0.15 } },
      ],
      layout: FCOSE,
      minZoom: 0.15,
      maxZoom: 3,
    });

    cy.on("tap", "node", (evt) => onSelectNode?.(evt.target.id()));
    cy.on("tap", "edge", (evt) => onSelectEdge?.(evt.target.id()));
    cy.on("tap", (evt) => {
      if (evt.target === cy) {
        if (focusRef.current !== null) {
          focusRef.current = null;
          setFocusId(null);
          cy.elements().removeClass("dimmed");
        }
        onBackground?.();
      }
    });
    cy.on("dbltap", "node", (evt) => {
      const id = evt.target.id();
      if (focusRef.current === id) {
        focusRef.current = null;
        setFocusId(null);
        cy.elements().removeClass("dimmed");
      } else {
        focusRef.current = id;
        setFocusId(id);
        cy.elements().addClass("dimmed");
        cy.getElementById(id).closedNeighborhood().removeClass("dimmed");
      }
    });

    cyRef.current = cy;
    cy.layout({ ...FCOSE, randomize: true }).run();

    return () => {
      mountedRef.current = false;
      cy.destroy();
      cyRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements]);

  // 선택 → 이웃 강조
  useEffect(() => {
    const cy = getCy();
    if (!cy || focusRef.current !== null) return;
    try {
      cy.elements().removeClass("dimmed");
      cy.elements().unselect();
      if (selectedId) {
        const el = cy.getElementById(selectedId);
        if (el.length) {
          el.select();
          cy.elements().addClass("dimmed");
          el.removeClass("dimmed");
          if (el.isNode()) {
            const ce = el.connectedEdges();
            ce.removeClass("dimmed");
            ce.connectedNodes().removeClass("dimmed");
          } else {
            el.connectedNodes().removeClass("dimmed");
          }
        }
      }
    } catch {
      /* destroyed */
    }
  }, [selectedId, getCy]);

  // 검색/경로 하이라이트
  useEffect(() => {
    const cy = getCy();
    if (!cy) return;
    try {
      cy.elements().removeClass("highlighted");
      highlightedIds.forEach((id) =>
        cy.getElementById(id).addClass("highlighted"),
      );
    } catch {
      /* destroyed */
    }
  }, [highlightedIds, getCy]);

  const zoomIn = () => {
    const cy = getCy();
    if (cy) {
      cy.zoom(cy.zoom() * 1.3);
      cy.center();
    }
  };
  const zoomOut = () => {
    const cy = getCy();
    if (cy) {
      cy.zoom(cy.zoom() / 1.3);
      cy.center();
    }
  };
  const fit = () => getCy()?.fit(undefined, 60);
  const reset = () =>
    getCy()
      ?.layout({
        ...FCOSE,
        randomize: true,
        animate: true,
        animationDuration: 500,
      })
      .run();
  const download = () => {
    const cy = getCy();
    if (!cy) return;
    try {
      const png = cy.png({ scale: 2, full: true, bg: COLORS.bg });
      const a = document.createElement("a");
      a.href = png;
      a.download = "ontology-graph.png";
      a.click();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="ontd-graph-container">
      <div
        ref={containerRef}
        className="ontd-graph-canvas"
        data-testid="ontology-graph-canvas"
      />

      {focusId && (
        <div className="ontd-focus-badge">
          <CenterFocusStrongIcon sx={{ fontSize: 14 }} />
          <span>포커스 모드 — 배경 클릭 시 해제</span>
        </div>
      )}

      <div className="ontd-graph-controls">
        <button className="ontd-ctrl-btn" onClick={zoomIn} title="확대">
          <ZoomInIcon sx={{ fontSize: 18 }} />
        </button>
        <button className="ontd-ctrl-btn" onClick={zoomOut} title="축소">
          <ZoomOutIcon sx={{ fontSize: 18 }} />
        </button>
        <button className="ontd-ctrl-btn" onClick={fit} title="화면 맞춤">
          <FitScreenIcon sx={{ fontSize: 18 }} />
        </button>
        <button
          className="ontd-ctrl-btn"
          onClick={reset}
          title="레이아웃 초기화"
        >
          <RestartAltIcon sx={{ fontSize: 18 }} />
        </button>
        <button
          className="ontd-ctrl-btn"
          onClick={download}
          title="PNG 내려받기"
        >
          <DownloadIcon sx={{ fontSize: 18 }} />
        </button>
      </div>

      {legendTypes.length > 0 && (
        <div className="ontd-graph-legend">
          <div className="ontd-legend-title">ENTITY TYPES</div>
          {legendTypes.map((t) => (
            <div key={t.label} className="ontd-legend-item">
              <span
                className="ontd-legend-dot"
                style={{ backgroundColor: t.color }}
              />
              <span>
                {t.icon} {t.name}{" "}
                <span className="ontd-legend-count">({t.count})</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OntologyCanvas;
