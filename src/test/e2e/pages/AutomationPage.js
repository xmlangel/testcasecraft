const { BasePage } = require('./BasePage');

/**
 * Page Object Model for Automation (JUnit Results) page
 */
class AutomationPage extends BasePage {
    constructor(page, testInfo) {
        super(page, testInfo);
        
        // Dashboard
        this.refreshButton = page.locator('[data-testid="automation-refresh-button"]');
        this.uploadButton = page.locator('[data-testid="automation-upload-button"]');
        this.resultRow = page.locator('[data-testid="automation-result-row"]');
        this.viewButton = page.locator('[data-testid="automation-view-button"]');
        this.deleteButton = page.locator('[data-testid="automation-delete-button"]');
        this.fileLink = page.locator('[data-testid="automation-file-link"]');
        
        // Upload Dialog
        this.fileInput = page.locator('[data-testid="automation-upload-file-input"]');
        this.uploadNameInput = page.locator('[data-testid="automation-upload-name-input"]');
        this.uploadDescriptionInput = page.locator('[data-testid="automation-upload-description-input"]');
        this.submitUploadButton = page.locator('[data-testid="automation-upload-submit-button"]');
        
        // Detail Page
        this.backButton = page.locator('[data-testid="automation-detail-back-button"]');
        this.exportPdfButton = page.locator('[data-testid="automation-export-pdf-button"]');
        this.exportCsvButton = page.locator('[data-testid="automation-export-csv-button"]');
        this.detailRefreshButton = page.locator('[data-testid="automation-detail-refresh-button"]');
        this.caseRow = page.locator('[data-testid="automation-case-row"]');
        this.caseName = page.locator('[data-testid="automation-case-name"]');
        this.noteHeader = page.locator('thead th').filter({ hasText: '노트' });
        this.noteCell = page.locator('[data-testid="automation-case-note-cell"]');
        this.editCaseButton = page.locator('[data-testid="automation-edit-case-button"]');
        
        // Case Editor Dialog
        this.editTitleInput = page.locator('[data-testid="automation-case-title-input"]');
        this.editDescriptionInput = page.locator('[data-testid="automation-case-description-input"]');
        this.editStatusSelect = page.locator('[data-testid="automation-case-status-select"]');
        this.editPrioritySelect = page.locator('[data-testid="automation-case-priority-select"]');
        this.editTagsInput = page.locator('[data-testid="automation-case-tags-input"]');
        this.editNotesInputWrapper = page.locator('[data-testid="automation-case-notes-input"]');
        this.editNotesTextarea = this.editNotesInputWrapper.locator('textarea, input').first();
        this.saveCaseButton = page.locator('[data-testid="automation-case-save-button"]');
        this.cancelCaseButton = page.locator('[data-testid="automation-case-cancel-button"]');
    }

    /**
     * Navigate to the automation tab of a project
     * @param {string} projectId 
     */
    async navigateToProjectAutomation(projectId) {
        await this.page.goto(`/projects/${projectId}`);
        // Click on the automation tab (index 5)
        const automationTab = this.page.locator('.MuiTabs-root button').nth(5);
        await automationTab.click();
    }

    /**
     * Upload an XML result file
     * @param {string} filePath 
     * @param {string} name 
     * @param {string} description 
     */
    async uploadResult(filePath, name, description = '') {
        await this.uploadButton.click();
        await this.fileInput.setInputFiles(filePath);
        if (name) {
            await this.uploadNameInput.fill(name);
        }
        if (description) {
            await this.uploadDescriptionInput.fill(description);
        }
        await this.submitUploadButton.click();
        // Wait for upload to complete (processing dialog might appear)
        await this.page.waitForSelector('[data-testid="automation-upload-submit-button"]', { state: 'detached' });
    }

    /**
     * View a specific result by clicking its view button
     * @param {number} index - 0-based index of the result row
     */
    async viewResultByIndex(index = 0) {
        await this.viewButton.nth(index).click();
    }

    /**
     * View a specific result by clicking its file name
     * @param {string} fileName 
     */
    async viewResultByName(fileName) {
        const link = this.page.locator(`[data-testid="automation-file-link"]:has-text("${fileName}")`);
        await link.click();
    }

    /**
     * Edit a test case in the detail view
     * @param {number} index - 0-based index of the case row
     * @param {Object} data - fields to update
     */
    async editTestCaseByIndex(index = 0, data) {
        await this.editCaseButton.nth(index).click();
        
        if (data.title) await this.editTitleInput.fill(data.title);
        if (data.description) await this.editDescriptionInput.fill(data.description);
        if (data.notes) await this.editNotesTextarea.fill(data.notes);
        if (data.tags) await this.editTagsInput.fill(data.tags);
        
        if (data.status) {
            await this.editStatusSelect.click();
            await this.page.locator(`[data-testid="automation-case-status-option-${data.status.toUpperCase()}"]`).click();
        }
        
        if (data.priority) {
            await this.editPrioritySelect.click();
            await this.page.locator(`[data-testid="automation-case-priority-option-${data.priority.toUpperCase()}"]`).click();
        }
        
        await this.saveCaseButton.click();
    }
}

module.exports = AutomationPage;
