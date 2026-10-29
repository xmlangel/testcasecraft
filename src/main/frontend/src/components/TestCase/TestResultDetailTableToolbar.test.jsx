import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// DataGrid 툴바 컴포넌트는 grid API 컨텍스트가 필요하므로 스텁으로 모킹.
// GridToolbarExport 는 툴바에서 렌더되면 안 되므로(ICT-476) 표식만 남긴 스텁으로 둔다.
vi.mock("@mui/x-data-grid", () => ({
  GridToolbarContainer: ({ children }) => (
    <div data-testid="toolbar">{children}</div>
  ),
  GridToolbarColumnsButton: () => <span>cols</span>,
  GridToolbarFilterButton: () => <span>filter</span>,
  GridToolbarDensitySelector: () => <span>density</span>,
  GridToolbarExport: () => <span data-testid="grid-export">export</span>,
}));

import TestResultDetailTableToolbar from "./TestResultDetailTableToolbar.jsx";

const t = (key, fallback) => fallback || key;

const setup = (overrides = {}) => {
  const props = {
    onColumnSettingsClick: vi.fn(),
    onColumnOrderChangeClick: vi.fn(),
    onResetClick: vi.fn(),
    onJiraStatusCheck: vi.fn(),
    jiraConfig: { id: 1 },
    jiraStatusLoading: false,
    hasJiraTargets: true,
    t,
    ...overrides,
  };
  render(<TestResultDetailTableToolbar {...props} />);
  return props;
};

describe("TestResultDetailTableToolbar", () => {
  it("툴바에 내보내기 버튼을 두지 않는다 (ICT-476)", () => {
    // 내보내기는 표 위 버튼 하나로 통일했다. MUI EXPORT·고급 내보내기가 다시 생기면 실패한다.
    setup();
    expect(screen.queryByTestId("grid-export")).not.toBeInTheDocument();
    expect(screen.queryByText(/내보내기/)).not.toBeInTheDocument();
  });

  it("커스텀 버튼 클릭 시 각 콜백을 호출한다", () => {
    const p = setup();
    fireEvent.click(screen.getByText("컬럼 설정"));
    expect(p.onColumnSettingsClick).toHaveBeenCalled();
    fireEvent.click(screen.getByText("순서 변경"));
    expect(p.onColumnOrderChangeClick).toHaveBeenCalled();
    fireEvent.click(screen.getByText("기본값"));
    expect(p.onResetClick).toHaveBeenCalled();
    fireEvent.click(screen.getByText("JIRA 상태 체크"));
    expect(p.onJiraStatusCheck).toHaveBeenCalled();
  });

  it("JIRA 설정이 없으면 상태 체크 버튼이 비활성화된다", () => {
    setup({ jiraConfig: null });
    expect(screen.getByText("JIRA 상태 체크").closest("button")).toBeDisabled();
  });

  it("연결된 JIRA 타깃이 없어도 비활성화된다", () => {
    setup({ hasJiraTargets: false });
    expect(screen.getByText("JIRA 상태 체크").closest("button")).toBeDisabled();
  });
});
