// test-spreadsheet-bug.js - ICT-154 스프레드시트 버그 테스트
const { chromium } = require('playwright');

async function testSpreadsheetBug() {
  console.log('🔍 ICT-154 스프레드시트 버그 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // 동작을 천천히 보기 위해
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 콘솔 에러 캐치
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push(msg.text());
      console.log(`❌ Console ${msg.type()}: ${msg.text()}`);
    }
  });
  
  try {
    // 1. 프론트엔드 페이지 접속
    console.log('📱 프론트엔드 페이지 접속...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📋 페이지 제목: ${title}`);
    
    // 2. 로그인 시도 (데모 계정으로)
    console.log('🔐 로그인 시도...');
    
    // 로그인 폼이 있는지 확인
    const loginForm = await page.locator('form').first();
    if (await loginForm.isVisible()) {
      await page.fill('input[name="username"], input[placeholder*="사용자"], input[type="text"]', 'admin');
      await page.fill('input[name="password"], input[placeholder*="비밀번호"], input[type="password"]', 'admin');
      await page.click('button[type="submit"], button:has-text("로그인")');
      await page.waitForTimeout(2000);
    }
    
    // 3. 스프레드시트 페이지로 이동
    console.log('📊 스프레드시트 페이지 탐색...');
    
    // 네비게이션 또는 메뉴에서 스프레드시트 관련 링크 찾기
    const spreadsheetLinks = [
      'text=스프레드시트',
      'text=테스트케이스',
      'text=일괄입력',
      '[href*="spreadsheet"]',
      'button:has-text("스프레드시트")'
    ];
    
    let found = false;
    for (const selector of spreadsheetLinks) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ 스프레드시트 링크 발견: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          found = true;
          break;
        }
      } catch (e) {
        // 해당 selector가 없으면 다음으로
      }
    }
    
    if (!found) {
      console.log('⚠️ 스프레드시트 링크를 찾을 수 없어서 URL로 직접 이동 시도...');
      // URL 패턴들 시도
      const urls = [
        'http://localhost:3000/spreadsheet',
        'http://localhost:3000/testcases/spreadsheet',
        'http://localhost:3000/projects/1/testcases/spreadsheet'
      ];
      
      for (const url of urls) {
        try {
          await page.goto(url);
          await page.waitForTimeout(2000);
          const hasSpreadsheet = await page.locator('[class*="spreadsheet"], table, .react-spreadsheet').first().isVisible();
          if (hasSpreadsheet) {
            console.log(`✅ 스프레드시트 페이지 발견: ${url}`);
            found = true;
            break;
          }
        } catch (e) {
          console.log(`❌ ${url} 접근 실패`);
        }
      }
    }
    
    // 4. 스프레드시트 셀 편집 테스트
    console.log('🔍 스프레드시트 셀 편집 테스트...');
    
    // 스프레드시트 컴포넌트 찾기
    const spreadsheetSelectors = [
      '.react-spreadsheet',
      '[class*="spreadsheet"]',
      'table',
      '[data-testid="spreadsheet"]',
      '.Spreadsheet'
    ];
    
    let spreadsheet = null;
    for (const selector of spreadsheetSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          spreadsheet = element;
          console.log(`✅ 스프레드시트 컴포넌트 발견: ${selector}`);
          break;
        }
      } catch (e) {
        // 다음 selector 시도
      }
    }
    
    if (spreadsheet) {
      // 첫 번째 셀에 값 입력 테스트
      console.log('📝 첫 번째 셀에 값 입력 테스트...');
      
      const cellSelectors = [
        'td:first-child input',
        'input[type="text"]:first-of-type', 
        '.cell input',
        'td:first-child',
        '[data-testid="cell-0-0"]'
      ];
      
      let inputSuccess = false;
      for (const cellSelector of cellSelectors) {
        try {
          const cell = page.locator(cellSelector).first();
          if (await cell.isVisible()) {
            console.log(`🎯 셀 발견: ${cellSelector}`);
            
            // 셀 클릭하고 값 입력
            await cell.click();
            await page.waitForTimeout(500);
            
            const testValue = 'ICT-154 테스트';
            await cell.fill(testValue);
            await page.waitForTimeout(500);
            
            // Enter 키 누르기
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
            
            // 값이 유지되는지 확인
            const currentValue = await cell.inputValue().catch(() => cell.textContent());
            console.log(`📋 입력한 값: "${testValue}"`);
            console.log(`📋 현재 값: "${currentValue}"`);
            
            if (currentValue && currentValue.includes(testValue)) {
              console.log('✅ 값이 정상적으로 유지됨!');
              inputSuccess = true;
            } else {
              console.log('❌ 값이 사라짐 - 버그 확인됨');
            }
            break;
          }
        } catch (e) {
          console.log(`❌ ${cellSelector} 테스트 실패: ${e.message}`);
        }
      }
      
      if (!inputSuccess) {
        console.log('⚠️ 셀 입력 테스트를 수행할 수 없음');
      }
    } else {
      console.log('❌ 스프레드시트 컴포넌트를 찾을 수 없음');
    }
    
    // 5. 콘솔 에러 보고
    console.log('\\n📊 콘솔 에러 요약:');
    if (consoleErrors.length === 0) {
      console.log('✅ 콘솔 에러 없음');
    } else {
      console.log(`❌ 총 ${consoleErrors.length}개의 콘솔 에러/경고 발견:`);
      consoleErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    // 6. 페이지 스크린샷 저장
    await page.screenshot({ path: 'spreadsheet-test-result.png', fullPage: true });
    console.log('📷 스크린샷 저장: spreadsheet-test-result.png');
    
    // 잠시 대기하여 브라우저에서 확인 가능
    console.log('🔍 5초 후 브라우저 종료...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await browser.close();
    console.log('🎬 테스트 완료');
  }
}

// 스크립트 실행
testSpreadsheetBug().catch(console.error);