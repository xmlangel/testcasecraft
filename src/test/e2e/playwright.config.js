// playwright.config.js
module.exports = {
  testDir: '.',
  testMatch: ['**/*.js'],
  timeout: 20000,
  expect: {
    timeout: 5000,
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
