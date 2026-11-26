import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";

vi.mock("../../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));

import MemoizedTreeItem from "./MemoizedTreeItem.jsx";

const t = (key, fallback) => fallback || key;
const folder = { id: "f1", type: "folder", name: "확장" };

const renderItem = (extra) =>
  render(
    <DndContext>
      <MemoizedTreeItem
        node={folder}
        idx={0}
        siblings={[folder]}
        isSelected={false}
        isChecked={false}
        selectable={true}
        userRole="ADMIN"
        orderEditMode={false}
        nodeOrder={1}
        testCaseCount={3}
        onCheck={vi.fn()}
        onContextMenu={vi.fn()}
        t={t}
        depth={0}
        isExpanded={false}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
        {...extra}
      />
    </DndContext>,
  );

// ICT-512: 하위 케이스가 일부만 선택된 폴더는 중간 상태로 보인다.
describe("MemoizedTreeItem 폴더 체크 상태", () => {
  it("isIndeterminate 이면 체크박스가 중간 상태다", () => {
    renderItem({ isIndeterminate: true });
    const box = screen.getByRole("checkbox");
    expect(box).not.toBeChecked();
    expect(box).toHaveAttribute("data-indeterminate", "true");
  });

  it("isChecked 이면 체크된 상태다", () => {
    renderItem({ isChecked: true });
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("기본값은 중간 상태가 아니다", () => {
    renderItem({});
    expect(screen.getByRole("checkbox")).toHaveAttribute(
      "data-indeterminate",
      "false",
    );
  });
});
