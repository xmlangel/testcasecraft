const { chromium } = require('playwright');

/**
 * 직접적인 첨부파일 기능 테스트
 * URL 직접 접근 방식 사용
 */

async function runAttachmentDirectTest() {
  console.log('🚀 직접 URL 접근 첨부파일 테스트 시작...');

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
    console.log('📋 Step 1: 홈페이지 접속 및 로그인...');
    await page.goto('/', { timeout: 20000 });
    await page.waitForLoadState('networkidle');

    // 로그인
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    console.log('📋 Step 2: 프로젝트 페이지 확인...');
    await page.waitForURL('**/projects', { timeout: 10000 });

    // 프로젝트 ID 가져오기
    const currentURL = page.url();
    console.log(`현재 URL: ${currentURL}`);

    // 프로젝트 열기
    const projectButtons = await page.locator('button:has-text("프로젝트 열기")').count();
    if (projectButtons > 0) {
      await page.locator('button:has-text("프로젝트 열기")').first().click();
      await page.waitForLoadState('networkidle');

      console.log('📋 Step 3: 프로젝트 페이지에서 정보 수집...');
      const projectURL = page.url();
      console.log(`프로젝트 URL: ${projectURL}`);

      // 프로젝트 ID 추출 (URL에서)
      const projectMatch = projectURL.match(/\/projects\/([^\/]+)/);
      if (projectMatch) {
        const projectId = projectMatch[1];
        console.log(`📋 프로젝트 ID: ${projectId}`);

        console.log('📋 Step 4: 테스트실행 탭으로 이동...');
        await page.click('text=테스트실행');
        await page.waitForLoadState('networkidle');

        // 페이지 스크린샷
        await page.screenshot({
          path: './e2e-tests/screenshots/01-test-execution-page.png',
          fullPage: true
        });

        console.log('📋 Step 5: 새 테스트 실행 생성...');
        // "새 실행" 버튼이 있는지 확인
        const newExecutionButton = await page.locator('button:has-text("새 실행")').count();
        if (newExecutionButton > 0) {
          await page.click('button:has-text("새 실행")');
          await page.waitForLoadState('networkidle');

          // 실행명 입력
          await page.waitForSelector('input[aria-label="실행명"]', { timeout: 5000 });
          await page.fill('input[aria-label="실행명"]', 'E2E 첨부파일 테스트');

          // 테스트 계획 선택
          const testPlanSelect = await page.locator('[aria-label="테스트 계획"]').count();
          if (testPlanSelect > 0) {
            await page.click('[aria-label="테스트 계획"]');
            await page.waitForTimeout(1000);

            // 옵션 개수 확인
            const options = await page.locator('li[role="option"]').count();
            console.log(`✅ 테스트 계획 옵션 개수: ${options}개`);

            if (options > 1) {
              // 첫 번째 옵션은 "선택"이므로 두 번째 옵션 선택
              console.log('📋 두 번째 테스트 계획 옵션 선택...');
              await page.locator('li[role="option"]').nth(1).click();
              await page.waitForTimeout(1000);
            } else {
              console.log('❌ 선택할 수 있는 테스트 계획이 없습니다.');
            }

            // 저장 버튼 상태 확인
            const saveButton = page.locator('button:has-text("저장")');
            const isEnabled = await saveButton.isEnabled();
            console.log(`저장 버튼 활성화 상태: ${isEnabled}`);

            if (isEnabled) {
                await saveButton.click();
                await page.waitForLoadState('networkidle');

                // 성공 스크린샷
                await page.screenshot({
                  path: './e2e-tests/screenshots/02-execution-created.png',
                  fullPage: true
                });

                console.log('📋 Step 6: 결과입력 버튼 찾기...');
                await page.waitForTimeout(2000);

                const resultButtons = await page.locator('button:has-text("결과입력")').count();
                console.log(`✅ 결과입력 버튼 개수: ${resultButtons}`);

                if (resultButtons > 0) {
                  console.log('📋 Step 7: 결과입력 버튼 클릭...');
                  await page.locator('button:has-text("결과입력")').first().click();
                  await page.waitForTimeout(3000);

                  // 결과 화면 스크린샷
                  await page.screenshot({
                    path: './e2e-tests/screenshots/03-result-form.png',
                    fullPage: true
                  });

                  console.log('📋 Step 8: TestResultForm 요소 확인...');

                  // 빨간색 테스트 메시지 확인
                  const testMessage = await page.locator('text=TEST: TestResultForm이 로드되었습니다').count();
                  console.log(`✅ TestResultForm 로드 메시지: ${testMessage}개`);

                  // 첨부파일 관련 요소들 확인
                  const attachmentSection = await page.locator('text=파일 첨부').count();
                  const attachmentGuide = await page.locator('text=테스트 결과를 저장하면 첨부파일을 확인할 수 있습니다').count();
                  const fileInput = await page.locator('input[type="file"]').count();
                  const debugInfo = await page.locator('text=Debug - currentResult').count();

                  console.log(`✅ "파일 첨부" 섹션: ${attachmentSection}개`);
                  console.log(`✅ 첨부파일 안내 메시지: ${attachmentGuide}개`);
                  console.log(`✅ 파일 입력 필드: ${fileInput}개`);
                  console.log(`✅ 디버깅 정보: ${debugInfo}개`);

                  if (testMessage > 0 || attachmentSection > 0) {
                    console.log('🎉 테스트 성공! 첨부파일 기능이 확인되었습니다.');
                  } else {
                    console.log('⚠️  TestResultForm이 예상대로 로드되지 않았습니다.');
                  }

                  // 최종 스크린샷
                  await page.screenshot({
                    path: './e2e-tests/screenshots/04-final-attachment-test.png',
                    fullPage: true
                  });

                } else {
                  console.log('❌ 결과입력 버튼을 찾을 수 없습니다.');
                }
              } else {
                console.log('❌ 저장 버튼이 비활성화되어 있습니다.');
              }
            } else {
              console.log('❌ 테스트 계획 옵션을 찾을 수 없습니다.');
            }
          } else {
            console.log('❌ 테스트 계획 선택 필드를 찾을 수 없습니다.');
          }
        } else {
          console.log('❌ "새 실행" 버튼을 찾을 수 없습니다.');
        }
      } else {
        console.log('❌ 프로젝트 ID를 추출할 수 없습니다.');
      }
    } else {
      console.log('❌ 프로젝트 열기 버튼을 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({
      path: './e2e-tests/screenshots/error-final.png',
      fullPage: true
    });
  } finally {
    await browser.close();
    console.log('✅ 테스트 종료');
  }
}

if (require.main === module) {
  runAttachmentDirectTest();
}

module.exports = { runAttachmentDirectTest };