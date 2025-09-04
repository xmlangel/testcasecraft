// e2e-tests/project/create-testcase.spec.js: 프로젝트 내 테스트 케이스 생성 E2E 테스트
const { test, expect } = require('@playwright/test');
const { takeStepScreenshot } = require('../utils/testUtils.js');

test.describe('프로젝트 내 테스트 케이스 생성 테스트', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await takeStepScreenshot(page, testInfo, '01-initial-page');

    // 로그인 로직 (regression/login.spec.js에서 복사)
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

  test('새로운 테스트 케이스를 생성한다', async ({ page }, testInfo) => {
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

    // 4. 개별폼 선택 (테스트 케이스 생성 폼으로 이동)
    await page.click('button:has-text("개별 폼")');
    await takeStepScreenshot(page, testInfo, '14-individual-form-selected');

    await page.waitForSelector('h6:has-text("테스트케이스 생성")');
    await takeStepScreenshot(page, testInfo, '15-create-testcase-form-loaded');

    // 5. 테스트 케이스 생성 (이름, 설명, Pre-condition)
    const testCaseName = `자동화 테스트 케이스 ${Date.now()}`;
    await page.locator('div[role="button"]:has-text("테스트케이스 정보")').waitFor({ state: 'visible' });
    await page.click('div[role="button"]:has-text("테스트케이스 정보")');
    await takeStepScreenshot(page, testInfo, '16-testcase-info-expanded');

    await page.getByLabel('이름').waitFor({ state: 'visible' });
    await page.getByLabel('이름').fill(testCaseName);
    await takeStepScreenshot(page, testInfo, '17-testcase-name-filled');

    await page.getByLabel('설명').fill('이것은 자동화 테스트를 통해 생성된 테스트 케이스입니다.');
    await takeStepScreenshot(page, testInfo, '18-description-filled');

    await page.getByLabel('Pre-condition').fill('사전 조건: 시스템에 로그인되어 있어야 합니다.');
    await takeStepScreenshot(page, testInfo, '19-precondition-filled');

    // 6. 테스트 스텝 3개 이상 추가
    await page.click('button:has-text("스텝 추가")');
    await page.getByPlaceholder('Step 설명').nth(0).fill('첫 번째 스텝 설명');
    await page.getByPlaceholder('예상 결과').nth(0).fill('첫 번째 예상 결과');
    await takeStepScreenshot(page, testInfo, '20-step1-added');

    await page.click('button:has-text("스텝 추가")');
    await page.getByPlaceholder('Step 설명').nth(1).fill('두 번째 스텝 설명');
    await page.getByPlaceholder('예상 결과').nth(1).fill('두 번째 예상 결과');
    await takeStepScreenshot(page, testInfo, '21-step2-added');

    await page.click('button:has-text("스텝 추가")');
    await page.getByPlaceholder('Step 설명').nth(2).fill('세 번째 스텝 설명');
    await page.getByPlaceholder('예상 결과').nth(2).fill('세 번째 예상 결과');
    await takeStepScreenshot(page, testInfo, '22-step3-added');

    await page.getByPlaceholder('전체 예상 결과').fill('이 테스트 케이스의 모든 스텝에 대한 전체 예상 결과입니다.');
    await takeStepScreenshot(page, testInfo, '23-overall-expected-result-filled');

    // 7. 저장 버튼 클릭
    await page.locator('button:has-text("저장")').last().click();
    await takeStepScreenshot(page, testInfo, '24-save-button-clicked');
    
    await page.waitForURL(/\/projects\/[a-f0-9-]+\/testcases/);
    await takeStepScreenshot(page, testInfo, '25-redirected-to-testcase-list');

    await expect(page.locator(`text="${testCaseName}"`)).toBeVisible();
    await takeStepScreenshot(page, testInfo, '26-testcase-created-and-verified');

    console.log(`✅ 테스트 케이스 '${testCaseName}' 생성 완료 및 확인`);
  });
});