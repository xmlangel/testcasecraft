// final-test.js - 최종 ICT-154 수정 검증
const { chromium } = require('playwright');

async function finalTest() {
  console.log('🔍 ICT-154 최종 수정 검증 테스트...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let consoleErrors = [];
  let maxUpdateErrors = 0;
  let testCaseSpreadsheetErrors = 0;
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push(text);
      
      if (text.includes('Maximum update depth exceeded')) {
        maxUpdateErrors++;
        if (maxUpdateErrors <= 5) { // 처음 5개만 출력
          console.log(`🔴 무한 리렌더링 에러 ${maxUpdateErrors}회`);
        }
      }
      
      if (text.includes('TestCaseSpreadsheet')) {
        testCaseSpreadsheetErrors++;
        if (testCaseSpreadsheetErrors <= 3) { // 처음 3개만 출력
          console.log(`🔴 스프레드시트 관련 에러 ${testCaseSpreadsheetErrors}회`);
        }
      }
    }
  });
  
  try {
    console.log('🌐 http://localhost:3000 접속...');
    await page.goto('http://localhost:3000');
    
    console.log('⏱️ 30초간 모니터링...');
    await page.waitForTimeout(30000);
    
    console.log('\\n📊 최종 검증 결과:');
    console.log(`총 콘솔 에러/경고: ${consoleErrors.length}개`);
    console.log(`무한 리렌더링 에러: ${maxUpdateErrors}개`);
    console.log(`스프레드시트 관련 에러: ${testCaseSpreadsheetErrors}개`);
    
    if (maxUpdateErrors === 0) {
      console.log('✅ SUCCESS: 무한 리렌더링 문제 완전 해결!');
    } else if (maxUpdateErrors < 10) {
      console.log('🟡 PARTIAL: 무한 리렌더링이 크게 감소했음');
    } else {
      console.log('❌ FAILED: 무한 리렌더링 문제 여전히 존재');
    }
    
    if (testCaseSpreadsheetErrors === 0) {
      console.log('✅ SUCCESS: TestCaseSpreadsheet 에러 없음!');
    } else {
      console.log(`❌ FAILED: TestCaseSpreadsheet 관련 에러 ${testCaseSpreadsheetErrors}개 발생`);
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
    console.log('🎬 최종 테스트 완료');
  }
}

finalTest().catch(console.error);