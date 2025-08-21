// debug-filter-test.js
// ICT-263: 테스트결과 필터링 디버깅을 위한 간단한 E2E 테스트

const { chromium } = require('playwright');

async function debugFilterTest() {
    console.log('🚀 ICT-263 필터링 디버깅 테스트 시작');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    try {
        const context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        
        const page = await context.newPage();

        // 콘솔 로그 캡처
        page.on('console', msg => {
            if (msg.text().includes('ICT-263 Debug')) {
                console.log('🔍 Browser Console:', msg.text());
            }
        });

        // 1. 로그인
        console.log('📋 로그인 중...');
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 2. 프로젝트 선택
        console.log('📋 프로젝트 선택 중...');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');

        // 첫 번째 프로젝트 선택
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');

        // 3. 테스트 결과 탭으로 이동
        console.log('📋 테스트 결과 페이지로 이동 중...');
        await page.locator('text=테스트결과').first().click();
        await page.waitForLoadState('networkidle');

        // 잠시 대기하여 로그 확인
        await page.waitForTimeout(3000);

        // 4. 페이지의 현재 상태 확인
        console.log('📋 페이지 상태 확인 중...');
        console.log('🔍 현재 URL:', page.url());
        
        const pageText = await page.textContent('body');
        console.log('🔍 페이지에 "필터" 텍스트 포함:', pageText.includes('필터'));
        console.log('🔍 페이지에 "테스트 플랜" 텍스트 포함:', pageText.includes('테스트 플랜'));

        // 5. 모든 h6 요소 찾기 (필터 제목)
        const h6Elements = await page.locator('h6').count();
        console.log(`🔍 h6 요소 개수: ${h6Elements}`);
        
        for (let i = 0; i < h6Elements; i++) {
            const text = await page.locator('h6').nth(i).textContent();
            console.log(`🔍 h6[${i}]: "${text}"`);
        }

        // 6. 브라우저를 열어둬서 사용자가 직접 확인할 수 있도록 함
        console.log('⏳ 60초 후에 브라우저가 자동으로 닫힙니다...');
        console.log('📋 브라우저에서 직접 필터링 기능을 테스트해보세요.');
        console.log('📋 개발자 도구 콘솔에서 "ICT-263 Debug" 로그를 확인하세요.');
        
        await page.waitForTimeout(60000);

    } catch (error) {
        console.error('❌ 디버깅 테스트 실패:', error.message);
    } finally {
        await browser.close();
    }
}

// 실행
if (require.main === module) {
    debugFilterTest().catch(console.error);
}

module.exports = { debugFilterTest };