# Project Overview (최종 업데이트: 2025-08-04)

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
- 🧪 **테스트 자동화**: Playwright를 활용한 E2E 테스트 자동화
- 📈 **실시간 대시보드**: 진행 상황과 통계를 실시간으로 추적

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
│   (React SPA)   │◄──►│  (Spring Boot)  │◄──►│  (H2/PostgreSQL)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│  Authentication │◄─────────────┘
                        │  (JWT + Refresh)│
                        └─────────────────┘
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
Spring Boot 3.2.4
├── controllers/           # REST API 엔드포인트
├── services/             # 비즈니스 로직
├── repositories/         # 데이터 접근 계층
├── models/               # JPA 엔티티
├── security/             # 보안 설정
└── config/               # 설정 클래스
```

#### 데이터 계층 (Database)
```
H2 (개발) / PostgreSQL (운영)
├── 사용자 관리 테이블
├── 조직/프로젝트/그룹 테이블
├── 테스트 케이스 테이블
├── 테스트 실행 결과 테이블
└── 감사 로그 테이블
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
  - Create React App: 개발 환경 설정
  - npm: 패키지 매니저

Testing:
  - Jest: 단위 테스트
  - Playwright: E2E 테스트 자동화
```

### Backend 기술 스택
```yaml
Core Framework:
  - Spring Boot 3.2.4: 웹 애플리케이션 프레임워크
  - Java 21: 프로그래밍 언어 (LTS 버전)

Data Access:
  - Spring Data JPA: ORM 및 데이터 접근
  - H2 Database: 개발 및 테스트용 인메모리 DB
  - PostgreSQL: 운영 환경 데이터베이스

Security:
  - Spring Security: 인증 및 권한 관리
  - JWT: 토큰 기반 인증
  - BCrypt: 비밀번호 암호화

Build Tools:
  - Gradle: 빌드 도구 및 의존성 관리
  - TestNG: 단위 테스트 프레임워크
```

### DevOps & Tools
```yaml
Testing:
  - Allure: 테스트 결과 리포팅
  - JSON Schema Validation: API 응답 검증

Integration:
  - JIRA: 이슈 추적 및 프로젝트 관리
  - MCP (Model Context Protocol): JIRA 연동

Development:
  - Claude Code: AI 기반 개발 지원
  - Git: 버전 관리
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
```java
// 조직 권한
public enum OrganizationRole {
    OWNER("조직 소유자", 100),      // 전체 관리
    ADMIN("조직 관리자", 80),       // 관리 권한
    MEMBER("조직 멤버", 60);        // 읽기 권한
}

// 프로젝트 권한
public enum ProjectRole {
    PROJECT_MANAGER("프로젝트 매니저", 100),
    LEAD_DEVELOPER("기술 리드", 90),
    DEVELOPER("개발자", 70),
    TESTER("테스터", 70),
    CONTRIBUTOR("기여자", 60),
    VIEWER("뷰어", 40);
}
```

### 2. 테스트 케이스 관리

#### 테스트 케이스 구조
```javascript
// 계층적 테스트 케이스
{
  id: 1,
  title: "로그인 기능 테스트",
  description: "사용자 로그인 시나리오 검증",
  priority: "HIGH",
  status: "ACTIVE",
  parentId: null,        // 루트 테스트 케이스
  children: [
    {
      id: 2,
      title: "정상 로그인 테스트",
      parentId: 1,       // 상위 테스트 케이스
      steps: [
        "1. 로그인 페이지 접속",
        "2. 유효한 계정 정보 입력",
        "3. 로그인 버튼 클릭"
      ],
      expectedResult: "대시보드 페이지로 리디렉션"
    }
  ]
}
```

#### 테스트 실행 관리
```javascript
// 테스트 플랜 및 실행
{
  testPlan: {
    id: 1,
    name: "Sprint 10 회귀 테스트",
    testCases: [1, 2, 3, 4],
    assignee: "tester@company.com",
    plannedDate: "2025-08-10"
  },
  testExecution: {
    id: 1,
    testPlanId: 1,
    status: "IN_PROGRESS",
    results: [
      { testCaseId: 1, status: "PASS", notes: "정상 동작 확인" },
      { testCaseId: 2, status: "FAIL", notes: "로딩 시간 초과" }
    ]
  }
}
```

