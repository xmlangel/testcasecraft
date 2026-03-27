const { BasePage } = require("./BasePage.js");

class ProjectListPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').TestInfo} testInfo
   */
  constructor(page, testInfo) {
    super(page, testInfo);
    this.projectSelectButton = page.locator(
      '[data-testid="project-selection-nav"]',
    );
    this.projectCards = page.locator('[data-testid^="project-card-"]');
    this.newProjectButton = page.locator('[data-testid="new-project-button"]');
    this.openProjectButtons = page.locator(
      '[data-testid="open-project-button"]',
    );
    this.projectNames = page.locator('[data-testid="project-name"]');
    this.projectCodes = page.locator('[data-testid="project-code"]');

    // Tab selectors
    this.orgTab = page.locator('[data-testid="project-tab-0"]');
    this.independentTab = page.locator('[data-testid="project-tab-1"]');
    this.allTab = page.locator('[data-testid="project-tab-2"]');

    // Form selectors
    this.projectNameInput = page.locator('[data-testid="project-name-input"]');
    this.projectCodeInput = page.locator('[data-testid="project-code-input"]');
    this.projectOrgSelect = page.locator(
      '[data-testid="project-organization-select"]',
    );
    this.projectDescriptionInput = page.locator(
      '[data-testid="project-description-field"] textarea:not([aria-hidden="true"])',
    );
    this.saveButton = page.locator('[data-testid="project-save-button"]');

    // Menu & Delete
    this.moreMenuButton = (name) =>
      page
        .locator(
          `[data-testid^="project-card-"]:has([data-testid="project-name"]:has-text("${name}"))`,
        )
        .locator('[data-testid="project-more-menu-button"]');
    this.deleteMenuItem = page.locator(
      '[data-testid="project-delete-menu-item"]',
    );
    this.deleteConfirmButton = page.locator(
      '[data-testid="project-delete-confirm-button"]',
    );
  }

  async waitForLoad() {
    await this.page.waitForURL("**/projects", { timeout: 15000 });
    // 로딩 중인 경우를 대비해 스피너가 사라질 때까지 대기하거나 카드가 나타날 때까지 대기
    await this.page.waitForSelector(".MuiCircularProgress-root", {
      state: "hidden",
      timeout: 15000,
    });
  }

  async openFirstProject() {
    await this.openProjectButtons.first().click();
  }

  async openProjectByName(name) {
    const card = this.page.locator(
      `[data-testid^="project-card-"]:has([data-testid="project-name"]:has-text("${name}"))`,
    );
    await card.locator('[data-testid="open-project-button"]').click();
  }

  async getProjectCount() {
    return await this.projectCards.count();
  }

  async clickNewProject() {
    await this.newProjectButton.click();
  }

  async selectTab(index) {
    const tab = this.page.locator(`[data-testid="project-tab-${index}"]`);
    await tab.click();
  }

  async clickProjectSelectMenu() {
    await this.projectSelectButton.click();
  }

  async createProject(name, code, organization = "", description = "") {
    await this.clickNewProject();
    await this.projectNameInput.fill(name);
    await this.projectCodeInput.fill(code);

    if (organization) {
      await this.projectOrgSelect.click();
      await this.page.locator("role=option", { hasText: organization }).click();
    }

    if (description) {
      await this.projectDescriptionInput.fill(description);
    }

    await this.saveButton.click();

    // 생성 후 목록에 나타날 때까지 대기
    await this.selectTab(2); // 전체 프로젝트 탭으로 이동
    await this.page.waitForSelector(
      `[data-testid="project-name"]:has-text("${name}")`,
      { timeout: 8000 },
    );
  }

  async deleteProject(name) {
    // "전체 프로젝트" 탭으로 이동하여 검색 용이하게 함
    await this.selectTab(2);

    const menuBtn = this.moreMenuButton(name);
    await menuBtn.click();

    await this.deleteMenuItem.click();
    await this.deleteConfirmButton.click();

    // 삭제 후 목록에서 사라질 때까지 대기
    await this.page.waitForSelector(
      `[data-testid="project-name"]:has-text("${name}")`,
      { state: "detached", timeout: 5000 },
    );
  }

  async isProjectInList(name) {
    return await this.page
      .locator(`[data-testid="project-name"]:has-text("${name}")`)
      .isVisible();
  }
}

module.exports = { ProjectListPage };
