// e2e-tests/regression/create-testcase-spreadsheet-standard.spec.js: 표준 스프레드시트를 이용한 테스트 케이스 생성 E2E 테스트
const { test, expect } = require('@playwright/test');
const { takeStepScreenshot } = require('../utils/testUtils.js');

test.describe('표준 스프레드시트를 이용한 테스트 케이스 생성 테스트', () => {
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

  test('표준 스프레드시트를 통해 새로운 테스트 케이스와 폴더를 생성한다', async ({ page }, testInfo) => {
    const folderName = `표준 스프레드시트 폴더 ${Date.now()}`;
    const testCaseName = `표준 스프레드시트 TC ${Date.now()}`;

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

    // 2. "스프레드시트" 입력 모드 선택
    await page.click('button:has-text("스프레드시트")');
    await takeStepScreenshot(page, testInfo, '14-spreadsheet-mode-selected');
    await page.waitForSelector('th:has-text("이름")'); // 스프레드시트 헤더 로드 대기

    // 3. 스프레드시트에 폴더 데이터 입력 (첫 번째 데이터 행)
    const folderRow = page.locator('table tr').nth(1); // nth(0)은 헤더

    // '타입' 셀 (인덱스 2)
    await folderRow.locator('td').nth(2).dblclick({ force: true });
    await page.locator('input:focus, textarea:focus').fill('폴더');
    await page.keyboard.press('Enter'); // 변경사항 확정을 위해 Enter 키 입력
    await takeStepScreenshot(page, testInfo, '15-folder-type-filled');

    // '이름' 셀 (인덱스 4)
    await folderRow.locator('td').nth(4).dblclick({ force: true });
    await page.locator('input:focus, textarea:focus').fill(folderName);
    await page.keyboard.press('Enter');
    await takeStepScreenshot(page, testInfo, '16-folder-name-filled');

    // 4. 스프레드시트에 테스트 케이스 데이터 입력 (두 번째 데이터 행)
    const testCaseRow = page.locator('table tr').nth(2);

    // '타입' 셀 (인덱스 2)
    await testCaseRow.locator('td').nth(2).dblclick({ force: true });
    await page.locator('input:focus, textarea:focus').fill('테스트케이스');
    await page.keyboard.press('Enter');
    await takeStepScreenshot(page, testInfo, '17-tc-type-filled');

    // '상위폴더' 셀 (인덱스 3)
    await testCaseRow.locator('td').nth(3).dblclick({ force: true });
    await page.locator('input:focus, textarea:focus').fill(folderName);
    await page.keyboard.press('Enter');
    await takeStepScreenshot(page, testInfo, '18-parent-folder-filled');

    // '이름' 셀 (인덱스 4)
    await testCaseRow.locator('td').nth(4).dblclick({ force: true });
    await page.locator('input:focus, textarea:focus').fill(testCaseName);
    await page.keyboard.press('Enter');
    await takeStepScreenshot(page, testInfo, '19-tc-name-filled');

    // '설명' 셀 (인덱스 5)
    await testCaseRow.locator('td').nth(5).dblclick({ force: true });
    await page.locator('input:focus, textarea:focus').fill('표준 스프레드시트를 통해 생성된 TC');
    await page.keyboard.press('Enter');
    await takeStepScreenshot(page, testInfo, '20-description-filled');

    // 'Step 1' 셀 (인덱스 8)
    await testCaseRow.locator('td').nth(8).dblclick({ force: true });
    await page.locator('input:focus, textarea:focus').fill('표준 스텝 1');
    await page.keyboard.press('Enter');
    await takeStepScreenshot(page, testInfo, '21-step1-filled');

    // 'Expected 1' 셀 (인덱스 9)
    await testCaseRow.locator('td').nth(9).dblclick({ force: true });
    await page.locator('input:focus, textarea:focus').fill('표준 예상 1');
    await page.keyboard.press('Enter');
    await takeStepScreenshot(page, testInfo, '22-expected1-filled');

    // 5. "일괄 저장" 버튼 클릭
    await page.click('button:has-text("일괄 저장")');
    await takeStepScreenshot(page, testInfo, '23-bulk-save-button-clicked');

    // 저장 성공 또는 실패 메시지 대기
    const successLocator = page.locator('text=/개의 테스트케이스가 저장되었습니다./');
    const errorLocator = page.locator('text=/저장 중 오류가 발생했습니다|' + '데이터 검증 실패/');

    await expect(successLocator.or(errorLocator)).toBeVisible({ timeout: 15000 });

    // 오류 발생 시 테스트를 실패시키고 메시지 출력
    const isError = await errorLocator.isVisible();
    if (isError) {
      const errorMessage = await errorLocator.textContent();
      throw new Error(`저장 실패: ${errorMessage}`);
    }

    // 성공 확인
    await expect(successLocator).toBeVisible();
    await takeStepScreenshot(page, testInfo, '24-save-success-snackbar-visible');
    
    // 스낵바가 사라질 때까지 대기
    await page.waitForSelector('div[role="status"]', { state: 'hidden', timeout: 10000 });
    await takeStepScreenshot(page, testInfo, '25-save-success-snackbar-hidden');

    // 6. 테스트케이스 트리에서 생성된 폴더와 테스트 케이스 확인
    await page.waitForTimeout(1000); // 트리가 업데이트될 시간을 줌

    const folderInTree = page.locator(`p:text("${folderName}")`);
    await expect(folderInTree).toBeVisible();
    await takeStepScreenshot(page, testInfo, '26-folder-verified-in-tree');

    await folderInTree.click();
    await takeStepScreenshot(page, testInfo, '27-folder-clicked-in-tree');
    
    const testCaseInTree = page.locator(`p:text("${testCaseName}")`);
    await expect(testCaseInTree).toBeVisible();
    await takeStepScreenshot(page, testInfo, '28-testcase-verified-in-tree');

    console.log(`✅ 표준 스프레드시트 폴더 '${folderName}' 및 테스트 케이스 '${testCaseName}' 생성 완료 및 확인`);
  });
});
