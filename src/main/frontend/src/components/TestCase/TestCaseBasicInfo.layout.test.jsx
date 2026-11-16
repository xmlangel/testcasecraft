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
    renderInfo();
    // 기본 정보 격자는 접지 않는다. 연결 항목만 따로 접는다(tl-6).
    expect(
      screen
        .getByTestId("testcase-info-grid")
        .querySelector(".MuiAccordion-root"),
    ).toBeNull();
    expect(screen.queryByText("테스트케이스 정보")).toBeNull();
    expect(screen.getByTestId("testcase-name-input")).toBeVisible();
  });

  it("이름 → 설명 → 실행 유형·우선순위·기법 한 줄 → 연결 항목 → 정보 요약 순서다 (ICT-495 cl-4)", () => {
    renderInfo({ metadataSlot: <div data-testid="meta-slot" /> });
    const order = [
      screen.getByTestId("testcase-name-input"),
      screen.getByTestId("testcase-description-input"),
      screen.getByTestId("testcase-type-row"),
      screen.getByTestId("testcase-custom-fields"),
      screen.getByTestId("meta-slot"),
      screen.getByTestId("testcase-conditions"),
    ];
    for (let i = 1; i < order.length; i += 1) {
      expect(
        order[i - 1].compareDocumentPosition(order[i]) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("실행 유형·우선순위·테스트 기법을 작은 입력칸으로 한 줄에 둔다 (ICT-495 cl-4)", () => {
    renderInfo();
    const row = screen.getByTestId("testcase-type-row");
    expect(row).toHaveStyle({ display: "flex", flexWrap: "wrap" });
    const exec = within(row).getByLabelText("Manual/Automation");
    const prio = within(row).getByLabelText("우선순위");
    const tech = within(row).getByLabelText("테스트 기법");
    [exec, prio, tech].forEach((el) =>
      expect(el.closest(".MuiInputBase-root")).toHaveClass(
        "MuiInputBase-sizeSmall",
      ),
    );
    // 우선순위는 소유자와 함께 맨 위에 있던 큰 칸에서 빠졌다
    expect(
      within(screen.getByTestId("testcase-info-grid")).queryByLabelText(
        "우선순위",
      ),
    ).toBeNull();
  });

  it("연결 항목은 처음에 접혀 있다 (ICT-495 cl-4)", () => {
    renderInfo();
    expect(screen.getByTestId("testcase-link-items-summary")).toHaveAttribute(
      "aria-expanded",
      "false",
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
