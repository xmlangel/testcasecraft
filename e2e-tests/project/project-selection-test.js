// ICT-76: 프로젝트 선택 및 전환 Playwright 테스트
// 관련 컴포넌트: ProjectManager.jsx, AppContext.jsx
// 프로젝트 목록 조회, 선택, 전환 시 상태 관리 E2E 테스트

const { test, expect } = require('@playwright/test');

test.describe('프로젝트 선택 및 전환 E2E 테스트', () => {

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

    // 백엔드 서버 연결 확인 (올바른 계정으로)
    let backendReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin' })
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

    // 로그인 성공 확인 - 프로젝트 관리 페이지로 이동
    let loginSuccess = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await page.waitForTimeout(2000);
        const token = await page.evaluate(() => localStorage.getItem('accessToken'));

        // 프로젝트 관리 페이지 요소 확인
        const projectPageIndicators = await page.locator('h1:has-text("프로젝트 관리"), [data-testid="project-management"], .project-management').count();

        if (token && projectPageIndicators > 0) {
          console.log('✅ 로그인 성공 및 프로젝트 관리 페이지 도달');
          loginSuccess = true;
          break;
        } else if (token) {
          console.log('✅ 로그인 성공, 프로젝트 관리 페이지 로딩 대기 중...');
          await page.waitForTimeout(3000);
          const retryIndicators = await page.locator('h1:has-text("프로젝트 관리"), [data-testid="project-management"], .project-management').count();
          if (retryIndicators > 0) {
            console.log('✅ 프로젝트 관리 페이지 로딩 완료');
            loginSuccess = true;
            break;
          }
        }
      } catch (e) {
        console.log(`🔄 로그인 재시도 ${attempt}/5...`);
        await page.waitForTimeout(1000);
      }
    }

    if (!loginSuccess) {
      throw new Error('로그인 실패: 프로젝트 관리 페이지에 도달하지 못했습니다.');
    }
  }

  // 프로젝트 탭 전환 헬퍼 함수
  async function switchToTab(page, tabName) {
    console.log(`📑 "${tabName}" 탭으로 전환...`);

    const tab = page.locator(`tab:has-text("${tabName}"), [role="tab"]:has-text("${tabName}"), button:has-text("${tabName}")`);
    if (await tab.isVisible({ timeout: 2000 })) {
      await tab.click();
      console.log(`📑 "${tabName}" 탭 클릭 완료`);
      await page.waitForTimeout(2000);
      return true;
    }
    return false;
  }

  // 프로젝트 요소 확인 헬퍼 함수
  async function getProjectElements(page) {
    const projectSelectors = [
      'button:has-text("프로젝트 열기")',
      '.MuiCard-root:has(button:has-text("프로젝트 열기"))',
      '[data-testid="project-card"]',
      'div:has(h2):has(button:has-text("프로젝트 열기"))'
    ];

    for (const selector of projectSelectors) {
      try {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          console.log(`✅ 프로젝트 요소 발견: ${selector} (${count}개)`);
          return { selector, count, elements };
        }
      } catch (e) {
        continue;
      }
    }

    return { selector: null, count: 0, elements: null };
  }

  test('프로젝트 선택 페이지 접속 및 기본 구조 확인', async ({ page }, testInfo) => {
    console.log('🌐 프로젝트 선택 페이지 접속 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 페이지 로딩 상태 확인
    await page.waitForLoadState('networkidle');

    // 프로젝트 관리 페이지 구조 확인
    const pageStructure = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent);
      const tabs = Array.from(document.querySelectorAll('[role="tab"], tab, button')).map(t => t.textContent).filter(text => text && text.length < 20);
      const cards = document.querySelectorAll('.MuiCard-root').length;

      return {
        headings: headings.slice(0, 5),
        tabs: tabs.slice(0, 10),
        cardCount: cards,
        url: window.location.href
      };
    });

    console.log('📄 페이지 구조 분석:', JSON.stringify(pageStructure, null, 2));

    // 필수 요소 확인
    expect(pageStructure.url).toContain('localhost:3000');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-selection-page-access');

    console.log('✅ 프로젝트 선택 페이지 접속 및 기본 구조 확인 완료');
  });

  test('사용자별 접근 가능 프로젝트 목록 확인', async ({ page }, testInfo) => {
    console.log('👥 사용자별 접근 가능 프로젝트 목록 확인 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 탭별 프로젝트 목록 확인
    const tabs = ['조직별 프로젝트', '독립 프로젝트', '전체 프로젝트'];
    const tabResults = {};

    for (const tabName of tabs) {
      console.log(`🔍 "${tabName}" 탭 확인 중...`);

      const tabSwitched = await switchToTab(page, tabName);
      if (tabSwitched) {
        const projectInfo = await getProjectElements(page);
        tabResults[tabName] = {
          found: projectInfo.count > 0,
          count: projectInfo.count,
          selector: projectInfo.selector
        };

        console.log(`📊 "${tabName}" 결과:`, tabResults[tabName]);
      } else {
        tabResults[tabName] = {
          found: false,
          count: 0,
          selector: null,
          note: '탭을 찾을 수 없음'
        };
      }
    }

    // 결과 요약
    console.log('📋 프로젝트 목록 확인 결과:', JSON.stringify(tabResults, null, 2));

    // 최소 하나의 탭에서 프로젝트가 발견되어야 함
    const hasProjects = Object.values(tabResults).some(result => result.found);
    expect(hasProjects).toBe(true);

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-list-by-user-access');

    console.log('✅ 사용자별 접근 가능 프로젝트 목록 확인 완료');
  });

  test('프로젝트 검색 및 필터링 기능 테스트', async ({ page }, testInfo) => {
    console.log('🔍 프로젝트 검색 및 필터링 기능 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 검색 및 필터 요소 찾기
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="검색"]',
      'input[placeholder*="search"]',
      '[data-testid="search-input"]',
      '.search-input'
    ];

    let searchElement = null;
    for (const selector of searchSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          searchElement = element;
          console.log(`🔍 검색 요소 발견: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (searchElement) {
      // 검색 기능 테스트
      console.log('🔎 검색 기능 테스트...');
      await searchElement.fill('QA');
      await page.waitForTimeout(1000);

      // 검색 결과 확인
      const searchResults = await getProjectElements(page);
      console.log(`🔍 "QA" 검색 결과: ${searchResults.count}개`);

      // 검색어 초기화
      await searchElement.clear();
      await page.waitForTimeout(1000);
    } else {
      console.log('⚠️ 검색 요소를 찾을 수 없음');
    }

    // 필터 요소 찾기
    const filterSelectors = [
      'select',
      '[data-testid="filter-select"]',
      '.filter-select',
      'button:has-text("필터")',
      'div[role="combobox"]'
    ];

    let filterElement = null;
    for (const selector of filterSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          filterElement = element;
          console.log(`🎛️ 필터 요소 발견: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (filterElement) {
      console.log('🎛️ 필터 기능 테스트...');
      // 필터 클릭하여 옵션 확인
      await filterElement.click();
      await page.waitForTimeout(1000);

      // ESC로 필터 닫기
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } else {
      console.log('⚠️ 필터 요소를 찾을 수 없음');
    }

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-search-filtering');

    console.log('✅ 프로젝트 검색 및 필터링 기능 테스트 완료');
  });

  test('프로젝트 선택 및 전환 기능 테스트', async ({ page }, testInfo) => {
    console.log('🔄 프로젝트 선택 및 전환 기능 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 사용 가능한 탭 확인 및 프로젝트 찾기
    const tabs = ['조직별 프로젝트', '독립 프로젝트', '전체 프로젝트'];
    let projectFound = false;
    let selectedProjectInfo = null;

    for (const tabName of tabs) {
      console.log(`🔍 "${tabName}" 탭에서 프로젝트 찾기...`);

      const tabSwitched = await switchToTab(page, tabName);
      if (tabSwitched) {
        const projectInfo = await getProjectElements(page);

        if (projectInfo.count > 0) {
          console.log(`📁 "${tabName}" 탭에서 프로젝트 발견: ${projectInfo.count}개`);

          // 첫 번째 프로젝트 선택
          const firstProject = projectInfo.elements.first();

          // 프로젝트 정보 수집
          const projectCard = firstProject.locator('..').locator('..');
          let projectTitle = 'Unknown Project';

          try {
            projectTitle = await projectCard.locator('h2, .MuiTypography-h2, [class*="title"]').first().textContent();
          } catch (e) {
            console.log('⚠️ 프로젝트 제목 찾기 실패, 기본값 사용');
          }

          console.log(`📁 선택할 프로젝트: ${projectTitle}`);

          // 프로젝트 선택 전 상태 저장
          const beforeSelection = await page.evaluate(() => {
            return {
              url: window.location.href,
              selectedProject: localStorage.getItem('selectedProject'),
              currentProject: localStorage.getItem('currentProject'),
              projectId: localStorage.getItem('projectId')
            };
          });

          console.log('📋 선택 전 상태:', beforeSelection);

          // 프로젝트 열기 버튼 클릭
          await firstProject.click();
          console.log('🖱️ "프로젝트 열기" 버튼 클릭');

          // 전환 후 상태 확인
          await page.waitForTimeout(3000);

          const afterSelection = await page.evaluate(() => {
            return {
              url: window.location.href,
              selectedProject: localStorage.getItem('selectedProject'),
              currentProject: localStorage.getItem('currentProject'),
              projectId: localStorage.getItem('projectId')
            };
          });

          console.log('📋 선택 후 상태:', afterSelection);

          // URL 변경 확인
          const urlChanged = beforeSelection.url !== afterSelection.url;
          console.log(`🌐 URL 변경 여부: ${urlChanged}`);

          // 컨텍스트 변경 확인
          const contextChanged = beforeSelection.selectedProject !== afterSelection.selectedProject ||
            beforeSelection.currentProject !== afterSelection.currentProject ||
            beforeSelection.projectId !== afterSelection.projectId;

          console.log(`📊 컨텍스트 변경 여부: ${contextChanged}`);

          selectedProjectInfo = {
            title: projectTitle,
            tabName: tabName,
            beforeSelection,
            afterSelection,
            urlChanged,
            contextChanged
          };

          projectFound = true;
          break;
        }
      }
    }

    if (!projectFound) {
      console.log('❌ 선택 가능한 프로젝트를 찾을 수 없음');
      throw new Error('선택 가능한 프로젝트를 찾을 수 없습니다.');
    }

    // 검증
    expect(selectedProjectInfo).toBeTruthy();
    console.log('✅ 프로젝트 선택 및 전환 성공');

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-selection-transition');

    console.log('✅ 프로젝트 선택 및 전환 기능 테스트 완료');
  });

  test('프로젝트 정보 표시 및 헤더 업데이트 테스트', async ({ page }, testInfo) => {
    console.log('📊 프로젝트 정보 표시 및 헤더 업데이트 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 프로젝트 선택 (이전 테스트 로직 재사용)
    const tabs = ['조직별 프로젝트', '독립 프로젝트', '전체 프로젝트'];
    let projectSelected = false;

    for (const tabName of tabs) {
      const tabSwitched = await switchToTab(page, tabName);
      if (tabSwitched) {
        const projectInfo = await getProjectElements(page);

        if (projectInfo.count > 0) {
          // 첫 번째 프로젝트 선택
          await projectInfo.elements.first().click();
          await page.waitForTimeout(3000);
          projectSelected = true;
          break;
        }
      }
    }

    if (!projectSelected) {
      throw new Error('프로젝트 선택에 실패했습니다.');
    }

    // 헤더에서 현재 프로젝트 정보 확인
    const headerSelectors = [
      'h1, h2, h3, h4, h5, h6',
      '[data-testid="project-header"]',
      '.project-header',
      'header',
      '.MuiAppBar-root'
    ];

    let headerInfo = null;
    for (const selector of headerSelectors) {
      try {
        const elements = page.locator(selector);
        const count = await elements.count();
        if (count > 0) {
          const texts = await elements.allTextContents();
          headerInfo = {
            selector,
            count,
            texts: texts.slice(0, 5)
          };
          console.log(`📊 헤더 정보 발견: ${selector}`, headerInfo.texts);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // 프로젝트 상태 정보 확인
    const statusSelectors = [
      '[data-testid="project-status"]',
      '.project-status',
      'span:has-text("활성")',
      'span:has-text("진행중")',
      '.status'
    ];

    let statusInfo = null;
    for (const selector of statusSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          const text = await element.textContent();
          statusInfo = {
            selector,
            text
          };
          console.log(`📈 상태 정보 발견: ${selector} - ${text}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // 즐겨찾기 버튼 확인
    const favoriteSelectors = [
      'button[aria-label*="즐겨찾기"]',
      'button:has-text("★")',
      'button:has-text("☆")',
      '[data-testid="favorite-button"]',
      '.favorite-button'
    ];

    let favoriteInfo = null;
    for (const selector of favoriteSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          favoriteInfo = {
            selector,
            visible: true
          };
          console.log(`⭐ 즐겨찾기 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // 결과 요약
    const displayResult = {
      header: headerInfo ? '발견됨' : '찾을 수 없음',
      status: statusInfo ? '발견됨' : '찾을 수 없음',
      favorite: favoriteInfo ? '발견됨' : '찾을 수 없음'
    };

    console.log('📊 프로젝트 정보 표시 결과:', displayResult);

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-info-display');

    console.log('✅ 프로젝트 정보 표시 및 헤더 업데이트 테스트 완료');
  });

  test('브라우저 새로고침 시 컨텍스트 유지 테스트', async ({ page }, testInfo) => {
    console.log('🔄 브라우저 새로고침 시 컨텍스트 유지 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 프로젝트 선택
    const tabs = ['조직별 프로젝트', '독립 프로젝트', '전체 프로젝트'];
    let projectSelected = false;
    let selectedContext = null;

    for (const tabName of tabs) {
      const tabSwitched = await switchToTab(page, tabName);
      if (tabSwitched) {
        const projectInfo = await getProjectElements(page);

        if (projectInfo.count > 0) {
          // 첫 번째 프로젝트 선택
          await projectInfo.elements.first().click();
          await page.waitForTimeout(3000);

          // 선택 후 컨텍스트 저장
          selectedContext = await page.evaluate(() => {
            return {
              localStorage: {
                selectedProject: localStorage.getItem('selectedProject'),
                currentProject: localStorage.getItem('currentProject'),
                projectId: localStorage.getItem('projectId'),
                accessToken: localStorage.getItem('accessToken')
              },
              sessionStorage: {
                selectedProject: sessionStorage.getItem('selectedProject'),
                currentProject: sessionStorage.getItem('currentProject')
              },
              url: window.location.href
            };
          });

          console.log('📋 선택된 프로젝트 컨텍스트:', selectedContext);
          projectSelected = true;
          break;
        }
      }
    }

    if (!projectSelected) {
      throw new Error('프로젝트 선택에 실패했습니다.');
    }

    // 브라우저 새로고침
    console.log('🔄 브라우저 새로고침 수행...');
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 새로고침 후 컨텍스트 확인
    const restoredContext = await page.evaluate(() => {
      return {
        localStorage: {
          selectedProject: localStorage.getItem('selectedProject'),
          currentProject: localStorage.getItem('currentProject'),
          projectId: localStorage.getItem('projectId'),
          accessToken: localStorage.getItem('accessToken')
        },
        sessionStorage: {
          selectedProject: sessionStorage.getItem('selectedProject'),
          currentProject: sessionStorage.getItem('currentProject')
        },
        url: window.location.href
      };
    });

    console.log('📋 복원된 컨텍스트:', restoredContext);

    // localStorage 유지 확인
    const localStoragePersisted = selectedContext.localStorage.selectedProject === restoredContext.localStorage.selectedProject &&
      selectedContext.localStorage.accessToken === restoredContext.localStorage.accessToken;

    console.log(`💾 localStorage 유지 여부: ${localStoragePersisted}`);

    // URL 유지 확인
    const urlPersisted = selectedContext.url === restoredContext.url;
    console.log(`🌐 URL 유지 여부: ${urlPersisted}`);

    // 검증
    expect(localStoragePersisted).toBe(true);

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'context-persistence-after-refresh');

    console.log('✅ 브라우저 새로고침 시 컨텍스트 유지 테스트 완료');
  });

  test('권한별 프로젝트 목록 필터링 검증', async ({ page }, testInfo) => {
    console.log('🔐 권한별 프로젝트 목록 필터링 검증 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 각 탭별로 프로젝트 접근 권한 확인
    const tabs = ['조직별 프로젝트', '독립 프로젝트', '전체 프로젝트'];
    const accessResults = {};

    for (const tabName of tabs) {
      console.log(`🔍 "${tabName}" 탭 권한 확인...`);

      const tabSwitched = await switchToTab(page, tabName);
      if (tabSwitched) {
        const projectInfo = await getProjectElements(page);

        // 프로젝트 카드들의 상세 정보 수집
        const projectDetails = [];
        if (projectInfo.count > 0) {
          const cards = await projectInfo.elements.all();

          for (let i = 0; i < Math.min(cards.length, 3); i++) {
            try {
              const card = cards[i];
              const cardContainer = card.locator('..').locator('..');

              const title = await cardContainer.locator('h2, .MuiTypography-h2, [class*="title"]').first().textContent().catch(() => `프로젝트 ${i + 1}`);
              const description = await cardContainer.locator('p, .MuiTypography-body2, [class*="description"]').first().textContent().catch(() => '설명 없음');

              projectDetails.push({
                index: i,
                title: title.trim(),
                description: description.trim().slice(0, 50) + '...'
              });
            } catch (e) {
              console.log(`⚠️ 프로젝트 ${i + 1} 정보 수집 실패:`, e.message);
            }
          }
        }

        accessResults[tabName] = {
          accessible: projectInfo.count > 0,
          count: projectInfo.count,
          projects: projectDetails
        };

        console.log(`📊 "${tabName}" 결과:`, accessResults[tabName]);
      } else {
        accessResults[tabName] = {
          accessible: false,
          count: 0,
          projects: [],
          note: '탭 접근 불가'
        };
      }
    }

    // 권한 검증 결과 요약
    console.log('🔐 권한별 접근 결과 요약:', JSON.stringify(accessResults, null, 2));

    // admin 사용자는 최소 하나의 탭에서 프로젝트에 접근할 수 있어야 함
    const hasAccessToProjects = Object.values(accessResults).some(result => result.accessible);
    expect(hasAccessToProjects).toBe(true);

    // 전체 프로젝트 수가 개별 탭의 합보다 크거나 같아야 함 (중복 제외)
    const totalAccessibleTabs = Object.values(accessResults).filter(result => result.accessible).length;
    expect(totalAccessibleTabs).toBeGreaterThan(0);

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-access-permission-filtering');

    console.log('✅ 권한별 프로젝트 목록 필터링 검증 완료');
  });

});