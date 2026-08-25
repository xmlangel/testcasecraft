# Java 코딩 가이드라인

최종 갱신: 2026-08-23 21:40 KST · 기준 스택: Java 21 · Spring Boot 3.5.15 · Spring Security 6.5.x

TestCaseCraft 프로젝트의 Java 백엔드 개발 규칙입니다. 코드의 일관성과 유지보수성을 위해 모든 개발자가 준수합니다.

---

## 1. 시스템 아키텍처 (Layered Architecture)

표준 4계층을 축으로 하고, 횡단 관심사는 별도 패키지로 나눠 둡니다. 패키지 루트는 `com.testcase.testcasemanagement` 입니다.

### 핵심 4계층

| 레이어 | 패키지 | 역할 |
| :--- | :--- | :--- |
| **Controller** | `controller/` | HTTP 요청 검증, DTO 매핑, `@PreAuthorize` 인가, 응답 포맷팅 (Swagger 적용 필수) |
| **Service** | `service/` | 비즈니스 로직, 트랜잭션 경계, 외부 시스템 연동(MinIO·RAG·Jira·Google Sheets·SMTP) |
| **Repository** | `repository/` | DB 접근 (Spring Data JPA) |
| **Model** | `model/` | JPA 엔티티 및 도메인 모델 (48개 엔티티) |

### 보조 패키지

| 패키지 | 역할 |
| :--- | :--- |
| `dto/` | 레이어 간 데이터 전달 객체. 공통 오류 응답 `ErrorResponse` 도 여기 있습니다. |
| `mapper/` | Entity ↔ DTO 변환 (`ProjectMapper`·`TestCaseMapper`·`TestPlanMapper`). 나머지는 서비스 안의 변환 메서드를 사용합니다. |
| `exception/` | 도메인 예외 + `GlobalExceptionHandler` |
| `security/` | 인가 판정 서비스(`ProjectSecurityService`·`OrganizationSecurityService`·`GroupSecurityService`)와 `EncryptionUtil` |
| `config/` | Spring 설정, 필터 등록, 시드 데이터 초기화, i18n |
| `filter/` | `RateLimiterFilter` (Resilience4j) |
| `audit/` | 감사 로그 기록 (`AuditService`·`AuditAction`·`AuditEntityType`) |
| `event/` | 애플리케이션 이벤트 (테스트케이스 버전 생성) |
| `scheduler/` | 주기 작업 (Jira 헬스체크·배치 정리) |
| `health/` | Actuator `HealthIndicator` 구현 |
| `actuator/` | 커스텀 Actuator 엔드포인트 |
| `util/` | JWT·CSV·API 키 해시·프로파일 판정 등 범용 유틸 |

---

## 2. 네이밍 컨벤션

- **클래스**: `PascalCase` (예: `TestCaseService`)
- **메서드/변수**: `camelCase` (예: `getAllTestCases`)
- **상수**: `UPPER_SNAKE_CASE` (예: `MAX_FILE_SIZE`)
- **DB 테이블/컬럼**: `snake_case` (예: `test_cases`, `created_at`)
- **접미사**: `*Controller`, `*Service`, `*Repository`, `*Dto`, `*Mapper`, `*SecurityService`

---

## 3. 코드 스타일 및 기술 스택

### 3.1. 포맷터 — google-java-format

저장소 전체 Java 코드는 **google-java-format** 표준으로 정렬되어 있습니다(1.0.91 에서 일괄 적용). 루트의 `google-java-format.jar` 를 쓰거나, 최소한 주변 코드와 같은 들여쓰기(2 스페이스)를 유지합니다. 기존 주석과 JavaDoc 은 보존합니다.

포맷만 바꾸는 변경은 별도 커밋으로 분리합니다. 로직 변경과 섞이면 리뷰에서 실제 변경분이 묶여 보이지 않습니다.

### 3.2. Lombok

- `@Getter`, `@Setter`
- `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`
- `@RequiredArgsConstructor` (생성자 주입)
- `@Slf4j` (로깅)

### 3.3. 의존성 주입

- **생성자 주입**을 사용합니다. `@RequiredArgsConstructor` + `private final` 조합이 관례입니다.
- 필드 주입(`@Autowired`)은 설정 클래스나 순환 참조를 피할 수 없는 자리에만 제한적으로 사용합니다.

### 3.4. API 응답

