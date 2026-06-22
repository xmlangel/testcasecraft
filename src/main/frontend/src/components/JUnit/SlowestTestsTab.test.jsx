import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { getSlowestTestCases } = vi.hoisted(() => ({
  getSlowestTestCases: vi.fn(),
}));
vi.mock("../../services/junitResultService", () => ({
  default: { getSlowestTestCases },
}));
vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (k, f) => f || k }),
}));

import SlowestTestsTab from "./SlowestTestsTab.jsx";

describe("SlowestTestsTab", () => {
  beforeEach(() => {
    getSlowestTestCases.mockReset();
  });

  it("느린 테스트 목록을 로드해 이름과 실행시간을 렌더한다", async () => {
    getSlowestTestCases.mockResolvedValue({
      slowestCases: [
        { id: "c1", name: "느린케이스", className: "C", time: 12.5 },
      ],
    });
    render(<SlowestTestsTab testResultId="tr1" onEditTestCase={vi.fn()} />);
    expect(await screen.findByText("느린케이스")).toBeInTheDocument();
    // formatDuration(12.5) => 12.50s
    expect(screen.getByText("12.50s")).toBeInTheDocument();
    expect(getSlowestTestCases).toHaveBeenCalledWith("tr1", 20);
  });

  it("편집 버튼 클릭 시 onEditTestCase 를 호출한다", async () => {
    const onEditTestCase = vi.fn();
    getSlowestTestCases.mockResolvedValue({
      slowestCases: [{ id: "c1", name: "tc", className: "C", time: 1 }],
    });
    const { container } = render(
      <SlowestTestsTab testResultId="tr1" onEditTestCase={onEditTestCase} />,
    );
    await screen.findByText("tc");
    fireEvent.click(container.querySelector("button"));
    expect(onEditTestCase).toHaveBeenCalled();
  });

  it("데이터가 없으면 안내 메시지를 보여준다", async () => {
    getSlowestTestCases.mockResolvedValue({ slowestCases: [] });
    render(<SlowestTestsTab testResultId="tr1" onEditTestCase={vi.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByText("junit.detail.noExecutionTimeData"),
      ).toBeInTheDocument(),
    );
  });
});
