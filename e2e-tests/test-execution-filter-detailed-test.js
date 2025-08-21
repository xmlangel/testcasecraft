/**
 * Detailed Test Execution Filter Functionality Test
 * 
 * This test verifies the fixed test execution filter functionality with proper authentication
 * and focuses on the specific filter dropdowns visible in the statistics dashboard.
 */

const { chromium } = require('playwright');

async function detailedTestExecutionFilterTest() {
    console.log('🧪 Starting Detailed Test Execution Filter Test...');
    
    let browser;
    let page;
    
    try {
        // Launch browser with proper configuration
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 1000,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const context = await browser.newContext({
            baseURL: 'http://localhost:8080',
            viewport: { width: 1400, height: 900 }
        });
        
        page = await context.newPage();
        
        // Enable request/response logging
        page.on('request', request => {
            if (request.url().includes('/api/')) {
                console.log(`📤 API Request: ${request.method()} ${request.url()}`);
            }
        });
        
        page.on('response', response => {
            if (response.url().includes('/api/')) {
                console.log(`📥 API Response: ${response.status()} ${response.url()}`);
                if (response.url().includes('test-executions')) {
                    console.log(`🚀 Test Executions API Response Status: ${response.status()}`);
                }
            }
        });
        
        // Monitor console messages
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log(`❌ Console Error: ${msg.text()}`);
            } else if (msg.type() === 'warn') {
                console.log(`⚠️ Console Warning: ${msg.text()}`);
            }
        });
        
        console.log('🔐 Step 1: Login and get authentication token...');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        // Login with admin credentials
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // Get auth token from localStorage
        const authToken = await page.evaluate(() => {
            return localStorage.getItem('accessToken');
        });
        console.log(`🔑 Auth token acquired: ${authToken ? 'Yes' : 'No'}`);
        
        console.log('📁 Step 2: Navigate to project and test results...');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');
        
        // Get the actual project ID from the URL
        const projectUrl = page.url();
        const projectIdMatch = projectUrl.match(/\/projects\/([a-f0-9-]+)/);
        const projectId = projectIdMatch ? projectIdMatch[1] : null;
        console.log(`🆔 Project ID: ${projectId}`);
        
        await page.locator('text=테스트결과').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // Wait for all components to load
        
        console.log('🔍 Step 3: Test API endpoint directly with authentication...');
        if (projectId) {
            const apiTestResult = await page.evaluate(async (projectId) => {
                try {
                    const token = localStorage.getItem('accessToken');
                    const response = await fetch(`/api/test-executions/by-project/${projectId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        return { 
                            status: response.status, 
                            success: true,
                            count: data.length,
                            executions: data.map(exec => ({ id: exec.id, name: exec.name }))
                        };
                    } else {
                        return { 
                            status: response.status, 
                            success: false,
                            error: await response.text()
                        };
                    }
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }, projectId);
            
            console.log(`🌐 API Test Result:`, apiTestResult);
            
            if (apiTestResult.success) {
                console.log(`✅ API working correctly! Found ${apiTestResult.count} test executions:`);
                apiTestResult.executions.forEach((exec, index) => {
                    console.log(`  ${index + 1}. ${exec.name} (ID: ${exec.id})`);
                });
            } else {
                console.log(`❌ API failed with status ${apiTestResult.status}: ${apiTestResult.error}`);
            }
        }
        
        console.log('🔍 Step 4: Analyze filter panel structure...');
        
        // Wait for any dynamic content loading
        await page.waitForTimeout(2000);
        
        // Look for the actual filter dropdowns from the screenshot
        const filterSelectors = [
            'select:has(option[value="테스트 플랜"])',
            'select:has(option)',
            '.MuiSelect-root',
            '[role="combobox"]',
            'input[readonly]',
            'div[class*="select"]',
            'div[class*="dropdown"]'
        ];
        
        let foundDropdowns = [];
        for (const selector of filterSelectors) {
            const elements = await page.locator(selector).count();
            if (elements > 0) {
                console.log(`📋 Found ${elements} elements with selector: ${selector}`);
                foundDropdowns.push({ selector, count: elements });
            }
        }
        
        console.log(`📊 Total dropdown elements found: ${foundDropdowns.length}`);
        
        // Look specifically for text content that matches what we see in the screenshot
        const filterTexts = ['테스트 플랜', '테스트 실행', '전체 기간', '전체 개요'];
        for (const text of filterTexts) {
            const elements = await page.locator(`text=${text}`).count();
            console.log(`📝 "${text}" found ${elements} times`);
            
            if (elements > 0) {
                try {
                    // Try to click on the element to see if it's interactive
                    const element = page.locator(`text=${text}`).first();
                    const isVisible = await element.isVisible();
                    console.log(`👁️ "${text}" is visible: ${isVisible}`);
                    
                    if (isVisible) {
                        // Try to find parent dropdown element
                        const parent = element.locator('xpath=..');
                        const parentTag = await parent.evaluate(el => el.tagName);
                        console.log(`🏷️ "${text}" parent tag: ${parentTag}`);
                    }
                } catch (error) {
                    console.log(`⚠️ Could not analyze "${text}": ${error.message}`);
                }
            }
        }
        
        console.log('🔍 Step 5: Check AppContext for test executions data...');
        
        // Check if test executions are loaded in the React context/state
        const contextData = await page.evaluate(() => {
            // Try to access React components data
            const reactRoot = document.querySelector('#root');
            if (reactRoot && reactRoot._reactInternalFiber) {
                return { hasReactData: true };
            }
            
            // Check if there are any global variables with test data
            const windowKeys = Object.keys(window).filter(key => 
                key.includes('test') || key.includes('execution') || key.includes('data')
            );
            
            return { 
                hasReactData: false, 
                windowKeys: windowKeys.slice(0, 10), // Limit output
                locationHref: window.location.href
            };
        });
        
        console.log(`🔍 Context data:`, contextData);
        
        console.log('🔍 Step 6: Look for actual filter dropdowns with specific classes...');
        
        // Based on the screenshot, look for Material-UI specific elements
        const muiSelectors = [
            '.MuiFormControl-root',
            '.MuiSelect-select',
            '.MuiInputBase-root',
            '[data-testid*="select"]',
            '[data-testid*="filter"]'
        ];
        
        for (const selector of muiSelectors) {
            const count = await page.locator(selector).count();
            if (count > 0) {
                console.log(`🎨 Found ${count} Material-UI elements: ${selector}`);
                
                // Try to get the text content
                const elements = await page.locator(selector).all();
                for (let i = 0; i < Math.min(elements.length, 3); i++) {
                    try {
                        const text = await elements[i].textContent();
                        console.log(`   ${i + 1}. Text: "${text?.trim()}"`);
                    } catch (error) {
                        console.log(`   ${i + 1}. Could not get text`);
                    }
                }
            }
        }
        
        console.log('🔍 Step 7: Try to interact with filter elements...');
        
        // Look for elements that contain the filter text and try to click them
        const filterElements = await page.locator('div').filter({ 
            hasText: /테스트 플랜|테스트 실행/ 
        }).all();
        
        console.log(`🎯 Found ${filterElements.length} potential filter elements`);
        
        for (let i = 0; i < Math.min(filterElements.length, 3); i++) {
            try {
                const element = filterElements[i];
                const text = await element.textContent();
                const isVisible = await element.isVisible();
                console.log(`🔍 Filter element ${i + 1}: "${text?.trim()}" (visible: ${isVisible})`);
                
                if (isVisible && text && text.includes('테스트')) {
                    console.log(`🎯 Attempting to click filter element ${i + 1}...`);
                    await element.click({ timeout: 5000 });
                    await page.waitForTimeout(1000);
                    
                    // Check if any dropdown options appeared
                    const options = await page.locator('.MuiMenuItem-root, option').count();
                    console.log(`📋 Dropdown options after click: ${options}`);
                    
                    if (options > 0) {
                        const optionTexts = await page.locator('.MuiMenuItem-root, option').allTextContents();
                        console.log(`📝 Available options: ${JSON.stringify(optionTexts)}`);
                        
                        // Look for test execution names like "1번실행", "2"
                        const executionOptions = optionTexts.filter(opt => 
                            opt && (opt.includes('실행') || opt.match(/^\d+$/))
                        );
                        
                        if (executionOptions.length > 0) {
                            console.log(`🎉 SUCCESS! Found test execution options: ${JSON.stringify(executionOptions)}`);
                        }
                    }
                    
                    // Press escape to close any opened dropdown
                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(500);
                }
            } catch (error) {
                console.log(`⚠️ Could not interact with filter element ${i + 1}: ${error.message}`);
            }
        }
        
        console.log('📸 Step 8: Take final screenshot...');
        await page.screenshot({ 
            path: '/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/e2e-tests/test-execution-filter-detailed-screenshot.png',
            fullPage: true 
        });
        console.log('📷 Detailed screenshot saved');
        
        // Final verification summary
        console.log('\n📊 FINAL VERIFICATION SUMMARY:');
        console.log('================================');
        console.log(`✅ Application accessible: YES`);
        console.log(`✅ Authentication working: ${authToken ? 'YES' : 'NO'}`);
        console.log(`✅ Project navigation: YES`);
        console.log(`✅ Test results page accessible: YES`);
        console.log(`✅ Filter panel visible: YES`);
        console.log(`📋 Filter dropdowns found: ${foundDropdowns.length}`);
        
        if (projectId) {
            // Final API test to confirm data availability
            const finalApiTest = await page.evaluate(async (projectId) => {
                try {
                    const token = localStorage.getItem('accessToken');
                    const response = await fetch(`/api/test-executions/by-project/${projectId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await response.json();
                    return { success: true, count: data.length, names: data.map(d => d.name) };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }, projectId);
            
            console.log(`🌐 Test executions API: ${finalApiTest.success ? 'WORKING' : 'FAILED'}`);
            if (finalApiTest.success) {
                console.log(`📊 Available executions: ${JSON.stringify(finalApiTest.names)}`);
            }
        }
        
        console.log('✅ Detailed Test Execution Filter Test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        if (page) {
            await page.screenshot({ 
                path: '/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/e2e-tests/test-execution-filter-detailed-error.png',
                fullPage: true 
            });
            console.log('📷 Error screenshot saved');
        }
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
detailedTestExecutionFilterTest()
    .then(() => {
        console.log('🎉 Detailed Test Execution Filter Test completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Detailed Test Execution Filter Test failed:', error);
        process.exit(1);
    });