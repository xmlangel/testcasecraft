# GitHub Actions Workflows

이 디렉토리에는 프로젝트의 CI/CD 워크플로우가 포함되어 있습니다.

## 📋 워크플로우 목록

### 1. API Comprehensive Test (`api-comprehensive-test.yml`)

**목적**: 전체 API 종합 테스트 실행

**트리거**:
- `main`, `develop` 브랜치에 Push
- `claude/**` 패턴 브랜치에 Push
- Pull Request (main, develop 대상)
- 수동 실행 (workflow_dispatch)

**주요 기능**:
- ✅ 178개 API 테스트 실행
- ✅ Allure 리포트 생성
- ✅ 테스트 결과 아티팩트 업로드
- ✅ PR에 테스트 결과 코멘트 자동 추가
- ✅ JUnit 리포트 퍼블리시

**실행 시간**: 약 8-12분

**아티팩트**:
- `test-results`: 테스트 실행 결과
- `allure-report`: Allure HTML 리포트

---

### 2. PR Test Check (`test-on-pr.yml`)

**목적**: Pull Request 생성 시 빠른 테스트 검증

**트리거**:
- Pull Request (opened, synchronize, reopened)

**주요 기능**:
- ✅ 테스트 컴파일 검증
- ✅ 단위 테스트 실행 (API 종합 테스트 제외)
- ✅ 빠른 피드백 제공

**실행 시간**: 약 3-5분

**아티팩트**:
- `quick-test-results`: 단위 테스트 결과

---

### 3. Scheduled API Test (`scheduled-test.yml`)

**목적**: 정기적인 API 테스트 자동 실행

**트리거**:
- 매일 오전 9시 (UTC 0시) 자동 실행
- 수동 실행 (workflow_dispatch)

**주요 기능**:
- ✅ 일일 API 종합 테스트 실행
- ✅ 실패 시 자동으로 이슈 생성
- ✅ 90일간 테스트 결과 보관
- ✅ 일일 테스트 요약 생성

**실행 시간**: 약 8-12분

**아티팩트**:
- `daily-test-results-{run_number}`: 일일 테스트 결과 (90일 보관)

---

## 🚀 워크플로우 수동 실행 방법

### GitHub UI에서 실행

1. GitHub 리포지토리로 이동
2. **Actions** 탭 클릭
3. 왼쪽 사이드바에서 실행할 워크플로우 선택
4. **Run workflow** 버튼 클릭
5. 브랜치 선택 후 **Run workflow** 확인

### GitHub CLI로 실행

```bash
# API Comprehensive Test 실행
gh workflow run "API Comprehensive Test" --ref main

# Scheduled Test 수동 실행
gh workflow run "Scheduled API Test" --ref main

# PR Test Check 실행 (PR 브랜치에서)
gh workflow run "PR Test Check" --ref feature/my-branch
```

---

## 📊 테스트 결과 확인

### 1. GitHub Actions 페이지에서 확인

- **Actions** 탭 > 워크플로우 실행 클릭
- **Summary** 섹션에서 전체 요약 확인
- **Artifacts** 섹션에서 리포트 다운로드

### 2. 아티팩트 다운로드 및 확인

```bash
# GitHub CLI로 아티팩트 다운로드
gh run download <run-id> -n allure-report

# 로컬에서 Allure 리포트 열기
cd allure-report
# 브라우저로 index.html 열기
```

### 3. PR 코멘트에서 확인

- Pull Request에 자동으로 테스트 결과 코멘트가 추가됨
- 테스트 통계 및 링크 제공

---

## 🔧 워크플로우 설정 커스터마이징

### 테스트 실행 시간 조정

`scheduled-test.yml` 파일에서 cron 표현식 수정:

```yaml
schedule:
  - cron: '0 0 * * *'  # 매일 UTC 0시 (한국시간 오전 9시)
  # - cron: '0 */6 * * *'  # 6시간마다
  # - cron: '0 0 * * 1'  # 매주 월요일
```

### 테스트 타임아웃 설정

각 워크플로우 파일의 `jobs` 섹션에 추가:

```yaml
jobs:
  api-test:
    timeout-minutes: 30  # 30분 타임아웃
```

### 특정 브랜치에서만 실행

`on.push.branches` 섹션 수정:

```yaml
on:
  push:
    branches:
      - main
      - develop
      # 원하는 브랜치 패턴 추가
```

---

## 📈 테스트 커버리지 정보

### API Comprehensive Test 통계

- **총 테스트 케이스**: 178개
- **테스트된 컨트롤러**: 25개 (전체)
- **100% 커버리지 컨트롤러**: 15개
- **엔드포인트 커버리지**: 76% (178/233)

### 100% 커버리지 달성 컨트롤러

1. AuthController (9/9)
2. TestPlanController (5/5)
3. JiraStatusController (5/5)
4. JiraBatchController (5/5)
5. TestCaseController (10/10)
6. TestResultApiController (10/10)
7. GroupController (12/12)
8. DashboardController (14/14)
9. UserPermissionController (21/21)
10. TestResultReportController (15/15)
11. JunitResultController (14/14)
12. JiraConfigController (11/11)
13. JiraIntegrationController (9/9)
14. AuditLogController (13/13)
15. MonitoringController (3/3)

---

## 🐛 문제 해결

### 워크플로우 실패 시

1. **Actions 탭에서 로그 확인**
   - 실패한 step 찾기
   - 에러 메시지 확인

2. **아티팩트 다운로드**
   - 상세 테스트 결과 확인
   - Allure 리포트로 실패 원인 분석

3. **로컬에서 재현**
   ```bash
   ./gradlew apiComprehensiveTest
   ```

### 캐시 문제

캐시가 문제인 경우 GitHub에서 수동으로 캐시 삭제:

1. **Settings** > **Actions** > **Caches**
2. 문제가 있는 캐시 삭제
3. 워크플로우 재실행

---

## 📚 관련 문서

- [API_COMPREHENSIVE_TEST_README.md](../../API_COMPREHENSIVE_TEST_README.md) - API 테스트 상세 가이드
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Gradle GitHub Actions](https://github.com/gradle/actions)
