const { BasePage } = require('./BasePage.js');

class TestCasePage extends BasePage {
    /**
     * @param {import('@playwright/test').Page} page
     * @param {import('@playwright/test').TestInfo} testInfo
     */
    constructor(page, testInfo) {
        super(page, testInfo);
        this.testCaseTab = page.locator('[data-testid="tab-testcases"]');
        this.modeExpandButton = page.locator('[data-testid="input-mode-expand-button"]');
        this.individualFormButton = page.locator('[data-testid="mode-individual-button"]');
        this.spreadsheetButton = page.locator('[data-testid="mode-spreadsheet-button"]');
        
        // Form sections
        this.basicInfoAccordion = page.locator('[data-testid="accordion-basic-info"]');
        this.stepsAccordion = page.locator('[data-testid="accordion-steps"]');
        this.expectedResultsAccordion = page.locator('[data-testid="accordion-expected-results"]');

        // Form elements
        this.createFormTitle = page.locator('h6:has-text("테스트케이스"), h6:has-text("Test Case")');
        this.nameInput = page.locator('[data-testid="testcase-name-input"]');
        this.descInput = page.locator('[data-testid="testcase-description-input"]');
        this.preconditionInput = page.locator('[data-testid="testcase-precondition-input"]');
        this.overallExpectedInput = page.locator('[data-testid="testcase-overall-expected-input"]');
        this.addStepButton = page.locator('[data-testid="add-step-button"]');
        this.saveButton = page.locator('[data-testid="testcase-save-button"]');
        this.cancelButton = page.locator('[data-testid="testcase-cancel-button"]');
        
        // Spreadsheet elements
        this.addRowButton = page.locator('button:has-text("행 추가"), button:has-text("Add Row")');
        this.bulkSaveButton = page.locator('button:has-text("일괄 저장")');
        this.spreadsheetHeader = page.locator('th:has-text("이름")');
        this.editor = page.locator('.Spreadsheet__data-editor');
    }

    async goToTestCaseTab() {
        await this.testCaseTab.click();
        await this.page.waitForURL(/.*\/testcases/);
    }

    async selectIndividualFormMode() {
        if (await this.modeExpandButton.isVisible()) {
            const isExpanded = await this.modeExpandButton.getAttribute('aria-expanded');
            if (isExpanded !== 'true') {
                await this.modeExpandButton.click();
            }
        }
        await this.individualFormButton.click();
        
        const currentUrl = this.page.url();
        if (!currentUrl.endsWith('/new')) {
            await this.page.goto(currentUrl + '/new');
        }
        // Wait for some form element to be visible
        await this.nameInput.waitFor({ state: 'visible', timeout: 15000 });
    }

    async selectSpreadsheetMode() {
        if (await this.modeExpandButton.isVisible()) {
            const isExpanded = await this.modeExpandButton.getAttribute('aria-expanded');
            if (isExpanded !== 'true') {
                await this.modeExpandButton.click();
            }
        }
        await this.spreadsheetButton.click();
        await this.spreadsheetHeader.waitFor({ state: 'visible' });
    }

