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

// ICT-514(리뷰 P1-9): IMPORT/EXPORT·EXPORT 두 버튼을 메뉴 하나로 합쳤다.
// 합친 뒤에도 가져오기와 내보내기가 모두 남아 있어야 한다. 하나라도 빠지면
// 사용자는 스프레드시트 화면에서 그 기능에 닿을 길을 잃는다.
describe("ExportMenu — 가져오기·내보내기 통합 메뉴", () => {
  const handlers = () => ({
    onClose: vi.fn(),
    onOpenImportExport: vi.fn(),
    onExportCsv: vi.fn(),
    onExportExcel: vi.fn(),
    onExportPdf: vi.fn(),
    onExportCsvRaw: vi.fn(),
    onExportExcelRaw: vi.fn(),
  });

  it("한 메뉴에 가져오기와 CSV·Excel·PDF 내보내기를 모두 보인다", () => {
    const h = handlers();
    render(<ExportMenu anchorEl={anchor} t={t} {...h} />);
    expect(screen.getByText("가져오기")).toBeInTheDocument();
    expect(screen.getByText("CSV로 내보내기")).toBeInTheDocument();
    expect(screen.getByText("Excel로 내보내기")).toBeInTheDocument();
    expect(screen.getByText("PDF 내보내기(상세)")).toBeInTheDocument();
    expect(
      screen.getByText("CSV로 내보내기 (가져오기용 원문)"),
    ).toBeInTheDocument();
  });

  it("가져오기 항목은 Import/Export 대화상자를, 내보내기 항목은 내보내기를 부른다", () => {
    const h = handlers();
    render(<ExportMenu anchorEl={anchor} t={t} {...h} />);
    fireEvent.click(screen.getByTestId("spreadsheet-io-menu-import"));
    expect(h.onOpenImportExport).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText("Excel로 내보내기"));
    expect(h.onExportExcel).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText("PDF 내보내기(상세)"));
    expect(h.onExportPdf).toHaveBeenCalledTimes(1);
  });

  it("가져오기 동작을 넘기지 않으면(전체화면) 가져오기 항목 없이 내보내기만 보인다", () => {
    const { onOpenImportExport: _omit, ...h } = handlers();
    render(<ExportMenu anchorEl={anchor} t={t} {...h} />);
    expect(screen.queryByTestId("spreadsheet-io-menu-import")).toBeNull();
    expect(screen.getByText("CSV로 내보내기")).toBeInTheDocument();
  });
});
