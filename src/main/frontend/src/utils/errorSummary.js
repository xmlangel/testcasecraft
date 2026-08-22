// src/utils/errorSummary.js
/**
 * 서버 오류 문구를 "요약"과 "전문"으로 가른다.
 *
 * 백엔드는 실패 사유에 원인 사슬과 응답 본문을 그대로 이어 붙인다. 예를 들어 이런 형태다.
 *
 *   OpenRouter API 호출 실패 (상태코드: 429 TOO_MANY_REQUESTS): [호출 주소: https://…]
 *   {"error":{"message":"Provider returned error","code":429,"metadata":{…}}}
 *
 * 전문은 원인을 짚는 데 필요하지만 화면에 그대로 실으면 읽히지 않는다. 그래서 무엇이 실패했는지
 * 알 수 있는 앞머리만 보여 주고, 전문은 사용자가 펼칠 때만 내보낸다.
 */

/** 상세가 시작되는 지점을 알리는 표지들. 이 앞까지가 요약이다. */
const DETAIL_MARKERS = ["[호출 주소:", "<!DOCTYPE", "<html", '{"', "{\n"];

/** 요약이 이보다 길면 잘라낸다. */
const SUMMARY_MAX = 200;

/**
 * @param {string|null|undefined} message 서버가 내려준 오류 문구
 * @returns {{summary: string, detail: string|null}}
 *   summary 는 화면에 바로 보일 한 줄, detail 은 펼쳤을 때 보일 전문.
 *   요약이 전문과 같으면 detail 은 null 이다(펼칠 것이 없으므로 버튼도 띄우지 않는다).
 */
export function splitErrorMessage(message) {
  if (typeof message !== "string" || message.trim() === "") {
    return { summary: "", detail: null };
  }

  const full = message.trim();
  let summary = full;

  // 1) 여러 줄이면 첫 줄만 쓴다. 스택트레이스가 붙는 경우가 그렇다.
  const newline = summary.indexOf("\n");
  if (newline > 0) {
    summary = summary.slice(0, newline);
  }

  // 2) 상세 표지가 나오면 그 앞까지 자른다.
  for (const marker of DETAIL_MARKERS) {
    const at = summary.indexOf(marker);
    if (at > 0) {
      summary = summary.slice(0, at);
    }
  }

  // 3) 괄호로 닫은 뒤 콜론이 오면 거기까지가 한 덩어리다.
  //    "…실패 (상태코드: 429 TOO_MANY_REQUESTS): {본문}" → "…실패 (상태코드: 429 TOO_MANY_REQUESTS)"
  const closedParen = summary.lastIndexOf("): ");
  if (closedParen > 0) {
    summary = summary.slice(0, closedParen + 1);
  }

  summary = summary.replace(/[\s:]+$/, "").trim();

  // 4) 그래도 길면 잘라낸다.
  let truncated = false;
  if (summary.length > SUMMARY_MAX) {
    summary = summary.slice(0, SUMMARY_MAX).trim();
    truncated = true;
  }

  // 자를 것이 없었으면 요약이 곧 전문이다.
  if (!truncated && summary === full) {
    return { summary, detail: null };
  }

  // 요약이 비어 버리는 형태(전문이 JSON 하나뿐인 경우)에는 요약을 만들지 않는다.
  if (summary === "") {
    return { summary: full.slice(0, SUMMARY_MAX), detail: full };
  }

  return { summary, detail: full };
}
