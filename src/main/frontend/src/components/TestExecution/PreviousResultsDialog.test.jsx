import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// 컨텍스트/훅/무거운 자식 컴포넌트 모킹 — 다이얼로그 자체 노트 렌더만 검증
vi.mock("../../context/I18nContext.jsx", () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback || key }),
}));
vi.mock("../../context/AppContext.jsx", () => ({
  useAppContext: () => ({
    user: { id: 1, username: "tester", role: "ADMIN" },
    api: vi.fn(),
  }),
}));
vi.mock("../../hooks/useDateFormatter", () => ({
  useDateFormatter: () => ({ formatDate: () => "2026-06-15" }),
}));
vi.mock("../TestCase/TestResultAttachmentsView.jsx", () => ({
  default: () => null,
}));
vi.mock("./JiraIssueLink.jsx", () => ({ default: () => null }));
vi.mock("../TestResultForm.jsx", () => ({ default: () => null }));

import PreviousResultsDialog from "./PreviousResultsDialog.jsx";

const makeResult = (notes) => ({
  id: 1,
  result: "PASS",
  notes,
  testExecutionId: 10,
  testExecutionName: "exec-1",
  executedBy: "kim",
  executedAt: "2026-06-15T00:00:00Z",
});

describe("PreviousResultsDialog 노트 마크다운", () => {
  beforeEach(() => localStorage.clear());

  it("노트 마크다운 문단을 렌더링한다 (기본 markdown 뷰모드)", () => {
    render(
      <PreviousResultsDialog
        open
        results={[makeResult("문단1\n\n문단2")]}
        loading={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("문단1")).toBeInTheDocument();
    expect(screen.getByText("문단2")).toBeInTheDocument();
  });

  it("노트 마크다운 루트에 인라인 white-space:pre-wrap 을 적용하지 않는다 (공백 회귀 가드)", () => {
    render(
      <PreviousResultsDialog
        open
        results={[makeResult("문단1\n\n문단2\n\n문단3")]}
        loading={false}
        onClose={vi.fn()}
      />,
    );
    const root = document.querySelector(".wmde-markdown");
    expect(root).toBeTruthy();
    expect(root.style.whiteSpace).not.toBe("pre-wrap");
  });
});
