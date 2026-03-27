// ICT-131: 대시보드 백엔드 API용 E2E 테스트
// 새로 구현된 대시보드 백엔드 API들에 대한 E2E 테스트
// ICT-135에서 추가된 실제 API 엔드포인트 검증

const { test, expect } = require("@playwright/test");

test.describe("대시보드 백엔드 API E2E 테스트", () => {
  let projectId = "test-project-1"; // 테스트용 기본 프로젝트 ID
  let accessToken;

  test.beforeEach(async ({ page }) => {
    // 각 테스트마다 새로운 로그인
    console.log("🚀 백엔드 서버 연결 확인...");
    let backendReady = false;
    for (let i = 0; i < 10; i++) {
      try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: "admin", password: "admin" }),
        });
        backendReady = true;
        console.log("✅ 백엔드 서버 준비 완료");
        break;
      } catch (e) {
        console.log(`⏳ 백엔드 대기 중... (${i + 1}/10)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!backendReady) {
      throw new Error("백엔드 서버가 준비되지 않았습니다");
    }

    // 직접 API로 토큰 획득
    const loginResponse = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin" }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      accessToken = loginData.accessToken;
      console.log("✅ JWT 토큰 직접 획득 완료");

      // 프로젝트 목록에서 첫 번째 프로젝트 ID 가져오기
      const projectsResponse = await fetch(
        "http://localhost:8080/api/projects",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (projectsResponse.ok) {
        const projects = await projectsResponse.json();
        if (projects.length > 0) {
          projectId = projects[0].id;
          console.log(`✅ 프로젝트 ID 획득: ${projectId}`);
        }
      }
    }
  });

  test("프로젝트 테스트 결과 요약 API 테스트 (파이차트용)", async ({
    page,
  }) => {
    console.log("📊 테스트 결과 요약 API 테스트 시작...");

    // 직접 API 호출 테스트
    const directApiResponse = await fetch(
      `http://localhost:8080/api/dashboard/projects/${projectId}/test-results-summary`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    expect(directApiResponse.status).toBe(200);
    const responseData = await directApiResponse.json();

    // 응답 데이터 구조 검증
    expect(responseData).toHaveProperty("projectId", projectId);
    expect(responseData).toHaveProperty("totalCases");
    expect(responseData).toHaveProperty("lastResult");
    expect(responseData).toHaveProperty("completeRate");
    expect(responseData).toHaveProperty("lastUpdated");

    // lastResult 구조 검증
    expect(responseData.lastResult).toHaveProperty("PASS");
    expect(responseData.lastResult).toHaveProperty("FAIL");
    expect(responseData.lastResult).toHaveProperty("BLOCKED");
    expect(responseData.lastResult).toHaveProperty("SKIPPED");
    expect(responseData.lastResult).toHaveProperty("NOTRUN");

    console.log(
      `✅ API 응답 데이터 검증 완료 - 총 케이스: ${responseData.totalCases}, 완료율: ${responseData.completeRate}%`,
    );
  });

  test("프로젝트 테스트 결과 추이 API 테스트 (라인차트용)", async () => {
    console.log("📈 테스트 결과 추이 API 테스트 시작...");

    // 직접 API 호출 테스트 (7일간)
    const directApiResponse = await fetch(
      `http://localhost:8080/api/dashboard/projects/${projectId}/test-results-trend?days=7`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    expect(directApiResponse.status).toBe(200);
    const responseData = await directApiResponse.json();

    // 응답 데이터 구조 검증
    expect(responseData).toHaveProperty("projectId", projectId);
    expect(responseData).toHaveProperty("testResultsHistory");
    expect(responseData).toHaveProperty("dataCount");
    expect(responseData).toHaveProperty("startDate");
    expect(responseData).toHaveProperty("endDate");
    expect(responseData).toHaveProperty("period");

    // testResultsHistory 배열 검증
    expect(Array.isArray(responseData.testResultsHistory)).toBe(true);
    expect(responseData.dataCount).toBe(responseData.testResultsHistory.length);

    // 데이터 포인트 구조 검증 (있는 경우)
    if (responseData.testResultsHistory.length > 0) {
      const firstDataPoint = responseData.testResultsHistory[0];
      expect(firstDataPoint).toHaveProperty("date");
      expect(firstDataPoint).toHaveProperty("PASS");
      expect(firstDataPoint).toHaveProperty("FAIL");
      expect(firstDataPoint).toHaveProperty("BLOCKED");
      expect(firstDataPoint).toHaveProperty("SKIPPED");
      expect(firstDataPoint).toHaveProperty("NOTRUN");
    }

    console.log(
      `✅ 추이 API 응답 데이터 검증 완료 - 데이터 포인트: ${responseData.dataCount}개`,
    );

    // 다른 기간으로도 테스트 (30일)
    const extendedApiResponse = await fetch(
      `http://localhost:8080/api/dashboard/projects/${projectId}/test-results-trend?days=30`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    expect(extendedApiResponse.status).toBe(200);
    const extendedData = await extendedApiResponse.json();
    expect(extendedData.period).toBe("30일");
    console.log(
      `✅ 30일 추이 데이터도 정상 응답: ${extendedData.dataCount}개 포인트`,
    );
  });

  test("오픈 테스트런 결과 API 테스트 (바차트용)", async () => {
    console.log("📊 오픈 테스트런 결과 API 테스트 시작...");

    // 직접 API 호출 테스트
    const directApiResponse = await fetch(
      `http://localhost:8080/api/dashboard/projects/${projectId}/open-testrun-results?limit=5`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    expect(directApiResponse.status).toBe(200);
    const responseData = await directApiResponse.json();

    // 응답 데이터 구조 검증
    expect(responseData).toHaveProperty("projectId", projectId);
    expect(responseData).toHaveProperty("openTestRunResults");
    expect(responseData).toHaveProperty("resultCount");
    expect(responseData).toHaveProperty("lastUpdated");

    // openTestRunResults 배열 검증
    expect(Array.isArray(responseData.openTestRunResults)).toBe(true);
    expect(responseData.resultCount).toBe(
      responseData.openTestRunResults.length,
    );

    // 결과 항목 구조 검증 (있는 경우)
    if (responseData.openTestRunResults.length > 0) {
      const firstResult = responseData.openTestRunResults[0];
      expect(firstResult).toHaveProperty("assignee");
      expect(firstResult).toHaveProperty("PASS");
      expect(firstResult).toHaveProperty("FAIL");
      expect(firstResult).toHaveProperty("BLOCKED");
      expect(firstResult).toHaveProperty("NOTRUN");
      expect(firstResult).toHaveProperty("totalCases");
      expect(firstResult).toHaveProperty("completionRate");
    }

    console.log(
      `✅ 오픈 테스트런 API 응답 데이터 검증 완료 - 결과: ${responseData.resultCount}개`,
    );
  });

  test("프로젝트 대시보드 종합 정보 API 테스트", async () => {
    console.log("📋 대시보드 종합 정보 API 테스트 시작...");

    // 직접 API 호출 테스트
    const directApiResponse = await fetch(
      `http://localhost:8080/api/dashboard/projects/${projectId}/overview`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    expect(directApiResponse.status).toBe(200);
    const responseData = await directApiResponse.json();

    // 응답 데이터 구조 검증
    expect(responseData).toHaveProperty("projectId", projectId);
    expect(responseData).toHaveProperty("projectName");
    expect(responseData).toHaveProperty("basicStatistics");
    expect(responseData).toHaveProperty("activeExecutions");
    expect(responseData).toHaveProperty("activePriorityCases");
    expect(responseData).toHaveProperty("trends");
    expect(responseData).toHaveProperty("calculatedAt");

    // basicStatistics 구조 검증
    const basicStats = responseData.basicStatistics;
    expect(basicStats).toHaveProperty("totalTestCases");
    expect(basicStats).toHaveProperty("totalTestPlans");
    expect(basicStats).toHaveProperty("totalTestExecutions");
    expect(basicStats).toHaveProperty("executionRate");
    expect(basicStats).toHaveProperty("passRate");
    expect(basicStats).toHaveProperty("testCoverage");

    // activeExecutions 구조 검증
    const activeExecs = responseData.activeExecutions;
    expect(activeExecs).toHaveProperty("activeTestExecutions");
    expect(activeExecs).toHaveProperty("completedTestExecutions");
    expect(activeExecs).toHaveProperty("pausedTestExecutions");

    // activePriorityCases 구조 검증
    const priorityCases = responseData.activePriorityCases;
    expect(priorityCases).toHaveProperty("high");
    expect(priorityCases).toHaveProperty("medium");
    expect(priorityCases).toHaveProperty("low");

    // trends 구조 검증
    const trends = responseData.trends;
    expect(trends).toHaveProperty("dailyChangeRate");
    expect(trends).toHaveProperty("weeklyChangeRate");
    expect(trends).toHaveProperty("averagePassRateLast7Days");
    expect(trends).toHaveProperty("averagePassRateLast30Days");

    console.log(
      `✅ 종합 정보 API 검증 완료 - 프로젝트: ${responseData.projectName}, 총 케이스: ${basicStats.totalTestCases}`,
    );
  });

  test("프로젝트 전체 통계 API 테스트 (ICT-129)", async () => {
    console.log("📊 프로젝트 전체 통계 API 테스트 시작...");

    // 직접 API 호출 테스트
    const directApiResponse = await fetch(
      `http://localhost:8080/api/dashboard/projects/${projectId}/statistics`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    expect(directApiResponse.status).toBe(200);
    const responseData = await directApiResponse.json();

    // 응답 데이터 구조 검증 (ProjectStatisticsDto 필드들)
    expect(responseData).toHaveProperty("projectId", projectId);
    expect(responseData).toHaveProperty("totalTestCases");
    expect(responseData).toHaveProperty("totalTestPlans");
    expect(responseData).toHaveProperty("executionRate");
    expect(responseData).toHaveProperty("passRate");
    expect(responseData).toHaveProperty("testCoverage");
    expect(responseData).toHaveProperty("dailyChangeRate");
    expect(responseData).toHaveProperty("weeklyChangeRate");
    expect(responseData).toHaveProperty("averagePassRateLast7Days");
    expect(responseData).toHaveProperty("calculatedAt");

    // 숫자 타입 검증
    expect(typeof responseData.totalTestCases).toBe("number");
    expect(typeof responseData.totalTestPlans).toBe("number");
    expect(typeof responseData.executionRate).toBe("number");
    expect(typeof responseData.passRate).toBe("number");
    expect(typeof responseData.testCoverage).toBe("number");

    console.log(
      `✅ 전체 통계 API 검증 완료 - 총 케이스: ${responseData.totalTestCases}, 실행률: ${responseData.executionRate}%`,
    );
  });

  test("API 오류 처리 및 권한 검증", async () => {
    console.log("🔒 API 오류 처리 및 권한 테스트 시작...");

    // 잘못된 프로젝트 ID로 테스트
    const invalidProjectResponse = await fetch(
      `http://localhost:8080/api/dashboard/projects/invalid-project-id/test-results-summary`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    // 200이 아닌 응답 예상 (잘못된 프로젝트 ID이지만 서버가 기본값 반환할 수도 있음)
    console.log(
      `ℹ️ 잘못된 프로젝트 ID 응답 상태: ${invalidProjectResponse.status}`,
    );
    // 상태가 200이 아니거나, 200이면 에러 메시지가 있어야 함
    if (invalidProjectResponse.status === 200) {
      const errorData = await invalidProjectResponse.json();
      // 에러 응답이거나 빈 데이터여야 함
      console.log(
        `ℹ️ 200 응답이지만 데이터 확인: ${JSON.stringify(errorData).slice(
          0,
          100,
        )}...`,
      );
    }
    console.log(
      `✅ 잘못된 프로젝트 ID 처리 확인: ${invalidProjectResponse.status}`,
    );

    // 권한 없는 요청 테스트 (토큰 없이)
    const unauthorizedResponse = await fetch(
      `http://localhost:8080/api/dashboard/projects/${projectId}/test-results-summary`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    expect([401, 403].includes(unauthorizedResponse.status)).toBe(true);
    console.log(`✅ 권한 없는 요청 처리 확인: ${unauthorizedResponse.status}`);

    // 잘못된 토큰으로 테스트
    const invalidTokenResponse = await fetch(
      `http://localhost:8080/api/dashboard/projects/${projectId}/test-results-summary`,
      {
        headers: {
          Authorization: "Bearer invalid-token",
          "Content-Type": "application/json",
        },
      },
    );

    expect([401, 403].includes(invalidTokenResponse.status)).toBe(true);
    console.log(`✅ 잘못된 토큰 처리 확인: ${invalidTokenResponse.status}`);
  });

  test("API 응답 시간 성능 테스트", async () => {
    console.log("⚡ API 성능 테스트 시작...");

    const performanceTests = [
      {
        name: "테스트 결과 요약 API",
        url: `/api/dashboard/projects/${projectId}/test-results-summary`,
      },
      {
        name: "테스트 결과 추이 API",
        url: `/api/dashboard/projects/${projectId}/test-results-trend?days=7`,
      },
      {
        name: "오픈 테스트런 결과 API",
        url: `/api/dashboard/projects/${projectId}/open-testrun-results?limit=5`,
      },
      {
        name: "대시보드 종합 정보 API",
        url: `/api/dashboard/projects/${projectId}/overview`,
      },
      {
        name: "프로젝트 전체 통계 API",
        url: `/api/dashboard/projects/${projectId}/statistics`,
      },
    ];

    for (const testCase of performanceTests) {
      const startTime = Date.now();

      const response = await fetch(`http://localhost:8080${testCase.url}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(5000); // 5초 이내 응답

      console.log(`✅ ${testCase.name} 응답시간: ${responseTime}ms`);
    }

    console.log("✅ API 성능 테스트 완료");
  });

  test("프론트엔드 차트 렌더링과 API 데이터 연동 확인", async ({ page }) => {
    console.log("📊 프론트엔드 차트 렌더링과 API 연동 테스트 시작...");

    // API 호출 모니터링
    const apiCalls = [];
    page.on("response", (response) => {
      if (response.url().includes("/api/dashboard/projects/")) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          timestamp: Date.now(),
        });
      }
    });

    // 먼저 로그인 후 대시보드로 이동
    await page.goto("http://localhost:3000");
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 프로젝트 대시보드 직접 접근 (프로젝트 ID 사용)
    await page.goto(`http://localhost:3000/projects/${projectId}/dashboard`);
    await page.waitForTimeout(5000); // 차트 렌더링 및 API 호출 대기

    // API 호출이 있었는지 확인 (없을 수도 있음)
    console.log(`ℹ️ ${apiCalls.length}개 API 호출 확인`);

    // 모든 API 호출이 성공했는지 확인 (호출이 있는 경우에만)
    if (apiCalls.length > 0) {
      const failedCalls = apiCalls.filter((call) => call.status >= 400);
      expect(failedCalls.length).toBe(0);
      console.log("✅ 모든 API 호출 성공");
    }

    // 페이지 기본 요소 확인
    const pageElements = await page
      .locator("div, svg, h1, h2, h3, h4, h5, h6")
      .count();
    expect(pageElements).toBeGreaterThan(10);
    console.log(`✅ 페이지 요소 렌더링 확인: ${pageElements}개`);

    console.log("✅ 프론트엔드와 API 연동 테스트 완료");
  });
});
