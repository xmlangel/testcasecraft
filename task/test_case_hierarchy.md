# 테스트 케이스 계층 구조 분석 및 표현 방식

## 1. 테스트 케이스 데이터 모델 (`testCase.jsx`)
- `createTestCase` 함수: 일반 테스트 케이스 객체 생성
  - `id`: 고유 ID
  - `name`: 이름
  - `projectId`: 속한 프로젝트 ID
  - `parentId`: 부모 폴더의 ID (루트인 경우 `null`)
  - `type`: `testcase` (기본값)
- `createTestFolder` 함수: 테스트 케이스 폴더(그룹) 객체 생성
  - `id`: 고유 ID
  - `name`: 이름
  - `projectId`: 속한 프로젝트 ID
  - `parentId`: 부모 폴더의 ID (루트인 경우 `null`)
  - `type`: `folder`

## 2. 트리 유틸리티 함수 (`treeUtils.jsx`)
- `listToTree(items, parentId = null)`: 평탄한 리스트 형태의 테스트 케이스 데이터를 `id`와 `parentId`를 기반으로 재귀적으로 트리 구조로 변환합니다. `parentId`가 `null`, `""`, `undefined`이면 루트 노드로 간주합니다.
- `isFolder(item)`: `item.type === 'folder'`를 통해 노드가 폴더인지 여부를 판단합니다.
- `getAncestorIds(items, id)`: 특정 `id`를 가진 항목의 모든 상위 `parentId`를 찾아 배열로 반환합니다.

## 3. 테스트 케이스 트리 컴포넌트 (`TestCaseTree.jsx`)
- Material-UI의 `TreeView` 컴포넌트를 사용하여 테스트 케이스를 트리 형태로 시각화하고 관리합니다.
- `listToTree` 함수를 사용하여 백엔드에서 가져온 평탄한 테스트 케이스 목록을 트리 구조로 변환하여 렌더링합니다.
- `displayOrder` 속성을 사용하여 형제 노드 간의 순서를 제어합니다.

## 4. "폴더>>케이스" 형식 표현 방식

테스트 케이스의 계층 구조는 `id`, `name`, `type` (`folder` 또는 `testcase`), `parentId` 속성을 가진 객체들의 평탄한 리스트로 관리됩니다. 이를 "폴더>>케이스" 형식으로 표현하기 위해서는 다음과 같은 단계를 따릅니다.

1.  **트리 구조 변환**: `listToTree` 함수를 사용하여 평탄한 테스트 케이스 목록을 계층적인 트리 구조로 변환합니다.
2.  **재귀적 탐색**: 변환된 트리 구조를 재귀적으로 탐색합니다.
3.  **경로 구성**: 각 노드를 방문할 때마다 현재 노드의 `name`을 이전 경로에 추가합니다.
    *   `type`이 `folder`인 노드는 경로의 중간 구성 요소가 됩니다.
    *   `type`이 `testcase`인 노드는 경로의 마지막 구성 요소가 됩니다.
4.  **경로 출력**: 각 `testcase` 노드에 도달하거나, `folder` 노드이지만 더 이상 하위 노드가 없는 경우 현재까지 구성된 경로를 출력합니다.

**예시:**

```
// 원본 데이터 (간략화)
[
  { id: "f1", name: "루트 폴더 A", parentId: null, type: "folder" },
  { id: "f1-1", name: "하위 폴더 A-1", parentId: "f1", type: "folder" },
  { id: "tc1", name: "테스트 케이스 A-1-1", parentId: "f1-1", type: "testcase" },
  { id: "tc2", name: "테스트 케이스 A-2", parentId: "f1", type: "testcase" },
  { id: "f2", name: "루트 폴더 B", parentId: null, type: "folder" },
  { id: "tc3", name: "테스트 케이스 B-1", parentId: "f2", type: "testcase" }
]
```

위 데이터는 다음과 같이 "폴더>>케이스" 형식으로 표현될 수 있습니다:

*   `루트 폴더 A`
*   `루트 폴더 A >> 하위 폴더 A-1`
*   `루트 폴더 A >> 하위 폴더 A-1 >> 테스트 케이스 A-1-1`
*   `루트 폴더 A >> 테스트 케이스 A-2`
*   `루트 폴더 B`
*   `루트 폴더 B >> 테스트 케이스 B-1`
