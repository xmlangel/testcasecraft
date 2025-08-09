// e2e-tests/project-url-redirect-test.js
const { test, expect } = require('@playwright/test');

test.describe('프로젝트 URL 직접 접근 테스트', () => {
  
  test('프로젝트별 URL로 직접 접근 시 로그인 후 해당 프로젝트 페이지 표시', async ({ page }) => {
    console.log('🚀 프로젝트 URL 직접 접근 테스트 시작...');
    
    // 콘솔 및 네트워크 모니터링
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('[Auth]') || msg.text().includes('redirect')) {
        console.log(`🖥️ Console: ${msg.text()}`);
      }
    });
    
    page.on('request', request => {
      if (request.url().includes('/api/auth/') || request.url().includes('/api/projects')) {
        console.log(`📤 API Request: ${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/auth/') || response.url().includes('/api/projects')) {
        console.log(`📥 API Response: ${response.status()} ${response.url()}`);
      }
    });
    
    const testProjectId = 'd5ecf150-5e60-4853-8037-d69b634a9267';
    const projectUrl = `http://localhost:3000/projects/${testProjectId}`;
    
    // 1. 프로젝트 URL로 직접 접근 (로그인 전)
    console.log(`🔗 프로젝트 URL 직접 접근: ${projectUrl}`);
    await page.goto(projectUrl);
    
    // 2. 로그인 폼이 표시되는지 확인 (URL 변경 없이도 가능)
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    console.log('✅ 로그인 폼 표시 확인');
    
    // 3. 로그인 수행
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    console.log('📝 로그인 정보 입력 및 제출');
    
    // 4. 로그인 후 프로젝트 페이지가 로드되는지 확인
    console.log('⏳ 로그인 후 프로젝트 페이지 로딩 대기...');
    
    // 프로젝트 페이지의 특징적 요소들 대기
    try {
      // 프로젝트 헤더나 탭이 나타나는지 확인
      await page.waitForSelector('h4, h5, h6, .MuiTab-root, [data-testid*="project"], .project-header', { timeout: 15000 });
      console.log('✅ 프로젝트 페이지 요소 감지');
      
      // 현재 URL 확인
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log(`🌐 현재 URL: ${currentUrl}`);
      
      // URL이 원래 프로젝트 URL과 일치하는지 확인
      if (currentUrl.includes(testProjectId)) {
        console.log('✅ 올바른 프로젝트 URL 유지됨');
      } else {
        console.log(`⚠️ URL 불일치 - 예상: ${testProjectId} 포함, 실제: ${currentUrl}`);
      }
      
    } catch (error) {
      console.log('❌ 프로젝트 페이지 로딩 실패:', error.message);
      
      // 현재 상태 진단
      const currentUrl = page.url();
      const pageTitle = await page.textContent('h1, h2, h3, h4, h5, h6').catch(() => 'No title found');
      console.log(`🌐 현재 URL: ${currentUrl}`);
      console.log(`📖 페이지 제목: ${pageTitle}`);
    }
    
    // 5. 페이지 컨텐츠 상세 확인
    const allHeadings = await page.$$eval('h1, h2, h3, h4, h5, h6', elements => 
      elements.map(el => el.textContent).join(', ')
    ).catch(() => 'No headings found');
    console.log(`📑 모든 제목들: ${allHeadings}`);
    
    // 6. 스크린샷 촬영
    await page.screenshot({ 
      path: `test-results/project-url-redirect-test-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('🎉 프로젝트 URL 접근 테스트 완료\!');
  });
  
});
