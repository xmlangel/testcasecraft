import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box, Grid, CircularProgress, Alert, Snackbar, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { useAppContext } from "../context/AppContext.jsx";
import { useTranslation } from '../context/I18nContext.jsx';
import { RESULT_COLORS } from '../constants/statusColors';
import { ExecutionStatus, TestResult } from "../models/testExecution.jsx";
import TestResultForm from "./TestResultForm.jsx";
import { calculateExecutionProgress } from "../utils/progressUtils.jsx";
import { getOrderedTestCaseIds } from "../utils/treeUtils.jsx";
import { useNavigate } from "react-router-dom";
import { invalidateDashboardCache } from "../services/dashboardService";
import { PAGE_CONTAINER_SX } from '../styles/layoutConstants';
import TestResultAttachmentsView from './TestCase/TestResultAttachmentsView.jsx';
import { debugLog } from '../utils/logger';

// New Components
import TestExecutionHeader from './TestExecution/TestExecutionHeader.jsx';
import TestExecutionInfo from './TestExecution/TestExecutionInfo.jsx';
import TestExecutionStatus from './TestExecution/TestExecutionStatus.jsx';
import TestExecutionTable from './TestExecution/TestExecutionTable.jsx';
import TestExecutionFilterPanel from './TestExecution/TestExecutionFilterPanel.jsx';
import PreviousResultsDialog from './TestExecution/PreviousResultsDialog.jsx';
import BulkResultDialog from './TestExecution/BulkResultDialog.jsx';
import { getLatestResults, parseDateTime } from './TestExecution/utils.jsx';

