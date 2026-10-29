import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TestResult } from "../models/testExecution.jsx";

// ICT-469: 결과 입력 화면이 스텝 입력을 종합 결과·저장 요청에 제대로 엮는지 검사한다.
// 스텝 규칙 자체(rollupStepResults·toStepPayload)는 utils/stepResults.test.js 가 검사하므로
// 여기서는 화면을 렌더하고 저장 버튼을 눌러 실제로 나간 요청 본문을 본다.
// 컨텍스트·훅 반환값은 렌더마다 같은 객체여야 effect 가 무한 재실행되지 않는다.
const { api, appCtx, i18nCtx, autoSaveHook, inlineImageHook } = vi.hoisted(
  () => {
    const api = vi.fn();
    return {
      api,
      appCtx: { user: { role: "USER" }, api },
      i18nCtx: { t: (key, fallback) => fallback || key },
      autoSaveHook: {
        autoSaveStatus: "idle",
        autoSaveError: null,
        markSaved: () => {},
      },
      inlineImageHook: {
        imageDialogState: { open: false },
        inlineImageUploading: false,
        handleMarkdownPaste: () => {},
        handleInlineImageDialogClose: () => {},
        handleInlineImageInsert: () => {},
        updateImageDialogState: () => {},
      },
    };
  },
);

vi.mock("../context/AppContext.jsx", () => ({ useAppContext: () => appCtx }));
vi.mock("../context/I18nContext", () => ({ useI18n: () => i18nCtx }));
vi.mock("../context/I18nContext.jsx", () => ({ useI18n: () => i18nCtx }));
vi.mock("../hooks/useProjectRole.js", () => ({
  useProjectRole: () => ({ projectRole: "CONTRIBUTOR" }),
}));
vi.mock("../hooks/useAutoSave.js", () => ({ default: () => autoSaveHook }));
vi.mock("../hooks/useInlineImagePaste.js", () => ({
  default: () => inlineImageHook,
}));
vi.mock("../hooks/useResultShortcuts.js", () => ({ default: () => {} }));
vi.mock("../services/jiraService.js", () => ({
  jiraService: {
    extractIssueKeys: () => [],
    extractIssueKeyFromUrl: (v) => v,
    getConnectionStatus: async () => ({ hasConfig: false }),
    getIssueDetails: async () => null,
  },
}));

vi.mock("./JiraIntegration/JiraCommentDialog.jsx", () => ({
  default: () => null,
}));
vi.mock("./TestCase/TestCaseAttachments.jsx", () => ({ default: () => null }));
vi.mock("./TestCase/InlineImageDialog.jsx", () => ({ default: () => null }));
vi.mock("./TestResult/TestResultAttachments.jsx", () => ({
  default: () => null,
}));
vi.mock("./TestResult/TestResultTags.jsx", () => ({ default: () => null }));
vi.mock("./TestResult/TestResultJira.jsx", () => ({ default: () => null }));
vi.mock("./TestResult/TestResultHeader.jsx", () => ({ default: () => null }));
vi.mock("./TestResult/TestResultFloatingMenu.jsx", () => ({
  default: () => null,
}));

// 스텝 입력 칸(마크다운 에디터 포함)은 TestCaseDetails 테스트가 따로 검사한다.
// 여기서는 TestCaseDetails 가 부모에게 넘기는 onStepChange 호출만 버튼으로 흉내 낸다.
vi.mock("./TestResult/TestCaseDetails.jsx", () => ({
  default: ({
    testCase,
    onStepChange,
    onPassAllSteps,
    memoRequired,
    memoFocusRequest,
    onMemoChange,
  }) => (
    <div>
      <button onClick={onPassAllSteps}>pass-all</button>
      <output data-testid="memo-required">{String(!!memoRequired)}</output>
      <output data-testid="memo-focus-request">{memoFocusRequest}</output>
      <button onClick={() => onMemoChange("전체 통과 확인")}>type-memo</button>
      {(testCase.steps || []).map((s) => (
        <span key={s.stepNumber}>
          {["PASS", "FAIL", "BLOCKED", "NOT_RUN"].map((r) => (
            <button
              key={r}
              onClick={() => onStepChange(s.stepNumber, { result: r })}
            >
              {`step${s.stepNumber}-${r}`}
            </button>
          ))}
          <button
            onClick={() =>
              onStepChange(s.stepNumber, {
                actualResult: `스텝${s.stepNumber} 실제`,
              })
            }
          >
            {`step${s.stepNumber}-actual`}
          </button>
          <button
            onClick={() =>
              onStepChange(s.stepNumber, {
                result: TestResult.NOT_RUN,
                actualResult: "",
              })
            }
          >
            {`step${s.stepNumber}-clear`}
          </button>
        </span>
      ))}
    </div>
  ),
}));