- `ResponseEntity` 로 HTTP 상태 코드와 본문을 명시적으로 반환합니다.
- 오류 응답은 만들어 반환하지 않고 예외를 던져 `GlobalExceptionHandler` 가 처리하게 합니다(5절).

### 3.5. 컴파일 경고

`build.gradle` 이 `-Xlint:all` 을 켜 두었습니다. 새로 생긴 deprecation·unchecked 경고는 남기지 않습니다.

### 3.6. 의존성 버전과 CVE

`build.gradle` 상단의 `ext` 블록과 `dependencyManagement` 는 **CVE 대응으로 명시적으로 고정한 버전**입니다(tomcat·netty·jackson·spring-security·logback·postgresql·bouncycastle 등). 각 줄에 어떤 CVE 때문인지 주석이 붙어 있습니다.

- 이 핀을 지우거나 내리지 않습니다. 지우면 Boot BOM 의 취약 버전으로 되돌아갑니다.
- 버전을 올릴 때는 주석에 CVE 번호와 수정 버전을 함께 적습니다.

---

## 4. 데이터베이스 및 JPA 설계

### 4.1. PK 전략

- 주 식별자는 **UUID 문자열**입니다.

```java
@Id
@GeneratedValue(strategy = GenerationType.UUID)
private String id;
```

- API 경로 변수·DTO 필드도 `String` 입니다. `Long id` 로 받는 시그니처는 이 프로젝트에 맞지 않습니다.
- RAG 관련 일부 모델은 FastAPI 측 스키마와 맞추려고 `java.util.UUID` 타입을 사용합니다.

### 4.2. 감사(Auditing) 필드

주요 엔티티는 아래 네 필드를 갖습니다.

- `createdAt`, `updatedAt` (`LocalDateTime`)
- `createdBy`, `updatedBy` (`String`, 필요한 엔티티에만)

값을 채우는 방식은 **`@PrePersist`·`@PreUpdate` 콜백**이 주류입니다(48개 엔티티 중 37개). Spring Data 의 `@EnableJpaAuditing` 은 쓰지 않으므로 `@CreatedDate` 만 붙여 두면 값이 채워지지 않습니다.

행위 이력이 필요한 변경은 별도로 `audit/AuditService` 로 감사 로그를 기록합니다.

### 4.3. 인덱스 및 제약 조건

성능과 정합성에 필요한 인덱스·유니크 제약은 `@Table` 레벨에 명시합니다.

```java
@Table(
    name = "project_users",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"project_id", "user_id"})},
    indexes = {
      @Index(name = "idx_project_user_role", columnList = "project_id, role_in_project"),
      @Index(name = "idx_user_project", columnList = "user_id, project_id")
    })
```

스키마는 전 프로파일에서 **Hibernate `ddl-auto: update`** 로 반영됩니다. Flyway 의존성은 들어 있지만 `spring.flyway.enabled: false` 이고 `db/migration` 에 마이그레이션 파일이 없습니다.

`update` 는 컬럼·테이블 추가만 합니다. 컬럼 삭제·타입 변경·nullable → not-null 전환은 반영되지 않으므로, 그런 변경은 배포 전에 DB 에서 직접 수행할 SQL 을 준비하고 릴리즈 노트에 기록합니다. 반영됐다고 가정하면 운영에서 컬럼이 예전 상태로 남아 있는 것을 나중에 발견하게 됩니다.

### 4.4. 낙관적 락 (Optimistic Locking)

동시 편집 충돌을 감지해야 하는 엔티티에 `@Version` 필드를 둡니다. 전 엔티티에 일괄 적용된 규칙이 아니라(현재 1개 엔티티), 충돌이 실제로 문제가 되는 곳에만 적용합니다.

`VersionConflictException` 은 이름이 비슷하지만 JPA 낙관적 락과 별개입니다. JUnit 버전 번호를 동시에 발급할 때의 중복을 표현하는 도메인 예외입니다.

---

## 5. 예외 처리 및 로깅

### 5.1. 예외는 던지고, 응답은 한 곳에서 만든다

정본은 `exception/GlobalExceptionHandler`(`@RestControllerAdvice`) 입니다. **Controller 에서 try-catch 로 오류 응답을 직접 조립하지 않습니다.** 두 곳에서 만들면 같은 오류가 경로마다 다른 형태로 나가고, 프런트의 오류 처리가 경로별로 갈립니다.

도메인 예외는 `exception/` 에 정의된 것을 사용합니다.

