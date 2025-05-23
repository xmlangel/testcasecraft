// src/components/TestExecutionForm.js

import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  LinearProgress,
  Chip,
} from "@mui/material";
import { PlayArrow as PlayArrowIcon, Check as CheckIcon } from "@mui/icons-material";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";
import { useAppContext } from "../context/AppContext";
import { ExecutionStatus, TestResult } from "../models/testExecution";
import TestResultForm from "./TestResultForm";
import StatusInfoItem from "./StatusInfoItem";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// 트리 줄맞춤을 위해 인덴트(깊이)만 폴더 컬럼에 적용
const INDENT_SIZE = 24; // px, MUI TreeView 기본 인덴트와 동일

function wrapName(name, max = 8) {
  if (!name) return "";
  return name.replace(new RegExp(`(.{${max}})`, "g"), "$1\n");
}

function getResultIcon(result) {
  switch (result) {
    case TestResult.PASS:
      return <CheckCircleIcon sx={{ color: "#43a047" }} titleAccess="PASS" />;
    case TestResult.FAIL:
      return <CancelIcon sx={{ color: "#e53935" }} titleAccess="FAIL" />;
    case TestResult.BLOCKED:
      return <BlockIcon sx={{ color: "#fbc02d" }} titleAccess="BLOCKED" />;
    case TestResult.NOTRUN:
    default:
      return <HourglassEmptyIcon sx={{ color: "#bdbdbd" }} titleAccess="NOTRUN" />;
  }
}

