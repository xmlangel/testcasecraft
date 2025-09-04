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
    const testCaseName = `스프레드시트 테스트 케이스 ${Date.now()}`;

    // 1. 상단에 프로젝트 선택 누름
    await page.click('button:has-text("프로젝트 선택")');
    await takeStepScreenshot(page, testInfo, '07-project-select-button-clicked');

    // 2. 데브옵스팀 > 인프라자동화 > 프로젝트 열기
    await page.click('text="데브옵스팀"');
    await takeStepScreenshot(page, testInfo, '08-devopsteam-selected');

    await page.waitForSelector('text="인프라 자동화"');
    await page.click('text="인프라 자동화"');
    await takeStepScreenshot(page, testInfo, '09-infra-automation-selected');

    await page.click('button:has-text("프로젝트 열기")');
    await takeStepScreenshot(page, testInfo, '10-open-project-clicked');

    await page.waitForURL(/\/projects\/[a-f0-9-]+/);
    await takeStepScreenshot(page, testInfo, '11-project-page-loaded');

    // 3. 테스트케이스 탭 선택
    await page.click('button:has-text("테스트케이스")');
    await takeStepScreenshot(page, testInfo, '12-testcase-tab-selected');

    await page.waitForURL(/\/projects\/[a-f0-9-]+\/testcases/);
    await takeStepScreenshot(page, testInfo, '13-testcase-list-page-loaded');

    // 4. "스프레드시트" 입력 모드 선택
    await page.click('button:has-text("스프레드시트")');
    await takeStepScreenshot(page, testInfo, '14-spreadsheet-mode-selected');

    // 5. 새 폴더 추가
    await page.click('button:has-text("폴더 추가")');
    await takeStepScreenshot(page, testInfo, '15-add-folder-button-clicked');

    await page.fill('input[label="폴더명"]', folderName);
    await takeStepScreenshot(page, testInfo, '16-folder-name-filled');

    await page.click('button:has-text("생성")');
    await takeStepScreenshot(page, testInfo, '17-create-folder-button-clicked');
    
    // 폴더 생성 후 스낵바 메시지 대기 (선택 사항)
    await page.waitForSelector('div[role="status"]', { state: 'hidden' }); // 스낵바가 사라질 때까지 대기
    await takeStepScreenshot(page, testInfo, '18-folder-created');

    // 6. 스프레드시트에 테스트 케이스 데이터 입력
    // 첫 번째 빈 행의 '타입' 셀 (인덱스 2)
    await page.locator('.react-spreadsheet-grid-cell').nth(2).click();
    await page.keyboard.type('테스트케이스');
    await takeStepScreenshot(page, testInfo, '19-type-filled');

    // '상위폴더' 셀 (인덱스 3)
    await page.locator('.react-spreadsheet-grid-cell').nth(3).click();
    await page.keyboard.type(folderName);
    await takeStepScreenshot(page, testInfo, '20-parent-folder-filled');

    // '이름' 셀 (인덱스 4)
    await page.locator('.react-spreadsheet-grid-cell').nth(4).click();
    await page.keyboard.type(testCaseName);
    await takeStepScreenshot(page, testInfo, '21-name-filled');

    // '설명' 셀 (인덱스 5)
    await page.locator('.react-spreadsheet-grid-cell').nth(5).click();
    await page.keyboard.type('스프레드시트를 통해 생성된 테스트 케이스 설명입니다.');
    await takeStepScreenshot(page, testInfo, '22-description-filled');

    // '사전조건' 셀 (인덱스 6)
    await page.locator('.react-spreadsheet-grid-cell').nth(6).click();
    await page.keyboard.type('스프레드시트 사전조건: 로그인 필요');
    await takeStepScreenshot(page, testInfo, '23-precondition-filled');

    // '예상결과' 셀 (인덱스 7)
    await page.locator('.react-spreadsheet-grid-cell').nth(7).click();
    await page.keyboard.type('스프레드시트 예상결과: 성공적으로 생성됨');
    await takeStepScreenshot(page, testInfo, '24-expected-results-filled');

    // 'Step 1' 셀 (인덱스 8)
    await page.locator('.react-spreadsheet-grid-cell').nth(8).click();
    await page.keyboard.type('스프레드시트 스텝 1');
    await takeStepScreenshot(page, testInfo, '25-step1-filled');

    // 'Expected 1' 셀 (인덱스 9)
    await page.locator('.react-spreadsheet-grid-cell').nth(9).click();
    await page.keyboard.type('스프레드시트 예상 1');
    await takeStepScreenshot(page, testInfo, '26-expected1-filled');

    // 7. "일괄 저장" 버튼 클릭
    await page.click('button:has-text("일괄 저장")');
    await takeStepScreenshot(page, testInfo, '27-bulk-save-button-clicked');

    // 저장 성공 확인 (스낵바 메시지 대기)
    await page.waitForSelector('div[role="status"]', { state: 'hidden' }); // 스낵바가 사라질 때까지 대기
    await takeStepScreenshot(page, testInfo, '28-save-success-snackbar-hidden');

    // 8. 테스트케이스 목록 페이지로 이동하여 생성된 폴더와 테스트 케이스 확인
    // (스프레드시트 저장 후 자동으로 목록으로 이동하지 않는 경우)
    // await page.click('button:has-text("테스트케이스")'); // 다시 테스트케이스 탭 클릭
    // await page.waitForURL(/\/projects\/[a-f0-9-]+\/testcases/);
    // await takeStepScreenshot(page, testInfo, '29-redirected-to-testcase-list');

    await expect(page.locator(`text="${folderName}"`)).toBeVisible();
    await takeStepScreenshot(page, testInfo, '29-folder-verified');

    await expect(page.locator(`text="${testCaseName}"`)).toBeVisible();
    await takeStepScreenshot(page, testInfo, '30-testcase-verified');

    console.log(`✅ 스프레드시트 폴더 '${folderName}' 및 테스트 케이스 '${testCaseName}' 생성 완료 및 확인`);
  });
});
