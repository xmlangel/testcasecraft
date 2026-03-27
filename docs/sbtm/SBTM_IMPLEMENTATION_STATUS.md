# SBTM 구현 현황 (API 우선/TDD)

기준 시점: 2026-02-20 (최종 업데이트: 세션 목록/편집 UI 반영)
브랜치: `sbtm-session-api-tdd`

## 1. 완료 범위

### 1.1 Charter 도메인

- 엔티티/저장소
  - `TestCharter` (`ACTIVE`, `ARCHIVED`)
  - `TestCharterRepository`
- 서비스/컨트롤러
  - `TestCharterService`
  - `TestCharterController`
- 제공 API
  - `POST /api/charters`
  - `GET /api/projects/{projectId}/charters`
  - `GET /api/charters/{id}`
  - `PUT /api/charters/{id}`
- 정책 반영
  - `ARCHIVED` 차터로 신규 세션 생성 불가

### 1.2 Session 도메인

- 엔티티/저장소
  - `TestSession` (상태: `DRAFT`, `RUNNING`, `PAUSED`, `SUBMITTED`, `APPROVED`, `NEEDS_UPDATE`)
  - `TestSessionRepository` (Specification 기반 검색 지원)
- 데이터 필드 반영
  - `charterId(FK)`
  - `charterSnapshotTitle`, `charterSnapshotMission`
  - `startedAt`, `endedAt`, `interruptedMinutes`
  - `testerId`, `leadId`
- 서비스/컨트롤러
  - `TestSessionService`
  - `TestSessionController`
- 제공 API
  - `POST /api/sessions`
  - `GET /api/sessions/{id}`
  - `PUT /api/sessions/{id}`
  - `POST /api/sessions/{id}/start`
  - `POST /api/sessions/{id}/pause`
  - `POST /api/sessions/{id}/resume`
  - `POST /api/sessions/{id}/end`
  - `POST /api/sessions/{id}/submit`
  - `POST /api/sessions/{id}/approve`
  - `POST /api/sessions/{id}/request-update`
  - `GET /api/projects/{projectId}/sessions`
    - Query: `status`, `from`, `to`, `testerId`, `charterId`, `page`, `size`, `sort`

### 1.3 승인/중단 이력 분리

- 승인 이력
  - `TestSessionApproval` + `TestSessionApprovalRepository`
  - 승인/보완 요청 시 append-only 저장
- 중단 이력
  - `TestSessionInterruption` + `TestSessionInterruptionRepository`
  - pause/resume/end 흐름에서 중단 시간 집계

## 2. TDD 결과

- 테스트 파일: `src/test/java/com/testcase/testcasemanagement/api/SessionControllerApiTest.java`
- 검증 항목
  - 세션 생성/조회/수정
  - 라이프사이클(`start/pause/resume/end`)
  - 제출/승인/보완 요청
  - 프로젝트 목록 필터(`status`, `charterId`, `page/size/sort`)
- 실행 명령
  - `./gradlew test --tests com.testcase.testcasemanagement.api.SessionControllerApiTest`
- 결과
  - `BUILD SUCCESSFUL` (5 tests passed)

## 3. 계획 대비 반영 상태

- 반영 완료

  - Charter 모델/기본 API
  - Session 상태 전이 핵심(`start/pause/resume/end/submit/approve/request-update`)
  - SessionApproval 분리
  - SessionInterruption 분리
  - 목록 조회 기본 필터/페이징/정렬

- 부분 반영

  - 권한: 역할 기반은 적용됨, 프로젝트 멤버십 단위 접근 제어는 추가 보완 필요
  - 목록 조회: 파라미터는 반영했으나 인덱스/대용량 성능 튜닝은 미반영

- 미반영
  - `POST /api/sessions/{id}/artifacts`
  - SessionNote/SessionIssue 도메인 및 API
  - 승인/중단 이력 조회 API
  - OpenAPI/스키마 문서 동기화

## 4. 문서-코드 불일치 점검 결과 (2026-02-20)

### 4.1 탐색 세션 탭 노출 상태

- 불일치 내용
  - `docs/sbtm/Todo.md`는 `SHOW_EXPLORATORY_SESSION_TAB = false`(임시 비노출) 기준으로 기록
  - 실제 코드 `src/main/frontend/src/App.jsx`는 `SHOW_EXPLORATORY_SESSION_TAB = true`로 동작
