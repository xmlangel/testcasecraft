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
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { PlayArrow as PlayArrowIcon, Check as CheckIcon } from "@mui/icons-material";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BlockIcon from "@mui/icons-material/Block";
import { useAppContext } from "../context/AppContext";
import { ExecutionStatus, TestResult } from "../models/testExecution";
import TestResultForm from "./TestResultForm";
import StatusInfoItem from "./StatusInfoItem";
import { calculateExecutionProgress } from '../utils/progressUtils';
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

function wrapName(name, max = 100) {
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
    case TestResult.SKIPPED:
      return (
        <DoubleArrowIcon sx={{ color: "#aaaaaa" }} titleAccess="SKIPPED" />
      );
    case TestResult.NOTRUN:
    default:
      return <HourglassEmptyIcon sx={{ color: "#bdbdbd" }} titleAccess="NOTRUN" />;
  }
}

const HEADER_HEIGHT = 44;

const responsiveColumnSx = [
  { flex: "0 0 70px", minWidth: 60, maxWidth: 100 },
  { flex: "1 1 180px", minWidth: 100 },
  { flex: "0 0 46px", minWidth: 40, maxWidth: 60 },
  { flex: "0 0 110px", minWidth: 80, maxWidth: 140 },
  { flex: "0 0 90px", minWidth: 60, maxWidth: 120 },
  { flex: "1 1 120px", minWidth: 80, maxWidth: 200 },
  { flex: "0 0 70px", minWidth: 60, maxWidth: 100 },
];

// 값이 없을 때 직관적으로 보여주는 텍스트
const getDisplayValue = (value, type = "") => {
  if (value && typeof value === "string" && value.trim() !== "") return value;
  switch (type) {
    case "executedAt":
      return <span style={{ color: "#bdbdbd" }}>실행 기록 없음</span>;
    case "executedBy":
      return <span style={{ color: "#bdbdbd" }}>실행자 없음</span>;
    case "notes":
      return <span style={{ color: "#bdbdbd" }}>비고 없음</span>;
    case "startDate":
      return <span style={{ color: "#bdbdbd" }}>시작 기록 없음</span>;
    case "endDate":
      return <span style={{ color: "#bdbdbd" }}>종료 기록 없음</span>;
    default:
      return <span style={{ color: "#bdbdbd" }}>없음</span>;
  }
};

