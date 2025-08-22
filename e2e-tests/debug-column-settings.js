// e2e-tests/debug-column-settings.js
// ICT-275: 테스트 결과 페이지 디버깅

const { chromium } = require('playwright');

async function debugColumnSettings() {
    console.log('🔍 ICT-275: 테스트 결과 페이지 구조 디버깅');

    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 2000,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });

    const page = await context.newPage();

    try {
        // 1. 로그인 프로세스
        console.log('📝 1단계: 로그인 프로세스');
        await page.goto('/', { timeout: 20000 });
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 2. 프로젝트 선택
        console.log('📁 2단계: 프로젝트 선택');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');

        // 3. 테스트 결과 탭으로 이동
        console.log('📊 3단계: 테스트 결과 탭 이동');
        await page.locator('text=테스트결과').first().click();
        await page.waitForLoadState('networkidle');

        // 4. 페이지 구조 확인
        console.log('🔍 4단계: 페이지 구조 확인');
        
        // 현재 URL 확인
        const currentUrl = page.url();
        console.log('현재 URL:', currentUrl);
        
        // 모든 버튼 텍스트 확인
        const buttons = await page.locator('button').allTextContents();
        console.log('페이지의 모든 버튼들:', buttons);
        
        // 설정 관련 버튼 찾기
        const settingsButtons = await page.locator('button:has([data-testid="SettingsIcon"])').count();
        console.log('설정 아이콘이 있는 버튼 개수:', settingsButtons);
        
        // 컬럼 관련 텍스트 찾기
        const columnTexts = await page.locator('text*=컬럼').count();
        console.log('컬럼 관련 텍스트 개수:', columnTexts);
        
        // DataGrid 관련 요소 확인
        const dataGrids = await page.locator('.MuiDataGrid-root').count();
        console.log('DataGrid 개수:', dataGrids);
        
        if (dataGrids > 0) {
            // DataGrid 툴바 확인
            const toolbars = await page.locator('.MuiDataGrid-toolbarContainer').count();
            console.log('DataGrid 툴바 개수:', toolbars);
            
            if (toolbars > 0) {
                const toolbarButtons = await page.locator('.MuiDataGrid-toolbarContainer button').allTextContents();
                console.log('툴바 버튼들:', toolbarButtons);
            }
        }
        
        // 스크린샷 저장
        await page.screenshot({ path: 'debug-test-results-page.png', fullPage: true });
        console.log('📸 스크린샷 저장됨: debug-test-results-page.png');
        
        // 5초 대기하여 수동으로 페이지 확인 가능
        console.log('⏳ 페이지 구조 확인을 위해 5초 대기...');
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('❌ 디버깅 중 오류:', error.message);
        
        // 오류 발생 시에도 스크린샷 저장
        try {
            await page.screenshot({ path: 'debug-error-screenshot.png', fullPage: true });
            console.log('📸 오류 스크린샷 저장됨: debug-error-screenshot.png');
        } catch (screenshotError) {
            console.error('스크린샷 저장 실패:', screenshotError.message);
        }
    } finally {
        await browser.close();
    }
}

// 디버깅 실행
if (require.main === module) {
    debugColumnSettings()
        .then(() => {
            console.log('🎉 디버깅 완료');
            process.exit(0);
        })
        .catch((error) => {
            console.error('디버깅 중 치명적 오류:', error);
            process.exit(1);
        });
}

module.exports = { debugColumnSettings };