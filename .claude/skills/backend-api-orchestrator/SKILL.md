---
name: backend-api-orchestrator
description: 새 백엔드 REST API 엔드포인트를 추가하는 통합 워크플로우. 설계 → Entity/Repository → Service → Controller → QA의 5단계를 5명 팀으로 자동화. "API 추가", "엔드포인트 만들어", "백엔드 API 만들어", "REST API 추가", "{도메인} API 추가", "Controller 추가", "Service 메서드 추가", "Entity 추가", "API 재구현", "API 수정", "Swagger 보완", "API 검증", "백엔드 정합성 확인" 같은 요청 시 반드시 이 스킬을 사용한다. 4-layer 아키텍처(Controller/Service/Repository/Model) + DTO + TestNG + i18n + 권한 표현식 자동 처리.
---

# Backend API Orchestrator

새 백엔드 API 추가를 5명의 에이전트 팀으로 자동화.

**실행 모드:** 에이전트 팀 (TeamCreate 기반, 5명 협업)

## Phase 0: 컨텍스트 확인

워크플로우 시작 전 `_workspace/` 내 기존 api 산출물 확인:

| 상태 | 사용자 요청 | 실행 모드 |
|------|------------|----------|
| `_workspace/` 내 api_* 없음 | 신규 API 추가 | **초기 실행** — 전체 Phase |
| `_workspace/api_01_{feature}.json` 존재 | "재설계", "설계 수정" | **부분 재실행** — Phase 1부터 |
| `_workspace/api_02_{feature}.md` 존재 | "Model만 다시" | **부분 재실행** — Phase 2부터 |
| `_workspace/api_03_{feature}.md` 존재 | "Service만 다시" | **부분 재실행** — Phase 3부터 |
| `_workspace/api_04_{feature}.md` 존재 | "Controller만 다시" | **부분 재실행** — Phase 4부터 |
| `_workspace/api_05_{feature}.md` 존재 | "검증만 다시" | **부분 재실행** — Phase 5만 |
| 다른 `feature` slug | 별도 API 추가 | **추가 실행** — 전체 Phase |

## Phase 1: 입력 파라미터 수집

사용자 요청에서 다음 추출:

1. **feature** (필수): 기능 슬러그 (kebab-case, 예: `notification-mark-read`)
2. **description** (필수): 요구사항 한 줄 (예: "사용자 알림을 읽음 처리")
3. **domain** (선택): 관련 도메인 (예: `notification`)
4. **relatedEntity** (선택): 관련 Entity 이름

불명확하면 AskUserQuestion으로 다음 질문:
- 어떤 액션? (CRUD 또는 도메인 액션)
- 누가 호출 가능? (권한)
- 응답에 포함될 데이터?

## Phase 2: 팀 구성 및 작업 할당

`TeamCreate`로 5명 팀 구성. 모든 에이전트는 `model: "opus"`.

| 팀원 | 에이전트 정의 | 역할 |
|------|------------|------|
| designer | `api-designer` | 계약 설계 (URL/DTO/권한/예외) |
| modeler | `model-builder` | Entity + Repository |
| servicer | `service-implementer` | Service + 비즈니스 로직 |
| controller | `controller-writer` | Controller + DTO |
| qa | `backend-qa` | 4-layer 정합성 + TestNG 스켈레톤 |

`TaskCreate`로 작업 의존성:
- Task A: `design` (designer)
- Task B: `buildModel` (modeler) — blockedBy A
- Task C: `implementService` (servicer) — blockedBy A + B
- Task D: `writeController` (controller) — blockedBy A + C
- Task E: `verify` (qa) — blockedBy B + C + D

## Phase 3: 데이터 흐름

```
[사용자 입력] feature, description, domain?, relatedEntity?
    ↓
[designer]
    ↓ _workspace/api_01_design_{feature}.json
    ↓ needsNewSecurityService 또는 newEntity 있으면 오케스트레이터 우선 보고
    ↓ SendMessage → modeler: "entityChanges/newEntity 전달"
    ↓ SendMessage → servicer: "responseType/dtos 전달"
    ↓ SendMessage → controller: "endpoints/preAuthorize 전달"
[modeler]
    ↓ src/main/java/.../model/{Entity}.java (신규 또는 수정)
    ↓ src/main/java/.../repository/{Entity}Repository.java (신규)
    ↓ _workspace/api_02_model_{feature}.md
    ↓ SendMessage → servicer: "Entity 필드 + Repo 메서드 전달"
    ↓ DB 마이그레이션 ❌ 위험이면 오케스트레이터 보고
[servicer]
    ↓ src/main/java/.../service/{Feature}Service.java (신규 또는 메서드 추가)
    ↓ (선택) src/main/java/.../security/{Feature}SecurityService.java (사용자 승인 시)
    ↓ _workspace/api_03_service_{feature}.md
    ↓ SendMessage → controller: "Service 메서드 시그니처 전달"
    ↓ SendMessage → qa: "Service 검증 대상 전달"
[controller]
    ↓ src/main/java/.../controller/{Feature}Controller.java (신규 또는 메서드 추가)
    ↓ src/main/java/.../dto/{Feature}Request.java (필요 시)
    ↓ src/main/java/.../dto/{Feature}Response.java (필요 시)
    ↓ _workspace/api_04_controller_{feature}.md
    ↓ SendMessage → qa: "Controller 파일 + 엔드포인트 목록 전달"
[qa]
    ↓ 4-layer 호출 사슬 + 권한 + DTO + Swagger + i18n + 회귀 + 정적 컴파일
    ↓ 자동 수정 + TestNG 스켈레톤
    ↓ src/test/java/.../service/{Feature}ServiceTest.java
    ↓ _workspace/api_05_qa_report_{feature}.md
    → 오케스트레이터: Pass/Auto-fixed/Issues 보고
```

