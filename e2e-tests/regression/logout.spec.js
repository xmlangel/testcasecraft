// e2e-tests/regression/logout.spec.js: 로그아웃 회귀 테스트
const { test, expect } = require('@playwright/test');

test.describe('로그아웃 회귀 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
  });

  test('로그인 후 로그아웃 성공 플로우', async ({ page }) => {
    // 1. 로그인
    // 백엔드 서버 준비 확인 (login.spec.js에서 복사)
    let backendReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
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

    // 로그인 성공 확인
    await page.waitForURL('http://localhost:3000/projects'); // 또는 로그인 후 예상되는 URL
    await expect(page.locator('h5:has-text("로그인")')).not.toBeVisible();

    // 2. 로그아웃
    // 로그아웃 버튼 클릭 (애플리케이션에 맞게 셀렉터 조정 필요)
    // 예시: 사용자 프로필 메뉴를 열고 로그아웃 버튼 클릭
    // await page.click('[data-testid="user-profile-menu-button"]');
    // await page.click('[data-testid="logout-button"]');
    
    // 임시로 '로그아웃' 텍스트를 가진 버튼을 찾아서 클릭
    await page.click('button:has-text("로그아웃")'); 

    // 로그아웃 후 로그인 페이지로 리다이렉션 확인
    await page.waitForURL('http://localhost:3000/');
    await expect(page.locator('h5')).toContainText('로그인');

    // JWT 토큰이 로컬 스토리지에서 제거되었는지 확인
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeNull();
  });
});
