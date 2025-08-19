# 개발 환경 빌드 및 실행 가이드

## 📋 개요

이 문서는 테스트케이스 관리 시스템의 **개발 환경** 빌드 및 실행 방법을 안내합니다.

## 🔧 사전 요구사항

### 필수 소프트웨어
- **Java 21** - OpenJDK 또는 Oracle JDK
- **Node.js** (20.13.1 이상) - 프론트엔드 빌드용
- **Git** - 소스코드 관리

### 선택적 소프트웨어 (권장)
- **PostgreSQL** - 운영환경과 동일한 DB 테스트용
- **Redis** - 캐싱 시스템 테스트용
- **Docker** - 컨테이너 기반 개발환경

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone <repository-url>
cd test-case-manager-only-front-local-storage
```

### 2. 개발 환경 실행 (원클릭)
```bash
# 개발용 스크립트 실행 (권장)
./start-dev.sh
```

**또는 Gradle 태스크 사용:**
```bash
# 개발용 빌드 + 실행
./gradlew bootRunDev
```

### 3. 애플리케이션 접속
- **프론트엔드**: http://localhost:8080
- **백엔드 API**: http://localhost:8080/api
- **H2 콘솔**: http://localhost:8080/h2-console
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **액추에이터**: http://localhost:8083/actuator

### 4. 기본 로그인
```
사용자명: admin
비밀번호: admin
```

## 📁 빌드 옵션

### 개발환경 빌드 태스크

#### 1. 전체 개발 빌드
```bash
# 프론트엔드 + 백엔드 개발용 빌드
./gradlew buildDev
```

#### 2. 프론트엔드만 빌드
```bash
# React 앱 개발용 빌드 (localhost:8080 API 기준)
./gradlew appNpmBuildDev
```

#### 3. 백엔드만 실행
```bash
# 개발 프로파일로 Spring Boot 실행
./gradlew bootRun --args="--spring.profiles.active=dev"
```

#### 4. 테스트 제외 빌드 (권장)
```bash
# 빠른 빌드를 위해 테스트 스킵
./gradlew build -x test

# 또는 깨끗한 빌드
./gradlew clean build -x test
```

### 운영환경 빌드
```bash
# 운영용 JAR 파일 생성
./gradlew bootJar

# 운영용 실행
java -jar build/libs/testcasemanagement-0.0.1-SNAPSHOT.jar
```

### ✅ 빌드 성공 확인
성공적인 빌드는 다음과 같이 표시됩니다:
```
BUILD SUCCESSFUL in 13s
10 actionable tasks: 7 executed, 3 up-to-date
```

## 🔧 개발 환경 설정

### 환경별 프로파일
- **dev** (기본값): H2 인메모리 DB, 개발용 설정
- **dev-postgresql**: PostgreSQL DB 사용
- **prod**: 운영환경용 설정

### 환경변수 설정
```bash
# 필수 환경변수 (개발환경)
export SPRING_PROFILES_ACTIVE=dev
export JIRA_ENCRYPTION_KEY="5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y="

# 선택적 환경변수
export REACT_APP_API_BASE_URL="http://localhost:8080"
```

## 🗃️ 데이터베이스 설정

### H2 데이터베이스 (개발 기본값)
- **위치**: `./data/testdb.mv.db`
- **접속**: http://localhost:8080/h2-console
- **JDBC URL**: `jdbc:h2:file:./data/testdb`
- **사용자명**: `sa`
- **비밀번호**: (공백)

### PostgreSQL (개발환경 선택사항)
```bash
# PostgreSQL 개발환경 실행
./gradlew bootRun --args="--spring.profiles.active=dev-postgresql"
```

**PostgreSQL 설정:**
```sql
CREATE DATABASE testcase_management;
CREATE USER testcase_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE testcase_management TO testcase_user;
```

## 🧪 테스트 실행

### 단위 테스트
```bash
# 모든 테스트 실행
./gradlew test

# 특정 테스트 클래스 실행
./gradlew test --tests "TestResultRepositoryImprovedTest"
```

### 성능 테스트
```bash
# 성능 테스트 실행 (ICT-130)
./gradlew performanceTest

# 부하 테스트 실행
./gradlew loadTest
```

### E2E 테스트
```bash
# Playwright E2E 테스트 실행
cd e2e-tests
node e2e-testcase-app.js
```

## 🔍 디버깅 및 모니터링

### 애플리케이션 로그
```bash
# 개발환경 로그 파일
tail -f ./logs/dev-application.log

