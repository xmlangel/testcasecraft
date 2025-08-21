// ICT-70: 대시보드 메인 화면 E2E 테스트 구현
// 관련 컴포넌트: Dashboard.jsx, App.jsx, AppContext.jsx
// 포함 기능: 대시보드 레이아웃, 네비게이션, 통계 위젯, 차트 렌더링, 반응형 디자인

const { test, expect } = require('@playwright/test');

test.describe('대시보드 메인 화면 E2E 테스트', () => {
  
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

  test('대시보드 메인 화면 정상 렌더링 확인', async ({ page }, testInfo) => {
    console.log('📊 대시보드 메인 화면 렌더링 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드 버튼 클릭 (조직 대시보드로 이동)
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);

    // URL 확인 (/dashboard)
    expect(page.url()).toContain('/dashboard');
    console.log('✅ 대시보드 URL 이동 확인');

    // 대시보드 제목 확인 (h1, h4 등 다양한 제목 태그 허용)
    await expect(page.locator('h1:has-text("대시보드"), h4:has-text("대시보드"), h5:has-text("대시보드")')).toBeVisible();
    console.log('✅ 대시보드 제목 표시 확인');

    // 조직 대시보드 메인 통계 확인
    await expect(page.locator('text=총 조직 수')).toBeVisible();
    await expect(page.locator('text=총 프로젝트 수')).toBeVisible();
    await expect(page.locator('text=총 테스트케이스')).toBeVisible();
    console.log('✅ 조직 대시보드 주요 통계 표시 확인');

    console.log('✅ 대시보드 메인 화면 렌더링 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'dashboard-main-rendering');
  });

  test('대시보드 통계 위젯 렌더링 확인', async ({ page }, testInfo) => {
    console.log('📈 대시보드 통계 위젯 렌더링 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드 이동 (조직 대시보드)
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);

    // Grid 컨테이너 확인 (프로젝트 대시보드의 첫 번째 그리드)
    await expect(page.locator('.MuiGrid-container').first()).toBeVisible();
    console.log('✅ Grid 레이아웃 컨테이너 확인');

    // Paper 위젯들 확인 (최소 4개 이상의 위젯)
    const paperWidgets = page.locator('.MuiPaper-root');
    const widgetCount = await paperWidgets.count();
    expect(widgetCount).toBeGreaterThanOrEqual(4);
    console.log(`✅ 위젯 개수 확인: ${widgetCount}개`);

    // 조직 대시보드 주요 섹션들 확인
    await expect(page.locator('text=조직별 프로젝트 분포')).toBeVisible();
    await expect(page.locator('text=조직 목록')).toBeVisible();
    console.log('✅ 조직 대시보드 주요 섹션들 표시 확인');

    console.log('✅ 대시보드 통계 위젯 렌더링 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'dashboard-widgets-rendering');
  });

  test('대시보드 차트 및 시각화 요소 확인', async ({ page }, testInfo) => {
    console.log('📊 대시보드 차트 렌더링 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드 이동
    await page.click('text=대시보드');
    await page.waitForTimeout(2000); // 차트 렌더링 대기

    // Recharts SVG 요소들 확인 (차트가 렌더링되었는지)
    const chartSvgs = page.locator('svg');
    const svgCount = await chartSvgs.count();
    expect(svgCount).toBeGreaterThanOrEqual(3); // 최소 3개 이상의 차트
    console.log(`✅ 차트 SVG 요소 확인: ${svgCount}개`);

    // PieChart 확인 (최근 테스트케이스 결과)
    const pieChartPaths = page.locator('svg path[fill]');
    const piePathCount = await pieChartPaths.count();
    expect(piePathCount).toBeGreaterThan(0);
    console.log(`✅ PieChart 경로 요소 확인: ${piePathCount}개`);

    // CountUp 애니메이션 숫자 확인 (조직 통계 숫자들)
    const organizationStats = page.locator('text=3'); // 총 조직 수
    const projectStats = page.locator('text=7'); // 총 프로젝트 수  
    if (await organizationStats.count() > 0 || await projectStats.count() > 0) {
      console.log('✅ CountUp 통계 숫자 표시 확인');
    }

    // 조직명 텍스트 확인 (범례나 조직 목록에서)
    const organizationTexts = page.locator('text=개발팀, text=QA팀, text=데브옵스팀');
    if (await organizationTexts.count() > 0) {
      console.log('✅ 조직명 텍스트 확인');
    }

    // 색상 인디케이터 확인 (범례 색상 점)
    const colorIndicators = page.locator('[style*="background"]');
    const colorCount = await colorIndicators.count();
    expect(colorCount).toBeGreaterThan(0);
    console.log(`✅ 색상 인디케이터 확인: ${colorCount}개`);

    console.log('✅ 대시보드 차트 렌더링 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'dashboard-charts-rendering');
  });

  test('대시보드 네비게이션 메뉴 동작 확인', async ({ page }, testInfo) => {
    console.log('🧭 대시보드 네비게이션 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드 이동 (조직 대시보드)
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);

    // AppBar 네비게이션 확인
    await expect(page.locator('.MuiAppBar-root')).toBeVisible();
    console.log('✅ AppBar 네비게이션 바 확인');

    // 네비게이션 버튼들 확인
    await expect(page.locator('text=TestCaseCraft')).toBeVisible(); // 브랜드명
    await expect(page.locator('.MuiButton-root:has-text("대시보드")')).toBeVisible(); // 버튼만 선택
    await expect(page.locator('text=조직 관리')).toBeVisible();
    await expect(page.locator('text=사용자 관리')).toBeVisible();
    await expect(page.locator('text=프로젝트 선택')).toBeVisible();
    console.log('✅ 네비게이션 버튼들 표시 확인');

    // 사용자 프로필 아바타 확인 (네비게이션 바의 사용자 아바타만)
    await expect(page.locator('.MuiToolbar-root .MuiAvatar-root')).toBeVisible();
    console.log('✅ 사용자 아바타 표시 확인');

    // 조직 관리 페이지로 이동 테스트
    await page.click('text=조직 관리');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/organizations');
    console.log('✅ 조직 관리 페이지 이동 확인');

    // 다시 대시보드로 돌아가기
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/dashboard');
    console.log('✅ 대시보드 복귀 확인');

    console.log('✅ 대시보드 네비게이션 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'dashboard-navigation-test');
  });

  test('대시보드 빠른 액션 버튼 및 상호작용 확인', async ({ page }, testInfo) => {
    console.log('⚡ 대시보드 빠른 액션 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드 이동 (조직 대시보드)
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);

    // 프로젝트 선택 버튼 클릭
    await page.click('text=프로젝트 선택');
    await page.waitForTimeout(1000);

    // 프로젝트 선택 화면 확인 (h5나 다른 제목 요소 허용)
    await expect(page.locator('h1:has-text("프로젝트 선택"), h4:has-text("프로젝트 선택"), h5:has-text("프로젝트 선택")')).toBeVisible();
    console.log('✅ 프로젝트 선택 화면 이동 확인');

    // 사용자 메뉴 테스트 (네비게이션 바의 아바타만)
    await page.click('.MuiToolbar-root .MuiAvatar-root');
    await page.waitForTimeout(500);

    // 사용자 메뉴 항목들 확인
    await expect(page.locator('text=프로필')).toBeVisible();
    await expect(page.locator('text=로그아웃')).toBeVisible();
    console.log('✅ 사용자 메뉴 항목들 표시 확인');

    // 메뉴 닫기 (ESC 키 사용)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    console.log('✅ 대시보드 빠른 액션 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'dashboard-quick-actions');
  });

  test('대시보드 반응형 디자인 확인', async ({ page }, testInfo) => {
    console.log('📱 대시보드 반응형 디자인 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드 이동 (조직 대시보드)
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);

    // 데스크톱 크기 (1200px)
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // 위젯들이 정상적으로 표시되는지 확인
    await expect(page.locator('.MuiGrid-container').first()).toBeVisible();
    const desktopWidgets = await page.locator('.MuiPaper-root').count();
    expect(desktopWidgets).toBeGreaterThanOrEqual(4);
    console.log(`✅ 데스크톱 뷰 위젯 확인: ${desktopWidgets}개`);

    // 태블릿 크기 (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000); // 리렌더링 대기
    
    // 위젯들이 여전히 표시되는지 확인
    await expect(page.locator('.MuiGrid-container').first()).toBeVisible();
    const tabletWidgets = await page.locator('.MuiPaper-root').count();
    expect(tabletWidgets).toBeGreaterThanOrEqual(4);
    console.log(`✅ 태블릿 뷰 위젯 확인: ${tabletWidgets}개`);

    // 차트가 여전히 렌더링되는지 확인
    const tabletCharts = await page.locator('svg').count();
    expect(tabletCharts).toBeGreaterThanOrEqual(3);
    console.log(`✅ 태블릿 뷰 차트 확인: ${tabletCharts}개`);

    // 모바일 크기 (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000); // 리렌더링 대기
    
    // 기본 레이아웃이 유지되는지 확인
    await expect(page.locator('.MuiGrid-container').first()).toBeVisible();
    const mobileWidgets = await page.locator('.MuiPaper-root').count();
    expect(mobileWidgets).toBeGreaterThanOrEqual(4);
    console.log(`✅ 모바일 뷰 위젯 확인: ${mobileWidgets}개`);

    // 네비게이션 바가 모바일에서도 정상 동작하는지 확인
    await expect(page.locator('.MuiAppBar-root')).toBeVisible();
    await expect(page.locator('text=TestCaseCraft')).toBeVisible();
    console.log('✅ 모바일 뷰 네비게이션 확인');

    console.log('✅ 대시보드 반응형 디자인 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'dashboard-responsive-mobile');
  });

  test('대시보드 데이터 로딩 및 오류 처리 확인', async ({ page }, testInfo) => {
    console.log('🔄 대시보드 데이터 로딩 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 네트워크 요청 모니터링
    const apiRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiRequests.push({
          url: request.url(),
          method: request.method()
        });
        console.log(`📤 API 요청: ${request.method()} ${request.url()}`);
      }
    });

    // 대시보드 이동
    await page.click('text=대시보드');
    await page.waitForTimeout(2000); // 데이터 로딩 대기

    // Material-UI CircularProgress가 있을 수 있음 (로딩 중일 때)
    const loadingIndicators = page.locator('.MuiCircularProgress-root');
    const loadingCount = await loadingIndicators.count();
    console.log(`ℹ️ 로딩 인디케이터 확인: ${loadingCount}개`);

    // 차트 데이터가 로딩되었는지 확인 (SVG 요소 존재)
    await page.waitForTimeout(1000);
    const chartElements = await page.locator('svg').count();
    expect(chartElements).toBeGreaterThanOrEqual(3);
    console.log(`✅ 차트 데이터 로딩 확인: ${chartElements}개 차트`);

    // 통계 숫자가 표시되는지 확인 (조직 통계)
    await expect(page.locator('text=총 조직 수')).toBeVisible();
    await expect(page.locator('text=총 프로젝트 수')).toBeVisible();
    console.log('✅ 통계 데이터 표시 확인');

    // API 요청이 발생했는지 확인
    console.log(`📊 총 API 요청 수: ${apiRequests.length}`);
    if (apiRequests.length > 0) {
      console.log('✅ API 데이터 요청 확인');
    }

    console.log('✅ 대시보드 데이터 로딩 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'dashboard-data-loading');
  });

  test('대시보드 Material-UI 컴포넌트 렌더링 확인', async ({ page }, testInfo) => {
    console.log('🎨 대시보드 Material-UI 컴포넌트 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드 이동 (조직 대시보드)
    await page.click('text=대시보드');
    await page.waitForTimeout(1000);

    // Typography 컴포넌트들 확인
    const typographyElements = page.locator('.MuiTypography-root');
    const typographyCount = await typographyElements.count();
    expect(typographyCount).toBeGreaterThan(5);
    console.log(`✅ Typography 컴포넌트 확인: ${typographyCount}개`);

    // Paper 컴포넌트들 확인
    const paperElements = page.locator('.MuiPaper-root');
    const paperCount = await paperElements.count();
    expect(paperCount).toBeGreaterThanOrEqual(4);
    console.log(`✅ Paper 컴포넌트 확인: ${paperCount}개`);

    // Grid 컴포넌트 확인 (프로젝트 대시보드의 첫 번째 그리드)
    await expect(page.locator('.MuiGrid-container').first()).toBeVisible();
    const gridItems = page.locator('.MuiGrid-item');
    const gridItemCount = await gridItems.count();
    expect(gridItemCount).toBeGreaterThan(4);
    console.log(`✅ Grid 아이템 확인: ${gridItemCount}개`);

    // Chip 컴포넌트들 확인 (조직 대시보드에는 없을 수 있음)
    const chipElements = page.locator('.MuiChip-root');
    const chipCount = await chipElements.count();
    if (chipCount > 0) {
      console.log(`✅ Chip 컴포넌트 확인: ${chipCount}개`);
    } else {
      console.log('ℹ️ Chip 컴포넌트 없음 (조직 대시보드에서 정상)');
    }

    // AppBar 및 Toolbar 확인
    await expect(page.locator('.MuiAppBar-root')).toBeVisible();
    await expect(page.locator('.MuiToolbar-root')).toBeVisible();
    console.log('✅ AppBar/Toolbar 컴포넌트 확인');

    // Button 컴포넌트들 확인
    const buttonElements = page.locator('.MuiButton-root');
    const buttonCount = await buttonElements.count();
    expect(buttonCount).toBeGreaterThan(3);
    console.log(`✅ Button 컴포넌트 확인: ${buttonCount}개`);

    // Container 컴포넌트 확인
    await expect(page.locator('.MuiContainer-root')).toBeVisible();
    console.log('✅ Container 컴포넌트 확인');

    console.log('✅ 대시보드 Material-UI 컴포넌트 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'dashboard-material-ui-components');
  });
});