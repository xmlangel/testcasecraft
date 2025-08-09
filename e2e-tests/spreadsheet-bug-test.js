// ICT-156: 스프레드시트 중복 생성 버그 테스트
const { chromium } = require('playwright');

async function testSpreadsheetDuplication() {
  console.log('🧪 ICT-156: 스프레드시트 중복 생성 버그 테스트 시작');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500  // 디버깅을 위해 느리게 실행
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 애플리케이션 로그인
    console.log('1️⃣ 로그인 진행...');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // 로그인 완료 대기
    await page.waitForSelector('text=프로젝트 선택', { timeout: 10000 });
    console.log('✅ 로그인 성공');

    // 2. 프로젝트 선택
    console.log('2️⃣ 프로젝트 선택...');
    await page.click('div[role="button"]:has-text("테스트 프로젝트")');
    await page.waitForSelector('text=테스트케이스', { timeout: 5000 });
    console.log('✅ 프로젝트 선택 완료');

    // 3. 테스트케이스 섹션으로 이동
    console.log('3️⃣ 테스트케이스 섹션 이동...');
    await page.click('text=테스트케이스');
    await page.waitForSelector('text=스프레드시트 모드', { timeout: 5000 });
    console.log('✅ 테스트케이스 섹션 진입');

    // 4. 스프레드시트 모드로 전환
    console.log('4️⃣ 스프레드시트 모드 전환...');
    await page.click('text=스프레드시트 모드');
    await page.waitForSelector('text=테스트케이스 스프레드시트', { timeout: 5000 });
    console.log('✅ 스프레드시트 모드 활성화');

    // 5. 기존 테스트케이스 개수 확인
    console.log('5️⃣ 기존 테스트케이스 개수 확인...');
    const initialTestCases = await page.$$eval(
      'div[class*="MuiTreeItem"]:has(span:text("테스트케이스"))',
      elements => elements.length
    );
    console.log(`현재 테스트케이스 개수: ${initialTestCases}개`);

    // 6. 스프레드시트에 테스트 데이터 입력 (4개)
    console.log('6️⃣ 스프레드시트에 테스트 데이터 입력...');
    
    const testData = [
      { name: '테스트케이스1', description: '첫 번째 테스트케이스' },
      { name: '테스트케이스2', description: '두 번째 테스트케이스' },
      { name: '테스트케이스3', description: '세 번째 테스트케이스' },
      { name: '테스트케이스4', description: '네 번째 테스트케이스' }
    ];

    // 스프레드시트 셀 입력
    for (let i = 0; i < testData.length; i++) {
      // 이름 컬럼 (첫 번째 컬럼)
      await page.click(`table >> tbody >> tr >> nth=${i} >> td >> nth=0`);
      await page.fill(`table >> tbody >> tr >> nth=${i} >> td >> nth=0 >> input`, testData[i].name);
      
      // 설명 컬럼 (두 번째 컬럼)
      await page.click(`table >> tbody >> tr >> nth=${i} >> td >> nth=1`);
      await page.fill(`table >> tbody >> tr >> nth=${i} >> td >> nth=1 >> input`, testData[i].description);
    }
    
    console.log('✅ 4개 테스트케이스 데이터 입력 완료');

    // 7. 일괄 저장 실행
    console.log('7️⃣ 일괄 저장 실행...');
    
    // 콘솔 로그 모니터링 설정
    const consoleLogs = [];
    page.on('console', msg => {
      const logMsg = msg.text();
      consoleLogs.push(logMsg);
      if (logMsg.includes('저장할 유효한 테스트케이스') || 
          logMsg.includes('새 테스트케이스 추가') || 
          logMsg.includes('총') && logMsg.includes('개 테스트케이스 저장 완료')) {
        console.log(`📝 콘솔 로그: ${logMsg}`);
      }
    });

    await page.click('button:has-text("일괄 저장")');
    
    // 저장 완료 대기 (스낵바 메시지 확인)
    await page.waitForSelector('text=테스트케이스가 저장되었습니다', { timeout: 10000 });
    console.log('✅ 일괄 저장 완료');

    // 8. 저장 후 결과 확인
    console.log('8️⃣ 저장 결과 검증...');
    
    // 잠시 대기 (UI 업데이트 대기)
    await page.waitForTimeout(2000);
    
    // 폼 모드로 전환하여 테스트케이스 목록 확인
    await page.click('text=폼 모드');
    await page.waitForTimeout(1000);
    
    // 테스트케이스 개수 재확인
    const finalTestCases = await page.$$eval(
      'div[class*="MuiTreeItem"]:has(span:text("테스트케이스"))',
      elements => elements.length
    );

    console.log(`\n=== 결과 분석 ===`);
    console.log(`입력한 테스트케이스: 4개`);
    console.log(`저장 전 테스트케이스: ${initialTestCases}개`);
    console.log(`저장 후 테스트케이스: ${finalTestCases}개`);
    console.log(`실제 추가된 테스트케이스: ${finalTestCases - initialTestCases}개`);

    // 9. 버그 검증
    const expectedIncrease = 4;
    const actualIncrease = finalTestCases - initialTestCases;
    
    if (actualIncrease === expectedIncrease) {
      console.log('✅ 테스트 성공: 중복 생성 버그가 수정되었습니다!');
      console.log(`정확히 ${expectedIncrease}개의 테스트케이스가 추가되었습니다.`);
    } else if (actualIncrease === expectedIncrease * 4) {
      console.log('❌ 테스트 실패: 중복 생성 버그가 여전히 존재합니다!');
      console.log(`4배 중복 생성됨: ${actualIncrease}개 (예상: ${expectedIncrease}개)`);
    } else {
      console.log(`⚠️ 예상과 다른 결과: ${actualIncrease}개 추가 (예상: ${expectedIncrease}개)`);
    }

    // 10. 콘솔 로그 분석
    console.log('\n=== 콘솔 로그 분석 ===');
    const relevantLogs = consoleLogs.filter(log => 
      log.includes('저장할 유효한 테스트케이스') || 
      log.includes('새 테스트케이스 추가') || 
      log.includes('총') && log.includes('개 테스트케이스 저장 완료')
    );
    
    relevantLogs.forEach(log => console.log(`📝 ${log}`));

    return {
      success: actualIncrease === expectedIncrease,
      expectedIncrease,
      actualIncrease,
      logs: relevantLogs
    };

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
if (require.main === module) {
  testSpreadsheetDuplication()
    .then(result => {
      console.log('\n🎯 테스트 완료');
      console.log(`결과: ${result.success ? '성공' : '실패'}`);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('테스트 실패:', error);
      process.exit(1);
    });
}

module.exports = { testSpreadsheetDuplication };