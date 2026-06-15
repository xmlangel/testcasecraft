import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// 컨텍스트/훅 모킹 — 패널 자체 렌더만 검증
vi.mock("../../context/I18nContext.jsx", () => ({
  useTranslation: () => ({ t: (key, fallback) => fallback || key }),
}));
vi.mock("../../hooks/useDateFormatter", () => ({
  useDateFormatter: () => ({ formatDate: () => "2026-06-15" }),
}));

import ExecutionQaSummaryPanel from "./ExecutionQaSummaryPanel.jsx";

describe("ExecutionQaSummaryPanel (QA 총평)", () => {
  it("실행이 없으면 아무것도 렌더링하지 않는다", () => {
    const { container } = render(
      <ExecutionQaSummaryPanel execution={null} onSave={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("QA 총평 제목과 마크다운 내용을 렌더링한다", () => {
    render(
      <ExecutionQaSummaryPanel
        execution={{
          id: 1,
          name: "ahm-aep17",
          qaSummary: "첫째 문단\n\n둘째 문단",
        }}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByText("QA 총평")).toBeInTheDocument();
    expect(screen.getByText("첫째 문단")).toBeInTheDocument();
    expect(screen.getByText("둘째 문단")).toBeInTheDocument();
  });

  it("총평 마크다운 루트에 인라인 white-space:pre-wrap 을 적용하지 않는다 (공백 회귀 가드)", () => {
    const { container } = render(
      <ExecutionQaSummaryPanel
        execution={{ id: 1, name: "exec", qaSummary: "문단1\n\n문단2\n\n문단3" }}
        onSave={vi.fn()}
      />,
    );
    const root = container.querySelector(".wmde-markdown");
    expect(root).toBeTruthy();
    expect(root.style.whiteSpace).not.toBe("pre-wrap");
  });

  it("총평이 비어 있으면 안내 문구를 보여준다", () => {
    render(
      <ExecutionQaSummaryPanel
        execution={{ id: 1, name: "exec", qaSummary: "" }}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByText(/아직 작성된 QA 총평이 없습니다/)).toBeInTheDocument();
  });
});
