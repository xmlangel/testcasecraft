import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

// 컨텍스트/서비스 모킹 — generateTemplate 이 만든 description 본문만 검증
// vi.mock 은 호이스팅되므로 mock 함수는 vi.hoisted 로 선언한다.
const { getConnectionStatus, getProjects, getIssueTypes } = vi.hoisted(() => ({
  getConnectionStatus: vi.fn(),
  getProjects: vi.fn(),
  getIssueTypes: vi.fn(),
}));
vi.mock("../../context/I18nContext", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));
vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1" } }),
}));
vi.mock("../../context/JiraContext", () => ({
  useJira: () => ({ jiraServerUrl: "" }),
}));
vi.mock("../../services/jiraService", () => ({
  default: { getConnectionStatus, getProjects, getIssueTypes },
}));

import JiraIssueCreationDialog from "./JiraIssueCreationDialog.jsx";

const baseTestCase = {
  name: "[파일 추가] 추가된 파일 갯수 반영",
  preCondition: "AI 리소스 > 비정형 데이터 > 파일 저장소 진입",
  expectedResults: "전체 예상 결과 요약",
  steps: [
    {
      stepNumber: 1,
      description: "파일 저장소 상세보기 진입",
      expectedResult: "파일 목록 노출",
    },
    {
      stepNumber: 2,
      description: "파일 추가",
      expectedResult: "추가된 개수가 목록에 반영",
    },
  ],
};
const testResult = { notes: "저장된 파일에 대해 개수가 목록에 반영 및 노출" };

// MUI Dialog 은 Portal 로 document.body 에 렌더되므로 container 가 아닌 document 에서 찾는다.
const getDescription = () =>
  document.querySelector('textarea[name="description"]');

describe("JiraIssueCreationDialog generateTemplate 본문", () => {
  beforeEach(() => {
    getConnectionStatus.mockResolvedValue({});
    getProjects.mockResolvedValue([]);
    getIssueTypes.mockResolvedValue([]);
  });

  it("테스트 단계와 단계별 예상 결과를 본문에 포함한다", async () => {
    render(
      <JiraIssueCreationDialog
        open
        onClose={vi.fn()}
        testCase={baseTestCase}
        testResult={testResult}
        projectId="p1"
      />,
    );

    const description = getDescription();
    expect(description).toBeTruthy();

    // generateTemplate 은 useEffect → setState 라 상태 반영을 기다린다
    await waitFor(() => expect(description.value).toContain("### 테스트 단계"));

    // 각 단계 번호·동작·예상 결과가 모두 들어가야 한다
    expect(description.value).toContain("1. 파일 저장소 상세보기 진입");
    expect(description.value).toContain("- 예상 결과: 파일 목록 노출");
    expect(description.value).toContain("2. 파일 추가");
    expect(description.value).toContain(
      "- 예상 결과: 추가된 개수가 목록에 반영",
    );

    // 테스트 단계 섹션은 실제 결과 섹션보다 앞에 위치한다
    expect(description.value.indexOf("### 테스트 단계")).toBeLessThan(
      description.value.indexOf("### 실제 결과"),
    );
  });

  it("steps 가 없으면 테스트 단계 섹션을 만들지 않는다", async () => {
    render(
      <JiraIssueCreationDialog
        open
        onClose={vi.fn()}
        testCase={{ ...baseTestCase, steps: [] }}
        testResult={testResult}
        projectId="p1"
      />,
    );

    const description = getDescription();
    await waitFor(() => expect(description.value).toContain("### 실제 결과"));
    expect(description.value).not.toContain("### 테스트 단계");
  });

  it("동작·예상 결과가 모두 빈 단계는 번호만 남기지 않고 건너뛴다", async () => {
    const steps = [
      { stepNumber: 1, description: "파일 추가", expectedResult: "개수 반영" },
      { stepNumber: 2, description: "", expectedResult: "" }, // 빈 단계 → 건너뜀
    ];
    render(
      <JiraIssueCreationDialog
        open
        onClose={vi.fn()}
        testCase={{ ...baseTestCase, steps }}
        testResult={testResult}
        projectId="p1"
      />,
    );

    const description = getDescription();
    await waitFor(() => expect(description.value).toContain("### 테스트 단계"));
    expect(description.value).toContain("1. 파일 추가");
    // 빈 2번 단계는 "2. " 빈 줄로 출력되지 않아야 한다
    expect(description.value).not.toMatch(/^2\.\s*$/m);
  });
});
