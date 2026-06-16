import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StepMenu, ExportMenu } from "./SpreadsheetMenus.jsx";

const t = (key, fallback, vars) => {
  let s = fallback || key;
  if (vars)
    Object.entries(vars).forEach(([k, v]) => (s = s.replace(`{${k}}`, v)));
  return s;
};
// Menu 는 anchorEl 이 있어야 열린다 — 더미 엘리먼트
const anchor = document.createElement("div");

describe("StepMenu", () => {
  it("스텝 증감/설정 항목을 렌더하고 콜백을 호출한다", () => {
    const onQuickStepChange = vi.fn();
    const onOpenSettings = vi.fn();
    render(
      <StepMenu
        anchorEl={anchor}
        onClose={vi.fn()}
        maxSteps={3}
        onQuickStepChange={onQuickStepChange}
        onOpenSettings={onOpenSettings}
        t={t}
      />,
    );
    fireEvent.click(screen.getByText("스텝 추가 (4개)"));
    expect(onQuickStepChange).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByText("스텝 제거 (2개)"));
    expect(onQuickStepChange).toHaveBeenCalledWith(-1);
    fireEvent.click(screen.getByText("스텝 수 직접 설정..."));
    expect(onOpenSettings).toHaveBeenCalled();
  });

  it("maxSteps 경계에서 증감 항목이 비활성화된다", () => {
    const { rerender } = render(
      <StepMenu anchorEl={anchor} maxSteps={10} t={t} />,
    );
    expect(screen.getByText("스텝 추가 (11개)").closest("li")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    rerender(<StepMenu anchorEl={anchor} maxSteps={1} t={t} />);
    expect(screen.getByText("스텝 제거 (0개)").closest("li")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});

describe("ExportMenu", () => {
  it("CSV/Excel/PDF 항목 클릭 시 각 콜백을 호출한다", () => {
    const onExportCsv = vi.fn();
    const onExportExcel = vi.fn();
    const onExportPdf = vi.fn();
    render(
      <ExportMenu
        anchorEl={anchor}
        onClose={vi.fn()}
        onExportCsv={onExportCsv}
        onExportExcel={onExportExcel}
        onExportPdf={onExportPdf}
        t={t}
      />,
    );
    fireEvent.click(screen.getByText("CSV로 내보내기"));
    expect(onExportCsv).toHaveBeenCalled();
    fireEvent.click(screen.getByText("Excel로 내보내기"));
    expect(onExportExcel).toHaveBeenCalled();
    fireEvent.click(screen.getByText("PDF 내보내기(상세)"));
    expect(onExportPdf).toHaveBeenCalled();
  });
});
