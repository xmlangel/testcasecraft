// src/components/Requirement/RequirementCoverageCharts.jsx
//
// 커버리지 시각화 두 가지.
//   왼쪽: 전체 요구사항의 커버리지 분포(도넛, 가운데에 커버리지 %)
//   오른쪽: 요구사항 문서별 분포(가로 누적 막대) — 어느 문서에 빈 곳이 몰렸는지 본다
// 범례는 기본이 이름순이라 itemSorter={null} 로 데이터 순서(충족 → 부분 → 미연결 → 제외)를 지킨다.
// 색은 표의 칩과 같은 MUI 팔레트(success·warning·error·grey)를 써서 표와 그래프가 같은 뜻으로 읽히게 한다.

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Box, Paper, Typography, useTheme } from "@mui/material";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "../../context/I18nContext.jsx";
import { COVERAGE_META, flattenSpecTree } from "./requirementConstants.js";

const KEYS = ["COVERED", "PARTIAL", "UNCOVERED", "EXCLUDED"];

function RequirementCoverageCharts({ coverage, specs }) {
  const { t } = useI18n();
  const theme = useTheme();

  const colors = {
    COVERED: theme.palette.success.main,
    PARTIAL: theme.palette.warning.main,
    UNCOVERED: theme.palette.error.main,
    EXCLUDED: theme.palette.grey[400],
  };
  const labelOf = (key) =>
    t(COVERAGE_META[key].i18nKey, COVERAGE_META[key].label);

  const donut = KEYS.map((key) => ({
    key,
    name: labelOf(key),
    value: coverage.items.filter((item) => item.coverage === key).length,
  })).filter((d) => d.value > 0);

  // 문서 트리 순서대로, 요구사항이 하나라도 있는 문서만
  const bars = useMemo(() => {
    const counts = new Map();
    coverage.items.forEach((item) => {
      const row = counts.get(item.specId) || {
        COVERED: 0,
        PARTIAL: 0,
        UNCOVERED: 0,
        EXCLUDED: 0,
      };
      row[item.coverage] += 1;
      counts.set(item.specId, row);
    });
    return flattenSpecTree(specs)
      .filter(({ spec }) => counts.has(spec.id))
      .map(({ spec }) => ({
        name: `${spec.docId} · ${spec.title}`,
        ...counts.get(spec.id),
      }));
  }, [coverage.items, specs]);

  if (coverage.items.length === 0) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
        gap: 2,
        mb: 2,
      }}
      data-testid="coverage-charts"
    >
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2">
          {t("requirement.coverage.chart.overall", "전체 커버리지")}
        </Typography>
        <Box
          sx={{ position: "relative", height: 240 }}
          data-testid="coverage-donut"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donut}
                dataKey="value"
                nameKey="name"
                innerRadius={62}
                outerRadius={92}
                paddingAngle={1}
              >
                {donut.map((d) => (
                  <Cell key={d.key} fill={colors[d.key]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={28} itemSorter={null} />
            </PieChart>
          </ResponsiveContainer>
          {/* 도넛 가운데: 테스트 대상 중 충족 비율(제외는 분모에서 빠진다) */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 28,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <Typography variant="h5">{coverage.coverageRate}%</Typography>
            <Typography variant="caption" color="text.secondary">
              {coverage.covered}/{coverage.testable}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, minWidth: 0 }}>
        <Typography variant="subtitle2">
          {t("requirement.coverage.chart.bySpec", "요구사항 문서별 커버리지")}
        </Typography>
        <Box
          sx={{ height: Math.max(200, bars.length * 44 + 60) }}
          data-testid="coverage-by-spec"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bars}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
            >
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={200}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend itemSorter={null} />
              {KEYS.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={labelOf(key)}
                  stackId="coverage"
                  fill={colors[key]}
                  barSize={22}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
}

RequirementCoverageCharts.propTypes = {
  coverage: PropTypes.object.isRequired,
  specs: PropTypes.array.isRequired,
};

export default RequirementCoverageCharts;
