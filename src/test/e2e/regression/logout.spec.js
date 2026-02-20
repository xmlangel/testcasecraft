/**
 * 로그아웃 회귀 테스트 절차:
 * 1. 초기 로그인 수행 (admin 계정)
 * 2. '/projects' 페이지 진입 확인
 * 3. 우측 상단 사용자 메뉴(user menu) 버튼 클릭
 * 4. '로그아웃' 메뉴 아이템 선택
 * 5. 로그인 페이지로의 리다이렉션 및 로컬 스토리지 내 accessToken 제거 확인
 */

const { test, expect } = require('../fixtures/test-fixtures.js');
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require('../config/credentials.js');

test.describe('로그아웃 회귀 테스트', () => {

  test('로그인 후 로그아웃 성공 플로우', async ({ loginPage, projectListPage, page }) => {
    // 1. 로그인
    await loginPage.goto();
    await loginPage.clearStorage();
    await loginPage.waitForBackend();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await projectListPage.waitForLoad();
    await projectListPage.screen('06-redirected-to-projects');

    // 2. 로그아웃
    await loginPage.logout();
    await loginPage.screen('09-logout-clicked');

    // 로그아웃 후 로그인 페이지로 리다이렉션 확인
    await expect(loginPage.loginTitle).toBeVisible();
    await loginPage.screen('10-redirected-to-login-page');

    // JWT 토큰이 로컬 스토리지에서 제거되었는지 확인
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeNull();
    await loginPage.screen('11-access-token-null');
  });
});