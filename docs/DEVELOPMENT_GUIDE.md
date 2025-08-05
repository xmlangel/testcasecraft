# Development Guide (최종 업데이트: 2025-08-04)

개발 환경 설정 및 워크플로우 가이드입니다.

## 📋 목차

1. [개발 환경 설정](#-개발-환경-설정)
2. [백엔드 개발 워크플로우](#-백엔드-개발-워크플로우)
3. [프론트엔드 개발 워크플로우](#-프론트엔드-개발-워크플로우)
4. [데이터베이스 관리](#-데이터베이스-관리)
5. [테스트 주도 개발 (TDD) 가이드라인](#-테스트-주도-개발-tdd-가이드라인)
6. [개발 팁](#-개발-팁)

## 🛠 개발 환경 설정

### 필수 소프트웨어

#### Java 21 (필수)
```bash
# macOS 예시 - Amazon Corretto 21 설치
brew install --cask corretto21

# JAVA_HOME 설정 (필수)
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home

# 설정 확인
java -version
# 출력 예: openjdk version "21.0.7" 2024-04-16 LTS
```

#### Node.js & npm
```bash
# Node.js 설치 확인
node --version  # v18+ 권장
npm --version   # v9+ 권장

# 프론트엔드 의존성 설치
cd src/main/frontend
npm install
```

#### Git 설정
```bash
# 프로젝트 클론
git clone [repository-url]
cd test-case-manager-only-front-local-storage

# 브랜치 확인
git branch -a
git status
```

### IDE 설정 권장사항

#### IntelliJ IDEA
- **Java SDK**: 21로 설정
- **Gradle**: 프로젝트 루트의 Gradle 사용
- **플러그인**: Spring Boot, React, TypeScript

#### VS Code (프론트엔드)
- **확장**: ES7+ React/Redux/React-Native snippets, Prettier, ESLint
- **설정**: Prettier 자동 포맷팅 활성화

## 🎯 백엔드 개발 워크플로우

### 기본 개발 명령어

#### 애플리케이션 실행
```bash
# Java 21 환경 확인 (매번 필수)
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home

# 로컬 H2 데이터베이스로 실행
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun

# 백그라운드 실행 (로그 파일 저장)
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun > app.log 2>&1 &
```

#### 빌드 및 테스트
```bash
# 전체 프로젝트 빌드 (프론트엔드 포함)
./gradlew build

# 백엔드만 빌드
./gradlew compileJava

# Java 테스트 실행
./gradlew test

# Allure 리포트 생성
./gradlew test allureReport
```

### H2 데이터베이스 개발 워크플로우

#### ⚠️ 중요: H2 인메모리 특성 이해
H2 인메모리 데이터베이스는 애플리케이션 재시작 시 모든 데이터가 초기화됩니다.

**주요 특성:**
- 사용자 ID, 조직 ID 등이 매번 새로 생성됨
- 기존 JWT 토큰은 무효화됨
- API 테스트 시 항상 새로운 토큰과 ID 필요

#### 표준 개발 워크플로우

**1. 백엔드 코드 수정 후 재시작**
```bash
# 기존 프로세스 종료
pkill -f "bootRun"

# Java 21 환경 설정 후 재시작
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun > app.log 2>&1 &

# 시작 대기 (중요!)
sleep 25
```

**2. 새로운 JWT 토큰 발급**
```bash
# 새로운 액세스 토큰 발급
NEW_TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -s | jq -r '.accessToken')

echo "새 토큰: $NEW_TOKEN"
```

**3. 동적 리소스 ID 확인**
```bash
# 조직 목록에서 새로운 ID 확인
curl -H "Authorization: Bearer $NEW_TOKEN" \
  http://localhost:8080/api/organizations \
  -s | jq '.[] | {id, name}'
```

**4. API 테스트 수행**
```bash
# 새 토큰과 새 ID로 테스트
curl -H "Authorization: Bearer $NEW_TOKEN" \
  http://localhost:8080/api/organizations/{조직_ID} \
  -s | jq '.'
```

#### H2 콘솔 접속
```bash
# 브라우저에서 H2 콘솔 접속
open http://localhost:8080/h2-console

# 연결 정보
JDBC URL: jdbc:h2:mem:testdb
User Name: sa
Password: (비워둠)
```

### 백엔드 개발 패턴

#### 컨트롤러 개발
```java
@RestController
@RequestMapping("/api/example")
@PreAuthorize("hasRole('USER')")  // 보안 필수
public class ExampleController {
    
    @GetMapping
    @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
    public ResponseEntity<?> getExample(Authentication authentication) {
        String currentUser = authentication.getName();
        // 비즈니스 로직
        return ResponseEntity.ok(result);
    }
}
```

#### 서비스 개발
```java
@Service
@Transactional
public class ExampleService {
    
    private final ExampleRepository repository;
    
    public ExampleDto createExample(ExampleDto dto, String currentUser) {
        // 권한 검증
        // 비즈니스 로직
        // 엔티티 저장
        return result;
    }
}
```

#### 리포지토리 개발
```java
@Repository
public interface ExampleRepository extends JpaRepository<Example, Long> {
    
    @Query("SELECT e FROM Example e WHERE e.user.username = :username")
    List<Example> findByCurrentUser(@Param("username") String username);
}
```

## 🎨 프론트엔드 개발 워크플로우

### 개발 서버 실행
```bash
cd src/main/frontend

# 의존성 설치
npm install

# 개발 서버 시작 (포트 3000)
npm start

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test
```

### React 개발 패턴

#### 컴포넌트 구조
```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── atoms/          # 기본 원자 컴포넌트
│   ├── molecules/      # 분자 컴포넌트
│   └── organisms/      # 복합 컴포넌트
├── context/            # React Context
├── hooks/              # 커스텀 훅
├── services/           # API 서비스
├── utils/              # 유틸리티 함수
└── models/             # 데이터 모델
```

#### 컴포넌트 작성 예시
```jsx
import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Button, TextField, Box } from '@mui/material';

const ExampleComponent = ({ projectId }) => {
  const { apiCall } = useContext(AppContext);
  const [data, setData] = useState(null);
  
  const handleSubmit = async (formData) => {
    try {
      const result = await apiCall(`/api/projects/${projectId}/example`, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      setData(result);
    } catch (error) {
      console.error('API 호출 실패:', error);
    }
  };
  
  return (
    <Box>
      {/* Material-UI 컴포넌트 사용 */}
    </Box>
  );
};

export default ExampleComponent;
```

#### AppContext 활용
```jsx
// API 호출 시 AppContext 사용
const { apiCall, user, loading } = useContext(AppContext);

// 인증된 API 요청
const result = await apiCall('/api/protected-endpoint', {
  method: 'GET'
});
```

### 스타일링 가이드라인

#### Material-UI 테마 활용
```jsx
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// 컴포넌트에서 테마 사용
const useStyles = makeStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
  },
}));
```

#### 반응형 디자인
```jsx
import { useMediaQuery, useTheme } from '@mui/material';

const ExampleComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  return (
    <Box sx={{
      flexDirection: isMobile ? 'column' : 'row',
      padding: isMobile ? 1 : 2
    }}>
      {/* 반응형 콘텐츠 */}
    </Box>
  );
};
```

## 🗄 데이터베이스 관리

### 개발 환경 (H2)
```yaml
# application-local.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.h2.console.enabled=true
spring.jpa.hibernate.ddl-auto=create-drop
```

### 테스트 데이터 초기화
```java
@Component
@Profile("local")
public class DataInitializer implements CommandLineRunner {
    
    @Override
    public void run(String... args) throws Exception {
        // 테스트 사용자 생성
        createTestUsers();
        // 조직 및 프로젝트 생성
        createTestOrganizations();
        // 샘플 테스트케이스 생성
        createTestCases();
    }
}
```

### 마이그레이션 관리 (Flyway)
```sql
-- V1__Create_users_table.sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 테스트 주도 개발 (TDD) 가이드라인

### TDD 워크플로우 개요

**테스트 주도 개발(Test-Driven Development)**은 테스트를 먼저 작성하고, 테스트를 통과하는 코드를 작성하는 개발 방법론입니다.

#### 🔄 TDD 사이클
1. **Red**: 실패하는 테스트 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 품질 개선

### ✅ 단계별 TDD 실행 방법

#### 1단계: Claude에게 테스트 먼저 작성 요청하기
```
📝 사용자 요청 예시:
"테스트 주도 개발을 하고 있습니다. 
[기능 설명]에 대한 테스트를 먼저 작성해주세요.
예상되는 입력/출력 사례를 바탕으로 테스트만 작성하고, 
아직 구현 코드는 작성하지 마세요."
```

**중요한 점**: 
- **"테스트 주도 개발을 하고 있다"**고 Claude에게 명확히 알려주세요
- 그래야 아직 없는 기능에 대해 **추측성 구현(모킹)**을 하지 않고, 테스트만 정확히 작성합니다

#### 2단계: 테스트 실행 → 실패 확인
```
📝 사용자 지시 예시:
"작성한 테스트를 실행하고 실패하는지 확인해주세요.
아직 구현 코드는 작성하지 말고, 테스트 실행 결과만 확인해주세요."
```

**목적**: 테스트만 검증하고 넘어가게 하기 위함

#### 3단계: 테스트를 통과하는 코드 작성 지시
```
📝 사용자 지시 예시:
"이제 테스트를 통과하도록 코드를 작성해주세요.
조건:
- 테스트 코드는 수정하지 말 것
- 모든 테스트가 통과할 때까지 계속 반복
- 실패하는 테스트가 있으면 코드를 수정해서 다시 시도"
```

**특징**: Claude는 일반적으로 몇 번의 "코드 작성 → 테스트 실행 → 수정" 루프를 거쳐서 점점 개선해 나갑니다.

#### 4단계: (선택) Sub-agent로 검증 요청
```
📝 사용자 지시 예시:
"테스트에만 맞춘 오버피팅 코드가 아닌지 Sub-agent를 활용해 
추가 검증을 해주세요."
```

### 🎯 TDD 실행 예시

#### 백엔드 TDD 예시 (TestNG)
```java
// 1단계: 테스트 먼저 작성
@Test
public void should_create_project_successfully() {
    // Given
    ProjectCreateRequest request = new ProjectCreateRequest("Test Project", "Description");
    String currentUser = "admin";
    
    // When
    ProjectDto result = projectService.createProject(request, currentUser);
    
    // Then
    assertThat(result.getName()).isEqualTo("Test Project");
    assertThat(result.getDescription()).isEqualTo("Description");
    assertThat(result.getCreatedBy()).isEqualTo("admin");
}

// 2단계: 테스트 실행 → 실패 확인
// 3단계: 테스트를 통과하는 코드 작성
@Service
public class ProjectService {
    public ProjectDto createProject(ProjectCreateRequest request, String currentUser) {
        // 테스트를 통과하는 최소한의 구현
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setCreatedBy(currentUser);
        
        Project savedProject = projectRepository.save(project);
        return ProjectDto.from(savedProject);
    }
}
```

#### 프론트엔드 TDD 예시 (Jest)
```javascript
// 1단계: 테스트 먼저 작성
describe('ProjectForm Component', () => {
  test('should submit project data when form is valid', async () => {
    // Given
    const mockOnSubmit = jest.fn();
    render(<ProjectForm onSubmit={mockOnSubmit} />);
    
    // When
    fireEvent.change(screen.getByLabelText(/project name/i), {
      target: { value: 'Test Project' }
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    // Then
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Project',
        description: ''
      });
    });
  });
});

// 2단계: 테스트 실행 → 실패 확인
// 3단계: 테스트를 통과하는 컴포넌트 작성
const ProjectForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Project Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};
```

### 🔧 TDD 명령어 및 도구

#### 백엔드 TDD 명령어
```bash
# 특정 테스트 클래스만 실행
./gradlew test --tests "*ProjectServiceTest*"

# 테스트 후 리포트 생성
./gradlew test allureReport

# 테스트 감시 모드 (파일 변경 시 자동 실행)
./gradlew test --continuous
```

#### 프론트엔드 TDD 명령어
```bash
cd src/main/frontend

# Jest 테스트 감시 모드
npm test -- --watch

# 특정 테스트 파일만 실행
npm test -- ProjectForm.test.js

# 커버리지 리포트 생성
npm test -- --coverage
```

### 📋 TDD 체크리스트

#### ✅ 테스트 작성 시
- [ ] 테스트는 하나의 기능만 검증하는가?
- [ ] Given-When-Then 구조로 작성되었는가?
- [ ] 테스트 이름이 무엇을 검증하는지 명확한가?
- [ ] 테스트가 독립적으로 실행 가능한가?

#### ✅ 구현 코드 작성 시
- [ ] 모든 테스트가 통과하는가?
- [ ] 테스트를 통과하는 최소한의 코드인가?
- [ ] 추측성 구현이 아닌 테스트 기반 구현인가?
- [ ] 코드가 읽기 쉽고 유지보수가 가능한가?

#### ✅ 리팩토링 시
- [ ] 모든 테스트가 여전히 통과하는가?
- [ ] 코드 중복이 제거되었는가?
- [ ] 코드 구조가 개선되었는가?
- [ ] 성능이나 가독성이 향상되었는가?

### 🚫 TDD 주의사항

#### 피해야 할 것들
- **테스트 없이 구현 시작하기**: 항상 테스트부터 작성
- **복잡한 테스트 작성**: 단순하고 명확한 테스트 선호
- **구현 세부사항 테스트**: 동작과 결과에 집중
- **테스트 코드 수정**: 테스트는 고정하고 구현 코드만 수정

#### 권장사항
- **작은 단위로 진행**: 한 번에 하나의 작은 기능씩
- **빠른 피드백**: 테스트 실행이 빠르도록 유지
- **명확한 테스트 이름**: 무엇을 테스트하는지 명확히 표현
- **독립적인 테스트**: 테스트 간 의존성 제거

## 💡 개발 팁

### 디버깅 및 로깅

#### 백엔드 로깅
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ExampleService {
    private static final Logger logger = LoggerFactory.getLogger(ExampleService.class);
    
    public void someMethod() {
        logger.info("메서드 실행: {}", parameter);
        logger.debug("디버그 정보: {}", debugInfo);
        logger.error("오류 발생", exception);
    }
}
```

#### 프론트엔드 디버깅
```javascript
// 개발 환경에서만 로그 출력
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}

// React DevTools 활용
// Chrome Extension: React Developer Tools 설치
```

### 성능 최적화

#### 백엔드 최적화
```java
// JPA 쿼리 최적화
@Query("SELECT p FROM Project p JOIN FETCH p.users WHERE p.id = :id")
Project findByIdWithUsers(@Param("id") Long id);

// 페이징 처리
@GetMapping
public Page<ProjectDto> getProjects(Pageable pageable) {
    return projectService.findAll(pageable);
}
```

#### 프론트엔드 최적화
```jsx
import React, { memo, useMemo, useCallback } from 'react';

// 컴포넌트 메모이제이션
const OptimizedComponent = memo(({ data, onUpdate }) => {
  // 계산 비용이 큰 값 메모이제이션
  const processedData = useMemo(() => {
    return data.map(item => processItem(item));
  }, [data]);
  
  // 콜백 메모이제이션
  const handleClick = useCallback((id) => {
    onUpdate(id);
  }, [onUpdate]);
  
  return <div>{/* 컴포넌트 내용 */}</div>;
});
```

### 코드 품질 관리

#### ESLint 설정 (프론트엔드)
```json
// .eslintrc.json
{
  "extends": [
    "react-app",
    "react-app/jest"
  ],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "warn"
  }
}
```

#### Prettier 설정
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2
}
```

### 환경별 설정 관리

#### 백엔드 프로파일
```yaml
# application.yml
spring:
  profiles:
    active: local

---
# Local 환경
spring:
  profiles: local
  datasource:
    url: jdbc:h2:mem:testdb

---
# Test 환경
spring:
  profiles: test
  datasource:
    url: jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
```

#### 프론트엔드 환경 변수
```javascript
// .env.development
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_DEBUG=true

// .env.production
REACT_APP_API_URL=https://api.production.com/api
REACT_APP_DEBUG=false

// 사용법
const apiUrl = process.env.REACT_APP_API_URL;
```

---

## 📚 관련 문서

- **[메인 가이드](../CLAUDE.md)** - 프로젝트 전체 개요
- **[API 가이드](./API_GUIDE.md)** - API 개발 가이드라인
- **[E2E 테스트 가이드](./E2E_TESTING_GUIDE.md)** - E2E 테스트 작성 및 실행

## 📝 업데이트 이력

- **2025-08-04**: 초기 문서 작성 및 TDD 가이드라인 추가
  - 개발 환경 설정 가이드 작성
  - H2 데이터베이스 워크플로우 문서화
  - 백엔드/프론트엔드 개발 패턴 정리
  - **TDD 가이드라인 추가**: Claude와 함께하는 테스트 주도 개발 워크플로우