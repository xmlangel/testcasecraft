import { describe, it, expect } from "vitest";
import { EXECUTION_TYPES, normalizeExecutionType } from "./executionType.js";

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
