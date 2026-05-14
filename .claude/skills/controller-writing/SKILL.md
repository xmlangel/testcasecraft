---
name: controller-writing
description: Service 메서드를 노출할 REST Controller를 작성하고 Request/Response DTO 클래스를 생성한다. @RestController, @RequestMapping, @PreAuthorize, Swagger @Tag/@Operation, ResponseEntity 패턴 적용. service-implementation 다음 단계.
---

# Controller Writing

Service를 REST 엔드포인트로 노출한다.

## 워크플로우

### 1. 산출물 읽기

- `_workspace/api_01_design_{feature}.json`
- `_workspace/api_03_service_{feature}.md`

설계의 endpoints + Service의 메서드 시그니처 확보.

### 2. Controller 클래스 결정

- 기존 Controller에 엔드포인트 추가 가능 → 기존 클래스 확장
- 새 도메인 → `src/main/java/.../controller/{Feature}Controller.java` 신규

### 3. 신규 Controller 템플릿

```java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.{Feature}Request;
import com.testcase.testcasemanagement.model.{Entity};
import com.testcase.testcasemanagement.service.{Feature}Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "{Domain} - {SubDomain}", description = "{도메인} 관리 API")
@RestController
@RequestMapping("/api/{resources}")
@CrossOrigin(origins = "*")
public class {Feature}Controller {

  @Autowired private {Feature}Service {feature}Service;

  // 엔드포인트 메서드
}
```

### 4. 엔드포인트 작성 (HTTP 메서드별)

#### GET (목록)
```java
@Operation(summary = "{resource} 목록 조회", description = "...")
@GetMapping
@PreAuthorize("...")
public ResponseEntity<List<{Entity}>> list({params}) {
  List<{Entity}> result = {feature}Service.list({params});
  return ResponseEntity.ok(result);
}
```

#### GET (단건)
```java
@Operation(summary = "...", description = "...")
@GetMapping("/{id}")
@PreAuthorize("@{feature}SecurityService.canAccess(#id, authentication.name)")
public ResponseEntity<{Entity}> get(@PathVariable String id) {
  {Entity} result = {feature}Service.get(id);
  return ResponseEntity.ok(result);
}
```

#### POST (생성)
```java
@Operation(summary = "...", description = "...")
@PostMapping
@PreAuthorize("...")
public ResponseEntity<{Entity}> create(@RequestBody {Feature}Request request) {
  {Entity} created = {feature}Service.create(request.getName(), request.getDescription());
  return ResponseEntity.status(HttpStatus.CREATED).body(created);
}
```

또는 RequestParam (단순한 경우):
```java
@PostMapping
@PreAuthorize("...")
public ResponseEntity<{Entity}> create(
    @RequestParam String name,
    @RequestParam(required = false) String description) {
  {Entity} created = {feature}Service.create(name, description);
  return ResponseEntity.status(HttpStatus.CREATED).body(created);
}
```

#### PUT (전체 갱신)
```java
@Operation(summary = "...", description = "...")
@PutMapping("/{id}")
@PreAuthorize("@{feature}SecurityService.canUpdate(#id, authentication.name)")
public ResponseEntity<{Entity}> update(
    @PathVariable String id,
    @RequestBody {Feature}Request request) {
  {Entity} updated = {feature}Service.update(id, request.getName());
  return ResponseEntity.ok(updated);
}
```

#### PATCH (부분 갱신 / 액션)
```java
@Operation(summary = "{action}", description = "...")
@PatchMapping("/{id}/{action}")
@PreAuthorize("...")
public ResponseEntity<{Entity}> performAction(@PathVariable String id) {
  {Entity} result = {feature}Service.performAction(id);
  return ResponseEntity.ok(result);
}
```

#### DELETE
```java
@Operation(summary = "...", description = "...")
@DeleteMapping("/{id}")
@PreAuthorize("@{feature}SecurityService.canDelete(#id, authentication.name)")
public ResponseEntity<Void> delete(@PathVariable String id) {
  {feature}Service.delete(id);
  return ResponseEntity.noContent().build();
}
```

