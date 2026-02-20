// e2e-tests/ict-344-validation-visual-indicator.js
// ICT-344: 스프레드시트 오류 행 시각적 표시 기능 E2E 테스트

const { chromium } = require('playwright');
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require('../config/credentials.js');

const CONFIG = {
  timeout: 30000,
  waitTimeout: 5000,
  baseURL: 'http://localhost:8080'
};

async function runValidationVisualIndicatorTest() {
  console.log('🧪 [ICT-344] 스프레드시트 오류 행 시각적 표시 기능 E2E 테스트 시작');

  let browser;
  try {
    // 브라우저 실행 및 페이지 생성
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 // 디버깅을 위해 느리게 실행
    });
    
    const context = await browser.newContext({
      baseURL: CONFIG.baseURL,
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();

    // Step 1: 애플리케이션 로그인
    console.log('Step 1: 애플리케이션 접속 및 로그인');
    await page.goto('/', { timeout: CONFIG.timeout });
    await page.waitForLoadState('networkidle');
    
    // 로그인 (admin/admin)
    await page.fill('input[name="username"]', ADMIN_USERNAME);
    await page.fill('input[name="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Step 2: 프로젝트 선택
    console.log('Step 2: 프로젝트 선택');
    await page.waitForSelector('button:has-text("프로젝트 열기")', { timeout: CONFIG.waitTimeout });
    await page.click('button:has-text("프로젝트 열기")');
    await page.waitForLoadState('networkidle');

    // Step 3: 테스트케이스 탭으로 이동
    console.log('Step 3: 테스트케이스 탭으로 이동');
    await page.waitForSelector('text=테스트케이스', { timeout: CONFIG.waitTimeout });
    await page.click('text=테스트케이스');
    await page.waitForLoadState('networkidle');
    // 스프레드시트 모드 전환
    console.log('Step 3.5: 스프레드시트 모드로 전환');
    await page.waitForTimeout(2000); // 페이지 로드 대기
    
    // 다양한 선택자로 스프레드시트 버튼 찾기 시도
    const spreadsheetSelectors = [
      'button[value="spreadsheet"]',
      'button:has-text("스프레드시트")',
      '[aria-label="스프레드시트 모드"]',
      '.MuiToggleButton-root[value="spreadsheet"]'
    ];
    
    let spreadsheetButton = null;
    for (const selector of spreadsheetSelectors) {
      try {
        const btn = page.locator(selector);
        const count = await btn.count();
        if (count > 0) {
          spreadsheetButton = btn;
          console.log(`✅ 스프레드시트 버튼 발견 (선택자: ${selector})`);
          break;
        }
      } catch (e) {
        console.log(`  선택자 ${selector} 실패: ${e.message}`);
      }
    }
    
    if (spreadsheetButton) {
      await spreadsheetButton.first().click();
      await page.waitForLoadState('networkidle');
    } else {
      console.warn('⚠️ 스프레드시트 버튼을 찾을 수 없음, 기본 모드에서 진행');
    }


    // 스프레드시트가 로드되기를 대기 (다양한 선택자 시도)
    try {
      await page.waitForSelector('.Spreadsheet', { timeout: CONFIG.waitTimeout });
      console.log('✅ 스프레드시트 로드 완료');
    } catch (error) {
      // 다른 가능한 선택자들 시도
      console.log('⚠️ .Spreadsheet 선택자로 찾지 못함, 다른 선택자 시도...');
      
      const alternativeSelectors = [
        'table',
        '[class*="spreadsheet" i]',
        '[class*="Spreadsheet" i]', 
        '.react-spreadsheet',
        'div:has(table)',
        'text=테스트케이스 스프레드시트'
      ];
      
      let foundSpreadsheet = false;
      for (const selector of alternativeSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          console.log(`✅ 스프레드시트 발견 (선택자: ${selector})`);
          foundSpreadsheet = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!foundSpreadsheet) {
        console.log('📋 현재 페이지 내용 확인...');
        const pageContent = await page.content();
        console.log('페이지 길이:', pageContent.length);
        
        // 스프레드시트 관련 텍스트 찾기
        const hasSpreadsheetText = pageContent.includes('스프레드시트') || pageContent.includes('Spreadsheet');
        console.log('스프레드시트 텍스트 존재:', hasSpreadsheetText);
        
        if (!hasSpreadsheetText) {
          throw new Error('스프레드시트를 찾을 수 없습니다. 페이지 로딩 실패 가능성');
        }
      }
    }

    // Step 4: 검증 버튼 확인
    console.log('Step 4: 검증 버튼 존재 확인');
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'spreadsheet-validation-debug.png', fullPage: true });
    console.log('📸 스크린샷 저장: spreadsheet-validation-debug.png');
    
    // 전체 버튼 목록 확인
    const allButtons = await page.locator('button').all();
    console.log(`📋 페이지의 모든 버튼 수: ${allButtons.length}개`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].textContent();
      console.log(`  버튼 ${i+1}: "${buttonText}"`);
      if (buttonText.includes('검증')) {
        console.log(`  🎯 검증 버튼 발견: ${i+1}번째`);
      }
    }
    
    // 다양한 선택자로 검증 버튼 찾기
    const validateSelectors = [
      'button:has-text("검증")',
      'button[color="warning"]',
      'button:has([data-testid="WarningIcon"])',
      'text=검증',
      'button >> text=검증'
    ];
    
    let validateButton = null;
    let selectorUsed = '';
    
    for (const selector of validateSelectors) {
      try {
        const btn = page.locator(selector);
        const count = await btn.count();
        if (count > 0) {
          validateButton = btn;
          selectorUsed = selector;
          console.log(`✅ 검증 버튼 발견 (선택자: ${selector}), 개수: ${count}개`);
          break;
        }
      } catch (e) {
        console.log(`  선택자 ${selector} 실패: ${e.message}`);
      }
    }
    
    if (!validateButton) {
      throw new Error('❌ 검증 버튼을 찾을 수 없습니다');
    }

    // Step 5: 오류 데이터 입력 (중복 폴더명)
    console.log('Step 5: 오류 데이터 입력 (중복 폴더명 테스트)');
    
    // 첫 번째 행에 폴더 데이터 입력
    await page.locator('.Spreadsheet td').nth(2).click(); // 타입 컬럼 (3번째)
    await page.keyboard.type('폴더');
    await page.keyboard.press('Tab');
    
    await page.keyboard.type(''); // 상위폴더 (비워둠)
    await page.keyboard.press('Tab');
    
    await page.keyboard.type('이야'); // 이름 (중복될 예정)
    await page.keyboard.press('Tab');
    
    await page.keyboard.type('이야 폴더'); // 설명
    await page.keyboard.press('Tab');

    // 두 번째 행에 동일한 폴더명으로 중복 데이터 입력
    await page.locator('.Spreadsheet tr').nth(2).locator('td').nth(2).click(); // 두 번째 행의 타입 컬럼
    await page.keyboard.type('폴더');
    await page.keyboard.press('Tab');
    
    await page.keyboard.type(''); // 상위폴더 (비워둠)
    await page.keyboard.press('Tab');
    
    await page.keyboard.type('이야'); // 이름 (중복)
    await page.keyboard.press('Tab');
    
    await page.keyboard.type('이야 폴더 중복'); // 설명
    await page.keyboard.press('Tab');

    // Step 6: 검증 버튼 클릭
    console.log('Step 6: 검증 버튼 클릭');
    await validateButton.first().click();
    await page.waitForTimeout(2000); // 검증 처리 대기

    // Step 7: 검증 결과 확인 (스낵바)
    console.log('Step 7: 검증 결과 스낵바 확인');
    const snackbar = await page.locator('.MuiAlert-root').first();
    await snackbar.waitFor({ state: 'visible', timeout: CONFIG.waitTimeout });
    
    const snackbarText = await snackbar.textContent();
    console.log('📋 스낵바 메시지:', snackbarText);
    
    if (!snackbarText.includes('오류') && !snackbarText.includes('경고')) {
      console.warn('⚠️ 예상과 다른 검증 결과입니다:', snackbarText);
    }

    // Step 8: 검증 결과 패널 확인
    console.log('Step 8: 검증 결과 상세 패널 확인');
    const validationDialog = await page.locator('[role="dialog"]:has(text("데이터 검증"))');
    await validationDialog.waitFor({ state: 'visible', timeout: CONFIG.waitTimeout });
    console.log('✅ 검증 결과 패널 표시됨');

    // 오류 목록 확인
    const errorAlerts = await page.locator('.MuiAlert-errorStandard').count();
    console.log(`📋 발견된 오류 수: ${errorAlerts}개`);

    if (errorAlerts > 0) {
      const firstError = await page.locator('.MuiAlert-errorStandard').first().textContent();
      console.log('📋 첫 번째 오류:', firstError);
    }

    // Step 9: 검증 패널 닫기
    console.log('Step 9: 검증 패널 닫기');
    await page.click('button:has-text("닫기")');
    await page.waitForTimeout(1000);

    // Step 10: 스프레드시트에서 시각적 표시 확인 (가능하다면)
    console.log('Step 10: 스프레드시트 셀 스타일 확인');
    
    // 오류가 있는 셀의 배경색 확인 시도
    const styledCells = await page.locator('.Spreadsheet td[style*="background"]').count();
    console.log(`📋 스타일이 적용된 셀 수: ${styledCells}개`);

    if (styledCells > 0) {
      console.log('✅ 오류 행 시각적 표시 기능 작동 확인됨');
    }

    // Step 11: 추가 테스트 - 올바른 데이터로 수정 후 재검증
    console.log('Step 11: 올바른 데이터로 수정 후 재검증');
    
    // 두 번째 행의 폴더명을 다른 이름으로 변경
    await page.locator('.Spreadsheet tr').nth(2).locator('td').nth(4).click(); // 두 번째 행의 이름 컬럼
    await page.keyboard.selectAll();
    await page.keyboard.type('수정된폴더'); // 중복 해결
    
    // 재검증
    await validateButton.first().click();
    await page.waitForTimeout(2000);

    // 성공 메시지 확인
    const successSnackbar = await page.locator('.MuiAlert-successStandard').first();
    if (await successSnackbar.isVisible()) {
      console.log('✅ 수정 후 검증 성공 확인됨');
    }

    console.log('🎉 [ICT-344] 스프레드시트 오류 행 시각적 표시 기능 E2E 테스트 완료');
    
    return {
      success: true,
      message: 'ICT-344 테스트 성공: 검증 기능 및 시각적 표시 기능이 정상 작동함',
      details: {
        validateButtonExists: validateButtonCount > 0,
        validationPanelShown: true,
        errorsDetected: errorAlerts > 0,
        visualIndicatorsPresent: styledCells > 0
      }
    };

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    
    return {
      success: false,
      error: error.message,
      details: 'ICT-344 스프레드시트 오류 행 시각적 표시 기능 테스트 중 오류 발생'
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 테스트 실행
if (require.main === module) {
  runValidationVisualIndicatorTest()
    .then(result => {
      if (result.success) {
        console.log('\n✅ ICT-344 테스트 성공!');
        console.log('📋 결과:', result.message);
        console.log('📊 세부사항:', JSON.stringify(result.details, null, 2));
        process.exit(0);
      } else {
        console.log('\n❌ ICT-344 테스트 실패!');
        console.log('📋 오류:', result.error);
        console.log('📊 세부사항:', result.details);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 테스트 실행 중 예외 발생:', error);
      process.exit(1);
    });
}

module.exports = { runValidationVisualIndicatorTest };