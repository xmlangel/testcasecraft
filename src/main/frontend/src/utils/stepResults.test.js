import { describe, it, expect } from "vitest";
import {
  stepResultsFromSaved,
  hasStepInput,
  toStepPayload,
  rollupStepResults,
  countEnteredSteps,
  passAllEmptySteps,
  sameStepPayload,
} from "./stepResults.js";

const caseSteps = [{ stepNumber: 2 }, { stepNumber: 1 }, { stepNumber: 3 }];

describe("stepResults (ICT-469)", () => {
  it("입력이 없으면 steps 를 보내지 않는다", () => {
    expect(hasStepInput(caseSteps, {})).toBe(false);
    expect(toStepPayload(caseSteps, {})).toBeNull();
    expect(toStepPayload([], { 1: { result: "PASS" } })).toBeNull();
  });

  it("하나라도 입력하면 전체 스텝을 번호 순서로 보내고 빈 스텝은 NOT_RUN", () => {
    const payload = toStepPayload(caseSteps, {
      2: { result: "FAIL", actualResult: "반응 없음" },
    });
    expect(payload).toEqual([
      { stepNumber: 1, result: "NOT_RUN" },
      { stepNumber: 2, result: "FAIL", actualResult: "반응 없음" },
      { stepNumber: 3, result: "NOT_RUN" },
    ]);
  });

  it("실제 결과만 적어도 입력으로 본다", () => {
    expect(
      hasStepInput(caseSteps, {
        1: { result: "NOT_RUN", actualResult: "메모" },
      }),
    ).toBe(true);
    expect(
      hasStepInput(caseSteps, { 1: { result: "NOT_RUN", actualResult: "  " } }),
    ).toBe(false);
  });

  it("종합 결과 계산 순서는 FAIL > BLOCKED > 미완료 > PASS", () => {
    const all = (r) => ({
      1: { result: r },
      2: { result: r },
      3: { result: r },
    });
    expect(
      rollupStepResults(caseSteps, {
        ...all("PASS"),
        2: { result: "BLOCKED" },
        3: { result: "FAIL" },
      }),
    ).toBe("FAIL");
    expect(
      rollupStepResults(caseSteps, {
        1: { result: "PASS" },
        2: { result: "BLOCKED" },
      }),
    ).toBe("BLOCKED");
    expect(
      rollupStepResults(caseSteps, {
        1: { result: "PASS" },
        2: { result: "PASS" },
      }),
    ).toBe("NOT_RUN");
    expect(rollupStepResults(caseSteps, all("PASS"))).toBe("PASS");
  });

  it("저장된 steps 를 상태로 되돌리고 같은 요청이면 같다고 본다", () => {
    const saved = [
      { stepNumber: 1, result: "PASS", description: "x" },
      { stepNumber: 2, result: "FAIL", actualResult: "실패" },
      { stepNumber: 3, result: "NOT_RUN" },
    ];
    const map = stepResultsFromSaved(saved);
    expect(map[2]).toEqual({ result: "FAIL", actualResult: "실패" });
    expect(sameStepPayload(caseSteps, map, { ...map })).toBe(true);
    expect(
      sameStepPayload(caseSteps, map, { ...map, 3: { result: "PASS" } }),
    ).toBe(false);
  });

  it("모든 스텝 Pass 는 빈 스텝만 채운다", () => {
    const next = passAllEmptySteps(caseSteps, {
      2: { result: "FAIL", actualResult: "x" },
    });
    expect(next[1].result).toBe("PASS");
    expect(next[2]).toEqual({ result: "FAIL", actualResult: "x" });
    expect(next[3].result).toBe("PASS");
    expect(countEnteredSteps(caseSteps, next)).toEqual({
      entered: 3,
      total: 3,
    });
  });
});
