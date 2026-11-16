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
// 우선순위 열을 빼면 이 폭에서도 이름이 한 글자씩 접히지 않는다.
export const CASE_LIST_MIN_WIDTH = 400;
export const CASE_LIST_MAX_WIDTH = 900;
// 목록이 이 폭보다 좁으면 우선순위 열을 감춘다. 우선순위는 상세 칸에서 그대로 보인다.
export const CASE_LIST_PRIORITY_MIN_WIDTH = 560;

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

// ICT-492 1단·2단·3단 배치
// 2단에서 겹친 상세 칸 왼쪽으로 남겨 둘 목록 폭. 이 폭이면 목록의 ID·이름이 보여서 다른 케이스를 바로 누를 수 있다.
// 280px 이면 1280px 화면에서 아이콘·즐겨찾기 열 뒤로 이름이 몇 글자만 남았다.
export const LIST_PEEK_WIDTH = 340;
export const PANE_LAYOUT_MODES = ["auto", "1", "2", "3"];
export const PANE_LAYOUT_STORAGE_KEY = "testcase-manager-pane-layout-mode";

export const normalizePaneLayoutMode = (value) =>
  PANE_LAYOUT_MODES.includes(String(value)) ? String(value) : "auto";

/**
 * 칸 폭과 선택한 배치(자동·1단·2단·3단)로 실제 배치를 정한다.
 * - 3단: 목록과 상세를 나란히 둔다. 목록이 listMinWidth 아래로 줄지 않아야 한다.
 * - 2단: 상세를 목록 위에 오른쪽으로 겹쳐 띄운다. 목록 왼쪽 peekWidth 만큼은 가리지 않는다.
 * - 1단: 상세를 목록 위에 전체 폭으로 겹친다.
 * 고른 배치가 폭에 맞지 않으면 가로 스크롤 대신 한 단계씩 내려가고 downgraded 를 true 로 둔다.
 * containerWidth 가 0 이면(아직 재지 못함) 고른 배치를 그대로 쓴다(자동은 3단).
 * 반환값: { tier: 1|2|3, width: 상세 칸 폭(px, 1단은 containerWidth), overlay, downgraded }
 */
export const resolvePaneLayout = ({
  mode = "auto",
  containerWidth,
  desiredWidth,
  listMinWidth,
  detailMinWidth,
  // 겹친 칸(2단)의 최소 폭. 나란히 둘 때보다 좁게 허용할 수 있다(실행 화면 결과 칸).
  overlayMinWidth = detailMinWidth,
  peekWidth = LIST_PEEK_WIDTH,
  gutterWidth = SPLIT_GUTTER_WIDTH,
}) => {
  const requested = normalizePaneLayoutMode(mode);
  const wanted = requested === "auto" ? 3 : Number(requested);
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
  const overlayRoom = containerWidth - peekWidth;
  const fits3 = !docked.collapsed;
  const fits2 = overlayRoom >= overlayMinWidth;

  if (wanted >= 3 && fits3) return build(3, docked.width);
  if (wanted >= 2 && fits2)
    return build(2, Math.floor(Math.min(desiredWidth, overlayRoom)));
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
