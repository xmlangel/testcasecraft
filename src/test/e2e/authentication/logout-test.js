/**
 * 로그아웃 플로우 E2E 테스트
 * ICT-68: 로그아웃 기능의 다양한 시나리오 테스트
 */

const { test, expect } = require("@playwright/test");

// 성공 스크린샷을 찍는 헬퍼 함수
async function takeSuccessScreenshot(page, testInfo, testName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${testName}-${timestamp}.png`;
  const screenshotPath = `test-results/success-screenshots/${filename}`;

  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  // Playwright 리포트에 스크린샷 첨부
  await testInfo.attach(filename, {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });

  console.log(`✅ 성공 스크린샷 저장: ${screenshotPath}`);
}

test.describe("로그아웃 플로우 테스트", () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로그인 상태로 설정
    await page.goto("http://localhost:3000");

    // 백엔드 서버 연결 확인
    let backendReady = false;
    for (let i = 0; i < 10; i++) {
      try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "test", password: "test" }),
        });
        backendReady = true;
        break;
      } catch (e) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!backendReady) {
      throw new Error("백엔드 서버가 응답하지 않습니다.");
    }

    // 로그인 수행
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');

    // 로그인 성공 후 프로젝트 선택 페이지로 이동하는지 확인
    await page.waitForSelector('h5:has-text("프로젝트 선택")', {
      timeout: 10000,
    });

    // 사용자 아바타가 나타날 때까지 대기 (로그인 완료 확인)
    await page.waitForSelector('button[aria-label="user menu"]', {
      timeout: 5000,
    });
  });

  test("정상 로그아웃 플로우", async ({ page }, testInfo) => {
    // 사용자 아바타 클릭하여 메뉴 열기
    await page.click('button[aria-label="user menu"]');

    // 메뉴가 열릴 때까지 대기
    await page.waitForSelector('li:has-text("로그아웃")', { timeout: 3000 });

    // 로그아웃 메뉴 아이템 클릭
    await page.click('li:has-text("로그아웃")');

    // 로그인 페이지로 리디렉션 확인
    await page.waitForURL("**/", { timeout: 5000 });

    // 로그인 폼이 표시되는지 확인
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "normal-logout-flow");
  });

  test("로그아웃 후 대시보드 직접 접근 방지", async ({ page }, testInfo) => {
    // 먼저 로그아웃
    await page.click('button[aria-label="user menu"]');
    await page.waitForSelector('li:has-text("로그아웃")', { timeout: 3000 });
    await page.click('li:has-text("로그아웃")');
    await page.waitForURL("**/", { timeout: 5000 });

    // 대시보드에 직접 접근 시도
    await page.goto("http://localhost:3000/dashboard");

    // 로그인 페이지로 리디렉션 되는지 확인
    await page.waitForURL("**/", { timeout: 5000 });

    // 로그인 폼이 표시되는지 확인
    await expect(page.locator('input[name="username"]')).toBeVisible();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(
      page,
      testInfo,
      "logout-dashboard-access-prevention",
    );
  });

  test("로그아웃 후 브라우저 뒤로가기 방지", async ({ page }, testInfo) => {
    // 로그아웃 수행
    await page.click('button[aria-label="user menu"]');
    await page.waitForSelector('li:has-text("로그아웃")', { timeout: 3000 });
    await page.click('li:has-text("로그아웃")');
    await page.waitForURL("**/", { timeout: 5000 });

    // 브라우저 뒤로가기 시도
    await page.goBack();

    // 뒤로가기 후에도 여전히 로그인 페이지에 있는지 확인
    // 상태가 변경될 수 있으므로 약간 대기
    await page.waitForTimeout(1000);

    // 로그인 폼이 여전히 보이는지 확인 (뒤로가기가 차단되어야 함)
    const hasLoginForm = await page
      .locator('input[name="username"]')
      .isVisible();
    if (hasLoginForm) {
      // 로그인 폼이 보이면 정상 (뒤로가기 차단됨)
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    } else {
      // 로그인 폼이 안 보이면 다른 방식으로 확인
      // 프로젝트 선택 페이지에 있을 수도 있으므로 사용자 아바타가 없는지 확인
      const userMenu = await page
        .locator('button[aria-label="user menu"]')
        .isVisible();
      expect(userMenu).toBe(false);
    }

    // URL이 인증된 경로가 아닌지 확인 (about:blank도 허용)
    expect(page.url()).toMatch(/\/$|\/login$|\/projects$|about:blank/);

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(
      page,
      testInfo,
      "logout-back-button-prevention",
    );
  });

  test("로그아웃 버튼 중복 클릭 방지", async ({ page }, testInfo) => {
    // 사용자 메뉴 열기
    await page.click('button[aria-label="user menu"]');
    await page.waitForSelector('li:has-text("로그아웃")', { timeout: 3000 });

    // 로그아웃 메뉴 아이템을 빠르게 여러 번 클릭
    const logoutMenuItem = page.locator('li:has-text("로그아웃")');

    // 첫 번째 클릭
    await logoutMenuItem.click();

    // 즉시 두 번째 클릭 시도 (메뉴가 사라져야 함)
    try {
      await logoutMenuItem.click({ timeout: 1000 });
    } catch (error) {
      // 메뉴가 더 이상 클릭할 수 없는 상태라면 정상
    }

    // 로그인 페이지로 정상 리디렉션 확인
    await page.waitForURL("**/", { timeout: 5000 });
    await expect(page.locator('input[name="username"]')).toBeVisible();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(
      page,
      testInfo,
      "logout-duplicate-click-prevention",
    );
  });

  test("로그아웃 시 로컬 스토리지 정리 확인", async ({ page }, testInfo) => {
    // 로그아웃 전 토큰 존재 확인
    const tokenBefore = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    expect(tokenBefore).toBeTruthy();

    // 로그아웃 수행
    await page.click('button[aria-label="user menu"]');
    await page.waitForSelector('li:has-text("로그아웃")', { timeout: 3000 });
    await page.click('li:has-text("로그아웃")');
    await page.waitForURL("**/", { timeout: 5000 });

    // 로그아웃 후 토큰이 제거되었는지 확인
    const tokenAfter = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    const refreshTokenAfter = await page.evaluate(() =>
      localStorage.getItem("refreshToken"),
    );

    expect(tokenAfter).toBeNull();
    expect(refreshTokenAfter).toBeNull();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "logout-localstorage-cleanup");
  });

  test("로그아웃 후 재로그인 정상 동작", async ({ page }, testInfo) => {
    // 로그아웃 수행
    await page.click('button[aria-label="user menu"]');
    await page.waitForSelector('li:has-text("로그아웃")', { timeout: 3000 });
    await page.click('li:has-text("로그아웃")');
    await page.waitForURL("**/", { timeout: 5000 });

    // 재로그인 수행
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');

    // 로그인 성공 여부를 다양한 방법으로 확인
    // 1. 사용자 아바타 표시 확인 (가장 확실한 로그인 성공 지표)
    await page.waitForSelector('button[aria-label="user menu"]', {
      timeout: 10000,
    });

    // 2. 로그인 폼이 사라졌는지 확인
    await expect(page.locator('input[name="username"]')).not.toBeVisible();

    // 3. 상단 네비게이션이 표시되는지 확인
    await expect(page.locator('button[aria-label="user menu"]')).toBeVisible();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "logout-relogin-flow");
  });

  test("세션 만료 후 자동 로그아웃", async ({ page }, testInfo) => {
    // 로컬 스토리지에서 토큰 제거 (세션 만료 시뮬레이션)
    await page.evaluate(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    });

    // 페이지 새로고침
    await page.reload();

    // 로그인 페이지로 리디렉션되는지 확인
    await page.waitForURL("**/", { timeout: 5000 });
    await expect(page.locator('input[name="username"]')).toBeVisible();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "session-expiry-auto-logout");
  });

  test("네트워크 오류 시 로그아웃 처리", async ({ page }, testInfo) => {
    // 네트워크 요청 차단
    await page.route("**/api/auth/logout", (route) => route.abort());

    // 로그아웃 시도
    await page.click('button[aria-label="user menu"]');
    await page.waitForSelector('li:has-text("로그아웃")', { timeout: 3000 });
    await page.click('li:has-text("로그아웃")');

    // 네트워크 오류에도 불구하고 클라이언트 측에서 로그아웃 처리
    // (로컬 스토리지 정리 및 로그인 페이지로 이동)
    await page.waitForURL("**/", { timeout: 10000 });

    // 토큰이 로컬에서 제거되었는지 확인
    const token = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    expect(token).toBeNull();

    // 로그인 폼이 표시되는지 확인
    await expect(page.locator('input[name="username"]')).toBeVisible();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(
      page,
      testInfo,
      "logout-network-error-handling",
    );
  });
});
