// src/components/Graph/TestCaseGraphEditor.jsx
// 그래프 테스트 케이스 편집기 (MVP) — StepNode 체인을 편집하고 저장한다.
// 저장 시 백엔드가 서브그래프를 재작성하고 관계형 미러를 즉시 재생성한다 (§5-C).
// 상단에 Cytoscape 미리보기(계층 레이아웃), 하단에 스텝 편집 테이블.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import CallSplitIcon from "@mui/icons-material/CallSplit";
import { useAppContext } from "../../context/AppContext";
import { useI18n } from "../../context/I18nContext";
import { getGraphSteps, updateGraphSteps } from "../../services/graphApi";
import GraphCanvas from "./GraphCanvas";

// 그래프 응답을 편집 가능한 스텝 배열로 변환 — Decision/BRANCH_ON 에서 branches 복원
export const graphToSteps = (graph) => {
  const nodes = graph?.nodes || [];
  const edges = graph?.edges || [];
  const byGraphId = new Map(nodes.map((n) => [n.id, n]));

  const steps = nodes
    .filter((n) => n.label === "StepNode")
    .map((n) => ({
      order: Number(n.properties?.order ?? 0),
      description: n.properties?.action || "",
      expectedResult: n.properties?.expected || "",
      branches: [],
    }))
    .sort((a, b) => a.order - b.order);

  // Decision(order=i) 의 BRANCH_ON → 스텝 i 의 branches
  edges
    .filter((e) => e.label === "BRANCH_ON")
    .forEach((e) => {
      const decision = byGraphId.get(e.source);
      const target = byGraphId.get(e.target);
      if (decision?.label !== "Decision" || target?.label !== "StepNode")
        return;
      const owner = steps.find(
        (s) => s.order === Number(decision.properties?.order),
      );
      if (owner) {
        owner.branches.push({
          label: e.properties?.label || "분기",
          to: Number(target.properties?.order ?? 0),
        });
      }
    });
  return steps;
};

