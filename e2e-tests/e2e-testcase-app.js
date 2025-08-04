// 테스트 케이스 관리 애플리케이션 E2E 테스트
const { chromium } = require('playwright');

async function testTestCaseApp() {
    console.log('🧪 테스트 케이스 관리 앱 E2E 테스트 시작...');
    
    const browser = await chromium.launch({ 
        headless: true,
        timeout: 15000 
    });
    
    try {
        const context = await browser.newContext();
        const page = await context.newPage();
        
        // 1. 애플리케이션 접속
        console.log('📋 테스트 1: 애플리케이션 접속');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        const title = await page.title();
        console.log(`✅ 페이지 제목: ${title}`);
        
        // 2. 로그인 페이지 확인
        console.log('📋 테스트 2: 로그인 페이지 확인');
        const loginElements = await page.locator('input[type="text"], input[type="password"]').count();
        console.log(`✅ 로그인 폼 요소 수: ${loginElements}개`);
        
        // 3. 메인 컨텐츠 확인
        console.log('📋 테스트 3: 메인 컨텐츠 확인');
        const mainContent = await page.locator('main, .main-content, #root').count();
        console.log(`✅ 메인 컨텐츠 영역: ${mainContent}개`);
        
        // 4. 스크린샷 캡처 (전체 페이지)
        console.log('📋 테스트 4: 전체 페이지 스크린샷');
        await page.screenshot({ 
            path: 'testcase-app-fullpage.png',
            fullPage: true 
        });
        console.log('✅ 전체 페이지 스크린샷 저장: testcase-app-fullpage.png');
        
        // 5. 모바일 뷰포트 테스트
        console.log('📋 테스트 5: 모바일 반응형 테스트');
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE 크기
        await page.screenshot({ path: 'testcase-app-mobile.png' });
        console.log('✅ 모바일 뷰 스크린샷 저장: testcase-app-mobile.png');
        
        // 6. 성능 메트릭 수집
        console.log('📋 테스트 6: 성능 메트릭 수집');
        const performanceTiming = await page.evaluate(() => JSON.stringify(window.performance.timing));
        const timing = JSON.parse(performanceTiming);
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`✅ 전체 로딩 시간: ${loadTime}ms`);
        
        // 7. React 컴포넌트 확인
        console.log('📋 테스트 7: React 컴포넌트 확인');
        const reactRoot = await page.locator('#root').count();
        const materialUIElements = await page.locator('[class*="Mui"], [class*="MuiButton"], [class*="MuiTextField"]').count();
        console.log(`✅ React 루트: ${reactRoot}개, Material-UI 요소: ${materialUIElements}개`);
        
        await browser.close();
        console.log('🎉 테스트 케이스 관리 앱 E2E 테스트 완료!');
        
        return {
            success: true,
            title,
            loginElements,
            mainContent,
            reactRoot,
            materialUIElements,
            loadTime,
            screenshots: [
                'testcase-app-fullpage.png',
                'testcase-app-mobile.png'
            ]
        };
        
    } catch (error) {
        await browser.close();
        console.error('❌ E2E 테스트 실패:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Node.js에서 직접 실행할 때
if (require.main === module) {
    testTestCaseApp().then(result => {
        console.log('\n📊 E2E 테스트 결과:', JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = { testTestCaseApp };