// e2e-tests/ict-285-simple-test.js
// ICT-285: 간단한 사용자 정보 변경 테스트

const { chromium } = require('playwright');

async function simpleUserUpdateTest() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();
    
    try {
        console.log('=== ICT-285: 간단한 사용자 정보 변경 테스트 ===');
        
        // 1. 로그인
        await page.goto('/');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        console.log('✅ 로그인 완료');
        
        // 2. 사용자 관리 페이지로 이동
        await page.locator('text=사용자 관리').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        console.log('✅ 사용자 관리 페이지 접근');
        
        // 3. 첫 번째 사용자의 첫 번째 버튼 클릭 (상세보기)
        await page.locator('table tbody tr').first().locator('button').first().click();
        console.log('✅ 첫 번째 버튼 클릭');
        
        await page.waitForTimeout(3000);
        
        // 4. 다이얼로그 확인
        const dialog = await page.locator('[role="dialog"]').count();
        if (dialog > 0) {
            console.log('✅ 다이얼로그 열림');
            
            // 페이지를 30초간 열어두어 수동으로 확인할 수 있도록
            console.log('🔍 30초간 브라우저 열어둠 - 수동으로 UI 확인 가능');
            await page.waitForTimeout(30000);
        } else {
            console.log('❌ 다이얼로그가 열리지 않음');
        }
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
simpleUserUpdateTest().catch(error => {
    console.error('❌ ICT-285 간단 테스트 실패:', error);
    process.exit(1);
});