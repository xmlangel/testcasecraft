// src/components/TestExecutionForm.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,  Button,  TextField, Typography,  FormControl,  InputLabel,   Select,   MenuItem,   Grid,   Paper,   Divider,   CircularProgress,   Alert,   Snackbar,  LinearProgress,   Chip,  useTheme,   useMediaQuery,  Dialog,   DialogTitle,   DialogContent,   DialogActions,   Table,   TableBody,   TableCell,   TableContainer,   TableHead,   TableRow, Tooltip, Pagination, FormControlLabel, Checkbox, Collapse
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
  Info as InfoIcon,
  Close as CloseIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
// ICT-273: TreeView 제거하고 페이지네이션 구현으로 변경
// import { TreeView, TreeItem } from "@mui/x-tree-view";
import { useAppContext } from "../context/AppContext.jsx";
import { useTranslation } from '../context/I18nContext.jsx';
import { ExecutionStatus, TestResult } from "../models/testExecution.jsx";
import TestResultForm from "./TestResultForm.jsx";
import StatusInfoItem from "./StatusInfoItem.jsx";
import { calculateExecutionProgress } from "../utils/progressUtils.jsx";
import { useNavigate } from "react-router-dom";
import { invalidateDashboardCache } from "../services/dashboardService";
// ICT-272: 표준 레이아웃 패턴 import
import { PAGE_CONTAINER_SX, STANDARD_MAX_WIDTH } from '../styles/layoutConstants';
import { formatDateSafe } from '../utils/dateUtils';
// ICT-362: 첨부파일 표시 컴포넌트
import TestResultAttachmentsView from './TestCase/TestResultAttachmentsView.jsx';

// JIRA 이슈 링크 컴포넌트
const JiraIssueLink = ({ issueKey }) => {
  const { jiraServerUrl } = useAppContext();
  const { t } = useTranslation();

  if (!jiraServerUrl) {
    return (
      <Chip
        label={t('testExecution.jira.urlNotSet', { issueKey })}
        size="small"
        color="warning"
        variant="outlined"
        sx={{ mr: 0.5, mb: 0.5 }}
      />
    );
  }
  
  return (
    <Chip
      label={issueKey}
      size="small"
      color="primary"
      variant="outlined"
      component="a"
      href={`${jiraServerUrl}/browse/${issueKey}`}
      target="_blank"
      rel="noopener noreferrer"
      clickable
      sx={{ mr: 0.5, mb: 0.5 }}
    />
  );
};

// 테스트 실행 절차 안내 컴포넌트
const TestExecutionGuide = ({ open, onClose }) => {
  const { t } = useTranslation();

  const steps = [
    {
      title: t('testExecution.guide.step1.title'),
      description: t('testExecution.guide.step1.description')
    },
    {
      title: t('testExecution.guide.step2.title'),
      description: t('testExecution.guide.step2.description')
    },
    {
      title: t('testExecution.guide.step3.title'),
      description: t('testExecution.guide.step3.description')
    },
    {
      title: t('testExecution.guide.step4.title'),
      description: t('testExecution.guide.step4.description')
    },
    {
      title: t('testExecution.guide.step5.title'),
      description: t('testExecution.guide.step5.description')
    },
    {
      title: t('testExecution.guide.step6.title'),
      description: t('testExecution.guide.step6.description')
    }
  ];

  return (
    <Collapse in={open}>
      <Alert 
        severity="info" 
        sx={{ mb: 2 }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={onClose}
            startIcon={<CloseIcon />}
          >
            {t('common.close')}
          </Button>
        }
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
          {t('testExecution.guide.title')}
        </Typography>
        {steps.map((step, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#1976d2" }}>
              {step.title}
            </Typography>
            <Typography variant="body2" sx={{ ml: 1, color: "#555" }}>
              {step.description}
            </Typography>
          </Box>
        ))}
      </Alert>
    </Collapse>
  );
};

