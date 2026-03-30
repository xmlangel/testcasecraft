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
      console.log("📍 네비게이션 시작...");

      let loginPageReached = false;
      let attempts = 0;
      const maxAttempts = 5;

      const handleSessionPopup = async () => {
        const sessionExpiredDialog = page.locator(
          'div[role="dialog"]:has-text("세션 만료")',
        );
        const loginRedirectButton = page.locator(
          'button:has-text("로그인 페이지로 이동")',
        );

        let popupAttempts = 0;
        while (
          (await sessionExpiredDialog
            .isVisible({ timeout: 2000 })
            .catch(() => false)) &&
          popupAttempts < 3
        ) {
          console.log(
            "⚠️ 세션 만료 팝업 감지됨! '로그인 페이지로 이동' 버튼을 클릭합니다.",
          );
          await loginRedirectButton.click().catch(() => {});
          await page.waitForTimeout(1000);
          popupAttempts++;
        }
      };

      while (!loginPageReached && attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 페이지 진입 시도 ${attempts}/${maxAttempts}...`);

        try {
          await loginPage.goto();
          await page.waitForLoadState("load", { timeout: 10000 });
        } catch (e) {
          console.log("⚠️ goto() 중 오류 발생:", e.message);
        }

        // 스플래시 화면 체크 및 대기
        const splash = page.locator("#splash-screen");
        try {
          if (await splash.isVisible({ timeout: 3000 })) {
            console.log("🌊 스플래시 화면 대기 중...");
            await splash.waitFor({ state: "hidden", timeout: 20000 });
          }
        } catch (e) {}

        // 세션 만료 팝업 체크 및 처리
        await handleSessionPopup();

        // 로그인 페이지 도달 확인
        if (
          await loginPage.usernameInput
            .isVisible({ timeout: 5000 })
            .catch(() => false)
        ) {
          console.log("✅ 로그인 페이지 도달 성공");
          loginPageReached = true;
          break;
        } else {
          console.log("📂 로그인 페이지가 아닙니다. 현재 URL:", page.url());
          // 이미 프로젝트 목록인지 확인
          if (page.url().includes("/projects")) {
            // 프로젝트 목록에서도 팝업이 뜰 수 있으므로 한 번 더 체크
            await handleSessionPopup();
            // 팝업 처리 후에도 여전히 프로젝트 페이지면 성공으로 간주
            if (page.url().includes("/projects")) {
              console.log("📂 이미 프로젝트 목록 페이지에 있습니다.");
              loginPageReached = true;
              break;
            }
          }
        }
        await page.waitForTimeout(1000);
      }

      // 최종 로그인 수행
      try {
        if (
          await loginPage.usernameInput
            .isVisible({ timeout: 5000 })
            .catch(() => false)
        ) {
          console.log("🔐 로그인을 수행합니다.");
          await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);

          // 로그인 버튼 클릭 직후 팝업이 뜰 수 있음 (중요!)
          await page.waitForTimeout(1000);
          await handleSessionPopup();

          await page.waitForLoadState("networkidle").catch(() => {});
        } else {
          console.log(
            "ℹ️ 로그인 폼이 보이지 않아 입력을 건너뜁니다. 현재 URL:",
            page.url(),
          );
          // 이 시점에도 팝업이 있을 수 있음
          await handleSessionPopup();
        }
      } catch (e) {
        console.log("⚠️ 로그인 시도 중 예외 발생:", e.message);
      }

      // 프로젝트 목록 페이지 도착 확인
      try {
        console.log("⏳ 프로젝트 목록 페이지 대기 중...");
        await projectListPage.waitForLoad();
        console.log("✅ 프로젝트 목록 페이지 확인");
      } catch (e) {
        console.log(`❌ 목록 페이지 도달 대기 실패: ${e.message}`);

        // 다시 한 번 팝업 체크
        await handleSessionPopup();

        if (!page.url().includes("/projects")) {
          console.log("🔄 경로 복구를 위해 메인으로 이동합니다.");
          try {
            // 이 시점에서는 팝업을 먼저 누르고 이동하거나, 이동 시도 후 팝업을 누름
            await loginPage.goto().catch(() => {});
            await handleSessionPopup();

            if (
              await loginPage.usernameInput
                .isVisible({ timeout: 5000 })
                .catch(() => false)
            ) {
              await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
              await handleSessionPopup();
            }
            await projectListPage.waitForLoad().catch(() => {});
          } catch (err) {
            console.log("❌ 경로 복구 실패:", err.message);
          }
        }
      }

      // 최종 확인 후 프로젝트 오픈
      console.log("🖱️ 프로젝트 오픈 시도...");
      try {
        await projectListPage.openFirstProject();
        await page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 });
        console.log("🚀 프로젝트 페이지 진입 성공");
      } catch (e) {
        console.log("❌ 프로젝트 오픈 실패:", e.message);
        // 프로젝트 카드가 팝업에 가려져 있을 수 있으므로 마지막으로 팝업 확인 후 클릭 시도
        await handleSessionPopup();
        await projectListPage.openFirstProject();
        await page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 });
      }
    };

    // 1. 로그인 및 초기 프로젝트 진입
    await performLoginAndNavigate();

    // 2. 테스트 플랜 생성
    await testPlanPage.goToTestPlanTab();
    await testPlanPage.clickAddTestPlan();
    await testPlanPage.fillTestPlanForm({ name: testPlanName });

    // 테스트 케이스를 최소 하나 이상 선택해야 함
    console.log("📝 테스트 케이스 전체 선택 중...");
    await testPlanPage.selectAllTestCases();

    await testPlanPage.saveTestPlan();

    // 3. 테스트 실행 생성 (해당 플랜 연결)
    await testExecutionPage.goToExecutionTab();

    // 버튼 로딩 대기 및 복구
    try {
      await testExecutionPage.newExecutionButton.waitFor({
        state: "visible",
        timeout: 10000,
      });
    } catch (e) {
      console.log("⚠️ 실행 생성 버튼이 보이지 않아 네비게이션을 재시도합니다.");
      await performLoginAndNavigate();
      await testExecutionPage.goToExecutionTab();
    }

    // 테스트 실행 생성 (POM 메서드 사용)
    await testExecutionPage.createNewExecution(executionName, testPlanName);

    // 목록에서 확인
    await expect(page.locator(`text=${executionName}`)).toBeVisible({
      timeout: 20000,
    });

    // 4. 테스트 플랜 탭으로 귀환
    await testPlanPage.goToTestPlanTab();

    // 5. 테스트 플랜 클릭 (이름 클릭하여 상세 팝업 열기)
    // tr 내의 텍스트가 아닌, 정확한 행(row)이나 이름을 클릭해야 함
    await page.click(`text=${testPlanName}`);

    // 6. 결과 확인: 다이얼로그에 실행 목록이 표시되는지 확인
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 20000 });

    // 다이얼로그 내에 연결된 실행 이름이 포함되어 있는지 확인
    await expect(dialog).toContainText(executionName);

    console.log(`🎉 [Worker ${workerIndex}] 테스트 플랜 실행 목록 확인 완료`);

    // Cleanup
    const closeBtn = dialog.locator(
      'button:has-text("닫기"), button:has-text("Close")',
    );
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press("Escape");
    }
  });
});
