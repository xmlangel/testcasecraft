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

  // ICT-513: 실행 상세는 이 패널을 「필터」 아코디언 안에 넣는다. 안쪽에 또 「필터」
  // 머리와 접기 단추가 있으면 두 겹이 된다.
  it("embedded 이면 안쪽 「필터」 머리와 접기 단추 없이 입력란을 바로 보인다", () => {
    render(
      <TestExecutionFilterPanel
        embedded
        filters={EMPTY}
        onFilterChange={vi.fn()}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );
    expect(screen.queryByText("필터")).toBeNull();
    // 적용·초기화 두 단추만 있고 접기 단추는 없다
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(
      expect.not.arrayContaining([""]),
    );
    expect(screen.getByLabelText("케이스 아이디")).toBeVisible();
    expect(screen.getByRole("button", { name: "적용" })).toBeInTheDocument();
  });

  it("embedded 가 아니면 예전처럼 머리와 접기 단추가 있다 (하위 호환)", () => {
    render(
      <TestExecutionFilterPanel
        filters={EMPTY}
        onFilterChange={vi.fn()}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );
    expect(screen.getByText("필터")).toBeInTheDocument();
  });
});

describe("TestExecutionFilterPanel 펼치기 버튼 (ICT-511)", () => {
  it("아이콘만 있는 펼치기 버튼에 이름과 펼침 상태가 있다", () => {
    render(
      <TestExecutionFilterPanel
        filters={EMPTY}
        onFilterChange={vi.fn()}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );
    const toggle = screen.getByTestId("execution-filter-toggle");
    const initiallyExpanded = toggle.getAttribute("aria-expanded") === "true";
    expect(toggle).toHaveAccessibleName(initiallyExpanded ? "접기" : "펼치기");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", String(!initiallyExpanded));
    expect(toggle).toHaveAccessibleName(initiallyExpanded ? "펼치기" : "접기");
  });
});
