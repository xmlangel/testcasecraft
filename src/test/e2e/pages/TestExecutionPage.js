const { BasePage } = require('./BasePage.js');

class TestExecutionPage extends BasePage {
    /**
     * @param {import('@playwright/test').Page} page
     * @param {import('@playwright/test').TestInfo} testInfo
     */
    constructor(page, testInfo) {
        super(page, testInfo);
        this.executionTab = page.locator('[data-testid="tab-executions"]');
        this.newExecutionButton = page.locator('[data-testid="execution-add-button"]');
        
        // Form elements
        this.executionNameInput = page.locator('[data-testid="execution-name-input"]');
        this.testPlanSelect = page.locator('[data-testid="execution-plan-select"]');
        this.saveButton = page.locator('[data-testid="execution-save-button"]');
        this.startImmediatelyCheckbox = page.locator('[data-testid="execution-start-immediately-checkbox"]');
        
        // List elements
        this.searchInput = page.locator('[data-testid="execution-search-input"]');
        this.searchButton = page.locator('[data-testid="execution-search-button"]');
        this.deleteButton = page.locator('[data-testid^="execution-delete-button-"]');
        this.confirmDeleteButton = page.locator('[data-testid="execution-delete-confirm-button"]');
        
        // Execution controls
        this.startExecutionButton = page.locator('[data-testid="execution-start-button"]');
        this.completeExecutionButton = page.locator('[data-testid="execution-complete-button"]');
        this.restartExecutionButton = page.locator('[data-testid="execution-restart-button"]');
        
        // Result Entry
        this.resultInputButton = page.locator('[data-testid^="execution-table-result-button-"]');
        this.resultSaveButton = page.locator('[data-testid="result-save-button"]');
        this.resultCancelButton = page.locator('[data-testid="result-cancel-button"]');
        this.resultNotesInput = page.locator('[data-testid="result-notes-input"]');
        this.resultTagsInput = page.locator('[data-testid="result-tags-input"]');
        this.resultJiraInput = page.locator('[data-testid="result-jira-input"]');
        
        // Header actions
        this.goToListButton = page.locator('[data-testid="execution-list-button"]');
        
        // Pagination
        this.listPagination = page.locator('[data-testid="execution-list-pagination"]');
        this.tablePagination = page.locator('[data-testid="execution-table-pagination"]');
    }

    async goBackToList() {
        if (await this.goToListButton.isVisible()) {
            await this.goToListButton.click();
            await this.executionTab.waitFor({ state: 'visible' });
        }
    }

    async goToExecutionTab() {
        await this.executionTab.click();
        await this.page.waitForTimeout(500); // Wait for tab transition
    }

    async createNewExecution(name, planNameOrId, startImmediately = false) {
        await this.newExecutionButton.click();
        await this.executionNameInput.waitFor({ state: 'visible' });
        await this.executionNameInput.fill(name);
        
        if (planNameOrId) {
            await this.testPlanSelect.click();
            // Try to find by testid first, then by text
            const optionById = this.page.locator(`[data-testid="execution-plan-option-${planNameOrId}"]`);
            if (await optionById.isVisible({ timeout: 2000 })) {
                await optionById.click();
            } else {
                await this.page.locator(`role=option >> text="${planNameOrId}"`).click();
            }
        } else {
            // Select the first plan if not specified
            await this.testPlanSelect.click();
            const option = this.page.locator('[data-testid^="execution-plan-option-"]').nth(1);
            await option.click();
        }

        if (startImmediately) {
            const isChecked = await this.startImmediatelyCheckbox.isChecked();
            if (!isChecked) {
                await this.startImmediatelyCheckbox.check();
            }
        }
        
        await this.saveButton.click();
        
        if (startImmediately) {
            // Wait for navigation to detail page
            await this.page.waitForURL(/\/executions\/[a-f0-9-]+/, { timeout: 15000 });
        } else {
            await this.saveButton.waitFor({ state: 'hidden' });
        }
    }

    async searchExecution(name) {
        await this.searchInput.fill(name);
        await this.searchButton.click();
        await this.page.waitForTimeout(500);
    }

