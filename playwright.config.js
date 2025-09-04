// playwright.config.js
module.exports = {
  testDir: './e2e-tests',
  testMatch: ['**/*.js'],
  timeout: 30000,
  expect: {
    timeout: 2000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  // webServer: {
  //   command: 'npm start',
  //   cwd: './src/main/frontend',
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
};
