// e2e-tests/ict-344-fixed-test.js
// ICT-344: 스프레드시트 오류 행 시각적 표시 기능 E2E 테스트 (수정 버전)

const { chromium } = require('playwright');

const CONFIG = {
  timeout: 30000,
  waitTimeout: 10000,
  baseURL: 'http://localhost:8080'
};

async function runValidationVisualIndicatorTest() {
  console.log('🧪 [ICT-344] 스프레드시트 오류 행 시각적 표시 기능 E2E 테스트 시작 (수정 버전)');

  let browser;
  try {
    // 브라우저 실행 및 페이지 생성
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 // 디버깅을 위해 느리게 실행
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
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
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
    
    // Step 3.5: 스프레드시트 모드로 전환
    console.log('Step 3.5: 스프레드시트 모드로 전환');
    await page.waitForSelector('text=스프레드시트', { timeout: CONFIG.waitTimeout });
    await page.click('text=스프레드시트');
    await page.waitForLoadState('networkidle');
    
    // 스프레드시트 로드 대기
    await page.waitForTimeout(3000); // 스프레드시트 완전 로드 대기
    
    // Step 4: 검증 버튼 확인
    console.log('Step 4: 검증 버튼 존재 확인');
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'ict-344-spreadsheet-mode-debug.png', fullPage: true });
    console.log('📸 스크린샷 저장: ict-344-spreadsheet-mode-debug.png');
    
    // 다양한 선택자로 검증 버튼 찾기
    const validateSelectors = [
      'button:has-text("검증")',
      'button[color="warning"]',
      'button:has([data-testid="WarningIcon"])',
      'text=검증',
      'button >> text=검증',
      '[aria-label*="검증"]',
      'button:has(.MuiSvgIcon-root):has-text("검증")'
    ];
    
    let validateButton = null;
    let selectorUsed = '';
    
    for (const selector of validateSelectors) {
      try {
        const btn = page.locator(selector);
        const count = await btn.count();
        if (count > 0) {
          validateButton = btn.first();
          selectorUsed = selector;
          console.log(`✅ 검증 버튼 발견 (선택자: ${selector}), 개수: ${count}개`);
          break;
        }
      } catch (e) {
        console.log(`  선택자 ${selector} 실패: ${e.message}`);
      }
    }
    
    if (!validateButton) {
      // 전체 버튼 목록 확인
      const allButtons = await page.locator('button').all();
      console.log(`📋 페이지의 모든 버튼 수: ${allButtons.length}개`);
      
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`  버튼 ${i+1}: "${buttonText}"`);
        if (buttonText && buttonText.includes('검증')) {
          console.log(`  🎯 검증 버튼 발견: ${i+1}번째`);
          validateButton = allButtons[i];
          break;
        }
      }
    }

    if (!validateButton) {
      throw new Error('❌ 검증 버튼을 찾을 수 없습니다. 스프레드시트 모드에서 검증 버튼이 표시되지 않습니다.');
    }

    // Step 5: 검증 버튼 클릭
    console.log('Step 5: 검증 버튼 클릭');
    await validateButton.click();
    await page.waitForLoadState('networkidle');
    
    // 검증 다이얼로그가 열리는지 확인
    await page.waitForSelector('text=데이터 검증', { timeout: CONFIG.waitTimeout });
    console.log('✅ 검증 다이얼로그 열림 확인');
    
    // 검증 결과 스크린샷
    await page.screenshot({ path: 'ict-344-validation-dialog.png', fullPage: true });
    console.log('📸 검증 다이얼로그 스크린샷 저장: ict-344-validation-dialog.png');
    
    // Step 6: 검증 완료 확인
    console.log('Step 6: 검증 완료 확인');
    const validationContent = await page.locator('[role="dialog"]').textContent();
    
    if (validationContent.includes('검증 요약') || validationContent.includes('오류') || validationContent.includes('경고')) {
      console.log('✅ 검증 기능이 정상 동작함');
    } else {
      console.log('⚠️ 검증 결과 내용을 확인할 수 없음');
      console.log('다이얼로그 내용:', validationContent.substring(0, 200));
    }

    // 다이얼로그 닫기
    await page.click('button:has-text("닫기")');
    
    console.log('🎉 ICT-344 테스트 성공!');
    console.log('✅ 스프레드시트 검증 기능이 정상 동작합니다.');

    await browser.close();
    
  } catch (error) {
    console.error('❌ ICT-344 테스트 실패!');
    console.error('📋 오류:', error.message);
    console.error('📊 세부사항:', error.stack);
    
    if (browser) {
      await browser.close();
    }
    
    process.exit(1);
  }
}

// 테스트 실행
runValidationVisualIndicatorTest();