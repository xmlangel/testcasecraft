import { describe, it, expect, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useCaseAutomationFilter, {
  setCaseAutomationFilter,
} from "./useCaseAutomationFilter.js";

afterEach(() => {
  act(() => setCaseAutomationFilter("all"));
});

describe("useCaseAutomationFilter (ICT-496)", () => {
  it("트리와 목록처럼 따로 쓰는 두 곳이 같은 값을 본다", () => {
    const tree = renderHook(() => useCaseAutomationFilter());
    const list = renderHook(() => useCaseAutomationFilter());
    expect(list.result.current[0]).toBe("all");

    act(() => tree.result.current[1]("automated"));
    expect(list.result.current[0]).toBe("automated");

    act(() => tree.result.current[1]("manual"));
    expect(list.result.current[0]).toBe("manual");
  });

  it("모르는 값은 전체로 돌린다", () => {
    const { result } = renderHook(() => useCaseAutomationFilter());
    act(() => result.current[1]("automated"));
    act(() => result.current[1]("bogus"));
    expect(result.current[0]).toBe("all");
  });
});
