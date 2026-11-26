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

// 가운데 케이스 목록이 이 폭 아래로 줄면 고정 폭 열(체크·즐겨찾기·ID·우선순위·소유자·최근 결과)이
// 이름 열 자리를 다 차지해 이름이 한 글자씩 세로로 접힌다(1600px 캡처, gg-3).
export const LIST_PANE_MIN_WIDTH = 600;
// 폭 조절 막대(6px)와 상세 칸 왼쪽 여백(12px)
export const SPLIT_GUTTER_WIDTH = 18;

// ICT-494 tl-1: 케이스 화면은 목록 폭을 먼저 정하고 상세 칸이 나머지를 쓴다(상세가 가장 넓다).
// Testiny 기준(1600px 화면) 폴더 300 · 목록 450 · 상세 약 720.
export const CASE_LIST_DEFAULT_WIDTH = 450;
// ICT-496: 목록은 가로 스크롤이라 이름이 접히지 않는다. 형태 아이콘·즐겨찾기·ID 열까지 보이는 폭까지 줄일 수 있다.
export const CASE_LIST_MIN_WIDTH = 180;
export const CASE_LIST_MAX_WIDTH = 900;

export const clampListWidth = (width) =>
  Math.min(CASE_LIST_MAX_WIDTH, Math.max(CASE_LIST_MIN_WIDTH, width));

/**
 * 목록 폭(listWidth)을 먼저 정하고 상세 칸이 나머지를 쓰게 할 때 상세 칸에 바랄 폭을 구한다.
 * 자리가 좁으면 목록을 listMinWidth 까지 먼저 줄여 상세가 목록보다 좁아지지 않게 한다.
 * containerWidth 가 0 이면(아직 재지 못함) fallbackWidth 를 쓴다.
 * detailMinWidth 아래로는 바라지 않는다. 그래도 모자라면 resolvePaneLayout 이 단계를 내린다.
 */
export const detailWidthForList = ({
  containerWidth,
  listWidth,
  detailMinWidth,
  fallbackWidth,
  listMinWidth = CASE_LIST_MIN_WIDTH,
  gutterWidth = SPLIT_GUTTER_WIDTH,
}) => {
  if (!containerWidth) return fallbackWidth;
  const half = Math.floor((containerWidth - gutterWidth) / 2);
  const effectiveList = Math.min(listWidth, Math.max(listMinWidth, half));
  return Math.max(
    detailMinWidth,
    Math.floor(containerWidth - effectiveList - gutterWidth),
  );
};

/**
 * 3단 분할에서 오른쪽(상세) 칸에 실제로 줄 폭을 정한다.
 * 가운데 칸이 listMinWidth 아래로 내려가지 않게, 먼저 상세 칸을 detailMinWidth 까지 줄이고
 * 그래도 모자라면 상세 칸을 접는다(collapsed: true).
 * containerWidth 가 0 이면(아직 재지 못함) 원하는 폭을 그대로 쓴다.
 */
export const fitDetailWidth = ({
  containerWidth,
  desiredWidth,
  listMinWidth,
  detailMinWidth,
  gutterWidth = SPLIT_GUTTER_WIDTH,
}) => {
  if (!containerWidth) return { width: desiredWidth, collapsed: false };
  const room = containerWidth - listMinWidth - gutterWidth;
  if (room >= desiredWidth) return { width: desiredWidth, collapsed: false };
  if (room >= detailMinWidth)
    return { width: Math.floor(room), collapsed: false };
  return { width: 0, collapsed: true };
};

// ICT-492 배치 선택. ICT-497 에서 겹쳐 띄우는 중간 단계를 없앴다.
// 화면에는 자동 · 1단 · 2단으로 보이고, 저장값은 이전 선택이 이어지도록 "1"(겹침)·"3"(나란히)을 그대로 쓴다.
// 예전에 저장한 "2"(오른쪽으로 겹침)는 자동으로 읽는다.
export const PANE_LAYOUT_MODES = ["auto", "1", "3"];
export const PANE_LAYOUT_STORAGE_KEY = "testcase-manager-pane-layout-mode";

export const normalizePaneLayoutMode = (value) =>
  PANE_LAYOUT_MODES.includes(String(value)) ? String(value) : "auto";

/**
 * 칸 폭과 선택한 배치(자동 · 1단 · 2단)로 실제 배치를 정한다.
 * - 나란히(tier 3, 화면 표기 2단): 목록과 상세를 나란히 둔다. 목록이 listMinWidth 아래로 줄지 않아야 한다.
 * - 겹침(tier 1, 화면 표기 1단): 상세를 목록 위에 전체 폭으로 겹친다.
 * 나란히를 골랐는데 폭이 모자라면 가로 스크롤 대신 겹침으로 내려가고 downgraded 를 true 로 둔다.
 * containerWidth 가 0 이면(아직 재지 못함) 고른 배치를 그대로 쓴다(자동은 나란히).
 * 반환값: { tier: 1|3, width: 상세 칸 폭(px, 겹침은 containerWidth), overlay, downgraded }
 */
export const resolvePaneLayout = ({
  mode = "auto",
  containerWidth,
  desiredWidth,
  listMinWidth,
  detailMinWidth,
  gutterWidth = SPLIT_GUTTER_WIDTH,
}) => {
  const requested = normalizePaneLayoutMode(mode);
  const wanted = requested === "1" ? 1 : 3;
  const build = (tier, width) => ({
    tier,
    width,
    overlay: tier !== 3,
    downgraded: requested !== "auto" && tier < wanted,
  });

  if (!containerWidth) {
    return { ...build(wanted, desiredWidth), downgraded: false };
  }

  const docked = fitDetailWidth({
    containerWidth,
    desiredWidth,
    listMinWidth,
    detailMinWidth,
    gutterWidth,
  });
  if (wanted === 3 && !docked.collapsed) return build(3, docked.width);
  return build(1, containerWidth);
};

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
