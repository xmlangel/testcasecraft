/**
 * 트리 구조 처리를 위한 유틸리티 함수들
 */

// 목록에서 트리 구조로 변환 (parentId가 null, "", undefined, 없으면 루트)
export const listToTree = (items, parentId = null) =>
  items
    .filter(item =>
      parentId === null
        ? item.parentId === null || item.parentId === 'null' || item.parentId === 'undefined'
        : item.parentId === parentId
    )
    .map(item => ({
      ...item,
      children: listToTree(items, item.id)
    }));

// ID를 기준으로 트리에서 아이템 찾기
export const findItemInTree = (tree, id) => {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findItemInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// 폴더 아이템인지 체크
export const isFolder = (item) => item.type === 'folder';

// 아이템의 모든 하위 항목 ID 가져오기
export const getAllChildIds = (items, parentId) => {
  const result = [];
  const children = items.filter(item => item.parentId === parentId);
  for (const child of children) {
    result.push(child.id);
    result.push(...getAllChildIds(items, child.id));
  }
  return result;
};

// 모든 폴더 ID 가져오기
export const getAllFolderIds = (items) =>
  items.filter(item => item.type === 'folder').map(item => item.id);

// 특정 ID의 모든 상위 폴더 ID 가져오기 (가장 가까운 부모부터 루트까지 순서대로)
export const getAncestorIds = (items, id) => {
  const result = [];
  let currentId = id;
  const findItemById = (id) => items.find(item => item.id === id);
  while (currentId) {
    const item = findItemById(currentId);
    if (!item || !item.parentId) break;
    result.unshift(item.parentId); // 루트부터 가까운 순서로 넣고 싶으면 unshift, 아니면 push
    currentId = item.parentId;
  }
  return result;
};

// Material UI TreeView용 트리 데이터 변환
export const prepareTreeData = (items, parentId = null) => {
  return items
    .filter(item => item.parentId === parentId)
    .map(item => ({
      id: item.id,
      name: item.name,
      type: item.type,
      children: prepareTreeData(items, item.id)
    }));
};

// 테스트 실행 진행상황 계산
export const calculateExecutionProgress = (execution, testPlan) => {
  if (!execution || !testPlan || !testPlan.testCaseIds.length) return 0;
  const totalTests = testPlan.testCaseIds.length;
  const results = execution.results || {};
  const completedTests = testPlan.testCaseIds.filter(
    id => results[id] && results[id].result !== 'NOT_RUN'
  ).length;
  return Math.round((completedTests / totalTests) * 100);
};