# JIRA 감사 로그
tail -f ./logs/dev-jira-audit.log
```

### 성능 모니터링
- **메트릭**: http://localhost:8083/actuator/metrics
- **헬스체크**: http://localhost:8083/actuator/health
- **프로메테우스**: http://localhost:8083/actuator/prometheus

### H2 데이터베이스 콘솔
1. http://localhost:8080/h2-console 접속
2. JDBC URL: `jdbc:h2:file:./data/testdb`
3. 사용자명: `sa`, 비밀번호: (공백)
4. 연결 후 SQL 쿼리 실행 가능

## 🚨 문제 해결

### 포트 충돌 해결
```bash
# 사용 중인 프로세스 확인 및 종료
lsof -ti:8080 | xargs kill -9  # 메인 애플리케이션
lsof -ti:8083 | xargs kill -9  # 액추에이터
```

### 의존성 문제 해결
```bash
# Node.js 의존성 재설치
rm -rf src/main/frontend/node_modules
./gradlew appNpmInstall

# Gradle 캐시 클리어
./gradlew clean build
```

### 데이터베이스 초기화
```bash
# H2 데이터베이스 파일 삭제 (완전 초기화)
rm -f ./data/testdb.*

# 애플리케이션 재시작으로 자동 재생성
./start-dev.sh
```

### 메모리 부족 해결
```bash
# JVM 힙 메모리 증가
export JAVA_OPTS="-Xmx2g -Xms1g"
./gradlew bootRun
```

### Oracle/C3P0 라이브러리 오류 (해결됨 ✅)
이 오류는 이미 해결되었습니다. 만약 다시 발생하면:
```bash
# 1. AspectJ weaver 의존성 확인
# build.gradle에서 aspectjweaver가 주석처리되어 있는지 확인

# 2. HikariCP 명시적 설정 확인
# application-dev.yml에 type: com.zaxxer.hikari.HikariDataSource 설정 확인

# 3. 깨끗한 빌드
./gradlew clean build -x test
```

## 🔧 개발 도구 설정

### IDE 설정 (IntelliJ IDEA)
1. **프로젝트 열기**: `Open` → 프로젝트 루트 디렉토리 선택
2. **SDK 설정**: File → Project Structure → Project → SDK: Java 21
3. **Gradle 설정**: File → Settings → Build → Gradle → Gradle JVM: Java 21
4. **애노테이션 프로세싱**: Settings → Build → Compiler → Annotation Processors → 체크

### VSCode 설정
1. **Java Extension Pack** 설치
2. **Spring Boot Extension Pack** 설치
3. **ESLint** 및 **Prettier** 설정 (프론트엔드)

## 📋 개발 워크플로우

### 1. 새 기능 개발
```bash
# 1. 개발 환경 시작
./start-dev.sh

# 2. 기능 개발 (백엔드/프론트엔드)
# ... 코드 수정 ...

# 3. 핫 리로드 확인 (Spring Boot DevTools 자동 재시작)
# 프론트엔드 변경 시: ./gradlew appNpmBuildDev

# 4. 테스트 실행
./gradlew test

# 5. 브라우저에서 기능 확인
open http://localhost:8080
```

### 2. 디버깅
```bash
# 디버그 모드로 실행
./gradlew bootRun --debug-jvm

# 또는 환경변수로 디버그 활성화
export DEBUG=true
./start-dev.sh
```

### 3. 프론트엔드 개발
```bash
# React 개발 서버 (별도 실행 시)
cd src/main/frontend
npm start  # http://localhost:3000

# API 프록시는 package.json의 "proxy" 설정 사용
```

## 📚 추가 리소스

### 설정 파일
- `src/main/resources/application.yml` - 공통 설정
- `src/main/resources/application-dev.yml` - 개발환경 설정
- `src/main/frontend/package.json` - 프론트엔드 의존성
- `build.gradle` - 빌드 설정 및 태스크

### 문서
- `CLAUDE.md` - 전체 프로젝트 가이드
- `docs/JIRA_INTEGRATION.md` - JIRA 연동 상세 가이드
- `docker-redis-guide.md` - Redis 캐싱 시스템 가이드

### 스크립트
- `start-dev.sh` - 개발환경 시작 스크립트
- `start-prod.sh` - 운영환경 시작 스크립트
- `deploy-*.sh` - Docker 기반 배포 스크립트

## 💡 개발 팁

### 빠른 개발을 위한 팁
1. **Spring Boot DevTools** 활용으로 자동 재시작
2. **H2 콘솔**로 실시간 데이터 확인
3. **Swagger UI**로 API 테스트
4. **Gradle daemon** 사용으로 빌드 속도 향상

### 성능 최적화
1. **Redis** 사용으로 캐싱 성능 향상
2. **HikariCP** 명시적 설정으로 DB 연결 최적화
3. **Gradle 병렬 빌드** 활성화

### 코드 품질
1. **TestNG** 기반 단위 테스트 작성
2. **Allure** 리포팅으로 테스트 결과 확인
3. **Spring Boot Actuator**로 메트릭 모니터링

---

🎯 **개발 환경이 준비되었습니다!** 

추가 질문이나 문제가 있으면 `CLAUDE.md` 파일을 참조하거나 팀에 문의하세요.