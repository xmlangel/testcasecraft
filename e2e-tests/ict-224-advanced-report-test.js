// ICT-224: 테스트 결과 상세 리포트 고급 기능 E2E 테스트
// 필터 프리셋, JIRA 연동 리포트, 트렌드 분석 기능 검증

const { chromium, firefox, webkit } = require('playwright');

async function testAdvancedReportFeatures() {
  console.log('🚀 ICT-224: 고급 상세 리포트 기능 E2E 테스트 시작');
  
  const browsers = [
    { name: 'Chromium', browserType: chromium },
    { name: 'Firefox', browserType: firefox },
    { name: 'WebKit', browserType: webkit }
  ];

  for (const { name, browserType } of browsers) {
    console.log(`\n📱 ${name} 브라우저 테스트 시작`);
    
    const browser = await browserType.launch({ 
      headless: false,
      slowMo: 1000
    });
    
    try {
      const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
      });
      
      const page = await context.newPage();
      
      // 1. 애플리케이션 접속 및 로그인
      await testLogin(page, name);
      
      // 2. 테스트 결과 페이지 접근
      await testNavigateToTestResults(page, name);
      
      // 3. 상세 리포트 탭 테스트
      await testDetailReportTab(page, name);
      
      // 4. 필터 프리셋 관리 테스트
      await testFilterPresetManager(page, name);
      
      // 5. 고급 검색 및 필터링 테스트
      await testAdvancedFiltering(page, name);
      
      // 6. JIRA 연동 리포트 테스트
      await testJiraIntegrationReport(page, name);
      
      // 7. 트렌드 분석 테스트
      await testTrendAnalysis(page, name);
      
      // 8. 성능 최적화 기능 테스트
      await testPerformanceOptimization(page, name);
      
      console.log(`✅ ${name} 브라우저 테스트 완료`);
      
    } catch (error) {
      console.error(`❌ ${name} 브라우저 테스트 실패:`, error.message);
      throw error;
    } finally {
      await browser.close();
    }
  }
}

