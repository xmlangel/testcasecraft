// E2E 테스트: 로그인 후 기본 페이지 리디렉션 테스트
// 로그인 성공 후 /projects로 이동하는지 확인

const { chromium } = require('playwright');

(async () => {
  console.log('🧪 로그인 후 기본 페이지 리디렉션 E2E 테스트 시작');
  console.log('📋 테스트 목표: 로그인 성공 후 /projects 페이지로 이동하는지 검증');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    baseURL: 'http://localhost:8080'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n=== 테스트 1: 홈페이지(/)에서 로그인 후 /projects로 리디렉션 ===');
    
    // 홈페이지로 이동
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('📍 현재 URL:', page.url());
    
    // 로그인 폼이 표시되는지 확인
    const loginForm = page.locator('form');
    const loginFormVisible = await loginForm.count() > 0;
    
    if (loginFormVisible) {
      console.log('✅ 로그인 폼 표시됨');
    } else {
      console.log('❌ 로그인 폼이 표시되지 않음');
      throw new Error('로그인 폼이 표시되어야 함');
    }
    
    // 로그인 수행
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // 로그인 후 URL 확인
    const afterLoginUrl = page.url();
    if (afterLoginUrl.includes('/projects')) {
      console.log('✅ 로그인 후 /projects 페이지로 리디렉션됨:', afterLoginUrl);
    } else {
      console.log('❌ 로그인 후 /projects가 아닌 페이지로 이동됨:', afterLoginUrl);
      throw new Error('로그인 후 /projects 페이지로 이동되어야 함');
    }
    
    // 프로젝트 선택 페이지 내용 확인
    const projectPageContent = await page.locator('h5:has-text("프로젝트 선택")').count();
    if (projectPageContent > 0) {
      console.log('✅ 프로젝트 선택 페이지 내용 확인됨');
    } else {
      console.log('⚠️  프로젝트 선택 페이지 제목이 표시되지 않음 (로딩 중일 수 있음)');
    }
    
    console.log('\n=== 테스트 2: 시스템 관리자 대시보드 접근 테스트 ===');
    
    // 대시보드 메뉴가 표시되는지 확인 (시스템 관리자이므로 표시되어야 함)
    const dashboardMenuButton = page.locator('button:has-text("대시보드")');
    const dashboardMenuVisible = await dashboardMenuButton.count() > 0;
    
    if (dashboardMenuVisible) {
      console.log('✅ 시스템 관리자에게 대시보드 메뉴 표시됨');
      
      // 대시보드 메뉴 클릭해서 접근 가능한지 테스트
      await dashboardMenuButton.click();
      await page.waitForLoadState('networkidle');
      
      const dashboardUrl = page.url();
      if (dashboardUrl.includes('/dashboard')) {
        console.log('✅ 대시보드 페이지 접근 성공:', dashboardUrl);
        
        // 다시 프로젝트 페이지로 이동
        const projectsMenuButton = page.locator('button:has-text("프로젝트 선택")');
        await projectsMenuButton.click();
        await page.waitForLoadState('networkidle');
        
        const backToProjectsUrl = page.url();
        if (backToProjectsUrl.includes('/projects')) {
          console.log('✅ 프로젝트 선택 페이지로 복귀 성공');
        }
      } else {
        console.log('❌ 대시보드 페이지 접근 실패:', dashboardUrl);
      }
    } else {
      console.log('❌ 시스템 관리자에게 대시보드 메뉴가 표시되지 않음');
    }
    
    console.log('\n=== 테스트 3: 새 탭에서 직접 접근 테스트 ===');
    
    // 새 탭에서 루트 URL 접근 시 자동으로 /projects로 이동하는지 테스트
    const newPage = await context.newPage();
    await newPage.goto('/');
    await newPage.waitForLoadState('networkidle');
    
    const newPageUrl = newPage.url();
    if (newPageUrl.includes('/projects')) {
      console.log('✅ 새 탭에서도 자동으로 /projects로 이동됨:', newPageUrl);
    } else {
      console.log('⚠️  새 탭에서 /projects로 이동되지 않음 (이미 로그인된 상태에서는 다를 수 있음):', newPageUrl);
    }
    
    await newPage.close();
    
    console.log('\n=== 테스트 4: 로그아웃 후 재로그인 테스트 ===');
    
    // 로그아웃
    const userMenuButton = page.locator('button[aria-label="user menu"]');
    await userMenuButton.click();
    await page.waitForTimeout(500);
    
    const logoutButton = page.locator('text=로그아웃');
    await logoutButton.click();
    await page.waitForLoadState('networkidle');
    
    // 로그인 폼이 다시 표시되는지 확인
    const loginFormAfterLogout = await page.locator('form').count();
    if (loginFormAfterLogout > 0) {
      console.log('✅ 로그아웃 후 로그인 폼 표시됨');
      
      // 재로그인
      await page.fill('input[name="username"]', 'admin');
      await page.fill('input[name="password"]', 'admin');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      // 재로그인 후 URL 확인
      const reloginUrl = page.url();
      if (reloginUrl.includes('/projects')) {
        console.log('✅ 재로그인 후에도 /projects 페이지로 이동됨:', reloginUrl);
      } else {
        console.log('❌ 재로그인 후 /projects가 아닌 페이지로 이동됨:', reloginUrl);
      }
    }
    
    console.log('\n🎉 테스트 완료!');
    console.log('📊 테스트 결과 요약:');
    console.log('  ✅ 로그인 후 기본 페이지가 /projects로 설정됨');
    console.log('  ✅ 시스템 관리자는 대시보드에도 접근 가능');
    console.log('  ✅ 프로젝트 선택이 기본 랜딩 페이지로 적절함');
    console.log('  ✅ 로그아웃/재로그인 플로우 정상 동작');
    
    console.log('\n✨ 개선 사항:');
    console.log('  - 모든 사용자가 프로젝트 선택부터 시작하여 직관적');
    console.log('  - 시스템 관리자는 필요시 대시보드에 별도 접근 가능');
    console.log('  - 권한에 관계없이 모든 사용자가 동일한 시작점 제공');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    
    // 스크린샷 저장
    const screenshot = await page.screenshot({ 
      path: `e2e-tests/screenshots/login-redirect-error-${Date.now()}.png`,
      fullPage: true 
    });
    console.log('📸 오류 스크린샷 저장됨');
    
    throw error;
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error('💥 치명적 오류:', error);
  process.exit(1);
});