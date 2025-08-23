// ICT-280: Debug test to understand the current state
const { chromium } = require('playwright');

(async () => {
  console.log('=== ICT-280: Debug Test - 현재 상태 확인 ===');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });

  const page = await context.newPage();
  
  try {
    // 1. 로그인
    console.log('✅ Step 1: 로그인');
    await page.goto('/', { timeout: 20000 });
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // 2. 프로젝트 선택
    console.log('✅ Step 2: 프로젝트 선택');
    await page.locator('text=프로젝트').first().click();
    await page.waitForLoadState('networkidle');

    const projectButtons = await page.locator('button:has-text("프로젝트 열기")');
    await projectButtons.first().click();
    await page.waitForLoadState('networkidle');

    // 3. 테스트 결과 탭으로 이동
    console.log('✅ Step 3: 테스트 결과 탭으로 이동');
    await page.locator('text=테스트 결과').first().click();
    await page.waitForLoadState('networkidle');

    // 4. 페이지 내용 확인
    console.log('✅ Step 4: 페이지 내용 확인');
    
    // 현재 URL 확인
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);
    
    // 페이지 제목 확인
    const title = await page.textContent('h1, h2, h3, h4, h5, h6').catch(() => 'No title found');
    console.log(`페이지 제목: ${title}`);
    
    // 테이블 관련 요소들 확인
    const tableElements = await page.locator('[role="grid"], .MuiDataGrid-root, table').count();
    console.log(`테이블 요소 개수: ${tableElements}`);
    
    // Export 버튼들 확인
    const exportButtons = await page.locator('button').filter({ hasText: /export|내보내기|Export/i });
    const exportButtonCount = await exportButtons.count();
    console.log(`Export 관련 버튼 개수: ${exportButtonCount}`);
    
    if (exportButtonCount > 0) {
      for (let i = 0; i < exportButtonCount; i++) {
        const buttonText = await exportButtons.nth(i).textContent();
        console.log(`Export 버튼 ${i + 1}: "${buttonText}"`);
      }
    }
    
    // GridToolbarExport 버튼 확인
    const gridExportButtons = await page.locator('[data-testid="GridToolbarExport"]').count();
    console.log(`GridToolbarExport 버튼 개수: ${gridExportButtons}`);
    
    // 고급 내보내기 버튼 확인
    const advancedExportButtons = await page.locator('button:has-text("고급 내보내기")').count();
    console.log(`고급 내보내기 버튼 개수: ${advancedExportButtons}`);
    
    // 데이터 행 개수 확인
    const dataRows = await page.locator('[role="row"]').count();
    console.log(`데이터 행 개수: ${dataRows}`);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-debug-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ Debug 정보 수집 완료 - 스크린샷 저장됨');
    
    // 5초 대기 (수동으로 페이지 확인 가능)
    console.log('ℹ️ 5초 대기 중... (수동 확인 가능)');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('❌ Debug 테스트 중 오류:', error);
    
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-debug-error-${Date.now()}.png`,
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();