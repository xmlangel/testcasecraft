import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../TestCase/RichMarkdownEditor.jsx", () => ({ default: () => null }));
vi.mock("../common/MarkdownViewer.jsx", () => ({ default: () => null }));

import TestCaseDetails from "./TestCaseDetails.jsx";

const t = (key, fallback) => fallback || key;
const testCase = {
  name: "케이스",
  steps: [{ stepNumber: 1, description: "a", expectedResult: "b" }],
};

const renderDetails = (props) =>
  render(
    <TestCaseDetails
      testCase={testCase}
      t={t}
      stepResults={{}}
      onStepChange={() => {}}
      onPassAllSteps={() => {}}
      {...props}
    />,
  );

describe("TestCaseDetails 모든 스텝 Pass 메모 (ICT-479)", () => {
  it("메모 필수가 아니면 메모 칸을 그리지 않는다", () => {
    renderDetails({ onMemoChange: () => {} });
    expect(screen.queryByTestId("pass-all-memo")).toBeNull();
  });

  it("메모 필수면 메모 칸을 보여 주고 입력값을 넘긴다", () => {
    const onMemoChange = vi.fn();
    renderDetails({ memoRequired: true, memo: "", onMemoChange });
    const input = screen.getByTestId("pass-all-memo");
    fireEvent.change(input, { target: { value: "확인함" } });
    expect(onMemoChange).toHaveBeenCalledWith("확인함");
  });

  it("보기 전용이면 메모 칸을 그리지 않는다", () => {
    renderDetails({
      memoRequired: true,
      onMemoChange: () => {},
      stepInputDisabled: true,
    });
    expect(screen.queryByTestId("pass-all-memo")).toBeNull();
  });
});
