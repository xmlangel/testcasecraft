import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// 컨텍스트·훅·무거운 자식 모킹 — 폴더 접기/펼치기 UI만 검증한다
vi.mock("../../context/I18nContext.jsx", () => ({
  useI18n: () => ({ t: (key, fallback) => fallback || key }),
}));
vi.mock("../../hooks/useDateFormatter", () => ({
  useDateFormatter: () => ({
    formatDate: () => "2026-08-13 10:00",
    formatDateOnly: () => "08-13",
  }),
}));
vi.mock("./JiraIssueLink.jsx", () => ({ default: () => null }));

import TestExecutionTable from "./TestExecutionTable.jsx";

const folder = (id, name, level = 0) => ({
  id,
  name,
  type: "folder",
  level,
  parentId: null,
});
const testcase = (id, name, parentId, level = 1) => ({
  id,
  name,
  type: "testcase",
  level,
  parentId,
  parentName: "부모폴더",
  displayId: `TC-${id}`,
});

const renderTable = (props = {}) => {
  const defaults = {
    visibleData: [folder("f1", "로그인"), testcase("tc1", "로그인 성공", "f1")],
    resultsMap: new Map(),
    totalItems: 1,
    hasMore: false,
    loadMore: vi.fn(),
    handleOpenResultForm: vi.fn(),
    handleShowPrevResults: vi.fn(),
    handleAttachmentClick: vi.fn(),
    canEnterResults: true,
    selectedTestCases: new Set(),
    onSelectionChange: vi.fn(),
    collapsedFolders: new Set(),
    folderResultCounts: new Map([
      ["f1", { total: 1, PASS: 1, FAIL: 0, BLOCKED: 0, NOTRUN: 0 }],
    ]),
    collapsedFolderCount: 0,
    onToggleFolder: vi.fn(),
    onExpandAllFolders: vi.fn(),
    onCollapseAllFolders: vi.fn(),
  };
  const merged = { ...defaults, ...props };
  return { ...render(<TestExecutionTable {...merged} />), props: merged };
};