// 종합 결과 선택 칸과 저장 버튼은 TestResultNotes 안에 있다. 받은 값과 콜백을 그대로 노출한다.
vi.mock("./TestResult/TestResultNotes.jsx", () => ({
  default: ({ result, onResultChange, onSave, notes }) => (
    <div>
      <output data-testid="overall-result">{result}</output>
      <output data-testid="notes-value">{notes}</output>
      <button onClick={() => onResultChange(TestResult.BLOCKED)}>
        overall-BLOCKED
      </button>
      <button onClick={onSave}>save</button>
    </div>
  ),
}));

import TestResultForm from "./TestResultForm.jsx";

const TWO_STEPS = [
  { stepNumber: 1, description: "로그인", expectedResult: "대시보드" },
  { stepNumber: 2, description: "저장", expectedResult: "저장됨" },
];

const okJson = (body) => ({ ok: true, json: async () => body });

const mockApi = (caseSteps) => {
  api.mockImplementation(async (url, options = {}) => {
    if (url === "/api/testcases/tc-1")
      return okJson({ id: "tc-1", name: "케이스", steps: caseSteps });
    if (options.method === "POST" || options.method === "PUT")
      return okJson({ id: "exec-1", results: [] });
    return okJson([]);
  });
};

const savedBodies = () =>
  api.mock.calls
    .filter(([, o]) => o && (o.method === "POST" || o.method === "PUT"))
    .map(([url, o]) => ({ url, method: o.method, body: JSON.parse(o.body) }));

const renderForm = async (currentResult) => {
  const onSave = vi.fn();
  render(
    <TestResultForm
      open
      testCaseId="tc-1"
      executionId="exec-1"
      currentResult={currentResult}
      onClose={() => {}}
      onSave={onSave}
    />,
  );
  await screen.findByTestId("overall-result");
  return { onSave };
};

const overall = () => screen.getByTestId("overall-result").textContent;
const click = (name) => fireEvent.click(screen.getByText(name));

