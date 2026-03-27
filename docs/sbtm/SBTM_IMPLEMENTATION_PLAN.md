# 세션 기반 테스트(SBTM) 도입 및 기능화 계획서

## 1. 목적

이 문서는 Test Session Debrief Checklist를 기반으로 팀의 세션 기반 테스트(SBTM)를 표준화하고,
향후 애플리케이션 내 기능(세션 생성/기록/디브리프/승인)으로 구현하기 위한 기준 계획을 정의한다.

## 2. 범위

- 세션 운영 프로세스 정의
- 세션 리포트 표준 템플릿 확정
- 디브리프 승인 게이트 정의
- 기능 구현을 위한 데이터/화면/API 요구사항 초안

## 3. 운영 목표

- 테스트 활동을 60~90분 단위의 세션으로 관리한다.
- 각 세션 종료 시 리포트를 작성하고 테스트 리드 승인을 받는다.
- 세션 기록이 3개월 후에도 재이해 가능한 수준으로 남는다.
- 버그뿐 아니라 테스트 방해 이슈/질문까지 추적 가능하게 만든다.

## 4. 단계별 실행 계획

### Phase 1. 프로세스 표준화 (1주)

- 산출물
  - `SBTM_SESSION_REPORT_TEMPLATE.md`
  - `SBTM_OPERATION_NOTES.md`
- 완료 기준
  - 팀 공용 템플릿 합의
  - 디브리프 질문/승인 기준 확정
  - 저장 위치/파일명 규칙 확정

### Phase 2. 수기 파일럿 운영 (1~2주)

- 방법
  - 실제 테스트를 매일 1~2세션 수행
  - 세션 종료 직후 디브리프(10~15분) 실시
- 측정 지표
  - 리포트 승인 통과율
  - 시간 분류 정확도(재검토 시 큰 수정 비율)
  - 버그/이슈/질문 누락률
- 완료 기준
  - 템플릿 필드 확정
  - 팀 내 작성 편차 감소

### Phase 3. 제품 기능 요구사항 구체화 (1주)

- 데이터 모델, API, UI 화면 명세 정리
- 기존 객체(Project/Test Plan/Test Execution)와 연결 정책 확정
- 권한/승인 워크플로 정의

### Phase 4. MVP 기능 구현 (2~3주)

- 세션 CRUD
- 세션 리포트 작성 UI
- 디브리프 체크/승인 기능
- 산출물 첨부 및 링크
- 기본 통계(세션 수, 영역별 분포, 버그 발견율)

### Phase 5. 운영 안정화 (지속)

- 사용성 피드백 반영
- 자동화(시간 합계, 필수 항목 검증, 템플릿 프리셋)
- 대시보드/검색 개선

## 5. 기능화 요구사항 초안

### 5.1 데이터 모델(초안)

- Charter (테스트 미션)
  - id, projectId, title, description(mission), areas[], tags[]
  - createdBy, createdAt, status(`ACTIVE`, `ARCHIVED`)
  - 정책
    - `ARCHIVED` 상태 차터는 신규 세션 생성에 사용할 수 없음
    - 기존 세션은 차터 보관 이후에도 조회 가능 (참조 유지)
- Session (테스트 세션)
  - id, projectId, charterId(FK), testerId, leadId
  - startedAt, endedAt, interruptedMinutes, netDurationMinutes
  - testExecutionPct, bugInvestigationPct, setupAdminPct
  - environmentSummary, productVersion
  - charterSnapshotTitle, charterSnapshotMission (세션 생성 시점 스냅샷)
  - strategyTags[], areaTags[]
  - overallAssessment, nextSessionNeeded, extendOrAmend
  - status(`DRAFT`, `RUNNING`, `PAUSED`, `SUBMITTED`, `APPROVED`, `NEEDS_UPDATE`)
- SessionNote
  - sessionId, coverageNote, oracleNote, activityNote, narrative
- SessionIssue
  - sessionId, type(`BUG`, `TEST_IMPEDIMENT`, `QUESTION`), title, externalRef
- SessionArtifact
  - sessionId, type(`SCREENSHOT`, `VIDEO`, `LOG`, `TEST_DATA`, `DOC`), uri, description
- SessionApproval
  - id, sessionId, leadId, decision(`APPROVED`, `NEEDS_UPDATE`), comment, decidedAt
  - 역할: 승인 이력(append-only) 저장 전용
- SessionInterruption
  - id, sessionId, startedAt, endedAt, reason
  - `interruptedMinutes`는 SessionInterruption 합산값으로 계산

### 5.2 상태 전이 규칙(명세)

- 상태 전이
  - `DRAFT -> RUNNING` (`/start`)
  - `RUNNING -> PAUSED` (`/pause`)
  - `PAUSED -> RUNNING` (`/resume`)
  - `RUNNING|PAUSED -> DRAFT` (`/end`) // 실행 종료 후 리포트 보완 상태
  - `DRAFT|NEEDS_UPDATE -> SUBMITTED` (`/submit`)
  - `SUBMITTED -> APPROVED` (`/approve`)
  - `SUBMITTED -> NEEDS_UPDATE` (`/request-update`)
- 금지 전이 예시
  - `APPROVED -> *` (수정 불가, 읽기 전용)
  - `SUBMITTED -> RUNNING` (재실행 시 보완요청 후 재제출)
