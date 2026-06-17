import { describe, it, expect } from "vitest";
import {
  createTestCase,
  createTestFolder,
  createTestStep,
} from "./testCase.jsx";
import {
  ExecutionStatus,
  TestResult,
  createTestExecution,
  createTestResult,
} from "./testExecution.jsx";
import { createTestPlan } from "./testPlan.jsx";

describe("models/testCase", () => {
  it("createTestCase: 전달값 + 기본 필드를 채운다", () => {
    const tc = createTestCase("id1", "케이스", "proj1");
    expect(tc).toMatchObject({
      id: "id1",
      name: "케이스",
      projectId: "proj1",
      parentId: null,
      type: "testcase",
      description: "",
      steps: [],
      expectedResults: "",
      preCondition: "",
      postCondition: "",
      isAutomated: false,
      executionType: "Manual",
      testTechnique: "",
    });
    expect(tc.createdAt).toBeTruthy();
    expect(tc.updatedAt).toBeTruthy();
  });

  it("createTestFolder: type 이 folder 다", () => {
    const f = createTestFolder("f1", "폴더", "proj1", "parent");
    expect(f).toMatchObject({
      id: "f1",
      name: "폴더",
      projectId: "proj1",
      parentId: "parent",
      type: "folder",
    });
  });

  it("createTestStep: 단계 구조", () => {
    expect(createTestStep(1, "동작", "기대")).toEqual({
      stepNumber: 1,
      description: "동작",
      expectedResult: "기대",
    });
    expect(createTestStep(2)).toEqual({
      stepNumber: 2,
      description: "",
      expectedResult: "",
    });
  });
});

describe("models/testExecution", () => {
  it("열거형 값", () => {
    expect(ExecutionStatus.NOTSTARTED).toBe("NOTSTARTED");
    expect(TestResult.PASS).toBe("PASS");
    expect(TestResult.NOT_RUN).toBe("NOT_RUN");
  });

  it("createTestExecution: 기본 status 가 NOTSTARTED 다 (undefined 회귀 가드)", () => {
    const ex = createTestExecution("e1", "실행", "plan1");
    expect(ex.status).toBe("NOTSTARTED");
    expect(ex.status).toBeDefined();
    expect(ex).toMatchObject({
      id: "e1",
      name: "실행",
      testPlanId: "plan1",
      description: "",
      startDate: null,
      endDate: null,
      results: {},
    });
  });

  it("createTestResult: NOT_RUN 이면 executedAt 가 null", () => {
    const r = createTestResult("tc1");
    expect(r).toMatchObject({ testCaseId: "tc1", result: "NOT_RUN" });
    expect(r.executedAt).toBeNull();
  });

  it("createTestResult: 결과가 있으면 executedAt 가 채워진다", () => {
    const r = createTestResult("tc1", TestResult.PASS, "메모");
    expect(r.result).toBe("PASS");
    expect(r.notes).toBe("메모");
    expect(r.executedAt).toBeTruthy();
  });
});

describe("models/testPlan", () => {
  it("createTestPlan: 기본 필드", () => {
    const p = createTestPlan("p1", "플랜");
    expect(p).toMatchObject({
      id: "p1",
      name: "플랜",
      description: "",
      testCaseIds: [],
    });
    expect(p.createdAt).toBeTruthy();
  });
});