    async deleteMatchingExecutions() {
        // Wait for search results to load
        await this.page.waitForTimeout(1000);
        
        let firstDelete = this.deleteButton.first();
        while (await firstDelete.isVisible()) {
            await firstDelete.click();
            await this.confirmDeleteButton.waitFor({ state: 'visible' });
            await this.confirmDeleteButton.click();
            await this.confirmDeleteButton.waitFor({ state: 'hidden' });
            
            // Give it a moment to refresh the list
            await this.page.waitForTimeout(500);
            
            // If the item we just deleted was the last on the page, 
            // but there are more on the next page, we might need to click next or it might auto-populate.
            // Check if page 1 is empty but pagination exists.
            if (!(await firstDelete.isVisible())) {
                const nextBtn = this.page.locator('[data-testid="execution-list-pagination"] button[aria-label="Go to next page"]');
                if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
                    await nextBtn.click();
                    await this.page.waitForTimeout(1000);
                }
            }
        }
    }

    async findExecutionAcrossPages(name) {
        let item = this.page.locator(`[data-testid^="execution-item-"]:has-text("${name}")`).first();
        let found = await item.isVisible();
        
        while (!found) {
            const nextBtn = this.listPagination.locator('button[aria-label="Go to next page"]');
            if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
                await nextBtn.click();
                await this.page.waitForTimeout(1000);
                found = await item.isVisible();
            } else {
                break;
            }
        }
        return found;
    }

    async openExecution(name) {
        const found = await this.findExecutionAcrossPages(name);
        if (!found) {
            throw new Error(`Execution "${name}" not found across pages.`);
        }
        const item = this.page.locator(`[data-testid^="execution-item-"]:has-text("${name}")`).first();
        await item.click();
        await this.page.waitForTimeout(500);
    }

    async findTestCaseInTableAcrossPages(testCaseId) {
        const btn = this.page.locator(`[data-testid="execution-table-result-button-${testCaseId}"]`);
        let found = await btn.isVisible();
        
        // Also check if there's pagination at all
        if (!(await this.tablePagination.isVisible())) return found;

        let currentPage = 1;
        const maxPages = 20; // Safety limit
        
        while (!found && currentPage < maxPages) {
            const nextBtn = this.tablePagination.locator('button[aria-label="Go to next page"]');
            if (await nextBtn.isVisible() && await nextBtn.isEnabled()) {
                await nextBtn.click();
                await this.page.waitForTimeout(1000);
                found = await btn.isVisible();
                currentPage++;
            } else {
                break;
            }
        }
        return found;
    }

    async startExecution() {
        await this.startExecutionButton.click();
        // Wait for result entry to be possible - Complete button appearing is a good signal
        await this.completeExecutionButton.waitFor({ state: 'visible', timeout: 15000 });
        // Give a tiny bit more for state propagation
        await this.page.waitForTimeout(1000);
    }

    async completeExecution() {
        await this.completeExecutionButton.click();
    }

    async openResultInputDialog(testCaseId) {
        let btn;
        if (testCaseId) {
            const found = await this.findTestCaseInTableAcrossPages(testCaseId);
            if (!found) {
                throw new Error(`Test Case ${testCaseId} not found in execution table (checked across pages).`);
            }
            btn = this.page.locator(`[data-testid="execution-table-result-button-${testCaseId}"]`);
        } else {
            btn = this.resultInputButton.first();
        }
        
        // Explicitly wait for the button to be enabled with polling.
        // Some state changes in React might take a moment to propagate to all components.
        await btn.waitFor({ state: 'visible', timeout: 10000 });
        
        let isEnabled = false;
        for (let i = 0; i < 20; i++) {
            isEnabled = await btn.isEnabled();
            if (isEnabled) break;
            
            // If not enabled, check if we need to click Start again or wait
            if (i % 5 === 0) {
                console.log(`Waiting for Result button to be enabled (attempt ${i})...`);
            }
            await this.page.waitForTimeout(500);
        }

        if (!isEnabled) {
            throw new Error('Test Execution "Result Input" button remained disabled even after 10s wait. Check if execution status is "INPROGRESS".');
        }

        await btn.click({ force: true });
        // Wait for dialog animation
        await this.page.waitForTimeout(1000);
    }

    async closeResultInputDialog() {
        if (await this.resultCancelButton.isVisible()) {
            await this.resultCancelButton.click();
            await this.resultCancelButton.waitFor({ state: 'hidden' });
        }
    }

    async enterResult(testCaseId, result, notes) {
        const found = await this.findTestCaseInTableAcrossPages(testCaseId);
        if (!found) {
            throw new Error(`Test Case ${testCaseId} not found to enter result.`);
        }
        const resultBtn = this.page.locator(`[data-testid="execution-table-result-button-${testCaseId}"]`);
        await resultBtn.click();
        
        await this.page.locator(`[data-testid="result-selector-button-${result}"]`).click();
        
        if (notes) {
            await this.resultNotesInput.fill(notes);
        }
        
        await this.resultSaveButton.click();
        await this.resultSaveButton.waitFor({ state: 'hidden' });
    }
}

module.exports = { TestExecutionPage };

