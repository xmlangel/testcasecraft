import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// 메모 칸은 마크다운 에디터다. 테스트에서는 값과 onChange 만 쓰는 textarea 로 바꿔 끼운다
vi.mock("../TestCase/RichMarkdownEditor.jsx", () => ({
  default: ({ value, onChange, testid }) =>
    testid === "pass-all-memo" ? (
      <textarea
        data-testid={testid}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : null,
}));
vi.mock("../common/MarkdownViewer.jsx", () => ({ default: () => null }));

import TestCaseDetails from "./TestCaseDetails.jsx";

const t = (key, fallback) => fallback || key;
const testCase = {
  name: "케이스",
  steps: [{ stepNumber: 1, description: "a", expectedResult: "b" }],
};

const renderDetails = (onPassAllSteps) =>
  render(
    <TestCaseDetails
      testCase={testCase}
      t={t}
      stepResults={{}}
      onStepChange={() => {}}
      onPassAllSteps={onPassAllSteps}
    />,
  );

describe("TestCaseDetails 모든 스텝 Pass 입력 창 (ICT-479)", () => {
  it("버튼을 누르면 메모 입력 창이 열리고, 빈 입력이면 적용할 수 없다", () => {
    const onPassAllSteps = vi.fn();
    renderDetails(onPassAllSteps);
    expect(screen.queryByTestId("pass-all-memo")).toBeNull();

    fireEvent.click(screen.getByTestId("pass-all-steps"));

    expect(screen.getByTestId("pass-all-memo")).toBeTruthy();
    expect(screen.getByTestId("pass-all-confirm").disabled).toBe(true);
    expect(onPassAllSteps).not.toHaveBeenCalled();
  });

  it("메모를 입력하고 적용하면 그 메모로 모든 스텝 Pass 를 요청한다", () => {
    const onPassAllSteps = vi.fn();
    renderDetails(onPassAllSteps);
    fireEvent.click(screen.getByTestId("pass-all-steps"));
    fireEvent.change(screen.getByTestId("pass-all-memo"), {
      target: { value: "  회귀 확인 완료  " },
    });
    fireEvent.click(screen.getByTestId("pass-all-confirm"));
    expect(onPassAllSteps).toHaveBeenCalledWith("회귀 확인 완료");
  });

  it("취소하면 아무것도 바꾸지 않는다", () => {
    const onPassAllSteps = vi.fn();
    renderDetails(onPassAllSteps);
    fireEvent.click(screen.getByTestId("pass-all-steps"));
    fireEvent.change(screen.getByTestId("pass-all-memo"), {
      target: { value: "메모" },
    });
    fireEvent.click(screen.getByTestId("pass-all-cancel"));
    expect(onPassAllSteps).not.toHaveBeenCalled();
  });

  it("입력 창 안에서 누른 키는 화면 전체 단축키로 올라가지 않는다", () => {
    const onWindowKey = vi.fn();
    window.addEventListener("keydown", onWindowKey);
    try {
      renderDetails(vi.fn());
      fireEvent.click(screen.getByTestId("pass-all-steps"));
      fireEvent.keyDown(screen.getByTestId("pass-all-cancel"), { key: "f" });
      fireEvent.keyDown(screen.getByTestId("pass-all-memo"), { key: "p" });
      expect(onWindowKey).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener("keydown", onWindowKey);
    }
  });
});
