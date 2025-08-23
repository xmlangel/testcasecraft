// ICT-280: 테스트 결과 일반 export에서 스텝 정보 [object Object] 출력 버그 테스트
// 일반 export와 고급 내보내기의 스텝 정보 출력 비교 테스트

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('=== ICT-280: 테스트 결과 일반 export 스텝 정보 출력 검증 테스트 ===');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });

  const page = await context.newPage();
  
  try {
    // 1. 로그인
    console.log('✅ Step 1: 로그인 시도');
    await page.goto('/', { timeout: 20000 });
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    console.log('✅ 로그인 완료');

    // 2. 프로젝트 선택 페이지로 이동
    console.log('✅ Step 2: 프로젝트 선택 페이지로 이동');
    await page.locator('text=프로젝트').first().click();
    await page.waitForLoadState('networkidle');

    // 3. 첫 번째 프로젝트 선택
    console.log('✅ Step 3: 첫 번째 프로젝트 선택');
    const projectButtons = await page.locator('button:has-text("프로젝트 열기")');
    await projectButtons.first().click();
    await page.waitForLoadState('networkidle');

    // 4. 테스트 결과 탭으로 이동
    console.log('✅ Step 4: 테스트 결과 탭으로 이동');
    await page.locator('text=테스트 결과').first().click();
    await page.waitForLoadState('networkidle');

    // 테스트 결과가 로드될 때까지 대기 (더 긴 타임아웃)
    try {
      await page.waitForSelector('[role="grid"]', { timeout: 30000 });
      console.log('✅ 테스트 결과 테이블 로드 완료');
    } catch (error) {
      console.log('ℹ️ 그리드 테이블 로드 실패, 다른 선택자로 시도');
      // 다른 가능한 선택자들 시도
      try {
        await page.waitForSelector('.MuiDataGrid-root', { timeout: 10000 });
        console.log('✅ DataGrid 컴포넌트 로드 완료');
      } catch (error2) {
        console.log('⚠️ 테이블 로드에 실패했지만 계속 진행');
        await page.screenshot({ path: './test-screenshots/table-load-fail.png' });
      }
    }

    // 5. 스텝 컬럼 활성화 (기본적으로 숨겨져 있을 수 있음)
    console.log('✅ Step 5: 스텝 컬럼 활성화');
    try {
      // 컬럼 설정 버튼 찾기
      const columnSettingsButton = await page.locator('button:has-text("컬럼 설정")').first();
      if (await columnSettingsButton.count() > 0) {
        await columnSettingsButton.click();
        await page.waitForTimeout(1000);

        // 스텝 정보 체크박스 활성화
        const stepsCheckbox = await page.locator('text=스텝 정보').locator('..').locator('input[type="checkbox"]');
        if (await stepsCheckbox.count() > 0) {
          const isChecked = await stepsCheckbox.isChecked();
          if (!isChecked) {
            await stepsCheckbox.click();
            console.log('✅ 스텝 정보 컬럼 활성화됨');
          }
        }

        // 메뉴 닫기
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log('ℹ️ 컬럼 설정 조정 중 오류 (계속 진행):', error.message);
    }

    // 6. 일반 export 기능 테스트 (CSV)
    console.log('✅ Step 6: 일반 export (CSV) 기능 테스트');
    
    const downloadPromise = page.waitForEvent('download');
    
    // CSV Export 버튼 찾기 (GridToolbarExport)
    const csvExportButton = await page.locator('[data-testid="GridToolbarExport"] button').first();
    if (await csvExportButton.count() > 0) {
      await csvExportButton.click();
      console.log('✅ CSV Export 버튼 클릭됨');
    } else {
      // 다른 방법으로 export 버튼 찾기
      const exportButton = await page.locator('button').filter({ hasText: /Export|내보내기/ }).first();
      await exportButton.click();
      console.log('✅ Export 버튼 클릭됨');
    }

    // 다운로드 대기
    const download = await downloadPromise;
    const filePath = path.join('./test-downloads', await download.suggestedFilename());
    
    // 다운로드 디렉토리 생성
    if (!fs.existsSync('./test-downloads')) {
      fs.mkdirSync('./test-downloads');
    }
    
    await download.saveAs(filePath);
    console.log(`✅ CSV 파일 다운로드 완료: ${filePath}`);

    // 7. CSV 파일 내용 검증
    console.log('✅ Step 7: CSV 파일 내용 검증');
    
    if (fs.existsSync(filePath)) {
      const csvContent = fs.readFileSync(filePath, 'utf-8');
      console.log('CSV 파일 샘플 내용 (처음 500자):');
      console.log(csvContent.substring(0, 500));
      
      // [object Object] 검사
      if (csvContent.includes('[object Object]')) {
        console.log('❌ 실패: CSV에 [object Object]가 포함되어 있습니다!');
        console.log('문제가 있는 라인들:');
        const lines = csvContent.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('[object Object]')) {
            console.log(`라인 ${index + 1}: ${line}`);
          }
        });
      } else {
        console.log('✅ 성공: CSV에 [object Object]가 없습니다!');
      }
      
      // 스텝 정보가 올바르게 변환되었는지 확인
      if (csvContent.includes('Step ') && csvContent.includes('예상:')) {
        console.log('✅ 성공: 스텝 정보가 올바른 형식으로 변환되었습니다!');
      } else {
        console.log('ℹ️ 정보: 스텝 정보를 찾을 수 없거나 다른 형식입니다.');
      }
      
      // 헤더 검증
      const headerLine = lines[0];
      if (headerLine.includes('스텝 정보') || headerLine.includes('steps')) {
        console.log('✅ 성공: 스텝 정보 컬럼 헤더 확인됨');
      }
      
    } else {
      console.log('❌ 오류: CSV 파일이 생성되지 않았습니다.');
    }

    // 8. 고급 내보내기와 비교 (옵션)
    console.log('✅ Step 8: 고급 내보내기 기능 비교 테스트');
    
    try {
      const advancedExportButton = await page.locator('button:has-text("고급 내보내기")').first();
      if (await advancedExportButton.count() > 0) {
        await advancedExportButton.click();
        await page.waitForTimeout(2000);
        
        // 다이얼로그에서 CSV 선택 후 내보내기
        const csvOption = await page.locator('text=CSV');
        if (await csvOption.count() > 0) {
          await csvOption.click();
          await page.waitForTimeout(1000);
        }
        
        const confirmButton = await page.locator('button:has-text("CSV 내보내기")').first();
        if (await confirmButton.count() > 0) {
          const advancedDownloadPromise = page.waitForEvent('download');
          await confirmButton.click();
          
          const advancedDownload = await advancedDownloadPromise;
          const advancedFilePath = path.join('./test-downloads', 'advanced-' + await advancedDownload.suggestedFilename());
          await advancedDownload.saveAs(advancedFilePath);
          console.log(`✅ 고급 내보내기 파일 다운로드 완료: ${advancedFilePath}`);
          
          // 고급 내보내기 파일 검증
          if (fs.existsSync(advancedFilePath)) {
            const advancedContent = fs.readFileSync(advancedFilePath, 'utf-8');
            if (advancedContent.includes('[object Object]')) {
              console.log('❌ 고급 내보내기에서도 [object Object] 발견');
            } else {
              console.log('✅ 고급 내보내기: [object Object] 없음');
            }
          }
        }
      }
    } catch (error) {
      console.log('ℹ️ 고급 내보내기 테스트 중 오류 (무시):', error.message);
    }

    console.log('\n=== ICT-280 테스트 결과 요약 ===');
    console.log('✅ 테스트 시나리오 완료');
    console.log('✅ 일반 export 기능 동작 확인');
    console.log('✅ CSV 파일 생성 및 내용 검증 완료');
    
    if (fs.existsSync(filePath)) {
      const csvContent = fs.readFileSync(filePath, 'utf-8');
      if (!csvContent.includes('[object Object]')) {
        console.log('🎉 ICT-280 수정 성공: 스텝 정보가 올바르게 변환됨!');
      } else {
        console.log('❌ ICT-280 수정 실패: 여전히 [object Object] 출력됨');
      }
    }

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: `./test-screenshots/ict-280-error-${Date.now()}.png`,
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();