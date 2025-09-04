// e2e-tests/regression/create-testcase-spreadsheet.spec.js: 스프레드시트를 이용한 테스트 케이스 생성 E2E 테스트
const { test, expect } = require('@playwright/test');
const { takeStepScreenshot } = require('../utils/testUtils.js');

test.describe('스프레드시트를 이용한 테스트 케이스 생성 테스트', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await takeStepScreenshot(page, testInfo, '01-initial-page');

    // 로그인 로직
    let backendReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch(`http://localhost:8080/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin' })
        });
        backendReady = true;
        break;
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    if (!backendReady) {
      throw new Error('백엔드 서버가 준비되지 않았습니다');
    }
    await takeStepScreenshot(page, testInfo, '02-backend-ready');

    await page.fill('input[name="username"]', 'admin');
    await takeStepScreenshot(page, testInfo, '03-username-filled');

    await page.fill('input[name="password"]', 'admin');
    await takeStepScreenshot(page, testInfo, '04-password-filled');

    await page.click('button[type="submit"]');
    await takeStepScreenshot(page, testInfo, '05-after-login-click');

    await page.waitForURL('/projects');
    await takeStepScreenshot(page, testInfo, '06-redirected-to-projects');
  });

  test('스프레드시트를 통해 새로운 테스트 케이스와 폴더를 생성한다', async ({ page }, testInfo) => {
    const folderName = `스프레드시트 폴더 ${Date.now()}`;
    const testCaseName = `스프레드시트 TC ${Date.now()}`;

    // 1. 프로젝트 페이지로 이동 및 테스트케이스 탭 선택
    await page.click('button:has-text("프로젝트 선택")');
    await takeStepScreenshot(page, testInfo, '07-project-select-button-clicked');

    await page.click('text="데브옵스팀"');
    await takeStepScreenshot(page, testInfo, '08-devopsteam-selected');

    await page.waitForSelector('text="인프라 자동화"');
    await page.click('text="인프라 자동화"');
    await takeStepScreenshot(page, testInfo, '09-infra-automation-selected');

    await page.click('button:has-text("프로젝트 열기")');
    await takeStepScreenshot(page, testInfo, '10-open-project-clicked');

    await page.waitForURL(/\/projects\/[a-f0-9-]+/);
    await takeStepScreenshot(page, testInfo, '11-project-page-loaded');

    await page.click('button:has-text("테스트케이스")');
    await takeStepScreenshot(page, testInfo, '12-testcase-tab-selected');

    await page.waitForURL(/\/projects\/[a-f0-9-]+\/testcases/);
    await takeStepScreenshot(page, testInfo, '13-testcase-list-page-loaded');

    // 2. "고급 스프레드시트" 입력 모드 선택
    await page.click('button:has-text("고급 스프레드시트")');
    await takeStepScreenshot(page, testInfo, '14-spreadsheet-mode-selected');
    await page.waitForSelector('th:has-text("이름")'); // 스프레드시트 로드 대기

    // 3. 스프레드시트에 폴더 데이터 입력 (첫 번째 행)
    // '타입' 셀 (인덱스 2)
    const folderTypeCell = page.locator('tbody tr:nth-child(1) td').nth(2);
    await folderTypeCell.click();
    await page.locator('input:focus, textarea:focus').fill('폴더');
    await takeStepScreenshot(page, testInfo, '15-folder-type-filled');

    // '이름' 셀 (인덱스 4)
    const folderNameCell = page.locator('tbody tr:nth-child(1) td').nth(4);
    await folderNameCell.click();
    await page.locator('input:focus, textarea:focus').fill(folderName);
    await takeStepScreenshot(page, testInfo, '16-folder-name-filled');

    // 4. 스프레드시트에 테스트 케이스 데이터 입력 (두 번째 행)
    // '타입' 셀 (인덱스 2)
    const tcTypeCell = page.locator('tbody tr:nth-child(2) td').nth(2);
    await tcTypeCell.click();
    await page.locator('input:focus, textarea:focus').fill('테스트케이스');
    await takeStepScreenshot(page, testInfo, '17-tc-type-filled');

    // '상위폴더' 셀 (인덱스 3)
    const parentFolderCell = page.locator('tbody tr:nth-child(2) td').nth(3);
    await parentFolderCell.click();
    await page.locator('input:focus, textarea:focus').fill(folderName);
    await takeStepScreenshot(page, testInfo, '18-parent-folder-filled');

    // '이름' 셀 (인덱스 4)
    const tcNameCell = page.locator('tbody tr:nth-child(2) td').nth(4);
    await tcNameCell.click();
    await page.locator('input:focus, textarea:focus').fill(testCaseName);
    await takeStepScreenshot(page, testInfo, '19-tc-name-filled');

    // '설명' 셀 (인덱스 5)
    const descriptionCell = page.locator('tbody tr:nth-child(2) td').nth(5);
    await descriptionCell.click();
    await page.locator('input:focus, textarea:focus').fill('스프레드시트를 통해 생성된 TC 설명');
    await takeStepScreenshot(page, testInfo, '20-description-filled');

    // '사전조건' 셀 (인덱스 6)
    const preConditionCell = page.locator('tbody tr:nth-child(2) td').nth(6);
    await preConditionCell.click();
    await page.locator('input:focus, textarea:focus').fill('사전조건: 로그인 필요');
    await takeStepScreenshot(page, testInfo, '21-precondition-filled');

    // 'Step 1' 셀 (인덱스 8)
    const step1Cell = page.locator('tbody tr:nth-child(2) td').nth(8);
    await step1Cell.click();
    await page.locator('input:focus, textarea:focus').fill('스텝 1 설명');
    await takeStepScreenshot(page, testInfo, '22-step1-filled');

    // 'Expected 1' 셀 (인덱스 9)
    const expected1Cell = page.locator('tbody tr:nth-child(2) td').nth(9);
    await expected1Cell.click();
    await page.locator('input:focus, textarea:focus').fill('스텝 1 예상 결과');
    await takeStepScreenshot(page, testInfo, '23-expected1-filled');

    // 5. "일괄 저장" 버튼 클릭
    await page.click('button:has-text("일괄 저장")');
    await takeStepScreenshot(page, testInfo, '24-bulk-save-button-clicked');

    // 저장 성공 확인 (스낵바 메시지 대기)
    await expect(page.locator('text=/개의 테스트케이스가 저장되었습니다./')).toBeVisible({ timeout: 10000 });
    await takeStepScreenshot(page, testInfo, '25-save-success-snackbar-visible');
    
    // 스낵바가 사라질 때까지 대기
    await page.waitForSelector('div[role="status"]', { state: 'hidden', timeout: 10000 });
    await takeStepScreenshot(page, testInfo, '26-save-success-snackbar-hidden');

    // 6. 테스트케이스 트리에서 생성된 폴더와 테스트 케이스 확인
    // 트리가 업데이트될 시간을 줌
    await page.waitForTimeout(1000);

    // 더 구체적인 선택자(p 태그)를 사용하여 트리에 있는 폴더를 정확히 타겟팅
    const folderInTree = page.locator(`p:text("${folderName}")`);
    await expect(folderInTree).toBeVisible();
    await takeStepScreenshot(page, testInfo, '27-folder-verified-in-tree');

    // 폴더를 클릭하여 내부의 테스트 케이스를 표시
    await folderInTree.click();
    await takeStepScreenshot(page, testInfo, '28-folder-clicked-in-tree');

    // 더 구체적인 선택자(p 태그)를 사용하여 트리에 있는 테스트 케이스를 정확히 타겟팅
    const testCaseInTree = page.locator(`p:text("${testCaseName}")`);
    await expect(testCaseInTree).toBeVisible();
    await takeStepScreenshot(page, testInfo, '29-testcase-verified-in-tree');

    console.log(`✅ 스프레드시트 폴더 '${folderName}' 및 테스트 케이스 '${testCaseName}' 생성 완료 및 확인`);
  });
});
