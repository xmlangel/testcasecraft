/**
 * E2E Test: Debug Statistics Dashboard Filter Issue
 * 
 * This test navigates to the statistics dashboard and investigates the 
 * test execution filter problem where users can only see "전체 실행" (all executions)
 * and cannot select specific test executions.
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function debugStatisticsFilter() {
    console.log('🔍 Starting Statistics Dashboard Filter Debug Test...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000,
        args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080',
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Enable console logging to capture any errors
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error' || type === 'warn') {
            console.log(`🚨 Browser ${type.toUpperCase()}: ${text}`);
        } else if (type === 'log' && text.includes('API') || text.includes('fetch') || text.includes('error')) {
            console.log(`📄 Browser LOG: ${text}`);
        }
    });
    
    // Capture network requests to monitor API calls
    const apiCalls = [];
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            apiCalls.push({
                url: request.url(),
                method: request.method(),
                timestamp: new Date().toISOString()
            });
            console.log(`🌐 API Request: ${request.method()} ${request.url()}`);
        }
    });
    
    page.on('response', response => {
        if (response.url().includes('/api/')) {
            const status = response.status();
            const statusSymbol = status >= 200 && status < 300 ? '✅' : '❌';
            console.log(`${statusSymbol} API Response: ${status} ${response.url()}`);
        }
    });
    
    try {
        console.log('📍 Step 1: Navigating to application...');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        // Take initial screenshot
        await page.screenshot({ path: 'debug-login-page.png', fullPage: true });
        console.log('📸 Screenshot taken: debug-login-page.png');
        
        console.log('\n📍 Step 2: Logging in with admin/admin...');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // Verify login success
        const currentUrl = page.url();
        console.log(`📍 Current URL after login: ${currentUrl}`);
        
        if (currentUrl.includes('/dashboard')) {
            console.log('✅ Login successful - redirected to dashboard');
        }
        
        console.log('\n📍 Step 3: Navigating to projects...');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of projects page
        await page.screenshot({ path: 'debug-projects-page.png', fullPage: true });
        console.log('📸 Screenshot taken: debug-projects-page.png');
        
        console.log('\n📍 Step 4: Opening first project...');
        const projectButtons = await page.locator('button:has-text("프로젝트 열기")').count();
        console.log(`📊 Found ${projectButtons} project(s)`);
        
        if (projectButtons > 0) {
            await page.locator('button:has-text("프로젝트 열기")').first().click();
            await page.waitForLoadState('networkidle');
            
            const projectUrl = page.url();
            console.log(`📍 Current URL in project: ${projectUrl}`);
        } else {
            console.log('❌ No projects found! This might be the issue.');
            await page.screenshot({ path: 'debug-no-projects.png', fullPage: true });
            return;
        }
        
        console.log('\n📍 Step 5: Navigating to Test Results (Statistics Dashboard)...');
        
        // Look for test results tab
        const testResultsTab = await page.locator('text=테스트결과').first();
        if (await testResultsTab.isVisible()) {
            await testResultsTab.click();
            await page.waitForLoadState('networkidle');
            console.log('✅ Clicked on Test Results tab');
        } else {
            console.log('❌ Test Results tab not found');
            
            // Try alternative navigation paths
            const availableTabs = await page.locator('[role="tab"]').allTextContents();
            console.log('📋 Available tabs:', availableTabs);
            
            // Look for any tab that might contain statistics
            if (availableTabs.some(tab => tab.includes('통계') || tab.includes('결과'))) {
                const statsTab = page.locator('text*=통계, text*=결과').first();
                await statsTab.click();
                await page.waitForLoadState('networkidle');
            }
        }
        
        // Take screenshot of the test results page
        await page.screenshot({ path: 'debug-test-results-page.png', fullPage: true });
        console.log('📸 Screenshot taken: debug-test-results-page.png');
        
        console.log('\n📍 Step 6: Examining Filter Panel...');
        
        // Wait a bit for any dynamic content to load
        await page.waitForTimeout(2000);
        
        // Look for test plan dropdown
        console.log('\n🔍 Searching for Test Plan dropdown...');
        
        // Multiple selectors to find the test plan dropdown
        const testPlanSelectors = [
            'select[name*="testPlan"]',
            'select[name*="plan"]',
            'select:has(option:text("테스트플랜"))',
            'select:has(option:text("전체"))',
            '.MuiSelect-root',
            '[data-testid*="testplan"]',
            '[data-testid*="plan"]'
        ];
        
        let testPlanDropdown = null;
        for (const selector of testPlanSelectors) {
            try {
                const element = page.locator(selector).first();
                if (await element.isVisible()) {
                    testPlanDropdown = element;
                    console.log(`✅ Found test plan dropdown with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                // Continue to next selector
            }
        }
        
        if (!testPlanDropdown) {
            console.log('❌ Test plan dropdown not found with any selector');
            
            // Log all select elements on the page
            const allSelects = await page.locator('select').count();
            console.log(`📊 Total select elements found: ${allSelects}`);
            
            for (let i = 0; i < allSelects; i++) {
                const selectText = await page.locator('select').nth(i).textContent();
                console.log(`📋 Select ${i}: ${selectText}`);
            }
            
            // Look for Material-UI selects
            const muiSelects = await page.locator('.MuiSelect-root').count();
            console.log(`📊 Material-UI select elements found: ${muiSelects}`);
            
            for (let i = 0; i < muiSelects; i++) {
                const selectText = await page.locator('.MuiSelect-root').nth(i).textContent();
                console.log(`📋 MUI Select ${i}: ${selectText}`);
            }
        } else {
            // Examine test plan dropdown options
            console.log('\n🔍 Examining Test Plan dropdown options...');
            
            try {
                await testPlanDropdown.click();
                await page.waitForTimeout(1000);
                
                // Look for dropdown options
                const options = await page.locator('[role="option"], option').allTextContents();
                console.log('📋 Test Plan options:', options);
                
                if (options.length === 0) {
                    console.log('❌ No test plan options found');
                } else {
                    console.log(`✅ Found ${options.length} test plan option(s)`);
                    
                    // Select a test plan if available (not "전체")
                    const nonAllOptions = options.filter(opt => !opt.includes('전체') && opt.trim().length > 0);
                    if (nonAllOptions.length > 0) {
                        console.log(`🎯 Selecting test plan: ${nonAllOptions[0]}`);
                        await page.locator(`[role="option"]:has-text("${nonAllOptions[0]}"), option:has-text("${nonAllOptions[0]}")`).first().click();
                        await page.waitForLoadState('networkidle');
                    } else {
                        // Click elsewhere to close dropdown
                        await page.click('body');
                    }
                }
            } catch (e) {
                console.log(`⚠️ Error examining test plan dropdown: ${e.message}`);
            }
        }
        
        // Now look for test execution dropdown
        console.log('\n🔍 Searching for Test Execution dropdown...');
        
        const testExecutionSelectors = [
            'select[name*="execution"]',
            'select[name*="testExecution"]',
            'select:has(option:text("전체 실행"))',
            'select:has(option:text("실행"))',
            '.MuiSelect-root',
            '[data-testid*="execution"]'
        ];
        
        let testExecutionDropdown = null;
        for (const selector of testExecutionSelectors) {
            try {
                const elements = await page.locator(selector).count();
                for (let i = 0; i < elements; i++) {
                    const element = page.locator(selector).nth(i);
                    const text = await element.textContent();
                    if (text.includes('실행') || text.includes('execution')) {
                        testExecutionDropdown = element;
                        console.log(`✅ Found test execution dropdown with selector: ${selector} (${i})`);
                        console.log(`📋 Dropdown text: ${text}`);
                        break;
                    }
                }
                if (testExecutionDropdown) break;
            } catch (e) {
                // Continue to next selector
            }
        }
        
        if (!testExecutionDropdown) {
            console.log('❌ Test execution dropdown not found');
        } else {
            // Examine test execution dropdown options
            console.log('\n🔍 Examining Test Execution dropdown options...');
            
            try {
                await testExecutionDropdown.click();
                await page.waitForTimeout(1000);
                
                const executionOptions = await page.locator('[role="option"], option').allTextContents();
                console.log('📋 Test Execution options:', executionOptions);
                
                if (executionOptions.length === 0) {
                    console.log('❌ No test execution options found');
                } else if (executionOptions.length === 1 && executionOptions[0].includes('전체')) {
                    console.log('🚨 ISSUE CONFIRMED: Only "전체 실행" (all executions) available');
                } else {
                    console.log(`✅ Found ${executionOptions.length} test execution option(s)`);
                }
                
                // Click elsewhere to close dropdown
                await page.click('body');
            } catch (e) {
                console.log(`⚠️ Error examining test execution dropdown: ${e.message}`);
            }
        }
        
        // Take final screenshot of the filter panel
        await page.screenshot({ path: 'debug-filter-panel.png', fullPage: true });
        console.log('📸 Final screenshot taken: debug-filter-panel.png');
        
        console.log('\n📍 Step 7: Checking for test data...');
        
        // Check API calls made so far
        console.log('\n📊 API Calls Summary:');
        const uniqueApiCalls = [...new Set(apiCalls.map(call => `${call.method} ${call.url}`))];
        uniqueApiCalls.forEach(call => console.log(`   ${call}`));
        
        // Try to manually call the API endpoints to check for data
        console.log('\n🔍 Manual API Check...');
        
        // Get current project ID from URL
        const currentUrl2 = page.url();
        const projectIdMatch = currentUrl2.match(/projects\/(\d+)/);
        if (projectIdMatch) {
            const projectId = projectIdMatch[1];
            console.log(`📍 Current Project ID: ${projectId}`);
            
            // Check for test plans
            try {
                const testPlansResponse = await page.evaluate(async (projId) => {
                    const response = await fetch(`/api/projects/${projId}/testplans`);
                    return {
                        status: response.status,
                        data: await response.json()
                    };
                }, projectId);
                
                console.log(`📊 Test Plans API Response (${testPlansResponse.status}):`, testPlansResponse.data);
                
                if (testPlansResponse.data && testPlansResponse.data.length > 0) {
                    const testPlanId = testPlansResponse.data[0].id;
                    console.log(`🎯 Checking executions for test plan ID: ${testPlanId}`);
                    
                    // Check for test executions
                    const executionsResponse = await page.evaluate(async (projId, planId) => {
                        const response = await fetch(`/api/projects/${projId}/testplans/${planId}/executions`);
                        return {
                            status: response.status,
                            data: await response.json()
                        };
                    }, projectId, testPlanId);
                    
                    console.log(`📊 Test Executions API Response (${executionsResponse.status}):`, executionsResponse.data);
                    
                    if (!executionsResponse.data || executionsResponse.data.length === 0) {
                        console.log('🚨 ROOT CAUSE IDENTIFIED: No test execution data found for the test plan!');
                    }
                }
            } catch (e) {
                console.log(`⚠️ Error checking API endpoints: ${e.message}`);
            }
        }
        
        console.log('\n✅ Debug test completed!');
        
    } catch (error) {
        console.error('❌ Error during debug test:', error);
        await page.screenshot({ path: 'debug-error.png', fullPage: true });
    } finally {
        await browser.close();
    }
}

// Run the debug test
debugStatisticsFilter().catch(console.error);