// API_BASE_URL은 api 함수를 통해 동적으로 처리됨

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
  { flex: "0 0 100px", minWidth: 80, maxWidth: 130 }, // attachments - ICT-362: 첨부파일 컬럼
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
  const { t } = useTranslation();
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedTestResultId, setSelectedTestResultId] = useState(null);

  const sortedResults = useMemo(() => {
    if (!results) return [];
    return [...results].sort(
      (a, b) => new Date(b.executedAt) - new Date(a.executedAt)
    );
  }, [results]);

  const handleAttachmentClick = (testResultId) => {
    setSelectedTestResultId(testResultId);
    setAttachmentDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{t('testExecution.prevResults.title')}</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : sortedResults.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('testExecution.prevResults.noResults')}
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('testExecution.table.executedAt')}</TableCell>
                    <TableCell>{t('testExecution.table.result')}</TableCell>
                    <TableCell>{t('testExecution.table.executionId')}</TableCell>
                    <TableCell>{t('testExecution.table.executionName')}</TableCell>
                    <TableCell>{t('testExecution.table.executedBy')}</TableCell>
                    <TableCell>{t('testExecution.table.notes')}</TableCell>
                    <TableCell>{t('testExecution.table.jiraId')}</TableCell>
                    <TableCell>{t('testExecution.table.attachments')}</TableCell>
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
                          <JiraIssueLink issueKey={r.jiraIssueKey} />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {r.id ? (
                          <Tooltip title={t('testExecution.table.viewAttachments')}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AttachFileIcon />}
                              onClick={() => handleAttachmentClick(r.id)}
                              sx={{ minWidth: 0, px: 1 }}
                            >
                              {t('testExecution.table.attachments')}
                            </Button>
                          </Tooltip>
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
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ICT-362: 첨부파일 다이얼로그 */}
      <Dialog
        open={attachmentDialogOpen}
        onClose={() => {
          setAttachmentDialogOpen(false);
          setSelectedTestResultId(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          테스트 결과 첨부파일
        </DialogTitle>
        <DialogContent>
          {selectedTestResultId && (
            <TestResultAttachmentsView
              testResultId={selectedTestResultId}
              showUpload={false}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAttachmentDialogOpen(false);
            setSelectedTestResultId(null);
          }}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

PreviousResultsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  results: PropTypes.array,
  loading: PropTypes.bool,
};

TestExecutionGuide.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
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
    restartTestExecution,
    user,
    activeProject,
    testCases,
    fetchTestExecutionsByTestCase,
    fetchProjectTestCases,
    api,
  } = useAppContext();

  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [execution, setExecution] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isResultFormOpen, setIsResultFormOpen] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [saveError, setSaveError] = useState();
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState();

  // 테스트 실행 생성 시 즉시 시작 여부 선택
  const [startImmediately, setStartImmediately] = useState(false);
  const [showExecutionGuide, setShowExecutionGuide] = useState(false);

  // 강제 리렌더링을 위한 상태
  const [forceRender, setForceRender] = useState(0);

  // 즉시실행 진행 상태 추적
  const [isImmediateExecuting, setIsImmediateExecuting] = useState(false);

  // 이전 결과 API 관련 상태
  const [isPrevResultsOpen, setIsPrevResultsOpen] = useState(false);
  const [prevResults, setPrevResults] = useState([]);
  const [prevResultsLoading, setPrevResultsLoading] = useState(false);

  // ICT-273: 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 페이지당 10개 고정

  // ICT-362: 첨부파일 다이얼로그 상태
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedTestResultId, setSelectedTestResultId] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExecution = async () => {
      // 즉시실행 중이거나 이미 실행이 시작된 경우 초기화하지 않음
      if (!executionId) {
        // 즉시실행 진행 중인 경우 초기화하지 않음
        if (isImmediateExecuting || execution?.status === ExecutionStatus.INPROGRESS || execution?.id) {
          return;
        }

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
        const res = await api(`/api/test-executions/${executionId}`);
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
              const planRes = await api(`/api/test-plans/${data.testPlanId}`);
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
  }, [executionId, getTestPlan, activeProject, api, execution?.status, execution?.id, isImmediateExecuting]);

  // testCases가 비어있을 때 명시적으로 로드
  useEffect(() => {
    if (activeProject && activeProject.id && (!testCases || testCases.length === 0)) {

      fetchProjectTestCases(activeProject.id);
    }
  }, [activeProject, testCases, fetchProjectTestCases]);

  // 즉시실행 후 selectedPlan과 testCases 상태 변화 감지
  useEffect(() => {
    if (execution?.status === ExecutionStatus.INPROGRESS && selectedPlan && testCases?.length > 0) {
    }
  }, [execution?.status, selectedPlan, testCases]);

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

      // 즉시 시작 옵션이 선택된 경우 테스트 실행 시작
      if (startImmediately && saved.id && saved.status === ExecutionStatus.NOTSTARTED) {
        // 즉시실행 시작 표시
        setIsImmediateExecuting(true);

        // 현재 선택된 플랜을 백업 (즉시실행 후에 재설정하기 위해)
        const currentSelectedPlan = selectedPlan;

        try {
          const started = await startTestExecution(saved.id);

          // execution 상태 업데이트 시 testPlanId 확실히 보존
          const updatedExecution = {
            ...started,
            testPlanId: started.testPlanId || saved.testPlanId || execution.testPlanId,
          };

          setExecution(updatedExecution);
          setSaveError(null); // 성공 시 에러 초기화

          // 즉시실행 후 selectedPlan 상태를 업데이트하여 테스트케이스 리스트가 표시되도록 함

          if (started.testPlanId) {

            const finalTestPlanId = updatedExecution.testPlanId;

            // 1차: 백업된 플랜 사용 시도
            if (currentSelectedPlan && currentSelectedPlan.id === finalTestPlanId) {
              setSelectedPlan(currentSelectedPlan);
              // execution 상태는 이미 설정했으므로 추가 설정 불필요
            } else {
              // 2차: getTestPlan으로 조회
              const plan = getTestPlan(finalTestPlanId);

              if (plan) {
                setSelectedPlan(plan);
                // execution 상태는 이미 설정했으므로 추가 설정 불필요
              } else {
                // 3차: API 직접 조회
                try {
                  const planRes = await api(`/api/test-plans/${finalTestPlanId}`);
                  if (planRes.ok) {
                    const planData = await planRes.json();
                    setSelectedPlan(planData);
                    // execution 상태는 이미 설정했으므로 추가 설정 불필요
                  } else {
                    console.error("❌ API에서 테스트플랜 조회 실패 - 상태:", planRes.status);
                  }
                } catch (planErr) {
                  console.error("❌ 테스트 플랜 조회 오류:", planErr);
                }
              }
            }
          } else {
            console.warn("⚠️ 즉시실행 후 testPlanId가 없음");
          }

          // testCases 상태도 확인
          if (!testCases || testCases.length === 0) {
            if (activeProject?.id) {
              await fetchProjectTestCases(activeProject.id);
            }
          }

          // 상태 업데이트가 완료될 때까지 잠시 대기
          setTimeout(() => {
          }, 100);

          setSuccessMessage(`테스트 실행 '${started.name}'이 성공적으로 저장되고 시작되었습니다. 이제 테스트 케이스별 결과를 입력할 수 있습니다.`);

          // 즉시실행 완료 표시
          setIsImmediateExecuting(false);

          // 즉시 실행 시에는 창을 닫지 않고 현재 화면을 유지
          // onSave 콜백을 호출하지 않음으로써 창이 닫히는 것을 방지
          if (fetchTestExecutions) fetchTestExecutions();
          return; // 즉시 실행의 경우 여기서 종료
        } catch (startErr) {
          setIsImmediateExecuting(false); // 에러 시에도 상태 초기화
          setSaveError(`저장은 성공했으나 실행 시작 중 오류: ${startErr.message}`);
        }
      }

      // 일반 저장의 경우에만 onSave 콜백 호출 (창 닫기)
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

  const handleRestartExecution = async () => {
    if (!execution?.id || execution.status !== ExecutionStatus.COMPLETED) return;
    setSaving(true);
    try {
      const updated = await restartTestExecution(execution.id);
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
        
      } catch (e) {
        console.error('Failed to invalidate dashboard cache:', e);
      }

      handleCloseResultForm();
    },
    [fetchTestExecutions, handleCloseResultForm]
  );

  // 프로젝트별 테스트 실행 목록으로 이동
  const handleGoToList = () => {
    if (activeProject?.id) {
      navigate(`/projects/${activeProject.id}/executions`);
    } else {
      navigate("/executions");
    }
  };

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

  // ICT-362: 첨부파일 버튼 클릭 핸들러
  const handleAttachmentClick = useCallback((testResultId) => {
    setSelectedTestResultId(testResultId);
    setAttachmentDialogOpen(true);
  }, []);

  const canEditBasicInfo = execution?.status === ExecutionStatus.NOTSTARTED;
  const canStartExecution = execution?.status === ExecutionStatus.NOTSTARTED && execution?.testPlanId;
  const canCompleteExecution = execution?.status === ExecutionStatus.INPROGRESS;
  const canRestartExecution = execution?.status === ExecutionStatus.COMPLETED;
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

  // 트리 데이터 생성 (전체)
  const fullTreeData = useMemo(() => {

    if (!selectedPlan) {
      return [];
    }

    if (!testCases) {
      return [];
    }

    if (testCases.length === 0) {
      return [];
    }


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

    const result = testCases
      .filter((tc) => !tc.parentId)
      .map((tc) => filterTree(testCaseMap[tc.id]))
      .filter(Boolean);

    return result;
  }, [selectedPlan, testCases]);

  // ICT-273: 트리를 평면화하여 페이지네이션 적용
  const { flattenedData, totalItems, totalPages } = useMemo(() => {
    const flatten = (nodes, level = 0) => {
      let result = [];
      nodes.forEach(node => {
        result.push({ ...node, level });
        if (node.children && node.children.length > 0) {
          result = result.concat(flatten(node.children, level + 1));
        }
      });
      return result;
    };

    const flattened = flatten(fullTreeData);
    const total = flattened.length;
    const pages = Math.ceil(total / itemsPerPage);
    
    return {
      flattenedData: flattened,
      totalItems: total,
      totalPages: pages
    };
  }, [fullTreeData, itemsPerPage]);

  // ICT-273: 현재 페이지의 데이터만 추출
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return flattenedData.slice(startIndex, endIndex);
  }, [flattenedData, currentPage, itemsPerPage]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((event, page) => {
    setCurrentPage(page);
  }, []);

  // ICT-273: 평면화된 데이터를 렌더링하는 함수 (페이지네이션 지원)
  const renderPaginatedItems = (nodes) =>
    nodes.map((node, idx) => {
      const isFolder = node.type === "folder";
      const resultObj = latestResults?.find((r) => r.testCaseId === node.id);
      const result = resultObj?.result || TestResult.NOTRUN;
      const notes = resultObj?.notes;
      const jiraIssueKey = resultObj?.jiraIssueKey;
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
      titleStyle.color = isFolder ? "#424242" : "#1565c0";

      return (
        <Box
          key={node.id}
          sx={{ 
            display: "flex", 
            width: "100%",
            minHeight: HEADER_HEIGHT,
            backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "white",
            borderBottom: "1px solid #e0e0e0",
            paddingLeft: `${node.level * 20}px`, // 계층 구조 표시를 위한 들여쓰기
            "&:hover": {
              backgroundColor: "#f0f0f0"
            }
          }}
        >
          {/* 0: 이름/폴더 */}
          <Box sx={{ ...responsiveColumnSx[0], display: "flex", alignItems: "center", justifyContent: "flex-start", pl: 1 }}>
            {isFolder ? <FolderIcon sx={{ mr: 1 }} /> : <DescriptionIcon sx={{ mr: 1, color: "#1565c0" }} />}
            <Typography variant="body2" sx={{ ...titleStyle, textAlign: "left" }}>
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
                <JiraIssueLink issueKey={jiraIssueKey} />
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
                {t('testExecution.actions.enterResult')}
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
                {t('testExecution.actions.prevResults')}
              </Button>
            ) : null}
          </Box>
          {/* 9: 첨부파일 */}
          <Box sx={{ ...responsiveColumnSx[9], display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!isFolder && resultObj?.id ? (
              <Tooltip title={t('testExecution.table.viewAttachments')}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AttachFileIcon />}
                  onClick={() => handleAttachmentClick(resultObj.id)}
                  sx={{ minWidth: 0, px: 1 }}
                >
                  {t('testExecution.table.attachments')}
                </Button>
              </Tooltip>
            ) : !isFolder ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>-</Typography>
            ) : null}
          </Box>
        </Box>
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
    <Box sx={PAGE_CONTAINER_SX.main}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="h5" sx={{ flex: 1, minWidth: 200, fontWeight: "bold", color: "#1976d2" }}>
            {executionId ? (
              <>{t('testExecution.form.editTitle', { name: execution?.name })}</>
            ) : (
              t('testExecution.form.registerTitle')
            )}
          </Typography>
          {!executionId && (
            <Button
              onClick={() => setShowExecutionGuide(!showExecutionGuide)}
              variant="outlined"
              startIcon={<InfoIcon />}
              sx={{ mr: 1 }}
            >
              {showExecutionGuide ? t('testExecution.guide.hideGuide') : t('testExecution.guide.showGuide')}
            </Button>
          )}
          <Button onClick={handleGoToList} sx={{ mr: 1 }}>
            {t('common.list')}
          </Button>
          <Button onClick={onCancel} sx={{ mr: 1 }}>
            {t('common.cancel')}
          </Button>
          {canEditBasicInfo && (
            <Button
              onClick={handleSaveOrUpdate}
              variant="contained"
              color="primary"
              disabled={!execution?.name || !execution?.testPlanId || !execution?.projectId || saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
            >
              {startImmediately ? t('testExecution.form.saveAndStart') : t('common.save')}
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {/* 테스트 실행 절차 안내 */}
        <TestExecutionGuide 
          open={showExecutionGuide} 
          onClose={() => setShowExecutionGuide(false)} 
        />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} lg={5}> {/* Adjusted for better space utilization on large screens */}
            <TextField
              label={t('testExecution.form.executionName')}
              value={execution?.name || ""}
              onChange={handleChange("name")}
              fullWidth
              margin="normal"
              variant="outlined"
              required
              disabled={!canEditBasicInfo}
              inputProps={{ "aria-label": t('testExecution.form.executionName') }}
            />
            <FormControl fullWidth margin="normal" disabled={!canEditBasicInfo}>
              <InputLabel id="test-plan-label">{t('testExecution.form.testPlan')}</InputLabel>
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
                label={t('testExecution.form.testPlan')}
                aria-label={t('testExecution.form.testPlan')}
              >
                <MenuItem value="">
                  <em>{t('common.select')}</em>
                </MenuItem>
                {testPlans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label={t('testExecution.form.description')}
              value={execution?.description || ""}
              onChange={handleChange("description")}
              fullWidth
              margin="normal"
              variant="outlined"
              multiline
              rows={3}
              disabled={!canEditBasicInfo}
              inputProps={{ "aria-label": t('testExecution.form.description') }}
            />
            
            {/* 즉시 실행 시작 옵션 - 새로운 실행 생성시에만 표시 */}
            {!executionId && canEditBasicInfo && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={startImmediately}
                    onChange={(e) => setStartImmediately(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {t('testExecution.form.startImmediatelyLabel')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('testExecution.form.startImmediatelyDescription')}
                    </Typography>
                  </Box>
                }
                sx={{ mt: 1, mb: 1, alignItems: "flex-start" }}
              />
            )}
          </Grid>
          <Grid item xs={12} md={6} lg={7}> {/* Increased size to utilize remaining space */}
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('testExecution.form.executionInfo')}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <StatusInfoItem label={t('testExecution.form.status')} value={execution?.status || "-"} />
                <StatusInfoItem
                  label={t('testExecution.form.startDate')}
                  value={formatDateSafe(execution?.startDate)}
                />
                <StatusInfoItem
                  label={t('testExecution.form.endDate')}
                  value={formatDateSafe(execution?.endDate)}
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
                <Chip icon={<CheckCircleIcon sx={{ color: "#43a047" }} />} label={`Pass: ${statusCounts.PASS}`} sx={{ bgcolor: "#e8f5e9" }} />
                <Chip icon={<CancelIcon sx={{ color: "#e53935" }} />} label={`Fail: ${statusCounts.FAIL}`} sx={{ bgcolor: "#ffebee" }} />
                <Chip icon={<HourglassEmptyIcon sx={{ color: "#bdbdbd" }} />} label={`NotRun: ${statusCounts.NOTRUN}`} sx={{ bgcolor: "#f5f5f5" }} />
                <Chip icon={<BlockIcon sx={{ color: "#fbc02d" }} />} label={`Blocked: ${statusCounts.BLOCKED}`} sx={{ bgcolor: "#fffde7" }} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {t('testExecution.form.totalCount', { count: statusCounts.total })}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{ minWidth: 70 }}>
                  {t('testExecution.form.progress')}
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
                  {t('testExecution.actions.startExecution')}
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
                  {t('testExecution.actions.completeExecution')}
                </Button>
              )}
              {canRestartExecution && (
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleRestartExecution}
                  disabled={saving}
                  sx={{ ml: 2 }}
                >
                  {t('testExecution.actions.restartExecution')}
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
            <Box sx={{ ...responsiveColumnSx[0], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>{t('testExecution.table.folderCase')}</Box>
            <Box sx={{ ...responsiveColumnSx[1], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>{t('testExecution.table.caseName')}</Box>
            <Box sx={{ ...responsiveColumnSx[2], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>{t('testExecution.table.result')}</Box>
            <Box sx={{ ...responsiveColumnSx[3], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>{t('testExecution.table.executedAt')}</Box>
            <Box sx={{ ...responsiveColumnSx[4], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>{t('testExecution.table.executedBy')}</Box>
            <Box sx={{ ...responsiveColumnSx[5], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>{t('testExecution.table.notes')}</Box>
            <Box sx={{ ...responsiveColumnSx[6], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>{t('testExecution.table.jiraId')}</Box>
            <Box sx={{ ...responsiveColumnSx[7], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>{t('testExecution.table.enterResult')}</Box>
            <Box sx={{ ...responsiveColumnSx[8], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>{t('testExecution.table.prevResults')}</Box>
            <Box sx={{ ...responsiveColumnSx[9], display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.08rem", color: "#1976d2" }}>{t('testExecution.table.attachments')}</Box>
          </Box>
          {/* ICT-273: 페이지네이션된 테스트 케이스 목록 */}
          <Box sx={{ flex: 1, width: "100%" }}>
            {/* 페이지 정보 표시 */}
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {t('testExecution.pagination.info', {
                  totalItems,
                  start: ((currentPage - 1) * itemsPerPage) + 1,
                  end: Math.min(currentPage * itemsPerPage, totalItems)
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('testExecution.pagination.page', { current: currentPage, total: totalPages })}
              </Typography>
            </Box>
            
            {/* 페이지네이션된 목록 컨테이너 */}
            <Box sx={{ 
              width: "100%", 
              minHeight: 250, 
              maxHeight: "60vh", 
              overflowY: "auto", 
              overflowX: "hidden",
              border: "1px solid #e0e0e0",
              borderRadius: 1
            }}>
              {paginatedData.length > 0 ? (
                renderPaginatedItems(paginatedData)
              ) : (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('testExecution.table.noData')}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* 페이지네이션 컨트롤 */}
            {totalPages > 1 && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  size="medium"
                />
              </Box>
            )}
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

        {/* ICT-362: 첨부파일 다이얼로그 */}
        <Dialog
          open={attachmentDialogOpen}
          onClose={() => {
            setAttachmentDialogOpen(false);
            setSelectedTestResultId(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {t('testExecution.attachments.title')}
          </DialogTitle>
          <DialogContent>
            {selectedTestResultId && (
              <TestResultAttachmentsView
                testResultId={selectedTestResultId}
                showUpload={false}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setAttachmentDialogOpen(false);
              setSelectedTestResultId(null);
            }}>
              {t('common.close')}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!saveError} autoHideDuration={6000} onClose={() => setSaveError(undefined)}>
          <Alert severity="error" onClose={() => setSaveError(undefined)}>
            {saveError}
          </Alert>
        </Snackbar>

        <Snackbar open={!!successMessage} autoHideDuration={8000} onClose={() => setSuccessMessage(undefined)}>
          <Alert severity="success" onClose={() => setSuccessMessage(undefined)}>
            {successMessage}
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
