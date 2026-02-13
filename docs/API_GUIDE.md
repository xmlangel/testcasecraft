# API Development Guide (최종 업데이트: 2025-08-04)

API 개발 가이드라인 및 테스트 규칙입니다.

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
GET    /api/organizations/{id}/members     # 조직 멤버 목록
POST   /api/organizations/{id}/members     # 멤버 추가
DELETE /api/organizations/{id}/members/{memberId}  # 멤버 제거
```

#### HTTP 상태 코드 사용
```java
// 성공 응답
200 OK          // 조회, 수정 성공
201 Created     // 생성 성공
204 No Content  // 삭제 성공

// 클라이언트 오류
400 Bad Request     // 잘못된 요청
401 Unauthorized    // 인증 실패
403 Forbidden       // 권한 부족
404 Not Found       // 리소스 없음
409 Conflict        // 중복 데이터

// 서버 오류
500 Internal Server Error  // 서버 내부 오류
```

#### JSON 응답 형식 통일
```json
// 성공 응답
{
  "id": 1,
  "name": "테스트 조직",
  "description": "조직 설명",
  "createdAt": "2025-08-04T10:00:00Z",
  "updatedAt": "2025-08-04T10:00:00Z"
}

// 목록 응답
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 10,
  "currentPage": 0,
  "size": 10
}

// 오류 응답
{
  "error": "RESOURCE_NOT_FOUND",
  "message": "요청한 조직을 찾을 수 없습니다.",
  "timestamp": "2025-08-04T10:00:00Z",
  "path": "/api/organizations/999"
}
```

## 🔄 API 개발 워크플로우

### 1. API 설계 및 계획

#### API 스펙 정의
```java
/**
 * 조직 관리 API
 * 
 * @description 조직 CRUD 및 멤버 관리 기능 제공
 * @version 1.0
 * @author 개발자명
 */
@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {
    // API 구현
}
```

#### DTO 설계
```java
// 요청 DTO
public class CreateOrganizationRequest {
    @NotBlank(message = "조직명은 필수입니다")
    @Size(max = 100, message = "조직명은 100자를 초과할 수 없습니다")
    private String name;
    
    @Size(max = 500, message = "설명은 500자를 초과할 수 없습니다")
    private String description;
    
    // getters, setters
}

// 응답 DTO
public class OrganizationResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // getters, setters, builder
}
```

### 2. Controller 구현

#### 기본 Controller 패턴
```java
@RestController
@RequestMapping("/api/organizations")
@Validated
public class OrganizationController {
    
