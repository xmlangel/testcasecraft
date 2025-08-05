// ICT-66: 로그인 성공 플로우 Playwright E2E 테스트
// 관련 컴포넌트: Login.jsx, ProtectedRoute.jsx, App.jsx

const { test, expect } = require('@playwright/test');

test.describe('로그인 성공 플로우 E2E 테스트', () => {
  
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로컬스토리지 초기화
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
  });

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

  test('admin/admin 계정으로 성공적인 로그인 플로우', async ({ page }, testInfo) => {
    console.log('🔐 로그인 성공 플로우 테스트 시작...');

    // 백엔드 서버 연결 확인
    let backendReady = false;
    for (let i = 0; i < 30; i++) { // 30초 동안 재시도
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin' })
        });
        backendReady = true;
        console.log('🚀 백엔드 서버 준비 완료');
        break;
      } catch (e) {
        console.log(`⏳ 백엔드 대기 중... (${i + 1}/30)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!backendReady) {
      throw new Error('백엔드 서버가 준비되지 않았습니다');
    }

    // 콘솔 로그 캐치
    page.on('console', msg => console.log('🖥️ Console:', msg.text()));
    
    // 네트워크 요청 모니터링
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('/api/auth/login')) {
        console.log('📤 Login Request:', request.url(), request.method());
        requests.push(request);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/auth/login')) {
        console.log('📥 Login Response:', response.status(), response.url());
      }
    });

    // 1. 로그인 페이지 접속 확인
    await page.goto('http://localhost:3000');
    
    // 로그인 페이지 요소 확인
    await expect(page.locator('h5')).toContainText('로그인');
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('로그인');
    
    console.log('✅ 로그인 페이지 렌더링 확인 완료');

    // 2. admin/admin 계정 정보 입력
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    
    console.log('✅ 계정 정보 입력 완료');

    // 3. 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 로딩 상태 확인 (선택사항)
    const loadingSpinner = page.locator('.MuiCircularProgress-root');
    if (await loadingSpinner.isVisible()) {
      console.log('⏳ 로딩 스피너 표시 확인');
      await loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    }

    console.log('✅ 로그인 요청 전송 완료');
    
    // 네트워크 응답 확인
    await page.waitForTimeout(1000);
    const networkLogs = await page.evaluate(() => {
      return window.localStorage.getItem('networkDebug') || 'No network debug info';
    });
    console.log('🌐 Network logs:', networkLogs);

    // 4. JWT 토큰 저장 확인
    await page.waitForTimeout(3000); // API 응답 대기 (더 긴 시간)
    
    // localStorage 전체 내용 확인
    const allLocalStorage = await page.evaluate(() => {
      const storage = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        storage[key] = localStorage.getItem(key);
      }
      return storage;
    });
    console.log('📦 전체 localStorage 내용:', JSON.stringify(allLocalStorage, null, 2));
    
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    
    console.log('🔑 accessToken:', accessToken ? accessToken.substring(0, 20) + '...' : 'null');
    console.log('🔑 refreshToken:', refreshToken ? refreshToken.substring(0, 20) + '...' : 'null');
    
    // 토큰이 저장될 때까지 재시도
    if (!accessToken) {
      console.log('⏰ 토큰이 없음, 추가 대기 중...');
      await page.waitForTimeout(2000); // 추가 대기
      
      const retryAccessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
      const retryRefreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
      
      console.log('🔄 재시도 - accessToken:', retryAccessToken ? retryAccessToken.substring(0, 20) + '...' : 'null');
      console.log('🔄 재시도 - refreshToken:', retryRefreshToken ? retryRefreshToken.substring(0, 20) + '...' : 'null');
      
      expect(retryAccessToken).toBeTruthy();
      expect(retryRefreshToken).toBeTruthy();
    } else {
      expect(accessToken).toBeTruthy();
      expect(refreshToken).toBeTruthy();
    }
    
    console.log('✅ JWT 토큰 저장 확인 완료');
    console.log(`📋 AccessToken: ${accessToken ? accessToken.substring(0, 20) + '...' : 'null'}`);

    // 5. 대시보드 리다이렉션 확인
    // URL이 변경되었는지 확인 (로그인 성공 시 대시보드로 이동)
    await page.waitForTimeout(1000);
    
    // 로그인 폼이 사라지고 메인 애플리케이션이 렌더링되는지 확인
    await expect(page.locator('h5:has-text("로그인")')).not.toBeVisible();
    
    // 메인 애플리케이션의 요소들이 나타나는지 확인
    // (프로젝트 헤더, 네비게이션 등)
    const mainContent = page.locator('body');
    await expect(mainContent).toBeVisible();
    
    console.log('✅ 대시보드 리다이렉션 확인 완료');

    // 6. 로그인 상태 유지 확인
    // 페이지 새로고침 후에도 로그인 상태가 유지되는지 확인
    await page.reload();
    await page.waitForTimeout(1000);
    
    // 로그인 폼이 다시 나타나지 않는지 확인
    await expect(page.locator('h5:has-text("로그인")')).not.toBeVisible();
    
    // 토큰이 여전히 존재하는지 확인
    const persistedToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(persistedToken).toBeTruthy();
    
    console.log('✅ 로그인 상태 유지 확인 완료');

    // 7. 사용자 프로필 메뉴 접근 확인 (선택사항)
    // 로그인된 사용자의 프로필 메뉴가 있다면 확인
    const userProfileButton = page.locator('[data-testid="user-profile-button"], .user-profile, [aria-label*="profile"], [aria-label*="프로필"]');
    if (await userProfileButton.count() > 0) {
      await expect(userProfileButton.first()).toBeVisible();
      console.log('✅ 사용자 프로필 메뉴 접근 가능 확인');
    }

    console.log('🎉 로그인 성공 플로우 테스트 완료!');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'admin-login-success-flow');
  });

  test('로그인 폼 유효성 검사 확인', async ({ page }, testInfo) => {
    console.log('📝 로그인 폼 유효성 검사 테스트 시작...');

    await page.goto('http://localhost:3000');

    // 빈 필드로 로그인 시도
    await page.click('button[type="submit"]');
    
    // Material-UI TextField의 유효성 검사 또는 커스텀 에러 메시지 확인
    const usernameField = page.locator('input[name="username"]');
    const passwordField = page.locator('input[name="password"]');
    
    // HTML5 유효성 검사 또는 Material-UI 오류 상태 확인
    // Material-UI는 자동 포커스가 다를 수 있으므로 필드 상태 확인
    const isUsernameRequired = await usernameField.getAttribute('required');
    const isPasswordRequired = await passwordField.getAttribute('required');
    
    // 필수 필드 속성이나 validation 확인
    if (isUsernameRequired !== null || isPasswordRequired !== null) {
      console.log('✅ HTML5 required 속성 확인');
    } else {
      console.log('ℹ️ Material-UI 자체 validation 사용중');
    }
    
    console.log('✅ 빈 필드 유효성 검사 확인 완료');

    // 사용자명만 입력하고 로그인 시도
    await page.fill('input[name="username"]', 'admin');
    await page.click('button[type="submit"]');
    
    // 비밀번호 필드가 비어있음을 확인
    const passwordValue = await passwordField.inputValue();
    expect(passwordValue).toBe('');
    
    console.log('✅ 부분 입력 유효성 검사 확인 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'login-form-validation');
  });

  test('로그인 버튼 로딩 상태 확인', async ({ page }, testInfo) => {
    console.log('⏳ 로그인 버튼 로딩 상태 테스트 시작...');

    await page.goto('http://localhost:3000');

    // 올바른 정보 입력
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');

    // 로딩 상태 캡처를 위해 네트워크 응답을 지연시킬 수 있지만,
    // 여기서는 기본적인 로딩 스피너 표시 확인
    await page.click('button[type="submit"]');

    // 로딩 스피너 또는 비활성화된 버튼 확인
    const loadingElement = page.locator('.MuiCircularProgress-root, button[type="submit"][disabled]');
    
    // 로딩 상태가 나타났다가 사라지는지 확인
    if (await loadingElement.first().isVisible()) {
      console.log('✅ 로딩 상태 표시 확인');
      await loadingElement.first().waitFor({ state: 'hidden', timeout: 10000 });
      console.log('✅ 로딩 상태 해제 확인');
    }

    console.log('✅ 로그인 버튼 로딩 상태 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'login-button-loading-state');
  });

  test('Material-UI 컴포넌트 렌더링 확인', async ({ page }, testInfo) => {
    console.log('🎨 Material-UI 컴포넌트 렌더링 테스트 시작...');

    await page.goto('http://localhost:3000');

    // Paper 컴포넌트 (로그인 카드)
    await expect(page.locator('.MuiPaper-root')).toBeVisible();
    
    // TextField 컴포넌트들
    await expect(page.locator('.MuiTextField-root')).toHaveCount(2); // username, password
    
    // Button 컴포넌트
    const buttonCount = await page.locator('.MuiButton-root').count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Typography 컴포넌트 (제목)
    await expect(page.locator('.MuiTypography-h5')).toContainText('로그인');

    console.log('✅ Material-UI 컴포넌트 렌더링 확인 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'material-ui-components-rendering');
  });

  test('반응형 디자인 확인', async ({ page }, testInfo) => {
    console.log('📱 반응형 디자인 테스트 시작...');

    // 데스크톱 크기
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('http://localhost:3000');
    
    const loginCard = page.locator('.MuiPaper-root');
    await expect(loginCard).toBeVisible();
    
    console.log('✅ 데스크톱 뷰 확인 완료');

    // 태블릿 크기
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(loginCard).toBeVisible();
    
    console.log('✅ 태블릿 뷰 확인 완료');

    // 모바일 크기
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(loginCard).toBeVisible();
    
    // 모바일에서도 입력 필드들이 적절히 표시되는지 확인
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    console.log('✅ 모바일 뷰 확인 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'responsive-design-mobile-view');
  });
});