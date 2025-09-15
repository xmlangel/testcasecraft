const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * 첨부파일 currentResult 전달 디버깅 테스트
 * 파일 업로드 후 다시 결과입력을 열어서 currentResult가 제대로 전달되는지 확인
 */

async function runAttachmentDebugTest() {
  console.log('🚀 첨부파일 currentResult 디버깅 테스트 시작...');

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
    console.log(`🔍 Browser: ${msg.text()}`);
  });

  try {
    // 테스트용 파일 생성
    const testFilePath = path.join(__dirname, 'debug-test-file.txt');
    const testFileContent = '디버그 테스트용 첨부파일\n생성 시간: ' + new Date().toISOString();
    fs.writeFileSync(testFilePath, testFileContent);
    console.log('📋 테스트 파일 생성 완료:', testFilePath);

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
    }

    console.log('📋 Step 3: 테스트실행 탭으로 이동...');
    await page.click('text=테스트실행');
    await page.waitForLoadState('networkidle');

    console.log('📋 Step 4: 기존 테스트 실행 찾기...');
    const executionLinks = await page.locator('a[href*="/executions/"]').count();

    if (executionLinks > 0) {
      // 기존 실행 사용
      await page.locator('a[href*="/executions/"]').first().click();
      await page.waitForLoadState('networkidle');
      console.log('✅ 기존 테스트 실행 선택됨');
    } else {
      // 새 실행 생성
      console.log('📋 새 테스트 실행 생성...');
      await page.click('button:has-text("새 실행")');
      await page.waitForLoadState('networkidle');

      await page.waitForSelector('input[aria-label="실행명"]', { timeout: 5000 });
      await page.fill('input[aria-label="실행명"]', 'E2E 디버그 테스트');

      await page.click('[aria-label="테스트 계획"]');
      await page.waitForTimeout(1000);

      const options = await page.locator('li[role="option"]').count();
      if (options > 1) {
        await page.locator('li[role="option"]').nth(1).click();
        await page.waitForTimeout(1000);

        const saveButton = page.locator('button:has-text("저장")');
        if (await saveButton.isEnabled()) {
          await saveButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }

    console.log('📋 Step 5: 테스트 실행 시작...');
    const playIconButtons = await page.locator('button:has([data-testid="PlayArrowIcon"])').count();
    if (playIconButtons > 0) {
      await page.locator('button:has([data-testid="PlayArrowIcon"])').first().click();
      await page.waitForTimeout(3000);
    }

    console.log('📋 Step 6: 첫 번째 결과입력으로 파일 업로드...');
    const resultInputButtons = await page.locator('button:has-text("결과입력")').count();
    console.log(`✅ 결과입력 버튼: ${resultInputButtons}개`);

    if (resultInputButtons > 0) {
      await page.locator('button:has-text("결과입력")').first().click();
      await page.waitForTimeout(3000);

      // 파일 업로드
      const fileInput = page.locator('input[type="file"]');
      await fileInput.first().setInputFiles(testFilePath);
      console.log('✅ 파일 선택 완료');

      // PASS 선택
      const passRadio = page.locator('input[type="radio"][value="PASS"]');
      if (await passRadio.count() > 0) {
        await passRadio.first().click();
      }

      // 저장
      const saveButton = page.locator('button:has-text("저장")');
      if (await saveButton.count() > 0) {
        await saveButton.first().click();
        await page.waitForTimeout(3000);
        console.log('✅ 테스트 결과 및 파일 저장 완료');
      }

      // 다이얼로그 닫기
      const cancelButtons = await page.locator('button:has-text("취소")').count();
      if (cancelButtons > 0) {
        await page.locator('button:has-text("취소")').first().click();
        await page.waitForTimeout(1000);
      }

      console.log('📋 Step 7: 다시 같은 결과입력 열어서 첨부파일 확인...');
      await page.waitForTimeout(2000);

      // 같은 결과입력 버튼 다시 클릭
      const newResultInputButtons = await page.locator('button:has-text("결과입력")').count();
      if (newResultInputButtons > 0) {
        await page.locator('button:has-text("결과입력")').first().click();
        await page.waitForTimeout(3000);

        // 디버그 정보가 표시되는지 확인
        const debugInfo = await page.locator('text=🔍 DEBUG - currentResult').count();
        console.log(`✅ 디버그 정보 표시: ${debugInfo}개`);

        if (debugInfo > 0) {
          const debugText = await page.locator('text=🔍 DEBUG - currentResult').first().textContent();
          console.log(`🔍 ${debugText}`);
        }

        // 첨부파일 섹션 확인
        const attachmentSections = await page.locator('text=첨부파일').count();
        const attachmentFiles = await page.locator('text=debug-test-file.txt').count();
        const testResultAttachments = await page.locator('[data-testid] >> text=첨부파일').count();

        console.log(`✅ 첨부파일 섹션: ${attachmentSections}개`);
        console.log(`✅ 업로드한 파일명 표시: ${attachmentFiles}개`);
        console.log(`✅ TestResultAttachmentsView 렌더링: ${testResultAttachments}개`);

        // 최종 스크린샷
        await page.screenshot({
          path: './e2e-tests/screenshots/debug-attachment-display.png',
          fullPage: true
        });

        if (attachmentSections > 0 && debugInfo > 0) {
          console.log('🎉 디버깅 완료! currentResult 전달 상태를 확인했습니다.');
        }
      }
    }

  } catch (error) {
    console.error('❌ 디버깅 테스트 실패:', error.message);
    await page.screenshot({
      path: './e2e-tests/screenshots/debug-error.png',
      fullPage: true
    });
  } finally {
    // 테스트 파일 정리
    try {
      const testFilePath = path.join(__dirname, 'debug-test-file.txt');
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
        console.log('📋 테스트 파일 정리 완료');
      }
    } catch (e) {
      console.log('⚠️ 테스트 파일 정리 실패:', e.message);
    }

    await browser.close();
    console.log('✅ 디버깅 테스트 완료');
  }
}

if (require.main === module) {
  runAttachmentDebugTest();
}

module.exports = { runAttachmentDebugTest };