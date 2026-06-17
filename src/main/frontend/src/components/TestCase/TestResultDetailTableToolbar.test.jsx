import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// DataGrid 툴바 컴포넌트는 grid API 컨텍스트가 필요하므로 스텁으로 모킹.
// GridToolbarExport 는 printOptions/csvOptions(파일명에 format() 호출, pageStyle)을
// 받으므로, 렌더만 되어도 toolbar 의 format/GRID_PRINT_PAGE_STYLE 참조가 정상임을 보장한다.
vi.mock("@mui/x-data-grid", () => ({
  GridToolbarContainer: ({ children }) => (
    <div data-testid="toolbar">{children}</div>
  ),
  GridToolbarColumnsButton: () => <span>cols</span>,
  GridToolbarFilterButton: () => <span>filter</span>,
  GridToolbarDensitySelector: () => <span>density</span>,
  GridToolbarExport: (props) => (
    <span
      data-testid="grid-export"
      data-filename={props.printOptions?.fileName}
    >
      export
    </span>
  ),
}));

import TestResultDetailTableToolbar from "./TestResultDetailTableToolbar.jsx";

const t = (key, fallback) => fallback || key;

const setup = (overrides = {}) => {
  const props = {
    onColumnSettingsClick: vi.fn(),
    onColumnOrderChangeClick: vi.fn(),
    onResetClick: vi.fn(),
    onJiraStatusCheck: vi.fn(),
    onExportClick: vi.fn(),
    jiraConfig: { id: 1 },
    jiraStatusLoading: false,
    hasJiraTargets: true,
    activeProject: { name: "P" },
    t,
    ...overrides,
  };
  render(<TestResultDetailTableToolbar {...props} />);
  return props;
};

describe("TestResultDetailTableToolbar", () => {
  it("렌더 시 throw 없이 GridToolbarExport 가 파일명(format 적용)을 받는다", () => {
    // 회귀 가드: format/ko/GRID_PRINT_PAGE_STYLE 누락 시 여기서 ReferenceError 로 실패
    setup();
    const exp = screen.getByTestId("grid-export");
    expect(exp).toBeInTheDocument();
    // 파일명에 프로젝트명이 들어가고 format(yyyyMMdd) 가 평가됨
    expect(exp.getAttribute("data-filename")).toMatch(/테스트결과_P_\d{8}/);
  });

  it("커스텀 버튼 클릭 시 각 콜백을 호출한다", () => {
    const p = setup();
    fireEvent.click(screen.getByText("컬럼 설정"));
    expect(p.onColumnSettingsClick).toHaveBeenCalled();
    fireEvent.click(screen.getByText("순서 변경"));
    expect(p.onColumnOrderChangeClick).toHaveBeenCalled();
    fireEvent.click(screen.getByText("기본값"));
    expect(p.onResetClick).toHaveBeenCalled();
    fireEvent.click(screen.getByText("고급 내보내기"));
    expect(p.onExportClick).toHaveBeenCalled();
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
