// manual-test-guide.js - 수동 테스트 가이드
const { chromium } = require('playwright');

async function manualTestGuide() {
  console.log('🔍 ICT-154 수동 테스트 가이드 시작...');
  console.log('📋 브라우저를 열어서 수동으로 테스트해보세요.');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 무한 리렌더링 감지
  let consoleErrors = [];
  let maxUpdateErrors = 0;
  
  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleErrors.push(text);
      
      if (text.includes('Maximum update depth exceeded')) {
        maxUpdateErrors++;
        console.log(`🔴 무한 리렌더링 에러 ${maxUpdateErrors}회: ${text.substring(0, 100)}...`);
      }
      
      if (text.includes('TestCaseSpreadsheet')) {
        console.log(`🔴 스프레드시트 에러: ${text.substring(0, 150)}...`);
      }
    }
  });
  
  try {
    console.log('🌐 브라우저 열림: http://localhost:3000');
    await page.goto('http://localhost:3000');
    
    console.log('\\n📋 수동 테스트 단계:');
    console.log('1. 로그인 (필요시)');
    console.log('2. 프로젝트 선택');
    console.log('3. 테스트케이스 탭으로 이동');
    console.log('4. 스프레드시트 모드 토글 버튼 찾기');
    console.log('5. 스프레드시트 모드 활성화');
    console.log('6. 셀에 값 입력하고 Enter');
    console.log('7. 값이 유지되는지 확인');
    console.log('8. 브라우저 콘솔에서 에러 확인 (F12)');
    
    console.log('\\n🔍 실시간 콘솔 모니터링 중...');
    console.log('❌ 발생한 에러들을 실시간으로 출력합니다.');
    console.log('✅ 에러가 없으면 수정이 성공한 것입니다.');
    
    // 2분간 모니터링
    await page.waitForTimeout(120000);
    
    console.log('\\n📊 최종 에러 요약:');
    console.log(`총 콘솔 에러/경고: ${consoleErrors.length}개`);
    console.log(`무한 리렌더링 에러: ${maxUpdateErrors}개`);
    
    if (maxUpdateErrors === 0) {
      console.log('✅ 무한 리렌더링 문제 해결됨!');
    } else {
      console.log('❌ 무한 리렌더링 문제 여전히 존재');
    }
    
    // 고유한 에러 타입들 표시
    const uniqueErrors = [...new Set(consoleErrors.map(err => err.substring(0, 100)))];
    if (uniqueErrors.length > 0) {
      console.log('\\n🔍 발견된 에러 유형들:');
      uniqueErrors.forEach((err, i) => {
        console.log(`${i + 1}. ${err}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    console.log('\\n🎬 2분 모니터링 완료. 브라우저는 계속 열려있습니다.');
    console.log('수동으로 브라우저를 닫으세요.');
  }
}

manualTestGuide().catch(console.error);