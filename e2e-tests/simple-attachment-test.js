// 간단한 첨부파일 업로드 테스트
const { chromium } = require('playwright');

async function simpleAttachmentTest() {
  console.log('🧪 간단한 첨부파일 업로드 테스트 시작');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });

  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });

  const page = await context.newPage();

  // 네트워크 모니터링
  page.on('request', request => {
    if (request.url().includes('attachments')) {
      console.log('📤 업로드 요청:', request.method(), request.url());
      const contentType = request.headers()['content-type'];
      console.log('📤 Content-Type:', contentType);
    }
  });

  page.on('response', response => {
    if (response.url().includes('attachments')) {
      console.log('📥 응답:', response.status(), response.statusText());
    }
  });

  try {
    // 1. 로그인
    console.log('1️⃣ 로그인');
    await page.goto('/', { timeout: 20000 });
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/projects/, { timeout: 15000 });

    // 2. 프로젝트 선택
    console.log('2️⃣ 프로젝트 선택');
    await page.click('button:has-text("프로젝트 열기")');
    await page.waitForURL(/\/projects\/[^\/]+$/, { timeout: 15000 });

    // 3. 테스트실행 탭
    console.log('3️⃣ 테스트실행 탭으로 이동');
    await page.click('text=테스트실행');
    await page.waitForLoadState('networkidle');

    // 4. 첫 번째 실행 카드 클릭
    console.log('4️⃣ 테스트 실행 선택');
    await page.click('.MuiCard-root');
    await page.waitForLoadState('networkidle');

    // 5. 결과입력 버튼 클릭
    console.log('5️⃣ 결과입력 버튼 클릭');
    await page.click('button:has-text("결과입력")');
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });

    console.log('✅ 결과입력 다이얼로그 열림');

    // 6. 결과 선택 - 여러 시도
    console.log('6️⃣ 결과 선택 시도');
    try {
      await page.click('div:has-text("결과 선택")');
    } catch (e) {
      try {
        await page.click('.MuiSelect-root');
      } catch (e2) {
        await page.click('[data-testid="result-select"]');
      }
    }
    
    await page.waitForSelector('[role="listbox"]', { timeout: 5000 });
    await page.click('li:has-text("PASS")');

    // 7. 노트 입력
    console.log('7️⃣ 노트 입력');
    await page.fill('textarea', '파일 업로드 테스트');

    // 8. 저장
    console.log('8️⃣ 결과 저장');
    await page.click('button:has-text("저장")');
    await page.waitForLoadState('networkidle');

    // 9. 다시 결과입력 열기
    console.log('9️⃣ 다시 결과입력 열기');
    await page.click('button:has-text("결과입력")');
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });

    // 10. 파일 업로드
    console.log('🔟 파일 업로드');
    const fileInput = page.locator('input[type="file"]');
    const testContent = 'test,data\n1,success\n2,pass';

    await fileInput.setInputFiles({
      name: `test_${Date.now()}.csv`,
      mimeType: 'text/csv',
      buffer: Buffer.from(testContent)
    });

    console.log('📁 파일 선택 완료');

    // 업로드 버튼 클릭
    await page.click('button:has-text("업로드")');
    console.log('📤 업로드 버튼 클릭됨');

    // 결과 대기
    await page.waitForTimeout(5000);

    console.log('✅ 테스트 완료');

  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    console.log('🔄 5초 후 브라우저 종료');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// 테스트 실행
simpleAttachmentTest().catch(console.error);
