# Project Overview (최종 업데이트: 2026-02-06)

테스트 케이스 관리 시스템 프로젝트 전체 개요 및 아키텍처 가이드입니다.

## 📋 목차

1. [프로젝트 소개](#-프로젝트-소개)
2. [시스템 아키텍처](#-시스템-아키텍처)
3. [기술 스택](#-기술-스택)
4. [핵심 기능](#-핵심-기능)
5. [프로젝트 구조](#-프로젝트-구조)
6. [데이터 모델](#-데이터-모델)

## 🎯 프로젝트 소개

### 개요
**테스트 케이스 관리 시스템**은 조직, 프로젝트, 그룹 중심의 테스트 케이스 작성, 관리, 실행을 위한 풀스택 웹 애플리케이션입니다.

### 핵심 가치
- 📊 **체계적 관리**: 조직-프로젝트-그룹 계층 구조로 테스트 케이스 체계적 관리
- 🔒 **보안 중심**: JWT 기반 인증과 역할 기반 접근 제어
- 🧪 **테스트 자동화**: Playwright를 활용한 E2E 테스트 자동화 (POM 패턴 적용)
- 📈 **실시간 대시보드**: 진행 상황과 통계를 실시간으로 추적
- 🤖 **AI 지원 (RAG)**: AI 기반 유사 테스트 케이스 검색 및 문서 분석 (FastAPI + pgvector)
- 🌐 **다국어 지원 (i18n)**: 한국어 및 영어 지원 (동적 번역 시스템)
- 📦 **객체 스토리지**: MinIO 통합을 통한 대용량 첨부파일 관리

### 주요 사용자
- **테스트 엔지니어**: 테스트 케이스 작성 및 실행
- **프로젝트 매니저**: 프로젝트 진행 상황 모니터링
- **조직 관리자**: 조직 전체 품질 관리 및 리소스 배분
- **개발자**: 테스트 결과 확인 및 품질 개선

## 🏗 시스템 아키텍처

### 전체 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React SPA)   │◄──►│  (Spring Boot)  │◄──►│  (FastAPI RAG)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│    Databases    │◄─────────────┘
                        │(Postgres, MinIO)│
                        └─────────────────┘
```

### RAG (Retrieval-Augmented Generation) 시스템 아키텍처
**Frontend (React)** ↔ **Backend (Spring Boot)** ↔ **RAG Service (FastAPI)**

1. **Frontend**: 문서 업로드 및 검색 인터페이스 제공
2. **Spring Boot**: REST API 제공 및 FastAPI 서비스 데이터 전달 (WebClient)
3. **FastAPI**: 문서 파싱, 청킹(Chunking), 임베딩(Embedding) 생성 및 pgvector 저장
4. **Data Layer**:
   - **PostgreSQL (pgvector)**: 테스트 케이스 및 문서 조각의 벡터 데이터 저장
   - **MinIO**: 실제 문서 파일(PDF, TXT 등) 저장
```

### 계층별 구조

#### 프레젠테이션 계층 (Frontend)
```
React 18 + Material-UI
├── src/
│   ├── components/         # 재사용 가능한 UI 컴포넌트
│   ├── context/           # React Context (전역 상태)
│   ├── services/          # API 호출 서비스
│   ├── models/            # 데이터 모델 및 데모 데이터
│   └── utils/             # 유틸리티 함수
```

#### 비즈니스 로직 계층 (Backend)
```
Spring Boot 3.4.12
├── controllers/           # REST API 엔드포인트
├── services/             # 비즈니스 로직
├── repositories/         # 데이터 접근 계층 (JPA)
├── model/                # JPA 엔티티
├── security/             # 보안 설정 (JWT)
├── config/               # 설정 클래스 (i18n, RAG, OpenAPI 등)
└── dto/                  # 데이터 전송 객체 (Snake/Camel 매핑)

#### AI/RAG 계층 (FastAPI)
FastAPI (Python)
├── app/core/             # 설정 및 스토리지 엔진
├── app/services/         # 문서 처리, 임베딩, 검색 로직
└── app/api/              # RAG 관련 REST 엔드포인트
```

#### 데이터 계층 (Database)
```
PostgreSQL 18 (pgvector) + MinIO
├── 사용자 및 권한 테이블
├── 조직/프로젝트/그룹 계층
├── 테스트 케이스 및 플랜 테이블
├── 테스트 실행 및 이력 (Allure integration)
├── RAG 문서 및 벡터 임베딩 (pgvector)
└── 첨부파일 데이터 (MinIO Object Storage)
```

### 통신 패턴

#### API 통신
```javascript
// Frontend → Backend
const response = await apiCall('/api/projects', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

#### 인증 플로우
```
1. 사용자 로그인 → JWT Access Token + Refresh Token 발급
2. API 요청 시 Access Token 헤더 포함
3. Token 만료 시 Refresh Token으로 자동 갱신
4. Refresh Token 만료 시 재로그인 요청
```

## 🛠 기술 스택

### Frontend 기술 스택
```yaml
Core Framework:
  - React 18: 컴포넌트 기반 UI 라이브러리
  - Material-UI v5: 디자인 시스템 및 컴포넌트 라이브러리
  - React Router v6: SPA 라우팅

State Management:
  - React Context: 전역 상태 관리
  - useState/useEffect: 로컬 상태 관리

Build Tools:
  - Vite: 최신 프론트엔드 빌드 도구 (Hot Reload 지원)
  - npm: 패키지 매니저
  - i18next / useI18n: 다국어 지원 프레임워크

Testing:
  - Jest: 단위 테스트
  - Playwright: E2E 테스트 자동화
```

### Backend 기술 스택
```yaml
Core Framework:
  - Spring Boot 3.4.12: 웹 애플리케이션 프레임워크
  - Java 21: 프로그래밍 언어 (LTS 버전)
  - FastAPI: Python 기반 RAG 고성능 API 서비스

Data Access & Storage:
  - Spring Data JPA: ORM 및 데이터 접근
  - PostgreSQL (pgvector): 관계형 DB 및 벡터 검색 지원
  - MinIO: S3 호환 객체 스토리지 (첨부파일 관리)

Security:
  - Spring Security: 인증 및 권한 관리 (JWT 기반)
  - OAuth2: 구글 로그인 연동 지원

Build Tools:
  - Gradle: 빌드 도구 및 의존성 관리
  - TestNG: 단위 테스트 프레임워크
```

### Infrastructure & DevOps:
  - Docker & Docker Compose: 인프라 컨테이너화 (DB, MinIO, RAG)
  - Prometheus / Actuator: API 성능 모니터링
  - Allure: 상세 테스트 리포팅 시스템

Integration:
  - JIRA: 이슈 추적 및 프로젝트 관리 (MCP 연동)
  - ChatGPT / Upstage: RAG 기반 지능형 테스트 보조
```

## 🎯 핵심 기능

### 1. 조직 관리 시스템

#### 조직 계층 구조
```
조직 (Organization)
├── 조직 관리자 (OWNER, ADMIN)
├── 조직 멤버 (MEMBER)
└── 프로젝트들
    ├── 프로젝트 관리자 (PROJECT_MANAGER)
    ├── 팀 리더 (LEAD_DEVELOPER)
    ├── 개발자 (DEVELOPER, TESTER)
    └── 그룹들
        ├── 그룹 리더 (LEADER)
        └── 그룹 멤버 (MEMBER)
```

#### 권한 관리
사용자 역할에 따른 세밀한 접근 제어 (RBAC)를 지원합니다.

### 2. 테스트 케이스 및 플랜 관리
- 계층적 테스트 케이스 구조 지원 (Parent-Child)
- 테스트 플랜을 통한 실행 범위 설정 및 담당자 배정
- 액셀(Excel/CSV) 및 스프레드시트 방식의 대량 편집 지원

### 3. 대시보드 및 리포팅
- 프로젝트별 통과율, 실패율 실시간 차트 제공
- 테스트 실행 이력 및 Allure 리포트 연동

### 4. RAG 및 AI 검색
- **문서 업로드**: 요구사항 명세서, 기획서 등을 PDF/TXT로 업로드 및 MinIO 저장
- **유사 검색**: 자연어 쿼리를 통한 유사한 테스트 케이스 및 문서 조각 검색
- **AI 분석**: 업로드된 문서를 바탕으로 테스트 시나리오 추천 및 분석

### 5. i18n 다국어 시스템
- **동적 번역**: DB 기반 번역 스토리지와 KeysInitializer/Translations 클래스를 통한 번역 키 관리
- **지원 언어**: 한국어(KO), 영어(EN) 실시간 전환
- **확장성**: 신규 번역 추가 시 Initializer 등록만으로 DB 자동 배포

### 6. E2E 테스트 자동화
- **Playwright 연동**: 모든 주요 플로우에 대해 E2E 테스트 스크립트 제공
- **POM (Page Object Model)**: 테스트 코드의 유지보수성을 위한 페이지 객체 모델링 적용
- **데이터 식별자**: `data-testid` 속성을 통한 안정적인 요소 선택

#### Playwright 통합
```javascript
// 자동화된 테스트 케이스
test('로그인 성공 플로우', async ({ page }, testInfo) => {
  // Given
  await page.goto('/');
  
  // When
  await page.fill('[data-testid="username"]', 'admin');
  await page.fill('[data-testid="password"]', 'admin');
  await page.click('[data-testid="login-button"]');
  
  // Then
  await expect(page).toHaveURL(/\/dashboard/);
  await takeSuccessScreenshot(page, testInfo, 'login-success');
});
```

## 📁 프로젝트 구조

### 전체 디렉토리 구조
```
testcasecraft-private/
├── src/main/
│   ├── java/com/testcase/testcasemanagement/  # Spring Boot 애플리케이션
│   │   ├── controller/                        # REST API 컨트롤러
│   │   ├── service/                           # 비즈니스 로직 및 구현체
│   │   ├── repository/                        # JPA 리포지토리
│   │   ├── model/                             # JPA 엔티티 모델
│   │   ├── config/i18n/                       # i18n 번역 키 및 데이터 관리
│   │   ├── dto/rag/                           # RAG 전용 데이터 교환 객체
│   │   └── security/                          # Spring Security 및 JWT 설정
│   ├── frontend/                             # Vite + React 애플리케이션
│   │   ├── src/
│   │   │   ├── components/RAG/               # RAG UI 관련 컴포넌트
│   │   │   ├── context/I18nContext.jsx       # 다국어 Context
│   │   │   ├── pages/                        # 페이지 단위 컴포넌트
│   │   │   └── constants/                    # 전역 상수 (색상, 상태 등)
│   │   └── vite.config.js                    # Vite 빌드 설정
│   └── resources/
│       ├── static/                           # 빌드된 프론트엔드 정적 파일
│       └── application.yml                   # DB/MinIO/RAG 연동 설정
├── src/test/
│   ├── java/                                 # TestNG 단위 및 API 테스트
│   └── e2e/                                  # Playwright E2E 테스트
│       ├── pages/                            # Page Object Model 클래스
│       ├── regression/                       # 회귀 테스트 시나리오
│       └── playwright.config.js              # 테스트 러너 설정
├── rag-service/                              # FastAPI 기반 RAG 서비스 (Python)
├── docker-compose-build/                     # 인프라 구축용 Docker Compose 파일
├── docs/                                     # 상세 기술 문서 및 가이드
├── build.gradle                              # 통합 빌드 설정 (Gradle)
└── GEMINI.md                                 # 개발 가이드라인 요약
```

### 핵심 파일 설명

#### Backend 핵심 파일
```java
// 메인 애플리케이션 클래스
@SpringBootApplication
public class TestCaseManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(TestCaseManagementApplication.class, args);
    }
}

// JWT 보안 설정
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // JWT 기반 보안 설정
    }
}
```

#### Frontend 핵심 파일
```javascript
// 메인 App 컴포넌트
function App() {
  return (
    <AppContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
        </Routes>
      </Router>
    </AppContextProvider>
  );
}

// 전역 상태 관리
export const AppContext = createContext();
export const AppContextProvider = ({ children }) => {
  // 인증, API 호출, 전역 상태 관리
};
```

## 📊 데이터 모델

### 엔티티 관계도 (ERD)
```
┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│    User     │    │ OrganizationUser│    │Organization │
│             │◄──►│                 │◄──►│             │
│ - id        │    │ - role          │    │ - id        │
│ - username  │    │ - joinDate      │    │ - name      │
│ - email     │    └─────────────────┘    │ - description│
└─────────────┘                           └─────────────┘
       │                                          │
       │         ┌─────────────────┐              │
       └────────►│   ProjectUser   │◄─────────────┘
                 │                 │◄──┐
                 │ - role          │   │
                 │ - joinDate      │   │
                 └─────────────────┘   │
                                       │
                 ┌─────────────────┐   │
                 │    Project      │◄──┘
                 │                 │
                 │ - id            │
                 │ - name          │
                 │ - description   │
                 └─────────────────┘
                          │
                          │
                 ┌─────────────────┐
                 │   TestCase      │
                 │                 │
                 │ - id            │
                 │ - title         │
                 │ - description   │
                 │ - parentId      │
                 │ - priority      │
                 │ - status        │
                 └─────────────────┘
                          │
                          │
                 ┌─────────────────┐
                 │ TestExecution   │
                 │                 │
                 │ - id            │
                 │ - status        │
                 │ - result        │
                 │ - executedDate  │
                 │ - notes         │
                 └─────────────────┘
```

### 주요 엔티티 정의

#### 사용자 관리
```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    
    @Column(unique = true)
    private String email;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### 조직 관리
```java
@Entity
public class Organization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    private List<OrganizationUser> organizationUsers = new ArrayList<>();
    
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    private List<Project> projects = new ArrayList<>();
}

@Entity
public class OrganizationUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Enumerated(EnumType.STRING)
    private OrganizationRole role;
    
    private LocalDateTime joinDate;
}
```

#### 프로젝트 관리
```java
@Entity
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<ProjectUser> projectUsers = new ArrayList<>();
    
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
    private List<TestCase> testCases = new ArrayList<>();
}
```

#### 테스트 케이스
```java
@Entity
public class TestCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String steps;
    
    @Column(columnDefinition = "TEXT")
    private String expectedResult;
    
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private TestCase parent;
    
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<TestCase> children = new ArrayList<>();
    
    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;
    
    @Enumerated(EnumType.STRING)
    private TestCaseStatus status = TestCaseStatus.ACTIVE;
    
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
}
```

### 데이터베이스 설정

#### 운영 및 인프라
```yaml
# docker-compose.yml
services:
  postgres-rag:
    image: pgvector/pgvector:pg18 # 벡터 검색 지원 Postgres
    ports: ["5433:5432"]
  
  minio:
    image: minio/minio                  # 객체 스토리지
    ports: ["9000:9000", "9001:9001"]
    
  rag-service:
    build: ./rag-service                # FastAPI 서비스
    ports: ["8001:8001"]
    environment:
      - DATABASE_URL=postgresql://...
      - MINIO_ENDPOINT=minio:9000
```

#### PostgreSQL 운영 환경
```yaml
# application-prod.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/testcase_db
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate
    database-platform: org.hibernate.dialect.PostgreSQLDialect
```

## 🔄 시스템 워크플로우

### 1. 사용자 온보딩 플로우
```
1. 사용자 등록 → 2. 이메일 인증 → 3. 조직 생성/가입 → 4. 프로젝트 할당 → 5. 테스트 케이스 작성 시작
```

### 2. 테스트 케이스 관리 플로우
```
1. 테스트 케이스 작성 → 2. 리뷰 및 승인 → 3. 테스트 플랜 포함 → 4. 테스트 실행 → 5. 결과 기록 → 6. 리포트 생성
```

### 3. 프로젝트 라이프사이클
```
1. 프로젝트 생성 → 2. 팀 구성 → 3. 테스트 케이스 작성 → 4. 테스트 실행 → 5. 품질 분석 → 6. 릴리즈 결정
```

---

## 📚 관련 문서

- **[메인 가이드](../CLAUDE.md)** - Claude Code용 핵심 가이드
- **[개발 가이드](./DEVELOPMENT_GUIDE.md)** - 개발 환경 설정 및 워크플로우
- **[API 가이드](./API_GUIDE.md)** - API 개발 가이드라인
- **[보안 가이드](./SECURITY_GUIDE.md)** - 보안 및 접근 제어
- **[E2E 테스트 가이드](./E2E_TESTING_GUIDE.md)** - Playwright E2E 테스트
- **[JIRA 통합 가이드](./JIRA_INTEGRATION.md)** - JIRA 이슈 관리