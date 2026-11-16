import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import TestCaseDetails from "./TestCaseDetails.jsx";

// ICT-491 fx-2: 단계 표 폭을 바꿔 가며 배치를 확인한다
let mockWidth = 0;
vi.mock("../../hooks/useElementWidth.js", () => ({
  default: () => [() => {}, mockWidth],
}));

vi.mock("../TestCase/RichMarkdownEditor.jsx", () => ({
  default: ({ testid }) => <div data-testid={testid} />,
}));

vi.mock("../common/MarkdownViewer.jsx", () => ({
  default: ({ content }) => <div>{content}</div>,
}));

const t = (key, fallback) => fallback || key;

const testCase = {
  id: "tc-1",
  name: "로그인 테스트",
  steps: [
    { stepNumber: 1, description: "URL 방문", expectedResult: "로그인 화면" },
    { stepNumber: 2, description: "아이디 입력", expectedResult: "입력 가능" },
  ],
};

const renderDetails = (props = {}) =>
  render(
    <TestCaseDetails
      testCase={testCase}
      t={t}
      stepResults={{
        1: { result: "NOT_RUN", actualResult: "" },
        2: { result: "NOT_RUN", actualResult: "" },
      }}
      onStepChange={vi.fn()}
      {...props}
    />,
  );

describe("TestCaseDetails 단계 표 좁은 칸 배치 (ICT-491 fx-2)", () => {
  beforeEach(() => {
    mockWidth = 0;
  });

  it("폭을 아직 재지 못했으면 실제 결과를 같은 줄에 둔다", () => {
    renderDetails();
    expect(screen.getByTestId("step-table")).toHaveAttribute(
      "data-layout",
      "inline",
    );
    expect(screen.queryByTestId("step-1-actual-row")).not.toBeInTheDocument();
  });

  it("넓은 칸(720px 이상)에서는 실제 결과 열을 둔다", () => {
    mockWidth = 900;
    renderDetails();
    expect(screen.getByTestId("step-table")).toHaveAttribute(
      "data-layout",
      "inline",
    );
    expect(
      screen.getAllByRole("columnheader").map((h) => h.textContent),
    ).toContain("실제 결과");
  });

  it("좁은 칸(720px 미만)에서는 실제 결과를 다음 줄로 내리고 편집기를 한 번만 그린다", () => {
    mockWidth = 520;
    renderDetails();
    expect(screen.getByTestId("step-table")).toHaveAttribute(
      "data-layout",
      "stacked",
    );
    expect(
      screen.getAllByRole("columnheader").map((h) => h.textContent),
    ).not.toContain("실제 결과");
    const row = screen.getByTestId("step-1-actual-row");
    expect(within(row).getByTestId("step-1-actual")).toBeInTheDocument();
    expect(screen.getAllByTestId("step-1-actual")).toHaveLength(1);
    // 판정 버튼은 윗줄에 남는다
    expect(within(row).queryByTestId("step-1-PASS")).not.toBeInTheDocument();
    expect(screen.getByTestId("step-1-PASS")).toBeInTheDocument();
  });

  it("결과 입력이 없는 표는 폭과 관계없이 그대로 둔다", () => {
    mockWidth = 400;
    render(<TestCaseDetails testCase={testCase} t={t} />);
    expect(screen.getByTestId("step-table")).toHaveAttribute(
      "data-layout",
      "inline",
    );
  });
});
