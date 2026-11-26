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

// ICT-494 tl-6: 태그·RAG 문서·연결 케이스·JUnit 네 칸을 「연결 항목」 하나로 접는다.
const theme = createTheme();
const t = (_key, fallback) => fallback;

const renderInfo = (testCase, props = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <TestCaseBasicInfo
        testCase={{ name: "tc", tags: ["smoke", "ui"], ...testCase }}
        errors={{}}
        availableTags={[]}
        linkedDocuments={[{ id: "d1", fileName: "spec.pdf" }]}
        ragDocuments={[]}
        linkedTestCases={[]}
        linkedJunitCases={[{ id: "j1", className: "A", name: "b" }]}
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

const summary = () => screen.getByTestId("testcase-link-items-summary");
const fieldLabels = [
  "태그",
  "연결된 RAG 문서",
  "연결된 테스트케이스",
  "연결된 자동화(JUnit) 케이스",
];

describe("TestCaseBasicInfo 연결 항목 접이식 (ICT-494 tl-6)", () => {
  it("처음에는 접혀 있다", () => {
    renderInfo({ executionType: "Automation" });
    expect(summary()).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByLabelText("태그")).not.toBeVisible();
  });

  it("펼치면 네 칸이 보인다", () => {
    renderInfo({ executionType: "Automation" });
    fireEvent.click(summary());
    expect(summary()).toHaveAttribute("aria-expanded", "true");
    const items = screen.getByTestId("testcase-link-items");
    fieldLabels.forEach((label) =>
      expect(within(items).getByLabelText(label)).toBeVisible(),
    );
  });

  it("머리 줄에 항목별 개수를 적는다(없는 항목은 0)", () => {
    renderInfo({ executionType: "Hybrid" });
    expect(screen.getByTestId("testcase-link-items-counts")).toHaveTextContent(
      "태그 2 · RAG 1 · 연결 케이스 0 · JUnit 1",
    );
  });

  it("실행 유형이 Manual 이면 연결 케이스·JUnit 을 칸과 개수에서 모두 뺀다", () => {
    renderInfo({ executionType: "Manual", isAutomated: true });
    expect(screen.getByTestId("testcase-link-items-counts")).toHaveTextContent(
      /^태그 2 · RAG 1$/,
    );
    fireEvent.click(summary());
    expect(screen.queryByLabelText("연결된 테스트케이스")).toBeNull();
    expect(screen.queryByLabelText("연결된 자동화(JUnit) 케이스")).toBeNull();
    expect(screen.getByLabelText("태그")).toBeVisible();
  });

  it("펼쳐서 고친 값은 원래 저장 경로로 나간다", () => {
    const onTagChange = vi.fn();
    renderInfo({ executionType: "Manual", tags: [] }, { onTagChange });
    fireEvent.click(summary());
    const input = screen.getByLabelText("태그");
    fireEvent.change(input, { target: { value: "regression" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onTagChange).toHaveBeenCalledWith(["regression"]);
  });

  it("전제 조건보다 앞에 있다", () => {
    renderInfo({ executionType: "Manual" });
    expect(
      screen
        .getByTestId("testcase-custom-fields")
        .compareDocumentPosition(screen.getByTestId("testcase-conditions")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
