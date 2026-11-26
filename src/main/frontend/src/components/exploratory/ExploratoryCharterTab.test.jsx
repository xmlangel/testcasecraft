import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../context/ThemeContext.jsx", () => ({
  useTheme: () => ({ designSystem: "default" }),
}));
vi.mock("../TestCase/MarkdownFieldEditor", () => ({ default: () => null }));
vi.mock("../common/MarkdownViewer", () => ({ default: () => null }));

import ExploratoryCharterTab from "./ExploratoryCharterTab.jsx";

/** ICT-511: 차터 카드의 상태 칩이 "ACTIVE" 가 아니라 번역 문구로 보인다. */
describe("ExploratoryCharterTab 상태 칩 (ICT-511)", () => {
  const t = (_key, fallback) => fallback;
  const renderTab = (charters) =>
    render(
      <ExploratoryCharterTab
        t={t}
        charterError=""
        chartersLoading={false}
        charterFilter="ALL"
        setCharterFilter={vi.fn()}
        openNewCharterDialog={vi.fn()}
        filteredCharters={charters}
        openEditCharterDialog={vi.fn()}
        statusColor={{ ACTIVE: "success", ARCHIVED: "default" }}
        charterDialogOpen={false}
        setCharterDialogOpen={vi.fn()}
        editingCharter={null}
        charterForm={{ title: "", mission: "", status: "ACTIVE" }}
        setCharterForm={vi.fn()}
        saveCharter={vi.fn()}
        savingCharter={false}
      />,
    );

  it("ACTIVE·ARCHIVED 를 활성·보관됨 으로 보인다", () => {
    renderTab([
      { id: 1, title: "로그인 탐색", mission: "", status: "ACTIVE" },
      { id: 2, title: "지난 탐색", mission: "", status: "ARCHIVED" },
    ]);
    expect(screen.getByText("활성")).toBeInTheDocument();
    expect(screen.getByText("보관됨")).toBeInTheDocument();
    expect(screen.queryByText("ACTIVE")).toBeNull();
    expect(screen.queryByText("ARCHIVED")).toBeNull();
  });
});
