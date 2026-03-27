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
}

module.exports = { BasePage };
