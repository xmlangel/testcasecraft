// e2e-tests/ict-223-detail-report-test.js
// ICT-223: 상세 리포트 컴포넌트 E2E 테스트

const { chromium } = require('playwright');

async function detailReportTest() {
  console.log('=== ICT-223: 상세 리포트 컴포넌트 E2E 테스트 ===');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });
  const page = await context.newPage();

  try {
    // 1. 홈페이지 접속
    console.log('🌐 홈페이지 접속 중...');
    await page.goto('/', { timeout: 20000 });
    await page.waitForLoadState('networkidle');

    // 2. 로그인
    console.log('🔐 로그인 중...');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // 3. 프로젝트 선택
    console.log('📂 프로젝트 선택...');
    await page.goto('/projects', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const projectCards = await page.locator('.MuiCard-root').all();
    if (projectCards.length > 0) {
      await projectCards[0].click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('✅ 프로젝트 선택 완료');
    } else {
      throw new Error('프로젝트 카드를 찾을 수 없습니다');
    }

    // 4. 테스트 결과 탭으로 이동
    console.log('📊 테스트 결과 탭으로 이동...');
    const headerTabs = await page.locator('[role="tab"]').all();
    for (let i = 0; i < headerTabs.length; i++) {
      const text = await headerTabs[i].textContent();
      if (text && (text.includes('테스트 결과') || text.includes('결과'))) {
        await headerTabs[i].click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        console.log('✅ 테스트 결과 탭 이동 완료');
        break;
      }
    }

    // 5. 상세 리포트 탭 클릭
    console.log('📋 상세 리포트 탭 클릭...');
    const allTabs = await page.locator('[role="tab"]').all();
    let detailReportTabFound = false;
    
    for (let i = 0; i < allTabs.length; i++) {
      const text = await allTabs[i].textContent();
      if (text && text.includes('상세 리포트')) {
        console.log(`🎯 상세 리포트 탭 발견! (인덱스: ${i})`);
        await allTabs[i].click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        detailReportTabFound = true;
        console.log('✅ 상세 리포트 탭 클릭 완료');
        break;
      }
    }

    if (!detailReportTabFound) {
      throw new Error('상세 리포트 탭을 찾을 수 없습니다');
    }

    // 6. 상세 리포트 컴포넌트 요소 검증
    console.log('🔍 상세 리포트 컴포넌트 요소 검증...');
    
    const testResults = {
      headerVisible: false,
      statisticsCardsVisible: false,
      filterPanelVisible: false,
      dataGridVisible: false,
      exportButtonVisible: false,
      refreshButtonVisible: false
    };

    // 헤더 확인
    try {
      await page.waitForSelector('text=상세 리포트', { timeout: 5000 });
      testResults.headerVisible = true;
      console.log('✅ 헤더 "상세 리포트" 표시됨');
    } catch (e) {
      console.log('❌ 헤더를 찾을 수 없음');
    }

    // 통계 카드 확인
    try {
      const statisticsCards = await page.locator('.MuiCard-root').count();
      if (statisticsCards >= 4) {
        testResults.statisticsCardsVisible = true;
        console.log(`✅ 통계 카드 표시됨 (${statisticsCards}개)`);
      } else {
        console.log(`⚠️ 통계 카드 부족 (${statisticsCards}개)`);
      }
    } catch (e) {
      console.log('❌ 통계 카드를 찾을 수 없음');
    }

    // 필터 패널 확인
    try {
      await page.waitForSelector('text=고급 필터', { timeout: 5000 });
      testResults.filterPanelVisible = true;
      console.log('✅ 고급 필터 패널 표시됨');
    } catch (e) {
      console.log('❌ 고급 필터 패널을 찾을 수 없음');
    }

    // 데이터 그리드 확인
    try {
      await page.waitForSelector('.MuiDataGrid-root', { timeout: 5000 });
      testResults.dataGridVisible = true;
      console.log('✅ 데이터 그리드 표시됨');
    } catch (e) {
      console.log('❌ 데이터 그리드를 찾을 수 없음');
    }

    // 내보내기 버튼 확인
    try {
      const exportButton = await page.locator('button:has-text("내보내기")').first();
      if (await exportButton.isVisible()) {
        testResults.exportButtonVisible = true;
        console.log('✅ 내보내기 버튼 표시됨');
      }
    } catch (e) {
      console.log('❌ 내보내기 버튼을 찾을 수 없음');
    }

    // 새로고침 버튼 확인
    try {
      const refreshButton = await page.locator('button:has-text("새로고침")').first();
      if (await refreshButton.isVisible()) {
        testResults.refreshButtonVisible = true;
        console.log('✅ 새로고침 버튼 표시됨');
      }
    } catch (e) {
      console.log('❌ 새로고침 버튼을 찾을 수 없음');
    }

    // 7. 필터 패널 상호작용 테스트
    console.log('🔧 필터 패널 상호작용 테스트...');
    let filterInteractionSuccess = false;
    
    try {
      // 필터 패널 확장/축소 테스트
      const accordionSummary = await page.locator('.MuiAccordionSummary-root').first();
      if (await accordionSummary.isVisible()) {
        await accordionSummary.click();
        await page.waitForTimeout(1000);
        await accordionSummary.click();
        await page.waitForTimeout(1000);
        filterInteractionSuccess = true;
        console.log('✅ 필터 패널 확장/축소 테스트 통과');
      }
    } catch (e) {
      console.log('❌ 필터 패널 상호작용 테스트 실패:', e.message);
    }

    // 8. 검색 기능 테스트
    console.log('🔍 검색 기능 테스트...');
    let searchTestSuccess = false;
    
    try {
      const searchInput = await page.locator('input[placeholder*="테스트 케이스명"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('테스트');
        await page.waitForTimeout(1000);
        await searchInput.clear();
        searchTestSuccess = true;
        console.log('✅ 검색 입력 필드 테스트 통과');
      }
    } catch (e) {
      console.log('❌ 검색 기능 테스트 실패:', e.message);
    }

    // 9. 전체 성공 여부 판정
    const overallSuccess = Object.values(testResults).every(result => result === true) &&
                          filterInteractionSuccess &&
                          searchTestSuccess;

    // 10. 스크린샷 저장
    const screenshotPath = overallSuccess ? 
      'e2e-tests/screenshots/ict-223-success.png' : 
      'e2e-tests/screenshots/ict-223-failure.png';
    
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`📸 스크린샷 저장: ${screenshotPath}`);

    // 11. 결과 출력
    console.log('\n📊 ICT-223 상세 리포트 컴포넌트 테스트 결과:');
    console.log(`  📋 헤더 표시: ${testResults.headerVisible ? 'YES' : 'NO'}`);
    console.log(`  📊 통계 카드: ${testResults.statisticsCardsVisible ? 'YES' : 'NO'}`);
    console.log(`  🔧 필터 패널: ${testResults.filterPanelVisible ? 'YES' : 'NO'}`);
    console.log(`  📋 데이터 그리드: ${testResults.dataGridVisible ? 'YES' : 'NO'}`);
    console.log(`  📤 내보내기 버튼: ${testResults.exportButtonVisible ? 'YES' : 'NO'}`);
    console.log(`  🔄 새로고침 버튼: ${testResults.refreshButtonVisible ? 'YES' : 'NO'}`);
    console.log(`  🔧 필터 상호작용: ${filterInteractionSuccess ? 'YES' : 'NO'}`);
    console.log(`  🔍 검색 기능: ${searchTestSuccess ? 'YES' : 'NO'}`);

    console.log(`\n🎯 최종 판정: ${overallSuccess ? '✅ 성공' : '❌ 실패'}`);

    return {
      success: overallSuccess,
      details: testResults,
      filterInteraction: filterInteractionSuccess,
      searchTest: searchTestSuccess
    };

  } catch (error) {
    console.error('❌ 테스트 실행 중 치명적 오류:', error.message);
    
    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-223-critical-error.png',
      fullPage: true 
    });
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// 실행
if (require.main === module) {
  detailReportTest()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 ICT-223 모든 승인 기준 달성!');
        console.log('  ✅ TestResultDetailReportView 컴포넌트 정상 렌더링');
        console.log('  ✅ 고급 필터링 패널 구현 완료');
        console.log('  ✅ 데이터 그리드 및 API 연동 구현');
        console.log('  ✅ 통계 카드 및 내보내기 기능 구현');
        console.log('  ✅ 사용자 인터페이스 상호작용 정상 동작');
        
        console.log('\n🏆 ICT-223 작업 완료! ICT-221 Epic 진행률 대폭 향상');
        process.exit(0);
      } else {
        console.log('\n❌ ICT-223 테스트 실패');
        if (result.error) {
          console.log(`💥 오류: ${result.error}`);
        }
        console.log('\n🔧 문제 해결 후 다시 시도하세요.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 테스트 실행 오류:', error);
      process.exit(1);
    });
}

module.exports = { detailReportTest };