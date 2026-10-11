// src/components/Requirement/RequirementWorkspace.jsx
//
// 프로젝트 영역 「요구사항」 탭. 세 하위 탭으로 나뉜다.
//   요구사항: 문서 트리 + 요구사항 CRUD + TC 연결
//   커버리지: TC 가 연결되지 않은 요구사항 찾기
//   리포트:   테스트플랜 기준 요구사항별 판정

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import PropTypes from "prop-types";
import { Alert, Box, CircularProgress, Paper, Tab, Tabs } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useI18n } from "../../context/I18nContext.jsx";
import { useAppContext } from "../../context/AppContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import useProjectRole from "../../hooks/useProjectRole.js";
import { canEditProjectContent } from "../TestCaseTree/utils/permissionUtils.js";
import requirementService from "../../services/requirementService.js";
import RequirementListView from "./RequirementListView.jsx";
import RequirementCoverageView from "./RequirementCoverageView.jsx";
import RequirementReportView from "./RequirementReportView.jsx";

// 관계도는 그래프 라이브러리를 쓰므로 탭을 열 때만 불러온다
const RequirementNetworkView = React.lazy(
  () => import("./RequirementNetworkView.jsx"),
);
import {
  RequirementDialog,
  RequirementSpecDialog,
} from "./RequirementDialogs.jsx";

