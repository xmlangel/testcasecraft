// src/components/Dashboard.js

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend,
  LineChart,
  Line,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import CountUp from "react-countup";
import { dashboardDemoData } from "../models/demoDashboardData";

const RESULT_LABELS = {
  PASS: "성공",
  FAIL: "실패",
  BLOCKED: "차단됨",
  SKIPPED: "건너뜀",
  NOTRUN: "미실행",
};
const RESULT_COLORS = {
  PASS: "#00C49F",
  FAIL: "#FF4D4F",
  BLOCKED: "#FFBB28",
  SKIPPED: "#AAAAAA",
  NOTRUN: "#B0BEC5",
};

function Dashboard() {
  const {
    totalCases,
    lastResult,
    testResultsHistory,
    openTestRunResults,
  } = dashboardDemoData;

  const lastPieData = Object.entries(lastResult).map(([k, v]) => ({
    name: RESULT_LABELS[k],
    key: k,
    value: v,
  }));

  const completeRate = Math.round((lastResult.PASS / totalCases) * 100);
  const failRate = Math.round((lastResult.FAIL / totalCases) * 100);

  const openTestRunStacked = openTestRunResults.map((row) => ({
    assignee: row.assignee,
    ...row,
  }));

  const notRunHistory = testResultsHistory.map((row) => ({
    date: row.date,
    notRun: row.notRun,
  }));

  // 최근 업데이트 시간 예시
  const lastUpdated = testResultsHistory[testResultsHistory.length - 1]?.date;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        대시보드
        <Chip
          label={`최근 업데이트: ${lastUpdated}`}
          color="primary"
          size="small"
          sx={{ ml: 2, verticalAlign: "middle" }}
        />
      </Typography>
      <Grid container spacing={2}>
        {/* Last test case results */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              transition: "box-shadow 0.3s, transform 0.3s",
              "&:hover": { boxShadow: 6, transform: "scale(1.03)" },
            }}
            elevation={3}
          >
            <Typography variant="subtitle1" gutterBottom>
              최근 테스트케이스 결과
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PieChart width={120} height={120}>
                <Pie
                  data={lastPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={55}
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={true}
                >
                  {lastPieData.map((entry) => (
                    <Cell key={entry.key} fill={RESULT_COLORS[entry.key]} />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
              <Box sx={{ ml: 2 }}>
                <Box sx={{ display: "flex", alignItems: "baseline" }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    <CountUp end={completeRate} duration={1} />%
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    완료
                  </Typography>
                  {failRate > 0 && (
                    <Chip
                      label={`실패 ${failRate}%`}
                      color="error"
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  <CountUp end={lastResult.PASS + lastResult.FAIL + lastResult.BLOCKED + lastResult.SKIPPED} duration={1} /> / {totalCases} 완료
                </Typography>
                {lastPieData.map((d) => (
                  <Box key={d.key} sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: RESULT_COLORS[d.key], borderRadius: "50%", mr: 1 }} />
                    <Typography variant="body2" sx={{ minWidth: 60 }}>
                      <CountUp end={d.value} duration={1} /> {d.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>
        {/* Test case results (history) */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              transition: "box-shadow 0.3s, transform 0.3s",
              "&:hover": { boxShadow: 6, transform: "scale(1.03)" },
            }}
            elevation={3}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1">테스트케이스 결과 추이</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>최근 15일</InputLabel>
                <Select label="최근 15일" value="최근 15일" disabled>
                  <MenuItem value="최근 15일">최근 15일</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={testResultsHistory} isAnimationActive>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Line type="monotone" dataKey="PASS" stroke={RESULT_COLORS.PASS} name="성공" strokeWidth={2} dot={{ r: 4 }} isAnimationActive />
                <Line type="monotone" dataKey="FAIL" stroke={RESULT_COLORS.FAIL} name="실패" strokeWidth={2} dot={{ r: 4 }} isAnimationActive />
                <Line type="monotone" dataKey="BLOCKED" stroke={RESULT_COLORS.BLOCKED} name="차단됨" strokeWidth={2} dot={{ r: 4 }} isAnimationActive />
                <Line type="monotone" dataKey="NOTRUN" stroke={RESULT_COLORS.NOTRUN} name="미실행" strokeWidth={2} dot={{ r: 4 }} isAnimationActive />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Test case results in open test runs (bar) */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              transition: "box-shadow 0.3s, transform 0.3s",
              "&:hover": { boxShadow: 6, transform: "scale(1.03)" },
            }}
            elevation={3}
          >
            <Typography variant="subtitle1" gutterBottom>
              오픈 테스트런별 테스트케이스 결과
            </Typography>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={openTestRunResults} layout="vertical" isAnimationActive>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="assignee" />
                <ReTooltip />
                <Legend />
                <Bar dataKey="PASS" stackId="a" fill={RESULT_COLORS.PASS} name="성공" isAnimationActive />
                <Bar dataKey="NOTRUN" stackId="a" fill={RESULT_COLORS.NOTRUN} name="미실행" isAnimationActive />
                <Bar dataKey="FAIL" stackId="a" fill={RESULT_COLORS.FAIL} name="실패" isAnimationActive />
                <Bar dataKey="BLOCKED" stackId="a" fill={RESULT_COLORS.BLOCKED} name="차단됨" isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Test case results by assignee (stacked bar) */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              transition: "box-shadow 0.3s, transform 0.3s",
              "&:hover": { boxShadow: 6, transform: "scale(1.03)" },
            }}
            elevation={3}
          >
            <Typography variant="subtitle1" gutterBottom>
              오픈 테스트런 담당자별 테스트케이스 결과
            </Typography>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={openTestRunStacked} layout="vertical" isAnimationActive>
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="assignee" />
                <ReTooltip />
                <Legend />
                <Bar dataKey="PASS" stackId="a" fill={RESULT_COLORS.PASS} name="성공" isAnimationActive />
                <Bar dataKey="NOTRUN" stackId="a" fill={RESULT_COLORS.NOTRUN} name="미실행" isAnimationActive />
                <Bar dataKey="FAIL" stackId="a" fill={RESULT_COLORS.FAIL} name="실패" isAnimationActive />
                <Bar dataKey="BLOCKED" stackId="a" fill={RESULT_COLORS.BLOCKED} name="차단됨" isAnimationActive />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Not Run test cases in open test runs (line chart) */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              height: "100%",
              transition: "box-shadow 0.3s, transform 0.3s",
              "&:hover": { boxShadow: 6, transform: "scale(1.03)" },
            }}
            elevation={3}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1">
                오픈 테스트런 미실행 테스트케이스 추이
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>최근 15일</InputLabel>
                <Select label="최근 15일" value="최근 15일" disabled>
                  <MenuItem value="최근 15일">최근 15일</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={notRunHistory} isAnimationActive>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ReTooltip />
                <Line type="monotone" dataKey="notRun" stroke={RESULT_COLORS.NOTRUN} name="미실행" strokeWidth={2} dot={{ r: 4 }} isAnimationActive />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
