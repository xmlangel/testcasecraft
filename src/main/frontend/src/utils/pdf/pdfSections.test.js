import { describe, it, expect, vi } from "vitest";
import {
  addHeaderSection,
  addExecutiveSummary,
  addTestSuiteResults,
  addTestCaseDetails,
  addFailedTestAnalysis,
} from "./pdfSections.js";

// jsPDF 모의 — 모든 메서드를 no-op 으로 받고 text 호출만 기록한다.
const makeMockPdf = () => {
  const textCalls = [];
  const handler = {
    get(target, prop) {
      if (prop === "text")
        return (...args) => {
          textCalls.push(args[0]);
        };
      if (prop === "internal")
        return { pageSize: { getHeight: () => 297, getWidth: () => 210 } };
      if (prop === "__textCalls") return textCalls;
      // splitTextToSize 류는 배열을 기대 → 입력을 배열로 감싸 반환
      if (prop === "splitTextToSize")
        return (text) => (Array.isArray(text) ? text : [String(text)]);
      return () => undefined; // setFont/setFontSize/rect/line/addPage 등
    },
  };
  return new Proxy({}, handler);
};

const testResult = {
  totalTests: 10,
  failures: 1,
  errors: 1,
  skipped: 2,
  uploadedAt: [2026, 6, 16, 10, 0, 0],
  uploadedBy: { displayName: "테스터" },
};

describe("pdfSections 빌더 (스모크)", () => {
  it("addHeaderSection 은 다음 Y 좌표(number)를 반환하고 text 를 그린다", () => {
    const pdf = makeMockPdf();
    const y = addHeaderSection(pdf, testResult, 10, 20, 210);
    expect(typeof y).toBe("number");
    expect(pdf.__textCalls.length).toBeGreaterThan(0);
  });

  it("addExecutiveSummary 가 throw 없이 number 를 반환한다", () => {
    const pdf = makeMockPdf();
    const y = addExecutiveSummary(pdf, testResult, [], [], 10, 30, 210, 297);
    expect(typeof y).toBe("number");
  });

  it("addTestSuiteResults / addTestCaseDetails / addFailedTestAnalysis 가 빈 입력에도 동작한다", () => {
    const pdf = makeMockPdf();
    expect(typeof addTestSuiteResults(pdf, [], [], 10, 30, 210, 297)).toBe(
      "number",
    );
    expect(typeof addTestCaseDetails(pdf, [], 10, 30, 210, 297)).toBe("number");
    expect(typeof addFailedTestAnalysis(pdf, [], 10, 30, 210, 297)).toBe(
      "number",
    );
  });
});
