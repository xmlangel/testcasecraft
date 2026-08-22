// src/utils/ragAvailability.js
/**
 * 두 설정의 조합으로 지금 무엇이 되고 무엇이 안 되는지 판정한다.
 *
 * 설정이 둘이라 상태가 넷이고, 각 상태마다 사용자가 할 수 있는 일이 다르다.
 * 화면 곳곳에서 따로 판단하면 안내가 서로 어긋나므로 여기 한 곳에 모은다.
 *
 *   RAG 켜짐 + 색인 켜짐 → 전부 가능
 *   RAG 켜짐 + 색인 꺼짐 → 질문·검색·조회는 되고, 새 자료 등록만 막힌다
 *   RAG 꺼짐            → 질문까지 모두 막힌다 (색인 설정은 의미가 없어진다)
 */

/** 지금 상태를 나타내는 값. 화면이 이 값으로 문구를 고른다. */
export const RAG_STATE = {
  /** 전부 된다. */
  FULL: "FULL",
  /** 질문은 되고 새 색인만 멈췄다. */
  QUERY_ONLY: "QUERY_ONLY",
  /** 관리자가 통째로 껐다. */
  DISABLED: "DISABLED",
};

/**
 * @param {{ ragEnabled?: boolean, vectorWriteEnabled?: boolean }} status
 *   /api/system-settings/rag/status 응답. 값이 없으면 켜진 것으로 본다(서버 기본값과 같다).
 * @returns {string} RAG_STATE 중 하나
 */
export function resolveRagState(status) {
  if (status?.ragEnabled === false) return RAG_STATE.DISABLED;
  if (status?.vectorWriteEnabled === false) return RAG_STATE.QUERY_ONLY;
  return RAG_STATE.FULL;
}

/**
 * 새 자료를 등록(업로드·분석·색인)할 수 있는 상태인가.
 *
 * 버튼을 미리 막는 데 쓴다. 서버도 같은 기준으로 거부하므로 화면이 통과시켜도
 * 실제로 저장되지는 않지만, 누르기 전에 알려 주는 편이 낫다.
 */
export function canWriteVectors(status) {
  return resolveRagState(status) === RAG_STATE.FULL;
}

/** 질문·검색·문서 조회를 할 수 있는 상태인가. */
export function canQuery(status) {
  return resolveRagState(status) !== RAG_STATE.DISABLED;
}
