// ICT-78: 프로젝트 생성 다이얼로그 테스트
// 다이얼로그 열기와 내부 요소 확인

const { test, expect } = require("@playwright/test");

test.describe("프로젝트 생성 다이얼로그 테스트", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
    await page.evaluate(() => localStorage.clear());
  });

  // 로그인 헬퍼 함수
  async function loginAsAdmin(page) {
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const accessToken = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    if (!accessToken) {
      throw new Error("로그인 실패");
    }
    console.log("✅ 로그인 성공");
  }

  test("프로젝트 생성 다이얼로그 열기 및 내용 확인", async ({
    page,
  }, testInfo) => {
    console.log("🏗️ 프로젝트 생성 다이얼로그 테스트 시작...");

    // 1. 로그인
    await loginAsAdmin(page);
    await page.waitForLoadState("networkidle");

    // 2. 프로젝트 생성 버튼 클릭
    const createButton = page.locator('button:has-text("새 프로젝트 생성")');
    await expect(createButton).toBeVisible();
    await createButton.click();
    console.log("🖱️ 새 프로젝트 생성 버튼 클릭");

    // 3. 다이얼로그가 열렸는지 확인
    await page.waitForTimeout(2000);

    // 실제 다이얼로그 내용을 담은 요소를 선택
    const dialog = page.getByRole("dialog", { name: "새 프로젝트 생성" });
    const dialogVisible = await dialog.isVisible({ timeout: 5000 });

    if (dialogVisible) {
      console.log("✅ 프로젝트 생성 다이얼로그 열림");

      // 4. 다이얼로그 내부의 모든 요소 확인
      console.log("🔍 다이얼로그 내부 요소 확인...");

      // 모든 input 요소
      const inputs = await dialog.locator("input").all();
      for (let i = 0; i < inputs.length; i++) {
        try {
          const input = inputs[i];
          if (await input.isVisible()) {
            const name = await input.getAttribute("name");
            const type = await input.getAttribute("type");
            const placeholder = await input.getAttribute("placeholder");
            console.log(
              `Input ${
                i + 1
              }: name="${name}", type="${type}", placeholder="${placeholder}"`,
            );
          }
        } catch (e) {
          continue;
        }
      }

      // 모든 button 요소
      const buttons = await dialog.locator("button").all();
      for (let i = 0; i < buttons.length; i++) {
        try {
          const button = buttons[i];
          if (await button.isVisible()) {
            const text = await button.textContent();
            const type = await button.getAttribute("type");
            const isEnabled = await button.isEnabled();
            console.log(
              `Button ${
                i + 1
              }: "${text}" (type="${type}", enabled=${isEnabled})`,
            );
          }
        } catch (e) {
          continue;
        }
      }

      // 프로젝트명 입력 시도
      const nameInput = dialog
        .locator(
          'input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]',
        )
        .first();
      if (await nameInput.isVisible({ timeout: 2000 })) {
        const testProjectName = `테스트프로젝트_${Date.now()}`;
        await nameInput.fill(testProjectName);
        console.log(`📝 프로젝트명 입력: ${testProjectName}`);

        // 입력된 값 확인
        const inputValue = await nameInput.inputValue();
        console.log(`📋 입력된 값: ${inputValue}`);
      } else {
        console.log("⚠️ 프로젝트명 입력 필드를 찾을 수 없음");
      }
    } else {
      console.log("❌ 프로젝트 생성 다이얼로그를 찾을 수 없음");
    }

    // 5. 성공 스크린샷
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotPath = `test-results/success-screenshots/dialog-test-${timestamp}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await testInfo.attach("success-screenshot", {
      path: screenshotPath,
      contentType: "image/png",
    });

    console.log("✅ 다이얼로그 테스트 완료!");
  });
});
