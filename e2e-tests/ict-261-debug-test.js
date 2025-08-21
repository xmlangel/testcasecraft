/**
 * Debug Test: Examine Test Results page structure for ICT-261
 */

const { chromium } = require('playwright');

async function debugTestResultsPage() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 2000
    });
    
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    
    const page = await context.newPage();
    
    try {
        console.log('🔍 Debug: Examining Test Results page structure');
        
        // Navigate and login
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // Navigate to projects
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        // Open first project
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        console.log('Current URL:', currentUrl);
        
        // Navigate to Test Results
        await page.locator('text=테스트 결과').first().click();
        await page.waitForLoadState('networkidle');
        
        // Wait a bit for any dynamic content
        await page.waitForTimeout(3000);
        
        // Get page content and structure
        console.log('\n📋 Page title:', await page.title());
        console.log('📋 Current URL:', page.url());
        
        // Check for various elements that might be present
        const elementChecks = [
            '.statistics-dashboard',
            '.filter-panel',
            '.test-results',
            '.MuiPaper-root',
            '.MuiContainer-root',
            'form',
            'select',
            'input',
            '.dashboard',
            '.statistics',
            '.chart',
            'button',
            '.mui-select',
            '[role="button"]',
            '[role="combobox"]'
        ];
        
        console.log('\n🔍 Checking for elements on page:');
        for (const selector of elementChecks) {
            try {
                const elements = await page.locator(selector);
                const count = await elements.count();
                if (count > 0) {
                    console.log(`✅ Found ${count} elements: ${selector}`);
                    // Get text content of first few elements
                    for (let i = 0; i < Math.min(count, 3); i++) {
                        try {
                            const text = await elements.nth(i).textContent();
                            if (text && text.trim().length > 0 && text.trim().length < 100) {
                                console.log(`   - Element ${i}: "${text.trim()}"`);
                            }
                        } catch (e) {
                            // Skip if can't get text
                        }
                    }
                }
            } catch (error) {
                // Element not found
            }
        }
        
        // Get all text content to understand page structure
        console.log('\n📄 Page text content:');
        const bodyText = await page.locator('body').textContent();
        if (bodyText) {
            const cleanText = bodyText.replace(/\s+/g, ' ').trim();
            console.log(cleanText.substring(0, 500) + (cleanText.length > 500 ? '...' : ''));
        }
        
        // Check for any project-related dropdowns or selects
        console.log('\n🔍 Checking for project selection elements:');
        const projectElements = await page.locator('select, input, [role="combobox"], .MuiSelect-root').all();
        for (let i = 0; i < projectElements.length; i++) {
            try {
                const element = projectElements[i];
                const isVisible = await element.isVisible();
                if (isVisible) {
                    const tagName = await element.evaluate(el => el.tagName);
                    const className = await element.getAttribute('class') || '';
                    const name = await element.getAttribute('name') || '';
                    const ariaLabel = await element.getAttribute('aria-label') || '';
                    console.log(`${i + 1}. ${tagName} - class: "${className}", name: "${name}", aria-label: "${ariaLabel}"`);
                }
            } catch (error) {
                // Skip problematic elements
            }
        }
        
        // Take screenshot
        await page.screenshot({ 
            path: '/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/e2e-tests/screenshots/debug-test-results-page.png',
            fullPage: true 
        });
        console.log('\n📸 Debug screenshot saved: screenshots/debug-test-results-page.png');
        
    } catch (error) {
        console.error('❌ Debug test failed:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run debug test
if (require.main === module) {
    debugTestResultsPage()
        .then(() => {
            console.log('\n✅ Debug test completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Debug test failed:', error.message);
            process.exit(1);
        });
}

module.exports = { debugTestResultsPage };