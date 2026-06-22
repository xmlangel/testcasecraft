import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { getFailedTestCases } = vi.hoisted(() => ({
  getFailedTestCases: vi.fn(),
}));
vi.mock("../../services/junitResultService", () => ({
  default: { getFailedTestCases },
}));
vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (k, f) => f || k }),
}));
vi.mock("./TestCaseDetailPanel", () => ({ default: () => null }));

import FailedTestsTab from "./FailedTestsTab.jsx";

describe("FailedTestsTab", () => {
  beforeEach(() => getFailedTestCases.mockReset());

  it("실패 케이스 목록(이름·클래스)을 로드해 렌더한다", async () => {
    getFailedTestCases.mockResolvedValue({
      failedCases: [
        { id: "f1", name: "실패케이스", className: "com.C", status: "FAILED" },
      ],
    });
    render(<FailedTestsTab testResultId="tr1" onEditTestCase={vi.fn()} />);
    expect(await screen.findByText("실패케이스")).toBeInTheDocument();
    expect(screen.getByText("com.C")).toBeInTheDocument();
    expect(getFailedTestCases).toHaveBeenCalledWith("tr1");
  });

  it("편집 아이콘 클릭 시 onEditTestCase 를 호출한다", async () => {
    const onEditTestCase = vi.fn();
    getFailedTestCases.mockResolvedValue({
      failedCases: [{ id: "f1", name: "tc", className: "C", status: "ERROR" }],
    });
    render(
      <FailedTestsTab testResultId="tr1" onEditTestCase={onEditTestCase} />,
    );
    await screen.findByText("tc");
    fireEvent.click(screen.getByTestId("EditIcon").closest("button"));
    expect(onEditTestCase).toHaveBeenCalled();
  });

  it("실패 케이스가 없으면 안내 메시지를 보여준다", async () => {
    getFailedTestCases.mockResolvedValue({ failedCases: [] });
    render(<FailedTestsTab testResultId="tr1" onEditTestCase={vi.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByText("junit.detail.noFailedTests"),
      ).toBeInTheDocument(),
    );
  });
});
