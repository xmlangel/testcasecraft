import React from "react";
import { Box, Chip, Paper, Tab, Tabs, Typography } from "@mui/material";
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
  const [sessionDraft, setSessionDraft] = React.useState({
    status: "DRAFT",
    environment: "Staging",
    version: "v1.24.0",
    tags: "payment, retry, regression",
    charterId: "charter-1",
    timeExecution: 60,
    timeBugInvestigation: 25,
    timeSetupAdmin: 15,
    flowNotes: "",
    coverageNotes: "",
    oracleNotes: "",
    activityNotes: "",
    bugHeadline: "PAY-421 | 간헐적 승인 실패",
    blockers: "",
    remainingQuestions: "",
    testData: "",
    evaluation: "",
    nextCharter: "",
    leadComment: "",
    achievement: 70,
  });
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
        const message = await parseApiError(response, "차터 목록을 불러오지 못했습니다.");
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
      if (prev.charterId && charters.some((charter) => charter.id === prev.charterId)) {
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
      newErrors.title = t("exploratory.charter.error.titleRequired", "차터 이름은 필수입니다.");
    }
    if (!charterForm.mission.trim()) {
      newErrors.mission = t("exploratory.charter.error.missionRequired", "내용은 필수입니다.");
    }

    if (Object.keys(newErrors).length > 0) {
      setCharterErrors(newErrors);
      setCharterError(t("exploratory.charter.error.checkFields", "필수 항목을 확인해 주세요."));
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
          editingCharter ? "차터 수정에 실패했습니다." : "차터 생성에 실패했습니다."
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
      const response = await api(`/api/projects/${projectId}/sessions${query ? `?${query}` : ""}`);
      if (!response.ok) {
        const message = await parseApiError(response, "세션 목록을 불러오지 못했습니다.");
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

  const selectedCharter = charters.find((item) => item.id === sessionDraft.charterId);
  const totalRatio =
    Number(sessionDraft.timeExecution) +
    Number(sessionDraft.timeBugInvestigation) +
    Number(sessionDraft.timeSetupAdmin);

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
    <Paper sx={{ p: 2, minHeight: "calc(100vh - 230px)" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6">{t("exploratory.workspace.title", "탐색 세션 워크스페이스")}</Typography>
        <Chip label={t("exploratory.workspace.badgeDraft", "UI 초안")} size="small" />
      </Box>

      <Tabs value={view} onChange={(_, value) => setView(value)} sx={{ mb: 2 }}>
        <Tab label={t("exploratory.view.charterManagement", "차터 관리")} />
        <Tab label={t("exploratory.view.sessionList", "세션 목록")} />
        <Tab label={t("exploratory.view.sessionEditor", "세션 작성/편집")} />
        <Tab label={t("exploratory.view.debriefApproval", "디브리프/승인")} />
        <Tab label={t("exploratory.view.sessionDetail", "세션 상세")} />
      </Tabs>

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
        />
      )}

      {view === 2 && (
        <ExploratorySessionEditorTab
          t={t}
          sessionDraft={sessionDraft}
          setSessionDraft={setSessionDraft}
          timerStatus={timerStatus}
          setTimerStatus={setTimerStatus}
          elapsedSec={elapsedSec}
          pausedSec={pausedSec}
          formatSeconds={formatSeconds}
          charters={charters}
          selectedCharter={selectedCharter}
          totalRatio={totalRatio}
          onUploadArtifacts={onUploadArtifacts}
          artifacts={artifacts}
          statusColor={statusColor}
        />
      )}

      {view === 3 && (
        <ExploratoryDebriefTab
          t={t}
          sessionDraft={sessionDraft}
          setSessionDraft={setSessionDraft}
        />
      )}

      {view === 4 && <ExploratoryDetailTab t={t} />}
    </Paper>
  );
}

export default ExploratorySessionWorkspace;