const TestExecutionForm = ({ executionId, onCancel, onSave }) => {
  const {
    testPlans,
    getTestCase,
    getTestPlan,
    fetchTestExecutions,
    addOrUpdateTestExecution,
    startTestExecution,
    completeTestExecution,
    user,
    activeProject,
    testCases,
  } = useAppContext();

  const [formOpen, setFormOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [execution, setExecution] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isResultFormOpen, setIsResultFormOpen] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [saveError, setSaveError] = useState();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchExecution = async () => {
      if (!executionId) {
        setExecution({
          id: null,
          name: "",
          testPlanId: "",
          projectId: activeProject?.id,
          description: "",
          status: ExecutionStatus.NOTSTARTED,
          startDate: null,
          endDate: null,
          results: [],
          createdAt: null,
          updatedAt: null,
        });
        setSelectedPlan(null);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const res = await fetch(
          `${API_BASE_URL}/api/test-executions/${executionId}`,
          {
            headers: { Authorization: token ? `Bearer ${token}` : undefined },
          }
        );
        if (!res.ok) throw new Error(".");
        const data = await res.json();
        setExecution(data);
        setSelectedPlan(getTestPlan(data.testPlanId));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExecution();
    // eslint-disable-next-line
  }, [executionId, getTestPlan, activeProject]);

  const handlePlanChange = useCallback(
    (event) => {
      const planId = event.target.value;
      const plan = getTestPlan(planId);
      setSelectedPlan(plan);
      setExecution((prev) => ({
        ...prev,
        testPlanId: planId,
        results: [],
      }));
    },
    [getTestPlan]
  );

  const handleChange = useCallback(
    (field) => (event) => {
      setExecution((prev) => ({
        ...prev,
        [field]: event.target.value,
        projectId: prev.projectId,
      }));
    },
    []
  );

  const handleSaveOrUpdate = async () => {
    if (!execution.name || !execution.testPlanId || !execution.projectId) return;
    setSaving(true);
    try {
      const saved = await addOrUpdateTestExecution(execution);
      setExecution(saved);
      if (onSave) onSave(saved.id);
      setFormOpen(true);
      if (fetchTestExecutions) fetchTestExecutions();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStartExecution = async () => {
    if (!execution?.id || execution.status !== ExecutionStatus.NOTSTARTED) return;
    setSaving(true);
    try {
      const updated = await startTestExecution(execution.id);
      setExecution(updated);
      if (fetchTestExecutions) fetchTestExecutions();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteExecution = async () => {
    if (!execution?.id || execution.status !== ExecutionStatus.INPROGRESS) return;
    setSaving(true);
    try {
      const updated = await completeTestExecution(execution.id);
      setExecution(updated);
      if (fetchTestExecutions) fetchTestExecutions();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenResultForm = useCallback((testCaseId) => {
    setSelectedTestCaseId(testCaseId);
    setIsResultFormOpen(true);
  }, []);

  const handleCloseResultForm = useCallback(() => {
    setIsResultFormOpen(false);
    setSelectedTestCaseId(null);
  }, []);

  const handleSaveResult = useCallback(
    async (result, notes) => {
      if (!execution?.id || !selectedTestCaseId) return;
      setSaving(true);
      try {
        const token = localStorage.getItem("jwtToken");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(
          `${API_BASE_URL}/api/test-executions/${execution.id}`,
          {
            method: "GET",
            headers,
            credentials: "include",
          }
        );
        let updated;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          updated = await res.json();
        } else {
          updated = null;
        }
        if (!res.ok) {
          const errMsg = updated?.message;
          throw new Error(errMsg);
        }
        setExecution(updated);
        if (fetchTestExecutions) fetchTestExecutions();
      } catch (err) {
        setSaveError(err.message);
      } finally {
        setSaving(false);
      }
      handleCloseResultForm();
    },
    [execution, selectedTestCaseId, fetchTestExecutions, handleCloseResultForm]
  );

  const canEditBasicInfo = execution?.status === ExecutionStatus.NOTSTARTED;
  const canStartExecution = execution?.status === ExecutionStatus.NOTSTARTED && execution?.testPlanId;
  const canCompleteExecution = execution?.status === ExecutionStatus.INPROGRESS;
  const canEnterResults = execution?.status === ExecutionStatus.INPROGRESS;

  // 폴더 제외, 실제 테스트케이스만 카운트 및 진행률 계산
  const testCaseIds = useMemo(() => {
    if (!selectedPlan || !testCases) return [];
    return selectedPlan.testCaseIds.filter(
      id => {
        const tc = testCases.find(tc => tc.id === id);
        return tc && tc.type === "testcase";
      }
    );
  }, [selectedPlan, testCases]);

  const statusCounts = useMemo(() => {
    const resultsMap = {};
    (execution?.results || []).forEach(r => {
      resultsMap[r.testCaseId] = r.result;
    });
    let counts = { PASS: 0, FAIL: 0, NOTRUN: 0, BLOCKED: 0, total: testCaseIds.length };
    testCaseIds.forEach(id => {
      const res = resultsMap[id] || TestResult.NOTRUN;
      if (res === TestResult.PASS) counts.PASS += 1;
      else if (res === TestResult.FAIL) counts.FAIL += 1;
      else if (res === TestResult.BLOCKED) counts.BLOCKED += 1;
      else counts.NOTRUN += 1;
    });
    return counts;
  }, [execution, testCaseIds]);

  const progress = useMemo(() => {
    if (!statusCounts.total) return 0;
    const completed = statusCounts.PASS + statusCounts.FAIL + statusCounts.BLOCKED;
    return Math.round((completed / statusCounts.total) * 100);
  }, [statusCounts]);

  // 트리 데이터 변환
  const treeData = useMemo(() => {
    if (!selectedPlan || !testCases) return [];
    const testCaseMap = {};
    testCases.forEach(tc => { testCaseMap[tc.id] = { ...tc, children: [] }; });
    testCases.forEach(tc => {
      if (tc.parentId && testCaseMap[tc.parentId]) {
        testCaseMap[tc.parentId].children.push(testCaseMap[tc.id]);
      }
    });
    const includedIds = new Set(selectedPlan.testCaseIds);
    const filterTree = (node) => {
      if (node.type === "folder") {
        const filteredChildren = node.children.map(filterTree).filter(Boolean);
        if (filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      }
      return includedIds.has(node.id) ? node : null;
    };
    return testCases
      .filter(tc => !tc.parentId)
      .map(tc => filterTree(testCaseMap[tc.id]))
      .filter(Boolean);
  }, [selectedPlan, testCases]);

  // 트리 렌더링: 인덴트는 폴더 컬럼에서만 적용
  const renderTree = (nodes, depth = 0) => {
    return nodes.map(node => {
      const isFolder = node.type === "folder";
      const resultObj = execution?.results?.find(r => r.testCaseId === node.id);
      const result = resultObj?.result || TestResult.NOTRUN;
      const notes = resultObj?.notes || "";
      return (
        <TreeItem
          key={node.id}
          nodeId={node.id}
          label={
            <Box sx={{ display: "flex", alignItems: "center", minHeight: 40, width: "100%" }}>
              {/* 폴더 컬럼: depth에 따라 padding-left 적용 */}
              <Box
                sx={{
                  width: 200,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  pl: `${depth * INDENT_SIZE}px`,
                  boxSizing: "border-box",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "pre-line",
                }}
              >
                {isFolder ? <FolderIcon sx={{ mr: 1 }} /> : null}
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {isFolder ? wrapName(node.name) : ""}
                </Typography>
              </Box>
              {/* 테스트케이스 컬럼 */}
              <Box
                sx={{
                  width: 300,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "pre-line",
                }}
              >
                {!isFolder ? <DescriptionIcon sx={{ mr: 1 }} /> : null}
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {!isFolder ? wrapName(node.name) : ""}
                </Typography>
              </Box>
              {/* 결과 */}
              <Box
                sx={{
                  width: 50,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {!isFolder ? getResultIcon(result) : ""}
              </Box>
              {/* 비고 */}
              <Box
                sx={{
                  width: 400,
                  flexShrink: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {!isFolder ? notes : ""}
              </Box>
              {/* 입력 */}
              <Box sx={{ width: 100, flexShrink: 0 }}>
                {!isFolder ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenResultForm(node.id)}
                    disabled={!canEnterResults}
                  >
                    입력
                  </Button>
                ) : null}
              </Box>
            </Box>
          }
        >
          {isFolder && node.children && node.children.length > 0
            ? renderTree(node.children, depth + 1)
            : null}
        </TreeItem>
      );
    });
  };

  if (!formOpen) return null;

  return (
    <Dialog open={formOpen} onClose={onCancel} maxWidth="lg" fullWidth aria-labelledby="execution-dialog">
      <DialogTitle id="execution-dialog">{executionId ? "테스트 실행 상세" : "테스트 실행 생성"}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="ID"
                value={execution?.id || ""}
                fullWidth
                margin="normal"
                variant="outlined"
                disabled
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="프로젝트"
                value={activeProject?.name || ""}
                fullWidth
                margin="normal"
                variant="outlined"
                disabled
                inputProps={{ readOnly: true, "aria-label": "프로젝트" }}
              />
              <TextField
                label="테스트 실행명"
                value={execution?.name || ""}
                onChange={handleChange("name")}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                disabled={!canEditBasicInfo}
                inputProps={{ "aria-label": "테스트 실행명" }}
              />
              <FormControl fullWidth margin="normal" disabled={!canEditBasicInfo}>
                <InputLabel id="test-plan-label">테스트플랜</InputLabel>
                <Select
                  labelId="test-plan-label"
                  value={execution?.testPlanId || ""}
                  onChange={handlePlanChange}
                  label="테스트플랜"
                  aria-label="테스트플랜"
                >
                  <MenuItem value="">
                    <em>선택</em>
                  </MenuItem>
                  {testPlans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="설명"
                value={execution?.description || ""}
                onChange={handleChange("description")}
                fullWidth
                margin="normal"
                variant="outlined"
                multiline
                rows={3}
                disabled={!canEditBasicInfo}
                inputProps={{ "aria-label": "설명" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <Typography variant="subtitle1" gutterBottom>
                  상태 정보
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <StatusInfoItem label="상태" value={execution?.status} />
                  <StatusInfoItem label="시작일" value={execution?.startDate ? new Date(execution.startDate).toLocaleString() : "-"} />
                  <StatusInfoItem label="종료일" value={execution?.endDate ? new Date(execution.endDate).toLocaleString() : "-"} />
                </Box>
                {/* 상태별 카운트 및 진행상태 표시 */}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
                  <Chip icon={<CheckCircleIcon sx={{ color: "#43a047" }} />} label={`Pass: ${statusCounts.PASS}`} sx={{ bgcolor: "#e8f5e9" }} />
                  <Chip icon={<CancelIcon sx={{ color: "#e53935" }} />} label={`Fail: ${statusCounts.FAIL}`} sx={{ bgcolor: "#ffebee" }} />
                  <Chip icon={<HourglassEmptyIcon sx={{ color: "#bdbdbd" }} />} label={`NotRun: ${statusCounts.NOTRUN}`} sx={{ bgcolor: "#f5f5f5" }} />
                  <Chip icon={<BlockIcon sx={{ color: "#fbc02d" }} />} label={`Blocked: ${statusCounts.BLOCKED}`} sx={{ bgcolor: "#fffde7" }} />
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    전체: {statusCounts.total}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 70 }}>
                    진행률
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ flex: 1, height: 10, borderRadius: 4 }}
                  />
                  <Typography variant="body2" sx={{ minWidth: 40, ml: 1 }}>
                    {progress}%
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Paper variant="outlined" sx={{ p: 0, background: "#fff" }}>
                <Box sx={{ display: "flex", px: 2, py: 1, borderBottom: "1px solid #eee", background: "#f7f7f7" }}>
                  <Box sx={{ width: 200, flexShrink: 0 }}>폴더</Box>
                  <Box sx={{ width: 300, flexShrink: 0 }}>테스트케이스</Box>
                  <Box sx={{ width: 50, flexShrink: 0 }}>결과</Box>
                  <Box sx={{ width: 400, flexShrink: 0 }}>비고</Box>
                  <Box sx={{ width: 100, flexShrink: 0 }}>입력</Box>
                </Box>
                <TreeView
                  defaultCollapseIcon={<span>-</span>}
                  defaultExpandIcon={<span>+</span>}
                  sx={{
                    flexGrow: 1,
                    overflowY: "auto",
                    minHeight: 200,
                    maxHeight: 500,
                    px: 2,
                    py: 1,
                  }}
                >
                  {renderTree(treeData)}
                </TreeView>
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} aria-label="취소">
          취소
        </Button>
        {canEditBasicInfo && (
          <Button
            onClick={handleSaveOrUpdate}
            variant="contained"
            color="primary"
            disabled={!execution?.name || !execution?.testPlanId || !execution?.projectId || saving}
            aria-label="저장"
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            저장
          </Button>
        )}
        {canStartExecution && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleStartExecution}
            disabled={saving}
            aria-label="실행시작"
          >
            실행시작
          </Button>
        )}
        {canCompleteExecution && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={handleCompleteExecution}
            disabled={saving}
            aria-label="실행완료"
          >
            실행완료
          </Button>
        )}
      </DialogActions>
      <TestResultForm
        open={isResultFormOpen}
        testCaseId={selectedTestCaseId}
        executionId={execution?.id}
        currentResult={execution?.results?.find((r) => r.testCaseId === selectedTestCaseId) || {}}
        onClose={handleCloseResultForm}
        onSave={handleSaveResult}
      />
      <Snackbar open={!!saveError} autoHideDuration={6000} onClose={() => setSaveError(undefined)}>
        <Alert severity="error" onClose={() => setSaveError(undefined)}>
          {saveError}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

TestExecutionForm.propTypes = {
  executionId: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default TestExecutionForm;
