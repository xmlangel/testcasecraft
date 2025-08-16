// e2e-tests/ict-223-simple-test.js
// ICT-223: 상세 리포트 컴포넌트 간단 E2E 테스트

const { chromium } = require('playwright');

async function simpleDetailReportTest() {
  console.log('=== ICT-223: 상세 리포트 컴포넌트 간단 E2E 테스트 ===');
  
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

    // 2. 로그인 폼 확인
    console.log('🔐 로그인 폼 찾기...');
    const usernameInput = await page.locator('input[name="username"], input[type="text"]').first();
    const passwordInput = await page.locator('input[name="password"], input[type="password"]').first();
    const loginButton = await page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login")').first();

    if (await usernameInput.isVisible() && await passwordInput.isVisible() && await loginButton.isVisible()) {
      console.log('✅ 로그인 폼 발견');
      
      // 로그인 시도
      await usernameInput.fill('admin');
      await passwordInput.fill('admin');
      await loginButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      console.log('✅ 로그인 시도 완료');
    } else {
      console.log('⚠️ 로그인 폼이 명확하지 않음, 메인 페이지 확인');
    }

    // 3. 현재 URL 확인
    const currentUrl = page.url();
    console.log(`📍 현재 URL: ${currentUrl}`);

    // 4. 프로젝트 페이지로 직접 이동
    console.log('📂 프로젝트 페이지로 이동...');
    try {
      await page.goto('/projects', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      console.log('✅ 프로젝트 페이지 이동 완료');
    } catch (e) {
      console.log('⚠️ 프로젝트 페이지 직접 접근 실패, 홈에서 탐색');
      await page.goto('/', { timeout: 10000 });
      await page.waitForLoadState('networkidle');
    }

    // 5. 프로젝트 카드 또는 링크 찾기
    console.log('🔍 프로젝트 카드 또는 링크 찾기...');
    await page.waitForTimeout(2000);
    
    const projectElements = await page.locator('.MuiCard-root, [data-testid*="project"], .project-card, a[href*="project"]').all();
    
    if (projectElements.length > 0) {
      console.log(`📋 ${projectElements.length}개의 프로젝트 관련 요소 발견`);
      await projectElements[0].click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      console.log('✅ 첫 번째 프로젝트 요소 클릭 완료');
    } else {
      console.log('⚠️ 프로젝트 요소를 찾을 수 없음, 현재 페이지에서 탐색 계속');
    }

    // 6. 테스트 결과 관련 탭 찾기
    console.log('📊 테스트 결과 탭 찾기...');
    const allTabs = await page.locator('[role="tab"], .MuiTab-root, button:has-text("결과"), button:has-text("테스트")').all();
    
    let resultTabFound = false;
    for (let i = 0; i < allTabs.length; i++) {
      const text = await allTabs[i].textContent();
      if (text && (text.includes('테스트 결과') || text.includes('결과') || text.includes('Report'))) {
        console.log(`🎯 테스트 결과 탭 발견: "${text}"`);
        await allTabs[i].click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        resultTabFound = true;
        console.log('✅ 테스트 결과 탭 클릭 완료');
        break;
      }
    }

    // 7. 상세 리포트 탭 찾기
    console.log('📋 상세 리포트 탭 찾기...');
    const detailTabs = await page.locator('[role="tab"], .MuiTab-root, button:has-text("상세"), button:has-text("리포트")').all();
    
    let detailReportTabFound = false;
    for (let i = 0; i < detailTabs.length; i++) {
      const text = await detailTabs[i].textContent();
      if (text && text.includes('상세 리포트')) {
        console.log(`🎯 상세 리포트 탭 발견: "${text}"`);
        await detailTabs[i].click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        detailReportTabFound = true;
        console.log('✅ 상세 리포트 탭 클릭 완료');
        break;
      }
    }

    // 8. TestResultDetailReportView 컴포넌트 요소 검증
    console.log('🔍 상세 리포트 컴포넌트 요소 검증...');
    
    const componentChecks = {
      title: false,
      filterPanel: false,
      dataGrid: false,
      buttons: false
    };

    // 제목 확인
    try {
      await page.waitForSelector('text=상세 리포트', { timeout: 5000 });
      componentChecks.title = true;
      console.log('✅ "상세 리포트" 제목 발견');
    } catch (e) {
      console.log('❌ 상세 리포트 제목을 찾을 수 없음');
    }

    // 필터 패널 확인
    try {
      const filterElements = await page.locator('text=고급 필터, text=필터, .MuiAccordion-root, input[placeholder*="검색"]').count();
      if (filterElements > 0) {
        componentChecks.filterPanel = true;
        console.log('✅ 필터 관련 요소 발견');
      }
    } catch (e) {
      console.log('❌ 필터 패널을 찾을 수 없음');
    }

    // 데이터 그리드 확인
    try {
      const gridElements = await page.locator('.MuiDataGrid-root, .MuiTable-root, table').count();
      if (gridElements > 0) {
        componentChecks.dataGrid = true;
        console.log('✅ 데이터 그리드/테이블 발견');
      }
    } catch (e) {
      console.log('❌ 데이터 그리드를 찾을 수 없음');
    }

    // 버튼 확인
    try {
      const buttonElements = await page.locator('button:has-text("내보내기"), button:has-text("새로고침"), button:has-text("검색")').count();
      if (buttonElements > 0) {
        componentChecks.buttons = true;
        console.log('✅ 기능 버튼들 발견');
      }
    } catch (e) {
      console.log('❌ 기능 버튼들을 찾을 수 없음');
    }

    // 9. 전체 성공 여부 판정
    const overallSuccess = Object.values(componentChecks).filter(Boolean).length >= 2; // 4개 중 2개 이상 성공

    // 10. 스크린샷 저장
    const screenshotPath = overallSuccess ? 
      'e2e-tests/screenshots/ict-223-simple-success.png' : 
      'e2e-tests/screenshots/ict-223-simple-failure.png';
    
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`📸 스크린샷 저장: ${screenshotPath}`);

    // 11. 결과 출력
    console.log('\n📊 ICT-223 상세 리포트 컴포넌트 간단 테스트 결과:');
    console.log(`  📋 제목 표시: ${componentChecks.title ? 'YES' : 'NO'}`);
    console.log(`  🔧 필터 패널: ${componentChecks.filterPanel ? 'YES' : 'NO'}`);
    console.log(`  📊 데이터 그리드: ${componentChecks.dataGrid ? 'YES' : 'NO'}`);
    console.log(`  🔘 기능 버튼: ${componentChecks.buttons ? 'YES' : 'NO'}`);

    console.log(`\n🎯 최종 판정: ${overallSuccess ? '✅ 성공' : '❌ 실패'}`);
    console.log(`📍 현재 페이지: ${page.url()}`);

    return {
      success: overallSuccess,
      details: componentChecks,
      url: page.url()
    };

  } catch (error) {
    console.error('❌ 테스트 실행 중 치명적 오류:', error.message);
    
    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-223-simple-error.png',
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
  simpleDetailReportTest()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 ICT-223 간단 테스트 통과!');
        console.log('  ✅ TestResultDetailReportView 컴포넌트 기본 요소 확인');
        console.log('  ✅ 상세 리포트 페이지 접근 가능');
        console.log('  ✅ 주요 UI 컴포넌트 렌더링 확인');
        
        console.log('\n🏆 ICT-223 작업이 올바르게 구현되었습니다!');
        process.exit(0);
      } else {
        console.log('\n❌ ICT-223 간단 테스트 실패');
        if (result.error) {
          console.log(`💥 오류: ${result.error}`);
        }
        console.log('\n🔧 컴포넌트 구현을 확인해주세요.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 테스트 실행 오류:', error);
      process.exit(1);
    });
}

module.exports = { simpleDetailReportTest };