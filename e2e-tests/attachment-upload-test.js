const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * 첨부파일 업로드 및 저장 후 표시 완전 테스트
 * 파일을 실제로 업로드하고 저장한 후 다시 조회해서 표시되는지 확인
 */

async function runAttachmentUploadTest() {
  console.log('🚀 첨부파일 업로드 및 표시 완전 테스트 시작...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 2000
  });

  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });

  const page = await context.newPage();

  // 콘솔 로그 수집 (모든 로그 포함)
  page.on('console', msg => {
    console.log(`🔍 Browser: ${msg.text()}`);
  });

  // 네트워크 요청 로깅
  page.on('request', request => {
    if (request.url().includes('attachments') || request.url().includes('testresults')) {
      console.log(`🌐 Request: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('attachments') || response.url().includes('testresults')) {
      console.log(`🌐 Response: ${response.status()} ${response.url()}`);
    }
  });

  try {
    // 테스트용 파일 생성
    const testFilePath = path.join(__dirname, 'test-file.txt');
    const testFileContent = 'E2E 테스트용 첨부파일입니다.\n생성 시간: ' + new Date().toISOString();
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
    } else {
      throw new Error('프로젝트를 찾을 수 없습니다.');
    }

    console.log('📋 Step 3: 테스트실행 탭으로 이동...');
    await page.click('text=테스트실행');
    await page.waitForLoadState('networkidle');

    console.log('📋 Step 4: 테스트 실행 생성 또는 선택...');

    // 기존 실행이 있는지 확인
    let executionCreated = false;
    const executionLinks = await page.locator('a[href*="/executions/"]').count();

    if (executionLinks === 0) {
      console.log('📋 새 테스트 실행 생성...');
      const newExecutionButton = await page.locator('button:has-text("새 실행")').count();
      if (newExecutionButton > 0) {
        await page.click('button:has-text("새 실행")');
        await page.waitForLoadState('networkidle');

        // 실행명 입력
        await page.waitForSelector('input[aria-label="실행명"]', { timeout: 5000 });
        await page.fill('input[aria-label="실행명"]', 'E2E 첨부파일 업로드 테스트');

        // 테스트 계획 선택
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
            executionCreated = true;
            console.log('✅ 새 테스트 실행 생성 완료');
          }
        }
      }
    }

    console.log('📋 Step 5: 테스트 실행 시작...');

    // 플레이 아이콘 버튼으로 실행 시작
    const playIconButtons = await page.locator('button:has([data-testid="PlayArrowIcon"])').count();
    if (playIconButtons > 0) {
      await page.locator('button:has([data-testid="PlayArrowIcon"])').first().click();
      await page.waitForTimeout(3000);
      console.log('✅ 테스트 실행 시작됨');
    } else {
      console.log('⚠️ 시작 버튼을 찾지 못했습니다. 이미 시작된 상태일 수 있습니다.');
    }

    console.log('📋 Step 6: 결과입력 버튼 클릭...');
    await page.waitForTimeout(2000);

    const resultInputButtons = await page.locator('button:has-text("결과입력")').count();
    console.log(`✅ 결과입력 버튼: ${resultInputButtons}개`);

    if (resultInputButtons > 0) {
      await page.locator('button:has-text("결과입력")').first().click();
      await page.waitForTimeout(3000);

      console.log('📋 Step 7: 첨부파일 업로드...');

      // 파일 업로드
      const fileInput = page.locator('input[type="file"]');
      const fileInputCount = await fileInput.count();
      console.log(`✅ 파일 입력 필드: ${fileInputCount}개`);

      if (fileInputCount > 0) {
        await fileInput.first().setInputFiles(testFilePath);
        console.log('✅ 파일 선택 완료');

        // 잠시 대기 (파일 업로드 처리 시간)
        await page.waitForTimeout(2000);

        // 테스트 결과 선택 (PASS)
        const passRadio = page.locator('input[type="radio"][value="PASS"]');
        const passRadioCount = await passRadio.count();
        if (passRadioCount > 0) {
          await passRadio.first().click();
          console.log('✅ PASS 결과 선택');
        }

        // 저장 버튼 클릭
        const saveResultButton = page.locator('button:has-text("저장")');
        const saveResultCount = await saveResultButton.count();
        console.log(`✅ 저장 버튼: ${saveResultCount}개`);

        if (saveResultCount > 0) {
          await saveResultButton.first().click();
          await page.waitForTimeout(3000);
          console.log('✅ 테스트 결과 저장 완료');

          // 저장 완료 스크린샷
          await page.screenshot({
            path: './e2e-tests/screenshots/upload-01-after-save.png',
            fullPage: true
          });

          console.log('📋 Step 8: 첨부파일 표시 확인...');

          // 다이얼로그 닫기
          const cancelButtons = await page.locator('button:has-text("취소")').count();
          if (cancelButtons > 0) {
            await page.locator('button:has-text("취소")').first().click();
            await page.waitForTimeout(1000);
          }

          // 다시 결과입력 버튼 클릭하여 저장된 첨부파일 확인
          console.log('📋 Step 9: 저장된 첨부파일 확인...');
          await page.waitForTimeout(2000);

          const newResultInputButtons = await page.locator('button:has-text("결과입력")').count();
          if (newResultInputButtons > 0) {
            await page.locator('button:has-text("결과입력")').first().click();
            await page.waitForTimeout(3000);

            // 첨부파일 섹션 확인
            const attachmentSections = await page.locator('text=첨부파일').count();
            const attachmentFiles = await page.locator('text=test-file.txt').count();
            const downloadButtons = await page.locator('button[aria-label*="다운로드"], button:has([data-testid="GetAppIcon"])').count();

            console.log(`✅ 첨부파일 섹션: ${attachmentSections}개`);
            console.log(`✅ 업로드한 파일명 표시: ${attachmentFiles}개`);
            console.log(`✅ 다운로드 버튼: ${downloadButtons}개`);

            // 최종 스크린샷
            await page.screenshot({
              path: './e2e-tests/screenshots/upload-02-attachment-display.png',
              fullPage: true
            });

            // 결과 판정
            if (attachmentSections > 0 && (attachmentFiles > 0 || downloadButtons > 0)) {
              console.log('🎉 테스트 성공! 첨부파일이 저장되고 정상적으로 표시됩니다.');
              console.log('✅ 첨부파일 업로드 → 저장 → 표시 워크플로우가 완전히 작동합니다!');
            } else {
              console.log('❌ 테스트 실패: 첨부파일이 저장 후에도 표시되지 않습니다.');
              console.log(`- 첨부파일 섹션: ${attachmentSections > 0 ? '✅' : '❌'}`);
              console.log(`- 파일명 표시: ${attachmentFiles > 0 ? '✅' : '❌'}`);
              console.log(`- 다운로드 버튼: ${downloadButtons > 0 ? '✅' : '❌'}`);

              // 디버깅을 위한 추가 정보
              const allText = await page.textContent('body');
              console.log('🔍 페이지 전체 텍스트에서 test-file.txt 검색:', allText.includes('test-file.txt') ? '발견됨' : '없음');
            }
          }
        }
      } else {
        console.log('❌ 파일 입력 필드를 찾을 수 없습니다.');
      }
    } else {
      console.log('❌ 결과입력 버튼을 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('❌ E2E 테스트 실패:', error.message);
    await page.screenshot({
      path: './e2e-tests/screenshots/upload-error.png',
      fullPage: true
    });
  } finally {
    // 테스트 파일 정리
    try {
      const testFilePath = path.join(__dirname, 'test-file.txt');
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
        console.log('📋 테스트 파일 정리 완료');
      }
    } catch (e) {
      console.log('⚠️ 테스트 파일 정리 실패:', e.message);
    }

    await browser.close();
    console.log('✅ 첨부파일 업로드 테스트 완료');
  }
}

if (require.main === module) {
  runAttachmentUploadTest();
}

module.exports = { runAttachmentUploadTest };