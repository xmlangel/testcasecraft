# Release Note - v1.0.61

## [1.0.61] - 2026-04-03

### Key Changes

#### 🚀 Enhanced JIRA Integration

- **Automatic JIRA Issue URL Parsing**: Introduced `JiraKeyUtils` to automatically extract issue keys from pasted JIRA URLs or inputs, simplifying the linking process.
- **Support for Multiple Issue Keys & UI Improvements**: Improved the ability to search and link multiple JIRA issues simultaneously, with enhanced status and priority parsing for accurate data display.
- **Search State Synchronization**: Synchronized search query states between higher-level components and the linker, providing a smoother user experience.

#### 📊 Dashboard & Test Statistics Improvements

- **Execution-Based View & Comparative Pie Charts**: Added execution-specific data visualization with pie charts to the test result dashboard, enabling intuitive progress comparisons between different test runs.
- **Accurate Statistics Calculation**: Refined the summary logic by calculating status counts directly from `testCaseIds` instead of duplicated results, resolving inflated or mismatched statistics.
- **Centralized Logic in `testResultConstants.js`**: Consolidated test execution summary and progress calculations for better maintainability and consistency.

#### ✨ Management Tools & UI Refinement

- **TestCase Version History UI Updates**: Improved the UI details and localization of version history pages, enhancing overall readability and usability for global users.
- **Improved Attachment Download Handling**: Added better error handling and logging for attachment downloads to ensure system stability.
