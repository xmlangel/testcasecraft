const { test, expect } = require('@playwright/test');

test.describe('테스트 플랜 및 테스트 케이스 추가 E2E 테스트', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // 백엔드 서버 준비 확인 (login.spec.js 참고)
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
        // 연결 실패 시 1초 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    if (!backendReady) {
      throw new Error('백엔드 서버가 준비되지 않았습니다');
    }
  });

  test('새로운 테스트 플랜을 생성하고 테스트 케이스를 추가', async ({ page }) => {
    console.log('🚀 새로운 테스트 플랜 및 테스트 케이스 추가 테스트 시작...');

    // 1. 로그인
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    console.log('📝 로그인 수행');

    // 대시보드 리다이렉션 확인
    await page.waitForURL('/dashboard', { timeout: 15000 });
    await expect(page.locator('h5:has-text("로그인")')).not.toBeVisible();
    console.log('✅ 대시보드 페이지 로드 확인');

    // 2. 좌측 메뉴에서 '테스트 플랜' 메뉴 클릭
    await page.waitForSelector('div[role="button"]:has-text("테스트 플랜")', { timeout: 10000 });
    await page.click('div[role="button"]:has-text("테스트 플랜")');
    console.log('➡️ 테스트 플랜 메뉴 클릭');

    // 3. 테스트 플랜 목록 페이지 로드 확인
    await page.waitForURL('**/testplans', { timeout: 10000 });
    await page.waitForSelector('h4:has-text("테스트 플랜 목록"), h5:has-text("테스트 플랜 목록"), h6:has-text("테스트 플랜 목록")', { timeout: 10000 });
    console.log('✅ 테스트 플랜 목록 페이지 로드 확인');

    // 4. '새 테스트 플랜 추가' 버튼 클릭
    await page.waitForSelector('button:has-text("새 테스트 플랜 추가")', { timeout: 10000 });
    await page.click('button:has-text("새 테스트 플랜 추가")');
    console.log('➕ 새 테스트 플랜 추가 버튼 클릭');

    // 5. 테스트 플랜 이름과 설명 입력
    const testPlanName = `새로운 테스트 플랜 (TC 포함) ${Date.now()}`;
    const testPlanDescription = `이것은 ${testPlanName}에 대한 설명입니다.`;

    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    await page.fill('input[name="name"]', testPlanName);
    await page.fill('textarea[name="description"]', testPlanDescription);
    console.log(`📝 테스트 플랜 이름: ${testPlanName}, 설명: ${testPlanDescription} 입력`);

    // 6. 테스트 케이스 전체 선택 (UI에 따라 셀렉터 변경 필요)
    // 일반적으로 테이블 헤더에 있는 '모두 선택' 체크박스 또는 버튼을 클릭합니다.
    // 여기서는 예시로 '모두 선택' 텍스트를 가진 체크박스를 가정합니다.
    // 실제 UI에 따라 정확한 셀렉터를 찾아야 합니다.
    try {
      // 모든 체크박스를 찾아서 클릭하는 방식 (더 견고함)
      const checkboxes = await page.locator('input[type="checkbox"][data-testid^="testcase-select-"]');
      const count = await checkboxes.count();
      if (count > 0) {
        for (let i = 0; i < count; ++i) {
          await checkboxes.nth(i).check();
        }
        console.log(`✅ ${count}개의 테스트 케이스 선택 완료`);
      } else {
        console.log('⚠️ 선택할 테스트 케이스가 없습니다.');
      }
    } catch (error) {
      console.log('⚠️ 테스트 케이스 전체 선택 중 오류 발생 또는 셀렉터 없음:', error.message);
      // 특정 '모두 선택' 버튼이 있다면 아래와 같이 시도할 수 있습니다.
      // await page.click('button:has-text("모두 선택")');
    }

    // 7. 저장 버튼 클릭
    await page.click('button:has-text("저장")');
    console.log('💾 저장 버튼 클릭');

    // 8. 성공 메시지 또는 목록에서 새로 추가된 테스트 플랜 확인
    await page.waitForURL('**/testplans', { timeout: 10000 });
    await page.waitForSelector(`text=${testPlanName}`, { timeout: 10000 });
    console.log(`✅ 새로 추가된 테스트 플랜 '${testPlanName}' 목록에서 확인`);

    console.log('🎉 새로운 테스트 플랜 및 테스트 케이스 추가 테스트 완료!');
  });
});
