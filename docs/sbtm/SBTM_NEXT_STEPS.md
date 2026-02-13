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

