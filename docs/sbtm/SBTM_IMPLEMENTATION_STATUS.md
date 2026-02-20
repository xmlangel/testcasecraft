# SBTM 구현 현황 (API 우선/TDD)

기준 시점: 2026-02-20
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

## 20260221 현재상태
- 백엔드 API 핵심은 구현되어 있습니다. 세션 생성/조회/수정/라이프사이클/제출/승인/보완요청/목록 필터 API가 존재합니다: src/main/java/com/testcase/testcasemanagement/controller/TestSessionController.java:37, src/main/java/com/
    testcase/testcasemanagement/controller/TestSessionController.java:109
  - 서비스 로직도 상태 전이, 중단시간 집계, 승인 이력 append가 구현되어 있습니다: src/main/java/com/testcase/testcasemanagement/service/TestSessionService.java:102, src/main/java/com/testcase/testcasemanagement/service/
    TestSessionService.java:115, src/main/java/com/testcase/testcasemanagement/service/TestSessionService.java:184
  - 차터 API도 구현되어 있습니다: src/main/java/com/testcase/testcasemanagement/controller/TestCharterController.java:28
  - API 테스트는 TestNG로 작성되어 있습니다(5개 시나리오): src/test/java/com/testcase/testcasemanagement/api/SessionControllerApiTest.java:64, src/test/java/com/testcase/testcasemanagement/api/SessionControllerApiTest.java:196
  - 프론트 SBTM 화면은 실제로는 “UI 초안/목업” 수준입니다. 하드코딩 초기 데이터로 동작하고 백엔드 연동이 없습니다: src/main/frontend/src/components/ExploratorySessionWorkspace.jsx:40, src/main/frontend/src/components/
    ExploratorySessionWorkspace.jsx:215
  - 탐색 세션 탭은 현재 노출 상태입니다(true): src/main/frontend/src/App.jsx:84, src/main/frontend/src/App.jsx:1021
  - 미구현(문서와 코드 일치) 항목은 여전히 없습니다.
      - 아티팩트 업로드 API (/api/sessions/{id}/artifacts)
      - SessionNote/SessionIssue 도메인/API
      - approvals/interruptions 조회 API
      - Session API의 프로젝트 멤버십 기반 접근제어(projectSecurityService)
        근거: docs/sbtm/SBTM_IMPLEMENTATION_STATUS.md:82, 그리고 TestSessionController에 해당 엔드포인트/권한식 부재 src/main/java/com/testcase/testcasemanagement/controller/TestSessionController.java:30