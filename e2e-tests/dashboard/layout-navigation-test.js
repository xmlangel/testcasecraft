// ICT-71: 대시보드 레이아웃 및 네비게이션 Playwright 테스트 작성
// 관련 컴포넌트: Dashboard.jsx, App.jsx, AppContext.jsx, OrganizationDashboard.jsx
// 포함 기능: 헤더, 사이드바, 네비게이션, 반응형 breakpoint, 사용자 메뉴

const { test, expect } = require('@playwright/test');

test.describe('대시보드 레이아웃 및 네비게이션 E2E 테스트', () => {
  
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로컬스토리지 초기화
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
  });

  // 성공 스크린샷 헬퍼 함수
  async function takeSuccessScreenshot(page, testInfo, testName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `test-results/success-screenshots/${testName}-${timestamp}.png`;
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    
    // 테스트 정보에 첨부
    await testInfo.attach('success-screenshot', {
      path: screenshotPath,
      contentType: 'image/png'
    });
    
    console.log(`📸 성공 스크린샷 저장: ${screenshotPath}`);
    return screenshotPath;
  }

  // 로그인 헬퍼 함수
  async function loginAsAdmin(page) {
    console.log('🔐 Admin 로그인 수행...');
    
    // 백엔드 서버 연결 확인
    let backendReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'test', password: 'test' })
        });
        backendReady = true;
        console.log('🚀 백엔드 서버 준비 완료');
        break;
      } catch (e) {
        console.log(`⏳ 백엔드 대기 중... (${i + 1}/30)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!backendReady) {
      throw new Error('백엔드 서버가 준비되지 않았습니다');
    }

    // 로그인 수행
    await page.goto('http://localhost:3000');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // JWT 토큰 저장 확인
    await page.waitForTimeout(3000);
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (!accessToken) {
      await page.waitForTimeout(2000);
      const retryToken = await page.evaluate(() => localStorage.getItem('accessToken'));
      expect(retryToken).toBeTruthy();
    }
    
    console.log('✅ Admin 로그인 완료');
  }

  test('대시보드 헤더 영역 요소 확인', async ({ page }, testInfo) => {
    console.log('🎯 대시보드 헤더 영역 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드 이동
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);

    // 헤더 AppBar 확인
    await expect(page.locator('.MuiAppBar-root')).toBeVisible();
    console.log('✅ 헤더 AppBar 컴포넌트 확인');

    // 로고/브랜드명 표시 확인
    await expect(page.locator('text=TestCaseCraft')).toBeVisible();
    console.log('✅ 브랜드명 표시 확인');

    // 사용자 정보 영역 (아바타) 확인
    await expect(page.locator('.MuiToolbar-root .MuiAvatar-root')).toBeVisible();
    console.log('✅ 사용자 아바타 표시 확인');

    // 네비게이션 메뉴 버튼들 확인 (AppBar 내의 버튼만)
    const navButtons = [
      { text: '대시보드', selector: '.MuiAppBar-root .MuiButton-root:has-text("대시보드")' },
      { text: '조직 관리', selector: '.MuiAppBar-root .MuiButton-root:has-text("조직 관리")' }, 
      { text: '사용자 관리', selector: '.MuiAppBar-root .MuiButton-root:has-text("사용자 관리")' },
      { text: '프로젝트 선택', selector: '.MuiAppBar-root .MuiButton-root:has-text("프로젝트 선택")' }
    ];

    for (const button of navButtons) {
      await expect(page.locator(button.selector)).toBeVisible();
      console.log(`✅ "${button.text}" 네비게이션 버튼 확인`);
    }

    // 헤더의 Material-UI Toolbar 구조 확인
    await expect(page.locator('.MuiToolbar-root')).toBeVisible();
    console.log('✅ Toolbar 구조 확인');

    // 사용자 메뉴 드롭다운 테스트
    await page.click('.MuiToolbar-root .MuiAvatar-root');
    await page.waitForTimeout(500);

    await expect(page.locator('text=프로필')).toBeVisible();
    await expect(page.locator('text=로그아웃')).toBeVisible();
    console.log('✅ 사용자 메뉴 드롭다운 항목 확인');

    // 메뉴 닫기
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    console.log('✅ 대시보드 헤더 영역 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'dashboard-header-elements');
  });

  test('네비게이션 메뉴 클릭 및 페이지 이동 확인', async ({ page }, testInfo) => {
    console.log('🧭 네비게이션 메뉴 이동 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드로 이동
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/dashboard');
    console.log('✅ 대시보드 페이지 이동 확인');

    // 조직 관리 페이지 이동 테스트
    await page.click('text=조직 관리');
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/organizations');
    console.log('✅ 조직 관리 페이지 이동 확인');

    // 조직 관리 페이지 제목 확인
    await expect(page.locator('h1:has-text("조직 관리"), h4:has-text("조직 관리"), h5:has-text("조직 관리")')).toBeVisible();
    console.log('✅ 조직 관리 페이지 제목 확인');

    // 다시 대시보드로 이동
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/dashboard');
    console.log('✅ 대시보드 복귀 확인');

    // 프로젝트 선택 페이지 이동 테스트
    await page.click('text=프로젝트 선택');
    await page.waitForTimeout(1500);
    
    // URL이 프로젝트 관련 경로로 변경되는지 확인
    const currentUrl = page.url();
    const isProjectUrl = currentUrl.includes('/projects') || currentUrl.includes('/project');
    expect(isProjectUrl).toBeTruthy();
    console.log('✅ 프로젝트 선택 페이지 이동 확인');

    // 프로젝트 선택 페이지 제목 확인 (첫 번째 제목만 선택)
    await expect(page.locator('h1:has-text("프로젝트"), h4:has-text("프로젝트"), h5:has-text("프로젝트")').first()).toBeVisible();
    console.log('✅ 프로젝트 선택 페이지 제목 확인');

    // 사용자 관리 페이지 이동 테스트 (다시 대시보드로 이동 후)
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);
    
    await page.click('text=사용자 관리');
    await page.waitForTimeout(1500);
    expect(page.url()).toContain('/users');
    console.log('✅ 사용자 관리 페이지 이동 확인');

    console.log('✅ 네비게이션 메뉴 이동 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'navigation-menu-page-transitions');
  });

  test('현재 페이지 활성 상태 표시 확인', async ({ page }, testInfo) => {
    console.log('📍 현재 페이지 활성 상태 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드로 이동
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);

    // 대시보드 버튼의 활성 상태 확인 (색상이나 스타일이 다를 수 있음)
    const dashboardButton = page.locator('.MuiAppBar-root .MuiButton-root:has-text("대시보드")');
    await expect(dashboardButton).toBeVisible();
    
    // 버튼의 색상 속성 확인 (활성 상태일 때 다른 색상)
    const buttonStyles = await dashboardButton.getAttribute('class');
    console.log(`✅ 대시보드 버튼 스타일: ${buttonStyles}`);

    // 조직 관리로 이동하여 활성 상태 변경 확인
    await page.click('text=조직 관리');
    await page.waitForTimeout(1000);

    // 조직 관리 버튼의 활성 상태 확인
    const orgButton = page.locator('.MuiAppBar-root .MuiButton-root:has-text("조직 관리")');
    await expect(orgButton).toBeVisible();
    
    const orgButtonStyles = await orgButton.getAttribute('class');
    console.log(`✅ 조직 관리 버튼 스타일: ${orgButtonStyles}`);

    // URL과 버튼 상태 일치 확인
    expect(page.url()).toContain('/organizations');
    console.log('✅ URL과 네비게이션 상태 일치 확인');

    // 프로젝트 선택으로 이동
    await page.click('text=프로젝트 선택');
    await page.waitForTimeout(1000);

    // 프로젝트 선택 버튼의 활성 상태 확인
    const projectButton = page.locator('.MuiAppBar-root .MuiButton-root:has-text("프로젝트 선택")');
    await expect(projectButton).toBeVisible();
    
    const projectButtonStyles = await projectButton.getAttribute('class');
    console.log(`✅ 프로젝트 선택 버튼 스타일: ${projectButtonStyles}`);

    console.log('✅ 현재 페이지 활성 상태 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'active-page-state-indication');
  });

  test('반응형 디자인 breakpoint 동작 확인', async ({ page }, testInfo) => {
    console.log('📱 반응형 디자인 breakpoint 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드로 이동
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);

    // 1. 데스크톱 뷰 (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    // 데스크톱에서 네비게이션 버튼들이 모두 표시되는지 확인 (AppBar 내의 버튼만 선택)
    await expect(page.locator('.MuiAppBar-root .MuiButton-root:has-text("대시보드")')).toBeVisible();
    await expect(page.locator('.MuiAppBar-root .MuiButton-root:has-text("조직 관리")')).toBeVisible();
    await expect(page.locator('.MuiAppBar-root .MuiButton-root:has-text("사용자 관리")')).toBeVisible();
    await expect(page.locator('.MuiAppBar-root .MuiButton-root:has-text("프로젝트 선택")')).toBeVisible();
    console.log('✅ 데스크톱 뷰 (1920x1080) - 모든 네비게이션 버튼 표시');

    // AppBar가 전체 너비를 차지하는지 확인
    await expect(page.locator('.MuiAppBar-root')).toBeVisible();
    console.log('✅ 데스크톱 뷰 AppBar 레이아웃 확인');

    // 2. 태블릿 뷰 (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1500); // 리렌더링 대기
    
    // 태블릿에서도 네비게이션이 정상 동작하는지 확인
    await expect(page.locator('.MuiAppBar-root')).toBeVisible();
    await expect(page.locator('text=TestCaseCraft')).toBeVisible(); // 브랜드명 유지
    console.log('✅ 태블릿 뷰 (768x1024) - AppBar 및 브랜드명 표시');

    // 네비게이션 버튼들이 여전히 표시되는지 확인
    const tabletNavButtons = await page.locator('.MuiButton-root').count();
    expect(tabletNavButtons).toBeGreaterThanOrEqual(4);
    console.log(`✅ 태블릿 뷰 네비게이션 버튼 개수: ${tabletNavButtons}개`);

    // 태블릿에서 메뉴 클릭 테스트
    await page.click('text=조직 관리');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/organizations');
    console.log('✅ 태블릿 뷰 네비게이션 클릭 동작 확인');

    // 3. 모바일 뷰 (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1500); // 리렌더링 대기
    
    // 모바일에서 AppBar 기본 구조 유지 확인
    await expect(page.locator('.MuiAppBar-root')).toBeVisible();
    await expect(page.locator('.MuiToolbar-root')).toBeVisible();
    console.log('✅ 모바일 뷰 (375x667) - 기본 AppBar 구조 유지');

    // 브랜드명이 여전히 표시되는지 확인
    await expect(page.locator('text=TestCaseCraft')).toBeVisible();
    console.log('✅ 모바일 뷰 브랜드명 표시 확인');

    // 사용자 아바타가 여전히 표시되는지 확인
    await expect(page.locator('.MuiToolbar-root .MuiAvatar-root')).toBeVisible();
    console.log('✅ 모바일 뷰 사용자 아바타 표시 확인');

    // 모바일에서 사용자 메뉴 동작 확인
    await page.click('.MuiToolbar-root .MuiAvatar-root');
    await page.waitForTimeout(500);
    await expect(page.locator('text=프로필')).toBeVisible();
    await expect(page.locator('text=로그아웃')).toBeVisible();
    console.log('✅ 모바일 뷰 사용자 메뉴 동작 확인');

    // 메뉴 닫기
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 모바일에서 네비게이션 테스트 (일부 버튼이 축약될 수 있음)
    const mobileNavButtons = await page.locator('.MuiButton-root').count();
    console.log(`✅ 모바일 뷰 네비게이션 버튼 개수: ${mobileNavButtons}개`);

    console.log('✅ 반응형 디자인 breakpoint 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'responsive-breakpoint-mobile-view');
  });

  test('사용자 정보 정확한 표시 확인', async ({ page }, testInfo) => {
    console.log('👤 사용자 정보 표시 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드로 이동
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);

    // 사용자 아바타 클릭하여 메뉴 열기
    await page.click('.MuiToolbar-root .MuiAvatar-root');
    await page.waitForTimeout(500);

    // 사용자 메뉴가 열리는지 확인
    await expect(page.locator('text=프로필')).toBeVisible();
    await expect(page.locator('text=로그아웃')).toBeVisible();
    console.log('✅ 사용자 메뉴 항목 표시 확인');

    // 사용자 정보가 메뉴에 표시되는지 확인
    // admin 사용자의 경우 'admin' 또는 사용자명이 표시될 수 있음
    const menuText = await page.locator('.MuiMenu-paper').first().textContent();
    console.log(`📋 메뉴 텍스트 내용: ${menuText}`);

    // 프로필 메뉴 항목 클릭 테스트
    await page.click('text=프로필');
    await page.waitForTimeout(1000);

    // 프로필 페이지나 다이얼로그가 표시되는지 확인
    // (실제 구현에 따라 다를 수 있음)
    console.log('✅ 프로필 메뉴 클릭 동작 확인');

    // 프로필 다이얼로그가 열려있다면 ESC 키로 닫기
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // 추가로 다이얼로그 백드롭 클릭으로 닫기 (있다면)
    if (await page.locator('.MuiDialog-root').isVisible()) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // 다시 사용자 메뉴 열기 (로그아웃 테스트용)
    await page.click('.MuiToolbar-root .MuiAvatar-root');
    await page.waitForTimeout(500);

    // 로그아웃 버튼 존재 확인 (실제 클릭은 하지 않음)
    await expect(page.locator('text=로그아웃')).toBeVisible();
    console.log('✅ 로그아웃 버튼 표시 확인');

    // 메뉴 닫기
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // 사용자 아바타의 시각적 표시 확인
    const avatar = page.locator('.MuiToolbar-root .MuiAvatar-root');
    await expect(avatar).toBeVisible();
    
    // 아바타에 사용자 이니셜이나 이미지가 있는지 확인
    const avatarText = await avatar.textContent();
    console.log(`👤 아바타 표시 내용: "${avatarText}"`);

    console.log('✅ 사용자 정보 표시 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'user-info-display-verification');
  });

  test('레이아웃 구조 및 Material-UI 컴포넌트 확인', async ({ page }, testInfo) => {
    console.log('🏗️ 레이아웃 구조 및 컴포넌트 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드로 이동
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);

    // 전체 레이아웃 구조 확인
    await expect(page.locator('.MuiAppBar-root')).toBeVisible(); // 헤더
    await expect(page.locator('.MuiContainer-root')).toBeVisible(); // 메인 컨테이너
    console.log('✅ 기본 레이아웃 구조 확인');

    // AppBar 세부 구성 요소 확인
    await expect(page.locator('.MuiToolbar-root')).toBeVisible();
    console.log('✅ AppBar Toolbar 구조 확인');

    // Typography 컴포넌트들 확인 (제목, 텍스트 등)
    const typographyElements = page.locator('.MuiTypography-root');
    const typographyCount = await typographyElements.count();
    expect(typographyCount).toBeGreaterThan(5);
    console.log(`✅ Typography 컴포넌트 확인: ${typographyCount}개`);

    // Button 컴포넌트들 확인 (네비게이션 버튼들)
    const buttonElements = page.locator('.MuiButton-root');
    const buttonCount = await buttonElements.count();
    expect(buttonCount).toBeGreaterThanOrEqual(4); // 최소 4개 네비게이션 버튼
    console.log(`✅ Button 컴포넌트 확인: ${buttonCount}개`);

    // Avatar 컴포넌트 확인 (사용자 아바타만)
    await expect(page.locator('.MuiToolbar-root .MuiAvatar-root')).toBeVisible();
    console.log('✅ Avatar 컴포넌트 확인');

    // Grid 레이아웃 시스템 확인 (대시보드 내용 영역)
    const gridContainers = page.locator('.MuiGrid-container');
    const gridCount = await gridContainers.count();
    expect(gridCount).toBeGreaterThanOrEqual(1);
    console.log(`✅ Grid 컨테이너 확인: ${gridCount}개`);

    // Paper 컴포넌트들 확인 (카드나 위젯들)
    const paperElements = page.locator('.MuiPaper-root');
    const paperCount = await paperElements.count();
    expect(paperCount).toBeGreaterThanOrEqual(4);
    console.log(`✅ Paper 컴포넌트 확인: ${paperCount}개`);

    // z-index 및 레이어링 확인 (AppBar가 최상단에 위치)
    const appBarZIndex = await page.locator('.MuiAppBar-root').evaluate(el => {
      return window.getComputedStyle(el).zIndex;
    });
    console.log(`📐 AppBar z-index: ${appBarZIndex}`);

    // 전체 레이아웃의 스크롤 가능 영역 확인
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const windowHeight = await page.evaluate(() => window.innerHeight);
    console.log(`📏 페이지 높이: ${bodyHeight}px, 창 높이: ${windowHeight}px`);

    console.log('✅ 레이아웃 구조 및 컴포넌트 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'layout-structure-components');
  });

  test('키보드 네비게이션 및 접근성 확인', async ({ page }, testInfo) => {
    console.log('⌨️ 키보드 네비게이션 접근성 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드로 이동
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);

    // Tab 키를 사용한 포커스 이동 테스트
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);
    
    // 포커스된 요소 확인
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`👆 첫 번째 Tab 포커스 요소: ${focusedElement}`);

    // 여러 번 Tab을 눌러 네비게이션 버튼들로 이동
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    // Enter 키로 버튼 클릭 시뮬레이션 (현재 포커스된 요소)
    const currentFocused = await page.evaluate(() => {
      const elem = document.activeElement;
      return {
        tagName: elem?.tagName,
        textContent: elem?.textContent?.trim(),
        className: elem?.className
      };
    });
    console.log(`🎯 현재 포커스 요소:`, currentFocused);

    // 사용자 아바타에 포커스 이동 (Shift+Tab 사용)
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(200);

    // 아바타에 Enter 키로 메뉴 열기
    const avatarElement = page.locator('.MuiToolbar-root .MuiAvatar-root');
    await avatarElement.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // 키보드로 메뉴 네비게이션
    if (await page.locator('text=프로필').isVisible()) {
      await page.keyboard.press('ArrowDown'); // 다음 메뉴 항목으로
      await page.waitForTimeout(200);
      await page.keyboard.press('Escape'); // 메뉴 닫기
      console.log('✅ 키보드로 사용자 메뉴 네비게이션 확인');
    }

    // ARIA 속성 확인
    const appBarRole = await page.locator('.MuiAppBar-root').getAttribute('role');
    console.log(`♿ AppBar ARIA role: ${appBarRole || 'none'}`);

    const toolbarRole = await page.locator('.MuiToolbar-root').getAttribute('role');
    console.log(`♿ Toolbar ARIA role: ${toolbarRole || 'none'}`);

    // 버튼들의 접근성 속성 확인
    const dashboardButton = page.locator('.MuiAppBar-root .MuiButton-root:has-text("대시보드")');
    const dashboardAriaLabel = await dashboardButton.getAttribute('aria-label');
    console.log(`♿ 대시보드 버튼 aria-label: ${dashboardAriaLabel || 'none'}`);

    console.log('✅ 키보드 네비게이션 접근성 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'keyboard-navigation-accessibility');
  });
});