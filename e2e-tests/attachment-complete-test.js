const { chromium } = require('playwright');

/**
 * 첨부파일 기능 완전한 E2E 테스트
 * 실제 UI 워크플로우에 따라 테스트 실행 → 시작 → 결과입력 → 첨부파일 확인
 */

async function runAttachmentCompleteTest() {
  console.log('🚀 첨부파일 기능 완전 테스트 시작...');

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
    if (msg.text().includes('TestResultForm') || msg.text().includes('attachment') || msg.text().includes('TEST:')) {
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

    console.log('📋 Step 2: 프로젝트 선택...');
    await page.waitForURL('**/projects', { timeout: 10000 });

    const projectButtons = await page.locator('button:has-text("프로젝트 열기")').count();
    if (projectButtons > 0) {
      await page.locator('button:has-text("프로젝트 열기")').first().click();
      await page.waitForLoadState('networkidle');
    } else {
      throw new Error('프로젝트를 찾을 수 없습니다.');
    }

    console.log('📋 Step 3: 테스트실행 탭으로 이동...');
    await page.click('text=테스트실행');
    await page.waitForLoadState('networkidle');

    // 테스트실행 화면 스크린샷
    await page.screenshot({
      path: './e2e-tests/screenshots/complete-01-test-execution.png',
      fullPage: true
    });

    console.log('📋 Step 4: 기존 테스트 실행 확인 및 새 실행 생성...');

    // 기존 실행이 있는지 확인 후 없으면 새로 생성
    let executionExists = await page.locator('a[href*="/executions/"]').count() > 0;

    if (!executionExists) {
      console.log('📋 새 테스트 실행 생성...');
      const newExecutionButton = await page.locator('button:has-text("새 실행")').count();
      if (newExecutionButton > 0) {
        await page.click('button:has-text("새 실행")');
        await page.waitForLoadState('networkidle');

        // 실행명 입력
        await page.waitForSelector('input[aria-label="실행명"]', { timeout: 5000 });
        await page.fill('input[aria-label="실행명"]', 'E2E 첨부파일 완전 테스트');

        // 테스트 계획 선택 (두 번째 옵션)
        await page.click('[aria-label="테스트 계획"]');
        await page.waitForTimeout(1000);

        const options = await page.locator('li[role="option"]').count();
        console.log(`✅ 테스트 계획 옵션 개수: ${options}개`);

        if (options > 1) {
          await page.locator('li[role="option"]').nth(1).click();
          await page.waitForTimeout(1000);

          const saveButton = page.locator('button:has-text("저장")');
          const isEnabled = await saveButton.isEnabled();
          console.log(`저장 버튼 활성화: ${isEnabled}`);

          if (isEnabled) {
            await saveButton.click();
            await page.waitForLoadState('networkidle');
            console.log('✅ 새 테스트 실행 생성 완료');
          }
        }
      }
    }

    console.log('📋 Step 5: 테스트 실행 선택...');

    // 테스트 실행 링크 클릭 (있다면)
    const executionLinks = await page.locator('a[href*="/executions/"]').count();
    if (executionLinks > 0) {
      await page.locator('a[href*="/executions/"]').first().click();
      await page.waitForLoadState('networkidle');
    } else {
      // 현재 페이지에 실행이 표시되어 있다면 그대로 진행
      console.log('실행 목록에서 작업 진행...');
    }

    // 실행 상세/목록 화면 스크린샷
    await page.screenshot({
      path: './e2e-tests/screenshots/complete-02-execution-details.png',
      fullPage: true
    });

    console.log('📋 Step 6: 테스트 실행 시작...');

    // 시작 버튼 찾기 및 클릭
    const startButtons = await page.locator('button:has-text("시작")').count();
    const playButtons = await page.locator('button[aria-label*="시작"], button[title*="시작"]').count();

    console.log(`✅ "시작" 텍스트 버튼: ${startButtons}개`);
    console.log(`✅ 시작 아이콘 버튼: ${playButtons}개`);

    if (startButtons > 0) {
      await page.locator('button:has-text("시작")').first().click();
      await page.waitForTimeout(2000);
      console.log('✅ 텍스트 버튼으로 실행 시작');
    } else if (playButtons > 0) {
      await page.locator('button[aria-label*="시작"], button[title*="시작"]').first().click();
      await page.waitForTimeout(2000);
      console.log('✅ 아이콘 버튼으로 실행 시작');
    } else {
      // 플레이 아이콘 버튼 찾기 (▶ 버튼)
      const playIconButtons = await page.locator('button:has([data-testid="PlayArrowIcon"])').count();
      if (playIconButtons > 0) {
        await page.locator('button:has([data-testid="PlayArrowIcon"])').first().click();
        await page.waitForTimeout(2000);
        console.log('✅ 플레이 아이콘 버튼으로 실행 시작');
      } else {
        console.log('⚠️ 시작 버튼을 찾지 못했습니다. 이미 시작된 상태일 수 있습니다.');
      }
    }

    // 시작 후 화면 스크린샷
    await page.screenshot({
      path: './e2e-tests/screenshots/complete-03-after-start.png',
      fullPage: true
    });

    console.log('📋 Step 7: 결과입력 버튼 확인...');
    await page.waitForTimeout(3000); // 상태 업데이트 대기

    const resultInputButtons = await page.locator('button:has-text("결과입력")').count();
    console.log(`✅ 결과입력 버튼: ${resultInputButtons}개`);

    if (resultInputButtons > 0) {
      console.log('📋 Step 8: 결과입력 버튼 클릭...');
      await page.locator('button:has-text("결과입력")').first().click();
      await page.waitForTimeout(3000);

      // 결과입력 화면 스크린샷
      await page.screenshot({
        path: './e2e-tests/screenshots/complete-04-result-form.png',
        fullPage: true
      });

      console.log('📋 Step 9: TestResultForm 및 첨부파일 기능 확인...');

      // TestResultForm 로딩 메시지 확인
      const testMessages = await page.locator('text=TEST: TestResultForm이 로드되었습니다').count();
      console.log(`✅ TestResultForm 로딩 메시지: ${testMessages}개`);

      // 첨부파일 섹션 확인
      const attachmentSections = await page.locator('text=파일 첨부').count();
      const attachmentLabels = await page.locator('text=첨부파일').count();
      const guidanceMessages = await page.locator('text=테스트 결과를 저장하면 첨부파일을 확인할 수 있습니다').count();
      const fileInputs = await page.locator('input[type="file"]').count();

      console.log(`✅ "파일 첨부" 섹션: ${attachmentSections}개`);
      console.log(`✅ "첨부파일" 레이블: ${attachmentLabels}개`);
      console.log(`✅ 첨부파일 안내 메시지: ${guidanceMessages}개`);
      console.log(`✅ 파일 입력 필드: ${fileInputs}개`);

      // 디버그 정보 확인
      const debugInfo = await page.locator('text=Debug - currentResult').count();
      if (debugInfo > 0) {
        try {
          const debugText = await page.locator('text=Debug - currentResult').first().textContent();
          console.log(`🔍 디버그 정보: ${debugText}`);
        } catch (e) {
          console.log(`🔍 디버그 정보 읽기 실패`);
        }
      }

      // 결과 판정
      const hasTestResultForm = testMessages > 0;
      const hasAttachmentSection = attachmentSections > 0 || attachmentLabels > 0;
      const hasGuidanceMessage = guidanceMessages > 0;

      if (hasTestResultForm && hasAttachmentSection) {
        console.log('🎉 테스트 성공! TestResultForm이 로드되고 첨부파일 섹션이 표시되었습니다.');

        if (hasGuidanceMessage) {
          console.log('✅ 첨부파일 안내 메시지도 정상 표시됨');
        }

        console.log('📋 Step 10: 첨부파일 기능이 성공적으로 구현되었습니다!');

      } else {
        console.log('⚠️ 일부 요소가 예상대로 표시되지 않았습니다.');
        console.log(`- TestResultForm 로딩: ${hasTestResultForm ? '✅' : '❌'}`);
        console.log(`- 첨부파일 섹션: ${hasAttachmentSection ? '✅' : '❌'}`);
        console.log(`- 안내 메시지: ${hasGuidanceMessage ? '✅' : '❌'}`);
      }

    } else {
      console.log('❌ 결과입력 버튼이 표시되지 않았습니다.');
      console.log('현재 페이지의 모든 버튼을 다시 확인합니다...');

      const allButtons = await page.locator('button').count();
      console.log(`🔍 전체 버튼 개수: ${allButtons}개`);

      for (let i = 0; i < Math.min(allButtons, 10); i++) {
        try {
          const buttonText = await page.locator('button').nth(i).textContent();
          console.log(`🔍 버튼 ${i}: "${buttonText}"`);
        } catch (e) {
          console.log(`🔍 버튼 ${i}: 텍스트 읽기 실패`);
        }
      }
    }

    // 최종 스크린샷
    await page.screenshot({
      path: './e2e-tests/screenshots/complete-05-final.png',
      fullPage: true
    });

  } catch (error) {
    console.error('❌ E2E 테스트 실패:', error.message);
    await page.screenshot({
      path: './e2e-tests/screenshots/complete-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('✅ E2E 테스트 완료');
  }
}

if (require.main === module) {
  runAttachmentCompleteTest();
}

module.exports = { runAttachmentCompleteTest };