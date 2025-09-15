// E2E 테스트: 첨부파일 업로드 오류 디버깅
const { chromium } = require('playwright');

async function testAttachmentUploadError() {
  console.log('🧪 E2E 테스트 시작: 첨부파일 업로드 오류 디버깅');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });

  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });

  const page = await context.newPage();

  // 네트워크 요청 로그 수집
  page.on('request', request => {
    if (request.url().includes('attachments')) {
      console.log('📤 요청:', request.method(), request.url());
      console.log('📤 헤더:', request.headers());
    }
  });

  page.on('response', response => {
    if (response.url().includes('attachments')) {
      console.log('📥 응답:', response.status(), response.url());
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ 브라우저 오류:', msg.text());
    }
  });

  try {
    // 1. 로그인
    console.log('1️⃣ 로그인 페이지로 이동');
    await page.goto('/', { timeout: 20000 });
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/projects/, { timeout: 15000 });

    // 2. 프로젝트 선택
    console.log('2️⃣ 프로젝트 선택');
    const projectButtons = page.locator('button:has-text("프로젝트 열기")');
    const projectCount = await projectButtons.count();
    console.log(`프로젝트 개수: ${projectCount}`);

    if (projectCount > 0) {
      await projectButtons.first().click();
      await page.waitForURL(/\/projects\/[^\/]+$/, { timeout: 15000 });
      console.log('✅ 프로젝트 페이지 진입 완료');
    }

    // 3. 테스트실행 탭으로 이동
    console.log('3️⃣ 테스트실행 탭으로 이동');
    await page.click('text=테스트실행');
    await page.waitForLoadState('networkidle');

    // 4. 테스트 실행 생성 또는 선택
    console.log('4️⃣ 테스트 실행 확인');
    const executionCards = page.locator('[data-testid="execution-card"], .MuiCard-root');
    const executionCount = await executionCards.count();
    console.log(`기존 테스트 실행 개수: ${executionCount}`);

    if (executionCount === 0) {
      console.log('새 테스트 실행 생성');
      await page.click('button:has-text("새 테스트실행")');
      await page.waitForSelector('[role="dialog"]');

      await page.fill('input[name="name"]', '첨부파일 테스트 실행');
      await page.fill('textarea[name="description"]', '첨부파일 업로드 테스트');

      // 테스트 계획 선택 (기본값 건너뛰기)
      const testPlanSelect = page.locator('div[role="button"]:has-text("선택")').first();
      await testPlanSelect.click();
      await page.waitForSelector('ul[role="listbox"]');

      const planOptions = page.locator('ul[role="listbox"] li');
      const planCount = await planOptions.count();
      console.log(`테스트 계획 옵션 개수: ${planCount}`);

      if (planCount > 1) {
        await planOptions.nth(1).click(); // 두 번째 옵션 선택
      } else {
        console.log('⚠️ 테스트 계획이 부족합니다.');
        return;
      }

      await page.click('button:has-text("생성")');
      await page.waitForLoadState('networkidle');
    }

    // 5. 첫 번째 실행 선택하여 상세보기
    console.log('5️⃣ 테스트 실행 상세보기');
    const firstExecution = executionCards.first();
    await firstExecution.click();
    await page.waitForLoadState('networkidle');

    // 6. 테스트케이스 결과 입력
    console.log('6️⃣ 테스트케이스 결과 입력');
    const resultButtons = page.locator('button:has-text("결과입력")');
    const resultCount = await resultButtons.count();
    console.log(`결과입력 버튼 개수: ${resultCount}`);

    if (resultCount > 0) {
      await resultButtons.first().click();
      await page.waitForSelector('[role="dialog"]');

      // 7. 파일 첨부 테스트
      console.log('7️⃣ 파일 첨부 테스트');

      // 결과 선택
      await page.click('div[role="button"]:has-text("결과 선택")');
      await page.waitForSelector('ul[role="listbox"]');
      await page.click('li[data-value="PASS"]');

      // 노트 입력
      await page.fill('textarea[placeholder*="노트"]', '첨부파일 업로드 테스트 노트');

      // 먼저 저장
      await page.click('button:has-text("저장")');
      await page.waitForLoadState('networkidle');

      // 다시 결과입력 열기
      await page.click('button:has-text("결과입력")');
      await page.waitForSelector('[role="dialog"]');

      // 파일 선택
      const fileInput = page.locator('input[type="file"]');

      // 테스트용 CSV 파일 생성
      const testContent = 'test,data\n1,test1\n2,test2';
      const fileName = `test_attachment_${Date.now()}.csv`;

      // 파일 업로드 시도
      console.log('📁 파일 업로드 시도:', fileName);

      await fileInput.setInputFiles({
        name: fileName,
        mimeType: 'text/csv',
        buffer: Buffer.from(testContent)
      });

      // 업로드 버튼 클릭 및 응답 대기
      console.log('📤 업로드 버튼 클릭');
      const uploadButton = page.locator('button:has-text("업로드")');
      await uploadButton.click();

      // 5초 대기하여 응답 확인
      await page.waitForTimeout(5000);

      console.log('✅ 파일 업로드 테스트 완료');

    } else {
      console.log('⚠️ 결과입력 버튼을 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
  } finally {
    console.log('🔄 5초 후 브라우저 종료');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

// 테스트 실행
testAttachmentUploadError().catch(console.error);