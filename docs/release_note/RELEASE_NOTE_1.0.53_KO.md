# Release Note - v1.0.53

## [1.0.53] - 2026-03-27

### 주요 변경 사항

#### 🐞 버그 수정 (Bug Fixes)

- **테스트 케이스 트리(TestCaseTree) 안정성 강화**:
  - 테스트 케이스의 순서를 변경(Reordering)할 때 화면 내용이 비정상적으로 사라지거나 렌더링되지 않던 오류(`TypeError: Cannot read properties of undefined (reading 'length')`)를 수정했습니다.
  - 가상화 리스트 환경에서의 노드 정렬 및 데이터 매핑 로직을 최적화하여 대규모 테스트 케이스 환경에서도 안정적인 트리 조작이 가능하도록 개선했습니다.
