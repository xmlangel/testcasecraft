// src/components/TestExecutionForm.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,  Button,  TextField, Typography,  FormControl,  InputLabel,   Select,   MenuItem,   Grid,   Paper,   Divider,   CircularProgress,   Alert,   Snackbar,  LinearProgress,   Chip,  useTheme,   useMediaQuery,  Dialog,   DialogTitle,   DialogContent,   DialogActions,   Table,   TableBody,   TableCell,   TableContainer,   TableHead,   TableRow, Tooltip
} from "@mui/material";
import {
  PlayArrow as PlayArrowIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  DoubleArrow as DoubleArrowIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Block as BlockIcon,
  Visibility as VisibilityIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import { TreeView, TreeItem } from "@mui/x-tree-view";
import { useAppContext } from "../context/AppContext.jsx";
import { ExecutionStatus, TestResult } from "../models/testExecution.jsx";
import TestResultForm from "./TestResultForm.jsx";
import StatusInfoItem from "./StatusInfoItem.jsx";
import { calculateExecutionProgress } from "../utils/progressUtils.jsx";
import { useNavigate } from "react-router-dom";
import { invalidateDashboardCache } from "../services/dashboardService";

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
      return <DoubleArrowIcon sx={{ color: "#aaaaaa" }} titleAccess="SKIPPED" />;
    case TestResult.NOTRUN:
    default:
      return <HourglassEmptyIcon sx={{ color: "#bdbdbd" }} titleAccess="NOTRUN" />;
  }
}

const HEADER_HEIGHT = 44;
const responsiveColumnSx = [
  { flex: "1 1 200px", minWidth: 120 }, // folder - increased min width and removed max
  { flex: "1 1 150px", minWidth: 100 }, // testcase - made flexible and increased width
  { flex: "0 0 110px", minWidth: 80, maxWidth: 140 }, // result - kept as is for icons
  { flex: "0 0 120px", minWidth: 80, maxWidth: 150 }, // executedAt - slightly increased max
  { flex: "1 1 150px", minWidth: 100 }, // executedBy - removed max width constraint
  { flex: "1 1 120px", minWidth: 80 }, // notes - removed max width constraint
  { flex: "0 0 100px", minWidth: 80, maxWidth: 130 }, // jiraIssueKey - slightly increased
  { flex: "0 0 100px", minWidth: 80, maxWidth: 130 }, // input - slightly increased
  { flex: "0 0 100px", minWidth: 80, maxWidth: 130 }, // prevResults - slightly increased
];

function getDisplayValue(value, type) {
  if (typeof value === "string" && value.trim() !== "") return value;
  return <span style={{ color: "#bdbdbd" }}>-</span>;
}

// 전체 날짜/시간 형식 (툴팁용)
function formatDateTimeFull(dateInput) {
  if (!dateInput) return "";
  
  let date;
  
  // Spring Boot LocalDateTime이 배열로 올 경우 처리
  if (Array.isArray(dateInput)) {
    // [year, month, day, hour, minute, second, nanosecond] 형태
    const [year, month, day, hour, minute, second] = dateInput;
    date = new Date(year, month - 1, day, hour, minute, second); // month는 0-based
  } else {
    // 문자열 형태의 날짜
    date = new Date(dateInput);
  }
  
  if (isNaN(date)) return "";
  
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const sec = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
}

