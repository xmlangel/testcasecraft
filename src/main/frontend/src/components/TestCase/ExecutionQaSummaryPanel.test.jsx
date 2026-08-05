import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

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
        execution={{
          id: 1,
          name: "exec",
          qaSummary: "문단1\n\n문단2\n\n문단3",
        }}
        onSave={vi.fn()}
      />,
    );
    const root = container.querySelector(".wmde-markdown");
    expect(root).toBeTruthy();
    expect(root.style.whiteSpace).not.toBe("pre-wrap");
  });

  it("제목이 있으면 구간마다 레벨 표시와 부분 수정 버튼을 보여준다", () => {
    render(
      <ExecutionQaSummaryPanel
        execution={{
          id: 1,
          name: "exec",
          qaSummary: "# 총평\n안정적.\n\n## 실패 분석\n- FAIL 3건",
        }}
        onSave={vi.fn()}
      />,
    );
    expect(screen.getByTestId("qa-summary-sections")).toBeInTheDocument();
    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("##")).toBeInTheDocument();
    expect(screen.getAllByText("이 부분 수정")).toHaveLength(2);
    expect(screen.getByText("전체 수정")).toBeInTheDocument();
  });

  it("구간 수정 버튼은 그 구간 내용만 편집기에 올린다", () => {
    render(
      <ExecutionQaSummaryPanel
        execution={{
          id: 1,
          name: "exec",
          qaSummary: "# 총평\n안정적.\n\n## 실패 분석\n- FAIL 3건",
        }}
        onSave={vi.fn()}
      />,
    );
    fireEvent.click(screen.getAllByText("이 부분 수정")[1]);
    const editor = screen.getByTestId("qa-summary-section-editor");
    expect(editor.value).toBe("## 실패 분석\n- FAIL 3건");
    expect(editor.value).not.toContain("# 총평");
  });

  it("구간을 저장하면 나머지 구간이 보존된 전체 마크다운을 넘긴다", async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    render(
      <ExecutionQaSummaryPanel
        execution={{
          id: 1,
          name: "exec",
          qaSummary: "# 총평\n안정적.\n\n## 실패 분석\n- FAIL 3건",
        }}
        onSave={onSave}
      />,
    );

    fireEvent.click(screen.getAllByText("이 부분 수정")[1]);
    fireEvent.change(screen.getByTestId("qa-summary-section-editor"), {
      target: { value: "## 실패 분석\n- FAIL 5건" },
    });
    fireEvent.click(screen.getByTestId("qa-summary-section-save-button"));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      "# 총평\n안정적.\n\n## 실패 분석\n- FAIL 5건",
    );
  });

  it("총평이 비어 있으면 안내 문구를 보여준다", () => {
    render(
      <ExecutionQaSummaryPanel
        execution={{ id: 1, name: "exec", qaSummary: "" }}
        onSave={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/아직 작성된 QA 총평이 없습니다/),
    ).toBeInTheDocument();
  });
});
