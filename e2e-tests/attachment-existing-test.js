const { chromium } = require('playwright');

/**
 * 기존 테스트 데이터가 있는 프로젝트에서 첨부파일 표시 확인
 * 이전에 업로드한 첨부파일이 제대로 표시되는지 확인
 */

async function runAttachmentExistingTest() {
  console.log('🚀 기존 첨부파일 표시 확인 테스트 시작...');

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
    if (msg.text().includes('DEBUG') || msg.text().includes('TestResultAttachmentsView') || msg.text().includes('attachment')) {
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

    // 프로젝트 목록에서 테스트 데이터가 있는 프로젝트 선택 (인프라 자동화가 아닌 다른 프로젝트)
    const projectCards = await page.locator('.MuiCard-root').count();
    console.log(`✅ 발견된 프로젝트 카드: ${projectCards}개`);

    // 두 번째 또는 세 번째 프로젝트 시도
    let projectSelected = false;
    for (let i = 1; i < Math.min(projectCards, 4); i++) {
      const projectCard = page.locator('.MuiCard-root').nth(i);
      const projectName = await projectCard.locator('h6').first().textContent();
      console.log(`🔍 프로젝트 ${i}: ${projectName}`);

      if (projectName && !projectName.includes('인프라 자동화')) {
        const openButton = projectCard.locator('button:has-text("프로젝트 열기")');
        if (await openButton.count() > 0) {
          await openButton.click();
          await page.waitForLoadState('networkidle');
          console.log(`✅ 프로젝트 선택됨: ${projectName}`);
          projectSelected = true;
          break;
        }
      }
    }

    if (!projectSelected) {
      // 첫 번째 프로젝트 사용
      const firstProject = page.locator('button:has-text("프로젝트 열기")').first();
      if (await firstProject.count() > 0) {
        await firstProject.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 첫 번째 프로젝트 선택됨');
      }
    }

    console.log('📋 Step 3: 테스트실행 탭으로 이동...');
    await page.click('text=테스트실행');
    await page.waitForLoadState('networkidle');

    console.log('📋 Step 4: 기존 테스트 실행 확인...');
    const executionLinks = await page.locator('a[href*="/executions/"]').count();
    console.log(`✅ 기존 테스트 실행: ${executionLinks}개`);

    if (executionLinks > 0) {
      // 첫 번째 실행 선택
      await page.locator('a[href*="/executions/"]').first().click();
      await page.waitForLoadState('networkidle');
      console.log('✅ 기존 테스트 실행 선택됨');

      console.log('📋 Step 5: 결과입력 버튼 확인...');
      await page.waitForTimeout(2000);

      const resultInputButtons = await page.locator('button:has-text("결과입력")').count();
      console.log(`✅ 결과입력 버튼: ${resultInputButtons}개`);

      if (resultInputButtons > 0) {
        // 여러 결과입력 버튼 중 하나씩 확인
        for (let i = 0; i < Math.min(resultInputButtons, 3); i++) {
          console.log(`📋 Step 6-${i+1}: ${i+1}번째 결과입력 확인...`);

          await page.locator('button:has-text("결과입력")').nth(i).click();
          await page.waitForTimeout(3000);

          // 디버그 정보 확인
          const debugInfo = await page.locator('text=🔍 DEBUG - currentResult').count();
          console.log(`✅ 디버그 정보 표시 (${i+1}번째): ${debugInfo}개`);

          if (debugInfo > 0) {
            try {
              const debugText = await page.locator('text=🔍 DEBUG - currentResult').first().textContent();
              console.log(`🔍 ${debugText}`);
            } catch (e) {
              console.log('🔍 디버그 텍스트 읽기 실패');
            }
          }

          // 첨부파일 관련 요소 확인
          const attachmentSections = await page.locator('text=첨부파일').count();
          const testResultAttachments = await page.locator('[data-testid*="attachment"], [class*="attachment"]').count();
          const attachmentViews = await page.locator('text=첨부파일이 없습니다').count();
          const attachmentFiles = await page.locator('[class*="MuiListItem"] >> text=/.*\.(txt|pdf|json|csv)$/i').count();

          console.log(`✅ 첨부파일 섹션 (${i+1}번째): ${attachmentSections}개`);
          console.log(`✅ TestResultAttachmentsView (${i+1}번째): ${testResultAttachments}개`);
          console.log(`✅ "첨부파일이 없습니다" 메시지 (${i+1}번째): ${attachmentViews}개`);
          console.log(`✅ 첨부파일 목록 (${i+1}번째): ${attachmentFiles}개`);

          // 스크린샷
          await page.screenshot({
            path: `./e2e-tests/screenshots/existing-test-${i+1}.png`,
            fullPage: true
          });

          // 다이얼로그 닫기
          const cancelButtons = await page.locator('button:has-text("취소")').count();
          if (cancelButtons > 0) {
            await page.locator('button:has-text("취소")').first().click();
            await page.waitForTimeout(1000);
          }

          const closeButtons = await page.locator('button[aria-label="close"]').count();
          if (closeButtons > 0) {
            await page.locator('button[aria-label="close"]').first().click();
            await page.waitForTimeout(1000);
          }

          // 결과 요약
          if (debugInfo > 0 && attachmentSections > 0) {
            console.log(`🎉 ${i+1}번째 테스트케이스: currentResult가 전달되고 첨부파일 섹션이 표시됨`);
            if (attachmentFiles > 0) {
              console.log(`✅ ${i+1}번째: 첨부파일이 실제로 표시됨!`);
            } else if (attachmentViews > 0) {
              console.log(`ℹ️ ${i+1}번째: 첨부파일이 없음 (정상)`);
            } else {
              console.log(`⚠️ ${i+1}번째: 첨부파일 상태 확인 필요`);
            }
          } else {
            console.log(`❌ ${i+1}번째: currentResult 또는 첨부파일 섹션 문제`);
          }
        }

        console.log('🎉 기존 첨부파일 표시 테스트 완료!');
      } else {
        console.log('❌ 결과입력 버튼을 찾을 수 없습니다.');

        // 테스트 실행 시작 필요한지 확인
        const startButtons = await page.locator('button:has([data-testid="PlayArrowIcon"])').count();
        if (startButtons > 0) {
          console.log('📋 테스트 실행 시작 필요...');
          await page.locator('button:has([data-testid="PlayArrowIcon"])').first().click();
          await page.waitForTimeout(3000);

          const newResultButtons = await page.locator('button:has-text("결과입력")').count();
          console.log(`✅ 시작 후 결과입력 버튼: ${newResultButtons}개`);
        }
      }

    } else {
      console.log('❌ 기존 테스트 실행을 찾을 수 없습니다.');
      console.log('📋 새 테스트 실행이 필요합니다.');
    }

    // 최종 스크린샷
    await page.screenshot({
      path: './e2e-tests/screenshots/existing-test-final.png',
      fullPage: true
    });

  } catch (error) {
    console.error('❌ 기존 첨부파일 테스트 실패:', error.message);
    await page.screenshot({
      path: './e2e-tests/screenshots/existing-test-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('✅ 기존 첨부파일 테스트 완료');
  }
}

if (require.main === module) {
  runAttachmentExistingTest();
}

module.exports = { runAttachmentExistingTest };