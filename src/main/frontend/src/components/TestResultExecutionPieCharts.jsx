// src/components/TestResultExecutionPieCharts.jsx
// 실행별(by-execution) 뷰에서 각 실행의 결과를 파이차트로 나란히 비교

import React from "react";
import { useTranslation } from "../context/I18nContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
  Chip,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from "recharts";
import { RESULT_COLORS } from "../constants/statusColors";

/**
 * 실행별 결과 파이차트 비교 컴포넌트
 * by-execution viewType에서 각 실행의 통계를 파이차트로 나란히 표시
 */
function TestResultExecutionPieCharts({ data = [], loading = false, title }) {
  const { t } = useTranslation();

  const RESULT_LABELS = {
    PASS: t("testResult.status.pass", "Pass"),
    FAIL: t("testResult.status.fail", "Fail"),
    BLOCKED: t("testResult.status.blocked", "Blocked"),
    NOT_RUN: t("testResult.status.notRun", "Not Run"),
  };

  // 파이차트 데이터 변환 (실행별 통계 → PieChart 형식)
  const buildPieData = (item) => {
    const pass = Number(item.passCount) || 0;
    const fail = Number(item.failCount) || 0;
    const blocked = Number(item.blockedCount) || 0;
    const notRun = Number(item.notRunCount) || 0;
    const total = pass + fail + blocked + notRun;

    return {
      total,
      segments: [
        {
          name: "PASS",
          label: RESULT_LABELS.PASS,
          value: pass,
          pct: total > 0 ? (pass / total) * 100 : 0,
          color: RESULT_COLORS.PASS,
        },
        {
          name: "FAIL",
          label: RESULT_LABELS.FAIL,
          value: fail,
          pct: total > 0 ? (fail / total) * 100 : 0,
          color: RESULT_COLORS.FAIL,
        },
        {
          name: "BLOCKED",
          label: RESULT_LABELS.BLOCKED,
          value: blocked,
          pct: total > 0 ? (blocked / total) * 100 : 0,
          color: RESULT_COLORS.BLOCKED,
        },
        {
          name: "NOT_RUN",
          label: RESULT_LABELS.NOT_RUN,
          value: notRun,
          pct: total > 0 ? (notRun / total) * 100 : 0,
          color: RESULT_COLORS.NOTRUN,
        },
      ].filter((s) => s.value > 0),
    };
  };

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            p: 1.5,
            boxShadow: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: d.color, mb: 0.5 }}>
            {d.label}
          </Typography>
          <Typography variant="body2">
            {t("testResult.chart.countWithPct", "{count}건 ({pct}%)", {
              count: d.value,
              pct: d.pct.toFixed(1),
            })}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // 파이 안쪽 퍼센트 레이블
  const renderLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    if (percent < 0.06) return null;
    const R = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * R);
    const y = cy + r * Math.sin(-midAngle * R);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title ||
              t(
                "testResultDashboard.chart.executionComparison",
                "실행별 결과 비교",
              )}
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title ||
              t(
                "testResultDashboard.chart.executionComparison",
                "실행별 결과 비교",
              )}
          </Typography>
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t("testResult.pieChart.noData", "데이터가 없습니다.")}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* 헤더 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography variant="h6" component="h2">
            {title ||
              t(
                "testResultDashboard.chart.executionComparison",
                "실행별 결과 비교",
              )}
          </Typography>
          <Chip
            label={t("testResultDashboard.chart.executionCount", `${data.length}개 실행`, { count: data.length })}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* 공통 범례 */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
          {[
            { label: RESULT_LABELS.PASS, color: RESULT_COLORS.PASS },
            { label: RESULT_LABELS.FAIL, color: RESULT_COLORS.FAIL },
            { label: RESULT_LABELS.BLOCKED, color: RESULT_COLORS.BLOCKED },
            { label: RESULT_LABELS.NOT_RUN, color: RESULT_COLORS.NOTRUN },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: item.color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* 실행별 파이차트 그리드 */}
        <Grid container spacing={2}>
          {data.map((item, idx) => {
            const { total, segments } = buildPieData(item);
            const successRate =
              total > 0
                ? (((Number(item.passCount) || 0) / total) * 100).toFixed(1)
                : "0.0";

            return (
              <Grid
                key={item.executionId || idx}
                size={{
                  xs: 12,
                  sm: 6,
                  md: data.length <= 2 ? 6 : data.length <= 4 ? 6 : 4,
                  lg: data.length <= 3 ? 4 : data.length <= 6 ? 4 : 3,
                }}
              >
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 1.5,
                    textAlign: "center",
                    bgcolor: "background.paper",
                    "&:hover": { boxShadow: 2, borderColor: "primary.main" },
                    transition: "box-shadow 0.2s, border-color 0.2s",
                  }}
                >
                  {/* 실행 이름 */}
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    sx={{
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      title: item.name,
                    }}
                    title={item.name}
                  >
                    {item.executionName || item.name}
                  </Typography>

                  {/* 플랜 이름 */}
                  {item.planName && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mb: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={item.planName}
                    >
                      {item.planName}
                    </Typography>
                  )}

                  {/* 파이차트 */}
                  {segments.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={segments}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={65}
                          labelLine={false}
                          label={renderLabel}
                          dataKey="value"
                        >
                          {segments.map((seg, i) => (
                            <Cell key={`cell-${i}`} fill={seg.color} />
                          ))}
                        </Pie>
                        <ReTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box
                      sx={{
                        height: 160,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="caption" color="text.disabled">
                        데이터 없음
                      </Typography>
                    </Box>
                  )}

                  {/* 요약 정보 - 0건 항목 제외 */}
                  <Box
                    sx={{
                      mt: 1,
                      pt: 1,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    {segments.map((seg) => (
                      <Box
                        key={seg.name}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          px: 0.5,
                          py: 0.2,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: seg.color, fontWeight: 500 }}
                        >
                          {seg.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("testResult.chart.countWithPct", "{count}건 ({pct}%)", {
                            count: seg.value,
                            pct: seg.pct.toFixed(1),
                          })}
                        </Typography>
                      </Box>
                    ))}
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block", mt: 0.5, textAlign: "center" }}
                    >
                      {t("testResult.chart.totalCount", "총 {count}건", {
                        count: total,
                      })}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}

export default TestResultExecutionPieCharts;
