// e2e-tests/project/create-folder-and-testcases.spec.js: 폴더 생성 및 폴더 내 테스트 케이스 생성 E2E 테스트
const { test, expect } = require('../fixtures/test-fixtures.js');
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require('../config/credentials.js');

test.describe('폴더 생성 및 폴더 내 테스트 케이스 생성 테스트', () => {
  let projectId = '';
  let folderId = '';

  test.beforeEach(async ({ loginPage, projectListPage, page }) => {
    await loginPage.goto();
    await loginPage.clearStorage();
    await loginPage.waitForBackend();

    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await projectListPage.waitForLoad();

    // 프로젝트로 이동
    await projectListPage.openFirstProject();
    await page.waitForURL(new RegExp('/projects/[a-f0-9-]+'));

    // 프로젝트 ID 추출
    const currentUrl = page.url();
    const match = currentUrl.match(/\/projects\/([a-f0-9-]+)/);
    if (match && match[1]) {
      projectId = match[1];
      console.log(`추출된 Project ID: ${projectId}`);
    } else {
      throw new Error('URL에서 Project ID를 추출할 수 없습니다.');
    }

    // 테스트케이스 탭 선택
    await projectListPage.screen('project-page-loaded');
    await page.click('button:has-text("테스트케이스")');
    await page.waitForURL(new RegExp(`/projects/${projectId}/testcases`));
  });

  test('새로운 폴더를 생성하고 그 안에 테스트 케이스 10개를 생성한다', async ({ page, testCasePage }) => {
    const folderName = `자동화 폴더 ${Date.now()}`;

    // '새 항목 추가' 버튼 클릭
    await page.locator('[data-testid="add-top-button"]').click();
    // '폴더 추가' 메뉴 클릭
    await page.waitForSelector('text="폴더 추가"');
    await page.click('text="폴더 추가"');
    // 폴더 이름 입력 및 확인
    await page.getByPlaceholder('folder').waitFor({ state: 'visible' });
    await page.getByPlaceholder('folder').fill(folderName);
    await page.locator('[data-testid="confirm-add-button"]').click();

    // 폴더 생성 확인
    await expect(page.locator(`text="${folderName}"`)).toBeVisible();
    console.log(`✅ 폴더 '${folderName}' 생성 완료.`);

    // 생성된 폴더 클릭하여 ID 획득
    await page.locator(`text="${folderName}"`).click();
    await page.waitForSelector('h6:has-text("테스트 폴더 수정")');
    folderId = await page.getByLabel('ID', { exact: true }).inputValue();
    console.log(`추출된 Folder ID: ${folderId}`);
    expect(folderId).not.toBe('');

    // 테스트케이스 목록으로 돌아가기
    await page.click('button:has-text("테스트케이스")');
    await page.waitForURL(new RegExp(`/projects/${projectId}/testcases`));

    // 폴더 안에 테스트 케이스 10개 생성
    for (let i = 1; i <= 10; i++) {
      const testCaseName = `폴더 내 TC ${i} - ${Date.now()}`;
      console.log(`[${i}/10] 테스트 케이스 생성 시작: ${testCaseName}`);

      // 1. '하위 테스트케이스 추가' 메뉴 클릭
      const folderRow = page.locator(`text="${folderName}"`);
      await folderRow.locator('svg[data-testid="MoreVertIcon"]').waitFor({ state: 'visible' });
      await folderRow.locator('svg[data-testid="MoreVertIcon"]').click();
      await page.waitForSelector('div[role="menu"]');
      await page.click('text="하위 테스트케이스 추가"');

      // 2. 테스트케이스 생성 폼 대기 및 정보 아코디언 확장
      await page.waitForSelector('h6:has-text("테스트케이스 생성")');
      await page.locator('div[role="button"]:has-text("테스트케이스 정보")').click();
      await page.getByLabel('이름').waitFor({ state: 'visible' });

      // 3. 폼 입력
      await expect(page.getByLabel('Parent ID')).toHaveValue(folderId);
      await page.getByLabel('이름').fill(testCaseName);
      await page.getByLabel('설명').fill(`자동화 테스트로 생성된 ${i}번째 테스트 케이스입니다.`);
      await page.getByLabel('Pre-condition').fill(`사전 조건: ${i}`);

      // 테스트 스텝 추가
      await page.click('button:has-text("스텝 추가")');
      await page.getByPlaceholder('Step 설명').fill(`스텝 1 설명`);
      await page.getByPlaceholder('예상 결과').fill(`스텝 1 예상 결과`);

      // 전체 예상 결과 입력 
      await page.getByLabel('Expected Results').fill(`테스트 케이스의 전체 예상 결과입니다.`);

      // 4. 저장
      await page.locator('button:has-text("저장")').last().click();

      // 5. 저장 성공 확인
      await page.waitForURL(new RegExp(`/projects/${projectId}/testcases`));
      
      // 폴더를 확장하여 하위 테스트케이스가 보이는지 확인
      const folderLocator = page.locator(`text="${folderName}"`);
      const isExpanded = await folderLocator.locator('..').getAttribute('aria-expanded');
      if (isExpanded === 'false') {
        await folderLocator.click();
      }
      
      await expect(page.locator(`text="${testCaseName}"`)).toBeVisible({ timeout: 10000 });
      console.log(`✅ [${i}/10] 테스트 케이스 '${testCaseName}' 생성 및 확인 완료.`);
    }

    await testCasePage.screen('create-10-testcases-complete');
    console.log(`🎉 폴더 '${folderName}' 및 그 안의 테스트 케이스 10개 생성 완료!`);
  });
});