# SBTM TODO

## 작업한 내용

- [x] 탐색 세션(Exploratory Session) 정식 노출 및 UI 고도화 (2026-04-06)
  - `App.jsx`에서 `SHOW_EXPLORATORY_SESSION_TAB = true` 플래그 활성화 및 관리
  - **Premium UI 적용**: Glassmorphism 테마, Backdrop filter, 애니메이션 배경 구현
  - **에디터 탭 개편**: 2단 패널(3:9) 레이아웃 및 실시간 시간 배분 시각화 차트(Stacked Bar) 적용
  - **상세 탭 개편**: 세션 데이터 대시보드화 및 구조화된 노트 카드 레이아웃 적용
  - **안정성 확보**: `ReferenceError` 해결 및 MUI/React 임포트 최적화 완료
- [x] 차터 및 세션 목록 실데이터 연동 (2026-02-20)
  - 차터 관리(T1) 및 세션 목록(T2) 백엔드 API 연동 완료
  - 필터링, 정렬, 페이징 기능 UI 반영
