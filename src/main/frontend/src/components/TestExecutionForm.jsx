import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useCallback, useMemo } from "react";

import PropTypes from "prop-types";
import {
  Box,
  Grid,
  CircularProgress,
  LinearProgress,
  Alert,
  Snackbar,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useAppContext } from "../context/AppContext.jsx";
import { useTranslation } from "../context/I18nContext.jsx";
import { RESULT_COLORS } from "../constants/statusColors";
import { ExecutionStatus, TestResult } from "../models/testExecution.jsx";
import TestResultForm from "./TestResultForm.jsx";
import {
  getOrderedTestCaseIds,
  getFilteredNavTestCaseIds,
} from "../utils/treeUtils.jsx";

import { invalidateDashboardCache } from "../services/dashboardService";
import { PAGE_CONTAINER_SX } from "../styles/layoutConstants";
import TestResultAttachmentsView from "./TestCase/TestResultAttachmentsView.jsx";
import { debugLog } from "../utils/logger";
import { TEST_RESULT_TYPES } from "../utils/testResultConstants.js";

// New Components
import TestExecutionHeader from "./TestExecution/TestExecutionHeader.jsx";
import TestExecutionInfo from "./TestExecution/TestExecutionInfo.jsx";
import TestExecutionStatus from "./TestExecution/TestExecutionStatus.jsx";
import TestExecutionTable from "./TestExecution/TestExecutionTable.jsx";
import TestExecutionFilterPanel from "./TestExecution/TestExecutionFilterPanel.jsx";
import PreviousResultsDialog from "./TestExecution/PreviousResultsDialog.jsx";
import BulkResultDialog from "./TestExecution/BulkResultDialog.jsx";
import {
  getLatestResults,
  parseDateTime,
  saveFilteredNavIds,
} from "./TestExecution/utils.jsx";

// 테스트케이스 필터를 실행(executionId)별로 보존하기 위한 sessionStorage 키 접두사.
// 테스트케이스 결과 화면(.../testcases/:id/result)은 별도 라우트라 본 폼이
// 언마운트→재마운트되어 로컬 state가 초기화된다. 마지막 필터를 저장해 복원한다.
const FILTERS_STORAGE_PREFIX = "testExecutionForm.filters.";
// priority·result 는 다중 선택(배열), 나머지는 단일 텍스트.
const EMPTY_FILTERS = {
  name: "",
  priority: [],
  result: [],
  executedBy: "",
  executionDate: "",
  jiraIssueKey: "",
  notes: "",
};
// 배열(다중선택)/문자열 모두를 일관되게 "값이 있는가"로 판정
const filterHasValue = (v) =>
  Array.isArray(v) ? v.length > 0 : !!(v && v !== "");
