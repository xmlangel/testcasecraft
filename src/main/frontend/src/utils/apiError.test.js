import { describe, it, expect } from "vitest";
import {
  buildApiError,
  serverErrorMessage,
  resolveErrorMessage,
} from "./apiError.js";

const responseOf = (status, body) => ({
  status,
  ok: status >= 200 && status < 300,
  text: async () => body,
});

describe("buildApiError", () => {
  it("서버가 준 사유와 코드를 싣는다", async () => {
    const body = JSON.stringify({ errorCode: "SOME_CODE", message: "사유" });
    const error = await buildApiError(responseOf(409, body), "기본");

    expect(error.statusCode).toBe(409);
    expect(error.errorCode).toBe("SOME_CODE");
    expect(error.errorMessage).toBe("사유");
  });

  it("HTML 본문은 버린다", async () => {
    // 앞단 프록시가 끊으면 HTML 이 온다. 조각을 보여 주면 읽을 수 없다.
    const error = await buildApiError(
      responseOf(524, "<!DOCTYPE html><html>timeout</html>"),
      "기본",
    );
    expect(error.errorMessage).toBe("기본");
    expect(error.errorCode).toBeNull();
  });

  it("기본 문구를 주지 않으면 null 로 둔다", async () => {
    const error = await buildApiError(responseOf(500, ""));
    expect(error.errorMessage).toBeNull();
    expect(error.statusCode).toBe(500);
  });
});

describe("serverErrorMessage", () => {
  it("fetch 경로에서 붙인 errorMessage 를 읽는다", () => {
    const error = new Error("boom");
    error.errorMessage = "서버 사유";
    expect(serverErrorMessage(error)).toBe("서버 사유");
  });

  it("axios 모양도 읽는다", () => {
    // axiosInstance 를 쓰는 코드는 이 모양으로 온다.
    const error = { response: { data: { message: "axios 사유" } } };
    expect(serverErrorMessage(error)).toBe("axios 사유");
  });

  it("error.message 는 보지 않는다", () => {
    // 늘 참이라 호출부가 정한 구체적인 문구를 가려버린다.
    expect(serverErrorMessage(new Error("내부 문구"))).toBeNull();
  });

  it("없으면 null", () => {
    expect(serverErrorMessage(null)).toBeNull();
    expect(serverErrorMessage(undefined)).toBeNull();
    expect(serverErrorMessage({})).toBeNull();
  });
});

describe("resolveErrorMessage", () => {
  it("서버 사유가 가장 우선", () => {
    const error = new Error("내부 문구");
    error.errorMessage = "서버 사유";
    expect(resolveErrorMessage(error, "기본")).toBe("서버 사유");
  });

  it("사유가 없으면 error.message", () => {
    expect(resolveErrorMessage(new Error("내부 문구"), "기본")).toBe(
      "내부 문구",
    );
  });

  it("아무것도 없으면 기본 문구", () => {
    expect(resolveErrorMessage(null, "기본")).toBe("기본");
    expect(resolveErrorMessage({}, "기본")).toBe("기본");
  });
});
