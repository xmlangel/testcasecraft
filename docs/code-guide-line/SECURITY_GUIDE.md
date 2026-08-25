# Security Guide

최종 갱신: 2026-08-23 21:40 KST · 기준 스택: Spring Boot 3.5.15 · Spring Security 6.5.11 · JJWT 0.11.5

보안 및 접근 제어 가이드입니다. 배포 환경 변수 점검표는 [SECURITY_DEPLOYMENT_ENV.md](../SECURITY_DEPLOYMENT_ENV.md), 역할별 권한 실측값은 [역할별_권한_실측표.md](../역할별_권한_실측표.md)를 함께 봅니다.

## 📋 목차

1. [보안 원칙](#-보안-원칙)
2. [인증 및 권한 관리](#-인증-및-권한-관리)
3. [API 보안 구현](#-api-보안-구현)
4. [데이터 보호](#-데이터-보호)
5. [의존성·인프라 보안](#-의존성인프라-보안)
6. [보안 테스트](#-보안-테스트)

## 🛡️ 보안 원칙

### 핵심 보안 원칙

#### 1. 최소 권한 원칙 (Principle of Least Privilege)

```java
// ✅ 리소스 단위로 판정한다
@PreAuthorize("@projectSecurityService.canAccessProject(#projectId)")
public ResponseEntity<?> getProject(@PathVariable String projectId) { ... }

// ❌ 시스템 역할로 막는다 — 프로젝트 데이터에 필요 이상의 권한을 요구한다
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> getProject(@PathVariable String projectId) { ... }
```

`hasRole('ADMIN')` 은 시스템 관리자 전용 기능(사용자 관리·메일 설정·LLM 설정·스케줄러)에 사용합니다. 프로젝트 소속 데이터는 인가 서비스로 판정합니다.

#### 2. 심층 방어 (Defense in Depth)

```java
@RestController
public class ProjectController {

  // Layer 1: Controller 레벨 인가
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId)")
  public ResponseEntity<?> getProject(@PathVariable String projectId, Authentication auth) {
    // Layer 2: Service 레벨 조회 범위 제한
    return ResponseEntity.ok(projectService.getProject(projectId, auth.getName()));
  }
}

@Service
public class ProjectService {

  public ProjectDto getProject(String projectId, String username) {
    // Layer 3: 쿼리 자체가 사용자 소속으로 필터링
    Project project =
        projectRepository
            .findByIdAndUser(projectId, username)
            .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다"));
    return toDto(project);
  }
}
```

#### 3. 기본적으로 안전 (Secure by Default)

Spring Security 설정이 `/api/**` 를 `authenticated()` 로 막고, 그 위에 `@PreAuthorize` 로 리소스 판정을 겹칩니다. 인증만 통과하면 남의 프로젝트 데이터가 보이므로, **인증과 인가를 갈라 생각합니다.**

`permitAll()` 로 여는 경로는 목록이 `SecurityConfig` 에 명시되어 있습니다. 새 경로를 열 때는 그 경로가 인증 없이 노출되어도 되는 정보만 담는지 확인합니다.

### 보안 체크리스트

#### ✅ API 개발 시 필수 확인사항

- [ ] `@PreAuthorize` 로 인가를 명시했는가 (인증만으로는 남의 데이터가 보인다)
- [ ] 리소스 단위 판정에 인가 서비스를 썼는가 (`hasRole` 만으로 막지 않았는가)
- [ ] 조회 쿼리가 사용자 접근 범위로 필터링되는가
- [ ] 응답 DTO 에 비밀번호·토큰·API 키가 섞이지 않았는가
- [ ] 저장하는 비밀값을 `EncryptionUtil` 로 암호화했는가
- [ ] 로그에 JWT·API 키·커넥션 문자열을 남기지 않았는가
- [ ] 권한 없는 사용자가 403 을 받는지 테스트를 작성했는가
- [ ] 새 도메인 예외에 `GlobalExceptionHandler` 핸들러를 붙였는가 (없으면 500 이 나간다)

## 🔐 인증 및 권한 관리

### 인증 경로가 두 벌이다

`SecurityConfig` 가 필터 둘을 `UsernamePasswordAuthenticationFilter` 앞에 붙입니다.

| 필터 | 자격증명 | 용도 |
| :--- | :--- | :--- |
| `ApiKeyAuthenticationFilter` | `X-API-KEY` 헤더 | 서비스 간 호출 (Jira Forge 앱 등) |
| `JwtAuthenticationFilter` | `Authorization: Bearer <JWT>` | 사용자 요청 |

**API 키는 `X-API-KEY` 헤더로만 받습니다.** 쿼리 파라미터(`?apiKey=`)는 브라우저 이력과 접근 로그에 남으므로 허용하지 않습니다. DB 에는 키 원문이 아니라 SHA-256 해시만 저장하며(`ApiKeyHasher`), 만료 시각을 함께 검사합니다.

### JWT 기반 인증 시스템

#### 토큰 두 종류

| 토큰 | 설정 키 | 기본 만료 |
| :--- | :--- | :--- |
| Access Token | `jwt.access-token-expiration` (`JWT_ACCESS_EXPIRATION`) | 3,600,000ms = 1시간 |
| Refresh Token | `jwt.refresh-token-expiration` (`JWT_REFRESH_EXPIRATION`) | 86,400,000ms = 24시간 |

로그인 응답(`POST /api/auth/login`)의 필드 이름은 **`accessToken`·`refreshToken`** 입니다. 재발급은 `POST /api/auth/refresh` 입니다.

#### 서명은 HS512 이고 시크릿 길이를 시작 시점에 검증한다

`util/JwtTokenUtil` 이 `SignatureAlgorithm.HS512` 로 서명합니다. `@PostConstruct` 가 앱 시작 시점에 `JWT_SECRET` 을 검증하고, 조건에 맞지 않으면 **기동을 실패시킵니다.**

- Base64 문자열이어야 합니다 (`-`·`_` 는 허용되지 않습니다).
- 디코딩 후 **64바이트(512비트) 이상**이어야 합니다.

```bash
openssl rand -base64 64 | tr -d '\n'
```

시작 시점에 실패시키는 이유는 첫 로그인까지 문제가 드러나지 않으면 원인 파악이 어렵기 때문입니다. `application.yml` 의 기본 시크릿은 개발용으로 커밋된 값이므로 **운영에서는 반드시 `JWT_SECRET` 을 주입합니다.**

#### 토큰 타입 검증

`extractTokenType` 으로 access/refresh 를 구분하고, `validateAccessToken`·`validateRefreshToken` 을 각각 호출합니다. 리프레시 토큰으로 API 를 호출하는 경로를 막기 위한 검사이므로, 토큰을 다루는 새 코드에서도 이 구분을 유지합니다.

### 권한 계층 구조

역할 enum 은 소유 엔티티 안에 **중첩 enum** 으로 정의되어 있습니다. 별도 `ProjectRole.java` 파일은 없습니다.

#### 시스템 역할 — `User.role` (문자열)

enum 이 아니라 `@Column(length = 20) String` 입니다. 값은 `ADMIN`·`MANAGER`·`TESTER` 이며 **null 도 허용**됩니다. `hasRole('ADMIN')` 이 읽는 축이 이것입니다.

null 을 정상값으로 다뤄야 합니다. 역할을 지정하지 않은 계정이 존재하며, `role.equals(...)` 로 비교하면 그 계정에서 NPE 가 납니다.

#### 조직 역할 — `OrganizationUser.OrganizationRole`

```java
public enum OrganizationRole {
  OWNER("소유자"),
  ADMIN("관리자"),
  MEMBER("멤버");
  // description 만 갖는다
}
```

#### 프로젝트 역할 — `ProjectUser.ProjectRole`

```java
public enum ProjectRole {
  PROJECT_MANAGER("프로젝트 매니저"),
  LEAD_DEVELOPER("리드 개발자"),
  DEVELOPER("개발자"),
  TESTER("테스터"),
  CONTRIBUTOR("기여자"),
  VIEWER("뷰어");
}
```

#### 그룹 역할 — `GroupMember.GroupRole`

```java
public enum GroupRole {
  LEADER("그룹 리더"),
  CO_LEADER("부 리더"),
  MEMBER("멤버");
}
```

#### ⚠️ 세 enum 은 description 필드 하나만 갖는다

세 enum 모두 `description` 하나만 갖습니다. **`priority` 필드도, `isHigherThan()`·`canManageProject()`·`canWriteTestCases()` 같은 판정 메서드도 없습니다.**

그래서 "이 역할이 저 역할보다 높은가"를 enum 에 물을 수 없습니다. 판정은 인가 서비스가 역할 목록을 열거하는 방식으로 합니다.

```java
// 실제 방식 — 허용 역할을 열거한다
projectUserRepository.existsByProjectIdAndUserUsernameAndRoleIn(
    projectId, username, List.of(ProjectRole.PROJECT_MANAGER, ProjectRole.LEAD_DEVELOPER));
```

역할을 추가하면 이 열거 목록을 전부 찾아 고쳐야 합니다. 한 곳을 빼먹으면 그 역할이 조용히 권한을 잃거나 얻습니다. 실제 권한 경계는 [역할별_권한_실측표.md](../역할별_권한_실측표.md)에 응답 코드로 기록되어 있으니, 고친 뒤 그 표와 대조합니다.

## 🔒 API 보안 구현

### 인가 서비스 패턴

인가 판정은 `security/` 패키지의 세 서비스가 담당합니다. 전부 **UUID 문자열**을 받습니다.

| 빈 이름 | 파일 | 담당 |
| :--- | :--- | :--- |
| `@projectSecurityService` | `ProjectSecurityService` | 프로젝트·케이스·플랜·실행·결과·첨부·탐색 세션·JUnit·RAG 리소스 |
| `@organizationSecurityService` | `OrganizationSecurityService` | 조직 멤버십·관리·소유자·삭제 |
| `@groupSecurityService` | `GroupSecurityService` | 그룹 접근·리더 판정 |

#### 인자 하나짜리 오버로드가 관용구다

거의 모든 판정 메서드가 두 형태로 있습니다.

```java
public boolean canAccessProject(String projectId, String username) { ... }
public boolean canAccessProject(String projectId) { ... }  // SecurityContext 에서 현재 사용자를 읽는다
```

`@PreAuthorize` 에서는 짧은 쪽을 사용합니다.

```java
@PreAuthorize("@projectSecurityService.canAccessProject(#projectId)")
```

두 인자 형태(`authentication.name` 을 넘기는 것)도 기존 코드에 남아 있고 유효합니다. 서비스 내부에서 다른 사용자에 대해 판정할 때는 두 인자 형태를 사용합니다.

#### 주요 판정 메서드

`ProjectSecurityService` 는 판정이 세분화되어 있습니다. 새 엔드포인트를 만들 때 맞는 것이 이미 있는지 먼저 확인합니다.

| 축 | 메서드 |
| :--- | :--- |
| 멤버십·접근 | `isProjectMember`, `canAccessProject` |
| 관리 | `hasManagementRole`, `canManageProject`, `canManageMembers`, `canUpdateProjectSettings` |
| 편집 | `hasEditRole`, `canEditProject`, `canEditTestCase`, `canRecordTestResult` |
| 멤버 변경 | `canInviteMembers`, `canRemoveMember` |
| 업로드 | `canUploadToProject`, `canUploadTestCase`, `canUploadToTestSession` |
| 리소스 단위 | `canAccessTestCaseAttachment`, `canAccessJunitResult`, `canAccessRagChatThread` 등 |
| 시스템 | `isSystemAdmin` |

리소스 단위 메서드는 **첨부·결과 ID 하나만 받아 소속 프로젝트를 역추적**합니다. 경로에 프로젝트 ID 가 없는 엔드포인트(`/junit-results/{id}` 같은 짧은 주소)에서 이 형태가 필요합니다.

### Controller 보안 구현

```java
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

  private final ProjectService projectService;

  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Page<ProjectDto>> getUserProjects(
      @PageableDefault(size = 20) Pageable pageable, Authentication authentication) {
    return ResponseEntity.ok(projectService.findByUser(authentication.getName(), pageable));
  }

  @GetMapping("/{projectId}")
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId)")
  public ResponseEntity<ProjectDto> getProject(@PathVariable String projectId) {
    return ResponseEntity.ok(projectService.findById(projectId));
  }

  @PostMapping("/{projectId}/testcases")
  @PreAuthorize("@projectSecurityService.hasEditRole(#projectId)")
  public ResponseEntity<TestCaseDto> createTestCase(
      @PathVariable String projectId,
      @Valid @RequestBody CreateTestCaseRequest request,
      Authentication authentication) {
    TestCaseDto created =
        testCaseService.create(projectId, request, authentication.getName());
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @PutMapping("/{projectId}")
  @PreAuthorize("@projectSecurityService.canUpdateProjectSettings(#projectId)")
  public ResponseEntity<ProjectDto> updateProject(
      @PathVariable String projectId, @Valid @RequestBody UpdateProjectRequest request) {
    return ResponseEntity.ok(projectService.update(projectId, request));
  }
}
```

`@EnableMethodSecurity(prePostEnabled = true)` 가 `SecurityConfig` 에 켜져 있어 `@PreAuthorize` 가 동작합니다.

### 예외 처리 및 보안 응답

#### 전담 핸들러는 하나다

`exception/GlobalExceptionHandler` 가 정본입니다. `SecurityExceptionHandler` 같은 별도 `@RestControllerAdvice` 는 두지 않습니다. 두 개가 같은 예외를 잡으면 어느 쪽이 이기는지 순서에 의존하게 됩니다.

인증·인가 실패는 세 곳이 나눠 처리합니다.

| 상황 | 처리 주체 | 응답 |
| :--- | :--- | :--- |
| 인증 없이 보호 경로 접근 | `CustomAuthenticationEntryPoint` | 401 |
| 인증은 됐으나 권한 부족 (필터 단계) | `CustomAccessDeniedHandler` | 403 |
| `@PreAuthorize` 거부 | `GlobalExceptionHandler` (`AccessDeniedException`) | 403 |

응답 본문은 전부 `dto/ErrorResponse` 형태(`errorCode`·`message`·`timestamp`·`details`)입니다.

#### 메시지에 내부 정보를 담지 않는다

```java
@ExceptionHandler(AccessDeniedException.class)
public ResponseEntity<ErrorResponse> handleAccessDenied(
    AccessDeniedException ex, WebRequest request) {

  authorizationErrorCounter.increment();
  // 상세는 로그에만
  logger.warn("접근 거부: {} - {}", request.getDescription(false), ex.getMessage());

  ErrorResponse response =
      new ErrorResponse(
          "ACCESS_DENIED", "접근 권한이 없습니다.", LocalDateTime.now(), Map.of());
  return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
}
```

`GlobalExceptionHandler` 는 Micrometer 카운터(`api.errors.authentication`·`api.errors.authorization`·`api.errors.general`)를 함께 증가시킵니다. 새 인증·인가 핸들러를 추가할 때 카운터도 함께 올려 두면 Prometheus 에서 추이를 볼 수 있습니다.

#### 스택트레이스를 응답에 넣지 않는다

일반 `Exception` 핸들러가 `Environment` 로 프로파일을 확인해 상세 노출 여부를 갈라 둡니다. 운영에서 원인을 보려면 응답이 아니라 서버 로그를 봅니다.

## 🔐 데이터 보호

### 비밀번호

`SecurityConfig` 가 `BCryptPasswordEncoder` 를 **기본 강도(10)** 로 등록합니다.

```java
@Bean
public PasswordEncoder passwordEncoder() {
  return new BCryptPasswordEncoder();
}
```

강도를 올리면 기존 해시는 그대로 검증되지만(BCrypt 해시에 강도가 담깁니다) 로그인 지연이 늘어납니다. 바꾸려면 로그인 응답 시간을 측정한 뒤 결정합니다.

엔티티의 비밀번호 필드는 응답에 나가지 않게 막습니다.

```java
@Column(nullable = false)
@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
private String password;
```

DTO 로 변환해 반환하는 것이 정본이고, 위 어노테이션은 실수로 엔티티가 직렬화되는 경우에 한 번 더 막아 줍니다.

### 저장하는 비밀값은 AES-256 으로 암호화한다

`security/EncryptionUtil` 이 `AES/CBC/PKCS5Padding`(256비트, 항목마다 새 IV)으로 암호화합니다. 대상은 사용자가 화면에서 입력해 DB 에 저장하는 외부 자격증명입니다.

| 대상 | 담당 서비스 |
| :--- | :--- |
| Jira API 토큰 | `JiraConfigService` |
| LLM API 키 | `LlmConfigServiceImpl` |
| 메일 발송 비밀번호 | `MailSettingsService` |
| Google 서비스 계정 JSON | `GoogleConfigService` |

#### 키 주입 규칙

| 설정 | 값 |
| :--- | :--- |
| 설정 키 | `jira.security.encryption.key` |
| 환경 변수 | `JIRA_ENCRYPTION_KEY` |
| 형식 | AES-256 키의 Base64 (32바이트) |
| 개발·테스트 기본값 | `application.yml` 에 커밋된 값이 있습니다 |
| 운영(`prod`) 기본값 | **없습니다.** 미주입 시 암호화가 거부됩니다 (fail-closed) |

```bash
openssl rand -base64 32
```

이름이 `JIRA_` 로 시작하지만 **Jira 전용이 아닙니다.** 위 표의 넷을 모두 이 키로 암호화하므로, 키를 잃으면 저장된 API 키·토큰·비밀번호를 전부 다시 입력해야 합니다.

`EncryptionUtil` 은 커밋된 기본 키가 운영에서 쓰이는 것을 감지해 거부합니다. 값을 바꾸지 않고 배포하면 저장 기능이 예외로 막히는데, 이것이 의도한 동작입니다. 조용히 취약한 키로 도는 것보다 낫습니다.

`health/JiraEncryptionHealthIndicator` 가 Actuator health 에 키 설정 상태를 노출합니다. 배포 후 `/actuator/health` 로 확인합니다.

### JSON 직렬화

```java
public class UserDto {
  private String id;
  private String username;
  private String email;

  @JsonIgnore
  private String password;

  @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
  private String temporaryPassword;

  @JsonInclude(JsonInclude.Include.NON_NULL)
  private String optionalField;
}
```

`SecurityContextHolder` 를 읽는 getter 로 필드를 조건부 노출하는 방식은 사용하지 않습니다. 직렬화 시점에 컨텍스트가 있다고 보장할 수 없고(비동기·스케줄러 경로), 같은 DTO 가 호출자에 따라 다른 모양이 되면 스키마 검증이 무의미해집니다. 노출 범위가 다르면 **DTO 를 갈라 만듭니다.**

### 데이터 검증 및 필터링

#### 입력 검증

```java
public class CreateProjectRequest {

  @NotBlank(message = "프로젝트명은 필수입니다")
  @Size(min = 2, max = 100)
  private String name;

  @Size(max = 1000)
  private String description;

  @Valid
  private List<@Valid TeamMemberRequest> members;
}
```

정규식으로 특수문자를 통째로 막는 방식은 신중하게 적용합니다. 테스트케이스 이름·설명에는 코드 조각과 기호가 정상적으로 들어가므로, `<`·`>`·`&` 를 금지하면 실제 사용을 막습니다. XSS 는 입력 차단이 아니라 **출력 이스케이프**로 막는 것이 원칙이며, React 가 기본으로 이스케이프합니다. Markdown 렌더 구간만 별도로 확인합니다.

#### 출력 필터링

목록 조회는 사용자 접근 범위를 **쿼리에서** 걸러냅니다. 전체를 읽어 와 애플리케이션에서 지우는 방식은 두 가지가 나쁩니다. 페이징 개수가 어긋나고, 필터를 빼먹은 경로에서 그대로 새어 나갑니다.

```java
@Transactional(readOnly = true)
public Page<ProjectDto> findByUser(String username, Pageable pageable) {
  // 리포지토리 쿼리가 소속 조건을 담는다 (JOIN project_users / organization_users)
  return projectRepository.findByUser(username, pageable).map(this::toDto);
}
```

권한에 따라 일부 필드를 가려야 하면 위에 적은 대로 DTO 를 갈라 만듭니다.

### SQL 인젝션 방지

```java
@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {

  // ✅ 파라미터 바인딩
  @Query("SELECT p FROM Project p WHERE p.name = :name AND p.organization.id = :orgId")
  List<Project> findByNameAndOrganization(
      @Param("name") String name, @Param("orgId") String orgId);

  // ✅ 메서드 명명 규칙
  List<Project> findByNameContainingIgnoreCaseAndOrganizationId(String name, String orgId);

  // ❌ 문자열 연결 — 쓰지 않는다
}
```

동적 조건은 Criteria API 나 Specification 으로 만들고, 값은 항상 바인딩합니다. **정렬 컬럼명처럼 바인딩할 수 없는 부분은 허용 목록으로 검증합니다.** `ORDER BY` 에 사용자 입력을 그대로 붙이는 것이 이 계열에서 가장 흔한 구멍입니다.

## 🧱 의존성·인프라 보안

### 의존성 버전 핀은 CVE 대응이다

`build.gradle` 의 `ext` 블록과 `dependencyManagement` 는 취약 버전을 피하기 위해 명시적으로 올려 둔 것입니다. 각 줄에 CVE 번호가 주석으로 붙어 있습니다.

| 대상 | 사유 요지 |
| :--- | :--- |
| `spring-boot` 3.5.15 | 3.4 라인 전체 취약 |
| `spring-security` 6.5.11 | X.509 CN 파싱 오류로 사용자 사칭 |
| `tomcat-embed` 10.1.55 | CRITICAL 3건 외 HIGH 3건 |
| `netty-bom` 4.1.136.Final | codec-http·http2·dns·compression 다수 |
| `jackson-bom` 2.21.5 | PolymorphicTypeValidator 우회 RCE 계열 |
| `logback` 1.5.34 | 역직렬화 허용목록 우회 |
| `postgresql` 42.7.13 | SCRAM-SHA-256-PLUS 가 평문으로 다운그레이드(MITM) |
| `bouncycastle` jdk18on 1.84 | 은닉 타이밍 채널. jdk15on 계열은 `exclude` 로 차단 |

**이 핀을 지우거나 내리지 않습니다.** 지우면 Boot BOM 의 취약 버전으로 되돌아갑니다. 올릴 때는 CVE 번호와 수정 버전을 주석에 함께 적습니다.

### 도커 포트는 루프백에만 바인딩한다

`docker-compose.yml` 이 PostgreSQL·MinIO·RAG 서비스를 `127.0.0.1` 에만 노출합니다.

```yaml
ports:
  - "${INTERNAL_BIND_ADDR:-127.0.0.1}:5434:5432"   # PostgreSQL
  - "${INTERNAL_BIND_ADDR:-127.0.0.1}:9000:9000"   # MinIO API
  - "${INTERNAL_BIND_ADDR:-127.0.0.1}:9001:9001"   # MinIO Console
  - "${INTERNAL_BIND_ADDR:-127.0.0.1}:8001:8000"   # RAG Service
```

앱과 RAG 는 같은 도커 네트워크로 붙으므로 외부 노출이 필요하지 않습니다. **`0.0.0.0` 으로 바꾸면 호스트 방화벽을 우회합니다.** 도커가 iptables 를 직접 조작하기 때문에 방화벽 규칙으로는 막히지 않습니다. RAG 서비스는 인증이 없고 `/docs`·`/redoc` 이 열려 있으므로 특히 그렇습니다. 원격 접속은 SSH 터널을 사용합니다.

### Actuator 노출 범위

`/actuator/health` 계열만 `permitAll()` 이고, 나머지 `/actuator/**` 는 인증이 필요합니다. 스케줄 목록·환경 정보가 비인증으로 새는 것을 막기 위한 설정이므로 되돌리지 않습니다.

`/api/admin/scheduler/**` 는 **GET 만** `permitAll()` 이고 변경(POST·PUT)은 `/api/admin/**` 규칙으로 `hasRole('ADMIN')` 이 강제됩니다.

### 레이트 리밋

Resilience4j 로 제한하고 `filter/RateLimiterFilter` 가 적용합니다. 초과하면 **429** 가 나갑니다. 현재 인스턴스는 `pageRefreshLimiter`(60초당 10회, 대기 없이 즉시 거부)입니다.

비용이 큰 엔드포인트를 새로 만들면 리미터 인스턴스 추가를 검토합니다. 인증 시도·비밀번호 재설정처럼 무제한 반복이 위험한 경로도 대상입니다.

### 운영 배포 전 확인

환경 변수 점검표는 [SECURITY_DEPLOYMENT_ENV.md](../SECURITY_DEPLOYMENT_ENV.md)에 있습니다. 최소한 다음 넷은 기본값을 사용하지 않습니다.

- `JWT_SECRET` (Base64, 디코딩 후 64바이트 이상)
- `JIRA_ENCRYPTION_KEY` (Base64 32바이트)
- `MINIO_SECRET_KEY`
- `POSTGRES_PASSWORD` 계열

`config/DefaultConfigurationWarning` 이 기본값 사용을 감지해 기동 로그에 경고를 남기므로, 배포 직후 로그를 확인합니다. 시스템 기본 `admin / admin123` 계정의 비밀번호도 배포 직후 변경합니다.

## 🧪 보안 테스트

테스트 도구와 실행 방법은 [테스트 아키텍처 가이드](./TEST_ARCHITECTURE_GUIDE.md), [API 테스트 가이드 요약](./API_TESTING_GUIDE_SUMMARY.md)을 따릅니다. 여기서는 보안 테스트가 무엇을 보장해야 하는지를 정리합니다.

### 권한 경계 테스트

각 엔드포인트마다 **네 가지 주체**로 확인합니다. 하나라도 빠지면 그 경계가 열려 있는지 알 수 없습니다.

| 주체 | 기대 |
| :--- | :--- |
| 토큰 없음 | 401 |
| 다른 프로젝트 사용자 (비멤버) | 403 |
| 권한이 낮은 멤버 (예: VIEWER 가 편집 시도) | 403 |
| 권한이 있는 멤버 | 2xx |

```java
@Test
public void 비멤버는_프로젝트를_조회할_수_없다() {
  given()
      .header("Authorization", "Bearer " + nonMemberToken)
  .when()
      .get("/api/projects/{projectId}", projectId)
  .then()
      .statusCode(403);
}

@Test
public void 토큰이_없으면_401이다() {
  when().get("/api/projects/{projectId}", projectId).then().statusCode(401);
}
```

`OrganizationSecurityTest` 와 `AllApiComprehensiveTest`(역할별 토큰 발급 포함)가 이 패턴의 참고 사례입니다.

#### 401 과 403 을 갈라 검증한다

`assertTrue(status.is4xxClientError())` 로 뭉뚱그리면 인가 실패와 인증 실패를 구분하지 못합니다. 권한 판정이 아예 걸리지 않아 401 이 나는 것과, 판정을 거쳐 403 이 나는 것은 다른 상태입니다.

같은 이유로 **400 도 403 과 갈라 봅니다.** 인가를 통과한 뒤 본문 검증에서 걸린 400 은 권한이 있다는 뜻입니다([역할별_권한_실측표.md](../역할별_권한_실측표.md)가 이 구분을 `*` 표시로 기록해 두었습니다).

### 데이터 격리 테스트

목록 조회 결과에 남의 데이터가 섞이지 않았는지 확인합니다. 페이징이 걸린 응답은 **총 건수까지** 확인합니다. 애플리케이션에서 걸러내는 구현이면 `content` 는 비어 보이는데 `totalElements` 가 남의 것까지 세고 있습니다.

```java
@Test
public void 목록에는_접근_가능한_프로젝트만_담긴다() {
  Response response =
      given().header("Authorization", "Bearer " + userToken).get("/api/projects");

  response.then().statusCode(200);
  List<String> ids = response.jsonPath().getList("content.id");
  assertEquals(response.jsonPath().getInt("totalElements"), ids.size());
  assertFalse(ids.contains(otherProjectId));
}
```

### 비밀값 노출 테스트

응답 본문에 비밀값이 섞이지 않는지 문자열로 확인합니다. DTO 를 새로 만들 때 필드를 실수로 넣는 것을 이 층이 잡습니다.

```java
@Test
public void 설정_조회_응답에는_원문_토큰이_담기지_않는다() {
  String body =
      given()
          .header("Authorization", "Bearer " + adminToken)
          .get(configEndpoint)          // Jira·LLM·메일·Google 설정 조회 엔드포인트
          .then()
          .statusCode(200)
          .extract()
          .asString();

  assertFalse(body.contains(rawApiToken));
}
```

암호화 저장 대상 넷(Jira 토큰·LLM API 키·메일 비밀번호·Google 서비스 계정 JSON)의 설정 조회 엔드포인트마다 같은 검사를 둡니다.

암호화 저장을 검증할 때는 **암호문이 원문과 다른지**만 보지 않고 복호화 결과가 원문과 같은지도 확인합니다. 암호화만 되고 복호화가 깨진 상태는 저장 직후에는 드러나지 않습니다.

### JWT 검증 테스트

`JwtTokenUtil` 의 방어가 살아 있는지 확인합니다.

- 만료된 토큰 → 401
- 서명이 다른 토큰(다른 시크릿으로 만든 것) → 401
- 리프레시 토큰으로 API 호출 → 거부
- Base64 가 아닌 시크릿, 64바이트 미만 시크릿 → **기동 실패**

마지막 항목은 런타임 테스트가 아니라 컨텍스트 로딩 실패를 기대하는 테스트로 작성합니다.

### SQL 인젝션·XSS

정규식 차단을 검증하는 방향으로 사용하지 않습니다. 이 프로젝트는 파라미터 바인딩과 출력 이스케이프로 막으므로, 확인할 것은 **주입 문자열이 그대로 저장되고 그대로 반환되며 DB 가 정상 동작하는가**입니다.

```java
@Test
public void 주입_문자열은_값으로_저장된다() {
  String payload = "'; DROP TABLE projects; --";
  String created = createProject(payload, adminToken);   // 201

  assertEquals(getProjectName(created), payload);        // 값으로 보존
  given().header("Authorization", "Bearer " + adminToken)
      .get("/api/projects").then().statusCode(200);      // 테이블 정상
}
```

`assertFalse(description.contains("<script>"))` 처럼 저장값이 변형되기를 기대하는 검증은 이 구현과 어긋납니다. 저장값은 원문이고, 안전은 렌더 시점에 확보됩니다. Markdown 렌더 구간은 프런트 테스트로 확인합니다.

### 레이트 리밋 테스트

제한을 넘겼을 때 **429** 가 나오고, 창이 지나면 다시 통과하는지 확인합니다. 성능 측정이 아니라 제한 동작 검증입니다.

```java
@Test
public void 제한을_넘기면_429다() {
  for (int i = 0; i < 10; i++) {
    callLimitedEndpoint(adminToken).then().statusCode(200);
  }
  callLimitedEndpoint(adminToken).then().statusCode(429);
}
```

이 테스트는 리미터 상태를 남기므로 다른 테스트와 같은 창에서 돌면 서로 간섭합니다. 별도 클래스로 격리합니다.

---

## 📚 관련 문서

- [개발 가이드](./DEVELOPMENT_GUIDE.md) - 개발 환경 및 워크플로우
- [API 개발 가이드](./API_GUIDE.md) - REST API 설계 표준
- [Java 코딩 가이드라인](./JAVA_CODING_GUIDELINES.md) - 예외·JPA·의존성 규약
- [테스트 아키텍처 가이드](./TEST_ARCHITECTURE_GUIDE.md) - 레이어별 테스트 표준
- [배포 환경 변수 점검표](../SECURITY_DEPLOYMENT_ENV.md) - 운영 배포 전 확인 목록
- [역할별 권한 실측표](../역할별_권한_실측표.md) - 역할 여섯 종의 실제 응답 코드
