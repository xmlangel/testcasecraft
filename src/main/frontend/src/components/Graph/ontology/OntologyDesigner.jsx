// OntologyDesigner — 프로젝트 라이브 데이터를 코어 온톨로지 인스턴스 그래프로 보여주는
// Ontology-Playground 스타일 뷰. 캔버스 + 우측 패널(Insights·Path Finder·Search & Filter
// ·Inspector·NL Query) + Entity Types 범례.
//
// 데이터: GET /api/graph/project/{id}/structure (AgensGraph, GraphSyncService 적재).
// 타입 레지스트리: coreOntology.json (색·아이콘·설명·범례). 노드 레이블(=온톨로지 타입)로 매칭.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import HubIcon from "@mui/icons-material/Hub";
import LinkIcon from "@mui/icons-material/Link";
import CategoryIcon from "@mui/icons-material/Category";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import KeyIcon from "@mui/icons-material/Key";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useAppContext } from "../../../context/AppContext";
import {
  getGraphStatus,
  getProjectStructure,
  syncGraph,
} from "../../../services/graphApi";
import coreOntology from "../coreOntology.json";
import OntologyCanvas, { nodeDisplayName } from "./OntologyCanvas";
import "./ontologyDesigner.css";

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// 코어 온톨로지 → 타입 레지스트리 (레이블=ClassName 로 매칭)
const TYPE_BY_LABEL = {};
coreOntology.entityTypes.forEach((e) => {
  TYPE_BY_LABEL[cap(e.id)] = {
    id: e.id,
    name: e.name,
    icon: e.icon,
    color: e.color,
    description: e.description,
  };
});

function findShortestPath(fromId, toId, edges) {
  if (fromId === toId) return null;
  const adj = {};
  edges.forEach((e) => {
    (adj[e.source] = adj[e.source] || []).push({ to: e.target, edge: e });
  });
  const visited = new Set([fromId]);
  const queue = [{ id: fromId, path: [{ nodeId: fromId }] }];
  while (queue.length) {
    const cur = queue.shift();
    for (const { to, edge } of adj[cur.id] || []) {
      if (visited.has(to)) continue;
      visited.add(to);
      const next = [...cur.path, { nodeId: to, via: edge }];
      if (to === toId) return next;
      queue.push({ id: to, path: next });
    }
  }
  return null;
}

function InsightsPanel({ nodeCount, edgeCount, typeCount }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="ontd-section">
      <button className="ontd-section-head" onClick={() => setOpen((v) => !v)}>
        <span className="ontd-section-title">
          <InsightsIcon sx={{ fontSize: 15 }} /> ONTOLOGY INSIGHTS
        </span>
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 16 }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 16 }} />
        )}
      </button>
      {open && (
        <div className="ontd-stats-grid">
          <div className="ontd-stat ontd-stat--blue">
            <HubIcon sx={{ fontSize: 16 }} />
            <div className="ontd-stat-value">{nodeCount}</div>
            <div className="ontd-stat-label">NODES</div>
          </div>
          <div className="ontd-stat ontd-stat--purple">
            <LinkIcon sx={{ fontSize: 16 }} />
            <div className="ontd-stat-value">{edgeCount}</div>
            <div className="ontd-stat-label">RELATIONSHIPS</div>
          </div>
          <div className="ontd-stat ontd-stat--green">
            <CategoryIcon sx={{ fontSize: 16 }} />
            <div className="ontd-stat-value">{typeCount}</div>
            <div className="ontd-stat-label">TYPES</div>
          </div>
        </div>
      )}
    </div>
  );
}