- 영향
  - 문서/실제 UI의 기능 노출 상태가 달라 운영/QA 커뮤니케이션 혼선 가능

## 5. 프론트 진행 현황 (탭 1 차터 관리) (2026-02-20)

### 5.1 반영 완료

- 차터 관리 탭 API 연동 완료
  - 조회: `GET /api/projects/{projectId}/charters`
  - 생성: `POST /api/charters`
  - 수정: `PUT /api/charters/{id}`
- 적용 파일
  - `src/main/frontend/src/components/ExploratorySessionWorkspace.jsx`
  - `src/main/frontend/src/App.jsx` (`projectId` 전달)
- UX 반영
  - 차터 목록 로딩/에러/빈 목록 상태 표시
  - 차터 생성/수정 저장 중 버튼 비활성화

### 5.2 현재 한계

- 탭 3~5(세션 작성/편집 일부, 디브리프/상세)는 여전히 UI 초안 데이터 중심
- 아티팩트/노트/이슈/이력 조회 API 미구현으로 전체 실데이터 연동 미완료

## 6. 프론트 구조 개선 및 빌드 검증 (2026-02-20)

### 6.1 탭별 파일 분리 완료

- 부모: `src/main/frontend/src/components/ExploratorySessionWorkspace.jsx`
- 탭 컴포넌트
  - `src/main/frontend/src/components/exploratory/ExploratoryCharterTab.jsx`
  - `src/main/frontend/src/components/exploratory/ExploratorySessionListTab.jsx`
  - `src/main/frontend/src/components/exploratory/ExploratorySessionEditorTab.jsx`
  - `src/main/frontend/src/components/exploratory/ExploratoryDebriefTab.jsx`
  - `src/main/frontend/src/components/exploratory/ExploratoryDetailTab.jsx`

### 6.2 검증 결과

- 실행: `cd src/main/frontend && npm run build`
- 결과: `vite build` 성공 (컴파일 에러 없음)
- 비고: 번들 크기 경고만 존재(기능 오류 아님)

## 7. 추가 진행 현황 (탭 2/탭 3) (2026-02-20)

### 7.1 탭 2 세션 목록 연동 완료

- 반영 내용
  - 세션 목록을 실데이터 API로 전환
  - 호출 API: `GET /api/projects/{projectId}/sessions`
  - 서버 필터 반영: `status`, `charterId`, `from`, `to`, `sort=createdAt,desc`
  - 클라이언트 필터 유지: tester 검색(표시 문자열 기준)
- 상태값 정합성 보정
  - 목록 상태 필터를 백엔드 enum 기준으로 통일
  - `DRAFT`, `RUNNING`, `PAUSED`, `SUBMITTED`, `APPROVED`, `NEEDS_UPDATE`
- UX 반영
  - 세션 목록 로딩/에러/빈 결과 상태 표시
  - 카드 메타에서 mock `bugs` 기반 표시 제거, `netDurationMinutes` 기반 표기로 정리
- 적용 파일
  - `src/main/frontend/src/components/ExploratorySessionWorkspace.jsx`
  - `src/main/frontend/src/components/exploratory/ExploratorySessionListTab.jsx`

### 7.2 탭 3 세션 작성/편집 구조 정리

- 반영 내용
  - 헤더 유지: 타이머/상태/수행시간 + start/pause/resume/end
  - `차터 + 시간배분`을 하나의 통합 섹션으로 결합
  - 나머지 필드를 내부 탭으로 분리
    - `기본 정보`
    - `노트/이슈`
    - `산출물/평가`
  - 기존 입력 필드/값은 유지
- 적용 파일
  - `src/main/frontend/src/components/exploratory/ExploratorySessionEditorTab.jsx`

### 7.3 탭 3 data-testid 추가

- 목적
  - Playwright/E2E 안정성 확보(텍스트/레이아웃 변경과 분리)
- 주요 식별자 추가 범위
  - 내부 탭 전환, 타이머 버튼, 차터 선택, 시간배분 입력
  - 노트/이슈 입력
  - 산출물 업로드/평가 입력
- 적용 파일
  - `src/main/frontend/src/components/exploratory/ExploratorySessionEditorTab.jsx`

### 7.4 검증 결과

- 실행: `cd src/main/frontend && npm run build` (탭2 반영 후, 탭3 반영 후 각각 수행)
- 결과: 모두 `vite build` 성공 (컴파일 에러 없음)
- 비고: 번들 크기 경고만 존재(기능 오류 아님)
