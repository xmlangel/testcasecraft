import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// 컨텍스트/훅/서비스/자식 컴포넌트 모킹 — 다이얼로그 자체 노트 렌더만 검증
// vi.mock 은 호이스팅되므로 mock 함수는 vi.hoisted 로 선언한다.
const { getAllTestResultsByIssue } = vi.hoisted(() => ({
  getAllTestResultsByIssue: vi.fn(),
}));
vi.mock("../../context/I18nContext.jsx", () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback || key }),
}));
vi.mock("../../context/AppContext.jsx", () => ({
  useAppContext: () => ({ jiraServerUrl: "" }),
}));
vi.mock("../../hooks/useDateFormatter", () => ({
  useDateFormatter: () => ({ formatDate: () => "2026-06-15" }),
}));
vi.mock("../TestCase/TestResultAttachmentsView.jsx", () => ({
  default: () => null,
}));
vi.mock("../../services/jiraService", () => ({
  jiraService: { getAllTestResultsByIssue },
}));

import JiraHistoryDialog from "./JiraHistoryDialog.jsx";

const makeResult = (notes) => ({
  id: 1,
  result: "PASS",
  notes,
  executedBy: "kim",
  executedAt: "2026-06-15T00:00:00Z",
});

describe("JiraHistoryDialog 노트 마크다운", () => {
  beforeEach(() => {
    getAllTestResultsByIssue.mockReset();
  });

  it("이슈 이력의 노트 마크다운 문단을 렌더링한다", async () => {
    getAllTestResultsByIssue.mockResolvedValue([makeResult("문단1\n\n문단2")]);
    render(<JiraHistoryDialog open jiraIssueKey="AS-1" onClose={vi.fn()} />);
    // fetchHistory 는 비동기 — 결과 렌더를 기다린다
    expect(await screen.findByText("문단1")).toBeInTheDocument();
    expect(screen.getByText("문단2")).toBeInTheDocument();
  });

  it("노트 마크다운 루트에 인라인 white-space:pre-wrap 을 적용하지 않는다 (공백 회귀 가드)", async () => {
    getAllTestResultsByIssue.mockResolvedValue([
      makeResult("문단1\n\n문단2\n\n문단3"),
    ]);
    render(<JiraHistoryDialog open jiraIssueKey="AS-1" onClose={vi.fn()} />);
    await screen.findByText("문단1");
    const root = document.querySelector(".wmde-markdown");
    expect(root).toBeTruthy();
    expect(root.style.whiteSpace).not.toBe("pre-wrap");
  });
});
