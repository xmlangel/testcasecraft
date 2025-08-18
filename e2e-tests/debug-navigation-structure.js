// 네비게이션 구조 파악 및 프로젝트 접근 방법 확인

const { chromium } = require('playwright');

async function debugNavigationStructure() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500
  });
  
  try {
    const context = await browser.newContext({
      baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();
    
    console.log('🔍 네비게이션 구조 분석 시작...');
    
    // 1. 로그인
    await page.goto('/');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('✅ 로그인 완료 - 대시보드 페이지');
    
    // 2. 네비게이션 메뉴 찾기
    console.log('🧭 네비게이션 메뉴 분석...');
    
    // AppBar, 헤더, 메뉴 관련 요소들 확인
    const appBarElements = await page.locator('.MuiAppBar-root').count();
    const toolbarElements = await page.locator('.MuiToolbar-root').count();
    const tabElements = await page.locator('.MuiTabs-root').count();
    
    console.log(`📊 네비게이션 요소: AppBar=${appBarElements}, Toolbar=${toolbarElements}, Tabs=${tabElements}`);
    
    // 3. 링크 및 버튼 요소 분석
    const allLinks = await page.locator('a').count();
    const allButtons = await page.locator('button').count();
    
    console.log(`🔗 요소 개수: Links=${allLinks}, Buttons=${allButtons}`);
    
    // 4. 네비게이션 관련 텍스트 찾기
    const navigationTexts = ['프로젝트', 'Projects', '대시보드', 'Dashboard', '조직', '설정'];
    
    for (const text of navigationTexts) {
      const elements = await page.locator(`text=${text}`).count();
      if (elements > 0) {
        console.log(`📝 "${text}" 텍스트 발견: ${elements}개`);
      }
    }
    
    // 5. 프로젝트 관련 버튼/링크 찾기 및 클릭 시도
    const projectSelectors = [
      'text=프로젝트',
      'text=Projects',
      'button:has-text("프로젝트")',
      'a:has-text("프로젝트")',
      '[href*="projects"]',
      '[href*="project"]'
    ];
    
    let projectFound = false;
    for (const selector of projectSelectors) {
      try {
        const elements = await page.locator(selector).count();
        if (elements > 0) {
          console.log(`🎯 프로젝트 요소 발견: ${selector} (${elements}개)`);
          
          // 첫 번째 요소 클릭 시도
          await page.locator(selector).first().click();
          projectFound = true;
          
          console.log('✅ 프로젝트 요소 클릭 성공');
          break;
        }
      } catch (e) {
        console.log(`⚠️ ${selector} 클릭 실패: ${e.message}`);
      }
    }
    
    if (!projectFound) {
      console.log('❌ 프로젝트 관련 네비게이션을 찾을 수 없음');
      
      // URL 직접 접근 시도
      console.log('🔄 URL 직접 접근 시도...');
      await page.goto('/projects');
    }
    
    // 6. 페이지 이동 후 상태 확인
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('🌐 현재 URL:', currentUrl);
    
    const pageContent = await page.textContent('body');
    const contentSample = pageContent.replace(/\s+/g, ' ').substring(0, 300);
    console.log('📄 페이지 내용:', contentSample);
    
    // 7. 프로젝트 카드나 목록 확인
    const projectCards = await page.locator('.MuiCard-root').count();
    const projectButtons = await page.locator('button:has-text("프로젝트 열기")').count();
    const projectItems = await page.locator('[data-testid*="project"], .project-item').count();
    
    console.log(`📊 프로젝트 요소: Cards=${projectCards}, OpenButtons=${projectButtons}, Items=${projectItems}`);
    
    if (projectButtons > 0) {
      console.log('✅ "프로젝트 열기" 버튼 발견 - 프로젝트 선택 시도');
      
      // 첫 번째 프로젝트 열기
      await page.locator('button:has-text("프로젝트 열기")').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      
      const projectUrl = page.url();
      console.log('🎯 프로젝트 선택 후 URL:', projectUrl);
      
      // 8. 프로젝트 내부의 탭 구조 확인
      const tabs = await page.locator('.MuiTab-root, [role="tab"]').count();
      console.log(`📑 프로젝트 내 탭 개수: ${tabs}`);
      
      if (tabs > 0) {
        for (let i = 0; i < Math.min(tabs, 6); i++) {
          const tabText = await page.locator('.MuiTab-root, [role="tab"]').nth(i).textContent();
          console.log(`📑 탭 ${i + 1}: "${tabText}"`);
        }
        
        // 자동화 테스트 탭 찾기 및 클릭
        const automationTab = await page.locator('text=자동화').count();
        if (automationTab > 0) {
          console.log('🎯 자동화 테스트 탭 발견 - 클릭 시도');
          await page.locator('text=자동화').first().click();
          
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(3000);
          
          const automationUrl = page.url();
          console.log('🤖 자동화 테스트 탭 URL:', automationUrl);
          
          // 자동화 테스트 페이지 내용 확인
          const automationContent = await page.textContent('body');
          const automationSample = automationContent.replace(/\s+/g, ' ').substring(0, 300);
          console.log('🤖 자동화 테스트 페이지 내용:', automationSample);
        }
      }
    }
    
    console.log('✅ 네비게이션 구조 분석 완료 - 10초 후 종료');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 분석 중 오류:', error.message);
    console.error('스택:', error.stack);
  } finally {
    await browser.close();
  }
}

// 실행
debugNavigationStructure();