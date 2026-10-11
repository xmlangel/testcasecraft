// src/components/Requirement/RequirementNetworkView.jsx
//
// 요구사항 탭의 「관계도」. 네트워크 분석(SNA) 방식으로 요구사항·TC 를 본다.
// 왼쪽: 보기 설정과 그래프, 아래에 범례 / 오른쪽: 고립 요구사항 목록 또는 고른 요구사항 상세.

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { CenterFocusStrong as FitIcon } from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import requirementService from "../../services/requirementService.js";
import { getAllChildIds } from "../../utils/treeUtils.jsx";
import { buildRequirementNetwork } from "./requirementNetwork.js";
import RequirementNetworkCanvas from "./RequirementNetworkCanvas.jsx";
import RequirementLinkPanel from "./RequirementLinkPanel.jsx";
import { LinkedTestCaseDialog } from "./LinkedItemDialogs.jsx";
import { COVERAGE_META, flattenSpecTree } from "./requirementConstants.js";

function RequirementNetworkView({
  projectId,
  specs,
  requirements,
  testCases,
  testPlans,
  canEdit,
  onAddLinks,
  onRemoveLink,
}) {
  const { t } = useI18n();
  const [relations, setRelations] = useState([]);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("network");
  const [showTestCases, setShowTestCases] = useState(true);
  const [sizeBy, setSizeBy] = useState("degree");
  const [hops, setHops] = useState(1);
  const [specId, setSpecId] = useState("");
  const [planId, setPlanId] = useState("");
  const [resultById, setResultById] = useState(null);
  const [selected, setSelected] = useState(null);
  const [fitSignal, setFitSignal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    requirementService
      .getProjectRelations(projectId)
      .then((data) => !cancelled && setRelations(data))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [projectId, requirements]);

  // 플랜을 고르면 리포트의 TC 별 최신 결과로 TC 노드 색을 칠한다
  useEffect(() => {
    if (!planId) {
      setResultById(null);
      return undefined;
    }
    let cancelled = false;
    requirementService
      .getReport(projectId, { testPlanId: planId })
      .then((report) => {
        if (cancelled) return;
        const map = {};
        report.items.forEach((item) =>
          item.testCases.forEach((tc) => {
            map[tc.testCaseId] = tc.result;
          }),
        );
        setResultById(map);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [projectId, planId]);

  const requirementFilter = useMemo(() => {
    if (!specId) return null;
    const specIds = new Set([specId, ...getAllChildIds(specs, specId)]);
    return new Set(
      requirements.filter((r) => specIds.has(r.specId)).map((r) => r.id),
    );
  }, [specId, specs, requirements]);

  const network = useMemo(
    () =>
      buildRequirementNetwork({
        requirements,
        relations,
        testCases,
        mode,
        showTestCases,
        requirementFilter,
        resultById,
      }),
    [
      requirements,
      relations,
      testCases,
      mode,
      showTestCases,
      requirementFilter,
      resultById,
    ],
  );

  const selectedRequirement =
    selected?.type === "requirement"
      ? requirements.find((r) => r.id === selected.id)
      : null;
  const legendItems = [
    ...Object.entries(COVERAGE_META).map(([key, meta]) => ({
      key,
      label: t(meta.i18nKey, meta.label),
      color: meta.color,
    })),
  ];

  return (
    <Box
      sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
      data-testid="requirement-network"
    >
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ mb: 1.5, flexWrap: "wrap", rowGap: 1 }}
          alignItems="center"
        >
          <ToggleButtonGroup
            size="small"
            exclusive
            value={mode}
            onChange={(_, v) => v && setMode(v)}
          >
            <ToggleButton value="network" data-testid="network-mode-network">
              {t("requirement.network.mode.network", "요구사항·TC 네트워크")}
            </ToggleButton>
            <ToggleButton value="shared" data-testid="network-mode-shared">
              {t("requirement.network.mode.shared", "TC 공유 네트워크")}
            </ToggleButton>
          </ToggleButtonGroup>
          {mode === "network" && (
            <FormControlLabel
              control={
                <Switch
                  checked={showTestCases}
                  onChange={(e) => setShowTestCases(e.target.checked)}
                />
              }
              label={t("requirement.network.showTestCases", "TC 노드 표시")}
            />
          )}
          <TextField
            select
            size="small"
            label={t("requirement.network.sizeBy", "노드 크기")}
            value={sizeBy}
            onChange={(e) => setSizeBy(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="degree">
              {t("requirement.network.degree", "연결 수")}
            </MenuItem>
            <MenuItem value="betweenness">
              {t("requirement.network.betweenness", "매개 중심성")}
            </MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label={t("requirement.network.hops", "강조 범위")}
            value={hops}
            onChange={(e) => setHops(Number(e.target.value))}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value={1}>
              {t("requirement.network.hop1", "1단계 이웃")}
            </MenuItem>
            <MenuItem value={2}>
              {t("requirement.network.hop2", "2단계 이웃")}
            </MenuItem>
          </TextField>
          <TextField
            select
            size="small"
            label={t("requirement.field.spec", "요구사항 문서")}
            value={specId}
            onChange={(e) => setSpecId(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">{t("requirement.spec.all", "전체")}</MenuItem>
            {flattenSpecTree(specs).map(({ spec, depth }) => (
              <MenuItem
                key={spec.id}
                value={spec.id}
                sx={{ pl: 2 + depth * 2 }}
              >
                {spec.docId} · {spec.title}
              </MenuItem>
            ))}
          </TextField>
          {mode === "network" && showTestCases && (
            <TextField
              select
              size="small"
              label={t("requirement.network.resultPlan", "TC 결과 색(플랜)")}
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">
                {t("requirement.network.noResult", "표시 안 함")}
              </MenuItem>
              {testPlans.map((plan) => (
                <MenuItem key={plan.id} value={plan.id}>
                  {plan.name}
                </MenuItem>
              ))}
            </TextField>
          )}
          <Button
            size="small"
            startIcon={<FitIcon />}
            onClick={() => setFitSignal((n) => n + 1)}
          >
            {t("requirement.network.fit", "화면 맞춤")}
          </Button>
        </Stack>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}
        <Paper variant="outlined" sx={{ p: 1 }}>
          {network.nodes.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ p: 4, textAlign: "center" }}
            >
              {t(
                "requirement.network.empty",
                "선으로 이어진 요구사항이 없습니다. TC 를 연결하거나 관계를 걸면 여기에 나타납니다.",
              )}
            </Typography>
          ) : (
            <RequirementNetworkCanvas
              network={network}
              sizeBy={sizeBy}
              hops={hops}
              onSelect={setSelected}
              fitSignal={fitSignal}
            />
          )}
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 1, flexWrap: "wrap", rowGap: 0.5 }}
            data-testid="network-legend"
          >
            {legendItems.map((item) => (
              <Chip
                key={item.key}
                size="small"
                color={item.color}
                label={item.label}
              />
            ))}
            {mode === "network" && showTestCases && (
              <Chip
                size="small"
                variant="outlined"
                label={t(
                  "requirement.network.legend.testcase",
                  "■ 테스트케이스",
                )}
              />
            )}
            {mode === "network" ? (
              <>
                <Chip
                  size="small"
                  variant="outlined"
                  label={`→ ${t("requirement.relation.child", "하위 요구사항")}`}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`⇢ ${t("requirement.relation.dependsOn", "의존 대상")}`}
                />
                <Chip
                  size="small"
                  variant="outlined"
                  label={`··· ${t("requirement.relation.related", "관련")}`}
                />
              </>
            ) : (
              <Chip
                size="small"
                variant="outlined"
                label={t(
                  "requirement.network.legend.shared",
                  "선 두께·숫자 = 함께 쓰는 TC 수",
                )}
              />
            )}
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ width: 380, flexShrink: 0 }}>
        {selectedRequirement ? (
          <RequirementLinkPanel
            requirement={selectedRequirement}
            testCases={testCases}
            canEdit={canEdit}
            requirements={requirements}
            onSelectRequirement={(id) =>
              setSelected({ type: "requirement", id })
            }
            onAdd={(ids) => onAddLinks(selectedRequirement.id, ids)}
            onRemove={(tcId) => onRemoveLink(selectedRequirement.id, tcId)}
          />
        ) : (
          <Paper
            variant="outlined"
            sx={{ p: 2 }}
            data-testid="network-isolated"
          >
            <Typography variant="subtitle2">
              {t("requirement.network.isolated", "고립된 요구사항")} (
              {network.isolated.length})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {mode === "shared"
                ? t(
                    "requirement.network.isolatedSharedHint",
                    "다른 요구사항과 함께 쓰는 TC 가 없는 요구사항입니다.",
                  )
                : t(
                    "requirement.network.isolatedHint",
                    "TC 도 관계도 없는 요구사항입니다. 노드를 누르면 여기에 상세가 열립니다.",
                  )}
            </Typography>
            <List dense sx={{ maxHeight: 520, overflowY: "auto" }}>
              {network.isolated.map((r) => (
                <ListItemButton
                  key={r.id}
                  onClick={() => setSelected({ type: "requirement", id: r.id })}
                >
                  <ListItemText
                    primary={`${r.docId} · ${r.title}`}
                    primaryTypographyProps={{ noWrap: true }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      <LinkedTestCaseDialog
        testCaseIds={selected?.type === "testcase" ? [selected.id] : []}
        initialId={selected?.type === "testcase" ? selected.id : null}
        testCases={testCases}
        resultById={resultById}
        projectId={projectId}
        onClose={() => setSelected(null)}
      />
    </Box>
  );
}

RequirementNetworkView.propTypes = {
  projectId: PropTypes.string.isRequired,
  specs: PropTypes.array.isRequired,
  requirements: PropTypes.array.isRequired,
  testCases: PropTypes.array.isRequired,
  testPlans: PropTypes.array.isRequired,
  canEdit: PropTypes.bool.isRequired,
  onAddLinks: PropTypes.func.isRequired,
  onRemoveLink: PropTypes.func.isRequired,
};

export default RequirementNetworkView;
