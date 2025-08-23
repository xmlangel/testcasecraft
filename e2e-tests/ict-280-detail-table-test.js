// ICT-280: Test for detailed table access
const { chromium } = require('playwright');

(async () => {
  console.log('=== ICT-280: Detailed Table Test ===');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });

  const page = await context.newPage();
  
  try {
    // 1. 로그인
    console.log('✅ Step 1: 로그인');
    await page.goto('/', { timeout: 20000 });
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // 2. 프로젝트 선택
    console.log('✅ Step 2: 프로젝트 선택');
    await page.locator('text=프로젝트').first().click();
    await page.waitForLoadState('networkidle');

    const projectButtons = await page.locator('button:has-text("프로젝트 열기")');
    await projectButtons.first().click();
    await page.waitForLoadState('networkidle');

    // 3. 테스트 결과 탭으로 이동
    console.log('✅ Step 3: 테스트 결과 탭으로 이동');
    await page.locator('text=테스트결과').first().click();
    await page.waitForLoadState('networkidle');

    // 4. 상세 테이블 버튼 클릭
    console.log('✅ Step 4: 상세 테이블 버튼 클릭');
    
    const detailTableButton = page.locator('button:has-text("상세 테이블")');
    const detailButtonCount = await detailTableButton.count();
    console.log(`상세 테이블 버튼 개수: ${detailButtonCount}`);
    
    if (detailButtonCount > 0) {
      await detailTableButton.first().click();
      await page.waitForLoadState('networkidle');
      console.log(`상세 테이블 클릭 후 URL: ${page.url()}`);
      
      // 추가 대기
      await page.waitForTimeout(3000);
      
      // 5. 테이블 요소 확인
      console.log('✅ Step 5: 테이블 요소 확인');
      
      const tableSelectors = [
        '[role="grid"]',
        '.MuiDataGrid-root',
        '.MuiDataGrid-main',
        'table'
      ];
      
      for (const selector of tableSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`✅ 테이블 발견 (${selector}): ${count}개`);
        }
      }
      
      // 6. Export 버튼 재확인
      console.log('✅ Step 6: Export 버튼 재확인');
      
      const gridExportButton = page.locator('[data-testid="GridToolbarExport"] button');
      const gridExportCount = await gridExportButton.count();
      console.log(`GridToolbarExport 버튼 개수: ${gridExportCount}`);
      
      // 모든 버튼 다시 확인
      console.log('현재 페이지의 모든 버튼:');
      const allButtons = await page.locator('button');
      const buttonCount = await allButtons.count();
      for (let i = 0; i < Math.min(buttonCount, 20); i++) {
        try {
          const buttonText = await allButtons.nth(i).textContent();
          if (buttonText && buttonText.trim() && buttonText.length < 50) {
            console.log(`  Button ${i + 1}: "${buttonText.trim()}"`);
          }
        } catch (e) {
          // Skip
        }
      }
      
      // 7. Export 테스트 시도
      if (gridExportCount > 0) {
        console.log('✅ Export 테스트 시도');
        
        try {
          const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
          await gridExportButton.first().click();
          
          const download = await downloadPromise;
          console.log(`✅ 파일 다운로드: ${await download.suggestedFilename()}`);
          
          // 파일 저장 및 검증
          const fs = require('fs');
          if (!fs.existsSync('./test-downloads')) {
            fs.mkdirSync('./test-downloads');
          }
          
          const filePath = `./test-downloads/ict-280-detail-${Date.now()}.csv`;
          await download.saveAs(filePath);
          
          if (fs.existsSync(filePath)) {
            const csvContent = fs.readFileSync(filePath, 'utf-8');
            console.log(`파일 크기: ${csvContent.length} characters`);
            console.log('파일 내용 샘플:');
            console.log(csvContent.substring(0, 300));
            
            if (csvContent.includes('[object Object]')) {
              console.log('❌ [object Object] 여전히 존재');
            } else {
              console.log('✅ [object Object] 없음 - ICT-280 수정 성공!');
            }
            
            // 스텝 정보 형식 확인
            if (csvContent.includes('Step ') && csvContent.includes('예상:')) {
              console.log('✅ 스텝 정보가 올바른 형식으로 변환됨');
            }
          }
          
        } catch (exportError) {
          console.log(`⚠️ Export 실패: ${exportError.message}`);
        }
      }
      
    } else {
      console.log('⚠️ 상세 테이블 버튼을 찾을 수 없습니다');
    }
    
    // 8. 스크린샷 저장
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-detail-table-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ Detailed Table 테스트 완료');

  } catch (error) {
    console.error('❌ 테스트 오류:', error);
    
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-detail-table-error-${Date.now()}.png`,
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();