// 짧은 날짜 형식 (MM-DD)
function formatDateTimeShort(dateInput) {
  if (!dateInput) return getDisplayValue(undefined, "executedAt");
  
  let date;
  
  // Spring Boot LocalDateTime이 배열로 올 경우 처리
  if (Array.isArray(dateInput)) {
    const [year, month, day, hour, minute, second] = dateInput;
    date = new Date(year, month - 1, day, hour, minute, second);
  } else {
    date = new Date(dateInput);
  }
  
  if (isNaN(date)) return getDisplayValue(undefined, "executedAt");
  
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function getLatestResults(results) {
  const map = new Map();
  results?.forEach((r) => {
    const key = r.testCaseId;
    // 백엔드에서 이미 최신순으로 정렬되어 있으므로
    // 같은 testCaseId의 첫 번째 결과만 사용
    if (!map.has(key)) {
      map.set(key, r);
    }
  });
  return Array.from(map.values());
}

// 배열 형태의 날짜를 Date 객체로 변환하는 헬퍼 함수
function parseDateTime(dateInput) {
  if (!dateInput) return null;
  
  if (Array.isArray(dateInput)) {
    const [year, month, day, hour, minute, second] = dateInput;
    return new Date(year, month - 1, day, hour, minute, second);
  } else {
    return new Date(dateInput);
  }
}

// 이전 결과 다이얼로그 (API 기반)
function PreviousResultsDialog({ open, onClose, results, loading }) {
  const sortedResults = useMemo(() => {
    if (!results) return [];
    return [...results].sort(
      (a, b) => new Date(b.executedAt) - new Date(a.executedAt)
    );
  }, [results]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>이전 실행 결과</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : sortedResults.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            이전 실행 결과가 없습니다.
          </Typography>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>실행일시</TableCell>
                  <TableCell>결과</TableCell>
                  <TableCell>실행ID</TableCell>
                  <TableCell>실행명</TableCell>
                  <TableCell>실행자</TableCell>
                  <TableCell>비고</TableCell>
                  <TableCell>JIRA ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedResults.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {r.executedAt ? formatDateTimeFull(r.executedAt) : "-"}
                    </TableCell>
                    <TableCell>
                      {getResultIcon(r.result)}
                      <span style={{ marginLeft: 6 }}>{r.result}</span>
                    </TableCell>
                    <TableCell>{r.testExecutionId}</TableCell>
                    <TableCell>{r.testExecutionName}</TableCell>
                    <TableCell>{r.executedBy}</TableCell>
                    <TableCell>{r.notes || "-"}</TableCell>
                    <TableCell>
                      {r.jiraIssueKey ? (
                        <Typography
                          component="a"
                          href={`https://kwangmyung.atlassian.net/browse/${r.jiraIssueKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="body2"
                          sx={{
                            color: "#1976d2",
                            textDecoration: "none",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {r.jiraIssueKey}
                        </Typography>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}

PreviousResultsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  results: PropTypes.array,
  loading: PropTypes.bool,
};

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
    fetchTestExecutionsByTestCase,
    fetchProjectTestCases,
    api,
  } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [execution, setExecution] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isResultFormOpen, setIsResultFormOpen] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [saveError, setSaveError] = useState();
  const [saving, setSaving] = useState(false);

  // 이전 결과 API 관련 상태
  const [isPrevResultsOpen, setIsPrevResultsOpen] = useState(false);
  const [prevResults, setPrevResults] = useState([]);
  const [prevResultsLoading, setPrevResultsLoading] = useState(false);

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
        const res = await api(`${API_BASE_URL}/api/test-executions/${executionId}`);
        if (!res.ok) throw new Error("실행 정보를 불러오지 못했습니다.");
        const data = await res.json();
        setExecution(data);
        
        // 테스트 플랜 정보 조회 - testPlans가 로드되지 않은 경우 API 직접 호출
        if (data.testPlanId) {
          const plan = getTestPlan(data.testPlanId);
          if (plan) {
            setSelectedPlan(plan);
          } else {
            // testPlans에서 찾지 못한 경우 API에서 직접 조회
            try {
              const planRes = await api(`${API_BASE_URL}/api/test-plans/${data.testPlanId}`);
              if (planRes.ok) {
                const planData = await planRes.json();
                setSelectedPlan(planData);
              } else {
                console.warn(`테스트 플랜을 찾을 수 없습니다: ${data.testPlanId}`);
                setSelectedPlan(null);
              }
            } catch (planErr) {
              console.error("테스트 플랜 조회 오류:", planErr);
              setSelectedPlan(null);
            }
          }
        } else {
          setSelectedPlan(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExecution();
  }, [executionId, getTestPlan, activeProject, api]);

  // testCases가 비어있을 때 명시적으로 로드
  useEffect(() => {
    if (activeProject && activeProject.id && (!testCases || testCases.length === 0)) {
      console.log('TestCases가 비어있어서 명시적으로 로드합니다:', activeProject.id);
      fetchProjectTestCases(activeProject.id);
    }
  }, [activeProject, testCases, fetchProjectTestCases]);

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
    const projectId = execution?.testPlan?.projectId;
    if (projectId && execution?.id) {
      navigate(`/projects/${projectId}/executions/${execution.id}/testcases/${testCaseId}/result`);
    } else {
      // Fallback to dialog mode
      setSelectedTestCaseId(testCaseId);
      setIsResultFormOpen(true);
    }
  }, [navigate, execution]);

  const handleCloseResultForm = useCallback(() => {
    setIsResultFormOpen(false);
    setSelectedTestCaseId(null);
  }, []);

  // 테스트 결과 저장 후 실행 상태 업데이트 - 수정된 부분
  const handleSaveResult = useCallback(
    async (updatedExecution) => {
      // 업데이트된 실행 정보로 상태 갱신
      setExecution(updatedExecution);

      // 필요시 전체 실행 목록도 갱신
      if (fetchTestExecutions) {
        fetchTestExecutions();
      }

      // ICT-198: 대시보드 캐시 무효화
      try {
        invalidateDashboardCache();
        console.log('Dashboard cache invalidated from TestExecutionForm.');
      } catch (e) {
        console.error('Failed to invalidate dashboard cache:', e);
      }

      handleCloseResultForm();
    },
    [fetchTestExecutions, handleCloseResultForm]
  );

  const handleGoToList = () => navigate("/executions");

  // 이전결과 버튼 클릭 시 API 호출
  const handleShowPrevResults = useCallback(
    async (testCaseId) => {
      setPrevResultsLoading(true);
      setIsPrevResultsOpen(true);
      try {
        const results = await fetchTestExecutionsByTestCase(testCaseId);
        setPrevResults(results || []);
      } catch {
        setPrevResults([]);
      } finally {
        setPrevResultsLoading(false);
      }
    },
    [fetchTestExecutionsByTestCase]
  );

  const canEditBasicInfo = execution?.status === ExecutionStatus.NOTSTARTED;
  const canStartExecution = execution?.status === ExecutionStatus.NOTSTARTED && execution?.testPlanId;
  const canCompleteExecution = execution?.status === ExecutionStatus.INPROGRESS;
  const canEnterResults = execution?.status === ExecutionStatus.INPROGRESS;

  const latestResults = useMemo(() => getLatestResults(execution?.results || []), [execution?.results]);
  const resultsMap = useMemo(() => {
    const map = new Map();
    latestResults.forEach((r) => map.set(r.testCaseId, r.result));
    return map;
  }, [latestResults]);

  const testCaseIds = useMemo(() => {
    if (!selectedPlan || !testCases) return [];
    return selectedPlan.testCaseIds.filter((id) => {
      const tc = testCases.find((tc) => tc.id === id);
      return tc && tc.type === "testcase";
    });
  }, [selectedPlan, testCases]);

  const statusCounts = useMemo(() => {
    const counts = { PASS: 0, FAIL: 0, NOTRUN: 0, BLOCKED: 0, total: testCaseIds.length };
    testCaseIds.forEach((id) => {
      const res = resultsMap.get(id) || TestResult.NOTRUN;
      if (res === TestResult.PASS) counts.PASS += 1;
      else if (res === TestResult.FAIL) counts.FAIL += 1;
      else if (res === TestResult.BLOCKED) counts.BLOCKED += 1;
      else counts.NOTRUN += 1;
    });
    return counts;
  }, [resultsMap, testCaseIds]);

  const progress = useMemo(
    () => calculateExecutionProgress(execution, selectedPlan, testCases),
    [execution, selectedPlan, testCases]
  );

  // 트리 데이터 생성
  const treeData = useMemo(() => {
    if (!selectedPlan || !testCases) return [];
    const testCaseMap = {};
    testCases.forEach((tc) => {
      testCaseMap[tc.id] = { ...tc, children: [] };
    });
    testCases.forEach((tc) => {
      if (tc.parentId && testCaseMap[tc.parentId]) {
        testCaseMap[tc.parentId].children.push(testCaseMap[tc.id]);
      }
    });
    const includedIds = new Set(selectedPlan.testCaseIds);
    function filterTree(node) {
      if (node.type === "folder") {
        const filteredChildren = node.children.map(filterTree).filter(Boolean);
        if (filteredChildren.length === 0) return null;
        return { ...node, children: filteredChildren };
      }
      return includedIds.has(node.id) ? node : null;
    }
    return testCases
      .filter((tc) => !tc.parentId)
      .map((tc) => filterTree(testCaseMap[tc.id]))
      .filter(Boolean);
  }, [selectedPlan, testCases]);

  // 트리 렌더링
  const renderTree = (nodes) =>
    nodes.map((node, idx, arr) => {
      const isFolder = node.type === "folder";
      const resultObj = latestResults?.find((r) => r.testCaseId === node.id);
      const result = resultObj?.result || TestResult.NOTRUN;
      const notes = resultObj?.notes;
      const jiraIssueKey = resultObj?.jiraIssueKey;
      const executedBy = resultObj?.executedBy;
      const executedAt = resultObj?.executedAt;
      
      // 디버깅용 로그 (테스트케이스만)
      if (!isFolder && resultObj) {
        console.log(`[Debug] TestCase ${node.id}: executedAt=${executedAt}, result=${result}, jira=${jiraIssueKey}`);
      }

      let titleStyle = {
        fontWeight: "bold",
        textAlign: "center",
        width: "100%",
        display: "block",
        whiteSpace: "pre-line",
        overflow: "hidden",
        textOverflow: "ellipsis",
      };
      titleStyle.color = isFolder ? "#424242" : "#1565c0";

      return (
        <TreeItem
          key={node.id}
          nodeId={node.id}
          label={
            <Box sx={{ display: "flex", width: "100%" }}>
              {/* 0: 이름/폴더 */}
              <Box sx={{ ...responsiveColumnSx[0], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isFolder ? <FolderIcon sx={{ mr: 1 }} /> : <DescriptionIcon sx={{ mr: 1, color: "#1565c0" }} />}
                <Typography variant="body2" sx={titleStyle}>
                  {wrapName(node.name)}
                </Typography>
              </Box>
              {/* 1: 테스트케이스 */}
              <Box sx={{ ...responsiveColumnSx[1], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                  <Typography variant="body2" sx={titleStyle}>
                    {wrapName(node.name)}
                  </Typography>
                ) : null}
              </Box>
              {/* 2: 결과 */}
              <Box sx={{ ...responsiveColumnSx[2], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? getResultIcon(result) : null}
              </Box>
              {/* 3: 실행일시 */}
              <Box sx={{ ...responsiveColumnSx[3], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                  executedAt ? (
                    <Tooltip 
                      title={formatDateTimeFull(executedAt)} 
                      placement="top"
                      arrow
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          lineHeight: 1.5,
                          textAlign: "center",
                          cursor: "help",
                          color: "#1976d2",
                          fontWeight: "500",
                        }}
                      >
                        {formatDateTimeShort(executedAt)}
                      </Typography>
                    </Tooltip>
                  ) : (
                    getDisplayValue(undefined, "executedAt")
                  )
                ) : null}
              </Box>
              {/* 4: 실행자 */}
              <Box sx={{ ...responsiveColumnSx[4], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.5,
                      color: executedBy ? undefined : "#bdbdbd",
                      textAlign: "center",
                    }}
                  >
                    {executedBy ? executedBy : getDisplayValue(undefined, "executedBy")}
                  </Typography>
                ) : null}
              </Box>
              {/* 5: 비고 */}
              <Box sx={{ ...responsiveColumnSx[5], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.5,
                      color: notes ? undefined : "#bdbdbd",
                      textAlign: "center",
                    }}
                  >
                    {notes ? notes : getDisplayValue(undefined, "notes")}
                  </Typography>
                ) : null}
              </Box>
              {/* 6: JIRA ID */}
              <Box sx={{ ...responsiveColumnSx[6], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                  jiraIssueKey ? (
                    <Typography
                      component="a"
                      href={`https://kwangmyung.atlassian.net/browse/${jiraIssueKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="body2"
                      sx={{
                        color: "#1976d2",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                        fontSize: "0.85rem",
                        fontWeight: "500",
                      }}
                    >
                      {jiraIssueKey}
                    </Typography>
                  ) : (
                    getDisplayValue(undefined, "jiraIssueKey")
                  )
                ) : null}
              </Box>
              {/* 7: 결과입력 */}
              <Box sx={{ ...responsiveColumnSx[7], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpenResultForm(node.id)}
                    disabled={!canEnterResults}
                  >
                    결과입력
                  </Button>
                ) : null}
              </Box>
              {/* 8: 이전결과 */}
              <Box sx={{ ...responsiveColumnSx[8], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleShowPrevResults(node.id)}
                    sx={{ minWidth: 0, px: 1 }}
                  >
                    이전결과
                  </Button>
                ) : null}
              </Box>
            </Box>
          }
        >
          {isFolder && node.children && node.children.length > 0 ? renderTree(node.children) : null}
        </TreeItem>
      );
    });

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4, minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        width: "100vw",
        bgcolor: "#f7f9fa",
        py: { xs: 1, sm: 2, md: 3 }, // Reduced vertical padding
        px: { xs: 1, sm: 1.5, md: 2, lg: 1, xl: 0.5 }, // Minimal padding for ultra-wide screens
        boxSizing: "border-box",
        overflowX: "auto",
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: "100%", sm: "100%", md: "1600px", lg: "1900px", xl: "98vw" }, // Increased for better ultra-wide screen utilization
          mx: "auto",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
          p: { xs: 1, sm: 2, md: 3 }, // Reduced padding
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="h5" sx={{ flex: 1, minWidth: 200, fontWeight: "bold", color: "#1976d2" }}>
            {executionId ? (
              <>테스트 실행: {execution?.name}</>
            ) : (
              "테스트 실행 등록"
            )}
          </Typography>
          <Button onClick={handleGoToList} sx={{ mr: 1 }}>
            목록
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
          <Grid item xs={12} md={6} lg={5}> {/* Adjusted for better space utilization on large screens */}
            <TextField
              label="실행명"
              value={execution?.name || ""}
              onChange={handleChange("name")}
              fullWidth
              margin="normal"
              variant="outlined"
              required
              disabled={!canEditBasicInfo}
              inputProps={{ "aria-label": "실행명" }}
            />
            <FormControl fullWidth margin="normal" disabled={!canEditBasicInfo}>
              <InputLabel id="test-plan-label">테스트 계획</InputLabel>
              <Select
                labelId="test-plan-label"
                value={(() => {
                  const planId = execution?.testPlanId || "";
                  // testPlans가 로드되지 않았거나 해당 ID가 존재하지 않으면 빈 값 반환
                  if (!planId || testPlans.length === 0) return "";
                  const planExists = testPlans.some(plan => plan.id === planId);
                  return planExists ? planId : "";
                })()}
                onChange={handlePlanChange}
                label="테스트 계획"
                aria-label="테스트 계획"
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
          <Grid item xs={12} md={6} lg={7}> {/* Increased size to utilize remaining space */}
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Typography variant="subtitle1" gutterBottom>
                실행 정보
              </Typography>
              <Box sx={{ mb: 2 }}>
                <StatusInfoItem label="상태" value={execution?.status || "-"} />
                <StatusInfoItem
                  label="시작일시"
                  value={execution?.startDate ? new Date(execution.startDate).toLocaleString() : "-"}
                />
                <StatusInfoItem
                  label="종료일시"
                  value={execution?.endDate ? new Date(execution.endDate).toLocaleString() : "-"}
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
                <Chip icon={<CheckCircleIcon sx={{ color: "#43a047" }} />} label={`Pass: ${statusCounts.PASS}`} sx={{ bgcolor: "#e8f5e9" }} />
                <Chip icon={<CancelIcon sx={{ color: "#e53935" }} />} label={`Fail: ${statusCounts.FAIL}`} sx={{ bgcolor: "#ffebee" }} />
                <Chip icon={<HourglassEmptyIcon sx={{ color: "#bdbdbd" }} />} label={`NotRun: ${statusCounts.NOTRUN}`} sx={{ bgcolor: "#f5f5f5" }} />
                <Chip icon={<BlockIcon sx={{ color: "#fbc02d" }} />} label={`Blocked: ${statusCounts.BLOCKED}`} sx={{ bgcolor: "#fffde7" }} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  총 {statusCounts.total} 건
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
              </Box>
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
            </Paper>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Paper
          variant="outlined"
          sx={{
            p: 0,
            background: "#fff",
            width: "100%",
            overflow: "hidden",
            minHeight: 300, // Increased minimum height to utilize more vertical space
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 컬럼 헤더 */}
          <Box sx={{ display: "flex", width: "100%" }}>
            <Box sx={{ ...responsiveColumnSx[0], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>폴더/케이스</Box>
            <Box sx={{ ...responsiveColumnSx[1], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>케이스명</Box>
            <Box sx={{ ...responsiveColumnSx[2], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>결과</Box>
            <Box sx={{ ...responsiveColumnSx[3], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>실행일시</Box>
            <Box sx={{ ...responsiveColumnSx[4], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>실행자</Box>
            <Box sx={{ ...responsiveColumnSx[5], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>비고</Box>
            <Box sx={{ ...responsiveColumnSx[6], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>JIRA ID</Box>
            <Box sx={{ ...responsiveColumnSx[7], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>결과입력</Box>
            <Box sx={{ ...responsiveColumnSx[8], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>이전결과</Box>
          </Box>
          {/* 트리뷰 */}
          <Box sx={{ flex: 1, width: "100%", minHeight: 250, maxHeight: "70vh", overflowY: "auto", overflowX: "hidden" }}> {/* Increased height and made it responsive to viewport */}
            <TreeView
              defaultCollapseIcon={<span>-</span>}
              defaultExpandIcon={<span>+</span>}
              sx={{
                flexGrow: 1,
                px: 0,
                py: 0,
                "& .MuiTreeItem-content": { paddingLeft: "0 !important" },
                "& .MuiTreeItem-group": { marginLeft: 0, paddingLeft: 0 },
              }}
            >
              {renderTree(treeData)}
            </TreeView>
          </Box>
        </Paper>
        {isResultFormOpen && selectedTestCaseId && execution?.id && (
          <TestResultForm
            open={isResultFormOpen}
            testCaseId={selectedTestCaseId}
            executionId={execution.id}
            currentResult={latestResults?.find((r) => r.testCaseId === selectedTestCaseId)}
            onClose={handleCloseResultForm}
            onSave={handleSaveResult}
          />
        )}
        <PreviousResultsDialog
          open={isPrevResultsOpen}
          onClose={() => setIsPrevResultsOpen(false)}
          results={prevResults}
          loading={prevResultsLoading}
        />
        <Snackbar open={!!saveError} autoHideDuration={6000} onClose={() => setSaveError(undefined)}>
          <Alert severity="error" onClose={() => setSaveError(undefined)}>
            {saveError}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

TestExecutionForm.propTypes = {
  executionId: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default TestExecutionForm;
