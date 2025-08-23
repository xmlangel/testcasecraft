// ICT-280: Test to find toolbar and export buttons
const { chromium } = require('playwright');

(async () => {
  console.log('=== ICT-280: Toolbar Export Test ===');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });

  const page = await context.newPage();
  
  try {
    // Standard navigation to test results
    await page.goto('/');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    await page.locator('text=프로젝트').first().click();
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("프로젝트 열기")').first().click();
    await page.waitForLoadState('networkidle');

    await page.locator('text=테스트결과').first().click();
    await page.waitForLoadState('networkidle');

    await page.locator('button:has-text("상세 테이블")').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('✅ 상세 테이블 페이지 도달 완료');

    // Look for all possible toolbar-related elements
    console.log('✅ 툴바 관련 요소 검색');
    
    const toolbarSelectors = [
      '.MuiDataGrid-toolbarContainer',
      '.MuiDataGrid-toolbar',
      '[data-testid="toolbar"]',
      '.MuiToolbar-root',
      '.GridToolbar',
      '.toolbar'
    ];
    
    for (const selector of toolbarSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`툴바 발견 (${selector}): ${count}개`);
      }
    }

    // Look for all possible export-related elements
    console.log('✅ Export 관련 요소 검색');
    
    const exportSelectors = [
      '[data-testid="GridToolbarExport"]',
      '.GridToolbarExport', 
      'button[title*="Export"]',
      'button[aria-label*="Export"]',
      'button[aria-label*="export"]',
      'button[title*="export"]',
      '[role="button"]:has-text("Export")',
      '[role="button"]:has-text("export")',
      'svg[data-testid="FileDownloadIcon"]',
      '.MuiSvgIcon-root:has([data-testid="FileDownloadIcon"])'
    ];
    
    for (const selector of exportSelectors) {
      try {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`Export 요소 발견 (${selector}): ${count}개`);
          
          // 해당 요소의 상위 버튼도 확인
          const parentButton = page.locator(selector).locator('xpath=ancestor-or-self::button[1]');
          const parentCount = await parentButton.count();
          if (parentCount > 0) {
            console.log(`  - 상위 버튼 발견: ${parentCount}개`);
          }
        }
      } catch (e) {
        // 복잡한 선택자는 무시
      }
    }

    // Look for any buttons with download-related icons
    console.log('✅ 다운로드 아이콘이 있는 버튼 검색');
    
    const svgButtons = await page.locator('button svg, button [data-testid*="Download"], button [data-testid*="Export"]').count();
    console.log(`SVG 또는 아이콘이 있는 버튼: ${svgButtons}개`);

    // Try to find buttons near the data grid
    console.log('✅ 데이터 그리드 주변 버튼 검색');
    
    const gridContainer = page.locator('.MuiDataGrid-root').first();
    const nearbyButtons = gridContainer.locator('..').locator('button');
    const nearbyCount = await nearbyButtons.count();
    console.log(`데이터 그리드 주변 버튼: ${nearbyCount}개`);
    
    for (let i = 0; i < Math.min(nearbyCount, 10); i++) {
      try {
        const buttonText = await nearbyButtons.nth(i).textContent();
        const ariaLabel = await nearbyButtons.nth(i).getAttribute('aria-label');
        const title = await nearbyButtons.nth(i).getAttribute('title');
        
        console.log(`  Nearby Button ${i + 1}:`);
        if (buttonText && buttonText.trim()) console.log(`    Text: "${buttonText.trim()}"`);
        if (ariaLabel) console.log(`    Aria-label: "${ariaLabel}"`);
        if (title) console.log(`    Title: "${title}"`);
      } catch (e) {
        // Skip
      }
    }

    // Check if there are any menu buttons that might contain export
    console.log('✅ 메뉴 버튼 검색');
    
    const menuButtons = await page.locator('button[aria-haspopup], button[aria-expanded]').count();
    console.log(`메뉴 버튼: ${menuButtons}개`);

    // Take a screenshot of the current state
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-toolbar-search-${Date.now()}.png`,
      fullPage: true 
    });

    // Try clicking on any button that might be a menu or options button
    console.log('✅ 옵션/메뉴 버튼 클릭 시도');
    
    const possibleMenuButtons = [
      'button[aria-label*="menu"]',
      'button[aria-label*="Menu"]', 
      'button[aria-label*="options"]',
      'button[aria-label*="Options"]',
      'button[title*="menu"]',
      'button[title*="options"]'
    ];
    
    for (const selector of possibleMenuButtons) {
      try {
        const menuButton = page.locator(selector).first();
        const count = await menuButton.count();
        if (count > 0) {
          console.log(`메뉴 버튼 클릭 시도: ${selector}`);
          await menuButton.click();
          await page.waitForTimeout(1000);
          
          // Check if export option appeared
          const exportOptions = await page.locator('text=Export, text=export, text=내보내기, text=CSV, text=Excel').count();
          if (exportOptions > 0) {
            console.log(`✅ Export 옵션 발견! ${exportOptions}개`);
          }
          
          // Close menu by clicking elsewhere
          await page.click('body');
          await page.waitForTimeout(500);
        }
      } catch (e) {
        // Continue
      }
    }

    console.log('✅ 툴바 검색 완료');

  } catch (error) {
    console.error('❌ 툴바 검색 오류:', error);
    
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-toolbar-error-${Date.now()}.png`,
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();