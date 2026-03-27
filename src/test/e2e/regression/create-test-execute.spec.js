/**
 * 테스트 실행 E2E 테스트 절차:
 * 1. 로그인 (admin/admin123)
 * 2. 프로젝트 리스트에서 첫 번째 프로젝트 선택 및 상세 진입
 * 3. '테스트실행' 탭으로 이동
 * 4. 기존 테스트 실행이 없으면 새 실행 생성 (테스트 계획 선택 포함)
 * 5. 특정 테스트 실행(E2E 첨부파일) 항목 선택 및 상세 진입
 * 6. 테스트 실행 중이 아니라면 '시작' 버튼을 눌러 실행 상태로 변경
 * 7. 특정 테스트 아이템의 '결과 입력' 버튼 클릭
 * 8. 테스트 결과 입력 다이얼로그 팝업 확인
 * 9. 다이얼로그 내 '파일 첨부' 섹션 및 실제 file input 요소가 존재하는지 최종 확인
 */

const { test, expect } = require("../fixtures/test-fixtures.js");
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require("../config/credentials.js");

test.describe("테스트실행", () => {
  test.setTimeout(120000); // 전체 테스트 타임아웃 증가

  test.beforeEach(async ({ loginPage, projectListPage }) => {
    await loginPage.goto();
    await loginPage.clearStorage();
    await loginPage.waitForBackend();

    // 백엔드 준비 후 다시 로드 (안정성 확보)
    await loginPage.goto();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await projectListPage.waitForLoad();
  });

  test("테스트 실행에서 첨부파일이 정상적으로 표시되는지 확인한다", async ({
    page,
    projectListPage,
    testCasePage,
    testPlanPage,
    testExecutionPage,
  }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const timestamp = Date.now();
    const testCaseName = `실행케이스_W${workerIndex}_${timestamp}`;
    const testPlanName = `실행플랜_W${workerIndex}_${timestamp}`;
    const executionName = `첨부파일테스트_W${workerIndex}_${timestamp}`;

    console.log(
      `🚀 [Worker ${workerIndex}] 테스트 환경 구축 및 실행 테스트 시작...`,
    );

    // 📋 Step 2: 프로젝트 선택
    await projectListPage.openFirstProject();
    await page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 });

    // 📋 Step 3: 전용 테스트 케이스 생성
    await testCasePage.createNewTestCase(testCaseName);

    // 📋 Step 4: 전용 테스트 플랜 생성
    await testPlanPage.goToTestPlanTab();
    await testPlanPage.createNewPlan(testPlanName);
    await testPlanPage.addTestCaseToPlan(testCaseName);
    await testPlanPage.savePlan();

    // 📋 Step 5: 테스트실행 생성 (즉시 시작 옵션 사용)
    await testExecutionPage.goToExecutionTab();
    await testExecutionPage.createNewExecution(
      executionName,
      testPlanName,
      true,
    );
    await testExecutionPage.screen(`execution-started-W${workerIndex}`);

    // 📋 Step 6: 결과입력 버튼 확인 (Polling 대기 포함)
    await testExecutionPage.openResultInputDialog();

    // 📋 Step 7: 첨부파일 섹션 확인
    const attachmentSection = page
      .locator("text=파일 첨부")
      .or(page.locator("text=첨부파일"))
      .first();
    await expect(attachmentSection).toBeVisible({ timeout: 15000 });

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached({ timeout: 15000 });

    console.log(`🎉 [Worker ${workerIndex}] 첨부파일 섹션 확인 완료`);

    // Cleanup: 생성한 리소스들 정리 (실행 -> 플랜 -> 케이스 순)
    try {
      // 1. 실행 창 닫기 및 리스트로 돌아가기
      await testExecutionPage.closeResultInputDialog();
      await testExecutionPage.goBackToList();
      await testExecutionPage.goToExecutionTab();
      await testExecutionPage.searchExecution(executionName);
      await testExecutionPage.deleteMatchingExecutions();

      // 2. 플랜 삭제
      await testPlanPage.goToTestPlanTab();
      await testPlanPage.searchPlan(testPlanName);
      await testPlanPage.deleteMatchingPlans();

      // 3. 케이스 삭제
      await testCasePage.goToTestCaseTab();
      await testCasePage.deleteTestCase(testCaseName);
    } catch (e) {
      console.log(`[Worker ${workerIndex}] Cleanup ignored: ${e.message}`);
    }
  });

  test("생성된 테스트 실행을 삭제한다", async ({
    page,
    projectListPage,
    testExecutionPage,
  }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const timestamp = Date.now();
    const executionName = `삭제테스트_W${workerIndex}_${timestamp}`;

    console.log(`🚀 [Worker ${workerIndex}] 테스트 실행 삭제 테스트 시작...`);

    // 📋 Step 2: 프로젝트 선택
    await projectListPage.openFirstProject();
    await page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 });

    // 📋 Step 3: 테스트실행 탭으로 이동
    await testExecutionPage.goToExecutionTab();

    // 📋 Step 4: 테스트용 항목 생성
    await testExecutionPage.createNewExecution(executionName);
    await testExecutionPage.goToExecutionTab();

    // 📋 Step 5: 삭제할 항목 검색
    await testExecutionPage.searchExecution(executionName);

    // 📋 Step 6: 삭제 버튼 클릭
    await testExecutionPage.deleteMatchingExecutions();

    // 📋 Step 7: 삭제 확인
    await expect(page.locator(`text=${executionName}`)).toHaveCount(0);
    console.log(`🎉 [Worker ${workerIndex}] 테스트 실행 삭제 완료`);
  });
});