    private final OrganizationService organizationService;
    
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<OrganizationResponse>> getOrganizations(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication) {
        
        String currentUser = authentication.getName();
        Page<OrganizationResponse> organizations = organizationService.findByUser(currentUser, pageable);
        return ResponseEntity.ok(organizations);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("@organizationSecurityService.canAccessOrganization(#id, authentication.name)")
    public ResponseEntity<OrganizationResponse> getOrganization(
            @PathVariable Long id,
            Authentication authentication) {
        
        OrganizationResponse organization = organizationService.findById(id);
        return ResponseEntity.ok(organization);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrganizationResponse> createOrganization(
            @Valid @RequestBody CreateOrganizationRequest request,
            Authentication authentication) {
        
        String currentUser = authentication.getName();
        OrganizationResponse created = organizationService.create(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("@organizationSecurityService.canManageOrganization(#id, authentication.name)")
    public ResponseEntity<OrganizationResponse> updateOrganization(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrganizationRequest request,
            Authentication authentication) {
        
        OrganizationResponse updated = organizationService.update(id, request);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("@organizationSecurityService.canManageOrganization(#id, authentication.name)")
    public ResponseEntity<Void> deleteOrganization(
            @PathVariable Long id,
            Authentication authentication) {
        
        organizationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
```

#### 예외 처리
```java
@RestControllerAdvice
public class ApiExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException e) {
        ErrorResponse error = ErrorResponse.builder()
            .error("RESOURCE_NOT_FOUND")
            .message(e.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e) {
        ErrorResponse error = ErrorResponse.builder()
            .error("ACCESS_DENIED")
            .message("접근 권한이 없습니다.")
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationError(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));
            
        ErrorResponse error = ErrorResponse.builder()
            .error("VALIDATION_FAILED")
            .message(message)
            .timestamp(LocalDateTime.now())
            .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
```

### 3. Service 구현

#### Service 패턴
```java
@Service
@Transactional
public class OrganizationService {
    
    private final OrganizationRepository organizationRepository;
    private final OrganizationUserRepository organizationUserRepository;
    private final AuditService auditService;
    
    @Transactional(readOnly = true)
    public Page<OrganizationResponse> findByUser(String username, Pageable pageable) {
        Page<Organization> organizations = organizationRepository.findByUser(username, pageable);
        return organizations.map(this::toResponse);
    }
    
    @Transactional(readOnly = true)
    public OrganizationResponse findById(Long id) {
        Organization organization = organizationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("조직을 찾을 수 없습니다: " + id));
        return toResponse(organization);
    }
    
    public OrganizationResponse create(CreateOrganizationRequest request, String currentUser) {
        // 중복 검증
        if (organizationRepository.existsByName(request.getName())) {
            throw new ResourceNotValidException("이미 존재하는 조직명입니다: " + request.getName());
        }
        
        // 조직 생성
        Organization organization = Organization.builder()
            .name(request.getName())
            .description(request.getDescription())
            .createdBy(currentUser)
            .build();
        
        Organization saved = organizationRepository.save(organization);
        
        // 생성자를 OWNER로 추가
        OrganizationUser ownerRelation = OrganizationUser.builder()
            .organization(saved)
            .user(userRepository.findByUsername(currentUser).orElseThrow())
            .role(OrganizationRole.OWNER)
            .build();
        organizationUserRepository.save(ownerRelation);
        
        // 감사 로그 기록
        auditService.logAction(AuditAction.CREATE, AuditEntityType.ORGANIZATION, saved.getId(), currentUser);
        
        return toResponse(saved);
    }
    
    public OrganizationResponse update(Long id, UpdateOrganizationRequest request) {
        Organization organization = organizationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("조직을 찾을 수 없습니다: " + id));
        
        // 중복 검증 (자기 자신 제외)
        if (!organization.getName().equals(request.getName()) && 
            organizationRepository.existsByName(request.getName())) {
            throw new ResourceNotValidException("이미 존재하는 조직명입니다: " + request.getName());
        }
        
        organization.update(request.getName(), request.getDescription());
        Organization updated = organizationRepository.save(organization);
        
        return toResponse(updated);
    }
    
    public void delete(Long id) {
        Organization organization = organizationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("조직을 찾을 수 없습니다: " + id));
        
        // 연관된 프로젝트가 있는지 확인
        if (projectRepository.countByOrganizationId(id) > 0) {
            throw new ResourceNotValidException("프로젝트가 있는 조직은 삭제할 수 없습니다.");
        }
        
        organizationRepository.delete(organization);
    }
    
    private OrganizationResponse toResponse(Organization organization) {
        return OrganizationResponse.builder()
            .id(organization.getId())
            .name(organization.getName())
            .description(organization.getDescription())
            .createdAt(organization.getCreatedAt())
            .updatedAt(organization.getUpdatedAt())
            .build();
    }
}
```

### 4. Repository 구현

#### JPA Repository 패턴
```java
@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    
    @Query("SELECT DISTINCT o FROM Organization o " +
           "JOIN o.organizationUsers ou " +
           "WHERE ou.user.username = :username")
    Page<Organization> findByUser(@Param("username") String username, Pageable pageable);
    
    @Query("SELECT COUNT(o) FROM Organization o " +
           "JOIN o.organizationUsers ou " +
           "WHERE ou.user.username = :username")
    long countByUser(@Param("username") String username);
    
    boolean existsByName(String name);
    
    @Query("SELECT o FROM Organization o " +
           "JOIN FETCH o.organizationUsers ou " +
           "JOIN FETCH ou.user " +
           "WHERE o.id = :id")
    Optional<Organization> findByIdWithUsers(@Param("id") Long id);
}
```

## 🧪 테스트 전략

### 1. 단위 테스트 (TestNG)

#### Controller 테스트
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(locations = "classpath:application-test.properties")
public class OrganizationControllerTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    
    private String adminToken;
    
    @BeforeMethod
    public void setUp() {
        adminToken = jwtTokenUtil.generateToken("admin");
    }
    
    @Test
    public void testCreateOrganization() {
        // Given
        CreateOrganizationRequest request = CreateOrganizationRequest.builder()
            .name("테스트 조직")
            .description("테스트용 조직입니다")
            .build();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);
        HttpEntity<CreateOrganizationRequest> entity = new HttpEntity<>(request, headers);
        
        // When
        ResponseEntity<OrganizationResponse> response = restTemplate.postForEntity(
            "/api/organizations", entity, OrganizationResponse.class);
        
        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("테스트 조직", response.getBody().getName());
    }
    
    @Test
    public void testGetOrganizationUnauthorized() {
        // When
        ResponseEntity<String> response = restTemplate.getForEntity(
            "/api/organizations/1", String.class);
        
        // Then
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
```

#### Service 테스트
```java
@SpringBootTest
@Transactional
public class OrganizationServiceTest {
    
    @Autowired
    private OrganizationService organizationService;
    
    @Autowired
    private OrganizationRepository organizationRepository;
    
    @Test
    public void testCreateOrganization() {
        // Given
        CreateOrganizationRequest request = CreateOrganizationRequest.builder()
            .name("테스트 조직")
            .description("테스트 설명")
            .build();
        
        // When
        OrganizationResponse result = organizationService.create(request, "admin");
        
        // Then
        assertNotNull(result.getId());
        assertEquals("테스트 조직", result.getName());
        assertEquals("테스트 설명", result.getDescription());
        
        // 데이터베이스 검증
        Optional<Organization> saved = organizationRepository.findById(result.getId());
        assertTrue(saved.isPresent());
    }
    
    @Test(expectedExceptions = ResourceNotFoundException.class)
    public void testFindByIdNotFound() {
        // When & Then
        organizationService.findById(999L);
    }
}
```

### 2. API 스키마 검증 테스트

#### JSON 스키마 정의
```json
// src/test/resources/schemas/organization-get.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "createdAt", "updatedAt"],
  "properties": {
    "id": { "type": "integer", "minimum": 1 },
    "name": { "type": "string", "minLength": 1, "maxLength": 100 },
    "description": { "type": ["string", "null"], "maxLength": 500 },
    "createdAt": { "type": "string", "format": "date-time" },
    "updatedAt": { "type": "string", "format": "date-time" }
  },
  "additionalProperties": false
}
```

#### 스키마 검증 테스트
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class OrganizationJsonSchemaTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    private JsonSchemaValidator validator;
    
    @BeforeMethod
    public void setUp() {
        validator = new JsonSchemaValidator();
    }
    
    @Test
    public void testGetOrganizationSchema() throws Exception {
        // Given - 테스트 데이터 준비
        String token = getAdminToken();
        Long organizationId = createTestOrganization();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        // When
        ResponseEntity<String> response = restTemplate.exchange(
            "/api/organizations/" + organizationId,
            HttpMethod.GET,
            entity,
            String.class
        );
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        
        // JSON 스키마 검증
        String schemaPath = "schemas/organization-get.json";
        validator.validate(schemaPath, response.getBody());
    }
}
```

### 3. 통합 테스트

#### 전체 플로우 테스트
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(OrderAnnotation.class)
public class OrganizationIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    private static String adminToken;
    private static Long createdOrganizationId;
    
    @Test
    @Order(1)
    public void testFullWorkflow() {
        // 1. 토큰 발급
        adminToken = loginAndGetToken("admin", "admin");
        
        // 2. 조직 생성
        createdOrganizationId = createOrganization("통합테스트 조직");
        
        // 3. 조직 조회
        OrganizationResponse organization = getOrganization(createdOrganizationId);
        assertEquals("통합테스트 조직", organization.getName());
        
        // 4. 조직 수정
        updateOrganization(createdOrganizationId, "수정된 조직명");
        
        // 5. 수정 확인
        OrganizationResponse updated = getOrganization(createdOrganizationId);
        assertEquals("수정된 조직명", updated.getName());
        
        // 6. 조직 삭제
        deleteOrganization(createdOrganizationId);
        
        // 7. 삭제 확인
        assertThrows(HttpClientErrorException.NotFound.class, () -> {
            getOrganization(createdOrganizationId);
        });
    }
}
```

## 🔒 보안 규칙

### 1. 인증 및 권한 검증

#### 필수 보안 어노테이션
```java
// 기본 인증 확인
@PreAuthorize("hasRole('USER')")

// 리소스 접근 권한 확인
@PreAuthorize("@organizationSecurityService.canAccessOrganization(#id, authentication.name)")

// 관리 권한 확인
@PreAuthorize("@organizationSecurityService.canManageOrganization(#id, authentication.name)")

// 시스템 관리자 권한
@PreAuthorize("hasRole('ADMIN')")
```

#### Security Service 구현
```java
@Service
public class OrganizationSecurityService {
    
    private final OrganizationUserRepository organizationUserRepository;
    
    public boolean canAccessOrganization(Long organizationId, String username) {
        return organizationUserRepository.existsByOrganizationIdAndUserUsername(organizationId, username);
    }
    
    public boolean canManageOrganization(Long organizationId, String username) {
        return organizationUserRepository.existsByOrganizationIdAndUserUsernameAndRoleIn(
            organizationId, username, Arrays.asList(OrganizationRole.OWNER, OrganizationRole.ADMIN)
        );
    }
    
    public boolean isOrganizationOwner(Long organizationId, String username) {
        return organizationUserRepository.existsByOrganizationIdAndUserUsernameAndRole(
            organizationId, username, OrganizationRole.OWNER
        );
    }
}
```

### 2. 데이터 검증

#### 입력 검증
```java
public class CreateOrganizationRequest {
    
    @NotBlank(message = "조직명은 필수입니다")
    @Size(min = 2, max = 100, message = "조직명은 2-100자 사이여야 합니다")
    @Pattern(regexp = "^[가-힣a-zA-Z0-9\\s\\-_]+$", message = "조직명에 특수문자는 사용할 수 없습니다")
    private String name;
    
    @Size(max = 500, message = "설명은 500자를 초과할 수 없습니다")
    private String description;
    
    // getters, setters
}
```

#### SQL 인젝션 방지
```java
// ✅ 올바른 방법 - 파라미터 바인딩 사용
@Query("SELECT o FROM Organization o WHERE o.name = :name")
List<Organization> findByName(@Param("name") String name);

// ❌ 잘못된 방법 - 문자열 연결
// @Query("SELECT o FROM Organization o WHERE o.name = '" + name + "'")
```

### 3. 민감 정보 보호

#### 응답 데이터 필터링
```java
@JsonIgnore  // JSON 응답에서 제외
private String password;

@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)  // 요청에만 포함
private String sensitiveData;

// 조건부 필드 포함
@JsonInclude(JsonInclude.Include.NON_NULL)
private String optionalField;
```

## 📚 API 문서화

### Swagger/OpenAPI 설정

#### OpenAPI 설정
```java
@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .components(new Components()
                .addSecuritySchemes("bearer-jwt", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")))
            .info(new Info()
                .title("Test Case Management API")
                .version("1.0")
                .description("테스트 케이스 관리 시스템 API"));
    }
}
```

#### API 문서화 어노테이션
```java
@RestController
@RequestMapping("/api/organizations")
@Tag(name = "조직 관리", description = "조직 관리 API")
public class OrganizationController {
    
    @GetMapping("/{id}")
    @Operation(summary = "조직 조회", description = "ID로 특정 조직을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "조직을 찾을 수 없음")
    })
    @SecurityRequirement(name = "bearer-jwt")
    public ResponseEntity<OrganizationResponse> getOrganization(
            @Parameter(description = "조직 ID") @PathVariable Long id,
            Authentication authentication) {
        // 구현
    }
}
```

### API 문서 접근
```
개발 환경: http://localhost:8080/swagger-ui.html
API 스펙: http://localhost:8080/v3/api-docs
```

---

## 📚 관련 문서

- **[메인 가이드](../CLAUDE.md)** - 프로젝트 전체 개요
- **[개발 가이드](./DEVELOPMENT_GUIDE.md)** - 개발 환경 설정
- **[보안 가이드](./SECURITY_GUIDE.md)** - 보안 및 접근 제어