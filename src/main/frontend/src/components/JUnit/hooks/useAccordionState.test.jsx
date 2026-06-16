import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useAccordionState from "./useAccordionState.js";

const KEY = "testcase-manager-junit-detail-expanded-sections";
const OLD = "testcase-manager-junit-detail-stats-accordion";

describe("useAccordionState", () => {
  beforeEach(() => localStorage.clear());

  it("저장값이 없으면 기본 확장 상태", () => {
    const { result } = renderHook(() => useAccordionState());
    expect(result.current.expandedSections).toEqual({
      stats: true,
      testCases: true,
      failedTests: false,
      slowTests: false,
    });
  });

  it("저장된 상태를 그대로 로드한다", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        stats: false,
        testCases: false,
        failedTests: true,
        slowTests: true,
      }),
    );
    const { result } = renderHook(() => useAccordionState());
    expect(result.current.expandedSections.failedTests).toBe(true);
    expect(result.current.expandedSections.stats).toBe(false);
  });

  it("구버전 stats 키를 마이그레이션한다", () => {
    localStorage.setItem(OLD, JSON.stringify(false));
    const { result } = renderHook(() => useAccordionState());
    expect(result.current.expandedSections.stats).toBe(false);
  });

  it("토글 시 상태와 localStorage 를 갱신한다", () => {
    const { result } = renderHook(() => useAccordionState());
    act(() => result.current.handleAccordionChange("slowTests")(null, true));
    expect(result.current.expandedSections.slowTests).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY)).slowTests).toBe(true);
  });
});
