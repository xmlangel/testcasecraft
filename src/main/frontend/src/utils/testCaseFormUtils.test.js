import { describe, it, expect } from "vitest";
import {
  removeStepAndRenumber,
  getCommonInheritedTags,
} from "./testCaseFormUtils.js";

describe("getCommonInheritedTags", () => {
  it("현재 태그와 옛 부모 태그의 교집합을 반환한다", () => {
    expect(getCommonInheritedTags(["a", "b", "c"], ["b", "c", "d"])).toEqual([
      "b",
      "c",
    ]);
  });

  it("교집합이 없으면 빈 배열", () => {
    expect(getCommonInheritedTags(["a"], ["x", "y"])).toEqual([]);
  });

  it("null/undefined 입력은 안전하게 빈 배열로 처리", () => {
    expect(getCommonInheritedTags(null, ["a"])).toEqual([]);
    expect(getCommonInheritedTags(["a"], null)).toEqual([]);
    expect(getCommonInheritedTags(undefined, undefined)).toEqual([]);
  });
});

describe("removeStepAndRenumber", () => {
  const steps = [
    { stepNumber: 1, description: "a", expectedResult: "ea" },
    { stepNumber: 2, description: "b", expectedResult: "eb" },
    { stepNumber: 3, description: "c", expectedResult: "ec" },
  ];

  it("중간 단계를 삭제해도 1..N 연속 번호로 재번호한다 (구멍 없음)", () => {
    const { steps: result } = removeStepAndRenumber(steps, 2);
    expect(result.map((s) => s.stepNumber)).toEqual([1, 2]);
    // 내용은 보존되고 번호만 재배열
    expect(result).toEqual([
      { stepNumber: 1, description: "a", expectedResult: "ea" },
      { stepNumber: 2, description: "c", expectedResult: "ec" },
    ]);
  });

  it("stepNumber 로 키잉된 에러도 새 번호로 재매핑한다", () => {
    // 1,2,3 중 1 삭제 → 기존 2→1, 3→2. 에러는 step2/step3 에 있었음
    const stepErrors = { 2: "err2", 3: "err3" };
    const { stepErrors: result } = removeStepAndRenumber(steps, 1, stepErrors);
    expect(result).toEqual({ 1: "err2", 2: "err3" });
  });

  it("삭제된 단계의 에러는 제거된다", () => {
    const stepErrors = { 2: "err2" };
    const { stepErrors: result } = removeStepAndRenumber(steps, 2, stepErrors);
    expect(result).toEqual({});
  });

  it("마지막 하나를 삭제하면 빈 목록을 반환한다", () => {
    const one = [{ stepNumber: 1, description: "x", expectedResult: "" }];
    const { steps: result } = removeStepAndRenumber(one, 1);
    expect(result).toEqual([]);
  });

  it("정렬되지 않은 입력도 정렬 후 1..N 으로 재번호한다", () => {
    const unordered = [
      { stepNumber: 3, description: "c" },
      { stepNumber: 1, description: "a" },
      { stepNumber: 2, description: "b" },
    ];
    const { steps: result } = removeStepAndRenumber(unordered, 1);
    expect(result.map((s) => [s.stepNumber, s.description])).toEqual([
      [1, "b"],
      [2, "c"],
    ]);
  });
});
