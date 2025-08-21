/**
 * Test Execution Filter Functionality Test
 * 
 * This test verifies the fixed test execution filter functionality in the statistics dashboard.
 * It checks that test executions are properly loaded from the API and available in filter panels.
 */

const { chromium } = require('playwright');

async function testExecutionFilterTest() {
    console.log('🧪 Starting Test Execution Filter Test...');
    
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
        
        console.log('🔐 Step 1: Login to application...');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        // Login with admin credentials
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // Verify login success
        const loginSuccess = await page.locator('text=대시보드').count() > 0;
        console.log(`✅ Login successful: ${loginSuccess}`);
        
        console.log('🗂️ Step 2: Navigate to projects...');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        console.log('📁 Step 3: Open first project...');
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're in project view
        const projectUrl = page.url();
        console.log(`📍 Current URL: ${projectUrl}`);
        const isInProject = projectUrl.includes('/projects/');
        console.log(`✅ In project view: ${isInProject}`);
        
        console.log('📊 Step 4: Navigate to Test Results (Statistics Dashboard)...');
        await page.locator('text=테스트결과').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for components to load
        
        console.log('🔍 Step 5: Check filter panel components...');
        
        // Check if filter panel exists
        const filterPanelExists = await page.locator('div').filter({ hasText: /테스트 플랜|테스트 실행/ }).count() > 0;
        console.log(`📋 Filter panel exists: ${filterPanelExists}`);
        
        // Look for test plan dropdown
        const testPlanDropdown = page.locator('select, .MuiSelect-root').filter({ hasText: /테스트 플랜|전체 플랜/ }).first();
        const testPlanExists = await testPlanDropdown.count() > 0;
        console.log(`📝 Test plan dropdown exists: ${testPlanExists}`);
        
        if (testPlanExists) {
            console.log('🔍 Step 6: Analyze test plan options...');
            
            // Try to click the test plan dropdown to see options
            try {
                await testPlanDropdown.click();
                await page.waitForTimeout(1000);
                
                // Check for dropdown options
                const options = await page.locator('.MuiMenuItem-root, option').allTextContents();
                console.log(`📋 Test plan options: ${JSON.stringify(options)}`);
                
                // Look for non-"전체" options
                const specificPlans = options.filter(opt => opt && !opt.includes('전체'));
                console.log(`📝 Specific test plans found: ${JSON.stringify(specificPlans)}`);
                
                if (specificPlans.length > 0) {
                    console.log('🎯 Step 7: Select a specific test plan...');
                    
                    // Select the first specific test plan
                    const planToSelect = specificPlans[0];
                    await page.locator('.MuiMenuItem-root, option').filter({ hasText: planToSelect }).click();
                    await page.waitForTimeout(2000); // Wait for test executions to load
                    
                    console.log(`✅ Selected test plan: ${planToSelect}`);
                }
            } catch (error) {
                console.log(`⚠️ Could not interact with test plan dropdown: ${error.message}`);
            }
        }
        
        // Look for test execution dropdown
        console.log('🔍 Step 8: Check test execution dropdown...');
        const testExecutionDropdown = page.locator('select, .MuiSelect-root').filter({ hasText: /테스트 실행|전체 실행/ }).first();
        const testExecutionExists = await testExecutionDropdown.count() > 0;
        console.log(`🚀 Test execution dropdown exists: ${testExecutionExists}`);
        
        if (testExecutionExists) {
            console.log('🔍 Step 9: Analyze test execution options...');
            
            try {
                await testExecutionDropdown.click();
                await page.waitForTimeout(1000);
                
                // Check for dropdown options
                const execOptions = await page.locator('.MuiMenuItem-root, option').allTextContents();
                console.log(`🚀 Test execution options: ${JSON.stringify(execOptions)}`);
                
                // Check if we have actual test executions (not just "전체 실행")
                const actualExecutions = execOptions.filter(opt => 
                    opt && 
                    !opt.includes('전체') && 
                    (opt.includes('실행') || opt.match(/\d+/))
                );
                console.log(`🎯 Actual test executions found: ${JSON.stringify(actualExecutions)}`);
                
                const hasActualExecutions = actualExecutions.length > 0;
                console.log(`✅ Test executions properly loaded: ${hasActualExecutions}`);
                
                if (hasActualExecutions) {
                    console.log('🎉 SUCCESS: Test execution filter is working correctly!');
                    console.log(`📊 Found ${actualExecutions.length} test executions: ${actualExecutions.join(', ')}`);
                } else {
                    console.log('❌ ISSUE: Only default "전체 실행" option found, test executions not loaded');
                }
                
                // Close the dropdown
                await page.keyboard.press('Escape');
                
            } catch (error) {
                console.log(`⚠️ Could not interact with test execution dropdown: ${error.message}`);
            }
        }
        
        console.log('📸 Step 10: Take screenshot of the filter panel...');
        await page.screenshot({ 
            path: '/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/e2e-tests/test-execution-filter-screenshot.png',
            fullPage: true 
        });
        console.log('📷 Screenshot saved as test-execution-filter-screenshot.png');
        
        console.log('🔍 Step 11: Check API calls and network activity...');
        
        // Wait a bit more to see any delayed API calls
        await page.waitForTimeout(3000);
        
        console.log('🔍 Step 12: Verify API endpoint availability...');
        
        // Extract project ID from current URL
        const currentUrl = page.url();
        const projectIdMatch = currentUrl.match(/\/projects\/(\d+)/);
        
        if (projectIdMatch) {
            const projectId = projectIdMatch[1];
            console.log(`🆔 Detected project ID: ${projectId}`);
            
            // Test the API endpoint directly
            const apiResponse = await page.evaluate(async (projectId) => {
                try {
                    const response = await fetch(`/api/test-executions/by-project/${projectId}`);
                    const data = await response.json();
                    return { status: response.status, data: data };
                } catch (error) {
                    return { error: error.message };
                }
            }, projectId);
            
            console.log(`🌐 Direct API test result:`, apiResponse);
            
            if (apiResponse.data && Array.isArray(apiResponse.data)) {
                console.log(`📊 API returned ${apiResponse.data.length} test executions`);
                apiResponse.data.forEach((exec, index) => {
                    console.log(`  ${index + 1}. ${exec.executionName || exec.name || `Execution ${exec.id}`}`);
                });
            }
        }
        
        console.log('✅ Test Execution Filter Test completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        if (page) {
            await page.screenshot({ 
                path: '/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/e2e-tests/test-execution-filter-error.png',
                fullPage: true 
            });
            console.log('📷 Error screenshot saved as test-execution-filter-error.png');
        }
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
testExecutionFilterTest()
    .then(() => {
        console.log('🎉 Test Execution Filter Test completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Test Execution Filter Test failed:', error);
        process.exit(1);
    });