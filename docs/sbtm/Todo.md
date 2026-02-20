# SBTM TODO

## 작업한 내용

- [x] 탐색 세션(Exploratory Session) 임시 비노출 적용
  - `ProjectHeader`에서 `탐색 세션` 탭 조건부 렌더링 적용
  - `App`에 `SHOW_EXPLORATORY_SESSION_TAB = false` 플래그 추가
  - `/projects/{projectId}/exploratory` 직접 접근 시 프로젝트 대시보드로 리다이렉트 처리
  - 숨김 상태에서 탭 인덱스 보정 로직 추가(저장된 이전 인덱스 안정화)
  - 탭 숨김 적용: src/main/frontend/src/components/ProjectHeader.jsx:23, src/main/frontend/src/components/ProjectHeader.jsx:107
  - 기능 플래그 추가: src/main/frontend/src/App.jsx:84 (SHOW_EXPLORATORY_SESSION_TAB = false)
  - 직접 URL 접근 차단(/projects/{id}/exploratory 접근 시 대시보드로 리다이렉트): src/main/frontend/src/App.jsx:419
  - 숨김 상태에서 탭 인덱스 안전화(기존 저장된 인덱스 보정): src/main/frontend/src/App.jsx:450
  - 탐색 세션 화면 렌더 자체 비활성화: src/main/frontend/src/App.jsx:1021
  
## 백로그

- [ ] 탐색 세션(Exploratory Session) 임시 비노출 유지
  - 배경: 개발 진행 중 기능 노출 방지 필요
  - 현재 반영: 프로젝트 탭에서 `탐색 세션` 숨김 + `/projects/{projectId}/exploratory` 직접 접근 시 대시보드 리다이렉트
  - 재오픈 조건: 기능 안정화/검증 완료 후 `SHOW_EXPLORATORY_SESSION_TAB` 플래그 활성화 및 회귀 점검


