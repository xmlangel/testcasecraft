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

describe("stepResults 내보내기 (ICT-469)", () => {
  it("셀 텍스트는 번호 순서로 결과와 실제 결과", async () => {
    const { formatStepResultsText } = await import("./stepResults.js");
    expect(formatStepResultsText([])).toBe("-");
    expect(
      formatStepResultsText([
        { stepNumber: 2, result: "FAIL", actualResult: "반응 없음" },
        { stepNumber: 1, result: "PASS" },
      ]),
    ).toBe("1. PASS\n2. FAIL - 반응 없음");
  });

  it("상세 시트는 스텝 결과가 있는 케이스만 스텝마다 한 줄", async () => {
    const { buildStepResultSheetRows, STEP_RESULT_SHEET_HEADERS } =
      await import("./stepResults.js");
    const rows = buildStepResultSheetRows([
      {
        displayId: "TC-1",
        testCase: "로그인",
        result: "FAIL",
        stepResults: [
          {
            stepNumber: 1,
            description: "열기",
            expectedResult: "화면",
            result: "PASS",
          },
          {
            stepNumber: 2,
            description: "저장",
            expectedResult: "알림",
            result: "FAIL",
            actualResult: "없음",
          },
        ],
      },
      { displayId: "TC-2", testCase: "스텝 없음", result: "PASS" },
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[1]).toEqual([
      "TC-1",
      "로그인",
      "FAIL",
      2,
      "저장",
      "알림",
      "FAIL",
      "없음",
    ]);
    expect(rows[0]).toHaveLength(STEP_RESULT_SHEET_HEADERS.length);
  });
});

describe("stepResults Jira 댓글 (ICT-469)", () => {
  it("FAIL·BLOCKED 스텝만 기대·실제로 적는다", async () => {
    const { formatProblemStepsMarkdown } = await import("./stepResults.js");
    const labels = {
      title: "실패·차단 스텝",
      expected: "기대",
      actual: "실제",
    };
    expect(
      formatProblemStepsMarkdown([{ stepNumber: 1, result: "PASS" }], labels),
    ).toBe("");
    expect(
      formatProblemStepsMarkdown(
        [
          { stepNumber: 3, result: "BLOCKED", description: "로그아웃" },
          {
            stepNumber: 2,
            result: "FAIL",
            description: "저장",
            expectedResult: "알림",
            actualResult: "반응 없음",
          },
        ],
        labels,
      ),
    ).toBe(
      "**실패·차단 스텝**\n- 2. FAIL 저장\n  - 기대: 알림\n  - 실제: 반응 없음\n- 3. BLOCKED 로그아웃\n\n",
    );
  });

  it("여러 줄 실제 결과는 목록 항목 안으로 들여 쓴다 (ICT-472)", async () => {
    const { formatProblemStepsMarkdown } = await import("./stepResults.js");
    expect(
      formatProblemStepsMarkdown(
        [{ stepNumber: 1, result: "FAIL", actualResult: "첫 줄\r\n둘째 줄" }],
        { title: "T", expected: "기대", actual: "실제" },
      ),
    ).toBe("**T**\n- 1. FAIL\n  - 실제: 첫 줄\n    둘째 줄\n\n");
  });
});
