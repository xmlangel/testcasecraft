# Release Notes - v1.0.42

## 🚀 Key Changes

### 📝 JUnit Notes & Execution Usability

- **Notes Column Added**: Added a dedicated notes column in the JUnit result detail view for faster review.
- **Previous Notes Reuse**: Added a feature to load notes from previous test case executions and copy them into the current run.
- **Notes Summary in Results**: Added a `notesCount` field to JUnit result data and exposed it in the dashboard.
- **Detail Refresh Support**: Implemented refresh behavior for JUnit detail tabs after editing to keep data in sync.

### 🤖 RAG Feature Control & Operational Safety

- **RAG Toggle in UI**: Added dynamic UI behavior based on whether RAG is enabled or disabled.
- **Scheduler Auto-Management**: Implemented automatic management of RAG-related schedulers when RAG state changes.
- **Disabled-State Protection**: Prevented RAG schedulers from activating when RAG is disabled.
- **User Guidance Improvements**: Added clearer UI messages around RAG enable/disable states.

### 🎨 JUnit Detail UI/UX Improvements

- **Responsive Page Size**: Implemented dynamic page-size calculation based on viewport height in the JUnit detail page.
- **Long Text Readability**: Added text truncation and tooltips for long cell content in result detail tables.
- **Formatting Enhancements**: Improved `word-break` behavior and trace log message formatting for better readability.

## 🛠 Build, Test, and Developer Experience

- **Local AMD64 Build Script**: Added `build-local-amd64.sh` and related build guide updates for local Docker image builds.
- **E2E Test Infrastructure Updates**: Added an `AutomationPage` fixture and reorganized regression specs.
- **Credential Config Refactor**: Externalized admin login credentials for E2E test maintainability.
- **Skill & Guide Updates**: Added Playwright E2E skill definitions and refreshed E2E documentation.

## 📌 Additional Improvements

- **Frontend Dependency Updates**: Updated frontend dependencies.
- **i18n Key Updates**: Added and updated internationalization keys.
- **Documentation Cleanup**: Updated README branding sections and removed unused files.
