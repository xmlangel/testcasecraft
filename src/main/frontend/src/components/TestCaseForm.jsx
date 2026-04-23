// src/components/TestCaseForm.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Save as SaveVersionIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material";
import { useAppContext } from "../context/AppContext.jsx";
import { createTestStep } from "../models/testCase.jsx";
import TestCaseVersionHistory from "./TestCase/TestCaseVersionHistory.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import TestCaseAttachments from "./TestCase/TestCaseAttachments.jsx";
import { useRAG } from "../context/RAGContext.jsx";
import useInlineImagePaste from "../hooks/useInlineImagePaste.js";
import useAutoSave from "../hooks/useAutoSave.js";
import {
  resolveFieldValue,
  applyFieldValueToState,
  extractAttachmentIds,
} from "../utils/testCaseFormUtils.js";

// 분리된 컴포넌트 import
import TestCaseFormHeader from "./TestCase/TestCaseFormHeader.jsx";
import TestCaseFormMetadata from "./TestCase/TestCaseFormMetadata.jsx";
import TestCaseBasicInfo from "./TestCase/TestCaseBasicInfo.jsx";
import TestStepsTable from "./TestCase/TestStepsTable.jsx";
import MarkdownFieldEditor from "./TestCase/MarkdownFieldEditor.jsx";
import InlineImageDialog from "./TestCase/InlineImageDialog.jsx";
import VersionDialog from "./TestCase/VersionDialog.jsx";
import FolderForm from "./TestCase/FolderForm.jsx";
import TestCaseExecutionHistory from "./TestCaseExecutionHistory.jsx";
import RagStatusBadge from "./TestCase/RagStatusBadge.jsx";

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`testcase-tabpanel-${index}`}
      aria-labelledby={`testcase-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0, pt: 2 }}>{children}</Box>}
    </div>
  );
};

const TestCaseForm = ({ testCaseId, projectId, onSave, initialData }) => {
  const {
    testCases,
    updateTestCase,
    updateTestCaseLocal,
    addTestCase,
    user,
    api,
  } = useAppContext();
  const { t } = useI18n();
  const theme = useTheme();
  const { state: ragState, listDocuments, isRagEnabled } = useRAG();
  const navigate = useNavigate();
  const location = useLocation();

  // 상태 관리
  const [testCase, setTestCase] = useState(null);
  const [errors, setErrors] = useState({});
  const [maxStepNumber, setMaxStepNumber] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarError, setSnackbarError] = useState();
  const [isSaving, setIsSaving] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [testCaseInfoOpen, setTestCaseInfoOpen] = useState(true);
  const [folderInfoOpen, setFolderInfoOpen] = useState(true);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [versionDescription, setVersionDescription] = useState("");
  const [savingVersion, setSavingVersion] = useState(false);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [renderKey, setRenderKey] = useState(0);
  const [availableTags, setAvailableTags] = useState([]);
  const [isStepMarkdownMode, setIsStepMarkdownMode] = useState(true);
  const [linkedDocuments, setLinkedDocuments] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  // AI 메타 생성 상태
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isLlmAvailable, setIsLlmAvailable] = useState(false);
  const [autoAiMode, setAutoAiMode] = useState(() => {
    return localStorage.getItem("testcase-ai-auto-mode") === "true";
  });
  const autoAiDebounceRef = useRef(null);
  const prevStepsLengthRef = useRef(0);
  const isAiGeneratingRef = useRef(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // 자동 저장용 formData: testCase + linkedDocumentIds 합산 (변경 감지 단위)
  const autoSaveData = useMemo(() => {
    if (!testCase) return null;
    return {
      ...testCase,
      _linkedDocIds: linkedDocuments.map((d) => d.id),
    };
  }, [testCase, linkedDocuments]);

  // 자동 저장 함수 (useAutoSave 훅에 전달)
  const autoSaveFn = useCallback(
    async (data) => {
      if (!data?.name?.trim()) return;
      const { _linkedDocIds, ...tcData } = data;
      const payload = {
        ...tcData,
        projectId,
        steps: tcData.steps?.map((step) => ({
          stepNumber: step.stepNumber,
          description: step.description,
          expectedResult: step.expectedResult,
        })),
        linkedDocumentIds: _linkedDocIds,
      };
      await updateTestCase(payload);
    },
    [projectId, updateTestCase],
  );

  const isViewerForAutoSave = user?.role === "VIEWER";

  const { autoSaveStatus, autoSaveError, markSaved } = useAutoSave({
    id: testCaseId,
    data: autoSaveData,
    saveFn: autoSaveFn,
    disabled: isViewerForAutoSave || !testCaseId,
    debounceMs: 1500,
    t,
  });

  // Accordion 상태 관리 (localStorage 연동)
  const [accordionExpanded, setAccordionExpanded] = useState(() => {
    const saved = localStorage.getItem("testcase-manager-form-accordion");
    return saved
      ? JSON.parse(saved)
      : {
          basicInfo: true,
          steps: true,
          expectedResults: true,
          attachments: true,
        };
  });

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    const newExpanded = { ...accordionExpanded, [panel]: isExpanded };
    setAccordionExpanded(newExpanded);
    localStorage.setItem(
      "testcase-manager-form-accordion",
      JSON.stringify(newExpanded),
    );
  };

  const isViewer = user?.role === "VIEWER";
  const isFolder = testCase?.type === "folder";

  // 현재 버전 정보 조회
  const fetchCurrentVersion = async (tcId) => {
    if (!tcId) return;
    try {
      const response = await api(
        `/api/testcase-versions/testcase/${tcId}/current`,
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentVersion(data.data);
      } else if (response.status === 404) {
        // No version exists yet - this is normal for new test cases
        setCurrentVersion(null);
      }
    } catch (error) {
      // Only log actual errors, not 404s (no version is normal state)
      if (error.status !== 404 && error.response?.status !== 404) {
        console.error(
          t("testcase.version.current.fetchError", "현재 버전 조회 실패:"),
          error,
        );
      } else {
        setCurrentVersion(null);
      }
    }
  };

  // 프로젝트의 기존 태그 목록 조회
  useEffect(() => {
    if (!projectId) return;
    const fetchTags = async () => {
      try {
        const response = await api(`/api/testcases/projects/${projectId}/tags`);
        if (response.ok) {
          const tags = await response.json();
          setAvailableTags(Array.from(tags));
        }
      } catch (error) {
        console.error("태그 목록 조회 실패:", error);
      }
    };
    fetchTags();
  }, [projectId, api]);

  // RAG 문서 목록 로드
  useEffect(() => {
    if (!projectId) return;
    if (!isRagEnabled) return; // RAG 비활성화 시 문서 로드 스킵
    const loadDocuments = async () => {
      try {
        await listDocuments(projectId);
      } catch (error) {
        console.error("RAG 문서 목록 조회 실패:", error);
      }
    };
    loadDocuments();
  }, [projectId, listDocuments, isRagEnabled]);

  // LLM 가용성 확인 (마운트 시 및 testCaseId 변경 시 재확인)
  // testCaseId 변경 시 재조회하여 LLM 설정 비활성화가 즉시 반영되도록 함
  useEffect(() => {
    let cancelled = false;
    const checkLlm = async () => {
      try {
        const response = await api("/api/llm-configs/check-availability");
        if (cancelled) return;
        if (response.ok) {
          const result = await response.json();
          setIsLlmAvailable(result.data === true);
        } else {
          setIsLlmAvailable(false);
        }
      } catch {
        if (!cancelled) setIsLlmAvailable(false);
      }
    };
    checkLlm();
    return () => {
      cancelled = true;
    };
  }, [api, testCaseId]);

  // 테스트케이스 데이터 로드
  useEffect(() => {
    if (!projectId) {
      setTestCase(null);
      return;
    }
    if (testCaseId) {
      const tc = testCases.find((tc) => String(tc.id) === String(testCaseId));
      if (tc) {
        let parentName = "";
        if (tc.parentId) {
          const parentTestCase = testCases.find(
            (ptc) => String(ptc.id) === String(tc.parentId),
          );
          if (parentTestCase) {
            parentName = parentTestCase.name;
          }
        }

        const loadedTestCase = {
          ...tc,
          steps: tc.steps,
          parentName,
          priority: tc.priority || "MEDIUM",
          tags: tc.tags || [],
          postCondition: tc.postCondition || "",
          isAutomated:
            typeof tc.isAutomated === "boolean" ? tc.isAutomated : false,
          executionType:
            tc.executionType ||
            (typeof tc.isAutomated === "boolean" && tc.isAutomated
              ? "Automation"
              : "Manual"),
          testTechnique: tc.testTechnique || "",
        };
        setTestCase(loadedTestCase);
        // 자동 저장: 로드 완료 시 기준점 설정 (표시 중인 "저장됨" 상태 유지)
        markSaved(
          {
            ...loadedTestCase,
            _linkedDocIds: tc.linkedDocumentIds || [],
          },
          { skipStatusReset: true },
        );
        setMaxStepNumber(
          tc.steps?.length > 0
            ? Math.max(...tc.steps.map((step) => step.stepNumber))
            : 0,
        );

        // 연결된 RAG 문서 ID 목록을 실제 문서 객체로 변환
        if (
          tc.linkedDocumentIds &&
          tc.linkedDocumentIds.length > 0 &&
          ragState.documents.length > 0
        ) {
          const linkedDocs = ragState.documents.filter(
            (doc) =>
              tc.linkedDocumentIds.includes(doc.id) &&
              !doc.fileName?.startsWith("testcase_"),
          );
          setLinkedDocuments(linkedDocs);
        } else {
          setLinkedDocuments([]);
        }

        // 실제 테스트케이스인 경우만 버전 정보 조회
        if (tc.type === "testcase") {
          fetchCurrentVersion(testCaseId);
        } else {
          setCurrentVersion(null);
        }
      }
    } else {
      // initialData가 있으면 사용 (AI 생성 데이터 등)
      if (initialData) {
        const aiSteps = (initialData.steps || []).map((step, index) => ({
          stepNumber: step.stepNumber || index + 1,
          description: step.action || step.description || "",
          expectedResult: step.expected || step.expectedResult || "",
        }));

        setTestCase({
          name: initialData.name || "",
          description: initialData.description || "",
          steps: aiSteps,
          expectedResults: initialData.expectedResults || "",
          parentId: initialData.parentId || null,
          projectId,
          type: "testcase",
          displayOrder: "",
          preCondition:
            initialData.preCondition || initialData.preconditions || "",
          postCondition: initialData.postCondition || "",
          isAutomated:
            typeof initialData.isAutomated === "boolean"
              ? initialData.isAutomated
              : false,
          executionType:
            initialData.executionType ||
            (typeof initialData.isAutomated === "boolean" &&
            initialData.isAutomated
              ? "Automation"
              : "Manual"),
          testTechnique: initialData.testTechnique || "",
          parentName: "",
          priority: initialData.priority || "MEDIUM",
          tags: initialData.tags || [],
          linkedDocumentIds: [],
        });
        setMaxStepNumber(
          aiSteps.length > 0
            ? Math.max(...aiSteps.map((step) => step.stepNumber))
            : 0,
        );
      } else {
        // 신규 생성 모드
        // location.state 또는 Query Param에서 부모 정보 확인
        const searchParams = new URLSearchParams(location.search);
        const stateParentId =
          location.state?.parentId || searchParams.get("parentId") || null;
        let stateParentName =
          location.state?.parentName || searchParams.get("parentName") || "";

        // 부모 이름이 없고 ID만 있는 경우, store에서 찾기 시도
        if (stateParentId && !stateParentName) {
          const parent = testCases.find((tc) => tc.id === stateParentId);
          if (parent) stateParentName = parent.name;
        }

        // 형제 노드들의 최대 displayOrder 계산
        const siblings = testCases.filter(
          (tc) => String(tc.parentId) === String(stateParentId),
        );
        const maxOrder =
          siblings.length > 0
            ? Math.max(...siblings.map((s) => Number(s.displayOrder) || 0))
            : 0;
        const nextDisplayOrder = maxOrder + 1;

        setTestCase({
          name: "",
          description: "",
          steps: [],
          expectedResults: "",
          parentId: stateParentId,
          projectId,
          type: "testcase",
          displayOrder: nextDisplayOrder,
          preCondition: "",
          postCondition: "",
          isAutomated: false,
          executionType: "Manual",
          testTechnique: "",
          parentName: stateParentName,
          priority: "MEDIUM",
          tags: [],
          linkedDocumentIds: [],
        });
        setMaxStepNumber(0);
      }
      setLinkedDocuments([]);
    }
  }, [
    testCaseId,
    testCases,
    projectId,
    ragState.documents,
    initialData,
    location.state,
  ]);

  // 버전 복원이나 외부 변경에 의한 testCases 업데이트 감지
  useEffect(() => {
    if (!testCaseId || !testCases.length || !testCase) return;
    const currentTestCase = testCases.find(
      (tc) => String(tc.id) === String(testCaseId),
    );
    if (currentTestCase) {
      const isVersionRestore =
        currentTestCase._version &&
        (!testCase._version || currentTestCase._version !== testCase._version);
      if (isVersionRestore) {
        let parentName = "";
        if (currentTestCase.parentId) {
          const parentTestCase = testCases.find(
            (ptc) => String(ptc.id) === String(currentTestCase.parentId),
          );
          if (parentTestCase) {
            parentName = parentTestCase.name;
          }
        }
        setTestCase({ ...currentTestCase, parentName });
        setMaxStepNumber(
          currentTestCase.steps?.length > 0
            ? Math.max(...currentTestCase.steps.map((step) => step.stepNumber))
            : 0,
        );
        setRenderKey((prev) => prev + 1);
      }
    }
  }, [testCases, testCaseId]);

  // 이벤트 핸들러
  const handleChange = (field) => (event) => {
    setTestCase({ ...testCase, [field]: event.target.value });
    setErrors({ ...errors, [field]: undefined });
  };

  const handleTestCaseChange = (field, value, isAutomatedSwitch = false) => {
    if (isAutomatedSwitch) {
      // 자동화 스위치 변경 시 executionType도 함께 업데이트
      setTestCase((prev) => {
        const currentType =
          prev.executionType || (prev.isAutomated ? "Automation" : "Manual");
        let nextType = currentType;
        if (value) {
          if (!currentType || currentType === "Manual") {
            nextType = "Automation";
          }
        } else {
          if (!currentType || currentType === "Automation") {
            nextType = "Manual";
          }
        }
        return {
          ...prev,
          isAutomated: value,
          executionType: nextType,
        };
      });
    } else if (field === "executionType") {
      // executionType 변경 시 isAutomated도 함께 업데이트
      setTestCase((prev) => ({
        ...prev,
        executionType: value,
        isAutomated:
          value === "Automation"
            ? true
            : value === "Manual"
              ? false
              : prev.isAutomated,
      }));
    } else {
      // 일반 필드 변경
      setTestCase((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddStep = () => {
    if (isViewer) return;
    const newStepNumber = maxStepNumber + 1;
    setTestCase({
      ...testCase,
      steps: [...testCase.steps, createTestStep(newStepNumber, "", "")],
    });
    setMaxStepNumber(newStepNumber);
  };

  const handleDeleteStep = (stepNumber) => {
    if (isViewer) return;
    const updatedSteps = testCase.steps.filter(
      (step) => step.stepNumber !== stepNumber,
    );
    setTestCase({
      ...testCase,
      steps: updatedSteps,
    });
    if (stepNumber === maxStepNumber) {
      setMaxStepNumber(
        updatedSteps.length > 0
          ? Math.max(...updatedSteps.map((step) => step.stepNumber))
          : 0,
      );
    }
    setErrors((prev) => {
      const newSteps = { ...prev.steps };
      delete newSteps?.[stepNumber];
      return { ...prev, steps: newSteps };
    });
  };

  const handleMoveStep = (stepNumber, direction) => {
    if (isViewer) return;
    const sortedSteps = [...testCase.steps].sort(
      (a, b) => a.stepNumber - b.stepNumber,
    );
    const currentIndex = sortedSteps.findIndex(
      (step) => step.stepNumber === stepNumber,
    );
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sortedSteps.length - 1) return;
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    [sortedSteps[currentIndex], sortedSteps[newIndex]] = [
      sortedSteps[newIndex],
      sortedSteps[currentIndex],
    ];
    const reorderedSteps = sortedSteps.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
    }));
    setTestCase({
      ...testCase,
      steps: reorderedSteps,
    });
  };

  const handleStepMarkdownChange = (stepNumber, field, value = "") => {
    setTestCase({
      ...testCase,
      steps: testCase.steps.map((step) =>
        step.stepNumber === stepNumber ? { ...step, [field]: value } : step,
      ),
    });
    setErrors((prev) => ({
      ...prev,
      steps: {
        ...prev.steps,
        [stepNumber]: { ...prev.steps?.[stepNumber], [field]: undefined },
      },
    }));
  };

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", steps: {} };
    if (!testCase.name || !testCase.name.trim()) {
      newErrors.name = t(
        "testcase.validation.nameRequired",
        "이름을 입력하세요.",
      );
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const isSaveDisabled = () => {
    if (isViewer) return true;
    if (!testCase.name || !testCase.name.trim()) return true;
    return false;
  };

  // ======================== AI 메타 생성 ========================

  /** 자동/수동 모드 토글 - localStorage에 저장 */
  const handleAutoAiModeChange = useCallback((enabled) => {
    setAutoAiMode(enabled);
    localStorage.setItem("testcase-ai-auto-mode", String(enabled));
  }, []);

  /** AI 메타 생성 API 호출 */
  const handleAiGenerateMeta = useCallback(async () => {
    if (!testCase) return;
    if (isAiGeneratingRef.current) return;

    const validSteps = (testCase.steps || []).filter(
      (s) => s.description?.trim() || s.expectedResult?.trim(),
    );

    if (validSteps.length === 0) {
      setSnackbarError(
        t(
          "testcase.ai.error.noSteps",
          "AI 생성을 위해 최소 1개 이상의 스텝을 입력해주세요.",
        ),
      );
      return;
    }

    setIsAiGenerating(true);
    isAiGeneratingRef.current = true;

    try {
      const response = await api("/api/testcases/ai/generate-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steps: validSteps.map((s) => ({
            description: s.description || "",
            expectedResult: s.expectedResult || "",
          })),
          preCondition: testCase.preCondition || "",
          description: testCase.description || "",
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.error || t("testcase.ai.error.failed", "AI 생성에 실패했습니다."),
        );
      }

      const result = await response.json();

      setTestCase((prev) => ({
        ...prev,
        ...(result.name?.trim() ? { name: result.name.trim() } : {}),
        ...(result.description?.trim()
          ? { description: result.description.trim() }
          : {}),
      }));

      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarError(
        err.message || t("testcase.ai.error.failed", "AI 생성에 실패했습니다."),
      );
    } finally {
      setIsAiGenerating(false);
      isAiGeneratingRef.current = false;
    }
  }, [testCase, api, t]);

  // 자동 모드: steps 변경 감지 시 AI 생성 (Name이 비어 있을 때만)
  useEffect(() => {
    if (!autoAiMode || !testCase || isViewer) return;

    const steps = testCase.steps || [];
    const validSteps = steps.filter(
      (s) => s.description?.trim() || s.expectedResult?.trim(),
    );
    const currentLen = validSteps.length;

    // Name이 이미 재워져 있으면 자동 생성 스킵
    if (testCase.name?.trim()) {
      prevStepsLengthRef.current = currentLen;
      return;
    }

    // 스텝이 없으면 스킵
    if (currentLen === 0) {
      prevStepsLengthRef.current = 0;
      return;
    }

    // 디바운스 후 생성
    if (autoAiDebounceRef.current) {
      clearTimeout(autoAiDebounceRef.current);
    }
    autoAiDebounceRef.current = setTimeout(() => {
      prevStepsLengthRef.current = currentLen;
      handleAiGenerateMeta();
    }, 2000);

    return () => {
      if (autoAiDebounceRef.current) {
        clearTimeout(autoAiDebounceRef.current);
      }
    };
  }, [testCase?.steps, autoAiMode]);
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // 새 테스트 케이스 추가 핸들러 (초기화)
  const handleAddNew = () => {
    if (isViewer) return;

    // 변경 사항 확인 (Dirty Check)
    if (testCase) {
      const currentString = JSON.stringify(testCase);
      // 초기 로드 시점의 데이터와 비교를 위해 originalTestCase 상태가 필요하지만,
      // 간단히 필수 필드(이름, 설명 등)가 비어있지 않은지로 1차 확인할 수도 있습니다.
      // 하지만 더 정확한 건 비교입니다.
      // 여기서는 사용자가 무언가 입력을 했을 때를 가정하여, 이름이나 단계가 있는 경우 물어보는 것으로 처리하겠습니다.
      // 또는 간단히: 현재 폼이 수정 모드(testCaseId 존재)이거나, 신규 모드인데 데이터가 있는 경우

      const hasContent =
        testCase.name ||
        (testCase.steps && testCase.steps.length > 0) ||
        testCase.description;

      // 더 정확한 Dirty Check를 위해 useRef 등을 도입할 수 있으나,
      // 현재 요구사항("기존에 입력된게 있으면")에 맞춰 내용이 존재하면 경고를 띄웁니다.
      if (hasContent) {
        if (
          !window.confirm(
            t(
              "testcase.message.confirmDiscard",
              "작성 중인 내용이 있습니다. 새 케이스를 추가하시겠습니까? 기존 내용은 사라집니다.",
            ),
          )
        ) {
          return;
        }
      }
    }

    let targetParentId = null;
    let targetParentName = "";

    // 현재 노드가 폴더이면, 그 폴더를 부모로 설정
    if (testCase?.type === "folder") {
      targetParentId = testCase.id;
      targetParentName = testCase.name;
    } else {
      // 현재 노드가 테스트케이스이면, 같은 부모를 공유 (형제 레벨)
      targetParentId = testCase?.parentId || null;
      targetParentName = testCase?.parentName || "";
    }

    // /new 경로로 이동하며 state 및 query param 전달 (URL 공유/새로고침 안전성 확보)
    const searchParams = new URLSearchParams();
    if (targetParentId) searchParams.set("parentId", targetParentId);
    if (targetParentName) searchParams.set("parentName", targetParentName);

    navigate(
      `/projects/${projectId}/testcases/new?${searchParams.toString()}`,
      {
        state: {
          parentId: targetParentId,
          parentName: targetParentName,
        },
      },
    );
  };

  const handleSave = async () => {
    if (isViewer) return;
    if (!validate()) return;
    setIsSaving(true);
    setSnackbarError(undefined);

    // 저장 전 컨텍스트 캡처
    const savedParentId = testCase.parentId;
    const savedParentName = testCase.parentName;
    const savedProjectId = projectId;

    try {
      const payload = {
        ...testCase,
        projectId,
        steps: testCase.steps?.map((step) => ({
          stepNumber: step.stepNumber,
          description: step.description,
          expectedResult: step.expectedResult,
        })),
        linkedDocumentIds: linkedDocuments.map((doc) => doc.id),
      };

      // ICT-TagCleanup: 부모 폴더 변경(이동) 시 태그 정리 확인
      if (testCaseId && testCase.parentId !== savedParentId) {
        // 수정 모드이고 부모가 변경됨
        const oldParent = testCases.find(
          (tc) => String(tc.id) === String(savedParentId),
        );
        if (oldParent && oldParent.tags && oldParent.tags.length > 0) {
          const currentTags = testCase.tags || [];
          // 이전 부모의 태그 중 현재 테스트케이스가 가지고 있는 태그(교집합) 찾기
          const commonTags = currentTags.filter((tag) =>
            oldParent.tags.includes(tag),
          );

          if (commonTags.length > 0) {
            const confirmMsg = t(
              "testcase.message.confirmTagCleanup",
              `이전 폴더의 태그 [${commonTags.join(
                ", ",
              )}]를 삭제하시겠습니까?\n'예'를 선택하면 해당 태그가 삭제되고, '아니오'를 선택하면 유지됩니다.`,
            );
            if (window.confirm(confirmMsg)) {
              // 교집합 태그 제거
              payload.tags = currentTags.filter(
                (tag) => !commonTags.includes(tag),
              );
            }
          }
        }
      }

      let result;
      if (testCaseId) {
        result = await updateTestCase(payload);
      } else {
        result = await addTestCase(payload);
      }

      // 저장 성공 후, 본문에서 사용된 이미지 ID 추출 및 mark-used API 호출
      try {
        const allAttachmentIds = new Set();
        [
          testCase.description,
          testCase.preCondition,
          testCase.postCondition,
        ].forEach((content) => {
          extractAttachmentIds(content).forEach((id) =>
            allAttachmentIds.add(id),
          );
        });
        testCase.steps?.forEach((step) => {
          extractAttachmentIds(step.description).forEach((id) =>
            allAttachmentIds.add(id),
          );
          extractAttachmentIds(step.expectedResult).forEach((id) =>
            allAttachmentIds.add(id),
          );
        });
        if (allAttachmentIds.size > 0) {
          await Promise.all(
            Array.from(allAttachmentIds).map((id) =>
              api(`/api/testcase-attachments/${id}/mark-used`, {
                method: "PATCH",
              }).catch((err) =>
                console.error(`Failed to mark attachment ${id} as used:`, err),
              ),
            ),
          );
        }
      } catch (err) {
        console.error("Failed to update attachment usage status:", err);
      }

      setSnackbarOpen(true);

      // 수동 저장 성공 시 자동 저장 기준점 동기화
      markSaved({
        ...testCase,
        _linkedDocIds: linkedDocuments.map((d) => d.id),
      });

      // 기존 동작: 수정 모드이거나 체크 안됨 -> 저장 후 보통 머무름
      if (onSave) onSave();

      // 저장 후 목록 갱신 등은 Context에서 처리됨
    } catch (err) {
      setSnackbarError(
        err.message ||
          t("testcase.error.saveError", "저장 중 오류가 발생했습니다."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
    setSnackbarError(undefined);
  };

  const handleCreateVersion = () => {
    if (!testCaseId) {
      setSnackbarError(
        t(
          "testcase.version.error.notSaved",
          "저장된 테스트케이스에만 버전을 생성할 수 있습니다.",
        ),
      );
      return;
    }
    if (testCase?.type !== "testcase") {
      setSnackbarError(
        t(
          "testcase.version.error.folderNotAllowed",
          "폴더에는 버전을 생성할 수 없습니다. 실제 테스트케이스에만 가능합니다.",
        ),
      );
      setSnackbarOpen(true);
      return;
    }
    setVersionDialogOpen(true);
    setVersionLabel("");
    setVersionDescription("");
  };

  const handleSaveVersion = async () => {
    if (!versionLabel.trim()) {
      alert(
        t(
          "testcase.version.validation.labelRequired",
          "버전 라벨을 입력하세요.",
        ),
      );
      return;
    }
    try {
      setSavingVersion(true);
      const response = await api(
        `/api/testcase-versions/${testCaseId}/manual`,
        {
          method: "POST",
          body: JSON.stringify({
            versionLabel: versionLabel.trim(),
            versionDescription:
              versionDescription.trim() ||
              t("testcase.version.defaultDescription", "수동 버전 생성"),
          }),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            t(
              "testcase.version.error.createFailed",
              "버전 생성에 실패했습니다.",
            ),
        );
      }
      const data = await response.json();
      setVersionDialogOpen(false);
      setSnackbarOpen(true);
      fetchCurrentVersion(testCaseId);
    } catch (error) {
      console.error(
        t("testcase.version.error.createError", "버전 생성 실패:"),
        error,
      );
      setSnackbarError(error.message);
    } finally {
      setSavingVersion(false);
    }
  };

  const handleCancelVersion = () => {
    setVersionDialogOpen(false);
    setVersionLabel("");
    setVersionDescription("");
  };

  const handleVersionHistory = () => {
    setVersionHistoryOpen(true);
  };

  const handleVersionRestore = async (restoredVersion) => {
    try {
      if (restoredVersion && restoredVersion.id) {
        const restoredTestCase = {
          id: restoredVersion.id || restoredVersion.testCaseId,
          name: restoredVersion.name,
          description: restoredVersion.description,
          preCondition: restoredVersion.preCondition,
          postCondition: restoredVersion.postCondition || "",
          expectedResults: restoredVersion.expectedResults,
          steps: restoredVersion.steps || [],
          priority: restoredVersion.priority,
          type: restoredVersion.type,
          projectId: restoredVersion.projectId,
          parentId: restoredVersion.parentId,
          displayId: restoredVersion.displayId,
          sequentialId: restoredVersion.sequentialId,
          displayOrder: restoredVersion.displayOrder,
          createdAt: restoredVersion.createdAt,
          updatedAt: restoredVersion.updatedAt,
          tags: restoredVersion.tags || [],
          isAutomated:
            typeof restoredVersion.isAutomated === "boolean"
              ? restoredVersion.isAutomated
              : false,
          executionType:
            restoredVersion.executionType ||
            (typeof restoredVersion.isAutomated === "boolean" &&
            restoredVersion.isAutomated
              ? "Automation"
              : "Manual"),
          testTechnique: restoredVersion.testTechnique || "",
        };

        setTimeout(() => {
          setTestCase(restoredTestCase);
          if (restoredTestCase.steps && restoredTestCase.steps.length > 0) {
            setMaxStepNumber(
              Math.max(
                ...restoredTestCase.steps.map((step) => step.stepNumber),
              ),
            );
          } else {
            setMaxStepNumber(0);
          }
          setRenderKey((prev) => prev + 1);
        }, 0);

        setTimeout(() => {
          if (
            updateTestCaseLocal &&
            typeof updateTestCaseLocal === "function"
          ) {
            updateTestCaseLocal(restoredTestCase);
          }
        }, 10);

        setSnackbarOpen(true);
        setTimeout(() => {
          fetchCurrentVersion(testCaseId);
        }, 20);
        setTimeout(() => {
          if (onSave && typeof onSave === "function") {
            onSave();
          }
        }, 30);
        return;
      }

      const response = await api(`/api/testcases/${testCaseId}`);
      if (response.ok) {
        const data = await response.json();
        const updatedTestCase = data.data || data;
        if (updatedTestCase && updatedTestCase.id) {
          setTimeout(() => {
            setTestCase(updatedTestCase);
            if (updatedTestCase.steps && updatedTestCase.steps.length > 0) {
              setMaxStepNumber(
                Math.max(
                  ...updatedTestCase.steps.map((step) => step.stepNumber),
                ),
              );
            } else {
              setMaxStepNumber(0);
            }
            setRenderKey((prev) => prev + 1);
          }, 0);
          setTimeout(() => {
            if (
              updateTestCaseLocal &&
              typeof updateTestCaseLocal === "function"
            ) {
              updateTestCaseLocal(updatedTestCase);
            }
          }, 10);
          setSnackbarOpen(true);
          setTimeout(() => {
            fetchCurrentVersion(testCaseId);
          }, 20);
          setTimeout(() => {
            if (onSave && typeof onSave === "function") {
              onSave();
            }
          }, 30);
        }
      }
    } catch (error) {
      console.error("버전 복원 후 데이터 로드 실패:", error);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  // 인라인 이미지 훅
  const getFieldValue = useCallback(
    (fieldConfig) => resolveFieldValue(fieldConfig, testCase),
    [testCase],
  );
  const updateFieldValue = useCallback(
    (fieldConfig, updater) => {
      if (!fieldConfig) return;
      setTestCase((prev) => {
        if (!prev) return prev;
        const currentValue = resolveFieldValue(fieldConfig, prev) || "";
        const nextValue =
          typeof updater === "function" ? updater(currentValue) : updater;
        return applyFieldValueToState(prev, fieldConfig, nextValue);
      });
    },
    [setTestCase],
  );

  const showInlineImageError = useCallback(
    (message) => {
      if (!message) return;
      setSnackbarError(message);
      setSnackbarOpen(true);
    },
    [setSnackbarError, setSnackbarOpen],
  );

  const {
    imageDialogState,
    inlineImageUploading,
    handleMarkdownPaste,
    handleInlineImageDialogClose,
    handleInlineImageInsert,
    updateImageDialogState,
  } = useInlineImagePaste({
    api,
    testCaseId,
    isViewer,
    t,
    getFieldValue,
    updateFieldValue,
    onError: showInlineImageError,
  });

  // 프로젝트 미선택 상태
  if (!projectId) {
    return (
      <Card
        sx={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {t("testcase.message.selectProject", "프로젝트를 먼저 선택하세요.")}
        </Typography>
      </Card>
    );
  }

  // 테스트케이스 미선택 상태
  if (!testCase) {
    return (
      <Card
        sx={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {t(
            "testcase.message.selectOrCreate",
            "테스트케이스를 선택하거나 새로 만드세요.",
          )}
        </Typography>
      </Card>
    );
  }

  // 폴더 폼 렌더링
  if (isFolder) {
    return (
      <FolderForm
        testCaseId={testCaseId}
        testCase={testCase}
        errors={errors}
        projectId={projectId}
        isViewer={isViewer}
        isSaving={isSaving}
        infoOpen={infoOpen}
        setInfoOpen={setInfoOpen}
        folderInfoOpen={folderInfoOpen}
        setFolderInfoOpen={setFolderInfoOpen}
        snackbarOpen={snackbarOpen}
        snackbarError={snackbarError}
        versionDialogOpen={versionDialogOpen}
        versionLabel={versionLabel}
        versionDescription={versionDescription}
        savingVersion={savingVersion}
        t={t}
        theme={theme}
        onSave={handleSave}
        onCancel={handleCancel}
        onChange={handleChange}
        onMarkdownPaste={handleMarkdownPaste}
        onSnackbarClose={handleSnackbarClose}
        onVersionLabelChange={setVersionLabel}
        onVersionDescriptionChange={setVersionDescription}
        onSaveVersion={handleSaveVersion}
        onCancelVersion={handleCancelVersion}
        onAddNew={handleAddNew}
        availableTags={availableTags}
        onTagChange={(newValue) => handleTestCaseChange("tags", newValue)}
      />
    );
  }

  // 테스트케이스 폼 렌더링
  return (
    <Card
      key={`testcase-form-${testCaseId}-${renderKey}`}
      sx={{ minHeight: 400 }}
    >
      <CardContent>
        <TestCaseFormHeader
          testCaseId={testCaseId}
          testCase={testCase}
          currentVersion={currentVersion}
          isViewer={isViewer}
          isSaving={isSaving}
          isFolder={false}
          t={t}
          onSave={handleSave}
          onCancel={handleCancel}
          onVersionHistory={handleVersionHistory}
          onCreateVersion={handleCreateVersion}
          onAddNew={handleAddNew}
          autoSaveStatus={autoSaveStatus}
          autoSaveError={autoSaveError}
        />

        {/* RAG 벡터화 상태 뱃지 - LLM 활성화 + 기존 테스트케이스일 때만 표시 */}
        {testCaseId && !isFolder && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              mb: 1,
              ml: 0.5,
            }}
          >
            <RagStatusBadge
              testCaseId={testCaseId}
              ragVectorized={testCase?.ragVectorized}
              isLlmAvailable={isLlmAvailable}
              isFolder={isFolder}
              api={api}
              onVectorized={(success) => {
                if (success) {
                  setTestCase((prev) =>
                    prev ? { ...prev, ragVectorized: true } : prev,
                  );
                }
              }}
            />
          </Box>
        )}

        {inlineImageUploading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {t(
              "testcase.inlineImage.uploadingProgress",
              "클립보드 이미지를 업로드하는 중입니다...",
            )}
          </Alert>
        )}

        <Box sx={{ width: "100%", mt: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="testcase detail tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                label={t("testcase.tabs.details", "상세 정보")}
                id="testcase-tab-0"
                aria-controls="testcase-tabpanel-0"
              />
              {testCaseId && (
                <Tab
                  label={t("testcase.tabs.attachments", "첨부 파일")}
                  id="testcase-tab-1"
                  aria-controls="testcase-tabpanel-1"
                />
              )}
              {testCaseId && !isFolder && (
                <Tab
                  label={t("testcase.tabs.execution", "실행 이력")}
                  id="testcase-tab-2"
                  aria-controls="testcase-tabpanel-2"
                />
              )}
              {testCaseId && !isFolder && (
                <Tab
                  label={t("testcase.tabs.history", "기록")}
                  id="testcase-tab-3"
                  aria-controls="testcase-tabpanel-3"
                />
              )}
            </Tabs>
          </Box>

          {/* 상세 정보 탭 */}
          <TabPanel value={tabValue} index={0}>
            <TestCaseFormMetadata
              testCase={testCase}
              projectId={projectId}
              infoOpen={infoOpen}
              setInfoOpen={setInfoOpen}
              isViewer={isViewer}
              t={t}
              onChange={handleChange}
            />

            <TestCaseBasicInfo
              testCase={testCase}
              errors={errors}
              availableTags={availableTags}
              linkedDocuments={linkedDocuments}
              ragDocuments={
                isRagEnabled
                  ? (ragState.documents || []).filter(
                      (doc) => !doc.fileName?.startsWith("testcase_"),
                    )
                  : []
              }
              testCaseInfoOpen={testCaseInfoOpen}
              setTestCaseInfoOpen={setTestCaseInfoOpen}
              isViewer={isViewer}
              t={t}
              theme={theme}
              onChange={handleChange}
              onTestCaseChange={handleTestCaseChange}
              onTagChange={(newValue) =>
                setTestCase((prev) => ({ ...prev, tags: newValue }))
              }
              onLinkedDocumentsChange={setLinkedDocuments}
              onMarkdownPaste={handleMarkdownPaste}
              onAiGenerate={handleAiGenerateMeta}
              isAiGenerating={isAiGenerating}
              isLlmAvailable={isLlmAvailable && isRagEnabled}
              autoAiMode={autoAiMode}
              onAutoAiModeChange={handleAutoAiModeChange}
            />

            <Box sx={{ mt: 4, mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {t("testcase.sections.steps", "테스트 단계")}
              </Typography>
            </Box>
            <TestStepsTable
              steps={testCase.steps}
              errors={errors}
              isViewer={isViewer}
              t={t}
              theme={theme}
              onAddStep={handleAddStep}
              onDeleteStep={handleDeleteStep}
              onMoveStep={handleMoveStep}
              onStepMarkdownChange={handleStepMarkdownChange}
              onMarkdownPaste={handleMarkdownPaste}
            />

            <Box sx={{ mt: 4, mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {t("testcase.sections.expectedResults", "기대 결과")}
              </Typography>
            </Box>
            <MarkdownFieldEditor
              label={t("testcase.form.expectedResults", "Expected Results")}
              value={testCase.expectedResults || ""}
              placeholder={t(
                "testcase.form.overallExpectedResults",
                "전체 예상 결과",
              )}
              height={250}
              isViewer={isViewer}
              theme={theme}
              t={t}
              onChange={(value) =>
                handleTestCaseChange("expectedResults", value)
              }
              onPaste={(event) =>
                handleMarkdownPaste(event, {
                  type: "field",
                  field: "expectedResults",
                })
              }
              testid="testcase-overall-expected-input"
            />
          </TabPanel>

          {/* 첨부 파일 탭 */}
          {testCaseId && (
            <TabPanel value={tabValue} index={1}>
              <TestCaseAttachments testCaseId={testCaseId} />
            </TabPanel>
          )}

          {/* 실행 이력 탭 */}
          {testCaseId && !isFolder && (
            <TabPanel value={tabValue} index={2}>
              <TestCaseExecutionHistory testCaseId={testCaseId} />
            </TabPanel>
          )}

          {/* 기록 탭 */}
          {testCaseId && !isFolder && (
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t("testcase.tree.action.versionHistory", "버전 관리")}
              </Typography>
              <TestCaseVersionHistory
                testCaseId={testCaseId}
                open={true}
                inline={true}
                onClose={() => {}}
                onRestore={handleVersionRestore}
              />
            </TabPanel>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
        {!isViewer && (
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              onClick={handleCancel}
              color="inherit"
              variant="outlined"
              data-testid="testcase-cancel-button"
            >
              {t("testcase.form.button.cancel", "취소")}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={isSaveDisabled() || isSaving}
              startIcon={
                isSaving ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SaveVersionIcon />
                )
              }
              data-testid="testcase-save-button"
            >
              {isSaving
                ? t("testcase.form.button.saving", "저장 중...")
                : testCaseId
                  ? t("testcase.form.button.update", "수정")
                  : t("testcase.form.button.save", "저장")}
            </Button>
            {testCaseId && testCase?.type === "testcase" && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCreateVersion}
                startIcon={<SaveVersionIcon />}
              >
                {t("testcase.version.button.create", "버전 생성")}
              </Button>
            )}
          </Box>
        )}
      </CardActions>

      <InlineImageDialog
        open={imageDialogState.open}
        imageDialogState={imageDialogState}
        t={t}
        onClose={handleInlineImageDialogClose}
        onInsert={handleInlineImageInsert}
        updateImageDialogState={updateImageDialogState}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {t("testcase.message.saved", "저장되었습니다.")}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!snackbarError}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbarError}
        </Alert>
      </Snackbar>

      <TestCaseVersionHistory
        testCaseId={testCaseId}
        open={versionHistoryOpen}
        onClose={() => setVersionHistoryOpen(false)}
        onRestore={handleVersionRestore}
      />
    </Card>
  );
};

TestCaseForm.propTypes = {
  testCaseId: PropTypes.string,
  projectId: PropTypes.string.isRequired,
  onSave: PropTypes.func,
  initialData: PropTypes.object,
};

export default TestCaseForm;