const TestExecutionForm = ({ executionId, projectId: propProjectId, initialTestPlanId, onCancel, onSave }) => {
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
  const [currentPrevResultsTestCaseId, setCurrentPrevResultsTestCaseId] = useState(null);

  // ICT-362: 첨부파일 다이얼로그 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // ICT-362: 첨부파일 다이얼로그 상태
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [selectedTestResultId, setSelectedTestResultId] = useState(null);

  // 태그 자동완성을 위한 기존 태그 목록
  const [availableTags, setAvailableTags] = useState([]);

  // 일괄 결과 입력 관련 상태
  const [selectedTestCases, setSelectedTestCases] = useState(new Set());
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // 필터 관련 상태
  const [filters, setFilters] = useState({
    name: '',
    priority: '',
    result: '',
    executedBy: '',
    executionDate: '',
    jiraIssueKey: '',
    notes: ''
  });

  // Accordion state
  const [accordionExpanded, setAccordionExpanded] = useState(() => {
    const saved = localStorage.getItem('testcase-manager-execution-accordion');
    return saved ? JSON.parse(saved) : {
      filters: true,
      list: true
    };
  });

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    const newExpanded = { ...accordionExpanded, [panel]: isExpanded };
    setAccordionExpanded(newExpanded);
    localStorage.setItem('testcase-manager-execution-accordion', JSON.stringify(newExpanded));
  };

  const theme = useTheme();
  const navigate = useNavigate();

  // 프로젝트의 기존 태그 목록 조회
  useEffect(() => {
    if (!execution?.projectId) return;

    const fetchTags = async () => {
      try {
        const response = await api(`/api/testcases/projects/${execution.projectId}/tags`);
        if (response.ok) {
          const tags = await response.json();
          setAvailableTags(Array.from(tags));
        }
      } catch (error) {
        console.error('태그 목록 조회 실패:', error);
      }
    };

    fetchTags();
  }, [execution?.projectId, api]);

  useEffect(() => {
    const fetchExecution = async () => {
      // 새 실행 등록 페이지인 경우
      if (!executionId || executionId === 'new') {
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
              api(`/api/test-plans/${initialTestPlanId}`).then(res => {
                if (res.ok) return res.json();
                throw new Error('Failed to fetch test plan');
              }).then(data => {
                setSelectedPlan(data);
              }).catch(err => {
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
        if (!res.ok) throw new Error("실행 정보를 불러오지 못했습니다.");
        const data = await res.json();

        setExecution(data);
        debugLog('TestExecutionForm', 'Execution data fetched', data);

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
        console.error("테스트 실행 정보 조회 오류:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // executionId 변경 시 항상 fetchExecution 실행 (초기화 포함)
    fetchExecution();
  }, [executionId, getTestPlan, api, isImmediateExecuting, activeProject, initialTestPlanId]);

  // testCases가 비어있을 때 명시적으로 로드
  // execution.projectId 또는 activeProject.id를 사용하여 testCases 로드
  useEffect(() => {
    const projectId = execution?.projectId || activeProject?.id;

    debugLog('TestExecutionForm', 'Check testCases loading', {
      projectId,
      testCasesLength: testCases?.length,
      executionProjectId: execution?.projectId,
      activeProjectId: activeProject?.id
    });

    if (projectId && (!testCases || testCases.length === 0)) {
      debugLog('TestExecutionForm', 'Fetching project test cases', projectId);
      fetchProjectTestCases(projectId);
    }
  }, [execution?.projectId, activeProject?.id, testCases, fetchProjectTestCases]);

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

          // 즉시 실행 완료 표시 및 성공 메시지
          setSuccessMessage(`테스트 실행 '${started.name}'이 성공적으로 저장되고 시작되었습니다. 이제 테스트 케이스별 결과를 입력할 수 있습니다.`);

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
        console.error('Failed to invalidate dashboard cache:', e);
      }

      if (!options.keepDialogOpen) {
        handleCloseResultForm();
      }
    },
    [fetchTestExecutions, handleCloseResultForm]
  );

  // 프로젝트별 테스트 실행 목록으로 이동
  const handleGoToList = () => {
    // api() 함수가 자동으로 토큰 갱신을 처리하므로 명시적 검증 불필요
    if (activeProject?.id) {
      navigate(`/projects/${activeProject.id}/executions`);
    } else {
      navigate("/executions");
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
    [fetchTestExecutionsByTestCase]
  );

  // ICT-362: 첨부파일 버튼 클릭 핸들러
  const handleAttachmentClick = useCallback((testResultId) => {
    setSelectedTestResultId(testResultId);
    setAttachmentDialogOpen(true);
  }, []);

  // 체크박스 선택 핸들러
  const handleSelectionChange = useCallback((testCaseId, checked) => {
    setSelectedTestCases(prev => {
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

  const handleBulkActionClick = useCallback((result) => {
    if (selectedTestCases.size > 0) {
      setPreselectedResult(result);
      setIsBulkDialogOpen(true);
    }
  }, [selectedTestCases]);

  // 일괄 결과 업데이트
  const handleBulkUpdate = useCallback(async ({ result, notes, tags: newTags, jiraIssueKey }) => {
    if (!execution?.id) return;

    setBulkProcessing(true);
    const testCaseArray = Array.from(selectedTestCases);

    try {
      // 일괄 API 호출
      const response = await api(`/api/test-executions/${execution.id}/results/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCaseIds: testCaseArray,
          result,
          notes,
          tags: newTags,
          jiraIssueKey
        })
      });

      if (response.ok) {
        const updatedExecution = await response.json();
        setExecution(updatedExecution);

        // 성공 메시지 표시
        setSuccessMessage(t('testExecution.bulk.success', '{count}개 테스트케이스 결과가 저장되었습니다').replace('{count}', testCaseArray.length));

        // 대시보드 캐시 무효화
        invalidateDashboardCache();

        // 선택 해제 및 다이얼로그 닫기
        setSelectedTestCases(new Set());
        setIsBulkDialogOpen(false);
      } else {
        const errorData = await response.json().catch(() => ({ message: '알 수 없는 오류' }));
        setSaveError(t('testExecution.bulk.error', '일괄 결과 저장 중 오류 발생: {error}').replace('{error}', errorData.message || response.statusText));
      }
    } catch (err) {
      setSaveError(t('testExecution.bulk.error', '일괄 결과 저장 중 오류 발생: {error}').replace('{error}', err.message));
    } finally {
      setBulkProcessing(false);
    }
  }, [execution?.id, selectedTestCases, api, t]);

  const canEditBasicInfo = execution?.status === ExecutionStatus.NOTSTARTED;
  const canStartExecution = execution?.status === ExecutionStatus.NOTSTARTED && !!execution?.testPlanId;
  const canCompleteExecution = execution?.status === ExecutionStatus.INPROGRESS;
  const canRestartExecution = execution?.status === ExecutionStatus.COMPLETED;
  const canEnterResults = execution?.status === ExecutionStatus.INPROGRESS;

  const latestResults = useMemo(() => getLatestResults(execution?.results || []), [execution?.results]);
  const resultsMap = useMemo(() => {
    const map = new Map();
    latestResults.forEach((r) => map.set(r.testCaseId, r.result));
    return map;
  }, [latestResults]);

  const progress = useMemo(
    () => calculateExecutionProgress(execution, selectedPlan, testCases),
    [execution, selectedPlan, testCases]
  );

  // ICT-XXX: 공통 유틸리티 함수로 폴더 계층 구조 순서 생성
  const { flattenedData, orderedTestCaseIds: testCaseIds } = useMemo(() => {
    if (!selectedPlan || !testCases || testCases.length === 0) {
      debugLog('TestExecutionForm', 'Cannot generate flattened data', {
        hasSelectedPlan: !!selectedPlan,
        testCasesLength: testCases?.length
      });
      return { flattenedData: [], orderedTestCaseIds: [] };
    }
    return getOrderedTestCaseIds(testCases, selectedPlan.testCaseIds);
  }, [selectedPlan, testCases]);

  // 필터링된 데이터
  const filteredData = useMemo(() => {
    return flattenedData.filter(node => {
      // 폴더는 항상 표시
      if (node.type === 'folder') return true;

      // 이름 필터
      if (filters.name) {
        if (!node.name.toLowerCase().includes(filters.name.trim().toLowerCase())) {
          return false;
        }
      }

      // 우선순위 필터
      if (filters.priority && node.priority !== filters.priority) {
        return false;
      }

      // 결과 필터 - latestResults에서 확인
      if (filters.result) {
        const resultObj = latestResults?.find(r => r.testCaseId === node.id);
        const result = resultObj?.result || 'NOTRUN';
        if (result !== filters.result) {
          return false;
        }
      }

      // 실행자, 실행일자, JIRA, 노트 필터 - latestResults에서 확인
      if (filters.executedBy || filters.executionDate || filters.jiraIssueKey || filters.notes) {
        const resultObj = latestResults?.find(r => r.testCaseId === node.id);

        if (!resultObj) {
          // 결과가 없으면 필터 조건을 만족할 수 없음
          return false;
        }

        // 실행자 필터
        if (filters.executedBy) {
          const executedBy = resultObj.executedBy;
          let executedByStr = '';

          if (executedBy && typeof executedBy === 'object') {
            executedByStr = executedBy.username || executedBy.name || '';
          } else if (executedBy) {
            executedByStr = String(executedBy);
          }

          if (!executedByStr.toLowerCase().includes(filters.executedBy.trim().toLowerCase())) {
            return false;
          }
        }

        // 실행일자 필터
        if (filters.executionDate) {
          const executedAt = parseDateTime(resultObj.executedAt);

          if (!executedAt) {
            return false;
          }

          // YYYY-MM-DD 형식 문자열 비교 (로컬 시간 기준)
          const year = executedAt.getFullYear();
          const month = String(executedAt.getMonth() + 1).padStart(2, '0');
          const day = String(executedAt.getDate()).padStart(2, '0');
          const dateString = `${year}-${month}-${day}`;

          if (dateString !== filters.executionDate) {
            return false;
          }
        }

        // JIRA 아이디 필터
        if (filters.jiraIssueKey) {
          const jiraKey = resultObj.jiraIssueKey || '';
          if (!jiraKey.toLowerCase().includes(filters.jiraIssueKey.trim().toLowerCase())) {
            return false;
          }
        }

        // 노트 필터
        if (filters.notes) {
          const notes = resultObj.notes || '';
          if (!notes.toLowerCase().includes(filters.notes.trim().toLowerCase())) {
            return false;
          }
        }
      }

      return true;
    });
  }, [flattenedData, filters, latestResults]);

  // ICT-273: 페이지네이션을 위한 totalItems, totalPages 계산
  const { totalItems, totalPages } = useMemo(() => {
    const total = filteredData.length;
    const pages = Math.ceil(total / itemsPerPage);
    return { totalItems: total, totalPages: pages };
  }, [filteredData, itemsPerPage]);

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

  // ICT-273: 현재 페이지의 데이터만 추출
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((event, page) => {
    setCurrentPage(page);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  }, []);

  // 필터 관련 핸들러
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleFilterApply = useCallback(() => {
    setCurrentPage(1); // 필터 적용 시 첫 페이지로 이동
  }, []);

  const handleFilterClear = useCallback(() => {
    setFilters({
      name: '',
      priority: '',
      result: '',
      executedBy: '',
      executionDate: '',
      jiraIssueKey: '',
      notes: ''
    });
    setCurrentPage(1);
  }, []);

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
      <TestExecutionHeader
        executionId={executionId}
        executionName={execution?.name}
        execution={execution}
        onCancel={onCancel}
        onGoToList={handleGoToList}
        onSaveOrUpdate={handleSaveOrUpdate}
        saving={saving}
        canEditBasicInfo={canEditBasicInfo}
        startImmediately={startImmediately}
        showExecutionGuide={showExecutionGuide}
        setShowExecutionGuide={setShowExecutionGuide}
      />

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
      <Box sx={{ my: 3 }}>
        <Accordion expanded={accordionExpanded.filters} onChange={handleAccordionChange('filters')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">{t('testExecution.sections.filters', '필터')}</Typography>
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

        <Accordion expanded={accordionExpanded.list} onChange={handleAccordionChange('list')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">{t('testExecution.sections.list', '테스트 실행 목록')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {selectedTestCases.size > 0 && (
              <Box sx={{ my: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {t('testExecution.bulk.selectedCount', '{count}개 선택됨').replace('{count}', selectedTestCases.size)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedTestCases(new Set())}
                  >
                    {t('testExecution.bulk.actionToolbar.deselect', '선택 해제')}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleBulkActionClick('PASS')}
                    sx={{
                      bgcolor: RESULT_COLORS.PASS,
                      border: `2px solid ${RESULT_COLORS.PASS}`,
                      '&:hover': { bgcolor: alpha(RESULT_COLORS.PASS, 0.8) },
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      boxShadow: `0 2px 8px ${alpha(RESULT_COLORS.PASS, 0.3)}`
                    }}
                  >
                    PASS
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleBulkActionClick('FAIL')}
                    sx={{
                      bgcolor: RESULT_COLORS.FAIL,
                      border: `2px solid ${RESULT_COLORS.FAIL}`,
                      '&:hover': { bgcolor: alpha(RESULT_COLORS.FAIL, 0.8) },
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      boxShadow: `0 2px 8px ${alpha(RESULT_COLORS.FAIL, 0.3)}`
                    }}
                  >
                    FAIL
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleBulkActionClick('BLOCKED')}
                    sx={{
                      bgcolor: RESULT_COLORS.BLOCKED,
                      border: `2px solid ${RESULT_COLORS.BLOCKED}`,
                      '&:hover': { bgcolor: alpha(RESULT_COLORS.BLOCKED, 0.8) },
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      boxShadow: `0 2px 8px ${alpha(RESULT_COLORS.BLOCKED, 0.3)}`
                    }}
                  >
                    BLOCKED
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleBulkActionClick('NOT_RUN')}
                    sx={{
                      bgcolor: RESULT_COLORS.NOTRUN,
                      border: `2px solid ${RESULT_COLORS.NOTRUN}`,
                      '&:hover': { bgcolor: alpha(RESULT_COLORS.NOTRUN, 0.8) },
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      boxShadow: `0 2px 8px ${alpha(RESULT_COLORS.NOTRUN, 0.3)}`
                    }}
                  >
                    NOT RUN
                  </Button>
                </Box>
              </Box>
            )}

            <TestExecutionTable
              paginatedData={paginatedData}
              latestResults={latestResults}
              totalItems={totalItems}
              totalPages={totalPages}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              handlePageChange={handlePageChange}
              handleRowsPerPageChange={handleRowsPerPageChange}
              handleOpenResultForm={handleOpenResultForm}
              handleShowPrevResults={handleShowPrevResults}
              handleAttachmentClick={handleAttachmentClick}
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
          currentResult={latestResults?.find((r) => r.testCaseId === selectedTestCaseId)}
          onClose={handleCloseResultForm}
          onSave={handleSaveResult}
          onNext={() => {
            const currentIndex = testCaseIds.indexOf(selectedTestCaseId);
            if (currentIndex >= 0 && currentIndex < testCaseIds.length - 1) {
              const nextTestCaseId = testCaseIds[currentIndex + 1];
              setSelectedTestCaseId(nextTestCaseId);
            }
          }}
          onPrevious={() => {
            const currentIndex = testCaseIds.indexOf(selectedTestCaseId);
            if (currentIndex > 0) {
              const prevTestCaseId = testCaseIds[currentIndex - 1];
              setSelectedTestCaseId(prevTestCaseId);
            }
          }}
          currentIndex={testCaseIds.indexOf(selectedTestCaseId)}
          totalCount={testCaseIds.length}
          onOpenFullPage={() => {
            // prop으로 받은 projectId를 우선 사용, 없으면 execution.projectId 또는 testPlan.projectId 사용
            const projectId = propProjectId || execution?.projectId || execution?.testPlan?.projectId || activeProject?.id;
            if (projectId && execution?.id && selectedTestCaseId) {
              navigate(`/projects/${projectId}/executions/${execution.id}/testcases/${selectedTestCaseId}/result`);
              handleCloseResultForm();
            } else {
              console.error('전체 화면 네비게이션 실패: projectId, executionId, testCaseId 중 하나가 없습니다', {
                propProjectId,
                executionProjectId: execution?.projectId,
                testPlanProjectId: execution?.testPlan?.projectId,
                activeProjectId: activeProject?.id,
                executionId: execution?.id,
                selectedTestCaseId
              });
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

      {/* 일괄 결과 입력 다이얼로그 */}
      <BulkResultDialog
        open={isBulkDialogOpen}
        onClose={() => setIsBulkDialogOpen(false)}
        selectedTestCases={flattenedData.filter(item => selectedTestCases.has(item.id) && item.type !== 'folder')}
        availableTags={availableTags}
        onBulkUpdate={handleBulkUpdate}
        processing={bulkProcessing}
        preselectedResult={preselectedResult}
      />

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
  projectId: PropTypes.string,
  initialTestPlanId: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default TestExecutionForm;
