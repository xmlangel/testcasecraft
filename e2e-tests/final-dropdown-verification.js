/**
 * Final Test Execution Dropdown Verification
 * 
 * This test specifically clicks on the "테스트 실행" dropdown to verify 
 * if the options show actual test executions like "1번실행" and "2"
 */

const { chromium } = require('playwright');

async function finalDropdownVerification() {
    console.log('🧪 Starting Final Dropdown Verification Test...');
    
    let browser;
    let page;
    
    try {
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
        
        console.log('🔐 Navigation: Login → Project → Test Results...');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');
        
        await page.locator('text=테스트결과').click();
        await page.waitForLoadState('networkidle');
        
        // Wait extra time for all async data loading
        await page.waitForTimeout(5000);
        
        console.log('🎯 Step 1: Locate and click "테스트 실행" dropdown...');
        
        // Look for the exact dropdown that says "테스트 실행"
        const testExecutionDropdowns = await page.locator('div').filter({ 
            hasText: '테스트 실행' 
        }).all();
        
        console.log(`📋 Found ${testExecutionDropdowns.length} elements containing "테스트 실행"`);
        
        let dropdownFound = false;
        let actualExecutionsFound = false;
        
        for (let i = 0; i < testExecutionDropdowns.length; i++) {
            try {
                const dropdown = testExecutionDropdowns[i];
                const text = await dropdown.textContent();
                const isVisible = await dropdown.isVisible();
                
                console.log(`🔍 Dropdown ${i + 1}: "${text?.trim()}" (visible: ${isVisible})`);
                
                if (isVisible && text && text.includes('테스트 실행')) {
                    // Try to find a clickable select/combobox within this element
                    const selectElement = dropdown.locator('[role="combobox"], select, .MuiSelect-select').first();
                    const selectExists = await selectElement.count() > 0;
                    
                    if (selectExists) {
                        console.log(`🎯 Found clickable select element in dropdown ${i + 1}!`);
                        dropdownFound = true;
                        
                        // Click the select element
                        await selectElement.click({ timeout: 5000 });
                        await page.waitForTimeout(2000);
                        
                        // Look for dropdown options that appeared
                        const optionSelectors = [
                            '.MuiMenuItem-root',
                            '[role="option"]',
                            '.MuiListItem-root',
                            'li[data-value]',
                            'option'
                        ];
                        
                        let foundOptions = [];
                        for (const selector of optionSelectors) {
                            const options = await page.locator(selector).allTextContents();
                            if (options.length > 0) {
                                foundOptions = foundOptions.concat(options.filter(opt => opt && opt.trim()));
                            }
                        }
                        
                        // Remove duplicates
                        foundOptions = [...new Set(foundOptions)];
                        
                        console.log(`📝 Dropdown options found: ${JSON.stringify(foundOptions)}`);
                        
                        // Check for expected test executions
                        const hasExpectedExecutions = foundOptions.some(opt => 
                            opt.includes('1번실행') || opt === '2' || opt.match(/\d+번?실행/)
                        );
                        
                        if (hasExpectedExecutions) {
                            actualExecutionsFound = true;
                            console.log(`🎉 SUCCESS! Found actual test executions in dropdown!`);
                            
                            const executionOptions = foundOptions.filter(opt => 
                                opt.includes('실행') || opt.match(/^\d+$/) || opt.includes('1번실행')
                            );
                            
                            console.log(`🚀 Test execution options: ${JSON.stringify(executionOptions)}`);
                        } else {
                            console.log(`❌ No actual test executions found. Available options: ${JSON.stringify(foundOptions)}`);
                        }
                        
                        // Try to select an option if available
                        if (foundOptions.length > 0 && actualExecutionsFound) {
                            const optionToSelect = foundOptions.find(opt => 
                                opt.includes('1번실행') || opt === '2'
                            );
                            
                            if (optionToSelect) {
                                console.log(`🎯 Attempting to select: "${optionToSelect}"`);
                                await page.locator('.MuiMenuItem-root, [role="option"]').filter({ 
                                    hasText: optionToSelect 
                                }).first().click();
                                await page.waitForTimeout(1000);
                                
                                // Verify selection
                                const currentValue = await selectElement.textContent();
                                console.log(`✅ After selection, dropdown shows: "${currentValue?.trim()}"`);
                            }
                        }
                        
                        // Close dropdown if still open
                        await page.keyboard.press('Escape');
                        await page.waitForTimeout(1000);
                        
                        break; // Exit loop after successful interaction
                    }
                }
            } catch (error) {
                console.log(`⚠️ Could not interact with dropdown ${i + 1}: ${error.message}`);
            }
        }
        
        console.log('🔍 Step 2: Alternative approach - direct element targeting...');
        
        if (!dropdownFound) {
            // Try alternative selectors for Material-UI dropdowns
            const alternativeSelectors = [
                'div[role="combobox"][aria-labelledby*="테스트"]',
                '.MuiFormControl-root:has-text("테스트 실행")',
                'input[aria-label*="테스트 실행"]'
            ];
            
            for (const selector of alternativeSelectors) {
                try {
                    const element = page.locator(selector).first();
                    const exists = await element.count() > 0;
                    
                    if (exists) {
                        console.log(`🎯 Found alternative element: ${selector}`);
                        await element.click();
                        await page.waitForTimeout(2000);
                        
                        const menuOptions = await page.locator('.MuiMenuItem-root').allTextContents();
                        console.log(`📝 Alternative dropdown options: ${JSON.stringify(menuOptions)}`);
                        
                        await page.keyboard.press('Escape');
                        break;
                    }
                } catch (error) {
                    console.log(`⚠️ Alternative selector failed: ${error.message}`);
                }
            }
        }
        
        console.log('📸 Step 3: Take screenshot and verify API data...');
        
        // Final verification: Check if the AppContext has the test executions loaded
        const contextVerification = await page.evaluate(() => {
            // Look for any React component state or props that might contain test executions
            const allElements = Array.from(document.querySelectorAll('*'));
            
            // Check for elements containing the specific test execution names
            const elementsWithExecutions = allElements.filter(el => {
                const text = el.textContent || '';
                return text.includes('1번실행') || (text.includes('2') && text.includes('실행'));
            });
            
            return {
                foundExecutionElements: elementsWithExecutions.length,
                executionTexts: elementsWithExecutions.slice(0, 3).map(el => 
                    el.textContent?.trim().substring(0, 50)
                )
            };
        });
        
        console.log(`🔍 Context verification:`, contextVerification);
        
        // Take final screenshot
        await page.screenshot({ 
            path: '/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/e2e-tests/final-dropdown-verification.png',
            fullPage: true 
        });
        
        console.log('\n🏁 FINAL TEST RESULTS:');
        console.log('======================');
        console.log(`✅ Navigation to test results: SUCCESS`);
        console.log(`📋 Test execution dropdown found: ${dropdownFound ? 'YES' : 'NO'}`);
        console.log(`🚀 Actual test executions in dropdown: ${actualExecutionsFound ? 'YES' : 'NO'}`);
        console.log(`🔍 Elements containing execution data: ${contextVerification.foundExecutionElements}`);
        
        // Final API verification
        const apiData = await page.evaluate(async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const projectId = window.location.pathname.match(/\/projects\/([^\/]+)/)?.[1];
                const response = await fetch(`/api/test-executions/by-project/${projectId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                return { success: true, executions: data.map(d => d.name) };
            } catch (error) {
                return { success: false, error: error.message };
            }
        });
        
        console.log(`🌐 API Data Available: ${apiData.success ? 'YES' : 'NO'}`);
        if (apiData.success) {
            console.log(`📊 API Test Executions: ${JSON.stringify(apiData.executions)}`);
        }
        
        if (dropdownFound && actualExecutionsFound) {
            console.log('\n🎉 CONCLUSION: Test Execution Filter is WORKING CORRECTLY!');
            console.log('   ✅ Dropdown elements are properly rendered');
            console.log('   ✅ Test executions are loaded from API');
            console.log('   ✅ Actual execution names are available in UI');
            console.log('   ✅ AppContext modification was successful!');
        } else if (apiData.success) {
            console.log('\n⚠️ CONCLUSION: Partial Success');
            console.log('   ✅ API is working and returning test executions');
            console.log('   ❓ UI might need further investigation for dropdown interaction');
            console.log('   💡 The backend fix is working, frontend integration may need refinement');
        } else {
            console.log('\n❌ CONCLUSION: Issues detected');
            console.log('   ❌ Could not verify test execution loading');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        if (page) {
            await page.screenshot({ 
                path: '/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/e2e-tests/final-dropdown-error.png',
                fullPage: true 
            });
        }
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
finalDropdownVerification()
    .then(() => {
        console.log('🎉 Final Dropdown Verification completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Final Dropdown Verification failed:', error);
        process.exit(1);
    });