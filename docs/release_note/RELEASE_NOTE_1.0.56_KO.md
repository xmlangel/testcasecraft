# Release Note - v1.0.56

## [1.0.56] - 2026-03-30

### 주요 변경 사항

#### 🛠️ 버그 수정 및 안정화 (Bug Fixes & Stability)

- **프론트엔드 ReferenceError 수정**:
  - `App.jsx`에서 `SHOW_EXPLORATORY_SESSION_TAB` 전역 변수가 정의되지 않아 발생하던 런타임 오류를 해결했습니다.
  - 이제 런타임 설정(Runtime Config)에서 제공하는 `showExploratorySessionTab` 상태 변수를 일관되게 사용하도록 수정하여 애플리케이션의 안정성을 높였습니다.
