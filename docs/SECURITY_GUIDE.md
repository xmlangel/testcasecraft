# Security Guide (최종 업데이트: 2025-08-04)

보안 및 접근 제어 가이드입니다.

## 📋 목차

1. [보안 원칙](#-보안-원칙)
2. [인증 및 권한 관리](#-인증-및-권한-관리)
3. [API 보안 구현](#-api-보안-구현)
4. [데이터 보호](#-데이터-보호)
5. [보안 테스트](#-보안-테스트)

## 🛡️ 보안 원칙

### 핵심 보안 원칙

#### 1. 최소 권한 원칙 (Principle of Least Privilege)
```java
// ✅ 올바른 예시 - 필요한 최소한의 권한만 부여
@PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
public ResponseEntity<?> getProject(@PathVariable Long projectId, Authentication auth) {
    // 해당 프로젝트에만 접근 가능
}

// ❌ 잘못된 예시 - 과도한 권한 부여
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> getProject(@PathVariable Long projectId, Authentication auth) {
    // 관리자만 접근 가능 (필요 이상의 권한)
}
```

#### 2. 심층 방어 (Defense in Depth)
```java
@RestController
public class ProjectController {
    
    // Layer 1: Controller 레벨 보안
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<?> getProject(@PathVariable Long projectId, Authentication auth) {
        
        // Layer 2: Service 레벨 보안
        return ResponseEntity.ok(projectService.getProject(projectId, auth.getName()));
    }
}

@Service
public class ProjectService {
    
    public ProjectDto getProject(Long projectId, String username) {
        // Layer 3: 데이터 필터링
        Project project = projectRepository.findByIdAndUser(projectId, username)
            .orElseThrow(() -> new ResourceNotFoundException("프로젝트를 찾을 수 없습니다"));
        
        return toDto(project);
    }
}
```

#### 3. 기본적으로 안전 (Secure by Default)
```java
// ✅ 기본적으로 접근 거부
@PreAuthorize("@securityService.hasAccess(#resourceId, authentication.name)")
public ResponseEntity<?> getResource(@PathVariable Long resourceId) {
    // 명시적 권한 검증 후에만 접근 허용
}

// ❌ 기본적으로 접근 허용
public ResponseEntity<?> getResource(@PathVariable Long resourceId) {
    // 권한 검증 없이 접근 허용 (보안 취약)
}
```

### 보안 체크리스트

#### ✅ API 개발 시 필수 확인사항
- [ ] 현재 사용자 인증 확인 (`Authentication` 파라미터 사용)
- [ ] 리소스 접근 권한 검증 (`@PreAuthorize` 적용)
- [ ] 역할 기반 권한 체크 (OWNER, ADMIN, MEMBER 등)
- [ ] 데이터 필터링 적용 (사용자가 접근 가능한 데이터만 반환)
- [ ] 예외 처리 구현 (권한 부족 시 적절한 HTTP 상태 코드)
- [ ] 보안 테스트 작성 (권한 없는 사용자 접근 차단 확인)

## 🔐 인증 및 권한 관리

### JWT 기반 인증 시스템

#### JWT 토큰 구조
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "admin",
    "iat": 1691145600,
    "exp": 1691149200,
    "authorities": ["ROLE_USER", "ROLE_ADMIN"]
  },
  "signature": "..."
}
```

#### 토큰 생성 및 검증
```java
@Component
public class JwtTokenUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("authorities", userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList()));
        
        return createToken(claims, userDetails.getUsername());
    }
    
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
            .setClaims(claims)
            .setSubject(subject)
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + expiration * 1000))
            .signWith(SignatureAlgorithm.HS256, secret)
            .compact();
    }
    
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
```

#### 인증 필터
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                  HttpServletResponse response, 
                                  FilterChain chain) throws ServletException, IOException {
        
        final String requestTokenHeader = request.getHeader("Authorization");
        
        String username = null;
        String jwtToken = null;
        
        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtTokenUtil.getUsernameFromToken(jwtToken);
            } catch (IllegalArgumentException e) {
                logger.error("JWT 토큰을 가져올 수 없습니다", e);
            } catch (ExpiredJwtException e) {
                logger.error("JWT 토큰이 만료되었습니다", e);
            }
        }
        
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            
            if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        chain.doFilter(request, response);
    }
}
```

