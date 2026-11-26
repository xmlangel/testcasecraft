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
  // 역할과 상태를 나눠 본다. 권한이 없으면 버튼을 내보내지 않고,
  // 권한은 있으나 실행 상태가 안 맞을 때만 비활성으로 남긴다.
  describe("결과 입력 버튼 노출", () => {
    it("결과 기록 권한이 없으면 입력 버튼 대신 보기 버튼이 나온다", () => {
      renderTable({ canRecordResults: false, canEnterResults: false });
      expect(
        screen.queryByTestId("execution-table-result-button-tc1"),
      ).toBeNull();
      // 조회는 막지 않는다. 결과 화면이 읽기 전용으로 뜬다.
      const view = screen.getByTestId("execution-table-view-button-tc1");
      expect(view).toBeInTheDocument();
      expect(view).toBeEnabled();
      // 결과 입력 링크 복사는 쓰기 흐름이라 내보내지 않는다.
      expect(
        screen.queryByTestId("execution-table-copy-link-button-tc1"),
      ).toBeNull();
    });

    it("보기 버튼을 누르면 결과 화면으로 보낸다", () => {
      const { props } = renderTable({
        canRecordResults: false,
        canEnterResults: false,
      });
      fireEvent.click(screen.getByTestId("execution-table-view-button-tc1"));
      expect(props.handleOpenResultForm).toHaveBeenCalledWith("tc1");
    });

    it("기록 권한이 없어도 케이스 이름으로 들어갈 수 있다", () => {
      const { props } = renderTable({
        canRecordResults: false,
        canEnterResults: false,
      });
      fireEvent.click(screen.getByTestId("execution-table-case-name-tc1"));
      expect(props.handleOpenResultForm).toHaveBeenCalledWith("tc1");
    });

    it("권한은 있고 상태가 안 맞으면 비활성으로 남긴다", () => {
      renderTable({ canRecordResults: true, canEnterResults: false });
      expect(
        screen.getByTestId("execution-table-result-button-tc1"),
      ).toBeDisabled();
    });

    it("권한과 상태가 모두 맞으면 누를 수 있다", () => {
      renderTable({ canRecordResults: true, canEnterResults: true });
      expect(
        screen.getByTestId("execution-table-result-button-tc1"),
      ).toBeEnabled();
    });

    it("권한 prop 을 주지 않으면 기존 동작을 유지한다 (하위 호환)", () => {
      renderTable({ canEnterResults: true });
      expect(
        screen.getByTestId("execution-table-result-button-tc1"),
      ).toBeEnabled();
    });
  });
});

describe("TestExecutionTable 3단 분할 열린 케이스 표시 (ICT-491)", () => {
  it("오른쪽 결과 칸에 열린 케이스 행만 활성으로 표시한다", () => {
    renderTable({
      visibleData: [
        folder("f1", "로그인"),
        testcase("tc1", "로그인 성공", "f1"),
        testcase("tc2", "로그인 실패", "f1"),
      ],
      activeTestCaseId: "tc2",
    });
    expect(screen.getByTestId("execution-row-tc2")).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(screen.getByTestId("execution-row-tc1")).not.toHaveAttribute(
      "data-active",
    );
  });
});

// ICT-513: 실행 상세 「테스트 케이스 실행 목록」 표 가독성
describe("TestExecutionTable 표 가독성 (ICT-513)", () => {
  const folderWithId = { ...folder("f1", "로그인"), displayId: "MCP-788" };

  it("폴더 행에는 ID 칩을 달지 않고, 케이스 행에만 단다", () => {
    renderTable({
      visibleData: [folderWithId, testcase("tc1", "로그인 성공", "f1")],
    });
    expect(screen.queryByText("MCP-788")).toBeNull();
    expect(screen.getByText("TC-tc1")).toBeInTheDocument();
  });

  it("폴더 행은 폴더 열과 케이스명 열을 합친 칸에 그린다", () => {
    renderTable();
    const row = screen.getByTestId("execution-row-f1");
    const cell = screen.getByTestId("execution-table-folder-cell-f1");
    expect(cell).toHaveStyle({ gridColumn: "span 2" });
    // 칸을 합쳤으므로 폴더 행은 케이스 행보다 칸이 하나 적다 (열 정렬이 밀리지 않는다)
    const caseRow = screen.getByTestId("execution-row-tc1");
    expect(row.children.length).toBe(caseRow.children.length - 1);
  });

  it("결과 열에 아이콘과 함께 라벨 글자를 붙인다", () => {
    renderTable({
      visibleData: [
        folder("f1", "로그인"),
        testcase("tc1", "미실행 케이스", "f1"),
        testcase("tc2", "성공 케이스", "f1"),
        testcase("tc3", "실패 케이스", "f1"),
      ],
      resultsMap: new Map([
        ["tc2", { id: "r2", result: "PASS" }],
        ["tc3", { id: "r3", result: "FAIL" }],
      ]),
    });
    expect(
      screen.getByTestId("execution-table-result-label-tc1"),
    ).toHaveTextContent("미실행");
    expect(
      screen.getByTestId("execution-table-result-label-tc2"),
    ).toHaveTextContent("성공");
    expect(
      screen.getByTestId("execution-table-result-label-tc3"),
    ).toHaveTextContent("실패");
    expect(screen.queryByTestId("execution-table-result-label-f1")).toBeNull();
  });

  it("긴 케이스명은 두 줄까지 보이고, 마우스를 올리면 전체 이름을 툴팁으로 보인다", async () => {
    const longName =
      "pg_resetwal [Linux/Windows 11] With --key-unwrap-command='<cmd>' with -D with datadir";
    renderTable({
      visibleData: [folder("f1", "로그인"), testcase("tc1", longName, "f1")],
    });
    const name = screen.getByTestId("execution-table-case-name-tc1");
    expect(name).toHaveStyle({ overflow: "hidden" });
    // 두 줄 말줄임: 줄 수 제한(-webkit-line-clamp: 2)과 넘침 숨김
    expect(getComputedStyle(name).getPropertyValue("-webkit-line-clamp")).toBe(
      "2",
    );
    expect(getComputedStyle(name).whiteSpace).not.toBe("nowrap");
    fireEvent.mouseOver(name);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(longName);
  });

  it("케이스 행의 폴더 경로는 한 줄로 줄이고 전체 경로는 툴팁으로 보인다", async () => {
    renderTable();
    const path = screen.getByTestId("execution-table-folder-path-tc1");
    expect(path).toHaveStyle({ whiteSpace: "nowrap" });
    fireEvent.mouseOver(path);
    expect(await screen.findByRole("tooltip")).toHaveTextContent("부모폴더");
  });
});
