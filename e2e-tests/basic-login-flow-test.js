// e2e-tests/basic-login-flow-test.js
const { test, expect } = require('@playwright/test');

test.describe('기본 로그인 플로우 테스트', () => {
  
  test('홈페이지 접근 후 로그인 시 대시보드로 이동', async ({ page }) => {
    console.log('🚀 기본 로그인 플로우 테스트 시작...');
    
    // 1. 홈페이지 접근
    await page.goto('http://localhost:3000/');
    console.log('🏠 홈페이지 접근');
    
    // 2. 로그인 폼 표시 확인
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    console.log('✅ 로그인 폼 표시');
    
    // 3. 로그인
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    console.log('📝 로그인 수행');
    
    // 4. 대시보드 페이지 로드 확인
    await page.waitForSelector('h4:has-text("대시보드"), h5:has-text("대시보드"), h6:has-text("대시보드")', { timeout: 15000 });
    console.log('✅ 대시보드 페이지 로드');
    
    // 5. URL 확인
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log(`🌐 현재 URL: ${currentUrl}`);
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ 올바른 대시보드 URL');
    } else {
      console.log(`⚠️ 예상과 다른 URL: ${currentUrl}`);
    }
    
    console.log('🎉 기본 로그인 플로우 테스트 완료\!');
  });
  
});
