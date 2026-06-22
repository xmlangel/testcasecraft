import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useRowSelection from "./useRowSelection.js";

const sel = (startRow, endRow = startRow) => ({
  range: {
    start: { row: startRow, column: 0 },
    end: { row: endRow, column: 0 },
  },
});

describe("useRowSelection", () => {
  it("초기 상태는 null", () => {
    const { result } = renderHook(() => useRowSelection());
    expect(result.current.selectedRowIndex).toBeNull();
    expect(result.current.selectedRange).toBeNull();
  });

  it("셀 선택 시 행 인덱스와 범위를 갱신하고 ref 도 동기화한다", () => {
    const { result } = renderHook(() => useRowSelection());
    act(() => result.current.handleCellSelect(sel(2)));
    expect(result.current.selectedRowIndex).toBe(2);
    expect(result.current.selectedRange.start.row).toBe(2);
    expect(result.current.selectedRowIndexRef.current).toBe(2);
    expect(result.current.selectedRangeRef.current.start.row).toBe(2);
  });

  it("동일 범위 재선택은 무시한다(ref 유지)", () => {
    const { result } = renderHook(() => useRowSelection());
    act(() => result.current.handleCellSelect(sel(1)));
    const rangeRef1 = result.current.selectedRangeRef.current;
    act(() => result.current.handleCellSelect(sel(1)));
    // 동일 범위 → ref 객체가 교체되지 않음
    expect(result.current.selectedRangeRef.current).toBe(rangeRef1);
  });

  it("range 가 없는 입력은 무시한다", () => {
    const { result } = renderHook(() => useRowSelection());
    act(() => result.current.handleCellSelect(null));
    act(() => result.current.handleCellSelect({}));
    expect(result.current.selectedRowIndex).toBeNull();
  });

  it("다른 행으로 이동하면 인덱스가 갱신된다", () => {
    const { result } = renderHook(() => useRowSelection());
    act(() => result.current.handleCellSelect(sel(0)));
    act(() => result.current.handleCellSelect(sel(5)));
    expect(result.current.selectedRowIndex).toBe(5);
  });
});
