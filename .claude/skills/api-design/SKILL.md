---
name: api-design
description: 새 백엔드 API 추가 요청을 받아 REST 경로/HTTP 메서드/DTO/응답 형식/권한/예외/Entity 변경/i18n 키 필요성까지 종합적으로 설계한다. 코드를 작성하지 않고 청사진 JSON을 생성. _workspace/api_01_design_{feature}.json으로 저장. 백엔드 API 추가 워크플로우의 첫 단계.
---

# API Design

새 API의 계약(contract)을 설계한다. 다른 4명의 에이전트가 따라갈 청사진을 만드는 단계.

## 워크플로우

### 1. 요구사항 분석

사용자 요청에서 다음 추출:
- 비즈니스 목적 (왜 필요한가)
- 도메인 (`notification`, `user`, `project`, ...)
- 액션 유형 (Create/Read/Update/Delete/Action)
- 입력 (사용자 입력, PathVariable, 인증 정보)
- 출력 (Entity, DTO, void, 페이지네이션)
- 부작용 (DB 변경, 이벤트 발행, 외부 호출, i18n 메시지)

불명확하면 사용자에게 질문 (AskUserQuestion).

### 2. REST 설계

#### URL 결정

| 액션 | URL 패턴 |
|------|---------|
| 목록 조회 | `GET /api/{resources}` |
| 단건 조회 | `GET /api/{resources}/{id}` |
| 생성 | `POST /api/{resources}` |
| 전체 갱신 | `PUT /api/{resources}/{id}` |
| 부분 갱신 | `PATCH /api/{resources}/{id}` |
| 액션 (도메인 동사) | `PATCH /api/{resources}/{id}/{action}` 또는 `POST /api/{resources}/{id}/{action}` |
| 삭제 | `DELETE /api/{resources}/{id}` |
| 하위 자원 목록 | `GET /api/{resources}/{id}/sub` |

복수형 자원명 사용. snake_case가 아닌 camelCase가 기존 컨벤션이면 따름.

#### HTTP 메서드

- 멱등 액션: GET, PUT, DELETE
- 비멱등 액션: POST
- 부분 수정: PATCH

### 3. DTO 설계

#### Request DTO 필요 조건

| 조건 | 결정 |
|------|------|
| 필드 ≤3개, 검증 단순 | RequestParam (DTO 없음) |
| 필드 ≥3개 또는 중첩 객체 | Request DTO |
| 검증 어노테이션 다수 필요 | Request DTO |
| 같은 요청 형태가 다른 곳에도 쓰임 | 기존 DTO 재사용 |

#### Response DTO 필요 조건

| 조건 | 결정 |
|------|------|
| Entity 전체 노출 OK | Entity 직접 반환 (`@JsonIgnore` 확인) |
| 가공/집계 필요 | Response DTO |
| 민감 필드 제외 필요 | Response DTO 또는 `@JsonIgnore` |
| 페이지네이션 | `Page<Entity>` 또는 커스텀 |

### 4. Entity 변경 분석

새 도메인 vs 기존 Entity 확장:
- 새 도메인 개념 (예: Notification) → newEntity
- 기존 Entity에 상태 필드 추가 (예: User.lastLoginAt) → entityChanges

### 5. 권한 설계

기존 SecurityService 검색:
```bash
grep -rln "SecurityService" src/main/java/.../security/
```

각 클래스의 메서드 시그니처를 보고 가장 적절한 표현식 선택:
- `@projectSecurityService.canAccessProject(#projectId, authentication.name)`
- `@organizationSecurityService.isOrganizationMember(#orgId, authentication.name)`
- `@groupSecurityService.hasLeaderRole(#groupId, authentication.name)`

새 SecurityService 신설은 사용자 확인 후만 결정.

### 6. 예외 매핑

기존 커스텀 예외:
- `ResourceNotFoundException` → 404
- `AccessDeniedException` → 403
- `IllegalArgumentException` → 400 (Spring Default)
- `IllegalStateException` → 400 또는 409

새 예외 신설은 가급적 회피, 기존 재사용.

### 7. i18n 키 필요성

API가 응답에 사용자 친화적 메시지를 포함하면 i18n 키 후보를 식별:
- 성공 메시지: `{domain}.{action}.success`
- 실패 메시지: `{domain}.{action}.failed`

`i18nKeysNeeded` 배열에 키와 한/영 번역 후보 기록. 별도로 i18n-orchestrator로 추가 가능.

### 8. 산출물 작성

`_workspace/api_01_design_{feature}.json`에 저장. 스키마는 agents/api-designer.md 참조.

## 설계 검증 (자체)

- [ ] 모든 엔드포인트가 유일한 (method, path) 쌍
- [ ] @PreAuthorize 표현식이 실제 SecurityService 메서드와 매칭 가능
- [ ] DTO 필드가 Service 메서드 인자와 일치 (인자 < 4 또는 객체)
- [ ] entityChanges가 ddl-auto=update에서 안전
- [ ] i18n 키가 필요한 경우 후보 식별

## 원칙

- **기존 패턴 일관성:** 새 컨벤션 도입 금지
- **권한 최소 부여:** 명세 불명확 시 가장 제한적으로 설계
- **DTO 미리 식별:** 코드 작성 단계에서 DTO 형식 변경은 비용 큼
- **i18n 사전 식별:** API 추가 후 i18n 별도 작업이 잊혀지기 쉬움

## 에러 핸들링

- 요구사항이 너무 큰 경우(엔드포인트 ≥5개) → 사용자에게 분할 제안
- 권한 정책 불명확 → 가장 제한적 설계 + designNotes에 명시
- 새 도메인 + 새 SecurityService 동시 필요 → 사용자 사전 승인
