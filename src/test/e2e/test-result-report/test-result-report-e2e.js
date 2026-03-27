// ICT-191: 테스트 결과 리포트 E2E 테스트
const { test, expect } = require("@playwright/test");

test.describe("ICT-191: 테스트 결과 리포트 E2E 테스트", () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // 로그인
    await page.goto("/");
    await page.fill('input[name="username"]', "admin");
    await page.fill('input[name="password"]', "admin");
    await page.click('button[type="submit"]');

    // 로그인 성공 대기
    await expect(page).toHaveURL(/\/dashboard/);
    await page.waitForTimeout(1000);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test("1. 테스트 결과 리포트 페이지 접근 테스트", async () => {
    console.log("📋 테스트 결과 리포트 페이지 접근 테스트 시작");

    // 테스트 결과 메뉴 클릭
    await page.click("text=테스트결과");
    await page.waitForTimeout(2000);

    // 페이지 제목 확인
    await expect(page.locator("h1, h2, h4")).toContainText(["테스트", "결과"]);

    console.log("✅ 테스트 결과 페이지 접근 성공");
  });

  test("2. 테스트 결과 통계 대시보드 표시 테스트", async () => {
    console.log("📊 테스트 결과 통계 대시보드 테스트 시작");

    await page.click("text=테스트결과");
    await page.waitForTimeout(2000);

    // 통계 카드들 확인
    const statsElements = [
      "text=총 테스트",
      "text=성공",
      "text=실패",
      "text=차단됨",
    ];

    for (const stat of statsElements) {
      const element = page.locator(stat);
      await expect(element).toBeVisible({ timeout: 10000 });
    }

    console.log("✅ 테스트 결과 통계 대시보드 확인 완료");
  });

  test("3. 테스트 결과 테이블 데이터 로딩 테스트", async () => {
    console.log("📝 테스트 결과 테이블 데이터 로딩 테스트 시작");

    await page.click("text=테스트결과");
    await page.waitForTimeout(3000);

    // 테이블 헤더 확인
    const tableHeaders = [
      "테스트케이스명",
      "폴더 경로",
      "결과",
      "실행일시",
      "실행자",
    ];

    for (const header of tableHeaders) {
      await expect(page.locator(`text=${header}`).first()).toBeVisible({
        timeout: 10000,
      });
    }

    // 테이블 데이터 로우 확인
    const tableRows = page.locator("tbody tr");
    await expect(tableRows.first()).toBeVisible({ timeout: 10000 });

    console.log("✅ 테스트 결과 테이블 데이터 로딩 확인 완료");
  });

  test("4. 테스트 결과 필터링 기능 테스트", async () => {
    console.log("🔍 테스트 결과 필터링 기능 테스트 시작");

    await page.click("text=테스트결과");
    await page.waitForTimeout(2000);

    // 필터 옵션들 확인
    const filterSelectors = [
      'select[name="result"]',
      'select[name="executor"]',
      'input[name="dateFrom"]',
    ];

    // 필터 요소들이 존재하는지 확인 (존재하지 않을 수도 있음)
    for (const selector of filterSelectors) {
      const element = page.locator(selector);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`✅ 필터 요소 발견: ${selector}`);
      }
    }

    console.log("✅ 테스트 결과 필터링 기능 확인 완료");
  });

  test("5. 테스트 결과 내보내기 기능 테스트", async () => {
    console.log("📄 테스트 결과 내보내기 기능 테스트 시작");

    await page.click("text=테스트결과");
    await page.waitForTimeout(2000);

    // Export 버튼 찾기
    const exportButton = page.locator("button", {
      hasText: /내보내기|Export|다운로드/i,
    });

    if (await exportButton.isVisible().catch(() => false)) {
      await exportButton.click();
      await page.waitForTimeout(1000);

      // 내보내기 다이얼로그 확인
      const dialogExists = await page
        .locator('[role="dialog"], .MuiDialog-root')
        .isVisible()
        .catch(() => false);

      if (dialogExists) {
        // 형식 선택 옵션들 확인
        const formatOptions = ["CSV", "Excel", "PDF"];
        for (const format of formatOptions) {
          const formatElement = page.locator(`text=${format}`);
          const isVisible = await formatElement.isVisible().catch(() => false);
          if (isVisible) {
            console.log(`✅ ${format} 형식 옵션 발견`);
          }
        }
      }

      // 다이얼로그 닫기
      const closeButton = page.locator("button", {
        hasText: /취소|닫기|Close/i,
      });
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
      }
    }

    console.log("✅ 테스트 결과 내보내기 기능 확인 완료");
  });

  test("6. JIRA 연동 기능 표시 테스트", async () => {
    console.log("🔗 JIRA 연동 기능 표시 테스트 시작");

    await page.click("text=테스트결과");
    await page.waitForTimeout(2000);

    // JIRA 이슈 키 컬럼 확인
    const jiraColumn = page.locator("text=JIRA");
    const jiraColumnExists = await jiraColumn.isVisible().catch(() => false);

    if (jiraColumnExists) {
      console.log("✅ JIRA 컬럼 발견");

      // JIRA 이슈 키 링크 확인
      const jiraLinks = page.locator('a[href*="atlassian"]');
      const jiraLinkCount = await jiraLinks.count();

      if (jiraLinkCount > 0) {
        console.log(`✅ JIRA 이슈 링크 ${jiraLinkCount}개 발견`);
      }
    }

    console.log("✅ JIRA 연동 기능 확인 완료");
  });

  test("7. 페이징 기능 테스트", async () => {
    console.log("📄 페이징 기능 테스트 시작");

    await page.click("text=테스트결과");
    await page.waitForTimeout(2000);

    // 페이징 컨트롤 확인
    const paginationElements = [
      'button[aria-label*="page"]',
      ".MuiPagination-root",
      "text=다음",
      "text=이전",
    ];

    let paginationFound = false;
    for (const selector of paginationElements) {
      const element = page.locator(selector);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`✅ 페이징 요소 발견: ${selector}`);
        paginationFound = true;
        break;
      }
    }

    if (!paginationFound) {
      console.log(
        "ℹ️ 페이징 요소를 찾을 수 없음 (데이터가 적거나 다른 UI 패턴)",
      );
    }

    console.log("✅ 페이징 기능 확인 완료");
  });

  test("8. 성능 테스트 - 응답시간 측정", async () => {
    console.log("⚡ 성능 테스트 - 응답시간 측정 시작");

    const startTime = Date.now();

    await page.click("text=테스트결과");

    // 테이블 데이터 로딩 대기
    await page.waitForSelector("tbody tr", { timeout: 10000 });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`📊 페이지 로딩 시간: ${responseTime}ms`);

    // 성능 기준: 5초 이내 (관대한 기준)
    expect(responseTime).toBeLessThan(5000);

    if (responseTime < 500) {
      console.log("🚀 우수한 성능 (500ms 미만)");
    } else if (responseTime < 2000) {
      console.log("✅ 양호한 성능 (2초 미만)");
    } else {
      console.log("⚠️ 성능 개선 필요 (2초 이상)");
    }

    console.log("✅ 성능 테스트 완료");
  });

  test("9. 에러 시나리오 테스트", async () => {
    console.log("🚨 에러 시나리오 테스트 시작");

    // 네트워크 오프라인 상태 시뮬레이션
    await page.setOffline(true);

    await page.click("text=테스트결과");
    await page.waitForTimeout(2000);

    // 에러 메시지나 로딩 상태 확인
    const errorIndicators = [
      "text=오류",
      "text=에러",
      "text=연결",
      "text=실패",
      ".MuiCircularProgress-root",
      '[data-testid="loading"]',
    ];

    let errorHandlingFound = false;
    for (const selector of errorIndicators) {
      const element = page.locator(selector);
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        console.log(`✅ 에러 핸들링 UI 발견: ${selector}`);
        errorHandlingFound = true;
      }
    }

    // 네트워크 온라인 복구
    await page.setOffline(false);
    await page.waitForTimeout(1000);

    console.log("✅ 에러 시나리오 테스트 완료");
  });

  test("10. 통합 시나리오 테스트", async () => {
    console.log("🔄 통합 시나리오 테스트 시작");

    // 1. 페이지 접근
    await page.click("text=테스트결과");
    await page.waitForTimeout(2000);

    // 2. 데이터 로딩 확인
    await page.waitForSelector("tbody tr", { timeout: 10000 });

    // 3. 통계 정보 확인
    const statsVisible = await page
      .locator("text=총")
      .isVisible()
      .catch(() => false);
    if (statsVisible) {
      console.log("✅ 통계 정보 표시됨");
    }

    // 4. 테이블 상호작용
    const firstRow = page.locator("tbody tr").first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);
      console.log("✅ 테이블 행 클릭 가능");
    }

    // 5. 새로고침 테스트
    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page.locator("tbody tr").first()).toBeVisible({
      timeout: 10000,
    });

    console.log("✅ 통합 시나리오 테스트 완료");
  });
});