### 5. Request DTO 작성

```java
package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class {Feature}Request {

  @NotBlank(message = "이름은 필수입니다.")
  @Size(max = 100, message = "이름은 100자 이하여야 합니다.")
  private String name;

  @Size(max = 500)
  private String description;
}
```

검증 어노테이션:
- `@NotNull`, `@NotBlank`, `@NotEmpty`
- `@Size(min, max)`
- `@Email`
- `@Pattern(regexp = "...")`
- `@Min`, `@Max`
- `@Past`, `@Future`

Controller에서 검증 활성화: `@RequestBody @Valid {Feature}Request request` (`@Valid` 추가).

### 6. Response DTO 작성 (필요 시)

api-designer가 `responseDto: true`로 설계한 경우만:

```java
package com.testcase.testcasemanagement.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class {Feature}Response {

  private String id;
  private String name;
  // 가공된 필드
  private int memberCount;
  private LocalDateTime lastActivityAt;

  // Entity → DTO 변환은 Service 또는 Mapper에서
}
```

### 7. 보고서 작성

`_workspace/api_04_controller_{feature}.md`. 형식은 agents/controller-writer.md 참조.

## Swagger 메타데이터

| 어노테이션 | 위치 | 내용 |
|----------|------|------|
| `@Tag` | 클래스 | name (그룹명), description (한국어 설명) |
| `@Operation` | 메서드 | summary (간단 한국어), description (상세 한국어) |
| `@Parameter` | 인자 (선택) | description (인자 설명) |
| `@ApiResponse` | 메서드 (선택) | code, description |

기존 Controller(`GroupController.java` 등)의 Swagger 적용 수준을 따름.

## HTTP 상태 코드 매핑

| 액션 | 성공 | 실패 |
|------|------|------|
| GET | 200 | 404 (ResourceNotFound), 403 (AccessDenied) |
| POST | 201 | 400 (잘못된 입력), 403, 409 (충돌) |
| PUT/PATCH | 200 | 400, 404, 403, 409 |
| DELETE | 204 (no content) 또는 200 | 404, 403 |

Spring이 예외를 자동 변환하므로 Controller에서 상태 코드 명시는 성공 경로만.

## 검증 체크 (자체)

- [ ] `@RestController + @RequestMapping("/api/...")` 클래스 어노테이션
- [ ] 모든 엔드포인트에 `@PreAuthorize` (인증 불필요한 공개 API는 명시적으로 `@PreAuthorize("permitAll()")`)
- [ ] 모든 엔드포인트에 `@Operation`
- [ ] 클래스에 `@Tag`
- [ ] ResponseEntity 반환 (Service 반환을 노출 우선)
- [ ] `@Autowired` 필드 주입 (생성자 주입 회피)
- [ ] DTO 필드명이 일관됨 (camelCase)
- [ ] DTO에 검증 어노테이션 (`@NotBlank` 등) — 필수 필드

## 에러 핸들링

- **Service 메서드 시그니처 불일치:** service-implementation 보고서와 비교, 인자 수/타입 일치 확인. 불일치 시 보고 후 service 재실행 또는 캐스팅
- **DTO 이름 충돌:** 기존 DTO 검색하여 재사용 가능하면 재사용, 아니면 prefix 변경
- **URL 패턴 충돌:** 같은 (method, path)가 이미 있으면 사용자 확인

## 원칙

- **기존 패턴 100% 모방:** `GroupController.java`, `OrganizationController.java`
- **Swagger 메타데이터 필수:** API 문서가 자동 생성되므로
- **DTO 우선:** RequestParam 남용 회피, 3개 이상 인자는 DTO로
- **CORS:** `@CrossOrigin(origins = "*")` 클래스 수준 (기존 컨벤션)
