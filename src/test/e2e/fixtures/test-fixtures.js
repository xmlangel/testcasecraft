const { test: base, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage.js');
const { TestCasePage } = require('../pages/TestCasePage.js');
const { ProjectListPage } = require('../pages/ProjectListPage.js');
const { TestExecutionPage } = require('../pages/TestExecutionPage.js');
const { TestPlanPage } = require('../pages/TestPlanPage.js');

const test = base.extend({
    loginPage: async ({ page }, use, testInfo) => {
        await use(new LoginPage(page, testInfo));
    },
    testCasePage: async ({ page }, use, testInfo) => {
        await use(new TestCasePage(page, testInfo));
    },
    projectListPage: async ({ page }, use, testInfo) => {
        await use(new ProjectListPage(page, testInfo));
    },
    testExecutionPage: async ({ page }, use, testInfo) => {
        await use(new TestExecutionPage(page, testInfo));
    },
    testPlanPage: async ({ page }, use, testInfo) => {
        await use(new TestPlanPage(page, testInfo));
    }
});

module.exports = { test, expect };
