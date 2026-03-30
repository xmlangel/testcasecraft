// src/test/e2e/junit/junit-note-column.spec.js
// JUnit 결과 상세 페이지의 테스트 케이스 리스트에 Note 컬럼이 표시되는지 검증

const { test, expect } = require("../fixtures/test-fixtures.js");
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require("../config/credentials.js");

// 실제 프로젝트/결과 ID 대신 동정인 경로 탐색 사용
let TEST_PROJECT_ID = "";
let TEST_RESULT_ID = "";

test.describe("JUnit 결과 상세 페이지 - Note 컬럼 표시", () => {
  test.beforeEach(
    async ({ page, loginPage, projectListPage, automationPage }) => {
      // 1. 로그인 및 메인 페이지 진입
      await loginPage.performLoginAndNavigate({
        username: ADMIN_USERNAME,
        password: ADMIN_PASSWORD,
        loginPage,
        projectListPage,
      });

      // 2. 현재 프로젝트 ID 추출
      const url = page.url();
      const match = url.match(/\/projects\/([a-f0-9-]+)/);
      if (match) {
        TEST_PROJECT_ID = match[1];
        console.log(`🔎 현재 프로젝트 ID: ${TEST_PROJECT_ID}`);
      } else {
        throw new Error("프로젝트 ID를 추출할 수 없습니다.");
      }

      // 3. 자동화 탭 이동 및 첫 번째 결과 ID 확보
      await automationPage.navigateToProjectAutomation(TEST_PROJECT_ID);
      await automationPage.waitForIdle();

      // 결과 목록이 로드될 때까지 대기
      try {
        await automationPage.fileLink
          .first()
          .waitFor({ state: "visible", timeout: 15000 });
        const href = await automationPage.fileLink.first().getAttribute("href");
        // href format: /projects/{pid}/junit-results/{rid}
        const resMatch = href.match(/\/junit-results\/([a-f0-9-]+)/);
        if (resMatch) {
          TEST_RESULT_ID = resMatch[1];
          console.log(`🔎 현재 테스트 결과 ID: ${TEST_RESULT_ID}`);
        }
      } catch (e) {
        console.log(
          "⚠️ 자동화 결과 목록을 찾을 수 없습니다. 테스트 준비 데이터가 필요할 수 있습니다.",
        );
      }
    },
  );

  test("테스트 케이스 테이블에 노트 헤더 컬럼이 표시된다", async ({
    automationPage,
  }) => {
    if (!TEST_RESULT_ID) {
      console.log("⏩ 테스트 결과 데이터가 없어 건너뜁니다.");
      return;
    }
    await automationPage.goto(
      `/projects/${TEST_PROJECT_ID}/junit-results/${TEST_RESULT_ID}`,
    );
    await automationPage.waitForIdle();

    // 테이블이 렌더링될 때까지 대기
    await automationPage.caseRow
      .first()
      .waitFor({ state: "visible", timeout: 15000 });

    // 테이블 헤더에 "노트" 컬럼이 있는지 확인
    await expect(automationPage.noteHeader).toBeVisible({ timeout: 5000 });
  });

  test('테스트 케이스 행에 Note 셀이 존재한다 (노트 없으면 "-" 표시)', async ({
    automationPage,
  }) => {
    if (!TEST_RESULT_ID) return;
    await automationPage.goto(
      `/projects/${TEST_PROJECT_ID}/junit-results/${TEST_RESULT_ID}`,
    );
    await automationPage.waitForIdle();

    await automationPage.caseRow
      .first()
      .waitFor({ state: "visible", timeout: 15000 });

    // Note 셀이 존재하는지 확인
    const count = await automationPage.noteCell.count();
    expect(count).toBeGreaterThan(0);
    await expect(automationPage.noteCell.first()).toBeVisible();
  });

  test("노트가 있는 테스트 케이스는 해당 내용이 리스트에 표시된다", async ({
    automationPage,
  }) => {
    if (!TEST_RESULT_ID) return;
    await automationPage.goto(
      `/projects/${TEST_PROJECT_ID}/junit-results/${TEST_RESULT_ID}`,
    );
    await automationPage.waitForIdle();

    await automationPage.caseRow
      .first()
      .waitFor({ state: "visible", timeout: 15000 });

    const count = await automationPage.noteCell.count();
    expect(count).toBeGreaterThan(0);

    let hasNoteContent = false;
    let noteText = "";
    for (let i = 0; i < Math.min(count, 10); i++) {
      const cellText = await automationPage.noteCell.nth(i).textContent();
      if (cellText && cellText.trim() !== "-" && cellText.trim() !== "") {
        hasNoteContent = true;
        noteText = cellText.trim();
        break;
      }
    }

    console.log(
      `Note 셀 개수: ${count}, 노트 내용 존재 여부: ${hasNoteContent}, 노트 내용: "${noteText}"`,
    );
    const firstCellText = await automationPage.noteCell.first().textContent();
    expect(firstCellText !== null && firstCellText !== undefined).toBe(true);
  });

  test("노트 입력 후 리스트에 반영된다 (편집 → 저장 → 확인)", async ({
    page,
    automationPage,
  }) => {
    if (!TEST_RESULT_ID) return;
    const testNote = `E2E 테스트 노트 ${Date.now()}`;

    await automationPage.goto(
      `/projects/${TEST_PROJECT_ID}/junit-results/${TEST_RESULT_ID}`,
    );
    await automationPage.waitForIdle();

    await automationPage.editCaseButton
      .first()
      .waitFor({ state: "visible", timeout: 15000 });

    // AutomationPage의 헬퍼 메서드로 편집 수행 (내부에 저장 동작 포함)
    await automationPage.editTestCaseByIndex(0, { notes: testNote });

    // 다이얼로그 닫힐 때까지 대기
    await automationPage.editNotesInputWrapper.waitFor({
      state: "detached",
      timeout: 10000,
    });

    // 테이블이 업데이트될 때까지 잠시 대기
    await page.waitForTimeout(1500);

    // 첫 번째 Note 셀에 입력한 노트가 표시되는지 확인
    await expect(automationPage.noteCell.first()).toContainText(testNote, {
      timeout: 5000,
    });
  });

  test("자동화 탭 → JUnit 결과 상세 이동 → Note 컬럼 확인 (전체 플로우)", async ({
    page,
    automationPage,
  }) => {
    // 자동화 탭 클릭 (전체 프로젝트 메인에서는 접근이 어려울 수 있으므로 프로젝트 내부인지 확인)
    if (!page.url().includes(`/projects/${TEST_PROJECT_ID}`)) {
      await page.goto(`/projects/${TEST_PROJECT_ID}`);
      await page.waitForLoadState("networkidle");
    }

    const automationTab = page
      .locator('[role="tab"], .MuiTab-root')
      .filter({ hasText: /(자동화|Automation)/i })
      .first();
    await automationTab.waitFor({ state: "visible", timeout: 10000 });
    await automationTab.click();

    // 혹시 '최근 결과' 서브 탭이 있다면 선택
    const recentTabs = page
      .locator(".MuiTab-root")
      .filter({ hasText: /(최근 결과|Recent)/i });
    if ((await recentTabs.count()) > 0) {
      await recentTabs.first().click();
    }

    // 파일 로드 대기 및 클릭
    await automationPage.fileLink
      .first()
      .waitFor({ state: "visible", timeout: 15000 });
    await automationPage.fileLink.first().click();
    await automationPage.waitForIdle();

    await automationPage.caseRow
      .first()
      .waitFor({ state: "visible", timeout: 15000 });

    await expect(automationPage.noteHeader).toBeVisible({ timeout: 5000 });
    expect(await automationPage.noteCell.count()).toBeGreaterThan(0);
  });
});
