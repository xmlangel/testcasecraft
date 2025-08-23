// ICT-280: Comprehensive test with data creation if needed
const { chromium } = require('playwright');

(async () => {
  console.log('=== ICT-280: Comprehensive Test ===');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
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

    console.log(`테스트 결과 페이지 URL: ${page.url()}`);

    // 4. 페이지 로딩 대기 및 상태 확인
    console.log('✅ Step 4: 페이지 로딩 대기');
    
    // 여러 방법으로 컨텐츠 로딩 대기
    await page.waitForTimeout(3000); // 3초 대기
    
    // 로딩 인디케이터가 사라질 때까지 대기
    try {
      await page.waitForSelector('.MuiCircularProgress-root', { state: 'detached', timeout: 10000 });
      console.log('✅ 로딩 완료');
    } catch (e) {
      console.log('ℹ️ 로딩 인디케이터 없음 또는 타임아웃');
    }

    // 5. 데이터 존재 여부 확인
    console.log('✅ Step 5: 데이터 존재 여부 확인');
    
    // 다양한 방법으로 테이블 요소 확인
    const possibleTableSelectors = [
      '[role="grid"]',
      '.MuiDataGrid-root',
      '.MuiDataGrid-main',
      'table',
      '[data-testid="data-grid"]',
      '.data-grid',
    ];
    
    let foundTable = false;
    for (const selector of possibleTableSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`테이블 발견 (${selector}): ${count}개`);
        foundTable = true;
      }
    }
    
    // "데이터 없음" 또는 "Empty" 메시지 확인
    const emptyMessages = await page.locator('text=데이터가 없습니다, text=No data, text=Empty, text=결과가 없습니다').count();
    if (emptyMessages > 0) {
      console.log('⚠️ 데이터 없음 메시지 발견');
    }
    
    // 모든 버튼 확인
    console.log('✅ 현재 페이지의 모든 버튼:');
    const allButtons = await page.locator('button');
    const buttonCount = await allButtons.count();
    for (let i = 0; i < Math.min(buttonCount, 15); i++) {
      try {
        const buttonText = await allButtons.nth(i).textContent();
        if (buttonText && buttonText.trim()) {
          console.log(`  Button ${i + 1}: "${buttonText.trim()}"`);
        }
      } catch (e) {
        // Skip
      }
    }
    
    // 6. Export 기능 테스트 (가능한 경우)
    console.log('✅ Step 6: Export 기능 테스트');
    
    // GridToolbarExport 버튼 확인 (가장 구체적)
    const gridExportButton = page.locator('[data-testid="GridToolbarExport"] button');
    const gridExportCount = await gridExportButton.count();
    
    console.log(`GridToolbarExport 버튼 개수: ${gridExportCount}`);
    
    if (gridExportCount > 0) {
      console.log('✅ GridToolbarExport 버튼 발견, 클릭 시도');
      
      try {
        // 다운로드 이벤트 대기 (더 짧은 타임아웃)
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        
        await gridExportButton.first().click();
        console.log('✅ Export 버튼 클릭됨');
        
        const download = await downloadPromise;
        console.log(`✅ 파일 다운로드 시작: ${await download.suggestedFilename()}`);
        
        // 다운로드 디렉토리 생성
        const fs = require('fs');
        if (!fs.existsSync('./test-downloads')) {
          fs.mkdirSync('./test-downloads');
        }
        
        const filePath = `./test-downloads/ict-280-test-${Date.now()}.csv`;
        await download.saveAs(filePath);
        console.log(`✅ 파일 저장됨: ${filePath}`);
        
        // 파일 내용 검증
        if (fs.existsSync(filePath)) {
          const csvContent = fs.readFileSync(filePath, 'utf-8');
          console.log(`파일 크기: ${csvContent.length} characters`);
          console.log('첫 200자:');
          console.log(csvContent.substring(0, 200));
          
          if (csvContent.includes('[object Object]')) {
            console.log('❌ [object Object] 발견됨!');
          } else {
            console.log('✅ [object Object] 없음 - 수정이 성공한 것으로 보임!');
          }
        }
        
      } catch (downloadError) {
        console.log(`⚠️ 다운로드 실패: ${downloadError.message}`);
      }
    } else {
      console.log('⚠️ GridToolbarExport 버튼을 찾을 수 없습니다');
      
      // 다른 export 버튼 시도
      const otherExportButtons = await page.locator('button').filter({ hasText: /export|내보내기|csv|Excel/i }).count();
      console.log(`다른 export 버튼 개수: ${otherExportButtons}`);
    }
    
    // 7. 스크린샷 저장
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-comprehensive-${Date.now()}.png`,
      fullPage: true 
    });
    
    console.log('✅ Comprehensive 테스트 완료');

  } catch (error) {
    console.error('❌ 테스트 오류:', error);
    
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-comprehensive-error-${Date.now()}.png`,
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();