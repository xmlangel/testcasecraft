import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";

vi.mock("../../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));

import MemoizedTreeItem from "./MemoizedTreeItem.jsx";

const t = (key, fallback, params) => {
  let s = fallback || key;
  Object.entries(params || {}).forEach(([k, v]) => {
    s = s.replace(`{${k}}`, v);
  });
  return s;
};

const renderItem = (node, extra = {}) =>
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
        onOpenVersionHistory={vi.fn()}
        t={t}
        depth={0}
        isExpanded={false}
        onToggle={vi.fn()}
        onSelect={vi.fn()}
        {...extra}
      />
    </DndContext>,
  );

/** ICT-511: 트리 행의 ⋮ 메뉴·펼치기 버튼에 항목 이름이 들어간 접근 가능한 이름이 있다. */
describe("MemoizedTreeItem 아이콘 버튼 이름 (ICT-511)", () => {
  it("폴더 행의 펼치기·⋮ 버튼에 이름이 있다", () => {
    renderItem({ id: "f1", type: "folder", name: "결제" });
    const toggle = screen.getByRole("button", { name: "결제 펼치기" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("button", { name: "결제 작업 메뉴" }),
    ).toHaveAttribute("aria-haspopup", "menu");
  });

  it("펼친 폴더는 '접기' 로 읽힌다", () => {
    renderItem(
      { id: "f2", type: "folder", name: "결제" },
      { isExpanded: true },
    );
    expect(screen.getByRole("button", { name: "결제 접기" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("케이스 행의 버튼에 모두 이름이 있다", () => {
    renderItem({ id: "c1", type: "testcase", name: "로그인" });
    const unnamed = screen
      .getAllByRole("button")
      .filter((b) => !b.getAttribute("aria-label") && !b.textContent.trim());
    expect(unnamed).toHaveLength(0);
    expect(
      screen.getByRole("button", { name: "로그인 작업 메뉴" }),
    ).toBeInTheDocument();
  });
});
