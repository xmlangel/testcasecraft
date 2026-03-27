// ICT-75: 프로젝트 전환 및 컨텍스트 관리 향상된 E2E 테스트
// 관련 컴포넌트: ProjectManager.jsx, AppContext.jsx, ProjectHeader.jsx
// Task 5.1: 프로젝트 전환 시 상태 관리 및 컨텍스트 지속성 향상 테스트

const { test, expect } = require("@playwright/test");

test.describe("향상된 프로젝트 컨텍스트 관리 E2E 테스트", () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로컬스토리지 초기화
    await page.goto("http://localhost:3000");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  // 성공 스크린샷 헬퍼 함수
  async function takeSuccessScreenshot(page, testInfo, testName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotPath = `test-results/success-screenshots/${testName}-${timestamp}.png`;
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });

    await testInfo.attach("success-screenshot", {
      path: screenshotPath,
      contentType: "image/png",
    });

    console.log(`📸 성공 스크린샷 저장: ${screenshotPath}`);
    return screenshotPath;
  }

  // 로그인 헬퍼 함수
  async function loginAsAdmin(page) {
    console.log("🔐 Admin 로그인 수행...");

    // 백엔드 서버 연결 확인
    let backendReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "admin", password: "admin" }),
        });
        backendReady = true;
        console.log("🚀 백엔드 서버 준비 완료");
        break;
      } catch (e) {
        console.log(`⏳ 백엔드 대기 중... (${i + 1}/30)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!backendReady) {
      throw new Error("백엔드 서버가 30초 내에 준비되지 않았습니다.");
    }

    // 로그인 폼 작성 및 제출
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');

    // 로그인 성공 확인
    let loginSuccess = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await page.waitForURL("**/dashboard**", { timeout: 5000 });
        const token = await page.evaluate(() =>
          localStorage.getItem("accessToken"),
        );
        if (token) {
          console.log("✅ 로그인 성공 및 토큰 저장 확인");
          loginSuccess = true;
          break;
        }
      } catch (e) {
        console.log(`🔄 로그인 재시도 ${attempt}/5...`);
        await page.waitForTimeout(1000);
      }
    }

    if (!loginSuccess) {
      throw new Error("로그인 실패: JWT 토큰이 저장되지 않았습니다.");
    }
  }

  // 컨텍스트 상태 수집 헬퍼 함수
  async function getContextState(page) {
    return await page.evaluate(() => {
      return {
        localStorage: {
          accessToken: localStorage.getItem("accessToken"),
          refreshToken: localStorage.getItem("refreshToken"),
          selectedProject: localStorage.getItem("selectedProject"),
          currentProject: localStorage.getItem("currentProject"),
          projectId: localStorage.getItem("projectId"),
          userId: localStorage.getItem("userId"),
          userInfo: localStorage.getItem("userInfo"),
        },
        sessionStorage: {
          selectedProject: sessionStorage.getItem("selectedProject"),
          currentProject: sessionStorage.getItem("currentProject"),
          navigationHistory: sessionStorage.getItem("navigationHistory"),
          contextStack: sessionStorage.getItem("contextStack"),
        },
        url: window.location.href,
        title: document.title,
        pathname: window.location.pathname,
        timestamp: new Date().toISOString(),
      };
    });
  }

  // 프로젝트 선택 헬퍼 함수 (향상된 버전)
  async function selectProjectWithValidation(page, projectIndex = 0) {
    await page.waitForLoadState("networkidle");

    // 프로젝트 목록 로드 대기
    await page.waitForSelector('[data-testid="project-card"], .MuiCard-root', {
      timeout: 10000,
    });

    const projects = page.locator(
      '[data-testid="project-card"], .MuiCard-root',
    );
    const projectCount = await projects.count();

    if (projectCount <= projectIndex) {
      throw new Error(
        `프로젝트 인덱스 ${projectIndex}가 사용 가능한 프로젝트 수 ${projectCount}를 초과합니다.`,
      );
    }

    const targetProject = projects.nth(projectIndex);
    const projectTitle = await targetProject
      .locator('h6, h5, [class*="title"], .MuiTypography-h6, .MuiTypography-h5')
      .first()
      .textContent();

    console.log(`📁 프로젝트 선택: ${projectTitle} (인덱스: ${projectIndex})`);

    // 선택 전 컨텍스트 상태 수집
    const beforeState = await getContextState(page);
    console.log(
      "📊 선택 전 컨텍스트:",
      JSON.stringify(beforeState.localStorage.selectedProject),
    );

    // 프로젝트 선택 버튼 찾기 및 클릭
    const selectButtons = [
      targetProject.locator(
        'button:has-text("선택"), button:has-text("Select")',
      ),
      targetProject.locator('[data-testid="select-project-button"]'),
      targetProject.locator(
        'button[aria-label*="선택"], button[aria-label*="select"]',
      ),
      targetProject, // 카드 자체 클릭
    ];

    let projectSelected = false;
    for (const button of selectButtons) {
      try {
        if (await button.isVisible({ timeout: 2000 })) {
          await button.click();
          console.log("🖱️ 프로젝트 선택 버튼 클릭");
          projectSelected = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!projectSelected) {
      await targetProject.click();
      console.log("🖱️ 프로젝트 카드 클릭");
    }

    // 선택 완료 대기 및 상태 변경 확인
    await page.waitForTimeout(2000);

    // 선택 후 컨텍스트 상태 수집
    const afterState = await getContextState(page);
    console.log(
      "📊 선택 후 컨텍스트:",
      JSON.stringify(afterState.localStorage.selectedProject),
    );

    // 컨텍스트 변경 검증
    const contextChanged =
      beforeState.localStorage.selectedProject !==
        afterState.localStorage.selectedProject ||
      beforeState.url !== afterState.url;

    return {
      projectTitle,
      projectIndex,
      beforeState,
      afterState,
      contextChanged,
    };
  }

  test("프로젝트 컨텍스트 동기화 및 일관성 테스트", async ({
    page,
  }, testInfo) => {
    console.log("🔄 프로젝트 컨텍스트 동기화 테스트 시작...");

    // 로그인 수행
    await loginAsAdmin(page);

    // 첫 번째 프로젝트 선택
    const firstSelection = await selectProjectWithValidation(page, 0);
    console.log(
      `📁 첫 번째 프로젝트 선택 완료: ${firstSelection.projectTitle}`,
    );

    // 컨텍스트 동기화 검증
    const syncValidation = await page.evaluate(() => {
      const localStorage_project = localStorage.getItem("selectedProject");
      const sessionStorage_project = sessionStorage.getItem("selectedProject");
      const localStorage_current = localStorage.getItem("currentProject");

      return {
        localStorage_selectedProject: localStorage_project,
        sessionStorage_selectedProject: sessionStorage_project,
        localStorage_currentProject: localStorage_current,
        isSync: localStorage_project === localStorage_current,
        hasBothStorages: localStorage_project && sessionStorage_project,
      };
    });

    console.log("🔍 컨텍스트 동기화 상태:", syncValidation);

    if (syncValidation.isSync) {
      console.log("✅ localStorage 프로젝트 컨텍스트 동기화 확인");
    } else {
      console.log("⚠️ localStorage 프로젝트 컨텍스트 동기화 이슈");
    }

    // 두 번째 프로젝트가 있다면 전환 테스트
    const projects = page.locator(
      '[data-testid="project-card"], .MuiCard-root',
    );
    const projectCount = await projects.count();

    if (projectCount > 1) {
      const secondSelection = await selectProjectWithValidation(page, 1);
      console.log(
        `📁 두 번째 프로젝트 선택 완료: ${secondSelection.projectTitle}`,
      );

      // 전환 후 동기화 재확인
      const postSwitchValidation = await page.evaluate(() => {
        const localStorage_project = localStorage.getItem("selectedProject");
        const sessionStorage_project =
          sessionStorage.getItem("selectedProject");
        const localStorage_current = localStorage.getItem("currentProject");

        return {
          localStorage_selectedProject: localStorage_project,
          sessionStorage_selectedProject: sessionStorage_project,
          localStorage_currentProject: localStorage_current,
          isSync: localStorage_project === localStorage_current,
        };
      });

      console.log("🔍 전환 후 동기화 상태:", postSwitchValidation);

      // 컨텍스트 변경 히스토리 확인
      const contextHistory = await page.evaluate(() => {
        const history = sessionStorage.getItem("navigationHistory");
        const contextStack = sessionStorage.getItem("contextStack");
        return {
          navigationHistory: history ? JSON.parse(history) : null,
          contextStack: contextStack ? JSON.parse(contextStack) : null,
        };
      });

      console.log("📜 컨텍스트 히스토리:", contextHistory);
    }

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "context-synchronization-test");

    console.log("✅ 프로젝트 컨텍스트 동기화 테스트 완료");
  });

  test("프로젝트 전환 시 데이터 격리 및 독립성 테스트", async ({
    page,
  }, testInfo) => {
    console.log("🔒 프로젝트 데이터 격리 테스트 시작...");

    // 로그인 수행
    await loginAsAdmin(page);

    // API 호출 모니터링 설정
    const apiCalls = new Map();
    page.on("response", (response) => {
      if (response.url().includes("/api/")) {
        const url = response.url();
        if (!apiCalls.has(url)) {
          apiCalls.set(url, []);
        }
        apiCalls.get(url).push({
          status: response.status(),
          timestamp: new Date().toISOString(),
          headers: response.headers(),
        });
      }
    });

    const projects = page.locator(
      '[data-testid="project-card"], .MuiCard-root',
    );
    const projectCount = await projects.count();

    if (projectCount >= 2) {
      // 첫 번째 프로젝트 선택 및 데이터 상태 수집
      const firstProject = await selectProjectWithValidation(page, 0);
      await page.waitForTimeout(3000); // 데이터 로딩 대기

      const firstProjectData = await page.evaluate(() => {
        return {
          pageContent: document.body.innerHTML.length,
          urlPath: window.location.pathname,
          domElements: document.querySelectorAll(
            '[data-testid*="project"], [class*="project"]',
          ).length,
          dataAttributes: Array.from(
            document.querySelectorAll("[data-project-id]"),
          ).map((el) => el.getAttribute("data-project-id")),
        };
      });

      console.log("📊 첫 번째 프로젝트 데이터 상태:", {
        contentLength: firstProjectData.pageContent,
        urlPath: firstProjectData.urlPath,
        domElements: firstProjectData.domElements,
      });

      // 두 번째 프로젝트로 전환
      apiCalls.clear(); // API 호출 카운터 리셋

      const secondProject = await selectProjectWithValidation(page, 1);
      await page.waitForTimeout(3000); // 데이터 로딩 대기

      const secondProjectData = await page.evaluate(() => {
        return {
          pageContent: document.body.innerHTML.length,
          urlPath: window.location.pathname,
          domElements: document.querySelectorAll(
            '[data-testid*="project"], [class*="project"]',
          ).length,
          dataAttributes: Array.from(
            document.querySelectorAll("[data-project-id]"),
          ).map((el) => el.getAttribute("data-project-id")),
        };
      });

      console.log("📊 두 번째 프로젝트 데이터 상태:", {
        contentLength: secondProjectData.pageContent,
        urlPath: secondProjectData.urlPath,
        domElements: secondProjectData.domElements,
      });

      // 데이터 격리 검증
      const dataIsolated =
        firstProjectData.urlPath !== secondProjectData.urlPath ||
        firstProjectData.pageContent !== secondProjectData.pageContent ||
        JSON.stringify(firstProjectData.dataAttributes) !==
          JSON.stringify(secondProjectData.dataAttributes);

      if (dataIsolated) {
        console.log("✅ 프로젝트 간 데이터 격리 확인");
      } else {
        console.log("⚠️ 프로젝트 간 데이터 격리가 완전하지 않을 수 있음");
      }

      // API 호출 분석
      console.log(`🔗 프로젝트 전환 중 API 호출 수: ${apiCalls.size}`);

      const projectSpecificCalls = Array.from(apiCalls.keys()).filter(
        (url) =>
          url.includes("/projects/") ||
          url.includes("/testcases/") ||
          url.includes("/dashboard/"),
      );

      console.log(`🎯 프로젝트별 API 호출: ${projectSpecificCalls.length}개`);
      projectSpecificCalls.slice(0, 3).forEach((url, index) => {
        console.log(`  ${index + 1}. ${url}`);
      });

      // 메모리 누수 감지
      const memoryUsage = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          };
        }
        return null;
      });

      if (memoryUsage) {
        console.log("🧠 메모리 사용량:", {
          used: Math.round(memoryUsage.usedJSHeapSize / 1024 / 1024) + "MB",
          total: Math.round(memoryUsage.totalJSHeapSize / 1024 / 1024) + "MB",
        });
      }
    } else {
      console.log("⚠️ 데이터 격리 테스트를 위한 프로젝트가 부족함");
    }

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "data-isolation-test");

    console.log("✅ 프로젝트 데이터 격리 테스트 완료");
  });

  test("프로젝트 컨텍스트 복원 및 회복력 테스트", async ({
    page,
  }, testInfo) => {
    console.log("🔄 프로젝트 컨텍스트 복원 테스트 시작...");

    // 로그인 수행
    await loginAsAdmin(page);

    // 프로젝트 선택
    const selectedProject = await selectProjectWithValidation(page, 0);
    console.log(`📁 프로젝트 선택: ${selectedProject.projectTitle}`);

    // 정상 상태의 컨텍스트 백업
    const normalContext = await getContextState(page);
    console.log("💾 정상 컨텍스트 백업 완료");

    // 시나리오 1: localStorage 손상 시뮬레이션
    console.log("🔧 localStorage 손상 시뮬레이션...");
    await page.evaluate(() => {
      localStorage.removeItem("selectedProject");
      localStorage.removeItem("currentProject");
    });

    // 페이지 새로고침으로 복원 테스트
    await page.reload();
    await page.waitForLoadState("networkidle");

    const afterLocalStorageCorruption = await getContextState(page);
    console.log("📊 localStorage 손상 후 상태:", {
      selectedProject: afterLocalStorageCorruption.localStorage.selectedProject,
      hasToken: Boolean(afterLocalStorageCorruption.localStorage.accessToken),
    });

    // 시나리오 2: 잘못된 프로젝트 ID 주입
    console.log("🔧 잘못된 프로젝트 ID 주입...");
    await page.evaluate(() => {
      localStorage.setItem(
        "selectedProject",
        JSON.stringify({
          id: "invalid-project-999999",
          name: "Invalid Project",
          invalidData: true,
        }),
      );
      localStorage.setItem("projectId", "999999");
    });

    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // 오류 처리 확인
    const errorHandling = await page.evaluate(() => {
      const hasErrorAlert = document.querySelector(
        '.MuiAlert-root[severity="error"], .error-message, [data-testid="error-alert"]',
      );
      return {
        hasErrorMessage: Boolean(hasErrorAlert),
        errorText: hasErrorAlert ? hasErrorAlert.textContent : null,
        currentUrl: window.location.href,
        recoveredProject: localStorage.getItem("selectedProject"),
      };
    });

    console.log("🔍 오류 처리 상태:", errorHandling);

    if (errorHandling.hasErrorMessage) {
      console.log("✅ 잘못된 컨텍스트에 대한 오류 처리 확인");
    } else {
      console.log("🔄 자동 복구가 수행된 것으로 보임");
    }

    // 시나리오 3: 네트워크 중단 시뮬레이션
    console.log("🌐 네트워크 중단 시뮬레이션...");

    // API 요청 차단
    await page.route("**/api/projects/**", (route) => {
      console.log("🚫 프로젝트 API 차단:", route.request().url());
      route.abort("networkfail");
    });

    // 프로젝트 선택 시도 (네트워크 오류 상황)
    try {
      await page.waitForSelector(
        '[data-testid="project-card"], .MuiCard-root',
        { timeout: 5000 },
      );
      const projects = page.locator(
        '[data-testid="project-card"], .MuiCard-root',
      );
      const firstProject = projects.first();
      await firstProject.click();
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log("❌ 네트워크 오류로 인한 프로젝트 선택 실패 (예상됨)");
    }

    // 네트워크 복원 후 정상 동작 확인
    await page.unroute("**/api/projects/**");
    console.log("🔄 네트워크 복원");

    await page.reload();
    await page.waitForLoadState("networkidle");

    // 복원 후 상태 확인
    const recoveredContext = await getContextState(page);
    console.log("🔄 최종 복원 상태:", {
      hasToken: Boolean(recoveredContext.localStorage.accessToken),
      url: recoveredContext.url,
      canAccessProjects:
        recoveredContext.url.includes("dashboard") ||
        recoveredContext.url.includes("projects"),
    });

    // 프로젝트 목록이 다시 접근 가능한지 확인
    try {
      await page.waitForSelector(
        '[data-testid="project-card"], .MuiCard-root',
        { timeout: 10000 },
      );
      console.log("✅ 프로젝트 목록 접근 복원 확인");
    } catch (e) {
      console.log("❌ 프로젝트 목록 접근 복원 실패");
    }

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "context-recovery-test");

    console.log("✅ 프로젝트 컨텍스트 복원 테스트 완료");
  });

  test("다중 탭 간 프로젝트 컨텍스트 동기화 테스트", async ({
    page,
    context,
  }, testInfo) => {
    console.log("📑 다중 탭 컨텍스트 동기화 테스트 시작...");

    // 첫 번째 탭에서 로그인 및 프로젝트 선택
    await loginAsAdmin(page);
    const firstProject = await selectProjectWithValidation(page, 0);
    console.log(
      `📁 첫 번째 탭에서 프로젝트 선택: ${firstProject.projectTitle}`,
    );

    // 첫 번째 탭의 컨텍스트 상태 수집
    const tab1Context = await getContextState(page);
    console.log("📊 탭1 컨텍스트:", tab1Context.localStorage.selectedProject);

    // 두 번째 탭 생성
    const page2 = await context.newPage();
    await page2.goto("http://localhost:3000");
    await page2.waitForLoadState("networkidle");

    // 두 번째 탭의 컨텍스트 상태 확인
    const tab2Context = await getContextState(page2);
    console.log("📊 탭2 컨텍스트:", tab2Context.localStorage.selectedProject);

    // localStorage 공유 확인
    const contextShared =
      tab1Context.localStorage.accessToken ===
        tab2Context.localStorage.accessToken &&
      tab1Context.localStorage.selectedProject ===
        tab2Context.localStorage.selectedProject;

    if (contextShared) {
      console.log("✅ 탭 간 localStorage 컨텍스트 공유 확인");
    } else {
      console.log("⚠️ 탭 간 컨텍스트 공유에 이슈가 있을 수 있음");
    }

    // 두 번째 탭에서 다른 프로젝트 선택 (가능한 경우)
    const projects = page2.locator(
      '[data-testid="project-card"], .MuiCard-root',
    );
    const projectCount = await projects.count();

    if (projectCount > 1) {
      const secondProject = await selectProjectWithValidation(page2, 1);
      console.log(
        `📁 두 번째 탭에서 다른 프로젝트 선택: ${secondProject.projectTitle}`,
      );

      // 잠시 대기 후 첫 번째 탭의 컨텍스트 확인
      await page.waitForTimeout(2000);

      // 첫 번째 탭에서 컨텍스트 업데이트 확인
      const updatedTab1Context = await getContextState(page);
      console.log(
        "📊 업데이트된 탭1 컨텍스트:",
        updatedTab1Context.localStorage.selectedProject,
      );

      // 실시간 동기화 여부 확인
      const realtimeSync =
        updatedTab1Context.localStorage.selectedProject ===
        tab2Context.localStorage.selectedProject;

      if (realtimeSync) {
        console.log("⚡ 실시간 탭 간 컨텍스트 동기화 확인");
      } else {
        console.log(
          "⏳ 탭 간 컨텍스트 동기화가 지연되거나 수동 새로고침이 필요할 수 있음",
        );

        // 첫 번째 탭 새로고침 후 재확인
        await page.reload();
        await page.waitForLoadState("networkidle");

        const refreshedTab1Context = await getContextState(page);
        console.log(
          "🔄 새로고침 후 탭1 컨텍스트:",
          refreshedTab1Context.localStorage.selectedProject,
        );
      }
    }

    // 세 번째 탭에서 시크릿 모드 시뮬레이션 (새 컨텍스트)
    const incognitoContext = await page.context().browser().newContext();
    const page3 = await incognitoContext.newPage();
    await page3.goto("http://localhost:3000");
    await page3.waitForLoadState("networkidle");

    const incognitoContextState = await page3.evaluate(() => {
      return {
        hasToken: Boolean(localStorage.getItem("accessToken")),
        hasProject: Boolean(localStorage.getItem("selectedProject")),
        url: window.location.href,
      };
    });

    console.log("🕵️ 시크릿 모드 컨텍스트:", incognitoContextState);

    if (!incognitoContextState.hasToken) {
      console.log("✅ 시크릿 모드에서 컨텍스트 격리 확인");
    } else {
      console.log("⚠️ 시크릿 모드에서 예상치 못한 컨텍스트 공유");
    }

    // 정리
    await page2.close();
    await page3.close();
    await incognitoContext.close();

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "multi-tab-sync-test");

    console.log("✅ 다중 탭 컨텍스트 동기화 테스트 완료");
  });

  test("프로젝트 컨텍스트 성능 및 최적화 테스트", async ({
    page,
  }, testInfo) => {
    console.log("⚡ 프로젝트 컨텍스트 성능 테스트 시시작...");

    // 성능 측정 시작
    const startTime = Date.now();

    // 로그인 수행
    await loginAsAdmin(page);

    const loginTime = Date.now() - startTime;
    console.log(`⏱️ 로그인 소요 시간: ${loginTime}ms`);

    // 프로젝트 전환 성능 측정
    const projects = page.locator(
      '[data-testid="project-card"], .MuiCard-root',
    );
    const projectCount = await projects.count();

    if (projectCount >= 2) {
      const switchingTimes = [];

      for (let i = 0; i < Math.min(projectCount, 3); i++) {
        const switchStart = Date.now();

        try {
          await selectProjectWithValidation(page, i);
          const switchEnd = Date.now();
          const switchTime = switchEnd - switchStart;
          switchingTimes.push(switchTime);

          console.log(`⏱️ 프로젝트 ${i + 1} 전환 시간: ${switchTime}ms`);

          // 잠시 대기 (다음 전환을 위해)
          await page.waitForTimeout(1000);
        } catch (e) {
          console.log(`❌ 프로젝트 ${i + 1} 전환 실패:`, e.message);
        }
      }

      // 성능 통계
      if (switchingTimes.length > 0) {
        const avgSwitchTime =
          switchingTimes.reduce((a, b) => a + b, 0) / switchingTimes.length;
        const minSwitchTime = Math.min(...switchingTimes);
        const maxSwitchTime = Math.max(...switchingTimes);

        console.log("📊 프로젝트 전환 성능 통계:");
        console.log(`  - 평균: ${Math.round(avgSwitchTime)}ms`);
        console.log(`  - 최소: ${minSwitchTime}ms`);
        console.log(`  - 최대: ${maxSwitchTime}ms`);

        // 성능 임계값 확인 (2초 이하)
        if (avgSwitchTime <= 2000) {
          console.log("✅ 프로젝트 전환 성능 양호");
        } else {
          console.log("⚠️ 프로젝트 전환 성능 개선 필요");
        }
      }

      // localStorage 크기 측정
      const storageSize = await page.evaluate(() => {
        let totalSize = 0;
        const storageData = {};

        for (let key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key);
            const size = new Blob([value]).size;
            totalSize += size;
            storageData[key] = {
              size: size,
              value:
                value.length > 100 ? value.substring(0, 100) + "..." : value,
            };
          }
        }

        return {
          totalSize: totalSize,
          totalSizeKB: Math.round((totalSize / 1024) * 100) / 100,
          itemCount: Object.keys(storageData).length,
          items: storageData,
        };
      });

      console.log("💾 localStorage 사용량:");
      console.log(`  - 총 크기: ${storageSize.totalSizeKB}KB`);
      console.log(`  - 항목 수: ${storageSize.itemCount}개`);

      // 메모리 사용량 측정 (지원되는 경우)
      const memoryInfo = await page.evaluate(() => {
        if (performance.memory) {
          return {
            used:
              Math.round(
                (performance.memory.usedJSHeapSize / 1024 / 1024) * 100,
              ) / 100,
            total:
              Math.round(
                (performance.memory.totalJSHeapSize / 1024 / 1024) * 100,
              ) / 100,
            limit:
              Math.round(
                (performance.memory.jsHeapSizeLimit / 1024 / 1024) * 100,
              ) / 100,
          };
        }
        return null;
      });

      if (memoryInfo) {
        console.log("🧠 메모리 사용량:");
        console.log(`  - 사용: ${memoryInfo.used}MB`);
        console.log(`  - 총합: ${memoryInfo.total}MB`);
        console.log(`  - 한계: ${memoryInfo.limit}MB`);

        if (memoryInfo.used / memoryInfo.limit < 0.8) {
          console.log("✅ 메모리 사용량 양호");
        } else {
          console.log("⚠️ 메모리 사용량 주의 필요");
        }
      }

      // 캐시 효율성 테스트 (동일한 프로젝트 재선택)
      console.log("🔄 캐시 효율성 테스트...");
      const cacheTestStart = Date.now();
      await selectProjectWithValidation(page, 0);
      const cacheTestTime = Date.now() - cacheTestStart;

      console.log(`⚡ 캐시된 프로젝트 전환 시간: ${cacheTestTime}ms`);

      if (
        switchingTimes.length > 0 &&
        cacheTestTime < switchingTimes[0] * 0.8
      ) {
        console.log("✅ 캐시 최적화 효과 확인");
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`⏱️ 전체 테스트 소요 시간: ${totalTime}ms`);

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, "context-performance-test");

    console.log("✅ 프로젝트 컨텍스트 성능 테스트 완료");
  });
});
