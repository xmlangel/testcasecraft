import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TreeHeader from "./TreeHeader.jsx";

vi.mock("../../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (_key, def) => def }),
}));

/**
 * ICT-431: 검색 중 헤더 카운트가 "걸린 수 / 전체 수" 로 보이는지 고정.
 *
 * 배경: 검색으로 좁혀놓고 전체 선택을 눌러도 몇 건이 담기는지 화면에 단서가 없었다.
 * 카운트가 계속 전체 수만 보여주면 사용자는 필터가 선택에 반영됐는지 알 수 없다.
 */
describe("TreeHeader 카운트 표시 (ICT-431)", () => {
  const baseProps = {
    userRole: "PROJECT_MANAGER",
    selectable: true,
    isAllChecked: false,
    isIndeterminate: false,
    totalFolderCount: 12,
    totalTestCaseCount: 340,
    checkedIds: [],
    orderEditMode: false,
    orderChanged: false,
    folderOnlyView: false,
    onToggleViewMode: vi.fn(),
    filterText: "",
    onFilterChange: vi.fn(),
    onCheckAll: vi.fn(),
    onRefresh: vi.fn(),
    onOpenAddMenu: vi.fn(),
    onOrderEditMode: vi.fn(),
    onOrderSave: vi.fn(),
    onOrderCancel: vi.fn(),
    onBatchDelete: vi.fn(),
  };

  it("검색이 없으면 전체 수만 보여준다", () => {
    render(<TreeHeader {...baseProps} />);

    expect(screen.getByTestId("tree-folder-count")).toHaveTextContent("12");
    expect(screen.getByTestId("tree-testcase-count")).toHaveTextContent("340");
  });

  it("검색 중이면 걸린 수 / 전체 수", () => {
    render(
      <TreeHeader
        {...baseProps}
        filterText="smoke"
        filterActive
        matchedFolderCount={2}
        matchedTestCaseCount={17}
      />,
    );

    expect(screen.getByTestId("tree-folder-count")).toHaveTextContent("2/12");
    expect(screen.getByTestId("tree-testcase-count")).toHaveTextContent(
      "17/340",
    );
  });
});
