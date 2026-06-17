import { describe, it, expect } from "vitest";
import { ApiError } from "../services/apiService.js";
import {
  ErrorTypes,
  classifyError,
  getUserFriendlyMessage,
} from "./errorHandler.js";

const apiErr = (status, message = "msg") => new ApiError(message, status);

describe("errorHandler", () => {
  describe("classifyError", () => {
    it("status 0 → NETWORK", () => {
      expect(classifyError(apiErr(0))).toBe(ErrorTypes.NETWORK);
    });
    it("401/403 → AUTH", () => {
      expect(classifyError(apiErr(401))).toBe(ErrorTypes.AUTH);
      expect(classifyError(apiErr(403))).toBe(ErrorTypes.AUTH);
    });
    it("기타 4xx → VALIDATION", () => {
      expect(classifyError(apiErr(400))).toBe(ErrorTypes.VALIDATION);
      expect(classifyError(apiErr(404))).toBe(ErrorTypes.VALIDATION);
    });
    it("5xx → SERVER", () => {
      expect(classifyError(apiErr(500))).toBe(ErrorTypes.SERVER);
      expect(classifyError(apiErr(503))).toBe(ErrorTypes.SERVER);
    });
    it("ApiError 가 아니면 UNKNOWN", () => {
      expect(classifyError(new Error("plain"))).toBe(ErrorTypes.UNKNOWN);
      expect(classifyError(null)).toBe(ErrorTypes.UNKNOWN);
    });
  });

  describe("getUserFriendlyMessage", () => {
    it("타입별 사용자 메시지", () => {
      expect(getUserFriendlyMessage(apiErr(0))).toBe(
        "네트워크 연결을 확인해주세요.",
      );
      expect(getUserFriendlyMessage(apiErr(401))).toBe(
        "로그인이 필요하거나 권한이 없습니다.",
      );
      expect(getUserFriendlyMessage(apiErr(500))).toBe(
        "서버에서 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    });
    it("VALIDATION 은 원본 메시지를 우선 사용", () => {
      expect(getUserFriendlyMessage(apiErr(400, "이메일 형식 오류"))).toBe(
        "이메일 형식 오류",
      );
    });
    it("UNKNOWN 은 원본 메시지 또는 기본 문구", () => {
      expect(getUserFriendlyMessage(new Error("boom"))).toBe("boom");
      expect(getUserFriendlyMessage({})).toBe(
        "알 수 없는 오류가 발생했습니다.",
      );
    });
  });
});
