/**
 * 스텝별 결과 입력과 결과 내보내기 E2E (ICT-469·470·472)
 *
 * 준비 데이터는 API 로 만든다. 테스트마다 전용 프로젝트를 만들고 끝나면 프로젝트째 지워
 * 다른 프로젝트의 데이터를 건드리지 않는다.
 *
 * 1. [ICT-469] 결과 입력 화면에서 스텝 결과를 고르면 종합 결과가 자동 선택되고,
 *    저장하면 서버에 스텝 결과가 남으며, 다시 열면 그대로 보인다.
 * 2. [ICT-470] 비고에 본문 이미지가 있는 결과를 CSV 로 내보내면 이미지 주소와 공개 토큰이 파일에 없다.
 * 3. [ICT-472] HTML 리포트 카드에 스텝 결과 표가 실린다.
 *    ICT-472 가 들어간 빌드(dev 4cd49348 이후)에서만 통과한다. 그 이전 빌드에서는 실패하는 것이 정상이다.
 *
 * 실행: npx playwright test regression/step-results-export.spec.js (서버 8080 필요)
 */

const { test, expect } = require("@playwright/test");
const fs = require("fs");
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require("../config/credentials.js");

const IMAGE_URL = "/api/testcase-attachments/public/e2e-att";
const TOKEN = "E2E-SECRET-TOKEN";

async function apiLogin(request) {
  const res = await request.post("/api/auth/login", {
    data: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
  });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

async function apiCall(request, auth, method, url, data) {
  const res = await request.fetch(url, {
    method,
    data,
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });
  expect(res.ok(), `${method} ${url} → ${res.status()}`).toBeTruthy();
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/** 전용 프로젝트에 스텝 2개짜리 케이스·플랜·실행을 만들고 실행을 시작한다 */
async function createFixture(request, auth) {
  // 병렬 워커가 같은 밀리초에 만들면 프로젝트 코드가 겹쳐 409 가 나므로 난수를 붙인다
  const stamp = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const project = await apiCall(request, auth, "POST", "/api/projects", {
    code: `E2E-STEP-${stamp}`,
    name: `E2E 스텝 결과 ${stamp}`,
  });
  const testCase = await apiCall(request, auth, "POST", "/api/testcases", {
    name: `E2E 스텝 케이스 ${stamp}`,
    type: "testcase",
    projectId: project.id,
    steps: [
      { stepNumber: 1, description: "로그인한다", expectedResult: "대시보드" },
      { stepNumber: 2, description: "저장한다", expectedResult: "저장됨" },
    ],
  });
  const plan = await apiCall(request, auth, "POST", "/api/test-plans", {
    name: `E2E 플랜 ${stamp}`,
    projectId: project.id,
    testCaseIds: [testCase.id],
  });
  const execution = await apiCall(
    request,
    auth,
    "POST",
    "/api/test-executions",
    {
      name: `E2E 실행 ${stamp}`,
      projectId: project.id,
      testPlanId: plan.id,
    },
  );
  await apiCall(
    request,
    auth,
    "POST",
    `/api/test-executions/${execution.id}/start`,
  );
  return { project, testCase, plan, execution };
}

async function deleteFixture(request, auth, fx) {
  if (!fx?.project?.id) return;
  await apiCall(
    request,
    auth,
    "DELETE",
    `/api/projects/${fx.project.id}?force=true`,
  );
}

async function savedResult(request, auth, fx) {
  const exec = await apiCall(
    request,
    auth,
    "GET",
    `/api/test-executions/${fx.execution.id}`,
  );
  return (exec.results || []).find((r) => r.testCaseId === fx.testCase.id);
}

/** 화면 로그인 대신 API 로 받은 토큰을 넣고 시작한다 */
async function openAs(page, auth, path) {
  await page.addInitScript((tokens) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
  }, auth);
  await page.goto(path);
}

/** 스텝 실제 결과 입력 칸. ICT-472 이전은 textarea, 이후는 마크다운 에디터다 */
function stepActualInput(page, stepNumber) {
  const textarea = page.locator(`[data-testid="step-${stepNumber}-actual"]`);
  const editor = page
    .locator(`[aria-label="step-${stepNumber}-result"]`)
    .locator(
      "xpath=ancestor::*[.//*[@contenteditable='true']][1]//*[@contenteditable='true']",
    )
    .first();
  return textarea.or(editor);
}

const resultUrl = (fx) =>
  `/projects/${fx.project.id}/executions/${fx.execution.id}/testcases/${fx.testCase.id}/result`;

const resultsPageUrl = (fx) =>
  `/projects/${fx.project.id}/results?testExecutionId=${fx.execution.id}`;

/** 결과 화면의 상세 테이블에서 내보내기 대화상자를 열어 파일을 받는다. 화면 언어(한/영)와 무관하게 찾는다 */
async function downloadExport(page, fx, format) {
  await page.goto(resultsPageUrl(fx));
  await page.getByText(/^(Detailed Table|상세 테이블)$/i).click();
  // 표 기본 기능의 「Export」(CSV·인쇄 메뉴)가 아니라 고급 내보내기 대화상자를 연다
  await page
    .getByRole("button", { name: /^(Advanced Export|고급 내보내기)$/i })
    .click();
  const dialog = page.getByRole("dialog");
  const titles = {
    CSV: "CSV (.csv)",
    HTML: "HTML (.html)",
  };
  await dialog.getByText(titles[format], { exact: true }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    dialog
      .getByRole("button", {
        name: new RegExp(`^(Export ${format}|${format} 내보내기)$`),
      })
      .click(),
  ]);
  return fs.readFileSync(await download.path(), "utf8");
}

