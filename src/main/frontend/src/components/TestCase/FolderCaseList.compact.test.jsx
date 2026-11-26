import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));

import FolderCaseList from "./FolderCaseList.jsx";

const folder = { id: "f1", type: "folder", name: "폴더" };
const items = [
  folder,
  {
    id: "c1",
    type: "testcase",
    name: "로그인",
    displayId: "TC-13",
    description: "설명 본문",
    createdBy: "dicky",
    parentId: "f1",
  },
  { id: "c2", type: "testcase", name: "로그아웃", parentId: "f1" },
];

describe("FolderCaseList 3단 분할 목록 (ICT-491)", () => {
  it("케이스 ID 열을 그린다", () => {
    render(<FolderCaseList folder={folder} items={items} />);
    expect(screen.getByTestId("folder-case-id-c1")).toHaveTextContent("TC-13");
  });

  it("compact 에서는 설명·기대결과 열을 빼고 ID·이름·우선순위만 남긴다", () => {
    render(<FolderCaseList folder={folder} items={items} compact />);
    expect(screen.queryByText("설명")).toBeNull();
    expect(screen.queryByText("기대결과")).toBeNull();
    expect(screen.queryByText("설명 본문")).toBeNull();
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("이름")).toBeInTheDocument();
  });

  it("상세에 열린 케이스 행을 선택 표시한다", () => {
    render(<FolderCaseList folder={folder} items={items} selectedId="c2" />);
    expect(screen.getByTestId("folder-case-row-c2")).toHaveClass(
      "Mui-selected",
    );
    expect(screen.getByTestId("folder-case-row-c1")).not.toHaveClass(
      "Mui-selected",
    );
  });

  it("compact 에서는 소유자를 빼고 최근 결과 색 막대를 그린다", () => {
    render(
      <FolderCaseList
        folder={folder}
        items={items}
        compact
        latestResults={{
          c1: { result: "FAIL", executedAt: "2026-11-16T17:00:00" },
        }}
      />,
    );
    expect(screen.queryByText("소유자")).toBeNull();
    expect(screen.queryByTestId("folder-case-owner-c1")).toBeNull();
    expect(screen.getByText("최근 결과")).toBeInTheDocument();
    expect(screen.getByTestId("folder-case-result-c1")).toHaveAttribute(
      "data-result",
      "FAIL",
    );
    // 실행된 적 없는 케이스는 결과 없음으로 표시한다
    expect(screen.getByTestId("folder-case-result-c2")).toHaveAttribute(
      "data-result",
      "NONE",
    );
  });
});

describe("FolderCaseList 좁은 가운데 칸 (ICT-494 tl-1)", () => {
  const withPriority = items.map((item) =>
    item.id === "c1" ? { ...item, priority: "HIGH" } : item,
  );

  it("hidePriority 면 우선순위 열을 감추고 ID·이름·최근 결과는 남긴다", () => {
    render(
      <FolderCaseList
        folder={folder}
        items={withPriority}
        compact
        hidePriority
      />,
    );
    expect(screen.queryByText("우선순위")).toBeNull();
    expect(screen.queryByText("HIGH")).toBeNull();
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("이름")).toBeInTheDocument();
    expect(screen.getByText("최근 결과")).toBeInTheDocument();
  });

  it("hidePriority 가 없으면 우선순위 열을 그대로 그린다", () => {
    render(<FolderCaseList folder={folder} items={withPriority} compact />);
    expect(screen.getByText("우선순위")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });
});
