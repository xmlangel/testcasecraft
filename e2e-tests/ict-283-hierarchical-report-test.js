// e2e-tests/ict-283-hierarchical-report-test.js
// ICT-283: 테스트 결과 상세 리포트 내보내기 기능 구현 - 계층적 리포트 검증 테스트

const { chromium } = require('playwright');

async function hierarchicalReportTest() {
  console.log('=== ICT-283: 계층적 테스트 결과 리포트 기능 검증 테스트 ===');
  
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
    // 1. 로그인 및 기본 네비게이션
    console.log('🌐 홈페이지 접속 및 로그인...');
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log(`✅ 로그인 완료. 현재 URL: ${page.url()}`);

    // 2. 프로젝트로 이동
    console.log('📂 프로젝트로 이동...');
    
    // 프로젝트 페이지로 이동 시도
    const projectNavSelectors = [
      'text=프로젝트',
      'a[href*="projects"]',
      'button:has-text("프로젝트")',
      '.MuiListItemText-primary:has-text("프로젝트")'
    ];

    let projectNavFound = false;
    for (const selector of projectNavSelectors) {
      const element = await page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`📍 프로젝트 네비게이션 발견: ${selector}`);
        await element.click();
        await page.waitForLoadState('networkidle');
        projectNavFound = true;
        break;
      }
    }

    if (!projectNavFound) {
      console.log('📍 직접 프로젝트 URL로 이동...');
      await page.goto('/projects', { timeout: 20000 });
      await page.waitForLoadState('networkidle');
    }

    // 3. 첫 번째 프로젝트 선택
    console.log('🎯 첫 번째 프로젝트 선택...');
    
    const projectOpenSelectors = [
      'button:has-text("프로젝트 열기")',
      'button:has-text("열기")',
      '.MuiButton-contained',
      '[data-testid*="open-project"]'
    ];

    let projectOpened = false;
    for (const selector of projectOpenSelectors) {
      const element = await page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log(`🎯 프로젝트 열기 버튼 발견: ${selector}`);
        await element.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        projectOpened = true;
        break;
      }
    }

    if (!projectOpened) {
      throw new Error('❌ 프로젝트 열기 실패: 프로젝트 열기 버튼을 찾을 수 없습니다.');
    }

    console.log(`✅ 프로젝트 접근 완료. 현재 URL: ${page.url()}`);

    // 4. 테스트 결과 탭으로 이동
    console.log('📊 테스트 결과 탭으로 이동...');
    
    const testResultSelectors = [
      'text=테스트 결과',
      'a[href*="test-results"]',
      '.MuiTab-root:has-text("테스트 결과")',
      '.MuiListItemText-primary:has-text("테스트 결과")'
    ];

    let testResultNavFound = false;
    for (const selector of testResultSelectors) {
      const element = await page.locator(selector).first();
      if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log(`📊 테스트 결과 탭 발견: ${selector}`);
        await element.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        testResultNavFound = true;
        break;
      }
    }

    if (!testResultNavFound) {
      console.log('📊 직접 테스트 결과 URL로 이동 시도...');
      const currentUrl = page.url();
      if (currentUrl.includes('/projects/')) {
        const testResultUrl = currentUrl + '/test-results';
        await page.goto(testResultUrl, { timeout: 20000 });
        await page.waitForLoadState('networkidle');
      }
    }

    console.log(`✅ 테스트 결과 페이지 접근 완료. 현재 URL: ${page.url()}`);

    // 5. 계층적 리포트 탭 확인 및 클릭
    console.log('🌳 계층적 리포트 탭 확인...');
    
    const hierarchicalTabSelectors = [
      'text=계층적 리포트',
      'text=계층',
      '.MuiTab-root:has-text("계층")',
      '[role="tab"]:has-text("계층")'
    ];

    let hierarchicalTabFound = false;
    for (const selector of hierarchicalTabSelectors) {
      const element = await page.locator(selector);
      if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log(`🌳 계층적 리포트 탭 발견: ${selector}`);
        await element.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        hierarchicalTabFound = true;
        break;
      }
    }

    if (!hierarchicalTabFound) {
      throw new Error('❌ 계층적 리포트 탭을 찾을 수 없습니다. 탭이 구현되지 않았을 가능성이 있습니다.');
    }

    console.log('✅ 계층적 리포트 탭 클릭 완료');

    // 6. 계층적 리포트 컴포넌트 검증
    console.log('🔍 계층적 리포트 컴포넌트 검증...');
    
    // 계층적 컴포넌트의 주요 요소들 확인
    const componentElements = [
      { name: 'TreeView 컨테이너', selectors: ['.MuiTreeView-root', '.hierarchical-tree-view'] },
      { name: '통계 카드 영역', selectors: ['.statistics-cards', '.MuiGrid-container'] },
      { name: '내보내기 버튼', selectors: ['button:has-text("내보내기")', 'button:has-text("Export")'] },
      { name: '필터 패널', selectors: ['.filter-panel', '.MuiAccordion-root'] }
    ];

    let componentsVerified = 0;
    for (const component of componentElements) {
      console.log(`🔎 ${component.name} 확인...`);
      let found = false;
      
      for (const selector of component.selectors) {
        const element = await page.locator(selector);
        if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log(`  ✅ ${component.name} 발견: ${selector}`);
          componentsVerified++;
          found = true;
          break;
        }
      }
      
      if (!found) {
        console.log(`  ⚠️  ${component.name}을(를) 찾을 수 없습니다.`);
      }
    }

    // 7. API 호출 검증
    console.log('🌐 계층적 리포트 API 호출 검증...');
    
    // API 요청 감시 시작
    const apiRequests = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('/api/test-results') || url.includes('/detailed-report')) {
        apiRequests.push({
          url: url,
          method: request.method(),
          timestamp: new Date().toISOString()
        });
        console.log(`🌐 API 호출 감지: ${request.method()} ${url}`);
      }
    });

    // 페이지 새로고침 또는 컴포넌트 재로딩을 통해 API 호출 유도
    console.log('🔄 컴포넌트 새로고침으로 API 호출 유도...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 계층적 리포트 탭 다시 클릭
    await page.waitForTimeout(3000);
    const hierarchicalTab = await page.locator('text=계층').first();
    if (await hierarchicalTab.isVisible().catch(() => false)) {
      await hierarchicalTab.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000); // API 호출 대기
    }

    // 8. 계층적 구조 데이터 검증
    console.log('📋 계층적 구조 데이터 검증...');
    
    // TreeView의 노드들 확인
    const treeNodeSelectors = [
      '.MuiTreeItem-root',
      '[role="treeitem"]',
      '.tree-node',
      '.test-plan-node',
      '.test-execution-node',
      '.test-case-node'
    ];

    let treeNodesFound = false;
    for (const selector of treeNodeSelectors) {
      const nodes = await page.locator(selector);
      const nodeCount = await nodes.count().catch(() => 0);
      
      if (nodeCount > 0) {
        console.log(`✅ TreeView 노드 발견: ${nodeCount}개 (${selector})`);
        treeNodesFound = true;
        break;
      }
    }

    if (!treeNodesFound) {
      console.log('⚠️  TreeView 노드를 찾을 수 없습니다. 데이터가 없거나 로딩 중일 수 있습니다.');
    }

    // 9. 내보내기 기능 테스트
    console.log('📤 내보내기 기능 테스트...');
    
    const exportButtonSelectors = [
      'button:has-text("내보내기")',
      'button:has-text("Export")',
      '.export-button',
      '[data-testid*="export"]'
    ];

    let exportTested = false;
    for (const selector of exportButtonSelectors) {
      const exportButton = await page.locator(selector).first();
      if (await exportButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`📤 내보내기 버튼 발견: ${selector}`);
        
        // 내보내기 버튼 클릭 (실제 다운로드는 하지 않고 동작 확인만)
        await exportButton.click();
        await page.waitForTimeout(2000);
        
        // 내보내기 다이얼로그 또는 드롭다운 확인
        const exportOptionsSelectors = [
          '.export-options',
          '.MuiMenu-root',
          '.MuiPopover-root',
          'text=Excel',
          'text=CSV',
          'text=PDF'
        ];

        let exportOptionsFound = false;
        for (const optionSelector of exportOptionsSelectors) {
          const element = await page.locator(optionSelector);
          if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`✅ 내보내기 옵션 확인: ${optionSelector}`);
            exportOptionsFound = true;
            break;
          }
        }

        if (exportOptionsFound) {
          console.log('✅ 내보내기 기능 정상 동작 확인');
          exportTested = true;
        }
        break;
      }
    }

    if (!exportTested) {
      console.log('⚠️  내보내기 버튼을 찾을 수 없거나 동작하지 않습니다.');
    }

    // 10. 최종 검증 결과 출력
    console.log('\n=== ICT-283 계층적 리포트 검증 결과 ===');
    console.log(`📊 컴포넌트 검증: ${componentsVerified}/4개 요소 확인`);
    console.log(`🌐 API 호출 감지: ${apiRequests.length}개 요청`);
    console.log(`🌳 TreeView 노드: ${treeNodesFound ? '확인됨' : '확인되지 않음'}`);
    console.log(`📤 내보내기 기능: ${exportTested ? '정상 동작' : '동작하지 않음'}`);
    
    if (apiRequests.length > 0) {
      console.log('\n🌐 감지된 API 호출:');
      apiRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.method} ${req.url}`);
      });
    }

    // 스크린샷 캡처
    const timestamp = Date.now();
    const screenshotPath = `e2e-tests/test-screenshots/ict-283-hierarchical-report-${timestamp}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 스크린샷 저장: ${screenshotPath}`);

    // 성공 조건 평가
    const successConditions = [
      hierarchicalTabFound,
      componentsVerified >= 2, // 최소 2개 이상의 컴포넌트 요소 확인
      apiRequests.length > 0 || treeNodesFound // API 호출이 있거나 트리 노드가 확인됨
    ];

    const successCount = successConditions.filter(Boolean).length;
    const isSuccess = successCount >= 2; // 3개 중 2개 이상 성공시 통과

    console.log(`\n🎯 최종 결과: ${isSuccess ? '✅ 성공' : '❌ 실패'} (${successCount}/3 조건 충족)`);
    
    if (isSuccess) {
      console.log('🎉 ICT-283 계층적 테스트 결과 리포트 기능이 정상적으로 구현되었습니다!');
    } else {
      console.log('❌ ICT-283 계층적 테스트 결과 리포트 기능에 문제가 있습니다.');
    }

    return isSuccess;

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error.message);
    
    // 오류 스크린샷 캡처
    try {
      const errorTimestamp = Date.now();
      const errorScreenshotPath = `e2e-tests/test-screenshots/ict-283-error-${errorTimestamp}.png`;
      await page.screenshot({ path: errorScreenshotPath, fullPage: true });
      console.log(`📸 오류 스크린샷 저장: ${errorScreenshotPath}`);
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
  hierarchicalReportTest().then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { hierarchicalReportTest };