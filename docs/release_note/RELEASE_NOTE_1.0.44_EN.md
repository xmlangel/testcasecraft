# Release Notes - v1.0.44

## 🚀 Key Changes

### 🔗 JIRA Integration and Status Display Improvements
- **Localized JIRA Status Messages**: Improved JIRA issue status displays from English (e.g., "Unknown", "ERROR") to user-friendly Korean messages (e.g., "상태 확인 불가", "연동 오류").
- **Enhanced Issue URL Mapping**: Refined URL mapping logic to ensure accurate navigation to the corresponding JIRA issue page when clicking issue numbers.
- **Jira Smart Redirect**: Introduced a "Smart Redirect" feature that automatically identifies test executions associated with a given Jira issue key, directs the user to the result entry form, and auto-populates the issue key.

### 🧩 UX & UI Optimization
- **Restore Scroll Position**: Implemented automatic scroll position restoration when returning to the test execution list from the detailed results page for better navigation.
- **Introduction of Floating Menu**: Added a bottom floating menu in the test result and detail views to provide quick access to key actions like saving results and checking JIRA issues.
- **Responsive Layout Refactoring**: Refactored the UI layout to optimize padding and height according to screen size.

### 📊 Data Aggregation & Management Enhancements
- **Improved Test Statistics Logic**: Updated test statistics calculation to be based on the latest execution results rather than cumulative values for better accuracy.
- **Admin Mail Settings**: Added a new interface for system administrators to manage mail server (SMTP) settings directly within the application.
- **Refined Date & Time Display**: Introduced the `date-fns` library for precise date formatting and added UTC timezone display to test execution results.

### 🛠️ Other Improvements
- Fixed date utility integration errors in the frontend code.
- Enhanced overall API performance monitoring and logging.
