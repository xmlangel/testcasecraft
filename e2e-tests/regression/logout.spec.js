// e2e-tests/regression/logout.spec.js: 로그아웃 회귀 테스트
const { test, expect } = require('@playwright/test');
const { takeStepScreenshot } = require('../utils/testUtils.js');

test.describe('로그아웃 회귀 테스트', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await takeStepScreenshot(page, testInfo, '01-initial-page');
  });

  test('로그인 후 로그아웃 성공 플로우', async ({ page }, testInfo) => {
    // 1. 로그인
    // 백엔드 서버 준비 확인 (login.spec.js에서 복사)
    let backendReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch(`http://localhost:8080/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin' })
        });
        backendReady = true;
        break;
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    if (!backendReady) {
      throw new Error('백엔드 서버가 준비되지 않았습니다');
    }
    await takeStepScreenshot(page, testInfo, '02-backend-ready');

    await page.fill('input[name="username"]', 'admin');
    await takeStepScreenshot(page, testInfo, '03-username-filled');

    await page.fill('input[name="password"]', 'admin');
    await takeStepScreenshot(page, testInfo, '04-password-filled');

    await page.click('button[type="submit"]');
    await takeStepScreenshot(page, testInfo, '05-after-login-click');

    // 로그인 성공 확인
    await page.waitForURL('/projects');
    await takeStepScreenshot(page, testInfo, '06-redirected-to-projects');

    await expect(page.locator('h5:has-text("로그인")')).not.toBeVisible();
    await takeStepScreenshot(page, testInfo, '07-login-page-not-visible');

    // 2. 로그아웃
    // 사용자 아바타/메뉴 버튼 클릭
    await page.click('button[aria-label="user menu"]');
    await takeStepScreenshot(page, testInfo, '08-user-menu-clicked');

    // '로그아웃' 메뉴 아이템 클릭
    await page.waitForSelector('li:has-text("로그아웃")');
    await page.click('li:has-text("로그아웃")');
    await takeStepScreenshot(page, testInfo, '09-logout-clicked');

    // 로그아웃 후 로그인 페이지로 리다이렉션 확인
    await expect(page.locator('h5')).toContainText('로그인');
    await takeStepScreenshot(page, testInfo, '10-redirected-to-login-page');

    // JWT 토큰이 로컬 스토리지에서 제거되었는지 확인
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeNull();
    await takeStepScreenshot(page, testInfo, '11-access-token-null');
  });
});