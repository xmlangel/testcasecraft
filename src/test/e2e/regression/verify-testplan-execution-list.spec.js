const { test, expect } = require("../fixtures/test-fixtures.js");
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require("../config/credentials.js");

test.describe("테스트 플랜 실행 목록", () => {
  test.setTimeout(180000); // 테스트 타임아웃 넉넉히 설정

  test("테스트 플랜 선택 시 연결된 테스트 실행 리스트가 표시되어야 한다", async ({
    page,
    loginPage,
    projectListPage,
    testPlanPage,
    testExecutionPage,
  }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const timestamp = Date.now();
    const testPlanName = `목록확인플랜_W${workerIndex}_${timestamp}`;
    const executionName = `목록확인실행_W${workerIndex}_${timestamp}`;

    console.log(
      `🚀 [Worker ${workerIndex}] 테스트 플랜 실행 목록 확인 테스트 시작...`,
    );

    // Helper function for login and navigation
    const performLoginAndNavigate = async () => {
      await loginPage.goto();

      // splash-screen 제거 대기 (중요: 클릭 방해 요소)
      const splash = page.locator("#splash-screen");
      if (await splash.isVisible().catch(() => false)) {
        await splash.waitFor({ state: "hidden", timeout: 30000 });
      }

      // 세션 만료 팝업 처리
      const sessionExpiredDialog = page.locator(
        'div[role="dialog"]:has-text("세션 만료")',
      );
      const loginRedirectButton = page.locator(
        'button:has-text("로그인 페이지로 이동")',
      );

      if (
        await sessionExpiredDialog
          .isVisible({ timeout: 5000 })
          .catch(() => false)
      ) {
        console.log("⚠️ 세션 만료 팝업 감지됨. 로그인 페이지로 이동합니다.");
        await loginRedirectButton.click();
        await page.waitForLoadState("networkidle");
        // 다시 splash-screen 대기
        if (await splash.isVisible().catch(() => false)) {
          await splash.waitFor({ state: "hidden", timeout: 30000 });
        }
      }

      // 로그인 화면인지 확인 후 로그인 수행
      if (
        await loginPage.usernameInput
          .isVisible({ timeout: 10000 })
          .catch(() => false)
      ) {
        console.log("🔐 로그인 페이지 진입. 로그인을 수행합니다.");
        await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
      } else {
        console.log("📂 프로젝트 목록 페이지로 직접 이동을 시도합니다.");
        await loginPage.goto();
        if (await splash.isVisible().catch(() => false)) {
          await splash.waitFor({ state: "hidden", timeout: 30000 });
        }
      }

      await projectListPage.waitForLoad();
      await projectListPage.openFirstProject();
      await page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 });
    };

    // 1. 로그인 및 초기 프로젝트 진입
    await performLoginAndNavigate();

    // 2. 테스트 플랜 생성
    await testPlanPage.goToTestPlanTab();
    await testPlanPage.createNewPlan(testPlanName);
    await testPlanPage.savePlan();

    // 3. 테스트 실행 생성 (해당 플랜 연결)
    await testExecutionPage.goToExecutionTab();

    // 버튼 로딩 대기
    const addBtn = page.locator(
      'button[data-testid="testexecution-add-button"]',
    );
    if (!(await addBtn.isVisible({ timeout: 10000 }).catch(() => false))) {
      console.log("⚠️ 실행 버튼 안보임. 다시 로그인을 시도합니다.");
      await performLoginAndNavigate();
      await testExecutionPage.goToExecutionTab();
    }

    await addBtn.click();
    await page.fill('input[name="name"]', executionName);

    // 플랜 선택
    await page.click('div[id="test-plan-select"]');
    await page.click(`li:has-text("${testPlanName}")`);

    await page.click('button:has-text("저장")');
    await page.waitForSelector(`text=${executionName}`, { timeout: 20000 });

    // 4. 테스트 플랜 탭으로 귀환
    await testPlanPage.goToTestPlanTab();

    // 5. 테스트 플랜 클릭 (이름 클릭)
    await page.click(`text=${testPlanName}`);

    // 6. 결과 확인: 다이얼로그에 실행 목록이 표시되는지 확인
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 20000 });
    await expect(dialog).toContainText(executionName);

    console.log(`🎉 [Worker ${workerIndex}] 테스트 플랜 실행 목록 확인 완료`);

    // Cleanup
    await page.keyboard.press("Escape"); // 다이얼로그 닫기
  });
});
