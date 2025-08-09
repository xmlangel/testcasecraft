// Test script to verify ICT-154 spreadsheet input bug fix
const { chromium } = require('playwright');

(async () => {
  console.log('🧪 Starting ICT-154 spreadsheet input bug verification test...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    console.log('📱 Navigating to http://localhost:3001...');
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
    
    // Wait for login form or main content
    console.log('⏳ Waiting for page to load...');
    await page.waitForTimeout(3000);
    
    // Check if we need to login
    const loginForm = await page.$('input[name="username"], input[placeholder*="사용자"], input[placeholder*="username"]');
    
    if (loginForm) {
      console.log('🔐 Login form detected, attempting login...');
      
      // Try to find username field
      const usernameField = await page.$('input[name="username"], input[placeholder*="사용자"], input[placeholder*="username"]');
      if (usernameField) {
        await usernameField.fill('admin');
        console.log('✏️ Username filled: admin');
      }
      
      // Try to find password field
      const passwordField = await page.$('input[type="password"], input[name="password"]');
      if (passwordField) {
        await passwordField.fill('admin');
        console.log('✏️ Password filled: admin');
      }
      
      // Try to find and click login button
      const loginButton = await page.$('button[type="submit"], button:has-text("로그인"), button:has-text("Login")');
      if (loginButton) {
        await loginButton.click();
        console.log('🔑 Login button clicked');
        await page.waitForTimeout(2000);
      }
    }
    
    // Look for project selection or navigation
    console.log('🏗️ Looking for project selection...');
    await page.waitForTimeout(2000);
    
    // Try to find a project or navigate to test cases
    const projectLinks = await page.$$('a[href*="projects"], button:has-text("프로젝트"), .project');
    if (projectLinks.length > 0) {
      console.log(`📋 Found ${projectLinks.length} project links, clicking first one...`);
      await projectLinks[0].click();
      await page.waitForTimeout(2000);
    }
    
    // Look for test case navigation or spreadsheet mode toggle
    console.log('📊 Looking for spreadsheet toggle...');
    
    // Try to find input mode toggle or spreadsheet option
    const spreadsheetToggle = await page.$('button:has-text("스프레드시트"), button[aria-label*="스프레드시트"], .MuiToggleButton-root:has-text("스프레드시트")');
    
    if (spreadsheetToggle) {
      console.log('🎯 Found spreadsheet toggle, switching to spreadsheet mode...');
      await spreadsheetToggle.click();
      await page.waitForTimeout(3000);
      
      // Wait for spreadsheet to load
      console.log('⏳ Waiting for spreadsheet to load...');
      await page.waitForSelector('[data-testid*="spreadsheet"], .react-spreadsheet, table', { timeout: 10000 });
      
      // Test input functionality
      console.log('✏️ Testing spreadsheet input functionality...');
      
      // Find the first editable cell
      const cells = await page.$$('.react-spreadsheet-cell, td[contenteditable], td input, .cell');
      
      if (cells.length > 0) {
        console.log(`📋 Found ${cells.length} cells, testing input on first few cells...`);
        
        // Test multiple cells
        for (let i = 0; i < Math.min(5, cells.length); i++) {
          try {
            const testValue = `Test Value ${i + 1}`;
            console.log(`\n🔍 Testing cell ${i + 1} with value: "${testValue}"`);
            
            // Click the cell
            await cells[i].click();
            await page.waitForTimeout(500);
            
            // Clear and type new value
            await cells[i].fill('');
            await cells[i].fill(testValue);
            await page.waitForTimeout(1000);
            
            // Press Enter to confirm
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
            
            // Check if value persisted
            const cellValue = await cells[i].textContent();
            if (cellValue.includes(testValue)) {
              console.log(`✅ Cell ${i + 1}: Input value PERSISTED! (${cellValue})`);
            } else {
              console.log(`❌ Cell ${i + 1}: Input value DISAPPEARED! Expected: "${testValue}", Got: "${cellValue}"`);
            }
            
          } catch (cellError) {
            console.log(`⚠️ Cell ${i + 1}: Error during test: ${cellError.message}`);
          }
        }
        
        console.log('\n🎯 Testing Tab navigation...');
        
        // Test Tab key navigation
        try {
          const firstCell = cells[0];
          await firstCell.click();
          await firstCell.fill('Tab Test 1');
          await page.keyboard.press('Tab');
          await page.waitForTimeout(500);
          
          // Type in the next cell
          await page.keyboard.type('Tab Test 2');
          await page.keyboard.press('Tab');
          await page.waitForTimeout(1000);
          
          console.log('✅ Tab navigation test completed');
        } catch (tabError) {
          console.log(`⚠️ Tab navigation test failed: ${tabError.message}`);
        }
        
      } else {
        console.log('❌ No editable cells found in spreadsheet');
      }
      
    } else {
      console.log('❌ Spreadsheet toggle not found. Available buttons:');
      const buttons = await page.$$('button');
      for (let i = 0; i < Math.min(10, buttons.length); i++) {
        const buttonText = await buttons[i].textContent();
        if (buttonText) {
          console.log(`  - "${buttonText.trim()}"`);
        }
      }
    }
    
    console.log('\n📊 Test Summary:');
    console.log('✅ ICT-154 bug fix verification completed');
    console.log('🔍 Check console output above for detailed results');
    
    // Keep browser open for manual verification
    console.log('\n⏳ Keeping browser open for 30 seconds for manual verification...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  } finally {
    await browser.close();
    console.log('\n🏁 Test completed and browser closed');
  }
})();