### 권한 계층 구조

#### 조직 권한 (Organization Roles)
```java
public enum OrganizationRole {
    OWNER("조직 소유자", 100),      // 조직 전체 관리 권한
    ADMIN("조직 관리자", 80),       // 조직 관리 권한
    MEMBER("조직 멤버", 60);        // 조직 읽기 권한
    
    private final String description;
    private final int priority;
    
    OrganizationRole(String description, int priority) {
        this.description = description;
        this.priority = priority;
    }
    
    public boolean isHigherThan(OrganizationRole other) {
        return this.priority > other.priority;
    }
}
```

#### 프로젝트 권한 (Project Roles)
```java
public enum ProjectRole {
    PROJECT_MANAGER("프로젝트 매니저", 100),
    LEAD_DEVELOPER("기술 리드", 90),
    DEVELOPER("개발자", 70),
    TESTER("테스터", 70),
    CONTRIBUTOR("기여자", 60),
    VIEWER("뷰어", 40);
    
    private final String description;
    private final int priority;
    
    // 권한 비교 메서드들
    public boolean canManageProject() {
        return this.priority >= 90;
    }
    
    public boolean canWriteTestCases() {
        return this.priority >= 60;
    }
    
    public boolean canViewProject() {
        return this.priority >= 40;
    }
}
```

#### 그룹 권한 (Group Roles)
```java
public enum GroupRole {
    LEADER("그룹 리더", 100),
    CO_LEADER("그룹 부리더", 80),
    MEMBER("그룹 멤버", 60);
    
    private final String description;
    private final int priority;
}
```

## 🔒 API 보안 구현

### Security Service 패턴

#### 조직 보안 서비스
```java
@Service
public class OrganizationSecurityService {
    
    private final OrganizationUserRepository organizationUserRepository;
    
    /**
     * 조직 멤버십 확인
     */
    public boolean isOrganizationMember(Long organizationId, String username) {
        return organizationUserRepository.existsByOrganizationIdAndUserUsername(organizationId, username);
    }
    
    /**
     * 조직 관리 권한 확인
     */
    public boolean canManageOrganization(Long organizationId, String username) {
        return organizationUserRepository.existsByOrganizationIdAndUserUsernameAndRoleIn(
            organizationId, username, 
            Arrays.asList(OrganizationRole.OWNER, OrganizationRole.ADMIN)
        );
    }
    
    /**
     * 조직 소유자 확인
     */
    public boolean isOrganizationOwner(Long organizationId, String username) {
        return organizationUserRepository.existsByOrganizationIdAndUserUsernameAndRole(
            organizationId, username, OrganizationRole.OWNER
        );
    }
    
    /**
     * 사용자가 접근 가능한 조직 목록 필터링
     */
    public List<Long> getAccessibleOrganizationIds(String username) {
        return organizationUserRepository.findOrganizationIdsByUsername(username);
    }
}
```

#### 프로젝트 보안 서비스
```java
@Service
public class ProjectSecurityService {
    
    private final ProjectUserRepository projectUserRepository;
    private final OrganizationSecurityService organizationSecurityService;
    
    /**
     * 프로젝트 접근 권한 확인
     */
    public boolean canAccessProject(Long projectId, String username) {
        // 직접 프로젝트 멤버인지 확인
        if (projectUserRepository.existsByProjectIdAndUserUsername(projectId, username)) {
            return true;
        }
        
        // 조직 멤버를 통한 접근 권한 확인
        Long organizationId = projectRepository.findOrganizationIdByProjectId(projectId);
        return organizationSecurityService.isOrganizationMember(organizationId, username);
    }
    
    /**
     * 프로젝트 관리 권한 확인
     */
    public boolean hasManagementRole(Long projectId, String username) {
        return projectUserRepository.existsByProjectIdAndUserUsernameAndRoleIn(
            projectId, username,
            Arrays.asList(ProjectRole.PROJECT_MANAGER, ProjectRole.LEAD_DEVELOPER)
        );
    }
    
    /**
     * 테스트케이스 작성 권한 확인
     */
    public boolean canWriteTestCases(Long projectId, String username) {
        Optional<ProjectRole> role = projectUserRepository.findRoleByProjectIdAndUsername(projectId, username);
        return role.map(ProjectRole::canWriteTestCases).orElse(false);
    }
}
```

