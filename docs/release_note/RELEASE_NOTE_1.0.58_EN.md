# Release Note - v1.0.58

## [1.0.58] - 2026-03-31

### Main Changes

#### 🎨 UI/UX Enhancements

- **Refactored Test Result Header**: Implemented a sticky layout to keep key information visible while scrolling, enhanced status statistics visualization, and added detailed navigation controls for better usability.
- **Enhanced Floating Menu**: Modernized the floating menu UI on the test result details page and improved the execution context passing logic to the test edit form for a seamless workflow.
- **Updated Execution History Styles**: Improved the readability of the history table and aligned the overall component design with the system theme, including dark mode support.

#### ✨ New Features

- **Linked Test Case Execution History**: Added an 'Execution History' tab within each test case details page, allowing users to view the past execution records of that specific test case at a glance.
- **Direct Navigation to Execution Results**: Implemented a feature to navigate directly to the corresponding test result details page from the history list.

#### 🛠️ Optimizations

- **Authentication & API Client Integration**: Replaced the previous native fetch logic in the `TestCaseExecutionHistory` component with an authenticated shared API client to enhance the security and stability of data requests.
