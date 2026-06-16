import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

const { getTestCasesBySuite, exportPDF, exportCSV } = vi.hoisted(() => ({
  getTestCasesBySuite: vi.fn(),
  exportPDF: vi.fn(),
  exportCSV: vi.fn(),
}));
vi.mock("../../../services/junitResultService", () => ({
  default: { getTestCasesBySuite },
}));
vi.mock("../../../utils/pdfExportUtils", () => ({
  exportTestResultToPDF: exportPDF,
}));
vi.mock("../../../utils/csvExportUtils", () => ({
  exportTestResultToCSV: exportCSV,
}));

import useJunitExport from "./useJunitExport.js";

const t = (key) => key;
const suites = [
  { id: 1, name: "s1" },
  { id: 2, name: "s2" },
];

describe("useJunitExport", () => {
  beforeEach(() => {
    getTestCasesBySuite
      .mockReset()
      .mockResolvedValue({ content: [{ id: "tc" }] });
    exportPDF
      .mockReset()
      .mockResolvedValue({ success: true, fileName: "r.pdf" });
    exportCSV
      .mockReset()
      .mockResolvedValue({ success: true, fileName: "r.csv" });
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("testResult 가 없으면 알림만 띄우고 export 하지 않는다", async () => {
    const { result } = renderHook(() =>
      useJunitExport({ testResult: null, testSuites: suites, t }),
    );
    await act(async () => {
      await result.current.handleExportToPDF();
    });
    expect(exportPDF).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it("PDF: 모든 스위트의 케이스를 모아 exportTestResultToPDF 를 호출한다", async () => {
    const testResult = { id: "tr" };
    const { result } = renderHook(() =>
      useJunitExport({ testResult, testSuites: suites, t }),
    );
    await act(async () => {
      await result.current.handleExportToPDF();
    });
    expect(getTestCasesBySuite).toHaveBeenCalledTimes(2); // 스위트 2개
    expect(exportPDF).toHaveBeenCalledWith(testResult, suites, [
      { id: "tc" },
      { id: "tc" },
    ]);
    await waitFor(() => expect(result.current.exportingPDF).toBe(false));
  });

  it("CSV: exportTestResultToCSV 를 호출한다", async () => {
    const testResult = { id: "tr" };
    const { result } = renderHook(() =>
      useJunitExport({ testResult, testSuites: suites, t }),
    );
    await act(async () => {
      await result.current.handleExportToCSV();
    });
    expect(exportCSV).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(result.current.exportingCSV).toBe(false));
  });
});
