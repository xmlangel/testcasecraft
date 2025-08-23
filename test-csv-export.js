const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testCSVExport() {
    console.log('🚀 Starting CSV Export Test...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    
    const page = await context.newPage();
    
    try {
        // Step 1: Navigate to application and login
        console.log('📍 Step 1: Navigating to application...');
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of login page
        await page.screenshot({ path: 'screenshots/01-login-page.png' });
        console.log('📸 Screenshot saved: 01-login-page.png');
        
        // Login with admin credentials
        console.log('🔐 Logging in with admin/admin...');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // Take screenshot after login
        await page.screenshot({ path: 'screenshots/02-after-login.png' });
        console.log('📸 Screenshot saved: 02-after-login.png');
        
        // Step 2: Navigate to projects
        console.log('📍 Step 2: Navigating to projects...');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of projects page
        await page.screenshot({ path: 'screenshots/03-projects-page.png' });
        console.log('📸 Screenshot saved: 03-projects-page.png');
        
        // Step 3: Open a project
        console.log('📍 Step 3: Opening a project...');
        const openButton = page.locator('button:has-text("프로젝트 열기")').first();
        await openButton.waitFor();
        await openButton.click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of project page
        await page.screenshot({ path: 'screenshots/04-project-opened.png' });
        console.log('📸 Screenshot saved: 04-project-opened.png');
        
        // Step 4: Navigate to Test Results tab
        console.log('📍 Step 4: Navigating to Test Results tab...');
        await page.locator('text=테스트결과').first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for data to load
        
        // Take screenshot of test results page
        await page.screenshot({ path: 'screenshots/05-test-results-page.png' });
        console.log('📸 Screenshot saved: 05-test-results-page.png');
        
        // Step 5: Check if there are test results and navigate to detail table
        console.log('📍 Step 5: Checking for test results...');
        
        // Look for "상세보기" button or similar
        const detailButtons = await page.locator('button:has-text("상세보기")').count();
        console.log(`🔍 Found ${detailButtons} detail view buttons`);
        
        if (detailButtons > 0) {
            // Click the first detail view button
            await page.locator('button:has-text("상세보기")').first().click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);
            
            // Take screenshot of detail table
            await page.screenshot({ path: 'screenshots/06-detail-table.png' });
            console.log('📸 Screenshot saved: 06-detail-table.png');
            
            // Step 6: Test CSV Export functionality
            console.log('📍 Step 6: Testing CSV Export functionality...');
            
            // Look for CSV export button (could be "CSV 내보내기", "Export", "다운로드" etc.)
            const exportButtonSelectors = [
                'button:has-text("CSV")',
                'button:has-text("Export")', 
                'button:has-text("내보내기")',
                'button:has-text("다운로드")',
                '[data-testid="export-csv"]',
                '.export-button',
                'button[title*="export"]',
                'button[title*="CSV"]'
            ];
            
            let exportButton = null;
            let foundSelector = null;
            
            for (const selector of exportButtonSelectors) {
                const buttonCount = await page.locator(selector).count();
                if (buttonCount > 0) {
                    exportButton = page.locator(selector).first();
                    foundSelector = selector;
                    console.log(`✅ Found export button with selector: ${selector}`);
                    break;
                }
            }
            
            if (exportButton) {
                // Set up download handling
                const downloadPromise = page.waitForEvent('download');
                
                // Click the export button
                await exportButton.click();
                console.log('🖱️  Clicked CSV export button');
                
                // Wait for download to complete
                try {
                    const download = await downloadPromise;
                    const fileName = download.suggestedFilename();
                    console.log(`📥 Download initiated: ${fileName}`);
                    
                    // Save the downloaded file
                    const downloadPath = path.join('./screenshots', fileName);
                    await download.saveAs(downloadPath);
                    console.log(`💾 File saved to: ${downloadPath}`);
                    
                    // Read and analyze the CSV content
                    if (fs.existsSync(downloadPath)) {
                        const csvContent = fs.readFileSync(downloadPath, 'utf-8');
                        console.log('📄 CSV Content Preview (first 500 characters):');
                        console.log(csvContent.substring(0, 500));
                        
                        // Check for "[object Object]" error
                        if (csvContent.includes('[object Object]')) {
                            console.log('❌ ERROR: Found "[object Object]" in CSV export - fix not working properly');
                            console.log('🔍 Locations of [object Object]:');
                            const lines = csvContent.split('\n');
                            lines.forEach((line, index) => {
                                if (line.includes('[object Object]')) {
                                    console.log(`   Line ${index + 1}: ${line}`);
                                }
                            });
                        } else {
                            console.log('✅ SUCCESS: No "[object Object]" found in CSV export - fix is working correctly!');
                        }
                        
                        // Additional analysis
                        const lineCount = csvContent.split('\n').length;
                        console.log(`📊 CSV Analysis: ${lineCount} lines total`);
                        
                    } else {
                        console.log('❌ ERROR: Downloaded file not found');
                    }
                    
                    // Take screenshot after export
                    await page.screenshot({ path: 'screenshots/07-after-csv-export.png' });
                    console.log('📸 Screenshot saved: 07-after-csv-export.png');
                    
                } catch (downloadError) {
                    console.log('❌ ERROR: Download failed or timed out');
                    console.error(downloadError);
                    
                    // Take screenshot of any error state
                    await page.screenshot({ path: 'screenshots/07-csv-export-error.png' });
                    console.log('📸 Screenshot saved: 07-csv-export-error.png');
                }
                
            } else {
                console.log('❌ ERROR: Could not find CSV export button');
                console.log('🔍 Available buttons on the page:');
                
                // List all buttons for debugging
                const allButtons = await page.locator('button').all();
                for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
                    const buttonText = await allButtons[i].textContent();
                    const buttonTitle = await allButtons[i].getAttribute('title');
                    console.log(`   Button ${i + 1}: "${buttonText}" (title: "${buttonTitle}")`);
                }
            }
            
        } else {
            console.log('❌ ERROR: No test results found with detail view buttons');
            console.log('🔍 Checking for any test result data on the page...');
            
            // Check if there are any table rows or data
            const tableRows = await page.locator('tr').count();
            const tableData = await page.locator('td').count();
            console.log(`📊 Found ${tableRows} table rows and ${tableData} table cells`);
            
            if (tableRows === 0 && tableData === 0) {
                console.log('⚠️  WARNING: No table data found. Test results might be empty.');
            }
        }
        
    } catch (error) {
        console.error('❌ ERROR during test execution:', error);
        
        // Take screenshot of error state
        await page.screenshot({ path: 'screenshots/error-state.png' });
        console.log('📸 Screenshot saved: error-state.png');
        
    } finally {
        await browser.close();
        console.log('🏁 Test completed');
    }
}

// Create screenshots directory
const screenshotsDir = './screenshots';
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Run the test
testCSVExport().catch(console.error);