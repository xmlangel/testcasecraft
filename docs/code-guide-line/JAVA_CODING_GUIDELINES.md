# Java 코딩 가이드라인

본 문서는 TestCaseCraft 프로젝트의 Java 백엔드 개발을 위한 코딩 가이드라인을 정의합니다. 모든 개발자는 코드의 일관성과 유지보수성을 위해 본 규칙을 준수해야 합니다.

---

## 1. 시스템 아키텍처 (Layered Architecture)

표준 4계층 아키텍처를 준수합니다.

| 레이어 | 패키지 | 역할 |
|-------|-------|------|
| **Controller** | `controller/` | HTTP 요청 검증, DTO 매핑, 응답 포맷팅 (Swagger 적용 필수) |
| **Service** | `service/` | 비즈니스 로직 처리, 트랜잭션 경계, 외부 시스템 연동 |
| **Repository** | `repository/` | DB 접근 로직 (Spring Data JPA 사용) |
| **Model** | `model/` | JPA 엔티티 정의 및 도메인 모델 |

- **DTO (Data Transfer Object)**: 레이어 간 데이터 전달을 위해 `dto/` 패키지의 객체를 사용합니다.
- **Mapper**: Entity와 DTO 간의 변환은 `mapper/` 패키지의 클래스나 수동 변환 로직을 사용합니다.

---

## 2. 네이밍 컨벤션

- **클래스 (Classes)**: `PascalCase` (예: `TestCaseService`)
- **메서드/변수 (Methods/Variables)**: `camelCase` (예: `getAllTestCases`)
- **상수 (Constants)**: `UPPER_SNAKE_CASE` (예: `MAX_FILE_SIZE`)
- **DB 테이블/컬럼**: `snake_case` (예: `test_cases`, `created_at`)
- **접미사 활용**:
    - Controller: `*Controller`
    - Service: `*Service`
    - Repository: `*Repository`
    - DTO: `*Dto`
    - Mapper: `*Mapper`

---

## 3. 코드 스타일 및 기술 스택

### 3.1. Lombok 사용
반복적인 코드를 줄이기 위해 Lombok 어노테이션을 적극 활용합니다.
- `@Getter`, `@Setter`
- `@NoArgsConstructor`, `@AllArgsConstructor`
- `@Slf4j` (로깅용)

### 3.2. 의존성 주입 (DI)
- 가능한 한 **생성자 주입(Constructor Injection)** 방식을 사용합니다.
- 필드 주입(`@Autowired`)은 가급적 지양하되, 설정 클래스나 특별한 경우에만 제한적으로 사용합니다.

### 3.3. API 응답
- `ResponseEntity`를 사용하여 HTTP 상태 코드와 응답 본문을 명시적으로 반환합니다.

---

## 4. 데이터베이스 및 JPA 설계

### 4.1. PK 전략
- 주 식별자(ID)는 **UUID (String)** 형식을 사용합니다.
- `@GeneratedValue(strategy = GenerationType.UUID)`를 적용합니다.

### 4.2. 감사(Auditing) 필드
- 모든 주요 엔티티에는 다음 필드를 포함합니다:
    - `createdAt`, `updatedAt` (LocalDateTime)
    - `createdBy`, `updatedBy` (String)
- `@PrePersist`, `@PreUpdate`를 사용하거나 AOP 기반의 감사 시스템을 활용합니다.

### 4.3. 인덱스 및 제약 조건
- 성능 최적화를 위해 필요한 인덱스는 `@Table` 레벨에서 명시적으로 정의합니다.
    ```java
    @Table(name = "table_name", indexes = {
        @Index(name = "idx_name", columnList = "column_name")
    })
    ```

### 4.4. 낙관적 락 (Optimistic Locking)
- 데이터 정합성을 위해 `@Version` 어노테이션이 달린 `version` 필드를 활용합니다.

---

## 5. 예외 처리 및 로깅

- **예외 처리**:
    - 도메인별 커스텀 예외를 정의하여 사용합니다 (예: `ResourceNotValidException`).
    - Controller에서 try-catch를 통해 적절한 에러 응답을 구성합니다.
- **로깅**:
    - `@Slf4j`를 사용하여 주요 흐름, 에러 발생 시 로그를 남깁니다.
    - 중요 로직에는 파라미터와 결과값을 로그로 남겨 추적이 가능하게 합니다.

---

## 6. 주석 및 이슈 추적

- **JavaDoc**: 공개 API나 복잡한 비즈니스 로직이 포함된 메서드에는 설명을 위한 JavaDoc 주석을 작성합니다.

---

## 7. 테스트 가이드

- **프레임워크**: **TestNG**를 기본 테스트 프레임워크로 사용합니다 (JUnit 지양).
- **종류**:
    - Unit Test: 비즈니스 로직 단위 검증
    - API Test: RestAssured를 활용한 엔드포인트 통합 테스트
- **Allure**: 테스트 결과 보고를 위해 Allure 어노테이션을 활용할 수 있습니다.

---

## 8. 기타 규칙

- **Java 버전**: Java 21의 기능을 적극 활용합니다.
- **가독성**: 메서드는 하나의 책임만 가지도록 작게 유지합니다.
- **미사용 코드 제거**: 사용하지 않는 import, 변수, 메서드는 즉시 제거합니다.