- 단일 소스 원칙
  - 현재 상태의 단일 소스는 `Session.status`
  - `SessionApproval`은 상태 변경의 근거 이력만 저장

### 5.3 API(초안)

**[Charter API]**

- `POST /api/charters` : 차터 생성
- `GET /api/projects/{projectId}/charters` : 프로젝트별 차터 목록 조회
- `GET /api/charters/{id}` : 차터 상세 조회
- `PUT /api/charters/{id}` : 차터 수정/보관

**[Session Lifecycle API]**

- `POST /api/sessions` : 세션 생성 (필수: `charterId`)
- `POST /api/sessions/{id}/start` : 세션 시작 (상태: `RUNNING`)
- `POST /api/sessions/{id}/pause` : 중단 기록 시작 (상태: `PAUSED`)
- `POST /api/sessions/{id}/resume` : 중단 종료 및 재개 (상태: `RUNNING`)
- `POST /api/sessions/{id}/end` : 세션 종료 (상태: `DRAFT` 또는 리포트 작성 대기)
- `GET /api/sessions/{id}` : 세션 상세 조회
- `PUT /api/sessions/{id}` : 세션 리포트 내용 업데이트
- `POST /api/sessions/{id}/submit` : 디브리프 요청 (상태: `SUBMITTED`)
- `POST /api/sessions/{id}/approve` : 세션 승인 (상태: `APPROVED`)
- `POST /api/sessions/{id}/request-update` : 보완 요청 (상태: `NEEDS_UPDATE`)
- `POST /api/sessions/{id}/artifacts` : 증적 파일 업로드
- `GET /api/projects/{projectId}/sessions` : 프로젝트별 세션 목록 검색
  - Query: `status`, `from`, `to`, `testerId`, `charterId`, `page`, `size`, `sort`
  - 기본값: `page=0`, `size=20`, `sort=createdAt,desc`

### 5.4 UI(초안)

- 차터 관리 화면 (Charter Bank)
  - 차터 생성/편집, 목록, 상태(`ACTIVE`/`ARCHIVED`) 필터
  - 차터별 관련 세션 통계(수행 횟수, 발견된 총 버그 수) 표시
- 세션 목록 화면
  - 상태, 기간, 테스터, 연결된 차터, 버그 수 필터
- 세션 작성/편집 화면 (템플릿 기반)
  - **헤더**: 상태 표시, 실시간 세션 타이머(Start/Pause/Resume/End 버튼), 기본 정보(환경, 버전, 태그)
  - **차터 섹션**: 할당된 차터 미션 확인 (세션 생성 시 자동 바인딩)
  - **시간 배분**: `Test Execution`, `Bug Investigation`, `Setup/Admin` 비율 입력 (중단 시간 자동 반영)
  - **테스트 노트**: 수행 흐름, 커버리지, 오라클, 활동 상세 입력 필드
  - **버그/이슈**: 버그 헤드라인 연동, 방해 이슈 및 남은 질문 기록
  - **데이터/산출물**: 테스트 데이터 기록, 증적 파일(스크린샷/로그) 업로드 및 미리보기
  - **평가/액션**: 차터 달성도 체크, 전체 평가 및 다음 세션 제안 차터 작성
- 디브리프/승인 화면
  - 테스터가 작성한 리포트 레이아웃 + 사이드바 체크리스트
  - 리드 코멘트 입력부 및 승인/보완요청 액션 버튼
- 세션 상세 화면 (Read-only)
  - 타임라인 형식의 세션 활동 로그 + 최종 승인된 리포트 아카이브
    ㅁ

## 6. 디브리프 품질 게이트(필수)

- 차터와 실제 활동의 일치성
- 환경/버전/참여자/태그 누락 여부
- 시간값 타당성(중단 시간 제외, 합계 100%)
- 노트의 재해석 가능성(3개월 후 이해 가능)
- 버그와 테스트 방해 이슈의 분리 보고
- 다음 세션 필요성 판단

## 7. 저장 규칙(문서/아티팩트)

- 문서 루트: `docs/sbtm/`
- 세션 리포트(수기 파일럿): `docs/sbtm/reports/YYYY-MM-DD/S-YYYYMMDD-XX.md`
- 증적 파일: `docs/sbtm/artifacts/<session-id>/...`
- 연결 규칙: 리포트 본문에 버그 ID/이슈 ID/증적 경로 명시

## 8. 위험요인 및 대응

- 위험: 문서 작성 부담 증가
  - 대응: 필수/선택 필드 분리, 템플릿 단순화
- 위험: 시간 분류 불일치
  - 대응: 예시 기준 제공, 주간 캘리브레이션
- 위험: 승인 지연
  - 대응: 제출 후 24시간 내 리드 리뷰 SLA 설정

## 9. 완료 정의(Definition of Done)

- 팀이 합의한 템플릿으로 2주 이상 안정 운영
- 세션 리포트 승인률/추적성 지표가 목표 수준 도달
  - 승인 리드타임: 제출 후 24시간 이내 승인/보완 처리율 90% 이상
  - 보완요청률: 2주 평균 20% 이하
  - 필수 필드 누락률: 5% 이하
  - 세션-버그/이슈/아티팩트 연결률: 95% 이상
- MVP 기능 요구사항이 백로그 이슈로 분해 완료
