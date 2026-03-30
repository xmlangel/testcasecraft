# Release Note - v1.0.56

## [1.0.56] - 2026-03-30

### Key Changes

#### 🛠️ Bug Fixes & Stability

- **Frontend ReferenceError Fix**:
  - Resolved a runtime error in `App.jsx` where the global variable `SHOW_EXPLORATORY_SESSION_TAB` was undefined.
  - Corrected the code to consistently use the `showExploratorySessionTab` state variable provided by the Runtime Configuration, improving application stability.

#### 🚀 Infrastructure & Build

- **Application Version Increment**:
  - Unified the entire system version from `1.0.55` to `1.0.56`.
  - Synchronized version information across key configuration files including `build.gradle`, `package.json`, and `docker-compose.yml`.
- **Frontend Build Optimization**:
  - Completed the build and verification of the latest frontend resources for deployment readiness.
