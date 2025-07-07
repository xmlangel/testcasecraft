// src/models/demoDashboardData.js

// 차트에 필요한 더미 데이터
export const dashboardDemoData = {
  totalCases: 35,
  lastResult: {
    PASS: 26,
    FAIL: 2,
    BLOCKED: 0,
    SKIPPED: 0,
    NOTRUN: 7,
  },
  testResultsHistory: [
    {
      date: "4/29/2025",
      PASS: 10,
      FAIL: 2,
      BLOCKED: 0,
      SKIPPED: 0,
      NOTRUN: 23,
      completeRate: 34,
      notRun: 23,
    },
    {
      date: "4/30/2025",
      PASS: 15,
      FAIL: 2,
      BLOCKED: 0,
      SKIPPED: 0,
      NOTRUN: 18,
      completeRate: 49,
      notRun: 18,
    },
    {
      date: "5/2/2025",
      PASS: 20,
      FAIL: 2,
      BLOCKED: 0,
      SKIPPED: 0,
      NOTRUN: 13,
      completeRate: 63,
      notRun: 13,
    },
    {
      date: "5/7/2025",
      PASS: 24,
      FAIL: 2,
      BLOCKED: 1,
      SKIPPED: 0,
      NOTRUN: 8,
      completeRate: 77,
      notRun: 8,
    },
    {
      date: "5/13/2025",
      PASS: 26,
      FAIL: 2,
      BLOCKED: 0,
      SKIPPED: 0,
      NOTRUN: 7,
      completeRate: 80,
      notRun: 7,
    },
  ],
  openTestRunResults: [
    { assignee: "kwangmyung kim", PASS: 24, FAIL: 2, BLOCKED: 1, NOTRUN: 8 },
    { assignee: "<not assigned>", PASS: 2, FAIL: 0, BLOCKED: 0, NOTRUN: 2 },
  ],
};
