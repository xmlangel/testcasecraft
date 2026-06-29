---
name: testcasecraft-api-inventory
description: Spring Boot 프로젝트의 REST 컨트롤러를 결정적으로 스캔하여 MCP 도구 생성에 필요한 표준 인벤토리 JSON을 추출하는 절차. @RestController/@RequestMapping/@GetMapping/@PostMapping/@PutMapping/@DeleteMapping/@PatchMapping 어노테이션, @PathVariable/@RequestParam/@RequestBody/@RequestPart, SecurityConfig의 경로 규칙, @Secured/@PreAuthorize, 응답 DTO 스키마를 모두 수집한다. Spring Boot API 분석·매핑·인벤토리화 요청 시 반드시 사용.
---

# Spring API Inventory

Spring Boot 프로젝트의 REST API를 코드 직접 분석으로 추출하여 MCP 도구 생성의 입력 형태로 변환하는 결정적 절차.

## 절차

### Step 1: 컨트롤러 발견

```bash
find src/main/java -name "*Controller.java" -type f
```

또는 어노테이션 기반:

```bash
grep -rl "@RestController" src/main/java
```

두 결과를 합쳐 중복 제거. controller 디렉토리 외부에 있는 컨트롤러도 놓치지 않도록 항상 둘 다 실행한다.

### Step 2: 컨트롤러별 베이스 경로 추출

각 컨트롤러의 클래스 레벨 `@RequestMapping("/api/...")` 확인. 없으면 메서드 레벨 경로가 절대 경로.

### Step 3: 메서드 추출

각 메서드에 대해 추출:

| 항목           | 추출 방법                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| HTTP method    | `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping`, `@RequestMapping(method=...)` |
| 경로           | 어노테이션 값 + 클래스 경로 결합                                                                               |
| pathParams     | `@PathVariable` 어노테이션이 붙은 파라미터                                                                     |
| queryParams    | `@RequestParam` 어노테이션, required/defaultValue 함께                                                         |
| requestBody    | `@RequestBody`가 붙은 파라미터의 타입                                                                          |
| multipart      | `@RequestPart` 또는 `MultipartFile` 타입 존재 여부                                                             |
| responseSchema | 반환 타입. `ResponseEntity<T>`면 T를, `T`면 T 사용                                                             |
| auth           | 메서드/클래스의 `@Secured`, `@PreAuthorize`, `@RolesAllowed`                                                   |
| summary        | 메서드 위 javadoc 또는 `@Operation(summary=...)`                                                               |

### Step 4: SecurityConfig 교차 확인

`SecurityConfig.java` 또는 `WebSecurityConfig.java`의 `http.authorizeHttpRequests(...)` 패턴을 읽어 경로별 인증 규칙을 보강. 메서드 어노테이션이 없어도 SecurityConfig에 `permitAll()`로 명시되면 `auth.required: false`로 표기.

### Step 5: DTO 평탄화

`responseSchema`에 명시된 클래스를 찾아 필드 목록을 추출. 중첩 DTO는 재귀적으로 전개하되 최대 3단계까지. 더 깊으면 `$ref`로 표기.

표준 변환:

- `Long` → `"integer"`
- `String` → `"string"`
- `LocalDateTime` → `"string"` + `format: "date-time"`
- `List<X>` → `"array"` + `items: X`
- `enum` → `"string"` + `enum: [...]`

### Step 6: JSON 작성

`.workspace/01_api_inventory.json`에 저장. 표준 스키마는 `references/inventory-schema.md` 참조.

### Step 7: 요약 문서

`.workspace/01_api_inventory_summary.md`에 사람이 읽을 요약 작성:

- 컨트롤러 수, 메서드 수
- 인증 필요 비율
- 그룹화 추천 (어떤 컨트롤러들을 하나의 MCP 도구 그룹으로 묶을지)
- 위험 도구 목록 (DELETE, bulk-, admin- 패턴)

## 결정적 정렬

같은 입력에 대해 항상 같은 출력이 나오도록:

1. 컨트롤러 파일은 파일명 알파벳 순
2. 메서드는 HTTP 메서드 → 경로 알파벳 순
3. 파라미터는 어노테이션 등장 순 (코드 순서 그대로)

## 일반 vs testcasecraft 특화

이 스킬은 일반 Spring Boot 프로젝트에 적용 가능하지만, testcasecraft에는 다음 특수 사항이 있다:

- `/api/auth/login`, `/api/auth/refresh`가 인증 진입점
- JWT를 `Authorization: Bearer ...` 헤더로 전달
- 일부 컨트롤러는 RAG/Jira 외부 서비스 호출 (오래 걸릴 수 있음 → `risk: medium`으로 표기)
- 멀티파트 업로드는 `TestCaseAttachmentController`, `RagAdminController`에 집중

## 산출물 검증

추출 완료 후 자체 검증:

- [ ] 모든 컨트롤러가 인벤토리에 포함되었는가
- [ ] 메서드 수가 `grep -c "@.*Mapping" src/main/java/.../Controller.java` 합계와 비슷한가
- [ ] 인증 필요 비율이 SecurityConfig의 매트릭스와 일치하는가
- [ ] 응답 스키마에 `$unknown`이 5% 이내인가

자세한 JSON 스키마와 예시는 `references/inventory-schema.md` 참조.
