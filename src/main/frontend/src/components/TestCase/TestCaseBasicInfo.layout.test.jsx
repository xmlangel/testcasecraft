import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

vi.mock("./MarkdownFieldEditor.jsx", () => ({
  default: ({ label, testid }) => (
    <div data-testid={testid || `md-${label}`}>{label}</div>
  ),
}));

import TestCaseBasicInfo, {
  INFO_GRID_TWO_COLUMN_MIN_WIDTH,
} from "./TestCaseBasicInfo.jsx";

const theme = createTheme();
const t = (_key, fallback) => fallback;

const renderInfo = (props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <TestCaseBasicInfo
        testCase={{
          name: "카테고리 트리",
          createdBy: "admin",
          priority: "HIGH",
          tags: [],
        }}
        errors={{}}
        availableTags={[]}
        linkedDocuments={[]}
        ragDocuments={[]}
        t={t}
        theme={theme}
        onChange={() => () => {}}
        onTestCaseChange={() => {}}
        onTagChange={() => {}}
        onLinkedDocumentsChange={() => {}}
        onMarkdownPaste={() => {}}
        {...props}
      />
    </ThemeProvider>,
  );

describe("TestCaseBasicInfo 접지 않는 2열 격자 (ICT-494 tl-3)", () => {
  it("접는 묶음(아코디언) 없이 필드를 바로 보인다", () => {
    const { container } = renderInfo();
    expect(container.querySelector(".MuiAccordion-root")).toBeNull();
    expect(screen.queryByText("테스트케이스 정보")).toBeNull();
    expect(screen.getByTestId("testcase-name-input")).toBeVisible();
  });

  it("격자 순서는 소유자·우선순위 → 이름 → 설명 → 자동화·실행 유형이다", () => {
    renderInfo();
    const grid = screen.getByTestId("testcase-info-grid");
    const order = [
      screen.getByTestId("testcase-owner-field"),
      screen.getByLabelText("우선순위"),
      screen.getByTestId("testcase-name-input"),
      screen.getByTestId("testcase-description-input"),
      screen.getByLabelText("자동화 여부"),
    ];
    order.forEach((el) => expect(grid).toContainElement(el));
    for (let i = 1; i < order.length; i += 1) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("소유자 칸은 작성자를 읽기 전용으로 보인다", () => {
    renderInfo();
    const owner = screen.getByTestId("testcase-owner-field");
    expect(owner).toHaveValue("admin");
    expect(owner).toHaveAttribute("readonly");
  });

  it("넘겨받은 ID·Parent 항목을 같은 격자 안에 둔다", () => {
    renderInfo({ metadataSlot: <div data-testid="meta-slot" /> });
    expect(screen.getByTestId("testcase-info-grid")).toContainElement(
      screen.getByTestId("meta-slot"),
    );
  });

  it("사용자 정의 필드 다음에 전제 조건이 온다", () => {
    renderInfo();
    const custom = screen.getByTestId("testcase-custom-fields");
    const conditions = screen.getByTestId("testcase-conditions");
    expect(
      custom.compareDocumentPosition(conditions) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      within(conditions).getByTestId("testcase-precondition-input"),
    ).toBeInTheDocument();
  });

  it("넓은 칸에서만 2열로 두고 좁으면 1열로 내려오는 컨테이너 기준을 쓴다", () => {
    renderInfo();
    expect(screen.getByTestId("testcase-info-section")).toHaveStyle({
      containerType: "inline-size",
    });
    expect(screen.getByTestId("testcase-info-grid")).toHaveStyle({
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
    });
    // 1600px 3단 상세 칸(약 700px)은 2열, 2단·1단 겹침처럼 좁은 칸(380~)은 1열
    expect(INFO_GRID_TWO_COLUMN_MIN_WIDTH).toBeGreaterThan(380);
    expect(INFO_GRID_TWO_COLUMN_MIN_WIDTH).toBeLessThan(640);
  });
});