test.describe("스텝별 결과 입력과 내보내기", () => {
  test.setTimeout(120000);

  let auth;
  let fx;

  test.beforeEach(async ({ request }) => {
    auth = await apiLogin(request);
    fx = await createFixture(request, auth);
  });

  test.afterEach(async ({ request }) => {
    await deleteFixture(request, auth, fx);
  });

  test("[ICT-469] 스텝 결과를 고르면 종합 결과가 자동 선택되고, 저장한 스텝 결과가 서버와 화면에 남는다", async ({
    page,
    request,
  }) => {
    await openAs(page, auth, resultUrl(fx));

    // 종합 결과 버튼은 누르지 않는다. 저장된 종합 결과가 FAIL 이면 스텝 결과로 자동 선택된 것이다
    // (전체 화면의 N·P·F·B 버튼은 선택 상태를 색으로만 보여 줘 화면에서 읽을 속성이 없다)
    await page.getByTestId("step-1-PASS").click();
    await page.getByTestId("step-2-FAIL").click();

    const actual = stepActualInput(page, 2);
    await actual.click();
    await actual.fill("E2E 실패 사유");

    await page.getByTestId("floating-save-button").click();

    await expect
      .poll(async () => (await savedResult(request, auth, fx))?.steps, {
        timeout: 15000,
      })
      .toEqual([
        expect.objectContaining({ stepNumber: 1, result: "PASS" }),
        expect.objectContaining({
          stepNumber: 2,
          result: "FAIL",
          actualResult: "E2E 실패 사유",
        }),
      ]);
    expect((await savedResult(request, auth, fx)).result).toBe("FAIL");

    await page.reload();
    await expect(page.getByTestId("step-2-FAIL")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByTestId("step-1-PASS")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("[ICT-470] 비고에 본문 이미지가 있는 결과를 CSV 로 내보내면 이미지 주소와 토큰이 파일에 없다", async ({
    page,
    request,
  }) => {
    await apiCall(
      request,
      auth,
      "POST",
      `/api/test-executions/${fx.execution.id}/results`,
      {
        testCaseId: fx.testCase.id,
        result: "FAIL",
        notes: `E2E 비고\n![캡처](${IMAGE_URL}?token=${TOKEN})`,
      },
    );
    await openAs(page, auth, resultsPageUrl(fx));

    const csv = await downloadExport(page, fx, "CSV");

    expect(csv).toContain("E2E 비고");
    expect(csv).not.toContain(TOKEN);
    expect(csv).not.toContain(IMAGE_URL);
  });

  test("[ICT-472] HTML 리포트 카드에 스텝 결과 표가 스텝 순서대로 실린다", async ({
    page,
    request,
  }) => {
    await apiCall(
      request,
      auth,
      "POST",
      `/api/test-executions/${fx.execution.id}/results`,
      {
        testCaseId: fx.testCase.id,
        result: "FAIL",
        steps: [
          { stepNumber: 1, result: "PASS" },
          { stepNumber: 2, result: "FAIL", actualResult: "첫 줄\n둘째 줄" },
        ],
      },
    );
    await openAs(page, auth, resultsPageUrl(fx));

    const html = await downloadExport(page, fx, "HTML");
    const report = await page.context().newPage();
    await report.setContent(html);

    const rows = report.locator("section.case table.steps tbody tr");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0).locator("td.no")).toHaveText("1");
    await expect(rows.nth(1).locator("td.no")).toHaveText("2");
    // 줄바꿈이 화면에서 두 줄로 보이는지 렌더 높이로 확인한다
    const cell = rows.nth(1).locator("td.md p");
    await expect(cell).toContainText("첫 줄");
    const lines = await cell.evaluate((el) => {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 16;
      return Math.round(el.getBoundingClientRect().height / lh);
    });
    expect(lines).toBeGreaterThanOrEqual(2);
    await report.close();
  });
});
