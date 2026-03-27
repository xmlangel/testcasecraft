# Release Notes - v1.0.28

## 🚀 Key Changes

### 🔐 Authentication & Security

- **[feat] Session Expiry Dialog**: Introduced a dedicated dialog to inform users of the reason for session expiration instead of abrupt logouts.
- **Auth Context Update**: Optimized session management logic and improved internal state handling in the Auth Context.

### 🛠 Refactoring & Stability

- **Logging Standardization**: Replaced `console.log` with a custom `debugLog` to control log visibility in production and improve debugging efficiency.
- **UI Responsiveness**: Enhanced the test case save operation to return the full object and refined the input form header UI.

### 🐛 Bug Fixes ([fix])

- **Test Case Tree Focus Improvements**: Enhanced the logic for moving focus within the tree after test case deletion to improve user convenience.
