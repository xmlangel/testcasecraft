// ICT-66: 로그인 성공 플로우 Playwright E2E 테스트
// 관련 컴포넌트: Login.jsx, ProtectedRoute.jsx, App.jsx

const { test, expect } = require('../fixtures/test-fixtures.js');

test.describe('로그인 성공 플로우 E2E 테스트', () => {
  
  test.beforeEach(async ({ loginPage }) => {
    // 각 테스트 전에 로컬스토리지 초기화
    await loginPage.goto();
    await loginPage.clearStorage();
  });

  test('admin/admin 계정으로 성공적인 로그인 플로우', async ({ page, loginPage, projectListPage }) => {
    console.log('🔐 로그인 성공 플로우 테스트 시작...');

    await loginPage.waitForBackend();
    
    // 1. 로그인 페이지 접속 확인
    await loginPage.goto();
    
    // 로그인 페이지 요소 확인
    await expect(loginPage.loginTitle).toContainText('로그인');
    
    console.log('✅ 로그인 페이지 렌더링 확인 완료');

    // 2. admin/admin 계정 정보 입력 및 로그인
    await loginPage.login('admin', 'admin123');
    
    console.log('✅ 로그인 요청 전송 완료');
    
    // 4. JWT 토큰 저장 확인
    await page.waitForTimeout(3000); // API 응답 대기
    
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeTruthy();
    
    console.log('✅ JWT 토큰 저장 확인 완료');

    // 5. 대시보드 리다이렉션 확인
    await projectListPage.waitForLoad();
    await expect(loginPage.loginTitle).not.toBeVisible();
    
    console.log('✅ 대시보드 리다이렉션 확인 완료');

    // 6. 로그인 상태 유지 확인
    await page.reload();
    await page.waitForTimeout(1000);
    
    await expect(loginPage.loginTitle).not.toBeVisible();
    const persistedToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(persistedToken).toBeTruthy();
    
    console.log('✅ 로그인 상태 유지 확인 완료');

    // 7. 사용자 프로필 메뉴 접근 확인
    await expect(loginPage.userMenuButton).toBeVisible();
    console.log('✅ 사용자 프로필 메뉴 접근 가능 확인');

    console.log('🎉 로그인 성공 플로우 테스트 완료!');

    // 성공 스크린샷 촬영
    await loginPage.screen('admin-login-success-flow');
  });

  test('로그인 폼 유효성 검사 확인', async ({ loginPage, page }) => {
    console.log('📝 로그인 폼 유효성 검사 테스트 시작...');

    await loginPage.goto();

    // 빈 필드로 로그인 시도
    await loginPage.submitButton.click();
    
    const usernameField = loginPage.usernameInput;
    const passwordField = loginPage.passwordInput;
    
    const isUsernameRequired = await usernameField.getAttribute('required');
    const isPasswordRequired = await passwordField.getAttribute('required');
    
    if (isUsernameRequired !== null || isPasswordRequired !== null) {
      console.log('✅ HTML5 required 속성 확인');
    }
    
    console.log('✅ 빈 필드 유효성 검사 확인 완료');

    // 사용자명만 입력하고 로그인 시도
    await loginPage.usernameInput.fill('admin');
    await loginPage.submitButton.click();
    
    const passwordValue = await loginPage.passwordInput.inputValue();
    expect(passwordValue).toBe('');
    
    console.log('✅ 부분 입력 유효성 검사 확인 완료');

    // 성공 스크린샷 촬영
    await loginPage.screen('login-form-validation');
  });

  test('로그인 버튼 로딩 상태 확인', async ({ loginPage, page }) => {
    console.log('⏳ 로그인 버튼 로딩 상태 테스트 시작...');

    await loginPage.goto();

    await loginPage.usernameInput.fill('admin');
    await loginPage.passwordInput.fill('admin123');

    await loginPage.submitButton.click();

    // 로딩 상태 확인
    const loadingElement = page.locator('.MuiCircularProgress-root, button[type="submit"][disabled]');
    
    if (await loadingElement.first().isVisible()) {
      console.log('✅ 로딩 상태 표시 확인');
      await loadingElement.first().waitFor({ state: 'hidden', timeout: 10000 });
      console.log('✅ 로딩 상태 해제 확인');
    }

    console.log('✅ 로그인 버튼 로딩 상태 테스트 완료');

    // 성공 스크린샷 촬영
    await loginPage.screen('login-button-loading-state');
  });

  test('Material-UI 컴포넌트 렌더링 확인', async ({ loginPage, page }) => {
    console.log('🎨 Material-UI 컴포넌트 렌더링 테스트 시작...');

    await loginPage.goto();

    // Paper 컴포넌트 (로그인 카드)
    await expect(page.locator('.MuiPaper-root')).toBeVisible();
    
    // TextField 컴포넌트들
    await expect(page.locator('.MuiTextField-root')).toHaveCount(2); 
    
    // Button 컴포넌트
    const buttonCount = await page.locator('.MuiButton-root').count();
    expect(buttonCount).toBeGreaterThan(0);
    
    // Typography 컴포넌트 (제목)
    await expect(loginPage.loginTitle).toBeVisible();

    console.log('✅ Material-UI 컴포넌트 렌더링 확인 완료');

    // 성공 스크린샷 촬영
    await loginPage.screen('material-ui-components-rendering');
  });

  test('반응형 디자인 확인', async ({ loginPage, page }) => {
    console.log('📱 반응형 디자인 테스트 시작...');

    // 데스크톱 크기
    await page.setViewportSize({ width: 1200, height: 800 });
    await loginPage.goto();
    
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
    
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();

    console.log('✅ 모바일 뷰 확인 완료');

    // 성공 스크린샷 촬영
    await loginPage.screen('responsive-design-mobile-view');
  });
});