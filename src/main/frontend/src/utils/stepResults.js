// ICT-469: 스텝별 결과 입력 도우미
// 상태 모양: { [stepNumber]: { result, actualResult } }. 없는 스텝은 NOT_RUN·빈 실제 결과로 본다.
import { TestResult } from "../models/testExecution.jsx";

const sortedNumbers = (caseSteps = []) =>
  [...(caseSteps || [])].map((s) => s.stepNumber).sort((a, b) => a - b);

/** 저장된 결과의 steps 배열을 입력 상태로 바꾼다. */
export const stepResultsFromSaved = (savedSteps) => {
  const map = {};
  (savedSteps || []).forEach((s) => {
    map[s.stepNumber] = {
      result: s.result || TestResult.NOT_RUN,
      actualResult: s.actualResult || "",
    };
  });
  return map;
};

const entryOf = (map, n) =>
  map?.[n] || { result: TestResult.NOT_RUN, actualResult: "" };

/** 스텝에 하나라도 값이 들어갔는지. 아무것도 없으면 steps 를 보내지 않는다(기존 동작). */
export const hasStepInput = (caseSteps, map) =>
  sortedNumbers(caseSteps).some((n) => {
    const e = entryOf(map, n);
    return (
      (e.result && e.result !== TestResult.NOT_RUN) ||
      !!(e.actualResult && e.actualResult.trim())
    );
  });

/** 요청용 steps 배열. 입력이 없으면 null. */
export const toStepPayload = (caseSteps, map) => {
  if (!hasStepInput(caseSteps, map)) return null;
  return sortedNumbers(caseSteps).map((n) => {
    const e = entryOf(map, n);
    const item = { stepNumber: n, result: e.result || TestResult.NOT_RUN };
    if (e.actualResult && e.actualResult.trim())
      item.actualResult = e.actualResult;
    return item;
  });
};

/** 스텝 결과로 종합 결과 계산. FAIL > BLOCKED > 미완료(NOT_RUN) > 모두 PASS. 서버 규칙과 같다. */
export const rollupStepResults = (caseSteps, map) => {
  const numbers = sortedNumbers(caseSteps);
  if (numbers.length === 0) return TestResult.NOT_RUN;
  const values = numbers.map((n) => entryOf(map, n).result);
  if (values.includes(TestResult.FAIL)) return TestResult.FAIL;
  if (values.includes(TestResult.BLOCKED)) return TestResult.BLOCKED;
  if (values.some((v) => v !== TestResult.PASS)) return TestResult.NOT_RUN;
  return TestResult.PASS;
};

/** 입력한 스텝 수 / 전체 스텝 수 (NOT_RUN 이 아닌 스텝) */
export const countEnteredSteps = (caseSteps, map) => {
  const numbers = sortedNumbers(caseSteps);
  const entered = numbers.filter(
    (n) => entryOf(map, n).result !== TestResult.NOT_RUN,
  ).length;
  return { entered, total: numbers.length };
};

/**
 * 모든 스텝 결과를 PASS 로 바꾼다. 실제 결과 입력값은 그대로 둔다.
 * ICT-479: 빈 스텝만 채우면 이전 결과를 불러온 재실행에서 바뀔 스텝이 없어 버튼이 무반응이었다.
 */
export const passAllSteps = (caseSteps, map) => {
  const next = { ...(map || {}) };
  sortedNumbers(caseSteps).forEach((n) => {
    next[n] = { ...entryOf(next, n), result: TestResult.PASS };
  });
  return next;
};

/** 두 입력 상태가 요청 기준으로 같은지 (변경 없음 판정용) */
export const sameStepPayload = (caseSteps, a, b) =>
  JSON.stringify(toStepPayload(caseSteps, a)) ===
  JSON.stringify(toStepPayload(caseSteps, b));

/** 내보내기 셀용 한 줄씩 텍스트. 스텝 결과가 없으면 "-" */
export const formatStepResultsText = (steps) => {
  if (!steps || steps.length === 0) return "-";
  return [...steps]
    .sort((a, b) => a.stepNumber - b.stepNumber)
    .map(
      (s) =>
        `${s.stepNumber}. ${s.result || TestResult.NOT_RUN}${
          s.actualResult ? ` - ${s.actualResult}` : ""
        }`,
    )
    .join("\n");
};

export const STEP_RESULT_SHEET_HEADERS = [
  "Display ID",
  "Test Case",
  "Result",
  "Step No.",
  "Step",
  "Expected Result",
  "Step Result",
  "Actual Result",
];

/** 「케이스 × 스텝」 상세 시트 행. 스텝 결과가 있는 행만 펼친다. */
export const buildStepResultSheetRows = (rows) => {
  const out = [];
  (rows || []).forEach((row) => {
    [...(row.stepResults || [])]
      .sort((a, b) => a.stepNumber - b.stepNumber)
      .forEach((s) => {
        out.push([
          row.displayId || "",
          row.testCase || "",
          row.result || "",
          s.stepNumber,
          s.description || "",
          s.expectedResult || "",
          s.result || TestResult.NOT_RUN,
          s.actualResult || "",
        ]);
      });
  });
  return out;
};

/**
 * Jira 댓글용: FAIL·BLOCKED 스텝만 「기대 / 실제」 형식으로. 해당 스텝이 없으면 빈 문자열.
 * steps 는 { stepNumber, description, expectedResult, result, actualResult } 목록.
 */
export const formatProblemStepsMarkdown = (steps, labels) => {
  const problems = [...(steps || [])]
    .filter(
      (s) => s.result === TestResult.FAIL || s.result === TestResult.BLOCKED,
    )
    .sort((a, b) => a.stepNumber - b.stepNumber);
  if (problems.length === 0) return "";
  const lines = [`**${labels.title}**`];
  problems.forEach((s) => {
    lines.push(
      `- ${s.stepNumber}. ${s.result}${s.description ? ` ${s.description}` : ""}`,
    );
    if (s.expectedResult)
      lines.push(`  - ${labels.expected}: ${s.expectedResult}`);
    // ICT-472: 실제 결과는 여러 줄 마크다운일 수 있다. 다음 줄을 목록 항목 안으로
    // 들여 써야 목록이 끊기지 않는다
    if (s.actualResult)
      lines.push(
        `  - ${labels.actual}: ${s.actualResult.replace(/\r?\n/g, "\n    ")}`,
      );
  });
  return `${lines.join("\n")}\n\n`;
};
