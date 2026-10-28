import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TestCaseDetails from "./TestCaseDetails.jsx";

const t = (key, fallback, options) => {
  if (key === "testResult.steps.actualResultTooLong") {
    return `실제 결과는 ${options?.max || "10,000"}자까지 저장할 수 있습니다.`;
  }
  return fallback || key;
};

const testCase = {
  id: "tc-1",
  name: "로그인 테스트",
  description: "사용자 로그인",
  steps: [
    {
      stepNumber: 1,
      action: "URL 방문",
      expected: "로그인 화면 표시",
    },
    {
      stepNumber: 2,
      action: "아이디 입력",
      expected: "입력 가능",
    },
  ],
};

// RichMarkdownEditor 모킹: error와 helperText를 화면에 반영하도록
vi.mock("../TestCase/RichMarkdownEditor.jsx", () => ({
  default: (props) => {
    const {
      value,
      onChange,
      disabled,
      maxLength,
      error,
      hideHelperText,
      helperText,
    } = props;
    return (
      <div data-testid="markdown-editor">
        <textarea
          data-testid="markdown-input"
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled || false}
          maxLength={maxLength}
          placeholder="마크다운 입력"
          style={{ borderColor: error ? "red" : "normal" }}
        />
        {error && !hideHelperText && (
          <div data-testid="char-limit-error" style={{ color: "red" }}>
            {helperText || "오류"}
          </div>
        )}
      </div>
    );
  },
}));

vi.mock("../common/MarkdownViewer.jsx", () => ({
  default: ({ content }) => <div data-testid="markdown-viewer">{content}</div>,
}));

const renderWithStepResults = (props = {}) =>
  render(
    <TestCaseDetails
      testCase={testCase}
      t={t}
      stepResults={{
        1: { result: "NOT_RUN", actualResult: "" },
        2: { result: "NOT_RUN", actualResult: "" },
      }}
      onStepChange={vi.fn()}
      stepInputDisabled={false}
      {...props}
    />,
  );

describe("TestCaseDetails 스텝 실제 결과 입력 (ICT-472)", () => {
  it("스텝마다 마크다운 에디터를 렌더링한다", () => {
    renderWithStepResults();
    const editors = screen.getAllByTestId("markdown-editor");
    expect(editors.length).toBeGreaterThanOrEqual(2);
  });

  it("실제 결과를 입력할 수 있다", () => {
    const mockOnStepChange = vi.fn();
    renderWithStepResults({ onStepChange: mockOnStepChange });
    const inputs = screen.getAllByTestId("markdown-input");

    fireEvent.change(inputs[0], {
      target: { value: "로그인 화면이 보임" },
    });

    expect(mockOnStepChange).toHaveBeenCalledWith(1, {
      actualResult: "로그인 화면이 보임",
    });
  });

  it("10,000자 이하일 때는 오류 안내가 없다", () => {
    const text = "x".repeat(10000);
    renderWithStepResults({
      stepResults: {
        1: { result: "NOT_RUN", actualResult: text },
        2: { result: "NOT_RUN", actualResult: "" },
      },
    });

    // 오류 메시지가 없어야 함
    expect(screen.queryByTestId("char-limit-error")).not.toBeInTheDocument();
  });

  it("10,001자 이상일 때 오류 안내와 helperText가 표시된다", () => {
    const text = "x".repeat(10001);
    renderWithStepResults({
      stepResults: {
        1: { result: "NOT_RUN", actualResult: text },
        2: { result: "NOT_RUN", actualResult: "" },
      },
    });

    // 오류 메시지가 표시되어야 함
    const errorMsg = screen.getByTestId("char-limit-error");
    expect(errorMsg).toBeInTheDocument();
    expect(errorMsg).toHaveTextContent("10,000");
    expect(errorMsg).toHaveTextContent("자까지 저장");
  });

  it("여러 줄 실제 결과를 입력할 수 있다", () => {
    const mockOnStepChange = vi.fn();
    renderWithStepResults({ onStepChange: mockOnStepChange });
    const input = screen.getAllByTestId("markdown-input")[0];

    fireEvent.change(input, {
      target: { value: "첫 줄\n둘째 줄" },
    });

    expect(mockOnStepChange).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        actualResult: expect.stringContaining("첫 줄"),
      }),
    );
  });

  it("빈 실제 결과를 저장할 수 있다", () => {
    const mockOnStepChange = vi.fn();
    renderWithStepResults({
      stepResults: {
        1: { result: "PASS", actualResult: "기존 메모" },
        2: { result: "NOT_RUN", actualResult: "" },
      },
      onStepChange: mockOnStepChange,
    });
    const input = screen.getAllByTestId("markdown-input")[0];

    // 기존 내용을 모두 지운다
    fireEvent.change(input, { target: { value: "" } });

    expect(mockOnStepChange).toHaveBeenCalledWith(1, {
      actualResult: "",
    });
  });

  it("10,001자를 입력하면 textarea에 error 스타일이 적용된다", () => {
    const text = "x".repeat(10001);
    renderWithStepResults({
      stepResults: {
        1: { result: "NOT_RUN", actualResult: text },
        2: { result: "NOT_RUN", actualResult: "" },
      },
    });

    const input = screen.getAllByTestId("markdown-input")[0];
    // 모킹된 컴포넌트에서 error prop이 true일 때 borderColor: red를 적용했음
    expect(input).toHaveStyle("borderColor: red");
  });
});
