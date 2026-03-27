# Release Note - v1.0.52

## [1.0.52] - 2026-03-26

### Key Changes

#### 🚀 Features & Enhancements

- **Dashboard API Performance Optimization (ICT-130)**:

  - Replaced inefficient in-memory processing with optimized database-level aggregation using CTEs (Common Table Expressions) and Native SQL.
  - Eliminated N+1 query issues and implemented bulk aggregation in the service layer, resulting in response times **reduced from over 10 seconds to under 500ms (approx. 95% improvement)**.
  - Enhanced DTO mapping and null-safe handling ensuring robust JSON schema validation and stability.

- **Advanced JIRA Integration (ICT-JIRA)**:

  - **Multiple JIRA IDs Support**: Now users can associate and manage multiple JIRA issues with a single test result.
  - **JIRA Comment Preview**: Added a preview tab in the JIRA comment dialog to visualize Markdown rendering before submission.
  - **Automatic Issue Sync**: JIRA issue status, summary, and priority are now automatically fetched and displayed when an ID is entered.
  - **Workflow Improvements**: Streamlined UI with auto-filled fields and direct navigation to JIRA issues immediately after creation.

- **Introduction of SBTM (Session-Based Test Management) Core**:
  - Established the foundational architecture and API for session-based testing to support exploratory testing practices.
  - Implemented core lifecycle management (Start/Pause/Resume/End/Submit/Approve) and state transition logic.
  - Added session interruption tracking and approval history management to support productivity metrics.

#### 🐞 Bug Fixes

- **JIRA Integration Fixes**:
  - Resolved an issue where Markdown formatting was incorrectly rendered in created JIRA issues.
  - Fixed various UI errors, including missing icons and navigation button failures in the issue creation dialog.
- **UI/UX Stabilization**: Fixed intermittent issues where dashboard chart data was not properly cleared during project switching.
