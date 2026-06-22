import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SpreadsheetToolbar from "./SpreadsheetToolbar.jsx";

const t = (key, fallback, vars) => {
  let s = fallback || key;
  if (vars)
    Object.entries(vars).forEach(([k, v]) => (s = s.replace(`{${k}}`, v)));
  return s;
};

const setup = (overrides = {}) => {
  const props = {
    t,
    isLoading: false,
    selectedRowIndex: null,
    selectedRange: null,
    hasChanges: true,
    canSave: true,
    onRefresh: vi.fn(),
    onAddRows: vi.fn(),
    onAddFolder: vi.fn(),
    onDeleteRows: vi.fn(),
    onValidate: vi.fn(),
    onImportExport: vi.fn(),
    onExportMenu: vi.fn(),
    onStepMenu: vi.fn(),
    onToggleFullscreen: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };
  render(<SpreadsheetToolbar {...props} />);
  return props;
};

describe("SpreadsheetToolbar", () => {
  it("핵심 버튼을 렌더링한다", () => {
    setup();
    expect(screen.getByText("새로고침")).toBeInTheDocument();
    expect(screen.getByText("행 추가")).toBeInTheDocument();
    expect(screen.getByText("검증")).toBeInTheDocument();
    expect(screen.getByText("일괄 저장")).toBeInTheDocument();
  });

  it("행 추가 클릭 시 onAddRows('append'), 저장 클릭 시 onSave 호출", () => {
    const props = setup();
    fireEvent.click(screen.getByText("행 추가"));
    expect(props.onAddRows).toHaveBeenCalledWith("append");
    fireEvent.click(screen.getByText("일괄 저장"));
    expect(props.onSave).toHaveBeenCalledTimes(1);
  });

  it("행 미선택 시 삽입/삭제 버튼이 비활성화된다", () => {
    setup({ selectedRowIndex: null });
    expect(screen.getByText("위에 추가").closest("button")).toBeDisabled();
    expect(screen.getByText("삭제").closest("button")).toBeDisabled();
  });

  it("행 선택 시 삽입/삭제 버튼 활성화, '아래에 추가'는 onAddRows('below')", () => {
    const props = setup({ selectedRowIndex: 2 });
    const below = screen.getByText("아래에 추가");
    expect(below.closest("button")).not.toBeDisabled();
    fireEvent.click(below);
    expect(props.onAddRows).toHaveBeenCalledWith("below");
  });

  it("hasChanges=false 또는 canSave=false 면 저장 비활성화", () => {
    setup({ hasChanges: false });
    expect(screen.getByText("일괄 저장").closest("button")).toBeDisabled();
  });

  it("showImportExport / showFullscreenToggle 로 해당 버튼 노출을 제어한다", () => {
    const { rerender } = render(
      <SpreadsheetToolbar
        t={t}
        hasChanges
        canSave
        onAddRows={vi.fn()}
        onSave={vi.fn()}
      />,
    );
    // 기본(off): Import/Export 없음
    expect(screen.queryByText("Import/Export")).toBeNull();

    rerender(
      <SpreadsheetToolbar
        t={t}
        hasChanges
        canSave
        showImportExport
        showFullscreenToggle
        onAddRows={vi.fn()}
        onSave={vi.fn()}
        onToggleFullscreen={vi.fn()}
      />,
    );
    expect(screen.getByText("Import/Export")).toBeInTheDocument();
  });
});
