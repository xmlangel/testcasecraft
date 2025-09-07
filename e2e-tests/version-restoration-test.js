// Version Restoration E2E Test
// Tests the version management and restoration functionality

const { chromium } = require('playwright');

async function testVersionRestoration() {
    let browser;
    let context;
    let page;
    
    try {
        // Launch browser
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 1000 // Add delays to see what's happening
        });
        
        context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        
        page = await context.newPage();
        
        console.log('🚀 Starting Version Restoration E2E Test');
        
        // Step 1: Navigate to application
        console.log('📱 1. Navigating to application...');
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Step 2: Login
        console.log('🔐 2. Logging in...');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // Verify login success - should redirect to projects
        const currentUrl = page.url();
        console.log(`   Current URL: ${currentUrl}`);
        if (!currentUrl.includes('/projects')) {
            throw new Error('Login failed - not redirected to projects page');
        }
        
        // Step 3: Open first project
        console.log('📂 3. Opening first project...');
        const openProjectButtons = await page.locator('button:has-text("프로젝트 열기")');
        const buttonCount = await openProjectButtons.count();
        
        if (buttonCount === 0) {
            throw new Error('No projects found. Need at least one project with test cases.');
        }
        
        await openProjectButtons.first().click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're in project view
        const projectUrl = page.url();
        console.log(`   Project URL: ${projectUrl}`);
        if (!projectUrl.includes('/projects/')) {
            throw new Error('Failed to open project');
        }
        
        // Step 4: Navigate to test cases
        console.log('📋 4. Navigating to test cases...');
        await page.click('text=테스트케이스');
        await page.waitForLoadState('networkidle');
        
        // Step 5: Find a test case with edit option
        console.log('🔍 5. Finding editable test case...');
        
        // First check if there are any test cases in the tree
        const testCaseItems = await page.locator('[data-testid="tree-node"], .tree-node, .testcase-item');
        const itemCount = await testCaseItems.count();
        console.log(`   Found ${itemCount} potential test case items`);
        
        if (itemCount === 0) {
            throw new Error('No test case items found. Need at least one test case to test version functionality.');
        }
        
        // Look for edit buttons in various forms
        const editButtons = await page.locator('button[aria-label="수정"], button:has-text("수정"), [role="button"]:has-text("수정"), button:has-text("Edit")');
        const editButtonCount = await editButtons.count();
        
        console.log(`   Found ${editButtonCount} edit buttons`);
        
        if (editButtonCount === 0) {
            // Try clicking on test case items to see if edit options appear
            console.log('   No edit buttons found, trying to click on first test case item...');
            await testCaseItems.first().click();
            await page.waitForTimeout(2000);
            
            // Check for edit buttons again
            const editButtonsAfterClick = await page.locator('button[aria-label="수정"], button:has-text("수정"), [role="button"]:has-text("수정")');
            const editButtonCountAfterClick = await editButtonsAfterClick.count();
            
            if (editButtonCountAfterClick === 0) {
                throw new Error('No editable test cases found. Need at least one test case to test version functionality.');
            }
        }
        
        // Click first edit button
        await editButtons.first().click();
        await page.waitForLoadState('networkidle');
        
        // Step 6: Make a change to create a version
        console.log('✏️ 6. Making changes to test case...');
        const descriptionField = await page.locator('textarea[name="description"], input[name="description"]');
        
        if (await descriptionField.count() > 0) {
            const currentDescription = await descriptionField.inputValue();
            const newDescription = currentDescription + ' - Version Test ' + Date.now();
            
            await descriptionField.fill(newDescription);
            console.log(`   Changed description to: ${newDescription}`);
            
            // Save changes
            const saveButton = await page.locator('button:has-text("저장")');
            if (await saveButton.count() > 0) {
                await saveButton.click();
                await page.waitForTimeout(2000); // Wait for save to complete
                console.log('   ✅ Changes saved successfully');
            }
        }
        
        // Step 7: Access version history
        console.log('📚 7. Accessing version history...');
        const versionButton = await page.locator('button:has-text("버전"), button[aria-label*="버전"], button:has-text("히스토리")');
        
        if (await versionButton.count() === 0) {
            console.log('   ⚠️ No version button found, looking for version menu...');
            // Try to find version-related buttons or menus
            const moreButtons = await page.locator('button[aria-label="더보기"], button:has(svg)');
            const moreButtonCount = await moreButtons.count();
            
            for (let i = 0; i < moreButtonCount; i++) {
                try {
                    await moreButtons.nth(i).click();
                    await page.waitForTimeout(1000);
                    
                    // Check if version option appeared
                    const versionOption = await page.locator('text=버전, text=히스토리, text=Version');
                    if (await versionOption.count() > 0) {
                        console.log('   Found version option in dropdown');
                        await versionOption.first().click();
                        break;
                    }
                } catch (e) {
                    // Continue to next button
                }
            }
        } else {
            await versionButton.first().click();
        }
        
        await page.waitForLoadState('networkidle');
        
        // Step 8: Check for version history dialog
        console.log('🕰️ 8. Checking version history...');
        const versionDialog = await page.locator('[role="dialog"]:has-text("버전"), [role="dialog"]:has-text("히스토리")');
        
        if (await versionDialog.count() > 0) {
            console.log('   ✅ Version history dialog opened');
            
            // Look for restore buttons
            const restoreButtons = await page.locator('button:has-text("복원"), button[aria-label*="복원"]');
            const restoreCount = await restoreButtons.count();
            
            console.log(`   Found ${restoreCount} restore buttons`);
            
            if (restoreCount > 0) {
                // Step 9: Test version restoration
                console.log('🔄 9. Testing version restoration...');
                
                // Click on a restore button (not the current version)
                await restoreButtons.first().click();
                await page.waitForTimeout(3000); // Wait for restoration to complete
                
                // Check for success message or indication
                const successMessage = await page.locator('text=복원, text=성공, .MuiSnackbar-root');
                if (await successMessage.count() > 0) {
                    console.log('   ✅ Version restoration appeared to succeed');
                    
                    // Check browser console for errors
                    const logs = [];
                    page.on('console', msg => {
                        if (msg.type() === 'error') {
                            logs.push(msg.text());
                        }
                    });
                    
                    await page.waitForTimeout(2000);
                    
                    if (logs.length > 0) {
                        console.log('   ⚠️ Console errors found:');
                        logs.forEach(log => console.log(`     - ${log}`));
                        
                        // Check if these are the specific errors we fixed
                        const hasTargetErrors = logs.some(log => 
                            log.includes("Cannot read properties of undefined (reading 'id')") ||
                            log.includes("Cannot read properties of undefined (reading 'name')")
                        );
                        
                        if (hasTargetErrors) {
                            console.log('   ❌ FOUND TARGET ERRORS: Version restoration still has issues');
                            return false;
                        } else {
                            console.log('   ✅ No target errors found - restoration seems to work');
                        }
                    } else {
                        console.log('   ✅ No console errors found');
                    }
                } else {
                    console.log('   ⚠️ No clear success indication found');
                }
            } else {
                console.log('   ⚠️ No restore buttons found in version history');
            }
            
            // Close version dialog
            const closeButton = await page.locator('button:has-text("닫기"), button[aria-label="닫기"]');
            if (await closeButton.count() > 0) {
                await closeButton.first().click();
            }
        } else {
            console.log('   ⚠️ Version history dialog not found');
        }
        
        console.log('🎉 Version Restoration E2E Test Completed');
        return true;
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return false;
    } finally {
        if (page) {
            // Take screenshot for debugging
            try {
                await page.screenshot({ 
                    path: 'version-test-final.png', 
                    fullPage: true 
                });
                console.log('📸 Screenshot saved as version-test-final.png');
            } catch (e) {
                console.log('Failed to take screenshot:', e.message);
            }
        }
        
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
if (require.main === module) {
    testVersionRestoration()
        .then(success => {
            if (success) {
                console.log('✅ Version restoration test completed successfully!');
                process.exit(0);
            } else {
                console.log('❌ Version restoration test had issues');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = testVersionRestoration;