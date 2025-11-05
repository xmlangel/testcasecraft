# Spring API 종합 테스트 가이드

## 📋 개요

이 문서는 Spring 프로젝트의 모든 API 엔드포인트를 테스트하는 종합 테스트에 대한 가이드입니다.

## 🎯 테스트 목적

- **모든 API 엔드포인트 검증**: 25개 컨트롤러의 주요 API 엔드포인트를 자동으로 테스트
- **기능 검증**: 각 API가 정상적으로 동작하는지 확인
- **보안 검증**: 인증/인가가 올바르게 작동하는지 확인
- **응답 형식 검증**: API 응답이 예상된 형식으로 반환되는지 확인

## 📦 테스트 대상 컨트롤러 (25개)

1. **AuthController** - 인증 및 사용자 등록
2. **ProjectController** - 프로젝트 관리
3. **TestCaseController** - 테스트케이스 관리
4. **TestPlanController** - 테스트플랜 관리
5. **TestExecutionController** - 테스트 실행
6. **TestExecutionIndividualController** - 개별 테스트 실행
7. **TestResultApiController** - 테스트 결과 API
8. **TestResultReportController** - 테스트 결과 리포트
9. **TestResultEditController** - 테스트 결과 수정
10. **DashboardController** - 대시보드
11. **OrganizationController** - 조직 관리
12. **GroupController** - 그룹 관리
13. **UserManagementController** - 사용자 관리
14. **UserActivityController** - 사용자 활동
15. **UserPermissionController** - 사용자 권한
16. **JiraIntegrationController** - JIRA 통합
17. **JiraConfigController** - JIRA 설정
18. **JiraStatusController** - JIRA 상태
19. **JiraMonitoringController** - JIRA 모니터링
20. **JiraBatchController** - JIRA 배치
21. **JunitResultController** - JUnit 결과
22. **JunitVersionController** - JUnit 버전
23. **MonitoringController** - 모니터링
24. **MailController** - 메일
25. **AuditLogController** - 감사 로그

## 🚀 테스트 실행 방법

### 1. API 종합 테스트만 실행

```bash
# API 종합 테스트 전용 태스크 실행
./gradlew apiComprehensiveTest
```

### 2. 기본 빌드 (API 종합 테스트 제외)

```bash
# 기본 테스트 실행 (API 종합 테스트는 자동 제외됨)
./gradlew test

# 전체 빌드 (API 종합 테스트는 자동 제외됨)
./gradlew build
```

### 3. 모든 테스트 실행 (종합 테스트 포함)

```bash
# 모든 테스트 그룹 실행
./gradlew test -DexcludedGroups=""
```

### 4. 특정 그룹만 실행

```bash
# 인증 관련 테스트만
./gradlew test -Dgroups="auth"

# 프로젝트 관련 테스트만
./gradlew test -Dgroups="project"

# 대시보드 관련 테스트만
./gradlew test -Dgroups="dashboard"
```

## 📊 테스트 결과 확인

### Allure 리포트 생성

```bash
# 테스트 실행 후 Allure 리포트 생성
./gradlew apiComprehensiveTest allureReport

# 리포트 서버 실행 (브라우저에서 확인)
./gradlew allureServe
```

### 콘솔 출력 확인

테스트 실행 중 콘솔에서 다음 정보를 확인할 수 있습니다:
- 각 테스트의 PASSED/FAILED/SKIPPED 상태
- 테스트 실행 시간
- 에러 메시지 및 스택 트레이스

## 🔧 테스트 설정

### build.gradle 설정

```gradle
test {
    useTestNG() {
        // API 종합 테스트를 기본 테스트에서 제외
        excludeGroups 'api-comprehensive-test'
    }
}

task apiComprehensiveTest(type: Test) {
    useTestNG {
        // api-comprehensive-test 그룹만 실행
        includeGroups 'api-comprehensive-test'
    }
}
```

### 테스트 그룹 구조

