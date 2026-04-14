# Task: 탐색 세션 워크스페이스 탭 상태 유지 구현

- [x] `ExploratorySessionWorkspace.jsx` 수정 시작
  - [x] `useSearchParams` 임포트 및 초기화
  - [x] `view` 상태와 URL 파라미터 동기화 전용 hook/logic 작성
  - [x] `sessionId` 파라미터 연동
- [x] 탭 전환 핸들러 업데이트
  - [x] `Tabs` 컴포넌트의 `onChange` 시 `setSearchParams` 호출
- [x] 세션 선택 핸들러 업데이트
  - [x] `handleSelectSession` 시 `sessionId` 파라미터 추가
- [x] 뒤로 가기 및 새로고침 테스트 (E2E 또는 브라우저 확인)
- [x] 최종 동기화 (obsidian_sync) 및 완료 보고
