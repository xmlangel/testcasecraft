# SBTM 다음 진행 항목 (실행 백로그)

## 1. 우선순위 P1 (다음 스프린트)

### P1-1. 아티팩트 업로드 API

- 목표
  - `POST /api/sessions/{id}/artifacts` 구현
- 포함 범위
  - `SessionArtifact` 엔티티/리포지토리/서비스/컨트롤러
  - 파일 저장 경로 정책(`docs/sbtm/artifacts/<session-id>/...`) 또는 기존 스토리지 정책 연계
- 완료 기준
  - 파일 메타데이터 + 세션 연결 저장
  - 유효성 검증(파일 크기/타입)
  - API 테스트 통과

### P1-2. SessionNote / SessionIssue API

- 목표
  - 세션 노트, 버그/이슈/질문을 구조화 저장
- 포함 범위
  - `SessionNote`, `SessionIssue` 모델 및 CRUD API
- 완료 기준
  - 최소 생성/조회/수정 API 제공
  - `type(BUG, TEST_IMPEDIMENT, QUESTION)` 검증
  - TDD 통과

### P1-3. 프로젝트 접근 제어 강화

- 목표
  - 프로젝트 멤버십/조직 멤버십 기반 접근 제어 적용
- 포함 범위
  - 세션/차터 API에 `@projectSecurityService.canAccessProject(...)` 또는 동등 로직 적용
  - 승인 API는 관리자/리드 권한 경로 분리
- 완료 기준
  - 타 프로젝트 사용자 접근 차단 테스트 추가 및 통과

## 2. 우선순위 P2 (안정화)

### P2-1. 승인/중단 이력 조회 API

- 목표
  - 상세 화면에서 타임라인 재구성 가능
- 포함 범위
  - `GET /api/sessions/{id}/approvals`
  - `GET /api/sessions/{id}/interruptions`
- 완료 기준
  - 최신순/시간순 정렬 및 조회 가능

### P2-2. 목록 조회 성능/정합성 보강

- 목표
  - 대용량 데이터에서도 일관된 응답 시간 유지
- 포함 범위
  - 인덱스 점검(`project_id`, `status`, `created_at`, `charter_id`, `tester_id`)
  - 쿼리 플랜 검증
- 완료 기준
  - 기준 데이터셋에서 응답 SLA 충족

### P2-3. API 문서/스키마 동기화

- 목표
  - 구현 API와 문서 일치
- 포함 범위
  - OpenAPI 주석 또는 API 문서 파일 업데이트
  - 테스트 스키마(JSON schema) 확장
- 완료 기준
  - 문서/테스트/실구현 경로 불일치 0건

## 3. 우선순위 P3 (UI 연동)

### P3-1. 차터 관리 화면

- 차터 생성/조회/보관(ARCHIVED) 연동

### P3-2. 세션 작성/라이프사이클 화면

- start/pause/resume/end 버튼 상태 제어
- 제출/승인/보완 요청 플로우 연동

### P3-3. 세션 상세 타임라인

- 승인/중단/이슈/아티팩트 통합 표시

## 4. 권장 실행 순서

1. P1-1 아티팩트 API
2. P1-2 노트/이슈 API
3. P1-3 권한 강화
4. P2-1 이력 조회
5. P2-2 성능 보강
6. P2-3 문서 동기화
7. P3 UI 연동

## 5. 각 항목 공통 DoD

- TestNG 기반 API 테스트 추가
- 기존 SessionControllerApiTest + 신규 테스트 통과
- 에러 응답 규약(`ErrorResponse`) 준수
- `docs/sbtm/SBTM_IMPLEMENTATION_STATUS.md` 업데이트

## 6. 탭별 작업 진행계획 (Exploratory Session Workspace)

### 6.1 탭 1: 차터 관리 (완료)

- 목표
  - `차터 생성/조회/수정/ARCHIVED 전환`을 실데이터로 운영
- 백엔드 작업
  - `POST /api/charters`, `GET /api/projects/{projectId}/charters`, `GET /api/charters/{id}`, `PUT /api/charters/{id}` 응답 필드 점검
  - ARCHIVED 차터 사용 제한(세션 생성 차단) 회귀 점검
- 프론트 작업
  - `ExploratorySessionWorkspace` 하드코딩 차터 목록 제거
  - 프로젝트 단위 차터 조회, 상태 필터, 생성/수정 다이얼로그 API 연동
- 테스트
  - 차터 생성/수정/상태 변경 API 테스트
  - UI E2E: 필터/생성/수정/보관 플로우
- 완료 기준
  - 탭 진입 시 실데이터 표시
  - ARCHIVED 차터는 신규 세션 할당 불가

### 6.2 탭 2: 세션 목록 (완료)

- 목표
  - 세션 목록 필터/페이징/정렬을 실데이터로 제공
- 백엔드 작업
  - `GET /api/projects/{projectId}/sessions` 필터(`status`, `from`, `to`, `testerId`, `charterId`) 검증
  - 목록 응답 성능 점검(인덱스/쿼리 플랜)
- 프론트 작업
  - 하드코딩 세션 목록 제거
  - 필터 입력값을 쿼리 파라미터로 매핑
  - 페이지 전환/정렬 UX 반영
- 테스트
  - 필터 조합 API 테스트 추가
  - UI E2E: 필터 조건별 결과 정확성 검증
- 완료 기준
  - 동일 조건 재조회 시 일관된 결과
  - 대시보드/상세 이동 경로 정상 동작

### 6.3 탭 3: 세션 작성/편집 (고도화 완료)

- 목표: 세션 생성/수정 + 라이프사이클 + 프리미엄 UI 적용 완료
- 현황:
  - 프리미엄 Glassmorphism 테마 및 2단 패널(3:9) 레이아웃 적용 완료
  - 실시간 시간 배분 시각화 차트(Stacked Bar) 구현 완료
  - 타이머 바 및 상태 제어 바 고도화 완료
- 남은 과제:
  - 백엔드 아티팩트 업로드 API 연동
  - SessionNote/SessionIssue API 연동

### 6.4 탭 4: 디브리프/승인 (진행 예정)

### 6.5 탭 5: 세션 상세 (고도화 완료)

- 목표: 세션 타임라인 및 결과 데이터의 프리미엄 시각화 완료
- 현황:
  - 세션 상세 요약 및 시간 배분 결과 차트 구현 완료
  - 세션 노트를 구조적 카드로 분리하여 가독성 개선 완료
  - 원본 차터 미션 구조화 노출 완료

### 6.6 탭별 실행 순서(권장)

1. 탭 1 차터 관리 (완료)
2. 탭 2 세션 목록
3. 탭 3 세션 작성/편집
4. 탭 4 디브리프/승인
5. 탭 5 세션 상세

## 아래부분은 수정하지말아.

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
  ***
  여기까지 수정하지 말아.
