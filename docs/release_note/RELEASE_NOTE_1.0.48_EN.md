# Release Note - v1.0.48

## [1.0.48] - 2026-03-24

### Major Changes

#### 🚀 Features
- **Hierarchical Folder Statistics**: Added a detailed hierarchical view for folder-based statistics on the dashboard.
- **Test Execution Count**: Introduced calculation and display of total execution counts for each test case in statistics and reports.
- **Enhanced Dashboard Dialogs**: Added new modal dialogs to view filtered lists of "Not Run", "Failed", and "Jira Linked" test cases directly from the dashboard statistics cards.
- **Report Scope Expansion**: All non-folder test case types are now correctly included in the test result reports.

#### 🛠 Improvements
- **Pagination for Filtered Lists**: Implemented pagination for loading filtered test case lists to improve performance with large datasets.
- **Dynamic Jira Issue Linking**: Jira issue links are now dynamically resolved based on the active configuration.
- **Refined Folder Path Display**: Added missing folder path information to the filtered test case dialogs for better context.
- **Optimized Tree Selection**: Refined the test case tree checkbox logic to ensure only actual test cases are selectable, excluding folders from the selection count.
