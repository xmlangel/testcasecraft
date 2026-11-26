import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import TestCaseSpreadsheet from "./TestCaseSpreadsheet.jsx";

// ICT-514(리뷰 P1-9): 스프레드시트 보기의 도구 모음이 표를 가렸다.
//  - 그림자 있는 도구 모음 카드가 sticky 로 표 위에 떠서 겹쳤다 → 표 위 한 줄의 정적 도구 모음
//  - IMPORT/EXPORT 와 EXPORT 가 나란히 있었다 → 메뉴 하나 (두 기능 모두 유지)
//  - 긴 스텝 셀 하나가 행 높이를 화면 밖까지 늘렸다 → 기본 3줄, 펼치기로 전체

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({
    t: (key, def, vars) => {
      let s = typeof def === "string" ? def : key;
      if (vars && typeof vars === "object")
        Object.entries(vars).forEach(([k, v]) => {
          s = s.replace(`{${k}}`, String(v));
        });
      return s;
    },
  }),
}));
vi.mock("../../services/testCaseService.js", () => ({ default: {} }));
vi.mock("./TestCaseImportExportDialog.jsx", () => ({
  default: ({ open }) =>
    open ? <div data-testid="stub-import-export-dialog" /> : null,
}));

const data = [
  {
    id: "tc1",
    type: "testcase",
    name: "로그인",
    displayId: "MCP-1",
    steps: [
      {
        stepNumber: 1,
        description: "1. 접속\n2. 아이디 입력\n3. 비밀번호 입력\n4. 로그인",
        expectedResult: "로그인된다",
      },
    ],
  },
];

const setup = () =>
  render(
    <TestCaseSpreadsheet
      data={data}
      allData={data}
      onChange={vi.fn()}
      onSave={vi.fn()}
      onRefresh={vi.fn()}
      projectId="p1"
    />,
  );

describe("TestCaseSpreadsheet 도구 모음 (ICT-514)", () => {
  it("가져오기·내보내기는 버튼 하나이고, 메뉴에 두 기능이 모두 있다", () => {
    setup();
    const buttons = screen.getAllByTestId("spreadsheet-io-menu-button");
    expect(buttons).toHaveLength(1);
    expect(screen.queryByText("Import/Export")).toBeNull();

    fireEvent.click(buttons[0]);
    const menu = screen.getByRole("menu");
    expect(within(menu).getByText("가져오기")).toBeInTheDocument();
    expect(within(menu).getByText("CSV로 내보내기")).toBeInTheDocument();
    expect(within(menu).getByText("Excel로 내보내기")).toBeInTheDocument();
    expect(within(menu).getByText("PDF 내보내기(상세)")).toBeInTheDocument();

    // 가져오기 항목은 기존 Import/Export 대화상자를 연다
    fireEvent.click(within(menu).getByTestId("spreadsheet-io-menu-import"));
    expect(
      screen.getByTestId("stub-import-export-dialog"),
    ).toBeInTheDocument();
  });

  it("도구 모음은 표 위에 붙는 정적 줄이다 (sticky·그림자 없음)", () => {
    setup();
    const header = screen.getByTestId("spreadsheet-header-bar");
    const toolbar = within(header)
      .getByTestId("spreadsheet-io-menu-button")
      .closest("div");
    expect(toolbar).not.toHaveStyle({ position: "sticky" });
    expect(getComputedStyle(toolbar).boxShadow).toBe("");
    // 상태 칩과 같은 줄(헤더 바) 안에 있다
    expect(within(header).getByText(/개 스텝$/)).toBeInTheDocument();
  });

  it("긴 셀은 기본으로 줄여 보이고, 펼치기를 누르면 전체를 보인다", () => {
    setup();
    const grid = screen.getByTestId("spreadsheet-grid-container");
    expect(grid).toHaveAttribute("data-cells-expanded", "false");
    expect(
      grid.querySelectorAll(".Spreadsheet__data-viewer--clampable").length,
    ).toBeGreaterThan(0);

    const toggle = screen.getByTestId("spreadsheet-cells-expand-toggle");
    expect(toggle).toHaveTextContent("긴 셀 모두 펼치기");
    fireEvent.click(toggle);
    expect(grid).toHaveAttribute("data-cells-expanded", "true");
    expect(toggle).toHaveTextContent("긴 셀 3줄로 줄이기");
  });
});
