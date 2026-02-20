const { BasePage } = require('./BasePage.js');
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require('../config/credentials.js');

class LoginPage extends BasePage {
    /**
     * @param {import('@playwright/test').Page} page
     * @param {import('@playwright/test').TestInfo} testInfo
     */
    constructor(page, testInfo) {
        super(page, testInfo);
        // Login selectors
        this.usernameInput = page.locator('[data-testid="login-username-input"]');
        this.passwordInput = page.locator('[data-testid="login-password-input"]');
        this.submitButton = page.locator('[data-testid="login-submit-button"]');
        this.loginTitle = page.locator('[data-testid="login-title"]');
        this.errorMessage = page.locator('.MuiAlert-message');
        this.switchToRegisterButton = page.locator('[data-testid="login-switch-to-register-button"]');

        // Register selectors
        this.registerSubmitButton = page.locator('[data-testid="register-submit-button"]');
        this.confirmPasswordInput = page.locator('[data-testid="register-confirm-password-input"]');
        this.nameInput = page.locator('[data-testid="register-name-input"]');
        this.emailInput = page.locator('[data-testid="register-email-input"]');
        this.switchToLoginButton = page.locator('[data-testid="register-switch-to-login-button"]');

        // Header/User selectors
        this.userMenuButton = page.locator('button[aria-label="user menu"]');
        this.logoutMenuItem = page.locator('[data-testid="logout-menu-item"]');
        this.profileMenuItem = page.locator('[data-testid="profile-menu-item"]');
    }

    async goto() {
        await super.goto('/');
    }

    async clearStorage() {
        await this.page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
    }

    async login(username, password) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    async register(userData) {
        const { username, password, confirmPassword, name, email } = userData;
        await this.switchToRegisterButton.click();
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.confirmPasswordInput.fill(confirmPassword || password);
        await this.nameInput.fill(name);
        await this.emailInput.fill(email);
        await this.registerSubmitButton.click();
    }

    async logout() {
        await this.userMenuButton.click();
        await this.logoutMenuItem.waitFor({ state: 'visible' });
        await this.logoutMenuItem.click();
    }

    async getErrorMessage() {
        return await this.errorMessage.textContent();
    }

    async waitForBackend(backendUrl = 'http://localhost:8080') {
        let backendReady = false;
        for (let i = 0; i < 30; i++) {
            try {
                const response = await fetch(`${backendUrl}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD })
                });
                if (response.ok || response.status === 401) {
                    backendReady = true;
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        if (!backendReady) {
            throw new Error('백엔드 서버가 준비되지 않았습니다.');
        }
    }
}

module.exports = { LoginPage };

