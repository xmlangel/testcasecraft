import { describe, it, expect } from "vitest";
import {
  buildRagWriteError,
  describeRagWriteError,
  isVectorWriteDisabled,
  RAG_VECTOR_WRITE_DISABLED,
} from "./ragWriteError.js";

const t = (key, fallback) => fallback;

// fetch Response 를 흉내 낸다. text() 만 쓰므로 그것만 둔다.
const responseOf = (status, body) => ({
  status,
  ok: status >= 200 && status < 300,
  text: async () => body,
});

describe("buildRagWriteError", () => {
  it("서버가 준 errorCode 와 사유를 붙인다", async () => {
    const body = JSON.stringify({
      errorCode: RAG_VECTOR_WRITE_DISABLED,
      message: "벡터 색인이 중지되어 있습니다.",
    });
    const error = await buildRagWriteError(responseOf(409, body), "기본 문구");

    expect(error.statusCode).toBe(409);
    expect(error.errorCode).toBe(RAG_VECTOR_WRITE_DISABLED);
    expect(error.errorMessage).toBe("벡터 색인이 중지되어 있습니다.");
  });

  it("HTML 본문은 버리고 기본 문구를 쓴다", async () => {
    // 앞단 프록시가 끊으면 HTML 이 온다. 그 조각은 읽을 수 없다.
    const error = await buildRagWriteError(
      responseOf(524, "<!DOCTYPE html><html>timeout</html>"),
      "기본 문구",
    );

    expect(error.statusCode).toBe(524);
    expect(error.errorCode).toBeNull();
    expect(error.errorMessage).toBe("기본 문구");
  });

  it("본문이 비어도 상태 코드는 남는다", async () => {
    const error = await buildRagWriteError(responseOf(500, ""), "기본 문구");
    expect(error.statusCode).toBe(500);
    expect(error.errorMessage).toBe("기본 문구");
  });
});

describe("describeRagWriteError", () => {
  it("벡터 색인 중지는 전용 안내로 바꾼다", () => {
    const error = new Error("boom");
    error.errorCode = RAG_VECTOR_WRITE_DISABLED;
    error.errorMessage = "서버 원문";

    const message = describeRagWriteError(error, t, "기본 문구");
    expect(message).toContain("질문하는 것은 그대로");
  });

  it("그 밖에는 서버 사유를 그대로 쓴다", () => {
    const error = new Error("boom");
    error.errorMessage = "문서 형식을 읽을 수 없습니다.";
    expect(describeRagWriteError(error, t, "기본 문구")).toBe(
      "문서 형식을 읽을 수 없습니다.",
    );
  });

  it("사유가 없으면 기본 문구", () => {
    expect(describeRagWriteError(new Error("boom"), t, "기본 문구")).toBe(
      "기본 문구",
    );
    expect(describeRagWriteError(null, t, "기본 문구")).toBe("기본 문구");
  });
});

describe("isVectorWriteDisabled", () => {
  it("코드가 맞을 때만 참", () => {
    const error = new Error("boom");
    error.errorCode = RAG_VECTOR_WRITE_DISABLED;
    expect(isVectorWriteDisabled(error)).toBe(true);

    error.errorCode = "OTHER";
    expect(isVectorWriteDisabled(error)).toBe(false);
    expect(isVectorWriteDisabled(null)).toBe(false);
  });
});