function formatDateTime(dateString) {
  if (!dateString) return getDisplayValue("", "executedAt");
  const date = new Date(dateString);
  if (isNaN(date)) return getDisplayValue("", "executedAt");
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [execution, setExecution] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isResultFormOpen, setIsResultFormOpen] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [saveError, setSaveError] = useState();
  const [saving, setSaving] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

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

  // 목록으로 이동
  const handleGoToList = () => {
    navigate("/executions");
  };

  const canEditBasicInfo = execution?.status === ExecutionStatus.NOTSTARTED;
  const canStartExecution = execution?.status === ExecutionStatus.NOTSTARTED && execution?.testPlanId;
  const canCompleteExecution = execution?.status === ExecutionStatus.INPROGRESS;
  const canEnterResults = execution?.status === ExecutionStatus.INPROGRESS;

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
    return calculateExecutionProgress(execution, selectedPlan, testCases);
  }, [execution, selectedPlan, testCases]);

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

  // 헤더 컬럼 가운데 정렬 및 스타일 개선
  const renderColumns = (isHeader = false) => [
    <Box
      key="folder"
      sx={{
        ...responsiveColumnSx[0],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontWeight: isHeader ? "bold" : undefined,
        fontSize: isHeader ? "1.08rem" : undefined,
        color: isHeader ? "#1976d2" : undefined,
      }}
    >
      {isHeader ? "폴더" : null}
    </Box>,
    <Box
      key="testcase"
      sx={{
        ...responsiveColumnSx[1],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontWeight: isHeader ? "bold" : undefined,
        fontSize: isHeader ? "1.08rem" : undefined,
        color: isHeader ? "#1976d2" : undefined,
      }}
    >
      {isHeader ? "테스트케이스" : null}
    </Box>,
    <Box
      key="result"
      sx={{
        ...responsiveColumnSx[2],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontWeight: isHeader ? "bold" : undefined,
        fontSize: isHeader ? "1.08rem" : undefined,
        color: isHeader ? "#1976d2" : undefined,
      }}
    >
      {isHeader ? "결과" : null}
    </Box>,
    <Box
      key="executedAt"
      sx={{
        ...responsiveColumnSx[3],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontWeight: isHeader ? "bold" : undefined,
        fontSize: isHeader ? "1.08rem" : undefined,
        color: isHeader ? "#1976d2" : undefined,
      }}
    >
      {isHeader ? "실행시간" : null}
    </Box>,
    <Box
      key="executedBy"
      sx={{
        ...responsiveColumnSx[4],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontWeight: isHeader ? "bold" : undefined,
        fontSize: isHeader ? "1.08rem" : undefined,
        color: isHeader ? "#1976d2" : undefined,
      }}
    >
      {isHeader ? "실행한사람" : null}
    </Box>,
    <Box
      key="notes"
      sx={{
        ...responsiveColumnSx[5],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontWeight: isHeader ? "bold" : undefined,
        fontSize: isHeader ? "1.08rem" : undefined,
        color: isHeader ? "#1976d2" : undefined,
      }}
    >
      {isHeader ? "비고" : null}
    </Box>,
    <Box
      key="input"
      sx={{
        ...responsiveColumnSx[6],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontWeight: isHeader ? "bold" : undefined,
        fontSize: isHeader ? "1.08rem" : undefined,
        color: isHeader ? "#1976d2" : undefined,
      }}
    >
      {isHeader ? "입력" : null}
    </Box>,
  ];

  // 트리 타이틀 강조 및 가운데 정렬
  const renderTree = (nodes) =>
    nodes.map(node => {
      const isFolder = node.type === "folder";
      const resultObj = execution?.results?.find(r => r.testCaseId === node.id);
      const result = resultObj?.result || TestResult.NOTRUN;
      const notes = resultObj?.notes;
      const executedBy = resultObj?.executedBy;
      const executedAt = resultObj?.executedAt;

      let titleStyle = {
        fontWeight: "bold",
        textAlign: "center",
        width: "100%",
        display: "block",
        whiteSpace: "pre-line",
        overflow: "hidden",
        textOverflow: "ellipsis",
      };
      if (isFolder) {
        titleStyle.color = "#424242";
      } else {
        titleStyle.color = "#1565c0";
      }

      return (
        <TreeItem
          key={node.id}
          nodeId={node.id}
          label={
            <Box sx={{ display: "flex", width: "100%" }}>
              <Box sx={{ ...responsiveColumnSx[0], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isFolder ? <FolderIcon sx={{ mr: 1 }} /> : null}
                <Typography variant="body2" sx={titleStyle}>
                  {isFolder ? wrapName(node.name) : ""}
                </Typography>
              </Box>
              <Box sx={{ ...responsiveColumnSx[1], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? <DescriptionIcon sx={{ mr: 1, color: "#1565c0" }} /> : null}
                <Typography variant="body2" sx={titleStyle}>
                  {!isFolder ? wrapName(node.name) : ""}
                </Typography>
              </Box>
              <Box sx={{ ...responsiveColumnSx[2], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? getResultIcon(result) : ""}
              </Box>
              <Box sx={{ ...responsiveColumnSx[3], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                  <Typography variant="body2" sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.5,
                    textAlign: "center",
                  }}>
                    {executedAt ? formatDateTime(executedAt) : getDisplayValue("", "executedAt")}
                  </Typography>
                ) : ""}
              </Box>
              <Box sx={{ ...responsiveColumnSx[4], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                  <Typography variant="body2" sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.5,
                    color: executedBy ? undefined : "#bdbdbd",
                    textAlign: "center",
                  }}>
                    {executedBy ? executedBy : getDisplayValue("", "executedBy")}
                  </Typography>
                ) : ""}
              </Box>
              <Box sx={{ ...responsiveColumnSx[5], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                  <Typography variant="body2" sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.5,
                    color: notes ? undefined : "#bdbdbd",
                    textAlign: "center",
                  }}>
                    {notes ? notes : getDisplayValue("", "notes")}
                  </Typography>
                ) : ""}
              </Box>
              <Box sx={{ ...responsiveColumnSx[6], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenResultForm(node.id)}
                    disabled={!canEnterResults}
                  >
                    결과
                  </Button>
                ) : null}
              </Box>
            </Box>
          }
        >
          {isFolder && node.children && node.children.length > 0
            ? renderTree(node.children)
            : null}
        </TreeItem>
      );
    });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4, minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        width: "100vw",
        bgcolor: "#f7f9fa",
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 4 },
        boxSizing: "border-box",
        overflowX: "auto",
      }}
    >
      <Box
        sx={{
          maxWidth: "1400px",
          mx: "auto",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
          p: { xs: 1, sm: 2, md: 4 },
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1
        }}>
          <Typography variant="h5" sx={{ flex: 1, minWidth: 200, fontWeight: "bold", color: "#1976d2" }}>
            {executionId
              ? <>테스트 실행 상세 <span style={{ fontWeight: 400, color: "#333" }}>({execution?.name || "제목 없음"})</span></>
              : "테스트 실행 생성"}
          </Typography>
          {/* 목록으로 이동 버튼 추가 */}
          <Button onClick={handleGoToList} sx={{ mr: 1 }}>
            목록으로
          </Button>
          <Button onClick={onCancel} sx={{ mr: 1 }}>
            취소
          </Button>
          {canEditBasicInfo && (
            <Button
              onClick={handleSaveOrUpdate}
              variant="contained"
              color="primary"
              disabled={!execution?.name || !execution?.testPlanId || !execution?.projectId || saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
            >
              저장
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
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
                <StatusInfoItem
                  label="시작일"
                  value={execution?.startDate
                    ? new Date(execution.startDate).toLocaleString()
                    : getDisplayValue("", "startDate")}
                />
                <StatusInfoItem
                  label="종료일"
                  value={execution?.endDate
                    ? new Date(execution.endDate).toLocaleString()
                    : getDisplayValue("", "endDate")}
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
                <Chip icon={<CheckCircleIcon sx={{ color: "#43a047" }} />} label={`Pass: ${statusCounts.PASS}`} sx={{ bgcolor: "#e8f5e9" }} />
                <Chip icon={<CancelIcon sx={{ color: "#e53935" }} />} label={`Fail: ${statusCounts.FAIL}`} sx={{ bgcolor: "#ffebee" }} />
                <Chip icon={<HourglassEmptyIcon sx={{ color: "#bdbdbd" }} />} label={`NotRun: ${statusCounts.NOTRUN}`} sx={{ bgcolor: "#f5f5f5" }} />
                <Chip icon={<BlockIcon sx={{ color: "#fbc02d" }} />} label={`Blocked: ${statusCounts.BLOCKED}`} sx={{ bgcolor: "#fffde7" }} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  전체: {statusCounts.total}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{ minWidth: 70 }}>
                  진행률
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ flex: 1, height: 10, borderRadius: 4, minWidth: 80 }}
                />
                <Typography variant="body2" sx={{ minWidth: 40, ml: 1 }}>
                  {progress}%
                </Typography>
                {canStartExecution && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleStartExecution}
                    disabled={saving}
                    sx={{ ml: 2 }}
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
                    sx={{ ml: 2 }}
                  >
                    실행완료
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Paper
              variant="outlined"
              sx={{
                p: 0,
                background: "#fff",
                width: "100%",
                overflow: "hidden",
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* 헤더 */}
              <Box sx={{ display: "flex", width: "100%" }}>
                {renderColumns(true)}
              </Box>
              <Box sx={{
                flex: 1,
                width: "100%",
                minHeight: 200,
                maxHeight: 600,
                overflowY: "auto",
                overflowX: "hidden",
              }}>
                <TreeView
                  defaultCollapseIcon={<span>-</span>}
                  defaultExpandIcon={<span>+</span>}
                  sx={{
                    flexGrow: 1,
                    px: 0,
                    py: 0,
                    "& .MuiTreeItem-content": {
                      paddingLeft: "0 !important",
                    },
                    "& .MuiTreeItem-group": {
                      marginLeft: 0,
                      paddingLeft: 0,
                    },
                  }}
                >
                  {renderTree(treeData)}
                </TreeView>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
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
    </Box>
  );
};

TestExecutionForm.propTypes = {
  executionId: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default TestExecutionForm;
