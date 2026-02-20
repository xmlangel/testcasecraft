/**
 * 프로젝트 내 테스트 케이스 생성 E2E 테스트 (개별 폼 모드) 절차:
 * 1. 로그인 (admin/admin123)
 * 2. 프로젝트 리스트에서 '프로젝트 선택' 후 첫 번째 프로젝트 상세 진입
 * 3. '테스트케이스' 탭으로 이동
 * 4. 입력 모드를 '개별 폼'으로 전환 및 신규 생성(/new) 페이지로 이동
 * 5. '테스트케이스 정보' 아코디언을 펼치고 이름, 설명, 사전 조건 입력
 * 6. '스텝 추가' 버튼을 통해 최소 3개의 테스트 스텝(설명/예상결과) 및 전체 예상 결과 입력
 * 7. '저장' 버튼 클릭 후 테스트케이스 리스트 화면으로 리다이렉션 확인
 * 8. 생성된 테스트케이스가 리스트에 정상적으로 표시되는지 검증
 */

const { test, expect } = require('../fixtures/test-fixtures.js');
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require('../config/credentials.js');

test.describe('프로젝트 내 테스트 케이스 생성 테스트', () => {

  test.beforeEach(async ({ loginPage, projectListPage }) => {
    await loginPage.goto();
    await loginPage.clearStorage();
    await loginPage.waitForBackend();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await projectListPage.waitForLoad();
  });

  test('새로운 테스트 케이스를 생성한다', async ({ page, projectListPage, testCasePage }) => {
    // 1. 프로젝트 선택 누름
    await projectListPage.clickProjectSelectMenu();
    await projectListPage.screen('07-project-select-button-clicked');

    // 2. 첫 번째 프로젝트 열기
    await projectListPage.openFirstProject();
    await projectListPage.screen('10-open-project-clicked');

    await page.waitForURL(/\/projects\/[a-f0-9-]+/);
    await projectListPage.screen('11-project-page-loaded');

    // 3. 테스트케이스 탭 선택
    await testCasePage.goToTestCaseTab();
    await testCasePage.screen('12-testcase-tab-selected');

    // 4. 개별폼 선택 (테스트 케이스 생성 폼으로 이동)
    await testCasePage.selectIndividualFormMode();
    await testCasePage.screen('14-individual-form-selected');

    // 5. 테스트 케이스 생성 (이름, 설명, Pre-condition)
    const testCaseName = `자동화 테스트 케이스 ${Date.now()}`;
    await testCasePage.fillIndividualForm({
        name: testCaseName,
        description: '이것은 자동화 테스트를 통해 생성된 테스트 케이스입니다.',
        precondition: '사전 조건: 시스템에 로그인되어 있어야 합니다.',
        steps: [
            { desc: '첫 번째 스텝 설명', expected: '첫 번째 예상 결과' },
            { desc: '두 번째 스텝 설명', expected: '두 번째 예상 결과' },
            { desc: '세 번째 스텝 설명', expected: '세 번째 예상 결과' }
        ],
        overallExpected: '이 테스트 케이스의 모든 스텝에 대한 전체 예상 결과입니다.'
    });
    await testCasePage.screen('23-overall-expected-result-filled');

    // 7. 저장 버튼 클릭
    await testCasePage.saveForm();
    await testCasePage.screen('25-redirected-to-testcase-list');

    await expect(page.locator(`text="${testCaseName}"`)).toBeVisible();
    await testCasePage.screen('26-testcase-created-and-verified');

    console.log(`✅ 테스트 케이스 '${testCaseName}' 생성 완료 및 확인`);
  });
});