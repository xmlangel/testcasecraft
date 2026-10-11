// src/components/Requirement/RequirementCoverageView.jsx
//
// 커버리지 분석: 요구사항마다 연결 TC 수를 필요 TC 수와 비교한다.
// NOT_TESTABLE·OBSOLETE 는 분모에서 뺀다(서버 RequirementVerdicts.coverage).

import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useI18n } from "../../context/I18nContext.jsx";
import {
  COVERAGE_META,
  REQUIREMENT_STATUSES,
  findLabel,
} from "./requirementConstants.js";
import RequirementCoverageCharts from "./RequirementCoverageCharts.jsx";

const Stat = ({ label, value, testId }) => (
  <Paper
    variant="outlined"
    sx={{ px: 2, py: 1, minWidth: 120 }}
    data-testid={testId}
  >
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6">{value}</Typography>
  </Paper>
);

Stat.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  testId: PropTypes.string,
};

function RequirementCoverageView({ coverage, specs = [] }) {
  const { t } = useI18n();
  const [gapsOnly, setGapsOnly] = useState(false);

  if (!coverage) return null;
  const items = gapsOnly
    ? coverage.items.filter(
        (item) => item.coverage === "UNCOVERED" || item.coverage === "PARTIAL",
      )
    : coverage.items;

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ mb: 2, flexWrap: "wrap" }}>
        <Stat
          label={t("requirement.coverage.rate", "커버리지")}
          value={`${coverage.coverageRate}%`}
          testId="coverage-rate"
        />
        <Stat
          label={t("requirement.coverage.testable", "대상 요구사항")}
          value={coverage.testable}
        />
        <Stat
          label={t(COVERAGE_META.COVERED.i18nKey, COVERAGE_META.COVERED.label)}
          value={coverage.covered}
        />
        <Stat
          label={t(COVERAGE_META.PARTIAL.i18nKey, COVERAGE_META.PARTIAL.label)}
          value={coverage.partial}
        />
        <Stat
          label={t(
            COVERAGE_META.UNCOVERED.i18nKey,
            COVERAGE_META.UNCOVERED.label,
          )}
          value={coverage.uncovered}
        />
        <Stat
          label={t(
            COVERAGE_META.EXCLUDED.i18nKey,
            COVERAGE_META.EXCLUDED.label,
          )}
          value={coverage.total - coverage.testable}
        />
      </Stack>
      <RequirementCoverageCharts coverage={coverage} specs={specs} />
      <FormControlLabel
        control={
          <Switch
            checked={gapsOnly}
            onChange={(e) => setGapsOnly(e.target.checked)}
          />
        }
        label={t("requirement.coverage.gapsOnly", "미연결·부분만 보기")}
      />
      <Paper variant="outlined">
        <Table size="small" data-testid="coverage-table">
          <TableHead>
            <TableRow>
              <TableCell>
                {t("requirement.field.docId", "요구사항 ID")}
              </TableCell>
              <TableCell>{t("requirement.field.title", "제목")}</TableCell>
              <TableCell>{t("requirement.field.status", "상태")}</TableCell>
              <TableCell align="center">
                {t("requirement.field.linked", "연결 TC")}
              </TableCell>
              <TableCell>
                {t("requirement.field.coverage", "커버리지")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const meta = COVERAGE_META[item.coverage];
              return (
                <TableRow key={item.requirementId}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {item.docId}
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    {findLabel(REQUIREMENT_STATUSES, item.status, t)}
                  </TableCell>
                  <TableCell align="center">
                    {item.linkedCount}/{item.expectedCoverage}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={meta.color}
                      label={t(meta.i18nKey, meta.label)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    {t("requirement.empty", "요구사항이 없습니다.")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

RequirementCoverageView.propTypes = {
  coverage: PropTypes.object,
  specs: PropTypes.array,
};

export default RequirementCoverageView;
