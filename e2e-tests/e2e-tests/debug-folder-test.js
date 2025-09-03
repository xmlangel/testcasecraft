const { chromium } = require('playwright');

async function debugFolderTest() {
    console.log('🔍 디버그: 폴더 기능 상태 확인...\n');

    let browser, context, page;
    try {
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 1000
        });
        
        context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        
        page = await context.newPage();

        // 로그인 및 네비게이션
        console.log('1. 로그인 및 네비게이션...');
        await page.goto('/');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 프로젝트 페이지로 이동
        console.log('2. 프로젝트 선택...');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');

        // 테스트케이스 탭으로 이동
        console.log('3. 테스트케이스 탭으로 이동...');
        await page.locator('text=테스트케이스').first().click();
        await page.waitForLoadState('networkidle');

        // 현재 페이지 상태 스크린샷
        console.log('4. 현재 페이지 상태 캡처...');
        await page.screenshot({ 
            path: 'e2e-tests/screenshots/debug-initial-state.png',
            fullPage: true 
        });

        // 모든 버튼 찾기
        console.log('5. 모든 버튼 조사...');
        const allButtons = await page.locator('button').all();
        console.log(`발견된 버튼 수: ${allButtons.length}`);
        
        for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
            const buttonText = await allButtons[i].textContent();
            console.log(`  버튼 ${i + 1}: "${buttonText}"`);
        }

        // 스프레드시트 관련 요소 찾기
        console.log('\n6. 스프레드시트 관련 요소 조사...');
        const spreadsheetElements = await page.locator('[class*="spreadsheet"], [class*="Spreadsheet"], [data-testid*="spreadsheet"]').all();
        console.log(`스프레드시트 요소 수: ${spreadsheetElements.length}`);

        // 테이블 요소 찾기
        const tables = await page.locator('table').all();
        console.log(`테이블 요소 수: ${tables.length}`);

        // 셀 요소 찾기 (다양한 선택자)
        const cellSelectors = [
            '[class*="cell"]',
            '[data-testid*="cell"]', 
            'td',
            '[class*="react-spreadsheet"]'
        ];

        for (const selector of cellSelectors) {
            const cells = await page.locator(selector).count();
            console.log(`  "${selector}" 선택자로 발견된 요소: ${cells}개`);
        }

        // 스프레드시트 뷰 토글 버튼 확인
        console.log('\n7. 뷰 전환 버튼 확인...');
        const viewButtons = await page.locator('button:has-text("스프레드시트"), button:has-text("트리"), button:has-text("뷰")').all();
        for (let i = 0; i < viewButtons.length; i++) {
            const buttonText = await viewButtons[i].textContent();
            console.log(`  뷰 버튼 ${i + 1}: "${buttonText}"`);
        }

        // 스프레드시트 뷰로 전환 시도
        const spreadsheetToggle = page.locator('button:has-text("스프레드시트 뷰")');
        if (await spreadsheetToggle.count() > 0) {
            console.log('8. 스프레드시트 뷰로 전환 시도...');
            await spreadsheetToggle.click();
            await page.waitForTimeout(3000);
            
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/debug-after-spreadsheet-toggle.png',
                fullPage: true 
            });

            // 전환 후 다시 버튼 조사
            console.log('9. 전환 후 버튼 재조사...');
            const newButtons = await page.locator('button').all();
            console.log(`전환 후 버튼 수: ${newButtons.length}`);
            
            for (let i = 0; i < Math.min(newButtons.length, 25); i++) {
                const buttonText = await newButtons[i].textContent();
                console.log(`  전환 후 버튼 ${i + 1}: "${buttonText}"`);
            }
        } else {
            console.log('8. 스프레드시트 뷰 토글 버튼 없음');
        }

        // 최종 페이지 상태
        console.log('\n10. 최종 상태 캡처...');
        await page.screenshot({ 
            path: 'e2e-tests/screenshots/debug-final-state.png',
            fullPage: true 
        });

        console.log('\n✅ 디버그 완료! 스크린샷을 확인하세요.');

    } catch (error) {
        console.error('\n❌ 디버그 실행 중 오류:', error);
        
        if (page) {
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/debug-error-state.png',
                fullPage: true 
            });
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 디버그 실행
debugFolderTest().catch(console.error);