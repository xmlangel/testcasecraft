import React from "react";
import { useSearchParams } from "react-router-dom";
import {
  AppBar,
  Box,
  Chip,
  Container,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Toolbar,
  Tooltip,
  Typography,
  Avatar,
  useTheme,
} from "@mui/material";
import { useI18n } from "../context/I18nContext.jsx";
import { useAppContext } from "../context/AppContext.jsx";
import { useTheme as useAppTheme } from "../context/ThemeContext.jsx";
import ExploratoryCharterTab from "./exploratory/ExploratoryCharterTab.jsx";
import ExploratorySessionListTab from "./exploratory/ExploratorySessionListTab.jsx";
import ExploratorySessionEditorTab from "./exploratory/ExploratorySessionEditorTab.jsx";
import ExploratoryDebriefTab from "./exploratory/ExploratoryDebriefTab.jsx";
import ExploratoryDetailTab from "./exploratory/ExploratoryDetailTab.jsx";

const formatSeconds = (seconds) => {
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const statusColor = {
  ACTIVE: "success",
  ARCHIVED: "default",
  RUNNING: "success",
  PAUSED: "warning",
  COMPLETED: "secondary",
  SUBMITTED: "default",
  APPROVED: "default",
  NEEDS_UPDATE: "error",
  DRAFT: "info",
};

const CHARTER_TEMPLATE = `# 🎯 목적 (Objective)
- 

---

# ⏱️ 세션 정보 (Session Info)
- 테스트 시간: 
- 테스터: 
- 환경: 

---

# 🔍 테스트 범위 (Scope)
- 

---

# 🧭 테스트 아이디어 (Test Ideas)
- 

---

# ⚠️ 리스크 영역 (Risks)
- 

---

# 🧪 테스트 전략 (Approach)
- 

---

# ✅ 완료 기준 (Exit Criteria)
- 

---

# 📝 결과 기록 (Notes)
- 
`;

function ExploratorySessionWorkspace({ projectId }) {
  const theme = useTheme();
  const { designSystem } = useAppTheme();
  const isDark = theme.palette.mode === "dark";
  const isGlass = designSystem === "glass";
  const { t } = useI18n();
  const { api, user } = useAppContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "charters";
  const sessionIdParam = searchParams.get("sessionId");

  const viewMap = React.useMemo(
    () => ({
      charters: 0,
      sessions: 1,
      editor: 2,
      debrief: 3,
      detail: 4,
    }),
    [],
  );

  const reverseViewMap = React.useMemo(
    () => ({
      0: "charters",
      1: "sessions",
      2: "editor",
      3: "debrief",
      4: "detail",
    }),
    [],
  );

  const [view, setView] = React.useState(viewMap[tabParam] ?? 0);
  const [selectedSessionId, setSelectedSessionId] = React.useState(
    sessionIdParam || null,
  );

  // sessionDraft 초기값 선언
  const INITIAL_SESSION_DRAFT = React.useMemo(
    () => ({
      projectId: projectId || "",
      charterId: "",
      title: "",
      testerId: user?.id || "",
      testerName: user?.username || user?.id || "Tester",
      leadId: "admin",
      leadName: "Admin",
      netDurationMinutes: 60,
      testExecutionPct: 60,
      bugInvestigationPct: 25,
      setupAdminPct: 15,
      environmentSummary: "Staging",
      productVersion: "v1.0.0",
      strategyTags: [],
      areaTags: [],
      achievement: 0,
      status: "DRAFT",
      jiraIssueKey: "",
      notes: [],
      tests: [],
      bugs: [],
      attachments: [],
      id: null,
      evaluation: "",
      nextCharter: "",
    }),
    [projectId, user],
  );

  const [sessionDraft, setSessionDraft] = React.useState(INITIAL_SESSION_DRAFT);

  // Parse API errors early (before use in useEffects)
  const parseApiError = React.useCallback(async (response, fallbackMessage) => {
    try {
      const data = await response.json();
      return data?.message || fallbackMessage;
    } catch (e) {
      return fallbackMessage;
    }
  }, []);

  // Load session for editing (must be before useEffect that calls it)
  const loadSessionForEdit = React.useCallback(
    async (sessionId) => {
      if (!sessionId) return;

      setSessionsLoading(true);
      setSessionError("");
      try {
        const response = await api(`/api/sessions/${sessionId}`);
        if (!response.ok) {
          throw new Error(
            await parseApiError(response, "세션 정보를 불러오지 못했습니다."),
          );
        }
        const data = await response.json();

        setSessionDraft({
          id: data.id,
          projectId: data.projectId,
          charterId: data.charterId,
          title: data.title || "",
          testerId: data.testerId,
          testerName: data.testerName,
          leadId: data.leadId,
          leadName: data.leadName,
          netDurationMinutes: data.netDurationMinutes,
          testExecutionPct: data.testExecutionPct ?? 60,
          bugInvestigationPct: data.bugInvestigationPct ?? 25,
          setupAdminPct: data.setupAdminPct ?? 15,
          environmentSummary: data.environmentSummary || "",
          productVersion: data.productVersion || "",
          strategyTags: data.strategyTags || [],
          areaTags: data.areaTags || [],
          achievement: data.achievement || 0,
          status: data.status,
          jiraIssueKey: data.jiraIssueKey || "",
          notes: data.notes || [],
          tests: data.tests || [],
          bugs: data.bugs || [],
          attachments: data.attachments || [],
          evaluation: data.evaluation || "",
          nextCharter: data.nextCharter || "",
          flowNotes: data.flowNotes || "",
          coverageNotes: data.coverageNotes || "",
          oracleNotes: data.oracleNotes || "",
          activityNotes: data.activityNotes || "",
          bugHeadline: data.bugHeadline || "",
          blockers: data.blockers || "",
          remainingQuestions: data.remainingQuestions || "",
          testData: data.testData || "",
        });

        // 타이머 상태 복구
        if (data.status === "RUNNING") setTimerStatus("running");
        else if (data.status === "PAUSED") setTimerStatus("paused");
        else if (
          data.status === "COMPLETED" ||
          data.status === "SUBMITTED" ||
          data.status === "APPROVED" ||
          data.status === "NEEDS_UPDATE" ||
          (data.status === "DRAFT" && data.startedAt)
        )
          setTimerStatus("ended");
        else setTimerStatus("idle");

        if (data.currentElapsedSeconds !== undefined) {
          setElapsedSec(data.currentElapsedSeconds);
        } else if (data.netDurationMinutes) {
          setElapsedSec(data.netDurationMinutes * 60);
        }

        if (data.interruptedSeconds !== undefined) {
          setPausedSec(data.interruptedSeconds);
        } else if (data.interruptedMinutes) {
          setPausedSec(data.interruptedMinutes * 60);
        }

        // data loading 완료 후 view 동기화
        let targetView = 2; // 기본: 작성/편집
        if (data.status === "APPROVED" || data.status === "ARCHIVED") {
          targetView = 4; // 상세
        } else if (
          data.status === "COMPLETED" ||
          data.status === "SUBMITTED" ||
          data.status === "NEEDS_UPDATE"
        ) {
          targetView = 3; // 디브리프
        }

        if (view !== targetView) handleSetView(targetView);
      } catch (err) {
        setSessionError(err.message);
      } finally {
        setSessionsLoading(false);
      }
    },
    [api, parseApiError, view],
  );

  React.useEffect(() => {
    const v = viewMap[tabParam] ?? 0;
    if (v !== view) setView(v);

    if (sessionIdParam !== selectedSessionId) {
      setSelectedSessionId(sessionIdParam || null);
    }
  }, [tabParam, sessionIdParam, view, selectedSessionId, viewMap]);

  // 세션 ID가 변경되었으나 데이터가 로드되지 않은 경우 자동 로딩
  React.useEffect(() => {
    if (selectedSessionId && sessionDraft.id !== selectedSessionId) {
      loadSessionForEdit(selectedSessionId);
    }
  }, [selectedSessionId, sessionDraft.id, loadSessionForEdit]);

  // 내부 상태가 변경될 때 URL 파라미터 동기화
  const updateUrl = React.useCallback(
    (newView, newSessionId) => {
      const nextParams = new URLSearchParams(searchParams);
      const tabName = reverseViewMap[newView] || "charters";
      nextParams.set("tab", tabName);

      if (newSessionId) {
        nextParams.set("sessionId", newSessionId);
      } else {
        nextParams.delete("sessionId");
      }

      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams, reverseViewMap],
  );

  const handleSetView = (newView) => {
    setView(newView);
    updateUrl(newView, selectedSessionId);
  };

  const handleSetSelectedSessionId = (newId) => {
    setSelectedSessionId(newId);
    updateUrl(view, newId);
  };
  const [charters, setCharters] = React.useState([]);
  const [chartersLoading, setChartersLoading] = React.useState(false);
  const [charterError, setCharterError] = React.useState("");
  const [savingCharter, setSavingCharter] = React.useState(false);
  const [sessions, setSessions] = React.useState([]);
  const [sessionsLoading, setSessionsLoading] = React.useState(false);
  const [sessionError, setSessionError] = React.useState("");
  const [charterFilter, setCharterFilter] = React.useState("ALL");
  const [sessionFilters, setSessionFilters] = React.useState({
    status: "ALL",
    tester: "",
    charterId: "ALL",
    periodFrom: "",
    periodTo: "",
  });
  const [charterDialogOpen, setCharterDialogOpen] = React.useState(false);
  const [editingCharter, setEditingCharter] = React.useState(null);
  const [charterForm, setCharterForm] = React.useState({
    title: "",
    mission: CHARTER_TEMPLATE,
    status: "ACTIVE",
  });
  const [charterErrors, setCharterErrors] = React.useState({});
  const [timerStatus, setTimerStatus] = React.useState("idle");
  const [elapsedSec, setElapsedSec] = React.useState(0);
  const [pausedSec, setPausedSec] = React.useState(0);
  const [savingSession, setSavingSession] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (timerStatus === "running") {
        setElapsedSec((prev) => prev + 1);
      }
      if (timerStatus === "paused") {
        setPausedSec((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStatus]);

  const loadCharters = React.useCallback(async () => {
    if (!projectId) {
      setCharters([]);
      return;
    }

    setChartersLoading(true);
    setCharterError("");
    try {
      const response = await api(`/api/projects/${projectId}/charters`);
      if (!response.ok) {
        const message = await parseApiError(
          response,
          "차터 목록을 불러오지 못했습니다.",
        );
        setCharterError(message);
        return;
      }

      const data = await response.json();
      setCharters(Array.isArray(data) ? data : []);
    } catch (error) {
      setCharterError("차터 목록을 불러오는 중 네트워크 오류가 발생했습니다.");
    } finally {
      setChartersLoading(false);
    }
  }, [api, parseApiError, projectId]);

  React.useEffect(() => {
    loadCharters();
  }, [loadCharters]);

  React.useEffect(() => {
    if (charters.length === 0) {
      return;
    }

    setSessionDraft((prev) => {
      if (
        prev.charterId &&
        charters.some((charter) => charter.id === prev.charterId)
      ) {
        return prev;
      }
      const firstCharter = charters[0];
      return {
        ...prev,
        charterId: firstCharter.id,
        title:
          prev.title || (firstCharter ? `${firstCharter.title} - Session` : ""),
      };
    });
  }, [charters]);

  const openNewCharterDialog = () => {
    setEditingCharter(null);
    setCharterForm({
      title: "",
      mission: CHARTER_TEMPLATE,
      status: "ACTIVE",
    });
    setCharterErrors({});
    setCharterDialogOpen(true);
  };

  const openEditCharterDialog = (charter) => {
    setEditingCharter(charter.id);
    setCharterForm({
      title: charter.title,
      mission: charter.mission || "",
      status: charter.status,
    });
    setCharterErrors({});
    setCharterDialogOpen(true);
  };

  const saveCharter = async () => {
    if (!projectId) {
      setCharterError("프로젝트 정보가 없어 차터를 저장할 수 없습니다.");
      return;
    }

    const newErrors = {};
    if (!charterForm.title.trim()) {
      newErrors.title = t(
        "exploratory.charter.error.titleRequired",
        "차터 이름은 필수입니다.",
      );
    }
    if (!charterForm.mission.trim()) {
      newErrors.mission = t(
        "exploratory.charter.error.missionRequired",
        "내용은 필수입니다.",
      );
    }

    if (Object.keys(newErrors).length > 0) {
      setCharterErrors(newErrors);
      setCharterError(
        t(
          "exploratory.charter.error.checkFields",
          "필수 항목을 확인해 주세요.",
        ),
      );
      return;
    }

    setSavingCharter(true);
    setCharterError("");
    setCharterErrors({});

    const payload = {
      projectId,
      title: charterForm.title.trim(),
      mission: charterForm.mission.trim(),
      status: charterForm.status,
      createdBy: user?.username || user?.id || "exploratory-user",
    };

    try {
      const response = editingCharter
        ? await api(`/api/charters/${editingCharter}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          })
        : await api("/api/charters", {
            method: "POST",
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        const message = await parseApiError(
          response,
          editingCharter
            ? "차터 수정에 실패했습니다."
            : "차터 생성에 실패했습니다.",
        );
        setCharterError(message);
        return;
      }

      await loadCharters();
      setCharterDialogOpen(false);
    } catch (error) {
      setCharterError("차터 저장 중 네트워크 오류가 발생했습니다.");
    } finally {
      setSavingCharter(false);
    }
  };

  const filteredCharters = charters.filter((item) => {
    if (charterFilter === "ALL") return true;
    return item.status === charterFilter;
  });

  const loadSessions = React.useCallback(async () => {
    if (!projectId) {
      setSessions([]);
      return;
    }

    setSessionsLoading(true);
    setSessionError("");
    try {
      const params = new URLSearchParams();
      if (sessionFilters.status !== "ALL") {
        params.set("status", sessionFilters.status);
      }
      if (sessionFilters.charterId !== "ALL") {
        params.set("charterId", sessionFilters.charterId);
      }
      if (sessionFilters.periodFrom) {
        params.set("from", `${sessionFilters.periodFrom}T00:00:00`);
      }
      if (sessionFilters.periodTo) {
        params.set("to", `${sessionFilters.periodTo}T23:59:59`);
      }
      params.set("sort", "createdAt,desc");

      const query = params.toString();
      const response = await api(
        `/api/projects/${projectId}/sessions${query ? `?${query}` : ""}`,
      );
      if (!response.ok) {
        const message = await parseApiError(
          response,
          "세션 목록을 불러오지 못했습니다.",
        );
        setSessionError(message);
        return;
      }

      const data = await response.json();
      const mapped = (Array.isArray(data) ? data : []).map((item) => ({
        id: item.id,
        title: item.charterSnapshotTitle || item.id,
        status: item.status,
        tester: item.testerName || item.testerId || "-",
        charterId: item.charterId,
        date: (item.startedAt || item.createdAt || "").slice(0, 10),
        durationMin: item.netDurationMinutes,
        raw: item,
      }));
      setSessions(mapped);
    } catch (error) {
      setSessionError("세션 목록을 불러오는 중 네트워크 오류가 발생했습니다.");
    } finally {
      setSessionsLoading(false);
    }
  }, [
    api,
    parseApiError,
    projectId,
    sessionFilters.status,
    sessionFilters.charterId,
    sessionFilters.periodFrom,
    sessionFilters.periodTo,
  ]);

  React.useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const filteredSessions = sessions.filter((item) => {
    // 1. 상태 필터가 'ALL'인 경우 ARCHIVED 세션은 숨김 (사용자 요청)
    if (sessionFilters.status === "ALL" && item.status === "ARCHIVED") {
      return false;
    }
    // 2. 테스터 필터
    if (sessionFilters.tester) {
      const keyword = sessionFilters.tester.toLowerCase();
      if (!`${item.tester}`.toLowerCase().includes(keyword)) {
        return false;
      }
    }
    return true;
  });

  const saveSession = async (draftOverride = null, silent = false) => {
    // 유효성 검사: 차터 필수 선택
    const targetDraft = draftOverride || sessionDraft;
    if (!targetDraft.charterId) {
      setSessionError(
        t(
          "exploratory.session.error.charterRequired",
          "할당된 테스트 차터를 선택해야 합니다.",
        ),
      );
      return null;
    }

    setSavingSession(true);
    setSessionError("");
    try {
      const targetDraft = draftOverride || sessionDraft;
      const isEdit = !!targetDraft.id;
      const url = isEdit ? `/api/sessions/${targetDraft.id}` : "/api/sessions";
      const method = isEdit ? "PUT" : "POST";

      const response = await api(url, {
        method,
        body: JSON.stringify(targetDraft),
      });

      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "세션 저장에 실패했습니다."),
        );
      }

      const saved = await response.json();
      setSessionDraft((prev) => ({ ...prev, ...saved }));
      await loadSessions();
      if (!silent) {
        alert(t("exploratory.session.saveSuccess", "세션이 저장되었습니다."));
      }
      return saved;
    } catch (err) {
      setSessionError(err.message);
      return null;
    } finally {
      setSavingSession(false);
    }
  };

  const submitSession = async () => {
    if (!sessionDraft.id) {
      setSessionError("세션을 먼저 저장해야 합니다.");
      return;
    }

    setSavingSession(true);
    setSessionError("");
    try {
      const response = await api(`/api/sessions/${sessionDraft.id}/submit`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "세션 제출에 실패했습니다."),
        );
      }

      const updated = await response.json();
      setSessionDraft((prev) => ({ ...prev, status: updated.status }));
      await loadSessions();
      alert(t("exploratory.session.submitSuccess", "세션이 제출되었습니다."));
    } catch (err) {
      setSessionError(err.message);
    } finally {
      setSavingSession(false);
    }
  };

  const approveSession = async () => {
    if (!sessionDraft.id) {
      setSessionError("세션 ID가 없습니다.");
      return;
    }

    setSavingSession(true);
    setSessionError("");
    try {
      const response = await api(`/api/sessions/${sessionDraft.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ comment: sessionDraft.reviewComment || "" }),
      });

      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "세션 승인에 실패했습니다."),
        );
      }

      const updated = await response.json();
      setSessionDraft((prev) => ({ ...prev, status: updated.status }));
      await loadSessions();
      alert(t("exploratory.session.approveSuccess", "세션이 승인되었습니다."));
    } catch (err) {
      setSessionError(err.message);
    } finally {
      setSavingSession(false);
    }
  };

  const rejectSession = async () => {
    if (!sessionDraft.id) {
      setSessionError("세션 ID가 없습니다.");
      return;
    }

    setSavingSession(true);
    setSessionError("");
    try {
      const response = await api(
        `/api/sessions/${sessionDraft.id}/request-update`,
        {
          method: "POST",
          body: JSON.stringify({ comment: sessionDraft.reviewComment || "" }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "보완 요청에 실패했습니다."),
        );
      }

      const updated = await response.json();
      setSessionDraft((prev) => ({ ...prev, status: updated.status }));
      await loadSessions();
      alert(
        t("exploratory.session.rejectSuccess", "보완 요청이 완료되었습니다."),
      );
    } catch (err) {
      setSessionError(err.message);
    } finally {
      setSavingSession(false);
    }
  };

  const handleTimerAction = async (action) => {
    if (!sessionDraft.id && action !== "start") {
      setSessionError("세션을 먼저 저장해야 합니다.");
      return;
    }

    // 만약 세션 ID가 없는데 시작을 누른 경우, 먼저 저장 시도
    let currentId = sessionDraft.id;
    if (!currentId && action === "start") {
      await saveSession();
      // saveSession 후 갱신된 draft에서 id 확인 필요하므로 잠시 대기하거나 별도 처리
    }

    // ID가 생겼거나 이미 있는 경우 API 호출
    setTimeout(async () => {
      const targetId = sessionDraft.id;
      if (!targetId) return;

      try {
        const response = await api(`/api/sessions/${targetId}/${action}`, {
          method: "POST",
        });
        if (!response.ok) {
          throw new Error(
            await parseApiError(
              response,
              `세션 ${action} 요청에 실패했습니다.`,
            ),
          );
        }
        const updated = await response.json();
        setSessionDraft((prev) => ({ ...prev, status: updated.status }));

        // 로컬 타이머 상태 변경
        if (action === "start" || action === "resume")
          setTimerStatus("running");
        else if (action === "pause") setTimerStatus("paused");
        else if (action === "end") setTimerStatus("ended");

        await loadSessions();
      } catch (err) {
        setSessionError(err.message);
      }
    }, 500);
  };

  const handleSelectSession = (sessionId) => {
    handleSetSelectedSessionId(sessionId);
    // 편집 모드로 바로 진입하도록 변경
    loadSessionForEdit(sessionId);
  };

  const handleCreateSession = () => {
    handleSetSelectedSessionId(null);
    setSessionDraft(INITIAL_SESSION_DRAFT);
    setTimerStatus("idle");
    setElapsedSec(0);
    setPausedSec(0);
    handleSetView(2);
  };

  const handleDeleteSession = async (sessionId) => {
    if (
      !window.confirm(
        t(
          "exploratory.session.confirmDelete",
          "정말로 이 세션을 삭제하시겠습니까?",
        ),
      )
    ) {
      return;
    }

    try {
      const response = await api(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const message = await parseApiError(
          response,
          "세션 삭제에 실패했습니다.",
        );
        setSessionError(message);
        return;
      }

      await loadSessions();
      if (selectedSessionId === sessionId) {
        handleSetSelectedSessionId(null);
        setSessionDraft(INITIAL_SESSION_DRAFT);
      }
    } catch (error) {
      setSessionError("세션 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleBackToList = () => {
    handleSetSelectedSessionId(null);
    setSessionDraft(INITIAL_SESSION_DRAFT);
    setTimerStatus("idle");
    setElapsedSec(0);
    setPausedSec(0);
    handleSetView(1); // 세션 목록 탭으로 복귀
  };

  const selectedCharter = charters.find(
    (item) => item.id === sessionDraft.charterId,
  );
  const totalRatio =
    Number(sessionDraft.testExecutionPct || 0) +
    Number(sessionDraft.bugInvestigationPct || 0) +
    Number(sessionDraft.setupAdminPct || 0);

  const onUploadArtifacts = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (!sessionDraft.id) {
      alert(
        t(
          "exploratory.session.saveFirst",
          "파일을 업로드하려면 먼저 세션을 저장해야 합니다.",
        ),
      );
      event.target.value = "";
      return;
    }

    setSavingSession(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api(
          `/api/session-attachments/upload/${sessionDraft.id}`,
          {
            method: "POST",
            headers: { "Content-Type": undefined },
            body: formData,
            // api 헬퍼가 multipart/form-data인 경우 Content-Type을 자동으로 처리하지 않을 수 있으므로 확인 필요
            // 보통 Fetch API는 FormData를 넘기면 Content-Type을 자동으로 boundary와 함께 설정함
          },
        );

        if (!response.ok) {
          throw new Error(
            await parseApiError(response, "파일 업로드에 실패했습니다."),
          );
        }

        const data = await response.json();
        if (data.success && data.attachment) {
          setSessionDraft((prev) => ({
            ...prev,
            attachments: [data.attachment, ...(prev.attachments || [])],
          }));
        }
      }
    } catch (err) {
      setSessionError(err.message);
    } finally {
      setSavingSession(false);
      event.target.value = "";
    }
  };

  const onUpdateArtifactDescription = async (attachmentId, description) => {
    try {
      const response = await api(`/api/session-attachments/${attachmentId}`, {
        method: "PATCH",
        body: JSON.stringify({ description }),
      });

      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "파일 설명 수정에 실패했습니다."),
        );
      }

      const data = await response.json();
      if (data.success && data.attachment) {
        setSessionDraft((prev) => ({
          ...prev,
          attachments: (prev.attachments || []).map((a) =>
            a.id === attachmentId ? data.attachment : a,
          ),
        }));
      }
    } catch (err) {
      setSessionError(err.message);
    }
  };

  const onDeleteArtifact = async (attachmentId) => {
    if (!window.confirm(t("common.confirmDelete", "삭제하시겠습니까?"))) return;

    setSavingSession(true);
    try {
      const response = await api(`/api/session-attachments/${attachmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "파일 삭제에 실패했습니다."),
        );
      }

      const data = await response.json();
      if (data.success) {
        setSessionDraft((prev) => ({
          ...prev,
          attachments: (prev.attachments || []).filter(
            (a) => a.id !== attachmentId,
          ),
        }));
      }
    } catch (err) {
      setSessionError(err.message);
    } finally {
      setSavingSession(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 0,
        minHeight: "calc(100vh - 160px)",
        background: isGlass
          ? isDark
            ? "rgba(15, 23, 42, 0.7)"
            : "rgba(255, 255, 255, 0.7)"
          : "background.paper",
        backdropFilter: isGlass ? "blur(20px) saturate(180%)" : "none",
        WebkitBackdropFilter: isGlass ? "blur(20px) saturate(180%)" : "none",
        color: "text.primary",
        borderRadius: isGlass ? 4 : 3,
        overflow: "hidden",
        boxShadow: isGlass
          ? isDark
            ? "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
            : "0 8px 32px 0 rgba(6, 182, 212, 0.1)"
          : "none",
        border: isGlass ? "1px solid" : "1px solid",
        borderColor: isGlass
          ? isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(255, 255, 255, 0.3)"
          : "divider",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          background: isGlass
            ? isDark
              ? "rgba(255, 255, 255, 0.02)"
              : "rgba(0, 0, 0, 0.02)"
            : "transparent",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, letterSpacing: -0.5 }}
          >
            {t("exploratory.workspace.title", "Exploratory Session Workspace")}
          </Typography>
          <Chip
            label={t("exploratory.workspace.badgeDraft", "PREMIUM THEME")}
            size="small"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 700,
              fontSize: "0.625rem",
              height: 20,
            }}
          />
        </Stack>
      </Box>

      <Box sx={{ px: 3, pt: 1 }}>
        <Tabs
          value={view}
          onChange={(_, value) => handleSetView(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            "& .MuiTabs-indicator": {
              height: 4,
              borderRadius: "4px 4px 0 0",
              bgcolor: "primary.main",
            },
            "& .MuiTab-root": {
              color: "text.secondary",
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              minHeight: 48,
              "&.Mui-selected": {
                color: "primary.main",
              },
            },
          }}
        >
          <Tab label={t("exploratory.view.charterManagement", "관리")} />
          <Tab label={t("exploratory.view.sessionList", "목록")} />
          {(selectedSessionId || view >= 2) && [
            <Tab
              key="editor"
              label={t("exploratory.view.sessionEditor", "작성/편집")}
            />,
            <Tab
              key="debrief"
              label={t("exploratory.view.debriefApproval", "디브리프")}
            />,
            <Tab
              key="detail"
              label={t("exploratory.view.sessionDetail", "상세")}
            />,
          ]}
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {view === 0 && (
          <ExploratoryCharterTab
            t={t}
            charterError={charterError}
            chartersLoading={chartersLoading}
            charterFilter={charterFilter}
            setCharterFilter={setCharterFilter}
            openNewCharterDialog={openNewCharterDialog}
            filteredCharters={filteredCharters}
            openEditCharterDialog={openEditCharterDialog}
            statusColor={statusColor}
            charterDialogOpen={charterDialogOpen}
            setCharterDialogOpen={setCharterDialogOpen}
            editingCharter={editingCharter}
            charterForm={charterForm}
            setCharterForm={setCharterForm}
            saveCharter={saveCharter}
            savingCharter={savingCharter}
            charterErrors={charterErrors}
          />
        )}

        {view === 1 && (
          <ExploratorySessionListTab
            t={t}
            sessionFilters={sessionFilters}
            setSessionFilters={setSessionFilters}
            charters={charters}
            filteredSessions={filteredSessions}
            statusColor={statusColor}
            sessionsLoading={sessionsLoading}
            sessionError={sessionError}
            onSelectSession={handleSelectSession}
            onCreateSession={handleCreateSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {view === 2 && (
          <ExploratorySessionEditorTab
            t={t}
            sessionDraft={sessionDraft}
            setSessionDraft={setSessionDraft}
            timerStatus={timerStatus}
            onTimerAction={handleTimerAction}
            elapsedSec={elapsedSec}
            pausedSec={pausedSec}
            formatSeconds={formatSeconds}
            charters={charters}
            selectedCharter={selectedCharter}
            totalRatio={totalRatio}
            onUploadArtifacts={onUploadArtifacts}
            onUpdateArtifactDescription={onUpdateArtifactDescription}
            onDeleteArtifact={onDeleteArtifact}
            statusColor={statusColor}
            saveSession={saveSession}
            submitSession={submitSession}
            savingSession={savingSession}
            sessionError={sessionError}
            onBackToList={handleBackToList}
          />
        )}

        {view === 3 && (
          <ExploratoryDebriefTab
            t={t}
            sessionDraft={sessionDraft}
            setSessionDraft={setSessionDraft}
            onBackToList={handleBackToList}
            saveSession={saveSession}
            submitSession={submitSession}
            approveSession={approveSession}
            rejectSession={rejectSession}
            savingSession={savingSession}
            artifacts={sessionDraft.attachments || []}
            onDeleteArtifact={onDeleteArtifact}
          />
        )}

        {view === 4 && (
          <ExploratoryDetailTab
            t={t}
            sessionId={selectedSessionId}
            sessions={sessions}
            charters={charters}
            statusColor={statusColor}
            onBackToList={handleBackToList}
          />
        )}
      </Box>
    </Paper>
  );
}

export default ExploratorySessionWorkspace;
