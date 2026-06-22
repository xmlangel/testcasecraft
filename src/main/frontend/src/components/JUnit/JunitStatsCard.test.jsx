import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import JunitStatsCard from "./JunitStatsCard.jsx";

const t = (key) => key;
const testResult = { totalTests: 10, failures: 1, errors: 1, skipped: 2 };

describe("JunitStatsCard", () => {
  it("통과 수(=total-fail-error-skip)와 각 통계를 렌더링한다", () => {
    render(
      <JunitStatsCard
        testResult={testResult}
        expandedSections={{ stats: true }}
        handleAccordionChange={() => () => {}}
        t={t}
      />,
    );
    // 통과 6, 실패 1, 에러 1, 스킵 2
    expect(screen.getByText("6")).toBeInTheDocument();
    // 성공률 = (10-1-1)/10*100 = 80.0%
    expect(screen.getByText("80.0%")).toBeInTheDocument();
  });

  it("totalTests 0 이면 성공률 0.0%", () => {
    render(
      <JunitStatsCard
        testResult={{ totalTests: 0, failures: 0, errors: 0, skipped: 0 }}
        expandedSections={{ stats: true }}
        handleAccordionChange={() => () => {}}
        t={t}
      />,
    );
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("onAccordionChange 핸들러를 받아 렌더에 사용한다 (throw 없이 렌더)", () => {
    const handleAccordionChange = vi.fn(() => () => {});
    render(
      <JunitStatsCard
        testResult={testResult}
        expandedSections={{ stats: false }}
        handleAccordionChange={handleAccordionChange}
        t={t}
      />,
    );
    // 접힌 상태에서도 요약 칩이 렌더된다
    expect(handleAccordionChange).toHaveBeenCalledWith("stats");
  });
});
