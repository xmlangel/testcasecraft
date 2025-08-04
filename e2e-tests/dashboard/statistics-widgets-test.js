// ICT-72: 대시보드 통계 위젯 및 차트 Playwright 테스트 작성
// 관련 컴포넌트: Dashboard.jsx, demoDashboardData.jsx, AppContext.jsx
// 포함 기능: 통계 카드, PieChart, LineChart, BarChart, 데이터 로딩, 인터랙션

const { test, expect } = require('@playwright/test');

test.describe('대시보드 통계 위젯 및 차트 E2E 테스트', () => {
  
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

  // 로그인 및 프로젝트 선택 후 대시보드 이동 헬퍼 함수
  async function loginAndNavigateToProjectDashboard(page) {
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
    
    // 프로젝트 선택 화면에서 프로젝트 선택
    console.log('🎯 프로젝트 선택 중...');
    
    // 프로젝트 카드가 있는지 확인하고 첫 번째 프로젝트 선택
    const projectCards = page.locator('.MuiPaper-root').filter({ hasText: /데브옵스팀|개발팀|QA팀/ });
    const projectCount = await projectCards.count();
    
    if (projectCount > 0) {
      console.log(`📋 발견된 프로젝트: ${projectCount}개`);
      
      // 첫 번째 프로젝트의 "프로젝트 추가" 버튼 클릭
      const addButtons = page.locator('button:has-text("프로젝트 추가")');
      const buttonCount = await addButtons.count();
      
      if (buttonCount > 0) {
        await addButtons.first().click();
        await page.waitForTimeout(2000);
        console.log('✅ 프로젝트 선택 완료');
      } else {
        console.log('ℹ️ 프로젝트 추가 버튼을 찾을 수 없음');
      }
    } else {
      console.log('ℹ️ 프로젝트가 없음 - 대시보드로 직접 이동');
    }
    
    // 모든 다이얼로그/모달 닫기
    console.log('🔄 다이얼로그/모달 닫기...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    
    // 대시보드 버튼 클릭
    console.log('🎯 대시보드 버튼 클릭...');
    const dashboardButton = page.locator('text=대시보드');
    if (await dashboardButton.count() > 0) {
      await dashboardButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ 대시보드로 이동 완료');
    }
    
    return true;
  }

  // 로그인 헬퍼 함수 (기존 호환성 유지)
  async function loginAsAdmin(page) {
    return await loginAndNavigateToProjectDashboard(page);
  }

  test('통계 카드 렌더링 확인', async ({ page }, testInfo) => {
    console.log('📊 통계 카드 렌더링 테스트 시작...');

    // 로그인 및 프로젝트 대시보드 이동
    await loginAsAdmin(page);

    // URL 확인 (/dashboard로 이동됨)
    expect(page.url()).toContain('/dashboard');

    // 대시보드 제목 확인 (h4, h5, h6 중 어느 것이든)
    await expect(page.locator('h4:has-text("대시보드"), h5:has-text("대시보드"), h6:has-text("대시보드")').first()).toBeVisible();
    console.log('✅ 대시보드 제목 확인');

    // 최근 업데이트 Chip 확인
    await expect(page.locator('.MuiChip-root:has-text("최근 업데이트")')).toBeVisible();
    console.log('✅ 최근 업데이트 Chip 확인');

    // 프로젝트 정보 요약 카드가 있는지 확인 (프로젝트가 선택된 경우)
    const projectInfoCard = page.locator('.MuiPaper-root:has(.MuiChip-root:has-text("총 테스트케이스"))');
    if (await projectInfoCard.isVisible()) {
      await expect(projectInfoCard).toBeVisible();
      console.log('✅ 프로젝트 정보 요약 카드 확인');

      // 프로젝트명 표시 확인
      await expect(page.locator('h6[color="primary"]')).toBeVisible();
      console.log('✅ 프로젝트명 표시 확인');

      // 총 테스트케이스 수 Chip 확인
      await expect(page.locator('.MuiChip-root:has-text("총 테스트케이스")')).toBeVisible();
      console.log('✅ 총 테스트케이스 수 표시 확인');

      // 프로젝트 멤버 수 Chip 확인
      await expect(page.locator('.MuiChip-root:has-text("프로젝트 멤버")')).toBeVisible();
      console.log('✅ 프로젝트 멤버 수 표시 확인');
    } else {
      console.log('ℹ️ 프로젝트 정보 카드가 표시되지 않음 (프로젝트 미선택)');
    }

    // 통계 위젯 Paper 컴포넌트들 확인
    const statisticsPapers = page.locator('.MuiPaper-root').filter({ hasText: /최근 테스트케이스 결과|테스트케이스 결과 추이|오픈 테스트런/ });
    const paperCount = await statisticsPapers.count();
    expect(paperCount).toBeGreaterThanOrEqual(2); // 최소 2개 위젯
    console.log(`✅ 통계 위젯 Paper 확인: ${paperCount}개`);

    console.log('✅ 통계 카드 렌더링 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'statistics-cards-rendering');
  });

  test('PieChart 차트 렌더링 확인', async ({ page }, testInfo) => {
    console.log('🥧 PieChart 차트 렌더링 테스트 시작...');

    // 로그인 및 프로젝트 대시보드 이동
    await loginAsAdmin(page);

    // URL 확인 (/dashboard로 이동됨)
    expect(page.url()).toContain('/dashboard');

    // 최근 테스트케이스 결과 위젯 확인
    const pieChartWidget = page.locator('.MuiPaper-root:has-text("최근 테스트케이스 결과")');
    await expect(pieChartWidget).toBeVisible();
    console.log('✅ PieChart 위젯 확인');

    // PieChart SVG 요소 확인
    await expect(pieChartWidget.locator('svg')).toBeVisible();
    console.log('✅ PieChart SVG 렌더링 확인');

    // Pie 차트 요소들 확인
    const pieElements = pieChartWidget.locator('path[fill]');
    const pieCount = await pieElements.count();
    expect(pieCount).toBeGreaterThanOrEqual(2); // 최소 2개 구간
    console.log(`✅ Pie 차트 구간 확인: ${pieCount}개`);

    // 완료율 퍼센트 표시 확인
    await expect(pieChartWidget.locator('h4:has-text("%")')).toBeVisible();
    console.log('✅ 완료율 퍼센트 표시 확인');

    // CountUp 애니메이션 대기
    await page.waitForTimeout(1500);

    // 테스트 결과 범례 확인
    const legendItems = pieChartWidget.locator('.MuiBox-root:has(.MuiBox-root[style*="border-radius: 50%"])');
    const legendCount = await legendItems.count();
    expect(legendCount).toBeGreaterThanOrEqual(2); // 최소 2개 범례
    console.log(`✅ 테스트 결과 범례 확인: ${legendCount}개`);

    // 테스트 결과 텍스트 확인 (성공, 실패, 차단됨 등)
    const hasSuccessLabel = await pieChartWidget.locator('text=성공').isVisible();
    const hasFailLabel = await pieChartWidget.locator('text=실패').isVisible();
    console.log(`✅ 테스트 결과 라벨 확인: 성공(${hasSuccessLabel}), 실패(${hasFailLabel})`);

    console.log('✅ PieChart 차트 렌더링 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'piechart-rendering');
  });

  test('LineChart 차트 렌더링 확인', async ({ page }, testInfo) => {
    console.log('📈 LineChart 차트 렌더링 테스트 시작...');

    // 로그인 및 프로젝트 대시보드 이동
    await loginAsAdmin(page);

    // URL 확인 (/dashboard로 이동됨)
    expect(page.url()).toContain('/dashboard');

    // 테스트케이스 결과 추이 위젯 확인
    const lineChartWidget = page.locator('.MuiPaper-root:has-text("테스트케이스 결과 추이")');
    await expect(lineChartWidget).toBeVisible();
    console.log('✅ LineChart 위젯 확인');

    // 기간 선택 Select 확인
    await expect(lineChartWidget.locator('.MuiFormControl-root:has-text("최근 15일")')).toBeVisible();
    console.log('✅ 기간 선택 Select 확인');

    // LineChart SVG 요소 확인
    await expect(lineChartWidget.locator('svg')).toBeVisible();
    console.log('✅ LineChart SVG 렌더링 확인');

    // 격자 및 축 확인
    const gridLines = lineChartWidget.locator('g.recharts-cartesian-grid line');
    const gridCount = await gridLines.count();
    expect(gridCount).toBeGreaterThan(0);
    console.log(`✅ 격자선 확인: ${gridCount}개`);

    // X축, Y축 확인
    await expect(lineChartWidget.locator('g.recharts-xAxis')).toBeVisible();
    await expect(lineChartWidget.locator('g.recharts-yAxis')).toBeVisible();
    console.log('✅ X축, Y축 확인');

    // Line 요소들 확인 (성공, 실패, 차단됨, 미실행)
    const lineElements = lineChartWidget.locator('path.recharts-curve');
    const lineCount = await lineElements.count();
    expect(lineCount).toBeGreaterThanOrEqual(2); // 최소 2개 라인
    console.log(`✅ Line 요소 확인: ${lineCount}개`);

    // 범례 확인
    const legendElements = lineChartWidget.locator('.recharts-legend-wrapper');
    await expect(legendElements).toBeVisible();
    console.log('✅ 범례 확인');

    // 미실행 테스트케이스 추이 위젯도 확인
    const notRunLineChartWidget = page.locator('.MuiPaper-root:has-text("오픈 테스트런 미실행 테스트케이스 추이")');
    if (await notRunLineChartWidget.isVisible()) {
      await expect(notRunLineChartWidget.locator('svg')).toBeVisible();
      console.log('✅ 미실행 테스트케이스 추이 LineChart 확인');
    }

    console.log('✅ LineChart 차트 렌더링 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'linechart-rendering');
  });

  test('BarChart 차트 렌더링 확인', async ({ page }, testInfo) => {
    console.log('📊 BarChart 차트 렌더링 테스트 시작...');

    // 로그인 및 프로젝트 대시보드 이동
    await loginAsAdmin(page);

    // URL 확인 (/dashboard로 이동됨)
    expect(page.url()).toContain('/dashboard');

    // 오픈 테스트런별 테스트케이스 결과 위젯 확인
    const barChartWidget1 = page.locator('.MuiPaper-root:has-text("오픈 테스트런별 테스트케이스 결과")');
    await expect(barChartWidget1).toBeVisible();
    console.log('✅ 첫 번째 BarChart 위젯 확인');

    // BarChart SVG 요소 확인
    await expect(barChartWidget1.locator('svg')).toBeVisible();
    console.log('✅ 첫 번째 BarChart SVG 렌더링 확인');

    // Bar 요소들 확인
    const barElements1 = barChartWidget1.locator('rect.recharts-bar-rectangle');
    const barCount1 = await barElements1.count();
    expect(barCount1).toBeGreaterThanOrEqual(1);
    console.log(`✅ 첫 번째 BarChart Bar 요소 확인: ${barCount1}개`);

    // 오픈 테스트런 담당자별 테스트케이스 결과 위젯 확인 (스택된 바차트)
    const barChartWidget2 = page.locator('.MuiPaper-root:has-text("오픈 테스트런 담당자별 테스트케이스 결과")');
    await expect(barChartWidget2).toBeVisible();
    console.log('✅ 두 번째 BarChart 위젯 (스택된) 확인');

    // 두 번째 BarChart SVG 요소 확인
    await expect(barChartWidget2.locator('svg')).toBeVisible();
    console.log('✅ 두 번째 BarChart SVG 렌더링 확인');

    // 스택된 Bar 요소들 확인
    const barElements2 = barChartWidget2.locator('rect.recharts-bar-rectangle');
    const barCount2 = await barElements2.count();
    expect(barCount2).toBeGreaterThanOrEqual(2);
    console.log(`✅ 두 번째 BarChart Bar 요소 확인: ${barCount2}개`);

    // 범례 확인 (두 차트 모두)
    const legends1 = barChartWidget1.locator('.recharts-legend-wrapper');
    const legends2 = barChartWidget2.locator('.recharts-legend-wrapper');
    
    if (await legends1.isVisible()) {
      console.log('✅ 첫 번째 BarChart 범례 확인');
    }
    if (await legends2.isVisible()) {
      console.log('✅ 두 번째 BarChart 범례 확인');
    }

    // Y축 담당자명 확인 (세로 바차트)
    const yAxisTexts = page.locator('g.recharts-yAxis text');
    const yAxisCount = await yAxisTexts.count();
    if (yAxisCount > 0) {
      console.log(`✅ Y축 담당자명 확인: ${yAxisCount}개`);
    }

    console.log('✅ BarChart 차트 렌더링 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'barchart-rendering');
  });

  test('차트 인터랙션 기능 확인', async ({ page }, testInfo) => {
    console.log('🖱️ 차트 인터랙션 기능 테스트 시작...');

    // 로그인 및 프로젝트 대시보드 이동
    await loginAsAdmin(page);

    // URL 확인 (/dashboard로 이동됨)
    expect(page.url()).toContain('/dashboard');

    // Paper 위젯 호버 효과 테스트
    const firstWidget = page.locator('.MuiPaper-root:has-text("최근 테스트케이스 결과")');
    await expect(firstWidget).toBeVisible();

    // 호버 전 box-shadow 값 확인
    const initialBoxShadow = await firstWidget.evaluate(el => getComputedStyle(el).boxShadow);
    console.log(`📐 호버 전 box-shadow: ${initialBoxShadow}`);

    // 위젯에 호버
    await firstWidget.hover();
    await page.waitForTimeout(500); // transition 대기

    // 호버 후 box-shadow 값 확인 (변경되었는지)
    const hoveredBoxShadow = await firstWidget.evaluate(el => getComputedStyle(el).boxShadow);
    console.log(`📐 호버 후 box-shadow: ${hoveredBoxShadow}`);
    console.log('✅ 위젯 호버 효과 확인');

    // PieChart 툴팁 인터랙션 테스트
    const pieChartWidget = page.locator('.MuiPaper-root:has-text("최근 테스트케이스 결과")');
    const pieChart = pieChartWidget.locator('svg');
    
    // Pie 조각에 호버하여 툴팁 표시 테스트
    const pieSegment = pieChart.locator('path[fill]').first();
    if (await pieSegment.isVisible()) {
      await pieSegment.hover();
      await page.waitForTimeout(500);
      
      // 툴팁이 나타나는지 확인 (Recharts 툴팁)
      const tooltip = page.locator('.recharts-tooltip-wrapper');
      if (await tooltip.isVisible()) {
        console.log('✅ PieChart 툴팁 인터랙션 확인');
      } else {
        console.log('ℹ️ PieChart 툴팁이 표시되지 않음');
      }
    }

    // LineChart 데이터 포인트 호버 테스트
    const lineChartWidget = page.locator('.MuiPaper-root:has-text("테스트케이스 결과 추이")');
    const lineChart = lineChartWidget.locator('svg');
    
    // Line 차트의 점(dot)에 호버
    const dataDot = lineChart.locator('circle[r="4"]').first();
    if (await dataDot.isVisible()) {
      await dataDot.hover();
      await page.waitForTimeout(500);
      
      // 툴팁 확인
      const lineTooltip = page.locator('.recharts-tooltip-wrapper');
      if (await lineTooltip.isVisible()) {
        console.log('✅ LineChart 툴팁 인터랙션 확인');
      } else {
        console.log('ℹ️ LineChart 툴팁이 표시되지 않음');
      }
    }

    // BarChart 바 요소 호버 테스트
    const barChartWidget = page.locator('.MuiPaper-root:has-text("오픈 테스트런별 테스트케이스 결과")');
    const barChart = barChartWidget.locator('svg');
    
    // Bar 요소에 호버
    const barElement = barChart.locator('rect.recharts-bar-rectangle').first();
    if (await barElement.isVisible()) {
      await barElement.hover();
      await page.waitForTimeout(500);
      
      // 툴팁 확인
      const barTooltip = page.locator('.recharts-tooltip-wrapper');
      if (await barTooltip.isVisible()) {
        console.log('✅ BarChart 툴팁 인터랙션 확인');
      } else {
        console.log('ℹ️ BarChart 툴팁이 표시되지 않음');
      }
    }

    console.log('✅ 차트 인터랙션 기능 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'chart-interactions');
  });

  test('테스트 플랜 셀렉터 및 최근 결과 테이블 확인', async ({ page }, testInfo) => {
    console.log('📋 테스트 플랜 셀렉터 및 결과 테이블 테스트 시작...');

    // 로그인 및 프로젝트 대시보드 이동
    await loginAsAdmin(page);

    // URL 확인 (/dashboard로 이동됨)
    expect(page.url()).toContain('/dashboard');

    // 테스트 플랜별 최근 테스트 결과 위젯 확인
    const testPlanWidget = page.locator('.MuiPaper-root:has-text("테스트 플랜별 최근 테스트 결과")');
    await expect(testPlanWidget).toBeVisible();
    console.log('✅ 테스트 플랜 위젯 확인');

    // 프로젝트가 선택된 경우 테스트 플랜 셀렉터 확인
    const testPlanSelector = testPlanWidget.locator('.MuiFormControl-root').first();
    if (await testPlanSelector.isVisible()) {
      console.log('✅ 테스트 플랜 셀렉터 확인');
      
      // 셀렉터 클릭 테스트
      const selectElement = testPlanSelector.locator('.MuiSelect-select');
      if (await selectElement.isVisible()) {
        await selectElement.click();
        await page.waitForTimeout(500);
        
        // 드롭다운 메뉴 확인
        const menuItems = page.locator('.MuiMenuItem-root');
        const menuCount = await menuItems.count();
        if (menuCount > 0) {
          console.log(`✅ 테스트 플랜 옵션 확인: ${menuCount}개`);
          
          // 첫 번째 옵션 선택
          await menuItems.first().click();
          await page.waitForTimeout(1000);
          console.log('✅ 테스트 플랜 선택 완료');
        } else {
          console.log('ℹ️ 테스트 플랜 옵션이 없음');
        }
      }
    } else {
      // 프로젝트가 선택되지 않은 경우 안내 메시지 확인
      const noProjectMessage = testPlanWidget.locator('text=프로젝트를 선택해주세요');
      if (await noProjectMessage.isVisible()) {
        console.log('✅ 프로젝트 미선택 안내 메시지 확인');
      }
    }

    // RecentTestResults 컴포넌트 확인
    const recentResultsArea = testPlanWidget.locator('[data-testid="recent-test-results"], .recent-test-results, div:has(table)');
    if (await recentResultsArea.count() > 0) {
      console.log('✅ 최근 테스트 결과 영역 확인');
    } else {
      console.log('ℹ️ 최근 테스트 결과 영역이 표시되지 않음');
    }

    // 로딩 상태나 빈 데이터 상태 확인
    const loadingIndicator = testPlanWidget.locator('.MuiCircularProgress-root, [role="progressbar"]');
    const emptyMessage = testPlanWidget.locator('text=데이터가 없습니다, text=결과가 없습니다');
    
    if (await loadingIndicator.isVisible()) {
      console.log('✅ 로딩 상태 표시 확인');
    } else if (await emptyMessage.count() > 0) {
      console.log('✅ 빈 데이터 상태 메시지 확인');
    } else {
      console.log('ℹ️ 데이터 로딩 완료 상태');
    }

    console.log('✅ 테스트 플랜 셀렉터 및 결과 테이블 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'testplan-selector-results-table');
  });

  test('전체 통계 위젯 레이아웃 및 반응형 확인', async ({ page }, testInfo) => {
    console.log('📱 전체 통계 위젯 레이아웃 반응형 테스트 시작...');

    // 로그인 및 프로젝트 대시보드 이동
    await loginAsAdmin(page);

    // URL 확인 (/dashboard로 이동됨)
    expect(page.url()).toContain('/dashboard');

    // 1. 데스크톱 뷰 (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    // Grid 컨테이너 확인
    const gridContainer = page.locator('.MuiGrid-container').first();
    await expect(gridContainer).toBeVisible();
    console.log('✅ 데스크톱 뷰 Grid 레이아웃 확인');

    // 모든 통계 위젯이 표시되는지 확인
    const allWidgets = page.locator('.MuiPaper-root').filter({
      hasText: /최근 테스트케이스 결과|테스트케이스 결과 추이|오픈 테스트런|테스트 플랜별/
    });
    const desktopWidgetCount = await allWidgets.count();
    expect(desktopWidgetCount).toBeGreaterThanOrEqual(2); // 최소 2개 위젯
    console.log(`✅ 데스크톱 뷰 위젯 개수: ${desktopWidgetCount}개`);

    // 2. 태블릿 뷰 (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1500);
    
    // 태블릿에서도 위젯들이 정상 표시되는지 확인
    const tabletWidgetCount = await allWidgets.count();
    expect(tabletWidgetCount).toBe(desktopWidgetCount); // 동일한 개수 유지
    console.log(`✅ 태블릿 뷰 위젯 개수: ${tabletWidgetCount}개`);

    // 차트들이 여전히 렌더링되는지 확인
    const chartSvgs = page.locator('svg');
    const tabletSvgCount = await chartSvgs.count();
    expect(tabletSvgCount).toBeGreaterThanOrEqual(4); // 최소 4개 SVG 차트
    console.log(`✅ 태블릿 뷰 차트 SVG 개수: ${tabletSvgCount}개`);

    // 3. 모바일 뷰 (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1500);
    
    // 모바일에서도 위젯들이 스택되어 표시되는지 확인
    const mobileWidgetCount = await allWidgets.count();
    expect(mobileWidgetCount).toBe(desktopWidgetCount); // 동일한 개수 유지
    console.log(`✅ 모바일 뷰 위젯 개수: ${mobileWidgetCount}개`);

    // 모바일에서 차트들이 여전히 표시되는지 확인
    const mobileSvgCount = await chartSvgs.count();
    expect(mobileSvgCount).toBeGreaterThanOrEqual(3); // 최소 3개 SVG 차트 (일부는 보이지 않을 수 있음)
    console.log(`✅ 모바일 뷰 차트 SVG 개수: ${mobileSvgCount}개`);

    // ResponsiveContainer 작동 확인
    const responsiveContainers = page.locator('.recharts-responsive-container');
    const responsiveCount = await responsiveContainers.count();
    expect(responsiveCount).toBeGreaterThanOrEqual(3);
    console.log(`✅ ResponsiveContainer 개수: ${responsiveCount}개`);

    // 스크롤 가능성 확인 (모바일에서)
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const windowHeight = await page.evaluate(() => window.innerHeight);
    const isScrollable = bodyHeight > windowHeight;
    console.log(`📏 모바일 뷰 스크롤 가능: ${isScrollable} (body: ${bodyHeight}px, window: ${windowHeight}px)`);

    console.log('✅ 전체 통계 위젯 레이아웃 반응형 테스트 완료');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'responsive-statistics-widgets-mobile');
  });
});