async function testLogin(page, browserName) {
  console.log(`  🔑 [${browserName}] 로그인 테스트`);
  
  await page.goto('/', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  
  // 로그인 폼 확인
  const usernameField = page.locator('input[name="username"], input[type="text"]').first();
  const passwordField = page.locator('input[name="password"], input[type="password"]').first();
  const loginButton = page.locator('button:has-text("로그인"), button[type="submit"]').first();
  
  await usernameField.fill('admin');
  await passwordField.fill('admin');
  await loginButton.click();
  
  // 로그인 성공 확인
  await page.waitForSelector('text=프로젝트', { timeout: 10000 });
  console.log(`    ✅ [${browserName}] 로그인 성공`);
}

async function testNavigateToTestResults(page, browserName) {
  console.log(`  🧭 [${browserName}] 테스트 결과 페이지 이동`);
  
  // 테스트 결과 탭 클릭
  const testResultsTab = page.locator('text=테스트 결과').first();
  await testResultsTab.click();
  
  // 페이지 로드 대기
  await page.waitForSelector('text=상세 리포트', { timeout: 10000 });
  console.log(`    ✅ [${browserName}] 테스트 결과 페이지 이동 성공`);
}

async function testDetailReportTab(page, browserName) {
  console.log(`  📊 [${browserName}] 상세 리포트 탭 테스트`);
  
  // 상세 리포트 탭 클릭
  const detailReportTab = page.locator('text=상세 리포트').first();
  await detailReportTab.click();
  
  // 상세 리포트 컴포넌트 확인
  await page.waitForSelector('text=필터 프리셋', { timeout: 10000 });
  await page.waitForSelector('text=고급 필터', { timeout: 5000 });
  
  // 통계 카드 확인
  const statisticsCards = page.locator('.MuiCard-root');
  const cardCount = await statisticsCards.count();
  
  if (cardCount >= 4) {
    console.log(`    ✅ [${browserName}] 통계 카드 표시됨 (${cardCount}개)`);
  } else {
    throw new Error(`통계 카드가 충분하지 않음: ${cardCount}개`);
  }
}

async function testFilterPresetManager(page, browserName) {
  console.log(`  🔧 [${browserName}] 필터 프리셋 관리 테스트`);
  
  // 필터 프리셋 섹션 확인
  const presetSection = page.locator('text=필터 프리셋').first();
  await presetSection.waitFor({ timeout: 5000 });
  
  // 현재 필터 저장 버튼 확인
  const saveButton = page.locator('button:has-text("현재 필터 저장")').first();
  await saveButton.waitFor({ timeout: 5000 });
  
  // 기본 프리셋 확인 (전체 결과, 실패 케이스만, 최근 7일, JIRA 연동)
  const presetList = page.locator('.MuiList-root').first();
  await presetList.waitFor({ timeout: 5000 });
  
  const presetItems = presetList.locator('.MuiListItem-root');
  const presetCount = await presetItems.count();
  
  if (presetCount >= 4) {
    console.log(`    ✅ [${browserName}] 기본 프리셋 확인됨 (${presetCount}개)`);
  }
  
  // 프리셋 적용 테스트 (실패 케이스만)
  const failedCasesPreset = page.locator('text=실패 케이스만').first();
  if (await failedCasesPreset.isVisible()) {
    await failedCasesPreset.click();
    console.log(`    ✅ [${browserName}] 프리셋 적용 테스트 성공`);
  }
}

async function testAdvancedFiltering(page, browserName) {
  console.log(`  🔍 [${browserName}] 고급 검색 및 필터링 테스트`);
  
  // 고급 필터 아코디언 확장
  const filterAccordion = page.locator('text=고급 필터').first();
  await filterAccordion.click();
  
  // 복합 검색 옵션 확인
  await page.waitForSelector('text=복합 검색 옵션', { timeout: 5000 });
  
  // 정규표현식 옵션 확인
  const regexCheckbox = page.locator('input[type="checkbox"]:near(text=정규표현식 사용)').first();
  await regexCheckbox.waitFor({ timeout: 5000 });
  
  // 대소문자 구분 옵션 확인  
  const caseSensitiveCheckbox = page.locator('input[type="checkbox"]:near(text=대소문자 구분)').first();
  await caseSensitiveCheckbox.waitFor({ timeout: 5000 });
  
  // 완전 일치 옵션 확인
  const exactMatchCheckbox = page.locator('input[type="checkbox"]:near(text=완전 일치)').first();
  await exactMatchCheckbox.waitFor({ timeout: 5000 });
  
  console.log(`    ✅ [${browserName}] 고급 필터링 옵션 확인됨`);
  
  // 검색어 입력 테스트
  const searchField = page.locator('input[placeholder*="테스트 케이스명"]').first();
  await searchField.fill('test');
  
  // 검색 버튼 클릭
  const searchButton = page.locator('button:has-text("검색")').first();
  await searchButton.click();
  
  console.log(`    ✅ [${browserName}] 검색 기능 테스트 완료`);
}

async function testJiraIntegrationReport(page, browserName) {
  console.log(`  🔗 [${browserName}] JIRA 연동 리포트 테스트`);
  
  // JIRA 연동 리포트 섹션 확인
  await page.waitForSelector('text=JIRA 연동 리포트', { timeout: 10000 });
  
  const jiraSection = page.locator('text=JIRA 연동 리포트').first();
  await jiraSection.click();
  
  // JIRA 통계 카드 확인
  await page.waitForSelector('text=연결된 케이스', { timeout: 5000 });
  await page.waitForSelector('text=미연결 케이스', { timeout: 5000 });
  
  // JIRA 상태별 차트 확인 (데이터가 있는 경우)
  const chartContainer = page.locator('.recharts-wrapper').first();
  if (await chartContainer.isVisible()) {
    console.log(`    ✅ [${browserName}] JIRA 상태별 차트 표시됨`);
  }
  
  console.log(`    ✅ [${browserName}] JIRA 연동 리포트 확인 완료`);
}

async function testTrendAnalysis(page, browserName) {
  console.log(`  📈 [${browserName}] 트렌드 분석 테스트`);
  
  // 트렌드 분석 섹션 확인
  await page.waitForSelector('text=트렌드 분석', { timeout: 10000 });
  
  const trendSection = page.locator('text=트렌드 분석').first();
  await trendSection.click();
  
  // 컨트롤 패널 확인
  const timeRangeSelect = page.locator('text=기간').first();
  await timeRangeSelect.waitFor({ timeout: 5000 });
  
  const viewModeSelect = page.locator('text=단위').first();
  await viewModeSelect.waitFor({ timeout: 5000 });
  
  // 분석 유형 버튼 확인
  const timelineButton = page.locator('button:has-text("시간별 추이")').first();
  const executorButton = page.locator('button:has-text("실행자별")').first();
  const testplanButton = page.locator('button:has-text("테스트플랜별")').first();
  
  await timelineButton.waitFor({ timeout: 5000 });
  await executorButton.waitFor({ timeout: 5000 });
  await testplanButton.waitFor({ timeout: 5000 });
  
  // 실행자별 분석 테스트
  await executorButton.click();
  await page.waitForTimeout(2000);
  
  // 테스트플랜별 분석 테스트
  await testplanButton.click();
  await page.waitForTimeout(2000);
  
  console.log(`    ✅ [${browserName}] 트렌드 분석 기능 확인 완료`);
}

async function testPerformanceOptimization(page, browserName) {
  console.log(`  ⚡ [${browserName}] 성능 최적화 기능 테스트`);
  
  // 성능 최적화 섹션 확인
  await page.waitForSelector('text=성능 최적화', { timeout: 5000 });
  
  // 가상 스크롤링 옵션 확인
  const virtualScrollingCheckbox = page.locator('input[type="checkbox"]:near(text=가상 스크롤링)').first();
  await virtualScrollingCheckbox.waitFor({ timeout: 5000 });
  
  // 지연 로딩 옵션 확인
  const lazyLoadingCheckbox = page.locator('input[type="checkbox"]:near(text=지연 로딩)').first();
  await lazyLoadingCheckbox.waitFor({ timeout: 5000 });
  
  // 캐시 초기화 버튼 확인
  const clearCacheButton = page.locator('button:has-text("캐시 초기화")').first();
  await clearCacheButton.waitFor({ timeout: 5000 });
  
  // 가상 스크롤링 활성화 테스트
  await virtualScrollingCheckbox.click();
  await page.waitForTimeout(1000);
  
  // DataGrid가 가상 스크롤링 모드로 변경되었는지 확인
  const dataGrid = page.locator('.MuiDataGrid-root').first();
  const gridHeight = await dataGrid.evaluate(el => el.style.minHeight);
  
  if (gridHeight === '600px') {
    console.log(`    ✅ [${browserName}] 가상 스크롤링 모드 활성화됨`);
  }
  
  console.log(`    ✅ [${browserName}] 성능 최적화 기능 확인 완료`);
}

// 메인 실행
if (require.main === module) {
  testAdvancedReportFeatures()
    .then(() => {
      console.log('\n🎉 ICT-224: 고급 상세 리포트 기능 E2E 테스트 모든 브라우저에서 성공!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 ICT-224: 고급 상세 리포트 기능 E2E 테스트 실패:', error);
      process.exit(1);
    });
}

module.exports = { testAdvancedReportFeatures };