// ICT-78: 최소한의 로그인 및 프로젝트 생성 테스트
// 디버깅용 최소 버전

const { test, expect } = require("@playwright/test");

test.describe("최소 프로젝트 생성 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.evaluate(() => localStorage.clear());
  });

  test("최소 로그인 및 프로젝트 버튼 확인", async ({ page }, testInfo) => {
    console.log("🔐 최소 로그인 테스트 시작...");

    // 1. 로그인 폼 확인
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // 2. 로그인 수행
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    console.log("✅ 로그인 버튼 클릭");

    // 3. 로그인 성공 대기
    await page.waitForTimeout(5000);

    // 4. JWT 토큰 확인
    const accessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    console.log("🔑 accessToken:", accessToken ? "FOUND" : "NOT FOUND");

    if (!accessToken) {
      throw new Error("로그인 실패: JWT 토큰이 저장되지 않았습니다.");
    }

    // 5. 페이지 상태 확인
    await page.waitForLoadState("networkidle");
    console.log("📍 현재 URL:", page.url());

    // 6. 모든 버튼 확인 (디버깅용)
    console.log("🔍 페이지의 모든 버튼 확인...");
    const allButtons = await page.locator("button").all();

    for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
      try {
        const button = allButtons[i];
        if (await button.isVisible()) {
          const text = await button.textContent();
          const isEnabled = await button.isEnabled();
          console.log(`버튼 ${i + 1}: "${text}" (활성: ${isEnabled})`);
        }
      } catch (e) {
        continue;
      }
    }

    // 7. 성공 스크린샷
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotPath = `test-results/success-screenshots/minimal-test-${timestamp}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await testInfo.attach("success-screenshot", {
      path: screenshotPath,
      contentType: "image/png",
    });

    console.log("✅ 최소 테스트 완료!");
  });
});
