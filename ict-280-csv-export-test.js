const { chromium } = require('playwright');

async function testCSVExport() {
    console.log('🚀 ICT-280: CSV Export Test Starting...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    
    const page = await context.newPage();
    
    try {
        // Step 1: Login
        console.log('📍 Step 1: Login...');
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        console.log('✅ Login successful');

        // Step 2: Navigate to Projects
        console.log('📍 Step 2: Navigate to projects...');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        console.log('✅ Projects page loaded');

        // Step 3: Open first project
        console.log('📍 Step 3: Open project...');
        const openButton = page.locator('button:has-text("프로젝트 열기")').first();
        await openButton.waitFor();
        await openButton.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ Project opened');

        // Step 4: Navigate to Test Results tab
        console.log('📍 Step 4: Navigate to Test Results...');
        await page.locator('text=테스트결과').first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        console.log('✅ Test Results page loaded');

        // Step 5: Check for test results and open detail view
        console.log('📍 Step 5: Looking for test results...');
        const detailButtons = await page.locator('button:has-text("상세보기")').count();
        console.log(`🔍 Found ${detailButtons} detail view buttons`);

        if (detailButtons > 0) {
            // Open detail view
            await page.locator('button:has-text("상세보기")').first().click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000); // Wait for data to load
            console.log('✅ Detail table opened');

            // Take screenshot before CSV export
            await page.screenshot({ path: 'ict-280-before-export.png' });
            console.log('📸 Screenshot saved: ict-280-before-export.png');

            // Step 6: Test CSV Export
            console.log('📍 Step 6: Testing CSV Export...');
            
            // Look for CSV export button
            const exportButtonSelectors = [
                'button:has-text("CSV")',
                'button:has-text("Export")', 
                'button:has-text("내보내기")',
                'button:has-text("다운로드")',
                '[data-testid="export-csv"]',
                '.MuiButton-root:has-text("CSV")',
                'button[aria-label*="Export"]'
            ];
            
            let exportButton = null;
            
            for (const selector of exportButtonSelectors) {
                const buttonCount = await page.locator(selector).count();
                if (buttonCount > 0) {
                    exportButton = page.locator(selector).first();
                    console.log(`✅ Found export button with selector: ${selector}`);
                    break;
                }
            }

            // If no specific CSV button, try DataGrid toolbar buttons
            if (!exportButton) {
                console.log('🔍 Looking for DataGrid export button...');
                const toolbarButtons = await page.locator('.MuiDataGrid-toolbarContainer button').count();
                console.log(`Found ${toolbarButtons} toolbar buttons`);
                
                if (toolbarButtons > 0) {
                    // Try the first toolbar button (usually export)
                    exportButton = page.locator('.MuiDataGrid-toolbarContainer button').first();
                    console.log('✅ Using first toolbar button as export button');
                }
            }

            if (exportButton) {
                try {
                    // Set up download handler
                    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
                    
                    // Click export button
                    await exportButton.click();
                    console.log('🖱️  Clicked CSV export button');

                    // Wait for download
                    const download = await downloadPromise;
                    const fileName = download.suggestedFilename();
                    console.log(`📥 Download started: ${fileName}`);
                    
                    // Save the file
                    const downloadPath = `./ict-280-exported-${fileName}`;
                    await download.saveAs(downloadPath);
                    console.log(`💾 File saved to: ${downloadPath}`);

                    // Read and analyze CSV content
                    const fs = require('fs');
                    if (fs.existsSync(downloadPath)) {
                        const csvContent = fs.readFileSync(downloadPath, 'utf-8');
                        console.log('📄 CSV Content Preview (first 500 characters):');
                        console.log(csvContent.substring(0, 500));
                        
                        // Check for the specific error we were fixing
                        const hasObjectError = csvContent.includes('[object Object]');
                        if (hasObjectError) {
                            console.log('❌ ERROR: Still found "[object Object]" in CSV export');
                            const lines = csvContent.split('\n');
                            lines.forEach((line, index) => {
                                if (line.includes('[object Object]')) {
                                    console.log(`   Line ${index + 1}: ${line}`);
                                }
                            });
                        } else {
                            console.log('✅ SUCCESS: No "[object Object]" found in CSV export!');
                            console.log('🎉 ICT-280: CSV Export fix is working correctly!');
                        }

                        // Additional analysis
                        const lineCount = csvContent.split('\n').length;
                        const hasHeaders = csvContent.includes('testCase') || csvContent.includes('result');
                        console.log(`📊 CSV Analysis:`);
                        console.log(`   - Lines: ${lineCount}`);
                        console.log(`   - Has Headers: ${hasHeaders}`);
                        console.log(`   - File Size: ${csvContent.length} characters`);
                        
                    } else {
                        console.log('❌ ERROR: Downloaded file not found');
                    }

                    // Take screenshot after export
                    await page.screenshot({ path: 'ict-280-after-export.png' });
                    console.log('📸 Screenshot saved: ict-280-after-export.png');

                    console.log('✅ ICT-280: CSV Export test completed successfully');

                } catch (downloadError) {
                    console.log('❌ ERROR: Download failed:', downloadError.message);
                    await page.screenshot({ path: 'ict-280-export-error.png' });
                    console.log('📸 Error screenshot saved: ict-280-export-error.png');
                }
                
            } else {
                console.log('❌ ERROR: Could not find CSV export button');
                console.log('🔍 Available buttons on the page:');
                
                const allButtons = await page.locator('button').all();
                for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
                    const buttonText = await allButtons[i].textContent();
                    const buttonClass = await allButtons[i].getAttribute('class');
                    console.log(`   Button ${i + 1}: "${buttonText}" (class: "${buttonClass}")`);
                }
            }
            
        } else {
            console.log('❌ ERROR: No test results found with detail view buttons');
            console.log('🔍 Checking for test result data...');
            
            const tableRows = await page.locator('tr').count();
            const tableData = await page.locator('td').count();
            console.log(`📊 Found ${tableRows} table rows and ${tableData} table cells`);
        }
        
    } catch (error) {
        console.error('❌ ERROR during test execution:', error);
        await page.screenshot({ path: 'ict-280-error-state.png' });
        console.log('📸 Error screenshot saved: ict-280-error-state.png');
        
    } finally {
        await browser.close();
        console.log('🏁 ICT-280: Test completed');
    }
}

// Run the test
testCSVExport().catch(console.error);