    async fillIndividualForm(data) {
        // Expand outer "Basic Info" accordion if needed
        if (await this.basicInfoAccordion.isVisible()) {
             const isExpanded = await this.basicInfoAccordion.getAttribute('aria-expanded');
             if (isExpanded !== 'true') {
                await this.basicInfoAccordion.click();
                await this.page.waitForTimeout(500);
             }
        }

        // The "TestCaseBasicInfo" component also has an accordion inside it.
        const innerBasicAccordion = this.page.locator('h6:has-text("테스트케이스 정보"), h6:has-text("Test Case Info")').locator('xpath=./../..');
        if (await innerBasicAccordion.isVisible()) {
            const isExpanded = await innerBasicAccordion.getAttribute('aria-expanded');
            if (isExpanded !== 'true') {
                await innerBasicAccordion.click();
                await this.page.waitForTimeout(500);
            }
        }

        if (data.name) {
            await this.nameInput.waitFor({ state: 'visible' });
            // Type instead of fill to trigger more events, or fill and then blur
            await this.nameInput.fill(data.name);
            await this.nameInput.press('Tab'); // Trigger blur/change
            await this.page.waitForTimeout(500);

            // Verify if fill stuck, if not try again
            let val = await this.nameInput.inputValue();
            if (val !== data.name) {
                await this.nameInput.fill(data.name);
                await this.page.keyboard.press('Enter');
                await this.page.waitForTimeout(500);
            }
        }
        
        if (data.description) {
            const descEditor = this.page.locator('[data-testid="testcase-description-input"] textarea').nth(0);
            if (await descEditor.isVisible()) {
                await descEditor.fill(data.description);
                await descEditor.press('Tab');
            } else {
                await this.descInput.fill(data.description);
                await this.descInput.press('Tab');
            }
            await this.page.waitForTimeout(300);
        }

        if (data.precondition) {
            const preEditor = this.page.locator('[data-testid="testcase-precondition-input"] textarea').nth(0);
            if (await preEditor.isVisible()) {
                await preEditor.fill(data.precondition);
                await preEditor.press('Tab');
            } else {
                await this.preconditionInput.fill(data.precondition);
                await this.preconditionInput.press('Tab');
            }
            await this.page.waitForTimeout(300);
        }

        if (data.steps) {
            if (await this.stepsAccordion.isVisible()) {
                const isExpanded = await this.stepsAccordion.getAttribute('aria-expanded');
                if (isExpanded !== 'true') {
                    await this.stepsAccordion.click();
                    await this.page.waitForTimeout(500);
                }
            }
            
            for (let i = 0; i < data.steps.length; i++) {
                await this.addStepButton.click();
                await this.page.waitForTimeout(300);
                const stepDesc = this.page.locator(`[data-testid="step-description-${i + 1}"]`);
                const stepExpected = this.page.locator(`[data-testid="step-expected-${i + 1}"]`);
                
                await stepDesc.waitFor({ state: 'visible' });
                await stepDesc.fill(data.steps[i].desc);
                await stepDesc.press('Tab');
                await stepExpected.fill(data.steps[i].expected);
                await stepExpected.press('Tab');
            }
        }
        
        if (data.overallExpected) {
            if (await this.expectedResultsAccordion.isVisible()) {
                const isExpanded = await this.expectedResultsAccordion.getAttribute('aria-expanded');
                if (isExpanded !== 'true') {
                    await this.expectedResultsAccordion.click();
                    await this.page.waitForTimeout(500);
                }
            }
            const overallEditor = this.page.locator('[data-testid="testcase-overall-expected-input"] textarea').nth(0);
            if (await overallEditor.isVisible()) {
                await overallEditor.fill(data.overallExpected);
                await overallEditor.press('Tab');
            } else {
                await this.overallExpectedInput.fill(data.overallExpected);
                await this.overallExpectedInput.press('Tab');
            }
        }
        
        // Ensure name is still there one last time
        if (data.name) {
            const currentName = await this.nameInput.inputValue();
            if (currentName !== data.name) {
                await this.nameInput.fill(data.name);
                await this.nameInput.press('Tab');
                await this.page.waitForTimeout(500);
            }
        }

        // Wait for save button to be enabled
        await this.page.waitForFunction((dataTestId) => {
            const btn = document.querySelector(`[data-testid="${dataTestId}"]`);
            return btn && !btn.disabled;
        }, 'testcase-save-button', { timeout: 10000 }).catch(() => {
            console.log('Warning: Save button still disabled after filling form');
        });
    }

    async saveForm() {
        // Retry click if button is disabled
        if (await this.saveButton.isDisabled()) {
            console.log('Save button disabled, re-filling name as last resort');
            const name = await this.nameInput.inputValue();
            await this.nameInput.fill('');
            await this.nameInput.fill(name);
            await this.page.waitForTimeout(500);
        }
        await this.saveButton.click();
        await this.page.waitForURL(/\/projects\/[a-f0-9-]+\/testcases/, { timeout: 30000 });
    }

    async addSpreadsheetRow() {
        await this.addRowButton.first().click();
        await this.page.waitForTimeout(1000);
    }

    async fillSpreadsheetCell(rowIdx, colIdx, value) {
        const rows = this.page.locator('table tr');
        const count = await rows.count();
        // Use nth(count-1) if rowIdx is -1 (last row)
        const targetRowIdx = rowIdx === -1 ? count - 1 : rowIdx;
        const targetRow = rows.nth(targetRowIdx);
        const cell = targetRow.locator('td').nth(colIdx);
        
        await cell.dblclick({ force: true });
        await this.editor.waitFor({ state: 'visible' });
        await this.editor.fill(value);
        await this.page.keyboard.press('Enter');
    }

    async bulkSave() {
        await this.bulkSaveButton.click();
    }

    async createNewTestCase(name) {
        await this.goToTestCaseTab();
        await this.selectIndividualFormMode();
        await this.fillIndividualForm({ name });
        await this.saveForm();
    }

    async deleteTestCase(name) {
        await this.goToTestCaseTab();
        const searchInput = this.page.locator('[data-testid="testcase-search-input"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill(name);
            await this.page.keyboard.press('Enter');
            await this.page.waitForTimeout(500);
        }
        
        const deleteBtn = this.page.locator(`[data-testid^="testcase-delete-button-"]`).first();
        if (await deleteBtn.isVisible()) {
            await deleteBtn.click();
            await this.page.locator('[data-testid="testcase-delete-confirm-button"]').click();
            await this.page.waitForTimeout(500);
        }
    }
}

module.exports = { TestCasePage };

