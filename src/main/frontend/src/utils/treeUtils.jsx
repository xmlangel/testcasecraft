/**
 * 트리 구조 처리를 위한 유틸리티 함수들
 */

export const listToTree = (items, parentId = null) => {
  if (!Array.isArray(items) || items.length === 0) return [];

  // 고아 노드(Orphaned Nodes) 처리 및 맵 생성 준비
  const orphanFolderId = 'orphaned-items-folder';
  const itemMap = new Map();
  const allIds = new Set(items.map(item => item.id));
  
  // 1. 맵 초기화 및 데이터 전처리
  const processedItems = items.map(item => {
    let currentParentId = item.parentId;
    // 부모가 없는데 parentId가 'null' 등의 문자열인 경우 실제 null로 처리
    if (currentParentId === 'null' || currentParentId === 'undefined' || !currentParentId) {
        currentParentId = null;
    }
    
    // 고아 노드 감지: 부모가 지정되어 있으나 실제 존재하지 않는 경우
    if (currentParentId && !allIds.has(currentParentId)) {
      currentParentId = orphanFolderId;
    }
    
    const node = { ...item, parentId: currentParentId, children: [] };
    itemMap.set(node.id, node);
    return node;
  });

  // 2. 고아 폴더 추가 (필요한 경우)
  const hasOrphans = processedItems.some(item => item.parentId === orphanFolderId);
  if (hasOrphans && !itemMap.has(orphanFolderId)) {
    const orphanFolder = {
      id: orphanFolderId,
      name: '[미할당 항목]',
      type: 'folder',
      parentId: null,
      description: '상위 폴더가 삭제되거나 접근할 수 없어 길을 잃은 항목들입니다.',
      children: []
    };
    itemMap.set(orphanFolderId, orphanFolder);
    processedItems.unshift(orphanFolder);
  }

  // 3. 트리 구조 구축 (O(N))
  const tree = [];
  processedItems.forEach(item => {
    if (item.parentId === null) {
      tree.push(item);
    } else {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        parent.children.push(item);
      } else if (item.id !== orphanFolderId) {
        // 부모를 못 찾은 경우 (이론적으로 고아 폴더가 처리하므로 여기 오면 안 됨)
        tree.push(item);
      }
    }
  });

  // 4. 요청된 parentId에 해당하는 서브트리 반환
  if (parentId !== null) {
    const targetRoot = itemMap.get(parentId);
    return targetRoot ? targetRoot.children : [];
  }

  return tree;
};

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

// O(N) 효율성을 위한 인덱스 생성용 유틸리티
export const buildChildrenMap = (items) => {
  const map = new Map();
  items.forEach((item) => {
    const pId = item.parentId || "root";
    if (!map.has(pId)) map.set(pId, []);
    map.get(pId).push(item);
  });
  return map;
};

