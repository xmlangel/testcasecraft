import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

vi.mock("./MarkdownFieldEditor.jsx", () => ({
  default: ({ label, testid }) => (
    <div data-testid={testid || `md-${label}`}>{label}</div>
  ),
}));

import TestCaseBasicInfo from "./TestCaseBasicInfo.jsx";

// ICT-494 tl-5: 「자동화 여부」 토글을 없애고 실행 유형 하나로 고른다.
const theme = createTheme();
const t = (_key, fallback) => fallback;

const renderInfo = (testCase, props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <TestCaseBasicInfo
        testCase={{ name: "tc", tags: [], ...testCase }}
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

const linkedLabels = ["연결된 테스트케이스", "연결된 자동화(JUnit) 케이스"];

describe("TestCaseBasicInfo 실행 유형 하나로 합치기 (ICT-494 tl-5)", () => {
  it("자동화 여부 토글이 없다", () => {
    renderInfo({ executionType: "Automation", isAutomated: true });
    expect(screen.queryByLabelText("자동화 여부")).toBeNull();
    expect(screen.queryByRole("checkbox", { name: "자동화 여부" })).toBeNull();
    expect(screen.getByLabelText("Manual/Automation")).toBeInTheDocument();
  });

  it("실행 유형을 고르면 실행 유형 값으로 알린다", () => {
    const onTestCaseChange = vi.fn();
    renderInfo(
      { executionType: "Manual", isAutomated: false },
      { onTestCaseChange },
    );
    fireEvent.mouseDown(screen.getByLabelText("Manual/Automation"));
    fireEvent.click(
      within(screen.getByRole("listbox")).getByRole("option", {
        name: "Hybrid",
      }),
    );
    expect(onTestCaseChange).toHaveBeenCalledWith("executionType", "Hybrid");
  });

  it.each(["Automation", "Hybrid"])(
    "실행 유형이 %s 이면 연결 케이스·JUnit 칸을 보인다",
    (executionType) => {
      renderInfo({ executionType, isAutomated: false });
      linkedLabels.forEach((label) =>
        expect(screen.getByLabelText(label)).toBeInTheDocument(),
      );
    },
  );

  it("실행 유형이 Manual 이면 isAutomated 가 참이어도 연결 케이스·JUnit 칸을 숨긴다", () => {
    renderInfo({ executionType: "Manual", isAutomated: true });
    linkedLabels.forEach((label) =>
      expect(screen.queryByLabelText(label)).toBeNull(),
    );
  });
});
