# Release Note - v1.0.56

## [1.0.56] - 2026-03-30

### Key Changes

#### 🛠️ Bug Fixes & Stability

- **Frontend ReferenceError Fix**:
  - Resolved a runtime error in `App.jsx` where the global variable `SHOW_EXPLORATORY_SESSION_TAB` was undefined.
  - Corrected the code to consistently use the `showExploratorySessionTab` state variable provided by the Runtime Configuration, improving application stability.
