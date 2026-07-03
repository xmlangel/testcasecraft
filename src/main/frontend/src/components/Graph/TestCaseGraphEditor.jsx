// src/components/Graph/TestCaseGraphEditor.jsx
// 그래프 테스트 케이스 편집기 (MVP) — StepNode 체인을 편집하고 저장한다.
// 저장 시 백엔드가 서브그래프를 재작성하고 관계형 미러를 즉시 재생성한다 (§5-C).
// 상단에 Cytoscape 미리보기(계층 레이아웃), 하단에 스텝 편집 테이블.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SaveIcon from "@mui/icons-material/Save";
import { useAppContext } from "../../context/AppContext";
import { useI18n } from "../../context/I18nContext";
import { getGraphSteps, updateGraphSteps } from "../../services/graphApi";
import GraphCanvas from "./GraphCanvas";

// 그래프 응답(StepNode 정점)을 편집 가능한 스텝 배열로 변환
const graphToSteps = (graph) =>
  (graph?.nodes || [])
    .filter((n) => n.label === "StepNode")
    .map((n) => ({
      order: Number(n.properties?.order ?? 0),
      description: n.properties?.action || "",
      expectedResult: n.properties?.expected || "",
    }))
    .sort((a, b) => a.order - b.order);

const TestCaseGraphEditor = () => {
  const { testCaseId } = useParams();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
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
    setSteps((prev) => [...prev, { description: "", expectedResult: "" }]);

  const removeStep = (index) =>
    setSteps((prev) => prev.filter((_, i) => i !== index));

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
    const edges = steps.map((_, i) => ({
      id: `e${i}`,
      label: i === 0 ? "STARTS_AT" : "NEXT",
      source: i === 0 ? "root" : `s${i}`,
      target: `s${i + 1}`,
    }));
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        {t("graph.editor.title", "그래프 테스트 케이스 편집")}
      </Typography>
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
                  <Typography sx={{ width: 28, pt: 1 }} color="text.secondary">
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
                  <IconButton size="small" onClick={() => moveStep(index, -1)}>
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
                </Box>
              ))}
            </Stack>

            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button size="small" startIcon={<AddIcon />} onClick={addStep}>
                {t("graph.editor.addStep", "스텝 추가")}
              </Button>
              <Box sx={{ flex: 1 }} />
              {savedAt && (
                <Typography
                  variant="caption"
                  sx={{ alignSelf: "center" }}
                  color="success.main"
                >
                  {t("graph.editor.saved", "저장됨")}{" "}
                  {savedAt.toLocaleTimeString()}
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
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default TestCaseGraphEditor;
