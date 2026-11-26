import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TreeHeader from "./TreeHeader.jsx";

vi.mock("../../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (_key, def) => def }),
}));

/**
 * ICT-511: 트리 상단 도구 모음의 아이콘 버튼은 모두 화면 낭독기가 읽을 이름이 있다.
 */
const baseProps = {
  userRole: "PROJECT_MANAGER",
  selectable: false,
  isAllChecked: false,
  isIndeterminate: false,
  totalFolderCount: 3,
  totalTestCaseCount: 10,
  checkedIds: ["a"],
  orderEditMode: false,
  orderChanged: false,
  folderOnlyView: false,
  onToggleViewMode: vi.fn(),
  filterText: "abc",
  onFilterChange: vi.fn(),
  onCheckAll: vi.fn(),
  onRefresh: vi.fn(),
  onOpenAddMenu: vi.fn(),
  onOrderEditMode: vi.fn(),
  onOrderSave: vi.fn(),
  onOrderCancel: vi.fn(),
  onBatchDelete: vi.fn(),
  onOpenCrossProjectTransfer: vi.fn(),
};

const assertAllButtonsNamed = () => {
  const buttons = screen.getAllByRole("button");
  expect(buttons.length).toBeGreaterThan(0);
  const unnamed = buttons.filter(
    (b) => !(b.getAttribute("aria-label") || b.textContent.trim()),
  );
  expect(unnamed.map((b) => b.outerHTML.slice(0, 120))).toEqual([]);
};

describe("TreeHeader 아이콘 버튼 이름 (ICT-511)", () => {
  it("펼치기·새로고침·추가·순서 버튼에 이름이 있다", () => {
    render(<TreeHeader {...baseProps} />);
    expect(
      screen.getByRole("button", { name: "폴더만 표시" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "새로고침" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "추가" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "순서 편집" }),
    ).toBeInTheDocument();
    assertAllButtonsNamed();
  });

  it("순서 편집 중에는 저장·취소 버튼에 이름이 있다", () => {
    render(<TreeHeader {...baseProps} orderEditMode orderChanged />);
    expect(
      screen.getByRole("button", { name: "순서 저장" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "취소" })).toBeInTheDocument();
    assertAllButtonsNamed();
  });
});
