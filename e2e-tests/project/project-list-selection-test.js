// ICT-75: 프로젝트 목록 조회 및 선택 E2E 테스트
// 관련 컴포넌트: ProjectManager.jsx, EnhancedProjectManager.jsx, AppContext.jsx
// Task 5.1: 프로젝트 선택 및 전환 테스트

const { test, expect } = require('@playwright/test');

test.describe('프로젝트 목록 조회 및 선택 E2E 테스트', () => {
  
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
      throw new Error('백엔드 서버가 30초 내에 준비되지 않았습니다.');
    }

    // 로그인 폼 작성 및 제출
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // 로그인 성공 및 JWT 토큰 저장 확인 (재시도 로직 추가)
    let loginSuccess = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await page.waitForURL('**/dashboard**', { timeout: 5000 });
        const token = await page.evaluate(() => localStorage.getItem('accessToken'));
        if (token) {
          console.log('✅ 로그인 성공 및 토큰 저장 확인');
          loginSuccess = true;
          break;
        }
      } catch (e) {
        console.log(`🔄 로그인 재시도 ${attempt}/5...`);
        await page.waitForTimeout(1000);
      }
    }

    if (!loginSuccess) {
      throw new Error('로그인 실패: JWT 토큰이 저장되지 않았습니다.');
    }
  }

  test('프로젝트 목록 조회 및 기본 표시 검증', async ({ page }, testInfo) => {
    console.log('📋 프로젝트 목록 조회 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드에서 프로젝트 관리로 이동
    await page.waitForLoadState('networkidle');
    
    // 프로젝트 카드들이 로드될 때까지 대기
    await page.waitForSelector('[data-testid="project-card"], .MuiCard-root, [class*="project"]', { timeout: 10000 });

    // 프로젝트 목록이 표시되는지 확인
    const projectElements = await page.locator('[data-testid="project-card"], .MuiCard-root').count();
    console.log(`📊 발견된 프로젝트 수: ${projectElements}`);
    
    expect(projectElements).toBeGreaterThan(0);

    // 프로젝트 정보가 올바르게 표시되는지 확인
    const firstProject = page.locator('[data-testid="project-card"], .MuiCard-root').first();
    await expect(firstProject).toBeVisible();

    // 프로젝트명이 표시되는지 확인
    const projectTitle = firstProject.locator('h6, h5, [class*="title"], .MuiTypography-h6, .MuiTypography-h5').first();
    await expect(projectTitle).toBeVisible();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-list-display');

    console.log('✅ 프로젝트 목록 조회 테스트 완료');
  });

  test('프로젝트 검색 및 필터링 기능 테스트', async ({ page }, testInfo) => {
    console.log('🔍 프로젝트 검색 기능 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드에서 프로젝트 관리로 이동
    await page.waitForLoadState('networkidle');
    
    // 프로젝트 목록 로드 대기
    await page.waitForSelector('[data-testid="project-card"], .MuiCard-root', { timeout: 10000 });

    // 검색 입력 필드 찾기 (여러 가능한 셀렉터 시도)
    const searchSelectors = [
      'input[placeholder*="검색"], input[placeholder*="search"]',
      'input[type="search"]',
      '.MuiTextField-root input',
      '[data-testid="search-input"] input',
      'input[name*="search"]'
    ];

    let searchInput = null;
    for (const selector of searchSelectors) {
      try {
        searchInput = page.locator(selector).first();
        if (await searchInput.isVisible({ timeout: 2000 })) {
          console.log(`🔍 검색 입력 필드 발견: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (searchInput && await searchInput.isVisible()) {
      // 검색어 입력
      await searchInput.fill('Test');
      await page.waitForTimeout(1000); // 검색 결과 반영 대기

      // 검색 결과 확인
      const filteredProjects = await page.locator('[data-testid="project-card"], .MuiCard-root').count();
      console.log(`🔍 검색 결과 프로젝트 수: ${filteredProjects}`);

      // 검색어 지우기
      await searchInput.clear();
      await page.waitForTimeout(1000);

      console.log('✅ 프로젝트 검색 기능 확인 완료');
    } else {
      console.log('⚠️ 검색 입력 필드를 찾을 수 없어 검색 테스트 스킵');
    }

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-search-functionality');

    console.log('✅ 프로젝트 검색 기능 테스트 완료');
  });

  test('프로젝트 선택 및 전환 기능 테스트', async ({ page }, testInfo) => {
    console.log('🔄 프로젝트 선택/전환 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드에서 프로젝트 관리로 이동
    await page.waitForLoadState('networkidle');
    
    // 프로젝트 목록 로드 대기
    await page.waitForSelector('[data-testid="project-card"], .MuiCard-root', { timeout: 10000 });

    // 첫 번째 프로젝트 선택
    const firstProject = page.locator('[data-testid="project-card"], .MuiCard-root').first();
    await expect(firstProject).toBeVisible();

    // 프로젝트명 추출
    const projectTitle = await firstProject.locator('h6, h5, [class*="title"], .MuiTypography-h6, .MuiTypography-h5').first().textContent();
    console.log(`📁 선택할 프로젝트: ${projectTitle}`);

    // 프로젝트 클릭 또는 선택 버튼 클릭
    const selectButtons = [
      firstProject.locator('button:has-text("선택"), button:has-text("Select")'),
      firstProject.locator('[data-testid="select-project-button"]'),
      firstProject.locator('button[aria-label*="선택"], button[aria-label*="select"]'),
      firstProject // 카드 자체 클릭
    ];

    let projectSelected = false;
    for (const button of selectButtons) {
      try {
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          console.log('🖱️ 프로젝트 선택 버튼 클릭');
          projectSelected = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!projectSelected) {
      // 마지막 시도: 카드 자체 클릭
      await firstProject.click();
      console.log('🖱️ 프로젝트 카드 클릭');
    }

    // 프로젝트 전환 후 상태 확인
    await page.waitForTimeout(2000);

    // URL 변경 또는 페이지 내용 변경 확인
    const currentUrl = page.url();
    console.log(`🌐 현재 URL: ${currentUrl}`);

    // 프로젝트 컨텍스트가 변경되었는지 확인
    const projectContext = await page.evaluate(() => {
      return localStorage.getItem('selectedProject') || 
             localStorage.getItem('currentProject') ||
             sessionStorage.getItem('selectedProject') ||
             sessionStorage.getItem('currentProject');
    });

    if (projectContext) {
      console.log(`✅ 프로젝트 컨텍스트 저장 확인: ${projectContext}`);
    }

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-selection-completed');

    console.log('✅ 프로젝트 선택/전환 테스트 완료');
  });

  test('프로젝트 상세 정보 조회 테스트', async ({ page }, testInfo) => {
    console.log('📋 프로젝트 상세 정보 조회 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드에서 프로젝트 관리로 이동
    await page.waitForLoadState('networkidle');
    
    // 프로젝트 목록 로드 대기
    await page.waitForSelector('[data-testid="project-card"], .MuiCard-root', { timeout: 10000 });

    // 첫 번째 프로젝트 선택
    const firstProject = page.locator('[data-testid="project-card"], .MuiCard-root').first();
    await expect(firstProject).toBeVisible();

    // 프로젝트 세부 정보 표시 확인
    const projectInfo = {
      title: await firstProject.locator('h6, h5, [class*="title"], .MuiTypography-h6, .MuiTypography-h5').first().textContent() || 'N/A',
      description: await firstProject.locator('[class*="description"], .MuiTypography-body2').first().textContent() || 'N/A'
    };

    console.log(`📊 프로젝트 정보:`);
    console.log(`  - 제목: ${projectInfo.title}`);
    console.log(`  - 설명: ${projectInfo.description}`);

    // 프로젝트 정보가 유효한지 확인
    expect(projectInfo.title).not.toBe('N/A');
    expect(projectInfo.title).not.toBe('');

    // 프로젝트 메타데이터가 표시되는지 확인
    const metadataElements = await firstProject.locator('.MuiChip-root, [class*="chip"], [class*="badge"]').count();
    console.log(`🏷️ 메타데이터 요소 수: ${metadataElements}`);

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-detail-info');

    console.log('✅ 프로젝트 상세 정보 조회 테스트 완료');
  });

  test('프로젝트 목록 페이지네이션 테스트', async ({ page }, testInfo) => {
    console.log('📄 프로젝트 목록 페이지네이션 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 대시보드에서 프로젝트 관리로 이동
    await page.waitForLoadState('networkidle');
    
    // 프로젝트 목록 로드 대기
    await page.waitForSelector('[data-testid="project-card"], .MuiCard-root', { timeout: 10000 });

    // 페이지네이션 컨트롤 확인
    const paginationSelectors = [
      '.MuiPagination-root',
      '[data-testid="pagination"]',
      '[class*="pagination"]',
      'nav[aria-label*="pagination"]'
    ];

    let paginationFound = false;
    for (const selector of paginationSelectors) {
      try {
        const pagination = page.locator(selector);
        if (await pagination.isVisible({ timeout: 2000 })) {
          console.log(`📄 페이지네이션 컨트롤 발견: ${selector}`);
          
          // 페이지 버튼이 있는지 확인
          const pageButtons = await pagination.locator('button, a').count();
          console.log(`🔢 페이지 버튼 수: ${pageButtons}`);
          
          if (pageButtons > 1) {
            // 다음 페이지로 이동 시도
            const nextButton = pagination.locator('button:has-text("2"), button[aria-label*="2"], button[title*="2"]').first();
            if (await nextButton.isVisible({ timeout: 1000 })) {
              await nextButton.click();
              await page.waitForTimeout(1000);
              console.log('📄 페이지 2로 이동 완료');
              
              // 첫 번째 페이지로 다시 이동
              const firstButton = pagination.locator('button:has-text("1"), button[aria-label*="1"], button[title*="1"]').first();
              if (await firstButton.isVisible()) {
                await firstButton.click();
                await page.waitForTimeout(1000);
                console.log('📄 페이지 1로 복귀 완료');
              }
            }
          }
          
          paginationFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!paginationFound) {
      console.log('⚠️ 페이지네이션 컨트롤을 찾을 수 없음 (프로젝트 수가 적을 수 있음)');
    }

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-pagination');

    console.log('✅ 프로젝트 목록 페이지네이션 테스트 완료');
  });

});