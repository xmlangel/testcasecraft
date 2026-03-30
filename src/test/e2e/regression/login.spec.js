/**
 * 로그인 회귀 테스트 절차:
 * 1. 초기 페이지 접속 및 로컬 스토리지 초기화
 * 2. 백엔드 서버 준비 상태 확인 (API 폴링)
 * 3. 아이디(admin) 및 비밀번호(admin123) 입력
 * 4. 로그인 버튼 클릭 및 '/projects' 페이지로의 리다이렉션 확인
 * 5. 로컬 스토리지에 accessToken이 정상적으로 저장되었는지 검증
 */

const { test, expect } = require("../fixtures/test-fixtures.js");
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require("../config/credentials.js");

test.describe("로그인 회귀 테스트", () => {
  test("admin/admin 계정으로 성공적인 로그인", async ({
    loginPage,
    projectListPage,
    page,
  }) => {
    await loginPage.goto();
    await loginPage.clearStorage();
    await loginPage.performLoginAndNavigate({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      loginPage,
      projectListPage,
    });
    await projectListPage.screen("05-redirected-to-projects");

    await expect(loginPage.loginTitle).not.toBeVisible();
    await expect(page.locator("body")).toBeVisible();
    await projectListPage.screen("06-projects-page-visible");

    // JWT 토큰 저장 확인
    const accessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    expect(accessToken).toBeTruthy();
  });
});
