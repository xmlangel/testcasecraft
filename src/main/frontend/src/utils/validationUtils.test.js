import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  validateRequired,
  validateLength,
  validateNumberRange,
  validateMultiple,
  validateForm,
} from "./validationUtils.js";

describe("validationUtils", () => {
  describe("validateEmail", () => {
    it("유효한 이메일은 true", () => {
      expect(validateEmail("a@b.com")).toBe(true);
      expect(validateEmail("  user@example.co.kr  ")).toBe(true);
    });
    it("유효하지 않은 입력은 false", () => {
      expect(validateEmail("a@b")).toBe(false);
      expect(validateEmail("nope")).toBe(false);
      expect(validateEmail("")).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(123)).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("모든 조건 충족 시 strong/valid", () => {
      const r = validatePassword("Abcdef1!");
      expect(r.isValid).toBe(true);
      expect(r.strength).toBe("strong");
      expect(r.issues).toHaveLength(0);
    });
    it("일부 누락 시 medium", () => {
      // 대문자/특수문자 누락 → 2 issues → score 3 → medium
      const r = validatePassword("abcdef12");
      expect(r.strength).toBe("medium");
      expect(r.isValid).toBe(true);
    });
    it("대부분 누락 시 weak/invalid", () => {
      const r = validatePassword("abc");
      expect(r.strength).toBe("weak");
      expect(r.isValid).toBe(false);
      expect(r.issues.length).toBeGreaterThan(0);
    });
    it("빈 입력은 안내 메시지", () => {
      const r = validatePassword("");
      expect(r.isValid).toBe(false);
      expect(r.issues).toContain("비밀번호를 입력해주세요.");
    });
  });

  describe("validateUsername", () => {
    it("유효한 사용자명", () => {
      expect(validateUsername("user_01").isValid).toBe(true);
    });
    it("3자 미만 / 20자 초과 / 허용외 문자", () => {
      expect(validateUsername("ab").isValid).toBe(false);
      expect(validateUsername("a".repeat(21)).isValid).toBe(false);
      expect(validateUsername("한글이름").isValid).toBe(false);
    });
  });

  describe("validateRequired", () => {
    it("값이 있으면 valid, 없으면 메시지", () => {
      expect(validateRequired("x").isValid).toBe(true);
      expect(validateRequired("   ").isValid).toBe(false);
      expect(validateRequired(null, "이름").message).toBe(
        "이름는 필수 입력 항목입니다.",
      );
      expect(validateRequired(0).isValid).toBe(true);
    });
  });

  describe("validateLength", () => {
    it("범위 내/밖", () => {
      expect(validateLength("hello", 3, 10).isValid).toBe(true);
      expect(validateLength("hi", 3).isValid).toBe(false);
      expect(validateLength("toolong", 1, 3).isValid).toBe(false);
      expect(validateLength(123).isValid).toBe(false);
    });
  });

  describe("validateNumberRange", () => {
    it("숫자 범위 검사", () => {
      expect(validateNumberRange(5, 1, 10).isValid).toBe(true);
      expect(validateNumberRange(0, 1, 10).isValid).toBe(false);
      expect(validateNumberRange(11, 1, 10).isValid).toBe(false);
      expect(validateNumberRange(NaN).isValid).toBe(false);
      expect(validateNumberRange("5").isValid).toBe(false);
    });
  });

  describe("validateMultiple", () => {
    it("여러 검증 중 실패한 메시지/이슈를 모은다", () => {
      const r = validateMultiple([
        () => ({ isValid: false, message: "m1" }),
        () => ({ isValid: true }),
        () => ({ isValid: false, issues: ["i1", "i2"] }),
      ]);
      expect(r.isValid).toBe(false);
      expect(r.messages).toEqual(["m1", "i1", "i2"]);
    });
    it("모두 통과하면 isValid true", () => {
      expect(validateMultiple([() => ({ isValid: true })]).isValid).toBe(true);
    });
  });

  describe("validateForm", () => {
    it("필드별 규칙 적용 후 에러 집계", () => {
      const r = validateForm(
        { name: "", age: 5 },
        {
          name: [(v, f) => validateRequired(v, f)],
          age: [(v, f) => validateNumberRange(v, 10, 20, f)],
        },
      );
      expect(r.isValid).toBe(false);
      expect(r.errors.name).toBeDefined();
      expect(r.errors.age).toBeDefined();
    });
    it("모든 규칙 통과 시 errors 비어있음", () => {
      const r = validateForm(
        { name: "ok" },
        { name: [(v, f) => validateRequired(v, f)] },
      );
      expect(r.isValid).toBe(true);
      expect(r.errors).toEqual({});
    });
  });
});
