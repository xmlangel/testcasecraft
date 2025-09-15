const { chromium } = require("playwright");

async function simpleAttachmentTest() {
  console.log("간단한 첨부파일 업로드 테스트 시작");

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1500
  });

  const context = await browser.newContext({
    baseURL: "http://localhost:8080"
  });

  const page = await context.newPage();

  page.on("request", request => {
    if (request.url().includes("attachments")) {
      console.log("업로드 요청:", request.method(), request.url());
      const contentType = request.headers()["content-type"];
      console.log("Content-Type:", contentType);
    }
  });

  page.on("response", response => {
    if (response.url().includes("attachments")) {
      console.log("응답:", response.status(), response.statusText());
    }
  });

  try {
    console.log("1. 로그인");
    await page.goto("/", { timeout: 20000 });
    await page.waitForLoadState("networkidle");

    await page.fill("input[name=\"username\"]", "admin");
    await page.fill("input[name=\"password\"]", "admin");
    await page.click("button[type=\"submit\"]");
    await page.waitForURL(/\/projects/, { timeout: 15000 });

    console.log("2. 프로젝트 선택");
    await page.click("button:has-text(\"프로젝트 열기\")");
    await page.waitForURL(/\/projects\/[^\/]+$/, { timeout: 15000 });

    console.log("3. 테스트실행 탭으로 이동");
    await page.click("text=테스트실행");
    await page.waitForLoadState("networkidle");

    console.log("4. 테스트 실행 선택");
    await page.click(".MuiCard-root");
    await page.waitForLoadState("networkidle");

    console.log("5. 결과입력 버튼 클릭");
    await page.click("button:has-text(\"결과입력\")");
    await page.waitForSelector("[role=\"dialog\"]", { timeout: 10000 });

    console.log("6. 첨부파일 직접 테스트");
    const fileInput = page.locator("input[type=\"file\"]");
    const testContent = "test,data\n1,success\n2,pass";

    await fileInput.setInputFiles({
      name: "test.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(testContent)
    });

    console.log("파일 선택 완료");

    await page.click("button:has-text(\"업로드\")");
    console.log("업로드 버튼 클릭됨");

    await page.waitForTimeout(5000);
    console.log("테스트 완료");

  } catch (error) {
    console.error("테스트 오류:", error.message);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

simpleAttachmentTest().catch(console.error);
