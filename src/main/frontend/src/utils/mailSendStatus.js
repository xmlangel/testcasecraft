// src/utils/mailSendStatus.js
/**
 * ICT-439: 인증 메일은 서버가 비동기로 보낸다.
 *
 * 발송 요청 응답은 "접수했다"는 뜻일 뿐이라, 실제로 보냈는지는 응답의 requestId 로
 * /api/email-verification/send-status/{requestId} 를 조회해 확인한다. 화면은 이 결과로
 * 성공·실패를 띄운다. 실패 원인의 원문은 서버 로그에만 있고 여기에는 분류 코드만 온다.
 */

export const MAIL_SEND_STATUS = {
  PENDING: "PENDING",
  SENT: "SENT",
  FAILED: "FAILED",
  /** 조회 시간 안에 결과가 나오지 않았다. 서버 상태가 아니라 화면이 붙이는 값이다. */
  UNKNOWN: "UNKNOWN",
};

/**
 * 시간 제한: SMTP 연결·응답·전송에 각각 5초가 걸리고 발송 대기열에서 기다릴 수도 있어
 * 넉넉하게 30초를 둔다.
 */
export const DEFAULT_POLL = { intervalMs: 1000, timeoutMs: 30000 };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 발송 결과가 PENDING 을 벗어날 때까지 조회한다.
 *
 * @param {string} requestId 발송 요청 응답의 requestId
 * @param {(url: string) => Promise<Response>} fetchFn 인증 헤더를 붙여 GET 하는 함수
 * @returns {Promise<{status: string, errorCode: string|null}>}
 */
export async function waitForMailSendResult(
  requestId,
  fetchFn,
  { intervalMs, timeoutMs, wait = sleep } = DEFAULT_POLL,
) {
  const interval = intervalMs ?? DEFAULT_POLL.intervalMs;
  const timeout = timeoutMs ?? DEFAULT_POLL.timeoutMs;
  const url = `/api/email-verification/send-status/${encodeURIComponent(requestId)}`;
  let waited = 0;
  while (waited <= timeout) {
    try {
      const response = await fetchFn(url);
      if (response.ok) {
        const body = await response.json();
        if (body.status && body.status !== MAIL_SEND_STATUS.PENDING) {
          return { status: body.status, errorCode: body.errorCode ?? null };
        }
      }
    } catch {
      // 일시적인 조회 실패는 다음 회차에 다시 본다
    }
    await wait(interval);
    waited += interval;
  }
  return { status: MAIL_SEND_STATUS.UNKNOWN, errorCode: null };
}

/**
 * 발송 결과에 맞는 화면 문구와 심각도를 고른다.
 *
 * @param {(key: string, fallback: string) => string} t i18n 함수
 * @param {{status: string, errorCode: string|null}} result
 * @returns {{severity: "success"|"error"|"warning", message: string}}
 */
export function describeMailSendResult(t, result) {
  if (result.status === MAIL_SEND_STATUS.SENT) {
    return {
      severity: "success",
      message: t(
        "mailSend.result.sent",
        "인증 이메일이 발송되었습니다. 이메일을 확인하세요.",
      ),
    };
  }
  if (result.status === MAIL_SEND_STATUS.FAILED) {
    return {
      severity: "error",
      message: describeMailSendError(t, result.errorCode),
    };
  }
  return {
    severity: "warning",
    message: t(
      "mailSend.result.unknown",
      "발송 결과를 아직 확인하지 못했습니다. 잠시 뒤 메일함을 확인하고, 메일이 오지 않으면 다시 시도하세요.",
    ),
  };
}

function describeMailSendError(t, errorCode) {
  switch (errorCode) {
    case "CONNECT_FAILED":
      return t(
        "mailSend.error.connectFailed",
        "메일 서버에 연결하지 못해 인증 이메일을 보내지 못했습니다. 관리자에게 메일 서버 주소와 포트를 확인해 달라고 요청하세요.",
      );
    case "AUTH_FAILED":
      return t(
        "mailSend.error.authFailed",
        "메일 서버 로그인에 실패해 인증 이메일을 보내지 못했습니다. 관리자에게 메일 계정 설정을 확인해 달라고 요청하세요.",
      );
    case "TIMEOUT":
      return t(
        "mailSend.error.timeout",
        "메일 서버가 응답하지 않아 인증 이메일을 보내지 못했습니다. 잠시 뒤 다시 시도하세요.",
      );
    case "REJECTED":
      return t(
        "mailSend.error.rejected",
        "발송 요청이 몰려 인증 이메일을 보내지 못했습니다. 잠시 뒤 다시 시도하세요.",
      );
    default:
      return t(
        "mailSend.error.failed",
        "인증 이메일 발송에 실패했습니다. 잠시 뒤 다시 시도하세요.",
      );
  }
}