### 3. 대시보드 및 리포팅

#### 실시간 통계
```javascript
// 대시보드 위젯
const dashboardWidgets = [
  {
    type: "STATISTICS_CARDS",
    data: {
      totalProjects: 12,
      activeTestCases: 156,
      passRate: 87.5,
      failedTests: 8
    }
  },
  {
    type: "PIE_CHART",
    title: "테스트 상태 분포",
    data: [
      { name: "통과", value: 140, color: "#4caf50" },
      { name: "실패", value: 8, color: "#f44336" },
      { name: "보류", value: 8, color: "#ff9800" }
    ]
  },
  {
    type: "PROGRESS_CHART",
    title: "프로젝트 진행률",
    data: [
      { project: "웹 애플리케이션", progress: 85 },
      { project: "모바일 앱", progress: 62 }
    ]
  }
];
```

### 4. E2E 테스트 자동화

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
test-case-manager-only-front-local-storage/
├── src/main/
│   ├── java/com/testcase/testcasemanagement/  # Spring Boot 애플리케이션
│   │   ├── api/                               # REST API 컨트롤러
│   │   │   ├── auth/                         # 인증 관련 API
│   │   │   ├── organization/                 # 조직 관리 API
│   │   │   ├── project/                      # 프로젝트 관리 API
│   │   │   └── testcase/                     # 테스트케이스 API
│   │   ├── service/                          # 비즈니스 로직
│   │   ├── repository/                       # 데이터 접근 계층
│   │   ├── model/                            # JPA 엔티티
│   │   ├── security/                         # 보안 설정
│   │   └── config/                           # 설정 클래스
│   ├── frontend/                             # React 애플리케이션
│   │   ├── src/
│   │   │   ├── components/                   # React 컴포넌트
│   │   │   │   ├── auth/                    # 인증 관련 컴포넌트
│   │   │   │   ├── dashboard/               # 대시보드 컴포넌트
│   │   │   │   ├── organization/            # 조직 관리 컴포넌트
│   │   │   │   ├── project/                 # 프로젝트 관리 컴포넌트
│   │   │   │   └── testcase/                # 테스트케이스 컴포넌트
│   │   │   ├── context/                     # React Context
│   │   │   ├── services/                    # API 호출 서비스
│   │   │   ├── models/                      # 데이터 모델
│   │   │   └── utils/                       # 유틸리티 함수
│   │   ├── public/                          # 정적 파일
│   │   └── package.json                     # Frontend 의존성
│   └── resources/
│       ├── application.yml                   # Spring 설정
│       └── data.sql                         # 샘플 데이터
├── src/test/
│   ├── java/                                # Java 테스트
│   └── resources/
│       └── schemas/                         # JSON 스키마
├── e2e-tests/                               # E2E 테스트
│   ├── authentication/                      # 인증 테스트
│   ├── dashboard/                           # 대시보드 테스트
│   └── playwright.config.js                # Playwright 설정
├── docs/                                    # 프로젝트 문서
│   ├── E2E_EPIC_STRUCTURE.md               # E2E 테스트 구조
│   ├── API_GUIDE.md                         # API 개발 가이드
│   ├── DEVELOPMENT_GUIDE.md                 # 개발 가이드
│   ├── SECURITY_GUIDE.md                    # 보안 가이드
│   └── JIRA_INTEGRATION.md                  # JIRA 통합
├── d_mcpsvr_jira/                          # JIRA MCP 서버
│   ├── jira_caller.py                      # JIRA API 호출
│   ├── jira_workflow.py                    # 워크플로우 관리
│   └── quick_start.py                      # 빠른 시작 스크립트
├── build.gradle                            # Gradle 빌드 설정
├── CLAUDE.md                               # Claude Code 가이드
└── README.md                               # 프로젝트 소개
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

#### H2 개발 환경
```yaml
# application-local.yml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: 
  
  h2:
    console:
      enabled: true
      path: /h2-console
  
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
    properties:
      hibernate:
        format_sql: true
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

## 📝 업데이트 이력

- **2025-08-04**: 초기 문서 작성
  - 프로젝트 전체 아키텍처 및 기술 스택 정리
  - 핵심 기능 및 데이터 모델 문서화
  - 시스템 워크플로우 및 프로젝트 구조 상세 설명