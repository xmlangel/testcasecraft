import { describe, it, expect } from "vitest";
import {
  describeRagError,
  describeRagWriteError,
  isAbortError,
  isVectorWriteDisabled,
  GATEWAY_TIMEOUT_STATUSES,
  RAG_VECTOR_WRITE_DISABLED,
} from "./ragError.js";

const t = (key, fallback) => fallback;

describe("describeRagError", () => {
  it("서버가 사유를 보냈으면 그대로 쓴다", () => {
    const error = new Error("RAG request failed with status 400");
    error.statusCode = 400;
    error.errorMessage =
      "OpenWebUI API 인증에 실패했습니다 (401/403). 등록된 API Key가 올바르고 만료되지 않았는지 확인해 주세요.";
    expect(describeRagError(error, t)).toBe(error.errorMessage);
  });

  it("Cloudflare 524 는 다시 시도 안내로 바꾼다", () => {
    const error = new Error("RAG request failed with status 524");
    error.statusCode = 524;
    const message = describeRagError(error, t);
    expect(message).toContain("제한 시간");
    expect(message).not.toContain("524");
  });

  it("앞단이 끊는 상태 코드는 모두 같은 안내를 낸다", () => {
    for (const status of GATEWAY_TIMEOUT_STATUSES) {
      const error = new Error("boom");
      error.statusCode = status;
      expect(describeRagError(error, t)).toContain("제한 시간");
    }
  });

  it("401·403 은 로그인 안내", () => {
    for (const status of [401, 403]) {
      const error = new Error("boom");
      error.statusCode = status;
      expect(describeRagError(error, t)).toContain("로그인");
    }
  });

  it("500 은 서버 오류 안내", () => {
    const error = new Error("boom");
    error.statusCode = 500;
    expect(describeRagError(error, t)).toContain("서버");
  });

  it("연결 자체가 실패하면 네트워크 안내", () => {
    const error = new TypeError("Failed to fetch");
    expect(describeRagError(error, t)).toContain("네트워크");
  });

  it("판단할 근거가 없으면 null 을 돌려 호출부가 정하게 한다", () => {
    expect(describeRagError(new Error("boom"), t)).toBeNull();
    expect(describeRagError(null, t)).toBeNull();
    expect(describeRagError(undefined, t)).toBeNull();
  });

  it("사유가 있으면 상태 코드보다 우선한다", () => {
    const error = new Error("boom");
    error.statusCode = 524;
    error.errorMessage = "구체적인 서버 사유";
    expect(describeRagError(error, t)).toBe("구체적인 서버 사유");
  });
});

describe("isAbortError - 사용자가 중지한 경우", () => {
  const abortError = () => {
    const error = new Error("The operation was aborted.");
    error.name = "AbortError";
    return error;
  };

  it("중단은 실패가 아니므로 문구를 만들지 않는다", () => {
    expect(describeRagError(abortError(), t)).toBeNull();
  });

  it("중단 여부를 판정한다", () => {
    expect(isAbortError(abortError())).toBe(true);
    expect(isAbortError(new TypeError("Failed to fetch"))).toBe(false);
    expect(isAbortError(null)).toBe(false);
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
