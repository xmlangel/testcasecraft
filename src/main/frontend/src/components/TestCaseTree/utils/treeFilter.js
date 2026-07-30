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

/**
 * 검색어에 직접 걸린 노드 id 집합을 만든다.
 *
 * @param {Array<{id: string}>} items 판정 대상 노드 목록
 * @param {string|undefined} query 사용자 입력 (콤마 구분 허용)
 * @returns {Set<string>|null} 걸린 id 집합, 검색어가 없으면 null(제한 없음)
 */
export function collectQueryMatchedIds(items, query) {
  if (!splitQueryTerms(query).length) return null;

  const matched = new Set();
  (Array.isArray(items) ? items : []).forEach((item) => {
    if (item && matchesTreeQuery(item, query)) matched.add(item.id);
  });
  return matched;
}

/**
 * 검색 결과에 속하는 노드 id 집합을 만든다 — 자신이 걸렸거나 조상이 걸린 노드.
 *
 * ICT-431: 검색으로 좁힌 상태에서 전체 선택을 누르거나 폴더를 체크할 때
 * 화면에 없는 항목이 딸려 들어가면 안 되고, 반대로 걸린 폴더 안의 케이스는
 * 화면에 보이니 함께 선택돼야 한다. 그 경계를 이 집합이 정한다.
 *
 * 조상 경로만으로 보이는 폴더(자신·조상 모두 안 걸린 상위 폴더)는 제외한다 —
 * 길을 보여주려고 표시한 것이지 선택 대상은 아니다.
 *
 * @param {Array<{id: string, parentId?: string}>} items 판정 대상 노드 목록
 * @param {string|undefined} query 사용자 입력 (콤마 구분 허용)
 * @returns {Set<string>|null} 검색 결과 id 집합, 검색어가 없으면 null(제한 없음)
 */
export function collectQueryScopedIds(items, query) {
  const matched = collectQueryMatchedIds(items, query);
  if (!matched) return null;

  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  const itemMap = new Map(list.map((item) => [item.id, item]));

  const scoped = new Set();
  list.forEach((item) => {
    let cur = item;
    const visited = new Set();
    while (cur && !visited.has(cur.id)) {
      visited.add(cur.id);
      if (matched.has(cur.id)) {
        scoped.add(item.id);
        return;
      }
      cur = itemMap.get(cur.parentId);
    }
  });
  return scoped;
}
