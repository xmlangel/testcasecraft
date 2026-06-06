import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import useAutoSave from "../hooks/useAutoSave.js";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAppContext } from "../context/AppContext.jsx";
import { useI18n } from "../context/I18nContext";
import JiraCommentDialog from "./JiraIntegration/JiraCommentDialog.jsx";
import { jiraService } from "../services/jiraService.js";
import { TestResult } from "../models/testExecution.jsx";

// Import new components
import TestCaseDetails from "./TestResult/TestCaseDetails.jsx";
import TestResultNotes from "./TestResult/TestResultNotes.jsx";
import TestResultAttachments from "./TestResult/TestResultAttachments.jsx";
import TestResultTags from "./TestResult/TestResultTags.jsx";
import TestResultJira from "./TestResult/TestResultJira.jsx";
import TestResultHeader from "./TestResult/TestResultHeader.jsx";
import TestResultFloatingMenu from "./TestResult/TestResultFloatingMenu.jsx";
import useInlineImagePaste from "../hooks/useInlineImagePaste.js";
import InlineImageDialog from "./TestCase/InlineImageDialog.jsx";

const KEY_RESULT_MAP = {
  N: TestResult.NOT_RUN,
  P: TestResult.PASS,
  F: TestResult.FAIL,
  B: TestResult.BLOCKED,
};

