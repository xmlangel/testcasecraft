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
} from "@mui/material";
import { PlayArrow as PlayArrowIcon, Check as CheckIcon } from "@mui/icons-material";
import { useAppContext } from "../context/AppContext";
import { ExecutionStatus, TestResult } from "../models/testExecution";
import TestResultForm from "./TestResultForm";
import StatusInfoItem from "./StatusInfoItem";
import { TreeView, TreeItem } from '@mui/x-tree-view';
import FolderIcon from "@mui/icons-material/Folder";
import DescriptionIcon from "@mui/icons-material/Description";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

// 8자마다 줄바꿈을 삽입하는 함수
function wrapName(name, max = 8) {
  if (!name) return '';
  return name.replace(new RegExp(`(.{${max}})`, 'g'), '$1\n');
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

  // 트리 데이터 변환
  const treeData = useMemo(() => {
    if (!selectedPlan || !testCases) return [];
    // 트리 구조로 변환
    const testCaseMap = {};
    testCases.forEach(tc => { testCaseMap[tc.id] = { ...tc, children: [] }; });
    testCases.forEach(tc => {
      if (tc.parentId && testCaseMap[tc.parentId]) {
        testCaseMap[tc.parentId].children.push(testCaseMap[tc.id]);
      }
    });
    // 플랜에 포함된 테스트케이스/폴더만 필터
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
    // 루트 노드들만 반환
    return testCases
      .filter(tc => !tc.parentId)
      .map(tc => filterTree(testCaseMap[tc.id]))
      .filter(Boolean);
  }, [selectedPlan, testCases]);

  // 트리 렌더링
  const renderTree = (nodes) => {
    return nodes.map(node => {
      const isFolder = node.type === "folder";
      return (
        <TreeItem
          key={node.id}
          nodeId={node.id}
          label={
            <Box sx={{ display: "flex", alignItems: "center", minHeight: 40, width: '100%' }}>
              {/* 폴더 */}
              <Box sx={{
                width: 180,
                flexShrink: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'pre-line',
                display: 'flex',
                alignItems: 'center'
              }}>
                {isFolder ? <FolderIcon sx={{ mr: 1 }} /> : null}
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {isFolder ? wrapName(node.name) : ""}
                </Typography>
              </Box>
              {/* 테스트케이스 */}
              <Box sx={{
                width: 260,
                flexShrink: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'pre-line',
                display: 'flex',
                alignItems: 'center'
              }}>
                {!isFolder ? <DescriptionIcon sx={{ mr: 1 }} /> : null}
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {!isFolder ? wrapName(node.name) : ""}
                </Typography>
              </Box>
              {/* 결과 */}
              <Box sx={{ width: 100, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {!isFolder
                  ? (execution?.results?.find(r => r.testCaseId === node.id)?.result || "-")
                  : ""}
              </Box>
              {/* 비고 */}
              <Box sx={{ width: 220, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {!isFolder
                  ? (execution?.results?.find(r => r.testCaseId === node.id)?.notes || "")
                  : ""}
              </Box>
              {/* 입력 */}
              <Box sx={{ width: 80, flexShrink: 0 }}>
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
            ? renderTree(node.children)
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
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Paper variant="outlined" sx={{ p: 0, background: "#fff" }}>
                <Box sx={{ display: "flex", px: 2, py: 1, borderBottom: "1px solid #eee", background: "#f7f7f7" }}>
                  <Box sx={{ width: 180, flexShrink: 0 }}>폴더</Box>
                  <Box sx={{ width: 260, flexShrink: 0 }}>테스트케이스</Box>
                  <Box sx={{ width: 100, flexShrink: 0 }}>결과</Box>
                  <Box sx={{ width: 220, flexShrink: 0 }}>비고</Box>
                  <Box sx={{ width: 80, flexShrink: 0 }}>입력</Box>
                </Box>
                <TreeView
                  defaultCollapseIcon={<span>-</span>}
                  defaultExpandIcon={<span>+</span>}
                  sx={{ flexGrow: 1, overflowY: "auto", minHeight: 200, maxHeight: 500, px: 2, py: 1 }}
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
