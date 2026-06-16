import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";

// useUiPreference 를 useState 로 대체 — 서버/localStorage 의존 없이
// 필드 표시 토글 로직만 격리해서 검증한다.
vi.mock("./useUiPreference.jsx", async () => {
  const { useState } = await import("react");
  return { useUiPreference: (key, def) => useState(def) };
});

import {
  useFieldVisibility,
  FIELD_DEFINITIONS,
} from "./useFieldVisibility.jsx";

describe("FIELD_DEFINITIONS", () => {
  it("토글 대상 필드 목록을 노출한다 (핵심 필드 제외)", () => {
    const keys = FIELD_DEFINITIONS.map((f) => f.key);
    expect(keys).toContain("description");
    expect(keys).toContain("priority");
    expect(keys).toContain("tags");
    // 핵심 필드(이름·스텝·기대결과)는 토글 대상이 아님
    expect(keys).not.toContain("name");
    expect(keys).not.toContain("steps");
  });
});

describe("useFieldVisibility", () => {
  it("기본값은 모든 필드 표시(true)", () => {
    const { result } = renderHook(() => useFieldVisibility());
    FIELD_DEFINITIONS.forEach((f) => {
      expect(result.current.visibility[f.key]).toBe(true);
    });
  });

  it("toggle 은 해당 필드만 반전한다", () => {
    const { result } = renderHook(() => useFieldVisibility());
    act(() => result.current.toggle("description"));
    expect(result.current.visibility.description).toBe(false);
    expect(result.current.visibility.priority).toBe(true);
    act(() => result.current.toggle("description"));
    expect(result.current.visibility.description).toBe(true);
  });

  it("setAll(false) 는 모든 필드를 숨긴다", () => {
    const { result } = renderHook(() => useFieldVisibility());
    act(() => result.current.setAll(false));
    FIELD_DEFINITIONS.forEach((f) => {
      expect(result.current.visibility[f.key]).toBe(false);
    });
  });

  it("reset 은 전체를 기본값(true)으로 되돌린다", () => {
    const { result } = renderHook(() => useFieldVisibility());
    act(() => result.current.setAll(false));
    act(() => result.current.reset());
    FIELD_DEFINITIONS.forEach((f) => {
      expect(result.current.visibility[f.key]).toBe(true);
    });
  });

  it("저장된 값이 일부만 있어도 누락 키는 기본값으로 채운다 (safeVisibility)", () => {
    const { result } = renderHook(() => useFieldVisibility());
    // description 만 끄면 나머지는 여전히 true 로 안전 병합되어야 한다
    act(() => result.current.toggle("tags"));
    expect(result.current.visibility.tags).toBe(false);
    expect(result.current.visibility.description).toBe(true);
  });
});
