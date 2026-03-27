/**
 * 스프레드시트를 이용한 테스트 케이스 및 폴더 생성 E2E 테스트 절차:
 * 1. 로그인 (admin/admin123)
 * 2. 프로젝트 상세 진입 후 '테스트케이스' 탭 이동
 * 3. 입력 모드를 '스프레드시트' 모드로 전환
 * 4. '행 추가'를 통해 폴더(Type: 폴더) 데이터 입력 (이름)
 * 5. '행 추가'를 통해 테스트케이스(Type: 테스트케이스) 데이터 입력 (이름, 상위폴더, 설명, 스텝 등)
 * 6. '일괄 저장' 실행 및 성공 스낵바 메시지 확인 (에러 발생 시 즉시 실패 처리)
 * 7. 로컬 스토리지/DB 동기화 대기 후 트리 뷰에서 생성된 폴더와 TC가 정상 표시되는지 검증
 */

const { test, expect } = require("../fixtures/test-fixtures.js");
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require("../config/credentials.js");

test.describe("스프레드시트를 이용한 테스트 케이스 생성 테스트", () => {
  test.beforeEach(async ({ loginPage, projectListPage }) => {
    await loginPage.goto();
    await loginPage.clearStorage();
    await loginPage.waitForBackend();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await projectListPage.waitForLoad();
  });

  test("스프레드시트를 통해 새로운 테스트 케이스와 폴더를 생성한다", async ({
    page,
    projectListPage,
    testCasePage,
  }) => {
    const folderName = `스프레드시트 폴더 ${Date.now()}`;
    const testCaseName = `스프레드시트 TC ${Date.now()}`;

    // 1. 프로젝트 페이지로 이동 및 테스트케이스 탭 선택
    await projectListPage.clickProjectSelectMenu();
    await projectListPage.openFirstProject();
    await page.waitForURL(/\/projects\/[a-f0-9-]+/);

    await testCasePage.goToTestCaseTab();
    await testCasePage.screen("12-testcase-tab-selected");

    // 2. "스프레드시트" 입력 모드 선택
    await testCasePage.selectSpreadsheetMode();
    await testCasePage.screen("14-spreadsheet-mode-selected");

    // 3. 스프레드시트에 폴더 데이터 입력 (새 행 추가)
    await testCasePage.addSpreadsheetRow();

    // '타입' 셀 (인덱스 4), '이름' 셀 (인덱스 6)
    await testCasePage.fillSpreadsheetCell(-1, 4, "폴더");
    await testCasePage.fillSpreadsheetCell(-1, 6, folderName);
    await testCasePage.screen("16-folder-name-filled");

    // 4. 스프레드시트에 테스트 케이스 데이터 입력 (새 행 추가)
    await testCasePage.addSpreadsheetRow();

    await testCasePage.fillSpreadsheetCell(-1, 4, "테스트케이스");
    await testCasePage.fillSpreadsheetCell(-1, 5, folderName); // 상위폴더
    await testCasePage.fillSpreadsheetCell(-1, 6, testCaseName);
    await testCasePage.fillSpreadsheetCell(
      -1,
      7,
      "스프레드시트를 통해 생성된 TC 설명",
    );
    await testCasePage.fillSpreadsheetCell(-1, 8, "사전조건: 로그인 필요");
    await testCasePage.fillSpreadsheetCell(-1, 15, "스텝 1 설명"); // Step 1
    await testCasePage.fillSpreadsheetCell(-1, 16, "스텝 1 예상 결과"); // Expected 1
    await testCasePage.screen("23-expected1-filled");

    // 5. "일괄 저장" 버튼 클릭
    await testCasePage.bulkSave();
    await testCasePage.screen("24-bulk-save-button-clicked");

    // 저장 성공 메시지 대기
    const successLocator = page.locator(
      "text=/배치 저장 완료|개의 테스트케이스가 저장되었습니다/",
    );
    await expect(successLocator).toBeVisible({ timeout: 15000 });
    await testCasePage.screen("25-save-success-snackbar-visible");

    // 트리 뷰 검증
    await page.waitForTimeout(2000);
    const folderInTree = page.locator(`p:text("${folderName}")`);
    await expect(folderInTree).toBeVisible({ timeout: 10000 });
    await folderInTree.click();

    const testCaseInTree = page.locator(`p:text("${testCaseName}")`);
    await expect(testCaseInTree).toBeVisible({ timeout: 10000 });

    console.log(
      `✅ 스프레드시트 폴더 '${folderName}' 및 테스트 케이스 '${testCaseName}' 생성 완료 및 확인`,
    );
  });
});
