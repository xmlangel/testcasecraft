const { chromium } = require('playwright');

async function testLayoutImprovements() {
  console.log('🚀 테스트 실행 화면 레이아웃 개선 검증 시작');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the application
    console.log('📱 애플리케이션 접속 중...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);

    // Login
    console.log('🔐 로그인 진행...');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Navigate to test executions
    console.log('🎯 테스트 실행 페이지로 이동...');
    try {
      // Try clicking executions menu item
      await page.click('text=실행');
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('메뉴에서 실행을 찾지 못했습니다. 직접 URL로 이동...');
      await page.goto('http://localhost:3000/executions');
      await page.waitForTimeout(2000);
    }

    // Test different viewport sizes
    const viewports = [
      { name: 'Desktop HD', width: 1920, height: 1080 },
      { name: 'Desktop FHD', width: 1920, height: 1200 },
      { name: 'Desktop UHD', width: 2560, height: 1440 },
      { name: 'Desktop 4K', width: 3840, height: 2160 },
      { name: 'Tablet', width: 1024, height: 768 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      console.log(`📏 ${viewport.name} (${viewport.width}x${viewport.height}) 테스트 중...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      // Measure layout utilization
      const mainContainer = await page.locator('div[role="main"], main, .MuiContainer-root').first();
      if (await mainContainer.count() > 0) {
        const containerBox = await mainContainer.boundingBox();
        const viewportWidth = viewport.width;
        
        if (containerBox) {
          const utilization = (containerBox.width / viewportWidth) * 100;
          console.log(`  📊 가로 공간 활용도: ${utilization.toFixed(1)}%`);
          
          // Check if utilization meets our target (>70% for desktop screens)
          if (viewport.width >= 1024) {
            if (utilization >= 70) {
              console.log(`  ✅ 목표 달성 (70% 이상)`);
            } else {
              console.log(`  ⚠️  개선 필요 (70% 미만)`);
            }
          }
        }
      }

      // Take screenshot for visual verification
      const screenshotName = `layout-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({ 
        path: screenshotName,
        fullPage: true
      });
      console.log(`  📸 스크린샷 저장: ${screenshotName}`);
    }

    // Test responsive grid behavior
    console.log('🔧 반응형 그리드 동작 테스트...');
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Check if grid columns adapt properly
    const gridItems = await page.locator('.MuiGrid-item').count();
    console.log(`  📋 그리드 아이템 수: ${gridItems}`);

    // Test tree view table responsiveness
    console.log('📋 트리뷰 테이블 반응성 테스트...');
    const treeViewContainer = await page.locator('[role="tree"]').first();
    if (await treeViewContainer.count() > 0) {
      const treeBox = await treeViewContainer.boundingBox();
      if (treeBox) {
        console.log(`  📏 트리뷰 너비: ${treeBox.width}px`);
        console.log(`  📊 화면 대비 비율: ${(treeBox.width / 1920 * 100).toFixed(1)}%`);
      }
    }

    console.log('✅ 레이아웃 개선 검증 완료!');

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    console.log('🔍 현재 페이지 URL:', await page.url());
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'layout-test-error.png',
      fullPage: true
    });
    console.log('📸 오류 스크린샷 저장: layout-test-error.png');
  } finally {
    await browser.close();
  }
}

// Run the test
testLayoutImprovements().catch(console.error);