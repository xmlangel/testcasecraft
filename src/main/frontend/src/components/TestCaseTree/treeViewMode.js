// 테스트케이스 트리의 표시 모드(폴더만 / 케이스까지).
//
// 저장된 값이 없으면 케이스까지 보이는 전체 트리로 시작한다. 전에는 폴더만 보이는
// 상태가 기본이어서 처음 들어온 사용자가 케이스를 찾지 못했다. 트리에 폴더만 나오니
// 펼칠 것이 없고, 케이스를 보려면 있는 줄도 몰랐던 토글을 먼저 눌러야 했다.
//
// 판정을 컴포넌트 밖으로 뺀 이유는 기본값이 다시 뒤집히는 것을 시험으로 막기
// 위해서다. 컴포넌트 안에 두면 트리 전체를 띄워야 확인할 수 있다.

export const TREE_VIEW_MODE_KEY = "testcase-tree-view-mode";

/** localStorage 에 저장하는 값. */
export const TREE_VIEW_MODE = {
  FOLDERS: "folders",
  ALL: "all",
};

/**
 * 폴더만 보일지 판정한다.
 *
 * @param {object} params
 * @param {boolean} params.selectable 케이스를 골라야 하는 모드(플랜 편성 등). 항상 전체.
 * @param {string|null} params.stored  저장된 모드 값. 없으면 null.
 * @returns {boolean} true 면 폴더만 보인다.
 */
export const resolveFolderOnlyView = ({ selectable, stored }) => {
  if (selectable) return false;
  return stored === TREE_VIEW_MODE.FOLDERS;
};

/** 지금 모드에서 저장할 값. */
export const toStoredMode = (folderOnlyView) =>
  folderOnlyView ? TREE_VIEW_MODE.FOLDERS : TREE_VIEW_MODE.ALL;
