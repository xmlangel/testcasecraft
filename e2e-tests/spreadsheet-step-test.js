// 스프레드시트 스텝 추가 기능 테스트
const { chromium } = require('playwright');

async function testSpreadsheetStepManagement() {
  console.log('🧪 스프레드시트 스텝 추가 기능 테스트 시작');
  
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
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 로그인 완료 대기 (충분한 시간 대기)
    await page.waitForTimeout(5000); // 충분한 로딩 시간 대기
    
    // 로그인 후 프로젝트 선택 화면 대기 (여러 셀렉터 시도)
    try {
      await page.waitForSelector('text=프로젝트 선택', { timeout: 10000 });
    } catch (error) {
      try {
        await page.waitForSelector('[role="button"]:has-text("프로젝트")', { timeout: 10000 });
      } catch (error2) {
        // 프로젝트 카드들이 보이는지 확인
        await page.waitForSelector('div[role="button"]', { timeout: 10000 });
      }
    }
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

    // 5. 기본 스텝 수 확인
    console.log('5️⃣ 기본 스텝 수 확인...');
    const initialStepChip = await page.textContent('span:text-matches("\\d+개 스텝")');
    const initialStepCount = parseInt(initialStepChip.match(/(\d+)개 스텝/)[1]);
    console.log(`현재 스텝 수: ${initialStepCount}개`);

    // 6. 스텝 관리 메뉴 열기
    console.log('6️⃣ 스텝 관리 메뉴 열기...');
    await page.click('button[aria-label="스텝 관리"]');
    await page.waitForSelector('text=스텝 추가', { timeout: 3000 });
    console.log('✅ 스텝 관리 메뉴 열림');

    // 7. 스텝 추가 테스트
    console.log('7️⃣ 스텝 추가 테스트...');
    await page.click('text=스텝 추가');
    
    // 스텝 수 변경 확인
    await page.waitForTimeout(1000);
    const updatedStepChip = await page.textContent('span:text-matches("\\d+개 스텝")');
    const updatedStepCount = parseInt(updatedStepChip.match(/(\d+)개 스텝/)[1]);
    
    console.log(`스텝 추가 후 스텝 수: ${updatedStepCount}개`);
    
    if (updatedStepCount === initialStepCount + 1) {
      console.log('✅ 스텝 추가 성공');
    } else {
      console.log('❌ 스텝 추가 실패');
    }

    // 8. 컬럼 헤더 확인
    console.log('8️⃣ 컬럼 헤더 확인...');
    const columnHeaders = await page.$$eval('table thead tr th', headers => 
      headers.map(th => th.textContent.trim())
    );
    
    console.log('컬럼 헤더:', columnHeaders);
    
    // Step과 Expected 컬럼이 추가되었는지 확인
    const stepColumns = columnHeaders.filter(header => 
      header.includes('Step') || header.includes('Expected')
    );
    
    console.log(`Step 관련 컬럼 수: ${stepColumns.length}개`);
    console.log('Step 컬럼들:', stepColumns);

    // 9. 스텝 제거 테스트
    console.log('9️⃣ 스텝 제거 테스트...');
    await page.click('button[aria-label="스텝 관리"]');
    await page.waitForSelector('text=스텝 제거', { timeout: 3000 });
    await page.click('text=스텝 제거');
    
    // 스텝 수 복원 확인
    await page.waitForTimeout(1000);
    const restoredStepChip = await page.textContent('span:text-matches("\\d+개 스텝")');
    const restoredStepCount = parseInt(restoredStepChip.match(/(\d+)개 스텝/)[1]);
    
    console.log(`스텝 제거 후 스텝 수: ${restoredStepCount}개`);
    
    if (restoredStepCount === initialStepCount) {
      console.log('✅ 스텝 제거 성공');
    } else {
      console.log('❌ 스텝 제거 실패');
    }

    // 10. 직접 설정 테스트
    console.log('🔟 스텝 수 직접 설정 테스트...');
    await page.click('button[aria-label="스텝 관리"]');
    await page.waitForSelector('text=스텝 수 직접 설정', { timeout: 3000 });
    await page.click('text=스텝 수 직접 설정');
    
    // 다이얼로그가 열렸는지 확인
    await page.waitForSelector('text=스텝 수 설정', { timeout: 3000 });
    console.log('✅ 스텝 설정 다이얼로그 열림');
    
    // 스텝 수를 5로 설정
    const targetStepCount = 5;
    await page.fill('input[label="스텝 수"]', targetStepCount.toString());
    await page.click('button:has-text("적용")');
    
    // 설정 적용 확인
    await page.waitForTimeout(1000);
    const finalStepChip = await page.textContent('span:text-matches("\\d+개 스텝")');
    const finalStepCount = parseInt(finalStepChip.match(/(\d+)개 스텝/)[1]);
    
    console.log(`최종 스텝 수: ${finalStepCount}개`);
    
    if (finalStepCount === targetStepCount) {
      console.log('✅ 스텝 수 직접 설정 성공');
    } else {
      console.log('❌ 스텝 수 직접 설정 실패');
    }

    // 11. 스텝 데이터 입력 테스트
    console.log('1️⃣1️⃣ 스텝 데이터 입력 테스트...');
    
    // 첫 번째 행에 테스트케이스 기본 정보 입력
    await page.click('table tbody tr:nth-child(1) td:nth-child(1)');
    await page.fill('table tbody tr:nth-child(1) td:nth-child(1) input', '스텝 테스트케이스');
    
    await page.click('table tbody tr:nth-child(1) td:nth-child(2)');
    await page.fill('table tbody tr:nth-child(1) td:nth-child(2) input', '스텝 기능을 테스트하는 케이스');
    
    // Step 1 입력
    const step1DescColumn = 5; // 기본 4개 컬럼 + Step 1 Description
    const step1ExpectedColumn = 6; // 기본 4개 컬럼 + Step 1 Expected
    
    await page.click(`table tbody tr:nth-child(1) td:nth-child(${step1DescColumn})`);
    await page.fill(`table tbody tr:nth-child(1) td:nth-child(${step1DescColumn}) input`, '첫 번째 스텝 실행');
    
    await page.click(`table tbody tr:nth-child(1) td:nth-child(${step1ExpectedColumn})`);
    await page.fill(`table tbody tr:nth-child(1) td:nth-child(${step1ExpectedColumn}) input`, '첫 번째 스텝 결과');
    
    console.log('✅ 스텝 데이터 입력 완료');

    // 12. 일괄 저장 테스트
    console.log('1️⃣2️⃣ 스텝 데이터 저장 테스트...');
    await page.click('button:has-text("일괄 저장")');
    
    // 저장 완료 대기
    await page.waitForSelector('text=테스트케이스가 저장되었습니다', { timeout: 10000 });
    console.log('✅ 스텝 데이터 저장 완료');

    // 13. 저장된 데이터 확인
    console.log('1️⃣3️⃣ 저장된 스텝 데이터 확인...');
    
    // 폼 모드로 전환하여 저장된 데이터 확인
    await page.click('text=폼 모드');
    await page.waitForTimeout(1000);
    
    // 새로 생성된 테스트케이스 클릭
    await page.click('span:has-text("스텝 테스트케이스")');
    await page.waitForTimeout(1000);
    
    // 스텝 섹션 확인
    const stepElements = await page.$$('div:has-text("Step")');
    console.log(`저장된 스텝 수: ${stepElements.length}개`);
    
    if (stepElements.length > 0) {
      console.log('✅ 스텝 데이터가 올바르게 저장됨');
    } else {
      console.log('❌ 스텝 데이터 저장 실패');
    }

    // 14. 테스트 결과 종합
    console.log('\n=== 스텝 추가 기능 테스트 결과 ===');
    
    const results = {
      stepAddition: updatedStepCount === initialStepCount + 1,
      stepRemoval: restoredStepCount === initialStepCount,
      directSetting: finalStepCount === targetStepCount,
      dataInput: stepElements.length > 0
    };
    
    const allPassed = Object.values(results).every(result => result);
    
    console.log('스텝 추가:', results.stepAddition ? '✅ 성공' : '❌ 실패');
    console.log('스텝 제거:', results.stepRemoval ? '✅ 성공' : '❌ 실패');
    console.log('직접 설정:', results.directSetting ? '✅ 성공' : '❌ 실패');
    console.log('데이터 입력/저장:', results.dataInput ? '✅ 성공' : '❌ 실패');
    console.log('\n전체 결과:', allPassed ? '✅ 모든 테스트 통과' : '❌ 일부 테스트 실패');

    return {
      success: allPassed,
      details: results,
      initialStepCount,
      finalStepCount
    };

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    
    // 스크린샷 캡처
    await page.screenshot({ 
      path: 'spreadsheet-step-test-error.png',
      fullPage: true
    });
    console.log('📸 오류 스크린샷 저장: spreadsheet-step-test-error.png');
    
    throw error;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
if (require.main === module) {
  testSpreadsheetStepManagement()
    .then(result => {
      console.log('\n🎯 스텝 추가 기능 테스트 완료');
      console.log(`결과: ${result.success ? '성공' : '실패'}`);
      
      if (!result.success) {
        console.log('실패한 기능들:');
        Object.entries(result.details).forEach(([key, passed]) => {
          if (!passed) {
            console.log(`- ${key}: 실패`);
          }
        });
      }
      
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('테스트 실패:', error);
      process.exit(1);
    });
}

module.exports = { testSpreadsheetStepManagement };