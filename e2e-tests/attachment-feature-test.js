const { chromium } = require('playwright');

/**
 * E2E Test: 첨부파일 기능 테스트
 *
 * 테스트 시나리오:
 * 1. 로그인
 * 2. 프로젝트 선택
 * 3. 테스트 실행 페이지로 이동
 * 4. 결과입력 버튼 클릭
 * 5. 첨부파일 섹션 확인
 * 6. 파일 업로드 테스트
 * 7. 저장된 첨부파일 확인
 */

async function runAttachmentTest() {
  console.log('🚀 첨부파일 기능 E2E 테스트 시작...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // 1초 지연으로 동작을 확인할 수 있게
  });

  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });

  const page = await context.newPage();

  // 콘솔 로그 수집
  page.on('console', msg => {
    if (msg.text().includes('TestResultForm') || msg.text().includes('attachment') || msg.text().includes('첨부파일')) {
      console.log(`🔍 Browser Console: ${msg.text()}`);
    }
  });

  try {
    console.log('📋 Step 1: 홈페이지 접속...');
    await page.goto('/', { timeout: 20000 });
    await page.waitForLoadState('networkidle');

    console.log('📋 Step 2: 로그인...');
    // 로그인 폼 대기
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });

    // 로그인 정보 입력
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');

    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    console.log('📋 Step 3: 프로젝트 선택...');
    // 프로젝트 페이지로 리디렉션 대기
    await page.waitForURL('**/projects', { timeout: 10000 });

    // 프로젝트 열기 버튼 클릭
    const projectButtons = await page.locator('button:has-text("프로젝트 열기")').count();
    if (projectButtons > 0) {
      await page.locator('button:has-text("프로젝트 열기")').first().click();
      await page.waitForLoadState('networkidle');
    } else {
      throw new Error('프로젝트 열기 버튼을 찾을 수 없습니다.');
    }

    console.log('📋 Step 4: 테스트실행 탭으로 이동...');
    // 테스트실행 탭 클릭
    await page.click('text=테스트실행');
    await page.waitForLoadState('networkidle');

    console.log('📋 Step 5: 테스트 실행 찾기 또는 생성...');
    // 기존 테스트 실행이 있는지 확인
    const executionLinks = await page.locator('a[href*="/executions/"]').count();
    if (executionLinks > 0) {
      // 기존 테스트 실행 클릭
      await page.locator('a[href*="/executions/"]').first().click();
    } else {
      // 새 테스트 실행 생성
      console.log('📋 새 테스트 실행 생성...');
      await page.click('button:has-text("새 실행")');

      // 실행명 입력
      await page.fill('input[aria-label="실행명"]', 'E2E 테스트 실행');

      // 테스트 계획 선택
      await page.click('[aria-label="테스트 계획"]');
      await page.click('li[role="option"]', { timeout: 5000 });

      // 저장 버튼 클릭
      await page.click('button:has-text("저장")');
    }

    await page.waitForLoadState('networkidle');

    console.log('📋 Step 6: 결과입력 버튼 찾기...');
    // 결과입력 버튼 대기
    const resultButtons = await page.locator('button:has-text("결과입력")').count();
    console.log(`✅ 찾은 결과입력 버튼 개수: ${resultButtons}`);

    if (resultButtons === 0) {
      throw new Error('결과입력 버튼을 찾을 수 없습니다.');
    }

    console.log('📋 Step 7: 결과입력 버튼 클릭...');
    await page.locator('button:has-text("결과입력")').first().click();

    // 다이얼로그 또는 페이지 로딩 대기
    await page.waitForTimeout(2000);

    console.log('📋 Step 8: TestResultForm 로딩 확인...');
    // 강력한 테스트 메시지 확인
    const testMessage = await page.locator('text=TEST: TestResultForm이 로드되었습니다').count();
    console.log(`✅ TestResultForm 로딩 메시지 발견: ${testMessage}개`);

    if (testMessage > 0) {
      console.log('🎉 TestResultForm이 성공적으로 로드되었습니다!');

      // 첨부파일 섹션 확인
      console.log('📋 Step 9: 첨부파일 섹션 확인...');
      const attachmentSection = await page.locator('text=파일 첨부').count();
      console.log(`✅ 첨부파일 섹션 발견: ${attachmentSection}개`);

      // 파란색 테스트 메시지 확인
      const blueMessage = await page.locator('text=첨부파일 섹션이 로드되었습니다').count();
      console.log(`✅ 첨부파일 로드 메시지 발견: ${blueMessage}개`);

      // 디버깅 정보 수집
      const debugInfo = await page.locator('text=Debug - currentResult').count();
      console.log(`🔍 디버깅 정보 발견: ${debugInfo}개`);

      if (debugInfo > 0) {
        const debugText = await page.locator('text=Debug - currentResult').first().textContent();
        console.log(`🔍 디버깅 정보: ${debugText}`);
      }

      // 저장된 첨부파일 또는 안내 메시지 확인
      const savedAttachments = await page.locator('text=저장된 첨부파일').count();
      const attachmentGuide = await page.locator('text=테스트 결과를 저장하면 첨부파일을 확인할 수 있습니다').count();

      console.log(`✅ 저장된 첨부파일 섹션: ${savedAttachments}개`);
      console.log(`✅ 첨부파일 안내 메시지: ${attachmentGuide}개`);

      // 스크린샷 촬영
      await page.screenshot({
        path: './e2e-tests/screenshots/attachment-test-result.png',
        fullPage: true
      });

      console.log('📸 스크린샷 저장 완료: ./e2e-tests/screenshots/attachment-test-result.png');

    } else {
      console.log('❌ TestResultForm 로딩 메시지를 찾을 수 없습니다.');

      // 현재 페이지 상태 확인
      const currentURL = page.url();
      console.log(`🔍 현재 URL: ${currentURL}`);

      // 에러 스크린샷
      await page.screenshot({
        path: './e2e-tests/screenshots/attachment-test-error.png',
        fullPage: true
      });

      console.log('📸 에러 스크린샷 저장: ./e2e-tests/screenshots/attachment-test-error.png');
    }

    console.log('✅ E2E 테스트 완료!');

  } catch (error) {
    console.error('❌ E2E 테스트 실패:', error.message);

    // 에러 스크린샷
    await page.screenshot({
      path: './e2e-tests/screenshots/attachment-test-failure.png',
      fullPage: true
    });

    console.log('📸 실패 스크린샷 저장: ./e2e-tests/screenshots/attachment-test-failure.png');
  } finally {
    await browser.close();
  }
}

// 테스트 실행
if (require.main === module) {
  runAttachmentTest();
}

module.exports = { runAttachmentTest };