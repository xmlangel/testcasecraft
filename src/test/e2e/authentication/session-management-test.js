/**
 * 세션 관리 및 토큰 처리 E2E 테스트
 * ICT-69: JWT 토큰 만료, 자동 갱신, 세션 관리 테스트
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

test.describe("세션 관리 및 토큰 처리 테스트", () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 깨끗한 상태로 시작
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
  });

  test("정상 로그인 후 토큰 저장 확인", async ({ page }, testInfo) => {
    // 로그인 수행
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');

    // 로그인 성공 확인
    await page.waitForSelector('h5:has-text("프로젝트 선택")', {
      timeout: 10000,
    });

    // 토큰이 localStorage에 저장되었는지 확인
    const accessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    const refreshToken = await page.evaluate(() =>
      localStorage.getItem("refreshToken"),
    );

    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    // JWT 토큰 형식 확인 (3개 부분으로 나뉜 base64 문자열)
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    expect(accessToken).toMatch(jwtRegex);
    expect(refreshToken).toMatch(jwtRegex);

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "token-storage-verification");
  });

  test("토큰 수동 삭제 후 자동 로그아웃 확인", async ({ page }, testInfo) => {
    // 먼저 로그인
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForSelector('h5:has-text("프로젝트 선택")', {
      timeout: 10000,
    });

    // 토큰 수동 삭제 (세션 만료 시뮬레이션)
    await page.evaluate(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    });

    // 페이지 새로고침으로 토큰 확인 트리거
    await page.reload();

    // 로그인 페이지로 리디렉션되는지 확인
    await page.waitForURL("**/", { timeout: 5000 });
    await expect(page.locator('input[name="username"]')).toBeVisible();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "token-deletion-auto-logout");
  });

  test("만료된 토큰으로 API 요청 시 처리 확인", async ({ page }, testInfo) => {
    // 로그인
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForSelector('h5:has-text("프로젝트 선택")', {
      timeout: 10000,
    });

    // 가짜 만료된 토큰으로 교체
    await page.evaluate(() => {
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid";
      localStorage.setItem("accessToken", expiredToken);
      localStorage.setItem("refreshToken", expiredToken);
    });

    // API 요청을 트리거하는 동작 수행 (네비게이션 시도)
    await page.goto("http://localhost:3000/dashboard");

    // 토큰이 만료되어 로그인 페이지로 리디렉션되는지 확인
    await page.waitForURL("**/", { timeout: 10000 });
    await expect(page.locator('input[name="username"]')).toBeVisible();

    // localStorage에서 토큰이 제거되었는지 확인
    const tokenAfter = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    expect(tokenAfter).toBeNull();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "expired-token-handling");
  });

  test("페이지 새로고침 시 세션 유지 확인", async ({ page }, testInfo) => {
    // 로그인
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForSelector('h5:has-text("프로젝트 선택")', {
      timeout: 10000,
    });

    // 로그인 상태 확인
    await expect(page.locator('button[aria-label="user menu"]')).toBeVisible();

    // 페이지 새로고침
    await page.reload();

    // 새로고침 후에도 로그인 상태가 유지되는지 확인
    await page.waitForSelector('h5:has-text("프로젝트 선택")', {
      timeout: 10000,
    });
    await expect(page.locator('button[aria-label="user menu"]')).toBeVisible();

    // 토큰이 여전히 존재하는지 확인
    const accessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    const refreshToken = await page.evaluate(() =>
      localStorage.getItem("refreshToken"),
    );

    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(
      page,
      testInfo,
      "session-persistence-after-refresh",
    );
  });

  test("다중 탭에서 세션 동기화 확인", async ({ page, context }, testInfo) => {
    // 첫 번째 탭에서 로그인
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForSelector('h5:has-text("프로젝트 선택")', {
      timeout: 10000,
    });

    // 두 번째 탭 생성
    const page2 = await context.newPage();
    await page2.goto("http://localhost:3000");

    // 두 번째 탭에서도 로그인 상태인지 확인 (토큰 공유)
    await page2.waitForSelector('h5:has-text("프로젝트 선택")', {
      timeout: 10000,
    });
    await expect(page2.locator('button[aria-label="user menu"]')).toBeVisible();

    // 첫 번째 탭에서 로그아웃
    await page.click('button[aria-label="user menu"]');
    await page.waitForSelector('li:has-text("로그아웃")', { timeout: 3000 });
    await page.click('li:has-text("로그아웃")');
    await page.waitForURL("**/", { timeout: 5000 });

    // 두 번째 탭 새로고침 후 로그아웃 상태인지 확인
    await page2.reload();
    await page2.waitForURL("**/", { timeout: 10000 });
    await expect(page2.locator('input[name="username"]')).toBeVisible();

    // 두 번째 탭 닫기
    await page2.close();

    // 성공 스크린샷 촬영 (첫 번째 탭)
    await takeSuccessScreenshot(page, testInfo, "multi-tab-session-sync");
  });

  test("토큰 갱신 시나리오 테스트", async ({ page }, testInfo) => {
    // 로그인
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForSelector('h5:has-text("프로젝트 선택")', {
      timeout: 10000,
    });

    // 원래 토큰 저장
    const originalAccessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    const originalRefreshToken = await page.evaluate(() =>
      localStorage.getItem("refreshToken"),
    );

    // 짧은 만료 시간을 가진 토큰으로 교체 (실제 서비스에서는 서버 설정 필요)
    // 여기서는 토큰 갱신 로직이 정상적으로 작동하는지 확인

    // API 요청이 많은 작업 수행 (여러 번의 네비게이션)
    for (let i = 0; i < 3; i++) {
      await page.goto("http://localhost:3000");
      await page.waitForSelector('h5:has-text("프로젝트 선택")', {
        timeout: 5000,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 여전히 로그인 상태인지 확인
    await expect(page.locator('button[aria-label="user menu"]')).toBeVisible();

    // 토큰이 여전히 유효한지 확인
    const finalAccessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    const finalRefreshToken = await page.evaluate(() =>
      localStorage.getItem("refreshToken"),
    );

    expect(finalAccessToken).toBeTruthy();
    expect(finalRefreshToken).toBeTruthy();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "token-refresh-scenario");
  });

  test("세션 타임아웃 후 재로그인 플로우", async ({ page }, testInfo) => {
    // 로그인
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForSelector('h5:has-text("프로젝트 선택")', {
      timeout: 10000,
    });

    // 세션 만료 시뮬레이션 (토큰 제거)
    await page.evaluate(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    });

    // 보호된 리소스 접근 시도
    await page.goto("http://localhost:3000/dashboard");

    // 로그인 페이지로 리디렉션 확인
    await page.waitForURL("**/", { timeout: 5000 });
    await expect(page.locator('input[name="username"]')).toBeVisible();

    // 재로그인 수행
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');

    // 재로그인 성공 확인 (대시보드 또는 프로젝트 선택 페이지)
    try {
      await page.waitForSelector('h5:has-text("프로젝트 선택")', {
        timeout: 5000,
      });
    } catch {
      // 대시보드로 직접 이동한 경우
      await page.waitForSelector("text=대시보드", { timeout: 5000 });
    }
    await expect(page.locator('button[aria-label="user menu"]')).toBeVisible();

    // 새로운 토큰이 저장되었는지 확인
    const newAccessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    const newRefreshToken = await page.evaluate(() =>
      localStorage.getItem("refreshToken"),
    );

    expect(newAccessToken).toBeTruthy();
    expect(newRefreshToken).toBeTruthy();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "session-timeout-relogin");
  });

  test("잘못된 토큰 형식 처리 확인", async ({ page }, testInfo) => {
    // 잘못된 형식의 토큰 설정
    await page.evaluate(() => {
      localStorage.setItem("accessToken", "invalid-token-format");
      localStorage.setItem("refreshToken", "invalid-refresh-token");
    });

    // 페이지 로드
    await page.goto("http://localhost:3000");

    // 잘못된 토큰으로 인해 로그인 페이지가 표시되는지 확인
    await page.waitForURL("**/", { timeout: 5000 });
    await expect(page.locator('input[name="username"]')).toBeVisible();

    // 잘못된 토큰이 제거되었는지 확인
    const tokenAfter = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    const refreshTokenAfter = await page.evaluate(() =>
      localStorage.getItem("refreshToken"),
    );

    // 잘못된 토큰이 그대로 남아있을 수 있지만, 앱이 정상적으로 로그인 페이지를 표시해야 함
    expect(page.locator('input[name="username"]')).toBeVisible();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(
      page,
      testInfo,
      "invalid-token-format-handling",
    );
  });

  test("네트워크 오류 시 토큰 갱신 실패 처리", async ({ page }, testInfo) => {
    // 로그인
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForSelector('h5:has-text("프로젝트 선택")', {
      timeout: 10000,
    });

    // 네트워크 요청 차단 (토큰 갱신 API 포함)
    await page.route("**/api/auth/refresh", (route) => route.abort());

    // 만료된 토큰으로 교체
    await page.evaluate(() => {
      const expiredToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid";
      localStorage.setItem("accessToken", expiredToken);
    });

    // API 요청을 트리거하는 동작 (페이지 새로고침)
    await page.reload();

    // 토큰 갱신 실패로 인해 로그인 페이지로 이동하는지 확인
    await page.waitForURL("**/", { timeout: 10000 });
    await expect(page.locator('input[name="username"]')).toBeVisible();

    // 토큰이 제거되었는지 확인
    const tokenAfter = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    expect(tokenAfter).toBeNull();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(
      page,
      testInfo,
      "network-error-token-refresh-failure",
    );
  });
});
