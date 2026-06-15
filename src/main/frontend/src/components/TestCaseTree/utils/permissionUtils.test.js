import { describe, it, expect } from "vitest";
import { isViewer, canDelete, canAdd } from "./permissionUtils.js";

describe("permissionUtils", () => {
  describe("isViewer", () => {
    it("VIEWER 만 true", () => {
      expect(isViewer("VIEWER")).toBe(true);
      expect(isViewer("ADMIN")).toBe(false);
      expect(isViewer(null)).toBe(false);
    });
  });

  describe("canDelete", () => {
    it("ADMIN/MANAGER 만 삭제 가능", () => {
      expect(canDelete("ADMIN")).toBe(true);
      expect(canDelete("MANAGER")).toBe(true);
      expect(canDelete("TESTER")).toBe(false);
      expect(canDelete("USER")).toBe(false);
      expect(canDelete("VIEWER")).toBe(false);
      expect(canDelete(null)).toBe(false);
    });
  });

  describe("canAdd", () => {
    it("VIEWER 와 null 만 차단, 그 외 시스템 role 은 허용", () => {
      expect(canAdd("ADMIN")).toBe(true);
      expect(canAdd("MANAGER")).toBe(true);
      expect(canAdd("TESTER")).toBe(true);
      expect(canAdd("USER")).toBe(true);
      expect(canAdd("VIEWER")).toBe(false);
      expect(canAdd(null)).toBe(false);
      expect(canAdd(undefined)).toBe(false);
    });
  });
});