describe("TestResultForm 스텝별 결과 (ICT-469)", () => {
  beforeEach(() => {
    api.mockReset();
  });

  it("스텝 결과를 고르면 종합 결과가 FAIL > BLOCKED > 미완료 > PASS 규칙으로 바뀐다", async () => {
    mockApi(TWO_STEPS);
    await renderForm({ result: TestResult.NOT_RUN, notes: "" });

    click("step1-PASS");
    await waitFor(() => expect(overall()).toBe(TestResult.NOT_RUN));
    click("step2-PASS");
    await waitFor(() => expect(overall()).toBe(TestResult.PASS));
    click("step2-BLOCKED");
    await waitFor(() => expect(overall()).toBe(TestResult.BLOCKED));
    click("step1-FAIL");
    await waitFor(() => expect(overall()).toBe(TestResult.FAIL));
  });

  it("자동 선택 뒤 사람이 종합 결과를 바꾸면 그 값과 스텝 결과가 함께 저장된다", async () => {
    mockApi(TWO_STEPS);
    await renderForm({ result: TestResult.NOT_RUN, notes: "" });

    click("step1-PASS");
    click("step2-FAIL");
    await waitFor(() => expect(overall()).toBe(TestResult.FAIL));

    click("overall-BLOCKED");
    await waitFor(() => expect(overall()).toBe(TestResult.BLOCKED));
    await waitFor(() => expect(savedBodies()).toHaveLength(1));

    const [saved] = savedBodies();
    expect(saved.method).toBe("POST");
    expect(saved.url).toBe("/api/test-executions/exec-1/results");
    expect(saved.body.result).toBe(TestResult.BLOCKED);
    expect(saved.body.steps).toEqual([
      { stepNumber: 1, result: TestResult.PASS },
      { stepNumber: 2, result: TestResult.FAIL },
    ]);
  });

  it("저장 버튼을 누르면 요청에 스텝 번호·결과·실제 결과가 실린다", async () => {
    mockApi(TWO_STEPS);
    const { onSave } = await renderForm({
      result: TestResult.NOT_RUN,
      notes: "",
    });

    click("step1-PASS");
    click("step2-FAIL");
    click("step2-actual");
    await waitFor(() => expect(overall()).toBe(TestResult.FAIL));
    click("save");

    await waitFor(() => expect(savedBodies()).toHaveLength(1));
    const [saved] = savedBodies();
    expect(saved.body).toMatchObject({
      testCaseId: "tc-1",
      result: TestResult.FAIL,
      steps: [
        { stepNumber: 1, result: TestResult.PASS },
        {
          stepNumber: 2,
          result: TestResult.FAIL,
          actualResult: "스텝2 실제",
        },
      ],
    });
    await waitFor(() => expect(onSave).toHaveBeenCalled());
  });

  it("저장된 스텝 결과를 모두 비우고 저장하면 모든 스텝을 NOT_RUN 으로 보내 서버 값을 지운다", async () => {
    mockApi(TWO_STEPS);
    await renderForm({
      id: "res-1",
      result: TestResult.FAIL,
      notes: "",
      steps: [
        { ...TWO_STEPS[0], result: TestResult.FAIL, actualResult: "에러" },
        { ...TWO_STEPS[1], result: TestResult.PASS },
      ],
    });

    click("step1-clear");
    click("step2-clear");
    await waitFor(() => expect(overall()).toBe(TestResult.NOT_RUN));
    click("save");

    await waitFor(() => expect(savedBodies()).toHaveLength(1));
    expect(savedBodies()[0].body.steps).toEqual([
      { stepNumber: 1, result: TestResult.NOT_RUN },
      { stepNumber: 2, result: TestResult.NOT_RUN },
    ]);
  });

  it("스텝이 없는 케이스는 steps 없이 종합 결과만 저장된다", async () => {
    mockApi([]);
    await renderForm({ result: TestResult.NOT_RUN, notes: "" });

    click("overall-BLOCKED");

    await waitFor(() => expect(savedBodies()).toHaveLength(1));
    const [saved] = savedBodies();
    expect(saved.body.result).toBe(TestResult.BLOCKED);
    expect(saved.body).not.toHaveProperty("steps");
  });
});

describe("TestResultForm 모든 스텝 Pass (ICT-479)", () => {
  beforeEach(() => {
    api.mockReset();
  });

  it("이미 결과가 있는 스텝까지 모두 PASS 로 바꾸고 메모를 필수로 요구한다", async () => {
    mockApi(TWO_STEPS);
    await renderForm({
      id: "r-1",
      result: TestResult.FAIL,
      notes: "",
      steps: [
        { stepNumber: 1, result: TestResult.PASS },
        { stepNumber: 2, result: TestResult.FAIL },
      ],
    });
    expect(overall()).toBe(TestResult.FAIL);

    click("pass-all");

    await waitFor(() => expect(overall()).toBe(TestResult.PASS));
    expect(screen.getByTestId("memo-required").textContent).toBe("true");
    expect(screen.getByTestId("memo-focus-request").textContent).toBe("1");
  });

  it("메모가 비어 있으면 저장하지 않고, 입력하면 노트에 담겨 모든 스텝 PASS 로 저장된다", async () => {
    mockApi(TWO_STEPS);
    await renderForm({ result: TestResult.NOT_RUN, notes: "" });

    click("pass-all");
    await waitFor(() => expect(overall()).toBe(TestResult.PASS));
    click("save");
    await new Promise((r) => setTimeout(r, 50));
    expect(savedBodies()).toHaveLength(0);
    expect(screen.getByTestId("memo-focus-request").textContent).toBe("2");

    click("type-memo");
    await waitFor(() =>
      expect(screen.getByTestId("notes-value").textContent).toBe(
        "전체 통과 확인",
      ),
    );
    click("save");
    await waitFor(() => expect(savedBodies()).toHaveLength(1));
    expect(savedBodies()[0].body).toMatchObject({
      result: TestResult.PASS,
      notes: "전체 통과 확인",
      steps: [
        { stepNumber: 1, result: TestResult.PASS },
        { stepNumber: 2, result: TestResult.PASS },
      ],
    });
  });
});
