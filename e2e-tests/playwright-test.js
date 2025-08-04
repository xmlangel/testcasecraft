// Playwright MCP 테스트 스크립트
const { chromium } = require('playwright');

async function testPlaywrightMCP() {
    console.log('🚀 Playwright MCP 테스트 시작...');
    
    try {
        // 브라우저 실행
        const browser = await chromium.launch({ 
            headless: true,
            timeout: 10000 
        });
        
        const context = await browser.newContext();
        const page = await context.newPage();
        
        console.log('📋 테스트 1: Google 페이지 접속');
        await page.goto('https://www.google.com', { waitUntil: 'networkidle' });
        const googleTitle = await page.title();
        console.log(`✅ Google 페이지 제목: ${googleTitle}`);
        
        console.log('📋 테스트 2: 로컬 프론트엔드 서버 접속');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        const localTitle = await page.title();
        console.log(`✅ 로컬 서버 페이지 제목: ${localTitle}`);
        
        // 스크린샷 캡처
        console.log('📋 테스트 3: 스크린샷 캡처');
        await page.screenshot({ path: 'playwright-test-screenshot.png' });
        console.log('✅ 스크린샷 저장 완료: playwright-test-screenshot.png');
        
        // 성능 측정
        console.log('📋 테스트 4: 성능 측정');
        const startTime = Date.now();
        await page.reload({ waitUntil: 'networkidle' });
        const loadTime = Date.now() - startTime;
        console.log(`✅ 페이지 로딩 시간: ${loadTime}ms`);
        
        await browser.close();
        console.log('🎉 Playwright MCP 테스트 성공적으로 완료!');
        
        return {
            success: true,
            googleTitle,
            localTitle,
            loadTime,
            screenshot: 'playwright-test-screenshot.png'
        };
        
    } catch (error) {
        console.error('❌ Playwright MCP 테스트 실패:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Node.js에서 직접 실행할 때
if (require.main === module) {
    testPlaywrightMCP().then(result => {
        console.log('\n📊 테스트 결과:', JSON.stringify(result, null, 2));
        process.exit(result.success ? 0 : 1);
    });
}

module.exports = { testPlaywrightMCP };