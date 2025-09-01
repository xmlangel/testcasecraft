// e2e-tests/project/create-folder-and-testcases.spec.js: 폴더 생성 및 폴더 내 테스트 케이스 생성 E2E 테스트
const { test, expect } = require('@playwright/test');

test.describe('폴더 생성 및 폴더 내 테스트 케이스 생성 테스트', () => {
  let projectId = '';
  let folderId = '';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

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

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // 프로젝트로 이동 (create-testcase.spec.js에서 복사)
    await page.click('button:has-text("프로젝트 선택")');
    await page.click('text="데브옵스팀"');
    await page.waitForSelector('text="인프라 자동화"');
    await page.click('text="인프라 자동화"');
    await page.click('button:has-text("프로젝트 열기")');
    await page.waitForURL(/\/projects\/[a-f0-9-]+/);

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
    await page.click('button:has-text("테스트케이스")');
    await page.waitForURL(/\/projects\/[a-f0-9-]+\/testcases/);
  });

  test('새로운 폴더를 생성하고 그 안에 테스트 케이스 10개를 생성한다', async ({ page }) => {
    const folderName = `자동화 폴더 ${Date.now()}`;

    // 1. 폴더 생성 폼으로 이동 (가정: '새 폴더 생성' 버튼이 있음)
    // 이 셀렉터는 실제 UI에 따라 조정 필요
    await page.click('button:has-text("새 폴더 생성")'); 
    // 폴더 생성 폼이 나타날 때까지 대기 (예: 폼 제목)
    await page.waitForSelector('h6:has-text("테스트 폴더 생성")');

    // 2. 폴더 정보 입력
    await page.getByLabel('이름').waitFor({ state: 'visible' });
    await page.getByLabel('이름').fill(folderName);
    await page.getByLabel('설명').fill('자동화 테스트를 통해 생성된 폴더입니다.');

    // 3. 폴더 저장
    await page.locator('button:has-text("저장")').last().click();
    // 저장 성공 확인 (예: 폴더가 트리에 나타나는지 확인)
    await expect(page.locator(`text="${folderName}"`)).toBeVisible();

    // 4. 생성된 폴더의 ID 획득 (URL에서 추출)
    // 폴더 생성 후 URL이 변경될 수 있으므로, 현재 URL에서 폴더 ID를 추출
    // 또는 폴더를 클릭하여 상세 페이지로 이동 후 URL에서 추출
    // 여기서는 폴더 생성 후 트리에 나타난 폴더를 클릭하여 상세 페이지로 이동하는 방식으로 가정
    await page.click(`text="${folderName}"`);
    await page.waitForURL(/\/projects\/[a-f0-9-]+\/testcases\/[a-f0-9-]+/);
    const folderUrl = page.url();
    const folderMatch = folderUrl.match(/\/testcases\/([a-f0-9-]+)/);
    if (folderMatch && folderMatch[1]) {
      folderId = folderMatch[1];
      console.log(`추출된 Folder ID: ${folderId}`);
    } else {
      throw new Error('URL에서 Folder ID를 추출할 수 없습니다.');
    }

    // 5. 폴더 안에 테스트 케이스 10개 생성
    for (let i = 1; i <= 10; i++) {
      const testCaseName = `${folderName} - 테스트 케이스 ${i}`;

      // '개별 폼' 버튼 클릭 (테스트 케이스 생성 폼으로 이동)
      // 이 버튼은 테스트케이스 목록 페이지에 있다고 가정
      await page.click('button:has-text("개별 폼")');
      await page.waitForSelector('h6:has-text("테스트케이스 생성")');

      // Parent ID 필드 채우기 (가정: 'Parent ID' 라벨을 가진 필드가 있음)
      await page.getByLabel('Parent ID').fill(folderId);

      // 테스트 케이스 정보 입력
      await page.getByLabel('이름').waitFor({ state: 'visible' });
      await page.getByLabel('이름').fill(testCaseName);
      await page.getByLabel('설명').fill(`자동화 테스트를 통해 생성된 테스트 케이스 ${i}입니다.`);
      await page.getByLabel('Pre-condition').fill(`사전 조건: 폴더 ${folderName} 내 테스트 케이스 ${i}입니다.`);

      // 테스트 스텝 3개 추가
      await page.click('button:has-text("스텝 추가")');
      await page.getByPlaceholder('Step 설명').nth(0).fill(`스텝 ${i}-1 설명`);
      await page.getByPlaceholder('예상 결과').nth(0).fill(`스텝 ${i}-1 예상 결과`);

      await page.click('button:has-text("스텝 추가")');
      await page.getByPlaceholder('Step 설명').nth(1).fill(`스텝 ${i}-2 설명`);
      await page.getByPlaceholder('예상 결과').nth(1).fill(`스텝 ${i}-2 예상 결과`);

      await page.click('button:has-text("스텝 추가")');
      await page.getByPlaceholder('Step 설명').nth(2).fill(`스텝 ${i}-3 설명`);
      await page.getByPlaceholder('예상 결과').nth(2).fill(`스텝 ${i}-3 예상 결과`);

      // 전체 예상 결과 입력
      await page.getByPlaceholder('전체 예상 결과').fill(`테스트 케이스 ${i}의 전체 예상 결과입니다.`);

      // 저장 버튼 클릭
      await page.locator('button:has-text("저장")').last().click();
      
      // 저장 성공 확인 (목록 페이지로 돌아왔는지 확인)
      await page.waitForURL(/\/projects\/[a-f0-9-]+\/testcases/);
      await expect(page.locator(`text="${testCaseName}"`)).toBeVisible();

      console.log(`✅ 테스트 케이스 '${testCaseName}' 생성 완료 및 확인`);
    }

    console.log(`🎉 폴더 '${folderName}' 및 그 안의 테스트 케이스 10개 생성 완료!`);
  });
});
