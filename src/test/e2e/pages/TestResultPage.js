const { BasePage } = require("./BasePage.js");

class TestResultPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').TestInfo} testInfo
   */
  constructor(page, testInfo) {
    super(page, testInfo);

    // Navigation
    this.prevButton = page.locator('[data-testid="result-prev-button"]');
    this.nextButton = page.locator('[data-testid="result-next-button"]');
    this.indexText = page.locator('[data-testid="result-index-text"]');

    // Result selection
    this.passButton = page.locator(
      '[data-testid="result-selector-button-PASS"]',
    );
    this.failButton = page.locator(
      '[data-testid="result-selector-button-FAIL"]',
    );
    this.blockedButton = page.locator(
      '[data-testid="result-selector-button-BLOCKED"]',
    );
    this.notRunButton = page.locator(
      '[data-testid="result-selector-button-NOTRUN"]',
    );

    // Inputs
    this.notesInput = page.locator('[data-testid="result-notes-input"]');
    this.tagsInput = page.locator('[data-testid="result-tags-input"]');
    this.jiraInput = page.locator('[data-testid="result-jira-input"]');

    // File Upload
    this.fileInput = page.locator('[data-testid="result-file-input"]');
    this.uploadButton = page.locator('[data-testid="result-upload-button"]');

    // Actions
    this.saveButton = page.locator('[data-testid="result-save-button"]');
    this.cancelButton = page.locator('[data-testid="result-cancel-button"]');
    this.jiraCommentButton = page.locator('[data-testid="result-jira-button"]');
  }

  async selectResult(status) {
    const selector = this.page.locator(
      `[data-testid="result-selector-button-${status.toUpperCase()}"]`,
    );
    await selector.click();
  }

  async enterNotes(notes) {
    await this.notesInput.click();
    await this.page.keyboard.type(notes);
  }

  async enterTags(tags) {
    if (Array.isArray(tags)) {
      for (const tag of tags) {
        await this.tagsInput.fill(tag);
        await this.page.keyboard.press("Enter");
      }
    } else {
      await this.tagsInput.fill(tags);
      await this.page.keyboard.press("Enter");
    }
  }

  async enterJiraKey(key) {
    await this.jiraInput.fill(key);
  }

  async uploadFile(filePath) {
    await this.fileInput.setInputFiles(filePath);
  }

  async save() {
    await this.saveButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async goToNext() {
    await this.nextButton.click();
  }

  async goToPrevious() {
    await this.prevButton.click();
  }
}

module.exports = { TestResultPage };
