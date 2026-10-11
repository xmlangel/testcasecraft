// src/components/Requirement/RequirementReportView.jsx
//
// 요구사항 기반 리포트. 플랜(또는 실행 하나)을 고르면 요구사항마다 연결 TC 의
// 최신 결과를 모아 판정한다. 우선순위: 실패 > 차단 > 미실행 > 통과.

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useI18n } from "../../context/I18nContext.jsx";
import requirementService from "../../services/requirementService.js";
import { VERDICT_META } from "./requirementConstants.js";
import { LinkedTestCaseDialog } from "./LinkedItemDialogs.jsx";

// 요구사항 하나에 TC 가 많아도 행이 길어지지 않게 이만큼만 보이고 나머지는 「+N」으로 접는다
const CHIP_LIMIT = 5;

// 접혀 있어도 판정 이유가 보이게 판정 우선순위(실패 > 차단 > 미실행 > 통과) 순으로 칩을 놓는다
const RESULT_ORDER = { FAIL: 0, BLOCKED: 1, NOT_RUN: 2, PASS: 3 };
const byResult = (cases) =>
  [...cases].sort(
    (a, b) => (RESULT_ORDER[a.result] ?? 2) - (RESULT_ORDER[b.result] ?? 2),
  );

function RequirementReportView({ projectId, testPlans, testExecutions }) {
  const { t } = useI18n();
  const [testPlanId, setTestPlanId] = useState("");
  const [executionId, setExecutionId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [openCase, setOpenCase] = useState(null);

  const planExecutions = testExecutions.filter(
    (ex) => ex.testPlanId === testPlanId,
  );

  useEffect(() => {
    if (!testPlanId) {
      setReport(null);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    requirementService
      .getReport(projectId, {
        testPlanId,
        executionId: executionId || undefined,
      })
      .then((data) => !cancelled && setReport(data))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [projectId, testPlanId, executionId]);

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label={t("requirement.report.plan", "테스트플랜")}
          value={testPlanId}
          onChange={(e) => {
            setTestPlanId(e.target.value);
            setExecutionId("");
          }}
          sx={{ minWidth: 260 }}
          inputProps={{ "data-testid": "report-plan-select" }}
        >
          {testPlans.map((plan) => (
            <MenuItem key={plan.id} value={plan.id}>
              {plan.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label={t("requirement.report.execution", "테스트실행")}
          value={executionId}
          onChange={(e) => setExecutionId(e.target.value)}
          disabled={!testPlanId}
          sx={{ minWidth: 260 }}
        >
          <MenuItem value="">
            {t("requirement.report.latestAll", "플랜 전체 (TC별 최신 결과)")}
          </MenuItem>
          {planExecutions.map((ex) => (
            <MenuItem key={ex.id} value={ex.id}>
              {ex.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {!testPlanId && (
        <Typography variant="body2" color="text.secondary">
          {t(
            "requirement.report.pickPlan",
            "리포트를 볼 테스트플랜을 고르세요.",
          )}
        </Typography>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {loading && <CircularProgress size={24} />}

      {report && !loading && (
        <>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, flexWrap: "wrap" }}
            data-testid="report-summary"
          >
            {Object.entries(VERDICT_META).map(([key, meta]) => (
              <Chip
                key={key}
                color={meta.color}
                variant={key === "NOT_IN_PLAN" ? "outlined" : "filled"}
                label={`${t(meta.i18nKey, meta.label)} ${report.counts?.[key] ?? 0}`}
              />
            ))}
          </Stack>
          <Paper variant="outlined">
            <Table size="small" data-testid="report-table">
              <TableHead>
                <TableRow>
                  <TableCell>
                    {t("requirement.field.docId", "요구사항 ID")}
                  </TableCell>
                  <TableCell>{t("requirement.field.title", "제목")}</TableCell>
                  <TableCell>
                    {t("requirement.report.verdict", "판정")}
                  </TableCell>
                  <TableCell>
                    {t("requirement.report.cases", "테스트케이스 결과")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.items.map((item) => {
                  const meta = VERDICT_META[item.verdict];
                  return (
                    <TableRow key={item.requirementId}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.docId}
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={meta.color}
                          label={t(meta.i18nKey, meta.label)}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{ flexWrap: "wrap", rowGap: 0.5 }}
                        >
                          {(expanded[item.requirementId]
                            ? byResult(item.testCases)
                            : byResult(item.testCases).slice(0, CHIP_LIMIT)
                          ).map((tc) => {
                            const caseMeta =
                              VERDICT_META[tc.result] || VERDICT_META.NOT_RUN;
                            return (
                              <Chip
                                key={tc.testCaseId}
                                size="small"
                                variant="outlined"
                                color={caseMeta.color}
                                label={`${tc.displayId || ""} ${tc.name || tc.testCaseId}`.trim()}
                                onClick={() =>
                                  setOpenCase({ item, id: tc.testCaseId })
                                }
                                data-testid="report-case-chip"
                              />
                            );
                          })}
                          {item.testCases.length > CHIP_LIMIT && (
                            <Chip
                              size="small"
                              label={
                                expanded[item.requirementId]
                                  ? t("requirement.collapse", "접기")
                                  : `+${item.testCases.length - CHIP_LIMIT}`
                              }
                              onClick={() =>
                                setExpanded((prev) => ({
                                  ...prev,
                                  [item.requirementId]:
                                    !prev[item.requirementId],
                                }))
                              }
                              data-testid="report-case-more"
                            />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
      <LinkedTestCaseDialog
        testCaseIds={
          openCase ? openCase.item.testCases.map((tc) => tc.testCaseId) : []
        }
        initialId={openCase?.id || null}
        testCases={
          openCase
            ? openCase.item.testCases.map((tc) => ({
                id: tc.testCaseId,
                displayId: tc.displayId,
                name: tc.name,
              }))
            : []
        }
        resultById={
          openCase
            ? Object.fromEntries(
                openCase.item.testCases.map((tc) => [tc.testCaseId, tc.result]),
              )
            : null
        }
        projectId={projectId}
        onClose={() => setOpenCase(null)}
      />
    </Box>
  );
}

RequirementReportView.propTypes = {
  projectId: PropTypes.string.isRequired,
  testPlans: PropTypes.array.isRequired,
  testExecutions: PropTypes.array.isRequired,
};

export default RequirementReportView;
