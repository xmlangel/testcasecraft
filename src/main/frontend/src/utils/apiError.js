// src/utils/apiError.js
/**
 * fetch 로 부른 API 의 실패를 다룬다.
 *
 * 이 저장소는 대부분 fetch 를 쓰는데 오류 처리는 `err.response?.data?.message` 로
 * 적혀 있었다. 그것은 axios 가 만드는 모양이라 fetch 응답에서는 언제나 undefined 이고,
 * 서버가 보낸 사유가 매번 버려진 채 일반 문구만 남았다.
 *
 * 두 가지를 제공한다.
 *   - buildApiError: 실패 응답에서 사유·코드를 꺼내 에러에 싣는다 (호출하는 쪽)
 *   - resolveErrorMessage: 그 에러에서 화면에 쓸 문구를 고른다 (catch 하는 쪽)
 *
 * axios 를 쓰는 코드(axiosInstance 경유)는 err.response 가 실제로 채워지므로
 * 그대로 두어야 한다. resolveErrorMessage 는 두 모양을 모두 읽는다.
 */

/**
 * 실패 응답에서 원인을 꺼내 에러로 만든다.
 *
 * @param {Response} response fetch 응답
 * @param {string|null} [fallbackMessage] 사유를 읽지 못했을 때 쓸 문구
 * @returns {Promise<Error>} statusCode·errorCode·errorMessage 가 붙은 에러
 */
export async function buildApiError(response, fallbackMessage = null) {
  const error = new Error(`Request failed with status ${response.status}`);
  error.statusCode = response.status;
  error.errorCode = null;
  error.errorMessage = null;

  try {
    const raw = await response.text();
    // 앞단 프록시가 끊으면 본문이 HTML 이다. 그 조각은 사람이 읽을 수 없다.
    if (raw && !raw.trimStart().startsWith("<")) {
      const parsed = JSON.parse(raw);
      error.errorCode = parsed?.errorCode || parsed?.code || null;
      error.errorMessage =
        parsed?.message || parsed?.errorMessage || parsed?.error || null;
    }
  } catch {
    // 본문을 읽지 못해도 상태 코드는 남는다.
  }

  if (!error.errorMessage) {
    error.errorMessage = fallbackMessage;
  }
  return error;
}

/**
 * 서버가 보낸 사유만 꺼낸다. 없으면 null.
 *
 * `err.response?.data?.message` 를 그대로 갈아 끼우기 위한 것이다. 뒤에 붙은 `|| 기본문구`
 * 사슬을 그대로 두고 앞부분만 바꾸면, 서버 사유가 있으면 그것을 쓰고 없으면 원래 문구로
 * 떨어진다. error.message 를 여기 넣지 않는 이유는 그것이 늘 참이라 호출부가 정한 구체적인
 * 문구를 가려버리기 때문이다.
 *
 * @param {unknown} error 잡은 에러
 * @returns {string|null}
 */
export function serverErrorMessage(error) {
  return error?.errorMessage || error?.response?.data?.message || null;
}

/**
 * 화면에 보여줄 문구를 고른다.
 *
 * 우선순위는 서버가 준 사유 → axios 모양 → 에러 자체 문구 → 기본 문구다.
 * axios 모양을 함께 보는 이유는 같은 화면이 두 방식으로 호출할 수 있기 때문이다.
 *
 * @param {unknown} error 잡은 에러
 * @param {string} fallbackMessage 아무것도 읽지 못했을 때 쓸 문구
 * @returns {string}
 */
export function resolveErrorMessage(error, fallbackMessage) {
  if (!error) return fallbackMessage;

  return (
    error.errorMessage ||
    error.response?.data?.message ||
    error.message ||
    fallbackMessage
  );
}
