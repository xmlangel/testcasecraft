// src/utils/ragErrorMessage.js
/**
 * RAG 질의 실패를 사람이 읽을 문구로 옮긴다.
 *
 * 실패는 세 층에서 온다.
 *   1. 서버가 원인을 담아 응답한 경우 (errorMessage)
 *   2. 앞단 프록시가 끊은 경우 (statusCode 만 있고 본문은 HTML)
 *   3. 브라우저가 연결 자체를 못 맺은 경우
 * 층마다 사용자가 할 일이 다르므로 문구도 갈라 준다.
 */

/** 앞단(프록시·게이트웨이)이 끊었을 때 오는 상태 코드. 본문은 대개 HTML 이라 사유가 없다. */
export const GATEWAY_TIMEOUT_STATUSES = [408, 502, 503, 504, 522, 524];

/** 로그인이 풀렸거나 권한이 없는 경우. */
const AUTH_STATUSES = [401, 403];

/**
 * @param {Error|null|undefined} error 잡은 에러. statusCode·errorMessage 가 붙어 있을 수 있다.
 * @param {(key: string, fallback: string) => string} t 번역 함수
 * @returns {string|null} 화면에 보여줄 문구. 판단할 근거가 없으면 null.
 */
export function isAbortError(error) {
  return error?.name === "AbortError";
}

export function describeRagError(error, t) {
  if (!error) return null;

  // 사용자가 중지를 누른 것은 실패가 아니다. 오류로 보여 주면 잘못한 것처럼 읽힌다.
  if (isAbortError(error)) return null;

  // 서버가 원인을 보냈으면 그대로 쓴다. 우리가 다시 쓰면 정보가 줄어든다.
  if (error.errorMessage) return error.errorMessage;

  const status = error.statusCode;

  if (GATEWAY_TIMEOUT_STATUSES.includes(status)) {
    return t(
      "rag.chat.error.gatewayTimeout",
      "응답이 제한 시간 안에 오지 않아 연결이 끊겼습니다. 서버는 아직 처리하고 있을 수 있습니다. 질문을 짧게 나누거나 잠시 후 다시 시도해 주세요.",
    );
  }

  if (AUTH_STATUSES.includes(status)) {
    return t(
      "rag.chat.error.unauthorized",
      "인증이 만료되었거나 권한이 없습니다. 다시 로그인한 뒤 시도해 주세요.",
    );
  }

  if (typeof status === "number" && status >= 500) {
    return t(
      "rag.chat.error.serverError",
      "서버에서 요청을 처리하지 못했습니다. 잠시 후 다시 시도하고, 계속되면 서버 로그를 확인해야 합니다.",
    );
  }

  // 상태 코드가 없으면 연결 자체가 맺어지지 않은 경우다(네트워크 단절·중단).
  if (
    status === undefined &&
    error.name === "TypeError" &&
    !isAbortError(error)
  ) {
    return t(
      "rag.chat.error.networkFailed",
      "서버에 연결하지 못했습니다. 네트워크 상태를 확인해 주세요.",
    );
  }

  return null;
}
