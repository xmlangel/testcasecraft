import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StepResultsSummary from "./StepResultsSummary.jsx";

const t = (key, fallback) => fallback || key;

describe("StepResultsSummary (ICT-469)", () => {
  it("스텝 결과가 없으면 아무것도 렌더링하지 않는다", () => {
    const { container } = render(<StepResultsSummary steps={null} t={t} />);
    expect(container.firstChild).toBeNull();
  });

  it("스텝이 없으면 아무것도 렌더링하지 않는다", () => {
    const { container } = render(<StepResultsSummary steps={[]} t={t} />);
    expect(container.firstChild).toBeNull();
  });

  it("기본 모드에서 스텝별로 표를 표시한다", () => {
    const steps = [
      {
        stepNumber: 1,
        description: "로그인",
        expectedResult: "홈 화면",
        result: "PASS",
        actualResult: "",
      },
      {
        stepNumber: 2,
        description: "저장",
        expectedResult: "알림",
        result: "FAIL",
        actualResult: "반응 없음",
      },
    ];
    render(<StepResultsSummary steps={steps} t={t} compact={false} />);

    expect(screen.getByTestId("step-results-table")).toBeInTheDocument();
    expect(screen.getByText("로그인")).toBeInTheDocument();
    expect(screen.getByText("저장")).toBeInTheDocument();
    expect(screen.getByText("반응 없음")).toBeInTheDocument();
  });

  it("compact 모드에서 결과별 개수를 칩으로 표시한다", () => {
    const steps = [
      { stepNumber: 1, result: "PASS" },
      { stepNumber: 2, result: "PASS" },
      { stepNumber: 3, result: "FAIL" },
      { stepNumber: 4, result: "BLOCKED" },
    ];
    render(<StepResultsSummary steps={steps} t={t} compact={true} />);

    expect(screen.getByTestId("step-results-summary")).toBeInTheDocument();
    expect(screen.getByText("PASS 2")).toBeInTheDocument();
    expect(screen.getByText("FAIL 1")).toBeInTheDocument();
    expect(screen.getByText("BLOCKED 1")).toBeInTheDocument();
  });

  it("compact 모드에서 PASS가 아닌 스텝만 줄 단위로 표시한다", () => {
    const steps = [
      { stepNumber: 1, result: "PASS" },
      { stepNumber: 2, result: "FAIL" },
      { stepNumber: 3, result: "BLOCKED" },
    ];
    render(<StepResultsSummary steps={steps} t={t} compact={true} />);

    expect(screen.getByText(/#2 FAIL/)).toBeInTheDocument();
    expect(screen.getByText(/#3 BLOCKED/)).toBeInTheDocument();
    expect(screen.queryByText(/#1 PASS/)).toBeNull();
  });

  it("compact 모드에서 PASS가 아닌 스텝의 실제 결과를 함께 표시한다", () => {
    const steps = [
      { stepNumber: 1, result: "FAIL", actualResult: "예상과 다름" },
      { stepNumber: 2, result: "BLOCKED", actualResult: "" },
    ];
    render(<StepResultsSummary steps={steps} t={t} compact={true} />);

    expect(screen.getByText(/#1 FAIL · 예상과 다름/)).toBeInTheDocument();
    expect(screen.getByText(/#2 BLOCKED/)).toBeInTheDocument();
  });

  it("스텝 번호가 순서대로 표시된다", () => {
    const steps = [
      { stepNumber: 3, result: "PASS" },
      { stepNumber: 1, result: "FAIL" },
      { stepNumber: 2, result: "BLOCKED" },
    ];
    render(<StepResultsSummary steps={steps} t={t} compact={false} />);

    const rows = screen.getAllByRole("row");
    // 헤더 + 3개 행 = 4행
    expect(rows).toHaveLength(4);
    expect(rows[1]).toHaveTextContent("1");
    expect(rows[2]).toHaveTextContent("2");
    expect(rows[3]).toHaveTextContent("3");
  });

  it("결과 상태별 칩 색상이 올바르다", () => {
    const steps = [
      { stepNumber: 1, result: "PASS" },
      { stepNumber: 2, result: "FAIL" },
      { stepNumber: 3, result: "BLOCKED" },
      { stepNumber: 4, result: "NOT_RUN" },
    ];
    render(<StepResultsSummary steps={steps} t={t} compact={false} />);

    expect(screen.getByText("PASS")).toBeInTheDocument();
    expect(screen.getByText("FAIL")).toBeInTheDocument();
    expect(screen.getByText("BLOCKED")).toBeInTheDocument();
    expect(screen.getByText("NOT_RUN")).toBeInTheDocument();
  });

  describe("cards 모드 (ICT-475)", () => {
    it("스텝마다 카드를 한 장씩 스텝 번호 순서로 표시한다", () => {
      const steps = [
        { stepNumber: 2, result: "FAIL", actualResult: "반응 없음" },
        { stepNumber: 1, result: "PASS", actualResult: "" },
        { stepNumber: 3, result: "BLOCKED", actualResult: "선행 스텝 실패" },
      ];
      render(<StepResultsSummary steps={steps} t={t} cards />);

      expect(screen.getByTestId("step-results-cards")).toBeInTheDocument();
      const cards = screen.getAllByTestId("step-result-card");
      expect(cards).toHaveLength(3);
      expect(cards[0]).toHaveTextContent("Step 1");
      expect(cards[0]).toHaveTextContent("PASS");
      expect(cards[1]).toHaveTextContent("Step 2");
      expect(cards[1]).toHaveTextContent("FAIL");
      expect(cards[1]).toHaveTextContent("반응 없음");
      expect(cards[2]).toHaveTextContent("BLOCKED");
    });

    it("PASS 스텝도 카드로 표시한다", () => {
      const steps = [{ stepNumber: 1, result: "PASS", actualResult: "정상" }];
      render(<StepResultsSummary steps={steps} t={t} cards />);

      expect(screen.getByText("Step 1")).toBeInTheDocument();
      expect(screen.getByText("PASS")).toBeInTheDocument();
      expect(screen.getByText(/정상/)).toBeInTheDocument();
    });

    it("결과가 없는 스텝은 NOT_RUN 으로 표시하고 실제 결과 줄을 생략한다", () => {
      const steps = [{ stepNumber: 1 }];
      render(<StepResultsSummary steps={steps} t={t} cards />);

      expect(screen.getByText("NOT_RUN")).toBeInTheDocument();
      expect(screen.queryByText(/실제 결과/)).toBeNull();
    });

    it("요약형 요소를 함께 그리지 않는다", () => {
      const steps = [{ stepNumber: 1, result: "FAIL" }];
      render(<StepResultsSummary steps={steps} t={t} cards />);

      expect(screen.queryByTestId("step-results-summary")).toBeNull();
      expect(screen.queryByTestId("step-results-table")).toBeNull();
    });
  });
});