// 아이템의 모든 하위 항목 ID 가져오기
export const getAllChildIds = (items, parentId) => {
  if (!Array.isArray(items) || !parentId) return [];
  
  const childrenMap = buildChildrenMap(items);

  const result = [];
  const stack = [parentId];
  const visited = new Set();

  while (stack.length > 0) {
    const current = stack.pop();
    if (visited.has(current)) continue;
    visited.add(current);

    const children = childrenMap.get(current);
    if (children) {
      children.forEach(childId => {
        result.push(childId);
        stack.push(childId);
      });
    }
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
  if (!Array.isArray(items) || !id) return [];
  
  // O(N) 인덱스 생성
  const itemMap = new Map(items.map(item => [item.id, item]));
  
  const result = [];
  let currentId = id;
  const visited = new Set(); // 순환 참조 방지

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const item = itemMap.get(currentId);
    if (!item || !item.parentId || item.parentId === 'null' || item.parentId === 'undefined') break;
    result.unshift(item.parentId);
    currentId = item.parentId;
    
    // 무제한 루프 방지
    if (result.length > 100) break;
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
export const calculateExecutionProgress = (execution, testPlan, allTestCases) => {
  if (!execution || !testPlan || !testPlan.testCaseIds || !testPlan.testCaseIds.length) return 0;
  
  // 실제 테스트케이스만 필터링
  const realTestCaseIds = allTestCases 
    ? testPlan.testCaseIds.filter(id => {
        const tc = allTestCases.find(t => t.id === id);
        return tc && tc.type === 'testcase';
      })
    : testPlan.testCaseIds;

  if (realTestCaseIds.length === 0) return 0;
  
  const totalTests = realTestCaseIds.length;
  const results = execution.results || {};
  const completedTests = realTestCaseIds.filter(
    id => results[id] && results[id].result !== 'NOT_RUN'
  ).length;
  return Math.round((completedTests / totalTests) * 100);
};

// 실제 테스트케이스 수 계산 (폴더 제외)
export const countRealTestCases = (testCaseIds, allTestCases) => {
  if (!testCaseIds || !allTestCases) return 0;
  return testCaseIds.filter(id => {
    const tc = allTestCases.find(t => t.id === id);
    return tc && tc.type === 'testcase';
  }).length;
};

export const getOrderedTestCaseIds = (allTestCases, planTestCaseIds) => {
  if (!allTestCases || !planTestCaseIds) {
    return { flattenedData: [], orderedTestCaseIds: [] };
  }

  // 고아 노드(Orphaned Nodes) 처리
  const orphanFolderId = 'orphaned-items-folder';
  const allNodesExist = new Set(allTestCases.map(tc => tc.id));
  
  // 1. 트리 순회 전 고아 노드들의 parentId를 가상 폴더로 변경
  let processedCases = allTestCases.map(tc => {
    if (tc.parentId && tc.parentId !== 'null' && tc.parentId !== 'undefined' && !allNodesExist.has(tc.parentId)) {
      return { ...tc, parentId: orphanFolderId };
    }
    return tc;
  });

  // 2. 가상의 '[미할당 항목]' 폴더를 최상위에 생성
  const hasOrphans = processedCases.some(tc => tc.parentId === orphanFolderId);
  const orphanFolderExists = processedCases.some(tc => tc.id === orphanFolderId);
  
  if (hasOrphans && !orphanFolderExists) {
    processedCases.unshift({
      id: orphanFolderId,
      name: '[미할당 항목]',
      type: 'folder',
      parentId: null,
      description: '상위 폴더가 삭제되거나 접근할 수 없어 길을 잃은 항목들입니다.'
    });
  }

  // 3. 트리 구조 생성 (processedCases 기반)
  const testCaseMap = {};
  processedCases.forEach((tc) => {
    testCaseMap[tc.id] = { ...tc, children: [] };
  });
  processedCases.forEach((tc) => {
    if (tc.parentId && testCaseMap[tc.parentId]) {
      testCaseMap[tc.parentId].children.push(testCaseMap[tc.id]);
    }
  });

  // 4. 테스트 플랜의 testCaseIds로 필터링
  const includedIds = new Set(planTestCaseIds);

  // 폴더 여부 판단: "testcase" 타입이 아닌 것은 모두 폴더로 처리
  // ("folder", "systemFolder" 등 모든 비-testcase 타입 포함)
  function isNodeFolder(node) {
    return node.type !== "testcase";
  }

  function filterTree(node) {
    if (isNodeFolder(node)) {
      const filteredChildren = node.children.map(filterTree).filter(Boolean);
      if (filteredChildren.length === 0) return null;
      return { ...node, children: filteredChildren };
    }
    return includedIds.has(node.id) ? node : null;
  }

  // processedCases 사용 (고아 노드 처리 완료된 데이터)
  const fullTreeData = processedCases
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

// 트리를 평탄화하여 가상 스크롤에 적합한 배열로 변환
export const flattenTree = (nodes, expandedIds = []) => {
  const result = [];
  const expandedSet = new Set(expandedIds);

  const recurse = (list, depth = 0) => {
    // 순서 정렬 보장
    const sorted = list.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    
    sorted.forEach((node) => {
      result.push({ ...node, depth });
      if (node.type === 'folder' && expandedSet.has(node.id) && Array.isArray(node.children)) {
        recurse(node.children, depth + 1);
      }
    });
  };

  recurse(nodes);
  return result;
};

