
// e2e-tests/regression/testplanlist.spec.js: TestPlanList 컴포넌트 회귀 테스트
const { test, expect } = require('@playwright/test');
const { takeStepScreenshot } = require('../utils/testUtils.js');

test.describe('TestPlanList 컴포넌트 회귀 테스트', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await takeStepScreenshot(page, testInfo, '01-initial-page');

    // 백엔드 서버 준비 확인 및 로그인 (login.spec.js에서 복사)
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

    // 프로젝트 목록 페이지에서 첫 번째 프로젝트의 "프로젝트 열기" 버튼 클릭
    await page.waitForSelector('button:has-text("프로젝트 열기")');
    await page.locator('button:has-text("프로젝트 열기")').first().click();
    
    // 프로젝트 대시보드 페이지로 이동했는지 확인 (예: /projects/1)
    await page.waitForURL(/\/projects\/\d+$/);
    await takeStepScreenshot(page, testInfo, '03-navigated-to-project-dashboard');

    // ProjectHeader에서 "테스트플랜" 탭 클릭 (tabIndex 2)
    await page.locator('button[role="tab"]:has-text("테스트플랜")').click();

    // 테스트 플랜 목록 페이지로 이동했는지 확인 (예: /projects/1/testplans)
    await page.waitForURL(/\/projects\/\d+\/testplans$/);
    await takeStepScreenshot(page, testInfo, '04-navigated-to-testplans-list');
  });

  test('테스트 플랜 목록 페이지 로드 및 기본 요소 확인', async ({ page }, testInfo) => {
    // "테스트 플랜 추가" 버튼 확인
    const addTestPlanButton = page.locator('button:has-text("테스트 플랜 추가")');
    await expect(addTestPlanButton).toBeVisible();
    await takeStepScreenshot(page, testInfo, '04-add-testplan-button-visible');

    // 테이블 헤더 확인
    await expect(page.locator('th:has-text("이름")')).toBeVisible();
    await expect(page.locator('th:has-text("설명")')).toBeVisible();
    await expect(page.locator('th:has-text("테스트케이스 수")')).toBeVisible();
    await expect(page.locator('th:has-text("생성일")')).toBeVisible();
    await expect(page.locator('th:has-text("실행")')).toBeVisible();
    await expect(page.locator('th:has-text("수정")')).toBeVisible();
    await expect(page.locator('th:has-text("삭제")')).toBeVisible();
    await takeStepScreenshot(page, testInfo, '05-table-headers-visible');

    // "등록된 테스트 플랜이 없습니다." 메시지 또는 테이블 행 확인
    const noPlansMessage = page.locator('text="등록된 테스트 플랜이 없습니다."');
    const tableRows = page.locator('table tbody tr');

    if (await noPlansMessage.isVisible()) {
      await expect(noPlansMessage).toBeVisible();
      await takeStepScreenshot(page, testInfo, '06-no-testplans-message');
    } else {
      await expect(tableRows.first()).toBeVisible();
      // 테이블 행에 실행, 수정, 삭제 버튼이 있는지 확인
      await expect(tableRows.first().locator('button[title="실행"]')).toBeVisible();
      await expect(tableRows.first().locator('button[title="수정"]')).toBeVisible();
      await expect(tableRows.first().locator('button[title="삭제"]')).toBeVisible();
      await takeStepScreenshot(page, testInfo, '06-testplans-listed');
    }
  });

  test('새 테스트 플랜 추가 버튼 클릭 시 페이지 이동 확인', async ({ page }, testInfo) => {
    const addTestPlanButton = page.locator('button:has-text("테스트 플랜 추가")');
    await addTestPlanButton.click();
    await takeStepScreenshot(page, testInfo, '07-clicked-add-testplan');

    // 새 테스트 플랜 생성 페이지로 이동했는지 확인 (URL 패턴 확인)
    // TestPlanList.jsx의 onNewTestPlan prop이 호출되면 /testplans/new로 이동한다고 가정
    await page.waitForURL('**/testplans/new');
    await expect(page).toHaveURL(/testplans\/new$/);
    await takeStepScreenshot(page, testInfo, '08-navigated-to-new-testplan-page');
  });

  test('테스트 플랜 실행 다이얼로그 열기 및 실행 이력 요소 확인', async ({ page }, testInfo) => {
    // 최소 하나의 테스트 플랜이 존재해야 함
    const firstTestPlanRunButton = page.locator('table tbody tr').first().locator('button[title="실행"]');
    await expect(firstTestPlanRunButton).toBeVisible();
    await firstTestPlanRunButton.click();
    await takeStepScreenshot(page, testInfo, '09-clicked-run-testplan');

    // 실행 다이얼로그가 열렸는지 확인
    const executionDialogTitle = page.locator('h2:has-text("테스트 실행")');
    await expect(executionDialogTitle).toBeVisible();
    await takeStepScreenshot(page, testInfo, '10-execution-dialog-opened');

    // 다이얼로그 내 "새 실행 생성" 버튼 확인
    const newExecutionButton = page.locator('button:has-text("새 실행 생성")');
    await expect(newExecutionButton).toBeVisible();
    await takeStepScreenshot(page, testInfo, '11-new-execution-button-visible');

    // 실행 이력 또는 메시지 확인
    const noExecutionsMessage = page.locator('text="이 테스트 플랜의 실행 이력이 없습니다."');
    const executionListItems = page.locator('.MuiList-root .MuiListItem-root');

    if (await noExecutionsMessage.isVisible()) {
      await expect(noExecutionsMessage).toBeVisible();
      await takeStepScreenshot(page, testInfo, '12-no-executions-message');
    } else {
      await expect(executionListItems.first()).toBeVisible();
      // 첫 번째 실행 이력의 요소들 확인
      const firstExecution = executionListItems.first();
      await expect(firstExecution.locator('.MuiTypography-body1')).toBeVisible(); // 실행 이름
      await expect(firstExecution.locator('.MuiChip-root')).toBeVisible(); // 상태 칩
      await expect(firstExecution.locator('.MuiLinearProgress-root')).toBeVisible(); // 진행률 바
      await expect(firstExecution.locator('button[title="편집"]')).toBeVisible(); // 편집 버튼
      await expect(firstExecution.locator('button[title="전체화면 보기"]')).toBeVisible(); // 전체화면 보기 버튼
      await takeStepScreenshot(page, testInfo, '12-executions-listed');
    }

    // 다이얼로그 닫기
    await page.locator('button:has-text("닫기")').click();
    await expect(executionDialogTitle).not.toBeVisible();
    await takeStepScreenshot(page, testInfo, '13-execution-dialog-closed');
  });

  test('테스트 플랜 삭제 다이얼로그 열기 및 확인', async ({ page }, testInfo) => {
    // 최소 하나의 테스트 플랜이 존재해야 함
    const firstTestPlanDeleteButton = page.locator('table tbody tr').first().locator('button[title="삭제"]');
    await expect(firstTestPlanDeleteButton).toBeVisible();
    await firstTestPlanDeleteButton.click();
    await takeStepScreenshot(page, testInfo, '14-clicked-delete-testplan');

    // 삭제 확인 다이얼로그가 열렸는지 확인
    const deleteDialogTitle = page.locator('h2:has-text("테스트 플랜 삭제")');
    await expect(deleteDialogTitle).toBeVisible();
    await takeStepScreenshot(page, testInfo, '15-delete-dialog-opened');

    // 다이얼로그 내용 및 버튼 확인
    await expect(page.locator('text="정말로 이 테스트 플랜을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다."')).toBeVisible();
    await expect(page.locator('button:has-text("취소")')).toBeVisible();
    await expect(page.locator('button:has-text("삭제")')).toBeVisible();
    await takeStepScreenshot(page, testInfo, '16-delete-dialog-elements-visible');

    // 다이얼로그 닫기 (취소 버튼 클릭)
    await page.locator('button:has-text("취소")').click();
    await expect(deleteDialogTitle).not.toBeVisible();
    await takeStepScreenshot(page, testInfo, '17-delete-dialog-closed');
  });
});
