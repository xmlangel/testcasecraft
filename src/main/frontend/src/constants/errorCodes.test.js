import { describe, it, expect } from "vitest";
import {
  ERROR_CODES,
  ENCRYPTION_KEY_ENV_VAR,
  ENCRYPTION_KEY_GENERATE_COMMAND,
  isEncryptionKeyError,
} from "./errorCodes.js";

describe("errorCodes - isEncryptionKeyError", () => {
  it("서버가 내려준 errorCode 가 일치하면 true", () => {
    const error = new Error("Failed to test unsaved LLM settings");
    error.errorCode = ERROR_CODES.ENCRYPTION_KEY_NOT_CONFIGURED;
    expect(isEncryptionKeyError(error)).toBe(true);
  });

  it("다른 errorCode 는 false", () => {
    const error = new Error("boom");
    error.errorCode = "SOME_OTHER_CODE";
    expect(isEncryptionKeyError(error)).toBe(false);
  });

  it("errorCode 가 없으면 문구가 비슷해도 false", () => {
    // 문구 매칭으로 판정하지 않는다. 새 실패 경로는 백엔드가 errorCode 를 싣도록 고친다.
    const error = new Error("암호화 키가 설정되지 않았습니다");
    expect(isEncryptionKeyError(error)).toBe(false);
  });

  it("null·undefined 는 false", () => {
    expect(isEncryptionKeyError(null)).toBe(false);
    expect(isEncryptionKeyError(undefined)).toBe(false);
  });
});

describe("errorCodes - 안내에 쓰는 상수", () => {
  it("환경변수 이름은 백엔드 ENV_VAR_NAME 과 같다", () => {
    expect(ENCRYPTION_KEY_ENV_VAR).toBe("JIRA_ENCRYPTION_KEY");
  });

  it("키 생성 명령은 AES-256 에 맞는 32바이트를 만든다", () => {
    expect(ENCRYPTION_KEY_GENERATE_COMMAND).toBe("openssl rand -base64 32");
  });
});
