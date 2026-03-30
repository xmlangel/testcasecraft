const { takeStepScreenshot } = require("../utils/testUtils.js");

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').TestInfo} testInfo
   */
  constructor(page, testInfo) {
    this.page = page;
    this.testInfo = testInfo;
  }

  /**
   * 스크린샷 캡처 유틸리티
   * @param {string} name 스크린샷 파일명
   */
  async screen(name) {
    if (this.testInfo) {
      await takeStepScreenshot(this.page, this.testInfo, name);
    }
  }

  /**
   * URL 이동 및 로딩 대기
   * @param {string} url
   */
  async goto(url) {
    await this.page.goto(url);
  }

  /**
   * 네트워크 유휴 상태 대기
   */
  async waitForIdle() {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * 세션 만료 팝업 처리 로직 (회귀 테스트 공통 사용)
   */
  async handleSessionPopup() {
    const sessionExpiredDialog = this.page.locator(
      'div[role="dialog"]:has-text("세션 만료")',
    );
    const loginRedirectButton = this.page.locator(
      'button:has-text("로그인 페이지로 이동")',
    );

    let popupAttempts = 0;
    while (
      (await sessionExpiredDialog
        .isVisible({ timeout: 2000 })
        .catch(() => false)) &&
      popupAttempts < 3
    ) {
      console.log(
        "⚠️ 세션 만료 팝업 감지됨! '로그인 페이지로 이동' 버튼을 클릭합니다.",
      );
      await loginRedirectButton.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(1500);
      popupAttempts++;
    }

    // 팝업이 사라질 때까지 명시적 대기
    if (await sessionExpiredDialog.isVisible().catch(() => false)) {
      await sessionExpiredDialog
        .waitFor({ state: "hidden", timeout: 5000 })
        .catch(() => {});
    }
  }

  /**
   * 통합된 로그인 및 네비게이션 로직 (verify-testplan-execution-list에서 성공한 로직 기반)
   * @param {object} options
   * @param {string} options.username
   * @param {string} options.password
   * @param {object} options.loginPage LoginPage 인스턴스
   * @param {object} options.projectListPage ProjectListPage 인스턴스
   */
  async performLoginAndNavigate({
    username,
    password,
    loginPage,
    projectListPage,
  }) {
    console.log("📍 네비게이션 시작...");

    let loginPageReached = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!loginPageReached && attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 페이지 진입 시도 ${attempts}/${maxAttempts}...`);

      try {
        await loginPage.goto();
        await this.page.waitForLoadState("load", { timeout: 10000 });
      } catch (e) {
        console.log("⚠️ goto() 중 오류 발생:", e.message);
      }

      // 스플래시 화면 체크 및 대기
      const splash = this.page.locator("#splash-screen");
      try {
        if (await splash.isVisible({ timeout: 3000 })) {
          console.log("🌊 스플래시 화면 대기 중...");
          await splash.waitFor({ state: "hidden", timeout: 20000 });
        }
      } catch (e) {}

      // 세션 만료 팝업 체크 및 처리
      await this.handleSessionPopup();

      // 로그인 페이지 도달 확인
      if (
        await loginPage.usernameInput
          .isVisible({ timeout: 5000 })
          .catch(() => false)
      ) {
        console.log("✅ 로그인 페이지 도달 성공");
        loginPageReached = true;
        break;
      } else {
        console.log("📂 로그인 페이지가 아닙니다. 현재 URL:", this.page.url());
        if (this.page.url().includes("/projects")) {
          await this.handleSessionPopup();
          if (this.page.url().includes("/projects")) {
            console.log("📂 이미 프로젝트 목록 페이지에 있습니다.");
            loginPageReached = true;
            break;
          }
        }
      }
      await this.page.waitForTimeout(1000);
    }

    // 최종 로그인 수행
    try {
      if (
        await loginPage.usernameInput
          .isVisible({ timeout: 5000 })
          .catch(() => false)
      ) {
        console.log("🔐 로그인을 수행합니다.");
        await loginPage.login(username, password);
        await this.page.waitForTimeout(1000);
        await this.handleSessionPopup();
        await this.page.waitForLoadState("networkidle").catch(() => {});
      } else {
        console.log(
          "ℹ️ 로그인 폼이 보이지 않아 입력을 건너뜁니다. 현재 URL:",
          this.page.url(),
        );
        await this.handleSessionPopup();
      }
    } catch (e) {
      console.log("⚠️ 로그인 시도 중 예외 발생:", e.message);
    }

    // 프로젝트 목록 페이지 도착 확인
    try {
      console.log("⏳ 프로젝트 목록 페이지 대기 중...");
      await projectListPage.waitForLoad();
      console.log("✅ 프로젝트 목록 페이지 확인");
    } catch (e) {
      console.log(`❌ 목록 페이지 도달 대기 실패: ${e.message}`);
      await this.handleSessionPopup();

      if (!this.page.url().includes("/projects")) {
        console.log("🔄 경로 복구를 위해 메인으로 이동합니다.");
        try {
          await loginPage.goto().catch(() => {});
          await this.handleSessionPopup();

          if (
            await loginPage.usernameInput
              .isVisible({ timeout: 5000 })
              .catch(() => false)
          ) {
            await loginPage.login(username, password);
            await this.handleSessionPopup();
          }
          await projectListPage.waitForLoad().catch(() => {});
        } catch (err) {
          console.log("❌ 경로 복구 실패:", err.message);
        }
      }
    }

    // 최종 확인 후 프로젝트 오픈
    console.log("🖱️ 프로젝트 오픈 시도...");
    try {
      await projectListPage.openFirstProject();
      await this.page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 });
      console.log("🚀 프로젝트 페이지 진입 성공");
    } catch (e) {
      console.log("❌ 프로젝트 오픈 실패:", e.message);
      await this.handleSessionPopup();
      await projectListPage.openFirstProject();
      await this.page.waitForURL(/\/projects\/[a-f0-9-]+/, { timeout: 30000 });
    }
  }
}

module.exports = { BasePage };
