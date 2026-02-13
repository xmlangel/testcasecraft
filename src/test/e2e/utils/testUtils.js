const path = require('path');
const fs = require('fs');

/**
 * Takes a screenshot for a specific test step and saves it in a structured directory.
 * The directory structure will be: <test_file_dir>/screenshots/<test_file_name>/<step_name>.png
 * @param {import('@playwright/test').Page} page The Playwright page object.
 * @param {import('@playwright/test').TestInfo} testInfo The Playwright test info object, which contains metadata about the test.
 * @param {string} stepName A descriptive name for the screenshot (e.g., '01-initial-page').
 */
async function takeStepScreenshot(page, testInfo, stepName) {
  // Extract the base name of the test file (e.g., 'login.spec')
  const baseName = path.basename(testInfo.file, '.js');
  
  // Create a unique directory for the test's screenshots
  // e.g., .../e2e-tests/regression/screenshots/login.spec/
  const screenshotDir = path.join(path.dirname(testInfo.file), 'screenshots', baseName);

  // Ensure the directory for the test's screenshots exists
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  // Define the full path for the screenshot
  const screenshotPath = path.join(screenshotDir, `${stepName}.png`);
  
  // Take and save the screenshot
  await page.screenshot({ path: screenshotPath });
}

module.exports = { takeStepScreenshot };