**데이터 전달 전략:**
- 파일 기반(`_workspace/`): 산출물 본문
- 메시지 기반(SendMessage): 진행 통지 + 시그니처 전달
- 태스크 기반(TaskCreate): 의존성

## Phase 4: 에러 핸들링

| 에러 유형 | 전략 |
|----------|------|
| designer가 needsNewSecurityService 보고 | 워크플로우 일시 중단, 사용자 승인 받음. 거부 시 기존 SecurityService 재활용 또는 인라인 검증 |
| modeler의 DB 마이그레이션 ❌ 위험 | 사용자에게 마이그레이션 전략 확인 (수동 처리 또는 안전한 대안). 진행 vs 중단 결정 |
| servicer가 Repository 메서드 부재 발견 | modeler 재실행 또는 servicer가 임시 fallback 사용 후 보고 |
| controller가 Service 시그니처 불일치 발견 | servicer 재실행 또는 controller에서 캐스팅 |
| qa가 회귀 감지 (의도치 않은 기존 코드 수정) | 워크플로우 중단, 사용자에게 git diff 검토 요청 |
| qa가 정적 검사 실패 (자동 수정 후에도) | ❌ 보고, 사용자 수동 처리 |
| i18n 키 미등록 | qa가 보고만 (i18n-orchestrator로 별도 후속 작업) |

## Phase 5: 최종 산출물 보고

```
✅ 백엔드 API "{feature}" 추가 완료

📁 생성/수정 파일 (N개)
- model/{Entity}.java (신규 또는 +필드)
- repository/{Entity}Repository.java (신규)
- service/{Feature}Service.java (신규 또는 +메서드)
- security/{Feature}SecurityService.java (신규, 사용자 승인 시)
- controller/{Feature}Controller.java (신규 또는 +엔드포인트)
- dto/{Feature}Request.java (필요 시)
- dto/{Feature}Response.java (필요 시)
- test/.../service/{Feature}ServiceTest.java (TestNG 스켈레톤)

🔗 추가된 엔드포인트
- {METHOD} /api/{path}: {요약}
- ...

📊 통계
- 엔드포인트: N개
- 신규 Entity: M개
- 신규 Service 메서드: K개
- 자동 수정: L
- 수동 조치: P

🔍 사용자 검증 권장
1. ./gradlew compileJava
2. ./gradlew test --tests "*{Feature}ServiceTest*"
3. (재시작) pkill -f bootRun && ./gradlew bootRun
4. Swagger UI: http://localhost:8080/swagger-ui/index.html
5. curl/Postman으로 엔드포인트 호출
6. (DB) PostgreSQL에서 변경 확인

⚠️ DB 마이그레이션 영향: (있으면 표시)
⚠️ i18n 키 추가 필요: (있으면 i18n-orchestrator 사용 안내)
⚠️ 수동 조치 항목: (있으면 표시)
```

## 테스트 시나리오

### 정상 흐름
**입력:** "사용자 알림을 읽음 처리하는 API 추가" (feature=notification-mark-read)

**예상 산출:**
- `_workspace/api_*_{feature}.{json,md}` 5개
- `model/Notification.java` 수정 (+readAt 필드)
- `service/NotificationService.java` +markAsRead 메서드
- `controller/NotificationController.java` +PATCH /api/notifications/{id}/read
- `test/.../NotificationServiceTest.java` 스켈레톤
- 4-layer 호출 사슬 모두 매칭, Pass

### 에러 흐름
**입력:** "프로필 정보를 완전히 다시 만드는 새 권한 시스템 도입" (feature=profile-redesign)

**예상 동작:** designer가 `needsNewSecurityService=true` + `newEntity` 다수 + 큰 마이그레이션 감지 → 오케스트레이터가 사용자에게 단계별 분리 제안 → 사용자 확인 후 작은 단위로 분할 실행

## 후속 작업 지원

이 스킬이 처리하는 후속 요청:
- "API에 엔드포인트 추가" → Phase 0에서 부분 실행, 기존 Controller 확장
- "권한 정책 변경" → Phase 1만 재실행 후 후속 Phase 영향 평가
- "DTO 필드 추가" → 영향 받는 Phase만 재실행 (controller + qa)
- "테스트 시나리오 보강" → backend-qa만 단독 실행
- "i18n 키 누락 추가" → i18n-orchestrator로 위임

## 참고

- 에이전트 정의: `.claude/agents/{api-designer,model-builder,service-implementer,controller-writer,backend-qa}.md`
- 전문 스킬: `.claude/skills/{api-design,model-construction,service-implementation,controller-writing,backend-qa}/SKILL.md`
- 기존 패턴 참조:
  - Controller: `src/main/java/.../controller/GroupController.java`
  - Service: `src/main/java/.../service/GroupService.java`
  - Entity: `src/main/java/.../model/Group.java`
  - Repository: `src/main/java/.../repository/GroupRepository.java`
  - TestNG: `src/test/java/.../service/GoogleConfigServiceTest.java`
- 백엔드 아키텍처: AGENTS.md 2.1
- i18n 추가: `i18n-orchestrator` 스킬 연계
