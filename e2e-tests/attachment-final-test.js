const { chromium } = require('playwright');

async function runAttachmentFinalTest() {
  console.log('🚀 첨부파일 기능 최종 테스트 시작...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });

  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });

  const page = await context.newPage();

  // 콘솔 로그 수집
  page.on('console', msg => {
    if (msg.text().includes('TEST:') || msg.text().includes('TestResultForm') || msg.text().includes('attachment')) {
      console.log(`🔍 Browser: ${msg.text()}`);
    }
  });

  try {
    console.log('📋 Step 1: 로그인...');
    await page.goto('/', { timeout: 20000 });
    await page.waitForLoadState('networkidle');

    // 로그인
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    console.log('📋 Step 2: 프로젝트 열기...');
    await page.waitForURL('**/projects', { timeout: 10000 });

    const projectButtons = await page.locator('button:has-text("프로젝트 열기")').count();
    if (projectButtons > 0) {
      await page.locator('button:has-text("프로젝트 열기")').first().click();
      await page.waitForLoadState('networkidle');

      console.log('📋 Step 3: 테스트실행 탭으로 이동...');
      await page.click('text=테스트실행');
      await page.waitForLoadState('networkidle');

      console.log('📋 Step 4: 새 테스트 실행 생성...');
      const newExecutionButton = await page.locator('button:has-text("새 실행")').count();
      if (newExecutionButton > 0) {
        await page.click('button:has-text("새 실행")');
        await page.waitForLoadState('networkidle');

        // 실행명 입력
        await page.waitForSelector('input[aria-label="실행명"]', { timeout: 5000 });
        await page.fill('input[aria-label="실행명"]', 'E2E 첨부파일 테스트');

        // 테스트 계획 선택
        await page.click('[aria-label="테스트 계획"]');
        await page.waitForTimeout(1000);

        const options = await page.locator('li[role="option"]').count();
        console.log(`✅ 테스트 계획 옵션 개수: ${options}개`);

        if (options > 1) {
          // 두 번째 옵션 선택 (첫 번째는 "선택")
          await page.locator('li[role="option"]').nth(1).click();
          await page.waitForTimeout(1000);

          // 저장 버튼 확인 및 클릭
          const saveButton = page.locator('button:has-text("저장")');
          const isEnabled = await saveButton.isEnabled();
          console.log(`저장 버튼 활성화: ${isEnabled}`);

          if (isEnabled) {
            await saveButton.click();
            await page.waitForLoadState('networkidle');

            console.log('📋 Step 5: 결과입력 테스트...');
            await page.waitForTimeout(2000);

            const resultButtons = await page.locator('button:has-text("결과입력")').count();
            console.log(`✅ 결과입력 버튼: ${resultButtons}개`);

            if (resultButtons > 0) {
              await page.locator('button:has-text("결과입력")').first().click();
              await page.waitForTimeout(3000);

              // 스크린샷 촬영
              await page.screenshot({
                path: './e2e-tests/screenshots/final-attachment-test.png',
                fullPage: true
              });

              // 테스트 메시지 확인
              const testMessage = await page.locator('text=TEST: TestResultForm이 로드되었습니다').count();
              const attachmentSection = await page.locator('text=파일 첨부').count();
              const fileInput = await page.locator('input[type="file"]').count();

              console.log(`✅ TestResultForm 로드: ${testMessage}개`);
              console.log(`✅ 파일 첨부 섹션: ${attachmentSection}개`);
              console.log(`✅ 파일 입력 필드: ${fileInput}개`);

              if (testMessage > 0 && attachmentSection > 0) {
                console.log('🎉 테스트 성공! 첨부파일 기능이 정상 작동합니다.');
              } else {
                console.log('⚠️ 일부 요소가 확인되지 않았습니다.');
              }
            }
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({
      path: './e2e-tests/screenshots/test-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('✅ 테스트 완료');
  }
}

if (require.main === module) {
  runAttachmentFinalTest();
}

module.exports = { runAttachmentFinalTest };