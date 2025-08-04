// src/components/Dashboard.jsx

import React, { useState, useEffect } from "react";
import {
  Box, Typography, Paper, Grid, FormControl, InputLabel, Select, MenuItem, Chip, Tooltip
} from "@mui/material";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip as ReTooltip, Legend, LineChart, Line, ResponsiveContainer, CartesianGrid
} from "recharts";
import CountUp from "react-countup";
import { dashboardDemoData } from "../models/demoDashboardData";
import { useAppContext } from "../context/AppContext";
import TestPlanSelector from "./TestPlanSelector";
import RecentTestResults from "./RecentTestResults";

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
  // AppContext에서 필요한 데이터와 함수들
  const {
    activeProject,
    testPlans,
    testPlansLoading,
    fetchRecentTestResultsByTestPlan,
    fetchOpenTestRunAssigneeResults,
    fetchOpenTestRunAssigneeResultsByProject,
    testCases
  } = useAppContext();

  // 실제 데이터 계산
  const [realTotalCases, setRealTotalCases] = useState(0);
  const [realMemberCount, setRealMemberCount] = useState(0);
  
  // 데모 데이터 (실제 데이터 없을 때 fallback)
  const {
    totalCases: demoTotalCases,
    lastResult,
    testResultsHistory,
    openTestRunResults,
  } = dashboardDemoData;

  // 컴포넌트 상태
  const [selectedTestPlan, setSelectedTestPlan] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  // 오픈 테스트런 담당자별 결과 상태
  const [openTestRunAssigneeResults, setOpenTestRunAssigneeResults] = useState([]);
  const [assigneeResultsLoading, setAssigneeResultsLoading] = useState(false);
  const [assigneeResultsError, setAssigneeResultsError] = useState(null);

  // 테스트 플랜별 최근 결과 조회
  const fetchResults = async (testPlan) => {
    if (!testPlan) {
      setRecentResults([]);
      return;
    }

    setResultsLoading(true);
    setResultsError(null);
    
    try {
      const results = await fetchRecentTestResultsByTestPlan(testPlan.id, 20);
      setRecentResults(results);
    } catch (error) {
      console.error('Error fetching recent test results:', error);
      setResultsError(error.message);
      setRecentResults([]);
    } finally {
      setResultsLoading(false);
    }
  };

  // 오픈 테스트런 담당자별 결과 조회
  const fetchAssigneeResults = async () => {
    setAssigneeResultsLoading(true);
    setAssigneeResultsError(null);
    
    try {
      let results;
      if (activeProject && activeProject.id) {
        results = await fetchOpenTestRunAssigneeResultsByProject(activeProject.id, 10);
      } else {
        results = await fetchOpenTestRunAssigneeResults(10);
      }
      setOpenTestRunAssigneeResults(results);
    } catch (error) {
      console.error('Error fetching open test run assignee results:', error);
      setAssigneeResultsError(error.message);
      setOpenTestRunAssigneeResults([]);
    } finally {
      setAssigneeResultsLoading(false);
    }
  };

  // 테스트 플랜 변경 시 결과 조회
  useEffect(() => {
    fetchResults(selectedTestPlan);
  }, [selectedTestPlan]);

  // 활성 프로젝트 변경 시 실제 데이터 계산
  useEffect(() => {
    console.log('[Dashboard] activeProject changed:', activeProject);
    if (activeProject) {
      // 프로젝트에 testCaseCount가 있으면 사용, 없으면 testCases에서 계산
      if (activeProject.testCaseCount !== undefined) {
        console.log('[Dashboard] Using activeProject.testCaseCount:', activeProject.testCaseCount);
        setRealTotalCases(activeProject.testCaseCount);
      } else if (testCases && testCases.length > 0) {
        const projectTestCases = testCases.filter(tc => tc.projectId === activeProject.id);
        console.log('[Dashboard] Calculated from testCases:', projectTestCases.length);
        setRealTotalCases(projectTestCases.length);
      } else {
        // testCases가 아직 로딩되지 않았으면 데모 데이터 사용하되, 
        // 실제 데이터는 별도 useEffect에서 처리
        console.log('[Dashboard] TestCases not loaded yet, using demo data temporarily');
        setRealTotalCases(demoTotalCases);
      }
      
      // 프로젝트에 memberCount가 있으면 사용, 없으면 members 배열에서 계산
      if (activeProject.memberCount !== undefined) {
        console.log('[Dashboard] Using activeProject.memberCount:', activeProject.memberCount);
        setRealMemberCount(activeProject.memberCount);
      } else if (activeProject.members) {
        console.log('[Dashboard] Using activeProject.members.length:', activeProject.members.length);
        setRealMemberCount(activeProject.members.length);
      } else {
        console.log('[Dashboard] Setting memberCount to 0');
        setRealMemberCount(0);
      }
    } else {
      // 프로젝트가 없으면 전체 테스트케이스 개수 사용
      setRealTotalCases(testCases ? testCases.length : demoTotalCases);
      setRealMemberCount(0);
    }
    
    fetchAssigneeResults();
  }, [activeProject]); // testCases 의존성 제거

  // testCases 로딩 완료 시 테스트케이스 수 재계산
  useEffect(() => {
    if (activeProject && testCases && testCases.length > 0) {
      // activeProject에 testCaseCount가 없는 경우에만 testCases에서 계산
      if (activeProject.testCaseCount === undefined) {
        const projectTestCases = testCases.filter(tc => tc.projectId === activeProject.id);
        console.log('[Dashboard] TestCases loaded, recalculating count:', projectTestCases.length);
        setRealTotalCases(projectTestCases.length);
      }
    }
  }, [testCases, activeProject]);

  // 새로고침 함수
  const handleRefresh = () => {
    fetchResults(selectedTestPlan);
  };

  // 담당자별 결과 새로고침 함수
  const handleAssigneeResultsRefresh = () => {
    fetchAssigneeResults();
  };

  const lastPieData = Object.entries(lastResult).map(([k, v]) => ({
    name: RESULT_LABELS[k],
    key: k,
    value: v,
  }));

  // 실제 총 테스트케이스 개수 사용
  const totalCases = realTotalCases || demoTotalCases;
  console.log('[Dashboard] Final render values:', {
    activeProject: activeProject?.name,
    activeProjectId: activeProject?.id,
    realTotalCases,
    realMemberCount,
    totalCases,
    testCasesLength: testCases?.length,
    activeProjectTestCaseCount: activeProject?.testCaseCount,
    activeProjectMemberCount: activeProject?.memberCount,
    activeProjectMembers: activeProject?.members?.length
  });
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
      
      {/* 프로젝트 정보 요약 */}
      {activeProject && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "primary.50" }} elevation={1}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Typography variant="h6" color="primary">
                {activeProject.name}
              </Typography>
            </Grid>
            <Grid item>
              <Chip
                label={`총 테스트케이스: ${totalCases}개`}
                color="info"
                size="small"
                sx={{ mr: 1 }}
              />
            </Grid>
            <Grid item>
              <Chip
                label={`프로젝트 멤버: ${realMemberCount}명`}
                color="secondary"
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>
      )}
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
        {/* Recent Test Results by Test Plan */}
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
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                테스트 플랜별 최근 테스트 결과
              </Typography>
              {activeProject && (
                <TestPlanSelector
                  testPlans={testPlans}
                  selectedTestPlan={selectedTestPlan}
                  onTestPlanChange={setSelectedTestPlan}
                  loading={testPlansLoading}
                  size="small"
                />
              )}
              {!activeProject && (
                <Typography variant="body2" color="text.secondary">
                  프로젝트를 선택해주세요.
                </Typography>
              )}
            </Box>
            
            <RecentTestResults
              results={recentResults}
              loading={resultsLoading}
              error={resultsError}
              onRefresh={handleRefresh}
              showProjectInfo={false}
              showExecutionInfo={true}
              maxHeight={300}
            />
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
