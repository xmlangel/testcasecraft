// 로그인 기능 디버그 테스트
const { chromium } = require('playwright');

async function debugLogin() {
  console.log('🔍 로그인 기능 디버그 테스트 시작');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // 느리게 실행
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 페이지 로드
    console.log('1️⃣ 페이지 로드...');
    await page.goto('http://localhost:3000');
    
    // 페이지 로드 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 2. 로그인 폼 확인
    console.log('2️⃣ 로그인 폼 확인...');
    
    // username 필드 존재 확인
    const usernameField = await page.locator('input[name="username"]');
    await usernameField.waitFor({ timeout: 10000 });
    console.log('✅ username 필드 발견');
    
    // password 필드 존재 확인
    const passwordField = await page.locator('input[name="password"]');
    await passwordField.waitFor({ timeout: 5000 });
    console.log('✅ password 필드 발견');
    
    // submit 버튼 존재 확인
    const submitButton = await page.locator('button[type="submit"]');
    await submitButton.waitFor({ timeout: 5000 });
    console.log('✅ submit 버튼 발견');
    
    // 3. 로그인 정보 입력
    console.log('3️⃣ 로그인 정보 입력...');
    await usernameField.fill('admin');
    await passwordField.fill('admin');
    
    // 4. 네트워크 요청 모니터링
    console.log('4️⃣ 네트워크 요청 모니터링 시작...');
    
    const loginRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/auth/login')) {
        loginRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          body: request.postData()
        });
        console.log('📤 로그인 요청:', request.method(), request.url());
      }
    });
    
    const loginResponses = [];
    page.on('response', response => {
      if (response.url().includes('/api/auth/login')) {
        loginResponses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
        console.log('📥 로그인 응답:', response.status(), response.url());
      }
    });
    
    // 콘솔 에러 모니터링
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log('❌ 콘솔 에러:', msg.text());
      }
    });
    
    // 5. 로그인 시도
    console.log('5️⃣ 로그인 버튼 클릭...');
    await submitButton.click();
    
    // 응답 대기
    await page.waitForTimeout(3000);
    
    // 6. 결과 확인
    console.log('6️⃣ 결과 확인...');
    
    // 에러 메시지 확인
    const errorElement = await page.locator('[role="alert"], .MuiAlert-root, .error-message').first();
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      console.log('❌ 에러 메시지:', errorText);
    }
    
    // 로그인 성공 여부 확인 (프로젝트 선택 화면 또는 대시보드)
    const isLoginSuccess = await Promise.race([
      page.waitForSelector('text=프로젝트 선택', { timeout: 5000 }).then(() => true),
      page.waitForSelector('text=프로젝트', { timeout: 5000 }).then(() => true),
      page.waitForSelector('[role="button"]', { timeout: 5000 }).then(() => true),
      page.waitForTimeout(5000).then(() => false)
    ]);
    
    // 7. 결과 출력
    console.log('\n=== 디버그 결과 ===');
    console.log('로그인 성공:', isLoginSuccess ? '✅' : '❌');
    console.log('로그인 요청 수:', loginRequests.length);
    console.log('로그인 응답 수:', loginResponses.length);
    console.log('콘솔 에러 수:', consoleErrors.length);
    
    if (loginRequests.length > 0) {
      console.log('\n📤 로그인 요청 상세:');
      loginRequests.forEach((req, i) => {
        console.log(`  ${i+1}. ${req.method} ${req.url}`);
        console.log(`     Body: ${req.body}`);
      });
    }
    
    if (loginResponses.length > 0) {
      console.log('\n📥 로그인 응답 상세:');
      loginResponses.forEach((res, i) => {
        console.log(`  ${i+1}. Status: ${res.status}`);
        console.log(`     URL: ${res.url}`);
      });
    }
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ 콘솔 에러 목록:');
      consoleErrors.forEach((error, i) => {
        console.log(`  ${i+1}. ${error}`);
      });
    }
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'debug-login-result.png',
      fullPage: true
    });
    console.log('📸 스크린샷 저장: debug-login-result.png');
    
    // 성공 시 추가 확인
    if (isLoginSuccess) {
      console.log('\n🎉 로그인 성공! 추가 확인 중...');
      
      // 현재 URL 확인
      console.log('현재 URL:', page.url());
      
      // 페이지 제목 확인
      const title = await page.title();
      console.log('페이지 제목:', title);
      
      // 프로젝트 카드들 확인
      const projectCards = await page.locator('[role="button"]').count();
      console.log('프로젝트 카드 수:', projectCards);
    }
    
    return isLoginSuccess;

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    
    // 오류 스크린샷 저장
    await page.screenshot({ 
      path: 'debug-login-error.png',
      fullPage: true
    });
    console.log('📸 오류 스크린샷 저장: debug-login-error.png');
    
    return false;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
if (require.main === module) {
  debugLogin()
    .then(success => {
      console.log('\n🎯 로그인 디버그 테스트 완료');
      console.log(`결과: ${success ? '성공' : '실패'}`);
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('테스트 실패:', error);
      process.exit(1);
    });
}

module.exports = { debugLogin };