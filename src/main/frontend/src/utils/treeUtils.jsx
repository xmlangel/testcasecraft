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

// 아이템의 모든 하위 항목(객체 포함) 가져오기
export const getAllDescendants = (items, parentId) => {
  if (!Array.isArray(items) || !parentId) return [];
  const result = [];
  const stack = [parentId];
  const visited = new Set();

  while (stack.length > 0) {
    const current = stack.pop();
    if (visited.has(current)) continue;
    visited.add(current);

    const children = items.filter((item) => item?.parentId === current);
    for (const child of children) {
      if (child?.id && !visited.has(child.id)) {
        result.push(child);
        stack.push(child.id);
      }
    }
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

// "폴더>>케이스" 형식의 경로를 생성하는 함수
export const generateTestCasePaths = (treeNodes) => {
  const paths = [];

  const traverse = (nodes, currentPath) => {
    nodes.forEach(node => {
      const newPath = currentPath ? `${currentPath} >> ${node.name}` : node.name;

      // 현재 노드가 테스트 케이스이거나, 폴더이지만 하위 노드가 없는 경우 경로 추가
      if (node.type === 'testcase' || (node.type === 'folder' && (!node.children || node.children.length === 0))) {
        paths.push(newPath);
      }

      // 하위 노드가 있는 경우 재귀적으로 탐색
      if (node.children && node.children.length > 0) {
        traverse(node.children, newPath);
      }
    });
  };

  traverse(treeNodes, '');
  return paths;
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

/**
 * 테스트 플랜의 testCaseIds를 폴더 계층 구조 순서로 정렬
 * @param {Array} allTestCases - 프로젝트의 모든 테스트케이스
 * @param {Array} planTestCaseIds - 테스트 플랜의 testCaseIds
 * @returns {Object} { flattenedData, orderedTestCaseIds }
 */
export const getOrderedTestCaseIds = (allTestCases, planTestCaseIds) => {
  if (!allTestCases || !planTestCaseIds) {
    return { flattenedData: [], orderedTestCaseIds: [] };
  }

  // 1. 트리 구조 생성
  const testCaseMap = {};
  allTestCases.forEach((tc) => {
    testCaseMap[tc.id] = { ...tc, children: [] };
  });
  allTestCases.forEach((tc) => {
    if (tc.parentId && testCaseMap[tc.parentId]) {
      testCaseMap[tc.parentId].children.push(testCaseMap[tc.id]);
    }
  });

  // 2. 테스트 플랜의 testCaseIds로 필터링
  const includedIds = new Set(planTestCaseIds);

  function filterTree(node) {
    if (node.type === "folder") {
      const filteredChildren = node.children.map(filterTree).filter(Boolean);
      if (filteredChildren.length === 0) return null;
      return { ...node, children: filteredChildren };
    }
    return includedIds.has(node.id) ? node : null;
  }

  const fullTreeData = allTestCases
    .filter((tc) => !tc.parentId)
    .map((tc) => filterTree(testCaseMap[tc.id]))
    .filter(Boolean);

  // 3. 트리 평면화
  const flatten = (nodes, level = 0, parentName = null) => {
    let result = [];
    nodes.forEach(node => {
      result.push({ ...node, level, parentName });
      if (node.children && node.children.length > 0) {
        result = result.concat(flatten(node.children, level + 1, node.name));
      }
    });
    return result;
  };

  const flattenedData = flatten(fullTreeData);

  // 4. 테스트케이스만 필터링하여 순서있는 ID 배열 생성
  const orderedTestCaseIds = flattenedData
    .filter((node) => node.type === "testcase")
    .map((node) => node.id);

  return { flattenedData, orderedTestCaseIds };
};

