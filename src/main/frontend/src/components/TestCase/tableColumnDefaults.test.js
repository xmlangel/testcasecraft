import { describe, it, expect } from "vitest";
import {
  getDefaultColumnVisibility,
  getDefaultColumnOrder,
} from "./tableColumnDefaults.js";

describe("tableColumnDefaults", () => {
  it("기본 표시 설정은 매번 새 객체를 반환한다 (mutation 격리)", () => {
    const a = getDefaultColumnVisibility();
    const b = getDefaultColumnVisibility();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it("핵심 컬럼 기본 표시 여부", () => {
    const v = getDefaultColumnVisibility();
    expect(v.testCase).toBe(true);
    expect(v.result).toBe(true);
    expect(v.displayId).toBe(false);
    expect(v.steps).toBe(false);
  });

  it("기본 컬럼 순서는 배열이며 표시 설정의 키를 모두 포함한다", () => {
    const order = getDefaultColumnOrder();
    const keys = Object.keys(getDefaultColumnVisibility());
    expect(Array.isArray(order)).toBe(true);
    keys.forEach((k) => expect(order).toContain(k));
    // 순서 배열에 중복 없음
    expect(new Set(order).size).toBe(order.length);
  });
});
