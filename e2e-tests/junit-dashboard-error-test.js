// e2e-tests/junit-dashboard-error-test.js

/**
 * ICT-215: JUnit 대시보드 API 오류 테스트
 * Playwright를 사용한 실제 브라우저 환경에서의 JUnit 대시보드 테스트
 */

const { test, expect } = require('@playwright/test');

test.describe('JUnit Dashboard Error Testing', () => {
  let page;
  
  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // 네트워크 요청 모니터링 설정
    page.on('request', request => {
      console.log('📤 Request:', request.method(), request.url());
    });
    
    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      console.log(`📥 Response: ${status} ${url}`);
      
      // API 응답 실패 시 상세 로깅
      if (status >= 400 && url.includes('/api/')) {
        console.error(`❌ API Error: ${status} ${url}`);
      }
    });
    
    // 콘솔 로그 캡처
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`🖥️ Console [${type}]: ${text}`);
      
      // 오류 로그 특별 처리
      if (type === 'error') {
        console.error(`🚨 Frontend Error: ${text}`);
      }
    });
    
    // 페이지 오류 캡처
    page.on('pageerror', error => {
      console.error('🚨 Page Error:', error.message);
    });
  });

  test('JUnit 대시보드 접근 및 API 호출 테스트', async () => {
    console.log('=== JUnit 대시보드 API 오류 테스트 시작 ===');
    
    // 1. 로그인
    console.log('1️⃣ 로그인 페이지 접근');
    await page.goto('http://localhost:3000');
    
    // 로그인 폼이 나타날 때까지 대기
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    
    console.log('2️⃣ 로그인 시도');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // 로그인 성공 후 대시보드 화면 대기
    await page.waitForSelector('text=대시보드', { timeout: 10000 });
    console.log('✅ 로그인 성공, 대시보드 화면 도달');
    
    // 3. 상단 네비게이션에서 "프로젝트 선택" 클릭
    console.log('3️⃣ 상단 네비게이션에서 프로젝트 선택 클릭');
    
    // 상단 "프로젝트 선택" 버튼 클릭
    const projectSelectButton = page.locator('button:has-text("프로젝트 선택")');
    await projectSelectButton.click();
    
    // 프로젝트 선택 화면 로드 대기
    await page.waitForSelector('text=프로젝트 관리', { timeout: 10000 });
    console.log('✅ 프로젝트 선택 화면 로드 완료');
    
    // 4. 프로젝트 선택 (첫 번째 프로젝트)
    console.log('4️⃣ 프로젝트 선택 시도');
    
    // 프로젝트 카드가 로드될 때까지 대기 (Card 컴포넌트 또는 프로젝트 열기 버튼)
    await page.waitForSelector('button:has-text("프로젝트 열기"), .MuiCard-root', { timeout: 15000 });
    
    // 첫 번째 "프로젝트 열기" 버튼 클릭
    const firstProjectButton = page.locator('button:has-text("프로젝트 열기")').first();
    await firstProjectButton.click();
    
    console.log('✅ 프로젝트 선택 완료');
    
    // 5. 프로젝트 대시보드 로드 대기
    await page.waitForSelector('text=대시보드', { timeout: 10000 });
    console.log('✅ 프로젝트 대시보드 로드 완료');
    
    // 6. JUnit 탭으로 이동
    console.log('5️⃣ JUnit 탭으로 이동');
    
    // JUnit 탭 찾기 및 클릭
    const junitTab = page.locator('text=JUnit');
    await expect(junitTab).toBeVisible({ timeout: 10000 });
    await junitTab.click();
    
    console.log('✅ JUnit 탭 클릭 완료');
    
    // 7. JUnit 대시보드 로드 대기 및 API 호출 모니터링
    console.log('6️⃣ JUnit 대시보드 로드 대기');
    
    // JUnit 대시보드 컴포넌트가 로드될 때까지 대기
    await page.waitForTimeout(3000); // API 호출이 완료될 때까지 대기
    
    // 페이지 상태 확인
    const pageContent = await page.content();
    
    // 8. 오류 메시지 확인
    console.log('7️⃣ 오류 메시지 확인');
    
    // "테스트 결과를 불러오는데 실패했습니다" 메시지 확인
    const errorMessage = page.locator('text=테스트 결과를 불러오는데 실패했습니다');
    const hasError = await errorMessage.count() > 0;
    
    if (hasError) {
      console.error('❌ 발견된 오류: "테스트 결과를 불러오는데 실패했습니다"');
      
      // 스크린샷 촬영
      await page.screenshot({ 
        path: 'e2e-tests/junit-dashboard-error.png',
        fullPage: true 
      });
      
      console.log('📸 오류 스크린샷 저장됨: e2e-tests/junit-dashboard-error.png');
    } else {
      console.log('✅ 오류 메시지 없음 - JUnit 대시보드 정상 로드');
    }
    
    // 9. 네트워크 요청 분석을 위한 추가 대기
    await page.waitForTimeout(2000);
    
    console.log('=== JUnit 대시보드 테스트 완료 ===');
  });

  test('빈 JUnit 데이터 상태에서의 대시보드 동작 테스트', async () => {
    console.log('=== 빈 JUnit 데이터 상태 테스트 시작 ===');
    
    // 로그인 및 프로젝트 선택 (위와 동일한 과정)
    await page.goto('http://localhost:3000');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=대시보드', { timeout: 10000 });
    
    // 상단 네비게이션에서 프로젝트 선택 클릭
    const projectSelectButton = page.locator('button:has-text("프로젝트 선택")');
    await projectSelectButton.click();
    await page.waitForSelector('text=프로젝트 관리', { timeout: 10000 });
    
    // 프로젝트 선택
    await page.waitForSelector('button:has-text("프로젝트 열기"), .MuiCard-root', { timeout: 15000 });
    const firstProjectButton = page.locator('button:has-text("프로젝트 열기")').first();
    await firstProjectButton.click();
    await page.waitForSelector('text=대시보드', { timeout: 10000 });
    
    // JUnit 탭으로 이동
    const junitTab = page.locator('text=JUnit');
    await junitTab.click();
    
    // 빈 상태 UI 확인
    console.log('1️⃣ 빈 상태 UI 확인');
    
    // "데이터가 없습니다" 또는 유사한 메시지 확인
    const emptyStateMessages = [
      'text=데이터가 없습니다',
      'text=JUnit 결과가 없습니다',
      'text=업로드된 테스트 결과가 없습니다',
      'text=테스트 결과를 불러오는데 실패했습니다'
    ];
    
    let foundMessage = '';
    for (const selector of emptyStateMessages) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        foundMessage = selector;
        break;
      }
    }
    
    if (foundMessage) {
      console.log(`📋 발견된 메시지: ${foundMessage}`);
      
      if (foundMessage.includes('실패')) {
        console.error('❌ 오류 메시지 발견');
        await page.screenshot({ 
          path: 'e2e-tests/junit-empty-state-error.png',
          fullPage: true 
        });
      } else {
        console.log('✅ 정상적인 빈 상태 메시지');
      }
    } else {
      console.log('📋 특별한 메시지 없음 - 기본 UI 표시');
    }
    
    console.log('=== 빈 JUnit 데이터 상태 테스트 완료 ===');
  });

  test('JUnit 업로드 버튼 및 기본 UI 요소 확인', async () => {
    console.log('=== JUnit UI 요소 확인 테스트 시작 ===');
    
    // 로그인 및 JUnit 탭까지 이동 (공통 과정)
    await page.goto('http://localhost:3000');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=대시보드', { timeout: 10000 });
    
    // 상단 네비게이션에서 프로젝트 선택 클릭
    await page.locator('button:has-text("프로젝트 선택")').click();
    await page.waitForSelector('text=프로젝트 관리', { timeout: 10000 });
    
    // 프로젝트 선택
    await page.waitForSelector('button:has-text("프로젝트 열기"), .MuiCard-root', { timeout: 15000 });
    await page.locator('button:has-text("프로젝트 열기")').first().click();
    await page.waitForSelector('text=대시보드', { timeout: 10000 });
    await page.locator('text=JUnit').click();
    
    // UI 요소 확인
    console.log('1️⃣ 기본 UI 요소 확인');
    
    await page.waitForTimeout(3000); // UI 로드 대기
    
    // 업로드 버튼 확인
    const uploadButton = page.locator('text=XML 업로드').or(page.locator('text=파일 업로드')).or(page.locator('[data-testid="upload-button"]'));
    const hasUploadButton = await uploadButton.count() > 0;
    
    if (hasUploadButton) {
      console.log('✅ 업로드 버튼 발견');
    } else {
      console.log('❌ 업로드 버튼 미발견');
    }
    
    // 새로고침 버튼 확인
    const refreshButton = page.locator('text=새로고침').or(page.locator('[aria-label*="새로고침"]'));
    const hasRefreshButton = await refreshButton.count() > 0;
    
    if (hasRefreshButton) {
      console.log('✅ 새로고침 버튼 발견');
    } else {
      console.log('❌ 새로고침 버튼 미발견');
    }
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: 'e2e-tests/junit-dashboard-ui-elements.png',
      fullPage: true 
    });
    
    console.log('📸 UI 스크린샷 저장됨: e2e-tests/junit-dashboard-ui-elements.png');
    console.log('=== JUnit UI 요소 확인 테스트 완료 ===');
  });

  test.afterEach(async () => {
    await page.close();
  });
});