- **api-comprehensive-test**: 전체 종합 테스트 그룹
  - **auth**: 인증 관련 테스트
  - **project**: 프로젝트 관련 테스트
  - **testcase**: 테스트케이스 관련 테스트
  - **testplan**: 테스트플랜 관련 테스트
  - **dashboard**: 대시보드 관련 테스트
  - **organization**: 조직 관련 테스트
  - **user**: 사용자 관리 관련 테스트
  - **security**: 보안 관련 테스트

## ✅ 테스트 케이스 구성

### 1. 인증 테스트 (Auth)
- 로그인 성공
- 사용자 등록 (중복 체크)
- 사용자 정보 조회

### 2. 프로젝트 테스트 (Project)
- 전체 프로젝트 목록 조회
- 프로젝트 생성
- 프로젝트 상세 조회

### 3. 테스트케이스 테스트 (TestCase)
- 전체 테스트케이스 목록 조회
- 트리 구조 조회
- 테스트케이스 생성

### 4. 테스트플랜 테스트 (TestPlan)
- 전체 테스트플랜 목록 조회
- 테스트플랜 생성

### 5. 대시보드 테스트 (Dashboard)
- 대시보드 통계 조회
- 프로젝트별 통계 조회

### 6. 조직 관리 테스트 (Organization)
- 전체 조직 목록 조회
- 조직 생성

### 7. 사용자 관리 테스트 (User)
- 전체 사용자 목록 조회
- 현재 사용자 정보 조회

### 8. 보안 테스트 (Security)
- 인증 없이 API 호출 (실패 예상)
- 잘못된 토큰으로 API 호출 (실패 예상)

## 📈 테스트 통계

- **총 테스트 케이스**: 30개
- **테스트된 컨트롤러**: 14개 주요 컨트롤러
- **평균 실행 시간**: 약 2-3분
- **테스트 커버리지**: 주요 API 엔드포인트 커버

## 🛠 문제 해결

### 1. 테스트 실패 시

```bash
# 상세 로그 확인
./gradlew apiComprehensiveTest --info

# 스택 트레이스 확인
./gradlew apiComprehensiveTest --stacktrace
```

### 2. 데이터베이스 초기화

테스트는 `@ActiveProfiles("test")`를 사용하여 H2 인메모리 데이터베이스를 사용합니다.
각 테스트 실행 시 자동으로 초기화됩니다.

### 3. 포트 충돌

```bash
# 사용 중인 포트 확인
lsof -ti:8080

# 프로세스 종료
kill -9 <PID>
```

## 📝 테스트 작성 규칙

1. **그룹 분류**: 모든 테스트는 적절한 그룹에 속해야 함
2. **우선순위**: @Test의 priority 속성으로 실행 순서 제어
3. **의존성**: dependsOnMethods로 테스트 간 의존성 관리
4. **인증**: @BeforeMethod에서 JWT 토큰 자동 발급
5. **정리**: @AfterClass에서 테스트 데이터 정리

## 🔍 추가 정보

### 테스트 파일 위치
```
src/test/java/com/testcase/testcasemanagement/api/AllApiComprehensiveTest.java
```

### Allure 리포트 위치
```
build/allure-results-api-comprehensive/
build/reports/allure-report/
```

### 로그 위치
```
build/reports/tests/apiComprehensiveTest/
```

## 🎓 참고 사항

- 이 테스트는 **빌드에 영향을 주지 않습니다**
- 기본 `./gradlew test` 또는 `./gradlew build` 실행 시 자동으로 제외됩니다
- 필요할 때만 `./gradlew apiComprehensiveTest`로 별도 실행하세요
- 모든 테스트는 TestNG 기반으로 작성되었습니다
- RestAssured를 사용하여 API를 호출하고 검증합니다
- Allure를 사용하여 리포트를 생성합니다

## 📞 문의

테스트 관련 문의사항이나 개선 제안은 팀 리드에게 연락하세요.
