// E2E 테스트: 수정된 첨부파일 업로드 기능 테스트
const { chromium } = require('playwright');

async function testAttachmentUploadFixed() {
  console.log('🧪 E2E 테스트 시작: 수정된 첨부파일 업로드 기능');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800
  });

  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });

  const page = await context.newPage();

  // 네트워크 요청 모니터링
  page.on('request', request => {
    if (request.url().includes('attachments')) {
      console.log('📤 업로드 요청:', request.method(), request.url());
      console.log('📤 헤더:', request.headers());
    }
  });

  page.on('response', response => {
    if (response.url().includes('attachments')) {
      console.log('📥 응답:', response.status(), response.statusText());
      response.text().then(text => {
        if (text) console.log('📥 응답 내용:', text.substring(0, 200));
      }).catch(() => {});
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ 브라우저 오류:', msg.text());
    } else if (msg.text().includes('파일') || msg.text().includes('업로드')) {
      console.log('📝 브라우저 로그:', msg.text());
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
    const projectButtons = page.locator('button:has-text("프로젝트 열기")');
    await projectButtons.first().click();
    await page.waitForURL(/\/projects\/[^\/]+$/, { timeout: 15000 });

    // 3. 테스트실행 탭으로 이동
    console.log('3️⃣ 테스트실행 탭으로 이동');
    await page.click('text=테스트실행');
    await page.waitForLoadState('networkidle');

    // 4. 첫 번째 테스트 실행 선택
    console.log('4️⃣ 테스트 실행 선택');
    const executionCards = page.locator('[data-testid="execution-card"], .MuiCard-root');
    await executionCards.first().click();
    await page.waitForLoadState('networkidle');

    // 5. 결과입력 버튼 클릭
    console.log('5️⃣ 결과입력 다이얼로그 열기');
    const resultButtons = page.locator('button:has-text("결과입력")');
    await resultButtons.first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });

    // 6. 테스트 결과 입력
    console.log('6️⃣ 테스트 결과 입력');

    // 결과 선택
    await page.click('div[role="button"]', { timeout: 5000 });
    await page.waitForSelector('ul[role="listbox"]', { timeout: 5000 });
    await page.click('li[data-value="PASS"]');

    // 노트 입력
    await page.fill('textarea', '첨부파일 업로드 테스트 결과');

    // 먼저 저장하여 테스트 결과 ID 생성
    console.log('7️⃣ 결과 저장 (ID 생성)');
    await page.click('button:has-text("저장")');
    await page.waitForLoadState('networkidle');

    // 8. 다시 결과입력 열어서 파일 첨부
    console.log('8️⃣ 파일 첨부를 위해 다시 결과입력 열기');
    await resultButtons.first().click();
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });

    // 9. 파일 업로드 테스트
    console.log('9️⃣ 파일 업로드 시작');

    const fileInput = page.locator('input[type="file"]');
    const testContent = 'TestCase,Result,Notes\nTC-001,PASS,업로드 테스트\nTC-002,FAIL,오류 확인';
    const fileName = `test_upload_${Date.now()}.csv`;

    await fileInput.setInputFiles({
      name: fileName,
      mimeType: 'text/csv',
      buffer: Buffer.from(testContent)
    });

    console.log('📁 파일 선택 완료:', fileName);

    // 업로드 버튼 클릭
    console.log('📤 업로드 버튼 클릭');
    const uploadButton = page.locator('button:has-text("업로드")');
    await uploadButton.click();

    // 업로드 결과 대기
    console.log('⏳ 업로드 결과 대기 중...');
    await page.waitForTimeout(3000);

    // 10. 업로드된 파일 확인
    console.log('🔍 업로드된 파일 확인');
    const attachmentsList = page.locator('.MuiList-root');

    if (await attachmentsList.isVisible()) {
      const attachmentItems = page.locator('.MuiListItem-root');
      const count = await attachmentItems.count();
      console.log(`✅ 첨부파일 개수: ${count}`);

      if (count > 0) {
        const firstAttachment = attachmentItems.first();
        const fileName = await firstAttachment.locator('.MuiTypography-root').first().textContent();
        console.log(`✅ 첫 번째 첨부파일: ${fileName}`);
      }
    } else {
      console.log('⚠️ 첨부파일 목록이 표시되지 않음');
    }

    console.log('✅ 파일 업로드 테스트 완료');

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
  } finally {
    console.log('🔄 5초 후 브라우저 종료');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// 테스트 실행
testAttachmentUploadFixed().catch(console.error);