const TestCaseGraphEditor = () => {
  const { testCaseId } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const navigate = useNavigate();
  const { api } = useAppContext();
  const { t } = useI18n();

  const [graph, setGraph] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [savedAt, setSavedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGraphSteps(api, projectId, testCaseId);
      setGraph(data);
      setSteps(graphToSteps(data));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [api, projectId, testCaseId]);

  useEffect(() => {
    if (projectId && testCaseId) load();
  }, [load, projectId, testCaseId]);

  const mutateStep = (index, field, value) =>
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );

  const addStep = () =>
    setSteps((prev) => [
      ...prev,
      { description: "", expectedResult: "", branches: [] },
    ]);

  const removeStep = (index) =>
    setSteps((prev) => prev.filter((_, i) => i !== index));

  const mutateBranch = (stepIndex, branchIndex, field, value) =>
    setSteps((prev) =>
      prev.map((s, i) =>
        i === stepIndex
          ? {
              ...s,
              branches: s.branches.map((b, bi) =>
                bi === branchIndex ? { ...b, [field]: value } : b,
              ),
            }
          : s,
      ),
    );

  const addBranch = (stepIndex) =>
    setSteps((prev) =>
      prev.map((s, i) =>
        i === stepIndex
          ? {
              ...s,
              branches: [
                ...(s.branches || []),
                { label: "", to: Math.min(stepIndex + 2, prev.length) },
              ],
            }
          : s,
      ),
    );

  const removeBranch = (stepIndex, branchIndex) =>
    setSteps((prev) =>
      prev.map((s, i) =>
        i === stepIndex
          ? { ...s, branches: s.branches.filter((_, bi) => bi !== branchIndex) }
          : s,
      ),
    );

  const moveStep = (index, delta) =>
    setSteps((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateGraphSteps(
        api,
        projectId,
        testCaseId,
        steps.map((s) => ({
          description: s.description,
          expectedResult: s.expectedResult,
          ...(s.branches?.length ? { branches: s.branches } : {}),
        })),
      );
      setSavedAt(new Date());
      await load(); // 저장 후 그래프 미리보기 갱신
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // 편집 중 상태를 미리보기에 반영 (저장 전 로컬 프리뷰)
  const previewGraph = useMemo(() => {
    const nodes = [
      { id: "root", label: "GraphTestCase", properties: { name: testCaseId } },
      ...steps.map((s, i) => ({
        id: `s${i + 1}`,
        label: "StepNode",
        properties: { order: i + 1, action: s.description || `Step ${i + 1}` },
      })),
    ];
    const edges = [];
    steps.forEach((s, i) => {
      const stepId = `s${i + 1}`;
      const prev = steps[i - 1];
      // 진입 간선 — 이전 스텝에 분기가 있으면 경로는 분기가 정의하므로 암묵 NEXT 생략
      if (i === 0) {
        edges.push({
          id: `e-in-${i}`,
          label: "STARTS_AT",
          source: "root",
          target: stepId,
        });
      } else if (!prev?.branches?.length) {
        edges.push({
          id: `e-in-${i}`,
          label: "NEXT",
          source: `s${i}`,
          target: stepId,
        });
      }
      if (s.branches?.length) {
        const decisionId = `d${i + 1}`;
        nodes.push({
          id: decisionId,
          label: "Decision",
          properties: { order: i + 1, name: "?" },
        });
        edges.push({
          id: `e-dec-${i}`,
          label: "NEXT",
          source: stepId,
          target: decisionId,
        });
        s.branches.forEach((b, bi) => {
          if (b.to >= 1 && b.to <= steps.length) {
            edges.push({
              id: `e-br-${i}-${bi}`,
              label: b.label || "분기",
              source: decisionId,
              target: `s${b.to}`,
            });
          }
        });
      }
    });
    return { nodes, edges };
  }, [steps, testCaseId]);

  if (!projectId) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {t("graph.editor.noProject", "projectId 파라미터가 필요합니다.")}
      </Alert>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* 앱 톤의 상단 바 — 뒤로가기 + 타이틀 + 저장 (전체화면 페이지 공통 패턴) */}
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar variant="dense">
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            data-testid="editor-back"
            title={t("graph.editor.back", "그래프로 돌아가기")}
          >
            <ArrowBackIcon />
          </IconButton>
          <AccountTreeIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {t("graph.editor.title", "그래프 테스트 케이스 편집")}
          </Typography>
          <Box sx={{ flex: 1 }} />
          {savedAt && (
            <Typography variant="caption" color="success.main" sx={{ mr: 2 }}>
              {t("graph.editor.saved", "저장됨")} {savedAt.toLocaleTimeString()}
            </Typography>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={<SaveIcon />}
            onClick={save}
            disabled={saving || steps.length === 0}
          >
            {t("graph.editor.save", "저장")}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t(
            "graph.editor.hint",
            "저장하면 그래프가 원본이 되고, 기존 스텝 표는 읽기 전용 미러로 자동 갱신됩니다.",
          )}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <GraphCanvas graph={previewGraph} layout="dagre" height={220} />

            <Paper sx={{ mt: 2, p: 2 }}>
              <Stack spacing={1.5}>
                {steps.map((step, index) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                  >
                    <Typography
                      sx={{ width: 28, pt: 1 }}
                      color="text.secondary"
                    >
                      {index + 1}
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      label={t("graph.editor.action", "수행 절차")}
                      value={step.description}
                      onChange={(e) =>
                        mutateStep(index, "description", e.target.value)
                      }
                    />
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      label={t("graph.editor.expected", "기대 결과")}
                      value={step.expectedResult}
                      onChange={(e) =>
                        mutateStep(index, "expectedResult", e.target.value)
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={() => moveStep(index, -1)}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => moveStep(index, 1)}>
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeStep(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => addBranch(index)}
                      title={t("graph.editor.addBranch", "분기 추가")}
                      data-testid={`add-branch-${index}`}
                    >
                      <CallSplitIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>

              {/* 분기 편집 — 분기가 있는 스텝만 표시 */}
              {steps.some((s) => s.branches?.length) && (
                <Box sx={{ mt: 2 }}>
                  {steps.map((step, index) =>
                    step.branches?.length ? (
                      <Box
                        key={`br-${index}`}
                        sx={{
                          ml: 4,
                          mb: 1,
                          p: 1,
                          borderLeft: "3px solid",
                          borderColor: "warning.main",
                          bgcolor: "action.hover",
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: 12,
                            mb: 0.5,
                            color: "text.secondary",
                          }}
                        >
                          {t("graph.editor.branchOf", "스텝")} {index + 1}{" "}
                          {t("graph.editor.branches", "분기")}
                        </Box>
                        {step.branches.map((branch, bi) => (
                          <Box
                            key={bi}
                            sx={{
                              display: "flex",
                              gap: 1,
                              alignItems: "center",
                              mb: 0.5,
                            }}
                          >
                            <TextField
                              size="small"
                              sx={{ width: 180 }}
                              label={t("graph.editor.branchLabel", "조건 라벨")}
                              value={branch.label}
                              onChange={(e) =>
                                mutateBranch(index, bi, "label", e.target.value)
                              }
                            />
                            <FormControl size="small" sx={{ width: 140 }}>
                              <InputLabel>
                                {t("graph.editor.branchTo", "이동할 스텝")}
                              </InputLabel>
                              <Select
                                value={branch.to}
                                label={t(
                                  "graph.editor.branchTo",
                                  "이동할 스텝",
                                )}
                                onChange={(e) =>
                                  mutateBranch(index, bi, "to", e.target.value)
                                }
                              >
                                {steps.map((_, ti) => (
                                  <MenuItem key={ti} value={ti + 1}>
                                    {t("graph.editor.stepN", "스텝")} {ti + 1}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeBranch(index, bi)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    ) : null,
                  )}
                </Box>
              )}

              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <Button size="small" startIcon={<AddIcon />} onClick={addStep}>
                  {t("graph.editor.addStep", "스텝 추가")}
                </Button>
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default TestCaseGraphEditor;