| 예외 | 핸들러 등록 | 응답 |
| :--- | :--- | :--- |
| `ResourceNotFoundException` | 있음 | 404 |
| `ResourceNotValidException` | 있음 | 400 |
| `AccessDeniedException` (도메인·Spring 양쪽) | 있음 | 403 |
| `DashboardException` 및 하위 4종 | 있음 | 도메인별 코드 |
| `RagDisabledException`, `RagVectorWriteDisabledException` | 있음 | 기능 비활성 응답 |
| `DataIntegrityViolationException` | 있음 | 409 |
| `RequestNotPermitted` (레이트 리밋) | 있음 | 429 |
| `MaxUploadSizeExceededException` | 있음 | 413 계열 |
| `VersionConflictException` | **없음** | 일반 `Exception` 핸들러로 떨어져 500 |
| `EncryptionKeyNotConfiguredException` | **없음** | 일반 `Exception` 핸들러로 떨어져 500 |
| `TestCaseNotFoundException`, `TranslationKeyNotFoundException` | **없음** | 일반 `Exception` 핸들러로 떨어져 500 |

오른쪽 세 줄은 **예외 클래스는 있는데 전용 핸들러가 없는 상태**입니다. 그 경로에서 클라이언트는 404·409 대신 500 을 받습니다. 새 예외를 만들 때는 `GlobalExceptionHandler` 에 핸들러를 함께 추가합니다.

### 5.2. 오류 응답 형태

`dto/ErrorResponse` 의 필드는 다음 넷입니다.

```json
{
  "errorCode": "RESOURCE_NOT_FOUND",
  "message": "요청한 리소스를 찾을 수 없습니다.",
  "timestamp": "2026-08-23T21:40:00",
  "details": { "requestPath": "..." }
}
```

`error`·`path` 같은 다른 이름을 쓰는 문서나 코드가 있으면 이 정의에 맞춥니다.

### 5.3. 로깅

- `@Slf4j` 를 쓰고 파라미터는 `{}` 자리표시자로 넘깁니다(문자열 연결 금지).
- **민감값을 로그에 남기지 않습니다**: JWT, API 키, 비밀번호, DB 커넥션 문자열, Google 서비스 계정 JSON. 운영 로그 레벨은 INFO 입니다. DEBUG 로 내리면 커넥션 문자열이 그대로 찍힙니다.

---

## 6. 주석 및 문서화

- **JavaDoc**: 공개 API, 그리고 "왜 이렇게 했는가"가 코드만 보고 드러나지 않는 메서드·클래스에 작성합니다. 무엇을 하는지는 코드가 말하므로, 판단의 근거를 적는 것이 값어치가 있습니다.
- **Swagger**: Controller 에는 `@Operation`·`@ApiResponse` 를 붙입니다. 문서는 `/swagger-ui.html`, 스펙은 `/api-docs` 로 열립니다.

---

## 7. 테스트 가이드

- **프레임워크**: **TestNG** (JUnit 지양). 상세는 [테스트 아키텍처 가이드](./TEST_ARCHITECTURE_GUIDE.md).
- **테스트 DB**: Testcontainers PostgreSQL. H2 는 사용하지 않습니다.
- **종류**: Service 단위 테스트(Mockito), Repository 테스트(`@DataJpaTest`), API 통합 테스트(RestAssured).
- **Allure**: `@Epic`·`@Feature`·`@Story` 로 리포트를 분류합니다.

---

## 8. 기타 규칙

- **Java 버전**: Java 21. 레코드·패턴 매칭·`var`·텍스트 블록을 활용합니다.
- **가독성**: 메서드는 하나의 책임만 갖도록 작게 유지합니다.
- **미사용 코드 제거**: 내 변경으로 쓰이지 않게 된 import·변수·메서드는 함께 제거합니다. 원래 있던 죽은 코드는 요청받지 않았으면 건드리지 않습니다.
- **프로파일**: `dev`·`local`·`remote`·`test`·`prod`. 운영 전용 강제(암호화 키 필수 등)는 `prod` 에 걸려 있으니 프로파일을 임의로 바꾸지 않습니다.

---

## 📚 관련 문서

- [개발 가이드](./DEVELOPMENT_GUIDE.md): 환경 설정 및 워크플로우
- [API 개발 가이드](./API_GUIDE.md): REST API 설계 표준
- [보안 가이드](./SECURITY_GUIDE.md): 인증·인가·데이터 보호
- [테스트 아키텍처 가이드](./TEST_ARCHITECTURE_GUIDE.md): 레이어별 테스트 표준
