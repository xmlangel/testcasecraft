/**
 * 폴더 체크 상태 계산 (ICT-512).
 *
 * 테스트 플랜은 케이스 ID 만 저장한다. 그래서 저장된 플랜을 다시 열면 머리글은
 * 「775개 선택됨」인데 폴더 체크박스는 모두 비어 있었다. 폴더의 체크 상태를
 * 저장된 폴더 ID 가 아니라 하위 케이스가 얼마나 선택됐는지로 정한다.
 *
 * @param {Array<{id:string,parentId?:string|null,type?:string}>} items 트리 항목 전체
 * @param {Iterable<string>} checkedIds 선택된 ID
 * @returns {Map<string, "all"|"some"|"none">} 하위 케이스가 하나 이상인 폴더별 상태
 */
const FOLDER_TYPES = new Set(["folder", "systemFolder"]);
export const isFolderItem = (item) => Boolean(item) && FOLDER_TYPES.has(item.type);

export function computeFolderCheckStates(items, checkedIds) {
  const states = new Map();
  if (!Array.isArray(items) || items.length === 0) return states;

  const checked = checkedIds instanceof Set ? checkedIds : new Set(checkedIds || []);
  const children = new Map();
  items.forEach((item) => {
    const key = item.parentId ?? null;
    if (!children.has(key)) children.set(key, []);
    children.get(key).push(item);
  });

  // 폴더마다 [하위 케이스 수, 그중 선택 수] 를 아래에서 위로 모은다
  const totals = new Map();
  const visiting = new Set();
  const tally = (folderId) => {
    if (totals.has(folderId)) return totals.get(folderId);
    if (visiting.has(folderId)) return [0, 0]; // 순환 방어
    visiting.add(folderId);
    let total = 0;
    let selected = 0;
    (children.get(folderId) || []).forEach((child) => {
      if (isFolderItem(child)) {
        const [t, s] = tally(child.id);
        total += t;
        selected += s;
      } else {
        total += 1;
        if (checked.has(child.id)) selected += 1;
      }
    });
    visiting.delete(folderId);
    const result = [total, selected];
    totals.set(folderId, result);
    return result;
  };

  items.forEach((item) => {
    if (!isFolderItem(item)) return;
    const [total, selected] = tally(item.id);
    if (total === 0) return;
    states.set(item.id, selected === 0 ? "none" : selected === total ? "all" : "some");
  });
  return states;
}
