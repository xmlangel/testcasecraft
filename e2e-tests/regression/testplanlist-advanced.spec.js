
// e2e-tests/regression/testplanlist-advanced.spec.js: TestPlanList 컴포넌트 고급 기능 회귀 테스트
const { test, expect } = require('@playwright/test');
const { takeStepScreenshot } = require('../utils/testUtils.js');

test.describe('TestPlanList 컴포넌트 고급 기능 테스트', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    let currentProjectId; // Declare here

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await takeStepScreenshot(page, testInfo, '01-initial-page');

    // 백엔드 서버 준비 확인 및 로그인 (create-testcase-spreadsheet.spec.js에서 복사)
    let backendReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch(`http://localhost:8080/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin' })
        });
        if (response.ok) {
          backendReady = true;
          break;
        }
      } catch (e) {
        // 서버가 아직 준비되지 않았을 수 있음
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (!backendReady) {
      throw new Error('백엔드 서버가 준비되지 않았습니다.');
    }

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('/projects');
    await takeStepScreenshot(page, testInfo, '02-logged-in-to-projects');

    // 직접 프로젝트 ID 1로 이동 (프로젝트 선택 다이얼로그 우회)
    await page.goto('/projects/1');
    await page.waitForURL(/\/projects\/[a-f0-9-]+/); // Wait for project page to load
    await takeStepScreenshot(page, testInfo, '03-selected-project-1');

    // Now navigate to the Test Plans section
    currentProjectId = await page.url().match(/\/projects\/([^/]+)/)[1]; // Extract project ID from current URL
    await page.goto(`/projects/${currentProjectId}/testplans`);
    await page.waitForURL(/\/projects\/[a-f0-9-]+\/testplans$/); // Wait for the testplans URL
    await takeStepScreenshot(page, testInfo, '04-navigated-to-test-plan-page');

    // Wait for the "테스트 플랜 추가" button to be visible
    await page.locator('button:has-text("테스트 플랜 추가")').waitFor({ state: 'visible', timeout: 60000 });
    await page.click('button:has-text("프로젝트 열기")');
    await page.waitForURL(/\/projects\/[a-f0-9-]+/); // Wait for project page to load
    await takeStepScreenshot(page, testInfo, '05-project-opened-to-testplans');

    // Directly navigate to the Test Plans URL
    currentProjectId = await page.url().match(/\/projects\/([^/]+)/)[1]; // Extract project ID from current URL
    await page.goto(`/projects/${currentProjectId}/testplans`);
    await page.waitForURL(/\/projects\/[a-f0-9-]+\/testplans$/); // Wait for the testplans URL
    await takeStepScreenshot(page, testInfo, '06-navigated-to-test-plan-page');

    // Wait for the TestPlanList Card (containing the project name) to be visible
    await page.locator('div.MuiCard-root:has(h6)').waitFor({ state: 'visible', timeout: 60000 });
  });

  test('테스트 플랜 수정 기능 확인', async ({ page }, testInfo) => {
    // 테스트 플랜이 없으면 하나 생성
    const noPlansMessage = page.locator('text="등록된 테스트 플랜이 없습니다."');
    const addTestPlanButton = page.locator('button:has-text("테스트 플랜 추가")');

    // Wait for the page to load its content (either no plans message or table)
    await Promise.race([
      noPlansMessage.waitFor({ state: 'visible' }),
      page.locator('table tbody tr').first().waitFor({ state: 'visible' })
    ]);

    if (await noPlansMessage.isVisible()) {
      await addTestPlanButton.waitFor({ state: 'visible' }); // Ensure button is visible before clicking
      await addTestPlanButton.click();
      await page.waitForURL('**/testplans/new');
      await page.fill('input[name="name"]', `수정 테스트 플랜 ${Date.now()}`);
      await page.fill('textarea[name="description"]', '수정 테스트를 위한 플랜입니다.');
      await page.click('button:has-text("저장")');
      await page.waitForURL(/\/projects\/[a-f0-9-]+\/testplans$/);
      await takeStepScreenshot(page, testInfo, '06-testplan-created-for-edit');
    }

    // 첫 번째 테스트 플랜의 수정 버튼 클릭
    const firstTestPlanEditButton = page.locator('table tbody tr').first().locator('button[title="수정"]');
    await expect(firstTestPlanEditButton).toBeVisible();
    await firstTestPlanEditButton.click();
    await takeStepScreenshot(page, testInfo, '07-clicked-edit-testplan');

    // 수정 페이지로 이동했는지 확인 (URL 패턴 확인)
    // TestPlanList.jsx의 onEditTestPlan prop이 호출되면 /testplans/:id로 이동한다고 가정
    await page.waitForURL(/\/testplans\/[a-f0-9-]+$/);
    await expect(page).toHaveURL(/\/testplans\/[a-f0-9-]+$/);
    await takeStepScreenshot(page, testInfo, '08-navigated-to-edit-testplan-page');
  });

  test('테스트 플랜 삭제 기능 확인', async ({ page }, testInfo) => {
    // 삭제할 테스트 플랜 생성
    const newTestPlanName = `삭제 테스트 플랜 ${Date.now()}`;
    const addTestPlanButton = page.locator('button:has-text("테스트 플랜 추가")');
    await addTestPlanButton.waitFor({ state: 'visible' }); // Ensure button is visible before clicking
    await addTestPlanButton.click();
    await page.waitForURL('**/testplans/new');
    await page.fill('input[name="name"]', newTestPlanName);
    await page.fill('textarea[name="description"]', '삭제 테스트를 위한 플랜입니다.');
    await page.click('button:has-text("저장")');
    await page.waitForURL(/\/projects\/[a-f0-9-]+\/testplans$/);
    await takeStepScreenshot(page, testInfo, '09-testplan-created-for-delete');

    // 생성된 테스트 플랜의 삭제 버튼 클릭
    const deleteButton = page.locator(`table tbody tr:has-text("${newTestPlanName}") button[title="삭제"]`);
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();
    await takeStepScreenshot(page, testInfo, '10-clicked-delete-testplan');

    // 삭제 확인 다이얼로그 확인 및 "삭제" 버튼 클릭
    const deleteDialogTitle = page.locator('h2:has-text("테스트 플랜 삭제")');
    await expect(deleteDialogTitle).toBeVisible();
    await page.click('button:has-text("삭제")'); // 다이얼로그 내 삭제 버튼
    await takeStepScreenshot(page, testInfo, '11-confirmed-delete');

    // 테스트 플랜이 목록에서 사라졌는지 확인
    await expect(page.locator(`table tbody tr:has-text("${newTestPlanName}")`)).not.toBeVisible();
    await takeStepScreenshot(page, testInfo, '12-testplan-deleted');
  });

  test('테스트 실행 다이얼로그 내 버튼 동작 확인', async ({ page }, testInfo) => {
    // 테스트 플랜이 없으면 하나 생성
    const noPlansMessage = page.locator('text="등록된 테스트 플랜이 없습니다."');
    const addTestPlanButton = page.locator('button:has-text("테스트 플랜 추가")');

    // Wait for the page to load its content (either no plans message or table)
    await Promise.race([
      noPlansMessage.waitFor({ state: 'visible' }),
      page.locator('table tbody tr').first().waitFor({ state: 'visible' })
    ]);

    if (await noPlansMessage.isVisible()) {
      await addTestPlanButton.waitFor({ state: 'visible' }); // Ensure button is visible before clicking
      await addTestPlanButton.click();
      await page.waitForURL('**/testplans/new');
      await page.fill('input[name="name"]', `실행 다이얼로그 테스트 플랜 ${Date.now()}`);
      await page.fill('textarea[name="description"]', '실행 다이얼로그 테스트를 위한 플랜입니다.');
      await page.click('button:has-text("저장")');
      await page.waitForURL(/\/projects\/[a-f0-9-]+\/testplans$/);
      await takeStepScreenshot(page, testInfo, '13-testplan-created-for-execution-dialog');
    }

    // 첫 번째 테스트 플랜의 실행 버튼 클릭하여 다이얼로그 열기
    const firstTestPlanRunButton = page.locator('table tbody tr').first().locator('button[title="실행"]');
    await expect(firstTestPlanRunButton).toBeVisible();
    await firstTestPlanRunButton.click();
    await takeStepScreenshot(page, testInfo, '14-opened-execution-dialog');

    // "새 실행 생성" 버튼 클릭 확인
    const newExecutionButton = page.locator('button:has-text("새 실행 생성")');
    await expect(newExecutionButton).toBeVisible();
    await newExecutionButton.click();
    await takeStepScreenshot(page, testInfo, '15-clicked-new-execution');
    // onStartExecution prop이 호출되면 /testexecutions/new로 이동한다고 가정
    await page.waitForURL(/\/testexecutions\/new$/);
    await expect(page).toHaveURL(/\/testexecutions\/new$/);
    await page.goBack(); // 이전 페이지로 돌아와서 다음 테스트를 위해 다이얼로그 다시 열기
    await page.waitForURL(/\/projects\/[a-f0-9-]+\/testplans$/);
    await firstTestPlanRunButton.click(); // 다이얼로그 다시 열기
    await takeStepScreenshot(page, testInfo, '16-navigated-to-new-execution-page-and-back');

    // 기존 실행이 있다면 "편집" 및 "전체화면 보기" 버튼 클릭 확인
    const existingExecutionItem = page.locator('ul[role="list"] li').first();
    if (await existingExecutionItem.isVisible()) {
      const editExecutionButton = existingExecutionItem.locator('button[title="편집"]');
      const viewExecutionButton = existingExecutionItem.locator('button[title="전체화면 보기"]');

      await expect(editExecutionButton).toBeVisible();
      await editExecutionButton.click();
      await takeStepScreenshot(page, testInfo, '17-clicked-edit-execution');
      // onEditExecution prop이 호출되면 /testexecutions/:id로 이동한다고 가정
      await page.waitForURL(/\/testexecutions\/[a-f0-9-]+\/$/);
      await expect(page).toHaveURL(/\/testexecutions\/[a-f0-9-]+\/$/);
      await page.goBack();
      await page.waitForURL(/\/projects\/[a-f0-9-]+\/testplans$/);
      await firstTestPlanRunButton.click();
      await takeStepScreenshot(page, testInfo, '18-navigated-to-edit-execution-page-and-back');

      await expect(viewExecutionButton).toBeVisible();
      await viewExecutionButton.click();
      await takeStepScreenshot(page, testInfo, '19-clicked-view-execution');
      // onViewExecution prop이 호출되면 /testexecutions/:id/view로 이동한다고 가정
      await page.waitForURL(/\/testexecutions\/[a-f0-9-]+\/view$/);
      await expect(page).toHaveURL(/\/testexecutions\/[a-f0-9-]+\/view$/);
      await page.goBack();
      await page.waitForURL(/\/projects\/[a-f0-9-]+\/testplans$/);
      await takeStepScreenshot(page, testInfo, '20-navigated-to-view-execution-page-and-back');
    }

    // 다이얼로그 닫기
    await page.locator('button:has-text("닫기")').click();
    await takeStepScreenshot(page, testInfo, '21-closed-execution-dialog');
  });
});
