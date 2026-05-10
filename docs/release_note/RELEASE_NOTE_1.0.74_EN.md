# Release Note - v1.0.74

## [1.0.74] - 2026-05-10

Hello! In this 1.0.74 update, we have significantly enhanced the **Exploratory Session** feature and introduced the **Material 3 Design System** to improve UI/UX. We have also localized the UI to Korean for user convenience.

### Key Changes

#### 🕵️‍♂️ Exploratory Session Enhancement
- **Approval & Rejection Workflow**: Added approval and rejection workflow with lead review commentary to the exploratory session debrief tab.
- **Auto-save Feature**: Implemented auto-save before submission to prevent data loss.
- **UI Convenience Improvements**: Added collapsible UI sections for session tests and bugs, and enabled attachment description updates.
- **Mandatory Fields**: Enforced mandatory test charter selection during exploratory session save to encourage structured testing.

#### 🎨 Design System & UI Improvements
- **Material 3 Introduction**: Completed documentation, component previews, and token definitions for the Material 3 design system and started application.
- **Design Unification**: Unified the exploratory session design system and removed hardcoded styles.
- **Localization**: Localized exploratory session UI labels and status mapping to Korean for better readability.

#### 🔐 System & Other Improvements
- **Login Page Accessibility**: Added public access and route redirection for the login page.
- **Code Cleanup**: Simplified date formatting logic in `dateUtils.js` and improved overall code quality.
