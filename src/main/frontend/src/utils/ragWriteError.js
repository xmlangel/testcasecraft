// src/utils/ragWriteError.js
/**
 * RAG 쓰기 요청(업로드·분석·임베딩 생성)의 실패를 다룬다.
 *
 * 이 경로들은 응답 상태를 보지 않고 곧바로 json() 을 읽어 왔다. 서버가 실패를 JSON 으로
 * 내려주면 그것이 문서로 등록되어 목록에 깨진 항목이 생긴다. 상태를 먼저 확인하고,
 * 서버가 준 errorCode 를 붙여 호출부가 원인을 가려낼 수 있게 한다.
 */

/** 관리자가 벡터 색인을 꺼 둔 상태. 백엔드 RagVectorWriteDisabledException.ERROR_CODE 와 같은 값. */
import { buildApiError } from "./apiError.js";

export const RAG_VECTOR_WRITE_DISABLED = "RAG_VECTOR_WRITE_DISABLED";

/**
 * 실패 응답에서 원인을 꺼내 에러로 만든다.
 *
 * @param {Response} response fetch 응답
 * @param {string} fallbackMessage 사유를 읽지 못했을 때 쓸 문구
 * @returns {Promise<Error>} statusCode·errorCode·errorMessage 가 붙은 에러
 */
export async function buildRagWriteError(response, fallbackMessage) {
  return buildApiError(response, fallbackMessage);
}

/** 벡터 색인이 꺼져 있어 거부된 것인지 판정한다. */
export function isVectorWriteDisabled(error) {
  return error?.errorCode === RAG_VECTOR_WRITE_DISABLED;
}

/**
 * 화면에 보여줄 문구를 고른다.
 *
 * @param {Error|null|undefined} error 잡은 에러
 * @param {(key: string, fallback: string) => string} t 번역 함수
 * @param {string} fallbackMessage 어느 규칙에도 걸리지 않을 때 쓸 문구
 */
export function describeRagWriteError(error, t, fallbackMessage) {
  if (!error) return fallbackMessage;

  if (isVectorWriteDisabled(error)) {
    return t(
      "rag.document.error.vectorWriteDisabled",
      "벡터 색인이 중지되어 있어 이 작업을 할 수 없습니다. 이미 색인된 자료로 질문하는 것은 그대로 됩니다. 관리자 설정에서 다시 켤 수 있습니다.",
    );
  }

  return error.errorMessage || fallbackMessage;
}
