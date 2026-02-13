const { BasePage } = require('./BasePage.js');

class TestPlanPage extends BasePage {
    /**
     * @param {import('@playwright/test').Page} page
     * @param {import('@playwright/test').TestInfo} testInfo
     */
    constructor(page, testInfo) {
        super(page, testInfo);
        this.testPlanTab = page.locator('[data-testid="tab-testplans"]');
        this.addTestPlanButton = page.locator('[data-testid="testplan-add-button"]');
        
        // Form elements
        this.nameInput = page.locator('[data-testid="testplan-name-input"]');
        this.descriptionInput = page.locator('[data-testid="testplan-description-input"]');
        this.saveButton = page.locator('[data-testid="testplan-save-button"]');
        this.cancelButton = page.locator('[data-testid="testplan-cancel-button"]');
        
        // List elements
        this.testPlanRows = page.locator('[data-testid^="testplan-row-"]');
        this.deleteConfirmButton = page.locator('[data-testid="testplan-delete-confirm-button"]');
    }

    async goToTestPlanTab() {
        await this.testPlanTab.click();
        await this.addTestPlanButton.waitFor({ state: 'visible' });
    }

    async clickAddTestPlan() {
        await this.addTestPlanButton.click();
        await this.nameInput.waitFor({ state: 'visible', timeout: 5000 });
        await this.page.waitForTimeout(500); // Wait for transition
    }

    async selectAllTestCases() {
        // Wait for loading to finish in the tree
        const loader = this.page.locator('.MuiCircularProgress-root');
        if (await loader.isVisible()) {
            await loader.waitFor({ state: 'hidden', timeout: 15000 });
        }
        
        // Try the specific testid first
        const specificCheckbox = this.page.locator('input[data-testid="testcase-check-all-input"]');
        
        try {
            if (await specificCheckbox.isVisible({ timeout: 5000 })) {
                await specificCheckbox.check({ force: true });
            } else {
                throw new Error('Specific checkbox not visible');
            }
        } catch (e) {
            // Fallback: find any checkbox in dialog that's not a tree item
            const allCheckboxes = this.page.locator('role=dialog').locator('input[type="checkbox"]');
            const count = await allCheckboxes.count();
            
            let picked = false;
            for (let i = 0; i < count; i++) {
                const cb = allCheckboxes.nth(i);
                const testid = await cb.getAttribute('data-testid');
                // The select all checkbox usually has no testid or "check-all" in it
                if (!testid || testid === '' || testid.includes('all')) {
                    await cb.check({ force: true });
                    picked = true;
                    break;
                }
            }
            
            if (!picked && count > 0) {
                await allCheckboxes.first().check({ force: true });
            }
        }
        
        // Final verify if possible
        await this.page.waitForTimeout(500);
    }

    async fillTestPlanForm(data) {
        if (data.name) {
            await this.nameInput.waitFor({ state: 'visible' });
            await this.nameInput.fill(data.name);
            await this.nameInput.press('Tab');
            await this.page.waitForTimeout(300);
        }
        if (data.description) {
            await this.descriptionInput.fill(data.description);
            await this.descriptionInput.press('Tab');
            await this.page.waitForTimeout(300);
        }
        
        if (data.testCaseIds && data.testCaseIds.length > 0) {
            for (const id of data.testCaseIds) {
                // TestCaseTree utilizes data-testid="testcase-tree-item-${id}"
                // We might need to handle folder expansion if needed
                const checkbox = this.page.locator(`[data-testid="testcase-checkbox-${id}"]`);
                if (await checkbox.isVisible()) {
                    await checkbox.check();
                }
            }
        }
    }

    async saveTestPlan() {
        await this.saveButton.click();
        // Wait for FORM dialog to disappear
        const formDialog = this.page.locator('[role="dialog"]').filter({ hasText: /테스트 플랜 생성|테스트 플랜 수정|Create Test Plan|Edit Test Plan/ });
        await formDialog.waitFor({ state: 'hidden', timeout: 15000 });
        // Wait for rendering and network to settle
        await this.page.waitForTimeout(1000);
    }

