import { describe, it, expect } from "vitest";
import { calculateExecutionProgress } from "./progressUtils.jsx";

/**
 * dev-code-review P0(실행 상태 리터럴 NOT_RUN/NOTRUN 드리프트) 프론트 회귀 가드.
 *
 * 저장/응답 정본은 "NOT_RUN"(언더스코어). 과거 코드는 "NOTRUN"과 비교해 미실행을 완료로
 * 집계 → 진행률이 부풀려졌다(전부 미실행이어도 100%).
 */
describe("calculateExecutionProgress - NOT_RUN 드리프트", () => {
  const testCases = [
    { id: "c1", type: "testcase" },
    { id: "c2", type: "testcase" },
    { id: "c3", type: "testcase" },
    { id: "c4", type: "testcase" },
  ];
  const testPlan = { testCaseIds: ["c1", "c2", "c3", "c4"] };

  it("전부 NOT_RUN 이면 진행률 0%", () => {
    const execution = {
      results: [
        { testCaseId: "c1", result: "NOT_RUN" },
        { testCaseId: "c2", result: "NOT_RUN" },
        { testCaseId: "c3", result: "NOT_RUN" },
        { testCaseId: "c4", result: "NOT_RUN" },
      ],
    };
    expect(calculateExecutionProgress(execution, testPlan, testCases)).toBe(0);
  });

  it("PASS/FAIL/BLOCKED 3건 + NOT_RUN 1건 → 75%", () => {
    const execution = {
      results: [
        { testCaseId: "c1", result: "PASS" },
        { testCaseId: "c2", result: "FAIL" },
        { testCaseId: "c3", result: "BLOCKED" },
        { testCaseId: "c4", result: "NOT_RUN" },
      ],
    };
    expect(calculateExecutionProgress(execution, testPlan, testCases)).toBe(75);
  });

  it("전부 실행되면 100%", () => {
    const execution = {
      results: [
        { testCaseId: "c1", result: "PASS" },
        { testCaseId: "c2", result: "PASS" },
        { testCaseId: "c3", result: "FAIL" },
        { testCaseId: "c4", result: "BLOCKED" },
      ],
    };
    expect(calculateExecutionProgress(execution, testPlan, testCases)).toBe(
      100,
    );
  });

  // 계약 가드: testCases(3번째 인자) 누락 시 0. TestContext 가 2인자로 호출해 진행률이 항상 0 이던 버그의 근원.
  it("testCases 인자를 빼면 0 (계약 위반 방어)", () => {
    const execution = {
      results: [
        { testCaseId: "c1", result: "PASS" },
        { testCaseId: "c2", result: "PASS" },
      ],
    };
    expect(calculateExecutionProgress(execution, testPlan)).toBe(0);
  });
});