### Controller 보안 구현

#### 표준 보안 패턴
```java
@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    
    private final ProjectService projectService;
    
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Page<ProjectDto>> getUserProjects(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication) {
        
        String currentUser = authentication.getName();
        Page<ProjectDto> projects = projectService.findByUser(currentUser, pageable);
        return ResponseEntity.ok(projects);
    }
    
    @GetMapping("/{projectId}")
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<ProjectDto> getProject(
            @PathVariable Long projectId,
            Authentication authentication) {
        
        ProjectDto project = projectService.findById(projectId);
        return ResponseEntity.ok(project);
    }
    
    @PostMapping("/{projectId}/testcases")
    @PreAuthorize("@projectSecurityService.canWriteTestCases(#projectId, authentication.name)")
    public ResponseEntity<TestCaseDto> createTestCase(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateTestCaseRequest request,
            Authentication authentication) {
        
        String currentUser = authentication.getName();
        TestCaseDto created = testCaseService.create(projectId, request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{projectId}")
    @PreAuthorize("@projectSecurityService.hasManagementRole(#projectId, authentication.name)")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable Long projectId,
            @Valid @RequestBody UpdateProjectRequest request,
            Authentication authentication) {
        
        ProjectDto updated = projectService.update(projectId, request);
        return ResponseEntity.ok(updated);
    }
}
```

### 예외 처리 및 보안 응답

#### 보안 예외 처리기
```java
@RestControllerAdvice
public class SecurityExceptionHandler {
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e, HttpServletRequest request) {
        
        // 보안상 상세한 정보는 로그에만 기록
        logger.warn("접근 거부: {} - {}", request.getRequestURI(), e.getMessage());
        
        ErrorResponse error = ErrorResponse.builder()
            .error("ACCESS_DENIED")
            .message("접근 권한이 없습니다.")  // 일반적인 메시지
            .timestamp(LocalDateTime.now())
            .path(request.getRequestURI())
            .build();
            
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException e, HttpServletRequest request) {
        
        ErrorResponse error = ErrorResponse.builder()
            .error("AUTHENTICATION_FAILED")
            .message("인증이 필요합니다.")
            .timestamp(LocalDateTime.now())
            .path(request.getRequestURI())
            .build();
            
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException e, HttpServletRequest request) {
        
        // 보안상 리소스 존재 여부를 숨김 (403 대신 404 반환)
        ErrorResponse error = ErrorResponse.builder()
            .error("RESOURCE_NOT_FOUND")
            .message("요청한 리소스를 찾을 수 없습니다.")
            .timestamp(LocalDateTime.now())
            .path(request.getRequestURI())
            .build();
            
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
```

## 🔐 데이터 보호

### 민감 정보 보호

#### 비밀번호 암호화
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);  // 강력한 해시 강도
    }
    
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
}

@Entity
public class User {
    
    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)  // 응답에서 제외
    private String password;
    
    // 비밀번호 설정 시 자동 암호화
    public void setPassword(String password) {
        this.password = passwordEncoder.encode(password);
    }
}
```

#### JSON 직렬화 보안
```java
public class UserDto {
    
    private Long id;
    private String username;
    private String email;
    
    @JsonIgnore  // JSON 응답에서 완전히 제외
    private String password;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)  // 요청에만 포함
    private String temporaryPassword;
    
    @JsonInclude(JsonInclude.Include.NON_NULL)  // null이 아닐 때만 포함
    private String optionalField;
    
    // 조건부 필드 직렬화
    @JsonProperty("isAdmin")
    public Boolean getIsAdmin() {
        // 현재 사용자가 관리자일 때만 공개
        return SecurityContextUtil.isCurrentUserAdmin() ? this.isAdmin : null;
    }
}
```

### 데이터 검증 및 필터링

#### 입력 검증
```java
public class CreateProjectRequest {
    
    @NotBlank(message = "프로젝트명은 필수입니다")
    @Size(min = 2, max = 100, message = "프로젝트명은 2-100자 사이여야 합니다")
    @Pattern(regexp = "^[가-힣a-zA-Z0-9\\s\\-_]+$", message = "프로젝트명에 특수문자는 사용할 수 없습니다")
    private String name;
    