// 콤마로 구분된 다중 검색어 — 트림 후 빈 항목 제외, 소문자화
const splitTerms = (value) =>
  String(value || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
// 대상 문자열이 검색어 중 하나라도 포함하면 true (필드 내 OR). 검색어 없으면 통과.
const matchesAnyTerm = (haystack, value) => {
  const terms = splitTerms(value);
  if (!terms.length) return true;
  const h = String(haystack || "").toLowerCase();
  return terms.some((term) => h.includes(term));
};
const readSavedFilters = (executionId) => {
  if (!executionId || executionId === "new") return { ...EMPTY_FILTERS };
  try {
    const raw = sessionStorage.getItem(
      `${FILTERS_STORAGE_PREFIX}${executionId}`,
    );
    if (!raw) return { ...EMPTY_FILTERS };
    const parsed = JSON.parse(raw);
    // 구버전(문자열) 저장값 호환 — priority·result 를 배열로 정규화
    const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
    return {
      ...EMPTY_FILTERS,
      ...parsed,
      priority: toArray(parsed.priority),
      result: toArray(parsed.result),
    };
  } catch {
    return { ...EMPTY_FILTERS };
  }
};
const writeSavedFilters = (executionId, filters) => {
  if (!executionId || executionId === "new") return;
  try {
    const key = `${FILTERS_STORAGE_PREFIX}${executionId}`;
    const hasActive = Object.values(filters).some(filterHasValue);
    if (hasActive) {
      sessionStorage.setItem(key, JSON.stringify(filters));
    } else {
      // 초기화 시에는 저장 항목을 제거(다음 진입을 빈 필터로)
      sessionStorage.removeItem(key);
    }
  } catch {
    // sessionStorage 미지원/차단 환경에서는 무시(필터 미보존)
  }
};

const TestExecutionForm = ({
  executionId,
  projectId: propProjectId,
  initialTestPlanId,
  onCancel,
  onSave,
}) => {
  const {
    testPlans,
    getTestPlan,
    fetchTestExecutions,
    addOrUpdateTestExecution,
    startTestExecution,
    completeTestExecution,
    restartTestExecution,
    activeProject,
    testCases,
    fetchTestExecutionsByTestCase,
    fetchProjectTestCases,
    api,
    ensureValidToken,
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

  // 즉시실행 진행 상태 추적
  const [isImmediateExecuting, setIsImmediateExecuting] = useState(false);

  // 이전 결과 API 관련 상태
  const [isPrevResultsOpen, setIsPrevResultsOpen] = useState(false);
  const [prevResults, setPrevResults] = useState([]);
  const [prevResultsLoading, setPrevResultsLoading] = useState(false);
  const [currentPrevResultsTestCaseId, setCurrentPrevResultsTestCaseId] =
    useState(null);

  //  첨부파일 다이얼로그 상태
  const [visibleCount, setVisibleCount] = useState(50);

  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedTestResultId, setSelectedTestResultId] = useState(null);

  // 태그 자동완성을 위한 기존 태그 목록
  const [availableTags, setAvailableTags] = useState([]);

  // 일괄 결과 입력 관련 상태
  const [selectedTestCases, setSelectedTestCases] = useState(new Set());
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // 일반 정보(이름, 설명, 태그) 편집 모드 여부
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(!executionId);
  const [originalExecution, setOriginalExecution] = useState(null);

  const handleEditClick = useCallback(() => {
    setOriginalExecution({ ...execution });
    setIsEditingBasicInfo(true);
  }, [execution]);

  const handleCancelEditFromHeader = useCallback(() => {
    if (!executionId) {
      onCancel();
    } else {
      if (originalExecution) {
        setExecution(originalExecution);
      }
      setIsEditingBasicInfo(false);
    }
  }, [executionId, onCancel, originalExecution]);

  // 필터 관련 상태 — 마운트 시 이 실행에 저장해 둔 필터를 복원
  const [filters, setFilters] = useState(() => readSavedFilters(executionId));

  // 필터가 바뀔 때마다 실행별로 보존 — 결과 화면 왕복 후에도 복원되도록
  useEffect(() => {
    writeSavedFilters(executionId, filters);
  }, [executionId, filters]);

  // Accordion state
  const [accordionExpanded, setAccordionExpanded] = useState(() => {
    const saved = localStorage.getItem("testcase-manager-execution-accordion");
    return saved
      ? JSON.parse(saved)
      : {
          executionSummary: true,
          filters: true,
          list: true,
        };
  });

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    const newExpanded = { ...accordionExpanded, [panel]: isExpanded };
    setAccordionExpanded(newExpanded);
    localStorage.setItem(
      "testcase-manager-execution-accordion",
      JSON.stringify(newExpanded),
    );
  };

  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // 프로젝트의 기존 태그 목록 조회
  useEffect(() => {
    if (!execution?.projectId) return;

    const fetchTags = async () => {
      try {
        const response = await api(
          `/api/testcases/projects/${execution.projectId}/tags`,
        );
        if (response.ok) {
          const tags = await response.json();
          setAvailableTags(Array.from(tags));
        }
      } catch (error) {
        console.error("태그 목록 조회 실패:", error);
      }
    };

    fetchTags();
  }, [execution?.projectId, api]);

  useEffect(() => {
    const fetchExecution = async () => {
      // 새 실행 등록 페이지인 경우
      if (!executionId || executionId === "new") {
        // 즉시실행 진행 중이 아닌 경우에만 초기화
        if (!isImmediateExecuting) {
          setExecution({
            id: null,
            name: "",
            testPlanId: initialTestPlanId || "",
            projectId: activeProject?.id,
            description: "",
            status: ExecutionStatus.NOTSTARTED,
            startDate: null,
            endDate: null,
            results: [],
            createdAt: null,
            updatedAt: null,
          });
          if (initialTestPlanId) {
            const plan = getTestPlan(initialTestPlanId);
            if (plan) {
              setSelectedPlan(plan);
            } else {
              // If not found in context, try to fetch it
              api(`/api/test-plans/${initialTestPlanId}`)
                .then((res) => {
                  if (res.ok) return res.json();
                  throw new Error("Failed to fetch test plan");
                })
                .then((data) => {
                  setSelectedPlan(data);
                })
                .catch((err) => {
                  console.error("Error fetching initial test plan:", err);
                });
            }
          } else {
            setSelectedPlan(null);
          }
        }
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await api(`/api/test-executions/${executionId}`);
        if (!res.ok)
          throw new Error(
            t(
              "testExecution.error.loadFailed",
              "실행 정보를 불러오지 못했습니다.",
            ),
          );
        const data = await res.json();

        setExecution(data);
        debugLog("TestExecutionForm", "Execution data fetched", data);

        // 테스트 플랜 정보 조회 - testPlans가 로드되지 않은 경우 API 직접 호출
        if (data.testPlanId) {
          // 먼저 컨텍스트에서 조회 시도
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
                // Note: This is a console log, not UI-visible
                // The actual test plan not found is handled gracefully by setting to null
                console.warn(
                  `${t("testExecution.error.testPlanNotFound", "테스트 플랜을 찾을 수 없습니다")}: ${data.testPlanId}`,
                );
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
        console.error("테스트 실행 정보 조회 오류:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // executionId 변경 시 항상 fetchExecution 실행 (초기화 포함)
    fetchExecution();
  }, [
    executionId,
    getTestPlan,
    api,
    isImmediateExecuting,
    activeProject,
    initialTestPlanId,
  ]);

  // 스마트 리다이렉트 처리 (지라 이슈 키 자동 채움)
  useEffect(() => {
    if (location.state?.autoFillJiraIssueKey && execution?.results) {
      const { autoFillJiraIssueKey, targetTestCaseId } = location.state;

      // 대상 테스트 케이스가 있으면 해당 케이스의 결과 폼을 연다
      if (targetTestCaseId) {
        setSelectedTestCaseId(targetTestCaseId);
        setIsResultFormOpen(true);

        // 한번 처리한 후에는 state를 초기화하여 재실행되지 않도록 함
        const newState = { ...location.state };
        delete newState.autoFillJiraIssueKey;
        delete newState.targetTestCaseId;
        navigate(location.pathname, { state: newState, replace: true });
      }
    }
  }, [location.state, execution, navigate, location.pathname]);

  // testCases가 비어있을 때 명시적으로 로드
  // execution.projectId 또는 activeProject.id를 사용하여 testCases 로드
  useEffect(() => {
    const projectId = execution?.projectId || activeProject?.id;

    debugLog("TestExecutionForm", "Check testCases loading", {
      projectId,
      testCasesLength: testCases?.length,
      executionProjectId: execution?.projectId,
      activeProjectId: activeProject?.id,
    });

    if (projectId && (!testCases || testCases.length === 0)) {
      debugLog("TestExecutionForm", "Fetching project test cases", projectId);
      fetchProjectTestCases(projectId);
    }
  }, [
    execution?.projectId,
    activeProject?.id,
    testCases,
    fetchProjectTestCases,
  ]);

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
    [getTestPlan],
  );

  const handleChange = useCallback(
    (field) => (event) => {
      setExecution((prev) => ({
        ...prev,
        [field]: event.target.value,
        projectId: prev.projectId,
      }));
    },
    [],
  );

  const handleSaveOrUpdate = async () => {
    if (!execution.name || !execution.testPlanId || !execution.projectId)
      return;
    setSaving(true);
    try {
      const saved = await addOrUpdateTestExecution(execution);
      setExecution(saved);
      setIsEditingBasicInfo(false); // 저장 성공 시 편집 모드 종료

      // 즉시 시작 옵션이 선택된 경우 테스트 실행 시작
      if (
        startImmediately &&
        saved.id &&
        saved.status === ExecutionStatus.NOTSTARTED
      ) {
        // 즉시실행 시작 표시
        setIsImmediateExecuting(true);

        // 현재 선택된 플랜을 백업 (즉시실행 후에 재설정하기 위해)
        const currentSelectedPlan = selectedPlan;

        try {
          const started = await startTestExecution(saved.id);

          // execution 상태 업데이트 시 testPlanId 확실히 보존
          const updatedExecution = {
            ...started,
            testPlanId:
              started.testPlanId || saved.testPlanId || execution.testPlanId,
          };

          setExecution(updatedExecution);
          setSaveError(null); // 성공 시 에러 초기화

          // 즉시실행 후 selectedPlan 상태를 업데이트하여 테스트케이스 리스트가 표시되도록 함

          if (started.testPlanId) {
            const finalTestPlanId = updatedExecution.testPlanId;

            // 1차: 백업된 플랜 사용 시도
            if (
              currentSelectedPlan &&
              currentSelectedPlan.id === finalTestPlanId
            ) {
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
                  const planRes = await api(
                    `/api/test-plans/${finalTestPlanId}`,
                  );
                  if (planRes.ok) {
                    const planData = await planRes.json();
                    setSelectedPlan(planData);
                    // execution 상태는 이미 설정했으므로 추가 설정 불필요
                  } else {
                    // Note: This is a console error, not UI-visible
                    console.error(
                      `❌ ${t("testExecution.error.testPlanFetchFailed", "API에서 테스트플랜 조회 실패")} - ${t("testExecution.error.status", "상태")}:`,
                      planRes.status,
                    );
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

          // 즉시 실행 완료 표시 및 성공 메시지
          setSuccessMessage(
            t(
              "testExecution.success.immediateStart",
              "테스트 실행 '{name}'이 성공적으로 저장되고 시작되었습니다. 이제 테스트 케이스별 결과를 입력할 수 있습니다.",
            ).replace("{name}", started.name),
          );

          // 즉시실행 완료 표시
          setIsImmediateExecuting(false);

          // 즉시 실행 성공 후 URL을 새로운 execution ID로 업데이트
          // 이렇게 하면 executionId prop이 실제 ID로 업데이트되어 화면이 올바르게 로드됨
          const projectId = activeProject?.id || execution?.projectId;
          if (projectId && started.id) {
            // 전체 실행 목록 갱신
            if (fetchTestExecutions) fetchTestExecutions();

            // 새로운 execution ID로 navigate
            navigate(`/projects/${projectId}/executions/${started.id}`);
            return; // navigate 후 종료
          }

          // projectId가 없는 경우에만 현재 화면 유지 (폴백)
          if (fetchTestExecutions) fetchTestExecutions();
          return; // 즉시 실행의 경우 여기서 종료
        } catch (startErr) {
          setIsImmediateExecuting(false); // 에러 시에도 상태 초기화
          setSaveError(
            `${t("testExecution.error.saveSuccessBut", "저장은 성공했으나")} ${t("testExecution.error.startFailed", "실행 시작 중 오류")}: ${startErr.message}`,
          );
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
    if (!execution?.id || execution.status !== ExecutionStatus.NOTSTARTED)
      return;
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
    if (!execution?.id || execution.status !== ExecutionStatus.INPROGRESS)
      return;
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
    if (!execution?.id || execution.status !== ExecutionStatus.COMPLETED)
      return;
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

  const handleOpenResultForm = useCallback(
    (testCaseId) => {
      // projectId를 다양한 소스에서 검색하여 항상 URL 네비게이션을 우선 사용
      const projectId =
        execution?.testPlan?.projectId || execution?.projectId || propProjectId;
      if (projectId && execution?.id) {
        navigate(
          `/projects/${projectId}/executions/${execution.id}/testcases/${testCaseId}/result`,
        );
      } else {
        // Fallback to dialog mode (projectId를 전혀 알 수 없는 경우)
        setSelectedTestCaseId(testCaseId);
        setIsResultFormOpen(true);
      }
    },
    [navigate, execution, propProjectId],
  );

  // 결과 입력 화면의 직접 링크를 클립보드에 복사
  const handleCopyLink = useCallback(
    (testCaseId) => {
      const projectId =
        execution?.testPlan?.projectId || execution?.projectId || propProjectId;
      if (projectId && execution?.id) {
        const url = `${window.location.origin}/projects/${projectId}/executions/${execution.id}/testcases/${testCaseId}/result`;
        navigator.clipboard
          .writeText(url)
          .then(() => {
            setSuccessMessage(
              t(
                "testExecution.actions.linkCopied",
                "결과 입력 링크가 클립보드에 복사되었습니다.",
              ),
            );
          })
          .catch(() => {
            setSuccessMessage(url); // 복사 실패 시 URL을 메시지로 표시
          });
      }
    },
    [execution, propProjectId, t],
  );

  const handleCloseResultForm = useCallback(() => {
    setIsResultFormOpen(false);
    setSelectedTestCaseId(null);
  }, []);

  // 테스트 결과 저장 후 실행 상태 업데이트
  const handleSaveResult = useCallback(
    async (updatedExecution, options = {}) => {
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
        console.error("Failed to invalidate dashboard cache:", e);
      }

      if (!options.keepDialogOpen) {
        handleCloseResultForm();
      }
    },
    [fetchTestExecutions, handleCloseResultForm],
  );

  // 프로젝트별 테스트 실행 목록으로 이동
  const handleGoToList = () => {
    // 1. propProjectId (URL Params) -> 2. execution.projectId -> 3. activeProject.id 순으로 확인
    const projectId =
      propProjectId || execution?.projectId || activeProject?.id;

    if (projectId) {
      navigate(`/projects/${projectId}/executions`);
    } else {
      // 프로젝트 ID를 찾을 수 없는 경우에만 전체 실행 목록 또는 프로젝트 선택으로 이동
      navigate("/projects");
    }
  };

  const handleAttachmentChange = () => {
    if (currentPrevResultsTestCaseId) {
      handleShowPrevResults(currentPrevResultsTestCaseId, false);
    }
  };

  // 이전결과 버튼 클릭 시 API 호출
  const handleShowPrevResults = useCallback(
    async (testCaseId, openDialog = true) => {
      setCurrentPrevResultsTestCaseId(testCaseId);
      setPrevResultsLoading(true);
      if (openDialog) {
        setIsPrevResultsOpen(true);
      }
      try {
        const results = await fetchTestExecutionsByTestCase(testCaseId);
        setPrevResults(results || []);
      } catch {
        setPrevResults([]);
      } finally {
        setPrevResultsLoading(false);
      }
    },
    [fetchTestExecutionsByTestCase],
  );

  // ICT-362: 첨부파일 버튼 클릭 핸들러
  const handleAttachmentClick = useCallback((testResultId) => {
    setSelectedTestResultId(testResultId);
    setAttachmentDialogOpen(true);
  }, []);

  // 체크박스 선택 핸들러
  const handleSelectionChange = useCallback((testCaseId, checked) => {
    setSelectedTestCases((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(testCaseId);
      } else {
        newSet.delete(testCaseId);
      }
      return newSet;
    });
  }, []);

  // 일괄 액션 버튼 클릭
  const [preselectedResult, setPreselectedResult] = useState(null);

  const handleBulkActionClick = useCallback(
    (result) => {
      if (selectedTestCases.size > 0) {
        setPreselectedResult(result);
        setIsBulkDialogOpen(true);
      }
    },
    [selectedTestCases],
  );

  // 일괄 결과 업데이트
  const handleBulkUpdate = useCallback(
    async ({ result, notes, tags: newTags, jiraIssueKey }) => {
      if (!execution?.id) return;

      setBulkProcessing(true);
      const testCaseArray = Array.from(selectedTestCases);

      try {
        // 일괄 API 호출
        const response = await api(
          `/api/test-executions/${execution.id}/results/bulk`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              testCaseIds: testCaseArray,
              result,
              notes,
              tags: newTags,
              jiraIssueKey,
            }),
          },
        );

        if (response.ok) {
          const updatedExecution = await response.json();
          setExecution(updatedExecution);

          // 성공 메시지 표시
          setSuccessMessage(
            t(
              "testExecution.bulk.success",
              "{count}개 테스트케이스 결과가 저장되었습니다",
            ).replace("{count}", testCaseArray.length),
          );

          // 대시보드 캐시 무효화
          invalidateDashboardCache();

          // 선택 해제 및 다이얼로그 닫기
          setSelectedTestCases(new Set());
          setIsBulkDialogOpen(false);
        } else {
          const errorData = await response.json().catch(() => ({
            message: t("testExecution.error.unknown", "알 수 없는 오류"),
          }));
          setSaveError(
            t(
              "testExecution.bulk.error",
              "일괄 결과 저장 중 오류 발생: {error}",
            ).replace("{error}", errorData.message || response.statusText),
          );
        }
      } catch (err) {
        setSaveError(
          t(
            "testExecution.bulk.error",
            "일괄 결과 저장 중 오류 발생: {error}",
          ).replace("{error}", err.message),
        );
      } finally {
        setBulkProcessing(false);
      }
    },
    [execution?.id, selectedTestCases, api, t],
  );

  // 스마트 리다이렉트 연동: 위치 정보를 통해 전달된 지라 이슈 키를 초기값으로 설정
  // TestExecutionForm 컴포넌트에서 TestResultForm이 열릴 때 이 로직을 사용하여 Jira 이슈 키를 자동 채움
  useEffect(() => {
    // 이 로직은 TestResultForm 내부가 아닌, TestExecutionForm에서 TestResultForm을 열 때
    // location.state를 감지하여 특정 테스트 케이스를 선택하고 TestResultForm을 열도록 조정해야 합니다.
    if (
      location.state?.autoFillJiraIssueKey &&
      location.state?.testCaseIdToSelect
    ) {
      const { testCaseIdToSelect } = location.state;

      // TestResultForm을 열기 위한 상태 설정
      setSelectedTestCaseId(testCaseIdToSelect);
      setIsResultFormOpen(true);
    }
  }, [location.state, navigate]);

  const canEditBasicInfo = isEditingBasicInfo; // 이름, 설명, 태그는 편집 모드일 때만 수정 가능
  const canEditPlan = execution?.status === ExecutionStatus.NOTSTARTED; // 테스트 플랜 변경은 시작 전까지만 가능
  const canStartExecution =
    execution?.status === ExecutionStatus.NOTSTARTED && !!execution?.testPlanId;
  const canCompleteExecution = execution?.status === ExecutionStatus.INPROGRESS;
  const canRestartExecution = execution?.status === ExecutionStatus.COMPLETED;
  const canEnterResults = execution?.status === ExecutionStatus.INPROGRESS;

  // 1. 테스트 케이스별 가장 최근 유효한 JIRA ID 맵 생성 (같은 실행 내의 과거 이력 포함)
  const effectiveJiraMap = useMemo(() => {
    const map = new Map();
    const results = execution?.results || [];
    // execution.results를 순회하며 각 케이스별로 발견되는 모든 JIRA ID 중 가장 최근 것을 저장합니다.
    // getLatestResults와 정렬 방식이 일치하도록 처리합니다.
    [...results]
      .sort((a, b) => new Date(b.executedAt || 0) - new Date(a.executedAt || 0))
      .forEach((r) => {
        if (r.jiraIssueKey && !map.has(r.testCaseId)) {
          map.set(r.testCaseId, r.jiraIssueKey);
        }
      });
    return map;
  }, [execution?.results]);

  const latestResults = useMemo(
    () => getLatestResults(execution?.results || []),
    [execution?.results],
  );
  const resultsMap = useMemo(() => {
    const map = new Map();
    latestResults.forEach((r) => {
      const effectiveJira = effectiveJiraMap.get(r.testCaseId);
      map.set(r.testCaseId, {
        ...r,
        effectiveJiraIssueKey: effectiveJira, // 과거 이력 포함 가장 최근 JIRA ID
      });
    });
    return map;
  }, [latestResults, effectiveJiraMap]);

  // ICT-XXX: 공통 유틸리티 함수로 폴더 계층 구조 순서 생성
  const { flattenedData, orderedTestCaseIds: testCaseIds } = useMemo(() => {
    if (!selectedPlan || !testCases || testCases.length === 0) {
      debugLog("TestExecutionForm", "Cannot generate flattened data", {
        hasSelectedPlan: !!selectedPlan,
        testCasesLength: testCases?.length,
      });
      return { flattenedData: [], orderedTestCaseIds: [] };
    }
    return getOrderedTestCaseIds(testCases, selectedPlan.testCaseIds);
  }, [selectedPlan, testCases]);

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    // 1. 필터가 활성화되어 있는지 확인
    const hasActiveFilters = Object.values(filters).some(filterHasValue);

    if (!hasActiveFilters) {
      return flattenedData;
    }

    // 2. 필터에 매칭되는 테스트 케이스 ID 식별
    const matchingTestCaseIds = new Set();
    flattenedData.forEach((node) => {
      if (node.type !== "testcase") return;

      let matches = true;

      // 이름 필터 (콤마로 여러 개 — 하나라도 포함되면 통과)
      if (filters.name && !matchesAnyTerm(node.name, filters.name)) {
        matches = false;
      }

      // 우선순위 필터 (다중 선택 — 선택된 것 중 하나라도 일치하면 통과)
      if (
        matches &&
        filters.priority.length &&
        !filters.priority.includes(node.priority)
      ) {
        matches = false;
      }

      // 결과 필터 (다중 선택) - resultsMap에서 확인
      if (matches && filters.result.length) {
        const resultObj = resultsMap.get(node.id);
        const result = resultObj?.result || "NOTRUN";
        if (!filters.result.includes(result)) {
          matches = false;
        }
      }

      // 실행자, 실행일자, JIRA, 노트 필터 - resultsMap에서 확인
      if (
        matches &&
        (filters.executedBy ||
          filters.executionDate ||
          filters.jiraIssueKey ||
          filters.notes)
      ) {
        const resultObj = resultsMap.get(node.id);

        if (!resultObj) {
          matches = false;
        } else {
          // 실행자 필터 (콤마로 여러 명 — 하나라도 일치하면 통과)
          if (filters.executedBy) {
            const executedBy = resultObj.executedBy;
            let executedByStr = "";

            if (executedBy && typeof executedBy === "object") {
              executedByStr = executedBy.username || executedBy.name || "";
            } else if (executedBy) {
              executedByStr = String(executedBy);
            }

            if (!matchesAnyTerm(executedByStr, filters.executedBy)) {
              matches = false;
            }
          }

          // 실행일자 필터
          if (matches && filters.executionDate) {
            const executedAt = parseDateTime(resultObj.executedAt);

            if (!executedAt) {
              matches = false;
            } else {
              // YYYY-MM-DD 형식 문자열 비교 (로컬 시간 기준)
              const year = executedAt.getFullYear();
              const month = String(executedAt.getMonth() + 1).padStart(2, "0");
              const day = String(executedAt.getDate()).padStart(2, "0");
              const dateString = `${year}-${month}-${day}`;

              if (dateString !== filters.executionDate) {
                matches = false;
              }
            }
          }

          // JIRA 아이디 필터 (콤마로 여러 개 — 두 키 중 하나라도 어느 검색어를 포함하면 통과)
          if (matches && filters.jiraIssueKey) {
            const jiraKey = resultObj.jiraIssueKey || "";
            const effectiveJiraKey = resultObj.effectiveJiraIssueKey || "";
            if (
              !matchesAnyTerm(
                `${jiraKey} ${effectiveJiraKey}`,
                filters.jiraIssueKey,
              )
            ) {
              matches = false;
            }
          }

          // 노트 필터 (콤마로 여러 개 — 하나라도 포함되면 통과)
          if (
            matches &&
            filters.notes &&
            !matchesAnyTerm(resultObj.notes || "", filters.notes)
          ) {
            matches = false;
          }
        }
      }

      if (matches) {
        matchingTestCaseIds.add(node.id);
      }
    });

    // 3. 보여줄 폴더 ID 식별 (매칭된 테스트 케이스의 모든 상위 폴더)
    const folderIdsToShow = new Set();
    if (matchingTestCaseIds.size > 0) {
      // 빠른 조회를 위해 맵 생성
      const idToNode = {};
      flattenedData.forEach((node) => {
        idToNode[node.id] = node;
      });

      matchingTestCaseIds.forEach((id) => {
        let current = idToNode[id];
        // 상위로 올라가며 폴더들을 표시 대상에 추가
        while (current && current.parentId) {
          const parent = idToNode[current.parentId];
          if (parent && parent.type === "folder") {
            if (folderIdsToShow.has(parent.id)) break; // 이미 추가된 상위 구조
            folderIdsToShow.add(parent.id);
            current = parent;
          } else {
            break;
          }
        }
      });
    }

    // 4. 매칭된 케이스와 관련 폴더만 반환
    return flattenedData.filter(
      (node) =>
        matchingTestCaseIds.has(node.id) || folderIdsToShow.has(node.id),
    );
  }, [flattenedData, filters, resultsMap]);

  // 필터가 적용된 목록 기준 이전/다음 네비게이션을 위한 테스트케이스 ID 배열
  // (선택 케이스가 필터 목록에 없으면 전체 목록으로 폴백)
  const navTestCaseIds = useMemo(
    () =>
      getFilteredNavTestCaseIds(filteredData, testCaseIds, selectedTestCaseId),
    [filteredData, testCaseIds, selectedTestCaseId],
  );

  // 전체화면 결과 뷰(TestCaseResultPage)가 동일한 필터 순서로 이동하도록,
  // 필터된 테스트케이스 ID 목록을 실행별 sessionStorage에 보존한다.
  useEffect(() => {
    const filteredIds = filteredData
      .filter((node) => node.type === "testcase")
      .map((node) => node.id);
    saveFilteredNavIds(executionId, filteredIds);
  }, [executionId, filteredData]);
  const { stats: statusCounts, progressPercent: progress } = useMemo(() => {
    // testCaseIds(플랜의 실제 케이스 목록)를 기준으로 각 상태를 카운팅
    // resultsMap.values() 기반 계산은 재실행 이력이 많을 때 카운트가 부풀려지는 버그가 있었음
    const total = testCaseIds.length;
    let pass = 0;
    let fail = 0;
    let blocked = 0;
    let completedCount = 0;

    testCaseIds.forEach((id) => {
      const result = resultsMap.get(id);
      const resultValue = result?.result;
      if (resultValue === "PASS") {
        pass++;
        completedCount++;
      } else if (resultValue === "FAIL") {
        fail++;
        completedCount++;
      } else if (resultValue === "BLOCKED") {
        blocked++;
        completedCount++;
      }
      // NOTRUN이거나 결과가 없는 경우 미실행으로 처리 (별도 카운팅 불필요)
    });

    const notRun = Math.max(0, total - completedCount);
    const progressPercent =
      total > 0 ? Math.min(100, Math.round((completedCount / total) * 100)) : 0;

    return {
      stats: {
        PASS: pass,
        FAIL: fail,
        BLOCKED: blocked,
        NOTRUN: notRun,
        total,
      },
      progressPercent,
    };
  }, [resultsMap, testCaseIds]);

  // 인피니티 스크롤을 위한 데이터 추출
  const visibleData = useMemo(() => {
    return filteredData.slice(0, visibleCount);
  }, [filteredData, visibleCount]);

  const hasMore = visibleCount < filteredData.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => prev + 50);
    }
  }, [hasMore]);

  // 필터가 변경될 때 표시 개수 초기화
  useEffect(() => {
    setVisibleCount(50);
  }, [filters]);

  // 스크롤 복구 로직 (scrollTo 쿼리 파라미터 처리)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const scrollToId = searchParams.get("scrollTo");

    if (scrollToId && filteredData.length > 0) {
      // 1. 해당 ID가 필터링된 데이터에 있는지 확인 및 인덱스 찾기
      const targetIndex = filteredData.findIndex(
        (item) => item.id === scrollToId,
      );

      if (targetIndex !== -1) {
        // 2. 현재 visibleCount보다 뒤에 있다면 visibleCount 확장
        if (targetIndex >= visibleCount) {
          // 인덱스를 포함하도록 50 단위로 올림하여 확장
          const newCount = Math.ceil((targetIndex + 1) / 50) * 50;
          setVisibleCount(newCount);
          // visibleCount가 업데이트된 후 다음 렌더링에서 스크롤을 시도해야 하므로 여기서 중단
          return;
        }

        // 3. 렌더링이 완료된 후 스크롤 실행 (setTimeout으로 렌더링 대기)
        const timer = setTimeout(() => {
          const element = document.getElementById(
            `execution-row-${scrollToId}`,
          );
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });

            // 4. 스크롤 후 쿼리 파라미터 제거 (반복 방지)
            const newParams = new URLSearchParams(location.search);
            newParams.delete("scrollTo");
            const newSearch = newParams.toString();
            navigate(
              {
                pathname: location.pathname,
                search: newSearch ? `?${newSearch}` : "",
              },
              { replace: true },
            );
          }
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [
    location.search,
    filteredData,
    visibleCount,
    navigate,
    location.pathname,
  ]);

  // 필터 관련 핸들러
  const handleFilterChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleFilterApply = useCallback(() => {
    setVisibleCount(50); // 필터 적용 시 표시 개수 초기화
  }, []);

  const handleFilterClear = useCallback(() => {
    setFilters({ ...EMPTY_FILTERS });
    setVisibleCount(50);
  }, []);

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 4,
          minHeight: "60vh",
        }}
      >
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
      <TestExecutionHeader
        executionId={executionId}
        executionName={execution?.name}
        execution={execution}
        onCancel={onCancel}
        onGoToList={handleGoToList}
        onSaveOrUpdate={handleSaveOrUpdate}
        saving={saving}
        canEditBasicInfo={canEditBasicInfo}
        canEditPlan={canEditPlan}
        startImmediately={startImmediately}
        showExecutionGuide={showExecutionGuide}
        setShowExecutionGuide={setShowExecutionGuide}
        isEditingBasicInfo={isEditingBasicInfo}
        onEditClick={handleEditClick}
        onCancelEdit={handleCancelEditFromHeader}
      />

      {/* 실행 요약 정보 (Info & Status) - Accordion 적용 */}
      <Accordion
        expanded={accordionExpanded.executionSummary}
        onChange={handleAccordionChange("executionSummary")}
        sx={{
          mb: 2,
          boxShadow: "none",
          border: "1px solid",
          borderColor: "divider",
          "&:before": { display: "none" },
          borderRadius: "8px !important",
          overflow: "hidden",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <AssessmentIcon color="primary" />
            <Typography variant="subtitle1" fontWeight="bold">
              {t("testExecution.executionSummary", "실행 요약")}
            </Typography>
            {!accordionExpanded.executionSummary && execution && (
              <Box
                sx={{ display: "flex", gap: 2, ml: 2, alignItems: "center" }}
              >
                <Chip
                  label={execution.status}
                  size="small"
                  color={
                    execution.status === ExecutionStatus.COMPLETED
                      ? "success"
                      : execution.status === ExecutionStatus.INPROGRESS
                        ? "primary"
                        : "default"
                  }
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.7rem", fontWeight: "bold" }}
                />
                <Typography variant="caption" color="text.secondary">
                  {t("testExecution.progress", "진행률")}: {progress}%
                </Typography>
                <Box sx={{ width: 100 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 4, borderRadius: 2 }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 2 }}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 6, lg: 5 }}>
              <TestExecutionInfo
                execution={execution}
                handleChange={handleChange}
                testPlans={testPlans}
                handlePlanChange={handlePlanChange}
                availableTags={availableTags}
                setExecution={setExecution}
                canEditBasicInfo={canEditBasicInfo}
                canEditPlan={canEditPlan}
                startImmediately={startImmediately}
                setStartImmediately={setStartImmediately}
                executionId={executionId}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 7 }}>
              <TestExecutionStatus
                execution={execution}
                statusCounts={statusCounts}
                progress={progress}
                canStartExecution={canStartExecution}
                canCompleteExecution={canCompleteExecution}
                canRestartExecution={canRestartExecution}
                handleStartExecution={handleStartExecution}
                handleCompleteExecution={handleCompleteExecution}
                handleRestartExecution={handleRestartExecution}
                saving={saving}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Box sx={{ my: 3 }}>
        <Accordion
          expanded={accordionExpanded.filters}
          onChange={handleAccordionChange("filters")}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">
              {t("testExecution.sections.filters", "필터")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TestExecutionFilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onApply={handleFilterApply}
              onClear={handleFilterClear}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={accordionExpanded.list}
          onChange={handleAccordionChange("list")}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">
              {t("testExecution.sections.list", "테스트 실행 목록")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {selectedTestCases.size > 0 && (
              <Box
                sx={{
                  my: 2,
                  p: 2,
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {t(
                    "testExecution.bulk.selectedCount",
                    "{count}개 선택됨",
                  ).replace("{count}", selectedTestCases.size)}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedTestCases(new Set())}
                  >
                    {t(
                      "testExecution.bulk.actionToolbar.deselect",
                      "선택 해제",
                    )}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleBulkActionClick("PASS")}
                    sx={{
                      bgcolor: RESULT_COLORS.PASS,
                      border: `2px solid ${RESULT_COLORS.PASS}`,
                      "&:hover": { bgcolor: alpha(RESULT_COLORS.PASS, 0.8) },
                      fontWeight: 600,
                      textTransform: "uppercase",
                      boxShadow: `0 2px 8px ${alpha(RESULT_COLORS.PASS, 0.3)}`,
                    }}
                  >
                    PASS
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleBulkActionClick("FAIL")}
                    sx={{
                      bgcolor: RESULT_COLORS.FAIL,
                      border: `2px solid ${RESULT_COLORS.FAIL}`,
                      "&:hover": { bgcolor: alpha(RESULT_COLORS.FAIL, 0.8) },
                      fontWeight: 600,
                      textTransform: "uppercase",
                      boxShadow: `0 2px 8px ${alpha(RESULT_COLORS.FAIL, 0.3)}`,
                    }}
                  >
                    FAIL
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleBulkActionClick("BLOCKED")}
                    sx={{
                      bgcolor: RESULT_COLORS.BLOCKED,
                      border: `2px solid ${RESULT_COLORS.BLOCKED}`,
                      "&:hover": { bgcolor: alpha(RESULT_COLORS.BLOCKED, 0.8) },
                      fontWeight: 600,
                      textTransform: "uppercase",
                      boxShadow: `0 2px 8px ${alpha(
                        RESULT_COLORS.BLOCKED,
                        0.3,
                      )}`,
                    }}
                  >
                    BLOCKED
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleBulkActionClick("NOT_RUN")}
                    sx={{
                      bgcolor: RESULT_COLORS.NOTRUN,
                      border: `2px solid ${RESULT_COLORS.NOTRUN}`,
                      "&:hover": { bgcolor: alpha(RESULT_COLORS.NOTRUN, 0.8) },
                      fontWeight: 600,
                      textTransform: "uppercase",
                      boxShadow: `0 2px 8px ${alpha(
                        RESULT_COLORS.NOTRUN,
                        0.3,
                      )}`,
                    }}
                  >
                    NOT RUN
                  </Button>
                </Box>
              </Box>
            )}

            <TestExecutionTable
              visibleData={visibleData}
              resultsMap={resultsMap}
              totalItems={
                filteredData.filter((n) => n.type === "testcase").length
              }
              hasMore={hasMore}
              loadMore={loadMore}
              handleOpenResultForm={handleOpenResultForm}
              handleShowPrevResults={handleShowPrevResults}
              handleAttachmentClick={handleAttachmentClick}
              handleCopyLink={handleCopyLink}
              canEnterResults={canEnterResults}
              selectedTestCases={selectedTestCases}
              onSelectionChange={handleSelectionChange}
            />
          </AccordionDetails>
        </Accordion>
      </Box>

      {isResultFormOpen && selectedTestCaseId && execution?.id && (
        <TestResultForm
          open={isResultFormOpen}
          testCaseId={selectedTestCaseId}
          executionId={execution.id}
          currentResult={resultsMap?.get(selectedTestCaseId)}
          onClose={handleCloseResultForm}
          onSave={handleSaveResult}
          onNext={() => {
            const currentIndex = navTestCaseIds.indexOf(selectedTestCaseId);
            if (currentIndex >= 0 && currentIndex < navTestCaseIds.length - 1) {
              const nextTestCaseId = navTestCaseIds[currentIndex + 1];
              setSelectedTestCaseId(nextTestCaseId);
            }
          }}
          onPrevious={() => {
            const currentIndex = navTestCaseIds.indexOf(selectedTestCaseId);
            if (currentIndex > 0) {
              const prevTestCaseId = navTestCaseIds[currentIndex - 1];
              setSelectedTestCaseId(prevTestCaseId);
            }
          }}
          currentIndex={navTestCaseIds.indexOf(selectedTestCaseId)}
          totalCount={navTestCaseIds.length}
          onOpenFullPage={() => {
            const projectId =
              propProjectId ||
              execution?.projectId ||
              execution?.testPlan?.projectId ||
              activeProject?.id;
            if (projectId && execution?.id && selectedTestCaseId) {
              navigate(
                `/projects/${projectId}/executions/${execution.id}/testcases/${selectedTestCaseId}/result`,
              );
              handleCloseResultForm();
            } else {
              console.error(
                t(
                  "testExecution.form.fullPageNavError",
                  "전체 화면 네비게이션 실패: projectId, executionId, testCaseId 중 하나가 없습니다",
                ),
              );
            }
          }}
        />
      )}
      <PreviousResultsDialog
        open={isPrevResultsOpen}
        onClose={() => setIsPrevResultsOpen(false)}
        results={prevResults}
        loading={prevResultsLoading}
        onAttachmentDeleted={handleAttachmentChange}
        currentExecutionId={execution?.id}
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
          {t("testExecution.attachments.title", "첨부파일")}
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
          <Button
            onClick={() => {
              setAttachmentDialogOpen(false);
              setSelectedTestResultId(null);
            }}
          >
            {t("common.close", "닫기")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 일괄 결과 입력 다이얼로그 */}
      <BulkResultDialog
        open={isBulkDialogOpen}
        onClose={() => setIsBulkDialogOpen(false)}
        selectedTestCases={flattenedData.filter(
          (item) => selectedTestCases.has(item.id) && item.type !== "folder",
        )}
        availableTags={availableTags}
        onBulkUpdate={handleBulkUpdate}
        processing={bulkProcessing}
        preselectedResult={preselectedResult}
      />

      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(undefined)}
      >
        <Alert severity="error" onClose={() => setSaveError(undefined)}>
          {saveError}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={8000}
        onClose={() => setSuccessMessage(undefined)}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(undefined)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

TestExecutionForm.propTypes = {
  executionId: PropTypes.string,
  projectId: PropTypes.string,
  initialTestPlanId: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default TestExecutionForm;