    async deleteTestPlan(planName) {
        // Wait for the row to exist first
        const row = this.page.locator('tr').filter({ has: this.page.locator('td', { hasText: planName }) });
        await row.waitFor({ state: 'visible', timeout: 10000 });
        
        const deleteButton = row.locator('[data-testid^="testplan-delete-button-"]');
        await deleteButton.waitFor({ state: 'visible', timeout: 5000 });
        
        // Ensure no other dialog is blocking
        const anyDialog = this.page.locator('[role="dialog"]');
        if (await anyDialog.isVisible()) {
            await anyDialog.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
        }

        await deleteButton.click({ force: true });
        
        // Wait for confirmation dialog specifically
        const confirmDialog = this.page.locator('[role="dialog"]').filter({ hasText: /정말로 이 테스트 플랜을 삭제하시겠습니까|Are you sure/ });
        await confirmDialog.waitFor({ state: 'visible', timeout: 5000 });
        
        await confirmDialog.locator('[data-testid="testplan-delete-confirm-button"]').click();
        await confirmDialog.waitFor({ state: 'hidden', timeout: 10000 });
    }

    async startExecution(planId) {
        const executeButton = this.page.locator(`[data-testid="testplan-execute-button-${planId}"]`);
        await executeButton.click();
    }

    async openAutomatedLinkDialog(planId) {
        const linkButton = this.page.locator(`[data-testid="testplan-link-button-${planId}"]`);
        await linkButton.click();
        await this.page.locator('[data-testid="automation-search-input"]').waitFor({ state: 'visible' });
    }

    async searchAndLinkAutomation(searchTerm, resultId) {
        await this.page.locator('[data-testid="automation-search-input"]').fill(searchTerm);
        await this.page.locator('[data-testid="automation-search-button"]').click();
        
        const linkButton = this.page.locator(`[data-testid="automation-link-button-${resultId}"]`);
        await linkButton.click();
        // Wait for link status to update
        await this.page.locator(`[data-testid="automation-unlink-button-${resultId}"]`).waitFor({ state: 'visible' });
    }

    async closeAutomationDialog() {
        await this.page.locator('button:has-text("닫기"), button:has-text("Close")').click();
    }

    async goToLastPage() {
        const lastPageButton = this.page.locator('button[aria-label="Go to last page"]');
        if (await lastPageButton.isVisible() && await lastPageButton.isEnabled()) {
            await lastPageButton.click();
            await this.page.waitForTimeout(1000);
        }
    }

    async findPlanAcrossPages(planName) {
        // Start from first page to be sure
        const firstPageButton = this.page.locator('button[aria-label="Go to first page"]');
        if (await firstPageButton.isVisible() && await firstPageButton.isEnabled()) {
            await firstPageButton.click();
            await this.page.waitForTimeout(1000);
        }

        let found = await this.page.getByText(planName).isVisible();
        if (found) return true;

        const nextButton = this.page.locator('button[aria-label="Go to next page"]');
        
        // Loop through pages
        while (!found && await nextButton.isVisible() && await nextButton.isEnabled()) {
            await nextButton.click();
            await this.page.waitForTimeout(1000);
            found = await this.page.getByText(planName).isVisible();
        }
        
        // If still not found, try last page explicitly as a last resort
        if (!found) {
            await this.goToLastPage();
            found = await this.page.getByText(planName).isVisible();
        }

        return found;
    }

    async createNewPlan(name) {
        await this.clickAddTestPlan();
        await this.fillTestPlanForm({ name });
    }

    async addTestCaseToPlan(testCaseName) {
        // Wait for tree to load
        await this.page.waitForTimeout(1000);
        const checkbox = this.page.locator('role=dialog').locator('input[type="checkbox"]').filter({
            has: this.page.locator('xpath=./../../../../..').getByText(testCaseName)
        }).first();
        
        if (await checkbox.isVisible({ timeout: 5000 })) {
            await checkbox.check({ force: true });
        } else {
            // General fallback
            await this.page.locator('role=dialog').getByText(testCaseName).click();
        }
    }

    async savePlan() {
        await this.saveTestPlan();
    }

    async searchPlan(name) {
        await this.goToTestPlanTab();
        const searchInput = this.page.locator('[data-testid="testplan-search-input"]');
        if (await searchInput.isVisible()) {
            await searchInput.fill(name);
            await this.page.keyboard.press('Enter');
            await this.page.waitForTimeout(500);
        }
    }

    async deleteMatchingPlans() {
        const deleteBtn = this.page.locator('[data-testid^="testplan-delete-button-"]').first();
        if (await deleteBtn.isVisible()) {
            await deleteBtn.click();
            await this.deleteConfirmButton.waitFor({ state: 'visible' });
            await this.deleteConfirmButton.click();
            await this.page.waitForTimeout(500);
        }
    }
}

module.exports = { TestPlanPage };
