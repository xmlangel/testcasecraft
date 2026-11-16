import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({
    t: (key, fallback, vars) =>
      (fallback || key).replace(/\{(\w+)\}/g, (_, k) => vars?.[k] ?? ""),
  }),
}));

import ExecutionProgressBar, {
  computeSegments,
} from "./ExecutionProgressBar.jsx";

describe("ExecutionProgressBar (ICT-491 ex-4)", () => {
  it("통과·실패·차단 비율로 막대를 나누고 진행률을 표시한다", () => {
    const execution = {
      id: "e1",
      totalCount: 10,
      passedCount: 5,
      failedCount: 2,
      skippedCount: 1,
      progress: 80,
    };
    const { container } = render(
      <ExecutionProgressBar execution={execution} />,
    );
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-label",
      "통과 5 · 실패 2 · 차단 1 / 10",
    );
    expect(container.querySelector('[data-segment="PASS"]')).toHaveStyle({
      width: "50%",
    });
    expect(container.querySelector('[data-segment="FAIL"]')).toHaveStyle({
      width: "20%",
    });
  });

  it("개수가 없는 옛 응답은 진행률 하나로 그린다", () => {
    const { container } = render(
      <ExecutionProgressBar execution={{ id: "e2", progress: 30 }} />,
    );
    expect(container.querySelector('[data-segment="DONE"]')).toHaveStyle({
      width: "30%",
    });
    expect(computeSegments({ totalCount: 0 }).total).toBe(0);
  });
});
