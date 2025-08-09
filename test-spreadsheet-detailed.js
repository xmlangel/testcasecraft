// test-spreadsheet-detailed.js - ICT-154 스프레드시트 상세 테스트
const { chromium } = require('playwright');

async function testSpreadsheetDetailed() {
  console.log('🔍 ICT-154 스프레드시트 상세 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 무한 리렌더링 감지를 위한 카운터
  let consoleErrorCount = 0;
  let maxUpdateDepthErrors = 0;
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrorCount++;
      
      if (text.includes('Maximum update depth exceeded')) {
        maxUpdateDepthErrors++;
        console.log(`❌ 무한 리렌더링 에러 ${maxUpdateDepthErrors}회 감지!`);
      }
      
      if (text.includes('TestCaseSpreadsheet')) {
        console.log(`🔴 스프레드시트 관련 에러: ${text.substring(0, 200)}...`);
      }
      
      console.log(`⚠️ Console ${msg.type()}: ${text.substring(0, 100)}...`);
    }
  });
  
  try {
    // 1. 프론트엔드 접속
    console.log('📱 프론트엔드 접속...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 2. 로그인 (데모 모드라고 가정)
    console.log('🔐 로그인 시도...');
    const loginButton = page.locator('button:has-text("로그인"), button[type="submit"]').first();
    if (await loginButton.isVisible()) {
      // 관리자 계정으로 로그인 시도
      try {
        await page.fill('input[name="username"], input[type="text"]', 'admin');
        await page.fill('input[name="password"], input[type="password"]', 'admin');
        await loginButton.click();
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log('⚠️ 로그인 폼이 없거나 이미 로그인됨');
      }
    }
    
    // 3. 프로젝트 선택 또는 생성
    console.log('📁 프로젝트 탐색...');
    
    // 프로젝트 관련 버튼이나 링크 찾기
    const projectSelectors = [
      'button:has-text("프로젝트")',
      'a:has-text("프로젝트")',
      '[href*="project"]',
      'text=프로젝트',
      'button:has-text("Project")'
    ];
    
    let projectFound = false;
    for (const selector of projectSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ 프로젝트 링크 발견: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          projectFound = true;
          break;
        }
      } catch (e) {
        // 다음 selector 시도
      }
    }
    
    // 4. 테스트케이스 섹션으로 이동
    console.log('📋 테스트케이스 섹션 이동...');
    const testCaseSelectors = [
      'text=테스트케이스',
      'text=Test Case',
      'button:has-text("테스트케이스")',
      '[href*="testcase"]',
      'text=테스트케이스 관리'
    ];
    
    let testCaseFound = false;
    for (const selector of testCaseSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ 테스트케이스 링크 발견: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          testCaseFound = true;
          break;
        }
      } catch (e) {
        // 다음 selector 시도
      }
    }
    
    // 5. 스프레드시트 모드 토글 찾기
    console.log('🔄 스프레드시트 모드 토글 찾기...');
    
    const toggleSelectors = [
      'button:has-text("스프레드시트")',
      'button:has-text("Spreadsheet")',
      '[data-testid="mode-toggle"]',
      '.MuiToggleButton-root:has-text("스프레드시트")',
      'button[value="spreadsheet"]'
    ];
    
    let toggleFound = false;
    for (const selector of toggleSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ 스프레드시트 토글 발견: ${selector}`);
          await element.click();
          await page.waitForTimeout(3000); // 모드 전환 후 충분히 대기
          toggleFound = true;
          break;
        }
      } catch (e) {
        // 다음 selector 시도
      }
    }
    
    if (!toggleFound) {
      console.log('⚠️ 스프레드시트 토글을 찾을 수 없음. 전체 페이지에서 스프레드시트 컴포넌트 검색...');
    }
    
    // 6. 스프레드시트 컴포넌트 상세 분석
    console.log('🔍 스프레드시트 컴포넌트 분석...');
    
    // React Spreadsheet 컴포넌트의 다양한 selector들
    const spreadsheetSelectors = [
      '.react-spreadsheet',
      '.Spreadsheet',
      '[data-testid="spreadsheet"]',
      'div[class*="spreadsheet" i]',
      'table[class*="spreadsheet" i]',
      '.react-spreadsheet table',
      '[role="grid"]',
      'div:has(> table) table'
    ];
    
    let spreadsheet = null;
    for (const selector of spreadsheetSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          spreadsheet = element;
          console.log(`✅ 스프레드시트 컴포넌트 발견: ${selector}`);
          
          // 스프레드시트 구조 분석
          const tableInfo = await element.evaluate(el => {
            const rows = el.querySelectorAll('tr');
            const cells = el.querySelectorAll('td, th');
            return {
              tagName: el.tagName,
              className: el.className,
              rowCount: rows.length,
              cellCount: cells.length,
              hasInputs: el.querySelectorAll('input').length > 0
            };
          });
          console.log(`📊 스프레드시트 정보:`, tableInfo);
          break;
        }
      } catch (e) {
        // 다음 selector 시도
      }
    }
    
    if (spreadsheet) {
      console.log('📝 스프레드시트 셀 편집 상세 테스트...');
      
      // 스프레드시트의 첫 번째 편집 가능한 셀 찾기
      const cellSelectors = [
        'td:nth-child(1) input', // 첫 번째 컬럼의 input
        'td:nth-child(2) input', // 두 번째 컬럼의 input
        'input[type="text"]', // 모든 text input
        'td input', // 테이블 셀 안의 input
        'td:first-child', // 첫 번째 셀 (input이 없을 수도 있음)
      ];
      
      let testSuccess = false;
      
      for (const cellSelector of cellSelectors) {
        try {
          const cells = page.locator(cellSelector);
          const cellCount = await cells.count();
          
          if (cellCount > 0) {
            console.log(`🎯 ${cellCount}개의 셀 발견 (${cellSelector})`);
            
            // 첫 번째 셀 테스트
            const firstCell = cells.first();
            
            console.log('1️⃣ 첫 번째 셀 클릭...');
            await firstCell.click();
            await page.waitForTimeout(1000);
            
            console.log('2️⃣ 테스트 값 입력...');
            const testValue = 'ICT-154 테스트 데이터';
            
            // 기존 내용 클리어 후 입력
            await firstCell.selectText?.() || await firstCell.click();
            await page.keyboard.press('Control+a');
            await page.keyboard.type(testValue);
            await page.waitForTimeout(1000);
            
            console.log('3️⃣ Enter 키로 입력 완료...');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(2000);
            
            console.log('4️⃣ 값 유지 확인...');
            // 다시 셀을 클릭해서 값 확인
            await firstCell.click();
            await page.waitForTimeout(500);
            
            const currentValue = await firstCell.inputValue?.() || await firstCell.textContent();
            
            console.log(`📋 입력값: "${testValue}"`);
            console.log(`📋 현재값: "${currentValue}"`);
            
            if (currentValue && currentValue.includes(testValue.substring(0, 10))) {
              console.log('✅ 성공: 값이 정상적으로 유지됨!');
              testSuccess = true;
            } else {
              console.log('❌ 실패: 값이 사라짐 또는 다름');
            }
            
            // 추가 테스트: 다른 셀로 이동 후 다시 확인
            console.log('5️⃣ 다른 셀로 이동 후 재확인...');
            if (cellCount > 1) {
              await cells.nth(1).click();
              await page.waitForTimeout(500);
              await firstCell.click();
              await page.waitForTimeout(500);
              
              const afterMoveValue = await firstCell.inputValue?.() || await firstCell.textContent();
              console.log(`📋 이동 후 값: "${afterMoveValue}"`);
              
              if (afterMoveValue && afterMoveValue.includes(testValue.substring(0, 10))) {
                console.log('✅ 성공: 셀 이동 후에도 값 유지됨!');
              } else {
                console.log('❌ 실패: 셀 이동 후 값 손실됨');
                testSuccess = false;
              }
            }
            
            break;
          }
        } catch (e) {
          console.log(`❌ ${cellSelector} 테스트 실패: ${e.message}`);
        }
      }
      
      if (!testSuccess) {
        console.log('⚠️ 모든 셀 테스트 실패');
      }
      
    } else {
      console.log('❌ 스프레드시트 컴포넌트를 찾을 수 없음');
      
      // 페이지의 모든 요소 분석
      const pageElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const info = [];
        elements.forEach(el => {
          if (el.className && (el.className.includes('spreadsheet') || el.className.includes('Spreadsheet'))) {
            info.push({
              tagName: el.tagName,
              className: el.className,
              id: el.id,
              textContent: el.textContent?.substring(0, 50)
            });
          }
        });
        return info;
      });
      
      console.log('📋 페이지의 spreadsheet 관련 요소들:', pageElements);
    }
    
    // 7. 무한 리렌더링 에러 요약
    console.log('\\n📊 에러 분석 결과:');
    console.log(`총 콘솔 에러/경고: ${consoleErrorCount}개`);
    console.log(`무한 리렌더링 에러: ${maxUpdateDepthErrors}개`);
    
    if (maxUpdateDepthErrors === 0) {
      console.log('✅ 무한 리렌더링 문제 해결됨!');
    } else {
      console.log('❌ 무한 리렌더링 문제 여전히 존재');
    }
    
    // 8. 최종 스크린샷
    await page.screenshot({ path: 'spreadsheet-detailed-test.png', fullPage: true });
    console.log('📷 상세 테스트 스크린샷 저장: spreadsheet-detailed-test.png');
    
    console.log('\\n🔍 10초 대기 중... (브라우저에서 직접 확인 가능)');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
    console.log('🎬 상세 테스트 완료');
  }
}

testSpreadsheetDetailed().catch(console.error);