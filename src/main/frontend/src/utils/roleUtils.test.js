import { describe, it, expect } from "vitest";
import { getRoleChipColor, getRoleDisplayName } from "./roleUtils.js";

describe("roleUtils", () => {
  describe("getRoleChipColor", () => {
    it("역할별 칩 색상을 반환한다", () => {
      expect(getRoleChipColor("OWNER")).toBe("error");
      expect(getRoleChipColor("ADMIN")).toBe("warning");
      expect(getRoleChipColor("MEMBER")).toBe("default");
    });
    it("알 수 없는 역할은 default", () => {
      expect(getRoleChipColor("GUEST")).toBe("default");
      expect(getRoleChipColor(undefined)).toBe("default");
    });
  });

  describe("getRoleDisplayName", () => {
    it("역할별 표시명을 반환한다", () => {
      expect(getRoleDisplayName("OWNER")).toBe("Owner");
      expect(getRoleDisplayName("ADMIN")).toBe("Admin");
      expect(getRoleDisplayName("MEMBER")).toBe("Member");
    });
    it("알 수 없는 역할은 입력값을 그대로 반환한다", () => {
      expect(getRoleDisplayName("CUSTOM")).toBe("CUSTOM");
    });
  });
});
