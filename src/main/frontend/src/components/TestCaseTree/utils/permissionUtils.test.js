import { describe, it, expect } from "vitest";
import {
  isViewer,
  canDelete,
  canAdd,
  canEditProjectContent,
  canRecordTestResult,
} from "./permissionUtils.js";

describe("permissionUtils", () => {
  describe("canEditProjectContent", () => {
    it("편집 가능 프로젝트 역할만 true", () => {
      expect(canEditProjectContent("ADMIN")).toBe(true);
      expect(canEditProjectContent("PROJECT_MANAGER")).toBe(true);
      expect(canEditProjectContent("LEAD_DEVELOPER")).toBe(true);
      expect(canEditProjectContent("DEVELOPER")).toBe(true);
      expect(canEditProjectContent("CONTRIBUTOR")).toBe(true);
      expect(canEditProjectContent("TESTER")).toBe(false);
      expect(canEditProjectContent("VIEWER")).toBe(false);
      expect(canEditProjectContent(null)).toBe(false);
      expect(canEditProjectContent(undefined)).toBe(false);
    });
  });

  describe("isViewer", () => {
    it("편집 불가 역할(VIEWER/TESTER/미확정)만 true", () => {
      expect(isViewer("VIEWER")).toBe(true);
      expect(isViewer("TESTER")).toBe(true);
      expect(isViewer(null)).toBe(true);
      expect(isViewer("ADMIN")).toBe(false);
      expect(isViewer("PROJECT_MANAGER")).toBe(false);
      expect(isViewer("DEVELOPER")).toBe(false);
    });
  });

  describe("canDelete", () => {
    it("편집 가능 프로젝트 역할만 삭제 가능", () => {
      expect(canDelete("ADMIN")).toBe(true);
      expect(canDelete("PROJECT_MANAGER")).toBe(true);
      expect(canDelete("LEAD_DEVELOPER")).toBe(true);
      expect(canDelete("DEVELOPER")).toBe(true);
      expect(canDelete("CONTRIBUTOR")).toBe(true);
      expect(canDelete("TESTER")).toBe(false);
      expect(canDelete("VIEWER")).toBe(false);
      expect(canDelete(null)).toBe(false);
    });
  });

  describe("canAdd", () => {
    it("편집 가능 프로젝트 역할만 추가 가능", () => {
      expect(canAdd("ADMIN")).toBe(true);
      expect(canAdd("PROJECT_MANAGER")).toBe(true);
      expect(canAdd("CONTRIBUTOR")).toBe(true);
      expect(canAdd("TESTER")).toBe(false);
      expect(canAdd("VIEWER")).toBe(false);
      expect(canAdd(null)).toBe(false);
      expect(canAdd(undefined)).toBe(false);
    });
  });

  describe("canRecordTestResult", () => {
    it("편집 가능 role에 더해 TESTER도 결과 기록 가능", () => {
      expect(canRecordTestResult("ADMIN")).toBe(true);
      expect(canRecordTestResult("PROJECT_MANAGER")).toBe(true);
      expect(canRecordTestResult("DEVELOPER")).toBe(true);
      expect(canRecordTestResult("TESTER")).toBe(true);
      expect(canRecordTestResult("VIEWER")).toBe(false);
      expect(canRecordTestResult(null)).toBe(false);
    });
  });
});
