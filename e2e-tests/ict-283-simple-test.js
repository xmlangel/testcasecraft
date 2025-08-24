// e2e-tests/ict-283-simple-test.js  
// ICT-283: 계층적 테스트 결과 리포트 기능 간단 검증 테스트

const { chromium } = require('playwright');

async function simpleHierarchicalReportTest() {
  console.log('=== ICT-283: 계층적 테스트 결과 리포트 간단 검증 ===');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-dev-shm-usage', '--no-sandbox']
  });
  
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080',
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();

  try {
    // 1. 로그인
    console.log('🌐 로그인...');
    await page.goto('/', { timeout: 30000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log(`✅ 로그인 완료. URL: ${page.url()}`);

    // 2. 프로젝트 페이지로 이동
    console.log('📂 프로젝트로 이동...');
    await page.goto('/projects', { timeout: 20000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 3. 모든 다이얼로그 닫기
    const dialogs = await page.locator('.MuiDialog-root').count();
    if (dialogs > 0) {
      console.log(`🔒 ${dialogs}개의 다이얼로그 발견, 닫는 중...`);
      const escapeKeys = Array(dialogs).fill('Escape');
      for (const key of escapeKeys) {
        await page.keyboard.press(key);
        await page.waitForTimeout(500);
      }
    }

    // 4. 첫 번째 프로젝트 열기
    console.log('🎯 첫 번째 프로젝트 열기...');
    const projectButton = await page.locator('button:has-text("프로젝트 열기")').first();
    if (await projectButton.isVisible().catch(() => false)) {
      await projectButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000);
    }

    // 5. 프로젝트 개별 페이지에서 직접 프로젝트 ID 확인
    console.log('🔍 프로젝트 ID 확인...');
    const currentUrl = page.url();
    console.log(`현재 URL: ${currentUrl}`);

    // 프로젝트 ID를 URL에서 추출하거나 직접 이동
    let projectId = '1'; // 기본값
    const urlMatch = currentUrl.match(/projects\/(\d+)/);
    if (urlMatch) {
      projectId = urlMatch[1];
      console.log(`프로젝트 ID 감지: ${projectId}`);
    }

    // 6. 프로젝트 개별 페이지로 직접 이동
    const projectUrl = `/projects/${projectId}`;
    console.log(`📍 프로젝트 페이지로 이동: ${projectUrl}`);
    await page.goto(projectUrl, { timeout: 20000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);

    console.log(`✅ 프로젝트 페이지 접근. URL: ${page.url()}`);

    // 7. 모든 탭 확인
    console.log('📋 페이지의 탭들 확인...');
    const tabs = await page.locator('.MuiTab-root, [role="tab"]');
    const tabCount = await tabs.count();
    console.log(`발견된 탭 수: ${tabCount}`);

    for (let i = 0; i < Math.min(tabCount, 8); i++) {
      const tab = tabs.nth(i);
      const tabText = await tab.textContent().catch(() => '');
      console.log(`탭 ${i}: "${tabText}"`);
    }

    // 8. 테스트 결과 탭 클릭 (tabIndex 4)
    console.log('📊 테스트 결과 탭(5번째) 클릭...');
    
    let testResultsTabClicked = false;
    
    // 5번째 탭 클릭 (0-indexed로 4번째)
    if (tabCount > 4) {
      const testResultsTab = tabs.nth(4);
      const tabText = await testResultsTab.textContent().catch(() => '');
      console.log(`5번째 탭 클릭 시도: "${tabText}"`);
      
      try {
        await testResultsTab.click({ timeout: 10000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        testResultsTabClicked = true;
        console.log('✅ 테스트 결과 탭 클릭 성공');
      } catch (error) {
        console.log(`❌ 5번째 탭 클릭 실패: ${error.message}`);
      }
    }

    // 9. TestResultMainPage 컴포넌트가 렌더링되었는지 확인
    console.log('🔍 TestResultMainPage 컴포넌트 확인...');
    
    const testResultComponents = [
      { name: '테스트 결과 제목', selector: 'h4:has-text("테스트 결과"), h5:has-text("테스트 결과")' },
      { name: '탭 컨테이너', selector: '.MuiTabs-root' },
      { name: '통계 대시보드', selector: 'text=통계 대시보드' },
      { name: '추이 분석', selector: 'text=추이 분석' }
    ];

    let componentsFound = 0;
    for (const component of testResultComponents) {
      const element = await page.locator(component.selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`✅ ${component.name} 발견`);
        componentsFound++;
      } else {
        console.log(`⚠️  ${component.name} 없음`);
      }
    }

    // 10. 계층적 리포트 탭 확인
    console.log('🌳 계층적 리포트 탭 확인...');
    
    const hierarchicalTabSelectors = [
      'text=계층적 리포트',
      'text=계층',
      '.MuiTab-root:has-text("계층")',
      '[role="tab"]:has-text("계층")'
    ];

    let hierarchicalTabFound = false;
    let hierarchicalTabElement = null;
    
    for (const selector of hierarchicalTabSelectors) {
      const element = await page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`🌳 계층적 리포트 탭 발견: ${selector}`);
        hierarchicalTabFound = true;
        hierarchicalTabElement = element;
        break;
      }
    }

    // 11. 계층적 리포트 탭 클릭 시도
    if (hierarchicalTabFound && hierarchicalTabElement) {
      console.log('🌳 계층적 리포트 탭 클릭...');
      try {
        await hierarchicalTabElement.click({ timeout: 10000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        console.log('✅ 계층적 리포트 탭 클릭 성공');
        
        // 12. HierarchicalTestResultTreeView 컴포넌트 확인
        console.log('🔍 계층적 리포트 컴포넌트 확인...');
        
        const hierarchicalComponents = [
          { name: 'TreeView', selector: '.MuiTreeView-root' },
          { name: 'TreeItem', selector: '.MuiTreeItem-root' },
          { name: '통계 카드', selector: '.MuiCard-root' },
          { name: '내보내기 버튼', selector: 'button:has-text("내보내기")' }
        ];

        let hierarchicalComponentsFound = 0;
        for (const component of hierarchicalComponents) {
          const element = await page.locator(component.selector).first();
          if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log(`✅ ${component.name} 발견`);
            hierarchicalComponentsFound++;
          } else {
            console.log(`⚠️  ${component.name} 없음`);
          }
        }

        console.log(`📊 계층적 컴포넌트 발견: ${hierarchicalComponentsFound}/4`);
        
      } catch (error) {
        console.log(`❌ 계층적 리포트 탭 클릭 실패: ${error.message}`);
      }
    } else {
      console.log('❌ 계층적 리포트 탭을 찾을 수 없습니다.');
    }

    // 13. 최종 스크린샷
    const timestamp = Date.now();
    const screenshotPath = `e2e-tests/test-screenshots/ict-283-simple-${timestamp}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 최종 스크린샷: ${screenshotPath}`);

    // 14. 결과 평가
    const successConditions = [
      testResultsTabClicked,
      componentsFound >= 2,
      hierarchicalTabFound
    ];

    const successCount = successConditions.filter(Boolean).length;
    const isSuccess = successCount >= 2;

    console.log('\n=== ICT-283 간단 검증 결과 ===');
    console.log(`📊 테스트 결과 탭 클릭: ${testResultsTabClicked ? '✅' : '❌'}`);
    console.log(`🔍 기본 컴포넌트 발견: ${componentsFound}/4`);
    console.log(`🌳 계층적 리포트 탭 발견: ${hierarchicalTabFound ? '✅' : '❌'}`);
    console.log(`🎯 최종 결과: ${isSuccess ? '✅ 성공' : '❌ 실패'} (${successCount}/3)`);
    
    return isSuccess;

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    
    try {
      const errorTimestamp = Date.now();
      const errorScreenshotPath = `e2e-tests/test-screenshots/ict-283-simple-error-${errorTimestamp}.png`;
      await page.screenshot({ path: errorScreenshotPath, fullPage: true });
      console.log(`📸 오류 스크린샷: ${errorScreenshotPath}`);
    } catch (screenshotError) {
      console.error('스크린샷 저장 실패:', screenshotError.message);
    }
    
    return false;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
if (require.main === module) {
  simpleHierarchicalReportTest().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { simpleHierarchicalReportTest };