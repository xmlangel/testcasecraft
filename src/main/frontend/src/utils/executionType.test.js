import { describe, it, expect } from "vitest";
import {
  EXECUTION_TYPES,
  executionTypeFields,
  isAutomatedCase,
  isAutomatedExecutionType,
  normalizeExecutionType,
  withExecutionTypeFields,
} from "./executionType.js";

describe("normalizeExecutionType (ICT-493)", () => {
  it("Automated 를 Automation 으로 맞춘다", () => {
    expect(normalizeExecutionType("Automated")).toBe("Automation");
    expect(normalizeExecutionType("automated", false)).toBe("Automation");
  });

  it("선택지 값은 그대로 둔다", () => {
    for (const type of EXECUTION_TYPES) {
      expect(normalizeExecutionType(type)).toBe(type);
    }
  });

  it("대소문자·공백이 다른 값도 선택지로 맞춘다", () => {
    expect(normalizeExecutionType(" manual ")).toBe("Manual");
    expect(normalizeExecutionType("HYBRID")).toBe("Hybrid");
  });

  it("값이 없으면 isAutomated 로 정한다", () => {
    expect(normalizeExecutionType(undefined, true)).toBe("Automation");
    expect(normalizeExecutionType("", "Y")).toBe("Automation");
    expect(normalizeExecutionType(null, false)).toBe("Manual");
    expect(normalizeExecutionType(undefined)).toBe("Manual");
  });

  it("알 수 없는 값은 지우지 않고 그대로 돌려준다", () => {
    expect(normalizeExecutionType("Exploratory")).toBe("Exploratory");
  });
});

describe("실행 유형과 자동화 여부 합치기 (ICT-494 tl-5)", () => {
  it("Automation·Hybrid 는 자동화, Manual 은 수동이다", () => {
    expect(isAutomatedExecutionType("Automation")).toBe(true);
    expect(isAutomatedExecutionType("Hybrid")).toBe(true);
    expect(isAutomatedExecutionType("Automated")).toBe(true);
    expect(isAutomatedExecutionType("Manual")).toBe(false);
  });

  it("실행 유형을 바꾸면 isAutomated 가 따라간다", () => {
    expect(executionTypeFields("Hybrid")).toEqual({
      executionType: "Hybrid",
      isAutomated: true,
    });
    expect(executionTypeFields("Automation")).toEqual({
      executionType: "Automation",
      isAutomated: true,
    });
    expect(executionTypeFields("Manual")).toEqual({
      executionType: "Manual",
      isAutomated: false,
    });
  });

  it("케이스 판정은 실행 유형을 따르고, 비어 있을 때만 isAutomated 를 본다", () => {
    expect(
      isAutomatedCase({ executionType: "Manual", isAutomated: true }),
    ).toBe(false);
    expect(
      isAutomatedCase({ executionType: "Hybrid", isAutomated: false }),
    ).toBe(true);
    expect(isAutomatedCase({ isAutomated: true })).toBe(true);
    expect(isAutomatedCase({})).toBe(false);
  });

  it("저장 값은 어긋난 예전 케이스도 실행 유형 쪽으로 맞춘다", () => {
    expect(
      withExecutionTypeFields({
        name: "tc",
        executionType: "Manual",
        isAutomated: true,
      }),
    ).toEqual({ name: "tc", executionType: "Manual", isAutomated: false });
    expect(
      withExecutionTypeFields({ executionType: undefined, isAutomated: true }),
    ).toMatchObject({ executionType: "Automation", isAutomated: true });
  });
});
