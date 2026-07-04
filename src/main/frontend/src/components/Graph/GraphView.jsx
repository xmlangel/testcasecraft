// src/components/Graph/GraphView.jsx
// 그래프 뷰 페이지 — 구조/오류 클러스터/케이스 이웃 3개 탭 + Cytoscape 캔버스 + 노드 상세 패널.
// 데이터: /api/graph/* (AgensGraph). features.graph.enabled=false 면 상태 안내만 표시.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import HubIcon from "@mui/icons-material/Hub";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useI18n } from "../../context/I18nContext";
import {
  convertToGraph,
  createRelation,
  deleteRelation,
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
import GraphLegend from "./GraphLegend";
import NodeDetailPanel from "./NodeDetailPanel";

const TAB_STRUCTURE = 0;
const TAB_FAILURES = 1;
const TAB_NEIGHBOR = 2;

const GraphView = () => {
  const { api, activeProject } = useAppContext();
  const { t } = useI18n();
  const navigate = useNavigate();

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

  const handleSelectNode = useCallback((nodeData) => {
    setSelectedEdge(null);
    setSelectedNode(nodeData);
    // 관계 추가 모드: 시작 케이스가 지정된 상태에서 다른 케이스를 클릭하면 타입 선택으로
    setRelationSource((source) => {
      if (
        source &&
        nodeData &&
        nodeData.label === "TestCase" &&
        nodeData.properties?.id !== source.properties?.id
      ) {
        setRelationTarget(nodeData);
      }
      return source;
    });
  }, []);

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

  // ── 케이스 간 수동 관계 편집 ──
  const MANUAL_TYPES = ["DEPENDS_ON", "RELATES_TO", "BLOCKS"];
  const [relationSource, setRelationSource] = useState(null); // 관계 시작 노드
  const [relationTarget, setRelationTarget] = useState(null); // 타입 선택 대기
  const [relationType, setRelationType] = useState("DEPENDS_ON");
  const [selectedEdge, setSelectedEdge] = useState(null);

  const handleSelectEdge = useCallback((edgeData) => {
    setSelectedEdge(edgeData);
    if (edgeData) setSelectedNode(null);
  }, []);

  const saveRelation = async () => {
    try {
      await createRelation(
        api,
        projectId,
        relationSource.properties.id,
        relationTarget.properties.id,
        relationType,
      );
      setRelationSource(null);
      setRelationTarget(null);
      await loadGraph();
    } catch (e) {
      setError(e.message);
      setRelationTarget(null);
    }
  };

  const removeSelectedEdge = async () => {
    // 수동 관계 엣지: source/target 은 graphid — 노드 목록에서 도메인 id 로 환원
    const byGraphId = new Map((graph?.nodes || []).map((n) => [n.id, n]));
    const src = byGraphId.get(selectedEdge.source);
    const dst = byGraphId.get(selectedEdge.target);
    if (!src || !dst) return;
    try {
      await deleteRelation(
        api,
        projectId,
        src.properties?.id,
        dst.properties?.id,
        selectedEdge.label,
      );
      setSelectedEdge(null);
      await loadGraph();
    } catch (e) {
      setError(e.message);
    }
  };

  // 선택 케이스 노드의 표현 모드 판정 (동기화가 노드에 저장한 representationMode 사용)
  const isGraphModeNode = (node) =>
    node?.properties?.representationMode === "GRAPH" ||
    node?.properties?.representationMode === "HYBRID";

  const openEditor = (caseId) =>
    navigate(`/graph-tc/${caseId}/edit?projectId=${projectId}`);

  // 기본 케이스 → 그래프로 전환 후 편집기로 이동
  const [converting, setConverting] = useState(false);
  const convertAndEdit = async (caseId) => {
    setConverting(true);
    setError(null);
    try {
      await convertToGraph(api, projectId, caseId);
      openEditor(caseId);
    } catch (e) {
      setError(e.message);
    } finally {
      setConverting(false);
    }
  };

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const filteredGraph = useMemo(
    () => applyGraphFilters(graph, filters),
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

      {graph && (
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
            onSelectEdge={handleSelectEdge}
          />
          <GraphLegend />
        </Box>
        <Paper
          sx={{ width: 280, flexShrink: 0, maxHeight: 560, overflow: "auto" }}
        >
          {selectedEdge ? (
            <Box sx={{ p: 2 }}>
              <Chip size="small" label={selectedEdge.label} sx={{ mb: 1 }} />
              {MANUAL_TYPES.includes(selectedEdge.label) ? (
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  fullWidth
                  onClick={removeSelectedEdge}
                  data-testid="graph-relation-delete"
                >
                  {t("graph.relation.delete", "이 관계 삭제")}
                </Button>
              ) : (
                <Alert severity="info" sx={{ fontSize: 12 }}>
                  {t(
                    "graph.relation.autoEdge",
                    "동기화로 생성된 관계는 삭제할 수 없습니다.",
                  )}
                </Alert>
              )}
            </Box>
          ) : (
            <>
              <NodeDetailPanel node={selectedNode} />
              {selectedNode?.label === "TestCase" && !relationSource && (
                <Box
                  sx={{
                    px: 2,
                    pb: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {isGraphModeNode(selectedNode) ? (
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      startIcon={<AccountTreeIcon />}
                      onClick={() => openEditor(selectedNode.properties.id)}
                      data-testid="graph-open-editor"
                    >
                      {t("graph.openEditor", "그래프 편집기 열기")}
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      fullWidth
                      startIcon={<HubIcon />}
                      disabled={converting}
                      onClick={() => convertAndEdit(selectedNode.properties.id)}
                      data-testid="graph-convert-edit"
                    >
                      {converting
                        ? t("graph.converting", "전환 중…")
                        : t("graph.convertAndEdit", "그래프로 전환 후 편집")}
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    onClick={() => setRelationSource(selectedNode)}
                    data-testid="graph-relation-start"
                  >
                    {t("graph.relation.start", "이 케이스에서 관계 시작")}
                  </Button>
                </Box>
              )}
              {relationSource && (
                <Box sx={{ px: 2, pb: 2 }}>
                  <Alert severity="info" sx={{ mb: 1, fontSize: 12 }}>
                    {t(
                      "graph.relation.pickTarget",
                      "대상 케이스 노드를 클릭하세요",
                    )}
                    : {relationSource.caption}
                  </Alert>
                  <Button
                    size="small"
                    fullWidth
                    onClick={() => setRelationSource(null)}
                  >
                    {t("graph.relation.cancel", "관계 추가 취소")}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>

        <Dialog
          open={Boolean(relationTarget)}
          onClose={() => setRelationTarget(null)}
        >
          <DialogTitle>
            {t("graph.relation.typeTitle", "관계 유형 선택")}
          </DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Box sx={{ fontSize: 13, mb: 2 }}>
              {relationSource?.caption} → {relationTarget?.caption}
            </Box>
            <FormControl size="small" fullWidth>
              <InputLabel>{t("graph.relation.type", "유형")}</InputLabel>
              <Select
                value={relationType}
                label={t("graph.relation.type", "유형")}
                onChange={(e) => setRelationType(e.target.value)}
              >
                <MenuItem value="DEPENDS_ON">
                  DEPENDS_ON — {t("graph.relation.dependsOn", "선행 필요")}
                </MenuItem>
                <MenuItem value="RELATES_TO">
                  RELATES_TO — {t("graph.relation.relatesTo", "연관")}
                </MenuItem>
                <MenuItem value="BLOCKS">
                  BLOCKS — {t("graph.relation.blocks", "차단함")}
                </MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRelationTarget(null)}>
              {t("graph.relation.cancelBtn", "취소")}
            </Button>
            <Button
              variant="contained"
              onClick={saveRelation}
              data-testid="graph-relation-save"
            >
              {t("graph.relation.save", "관계 생성")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default GraphView;
