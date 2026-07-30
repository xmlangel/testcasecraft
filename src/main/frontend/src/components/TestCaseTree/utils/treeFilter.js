// src/main/frontend/src/components/TestCaseTree/utils/treeFilter.js
//
// ICT-428 / ICT-427: 트리 검색 매칭 규칙.
// 이전에는 이름만 봤기 때문에 화면에 "AGG-1016 · 로그인 실패" 처럼 표시 ID가 붙어 있어도
// 그 ID 로는 케이스를 찾을 수 없었다. 이름·표시 ID·태그를 함께 본다.
//
// 검색어는 콤마로 여러 개 넣을 수 있고, 하나라도 걸리면 통과한다(OR).
// 필드 간에도 OR — "AGG-1016" 은 표시 ID 로, "수정필요" 는 태그로 걸린다.

/**
 * 검색어 문자열을 비교 가능한 항으로 쪼갠다.
 *
 * @param {string|undefined} query 사용자 입력 (콤마 구분 허용)
 * @returns {string[]} 소문자·트림된 검색어 목록 (빈 항목 제외)
 */
export function splitQueryTerms(query) {
  return String(query || "")
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * 노드가 검색어에 걸리는지 판정한다.
 *
 * @param {{name?: string, displayId?: string, tags?: string[]}} node 트리 노드(폴더 또는 케이스)
 * @param {string|undefined} query 사용자 입력
 * @returns {boolean} 검색어가 없으면 항상 true
 */
export function matchesTreeQuery(node, query) {
  const terms = splitQueryTerms(query);
  if (!terms.length) return true;
  if (!node) return false;

  const haystacks = [node.name, node.displayId]
    .concat(Array.isArray(node.tags) ? node.tags : [])
    .map((value) => String(value || "").toLowerCase())
    .filter(Boolean);

  return haystacks.some((haystack) =>
    terms.some((term) => haystack.includes(term)),
  );
}