const TestResultForm = ({
  open,
  testCaseId,
  executionId,
  currentResult = { result: TestResult.NOT_RUN, notes: "" },
  onClose,
  onSave,
  onNext = null,
  onPrevious = null,
  onBack = null,
  currentIndex = 0,
  totalCount = 0,
  fullPage = false,
  onOpenFullPage = null,
  isPreviousResultEdit = false, // 새로운 prop: 이전 결과 수정 모드
  execution = null, // 새로운 prop: 전체 실행 정보
}) => {
  const { user, api } = useAppContext();
  const { t } = useI18n();
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";

  const isViewer = user?.role === "VIEWER";

  const [testCase, setTestCase] = useState(null);
  const [result, setResult] = useState(TestResult.NOT_RUN);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState([]);
  const [jiraIssueKey, setJiraIssueKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [saveError, setSaveError] = useState();
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  // 변경 사항이 없어 저장을 건너뛴 경우 안내 메시지
  const [showNoChangeInfo, setShowNoChangeInfo] = useState(false);
  const saveButtonRef = useRef();
  // 태그 자동완성을 위한 기존 태그 목록
  const [availableTags, setAvailableTags] = useState([]);

  // JIRA 통합 관련 상태
  const [jiraDialogOpen, setJiraDialogOpen] = useState(false);
  const [jiraConnectionStatus, setJiraConnectionStatus] = useState(null);
  const [detectedJiraIssues, setDetectedJiraIssues] = useState([]);
  const [linkedIssues, setLinkedIssues] = useState([]);

  // {t('testResult.form.fileAttachment')} 관련 상태
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileUploadError, setFileUploadError] = useState("");
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // 미리보기 다이얼로그 상태
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // 노트 전체화면 상태 관리
  const [isNotesFullscreen, setIsNotesFullscreen] = useState(false);

  // 사용자가 실제로 결과/노트/태그/JIRA를 수정했는지 여부.
  // false인 동안은 자동저장(디바운스·언마운트 모두)을 전면 차단한다.
  // — 보기만 해도 빈 초기 상태가 기존 결과 위에 PUT 되던 버그 방지
  //   (StrictMode 이중 마운트 cleanup / 케이스 전환 시 혼합 스냅샷)
  const [userEdited, setUserEdited] = useState(false);

  // 사용자 입력 경로 전용 setter — 자동저장 활성화 플래그를 함께 올린다.
  // (초기화/서버 동기화 경로는 원본 setter를 직접 사용해 자동저장을 유발하지 않음)
  const setResultByUser = useCallback((value) => {
    setUserEdited(true);
    setResult(value);
  }, []);
  const setNotesByUser = useCallback((value) => {
    setUserEdited(true);
    setNotes(value);
  }, []);
  const setTagsByUser = useCallback((value) => {
    setUserEdited(true);
    setTags(value);
  }, []);
  const setJiraIssueKeyByUser = useCallback((value) => {
    setUserEdited(true);
    setJiraIssueKey(value);
  }, []);

  // useMemo를 사용하여 currentResult의 안정적인 참조 생성
  const stableCurrentResult = useMemo(() => {
    if (!currentResult) return null;
    return {
      result: currentResult.result,
      notes: currentResult.notes,
      tags: currentResult.tags,
      jiraIssueKey: currentResult.jiraIssueKey,
      id: currentResult.id,
    };
  }, [
    currentResult?.result,
    currentResult?.notes,
    currentResult?.jiraIssueKey,
    currentResult?.id,
    // tags는 배열이므로 JSON으로 비교
    JSON.stringify(currentResult?.tags || []),
  ]);

  // 자동 저장용 데이터 (fullPage 모드 + 사용자가 실제 수정한 경우에만 활성화)
  // userEdited=false면 null을 반환해 useAutoSave의 디바운스 저장과
  // 언마운트 저장을 모두 비활성화한다 — 보기만 할 때는 절대 저장하지 않는다.
  const autoSaveData = useMemo(() => {
    if (!fullPage || !userEdited) return null;
    return {
      result,
      notes,
      tags,
      jiraIssueKey,
      // baseline(markSaved)은 신규 결과에서 _resultId를 null로 설정하므로
      // undefined가 아닌 null로 정규화해야 dirty 오탐(입력 없이 저장)을 막는다.
      _resultId: stableCurrentResult?.id ?? null,
    };
  }, [
    fullPage,
    userEdited,
    result,
    notes,
    tags,
    jiraIssueKey,
    stableCurrentResult?.id,
  ]);

  // 자동 저장 함수
  // - 기존 결과(_resultId 있음): PUT
  // - 신규 결과(_resultId 없음): POST (result 미설정 시 "NOT_RUN" 사용)
  const autoSaveFn = useCallback(
    async (data) => {
      const requestData = {
        testCaseId,
        result: data.result || "NOT_RUN", // undefined 방지
        notes: data.notes,
        tags: data.tags || [],
      };
      if (data.jiraIssueKey?.trim()) {
        requestData.jiraIssueKey = data.jiraIssueKey;
      }

      if (data._resultId) {
        // 기존 결과 수정: PUT, onSave 호출 안함 (stableCurrentResult 변경 → "저장됨" 상태 덮어씌움 방지)
        const response = await api(
          `/api/test-executions/results/${data._resultId}`,
          { method: "PUT", body: JSON.stringify(requestData) },
        );
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.message ||
              t("testResult.error.saveFailed", "저장에 실패했습니다."),
          );
        }
      } else {
        // 신규 결과인데 결과/노트/태그/JIRA가 모두 비어있으면(빈 NOT_RUN)
        // 입력 없이 자동으로 NOT_RUN 레코드가 생성되지 않도록 저장을 건너뛴다.
        const isEmptyNew =
          (!data.result ||
            data.result === "NOT_RUN" ||
            data.result === "NOTRUN") &&
          !(data.notes && data.notes.trim()) &&
          !(data.tags && data.tags.length) &&
          !(data.jiraIssueKey && data.jiraIssueKey.trim());
        if (isEmptyNew) {
          return;
        }

        // 신규 결과 생성: POST, onSave 호출해야 결과 ID가 stableCurrentResult에 반영됨
        const response = await api(
          `/api/test-executions/${executionId}/results`,
          { method: "POST", body: JSON.stringify(requestData) },
        );
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.message ||
              t("testResult.error.saveFailed", "저장에 실패했습니다."),
          );
        }
        const updatedExecution = await response.json();
        onSave(updatedExecution, { keepDialogOpen: true });
      }
    },
    [api, executionId, testCaseId, onSave, t],
  );

  const { autoSaveStatus, autoSaveError, markSaved } = useAutoSave({
    id: executionId, // 신규/기존 모두 활성화 (실제 저장 여부는 autoSaveFn 내부에서 결정)
    data: autoSaveData,
    saveFn: autoSaveFn,
    disabled: isViewer || !fullPage,
    debounceMs: 1500,
    t,
  });

  useEffect(() => {
    if (!stableCurrentResult) {
      // 새로운 결과 입력 시
      setUserEdited(false);
      setResult(TestResult.NOT_RUN);
      setNotes("");
      setTags([]);
      setJiraIssueKey("");
      setLinkedIssues([]);
      setDetectedJiraIssues([]);
      markSaved(
        {
          result: "NOT_RUN",
          notes: "",
          tags: [],
          jiraIssueKey: "",
          _resultId: null,
        },
        { skipStatusReset: true },
      );
      return;
    }

    // 기존 결과 수정 시 — 서버 데이터로 초기화이므로 사용자 수정 아님
    setUserEdited(false);
    setResult(stableCurrentResult.result || TestResult.NOT_RUN);
    setNotes(stableCurrentResult.notes || "");
    setTags(stableCurrentResult.tags || []);
    const initialJiraKey = stableCurrentResult.jiraIssueKey || "";
    setJiraIssueKey(initialJiraKey);

    // 다중 JIRA 이슈 초기화
    if (initialJiraKey) {
      const keys = initialJiraKey
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      setLinkedIssues((prev) => {
        // 이미 정보를 가지고 있는 이슈는 유지
        return keys.map((key) => {
          const existing = prev.find((issue) => issue.key === key);
          if (existing && existing.summary !== "Loading...") {
            return existing;
          }
          return {
            key,
            summary: "Loading...",
            status: { name: "..." },
          };
        });
      });
    } else {
      setLinkedIssues([]);
    }

    // 노트에서 JIRA 이슈 키 자동 감지
    if (stableCurrentResult.notes) {
      const issues = jiraService.extractIssueKeys(stableCurrentResult.notes);
      setDetectedJiraIssues(issues);
    } else {
      setDetectedJiraIssues([]);
    }

    // 자동 저장 기준점 갱신 — "저장됨" 표시 중이면 상태 초기화 건너뜀
    markSaved(
      {
        result: stableCurrentResult.result || "NOT_RUN",
        notes: stableCurrentResult.notes || "",
        tags: stableCurrentResult.tags || [],
        jiraIssueKey: stableCurrentResult.jiraIssueKey || "",
        // autoSaveData와 동일하게 null로 정규화 (undefined는 JSON에서 탈락해 dirty 오탐)
        _resultId: stableCurrentResult.id ?? null,
      },
      { skipStatusReset: true },
    );
  }, [stableCurrentResult, markSaved]);

  // JIRA 연결 상태 확인
  useEffect(() => {
    if (open || fullPage) {
      checkJiraStatus();
    }
  }, [open, fullPage]);

  // 인라인 이미지 훅 연동
  const getInlineImageValue = useCallback(
    (fieldConfig) => {
      if (fieldConfig?.field === "notes") return notes;
      return "";
    },
    [notes],
  );

  const updateInlineImageValue = useCallback(
    (fieldConfig, updater) => {
      if (fieldConfig?.field === "notes") {
        // 이미지 붙여넣기/삽입은 사용자 수정 행위
        setNotesByUser((prev) => {
          const nextValue =
            typeof updater === "function" ? updater(prev) : updater;
          return nextValue;
        });
      }
    },
    [setNotesByUser],
  );

  const showInlineImageError = useCallback((message) => {
    if (!message) return;
    setSaveError(message);
    setShowSaveSuccess(false); // 에러 시 성공 메시지 가림
  }, []);

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
    getFieldValue: getInlineImageValue,
    updateFieldValue: updateInlineImageValue,
    onError: showInlineImageError,
  });

  // 노트 변경 시 JIRA 이슈 키 감지 (사용자가 notes를 직접 수정할 때만 실행)
  useEffect(() => {
    // stableCurrentResult의 notes가 아닌 실제 상태의 notes를 감지
    // 이렇게 하면 사용자가 타이핑할 때만 감지됨
    const timer = setTimeout(() => {
      if (notes) {
        const issues = jiraService.extractIssueKeys(notes);
        setDetectedJiraIssues(issues);
      } else {
        setDetectedJiraIssues([]);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(timer);
  }, [notes]);

  // 프로젝트의 기존 태그 목록 조회
  useEffect(() => {
    if (!testCase?.project?.id) return;

    const fetchTags = async () => {
      try {
        const response = await api(
          `/api/testcases/projects/${testCase.project.id}/tags`,
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
  }, [testCase?.project?.id, api]);

  const checkJiraStatus = async () => {
    try {
      const status = await jiraService.getConnectionStatus();
      setJiraConnectionStatus(status);
    } catch (error) {
      console.error(t("testResult.jira.connectionCheckFailed"), error);
      setJiraConnectionStatus({ hasConfig: false, isConnected: false });
    }
  };

  // JIRA 설정이 있고 연결된 경우, 기존에 입력된 이슈 키가 있다면 상세 정보 조회
  useEffect(() => {
    const fetchInitialIssueDetails = async () => {
      if (
        !jiraConnectionStatus?.hasConfig ||
        !jiraConnectionStatus?.isConnected ||
        !jiraIssueKey
      ) {
        return;
      }

      // 콤마로 구분된 모든 키 추출
      const keys = jiraIssueKey
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      if (keys.length === 0) return;

      try {
        // 모든 이슈 정보를 병렬로 조회
        const fetchPromises = keys.map((key) =>
          jiraService.getIssueDetails(key),
        );
        const results = await Promise.all(fetchPromises);

        // 유효한 결과만 필터링하여 상태 업데이트
        const validResults = results.filter(Boolean);
        if (validResults.length > 0) {
          setLinkedIssues(validResults);
        }
      } catch (err) {
        console.warn("기존 JIRA 이슈 상세 정보 로드 실패:", err);
      }
    };

    if (open || fullPage) {
      fetchInitialIssueDetails();
    }
  }, [open, fullPage, jiraConnectionStatus?.isConnected, jiraIssueKey]);

  // 파일 처리 함수들
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // 파일 크기 제한 (10MB)
    const maxFileSize = 10 * 1024 * 1024;
    const invalidFiles = files.filter((file) => file.size > maxFileSize);
    if (invalidFiles.length > 0) {
      setFileUploadError(
        `${t("testResult.file.sizeError")}: ${invalidFiles
          .map((f) => f.name)
          .join(", ")}`,
      );
      return;
    }

    // 허용된 파일 형식
    const allowedTypes = [
      "text/plain",
      "text/csv",
      "application/json",
      "text/markdown",
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/gif",
    ];
    const invalidTypes = files.filter(
      (file) =>
        !allowedTypes.includes(file.type) &&
        !file.name.match(/\.(txt|csv|json|md|pdf|log|png|jpg|jpeg|gif)$/i),
    );
    if (invalidTypes.length > 0) {
      setFileUploadError(
        `${t("testResult.file.typeError")}: ${invalidTypes
          .map((f) => f.name)
          .join(", ")}`,
      );
      return;
    }

    setIsFileUploading(true);
    setFileUploadError("");

    try {
      const newFiles = files.map((file) => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        file: file,
      }));

      setAttachedFiles((prev) => [...prev, ...newFiles]);
      event.target.value = "";
    } catch (error) {
      setFileUploadError(t("testResult.error.fileUploadError", "파일 업로드 중 오류가 발생했습니다."));
    } finally {
      setIsFileUploading(false);
    }
  };

  const handleFileDelete = (fileId) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handlePreview = (file) => {
    const url = URL.createObjectURL(file.file);
    setPreviewUrl(url);
    setPreviewTitle(file.name);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewOpen(false);
    setPreviewUrl("");
    setPreviewTitle("");
  };

  useEffect(() => {
    const fetchTestCase = async () => {
      if (!testCaseId || (!open && !fullPage)) return;

      setLoading(true);
      try {
        const response = await api(`/api/testcases/${testCaseId}`);

        if (!response.ok)
          throw new Error(t("testResult.error.testCaseLoadFailed"));

        const data = await response.json();
        setTestCase(data);
        setError(undefined);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTestCase();
  }, [testCaseId, open, fullPage, api]);

  const handleSaveAndNext = useCallback(
    async (customResult, options = {}) => {
      if (isViewer) return;

      const {
        advanceToNext = true,
        keepDialogOpen = false,
        showSuccess = false,
      } = options;

      const actualResult = customResult !== undefined ? customResult : result;

      if (actualResult === undefined || actualResult === null) {
        setSaveError(t("testResult.error.resultRequired"));
        return;
      }

      try {
        const requestData = {
          testCaseId,
          result: actualResult,
          notes,
          tags: tags || [],
        };

        // ICT-178: JIRA 이슈 키 추출 (URL인 경우 ID 추출)
        let processedJiraKey = "";
        if (jiraIssueKey && jiraIssueKey.trim()) {
          const keys = jiraIssueKey.split(",").map((k) => k.trim());
          const cleanedKeys = keys.map((k) => {
            // URL 패턴인 경우 ID 추출
            if (k.includes("/") || k.includes("atlassian.net")) {
              return jiraService.extractIssueKeyFromUrl(k) || k;
            }
            return k.toUpperCase();
          });
          // 중복 제거 및 빈 값 필터링
          processedJiraKey = [...new Set(cleanedKeys)]
            .filter((k) => k && k.length > 0)
            .join(",");
        }
        if (processedJiraKey) {
          requestData.jiraIssueKey = processedJiraKey;
        }

        // 변경 사항 비교: 기존 결과가 있고, 결과/노트/태그/JIRA가 모두 동일하며
        // 새로 첨부한 파일이 없으면 저장하지 않고 이전 결과를 그대로 유지한다.
        const areTagsEqual = (a = [], b = []) => {
          if (a.length !== b.length) return false;
          const sortedA = [...a].sort();
          const sortedB = [...b].sort();
          return sortedA.every((value, idx) => value === sortedB[idx]);
        };
        const isUnchanged =
          !!stableCurrentResult?.id &&
          (stableCurrentResult.result || TestResult.NOT_RUN) === actualResult &&
          (stableCurrentResult.notes || "") === (notes || "") &&
          (stableCurrentResult.jiraIssueKey || "") ===
            (processedJiraKey || "") &&
          areTagsEqual(stableCurrentResult.tags || [], tags || []) &&
          attachedFiles.length === 0;

        // 신규(기존 결과 없음)인데 결과가 NOT_RUN이고 노트/태그/JIRA/첨부가
        // 모두 비어 있으면 빈 레코드를 만들지 않는다. 리스트에서 열어 보기만 하고
        // 저장/다음/N 을 눌러도 빈 NOT_RUN 레코드가 쌓이지 않도록 한다.
        // (autoSaveFn 의 동일 가드를 수동 저장 경로에도 적용)
        const isEmptyNew =
          !stableCurrentResult?.id &&
          (!actualResult || actualResult === TestResult.NOT_RUN) &&
          !(notes && notes.trim()) &&
          (!tags || tags.length === 0) &&
          !(processedJiraKey && processedJiraKey.trim()) &&
          attachedFiles.length === 0;

        if (isUnchanged || isEmptyNew) {
          // 변경 없음 또는 빈 신규: 새 결과 레코드를 만들지 않고 이전 상태를 유지
          if (showSuccess) setShowNoChangeInfo(true);
          if (advanceToNext && onNext) onNext();
          return;
        }

        if (isPreviousResultEdit && stableCurrentResult?.id) {
          const response = await api(
            `/api/test-executions/results/${stableCurrentResult.id}`,
            {
              method: "PUT",
              body: JSON.stringify(requestData),
            },
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || t("testResult.error.saveFailed"),
            );
          }

          const updatedResult = await response.json();
          if (showSuccess) setShowSaveSuccess(true);
          onSave(updatedResult, { keepDialogOpen });
          return;
        }

        const response = await api(
          `/api/test-executions/${executionId}/results`,
          {
            method: "POST",
            body: JSON.stringify(requestData),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || t("testResult.error.saveFailed"),
          );
        }

        const updatedExecution = await response.json();

        if (attachedFiles.length > 0) {
          await handleFileUploads(
            updatedExecution.results?.find((r) => r.testCaseId === testCaseId)
              ?.id,
          );
        }

        onSave(updatedExecution, { keepDialogOpen });
        if (advanceToNext && onNext) onNext();
        if (showSuccess) setShowSaveSuccess(true);
      } catch (err) {
        setSaveError(err.message);
      }
    },
    [
      api,
      executionId,
      testCaseId,
      notes,
      tags,
      jiraIssueKey,
      onSave,
      onNext,
      isViewer,
      result,
      attachedFiles,
      t,
      isPreviousResultEdit,
      stableCurrentResult,
    ],
  );

  const handleFileUploads = async (testResultId) => {
    if (!testResultId || attachedFiles.length === 0) return;

    try {
      setUploadingFiles(true);
      const uploadPromises = attachedFiles.map(async (fileInfo) => {
        const formData = new FormData();
        formData.append("file", fileInfo.file);

        const baseUrl = window.location.origin || "http://localhost:8080";
        const accessToken = localStorage.getItem("accessToken");

        const response = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `${baseUrl}/api/attachments/upload/${testResultId}`);
          xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve({ ok: true, json: () => Promise.resolve(data) });
              } catch (e) {
                resolve({ ok: true, json: () => Promise.resolve({}) });
              }
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(formData);
        });

        if (!response.ok)
          throw new Error(t("testResult.error.uploadFailed", `파일 업로드 실패: ${fileInfo.file.name}`, { filename: fileInfo.file.name }));
        const data = await response.json();
        if (!data.success)
          throw new Error(t("testResult.error.uploadFailed", `파일 업로드 실패: ${fileInfo.file.name}`, { filename: fileInfo.file.name }));
        return data.attachment;
      });

      await Promise.all(uploadPromises);
      setAttachedFiles([]);
    } catch (error) {
      console.error("파일 업로드 오류:", error);
      throw new Error(t("testResult.error.uploadErrorDetail", "파일 업로드 중 오류가 발생했습니다: " + error.message));
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleOpenJiraDialog = () => {
    setJiraDialogOpen(true);
  };

  const handleJiraCommentAdded = (issueKey, comment) => {
    // 코멘트 추가 후 필요 시 구현
  };

  const handleIssueLinked = (issue) => {
    if (linkedIssues.some((li) => li.key === issue.key)) return;

    setLinkedIssues((prev) => [...prev, issue]);

    // 콤마로 구분된 문자열에 추가
    setJiraIssueKeyByUser((prev) => {
      const keys = prev
        ? prev
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : [];
      if (!keys.includes(issue.key)) {
        keys.push(issue.key);
      }
      return keys.join(",");
    });
  };

  const handleIssueUnlinked = (issueKey) => {
    setLinkedIssues((prev) => prev.filter((issue) => issue.key !== issueKey));

    // 콤마로 구분된 문자열에서 제거
    setJiraIssueKeyByUser((prev) => {
      const keys = prev
        ? prev
            .split(",")
            .map((k) => k.trim())
            .filter(Boolean)
        : [];
      const updatedKeys = keys.filter((k) => k !== issueKey);
      return updatedKeys.join(",");
    });
  };

  const shouldShowJiraButton = () => {
    return (
      jiraConnectionStatus?.hasConfig &&
      jiraConnectionStatus?.isConnected &&
      (result === TestResult.FAIL ||
        result === TestResult.BLOCKED ||
        detectedJiraIssues.length > 0)
    );
  };

  useEffect(() => {
    if ((!open && !fullPage) || isViewer) return;

    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (document.activeElement.tagName === "TEXTAREA") return;

      const key = e.key.toUpperCase();
      if (KEY_RESULT_MAP[key]) {
        const newResult = KEY_RESULT_MAP[key];
        setResultByUser(newResult);
        setTimeout(
          () =>
            handleSaveAndNext(newResult, {
              advanceToNext: false,
              keepDialogOpen: true,
              showSuccess: true,
            }),
          0,
        );
        e.preventDefault();
        return;
      }

      if (e.key === "Enter") {
        if (
          document.activeElement !== saveButtonRef.current &&
          document.activeElement.tagName !== "TEXTAREA"
        ) {
          handleSaveAndNext(result);
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, fullPage, isViewer, handleSaveAndNext, result]);

  const renderContent = () => (
    <>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : testCase ? (
        <>
          <TestCaseDetails testCase={testCase} t={t} />

          <Box sx={{ mt: 3, width: "100%", boxSizing: "border-box" }}>
            <TestResultNotes
              notes={notes}
              setNotes={setNotesByUser}
              isViewer={isViewer}
              t={t}
              darkMode={darkMode}
              height={fullPage ? 300 : 200}
              onNext={onNext}
              onPrevious={onPrevious}
              currentIndex={currentIndex}
              totalCount={totalCount}
              onFullscreenChange={setIsNotesFullscreen}
              onMarkdownPaste={(event) =>
                handleMarkdownPaste(event, { type: "field", field: "notes" })
              }
              inlineImageUploading={inlineImageUploading}
              result={result}
              onResultChange={(newResult) => {
                setResultByUser(newResult);
                setTimeout(
                  () =>
                    handleSaveAndNext(newResult, {
                      advanceToNext: false,
                      keepDialogOpen: true,
                      showSuccess: true,
                    }),
                  100,
                );
              }}
              onSave={() => handleSaveAndNext(result)}
              onClose={onClose}
              loading={loading}
              shouldShowJiraButton={shouldShowJiraButton}
              handleOpenJiraDialog={handleOpenJiraDialog}
              testCase={testCase}
              saveButtonRef={saveButtonRef}
            />

            <TestResultTags
              tags={tags}
              setTags={setTagsByUser}
              availableTags={availableTags}
              isViewer={isViewer}
              t={t}
            />

            <TestResultAttachments
              attachedFiles={attachedFiles}
              handleFileUpload={handleFileUpload}
              handleFileDelete={handleFileDelete}
              handlePreview={handlePreview}
              isViewer={isViewer}
              t={t}
              fileUploadError={fileUploadError}
              isFileUploading={isFileUploading}
              currentResult={stableCurrentResult}
            />

            <TestResultJira
              jiraIssueKey={jiraIssueKey}
              jiraConnectionStatus={jiraConnectionStatus}
              result={result}
              notes={notes}
              handleIssueLinked={handleIssueLinked}
              handleIssueUnlinked={handleIssueUnlinked}
              onJiraIssueKeyChange={setJiraIssueKeyByUser}
              linkedIssues={linkedIssues}
              isViewer={isViewer}
              t={t}
              detectedJiraIssues={detectedJiraIssues}
              testCase={testCase}
            />
          </Box>
        </>
      ) : null}
    </>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: (theme) => theme.palette.background.default,
          p: { xs: 1, sm: 2, md: 3 },
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <TestResultHeader
          onPrevious={onPrevious}
          onNext={onNext}
          onBack={onBack}
          currentIndex={currentIndex}
          totalCount={totalCount}
          testCase={testCase}
          isViewer={isViewer}
          t={t}
          hideButtons={false}
          execution={execution}
          autoSaveStatus={autoSaveStatus}
          autoSaveError={autoSaveError}
        />

        {renderContent()}

        {!isNotesFullscreen && (
          <TestResultFloatingMenu
            result={result}
            onResultChange={(newResult) => {
              setResultByUser(newResult);
              setTimeout(
                () =>
                  handleSaveAndNext(newResult, {
                    advanceToNext: false,
                    keepDialogOpen: true,
                    showSuccess: true,
                  }),
                100,
              );
            }}
            onPrevious={onPrevious}
            onNext={onNext}
            onSave={() => handleSaveAndNext(result)}
            onClose={onClose}
            currentIndex={currentIndex}
            totalCount={totalCount}
            isViewer={isViewer}
            loading={loading}
            shouldShowJiraButton={shouldShowJiraButton}
            handleOpenJiraDialog={handleOpenJiraDialog}
            testCase={testCase}
            saveButtonRef={saveButtonRef}
            t={t}
            isNotesFullscreen={isNotesFullscreen}
          />
        )}

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
          open={showSaveSuccess}
          autoHideDuration={3000}
          onClose={() => setShowSaveSuccess(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="success" onClose={() => setShowSaveSuccess(false)}>
            {t("testcase.message.saved", "저장되었습니다.")}
          </Alert>
        </Snackbar>
        <Snackbar
          open={showNoChangeInfo}
          autoHideDuration={3000}
          onClose={() => setShowNoChangeInfo(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="info" onClose={() => setShowNoChangeInfo(false)}>
            {t(
              "testResult.message.noChange",
              "변경 사항이 없어 저장하지 않았습니다.",
            )}
          </Alert>
        </Snackbar>

        <Dialog
          open={previewOpen}
          onClose={handleClosePreview}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>{previewTitle}</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: "center" }}>
              <img
                src={previewUrl}
                alt={previewTitle}
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreview}>
              {t("common.button.close", "닫기")}
            </Button>
          </DialogActions>
        </Dialog>

        <JiraCommentDialog
          open={jiraDialogOpen}
          onClose={() => setJiraDialogOpen(false)}
          testResult={{ result, notes, jiraIssueKey }}
          testCase={testCase}
          linkedIssues={linkedIssues}
          onCommentAdded={handleJiraCommentAdded}
        />
      </Box>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      aria-labelledby="test-result-dialog"
    >
      <DialogTitle id="test-result-dialog">
        {t("testResult.form.title")}
      </DialogTitle>
      <DialogContent sx={{ pb: 12, px: { xs: 2, sm: 3 } }}>
        {renderContent()}
        {!loading && testCase && !isNotesFullscreen && (
          <TestResultFloatingMenu
            result={result}
            onResultChange={(newResult) => {
              setResultByUser(newResult);
              setTimeout(
                () =>
                  handleSaveAndNext(newResult, {
                    advanceToNext: false,
                    keepDialogOpen: true,
                    showSuccess: true,
                  }),
                100,
              );
            }}
            onPrevious={onPrevious}
            onNext={onNext}
            onSave={() => handleSaveAndNext(result)}
            onClose={onClose}
            currentIndex={currentIndex}
            totalCount={totalCount}
            isViewer={isViewer}
            loading={loading}
            shouldShowJiraButton={shouldShowJiraButton}
            handleOpenJiraDialog={handleOpenJiraDialog}
            testCase={testCase}
            saveButtonRef={saveButtonRef}
            t={t}
            isNotesFullscreen={isNotesFullscreen}
          />
        )}
      </DialogContent>

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
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSaveSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setShowSaveSuccess(false)}>
          {t("testcase.message.saved", "저장되었습니다.")}
        </Alert>
      </Snackbar>
      <Snackbar
        open={showNoChangeInfo}
        autoHideDuration={3000}
        onClose={() => setShowNoChangeInfo(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="info" onClose={() => setShowNoChangeInfo(false)}>
          {t(
            "testResult.message.noChange",
            "변경 사항이 없어 저장하지 않았습니다.",
          )}
        </Alert>
      </Snackbar>

      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{previewTitle}</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center" }}>
            <img
              src={previewUrl}
              alt={previewTitle}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>
            {t("common.button.close", "닫기")}
          </Button>
        </DialogActions>
      </Dialog>

      <JiraCommentDialog
        open={jiraDialogOpen}
        onClose={() => setJiraDialogOpen(false)}
        testResult={{ result, notes, jiraIssueKey }}
        testCase={testCase}
        linkedIssues={linkedIssues}
        onCommentAdded={handleJiraCommentAdded}
      />

      <InlineImageDialog
        open={imageDialogState.open}
        imageDialogState={imageDialogState}
        t={t}
        onClose={handleInlineImageDialogClose}
        onInsert={handleInlineImageInsert}
        updateImageDialogState={updateImageDialogState}
      />
    </Dialog>
  );
};

TestResultForm.propTypes = {
  open: PropTypes.bool.isRequired,
  testCaseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  executionId: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  currentResult: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onNext: PropTypes.func,
  onPrevious: PropTypes.func,
  currentIndex: PropTypes.number,
  totalCount: PropTypes.number,
  fullPage: PropTypes.bool,
  onOpenFullPage: PropTypes.func,
  isPreviousResultEdit: PropTypes.bool,
};

export default TestResultForm;
