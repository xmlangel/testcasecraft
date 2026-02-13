// 대시보드 디버그 테스트 - 로그인 후 실제 화면 확인

const { test, expect } = require('@playwright/test');

test.describe('대시보드 디버그 테스트', () => {
  
  test('로그인 후 실제 표시되는 화면 확인', async ({ page }) => {
    console.log('🔍 대시보드 디버그 테스트 시작...');

    // 백엔드 서버 연결 확인
    let backendReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'test', password: 'test' })
        });
        backendReady = true;
        console.log('🚀 백엔드 서버 준비 완료');
        break;
      } catch (e) {
        console.log(`⏳ 백엔드 대기 중... (${i + 1}/30)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!backendReady) {
      throw new Error('백엔드 서버가 준비되지 않았습니다');
    }

    // 페이지 이동 및 로그인
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
    
    console.log('📍 현재 URL:', page.url());
    
    // 로그인 수행
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // JWT 토큰 저장 확인
    await page.waitForTimeout(3000);
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (!accessToken) {
      await page.waitForTimeout(2000);
      const retryToken = await page.evaluate(() => localStorage.getItem('accessToken'));
      console.log('🔑 재시도 토큰:', retryToken ? '존재' : '없음');
    }
    
    console.log('✅ 로그인 완료');
    console.log('📍 로그인 후 URL:', page.url());
    
    // 현재 페이지 제목들 확인
    const allHeadings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    console.log('📋 페이지 제목들:', allHeadings);
    
    // 네비게이션 버튼들 확인
    const navButtons = await page.locator('.MuiButton-root').allTextContents();
    console.log('🧭 네비게이션 버튼들:', navButtons);
    
    // 대시보드 버튼 클릭 시도
    console.log('🎯 대시보드 버튼 클릭 시도...');
    
    // 대시보드 버튼이 존재하는지 확인
    const dashboardButton = page.locator('text=대시보드');
    const dashboardExists = await dashboardButton.count();
    console.log('📊 대시보드 버튼 개수:', dashboardExists);
    
    if (dashboardExists > 0) {
      await dashboardButton.click();
      await page.waitForTimeout(2000);
      console.log('📍 대시보드 클릭 후 URL:', page.url());
      
      // 페이지 제목들 다시 확인
      const dashboardHeadings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
      console.log('📋 대시보드 페이지 제목들:', dashboardHeadings);
      
      // 페이지 전체 텍스트 일부 확인
      const bodyText = await page.locator('body').textContent();
      console.log('📄 페이지 텍스트 일부:', bodyText.substring(0, 500));
    }
    
    // 디버그 스크린샷 촬영
    await page.screenshot({ 
      path: 'test-results/debug-dashboard-screenshot.png', 
      fullPage: true 
    });
    console.log('📸 디버그 스크린샷 저장: test-results/debug-dashboard-screenshot.png');
  });
});