// src/components/TestCase/splitPane.js
// ICT-491 케이스 화면 3단 분할(트리 | 케이스 목록 | 상세)에서 쓰는 순수 함수들.

import {
  getAncestorIds,
  isUnfiledTestCase,
  VIRTUAL_ALL_CASES_ID,
  VIRTUAL_UNFILED_ID,
} from "../../utils/treeUtils.jsx";

export const DETAIL_PANE_DEFAULT_WIDTH = 640;
export const DETAIL_PANE_MIN_WIDTH = 380;
export const DETAIL_PANE_MAX_WIDTH = 1200;

export const clampDetailWidth = (width) =>
  Math.min(DETAIL_PANE_MAX_WIDTH, Math.max(DETAIL_PANE_MIN_WIDTH, width));

// 케이스가 지금 열려 있는 목록(폴더·가상 노드)에 들어 있는지
export const isCaseInList = (listId, testCase, items) => {
  if (!listId || !testCase) return false;
  if (listId === VIRTUAL_ALL_CASES_ID) return true;
  if (listId === VIRTUAL_UNFILED_ID) return isUnfiledTestCase(testCase);
  return getAncestorIds(items, testCase.id).some(
    (id) => String(id) === String(listId),
  );
};

/**
 * 선택이 바뀐 뒤 가운데 칸에 남길 목록 ID 를 정한다.
 * - 폴더·가상 노드를 고르면 그 목록을 연다.
 * - 케이스를 고르면 보던 목록에 그 케이스가 있을 때 목록을 그대로 둔다.
 *   없으면(트리에서 다른 폴더의 케이스를 누른 경우) 케이스가 든 폴더로 바꾼다.
 */
export const resolveListContextId = (prevListId, selectedId, items) => {
  if (!selectedId) return null;
  if (selectedId === VIRTUAL_ALL_CASES_ID || selectedId === VIRTUAL_UNFILED_ID)
    return selectedId;
  const selected = (items || []).find(
    (item) => String(item.id) === String(selectedId),
  );
  if (!selected) return prevListId;
  if (selected.type === "folder") return selected.id;
  if (isCaseInList(prevListId, selected, items)) return prevListId;
  return isUnfiledTestCase(selected) ? VIRTUAL_UNFILED_ID : selected.parentId;
};