describe("TestExecutionTable 폴더 접기/펼치기", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("폴더 행에만 토글 버튼이 붙는다", () => {
    renderTable();
    expect(
      screen.getByTestId("execution-table-folder-toggle-f1"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("execution-table-folder-toggle-tc1"),
    ).toBeNull();
  });

  it("토글을 누르면 그 폴더 ID로 콜백이 불린다", () => {
    const { props } = renderTable();
    fireEvent.click(screen.getByTestId("execution-table-folder-toggle-f1"));
    expect(props.onToggleFolder).toHaveBeenCalledWith("f1");
  });

  it("펼친 폴더는 aria-expanded=true, 접힌 폴더는 false", () => {
    const { unmount } = renderTable();
    expect(
      screen.getByTestId("execution-table-folder-toggle-f1"),
    ).toHaveAttribute("aria-expanded", "true");
    unmount();

    renderTable({ collapsedFolders: new Set(["f1"]), collapsedFolderCount: 1 });
    expect(
      screen.getByTestId("execution-table-folder-toggle-f1"),
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("접힌 폴더에는 숨은 케이스 수를 표시한다", () => {
    renderTable({
      visibleData: [folder("f1", "로그인")],
      collapsedFolders: new Set(["f1"]),
      collapsedFolderCount: 1,
      folderResultCounts: new Map([
        ["f1", { total: 7, PASS: 4, FAIL: 2, BLOCKED: 1, NOTRUN: 0 }],
      ]),
    });
    expect(
      screen.getByTestId("execution-table-folder-count-f1"),
    ).toHaveTextContent("7");
  });

  it("접힌 폴더에 총계 다음으로 성공·실패·차단됨·미실행 건수를 붙인다", () => {
    renderTable({
      visibleData: [folder("f1", "로그인")],
      collapsedFolders: new Set(["f1"]),
      collapsedFolderCount: 1,
      folderResultCounts: new Map([
        ["f1", { total: 7, PASS: 4, FAIL: 2, BLOCKED: 1, NOTRUN: 0 }],
      ]),
    });
    expect(
      screen.getByTestId("execution-table-folder-pass-f1"),
    ).toHaveTextContent("4");
    expect(
      screen.getByTestId("execution-table-folder-fail-f1"),
    ).toHaveTextContent("2");
    expect(
      screen.getByTestId("execution-table-folder-blocked-f1"),
    ).toHaveTextContent("1");
    // 0건도 칸을 남긴다 — 순서가 고정돼야 눈이 자리로 읽는다
    expect(
      screen.getByTestId("execution-table-folder-notrun-f1"),
    ).toHaveTextContent("0");
  });

  it("판정 집계가 없으면 건수 칩도 붙지 않는다", () => {
    renderTable({
      visibleData: [folder("f1", "로그인")],
      collapsedFolders: new Set(["f1"]),
      collapsedFolderCount: 1,
      folderResultCounts: new Map(),
    });
    expect(screen.queryByTestId("execution-table-folder-count-f1")).toBeNull();
    expect(screen.queryByTestId("execution-table-folder-pass-f1")).toBeNull();
  });

  it("펼친 상태에서는 건수 칩을 붙이지 않는다", () => {
    renderTable();
    expect(screen.queryByTestId("execution-table-folder-count-f1")).toBeNull();
  });

  it("모두 펼치기·접기 버튼이 콜백을 부른다", () => {
    const { props } = renderTable({
      collapsedFolders: new Set(["f1"]),
      collapsedFolderCount: 1,
    });
    fireEvent.click(screen.getByTestId("execution-table-expand-all"));
    fireEvent.click(screen.getByTestId("execution-table-collapse-all"));
    expect(props.onExpandAllFolders).toHaveBeenCalled();
    expect(props.onCollapseAllFolders).toHaveBeenCalled();
  });

  it("접힌 폴더가 없으면 모두 펼치기는 비활성", () => {
    renderTable({ collapsedFolderCount: 0 });
    expect(screen.getByTestId("execution-table-expand-all")).toBeDisabled();
    expect(screen.getByTestId("execution-table-collapse-all")).toBeEnabled();
  });

  it("필터가 걸려 있으면 두 버튼 모두 비활성", () => {
    renderTable({ treeControlsDisabled: true, collapsedFolderCount: 2 });
    expect(screen.getByTestId("execution-table-expand-all")).toBeDisabled();
    expect(screen.getByTestId("execution-table-collapse-all")).toBeDisabled();
  });

  it("첨부 유무와 관계없이 작업 열의 칸 수가 같다", () => {
    // 첨부 아이콘이 있는 행만 묶음이 넓어지면 가운데 정렬 때문에 입력 버튼이 세로로 어긋난다
    const cellChildCount = () =>
      screen.getByTestId("execution-table-result-button-tc1").parentElement
        .children.length;

    const { unmount } = renderTable();
    expect(
      screen.queryByTestId("execution-table-attachments-button-r1"),
    ).toBeNull();
    const withoutAttachment = cellChildCount();
    unmount();

    renderTable({
      resultsMap: new Map([
        ["tc1", { id: "r1", result: "PASS", attachmentCount: 2 }],
      ]),
    });
    expect(
      screen.getByTestId("execution-table-attachments-button-r1"),
    ).toBeInTheDocument();
    expect(cellChildCount()).toBe(withoutAttachment);
  });

  it("접힘 관련 props 를 주지 않아도 렌더된다 (하위 호환)", () => {
    render(
      <TestExecutionTable
        visibleData={[folder("f1", "로그인")]}
        resultsMap={new Map()}
        totalItems={0}
        hasMore={false}
        loadMore={vi.fn()}
        handleOpenResultForm={vi.fn()}
        handleShowPrevResults={vi.fn()}
        handleAttachmentClick={vi.fn()}
      />,
    );
    expect(
      screen.getByTestId("execution-table-folder-toggle-f1"),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
