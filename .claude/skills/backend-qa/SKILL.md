---
name: backend-qa
description: 백엔드 API 추가의 4-layer 정합성(Controller→Service→Repository→Model) + DTO + 권한 + Swagger + i18n + DB 마이그레이션을 검증하고 TestNG 단위 테스트 스켈레톤을 작성한다. 자동 수정 가능한 누락은 직접 Edit. controller-writing 다음 단계.
---

# Backend QA

API 추가 작업의 **경계면 정합성**을 검증한다.

## 워크플로우

### 1. 산출물 읽기

- `_workspace/api_01_design_{feature}.json`
- `_workspace/api_02_model_{feature}.md`
- `_workspace/api_03_service_{feature}.md`
- `_workspace/api_04_controller_{feature}.md`

### 2. 4-layer 호출 사슬 검증

#### Controller → Service
```bash
# Controller가 호출하는 Service 메서드 추출
grep -oP "{feature}Service\.\w+\(" src/main/java/.../controller/{Feature}Controller.java | sort -u

# Service의 public 메서드 추출
grep -E "^\s+public\s+\S+\s+\w+\(" src/main/java/.../service/{Feature}Service.java
```

각 Controller 호출이 Service에 존재 → ✅.

#### Service → Repository
```bash
grep -oP "{feature}Repository\.\w+\(" src/main/java/.../service/{Feature}Service.java | sort -u
```

각 호출이 Repository 메서드 (선언 또는 JpaRepository 기본 메서드) 또는 명명 규칙으로 자동 생성 가능한지 확인.

명명 규칙 자동 검증:
- `findByXxx` → Entity에 `xxx` 필드 있어야 함
- `findByXxxAndYyy` → 두 필드 모두 있어야 함
- `existsByXxx`, `countByXxx`, `deleteByXxx` 동일

#### Service → Entity 필드
```bash
# Service가 호출하는 setter/getter
grep -oP "\.(get|set)\w+\(" src/main/java/.../service/{Feature}Service.java | sort -u
```

각 set/get이 Entity의 Lombok 생성 메서드와 매칭되는지 확인.

### 3. 권한 표현식 매칭

```bash
# Controller의 @PreAuthorize SpEL 추출
grep -oP "@PreAuthorize\(\"[^\"]+\"\)" src/main/java/.../controller/{Feature}Controller.java

# 표현식에서 @SecurityService.method 패턴 추출
# 각 메서드가 실제로 존재하는지 확인
grep -rln "public.*{method}\(" src/main/java/.../security/
```

### 4. DTO ↔ Service 시그니처 매칭

```bash
# Request DTO 필드
grep -oP "private\s+\w+\s+\w+;" src/main/java/.../dto/{Feature}Request.java

# Service 메서드 인자
grep -A 2 "public\s+\S+\s+\w+\(" src/main/java/.../service/{Feature}Service.java
```

DTO 필드 ⊇ Service 메서드 인자.

### 5. Swagger 메타데이터

```bash
# 클래스에 @Tag
grep -c "@Tag" src/main/java/.../controller/{Feature}Controller.java
# → 1 expected

# 메서드에 @Operation
grep -c "@Operation" src/main/java/.../controller/{Feature}Controller.java
# → 엔드포인트 수와 일치 expected
```

누락 시 자동 추가.

### 6. i18n 키 확인

api-designer의 `i18nKeysNeeded`가 있으면:
```bash
# 키별로 백엔드 KeysInitializer 검색
grep -rln '"{keyName}"' src/main/java/.../i18n/keys/
```

매칭 0이면 ⚠️ — i18n-orchestrator로 별도 추가 권장.

### 7. DB 마이그레이션 재확인

model-builder의 보고서에서 ⚠️ 또는 ❌ 항목 확인. ❌가 있으면 보고서 ❌ 섹션에 명시.

### 8. 회귀 검증

```bash
git diff --stat src/main/java/com/testcase/testcasemanagement
git diff src/main/java/.../i18n/  # 기존 Translations 변경 여부
```

신규 파일만 있고 기존 파일 수정 없어야 함. 기존 파일 수정 발견 시 diff 본문 검토 → 의도된 수정인지 ⚠️.

### 9. 정적 컴파일 검사

```bash
# 빠른 구문 검사 (실제 빌드는 사용자 위임)
javac --version  # 확인용
```

직접 빌드 명령 실행 금지 (AGENTS.md 1.1). 보고서에 `./gradlew compileJava` 명령 명시.

### 10. TestNG 스켈레톤 작성

`src/test/java/.../service/{Feature}ServiceTest.java`에 핵심 메서드 스켈레톤 작성. 템플릿은 agents/backend-qa.md 참조.

스켈레톤 기본 구성:
- Happy path (정상 흐름)
- Resource Not Found (404)
- Access Denied (403)
- (필요 시) IllegalArgument (400)

각 시나리오의 assertion은 최소한만 (검증 골격만, 풍부한 시나리오는 사용자 보완).

### 11. 자동 수정

| 이슈 | 자동 수정 |
|------|----------|
| Swagger `@Tag` 누락 | 클래스 위에 추가 |
| Swagger `@Operation` 누락 | 각 메서드 위에 추가 |
| Service `@Transactional` 누락 | 클래스 위에 추가 |
| Controller `@Autowired` 누락 | 필드에 추가 |
| import 누락 | 자동 추가 |

### 12. 보고서 작성

`_workspace/api_05_qa_report_{feature}.md`. 형식은 agents/backend-qa.md 참조.

## 검증 통계

보고서에 포함:
- 4-layer 호출 사슬 수
- 매칭 통과 / 실패
- 권한 표현식 검증 결과
- DTO 정합성
- Swagger 작성률
- 자동 수정 / 수동 필요 수
- DB 마이그레이션 위험도

## 사용자 검증 명령

QA는 직접 실행 금지. 보고서에 명시:

```
1. ./gradlew compileJava
2. ./gradlew test --tests "*{Feature}ServiceTest*"
3. (재시작) pkill -f bootRun && ./gradlew bootRun
4. Swagger UI: http://localhost:8080/swagger-ui/index.html
5. curl 또는 Postman으로 엔드포인트 호출
6. (DB) PostgreSQL에서 데이터 확인
```

## 원칙

- **존재 검사 ≠ 정합성 검사:** 4-layer 호출 사슬이 진짜 검증
- **자동 수정 후 재검증:** 수정 → grep → 통과 확인
- **빌드/실행 직접 금지:** AGENTS.md 1.1, 명령만 보고
- **회귀 우선:** 기존 코드 의도치 않은 변경 없는지 확인
- **TestNG 스켈레톤은 골격만:** 풍부한 시나리오는 사용자 보완

## 자동 수정 불가 (수동 보고)

- 시그니처 불일치 (인자 수/타입 차이)
- 권한 표현식의 SecurityService 메서드 부재
- DB 마이그레이션 ❌ 위험
- i18n 키 미등록
- 기존 코드 회귀 (의도 불명)
- DTO 필드 변경 (API 호환성 영향)

## 후속 작업 지원

수동 조치 항목을 사용자가 처리한 후 "재검증"을 요청하면 같은 feature slug로 다시 실행.
