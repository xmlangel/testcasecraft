import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));

import FolderCaseList from "./FolderCaseList.jsx";

describe("FolderCaseList 자동화 표시 (ICT-487)", () => {
  it("자동화 케이스 이름 옆에만 자동화 아이콘을 그린다", () => {
    const folder = { id: "f1", type: "folder", name: "폴더" };
    const items = [
      folder,
      {
        id: "c1",
        type: "testcase",
        name: "자동",
        parentId: "f1",
        isAutomated: true,
      },
      {
        id: "c2",
        type: "testcase",
        name: "수동",
        parentId: "f1",
        isAutomated: false,
      },
      {
        id: "f2",
        type: "folder",
        name: "하위",
        parentId: "f1",
        isAutomated: true,
      },
    ];
    render(
      <FolderCaseList folder={folder} items={items} onSelectItem={vi.fn()} />,
    );

    expect(
      screen.getByTestId("folder-case-automated-icon-c1"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("folder-case-automated-icon-c2")).toBeNull();
    expect(screen.queryByTestId("folder-case-automated-icon-f2")).toBeNull();
  });
});
