# Development Guide (최종 업데이트: 2025-08-04)

개발 환경 설정 및 워크플로우 가이드입니다.

## 📋 목차

1. [개발 환경 설정](#-개발-환경-설정)
2. [백엔드 개발 워크플로우](#-백엔드-개발-워크플로우)
3. [프론트엔드 개발 워크플로우](#-프론트엔드-개발-워크플로우)
4. [데이터베이스 관리](#-데이터베이스-관리)
5. [개발 팁](#-개발-팁)

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

- **2025-08-04**: 초기 문서 작성
  - 개발 환경 설정 가이드 작성
  - H2 데이터베이스 워크플로우 문서화
  - 백엔드/프론트엔드 개발 패턴 정리