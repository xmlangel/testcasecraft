// src/components/Graph/GraphView.jsx
// 그래프 뷰 페이지 — 구조/오류 클러스터/케이스 이웃 3개 탭 + Cytoscape 캔버스 + 노드 상세 패널.
// 데이터: /api/graph/* (AgensGraph). features.graph.enabled=false 면 상태 안내만 표시.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useAppContext } from "../../context/AppContext";
import { useI18n } from "../../context/I18nContext";
import {
  getFailureClusters,
  getGraphStatus,
  getNeighborhood,
  getProjectStructure,
  syncGraph,
} from "../../services/graphApi";
import GraphCanvas from "./GraphCanvas";
import GraphFilters, {
  DEFAULT_FILTERS,
  applyGraphFilters,
} from "./GraphFilters";
import NodeDetailPanel from "./NodeDetailPanel";

const TAB_STRUCTURE = 0;
const TAB_FAILURES = 1;
const TAB_NEIGHBOR = 2;

const GraphView = () => {
  const { api, activeProject } = useAppContext();
  const { t } = useI18n();

  const projectId = activeProject?.id;

  const [tab, setTab] = useState(TAB_STRUCTURE);
  const [layout, setLayout] = useState("fcose");
  const [graph, setGraph] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dbAvailable, setDbAvailable] = useState(null);
  // 이웃 탭 입력
  const [caseId, setCaseId] = useState("");
  const [depth, setDepth] = useState(1);

  // 그래프 DB 상태 확인 (1회)
  useEffect(() => {
    let cancelled = false;
    getGraphStatus(api)
      .then((s) => !cancelled && setDbAvailable(Boolean(s?.available)))
      .catch(() => !cancelled && setDbAvailable(false));
    return () => {
      cancelled = true;
    };
  }, [api]);

  const loadGraph = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    try {
      let data = null;
      if (tab === TAB_STRUCTURE) {
        data = await getProjectStructure(api, projectId);
      } else if (tab === TAB_FAILURES) {
        data = await getFailureClusters(api, projectId);
      } else if (tab === TAB_NEIGHBOR && caseId.trim()) {
        data = await getNeighborhood(api, projectId, caseId.trim(), depth);
      }
      setGraph(data);
    } catch (e) {
      setError(e.message);
      setGraph(null);
    } finally {
      setLoading(false);
    }
  }, [api, projectId, tab, caseId, depth]);

  // 구조/오류 탭은 진입 시 자동 로드, 이웃 탭은 조회 버튼으로
  useEffect(() => {
    setFilters(DEFAULT_FILTERS);
    if (tab !== TAB_NEIGHBOR) loadGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, projectId]);

  const handleSelectNode = useCallback(
    (nodeData) => setSelectedNode(nodeData),
    [],
  );

  const [syncing, setSyncing] = useState(false);
  const runSync = useCallback(async () => {
    setSyncing(true);
    setError(null);
    try {
      await syncGraph(api, projectId);
      await loadGraph();
    } catch (e) {
      setError(e.message);
    } finally {
      setSyncing(false);
    }
  }, [api, projectId, loadGraph]);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const filteredGraph = useMemo(
    () => (tab === TAB_STRUCTURE ? applyGraphFilters(graph, filters) : graph),
    [graph, filters, tab],
  );

  const emptyGraph = useMemo(
    () => graph && (graph.nodes?.length ?? 0) === 0,
    [graph],
  );

  if (!projectId) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        {t(
          "graph.selectProject",
          "그래프를 보려면 먼저 프로젝트를 선택하세요.",
        )}
      </Alert>
    );
  }

  return (
    <Box sx={{ pt: 1 }}>
      {dbAvailable === false && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t(
            "graph.dbUnavailable",
            "그래프 데이터베이스에 연결할 수 없습니다. 관리자에게 문의하세요.",
          )}
        </Alert>
      )}

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={t("graph.tab.structure", "구조 그래프")} />
          <Tab label={t("graph.tab.failures", "오류 클러스터")} />
          <Tab label={t("graph.tab.neighborhood", "케이스 이웃")} />
        </Tabs>
      </Paper>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>{t("graph.layout.label", "레이아웃")}</InputLabel>
          <Select
            value={layout}
            label={t("graph.layout.label", "레이아웃")}
            onChange={(e) => setLayout(e.target.value)}
            data-testid="graph-layout-select"
          >
            <MenuItem value="fcose">{t("graph.layout.force", "포스")}</MenuItem>
            <MenuItem value="dagre">
              {t("graph.layout.hierarchy", "계층")}
            </MenuItem>
            <MenuItem value="concentric">
              {t("graph.layout.concentric", "동심원 (허브 중심)")}
            </MenuItem>
            <MenuItem value="circle">
              {t("graph.layout.circle", "원형")}
            </MenuItem>
            <MenuItem value="grid">{t("graph.layout.grid", "격자")}</MenuItem>
          </Select>
        </FormControl>

        {tab === TAB_NEIGHBOR && (
          <>
            <TextField
              size="small"
              sx={{ width: 320 }}
              label={t("graph.caseIdLabel", "테스트케이스 ID")}
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            />
            <FormControl size="small" sx={{ width: 110 }}>
              <InputLabel>{t("graph.depth", "깊이")}</InputLabel>
              <Select
                value={depth}
                label={t("graph.depth", "깊이")}
                onChange={(e) => setDepth(e.target.value)}
              >
                {[1, 2, 3].map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadGraph}
          disabled={loading || (tab === TAB_NEIGHBOR && !caseId.trim())}
        >
          {t("graph.refresh", "조회")}
        </Button>

        {loading && <CircularProgress size={20} />}
      </Box>

      {tab === TAB_STRUCTURE && graph && (
        <GraphFilters graph={graph} filters={filters} onChange={setFilters} />
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {emptyGraph && !loading && (
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
              {syncing
                ? t("graph.syncing", "동기화 중…")
                : t("graph.syncNow", "지금 동기화")}
            </Button>
          }
        >
          {t(
            "graph.empty",
            "표시할 그래프 데이터가 없습니다. 프로젝트 데이터를 그래프로 동기화하세요.",
          )}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <GraphCanvas
            graph={filteredGraph}
            layout={layout}
            onSelectNode={handleSelectNode}
          />
        </Box>
        <Paper
          sx={{ width: 280, flexShrink: 0, maxHeight: 560, overflow: "auto" }}
        >
          <NodeDetailPanel node={selectedNode} />
        </Paper>
      </Box>
    </Box>
  );
};

export default GraphView;
