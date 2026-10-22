import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../../context/I18nContext", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));

import TestExecutionFilterPanel from "./TestExecutionFilterPanel.jsx";

const EMPTY = {
  caseId: "",
  name: "",
  priority: [],
  result: [],
  executedBy: "",
  executionDate: "",
  jiraIssueKey: "",
  notes: "",
  tags: [],
};

describe("TestExecutionFilterPanel", () => {
  it("ICT-435: 케이스 아이디 입력값을 caseId 필드로 넘긴다", () => {
    const onFilterChange = vi.fn();
    render(
      <TestExecutionFilterPanel
        filters={{ ...EMPTY, caseId: "TC-0001" }}
        onFilterChange={onFilterChange}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("케이스 아이디");
    expect(input).toHaveValue("TC-0001");

    fireEvent.change(input, { target: { value: "TC-0001, TC-0002" } });
    expect(onFilterChange).toHaveBeenCalledWith("caseId", "TC-0001, TC-0002");
  });

  it("케이스 아이디만 입력돼도 필터 적용 중으로 보고 초기화를 연다", () => {
    render(
      <TestExecutionFilterPanel
        filters={{ ...EMPTY, caseId: "TC-0001" }}
        onFilterChange={vi.fn()}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByText(/적용 중/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "초기화" })).toBeEnabled();
  });
});
