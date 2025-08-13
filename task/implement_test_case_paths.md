# 테스트 케이스 계층 경로 생성 함수 구현

`src/main/frontend/src/utils/treeUtils.jsx` 파일에 `generateTestCasePaths` 함수를 추가하여 테스트 케이스의 계층 구조를 "폴더>>케이스" 형식의 문자열 배열로 변환하는 기능을 구현했습니다.

## `generateTestCasePaths` 함수 설명

```javascript
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
```

### 기능:
- `listToTree` 함수로 생성된 트리 구조(`treeNodes`)를 입력받습니다.
- 트리를 재귀적으로 탐색하면서 각 노드의 `name`을 연결하여 계층 경로를 구성합니다.
- `type`이 `testcase`인 노드와, `type`이 `folder`이지만 더 이상 하위 노드가 없는 폴더에 대해 "폴더>>케이스" 형식의 경로를 `paths` 배열에 추가합니다.
- 최종적으로 생성된 모든 경로를 담은 배열을 반환합니다.

## 구현 위치
- `src/main/frontend/src/utils/treeUtils.jsx` 파일의 `calculateExecutionProgress` 함수 위에 추가되었습니다.
