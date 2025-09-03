// 페이지 상태 디버깅 스크립트
const { chromium } = require('playwright');

async function debugPageState() {
    const browser = await chromium.launch({ headless: false, slowMo: 2000 });
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();

    try {
        console.log('🔍 페이지 상태 디버깅 시작');

        // 로그인
        await page.goto('/');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 프로젝트 페이지로 이동
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        // 첫 번째 프로젝트 선택
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');

        // 테스트케이스 탭으로 이동
        await page.locator('text=테스트케이스').first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // 현재 URL 확인
        console.log('📍 현재 URL:', page.url());

        // 페이지 제목 확인
        const title = await page.title();
        console.log('📄 페이지 제목:', title);

        // 모든 visible elements 확인
        const visibleElements = await page.$$eval('*', elements => {
            return elements
                .filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden' && 
                           el.offsetWidth > 0 && el.offsetHeight > 0 && 
                           el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE';
                })
                .map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    textContent: el.textContent?.trim().substring(0, 50) || '',
                    id: el.id
                }))
                .slice(0, 20); // 처음 20개만
        });

        console.log('👁️ 보이는 주요 요소들:');
        visibleElements.forEach((el, i) => {
            console.log(`  ${i+1}. <${el.tagName}> class="${el.className}" id="${el.id}" text="${el.textContent}"`);
        });

        // 스프레드시트 관련 클래스 찾기
        const spreadsheetSelectors = [
            '.react-spreadsheet',
            '[class*="spreadsheet"]', 
            '[class*="Spreadsheet"]',
            'table',
            '.MuiTable-root',
            '[data-testid*="spreadsheet"]'
        ];

        for (const selector of spreadsheetSelectors) {
            const count = await page.locator(selector).count();
            console.log(`🔍 "${selector}" 요소 개수:`, count);
            
            if (count > 0) {
                const element = page.locator(selector).first();
                const isVisible = await element.isVisible();
                console.log(`   → 첫 번째 요소 visible:`, isVisible);
            }
        }

        // 에러 메시지 찾기
        const errorElements = await page.locator('[class*="error"], .MuiAlert-standardError, [role="alert"]').count();
        console.log('❌ 에러 메시지 개수:', errorElements);

        if (errorElements > 0) {
            const errorText = await page.locator('[class*="error"], .MuiAlert-standardError, [role="alert"]').first().textContent();
            console.log('❌ 에러 내용:', errorText);
        }

        // 스크린샷 저장
        await page.screenshot({ 
            path: 'e2e-tests/debug-screenshot.png',
            fullPage: true 
        });
        console.log('📸 디버그 스크린샷 저장: e2e-tests/debug-screenshot.png');

        console.log('\n⏰ 수동 확인을 위해 10초 대기...');
        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ 디버깅 실패:', error.message);
    } finally {
        await browser.close();
    }
}

debugPageState().catch(console.error);