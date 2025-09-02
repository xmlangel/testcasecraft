// e2e-tests/regression/login.spec.js: 로그인 회귀 테스트
const { test, expect } = require('@playwright/test');

test.describe('로그인 회귀 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('admin/admin 계정으로 성공적인 로그인', async ({ page }) => {
    // 백엔드 서버 준비 확인 (기존 코드에서 복사)
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

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');

    // 대시보드 리다이렉션 확인
    await page.waitForURL('/projects');
    await expect(page.locator('h5:has-text("로그인")')).not.toBeVisible();
    const mainContent = page.locator('body');
    await expect(mainContent).toBeVisible();

    // JWT 토큰 저장 확인
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeTruthy();
  });
});
