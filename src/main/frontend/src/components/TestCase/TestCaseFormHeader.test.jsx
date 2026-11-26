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
    expect(screen.queryByTestId("testcase-save-button")).toBeNull();
    expect(screen.queryByTestId("testcase-cancel-button")).toBeNull();
    expect(screen.getByTestId("testcase-view-mode-toggle")).toBeInTheDocument();
  });
});

describe("TestCaseFormHeader 자동화 표시 (ICT-487)", () => {
  it("자동화 케이스면 TC ID 옆에 자동화 칩을 그린다", () => {
    render(
      <TestCaseFormHeader
        {...baseProps}
        testCase={{ ...baseProps.testCase, isAutomated: true }}
      />,
    );
    expect(
      screen.getByTestId("testcase-header-automated-chip"),
    ).toBeInTheDocument();
  });

  it("수동 케이스면 칩을 그리지 않는다", () => {
    render(
      <TestCaseFormHeader
        {...baseProps}
        testCase={{ ...baseProps.testCase, isAutomated: false }}
      />,
    );
    expect(screen.queryByTestId("testcase-header-automated-chip")).toBeNull();
  });
});

describe("TestCaseFormHeader 머리 한 줄과 더보기 메뉴 (ICT-494 tl-2)", () => {
  const actions = () => ({
    onDelete: vi.fn(),
    onCreateVersion: vi.fn(),
    onVersionHistory: vi.fn(),
    onAddNew: vi.fn(),
    onRagRegister: vi.fn(),
  });

  it("편집 중이면 주 동작은 취소·저장 두 개이고 나머지는 버튼으로 그리지 않는다", () => {
    render(
      <TestCaseFormHeader
        {...baseProps}
        {...actions()}
        viewMode="edit"
        onViewModeChange={vi.fn()}
        ragStatus="notVectorized"
      />,
    );
    const row = screen.getByTestId("testcase-header-row");
    expect(row).toContainElement(screen.getByTestId("testcase-cancel-button"));
    expect(row).toContainElement(screen.getByTestId("testcase-save-button"));
    expect(screen.getByTestId("testcase-save-button")).toHaveTextContent(
      "저장",
    );
    // 메뉴를 열기 전에는 새 케이스 추가·버전 생성·삭제·RAG 등록이 화면에 없다
    expect(screen.queryByTestId("testcase-add-new-button")).toBeNull();
    expect(screen.queryByTestId("testcase-header-delete-button")).toBeNull();
    expect(screen.queryByTestId("testcase-rag-register-menu")).toBeNull();
    expect(screen.queryByText("버전 생성")).toBeNull();
  });

  it("더보기 메뉴에 새 케이스 추가·RAG 등록·버전 히스토리·버전 생성·삭제를 모두 둔다", () => {
    const handlers = actions();
    render(
      <TestCaseFormHeader
        {...baseProps}
        {...handlers}
        viewMode="edit"
        ragStatus="notVectorized"
      />,
    );
    fireEvent.click(screen.getByTestId("testcase-header-more-button"));
    expect(screen.getByTestId("testcase-add-new-button")).toBeInTheDocument();
    expect(
      screen.getByTestId("testcase-rag-register-menu"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("testcase-version-history-menu"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("testcase-create-version-menu"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("testcase-header-delete-button"));
    expect(handlers.onDelete).toHaveBeenCalled();
  });

  it("메뉴 항목을 누르면 해당 동작을 부르고 메뉴를 닫는다", () => {
    const handlers = actions();
    render(
      <TestCaseFormHeader
        {...baseProps}
        {...handlers}
        ragStatus="notVectorized"
      />,
    );
    fireEvent.click(screen.getByTestId("testcase-header-more-button"));
    fireEvent.click(screen.getByTestId("testcase-create-version-menu"));
    expect(handlers.onCreateVersion).toHaveBeenCalledWith("tc1");

    fireEvent.click(screen.getByTestId("testcase-header-more-button"));
    fireEvent.click(screen.getByTestId("testcase-rag-register-menu"));
    expect(handlers.onRagRegister).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("testcase-header-more-button"));
    fireEvent.click(screen.getByTestId("testcase-add-new-button"));
    expect(handlers.onAddNew).toHaveBeenCalled();
  });

  it("RAG 에 이미 등록됐으면 메뉴에 RAG 등록을 두지 않는다", () => {
    render(
      <TestCaseFormHeader
        {...baseProps}
        {...actions()}
        ragStatus="vectorized"
      />,
    );
    fireEvent.click(screen.getByTestId("testcase-header-more-button"));
    expect(screen.queryByTestId("testcase-rag-register-menu")).toBeNull();
  });

  it("보기 모드면 주 동작은 「수정」 하나이고 누르면 편집으로 바꾼다", () => {
    const onViewModeChange = vi.fn();
    render(
      <TestCaseFormHeader
        {...baseProps}
        {...actions()}
        isViewer
        viewMode="view"
        onViewModeChange={onViewModeChange}
      />,
    );
    expect(screen.queryByTestId("testcase-save-button")).toBeNull();
    fireEvent.click(screen.getByTestId("testcase-header-edit-button"));
    expect(onViewModeChange).toHaveBeenCalledWith("edit");
  });

  it("조회 전용 역할(전환 불가)에는 수정 버튼을 그리지 않는다", () => {
    render(<TestCaseFormHeader {...baseProps} isViewer viewMode="edit" />);
    expect(screen.queryByTestId("testcase-header-edit-button")).toBeNull();
  });

  it("상위가 넘긴 입력 모드 전환을 같은 줄에 그리고 머리를 위에 붙인다", () => {
    render(
      <TestCaseFormHeader
        {...baseProps}
        viewMode="edit"
        onViewModeChange={vi.fn()}
        headerExtra={<span data-testid="mode-slot" />}
      />,
    );
    const row = screen.getByTestId("testcase-header-row");
    expect(row).toContainElement(screen.getByTestId("mode-slot"));
    expect(row).toContainElement(
      screen.getByTestId("testcase-view-mode-toggle"),
    );
    expect(screen.getByTestId("testcase-form-header")).toHaveStyle({
      position: "sticky",
    });
  });

  it("저장할 수 없는 상태면 저장 버튼을 비활성화한다", () => {
    render(<TestCaseFormHeader {...baseProps} saveDisabled />);
    expect(screen.getByTestId("testcase-save-button")).toBeDisabled();
  });
});

describe("TestCaseFormHeader 이전·다음 위치 (ICT-495 cl-3)", () => {
  const nav = <div data-testid="header-nav-slot">‹ 2 / 5 ›</div>;
  const follows = (a, b) =>
    Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  const menuProps = { onDelete: vi.fn() };

  it("편집 중이면 [취소][저장] 다음, 더보기 앞에 이전·다음을 둔다", () => {
    render(
      <TestCaseFormHeader
        {...baseProps}
        {...menuProps}
        viewMode="edit"
        headerNav={nav}
      />,
    );
    const row = screen.getByTestId("testcase-header-row");
    const slot = screen.getByTestId("header-nav-slot");
    expect(row).toContainElement(slot);
    expect(follows(screen.getByTestId("testcase-cancel-button"), slot)).toBe(
      true,
    );
    expect(follows(screen.getByTestId("testcase-save-button"), slot)).toBe(
      true,
    );
    expect(
      follows(slot, screen.getByTestId("testcase-header-more-button")),
    ).toBe(true);
  });

  it("보기 모드면 [수정] 다음, 더보기 앞의 같은 자리에 둔다", () => {
    render(
      <TestCaseFormHeader
        {...baseProps}
        {...menuProps}
        isViewer
        viewMode="view"
        onViewModeChange={vi.fn()}
        // 보기 모드의 더보기에는 RAG 등록만 남는다
        ragStatus="notVectorized"
        onRagRegister={vi.fn()}
        headerNav={nav}
      />,
    );
    const slot = screen.getByTestId("header-nav-slot");
    expect(screen.getByTestId("testcase-header-row")).toContainElement(slot);
    expect(
      follows(screen.getByTestId("testcase-header-edit-button"), slot),
    ).toBe(true);
    expect(
      follows(slot, screen.getByTestId("testcase-header-more-button")),
    ).toBe(true);
  });
});
