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

    // 1. 로그인 및 초기 프로젝트 진입
    await loginPage.performLoginAndNavigate({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      loginPage,
      projectListPage,
    });

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
      await loginPage.performLoginAndNavigate({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        loginPage,
        projectListPage,
      });
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
