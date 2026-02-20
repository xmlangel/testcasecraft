/**
 * 테스트 플랜 생성 및 삭제 E2E 테스트
 * 절차:
 * 1. 로그인 (admin/admin123)
 * 2. 프로젝트 리스트에서 첫 번째 프로젝트 상세 진입
 * 3. 먼저 테스트 케이스 하나를 생성하여 테스트 플랜에서 선택할 수 있도록 함
 * 4. '테스트 플랜' 탭으로 이동
 * 5. '테스트 플랜 추가' 버튼 클릭
 * 6. 테스트 플랜 이름 및 설명 입력
 * 7. 테스트 케이스 선택 (전체 선택 이용)
 * 8. 저장 버튼 클릭 후 리스트에 생성 확인
 * 9. 생성된 테스트 플랜 삭제
 * 10. 리스트에서 삭제되었는지 확인
 */

const { test, expect } = require('../fixtures/test-fixtures.js');
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require('../config/credentials.js');

test.describe('테스트 플랜 생성 및 삭제 테스트', () => {

  test.beforeEach(async ({ loginPage, projectListPage }) => {
    await loginPage.goto();
    await loginPage.clearStorage();
    await loginPage.waitForBackend();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await projectListPage.waitForLoad();
  });

    test('테스트 플랜을 생성하고 삭제한다', async ({ page, projectListPage, testCasePage, testPlanPage }, testInfo) => {
    test.setTimeout(120000);
    const workerIndex = testInfo.workerIndex;
    const timestamp = Date.now();
    
    // 1. 첫 번째 프로젝트 열기
    await projectListPage.clickProjectSelectMenu();
    await projectListPage.openFirstProject();
    
    await page.waitForURL(/\/projects\/[a-f0-9-]+/);

    // 2. 테스트 케이스 하나 생성 (나중에 테스트 플랜에서 선택하기 위함)
    await testCasePage.goToTestCaseTab();
    await testCasePage.selectIndividualFormMode();
    const testCaseName = `플랜테스트_W${workerIndex}_${timestamp}`;
    await testCasePage.fillIndividualForm({
        name: testCaseName,
        description: '테스트 플랜 테스트를 위한 케이스입니다.',
        steps: [{ desc: '스텝 1', expected: '결과 1' }]
    });
    await testCasePage.saveForm();
    await expect(page.locator(`text="${testCaseName}"`)).toBeVisible({ timeout: 15000 });

    // 3. 테스트 플랜 탭 선택
    await testPlanPage.goToTestPlanTab();
    await testPlanPage.screen('testplan-tab-selected');

    // 4. 테스트 플랜 추가 버튼 클릭
    await testPlanPage.clickAddTestPlan();
    await testPlanPage.screen('testplan-add-dialog-opened');

    // 5. 테스트 플랜 정보 입력 (이름, 설명)
    const testPlanName = `자동화플랜_W${workerIndex}_${timestamp}`;
    const testPlanDesc = '자동화 테스트를 통해 생성된 테스트 플랜입니다.';
    
    await testPlanPage.fillTestPlanForm({
        name: testPlanName,
        description: testPlanDesc
    });
    
    // 6. 테스트 케이스 선택 (전체 선택)
    await testPlanPage.selectAllTestCases();
    await testPlanPage.screen('testplan-form-filled-and-selected');

    // 7. 저장
    await testPlanPage.saveTestPlan();
    await testPlanPage.screen('testplan-saved');

    // 8. 생성 확인 (리스트에서 이름 확인)
    const found = await testPlanPage.findPlanAcrossPages(testPlanName);
    if (!found) {
        throw new Error(`Test plan '${testPlanName}' not found after creation.`);
    }
    await testPlanPage.screen('testplan-creation-verified');

    // 9. 추가된 플랜 삭제
    await testPlanPage.deleteTestPlan(testPlanName);
    await testPlanPage.screen('testplan-deleted');

    // 10. 리스트에서 사라졌는지 확인
    const stillExists = await testPlanPage.findPlanAcrossPages(testPlanName);
    await expect(stillExists).toBe(false);
    await testPlanPage.screen('testplan-deletion-verified');

    console.log(`✅ [Worker ${workerIndex}] 테스트 플랜 '${testPlanName}' 완료`);
  });
});
