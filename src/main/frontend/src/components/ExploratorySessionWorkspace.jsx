import React from "react";
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
} from "@mui/material";
import { useI18n } from "../context/I18nContext.jsx";
import { useAppContext } from "../context/AppContext.jsx";
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
  RUNNING: "warning",
  PAUSED: "warning",
  SUBMITTED: "info",
  APPROVED: "success",
  NEEDS_UPDATE: "error",
  DRAFT: "default",
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
  const { t } = useI18n();
  const { api, user } = useAppContext();
  const [view, setView] = React.useState(0);
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
  const [selectedSessionId, setSelectedSessionId] = React.useState(null);
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
  const INITIAL_SESSION_DRAFT = React.useMemo(
    () => ({
      projectId: projectId || "",
      charterId: "",
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
      flowNotes: "",
      coverageNotes: "",
      oracleNotes: "",
      activityNotes: "",
      bugHeadline: "",
      blockers: "",
      remainingQuestions: "",
      testData: "",
      evaluation: "",
      nextCharter: "",
      achievement: 0,
      status: "DRAFT",
    }),
    [projectId, user],
  );

  const [sessionDraft, setSessionDraft] = React.useState(INITIAL_SESSION_DRAFT);
  const [savingSession, setSavingSession] = React.useState(false);
  const [artifacts, setArtifacts] = React.useState([]);

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

  const parseApiError = React.useCallback(async (response, fallbackMessage) => {
    try {
      const data = await response.json();
      return data?.message || fallbackMessage;
    } catch (e) {
      return fallbackMessage;
    }
  }, []);

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
      return { ...prev, charterId: charters[0].id };
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
    if (sessionFilters.tester) {
      const keyword = sessionFilters.tester.toLowerCase();
      if (!`${item.tester}`.toLowerCase().includes(keyword)) {
        return false;
      }
    }
    return true;
  });

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
          testerId: data.testerId,
          testerName: data.testerName,
          leadId: data.leadId,
          leadName: data.leadName,
          netDurationMinutes: data.netDurationMinutes,
          testExecutionPct: data.testExecutionPct,
          bugInvestigationPct: data.bugInvestigationPct,
          setupAdminPct: data.setupAdminPct,
          environmentSummary: data.environmentSummary || "",
          productVersion: data.productVersion || "",
          strategyTags: data.strategyTags || [],
          areaTags: data.areaTags || [],
          flowNotes: data.flowNotes || "",
          coverageNotes: data.coverageNotes || "",
          oracleNotes: data.oracleNotes || "",
          activityNotes: data.activityNotes || "",
          bugHeadline: data.bugHeadline || "",
          blockers: data.blockers || "",
          remainingQuestions: data.remainingQuestions || "",
          testData: data.testData || "",
          evaluation: data.evaluation || "",
          nextCharter: data.nextCharter || "",
          achievement: data.achievement || 0,
          status: data.status,
        });

        // 타이머 상태 복구 (최소한의 로직)
        if (data.status === "RUNNING") setTimerStatus("running");
        else if (data.status === "PAUSED") setTimerStatus("paused");
        else setTimerStatus("idle");

        // 경과 시간 계산 (백엔드 데이터 기반으로 개선 가능)
        if (data.netDurationMinutes) {
          setElapsedSec(data.netDurationMinutes * 60);
        }
        if (data.interruptedMinutes) {
          setPausedSec(data.interruptedMinutes * 60);
        }

        setView(2); // 편집 탭으로 이동
      } catch (err) {
        setSessionError(err.message);
      } finally {
        setSessionsLoading(false);
      }
    },
    [api, parseApiError],
  );

  const saveSession = async () => {
    setSavingSession(true);
    setSessionError("");
    try {
      const isEdit = !!sessionDraft.id;
      const url = isEdit ? `/api/sessions/${sessionDraft.id}` : "/api/sessions";
      const method = isEdit ? "PUT" : "POST";

      const response = await api(url, {
        method,
        body: JSON.stringify(sessionDraft),
      });

      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "세션 저장에 실패했습니다."),
        );
      }

      const saved = await response.json();
      setSessionDraft((prev) => ({ ...prev, id: saved.id }));
      await loadSessions();
      alert(t("exploratory.session.saveSuccess", "세션이 저장되었습니다."));
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
    setSelectedSessionId(sessionId);
    // 편집 모드로 바로 진입하도록 변경
    loadSessionForEdit(sessionId);
  };

  const handleCreateSession = () => {
    setSelectedSessionId(null);
    setSessionDraft(INITIAL_SESSION_DRAFT);
    setTimerStatus("idle");
    setElapsedSec(0);
    setPausedSec(0);
    setView(2);
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
        setSelectedSessionId(null);
        setSessionDraft(INITIAL_SESSION_DRAFT);
      }
    } catch (error) {
      setSessionError("세션 삭제 중 오류가 발생했습니다.");
    }
  };

  const selectedCharter = charters.find(
    (item) => item.id === sessionDraft.charterId,
  );
  const totalRatio =
    Number(sessionDraft.testExecutionPct || 0) +
    Number(sessionDraft.bugInvestigationPct || 0) +
    Number(sessionDraft.setupAdminPct || 0);

  const onUploadArtifacts = (event) => {
    const files = Array.from(event.target.files || []);
    const mapped = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }));
    setArtifacts((prev) => [...mapped, ...prev]);
    event.target.value = "";
  };

  return (
    <Paper
      sx={{
        p: 0,
        minHeight: "calc(100vh - 160px)",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        color: "white",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          background: "rgba(255,255,255,0.02)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
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
          onChange={(_, value) => setView(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            "& .MuiTabs-indicator": {
              height: 4,
              borderRadius: "4px 4px 0 0",
              bgcolor: "primary.light",
            },
            "& .MuiTab-root": {
              color: "rgba(255,255,255,0.4)",
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              minHeight: 48,
              "&.Mui-selected": {
                color: "white",
              },
            },
          }}
        >
          <Tab label={t("exploratory.view.charterManagement", "관리")} />
          <Tab label={t("exploratory.view.sessionList", "목록")} />
          <Tab label={t("exploratory.view.sessionEditor", "작성/편집")} />
          <Tab label={t("exploratory.view.debriefApproval", "디브리프")} />
          <Tab label={t("exploratory.view.sessionDetail", "상세")} />
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
            artifacts={artifacts}
            statusColor={statusColor}
            saveSession={saveSession}
            savingSession={savingSession}
            sessionError={sessionError}
          />
        )}

        {view === 3 && (
          <ExploratoryDebriefTab
            t={t}
            sessionDraft={sessionDraft}
            setSessionDraft={setSessionDraft}
          />
        )}

        {view === 4 && (
          <ExploratoryDetailTab
            t={t}
            sessionId={selectedSessionId}
            sessions={sessions}
            charters={charters}
            statusColor={statusColor}
          />
        )}
      </Box>
    </Paper>
  );
}

export default ExploratorySessionWorkspace;
