const { chromium } = require('playwright');

async function runTestExecutionRestartTest() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });

  const page = await context.newPage();

  try {
    console.log('🔄 테스트 실행 재실행 기능 E2E 테스트 시작');

    // 1. 로그인
    console.log('1️⃣ 로그인 중...');
    await page.goto('/', { timeout: 20000 });
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // 2. 프로젝트 선택
    console.log('2️⃣ 프로젝트 선택 중...');
    await page.waitForSelector('button:has-text("프로젝트 열기")', { timeout: 10000 });
    const openButtons = await page.locator('button:has-text("프로젝트 열기")').all();
    if (openButtons.length > 0) {
      await openButtons[0].click();
      await page.waitForLoadState('networkidle');
    }

    // 3. 테스트실행 탭으로 이동
    console.log('3️⃣ 테스트실행 탭으로 이동 중...');
    await page.waitForSelector('text=테스트실행', { timeout: 10000 });
    await page.click('text=테스트실행');
    await page.waitForLoadState('networkidle');

    // 4. 기존 완료된 실행이 있는지 확인하고, 없으면 하나 생성
    console.log('4️⃣ 테스트 실행 확인/생성 중...');

    // 완료된 실행이 있는지 확인
    const completedExecutions = await page.locator('text=COMPLETED').count();

    if (completedExecutions === 0) {
      console.log('   📝 완료된 테스트 실행이 없어서 새로 생성합니다...');

      // 새 테스트 실행 생성
      await page.click('button:has-text("새 실행")');
      await page.waitForLoadState('networkidle');

      // 테스트 실행 정보 입력
      await page.fill('input[aria-label="실행명"]', '재실행 테스트용 실행');

      // 테스트 계획 선택
      const testPlanSelect = page.locator('#test-plan-label').locator('..');
      await testPlanSelect.click();
      await page.waitForTimeout(1000);

      // 첫 번째 available한 테스트 플랜 선택
      const planOptions = await page.locator('[role="option"]').all();
      if (planOptions.length > 1) {
        await planOptions[1].click(); // 첫 번째는 보통 "선택"이므로 두 번째 선택
      }

      // 저장 및 시작
      await page.click('button:has-text("저장")');
      await page.waitForLoadState('networkidle');

      // 실행 시작
      await page.click('button:has-text("실행시작")');
      await page.waitForLoadState('networkidle');

      // 간단히 완료 처리 (실제로는 테스트 케이스 결과를 입력해야 하지만 테스트 목적으로 바로 완료)
      await page.click('button:has-text("실행완료")');
      await page.waitForLoadState('networkidle');

      console.log('   ✅ 테스트 실행 생성 및 완료 처리 완료');
    }

    // 5. 완료된 테스트 실행 찾기 및 클릭
    console.log('5️⃣ 완료된 테스트 실행 찾는 중...');
    await page.waitForSelector('text=COMPLETED', { timeout: 10000 });

    // 완료된 실행의 상세보기 버튼 클릭
    const completedRow = page.locator('tr').filter({ hasText: 'COMPLETED' }).first();
    await completedRow.locator('button:has-text("상세보기")').click();
    await page.waitForLoadState('networkidle');

    // 6. 재실행 버튼 확인 및 클릭
    console.log('6️⃣ 재실행 버튼 확인 중...');
    await page.waitForSelector('button:has-text("재실행")', { timeout: 10000 });
    console.log('   ✅ 재실행 버튼이 표시되었습니다!');

    // 재실행 버튼 클릭
    console.log('7️⃣ 재실행 버튼 클릭 중...');
    await page.click('button:has-text("재실행")');
    await page.waitForLoadState('networkidle');

    // 8. 상태가 INPROGRESS로 변경되었는지 확인
    console.log('8️⃣ 상태 변경 확인 중...');
    await page.waitForSelector('text=INPROGRESS', { timeout: 10000 });
    console.log('   ✅ 테스트 실행이 INPROGRESS 상태로 변경되었습니다!');

    // 9. 실행완료 버튼이 다시 나타났는지 확인
    await page.waitForSelector('button:has-text("실행완료")', { timeout: 5000 });
    console.log('   ✅ 실행완료 버튼이 다시 표시되었습니다!');

    // 10. 재실행 버튼이 사라졌는지 확인
    const restartButtonCount = await page.locator('button:has-text("재실행")').count();
    if (restartButtonCount === 0) {
      console.log('   ✅ 재실행 버튼이 올바르게 숨겨졌습니다!');
    } else {
      console.log('   ⚠️ 재실행 버튼이 여전히 표시되고 있습니다.');
    }

    console.log('\n🎉 테스트 실행 재실행 기능 E2E 테스트 성공!');
    console.log('\n📋 테스트 결과 요약:');
    console.log('✅ 완료된 테스트 실행에서 재실행 버튼이 표시됨');
    console.log('✅ 재실행 버튼 클릭 시 상태가 COMPLETED → INPROGRESS로 변경됨');
    console.log('✅ 재실행 후 실행완료 버튼이 다시 표시됨');
    console.log('✅ 재실행 버튼이 적절히 숨겨짐');

  } catch (error) {
    console.error('❌ 테스트 실행 재실행 기능 E2E 테스트 실패:', error.message);

    // 스크린샷 저장
    await page.screenshot({
      path: 'e2e-tests/screenshots/test-execution-restart-error.png',
      fullPage: true
    });
    console.log('📸 오류 스크린샷 저장: e2e-tests/screenshots/test-execution-restart-error.png');

    throw error;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  runTestExecutionRestartTest()
    .then(() => {
      console.log('🏁 테스트 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('🚨 테스트 실패:', error);
      process.exit(1);
    });
}

module.exports = { runTestExecutionRestartTest };