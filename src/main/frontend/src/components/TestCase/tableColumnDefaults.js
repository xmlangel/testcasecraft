// src/components/TestCase/tableColumnDefaults.js
//
// 테스트 결과 테이블의 기본 컬럼 표시/순서 설정 (순수). TestResultDetailTable 에서 추출.

export const getDefaultColumnVisibility = () => ({
  folder: true,
  displayId: false,
  testCase: true,
  description: false,
  result: true,
  executedDate: true,
  executor: true,
  notes: true,
  attachments: true, // ICT-362: 첨부파일 컬럼 (기본 표시)
  jiraId: true,
  jiraStatus: true, // JIRA 상태 체크 후 결과 확인을 위해 기본 표시
  preCondition: false, // ICT-275: 사전설정 컬럼 (기본 숨김)
  postCondition: false,
  expectedResults: false, // ICT-275: 전체 예상결과 컬럼 (기본 숨김)
  steps: false, // ICT-275: 스텝 컬럼 (기본 숨김)
  isAutomated: false,
  executionType: false,
  testTechnique: false,
  priority: false,
  tags: false,
  linkedDocuments: false,
});

// ICT-275: 기본 컬럼 순서 정의 (컴포넌트 외부로 이동)
export const getDefaultColumnOrder = () => [
  "folder",
  "displayId",
  "testCase",
  "description",
  "result",
  "preCondition",
  "postCondition",
  "steps",
  "expectedResults",
  "isAutomated",
  "executionType",
  "testTechnique",
  "priority",
  "tags",
  "executor",
  "notes",
  "attachments", // ICT-362: 첨부파일 컬럼
  "linkedDocuments",
  "jiraId",
  "executedDate",
  "jiraStatus",
];
