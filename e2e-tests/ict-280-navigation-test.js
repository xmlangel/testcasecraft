// ICT-280: Navigation debug test to understand tab structure
const { chromium } = require('playwright');

(async () => {
  console.log('=== ICT-280: Navigation Debug Test ===');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
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

    console.log(`프로젝트 선택 후 URL: ${page.url()}`);

    // 3. 사용 가능한 탭들 확인
    console.log('✅ Step 3: 사용 가능한 탭들 확인');
    
    // 모든 가능한 탭 텍스트들 확인
    const possibleTabs = [
      '대시보드', 'Dashboard',
      '테스트케이스', '테스트 케이스', 'Test Cases', 'TestCases',
      '테스트플랜', '테스트 플랜', 'Test Plans', 'TestPlans', 
      '테스트실행', '테스트 실행', 'Test Execution', 'TestExecution',
      '테스트결과', '테스트 결과', 'Test Results', 'TestResults',
      '자동화 테스트', '자동화테스트', 'Automation', 'Automated Tests'
    ];
    
    console.log('사용 가능한 탭들:');
    for (const tabText of possibleTabs) {
      const tabCount = await page.locator(`text=${tabText}`).count();
      if (tabCount > 0) {
        console.log(`  - "${tabText}": ${tabCount}개`);
      }
    }
    
    // MUI 탭 구조도 확인
    const muiTabs = await page.locator('.MuiTab-root, [role="tab"]').count();
    console.log(`MUI 탭 개수: ${muiTabs}`);
    
    if (muiTabs > 0) {
      console.log('MUI 탭들:');
      const tabs = await page.locator('.MuiTab-root, [role="tab"]');
      for (let i = 0; i < Math.min(muiTabs, 10); i++) {
        try {
          const tabText = await tabs.nth(i).textContent();
          console.log(`  Tab ${i + 1}: "${tabText}"`);
        } catch (e) {
          console.log(`  Tab ${i + 1}: 텍스트 읽기 실패`);
        }
      }
    }
    
    // 4. 테스트 결과 탭 클릭 시도 (여러 방법)
    console.log('✅ Step 4: 테스트 결과 탭 클릭 시도');
    
    let foundTestResultsTab = false;
    const testResultsVariations = ['테스트결과', '테스트 결과', 'Test Results'];
    
    for (const variation of testResultsVariations) {
      try {
        const tabLocator = page.locator(`text=${variation}`).first();
        const count = await tabLocator.count();
        if (count > 0) {
          console.log(`"${variation}" 탭 발견, 클릭 시도...`);
          await tabLocator.click();
          await page.waitForLoadState('networkidle');
          foundTestResultsTab = true;
          console.log(`클릭 후 URL: ${page.url()}`);
          break;
        }
      } catch (error) {
        console.log(`"${variation}" 탭 클릭 실패: ${error.message}`);
      }
    }
    
    if (!foundTestResultsTab) {
      console.log('⚠️ 테스트 결과 탭을 찾을 수 없습니다. 다른 방법 시도...');
      
      // MUI 탭으로 시도
      const allTabs = await page.locator('[role="tab"]');
      const tabCount = await allTabs.count();
      
      for (let i = 0; i < tabCount; i++) {
        try {
          const tabText = await allTabs.nth(i).textContent();
          if (tabText && (tabText.includes('결과') || tabText.includes('Results'))) {
            console.log(`탭 "${tabText}" 클릭 시도...`);
            await allTabs.nth(i).click();
            await page.waitForLoadState('networkidle');
            foundTestResultsTab = true;
            break;
          }
        } catch (e) {
          // 계속 진행
        }
      }
    }
    
    // 5. 최종 상태 확인
    console.log('✅ Step 5: 최종 상태 확인');
    console.log(`최종 URL: ${page.url()}`);
    
    // 테이블 요소 다시 확인
    const tableElements = await page.locator('[role="grid"], .MuiDataGrid-root, table').count();
    console.log(`테이블 요소 개수: ${tableElements}`);
    
    // Export 버튼 다시 확인
    const exportButtons = await page.locator('button').filter({ hasText: /export|내보내기|Export/i }).count();
    console.log(`Export 관련 버튼 개수: ${exportButtons}`);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-navigation-final-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ Navigation 테스트 완료');

  } catch (error) {
    console.error('❌ Navigation 테스트 오류:', error);
    
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-navigation-error-${Date.now()}.png`,
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();