# API Development Guide

최종 갱신: 2026-08-23 21:40 KST · 기준 스택: Spring Boot 3.5.15 · Java 21 · springdoc-openapi 2.8.3

REST API 개발 가이드라인과 테스트 규칙입니다. 컨트롤러 54개가 이 규약을 공유합니다.

## 📋 목차

1. [API 개발 원칙](#-api-개발-원칙)
2. [API 개발 워크플로우](#-api-개발-워크플로우)
3. [테스트 전략](#-테스트-전략)
4. [보안 규칙](#-보안-규칙)
5. [API 문서화](#-api-문서화)

## 🎯 API 개발 원칙

### RESTful API 설계 원칙

#### URL 설계 규칙

```
GET    /api/organizations           # 조직 목록 조회
GET    /api/organizations/{id}      # 특정 조직 조회
POST   /api/organizations           # 조직 생성
PUT    /api/organizations/{id}      # 조직 전체 수정
PATCH  /api/organizations/{id}      # 조직 부분 수정
DELETE /api/organizations/{id}      # 조직 삭제

# 중첩 리소스
GET    /api/organizations/{id}/members             # 조직 멤버 목록
POST   /api/organizations/{id}/members             # 멤버 추가
DELETE /api/organizations/{id}/members/{memberId}  # 멤버 제거
```

#### ⚠️ 식별자는 UUID 문자열이다

모든 엔티티의 PK 는 `@GeneratedValue(strategy = GenerationType.UUID)` 로 생성한 **`String`** 입니다. 경로 변수와 DTO 필드 타입도 `String` 입니다.

```java
// 올바른 형태
public ResponseEntity<OrganizationResponse> getOrganization(@PathVariable String id) { ... }

// 이 프로젝트에 맞지 않는 형태 — 400 으로 떨어진다
public ResponseEntity<OrganizationResponse> getOrganization(@PathVariable Long id) { ... }
```

RAG 관련 일부 엔드포인트는 FastAPI 스키마와 맞추려고 `java.util.UUID` 타입을 사용합니다.

#### HTTP 상태 코드 사용

```
200 OK                    조회, 수정 성공
201 Created               생성 성공
204 No Content            삭제 성공

400 Bad Request           잘못된 요청 (ResourceNotValidException, 검증 실패)
401 Unauthorized          인증 실패 (토큰 없음·만료)
403 Forbidden             권한 부족 (@PreAuthorize 거부)
404 Not Found             리소스 없음 (ResourceNotFoundException)
409 Conflict              중복·제약 위반 (DataIntegrityViolationException)
400 Bad Request           업로드 크기 초과 — errorCode `FILE_SIZE_EXCEEDED` (기본 100MB)
429 Too Many Requests     레이트 리밋 초과 (Resilience4j)
500 Internal Server Error 서버 내부 오류
```

#### JSON 응답 형식

**단건 응답**

```json
{
  "id": "3f2a9c14-8b7e-4d21-9f60-1c0e5a7b2d38",
  "name": "테스트 조직",
  "description": "조직 설명",
  "createdAt": "2026-08-23T10:00:00",
  "updatedAt": "2026-08-23T10:00:00"
}
```

날짜는 `yyyy-MM-dd'T'HH:mm:ss` 형태입니다(`write-dates-as-timestamps: false`). 타임존 접미가 붙지 않으므로 클라이언트가 사용자 시간대를 적용합니다.

**목록 응답**: Spring Data `Page` 를 그대로 반환하므로 표준 필드를 사용합니다.

```json
{
  "content": [],
  "totalElements": 100,
  "totalPages": 10,
  "number": 0,
  "size": 10,
  "first": true,
  "last": false
}
```

현재 페이지는 `number` 입니다. `currentPage` 라는 필드는 없습니다.

**오류 응답**: `dto/ErrorResponse` 형태로 고정입니다.

```json
{
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "요청한 조직을 찾을 수 없습니다.",
  "timestamp": "2026-08-23T10:00:00",
  "details": { "requestPath": "/api/organizations/999" }
}
```

`error`·`path` 같은 다른 이름을 사용하지 않습니다. 프런트의 오류 처리(`constants/errorCodes.js`)가 `errorCode` 를 읽습니다.

## 🔄 API 개발 워크플로우

### 1. API 설계 및 계획

#### DTO 설계

```java
// 요청 DTO
@Getter
@Setter
public class CreateOrganizationRequest {
  @NotBlank(message = "조직명은 필수입니다")
  @Size(max = 100, message = "조직명은 100자를 초과할 수 없습니다")
  private String name;

  @Size(max = 500, message = "설명은 500자를 초과할 수 없습니다")
  private String description;
}

// 응답 DTO
@Getter
@Builder
public class OrganizationResponse {
  private String id;
  private String name;
  private String description;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
```

검증 메시지를 사용자에게 그대로 보여 주려면 i18n 키를 거칩니다. 어노테이션 메시지는 서버 로그와 개발자용 응답에 남는 값으로 취급합니다.

### 2. Controller 구현

#### 기본 Controller 패턴

```java
@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
@Validated
public class OrganizationController {

  private final OrganizationService organizationService;

  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Page<OrganizationResponse>> getOrganizations(
      @PageableDefault(size = 20) Pageable pageable, Authentication authentication) {

    String currentUser = authentication.getName();
    return ResponseEntity.ok(organizationService.findByUser(currentUser, pageable));
  }

  @GetMapping("/{id}")
  @PreAuthorize("@organizationSecurityService.canAccessOrganization(#id)")
  public ResponseEntity<OrganizationResponse> getOrganization(@PathVariable String id) {
    return ResponseEntity.ok(organizationService.findById(id));
  }

  @PostMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<OrganizationResponse> createOrganization(
      @Valid @RequestBody CreateOrganizationRequest request, Authentication authentication) {

    OrganizationResponse created =
        organizationService.create(request, authentication.getName());
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @PutMapping("/{id}")
  @PreAuthorize("@organizationSecurityService.canManageOrganization(#id)")
  public ResponseEntity<OrganizationResponse> updateOrganization(
      @PathVariable String id, @Valid @RequestBody UpdateOrganizationRequest request) {
    return ResponseEntity.ok(organizationService.update(id, request));
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("@organizationSecurityService.canManageOrganization(#id)")
  public ResponseEntity<Void> deleteOrganization(@PathVariable String id) {
    organizationService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
```

`@PreAuthorize` 표현식에서 인가 서비스는 **현재 사용자를 SecurityContext 에서 직접 읽는 단일 인자 오버로드**를 제공합니다. `authentication.name` 을 넘기는 두 인자 형태도 남아 있으며 둘 다 유효합니다. 새 코드는 단일 인자 쪽이 짧아 읽기 쉽습니다.

#### 예외 처리 — Controller 에서 하지 않는다

오류 응답은 `exception/GlobalExceptionHandler` 한 곳에서 만듭니다. Controller 에 try-catch 를 넣어 `ErrorResponse` 를 직접 조립하지 않습니다. 두 곳에서 만들면 같은 오류가 경로마다 다른 형태로 나가고, 프런트의 오류 분기가 경로별로 갈립니다.

새 도메인 예외를 만들면 **핸들러도 함께 추가합니다.** 등록하지 않으면 일반 `Exception` 핸들러로 떨어져 의도한 404·409 대신 500 이 나갑니다(현재 그런 상태인 예외 목록은 [Java 코딩 가이드라인](./JAVA_CODING_GUIDELINES.md) 5절).

### 3. Service 구현

```java
@Service
@Transactional
@RequiredArgsConstructor
public class OrganizationService {

  private final OrganizationRepository organizationRepository;
  private final OrganizationUserRepository organizationUserRepository;
  private final UserRepository userRepository;
  private final AuditService auditService;

  @Transactional(readOnly = true)
  public Page<OrganizationResponse> findByUser(String username, Pageable pageable) {
    return organizationRepository.findByUser(username, pageable).map(this::toResponse);
  }

  @Transactional(readOnly = true)
  public OrganizationResponse findById(String id) {
    Organization organization =
        organizationRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("조직을 찾을 수 없습니다: " + id));
    return toResponse(organization);
  }

  public OrganizationResponse create(CreateOrganizationRequest request, String currentUser) {
    if (organizationRepository.existsByName(request.getName())) {
      throw new ResourceNotValidException("이미 존재하는 조직명입니다: " + request.getName());
    }

    Organization saved =
        organizationRepository.save(
            Organization.builder()
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(currentUser)
                .build());

    // 생성자를 OWNER 로 추가
    organizationUserRepository.save(
        OrganizationUser.builder()
            .organization(saved)
            .user(userRepository.findByUsername(currentUser).orElseThrow())
            .role(OrganizationUser.OrganizationRole.OWNER)
            .build());

    auditService.logAction(
        AuditEntityType.ORGANIZATION, saved.getId(), AuditAction.CREATE, "조직 생성: " + saved.getName());

    return toResponse(saved);
  }
}
```

- 읽기 전용 메서드에는 `@Transactional(readOnly = true)` 를 붙입니다.
- 역할 enum 은 소유 엔티티 안에 중첩되어 있습니다 (`OrganizationUser.OrganizationRole`, `ProjectUser.ProjectRole`, `GroupMember.GroupRole`).
- 상태를 바꾸는 동작은 `AuditService.logAction(entityType, entityId, action, details)` 로 감사 로그를 기록합니다. 행위자는 인자로 넘기지 않고 서비스가 SecurityContext 에서 읽습니다. 이 메서드는 `REQUIRES_NEW` 라 본 트랜잭션이 롤백되어도 로그는 남습니다.

### 4. Repository 구현

```java
@Repository
public interface OrganizationRepository extends JpaRepository<Organization, String> {

  @Query(
      "SELECT DISTINCT o FROM Organization o "
          + "JOIN o.organizationUsers ou "
          + "WHERE ou.user.username = :username")
  Page<Organization> findByUser(@Param("username") String username, Pageable pageable);

  boolean existsByName(String name);

  @Query(
      "SELECT o FROM Organization o "
          + "JOIN FETCH o.organizationUsers ou "
          + "JOIN FETCH ou.user "
          + "WHERE o.id = :id")
  Optional<Organization> findByIdWithUsers(@Param("id") String id);
}
```

- `JpaRepository<Organization, String>` 에서 ID 타입이 `String` 입니다.
- 목록 조회에서 연관을 함께 쓰면 `JOIN FETCH` 로 N+1 을 막습니다. 단 `JOIN FETCH` 와 `Pageable` 을 함께 쓰면 Hibernate 가 메모리에서 페이징하므로, 페이징이 필요한 조회는 `@EntityGraph` 나 두 단계 조회를 사용합니다.

## 🧪 테스트 전략

작성 패턴과 실행 방법은 두 문서가 정본입니다.

- [테스트 아키텍처 가이드](./TEST_ARCHITECTURE_GUIDE.md): 레이어별 표준, Testcontainers 설정
- [API 테스트 가이드 요약](./API_TESTING_GUIDE_SUMMARY.md): RestAssured 패턴, JSON 스키마, 실행 명령

여기서는 API 개발자가 놓치기 쉬운 셋만 짚습니다.

1. **테스트 프로파일 파일은 `application-test.yml` 입니다.** `application-test.properties` 는 없습니다.
2. **테스트 DB 는 Testcontainers PostgreSQL 입니다.** H2 가 아니므로 PostgreSQL 전용 문법을 그대로 검증할 수 있습니다. 대신 Docker 데몬이 떠 있어야 테스트가 돕니다.
3. **로그인 응답의 토큰 필드는 `accessToken` 입니다.** `token` 으로 읽으면 null 이 들어가 이후 모든 요청이 401 로 떨어집니다.

새 엔드포인트를 만들면 JSON 스키마를 `src/test/resources/schemas/` 에 추가하고 스키마 검증 테스트를 붙입니다. 응답 필드 이름이 조용히 바뀌는 것을 이 층이 잡습니다.

## 🔒 보안 규칙

정본은 [보안 가이드](./SECURITY_GUIDE.md)입니다. API 개발 시 확인할 것만 옮깁니다.

### 1. 인증 및 권한 검증

- 인증이 필요한 엔드포인트는 `@PreAuthorize` 를 붙입니다. Spring Security 설정이 `/api/**` 를 `authenticated()` 로 막고 있지만, 그것만으로는 **어느 프로젝트의 데이터인지**를 걸러내지 못합니다.
- 리소스 소속을 확인하는 판정은 `security/` 패키지의 세 서비스를 사용합니다.

| 빈 이름 | 담당 |
| :--- | :--- |
| `@projectSecurityService` | 프로젝트·케이스·실행·결과·첨부·세션·RAG 리소스 접근·편집 판정 |
| `@organizationSecurityService` | 조직 멤버십·관리·소유자 판정 |
| `@groupSecurityService` | 그룹 리더·멤버 판정 |

- `hasRole('ADMIN')` 만으로 막은 엔드포인트는 시스템 관리자 전용입니다. 프로젝트 단위 데이터에 `hasRole` 만 걸면 필요 이상의 권한을 요구하게 됩니다.

### 2. 데이터 검증

- 요청 DTO 에 Bean Validation 어노테이션을 붙이고 Controller 파라미터에 `@Valid` 를 붙입니다.
- 파일 업로드는 `max-file-size` 기본 100MB 입니다(`MAX_FILE_SIZE` 환경 변수로 조정). 초과하면 `errorCode` 가 `FILE_SIZE_EXCEEDED` 인 **400** 응답이 나갑니다(`details.maxFileSize` 에 실제 한도가 담깁니다). 413 이 아니므로 클라이언트에서 상태 코드로만 갈라 처리하면 일반 검증 실패와 섞입니다.

### 3. 민감 정보 보호

- 응답 DTO 에 비밀번호·토큰·API 키를 넣지 않습니다. 엔티티를 그대로 반환하지 않고 DTO 로 변환하는 이유가 여기 있습니다.
- 저장하는 비밀값(LLM API 키·Jira 토큰·메일 비밀번호·Google 서비스 계정 JSON)은 `security/EncryptionUtil` 로 AES-256 암호화해 저장합니다. 평문으로 컬럼에 넣지 않습니다.
- 로그에 JWT·API 키·커넥션 문자열을 남기지 않습니다.

### 4. 레이트 리밋

Resilience4j 로 제한합니다. 설정은 `application.yml` 의 `resilience4j.ratelimiter.instances` 이고, 현재 `pageRefreshLimiter`(60초당 10회, 대기 없이 즉시 거부)가 정의되어 있습니다. 초과 시 `RateLimiterFilter` 를 거쳐 **429** 가 나갑니다.

비용이 큰 엔드포인트(대량 임베딩·리포트 생성·외부 API 호출)를 새로 만들면 리미터 인스턴스를 추가할지 검토합니다.

## 📚 API 문서화

### Swagger/OpenAPI 설정

`config/OpenApiConfig` 가 정의합니다.

- 제목: `TestCaseCraft API`
- 버전: Gradle `buildInfo()` 가 주입한 빌드 버전 (하드코딩하지 않습니다)
- 보안 스킴: `bearerAuth` (HTTP bearer, `JWT` 포맷)

### API 문서 접근

| 용도 | 주소 |
| :--- | :--- |
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI 스펙 (JSON) | `http://localhost:8080/api-docs` |

### 어노테이션

```java
@Operation(summary = "조직 조회", description = "ID 로 조직 한 건을 조회합니다.")
@ApiResponses({
  @ApiResponse(responseCode = "200", description = "조회 성공"),
  @ApiResponse(responseCode = "403", description = "조직 접근 권한 없음"),
  @ApiResponse(responseCode = "404", description = "조직 없음")
})
@GetMapping("/{id}")
public ResponseEntity<OrganizationResponse> getOrganization(@PathVariable String id) { ... }
```

`@PreAuthorize` 가 403 을 낼 수 있는 엔드포인트에는 403 응답도 문서에 기록합니다. 인가 실패와 검증 실패를 클라이언트가 갈라 처리해야 하기 때문입니다.

### MCP 서버

`mcp-server/` 에 이 REST API 를 MCP 도구로 노출하는 TypeScript 서버가 있습니다. 엔드포인트 시그니처나 응답 형태를 바꾸면 그쪽 도구 정의도 함께 확인합니다.

---

## 📚 관련 문서

- [개발 가이드](./DEVELOPMENT_GUIDE.md) - 개발 환경 및 워크플로우
- [Java 코딩 가이드라인](./JAVA_CODING_GUIDELINES.md) - 레이어 구조·예외·JPA 규약
- [보안 가이드](./SECURITY_GUIDE.md) - 인증·인가·데이터 보호
- [테스트 아키텍처 가이드](./TEST_ARCHITECTURE_GUIDE.md) - 레이어별 테스트 표준
- [API 테스트 가이드 요약](./API_TESTING_GUIDE_SUMMARY.md) - API 테스트 작성·실행
