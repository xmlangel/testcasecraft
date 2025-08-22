// Debug script to find all buttons on the test results detail page
const { chromium } = require('playwright');

async function debugButtons() {
    console.log('🔍 버튼 디버깅 시작');

    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1000
    });

    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });

    const page = await context.newPage();

    try {
        // Navigate to test results detail page
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

        await page.locator('button:has-text("상세 테이블")').click();
        await page.waitForLoadState('networkidle');

        // List all buttons on the page
        console.log('\n📋 페이지의 모든 버튼:');
        const buttons = await page.locator('button').all();
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i];
            try {
                const text = await button.textContent();
                const isVisible = await button.isVisible();
                console.log(`${i + 1}. "${text}" (visible: ${isVisible})`);
            } catch (e) {
                console.log(`${i + 1}. [텍스트 읽기 실패]`);
            }
        }

        // Check for specific text patterns
        console.log('\n🔍 "순서" 텍스트 포함 요소:');
        const orderElements = await page.locator('text=순서').all();
        for (let i = 0; i < orderElements.length; i++) {
            const element = orderElements[i];
            try {
                const text = await element.textContent();
                const isVisible = await element.isVisible();
                console.log(`- "${text}" (visible: ${isVisible})`);
            } catch (e) {
                console.log(`- [텍스트 읽기 실패]`);
            }
        }

        // Take a screenshot
        await page.screenshot({ path: 'debug-buttons.png', fullPage: true });
        console.log('\n📸 스크린샷 저장: debug-buttons.png');

        await page.waitForTimeout(3000);

    } catch (error) {
        console.error('❌ 디버깅 실패:', error.message);
    } finally {
        await browser.close();
    }
}

debugButtons();