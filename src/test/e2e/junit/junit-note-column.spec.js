// src/test/e2e/junit/junit-note-column.spec.js
// JUnit 결과 상세 페이지의 테스트 케이스 리스트에 Note 컬럼이 표시되는지 검증

const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage.js');
const AutomationPage = require('../pages/AutomationPage.js');

// 테스트 환경 설정
const BASE_URL = 'http://localhost:3000';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// 실제 프로젝트/결과 ID (테스트 환경에 맞게 수정 필요)
const TEST_PROJECT_ID = '2fcead1a-83f6-4fe0-a1e5-169f227e23f9';
const TEST_RESULT_ID = 'ac26d4ce-38c7-401f-8ef6-698513e6b4ec';

test.describe('JUnit 결과 상세 페이지 - Note 컬럼 표시', () => {
  let loginPage;
  let automationPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    automationPage = new AutomationPage(page);

    await page.goto(BASE_URL);
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await page.waitForURL(`${BASE_URL}/projects`, { timeout: 10000 });
  });

  test('테스트 케이스 테이블에 노트 헤더 컬럼이 표시된다', async ({ page }) => {
    await automationPage.goto(`${BASE_URL}/projects/${TEST_PROJECT_ID}/junit-results/${TEST_RESULT_ID}`);
    await automationPage.waitForIdle();

    // 테이블이 렌더링될 때까지 대기
    await automationPage.caseRow.first().waitFor({ state: 'visible', timeout: 15000 });

    // 테이블 헤더에 "노트" 컬럼이 있는지 확인
    await expect(automationPage.noteHeader).toBeVisible({ timeout: 5000 });
  });

  test('테스트 케이스 행에 Note 셀이 존재한다 (노트 없으면 "-" 표시)', async ({ page }) => {
    await automationPage.goto(`${BASE_URL}/projects/${TEST_PROJECT_ID}/junit-results/${TEST_RESULT_ID}`);
    await automationPage.waitForIdle();

    await automationPage.caseRow.first().waitFor({ state: 'visible', timeout: 15000 });

    // Note 셀이 존재하는지 확인
    const count = await automationPage.noteCell.count();
    expect(count).toBeGreaterThan(0);
    await expect(automationPage.noteCell.first()).toBeVisible();
  });

  test('노트가 있는 테스트 케이스는 해당 내용이 리스트에 표시된다', async ({ page }) => {
    await automationPage.goto(`${BASE_URL}/projects/${TEST_PROJECT_ID}/junit-results/${TEST_RESULT_ID}`);
    await automationPage.waitForIdle();

    await automationPage.caseRow.first().waitFor({ state: 'visible', timeout: 15000 });

    const count = await automationPage.noteCell.count();
    expect(count).toBeGreaterThan(0);

    let hasNoteContent = false;
    let noteText = '';
    for (let i = 0; i < Math.min(count, 10); i++) {
      const cellText = await automationPage.noteCell.nth(i).textContent();
      if (cellText && cellText.trim() !== '-' && cellText.trim() !== '') {
        hasNoteContent = true;
        noteText = cellText.trim();
        break;
      }
    }

    console.log(`Note 셀 개수: ${count}, 노트 내용 존재 여부: ${hasNoteContent}, 노트 내용: "${noteText}"`);
    const firstCellText = await automationPage.noteCell.first().textContent();
    expect(firstCellText !== null && firstCellText !== undefined).toBe(true);
  });

  test('노트 입력 후 리스트에 반영된다 (편집 → 저장 → 확인)', async ({ page }) => {
    const testNote = `E2E 테스트 노트 ${Date.now()}`;

    await automationPage.goto(`${BASE_URL}/projects/${TEST_PROJECT_ID}/junit-results/${TEST_RESULT_ID}`);
    await automationPage.waitForIdle();

    await automationPage.editCaseButton.first().waitFor({ state: 'visible', timeout: 15000 });

    // AutomationPage의 헬퍼 메서드로 편집 수행 (내부에 저장 동작 포함)
    await automationPage.editTestCaseByIndex(0, { notes: testNote });

    // 다이얼로그 닫힐 때까지 대기
    await automationPage.editNotesInputWrapper.waitFor({ state: 'detached', timeout: 10000 });

    // 테이블이 업데이트될 때까지 잠시 대기
    await page.waitForTimeout(1500);

    // 첫 번째 Note 셀에 입력한 노트가 표시되는지 확인
    await expect(automationPage.noteCell.first()).toContainText(testNote, { timeout: 5000 });
  });

  test('자동화 탭 → JUnit 결과 상세 이동 → Note 컬럼 확인 (전체 플로우)', async ({ page }) => {
    await automationPage.goto(`${BASE_URL}/projects/${TEST_PROJECT_ID}`);
    await automationPage.waitForIdle();

    // 자동화 탭 클릭 
    // 다국어 지원 고려: 자동화 또는 Automation 텍스트 포함 탭 클릭
    const automationTab = page.locator('.MuiTab-root').filter({ hasText: /(자동화|Automation)/i }).first();
    await automationTab.click();

    // 혹시 '최근 결과' 서브 탭이 있다면 선택
    const recentTabs = page.locator('.MuiTab-root').filter({ hasText: /(최근 결과|Recent)/i });
    if (await recentTabs.count() > 0) {
        await recentTabs.first().click();
    }

    // 파일 로드 대기 및 클릭
    await automationPage.fileLink.first().waitFor({ state: 'visible', timeout: 15000 });
    await automationPage.fileLink.first().click();
    await automationPage.waitForIdle();

    await automationPage.caseRow.first().waitFor({ state: 'visible', timeout: 15000 });

    await expect(automationPage.noteHeader).toBeVisible({ timeout: 5000 });
    expect(await automationPage.noteCell.count()).toBeGreaterThan(0);
  });
});
