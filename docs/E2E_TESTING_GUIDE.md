ㅓ# E2E Testing Guide (최종 업데이트: 2025-08-04)

이 문서는 Playwright를 사용한 E2E (End-to-End) 테스트 작성 및 실행 가이드입니다.

## 📋 목차

1. [E2E 테스트 개요](#-e2e-테스트-개요)
2. [환경 설정](#-환경-설정)
3. [테스트 실행 방법](#-테스트-실행-방법)
4. [테스트 작성 가이드](#-테스트-작성-가이드)
5. [성공 스크린샷 시스템](#-성공-스크린샷-시스템)
6. [트러블슈팅](#-트러블슈팅)

## 🎯 E2E 테스트 개요

### 테스트 목적
- **인증 플로우 검증**: 로그인/로그아웃/세션 관리
- **UI 컴포넌트 검증**: Material-UI 렌더링 및 반응형 디자인
- **사용자 플로우 검증**: 실제 사용자 시나리오 테스트
- **성능 검증**: 페이지 로딩 시간 및 반응성 측정

### 테스트 구조
```
e2e-tests/
├── authentication/          # 인증 관련 테스트
│   ├── login-success-test.js    # 로그인 성공 플로우
│   ├── login-failure-test.js    # 로그인 실패 케이스
│   ├── logout-test.js           # 로그아웃 플로우
│   └── session-management-test.js # 세션 관리
├── dashboard/               # 대시보드 관련 테스트
│   ├── dashboard-main-test.js       # 메인 대시보드
│   ├── statistics-widgets-test.js   # 통계 위젯
│   └── layout-navigation-test.js    # 레이아웃 및 네비게이션
├── playwright.config.js     # Playwright 설정
└── test-results/            # 테스트 결과 및 스크린샷
```

## 🔧 환경 설정

### 전제 조건
1. **Node.js**: Playwright 실행을 위한 Node.js 환경
2. **Java 21**: 백엔드 실행을 위한 Java 환경
3. **프로젝트 루트**: 모든 명령어는 프로젝트 루트에서 실행

### Playwright 설정
```javascript
// playwright.config.js
module.exports = {
  testDir: './e2e-tests',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
};
```

## 🚀 테스트 실행 방법

### ⚠️ 중요: 표준화된 실행 절차

**모든 E2E 테스트는 다음 순서를 반드시 따라야 합니다:**

#### 1. 프로젝트 루트 확인 및 이동 (필수)
⚠️ **모든 Playwright 명령어는 반드시 프로젝트 루트에서 실행해야 합니다.**

```bash
# 현재 디렉토리 확인
echo "📍 현재 위치: $(pwd)"

# 프로젝트 루트 경로 설정
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"

# 현재 위치가 프로젝트 루트인지 확인
if [ "$(pwd)" != "$PROJECT_ROOT" ]; then
    echo "⚠️  현재 위치가 프로젝트 루트가 아닙니다."
    echo "🔄 프로젝트 루트로 이동 중..."
    cd "$PROJECT_ROOT"
    echo "✅ 프로젝트 루트로 이동 완료: $(pwd)"
else
    echo "✅ 이미 프로젝트 루트에 위치합니다."
fi

# e2e-tests 디렉토리 존재 확인
if [ -d "e2e-tests" ]; then
    echo "✅ e2e-tests 디렉토리 확인됨"
else
    echo "❌ e2e-tests 디렉토리를 찾을 수 없습니다. 프로젝트 루트가 맞는지 확인해주세요."
    exit 1
fi
```

**간편 실행 스크립트:**
```bash
# 한 번에 확인하고 이동하는 함수
check_and_move_to_project_root() {
    PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
    
    if [ "$(pwd)" != "$PROJECT_ROOT" ]; then
        echo "🔄 프로젝트 루트로 이동: $PROJECT_ROOT"
        cd "$PROJECT_ROOT" || { echo "❌ 프로젝트 루트로 이동 실패"; exit 1; }
    fi
    
    if [ ! -d "e2e-tests" ]; then
        echo "❌ e2e-tests 디렉토리를 찾을 수 없습니다."
        exit 1
    fi
    
    echo "✅ 프로젝트 루트 확인 완료: $(pwd)"
}

# 함수 실행
check_and_move_to_project_root
```

#### 2. 백엔드 재시작 (필수)
H2 인메모리 데이터베이스 특성상 매번 백엔드를 재시작해야 합니다.

```bash
# 기존 프로세스 종료
pkill -f "bootRun"

# Java 21 환경 설정 후 재시작
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun > app.log 2>&1 &

# 백엔드 완전 시작 대기 (중요!)
sleep 25
```

#### 3. 테스트 실행
```bash
# 단일 테스트 파일 실행
npx playwright test e2e-tests/authentication/login-success-test.js --reporter=line

# 디렉토리별 테스트 실행
npx playwright test e2e-tests/authentication/ --reporter=line
npx playwright test e2e-tests/dashboard/ --reporter=line

# 안정성을 위한 단일 워커 실행
npx playwright test e2e-tests/authentication/login-failure-test.js --reporter=line --workers=1
```

#### 4. 모든 테스트 완료하면 Html 테스트 결과 확인
```bash
# 안정성을 위한 단일 워커 실행
npx playwright test e2e-tests/authentication/login-failure-test.js --reporter=html --workers=1

# HTML 리포트 자동 열기
npx playwright show-report

# 수동으로 리포트 확인
open playwright-report/index.html
```

### 테스트 실행 예시

#### 🔐 인증 테스트 실행
```bash
# ICT-66: 로그인 성공 플로우 테스트
npx playwright test e2e-tests/authentication/login-success-test.js --reporter=

# ICT-67: 로그인 실패 케이스 테스트
npx playwright test e2e-tests/authentication/login-failure-test.js --reporter=line
```

#### 📊 대시보드 테스트 실행
```bash
# ICT-70: 대시보드 메인 테스트
npx playwright test e2e-tests/dashboard/dashboard-main-test.js --reporter=line

# ICT-72: 통계 위젯 테스트 (완료)
npx playwright test e2e-tests/dashboard/statistics-widgets-test.js --reporter=line
```

## 📝 테스트 작성 가이드

### 기본 테스트 구조
```javascript
const { test, expect } = require('@playwright/test');

test('테스트명', async ({ page }, testInfo) => {
  // Given: 테스트 준비
  await page.goto('/');
  
  // When: 사용자 액션
  await page.fill('[data-testid="username"]', 'admin');
  await page.click('[data-testid="login-button"]');
  
  // Then: 결과 검증
  await expect(page).toHaveURL(/\/dashboard/);
  
  // 성공 스크린샷 촬영 (권장)
  await takeSuccessScreenshot(page, testInfo, 'login-success');
});
```

### 테스트 작성 규칙

#### 1. 네이밍 컨벤션
- **파일명**: `{기능명}-{테스트타입}-test.js`
- **테스트명**: 한국어로 명확한 설명
- **예시**: `login-success-test.js` → `'admin 계정으로 로그인 성공 테스트'`

#### 2. 필수 검증 항목
```javascript
// UI 요소 렌더링 확인
await expect(page.locator('.MuiButton-root')).toBeVisible();

// Material-UI 컴포넌트 개수 확인
const muiElements = await page.locator('[class*="Mui"]').count();
expect(muiElements).toBeGreaterThan(0);

// 반응형 디자인 확인
await page.setViewportSize({ width: 375, height: 667 }); // 모바일
await page.setViewportSize({ width: 1200, height: 800 }); // 데스크톱
```

#### 3. Playwright Strict Mode 준수
```javascript
// ❌ 잘못된 방법 (여러 요소 선택 시 오류)
await page.locator('.recharts-legend-wrapper');

// ✅ 올바른 방법 (첫 번째 요소 선택)
await page.locator('.recharts-legend-wrapper').first();
```

#### 4. 대기 및 타이밍 처리
```javascript
// 페이지 로딩 완료 대기
await page.waitForLoadState('networkidle');

// 특정 요소 대기
await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });

// JWT 토큰 저장 대기 (로그인 후)
await page.waitForFunction(() => localStorage.getItem('accessToken'));
```

### 테스트 카테고리별 가이드

#### 🔐 인증 테스트
```javascript
// 로그인 성공 테스트
test('admin 계정으로 로그인 성공', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.fill('[data-testid="username"]', 'admin');
  await page.fill('[data-testid="password"]', 'admin');
  await page.click('[data-testid="login-button"]');
  
  // JWT 토큰 저장 확인
  await page.waitForFunction(() => localStorage.getItem('accessToken'));
  
  // 대시보드 리디렉션 확인
  await expect(page).toHaveURL(/\/dashboard/);
  
  await takeSuccessScreenshot(page, testInfo, 'admin-login-success');
});
```

#### 📊 UI 컴포넌트 테스트
```javascript
// 차트 렌더링 테스트
test('PieChart 렌더링 확인', async ({ page }, testInfo) => {
  await page.goto('/dashboard');
  
  // PieChart 위젯 존재 확인
  const pieChartWidget = page.locator('[data-testid="piechart-widget"]');
  await expect(pieChartWidget).toBeVisible();
  
  // SVG 요소 확인
  const svgElement = pieChartWidget.locator('svg').first();
  await expect(svgElement).toBeVisible();
  
  // 범례 확인
  const legend = pieChartWidget.locator('.recharts-legend-wrapper').first();
  await expect(legend).toBeVisible();
  
  await takeSuccessScreenshot(page, testInfo, 'piechart-rendering');
});
```

## 📸 성공 스크린샷 시스템

### 개요
모든 테스트 성공 시 자동으로 스크린샷을 촬영하여 시각적 증거를 제공합니다.

### 헬퍼 함수
```javascript
// 성공 스크린샷 헬퍼 함수
async function takeSuccessScreenshot(page, testInfo, testName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = `test-results/success-screenshots/${testName}-${timestamp}.png`;
  
  await page.screenshot({ 
    path: screenshotPath, 
    fullPage: true 
  });
  
  // 테스트 정보에 첨부
  await testInfo.attach('success-screenshot', {
    path: screenshotPath,
    contentType: 'image/png'
  });
  
  console.log(`📸 성공 스크린샷 저장: ${screenshotPath}`);
  return screenshotPath;
}
```

### 사용법
```javascript
test('테스트명', async ({ page }, testInfo) => {
  // 테스트 로직...
  
  // 모든 검증 완료 후 성공 스크린샷 촬영
  await takeSuccessScreenshot(page, testInfo, 'meaningful-test-name');
});
```

### 스크린샷 명명 규칙
- `admin-login-success-flow`: 관리자 로그인 성공
- `material-ui-components-rendering`: Material-UI 렌더링
- `responsive-design-mobile-view`: 모바일 뷰 반응형
- `piechart-rendering`: PieChart 차트 렌더링
- `statistics-cards-display`: 통계 카드 표시

## 🔧 트러블슈팅

### 일반적인 문제 및 해결책

#### 1. 데이터베이스 제약조건 오류
**증상**: `constraint violation` 또는 `duplicate key` 오류
```bash
# 해결책: 백엔드 재시작
pkill -f "bootRun"
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun > app.log 2>&1 &
sleep 25
```

#### 2. Connection Refused 오류
**증상**: `ECONNREFUSED` 또는 `connect ECONNREFUSED 127.0.0.1:8080`
```bash
# 해결책: 백엔드 시작 대기 시간 증가
sleep 30  # 기본 25초에서 30초로 증가
```

#### 3. JWT 토큰 저장 실패
**증상**: 로그인 후 토큰이 localStorage에 저장되지 않음
```javascript
// 해결책: 재시도 로직 구현
await page.waitForFunction(
  () => localStorage.getItem('accessToken'),
  { timeout: 10000 }
);
```

#### 4. Playwright Strict Mode 위반
**증상**: `locator resolved to X elements` 오류
```javascript
// 해결책: .first() 사용
await page.locator('.recharts-legend-wrapper').first();
```

#### 5. 스크린샷 저장 실패
**증상**: 스크린샷 파일이 생성되지 않음
```bash
# 해결책: 디렉토리 권한 확인
mkdir -p test-results/success-screenshots
chmod 755 test-results/success-screenshots
```

### 디버깅 팁

#### 1. 헤드리스 모드 비활성화
```bash
# 브라우저 창을 보면서 테스트 실행
npx playwright test --headed e2e-tests/authentication/login-success-test.js
```

#### 2. 단계별 실행
```javascript
// 각 단계마다 스크린샷 촬영
await page.screenshot({ path: 'debug-step1.png' });
await page.fill('[data-testid="username"]', 'admin');
await page.screenshot({ path: 'debug-step2.png' });
```

#### 3. 로그 확인
```bash
# 백엔드 로그 실시간 확인
tail -f app.log

# 프론트엔드 로그 확인 (개발자 도구)
await page.evaluate(() => console.log('Debug message'));
```

## 📊 테스트 메트릭 및 리포팅

### 성능 기준치
- **로딩 시간**: <500ms (우수), <1000ms (양호)
- **UI 요소**: Material-UI 컴포넌트 정상 개수 유지
- **테스트 성공률**: >95%

### HTML 리포트 활용
```bash
# 리포트 확인
npx playwright show-report

# 리포트에서 확인 가능한 정보:
# - 테스트 결과 (✅ 성공/❌ 실패)
# - 실행 시간 및 브라우저 정보
# - 성공 스크린샷 (Attachments 섹션)
# - 실패 시 비디오 및 추적 정보
```

## 🔄 CI/CD 통합

### GitHub Actions 예시
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '21'
      
      - name: Start Backend
        run: |
          SPRING_PROFILES_ACTIVE=local ./gradlew bootRun &
          sleep 30
      
      - name: Run E2E Tests
        run: npx playwright test --reporter=html
      
      - name: Upload Test Results
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📚 관련 문서

- **[메인 가이드](../CLAUDE.md)** - 프로젝트 전체 개요
- **[E2E Epic 구조](./E2E_EPIC_STRUCTURE.md)** - E2E 테스트 Epic 상세 구조
- **[개발 가이드](./DEVELOPMENT_GUIDE.md)** - 개발 환경 설정

## 🔍 UI 구조 파악 및 네비게이션 테스트 가이드

### 애플리케이션 네비게이션 구조 (2025-08-18 업데이트)

**전체 네비게이션 플로우**:
```
로그인 → 대시보드 (/dashboard) → 프로젝트 선택 (/projects) → 개별 프로젝트 (/projects/{id}) → 탭 선택
```

**주요 페이지 구조**:
1. **로그인**: `/` → 대시보드로 리디렉션
2. **대시보드**: `/dashboard` → "프로젝트" 링크 클릭으로 프로젝트 선택 페이지 이동
3. **프로젝트 선택**: `/projects` → "프로젝트 열기" 버튼으로 개별 프로젝트 진입
4. **개별 프로젝트**: `/projects/{id}` → 6개 탭 (대시보드, 테스트케이스, 테스트플랜, 테스트실행, 테스트결과, 자동화 테스트)

### E2E 테스트 작성 시 UI 요소 선택자 가이드

#### 1. 로그인 관련 선택자
```javascript
// 로그인 폼 요소
await page.fill('input[name="username"]', 'admin');
await page.fill('input[name="password"]', 'admin');
await page.click('button[type="submit"]');

// 로그인 완료 대기 (대시보드 진입)
await page.waitForSelector('h1:has-text("대시보드")', { timeout: 30000 });
```

#### 2. 프로젝트 관련 선택자
```javascript
// 프로젝트 선택 페이지로 이동
await page.locator('text=프로젝트').first().click();

// 프로젝트 카드에서 "프로젝트 열기" 버튼
await page.locator('button:has-text("프로젝트 열기")').first().click();

// 프로젝트 내 탭 선택
await page.locator('text=자동화 테스트').first().click();
```

#### 3. 자동화 테스트 페이지 관련 선택자
```javascript
// 자동화 테스트 페이지 확인
const automationUrl = page.url();
const isAutomationPage = automationUrl.includes('/automation') || 
                        (await page.textContent('body')).includes('자동화');

// JUnit 결과 상세보기 버튼
const detailButtons = [
    'button:has-text("상세보기")',
    'button:has-text("보기")',
    'a:has-text("상세보기")'
];

// ICT-245 수정사항: "자동화 테스트로 돌아가기" 버튼
await page.locator('text=자동화 테스트로 돌아가기').first().click();
```

### 네비게이션 테스트 패턴

#### 표준 E2E 테스트 플로우
```javascript
async function standardE2EFlow(page) {
    // 1. 로그인
    await page.goto('/');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // 2. 프로젝트 선택 페이지로 이동
    await page.locator('text=프로젝트').first().click();
    await page.waitForLoadState('networkidle');
    
    // 3. 첫 번째 프로젝트 선택
    await page.locator('button:has-text("프로젝트 열기")').first().click();
    await page.waitForLoadState('networkidle');
    
    // 4. 자동화 테스트 탭으로 이동
    await page.locator('text=자동화 테스트').first().click();
    await page.waitForLoadState('networkidle');
    
    return page;
}
```

### 일반적인 대기 패턴
```javascript
// 페이지 로딩 완료 대기
await page.waitForLoadState('networkidle');
await page.waitForTimeout(3000); // 추가 대기

// URL 변경 확인
const expectedUrl = '/projects/';
await expect(page).toHaveURL(new RegExp(expectedUrl));

// 요소 개수 확인
const projectCount = await page.locator('button:has-text("프로젝트 열기")').count();
console.log(`📋 ${projectCount}개 프로젝트 발견`);
```

## 📝 업데이트 이력

- **2025-08-18**: ICT-245 네비게이션 테스트 가이드 추가
  - UI 구조 파악 및 네비게이션 플로우 문서화
  - 표준 E2E 테스트 플로우 패턴 추가
  - 선택자 가이드 및 대기 패턴 문서화
- **2025-08-04**: 초기 문서 작성
  - Playwright E2E 테스트 가이드 작성
  - 성공 스크린샷 시스템 문서화
  - 트러블슈팅 가이드 추가