    @Size(max = 1000, message = "설명은 1000자를 초과할 수 없습니다")
    @Pattern(regexp = "^[^<>\"'&]*$", message = "HTML 태그나 스크립트는 사용할 수 없습니다")
    private String description;
    
    @Valid  // 중첩 객체 검증
    private List<@Valid TeamMemberRequest> members;
}

// 커스텀 검증 어노테이션
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = NoSqlInjectionValidator.class)
public @interface NoSqlInjection {
    String message() default "SQL 인젝션 패턴이 감지되었습니다";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

#### 출력 필터링
```java
@Service
public class ProjectService {
    
    public Page<ProjectDto> findByUser(String username, Pageable pageable) {
        // 사용자가 접근 가능한 프로젝트만 조회
        List<Long> accessibleProjectIds = projectSecurityService.getAccessibleProjectIds(username);
        
        Page<Project> projects = projectRepository.findByIdIn(accessibleProjectIds, pageable);
        
        return projects.map(project -> {
            ProjectDto dto = toDto(project);
            
            // 사용자 권한에 따른 필드 필터링
            if (!projectSecurityService.hasManagementRole(project.getId(), username)) {
                dto.setSensitiveInfo(null);  // 민감한 정보 제거
            }
            
            return dto;
        });
    }
}
```

### SQL 인젝션 방지

#### 안전한 쿼리 작성
```java
@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    // ✅ 안전한 방법 - 파라미터 바인딩
    @Query("SELECT p FROM Project p WHERE p.name = :name AND p.organizationId = :orgId")
    List<Project> findByNameAndOrganization(@Param("name") String name, @Param("orgId") Long orgId);
    
    // ✅ 안전한 방법 - 메서드 명명 규칙
    List<Project> findByNameContainingIgnoreCaseAndOrganizationId(String name, Long organizationId);
    
    // ❌ 위험한 방법 - 문자열 연결 (절대 사용하지 말 것)
    // @Query("SELECT p FROM Project p WHERE p.name = '" + name + "'")
}

// 동적 쿼리 시에도 안전한 방법 사용
@Service
public class ProjectSearchService {
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public List<Project> search(ProjectSearchCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Project> query = cb.createQuery(Project.class);
        Root<Project> root = query.from(Project.class);
        
        List<Predicate> predicates = new ArrayList<>();
        
        if (criteria.getName() != null) {
            predicates.add(cb.like(
                cb.lower(root.get("name")), 
                "%" + criteria.getName().toLowerCase() + "%"  // 파라미터 바인딩 사용
            ));
        }
        
        query.where(predicates.toArray(new Predicate[0]));
        return entityManager.createQuery(query).getResultList();
    }
}
```

## 🧪 보안 테스트

### 권한 테스트

#### 접근 제어 테스트
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class SecurityTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    public void testUnauthorizedAccess() {
        // Given - 토큰 없이 요청
        
        // When
        ResponseEntity<String> response = restTemplate.getForEntity("/api/projects/1", String.class);
        
        // Then
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
    
    @Test
    public void testAccessWithWrongPermissions() {
        // Given - 권한 없는 사용자 토큰
        String userToken = getUserToken("user-without-access");
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(userToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        // When
        ResponseEntity<String> response = restTemplate.exchange(
            "/api/projects/1", HttpMethod.GET, entity, String.class);
        
        // Then
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }
    
    @Test
    public void testResourceOwnerAccess() {
        // Given - 리소스 소유자 토큰
        String ownerToken = getUserToken("project-owner");
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(ownerToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        // When
        ResponseEntity<ProjectDto> response = restTemplate.exchange(
            "/api/projects/1", HttpMethod.GET, entity, ProjectDto.class);
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }
}
```

#### 데이터 필터링 테스트
```java
@Test
public void testDataFiltering() {
    // Given - 일반 사용자 토큰
    String userToken = getUserToken("regular-user");
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(userToken);
    HttpEntity<String> entity = new HttpEntity<>(headers);
    
    // When - 프로젝트 목록 조회
    ResponseEntity<PagedProjectResponse> response = restTemplate.exchange(
        "/api/projects", HttpMethod.GET, entity, PagedProjectResponse.class);
    
    // Then - 사용자가 접근 가능한 프로젝트만 반환되는지 확인
    assertEquals(HttpStatus.OK, response.getStatusCode());
    
    List<ProjectDto> projects = response.getBody().getContent();
    for (ProjectDto project : projects) {
        // 각 프로젝트에 대한 접근 권한이 있는지 검증
        assertTrue(hasUserAccessToProject(project.getId(), "regular-user"));
        
        // 민감한 정보가 필터링되었는지 확인
        assertNull(project.getSensitiveInfo());
    }
}
```

### 보안 취약점 테스트

#### SQL 인젝션 테스트
```java
@Test
public void testSqlInjectionProtection() {
    // Given - SQL 인젝션 시도
    String maliciousInput = "'; DROP TABLE projects; --";
    String adminToken = getAdminToken();
    
    HttpHeaders headers = new HttpHeaders();
    headers.setBearerAuth(adminToken);
    
    CreateProjectRequest request = CreateProjectRequest.builder()
        .name(maliciousInput)
        .description("Test project")
        .build();
    
    HttpEntity<CreateProjectRequest> entity = new HttpEntity<>(request, headers);
    
    // When
    ResponseEntity<String> response = restTemplate.postForEntity(
        "/api/projects", entity, String.class);
    
    // Then - 요청이 거부되거나 안전하게 처리되어야 함
    assertTrue(response.getStatusCode().is4xxClientError() || response.getStatusCode().is2xxSuccessful());
    
    // 데이터베이스가 여전히 정상 작동하는지 확인
    ResponseEntity<String> checkResponse = restTemplate.exchange(
        "/api/projects", HttpMethod.GET, new HttpEntity<>(headers), String.class);
    assertEquals(HttpStatus.OK, checkResponse.getStatusCode());
}
```

#### XSS 방지 테스트
```java
@Test
public void testXssProtection() {
    // Given - XSS 공격 시도
    String xssPayload = "<script>alert('XSS')</script>";
    String adminToken = getAdminToken();
    
    CreateProjectRequest request = CreateProjectRequest.builder()
        .name("Test Project")
        .description(xssPayload)
        .build();
    
    // When
    ResponseEntity<ProjectDto> response = createProject(request, adminToken);
    
    // Then - 스크립트가 이스케이프되거나 제거되어야 함
    if (response.getStatusCode().is2xxSuccessful()) {
        String description = response.getBody().getDescription();
        assertFalse(description.contains("<script>"));
        assertFalse(description.contains("alert"));
    }
}
```

### 성능 보안 테스트

#### 인증 성능 테스트
```java
@Test
public void testAuthenticationPerformance() {
    // Given
    int numberOfRequests = 100;
    String validToken = getAdminToken();
    
    // When - 동시 인증 요청
    long startTime = System.currentTimeMillis();
    
    List<CompletableFuture<ResponseEntity<String>>> futures = IntStream.range(0, numberOfRequests)
        .mapToObj(i -> CompletableFuture.supplyAsync(() -> {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(validToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            return restTemplate.exchange("/api/projects", HttpMethod.GET, entity, String.class);
        }))
        .collect(Collectors.toList());
    
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    
    long endTime = System.currentTimeMillis();
    long totalTime = endTime - startTime;
    
    // Then - 성능 임계값 확인
    assertTrue(totalTime < 5000, "인증 처리 시간이 너무 깁니다: " + totalTime + "ms");
    
    // 모든 요청이 성공했는지 확인
    for (CompletableFuture<ResponseEntity<String>> future : futures) {
        assertEquals(HttpStatus.OK, future.join().getStatusCode());
    }
}
```

---

## 📚 관련 문서

- **[메인 가이드](../CLAUDE.md)** - 프로젝트 전체 개요
- **[API 가이드](./API_GUIDE.md)** - API 개발 가이드라인
- **[개발 가이드](./DEVELOPMENT_GUIDE.md)** - 개발 환경 설정

## 📝 업데이트 이력

- **2025-08-04**: 초기 문서 작성
  - 핵심 보안 원칙 정의
  - JWT 기반 인증 시스템 문서화
  - 권한 계층 구조 및 API 보안 구현 가이드 작성
  - 보안 테스트 전략 정리