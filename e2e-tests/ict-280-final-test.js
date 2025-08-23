// ICT-280: Final verification test for export fix
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('=== ICT-280: Final Export Fix Verification Test ===');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });

  const page = await context.newPage();
  
  try {
    // Standard navigation
    console.log('✅ Step 1: 표준 네비게이션');
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

    await page.locator('button:has-text("상세 테이블")').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log('✅ Step 2: Export 버튼 찾기 및 실행');
    
    // Find the Export button using the aria-label we discovered earlier
    const exportButton = page.locator('button[aria-label="Export"]').first();
    const exportButtonExists = await exportButton.count() > 0;
    
    console.log(`Export 버튼 존재: ${exportButtonExists}`);
    
    if (exportButtonExists) {
      console.log('✅ Export 버튼 클릭 시도');
      
      // Create downloads directory
      if (!fs.existsSync('./test-downloads')) {
        fs.mkdirSync('./test-downloads', { recursive: true });
      }
      
      try {
        // Set up download handler
        const downloadPromise = page.waitForEvent('download', { timeout: 20000 });
        
        // Click the export button
        await exportButton.click();
        console.log('✅ Export 버튼 클릭 완료');
        
        // Wait for download
        const download = await downloadPromise;
        const suggestedFilename = await download.suggestedFilename();
        console.log(`✅ 다운로드 시작: ${suggestedFilename}`);
        
        // Save the file
        const timestamp = Date.now();
        const filePath = `./test-downloads/ict-280-final-test-${timestamp}.csv`;
        await download.saveAs(filePath);
        console.log(`✅ 파일 저장 완료: ${filePath}`);
        
        // Verify file contents
        console.log('✅ Step 3: 파일 내용 검증');
        
        if (fs.existsSync(filePath)) {
          const csvContent = fs.readFileSync(filePath, 'utf-8');
          
          console.log(`파일 크기: ${csvContent.length} characters`);
          
          // Check for [object Object]
          const hasObjectObject = csvContent.includes('[object Object]');
          console.log(`[object Object] 존재: ${hasObjectObject ? '❌ 발견됨' : '✅ 없음'}`);
          
          // Check for properly formatted step information
          const hasStepFormatting = csvContent.includes('Step ') && csvContent.includes('예상:');
          console.log(`올바른 스텝 형식: ${hasStepFormatting ? '✅ 발견됨' : '⚠️ 없음 (데이터 없을 수 있음)'}`);
          
          // Show sample content
          console.log('📋 파일 내용 샘플 (처음 500자):');
          console.log(csvContent.substring(0, 500));
          
          // Check headers
          const lines = csvContent.split('\n');
          if (lines.length > 0) {
            console.log('📋 CSV 헤더:');
            console.log(lines[0]);
          }
          
          // Summary
          console.log('\n=== ICT-280 테스트 결과 요약 ===');
          if (!hasObjectObject) {
            console.log('🎉 성공: [object Object] 문제가 해결되었습니다!');
            console.log('✅ 일반 export 기능이 정상적으로 동작합니다');
          } else {
            console.log('❌ 실패: [object Object] 문제가 여전히 존재합니다');
          }
          
          if (hasStepFormatting) {
            console.log('✅ 스텝 정보가 올바른 형식으로 변환되었습니다');
          } else {
            console.log('ℹ️ 스텝 정보가 없거나 다른 형식입니다 (테스트 데이터에 따라 정상일 수 있음)');
          }
          
        } else {
          console.log('❌ 파일이 생성되지 않았습니다');
        }
        
      } catch (downloadError) {
        console.log(`❌ Export 실패: ${downloadError.message}`);
        console.log('디버깅을 위해 스크린샷을 저장합니다...');
        await page.screenshot({ 
          path: `./test-screenshots/ict-280-export-error-${Date.now()}.png`,
          fullPage: true 
        });
      }
      
    } else {
      console.log('❌ Export 버튼을 찾을 수 없습니다');
    }
    
    // Final screenshot
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-final-test-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ ICT-280 최종 검증 테스트 완료');

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-final-error-${Date.now()}.png`,
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();