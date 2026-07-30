// src/components/PlanExecutionWorkspace.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useAppContext } from "../context/AppContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import apiService from "../services/apiService.js";
import TestPlanForm from "./TestPlanForm.jsx";
import TestExecutionForm from "./TestExecutionForm.jsx";

const LIST_WIDTH = 260;
const LIST_COLLAPSED_WIDTH = 44;

/** 실행 상태 칩 색 — 목록에서 한눈에 구분되게. */
const statusColor = (status) => {
  switch (String(status || "").toUpperCase()) {
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
      return "warning";
    case "ABORTED":
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
};

/**
 * 테스트 플랜·테스트 실행 작업 화면 — 목록과 상세를 나란히 둔 2단 (신규 레이아웃 전용).
 *
 * 기존 구조는 플랜을 고르면 팝업이 화면을 덮고, 실행을 고르면 상단 바·좌측 메뉴가
 * 없는 전체 화면으로 빠졌다. 플랜을 오가며 실행을 만들거나 결과를 보려면 매번 닫고
 * 다시 열어야 했다. 여기서는 왼쪽 목록에서 고르면 오른쪽 상세가 바뀐다.
 *
 *   plans      모드: [플랜 목록] [플랜 내용 + 그 플랜의 실행 목록]
 *   executions 모드: [실행 목록] [실행 상세]
 *
 * 각 단은 접을 수 있다 — 상세를 넓게 보려면 목록을, 목록을 훑을 때는 실행 섹션을 접는다.
 * 팝업이 없으므로 목록 사이를 오가는 동안 맥락이 끊기지 않는다.
 */
function PlanExecutionWorkspace({
  mode = "plans",
  projectId,
  initialPlanId = null,
  initialExecutionId = null,
}) {
  const { t } = useI18n();
  const {
    testPlans = [],
    testPlansLoading,
    testExecutions = [],
  } = useAppContext() || {};

  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);
  const [selectedExecutionId, setSelectedExecutionId] =
    useState(initialExecutionId);
  const [creatingExecution, setCreatingExecution] = useState(false);
  const [planExecutions, setPlanExecutions] = useState([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [listCollapsed, setListCollapsed] = useState(false);
  const [runsOpen, setRunsOpen] = useState(true);

  const plansOfProject = useMemo(
    () =>
      (testPlans || []).filter(
        (plan) =>
          !plan?.projectId || String(plan.projectId) === String(projectId),
      ),
    [testPlans, projectId],
  );

  const executionsOfProject = useMemo(
    () =>
      (testExecutions || []).filter(
        (exec) =>
          !exec?.projectId || String(exec.projectId) === String(projectId),
      ),
    [testExecutions, projectId],
  );

  // 왼쪽 목록 — 모드에 따라 플랜 또는 실행
  const primaryItems = useMemo(() => {
    const query = filterText.trim().toLowerCase();
    const items = mode === "plans" ? plansOfProject : executionsOfProject;
    if (!query) return items;
    return items.filter((item) =>
      String(item?.name || "")
        .toLowerCase()
        .includes(query),
    );
  }, [mode, plansOfProject, executionsOfProject, filterText]);

  const loadPlanExecutions = useCallback(
    async (planId) => {
      if (!planId) {
        setPlanExecutions([]);
        return;
      }
      setExecutionsLoading(true);
      setErrorDetail(null);
      try {
        const res = await apiService.get(
          `/api/test-executions?testPlanId=${planId}`,
        );
        const data = await res.json();
        setPlanExecutions(Array.isArray(data) ? data : []);
      } catch (err) {
        setErrorDetail(err?.message || "unknown");
        setPlanExecutions([]);
      } finally {
        setExecutionsLoading(false);
      }
    },
    // t 를 의존성에 넣으면(구현에 따라 매 렌더 새 함수) 이 콜백이 매번 새로 만들어져
    // 아래 effect 가 무한히 재실행된다. 메시지는 렌더에서 조립한다.
    [],
  );

  // URL 로 특정 실행·플랜을 열고 들어온 경우 그 선택을 이어받는다.
  // (예: /projects/:id/executions/:execId — 예전에는 전체 화면으로 빠졌다)
  useEffect(() => {
    if (initialExecutionId) setSelectedExecutionId(initialExecutionId);
  }, [initialExecutionId]);
  useEffect(() => {
    if (initialPlanId) setSelectedPlanId(initialPlanId);
  }, [initialPlanId]);

  // 플랜을 고르면 그 플랜의 실행 목록을 상세 안에 채운다
  useEffect(() => {
    if (mode !== "plans") return;
    setCreatingExecution(false);
    loadPlanExecutions(selectedPlanId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedPlanId, loadPlanExecutions]);

  const selectedExecution = useMemo(() => {
    const pool = mode === "plans" ? planExecutions : executionsOfProject;
    return (
      pool.find((e) => String(e.id) === String(selectedExecutionId)) || null
    );
  }, [mode, planExecutions, executionsOfProject, selectedExecutionId]);

  const effectivePlanId =
    mode === "plans" ? selectedPlanId : selectedExecution?.testPlanId || null;

  const handleSelectPrimary = (item) => {
    setCreatingExecution(false);
    if (mode === "plans") {
      setSelectedExecutionId(null);
      setSelectedPlanId(item.id);
    } else {
      setSelectedExecutionId(item.id);
    }
  };

  const handleAfterExecutionSaved = () => {
    setCreatingExecution(false);
    if (mode === "plans") loadPlanExecutions(selectedPlanId);
  };

  const paneSx = {
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100vh - 200px)",
    overflow: "hidden",
  };

  const listTitle =
    mode === "plans"
      ? t("testPlan.tab.label", "테스트플랜")
      : t("projectHeader.tabs.testExecution", "테스트실행");

  // ── 왼쪽: 목록 (접을 수 있다) ──────────────────────────────────────────────
  const listPane = (
    <Paper
      variant="outlined"
      sx={{
        ...paneSx,
        width: listCollapsed ? LIST_COLLAPSED_WIDTH : LIST_WIDTH,
        minWidth: listCollapsed ? LIST_COLLAPSED_WIDTH : LIST_WIDTH,
        flexShrink: 0,
        transition: "width 0.15s ease",
      }}
      data-testid="workspace-list-pane"
    >
      <Box
        sx={{
          px: listCollapsed ? 0.5 : 1.5,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: listCollapsed ? "center" : "space-between",
          gap: 0.5,
        }}
      >
        {!listCollapsed && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
              {listTitle}
            </Typography>
            <Chip size="small" label={primaryItems.length} />
          </>
        )}
        <Tooltip
          title={
            listCollapsed
              ? t("testPlan.workspace.expandList", "목록 펼치기")
              : t("testPlan.workspace.collapseList", "목록 접기")
          }
        >
          <IconButton
            size="small"
            onClick={() => setListCollapsed((prev) => !prev)}
            data-testid="workspace-list-collapse-toggle"
          >
            {listCollapsed ? (
              <ChevronRightIcon fontSize="small" />
            ) : (
              <ChevronLeftIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {!listCollapsed && (
        <>
          <Divider />
          <Box sx={{ px: 1, pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder={t("testPlan.workspace.filter", "이름으로 찾기")}
              inputProps={{ "data-testid": "workspace-primary-filter" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: filterText ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setFilterText("")}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Box>
          {testPlansLoading && mode === "plans" ? (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <CircularProgress size={20} />
            </Box>
          ) : (
            <List dense sx={{ overflowY: "auto", flexGrow: 1 }}>
              {primaryItems.length === 0 && (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("testPlan.workspace.empty", "항목이 없습니다.")}
                  </Typography>
                </Box>
              )}
              {primaryItems.map((item) => {
                const selected =
                  mode === "plans"
                    ? String(item.id) === String(selectedPlanId)
                    : String(item.id) === String(selectedExecutionId);
                return (
                  <ListItemButton
                    key={item.id}
                    selected={selected}
                    onClick={() => handleSelectPrimary(item)}
                    data-testid={`workspace-primary-item-${item.id}`}
                    sx={{
                      borderLeft: 3,
                      borderColor: selected ? "primary.main" : "transparent",
                    }}
                  >
                    <ListItemText
                      primary={item.name}
                      primaryTypographyProps={{
                        variant: "body2",
                        noWrap: true,
                        fontWeight: selected ? 700 : 400,
                      }}
                      secondary={
                        mode === "executions" && item.status ? (
                          <Chip
                            size="small"
                            label={item.status}
                            color={statusColor(item.status)}
                            sx={{ height: 18, fontSize: "0.65rem" }}
                          />
                        ) : undefined
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </>
      )}
    </Paper>
  );

  // ── 오른쪽 상세 안의 실행 섹션 (접을 수 있다) ─────────────────────────────
  const planRunsSection = (
    <Box sx={{ px: 2, pb: 2 }} data-testid="workspace-runs-section">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setRunsOpen((prev) => !prev)}
            data-testid="workspace-runs-collapse-toggle"
            title={
              runsOpen
                ? t("testPlan.workspace.collapseRuns", "실행 목록 접기")
                : t("testPlan.workspace.expandRuns", "실행 목록 펼치기")
            }
          >
            {runsOpen ? (
              <ExpandLessIcon fontSize="small" />
            ) : (
              <ExpandMoreIcon fontSize="small" />
            )}
          </IconButton>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t("testPlan.workspace.executions", "이 플랜의 실행")}
          </Typography>
          <Chip size="small" label={planExecutions.length} />
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title={t("common.refresh", "새로고침")}>
            <IconButton
              size="small"
              onClick={() => loadPlanExecutions(selectedPlanId)}
              data-testid="workspace-executions-refresh"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!selectedPlanId}
            onClick={() => {
              setSelectedExecutionId(null);
              setCreatingExecution(true);
            }}
            data-testid="workspace-new-execution"
          >
            {t("testPlan.workspace.newExecution", "실행 만들기")}
          </Button>
        </Box>
      </Box>

      <Collapse in={runsOpen} unmountOnExit>
        {executionsLoading ? (
          <Box sx={{ py: 1, textAlign: "center" }}>
            <CircularProgress size={18} />
          </Box>
        ) : planExecutions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t(
              "testPlan.workspace.noExecution",
              "아직 실행이 없습니다. 실행 만들기로 시작하세요.",
            )}
          </Typography>
        ) : (
          <Paper variant="outlined">
            <List dense disablePadding>
              {planExecutions.map((exec) => (
                <ListItemButton
                  key={exec.id}
                  onClick={() => {
                    setCreatingExecution(false);
                    setSelectedExecutionId(exec.id);
                  }}
                  data-testid={`workspace-execution-item-${exec.id}`}
                >
                  <ListItemText
                    primary={exec.name}
                    primaryTypographyProps={{ variant: "body2", noWrap: true }}
                  />
                  {exec.status && (
                    <Chip
                      size="small"
                      label={exec.status}
                      color={statusColor(exec.status)}
                      sx={{ height: 18, fontSize: "0.65rem" }}
                    />
                  )}
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Collapse>
    </Box>
  );

  const backToPlan = (
    <Box sx={{ px: 2, pt: 1.5 }}>
      <Button
        size="small"
        startIcon={<ArrowBackIcon />}
        onClick={() => setSelectedExecutionId(null)}
        data-testid="workspace-back-to-plan"
      >
        {t("testPlan.workspace.backToPlan", "플랜으로 돌아가기")}
      </Button>
    </Box>
  );

  let detail = (
    <Box sx={{ p: 3 }}>
      <Typography variant="body2" color="text.secondary">
        {mode === "plans"
          ? t(
              "testPlan.workspace.detailHint",
              "플랜을 고르면 내용이 여기에 열립니다. 실행을 고르면 실행 상세로 바뀝니다.",
            )
          : t(
              "testPlan.workspace.detailHintExecution",
              "실행을 고르면 상세가 여기에 열립니다.",
            )}
      </Typography>
    </Box>
  );

  if (creatingExecution && effectivePlanId) {
    detail = (
      <>
        {mode === "plans" && backToPlan}
        <TestExecutionForm
          executionId={null}
          projectId={projectId}
          initialTestPlanId={effectivePlanId}
          onCancel={() => setCreatingExecution(false)}
          onSave={handleAfterExecutionSaved}
        />
      </>
    );
  } else if (selectedExecutionId) {
    detail = (
      <>
        {mode === "plans" && backToPlan}
        <TestExecutionForm
          key={selectedExecutionId}
          executionId={selectedExecutionId}
          projectId={projectId}
          onCancel={() => setSelectedExecutionId(null)}
          onSave={handleAfterExecutionSaved}
        />
      </>
    );
  } else if (mode === "plans" && selectedPlanId) {
    detail = (
      <>
        <TestPlanForm
          key={selectedPlanId}
          testPlanId={selectedPlanId}
          inline
          onCancel={() => setSelectedPlanId(null)}
          onSave={() => loadPlanExecutions(selectedPlanId)}
        />
        <Divider />
        {planRunsSection}
      </>
    );
  }

  return (
    <Box data-testid={`plan-execution-workspace-${mode}`}>
      {errorDetail && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {t(
            "testPlan.workspace.executionsFailed",
            "실행 목록을 불러오지 못했습니다.",
          )}
          {errorDetail !== "unknown" ? ` (${errorDetail})` : ""}
        </Alert>
      )}
      <Box sx={{ display: "flex", gap: 1, alignItems: "stretch" }}>
        {listPane}
        <Paper
          variant="outlined"
          sx={{ ...paneSx, flexGrow: 1, minWidth: 0 }}
          data-testid="workspace-detail-pane"
        >
          <Box sx={{ overflowY: "auto", flexGrow: 1 }}>{detail}</Box>
        </Paper>
      </Box>
    </Box>
  );
}

PlanExecutionWorkspace.propTypes = {
  mode: PropTypes.oneOf(["plans", "executions"]),
  projectId: PropTypes.string,
  initialPlanId: PropTypes.string,
  initialExecutionId: PropTypes.string,
};

export default PlanExecutionWorkspace;
