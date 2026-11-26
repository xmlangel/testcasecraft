import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";

vi.mock("../../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));

import MemoizedTreeItem from "./MemoizedTreeItem.jsx";

const t = (key, fallback) => fallback || key;

const renderItem = (node) =>
  render(
    <DndContext>
      <MemoizedTreeItem
        node={node}
        idx={0}
        siblings={[node]}
        isSelected={false}
        isChecked={false}
        selectable={false}
        userRole="ADMIN"
        orderEditMode={false}
        nodeOrder={1}
        testCaseCount={0}
        onCheck={vi.fn()}
        onContextMenu={vi.fn()}
        t={t}
        depth={0}
        isExpanded={false}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
      />
    </DndContext>,
  );

describe("MemoizedTreeItem 자동화 표시 (ICT-487)", () => {
  it("자동화 케이스 행에 자동화 아이콘을 그린다", () => {
    renderItem({
      id: "c1",
      type: "testcase",
      name: "자동 케이스",
      isAutomated: true,
    });
    expect(screen.getByTestId("tree-automated-icon-c1")).toBeInTheDocument();
  });

  it("수동 케이스와 값이 없는 케이스에는 그리지 않는다", () => {
    renderItem({
      id: "c2",
      type: "testcase",
      name: "수동",
      isAutomated: false,
    });
    renderItem({ id: "c3", type: "testcase", name: "옛 케이스" });
    expect(screen.queryByTestId("tree-automated-icon-c2")).toBeNull();
    expect(screen.queryByTestId("tree-automated-icon-c3")).toBeNull();
  });

  it("폴더 행에는 그리지 않는다", () => {
    renderItem({ id: "f1", type: "folder", name: "폴더", isAutomated: true });
    expect(screen.queryByTestId("tree-automated-icon-f1")).toBeNull();
  });
});

describe("MemoizedTreeItem 한 줄 이름 (ICT-491 · ICT-495)", () => {
  it("케이스 행에 ID 를 그리지 않고 이름만 보인다 (ICT-495 cl-2)", () => {
    renderItem({
      id: "c1",
      type: "testcase",
      name: "로그인",
      displayId: "TC-13",
    });
    expect(screen.queryByTestId("tree-case-id-c1")).toBeNull();
    expect(screen.queryByText("TC-13")).toBeNull();
    expect(screen.getByTestId("tree-node-name-c1")).toHaveTextContent(
      /^로그인$/,
    );
  });

  it("긴 이름을 말줄임 없이 한 줄로 전부 그린다", () => {
    const longName = "아주 긴 테스트 케이스 이름 ".repeat(10).trim();
    renderItem({
      id: "c2",
      type: "testcase",
      name: longName,
      displayId: "TC-2",
    });
    const name = screen.getByTestId("tree-node-name-c2");
    expect(name).toHaveTextContent(longName);
    expect(name).toHaveStyle({ whiteSpace: "nowrap" });
    expect(name).not.toHaveStyle({ textOverflow: "ellipsis" });
  });

  it("폴더 행에는 케이스 ID 를 그리지 않는다", () => {
    renderItem({ id: "f1", type: "folder", name: "폴더", displayId: "X-1" });
    expect(screen.queryByTestId("tree-case-id-f1")).toBeNull();
  });
});
