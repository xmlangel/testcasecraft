const { chromium } = require('playwright');

/**
 * 첨부파일 기능 화면 검사 테스트
 * 실제 UI 구조와 동작을 단계별로 확인
 */

async function runAttachmentScreenInspection() {
  console.log('🚀 첨부파일 기능 화면 검사 시작...');

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

    // 초기 화면 스크린샷
    await page.screenshot({
      path: './e2e-tests/e2e-tests/screenshots/screen-inspection-01-projects.png',
      fullPage: true
    });

    const projectButtons = await page.locator('button:has-text("프로젝트 열기")').count();
    if (projectButtons > 0) {
      await page.locator('button:has-text("프로젝트 열기")').first().click();
      await page.waitForLoadState('networkidle');
    } else {
      throw new Error('프로젝트를 찾을 수 없습니다.');
    }

    // 프로젝트 메인 화면
    await page.screenshot({
      path: './e2e-tests/e2e-tests/screenshots/screen-inspection-02-project-main.png',
      fullPage: true
    });

    console.log('📋 Step 3: 테스트실행 탭으로 이동...');
    await page.click('text=테스트실행');
    await page.waitForLoadState('networkidle');

    // 테스트실행 화면
    await page.screenshot({
      path: './e2e-tests/e2e-tests/screenshots/screen-inspection-03-test-execution.png',
      fullPage: true
    });

    console.log('📋 Step 4: 기존 테스트 실행 상세 분석...');

    // 기존 테스트 실행 링크들 찾기
    const executionLinks = await page.locator('a[href*="/executions/"]').count();
    console.log(`✅ 발견된 테스트 실행 링크: ${executionLinks}개`);

    if (executionLinks > 0) {
      console.log('📋 Step 5: 기존 테스트 실행 클릭...');
      await page.locator('a[href*="/executions/"]').first().click();
      await page.waitForLoadState('networkidle');

      // 실행 상세 화면
      await page.screenshot({
        path: './e2e-tests/e2e-tests/screenshots/screen-inspection-04-execution-details.png',
        fullPage: true
      });

      console.log('📋 Step 6: 결과입력 버튼 상세 분석...');
      await page.waitForTimeout(2000);

      // 모든 버튼 찾기
      const allButtons = await page.locator('button').count();
      console.log(`🔍 페이지 내 전체 버튼 개수: ${allButtons}개`);

      // 결과입력 관련 요소들 찾기
      const resultInputButtons = await page.locator('button:has-text("결과입력")').count();
      const resultButtons = await page.locator('button:has-text("결과")').count();
      const inputButtons = await page.locator('button:has-text("입력")').count();

      console.log(`✅ "결과입력" 버튼: ${resultInputButtons}개`);
      console.log(`✅ "결과" 버튼: ${resultButtons}개`);
      console.log(`✅ "입력" 버튼: ${inputButtons}개`);

      // 모든 버튼의 텍스트 수집
      for (let i = 0; i < Math.min(allButtons, 20); i++) {
        try {
          const buttonText = await page.locator('button').nth(i).textContent();
          console.log(`🔍 버튼 ${i}: "${buttonText}"`);
        } catch (e) {
          console.log(`🔍 버튼 ${i}: 텍스트 읽기 실패`);
        }
      }

      // 테스트 실행 상태 확인
      const statusElements = await page.locator('text=/상태|status|Status/i').count();
      console.log(`🔍 상태 관련 요소: ${statusElements}개`);

      if (resultInputButtons > 0) {
        console.log('📋 Step 7: 결과입력 버튼 클릭...');
        await page.locator('button:has-text("결과입력")').first().click();
        await page.waitForTimeout(3000);

        // 결과입력 화면
        await page.screenshot({
          path: './e2e-tests/e2e-tests/screenshots/screen-inspection-05-result-form.png',
          fullPage: true
        });

        console.log('📋 Step 8: TestResultForm 및 첨부파일 섹션 확인...');

        // TestResultForm 관련 요소들 확인
        const testMessages = await page.locator('text=/TEST.*TestResultForm/i').count();
        const attachmentSections = await page.locator('text=/파일.*첨부|첨부파일/i').count();
        const fileInputs = await page.locator('input[type="file"]').count();
        const debugInfo = await page.locator('text=/Debug.*currentResult/i').count();

        console.log(`✅ TestResultForm 테스트 메시지: ${testMessages}개`);
        console.log(`✅ 첨부파일 관련 텍스트: ${attachmentSections}개`);
        console.log(`✅ 파일 입력 필드: ${fileInputs}개`);
        console.log(`✅ 디버그 정보: ${debugInfo}개`);

        // 다이얼로그 또는 페이지 정보 확인
        const dialogTitles = await page.locator('[role="dialog"] h2, [role="dialog"] h1').count();
        if (dialogTitles > 0) {
          const titleText = await page.locator('[role="dialog"] h2, [role="dialog"] h1').first().textContent();
          console.log(`🔍 다이얼로그 제목: "${titleText}"`);
        }

        const currentURL = page.url();
        console.log(`🔍 현재 URL: ${currentURL}`);

      } else {
        console.log('❌ 결과입력 버튼을 찾을 수 없습니다. 테스트 실행을 시작해야 할 수도 있습니다.');

        // 실행 시작 관련 버튼 찾기
        const startButtons = await page.locator('button:has-text("시작")').count();
        const executeButtons = await page.locator('button:has-text("실행")').count();

        console.log(`🔍 "시작" 버튼: ${startButtons}개`);
        console.log(`🔍 "실행" 버튼: ${executeButtons}개`);

        if (startButtons > 0) {
          console.log('📋 테스트 실행 시작 시도...');
          await page.locator('button:has-text("시작")').first().click();
          await page.waitForTimeout(2000);

          // 시작 후 스크린샷
          await page.screenshot({
            path: './e2e-tests/e2e-tests/screenshots/screen-inspection-06-after-start.png',
            fullPage: true
          });

          // 다시 결과입력 버튼 확인
          const newResultButtons = await page.locator('button:has-text("결과입력")').count();
          console.log(`✅ 시작 후 결과입력 버튼: ${newResultButtons}개`);
        }
      }

    } else {
      console.log('❌ 기존 테스트 실행을 찾을 수 없습니다. 새 실행을 생성해야 합니다.');

      console.log('📋 새 테스트 실행 생성...');
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
          await page.locator('li[role="option"]').nth(1).click();
          await page.waitForTimeout(1000);

          const saveButton = page.locator('button:has-text("저장")');
          const isEnabled = await saveButton.isEnabled();
          console.log(`저장 버튼 활성화: ${isEnabled}`);

          if (isEnabled) {
            await saveButton.click();
            await page.waitForLoadState('networkidle');

            // 새 실행 생성 후 화면
            await page.screenshot({
              path: './e2e-tests/e2e-tests/screenshots/screen-inspection-07-new-execution.png',
              fullPage: true
            });
          }
        }
      }
    }

  } catch (error) {
    console.error('❌ 화면 검사 실패:', error.message);
    await page.screenshot({
      path: './e2e-tests/e2e-tests/screenshots/screen-inspection-error.png',
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('✅ 화면 검사 완료');
  }
}

if (require.main === module) {
  runAttachmentScreenInspection();
}

module.exports = { runAttachmentScreenInspection };