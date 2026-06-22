import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportToCSV, exportToExcel } from "./SpreadsheetExport.js";

// 셀 헬퍼: convertDataForExport 가 기대하는 { value } 형태
const cell = (value) => ({ value });
const COLS = ["ID", "이름"];

describe("SpreadsheetExport", () => {
  beforeEach(() => {
    // jsdom 에 없는 URL.createObjectURL/revokeObjectURL 스텁
    window.URL.createObjectURL = vi.fn(() => "blob:mock");
    window.URL.revokeObjectURL = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("exportToCSV", () => {
    it("내보낼 데이터가 없으면 warning 을 반환한다", () => {
      const result = exportToCSV([], COLS);
      expect(result.success).toBe(false);
      expect(result.severity).toBe("warning");
    });

    it("빈 셀만 있는 행은 제외되어 데이터 없음 처리된다", () => {
      const result = exportToCSV([[cell(""), cell("  ")]], COLS);
      expect(result.success).toBe(false);
      expect(result.severity).toBe("warning");
    });

    it("데이터가 있으면 CSV 다운로드를 수행하고 success 를 반환한다", () => {
      const clickSpy = vi
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(() => {});
      const result = exportToCSV([[cell("TC-1"), cell("케이스1")]], COLS);
      expect(result.success).toBe(true);
      expect(result.severity).toBe("success");
      expect(result.message).toMatch(/testcases_.+\.csv/);
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe("exportToExcel", () => {
    it("내보낼 데이터가 없으면 warning 을 반환한다", () => {
      const result = exportToExcel([], COLS);
      expect(result.success).toBe(false);
      expect(result.severity).toBe("warning");
    });
  });
});