function PathFinderPanel({ nodes, edges, onHighlight }) {
  const [open, setOpen] = useState(false);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [searched, setSearched] = useState(false);

  const path = useMemo(() => {
    if (!searched || !fromId || !toId) return null;
    return findShortestPath(fromId, toId, edges);
  }, [searched, fromId, toId, edges]);

  const nameOf = useCallback(
    (id) => {
      const n = nodes.find((x) => x.id === id);
      return n ? nodeDisplayName(n) : id;
    },
    [nodes],
  );

  const find = () => {
    setSearched(true);
    if (fromId && toId) {
      const p = findShortestPath(fromId, toId, edges);
      if (p)
        onHighlight(
          p.map((n) => n.nodeId),
          p.filter((n) => n.via).map((n) => n.via.id),
        );
      else onHighlight([], []);
    }
  };
  const clear = () => {
    setFromId("");
    setToId("");
    setSearched(false);
    onHighlight([], []);
  };
  const same = fromId && toId && fromId === toId;
  const noPath = searched && fromId && toId && !same && !path;

  return (
    <div className="ontd-section">
      <button className="ontd-section-head" onClick={() => setOpen((v) => !v)}>
        <span className="ontd-section-title">
          <AccountTreeIcon sx={{ fontSize: 15 }} /> PATH FINDER
        </span>
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 16 }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 16 }} />
        )}
      </button>
      {open && (
        <div className="ontd-section-body">
          <div className="ontd-pf-selects">
            <select
              className="ontd-select"
              value={fromId}
              onChange={(e) => {
                setFromId(e.target.value);
                setSearched(false);
                onHighlight([], []);
              }}
            >
              <option value="">시작…</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {nodeDisplayName(n)}
                </option>
              ))}
            </select>
            <ArrowForwardIcon sx={{ fontSize: 14, color: "#9AA0A6" }} />
            <select
              className="ontd-select"
              value={toId}
              onChange={(e) => {
                setToId(e.target.value);
                setSearched(false);
                onHighlight([], []);
              }}
            >
              <option value="">도착…</option>
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {nodeDisplayName(n)}
                </option>
              ))}
            </select>
          </div>
          <div className="ontd-pf-actions">
            <button
              className="ontd-btn-primary"
              onClick={find}
              disabled={!fromId || !toId || !!same}
            >
              <SearchIcon sx={{ fontSize: 13 }} /> 경로 찾기
            </button>
            {searched && (
              <button className="ontd-btn-ghost" onClick={clear}>
                <CloseIcon sx={{ fontSize: 13 }} /> 지우기
              </button>
            )}
          </div>
          {same && (
            <div className="ontd-msg-warn">서로 다른 노드를 선택하세요.</div>
          )}
          {noPath && (
            <div className="ontd-msg-warn">
              두 노드 사이 유향 경로가 없습니다.
            </div>
          )}
          {path && (
            <div className="ontd-pf-result">
              <div className="ontd-pf-result-label">
                최단 경로 — {path.length - 1} hop
              </div>
              <div className="ontd-pf-chain">
                {path.map((s, i) => (
                  <div key={s.nodeId} className="ontd-pf-item">
                    {s.via && (
                      <div className="ontd-pf-rel">
                        <span className="ontd-pf-rel-line" />
                        <span className="ontd-pf-rel-name">{s.via.label}</span>
                      </div>
                    )}
                    <div
                      className={`ontd-pf-node${i === 0 ? " is-start" : i === path.length - 1 ? " is-end" : ""}`}
                    >
                      <span>{nameOf(s.nodeId)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchFilterPanel({
  nodes,
  edges,
  onSelectNode,
  onSelectEdge,
  onHighlight,
}) {
  const [open, setOpen] = useState(true);
  const [q, setQ] = useState("");
  const [showN, setShowN] = useState(true);
  const [showE, setShowE] = useState(true);

  const res = useMemo(() => {
    const s = q.trim().toLowerCase();
    const fn = s
      ? nodes.filter(
          (n) =>
            nodeDisplayName(n).toLowerCase().includes(s) ||
            (n.label || "").toLowerCase().includes(s),
        )
      : nodes;
    const fe = s
      ? edges.filter((e) => (e.label || "").toLowerCase().includes(s))
      : edges;
    return { nodes: fn.slice(0, 200), edges: fe.slice(0, 200) };
  }, [q, nodes, edges]);

  const empty = q && res.nodes.length === 0 && res.edges.length === 0;

  return (
    <div className="ontd-section">
      <button className="ontd-section-head" onClick={() => setOpen((v) => !v)}>
        <span className="ontd-section-title">
          <FilterListIcon sx={{ fontSize: 15 }} /> SEARCH &amp; FILTER
        </span>
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 16 }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 16 }} />
        )}
      </button>
      {open && (
        <div className="ontd-section-body">
          <div className="ontd-search-box">
            <SearchIcon sx={{ fontSize: 15, color: "#9AA0A6" }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="노드·관계 검색…"
            />
            {q && (
              <button className="ontd-search-clear" onClick={() => setQ("")}>
                <CloseIcon sx={{ fontSize: 13 }} />
              </button>
            )}
          </div>
          <div className="ontd-filter-toggles">
            <button
              className={`ontd-toggle ontd-toggle--blue${showN ? " is-on" : ""}`}
              onClick={() => setShowN((v) => !v)}
            >
              Nodes ({nodes.length})
            </button>
            <button
              className={`ontd-toggle ontd-toggle--green${showE ? " is-on" : ""}`}
              onClick={() => setShowE((v) => !v)}
            >
              Relationships ({edges.length})
            </button>
          </div>
          <div className="ontd-result-list">
            {empty && (
              <div className="ontd-empty-hint">"{q}" 검색 결과 없음</div>
            )}
            {showN &&
              res.nodes.map((n) => {
                const t = TYPE_BY_LABEL[n.label] || {};
                return (
                  <div
                    key={n.id}
                    className="ontd-result-item"
                    style={{ borderLeftColor: t.color || "#0b57d0" }}
                    onClick={() => {
                      onSelectNode(n.id);
                      onHighlight([n.id], []);
                    }}
                  >
                    <span
                      className="ontd-result-dot"
                      style={{ background: t.color || "#0b57d0" }}
                    />
                    <div className="ontd-result-text">
                      <div className="ontd-result-name">
                        {t.icon} {nodeDisplayName(n)}
                      </div>
                      <div className="ontd-result-sub">{t.name || n.label}</div>
                    </div>
                  </div>
                );
              })}
            {showE &&
              res.edges.map((e) => (
                <div
                  key={e.id}
                  className="ontd-result-item ontd-result-item--rel"
                  onClick={() => {
                    onSelectEdge(e.id);
                    onHighlight([], [e.id]);
                  }}
                >
                  <span className="ontd-result-rel-icon">↔</span>
                  <div className="ontd-result-text">
                    <div className="ontd-result-name">{e.label}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InspectorPanel({ node, edge, nodes }) {
  if (!node && !edge) {
    return (
      <div className="ontd-inspector">
        <div className="ontd-inspector-empty">
          <div className="ontd-inspector-empty-icon">🔍</div>
          <div className="ontd-inspector-empty-title">요소를 선택하세요</div>
          <div className="ontd-inspector-empty-text">
            그래프에서 노드나 관계를 클릭하면 속성·연결을 확인할 수 있습니다.
          </div>
        </div>
      </div>
    );
  }

  if (edge) {
    const src = nodes.find((n) => n.id === edge.source);
    const dst = nodes.find((n) => n.id === edge.target);
    return (
      <div className="ontd-inspector">
        <div className="ontd-inspector-head">관계</div>
        <div className="ontd-entity-head">
          <div
            className="ontd-entity-icon"
            style={{ background: "#8764B820", color: "#8764B8" }}
          >
            ↔
          </div>
          <div className="ontd-entity-meta">
            <h2>{edge.label}</h2>
            <p>
              {src ? nodeDisplayName(src) : edge.source} →{" "}
              {dst ? nodeDisplayName(dst) : edge.target}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const t = TYPE_BY_LABEL[node.label] || {};
  const props = Object.entries(node.properties || {}).filter(
    ([k]) => k !== "projectId",
  );
  return (
    <div className="ontd-inspector">
      <div className="ontd-inspector-head">
        인스턴스 · {t.name || node.label}
      </div>
      <div className="ontd-entity-head">
        <div
          className="ontd-entity-icon"
          style={{
            background: (t.color || "#0078D4") + "20",
            color: t.color || "#0078D4",
          }}
        >
          {t.icon || "📦"}
        </div>
        <div className="ontd-entity-meta">
          <h2>{nodeDisplayName(node)}</h2>
          <p>{t.description || node.label}</p>
        </div>
      </div>
      <div className="ontd-inspector-sec">
        <div className="ontd-inspector-sec-title">
          <KeyIcon sx={{ fontSize: 13 }} /> 속성 ({props.length})
        </div>
        <div className="ontd-prop-list">
          {props.map(([k, v]) => (
            <div key={k} className="ontd-prop-item">
              <span className="ontd-prop-name">{k}</span>
              <span className="ontd-prop-type">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = ["TestCase", "TestResult", "produces"];

function NlQueryPanel({ nodes, edges, onHighlight }) {
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState(null);
  const run = (text) => {
    const s = (text || q).trim().toLowerCase();
    if (!s) return;
    const nIds = nodes
      .filter(
        (n) =>
          nodeDisplayName(n).toLowerCase().includes(s) ||
          (n.label || "").toLowerCase().includes(s),
      )
      .map((n) => n.id);
    const eIds = edges
      .filter((e) => (e.label || "").toLowerCase().includes(s))
      .map((e) => e.id);
    onHighlight(nIds, eIds);
    setMsg(
      nIds.length || eIds.length
        ? `노드 ${nIds.length} · 관계 ${eIds.length} 강조`
        : "일치하는 요소가 없습니다.",
    );
  };
  return (
    <div className="ontd-section ontd-nl">
      <div className="ontd-section-title ontd-nl-title">
        <AutoAwesomeIcon sx={{ fontSize: 15 }} /> NATURAL LANGUAGE QUERY
        (NL2ONTOLOGY)
      </div>
      <div className="ontd-nl-input">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="그래프에 물어보기…"
        />
        <button className="ontd-nl-go" onClick={() => run()}>
          <SearchIcon sx={{ fontSize: 16 }} />
        </button>
      </div>
      {msg && <div className="ontd-nl-msg">{msg}</div>}
      <div className="ontd-nl-hint">예시:</div>
      <div className="ontd-nl-chips">
        {SUGGESTIONS.map((sug) => (
          <button
            key={sug}
            className="ontd-nl-chip"
            onClick={() => {
              setQ(sug);
              run(sug);
            }}
          >
            {sug}
          </button>
        ))}
      </div>
    </div>
  );
}

const OntologyDesigner = () => {
  const { api, activeProject } = useAppContext();
  const projectId = activeProject?.id;

  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dbAvailable, setDbAvailable] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [highlightedIds, setHighlightedIds] = useState([]);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setHighlightedIds([]);
    try {
      const data = await getProjectStructure(api, projectId);
      setGraph({ nodes: data?.nodes || [], edges: data?.edges || [] });
    } catch (e) {
      setError(e.message);
      setGraph({ nodes: [], edges: [] });
    } finally {
      setLoading(false);
    }
  }, [api, projectId]);

  // 연결 상태를 먼저 확인하고, 연결됐을 때만 그래프를 조회한다 (DB 미연결 시 500 호출 회피).
  useEffect(() => {
    let cancelled = false;
    getGraphStatus(api)
      .then((s) => {
        if (cancelled) return;
        const available = Boolean(s?.available);
        setDbAvailable(available);
        if (available) load();
      })
      .catch(() => !cancelled && setDbAvailable(false));
    return () => {
      cancelled = true;
    };
  }, [api, load]);

  const runSync = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      await syncGraph(api, projectId);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }, [api, projectId, load]);

  const { nodes, edges } = graph;

  const legendTypes = useMemo(() => {
    const byType = {};
    nodes.forEach((n) => {
      byType[n.label] = (byType[n.label] || 0) + 1;
    });
    return Object.entries(byType).map(([label, count]) => {
      const t = TYPE_BY_LABEL[label] || {};
      return {
        label,
        count,
        name: t.name || label,
        icon: t.icon || "📦",
        color: t.color || "#0078D4",
      };
    });
  }, [nodes]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId],
  );
  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) || null,
    [edges, selectedEdgeId],
  );

  const selectNode = (id) => {
    setSelectedNodeId(id);
    setSelectedEdgeId(null);
  };
  const selectEdge = (id) => {
    setSelectedEdgeId(id);
    setSelectedNodeId(null);
  };
  const clearSelection = () => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };
  const highlight = (ids) => setHighlightedIds(ids);

  if (!projectId) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        그래프를 보려면 먼저 프로젝트를 선택하세요.
      </Alert>
    );
  }

  const isEmpty = !loading && nodes.length === 0;

  return (
    <Box sx={{ pt: 1 }}>
      {dbAvailable === false && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          그래프 데이터베이스에 연결할 수 없습니다. 관리자에게 문의하세요.
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {isEmpty && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button
              size="small"
              color="inherit"
              onClick={runSync}
              disabled={syncing}
              data-testid="graph-sync-button"
            >
              {syncing ? "동기화 중…" : "지금 동기화"}
            </Button>
          }
        >
          표시할 그래프 데이터가 없습니다. 프로젝트 데이터를 온톨로지 그래프로
          동기화하세요.
        </Alert>
      )}

      <div className="ontd-root">
        <div className="ontd-main">
          {loading && (
            <div className="ontd-loading">
              <CircularProgress size={28} />
            </div>
          )}
          <OntologyCanvas
            nodes={nodes}
            edges={edges}
            typeByLabel={TYPE_BY_LABEL}
            legendTypes={legendTypes}
            selectedId={selectedNodeId || selectedEdgeId}
            highlightedIds={highlightedIds}
            onSelectNode={selectNode}
            onSelectEdge={selectEdge}
            onBackground={clearSelection}
          />
        </div>
        <aside className="ontd-sidebar">
          <InsightsPanel
            nodeCount={nodes.length}
            edgeCount={edges.length}
            typeCount={legendTypes.length}
          />
          <PathFinderPanel
            nodes={nodes}
            edges={edges}
            onHighlight={(nIds, eIds) =>
              highlight([...(nIds || []), ...(eIds || [])])
            }
          />
          <SearchFilterPanel
            nodes={nodes}
            edges={edges}
            onSelectNode={selectNode}
            onSelectEdge={selectEdge}
            onHighlight={(nIds, eIds) =>
              highlight([...(nIds || []), ...(eIds || [])])
            }
          />
          <InspectorPanel
            node={selectedNode}
            edge={selectedEdge}
            nodes={nodes}
          />
          <NlQueryPanel
            nodes={nodes}
            edges={edges}
            onHighlight={(nIds, eIds) =>
              highlight([...(nIds || []), ...(eIds || [])])
            }
          />
        </aside>
      </div>
    </Box>
  );
};

export default OntologyDesigner;