function RequirementWorkspace({ projectId }) {
  const { t } = useI18n();
  const ctx = useAppContext() || {};
  const { user } = useAuth();
  const { projectRole } = useProjectRole(projectId, user);
  const canEdit = canEditProjectContent(projectRole);

  const [view, setView] = useState(0);
  // TC 화면의 「요구사항 화면으로 이동」이 ?requirementId= 로 들어온다
  const [searchParams] = useSearchParams();
  const initialRequirementId = searchParams.get("requirementId");
  const [specs, setSpecs] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [coverage, setCoverage] = useState(null);
  const [error, setError] = useState(null);
  const [specDialog, setSpecDialog] = useState(null);
  const [reqDialog, setReqDialog] = useState(null);

  const testCases = useMemo(
    () =>
      (ctx.testCases || []).filter(
        (tc) =>
          tc?.type === "testcase" && String(tc.projectId) === String(projectId),
      ),
    [ctx.testCases, projectId],
  );
  const testPlans = useMemo(
    () =>
      (ctx.testPlans || []).filter(
        (p) => !p?.projectId || String(p.projectId) === String(projectId),
      ),
    [ctx.testPlans, projectId],
  );
  const testExecutions = useMemo(
    () =>
      (ctx.testExecutions || []).filter(
        (e) => !e?.projectId || String(e.projectId) === String(projectId),
      ),
    [ctx.testExecutions, projectId],
  );

  const reload = useCallback(async () => {
    try {
      const [specList, reqList] = await Promise.all([
        requirementService.getSpecs(projectId),
        requirementService.getRequirements(projectId),
      ]);
      return { specList, reqList };
    } catch (e) {
      setError(e.message);
      return null;
    }
  }, [projectId]);

  const applyReload = useCallback(async () => {
    const data = await reload();
    if (data) {
      setSpecs(data.specList);
      setRequirements(data.reqList);
      setError(null);
    }
  }, [reload]);

  // 프로젝트가 바뀌면 이전 프로젝트 목록을 먼저 비우고, 늦게 온 이전 응답은 버린다.
  // TC·플랜·실행 목록은 프로젝트 진입 시 TestContext 가 이미 불러온다.
  useEffect(() => {
    let cancelled = false;
    setSpecs([]);
    setRequirements([]);
    setCoverage(null);
    reload().then((data) => {
      if (!cancelled && data) {
        setSpecs(data.specList);
        setRequirements(data.reqList);
        setError(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  useEffect(() => {
    if (view !== 1) return undefined;
    let cancelled = false;
    requirementService
      .getCoverage(projectId)
      .then((data) => !cancelled && setCoverage(data))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [view, projectId, requirements]);

  const replaceRequirement = (updated) =>
    setRequirements((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r)),
    );

  const handleSaveSpec = async (form) => {
    const body = { ...form, projectId };
    if (specDialog?.id) {
      await requirementService.updateSpec(specDialog.id, body);
    } else {
      await requirementService.createSpec(body);
    }
    setSpecDialog(null);
    await applyReload();
  };

  const handleDeleteSpec = async (spec) => {
    const message = t(
      "requirement.spec.confirmDelete",
      "이 문서와 하위 문서, 그 안의 요구사항과 TC 연결을 모두 삭제합니다. 테스트케이스는 지우지 않습니다. 계속할까요?",
    );
    if (!window.confirm(message)) return false;
    try {
      await requirementService.deleteSpec(spec.id);
      await applyReload();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  };

  const handleSaveRequirement = async (form) => {
    const body = { ...form, projectId };
    if (reqDialog?.id) {
      replaceRequirement(
        await requirementService.updateRequirement(reqDialog.id, body),
      );
    } else {
      const created = await requirementService.createRequirement(body);
      setRequirements((prev) => [...prev, created]);
    }
    setReqDialog(null);
  };

  const handleDeleteRequirement = async (req) => {
    if (!window.confirm(t("common.confirmDelete", "삭제하시겠습니까?")))
      return false;
    try {
      await requirementService.deleteRequirement(req.id);
      setRequirements((prev) => prev.filter((r) => r.id !== req.id));
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  };

  const runAndReplace = async (promise) => {
    try {
      replaceRequirement(await promise);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Paper
      sx={{ p: 2, minHeight: "calc(100vh - 180px)" }}
      data-testid="requirement-workspace"
    >
      <Tabs value={view} onChange={(_, v) => setView(v)} sx={{ mb: 2 }}>
        <Tab
          label={t("requirement.view.list", "요구사항")}
          data-testid="requirement-view-list"
        />
        <Tab
          label={t("requirement.view.coverage", "커버리지")}
          data-testid="requirement-view-coverage"
        />
        <Tab
          label={t("requirement.view.report", "리포트")}
          data-testid="requirement-view-report"
        />
        <Tab
          label={t("requirement.view.network", "관계도")}
          data-testid="requirement-view-network"
        />
      </Tabs>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box>
        {view === 0 && (
          <RequirementListView
            specs={specs}
            requirements={requirements}
            testCases={testCases}
            canEdit={canEdit}
            initialRequirementId={initialRequirementId}
            onAddSpec={(parentId) => setSpecDialog({ parentId })}
            onEditSpec={(spec) => setSpecDialog(spec)}
            onDeleteSpec={handleDeleteSpec}
            onAddRequirement={(specId) =>
              setReqDialog({ specId: specId || specs[0]?.id || "" })
            }
            onEditRequirement={(req) => setReqDialog(req)}
            onDeleteRequirement={handleDeleteRequirement}
            onAddLinks={(reqId, ids) =>
              runAndReplace(requirementService.addTestCases(reqId, ids))
            }
            onRemoveLink={(reqId, tcId) =>
              runAndReplace(requirementService.removeTestCase(reqId, tcId))
            }
          />
        )}
        {view === 1 && (
          <RequirementCoverageView coverage={coverage} specs={specs} />
        )}
        {view === 2 && (
          <RequirementReportView
            projectId={projectId}
            testPlans={testPlans}
            testExecutions={testExecutions}
          />
        )}
        {view === 3 && (
          <Suspense fallback={<CircularProgress size={24} />}>
            <RequirementNetworkView
              projectId={projectId}
              specs={specs}
              requirements={requirements}
              testCases={testCases}
              testPlans={testPlans}
              canEdit={canEdit}
              onAddLinks={(reqId, ids) =>
                runAndReplace(requirementService.addTestCases(reqId, ids))
              }
              onRemoveLink={(reqId, tcId) =>
                runAndReplace(requirementService.removeTestCase(reqId, tcId))
              }
            />
          </Suspense>
        )}
      </Box>

      <RequirementSpecDialog
        open={Boolean(specDialog)}
        initial={specDialog}
        specs={specs}
        onClose={() => setSpecDialog(null)}
        onSubmit={handleSaveSpec}
      />
      <RequirementDialog
        open={Boolean(reqDialog)}
        initial={reqDialog}
        specs={specs}
        onClose={() => setReqDialog(null)}
        onSubmit={handleSaveRequirement}
      />
    </Paper>
  );
}

RequirementWorkspace.propTypes = {
  projectId: PropTypes.string.isRequired,
};

export default RequirementWorkspace;
