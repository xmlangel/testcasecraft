import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useColumnPreferences from "./useColumnPreferences.js";
import {
  getDefaultColumnVisibility,
  getDefaultColumnOrder,
} from "../tableColumnDefaults.js";

describe("useColumnPreferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("저장된 값이 없으면 기본 표시/순서로 초기화한다", () => {
    const { result } = renderHook(() => useColumnPreferences("p1"));
    expect(result.current.columnVisibility).toEqual(
      getDefaultColumnVisibility(),
    );
    expect(result.current.columnOrder).toEqual(getDefaultColumnOrder());
  });

  it("토글하면 상태가 바뀌고 projectId 별 키로 저장된다", () => {
    const { result } = renderHook(() => useColumnPreferences("p1"));
    const before = result.current.columnVisibility.displayId;
    act(() => result.current.handleColumnVisibilityToggle("displayId"));
    expect(result.current.columnVisibility.displayId).toBe(!before);
    const saved = JSON.parse(
      localStorage.getItem("testResultTable_columnVisibility_p1"),
    );
    expect(saved.displayId).toBe(!before);
  });

  it("순서 변경 핸들러가 상태와 localStorage 를 갱신한다", () => {
    const { result } = renderHook(() => useColumnPreferences("p1"));
    const newOrder = ["result", "testCase", "folder"];
    act(() => result.current.handleColumnOrderChange(newOrder));
    expect(result.current.columnOrder).toEqual(newOrder);
    expect(
      JSON.parse(localStorage.getItem("testResultTable_columnOrder_p1")),
    ).toEqual(newOrder);
  });

  it("저장된 설정을 기본값과 병합해 로드한다 (새 필드 보존)", () => {
    localStorage.setItem(
      "testResultTable_columnVisibility_p1",
      JSON.stringify({ testCase: false }),
    );
    const { result } = renderHook(() => useColumnPreferences("p1"));
    // 저장값 반영
    expect(result.current.columnVisibility.testCase).toBe(false);
    // 기본값의 다른 키는 유지
    expect("result" in result.current.columnVisibility).toBe(true);
  });

  it("projectId 가 바뀌면 해당 프로젝트 설정을 다시 로드한다", () => {
    localStorage.setItem(
      "testResultTable_columnOrder_p2",
      JSON.stringify(["result"]),
    );
    const { result, rerender } = renderHook(
      ({ pid }) => useColumnPreferences(pid),
      {
        initialProps: { pid: "p1" },
      },
    );
    rerender({ pid: "p2" });
    // p2 저장값(result 우선) + 기본 순서의 나머지 필드가 뒤따른다
    expect(result.current.columnOrder[0]).toBe("result");
    expect(result.current.columnOrder.length).toBe(
      getDefaultColumnOrder().length,
    );
  });
});
