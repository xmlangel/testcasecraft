# Release Notes - v1.0.27

## 🚀 Key Changes

### ⚡ Performance Optimization

- **Request Deduplication**: Applied caching and deduplication to frequent API calls (Project data, JUnit stats, User info) to significantly boost dashboard loading speed.
- **RAG API Optimization**: Introduced a shared cache for RAG-related API calls to reduce redundant server load.

### 📊 Test Case & Spreadsheet UX

- **Flicker-Free Experience**: Significantly reduced screen flickering during spreadsheet updates and test case tree synchronization.
- **Optimized State Management**: Refactored to use `updateTestCaseLocal` for immediate client-side updates, reducing redundant server fetches.
- **Full Screen Mode**: Added a full-screen toggle for the spreadsheet area to enhance focus during data editing.

### 🛠 Improvements

- **[fix] Jira Status Update Fix**: Resolved an issue where Jira status information was not updated immediately during integration.
- **[feat] Internationalization (i18n)**: Expanded translations to test results and other key UI areas that were previously missing.
