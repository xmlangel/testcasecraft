import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("./VersionIndicator.jsx", () => ({ default: () => null }));

import TestCaseFormHeader from "./TestCaseFormHeader.jsx";

const t = (key, fallback) => fallback || key;

const baseProps = {
  testCaseId: "tc1",
  testCase: { id: "tc1", type: "testcase", displayId: "TC-1" },
  isSaving: false,
  isFolder: false,
  t,
  onSave: vi.fn(),
  onCancel: vi.fn(),
};

describe("TestCaseFormHeader 편집/보기 전환 (ICT-486)", () => {
  it("onViewModeChange 가 없으면 전환 토글을 그리지 않는다", () => {
    render(<TestCaseFormHeader {...baseProps} viewMode="edit" />);
    expect(screen.queryByTestId("testcase-view-mode-toggle")).toBeNull();
  });

  it("보기 버튼을 누르면 view 로 바꾸도록 알린다", () => {
    const onViewModeChange = vi.fn();
    render(
      <TestCaseFormHeader
        {...baseProps}
        viewMode="edit"
        onViewModeChange={onViewModeChange}
      />,
    );
    fireEvent.click(screen.getByTestId("testcase-view-mode-view"));
    expect(onViewModeChange).toHaveBeenCalledWith("view");
  });

  it("이미 선택된 모드를 다시 눌러도 알리지 않는다", () => {
    const onViewModeChange = vi.fn();
    render(
      <TestCaseFormHeader
        {...baseProps}
        viewMode="edit"
        onViewModeChange={onViewModeChange}
      />,
    );
    fireEvent.click(screen.getByTestId("testcase-view-mode-edit"));
    expect(onViewModeChange).not.toHaveBeenCalled();
  });

  it("보기 모드(isViewer)에서는 저장·취소 버튼을 숨긴다", () => {
    render(
      <TestCaseFormHeader
        {...baseProps}
        isViewer
        viewMode="view"
        onViewModeChange={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("testcase-header-save-button")).toBeNull();
    expect(screen.queryByTestId("testcase-header-cancel-button")).toBeNull();
    expect(screen.getByTestId("testcase-view-mode-toggle")).toBeInTheDocument();
  });
});
