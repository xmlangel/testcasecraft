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
    const root = container.querySelector(".markdown-body");
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
    // 편집기는 contenteditable 이라 value 가 없다. 올라간 내용은 본문 텍스트로 본다.
    const editor = screen.getByTestId("qa-summary-section-editor");
    expect(editor.textContent).toContain("실패 분석");
    expect(editor.textContent).toContain("FAIL 3건");
    expect(editor.textContent).not.toContain("총평");
    expect(editor.textContent).not.toContain("안정적");
  });

  it("구간을 열어 저장하면 나머지 구간이 보존된 전체 마크다운을 넘긴다", async () => {
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
    fireEvent.click(screen.getByTestId("qa-summary-section-save-button"));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    // 한 구간만 열어 저장해도 나머지 구간이 사라지지 않고 전체가 넘어간다.
    expect(onSave).toHaveBeenCalledWith(
      "# 총평\n안정적.\n\n## 실패 분석\n- FAIL 3건",
    );
  });

  it("편집 중 총평이 바뀌어 구간이 밀리면 저장하지 않고 알린다", async () => {
    const onSave = vi.fn().mockResolvedValue(true);
    const { rerender } = render(
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

    // 다른 사람이 앞부분을 지워 같은 id 가 다른 구간을 가리키게 된 상태
    rerender(
      <ExecutionQaSummaryPanel
        execution={{
          id: 1,
          name: "exec",
          qaSummary: "## 실패 분석\n- FAIL 3건",
        }}
        onSave={onSave}
      />,
    );
    fireEvent.click(screen.getByTestId("qa-summary-section-save-button"));

    await waitFor(() =>
      expect(screen.getByTestId("qa-summary-conflict")).toBeInTheDocument(),
    );
    expect(onSave).not.toHaveBeenCalled();
    // 작성 중이던 내용은 편집기에 남아 있어야 한다
    expect(
      screen.getByTestId("qa-summary-section-editor").textContent,
    ).toContain("실패 분석");
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
