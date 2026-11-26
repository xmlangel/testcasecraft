// src/components/TestCaseTree/filterExpansion.js
// ICT-497 필터(검색·Automated·Manual)가 걸린 동안의 트리 펼침 상태.
// 필터를 켜면 걸린 케이스가 든 폴더를 처음에 한 번 펼쳐 보여 준다.
// 그 뒤에는 사용자가 접은 폴더를 다시 강제로 펼치지 않는다.

/**
 * 화면에 쓸 펼친 폴더 목록을 구한다.
 * expanded: 사용자가 펼친 폴더, forced: 필터가 펼친 폴더(필터가 없으면 null),
 * collapsed: 필터가 걸린 동안 사용자가 접은 폴더(Set)
 */
export const resolveFilterExpanded = (expanded, forced, collapsed) => {
  if (!forced) return expanded;
  const merged = new Set([...expanded, ...forced]);
  collapsed.forEach((id) => merged.delete(id));
  return Array.from(merged);
};

/**
 * 필터가 걸린 동안 폴더 하나를 접거나 펼친 뒤의 접힘 목록을 구한다.
 * isExpanded: 누르기 전 화면에서 펼쳐져 있었는지
 */
export const toggleFilterCollapsed = (collapsed, nodeId, isExpanded) => {
  const next = new Set(collapsed);
  if (isExpanded) next.add(nodeId);
  else next.delete(nodeId);
  return next;
};
